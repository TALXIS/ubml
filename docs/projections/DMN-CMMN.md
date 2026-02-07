# DMN & CMMN Projection

> UBML ↔ Decision Model and Notation (OMG) / Case Management Model and Notation (OMG)

**Status:** Exploratory — mapping depth depends on user demand.

DMN and CMMN are OMG companion standards to BPMN. Both address modeling concerns that UBML handles only partially: structured decision logic (DMN) and unstructured, event-driven case work (CMMN).

---

## DMN 1.4 (Decision Model and Notation)

### UBML → DMN Mapping

UBML decisions are **lightweight branch points** in a process flow. DMN models decisions as **first-class artifacts** with rich internal logic.

| UBML Concept | DMN Element | Notes |
|-------------|------------|-------|
| Step (`kind: decision`) | Decision | The decision point |
| Step.guard (Expression) | Decision Logic (simplified) | UBML expressions ≠ FEEL |
| Link.condition | Input Data → Decision | Condition as input |
| Block (`operator: alt`) | Decision Table (loosely) | Multiple branches → rows |
| Entity (as step input) | Input Data | Data feeding the decision |

### UBML Information Lost on DMN Export

| UBML Concept | Why Lost |
|-------------|----------|
| Full process flow around the decision | DMN models decisions in isolation, not embedded in flow |
| RACI on the decision step | DMN has no performer concept |
| Duration, effort, cost | DMN is logic, not operations |
| Approval/review on decision | DMN decisions are automated logic, not human gates |
| All non-decision steps | DMN only represents decisions |

### DMN Concepts UBML Cannot Capture

This is where the significant gap lies. DMN is a deep standard for decision modeling; UBML's decision concept is intentionally shallow.

| DMN Concept | Description | UBML Gap | Severity |
|------------|-------------|----------|----------|
| **Decision Table** | Structured table with input columns, output columns, and rules (rows). Hit policies determine how multiple matching rules combine. | UBML `alt` blocks with conditions are the closest parallel, but they model *flow branching*, not *tabular decision logic*. There is no way to express "if age > 65 AND income < 30K then risk = high" as a structured table. | **High** |
| **Hit Policies** | Unique, Any, Priority, First, Output Order, Rule Order, Collect (sum/min/max/count). | No equivalent. UBML `alt` is exclusive (one branch taken). No concept of collecting/aggregating from multiple matching conditions. | **High** |
| **FEEL Expression Language** | Friendly Enough Expression Language — a standardized, typed expression language for decision logic. Date arithmetic, list operations, contexts, ranges, typed functions. | UBML uses a TypeScript-subset `Expression`. Different syntax, different type system, different built-in functions. Not interchangeable. | **Medium** |
| **Business Knowledge Model (BKM)** | Reusable decision logic (like a function) that can be invoked from multiple decisions. Parameterized, composable. | No equivalent. UBML doesn't model reusable decision logic. Each decision is a one-off branch point in a specific process. | **Medium** |
| **Decision Requirements Diagram (DRD)** | Visual graph of decisions, their input data, knowledge sources, and information requirements. Shows which data feeds which decisions. | No equivalent. UBML processes show flow, not decision dependency graphs. The relationship between a decision step and its data inputs exists (via `inputs`), but isn't rendered as a DRD. | **Medium** |
| **Knowledge Source** | Authority for a decision (regulation, policy, domain expert). | UBML knowledge layer has Sources and Insights, but these connect to model elements generally, not specifically to decision logic. No "this regulation governs this decision table" link. | **Low** |
| **Input Data** | Typed data element feeding a decision. | UBML `DataObjectInput` on steps partially covers this. But DMN input data has a type definition (FEEL type) that UBML doesn't capture. | **Low** |
| **Decision Service** | Encapsulated set of decisions exposed as a service interface. | No equivalent. UBML doesn't model decision services as callable units. | **Low** |
| **Invocation** | One decision invoking a BKM or another decision. | UBML `calls` is process-to-process. Decision-to-decision invocation doesn't exist. | **Low** |

**Recommendation:** Treat DMN as a **companion standard**. Reference DMN decision models from UBML decision steps via `custom` fields or annotations. Don't attempt to embed full decision table semantics in UBML — that defeats the purpose of keeping UBML simple for consultants.

**Potential integration pattern:**
```yaml
steps:
  ST00015:
    name: Assess credit risk
    kind: decision
    custom:
      dmn-model: "credit-risk-assessment.dmn"
      dmn-decision: "CreditRiskDecision"
    inputs:
      - ref: EN00001  # Customer entity
      - ref: EN00005  # Application entity
```

---

## CMMN 1.1 (Case Management Model and Notation)

### UBML → CMMN Mapping

UBML processes are **primarily sequential** with structured control flow (blocks). CMMN models **unstructured, event-driven case work** where activities can happen in any order based on conditions and human discretion.

| UBML Concept | CMMN Element | Notes |
|-------------|-------------|-------|
| Process | Case Plan Model | Top-level container |
| Step (`kind: action`) | Human Task / Process Task | Required or discretionary |
| Step.trigger (`type: event`) | Event Listener | Reacts to events |
| Step (`kind: milestone`) | Milestone | Named achievement point |
| Step with approval | Stage with Manual Activation | Requires human decision |
| Block (`operator: opt`) | Discretionary Item | Optional work |
| Phase | Stage | Grouping of case activities |
| Phase.entryCriteria / .exitCriteria | Entry Criterion / Exit Criterion | Gate conditions |

### UBML Information Lost on CMMN Export

| UBML Concept | Why Lost |
|-------------|----------|
| Sequential flow (links) | CMMN doesn't enforce sequence — activities are event-driven |
| Block operators (par/alt/loop) | CMMN uses sentries, not structured blocks |
| Decision steps as gateways | CMMN decisions are stages with manual activation, not flow gateways |
| Full RACI model | CMMN has only "performer" role on tasks |
| Scheduling dependencies | No scheduling in CMMN |
| KPIs, scenarios, simulation | CMMN is a plan model, not a performance model |

### CMMN Concepts UBML Cannot Capture

CMMN represents a fundamentally different paradigm from UBML's process-centric approach. The gap is not about missing properties — it's about a different modeling philosophy.

| CMMN Concept | Description | UBML Gap | Severity |
|-------------|-------------|----------|----------|
| **Discretionary vs. Required** | Case workers decide at runtime whether to include discretionary items in the plan. Required items must be completed. | UBML steps are either in the flow or not. No runtime planning concept. An `opt` block is *architecturally* optional (conditional on a guard), not *discretionary* (up to the case worker). | **High** |
| **Planning Table** | Defines which discretionary items a case worker can add to a stage. Combines applicability rules with authorization. | No equivalent. UBML doesn't model who can add what work at runtime. The process is defined upfront. | **High** |
| **Sentries** | Conditions composed of *on-parts* (events) and *if-parts* (boolean conditions) that guard entry into or exit from stages, tasks, and milestones. They combine event listening with data conditions. | UBML has `Phase.entryCriteria`/`exitCriteria` (text strings) and `Step.guard` (expression). But these are *structural* guards, not *reactive* sentries. A CMMN sentry fires when an event occurs AND a condition is true. UBML guards are evaluated when flow reaches the step. | **High** |
| **Case File Item** | A data object with lifecycle states that can trigger sentries when it changes. The case file is the central data store driving the case forward. | UBML entities have lifecycle states, but entity state changes don't automatically trigger process behavior. There's no "when Order transitions to Approved, activate the Fulfillment stage" reactive binding. | **Medium** |
| **Repetition Rule** | Tasks or stages that can repeat based on a condition, independent of explicit loop constructs. | UBML has `Loop` on steps, but it's a structural construct (rework/repeat/forEach). CMMN repetition is ad-hoc — a task can re-enter planning when conditions change. | **Medium** |
| **Manual Activation Rule** | A ready task doesn't automatically start — it waits for a case worker to manually activate it. | No equivalent. UBML steps execute when reached in the flow. No concept of "ready but waiting for human activation." The `approval` construct is close but has different semantics. | **Medium** |
| **Case Worker Discretion** | The fundamental paradigm: case workers adapt the plan as the case unfolds. The model provides structure and guidance, but humans decide the actual plan. | UBML processes are *prescriptive* — the model defines the flow. Consultants can model "as-is" messy processes, but the notation assumes a definable sequence. Case management's core value — structured flexibility — doesn't fit UBML's flow-oriented design. | **High** |
| **Auto-Complete Rule** | Stages/tasks that automatically complete when sub-items finish, without explicit end events. | No equivalent. UBML processes require explicit `end` steps or links to termination. | **Low** |

**Recommendation:** Export to CMMN only for processes where event-driven, unstructured work dominates. Specifically, when `Step.trigger.type: event` is the primary activation pattern and many blocks are `opt`.

For most UBML models, CMMN export would strip away the carefully designed process flow and leave a flat bag of activities — which defeats the purpose of the modeling work.

**Potential integration pattern:** Like DMN, treat CMMN as a companion standard for specific use cases:
```yaml
steps:
  ST00030:
    name: Handle customer complaint
    kind: subprocess
    description: >
      This is a case-management scenario — activities happen
      in response to events, not in a fixed sequence.
    custom:
      cmmn-model: "complaint-handling.cmmn"
    annotations:
      - type: note
        text: "Exported to CMMN for case management tooling"
```

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
