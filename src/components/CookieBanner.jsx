import { useEffect, useState } from "react";
import { enableAnalytics } from "../lib/analytics";
import * as storage from "../lib/storage";

const CONSENT_KEY = "pp_cookie_consent";

export default function CookieBanner({ t }) {
  const [visible, setVisible] = useState(() => {
    const v = storage.getItem(CONSENT_KEY);
    return v !== "accepted" && v !== "declined";
  });

  useEffect(() => {
    if (storage.getItem(CONSENT_KEY) === "accepted") enableAnalytics();
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    storage.setItem(CONSENT_KEY, value);
    setVisible(false);
    if (value === "accepted") enableAnalytics();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-[28rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
          🍪
        </div>
        <div className="text-sm">
          <div className="font-medium mb-1">{t.cookie_title}</div>
          <div className="text-slate-600 dark:text-slate-300">{t.cookie_body}</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => choose("accepted")}
              className="px-3 py-1.5 rounded-full text-sm bg-emerald-600 text-white"
            >
              {t.cookie_accept}
            </button>
            <button
              onClick={() => choose("declined")}
              className="px-3 py-1.5 rounded-full text-sm border border-slate-300 dark:border-slate-600"
            >
              {t.cookie_decline}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
