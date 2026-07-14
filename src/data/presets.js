// Environment scenarios for advanced mode. Values applied on selection.

export const PRESETS = [
  { id: "calm", windKmh: 0, liftMs: 0, pilotSlider: 50 },
  { id: "ridge", windKmh: 15, liftMs: 0.5, pilotSlider: 60 },
  { id: "valley", windKmh: 20, liftMs: -1.5, pilotSlider: 75 },
  { id: "thermal", windKmh: 5, liftMs: 4, pilotSlider: 45 },
  // Strong headwind + lift so slower wings fly backwards over ground near 1/3 brakes.
  { id: "backwind", windKmh: 25, liftMs: 3, pilotSlider: 26 },
];
