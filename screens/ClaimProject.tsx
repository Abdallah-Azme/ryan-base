"use client";

// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Loader2, User, Mail, Lock } from 'lucide-react';
import { leadStore } from '../lib/leadStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-client';
import { useTranslation } from '../lib/i18nContext';
import PhoneInput from '../components/PhoneInput';

const ClaimProject: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const { t, dir, language, setLanguage } = useTranslation();

  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'claiming' | 'success'>('validating');
  const [errorMsg, setErrorMsg] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const showEmailError = formData.email.length > 0 && !isEmailValid;

  useEffect(() => {
    if (!token) {
        setStatus('invalid');
        setErrorMsg("Missing token.");
        return;
    }
    
    leadStore.validateToken(token).then(res => {
        if (res.valid && res.leadId) {
            setLeadId(res.leadId);
            setStatus('valid');
        } else {
            setStatus('invalid');
            setErrorMsg(res.error || "Token invalid.");
        }
    });
  }, [token]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'valid' || !token || !leadId) return;
    
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        alert(t('val.req_email'));
        return;
    }

    setStatus('claiming');
    try {
        // 1. Create Auth
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, formData.password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: `${formData.firstName} ${formData.lastName}` });

        // 2. Create User Doc
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

        // 3. Claim Project
        await leadStore.claimProject(token, leadId);

        setStatus('success');
        setTimeout(() => {
            router.push('/home');
        }, 2000);

    } catch (err: any) {
        console.error(err);
        alert("Error: " + err.message);
        setStatus('valid'); // Revert to allow retry
    }
  };

  if (status === 'validating') {
      return (
          <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
              <Loader2 className="animate-spin text-primary" size={40} />
          </div>
      );
  }

  if (status === 'invalid') {
      return (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white p-6 text-center">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-sm">
                <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
                <p className="text-slate-400 text-sm">{errorMsg}</p>
                <button onClick={() => router.push('/')} className="mt-6 text-sm text-white underline">Go Home</button>
            </div>
        </div>
      );
  }

  if (status === 'success') {
      return (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white p-6 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl max-w-sm">
                <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Welcome Aboard!</h1>
                <p className="text-slate-400 text-sm">Your project is ready. Redirecting you to your dashboard...</p>
            </div>
        </div>
      );
  }

  // Valid Token -> Show Signup Form
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col p-6 overflow-y-auto relative" dir={dir}>
       {/* Floating Language Toggle */}
       <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-20">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
       </div>

       <div className="max-w-md mx-auto w-full pt-10 pb-20">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
                <CheckCircle size={32} />
             </div>
             <h1 className="text-2xl font-bold mb-2">Claim Your Project</h1>
             <p className="text-slate-400 text-sm">Create your account to access your approved project dashboard.</p>
          </div>

          <form onSubmit={handleClaim} className="space-y-4">
             {/* Reuse simpler version of Signup Fields */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ms-1">{t('auth.firstname')}</label>
                    <div className="relative">
                        <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                        <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ms-1">{t('auth.lastname')}</label>
                    <div className="relative">
                        <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                        <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
                    </div>
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs text-slate-400 ms-1">{t('auth.phone')}</label>
                <PhoneInput 
                    value={formData.phone}
                    onChange={(val) => setFormData({...formData, phone: val})}
                    required
                />
             </div>

             <div className="space-y-1">
                <label className="text-xs text-slate-400 ms-1">{t('auth.email')}</label>
                <div className="relative">
                    <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                    <input 
                      required 
                      type="email" 
                      dir="ltr" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                        showEmailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                      }`} 
                    />
                </div>
                {showEmailError && (
                  <p className="text-xs text-red-400 ms-1 mt-1">{t('val.req_email')}</p>
                )}
             </div>

             <div className="space-y-1">
                <label className="text-xs text-slate-400 ms-1">{t('auth.password')}</label>
                <div className="relative">
                    <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                    <input required type="password" dir="ltr" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
                </div>
             </div>

             <button 
                type="submit" 
                disabled={status === 'claiming'}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all mt-6 flex items-center justify-center gap-2"
             >
                {status === 'claiming' ? <Loader2 className="animate-spin" /> : "Create Account & Claim"}
             </button>
          </form>
       </div>
    </div>
  );
};

export default ClaimProject;
