import { GLIDERS } from "../data/gliders";
import { SPEED_UNITS, convertVertical, verticalUnitFor } from "../lib/units";
import GliderPicker from "./GliderPicker";
import DataPanel from "./DataPanel";
import ShareButton from "./ShareButton";

/**
 * The below-scene panel: glider choice, precision environment sliders, units,
 * MacCready, wing loading, and the live data readout. The scene itself owns
 * the primary controls (speed rail, draggable wing/windsock, scenario chips).
 */
export default function ControlsPanel({
  t,
  mode,
  unit,
  setUnit,
  gliderId,
  setGliderId,
  simpleWind,
  setSimpleWind,
  windKmh,
  setWindKmh,
  liftMs,
  setLiftMs,
  maccreadyMs,
  setMaccreadyMs,
  wingLoad,
  setWingLoad,
  clearPreset,
  onReset,
  liveData,
}) {
  return (
    <section className="bg-white dark:bg-ink-soft border border-slate-200 dark:border-white/10 p-4 md:p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-data text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {t.controls_title}
        </h2>
        <div className="flex items-center gap-2">
          {mode === "advanced" && <ShareButton t={t} />}
          <button
            onClick={onReset}
            className="px-2 py-1 text-sm border border-slate-300 dark:border-white/20 hover:border-thermal"
            title={t.reset}
            aria-label={t.reset}
          >
            ⟲
          </button>
        </div>
      </div>

      {/* Glider selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t.glider_selection_label}
        </label>
        <GliderPicker gliders={GLIDERS} selectedId={gliderId} onSelect={setGliderId} />
      </div>

      {mode === "simple" ? (
        <SimpleEnvironment t={t} simpleWind={simpleWind} setSimpleWind={setSimpleWind} />
      ) : (
        <AdvancedEnvironment
          t={t}
          unit={unit}
          setUnit={setUnit}
          windKmh={windKmh}
          setWindKmh={setWindKmh}
          liftMs={liftMs}
          setLiftMs={setLiftMs}
          maccreadyMs={maccreadyMs}
          setMaccreadyMs={setMaccreadyMs}
          wingLoad={wingLoad}
          setWingLoad={setWingLoad}
          clearPreset={clearPreset}
          liveData={liveData}
        />
      )}
    </section>
  );
}

function SimpleEnvironment({ t, simpleWind, setSimpleWind }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.wind}</label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-24">{t.simple_wind_left}</span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={simpleWind}
          onChange={(e) => setSimpleWind(parseFloat(e.target.value))}
          className="w-full accent-skywash"
          aria-label={t.wind}
        />
        <span className="text-xs text-slate-500 w-24 text-right">{t.simple_wind_right}</span>
      </div>
      <div className="text-center text-xs text-slate-500">{t.simple_wind_center}</div>
    </div>
  );
}

function AdvancedEnvironment({
  t,
  unit,
  setUnit,
  windKmh,
  setWindKmh,
  liftMs,
  setLiftMs,
  maccreadyMs,
  setMaccreadyMs,
  wingLoad,
  setWingLoad,
  clearPreset,
  liveData,
}) {
  const vUnitLabel = t[`unit_${verticalUnitFor(unit)}`];
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t.headwind} / {t.tailwind} ({t.unit_kmh})
          </label>
          <div className="flex items-center gap-3">
            <span className="font-data text-xs text-slate-500 w-8 text-right">-30</span>
            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={windKmh}
              onChange={(e) => {
                setWindKmh(parseInt(e.target.value, 10));
                clearPreset();
              }}
              className="w-full accent-skywash"
              aria-label={`${t.headwind} / ${t.tailwind}`}
            />
            <span className="font-data text-xs text-slate-500 w-8">+30</span>
          </div>
          <div className="font-data text-xs text-slate-500">
            {windKmh >= 0 ? t.headwind : t.tailwind}: {Math.abs(windKmh).toFixed(0)} {t.unit_kmh}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t.lift_sink} ({t.unit_ms})
          </label>
          <div className="flex items-center gap-3">
            <span className="font-data text-xs text-slate-500 w-8 text-right">-5</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={liftMs}
              onChange={(e) => {
                setLiftMs(parseFloat(e.target.value));
                clearPreset();
              }}
              className="w-full accent-skywash"
              aria-label={t.lift_sink}
            />
            <span className="font-data text-xs text-slate-500 w-8">+5</span>
          </div>
          <div className="font-data text-xs text-slate-500">
            {liftMs >= 0 ? t.lift : t.sink}: {Math.abs(liftMs).toFixed(1)} {t.unit_ms}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            MacCready ({vUnitLabel})
          </label>
          <input
            type="range"
            min={0}
            max={6}
            step={0.1}
            value={maccreadyMs}
            onChange={(e) => {
              setMaccreadyMs(parseFloat(e.target.value));
              clearPreset();
            }}
            className="w-full accent-thermal"
            aria-label="MacCready"
          />
          <div className="font-data text-xs text-slate-500">
            {convertVertical(maccreadyMs, unit).toFixed(1)} {vUnitLabel}
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
            onChange={(e) => {
              setWingLoad(parseFloat(e.target.value));
              clearPreset();
            }}
            className="w-full accent-emerald-500"
            aria-label={t.wing_loading}
          />
          <div className="font-data text-xs text-slate-500">{wingLoad.toFixed(2)}×</div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.units}</label>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {SPEED_UNITS.map((u) => (
            <label
              key={u}
              className={`px-2.5 py-1 border font-data text-xs cursor-pointer ${
                unit === u
                  ? "bg-thermal text-ink border-thermal font-semibold"
                  : "bg-white dark:bg-ink text-slate-600 dark:text-slate-300 border-slate-300 dark:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="unit"
                className="hidden"
                checked={unit === u}
                onChange={() => setUnit(u)}
              />
              {t[`unit_${u}`]}
            </label>
          ))}
        </div>
      </div>

      <DataPanel t={t} unit={unit} {...liveData} />
    </div>
  );
}
