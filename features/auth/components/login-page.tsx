import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { useTranslation } from '@/lib/i18nContext';
import { guestStore } from '@/lib/guestStore';
import Button from '@/components/ui/button';
import { useLogin } from '../hooks/use-login';
import LoginForm from './login-form';

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage, dir } = useTranslation();
  const {
    error,
    loading,
    resetLoading,
    successMessage,
    login,
    forgotPassword,
  } = useLogin();

  const handleGuestLogin = () => {
    guestStore.setGuest(true);
    router.push('/home');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-full p-6 pt-8 pb-10 relative overflow-y-auto no-scrollbar"
    >
      <div className="w-full">
        <div className="flex justify-center mb-10">
          <SafeImage
            src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.welcome')}</h1>
          <p className="text-slate-400 text-sm">{t('auth.signin_subtitle')}</p>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 mb-5"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-red-400 text-xs font-bold">{error.message}</span>
          </motion.div>
        ) : null}

        {successMessage ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 mb-5"
          >
            <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-emerald-400 text-xs font-bold">{successMessage}</span>
          </motion.div>
        ) : null}

        <LoginForm
          loading={loading}
          resetLoading={resetLoading}
          onLogin={login}
          onForgotPassword={forgotPassword}
        />

        <Button
          variant="outline"
          onClick={handleGuestLogin}
          className="w-full mt-7 flex items-center justify-center gap-2"
        >
          <span>{t('auth.continue_guest')}</span>
          <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
        <button
          type="button"
          onClick={() => router.push('/signup')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {t('auth.no_account')} <span className="text-primary">{t('auth.signup_link')}</span>
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
