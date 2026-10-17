import type { MessageKey } from "./i18n";

export type ReactionKey = "wait" | "notMeant" | "changed";

export const REACTION_KEYS: ReactionKey[] = ["wait", "notMeant", "changed"];

/** Dictionary keys for the in-conversation phrase of each reaction (localized per viewer). */
export const REACTION_PILL_KEY: Record<ReactionKey, MessageKey> = {
  wait: "pill.wait",
  notMeant: "pill.notMeant",
  changed: "pill.changed",
};

export function isReactionKey(v: unknown): v is ReactionKey {
  return v === "wait" || v === "notMeant" || v === "changed";
}
