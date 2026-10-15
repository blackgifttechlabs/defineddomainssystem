import React, { useEffect, useState } from 'react';
import { Accessibility, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Lang, useI18n } from '../../utils/i18n';

interface A11yPrefs {
  largeText: boolean;
  highContrast: boolean;
}

const storageKey = (userId: string | undefined) => `a11y:${userId || 'guest'}`;

const readPrefs = (userId: string | undefined): A11yPrefs => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { largeText: !!parsed.largeText, highContrast: !!parsed.highContrast };
    }
  } catch { /* storage unavailable or corrupt */ }
  return { largeText: false, highContrast: false };
};

const writePrefs = (userId: string | undefined, prefs: A11yPrefs) => {
  try { localStorage.setItem(storageKey(userId), JSON.stringify(prefs)); } catch { /* ignore */ }
};

const applyPrefs = (prefs: A11yPrefs) => {
  const root = document.documentElement;
  root.classList.toggle('a11y-large-text', prefs.largeText);
  root.classList.toggle('a11y-high-contrast', prefs.highContrast);
};

export const AccessibilityToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user } = useStore();
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(() => readPrefs(user?.id));

  useEffect(() => {
    const loaded = readPrefs(user?.id);
    setPrefs(loaded);
    applyPrefs(loaded);
  }, [user?.id]);

  const update = (patch: Partial<A11yPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    writePrefs(user?.id, next);
  };

  const Row: React.FC<{ label: string; on: boolean; onClick: () => void }> = ({ label, on, onClick }) => (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
    >
      <span className="text-xs font-black text-slate-900">{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${on ? 'bg-[#7c3aed]' : 'bg-slate-300'}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );

  return (
    <div className={`fixed z-[85] ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('a11y.title')}
        aria-expanded={open}
        className="h-10 w-10 rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-xl grid place-items-center hover:text-[#7c3aed] transition-colors"
      >
        {open ? <X size={16} strokeWidth={2.6} /> : <Accessibility size={16} strokeWidth={2.6} />}
      </button>
      {open && (
        <div className="absolute left-0 bottom-12 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-widest text-[#22c55e]">{t('a11y.title')}</p>
          <Row label={t('a11y.largeText')} on={prefs.largeText} onClick={() => update({ largeText: !prefs.largeText })} />
          <Row label={t('a11y.highContrast')} on={prefs.highContrast} onClick={() => update({ highContrast: !prefs.highContrast })} />
          <label className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="text-xs font-black text-slate-900">{t('a11y.language')}</span>
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Lang)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900"
            >
              <option value="en">English</option>
              <option value="sn">Shona</option>
              <option value="nd">Ndebele</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
};
