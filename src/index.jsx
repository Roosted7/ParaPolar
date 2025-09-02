import React, { useEffect, useMemo, useRef, useState } from "react";
import { I18N, detectLang } from "./lib/i18n";
import { GLIDERS } from "./data/gliders";
import {
  KMH_TO_MS,
  MS_TO_KMH,
  clamp,
  buildNaturalCubicSpline,
  deriveStallPoint,
  makePolarFunction,
  findBestGlidePoint,
  convertSpeed,
  convertVerticalMs,
} from "./lib/physics";
import PolarGraph from "./components/PolarGraph";
import GroundViz from "./components/GroundViz";

export default function App() {
  // ===== i18n & theme =====
  const [lang, setLang] = useState(detectLang());
  const t = I18N[lang];
  const [dark, setDark] = useState(false);
  // initialize dark from system on first mount
  const didInitRef = useRef(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pp_dark");
      if (saved === "true" || saved === "false") {
        setDark(saved === "true");
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDark(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem("pp_dark", dark ? "true" : "false"); } catch {}
    // theme-color dynamic update
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0f172a' : '#f8fafc');
  }, [dark]);

  // ===== UI state =====
  const [mode, setMode] = useState("simple"); // simple | advanced
  const [unit, setUnit] = useState("kmh");
  const [selectedGliderId, setSelectedGliderId] = useState(GLIDERS[1].id); // default EN-A
  const [pilotSlider, setPilotSlider] = useState(50); // 0..120 (0 deep stall, 50 trim, 100 max, 120 overspeed)

  // Simple mode wind knob (-1..1). Left=headwind, right=tailwind.
  const [simpleWind, setSimpleWind] = useState(0);

  // Advanced environment
  const [windKmh, setWindKmh] = useState(0); // + headwind, − tailwind
  const [liftMs, setLiftMs] = useState(0); // + lift, − sink

  const [preset, setPreset] = useState("none");
  const [maccreadyMs, setMaccreadyMs] = useState(0);
  const [wingLoad, setWingLoad] = useState(1.0);

  const glider = GLIDERS.find((g) => g.id === selectedGliderId);

  // ===== Last mode & per-mode snapshots =====
  const hydratedFromLinkRef = useRef(false);
  useEffect(() => {
    // If permalink present, hydrate from it and force advanced
    try {
      const url = new URL(window.location.href);
      const s = url.searchParams.get('s');
      if (s) {
        const json = JSON.parse(decodeURIComponent(escape(window.atob(s))));
        if (json && json.v === 1) {
          setMode('advanced');
          if (json.unit) setUnit(json.unit);
          if (json.gliderId) setSelectedGliderId(json.gliderId);
          if (Number.isFinite(json.pilotSlider)) setPilotSlider(json.pilotSlider);
          if (Number.isFinite(json.windKmh)) setWindKmh(json.windKmh);
          if (Number.isFinite(json.liftMs)) setLiftMs(json.liftMs);
          if (Number.isFinite(json.maccreadyMs)) setMaccreadyMs(json.maccreadyMs);
          if (Number.isFinite(json.wingLoad)) setWingLoad(json.wingLoad);
          setPreset('none');
          hydratedFromLinkRef.current = true;
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (hydratedFromLinkRef.current) return;
    // restore last mode and per-mode state
    try {
      const last = localStorage.getItem('pp_last_mode');
      if (last === 'advanced' || last === 'simple') setMode(last);
      const advRaw = localStorage.getItem('pp_adv_state_v1');
      if (advRaw) {
        const s = JSON.parse(advRaw);
        if (s) {
          if (s.unit) setUnit(s.unit);
          if (s.gliderId) setSelectedGliderId(s.gliderId);
          if (Number.isFinite(s.pilotSlider)) setPilotSlider(s.pilotSlider);
          if (Number.isFinite(s.windKmh)) setWindKmh(s.windKmh);
          if (Number.isFinite(s.liftMs)) setLiftMs(s.liftMs);
          if (Number.isFinite(s.maccreadyMs)) setMaccreadyMs(s.maccreadyMs);
          if (Number.isFinite(s.wingLoad)) setWingLoad(s.wingLoad);
        }
      }
      const simpRaw = localStorage.getItem('pp_simple_state_v1');
      if (simpRaw && last === 'simple') {
        const s2 = JSON.parse(simpRaw);
        if (s2) {
          if (s2.gliderId) setSelectedGliderId(s2.gliderId);
          if (Number.isFinite(s2.pilotSlider)) setPilotSlider(s2.pilotSlider);
          if (Number.isFinite(s2.simpleWind)) setSimpleWind(s2.simpleWind);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('pp_last_mode', mode); } catch {}
  }, [mode]);
  // ===== SEO: canonical + alternates =====
  useEffect(() => {
    try {
      const head = document.head;
      const make = (rel, href, hreflang) => {
        const el = document.createElement("link");
        el.rel = rel; el.href = href; if (hreflang) el.hreflang = hreflang; return el;
      };
      // remove previous
      head.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach((n) => n.remove());
      const base = "https://parapolar.com";
      const path = window.location.pathname.replace(/\/(fr|de)(?=\/|$)/, "");
      const canHref = lang === "en" ? `${base}${path || "/"}` : `${base}/${lang}${path === "/" ? "" : path}`;
      head.appendChild(make("canonical", canHref));
      head.appendChild(make("alternate", `${base}${path || "/"}`, "en"));
      head.appendChild(make("alternate", `${base}/fr${path === "/" ? "" : path}`, "fr"));
      head.appendChild(make("alternate", `${base}/de${path === "/" ? "" : path}`, "de"));
      head.appendChild(make("alternate", canHref, "x-default"));
    } catch {}
  }, [lang]);
  // ===== Language persistence and URL sync =====
  useEffect(() => {
    try { localStorage.setItem("pp_lang", lang); } catch {}
    try {
      // update URL path to include /fr or /de (keep query/hash), default is root for en
      const path = window.location.pathname.replace(/\/(fr|de)(?=\/|$)/, "");
      const newPath = lang === "en" ? path || "/" : `/${lang}${path === "/" ? "" : path}`;
      const url = newPath + window.location.search + window.location.hash;
      if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, "", url);
      }
    } catch {}
    try {
      document.cookie = `pp_lang=${lang}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {}
  }, [lang]);

  // ===== State save/restore (intuitive, with a reset) =====
  useEffect(() => {
    // restore once
    try {
      const raw = localStorage.getItem("pp_state_v1");
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.mode === 'advanced') {
          setMode(s.mode);
          if (s.unit) setUnit(s.unit);
          if (s.gliderId) setSelectedGliderId(s.gliderId);
          if (Number.isFinite(s.pilotSlider)) setPilotSlider(s.pilotSlider);
          if (Number.isFinite(s.windKmh)) setWindKmh(s.windKmh);
          if (Number.isFinite(s.liftMs)) setLiftMs(s.liftMs);
          if (s.preset) setPreset(s.preset);
          if (Number.isFinite(s.maccreadyMs)) setMaccreadyMs(s.maccreadyMs);
          if (Number.isFinite(s.wingLoad)) setWingLoad(s.wingLoad);
        }
      }
    } catch {}
    didInitRef.current = true;
  }, []);

  useEffect(() => {
    if (!didInitRef.current) { didInitRef.current = true; return; }
    // Persist per-mode snapshots
    if (mode === 'advanced') {
      const adv = { v:1, unit, gliderId: selectedGliderId, pilotSlider, windKmh, liftMs, preset, maccreadyMs, wingLoad };
      try { localStorage.setItem('pp_adv_state_v1', JSON.stringify(adv)); } catch {}
    } else {
      const simp = { v:1, gliderId: selectedGliderId, pilotSlider, simpleWind };
      try { localStorage.setItem('pp_simple_state_v1', JSON.stringify(simp)); } catch {}
    }
  }, [mode, unit, selectedGliderId, pilotSlider, windKmh, liftMs, preset, maccreadyMs, wingLoad, simpleWind]);

  // ===== Permalinks for advanced mode =====
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (mode !== 'advanced') {
        if (url.searchParams.has('s')) { url.searchParams.delete('s'); window.history.replaceState(null, '', url.toString()); }
        return;
      }
      const payload = { v:1, unit, gliderId: selectedGliderId, pilotSlider, windKmh, liftMs, maccreadyMs, wingLoad };
      const json = JSON.stringify(payload);
      const b64 = window.btoa(unescape(encodeURIComponent(json)));
      url.searchParams.set('s', b64);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  }, [mode, unit, selectedGliderId, pilotSlider, windKmh, liftMs, maccreadyMs, wingLoad]);

  // ===== Build polar (through air) with wing loading =====
  const polar = useMemo(() => {
    const s = Math.sqrt(wingLoad);
    const pd = glider.polar_data;
    const stall = deriveStallPoint(pd.min_sink_speed_kmh, pd.min_sink_rate_ms);
    const anchors = [
      { x: stall.stallSpeed * s, y: stall.stallSink * s },
      { x: pd.min_sink_speed_kmh * s, y: pd.min_sink_rate_ms * s },
      { x: pd.trim_speed_kmh * s, y: pd.trim_sink_rate_ms * s },
      { x: pd.max_speed_kmh * s, y: pd.max_speed_sink_rate_ms * s },
    ].sort((a, b) => a.x - b.x);
    return {
      f: makePolarFunction(anchors),
      range: [anchors[0].x, anchors[anchors.length - 1].x],
      anchors,
    };
  }, [glider, wingLoad]);

  // ===== Map pilot slider to speed incl. invalid regions =====
  const sWL = Math.sqrt(wingLoad);
  const stallX = polar.anchors[0].x;
  const trimX = glider.polar_data.trim_speed_kmh * sWL;
  const vmaxX = polar.anchors[polar.anchors.length - 1].x;
  const deepStallX = Math.max(5, stallX - 6);
  const overSpeedX = vmaxX + 6;

  const desiredSpeedKmh = useMemo(() => {
    const ps = pilotSlider;
    if (ps <= 25) {
      const t = ps / 25; // deep stall -> stall
      return deepStallX + (stallX - deepStallX) * t;
    } else if (ps <= 50) {
      const t = (ps - 25) / 25; // stall -> trim
      return stallX + (trimX - stallX) * t;
    } else if (ps <= 100) {
      const t = (ps - 50) / 50; // trim -> max
      return trimX + (vmaxX - trimX) * t;
    } else {
      const t = (ps - 100) / 20; // max -> overspeed
      return vmaxX + (overSpeedX - vmaxX) * t;
    }
  }, [pilotSlider, deepStallX, stallX, trimX, vmaxX, overSpeedX]);

  const flightMode =
    desiredSpeedKmh < stallX
      ? "stall"
      : desiredSpeedKmh > vmaxX
      ? "collapse"
      : "normal";
  const displaySpeedKmh = clamp(desiredSpeedKmh, stallX, vmaxX);

  // ===== Environment resolve =====
  const envWindKmh = mode === "simple" ? -simpleWind * 20 : windKmh; // left=headwind(+)
  const envLiftMs = mode === "simple" ? 0 : liftMs; // simple hides vertical motion

  // ===== Core kinematics =====
  const vzAirMs = polar.f(displaySpeedKmh);
  const STALL_DROP = -6.0;
  const COLLAPSE_DROP = -8.0;
  const vzAirEff =
    flightMode === "stall"
      ? STALL_DROP
      : flightMode === "collapse"
      ? COLLAPSE_DROP
      : vzAirMs;
  const airspeedForPhysicsKmh =
    flightMode === "stall"
      ? Math.max(0, displaySpeedKmh * 0.3)
      : flightMode === "collapse"
      ? Math.max(0, displaySpeedKmh * 0.6)
      : displaySpeedKmh;

  const vxGroundMs = (airspeedForPhysicsKmh - envWindKmh) * KMH_TO_MS;
  // Lift (>0) reduces sink → add to vz (which is typically negative)
  const vzGroundMs = vzAirEff + envLiftMs;

  const GR_ground = vxGroundMs > 0 ? -vzGroundMs / vxGroundMs : 0;
  const GR_air =
    displaySpeedKmh > 0 ? -vzAirEff / (displaySpeedKmh * KMH_TO_MS) : 0;

  // ===== Best glide tangents =====
  const bestAir = useMemo(
    () =>
      findBestGlidePoint({
        fPolarMsAtKmh: polar.f,
        speedRange: polar.range,
        windKmh: 0,
        liftMs: 0,
        step: 0.05,
      }),
    [polar]
  );
  const bestGround = useMemo(
    () =>
      findBestGlidePoint({
        fPolarMsAtKmh: polar.f,
        speedRange: polar.range,
        windKmh: envWindKmh,
        liftMs: envLiftMs,
        step: 0.05,
      }),
    [polar, envWindKmh, envLiftMs]
  );
  const bestMacCready = useMemo(
    () =>
      maccreadyMs > 0
        ? findBestGlidePoint({
            fPolarMsAtKmh: polar.f,
            speedRange: polar.range,
            windKmh: envWindKmh,
            liftMs: envLiftMs + maccreadyMs,
            step: 0.05,
          })
        : null,
    [polar, envWindKmh, envLiftMs, maccreadyMs]
  );

  // ===== Presets (advanced only) =====
  useEffect(() => {
    if (mode !== "advanced") return;
    if (preset === "none") return;
    if (preset === "calm") {
      setWindKmh(0);
      setLiftMs(0);
      setPilotSlider(50);
    } else if (preset === "ridge") {
      setWindKmh(15);
      setLiftMs(0.5);
      setPilotSlider(60);
    } else if (preset === "valley") {
      setWindKmh(20);
      setLiftMs(-1.5);
      setPilotSlider(75);
    } else if (preset === "thermal") {
      setWindKmh(5);
      setLiftMs(4);
      setPilotSlider(45);
    } else if (preset === "backwind") {
      // Backwind Flight: choose a headwind high enough to produce negative groundspeed near 1/3 brakes
      // Reasoning: With ~25 km/h headwind and +3 m/s lift, most gliders at ~1/3 brakes (just slower than trim)
      // will have airspeed ~28–32 km/h, yielding groundspeed <= ~5 km/h or negative for slower wings.
      // Set speedbar slider ~35–40 (approx 1/3 from brakes side).
      setWindKmh(25);
      setLiftMs(3);
      setPilotSlider(26);
    }
  }, [preset, mode]);

  // ===== Render =====
  return (
    <div className={`min-h-screen ${dark ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
  <CookieBanner t={t} />
        <header className="px-4 py-3 md:px-6 sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-semibold">
              <span className="text-sky-600 font-bold">para</span><span className="text-slate-800 dark:text-slate-100 font-bold">polar</span>
              <span className="ml-2 text-slate-500 text-sm hidden sm:inline">{t.app_title}</span>
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDark((d) => !d)}
                className="px-2 py-1 text-sm rounded-full border border-slate-300 dark:border-slate-700"
                title="Toggle dark mode"
              >
                {dark ? "☾" : "☀︎"}
              </button>
              <LangSwitcher lang={lang} setLang={setLang} />
              <ModeToggle mode={mode} setMode={setMode} t={t} />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Controls */}
          <section className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.controls_title}</h2>
              <ResetButton onReset={() => {
                if (mode === 'advanced') {
                  setUnit("kmh");
                  setPilotSlider(50);
                  setWindKmh(0);
                  setLiftMs(0);
                  setPreset("none");
                  setMaccreadyMs(0);
                  setWingLoad(1.0);
                  try { localStorage.removeItem('pp_adv_state_v1'); } catch {}
                } else {
                  setPilotSlider(50);
                  setSimpleWind(0);
                  try { localStorage.removeItem('pp_simple_state_v1'); } catch {}
                }
              }} />
            </div>

            {/* Glider selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t.glider_selection_label}
              </label>
              <GliderPicker
                gliders={GLIDERS}
                selectedId={selectedGliderId}
                onSelect={setSelectedGliderId}
              />
            </div>

            {/* Pilot control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t.pilot_control}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{t.brakes}</span>
                <input
                  type="range"
                  min={0}
                  max={120}
                  value={pilotSlider}
                  onChange={(e) => setPilotSlider(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600"
                />
                <span className="text-xs text-slate-500">{t.speedbar}</span>
              </div>
              <div className="text-xs text-center text-slate-500">
                {t.brakes} • <span className="font-medium">{t.trim}</span> •{" "}
                {t.speedbar}
              </div>
            </div>

            {/* Environment */}
            {mode === "simple" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {t.wind}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24">
                    {t.simple_wind_left}
                  </span>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.01}
                    value={simpleWind}
                    onChange={(e) => setSimpleWind(parseFloat(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="text-xs text-slate-500 w-24">
                    {t.simple_wind_right}
                  </span>
                </div>
                <div className="text-center text-xs text-slate-500">
                  {t.simple_wind_center}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t.headwind} / {t.tailwind} ({t.unit_kmh})
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-8 text-right">
                      -30
                    </span>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={windKmh}
                      onChange={(e) => { setWindKmh(parseInt(e.target.value, 10)); setPreset('none'); }}
                      className="w-full accent-sky-600"
                    />
                    <span className="text-xs text-slate-500 w-8">+30</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.headwind}: +, {t.tailwind}: − → {windKmh.toFixed(1)}{" "}
                    {t.unit_kmh}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t.lift_sink} ({t.unit_ms})
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-10 text-right">
                      -5
                    </span>
                    <input
                      type="range"
                      min={-5}
                      max={5}
                      step={0.1}
                      value={liftMs}
                      onChange={(e) => { setLiftMs(parseFloat(e.target.value)); setPreset('none'); }}
                      className="w-full accent-sky-600"
                    />
                    <span className="text-xs text-slate-500 w-10">+5</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.lift}: +, {t.sink}: − → {liftMs.toFixed(2)} {t.unit_ms}
                  </div>
                </div>

                {/* Units & Presets */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t.units}
                    </label>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {["kmh", "ms", "mph", "kt"].map((u) => (
                        <label
                          key={u}
                          className={`px-2 py-1 rounded-full border text-sm cursor-pointer ${
                            unit === u
                              ? "bg-sky-600 text-white border-sky-600"
                              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="unit"
                            className="hidden"
                            checked={unit === u}
            onChange={() => { setUnit(u); if (mode === 'advanced') setPreset('none'); }}
                          />
                          {t[`unit_${u}`]}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t.presets}
                    </label>
                    <select
                      value={preset}
                      onChange={(e) => setPreset(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm mt-1 bg-white dark:bg-slate-700"
                    >
                      <option value="none">{t.preset_none}</option>
                      <option value="calm">{t.preset_calm}</option>
                      <option value="ridge">{t.preset_ridge}</option>
                      <option value="valley">{t.preset_valley}</option>
                      <option value="thermal">{t.preset_thermal}</option>
                      <option value="backwind">{t.preset_backwind}</option>
                    </select>
                  </div>
                </div>

                {/* Advanced extras */}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    MacCready ({t[`unit_${unit === "kmh" ? "ms" : unit}`]})
                  </label>
          <input
                    type="range"
                    min={0}
                    max={unit === "ms" ? 6 : unit === "kmh" ? 6 : unit === "mph" ? 6 * 2.23694 : 6 * 1.94384}
                    step={0.1}
                    value={unit === "ms" ? maccreadyMs : unit === "kmh" ? maccreadyMs : unit === "mph" ? maccreadyMs * 2.23694 : maccreadyMs * 1.94384}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      // store internally in m/s
                      if (unit === "ms" || unit === "kmh") setMaccreadyMs(val);
                      else if (unit === "mph") setMaccreadyMs(val / 2.23694);
                      else if (unit === "kt") setMaccreadyMs(val / 1.94384);
            setPreset('none');
                    }}
                    className="w-full accent-amber-600"
                  />
                  <div className="text-xs text-slate-500">
                    {(() => {
                      const val = unit === "ms" ? maccreadyMs : unit === "kmh" ? maccreadyMs : unit === "mph" ? maccreadyMs * 2.23694 : maccreadyMs * 1.94384;
                      return `${val.toFixed(1)} ${t[`unit_${unit === "kmh" ? "ms" : unit}`]}`;
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t.wing_loading}
                  </label>
                  <input
                    type="range"
                    min={0.8}
                    max={1.2}
                    step={0.01}
                    value={wingLoad}
                    onChange={(e) => { setWingLoad(parseFloat(e.target.value)); setPreset('none'); }}
                    className="w-full accent-emerald-600"
                  />
                  <div className="text-xs text-slate-500">
                    {wingLoad.toFixed(2)}×
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold mb-2">{t.data_panel}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500">{t.airspeed}</span>
                    <span className="font-medium">
                      {convertSpeed(displaySpeedKmh, unit).toFixed(1)}{" "}
                      {t[`unit_${unit}`]}
                    </span>

                    <span className="text-slate-500">{t.sink_rate}</span>
                    <span className="font-medium">
                      {convertVerticalMs(vzAirEff, unit).toFixed(2)} {t[`unit_${unit === "kmh" ? "kmh" : unit}`]}
                    </span>

                    <span className="text-slate-500">{t.groundspeed}</span>
                    <span className="font-medium">
                      {convertSpeed(
                        airspeedForPhysicsKmh - envWindKmh,
                        unit
                      ).toFixed(1)} {t[`unit_${unit}`]}
                    </span>

                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="inline-block w-3 h-0.5 bg-slate-400"></span>
                      {t.glide_ratio_air}
                    </span>
                    <span className="font-medium">
                      {(GR_air || 0).toFixed(1) + ":1"}
                    </span>

                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="inline-block w-3 h-0.5 bg-emerald-500"></span>
                      {t.glide_ratio_ground}
                    </span>
                    <span className="font-medium">
                      {((-vzGroundMs) / (vxGroundMs || 1)).toFixed(1) + ":1"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Visualizations */}
          <section className="md:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 md:p-4">
              <PolarGraph
                t={t}
                unit={unit}
                lang={lang}
                mode={mode}
                polar={polar}
                flightMode={flightMode}
                displaySpeedKmh={displaySpeedKmh}
                envWindKmh={envWindKmh}
                envLiftMs={envLiftMs}
                maccreadyMs={maccreadyMs}
                bestAir={bestAir}
                bestGround={bestGround}
                bestMacCready={bestMacCready}
                STALL_DROP={STALL_DROP}
                COLLAPSE_DROP={COLLAPSE_DROP}
                onScrubSpeed={(v) => {
                  // map v in [stallX..vmaxX] back to slider 0..120
                  let ns;
                  if (v <= trimX)
                    ns = 25 + (25 * (v - stallX)) / (trimX - stallX);
                  else ns = 50 + (50 * (v - trimX)) / (vmaxX - trimX);
                  setPilotSlider(clamp(Math.round(ns), 0, 120));
                }}
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 md:p-4">
              <GroundViz
                t={t}
                unit={unit}
                vxGroundMs={vxGroundMs}
                vzGroundMs={vzGroundMs}
                airspeedKmh={airspeedForPhysicsKmh}
                envWindKmh={envWindKmh}
                envLiftMs={envLiftMs}
                showVario={mode === "advanced"}
              />
            </div>
          </section>
        </main>

        <footer className="max-w-6xl mx-auto px-4 md:px-6 pb-10 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center gap-1 text-center">
            <p>
              {t.footer_disclaimer} {t.footer_signs}
            </p>
            <p>
              {t.footer_made_by} <a href="https://www.linkedin.com/in/thomas-roos/" className="underline hover:text-slate-700">Thomas Roos</a> {t.footer_love_from}. <a className="underline hover:text-slate-700" href="http://github.com/Roosted7/ParaPolar">GitHub</a>
            </p>
            <p>
              {t.footer_thanks_to}: Barbara & Régis; Seb & Arnoud
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LangSwitcher({ lang, setLang }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
      {["en", "de", "fr"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-sm rounded-full ${
            lang === l
              ? "bg-sky-600 text-white"
              : "text-slate-700 dark:text-slate-100"
          }`}
          title={l.toUpperCase()}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ModeToggle({ mode, setMode, t }) {
  return (
    <div className="flex items-center gap-2">
      {/* Small screens: single toggle showing the other mode to switch to */}
      <button
        className="sm:hidden px-3 py-1.5 rounded-full text-sm border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
        onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
        title={mode === "simple" ? t.mode_advanced : t.mode_simple}
      >
        {mode === "simple" ? t.mode_advanced : t.mode_simple}
      </button>

      {/* Medium and up: segmented control with clear active/inactive styles */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={() => setMode("simple")}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            mode === "simple"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100"
          }`}
          title={`${t.mode_simple}`}
        >
          {t.mode_simple}
        </button>
        <button
          onClick={() => setMode("advanced")}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            mode === "advanced"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100"
          }`}
          title={`${t.mode_advanced}`}
        >
          {t.mode_advanced}
        </button>
      </div>
    </div>
  );
}

function GliderPicker({ gliders, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {gliders.map((g) => {
        const parts = g.display.split(" ");
        const primary = parts[0];
        const secondary = parts.slice(1).join(" ");
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`border rounded-xl px-3 py-2 text-left transition-all ${
              selectedId === g.id
                ? "border-sky-600 ring-2 ring-sky-100 bg-sky-50 dark:bg-sky-900/20"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <div className="font-medium text-sm truncate" title={g.display}>
              {primary}
              {secondary && (
                <span className="ml-1 text-[11px] text-slate-500 truncate inline-block max-w-[60%] align-baseline" title={secondary}>
                  {secondary.replace(/[()]/g, "")}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">L/D≈{g.polar_data.best_glide_ratio}</div>
          </button>
        );
      })}
    </div>
  );
}

function ResetButton({ onReset }) {
  return (
    <button
      onClick={onReset}
      className="px-2 py-1 text-sm rounded-full border border-slate-300 dark:border-slate-700"
      title="Reset to defaults"
    >
      ⟲
    </button>
  );
}

function CookieBanner({ t }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    try {
      const v = localStorage.getItem("pp_cookie_consent");
      setVisible(v !== "accepted" && v !== "declined");
      if (v === "accepted") enableGA();
    } catch {}
  }, []);
  function accept() {
    try { localStorage.setItem("pp_cookie_consent", "accepted"); } catch {}
    setVisible(false);
    enableGA();
  }
  function decline() {
    try { localStorage.setItem("pp_cookie_consent", "declined"); } catch {}
    setVisible(false);
  }
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-[28rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">🍪</div>
        <div className="text-sm">
          <div className="font-medium mb-1">{t.cookie_title}</div>
          <div className="text-slate-600 dark:text-slate-300">{t.cookie_body}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={accept} className="px-3 py-1.5 rounded-full text-sm bg-emerald-600 text-white">{t.cookie_accept}</button>
            <button onClick={decline} className="px-3 py-1.5 rounded-full text-sm border border-slate-300 dark:border-slate-600">{t.cookie_decline}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function enableGA() {
  // Draft GA integration: replace GA_MEASUREMENT_ID with your token
  const id = (window && window.__GA_ID__) || "GA_MEASUREMENT_ID";
  if (id === "GA_MEASUREMENT_ID") return; // no-op until token is set
  if (document.getElementById("ga-script")) return;
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s1.id = "ga-script";
  document.head.appendChild(s1);
  const s2 = document.createElement("script");
  s2.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${id}');`;
  document.head.appendChild(s2);
}
