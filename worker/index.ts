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

    // Shared permalinks (?s=...): rewrite the OG meta so the link unfurls
    // with a description of the actual scenario in chat apps.
    const share = url.searchParams.get("s");
    if (share && request.method === "GET") {
      const response = await env.ASSETS.fetch(request);
      const summary = describeShareState(share);
      if (summary && (response.headers.get("content-type") || "").includes("text/html")) {
        return new HTMLRewriter()
          .on('meta[property="og:description"]', {
            element(el) {
              el.setAttribute("content", summary);
            },
          })
          .on('meta[name="description"]', {
            element(el) {
              el.setAttribute("content", summary);
            },
          })
          .transform(response);
      }
      return response;
    }

    // Everything else: serve the static SPA build
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

const GLIDER_NAMES: Record<string, string> = {
  "single-skin": "Single-Skin",
  "en-a": "EN-A",
  "en-b-low": "EN-B",
  "en-b-plus": "EN-B+",
  "en-c": "EN-C",
  tandem: "Tandem",
};

/** Turn a ?s= permalink payload into a human-readable scenario line. */
function describeShareState(param: string): string | null {
  try {
    const bin = atob(param);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = JSON.parse(new TextDecoder().decode(bytes));
    if (!json || json.v !== 1) return null;
    const parts: string[] = [];
    const name = GLIDER_NAMES[json.gliderId];
    if (name) parts.push(name);
    if (Number.isFinite(json.windKmh) && json.windKmh !== 0) {
      parts.push(`${json.windKmh > 0 ? "headwind" : "tailwind"} ${Math.abs(json.windKmh)} km/h`);
    }
    if (Number.isFinite(json.liftMs) && json.liftMs !== 0) {
      parts.push(`${json.liftMs > 0 ? "lift" : "sink"} ${Math.abs(json.liftMs)} m/s`);
    }
    if (Number.isFinite(json.maccreadyMs) && json.maccreadyMs > 0) {
      parts.push(`MacCready ${json.maccreadyMs} m/s`);
    }
    if (parts.length === 0) return null;
    return `${parts.join(" · ")} — explore this speed-to-fly scenario interactively on ParaPolar.`;
  } catch {
    return null;
  }
}

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
