'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  Lock,
  Edit2,
  ExternalLink,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Send,
  StickyNote,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import Button from '@/components/ui/button';
import { ProjectStage, ProjectStageStatus } from '@/lib/userProjectsStore';
import {
  ProjectDetailTab,
  useAdminProjectOperations,
} from '../hooks/use-admin-project-operations';

interface AdminUserProjectDetailPageProps {
  ownerId?: string;
  projectId?: string;
}

const tabs: { id: ProjectDetailTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'plan', label: 'Plan', icon: ClipboardCheck },
  { id: 'progress', label: 'Progress', icon: CheckCircle2 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'files', label: 'Files & Notes', icon: Paperclip },
  { id: 'final', label: 'Final Report', icon: FolderKanban },
];

const stageStatusClasses: Record<ProjectStageStatus, string> = {
  planned: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  active: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const formatDate = (value?: number | null) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-UK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-slate-400 font-medium ms-1">{children}</label>
);

const inputClasses =
  'w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none transition-colors';

function StatusPill({ status }: { status: string }) {
  const color =
    status === 'completed'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : status === 'cancelled' || status === 'blocked'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : status === 'active'
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-slate-500/10 text-slate-300 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${color}`}>
      {status}
    </span>
  );
}

function StageCard({
  stage,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
}: {
  stage: ProjectStage;
  index: number;
  total: number;
  onEdit: (stage: ProjectStage) => void;
  onDelete: (stageId: string) => void;
  onMove: (stageId: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
            <span className="text-sm font-bold">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-white font-bold break-words">{stage.title}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                  stageStatusClasses[stage.status]
                }`}
              >
                {stage.status}
              </span>
            </div>
            {stage.description ? (
              <p className="text-sm text-slate-400 leading-relaxed">{stage.description}</p>
            ) : (
              <p className="text-sm text-slate-600">No description added.</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <UserRound size={13} /> {stage.assignedTo || 'Unassigned'}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {stage.estimatedDays ? `${stage.estimatedDays} days` : 'No estimate'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={13} /> Updated {formatDate(stage.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onMove(stage.id, -1)}
            disabled={index === 0}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
            title="Move up"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            onClick={() => onMove(stage.id, 1)}
            disabled={index === total - 1}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
            title="Move down"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(stage)}
            className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
            title="Edit stage"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(stage.id)}
            className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
            title="Delete stage"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progress</span>
          <span className="text-white font-bold">{stage.progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${stage.progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminUserProjectDetailPage({
  ownerId,
  projectId,
}: AdminUserProjectDetailPageProps) {
  const router = useRouter();
  const ops = useAdminProjectOperations(ownerId, projectId);

  if (ops.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <Loader2 size={32} className="animate-spin mb-4 text-primary" />
        <p>Loading project operations...</p>
      </div>
    );
  }

  if (!ops.project) {
    return (
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 text-center">
        <AlertTriangle className="mx-auto text-red-400 mb-4" size={32} />
        <h1 className="text-xl font-bold text-white mb-2">Project not found</h1>
        <p className="text-slate-400 text-sm mb-6">{ops.error || 'Unable to load this project.'}</p>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/user-projects')}>
          Back to User Projects
        </Button>
      </div>
    );
  }

  const project = ops.project;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => router.push('/admin/user-projects')}
          className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 w-fit transition-colors"
        >
          <ArrowLeft size={16} />
          Back to User Projects
        </button>

        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white shrink-0 shadow-inner"
                style={{ background: project.brandColor || project.iconBg || '#1DB7F0' }}
              >
                <LayoutGrid size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white break-words">{project.name}</h1>
                  <StatusPill status={project.status || 'pricing'} />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                  {project.description || 'No project description has been added yet.'}
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                  <span>{project.ownerName}</span>
                  <span>{project.ownerEmail}</span>
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={ops.loadProject}>
              <RefreshCw size={16} className="me-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-white">{ops.overallProgress}%</p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Stages</p>
              <p className="text-2xl font-bold text-white">
                {ops.completedStages}/{ops.stages.length}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Estimated Price</p>
              <p className="text-lg font-bold text-white">
                {project.estimatedPrice ? `${project.estimatedPrice.toLocaleString()} KWD` : 'Not set'}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Estimated Duration</p>
              <p className="text-lg font-bold text-white">
                {project.estimatedDuration ? `${project.estimatedDuration} days` : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {ops.error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div className="min-w-0">
            <h3 className="text-red-400 font-bold text-sm">Action needed</h3>
            <p className="text-red-400/80 text-xs mt-1">{ops.error}</p>
          </div>
          <button type="button" onClick={() => ops.setError(null)} className="ms-auto text-red-300 text-xs">
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex overflow-x-auto no-scrollbar bg-slate-800/50 p-1 rounded-xl w-fit max-w-full border border-white/5">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => ops.setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              ops.activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {ops.activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Project Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Industry', project.industry === 'Other' ? project.industryOther || 'Other' : project.industry || 'Not set'],
                ['Platforms', project.platforms?.join(', ') || 'Not set'],
                ['Languages', project.languages?.join(', ') || 'Not set'],
                ['Markets', project.markets?.join(', ') || 'Not set'],
                ['Service Model', project.serviceModel || 'Not set'],
                ['Closest App', project.closestApp || 'Not set'],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Recent Updates</h2>
            {ops.progressUpdates.length === 0 ? (
              <p className="text-sm text-slate-500">No progress updates have been logged yet.</p>
            ) : (
              <div className="space-y-4">
                {ops.progressUpdates.slice(0, 4).map((update) => (
                  <div key={update.id} className="border-l border-primary/30 ps-3">
                    <p className="text-sm font-medium text-white">{update.stageTitle}</p>
                    <p className="text-xs text-slate-500">
                      {update.previousProgress}% to {update.nextProgress}% on {formatDate(update.createdAt)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{update.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {ops.activeTab === 'plan' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            {ops.stages.length === 0 ? (
              <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center text-slate-500">
                <ClipboardCheck size={32} className="mx-auto mb-4 text-slate-600" />
                <p>No stages have been planned yet.</p>
              </div>
            ) : (
              ops.stages.map((stage, index) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  total={ops.stages.length}
                  onEdit={ops.startEditStage}
                  onDelete={ops.deleteStage}
                  onMove={ops.moveStage}
                />
              ))
            )}
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{ops.editingStageId ? 'Edit Stage' : 'Add Stage'}</h2>
              {ops.editingStageId ? (
                <button type="button" onClick={ops.resetStageForm} className="text-xs text-slate-400 hover:text-white">
                  Clear
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Stage Title</FieldLabel>
                <input
                  value={ops.stageForm.title}
                  onChange={(e) => ops.setStageForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={inputClasses}
                  placeholder="Design approval"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={ops.stageForm.description}
                  onChange={(e) => ops.setStageForm((prev) => ({ ...prev, description: e.target.value }))}
                  className={`${inputClasses} h-24 resize-none`}
                  placeholder="What must happen in this stage?"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Responsible Person</FieldLabel>
                <select
                  value={ops.stageForm.assignedTo}
                  onChange={(e) => ops.setStageForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="">Unassigned</option>
                  {ops.employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                  {ops.stageForm.assignedTo &&
                  !ops.employees.some((employee) => employee.name === ops.stageForm.assignedTo) ? (
                    <option value={ops.stageForm.assignedTo}>{ops.stageForm.assignedTo}</option>
                  ) : null}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FieldLabel>Days</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={ops.stageForm.estimatedDays}
                    onChange={(e) => ops.setStageForm((prev) => ({ ...prev, estimatedDays: e.target.value }))}
                    className={inputClasses}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Status</FieldLabel>
                  <select
                    value={ops.stageForm.status}
                    onChange={(e) =>
                      ops.setStageForm((prev) => ({ ...prev, status: e.target.value as ProjectStageStatus }))
                    }
                    className={inputClasses}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <Button
                type="button"
                onClick={ops.saveStage}
                isLoading={ops.saving}
                disabled={!ops.stageForm.title.trim()}
                className="w-full gap-2"
              >
                {ops.editingStageId ? <Save size={16} /> : <Plus size={16} />}
                {ops.editingStageId ? 'Save Stage' : 'Add Stage'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {ops.activeTab === 'progress' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit">
            <h2 className="text-lg font-bold text-white mb-5">Update Stage Progress</h2>
            {ops.stages.length === 0 ? (
              <p className="text-sm text-slate-500">Add stages in the Plan tab before logging progress.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <FieldLabel>Stage</FieldLabel>
                  <select
                    value={ops.selectedStageId}
                    onChange={(e) => ops.setSelectedStageId(e.target.value)}
                    className={inputClasses}
                  >
                    {ops.stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Progress</FieldLabel>
                    <span className="text-white font-bold text-sm">{ops.progressValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={ops.progressValue}
                    onChange={(e) => ops.setProgressValue(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ops.progressValue}
                    onChange={(e) => ops.setProgressValue(Number(e.target.value))}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Progress Note</FieldLabel>
                  <textarea
                    value={ops.progressNote}
                    onChange={(e) => ops.setProgressNote(e.target.value)}
                    className={`${inputClasses} h-28 resize-none`}
                    placeholder="Summarize what changed before saving."
                  />
                </div>
                <Button
                  type="button"
                  onClick={ops.saveProgressUpdate}
                  isLoading={ops.saving}
                  disabled={!ops.selectedStage || !ops.progressNote.trim()}
                  className="w-full gap-2"
                >
                  <Save size={16} />
                  Save Progress Update
                </Button>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-5">Progress History</h2>
            {ops.progressUpdates.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Clock size={28} className="mx-auto mb-3 text-slate-600" />
                <p>No progress history yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ops.progressUpdates.map((update) => (
                  <div key={update.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="text-white font-bold text-sm">{update.stageTitle}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(update.createdAt)} by {update.createdByName || 'Admin'}
                        </p>
                      </div>
                      <span className="text-xs text-primary font-bold">
                        {update.previousProgress}% to {update.nextProgress}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{update.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {ops.activeTab === 'reports' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {ops.editingReportId ? 'Edit Weekly Report' : 'Draft Weekly Report'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Text-only client report for the selected week.</p>
              </div>
              {ops.editingReportId ? (
                <button type="button" onClick={ops.resetReportForm} className="text-xs text-slate-400 hover:text-white">
                  Clear
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FieldLabel>Week Start</FieldLabel>
                  <input
                    type="date"
                    value={ops.reportForm.weekStart}
                    onChange={(e) => ops.setReportForm((prev) => ({ ...prev, weekStart: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Week End</FieldLabel>
                  <input
                    type="date"
                    value={ops.reportForm.weekEnd}
                    onChange={(e) => ops.setReportForm((prev) => ({ ...prev, weekEnd: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
              </div>

              <Button type="button" variant="outline" onClick={ops.generateWeeklyDraft} className="w-full gap-2">
                <RefreshCw size={16} />
                Generate From Updates
              </Button>

              <div className="space-y-2">
                <FieldLabel>Report Content</FieldLabel>
                <textarea
                  value={ops.reportForm.content}
                  onChange={(e) => ops.setReportForm((prev) => ({ ...prev, content: e.target.value }))}
                  className={`${inputClasses} h-72 resize-none font-mono text-xs leading-relaxed`}
                  placeholder="Write the weekly report text shown to the client."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => ops.saveWeeklyReport(false)}
                  isLoading={ops.saving}
                  disabled={!ops.reportForm.content.trim()}
                  className="gap-2"
                >
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => ops.saveWeeklyReport(true)}
                  isLoading={ops.saving}
                  disabled={!ops.reportForm.content.trim()}
                  className="gap-2"
                >
                  <Send size={16} />
                  Send Report
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Report History</h2>
                <p className="text-xs text-slate-500">Drafts and sent weekly reports for this project.</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-900/70 border border-white/5 rounded-full px-3 py-1">
                {ops.weeklyReports.length} total
              </span>
            </div>

            {ops.weeklyReports.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FileText size={28} className="mx-auto mb-3 text-slate-600" />
                <p>No weekly reports have been created yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ops.weeklyReports.map((report) => (
                  <div key={report.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-white font-bold">
                            {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                              report.status === 'sent'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {report.status}
                          </span>
                          {report.clientVisible ? (
                            <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                              Client visible
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">
                          Updated {formatDate(report.updatedAt)} by {report.createdByName || 'Admin'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(report.content)}
                          className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
                          title="Copy report"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => ops.startEditReport(report)}
                          className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
                          title="Edit report"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => ops.deleteWeeklyReport(report.id)}
                          className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
                          title="Delete report"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
                      {report.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {ops.activeTab === 'files' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Upload size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Stage Attachment</h2>
                  <p className="text-xs text-slate-500">Visible only inside the dashboard.</p>
                </div>
              </div>

              {ops.stages.length === 0 ? (
                <p className="text-sm text-slate-500">Add stages in the Plan tab before attaching files.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FieldLabel>Stage</FieldLabel>
                    <select
                      value={ops.attachmentForm.stageId}
                      onChange={(e) => ops.setAttachmentForm((prev) => ({ ...prev, stageId: e.target.value }))}
                      className={inputClasses}
                    >
                      <option value="">Select stage</option>
                      {ops.stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={ops.attachmentForm.title}
                      onChange={(e) => ops.setAttachmentForm((prev) => ({ ...prev, title: e.target.value }))}
                      className={inputClasses}
                      placeholder="Client brief"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={ops.attachmentForm.description}
                      onChange={(e) => ops.setAttachmentForm((prev) => ({ ...prev, description: e.target.value }))}
                      className={`${inputClasses} h-24 resize-none`}
                      placeholder="Describe what this file contains."
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Reason For Adding</FieldLabel>
                    <textarea
                      value={ops.attachmentForm.reason}
                      onChange={(e) => ops.setAttachmentForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className={`${inputClasses} h-20 resize-none`}
                      placeholder="Why is this attachment needed?"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>File Or Image</FieldLabel>
                    <label className="block border border-dashed border-white/10 hover:border-primary/40 bg-slate-900/50 rounded-2xl p-5 cursor-pointer transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => ops.setAttachmentFile(e.target.files?.[0] || null)}
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400">
                          <Paperclip size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {ops.attachmentFile ? ops.attachmentFile.name : 'Choose a file'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {ops.attachmentFile ? formatFileSize(ops.attachmentFile.size) : 'Images, PDFs, docs, or other project files'}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <Button
                    type="button"
                    onClick={ops.saveAttachment}
                    isLoading={ops.saving}
                    disabled={
                      !ops.attachmentForm.stageId ||
                      !ops.attachmentForm.title.trim() ||
                      !ops.attachmentForm.description.trim() ||
                      !ops.attachmentForm.reason.trim() ||
                      !ops.attachmentFile
                    }
                    className="w-full gap-2"
                  >
                    <Upload size={16} />
                    Save Attachment
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <StickyNote size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Internal Note</h2>
                  <p className="text-xs text-slate-500">Admin-only, never shown to the client.</p>
                </div>
              </div>

              {ops.stages.length === 0 ? (
                <p className="text-sm text-slate-500">Add stages in the Plan tab before adding notes.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FieldLabel>Stage</FieldLabel>
                    <select
                      value={ops.noteStageId}
                      onChange={(e) => ops.setNoteStageId(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">Select stage</option>
                      {ops.stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Note</FieldLabel>
                    <textarea
                      value={ops.noteText}
                      onChange={(e) => ops.setNoteText(e.target.value)}
                      className={`${inputClasses} h-32 resize-none`}
                      placeholder="Write an internal admin note for this stage."
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={ops.saveInternalNote}
                    isLoading={ops.saving}
                    disabled={!ops.noteStageId || !ops.noteText.trim()}
                    className="w-full gap-2"
                  >
                    <Save size={16} />
                    Save Internal Note
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage Attachments</h2>
                  <p className="text-xs text-slate-500">Dashboard-only files grouped by project stage.</p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-900/70 border border-white/5 rounded-full px-3 py-1">
                  {ops.attachments.length} total
                </span>
              </div>

              {ops.attachments.length === 0 ? (
                <div className="text-center py-14 text-slate-500">
                  <Paperclip size={28} className="mx-auto mb-3 text-slate-600" />
                  <p>No attachments added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ops.attachments.map((attachment) => {
                    const stage = ops.stages.find((item) => item.id === attachment.stageId);
                    const isImage = attachment.fileType.startsWith('image/');

                    return (
                      <div key={attachment.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                              {isImage ? <ImageIcon size={18} /> : <Paperclip size={18} />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-white font-bold break-words">{attachment.title}</h3>
                                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                                  {stage?.title || 'Unknown stage'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{attachment.description}</p>
                              <p className="text-xs text-slate-500 mt-2">Reason: {attachment.reason}</p>
                              <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                                <span>{attachment.fileName}</span>
                                <span>{formatFileSize(attachment.fileSize)}</span>
                                <span>{formatDate(attachment.createdAt)}</span>
                                <span>{attachment.createdByName || 'Admin'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
                              title="Open file"
                            >
                              <ExternalLink size={15} />
                            </a>
                            <button
                              type="button"
                              onClick={() => ops.deleteAttachment(attachment.id)}
                              className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
                              title="Delete attachment"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Admin-Only Notes</h2>
                  <p className="text-xs text-slate-500">Internal notes are hidden from clients and non-admin views.</p>
                </div>
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                  Admin only
                </span>
              </div>

              {ops.internalNotes.length === 0 ? (
                <div className="text-center py-14 text-slate-500">
                  <StickyNote size={28} className="mx-auto mb-3 text-slate-600" />
                  <p>No internal notes added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ops.internalNotes.map((note) => {
                    const stage = ops.stages.find((item) => item.id === note.stageId);

                    return (
                      <div key={note.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                                {stage?.title || 'Unknown stage'}
                              </span>
                              <span className="text-xs text-slate-500">{formatDate(note.createdAt)}</span>
                              <span className="text-xs text-slate-500">{note.createdByName || 'Admin'}</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => ops.deleteInternalNote(note.id)}
                            className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors shrink-0"
                            title="Delete note"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {ops.activeTab === 'final' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Completion Checklist</h2>
                <p className="text-xs text-slate-500">All required items must pass before approval.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['Project has stages', ops.completionChecks.hasStages],
                ['All stages are complete', ops.completionChecks.allStagesComplete],
                ['Progress history exists', ops.completionChecks.hasProgressHistory],
                ['At least one weekly report was sent', ops.completionChecks.hasReportHistory],
              ].map(([label, passed]) => (
                <div key={String(label)} className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {passed ? <CheckCircle2 size={15} /> : <Lock size={15} />}
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 mt-5">
              <Button type="button" variant="outline" onClick={ops.generateFinalReport} className="gap-2">
                <RefreshCw size={16} />
                Generate Final Report
              </Button>
              <Button
                type="button"
                onClick={ops.approveProjectCompletion}
                isLoading={ops.saving}
                disabled={!ops.canApproveCompletion || !ops.finalReportContent.trim()}
                className="gap-2"
              >
                <CheckCircle2 size={16} />
                Approve Completion
              </Button>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Final Report</h2>
                <p className="text-xs text-slate-500">Review and edit before approving project completion.</p>
              </div>
              {project.finalReport?.approvedAt ? (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  Approved {formatDate(project.finalReport.approvedAt)}
                </span>
              ) : null}
            </div>

            <textarea
              value={ops.finalReportContent}
              onChange={(event) => ops.setFinalReportContent(event.target.value)}
              className={`${inputClasses} h-[520px] resize-none font-mono text-xs leading-relaxed`}
              placeholder="Generate or write the final project report."
            />

            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={ops.saveFinalReport}
                isLoading={ops.saving}
                disabled={!ops.finalReportContent.trim()}
                className="gap-2"
              >
                <Save size={16} />
                Save Final Report
              </Button>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(ops.finalReportContent)}
                disabled={!ops.finalReportContent.trim()}
                className="inline-flex items-center gap-2 bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white disabled:opacity-50 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlaceholderPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/5">
        <Icon size={28} className="text-slate-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">{text}</p>
    </div>
  );
}
