"use client";
import { useEffect, useRef, useState } from "react";
import { Hand, MessageSquareWarning, RefreshCw, SendHorizontal, X } from "lucide-react";
import { useI18n } from "./I18nProvider";
import type { MessageKey } from "@/lib/i18n";
import { MAX_MESSAGE_LENGTH, validateMessage } from "@/lib/limits";
import type { ReactionKey } from "@/lib/reactions";

export type ComposerIntent = { type: "clarify" | "revise"; refId: string };

type Props = {
  disabled: boolean;
  disabledReason?: string;
  sendAnyway: boolean;
  intent: ComposerIntent | null;
  focusSignal: number;
  canReferenceOwn: boolean;
  onClearIntent: () => void;
  onSend: (text: string) => MessageKey | null;
  onTyping: (typing: boolean) => void;
  onReact: (key: ReactionKey) => void;
  onDraft: (active: boolean) => void;
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-medium transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line";

export function Composer(p: Props) {
  const [text, setText] = useState("");
  const { t } = useI18n();
  const [error, setError] = useState<MessageKey | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (p.focusSignal > 0) ref.current?.focus();
  }, [p.focusSignal]);

  function submit() {
    const problem = validateMessage(text);
    if (problem) return setError(problem);
    const err = p.onSend(text);
    if (err) return setError(err);
    setText("");
    setError(null);
    p.onDraft(false);
    p.onTyping(false);
    p.onClearIntent();
  }

  const remaining = MAX_MESSAGE_LENGTH - text.length;
  const placeholder = t(p.intent?.type === "clarify" ? "composer.ph.clarify" : p.intent?.type === "revise" ? "composer.ph.revise" : "composer.ph.default");
  const ownHint = t("composer.needMessage");
  const sendLabel = t(p.sendAnyway ? "composer.sendAnyway" : "composer.send");

  return (
    <div className="border-t border-line bg-paper/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-2.5 flex flex-wrap gap-2" role="group" aria-label={t("composer.reactions")}>
          <button type="button" className={chip} onClick={() => p.onReact("wait")} disabled={p.disabled}>
            <Hand size={15} aria-hidden /> {t("react.wait")}
          </button>
          <button type="button" className={chip} onClick={() => p.onReact("notMeant")} disabled={p.disabled || !p.canReferenceOwn} title={p.canReferenceOwn ? undefined : ownHint}>
            <MessageSquareWarning size={15} aria-hidden /> {t("react.notMeant")}
          </button>
          <button type="button" className={chip} onClick={() => p.onReact("changed")} disabled={p.disabled || !p.canReferenceOwn} title={p.canReferenceOwn ? undefined : ownHint}>
            <RefreshCw size={15} aria-hidden /> {t("react.changed")}
          </button>
        </div>

        {p.intent && (
          <p className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-ember-soft px-3 py-2 text-sm font-medium text-ember">
            <span>{t(p.intent.type === "clarify" ? "composer.intent.clarify" : "composer.intent.revise")}</span>
            <button type="button" onClick={p.onClearIntent} aria-label={t("composer.cancel")} className="rounded-full p-1 hover:bg-ember/10"><X size={14} aria-hidden /></button>
          </p>
        )}

        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="composer" className="sr-only">{t("composer.label")}</label>
            <textarea
              id="composer"
              ref={ref}
              rows={2}
              value={text}
              maxLength={MAX_MESSAGE_LENGTH + 100 /* allow pasting over, then show a clear error */}
              disabled={p.disabled}
              placeholder={p.disabled && p.disabledReason ? p.disabledReason : placeholder}
              aria-describedby="composer-help"
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
                const has = e.target.value.trim().length > 0;
                p.onDraft(has);
                p.onTyping(has);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!p.disabled) submit();
                }
              }}
              className="block max-h-40 min-h-[3.5rem] w-full resize-none rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none transition placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/15 disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={p.disabled || !text.trim()}
            aria-label={sendLabel}
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink px-5 font-semibold text-paper transition hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            <span className="hidden sm:inline">{sendLabel}</span> <SendHorizontal size={18} aria-hidden />
          </button>
        </div>
        <div id="composer-help" className="mt-1.5 flex min-h-5 items-center justify-between gap-3 text-xs text-muted">
          {error ? <span role="alert" className="font-semibold text-ember">{t(error)}</span> : <span>{t("composer.help")}</span>}
          <span className={remaining < 0 ? "font-semibold text-ember" : remaining < 80 ? "text-amber" : ""}>{text.length}/{MAX_MESSAGE_LENGTH}</span>
        </div>
      </div>
    </div>
  );
}
