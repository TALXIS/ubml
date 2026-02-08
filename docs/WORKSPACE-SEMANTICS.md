# UBML Workspace Anatomy

> A high-level map of what a UBML workspace contains and how its parts relate.
> For binding design rules see [PRINCIPLES.md](PRINCIPLES.md). For notation details see the [schema reference](../schemas/README.md).

---

## Purpose

A UBML workspace is a **digital twin of an organization** — a long-lived, version-controlled collection of files that captures how a business creates and delivers value. This document describes the conceptual areas within a workspace and how they connect, without prescribing schema details.

---

## Conceptual Layers

A workspace is organized into five broad layers. Each layer builds on the ones below it.

```
┌─────────────────────────────────────────────────────────────┐
│                        STRATEGY                             │
│       Why the organization exists and where it's going      │
├─────────────────────────────────────────────────────────────┤
│                     CHANGE & ANALYSIS                       │
│     Hypotheses, scenarios, metrics, and improvement cases   │
├─────────────────────────────────────────────────────────────┤
│                     OPERATIONAL MODEL                       │
│         Processes, actors, information, and resources       │
├─────────────────────────────────────────────────────────────┤
│                       KNOWLEDGE                             │
│       Sources, insights, and shared vocabulary              │
├─────────────────────────────────────────────────────────────┤
│                       WORKSPACE                             │
│            Configuration, scope, and conventions            │
└─────────────────────────────────────────────────────────────┘
```

Information flows in both directions: knowledge feeds the model, the model informs analysis, analysis shapes strategy — and strategic priorities direct where to gather more knowledge.

---

## Layer 1: Workspace

The **workspace file** is the entry point. It names the project, defines organizational context, sets scope boundaries, and declares which files belong to the model.

A workspace is a self-contained unit. Everything needed to understand a business area lives inside it or is explicitly referenced from it.

---

## Layer 2: Knowledge

The knowledge layer captures **where information comes from** and **what was learned from it**. It exists to answer a fundamental question: *why does the model say what it says?*

### Sources

Catalogs of external artifacts — interviews, workshops, meeting notes, documents, research, surveys, system exports. The workspace records metadata about each source (who, when, what kind) but does not store the artifacts themselves. Large files live alongside in the filesystem or externally; the workspace knows how to find them.

### Insights

Structured claims extracted from sources — observed pains, opportunities, process facts, stakeholder concerns, risks, assumptions. Each insight traces back to a source, carries a confidence level, and indicates what part of the business it relates to.

### Glossary

A shared vocabulary of domain-specific terms used throughout the workspace. Ensures everyone means the same thing when they use a word.

### How Knowledge Connects

Model elements (processes, actors, entities) can reference the insights they were derived from, creating a traceability chain: **Source → Insight → Model**. A stakeholder can challenge any model element by following this chain back to the original observation.

---

## Layer 3: Operational Model

The operational model describes **how the organization works today** (or how a proposed future state would work). It has four interconnected areas.

### Processes

The core of most UBML workspaces. Processes describe workflows as sequences of steps — actions, decisions, handoffs, milestones, waits. Steps can call other processes, require approvals, trigger notifications, and loop. Processes are organized using phases (lifecycle groupings) and blocks (control flow). Steps connect through links that model routing, conditions, and scheduling dependencies.

Processes follow a four-level hierarchy (L1–L4) that mirrors frameworks like APQC: from high-level value chains down to individual tasks.

### People & Resources

Actors represent anyone or anything that participates in work: people, roles, teams, organizations, systems, external parties, and customers. Actors have skills, belong to resource pools, and may use equipment. The RACI model on process steps connects actors to the work they perform.

Resource pools pair actors with capacity, availability, and cost — the operational reality behind who does the work.

### Information Model

Entities describe the business objects that processes create, transform, and consume — customers, orders, contracts, cases. Each entity has attributes and relationships to other entities. Documents are formalized information artifacts (forms, templates, signed approvals). Locations provide spatial context.

Process steps declare their inputs and outputs as entity references, making data flow through the organization visible.

### How the Operational Model Connects

Processes reference actors (who does the work), entities (what they work with), skills (what they need to know), locations (where it happens), and other processes (what they trigger). These cross-references form a graph that reveals organizational structure, dependencies, and handoff patterns.

---

## Layer 4: Change & Analysis

This layer sits above the operational model and asks: **what should change, and what would happen if it did?**

### Hypotheses

Hypothesis trees frame improvement work as structured problem-solving. Each tree begins with a situation, complication, and question (the SCQH framework from the Minto Pyramid Principle), then decomposes into testable hypotheses, supporting evidence, and recommendations. Hypotheses can be validated, invalidated, or remain under investigation.

### Scenarios

Scenarios define simulation configurations — arrival patterns, work mix distributions, duration estimates — grounded in observed evidence. A baseline scenario captures current performance; variant scenarios model proposed changes. Comparing scenarios quantifies the impact of hypotheses.

### Metrics & Performance

KPIs attach to processes, steps, value streams, and capabilities. Each KPI defines a formula, baseline, target, and thresholds (red/amber/green). ROI analyses aggregate costs and benefits to build financial business cases for proposed changes.

### Process Mining

Mining configurations bridge observed reality with the model. They map event log data (from IT systems) to UBML processes, actors, and entities — enabling conformance checking (does reality match the model?) and enriching scenarios with actual measured performance.

### How Change & Analysis Connects

Hypotheses drive investigation. Scenarios quantify impact. KPIs measure outcomes. Mining grounds everything in data. Together, they form a cycle: **hypothesize → simulate → measure → refine**.

Critically, downstream analysis informs upstream decisions. The impact of an issue can't be sized until a process is modeled, hypotheses are formed, KPIs are defined, and scenarios are simulated. Business cases flow back to prioritize the original issue tree. This feedback loop — from analysis conclusions back to problem prioritization — is what makes the analytical layer genuinely useful rather than a documentation exercise.

Analysis also bridges to planning: once issues are prioritized and hypotheses validated, the model should capture what to change, in what order, and why — turning analytical conclusions into a sequenced plan of action.

---

## Layer 5: Strategy

Strategy explains **why processes exist** and **how they serve the organization's goals**.

### Value Streams

End-to-end flows of value from a triggering event to a customer outcome. Each stage of a value stream maps to one or more processes, making the connection between strategic intent and operational execution explicit.

### Capabilities

What the organization is able to do, independent of how it's organized. Capabilities form a hierarchy, carry maturity assessments, and link to the processes, skills, and systems that implement them. They bridge strategy ("we need to be great at X") with operations ("here's how we do X today").

### Products, Services & Portfolios

What the organization offers and how those offerings are grouped. Products and services sit at the intersection of capabilities (what we can do) and value streams (how we deliver it).

---

## Cross-Cutting Concerns

### Views

Views are stakeholder projections — filtered, styled subsets of the model designed for specific audiences. The same underlying model can be shown as a simple narrative for executives, a detailed flow for analysts, or a BPMN export for architects.

### Cross-Process Links

When workflows span multiple process files, explicit links connect steps across boundaries — modeling dependencies, data handoffs, and scheduling constraints that cross organizational domains.

### References & the ID System

Every element in a UBML workspace has a typed ID (prefix + number). References use these IDs to create a connected graph across all files. The reference system makes the workspace queryable and enables validation, impact analysis, and traceability.

---

## Workspace as a Living System

A UBML workspace is not a static document. It's designed to survive and stay useful across multiple improvement cycles spanning years.

### The Continuous Cycle

Organizational improvement is cyclic:

```
  ┌────────────────────────────────────────────┐
  │                                            │
  ▼                                            │
Capture as-is → Analyze → Plan → Execute → Absorb
```

Each cycle:
1. **Capture** — Model the current state (or update it after the last cycle's changes)
2. **Analyze** — Decompose issues, form hypotheses, simulate scenarios, build business cases
3. **Plan** — Prioritize improvements, sequence initiatives, define the target operating model
4. **Execute** — Implement changes (outside UBML — this is project management territory)
5. **Absorb** — The target state becomes the new current state. KPI targets become baselines. Capability target maturity becomes actual maturity. Hypothesis trees close. The model is ready for the next cycle.

The workspace accumulates value across these cycles. Year 3's issue tree references Year 1's insights. Every process change traces back through the initiative that delivered it, the hypothesis that proposed it, and the evidence that justified it.

### What Evolves Over Time

- **Knowledge accumulates** — new sources are cataloged, new insights extracted; old insights remain for provenance
- **The model refines** — rough drafts become validated process maps; target states absorb into new baselines
- **Hypotheses resolve** — some are validated, others invalidated, new ones emerge from changed conditions
- **Metrics shift** — baselines update after each improvement cycle, targets move, new KPIs are added
- **Strategy adapts** — capabilities mature, value streams evolve, portfolios rebalance

### What Prevents Rot

Most organizational models die within months. UBML resists this by:

- **Making the model a working tool** — analysts use it daily for analysis and planning, not just as a deliverable
- **Keeping provenance alive** — every element traces back to evidence, so the model stays defensible as people change
- **Supporting progressive refinement** — the model doesn't demand completeness; it guides what to enrich next
- **Using git for history** — the full evolution of organizational understanding is version-controlled and auditable

Git provides the version history. The workspace structure provides the semantic organization. Together, they create an auditable record of how organizational understanding developed over time.
