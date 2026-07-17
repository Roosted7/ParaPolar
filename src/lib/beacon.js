// Anonymous first-party event beacon (see /beacon in the worker).
// Sends ONLY an event name, up to three short labels and one number —
// no cookies, no identifiers. Fire-and-forget; never throws.
//
// Bot hygiene (client side): automated browsers (navigator.webdriver — which
// includes our own headless screenshot tooling) and speculative prerenders
// send nothing. The worker additionally drops bot user-agents.

const sentDiscoveries = new Set(); // per page load, in memory only
let sessionStarted = false;
let humanConfirmed = false;

/** Called once the visit passed the interaction/visible-time gate. */
export function confirmHuman() {
  humanConfirmed = true;
}

function automated() {
  try {
    if (navigator.webdriver) return true;
    if (document.prerendering) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function docLang() {
  try {
    return document.documentElement.lang || "";
  } catch {
    return "";
  }
}

export function track(event, { d1 = "", d2 = "", d3 = "", v1 = 0 } = {}) {
  try {
    if (import.meta.env?.DEV) return; // keep dev sessions out of the stats
    if (automated()) return;
    const payload = JSON.stringify({ e: event, d1, d2, d3, v1 });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/beacon", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/beacon", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never let analytics break the app */
  }
}

/**
 * Report a feature as discovered — once per page load. Dividing these counts
 * by visits gives "what share of visits found this feature".
 */
export function discover(feature) {
  if (sentDiscoveries.has(feature)) return;
  sentDiscoveries.add(feature);
  track("discover", { d1: feature, d2: docLang() });
}

/**
 * Measure engaged (tab-visible) time and send ONE session_end on the first
 * disengage (tab hidden or page unload) — so the event count stays a clean
 * proxy for sessions and the duration means "time actively spent".
 */
export function initSessionBeacon() {
  if (sessionStarted) return;
  sessionStarted = true;
  try {
    let engagedMs = 0;
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let sent = false;

    const finalize = () => {
      if (sent) return;
      if (visibleSince != null) {
        engagedMs += performance.now() - visibleSince;
        visibleSince = null;
      }
      if (!humanConfirmed) return; // the visit gate never passed: likely a bot
      const secs = Math.min(3600, Math.round(engagedMs / 1000));
      if (secs < 2) return; // ignore bounce-noise and prerender-ish loads
      sent = true;
      const bucket = secs < 30 ? "under 30s" : secs < 120 ? "30s - 2m" : secs < 600 ? "2 - 10m" : "over 10m";
      track("session_end", { d1: bucket, d2: docLang(), v1: secs });
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalize();
      else if (!sent && visibleSince == null) visibleSince = performance.now();
    });
    window.addEventListener("pagehide", finalize);
  } catch {
    /* ignore */
  }
}
