import { useState } from "react";
import { CHALLENGE_DISTANCE_KM, heightLost, optimalCrossing, scoreCrossing } from "../lib/challenge";
import { track, discover } from "../lib/beacon";

/**
 * Valley-crossing challenge: pick a speed with the live controls, fly it,
 * get scored against the optimal speed-to-fly for the current airmass.
 */
export default function ChallengePanel({ t, polar, speedKmh, windKmh, liftMs, flightMode, onClose, className }) {
  const [result, setResult] = useState(null);

  const fly = () => {
    const args = {
      fPolarMsAtKmh: polar.f,
      speedRange: polar.range,
      windKmh,
      liftMs,
      distanceKm: CHALLENGE_DISTANCE_KM,
    };
    // Stalled or collapsed wings don't cross valleys.
    const yours =
      flightMode === "normal"
        ? heightLost({ ...args, speedKmh })
        : null;
    const optimal = optimalCrossing(args);
    const score = scoreCrossing(yours, optimal?.heightM ?? null);
    setResult({ yours, optimal, score });
    discover("completed_something");
    track("challenge_flown", { d1: "valley", v1: score });
  };

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-data text-[10px] uppercase tracking-[0.18em] text-thermal-bright">
          {t.challenge}
        </div>
        <button
          onClick={onClose}
          className="font-data text-[10px] uppercase tracking-[0.1em] text-slate-400 hover:text-glacier"
          aria-label={t.lesson_close}
        >
          ✕ {t.lesson_close}
        </button>
      </div>
      <h3 className="font-semibold text-lg leading-snug mt-1">{t.challenge_title}</h3>

      {result == null ? (
        <>
          <p className="text-sm text-slate-300 mt-1.5">
            {t.challenge_body.replace("{dist}", String(CHALLENGE_DISTANCE_KM))}
          </p>
          <button
            onClick={fly}
            className="mt-3 font-data text-[12px] uppercase tracking-[0.12em] px-3 py-1.5 bg-thermal text-ink font-semibold"
          >
            {t.challenge_fly}
          </button>
        </>
      ) : (
        <div className="mt-2">
          {result.yours == null ? (
            <p className="text-sm text-rose">{t.challenge_blown_back}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-data">
              <span className="text-slate-400">{t.challenge_lost}</span>
              <span>{Math.round(result.yours)} m</span>
              <span className="text-slate-400">{t.challenge_optimum}</span>
              <span>
                {result.optimal ? `${Math.round(result.optimal.heightM)} m @ ${result.optimal.speedKmh.toFixed(0)} km/h` : "—"}
              </span>
            </div>
          )}
          <div className="mt-2.5 flex items-center gap-3">
            <span
              className={`font-data text-2xl ${
                result.score >= 95 ? "text-thermal-bright" : result.score >= 70 ? "text-glacier" : "text-rose"
              }`}
            >
              {result.score}
              <span className="text-sm text-slate-400">/100</span>
            </span>
            {result.score >= 95 && (
              <span className="font-data text-[11px] uppercase tracking-[0.1em] text-thermal-bright">
                {t.challenge_perfect}
              </span>
            )}
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-3 font-data text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 border border-white/25 hover:border-thermal-bright"
          >
            {t.challenge_retry}
          </button>
        </div>
      )}
    </div>
  );
}
