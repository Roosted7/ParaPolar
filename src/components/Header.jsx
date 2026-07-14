import { LANGS } from "../lib/i18n";

export default function Header({ t, lang, setLang, dark, setDark, mode, setMode }) {
  return (
    <header className="px-4 py-3 md:px-6 sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-semibold">
          <span className="text-sky-600 font-bold">para</span>
          <span className="text-slate-800 dark:text-slate-100 font-bold">polar</span>
          <span className="ml-2 text-slate-500 text-sm hidden sm:inline">{t.app_title}</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDark((d) => !d)}
            className="px-2 py-1 text-sm rounded-full border border-slate-300 dark:border-slate-700"
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
    <div className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-sm rounded-full ${
            lang === l ? "bg-sky-600 text-white" : "text-slate-700 dark:text-slate-100"
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
        className="sm:hidden px-3 py-1.5 rounded-full text-sm border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
        onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
        title={mode === "simple" ? t.mode_advanced : t.mode_simple}
      >
        {mode === "simple" ? t.mode_advanced : t.mode_simple}
      </button>

      {/* Medium and up: segmented control */}
      <div className="hidden sm:flex items-center gap-2">
        {["simple", "advanced"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mode === m
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100"
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
