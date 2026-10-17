"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_CONTEXT_LENGTH } from "@/lib/limits";
import type { MessageKey } from "@/lib/i18n";
import { translationErrorKey } from "@/lib/i18n";
import type { TimelineItem } from "@/lib/types";

export type Translation =
  | { status: "loading" }
  | { status: "done"; text: string; sample?: boolean }
  | { status: "error"; key: MessageKey };

/**
 * Translates every incoming message into the viewer's language via /api/translate.
 * Entries are keyed by message+language so switching language re-translates.
 */
export function useTranslations(opts: {
  items: TimelineItem[];
  myId: string;
  myLang: string;
  /** false → don't call the API (demo mode or no key configured). */
  enabled: boolean;
}) {
  const { items, myId, myLang, enabled } = opts;
  const [results, setResults] = useState<Record<string, Translation>>({});
  const started = useRef(new Set<string>());

  const run = useCallback(async (key: string, index: number, list: TimelineItem[]) => {
    const msg = list[index];
    if (msg.kind !== "message") return;
    const context = list
      .slice(0, index)
      .filter((i): i is Extract<TimelineItem, { kind: "message" }> => i.kind === "message")
      .slice(-4)
      .map((m) => `${m.senderName}: ${m.text}`.slice(0, MAX_CONTEXT_LENGTH));
    setResults((r) => ({ ...r, [key]: { status: "loading" } }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.text, from: msg.senderLang, to: myLang, context }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.translation !== "string") {
        setResults((r) => ({ ...r, [key]: { status: "error", key: translationErrorKey(data.code) } }));
        return;
      }
      setResults((r) => ({ ...r, [key]: { status: "done", text: data.translation } }));
    } catch {
      setResults((r) => ({ ...r, [key]: { status: "error", key: "tr.client_network" } }));
    }
  }, [myLang]);

  useEffect(() => {
    items.forEach((item, index) => {
      if (item.kind !== "message" || item.senderId === myId || item.senderLang === myLang) return;
      const key = `${item.id}:${myLang}`;
      if (started.current.has(key)) return;
      if (item.sampleTranslation) return; // demo sample; handled in lookup, never sent to the API
      if (!enabled) return;
      started.current.add(key);
      void run(key, index, items);
    });
  }, [items, myId, myLang, enabled, run]);

  const retry = useCallback((id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index >= 0) void run(`${id}:${myLang}`, index, items);
  }, [items, myLang, run]);

  /** undefined → nothing to show (own message, same language, or translation unavailable). */
  const get = useCallback((item: TimelineItem): Translation | undefined => {
    if (item.kind !== "message" || item.senderId === myId || item.senderLang === myLang) return undefined;
    if (item.sampleTranslation) return { status: "done", text: item.sampleTranslation, sample: true };
    return results[`${item.id}:${myLang}`];
  }, [results, myId, myLang]);

  return { get, retry };
}
