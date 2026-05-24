import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase-client';
import { createAuditLogSafe } from '@/lib/auditLogStore';
import { useAdmins } from '@/lib/adminStore';
import { sanitizeForFirestore } from '@/lib/firestoreSanitize';
import { createServiceNotificationSafe } from '@/lib/serviceNotifications';
import {
  ProjectAttachment,
  ProjectInternalNote,
  ProjectProgressUpdate,
  ProjectStage,
  ProjectStageStatus,
  ProjectWeeklyReport,
  UserProject,
} from '@/lib/userProjectsStore';

export type ProjectDetailTab = 'overview' | 'plan' | 'progress' | 'reports' | 'files' | 'final';

export interface StageFormState {
  title: string;
  description: string;
  assignedTo: string;
  estimatedDays: string;
  status: ProjectStageStatus;
}

export interface AttachmentFormState {
  stageId: string;
  title: string;
  description: string;
  reason: string;
}

export interface WeeklyReportFormState {
  weekStart: string;
  weekEnd: string;
  content: string;
}

const emptyStageForm: StageFormState = {
  title: '',
  description: '',
  assignedTo: '',
  estimatedDays: '',
  status: 'planned',
};

const emptyAttachmentForm: AttachmentFormState = {
  stageId: '',
  title: '',
  description: '',
  reason: '',
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const getDefaultReportRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return {
    weekStart: toDateInputValue(start),
    weekEnd: toDateInputValue(end),
    content: '',
  };
};

const normalizeTimestamp = (value: any) => value?.toMillis?.() || value || Date.now();

const normalizeStage = (stage: any, index: number): ProjectStage => ({
  id: stage.id,
  title: stage.title || 'Untitled Stage',
  description: stage.description || '',
  assignedTo: stage.assignedTo || '',
  estimatedDays: stage.estimatedDays ?? null,
  order: typeof stage.order === 'number' ? stage.order : index,
  progress: typeof stage.progress === 'number' ? stage.progress : 0,
  status: stage.status || 'planned',
  createdAt: normalizeTimestamp(stage.createdAt),
  updatedAt: normalizeTimestamp(stage.updatedAt),
  startedAt: stage.startedAt ? normalizeTimestamp(stage.startedAt) : null,
  completedAt: stage.completedAt ? normalizeTimestamp(stage.completedAt) : null,
});

const normalizeProgressUpdate = (update: any): ProjectProgressUpdate => ({
  id: update.id,
  stageId: update.stageId,
  stageTitle: update.stageTitle || 'Stage',
  previousProgress: update.previousProgress || 0,
  nextProgress: update.nextProgress || 0,
  note: update.note || '',
  createdAt: normalizeTimestamp(update.createdAt),
  createdByName: update.createdByName || 'Admin',
});

const normalizeAttachment = (attachment: any): ProjectAttachment => ({
  id: attachment.id,
  stageId: attachment.stageId,
  title: attachment.title || 'Untitled attachment',
  description: attachment.description || '',
  reason: attachment.reason || '',
  fileName: attachment.fileName || 'file',
  fileType: attachment.fileType || 'application/octet-stream',
  fileSize: attachment.fileSize || 0,
  storagePath: attachment.storagePath || '',
  url: attachment.url || '',
  createdAt: normalizeTimestamp(attachment.createdAt),
  createdByName: attachment.createdByName || 'Admin',
});

const normalizeInternalNote = (note: any): ProjectInternalNote => ({
  id: note.id,
  stageId: note.stageId,
  text: note.text || '',
  adminOnly: true,
  createdAt: normalizeTimestamp(note.createdAt),
  createdByName: note.createdByName || 'Admin',
});

const normalizeWeeklyReport = (report: any): ProjectWeeklyReport => ({
  id: report.id,
  weekStart: normalizeTimestamp(report.weekStart),
  weekEnd: normalizeTimestamp(report.weekEnd),
  content: report.content || '',
  status: report.status || 'draft',
  sourceUpdateIds: report.sourceUpdateIds || [],
  clientVisible: Boolean(report.clientVisible),
  createdAt: normalizeTimestamp(report.createdAt),
  updatedAt: normalizeTimestamp(report.updatedAt),
  createdByName: report.createdByName || 'Admin',
  sentAt: report.sentAt ? normalizeTimestamp(report.sentAt) : null,
});

const parseDateInput = (value: string, endOfDay = false) => {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const formatReportDate = (value: number) =>
  new Date(value).toLocaleDateString('en-UK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export function useAdminProjectOperations(ownerId?: string, projectId?: string) {
  const { admins } = useAdmins();
  const [project, setProject] = useState<UserProject | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState<StageFormState>(emptyStageForm);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState('');
  const [attachmentForm, setAttachmentForm] = useState<AttachmentFormState>(emptyAttachmentForm);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [noteStageId, setNoteStageId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [reportForm, setReportForm] = useState<WeeklyReportFormState>(getDefaultReportRange);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [finalReportContent, setFinalReportContent] = useState('');

  const projectRef = useMemo(() => {
    if (!db || !ownerId || !projectId) return null;
    return doc(db, 'users', ownerId, 'projects', projectId);
  }, [ownerId, projectId]);

  const loadProject = useCallback(async () => {
    if (!projectRef) {
      setError('Missing project path.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const snap = await getDoc(projectRef);
      if (!snap.exists()) {
        setProject(null);
        setError('Project not found.');
        return;
      }

      const data = snap.data();
      const normalizedProject = {
        id: snap.id,
        ...data,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt),
        completedAt: data.completedAt ? normalizeTimestamp(data.completedAt) : null,
        stages: (data.stages || [])
          .map(normalizeStage)
          .sort((a: ProjectStage, b: ProjectStage) => a.order - b.order),
        progressUpdates: (data.progressUpdates || [])
          .map(normalizeProgressUpdate)
          .sort((a: ProjectProgressUpdate, b: ProjectProgressUpdate) => b.createdAt - a.createdAt),
        weeklyReports: (data.weeklyReports || [])
          .map(normalizeWeeklyReport)
          .sort((a: ProjectWeeklyReport, b: ProjectWeeklyReport) => b.weekStart - a.weekStart),
        attachments: (data.attachments || [])
          .map(normalizeAttachment)
          .sort((a: ProjectAttachment, b: ProjectAttachment) => b.createdAt - a.createdAt),
        internalNotes: (data.internalNotes || [])
          .map(normalizeInternalNote)
          .sort((a: ProjectInternalNote, b: ProjectInternalNote) => b.createdAt - a.createdAt),
        finalReport: data.finalReport
          ? {
              ...data.finalReport,
              generatedAt: normalizeTimestamp(data.finalReport.generatedAt),
              approvedAt: data.finalReport.approvedAt ? normalizeTimestamp(data.finalReport.approvedAt) : null,
            }
          : null,
      } as UserProject;

      setProject(normalizedProject);
      setFinalReportContent(normalizedProject.finalReport?.content || '');

      const activeStage = normalizedProject.stages?.find((stage) => stage.status === 'active');
      const firstStage = normalizedProject.stages?.[0];
      const defaultStage = activeStage || firstStage;
      if (defaultStage) {
        setSelectedStageId(defaultStage.id);
        setProgressValue(defaultStage.progress || 0);
        setAttachmentForm((prev) => ({ ...prev, stageId: prev.stageId || defaultStage.id }));
        setNoteStageId((prev) => prev || defaultStage.id);
      }
    } catch (err: any) {
      console.error('Failed to load project operations:', err);
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [projectRef]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const stages = project?.stages || [];
  const employees = admins.filter((admin) => admin.status === 'Active');
  const progressUpdates = project?.progressUpdates || [];
  const weeklyReports = project?.weeklyReports || [];
  const attachments = project?.attachments || [];
  const internalNotes = project?.internalNotes || [];
  const selectedStage = stages.find((stage) => stage.id === selectedStageId) || null;
  const completedStages = stages.filter((stage) => stage.status === 'completed').length;
  const completionChecks = {
    hasStages: stages.length > 0,
    allStagesComplete: stages.length > 0 && stages.every((stage) => stage.status === 'completed' || stage.progress >= 100),
    hasProgressHistory: progressUpdates.length > 0,
    hasReportHistory: weeklyReports.some((report) => report.status === 'sent'),
  };
  const canApproveCompletion =
    completionChecks.hasStages && completionChecks.allStagesComplete && project?.status !== 'completed';
  const overallProgress = stages.length
    ? Math.round(stages.reduce((sum, stage) => sum + (stage.progress || 0), 0) / stages.length)
    : 0;

  useEffect(() => {
    if (selectedStage) {
      setProgressValue(selectedStage.progress || 0);
    }
  }, [selectedStage?.id]);

  const resetStageForm = () => {
    setStageForm(emptyStageForm);
    setEditingStageId(null);
  };

  const startEditStage = (stage: ProjectStage) => {
    setEditingStageId(stage.id);
    setStageForm({
      title: stage.title,
      description: stage.description || '',
      assignedTo: stage.assignedTo || '',
      estimatedDays: stage.estimatedDays ? String(stage.estimatedDays) : '',
      status: stage.status,
    });
    setActiveTab('plan');
  };

  const persistProjectUpdates = async (updates: Partial<UserProject>) => {
    if (!projectRef) return;
    const cleanUpdates = sanitizeForFirestore({
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(projectRef, cleanUpdates);
  };

  const writeProjectAudit = (action: string, details: Record<string, unknown> = {}) => {
    if (!project || !projectId) return Promise.resolve();
    return createAuditLogSafe({
      entityType: 'project',
      entityId: projectId,
      projectId,
      ownerId,
      action,
      ...details,
    });
  };

  const notifyProjectOwner = (title: string, message: string, type: 'system' | 'success' | 'warning' = 'system') => {
    if (!ownerId || !projectId) return Promise.resolve();
    return createServiceNotificationSafe({
      userId: ownerId,
      type,
      title,
      message,
      projectId,
      deepLink: `/projects/${projectId}`,
    });
  };

  const saveStage = async () => {
    if (!project || !stageForm.title.trim()) return;

    setSaving(true);
    try {
      const now = Date.now();
      const nextStages = [...stages];

      if (editingStageId) {
        const index = nextStages.findIndex((stage) => stage.id === editingStageId);
        if (index >= 0) {
          nextStages[index] = {
            ...nextStages[index],
            title: stageForm.title.trim(),
            description: stageForm.description.trim(),
            assignedTo: stageForm.assignedTo.trim(),
            estimatedDays: stageForm.estimatedDays ? Number(stageForm.estimatedDays) : null,
            status: stageForm.status,
            progress: stageForm.status === 'completed' ? 100 : nextStages[index].progress,
            updatedAt: now,
            startedAt:
              stageForm.status === 'active' && !nextStages[index].startedAt ? now : nextStages[index].startedAt,
            completedAt: stageForm.status === 'completed' ? now : nextStages[index].completedAt || null,
          };
        }
      } else {
        nextStages.push({
          id: `stage_${now}`,
          title: stageForm.title.trim(),
          description: stageForm.description.trim(),
          assignedTo: stageForm.assignedTo.trim(),
          estimatedDays: stageForm.estimatedDays ? Number(stageForm.estimatedDays) : null,
          order: nextStages.length,
          progress: stageForm.status === 'completed' ? 100 : 0,
          status: stageForm.status,
          createdAt: now,
          updatedAt: now,
          startedAt: stageForm.status === 'active' ? now : null,
          completedAt: stageForm.status === 'completed' ? now : null,
        });
      }

      await persistProjectUpdates({ stages: nextStages });
      await writeProjectAudit(editingStageId ? 'stage.updated' : 'stage.created', {
        entityType: 'stage',
        entityId: editingStageId || nextStages[nextStages.length - 1]?.id || projectId,
        newValue: editingStageId
          ? nextStages.find((stage) => stage.id === editingStageId)
          : nextStages[nextStages.length - 1],
      });
      setProject({ ...project, stages: nextStages, updatedAt: now });
      resetStageForm();
    } catch (err: any) {
      console.error('Failed to save stage:', err);
      setError(err.message || 'Failed to save stage.');
    } finally {
      setSaving(false);
    }
  };

  const deleteStage = async (stageId: string) => {
    if (!project) return;
    const confirmed = window.confirm('Delete this stage? Progress updates will remain in history.');
    if (!confirmed) return;

    setSaving(true);
    try {
      const nextStages = stages
        .filter((stage) => stage.id !== stageId)
        .map((stage, index) => ({ ...stage, order: index, updatedAt: Date.now() }));
      await persistProjectUpdates({ stages: nextStages });
      await writeProjectAudit('stage.deleted', {
        entityType: 'stage',
        entityId: stageId,
        oldValue: stages.find((stage) => stage.id === stageId),
      });
      setProject({ ...project, stages: nextStages, updatedAt: Date.now() });
      if (selectedStageId === stageId) {
        setSelectedStageId(nextStages[0]?.id || '');
      }
    } catch (err: any) {
      console.error('Failed to delete stage:', err);
      setError(err.message || 'Failed to delete stage.');
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (stageId: string, direction: -1 | 1) => {
    if (!project) return;
    const index = stages.findIndex((stage) => stage.id === stageId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= stages.length) return;

    const nextStages = [...stages];
    [nextStages[index], nextStages[targetIndex]] = [nextStages[targetIndex], nextStages[index]];
    const orderedStages = nextStages.map((stage, order) => ({ ...stage, order, updatedAt: Date.now() }));

    setSaving(true);
    try {
      await persistProjectUpdates({ stages: orderedStages });
      await writeProjectAudit('stage.reordered', {
        entityType: 'stage',
        entityId: stageId,
        newValue: orderedStages.map((stage) => ({ id: stage.id, order: stage.order })),
      });
      setProject({ ...project, stages: orderedStages, updatedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to reorder stages:', err);
      setError(err.message || 'Failed to reorder stages.');
    } finally {
      setSaving(false);
    }
  };

  const saveProgressUpdate = async () => {
    if (!project || !selectedStage) return;
    if (!progressNote.trim()) {
      setError('Add a progress note before saving the update.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const nextValue = Math.max(0, Math.min(100, Number(progressValue) || 0));
      if (nextValue >= 100 && selectedStage.progress < 100) {
        const confirmed = window.confirm('Mark this stage complete at 100% progress?');
        if (!confirmed) {
          setSaving(false);
          return;
        }
      }
      const nextStages = stages.map((stage) => {
        if (stage.id !== selectedStage.id) return stage;
        return {
          ...stage,
          progress: nextValue,
          status: nextValue >= 100 ? 'completed' : stage.status === 'planned' ? 'active' : stage.status,
          startedAt: stage.startedAt || now,
          completedAt: nextValue >= 100 ? now : stage.completedAt || null,
          updatedAt: now,
        } satisfies ProjectStage;
      });

      const update: ProjectProgressUpdate = {
        id: `progress_${now}`,
        stageId: selectedStage.id,
        stageTitle: selectedStage.title,
        previousProgress: selectedStage.progress || 0,
        nextProgress: nextValue,
        note: progressNote.trim(),
        createdAt: now,
        createdByName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
      };

      const nextUpdates = [update, ...progressUpdates];

      await persistProjectUpdates({
        stages: nextStages,
        progressUpdates: nextUpdates,
        status: nextValue >= 100 && nextStages.every((stage) => stage.progress >= 100) ? 'completed' : project.status,
        completedAt: nextStages.every((stage) => stage.progress >= 100) ? now : project.completedAt || null,
      });
      await writeProjectAudit('stage.progress_updated', {
        entityType: 'stage',
        entityId: selectedStage.id,
        reason: progressNote.trim(),
        oldValue: { progress: selectedStage.progress || 0, status: selectedStage.status },
        newValue: {
          progress: nextValue,
          status: nextStages.find((stage) => stage.id === selectedStage.id)?.status,
        },
      });
      await notifyProjectOwner(
        'Project progress updated',
        `${project.name}: ${selectedStage.title} moved from ${selectedStage.progress || 0}% to ${nextValue}%.`,
        'success'
      );

      setProject({
        ...project,
        stages: nextStages,
        progressUpdates: nextUpdates,
        status: nextStages.every((stage) => stage.progress >= 100) ? 'completed' : project.status,
        completedAt: nextStages.every((stage) => stage.progress >= 100) ? now : project.completedAt || null,
        updatedAt: now,
      });
      setProgressNote('');
    } catch (err: any) {
      console.error('Failed to save progress update:', err);
      setError(err.message || 'Failed to save progress update.');
    } finally {
      setSaving(false);
    }
  };

  const saveAttachment = async () => {
    if (!project || !ownerId || !projectId) return;
    if (!attachmentForm.stageId || !attachmentForm.title.trim() || !attachmentForm.description.trim() || !attachmentForm.reason.trim()) {
      setError('Attachment requires a stage, title, description, and reason.');
      return;
    }
    if (!attachmentFile) {
      setError('Choose a file or image before saving the attachment.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const safeFileName = attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `project-attachments/${ownerId}/${projectId}/${now}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);
      const upload = await uploadBytes(storageRef, attachmentFile);
      const url = await getDownloadURL(upload.ref);

      const attachment: ProjectAttachment = {
        id: `attachment_${now}`,
        stageId: attachmentForm.stageId,
        title: attachmentForm.title.trim(),
        description: attachmentForm.description.trim(),
        reason: attachmentForm.reason.trim(),
        fileName: attachmentFile.name,
        fileType: attachmentFile.type || 'application/octet-stream',
        fileSize: attachmentFile.size,
        storagePath,
        url,
        createdAt: now,
        createdByName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
      };

      const nextAttachments = [attachment, ...attachments];
      await persistProjectUpdates({ attachments: nextAttachments });
      await writeProjectAudit('attachment.added', {
        entityType: 'attachment',
        entityId: attachment.id,
        newValue: attachment,
      });
      setProject({ ...project, attachments: nextAttachments, updatedAt: now });
      setAttachmentForm({ ...emptyAttachmentForm, stageId: attachmentForm.stageId });
      setAttachmentFile(null);
    } catch (err: any) {
      console.error('Failed to save attachment:', err);
      setError(err.message || 'Failed to save attachment.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    if (!project) return;
    const attachment = attachments.find((item) => item.id === attachmentId);
    if (!attachment) return;
    const confirmed = window.confirm('Delete this attachment?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      if (attachment.storagePath) {
        await deleteObject(ref(storage, attachment.storagePath)).catch((err) => {
          console.warn('Attachment file delete skipped:', err);
        });
      }
      const nextAttachments = attachments.filter((item) => item.id !== attachmentId);
      await persistProjectUpdates({ attachments: nextAttachments });
      await writeProjectAudit('attachment.deleted', {
        entityType: 'attachment',
        entityId: attachmentId,
        oldValue: attachment,
      });
      setProject({ ...project, attachments: nextAttachments, updatedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to delete attachment:', err);
      setError(err.message || 'Failed to delete attachment.');
    } finally {
      setSaving(false);
    }
  };

  const saveInternalNote = async () => {
    if (!project) return;
    if (!noteStageId || !noteText.trim()) {
      setError('Choose a stage and write a note before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const note: ProjectInternalNote = {
        id: `note_${now}`,
        stageId: noteStageId,
        text: noteText.trim(),
        adminOnly: true,
        createdAt: now,
        createdByName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
      };
      const nextNotes = [note, ...internalNotes];
      await persistProjectUpdates({ internalNotes: nextNotes });
      await writeProjectAudit('internal_note.added', {
        entityType: 'note',
        entityId: note.id,
        newValue: note,
      });
      setProject({ ...project, internalNotes: nextNotes, updatedAt: now });
      setNoteText('');
    } catch (err: any) {
      console.error('Failed to save internal note:', err);
      setError(err.message || 'Failed to save internal note.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInternalNote = async (noteId: string) => {
    if (!project) return;
    const confirmed = window.confirm('Delete this internal note?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      const deletedNote = internalNotes.find((note) => note.id === noteId);
      const nextNotes = internalNotes.filter((note) => note.id !== noteId);
      await persistProjectUpdates({ internalNotes: nextNotes });
      await writeProjectAudit('internal_note.deleted', {
        entityType: 'note',
        entityId: noteId,
        oldValue: deletedNote,
      });
      setProject({ ...project, internalNotes: nextNotes, updatedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to delete internal note:', err);
      setError(err.message || 'Failed to delete internal note.');
    } finally {
      setSaving(false);
    }
  };

  const resetReportForm = () => {
    setReportForm(getDefaultReportRange());
    setEditingReportId(null);
  };

  const startEditReport = (report: ProjectWeeklyReport) => {
    setEditingReportId(report.id);
    setReportForm({
      weekStart: toDateInputValue(new Date(report.weekStart)),
      weekEnd: toDateInputValue(new Date(report.weekEnd)),
      content: report.content,
    });
    setActiveTab('reports');
  };

  const generateWeeklyDraft = () => {
    if (!project) return;

    const weekStart = parseDateInput(reportForm.weekStart);
    const weekEnd = parseDateInput(reportForm.weekEnd, true);
    const updatesInRange = progressUpdates
      .filter((update) => update.createdAt >= weekStart && update.createdAt <= weekEnd)
      .sort((a, b) => a.createdAt - b.createdAt);

    const stageSummary = stages
      .map((stage) => `- ${stage.title}: ${stage.progress}% (${stage.status})`)
      .join('\n');

    const updateSummary = updatesInRange.length
      ? updatesInRange
          .map(
            (update) =>
              `- ${formatReportDate(update.createdAt)} - ${update.stageTitle}: ${update.previousProgress}% to ${
                update.nextProgress
              }%. ${update.note}`
          )
          .join('\n')
      : '- No progress updates were logged during this week.';

    setReportForm((prev) => ({
      ...prev,
      content: [
        `Weekly report for ${project.name}`,
        `Period: ${formatReportDate(weekStart)} - ${formatReportDate(weekEnd)}`,
        '',
        'Progress summary:',
        stageSummary || '- No stages have been planned yet.',
        '',
        'Updates this week:',
        updateSummary,
        '',
        `Overall progress: ${overallProgress}%`,
      ].join('\n'),
    }));
  };

  const saveWeeklyReport = async (markSent = false) => {
    if (!project) return;
    if (!reportForm.weekStart || !reportForm.weekEnd || !reportForm.content.trim()) {
      setError('Choose a week range and write report content before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const weekStart = parseDateInput(reportForm.weekStart);
      const weekEnd = parseDateInput(reportForm.weekEnd, true);
      const sourceUpdateIds = progressUpdates
        .filter((update) => update.createdAt >= weekStart && update.createdAt <= weekEnd)
        .map((update) => update.id);

      let nextReports: ProjectWeeklyReport[];

      if (editingReportId) {
        nextReports = weeklyReports.map((report) =>
          report.id === editingReportId
            ? {
                ...report,
                weekStart,
                weekEnd,
                content: reportForm.content.trim(),
                sourceUpdateIds,
                status: markSent ? 'sent' : report.status,
                clientVisible: markSent ? true : report.clientVisible,
                sentAt: markSent ? now : report.sentAt || null,
                updatedAt: now,
              }
            : report
        );
      } else {
        const report: ProjectWeeklyReport = {
          id: `report_${now}`,
          weekStart,
          weekEnd,
          content: reportForm.content.trim(),
          status: markSent ? 'sent' : 'draft',
          sourceUpdateIds,
          clientVisible: markSent,
          createdAt: now,
          updatedAt: now,
          createdByName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
          sentAt: markSent ? now : null,
        };
        nextReports = [report, ...weeklyReports];
      }

      nextReports = nextReports.sort((a, b) => b.weekStart - a.weekStart);
      await persistProjectUpdates({ weeklyReports: nextReports });
      const savedReport = editingReportId
        ? nextReports.find((report) => report.id === editingReportId)
        : nextReports.find((report) => report.createdAt === now);
      if (savedReport) {
        await writeProjectAudit(markSent ? 'weekly_report.sent' : editingReportId ? 'weekly_report.updated' : 'weekly_report.created', {
          entityType: 'report',
          entityId: savedReport.id,
          newValue: savedReport,
        });
      }
      if (markSent) {
        await notifyProjectOwner(
          'Weekly report ready',
          `${project.name}: a new weekly report is available for ${formatReportDate(weekStart)} - ${formatReportDate(weekEnd)}.`,
          'success'
        );
      }
      setProject({ ...project, weeklyReports: nextReports, updatedAt: now });
      resetReportForm();
    } catch (err: any) {
      console.error('Failed to save weekly report:', err);
      setError(err.message || 'Failed to save weekly report.');
    } finally {
      setSaving(false);
    }
  };

  const deleteWeeklyReport = async (reportId: string) => {
    if (!project) return;
    const confirmed = window.confirm('Delete this weekly report?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      const deletedReport = weeklyReports.find((report) => report.id === reportId);
      const nextReports = weeklyReports.filter((report) => report.id !== reportId);
      await persistProjectUpdates({ weeklyReports: nextReports });
      await writeProjectAudit('weekly_report.deleted', {
        entityType: 'report',
        entityId: reportId,
        oldValue: deletedReport,
      });
      setProject({ ...project, weeklyReports: nextReports, updatedAt: Date.now() });
      if (editingReportId === reportId) resetReportForm();
    } catch (err: any) {
      console.error('Failed to delete weekly report:', err);
      setError(err.message || 'Failed to delete weekly report.');
    } finally {
      setSaving(false);
    }
  };

  const generateFinalReport = () => {
    if (!project) return;

    const stageLines = stages.length
      ? stages
          .map(
            (stage, index) =>
              `${index + 1}. ${stage.title} - ${stage.status}, ${stage.progress}% complete, assigned to ${
                stage.assignedTo || 'unassigned'
              }, estimated ${stage.estimatedDays || 0} days.`
          )
          .join('\n')
      : 'No stages were planned.';

    const progressLines = progressUpdates.length
      ? progressUpdates
          .slice()
          .sort((a, b) => a.createdAt - b.createdAt)
          .map(
            (update) =>
              `- ${formatReportDate(update.createdAt)} - ${update.stageTitle}: ${update.previousProgress}% to ${
                update.nextProgress
              }%. ${update.note}`
          )
          .join('\n')
      : 'No progress updates were logged.';

    const reportLines = weeklyReports.length
      ? weeklyReports
          .filter((report) => report.status === 'sent')
          .map((report) => `- ${formatReportDate(report.weekStart)} - ${formatReportDate(report.weekEnd)}: sent`)
          .join('\n')
      : 'No weekly reports were sent.';

    const attachmentLines = attachments.length
      ? attachments.map((attachment) => `- ${attachment.title}: ${attachment.fileName}`).join('\n')
      : 'No dashboard attachments were added.';

    const noteLines = internalNotes.length
      ? internalNotes.map((note) => `- ${formatReportDate(note.createdAt)}: ${note.text}`).join('\n')
      : 'No internal notes were added.';

    setFinalReportContent(
      [
        `Final project report for ${project.name}`,
        `Client: ${project.ownerName} (${project.ownerEmail})`,
        `Generated: ${formatReportDate(Date.now())}`,
        `Overall progress: ${overallProgress}%`,
        '',
        'Stages:',
        stageLines,
        '',
        'Progress history:',
        progressLines,
        '',
        'Weekly reports:',
        reportLines,
        '',
        'Dashboard attachments:',
        attachmentLines,
        '',
        'Internal admin notes:',
        noteLines,
      ].join('\n')
    );
  };

  const saveFinalReport = async () => {
    if (!project || !finalReportContent.trim()) {
      setError('Generate or write a final report before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const finalReport = {
        content: finalReportContent.trim(),
        generatedAt: project.finalReport?.generatedAt || now,
        approvedAt: project.finalReport?.approvedAt || null,
        approvedByName: project.finalReport?.approvedByName || '',
      };
      await persistProjectUpdates({ finalReport });
      await writeProjectAudit('final_report.saved', {
        newValue: finalReport,
      });
      setProject({ ...project, finalReport, updatedAt: now });
    } catch (err: any) {
      console.error('Failed to save final report:', err);
      setError(err.message || 'Failed to save final report.');
    } finally {
      setSaving(false);
    }
  };

  const approveProjectCompletion = async () => {
    if (!project || !canApproveCompletion) return;
    if (!finalReportContent.trim()) {
      setError('Save a final report before approving completion.');
      return;
    }
    const confirmed = window.confirm('Approve final completion for this project?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      const now = Date.now();
      const finalReport = {
        content: finalReportContent.trim(),
        generatedAt: project.finalReport?.generatedAt || now,
        approvedAt: now,
        approvedByName: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
      };
      await persistProjectUpdates({
        finalReport,
        status: 'completed',
        completedAt: now,
      });
      await writeProjectAudit('project.completed', {
        newValue: { status: 'completed', completedAt: now, finalReport },
      });
      await notifyProjectOwner(
        'Project completed',
        `${project.name} has been marked complete by the Raiyansoft team.`,
        'success'
      );
      setProject({ ...project, finalReport, status: 'completed', completedAt: now, updatedAt: now });
    } catch (err: any) {
      console.error('Failed to approve completion:', err);
      setError(err.message || 'Failed to approve project completion.');
    } finally {
      setSaving(false);
    }
  };

  return {
    project,
    stages,
    employees,
    progressUpdates,
    weeklyReports,
    attachments,
    internalNotes,
    selectedStage,
    completedStages,
    completionChecks,
    canApproveCompletion,
    overallProgress,
    activeTab,
    setActiveTab,
    loading,
    saving,
    error,
    setError,
    stageForm,
    setStageForm,
    editingStageId,
    selectedStageId,
    setSelectedStageId,
    progressValue,
    setProgressValue,
    progressNote,
    setProgressNote,
    attachmentForm,
    setAttachmentForm,
    attachmentFile,
    setAttachmentFile,
    noteStageId,
    setNoteStageId,
    noteText,
    setNoteText,
    reportForm,
    setReportForm,
    editingReportId,
    finalReportContent,
    setFinalReportContent,
    loadProject,
    saveStage,
    deleteStage,
    moveStage,
    startEditStage,
    resetStageForm,
    saveProgressUpdate,
    saveAttachment,
    deleteAttachment,
    saveInternalNote,
    deleteInternalNote,
    generateWeeklyDraft,
    saveWeeklyReport,
    deleteWeeklyReport,
    startEditReport,
    resetReportForm,
    generateFinalReport,
    saveFinalReport,
    approveProjectCompletion,
  };
}
