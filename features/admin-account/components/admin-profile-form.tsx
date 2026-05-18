import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, CheckCircle, Loader2, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminProfileSchema, AdminProfileValues } from '../schemas/profile.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import Avatar from '@/components/ui/avatar';

interface AdminProfileFormProps {
  defaultValues: AdminProfileValues & { role?: string };
  onSave: (data: AdminProfileValues) => Promise<void>;
  isSaving: boolean;
  success: boolean;
}

export default function AdminProfileForm({
  defaultValues,
  onSave,
  isSaving,
  success,
}: AdminProfileFormProps) {
  const form = useForm<AdminProfileValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const watchedFirstName = form.watch('firstName');
  const watchedLastName = form.watch('lastName');

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden w-full">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-2xl relative">
            <Avatar 
              name={`${watchedFirstName || ''} ${watchedLastName || ''}`.trim() || 'Admin'} 
              size="xl" 
              className="w-full h-full text-3xl" 
            />
            <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-white/10">
              <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-800" title="Active" />
            </div>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
              {defaultValues.role || 'Admin'}
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSave)} className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="uppercase tracking-wider font-bold">First Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                  </div>
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
                  <FieldLabel className="uppercase tracking-wider font-bold">Last Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors ${
                        fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="uppercase tracking-wider font-bold">Phone Number</FieldLabel>
                <div className="relative" dir="ltr">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    {...field}
                    type="tel"
                    aria-invalid={fieldState.invalid}
                    className={`w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors ${
                      fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    placeholder="+965 ..."
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ms-1">Email Address</label>
            <div className="relative opacity-60">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={defaultValues.email || ''}
                disabled
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-400 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 flex items-center gap-1">
                <Lock size={12} /> Read-only
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            {success ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-400 text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle size={16} /> Saved Successfully
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-sky-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
