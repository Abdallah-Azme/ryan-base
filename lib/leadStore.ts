"use client";

import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { sanitizeForFirestore } from './firestoreSanitize';
import { userProjectsStore } from './userProjectsStore';
import { createAuditLogSafe } from './auditLogStore';

export interface Lead {
  id: string;
  name: string;
  phone: string; // E.164
  email?: string;
  source?: string;
  projectPayload: any;
  status: 'new' | 'reviewing' | 'approved' | 'rejected' | 'claimed' | 'deleted';
  createdAt: number;
  rejectReason?: string;
  assignedTo?: string;
  reviewNotes?: string;
  approvedAt?: number;
  approvedBy?: string;
  rejectedAt?: number;
  rejectedBy?: string;
  claimTokenExpiresAt?: number;
  timeline?: {
    action: string;
    reason?: string;
    createdAt: number;
    createdByName?: string;
  }[];
  deletedAt?: number;
  deletedBy?: string;
  deleteReason?: string;
}

export interface ClaimToken {
  id: string;
  token: string;
  leadId: string;
  expiresAt: number;
  used: boolean;
}

class LeadStore {
  private leads: Lead[] = [];
  private listeners: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  // --- ADMIN ACTIONS ---

  subscribeToLeads(listener: () => void) {
    if (!db) return () => {};
    // Ensure only admins call this (usually handled by UI guard, but firestore rules enforce data)
    
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    
    this.unsubscribe = onSnapshot(q, (snap) => {
      this.leads = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now()
      })) as Lead[];
      listener();
    }, (err) => {
      console.error("Leads subscription error:", err);
    });

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  getLeads() {
    return [...this.leads];
  }

  async updateLeadStatus(id: string, status: Lead['status'], reason?: string) {
    if (!db) return;
    const user = auth.currentUser;
    const now = Date.now();
    const currentLead = this.leads.find((lead) => lead.id === id);
    const timeline = [
      ...(currentLead?.timeline || []),
      {
        action: `status.${status}`,
        reason: reason || '',
        createdAt: now,
        createdByName: user?.displayName || user?.email || 'Admin',
      },
    ];

    const update: any = { status, timeline, updatedAt: serverTimestamp() };
    if (reason) update.rejectReason = reason;
    if (status === 'approved') {
      update.approvedAt = now;
      update.approvedBy = user?.uid || 'admin_unknown';
    }
    if (status === 'rejected') {
      update.rejectedAt = now;
      update.rejectedBy = user?.uid || 'admin_unknown';
    }
    await updateDoc(doc(db, 'leads', id), update);
    await createAuditLogSafe({
      entityType: 'lead',
      entityId: id,
      action: `lead.${status}`,
      reason,
      oldValue: { status: currentLead?.status },
      newValue: update,
    });
  }

  async updateLeadReview(id: string, updates: Pick<Lead, 'assignedTo' | 'reviewNotes'>) {
    if (!db) return;
    await updateDoc(doc(db, 'leads', id), {
      ...sanitizeForFirestore(updates),
      updatedAt: serverTimestamp(),
    });
    await createAuditLogSafe({
      entityType: 'lead',
      entityId: id,
      action: 'lead.review_updated',
      newValue: updates,
    });
  }

  async generateClaimToken(leadId: string): Promise<string> {
    if (!db) throw new Error("DB not connected");
    
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    await addDoc(collection(db, 'lead_claim_tokens'), {
      token,
      leadId,
      expiresAt,
      used: false,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'leads', leadId), {
      claimTokenExpiresAt: expiresAt,
      updatedAt: serverTimestamp(),
    });
    await createAuditLogSafe({
      entityType: 'lead',
      entityId: leadId,
      action: 'lead.claim_link_generated',
      newValue: { expiresAt },
    });

    return token;
  }

  // --- PUBLIC ACTIONS ---

  async submitLead(data: { name: string; phone: string; email?: string; projectPayload: any; source?: string }): Promise<string> {
    if (!db) throw new Error("DB not connected");
    
    const docRef = await addDoc(collection(db, 'leads'), {
      ...sanitizeForFirestore(data),
      status: 'new',
      createdAt: serverTimestamp()
    });

    return docRef.id;
  }

  async validateToken(token: string): Promise<{ valid: boolean; leadId?: string; error?: string }> {
    if (!db) return { valid: false, error: "System error" };

    const q = query(collection(db, 'lead_claim_tokens'), where('token', '==', token), where('used', '==', false));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { valid: false, error: "Invalid or used token." };
    }

    const data = snap.docs[0].data();
    if (Date.now() > data.expiresAt) {
      return { valid: false, error: "Token expired." };
    }

    return { valid: true, leadId: data.leadId };
  }

  async claimProject(token: string, leadId: string) {
    // Should be called AFTER user is authenticated
    const user = auth.currentUser;
    if (!db || !user) throw new Error("Must be logged in to claim");

    // 1. Get Lead Data
    const leadDoc = await getDocs(query(collection(db, 'leads'), where('__name__', '==', leadId)));
    if (leadDoc.empty) throw new Error("Lead not found");
    const leadData = leadDoc.docs[0].data() as Lead;

    if (leadData.status === 'claimed') throw new Error("Project already claimed");

    // 2. Create Real Project
    await userProjectsStore.addProject({
      ...leadData.projectPayload,
      name: leadData.projectPayload.name || 'My New Project', // Ensure name exists
      ownerId: user.uid,
      ownerName: user.displayName || 'User',
      ownerEmail: user.email || '',
      status: 'pricing' // Default status
    });

    // 3. Mark Token Used
    const tokenQ = query(collection(db, 'lead_claim_tokens'), where('token', '==', token));
    const tokenSnap = await getDocs(tokenQ);
    if (!tokenSnap.empty) {
      await updateDoc(tokenSnap.docs[0].ref, { used: true, claimedBy: user.uid, claimedAt: serverTimestamp() });
    }

    // 4. Update Lead Status
    await updateDoc(doc(db, 'leads', leadId), { status: 'claimed', claimedBy: user.uid });
  }
  async deleteLead(leadId: string): Promise<void> {
    if (!db) throw new Error("DB not connected");
    const user = auth.currentUser;
    await updateDoc(doc(db, 'leads', leadId), { 
      status: 'deleted',
      deletedAt: serverTimestamp(),
      deletedBy: user ? user.uid : 'admin_unknown',
      deleteReason: ''
    });
    await createAuditLogSafe({
      entityType: 'lead',
      entityId: leadId,
      action: 'lead.deleted',
    });
  }
}

export const leadStore = new LeadStore();
