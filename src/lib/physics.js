// Polar-curve physics: spline construction, stall derivation, best-glide search.
// Sign conventions (see TechnicalSpecification.md, Part II):
// - Airspeed in km/h on X; vertical speed in m/s (sink is negative).
// - Headwind is positive; lift is positive and is ADDED to vz.
// - Groundspeed: vx_ground = vx_air - wind. Vertical: vz_ground = vz_air + lift.

export { KMH_TO_MS, MS_TO_KMH, clamp } from "./units";

/**
 * Natural cubic spline through (xs, ys), clamped to the endpoint values
 * outside the input range. Numerical Recipes-style tridiagonal solve.
 */
export function buildNaturalCubicSpline(xs, ys) {
  const n = xs.length;
  const y2 = new Array(n).fill(0); // second derivatives
  const u = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const sig = (xs[i] - xs[i - 1]) / (xs[i + 1] - xs[i - 1]);
    const p = sig * y2[i - 1] + 2.0;
    y2[i] = (sig - 1.0) / p;
    const dd1 = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
    const dd0 = (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1]);
    u[i] = ((6.0 * (dd1 - dd0)) / (xs[i + 1] - xs[i - 1]) - sig * u[i - 1]) / p;
  }
  y2[n - 1] = 0; // natural boundary condition
  for (let k = n - 2; k >= 1; k--) {
    y2[k] = y2[k] * y2[k + 1] + u[k];
  }
  y2[0] = 0;

  function evalAt(x) {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let klo = 0;
    let khi = n - 1;
    while (khi - klo > 1) {
      const k = ((khi + klo) / 2) | 0;
      if (xs[k] > x) khi = k;
      else klo = k;
    }
    const h = xs[khi] - xs[klo];
    const a = (xs[khi] - x) / h;
    const b = (x - xs[klo]) / h;
    return (
      a * ys[klo] +
      b * ys[khi] +
      (((a * a * a - a) * y2[klo] + (b * b * b - b) * y2[khi]) * (h * h)) / 6.0
    );
  }
  return { eval: evalAt };
}

/**
 * Estimate the stall point: a little slower than min-sink, with sink growing
 * in proportion to how far below min-sink the wing is pushed (keeps the
 * spline physical when certified stall speeds sit close to min-sink).
 */
export function deriveStallPoint(minSpeedKmh, minSinkMs, stallSpeedKmh) {
  const stallSpeed = Number.isFinite(stallSpeedKmh)
    ? stallSpeedKmh
    : Math.max(10, minSpeedKmh - 6);
  const gap = Math.max(1.5, minSpeedKmh - stallSpeed);
  const stallSink = Math.min(-2.0, minSinkMs - 0.5 * gap);
  return { stallSpeed, stallSink };
}

/**
 * Shape-preserving cubic Hermite interpolation (Fritsch–Carlson). Unlike a
 * natural cubic spline it never overshoots between anchors — essential for
 * polars: min-sink must stay exactly at the min-sink anchor, or the
 * best-glide search finds a fictitious bump.
 */
export function buildMonotoneCubicSpline(xs, ys) {
  const n = xs.length;
  const h = [];
  const delta = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(xs[i + 1] - xs[i]);
    delta.push((ys[i + 1] - ys[i]) / h[i]);
  }
  const m = new Array(n);
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (delta[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / delta[i];
      const b = m[i + 1] / delta[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * a * delta[i];
        m[i + 1] = tau * b * delta[i];
      }
    }
  }
  function evalAt(x) {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      ys[i] * (2 * t3 - 3 * t2 + 1) +
      m[i] * h[i] * (t3 - 2 * t2 + t) +
      ys[i + 1] * (-2 * t3 + 3 * t2) +
      m[i + 1] * h[i] * (t3 - t2)
    );
  }
  return { eval: evalAt };
}

/** Build vz(vx) from anchor points ({x: km/h, y: m/s}). */
export function makePolarFunction(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spline = buildMonotoneCubicSpline(xs, ys);
  return (vx) => spline.eval(vx);
}

/**
 * Build the full polar for a glider at a relative wing loading.
 * Speeds and sink rates scale with sqrt(wing loading).
 */
export function buildPolar(gliderPolarData, wingLoad = 1.0) {
  const s = Math.sqrt(wingLoad);
  const pd = gliderPolarData;
  // Certified stall speeds differ per class — explicit data wins over the heuristic.
  const stall = deriveStallPoint(pd.min_sink_speed_kmh, pd.min_sink_rate_ms, pd.stall_speed_kmh);
  const anchors = [
    { x: stall.stallSpeed * s, y: stall.stallSink * s },
    { x: pd.min_sink_speed_kmh * s, y: pd.min_sink_rate_ms * s },
    { x: pd.trim_speed_kmh * s, y: pd.trim_sink_rate_ms * s },
    { x: pd.max_speed_kmh * s, y: pd.max_speed_sink_rate_ms * s },
  ].sort((a, b) => a.x - b.x);
  return {
    f: makePolarFunction(anchors),
    range: [anchors[0].x, anchors[anchors.length - 1].x],
    anchors,
  };
}

/**
 * Find the speed that maximizes glide over ground for a given wind/lift
 * ("shifting origin": tangent from (wind, -lift) to the polar).
 * Returns { vx (km/h), vz (m/s, incl. lift), ratio (descent gradient) } or
 * null when no forward-moving point exists.
 */
export function findBestGlidePoint({
  fPolarMsAtKmh,
  speedRange,
  windKmh = 0,
  liftMs = 0,
  step = 0.1,
}) {
  let best = null;
  for (let v = speedRange[0]; v <= speedRange[1]; v += step) {
    const vz = fPolarMsAtKmh(v) + liftMs; // lift reduces sink
    const dx = v - windKmh; // groundspeed component (km/h)
    if (dx <= 0.5) continue;
    const gradient = -vz / dx; // sink per unit forward; minimize => best glide
    if (!Number.isFinite(gradient)) continue;
    if (!best || gradient < best.ratio) {
      best = { vx: v, vz, ratio: gradient };
    }
  }
  return best;
}
