
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import fr from "./locales/fr.json";
import en from "./locales/en.json";

// Initialize i18next
i18n
  .use(Backend) // Load translations from backend
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18next to react-i18next
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en }
    },
    lng: "fr", // Default language
    fallbackLng: "fr", // Fallback language
    debug: process.env.NODE_ENV === 'development',
    interpolation: { 
      escapeValue: false // Not needed for React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;

// Type definitions for easier use with TypeScript
export type SupportedLanguage = 'fr' | 'en';

// Helper function to get the current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || 'fr').substring(0, 2) as SupportedLanguage;
};

// Helper function to change the language
export const changeLanguage = (lang: SupportedLanguage): Promise<typeof i18n> => {
  return i18n.changeLanguage(lang);
};

// Format date according to the current language
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const lang = getCurrentLanguage();
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', options).format(date);
};

// Format number according to the current language
export const formatNumber = (
  number: number, 
  options?: Intl.NumberFormatOptions
): string => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', options).format(number);
};
