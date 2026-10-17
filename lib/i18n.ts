import { en, type MessageKey, type Messages } from "./locales/en.ts";
import es from "./locales/es.ts";
import fr from "./locales/fr.ts";
import de from "./locales/de.ts";
import pt from "./locales/pt.ts";
import it from "./locales/it.ts";
import nl from "./locales/nl.ts";
import ru from "./locales/ru.ts";
import tr from "./locales/tr.ts";
import ar from "./locales/ar.ts";
import hi from "./locales/hi.ts";
import zh from "./locales/zh.ts";
import ja from "./locales/ja.ts";
import ko from "./locales/ko.ts";
import { LANGUAGES, type LanguageCode } from "./languages.ts";
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from "./limits.ts";

export type { MessageKey } from "./locales/en.ts";

/**
 * Interface language. Every language in the language selector is a supported UI language.
 * It is independent of the conversation language (the language a person writes in) and is never sent to the room.
 */
export type Locale = LanguageCode;
export const LOCALES: readonly Locale[] = LANGUAGES.map((l) => l.code);
export const DEFAULT_LOCALE: Locale = "en";
export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Right-to-left interface languages. */
export const isRtl = (locale: Locale): boolean => locale === "ar";

/** Languages written without spaces between words, used when joining split headline fragments. */
export const isSpacelessScript = (locale: Locale): boolean => locale === "zh" || locale === "ja";

export const DICTIONARIES: Record<Locale, Messages> = { en, es, fr, de, pt, it, nl, ru, tr, ar, hi, zh, ja, ko };

export type Vars = Record<string, string | number>;

/**
 * Fallback strategy: a missing or empty string in the active locale falls back to English, never to a raw key.
 * (Completeness is also enforced at compile time and by tests, so this is a safety net.)
 */
export function lookup(locale: Locale, key: MessageKey): string {
  return DICTIONARIES[locale]?.[key] || en[key];
}

export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  const all: Vars = { maxMessage: MAX_MESSAGE_LENGTH, maxName: MAX_NAME_LENGTH, ...vars };
  return lookup(locale, key).replace(/\{(\w+)\}/g, (m, k: string) => (k in all ? String(all[k]) : m));
}

/** Picks the best supported UI language from a browser language tag such as "pt-BR" or "zh-Hans-CN". */
export function detectLocale(tag: string | undefined): Locale {
  const base = tag?.toLowerCase().split("-")[0];
  return isLocale(base) ? base : DEFAULT_LOCALE;
}

const displayNames = new Map<Locale, Intl.DisplayNames | null>();

/** Language name written in the given interface language (Intl.DisplayNames), e.g. "inglés" for locale "es". */
export function languageName(locale: Locale, code: string): string {
  if (!displayNames.has(locale)) {
    try {
      displayNames.set(locale, new Intl.DisplayNames([locale], { type: "language" }));
    } catch {
      displayNames.set(locale, null);
    }
  }
  const fallback = LANGUAGES.find((l) => l.code === code)?.name ?? code;
  try {
    return displayNames.get(locale)?.of(code === "zh" ? "zh-Hans" : code) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Option label: native name plus the name in the interface language, e.g. "Español · Spanish". */
export function languageOptionLabel(locale: Locale, code: string): string {
  const native = LANGUAGES.find((l) => l.code === code)?.native ?? code;
  const local = languageName(locale, code);
  return native.toLowerCase() === local.toLowerCase() ? native : `${native} · ${local}`;
}

export function formatTime(locale: Locale, ts: number): string {
  return new Date(ts).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** Maps the translate API's error code to a localized message key. */
export function translationErrorKey(code: string | undefined): MessageKey {
  const key = `tr.${code}` as MessageKey;
  return code && key in en ? key : "tr.generic";
}
