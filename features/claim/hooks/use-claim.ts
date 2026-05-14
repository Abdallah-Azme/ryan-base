import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { leadStore } from '@/lib/leadStore';
import { auth, db } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';

export type ClaimStatus = 'validating' | 'valid' | 'invalid' | 'claiming' | 'success';

export function useClaim() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const { t, dir, language, setLanguage } = useTranslation();

  const [status, setStatus] = useState<ClaimStatus>('validating');
  const [errorMsg, setErrorMsg] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const showEmailError = formData.email.length > 0 && !isEmailValid;

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMsg('Missing token.');
      return;
    }

    leadStore.validateToken(token).then((res) => {
      if (res.valid && res.leadId) {
        setLeadId(res.leadId);
        setStatus('valid');
      } else {
        setStatus('invalid');
        setErrorMsg(res.error || 'Token invalid.');
      }
    });
  }, [token]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'valid' || !token || !leadId) return;

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      alert(t('val.req_email'));
      return;
    }

    setStatus('claiming');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${formData.firstName} ${formData.lastName}` });

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

      await leadStore.claimProject(token, leadId);

      setStatus('success');
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
      setStatus('valid');
    }
  };

  return {
    router,
    t,
    dir,
    language,
    setLanguage,
    status,
    errorMsg,
    formData,
    setFormData,
    showEmailError,
    handleClaim,
  };
}
