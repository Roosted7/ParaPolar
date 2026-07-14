export default function GliderPicker({ gliders, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {gliders.map((g) => {
        const [primary, ...rest] = g.display.split(" ");
        const secondary = rest.join(" ");
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            aria-pressed={selectedId === g.id}
            className={`border rounded-xl px-3 py-2 text-left transition-all ${
              selectedId === g.id
                ? "border-sky-600 ring-2 ring-sky-100 bg-sky-50 dark:bg-sky-900/20"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <div className="font-medium text-sm truncate" title={g.display}>
              {primary}
              {secondary && (
                <span
                  className="ml-1 text-[11px] text-slate-500 truncate inline-block max-w-[60%] align-baseline"
                  title={secondary}
                >
                  {secondary.replace(/[()]/g, "")}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">L/D≈{g.polar_data.best_glide_ratio}</div>
          </button>
        );
      })}
    </div>
  );
}
