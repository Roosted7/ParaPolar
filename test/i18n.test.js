import { describe, it, expect } from "vitest";
import { I18N, LANGS, langPath, stripLangPath } from "../src/lib/i18n";

describe("I18N tables", () => {
  it("covers every declared language", () => {
    expect(Object.keys(I18N).sort()).toEqual([...LANGS].sort());
  });

  it("has identical key sets in every language", () => {
    const enKeys = Object.keys(I18N.en).sort();
    for (const lang of LANGS) {
      expect(Object.keys(I18N[lang]).sort(), `keys for ${lang}`).toEqual(enKeys);
    }
  });

  it("has no empty strings", () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(I18N[lang])) {
        expect(value, `${lang}.${key}`).toBeTruthy();
      }
    }
  });
});

describe("language path helpers", () => {
  it("strips language prefixes", () => {
    expect(stripLangPath("/fr")).toBe("");
    expect(stripLangPath("/fr/foo")).toBe("/foo");
    expect(stripLangPath("/nl/")).toBe("/");
    expect(stripLangPath("/france")).toBe("/france"); // no false positives
    expect(stripLangPath("/")).toBe("/");
  });

  it("builds language paths", () => {
    expect(langPath("/", "en")).toBe("/");
    expect(langPath("/", "fr")).toBe("/fr");
    expect(langPath("/de/x", "nl")).toBe("/nl/x");
    expect(langPath("/nl", "en")).toBe("/");
  });
});
