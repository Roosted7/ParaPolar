# AGENTS

This project is a Vite + React single‑page app visualizing paraglider polars. The core logic lives in `src/`, with three key areas:

- `src/index.jsx`: App state, UI, environment presets, and wiring between physics and visualizations.
- `src/components/PolarGraph.jsx`: SVG polar plot, axes, tangents for best glide (air/ground) and MacCready, and scrub interaction.
- `src/components/GroundViz.jsx`: Canvas side‑scroll ground visualization (consequence view), showing motion over ground.
- `src/lib/physics.js`: Units, interpolation, polar construction, and best‑glide search.
- `src/data/gliders.js`: Archetypal glider data (min sink, trim, max, etc.).
- `src/lib/i18n.js`: Simple string table.

Quick orientation:

- Specs are in `TechnicalSpecification.md` (root). Use it to verify sign conventions:
  - Airspeed on X in km/h; sink on Y in m/s (down positive in the plot space).
  - Headwind is positive; lift is positive. Lift reduces sink (vz becomes less negative).
  - Groundspeed: Vx_ground = Vx_air − Wind. Vertical: Vz_ground = Vz_air + Lift.
  - Best glide (ground) tangent originates at (wind, 0). MacCready tangent originates at (wind, +MacCready) when using the convention that lift is added to Vz.

Searching the spec effectively:

- Use your editor search for key phrases like "Shifting Origin Algorithm", "Best Glide", and "MacCready".
- Part II of the spec is authoritative for sign conventions and tangent origins.

Common pitfalls addressed:

- Don’t set React state inside the animation loop. `GroundViz` uses refs for per‑frame updates.
- Watch lift sign: lift must be added to the air vertical speed everywhere, not subtracted.
- When showing glide ratio (ground), display only if moving forward (Vx>0) and descending (Vz<0).

Local run:

- `npm install`
- `npm run dev`

Notes for future work:

- Consider memoizing heavy calculations in `PolarGraph` if you add complexity.
- If you add more languages, extend `i18n.js` and keep labels used in simple mode (wind hints).
- For MacCready, you may want a dedicated overlay describing target speed and expected L/D.
