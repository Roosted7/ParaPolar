// Environment scenarios for advanced mode — each curated for the wing class
// it teaches best. Values applied on selection.

export const PRESETS = [
  { id: "calm", gliderId: "en-a", windKmh: 0, liftMs: 0, pilotSlider: 50 },
  { id: "ridge", gliderId: "en-b-low", windKmh: 15, liftMs: 0.5, pilotSlider: 60 },
  // an XC wing crossing a valley on bar through sink
  { id: "valley", gliderId: "en-b-plus", windKmh: 20, liftMs: -1.5, pilotSlider: 75 },
  // a performance wing coring a strong climb
  { id: "thermal", gliderId: "en-c", windKmh: 5, liftMs: 4, pilotSlider: 45 },
  // slow single-skin + strong wind = flying backwards near 1/3 brakes
  { id: "backwind", gliderId: "single-skin", windKmh: 25, liftMs: 3, pilotSlider: 30 },
  // strong lift under a cloud: full bar + big ears to escape
  { id: "cloudsuck", gliderId: "en-b-low", windKmh: 5, liftMs: 4.5, pilotSlider: 100, ears: true },
];
