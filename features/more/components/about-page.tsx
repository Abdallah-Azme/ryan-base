import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Globe, ChevronRight } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { useTranslation } from '@/lib/i18nContext';

export default function AboutPage() {
  const router = useRouter();
  const { t, dir } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24"
    >
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => router.push('/more')}
          className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <h1 className="text-lg font-bold text-white ms-2">{t('more.about')}</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center justify-center pt-6">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <SafeImage
              src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
              className="w-full h-full object-contain relative z-10"
              alt="Raiyansoft Logo"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Raiyansoft®</h2>
          <p className="text-sm text-slate-400 font-medium">Innovating Digital Solutions</p>
        </div>

        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Raiyansoft is a leading software development company based in Kuwait, specializing in mobile applications,
            web platforms, and enterprise solutions.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            We empower businesses with cutting-edge technology, from e-commerce platforms to custom CRM systems,
            ensuring scalability and performance.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Contact Us</h3>
          <div className="space-y-3">
            <a
              href="mailto:support@raiyansoft.com"
              className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors"
            >
              <Mail size={18} className="text-primary" />
              <span className="text-sm text-slate-300">support@raiyansoft.com</span>
            </a>
            <a
              href="https://raiyansoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors"
            >
              <Globe size={18} className="text-primary" />
              <span className="text-sm text-slate-300">www.raiyansoft.com</span>
            </a>
          </div>
        </div>

        <div className="text-center pt-8 opacity-40">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Designed & Developed in Kuwait</p>
        </div>
      </div>
    </motion.div>
  );
}
