# Lesson 2 — Dynatrace Architecture

## Learning objectives
- Explain what **Dynatrace SaaS** means and why it removes infrastructure burden
- Explain what **Grail** is, how it processes data, and how **buckets** organize it
- Describe **Dynatrace Apps** (prebuilt vs. custom-built)
- Identify OneAgent's **monitoring modes** (Full-Stack, Infrastructure, Foundation & Discovery) and when to use each
- Describe the **platforms and environments** OneAgent supports

---

## Key topics and explanations

### 1. The worry this lesson addresses
A new user wonders: *Is my laptop powerful enough? Where does all the data go? Will OneAgent hog my servers' resources processing everything?*

**Answer:** No. Dynatrace is SaaS — storage, processing, and analysis happen in Dynatrace's cloud. OneAgent's job is mainly to **collect and ship** data; the platform does the heavy lifting. You need only a browser and an internet connection.

### 2. Dynatrace as SaaS
- **SaaS (Software as a Service):** software hosted in the cloud and used over the internet instead of installed and run on your own machines.
- The vendor handles **updates, maintenance, and security**; you focus on using it.
- Everyday SaaS examples: Gmail, Google Drive, Spotify in the browser.

### 3. Grail — the data store and analytics engine
- Data volumes keep growing, and users still expect fast answers. Grail is Dynatrace's answer.
- Dynatrace describes Grail as a **causational data lakehouse** with a **massively parallel processing (MPP)** analytics engine.
- **Plain English:** when you query data, Grail recruits dozens or hundreds of helper servers *in parallel* to find, analyze, organize, and return exactly what you asked for — and it can scale the number of helpers to meet demand.
- **Analogy:** the store owner packing every order alone vs. a team fulfilling orders together, much faster.
- Grail stores and connects all collected data — logs, metrics, events, user interactions — so Dynatrace can "connect the dots."

### 4. Buckets
All data in Grail is assigned to **buckets** based on type and purpose. Buckets control:
1. **Retention** — how long data is kept
2. **Access** — who can see it
3. **Organization** — how data is grouped within Dynatrace

**Analogy:** drawers in a filing cabinet; some drawers need a key (permission) to open.

**Example from the lesson:** Team A's app data goes to bucket `App_A`, Team B's to `App_B`. Each team sees only its own bucket. Routine logs might go to a 35-day bucket and more important logs to a 100-day bucket.

**Why limit retention?**
- **Cost** — more retained data consumes more licensing.
- **Security** — separating data by sensitivity and access needs.

### 5. Dynatrace Apps
Interactive applications that run **inside** the Dynatrace platform to extend functionality, visualize data, and build workflows.

| Type | Description | Examples |
|---|---|---|
| **Prebuilt apps** | Ready to use out of the box | Analyzing user sessions, service performance, log exploration; e.g. *Infrastructure & Operations*, *Problems* |
| **Custom-built apps** | Built by your team from scratch for specific business/technical needs; you control what's shown and how | A team-specific app for an internal process |

Note: the word "application" means two things in this course — the *monitored* application (Lesson 1) vs. a *Dynatrace App* running in the platform.

### 6. OneAgent monitoring modes
OneAgent is installed on cloud or on-premises hosts to automatically collect observability data. Not every system needs maximum coverage; lower-priority systems can use a lighter mode to save cost.

| Mode | Host metrics | Process-level data | Service traces / profiling | Typical use |
|---|---|---|---|---|
| **Full-Stack** | ✔ | ✔ | ✔ | Default recommendation; business-critical apps |
| **Infrastructure** | ✔ | ✔ | ✘ | Database servers and other systems where service tracing isn't needed |
| **Foundation & Discovery** | ✔ (essential only) | ✘ | ✘ | Kiosks, POS terminals, endpoints where you just need to confirm availability |

**Details from the wrap-up:**
- **Full-Stack:** host + process metrics, traces and profiling from the service layer; opt-in features like log management and application security.
- **Infrastructure:** host and process metrics; no service-layer tracing or profiling; optional features (e.g. log management) can be enabled.
- **Foundation & Discovery:** lightest footprint; essential host metrics plus **topology** and **host criticality** data. Logs and advanced features are *not on by default* and must be enabled manually.

> ⚠️ Heads-up: the lesson body says Discovery mode captures "metrics and logs about the host," but the wrap-up says logs must be manually activated in Foundation & Discovery. For exam purposes, remember: **lightest mode, host-level only, no process data, no traces; logs not on by default.**

**The layers (previewed here, detailed in Lesson 3):** host → process → service. Each step up in mode adds a layer: Discovery = host; Infrastructure = host + process; Full-Stack = host + process + service.

### 7. Platform and technology support
- OneAgent supports common server OSes (**Windows, Linux**) and cloud/container platforms (**AWS, Azure, Google Cloud, Kubernetes**, and more).
- Each platform has its own install steps — you don't need to memorize them.
- When unsure, check the Dynatrace documentation for supported technologies.

---

## Definitions (glossary)
- **SaaS:** Cloud-hosted software accessed through a browser; the vendor manages infrastructure, updates, and security.
- **Grail:** Dynatrace's data lakehouse with a massively parallel analytics engine that stores, connects, and analyzes observability data in real time.
- **MPP (massively parallel processing):** Splitting a query across many servers working simultaneously.
- **Bucket:** A Grail storage container that controls retention period, access permissions, and organization of data.
- **Retention period:** How long data is kept in a bucket before deletion.
- **Dynatrace App:** An interactive application running inside the Dynatrace platform (prebuilt or custom).
- **Monitoring mode:** The OneAgent setting that determines how much data it collects (Full-Stack, Infrastructure, Foundation & Discovery).

---

## Practical examples
1. **Choosing modes for a retail company:**
   - Online checkout service → Full-Stack (need traces to debug slow purchases)
   - Back-end PostgreSQL servers → Infrastructure (host/process health, no service tracing needed)
   - 600 in-store POS terminals → Foundation & Discovery (just need to know they're up)
2. **Designing buckets:** A bank keeps general app logs in a 35-day bucket for all engineers, and audit/security logs in a long-retention bucket only the security team can read.
3. **SaaS benefit in practice:** A new analyst on a modest laptop opens Dynatrace in a browser and queries a week of logs; the heavy work happens in Grail, not on the laptop or the monitored servers.

---

## Knowledge-check concepts
- What makes Dynatrace SaaS (runs in the cloud, accessed via browser)
- OneAgent's main role (gathering data, not storing it locally or building dashboards)
- Recognizing which items are Dynatrace Apps
- Grail's purpose (store, connect, and analyze observability data in real time)
- What a custom-built app is (built by your team for specific needs, running inside the platform)

---

## Review questions
1. Name three things a SaaS vendor handles so you don't have to.
2. Where does the heavy processing of Dynatrace data happen — on the OneAgent host or elsewhere?
3. Explain Grail's MPP approach using the store-staff analogy.
4. List the three things buckets control.
5. Give two reasons to keep retention periods short.
6. Two teams must not see each other's data. How would you use buckets?
7. What's the difference between a prebuilt and a custom-built Dynatrace App?
8. Which OneAgent mode would you choose for: (a) a payment API, (b) a MySQL server, (c) a digital-signage kiosk?
9. Which monitoring mode is the only one that captures distributed traces?
10. Name four platforms OneAgent supports.
11. True or false: a custom-built Dynatrace App runs outside the Dynatrace platform.

### Answers
1. Updates, maintenance, security (also hosting/infrastructure).
2. In the Dynatrace SaaS platform (Grail); OneAgent mainly collects and sends.
3. Instead of one worker doing everything, many helper servers split the job and work at once, so large queries finish fast; more helpers can be added as demand grows.
4. Retention, access, organization.
5. Lower licensing cost; better security/data separation.
6. Route each team's data to its own bucket and grant each team permission only to its bucket.
7. Prebuilt apps ship ready to use; custom apps are built by your team for unique needs.
8. (a) Full-Stack (b) Infrastructure (c) Foundation & Discovery.
9. Full-Stack.
10. Any four: Windows, Linux, AWS, Azure, Google Cloud, Kubernetes.
11. False — Dynatrace Apps run within the platform.
