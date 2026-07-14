import { useState } from "react";
import { LESSONS } from "../content/lessonContent";

/**
 * Micro-lesson overlay: prompt first, explanation on demand. Selecting a
 * lesson applies its scenario to the live scene (handled by the parent).
 */
export default function LessonPanel({ t, lang, index, achieved, onNavigate, onClose, className }) {
  const lessons = LESSONS[lang] ?? LESSONS.en;
  const lesson = lessons[index];
  const [showWhy, setShowWhy] = useState(false);
  if (!lesson) return null;

  const go = (next) => {
    setShowWhy(false);
    onNavigate(next);
  };

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-data text-[10px] uppercase tracking-[0.18em] text-thermal-bright">
          {t.lessons} {index + 1} {t.lesson_of} {lessons.length}
        </div>
        <button
          onClick={onClose}
          className="font-data text-[10px] uppercase tracking-[0.1em] text-slate-400 hover:text-glacier"
          aria-label={t.lesson_close}
        >
          ✕ {t.lesson_close}
        </button>
      </div>
      <h3 className="font-semibold text-lg leading-snug mt-1">{lesson.title}</h3>
      <p className="text-sm text-slate-300 mt-1.5">{lesson.prompt}</p>
      {showWhy ? (
        <p className="text-sm text-thermal-bright/90 mt-2 border-l-2 border-thermal pl-2.5">
          {lesson.explanation}
        </p>
      ) : (
        <button
          onClick={() => setShowWhy(true)}
          className="mt-2 font-data text-[11px] uppercase tracking-[0.1em] text-thermal-bright border border-thermal/50 px-2 py-1 hover:bg-thermal hover:text-ink"
        >
          {t.lesson_why}
        </button>
      )}
      <div
        className={`mt-2.5 flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.1em] ${
          achieved ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        <span aria-hidden="true">{achieved ? "✓" : "○"}</span>
        {achieved ? t.lesson_done : t.lesson_goal}
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="font-data text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 border border-white/25 disabled:opacity-30"
        >
          ← {t.lesson_prev}
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {lessons.map((l, i) => (
            <span
              key={l.id}
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                i === index ? "bg-thermal" : i < index ? "bg-thermal/50" : "bg-white/25"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => (index === lessons.length - 1 ? onClose() : go(index + 1))}
          className={`font-data text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 bg-thermal text-ink font-semibold ${
            achieved ? "animate-pulse" : ""
          }`}
        >
          {index === lessons.length - 1 ? `✓ ${t.lesson_close}` : `${t.lesson_next} →`}
        </button>
      </div>
    </div>
  );
}
