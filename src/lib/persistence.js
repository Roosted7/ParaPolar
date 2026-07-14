// App-state persistence: localStorage snapshots and shareable permalinks.
//
// Permalink format (?s=<base64 JSON>, v:1) is kept byte-compatible with the
// original implementation so old shared links keep working.

import { GLIDERS } from "../data/gliders";
import { SPEED_UNITS } from "./units";
import * as storage from "./storage";

const STATE_KEY = "pp_state_v2";
// Legacy keys from the previous per-mode persistence scheme.
const LEGACY_ADV_KEY = "pp_adv_state_v1";
const LEGACY_SIMPLE_KEY = "pp_simple_state_v1";
const LEGACY_MODE_KEY = "pp_last_mode";

export const DEFAULT_STATE = {
  mode: "simple", // simple | advanced
  unit: "kmh",
  gliderId: "en-a",
  pilotSlider: 50, // 0 deep stall .. 50 trim .. 100 max .. 120 overspeed
  simpleWind: 0, // -1..1 (left = headwind)
  windKmh: 0, // + headwind, - tailwind
  liftMs: 0, // + lift, - sink
  preset: "none",
  maccreadyMs: 0,
  wingLoad: 1.0,
};

function sanitize(partial) {
  const out = {};
  if (partial.mode === "simple" || partial.mode === "advanced") out.mode = partial.mode;
  if (SPEED_UNITS.includes(partial.unit)) out.unit = partial.unit;
  if (GLIDERS.some((g) => g.id === partial.gliderId)) out.gliderId = partial.gliderId;
  for (const key of ["pilotSlider", "simpleWind", "windKmh", "liftMs", "maccreadyMs", "wingLoad"]) {
    if (Number.isFinite(partial[key])) out[key] = partial[key];
  }
  if (typeof partial.preset === "string") out.preset = partial.preset;
  return out;
}

/** Base64 helpers that round-trip arbitrary UTF-8 (replaces escape/unescape). */
function encodeBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function decodeBase64Utf8(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareParam(state) {
  const payload = {
    v: 1,
    unit: state.unit,
    gliderId: state.gliderId,
    pilotSlider: state.pilotSlider,
    windKmh: state.windKmh,
    liftMs: state.liftMs,
    maccreadyMs: state.maccreadyMs,
    wingLoad: state.wingLoad,
  };
  return encodeBase64Utf8(JSON.stringify(payload));
}

export function decodeShareParam(param) {
  try {
    const json = JSON.parse(decodeBase64Utf8(param));
    if (!json || json.v !== 1) return null;
    return sanitize(json);
  } catch {
    return null;
  }
}

function loadStoredState() {
  const v2 = storage.getJSON(STATE_KEY);
  if (v2) return sanitize(v2);

  // One-time migration from the legacy per-mode keys.
  const legacyMode = storage.getItem(LEGACY_MODE_KEY);
  const adv = storage.getJSON(LEGACY_ADV_KEY) || {};
  const simple = storage.getJSON(LEGACY_SIMPLE_KEY) || {};
  const merged = sanitize({ ...adv, ...simple, mode: legacyMode });
  return Object.keys(merged).length > 0 ? merged : null;
}

/**
 * Resolve the initial app state, in priority order:
 * permalink (?s=..., forces advanced mode) > localStorage > defaults.
 */
export function loadInitialState() {
  let fromLink = null;
  try {
    const s = new URL(window.location.href).searchParams.get("s");
    if (s) fromLink = decodeShareParam(s);
  } catch {
    /* ignore */
  }
  if (fromLink) {
    return { ...DEFAULT_STATE, ...fromLink, mode: "advanced", preset: "none" };
  }
  return { ...DEFAULT_STATE, ...(loadStoredState() || {}) };
}

export function saveState(state) {
  storage.setJSON(STATE_KEY, { v: 2, ...state });
}

export function clearSavedState() {
  storage.removeItem(STATE_KEY);
  storage.removeItem(LEGACY_ADV_KEY);
  storage.removeItem(LEGACY_SIMPLE_KEY);
  storage.removeItem(LEGACY_MODE_KEY);
}
