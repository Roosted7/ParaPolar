// Unit conversions and display helpers.
// Internal convention: horizontal speeds in km/h, vertical speeds in m/s.

export const KMH_TO_MS = 1000 / 3600;
export const MS_TO_KMH = 3.6;
export const KMH_TO_KT = 0.5399568;
export const KMH_TO_MPH = 0.6213712;
export const MS_TO_KT = 1.9438445;
export const MS_TO_FPM = 196.850394;

export const SPEED_UNITS = ["kmh", "ms", "mph", "kt"];

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Convert a horizontal speed given in km/h to the selected unit. */
export function convertSpeed(valKmh, unit) {
  switch (unit) {
    case "ms":
      return valKmh * KMH_TO_MS;
    case "mph":
      return valKmh * KMH_TO_MPH;
    case "kt":
      return valKmh * KMH_TO_KT;
    case "kmh":
    default:
      return valKmh;
  }
}

/**
 * Vertical speeds are shown in the unit pilots actually use for the selected
 * speed unit: m/s for metric, knots for kt, feet/min for mph.
 */
export function verticalUnitFor(unit) {
  if (unit === "kt") return "kt";
  if (unit === "mph") return "fpm";
  return "ms";
}

/** Convert a vertical speed given in m/s to the display unit for `unit`. */
export function convertVertical(valMs, unit) {
  switch (verticalUnitFor(unit)) {
    case "kt":
      return valMs * MS_TO_KT;
    case "fpm":
      return valMs * MS_TO_FPM;
    default:
      return valMs;
  }
}

/** Format a horizontal speed (km/h internal) with its unit label. */
export function formatSpeed(valKmh, unit, t, digits = 1) {
  return `${convertSpeed(valKmh, unit).toFixed(digits)} ${t[`unit_${unit}`]}`;
}

/** Format a vertical speed (m/s internal) with its unit label. */
export function formatVertical(valMs, unit, t) {
  const vUnit = verticalUnitFor(unit);
  const val = convertVertical(valMs, unit);
  const digits = vUnit === "fpm" ? 0 : vUnit === "kt" ? 1 : 2;
  return `${val.toFixed(digits)} ${t[`unit_${vUnit}`]}`;
}
