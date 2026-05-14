import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import ForgotPasswordLink from './forgot-password-link';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  resetLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  resetLoading,
  onLogin,
  onForgotPassword,
}: LoginFormProps) {
  const { t, dir } = useTranslation();

  return (
    <form onSubmit={onLogin} className="space-y-5">
      <Input
        label={t('auth.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail size={18} />}
        required
        dir={dir}
      />

      <div className="space-y-1">
        <Input
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={18} />}
          required
          dir={dir}
        />
        <ForgotPasswordLink onClick={onForgotPassword} isLoading={resetLoading} />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        disabled={loading || resetLoading}
        className="w-full mt-2 py-3.5"
      >
        {loading ? t('auth.signin_loading') : t('auth.signin_btn')}
      </Button>
    </form>
  );
}
