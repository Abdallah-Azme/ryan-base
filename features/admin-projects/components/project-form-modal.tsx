import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Save } from 'lucide-react';
import { Project } from '@/lib/projectStore';

interface ProjectFormModalProps {
  onClose: () => void;
  editingProject: Project | null;
  formData: {
    name: string;
    description: string;
    link: string;
    logoUrl: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      link: string;
      logoUrl: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProjectFormModal({
  onClose,
  editingProject,
  formData,
  setFormData,
  onSubmit,
  onFileChange,
}: ProjectFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="projectForm" onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. Raiyan CRM"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Short Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                maxLength={120}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none"
                placeholder="Brief overview (max 120 chars)"
              />
              <div className="text-right text-[10px] text-slate-500">
                {formData.description.length}/120
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Project URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.link}
                onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1">Project Logo</label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="Paste image URL..."
                />
                <label className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors">
                  <ImageIcon size={20} className="text-slate-400" />
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
              </div>

              {formData.logoUrl ? (
                <div className="mt-2 w-16 h-16 bg-slate-800 rounded-xl border border-white/10 overflow-hidden relative group">
                  <div className="relative w-full h-full">
                    <Image src={formData.logoUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white">Preview</span>
                  </div>
                </div>
              ) : null}
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
            form="projectForm"
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors"
          >
            <Save size={16} />
            <span>Save Project</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
