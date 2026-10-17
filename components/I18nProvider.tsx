"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, detectLocale, formatTime, isLocale, isRtl, languageName, translate, type Locale, type MessageKey, type Vars } from "@/lib/i18n";
import { loadPrefill, savePrefillLang } from "@/lib/rooms";

type I18n = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  time: (ts: number) => string;
  /** Language name in the interface language, e.g. "inglés". */
  langName: (code: string) => string;
};

const Ctx = createContext<I18n | null>(null);

/**
 * The participant's selected language is the single source of truth: it is both their interface language (here)
 * and the language they write in (the room profile). Stored locally per browser; never broadcast to the room.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = loadPrefill()?.lang;
    setLocaleState(isLocale(saved) ? saved : detectLocale(navigator.language)); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      savePrefillLang(l);
    } catch {
      /* storage unavailable: preference lasts for this page view only */
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars), time: (ts) => formatTime(locale, ts), langName: (code) => languageName(locale, code) }),
    [locale, setLocale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
