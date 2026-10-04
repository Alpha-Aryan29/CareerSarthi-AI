import React, { createContext, useContext, useState } from 'react';
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
  const [lang, setLang] = useState<string>('en');

  const t: TFunc = (key) => {
    return getStrings(lang)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
