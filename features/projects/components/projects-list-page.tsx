import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/lib/projectStore';
import { useTranslation } from '@/lib/i18nContext';
import ProjectListItem from './project-list-item';

export default function ProjectsListPage() {
  const router = useRouter();
  const { projects } = useProjects();
  const { t, dir } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full p-6 pt-8 relative overflow-y-auto no-scrollbar"
    >
      <button
        type="button"
        onClick={() => router.push('/home')}
        className="self-start text-slate-400 hover:text-white mb-6 flex items-center space-x-1 rtl:space-x-reverse"
      >
        {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <span className="text-sm">{t('auth.back')}</span>
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{t('client_projects.title')}</h1>
        <p className="text-slate-400 text-sm">{t('client_projects.subtitle')}</p>
      </div>

      <div className="space-y-1">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectListItem
              key={project.id}
              name={project.name}
              description={project.description}
              logoUrl={project.logoUrl}
              link={project.link}
            />
          ))
        ) : (
          <div className="text-center py-10 text-slate-500">
            <p>{t('client_projects.empty')}</p>
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center opacity-50">
        <div className="h-1 w-12 bg-primary/50 rounded-full mb-3" />
        <p className="text-slate-500 text-sm font-medium">{t('client_projects.coming_soon')}</p>
      </div>
    </motion.div>
  );
}
