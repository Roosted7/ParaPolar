# ParaPolar

**Interactive paraglider polar-curve and speed-to-fly visualizer** — live at [parapolar.com](https://parapolar.com) ([.fr](https://parapolar.fr) / [.de](https://parapolar.de) / [.nl](https://parapolar.nl)).

Explore how wind, lift, MacCready setting, and wing loading change best glide and speed-to-fly across glider classes (Single-Skin, EN-A through EN-C, Tandem) — with a live polar graph, a side-scrolling "consequence view" of motion over ground, and an audio vario.

## Features

- **Polar graph** with draggable active point, best-glide tangents (air + ground) and MacCready tangent using the shifting-origin construction
- **Ground view**: canvas animation of the glider over terrain, wind/lift particles, and a physical windsock
- **Simple & Advanced modes** — a single wind slider for students; wind/lift/MacCready/wing-loading and live data for the curious
- **Scenarios**: calm glide, ridge soaring, valley crossing, thermal climb, backwind flight
- **Speed-to-fly readout** (MacCready target, or best glide over ground)
- **Audio vario** (consent-based, Web Audio)
- **4 languages** (EN/DE/FR/NL) with language domains, URL prefixes and hreflang SEO
- **Shareable permalinks** encoding the full advanced-mode state
- Dark mode, PWA manifest, units in km/h, m/s, mph, kt (vertical speeds in m/s, ft/min or kt as pilots expect)

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
| `worker/index.ts` | Cloudflare Worker: language-domain redirects + static assets |

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
