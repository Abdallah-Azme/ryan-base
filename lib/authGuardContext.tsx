'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AuthRequiredModal from '@/components/ui/auth-required-modal';
import { guestStore } from './guestStore';
import { auth } from './firebase-client';

interface AuthGuardContextType {
  requireAuth: (callback: () => void) => void;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export const AuthGuardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const requireAuth = (callback: () => void) => {
    if (auth.currentUser) {
      callback();
      return;
    }

    guestStore.setIntendedPath(pathname || '/');
    setIsModalOpen(true);
  };

  return (
    <AuthGuardContext.Provider value={{ requireAuth }}>
      {children}
      <AuthRequiredModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AuthGuardContext.Provider>
  );
};

export const useAuthGuard = () => {
  const context = useContext(AuthGuardContext);
  if (!context) {
    throw new Error('useAuthGuard must be used within an AuthGuardProvider');
  }
  return context;
};
