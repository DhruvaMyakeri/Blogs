import os, re, base64, mimetypes

ROOT = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(ROOT, "content")

PAGES = [
    ("index", "Overview", "Image Processing — Unit 2 Study Guide"),
    ("01-frequency-domain", "1 · Frequency Domain & the Fourier Transform", "Frequency Domain & the Fourier Transform"),
    ("02-sampling-aliasing", "2 · Sampling & Aliasing", "Sampling, Aliasing & Interpolation"),
    ("03-smoothing-filters", "3 · Smoothing in the Frequency Domain", "Smoothing Filters in the Frequency Domain"),
    ("04-sharpening-filters", "4 · Sharpening in the Frequency Domain", "Sharpening Filters in the Frequency Domain"),
    ("05-unsharp-homomorphic", "5 · Unsharp Masking & Homomorphic Filtering", "Unsharp Masking, High-Boost & Homomorphic Filtering"),
    ("06-transform-preliminaries", "6 · Matrix Transforms & Basis Images", "Matrix-Based Transforms & Basis Images"),
    ("07-haar-dct-dwt", "7 · Haar, DCT, DST & DWT", "Haar, DCT, DST and Wavelet Transforms"),
    ("08-compression-fundamentals", "8 · Compression Fundamentals", "Image Compression Fundamentals"),
    ("09-huffman-coding", "9 · Huffman Coding", "Huffman Coding"),
    ("10-lossless-coding", "10 · RLE, CCITT & Bit-Plane Coding", "Run-Length, Symbol-Based & Bit-Plane Coding"),
    ("11-jpeg-block-transform", "11 · Block Transform Coding & JPEG", "Block Transform Coding & JPEG"),
]

CSS = """
:root{
  --bg:#f6f4ef; --panel:#ffffff; --ink:#1c1b1f; --ink-soft:#57545c;
  --accent:#3730a3; --accent-soft:#e7e5fb; --accent-line:#c7c2f5;
  --gold:#a8631a; --gold-soft:#fbeedd;
  --rule:#e2ded4; --code-bg:#f1eee6; --shadow: 0 1px 2px rgba(20,16,40,.06), 0 8px 24px rgba(20,16,40,.05);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#15141a; --panel:#1c1a22; --ink:#ece9f2; --ink-soft:#b3aec2;
    --accent:#a5a0f5; --accent-soft:#2a2650; --accent-line:#3d3872;
    --gold:#e0a561; --gold-soft:#3a2c17;
    --rule:#312e3d; --code-bg:#211f2b; --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35);
  }
}
:root[data-theme="dark"]{
  --bg:#15141a; --panel:#1c1a22; --ink:#ece9f2; --ink-soft:#b3aec2;
  --accent:#a5a0f5; --accent-soft:#2a2650; --accent-line:#3d3872;
  --gold:#e0a561; --gold-soft:#3a2c17;
  --rule:#312e3d; --code-bg:#211f2b; --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35);
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;font-family:-apple-system,"Segoe UI",Inter,Helvetica,Arial,sans-serif;line-height:1.65;}
.layout{display:flex;max-width:1400px;margin:0 auto;min-height:100vh;}
nav.side{width:280px;flex:0 0 280px;padding:28px 18px 40px 24px;border-right:1px solid var(--rule);position:sticky;top:0;align-self:flex-start;height:100vh;overflow-y:auto;}
nav.side .brand{font-family:Georgia,"Iowan Old Style",serif;font-size:1.05rem;font-weight:700;color:var(--accent);margin:0 0 4px;}
nav.side .brand-sub{font-size:.72rem;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.08em;margin-bottom:22px;display:block;}
nav.side a{display:block;font-size:.87rem;color:var(--ink-soft);text-decoration:none;padding:7px 10px;border-radius:8px;margin-bottom:2px;border-left:3px solid transparent;}
nav.side a:hover{background:var(--accent-soft);color:var(--accent);}
nav.side a.active{background:var(--accent-soft);color:var(--accent);font-weight:600;border-left-color:var(--accent);}
nav.side .grp{font-size:.68rem;text-transform:uppercase;letter-spacing:.09em;color:var(--ink-soft);opacity:.7;margin:16px 0 4px 10px;}
main{flex:1;min-width:0;padding:40px 48px 100px;}
.hero{margin-bottom:8px;}
.hero h1{font-family:Georgia,"Iowan Old Style",serif;font-size:2.1rem;margin:0 0 6px;color:var(--ink);}
.hero .kicker{color:var(--accent);font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;display:block;}
.hero .dek{color:var(--ink-soft);font-size:1.05rem;max-width:60em;}
section.concept{margin-top:56px;padding-top:8px;border-top:1px solid var(--rule);}
section.concept:first-of-type{border-top:none;}
h2.concept-title{font-family:Georgia,"Iowan Old Style",serif;font-size:1.5rem;color:var(--ink);margin:0 0 4px;}
h3{font-family:Georgia,"Iowan Old Style",serif;font-size:1.15rem;color:var(--ink);margin:28px 0 8px;}
p{max-width:70em;}
.slide-wrap{display:flex;gap:22px;align-items:flex-start;margin:18px 0 22px;flex-wrap:wrap;}
.slide-wrap.stack{flex-direction:column;}
.slide-shot{border:1px solid var(--rule);border-radius:10px;box-shadow:var(--shadow);max-width:340px;width:100%;background:#fff;}
.slide-cap{font-size:.75rem;color:var(--ink-soft);margin-top:6px;text-align:center;}
.slide-col{flex:0 0 340px;}
.text-col{flex:1;min-width:280px;}
.caption-only{display:flex;align-items:center;gap:16px;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:10px 16px;margin:14px 0;}
.caption-only img{width:96px;border-radius:6px;border:1px solid var(--rule);}
.caption-only .cap-text{font-size:.88rem;color:var(--ink-soft);}
.callout{background:var(--gold-soft);border-left:4px solid var(--gold);border-radius:8px;padding:14px 18px;margin:18px 0;}
.callout .tag{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--gold);display:block;margin-bottom:4px;}
.added{background:var(--panel);border:1px dashed var(--accent-line);border-radius:8px;padding:12px 16px;margin:14px 0;font-size:.93rem;color:var(--ink-soft);}
.added .tag{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--accent);display:block;margin-bottom:4px;}
.formula{background:var(--code-bg);border-radius:8px;padding:14px 20px;margin:14px 0;font-family:"Cambria Math",Georgia,serif;font-size:1.05rem;overflow-x:auto;}
code, .mono{font-family:ui-monospace,Consolas,"SF Mono",monospace;font-size:.9em;background:var(--code-bg);padding:1px 5px;border-radius:4px;}
.jargon{border-bottom:1px dotted var(--accent);cursor:help;}
table{border-collapse:collapse;margin:14px 0;width:100%;max-width:70em;font-size:.92rem;}
th,td{border:1px solid var(--rule);padding:6px 10px;text-align:left;}
th{background:var(--code-bg);}
.sim{background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:var(--shadow);padding:20px 22px;margin:22px 0;}
.sim .sim-tag{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--accent);}
.sim h4{margin:4px 0 12px;font-family:Georgia,serif;font-size:1.05rem;}
.sim-row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;}
.sim-img-box{text-align:center;}
.sim-img-box img{max-width:280px;width:100%;border-radius:8px;border:1px solid var(--rule);}
.sim-img-box .lbl{font-size:.74rem;color:var(--ink-soft);margin-top:4px;}
.sim-controls{margin-top:10px;}
.sim-controls label{font-size:.8rem;color:var(--ink-soft);margin-right:8px;}
.qbox{background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:18px 22px;margin:18px 0;box-shadow:var(--shadow);}
.qbox .qnum{color:var(--accent);font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;}
.qbox .qmarks{float:right;color:var(--ink-soft);font-size:.78rem;}
.qbox h4{margin:4px 0 10px;font-family:Georgia,serif;}
.recap-note{font-size:.85rem;color:var(--ink-soft);font-style:italic;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.footer-nav{display:flex;justify-content:space-between;margin-top:70px;padding-top:20px;border-top:1px solid var(--rule);font-size:.9rem;}
.footer-nav a{color:var(--accent);text-decoration:none;font-weight:600;}
.pill{display:inline-block;background:var(--accent-soft);color:var(--accent);font-size:.7rem;font-weight:700;padding:2px 9px;border-radius:99px;text-transform:uppercase;letter-spacing:.06em;}
@media (max-width:900px){
  .layout{flex-direction:column;}
  nav.side{width:100%;flex:none;height:auto;position:relative;border-right:none;border-bottom:1px solid var(--rule);padding:18px;}
  main{padding:28px 18px 80px;}
  .slide-col{flex:0 0 100%;}
}
input[type=range]{width:100%;accent-color:var(--accent);}
"""

def nav_html(active_slug):
    items = []
    for slug, short, _ in PAGES:
        cls = "active" if slug == active_slug else ""
        items.append(f'<a class="{cls}" href="{slug}.html">{short}</a>')
    return f"""
<nav class="side">
  <p class="brand">Image Processing</p>
  <span class="brand-sub">Unit 2 Study Guide</span>
  {items[0]}
  <div class="grp">Frequency Domain</div>
  {"".join(items[1:6])}
  <div class="grp">Transforms</div>
  {"".join(items[6:8])}
  <div class="grp">Compression</div>
  {"".join(items[8:12])}
</nav>
"""

IMG_RE = re.compile(r'(src|href)="(assets/[^"]+)"')

def inline_images(html):
    def repl(m):
        attr, relpath = m.groups()
        abspath = os.path.join(ROOT, relpath)
        with open(abspath, "rb") as f:
            data = f.read()
        mime = mimetypes.guess_type(abspath)[0] or "application/octet-stream"
        b64 = base64.b64encode(data).decode("ascii")
        return f'{attr}="data:{mime};base64,{b64}"'
    return IMG_RE.sub(repl, html)

def build():
    for i, (slug, short, title) in enumerate(PAGES):
        frag_path = os.path.join(CONTENT, f"{slug}.html")
        if not os.path.exists(frag_path):
            print("MISSING fragment:", frag_path)
            continue
        with open(frag_path, encoding="utf-8") as f:
            body = f.read()

        prev_link = ""
        next_link = ""
        if i > 0:
            pslug, pshort, _ = PAGES[i-1]
            prev_link = f'<a href="{pslug}.html">&larr; {pshort}</a>'
        else:
            prev_link = "<span></span>"
        if i < len(PAGES)-1:
            nslug, nshort, _ = PAGES[i+1]
            next_link = f'<a href="{nslug}.html">{nshort} &rarr;</a>'
        else:
            next_link = "<span></span>"

        footer_nav = f'<div class="footer-nav">{prev_link}{next_link}</div>' if slug != "index" else ""

        page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · IP Unit 2</title>
<style>{CSS}</style>
</head>
<body>
<div class="layout">
{nav_html(slug)}
<main>
{body}
{footer_nav}
</main>
</div>
</body>
</html>"""

        page = inline_images(page)
        out_path = os.path.join(ROOT, f"{slug}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page)
        print("built", out_path, len(page), "bytes")

if __name__ == "__main__":
    build()
