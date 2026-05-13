"use client";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, where, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

export type NotificationType = 'system' | 'success' | 'warning' | 'message' | 'payment';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  userId?: string; // Optional: if null, it's a broadcast
}

class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;
  private currentUid: string | null = null;

  constructor() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.subscribeToFirestore(user.uid);
        } else {
          this.notifications = [];
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

    // Root 'notifications' collection
    // Removed orderBy('timestamp') to avoid index requirements. Sorting done client-side.
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', uid)
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.notifications = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           ...data,
           id: doc.id,
           timestamp: data.timestamp || Date.now()
         } as Notification;
      })
      .filter(n => !n.dismissed)
      .sort((a, b) => b.timestamp - a.timestamp); // Client-side sort descending
      
      this.notify();
    }, (err) => {
       console.error("Notif subscription error", err);
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

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  async markAsRead(id: string) {
    if (!this.currentUid || !db) return;
    const notifRef = doc(db, 'notifications', id);
    try {
      await updateDoc(notifRef, { read: true });
    } catch (e) {
      console.error("Error marking read", e);
    }
  }

  async markAllAsRead() {
    if (!this.currentUid || !db) return;
    const batch = writeBatch(db);
    const unread = this.notifications.filter(n => !n.read);
    
    unread.forEach(n => {
       const ref = doc(db, 'notifications', n.id);
       batch.update(ref, { read: true });
    });
    
    if (unread.length > 0) {
      await batch.commit();
    }
  }

  async dismiss(id: string) {
    if (!this.currentUid || !db) return;
    const notifRef = doc(db, 'notifications', id);
    try {
      await updateDoc(notifRef, { dismissed: true });
    } catch (e) {
      console.error("Error dismissing", e);
    }
  }
}

export const notificationStore = new NotificationStore();

export const useNotifications = () => {
  const [data, setData] = useState({
    notifications: notificationStore.getNotifications(),
    unreadCount: notificationStore.getUnreadCount()
  });

  useEffect(() => {
    const update = () => {
      setData({
        notifications: notificationStore.getNotifications(),
        unreadCount: notificationStore.getUnreadCount()
      });
    };
    
    update();
    return notificationStore.subscribe(update);
  }, []);

  return data;
};