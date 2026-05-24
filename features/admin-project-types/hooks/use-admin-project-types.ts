"use client";

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { createAuditLogSafe } from '@/lib/auditLogStore';
import { sanitizeForFirestore } from '@/lib/firestoreSanitize';

export interface ProjectType {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  active: boolean;
  order: number;
  color?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  durationMin?: number | null;
  durationMax?: number | null;
}

export interface ProjectTypeForm {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  active: boolean;
  color: string;
  priceMin: string;
  priceMax: string;
  durationMin: string;
  durationMax: string;
}

const emptyForm: ProjectTypeForm = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  active: true,
  color: '#1DB7F0',
  priceMin: '',
  priceMax: '',
  durationMin: '',
  durationMax: '',
};

const toNumberOrNull = (value: string) => (value.trim() ? Number(value) : null);

export function useAdminProjectTypes() {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectTypeForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setError('Firestore is not configured.');
      return;
    }

    const q = query(collection(db, 'project_types'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTypes(
          snapshot.docs.map((snap, index) => {
            const data = snap.data();
            return {
              id: snap.id,
              name: data.name || 'Untitled type',
              nameAr: data.nameAr || '',
              description: data.description || '',
              descriptionAr: data.descriptionAr || '',
              active: data.active !== false,
              order: typeof data.order === 'number' ? data.order : index,
              color: data.color || '#1DB7F0',
              priceMin: data.priceMin ?? null,
              priceMax: data.priceMax ?? null,
              durationMin: data.durationMin ?? null,
              durationMax: data.durationMax ?? null,
            };
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error('Project types subscription error:', err);
        setError(err.message || 'Failed to load project types.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (type: ProjectType) => {
    setEditingId(type.id);
    setForm({
      name: type.name,
      nameAr: type.nameAr || '',
      description: type.description || '',
      descriptionAr: type.descriptionAr || '',
      active: type.active,
      color: type.color || '#1DB7F0',
      priceMin: type.priceMin ? String(type.priceMin) : '',
      priceMax: type.priceMax ? String(type.priceMax) : '',
      durationMin: type.durationMin ? String(type.durationMin) : '',
      durationMax: type.durationMax ? String(type.durationMax) : '',
    });
  };

  const saveType = async () => {
    if (!db || !form.name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = sanitizeForFirestore({
        name: form.name.trim(),
        nameAr: form.nameAr.trim(),
        description: form.description.trim(),
        descriptionAr: form.descriptionAr.trim(),
        active: form.active,
        color: form.color,
        priceMin: toNumberOrNull(form.priceMin),
        priceMax: toNumberOrNull(form.priceMax),
        durationMin: toNumberOrNull(form.durationMin),
        durationMax: toNumberOrNull(form.durationMax),
        updatedAt: serverTimestamp(),
      });

      if (editingId) {
        await updateDoc(doc(db, 'project_types', editingId), payload);
        await createAuditLogSafe({
          entityType: 'project',
          entityId: editingId,
          action: 'project_type.updated',
          newValue: payload,
        });
      } else {
        const created = await addDoc(
          collection(db, 'project_types'),
          sanitizeForFirestore({
            ...payload,
            order: types.length,
            createdAt: serverTimestamp(),
          })
        );
        setEditingId(created.id);
        await createAuditLogSafe({
          entityType: 'project',
          entityId: created.id,
          action: 'project_type.created',
          newValue: payload,
        });
      }
    } catch (err: any) {
      console.error('Failed to save project type:', err);
      setError(err.message || 'Failed to save project type.');
    } finally {
      setSaving(false);
    }
  };

  const moveType = async (typeId: string, direction: -1 | 1) => {
    if (!db) return;
    const index = types.findIndex((type) => type.id === typeId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= types.length) return;

    const ordered = [...types];
    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];

    setSaving(true);
    try {
      const batch = writeBatch(db);
      ordered.forEach((type, order) => {
        batch.update(doc(db, 'project_types', type.id), {
          order,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      await createAuditLogSafe({
        entityType: 'project',
        entityId: typeId,
        action: 'project_type.reordered',
        newValue: ordered.map((type, order) => ({ id: type.id, order })),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reorder project types.');
    } finally {
      setSaving(false);
    }
  };

  const deleteType = async () => {
    if (!db || !deleteId) return;
    const type = types.find((item) => item.id === deleteId);
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'project_types', deleteId));
      await createAuditLogSafe({
        entityType: 'project',
        entityId: deleteId,
        action: 'project_type.deleted',
        oldValue: type,
      });
      if (editingId === deleteId) startCreate();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete project type.');
    } finally {
      setSaving(false);
    }
  };

  return {
    types,
    form,
    setForm,
    editingId,
    loading,
    saving,
    error,
    setError,
    deleteId,
    setDeleteId,
    startCreate,
    startEdit,
    saveType,
    moveType,
    deleteType,
  };
}
