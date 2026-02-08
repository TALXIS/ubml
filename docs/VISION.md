# UBML Vision

> **Unified Business Modeling Language** — A notation for understanding how organizations create and deliver value.

---

## The Problem We Set Out to Solve

### The Specification Crisis

Software development is getting dramatically faster. AI-assisted coding tools are turning what took weeks into what takes hours. But this creates a new problem: the specification bottleneck.

Building software was always constrained by two things: understanding what to build, and building it. AI is solving the second problem. The first problem—understanding business reality, capturing intent, designing solutions that people will actually use—remains as hard as ever. Harder, in fact, because now there's pressure to move faster.

The result is predictable: organizations will produce more software, faster, that doesn't match how the business actually works. Software that people resist adopting because it was built from incomplete understanding. Software that solves the wrong problem because nobody took time to understand the right one.

**The gap is widening.** Programmers accelerated by AI can build faster than analysts and consultants can specify. Recording meeting transcripts and feeding them to generic AI tools doesn't solve this—it produces plausible-sounding specifications that miss the nuances only discovered through structured investigation.

This is why we're building UBML. Not because we need another modeling notation, but because we need a way for business understanding to keep pace with implementation speed. A notation designed for AI assistance from the start. A format that captures the messy reality of how organizations work—not just the sanitized version that fits neatly into a requirements document.

> **The constraint is shifting:**  
> **From:** "How do we build this?"  
> **To:** "What should we build, and why does it matter for the business?"

Organizations that can clearly articulate how they work, where value is created, and what improvements will deliver ROI will have a decisive advantage. The bottleneck is no longer implementation—it's understanding.

### The Blank Canvas Paradox

Business analysts and management consultants face this specification challenge with inadequate tools:

- **UML** was designed by software engineers, for software engineers
- **BPMN** demands precise control-flow semantics before you've even understood the business
- **Enterprise Architect** drowns you in implementation details when you're still grasping fundamentals
- **Diagramming tools** present a blank canvas and expect you to know the notation before you can think

These tools force practitioners to translate their natural thinking into rigid formalisms. Hours spent fighting the tool instead of understanding the business. Diagrams that satisfy technical correctness but fail to capture what actually matters.

Meanwhile, the real work happens elsewhere: in interview notes, workshop whiteboards, and spreadsheets that can't be validated, versioned, or connected to anything.

### The Communication Gap

There's another failure mode: you build the model, but nobody can read it.

BPMN and UML were designed for precision and interchange between technical systems. They were not designed to be understood by the people who actually do the work. When you show a BPMN diagram to a warehouse supervisor or a customer service lead, they struggle to validate whether it reflects reality.

This creates a dangerous gap. The people who know the process can't read the model. The people who can read the model don't know the process. Errors go unnoticed until implementation.

### Where Process Mining Falls Short

Process mining promises to reveal how work actually happens by analyzing system event logs. When it works, it's powerful. But it often fails in practice:

- Many processes leave no system trace—especially human-to-human handoffs
- Legacy systems don't log the events that matter
- The most problematic processes are often the least instrumented
- Mining shows *what* happened, but rarely *why*

Consultants fill this gap through interviews and observation—but their findings live in unstructured notes that can't connect back to the data.

---

## How UBML Addresses This

**UBML bridges these gaps.** It provides structure for the analyst while supporting multiple views for different audiences. The same underlying model can be projected as:

- A simple narrative for stakeholder validation
- A detailed process view for analysts
- A BPMN export for technical interchange
- A Gantt-style view for project planning

The model is the source of truth. The presentation adapts to who needs to understand it. Workers can confirm "yes, this is what we actually do" without learning notation. Architects can export to BPMN when formal interchange is required.

Models built from stakeholder interviews can be enriched with mining data where it exists. Mining discoveries can be annotated with context that explains the patterns. The notation works whether you have full event logs, partial signals, or only human testimony.

UBML captures business context in a form both humans and AI can work with:

1. **The "why"** behind processes—not just the mechanics
2. **A foundation** for AI-assisted analysis and improvement recommendations
3. **Explicit business knowledge** that enables automation and intelligent tooling

When you can describe your business in UBML, you can instruct AI to analyze it, identify opportunities, and help build solutions that actually serve the business.

---

## Who UBML Is For

UBML is designed for practitioners who understand business — management consultants, business analysts, operations leaders, and the client stakeholders they work with. These practitioners don't think in swimlanes and gateways. They think in: *Who does what? Where does time go? What's causing pain? How do we make more money?*

UBML speaks that language.

For detailed persona definitions and the collaboration model, see [CONSUMERS.md](CONSUMERS.md).

---

## What UBML Is

✓ A notation for understanding how a business works  
✓ A way to capture inputs, outputs, and value creation  
✓ A structure for mapping where time and money are spent  
✓ A foundation for forming hypotheses about improvement  
✓ A common language for building business cases with clear ROI  
✓ A bridge between workshop observations and actionable models

### What UBML Is Not

✗ A software architecture language  
✗ An implementation specification  
✗ A replacement for technical documentation  
✗ A database schema or API contract

**UBML deliberately avoids implementation details.** It describes *what a business does* and *how it creates value*—not how software should be built.

---

## Core Intent

UBML exists to support a clear workflow:

```
Observe → Model → Simulate → Propose → Execute → Measure → Refine
```

### Capture the Real Way Value Is Delivered

Not the official org chart. Not the documented procedure no one follows. The *actual* way work gets done and money gets made.

### Make Stakeholder Concerns First-Class

Pains, motivations, and goals aren't side notes—they're central to understanding why an organization operates the way it does and what changes will actually stick.

### Turn Workshop Outputs Into Consistent Models

Interviews and workshops generate rich insights that typically live in scattered notes and slides. UBML provides structure to capture this systematically.

### Support Reasoning About Change

Models aren't just documentation. They should support reasoning about what happens when you change things—how long will it take, what resources are needed, where are the constraints?

### Build ROI-Backed Business Cases

Every proposed change should connect to measurable outcomes. UBML models provide the foundation for KPIs and performance metrics that matter.

### Enable Hypothesis-Driven Improvement

Following structured problem-solving frameworks, UBML helps frame improvement work as testable hypotheses rather than opinion-based recommendations.

---

## The Tool Vision

UBML is a notation—a set of abstractions and a schema. But notation alone doesn't solve the blank canvas problem. The vision includes tooling built on top of UBML to provide:

### Workshop and Interview Support

- Capture structured notes in real-time
- Show models to stakeholders during the engagement
- Facilitate alignment conversations
- Build shared understanding, not just documentation

### Multiple Ways of Working

Different consultants think differently. The same underlying model supports multiple perspectives:

| Approach | Focus |
|----------|-------|
| Process analysis | Mapping activities, handoffs, and bottlenecks |
| Service delivery modeling | Understanding how value reaches customers |
| Project planning | Dependencies, effort, and timelines |
| Value stream thinking | Following the flow of value creation |
| Hypothesis-driven improvement | Structured problem-solving and prioritization |

### AI-Assisted Modeling

Business modeling increasingly involves processing unstructured information: interview transcripts, meeting notes, existing documentation. This is where AI assistance becomes practical:

- Process anecdotes and interview notes into structured models
- Identify gaps and inconsistencies
- Generate hypotheses from observed patterns
- Translate models back to plain language for stakeholder review

UBML is designed to be a good target format for AI—semantic property names, clear structure, and validation that catches errors. The workflow: consultants capture observations, AI assists in structuring them, humans review and refine.

### Analysis and Prioritization

- Identify low-effort, high-impact changes
- Support stakeholder alignment across competing priorities
- Enable change planning and sequencing
- Set and track performance metrics
- Measure execution against targets

---

## Relationship to Existing Standards

UBML does not replace established standards. It aims to be a **common denominator** that projects into traditional methodologies when needed.

### Process and Flow

| Standard | UBML Relationship |
|----------|-------------------|
| **BPMN 2.0** | Export to BPMN when formal interchange is required |
| **APQC Process Classification** | Aligned with L1–L4 process hierarchy concepts |
| **Lean Value Stream Mapping** | Native support for value stream stages and flow time |
| **SIPOC** | Natural projection as a view of process models |

### Architecture (Business Layer)

| Standard | UBML Relationship |
|----------|-------------------|
| **ArchiMate** | Maps to business actor, role, service, process, and object concepts |
| **TOGAF** | Capability and value stream concepts as high-level structure |
| **BIZBOK** | Capability mapping and hierarchy |

### Planning and Simulation

| Standard | UBML Relationship |
|----------|-------------------|
| **MS Project / CPM / PERT** | Supports standard dependency types, lag, critical path |
| **BPSim** | Simulation concepts: duration, resources, probabilities |
| **XES** | Potential export for process mining integration |

### Stakeholder and Analysis Practice

| Standard | UBML Relationship |
|----------|-------------------|
| **BABOK** | Stakeholder analysis, elicitation, requirements context |
| **ITIL 4** | Service concepts, value streams, practices vocabulary |

### Export Philosophy

UBML exports are **projection-based**—they may be lossy depending on the target notation. UBML captures stakeholder context, improvement hypotheses, and evidence that formal notations have no place for.

The philosophy: **UBML-first modeling, standard-compliant export when you need it.**

---

## Design Principles

### Business-First, Always

Every abstraction should make sense to someone who understands business, even if they've never used a modeling tool.

### Evidence-Based Modeling

Models should trace back to observations—interviews, workshops, documents. Not invented from imagination.

### Progressive Formalization

Start loose, add rigor as understanding deepens. Don't demand precision before you've learned enough to be precise.

### Multiple Valid Perspectives

Different people think differently. UBML provides a core model that can be viewed and worked with in multiple ways.

### Actionable Over Comprehensive

A useful model that captures 80% is better than a complete model that's too complex to build or maintain.

### Measurable Outcomes

Every model element should eventually connect to something measurable—time, money, satisfaction, throughput.

---

## What Success Looks Like

UBML succeeds when:

- A consultant walks out of a workshop with a structured model instead of scattered notes
- Stakeholders see and validate the model during the engagement, not weeks later
- Business cases are grounded in models that show *why* the proposed change will deliver value
- AI tools can read UBML and understand enough about a business to be genuinely helpful
- Analysts spend their time understanding the business, not fighting their tools

---

## Hypotheses We're Testing

UBML is built on beliefs we intend to validate:

**H1:** Teams can model a workshop outcome in under 60 minutes without specialized training.

**H2:** Stakeholders can validate a narrative view with fewer misunderstandings than when reviewing formal diagrams.

**H3:** A structured model reduces rework during delivery, measured in change requests traced to specification gaps.

**H4:** AI can extract useful model fragments from interview transcripts with less than 30% human correction.

### How We Test

- Pilot workshops measuring time-to-first-model
- Stakeholder correction counts during validation sessions
- Export usefulness: diagrams used in presentations, backlog items created directly from models

---

## Scope Boundaries

UBML is intentionally focused. To stay effective, we're explicit about what lies outside its scope:

- **Describing, not executing.** UBML captures how work happens; it doesn't automate or orchestrate that work.
- **Business layer only.** We model processes, actors, and value—not application portfolios, infrastructure, or technical architecture.
- **Understanding, not tracking.** We capture current state and proposed improvements—not implementation progress or project status.
- **Honest about data.** Simulation and ROI estimates require calibration from real operations. UBML provides structure for this analysis, but accuracy depends on the data you bring.

These boundaries prevent scope creep and keep the notation learnable.

---

## Open Standard, No Lock-In

UBML is released under the MIT License and developed in the open. This is a deliberate choice:

- **Your models belong to you.** UBML files are plain text. Export them, version them, process them with any tool. No proprietary format traps your work.
- **No vendor dependency.** You can use UBML without any commercial tooling. The schema, validation, and core libraries are free to use and extend.
- **Enterprise-grade trust.** Major consultancies and enterprise clients need assurance that adopting a notation won't create strategic dependency. Open source provides that assurance.

Commercial tools built on UBML will add value through better interfaces, AI assistance, and integration—but the underlying notation and your models remain yours.

---

## Summary

UBML is a notation for capturing business understanding in a structured, validated, version-controlled format. It bridges the gap between informal discovery and formal modeling, works effectively with AI assistance, and projects into existing standards when needed.

If you've ever struggled with the blank canvas—knowing you need to capture how a business works, but finding the available tools either too rigid or too unstructured—UBML was designed to solve that problem.

*UBML is developed and maintained by NETWORG, a consulting and technology firm with experience in business process improvement and enterprise software.*
