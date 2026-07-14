import { useEffect, useMemo, useRef, useState } from "react";
import { I18N } from "./lib/i18n";
import { GLIDERS } from "./data/gliders";
import { PRESETS } from "./data/presets";
import { buildPolar, findBestGlidePoint } from "./lib/physics";
import { KMH_TO_MS, MS_TO_KMH, clamp, convertSpeed, convertVertical, verticalUnitFor } from "./lib/units";
import {
  sliderToSpeed,
  speedToSlider,
  speedToSliderFull,
  speedLandmarks,
} from "./lib/pilotControl";
import {
  DEFAULT_STATE,
  loadInitialState,
  saveState,
  clearSavedState,
  encodeShareParam,
  hasSavedState,
} from "./lib/persistence";
import { useTheme } from "./hooks/useTheme";
import { useLanguage } from "./hooks/useLanguage";
import Header from "./components/Header";
import ControlsPanel from "./components/ControlsPanel";
import Footer from "./components/Footer";
import PolarGraph from "./components/PolarGraph";
import GroundViz from "./components/GroundViz";
import InstrumentPod from "./components/InstrumentPod";
import SpeedControl from "./components/SpeedControl";

// Vertical speeds used to dramatize invalid flight regimes (m/s).
const STALL_DROP = -6.0;
const COLLAPSE_DROP = -8.0;

/** Minimal-chrome mode for iframe embeds (?embed=1). */
function isEmbed() {
  try {
    return new URLSearchParams(window.location.search).get("embed") === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [lang, setLang] = useLanguage();
  const t = I18N[lang];
  const [dark, setDark] = useTheme();
  const [embed] = useState(isEmbed);

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

  // ===== First-visit scripted beat: wind rises, groundspeed melts =====
  const [introActive, setIntroActive] = useState(
    () => !embed && initial.mode === "simple" && !hasSavedState(),
  );
  const introCancelRef = useRef(null);
  useEffect(() => {
    if (!introActive) return;
    let raf;
    const t0 = performance.now() + 1400; // let the scene breathe first
    const RAMP = 2400;
    const HOLD = 2400;
    const BACK = 1700;
    const ease = (u) => u * u * (3 - 2 * u);
    const tick = (now) => {
      const dt = now - t0;
      if (dt >= RAMP + HOLD + BACK) {
        setSimpleWind(0);
        setIntroActive(false);
        return;
      }
      if (dt >= 0) {
        if (dt < RAMP) setSimpleWind(0.75 * ease(dt / RAMP));
        else if (dt < RAMP + HOLD) setSimpleWind(0.75);
        else setSimpleWind(0.75 * (1 - ease((dt - RAMP - HOLD) / BACK)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const cancel = () => {
      cancelAnimationFrame(raf);
      setSimpleWind(0);
      setIntroActive(false);
    };
    introCancelRef.current = cancel;
    window.addEventListener("pointerdown", cancel, { once: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", cancel, true);
    };
     
  }, [introActive]);

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

  // Glide ratio = forward distance per unit of height lost (e.g. 8:1).
  const hasForwardGlide = vxGroundMs > 0.1 && vzGroundMs < -0.05;
  const glideRatioGround = hasForwardGlide ? vxGroundMs / -vzGroundMs : null;
  const glideRatioAir = vzAirEff < 0 ? (displaySpeedKmh * KMH_TO_MS) / -vzAirEff : 0;

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
  const stfSlider = speedToFlyKmh != null ? speedToSlider(speedToFlyKmh, landmarks) : null;

  // ===== Direct manipulation =====
  const dragSpeedBy = (deltaKmh) => {
    const current = sliderToSpeed(pilotSlider, landmarks);
    setPilotSlider(speedToSliderFull(current + deltaKmh, landmarks));
  };
  const dragWindTo = (wind) => {
    if (mode === "simple") {
      setSimpleWind(clamp(-wind / 20, -1, 1));
    } else {
      setWindKmh(clamp(Math.round(wind), -30, 30));
      clearPreset();
    }
  };

  // ===== Scene sky: state, not wallpaper =====
  const skyClass = dark
    ? "sky-night"
    : preset === "thermal"
      ? "sky-thermal"
      : preset === "valley" || preset === "backwind"
        ? "sky-storm"
        : "sky-dusk";

  const vUnitLabel = t[`unit_${verticalUnitFor(unit)}`];
  const gsDisplay = convertSpeed(vxGroundMs * MS_TO_KMH, unit);
  const varioDisplay = convertVertical(vzGroundMs, unit);

  const polarProps = {
    t,
    mode,
    polar,
    displaySpeedKmh,
    envWindKmh,
    bestAir,
    bestGround,
    bestMacCready,
    STALL_DROP,
    COLLAPSE_DROP,
    onScrubSpeed: (v) => setPilotSlider(speedToSlider(v, landmarks)),
  };

  const sceneContent = (
    <>
      <GroundViz
            t={t}
            unit={unit}
            vxGroundMs={vxGroundMs}
            vzGroundMs={vzGroundMs}
            airspeedKmh={airspeedForPhysicsKmh}
            envWindKmh={envWindKmh}
            envLiftMs={envLiftMs}
            flightMode={flightMode}
            showVario={mode === "advanced"}
            onDragSpeed={dragSpeedBy}
            onDragWind={dragWindTo}
          />

          {/* Scenario chips (advanced) */}
          {mode === "advanced" && (
            <div className="absolute top-3 left-3 right-3 lg:right-[420px] flex gap-1.5 flex-wrap pointer-events-none">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`pointer-events-auto font-data text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 border backdrop-blur-[2px] transition-colors ${
                    preset === p.id
                      ? "bg-thermal text-ink border-thermal font-semibold"
                      : "bg-ink/50 text-glacier border-white/25 hover:border-thermal-bright"
                  }`}
                >
                  {t[`preset_${p.id}`]}
                </button>
              ))}
            </div>
          )}

          {/* Instrument pods */}
          {/* Instrument abbreviations are aviation-universal — no translation */}
          <div className="absolute bottom-3 left-3 flex gap-1.5 pointer-events-none">
            <InstrumentPod
              label="L/D GND"
              value={glideRatioGround != null ? glideRatioGround.toFixed(1) : "—"}
              unitLabel={glideRatioGround != null ? ":1" : ""}
            />
            <InstrumentPod
              label="GS"
              value={gsDisplay.toFixed(1)}
              unitLabel={t[`unit_${unit}`]}
              tone={vxGroundMs < 0 ? "sink" : "default"}
            />
            {mode === "advanced" && (
              <InstrumentPod
                label="VARIO"
                value={`${varioDisplay >= 0 ? "+" : ""}${varioDisplay.toFixed(
                  verticalUnitFor(unit) === "fpm" ? 0 : 2,
                )}`}
                unitLabel={vUnitLabel}
                tone={vzGroundMs > 0.05 ? "lift" : vzGroundMs < -1.5 ? "sink" : "default"}
              />
            )}
          </div>

      {/* First-visit caption */}
      {introActive && (
        <div className="absolute inset-x-0 top-[22%] flex justify-center pointer-events-none">
          <div className="bg-ink/70 border border-white/20 backdrop-blur-[2px] px-4 py-2 font-data text-[12px] tracking-[0.08em] uppercase text-thermal-bright max-w-[90%] text-center">
            {t.intro_caption}
          </div>
        </div>
      )}

      {/* Polar inspector (large screens: docked overlay) */}
      <div className="hidden lg:block absolute top-3 right-3 w-[390px] bg-ink/70 border border-white/15 backdrop-blur-[3px] p-1.5">
        <PolarGraph {...polarProps} />
      </div>
    </>
  );

  const sceneClass = `relative overflow-hidden ${skyClass}`;
  const speedRail = (
    <SpeedControl
      t={t}
      value={pilotSlider}
      onChange={setPilotSlider}
      stfSlider={mode === "advanced" ? stfSlider : null}
      danger={flightMode !== "normal" ? flightMode : null}
    />
  );

  // ===== Embed layout (?embed=1): scene + rail + watermark, nothing else =====
  if (embed) {
    return (
      <div className="h-screen flex flex-col bg-ink-deep text-slate-100">
        <div className={`${sceneClass} flex-1 min-h-0`}>
          {sceneContent}
          <a
            href={(() => {
              try {
                const url = new URL(window.location.href);
                url.searchParams.delete("embed");
                url.searchParams.delete("theme");
                return url.toString();
              } catch {
                return "https://parapolar.com/";
              }
            })()}
            target="_top"
            className="absolute top-2 right-2 font-data text-[10px] tracking-[0.14em] uppercase px-2 py-1 bg-ink/60 border border-white/25 text-thermal-bright hover:bg-thermal hover:text-ink lg:top-auto lg:bottom-2 lg:right-2"
          >
            parapolar.com ↗
          </a>
        </div>
        <div className="bg-ink-soft px-4 py-2 border-t border-white/10">{speedRail}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-glacier text-slate-800 dark:bg-ink-deep dark:text-slate-100">
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        dark={dark}
        setDark={setDark}
        mode={mode}
        setMode={setMode}
      />

      <main className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-3 md:space-y-4 flex-1">
        {/* ===== The scene ===== */}
        <section
          className={`${sceneClass} border border-slate-300/60 dark:border-white/10 h-[44vh] min-h-[330px] md:h-[52vh]`}
        >
          {sceneContent}
        </section>

        {/* ===== Primary control: the speed rail ===== */}
        <section className="bg-white dark:bg-ink-soft border border-slate-200 dark:border-white/10 px-4 py-3 md:px-6">
          {speedRail}
        </section>

        {/* Polar inspector (small screens: below the scene) */}
        <section className="lg:hidden bg-ink border border-white/10 p-1.5">
          <PolarGraph {...polarProps} />
        </section>

        <ControlsPanel
          t={t}
          mode={mode}
          unit={unit}
          setUnit={setUnit}
          gliderId={gliderId}
          setGliderId={setGliderId}
          simpleWind={simpleWind}
          setSimpleWind={setSimpleWind}
          windKmh={windKmh}
          setWindKmh={setWindKmh}
          liftMs={liftMs}
          setLiftMs={setLiftMs}
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
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}
