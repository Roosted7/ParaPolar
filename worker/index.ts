/**
 * Cloudflare Worker for ParaPolar.
 *
 * Responsibilities:
 * - Redirect language domains to the canonical parapolar.com with a path prefix
 *   (parapolar.fr -> /fr, parapolar.de -> /de, parapolar.nl -> /nl) and persist
 *   the language choice in a `pp_lang` cookie for the SPA.
 * - Redirect www.parapolar.com to the apex domain (canonical URL for SEO).
 * - Serve the built SPA via the Workers Assets binding for everything else.
 */

type Lang = "en" | "de" | "fr" | "nl";

const LANG_DOMAINS: Record<string, Lang> = {
  "parapolar.fr": "fr",
  "parapolar.de": "de",
  "parapolar.nl": "nl",
};

const CANONICAL_ORIGIN = "https://parapolar.com";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const bareHost = host.replace(/^www\./, "");

    // Language domains -> canonical .com with language path prefix
    const lang = LANG_DOMAINS[bareHost];
    if (lang) {
      const strippedPath = url.pathname.replace(
        new RegExp(`^/${lang}(?=/|$)`),
        "",
      );
      const target = `${CANONICAL_ORIGIN}/${lang}${strippedPath}${url.search}`;
      return redirectWithLang(target, lang);
    }

    // www.parapolar.com -> parapolar.com (keep path + query)
    if (host === "www.parapolar.com") {
      return Response.redirect(
        `${CANONICAL_ORIGIN}${url.pathname}${url.search}`,
        301,
      );
    }

    // Everything else: serve the static SPA build
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

function redirectWithLang(to: string, lang: Lang): Response {
  return new Response(null, {
    status: 301,
    headers: {
      Location: to,
      "Set-Cookie": `pp_lang=${lang}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
      "Cache-Control": "no-store",
    },
  });
}
