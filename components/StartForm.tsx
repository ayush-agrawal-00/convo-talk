"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { ProfileFields } from "./ProfileFields";
import { useI18n } from "./I18nProvider";
import { isLocale, type MessageKey } from "@/lib/i18n";
import { validateName } from "@/lib/limits";
import { generateRoomId, loadPrefill, saveSessionProfile } from "@/lib/rooms";

const NAVIGATION_TIMEOUT_MS = 10_000;

export function StartForm() {
  const router = useRouter();
  // One selection drives both: the language of the whole interface and the language this person writes in.
  const { t, locale: lang, setLocale } = useI18n();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<MessageKey | null>(null);
  const [formError, setFormError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The language itself is restored by the I18nProvider (saved choice, else the browser's language).
  useEffect(() => {
    const prefill = loadPrefill();
    if (prefill?.name) setName(prefill.name); // eslint-disable-line react-hooks/set-state-in-effect
    return () => clearTimeout(slowTimer.current);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return; // ignore repeated clicks / Enter while a room is being created
    setFormError(null);

    const clean = name.trim().replace(/\s+/g, " ");
    const problem = validateName(clean);
    if (problem) {
      setFieldError(problem);
      nameRef.current?.focus();
      return;
    }

    busyRef.current = true;
    setBusy(true);
    const fail = (key: MessageKey) => {
      clearTimeout(slowTimer.current);
      busyRef.current = false;
      setBusy(false);
      setFormError(key);
    };

    try {
      const roomId = generateRoomId();
      saveSessionProfile(roomId, { name: clean, lang });
      slowTimer.current = setTimeout(() => fail("form.err.slow"), NAVIGATION_TIMEOUT_MS);
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error("[convotalk] room creation failed:", err);
      fail(err instanceof DOMException ? "form.err.storage" : "form.err.create");
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-labelledby="start-heading"
      aria-busy={busy}
      className="rounded-3xl border border-line bg-card/80 p-5 shadow-[0_20px_50px_-30px_rgba(27,22,17,0.45)] sm:p-7"
      noValidate
    >
      <h2 id="start-heading" className="sr-only">{t("form.heading")}</h2>
      <ProfileFields
        name={name}
        lang={lang}
        nameRef={nameRef}
        onName={(v) => { setName(v); setFieldError(null); }}
        onLang={(v) => isLocale(v) && setLocale(v)}
        error={fieldError && t(fieldError)}
      />
      {formError && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-ember/40 bg-ember-soft px-3 py-2 text-sm font-medium text-ember">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden /> {t(formError)}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:opacity-60"
      >
        {busy ? t("form.creating") : t("form.create")} <ArrowRight size={18} className="rtl:-scale-x-100" aria-hidden />
      </button>
      <span role="status" className="sr-only">{busy ? t("form.creating") : ""}</span>
      <p className="mt-3 text-center text-sm text-muted">{t("form.noAccount")}</p>
    </form>
  );
}
