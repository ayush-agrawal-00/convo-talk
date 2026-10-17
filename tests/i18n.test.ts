// Run with: npm test   (Node's built-in test runner; no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { en } from "../lib/locales/en.ts";
import {
  DICTIONARIES, LOCALES, detectLocale, isLocale, isRtl, languageName, languageOptionLabel, lookup, translate, translationErrorKey,
} from "../lib/i18n.ts";
import { LANGUAGES } from "../lib/languages.ts";

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
const keys = Object.keys(en) as (keyof typeof en)[];

test("every language in the selector is a supported UI language", () => {
  assert.deepEqual([...LOCALES].sort(), LANGUAGES.map((l) => l.code).sort());
  for (const code of LOCALES) assert.ok(DICTIONARIES[code], `missing dictionary for ${code}`);
});

for (const code of LOCALES) {
  test(`locale ${code}: complete, no stray keys, placeholders preserved`, () => {
    const d = DICTIONARIES[code] as Record<string, string>;
    assert.deepEqual(Object.keys(d).sort(), [...keys].sort(), "keys differ from English");
    for (const k of keys) {
      assert.equal(typeof d[k], "string");
      assert.deepEqual(placeholders(d[k]), placeholders(en[k]), `${code}.${k} placeholders differ`);
      // Only the optional headline tail may be empty (CJK headlines can fold it into h1b).
      if (k !== "landing.h1c") assert.ok(d[k].trim().length > 0, `${code}.${k} is empty`);
    }
  });

  if (code !== "en") {
    test(`locale ${code}: is translated, not English placeholder text`, () => {
      const d = DICTIONARIES[code] as Record<string, string>;
      // Templates and symbols legitimately match English in some languages.
      const neutral = new Set(["preview.speaker", "msg.aria", "msg.original", "msg.translation"]);
      const untranslated = keys.filter((k) => !neutral.has(k) && d[k] === en[k] && /[a-z]{3}/i.test(en[k]));
      // Allow a few legitimate cognates (e.g. "Demo"), but a mostly-English file means the translation is missing.
      assert.ok(untranslated.length <= 6, `${code} has ${untranslated.length} English strings: ${untranslated.join(", ")}`);
    });
  }
}

test("translate substitutes variables and default limits", () => {
  assert.equal(translate("en", "join.titleNamed", { name: "Maya" }), "Maya invited you to talk.");
  assert.match(translate("en", "err.tooLong"), /500/);
  assert.match(translate("ja", "err.tooLong"), /500/);
});

test("fallback: a missing string falls back to English, never to the raw key", () => {
  const original = DICTIONARIES.fr["err.empty"];
  (DICTIONARIES.fr as Record<string, string>)["err.empty"] = "";
  try {
    assert.equal(lookup("fr", "err.empty"), en["err.empty"]);
  } finally {
    (DICTIONARIES.fr as Record<string, string>)["err.empty"] = original;
  }
});

test("locale detection maps browser tags to supported UI languages with English fallback", () => {
  assert.equal(detectLocale("pt-BR"), "pt");
  assert.equal(detectLocale("zh-Hans-CN"), "zh");
  assert.equal(detectLocale("ES"), "es");
  assert.equal(detectLocale("sv-SE"), "en");
  assert.equal(detectLocale(undefined), "en");
  assert.ok(isLocale("ko") && !isLocale("xx"));
});

test("only Arabic is right-to-left", () => {
  assert.deepEqual(LOCALES.filter(isRtl), ["ar"]);
});

test("language names are written in the interface language", () => {
  assert.equal(languageName("es", "en").toLowerCase(), "inglés");
  assert.equal(languageName("en", "es"), "Spanish");
  assert.match(languageName("fr", "de"), /allemand/i);
  assert.match(languageOptionLabel("en", "es"), /^Español · Spanish$/);
  assert.equal(languageOptionLabel("en", "en"), "English");
});

test("translation error codes map to localized keys", () => {
  assert.equal(translationErrorKey("rate_limited"), "tr.rate_limited");
  assert.equal(translationErrorKey("nope"), "tr.generic");
  assert.equal(translationErrorKey(undefined), "tr.generic");
});
