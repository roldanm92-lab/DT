# Cram Sheet and Final Review

## Numbers to memorize

| Fact | Value | Lesson |
|---|---|---|
| Apdex — satisfied | 0–3 s | 4 |
| Apdex — tolerating | 3–15 s | 4 |
| Apdex — frustrated | > 15 s **or any error** | 4 |
| Apdex max score | 1 | 4 |
| Session ends after inactivity | 35 min | 4 |
| Session max duration | 8 hours | 4 |
| Session max actions | 200 (new session on the 201st) | 4 |
| Conversion goal shows results after | ~30 min | 4 |
| New synthetic monitor becomes active in | 15–30 min | 4 |
| Static threshold confirmation | ~3 breaches in 5 min | 6 |
| Baseline first available after | 2 hours | 6 |
| Healthy baseline after | ~1 week | 6 |
| Baseline deviation to trigger anomaly | ≥ 50% above baseline | 6 |
| Default bizevents retention | 35 days | 8 |
| Example log bucket retentions in course | 35 and 100 days | 2 |
| Smartscape layers | 5 | 3 |
| Problem types | 5 | 6 |
| OneAgent monitoring modes | 3 | 2 |
| Synthetic monitor types | 3 | 4 |
| Host groups per host | 1 | 5 |

## Lists to memorize
- **Three pillars:** metrics, logs, traces (+ security, business, deployment events)
- **Smartscape layers (top→bottom):** Applications, Services, Processes, Hosts, Data centers
- **Monitoring modes:** Full-Stack (host+process+service traces), Infrastructure (host+process), Foundation & Discovery (essential host only)
- **Problem types by severity:** Availability > Error > Slowdown > Resource > Custom
- **User action types:** Load, XHR, Custom
- **Synthetic monitors:** Browser (single page), Browser clickpath (journey), HTTP (endpoint)
- **Session end triggers:** 35 min idle, window closed, 8 h, >200 actions, `dtrum.endSession()`
- **Buckets control:** retention, access, organization
- **Organizing tools:** host groups, naming rules, tags
- **Tags used for:** filtering, dashboards, alerting, ownership
- **Problem analysis tools:** Failure analysis, Response time hotspots, Distributed traces, Business impact analysis
- **Dynatrace Intelligence categories:** causal correlation, seasonal baseline, forecast
- **Problem settings:** anomaly detection, alerting profiles, problem notifications, maintenance windows
- **Ways to extend:** Hub apps & extensions, cloud integrations, workflows, log ingestion, AppSec, OpenTelemetry, OneAgent SDK, business events, API, Kubernetes Operator

## Common "which one?" decisions

| Situation | Answer |
|---|---|
| Many servers, too many firewall rules | ActiveGate |
| Need traces/code-level data | Full-Stack mode |
| Database server metrics only | Infrastructure mode |
| Kiosk/POS just needs "is it up?" | Foundation & Discovery |
| See SQL statements | OneAgent on the **calling app server** |
| Can't install OneAgent on web server but want RUM | Agentless RUM |
| Test site at 2 a.m. with no users | Synthetic monitor |
| Test internal-only app with synthetics | Private synthetic location (ActiveGate) or allowlist Dynatrace IPs |
| Custom Apdex for one action | Mark it a key user action |
| Split prod vs. non-prod identical processes | Host groups (+ restart processes) |
| Make `svc-1234` readable | Naming rule |
| Live wall screen | Dashboard |
| Freeze Black Friday data | Notebook |
| Suppress alerts during patching | Maintenance window |
| Send data to Power BI | Dynatrace API |
| Unsupported technology traces | OpenTelemetry |
| Capture cart total on a OneAgent host | OneAgent SDK (or a business event from logs/spans) |
| Extra Tomcat/Kafka metrics | Hub technology extension |
| AWS overview without agents | Cloud integration |
| Monitor Kubernetes | Dynatrace Operator |

## Easily-confused pairs
- **Monitoring vs. observability:** symptoms vs. meaningful, actionable context.
- **Application (IT) vs. application (Dynatrace):** any business software vs. a user-facing web/mobile front end.
- **Dynatrace App vs. monitored application:** an app *inside* the platform vs. the thing you monitor.
- **Process vs. process group:** one running program vs. same-function processes across hosts.
- **Process vs. service:** the employee vs. the task done on request.
- **Load vs. XHR action:** full page load vs. partial in-page update.
- **RUM vs. synthetics:** real vs. simulated users.
- **Session Replay vs. video:** reconstruction from data vs. screen recording (Session Replay is *not* video).
- **Static threshold vs. baseline:** fixed value vs. learned normal.
- **Alerting profile vs. problem notification:** *which* problems vs. *how* they're sent.
- **Dashboard vs. notebook:** live vs. snapshot.
- **OpenTelemetry vs. OneAgent SDK:** open standard / works without OneAgent vs. extra data on OneAgent hosts.
- **Dynatrace Intelligence vs. Davis AI:** same AI engine, two names in the course.

---

## 40-question mixed final review
*(Original questions. Answers at the end.)*

1. What is the main job of OneAgent?
2. Why does an ActiveGate reduce firewall complexity?
3. Which pillar shows where time was spent in a single request?
4. What does "tool consolidation" save besides license costs?
5. What does SaaS mean for where Dynatrace data is processed?
6. Grail uses what processing approach to answer large queries quickly?
7. Which three things do buckets control?
8. Which OneAgent mode is the recommended default?
9. Which mode would you choose for a database host whose queries are already captured from the app servers?
10. Name the Smartscape layer between Services and Hosts.
11. Why might a service be missing from a 15-minute view?
12. Where do you install OneAgent to see database queries?
13. What happens to existing "My Web Application" traffic after a new detection rule?
14. Which action type is a filter that updates a product list without reloading?
15. A page loads in 4 s. Apdex rating?
16. A page returns a 500 error in 0.2 s. Apdex rating?
17. What's required before giving a single action a custom Apdex threshold?
18. What is "visually complete"?
19. Give two reasons to use Agentless RUM.
20. What does mobile RUM capture that web RUM doesn't emphasize?
21. Does closing a browser tab end a user session?
22. What happens on a user's 201st action?
23. Are bounce sessions usually licensed?
24. Which synthetic monitor needs a Chrome recorder extension?
25. Do synthetics require OneAgent?
26. Where do you store synthetic login credentials securely?
27. What is always masked in Session Replay?
28. When are host groups assigned?
29. What must happen after assigning host groups for process groups to split?
30. List four uses of tags.
31. Does Dynatrace open a new problem for every anomaly?
32. A service baseline is 2 s. At roughly what sustained value is an anomaly flagged?
33. Which problem type is most severe?
34. What does Dynatrace use to group related anomalies and avoid alert storms?
35. First tool for a slowdown? First tool for an error spike?
36. What's a maintenance window for?
37. What connects steps in a DQL query?
38. Which app captures point-in-time data and doesn't auto-refresh?
39. Does Dynatrace auto-activate all Hub extensions when OneAgent is installed?
40. Which Kubernetes component deploys OneAgent and reports status?

### Answers
1. Automatically collect logs, metrics, traces, events from the host and send them to Dynatrace.
2. Many OneAgents send to the ActiveGate; only it needs a path out to Dynatrace (one-way, encrypted, routed).
3. Traces.
4. Time and effort: fewer installs, configs, updates, interfaces to learn and switch between.
5. In Dynatrace's cloud, not on your machines.
6. Massively parallel processing (many helper servers at once).
7. Retention, access, organization.
8. Full-Stack.
9. Infrastructure mode.
10. Processes.
11. It received no requests in that window.
12. On the application server making the calls.
13. It stays in "My Web Application"; rules apply to new traffic only.
14. XHR action.
15. Tolerating.
16. Frustrated.
17. Mark it as a key user action.
18. When all content visible on screen has loaded.
19. Any two: no server access; tech doesn't support injection; security policy forbids OneAgent.
20. App crashes and touch interactions.
21. No — closing the browser window does.
22. A new session starts.
23. Usually not.
24. Browser clickpath.
25. No.
26. The credential vault.
27. Passwords.
28. During OneAgent installation.
29. The processes must restart.
30. Filtering, dashboards, alerting, ownership.
31. No — related anomalies attach to an existing problem.
32. Above 3 s (50% over baseline).
33. Availability.
34. Smartscape topology (via Dynatrace Intelligence / Davis AI).
35. Response Time Hotspots; Failure Analysis.
36. Suppress alerts/synthetics during planned downtime.
37. The pipe `|`.
38. Notebooks.
39. No.
40. The Dynatrace Operator.
