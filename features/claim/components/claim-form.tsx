import React from 'react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { claimSchema, ClaimValues } from '../schemas/claim.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

interface ClaimFormProps {
  status: string;
  onSubmit: (data: ClaimValues) => void;
  t: (key: string) => string;
}

export default function ClaimForm({ status, onSubmit, t }: ClaimFormProps) {
  const form = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('auth.firstname')}</FieldLabel>
              <div className="relative">
                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...field}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                    fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                  }`}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('auth.lastname')}</FieldLabel>
              <div className="relative">
                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...field}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                    fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                  }`}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.phone')}</FieldLabel>
            <PhoneInput value={field.value} onChange={field.onChange} required />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.email')}</FieldLabel>
            <div className="relative">
              <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...field}
                type="email"
                dir="ltr"
                aria-invalid={fieldState.invalid}
                className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                  fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.password')}</FieldLabel>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...field}
                type="password"
                dir="ltr"
                aria-invalid={fieldState.invalid}
                className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                  fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <button
        type="submit"
        disabled={status === 'claiming'}
        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all mt-6 flex items-center justify-center gap-2"
      >
        {status === 'claiming' ? <Loader2 className="animate-spin" /> : 'Create Account & Claim'}
      </button>
    </form>
  );
}
