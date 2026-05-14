import React from 'react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';

interface ClaimFormProps {
  formData: any;
  setFormData: (val: any) => void;
  showEmailError: boolean;
  status: string;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export default function ClaimForm({
  formData,
  setFormData,
  showEmailError,
  status,
  onSubmit,
  t,
}: ClaimFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 ms-1">{t('auth.firstname')}</label>
          <div className="relative">
            <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              required
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 ms-1">{t('auth.lastname')}</label>
          <div className="relative">
            <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              required
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 ms-1">{t('auth.phone')}</label>
        <PhoneInput
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 ms-1">{t('auth.email')}</label>
        <div className="relative">
          <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            required
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
              showEmailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
            }`}
          />
        </div>
        {showEmailError ? <p className="text-xs text-red-400 ms-1 mt-1">{t('val.req_email')}</p> : null}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 ms-1">{t('auth.password')}</label>
        <div className="relative">
          <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            required
            type="password"
            dir="ltr"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

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
