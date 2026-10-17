"use client";
import { useI18n } from "./I18nProvider";
import { useTranslationStatus } from "@/hooks/useServerConfig";
import { isSupabaseConfigured } from "@/lib/supabase";

type Tone = "neutral" | "warn";

function Chip({ tone, label, hint }: { tone: Tone; label: string; hint: string }) {
  return (
    <span
      title={hint}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-3 py-1 text-xs font-medium text-muted"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${tone === "warn" ? "bg-amber" : "bg-muted/50"}`} aria-hidden />
      {label}
      <span className="sr-only">. {hint}</span>
    </span>
  );
}

/**
 * Setup readout, not a health check. Environment variables being present doesn't prove a service is
 * reachable, so configured services get neutral labels and only missing configuration is flagged.
 */
export function StatusStrip() {
  const { t } = useI18n();
  const translation = useTranslationStatus();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("status.aria")} aria-live="polite">
      <Chip
        tone={isSupabaseConfigured ? "neutral" : "warn"}
        label={t(isSupabaseConfigured ? "status.rt.ok" : "status.rt.demo")}
        hint={t(isSupabaseConfigured ? "status.rt.okHint" : "status.rt.demoHint")}
      />
      {translation === "checking" ? (
        <Chip tone="neutral" label={t("status.tr.checking")} hint={t("status.tr.checking")} />
      ) : translation === "on" ? (
        <Chip tone="neutral" label={t("status.tr.ok")} hint={t("status.tr.okHint")} />
      ) : translation === "off" ? (
        <Chip tone="warn" label={t("status.tr.off")} hint={t("status.tr.offHint")} />
      ) : (
        <Chip tone="warn" label={t("status.tr.unknown")} hint={t("status.tr.unknownHint")} />
      )}
    </div>
  );
}
