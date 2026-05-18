import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { leadStore } from '@/lib/leadStore';
import { auth, db } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { ClaimValues } from '../schemas/claim.schema';

export type ClaimStatus = 'validating' | 'valid' | 'invalid' | 'claiming' | 'success';

export function useClaim() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const { t, dir, language, setLanguage } = useTranslation();

  const [status, setStatus] = useState<ClaimStatus>('validating');
  const [errorMsg, setErrorMsg] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);

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

  const handleClaim = async (data: ClaimValues) => {
    if (status !== 'valid' || !token || !leadId) return;

    setStatus('claiming');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}` });

      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim(),
          phone: data.phone,
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
    handleClaim,
  };
}
