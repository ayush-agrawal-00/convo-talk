// End-to-end check of the single-language model: each participant has ONE language selection that sets both
// their whole interface and the language they write in, independently per participant/browser.
//
// Needs: the app running (npm run dev / npm run start) WITH Supabase env configured, Google Chrome, and Node 22.18+.
//   BASE_URL=http://localhost:3000 npm run test:e2e
// /api/translate is mocked in the browser, so no Gemini quota is used and each request's from/to languages can be asserted.
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { en } from "../../lib/locales/en.ts";
import { translate } from "../../lib/i18n.ts";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const NAMES = { es: "Español", it: "Italiano", ja: "日本語", ar: "العربية", fr: "Français", en: "English" };

const browser = await chromium.launch({ executablePath: CHROME });
let passed = 0;
const ok = (cond, name) => {
  assert.ok(cond, `FAILED: ${name}`);
  console.log("PASS", name);
  passed++;
};

async function participant(name) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 850 }, locale: "en-US" });
  const page = await ctx.newPage();
  const translateRequests = [];
  await page.route("**/api/translate", async (route) => {
    const req = route.request();
    if (req.method() === "GET") return route.fulfill({ json: { translationConfigured: true } });
    const body = req.postDataJSON();
    translateRequests.push(body);
    return route.fulfill({ json: { translation: `«${body.from}→${body.to}» ${body.text}`, provider: "mock" } });
  });
  page.on("pageerror", (e) => console.log(`[${name} pageerror]`, e.message));
  return { page, translateRequests };
}

const htmlLang = (p) => p.getAttribute("html", "lang");
const connected = (page, locale) =>
  page.getByTestId("connection-status").filter({ hasText: translate(locale, "conn.connected") }).waitFor({ timeout: 20000 });

/** The whole visible interface (text + accessible labels) is in `locale`: expected strings present, English ones absent. */
async function interfaceIs(page, locale, keys) {
  const text = await page.evaluate(() => {
    const labels = [...document.querySelectorAll("[aria-label],[title],[placeholder]")]
      .flatMap((e) => ["aria-label", "title", "placeholder"].map((a) => e.getAttribute(a) ?? ""));
    return document.body.innerText + "\n" + labels.join("\n");
  });
  // innerText reflects CSS text-transform (e.g. uppercase eyebrows), so compare case-insensitively.
  const haystack = text.toLowerCase();
  const has = (s) => haystack.includes(s.toLowerCase());
  const missing = keys.filter((k) => !has(translate(locale, k)));
  const leaked = locale === "en" ? [] : keys.filter((k) => translate(locale, k) !== en[k] && has(en[k]));
  assert.deepEqual({ missing, leaked }, { missing: [], leaked: [] }, `interface not fully ${locale}`);
}

const ROOM_KEYS = ["chat.copy", "react.wait", "react.notMeant", "react.changed", "composer.help", "composer.send", "composer.reactions", "chat.myLang"];

try {
  const A = await participant("A");
  const B = await participant("B");

  // --- A picks Español on the landing page: the WHOLE page switches immediately
  await A.page.goto(BASE);
  await A.page.waitForSelector("h1");
  ok((await A.page.locator("label:has(svg) select").count()) === 0, "there is no separate interface-language selector");
  await A.page.selectOption("form select", "es");
  ok((await htmlLang(A.page)) === "es", "A: selecting Español sets the interface language");
  await interfaceIs(A.page, "es", ["landing.tagline", "landing.body", "form.name", "form.lang", "form.create", "form.noAccount", "landing.illustration"]);
  ok(true, "A: landing page is entirely Spanish");
  await A.page.fill('input[autocomplete="nickname"]', "Maya");
  await A.page.click("button[type=submit]");
  await A.page.waitForURL(/\/room\//);
  await connected(A.page, "es");
  ok((await A.page.inputValue("#my-lang")) === "es", "A: the same selection is the conversation language");
  await interfaceIs(A.page, "es", [...ROOM_KEYS, "empty.waitTitle"]);
  ok(true, "A: room interface is entirely Spanish");

  // --- B opens the invite and picks Italiano
  const invite = new URL(A.page.url());
  invite.search = "?l=es&n=Maya";
  await B.page.goto(invite.toString());
  await B.page.waitForSelector("h1");
  ok((await B.page.locator('option[value="es"]').isDisabled()), "B: the host's language can't be picked");
  await B.page.selectOption("form select", "it");
  ok((await htmlLang(B.page)) === "it", "B: selecting Italiano switches B's interface");
  ok((await htmlLang(A.page)) === "es", "A: unaffected by B's selection (still Spanish)");
  await B.page.fill('input[autocomplete="nickname"]', "Luca");
  await B.page.click("button[type=submit]");
  await connected(B.page, "it");
  await A.page.waitForSelector("header >> text=Luca", { timeout: 20000 });
  await interfaceIs(B.page, "it", ROOM_KEYS);
  ok(true, "B: room interface is entirely Italian");

  // --- A (Español) -> B (Italiano)
  await A.page.fill("#composer", "Nunca me dijiste que te ibas.");
  await A.page.press("#composer", "Enter");
  const card = B.page.locator("article", { hasText: "Maya" }).first();
  await card.locator("text=«es→it»").waitFor({ timeout: 20000 });
  const last = B.translateRequests.at(-1);
  ok(last.from === "es" && last.to === "it", "A's message is translated from Spanish into B's selected language (Italian)");
  const cardText = await card.innerText();
  ok(cardText.includes("Nunca me dijiste que te ibas."), "original text preserved");
  ok(cardText.includes("Maya"), "sender name preserved");
  ok(cardText.includes(translate("it", "msg.translation", { lang: NAMES.it })), "translation label is Italian and names the target language");
  ok(cardText.includes(translate("it", "msg.original", { lang: NAMES.es })), "original label names the source language (Español)");
  ok(/\d{1,2}[:.]\d{2}/.test(cardText), "timestamp present");

  // --- B (Italiano) -> A (Español)
  await B.page.fill("#composer", "Te l'ho detto due volte.");
  await B.page.press("#composer", "Enter");
  const cardA = A.page.locator("article", { hasText: "Luca" }).first();
  await cardA.locator("text=«it→es»").waitFor({ timeout: 20000 });
  ok(A.translateRequests.at(-1).from === "it" && A.translateRequests.at(-1).to === "es", "B's reply is translated from Italian into A's Spanish");
  ok((await cardA.innerText()).includes(translate("es", "msg.translation", { lang: NAMES.es })), "A sees Spanish labels");

  // --- B switches language in the room: whole interface AND conversation language change, only for B
  await B.page.selectOption("#my-lang", "ja");
  ok((await htmlLang(B.page)) === "ja", "B: switching language in the room switches B's interface");
  await interfaceIs(B.page, "ja", ROOM_KEYS);
  ok(true, "B: room interface is entirely Japanese");
  ok((await htmlLang(A.page)) === "es", "A: interface unchanged by B's switch");
  await A.page.waitForTimeout(1200);
  await A.page.fill("#composer", "Mañana hablamos.");
  await A.page.press("#composer", "Enter");
  await B.page.locator("text=«es→ja»").waitFor({ timeout: 20000 });
  ok(B.translateRequests.at(-1).to === "ja", "A's next message is translated into B's new language (Japanese)");

  // --- B switches to Arabic: only B goes right-to-left
  await B.page.selectOption("#my-lang", "ar");
  ok((await B.page.getAttribute("html", "dir")) === "rtl" && (await A.page.getAttribute("html", "dir")) === "ltr", "B: Arabic is right-to-left; A is unaffected");

  // --- A switches to French: A's messages now carry French as their source language
  await A.page.selectOption("#my-lang", "fr");
  ok((await htmlLang(A.page)) === "fr" && (await htmlLang(B.page)) === "ar", "A switches to French without changing B's interface");
  await interfaceIs(A.page, "fr", ROOM_KEYS);
  await A.page.waitForTimeout(1200);
  await A.page.fill("#composer", "À demain.");
  await A.page.press("#composer", "Enter");
  await B.page.locator("text=«fr→ar»").waitFor({ timeout: 20000 });
  ok(B.translateRequests.at(-1).from === "fr" && B.translateRequests.at(-1).to === "ar", "French message is translated into Arabic for B");

  console.log(`\n${passed} checks passed`);
} finally {
  await browser.close();
}
