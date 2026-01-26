import en from '../i18n/en.json';
import pt from '../i18n/pt.json';

type Locale = 'pt' | 'en';

const resources: Record<Locale, any> = {
  en,
  pt,
};

export const t = (key: string, locale: Locale = 'pt'): string => {
  const parts = key.split('.');
  let obj: any = resources[locale];
  for (const p of parts) {
    if (obj && typeof obj === 'object' && p in obj) {
      obj = obj[p];
    } else {
      return key;
    }
  }
  return typeof obj === 'string' ? obj : key;
};

export default t;
