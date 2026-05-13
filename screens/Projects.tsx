"use client";

// @ts-nocheck
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { useProjects } from '../lib/projectStore';
import { useTranslation } from '../lib/i18nContext';

interface ProjectCardProps {
  name: string;
  description: string;
  logoUrl: string;
  link: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ name, description, logoUrl, link }) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
    whileTap={{ scale: 0.98 }}
    className="bg-slate-800/40 border border-white/5 p-3 rounded-2xl mb-3 flex items-center space-x-3 rtl:space-x-reverse transition-colors cursor-pointer block"
  >
    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-slate-800 shadow-md">
      <SafeImage
        src={logoUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-white font-bold text-sm truncate">{name}</h4>
      <p className="text-slate-400 text-xs truncate">{description}</p>
    </div>
  </motion.a>
);

const Projects: React.FC = () => {
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
            <ProjectCard
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
        <div className="h-1 w-12 bg-primary/50 rounded-full mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">{t('client_projects.coming_soon')}</p>
      </div>
    </motion.div>
  );
};

export default Projects;
