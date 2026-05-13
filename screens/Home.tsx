"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, ChevronRight, Box, ChevronLeft } from 'lucide-react';
import AvatarInitial from '../components/AvatarInitial';
import { useUserProjects } from '../lib/userProjectsStore';
import ProjectWizard from '../components/ProjectWizard';
import { auth } from '../lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from '../lib/i18nContext';
import { useAuthGuard } from '../lib/authGuardContext';
import { guestStore } from '../lib/guestStore';

interface AppCardProps {
  id: string;
  name: string;
  version: string;
  description?: string;
  iconBg?: string;
  brandColor?: string;
  onOpen: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ name, version, description, iconBg, brandColor, onOpen }) => {
  // Fallback to primary color if no brandColor provided
  const finalColor = brandColor || '#1DB7F0';
  const { t } = useTranslation();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-slate-800/40 border border-white/5 p-3 rounded-2xl flex items-center justify-between mb-3 shadow-lg backdrop-blur-sm cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 transition-colors duration-300"
          style={{ 
            backgroundColor: finalColor,
            border: `1px solid ${finalColor}40`,
            boxShadow: `0 0 12px ${finalColor}30`
          }}
        >
          <Box className="text-white opacity-90" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate pr-2 rtl:pr-0 rtl:pl-2">{name}</h3>
          <p className="text-slate-400 text-xs truncate">{description || version}</p>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className="bg-slate-700/50 hover:bg-primary/20 text-xs font-medium text-white px-4 py-2 rounded-lg transition-colors border border-white/5 shrink-0"
      >
        {t('home.open')}
      </button>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const router = useRouter();
  // Use local state for auth user to trigger re-renders
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { t, dir } = useTranslation();
  const { requireAuth } = useAuthGuard();
  
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  const isGuest = !currentUser && guestStore.isGuest;
  const userName = currentUser?.displayName || (isGuest ? t('home.guest') : 'User');
  
  const { projects } = useUserProjects(); 
  // projects is already live from Firestore via the store
  const userCreatedProjects = currentUser ? projects : []; // No projects for guests

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleCreateClick = () => {
    requireAuth(() => setIsWizardOpen(true));
  };

  const handleNotificationsClick = () => {
    requireAuth(() => router.push('/notifications'));
  };

  return (
    <div className="flex flex-col h-full pb-20 relative overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="p-6 pb-2 flex justify-between items-center z-20">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleNotificationsClick}
          className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5"
        >
          <Bell size={20} className="text-white" />
        </motion.button>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse bg-slate-800/50 pl-4 pr-1 py-1 rtl:pl-1 rtl:pr-4 rounded-full border border-white/5">
          <span className="text-sm font-medium text-white">{t('home.greeting')}, {userName} 👋</span>
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 overflow-hidden">
            <AvatarInitial name={userName} className="w-full h-full text-sm" />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        
        {/* My Apps Section */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-2 rtl:mr-0 rtl:ml-2"></span>
            {t('home.my_apps')}
          </h2>
          <div className="flex flex-col">
            {userCreatedProjects.length > 0 ? (
              userCreatedProjects.map(app => (
                <AppCard 
                  key={app.id}
                  id={app.id}
                  name={app.name} 
                  version={app.version || 'v1.0.0'} 
                  description={app.description}
                  iconBg={app.iconBg}
                  brandColor={app.brandColor}
                  onOpen={() => router.push(`/projects/${app.id}`)}
                />
              ))
            ) : (
              // Empty State
              <div className="text-center py-8 bg-slate-800/20 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-400">{t('home.no_apps')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('home.create_first')}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Button */}
        <motion.button
          onClick={handleCreateClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(29,183,240,0.2)] group"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Plus size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold">
              {userCreatedProjects.length > 0 ? t('home.create_another') : t('home.add_first')}
            </span>
          </div>
          {dir === 'rtl' ? (
             <ChevronLeft className="text-white/70 group-hover:-translate-x-1 transition-transform" />
          ) : (
             <ChevronRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
          )}
        </motion.button>
      </div>

      {/* Project Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <ProjectWizard 
            onClose={() => setIsWizardOpen(false)}
            onComplete={() => setIsWizardOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
