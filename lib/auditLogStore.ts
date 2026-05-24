"use client";

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase-client';
import { sanitizeForFirestore } from './firestoreSanitize';

export type AuditEntityType =
  | 'lead'
  | 'appointment'
  | 'project'
  | 'stage'
  | 'report'
  | 'attachment'
  | 'note'
  | 'role'
  | 'user';

export interface AuditLogPayload {
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  reason?: string;
  oldValue?: unknown;
  newValue?: unknown;
  projectId?: string;
  ownerId?: string;
}

export async function createAuditLog(payload: AuditLogPayload) {
  if (!db) return;

  const user = auth.currentUser;
  const log = sanitizeForFirestore({
    ...payload,
    createdBy: user?.uid || null,
    createdByName: user?.displayName || user?.email || 'Admin',
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'audit_logs'), log);
}

export async function createAuditLogSafe(payload: AuditLogPayload) {
  try {
    await createAuditLog(payload);
  } catch (error) {
    console.warn('Audit log skipped:', error);
  }
}
