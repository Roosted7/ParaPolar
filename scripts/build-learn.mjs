// Generates the pre-rendered /learn pages (4 languages) plus sitemap.xml
// into dist/ after the Vite build. Static HTML for crawlers; the live app
// embedded as an interactive widget for humans.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LEARN_ARTICLES } from "../src/content/learnContent.js";

const OUT = "dist";
const ORIGIN = "https://parapolar.com";
const LANGS = ["en", "de", "fr", "nl"];

const CHROME = {
  en: {
    learn: "Learn",
    strap: "Short, precise lessons on paraglider performance",
    back: "Open the app",
    tryIt: "Try it yourself — this scenario is live:",
    openScenario: "Open this scenario in the full app →",
    minRead: "min read",
    more: "Keep learning",
    takeaway: "Takeaway",
    footer: "Archetypal data; educational use only.",
  },
  de: {
    learn: "Lernen",
    strap: "Kurze, präzise Lektionen zur Gleitschirm-Performance",
    back: "App öffnen",
    tryIt: "Probiere es selbst — dieses Szenario ist live:",
    openScenario: "Dieses Szenario in der App öffnen →",
    minRead: "Min. Lesezeit",
    more: "Weiterlernen",
    takeaway: "Merksatz",
    footer: "Schematische Daten; nur zu Lehrzwecken.",
  },
  fr: {
    learn: "Apprendre",
    strap: "Leçons courtes et précises sur la performance en parapente",
    back: "Ouvrir l’appli",
    tryIt: "Essayez vous-même — ce scénario est interactif :",
    openScenario: "Ouvrir ce scénario dans l’appli →",
    minRead: "min de lecture",
    more: "Continuer à apprendre",
    takeaway: "À retenir",
    footer: "Données archétypales ; usage éducatif uniquement.",
  },
  nl: {
    learn: "Leren",
    strap: "Korte, precieze lessen over paraglider-prestaties",
    back: "Open de app",
    tryIt: "Probeer het zelf — dit scenario is interactief:",
    openScenario: "Open dit scenario in de app →",
    minRead: "min leestijd",
    more: "Verder leren",
    takeaway: "Onthoud",
    footer: "Archetypische data; alleen voor educatief gebruik.",
  },
};

const prefix = (lang) => (lang === "en" ? "" : `/${lang}`);
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function shareParam(widgetState) {
  const payload = { v: 1, unit: "kmh", wingLoad: 1, ...widgetState };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

const STYLE = `
  :root { --ink:#0e1a2b; --deep:#0a1524; --soft:#16233a; --glacier:#edf1f4; --thermal:#e8833a;
    --bright:#f5b46b; --sky:#6db8d8; --line:rgba(255,255,255,0.14); --dim:#8ba0b3; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--deep); color:#dbe4ec; font:17px/1.7 Charter,'Bitstream Charter',Cambria,Georgia,serif; }
  a { color: var(--bright); }
  header { background:rgba(14,26,43,0.92); border-bottom:1px solid var(--line); padding:12px 20px;
    display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
    font-family:'Jost','Futura','Century Gothic',sans-serif; }
  header .wordmark { font-weight:700; font-size:20px; color:var(--glacier); text-decoration:none; }
  header .wordmark b { color: var(--thermal); }
  header nav { display:flex; gap:8px; font:12px ui-monospace,Consolas,monospace; letter-spacing:0.08em; }
  header nav a { text-decoration:none; color:#b9c8d6; border:1px solid var(--line); padding:4px 9px; }
  header nav a.on { background:var(--thermal); color:var(--ink); border-color:var(--thermal); font-weight:600; }
  main { max-width: 720px; margin: 0 auto; padding: 40px 20px 80px; }
  .eyebrow { font:11px ui-monospace,Consolas,monospace; letter-spacing:0.2em; text-transform:uppercase; color:var(--thermal); }
  h1 { font-family:'Jost','Futura','Century Gothic',sans-serif; font-size: clamp(30px, 6vw, 44px);
    line-height:1.08; margin: 10px 0 18px; color: var(--glacier); text-wrap: balance; }
  h2 { font-family:'Jost','Futura','Century Gothic',sans-serif; font-size: 24px; margin: 38px 0 10px; color: var(--glacier); }
  p { margin: 0 0 1em; max-width: 62ch; }
  .widget { margin: 34px 0; border: 1px solid var(--line); }
  .widget iframe { display:block; width:100%; aspect-ratio: 4/3; border:0; }
  @media (min-width: 720px) { .widget iframe { aspect-ratio: 16/10; } }
  .widget-caption { font:12px ui-monospace,Consolas,monospace; color:var(--dim); padding: 8px 10px;
    border-top: 1px solid var(--line); display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; }
  .takeaway { border-left: 3px solid var(--thermal); background: var(--soft); padding: 14px 18px; margin: 34px 0; }
  .takeaway .k { font:11px ui-monospace,Consolas,monospace; letter-spacing:0.18em; text-transform:uppercase; color:var(--bright); }
  .more { border-top: 1px solid var(--line); margin-top: 46px; padding-top: 18px; }
  .more a { display:block; text-decoration:none; padding: 10px 0; color: var(--glacier);
    font-family:'Jost','Futura','Century Gothic',sans-serif; font-size: 18px; }
  .more a span { color: var(--dim); font-size: 14px; display:block; font-family:Charter,Georgia,serif; }
  .cards { list-style:none; padding:0; display:grid; gap:12px; }
  .cards a { display:block; border:1px solid var(--line); background:var(--soft); padding:18px; text-decoration:none; }
  .cards h2 { margin: 0 0 6px; font-size: 21px; }
  .cards p { color:#b9c8d6; font-size: 15px; margin: 0; }
  .cards .meta { font:11px ui-monospace,Consolas,monospace; color:var(--dim); letter-spacing:0.1em; margin-top:8px; display:block; }
  footer { text-align:center; font:12px ui-monospace,Consolas,monospace; color:var(--dim); padding: 20px 0 50px; }
`;

function pageShell({ lang, title, description, canonicalPath, body, jsonLd }) {
  const alternates = LANGS.map(
    (l) =>
      `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${prefix(l)}${canonicalPath}" />`,
  ).join("\n");
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="article" />
<meta property="og:image" content="${ORIGIN}/og-image.png" />
<meta name="theme-color" content="#0e1a2b" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="canonical" href="${ORIGIN}${prefix(lang)}${canonicalPath}" />
${alternates}
<link rel="alternate" hreflang="x-default" href="${ORIGIN}${canonicalPath}" />
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
<style>${STYLE}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function headerNav(lang, pathAfterPrefix) {
  const c = CHROME[lang];
  const langLinks = LANGS.map(
    (l) =>
      `<a href="${prefix(l)}${pathAfterPrefix}" class="${l === lang ? "on" : ""}" hreflang="${l}">${l.toUpperCase()}</a>`,
  ).join("");
  return `<header>
  <a class="wordmark" href="${prefix(lang)}/"><b>para</b>polar</a>
  <nav>${langLinks}<a href="${prefix(lang)}/">${esc(c.back)}</a></nav>
</header>`;
}

function articleHtml(lang, article, siblings) {
  const c = CHROME[lang];
  const s = shareParam(article.widgetState);
  const iframeSrc = `${prefix(lang)}/?embed=1&theme=dark&s=${encodeURIComponent(s)}`;
  const appLink = `${prefix(lang)}/?s=${encodeURIComponent(s)}`;
  const sections = article.sections
    .map((sec) => `<h2>${esc(sec.heading)}</h2>\n${sec.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n")}`)
    .join("\n");
  const more = siblings
    .map(
      (a) =>
        `<a href="${prefix(lang)}/learn/${a.slug}/">${esc(a.title)} →<span>${esc(a.metaDescription)}</span></a>`,
    )
    .join("\n");

  const body = `${headerNav(lang, `/learn/${article.slug}/`)}
<main>
  <div class="eyebrow">${esc(c.learn)} · ${article.readingMinutes} ${esc(c.minRead)}</div>
  <h1>${esc(article.title)}</h1>
  ${article.intro.map((p) => `<p>${esc(p)}</p>`).join("\n")}
  <div class="widget">
    <iframe src="${iframeSrc}" title="ParaPolar" loading="lazy"></iframe>
    <div class="widget-caption"><span>${esc(c.tryIt)}</span><a href="${appLink}">${esc(c.openScenario)}</a></div>
  </div>
  ${sections}
  <div class="takeaway"><div class="k">${esc(c.takeaway)}</div>${esc(article.takeaway)}</div>
  <div class="more"><div class="eyebrow">${esc(c.more)}</div>${more}</div>
</main>
<footer>PARAPOLAR · ${esc(c.footer)}</footer>`;

  return pageShell({
    lang,
    title: `${article.title} — ParaPolar`,
    description: article.metaDescription,
    canonicalPath: `/learn/${article.slug}/`,
    body,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      inLanguage: lang,
      author: { "@type": "Person", name: "Thomas Roos" },
      publisher: { "@type": "Organization", name: "ParaPolar", url: ORIGIN },
      mainEntityOfPage: `${ORIGIN}${prefix(lang)}/learn/${article.slug}/`,
    },
  });
}

function indexHtml(lang, articles) {
  const c = CHROME[lang];
  const cards = articles
    .map(
      (a) => `<li><a href="${prefix(lang)}/learn/${a.slug}/">
  <h2>${esc(a.title)}</h2>
  <p>${esc(a.metaDescription)}</p>
  <span class="meta">${a.readingMinutes} ${esc(c.minRead)}</span>
</a></li>`,
    )
    .join("\n");
  const body = `${headerNav(lang, "/learn/")}
<main>
  <div class="eyebrow">parapolar · ${esc(c.learn)}</div>
  <h1>${esc(c.strap)}</h1>
  <ul class="cards">${cards}</ul>
</main>
<footer>PARAPOLAR · ${esc(c.footer)}</footer>`;
  return pageShell({
    lang,
    title: `${c.learn} — ParaPolar`,
    description: c.strap,
    canonicalPath: "/learn/",
    body,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `ParaPolar — ${c.learn}`,
      inLanguage: lang,
    },
  });
}

function sitemap() {
  const urls = [];
  for (const lang of LANGS) {
    urls.push(`${ORIGIN}${prefix(lang)}/`);
    urls.push(`${ORIGIN}${prefix(lang)}/learn/`);
    for (const a of LEARN_ARTICLES[lang]) urls.push(`${ORIGIN}${prefix(lang)}/learn/${a.slug}/`);
  }
  urls.push(`${ORIGIN}/brief/`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
}

async function write(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  console.log("wrote", file);
}

for (const lang of LANGS) {
  const articles = LEARN_ARTICLES[lang];
  await write(path.join(OUT, prefix(lang), "learn", "index.html"), indexHtml(lang, articles));
  for (const article of articles) {
    const siblings = articles.filter((a) => a.slug !== article.slug);
    await write(
      path.join(OUT, prefix(lang), "learn", article.slug, "index.html"),
      articleHtml(lang, article, siblings),
    );
  }
}
await write(path.join(OUT, "sitemap.xml"), sitemap());
console.log("learn pages done");
