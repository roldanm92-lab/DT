# Lesson 4 — Digital Experience Monitoring (DEM)

## Learning objectives
- Describe the purpose and components of **Digital Experience Monitoring** (RUM + Synthetics, plus Session Replay)
- Explain how DEM surfaces performance bottlenecks, downtime, and usability issues on web and mobile
- Explain how RUM data is collected (**auto-injection** vs. **agentless**), what's measured (**visually complete, errors, Apdex**), and how **user actions** and **user sessions** work
- Configure and customize **synthetic monitors**
- Explain **Session Replay** and its privacy model

---

## Key topics and explanations

### 1. Why DEM
Your site "working" isn't the same as it working *well for every user*. Some problems only appear for certain browsers, devices, or regions and are invisible from the server side. DEM shows what users actually experience.

**DEM = Real User Monitoring (RUM) + Synthetic Monitoring**
- **RUM:** observes *real* users.
- **Synthetics:** *simulates* users to proactively test availability and performance — even when nobody is on the site.

### 2. Real User Monitoring (RUM)
Measures front-end performance **from the perspective of actual users** — page loads, clicks, errors, timings. Works for websites, **mobile apps**, and even custom apps such as smart devices (if endpoints are reachable).

**Store analogy:** watching customers from the front door to checkout — who comes in, what they look at, what makes them stay or leave.

#### What RUM measures
- **Visually complete time:** the moment everything *visible on screen* has loaded, even if below-the-fold content is still loading. (YouTube example: player, title, and recommendations appear and you start watching while comments are still loading.)
- **Error rate:** broken images, 404s, 5xx server errors (500, 503).
- **Apdex (Application Performance Index):** an industry-standard (not Dynatrace-specific) user-satisfaction score.

#### Apdex default thresholds (memorize)

| Load time / outcome | Rating |
|---|---|
| 0–3 s | **Satisfied** |
| 3–15 s | **Tolerating** |
| > 15 s **or any error** (e.g., 404) | **Frustrated** |

- An action that errors is **frustrating even if it loads in 0.5 s**.
- Overall score ranges up to a **maximum of 1**; closer to 1 = better.
- Thresholds are **customizable** for the whole app or for specific actions — but per-action thresholds require marking it a **key user action**.

#### How RUM data is collected: auto-injection
1. Browser requests a page; web server builds it.
2. With OneAgent on the web server, OneAgent has the server **insert a JavaScript snippet** (the RUM JavaScript, part of OneAgent) into each page served.
3. The snippet runs in the user's browser and sends experience data back to Dynatrace.

This is **auto-injection**. **Restaurant analogy:** the manager has servers hand out a satisfaction survey card with every meal — except the browser "fills it out" automatically and reliably.

#### Where RUM data goes
Into a Dynatrace **application** entity, routed by **detection rules** (typically URL/domain patterns). E.g., traffic to `astroshop.com` → application "Astroshop."

#### Extra attributes captured
Geolocation (can be **masked** for privacy/compliance), **browser** (Chrome, Edge, Safari…), and **user type** (real user, synthetic, bot). These let you filter: is the problem everywhere, or only in one browser/region/device? (e.g., an error only on Internet Explorer 7 — an outdated browser you may not support.)

### 3. Mobile RUM
- Covers mobile platforms such as **iOS and Android**.
- Same core metrics: load times, errors, Apdex — **plus app crashes**.
- Captures **touch interactions** instead of clicks.
- Uses a **different instrumentation/configuration** than web injection (see Dynatrace mobile docs).

### 4. Agentless RUM
- For when you **can't install OneAgent on the web server**:
  - no access to the server
  - the technology doesn't support auto-injection
  - security policy forbids installing OneAgent
- You **manually insert** the Dynatrace JavaScript snippet into each page you want monitored. **Pages without the snippet aren't monitored.**
- **Data is the same** as auto-injected RUM; only *how the code gets there* differs.

### 5. User actions
Interactions that trigger a request to a web server process.

| Type | Trigger | Example |
|---|---|---|
| **Load action** | Full page load | Home page, login page, search results page |
| **XHR action** | Part of the page updates without full reload | Applying filters, swapping a product image |
| **Custom action** | Defined by you via the **Dynatrace JavaScript API** | Something not captured by default |

- **OpenKit:** for **thick clients** outside a browser (Java, .NET, C) — captures user sessions from installed desktop apps.
- Custom actions are typically planned by the **application team** (what to track) and implemented by the **development team** (placing the code).

#### Key user actions
Mark important actions as **key user actions** to:
- **Customize Apdex thresholds** per action (e.g., login must load < 2 s)
- **Add them to dashboards**
- Get **long-term storage** of that action's data (noted as likely to change with Grail)

**Not retroactive** — only data recorded *after* marking benefits.

#### Deeper analysis tools
- **Waterfall analysis:** the load sequence of page resources (scripts, images, CSS) to pinpoint what slows an action; based on **W3C timing standards** (no proprietary metrics).
- **Error analysis:** JavaScript and request errors tied to specific user actions.
- With **Grail**, RUM data storage/structure evolves, but the concepts stay the same.

### 6. User sessions
A **sequence of interactions by one user** in one or more monitored apps over a period of time (visit, log in, search, buy).
- Captures page loads, payments, errors, navigation, plus: user tags/identifiers, apps visited, screen resolution, browser, OS, device type, and more.

#### User tagging
Label sessions with an identifier such as username or email (e.g., recognizing "Ryan" from a "Welcome Ryan" element). Usually set up by someone who knows the app's code.

#### Behavior analysis
- **Entry and exit points** → find drop-offs (e.g., a failing search page).
- **Bounce rate** → a *bounce* is a session with a single action and immediate exit, often from slowness/poor experience.
- **Expected paths** → are users completing purchases/logins?

#### Conversion goals
Events marking a successful session:
- Reaching a specific page (e.g., "Payment Finish")
- Performing a number of actions
- Staying a minimum time
Most commonly based on a specific user action (e.g., completed purchase).
- New goals can take **~30 minutes** to show results.
- Only **completed** sessions count toward goals.

#### When a web user session ends (memorize)
- **35 minutes** of browser inactivity
- **Browser window closed** (closing a *tab* does not end it)
- **8 hours** of activity (hard limit)
- **More than 200 user actions** → a new session starts on the **201st**
- **`dtrum.endSession()`** called via the JavaScript API (e.g., on logout)

#### Licensing
- Typically **one license unit per session**.
- **Bounce sessions** (single action) are usually **not counted**.
- Terms vary by contract — check with your account rep.

#### Privacy and masking
Dynatrace can mask **email addresses, IP addresses, and locations**. Seeing "masked" means data is hidden by policy **or** you lack permission.

### 7. Synthetic monitoring
Simulates a user visiting your site to check **availability and performance 24/7**, even with zero real traffic. (School-website example: site dies at 2 a.m.; synthetics alert the team before morning.)

Alerts can cover **downtime**, **slow performance**, and **failed logins/broken flows**.

| Monitor type | What it does | Use for |
|---|---|---|
| **Browser monitor** | Loads a single page | Basic uptime/performance of key pages |
| **Browser clickpath** | Replays a multi-step journey (login → search → buy) | Testing whole workflows; requires the **Dynatrace Synthetic Recorder** Chrome extension to record |
| **HTTP monitor** | Calls an API endpoint/URL with no visual page | "Are you there?" checks, like ping/curl |

- Runs from **public Dynatrace locations worldwide** (choose regions like US, Europe, Australia).
- **No OneAgent required.**

**Creating a monitor:** choose type → enter URL → record actions (clickpaths) → pick locations → set frequency (e.g., 5/15/60 min) → save. New monitors can take **15–30 minutes** to become active.

**Licensing drivers:** number of actions, number of locations, and frequency.

#### Customizing synthetics
- **Frequency and locations**
- **Outage handling:** how many consecutive failures raise a problem (e.g., ignore 1, alert on 3 in a row)
- **Performance thresholds:** alert if a page exceeds, say, 3 s
- **On-demand execution:** run now, manually or via **API** for remote execution
- **Credential vault:** store logins securely so teammates can build monitors without seeing passwords
- **Private apps:** either **allowlist Dynatrace synthetic IPs** through your firewall, or run a **private synthetic location** on an **ActiveGate** inside your network

### 8. Session Replay
- **Reconstructs** a user's journey visually from collected data — **not a video/screen recording**.
- Great for hard-to-reproduce front-end issues (button does nothing, endless spinner).
- **Why it matters:** **security** (no sensitive recordings stored) and **efficiency** (far less storage and cost).
- **Masking by default:** text, form fields, images, dropdown values are hidden; you see layout. You can unmask chosen elements (e.g., product images), but **passwords are always masked**.
- Uses: troubleshoot front-end issues, see what preceded an error, speed up support/dev response, keep privacy.

---

## Definitions (glossary)
- **DEM:** Digital Experience Monitoring — RUM + Synthetics (+ Session Replay).
- **RUM:** Measuring front-end performance from real users.
- **Visually complete:** Time until all visible on-screen content has loaded.
- **Apdex:** Satisfied/Tolerating/Frustrated score, max 1.
- **Auto-injection:** OneAgent inserting the RUM JavaScript into served pages.
- **Agentless RUM:** Manually adding the RUM JavaScript to pages.
- **Load / XHR / Custom action:** Full page load / partial update / API-defined action.
- **Key user action:** An action given custom Apdex, dashboard visibility, and long-term storage.
- **OpenKit:** Library for monitoring non-browser thick clients.
- **User session:** All actions by one user during a visit.
- **Bounce:** A session with only one action.
- **Conversion goal:** Event defining a successful session.
- **Synthetic monitor:** Scheduled simulated user/HTTP check.
- **Credential vault:** Secure store for synthetic-monitor credentials.
- **Private synthetic location:** An ActiveGate-hosted synthetic runner inside your network.
- **Session Replay:** Data-based reconstruction of a user's session.

---

## Practical examples
1. **Apdex reasoning:** login loads in 2.1 s → satisfied; search loads in 9 s → tolerating; checkout returns 500 in 0.4 s → frustrated.
2. **Tightening a threshold:** Make "Click on Login" a key user action, then set its satisfied threshold to 2 s.
3. **Browser-specific bug:** JS errors spike. Filter user actions by browser: 100% are Safari 15. Fix the polyfill.
4. **Session-end trivia:** A user opens your site at 9:00, leaves the tab open, and returns at 9:40 → the 9:00 session ended after 35 minutes of inactivity; 9:40 starts a new session.
5. **Synthetic for an internal HR portal:** Not reachable from the internet → deploy a private synthetic location on an internal ActiveGate, store the test account in the credential vault, run a clickpath every 15 min, alert after 3 consecutive failures.
6. **Agentless scenario:** Your marketing site is hosted by a SaaS CMS where you can't install software → paste the Dynatrace RUM snippet into the site template.

---

## Knowledge-check concepts
- What RUM primarily helps you understand (real users' experience and performance)
- When to use Agentless RUM (OneAgent can't be installed on the web server)
- Recognizing a user action (e.g., clicking "Buy Now")
- What a user session represents (a series of interactions during one visit)
- The purpose of synthetic monitoring (simulate users to test availability/performance)
- What Session Replay does (reconstruct experience; not a video)

---

## Review questions
1. What two capabilities make up DEM, and how do they differ?
2. Define "visually complete" in your own words.
3. A page returns a 404 in 0.3 s. What is its Apdex rating, and why?
4. What must you do before you can set a custom Apdex threshold for a single action?
5. Walk through auto-injection in three steps.
6. Name three situations that call for Agentless RUM. Does it collect less data?
7. Classify: (a) navigating to /cart (b) a "Load more reviews" button that updates the page in place (c) a manually instrumented "Print receipt" event.
8. Name the five conditions that end a web user session.
9. Are bounce sessions typically counted for licensing?
10. Which synthetic monitor would you use for (a) a REST health endpoint (b) the homepage (c) a login-search-checkout journey?
11. Do synthetics need OneAgent? How do you test an app that's only reachable inside your network?
12. Why doesn't Session Replay store video, and what is always masked?

### Answers
1. RUM (real users) and Synthetics (simulated users that test proactively, even with no traffic).
2. The moment all content visible on the user's screen has loaded, even if off-screen content is still loading.
3. Frustrated — errors count as frustrating regardless of speed.
4. Mark it as a key user action.
5. Browser requests page → OneAgent has the web server inject the RUM JavaScript → JS reports experience data to Dynatrace.
6. No server access; technology doesn't support injection; security policy forbids OneAgent. No — same data.
7. (a) Load action (b) XHR action (c) Custom action.
8. 35 min inactivity; browser window closed; 8 hours; >200 actions; `dtrum.endSession()`.
9. Usually not.
10. (a) HTTP monitor (b) Browser monitor (c) Browser clickpath.
11. No. Use a private synthetic location on an ActiveGate (or allowlist Dynatrace synthetic IPs).
12. It reconstructs from collected data for security and storage efficiency; passwords are always masked.
