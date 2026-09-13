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
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let raf = 0;
  let pageW = 1;
  let pageH = 1;
  let bound = false;

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
    pageW = Math.max(el.clientWidth, window.innerWidth, 1);
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
    let minY = 1;
    let maxY = 0;
    for (const p of s.points) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const top = window.scrollY / pageH;
    const bot = (window.scrollY + window.innerHeight) / pageH;
    return maxY >= top - 0.02 && minY <= bot + 0.02;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
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

  function drawStroke(s) {
    if (!ctx || !s.points || s.points.length < 1) return;
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
    if (!ctx || !canvas) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < strokes.length; i++) {
      if (strokeVisible(strokes[i])) drawStroke(strokes[i]);
    }
    if (drawing) drawStroke(drawing);
  }

  function requestPaint() {
    if (!ctx) return;
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function fitCanvas() {
    if (!canvas || !ctx) return;
    dpr = 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bw = Math.max(1, Math.round(w));
    const bh = Math.max(1, Math.round(h));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }
    measurePage();
    requestPaint();
  }

  function ensureCanvas() {
    if (canvas && ctx) return true;
    canvas = document.createElement("canvas");
    canvas.id = "annotate-layer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      canvas.remove();
      canvas = null;
      return false;
    }
    if (!bound) {
      bound = true;
      canvas.addEventListener("pointerdown", start);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", end);
      canvas.addEventListener("pointercancel", end);
      window.addEventListener("scroll", requestPaint, { passive: true });
      window.addEventListener("resize", fitCanvas);
    }
    fitCanvas();
    return true;
  }

  function destroyCanvasIfIdle() {
    if (tool !== "hand" || drawing || strokes.length) return;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (canvas) {
      canvas.remove();
      canvas = null;
      ctx = null;
    }
  }

  function setTool(next) {
    tool = next;
    document.documentElement.classList.toggle("annotate-draw", tool !== "hand");
    document.querySelectorAll("[data-annotate-tool]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.annotateTool === tool);
    });
    if (tool !== "hand") ensureCanvas();
    else if (!strokes.length) destroyCanvasIfIdle();
  }

  function start(e) {
    if (tool === "hand" || !ensureCanvas()) return;
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
    if (dx * dx + dy * dy < 2.2) return;
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
      if (strokes.length) {
        ensureCanvas();
        requestPaint();
      } else {
        requestPaint();
        destroyCanvasIfIdle();
      }
    });
    bar.querySelector('[data-annotate-act="clear"]').addEventListener("click", () => {
      if (!strokes.length) return;
      if (!confirm("Clear all marks on this page?")) return;
      strokes = [];
      save();
      requestPaint();
      destroyCanvasIfIdle();
    });
    document.body.appendChild(bar);
  }

  function init() {
    load();
    buildBar();
    setTool("hand");
    if (strokes.length) ensureCanvas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
