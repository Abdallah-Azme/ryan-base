'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase-client';
import { useAuthGuard } from '@/lib/authGuardContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { requireAuth } = useAuthGuard();
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;

    const user = auth.currentUser;
    if (!user) {
      hasChecked.current = true;
      requireAuth(() => {});
      router.replace('/home');
    }
  }, [requireAuth, router]);

  if (auth.currentUser) {
    return <>{children}</>;
  }

  return null;
}
