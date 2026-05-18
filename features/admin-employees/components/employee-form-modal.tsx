import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Copy, Lock, RefreshCw, Loader2, Save } from 'lucide-react';
import { AdminUser } from '@/lib/adminStore';
import { Role } from '@/lib/roleStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getEmployeeSchema, EmployeeValues } from '../schemas/employee.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

interface EmployeeFormModalProps {
  onClose: () => void;
  editingAdmin: AdminUser | null;
  createdPassword: string | null;
  formData: EmployeeValues;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeValues>>;
  roles: Role[];
  onSubmit: (data: EmployeeValues) => Promise<void>;
  generatePassword: () => void;
  isSubmitting: boolean;
}

export default function EmployeeFormModal({
  onClose,
  editingAdmin,
  createdPassword,
  formData,
  setFormData,
  roles,
  onSubmit,
  generatePassword,
  isSubmitting,
}: EmployeeFormModalProps) {
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(getEmployeeSchema(!!editingAdmin)),
    defaultValues: formData,
  });

  // Sync RHF changes back to parent state
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value as any);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormData]);

  // Sync parent password changes (from Generate) back to RHF
  useEffect(() => {
    if (formData.password !== form.getValues('password')) {
      form.setValue('password', formData.password || '');
    }
  }, [formData.password, form]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{editingAdmin ? 'Edit Admin' : 'Add Admin'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {createdPassword ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Created!</h3>
            <p className="text-slate-400 text-sm mb-6">
              The account is ready. Please copy the password below.
            </p>

            <div className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
              <span className="font-mono text-white text-lg">{createdPassword}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdPassword);
                  alert('Copied!');
                }}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="empForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>First Name <span className="text-red-400">*</span></FieldLabel>
                        <input
                          {...field}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none ${
                            fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                          }`}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Last Name <span className="text-red-400">*</span></FieldLabel>
                        <input
                          {...field}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none ${
                            fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                          }`}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Email <span className="text-red-400">*</span></FieldLabel>
                      <input
                        {...field}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none ${
                          fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Phone</FieldLabel>
                      <input
                        {...field}
                        type="tel"
                        dir="ltr"
                        aria-invalid={fieldState.invalid}
                        className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none ${
                          fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {!editingAdmin ? (
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Password <span className="text-red-400">*</span></FieldLabel>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                              {...field}
                              type="text"
                              aria-invalid={fieldState.invalid}
                              className={`w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none font-mono ${
                                fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                              }`}
                              placeholder="Min 8 characters"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={generatePassword}
                            className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white px-3 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <RefreshCw size={16} />
                            <span className="text-xs hidden sm:inline">Generate</span>
                          </button>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="roleId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Role <span className="text-red-400">*</span></FieldLabel>
                        <select
                          {...field}
                          aria-invalid={fieldState.invalid}
                          className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none ${
                            fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                          }`}
                        >
                          <option value="" disabled>
                            Select Role
                          </option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Status</FieldLabel>
                        <select
                          {...field}
                          aria-invalid={fieldState.invalid}
                          className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none ${
                            fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm"
              >
                Cancel
              </button>
              <button
                form="empForm"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{editingAdmin ? 'Update' : 'Create'} Admin</span>
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
