// Live goal checks for the micro-lessons: each lesson is achieved by DOING
// something in the scene, not by reading. Tolerances are generous — the STF
// snap on the speed rail helps the pilot land exactly on the target.

/** Airspeed of minimum sink for a polar (km/h). */
export function minSinkSpeedKmh(polar) {
  let best = polar.range[0];
  let bestVz = -Infinity;
  for (let v = polar.range[0]; v <= polar.range[1]; v += 0.1) {
    const vz = polar.f(v);
    if (vz > bestVz) {
      bestVz = vz;
      best = v;
    }
  }
  return best;
}

/**
 * Whether the current scene state satisfies a lesson's goal.
 * ctx: { pilotSlider, displaySpeedKmh, speedToFlyKmh, vxGroundMs, minSinkKmh }
 */
export function lessonAchieved(id, ctx) {
  const nearStf =
    ctx.speedToFlyKmh != null && Math.abs(ctx.displaySpeedKmh - ctx.speedToFlyKmh) <= 1.5;
  switch (id) {
    case "meet-the-polar":
      // just move: ride the curve away from trim in either direction
      return Math.abs(ctx.pilotSlider - 50) >= 15;
    case "min-sink-vs-best-glide":
      return Math.abs(ctx.displaySpeedKmh - ctx.minSinkKmh) <= 1.5;
    case "headwind":
    case "tailwind":
    case "sink":
      return nearStf;
    case "backwind":
      return ctx.vxGroundMs < -0.05;
    default:
      return false;
  }
}
