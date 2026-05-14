import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProjects, userProjectsStore } from '@/lib/userProjectsStore';
import { useTranslation } from '@/lib/i18nContext';

export function useProjectDetails(id?: string) {
  const router = useRouter();
  const { projects } = useUserProjects();
  const { t, dir, language } = useTranslation();

  const project = projects.find((p) => p.id === id);

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

  const handleSaveName = () => {
    if (!nameDraft.trim() || !project) return;
    userProjectsStore.updateProject(project.id, { name: nameDraft });
    setIsEditingName(false);
  };

  const handleSaveDesc = () => {
    if (!descDraft.trim() || !project) return;
    userProjectsStore.updateProject(project.id, { description: descDraft });
    setIsEditingDesc(false);
  };

  const handleOpenUrl = () => {
    if (project?.projectUrl) {
      window.open(project.projectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return {
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
  };
}
