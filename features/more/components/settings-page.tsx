import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Globe, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage, dir } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24"
    >
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center">
        <button
          type="button"
          onClick={() => router.push('/more')}
          className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <h1 className="text-lg font-bold text-white ms-2">{t('more.settings')}</h1>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-white/5 overflow-hidden shadow-lg mt-2 bg-slate-800/40 backdrop-blur-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-300 border border-white/5">
                <Globe size={20} />
              </div>
              <span className="text-sm font-medium text-white">{t('settings.language')}</span>
            </div>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  language === 'ar' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 px-2">{t('settings.more_options')}</p>
      </div>
    </motion.div>
  );
}
