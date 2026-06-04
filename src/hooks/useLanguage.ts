import { create } from 'zustand';
import { ru } from '../i18n/ru';

type Language = 'ru' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof ru;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: 'ru',
  t: ru,
  setLanguage: (lang) => set({
    language: lang,
    t: lang === 'ru' ? ru : ru, // You can add English later
  }),
}));
