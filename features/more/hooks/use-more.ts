import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { guestStore } from '@/lib/guestStore';
import { useAuthGuard } from '@/lib/authGuardContext';

export function useMore() {
  const router = useRouter();
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const { t, dir } = useTranslation();
  const { requireAuth } = useAuthGuard();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isGuest = !user && guestStore.isGuest;
  const userName = user?.displayName || (isGuest ? t('home.guest') : 'User');
  const userEmail = user?.email || (isGuest ? 'Guest Access' : 'No Email');

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      guestStore.setGuest(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleGuestExit = () => {
    guestStore.setGuest(false);
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    await handleSignOut();
  };

  const protectedNavigate = (path: string) => {
    requireAuth(() => router.push(path));
  };

  return {
    router,
    t,
    dir,
    isGuest,
    userName,
    userEmail,
    showSignOut,
    setShowSignOut,
    showDelete,
    setShowDelete,
    handleSignOut,
    handleGuestExit,
    handleDeleteAccount,
    protectedNavigate,
  };
}
