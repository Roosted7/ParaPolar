// The valley-crossing challenge: cross a fixed distance losing as little
// height as possible in the current wind/lift. Pure functions, unit-tested.

import { KMH_TO_MS } from "./units";

export const CHALLENGE_DISTANCE_KM = 3;

/**
 * Height lost (m) crossing `distanceKm` at `speedKmh` through the given
 * airmass. Returns null when the glider never arrives (groundspeed <= 0).
 */
export function heightLost({ fPolarMsAtKmh, speedKmh, windKmh, liftMs, distanceKm }) {
  const vxKmh = speedKmh - windKmh;
  if (vxKmh <= 0.1) return null;
  const vxMs = vxKmh * KMH_TO_MS;
  const vzMs = fPolarMsAtKmh(speedKmh) + liftMs;
  const timeS = (distanceKm * 1000) / vxMs;
  return Math.max(0, -vzMs * timeS);
}

/** The minimum achievable height loss and the speed that achieves it. */
export function optimalCrossing({ fPolarMsAtKmh, speedRange, windKmh, liftMs, distanceKm }) {
  let best = null;
  for (let v = speedRange[0]; v <= speedRange[1]; v += 0.1) {
    const h = heightLost({ fPolarMsAtKmh, speedKmh: v, windKmh, liftMs, distanceKm });
    if (h == null) continue;
    if (!best || h < best.heightM) best = { speedKmh: v, heightM: h };
  }
  return best;
}

/**
 * Score a crossing attempt 0..100 against the optimum.
 * 100 = optimal height loss (or arriving while climbing).
 */
export function scoreCrossing(yoursM, optimalM) {
  if (yoursM == null) return 0; // blown backwards
  if (yoursM <= 0.5) return 100; // arrived climbing
  if (optimalM == null) return 0;
  return Math.max(0, Math.min(100, Math.round(100 * (optimalM / yoursM))));
}
