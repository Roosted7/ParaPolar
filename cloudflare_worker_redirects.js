// Cloudflare Worker: redirect language domains to canonical .com with path prefix and set cookie
// Routes:
// - parapolar.fr/* -> https://parapolar.com/fr/<rest>
// - parapolar.de/* -> https://parapolar.com/de/<rest>
// - parapolar.nl/* -> https://parapolar.com/<rest> (Dutch falls back to English for now)
// - parapolar.com/* -> pass-through
// Also sets pp_lang cookie to fr/de/en for client persistence.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    let target = null;
    let langCookie = null;

    if (host.endsWith("parapolar.fr")) {
      target = new URL(`https://parapolar.com/fr${url.pathname.replace(/^\/fr(?=\/|$)/, "")}${url.search}${url.hash}`);
      langCookie = "fr";
    } else if (host.endsWith("parapolar.de")) {
      target = new URL(`https://parapolar.com/de${url.pathname.replace(/^\/de(?=\/|$)/, "")}${url.search}${url.hash}`);
      langCookie = "de";
    } else if (host.endsWith("parapolar.nl")) {
      // For now, no dedicated Dutch translation; default to English
      target = new URL(`https://parapolar.com${url.pathname}${url.search}${url.hash}`);
      langCookie = "en";
    } else if (host.endsWith("parapolar.com")) {
      // canonical; no redirect
      return fetch(request);
    }

    if (target) {
      const resp = Response.redirect(target.toString(), 301);
      const headers = new Headers(resp.headers);
      const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toUTCString();
      headers.append("Set-Cookie", `pp_lang=${langCookie}; Path=/; Expires=${expires}; SameSite=Lax; Secure`);
      return new Response(null, { status: 301, headers });
    }
    return fetch(request);
  },
};
