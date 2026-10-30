# Lesson 8 — Extending Dynatrace

## Learning objectives
- Identify the options available to **extend** Dynatrace
- Explain what each option offers and **when** to use it: Hub apps and extensions, cloud integrations, workflows, log ingestion, application security, OpenTelemetry, OneAgent SDK, business events, the API, and Kubernetes monitoring

---

## Key topics and explanations

### 1. Why extend?
Like a smartphone, Dynatrace does a lot out of the box (RUM, metrics, logs, traces), but no two customers use the same technologies or need the same depth. **Not everything is on by default** — turning everything on would collect unneeded data and clutter the UI. You **enable what you need, when you need it.** You adapt the tool to your business, not the other way round.

### 2. Dynatrace Hub — the "app store"
Browse and activate:
- **Pre-built public apps** (e.g., *Learn DQL*) — search, then *Install*.
- **Technology extensions** (e.g., *Tomcat*, *Kafka*).

**How a technology extension works (Tomcat example):**
- Tells **OneAgent** to collect extra Tomcat-specific metrics (thread counts, request volumes); an **ActiveGate** can also gather them **remotely**.
- Data appears on a **pre-made dashboard** and in entities such as **custom devices**.
- Not listed in the Hub? **Custom extensions** can ingest data from almost any technology.

### 3. Cloud integrations
- Monitor **AWS, Azure**, and other cloud platforms **without installing OneAgent** on those cloud hosts.
- You get a **high-level view**: metadata (instance names, tags) and basic infrastructure metrics.
- For **logs, process metrics, services, traces**, you still need **OneAgent**.
- Great complement for distributed or hybrid cloud estates.

### 4. Workflows
Automate tasks inside Dynatrace — a step-by-step script builder. Examples:
- Push external log data into Dynatrace
- Trigger an alert when a threshold is breached
- Call a webhook
- Pull external data on a schedule (the course's playful example: fetch "cat facts" from an API every 10 minutes and store them as logs)

Workflows are also an option for **sending problem notifications** (from Lesson 6).

### 5. Log ingestion, masking, and access
- **Ingest from many sources**, not just OneAgent — e.g., a network device that can't run OneAgent can send logs to the **Dynatrace API**.
- **Choose what gets stored** — filter out noise to control volume.
- **Mask sensitive data** (tokens, API keys, sensitive code info) **during ingestion**.
- **Role-based access** to log types.
- **Reduce storage** — exclude low-priority logs, retain only high-value data → lower licensing cost.

### 6. Application Security
Dynatrace analyzes code **at runtime** (not just static scanning), so it knows which code is *actually used* and alerts on vulnerable third-party libraries. Two capabilities:
- **Runtime Vulnerability Analytics** — flags known vulnerabilities in third-party libraries/frameworks.
- **Runtime Application Protection** — blocks live attacks such as SQL injection (the course also mentions DDoS attempts).

Each vulnerability gets a **DSS (Dynatrace Security Score)**, calculated with partner **Snyk** plus Dynatrace Intelligence's understanding of **topology** — so teams can prioritize what's most critical or most widespread.

### 7. OpenTelemetry and the OneAgent SDK

| Need | Tool |
|---|---|
| Add custom spans/traces (a specific method, header, or value) | **OpenTelemetry** |
| Monitor a host/tech where OneAgent **can't be installed or isn't supported** | **OpenTelemetry** (collect externally, send to Dynatrace) |
| Capture specific request-level data (e.g., cart total) on hosts **already running OneAgent** | **OneAgent SDK** |

Dynatrace **merges** native, OpenTelemetry, and SDK data into **unified traces**.

### 8. Business events (bizevents)
Pull an important business value (user ID, cart value, membership tier, transaction amount) out of a **log or span**:
1. **Source:** a log or span holds the value.
2. **Create a rule:** what to look for and where.
3. **Extract** the single value from the larger data.
4. **Save as a business event** — often configured by admins, visible to all users.
5. **Query and visualize** with DQL, dashboards, notebooks.

Default storage: if no custom bucket, the **default bizevents bucket retains them for 35 days**.

### 9. Dynatrace API
Manage Dynatrace **programmatically**:
- Create/configure dashboards
- Pull logs and metrics
- Modify settings
- **Push data to third-party tools** (Power BI, Excel)

Rule of thumb: **anything you can do in the UI, you can do via the API.** Use it to automate settings changes, migrate dashboards between environments, or extract data.

### 10. Kubernetes (the food-truck festival analogy)

| Kubernetes concept | Analogy | Meaning |
|---|---|---|
| **Container** | A food-truck "station"/worker focused on one job | Runs one specific process with just what it needs |
| **Pod** | The food truck | Wraps one or more containers |
| **Containers in a pod** | Employees in the truck | Each does a specific job |
| **Node** | The food-truck lot | A machine hosting many pods |
| **Cluster** | The whole festival | Many nodes working together |
| **Dynatrace Operator** | The monitoring crew | Installs OneAgent, collects metrics, reports status to Dynatrace |

**Kubernetes monitoring is handled by the Dynatrace Operator.**

---

## Definitions (glossary)
- **Dynatrace Hub:** In-product catalog to install apps and activate extensions.
- **Extension:** Add-on that collects extra data for a technology (via OneAgent or ActiveGate).
- **Custom device:** Entity representing data from an extension (e.g., a device without OneAgent).
- **Cloud integration:** Agentless connection to a cloud provider for metadata and basic metrics.
- **Workflow:** Automated sequence of steps triggered by schedules or conditions.
- **Log ingestion:** Bringing logs into Dynatrace from OneAgent or other sources (e.g., API).
- **DSS:** Dynatrace Security Score for prioritizing vulnerabilities.
- **OpenTelemetry:** Open standard for generating and sending traces/metrics/logs.
- **OneAgent SDK:** Library to add custom request-level data on OneAgent-monitored processes.
- **Business event:** A business value extracted from logs/spans into its own queryable record.
- **Dynatrace API:** Programmatic interface for configuration and data access.
- **Dynatrace Operator:** Kubernetes component that deploys and manages Dynatrace monitoring.

---

## Practical examples
1. **Kafka gap:** Brokers show host/process data but no Kafka-specific metrics → activate the Kafka extension from the Hub and use its dashboard.
2. **Legacy firewall logs:** The firewall can't run OneAgent → send its logs to the Dynatrace log-ingest API; add masking rules for IPs/tokens and drop debug-level lines to save cost.
3. **Revenue tracking:** Checkout requests carry `cartTotal` in the body → create a business event rule to extract it, then chart revenue per hour with DQL on a dashboard.
4. **Unsupported service:** A Rust microservice isn't auto-instrumented → instrument it with OpenTelemetry and export spans to Dynatrace; they stitch into the end-to-end trace.
5. **Automation:** A workflow posts to a Slack channel and calls a ticketing webhook whenever a problem tagged `Tier: Critical` opens.
6. **Reporting:** Finance wants weekly checkout numbers in Power BI → pull metrics via the Dynatrace API on a schedule.
7. **Kubernetes:** Deploy the Dynatrace Operator into the cluster; it rolls out OneAgent and reports node, pod, and container health.

---

## Knowledge-check concepts
- Purpose of the Dynatrace Hub (install extensions and apps)
- Whether all extensions activate automatically with OneAgent (no — you enable what you need)
- Purpose of OpenTelemetry (gather data from technologies not monitored natively / custom traces)
- What workflows do (schedule/automate tasks in response to conditions)
- Which tool pushes data to Power BI/Excel (the Dynatrace API)

---

## Review questions
1. Why isn't every extension and feature enabled by default?
2. What two kinds of things can you get from the Dynatrace Hub?
3. Where do you see data collected by a technology extension?
4. What does a cloud integration give you without OneAgent, and what does it *not* give you?
5. Give three examples of what a workflow can do.
6. A switch can't run OneAgent. How can its logs reach Dynatrace?
7. Name three log controls available at ingestion.
8. What are the two runtime application security capabilities, and what does DSS help with?
9. When would you choose OpenTelemetry vs. the OneAgent SDK?
10. List the five steps for creating a business event. Where are bizevents stored by default, and for how long?
11. Name three things you can do with the Dynatrace API.
12. Map: container, pod, node, cluster, Dynatrace Operator → food-truck festival terms.

### Answers
1. To avoid collecting unnecessary data and cluttering the UI; you enable what fits your stack.
2. Pre-built apps and technology extensions.
3. On the extension's pre-made dashboard and in entities such as custom devices.
4. Gives metadata and basic infrastructure metrics; does not give logs, process metrics, services, or traces (need OneAgent).
5. Any three: ingest external logs, trigger alerts on thresholds, call webhooks, pull external API data on a schedule, send problem notifications.
6. Send them to the Dynatrace API for log ingestion.
7. Choose what's stored, mask sensitive data, role-based access (also exclude low-priority logs).
8. Runtime Vulnerability Analytics and Runtime Application Protection; DSS prioritizes vulnerabilities by severity and environmental impact.
9. OpenTelemetry for custom spans or when OneAgent can't be used/tech unsupported; OneAgent SDK for extra request-level data on hosts already running OneAgent.
10. Source (log/span) → create rule → extract value → save as business event → query/visualize. Default bizevents bucket, 35 days.
11. Any three: create/configure dashboards, pull logs/metrics, modify settings, push data to Power BI/Excel, migrate dashboards.
12. Container → focused worker/station; pod → food truck; node → food-truck lot; cluster → whole festival; Operator → monitoring crew.
