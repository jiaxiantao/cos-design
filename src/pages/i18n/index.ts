import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next, useTranslation } from 'react-i18next';
import { resources } from './resources';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale, SUPPORTED_LOCALES, type Locale } from './types';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    load: 'currentOnly',
    // 文案里含 HTML 片段（如 <strong>），交给 Trans 渲染，不做二次转义
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: normalizeLocale
    },
    react: { useSuspense: false }
  });

const syncDocumentLang = (lng: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = normalizeLocale(lng);
};

syncDocumentLang(i18n.language);
i18n.on('languageChanged', syncDocumentLang);

/** 读取当前语言并切换。语言值始终收敛为 `zh-CN` / `en-US`。 */
export const useLocale = () => {
  const { i18n: instance } = useTranslation();
  return {
    locale: normalizeLocale(instance.language),
    setLocale: (locale: Locale) => {
      void instance.changeLanguage(locale);
    }
  };
};

export { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, normalizeLocale, type Locale };

export default i18n;
