import { useState, useEffect } from 'react';
import { collectionGroup, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { UserProject, ProjectStatus } from '@/lib/userProjectsStore';
import { app, db } from '@/lib/firebase-client';
import { UserProjectEditValues } from '../schemas/user-project-edit.schema';

export const statusOptions: ProjectStatus[] = [
  'pricing',
  'design',
  'development',
  'publishing',
  'support',
  'completed',
  'cancelled',
];

export const INDUSTRIES = [
  'Food & Delivery',
  'Fashion & Clothing',
  'Pharmacy & Healthcare',
  'Pets & Animals',
  'Services',
  'Education',
  'Real Estate',
  'Travel & Tourism',
  'Finance',
  'Logistics & Shipping',
  'Other',
];

export function useAdminUserProjects() {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  const [formData, setFormData] = useState<UserProjectEditValues>({
    name: '',
    description: '',
    estimatedPrice: '',
    estimatedDuration: '',
    status: 'pricing',
    projectUrl: '',
    industry: '',
    industryOther: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (app && app.options) {
      console.log('Admin User Projects Page Loaded. Firebase Project ID:', app.options.projectId);
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const q = query(collectionGroup(db, 'projects'));

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
        updatedAt: d.data().updatedAt?.toMillis?.() || Date.now(),
      })) as UserProject[];

      results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setProjects(results);
    } catch (err: any) {
      console.error('Failed to load projects:', err.code, err.message, err);
      if (err.code === 'permission-denied') {
        setError(
          'Firestore permission denied. Admin panel must use server-side Admin SDK or rules must allow admin read.'
        );
      } else {
        setError(`Error loading projects: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name || '',
        description: editingProject.description || '',
        estimatedPrice: editingProject.estimatedPrice ?? '',
        estimatedDuration: editingProject.estimatedDuration ?? '',
        status: editingProject.status || 'pricing',
        projectUrl: editingProject.projectUrl || '',
        industry: editingProject.industry || '',
        industryOther: editingProject.industryOther || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        estimatedPrice: '',
        estimatedDuration: '',
        status: 'pricing',
        projectUrl: '',
        industry: '',
        industryOther: '',
      });
    }
  }, [editingProject]);

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
      (p.ownerEmail && p.ownerEmail.toLowerCase().includes(term))
    );
  });

  const handleEdit = (project: UserProject) => {
    setEditingProject(project);
  };

  const handleSave = async (data: UserProjectEditValues) => {
    if (!editingProject || !db) return;

    setIsSaving(true);
    try {
      if (!editingProject.ownerId) {
        throw new Error('Cannot update project: Missing Owner ID');
      }

      const docRef = doc(db, 'users', editingProject.ownerId, 'projects', editingProject.id);

      const updates = {
        name: data.name,
        description: data.description || '',
        estimatedPrice: data.estimatedPrice !== '' ? Number(data.estimatedPrice) : null,
        estimatedDuration: data.estimatedDuration !== '' ? Number(data.estimatedDuration) : null,
        status: data.status,
        projectUrl: data.projectUrl || null,
        industry: data.industry,
        industryOther: data.industryOther || null,
      };

      await updateDoc(docRef, updates);

      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...updates } : p))
      );

      setEditingProject(null);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Failed to update project. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return {
    projects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    editingProject,
    setEditingProject,
    formData,
    setFormData,
    isSaving,
    filteredProjects,
    handleEdit,
    handleSave,
    formatDate,
  };
}
