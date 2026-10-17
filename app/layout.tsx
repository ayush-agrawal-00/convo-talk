import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "convoTalk — argue across languages, understand each other",
  description:
    "convoTalk translates every message live so two people who speak different languages can actually disagree, interrupt, clarify, and change their minds.",
  openGraph: {
    type: "website",
    siteName: "convoTalk",
    title: "convoTalk — argue across languages, understand each other",
    description: "Live-translated conversations for two people who speak different languages. No account needed.",
  },
  twitter: { card: "summary", title: "convoTalk", description: "Live-translated conversations for two people who speak different languages." },
};

export const viewport: Viewport = { themeColor: "#f4eee3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
