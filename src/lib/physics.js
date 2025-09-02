// Conversions & helpers
export const KMH_TO_MS = 1000 / 3600; // 0.2777..
export const MS_TO_KMH = 3.6;
export const KMH_TO_KT = 0.5399568;
export const KMH_TO_MPH = 0.6213712;
export const KT_TO_KMH = 1.0 / KMH_TO_KT;
export const MPH_TO_KMH = 1.0 / KMH_TO_MPH;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function convertSpeed(valKmh, unit) {
  switch (unit) {
    case "kmh":
      return valKmh;
    case "ms":
      return valKmh * KMH_TO_MS;
    case "mph":
      return valKmh * KMH_TO_MPH;
    case "kt":
      return valKmh * KMH_TO_KT;
    default:
      return valKmh;
  }
}

// Natural cubic spline (Numerical Recipes style)
export function buildNaturalCubicSpline(xs, ys) {
  const n = xs.length;
  const y2 = new Array(n).fill(0);
  const u = new Array(n - 1).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const sig = (xs[i] - xs[i - 1]) / (xs[i + 1] - xs[i - 1]);
    const p = sig * y2[i - 1] + 2.0;
    y2[i] = (sig - 1.0) / p;
    const dd1 = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
    const dd0 = (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1]);
    u[i] = ((6.0 * (dd1 - dd0)) / (xs[i + 1] - xs[i - 1]) - sig * u[i - 1]) / p;
  }
  for (let k = n - 2; k >= 0; k--) {
    y2[k] = y2[k] * y2[k + 1] + u[k] || y2[k];
  }
  function evalAt(x) {
    let klo = 0,
      khi = n - 1;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
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

export function deriveStallPoint(minSpeedKmh, minSinkMs) {
  const stallSpeed = Math.max(10, minSpeedKmh - 6);
  const stallSink = Math.min(-3.5, minSinkMs * 2.2);
  return { stallSpeed, stallSink };
}

export function makePolarFunction(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spline = buildNaturalCubicSpline(xs, ys);
  const f = (vx) => spline.eval(vx);
  return f;
}

export function findBestGlidePoint({
  fPolarMsAtKmh,
  speedRange,
  windKmh,
  liftMs,
  step = 0.1,
}) {
  let best = null;
  for (let v = speedRange[0]; v <= speedRange[1]; v += step) {
    const vz = fPolarMsAtKmh(v) - liftMs; // vertical shift by airmass
    const dx = v - windKmh; // horizontal shift by wind (origin moves to +wind,0)
    if (dx <= 0.5) continue;
    const ratio = -vz / dx; // L/D
    if (!isFinite(ratio)) continue;
    if (!best || ratio < best.ratio) {
      best = { vx: v, vz, ratio, slope: vz / dx };
    }
  }
  return best;
}
