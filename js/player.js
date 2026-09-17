(() => {
  const TRACKS = [
    {
      file: "'Tumse Hi Tumse' (Full Song) _ Anjaana Anjaani _ Feat. Ranbir Kapoor, Priyanka Chopra [KWCLOpaZeLc].mp3",
      title: "Tumse Hi Tumse",
      artist: "Anjaana Anjaani",
    },
    {
      file: "Arijit Singh, Shreya Ghoshal - Samjhawan - Lyric video _ Alia B, Varun D _ Humpty Sharma Ki Dulhania [H2f7MZaw3Yo].mp3",
      title: "Samjhawan",
      artist: "Arijit Singh, Shreya Ghoshal",
    },
    {
      file: "Dil Chahta Hai Full Song Dil Chahta Hai.mp3",
      title: "Dil Chahta Hai",
      artist: "Dil Chahta Hai",
    },
    {
      file: "Dil Dhadakne Do Full Video Song _ Zindagi Na Milegi Dobara _ Hrithik Roshan, Farhan Akhtar [WuMWwPHTSoY].mp3",
      title: "Dil Dhadakne Do",
      artist: "Zindagi Na Milegi Dobara",
    },
    {
      file: "Ed Sheeran - Perfect.mp3",
      title: "Perfect",
      artist: "Ed Sheeran",
    },
    {
      file: "Ishq Sufiyana (Lyrics) Sunidhi Chauhan Version _ _The Dirty Picture_ _ Female Version.mp3",
      title: "Ishq Sufiyana",
      artist: "Sunidhi Chauhan",
    },
    {
      file: "Ishq Sufiyana (Male) Video Song _ The Dirty Picture _ Emraan Hashmi, Vidya Balan _ Vishal - Shekhar.mp3",
      title: "Ishq Sufiyana",
      artist: "Male version",
    },
    {
      file: "Kun Faya Kun lyrics_ Rockstar_Ranbir Kapoor _ A.R. Rahman, Javed Ali, MohitChauhan.mp3",
      title: "Kun Faya Kun",
      artist: "Rockstar",
    },
    {
      file: "Lauv - I Like Me Better Official Audio.mp3",
      title: "I Like Me Better",
      artist: "Lauv",
    },
    {
      file: "Lyrical Video Dildara Song Ra.One ShahRukh Khan, Kareena Kapoor.mp3",
      title: "Dildara",
      artist: "Ra.One",
    },
    {
      file: "LYRICAL_ 'Manwa Laage' FULL SONG with Lyrics _ Happy New Year _ Shah Rukh Khan _ Arijit Singh [DG8e5ptrBqQ].mp3",
      title: "Manwa Laage",
      artist: "Happy New Year",
    },
    {
      file: "ROCKSTAR Nadaan Parinde (Lyrical Video) Ranbir Kapoor A.R Rahman Mohit Chauhan, Irshad Kamil.mp3",
      title: "Nadaan Parinde",
      artist: "Rockstar",
    },
    {
      file: "TANMAYALAADENU - 4K Lyrical Video Song _ Paramathma Kannada Movie _ Shreya Ghoshal, PuneethRajkumar.mp3",
      title: "Tanmayalaadenu",
      artist: "Paramathma",
    },
    {
      file: "Ye Tune Kya Kiya Song Once Upon A Time In Mumbaai Dobara _ Pritam _ Akshay Kumar, Sonakshi Sinha [w9Qo6p4XsXE].mp3",
      title: "Ye Tune Kya Kiya",
      artist: "Once Upon A Time In Mumbaai Dobara",
    },
  ];

  if (window.__archivePlayerReady) {
    window.__archiveBindLinks?.();
    return;
  }
  window.__archivePlayerReady = true;

  const root = document.createElement("aside");
  root.className = "listening";
  root.setAttribute("aria-label", "Listening");
  root.setAttribute("data-persistent", "");
  root.innerHTML = `
    <div class="listening-inner">
      <button type="button" class="listening-btn listening-play" aria-label="Play">
        <svg class="icon-play" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        <svg class="icon-pause" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" hidden><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
      </button>
      <div class="listening-meta">
        <span class="listening-kicker">Listening</span>
        <span class="listening-title">·</span>
      </div>
      <div class="listening-controls">
        <button type="button" class="listening-btn listening-prev" aria-label="Previous">‹</button>
        <button type="button" class="listening-btn listening-next" aria-label="Next">›</button>
      </div>
      <div class="listening-progress" role="slider" aria-label="Seek" tabindex="0">
        <div class="listening-bar"></div>
      </div>
    </div>
    <audio preload="metadata"></audio>
  `;
  document.body.appendChild(root);

  const audio = root.querySelector("audio");
  const playBtn = root.querySelector(".listening-play");
  const prevBtn = root.querySelector(".listening-prev");
  const nextBtn = root.querySelector(".listening-next");
  const titleEl = root.querySelector(".listening-title");
  const bar = root.querySelector(".listening-bar");
  const progress = root.querySelector(".listening-progress");
  const iconPlay = root.querySelector(".icon-play");
  const iconPause = root.querySelector(".icon-pause");

  let index = Math.floor(Math.random() * TRACKS.length);

  function srcFor(track) {
    return "SONGS/" + encodeURIComponent(track.file).replace(/%2F/g, "/");
  }

  function setPlaying(on) {
    root.classList.toggle("is-playing", on);
    iconPlay.hidden = on;
    iconPause.hidden = !on;
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
  }

  function load(i, autoplay) {
    index = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    const track = TRACKS[index];
    audio.src = srcFor(track);
    titleEl.textContent = `${track.title} · ${track.artist}`;
    titleEl.title = titleEl.textContent;
    bar.style.width = "0%";
    if (autoplay) audio.play().catch(() => setPlaying(false));
    else setPlaying(false);
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  });
  prevBtn.addEventListener("click", () => load(index - 1, true));
  nextBtn.addEventListener("click", () => load(index + 1, true));
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => load(index + 1, true));
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });
  progress.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  });

  load(index, false);

  /* Soft navigation: keep this audio element alive across pages */
  function tagHeadAssets() {
    document.querySelectorAll("head link[rel='stylesheet'], head style, head link[rel='preconnect']").forEach((el) => {
      const href = el.getAttribute("href") || "";
      if (href.includes("theme.css")) {
        el.setAttribute("data-keep", "");
        el.removeAttribute("data-nav-asset");
        el.removeAttribute("data-nav-next");
        return;
      }
      if (!el.hasAttribute("data-nav-next")) {
        el.setAttribute("data-nav-asset", "");
      }
    });
  }

  tagHeadAssets();

  function placePlayer() {
    const el = document.querySelector(".listening[data-persistent]");
    if (!el) return;
    el.classList.remove("listening--blog");
    if (el.parentElement !== document.body) document.body.appendChild(el);
  }

  function hoistChrome() {
    const listening = document.querySelector(".listening[data-persistent]");
    const themeBtn = document.querySelector("[data-theme-toggle]");
    if (listening) document.body.appendChild(listening);
    if (themeBtn) document.body.appendChild(themeBtn);
    return { listening, themeBtn };
  }

  function isInternal(href) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    if (href.startsWith("javascript:")) return false;
    try {
      const url = new URL(href, location.href);
      return url.origin === location.origin;
    } catch {
      return false;
    }
  }

  function isHeavyNotesPage(href) {
    try {
      const path = new URL(href, location.href).pathname
        .replace(/\\/g, "/")
        .replace(/\/index\.html$/i, "/")
        .replace(/\.html$/i, "");
      return (
        /\/image-processing\/unit\d+/i.test(path) ||
        /\/IOT\/unit-\d+/i.test(path)
      );
    } catch {
      return false;
    }
  }

  function waitForStyle(link) {
    return new Promise((resolve) => {
      if (!link || link.tagName !== "LINK") {
        resolve();
        return;
      }
      // Already available (cache / prior visit)
      try {
        if (link.sheet) {
          resolve();
          return;
        }
      } catch {
        /* cross-origin access can throw; still wait on load */
      }
      const done = () => resolve();
      link.addEventListener("load", done, { once: true });
      link.addEventListener("error", done, { once: true });
      setTimeout(done, 1200);
    });
  }

  function pinThemeCss() {
    const themeLink =
      document.querySelector('link[href*="theme.css"][data-keep]') ||
      document.querySelector('link[href*="theme.css"]');
    if (themeLink) {
      const href = themeLink.getAttribute("href");
      if (href && !href.startsWith("http") && !href.startsWith("/")) {
        themeLink.setAttribute("href", new URL(href, location.origin + "/").href);
      }
      document.head.appendChild(themeLink);
    }
  }

  function pageBase(doc, pageUrl) {
    const b = doc.querySelector("base[href]");
    try {
      return b ? new URL(b.getAttribute("href"), pageUrl).href : pageUrl;
    } catch {
      return pageUrl;
    }
  }

  function absolutize(href, base) {
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) return href;
    try {
      return new URL(href, base).href;
    } catch {
      return href;
    }
  }

  function absolutizeTree(root, base) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll("[src]").forEach((el) => {
      const raw = el.getAttribute("src");
      if (!raw || raw.startsWith("data:")) return;
      el.setAttribute("src", absolutize(raw, base));
    });
    root.querySelectorAll("a[href]").forEach((el) => {
      const raw = el.getAttribute("href");
      if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
      el.setAttribute("href", absolutize(raw, base));
    });
  }

  async function softNavigate(href, push = true) {
    const url = new URL(href, location.href);
    if (isHeavyNotesPage(url.href) || isHeavyNotesPage(location.href)) {
      location.href = url.href;
      return;
    }
    if (push && url.href === location.href) return;

    const { listening, themeBtn } = hoistChrome();
    const pinned = new Set([listening, themeBtn].filter(Boolean));

    document.documentElement.classList.add("has-soft-nav");

    try {
      const res = await fetch(url.href, { headers: { Accept: "text/html" } });
      if (!res.ok) throw new Error("fetch failed");
      const pageUrl = res.url || url.href;
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const nextBase = pageBase(doc, pageUrl);

      document.querySelectorAll("head base").forEach((el) => el.remove());

      // Mark current page styles for removal (keeps theme.css).
      tagHeadAssets();

      // 1) Install next page CSS alongside the current CSS (no gap / no white flash).
      const pending = [];
      doc.head.querySelectorAll("link[rel='stylesheet'], style, link[rel='preconnect']").forEach((el) => {
        const hrefAttr = el.getAttribute("href") || "";
        if (hrefAttr.includes("theme.css")) return;
        const clone = document.importNode(el, true);
        if (hrefAttr) clone.setAttribute("href", absolutize(hrefAttr, nextBase));
        clone.setAttribute("data-nav-next", "");
        clone.removeAttribute("data-nav-asset");
        document.head.appendChild(clone);
        if (clone.tagName === "LINK" && clone.rel === "stylesheet") {
          pending.push(waitForStyle(clone));
        }
      });
      pinThemeCss();
      await Promise.all(pending);

      // 2) Swap content only after styles are ready.
      document.title = doc.title;
      [...document.body.children].forEach((child) => {
        if (pinned.has(child)) return;
        child.remove();
      });

      const anchor = [...pinned][0] || null;
      [...doc.body.children].forEach((child) => {
        if (child.classList?.contains("listening")) return;
        if (child.matches?.("[data-theme-toggle]")) return;
        if (child.tagName === "SCRIPT") return;
        const node = document.importNode(child, true);
        absolutizeTree(node, nextBase);
        if (anchor) document.body.insertBefore(node, anchor);
        else document.body.appendChild(node);
      });

      // 3) Drop previous page CSS, promote the new set.
      document.querySelectorAll("[data-nav-asset]").forEach((el) => el.remove());
      document.querySelectorAll("[data-nav-next]").forEach((el) => {
        el.setAttribute("data-nav-asset", "");
        el.removeAttribute("data-nav-next");
      });
      pinThemeCss();
      placePlayer();

      if (push) history.pushState({ soft: true }, "", url.href);
      window.__archiveTrackPage?.();
      bindLinks();
      window.__archiveCarouselInit?.();
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prev;
    } catch {
      location.href = url.href;
    }
  }

  function bindLinks() {
    document.querySelectorAll("a[href]").forEach((a) => {
      if (a.dataset.softBound === "1") return;
      if (a.hasAttribute("data-full-page")) return;
      const href = a.getAttribute("href");
      if (!isInternal(href) || isHeavyNotesPage(a.href)) return;
      a.dataset.softBound = "1";
      a.addEventListener("click", (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target && a.target !== "_self") return;
        e.preventDefault();
        softNavigate(a.href);
      });
    });
  }

  window.__archiveBindLinks = bindLinks;
  window.addEventListener("popstate", () => softNavigate(location.href, false));
  bindLinks();
  placePlayer();
})();
