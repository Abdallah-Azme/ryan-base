'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18nContext';
import { guestStore } from '@/lib/guestStore';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function AuthRequiredModal({ isOpen, onClose, redirectTo }: AuthRequiredModalProps) {
  const router = useRouter();
  const { t, dir } = useTranslation();

  const handleAction = (path: string) => {
    if (redirectTo) {
      guestStore.setIntendedPath(redirectTo);
    }
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          dir={dir}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
          >
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Lock size={32} className="text-primary" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{t('auth.login_required_title')}</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[260px] mx-auto">
              {t('auth.login_required_body')}
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleAction('/login')}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                {t('auth.login_action')}
              </button>

              <button
                type="button"
                onClick={() => handleAction('/signup')}
                className="w-full py-3.5 rounded-xl bg-slate-800 text-white font-medium text-sm border border-white/5 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {t('auth.signup_action')}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
