"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AuthRequiredModal from '../components/AuthRequiredModal';
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
    // If we have a user, just execute the callback
    if (auth.currentUser) {
        callback();
        return;
    }

    // If no user, check if we are in guest mode (or just not logged in)
    // In both cases, we show the modal for restricted actions.
    
    // Save current path if we are just prompting on the current page (like Home -> Create Project)
    // But if we are navigating *to* a protected route, the callback usually is navigate().
    // The modal handles saving intended path via props if we pass it, but for generic actions:
    
    // For generic actions on the current page, we assume 'intendedPath' is redundant 
    // unless the action was a navigation.
    // We'll set the *current* path as the return point if the user logs in, 
    // but the specific action (like opening the wizard) might be lost. 
    // Better UX: Save the current path so user comes back here.
    
    guestStore.setIntendedPath(pathname || '/');
    setIsModalOpen(true);
  };

  return (
    <AuthGuardContext.Provider value={{ requireAuth }}>
      {children}
      <AuthRequiredModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        // We don't pass specific redirect here because intendedPath is saved in guestStore 
        // and handled by the modal's internal logic or the App's auth listener
      />
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
