// Mapping between the pilot-control slider (0..120) and target airspeed.
// 0..25: deep stall -> stall, 25..50: stall -> trim,
// 50..100: trim -> max speed, 100..120: overspeed (collapse risk).

import { clamp } from "./units";

export const SLIDER_MAX = 120;
export const DEEP_STALL_MARGIN_KMH = 6;
export const OVERSPEED_MARGIN_KMH = 6;

/** Derive the slider's speed landmarks from a polar + glider trim speed. */
export function speedLandmarks(polar, trimSpeedKmh, wingLoad = 1.0) {
  const stallX = polar.anchors[0].x;
  const vmaxX = polar.anchors[polar.anchors.length - 1].x;
  return {
    deepStallX: Math.max(5, stallX - DEEP_STALL_MARGIN_KMH),
    stallX,
    trimX: trimSpeedKmh * Math.sqrt(wingLoad),
    vmaxX,
    overSpeedX: vmaxX + OVERSPEED_MARGIN_KMH,
  };
}

export function sliderToSpeed(slider, { deepStallX, stallX, trimX, vmaxX, overSpeedX }) {
  const ps = clamp(slider, 0, SLIDER_MAX);
  if (ps <= 25) return deepStallX + ((stallX - deepStallX) * ps) / 25;
  if (ps <= 50) return stallX + ((trimX - stallX) * (ps - 25)) / 25;
  if (ps <= 100) return trimX + ((vmaxX - trimX) * (ps - 50)) / 50;
  return vmaxX + ((overSpeedX - vmaxX) * (ps - 100)) / 20;
}

/** Inverse of sliderToSpeed for the valid (stall..vmax) range, for scrubbing. */
export function speedToSlider(speedKmh, { stallX, trimX, vmaxX }) {
  const v = clamp(speedKmh, stallX, vmaxX);
  const slider =
    v <= trimX
      ? 25 + (25 * (v - stallX)) / (trimX - stallX)
      : 50 + (50 * (v - trimX)) / (vmaxX - trimX);
  return clamp(Math.round(slider), 0, SLIDER_MAX);
}

/**
 * Full-range inverse of sliderToSpeed (deep stall .. overspeed) — used by
 * wing dragging, which is allowed to pull the wing into the invalid regimes.
 */
export function speedToSliderFull(speedKmh, lm) {
  const { deepStallX, stallX, trimX, vmaxX, overSpeedX } = lm;
  const v = clamp(speedKmh, deepStallX, overSpeedX);
  let slider;
  if (v < stallX) slider = (25 * (v - deepStallX)) / (stallX - deepStallX);
  else if (v <= trimX) slider = 25 + (25 * (v - stallX)) / (trimX - stallX);
  else if (v <= vmaxX) slider = 50 + (50 * (v - trimX)) / (vmaxX - trimX);
  else slider = 100 + (20 * (v - vmaxX)) / (overSpeedX - vmaxX);
  return clamp(Math.round(slider), 0, SLIDER_MAX);
}
