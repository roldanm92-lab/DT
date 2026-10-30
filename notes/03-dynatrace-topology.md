# Lesson 3 — Dynatrace Topology (Smartscape)

## Learning objectives
- Explain how Dynatrace topology maps IT components, their relationships, and data flows
- Navigate **Smartscape** and its layers, and explain how it shows dependencies and real-time changes
- Define **host, process, process group, service, database (as a service), and application** in Dynatrace terms
- Know where to install OneAgent to see **database queries**
- Explain **web application detection rules**, **user/XHR/custom actions**, and **Apdex**

---

## Key topics and explanations

### 1. What topology is and why it matters
- **Topology (computing):** how devices or components are arranged and connected — a map of who talks to whom.
- **Office printer analogy:** laptops, desktops, tablets, phones all send jobs to one shared printer. When printing fails for everyone, knowing the layout tells you the shared printer is the common link — so you check it first instead of every computer one by one.
- **Why it matters:** topology turns "something's broken" into "here's the shared dependency, start there." Fewer guesses, faster fixes, better planning.

### 2. Smartscape
- Dynatrace **automatically discovers** components and builds a **real-time, interactive map** of the environment and how components interact.
- Full-stack visibility from **user clicks down to infrastructure**, across dynamic, hybrid, and multi-cloud environments.
- Shows **who communicates with whom** and **what's affected** when something fails.

**The five Smartscape layers (top to bottom):**
1. **Applications** — user-facing front ends
2. **Services** — server-side code handling requests
3. **Processes** — running programs
4. **Hosts** — machines running OneAgent
5. **Data centers** — physical/virtual locations of hosts

> Memory aid (top → bottom): **"All Stars Pass Heavy Data"** — Applications, Services, Processes, Hosts, Data centers.

Databases are *not* a separate layer; they're monitored as a **special type of service**.

### 3. Hosts
- **Definition:** a physical, virtual, or cloud instance running an operating system — in practice, any computer/server with OneAgent installed (web server, DB server, even a laptop).
- On install, OneAgent immediately collects host **vital signs**: CPU, memory, disk activity, running processes.
- **Doctor analogy:** a doctor checks heart rate, oxygen, blood pressure; OneAgent checks a host's vitals.
- Questions host data answers: Is it normal? Overloaded or underperforming? Showing early warning signs?

### 4. Processes and process groups
- **Process:** a running program on a host (e.g., a browser, a Tomcat web-server process, a Docker/Kubernetes container). Processes act as containers that host services.
  - *Foreground* processes: you see and interact with them.
  - *Background* processes: run quietly behind the scenes.
- **Analogy:** one sales associate with a specific job in the store.
- **Process group:** a logical cluster of processes that perform the **same function** for the same application/deployment, usually across **multiple hosts**.
  - Example: three web servers all serving the same site → one process group.
  - **Analogy:** the whole team of sales associates. If one takes a break, others cover — redundancy and scale.

### 5. Services
- **Definition:** server-side code executed within a process group. When a process handles a **request**, Dynatrace groups that request data into a **service**.
- **Analogy:** if the process is the employee, the service is the specific task performed in response to a customer request ("I'd like a compact beginner telescope" → employee fetches it).
- **Key behavior:** nothing happens without a request. **Services only appear for timeframes in which they received requests** — no requests, no service data.
- Common examples: loading a web page, processing a payment (often split into smaller services, e.g., a "charge card" service), logging in, answering API requests.
- What Dynatrace shows for services: which requests occurred, how long they took, which process handled them, and **code-level** detail (which methods consumed the most time), plus failures and dependencies.

### 6. Databases
- Monitored as a **special type of service**, not a separate Smartscape layer.
- Dynatrace captures the **queries/statements** sent to the database, how long they took, and errors — **from the calling side**.
- **Therefore: install OneAgent on the application/middleware server that makes the database calls** to see the queries (code-level visibility).

**Stockroom analogy:** the database is the stockroom; the app server is the sales associate who goes in to fetch items.

| OneAgent installed on… | What you can see |
|---|---|
| **Database only** | That the database is busy — but not *what* was requested or by whom |
| **App server only** | What was asked of the DB and how long it took — not how the DB handled it internally |
| **Both** | The complete picture: request, handling, and timing |

**Recommended setup:** OneAgent on the app server (Full-Stack, for queries) **and** on the database host in **Infrastructure mode** (for host/process metrics). Full-Stack on the DB host adds no extra query detail, so Infrastructure mode gives the same useful visibility at lower license cost. (Confirm licensing specifics with your Dynatrace rep.)

### 7. Applications (web/mobile)
- **IT meaning of "application":** any business software, including back-end systems.
- **Dynatrace meaning:** a **user-facing** browser or mobile front end — software real users interact with directly. Back-end systems without a UI are *not* applications in Dynatrace.
- Data is collected from the **user's browser**: page load time, whether content rendered correctly, errors.
- **Requirement:** OneAgent in **Full-Stack** mode on the **web servers** that serve the pages. (Mobile monitoring is covered in Lesson 4.)

**Action types:**

| Action type | What it is | Example |
|---|---|---|
| **User action** | A click/interaction the user performs | Clicking a Login button |
| **XHR action** | A background request that updates part of a page without a full reload | Clicking "Next" in a photo gallery |
| **Custom action** | A business-specific action you track manually via the Dynatrace JavaScript API / OpenKit | Tracking PDF downloads |

**Web application detection rules:**
- By default all web traffic lands in one application called **"My Web Application."**
- Create **detection rules** (usually by **domain or URL pattern**) to split traffic into specific applications.
- After rules are added, **new** traffic is grouped correctly; **old** traffic stays in "My Web Application" (rules aren't retroactive).

**Apdex (Application Performance Index):** a user-experience score Dynatrace assigns to each user session and action based on how smooth or frustrating it was — like a store manager judging whether a customer's visit went well.

### 8. Monitoring modes revisited
Now that layers are defined: Full-Stack covers host + process + service; the two lightweight modes focus on host infrastructure:
- **Infrastructure Monitoring mode:** essential host metrics without deep application-level insight.
- **Discovery mode:** minimal data collection — ideal for **identifying and inventorying hosts** with minimal resource use.
- A common reason to switch modes: **reduce licensing cost** while still monitoring essentials.

---

## Definitions (glossary)
- **Topology:** Arrangement and connections of components.
- **Smartscape:** Dynatrace's automatic, real-time, layered topology map.
- **Host:** Physical/virtual/cloud instance with an OS (and OneAgent).
- **Process:** A running program on a host; contains services.
- **Process group:** Processes performing the same function, usually across hosts.
- **Service:** Server-side code in a process group that handles requests.
- **Database service:** A special service type representing database calls, seen from the calling application.
- **Application (Dynatrace):** A user-facing web or mobile front end.
- **User action / XHR action / Custom action:** See table above.
- **Detection rule:** A rule (domain/URL based) that assigns web traffic to a named application.
- **Apdex:** Application Performance Index; a satisfaction rating for sessions and actions.

---

## Practical examples
1. **Smartscape troubleshooting:** Checkout is slow. In Smartscape you follow *Checkout app → checkout-service → payment-service → orders-db*. The payment service shows normal times, but calls to `orders-db` jumped from 40 ms to 2 s. You now know where to look.
2. **Process group redundancy:** `nginx` runs on web-01, web-02, web-03 → one process group. web-02 restarts for patching; the group still serves traffic.
3. **"Where's my service?"** You open the last 15 minutes at 3 a.m. and a nightly-export service is missing. It runs at 1 a.m.; widen the timeframe and it appears — services show only when they received requests.
4. **Detection rules:** traffic for `shop.example.com` and `support.example.com` all sits in "My Web Application." Add rules for each domain. From now on they appear as "Shop" and "Support"; last week's data stays in "My Web Application."
5. **DB visibility:** A team installed OneAgent only on the Oracle server and wonders why they can't see SQL statements. Fix: install Full-Stack on the app servers calling Oracle; set the Oracle host to Infrastructure mode.

---

## Knowledge-check concepts
- Definition of topology
- Identifying Smartscape layers (and rejecting distractors like firewalls or logs)
- A service = a process handling a request (true)
- Where to install OneAgent for database queries (the calling app server)
- Why switch monitoring modes (reduce licensing cost while keeping essentials)
- Mapping interactions to user / XHR / custom actions
- What the printer analogy illustrates (how components connect and interact)

---

## Review questions
1. Name the five Smartscape layers from top to bottom.
2. Why aren't databases a separate Smartscape layer?
3. What is the difference between a process and a process group?
4. Why might a service not appear in Dynatrace for a given timeframe?
5. You want to see slow SQL queries. Where must OneAgent be installed, and in what mode?
6. What do you see if OneAgent is installed *only* on the database host?
7. What does Dynatrace call a user-facing browser or mobile front end? Is a back-end batch system one of these?
8. Classify: (a) clicking "Add to cart" (b) a dropdown that fetches city names as you type without reloading (c) a manually instrumented "Download invoice" event.
9. What happens to old traffic in "My Web Application" after you add a detection rule?
10. What is Apdex used for?
11. Which mode is best for simply inventorying hosts with minimal overhead?

### Answers
1. Applications, Services, Processes, Hosts, Data centers.
2. They're monitored as a special type of service, via calls from application processes.
3. A process is one running program; a process group is a set of processes doing the same job, usually across several hosts.
4. No requests were received in that timeframe.
5. On the application server(s) making the calls, in Full-Stack mode (plus Infrastructure mode on the DB host for its metrics).
6. That the database is active, but not what queries were made or by whom.
7. An application; no — back-end systems without a UI aren't applications in Dynatrace.
8. (a) User action (b) XHR action (c) Custom action.
9. It stays there; only new traffic is regrouped.
10. Rating user experience for sessions and actions (satisfied vs. frustrated).
11. Discovery (Foundation & Discovery) mode.
