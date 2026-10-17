"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
      <h1 className="font-display text-4xl font-semibold">{t("room.invalid.title")}</h1>
      <p className="mt-3 text-muted">{t("room.invalid.body")}</p>
      <Link href="/" className="mt-6 inline-flex w-fit rounded-full bg-ink px-5 py-3 font-semibold text-paper">{t("room.invalid.cta")}</Link>
    </main>
  );
}
