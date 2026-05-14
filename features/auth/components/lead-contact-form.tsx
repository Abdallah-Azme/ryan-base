import React from 'react';
import { User, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import Input from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';

interface LeadContactFormProps {
  formData: {
    firstName: string;
    phone: string;
    email?: string;
  };
  onChange: (key: string, val: string) => void;
}

export default function LeadContactForm({ formData, onChange }: LeadContactFormProps) {
  const { t, dir } = useTranslation();

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar pb-24">
      <h2 className="text-2xl font-bold text-white mb-2">{t('lead_contact.title')}</h2>
      <p className="text-slate-400 text-sm mb-6">{t('lead_contact.subtitle')}</p>

      <div className="space-y-4">
        <Input
          label={t('lead_contact.fullname')}
          value={formData.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          icon={<User size={16} />}
          placeholder="John Doe"
          dir={dir}
        />

        <div className="space-y-1">
          <label className="text-xs text-slate-400 ms-1 font-medium">{t('lead_contact.phone')}</label>
          <PhoneInput value={formData.phone} onChange={(val) => onChange('phone', val)} required />
        </div>

        <Input
          label={t('lead_contact.email_opt')}
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          icon={<Mail size={16} />}
          placeholder="john@example.com"
          dir="ltr"
        />
      </div>
    </div>
  );
}
