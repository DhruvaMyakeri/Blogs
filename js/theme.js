(() => {
  const KEY = "archive-theme";

  function current() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      const dark = next === "dark";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", dark ? "Light mode" : "Dark mode");
      btn.classList.toggle("is-dark", dark);
    }
  }

  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") apply(saved);
  else apply("light");

  let btn = document.querySelector("[data-theme-toggle]");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("data-theme-toggle", "");
    btn.innerHTML = `
      <span class="theme-toggle-sun" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
      </span>
      <span class="theme-toggle-moon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"/>
        </svg>
      </span>
    `;
    btn.addEventListener("click", () => apply(current() === "dark" ? "light" : "dark"));
    document.body.appendChild(btn);
  }
  apply(current());
})();
