import React, { createContext, useCallback, useContext, useState } from 'react';
import { getStrings, type TFunc } from '../lib/i18n';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: TFunc;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('careersarthi-language') === 'hi' ? 'hi' : 'en';
    } catch (error) {
      console.error('Unable to read saved language preference', error);
      return 'en';
    }
  });

  const setLang = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    try {
      localStorage.setItem('careersarthi-language', nextLanguage === 'hi' ? 'hi' : 'en');
    } catch (error) {
      console.error('Unable to save language preference', error);
    }
  };

  const t: TFunc = useCallback((key: Parameters<TFunc>[0]) => {
    return getStrings(lang)[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
