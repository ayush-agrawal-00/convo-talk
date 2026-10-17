"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProfileFields } from "./ProfileFields";
import { useI18n } from "./I18nProvider";
import { LANGUAGES } from "@/lib/languages";
import { isLocale, type MessageKey } from "@/lib/i18n";
import { validateName } from "@/lib/limits";
import { loadPrefill } from "@/lib/rooms";

export type JoinHint = { lang?: string; name?: string };

export function JoinForm({ hint, onJoin }: { hint: JoinHint; onJoin: (p: { name: string; lang: string }) => void }) {
  // One selection drives both: the language of the whole interface and the language this person writes in.
  const { t, langName, locale: lang, setLocale } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState<{ key: MessageKey; lang?: string } | null>(null);

  useEffect(() => {
    setName(loadPrefill()?.name ?? ""); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // The host already speaks this language, and both people can't pick the same one: move to the first free language.
  useEffect(() => {
    if (hint.lang && lang === hint.lang) setLocale(LANGUAGES.find((l) => l.code !== hint.lang)!.code);
  }, [hint.lang, lang, setLocale]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateName(name);
    if (problem) return setError({ key: problem });
    if (lang === hint.lang) return setError({ key: "join.sameLang", lang });
    onJoin({ name: name.trim(), lang });
  }

  const errorText = error && t(error.key, { name: hint.name ?? t("join.theOther"), lang: langName(error.lang ?? lang) });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
      <div className="mb-8">
        <Link href="/" className="font-display text-2xl font-semibold">convoTalk</Link>
      </div>
      <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
        {hint.name ? t("join.titleNamed", { name: hint.name }) : t("join.title")}
      </h1>
      <p className="mt-3 text-muted">
        {hint.lang ? t("join.bodyLang", { lang: langName(hint.lang) }) : t("join.body")}
      </p>
      <form onSubmit={submit} noValidate className="mt-8 rounded-3xl border border-line bg-card/80 p-5 sm:p-7">
        <ProfileFields
          name={name}
          lang={lang}
          onName={(v) => { setName(v); setError(null); }}
          onLang={(v) => { if (isLocale(v)) setLocale(v); setError(null); }}
          blockedLang={hint.lang}
          error={errorText}
        />
        <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">
          {t("join.submit")} <ArrowRight size={18} className="rtl:-scale-x-100" aria-hidden />
        </button>
      </form>
    </main>
  );
}
