import { describe, it, expect } from "vitest";
import { buildPolar, findBestGlidePoint } from "../src/lib/physics";
import { heightLost, optimalCrossing, scoreCrossing } from "../src/lib/challenge";
import { GLIDERS } from "../src/data/gliders";

const enA = GLIDERS.find((g) => g.id === "en-a");
const polar = buildPolar(enA.polar_data, 1.0);
const base = { fPolarMsAtKmh: polar.f, speedRange: polar.range, distanceKm: 3 };

describe("heightLost", () => {
  it("loses less height at best-glide speed than at the extremes (calm air)", () => {
    const best = findBestGlidePoint({
      fPolarMsAtKmh: polar.f,
      speedRange: polar.range,
      windKmh: 0,
      liftMs: 0,
      step: 0.05,
    });
    const atBest = heightLost({ ...base, speedKmh: best.vx, windKmh: 0, liftMs: 0 });
    const atStall = heightLost({ ...base, speedKmh: polar.range[0], windKmh: 0, liftMs: 0 });
    const atMax = heightLost({ ...base, speedKmh: polar.range[1], windKmh: 0, liftMs: 0 });
    expect(atBest).toBeLessThan(atStall);
    expect(atBest).toBeLessThan(atMax);
  });

  it("returns null when blown backwards", () => {
    expect(heightLost({ ...base, speedKmh: 25, windKmh: 30, liftMs: 0 })).toBeNull();
  });

  it("costs more height into a headwind", () => {
    const calm = heightLost({ ...base, speedKmh: 40, windKmh: 0, liftMs: 0 });
    const wind = heightLost({ ...base, speedKmh: 40, windKmh: 15, liftMs: 0 });
    expect(wind).toBeGreaterThan(calm);
  });
});

describe("optimalCrossing", () => {
  it("recommends flying faster into a headwind", () => {
    const calm = optimalCrossing({ ...base, windKmh: 0, liftMs: 0 });
    const windy = optimalCrossing({ ...base, windKmh: 15, liftMs: 0 });
    expect(windy.speedKmh).toBeGreaterThan(calm.speedKmh);
  });

  it("matches the best-glide-over-ground speed in still descent", () => {
    const best = findBestGlidePoint({
      fPolarMsAtKmh: polar.f,
      speedRange: polar.range,
      windKmh: 10,
      liftMs: -1,
      step: 0.05,
    });
    const opt = optimalCrossing({ ...base, windKmh: 10, liftMs: -1 });
    expect(Math.abs(opt.speedKmh - best.vx)).toBeLessThan(1);
  });
});

describe("scoreCrossing", () => {
  it("gives 100 for optimal, less for worse, 0 for blown back", () => {
    expect(scoreCrossing(120, 120)).toBe(100);
    expect(scoreCrossing(240, 120)).toBe(50);
    expect(scoreCrossing(null, 120)).toBe(0);
    expect(scoreCrossing(0, 120)).toBe(100); // arrived climbing
  });
});
