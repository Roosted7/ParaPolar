import { MS_TO_KMH, formatSpeed, formatVertical } from "../lib/units";

export default function DataPanel({
  t,
  unit,
  airspeedKmh,
  vzAirMs,
  vxGroundMs,
  glideRatioAir,
  glideRatioGround,
  speedToFlyKmh,
}) {
  return (
    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-2">{t.data_panel}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-slate-500">{t.airspeed}</span>
        <span className="font-medium">{formatSpeed(airspeedKmh, unit, t)}</span>

        <span className="text-slate-500">{t.sink_rate}</span>
        <span className="font-medium">{formatVertical(vzAirMs, unit, t)}</span>

        <span className="text-slate-500">{t.groundspeed}</span>
        <span className="font-medium">{formatSpeed(vxGroundMs * MS_TO_KMH, unit, t)}</span>

        <span className="text-slate-500 flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-slate-400"></span>
          {t.glide_ratio_air}
        </span>
        <span className="font-medium">{(glideRatioAir || 0).toFixed(1)}:1</span>

        <span className="text-slate-500 flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-emerald-500"></span>
          {t.glide_ratio_ground}
        </span>
        <span className="font-medium">
          {glideRatioGround != null ? `${glideRatioGround.toFixed(1)}:1` : "—"}
        </span>

        <span className="text-slate-500 flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-amber-500"></span>
          {t.speed_to_fly}
        </span>
        <span className="font-medium">
          {speedToFlyKmh != null ? formatSpeed(speedToFlyKmh, unit, t) : "—"}
        </span>
      </div>
    </div>
  );
}
