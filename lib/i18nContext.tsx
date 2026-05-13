"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { translations } from './translations';

type Language = 'en' | 'ar';
type TranslationKey = keyof typeof translations.en;

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  
  // Initialize state synchronously from LocalStorage to prevent flash.
  // Default to 'ar' (Arabic) if no preference is stored.
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('rs_lang') as Language;
        if (storedLang && (storedLang === 'en' || storedLang === 'ar')) {
          return storedLang;
        }
      }
    } catch (e) {
      // Ignore localStorage errors (e.g. private mode)
    }
    return 'ar'; // Default to Arabic
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rs_lang', lang);
    }
  };

  // Force English if in Admin Dashboard
  const isAdmin = pathname?.startsWith('/admin');
  const effectiveLanguage = isAdmin ? 'en' : language;
  const dir = effectiveLanguage === 'ar' ? 'rtl' : 'ltr';

  // Apply direction to HTML element immediately
  useEffect(() => {
    document.documentElement.lang = effectiveLanguage;
    document.documentElement.dir = dir;
  }, [effectiveLanguage, dir]);

  const t = (key: string): string => {
    // @ts-ignore
    return translations[effectiveLanguage][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language: effectiveLanguage, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
