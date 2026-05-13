"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

interface UserMetadata {
  chatUnreadCount: number;
}

class UserMetadataStore {
  private metadata: UserMetadata = { chatUnreadCount: 0 };
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.subscribe(user.uid);
        } else {
          this.cleanup();
        }
      });
    }
  }

  private subscribe(uid: string) {
    if (this.unsubscribe) this.unsubscribe();
    if (!db) return;

    // Listen to conversations/{uid} for unreadForUser
    this.unsubscribe = onSnapshot(doc(db, 'conversations', uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.metadata = {
          chatUnreadCount: (data.unreadForUser as number) || 0
        };
      } else {
        this.metadata = { chatUnreadCount: 0 };
      }
      this.notify();
    }, (err) => {
       // It's possible the conversation doc doesn't exist yet, which is fine.
       // console.warn("User metadata/conversation subscription error", err);
    });
  }

  private cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.metadata = { chatUnreadCount: 0 };
    this.notify();
  }

  getMetadata() {
    return this.metadata;
  }

  subscribeListener(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const userMetadataStore = new UserMetadataStore();

export const useUserMetadata = () => {
  const [metadata, setMetadata] = useState(userMetadataStore.getMetadata());

  useEffect(() => {
    const unsub = userMetadataStore.subscribeListener(() => {
      setMetadata(userMetadataStore.getMetadata());
    });
    return unsub;
  }, []);

  return metadata;
};
