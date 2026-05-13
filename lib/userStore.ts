"use client";
// @ts-nocheck
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase-client';

export type UserRole = 'Customer' | 'Admin';
export type UserStatus = 'Active' | 'Disabled';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: number;
  lastLoginAt: number;
  projectsCount: number;
}

class UserStore {
  private users: User[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;
  private error: string | null = null;

  constructor() {
    this.subscribeToFirestore();
  }

  private subscribeToFirestore() {
    if (!db) return;

    // Use root 'users' collection as requested.
    // Starting with NO filters to ensure data loads (filters often require indices).
    const usersCollection = collection(db, 'users');
    
    // We can sort client-side if needed, or re-introduce orderBy if composite index exists.
    // For now, let's try a simple query.
    
    this.unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      this.error = null; // Clear previous errors
      this.users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Handle potential missing fields gracefully
          firstName: data.firstName || 'Unknown',
          lastName: data.lastName || '',
          email: data.email || 'No Email',
          phone: data.phone || '',
          registeredAt: data.createdAt?.toMillis?.() || data.registeredAt || Date.now(),
          lastLoginAt: data.lastLoginAt?.toMillis?.() || Date.now(),
          role: data.role || 'Customer',
          status: data.status || 'Active',
          projectsCount: data.projectsCount || 0
        } as User;
      })
      // Client-side sort by registeredAt desc since we removed orderBy from query
      .sort((a, b) => b.registeredAt - a.registeredAt);

      this.notify();
    }, (err) => {
      console.error("Failed to load users:", err.code, err.message, err);
      
      if (err.code === 'permission-denied') {
        this.error = "Firestore permission denied. Dashboard needs Admin access (Admin SDK or rules).";
      } else {
        this.error = `Error loading users: ${err.message}`;
      }
      this.notify();
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

  getUsers() {
    return [...this.users];
  }

  getError() {
    return this.error;
  }

  async toggleStatus(id: string) {
    if (!db) return;
    const user = this.users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
      try {
        await updateDoc(doc(db, 'users', id), { status: newStatus });
      } catch (e) {
        console.error("Error toggling status:", e);
      }
    }
  }

  async deleteUser(id: string) {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  }
}

export const userStore = new UserStore();

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(userStore.getUsers());
  const [error, setError] = useState<string | null>(userStore.getError());

  useEffect(() => {
    const update = () => {
      setUsers(userStore.getUsers());
      setError(userStore.getError());
    };
    update();
    return userStore.subscribe(update);
  }, []);

  return { users, error };
};