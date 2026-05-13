"use client";

import { useEffect, useState } from 'react';
import { collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, setDoc, doc, increment } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { playMessageSound, showMessageNotification } from './chatNotifications';

export interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'staff';
  createdAt: number;
  senderName?: string;
}

class ChatStore {
  private messages: Message[] = [];
  private listeners: (() => void)[] = [];
  private currentUid: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private isFirstLoad = true;

  constructor() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.subscribeToFirestore(user.uid);
        } else {
          this.messages = [];
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
    this.isFirstLoad = true; // Reset flag on new subscription
    
    if (this.unsubscribe) this.unsubscribe();
    if (!db) return;

    // Listen to subcollection: conversations/{uid}/messages
    const q = query(
      collection(db, 'conversations', uid, 'messages'),
      orderBy('createdAt', 'asc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      // Detect new messages for notification
      if (!this.isFirstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Trigger only for messages from STAFF (incoming)
            if (data.sender === 'staff') {
              playMessageSound();
              showMessageNotification(data.senderName || 'Support', data.text);
            }
          }
        });
      }

      this.messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderName: data.senderName,
          // Handle Timestamp or millis
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        } as Message;
      });
      
      this.isFirstLoad = false;
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

  getMessages() {
    return [...this.messages];
  }

  async sendMessage(text: string) {
    if (!this.currentUid || !db) return;

    const user = auth.currentUser;
    const conversationId = this.currentUid;

    try {
      const timestamp = serverTimestamp();

      // 1. Add Message to Subcollection
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text,
        sender: 'customer',
        senderName: user?.displayName || 'Customer',
        createdAt: timestamp
      });

      // 2. Update Parent Conversation Document
      // Uses atomic increment for unread count to prevent race conditions
      await setDoc(doc(db, 'conversations', conversationId), {
        customerId: conversationId,
        customerName: user?.displayName || 'Anonymous',
        status: 'open',
        lastMessageText: text,
        lastMessageAt: timestamp,
        lastMessageSender: 'customer',
        unreadForAdmin: increment(1)
      }, { merge: true });

    } catch (e) {
      console.error("Error sending message", e);
    }
  }
}

export const chatStore = new ChatStore();

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>(chatStore.getMessages());

  useEffect(() => {
    const update = () => {
      setMessages(chatStore.getMessages());
    };
    
    update();
    return chatStore.subscribe(update);
  }, []);

  return { messages };
};
