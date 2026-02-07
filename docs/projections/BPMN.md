# BPMN 2.0.2 Projection

> UBML ↔ Business Process Model and Notation (OMG, ISO 19510)

**Status:** Stable — core mapping well-defined.

BPMN is the **primary process export target**. UBML process models project to BPMN Collaboration Diagrams with Pools, Lanes, and a full flow object graph.

---

## UBML → BPMN Mapping

### Step Kind → BPMN Element

| UBML Step.kind | BPMN Element | BPMN Category | Notes |
|----------------|-------------|---------------|-------|
| `action` | Task / User Task | Activity | Default → Task. With RACI → User Task. With `systems` → Service Task. |
| `decision` | Exclusive Gateway (XOR) | Gateway | With `alt` block. May project to Inclusive Gateway when conditions overlap. |
| `milestone` | Intermediate Event | Event | Typically None Event. With `deadline` → Timer Intermediate Event. |
| `start` | Start Event | Event | None by default. With `trigger.type: event` → Message/Signal Start. |
| `end` | End Event | Event | None by default. |
| `wait` | Intermediate Timer Event | Event | Timer Catch. With `trigger.type: event` → Message Catch. |
| `handoff` | Send Task + Receive Task | Activity | Message exchange. Projects to Throw/Catch at pool boundaries. |
| `subprocess` | Embedded Sub-Process | Activity | Expanded with nested flow. With `calls` → Call Activity. |

### ProcessCall → BPMN Element

| UBML ProcessCall | BPMN Element | Behavior |
|------------------|-------------|----------|
| `calls[].on` absent (sync) | Call Activity | Step waits for called process |
| `calls[].on: complete` (async) | Intermediate Signal Throw Event | Fire-and-forget on completion |
| `calls[].on: error` (async) | Intermediate Error Throw Event | Fire-and-forget on error |
| `calls[].on: timeout` (async) | Intermediate Timer Throw Event | Fire-and-forget on timeout |

### Block Operator → BPMN Gateway

| UBML Block.operator | BPMN Element | Notes |
|---------------------|-------------|-------|
| `seq` | *(no gateway)* | Sequential Sequence Flows |
| `par` | Parallel Gateway (AND) | Fork before, join after |
| `alt` | Exclusive Gateway (XOR) | `guard` → condition expression |
| `opt` | Inclusive Gateway (OR) | Optional branch |
| `loop` | Loop marker on sub-process | Or XOR with back-edge |
| `break` | Error/Terminate End Event | Within enclosing sub-process |

### Link → BPMN Connecting Object

| UBML Link Property | BPMN Element | Notes |
|-------------------|-------------|-------|
| `from`/`to` | Sequence Flow | Core connection |
| `condition` | Condition Expression | On the Sequence Flow |
| `isDefault: true` | Default Sequence Flow | Diagonal slash marker |
| `probability` | *(extension)* | Preserved as BPSim extension attribute |
| `label` | Sequence Flow name | Display text |
| `schedule.type` | *(lost)* | FS/SS/FF/SF have no BPMN equivalent |
| `dataBindings` | Data Association | Links data objects to activities |

### Actor → BPMN Participant

| UBML Actor.type | BPMN Element | Notes |
|----------------|-------------|-------|
| `organization` | Pool | Top-level participant boundary |
| `system` | Pool | Separate pool for system interactions |
| `role` | Lane | Swim lane within pool |
| `team` | Lane | Swim lane within pool |
| `person` | Lane | Named individual lane |
| `external` | Collapsed Pool | Black-box participant |
| `customer` | Collapsed Pool | External customer |

### RACI → BPMN Assignment

| UBML RACI | BPMN Mapping |
|-----------|-------------|
| `responsible` | Activity placed in this actor's Lane |
| `accountable` | Text Annotation (no direct equivalent) |
| `consulted` | Message Flow to/from actor's Lane |
| `informed` | Message Flow (one-way) to actor's Lane |

### Information Objects → BPMN Data

| UBML Concept | BPMN Element |
|-------------|-------------|
| Entity (step input) | Data Object (Input) |
| Entity (step output) | Data Object (Output) |
| Document | Data Object with document marker |
| Entity with `lifecycle` | Data Object with state labels |

### Phase → BPMN

Phases have **no direct BPMN equivalent**. Options:
- **Group artifact** (recommended) — BPMN Group wrapping phase steps
- **Text Annotation** — Attached to first step
- **Sub-Process boundaries** — Changes flow semantics (not recommended)

### Process-Level Properties

| UBML Property | BPMN Mapping |
|--------------|-------------|
| `Process.name` | Process name attribute |
| `Process.description` | Documentation element |
| `Process.level` | *(lost)* — L1–L4 is UBML-specific |
| `Process.startsWith` | Start Events |
| `Process.endsWith` | End Events |
| `Process.tags` | *(lost)* |
| `Process.custom` | Extension elements |

---

## UBML Information Lost on BPMN Export

| UBML Concept | Why Lost |
|-------------|----------|
| Knowledge layer (sources, insights, glossary) | BPMN has no knowledge representation |
| Hypothesis trees, SCQH framework | BPMN is flow-oriented, not analytical |
| Scenarios, simulation config | Partially preserved via BPSim extension |
| ROI analysis, KPIs | BPMN has no metrics model |
| Personas, pain points, motivations | BPMN has no stakeholder analysis |
| Scheduling constraints (ASAP, must-start-on) | BPMN is not a scheduling tool |
| `Step.effort` vs `Step.duration` | BPMN has only duration (via BPSim) |
| Capability and value stream context | BPMN scope is process only |
| Evidence traceability chain | No provenance model in BPMN |
| Actor skills, equipment, resource pools | BPMN has no resource model (use BPSim) |
| Approval/review gate detail | Simplified to User Task |
| Notification configuration | Simplified to Send Task |
| Process hierarchy (L1–L4) | BPMN has no built-in hierarchy concept |
| Entity attributes and relationships | BPMN Data Objects are opaque |

---

## BPMN Concepts UBML Cannot Capture

This is the reverse direction: what a BPMN model can express that has no good UBML representation.

### Choreography & Conversation (High Impact)

| BPMN Concept | Description | UBML Gap |
|-------------|-------------|----------|
| **Choreography Diagram** | Models the sequence of message exchanges between participants as a first-class diagram type. Each choreography task names two participants and a message. | UBML has no inter-organization protocol model. Handoff steps model point-to-point exchanges but not the multi-party choreography contract. |
| **Conversation Diagram** | High-level view of message groups (conversations) between pools. | No equivalent. UBML processes are flow-centric, not message-centric. |
| **Collaboration Diagram (multi-pool)** | Multiple independent pools with Message Flows connecting them. | UBML processes live in separate files. Cross-process links exist but are step-to-step references, not pool-to-pool message flows. The *topology* of a multi-pool collaboration cannot be modeled as a single UBML artifact. |

**Workaround:** Model each participant's process separately. Use `Step.kind: handoff` and `Step.messages` to indicate cross-process communication. Accept that the choreography view is a rendering concern, not a modeling concern.

### Event Model (High Impact)

| BPMN Concept | Description | UBML Gap |
|-------------|-------------|----------|
| **Boundary Events** | Timer, error, message, signal, escalation events *attached to activity boundaries* that interrupt or run in parallel with the activity. | UBML has no event-on-boundary concept. A `deadline.onBreach` partially models timer boundaries, but error/message/signal boundaries are not expressible. |
| **Event Sub-Processes** | Sub-processes triggered by events, either interrupting or non-interrupting the parent. | UBML has no interrupting vs. non-interrupting distinction. `ProcessCall.on: error` is close but limited to error events on completion. |
| **Escalation Events** | Escalation throw/catch between sub-processes and parents. | No escalation mechanism. UBML `notifications` send alerts but don't model escalation chains with catch semantics. |
| **Conditional Events** | Events triggered by data conditions becoming true. | UBML `guard` expressions on steps and links partially cover this but lack the event semantics (repeated evaluation, triggering). |
| **Link Events** | Cross-page connectors within a single process (throw/catch pair). | Not needed — UBML doesn't have page boundaries. Processes can be split via `calls`. |
| **Signal Events (broadcast)** | Signals broadcast to all listeners (unlike messages which are point-to-point). | UBML `ProcessCall.on: complete` is point-to-point, not broadcast. No fan-out signal model. |
| **Multiple/Parallel Event Triggers** | Start or intermediate events waiting for one-of-many or all-of-many trigger conditions. | UBML `trigger` supports single trigger type only. No composite trigger expressions. |

**Workaround:** Use `annotations` with `type: warning` or `type: compliance` to document boundary conditions. Use `Step.calls[].on: error` for the most common case. Accept that UBML's event model is intentionally simpler — full BPMN event semantics require BPMN.

### Transaction & Compensation (Medium Impact)

| BPMN Concept | Description | UBML Gap |
|-------------|-------------|----------|
| **Transaction Sub-Process** | All contained activities treated as atomic — if any fails, all are compensated (rolled back). | UBML has no transaction boundary concept. No compensation semantics. |
| **Compensation Events & Handlers** | Activities with associated compensation handlers that execute during rollback. | No compensation model. If a process fails, UBML captures this as a normal error flow, not as automatic rollback. |
| **Cancel Events** | Cancel end event triggers compensation in transaction. | No cancellation semantics. |

**Workaround:** Model compensation as explicit "undo" steps in an error/exception flow path. Document transaction boundaries using `annotations` or `Phase.exitCriteria`.

### Gateway Complexity (Low–Medium Impact)

| BPMN Concept | Description | UBML Gap |
|-------------|-------------|----------|
| **Complex Gateway** | Synchronization requiring m-of-n incoming tokens before continuing. | UBML `par` is all-or-nothing (AND). No partial join. |
| **Event-Based Gateway** | Waits for one of several events (timer, message, signal) — whichever fires first. | UBML `alt` is data-condition-based. No "race" between events. |
| **Inclusive Gateway (merge)** | Synchronizes any combination of incoming branches that were taken. | UBML `opt` is single-branch only. No multi-branch inclusive merge. |

**Workaround:** Use `alt` with explicit conditions for the most common patterns. Document complex synchronization requirements in step `description` or `annotations`.

### Data & Resources (Low Impact)

| BPMN Concept | Description | UBML Gap |
|-------------|-------------|----------|
| **Data Store** | Persistent data repository accessible across process instances. | UBML `Entity.system` names the master system but doesn't model a persistent store vs. transient data object. |
| **Ad-Hoc Sub-Process** | Unordered set of activities that can be performed in any order. | UBML blocks are all ordered (`seq`, `par`, `alt`, `loop`). No unordered set. |
| **Multi-Instance Activity** | Parallel or sequential execution of N instances (for-each). | UBML `Loop.kind: forEach` exists but is less native than BPMN's multi-instance marker with completion conditions. |
| **Message Payload/Correlation** | Messages carry data payloads and are correlated to process instances by content matchin. | UBML `messages` have a name and channel but no payload schema or correlation key. |

---

## Import Considerations (BPMN → UBML)

When importing BPMN into UBML (P7.2), the following enrichment opportunities exist:

| BPMN Element | UBML Enrichment |
|-------------|-----------------|
| Task | Add RACI, duration, effort, skills, approval/review config |
| Lane | Enrich with actor type, skills, rate, personas |
| Data Object | Elevate to Entity with attributes, relationships, lifecycle |
| Process | Add level (L1–L4), tags, connect to capabilities/value streams |
| *(missing)* | Add hypotheses, KPIs, scenarios, knowledge sources |

Imported BPMN models will have `Step.kind` values automatically assigned based on BPMN element types. All UBML-specific properties (knowledge, analysis, strategy) will be empty, awaiting consultant enrichment.

---

## Related: ARIS / EPC (Event-driven Process Chains)

EPCs (Event-driven Process Chains), part of the ARIS framework (Software AG / Prof. Scheer), are used extensively in SAP-ecosystem enterprises. EPCs are functionally a predecessor to BPMN — BPMN 2.0 supersedes most EPC capabilities.

Since UBML already maps fully to BPMN, a separate EPC projection page is unnecessary. This section documents the EPC → UBML equivalences for teams migrating from ARIS.

### EPC → UBML Mapping

| EPC Element | UBML Equivalent | Notes |
|------------|----------------|-------|
| **Function** | `Step` (kind: action) | Unit of work |
| **Event** | `Step` (kind: milestone/start/end) | State change / trigger |
| **XOR Connector** | `Block` (operator: alt) | Exclusive choice |
| **AND Connector** | `Block` (operator: par) | Parallel execution |
| **OR Connector** | `Block` (operator: opt) | Inclusive choice |
| **Organization Unit** | `Actor` (type: team/organization) | Responsible party |
| **Position / Role** | `Actor` (type: role) | Functional assignment |
| **Information Object** | `Entity` | Data flowing through process |
| **Application System** | `Actor` (type: system) | IT system |
| **Process Path** | `Link` | Control flow between elements |
| **Process Interface** | `ProcessCall` | Cross-process reference |

### EPC Concepts with No Direct UBML Equivalent

| EPC / ARIS Concept | UBML Gap |
|-------------------|----------|
| **Event-Function alternation rule** | BPMN/UBML don't enforce strict event↔function alternation. EPC requires every function to start and end with an event. UBML allows direct step-to-step links. |
| **ARIS house views** (Function, Organization, Data, Control, Product/Service) | UBML covers all five domains but doesn't organize them into the ARIS house structure. UBML `View` types are flexible rather than ARIS-prescribed. |
| **FAD (Function Allocation Diagram)** | Shows one function with all its inputs, outputs, actors, and systems. UBML captures this information on `Step` properties but has no single-step-focused view type. |
| **eEPC extensions** (process owners, KPIs on functions, risk indicators) | UBML has all of these (`Step.effort`, RACI, `KPI`, `Annotation.type: risk`) but organized differently. |

### Migration Path: ARIS → UBML

1. Export ARIS processes as BPMN 2.0 (ARIS supports this natively)
2. Import BPMN into UBML using standard BPMN → UBML mapping (above)
3. Enrich with UBML-specific properties: RACI, hypotheses, knowledge, scenarios

Alternatively, map EPC elements directly to UBML using the table above. The Function → Step and Event → Milestone/Start/End mappings are straightforward.

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
