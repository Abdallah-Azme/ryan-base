import React from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardShellProps {
  step: number;
  direction: number;
  totalSteps: number;
  isLoading: boolean;
  errors: string[];
  nextButtonHidden: boolean;
  isLeadMode: boolean;
  isAuthenticated: boolean;
  dir: 'ltr' | 'rtl';
  language: string;
  setLanguage: (lang: any) => void;
  t: (key: string) => string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export default function WizardShell({
  step,
  direction,
  totalSteps,
  isLoading,
  errors,
  nextButtonHidden,
  isLeadMode,
  isAuthenticated,
  dir,
  language,
  setLanguage,
  t,
  onClose,
  onPrev,
  onNext,
  children,
}: WizardShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start md:items-center bg-[#020617] md:bg-black/60 md:backdrop-blur-sm" dir={dir}>
      <div className="w-full max-w-[430px] h-full bg-[#020617] flex flex-col relative shadow-2xl overflow-hidden md:border md:border-white/5">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0f172a]">
          <button
            type="button"
            onClick={step === 0 ? onClose : onPrev}
            className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors"
          >
            {step === 0 ? <X size={24} /> : dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          <div className="flex space-x-1.5 rtl:space-x-reverse">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <div className="min-w-[40px] flex justify-end">
            {isLeadMode ? (
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-xs font-bold text-primary hover:text-white transition-colors border border-primary/30 rounded-lg px-3 py-1.5 bg-primary/10"
              >
                {language === 'en' ? 'عربي' : 'English'}
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">{children}</div>

        {step !== 0 ? (
          <div
            className={`p-6 pb-28 border-t border-white/5 bg-[#0f172a] z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] transition-all duration-300 ${
              nextButtonHidden ? 'opacity-0 pointer-events-none absolute bottom-0 w-full' : 'opacity-100'
            }`}
          >
            {errors.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center"
              >
                {errors[0]}
              </motion.div>
            ) : null}

            <button
              type="button"
              onClick={onNext}
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>
                    {step === 12
                      ? isLeadMode
                        ? t('lead_contact.submit_btn')
                        : isAuthenticated
                        ? t('wizard.create_btn')
                        : t('wizard.create_account_project')
                      : step === 11
                      ? isLeadMode
                        ? t('lead_contact.review_btn')
                        : t('wizard.create_account_only')
                      : t('wizard.next')}
                  </span>
                  {step !== 12 ? dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} /> : null}
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
