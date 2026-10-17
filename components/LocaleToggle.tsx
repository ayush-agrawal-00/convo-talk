"use client";
import { useI18n } from "./I18nProvider";
import { LOCALES } from "@/lib/i18n";

/** Switches only this browser's interface language. */
export function LocaleToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t("locale.label")} className="inline-flex rounded-full border border-line bg-card p-0.5 text-xs font-semibold">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={t(l === "en" ? "locale.en" : "locale.es")}
          title={t(l === "en" ? "locale.en" : "locale.es")}
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={`rounded-full min-h-8 min-w-9 px-2.5 py-1 uppercase transition focus-visible:outline-2 focus-visible:outline-ink ${locale === l ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
