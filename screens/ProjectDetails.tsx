"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Box, Save, ExternalLink, Edit2, X, Check, Globe, ChevronRight } from 'lucide-react';
import { useUserProjects, userProjectsStore, ProjectStatus } from '../lib/userProjectsStore';
import ErrorBoundary from '../components/ErrorBoundary';
import { useTranslation } from '../lib/i18nContext';

const ProjectDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { projects } = useUserProjects();
  const { t, dir, language } = useTranslation();
  
  const project = projects.find(p => p.id === id);
  
  // Local Editing States
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    if (project) {
      setNameDraft(project.name);
      setDescDraft(project.description);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center text-slate-500">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
          <Box size={24} />
        </div>
        <h2 className="text-white font-bold mb-2">{t('project.not_found')}</h2>
        <p className="text-sm mb-6">{t('project.removed')}</p>
        <button 
          onClick={() => router.push('/home')}
          className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium"
        >
          {t('project.back_home')}
        </button>
      </div>
    );
  }

  const handleSaveName = () => {
    if (!nameDraft.trim()) return;
    userProjectsStore.updateProject(project.id, { name: nameDraft });
    setIsEditingName(false);
  };

  const handleSaveDesc = () => {
    if (!descDraft.trim()) return;
    userProjectsStore.updateProject(project.id, { description: descDraft });
    setIsEditingDesc(false);
  };

  const handleOpenUrl = () => {
    if (project.projectUrl) {
      window.open(project.projectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Format Helpers
  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    const currencyLabel = language === 'ar' ? 'دك' : 'KWD';
    return `${price.toLocaleString()} ${currencyLabel}`;
  };
  
  const formatDuration = (days: number | null) => 
    days ? `${days} ${t('days')}` : '—';
  
  // Brand Color Logic
  const finalColor = project.brandColor || '#1DB7F0';

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24">
      
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button 
          onClick={() => router.push('/home')}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors flex items-center gap-1 rtl:flex-row-reverse"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          <span className="text-sm font-medium">{t('auth.back')}</span>
        </button>
        <h1 className="text-lg font-bold text-white ml-2 flex-1 text-center pr-8 rtl:pr-0 rtl:pl-8 truncate">
          {t('project.details')}
        </h1>
      </div>

      <div className="p-6 space-y-6">

        {/* Top Card */}
        <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <motion.button
              whileTap={project.projectUrl ? { scale: 0.95 } : {}}
              onClick={handleOpenUrl}
              disabled={!project.projectUrl}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden group ${project.projectUrl ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                 backgroundColor: finalColor,
                 border: `1px solid ${finalColor}40`,
                 boxShadow: `0 0 20px ${finalColor}30`
              }}
            >
              <Box className="text-white opacity-90 relative z-10" size={32} />
              
              {/* Hover Effect for Link */}
              {project.projectUrl && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <ExternalLink className="text-white" size={24} />
                </div>
              )}
            </motion.button>

            {/* Name & Edit */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="w-full bg-slate-900 border border-primary rounded-lg px-3 py-2 text-white font-bold text-lg focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="bg-primary px-3 py-1 rounded text-xs text-white font-medium">{t('project.save')}</button>
                    <button onClick={() => { setIsEditingName(false); setNameDraft(project.name); }} className="bg-slate-700 px-3 py-1 rounded text-xs text-slate-300">{t('project.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  className="group cursor-pointer rounded-lg p-1 -ml-1 hover:bg-white/5 transition-colors"
                >
                  <h2 className="text-2xl font-bold text-white leading-tight break-words flex items-center gap-2">
                    {project.name}
                    <Edit2 size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">{project.version || 'v1.0.0'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Price */}
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.est_price')}</span>
            <span className="text-white font-semibold text-sm leading-tight break-all">
              {formatPrice(project.estimatedPrice)}
            </span>
          </div>
          
          {/* Duration */}
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.duration')}</span>
            <span className="text-white font-semibold text-sm leading-tight">
              {formatDuration(project.estimatedDuration)}
            </span>
          </div>

          {/* Status */}
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.status')}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-white/5 ${
              project.status === 'cancelled' 
                ? 'bg-red-500/10 text-red-400' 
                : 'bg-primary/10 text-primary'
            }`}>
              {t(`status.${project.status}`)}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-white font-bold text-base">{t('project.desc_title')}</h3>
            {!isEditingDesc && (
              <button 
                onClick={() => setIsEditingDesc(true)}
                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
          
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 min-h-[120px]">
            {isEditingDesc ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  className="w-full h-32 bg-slate-900/50 border border-primary/50 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => { setIsEditingDesc(false); setDescDraft(project.description); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-white/5"
                  >
                    {t('project.cancel')}
                  </button>
                  <button 
                    onClick={handleSaveDesc}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-primary shadow-lg shadow-primary/20 flex items-center gap-1"
                  >
                    <Save size={14} />
                    {t('project.save')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Website Link (Optional Extra) */}
        {project.projectUrl && (
          <a 
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Globe size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{t('project.visit_web')}</span>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">{project.projectUrl}</span>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-500 group-hover:text-white transition-colors" />
          </a>
        )}

      </div>
    </div>
  );
};

export default ProjectDetails;
