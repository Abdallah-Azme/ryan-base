import React from 'react';

interface ProjectInfoGridProps {
  industry?: string;
  industryOther?: string | null;
  markets?: string[];
  languages?: string[];
  platforms?: string[];
  t: (key: string) => string;
}

export default function ProjectInfoGrid({
  industry = '',
  industryOther,
  markets = [],
  languages = [],
  platforms = [],
  t,
}: ProjectInfoGridProps) {
  const displayIndustry = industry === 'Other' ? industryOther || industry : industry ? t(`industry.${industry}`) : '';

  return (
    <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 space-y-4">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold block mb-1">
          {t('wizard.step_industry')}
        </span>
        <span className="text-white text-sm font-medium">{displayIndustry || '—'}</span>
      </div>

      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold block mb-1">
          {t('wizard.step_markets')}
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {markets.length > 0 ? (
            markets.map((m) => (
              <span key={m} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-white/5">
                {t(`market.${m}`)}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs">—</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold block mb-1">
            {t('wizard.step_languages')}
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {languages.length > 0 ? (
              languages.map((l) => (
                <span key={l} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-white/5">
                  {t(`lang.${l}`)}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs">—</span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold block mb-1">
            {t('wizard.step_platforms')}
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {platforms.length > 0 ? (
              platforms.map((p) => (
                <span key={p} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-white/5">
                  {t(`platform.${p}`)}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
