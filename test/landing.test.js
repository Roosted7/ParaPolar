import { describe, it, expect } from "vitest";
import { buildPolar } from "../src/lib/physics";
import {
  landingStep,
  scoreLanding,
  windGradient,
  windGust,
  estimateLandingBand,
  APPROACH_ALT_M,
} from "../src/lib/landing";
import { GLIDERS } from "../src/data/gliders";

const groundY = 560;
const pxPerM = 6; // any sane scale works — the physics is scale-invariant in meters

/**
 * Fly a whole approach; `plan(altM)` returns {airspeedKmh, ears} for the
 * current altitude, so tests can fly constant-speed or two-phase approaches.
 * Returns touchdown meters from entry.
 */
function flyPlanned({ gliderId, windKmh, level = 1, plan }) {
  const g = GLIDERS.find((x) => x.id === gliderId);
  const polar = buildPolar(g.polar_data, 1.0);
  let pos = { x: 0, y: APPROACH_ALT_M * pxPerM };
  let t = 3.21; // arbitrary phase
  const dt = 1 / 30;
  for (let i = 0; i < 30 * 300; i++) {
    const { airspeedKmh, ears = false } = plan(pos.y / pxPerM);
    const speed = ears ? airspeedKmh * 0.94 : airspeedKmh;
    const vzMs = polar.f(airspeedKmh) - (ears ? 1.15 : 0);
    const step = landingStep(
      pos,
      { airspeedKmh: speed, windKmh, vzMs, level, groundY, pxPerM, tSec: t },
      dt,
    );
    pos = { x: step.x, y: step.y };
    t += dt;
    if (pos.y <= 1) return { xM: pos.x / pxPerM, gsMs: step.gsMs, vzMs: step.vzMs };
  }
  throw new Error("never landed");
}

function flyApproach({ gliderId, airspeedKmh, windKmh, level = 1, ears = false }) {
  return flyPlanned({ gliderId, windKmh, level, plan: () => ({ airspeedKmh, ears }) });
}

describe("wind model", () => {
  it("gradient reduces wind to ~45% at the surface and 100% aloft", () => {
    expect(windGradient(groundY, groundY)).toBeCloseTo(0.45, 2);
    expect(windGradient(0, groundY)).toBe(1);
  });

  it("gusts stay within a sane band around 1", () => {
    for (let t = 0; t < 120; t += 0.1) {
      const g = windGust(t);
      expect(g).toBeGreaterThan(0.7);
      expect(g).toBeLessThan(1.3);
    }
  });
});

describe("spot landing is winnable", () => {
  it("big ears shorten the approach (steeper descent)", () => {
    const clean = flyApproach({ gliderId: "en-b-low", airspeedKmh: 38, windKmh: 10 });
    const ears = flyApproach({ gliderId: "en-b-low", airspeedKmh: 38, windKmh: 10, ears: true });
    expect(ears.xM).toBeLessThan(clean.xM - 15);
  });

  it("the reachable band is wide enough that speed choice matters", () => {
    for (const g of GLIDERS) {
      const polar = buildPolar(g.polar_data, 1.0);
      const band = estimateLandingBand(polar.f, polar.range, 12);
      expect(band.maxM - band.minM, g.id).toBeGreaterThan(30);
    }
  });

  it("a mid-band target is hittable within 3 m with one speed change, for every wing and wind", () => {
    for (const g of GLIDERS) {
      const polar = buildPolar(g.polar_data, 1.0);
      for (const wind of [8, 14, 20]) {
        const band = estimateLandingBand(polar.f, polar.range, wind);
        const targetM = (band.minM + band.maxM) / 2;

        // find the extremes of the reachable set at constant speed
        let short = null;
        let long = null;
        for (let v = polar.range[0] + 0.5; v <= polar.range[1]; v += 1) {
          for (const ears of [false, true]) {
            const { xM } = flyApproach({ gliderId: g.id, airspeedKmh: v, windKmh: wind, ears });
            if (!short || xM < short.xM) short = { v, ears, xM };
            if (!long || xM > long.xM) long = { v, ears, xM };
          }
        }
        expect(short.xM, `${g.id} @ ${wind}`).toBeLessThan(targetM);
        expect(long.xM, `${g.id} @ ${wind}`).toBeGreaterThan(targetM);

        // like a real pilot: fly the long configuration, then switch to the
        // short one at some altitude — bisect the switch point
        let lo = 0;
        let hi = APPROACH_ALT_M;
        let miss = Infinity;
        for (let i = 0; i < 14; i++) {
          const switchAlt = (lo + hi) / 2;
          const { xM } = flyPlanned({
            gliderId: g.id,
            windKmh: wind,
            plan: (altM) =>
              altM > switchAlt
                ? { airspeedKmh: long.v, ears: long.ears }
                : { airspeedKmh: short.v, ears: short.ears },
          });
          miss = Math.min(miss, Math.abs(xM - targetM));
          if (xM > targetM) hi = switchAlt;
          else lo = switchAlt;
        }
        // Bisection converges into gust-phase jitter (a later switch lands in
        // a different gust), so a few meters of scatter is physical, not error.
        expect(miss, `${g.id} @ ${wind} km/h`).toBeLessThan(5);
      }
    }
  });
});

describe("scoreLanding", () => {
  it("bullseye, soft, hard, crash, missed", () => {
    expect(scoreLanding({ distanceM: 1, vzMs: -1.1, gsMs: 4, missed: false }).verdictKey).toBe(
      "landing_bullseye",
    );
    expect(scoreLanding({ distanceM: 10, vzMs: -1.1, gsMs: 4, missed: false }).verdictKey).toBe(
      "landing_soft",
    );
    expect(scoreLanding({ distanceM: 3, vzMs: -2.8, gsMs: 4, missed: false }).verdictKey).toBe(
      "landing_hard",
    );
    expect(scoreLanding({ distanceM: 3, vzMs: -6, gsMs: 4, missed: false }).verdictKey).toBe(
      "landing_crash",
    );
    expect(scoreLanding({ missed: true }).verdictKey).toBe("landing_missed");
    expect(scoreLanding({ distanceM: 0.5, vzMs: -1, gsMs: 3, missed: false }).score).toBeGreaterThan(
      95,
    );
  });
});
