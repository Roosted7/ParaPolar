import { useEffect, useRef, useState } from "react";
import { track } from "../lib/beacon";

/** Copies the current (permalink-bearing) URL to the clipboard. */
export default function ShareButton({ t }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("share_copied");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; nothing sensible to do */
    }
  };

  return (
    <button
      onClick={share}
      className={`px-2 py-1 text-sm rounded-full border transition-colors ${
        copied
          ? "bg-emerald-600 text-white border-emerald-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
      title={t.share}
    >
      {copied ? t.share_copied : `🔗 ${t.share}`}
    </button>
  );
}
