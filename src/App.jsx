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
import LessonPanel from "./components/LessonPanel";
import ChallengePanel from "./components/ChallengePanel";
import { LESSONS } from "./content/lessonContent";
import { lessonAchieved, minSinkSpeedKmh } from "./lib/lessons";

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

  // ===== Phase-3 features: lessons, challenge, comparison, classroom =====
  const introCancelRef = useRef(null);
  const [lessonIdx, setLessonIdx] = useState(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [compareGliderId, setCompareGliderId] = useState(null);
  const [classroom, setClassroom] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("setup") === "1";
    } catch {
      return false;
    }
  });

  const openLesson = (idx) => {
    const lesson = (LESSONS[lang] ?? LESSONS.en)[idx];
    if (!lesson) return;
    introCancelRef.current?.();
    setChallengeOpen(false);
    setMode("advanced");
    setPreset("none");
    const su = lesson.setup;
    if (su.gliderId) setGliderId(su.gliderId);
    if (Number.isFinite(su.pilotSlider)) setPilotSlider(su.pilotSlider);
    if (Number.isFinite(su.windKmh)) setWindKmh(su.windKmh);
    if (Number.isFinite(su.liftMs)) setLiftMs(su.liftMs);
    setMaccreadyMs(su.maccreadyMs ?? 0);
    setLessonIdx(idx);
  };

  const openChallenge = () => {
    introCancelRef.current?.();
    setLessonIdx(null);
    setMode("advanced");
    setChallengeOpen(true);
  };

  // Deep link: ?lesson=1..6 opens a lesson directly (used by learn pages).
  useEffect(() => {
    let timer;
    try {
      const p = new URLSearchParams(window.location.search).get("lesson");
      const idx = parseInt(p ?? "", 10) - 1;
      if (idx >= 0) timer = setTimeout(() => openLesson(idx), 0);
    } catch {
      /* ignore */
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Classroom mode: projector-friendly scaling.
  useEffect(() => {
    try {
      document.body.style.zoom = classroom ? "1.25" : "";
    } catch {
      /* ignore */
    }
  }, [classroom]);

  // ===== First-visit scripted beat: wind rises, groundspeed melts =====
  const [introActive, setIntroActive] = useState(
    () => !embed && initial.mode === "simple" && !hasSavedState(),
  );
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
  const compareGlider = GLIDERS.find((g) => g.id === compareGliderId) ?? null;
  const ghostPolar = useMemo(
    () => (compareGlider ? buildPolar(compareGlider.polar_data, wingLoad) : null),
    [compareGlider, wingLoad],
  );
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
    ghostPolar,
    displaySpeedKmh,
    envWindKmh,
    envLiftMs,
    maccreadyMs: mode === "advanced" ? maccreadyMs : 0,
    bestAir,
    bestGround,
    bestMacCready: mode === "advanced" ? bestMacCready : null,
    STALL_DROP,
    COLLAPSE_DROP,
    onScrubSpeed: (v) => setPilotSlider(speedToSlider(v, landmarks)),
  };

  // ===== Lesson goal: the scene confirms what the pilot just did =====
  const minSinkKmh = useMemo(() => minSinkSpeedKmh(polar), [polar]);
  const currentLesson = lessonIdx != null ? (LESSONS[lang] ?? LESSONS.en)[lessonIdx] : null;
  const achieved = currentLesson
    ? lessonAchieved(currentLesson.id, {
        pilotSlider,
        displaySpeedKmh,
        speedToFlyKmh,
        vxGroundMs,
        minSinkKmh,
      })
    : false;

  const PANEL_OVERLAY =
    "hidden md:block absolute top-3 left-3 md:w-[400px] max-h-[calc(100%-24px)] overflow-y-auto bg-ink border border-white/25 shadow-xl p-3.5 text-glacier";
  const PANEL_INLINE = "md:hidden bg-ink border border-white/25 p-3.5 text-glacier";

  const lessonPanel = (className) =>
    lessonIdx != null && (
      <LessonPanel
        t={t}
        lang={lang}
        index={lessonIdx}
        achieved={achieved}
        onNavigate={openLesson}
        onClose={() => setLessonIdx(null)}
        className={className}
      />
    );
  const challengePanel = (className) =>
    challengeOpen &&
    lessonIdx == null && (
      <ChallengePanel
        t={t}
        polar={polar}
        speedKmh={displaySpeedKmh}
        windKmh={envWindKmh}
        liftMs={envLiftMs}
        flightMode={flightMode}
        onClose={() => setChallengeOpen(false)}
        className={className}
      />
    );

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

      {/* Scenario chips (advanced, hidden while a lesson/challenge panel is open) */}
      {mode === "advanced" && lessonIdx == null && !challengeOpen && (
        <div
          className={`absolute top-3 left-3 flex gap-1.5 flex-wrap pointer-events-none ${
            embed ? "right-28" : "right-3 lg:right-[420px] xl:right-[470px] 2xl:right-[570px]"
          }`}
        >
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
          {!embed && (
            <button
              onClick={openChallenge}
              className="pointer-events-auto font-data text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 border backdrop-blur-[2px] bg-ink/50 text-thermal-bright border-thermal/60 hover:border-thermal"
            >
              ⚑ {t.challenge}
            </button>
          )}
        </div>
      )}

      {/* Lesson & challenge overlays (md+; on mobile they render below the scene) */}
      {lessonPanel(PANEL_OVERLAY)}
      {challengePanel(PANEL_OVERLAY)}

      {/* Instrument pods — aviation-universal abbreviations, no translation */}
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
      <div className="hidden lg:block absolute top-3 right-3 w-[390px] xl:w-[440px] 2xl:w-[540px] bg-ink/70 border border-white/15 backdrop-blur-[3px] p-1.5">
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

  const controlsPanelEl = (
    <ControlsPanel
      t={t}
      mode={mode}
      unit={unit}
      setUnit={setUnit}
      gliderId={gliderId}
      setGliderId={setGliderId}
      compareGliderId={compareGliderId}
      setCompareGliderId={setCompareGliderId}
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
            className="absolute top-2 right-2 font-data text-[10px] tracking-[0.14em] uppercase px-2 py-1 bg-ink/60 border border-white/25 text-thermal-bright hover:bg-thermal hover:text-ink"
          >
            parapolar.com ↗
          </a>
        </div>
        <div className="bg-ink-soft px-4 py-2 border-t border-white/10">{speedRail}</div>
      </div>
    );
  }

  // ===== Full layout =====
  // Desktop (lg+): a single viewport — scene fills, controls live in a drawer.
  // Mobile: natural scroll flow; panels render below the scene, never over it.
  return (
    <div className="min-h-screen lg:h-dvh lg:overflow-hidden flex flex-col bg-glacier text-slate-800 dark:bg-ink-deep dark:text-slate-100">
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        dark={dark}
        setDark={setDark}
        mode={mode}
        setMode={setMode}
        onLessons={() => (lessonIdx == null ? openLesson(0) : setLessonIdx(null))}
        onSetup={() => setDrawerOpen((v) => !v)}
        classroom={classroom}
        setClassroom={setClassroom}
      />

      <main className="w-full max-w-7xl 2xl:max-w-[1760px] mx-auto p-3 md:px-6 md:py-4 flex-1 min-h-0 flex flex-col gap-3">
        {/* ===== The scene ===== */}
        <section
          className={`${sceneClass} border border-slate-300/60 dark:border-white/10 h-[46vh] min-h-[300px] lg:h-auto lg:flex-1 lg:min-h-0`}
        >
          {sceneContent}
        </section>

        {/* Lesson & challenge panels: below the scene on mobile */}
        {lessonPanel(PANEL_INLINE)}
        {challengePanel(PANEL_INLINE)}

        {/* ===== Primary control: the speed rail ===== */}
        <section className="shrink-0 bg-white dark:bg-ink-soft border border-slate-200 dark:border-white/10 px-4 py-3 md:px-6">
          {speedRail}
        </section>

        {/* Mobile flow: polar + controls (desktop keeps them in overlay/drawer) */}
        <section className="lg:hidden bg-ink border border-white/10 p-1.5">
          <PolarGraph {...polarProps} />
        </section>
        <div className="lg:hidden">{controlsPanelEl}</div>
      </main>

      {/* Desktop setup drawer */}
      <div className="hidden lg:block">
        {drawerOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-[460px] max-w-full overflow-y-auto bg-glacier dark:bg-ink-deep border-l border-slate-300 dark:border-white/15 shadow-2xl transition-transform duration-200 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-3 space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => setDrawerOpen(false)}
                className="font-data text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 border border-slate-300 dark:border-white/20"
                aria-label={t.lesson_close}
              >
                ✕ {t.lesson_close}
              </button>
            </div>
            {controlsPanelEl}
          </div>
        </div>
      </div>

      <Footer t={t} lang={lang} />
    </div>
  );
}
