import type { ReactionKey } from "./reactions";

export type Profile = { id: string; name: string; lang: string };

export type ChatMessage = {
  kind: "message";
  id: string;
  senderId: string;
  senderName: string;
  senderLang: string;
  text: string;
  ts: number;
  /** Set when this message clarifies or replaces an earlier one. */
  intent?: { type: "clarify" | "revise"; refId: string };
  /** Demo mode only: a pre-written sample translation (never from a real service). */
  sampleTranslation?: string;
};

export type ReactionEvent = {
  kind: "reaction";
  id: string;
  reaction: ReactionKey;
  senderId: string;
  senderName: string;
  senderLang: string;
  ts: number;
  targetId?: string;
};

export type TimelineItem = ChatMessage | ReactionEvent;

export type Participant = { id: string; name: string; lang: string; joinedAt: number };

export type Connection = "connecting" | "connected" | "reconnecting" | "error" | "demo";

export type SendStatus = "sending" | "sent" | "failed";
