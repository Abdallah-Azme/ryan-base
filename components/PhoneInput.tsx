
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { COUNTRIES, Country, DEFAULT_COUNTRY } from '../lib/countries';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className = '', required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize from value if present
  useEffect(() => {
    if (value) {
      // Attempt to match existing E.164 value to a country
      const match = COUNTRIES.find(c => value.startsWith(c.dial_code));
      if (match) {
        setSelectedCountry(match);
        setLocalNumber(value.replace(match.dial_code, ''));
      }
    }
  }, []); // Run once on mount or when value externally resets to something specific if needed

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    updateValue(country.dial_code, localNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Numeric only
    setLocalNumber(val);
    updateValue(selectedCountry.dial_code, val);
  };

  const updateValue = (dialCode: string, number: string) => {
    if (!number) {
      onChange('');
    } else {
      onChange(`${dialCode}${number}`);
    }
  };

  return (
    // Explicitly force LTR direction for the entire component container to prevent mirroring
    <div className={`relative ${className}`} ref={containerRef} dir="ltr" style={{ direction: 'ltr' }}>
      <div className="flex">
        {/* Country Select Trigger - Always on Left */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-l-xl border-r-0 px-3 py-3 text-white hover:bg-slate-700/50 transition-colors shrink-0"
        >
          <span className="text-lg leading-none">{selectedCountry.flag}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {/* Dial Code Display (Static) */}
        <div 
          className="bg-slate-800/50 border-y border-slate-700/50 flex items-center justify-center px-2 text-slate-400 text-sm font-mono select-none"
        >
          {selectedCountry.dial_code}
        </div>

        {/* Phone Number Input - Always LTR, Left Aligned */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="12345678"
          className="flex-1 bg-slate-800/50 border border-slate-700/50 border-l-0 rounded-r-xl py-3 px-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-left"
          required={required}
        />
      </div>

      {/* Dropdown - Always Align Left */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 custom-scrollbar"
          >
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountrySelect(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${
                  selectedCountry.code === c.code ? 'bg-primary/10' : ''
                }`}
              >
                <span className="text-xl shrink-0">{c.flag}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500 text-left">{c.dial_code}</div>
                </div>
                {selectedCountry.code === c.code && <Check size={16} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneInput;
