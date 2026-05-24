"use client";

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-client';
import { NotificationType } from './notificationStore';
import { sanitizeForFirestore } from './firestoreSanitize';

export interface ServiceNotificationPayload {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  deepLink?: string;
}

export async function createServiceNotification(payload: ServiceNotificationPayload) {
  if (!db || !payload.userId) return;

  const notification = sanitizeForFirestore({
    type: payload.type || 'system',
    title: payload.title,
    message: payload.message,
    userId: payload.userId,
    projectId: payload.projectId || null,
    deepLink: payload.deepLink || null,
    read: false,
    dismissed: false,
    timestamp: Date.now(),
    createdAt: serverTimestamp(),
    source: 'service',
  });

  await addDoc(collection(db, 'notifications'), notification);
}

export async function createServiceNotificationSafe(payload: ServiceNotificationPayload) {
  try {
    await createServiceNotification(payload);
  } catch (error) {
    console.warn('Service notification skipped:', error);
  }
}
