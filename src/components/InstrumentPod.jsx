/** Glass instrument readout overlaid on the scene. */
export default function InstrumentPod({ label, value, unitLabel, tone = "default" }) {
  const valueColor =
    tone === "lift" ? "text-thermal-bright" : tone === "sink" ? "text-skywash-bright" : "text-glacier";
  return (
    <div className="bg-ink/80 border border-white/15 backdrop-blur-[2px] px-3 py-1.5 min-w-[74px]">
      <div className="font-data text-[9px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={`font-data text-[17px] leading-tight ${valueColor}`}>
        {value}
        {unitLabel && <span className="text-[10px] text-slate-400 ml-1">{unitLabel}</span>}
      </div>
    </div>
  );
}
