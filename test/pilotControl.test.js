import { describe, it, expect } from "vitest";
import { buildPolar } from "../src/lib/physics";
import { speedLandmarks, sliderToSpeed, speedToSlider } from "../src/lib/pilotControl";
import { GLIDERS } from "../src/data/gliders";

const enA = GLIDERS.find((g) => g.id === "en-a");
const polar = buildPolar(enA.polar_data, 1.0);
const lm = speedLandmarks(polar, enA.polar_data.trim_speed_kmh, 1.0);

describe("sliderToSpeed", () => {
  it("hits the landmarks at the segment boundaries (full bar IS vmax)", () => {
    expect(sliderToSpeed(0, lm)).toBeCloseTo(lm.deepStallX, 6);
    expect(sliderToSpeed(25, lm)).toBeCloseTo(lm.stallX, 6);
    expect(sliderToSpeed(50, lm)).toBeCloseTo(lm.trimX, 6);
    expect(sliderToSpeed(100, lm)).toBeCloseTo(lm.vmaxX, 6);
  });

  it("is monotonically increasing", () => {
    let prev = -Infinity;
    for (let s = 0; s <= 100; s += 1) {
      const v = sliderToSpeed(s, lm);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("speedToSlider", () => {
  it("inverts sliderToSpeed on the valid range", () => {
    for (let s = 25; s <= 100; s += 5) {
      expect(speedToSlider(sliderToSpeed(s, lm), lm)).toBe(s);
    }
  });

  it("clamps out-of-range speeds", () => {
    expect(speedToSlider(0, lm)).toBe(25); // below stall -> stall
    expect(speedToSlider(999, lm)).toBe(100); // above vmax -> vmax
  });
});
