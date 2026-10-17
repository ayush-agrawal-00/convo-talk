import { isLanguageCode } from "./languages";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const ROOM_ID_RE = /^[a-z0-9]{6,24}$/;

export function generateRoomId(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type Stored = { name: string; lang: string };

const PREFILL_KEY = "convotalk:prefill";
const sessionKey = (roomId: string) => `convotalk:session:${roomId}`;
const CLIENT_ID_KEY = "convotalk:client-id";

function parseStored(raw: string | null): Stored | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.name === "string" && isLanguageCode(v.lang)) return { name: v.name, lang: v.lang };
  } catch {
    /* corrupted storage: treat as absent */
  }
  return null;
}

/** Remembered across visits so the form is prefilled. */
export function loadPrefill(): Stored | null {
  return parseStored(window.localStorage.getItem(PREFILL_KEY));
}

/** Per-tab id, so two tabs in one browser behave as two people. */
export function getClientId(): string {
  let id = window.sessionStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = uid();
    window.sessionStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

/** Per-tab, per-room identity: skips the join form on reload. */
export function loadSessionProfile(roomId: string): Stored | null {
  return parseStored(window.sessionStorage.getItem(sessionKey(roomId)));
}

export function saveSessionProfile(roomId: string, p: Stored) {
  window.sessionStorage.setItem(sessionKey(roomId), JSON.stringify(p));
  window.localStorage.setItem(PREFILL_KEY, JSON.stringify(p));
}

export function buildInviteUrl(roomId: string, host: Stored): string {
  const u = new URL(`/room/${roomId}`, window.location.origin);
  u.searchParams.set("l", host.lang);
  u.searchParams.set("n", host.name);
  return u.toString();
}
