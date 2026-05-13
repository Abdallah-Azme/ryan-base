"use client";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase-client';

export interface AdminUser {
  id: string; // matches uid
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | string; // Role slug or ID
  permissions: Record<string, boolean>; // Map of permissions e.g. { employees: true }
  status: 'Active' | 'Disabled';
  phone?: string;
  createdAt: number;
  lastLoginAt?: number;
}

class AdminStore {
  private admins: AdminUser[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.subscribeToFirestore();
  }

  private subscribeToFirestore() {
    if (!db) return;

    // Root 'admins' collection
    const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.admins = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          lastLoginAt: data.lastLoginAt?.toMillis?.() || 0
        } as AdminUser;
      });
      this.notify();
    }, (error) => {
      console.error("Admin fetch error:", error);
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

  getAdmins() {
    return [...this.admins];
  }

  // Check if a UID exists in the admins collection
  async checkIsAdmin(uid: string): Promise<boolean> {
    if (!db) return false;
    try {
      const docRef = doc(db, 'admins', uid);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().status === 'Active') {
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error checking admin status", e);
      return false;
    }
  }

  async addAdmin(adminData: Omit<AdminUser, 'createdAt' | 'lastLoginAt'>) {
    if (!db) return;
    // We use setDoc with the auth UID usually, but for the store helper we might be creating
    // the Firestore record after Auth creation. 
    // Here we assume ID is passed or we let firestore generate (if not strictly tied to Auth UID yet, though it should be).
    // In AdminEmployees, we handle the Auth creation then setDoc. 
    // This method is a fallback helper.
    
    if (adminData.id) {
        await this.updateAdmin(adminData.id, adminData);
    } else {
       // Should rarely happen if we follow Auth-first creation
       await addDoc(collection(db, 'admins'), {
        ...adminData,
        createdAt: serverTimestamp(),
        lastLoginAt: null
      });
    }
  }

  async updateAdmin(id: string, updates: Partial<Omit<AdminUser, 'createdAt'>>) {
    if (!db) return;
    await updateDoc(doc(db, 'admins', id), updates);
  }

  async toggleStatus(id: string) {
    if (!db) return;
    const admin = this.admins.find(a => a.id === id);
    if (admin) {
      const newStatus = admin.status === 'Active' ? 'Disabled' : 'Active';
      await updateDoc(doc(db, 'admins', id), { status: newStatus });
    }
  }

  async deleteAdmin(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'admins', id));
  }
}

export const adminStore = new AdminStore();

export const useAdmins = () => {
  const [admins, setAdmins] = useState<AdminUser[]>(adminStore.getAdmins());

  useEffect(() => {
    const update = () => setAdmins(adminStore.getAdmins());
    update();
    return adminStore.subscribe(update);
  }, []);

  return { admins };
};
