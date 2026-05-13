"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Info, FileText, ShieldCheck, LogOut, Trash2, FolderOpen, LogIn } from 'lucide-react';
import AvatarInitial from '../components/AvatarInitial';
import MoreListItem from '../components/MoreListItem';
import ConfirmModal from '../components/ConfirmModal';
import { auth } from '../lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from '../lib/i18nContext';
import { guestStore } from '../lib/guestStore';
import { useAuthGuard } from '../lib/authGuardContext';

const More: React.FC = () => {
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
      // Clear guest mode too
      guestStore.setGuest(false);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleGuestExit = () => {
    guestStore.setGuest(false);
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    // In a real app, we would call a cloud function or deleteUser(auth.currentUser)
    await handleSignOut();
  };

  const protectedNavigate = (path: string) => {
    requireAuth(() => router.push(path));
  };

  return (
    <div className="flex flex-col h-full relative overflow-y-auto no-scrollbar pb-24">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-5 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">{t('more.title')}</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl flex items-center space-x-4 rtl:space-x-reverse shadow-lg backdrop-blur-sm relative overflow-hidden group"
        >
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-16 h-16 shrink-0">
            <AvatarInitial name={userName} className="w-full h-full text-2xl border-2 border-slate-700" />
          </div>
          
          <div className="flex-1 min-w-0 relative z-10">
            <h2 className="text-lg font-bold text-white truncate">{userName}</h2>
            <p className="text-slate-400 text-xs truncate mb-1">{userEmail}</p>
            {isGuest ? (
               <button onClick={() => router.push('/login')} className="text-xs text-primary font-bold flex items-center gap-1">
                 <LogIn size={12} /> {t('auth.login_action')}
               </button>
            ) : (
               <span className="text-xs text-primary font-medium">{t('more.view_profile')}</span>
            )}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 overflow-hidden shadow-lg"
        >
          <MoreListItem 
            icon={FolderOpen} 
            label={t('more.files')} 
            onClick={() => protectedNavigate('/more/files')} 
          />
          <MoreListItem 
            icon={Settings} 
            label={t('more.settings')} 
            onClick={() => router.push('/more/settings')} 
          />
          <MoreListItem 
            icon={Info} 
            label={t('more.about')} 
            onClick={() => router.push('/more/about')} 
          />
          <MoreListItem 
            icon={FileText} 
            label={t('more.terms')} 
            onClick={() => router.push('/more/terms')} 
          />
          <MoreListItem 
            icon={ShieldCheck} 
            label={t('more.privacy')} 
            onClick={() => router.push('/more/privacy')} 
          />
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {isGuest ? (
             <button 
                onClick={handleGuestExit}
                className="w-full py-4 rounded-2xl bg-slate-800/40 border border-white/5 text-slate-300 font-medium text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse hover:bg-slate-800 transition-colors hover:text-white"
             >
                <LogOut size={18} className="rtl:rotate-180" />
                <span>Exit Guest Mode</span>
             </button>
          ) : (
             <button 
                onClick={() => setShowSignOut(true)}
                className="w-full py-4 rounded-2xl bg-slate-800/40 border border-white/5 text-slate-300 font-medium text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse hover:bg-slate-800 transition-colors hover:text-white"
             >
                <LogOut size={18} className="rtl:rotate-180" />
                <span>{t('more.signout')}</span>
             </button>
          )}

          {!isGuest && (
            <button 
                onClick={() => setShowDelete(true)}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse hover:bg-red-500/20 transition-colors"
            >
                <Trash2 size={18} />
                <span>{t('more.delete_account')}</span>
            </button>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-slate-600 font-medium">{t('more.version')} 1.0.0</p>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showSignOut}
        title={t('more.modal_signout_title')}
        message={t('more.modal_signout_msg')}
        confirmText={t('more.signout')}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
      />

      <ConfirmModal
        isOpen={showDelete}
        title={t('more.modal_delete_title')}
        message={t('more.modal_delete_msg')}
        confirmText={t('more.confirm_delete')}
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default More;
