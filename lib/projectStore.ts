"use client";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-client';

export interface Project {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  link: string;
  createdAt: number;
}

class ProjectStore {
  private projects: Project[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.subscribeToFirestore();
  }

  private subscribeToFirestore() {
    if (!db) return;

    // Root 'projects' collection
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.projects = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
        } as Project;
      });
      this.notify();
    }, (error) => {
      console.error("Portfolio projects error:", error);
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

  getProjects() {
    return [...this.projects];
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt'>) {
    if (!db) return;
    await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: serverTimestamp()
    });
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) {
    if (!db) return;
    await updateDoc(doc(db, 'projects', id), updates);
  }

  async deleteProject(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'projects', id));
  }
}

export const projectStore = new ProjectStore();

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(projectStore.getProjects());

  useEffect(() => {
    const update = () => setProjects(projectStore.getProjects());
    update();
    return projectStore.subscribe(update);
  }, []);

  return { projects };
};
