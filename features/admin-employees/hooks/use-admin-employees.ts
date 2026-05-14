import React, { useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAdmins, adminStore, AdminUser } from '@/lib/adminStore';
import { useRoles } from '@/lib/roleStore';
import { firebaseConfig, db } from '@/lib/firebase-client';

export function useAdminEmployees() {
  const { admins } = useAdmins();
  const { roles } = useRoles();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'Active' as 'Active' | 'Disabled',
    password: '',
  });

  const getRoleName = (id: string) => roles.find((r) => r.id === id)?.name || id;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (admin?: AdminUser) => {
    setCreatedPassword(null);
    if (admin) {
      const nameParts = admin.name.split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      setEditingAdmin(admin);
      setFormData({
        firstName: fName,
        lastName: lName,
        email: admin.email,
        phone: admin.phone || '',
        roleId: admin.role,
        status: admin.status,
        password: '',
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roleId: roles[0]?.id || 'admin',
        status: 'Active',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedRole = roles.find((r) => r.id === formData.roleId);
      const permissionsMap: Record<string, boolean> = {};
      if (selectedRole) {
        selectedRole.permissions.forEach((p) => {
          const key = p.toLowerCase().replace('manage ', '').replace('view ', '').replace(' ', '_');
          permissionsMap[key] = true;
        });
      }

      if (editingAdmin) {
        await adminStore.updateAdmin(editingAdmin.id, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          role: formData.roleId,
          status: formData.status,
          permissions: permissionsMap,
        });
        setIsModalOpen(false);
      } else {
        if (formData.password.length < 8) {
          alert('Password must be at least 8 characters');
          setIsSubmitting(false);
          return;
        }

        const secondaryAppName = `secondaryApp-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const authEmail = `admin_${formData.email}`;

          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, authEmail, formData.password);
          const newUser = userCredential.user;

          await updateProfile(newUser, {
            displayName: `${formData.firstName} ${formData.lastName}`,
          });

          const adminRef = doc(db, 'admins', newUser.uid);

          await setDoc(adminRef, {
            id: newUser.uid,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone || '',
            role: formData.roleId,
            status: formData.status,
            permissions: permissionsMap,
            createdAt: serverTimestamp(),
            lastLoginAt: null,
          });

          await signOut(secondaryAuth);
          await deleteApp(secondaryApp);

          setCreatedPassword(formData.password);
        } catch (innerError: any) {
          await deleteApp(secondaryApp);
          throw innerError;
        }
      }
    } catch (error: any) {
      console.error('Operation failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (admin: AdminUser) => {
    adminStore.toggleStatus(admin.id);
    if (selectedAdmin?.id === admin.id) {
      setSelectedAdmin((prev) =>
        prev ? { ...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active' } : null
      );
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      adminStore.deleteAdmin(deleteId);
      if (selectedAdmin?.id === deleteId) setSelectedAdmin(null);
      setDeleteId(null);
    }
  };

  return {
    admins,
    roles,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingAdmin,
    selectedAdmin,
    setSelectedAdmin,
    deleteId,
    setDeleteId,
    isSubmitting,
    createdPassword,
    formData,
    setFormData,
    getRoleName,
    formatDate,
    filteredAdmins,
    handleOpenModal,
    generatePassword,
    handleSubmit,
    handleToggleStatus,
    handleDelete,
  };
}
