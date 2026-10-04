import en from '../locales/en.json';
import hi from '../locales/hi.json';

type LocaleStrings = typeof en;

const locales: Record<string, LocaleStrings> = {
  en,
  hi
};

export function getStrings(lang: string): LocaleStrings {
  return locales[lang] || locales.en;
}

export type TFunc = (key: keyof LocaleStrings) => string;
