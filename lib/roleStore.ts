"use client";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-client';
import { PERMISSIONS_LIST } from './permissions';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Kept as array for UI convenience, mapped to object for AdminUser
  createdAt: number;
}

export { PERMISSIONS_LIST };

class RoleStore {
  private roles: Role[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.subscribeToFirestore();
  }

  private subscribeToFirestore() {
    if (!db) return;

    // Root 'roles' collection
    const q = query(collection(db, 'roles'), orderBy('createdAt', 'desc'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.roles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() || Date.now()
        } as Role;
      });
      this.notify();
    }, (error) => {
      console.error("Role fetch error:", error);
    });
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getRoles() {
    return [...this.roles];
  }

  getRole(id: string) {
    return this.roles.find(r => r.id === id);
  }

  async addRole(role: Omit<Role, 'id' | 'createdAt'>) {
    if (!db) return;
    await addDoc(collection(db, 'roles'), {
      ...role,
      createdAt: serverTimestamp()
    });
  }

  async updateRole(id: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>) {
    if (!db) return;
    await updateDoc(doc(db, 'roles', id), updates);
  }

  async deleteRole(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'roles', id));
  }
}

export const roleStore = new RoleStore();

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>(roleStore.getRoles());

  useEffect(() => {
    const update = () => setRoles(roleStore.getRoles());
    update();
    return roleStore.subscribe(update);
  }, []);

  return { roles };
};
