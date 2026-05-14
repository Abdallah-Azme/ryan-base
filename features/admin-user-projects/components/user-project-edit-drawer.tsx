import React from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Activity, Link as LinkIcon, Loader2, Save } from 'lucide-react';
import { UserProject, ProjectStatus } from '@/lib/userProjectsStore';
import { INDUSTRIES, statusOptions } from '../hooks/use-admin-user-projects';
import PriceDurationFields from './price-duration-fields';

interface UserProjectEditDrawerProps {
  editingProject: UserProject | null;
  onClose: () => void;
  formData: {
    name: string;
    description: string;
    estimatedPrice: string | number;
    estimatedDuration: string | number;
    status: ProjectStatus;
    projectUrl: string;
    industry: string;
    industryOther: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      estimatedPrice: string | number;
      estimatedDuration: string | number;
      status: ProjectStatus;
      projectUrl: string;
      industry: string;
      industryOther: string;
    }>
  >;
  onSave: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export default function UserProjectEditDrawer({
  editingProject,
  onClose,
  formData,
  setFormData,
  onSave,
  isSaving,
}: UserProjectEditDrawerProps) {
  if (!editingProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit User Project</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="editForm" onSubmit={onSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Project Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Industry</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                >
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.industry === 'Other' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 ml-1">Specify Industry</label>
                <input
                  type="text"
                  value={formData.industryOther}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industryOther: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g. Automotive"
                />
              </div>
            ) : null}

            <PriceDurationFields
              estimatedPrice={formData.estimatedPrice}
              estimatedDuration={formData.estimatedDuration}
              setFormData={setFormData}
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Project Status</label>
              <div className="relative">
                <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))
                  }
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none capitalize"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Project URL</label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Description</label>
              <textarea
                maxLength={250}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            form="editForm"
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
