# AGENTS

ParaPolar is a Vite + React SPA visualizing paraglider polars, deployed as a
Cloudflare Worker with static assets.

## Layout

- `src/App.jsx` — top-level state, polar building, kinematics, best-glide searches.
- `src/components/` — `PolarGraph.jsx` (SVG plot + scrub), `GroundViz.jsx`
  (canvas ground view + audio vario), `ControlsPanel.jsx`, `DataPanel.jsx`,
  `Header.jsx`, `GliderPicker.jsx`, `CookieBanner.jsx`, `ShareButton.jsx`, `Footer.jsx`.
- `src/hooks/` — `useTheme.js` (dark mode), `useLanguage.js` (lang + URL/cookie/SEO sync).
- `src/lib/` — `physics.js` (spline, stall, best glide), `units.js` (ALL unit
  conversion/formatting — never inline conversions elsewhere), `persistence.js`
  (localStorage + `?s=` permalinks), `i18n.js`, `seo.js`, `storage.js`,
  `analytics.js`, `pilotControl.js` (slider ↔ speed mapping).
- `src/data/` — `gliders.js` (archetypal polar anchors), `presets.js` (scenarios).
- `worker/index.ts` — Cloudflare Worker: language-domain redirects + ASSETS.
- `src/content/` — learn articles + lesson scripts, all 4 languages, identical
  structure per language (parity is load-bearing for the generator).
- `scripts/build-learn.mjs` — pre-renders /learn pages + sitemap into dist/
  (runs as part of `npm run build`).
- `test/` — Vitest unit tests. Run with `npm test`.

## Sign conventions (authoritative: TechnicalSpecification.md, Part II)

- Airspeed on X in km/h; vertical speed in m/s, sink negative.
- Headwind positive; lift positive; lift is ADDED to vz everywhere.
- Ground vectors: `vx_ground = vx_air − wind`, `vz_ground = vz_air + lift`.
- Best glide (ground) tangent originates at `(wind, 0)` in plot space;
  MacCready adds to lift in the search (`findBestGlidePoint`).
- Glide ratio displayed as forward-per-height-lost (`vx / −vz`, e.g. "8.1:1").

## Pitfalls

- Never set React state inside the `GroundViz` animation loop; per-frame data
  flows through refs (`paramsRef`, `varioActiveRef`). The rAF effect runs once —
  anything it reads must be a ref, or it will close over the first render.
- `PolarGraph` pointer math must scale from CSS pixels to viewBox units.
- i18n: every language table must have the same keys (enforced by
  `test/i18n.test.js`). Add languages in `LANGS`, the worker's `LANG_DOMAINS`,
  and the `LANG_PATH_RE` regex.

## Commands

`npm run dev` / `npm test` / `npm run lint` / `npm run typecheck` /
`npm run build` / `npm run deploy` (needs wrangler auth).
