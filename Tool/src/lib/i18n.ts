export type Locale = 'zh-CN' | 'en-US';

export const defaultLocale: Locale = 'zh-CN';

export const locales: Locale[] = ['zh-CN', 'en-US'];

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
} 