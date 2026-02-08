# UBML Design Decisions

> Architectural decisions for the UBML notation.
> This document records significant design choices about the language's abstractions, vocabulary, and structure — and the reasoning behind them.

---

## Purpose

UBML must remain **focused and coherent**. Every abstraction we add, every property we define, every relationship we model makes the language either clearer or more confusing for consultants trying to capture business reality.

This document preserves institutional knowledge about **why** UBML is designed the way it is. It explains:
- What problems each design choice solves
- What alternatives were considered and rejected
- How decisions align with our principles
- What trade-offs we accepted

Before modifying the language, maintainers must:

1. Read the relevant decision record
2. Understand the constraints that shaped the original design
3. Consider whether those constraints still apply
4. Update this document if the decision changes

**Do not change the notation without updating this document.**

---

## Decision Record Format

Each decision follows this structure:

- **Status**: Proposed | Accepted | Superseded
- **Context**: What problem we faced
- **Research**: What standards and expert opinions we considered
- **Decision**: What we chose
- **Alternatives Rejected**: What we didn't choose and why
- **Consequences**: What this means for the language
- **Principles Applied**: Which PRINCIPLES.md rules drove the decision

---

## DD-001: Cross-Process Invocation

**Status**: Accepted

### Context

Business processes often invoke other processes. We needed to model:

1. **Synchronous subprocess calls** — "Run this process and wait for it to finish"
2. **Asynchronous triggers** — "Fire off this process when I complete, but don't wait"

The original design had multiple mechanisms:

| Mechanism | Location | Problem |
|-----------|----------|---------|
| `Step.processRef` | On the step | Only for sync calls |
| `Process.triggers` | At process level | Not visible when reading the step |
| `Link` with process target | Links section | Third way to express same concept |

This violated **P1 (Single Source of Truth)** and **P9.1 (No Alternative Representations)**.

### Research

We examined how formal standards handle this:

#### BPMN 2.0

| Concept | BPMN Element | Where Defined |
|---------|--------------|---------------|
| Sync subprocess call | Call Activity | ON the activity |
| Async trigger | Signal/Message Throw Event | Attached to or following activity |

**Key insight from Bruce Silver (Method and Style)**: "The flow contained in a call activity is an independently-defined process. The called process reference is ON the call activity element."

#### ArchiMate

| Concept | ArchiMate Element |
|---------|-------------------|
| Process composition | Composition relationship |
| Process triggering | Triggering relationship (from → to) |

ArchiMate draws triggering relationships FROM the triggering element. You see the relationship by looking at either end.

#### Expert Opinions on Complexity

**Sebastian Stein (ARIS/Software AG)**:
> "BPMN contains many redundant modelling elements... I think this redundancy makes BPMN too complex for no reason. There should be exactly one way to express [a concept] and not several."

**Håvard Jørgensen (Simplifying BPMN 2.0)**:
> "One way to express a thing means one pattern to learn, one pattern to parse, one pattern to validate. Alternatives create cognitive load and tooling complexity."

### Decision

Consolidate all cross-process invocation into a single `calls` property on `Step`, with explicit `mode` to distinguish synchronous vs asynchronous invocation.

```yaml
steps:
  ST00015:
    name: Run credit check
    calls:
      - process: PR00020
        mode: sync  # Waits for completion
  
  ST00016:
    name: Approve order
    calls:
      - process: PR00030
        mode: async
        on: complete  # Fires on completion, doesn't wait
      - process: PR00040
        mode: async
        on: error
        condition: "severity == 'critical'"
```

#### Semantics

| Mode | Behavior | BPMN Projection |
|------|----------|-----------------|
| `mode: sync` | Synchronous call, step waits for subprocess | Call Activity |
| `mode: async` + `on: complete` | Async trigger on completion | Intermediate Signal Throw Event |
| `mode: async` + `on: error` | Async trigger on error | Intermediate Error Throw Event |

#### Call Object Properties

| Property | Required | Description |
|----------|----------|-------------|
| `process` | ✓ Yes | ProcessRef — which process to invoke |
| `mode` | ✓ Yes | `sync` or `async` — whether step waits for completion |
| `on` | When async | Event that fires the call: `complete`, `error`, `timeout` |
| `condition` | No | Guard expression — call only if true |

### Alternatives Rejected

| Alternative | Approach | Why Rejected |
|-------------|----------|---------------|
| A | Separate `processRef` (sync) and `triggers` (async) properties | Two properties for same concept. Violates P9.1. |
| B | Use Links with process targets | Step doesn't show what it triggers. Links are for intra-process flow. |
| C | `Process.triggers` at process level | When reading a step, you don't see it triggers anything. |
| D | Scalar shorthand `calls: PR00020` | Two syntaxes for same thing. Violates P9.1. |

### Consequences

1. **Schema changes**:
   - Add `calls` property to `Step` (array of `ProcessCall`)
   - Add `ProcessCall` type definition
   - Remove `processRef` from `Step`
   - Remove `triggers` from `Process`
   - Remove `ProcessTrigger` type

2. **Validation changes**:
   - Validate `calls[].process` resolves to valid ProcessRef
   - Check for cycles in call chains (optional)

3. **Projection mapping**:
   - `mode: sync` → BPMN Call Activity
   - `mode: async` + `on: complete` → BPMN Intermediate Signal Throw Event
   - `mode: async` + `on: error` → BPMN Intermediate Error Throw Event

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P1.1** No Dual Hierarchy | Single mechanism for cross-process invocation |
| **P4.1** Semantic Properties Required | `mode` property explicitly distinguishes sync/async |
| **P4.4** No Hidden Defaults | `mode` is required, no inference from property presence |
| **P6.1** Business Vocabulary First | `calls` is natural language ("this step calls that process") |
| **P9.1** No Alternative Representations | One syntax: `calls: [{process: ..., mode: ...}]` |
| **P10.1** Element Types as Semantic Primitives | Clear mapping to BPMN Call Activity and Events |

---

## DD-002: Links for Intra-Process Flow Only

**Status**: Accepted

### Context

Links model relationships between steps. We needed to clarify their scope.

### Decision

Links connect steps within the same process only. They do not cross process boundaries.

```yaml
# Valid: step to step
links:
  - from: ST00001
    to: ST00002

# Invalid: step to process (use calls instead)
links:
  - from: ST00001
    to: PR00002  # ❌ Not allowed
```

### Rationale

1. **Semantic clarity**: Links = routing/flow, Calls = process invocation
2. **BPMN alignment**: Sequence flows connect activities within a pool
3. **Single source of truth**: Cross-process invocation handled by `calls`

### Consequences

- `Link.from` and `Link.to` accept `StepRef` only
- Cross-process relationships use `Step.calls`
- Validator enforces this constraint

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P9.1** No Alternative Representations | Links for flow, calls for invocation |
| **P10.1** Element Types as Semantic Primitives | Links → BPMN Sequence Flow |

---

## DD-003: Step Grouping and Nesting

**Status**: Accepted

### Context

Analysts need to group steps for different purposes:
1. **Organizational view**: "Which phase/stage is this step in?"
2. **Execution semantics**: "Do these steps run in parallel? In a loop?"
3. **Process reuse**: "This step invokes a whole other process"

We needed a clear, non-overlapping design that handles all cases without giving analysts multiple ways to achieve the same outcome.

### Decision

UBML provides **three distinct mechanisms** for step grouping, each with a unique purpose:

| Mechanism | ID Pattern | Purpose | Execution Effect |
|-----------|------------|---------|------------------|
| **Phases** | `PH#####` | Organizational overlay | None (metadata) |
| **Blocks** | `BK#####` | Execution control flow | Yes (par, alt, loop, opt) |
| **calls** | (on Step) | Cross-process invocation | Yes (sync/async) |

#### Phases — "What stage is this step in?"

Phases provide an organizational overlay without affecting execution. Use for lifecycle stages, delivery phases, and reporting views.

```yaml
phases:
  PH00001:
    name: "Discovery Phase"
    kind: lifecycle
    includeSteps: [ST00001, ST00002, ST00003]
  
  PH00002:
    name: "MVP Scope"
    kind: delivery
    startMilestone: ST00010
    endMilestone: ST00050
```

**BPMN Projection**: Swimlane backgrounds or collapsible groups (visual only)

#### Blocks — "How do these steps execute together?"

Blocks define execution semantics: parallel, alternative, optional, loop.

```yaml
blocks:
  BK00001:
    name: "Parallel Inspections"
    operator: par
    steps: [ST00010, ST00011, ST00012]
  
  BK00002:
    name: "Priority Routing"
    operator: alt
    operands:
      BK00003:
        guard: "priority == 'urgent'"
        steps: [ST00020]
      BK00004:
        guard: "priority == 'normal'"
        steps: [ST00021]
  
  BK00005:
    name: "Quality Loop"
    operator: loop
    guard: "qualityScore < 0.95"
    maxIterations: 5
    steps: [ST00030, ST00031]
```

**BPMN Projection**: 
- `par` → Parallel Gateway (fork/join)
- `alt` → Exclusive Gateway
- `opt` → Exclusive Gateway with skip path
- `loop` → Loop marker or gateway cycle

### Parallel Execution in Detail

UBML supports parallelism at two levels:

#### 1. Parallel Steps (within a process)

Use `operator: par` on a Block to run steps concurrently:

```yaml
# Process with parallel inspections
PR00001:
  name: "Building Inspection"
  steps:
    ST00001: { name: "Schedule Inspection", kind: action }
    ST00010: { name: "Electrical Inspection", kind: action }
    ST00011: { name: "Plumbing Inspection", kind: action }
    ST00012: { name: "Structural Inspection", kind: action }
    ST00020: { name: "Compile Report", kind: action }
  
  blocks:
    BK00001:
      name: "Parallel Inspections"
      operator: par
      steps: [ST00010, ST00011, ST00012]
  
  links:
    - from: ST00001
      to: BK00001      # Link TO the block (fork point)
    - from: BK00001
      to: ST00020      # Link FROM the block (join point)
```

**BPMN Projection:**

```
[Schedule] → ◇(+) → [Electrical]  → ◇(+) → [Compile]
                  → [Plumbing]   ↗
                  → [Structural] ↗
           (fork)              (join)
```

#### 2. Parallel Processes (cross-process)

Use `calls` with `on: complete` to trigger processes asynchronously:

```yaml
ST00100:
  name: "Order Confirmed"
  kind: action
  calls:
    - process: PR00010  # Sync: Inventory Check (must complete)
    - process: PR00020
      on: complete      # Async: Notification (fires and continues)
    - process: PR00030
      on: complete      # Async: Analytics (fires and continues)
```

**BPMN Projection:**

```
[Order Confirmed] → [Inventory Check (Call Activity)]
                  → ○⟩ Signal: Trigger PR00020
                  → ○⟩ Signal: Trigger PR00030
```

#### Projection to Standard Diagrams

| UBML Construct | BPMN 2.0 | ArchiMate | EPC |
|----------------|----------|-----------|-----|
| `Block` with `operator: par` | Parallel Gateway (AND) fork/join | Triggering relationship (parallel) | AND connector |
| `Block` with `operator: alt` | Exclusive Gateway (XOR) | Junction with OR | XOR connector |
| `Block` with `operator: opt` | Exclusive Gateway with empty path | Junction (optional path) | XOR with skip |
| `Block` with `operator: loop` | Loop marker on activity | N/A (use composition) | Loop connector |
| `calls` (sync) | Call Activity | Triggering relationship | Process interface |
| `calls` with `on:` (async) | Signal Throw Event | Flow relationship | Event-driven chain |

#### Nested Parallelism

Blocks can contain nested blocks via `operands`:

```yaml
blocks:
  BK00001:
    name: "Main Parallel Work"
    operator: par
    operands:
      BK00002:
        name: "Documentation Track"
        operator: seq
        steps: [ST00010, ST00011]
      BK00003:
        name: "Technical Track"
        operator: seq
        steps: [ST00020, ST00021, ST00022]
```

**BPMN Projection:**

```
     ◇(+) → [ST00010] → [ST00011] → ◇(+)
(fork)                              (join)
     ◇(+) → [ST00020] → [ST00021] → [ST00022] → ◇(+)
```

#### calls — "What process does this step invoke?"

Cross-process invocation is handled via the `calls` property on individual steps (see DD-001).

```yaml
ST00100:
  name: "Onboard Customer"
  kind: action
  calls:
    - process: PR00050  # Sync: waits for completion
```

**BPMN Projection**: Call Activity

### Why No Inline Nested Steps

We do NOT support inline step definitions (e.g., `steps:` nested inside a step). 

**Reasons:**
1. Creates a third way to group (alongside Blocks and Phases)
2. Inline steps aren't reusable — logic is "trapped"
3. Forces analyst to decide: inline vs. separate file?
4. Blocks already handle execution grouping with richer operators (par, alt, loop)

**Instead:** Create a separate process and reference it via `calls`.

### When to Create a Separate Process

Use this decision tree:

```
Is this work reused in multiple places?
  YES → Separate process + calls
  NO  ↓

Does it have its own lifecycle (versions, ownership, SLAs)?
  YES → Separate process + calls
  NO  ↓

Is it complex enough to warrant its own diagram?
  YES → Separate process + calls
  NO  ↓

Does it involve a different team/department?
  YES → Separate process + calls
  NO  → Keep steps in current process (use Blocks if needed)
```

#### Examples

| Scenario | Recommendation | Why |
|----------|----------------|-----|
| Credit check used by 3 loan products | **Separate process** | Reused across products |
| IT provisioning for new hires | **Separate process** | Owned by IT, has own SLA |
| 15-step quality inspection | **Separate process** | Complex enough for own diagram |
| 3-step approval within a request | **Keep inline** | Simple, not reused |
| Parallel document reviews | **Block (par)** | Execution grouping, same process |
| Steps in "Phase 1" vs "Phase 2" | **Phases** | Organizational view only |

#### Granularity Guidance

| Too Fine | Right Level | Too Coarse |
|----------|-------------|------------|
| "Send Email" as separate process | "Customer Notification" process with email, SMS, push steps | Entire "Order to Cash" in one file |
| "Validate Field X" as separate process | "Order Validation" process with all validations | All company processes in one file |

**Rule of thumb:** A process should be understandable in one diagram view (15-30 steps max). If larger, split by subprocess calls.

### Step Kinds

With grouping handled by Phases, Blocks, and calls, step kinds focus on **individual step semantics**:

| Kind | Meaning | BPMN Projection |
|------|---------|-----------------|
| `action` | Work that transforms inputs to outputs | Task |
| `decision` | Routing choice with multiple outcomes | Exclusive Gateway |
| `milestone` | Significant checkpoint (zero duration) | Intermediate None Event |
| `wait` | Pause for external event or time | Intermediate Catch Event |
| `handoff` | Transfer to another team/actor | Task with lane change |
| `start` | Process entry point | Start Event |
| `end` | Process exit point | End Event |

Additional behaviors (approval, review, notification) are modeled as **properties on steps**, not as additional kinds (P10.2).

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P1.1** No Dual Hierarchy | Each grouping need has exactly one mechanism |
| **P9.1** No Alternative Representations | No choice between inline/external for nesting |
| **P10.1** Element Types as Semantic Primitives | Phases, Blocks, Steps each have clear BPMN mapping |
| **P10.2** Behavioral Richness via Properties | Approval, review = properties, not kinds |

---

## DD-004: Why No Shorthand Syntaxes

**Status**: Accepted

### Context

Developers often request shorthand syntaxes for convenience (e.g., scalar instead of array, abbreviated property names). We reject all such requests.

### Decision

UBML provides exactly **one syntax** for each concept. No shorthands.

### Rationale

From P9.1:
> "One way to express a thing means one pattern to learn, one pattern to parse, one pattern to validate."

**Costs of shorthands**:
1. Users must learn multiple patterns
2. Tooling must parse multiple patterns
3. Validation must handle multiple patterns
4. Docs must explain multiple patterns
5. AI assistants generate inconsistent output

**Benefits of shorthands**:
1. Fewer keystrokes

The benefits don't justify the costs.

### Consequences

- Schema allows exactly one structure per concept
- Tooling rejects alternative syntaxes

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P9.1** No Alternative Representations | One syntax only |
| **P9.2** No Shorthand Properties | Canonical form exclusively |

---

## DD-005: Process Isolation and Cross-Process Coordination

**Status**: Accepted

### Context

When modeling systems with multiple processes, analysts need to express cross-process relationships:
- "When Order Approved, trigger Fulfillment process"
- "This step calls the Credit Check subprocess and waits"

The question: **how should cross-process coordination be expressed?**

### Decision

**Steps are isolated within their process.** Cross-process coordination uses the `calls` property on steps — the only mechanism for process-to-process relationships.

#### What's Supported

| Relationship | Mechanism | BPMN Projection |
|--------------|-----------|-----------------|
| Step → Step (same process) | `links` array | Sequence Flow |
| Step invokes Process (sync) | `calls: [{process: PR###}]` | Call Activity |
| Step triggers Process (async) | `calls: [{process: PR###, on: complete}]` | Signal Throw Event |

#### What's NOT Supported

- **Cross-process step references** — linking directly from a step in one process to a step in another
- **Program-level dependencies** — scheduling relationships (FS, SS, FF, SF) between processes at a portfolio level

### Why No Program-Level Dependencies?

We considered adding process-to-process scheduling (FS, SS, FF, SF) at a "program" level but rejected it:

| Issue | Principle Violated |
|-------|-------------------|
| Creates second way to express cross-process (alongside `calls`) | P9.1 No Alternative Representations |
| No BPMN equivalent for process-to-process scheduling | P10.5 New Primitives Require Projection |
| BPMN uses Message Flows to pool boundaries, not task-to-task | P10.1 Element Types as Semantic Primitives |
| Redundant with `calls` semantics | P1 Single Source of Truth |

### Why No Cross-Process Step References?

| Problem | Impact |
|---------|--------|
| **Breaks encapsulation** | Process internals become external contracts |
| **Tight coupling** | Can't refactor steps without checking all other processes |
| **BPMN incompatible** | BPMN connects pools via message events, not task-to-task |
| **Projection complexity** | ArchiMate, EPC don't model cross-pool step links |

### BPMN Pattern

```
┌─────────────────────────────────────────────────┐
│ Pool A (Process 1)                              │
│ [Task A] → [Task B] → ○) Signal Throw           │
└─────────────────────────────────────────────────┘
                              ↓ (signal)
┌─────────────────────────────────────────────────┐
│ Pool B (Process 2)                              │
│                     (○ Signal Catch → [Task C]  │
└─────────────────────────────────────────────────┘
```

Cross-process coordination happens through **events**, not direct task links. UBML's `calls` with `on:` maps directly to this pattern.

### Consequences

1. **Processes are self-contained** — can be moved, reused, versioned independently
2. **Single mechanism** — only `calls` for cross-process, no alternatives
3. **Clean projection** — maps directly to BPMN Call Activity / Signal Events
4. **Scheduling within process** — FS, SS, FF, SF via `links`, not across processes

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P1.1** No Dual Hierarchy | Process is the encapsulation boundary |
| **P9.1** No Alternative Representations | Only `calls` for cross-process |
| **P10.1** Element Types as Semantic Primitives | Process = Pool, clean separation |
| **P10.5** New Primitives Require Projection | No constructs without BPMN mapping |

---

## DD-006: Template-Instance Separation

**Status**: Accepted

### Context

UBML is used for both:
1. **Repeatable processes** — Insurance claims, order fulfillment (many instances/day)
2. **Project methodologies** — Construction, consulting engagements (unique instances)

The question: **should UBML model templates or instances?**

### Decision

**UBML models templates (methodologies), not instances (executions).**

```
┌─────────────────────────────────────────────────────────────────────┐
│ UBML = TEMPLATE LAYER                                               │
│ "Build House" process with steps, durations, dependencies           │
└─────────────────────────────────────────────────────────────────────┘
                          ↓ Export / Instantiate
┌─────────────────────────────────────────────────────────────────────┐
│ OPERATIONAL LAYER (MS Project, BPMS, etc.)                          │
│ "123 Oak Street" project with actual dates, crews, % complete       │
└─────────────────────────────────────────────────────────────────────┘
```

### What UBML Models (Template)

| Concern | In UBML |
|---------|---------|
| Steps and their sequence | ✅ Yes |
| Base durations and effort | ✅ Yes |
| Dependencies (FS, SS, FF, SF) | ✅ Yes |
| Roles (RACI) | ✅ Yes |
| Skills required | ✅ Yes |
| Costs (rates, fixed costs) | ✅ Yes |
| Conditions and routing | ✅ Yes |

### What UBML Does NOT Model (Instance)

| Concern | Why Not | Where It Lives |
|---------|---------|----------------|
| Actual calendar dates | P10.4 — Operational data | MS Project, BPMS |
| Specific person assignment | P10.4 — Roles vs persons | HR/Resource systems |
| % Complete tracking | Execution state | BPMS, Project tools |
| Resource leveling | Portfolio concern | MS Project |
| Actual vs planned | Execution tracking | Process mining, BI |

### Value for Project-Centric Customers

For customers whose business is managing projects (construction, consulting), UBML provides:

1. **Project Methodology Library** — standardized templates for project types
2. **Documented Dependencies** — FS, SS, FF, SF with lag already in schema
3. **Skill/Resource Requirements** — who needs to be available
4. **Quality Gates** — approvals, reviews as step properties
5. **Export to MS Project** — instantiate template with actual dates

### Rationale

Mixing templates and instances creates:
- Schema complexity (optional date fields everywhere)
- Validation ambiguity (is missing date an error or "not yet scheduled"?)
- Projection confusion (BPMN = template, not execution state)

Clean separation follows **P10.4**: *"Separation of Modeling and Operational Concerns"*

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P10.4** Separation of Modeling and Operational | Templates in UBML, instances in tooling |
| **P7.1** Lossless Round-Trip Not Required | Export to MS Project is intentionally one-way |

---

## DD-007: Scenarios for Business Situation Modeling

**Status**: Accepted

### Context

Consulting engagements require:
1. Understanding the **current business situation** (volumes, case mix, costs)
2. Building **business cases** for proposed changes
3. Calculating **ROI** for change initiatives
4. Validating models against **process mining data**

The question: **how do analysts describe typical business situations in UBML?**

### Decision

**Scenarios describe typical business situations** that enable ROI and business case analysis. They capture:

- **What work exists**: Case types and their proportions (work mix)
- **How work arrives**: Volume patterns and seasonality
- **What varies**: Case attributes affecting routing and duration
- **What we observed**: Historical evidence from operations/mining

```
┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO — Typical Business Situation                               │
├─────────────────────────────────────────────────────────────────────┤
│ Work Mix:       Standard (70%), Complex (20%), Expedited (10%)      │
│ Arrivals:       127/day, Poisson, Q4 +20% seasonality               │
│ Attributes:     Region (North/South/West), Order Value ($0-50k)     │
│ Evidence:       Step X takes 45min (Celonis, 95% confidence)        │
└─────────────────────────────────────────────────────────────────────┘
                                    +
┌─────────────────────────────────────────────────────────────────────┐
│ HYPOTHESIS — Proposed Change                                        │
├─────────────────────────────────────────────────────────────────────┤
│ SCQH:    "Order processing takes 5 days; customers expect 2"        │
│ Hypothesis: "Automate data entry to save 0.5 days"                  │
│ Impact:   Step ST00010: duration 45min → 5min                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BUSINESS CASE — Scenario + Hypothesis                               │
├─────────────────────────────────────────────────────────────────────┤
│ Current cost per case:  $42 (from scenario simulation)              │
│ Proposed cost per case: $28 (applying hypothesis)                   │
│ Annual volume:          46,355 cases (127/day × 365)                │
│ Annual savings:         $650k                                       │
│ Implementation cost:    $200k                                       │
│ ROI:                    225% first year                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Two Complementary Purposes

| Component | Purpose | Contains |
|-----------|---------|----------|
| **Scenario** | Describe typical situations | Work mix, arrivals, attributes, evidence |
| **Hypothesis** | Propose changes | SCQH framing, hypothesis trees, recommendations |
| **Together** | Calculate ROI | Current state (scenario) vs. future state (scenario + hypothesis) |

**Scenarios enable "what-if" analysis:**
- "What if volume doubles?" → SC00002 with 2x arrival rate
- "What if we automate?" → SC00003 with updated evidence
- "What if seasonality shifts?" → SC00004 with different Q4 factor

**Hypotheses enable structured reasoning:**
- Frame problem with SCQH (Situation-Complication-Question-Hypothesis)
- Decompose into testable sub-hypotheses
- Track validation status and confidence

### Scenario Structure

Scenarios describe the **business reality** that processes operate within:

```yaml
scenarios:
  SC00001:
    name: "Current State (2024)"
    description: "Baseline from process mining data"
    
    # What types of work exist?
    workMix:
      - name: "Standard Order"
        probability: 0.72
        description: "Orders under $10k, single approval"
      - name: "Complex Order"
        probability: 0.18
        description: "Orders over $10k, requires VP approval"
      - name: "Return/Refund"
        probability: 0.10
        description: "Customer returns and refund processing"
    
    # How does work arrive?
    arrivals:
      pattern: poisson
      rate: 127
      rateUnit: per-day
      seasonality:
        Q1: 0.85
        Q4: 1.20
    
    # What varies across cases?
    workAttributes:
      region:
        type: categorical
        values:
          - { name: North, probability: 0.3 }
          - { name: South, probability: 0.5 }
          - { name: West, probability: 0.2 }
      orderValue:
        type: numeric
        distribution: lognormal
        mean: 5000
        stdDev: 3000
    
    # What did we observe?
    evidence:
      - type: duration
        step: ST00010
        metric: processingTime
        value: "45min"
        source: "Celonis - median 2024"
        confidence: 0.95
    
    simulationConfig:
      runLength: "90d"
      replications: 20
```

### Hypothesis Structure

Hypotheses use the **SCQH framework** (Situation-Complication-Question-Hypothesis) from management consulting:

```yaml
hypotheses:
  HT00001:
    name: "Order Processing Improvement"
    
    scqh:
      situation: "Order processing averages 5 days end-to-end"
      complication: "Customers expect 2-day delivery"
      question: "How can we reduce processing to 2 days?"
      hypothesis: "Automate data entry and streamline approvals"
    
    root:
      HY00001:
        text: "We can achieve 2-day processing"
        operator: and
        children:
          - id: HY00002
            text: "Approval delays can be reduced by 2 days"
            type: hypothesis
            status: validated
            confidence: 0.85
          - id: HY00003
            text: "Automation saves 0.5 days on data entry"
            type: hypothesis
            status: untested
```

### Connecting Scenarios and Hypotheses

**For ROI analysis, create scenario variants that reflect hypothesis outcomes:**

```yaml
scenarios:
  SC00001:
    name: "Current State"
    description: "Baseline situation"
    # ... full definition
  
  SC00002:
    name: "Post-Automation"
    description: "After implementing HT00001 hypothesis"
    basedOn: SC00001
    evidence:
      - type: duration
        step: ST00010
        metric: processingTime
        value: "5min"  # Was 45min, now automated
        source: "Projected (vendor benchmark)"
        confidence: 0.70
```

**Business case flow:**
1. Define current state scenario (SC00001) with evidence
2. Simulate to establish baseline metrics
3. Create hypothesis with proposed change
4. Create future scenario (SC00002) applying hypothesis
5. Simulate future scenario
6. Calculate ROI = (Baseline cost - Future cost) × Volume

### Process Mining Integration

The `evidence` array grounds scenarios in observed reality:

```yaml
evidence:
  # Step-level measurements (from mining)
  - type: duration
    step: ST00020
    metric: processingTime
    value: "2.5h"
    source: "Celonis export - P50"
    confidence: 0.90
  
  - type: duration
    step: ST00020
    metric: waitTime
    value: "18h"
    source: "Celonis export - P50"
    confidence: 0.85
  
  # Process-level measurements
  - type: count
    process: PR00001
    metric: dailyVolume
    value: 127
    period: "2024-01"
    source: "Mining dashboard"
  
  # Cost measurements
  - type: cost
    step: ST00010
    metric: laborCost
    value: 42.50
    source: "Finance team estimate"
    confidence: 0.70
```

**Evidence confidence levels:**
- 0.95+: Direct measurement from reliable system
- 0.80-0.95: Mining data with reasonable sample size
- 0.60-0.80: Expert estimate or limited data
- <0.60: Rough estimate, needs validation

### Scenario Variants for What-If Analysis

Use `basedOn` for efficient variant modeling:

```yaml
scenarios:
  SC00001:
    name: "Current State"
    # ... full baseline
  
  SC00002:
    name: "2x Volume Growth"
    description: "What if demand doubles?"
    basedOn: SC00001
    arrivals: { pattern: poisson, rate: 254, rateUnit: per-day }
  
  SC00003:
    name: "After RPA Implementation"
    description: "Applying automation hypothesis HT00001"
    basedOn: SC00001
    evidence:
      - type: duration
        step: ST00010
        metric: processingTime
        value: "5min"  # Was 45min before RPA
        source: "Vendor benchmark"
  
  SC00004:
    name: "Pessimistic (Seasonality Spike)"
    description: "What if Q4 demand increases 50%?"
    basedOn: SC00001
    arrivals:
      pattern: poisson
      rate: 127
      rateUnit: per-day
      seasonality: { Q1: 0.85, Q4: 1.50 }  # More extreme Q4
```

### Why Scenarios Separate from Processes?

| If in Process | Problem |
|---------------|---------|
| Work mix | Template becomes situation-specific, not reusable |
| Arrival rates | Brisbane != Melbourne != Sydney |
| Mining evidence | Process cluttered with historical observations |
| Simulation config | Tooling concerns leak into model |

**Separation enables:**
- Same process template, different scenarios per client/region
- Clean BPMN projection (no simulation constructs in BPMN)
- Evidence updated without changing process definition
- Version process and scenarios independently

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P10.4** Separation of Modeling and Operational | Scenario = business situation, Process = template |
| **P7.2** Import Should Enrich | Mining data enriches via evidence, not by changing process |
| **P3.2** References for Cross-Cutting | Scenarios reference processes, don't contain them |
| **P3.5** Coherent Model Boundaries | Scenarios + Hypotheses enable focused ROI analysis |

---

## DD-008: Knowledge Architecture — Sources and Insights

**Status**: Accepted (v1.3)

### Context

Consulting engagements generate vast amounts of unstructured knowledge: interview transcripts, meeting notes, documents, emails, surveys, corridor conversations, research findings. This knowledge feeds into the UBML model but has no formal place in the language.

Without a knowledge layer:
- Model elements appear without justification ("why does this step exist?")
- Knowledge lives in consultants' heads, email threads, and shared drives
- When consultants rotate off a project, knowledge is lost
- After 2-3 years, nobody remembers why the model looks the way it does

UBML workspaces are intended as long-lived digital twins of organizations (5+ years). They need a systematic way to catalog information sources and the insights derived from them.

### Research

Management consulting firms universally use layered knowledge capture:

| Pattern | Flow |
|---------|------|
| McKinsey | Interview notes → Key findings → Implications → Recommendations |
| BCG | Data room → Fact pack → Insight cards → Hypothesis tree |
| Bain | Source interviews → Issue trees → Validated/invalidated branches |

**Common pattern**: Raw sources → Atomic insights → Structured analysis. Always traceable.

UBML's existing typed reference system (ID prefixes + cross-references) already forms a lightweight knowledge graph. The knowledge layer extends it with two new node types rather than introducing separate infrastructure.

### Decision

#### Three-Layer Truth Architecture

UBML adopts a three-layer model for organizational knowledge:

| Layer | Purpose | ID Pattern |
|-------|---------|------------|
| **Sources** | Catalog of where information comes from | `SR#####` |
| **Insights** | Atomic derived knowledge with human-readable context | `IN#####` |
| **Model** | Interpreted structures (processes, actors, entities…) | existing IDs |

Each layer references the one below. Model elements reference insights via `derivedFrom`. Insights reference sources. This enables traceability from any model element back to its origin.

#### Source (SR#####)

A catalog entry for where information came from. Metadata only — actual content lives in companion files or external URLs (per P12.2).

```yaml
sources:
  SR00001:
    name: "Interview with Warehouse Manager"
    type: interview
    date: "2026-01-15"
    participants: [AC00010, "Jan Novák (external)"]
    description: "90-minute deep dive on order processing pain points"
    tags: [order-processing, warehouse]
    file: "./transcripts/2026-01-15-warehouse-manager.md"
```

**Required properties**: `name` only. Everything else optional (P5.2).

**Source types**: `interview`, `meeting`, `workshop`, `document`, `email`, `survey`, `observation`, `system-export`, `research`

#### Insight (IN#####)

An atomic piece of derived knowledge. Carries enough context to be understood in isolation, years after capture (P12.5).

```yaml
insights:
  IN00001:
    text: "Warehouse staff spend 2 hours daily on manual data entry across SAP, Excel, and the legacy portal"
    kind: pain
    status: validated
    source: SR00001
    attribution: "Karel Dvořák, Warehouse Manager"
    date: "2026-01-15"
    confidence: 0.85
    about: [AC00010, EN00005]
    context: |
      Mentioned during discussion about daily routines. Karel demonstrated
      the three-system workflow on his screen. Visibly frustrated.
    tags: [data-entry, manual-work]
    related: [IN00002, IN00005]
    supersedes: IN00042
```

**Required properties**: `text` only. A consultant in a rush can write:

```yaml
  IN00099:
    text: "CFO mentioned budget freeze until Q3"
```

**Insight kinds**: `pain`, `opportunity`, `process-fact`, `stakeholder`, `decision`, `risk`, `assumption`, `constraint`

**Status lifecycle**: `proposed` → `validated` | `disputed` | `retired`

#### Linking to Model (derivedFrom)

Model elements gain an optional `derivedFrom` property (on Step, Actor, Entity, Process, HypothesisNode, KPI):

```yaml
steps:
  ST00015:
    name: "Enter Order Data into SAP"
    kind: action
    derivedFrom: [IN00001, IN00003]
```

### Why No "Evidence" Middle Layer

The original plan proposed: Source → Evidence → Claim, where Evidence was a precise pointer (line number, timestamp) into a source document.

| Problem | Impact |
|---------|--------|
| **Brittle references** | Editing a transcript shifts all line numbers |
| **High authoring friction** | Extra record for every insight, little value to readers |
| **Maintenance burden** | Over 5 years, hundreds of pointers would go stale |

Instead, each Insight carries a human-readable `context` field. Context survives reformatting, editing, and the passage of time. Precise pointers do not.

### Terminology: "Evidence" in UBML

The word "evidence" appears in UBML with clear, non-overlapping meanings:

| Location | Meaning |
|----------|---------|
| `HypothesisNode.type: evidence` | Enum value — a hypothesis node backed by evidence |
| `HypothesisNode.evidence` | Free-text string — human-readable evidence description |

Quantitative measurements on Scenarios use the term `observations` (type `Observation`). The knowledge layer uses `SourceRef` (`SR#####`) and `InsightRef` (`IN#####`) for structured traceability.

### Terminology: "Insight" over "Claim"

| Term | Pros | Cons |
|------|------|------|
| **Insight** ✓ | Natural consultant vocabulary, used in deliverables | Slightly implies positive discovery |
| Claim | Precise in knowledge management | Adversarial/legal tone |
| Finding | Natural in formal reports | Too formal for capture mode |

**Decision**: **Insight** (`IN#####`) — matches how consultants talk and works in both quick capture and formal reports.

### Alternatives Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| Source → Evidence → Claim (three-element chain) | Brittle references, high friction, maintenance burden (see above) |
| Single layer (no Sources) | No traceability, can't audit where knowledge came from |
| Free-text markdown notes | Not structured enough for cross-referencing or AI assistance |
| Computed index as source of truth | Violates P1.3 (No Computed Aggregations) |
| Strict required fields on insights | Violates P5.2 and P12.1 |

### Consequences

1. **New types**: `Source`, `Insight`, `SourceRef` (`SR#####`), `InsightRef` (`IN#####`)
2. **New document schemas**: `*.sources.ubml.yaml`, `*.insights.ubml.yaml`
3. **Modified types**: `derivedFrom` property added to core model types
4. **Scenario property**: `observations` (type `Observation`) for quantitative measurements
5. **New file patterns**: `*.sources.ubml.yaml`, `*.insights.ubml.yaml`
7. **Deferred**: LLM extraction, indexing/caching — see `plan/00-design-decisions.md` (deferred items) and `plan/18-future.md`

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P1.1** Single Source of Truth | Each insight exists once; model elements reference, not duplicate |
| **P5.2** Required Properties Minimal | Only `text` required on Insight; only `name` required on Source |
| **P6.1** Business Vocabulary First | "Insight" not "Claim"; "Source" not "Provenance" |
| **P9.1** No Alternative Representations | One way to capture knowledge |
| **P12** Knowledge Capture | Minimal friction, catalog sources, append-friendly, layered truth, context over precision |

---

## References

### External Sources

- **Bruce Silver**: "BPMN Call Activity vs Subprocess: What's the Difference?" (Trisotech Blog)
- **Sebastian Stein**: "Criticizing BPMN" (ARIS Community, 2010)
- **Håvard Jørgensen**: "Simplifying BPMN 2.0" (Active Knowledge Modeling, 2010)
- **OMG**: BPMN 2.0 Specification
- **The Open Group**: ArchiMate 3.2 Specification

### Internal Documents

- [PRINCIPLES.md](PRINCIPLES.md) — Binding design constraints
- [VISION.md](VISION.md) — Product vision and positioning

---

## DD-009: CLI Accepts Only Canonical Format

**Status**: Accepted

### Context

Users sometimes expect forgiving input: "90 days" instead of "90d", "2 hours" instead of "2h". This creates tension between usability (accept what users type) and P9.1 (No Alternative Representations).

### Decision

**CLI tooling must accept only the canonical format defined in the schema.**

When a user provides an invalid format, the CLI must reject it with a clear error message showing the correct format:

```
Invalid duration '90 days'. Use: 90d, 2h, 30min, 1wk, 3mo
Run 'ubml help durations' for format details.
```

The CLI must not silently normalize alternative inputs ("90 days" → "90d").

### Rationale

| Approach | Pros | Cons |
|----------|------|------|
| **Strict (chosen)** | Users learn canonical format; no hidden conversions; tooling stays simple | Requires users to learn format |
| Lenient normalization | Feels forgiving | Creates two valid input surfaces; obscures canonical format; adds parser complexity; invites scope creep ("support more natural language!") |

**P9.1 applies at all input surfaces.** Accepting alternative forms at the CLI contradicts the principle just as much as accepting them in YAML files.

The vision's "forgiving during capture, rigorous when needed" refers to **schema validation strictness** (draft/standard/strict modes), not format leniency. Users can start with incomplete models (missing optional properties), but the properties they do provide must use canonical syntax.

### Alternatives Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| Accept natural language, normalize before writing | Creates complexity creep. Where does it stop? "one and a half days"? "about 2 hours"? |
| Accept both, warn on non-canonical | Still two valid forms. Warning fatigue leads to ignoring warnings. |
| Strict in files, lenient in CLI | Inconsistent. Users copy-paste from CLI to files and get validation errors. |

### Consequences

1. **Error messages must be excellent** — users will hit format errors frequently at first. Messages must show examples and link to help.
2. **Help topics required** — `ubml help durations`, `ubml help references`, etc.
3. **Documentation must be clear** — format specs easily discoverable.

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P9.1** No Alternative Representations | One format, everywhere — schema, CLI, docs |

---

## DD-010: Typed References Only — No String Alternatives

**Status**: Accepted

### Context

When properties refer to concepts that have their own element types in the workspace (actors, processes, sources, insights, entities), there are two possible approaches:

1. Use the typed reference (`ActorRef`, `ProcessRef`, `SourceRef`, etc.)
2. Accept a plain string, either exclusively or as a union (`oneOf: [Ref, string]`)

Strings can't be traced, validated, queried, or deduplicated. They create parallel identity systems where the same real-world thing exists as both a typed element and an unlinked text fragment.

### Decision

**Every property that refers to a modeled concept must use the corresponding typed reference. No string alternatives.**

This applies uniformly to all element types — actors, sources, insights, processes, entities, and any future types.

Examples:
- `Source.participants`: `ActorRef[]` — even for external people
- `Insight.attribution`: `ActorRef` — who said/wrote this
- `Process.owner`: `ActorRef` — accountable person
- `Step.responsible`: `ActorRef[]` — RACI responsible

When a referenced element doesn't exist yet, create it first. External people (clients, vendors, interviewees) use `Actor` with `type: external`. The CLI makes this fast (`ubml add actor`).

### Alternatives Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| `Ref \| string` unions for progressive refinement | Two identity systems. Strings become permanent. Violates P1.5. |
| String-only properties for simplicity | No linkage to model. Can't trace, query, or validate. |
| Mix of ref-only and string-only by property | Inconsistent. Users must remember which properties allow strings. |

### Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **P1.5** Typed References for Modeled Concepts | If the concept is modeled, use the model |
| **P9.1** No Alternative Representations | One way to reference a concept |
| **P12.6** Single Provenance Path | No side channels that bypass the formal chain |
