# Value Stream Mapping (VSM) Projection

> UBML ↔ Value Stream Mapping (Lean Manufacturing / Toyota Production System)

**Status:** Stable — UBML's `ValueStream` type is directly inspired by VSM; mapping is natural but rendering gaps exist.

Value Stream Mapping is the original notation for visualizing end-to-end value delivery — from raw material/request to customer delivery. UBML's `ValueStream` type, with stages, triggering events, ending events, and KPIs, inherits VSM's core concepts translated into consultant vocabulary.

---

## VSM Fundamentals

VSM diagrams map the **current state** and **future state** of material and information flow:

```
┌─────────┐                                         ┌──────────┐
│ Supplier │──── Material Flow ──────────────────────►│ Customer │
└─────────┘                                         └──────────┘
     │              ┌─────┐    ┌─────┐    ┌─────┐        ▲
     └──────────────► P1  ├────► P2  ├────► P3  ├────────┘
                    │C/T  │    │C/T  │    │C/T  │
                    │C/O  │    │C/O  │    │C/O  │
                    │Avail│    │Avail│    │Avail│
                    └──┬──┘    └──┬──┘    └──┬──┘
                       │          │          │
  ◄────────────────── Information Flow ──────────────────────┐
                                                              │
  Timeline: NVA ─── VA ─── NVA ─── VA ─── NVA ─── VA       │
            wait    work   wait    work   wait    work      PLT
```

Core VSM elements:
- **Process boxes** with cycle time (C/T), changeover time (C/O), uptime (%), batch size
- **Inventory triangles** between processes (WIP counts)
- **Push/pull arrows** indicating production control
- **Information flow** (electronic and manual) from customer back through production control
- **Timeline bar** separating value-added (VA) from non-value-added (NVA) time
- **Kaizen bursts** marking improvement opportunities

---

## UBML → VSM Mapping

### Value Stream Structure

| VSM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Value stream** (overall) | `ValueStream` | ✅ Full | Direct 1:1 mapping. Name, description, owner. |
| **Customer** | `ValueStream.customer` (ActorRef) | ✅ Full | The end beneficiary. |
| **Supplier** | *(no direct field)* | ◐ Partial | Could use `ValueStream.triggeringEvent` or an Actor reference. No dedicated supplier field. |
| **Triggering event** | `ValueStream.triggeringEvent` | ✅ Full | "Customer places order", "Raw material arrives". |
| **Ending event** | `ValueStream.endingEvent` | ✅ Full | "Product delivered", "Payment received". |
| **Value outcome** | `ValueStream.valueOutcome` | ✅ Full | "Customer receives working product on time". |

### Process Boxes

| VSM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Process box** | `ValueStream.stages[].processes` → `Process` | ✅ Full | Each stage contains references to detailed processes. |
| **Stage name** | `ValueStream.stages[].name` | ✅ Full | Stage label. |
| **Cycle time (C/T)** | `Step.duration` | ◐ Partial | Duration exists on steps, not on value stream stages. Must aggregate from referenced processes. |
| **Changeover time (C/O)** | *(no equivalent)* | ✗ Gap | No changeover/setup time concept. |
| **Uptime / Availability** | *(no equivalent)* | ✗ Gap | No machine/process availability percentage. |
| **Batch size** | *(no equivalent)* | ✗ Gap | No batch/lot size. Closest: `Scenario.arrivals` for arrival patterns. |
| **Number of operators** | `ResourcePool.capacity` | ◐ Partial | Resource pools define headcount in scenarios, not on the value stream itself. |
| **Scrap/rework rate** | `Link.probability` on error paths | ◐ Partial | Rework loops with probabilities, but not as a process-box metric. |

### Material & Information Flow

| VSM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Material flow** (push) | `Link` (between steps/processes) | ◐ Partial | UBML links model control flow. Material vs. information flow isn't distinguished. |
| **Material flow** (pull) | *(no equivalent)* | ✗ Gap | No push/pull production control concept. |
| **Inventory triangle** (WIP) | *(no equivalent)* | ✗ Gap | No inter-process inventory quantity. `ResourcePool.wipLimit` limits concurrent work *on* a resource, not stock *between* processes. |
| **Supermarket** (kanban buffer) | *(no equivalent)* | ✗ Gap | No kanban/buffer concept. |
| **FIFO lane** | *(no equivalent)* | ✗ Gap | No queue discipline concept (see also BPSim gaps). |
| **Electronic info flow** | `Step.messages` / `ProcessCall` | ◐ Partial | Cross-process communication exists but isn't typed as electronic/manual. |
| **Manual info flow** | `Step.kind: handoff` | ◐ Partial | Handoffs imply human-mediated information transfer. |
| **Production control** | *(no equivalent)* | ✗ Gap | No scheduling/production control entity in UBML. |

### Timeline & Metrics

| VSM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Production Lead Time (PLT)** | `KPI` (on value stream) | ◐ Partial | Can be modeled as a KPI with formula. Not calculated from the map. |
| **Value-added time** | *(no classification)* | ✗ Gap | Steps don't classify as VA/NVA/NNVA. |
| **Non-value-added time** (waste) | *(no classification)* | ✗ Gap | Same — no waste classification per step. |
| **Process cycle efficiency** | `KPI.formula` | ◐ Partial | Can define PCE = VA time / PLT as a KPI, but values aren't computed. |
| **Takt time** | `KPI` or `Scenario.arrivals` | ◐ Partial | Customer demand rate. Can be modeled in scenarios. |

### Improvement & Future State

| VSM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Kaizen burst** | `Insight` (type: recommendation) | ✅ Full | Improvement opportunities captured as insights with source traceability. |
| **Kaizen burst** | `HypothesisNode` (recommendation) | ✅ Full | Structured improvement proposals in hypothesis trees. |
| **Future state map** | `Scenario` (variant) | ✅ Full | Scenarios model proposed changes with impact analysis. |
| **Implementation plan** | *(no equivalent)* | ✗ Gap | No project management / implementation timeline. See [DATA-FORMATS.md](DATA-FORMATS.md) MS Project gaps. |

---

## UBML Information Lost on VSM Export

| UBML Concept | Why Lost |
|-------------|----------|
| Block operators (par/alt/opt/loop) | VSM shows a linear material flow; control flow branching doesn't exist |
| Decision steps, gateways | VSM processes don't branch — every unit flows through every process |
| RACI assignments | VSM shows operator count, not role-based assignments |
| Entity model (attributes, relationships, lifecycle) | VSM data objects are implicit in material flow |
| Knowledge layer (sources, insights) | VSM captures kaizen opportunities, not knowledge provenance |
| Hypothesis trees / SCQH | VSM is operational, not analytical |
| Approval/review gates, notifications | Not part of VSM notation |
| Actor hierarchy, personas | Operators are headcount, not organizational structure |
| Process hierarchy (L1–L4) | VSM is always one level — the value stream level |
| Scheduling dependencies (FS/SS/FF/SF) | Processes flow sequentially by material movement |

---

## VSM Concepts UBML Cannot Capture

### Production Control (High Impact)

| VSM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Push vs. Pull** | Fundamental VSM distinction: does upstream push work or does downstream pull it? Push = overproduction risk. Pull = demand-driven. Arrows are differently styled. | UBML links have no push/pull semantics. All flow is structural ("this step leads to that step"), not production-control-typed. |
| **Kanban (supermarket)** | Pull-based inventory buffer between processes. Downstream withdraws; upstream replenishes. Limited WIP by design. | No buffer/inventory entity between processes. `ResourcePool.wipLimit` limits work on a resource, not stock between process stages. |
| **FIFO Lane** | First-in-first-out queue between processes ensuring order preservation. | No queue discipline (see also BPSim gaps in [DATA-FORMATS.md](DATA-FORMATS.md)). |
| **Production scheduling / leveling (heijunka)** | Smoothing production to match takt time. Leveling box visualization. | No production scheduling concept. UBML's scheduling is dependency-based (FS/SS/FF/SF), not leveling-based. |
| **Pacemaker process** | The single process that sets the pace for the entire value stream. Only the pacemaker is scheduled; upstream pulls from it. | No concept of a pacemaker. All UBML processes are structurally equivalent. |

**Severity: High.** Push/pull and kanban are the core analytical framework of VSM. Without them, a UBML model can describe *what* happens but not *how production is controlled* — which is VSM's entire reason for existence.

### Waste & Time Classification (High Impact)

| VSM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **7 Wastes (muda)** | Overproduction, waiting, transport, over-processing, inventory, motion, defects. Each step/transition is classified. | UBML steps have `duration` and `effort` but no waste classification. Pain points in personas capture waste narratively but not as step-level metrics. |
| **VA / NVA / NNVA classification** | Every activity classified as Value-Added, Non-Value-Added (eliminate), or Non-Value-Added but Necessary (minimize). | No classification enum on steps. This is the fundamental analytical dimension of VSM. |
| **Timeline bar** | Visual separation of VA time (bottom) from NVA time (top/waiting). Total Lead Time vs. Value-Added Time comparison. | No timeline bar concept. KPIs can compute ratios, but the visual timeline is a rendering concern. |
| **Process Cycle Efficiency** | PCE = Value-Added Time ÷ Total Lead Time. The headline metric of every VSM. | Can be modeled as a `KPI.formula` but UBML doesn't compute it from step data. |

**Severity: High.** VA/NVA classification is what makes a value stream map *analytical* rather than just a process flow. Without it, UBML's ValueStream is a structural description, not an analytical tool.

### Physical Manufacturing Concepts (Medium Impact)

| VSM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Inventory triangles** | WIP counts between processes. Measured in units or days of supply. | No inter-process inventory model. UBML entities are information objects, not physical stock. |
| **Changeover time (C/O)** | Time to switch equipment from one product type to another. A key lean metric — high C/O drives large batch sizes. | No changeover concept. `Step.duration` is processing time per unit. |
| **Uptime / Availability %** | Percentage of scheduled time a process/machine is actually available. | No availability concept on processes or resources. |
| **Batch size** | Number of units processed together before moving to next step. | No batch concept. UBML processes model single-unit flow logic. |
| **Distance / transport** | Physical distance between process steps. Transport is a waste category. | UBML `Location` has coordinates but process steps don't reference locations to compute distances. |
| **Operator count per process** | Headcount working at each process step. | `ResourcePool.capacity` in scenarios, but not on value stream stages directly. |

**Severity: Medium.** These are critical for manufacturing VSM but less relevant for service/office value streams, where UBML's primary audience operates.

### Current State vs. Future State Formalism (Low Impact)

| VSM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Current State Map** | Formal "as-is" document with observed data (timed, counted). | UBML doesn't distinguish current-state from future-state models structurally. File organization (folders) or scenario variants handle this, but there's no schema-level distinction. |
| **Future State Map** | Proposed state with kaizen improvements applied, projected metrics. | UBML `Scenario` variants model future states. The mapping is good but VSM's convention of paired maps (current + future side by side) isn't built into UBML. |
| **Implementation timeline** | Prioritized kaizen events with owners and deadlines. | No project management model (see MS Project gaps in [DATA-FORMATS.md](DATA-FORMATS.md)). |

---

## Rendering Considerations

VSM has a **highly standardized visual vocabulary** (icons from "Learning to See" by Rother & Shook). UBML export to VSM format would need to render:

| VSM Symbol | What It Represents | Rendering Source |
|-----------|-------------------|-----------------|
| Process box | Stage with metrics | ValueStream.stages + referenced Process KPIs |
| Inventory triangle | WIP between stages | *(not available from UBML data)* |
| Push arrow | Material pushed downstream | *(not available)* |
| Pull circle | Kanban withdrawal | *(not available)* |
| Supermarket | Buffer inventory | *(not available)* |
| Kaizen burst | Improvement opportunity | Insights/Hypotheses linked to stages |
| Customer/Supplier icon | External parties | ValueStream.customer, Actor references |
| Information flow (zigzag) | Electronic data | ProcessCall, messages |
| Information flow (straight) | Manual data | Step.kind: handoff |
| Timeline | VA / NVA times | *(requires step VA/NVA classification)* |
| Data box | C/T, C/O, uptime, batch | Step.duration + *(gaps for C/O, uptime, batch)* |

**Practical recommendation:** For full VSM rendering, UBML would need:
1. A `wasteClassification` enum on steps (VA, NVA, NNVA) — or equivalent annotation
2. Inter-process inventory/WIP data
3. Process-level metrics (C/T, C/O, uptime) beyond Step.duration

Until then, UBML can generate a *structural* value stream diagram (stages, flow, parties) but not a *metrics-rich* VSM with the analytical power Lean practitioners expect.

---

## Import Considerations (VSM → UBML)

| VSM Element | UBML Import Strategy |
|------------|---------------------|
| Value stream | Import as `ValueStream` with name, customer, trigger, outcome |
| Process boxes | Import as stages referencing detailed `Process` documents |
| Cycle time | Import as `Step.duration` on process steps |
| Changeover time | Import as `custom` field — no native property |
| Inventory | Import as `custom` field on links between processes |
| Push/pull | Import as `custom` field or annotation |
| Kaizen bursts | Import as `Insight` (type: recommendation) with source ref |
| Future state | Import as `Scenario` variant |
| VA/NVA classification | Import as `custom` field or tag on steps |
| Operator count | Import as `ResourcePool.capacity` in scenario |
| Timeline metrics (PLT, VA time) | Import as `KPI` on value stream |

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
