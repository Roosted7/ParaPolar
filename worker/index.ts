/**
 * Cloudflare Worker for ParaPolar.
 *
 * Responsibilities:
 * - Redirect language domains to the canonical parapolar.com with a path prefix
 *   (parapolar.fr -> /fr, parapolar.de -> /de, parapolar.nl -> /nl) and persist
 *   the language choice in a `pp_lang` cookie for the SPA.
 * - Redirect www.parapolar.com to the apex domain (canonical URL for SEO).
 * - Collect anonymous first-party event counts (/beacon -> Analytics Engine;
 *   no cookies, no IPs, no user identifiers) and render them at /stats.
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

    // Anonymous event beacon (fire-and-forget from the app)
    if (url.pathname === "/beacon" && request.method === "POST") {
      return handleBeacon(request, env);
    }

    // Aggregate stats: JSON data + a small public dashboard
    if (url.pathname === "/stats/data") {
      return handleStatsData(env);
    }
    if (url.pathname === "/stats" || url.pathname === "/stats/") {
      return new Response(STATS_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
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

// ===== Anonymous analytics =====
// Deliberately privacy-preserving: we store ONLY an event name, up to two
// short labels (lesson id, language, score bucket…) and one number.
// No IPs, no user agents, no identifiers of any kind.

const KNOWN_EVENTS = new Set([
  "visit",
  "discover",
  "session_end",
  "lesson_open",
  "lesson_done",
  "challenge_flown",
  "share_copied",
  "embed_view",
  "mode_switch",
]);

// Matched against the User-Agent header only to DROP bot traffic — the
// header itself is never stored anywhere.
const BOT_UA =
  /bot|crawler|spider|crawl|slurp|headless|lighthouse|pagespeed|pingdom|uptime|monitor|preview|scanner|curl|wget|python|httpx|axios|node-fetch|go-http|okhttp|java\//i;

async function handleBeacon(request: Request, env: Env): Promise<Response> {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (!ua || BOT_UA.test(ua)) {
      return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    }
    const body = (await request.json()) as Record<string, unknown>;
    const event = String(body.e ?? "");
    if (KNOWN_EVENTS.has(event) && env.EVENTS) {
      const v1 = Number(body.v1);
      // Country comes from Cloudflare's edge metadata — the IP itself is
      // never read by our code and never stored anywhere.
      const country = String(request.cf?.country ?? "");
      env.EVENTS.writeDataPoint({
        blobs: [
          event,
          String(body.d1 ?? "").slice(0, 64),
          String(body.d2 ?? "").slice(0, 64),
          String(body.d3 ?? "").slice(0, 64),
          country,
        ],
        doubles: [Number.isFinite(v1) ? v1 : 0],
        indexes: [event],
      });
    }
  } catch {
    /* malformed beacons are silently dropped */
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

async function handleStatsData(env: Env): Promise<Response> {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  };
  if (!env.ANALYTICS_API_TOKEN || !env.ACCOUNT_ID) {
    return new Response(
      JSON.stringify({ error: "analytics read token not configured" }),
      { status: 503, headers: { ...headers, "Cache-Control": "no-store" } },
    );
  }
  const sql = `
    SELECT blob1 AS event, blob2 AS detail, blob3 AS detail2,
           blob4 AS detail3, blob5 AS country,
           SUM(_sample_interval) AS count,
           SUM(double1 * _sample_interval) / SUM(_sample_interval) AS avg_value
    FROM parapolar_events
    WHERE timestamp > NOW() - INTERVAL '30' DAY
    GROUP BY event, detail, detail2, detail3, country
    ORDER BY count DESC
    FORMAT JSON`;
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.ANALYTICS_API_TOKEN}` },
      body: sql,
    },
  );
  if (!resp.ok) {
    return new Response(
      JSON.stringify({ error: `analytics query failed (${resp.status})` }),
      { status: 502, headers: { ...headers, "Cache-Control": "no-store" } },
    );
  }
  const data = await resp.json();
  return new Response(JSON.stringify(data), { headers });
}

const STATS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ParaPolar — Stats</title>
<meta name="robots" content="noindex" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<style>
  :root { --ink:#0e1a2b; --deep:#0a1524; --soft:#16233a; --glacier:#edf1f4; --thermal:#e8833a;
    --bright:#f5b46b; --sky:#6db8d8; --line:rgba(255,255,255,0.14); --dim:#8ba0b3; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--deep); color:#dbe4ec;
    font:14px/1.6 ui-monospace,'SF Mono',Consolas,monospace; }
  main { max-width:780px; margin:0 auto; padding:34px 20px 60px; }
  h1 { font:600 24px/1.2 'Jost','Futura','Century Gothic',sans-serif; color:var(--glacier); margin:0 0 4px; }
  h1 b { color:var(--thermal); }
  .sub { color:var(--dim); font-size:12px; margin-bottom:26px; }
  section { border:1px solid var(--line); background:var(--soft); padding:14px 16px; margin-bottom:14px; }
  h2 { font:11px ui-monospace,Consolas,monospace; letter-spacing:0.18em; text-transform:uppercase;
    color:var(--bright); margin:0 0 10px; }
  .row { display:flex; align-items:center; gap:10px; padding:3px 0; }
  .row .k { width:190px; color:var(--dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .row .bar { flex:1; height:10px; background:rgba(255,255,255,0.06); position:relative; }
  .row .bar i { position:absolute; inset:0 auto 0 0; background:var(--thermal); display:block; }
  .row .bar i.sky { background:var(--sky); }
  .row .n { width:96px; text-align:right; font-variant-numeric:tabular-nums; }
  .big { font-size:26px; color:var(--glacier); }
  .big small { font-size:12px; color:var(--dim); }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:640px) { .grid2 { grid-template-columns:1fr; } }
  .err { border-color:#c96f5e; color:#f0b4a4; }
  a { color:var(--bright); }
</style>
</head>
<body>
<main>
  <h1><b>para</b>polar · stats</h1>
  <div class="sub">Anonymous aggregate event counts, last 30 days. No cookies, no IPs, no identifiers — country comes from Cloudflare's edge, device is a coarse viewport bucket, "returning" is one bit from the app's own saved settings, and bot/automated traffic is filtered on both client and edge. That is why this page needs no password.</div>
  <div id="out">Loading…</div>
</main>
<script>
(async () => {
  const out = document.getElementById('out');
  try {
    const resp = await fetch('/stats/data');
    const json = await resp.json();
    if (json.error) {
      out.innerHTML = '<section class="err">Not available yet: ' + json.error + '</section>';
      return;
    }
    const rows = json.data || [];
    const by = (ev) => rows.filter(r => r.event === ev);
    const sum = (rs) => rs.reduce((a, r) => a + Number(r.count), 0);
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const agg = (rs, key) => {
      const m = {};
      for (const r of rs) { const k = r[key] || '—'; m[k] = (m[k] || 0) + Number(r.count); }
      return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([detail, count]) => ({ detail, count }));
    };
    const wavg = (rs) => {
      const n = sum(rs);
      return n ? rs.reduce((a, r) => a + Number(r.avg_value) * Number(r.count), 0) / n : null;
    };
    const bars = (rs, opts = {}) => {
      if (!rs.length) return '<div class="sub">— nothing yet —</div>';
      const max = Math.max(...rs.map(r => Number(r.count)));
      return rs.map(r => {
        const pct = opts.of ? ' (' + Math.min(100, Math.round(100 * Number(r.count) / opts.of)) + '%)' : '';
        return '<div class="row"><span class="k">' + esc(r.detail) + '</span>' +
          '<span class="bar"><i class="' + (opts.sky ? 'sky' : '') + '" style="width:' +
          Math.max(2, 100 * Number(r.count) / max) + '%"></i></span>' +
          '<span class="n">' + Number(r.count).toLocaleString() + pct + '</span></div>';
      }).join('');
    };

    const visits = by('visit');
    const nVisits = sum(visits);
    const sessions = by('session_end');
    const avgSecs = wavg(sessions);
    const BUCKETS = ['under 30s', '30s - 2m', '2 - 10m', 'over 10m'];
    const buckets = agg(sessions, 'detail')
      .sort((a, b) => BUCKETS.indexOf(a.detail) - BUCKETS.indexOf(b.detail));
    const fmtDur = (s) => s == null ? '—' : s >= 90 ? (s / 60).toFixed(1) + ' min' : Math.round(s) + ' s';

    const discovery = agg(by('discover'), 'detail');
    const flights = by('challenge_flown');
    const valley = flights.filter(r => r.detail === 'valley');
    const landing = flights.filter(r => r.detail === 'landing');
    const verdicts = agg(landing, 'detail2').map(r => ({ ...r, detail: r.detail.replace('landing_', '') }));
    const opened = by('lesson_open'), done = by('lesson_done');

    out.innerHTML =
      '<section><h2>Visits (' + nVisits.toLocaleString() + ')</h2>' +
        agg(visits, 'detail3').map(r => '<div class="row"><span class="k">' + esc(r.detail) + '</span><span class="n">' + r.count.toLocaleString() + '</span></div>').join('') +
        '<div style="height:8px"></div>' + bars(agg(visits, 'detail2')) + '</section>' +
      '<section><h2>Session length</h2>' +
        '<div class="big">' + fmtDur(avgSecs) + ' <small>avg engaged time · ' + sum(sessions).toLocaleString() + ' sessions</small></div>' +
        '<div style="height:8px"></div>' + bars(buckets, { sky: true }) + '</section>' +
      '<section><h2>Feature discovery — share of visits that found it</h2>' +
        bars(discovery, { of: nVisits }) + '</section>' +
      '<div class="grid2">' +
        '<section><h2>Top referrers</h2>' + bars(agg(visits, 'detail').map(r => r.detail === '—' ? { ...r, detail: 'direct / none' } : r).slice(0, 10)) + '</section>' +
        '<section><h2>Countries</h2>' + bars(agg(visits, 'country').slice(0, 10)) + '</section>' +
      '</div>' +
      '<section><h2>Lessons opened (' + sum(opened).toLocaleString() + ') → completed (' + sum(done).toLocaleString() + ')</h2>' +
        bars(agg(opened, 'detail')) + '<div style="height:8px"></div>' + bars(agg(done, 'detail'), { sky: true }) + '</section>' +
      '<div class="grid2">' +
        '<section><h2>Valley challenge</h2><div class="big">' + sum(valley).toLocaleString() +
          ' <small>flights</small>' + (sum(valley) ? ' &nbsp; ' + wavg(valley).toFixed(0) + '<small>/100 avg</small>' : '') + '</div></section>' +
        '<section><h2>Spot landing</h2><div class="big">' + sum(landing).toLocaleString() +
          ' <small>approaches</small>' + (sum(landing) ? ' &nbsp; ' + wavg(landing).toFixed(0) + '<small>/100 avg</small>' : '') + '</div>' +
          '<div style="height:8px"></div>' + bars(verdicts) + '</section>' +
      '</div>' +
      '<section><h2>Sharing &amp; reach</h2>' +
        '<div class="row"><span class="k">Links copied</span><span class="n">' + sum(by('share_copied')).toLocaleString() + '</span></div>' +
        '<div class="row"><span class="k">Embed views</span><span class="n">' + sum(by('embed_view')).toLocaleString() + '</span></div>' +
        '<div class="row"><span class="k">Mode switches</span><span class="n">' + sum(by('mode_switch')).toLocaleString() + '</span></div>' +
      '</section>' +
      '<div class="sub">Page views &amp; Core Web Vitals live in Cloudflare Web Analytics. <a href="/">Back to the app →</a></div>';
  } catch (e) {
    out.innerHTML = '<section class="err">Failed to load stats.</section>';
  }
})();
</script>
</body>
</html>`;

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
