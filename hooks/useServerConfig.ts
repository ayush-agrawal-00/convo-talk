"use client";
import { useEffect, useState } from "react";

/** "on" means the server reports a key is present. It is a setup check, not proof the provider accepts it. */
export type TranslationStatus = "checking" | "on" | "off" | "unknown";

/** Asks the server whether a translation key is configured (the key itself never leaves the server). */
export function useTranslationStatus(): TranslationStatus {
  const [status, setStatus] = useState<TranslationStatus>("checking");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/translate")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => !cancelled && setStatus(d.translationConfigured ? "on" : "off"))
      .catch(() => !cancelled && setStatus("unknown"));
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}
