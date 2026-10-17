"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, FlaskConical, Hand, TriangleAlert } from "lucide-react";
import { Composer, type ComposerIntent } from "./Composer";
import { ConnectionBadge } from "./ConnectionBadge";
import { useI18n } from "./I18nProvider";
import { LocaleToggle } from "./LocaleToggle";
import { MessageBubble, ReactionPill } from "./MessageBubble";
import { useRoom } from "@/hooks/useRoom";
import { useTranslationStatus } from "@/hooks/useServerConfig";
import { useTranslations } from "@/hooks/useTranslations";
import { getLanguage, LANGUAGES } from "@/lib/languages";
import type { ReactionKey } from "@/lib/reactions";
import { buildInviteUrl, saveSessionProfile } from "@/lib/rooms";
import type { ChatMessage, Profile } from "@/lib/types";

export function Chat({ roomId, profile, onProfile }: { roomId: string; profile: Profile; onProfile: (p: Profile) => void }) {
  const { t, langName } = useI18n();
  const room = useRoom(roomId, profile);
  const translationStatus = useTranslationStatus();
  const translationUnavailable = !room.demo && translationStatus === "off";
  const tr = useTranslations({ items: room.items, myId: profile.id, myLang: profile.lang, enabled: !room.demo && (translationStatus === "on" || translationStatus === "unknown") });

  const peer = room.peers[0];
  const [intent, setIntent] = useState<ComposerIntent | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [drafting, setDrafting] = useState(false);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const [inviteUrl, setInviteUrl] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInviteUrl(buildInviteUrl(roomId, profile)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [roomId, profile]);

  const lastMine = useMemo(
    () => [...room.items].reverse().find((i): i is ChatMessage => i.kind === "message" && i.senderId === profile.id),
    [room.items, profile.id],
  );
  const { revised, flagged, byId } = useMemo(() => {
    const revised = new Set<string>();
    const flagged = new Set<string>();
    const byId = new Map<string, ChatMessage>();
    for (const i of room.items) {
      if (i.kind === "message") byId.set(i.id, i);
      else if (i.targetId) (i.reaction === "changed" ? revised : i.reaction === "notMeant" ? flagged : new Set<string>()).add(i.targetId);
    }
    return { revised, flagged, byId };
  }, [room.items]);

  const typingNames = Object.values(room.typing);
  const bothTyping = drafting && typingNames.length > 0;

  // Keep the newest message in view, but don't yank someone reading history.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const last = room.items[room.items.length - 1];
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom || last?.senderId === profile.id) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [room.items, typingNames.length, profile.id]);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopy("copied");
      setTimeout(() => setCopy("idle"), 2000);
    } catch {
      setCopy("failed");
    }
  }

  function react(key: ReactionKey) {
    if (key === "wait") return room.sendReaction("wait");
    if (!lastMine) return;
    room.sendReaction(key, lastMine.id);
    setIntent({ type: key === "notMeant" ? "clarify" : "revise", refId: lastMine.id });
    setFocusSignal((n) => n + 1);
  }

  function changeLang(lang: string) {
    const next = { ...profile, lang };
    saveSessionProfile(roomId, next);
    onProfile(next);
  }

  if (room.isFull) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">{t("room.full.title")}</h1>
        <p className="mt-3 text-muted">{t("room.full.body")}</p>
        <Link href="/" className="mt-6 inline-flex w-fit rounded-full bg-ink px-5 py-3 font-semibold text-paper">{t("room.full.cta")}</Link>
      </main>
    );
  }

  const holdByOther = room.hold && room.hold.byId !== profile.id;
  const holdByMe = room.hold && room.hold.byId === profile.id;
  const sameLang = peer && peer.lang === profile.lang;
  const composerDisabled = !room.demo && room.connection !== "connected";

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-line bg-paper px-3 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-display text-xl font-semibold tracking-tight">convoTalk</Link>
              <LocaleToggle />
            </div>
            <div className="flex items-center gap-2">
              <ConnectionBadge connection={room.connection} />
              <button
                onClick={copyInvite}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3.5 py-1.5 text-xs font-semibold text-paper transition hover:bg-ember hover:border-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                {copy === "copied" ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                {copy === "copied" ? t("chat.copied") : t("chat.copy")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Speaker name={profile.name} you speaking={drafting}>
              <label className="sr-only" htmlFor="my-lang">{t("chat.myLang")}</label>
              <select
                id="my-lang"
                value={profile.lang}
                onChange={(e) => changeLang(e.target.value)}
                className="mt-0.5 max-w-full rounded-md border border-transparent bg-transparent py-0.5 text-xs text-muted outline-none hover:border-line focus:border-ink"
              >
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            </Speaker>
            {peer ? (
              <Speaker name={peer.name} speaking={typingNames.length > 0}>
                <span className="text-xs text-muted">{getLanguage(peer.lang).native}</span>
              </Speaker>
            ) : (
              <Speaker name={t("chat.waitingName")} empty><span className="text-xs text-muted">{t("chat.waitingSub")}</span></Speaker>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-2 px-3 pt-3 sm:px-6 empty:hidden">
        {room.demo && (
          <Banner tone="demo" icon={<FlaskConical size={16} aria-hidden />}>
            <strong>{t("banner.demo.title")}</strong> {t("banner.demo.body")}
          </Banner>
        )}
        {room.connectionError && (
          <Banner tone="error" icon={<TriangleAlert size={16} aria-hidden />}>
            {t(room.connectionError.key)}{room.connectionError.detail ? ` (${room.connectionError.detail})` : ""}
          </Banner>
        )}
        {translationUnavailable && (
          <Banner tone="warn" icon={<TriangleAlert size={16} aria-hidden />}>
            {t("banner.noTranslation")}
          </Banner>
        )}
        {sameLang && (
          <Banner tone="warn" icon={<TriangleAlert size={16} aria-hidden />}>
            {t("banner.sameLang", { lang: langName(profile.lang) })}
          </Banner>
        )}
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-5 sm:px-6" role="log" aria-live="polite" aria-label={t("chat.conversation")}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {room.items.length === 0 ? (
            <Empty t={t} langName={langName} connected={room.connection === "connected"} hasPeer={Boolean(peer)} peerLang={peer?.lang} inviteUrl={inviteUrl} onCopy={copyInvite} copy={copy} />
          ) : (
            room.items.map((item) => {
              const mine = item.senderId === profile.id;
              if (item.kind === "reaction") {
                return <ReactionPill key={item.id} ev={item} mine={mine} status={room.statuses[item.id]} onRetry={() => room.retrySend(item.id)} />;
              }
              const ref = item.intent ? byId.get(item.intent.refId) : undefined;
              return (
                <MessageBubble
                  key={item.id}
                  msg={item}
                  mine={mine}
                  myLang={profile.lang}
                  status={room.statuses[item.id]}
                  translation={tr.get(item)}
                  translationUnavailable={translationUnavailable}
                  revised={revised.has(item.id)}
                  flagged={flagged.has(item.id)}
                  refText={ref ? (ref.text.length > 70 ? ref.text.slice(0, 70) + "…" : ref.text) : undefined}
                  onRetrySend={() => room.retrySend(item.id)}
                  onRetryTranslate={() => tr.retry(item.id)}
                />
              );
            })
          )}
          {typingNames.length > 0 && (
            <p className="anim-rise flex items-center gap-2 pl-1 text-sm text-muted" role="status">
              <span className="flex gap-1" aria-hidden><i className="typing-dot h-1.5 w-1.5 rounded-full bg-ember" /><i className="typing-dot h-1.5 w-1.5 rounded-full bg-ember" /><i className="typing-dot h-1.5 w-1.5 rounded-full bg-ember" /></span>
              {t(bothTyping ? "chat.typingBoth" : "chat.typing", { names: typingNames.join(", ") })}
            </p>
          )}
        </div>
      </div>

      {room.hold && (
        <div className="px-3 sm:px-6">
          <div role="status" className="anim-rise mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl bg-ember px-4 py-3 text-sm font-medium text-white">
            <span className="flex items-center gap-2"><Hand size={16} aria-hidden />
              {holdByOther ? t("hold.other", { name: room.hold.byName }) : t("hold.me", { name: peer?.name ?? t("hold.them") })}
            </span>
            {holdByMe && <button onClick={room.release} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ember">{t("hold.release")}</button>}
          </div>
        </div>
      )}

      <Composer
        disabled={composerDisabled}
        disabledReason={composerDisabled ? t("composer.disabled") : undefined}
        sendAnyway={Boolean(holdByOther)}
        intent={intent}
        focusSignal={focusSignal}
        canReferenceOwn={Boolean(lastMine)}
        onClearIntent={() => setIntent(null)}
        onSend={(text) => room.sendMessage(text, intent ?? undefined)}
        onTyping={room.notifyTyping}
        onReact={react}
        onDraft={setDrafting}
      />
    </div>
  );
}

function Speaker({ name, you, speaking, empty, children }: { name: string; you?: boolean; speaking?: boolean; empty?: boolean; children?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-2 ${empty ? "border-dashed border-line" : "border-line bg-card"}`}>
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${you ? "bg-ink text-paper" : empty ? "bg-sand text-muted" : "bg-ember-soft text-ember"} ${speaking ? "anim-ring" : ""}`}
      >
        {empty ? "?" : name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{name}{you && <span className="font-normal text-muted"> ({t("chat.you")})</span>}</span>
        {children}
      </span>
      {speaking && <span className="sr-only">{t("chat.typingSr")}</span>}
    </div>
  );
}

const TONES = {
  demo: "border-ink/30 bg-sand demo-stripes text-ink",
  warn: "border-amber/40 bg-[#f7ead2] text-[#5c3a05]",
  error: "border-ember/40 bg-ember-soft text-ember",
};

function Banner({ tone, icon, children }: { tone: keyof typeof TONES; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${TONES[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span><span>{children}</span>
    </p>
  );
}

function Empty({ t, langName, connected, hasPeer, peerLang, inviteUrl, onCopy, copy }: {
  t: ReturnType<typeof useI18n>["t"]; langName: (code: string) => string; connected: boolean; hasPeer: boolean; peerLang?: string; inviteUrl: string; onCopy: () => void; copy: "idle" | "copied" | "failed";
}) {
  if (!connected && !hasPeer) {
    return (
      <div className="py-16 text-center" role="status">
        <div className="skeleton mx-auto h-6 w-48 rounded" />
        <p className="mt-4 text-sm text-muted">{t("empty.connecting")}</p>
      </div>
    );
  }
  return (
    <div className="py-10 text-center sm:py-16">
      {hasPeer ? (
        <>
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">{t("empty.firstTitle")}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{peerLang ? t("empty.firstBody", { lang: langName(peerLang) }) : t("empty.firstBodyGeneric")}</p>
        </>
      ) : (
        <>
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">{t("empty.waitTitle")}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{t("empty.waitBody")}</p>
          <div className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-2xl border border-line bg-card p-2">
            <input readOnly value={inviteUrl} aria-label={t("chat.inviteAria")} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
            <button onClick={onCopy} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ember">
              {copy === "copied" ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />} {copy === "copied" ? t("chat.copied") : t("chat.copyShort")}
            </button>
          </div>
          {copy === "failed" && <p role="alert" className="mt-2 text-sm font-medium text-ember">{t("empty.clipboardFail")}</p>}
        </>
      )}
    </div>
  );
}
