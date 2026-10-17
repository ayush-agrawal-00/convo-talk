"use client";
import { useEffect } from "react";
import { LocaleToggle } from "./LocaleToggle";
import { StartForm } from "./StartForm";
import { StatusStrip } from "./StatusStrip";
import { useI18n } from "./I18nProvider";

export function Landing() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t("meta.title");
  }, [t]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-12 pt-6 sm:px-8">
      <header className="flex items-center justify-between gap-3 py-2">
        <span className="font-display text-2xl font-semibold tracking-tight">convoTalk</span>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">{t("landing.byline")}</span>
          <LocaleToggle />
        </div>
      </header>

      <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
        <section className="min-w-0">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ember">{t("landing.tagline")}</p>
          <h1 className="text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            {t("landing.h1a")} <span className="italic text-ember">{t("landing.h1b")}</span> {t("landing.h1c")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("landing.body")}</p>
          <div className="mt-8"><StatusStrip /></div>
        </section>

        {/* On small screens the form comes first so the CTA is never buried under the preview. */}
        <section className="flex min-w-0 flex-col-reverse gap-6 lg:flex-col" aria-label={t("landing.start")}>
          <Illustration />
          <StartForm />
        </section>
      </div>
    </main>
  );
}

/**
 * Sample exchange. The dialogue is fixed illustrative content (not UI copy), so it is identical in every
 * interface language; only the labels around it are localized. Each label names the language of the text below it.
 */
function Illustration() {
  const { t } = useI18n();
  return (
    <figure className="min-w-0 rounded-3xl border border-line bg-sand/60 p-5" aria-label={t("landing.illustrationAria")}>
      <figcaption className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">{t("landing.illustration")}</figcaption>
      <div className="space-y-3">
        <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3">
          <p className="text-xs font-semibold text-muted">{t("preview.speaker", { name: "Sofía", lang: "Español" })}</p>
          <p lang="es" className="mt-1 break-words font-display text-xl leading-snug sm:text-2xl">Nunca me dijiste que te ibas.</p>
          <p className="mt-2 break-words border-t border-line pt-2 text-sm text-muted">
            <span className="block text-xs font-semibold">{t("msg.translation", { lang: "English" })}</span>
            <span lang="en">You never told me you were leaving.</span>
          </p>
        </div>
        <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-paper">
          <p className="text-xs font-semibold text-paper/75">{t("preview.speaker", { name: "Maya", lang: "English" })}</p>
          <p lang="en" className="mt-1 break-words font-display text-xl leading-snug sm:text-2xl">I did. Twice. You weren&apos;t listening.</p>
          <p className="mt-2 break-words border-t border-paper/20 pt-2 text-sm text-paper/80">
            <span className="block text-xs font-semibold">{t("msg.translation", { lang: "Español" })}</span>
            <span lang="es">Sí te lo dije. Dos veces. No me estabas escuchando.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full border border-ember/40 bg-ember-soft px-3 py-1 text-ember">{t("pill.wait")}</span>
          <span className="rounded-full border border-line bg-card px-3 py-1">{t("pill.notMeant")}</span>
          <span className="rounded-full border border-line bg-card px-3 py-1">{t("pill.changed")}</span>
        </div>
      </div>
    </figure>
  );
}
