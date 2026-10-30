#!/usr/bin/env python3
"""Build the Dynatrace Essentials study site.

Reads Markdown from notes/ and writes HTML pages to docs/
(docs/ can be served directly by GitHub Pages).

Usage:  python3 build.py
"""
import html
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "notes"
OUT = ROOT / "docs"

MD_EXT = ["tables", "fenced_code", "sane_lists", "toc"]


def title_of(md_text: str, fallback: str) -> str:
    m = re.search(r"^#\s+(.+)$", md_text, re.M)
    return m.group(1).strip() if m else fallback


def short_title(t: str) -> str:
    # "Lesson 3 — Dynatrace Topology (Smartscape)" -> "Dynatrace Topology (Smartscape)"
    return re.sub(r"^Lesson\s+\d+\s+[—-]\s+", "", t)


LIST_RE = re.compile(r"^\s*(?:[-*+]|\d+\.)\s+")


def fix_lists(md_text: str) -> str:
    """Python-Markdown needs a blank line before a list; the notes often omit it."""
    out, prev = [], ""
    in_code = False
    for line in md_text.split("\n"):
        if line.lstrip().startswith("```"):
            in_code = not in_code
        if (not in_code and LIST_RE.match(line) and prev.strip()
                and not LIST_RE.match(prev) and not prev.startswith(" ")):
            out.append("")
        out.append(line)
        prev = line
    return "\n".join(out)


def render(md_text: str) -> str:
    """Render Markdown; put the trailing '### Answers' section in a collapsible block."""
    md_text = fix_lists(md_text)
    parts = re.split(r"^###\s+Answers\s*$", md_text, maxsplit=1, flags=re.M)
    body = markdown.markdown(parts[0], extensions=MD_EXT)
    if len(parts) == 2:
        answers = markdown.markdown(parts[1], extensions=MD_EXT)
        body += (
            '\n<details class="answers"><summary>Show answers</summary>\n'
            f"{answers}\n</details>\n"
        )
    # Link .md references in the index to their .html pages
    body = re.sub(r"<code>(\d\d-[a-z0-9-]+)\.md</code>",
                  r'<a href="\1.html"><code>\1</code></a>', body)
    return body


CSS = """
:root{
  --bg:#f7f8fa; --surface:#ffffff; --text:#1c2230; --muted:#5b6475;
  --border:#e2e6ee; --accent:#1f5fd6; --accent-soft:#e8effd;
  --code-bg:#f1f3f7; --row-alt:#fafbfd;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#11141a; --surface:#181c24; --text:#e4e8f0; --muted:#9aa3b5;
    --border:#2a303c; --accent:#7aa7ff; --accent-soft:#1d2a44;
    --code-bg:#1f2430; --row-alt:#1b2029;
  }
}
:root[data-theme="dark"]{
  --bg:#11141a; --surface:#181c24; --text:#e4e8f0; --muted:#9aa3b5;
  --border:#2a303c; --accent:#7aa7ff; --accent-soft:#1d2a44;
  --code-bg:#1f2430; --row-alt:#1b2029;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
.layout{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh}
nav.side{border-right:1px solid var(--border);background:var(--surface);
  padding:24px 16px;position:sticky;top:0;height:100vh;overflow:auto}
nav.side .brand{font-weight:700;font-size:15px;margin:0 8px 16px;color:var(--text)}
nav.side ol{list-style:none;margin:0;padding:0}
nav.side li a{display:flex;gap:10px;padding:7px 8px;border-radius:6px;
  color:var(--muted);font-size:14px;line-height:1.35}
nav.side li a .n{min-width:20px;color:var(--muted);font-variant-numeric:tabular-nums}
nav.side li a:hover{background:var(--accent-soft);text-decoration:none;color:var(--text)}
nav.side li a.active{background:var(--accent-soft);color:var(--accent);font-weight:600}
main{padding:40px 48px 80px;max-width:900px}
h1{font-size:30px;line-height:1.25;margin:0 0 8px}
h2{font-size:22px;margin:40px 0 12px;padding-top:12px;border-top:1px solid var(--border)}
h3{font-size:18px;margin:28px 0 8px}
h4{font-size:16px;margin:20px 0 6px;color:var(--muted)}
hr{display:none}
table{border-collapse:collapse;width:100%;margin:16px 0;font-size:14.5px;
  display:block;overflow-x:auto}
th,td{border:1px solid var(--border);padding:8px 10px;text-align:left;vertical-align:top}
th{background:var(--code-bg)} tr:nth-child(even) td{background:var(--row-alt)}
code{background:var(--code-bg);padding:1px 5px;border-radius:4px;font-size:.9em}
pre{background:var(--code-bg);padding:14px 16px;border-radius:8px;overflow-x:auto}
pre code{padding:0;background:none}
blockquote{margin:16px 0;padding:10px 16px;border-left:4px solid var(--accent);
  background:var(--accent-soft);border-radius:0 6px 6px 0}
blockquote p{margin:4px 0}
details.answers{margin:20px 0;border:1px solid var(--border);border-radius:8px;
  background:var(--surface);padding:4px 16px}
details.answers summary{cursor:pointer;font-weight:600;padding:10px 0;color:var(--accent)}
.pager{display:flex;justify-content:space-between;gap:16px;margin-top:48px;
  padding-top:20px;border-top:1px solid var(--border)}
.pager a{display:block;padding:12px 16px;border:1px solid var(--border);
  border-radius:8px;background:var(--surface);max-width:48%}
.pager small{display:block;color:var(--muted);font-size:12px}
.topbar{display:flex;justify-content:flex-end;margin-bottom:12px}
.theme-btn{border:1px solid var(--border);background:var(--surface);color:var(--muted);
  border-radius:6px;padding:4px 10px;font-size:13px;cursor:pointer}
footer{margin-top:40px;color:var(--muted);font-size:13px}
@media (max-width:820px){
  .layout{grid-template-columns:1fr}
  nav.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--border)}
  main{padding:24px 16px 60px}
  h1{font-size:25px}
}
@media print{nav.side,.pager,.topbar{display:none}.layout{display:block}
  details.answers{display:block}}
"""

THEME_JS = """
<script>
(function(){
  var r=document.documentElement;
  try{var t=localStorage.getItem('theme'); if(t) r.setAttribute('data-theme',t);}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.querySelector('.theme-btn'); if(!b) return;
    b.addEventListener('click',function(){
      var dark = r.getAttribute('data-theme')==='dark' ||
        (!r.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var n = dark ? 'light' : 'dark'; r.setAttribute('data-theme',n);
      try{localStorage.setItem('theme',n);}catch(e){}
    });
  });
})();
</script>
"""


def page(title, nav_html, body, pager):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)} · Dynatrace Essentials Notes</title>
<link rel="stylesheet" href="style.css">
{THEME_JS}
</head>
<body>
<div class="layout">
<nav class="side" aria-label="Lessons">
<div class="brand">Dynatrace Essentials Notes</div>
{nav_html}
</nav>
<main>
<div class="topbar"><button class="theme-btn" type="button">Toggle theme</button></div>
{body}
{pager}
<footer>Original study notes based on the Dynatrace University course "Dynatrace Essentials".</footer>
</main>
</div>
</body>
</html>
"""


def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(SRC.glob("*.md"))
    pages = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        name = "index" if f.stem.startswith("00-") else f.stem
        t = title_of(text, f.stem)
        label = "Home" if name == "index" else short_title(t)
        num = f.stem[:2]
        pages.append(dict(src=f, name=name, title=t, label=label, num=num, text=text))

    for i, p in enumerate(pages):
        items = []
        for q in pages:
            n = "" if q["name"] == "index" else (str(int(q["num"])) if q["num"] != "09" else "★")
            cls = ' class="active"' if q is p else ""
            items.append(f'<li><a href="{q["name"]}.html"{cls}><span class="n">{n}</span>'
                         f'<span>{html.escape(q["label"])}</span></a></li>')
        nav_html = "<ol>\n" + "\n".join(items) + "\n</ol>"

        prev_l = pages[i - 1] if i > 0 else None
        next_l = pages[i + 1] if i < len(pages) - 1 else None
        pager = '<div class="pager">'
        pager += (f'<a href="{prev_l["name"]}.html"><small>Previous</small>'
                  f'{html.escape(prev_l["label"])}</a>' if prev_l else "<span></span>")
        pager += (f'<a href="{next_l["name"]}.html" style="text-align:right">'
                  f'<small>Next</small>{html.escape(next_l["label"])}</a>' if next_l else "<span></span>")
        pager += "</div>"

        out = page(p["title"], nav_html, render(p["text"]), pager)
        (OUT / f"{p['name']}.html").write_text(out, encoding="utf-8")

    (OUT / "style.css").write_text(CSS.strip() + "\n", encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Built {len(pages)} pages into {OUT}")


if __name__ == "__main__":
    main()
