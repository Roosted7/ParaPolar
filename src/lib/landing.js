// Spot-landing physics + scoring: pure functions shared by the scene's
// animation loop and the unit tests (which prove every approach is winnable).

import { KMH_TO_MS, clamp } from "./units";

/** Smooth multi-sine gustiness, mean ~1, range roughly 0.75..1.25. */
export function windGust(t) {
  return 1 + 0.16 * Math.sin(t * 0.8) * Math.sin(t * 0.33 + 1.7) + 0.07 * Math.sin(t * 2.3 + 0.5);
}

/** Wind gradient: flow slows toward the ground (≈45% at the surface). */
export function windGradient(canvasY, groundY) {
  return 0.45 + 0.55 * clamp((groundY - canvasY) / (groundY * 0.55), 0, 1);
}

export const TURBULENCE_AMP = [0, 0.55, 1.3]; // m/s per difficulty level

/**
 * One landing-approach integration step.
 * pos: {x, y} in px (y = altitude above the ground line)
 * env: {airspeedKmh, windKmh, vzMs, level, groundY, pxPerM, tSec}
 * Returns the new position plus the effective velocities used.
 */
export function landingStep(pos, env, dt) {
  const { airspeedKmh, windKmh, vzMs, level, groundY, pxPerM, tSec } = env;
  const grad = windGradient(groundY - pos.y, groundY);
  const gust = windGust(tSec);
  const amp = TURBULENCE_AMP[level] ?? TURBULENCE_AMP[1];
  const turbX = (Math.sin(tSec * 2.1 + 1) + Math.sin(tSec * 3.7 + 2)) * 0.5 * amp;
  const turbY = (Math.sin(tSec * 2.9) + Math.sin(tSec * 4.3 + 1)) * 0.4 * amp;
  const effWindMs = windKmh * KMH_TO_MS * gust * grad + turbX;
  const gsMs = airspeedKmh * KMH_TO_MS - effWindMs;
  const vzEff = vzMs + turbY;
  return {
    x: pos.x + gsMs * pxPerM * dt,
    y: Math.max(0, pos.y + vzEff * pxPerM * dt),
    gsMs,
    vzMs: vzEff,
  };
}

/** Entry altitude for every approach (m). */
export const APPROACH_ALT_M = 40;

/** Path-averaged wind gradient over a full descent (used for estimates). */
const AVG_GRADIENT = 0.7;

/**
 * The band of touchdown distances (m from entry) a wing can reach with clean
 * flying — any speed from just above stall to full bar, with or without big
 * ears. The spot-landing target is always placed inside this band, so every
 * attempt is winnable for every wing in any wind.
 */
export function estimateLandingBand(fPolarMsAtKmh, speedRange, windKmh) {
  const dists = [];
  for (let v = speedRange[0] + 0.5; v <= speedRange[1]; v += 0.5) {
    for (const ears of [false, true]) {
      const speed = ears ? v * 0.94 : v;
      const vz = fPolarMsAtKmh(v) - (ears ? 1.15 : 0);
      if (vz >= -0.05) continue;
      const gs = speed * KMH_TO_MS - windKmh * KMH_TO_MS * AVG_GRADIENT;
      if (gs <= 0.3) continue;
      dists.push((gs * APPROACH_ALT_M) / -vz);
    }
  }
  if (dists.length === 0) return { minM: 20, maxM: 60 };
  return { minM: Math.min(...dists), maxM: Math.max(...dists) };
}

/** Score a touchdown 0..100 and classify it. */
export function scoreLanding(res) {
  if (res.missed) return { score: 0, verdictKey: "landing_missed" };
  const dist = Math.abs(res.distanceM);
  let score = Math.max(0, Math.round(100 - Math.min(85, dist * 3)));
  const crash = res.vzMs < -3.5 || res.gsMs > 11;
  const hard = res.vzMs < -2.2 || res.gsMs > 8;
  if (crash) return { score: Math.max(0, score - 40), verdictKey: "landing_crash" };
  if (hard) return { score: Math.max(0, score - 20), verdictKey: "landing_hard" };
  if (dist <= 2.5) return { score, verdictKey: "landing_bullseye" };
  return { score, verdictKey: "landing_soft" };
}
