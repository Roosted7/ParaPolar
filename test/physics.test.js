import { describe, it, expect } from "vitest";
import {
  buildNaturalCubicSpline,
  deriveStallPoint,
  buildPolar,
  findBestGlidePoint,
} from "../src/lib/physics";
import { GLIDERS } from "../src/data/gliders";

describe("buildNaturalCubicSpline", () => {
  it("passes exactly through all anchor points", () => {
    const xs = [0, 1, 3, 6];
    const ys = [2, -1, 4, 0];
    const s = buildNaturalCubicSpline(xs, ys);
    xs.forEach((x, i) => expect(s.eval(x)).toBeCloseTo(ys[i], 9));
  });

  it("is symmetric for symmetric data (regression for back-substitution bug)", () => {
    // The old implementation had `y2[k]*y2[k+1] + u[k] || y2[k]`, which broke
    // the tridiagonal back-substitution whenever a coefficient landed on 0.
    const s = buildNaturalCubicSpline([0, 1, 2], [0, 1, 0]);
    expect(s.eval(0.5)).toBeCloseTo(s.eval(1.5), 9);
    expect(s.eval(0.25)).toBeCloseTo(s.eval(1.75), 9);
  });

  it("clamps to endpoint values outside the range", () => {
    const s = buildNaturalCubicSpline([10, 20, 30], [1, 2, 3]);
    expect(s.eval(0)).toBe(1);
    expect(s.eval(99)).toBe(3);
  });

  it("reproduces a straight line exactly", () => {
    const xs = [0, 2, 5, 9];
    const s = buildNaturalCubicSpline(
      xs,
      xs.map((x) => 3 * x - 1),
    );
    expect(s.eval(1)).toBeCloseTo(2, 9);
    expect(s.eval(4)).toBeCloseTo(11, 9);
    expect(s.eval(7)).toBeCloseTo(20, 9);
  });
});

describe("deriveStallPoint", () => {
  it("puts stall slower and sinkier than min-sink", () => {
    const { stallSpeed, stallSink } = deriveStallPoint(26, -1.1);
    expect(stallSpeed).toBeLessThan(26);
    expect(stallSpeed).toBeGreaterThanOrEqual(10);
    expect(stallSink).toBeLessThanOrEqual(-3.5);
  });
});

describe("buildPolar", () => {
  const enA = GLIDERS.find((g) => g.id === "en-a");

  it("passes through the glider's anchor speeds", () => {
    const polar = buildPolar(enA.polar_data, 1.0);
    expect(polar.f(enA.polar_data.trim_speed_kmh)).toBeCloseTo(
      enA.polar_data.trim_sink_rate_ms,
      6,
    );
    expect(polar.f(enA.polar_data.max_speed_kmh)).toBeCloseTo(
      enA.polar_data.max_speed_sink_rate_ms,
      6,
    );
  });

  it("scales speeds and sink with sqrt(wing loading)", () => {
    const heavy = buildPolar(enA.polar_data, 1.21); // sqrt = 1.1
    expect(heavy.range[1]).toBeCloseTo(enA.polar_data.max_speed_kmh * 1.1, 6);
    expect(heavy.f(heavy.range[1])).toBeCloseTo(
      enA.polar_data.max_speed_sink_rate_ms * 1.1,
      6,
    );
  });

  it("only produces sink (vz < 0) across the valid range in still air", () => {
    for (const g of GLIDERS) {
      const polar = buildPolar(g.polar_data, 1.0);
      for (let v = polar.range[0]; v <= polar.range[1]; v += 0.5) {
        expect(polar.f(v)).toBeLessThan(0);
      }
    }
  });
});

describe("findBestGlidePoint", () => {
  const polar = buildPolar(GLIDERS.find((g) => g.id === "en-a").polar_data, 1.0);
  const search = (windKmh, liftMs) =>
    findBestGlidePoint({
      fPolarMsAtKmh: polar.f,
      speedRange: polar.range,
      windKmh,
      liftMs,
      step: 0.05,
    });

  it("finds a tangent point with the flattest descent gradient", () => {
    const best = search(0, 0);
    expect(best).not.toBeNull();
    for (let v = polar.range[0]; v <= polar.range[1]; v += 1) {
      const gradient = -polar.f(v) / v;
      expect(best.ratio).toBeLessThanOrEqual(gradient + 1e-9);
    }
  });

  it("recommends flying faster into a headwind", () => {
    expect(search(15, 0).vx).toBeGreaterThan(search(0, 0).vx);
  });

  it("recommends flying slower with a tailwind", () => {
    expect(search(-15, 0).vx).toBeLessThan(search(0, 0).vx);
  });

  it("recommends flying faster in sink", () => {
    expect(search(0, -2).vx).toBeGreaterThan(search(0, 0).vx);
  });

  it("matches the expected best-glide ratio order of magnitude", () => {
    const best = search(0, 0);
    // ratio is descent gradient in (m/s)/(km/h); L/D = (v/3.6)/(-vz)
    const ld = best.vx / 3.6 / -best.vz;
    expect(ld).toBeGreaterThan(6);
    expect(ld).toBeLessThan(12);
  });
});
