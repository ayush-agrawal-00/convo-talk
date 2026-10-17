"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Chat } from "./Chat";
import { useI18n } from "./I18nProvider";
import { JoinForm, type JoinHint } from "./JoinForm";
import { isLanguageCode } from "@/lib/languages";
import { isLocale } from "@/lib/i18n";
import { MAX_NAME_LENGTH } from "@/lib/limits";
import { getClientId, loadSessionProfile, ROOM_ID_RE, saveSessionProfile } from "@/lib/rooms";
import type { Profile } from "@/lib/types";

type Phase = { kind: "loading" } | { kind: "join"; hint: JoinHint } | { kind: "chat"; profile: Profile };

export function RoomClient({ roomId }: { roomId: string }) {
  const { t, setLocale } = useI18n();
  const valid = ROOM_ID_RE.test(roomId);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  useEffect(() => {
    if (!valid) return;
    const existing = loadSessionProfile(roomId);
    if (existing) {
      // This tab's room identity decides the interface language, even if another tab changed the saved default.
      if (isLocale(existing.lang)) setLocale(existing.lang);
      setPhase({ kind: "chat", profile: { id: getClientId(), ...existing } }); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const l = q.get("l");
    const n = q.get("n");
    setPhase({
      kind: "join",
      hint: { lang: isLanguageCode(l) ? l : undefined, name: n ? n.slice(0, MAX_NAME_LENGTH) : undefined },
    });
  }, [roomId, valid, setLocale]);

  if (!valid) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">{t("room.invalid.title")}</h1>
        <p className="mt-3 text-muted">{t("room.invalid.body")}</p>
        <Link href="/" className="mt-6 inline-flex w-fit rounded-full bg-ink px-5 py-3 font-semibold text-paper">{t("room.invalid.cta")}</Link>
      </main>
    );
  }

  if (phase.kind === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center" role="status" aria-label={t("room.loading")}>
        <div className="skeleton h-6 w-40 rounded" />
      </main>
    );
  }

  if (phase.kind === "join") {
    return (
      <JoinForm
        hint={phase.hint}
        onJoin={(p) => {
          saveSessionProfile(roomId, p);
          setPhase({ kind: "chat", profile: { id: getClientId(), ...p } });
        }}
      />
    );
  }

  return <Chat roomId={roomId} profile={phase.profile} onProfile={(profile) => setPhase({ kind: "chat", profile })} />;
}
