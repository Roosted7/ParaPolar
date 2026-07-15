# ParaPolar

**Interactive paraglider polar-curve and speed-to-fly visualizer** — live at [parapolar.com](https://parapolar.com) ([.fr](https://parapolar.fr) / [.de](https://parapolar.de) / [.nl](https://parapolar.nl)).

Explore how wind, lift, MacCready setting, and wing loading change best glide and speed-to-fly across glider classes (Single-Skin, EN-A through EN-C, Tandem) — with a live polar graph, a side-scrolling "consequence view" of motion over ground, and an audio vario.

## Features

- **Scene-first design** ("alpine dusk instrument", see [/brief](https://parapolar.com/brief/)): the ground view is the hero — scenario-dependent skies, terrain, wind/lift particles, a physical windsock, instrument pods (L/D, GS, vario)
- **Direct manipulation**: drag the wing to change speed, drag the windsock to set wind; polar graph docks as a glass inspector with a draggable active point and best-glide/MacCready tangents
- **Speed rail** with trim tick and a speed-to-fly (STF) notch the knob snaps onto; stall/collapse warnings with wing shudder
- **Lessons**: six localized micro-lessons from "meet the polar" to backwind flight, each applying a live scenario
- **Valley-crossing challenge**: pick a speed, fly 3 km, get scored against the optimal speed-to-fly
- **Spot-landing challenge**: gusts, near-ground turbulence (by difficulty) and a real wind gradient act on the wing; the target is placed inside what your wing can reach; scored on distance and touchdown quality
- **Big ears** control with folded-tip visuals — the classic descent technique, correctly modeled (more sink, slightly less airspeed)
- **Accurate polars**: per-wing certified stall speeds, monotone (shape-preserving) spline so min-sink stays where the data says, and full bar = vmax (collapses are a turbulence risk, not an automatic overspeed)
- **Learn pages** (`/learn`): pre-rendered articles in 4 languages with the app embedded as an interactive widget; sitemap + hreflang SEO
- **Embeds**: `?embed=1` minimal-chrome mode for iframes (flight schools, blogs)
- **Share links** that unfurl with the actual scenario (worker-rewritten OG meta)
- **Glider comparison** overlay, classroom (projector) mode, audio vario + airspeed-driven wind sound
- **Zero cookies** — no banner, no analytics; only the functional language preference
- 4 languages (EN/DE/FR/NL) with language domains and URL prefixes; dark mode; km/h, m/s, mph, kt (vertical speeds in m/s, ft/min or kt as pilots expect)

## Development

```bash
npm install
npm run dev        # Vite dev server on :5173
npm test           # Vitest unit tests (physics, units, i18n, permalinks)
npm run lint       # ESLint
npm run typecheck  # TypeScript check of the Cloudflare worker
npm run build      # production build to dist/
```

## Architecture

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | State wiring: polar building, kinematics, best-glide searches |
| `src/components/` | `PolarGraph` (SVG), `GroundViz` (canvas + vario), controls, header/footer |
| `src/lib/physics.js` | Cubic-spline polar, stall derivation, best-glide (shifting origin) |
| `src/lib/units.js` | All unit conversion and formatting |
| `src/lib/persistence.js` | localStorage snapshots + `?s=` permalinks |
| `src/lib/i18n.js` | String tables and language detection |
| `src/data/gliders.js` | Archetypal glider polar data |
| `worker/index.ts` | Cloudflare Worker: language redirects, OG rewriting, static assets |
| `src/content/` | Learn articles + lesson scripts (4 languages) |
| `scripts/build-learn.mjs` | Pre-renders /learn pages + sitemap at build time |

Sign conventions (see `TechnicalSpecification.md`): airspeed km/h on X, sink m/s on Y; headwind and lift are positive; ground vectors are `vx_air − wind` and `vz_air + lift`. Best glide over ground is the tangent from `(wind, −lift)` to the polar.

## Deployment

The site is a Cloudflare Worker with static assets (`wrangler.toml`), routed to `parapolar.{com,fr,de,nl}`. Language domains 301-redirect to `parapolar.com/{fr,de,nl}` and set a `pp_lang` cookie.

```bash
npm run deploy       # build + wrangler deploy (production routes)
npm run deploy:dev   # build + deploy to workers.dev (env: dev)
```

## License

[AGPL-3.0](LICENSE). You are free to use, study, modify, and share this project — but if you host it (modified or not) as a network service, you must make your complete source available under the same license. In short: improvements flow back to everyone; closed-off clones don't.

## Disclaimer

Glider data is archetypal, not manufacturer data — for education only, not flight planning.

Made by [Thomas Roos](https://www.linkedin.com/in/thomas-roos/) with ❤ from Amsterdam.
