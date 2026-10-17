"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatTime, isLocale, languageName, translate, type Locale, type MessageKey, type Vars } from "@/lib/i18n";

const STORAGE_KEY = "convotalk:ui-locale";

type I18n = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  time: (ts: number) => string;
  /** Language name in the interface language, e.g. "inglés". */
  langName: (code: string) => string;
};

const Ctx = createContext<I18n | null>(null);

/** Per-browser UI language. Stored locally only; never broadcast to the room. */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Locale = isLocale(stored) ? stored : navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
    setLocaleState(initial); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
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
