# DT — Dynatrace Essentials Study Hub

A study site for the Dynatrace University course *Dynatrace Essentials*: notes for all 8 lessons plus interactive practice. Live at **https://roldanm92-lab.github.io/DT/**.

## What's on the site
- **Homepage** (`index.html`): progress overview and links to everything
- **Study notes** (`docs/`): objectives, explanations, glossary, examples and review questions per lesson, plus a cram sheet
- **Glossary** (`learn/glossary.html`): searchable list of every Dynatrace term, with links to where each is covered in the notes and related terms; searches also cover the full notes
- **Quizzes** (`learn/quiz.html`): multiple choice per lesson with explanations, and a random 20-question practice exam
- **Flashcards** (`learn/flashcards.html`): every glossary term; missed cards come back until learned
- **Scenario drill** (`learn/drill.html`): "which tool would you use?" with a streak counter

Progress (quiz scores, known cards, best streak) is saved in your browser only.

## Editing
- Notes: edit Markdown in `notes/`. Flashcards come from each lesson's *Definitions (glossary)* section; scenarios come from the cram sheet's *which one?* table.
- Glossary: terms come from each lesson's glossary plus `content/glossary-extra.json` (extra terms and search aliases).
- Quiz questions: edit `content/quizzes.json` (`answer` is the 0-based index of the correct option).
- Don't edit generated files by hand: `index.html`, `docs/*.html`, `learn/data.js`, `learn/search-data.js`.

Then run `./publish.sh "what changed"` to rebuild and push (`pip install markdown` first).
