import React from 'react';
import { Check, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardColorPickerProps {
  presetColors: { hex: string; name: string }[];
  brandColor: string;
  showCustomColor: boolean;
  t: (key: string) => string;
  onSelectPreset: (hex: string) => void;
  onToggleCustom: () => void;
  onChangeCustom: (val: string) => void;
}

export default function WizardColorPicker({
  presetColors,
  brandColor,
  showCustomColor,
  t,
  onSelectPreset,
  onToggleCustom,
  onChangeCustom,
}: WizardColorPickerProps) {
  return (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{t('wizard.step_color')}</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {presetColors.map((color) => {
          const isSelected = brandColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              type="button"
              key={color.hex}
              onClick={() => onSelectPreset(color.hex)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#020617] scale-105' : 'hover:scale-105 border border-white/10'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected ? (
                <div
                  className={`bg-black/20 rounded-full p-1 ${
                    color.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'
                  }`}
                >
                  <Check size={20} />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center w-full">
        <button
          type="button"
          onClick={onToggleCustom}
          className={`flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-xl border transition-all mb-4 ${
            showCustomColor ? 'bg-slate-800 border-primary text-primary' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Palette size={18} />
          <span>{t('wizard.custom_color')}</span>
        </button>

        <AnimatePresence>
          {showCustomColor ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden flex flex-col items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-white/5"
            >
              <div className="flex flex-col items-center gap-4 w-full">
                <div
                  className="w-20 h-20 rounded-full shadow-lg border-2 border-white/10 transition-colors duration-300"
                  style={{ backgroundColor: brandColor }}
                />
                <div className="relative w-full">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => onChangeCustom(e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-white/10 p-1"
                  />
                </div>
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => onChangeCustom(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-center uppercase focus:border-primary focus:outline-none"
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
