import React from 'react';
import { User, Mail, Lock, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import Button from '@/components/ui/button';
import PhoneInput from '@/components/ui/phone-input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupValues } from '../schemas/signup.schema';
import { Field, FieldLabel, FieldError, PasswordInput } from '@/components/ui/field';

interface SignupFormProps {
  loading: boolean;
  onSubmit: (data: SignupValues) => void;
  defaultValues?: Partial<SignupValues>;
}

export default function SignupForm({
  loading,
  onSubmit,
  defaultValues,
}: SignupFormProps) {
  const { t, dir } = useTranslation();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreed: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('auth.firstname')}</FieldLabel>
              <div className="relative">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
                  <User size={16} />
                </div>
                <input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3.5 text-white border focus:outline-none transition-all ${
                    fieldState.invalid
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-primary'
                  }`}
                  dir={dir}
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
              <FieldLabel>{t('auth.lastname')}</FieldLabel>
              <div className="relative">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
                  <User size={16} />
                </div>
                <input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3.5 text-white border focus:outline-none transition-all ${
                    fieldState.invalid
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-primary'
                  }`}
                  dir={dir}
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
            <FieldLabel>{t('auth.phone_opt')}</FieldLabel>
            <PhoneInput value={field.value || ''} onChange={field.onChange} required={false} />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
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
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
                <Mail size={16} />
              </div>
              <input
                {...field}
                type="email"
                aria-invalid={fieldState.invalid}
                className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3.5 text-white border focus:outline-none transition-all ${
                  fieldState.invalid
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-primary'
                }`}
                dir="ltr"
              />
            </div>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.password')}</FieldLabel>
            <PasswordInput
              {...field}
              aria-invalid={fieldState.invalid}
              icon={<Lock size={16} />}
              dir="ltr"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.confirm_password')}</FieldLabel>
            <PasswordInput
              {...field}
              aria-invalid={fieldState.invalid}
              icon={<Lock size={16} />}
              dir="ltr"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="agreed"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="mt-1">
            <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group w-fit">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  field.value ? 'bg-primary border-primary' : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="hidden"
                />
                {field.value ? <Check size={14} className="text-white" /> : null}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                {t('auth.agree_terms')}
              </span>
            </label>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="mt-2" />
            )}
          </div>
        )}
      />

      <Button type="submit" isLoading={loading} disabled={loading} className="w-full py-3.5 mt-4">
        {loading ? t('auth.signup_loading') : t('auth.signup_btn')}
      </Button>
    </form>
  );
}
