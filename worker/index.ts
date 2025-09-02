export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Language domain redirects
    if (host.endsWith("parapolar.fr")) {
      const target = new URL(`https://parapolar.com/fr${url.pathname.replace(/^\/(fr)(?=\/|$)/, "")}${url.search}${url.hash}`);
      return withLangRedirect(target.toString(), "fr");
    }
    if (host.endsWith("parapolar.de")) {
      const target = new URL(`https://parapolar.com/de${url.pathname.replace(/^\/(de)(?=\/|$)/, "")}${url.search}${url.hash}`);
      return withLangRedirect(target.toString(), "de");
    }
    if (host.endsWith("parapolar.nl")) {
      const target = new URL(`https://parapolar.com${url.pathname}${url.search}${url.hash}`);
      return withLangRedirect(target.toString(), "en");
    }

    // Default: let Assets handle static; fall back to SPA index.html
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

function withLangRedirect(to: string, lang: string) {
  const resp = Response.redirect(to, 301);
  const headers = new Headers(resp.headers);
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toUTCString();
  headers.append("Set-Cookie", `pp_lang=${lang}; Path=/; Expires=${expires}; SameSite=Lax; Secure`);
  return new Response(null, { status: 301, headers });
}
