import React, { createContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '../locales/en/common.json';
import hiTranslations from '../locales/hi/common.json';
import mrTranslations from '../locales/mr/common.json';

export const TranslationContext = createContext();

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations,
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Try to get language from localStorage, otherwise default to 'en'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  const [direction, setDirection] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') || 'en';
      // Keep all languages as LTR (left-to-right) for now
      // Even though Hindi and Marathi can support RTL, keeping consistent
      return 'ltr';
    }
    return 'ltr';
  });

  // Update document direction and language when language changes
  useEffect(() => {
    // Keep all languages as LTR (left-to-right)
    // This prevents CSS/alignment shifts when changing languages
    const isRTL = false; // Always LTR
    setDirection('ltr');
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr'; // Always LTR
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value || key;
  }, [language]);

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  }, []);

  const value = {
    t,
    language,
    changeLanguage,
    direction,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    ],
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
