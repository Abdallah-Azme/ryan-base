import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import EmptyState from '@/components/ui/empty-state';
import ProjectWizard from '@/features/projects/components/project-wizard';
import { useTranslation } from '@/lib/i18nContext';
import { useHome } from '../hooks/use-home';
import AppCard from './app-card';

export default function HomePage() {
  const router = useRouter();
  const { t, dir } = useTranslation();
  const {
    userName,
    projects,
    isWizardOpen,
    setIsWizardOpen,
    handleCreateClick,
    handleNotificationsClick,
  } = useHome();

  return (
    <div className="flex flex-col h-full pb-20 relative overflow-y-auto no-scrollbar">
      <header className="p-6 pb-2 flex justify-between items-center z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNotificationsClick}
          className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5"
        >
          <Bell size={20} className="text-white" />
        </motion.button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse bg-slate-800/50 ps-4 pe-1 py-1 rounded-full border border-white/5">
          <span className="text-sm font-medium text-white">
            {t('home.greeting')}, {userName} 👋
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 overflow-hidden shrink-0">
            <Avatar name={userName} size="sm" className="w-full h-full text-xs" />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full me-2" />
            {t('home.my_apps')}
          </h2>
          <div className="flex flex-col">
            {projects.length > 0 ? (
              projects.map((app) => (
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
              <EmptyState
                icon={<Plus size={24} />}
                title={t('home.no_apps')}
                subtitle={t('home.create_first')}
              />
            )}
          </div>
        </section>

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
              {projects.length > 0 ? t('home.create_another') : t('home.add_first')}
            </span>
          </div>
          {dir === 'rtl' ? (
            <ChevronLeft className="text-white/70 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ChevronRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isWizardOpen ? (
          <ProjectWizard
            onClose={() => setIsWizardOpen(false)}
            onComplete={() => setIsWizardOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
