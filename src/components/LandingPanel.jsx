/**
 * Spot-landing challenge: descend from altitude and touch down on the target.
 * Wind is randomized per attempt, gusts and the ground gradient act on the
 * wing, and higher difficulties add turbulence and hide the air particles —
 * leaving only the windsock to judge the wind, like on a real final approach.
 */
export default function LandingPanel({
  t,
  level,
  setLevel,
  running,
  result,
  onStart,
  onClose,
  className,
}) {
  const levels = [
    { v: 0, label: t.diff_easy },
    { v: 1, label: t.diff_normal },
    { v: 2, label: t.diff_pro },
  ];

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-data text-[10px] uppercase tracking-[0.18em] text-thermal-bright">
          ⌖ {t.challenge}
        </div>
        <button
          onClick={onClose}
          className="font-data text-[10px] uppercase tracking-[0.1em] text-slate-400 hover:text-glacier"
          aria-label={t.lesson_close}
        >
          ✕ {t.lesson_close}
        </button>
      </div>
      <h3 className="font-semibold text-lg leading-snug mt-1">{t.landing}</h3>

      {result == null ? (
        <>
          <p className="text-sm text-slate-300 mt-1.5">{t.landing_body}</p>
          <div className="flex gap-1.5 mt-2.5">
            {levels.map((l) => (
              <button
                key={l.v}
                onClick={() => setLevel(l.v)}
                className={`font-data text-[10px] uppercase tracking-[0.08em] px-2 py-1 border ${
                  level === l.v
                    ? "bg-skywash text-ink border-skywash font-semibold"
                    : "border-white/25 text-slate-300"
                }`}
                aria-pressed={level === l.v}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={onStart}
            disabled={running}
            className="mt-3 font-data text-[12px] uppercase tracking-[0.12em] px-3 py-1.5 bg-thermal text-ink font-semibold disabled:opacity-40"
          >
            {running ? "…" : t.landing_start}
          </button>
        </>
      ) : (
        <div className="mt-2">
          <div
            className={`font-data text-[13px] uppercase tracking-[0.1em] ${
              result.verdictKey === "landing_bullseye"
                ? "text-thermal-bright"
                : result.verdictKey === "landing_soft"
                  ? "text-emerald-400"
                  : "text-rose"
            }`}
          >
            {t[result.verdictKey]}
          </div>
          {!result.missed && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-data mt-2">
              <span className="text-slate-400">{t.landing_distance}</span>
              <span>{Math.abs(result.distanceM).toFixed(1)} m</span>
              <span className="text-slate-400">{t.landing_touchdown}</span>
              <span>
                {result.vzMs.toFixed(1)} m/s ↓ · {Math.max(0, result.gsMs).toFixed(1)} m/s →
              </span>
            </div>
          )}
          <div className="mt-2.5 font-data text-2xl">
            <span
              className={
                result.score >= 90
                  ? "text-thermal-bright"
                  : result.score >= 60
                    ? "text-glacier"
                    : "text-rose"
              }
            >
              {result.score}
            </span>
            <span className="text-sm text-slate-400">/100</span>
          </div>
          <button
            onClick={onStart}
            className="mt-3 font-data text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 bg-thermal text-ink font-semibold"
          >
            {t.challenge_retry}
          </button>
        </div>
      )}
    </div>
  );
}
