import React from 'react';
import { User, Mail, Lock, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import PhoneInput from '@/components/ui/phone-input';
import PasswordField from './password-field';

interface SignupFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (val: string) => void;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  loading: boolean;
  showEmailError: boolean;
  isPasswordMatch: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignupForm({
  formData,
  handleChange,
  handlePhoneChange,
  agreed,
  setAgreed,
  loading,
  showEmailError,
  isPasswordMatch,
  onSubmit,
}: SignupFormProps) {
  const { t, dir } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('auth.firstname')}
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          icon={<User size={16} />}
          required
          dir={dir}
        />
        <Input
          label={t('auth.lastname')}
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          icon={<User size={16} />}
          required
          dir={dir}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.phone_opt')}</label>
        <PhoneInput value={formData.phone} onChange={handlePhoneChange} required={false} />
      </div>

      <Input
        label={t('auth.email')}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        icon={<Mail size={16} />}
        error={showEmailError ? t('val.req_email') : undefined}
        required
        dir="ltr"
      />

      <PasswordField
        label={t('auth.password')}
        name="password"
        value={formData.password}
        onChange={handleChange}
        icon={<Lock size={16} />}
        required
        dir="ltr"
      />

      <PasswordField
        label={t('auth.confirm_password')}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={<Lock size={16} />}
        error={!isPasswordMatch && formData.confirmPassword.length > 0 ? t('auth.pass_mismatch') : undefined}
        required
        dir="ltr"
      />

      <div className="mt-2">
        <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group w-fit">
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              agreed ? 'bg-primary border-primary' : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="hidden"
            />
            {agreed ? <Check size={14} className="text-white" /> : null}
          </div>
          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
            {t('auth.agree_terms')}
          </span>
        </label>
      </div>

      <Button type="submit" isLoading={loading} disabled={loading} className="w-full py-3.5 mt-4">
        {loading ? t('auth.signup_loading') : t('auth.signup_btn')}
      </Button>
    </form>
  );
}
