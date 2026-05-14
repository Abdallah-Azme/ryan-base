import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';

export function useSignup() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (val: string) => {
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  const isPasswordMatch =
    formData.password === formData.confirmPassword && formData.password.length > 0;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const showEmailError = formData.email.length > 0 && !isEmailValid;

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError({ message: t('val.req_email') });
      return;
    }

    if (!agreed) {
      setError({ message: 'Please agree to the Terms & Conditions.' });
      return;
    }

    if (!isPasswordMatch) {
      setError({ message: t('auth.pass_mismatch') });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: trimmedEmail,
          phone: formData.phone,
          role: 'Customer',
          status: 'Active',
          createdAt: serverTimestamp(),
          registeredAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          migrationDone: true,
        });
      }

      router.push('/home');
    } catch (err: any) {
      console.error("Signup Error:", err);
      let message = "Signup failed. Please try again.";
      if (err.code === 'auth/email-already-in-use') message = t('auth.email_in_use');
      else if (err.code === 'auth/weak-password') message = t('auth.weak_pass');
      else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';

      setError({ code: err.code, message });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    agreed,
    setAgreed,
    error,
    loading,
    handleChange,
    handlePhoneChange,
    isPasswordMatch,
    showEmailError,
    signup,
  };
}
