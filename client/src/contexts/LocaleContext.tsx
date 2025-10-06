import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'ar' | 'en';

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  toggleLocale: () => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    uploadFile: 'رفع الملف',
    generateReport: 'توليد التقرير',
    welcome: 'مرحباً بك في مولد التقارير الذكية',
  },
  en: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    uploadFile: 'Upload File',
    generateReport: 'Generate Report',
    welcome: 'Welcome to AI Report Generator',
  },
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem('locale');
    return stored === 'en' ? 'en' : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const toggleLocale = () => setLocale(prev => (prev === 'ar' ? 'en' : 'ar'));

  const value = useMemo(() => ({
    locale,
    dir: (locale === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    toggleLocale,
    t: (key: string) => translations[locale][key] ?? key,
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};


