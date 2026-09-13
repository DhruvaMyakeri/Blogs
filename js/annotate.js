(() => {
  const KEY = "archive-annotate:" + location.pathname.replace(/\\/g, "/");
  const tools = {
    pen: { size: 2.4, alpha: 1 },
    highlight: { size: 18, alpha: 0.28 },
    erase: { size: 22, alpha: 1 },
  };

  let strokes = [];
  let tool = "hand";
  let color = "#c1521f";
  let drawing = null;
  let canvas;
  let ctx;
  let dpr = 1;
  let raf = 0;
  let pageW = 1;
  let pageH = 1;

  function load() {
    try {
      strokes = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(strokes)) strokes = [];
    } catch {
      strokes = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(strokes));
    } catch {
      /* quota */
    }
  }

  function measurePage() {
    const el = document.documentElement;
    pageW = Math.max(el.scrollWidth, el.clientWidth, 1);
    pageH = Math.max(el.scrollHeight, document.body?.scrollHeight || 0, el.clientHeight, 1);
  }

  function pointFromEvent(e) {
    const t = e.touches ? e.touches[0] : e;
    return {
      x: (t.clientX + window.scrollX) / pageW,
      y: (t.clientY + window.scrollY) / pageH,
    };
  }

  function toScreen(p) {
    return {
      x: p.x * pageW - window.scrollX,
      y: p.y * pageH - window.scrollY,
    };
  }

  function strokeVisible(s) {
    if (!s.points || !s.points.length) return false;
    const pad = 24;
    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const top = window.scrollY / pageH;
    const bot = (window.scrollY + window.innerHeight) / pageH;
    const left = window.scrollX / pageW;
    const right = (window.scrollX + window.innerWidth) / pageW;
    const m = pad / Math.min(pageW, pageH);
    return maxX >= left - m && minX <= right + m && maxY >= top - m && minY <= bot + m;
  }

  function styleStroke(s) {
    const spec = tools[s.tool] || tools.pen;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = spec.size;
    if (s.tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (s.tool === "highlight") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = hexToRgba(s.color || "#f2d15a", spec.alpha);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = s.color || "#c1521f";
    }
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function drawStroke(s) {
    if (!s.points || s.points.length < 1) return;
    styleStroke(s);
    const a = toScreen(s.points[0]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    for (let i = 1; i < s.points.length; i++) {
      const p = toScreen(s.points[i]);
      ctx.lineTo(p.x, p.y);
    }
    if (s.points.length === 1) ctx.lineTo(a.x + 0.2, a.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }

  function paint() {
    raf = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < strokes.length; i++) {
      if (strokeVisible(strokes[i])) drawStroke(strokes[i]);
    }
    if (drawing && strokeVisible(drawing)) drawStroke(drawing);
  }

  function requestPaint() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function fitCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    measurePage();
    requestPaint();
  }

  function setTool(next) {
    tool = next;
    document.documentElement.classList.toggle("annotate-draw", tool !== "hand");
    document.querySelectorAll("[data-annotate-tool]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.annotateTool === tool);
    });
  }

  function start(e) {
    if (tool === "hand") return;
    if (e.pointerType === "touch") e.preventDefault();
    measurePage();
    drawing = {
      tool,
      color: tool === "highlight" ? "#f2d15a" : color,
      points: [pointFromEvent(e)],
    };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    requestPaint();
  }

  function move(e) {
    if (!drawing) return;
    if (e.pointerType === "touch") e.preventDefault();
    const p = pointFromEvent(e);
    const last = drawing.points[drawing.points.length - 1];
    const dx = (p.x - last.x) * pageW;
    const dy = (p.y - last.y) * pageH;
    if (dx * dx + dy * dy < 1.6) return;
    drawing.points.push(p);
    requestPaint();
  }

  function end() {
    if (!drawing) return;
    if (drawing.points.length) strokes.push(drawing);
    drawing = null;
    save();
    requestPaint();
  }

  function buildBar() {
    const bar = document.createElement("div");
    bar.className = "annotate-bar";
    bar.innerHTML = `
      <button type="button" data-annotate-tool="hand" title="Hand / scroll">✥</button>
      <button type="button" data-annotate-tool="pen" title="Pen">✎</button>
      <button type="button" data-annotate-tool="highlight" title="Highlight">▣</button>
      <button type="button" data-annotate-tool="erase" title="Eraser">⌫</button>
      <input type="color" value="#c1521f" title="Pen colour" aria-label="Pen colour" />
      <span class="annotate-sep" aria-hidden="true"></span>
      <button type="button" data-annotate-act="undo" title="Undo">↶</button>
      <button type="button" data-annotate-act="clear" title="Clear marks">✕</button>
    `;
    bar.querySelectorAll("[data-annotate-tool]").forEach((b) => {
      b.addEventListener("click", () => setTool(b.dataset.annotateTool));
    });
    bar.querySelector('input[type="color"]').addEventListener("input", (e) => {
      color = e.target.value;
      if (tool === "hand") setTool("pen");
    });
    bar.querySelector('[data-annotate-act="undo"]').addEventListener("click", () => {
      strokes.pop();
      save();
      requestPaint();
    });
    bar.querySelector('[data-annotate-act="clear"]').addEventListener("click", () => {
      if (!strokes.length) return;
      if (!confirm("Clear all marks on this page?")) return;
      strokes = [];
      save();
      requestPaint();
    });
    document.body.appendChild(bar);
  }

  function init() {
    load();
    canvas = document.createElement("canvas");
    canvas.id = "annotate-layer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    buildBar();
    setTool("hand");
    fitCanvas();

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", fitCanvas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
