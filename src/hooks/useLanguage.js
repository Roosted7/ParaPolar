import { useEffect, useState } from "react";
import { detectLang, langPath } from "../lib/i18n";
import { updateSeoLinks } from "../lib/seo";
import * as storage from "../lib/storage";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Language state. Detects the initial language (URL prefix > saved preference
 * > cookie > navigator) and keeps localStorage, the pp_lang cookie, the URL
 * path prefix, <html lang> and SEO link tags in sync.
 */
export function useLanguage() {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    storage.setItem("pp_lang", lang);
    try {
      document.cookie = `pp_lang=${lang}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.lang = lang;
      const newPath = langPath(window.location.pathname, lang);
      const url = newPath + window.location.search + window.location.hash;
      const current =
        window.location.pathname + window.location.search + window.location.hash;
      if (url !== current) window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
    updateSeoLinks(lang);
  }, [lang]);

  return [lang, setLang];
}
