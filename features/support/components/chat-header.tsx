import React from 'react';
import { Info } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { useTranslation } from '@/lib/i18nContext';

export default function ChatHeader() {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-lg z-30 shrink-0 h-[72px]">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <SafeImage
              src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
              alt="Support"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute bottom-0 end-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm leading-tight">{t('chat.header')}</h2>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <p className="text-slate-400 text-[10px] uppercase tracking-wide font-medium">{t('chat.team')}</p>
            <span className="text-emerald-500 text-[10px]">• {t('chat.online')}</span>
          </div>
        </div>
      </div>
      <button type="button" className="text-slate-400 hover:text-white transition-colors">
        <Info size={20} />
      </button>
    </div>
  );
}
