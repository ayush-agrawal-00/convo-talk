"use client";
import { CornerDownRight, Hand, MessageSquareWarning, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import { getLanguage } from "@/lib/languages";
import { useI18n } from "./I18nProvider";
import { REACTION_PILL_KEY, type ReactionKey } from "@/lib/reactions";
import type { ChatMessage, ReactionEvent, SendStatus } from "@/lib/types";
import type { Translation } from "@/hooks/useTranslations";

type BubbleProps = {
  msg: ChatMessage;
  mine: boolean;
  myLang: string;
  status?: SendStatus;
  translation?: Translation;
  translationUnavailable: boolean;
  revised: boolean;
  flagged: boolean;
  refText?: string;
  onRetrySend: () => void;
  onRetryTranslate: () => void;
};

export function MessageBubble(p: BubbleProps) {
  const { t, time } = useI18n();
  const { msg, mine } = p;
  const dim = p.revised ? "opacity-60 line-through decoration-ember/70" : "";

  const tags = (
    <>
      {msg.intent && (
        <p className="mb-2 flex items-start gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
          <CornerDownRight size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {t(msg.intent.type === "clarify" ? "msg.clarifying" : "msg.newPosition")}
            {p.refText && <span className="ml-1 font-normal normal-case tracking-normal italic">&ldquo;{p.refText}&rdquo;</span>}
          </span>
        </p>
      )}
    </>
  );

  const flags = (p.revised || p.flagged) && (
    <p className={`mt-2 text-xs font-semibold ${mine ? "text-ember-soft" : "text-ember"}`}>
      {t(p.revised ? "msg.revised" : "msg.flagged")}
    </p>
  );

  if (mine) {
    return (
      <article className="anim-rise ml-auto flex max-w-[88%] flex-col items-end sm:max-w-[72%]" aria-label={t("msg.aria", { name: t("msg.you"), time: time(msg.ts) })}>
        <div className="rounded-3xl rounded-br-md bg-ink px-5 py-4 text-paper">
          {tags}
          <p dir="auto" className={`whitespace-pre-wrap break-words font-display text-xl leading-snug sm:text-2xl ${dim}`}>{msg.text}</p>
          {flags}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          <span>{time(msg.ts)}</span>
          {p.status === "sending" && <span>{t("msg.sending")}</span>}
          {p.status === "sent" && <span>{t("msg.sent")}</span>}
          {p.status === "failed" && (
            <button onClick={p.onRetrySend} className="inline-flex items-center gap-1 font-semibold text-ember underline-offset-2 hover:underline">
              <TriangleAlert size={12} aria-hidden /> {t("msg.failed")}
            </button>
          )}
        </div>
      </article>
    );
  }

  const lang = getLanguage(msg.senderLang);
  const tr = p.translation;
  const myLangName = getLanguage(p.myLang).native;
  const original = (
    <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
      <span className="font-semibold">{t("msg.original", { lang: lang.native })}</span>
      <span dir="auto" className="mt-0.5 block whitespace-pre-wrap break-words">{msg.text}</span>
    </p>
  );

  return (
    <article className="anim-rise flex max-w-[92%] flex-col sm:max-w-[78%]" aria-label={t("msg.aria", { name: msg.senderName, time: time(msg.ts) })}>
      <p className="mb-1.5 pl-1 text-sm font-semibold">
        {msg.senderName} <span className="font-normal text-muted">· {lang.native} · {time(msg.ts)}</span>
      </p>
      <div className="rounded-3xl rounded-bl-md border border-line bg-card px-5 py-4">
        {tags}
        {!tr && p.translationUnavailable && (
          <>
            <p dir="auto" className={`whitespace-pre-wrap break-words font-display text-xl leading-snug sm:text-2xl ${dim}`}>{msg.text}</p>
            <p className="mt-3 text-xs font-semibold text-amber">{t("msg.unavailable")}</p>
          </>
        )}
        {!tr && !p.translationUnavailable && (
          <p dir="auto" className={`whitespace-pre-wrap break-words font-display text-xl leading-snug sm:text-2xl ${dim}`}>
            {msg.text}
            {msg.senderLang === p.myLang && <span className="mt-2 block font-sans text-xs text-muted">{t("msg.sameLang")}</span>}
          </p>
        )}
        {tr?.status === "loading" && (
          <div role="status" aria-label={t("msg.translating")}>
            <div className="skeleton h-5 w-4/5 rounded" />
            <div className="skeleton mt-2 h-5 w-3/5 rounded" />
            <p className="mt-2 text-xs text-muted">{t("msg.translating")}</p>
            {original}
          </div>
        )}
        {tr?.status === "done" && (
          <>
            {tr.sample && (
              <p className="mb-2 inline-block rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-muted">
                {t(p.myLang === "en" ? "msg.sampleEn" : "msg.sampleOther")}
              </p>
            )}
            <p className="mb-1 text-xs font-semibold text-muted">{t("msg.translation", { lang: myLangName })}</p>
            <p dir="auto" className={`whitespace-pre-wrap break-words font-display text-xl leading-snug sm:text-2xl ${dim}`}>{tr.text}</p>
            {original}
          </>
        )}
        {tr?.status === "error" && (
          <>
            <p dir="auto" className="whitespace-pre-wrap break-words font-display text-xl leading-snug sm:text-2xl">{msg.text}</p>
            <div role="alert" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ember">
              <span className="inline-flex items-center gap-1.5 font-medium"><TriangleAlert size={14} aria-hidden /> {t(tr.key)}</span>
              <button onClick={p.onRetryTranslate} className="inline-flex items-center gap-1 rounded-full border border-ember/40 px-3 py-1 text-xs font-semibold hover:bg-ember-soft">
                <RotateCcw size={12} aria-hidden /> {t("msg.retry")}
              </button>
            </div>
          </>
        )}
        {flags}
      </div>
    </article>
  );
}

const ICONS: Record<ReactionKey, typeof Hand> = { wait: Hand, notMeant: MessageSquareWarning, changed: RefreshCw };

export function ReactionPill({ ev, mine, status, onRetry }: {
  ev: ReactionEvent; mine: boolean; status?: SendStatus; onRetry: () => void;
}) {
  const { t, time } = useI18n();
  const Icon = ICONS[ev.reaction];
  return (
    <div className={`anim-rise flex ${mine ? "justify-end" : "justify-start"}`}>
      <span className="inline-flex items-center gap-2 rounded-full border border-ember/35 bg-ember-soft px-3.5 py-1.5 text-sm font-medium text-ember">
        <Icon size={15} aria-hidden />
        <span><span className="font-semibold">{mine ? t("msg.you") : ev.senderName}:</span> {t(REACTION_PILL_KEY[ev.reaction])}</span>
        <span className="text-xs font-normal opacity-70">{time(ev.ts)}</span>
        {status === "failed" && (
          <button onClick={onRetry} className="text-xs font-semibold underline">{t("pill.failed")}</button>
        )}
      </span>
    </div>
  );
}
