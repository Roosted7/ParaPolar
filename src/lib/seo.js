import { LANGS, langPath, stripLangPath } from "./i18n";

const BASE = "https://parapolar.com";

/** Maintain canonical + hreflang alternate links for the current language. */
export function updateSeoLinks(lang) {
  try {
    const head = document.head;
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((n) => n.remove());

    const make = (rel, href, hreflang) => {
      const el = document.createElement("link");
      el.rel = rel;
      el.href = href;
      if (hreflang) el.hreflang = hreflang;
      head.appendChild(el);
    };

    const path = stripLangPath(window.location.pathname) || "/";
    const hrefFor = (l) => `${BASE}${langPath(path, l)}`;

    make("canonical", hrefFor(lang));
    for (const l of LANGS) make("alternate", hrefFor(l), l);
    make("alternate", hrefFor("en"), "x-default");
  } catch {
    /* ignore (non-browser environment) */
  }
}
