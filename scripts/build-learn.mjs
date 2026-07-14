// Writes the pre-rendered /learn pages + sitemap.xml into dist/ after the
// Vite build (see scripts/learnTemplates.mjs for the shared templates).

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LEARN_ARTICLES } from "../src/content/learnContent.js";
import { renderLearnRoutes, prefix, LANGS } from "./learnTemplates.mjs";

const OUT = "dist";
const ORIGIN = "https://parapolar.com";

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

for (const [route, html] of renderLearnRoutes()) {
  await write(path.join(OUT, route, "index.html"), html);
}
await write(path.join(OUT, "sitemap.xml"), sitemap());
console.log("learn pages done");
