"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../lib/firebase-client';
import { guestStore } from '../lib/guestStore';
import { useAuthGuard } from '../lib/authGuardContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { requireAuth } = useAuthGuard();
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once per mount/location change to avoid loops
    if (hasChecked.current) return;
    
    const user = auth.currentUser;
    // If no user (and implies guest mode since we are here), trigger guard
    if (!user) {
        hasChecked.current = true;
        // Trigger modal
        requireAuth(() => { 
            // This callback runs if auth IS present, which contradicts !user check.
            // But requireAuth handles the logic: if !user, show modal.
        });
        
        // Redirect to home immediately behind the modal so sensitive content isn't rendered
        // The modal is global, so it will stay open.
        router.replace('/home'); 
    }
  }, [requireAuth, router]);

  // If authenticated, render children.
  // If guest, we render null (and effect redirects to home + opens modal).
  if (auth.currentUser) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedRoute;
