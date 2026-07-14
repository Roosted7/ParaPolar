import { describe, it, expect } from "vitest";
import { encodeShareParam, decodeShareParam, DEFAULT_STATE } from "../src/lib/persistence";

describe("share permalinks", () => {
  it("round-trips app state", () => {
    const state = {
      ...DEFAULT_STATE,
      unit: "kt",
      gliderId: "en-c",
      pilotSlider: 72,
      windKmh: 12,
      liftMs: -1.5,
      maccreadyMs: 2.5,
      wingLoad: 1.08,
    };
    const decoded = decodeShareParam(encodeShareParam(state));
    expect(decoded).toMatchObject({
      unit: "kt",
      gliderId: "en-c",
      pilotSlider: 72,
      windKmh: 12,
      liftMs: -1.5,
      maccreadyMs: 2.5,
      wingLoad: 1.08,
    });
  });

  it("decodes legacy links produced with escape/unescape encoding", () => {
    // Byte-identical to the old btoa(unescape(encodeURIComponent(json))) output.
    const legacyJson = JSON.stringify({
      v: 1,
      unit: "kmh",
      gliderId: "en-a",
      pilotSlider: 50,
      windKmh: 10,
      liftMs: 0,
      maccreadyMs: 0,
      wingLoad: 1,
    });
    const legacyParam = btoa(legacyJson);
    expect(decodeShareParam(legacyParam)).toMatchObject({ gliderId: "en-a", windKmh: 10 });
  });

  it("rejects garbage and wrong versions", () => {
    expect(decodeShareParam("not-base64!!!")).toBeNull();
    expect(decodeShareParam(btoa(JSON.stringify({ v: 99 })))).toBeNull();
  });

  it("drops unknown glider ids and invalid units", () => {
    const param = btoa(JSON.stringify({ v: 1, unit: "warp", gliderId: "nope", windKmh: 5 }));
    const decoded = decodeShareParam(param);
    expect(decoded.unit).toBeUndefined();
    expect(decoded.gliderId).toBeUndefined();
    expect(decoded.windKmh).toBe(5);
  });
});
