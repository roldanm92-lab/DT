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
    print(f"Learn data: {sum(len(v['questions']) for v in quizzes.values())} quiz questions, "
          f"{len(data['flashcards'])} flashcards, {len(data['drills'])} drill scenarios")


if __name__ == "__main__":
    main()
