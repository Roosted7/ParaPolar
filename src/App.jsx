import { useEffect, useMemo, useState } from "react";
import { I18N } from "./lib/i18n";
import { GLIDERS } from "./data/gliders";
import { PRESETS } from "./data/presets";
import { buildPolar, findBestGlidePoint } from "./lib/physics";
import { KMH_TO_MS, clamp } from "./lib/units";
import { sliderToSpeed, speedToSlider, speedLandmarks } from "./lib/pilotControl";
import {
  DEFAULT_STATE,
  loadInitialState,
  saveState,
  clearSavedState,
  encodeShareParam,
} from "./lib/persistence";
import { useTheme } from "./hooks/useTheme";
import { useLanguage } from "./hooks/useLanguage";
import Header from "./components/Header";
import ControlsPanel from "./components/ControlsPanel";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import PolarGraph from "./components/PolarGraph";
import GroundViz from "./components/GroundViz";

// Vertical speeds used to dramatize invalid flight regimes (m/s).
const STALL_DROP = -6.0;
const COLLAPSE_DROP = -8.0;

export default function App() {
  const [lang, setLang] = useLanguage();
  const t = I18N[lang];
  const [dark, setDark] = useTheme();

  // ===== App state (hydrated once from permalink/localStorage) =====
  const [initial] = useState(loadInitialState);
  const [mode, setMode] = useState(initial.mode);
  const [unit, setUnit] = useState(initial.unit);
  const [gliderId, setGliderId] = useState(initial.gliderId);
  const [pilotSlider, setPilotSlider] = useState(initial.pilotSlider);
  const [simpleWind, setSimpleWind] = useState(initial.simpleWind);
  const [windKmh, setWindKmh] = useState(initial.windKmh);
  const [liftMs, setLiftMs] = useState(initial.liftMs);
  const [preset, setPreset] = useState(initial.preset);
  const [maccreadyMs, setMaccreadyMs] = useState(initial.maccreadyMs);
  const [wingLoad, setWingLoad] = useState(initial.wingLoad);

  const state = {
    mode,
    unit,
    gliderId,
    pilotSlider,
    simpleWind,
    windKmh,
    liftMs,
    preset,
    maccreadyMs,
    wingLoad,
  };

  // Persist every change; keep the shareable ?s= param in sync (advanced only).
  useEffect(() => {
    saveState(state);
    try {
      const url = new URL(window.location.href);
      if (mode === "advanced") {
        url.searchParams.set("s", encodeShareParam(state));
      } else if (url.searchParams.has("s")) {
        url.searchParams.delete("s");
      } else {
        return;
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, unit, gliderId, pilotSlider, simpleWind, windKmh, liftMs, preset, maccreadyMs, wingLoad]);

  const applyPreset = (id) => {
    setPreset(id);
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setWindKmh(p.windKmh);
    setLiftMs(p.liftMs);
    setPilotSlider(p.pilotSlider);
  };

  const clearPreset = () => setPreset("none");

  const onReset = () => {
    clearSavedState();
    if (mode === "advanced") {
      setUnit(DEFAULT_STATE.unit);
      setPilotSlider(DEFAULT_STATE.pilotSlider);
      setWindKmh(DEFAULT_STATE.windKmh);
      setLiftMs(DEFAULT_STATE.liftMs);
      setPreset(DEFAULT_STATE.preset);
      setMaccreadyMs(DEFAULT_STATE.maccreadyMs);
      setWingLoad(DEFAULT_STATE.wingLoad);
    } else {
      setPilotSlider(DEFAULT_STATE.pilotSlider);
      setSimpleWind(DEFAULT_STATE.simpleWind);
    }
  };

  // ===== Polar & pilot-control mapping =====
  const glider = GLIDERS.find((g) => g.id === gliderId) ?? GLIDERS[1];
  const polar = useMemo(() => buildPolar(glider.polar_data, wingLoad), [glider, wingLoad]);
  const landmarks = useMemo(
    () => speedLandmarks(polar, glider.polar_data.trim_speed_kmh, wingLoad),
    [polar, glider, wingLoad],
  );

  const desiredSpeedKmh = sliderToSpeed(pilotSlider, landmarks);
  const flightMode =
    desiredSpeedKmh < landmarks.stallX
      ? "stall"
      : desiredSpeedKmh > landmarks.vmaxX
        ? "collapse"
        : "normal";
  const displaySpeedKmh = clamp(desiredSpeedKmh, landmarks.stallX, landmarks.vmaxX);

  // ===== Environment =====
  const envWindKmh = mode === "simple" ? -simpleWind * 20 : windKmh; // left = headwind (+)
  const envLiftMs = mode === "simple" ? 0 : liftMs; // simple mode hides vertical motion

  // ===== Kinematics =====
  const vzAirMs = polar.f(displaySpeedKmh);
  const vzAirEff =
    flightMode === "stall" ? STALL_DROP : flightMode === "collapse" ? COLLAPSE_DROP : vzAirMs;
  const airspeedForPhysicsKmh =
    flightMode === "stall"
      ? Math.max(0, displaySpeedKmh * 0.3)
      : flightMode === "collapse"
        ? Math.max(0, displaySpeedKmh * 0.6)
        : displaySpeedKmh;

  const vxGroundMs = (airspeedForPhysicsKmh - envWindKmh) * KMH_TO_MS;
  const vzGroundMs = vzAirEff + envLiftMs; // lift (>0) reduces sink

  const hasForwardGlide = vxGroundMs > 0.1 && vzGroundMs < -0.05;
  const glideRatioGround = hasForwardGlide ? -vzGroundMs / vxGroundMs : null;
  const glideRatioAir =
    displaySpeedKmh > 0 ? -vzAirEff / (displaySpeedKmh * KMH_TO_MS) : 0;

  // ===== Best-glide tangents =====
  const bestAir = useMemo(
    () =>
      findBestGlidePoint({
        fPolarMsAtKmh: polar.f,
        speedRange: polar.range,
        windKmh: 0,
        liftMs: 0,
        step: 0.05,
      }),
    [polar],
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
    [polar, envWindKmh, envLiftMs],
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
    [polar, envWindKmh, envLiftMs, maccreadyMs],
  );

  // Recommended speed: MacCready target when set, otherwise best glide (ground).
  const speedToFlyKmh = (maccreadyMs > 0 ? bestMacCready : bestGround)?.vx ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <CookieBanner t={t} />
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        dark={dark}
        setDark={setDark}
        mode={mode}
        setMode={setMode}
      />

      <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <ControlsPanel
          t={t}
          mode={mode}
          unit={unit}
          setUnit={setUnit}
          gliderId={gliderId}
          setGliderId={setGliderId}
          pilotSlider={pilotSlider}
          setPilotSlider={setPilotSlider}
          simpleWind={simpleWind}
          setSimpleWind={setSimpleWind}
          windKmh={windKmh}
          setWindKmh={setWindKmh}
          liftMs={liftMs}
          setLiftMs={setLiftMs}
          preset={preset}
          applyPreset={applyPreset}
          maccreadyMs={maccreadyMs}
          setMaccreadyMs={setMaccreadyMs}
          wingLoad={wingLoad}
          setWingLoad={setWingLoad}
          clearPreset={clearPreset}
          onReset={onReset}
          liveData={{
            airspeedKmh: displaySpeedKmh,
            vzAirMs: vzAirEff,
            vxGroundMs,
            glideRatioAir,
            glideRatioGround,
            speedToFlyKmh,
          }}
        />

        <section className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 md:p-4">
            <PolarGraph
              t={t}
              mode={mode}
              polar={polar}
              displaySpeedKmh={displaySpeedKmh}
              envWindKmh={envWindKmh}
              bestAir={bestAir}
              bestGround={bestGround}
              bestMacCready={bestMacCready}
              STALL_DROP={STALL_DROP}
              COLLAPSE_DROP={COLLAPSE_DROP}
              onScrubSpeed={(v) => setPilotSlider(speedToSlider(v, landmarks))}
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
              groundGlideRatio={glideRatioGround}
            />
          </div>
        </section>
      </main>

      <Footer t={t} />
    </div>
  );
}
