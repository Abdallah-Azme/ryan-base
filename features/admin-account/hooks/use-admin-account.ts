import { useState, useEffect } from 'react';
import { updateProfile, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { AdminProfileValues } from '../schemas/profile.schema';

export function useAdminAccount() {
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    email: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'admins', user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          const nameParts = (data.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setFormData({
            firstName,
            lastName,
            phone: data.phone || '',
            role: data.role || 'Admin',
            email: data.email || user.email || '',
          });
        } else {
          const nameParts = (user.displayName || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: '',
            role: 'Admin',
            email: user.email || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  const handleSave = async (data: AdminProfileValues) => {
    if (!user) return;
    setIsSaving(true);
    setSuccess(false);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      await updateProfile(user, {
        displayName: fullName,
      });

      const docRef = doc(db, 'admins', user.uid);
      await updateDoc(docRef, {
        name: fullName,
        phone: data.phone || '',
      });

      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    isLoading,
    isSaving,
    success,
    formData,
    setFormData,
    handleSave,
  };
}
