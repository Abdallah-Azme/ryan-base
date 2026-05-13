"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

// Sound asset
const SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

class AdminChatStore {
  private totalUnread: number = 0;
  private unreadMap: Record<string, number> = {}; // conversationId -> count
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;
  
  // State for logic
  private currentOpenChatId: string | null = null;
  private isSoundEnabled: boolean = false; // Default off until loaded
  private lastSoundPlayedAt: number = 0;
  private currentAdminId: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return; // SSR check if needed
    
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentAdminId = user.uid;
          this.loadPreferences(user.uid);
          // Start the global listener for sidebar badges
          this.subscribeToUnread(); 
        } else {
          this.currentAdminId = null;
          this.cleanup();
        }
      });
    }
  }

  private async loadPreferences(uid: string) {
    if (!db) return;
    try {
      const snap = await getDoc(doc(db, 'admins', uid));
      if (snap.exists()) {
        const data = snap.data();
        this.isSoundEnabled = data.preferences?.soundEnabled ?? true; 
        this.notify();
      }
    } catch (e) {
      console.error("Failed to load admin preferences", e);
    }
  }

  private cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.totalUnread = 0;
    this.unreadMap = {};
    this.notify();
  }

  // Subscribe to ALL open conversations to count unread messages.
  // We do NOT use where('unreadForAdmin', '>', 0) to avoid composite index requirements.
  // We filter client-side instead.
  private subscribeToUnread() {
    if (!db) return;
    if (this.unsubscribe) this.unsubscribe();

    const q = query(
      collection(db, 'conversations'),
      where('status', '==', 'open')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      let newTotal = 0;
      const newMap: Record<string, number> = {};
      let shouldPlaySound = false;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const count = data.unreadForAdmin || 0;
        const lastSender = data.lastMessageSender;
        
        // Only count if > 0
        if (count > 0) {
          newMap[doc.id] = count;
          newTotal += count;

          // Sound Logic:
          // 1. Is it a customer message?
          // 2. Did the count increase for this chat?
          // 3. Is the admin NOT currently looking at this specific chat?
          const prevCount = this.unreadMap[doc.id] || 0;
          if (lastSender === 'customer' && count > prevCount && this.currentOpenChatId !== doc.id) {
            shouldPlaySound = true;
          }
        }
      });

      this.unreadMap = newMap;
      this.totalUnread = newTotal;
      
      if (shouldPlaySound) {
        this.triggerAlert();
      }

      this.notify();
    }, (err) => {
      console.error("Global unread listener error:", err);
    });
  }

  private triggerAlert() {
    const now = Date.now();
    // Debounce: 2 seconds
    if (now - this.lastSoundPlayedAt < 2000) return;

    if (this.isSoundEnabled) {
      try {
        const audio = new Audio(SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play blocked", e));
        this.lastSoundPlayedAt = now;
      } catch (e) {
        console.error("Sound error", e);
      }
    }

    if ("Notification" in window && Notification.permission === "granted") {
       try {
         new Notification("New Support Message", {
           body: "A customer has sent a new message.",
           icon: "https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png",
           silent: !this.isSoundEnabled
         });
       } catch (e) {
         // Ignore notification errors
       }
    }
  }

  // --- Public API ---

  public setCurrentChat(chatId: string | null) {
    this.currentOpenChatId = chatId;
  }

  public async toggleSound(enabled: boolean) {
    this.isSoundEnabled = enabled;
    this.notify();

    if (this.currentAdminId && db) {
      try {
        await updateDoc(doc(db, 'admins', this.currentAdminId), {
          'preferences.soundEnabled': enabled
        });
      } catch (e) {
        console.error("Failed to save preference", e);
      }
    }

    if (enabled && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }

  public getSoundStatus() {
    return this.isSoundEnabled;
  }

  public getUnreadCount() {
    return this.totalUnread;
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const adminChatStore = new AdminChatStore();

// React Hook for using the store
export const useAdminChatNotifications = () => {
  const [totalUnread, setTotalUnread] = useState(adminChatStore.getUnreadCount());
  const [isSoundEnabled, setIsSoundEnabled] = useState(adminChatStore.getSoundStatus());

  useEffect(() => {
    // Initial sync
    setTotalUnread(adminChatStore.getUnreadCount());
    setIsSoundEnabled(adminChatStore.getSoundStatus());

    // Subscribe to changes
    return adminChatStore.subscribe(() => {
      setTotalUnread(adminChatStore.getUnreadCount());
      setIsSoundEnabled(adminChatStore.getSoundStatus());
    });
  }, []);

  return { totalUnread, isSoundEnabled };
};