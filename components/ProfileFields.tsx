"use client";
import { useId } from "react";
import { useI18n } from "./I18nProvider";
import { LANGUAGES } from "@/lib/languages";
import { languageOptionLabel } from "@/lib/i18n";
import { MAX_NAME_LENGTH } from "@/lib/limits";

type Props = {
  name: string;
  lang: string;
  onName: (v: string) => void;
  onLang: (v: string) => void;
  /** A language that can't be chosen (the other person already speaks it). */
  blockedLang?: string;
  error?: string | null;
  nameRef?: React.Ref<HTMLInputElement>;
};

const fieldClass =
  "w-full rounded-xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-muted outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15";

export function ProfileFields({ name, lang, onName, onLang, blockedLang, error, nameRef }: Props) {
  const { t, locale } = useI18n();
  const nameId = useId();
  const langId = useId();
  const errId = useId();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={nameId} className="mb-1.5 block text-sm font-medium">{t("form.name")}</label>
        <input
          id={nameId}
          ref={nameRef}
          value={name}
          onChange={(e) => onName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          placeholder={t("form.namePlaceholder")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor={langId} className="mb-1.5 block text-sm font-medium">{t("form.lang")}</label>
        <select id={langId} value={lang} onChange={(e) => onLang(e.target.value)} className={fieldClass}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} disabled={l.code === blockedLang}>
              {languageOptionLabel(locale, l.code)}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={errId} role="alert" className="text-sm font-medium text-ember sm:col-span-2">{error}</p>
      )}
    </div>
  );
}
