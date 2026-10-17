import type { MessageKey } from "./i18n";

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_NAME_LENGTH = 24;
export const MAX_CONTEXT_ITEMS = 4;
export const MAX_CONTEXT_LENGTH = 300;
/** Server-side ceiling for a single translation request. */
export const MAX_TRANSLATE_LENGTH = 1000;

/** Validators return a dictionary key (localized by the caller) or null when valid. */
export function validateName(raw: string): MessageKey | null {
  const name = raw.trim();
  if (!name) return "err.nameEmpty";
  if (name.length > MAX_NAME_LENGTH) return "err.nameTooLong";
  return null;
}

export function validateMessage(raw: string): MessageKey | null {
  const text = raw.trim();
  if (!text) return "err.empty";
  if (text.length > MAX_MESSAGE_LENGTH) return "err.tooLong";
  return null;
}
