#!/usr/bin/env python3
"""Generate the homepage (index.html) and learn/data.js from notes/ and content/.

- Flashcards come from each lesson's "## Definitions (glossary)" section.
- Scenario drills come from the "Common \"which one?\" decisions" table in the cram sheet.
- Quizzes come from content/quizzes.json.
Called automatically by build.py.
"""
import html
import json
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NOTES = ROOT / "notes"
LEARN = ROOT / "learn"


def plain(s: str) -> str:
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    s = re.sub(r"\*(.+?)\*", r"\1", s)
    s = s.replace("`", "")
    return s.strip()


def lessons():
    out = []
    for f in sorted(NOTES.glob("0[1-8]-*.md")):
        text = f.read_text(encoding="utf-8")
        t = re.search(r"^#\s+(.+)$", text, re.M).group(1)
        short = re.sub(r"^Lesson\s+\d+\s+[—-]\s+", "", t)
        out.append({"id": f.stem[:2], "num": int(f.stem[:2]), "title": short,
                    "notes": f"docs/{f.stem}.html", "text": text})
    return out


def flashcards(ls):
    cards = []
    for l in ls:
        m = re.search(r"^## Definitions.*?$(.*?)(?=^---|^## )", l["text"], re.M | re.S)
        if not m:
            continue
        for line in m.group(1).splitlines():
            mm = re.match(r"^- \*\*(.+?):?\*\*:?\s*(.+)$", line.strip())
            if not mm:
                continue
            term, definition = mm.group(1).rstrip(":"), mm.group(2)
            if "see table" in definition.lower():
                continue
            cards.append({"lesson": l["id"], "term": plain(term), "def": plain(definition)})
    return cards


def drills():
    text = (NOTES / "09-cram-sheet-and-final-review.md").read_text(encoding="utf-8")
    m = re.search(r'^## Common "which one\?" decisions\s*$(.*?)(?=^## )', text, re.M | re.S)
    rows = []
    for line in m.group(1).splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 2 or cells[0] in ("Situation", "") or set(cells[0]) <= set("-: "):
            continue
        rows.append({"q": plain(cells[0]), "a": plain(cells[1])})
    return rows


# ---------------------------------------------------------------- glossary + search

def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def term_variants(term: str):
    """Names a term goes by in running text: 'A / B' -> A, B; 'MPP (massively …)' -> both."""
    out = []
    for part in [p.strip() for p in term.split(" / ")]:
        m = re.match(r"^(.*?)\s*\((.+)\)$", part)
        if m:
            out.append(m.group(1).strip())
            if m.group(2).strip().lower() != "dynatrace":
                out.append(m.group(2).strip())
        else:
            out.append(part)
    return [o for o in out if o]


def word_re(v: str):
    tail = "s?" if v[-1:].isalpha() else ""
    return re.compile(r"(?<![\w-])" + re.escape(v) + tail + r"(?![\w])", re.I)


def notes_index(ls):
    """Split each rendered notes page into searchable sections keyed by heading id."""
    titles = {l["id"]: l["title"] for l in ls}
    titles["09"] = "Cram sheet"
    sections = []
    for f in sorted((ROOT / "docs").glob("0[1-9]-*.html")):
        lid = f.stem[:2]
        body = f.read_text(encoding="utf-8")
        body = body[body.find("<main>"):body.find('<div class="pager">')]
        chunks = re.split(r'(<h[23] id="[^"]+">.*?</h[23]>)', body, flags=re.S)
        heading, hid = None, None
        for ch in chunks:
            m = re.match(r'<h[23] id="([^"]+)">(.*?)</h[23]>', ch, re.S)
            if m:
                hid, heading = m.group(1), html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()
                continue
            if not heading:
                continue
            text = re.sub(r"<(li|p|tr|h4|pre|summary)[^>]*>", " ", ch)
            text = html.unescape(re.sub(r"<[^>]+>", " ", text))
            text = re.sub(r"\s+", " ", text).strip()
            if len(text) < 20:
                continue
            sections.append({"lesson": lid, "page": f"docs/{f.name}", "id": hid,
                             "where": titles.get(lid, ""), "heading": heading, "text": text})
    return sections


def glossary(ls, cards):
    extra = json.loads((ROOT / "content" / "glossary-extra.json").read_text(encoding="utf-8"))
    hide = {h.lower() for h in extra.get("hide", [])}
    alias_map = {k.lower(): v for k, v in extra.get("aliases", {}).items()}

    merged = {}
    raw = [dict(c, aliases=[]) for c in cards] + [
        {"lesson": t["lesson"], "term": t["term"], "def": t["def"], "aliases": t.get("aliases", [])}
        for t in extra["terms"]]
    for r in raw:
        key = r["term"].lower()
        if key in hide:
            continue
        e = merged.setdefault(key, {"term": r["term"], "slug": slugify(r["term"]),
                                    "defs": [], "aliases": [], "lessons": []})
        if all(d["text"] != r["def"] for d in e["defs"]):
            e["defs"].append({"lesson": r["lesson"], "text": r["def"]})
        if r["lesson"] not in e["lessons"]:
            e["lessons"].append(r["lesson"])
        e["aliases"] += [a for a in r["aliases"] if a not in e["aliases"]]
    for key, e in merged.items():
        e["aliases"] += [a for a in alias_map.get(key, []) if a not in e["aliases"]]
        e["names"] = term_variants(e["term"])

    entries = sorted(merged.values(), key=lambda e: e["term"].lower())

    # Where each term is mentioned in the notes (lessons + cram sheet), with a jump-to-text link.
    texts = {l["id"]: (l["text"], l["notes"]) for l in ls}
    cram = NOTES / "09-cram-sheet-and-final-review.md"
    texts["09"] = (cram.read_text(encoding="utf-8"), "docs/09-cram-sheet-and-final-review.html")
    def find_mentions(names):
        found = []
        for lid, (txt, page) in texts.items():
            hits, first = 0, None
            for v in names:
                for m in word_re(v).finditer(txt):
                    hits += 1
                    first = first or m.group(0)
            if hits:
                frag = "#:~:text=" + urllib.parse.quote(first)
                found.append({"lesson": lid, "href": page + frag, "hits": hits})
        return found

    for e in entries:
        mentions = find_mentions(e["names"])
        if not mentions:
            # Notes often use the short form: "Foundation & Discovery" rather than "… mode".
            short = [re.sub(r"\s+(mode|problem|app)$", "", v, flags=re.I) for v in e["names"]]
            if short != e["names"]:
                mentions = [m for m in find_mentions(short) if m["lesson"] in e["lessons"]]
        if not mentions:
            mentions = [{"lesson": e["lessons"][0], "href": texts[e["lessons"][0]][1], "hits": 0}]
        mentions.sort(key=lambda m: (m["lesson"] not in e["lessons"], m["lesson"]))
        e["mentions"] = mentions

    # Related terms: other glossary terms named inside this term's definitions.
    pats = [(o, v, word_re(v)) for o in entries for v in o["names"]
            if len(v) >= 4 or (v.isupper() and len(v) >= 3)]
    for e in entries:
        text = " ".join(d["text"] for d in e["defs"])
        found = []
        for o, v, rx in pats:
            if o is e or set(o["names"]) & set(e["names"]):
                continue
            for m in rx.finditer(text):
                found.append((m.start(), -(m.end() - m.start()), m.end(), o))
        found.sort(key=lambda x: (x[0], x[1]))
        related, taken_until = [], -1
        for start, _neg, end, o in found:
            if start < taken_until or o["slug"] in related:
                continue
            related.append(o["slug"])
            taken_until = end
        e["related"] = related[:5]
    for e in entries:
        del e["names"]
    return entries


def homepage(ls):
    lesson_rows = "\n".join(
        f'''<li class="lesson" data-id="{l["id"]}">
  <span class="num">{l["num"]}</span>
  <span class="ltitle">{html.escape(l["title"])}</span>
  <span class="lactions">
    <a href="{l["notes"]}">Notes</a>
    <a href="learn/quiz.html?lesson={l["id"]}">Quiz</a>
    <a href="learn/flashcards.html?lesson={l["id"]}">Cards</a>
  </span>
  <span class="score" data-score="{l["id"]}">—</span>
</li>''' for l in ls)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DT · Dynatrace Essentials Study Hub</title>
<link rel="stylesheet" href="learn/learn.css">
<script src="learn/theme.js"></script>
</head>
<body class="home">
<header class="site">
  <a class="logo" href="index.html">DT</a>
  <nav class="top">
    <a href="docs/index.html">Notes</a>
    <a href="learn/glossary.html">Glossary</a>
    <a href="learn/quiz.html">Quizzes</a>
    <a href="learn/flashcards.html">Flashcards</a>
    <a href="learn/drill.html">Scenario drill</a>
    <button class="theme-btn" type="button" aria-label="Toggle theme"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button>
  </nav>
</header>

<main class="wrap">
  <section class="hero">
    <p class="eyebrow">Dynatrace Essentials · Study hub</p>
    <h1>Learn it, test it, lock it in.</h1>
    <p class="lede">Notes for all 8 lessons, plus quizzes, flashcards, and a scenario drill to practise before the certificate exam. Your progress is saved in this browser.</p>
    <div class="hero-actions">
      <a class="btn primary" id="continue" href="docs/01-introduction-to-dynatrace.html">Start with Lesson 1</a>
      <a class="btn" href="learn/quiz.html?mode=exam">Take a practice exam</a>
    </div>
  </section>

  <form class="home-search" action="learn/glossary.html" method="get" role="search">
    <div class="search-box">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input name="q" type="search" autocomplete="off" placeholder="Look up a term — e.g. Apdex, XHR, Grail" aria-label="Search the glossary">
    </div>
  </form>

  <section class="stats" aria-label="Your progress">
    <div class="stat"><span class="v" id="st-quizzes">0/8</span><span class="k">lesson quizzes passed</span></div>
    <div class="stat"><span class="v" id="st-exam">—</span><span class="k">best practice exam</span></div>
    <div class="stat"><span class="v" id="st-cards">0</span><span class="k">flashcards known</span></div>
    <div class="stat"><span class="v" id="st-drill">0</span><span class="k">best drill streak</span></div>
  </section>

  <section class="modes" aria-label="Ways to study">
    <a class="mode" href="docs/index.html">
      <span class="tag">Read</span>
      <h2>Study notes</h2>
      <p>Objectives, explanations, glossary, examples and review questions for every lesson.</p>
    </a>
    <a class="mode" href="learn/glossary.html">
      <span class="tag">Look up</span>
      <h2>Glossary</h2>
      <p>Search every Dynatrace term from the course, with links to where it's covered in the notes.</p>
    </a>
    <a class="mode" href="learn/quiz.html">
      <span class="tag">Test</span>
      <h2>Quizzes</h2>
      <p>Multiple choice per lesson with instant explanations, or a mixed 20-question practice exam.</p>
    </a>
    <a class="mode" href="learn/flashcards.html">
      <span class="tag">Recall</span>
      <h2>Flashcards</h2>
      <p>Flip through every glossary term. Cards you miss come back until you know them.</p>
    </a>
    <a class="mode" href="learn/drill.html">
      <span class="tag">Apply</span>
      <h2>Scenario drill</h2>
      <p>"Which tool would you use?" Rapid-fire situations — build a streak.</p>
    </a>
    <a class="mode" href="docs/09-cram-sheet-and-final-review.html">
      <span class="tag">Review</span>
      <h2>Cram sheet</h2>
      <p>Every number to memorise, easily-confused pairs, and a 40-question final review.</p>
    </a>
  </section>

  <section class="lessons-sec">
    <h2 class="sec-title">Lessons</h2>
    <ol class="lessons">
{lesson_rows}
    </ol>
    <p class="reset-row"><button type="button" class="linkish" id="reset">Reset my progress</button></p>
  </section>
</main>
<footer class="site-foot">Original study notes and practice material based on the Dynatrace University course "Dynatrace Essentials".</footer>
<script src="learn/data.js"></script>
<script src="learn/store.js"></script>
<script src="learn/home.js"></script>
</body>
</html>
"""


def main():
    ls = lessons()
    quizzes = json.loads((ROOT / "content" / "quizzes.json").read_text(encoding="utf-8"))
    data = {
        "lessons": [{k: l[k] for k in ("id", "num", "title", "notes")} for l in ls],
        "quizzes": quizzes,
        "flashcards": flashcards(ls),
        "drills": drills(),
    }
    LEARN.mkdir(exist_ok=True)
    (LEARN / "data.js").write_text(
        "// Generated by build_learn.py — do not edit by hand.\nwindow.DT_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    (ROOT / "index.html").write_text(homepage(ls), encoding="utf-8")

    gloss = glossary(ls, data["flashcards"])
    sections = notes_index(ls)
    (LEARN / "search-data.js").write_text(
        "// Generated by build_learn.py — do not edit by hand.\nwindow.DT_SEARCH = "
        + json.dumps({"lessons": data["lessons"], "glossary": gloss, "sections": sections},
                     ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"Learn data: {sum(len(v['questions']) for v in quizzes.values())} quiz questions, "
          f"{len(data['flashcards'])} flashcards, {len(data['drills'])} drill scenarios, "
          f"{len(gloss)} glossary terms, {len(sections)} searchable note sections")


if __name__ == "__main__":
    main()
