import { useEffect, useState } from 'react';

export type Lang = 'en' | 'sn' | 'nd';

// English is the source of truth. Shona (sn) and Ndebele (nd) are intentionally
// empty: add professionally translated strings here; missing keys fall back to English.
const translations: Record<Lang, Record<string, string>> = {
  en: {
    'messages.title': 'Messages',
    'messages.subtitle': "Talk directly with your child's teacher or the parent.",
    'messages.new': 'New message',
    'messages.send': 'Send',
    'messages.empty': 'No conversations yet',
    'arrears.title': 'Fee Arrears',
    'arrears.remind': 'Send reminder',
    'arrears.remindAll': 'Remind all',
    'transport.title': 'Transport',
    'export.title': 'Data Export',
    'a11y.title': 'Accessibility',
    'a11y.largeText': 'Large text',
    'a11y.highContrast': 'High contrast',
    'a11y.language': 'Language',
  },
  sn: {},
  nd: {},
};

const LANG_KEY = 'app:lang';
const listeners = new Set<() => void>();

export const getLang = (): Lang => {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'sn' || v === 'nd') return v;
  } catch { /* storage unavailable */ }
  return 'en';
};

export const setLang = (lang: Lang) => {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  listeners.forEach(l => l());
};

export const t = (key: string, fallback?: string): string =>
  translations[getLang()][key] ?? translations.en[key] ?? fallback ?? key;

/** Re-renders the calling component when the language changes. */
export const useI18n = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(n => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return { t, lang: getLang(), setLang };
};
