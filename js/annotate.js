(() => {
  const KEY = "archive-annotate:" + location.pathname.replace(/\\/g, "/");
  const tools = {
    pen: { size: 2.4, alpha: 1 },
    highlight: { size: 18, alpha: 0.32 },
    erase: { size: 22, alpha: 1 },
  };

  let strokes = [];
  let tool = "hand";
  let color = "#c1521f";
  let drawing = null;
  let canvas;
  let ctx;

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

  function docSize() {
    const el = document.documentElement;
    return {
      w: Math.max(el.scrollWidth, el.clientWidth, 1),
      h: Math.max(el.scrollHeight, el.clientHeight, document.body?.scrollHeight || 0, 1),
    };
  }

  function pointFromEvent(e) {
    const t = e.touches ? e.touches[0] : e;
    const { w, h } = docSize();
    return { x: t.pageX / w, y: t.pageY / h };
  }

  function resize() {
    const { w, h } = docSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
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
      ctx.globalCompositeOperation = "multiply";
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
    const { w, h } = docSize();
    styleStroke(s);
    ctx.beginPath();
    ctx.moveTo(s.points[0].x * w, s.points[0].y * h);
    for (let i = 1; i < s.points.length; i++) {
      ctx.lineTo(s.points[i].x * w, s.points[i].y * h);
    }
    if (s.points.length === 1) {
      ctx.lineTo(s.points[0].x * w + 0.01, s.points[0].y * h);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }

  function redraw() {
    const { w, h } = docSize();
    ctx.clearRect(0, 0, w, h);
    strokes.forEach(drawStroke);
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
    if (e.touches) e.preventDefault();
    drawing = {
      tool,
      color: tool === "highlight" ? "#f2d15a" : color,
      points: [pointFromEvent(e)],
    };
    drawStroke(drawing);
  }

  function move(e) {
    if (!drawing) return;
    if (e.touches) e.preventDefault();
    drawing.points.push(pointFromEvent(e));
    drawStroke({
      ...drawing,
      points: drawing.points.slice(-2),
    });
  }

  function end() {
    if (!drawing) return;
    strokes.push(drawing);
    drawing = null;
    save();
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
      redraw();
    });
    bar.querySelector('[data-annotate-act="clear"]').addEventListener("click", () => {
      if (!strokes.length) return;
      if (!confirm("Clear all marks on this page?")) return;
      strokes = [];
      save();
      redraw();
    });
    document.body.appendChild(bar);
  }

  function init() {
    load();
    canvas = document.createElement("canvas");
    canvas.id = "annotate-layer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    buildBar();
    setTool("hand");
    resize();

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("resize", resize);
    new ResizeObserver(resize).observe(document.documentElement);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
