import { SLIDER_MAX } from "../lib/pilotControl";

const SNAP_RANGE = 3;

/**
 * The primary pilot control: one rail from full brakes to full bar, with a
 * trim tick and a physical speed-to-fly (STF) notch the knob snaps onto.
 */
export default function SpeedControl({ t, value, onChange, stfSlider, danger }) {
  const handleChange = (e) => {
    let v = parseInt(e.target.value, 10);
    // Snap onto the speed-to-fly notch so the optimum is something you feel.
    if (stfSlider != null && Math.abs(v - stfSlider) <= SNAP_RANGE && v !== stfSlider) {
      v = Math.round(stfSlider);
    }
    onChange(v);
  };

  return (
    <div className="px-1">
      <div className="flex items-baseline justify-between font-data text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        <span>{t.brakes}</span>
        <span>{t.speedbar}</span>
      </div>
      <div className="relative mt-1.5">
        {/* trim tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-400/70 pointer-events-none"
          style={{ left: `${(50 / SLIDER_MAX) * 100}%` }}
          aria-hidden="true"
        />
        {/* speed-to-fly notch */}
        {stfSlider != null && (
          <div
            className="absolute -top-2.5 bottom-0 w-0.5 bg-thermal pointer-events-none"
            style={{ left: `${(stfSlider / SLIDER_MAX) * 100}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 font-data text-[8.5px] tracking-[0.14em] text-thermal">
              STF
            </span>
          </div>
        )}
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={value}
          onChange={handleChange}
          className="w-full accent-thermal relative"
          aria-label={t.pilot_control}
        />
      </div>
      <div
        className={`text-center font-data text-[10px] uppercase tracking-[0.14em] mt-0.5 ${
          danger === "stall" || danger === "collapse"
            ? "text-rose font-semibold"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {danger === "stall" ? t.stall_warning : danger === "collapse" ? t.collapse_warning : t.pilot_control}
      </div>
    </div>
  );
}
