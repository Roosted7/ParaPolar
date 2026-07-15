// Anonymous first-party event beacon (see /beacon in the worker).
// Sends ONLY an event name, up to two short labels and one number —
// no cookies, no identifiers. Fire-and-forget; never throws.

export function track(event, { d1 = "", d2 = "", d3 = "", v1 = 0 } = {}) {
  try {
    if (import.meta.env?.DEV) return; // keep dev sessions out of the stats
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
