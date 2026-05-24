import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Save } from 'lucide-react';
import { Project } from '@/lib/projectStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectValues } from '../schemas/project.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

const isValidImageUrl = (url: any): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    if (url.startsWith('/')) return true;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface ProjectFormModalProps {
  onClose: () => void;
  editingProject: Project | null;
  formData: ProjectValues;
  setFormData: React.Dispatch<React.SetStateAction<ProjectValues>>;
  onSubmit: (data: ProjectValues) => void;
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
  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);



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
          <form id="projectForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project Name <span className="text-red-400">*</span></FieldLabel>
                  <input
                    {...field}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    placeholder="e.g. Raiyan CRM"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Short Description <span className="text-red-400">*</span></FieldLabel>
                  <textarea
                    {...field}
                    maxLength={120}
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    placeholder="Brief overview (max 120 chars)"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <span />
                    )}
                    <div className="text-[10px] text-slate-500">
                      {(field.value || '').length}/120
                    </div>
                  </div>
                </Field>
              )}
            />

            <Controller
              name="link"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project URL <span className="text-red-400">*</span></FieldLabel>
                  <input
                    {...field}
                    type="url"
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    placeholder="https://..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="logoUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project Logo</FieldLabel>
                  <div className="flex gap-2">
                    <input
                      {...field}
                      value={field.value || ''}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      className={`flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors text-sm ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                      placeholder="Paste image URL..."
                    />
                    <label className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors shrink-0">
                      <ImageIcon size={20} className="text-slate-400" />
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {isValidImageUrl(field.value) ? (
                    <div className="mt-2 w-16 h-16 bg-slate-800 rounded-xl border border-white/10 overflow-hidden relative group">
                      <div className="relative w-full h-full">
                        <Image src={field.value} alt="Preview" fill className="object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] text-white">Preview</span>
                      </div>
                    </div>
                  ) : null}
                </Field>
              )}
            />
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
