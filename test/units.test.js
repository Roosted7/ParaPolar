import { describe, it, expect } from "vitest";
import {
  convertSpeed,
  convertVertical,
  verticalUnitFor,
  formatSpeed,
  formatVertical,
  clamp,
} from "../src/lib/units";
import { I18N } from "../src/lib/i18n";

const t = I18N.en;

describe("convertSpeed", () => {
  it("converts 100 km/h correctly", () => {
    expect(convertSpeed(100, "kmh")).toBeCloseTo(100);
    expect(convertSpeed(100, "ms")).toBeCloseTo(27.78, 2);
    expect(convertSpeed(100, "mph")).toBeCloseTo(62.14, 2);
    expect(convertSpeed(100, "kt")).toBeCloseTo(54.0, 1);
  });
});

describe("vertical speed display", () => {
  it("uses the unit pilots expect per speed-unit system", () => {
    expect(verticalUnitFor("kmh")).toBe("ms");
    expect(verticalUnitFor("ms")).toBe("ms");
    expect(verticalUnitFor("mph")).toBe("fpm");
    expect(verticalUnitFor("kt")).toBe("kt");
  });

  it("converts 1 m/s to each display unit", () => {
    expect(convertVertical(1, "kmh")).toBeCloseTo(1);
    expect(convertVertical(1, "kt")).toBeCloseTo(1.944, 3);
    expect(convertVertical(1, "mph")).toBeCloseTo(196.85, 1);
  });
});

describe("formatters", () => {
  it("formats speed with unit labels", () => {
    expect(formatSpeed(36, "kmh", t)).toBe("36.0 km/h");
    expect(formatSpeed(36, "ms", t)).toBe("10.0 m/s");
  });

  it("formats vertical speed with sensible precision", () => {
    expect(formatVertical(-1.234, "kmh", t)).toBe("-1.23 m/s");
    expect(formatVertical(1, "mph", t)).toBe("197 ft/min");
    expect(formatVertical(1, "kt", t)).toBe("1.9 kt");
  });
});

describe("clamp", () => {
  it("clamps to bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
