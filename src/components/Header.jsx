import { LANGS } from "../lib/i18n";
import { discover } from "../lib/beacon";

export default function Header({
  t,
  lang,
  setLang,
  dark,
  setDark,
  mode,
  setMode,
  onLessons,
  onSetup,
  setupOpen,
  classroom,
  setClassroom,
}) {
  return (
    <header className="px-4 py-2.5 md:px-6 sticky top-0 z-20 bg-ink/90 backdrop-blur border-b border-white/10 text-glacier">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          <span className="text-thermal font-bold">para</span>
          <span className="text-glacier font-bold">polar</span>
          <span className="ml-3 text-slate-400 text-xs font-data uppercase tracking-[0.14em] hidden md:inline">
            {t.app_title}
          </span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onLessons}
            className="px-2.5 py-1 text-sm border border-thermal/60 text-thermal-bright hover:bg-thermal hover:text-ink"
          >
            🎓 {t.lessons}
          </button>
          <a
            href={`${lang === "en" ? "" : `/${lang}`}/learn/`}
            onClick={() => {
              discover("learn_pages");
              discover("learning_content");
            }}
            className="px-2.5 py-1 text-sm border border-white/20 text-glacier hover:border-thermal-bright no-underline"
          >
            {t.nav_learn}
          </a>
          <button
            onClick={onSetup}
            className={`hidden lg:inline-block px-2.5 py-1 text-sm border ${
              setupOpen
                ? "bg-thermal text-ink border-thermal font-semibold"
                : "border-white/20 text-glacier hover:border-thermal-bright"
            }`}
            title={t.setup}
            aria-pressed={setupOpen}
          >
            ⚙ {t.setup}
          </button>
          <button
            onClick={() => setClassroom((c) => !c)}
            className={`hidden md:inline-block px-2.5 py-1 text-sm border ${
              classroom
                ? "bg-thermal text-ink border-thermal font-semibold"
                : "border-white/20 text-glacier hover:border-thermal-bright"
            }`}
            title={t.classroom}
            aria-label={t.classroom}
            aria-pressed={classroom}
          >
            ⛶
          </button>
          <button
            onClick={() => setDark((d) => !d)}
            className="px-2.5 py-1 text-sm border border-white/20 text-glacier hover:border-thermal-bright"
            title={t.toggle_dark}
            aria-label={t.toggle_dark}
          >
            {dark ? "☾" : "☀︎"}
          </button>
          <LangSwitcher lang={lang} setLang={setLang} />
          <ModeToggle mode={mode} setMode={setMode} t={t} />
        </div>
      </div>
    </header>
  );
}

function LangSwitcher({ lang, setLang }) {
  return (
    <div className="flex items-center border border-white/20">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-xs font-data tracking-[0.08em] ${
            lang === l ? "bg-thermal text-ink font-semibold" : "text-slate-300 hover:text-glacier"
          }`}
          title={l.toUpperCase()}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ModeToggle({ mode, setMode, t }) {
  return (
    <div className="flex items-center gap-2">
      {/* Small screens: single toggle showing the other mode to switch to */}
      <button
        className="sm:hidden px-3 py-1 text-sm border border-white/20 text-glacier"
        onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
        title={mode === "simple" ? t.mode_advanced : t.mode_simple}
      >
        {mode === "simple" ? t.mode_advanced : t.mode_simple}
      </button>

      {/* Medium and up: segmented control */}
      <div className="hidden sm:flex items-center border border-white/20">
        {["simple", "advanced"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-sm ${
              mode === m
                ? "bg-thermal text-ink font-semibold"
                : "text-slate-300 hover:text-glacier"
            }`}
            title={t[`mode_${m}`]}
          >
            {t[`mode_${m}`]}
          </button>
        ))}
      </div>
    </div>
  );
}
