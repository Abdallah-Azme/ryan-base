import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import Button from '@/components/ui/button';
import ForgotPasswordLink from './forgot-password-link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '../schemas/login.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

interface LoginFormProps {
  loading: boolean;
  resetLoading: boolean;
  onLogin: (data: LoginValues) => void;
  onForgotPassword: (email: string) => void;
}

export default function LoginForm({
  loading,
  resetLoading,
  onLogin,
  onForgotPassword,
}: LoginFormProps) {
  const { t, dir } = useTranslation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onLogin)} className="flex flex-col">
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('auth.email')}</FieldLabel>
            <div className="relative">
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
                <Mail size={18} />
              </div>
              <input
                {...field}
                type="email"
                aria-invalid={fieldState.invalid}
                className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                  fieldState.invalid
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-primary'
                }`}
                placeholder="name@example.com"
                dir={dir}
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="mt-8 flex flex-col">
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('auth.password')}</FieldLabel>
              <div className="relative">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <input
                  {...field}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                    fieldState.invalid
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-primary'
                  }`}
                  placeholder="••••••"
                  dir={dir}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <ForgotPasswordLink
          onClick={() => onForgotPassword(form.getValues('email'))}
          isLoading={resetLoading}
        />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        disabled={loading || resetLoading}
        className="w-full mt-5"
      >
        {loading ? t('auth.signin_loading') : t('auth.signin_btn')}
      </Button>
    </form>
  );
}
