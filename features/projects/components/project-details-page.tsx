import React from 'react';
import { Save, Edit2, ChevronLeft, ChevronRight, Box, Globe, ExternalLink } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';
import Button from '@/components/ui/button';
import ProjectHeader from './project-header';
import ProjectStatusCard from './project-status-card';
import ProjectInfoGrid from './project-info-grid';
import { useProjectDetails } from '../hooks/use-project-details';

export default function ProjectDetailsPage({ id }: { id?: string }) {
  const {
    router,
    t,
    dir,
    language,
    project,
    isEditingName,
    setIsEditingName,
    nameDraft,
    setNameDraft,
    isEditingDesc,
    setIsEditingDesc,
    descDraft,
    setDescDraft,
    handleSaveName,
    handleSaveDesc,
    handleOpenUrl,
  } = useProjectDetails(id);

  if (!project) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center text-slate-500">
        <EmptyState
          icon={<Box size={24} />}
          title={t('project.not_found')}
          subtitle={t('project.removed')}
          action={
            <Button onClick={() => router.push('/home')} className="mt-4">
              {t('project.back_home')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24">
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          <span className="text-sm font-medium">{t('auth.back')}</span>
        </button>
        <h1 className="text-lg font-bold text-white ms-2 flex-1 text-center pe-8 rtl:pe-0 rtl:ps-8 truncate">
          {t('project.details')}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        <ProjectHeader
          name={project.name}
          version={project.version}
          brandColor={project.brandColor}
          projectUrl={project.projectUrl}
          isEditingName={isEditingName}
          nameDraft={nameDraft}
          t={t}
          onOpenUrl={handleOpenUrl}
          onStartEditName={() => setIsEditingName(true)}
          onChangeNameDraft={setNameDraft}
          onSaveName={handleSaveName}
          onCancelEditName={() => {
            setIsEditingName(false);
            setNameDraft(project.name);
          }}
        />

        <ProjectStatusCard
          estimatedPrice={project.estimatedPrice}
          estimatedDuration={project.estimatedDuration}
          status={project.status}
          t={t}
          language={language}
        />

        <ProjectInfoGrid
          industry={project.industry}
          industryOther={project.industryOther}
          markets={project.markets}
          languages={project.languages}
          platforms={project.platforms}
          t={t}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-white font-bold text-base">{t('project.desc_title')}</h3>
            {!isEditingDesc ? (
              <button
                type="button"
                onClick={() => setIsEditingDesc(true)}
                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            ) : null}
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
                    type="button"
                    onClick={() => {
                      setIsEditingDesc(false);
                      setDescDraft(project.description);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-white/5"
                  >
                    {t('project.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDesc}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-primary shadow-lg shadow-primary/20 flex items-center gap-1"
                  >
                    <Save size={14} />
                    {t('project.save')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
            )}
          </div>
        </div>

        {project.projectUrl ? (
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
        ) : null}
      </div>
    </div>
  );
}
