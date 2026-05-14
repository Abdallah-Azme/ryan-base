import React from 'react';

interface WizardNameStepProps {
  name: string;
  t: (key: string) => string;
  onChange: (val: string) => void;
}

export default function WizardNameStep({ name, t, onChange }: WizardNameStepProps) {
  return (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{t('wizard.step_name')}</h2>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
        placeholder={t('wizard.name_placeholder')}
      />
    </div>
  );
}
