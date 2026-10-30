# Lesson 7 — Analyzing Your Observability Data

## Learning objectives
- Identify the features available for analyzing data in Dynatrace (Dashboards, Notebooks, DQL, Logs and Traces apps; Data Explorer, multidimensional analysis, session segmentation are also mentioned)
- Create and configure **Dashboards** and **Notebooks**

---

## Key topics and explanations

### 1. The scenario: Cyber Monday prep
The store needs to (a) watch performance live during the rush and (b) look back afterward. Plan: **Dashboards** for live visualization, **DQL** for custom views, **Notebooks** to freeze a historical snapshot, plus Logs, Traces, session segmentation, and multidimensional analysis (MDA) for deeper digging.

### 2. Dashboards
- Turn raw data into **visual insights**: spot trends, monitor performance, share findings.
- Built from **tiles** (pre-made or custom): drag and drop, then configure **filters, time frames, visualizations, titles**.
- In the Dashboards app, **every tile is powered by a DQL query**, even if you don't see it.
- **Use for real-time views.**

**Sharing and scheduling:**
- Share with individuals or groups.
- Set a **default time frame** so the dashboard always opens in the right context.
- Dashboards can be shared with people **who don't have a Dynatrace account** (no login required).

**Editing:** update tile titles, change chart formats, add/remove filters, rename the dashboard.

### 3. DQL (Dynatrace Query Language)
- Used by the **Dashboards** and **Notebooks** apps to pull data from **Grail**.
- **Benefits:** faster on large datasets; more flexible than the Data Explorer.
- Has a learning curve, but **you don't need to be a developer** (or an admin) to use it.

**Structure:** a sequence of **steps (commands) joined by pipes `|`**, each refining the previous result:

```
fetch logs
| filter content contains "warning"
```
Read it as: "Fetch the logs, *then* keep only those containing 'warning'."

**Help for learners:** autocomplete, templates, converting Data Explorer charts into DQL, and the Logs/Traces apps can generate DQL for you. The Dynatrace Playground is available for practice.

**Licensing note:** the wrap-up states that running DQL queries **affects licensing** (querying consumes capacity).

#### Supplementary DQL patterns (beyond the course text; check syntax in the Playground)
```
// Count errors per host in the selected timeframe
fetch logs
| filter loglevel == "ERROR"
| summarize errors = count(), by: {dt.entity.host}
| sort errors desc
| limit 10
```
```
// Most recent log lines mentioning "timeout"
fetch logs
| filter contains(content, "timeout")
| sort timestamp desc
| limit 50
```
```
// CPU usage time series per host
timeseries avg(dt.host.cpu.usage), by: {dt.entity.host}
```
Core verbs to recognize: `fetch` (get a data type), `filter` (keep matching records), `summarize` (aggregate), `sort`, `limit`, `fields` (choose columns), `timeseries` (metric over time).

### 4. Notebooks
- "Dashboards with memory": they **don't auto-refresh**; they **capture data at a point in time**.
- Ideal for **historical analysis** — e.g., freeze Black Friday/Cyber Monday data to compare year over year.
- **Caution:** don't re-run the queries in that notebook later, or the frozen snapshot may be replaced/lost.

| | Dashboards | Notebooks |
|---|---|---|
| Purpose | Live, real-time monitoring | Investigation and historical snapshots |
| Refresh | Auto-refreshes | Static until you re-run |
| Typical use | NOC wall screen, team status | Post-incident review, event retrospectives |

### 5. Logs and Traces apps
- Dedicated apps to explore **raw** log and trace data from Grail.
- Filter by **log level**, **keywords/phrases**, and **security context** (which can restrict access by role).
- Both can **generate DQL** for you — a good way to learn.

---

## Definitions (glossary)
- **Dashboard:** A tile-based, real-time visualization of data; tiles run DQL.
- **Tile:** A single visualization or element on a dashboard.
- **DQL:** Dynatrace Query Language; piped commands that query Grail.
- **Notebook:** An analysis document that stores results as of when queries ran.
- **Logs app / Traces app:** Purpose-built apps to filter and explore raw logs/traces.
- **Security context:** A log attribute that can be used to limit who can see data.
- **Data Explorer:** The classic charting tool; its charts can be converted to DQL.

---

## Practical examples
1. **Cyber Monday dashboard:** tiles for checkout response time, error rate, active users, Apdex, and CPU of the checkout hosts, with a default time frame of "last 2 hours," shared with the on-call group.
2. **Post-event notebook:** after Cyber Monday, run queries for orders/minute, peak response time, and top errors, then save the notebook as "Cyber Monday 2026" and leave the queries un-rerun for next year's comparison.
3. **Learning DQL from the Logs app:** filter the Logs app to `ERROR` level and "payment," then open the generated DQL to see how `fetch logs | filter …` is written.
4. **Quick question in DQL:** "Which hosts logged the most warnings today?" → fetch logs, filter for warning, summarize count by host, sort descending.

---

## Knowledge-check concepts
- Status of Dashboard Classic vs. the new Dashboards app (check current docs; the course mentions both exist)
- Which apps are designed for exploring raw logs and traces (**Logs** and **Traces** apps)
- What you can do when editing dashboards (modify chart formats, tile titles, filters)
- How Notebooks differ from Dashboards (fixed snapshots at a point in time)
- DQL facts: uses commands like `fetch` and `filter`; communicates with Grail; *not* admin-only; *can* be used in dashboards

---

## Review questions
1. When would you choose a dashboard over a notebook, and vice versa?
2. What powers every tile in the new Dashboards app?
3. Can you share a dashboard with someone who has no Dynatrace account?
4. Name four things you can change when editing a dashboard.
5. What symbol connects DQL steps, and what does each step operate on?
6. Write a DQL query that fetches logs and keeps only those containing "error".
7. Do you need admin rights to use DQL? Can DQL be used in dashboards?
8. What's the risk of re-running queries in a historical notebook?
9. Name three ways to filter in the Logs app.
10. How can a beginner get DQL written for them?
11. Does querying data with DQL have licensing implications?

### Answers
1. Dashboard for live, auto-refreshing monitoring; notebook for investigation and preserving a point-in-time snapshot.
2. A DQL query.
3. Yes.
4. Tile titles, chart formats, filters, dashboard name (also default time frame).
5. The pipe `|`; each step works on the output of the previous step.
6. `fetch logs | filter content contains "error"` (or `filter contains(content, "error")`).
7. No; yes.
8. The frozen data may be replaced or lost.
9. Log level, keywords/phrases, security context.
10. Autocomplete/templates, converting Data Explorer charts, or letting the Logs/Traces apps generate queries.
11. Yes, per the course wrap-up.
