import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { SignupValues } from '../schemas/signup.schema';

export function useSignup() {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const signup = async (data: SignupValues) => {
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
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
    error,
    loading,
    signup,
  };
}
