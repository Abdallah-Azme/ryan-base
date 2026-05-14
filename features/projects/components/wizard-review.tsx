import React from 'react';

interface WizardReviewProps {
  formData: any;
  setFormData: (val: any) => void;
  platformsList: string[];
  languagesList: string[];
  marketsList: string[];
  industriesList: string[];
  serviceModelsList: string[];
  closestAppsList: string[];
  presetColorsList: { hex: string; name: string }[];
  t: (key: string) => string;
  toggleArray: (arr: string[], val: string, key: any) => void;
}

export default function WizardReview({
  formData,
  setFormData,
  platformsList,
  languagesList,
  marketsList,
  industriesList,
  serviceModelsList,
  closestAppsList,
  presetColorsList,
  t,
  toggleArray,
}: WizardReviewProps) {
  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto no-scrollbar pb-32">
      <h2 className="text-2xl font-bold text-white mb-1">{t('wizard.review_title')}</h2>
      <p className="text-slate-400 text-sm mb-6">{t('wizard.review_desc')}</p>

      <div className="space-y-6">
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.essentials')}</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.desc_label')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none resize-none text-sm leading-relaxed transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_industry')}</label>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none"
              >
                <option value="" disabled>
                  {t('wizard.select_industry')}
                </option>
                {industriesList.map((ind) => (
                  <option key={ind} value={ind}>
                    {t(`industry.${ind}`)}
                  </option>
                ))}
              </select>
              {formData.industry === 'Other' ? (
                <input
                  type="text"
                  value={formData.industryOther}
                  onChange={(e) => setFormData({ ...formData, industryOther: e.target.value })}
                  placeholder={t('wizard.specify')}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.config')}</h3>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_platforms')}</label>
            <div className="flex flex-wrap gap-2">
              {platformsList.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setFormData({ ...formData, platforms: [p] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formData.platforms.includes(p)
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {t(`platform.${p}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_languages')}</label>
            <div className="flex flex-wrap gap-2">
              {languagesList.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setFormData({ ...formData, languages: [l] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formData.languages.includes(l)
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {t(`lang.${l}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_markets')}</label>
            <div className="flex flex-wrap gap-2">
              {marketsList.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggleArray(formData.markets, m, 'markets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formData.markets.includes(m)
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {t(`market.${m}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.biz_logic')}</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_service')}</label>
            <select
              value={formData.serviceModel}
              onChange={(e) => setFormData({ ...formData, serviceModel: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none"
            >
              <option value="" disabled>
                {t('wizard.select_option')}
              </option>
              {serviceModelsList.map((m) => (
                <option key={m} value={m}>
                  {t(`service.${m}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_ref')}</label>
            <select
              value={formData.closestApp}
              onChange={(e) => setFormData({ ...formData, closestApp: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none"
            >
              <option value="" disabled>
                {t('wizard.select_option')}
              </option>
              {closestAppsList.map((app) => (
                <option key={app} value={app}>
                  {t(`ref.${app}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_payments')}</label>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasPayments: true })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    formData.hasPayments ? 'bg-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t('wizard.yes')}
                </button>
                <div className="w-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasPayments: false })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    !formData.hasPayments ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t('wizard.no')}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_existing_biz')}</label>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasExistingBusiness: true })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    formData.hasExistingBusiness ? 'bg-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t('wizard.yes')}
                </button>
                <div className="w-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasExistingBusiness: false })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    !formData.hasExistingBusiness ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t('wizard.no')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.branding')}</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_color')}</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5"
              />
              <input
                type="text"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none uppercase font-mono transition-colors"
              />
            </div>
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pt-1">
              {presetColorsList.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setFormData({ ...formData, brandColor: c.hex })}
                  className={`w-6 h-6 rounded-full border border-white/10 shrink-0 ${
                    formData.brandColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-slate-900'
                      : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
