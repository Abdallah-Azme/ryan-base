"use client";

// @ts-nocheck
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import { useTranslation } from '../lib/i18nContext';
import { guestStore } from '../lib/guestStore';

const Login: React.FC = () => {
  const router = useRouter();
  const { t, language, setLanguage, dir } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Determine redirect path handled in App.tsx listener
      // But we can also force it here if App logic is purely reactive
      // App.tsx auth listener is safer.
    } catch (err: any) {
      console.error("Login Error", err);
      let message = t('auth.invalid_cred');
      if (err.code === 'auth/too-many-requests') {
        message = t('auth.too_many_requests');
      }
      setError({ code: err.code, message });
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    guestStore.setGuest(true);
    router.push('/home');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError({ message: t('auth.email_required') });
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(t('auth.reset_email_sent'));
    } catch (err: any) {
      console.error("Reset Password Error", err);
      let message = t('auth.invalid_cred'); 
      if (err.code === 'auth/user-not-found') message = "No account found with this email.";
      else if (err.code === 'auth/invalid-email') message = "Invalid email format.";
      else if (err.code === 'auth/too-many-requests') message = t('auth.too_many_requests');
      
      setError({ code: err.code, message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full p-6 pt-12 relative overflow-y-auto no-scrollbar"
    >
      <div className="w-full shrink-0">
        <div className="flex justify-center mb-8">
          <SafeImage
            src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.welcome')}</h1>
          <p className="text-slate-400 text-sm">{t('auth.signin_subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                required
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading || loading}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {resetLoading && <Loader2 size={10} className="animate-spin" />}
                {t('auth.forgot_password')}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                 <span className="text-red-400 text-xs font-bold">{error.message}</span>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2"
            >
              <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-emerald-400 text-xs font-bold">{successMessage}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || resetLoading}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.signin_loading') : t('auth.signin_btn')}
          </motion.button>
        </form>

        {/* Guest Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGuestLogin}
          className="w-full mt-4 bg-slate-800 text-white font-medium py-3.5 rounded-xl border border-white/5 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>{t('auth.continue_guest')}</span>
          {dir === 'rtl' ? <ArrowRight size={16} className="rotate-180"/> : <ArrowRight size={16} />}
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-4 min-h-[120px]">
        <button
          onClick={() => router.push('/signup')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {t('auth.no_account')} <span className="text-primary">{t('auth.signup_link')}</span>
        </button>

        {/* Language Switcher */}
        <div className="flex bg-slate-800/50 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
              language === 'en' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
              language === 'ar' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            العربية
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
