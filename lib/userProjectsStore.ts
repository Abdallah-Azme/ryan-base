"use client";
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { sanitizeForFirestore } from './firestoreSanitize';

export type ProjectStatus = "pricing" | "design" | "development" | "publishing" | "support" | "cancelled";

export interface UserProject {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  description: string;
  estimatedPrice: number | null;
  estimatedDuration: number | null; // in days
  status: ProjectStatus;
  projectUrl?: string | null;
  createdAt: number;
  updatedAt: number;
  version?: string; 
  iconBg?: string; 
  brandColor?: string;
  
  // Wizard Fields
  platforms?: string[];
  languages?: string[];
  markets?: string[];
  industry?: string;
  industryOther?: string | null;
  hasPayments?: boolean;
  hasExistingBusiness?: boolean;
  serviceModel?: string;
  closestApp?: string;
}

class UserProjectsStore {
  private projects: UserProject[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;
  private currentUid: string | null = null;

  constructor() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.subscribeToFirestore(user.uid);
        } else {
          this.projects = [];
          this.currentUid = null;
          if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
          }
          this.notify();
        }
      });
    }
  }

  private subscribeToFirestore(uid: string) {
    if (this.currentUid === uid) return;
    this.currentUid = uid;
    
    if (this.unsubscribe) this.unsubscribe();
    if (!db) return;

    // Path: users/{uid}/projects
    const q = query(
      collection(db, 'users', uid, 'projects'), 
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.projects = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
          status: data.status || 'pricing'
        } as UserProject;
      });
      this.notify();
    }, (error) => {
      console.error("Firestore userProjects error:", error);
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

  getAllProjects() {
    return [...this.projects];
  }

  async addProject(project: Omit<UserProject, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = auth.currentUser;
    if (!db || !user) throw new Error("You must be signed in to create a project.");
    
    try {
      // Prepare raw data
      const projectData = {
        ...project,
        ownerId: user.uid,
        ownerName: user.displayName || 'User',
        ownerEmail: user.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: 'v1.0.0',
        // Fallback for iconBg if missing, though sanitization handles undefined removal
        iconBg: project.iconBg || project.brandColor || '#1DB7F0',
        brandColor: project.brandColor || '#1DB7F0'
      };

      // Sanitize to remove any undefined fields before Firestore write
      const cleanData = sanitizeForFirestore(projectData);

      // Path: users/{uid}/projects
      await addDoc(collection(db, 'users', user.uid, 'projects'), cleanData);
    } catch (e) {
      console.error("Error adding project:", e);
      throw e;
    }
  }

  async updateProject(projectId: string, updates: Partial<Omit<UserProject, 'id' | 'createdAt'>>) {
    const user = auth.currentUser;
    if (!db || !user) return;
    
    try {
      const docRef = doc(db, 'users', user.uid, 'projects', projectId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      const cleanUpdates = sanitizeForFirestore(updateData);

      await updateDoc(docRef, cleanUpdates);
    } catch (e) {
      console.error("Error updating project:", e);
      throw e;
    }
  }

  async deleteProject(projectId: string) {
    const user = auth.currentUser;
    if (!db || !user) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'projects', projectId));
    } catch (e) {
      console.error("Error deleting project:", e);
      throw e;
    }
  }
}

export const userProjectsStore = new UserProjectsStore();

export const useUserProjects = () => {
  const [projects, setProjects] = useState<UserProject[]>(userProjectsStore.getAllProjects());

  useEffect(() => {
    const update = () => setProjects(userProjectsStore.getAllProjects());
    update();
    return userProjectsStore.subscribe(update);
  }, []);

  return { projects, store: userProjectsStore };
};