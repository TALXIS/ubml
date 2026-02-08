# 20 — Analysis Feedback Loops & Consulting Workflow Gaps

> **Status**: Proposed (design exploration — no implementation yet)
> **Depends on**: 19 (refinement questions), 04 (semantic validation), 00 (design decisions)
> **Effort**: Large (multi-session, phased)
> **Schema version**: 1.6+
> **References**: `docs/WORKSPACE-SEMANTICS.md`, `docs/PRINCIPLES.md`, Plan 19, `temp/CONSULTING_RESEARCH.md`

---

## Goal

Address structural gaps in UBML that prevent **continuous cyclic improvement** — where the workspace serves as a living organizational model maintained over years, not a one-shot consulting deliverable.

Today, UBML describes a conceptual cycle ("hypothesize → simulate → measure → refine") but the schema has no wiring to close the loop. Elements that should inform each other are disconnected or linked only through prose. The operational model captures a single state with no mechanism for modeling change over time. And there's no way to express the planning layer that turns analysis conclusions into sequenced action.

The workspace should support the full lifecycle: **capture → analyze → plan → execute → absorb → repeat**. After initiatives land and the organization changes, the model absorbs those changes, new issues surface, and the cycle runs again. This is what makes a UBML workspace a durable asset rather than a project artifact.

This plan also identifies missing consulting frameworks and element types that real engagement workflows depend on.

---

## The Problem

### The Feedback Loop Gap

A consultant's natural workflow when modeling an issue tree:

```
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  ▼                                                              │
Capture As-Is Model                                              │
  → Issue Tree (decompose problems)                              │
    → Model the process (understand mechanics)                   │
      → What-if analysis (explore interventions)                 │
        → Hypotheses (structure improvement bets)                │
          → KPIs (define success metrics)                        │
            → Simulation / Scenarios (quantify impact)           │
              → Business case / ROI (calculate value)            │
                → Issue impact sizing (inform the tree)          │
                  → Priority ranking (decide investments)        │
                    → PLANNING: initiatives, waves, timing       │
                      → Target Operating Model (to-be)           │
                        → Execution (outside UBML)               │
                          → Absorb changes into as-is model  ────┘
                            (old to-be becomes new as-is,
                             new issues emerge, cycle repeats)
```

This is inherently cyclic. The impact of an issue can't be sized until you've modeled the process, formed hypotheses about improvement, defined metrics, and estimated the effect. But the current schema treats each of these as independent artifacts with no formal way to flow conclusions back upstream.

There's also a **terminal gap**: even after the loop closes and issues are ranked, UBML has no way to model the next step — turning prioritized improvements into a sequenced plan of action. And critically, there's no **continuity mechanism**: after execution happens and changes land, the model has no way to absorb the new reality and start the next cycle. The workspace should be a living system that consultants maintain for 5+ years, not a deliverable that rots after handover.

### Concrete Disconnections in Current Schema

| From → To | What's missing | Why it matters |
|-----------|---------------|----------------|
| HypothesisNode → KPI | No `kpis` reference | Can't say "KP006 validates hypothesis HY00001.2" |
| HypothesisNode → Scenario | No `scenarios` reference | Can't link a simulation to what it tests |
| HypothesisNode → Capability/ValueStream | No `impacts` reference | Can't express strategic context of a hypothesis |
| KPI → Hypothesis | No reverse link | Can't trace "why does this KPI exist?" back to the hypothesis it validates |
| ROI → Hypothesis | No `hypothesis` reference | Can't say "this business case supports HT00001" |
| ROI → KPI | No `kpis` reference | Can't say "these KPIs feed the ROI model" |
| ROI → Scenario | No `scenario` reference | Can't ground a business case in simulation results |
| ValueStream → KPI | Inline KPIs, not refs | Same KPI can't be shared between value stream and hypothesis; violates single source of truth |
| Capability/Strategy → Insight | No `derivedFrom` | Can't trace why a strategic element exists back to the knowledge layer |

### What This Means for Plan 19

Plan 19's refinement questions are **property-level**: "this field is empty, fill it in." But some questions can't be answered until other modeling work is done first. To size the impact of an issue, you need to have modeled the process, linked KPIs, and possibly run a simulation. Plan 19 should eventually support **prerequisite-aware questions** — questions that know what upstream work must exist before the answer becomes meaningful.

This plan captures the schema and conceptual gaps. Plan 19's scope may expand to include workflow-level guidance once these gaps are addressed.

---

## A. Missing Cross-Element References

These are structural gaps where the schema needs wiring between element types that should inform each other.

### A.1: Hypothesis ↔ KPI

A hypothesis like "parallelize approvals to cut cycle time by 50%" has no way to point at the KPI that would validate or invalidate it. The KPI similarly can't declare which hypothesis it exists to test.

**Needed**: Bidirectional or single-direction reference between HypothesisNode and KPI.

### A.2: Hypothesis ↔ Scenario

A scenario should be linkable to the hypothesis it tests. "What if we parallelize approvals?" is a scenario configuration that directly tests a hypothesis. Currently these are modeled in parallel with no formal connection.

**Needed**: Reference from HypothesisNode to Scenario(s), or from Scenario to HypothesisNode.

### A.3: Hypothesis ↔ Strategy Elements

The CETIN sandbox demonstrates this gap clearly: hypothesis tree HT00001 maps conceptually to capabilities (CP010 "Majetkoprávní vypořádání" ≈ HY00001.3), but only through prose in descriptions. Hypotheses about improving a capability should formally reference that capability.

**Needed**: Reference from HypothesisNode to Capability, ValueStream, or Process.

### A.4: ROI as an Island

ROI analyses currently have zero typed references to other model elements. They can't answer "this is the business case for hypothesis HT00001" or "this ROI is based on scenario SC00002 projections."

**Needed**: References from ROI to Hypothesis, KPI, and Scenario.

### A.5: ValueStream KPIs

Value streams embed KPI definitions inline (`kpis` is an array of KPI objects). The root schema also has a top-level `kpis` collection with IDs. The same metric can end up defined in two places, and inline KPIs can't be referenced by hypothesis nodes or ROI analyses.

**Needed**: Decide whether ValueStream KPIs should be refs to top-level KPIs, or whether inline definitions get promoted.

### A.6: Strategy Element Provenance

KPIs and HypothesisNodes have `derivedFrom: [InsightRef]`, but capabilities, value streams, products, and services do not. This breaks the provenance chain for strategic elements — you can't trace "why does this capability exist?" back to the knowledge layer.

**Needed**: `derivedFrom` on strategy types.

### A.7: As-Is / To-Be / Lifecycle Temporal Gap

The operational model (processes, actors, entities) captures a single state — implicitly the as-is. But strategy work requires modeling the **target operating model** (to-be), often **intermediate states** aligned with implementation waves, and crucially the **lifecycle transition** where yesterday's to-be becomes today's as-is.

This isn't a one-shot problem. Over a 5-year engagement or internal practice:

- **Year 1**: Capture as-is, plan to-be, execute Wave 1
- **Year 2**: Absorb Wave 1 changes into as-is. New issues surface. Analyze, plan Wave 2.
- **Year 3**: Absorb Wave 2. External disruption. New issue tree. Plan Wave 3.
- **Year 5**: The model has been through 4 cycles. Every process change traces back through initiatives → hypotheses → issues → insights → sources.

The model must support this lifecycle without accumulating cruft. Old hypothesis trees should close cleanly. Absorbed changes should become the baseline. The provenance chain ("why did we change this process in 2024?") should remain answerable in 2028.

Today, if a consultant wants to model "after Wave 1, the approval process drops from 5 steps to 3 and cycle time goes from 30 days to 15 days," there's no schema mechanism. The options are:

- **Duplicate the process** — create `PR00001-asis` and `PR00001-tobe`. Simple but violates single source of truth, loses the delta visibility, and scales badly with multiple waves.
- **Use scenarios** — scenarios already model what-if configurations. But they're simulation parameters (arrival rates, duration overrides), not persistent model states. A to-be operating model is a committed design, not a hypothesis to simulate.
- **Variant/overlay mechanism** — a base model (as-is) plus named overlays that carry deltas. Each overlay represents a model state: "after Wave 1" modifies certain steps, durations, RACI. Composable: Wave 1 overlay + Wave 2 overlay = full to-be. Shows exactly what changes.
- **Temporal annotations on properties** — properties carry `{ asIs: 30d, toBe: 15d }`. Inline, no structural change, but pollutes every property and doesn't compose across waves.

This connects directly to the planning layer: each wave of initiatives produces a new operating model state. The chain is:

```
As-Is Model → Analysis → Hypotheses → Initiatives (Wave 1) → Intermediate Model
                                     → Initiatives (Wave 2) → Target Model (To-Be)
                                                                        ↓
                                                              Execution happens
                                                                        ↓
                                                              To-Be absorbed as new As-Is
                                                                        ↓
                                                              Cycle N+1 begins
```

Without this, the planning layer can describe *what* to change but can't show *what the result looks like*. And without the absorption step, the model diverges from reality after the first execution cycle. Consultants need the roadmap, the target operating model it produces, *and* the ability to roll the target into the new baseline when it's implemented.

**Needed**: A mechanism to express named model states (as-is, wave-1, to-be) with clear deltas from the base, without duplicating the entire model.

**Considerations**:
- Relationship to scenarios (which already carry duration/capacity overrides per step)
- Whether overlays are a document type, a workspace-level concept, or annotations on elements
- How KPI baselines and targets relate (baseline = as-is measurement, target = to-be expectation)
- Whether capability `maturity` and `targetMaturity` are already a primitive version of this pattern
- How views (Layer 5) could project a specific model state for a specific audience
- Git branching as an escape hatch (model to-be in a branch) — works for final to-be but not for intermediate wave states in the same workspace
- **Lifecycle absorption**: when a to-be state is implemented, how does it merge into the as-is? Manual commit, tooling-assisted, or automatic?
- **Cycle history**: should the model record which cycle/wave produced the current as-is state? (e.g., "this process was last changed by Initiative IN00003 in Wave 2")
- **Stale artifact cleanup**: when a hypothesis tree's recommendations are implemented and absorbed, how does it get archived without losing provenance?

---

## B. Missing Consulting Frameworks & Element Types

Based on analysis of management consulting practice (McKinsey, BCG, Bain methodologies), several frameworks that consultants use daily are either missing or underrepresented.

### B.1: Issue Trees vs. Hypothesis Trees

Consulting engagements start with **issue trees** (decomposing a question into sub-questions, MECE) and evolve into **hypothesis trees** (testable claims to validate). These are conceptually distinct phases. The current HypothesisTree type serves both roles, but conflates "what to investigate" with "what we believe."

**Considerations**:
- Whether issue trees need their own type or can be expressed as a phase/mode of the existing HypothesisTree
- Issue nodes are questions to answer; hypothesis nodes are claims to validate
- Issue trees may want "answered/open" status distinct from "validated/invalidated"
- Natural evolution path: issue tree → hypothesis tree as understanding deepens

### B.2: Options Analysis & Decision Criteria

Consultants frequently compare options using weighted scoring matrices (feasibility, impact, cost, risk). No UBML type supports this. Scenarios can model different options but lack explicit comparison criteria, scoring, or recommendation tracking.

**Considerations**:
- Decision criteria with weights
- Options scored against criteria
- Link options to scenarios for detailed modeling
- Recommendation with rationale
- Could be a standalone type or an extension of HypothesisTree

### B.3: Value Propositions

No way to model customer segment → value mapping. Products and services exist but lack articulation of why customers value them. Customer jobs, pains, gains (Osterwalder's Value Proposition Canvas) are standard consulting tools.

**Considerations**:
- Customer segment references (ActorRef)
- Jobs, pains, gains structure
- Quantified value (time saved, cost reduced)
- Link to products/services that deliver the value

### B.4: Planning Layer — From Priorities to Action

This is the most significant structural gap. After the analysis cycle produces prioritized issues with impact sizing and validated hypotheses with ROI, there's no way to turn that into a plan. The consultant's instinct is: "great, I have 12 improvement hypotheses ranked by impact/effort — now group them into waves, sequence them by dependencies, and create a roadmap." UBML stops right before that step.

The planning layer would model:

**Initiatives** — discrete improvement actions derived from hypotheses. An initiative like "Implement parallel approval workflow" traces back to the hypothesis it validates (HY00001.2), the KPI it's expected to move (KP006), and the ROI that justifies it (RI00001). Each initiative carries effort and expected impact — the two axes of the classic prioritization matrix.

**Sequencing logic** — dependencies between initiatives ("can't do B until A is done"), effort/impact classification (quick wins first), and grouping into waves or iterations. This is the structure that turns a flat list of improvements into an ordered plan.

**Rough timing** — quarters or phases, not calendar dates. "Wave 1: Q1-Q2" not "Sprint 47 starts March 3rd."

**What this is NOT**: project tracking. No status updates, no % complete, no burndown, no resource leveling, no Gantt charts. The plan models **intent** (what to do, in what order, why) — execution tracking belongs in project management tools.

**Why this belongs in UBML**: The plan is a modeling artifact, not an execution artifact. It captures the *analytical reasoning* behind sequencing — why Wave 1 before Wave 2, why these initiatives are grouped, what the dependencies are. This reasoning is part of the consulting deliverable (the roadmap slide) and needs the same traceability as everything else in the model.

**Considerations**:
- Initiative as an element type with refs to Hypothesis, KPI, ROI, Capability, Process
- Effort/impact classification (enum or structured: `effort: low/medium/high`, `impact: low/medium/high`)
- Dependency modeling between initiatives (simple ref list, not a full DAG engine)
- Wave/iteration grouping with rough timelines
- Owner (ActorRef) per initiative
- The traceability chain: Issue → Hypothesis → KPI → ROI → Initiative → Wave
- Whether initiatives live inside a Plan/Roadmap container or are top-level elements
- Relationship to Process: an initiative *changes* a process, but it is not a process itself

### B.5: Strategic Portfolio Classification

Products have lifecycle, capabilities have strategic importance, but there's no cross-cutting portfolio analysis view. BCG matrix (stars/cash cows/question marks/dogs), three horizons (H1 core / H2 growth / H3 options), and investment allocation are standard portfolio tools.

**Considerations**:
- Simple enum fields (horizon, BCG classification) on existing types
- Portfolio-level aggregation views
- Investment allocation across portfolio segments

### B.6: Competitive Analysis

No support for competitive landscape modeling. Porter's Five Forces, competitive positioning, and competitor capability comparison are foundational strategy tools.

**Considerations**:
- Whether this belongs in UBML at all (it models internal operations, not market dynamics)
- Could be lightweight — competitive context as inputs to capability prioritization
- Risk of scope creep into market research territory

### B.7: RAPID Decision-Making

RACI covers operational responsibility. RAPID (Recommend, Agree, Perform, Input, Decide) covers decision-making governance — a distinct concern. Bain's methodology specifically uses RAPID for organizational design.

**Considerations**:
- Whether RAPID is a separate assignment model or extends RACI
- Could apply to decision-type steps specifically
- Could be a property on decision points in processes

### B.8: Storylines & Key Messages

Consulting deliverables follow the Pyramid Principle: answer first, then supporting arguments, each backed by evidence. UBML has no presentation/communication layer. While this may be out of scope for a modeling DSL, the structure of an argument (key message → supporting evidence) is itself a model.

**Considerations**:
- Whether structured arguments belong in UBML or in export/projection tooling
- Relationship to SCQH (which captures the framing, not the full argument)
- Could enable "generate recommendation deck" exports
- Risk of turning UBML into a presentation tool

---

## C. Principle Tensions to Resolve

### C.1: P1.3 — No Computed Aggregations vs. Derived Values

Impact sizing, confidence scoring, and maturity are best computed from linked model data. P1.3 says "never store computed aggregations." The resolution is probably: **tooling suggests, analyst confirms**. The stored value is a human decision informed by computation, not a formula output. But this needs an explicit design decision.

### C.2: Scope Boundary — Modeling vs. Project Management

The planning layer is the sharpest instance of this tension. The boundary must be crisp:

| Planning (in scope) | Execution tracking (out of scope) |
|---|---|
| Initiative definition and rationale | Task breakdown and assignments |
| Effort/impact classification | Story points, velocity |
| Dependencies between initiatives | Critical path scheduling |
| Wave/iteration grouping | Sprint planning |
| Rough timing (quarters) | Calendar dates, deadlines |
| Owner (accountable person) | Daily standup status |
| Expected KPI impact | Actual KPI measurement over time |
| Traceability to hypotheses/ROI | Progress %, burndown |

The test: if a project manager would update it weekly, it's out of scope. If a consultant would present it in a steering committee, it's in scope.

### C.3: Scope Boundary — Internal Model vs. Market Context

Competitive analysis and market dynamics add external context to internal modeling. This is useful for strategy (why this capability matters) but risks expanding UBML beyond its core domain. Decision needed on whether external/competitive context is in scope.

### C.4: Complexity vs. Learnability

Adding 5-10 new element types increases the learning curve significantly. UBML should remain learnable in minutes (PRINCIPLES.md). Mitigation: new types are optional; core workflow (process + actors + entities) stays simple. But this needs validation that the optional layer doesn't intimidate newcomers.

### C.5: Reference Direction — Forward vs. Reverse Links

When connecting Hypothesis ↔ KPI, should the reference go from hypothesis to KPI, KPI to hypothesis, or both? UBML generally uses forward references (the element "higher" in the analysis chain points to the element it depends on). Need a consistent rule for bidirectional analytical relationships.

### C.6: As-Is / To-Be — Single Model vs. Multiple States

This is the deepest architectural question in this plan. UBML currently assumes one operational model per workspace. Introducing named model states (as-is, to-be, intermediate) fundamentally changes the data model:

- **One model + overlays**: Simple base case, deltas are explicit, but overlay composition and conflict resolution need rules
- **One model + scenario promotion**: Extend the existing scenario concept to carry committed model changes (not just simulation params). Risk of overloading the scenario concept.
- **Multiple models in one workspace**: Each model state is a full set of files in a subdirectory. Clean separation but heavy duplication and loses delta visibility.
- **Git-based**: Different branches for different states. Powerful but can't show as-is and to-be side by side.

The capability schema already hints at this pattern: `maturity` (as-is) and `targetMaturity` (to-be) are two-state properties on one element. KPIs have `baseline` (as-is) and `target` (to-be). But extending this to full process model states is a bigger architectural step.

The design decision should consider what consultants actually deliver: typically an as-is process map, a to-be process map, and a gap analysis showing what changes. The mechanism should make producing all three natural.

But it must also handle the **lifecycle transition**: when the to-be is implemented, it becomes the new as-is. The mechanism can't leave orphaned overlay layers or require manual reconciliation every cycle. The simplest version might be: overlays get "committed" (folded into the base model) by tooling when execution is confirmed, with the overlay's deltas recorded in the element's provenance.

---

## B½. Continuous Improvement Lifecycle

This section addresses the overarching design question: how does a UBML workspace stay alive and accurate over multiple years and improvement cycles?

### The Anti-Pattern: Model Rot

Most organizational models rot within months of creation. The consulting team leaves, processes change, and the model becomes a historical curiosity. UBML aims to prevent this by making the model a **working tool** — something that consultants and internal analysts use daily, not just during the initial engagement.

But the schema must actively support this. If absorbing changes requires heroic manual effort, the model will rot. Every part of the cycle must have low-friction tooling support.

### What the Schema Must Enable

**1. Baseline absorption**: When an initiative completes and changes are implemented, the target state becomes the new as-is. The model needs a clean "commit" operation that:
- Folds the to-be changes into the base model
- Updates KPI baselines (old target → new baseline, or measured actual → new baseline)
- Updates capability maturity (targetMaturity → maturity, or assessed actual → maturity)
- Records provenance: "changed by Initiative IN00003, derived from Hypothesis HY00001.2"
- Archives the completed hypothesis tree / planning wave without losing traceability

**2. Cycle history**: The model should be queryable across cycles. "Show me all changes to process PR00001 across all improvement waves" or "which hypotheses from 2024 were validated vs. invalidated?" Git provides raw version history, but semantic queries need model-level metadata.

**3. Artifact lifecycle**: Elements go through states across cycles:
- Hypothesis trees: `active → implemented → archived`
- Initiatives: `planned → in-progress → completed → absorbed`
- KPIs: baselines shift, targets move, thresholds update
- Issues: `open → addressed → closed → reopened` (when regression or new context emerges)

**4. Incremental capture**: New cycles don't start from scratch. A Year 3 issue tree should reference Year 1 insights that are still relevant. New sources add to the knowledge layer; they don't replace it. The provenance chain grows over time, it doesn't reset.

**5. Workspace health over time**: Plan 10's `ubml doctor` should detect model staleness — processes that haven't been reviewed since their last change wave, KPIs with baselines older than the last implementation cycle, hypothesis trees that were never closed.

### What This Does NOT Mean

The model doesn't track execution progress (that's a PM tool's job). "Initiative IN00003 is 60% complete" is out of scope. What's in scope is the **transition event**: "Wave 1 was implemented in Q3 2025. The model was updated to reflect the new operating state."

The model also doesn't auto-update from production systems (that's process mining / ETL territory). What it does is provide the **semantic structure** that makes absorption meaningful: when a new baseline measurement comes in, there's a place for it and it connects to the reason the change was made.

---

## D. Relationship to Other Plans

| Plan | Relationship |
|------|-------------|
| **00 (Design Decisions)** | Several gaps here require new design decisions (issue trees, options analysis, scope boundaries) |
| **01 (Knowledge Layer)** | Adding `derivedFrom` to strategy types extends knowledge layer coverage |
| **03 (Process & Block)** | Process modeling must be solid before what-if analysis flows work |
| **04 (Semantic Validation)** | Cross-element reference validation depends on having the references in schema |
| **19 (Refinement Questions)** | This plan provides the schema wiring that enables Plan 19's workflow-level questions |
| **16 (Visual Export)** | Issue trees, decision matrices, and roadmaps will need visual projections |
| **18 (Future)** | Graduates several items from "future considerations" to concrete gaps |

---

## Open Questions

1. **Issue trees**: New type, or a mode/phase of HypothesisTree?
2. **Options analysis**: Standalone type, or extend scenarios with comparison criteria?
3. **Reference direction**: When A informs B and B informs A, which element holds the reference?
4. **ValueStream KPIs**: Promote inline to refs, or keep both forms?
5. **Competitive context**: In scope or out of scope for UBML?
6. **Storylines**: Modeling concern or export/tooling concern?
7. **Priority**: Which gaps block real consulting workflows most urgently?
8. **Planning layer container**: Are initiatives top-level elements in a `plans` or `roadmaps` collection, or nested inside a Plan/Roadmap container (like steps inside a process)?
9. **Initiative granularity**: One initiative per hypothesis node, or can an initiative address multiple hypotheses?
10. **Effort/impact representation**: Simple enums (`low/medium/high`), numeric scores, or structured objects with units?
11. **Wave dependencies**: Simple ordering (wave 1 before wave 2) or explicit inter-initiative dependency refs?
12. **As-is/to-be mechanism**: Overlays, scenario promotion, multi-model, or property-level annotations?
13. **Intermediate states**: Do we need per-wave model states, or just as-is and final to-be?
14. **Delta representation**: How does an overlay express "change step ST00003 duration from 5d to 2d" or "remove step ST00005"?
15. **Existing two-state patterns**: Should `maturity`/`targetMaturity` and `baseline`/`target` generalize into a consistent as-is/to-be pattern?
16. **Baseline absorption**: How does tooling "commit" a to-be state into the new as-is? What metadata is preserved?
17. **Cycle identity**: Should improvement cycles be explicit workspace-level elements ("Cycle 2025-H1") or implicit in git history?
18. **Artifact archival**: How do completed hypothesis trees and planning waves get archived without breaking provenance links?
19. **Staleness detection**: What signals indicate that the model has diverged from reality? (Plan 10 `ubml doctor` integration)

---

## Checklist

_Deferred until design questions are resolved. This plan needs a design session before implementation planning._

- [ ] Design decision: Issue tree approach (new type vs. HypothesisTree mode)
- [ ] Design decision: Scope boundaries (roadmaps, competitive, storylines)
- [ ] Design decision: Planning layer structure (container vs. top-level, initiative granularity)
- [ ] Design decision: Planning ↔ execution boundary (what's modeled vs. what's tracked externally)
- [ ] Design decision: Reference direction policy for analytical relationships
- [ ] Design decision: ValueStream KPI representation
- [ ] Design decision: As-is / to-be modeling mechanism (overlays, scenarios, multi-model)
- [ ] Design decision: Relationship between model states and planning waves
- [ ] Design decision: Baseline absorption mechanism (how to-be becomes as-is)
- [ ] Design decision: Cycle/wave identity and lifecycle metadata
- [ ] Design decision: Artifact lifecycle states (hypothesis trees, initiatives, issues)
- [ ] Schema changes: Cross-element references (A.1–A.7)
- [ ] Schema changes: New element types (whichever B items are accepted)
- [ ] Update `docs/DESIGN-DECISIONS.md` with rationale
- [ ] Update `docs/WORKSPACE-SEMANTICS.md` with new connections
- [ ] Update Plan 19 to account for prerequisite-aware questions
- [ ] Update Plan 10 (`ubml doctor`) to include staleness detection for long-lived workspaces
- [ ] Validate against real consulting engagement (CETIN FTTH sandbox)
- [ ] Validate lifecycle design against 3+ cycle scenario (Year 1 → Year 3 thought experiment)
