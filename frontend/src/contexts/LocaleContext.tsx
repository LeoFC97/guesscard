    import React, { createContext, useContext, useEffect, useState } from 'react';

type Locale = 'pt' | 'en';

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: 'pt',
  setLocale: () => {}
});

export const LocaleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    return (saved as Locale) || 'pt';
  });

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch (e) {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
    }
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);

export default LocaleContext;
