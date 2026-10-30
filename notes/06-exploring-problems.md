# Lesson 6 — Exploring Problems

## Learning objectives
- Identify how problems are triggered: **anomaly detection**, **static thresholds**, and **auto-adaptive baselines**
- Explain the role of **Dynatrace Intelligence** (formerly branded **Davis AI**) in finding root causes and generating insights
- Demonstrate the basics of **troubleshooting** a problem in Dynatrace

---

## Key topics and explanations

### 1. The story: subtle slowdowns
Nothing is "broken" — no red errors, CPU and memory look mostly fine — but checkout response times have crept above normal and users are frustrated. Dynatrace's **baselines** know this isn't normal. Instead of alerting on every blip, it waits for a **real, sustained** deviation, then raises **one problem** that connects the chain: *database struggling → app slows → pages delayed*, with the database as root cause. No alert storm.

### 2. Anomalies → problems
- An **anomaly** is a meaningful change signaling something bigger — in Dynatrace terms, a metric **breaching a threshold**.
- When an anomaly is detected, Dynatrace either **creates a new problem** or **attaches it to an existing related problem**. It does **not** open a new problem for every anomaly.

Two kinds of thresholds:

#### Static thresholds
- A **fixed value**; crossing above (or, if configured, below) it is an anomaly. E.g., CPU > 90–95%, or traffic dropping below a minimum.
- Dynatrace **doesn't fire on a single spike**: it confirms the condition persists — typically **3 breaches within a 5-minute window** — before raising a problem.
- **Used out of the box for infrastructure metrics:** CPU %, memory usage, garbage collection, etc.

#### Auto-adaptive thresholds (baselines)
- Dynatrace **learns normal behavior per service/application** and sets tailored expectations (e.g., this service normally responds in 1 s; this app normally has a 1.4% failure rate).
- **Timeline:** initial baseline after **2 hours** of monitoring; refined **daily**; a truly healthy baseline after about **1 week** of continuous traffic.
- **Trigger rule:** an anomaly is significant when the metric is **at least 50% above baseline** (baseline 1 s → anomaly above **1.5 s**) and the deviation is **sustained**.
- **Used for:** response time increases, failure rate increases, and traffic increases/decreases for **applications and services**.
- **Restaurant analogy:** a 20-minute wait is a red flag at a fast-food counter but normal at a fine-dining restaurant. Normal depends on the system.

| | Static threshold | Auto-adaptive baseline |
|---|---|---|
| Value | Fixed, set by a person/default | Learned from history, updates automatically |
| Default use | Infrastructure metrics (CPU, memory, GC) | App/service response time, failure rate, traffic |
| Strength | Simple | Accurate, fewer false alarms |
| Trigger | ~3 breaches in 5 min | ≥ 50% above baseline, sustained |

### 3. Problem types (by severity, highest first)

| Severity | Type | Example |
|---|---|---|
| 1 (most critical) | **Availability** | A host or synthetic monitor is unavailable |
| 2 | **Error** | Rising error/failure rate |
| 3 | **Slowdown** | Page or service getting slower |
| 4 | **Resource** | High CPU or memory |
| 5 | **Custom** | User-defined; can be set to any severity, or to "custom" (lowest priority) |

Each type has its own icon. Other **event types** (info, monitoring unavailable, process restart, deployment change, etc.) can appear **inside** problems for context but are **not problem types**.

> Memory aid: **"All Errors Slow Resources Customarily"** — Availability, Error, Slowdown, Resource, Custom.

### 4. Exploring a problem
An open problem shows:
- **Who** is impacted (users)
- **What** is impacted (entities)
- **Why** it happened (suggested root cause)

Dynatrace **suggests** the root cause — you should still investigate and **validate**.

### 5. Root cause analysis and alert storms
Using **Smartscape topology**, Dynatrace knows how components depend on each other and **groups related anomalies into one problem**.

Example: DB has CPU trouble → app servers depending on it slow down → web servers waiting on the apps slow down. Traditional monitoring = three (or thirty) alerts and tickets: an **alert storm**. Dynatrace = **one problem**, root cause = **database**.

**Analogy:** after a storm the outage is obvious; finding the actual downed power line takes investigation. Dynatrace finds the "fallen line" fast.

### 6. Tools for analyzing problems

| Tool | Best for |
|---|---|
| **Failure analysis** | Spikes in application errors |
| **Response time hotspots** | Which services/methods cause slowdowns |
| **Distributed traces** | Breaking a request down to see where delay happens |
| **Business impact analysis** | Which users were affected and how |

**Troubleshooting approach:**
1. **Follow the red lines** in the problem view toward the root cause.
2. **Start broad** — look at impacted entities and overall health first, then move to the suggested root-cause entity (don't jump straight into code-level data).
3. **Narrow down** — Response Time Hotspots for slowdowns; Failure (rate) Analysis for errors.

### 7. Dynatrace Intelligence (Davis AI)
The AI engine behind detection and analysis. Capabilities by category:
- **Causal correlation analysis:** detects anomalies, determines root causes, groups related problems, understands topology.
- **Seasonal baseline:** creates auto-adaptive thresholds and learns **seasonal** behavior of metrics.
- **Forecast analysis:** predicts future metric values in **dashboards and notebooks**.

> Naming note: the course body calls it **Dynatrace Intelligence**; the wrap-up and resources call it **Davis AI**. Treat them as the same engine.

### 8. Problem settings
- **Anomaly detection settings:** tune when/how anomalies trigger; set **globally or per entity**.
- **Alerting profiles:** control **which** problems trigger notifications.
- **Problem notifications:** **how** alerts are delivered — email, Slack, PagerDuty, etc. (Also possible via **Workflows**, covered later.)
- **Maintenance windows:** suppress alerts and/or specific synthetic tests during **planned downtime** to avoid false alarms.

---

## Definitions (glossary)
- **Anomaly:** A metric breaching a threshold in a meaningful way.
- **Problem:** Dynatrace's grouped representation of one or more related anomalies, with impact and root cause.
- **Static threshold:** A fixed limit.
- **Baseline / auto-adaptive threshold:** A learned "normal" per entity.
- **Alert storm:** A flood of separate alerts/tickets for one underlying issue.
- **Root cause:** The underlying entity/condition causing the chain of symptoms.
- **Alerting profile:** Filter deciding which problems notify whom.
- **Maintenance window:** A scheduled period where alerting is suppressed.
- **Dynatrace Intelligence / Davis AI:** Dynatrace's AI engine for baselining, detection, grouping, root cause, and forecasting.

---

## Practical examples
1. **Baseline math:** service baseline 400 ms → anomaly once sustained above **600 ms**. Baseline 2 s → above **3 s**.
2. **Static vs. baseline choice:** Disk-full alert on a log server → static threshold (e.g., > 90%). Checkout response time → baseline (normal differs by service and time of day).
3. **Reading a problem:** Problem "Response time degradation — Checkout service." Impacted: 3 services, 1 application, ~1,200 users. Root cause: `orders-db` host CPU saturation. Start broad (confirm impact), open the DB host (confirm CPU), then use Response Time Hotspots on checkout to verify time is spent in DB calls.
4. **Maintenance window:** You patch servers Saturday 01:00–03:00. Set a maintenance window to suppress alerts and pause the login synthetic during that time.
5. **Routing alerts:** An alerting profile sends only Availability and Error problems tagged `Tier: Critical` to PagerDuty; Resource problems go to a Slack channel.

---

## Knowledge-check concepts
- Whether Dynatrace creates a new problem for every anomaly (no — related anomalies attach to existing problems)
- Recognizing problem types (Availability, Error, Slowdown, Resource, Custom) vs. distractors
- Static vs. auto-adaptive thresholds (adaptive adjusts to normal behavior)
- Default baseline deviation needed for an anomaly (**50%**)
- How Dynatrace groups anomalies into problems and uses AI to find root cause

---

## Review questions
1. What must happen before Dynatrace can create a problem?
2. A related anomaly appears while a problem is already open. What does Dynatrace do?
3. How many breaches, in what window, typically confirm a static threshold problem?
4. How long until a baseline first exists, and how long until it's considered healthy?
5. A service's baseline is 800 ms. Above what value is a sustained anomaly flagged?
6. Which metrics use static thresholds by default? Which use baselines?
7. List the five problem types from most to least severe.
8. Is "deployment change" a problem type?
9. What is an alert storm, and how does Dynatrace avoid it?
10. Which tool would you use first for (a) a slowdown (b) an error spike (c) "how many customers were hit?"
11. Describe the three-step troubleshooting approach.
12. What are the three capability categories of Dynatrace Intelligence?
13. What's the difference between an alerting profile and a problem notification?
14. Why use a maintenance window?

### Answers
1. An anomaly must be detected (a threshold breach).
2. Links it to the existing problem.
3. About 3 breaches within 5 minutes.
4. 2 hours; about 1 week.
5. 1,200 ms (50% above).
6. Static: infrastructure (CPU, memory, GC). Baselines: response time, failure rate, traffic for apps/services.
7. Availability, Error, Slowdown, Resource, Custom.
8. No — it's an event type that can provide context within a problem.
9. Many separate alerts for one underlying issue; Dynatrace uses topology to group them into one problem with a root cause.
10. (a) Response Time Hotspots (b) Failure Analysis (c) Business Impact Analysis.
11. Follow the red lines; start broad with impacted entities; narrow down with the specific analysis tool.
12. Causal correlation analysis, seasonal baseline, forecast analysis.
13. Alerting profile = *which* problems notify; problem notification = *how/where* they are sent.
14. To suppress alerts (and optionally synthetics) during planned downtime and avoid false alarms.
