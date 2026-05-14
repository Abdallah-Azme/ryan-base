import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { useAuthGuard } from '@/lib/authGuardContext';
import { guestStore } from '@/lib/guestStore';
import { useUserProjects } from '@/lib/userProjectsStore';

export function useHome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { requireAuth } = useAuthGuard();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  const isGuest = !currentUser && guestStore.isGuest;
  const userName = currentUser?.displayName || (isGuest ? t('home.guest') : 'User');

  const { projects } = useUserProjects();
  const userCreatedProjects = currentUser ? projects : [];

  const handleCreateClick = () => {
    requireAuth(() => setIsWizardOpen(true));
  };

  const handleNotificationsClick = () => {
    requireAuth(() => router.push('/notifications'));
  };

  return {
    currentUser,
    isGuest,
    userName,
    projects: userCreatedProjects,
    isWizardOpen,
    setIsWizardOpen,
    handleCreateClick,
    handleNotificationsClick,
  };
}
