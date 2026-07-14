import { describe, it, expect } from "vitest";
import { buildPolar } from "../src/lib/physics";
import { minSinkSpeedKmh, lessonAchieved } from "../src/lib/lessons";
import { GLIDERS } from "../src/data/gliders";

const enA = GLIDERS.find((g) => g.id === "en-a");
const polar = buildPolar(enA.polar_data, 1.0);

describe("minSinkSpeedKmh", () => {
  it("finds the true top of the curve (no sampled point sinks less)", () => {
    const v = minSinkSpeedKmh(polar);
    const sinkAtV = polar.f(v);
    for (let x = polar.range[0]; x <= polar.range[1]; x += 0.5) {
      expect(sinkAtV).toBeGreaterThanOrEqual(polar.f(x) - 1e-9);
    }
    // and it lives in the plausible slow-flight region
    expect(v).toBeGreaterThan(polar.range[0]);
    expect(v).toBeLessThan(enA.polar_data.trim_speed_kmh);
  });
});

describe("lessonAchieved", () => {
  const base = {
    pilotSlider: 50,
    displaySpeedKmh: 35,
    speedToFlyKmh: 40,
    vxGroundMs: 5,
    minSinkKmh: 26,
  };

  it("meet-the-polar: achieved by moving the slider away from trim", () => {
    expect(lessonAchieved("meet-the-polar", base)).toBe(false);
    expect(lessonAchieved("meet-the-polar", { ...base, pilotSlider: 70 })).toBe(true);
    expect(lessonAchieved("meet-the-polar", { ...base, pilotSlider: 30 })).toBe(true);
  });

  it("min-sink: achieved near the minimum-sink speed", () => {
    expect(lessonAchieved("min-sink-vs-best-glide", { ...base, displaySpeedKmh: 26.5 })).toBe(true);
    expect(lessonAchieved("min-sink-vs-best-glide", base)).toBe(false);
  });

  it("speed-to-fly lessons: achieved near STF", () => {
    for (const id of ["headwind", "tailwind", "sink"]) {
      expect(lessonAchieved(id, { ...base, displaySpeedKmh: 40 })).toBe(true);
      expect(lessonAchieved(id, base)).toBe(false);
    }
  });

  it("backwind: achieved when actually going backwards", () => {
    expect(lessonAchieved("backwind", { ...base, vxGroundMs: -0.5 })).toBe(true);
    expect(lessonAchieved("backwind", base)).toBe(false);
  });
});

describe("every lesson goal is reachable with the speed rail", () => {
  it("STF lessons: snapping to the notch satisfies the goal for each setup", async () => {
    const { LESSONS } = await import("../src/content/lessonContent.js");
    const { findBestGlidePoint } = await import("../src/lib/physics.js");
    const { speedLandmarks, speedToSlider, sliderToSpeed } = await import(
      "../src/lib/pilotControl.js"
    );
    for (const lesson of LESSONS.en) {
      if (!["headwind", "tailwind", "sink"].includes(lesson.id)) continue;
      const g = GLIDERS.find((x) => x.id === lesson.setup.gliderId) ?? enA;
      const p = buildPolar(g.polar_data, 1.0);
      const lm = speedLandmarks(p, g.polar_data.trim_speed_kmh, 1.0);
      const best = findBestGlidePoint({
        fPolarMsAtKmh: p.f,
        speedRange: p.range,
        windKmh: lesson.setup.windKmh ?? 0,
        liftMs: lesson.setup.liftMs ?? 0,
        step: 0.05,
      });
      expect(best, lesson.id).not.toBeNull();
      // the STF notch slider position must map back within the goal tolerance
      const notch = speedToSlider(best.vx, lm);
      const speedAtNotch = sliderToSpeed(notch, lm);
      expect(Math.abs(speedAtNotch - best.vx), lesson.id).toBeLessThanOrEqual(1.5);
    }
  });

  it("backwind lesson setup can actually produce negative groundspeed", async () => {
    const { LESSONS } = await import("../src/content/lessonContent.js");
    const lesson = LESSONS.en.find((l) => l.id === "backwind");
    const g = GLIDERS.find((x) => x.id === lesson.setup.gliderId) ?? enA;
    const p = buildPolar(g.polar_data, 1.0);
    // slowest flyable speed must be below the wind speed
    expect(p.range[0]).toBeLessThan(lesson.setup.windKmh);
  });
});
