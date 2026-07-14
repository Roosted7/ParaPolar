import { GLIDERS } from "../data/gliders";
import { PRESETS } from "../data/presets";
import { SPEED_UNITS, convertVertical, verticalUnitFor } from "../lib/units";
import GliderPicker from "./GliderPicker";
import DataPanel from "./DataPanel";
import ShareButton from "./ShareButton";

export default function ControlsPanel({
  t,
  mode,
  unit,
  setUnit,
  gliderId,
  setGliderId,
  pilotSlider,
  setPilotSlider,
  simpleWind,
  setSimpleWind,
  windKmh,
  setWindKmh,
  liftMs,
  setLiftMs,
  preset,
  applyPreset,
  maccreadyMs,
  setMaccreadyMs,
  wingLoad,
  setWingLoad,
  clearPreset,
  onReset,
  liveData,
}) {
  return (
    <section className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.controls_title}</h2>
        <div className="flex items-center gap-2">
          {mode === "advanced" && <ShareButton t={t} />}
          <button
            onClick={onReset}
            className="px-2 py-1 text-sm rounded-full border border-slate-300 dark:border-slate-700"
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
            aria-label={t.pilot_control}
          />
          <span className="text-xs text-slate-500">{t.speedbar}</span>
        </div>
        <div className="text-xs text-center text-slate-500">
          {t.brakes} • <span className="font-medium">{t.trim}</span> • {t.speedbar}
        </div>
      </div>

      {mode === "simple" ? (
        <SimpleEnvironment
          t={t}
          simpleWind={simpleWind}
          setSimpleWind={setSimpleWind}
        />
      ) : (
        <AdvancedEnvironment
          t={t}
          unit={unit}
          setUnit={setUnit}
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
          liveData={liveData}
        />
      )}
    </section>
  );
}

function SimpleEnvironment({ t, simpleWind, setSimpleWind }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {t.wind}
      </label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-24">{t.simple_wind_left}</span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={simpleWind}
          onChange={(e) => setSimpleWind(parseFloat(e.target.value))}
          className="w-full accent-sky-600"
          aria-label={t.wind}
        />
        <span className="text-xs text-slate-500 w-24">{t.simple_wind_right}</span>
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
  preset,
  applyPreset,
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
      <div>
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t.headwind} / {t.tailwind} ({t.unit_kmh})
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-8 text-right">-30</span>
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
            className="w-full accent-sky-600"
            aria-label={`${t.headwind} / ${t.tailwind}`}
          />
          <span className="text-xs text-slate-500 w-8">+30</span>
        </div>
        <div className="text-xs text-slate-500">
          {t.headwind}: +, {t.tailwind}: − → {windKmh.toFixed(1)} {t.unit_kmh}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t.lift_sink} ({t.unit_ms})
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-10 text-right">-5</span>
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
            className="w-full accent-sky-600"
            aria-label={t.lift_sink}
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
            {SPEED_UNITS.map((u) => (
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
                  onChange={() => setUnit(u)}
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
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm mt-1 bg-white dark:bg-slate-700"
            aria-label={t.presets}
          >
            <option value="none">{t.preset_none}</option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {t[`preset_${p.id}`]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MacCready */}
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
          className="w-full accent-amber-600"
          aria-label="MacCready"
        />
        <div className="text-xs text-slate-500">
          {convertVertical(maccreadyMs, unit).toFixed(1)} {vUnitLabel}
        </div>
      </div>

      {/* Wing loading */}
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
          className="w-full accent-emerald-600"
          aria-label={t.wing_loading}
        />
        <div className="text-xs text-slate-500">{wingLoad.toFixed(2)}×</div>
      </div>

      <DataPanel t={t} unit={unit} {...liveData} />
    </div>
  );
}
