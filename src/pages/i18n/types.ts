export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const LOCALE_STORAGE_KEY = 'cos-design-locale';

export const isSupportedLocale = (value: string): value is Locale => SUPPORTED_LOCALES.includes(value as Locale);

/** 把 `zh`、`zh-TW`、`en-GB` 等浏览器语言收敛到站点支持的两种语言 */
export const normalizeLocale = (value?: string): Locale => {
  if (!value) return DEFAULT_LOCALE;
  if (isSupportedLocale(value)) return value;
  return value.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
};
