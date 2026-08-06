/* Soft-nav pageviews for Vercel Web Analytics (script lives in each HTML head) */
(function () {
  if (window.__archiveAnalyticsReady) return;
  window.__archiveAnalyticsReady = true;

  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

  window.__archiveTrackPage = function trackPage() {
    try {
      window.va("pageview", { path: location.pathname + location.search });
    } catch {
      /* ignore */
    }
  };
})();
