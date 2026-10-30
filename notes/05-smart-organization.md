# Lesson 5 — Smart Organization

## Learning objectives
- Explain the concepts and functions of **tags**, **host groups**, **process group detection**, and **naming rules**
- Apply these tools to organize resources and improve visibility in a monitoring setup

---

## Key topics and explanations

### 1. Why organize at all?
With two hosts you can just search. Real enterprise environments have **thousands of hosts, tens of thousands of processes, and hundreds of thousands of services**, often with cryptic names like `svc-1234`, `host-temp-9`, `frontend-test-a9z`. Without structure, finding anything is like digging through a junk drawer.

**Grocery-store analogy:** pasta sauce doesn't belong in the pet-food aisle. Categories make shopping fast; organization makes Dynatrace fast.

**Payoffs:** quick filtering (e.g., search by application ID and see only its hosts/processes/services), more trust in the data, and more efficient **dashboards, alerting, and analysis**.

### 2. The three core organizing tools

| Tool | Purpose (one line) |
|---|---|
| **Host groups** | Group hosts that serve a similar role/function |
| **Naming rules** | Customize how entities are *displayed* |
| **Tags** | Label entities for filtering, grouping, and management |

### 3. Host groups
Group multiple hosts that share a role or function (same team, same application, same environment).

**Why they matter:**
- **Manage settings for the whole group at once** instead of host by host
- Help Dynatrace **separate or group processes more accurately** (process group detection)
- Usable later in **tagging and filtering**

**Worked scenario (from the lesson):**
1. The Astroshop Frontend team has 10 hosts: 5 production, 5 non-production, running identical processes.
2. Because the processes are identical, Dynatrace merges them into **one process group** — prod and non-prod data are mixed.
3. Assign host groups `Astroshop-Frontend-Production` and `Astroshop-Frontend-NonProduction`.
4. **After the processes restart**, Dynatrace splits them into separate process groups per environment.

**Rules to remember:**
- A host belongs to **only one** host group.
- Host groups are defined **during OneAgent installation**.
- Changing a host group typically means **reinstalling OneAgent** with the new group name; advanced users can use command-line tooling (**`oneagentctl`**).
- Processes must **restart** for new process-group separation to take effect.

### 4. Naming rules
Customize **display names** of entities so dashboards and search results are readable at a glance (e.g., `svc-12345` → `OnlineBoutique-LoginService`).

Types covered:
- **Host naming rules**
- **Process group naming rules**
- **Service naming rules**
- **Request naming rules** (clearer names for key business transactions)

Naming rules change how things are *shown*; they don't change what data is collected.

### 5. Tags
Labels you can apply to nearly any entity — hosts, services, applications, and more. Used to:
- **Filter data**
- **Build dashboards**
- **Set alerting conditions**
- **Assign ownership**

Tags are often key–value pairs, e.g., `App: Astroshop`, `Environment: Production`.

**Demo takeaway:** a services list with **245** entries narrowed to **11** after applying an `Astroshop` application tag filter.

---

## Definitions (glossary)
- **Host group:** A named group of hosts sharing a role; assigned at OneAgent install; one per host.
- **Process group detection:** How Dynatrace decides which processes belong in the same process group; influenced by host groups.
- **Naming rule:** A rule that sets a readable display name for hosts, process groups, services, or requests.
- **Tag:** A label (often key:value) applied to entities for filtering, dashboards, alerting, and ownership.
- **oneagentctl:** OneAgent command-line tool, usable to change settings like host group without full reinstall.

---

## Practical examples
1. **Environment split:** Payment API runs identically in prod and staging. Install OneAgent on prod hosts with host group `payments-prod` and on staging with `payments-staging`; restart the services; prod and staging now appear as separate process groups and alerts can target prod only.
2. **Naming cleanup:** A Kubernetes workload shows as `svc-9876`. A service naming rule renames it `Astroshop-CheckoutService` so on-call engineers recognize it instantly.
3. **Tag-driven alerting and ownership:** Tag everything for the checkout flow `Team: Checkout` and `Tier: Critical`. Route problems tagged `Team: Checkout` to that team, and build a dashboard filtered to `Tier: Critical`.
4. **Choosing the right tool:**
   - "I want to change settings for all 40 web servers at once" → host group
   - "This service name is meaningless" → naming rule
   - "I want a dashboard of only production assets owned by Team A" → tags

---

## Knowledge-check concepts
- Why organization matters as environments grow (easier filtering, searching, managing)
- Purpose of a host group (manage settings for hosts sharing a role/function)
- Purpose of tags (label entities for filtering, dashboards, alerting)
- Benefit of naming rules (easier recognition of services, hosts, applications)
- When to define host groups (during OneAgent installation)

---

## Review questions
1. Name the three main organizing tools and give one sentence on each.
2. Why did Dynatrace merge production and non-production processes in the Astroshop example?
3. What two steps fixed the merged process group?
4. How many host groups can one host belong to?
5. When is the best time to assign a host group, and how do you change it later?
6. Do naming rules change what data is collected?
7. List four things tags are used for.
8. Give an example of a key:value tag pair for environment and one for ownership.
9. True or false: organizing your environment automatically improves application performance.

### Answers
1. Host groups (group hosts with a shared role, manage them together); naming rules (readable display names); tags (labels for filtering, dashboards, alerting, ownership).
2. The processes were identical, so process group detection treated them as the same group.
3. Assign separate host groups to prod and non-prod hosts; restart the processes.
4. One.
5. During OneAgent installation; later by reinstalling OneAgent with the new group or using oneagentctl.
6. No — only how entities are displayed.
7. Filtering, dashboards, alerting conditions, ownership.
8. `Environment: Production`; `Owner: TeamCheckout` (any similar).
9. False — it improves findability and management, not app performance.
