"use client";

import { useEffect, useMemo, useState } from 'react';
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
import { sanitizeForFirestore } from '@/lib/firestoreSanitize';
import { createAuditLogSafe } from '@/lib/auditLogStore';

export type ProjectQuestionType =
  | 'text'
  | 'textarea'
  | 'single_select'
  | 'multi_select'
  | 'yes_no'
  | 'color'
  | 'reference_app';

export interface ProjectQuestionOption {
  id: string;
  label: string;
  labelAr?: string;
}

export interface ProjectQuestion {
  id: string;
  label: string;
  labelAr?: string;
  type: ProjectQuestionType;
  options: ProjectQuestionOption[];
  order: number;
  required: boolean;
  active: boolean;
  locked: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectQuestionFormState {
  label: string;
  labelAr: string;
  type: ProjectQuestionType;
  optionsText: string;
  required: boolean;
  active: boolean;
  locked: boolean;
}

const emptyForm: ProjectQuestionFormState = {
  label: '',
  labelAr: '',
  type: 'single_select',
  optionsText: '',
  required: true,
  active: true,
  locked: false,
};

const normalizeTimestamp = (value: any) => value?.toMillis?.() || value || Date.now();

const normalizeQuestion = (docId: string, data: any, index: number): ProjectQuestion => ({
  id: docId,
  label: data.label || 'Untitled question',
  labelAr: data.labelAr || '',
  type: data.type || 'text',
  options: data.options || [],
  order: typeof data.order === 'number' ? data.order : index,
  required: Boolean(data.required),
  active: data.active !== false,
  locked: Boolean(data.locked),
  createdAt: normalizeTimestamp(data.createdAt),
  updatedAt: normalizeTimestamp(data.updatedAt),
});

const optionsToText = (options: ProjectQuestionOption[]) =>
  options.map((option) => (option.labelAr ? `${option.label} | ${option.labelAr}` : option.label)).join('\n');

const textToOptions = (value: string): ProjectQuestionOption[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, labelAr] = line.split('|').map((part) => part.trim());
      return {
        id: `option_${index + 1}`,
        label,
        labelAr: labelAr || '',
      };
    });

export function useAdminProjectQuestions() {
  const [questions, setQuestions] = useState<ProjectQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectQuestionFormState>(emptyForm);
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

    const q = query(collection(db, 'project_questions'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextQuestions = snapshot.docs
          .map((snap, index) => normalizeQuestion(snap.id, snap.data(), index))
          .sort((a, b) => a.order - b.order);
        setQuestions(nextQuestions);
        setLoading(false);
      },
      (err) => {
        console.error('Project questions subscription error:', err);
        setError(err.message || 'Failed to load project questions.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedId) || null,
    [questions, selectedId]
  );

  const startCreate = () => {
    setSelectedId(null);
    setForm(emptyForm);
  };

  const startEdit = (question: ProjectQuestion) => {
    setSelectedId(question.id);
    setForm({
      label: question.label,
      labelAr: question.labelAr || '',
      type: question.type,
      optionsText: optionsToText(question.options),
      required: question.required,
      active: question.active,
      locked: question.locked,
    });
  };

  const saveQuestion = async () => {
    if (!db || !form.label.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = sanitizeForFirestore({
        label: form.label.trim(),
        labelAr: form.labelAr.trim(),
        type: form.type,
        options: ['single_select', 'multi_select'].includes(form.type) ? textToOptions(form.optionsText) : [],
        required: form.required,
        active: form.active,
        locked: form.locked,
        updatedAt: serverTimestamp(),
      });

      if (selectedId) {
        await updateDoc(doc(db, 'project_questions', selectedId), payload);
        await createAuditLogSafe({
          entityType: 'project',
          entityId: selectedId,
          action: 'project_question.updated',
          newValue: payload,
        });
      } else {
        const created = await addDoc(
          collection(db, 'project_questions'),
          sanitizeForFirestore({
            ...payload,
            order: questions.length,
            createdAt: serverTimestamp(),
          })
        );
        setSelectedId(created.id);
        await createAuditLogSafe({
          entityType: 'project',
          entityId: created.id,
          action: 'project_question.created',
          newValue: payload,
        });
      }
    } catch (err: any) {
      console.error('Failed to save project question:', err);
      setError(err.message || 'Failed to save project question.');
    } finally {
      setSaving(false);
    }
  };

  const moveQuestion = async (questionId: string, direction: -1 | 1) => {
    if (!db) return;
    const index = questions.findIndex((question) => question.id === questionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= questions.length) return;

    const nextQuestions = [...questions];
    [nextQuestions[index], nextQuestions[targetIndex]] = [nextQuestions[targetIndex], nextQuestions[index]];

    setSaving(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      nextQuestions.forEach((question, order) => {
        batch.update(doc(db, 'project_questions', question.id), {
          order,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      await createAuditLogSafe({
        entityType: 'project',
        entityId: questionId,
        action: 'project_question.reordered',
        newValue: nextQuestions.map((question, order) => ({ id: question.id, order })),
      });
    } catch (err: any) {
      console.error('Failed to reorder project questions:', err);
      setError(err.message || 'Failed to reorder project questions.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async () => {
    if (!db || !deleteId) return;
    const question = questions.find((item) => item.id === deleteId);
    if (question?.locked) {
      setError('Locked questions cannot be deleted.');
      setDeleteId(null);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'project_questions', deleteId));
      await createAuditLogSafe({
        entityType: 'project',
        entityId: deleteId,
        action: 'project_question.deleted',
        oldValue: question,
      });
      if (selectedId === deleteId) startCreate();
      setDeleteId(null);
    } catch (err: any) {
      console.error('Failed to delete project question:', err);
      setError(err.message || 'Failed to delete project question.');
    } finally {
      setSaving(false);
    }
  };

  return {
    questions,
    selectedQuestion,
    form,
    setForm,
    loading,
    saving,
    error,
    setError,
    deleteId,
    setDeleteId,
    startCreate,
    startEdit,
    saveQuestion,
    moveQuestion,
    deleteQuestion,
  };
}
