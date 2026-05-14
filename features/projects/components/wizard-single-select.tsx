import React from 'react';
import { Check } from 'lucide-react';

interface WizardSingleSelectProps {
  title: string;
  options: string[];
  selected: string[];
  t: (key: string) => string;
  prefix: string;
  onSelect: (opt: string) => void;
}

export default function WizardSingleSelect({
  title,
  options,
  selected,
  t,
  prefix,
  onSelect,
}: WizardSingleSelectProps) {
  return (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary text-white'
                  : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="font-medium text-lg">{t(`${prefix}.${opt}`)}</span>
              {isSelected ? <Check size={20} className="text-primary" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
