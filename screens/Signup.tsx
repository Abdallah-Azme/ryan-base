"use client";

// @ts-nocheck
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ChevronLeft, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-client';
import { useTranslation } from '../lib/i18nContext';
import PhoneInput from '../components/PhoneInput';

const Signup: React.FC = () => {
  const router = useRouter();
  const { t, dir, language, setLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (val: string) => {
    setFormData({ ...formData, phone: val });
  };

  const isPasswordMatch = formData.password === formData.confirmPassword && formData.password.length > 0;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const showEmailError = formData.email.length > 0 && !isEmailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      setError({ message: t('val.req_email') });
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError({ message: t('val.req_email') });
      return;
    }

    if (!agreed) {
      setError({ message: 'Please agree to the Terms & Conditions.' });
      return;
    }

    if (!isPasswordMatch) {
      setError({ message: t('auth.pass_mismatch') });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, formData.password);
      const user = userCredential.user;

      // 2. Update Profile Display Name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // 3. Create User Document in Firestore (Root users collection for Dashboard visibility)
      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: trimmedEmail,
          phone: formData.phone,
          role: 'Customer',
          status: 'Active',
          createdAt: serverTimestamp(),
          registeredAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          migrationDone: true 
        });
      }

      router.push('/home');
    } catch (err: any) {
      console.error("Signup Error:", err);
      let message = "Signup failed. Please try again.";
      if (err.code === 'auth/email-already-in-use') message = t('auth.email_in_use');
      else if (err.code === 'auth/weak-password') message = t('auth.weak_pass');
      else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';
      
      setError({ code: err.code, message });
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.firstname')}</label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 ps-10 pe-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.lastname')}</label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 ps-10 pe-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.phone_opt')}</label>
            <PhoneInput 
              value={formData.phone}
              onChange={handlePhoneChange}
              required={false}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                name="email"
                dir="ltr"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-slate-800/50 border rounded-xl py-3 ps-10 pe-4 text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  showEmailError 
                  ? 'border-red-500/50 focus:ring-red-500/30' 
                  : 'border-slate-700/50 focus:ring-primary/50 focus:border-primary'
                }`}
              />
            </div>
            {showEmailError && (
              <p className="text-xs text-red-400 ms-1">{t('val.req_email')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                name="password"
                dir="ltr"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 ps-10 pe-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium ms-1">{t('auth.confirm_password')}</label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                name="confirmPassword"
                dir="ltr"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full bg-slate-800/50 border rounded-xl py-3 ps-10 pe-4 text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  !isPasswordMatch && formData.confirmPassword.length > 0 
                  ? 'border-red-500/50 focus:ring-red-500/30' 
                  : 'border-slate-700/50 focus:ring-primary/50 focus:border-primary'
                }`}
              />
            </div>
            {!isPasswordMatch && formData.confirmPassword.length > 0 && (
              <p className="text-xs text-red-400 ms-1">{t('auth.pass_mismatch')}</p>
            )}
          </div>

          <div className="mt-2">
            <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-primary border-primary' : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-500'}`}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (error?.message.includes("Terms")) setError(null);
                  }}
                  className="hidden"
                />
                {agreed && <Check size={14} className="text-white" />}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                {t('auth.agree_terms')}
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                 <span className="text-red-400 text-xs font-bold">{error.message}</span>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.signup_loading') : t('auth.signup_btn')}
          </motion.button>
        </form>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-4 min-h-[120px]">
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {t('auth.back_login')} <span className="text-primary">{t('auth.signin_btn')}</span>
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

export default Signup;
