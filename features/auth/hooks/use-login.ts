import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { LoginValues } from '../schemas/login.schema';

export function useLogin() {
  const { t } = useTranslation();
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const login = async (data: LoginValues) => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (err: any) {
      console.error("Login Error", err);
      let message = t('auth.invalid_cred');
      if (err.code === 'auth/too-many-requests') {
        message = t('auth.too_many_requests');
      }
      setError({ code: err.code, message });
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    if (!email) {
      setError({ message: t('auth.email_required') });
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(t('auth.reset_email_sent'));
    } catch (err: any) {
      console.error("Reset Password Error", err);
      let message = t('auth.invalid_cred');
      if (err.code === 'auth/user-not-found') message = "No account found with this email.";
      else if (err.code === 'auth/invalid-email') message = "Invalid email format.";
      else if (err.code === 'auth/too-many-requests') message = t('auth.too_many_requests');

      setError({ code: err.code, message });
    } finally {
      setResetLoading(false);
    }
  };

  return {
    error,
    loading,
    resetLoading,
    successMessage,
    login,
    forgotPassword,
  };
}
