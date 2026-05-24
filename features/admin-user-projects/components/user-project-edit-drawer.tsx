import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Activity, Link as LinkIcon, DollarSign, Clock, Loader2, Save } from 'lucide-react';
import { UserProject, ProjectStatus } from '@/lib/userProjectsStore';
import { INDUSTRIES, statusOptions } from '../hooks/use-admin-user-projects';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProjectEditSchema, UserProjectEditValues } from '../schemas/user-project-edit.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

interface UserProjectEditDrawerProps {
  editingProject: UserProject | null;
  onClose: () => void;
  formData: UserProjectEditValues;
  setFormData: React.Dispatch<React.SetStateAction<UserProjectEditValues>>;
  onSave: (data: UserProjectEditValues) => Promise<void>;
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
  const form = useForm<UserProjectEditValues>({
    resolver: zodResolver(userProjectEditSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);



  const industry = form.watch('industry');

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
          <form id="editForm" onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project Name</FieldLabel>
                  <input
                    {...field}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="industry"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Industry</FieldLabel>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {industry === 'Other' ? (
              <Controller
                name="industryOther"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Specify Industry</FieldLabel>
                    <input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                      placeholder="e.g. Automotive"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="estimatedPrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Estimated Price (KWD)</FieldLabel>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        {...field}
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-invalid={fieldState.invalid}
                        className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors ${
                          fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                        placeholder="e.g. 1500"
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="estimatedDuration"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Est. Duration (Days)</FieldLabel>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        {...field}
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-invalid={fieldState.invalid}
                        className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors ${
                          fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                        placeholder="e.g. 21"
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project Status</FieldLabel>
                  <div className="relative">
                    <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none capitalize ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="projectUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project URL</FieldLabel>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      {...field}
                      type="url"
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                      placeholder="https://..."
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    {...field}
                    maxLength={250}
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
