import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  es: {
    translation: translationES,
  },
  en: {
    translation: translationEN,
  },
};

const savedLang = localStorage.getItem('app_language');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    lng: savedLang || 'es',
    debug: false,
    interpolation: {
      escapeValue: false, // react already protects from xss
    },
  });

export default i18n;
