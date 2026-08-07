(() => {
  function initCarousel() {
    const root = document.querySelector(".carousel");
    if (!root || root.dataset.ready === "1") return;
    root.dataset.ready = "1";

    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    const slides = [...root.querySelectorAll(".carousel-slide")];
    const prev = root.querySelector(".carousel-prev");
    const next = root.querySelector(".carousel-next");
    const dotsWrap = root.querySelector(".carousel-dots");
    if (!viewport || !track || slides.length < 2) return;

    let index = 0;

    function sizeSlides() {
      const w = viewport.clientWidth;
      slides.forEach((s) => {
        s.style.flexBasis = `${w}px`;
        s.style.width = `${w}px`;
        s.style.minWidth = `${w}px`;
        s.style.maxWidth = `${w}px`;
      });
      track.style.transform = `translateX(-${index * w}px)`;
    }

    if (!dotsWrap.querySelector(".carousel-dot")) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "carousel-dot";
        b.setAttribute("aria-label", `Slide ${i + 1}`);
        b.addEventListener("click", () => go(i));
        dotsWrap.appendChild(b);
      });
    }

    const dots = [...dotsWrap.querySelectorAll(".carousel-dot")];

    function go(i) {
      index = (i + slides.length) % slides.length;
      const w = viewport.clientWidth;
      track.style.transform = `translateX(-${index * w}px)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      slides.forEach((s, si) => s.setAttribute("aria-hidden", si === index ? "false" : "true"));
    }

    prev?.addEventListener("click", () => go(index - 1));
    next?.addEventListener("click", () => go(index + 1));

    let startX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40) return;
        go(index + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );

    window.addEventListener("resize", sizeSlides);
    sizeSlides();
    go(0);
  }

  window.__archiveCarouselInit = initCarousel;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }
})();
