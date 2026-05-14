import React from 'react';
import { Zap, Timer, BarChart2, MessageCircle, MousePointerClick, Edit3, CheckCircle2, Info } from 'lucide-react';

interface WizardIntroProps {
  t: (key: string) => string;
  onStart: () => void;
}

export default function WizardIntro({ t, onStart }: WizardIntroProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
      <div className="flex flex-col items-center text-center p-6 gap-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 animate-pulse shrink-0">
          <Zap size={40} className="text-primary" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{t('wizard.start_title')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            {t('wizard.start_subtitle')}
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
              <Timer size={20} className="text-primary" />
              <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_time')}</span>
            </div>
            <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
              <BarChart2 size={20} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_analysis')}</span>
            </div>
            <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
              <MessageCircle size={20} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_reply')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-8 relative">
            <div className="absolute top-1/2 start-8 end-8 h-0.5 bg-slate-800 -z-10" />

            <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                <MousePointerClick size={14} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_1_label')}</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                <Edit3 size={14} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_2_label')}</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_3_label')}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl w-full text-start flex items-start gap-3">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-500 text-xs font-bold block mb-0.5">{t('wizard.start_note')}</span>
            <p className="text-amber-500/80 text-[10px] leading-relaxed">{t('wizard.start_desc')}</p>
          </div>
        </div>

        <div className="w-full pt-2">
          <button
            type="button"
            onClick={onStart}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all"
          >
            {t('wizard.start_btn')}
          </button>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">{t('wizard.no_commit')}</p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
