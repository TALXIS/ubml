# Data Format Projections

> UBML ↔ XES, BPSim, MS Project, and other tool-integration formats

**Status:** Exploratory — depends on simulation and mining tool integration priorities.

These are not visual notations but **data interchange formats** used by specialized tools for process mining, simulation, and project scheduling.

---

## XES / IEEE 1849 (Event Log Format)

### UBML → XES Mapping

UBML process mining configuration already references XES. The mapping is bidirectional: UBML imports XES event logs (via `MiningSource`) and can generate synthetic XES logs from scenarios.

| UBML Concept | XES Element | Notes |
|-------------|------------|-------|
| MiningSource (`type: xes`) | Log | Event log source |
| Process | Trace concept:name | Case type classifier |
| Step | Event concept:name | Activity label |
| Actor | org:resource | Event performer |
| Entity state changes | lifecycle:transition | start/complete |
| Step.duration | time:timestamp delta | Computed from timestamps |

### UBML Information Lost on XES Export

| UBML Concept | Why Lost |
|-------------|----------|
| Process structure (blocks, phases) | XES is a flat event sequence per case |
| RACI (except responsible) | XES has one resource per event |
| Decision logic, conditions | Not in event logs |
| All non-process layers (strategy, knowledge, hypotheses) | XES is operational data only |

### XES Concepts UBML Cannot Capture

| XES Concept | Description | UBML Gap | Severity |
|------------|-------------|----------|----------|
| **Event-level attributes** | Arbitrary key-value pairs on each event (cost, priority, custom fields from source systems). | UBML steps have `custom` fields but these are *model-level* properties, not *instance-level* event data. Each execution of a step may have different attribute values. | **Medium** |
| **Lifecycle transitions** | Standard lifecycle: `assign`, `start`, `suspend`, `resume`, `complete`, `abort`, etc. | UBML `StepLifecycleEvent` covers some of these (`onStart`, `onComplete`, `onError`, `onAssign`) but they're notification triggers, not recorded state transitions. | **Medium** |
| **Multi-attribute classifiers** | Events classified by multiple dimensions (activity + transition + resource). | UBML steps are identified by ID. No multi-dimensional classification of step executions. | **Low** |
| **Global event ordering** | Total ordering of all events across all cases with precise timestamps. | UBML process models are structural (what *should* happen), not temporal (what *did* happen). Execution order comes from links, not timestamps. | **Low** |
| **Nested logs** | Logs containing sub-logs (for sub-processes). | UBML `calls` models sub-process invocation structurally, but XES may have nested trace hierarchies from actual execution. | **Low** |
| **Extensions (custom semantics)** | XES extension mechanism for domain-specific event attributes (cost, identity, software telemetry). | UBML mining `AttributeMapping` maps log attributes to entities, but doesn't import the full extension schema. | **Low** |

---

## BPSim 1.0 (Business Process Simulation)

### UBML → BPSim Mapping

BPSim extends BPMN with simulation parameters. It maps directly to UBML's Scenario configuration.

| UBML Concept | BPSim Element | Notes |
|-------------|--------------|-------|
| Scenario | Scenario | Simulation configuration |
| Scenario.arrivals.rate | InterTriggerTimer | Time between arrivals |
| Scenario.arrivals.pattern | Distribution type | Poisson, uniform, etc. |
| Step.duration | ProcessingTime | Activity duration |
| ResourcePool.capacity | Availability / Quantity | Resource headcount |
| ResourcePool.rate | UnitCost | Cost per time unit |
| Link.probability | Probability | Branch probability |
| WorkAttribute.distribution | DistributionParameter | Normal, exponential, etc. |
| Scenario.simulationConfig | SimulationConfig | Warmup, run length, replications |

### UBML Information Lost on BPSim Export

| UBML Concept | Why Lost |
|-------------|----------|
| Scenario.workMix | BPSim supports work mix but UBML's categorical model doesn't map 1:1 |
| Scenario.evidence | BPSim has no evidence/historical grounding concept |
| Scenario.basedOn | BPSim scenarios are independent, no inheritance chain |

### BPSim Concepts UBML Cannot Capture

| BPSim Concept | Description | UBML Gap | Severity |
|--------------|-------------|----------|----------|
| **Calendar/Schedule** | Working calendars defining availability windows (shift patterns, holidays). | UBML has no calendar model. `ResourcePool.hoursPerDay` is a simplification. | **Medium** |
| **Queue disciplines** | FIFO, LIFO, priority-based, shortest-job-first. | No queue model. UBML `ResourcePool.wipLimit` limits concurrent work but doesn't control ordering. | **Medium** |
| **Property Parameters** | Simulation parameters attached to any BPMN element (not just resources and activities). | UBML attaches duration/cost to steps and capacity to pools. Arbitrary parameterization of other elements isn't supported. | **Low** |
| **Control Parameters** | Runtime control: start trigger, stop conditions, number of instances. | UBML `simulationConfig` covers replications and run length. Detailed control parameters are not modeled. | **Low** |
| **Result Parameters** | Where to capture simulation output (KPI targets, utilization, wait times). | UBML KPIs define targets but not simulation output capture points. | **Low** |

---

## MS Project / Scheduling Standards

### UBML → MS Project Mapping

UBML scheduling dependencies map to standard project management notation (CPM/PERT).

| UBML `schedule.type` | MS Project | CPM | Description |
|---------------------|-----------|-----|-------------|
| `finish-to-start` | FS | FS | B starts after A finishes (default) |
| `start-to-start` | SS | SS | B starts when A starts |
| `finish-to-finish` | FF | FF | B finishes when A finishes |
| `start-to-finish` | SF | SF | B finishes when A starts (rare) |
| `schedule.lag` | Lag / Lead | Lag | Time offset on dependency |
| Step.duration | Duration | Duration | Task duration |
| Step (`kind: milestone`) | Milestone | Milestone | Zero-duration marker |
| Step.constraint | Constraint Type | — | ASAP, ALAP, must-start-on, etc. |
| Step.constraintDate | Constraint Date | — | Date for date-bound constraints |

### UBML Information Lost on MS Project Export

| UBML Concept | Why Lost |
|-------------|----------|
| Process flow logic (conditions, decisions) | MS Project is a scheduling tool, not a flow tool |
| Block operators | No equivalent — all tasks are in a flat/hierarchical list |
| RACI (except assignment) | MS Project has resource assignment but not the CI roles |
| Entity/document data flow | Not a project scheduling concern |
| All non-process layers | MS Project is purely task/schedule |

### MS Project Concepts UBML Cannot Capture

| MS Project Concept | Description | UBML Gap | Severity |
|-------------------|-------------|----------|----------|
| **Resource leveling** | Automatic rescheduling to resolve over-allocation. | UBML ResourcePools define capacity but don't model auto-leveling algorithms. | **Medium** |
| **Baseline tracking** | Saving baseline schedules and tracking variance. | UBML scenarios provide baseline/variant but not schedule baseline snapshots with variance tracking. | **Medium** |
| **% Complete** | Execution progress per task. | UBML doesn't track execution state (P1.4 — no built-in version control, UBML describes processes, not tracks progress). | **High** |
| **Earned Value** | Cost/schedule performance indices (CPI, SPI). | UBML KPIs can model these as formulas but no native earned value calculation. | **Medium** |
| **Task calendars** | Per-task working calendars. | No calendar model (see BPSim gap). | **Medium** |
| **Resource calendars** | Per-resource availability schedules. | Only `ResourcePool.hoursPerDay` — no day-by-day availability. | **Medium** |
| **Summary tasks (WBS)** | Hierarchical task breakdown with roll-up. | UBML process hierarchy (L1–L4) and phases partially cover this, but UBML doesn't roll up duration/cost through the hierarchy. | **Low** |
| **Task dependencies across projects** | Cross-project links in multi-project portfolios. | UBML cross-process links exist but don't carry scheduling semantics across workspace boundaries. | **Low** |

---

## Other Data Formats (Future)

| Format | Potential Use | Current Status |
|--------|-------------|----------------|
| **XPDL** | BPMN interchange format | Superseded by BPMN 2.0 XML serialization. Low priority. |
| **APQC PCF XML** | Process classification framework interchange | UBML L1–L4 hierarchy aligns conceptually but no formal export defined. |
| **Archimate Exchange Format** | ArchiMate model interchange (XML/XSD) | Useful for tool integration. Mapping largely from [ARCHIMATE.md](ARCHIMATE.md). |
| **CSV/JSON** | Generic data export for BI tools | Simple tabular export of any UBML element type. Low-complexity, high-utility. |
| **Open API / AsyncAPI** | API specification from system actors | Out of UBML scope — system actors are black boxes. |
| **SBVR** | Semantics of Business Vocabulary and Rules | Could complement UBML glossary. Exploratory. |

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
