// Consent-gated Google Analytics loader. The measurement ID is injected in
// index.html as window.__GA_ID__; nothing loads until the user accepts cookies.

export function enableAnalytics() {
  const id = typeof window !== "undefined" && window.__GA_ID__;
  if (!id) return;
  if (document.getElementById("ga-script")) return;
  const loader = document.createElement("script");
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  loader.id = "ga-script";
  document.head.appendChild(loader);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", id);
}
