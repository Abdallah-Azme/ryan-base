import React from 'react';

interface ProjectStatusCardProps {
  estimatedPrice: number | null;
  estimatedDuration: number | null;
  status: string;
  t: (key: string) => string;
  language: string;
}

export default function ProjectStatusCard({
  estimatedPrice,
  estimatedDuration,
  status,
  t,
  language,
}: ProjectStatusCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    const currencyLabel = language === 'ar' ? 'دك' : 'KWD';
    return `${price.toLocaleString()} ${currencyLabel}`;
  };

  const formatDuration = (days: number | null) => (days ? `${days} ${t('days')}` : '—');

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.est_price')}</span>
        <span className="text-white font-semibold text-sm leading-tight break-all">{formatPrice(estimatedPrice)}</span>
      </div>

      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.duration')}</span>
        <span className="text-white font-semibold text-sm leading-tight">{formatDuration(estimatedDuration)}</span>
      </div>

      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">{t('project.status')}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border border-white/5 ${
            status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
          }`}
        >
          {t(`status.${status}`)}
        </span>
      </div>
    </div>
  );
}
