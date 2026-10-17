"use client";
import { useI18n } from "./I18nProvider";
import type { MessageKey } from "@/lib/i18n";
import type { Connection } from "@/lib/types";

const MAP: Record<Connection, { label: MessageKey; dot: string; extra?: string }> = {
  connected: { label: "conn.connected", dot: "bg-moss" },
  connecting: { label: "conn.connecting", dot: "bg-amber animate-pulse" },
  reconnecting: { label: "conn.reconnecting", dot: "bg-amber animate-pulse" },
  error: { label: "conn.error", dot: "bg-ember" },
  demo: { label: "conn.demo", dot: "bg-ink", extra: "demo-stripes" },
};

export function ConnectionBadge({ connection }: { connection: Connection }) {
  const { t } = useI18n();
  const m = MAP[connection];
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold ${m.extra ?? ""}`}
    >
      <span className={`h-2 w-2 rounded-full ${m.dot}`} aria-hidden /> {t(m.label)}
    </span>
  );
}
