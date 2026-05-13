"use client";

import { APP_NAME } from './constants';

// Reusing the sound from Admin Dashboard for consistency
// Ideally this file should be downloaded to /public/sounds/notification.mp3 for offline support
const SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.warn("Notification permission request failed", e);
    }
  }
};

export const playMessageSound = () => {
  try {
    const audio = new Audio(SOUND_URL);
    audio.volume = 0.6;
    // User interaction is usually required for audio. 
    // In a chat context, the user has likely interacted with the app recently.
    audio.play().catch(e => {
      console.warn("Audio play blocked (user gesture required or background restricted)", e);
    });
  } catch (e) {
    console.error("Sound playback error", e);
  }
};

export const showMessageNotification = (senderName: string, text: string) => {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    // Truncate body if too long (max ~80 chars requested)
    const body = text.length > 80 ? text.substring(0, 80) + "..." : (text || "You have a new message");
    
    try {
      const notification = new Notification(senderName || APP_NAME, {
        body: body,
        icon: "https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png",
        tag: 'chat-message', // Prevents duplicate stacking
        // @ts-ignore
        silent: true // We play our own sound via Audio API for consistent behavior in foreground
      });
      
      // Close automatically after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigation logic could go here if using a router outside react context
        window.location.hash = '#/support';
      };
    } catch (e) {
      console.error("Notification creation error", e);
    }
  }
};
