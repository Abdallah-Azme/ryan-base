import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';
import { useSignup } from '../hooks/use-signup';
import SignupForm from './signup-form';

export default function SignupPage() {
  const router = useRouter();
  const { t, dir, language, setLanguage } = useTranslation();
  const {
    error,
    loading,
    signup,
  } = useSignup();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full p-6 pt-8 relative overflow-y-auto no-scrollbar pb-24"
      dir={dir}
    >
      <div className="w-full shrink-0">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="self-start text-slate-400 hover:text-white mb-6 flex items-center space-x-1 rtl:space-x-reverse"
        >
          {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span className="text-sm">{t('auth.back')}</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.create_account')}</h1>
          <p className="text-slate-400 text-sm">{t('auth.signup_subtitle')}</p>
        </div>

        {error ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 mb-4">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-red-400 text-xs font-bold">{error.message}</span>
          </div>
        ) : null}

        <SignupForm
          loading={loading}
          onSubmit={signup}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-4 min-h-[120px]">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {t('auth.back_login')} <span className="text-primary">{t('auth.signin_btn')}</span>
        </button>

        <div className="flex bg-slate-800/50 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
              language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
              language === 'ar' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            العربية
          </button>
        </div>
      </div>
    </motion.div>
  );
}
