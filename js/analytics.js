/* Vercel Web Analytics — static HTML */
(function () {
  if (window.__archiveAnalyticsReady) return;
  window.__archiveAnalyticsReady = true;

  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  document.head.appendChild(script);

  window.__archiveTrackPage = function trackPage() {
    try {
      window.va?.("pageview", { path: location.pathname + location.search });
    } catch {
      /* ignore */
    }
  };
})();
