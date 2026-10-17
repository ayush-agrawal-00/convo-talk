"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { isLanguageCode } from "@/lib/languages";
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH, validateMessage } from "@/lib/limits";
import type { MessageKey } from "@/lib/i18n";
import { isReactionKey, type ReactionKey } from "@/lib/reactions";
import { uid } from "@/lib/rooms";
import { DEMO_LINES, DEMO_PARTNER } from "@/lib/demo";
import type {
  ChatMessage, Connection, Participant, Profile, ReactionEvent, SendStatus, TimelineItem,
} from "@/lib/types";

const HOLD_MS = 20_000;
const TYPING_EXPIRY_MS = 3_500;
const TYPING_THROTTLE_MS = 2_000;
const STORAGE_CAP = 200;

type Hold = { byId: string; byName: string; until: number };
type Intent = { type: "clarify" | "revise"; refId: string };

const storeKey = (roomId: string) => `convotalk:items:${roomId}`;

function loadItems(roomId: string): TimelineItem[] {
  try {
    const raw = window.sessionStorage.getItem(storeKey(roomId));
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.map(parseItem).filter((x): x is TimelineItem => x !== null) : [];
  } catch {
    return [];
  }
}

/** Incoming realtime payloads are untrusted: validate shape and clamp sizes. */
function parseItem(p: unknown): TimelineItem | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length > 64) return null;
  if (typeof o.senderId !== "string" || o.senderId.length > 64) return null;
  if (typeof o.senderName !== "string" || !isLanguageCode(o.senderLang)) return null;
  if (typeof o.ts !== "number" || !Number.isFinite(o.ts)) return null;
  const base = { id: o.id, senderId: o.senderId, senderName: o.senderName.slice(0, MAX_NAME_LENGTH), senderLang: o.senderLang, ts: o.ts };

  if (o.kind === "reaction") {
    if (!isReactionKey(o.reaction)) return null;
    return { ...base, kind: "reaction", reaction: o.reaction, targetId: typeof o.targetId === "string" ? o.targetId.slice(0, 64) : undefined };
  }
  if (o.kind === "message") {
    if (typeof o.text !== "string" || !o.text.trim() || o.text.length > MAX_MESSAGE_LENGTH) return null;
    const i = o.intent as Record<string, unknown> | undefined;
    const intent: Intent | undefined =
      i && (i.type === "clarify" || i.type === "revise") && typeof i.refId === "string"
        ? { type: i.type, refId: i.refId.slice(0, 64) }
        : undefined;
    return {
      ...base,
      kind: "message",
      text: o.text,
      intent,
      sampleTranslation: typeof o.sampleTranslation === "string" ? o.sampleTranslation : undefined,
    };
  }
  return null;
}

export function useRoom(roomId: string, profile: Profile) {
  const supabase = useMemo(() => getSupabase(), []);
  const demo = supabase === null;

  const [connection, setConnection] = useState<Connection>(demo ? "demo" : "connecting");
  const [connectionError, setConnectionError] = useState<{ key: MessageKey; detail?: string } | null>(null);
  const [items, setItems] = useState<TimelineItem[]>(() => (demo ? [] : loadItems(roomId)));
  const [statuses, setStatuses] = useState<Record<string, SendStatus>>({});
  const [peers, setPeers] = useState<Participant[]>(demo ? [{ ...DEMO_PARTNER, joinedAt: 0 }] : []);
  const [crowd, setCrowd] = useState<Participant[]>([]);
  const [typing, setTyping] = useState<Record<string, string>>({});
  const [hold, setHold] = useState<Hold | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const profileRef = useRef(profile);
  const joinedAtRef = useRef(Date.now());
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTypingSent = useRef(0);
  const demoIndex = useRef(0);
  const pendingPayloads = useRef<Record<string, TimelineItem>>({});

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Persist the conversation for this tab so a refresh doesn't wipe it (live mode only; there is no server history).
  useEffect(() => {
    if (demo) return;
    try {
      window.sessionStorage.setItem(storeKey(roomId), JSON.stringify(items.slice(-STORAGE_CAP)));
    } catch {
      /* storage full or unavailable: conversation just won't survive a refresh */
    }
  }, [items, roomId, demo]);

  const clearTyping = useCallback((id: string) => {
    clearTimeout(typingTimers.current[id]);
    delete typingTimers.current[id];
    setTyping((t) => {
      if (!(id in t)) return t;
      const { [id]: _removed, ...rest } = t;
      void _removed;
      return rest;
    });
  }, []);

  const showTyping = useCallback((id: string, name: string) => {
    setTyping((t) => ({ ...t, [id]: name }));
    clearTimeout(typingTimers.current[id]);
    typingTimers.current[id] = setTimeout(() => clearTyping(id), TYPING_EXPIRY_MS);
  }, [clearTyping]);

  const receive = useCallback((item: TimelineItem) => {
    if (item.senderId === profileRef.current.id) return;
    setItems((prev) => (prev.some((x) => x.id === item.id) ? prev : [...prev, item]));
    clearTyping(item.senderId);
    if (item.kind === "message") {
      setHold((h) => (h && h.byId === item.senderId ? null : h));
    } else if (item.reaction === "wait") {
      setHold({ byId: item.senderId, byName: item.senderName, until: Date.now() + HOLD_MS });
    }
  }, [clearTyping]);

  // --- Live transport -------------------------------------------------------
  useEffect(() => {
    if (!supabase) return;
    const me = profileRef.current;
    const channel = supabase.channel(`convotalk:${roomId}`, {
      config: { broadcast: { self: false, ack: true }, presence: { key: me.id } },
    });
    channelRef.current = channel;

    const onItem = ({ payload }: { payload: unknown }) => {
      const item = parseItem(payload);
      if (item) receive(item);
    };

    channel
      .on("broadcast", { event: "item" }, onItem)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const p = payload as { senderId?: unknown; senderName?: unknown; typing?: unknown };
        if (typeof p?.senderId !== "string" || p.senderId === profileRef.current.id) return;
        if (p.typing === true) showTyping(p.senderId, String(p.senderName ?? "Someone").slice(0, MAX_NAME_LENGTH));
        else clearTyping(p.senderId);
      })
      .on("broadcast", { event: "release" }, ({ payload }) => {
        const id = (payload as { senderId?: unknown })?.senderId;
        setHold((h) => (h && h.byId === id ? null : h));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ id: string; name: string; lang: string; joinedAt: number }>();
        const all: Participant[] = [];
        for (const metas of Object.values(state)) {
          const m = metas[metas.length - 1];
          if (m && typeof m.id === "string" && isLanguageCode(m.lang)) {
            all.push({ id: m.id, name: String(m.name).slice(0, MAX_NAME_LENGTH), lang: m.lang, joinedAt: Number(m.joinedAt) || 0 });
          }
        }
        setCrowd(all);
        setPeers(all.filter((p) => p.id !== profileRef.current.id));
      })
      .subscribe(async (status, err) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          setConnectionError(null);
          const p = profileRef.current;
          const res = await channel.track({ id: p.id, name: p.name, lang: p.lang, joinedAt: joinedAtRef.current });
          if (res !== "ok") setConnectionError({ key: "conn.err.presence" });
        } else if (status === "CHANNEL_ERROR") {
          setConnection("error");
          setConnectionError({ key: "conn.err.channel", detail: err?.message });
        } else if (status === "TIMED_OUT") {
          setConnection("error");
          setConnectionError({ key: "conn.err.timeout" });
        } else if (status === "CLOSED") {
          setConnection((c) => (c === "error" ? c : "reconnecting"));
        }
      });

    const timers = typingTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [supabase, roomId, receive, showTyping, clearTyping]);

  // Keep presence in sync when the user renames / switches language.
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || connection !== "connected") return;
    void channel.track({ id: profile.id, name: profile.name, lang: profile.lang, joinedAt: joinedAtRef.current });
  }, [profile.id, profile.name, profile.lang, connection]);

  // Hold expiry.
  useEffect(() => {
    if (!hold) return;
    const t = setTimeout(() => setHold(null), Math.max(0, hold.until - Date.now()));
    return () => clearTimeout(t);
  }, [hold]);

  // --- Demo transport -------------------------------------------------------
  const demoSpeak = useCallback(() => {
    const line = DEMO_LINES[Math.min(demoIndex.current, DEMO_LINES.length - 1)];
    demoIndex.current += 1;
    receive({
      kind: "message", id: uid(), senderId: DEMO_PARTNER.id, senderName: DEMO_PARTNER.name,
      senderLang: DEMO_PARTNER.lang, text: line.text, sampleTranslation: line.sample, ts: Date.now(),
    });
  }, [receive]);

  useEffect(() => {
    if (!demo) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (demoIndex.current === 0) {
      timers.push(setTimeout(() => showTyping(DEMO_PARTNER.id, DEMO_PARTNER.name), 600));
      timers.push(setTimeout(demoSpeak, 1800));
    }
    const t = typingTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      Object.values(t).forEach(clearTimeout);
    };
  }, [demo, demoSpeak, showTyping]);

  const scheduleDemoReply = useCallback(() => {
    setTimeout(() => showTyping(DEMO_PARTNER.id, DEMO_PARTNER.name), 500);
    setTimeout(demoSpeak, 2200);
  }, [demoSpeak, showTyping]);

  // --- Sending --------------------------------------------------------------
  const transmit = useCallback(async (item: TimelineItem) => {
    const channel = channelRef.current;
    if (demo) {
      setStatuses((s) => ({ ...s, [item.id]: "sent" }));
      return;
    }
    if (!channel || connection !== "connected") {
      setStatuses((s) => ({ ...s, [item.id]: "failed" }));
      return;
    }
    setStatuses((s) => ({ ...s, [item.id]: "sending" }));
    try {
      const res = await channel.send({ type: "broadcast", event: "item", payload: item });
      setStatuses((s) => ({ ...s, [item.id]: res === "ok" ? "sent" : "failed" }));
    } catch {
      setStatuses((s) => ({ ...s, [item.id]: "failed" }));
    }
  }, [demo, connection]);

  const sendMessage = useCallback((raw: string, intent?: Intent): MessageKey | null => {
    const problem = validateMessage(raw);
    if (problem) return problem;
    const p = profileRef.current;
    const msg: ChatMessage = {
      kind: "message", id: uid(), senderId: p.id, senderName: p.name, senderLang: p.lang,
      text: raw.trim(), ts: Date.now(), intent,
    };
    pendingPayloads.current[msg.id] = msg;
    setItems((prev) => [...prev, msg]);
    setHold((h) => (h && h.byId === p.id ? null : h));
    void transmit(msg);
    if (demo) scheduleDemoReply();
    return null;
  }, [transmit, demo, scheduleDemoReply]);

  const sendReaction = useCallback((reaction: ReactionKey, targetId?: string) => {
    const p = profileRef.current;
    const ev: ReactionEvent = {
      kind: "reaction", id: uid(), reaction, senderId: p.id, senderName: p.name, senderLang: p.lang, ts: Date.now(), targetId,
    };
    pendingPayloads.current[ev.id] = ev;
    setItems((prev) => [...prev, ev]);
    if (reaction === "wait") setHold({ byId: p.id, byName: p.name, until: Date.now() + HOLD_MS });
    void transmit(ev);
  }, [transmit]);

  const retrySend = useCallback((id: string) => {
    const item = pendingPayloads.current[id] ?? items.find((i) => i.id === id);
    if (item) void transmit(item);
  }, [transmit, items]);

  const release = useCallback(() => {
    setHold(null);
    void channelRef.current?.send({ type: "broadcast", event: "release", payload: { senderId: profileRef.current.id } });
  }, []);

  const notifyTyping = useCallback((isTyping: boolean) => {
    const channel = channelRef.current;
    if (!channel || connection !== "connected") return;
    const now = Date.now();
    if (isTyping && now - lastTypingSent.current < TYPING_THROTTLE_MS) return;
    lastTypingSent.current = isTyping ? now : 0;
    const p = profileRef.current;
    void channel.send({ type: "broadcast", event: "typing", payload: { senderId: p.id, senderName: p.name, typing: isTyping } });
  }, [connection]);

  // Third arrival is turned away; first two (by join time) own the room.
  const isFull = useMemo(() => {
    const everyone = crowd.some((c) => c.id === profile.id)
      ? crowd
      : [...crowd, { id: profile.id, name: profile.name, lang: profile.lang, joinedAt: joinedAtRef.current }];
    const sorted = [...everyone].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
    return sorted.findIndex((c) => c.id === profile.id) >= 2;
  }, [crowd, profile]);

  return {
    demo, connection, connectionError, items, statuses, peers, typing, hold, isFull,
    sendMessage, sendReaction, retrySend, release, notifyTyping,
  };
}
