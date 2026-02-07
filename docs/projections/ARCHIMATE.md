# ArchiMate 3.2 Projection

> UBML ↔ ArchiMate (The Open Group)

**Status:** Stable — Business and Strategy layer mappings well-defined.

ArchiMate is the **primary enterprise architecture export target**. UBML maps across ArchiMate's Business, Strategy, and Motivation layers, with selective mapping to the Application layer for system actors.

---

## UBML → ArchiMate Mapping

### Business Layer

| UBML Concept | ArchiMate Element | Element Type | Notes |
|-------------|-------------------|-------------|-------|
| Actor (`type: organization`) | Business Actor | Active Structure | Top-level organizational unit |
| Actor (`type: team`) | Business Actor | Active Structure | Organizational sub-unit |
| Actor (`type: person`) | Business Actor | Active Structure | Individual participant |
| Actor (`type: role`) | Business Role | Active Structure | Functional role, assigned to actors |
| Actor (`type: system`) | Application Component | Active Structure (App Layer) | Cross-layer mapping |
| Actor (`type: external`) | Business Actor | Active Structure | External flag |
| Actor (`type: customer`) | Business Actor | Active Structure | External stakeholder |
| Process | Business Process | Behavioral | Core workflow |
| Step (`kind: action`) | Business Function | Behavioral | Unit of work |
| Step (`kind: subprocess`) | Business Process | Behavioral | Composite process |
| Step (`kind: decision`) | *(embedded in flow)* | — | ArchiMate has no gateway concept |
| Step (`kind: milestone`) | Business Event | Behavioral | Significant occurrence |
| Step (`kind: start`) | Business Event | Behavioral | Triggering event |
| Step (`kind: end`) | Business Event | Behavioral | Completion event |
| Step (`kind: wait`) | Business Event | Behavioral | Timer/waiting event |
| Step (`kind: handoff`) | Business Interaction | Behavioral | Cross-actor collaboration |
| Entity | Business Object | Passive Structure | Information object |
| Document | Business Object | Passive Structure | Formalized information artifact |
| Service | Business Service | Behavioral | Externally visible functionality |
| Location | Location | — | Physical or logical place |

### Strategy Layer

| UBML Concept | ArchiMate Element | Notes |
|-------------|-------------------|-------|
| Capability | Capability | Direct 1:1. Level and maturity preserved. |
| Capability.strategicImportance | *(property)* | No native ArchiMate attribute |
| ValueStream | Value Stream | ArchiMate 3.0+ native element |
| ValueStream.stages | Value Stream stages | Composition relationships to processes |
| Product | Product | Aggregation of services/contracts |
| Portfolio | Grouping | Clusters products/services/capabilities |
| HypothesisNode (recommendation) | Course of Action | Maps when hypothesis produces recommended change |

### Motivation Layer

| UBML Concept | ArchiMate Element | Notes |
|-------------|-------------------|-------|
| Persona.goals | Goal | Strategic/tactical goal |
| Persona.painPoints | Assessment | Evaluation of current state |
| Persona.motivations | Driver | Internal/external influence |
| HypothesisTree | *(no equivalent)* | UBML-specific analytical structure |
| HypothesisNode (recommendation) | Requirement | Actionable outcome of hypothesis |
| KPI | *(no equivalent)* | Model as Assessment with metric properties |
| ROI | *(no equivalent)* | No financial analysis in ArchiMate |

### Relationships

| UBML Relationship | ArchiMate Relationship | Notes |
|-------------------|----------------------|-------|
| RACI.responsible | Assignment | Role assigned to process/function |
| Process → Entity (input) | Access (read) | |
| Process → Entity (output) | Access (write) | |
| ProcessCall (sync) | Composition | Parent composed of child |
| ProcessCall (async) | Triggering | One triggers another |
| Capability → Process | Realization | Process realizes capability |
| ValueStream.stages → Process | Realization | Process realizes stage |
| Service → Process | Realization | Process realizes service |
| Actor.reportsTo | Composition / Aggregation | Org hierarchy |
| Actor.party | Aggregation | Actor belongs to organization |

---

## UBML Information Lost on ArchiMate Export

| UBML Concept | Why Lost |
|-------------|----------|
| Knowledge layer (sources, insights) | No knowledge management model |
| Hypothesis trees, SCQH framework | Motivation layer is simpler |
| Scenarios, simulation config | Static architecture, not simulation |
| Step-level detail (RACI, approval, review, notifications) | Higher abstraction level |
| Scheduling dependencies (FS/SS/FF/SF) | Flow/Triggering only, no scheduling |
| Block operators (par/alt/opt/loop) | No control flow modeling |
| Entity attributes and relationships | Business Object is opaque |
| Equipment, resource pools, WIP limits | No operational resource model |
| Link conditions, probabilities | No conditional flow |
| Evidence chain (source → insight → model) | No provenance model |
| Process hierarchy (L1–L4) | ArchiMate uses composition, not numbered levels |
| Duration, effort, cost on steps | No operational performance data |

---

## ArchiMate Concepts UBML Cannot Capture

ArchiMate spans the full enterprise architecture stack. UBML deliberately covers only the business and strategy layers. The remaining ArchiMate layers represent significant modeling capability that UBML does not address.

### Application Layer (High Impact)

| ArchiMate Element | Description | UBML Gap |
|-------------------|-------------|----------|
| **Application Component** | A modular, deployable piece of software. | UBML has `Actor.type: system` which names a system but doesn't model its internal structure, interfaces, or dependencies. A UBML system actor is a black box. |
| **Application Function** | Internal behavior of a component. | No equivalent. UBML models business functions (steps), not application functions. |
| **Application Service** | Externally visible behavior of a component. | UBML `Service` is a *business* service. Application-level services (APIs, interfaces) are not modeled. |
| **Application Interface** | Access point to application services. | No concept of technical interfaces, APIs, or integration points. |
| **Application Process** | Orchestration within the application layer. | UBML processes are business processes. Technical orchestration (ETL flows, API chains) is out of scope. |
| **Application Event** | Application-level events (system triggers). | `Step.trigger.type: event` exists but is business-level. System events, webhooks, and message queues are not modeled. |
| **Data Object** | Application-layer representation of business objects. | UBML `Entity` maps to *Business* Object. The Data Object (how a business object is stored/represented in a system) has no UBML equivalent. |
| **Application Collaboration** | Aggregate of components working together. | No equivalent. System-to-system integration is not modeled. |

**Severity: High.** Enterprise architects importing an ArchiMate model into UBML will lose the entire application architecture. UBML is intentionally business-layer only.

### Technology Layer (High Impact)

| ArchiMate Element | Description | UBML Gap |
|-------------------|-------------|----------|
| **Node / Device / System Software** | Computing infrastructure. | Completely out of scope. UBML does not model infrastructure. |
| **Technology Service / Interface** | Infrastructure services (hosting, networking). | Not modeled. |
| **Artifact** | Physical piece of data (file, DB table, message). | UBML `Document` is a business-level artifact (contracts, forms), not a technology artifact. |
| **Communication Network / Path** | Network topology. | Not modeled. |
| **Technology Function / Process** | Infrastructure automation. | Not modeled. |

**Severity: High.** The technology layer has zero overlap with UBML. This is by design — UBML describes business, not IT infrastructure.

### Physical Layer (Medium Impact)

| ArchiMate Element | Description | UBML Gap |
|-------------------|-------------|----------|
| **Equipment (ArchiMate)** | Physical machinery and devices. | UBML has `Equipment` — this is a **rare overlap**. UBML equipment is operational (vehicles, machines used in processes), whereas ArchiMate physical equipment is broader. |
| **Facility** | Physical structure (building, factory). | UBML `Location` partially covers this but doesn't model capacity, construction type, or physical characteristics beyond coordinates. |
| **Distribution Network** | Physical transport routes. | No equivalent. UBML locations have coordinates but not the routes between them. |
| **Material** | Physical substance processed or produced. | No equivalent. UBML entities are *information* objects, not physical materials. |

### Implementation & Migration Layer (Medium Impact)

| ArchiMate Element | Description | UBML Gap |
|-------------------|-------------|----------|
| **Work Package** | Unit of work for implementing architecture changes. | No project management model. UBML models how organizations work, not how changes are implemented. |
| **Deliverable** | Output of a work package. | No equivalent. UBML doesn't model implementation artifacts. |
| **Gap** | Difference between current and target architecture. | UBML hypotheses describe problems and recommendations but don't formally model architectural gaps. |
| **Plateau** | Transitional architecture state. | No transition architecture model. UBML captures current-state and proposed-state via file organization (folders), not schema elements. |
| **Implementation Event** | Milestone in the migration plan. | UBML milestones are business process milestones, not implementation milestones. |

**Severity: Medium.** Organizations using ArchiMate for migration planning will not find this capability in UBML. The hypothesis/scenario model provides *analytical* support for change decisions but not implementation planning.

### Motivation Layer Depth (Medium Impact)

| ArchiMate Element | Description | UBML Gap |
|-------------------|-------------|----------|
| **Principle** | Normative property of architecture (e.g., "data must have single owner"). | No equivalent. UBML doesn't model architectural principles. |
| **Constraint** | Limitation on design (regulatory, budget, technical). | UBML captures constraints informally in descriptions/annotations but not as first-class elements. |
| **Meaning** | Knowledge or expertise attached to a concept. | UBML Glossary terms define meanings but aren't modeled as motivation elements. |
| **Value** | Relative worth, utility, or importance of a core element. | UBML has `ValueStream.valueOutcome` (text) but not typed value elements. |
| **Stakeholder** | Individual, team, or organization with interests. | UBML `Persona` partially covers this. Actors are operational, personas are analytical. The ArchiMate Stakeholder concept sits between them. |
| **Outcome** | End result that a stakeholder wants to achieve. | UBML `StandardOutcome` lists step results. ArchiMate Outcome is strategic — what a driver/goal produces. |

**Severity: Medium.** UBML covers goals and pain points through personas. The deeper motivation modeling in ArchiMate (principles, constraints, meanings) is not captured.

### Relationship Richness (Medium Impact)

| ArchiMate Relationship | Description | UBML Gap |
|----------------------|-------------|----------|
| **Serving** | "X provides its functionality to Y." | No explicit serving relationship. UBML uses RACI and process references, but "Service A serves Actor B" isn't first-class. |
| **Influence** | Motivational influence with strength (+/-/++/--). | No weighted influence model between goals, drivers, and assessments. |
| **Specialization** | "X is a specialization of Y." | No inheritance/specialization between UBML element types. Entity and actor hierarchies use `parent` references (composition), not specialization. |
| **Association** | Generic/unclassified relationship. | UBML uses typed references everywhere. No untyped generic association. |

### Viewpoint Mechanism (Low Impact)

| ArchiMate Feature | UBML Gap |
|-------------------|----------|
| **Predefined Viewpoints** (Organization, Application Usage, Business Process Cooperation, Layered, etc.) | UBML `View` has types (process, capability, value-stream, etc.) but these don't correspond to ArchiMate's ~25 predefined viewpoints with their specific element/relationship filters. |
| **Viewpoint-driven element filtering** | UBML view filters exist (`ViewFilter`) but are based on tags/kinds/properties, not on viewpoint definitions from a standard. |

---

## Import Considerations (ArchiMate → UBML)

| ArchiMate Element | UBML Import Strategy |
|-------------------|---------------------|
| Business Actor / Role | Import as Actor with appropriate `type` |
| Business Process / Function | Import as Process / Step |
| Business Object | Import as Entity (attributes empty, needs enrichment) |
| Business Service | Import as Service |
| Capability | Import as Capability |
| Value Stream | Import as ValueStream |
| Product | Import as Product |
| Application Component | Import as Actor (`type: system`) — loses internal structure |
| Technology Layer | **Skip** — out of UBML scope |
| Physical Layer | Partial — Equipment and Location import possible |
| Motivation elements | Goal → Persona.goals, Driver → Persona.motivations, Assessment → Persona.painPoints |
| Implementation Layer | **Skip** — out of UBML scope |

After import, all UBML-specific layers will be empty: knowledge, hypotheses, scenarios, KPIs, process step detail (RACI, approval, duration, etc.).

---

## Related: TOGAF Content Metamodel Alignment

ArchiMate is the **official modeling language for TOGAF** (The Open Group Architecture Framework, v10). TOGAF's Architecture Development Method (ADM) produces artifacts that are modeled in ArchiMate. Since UBML already maps to ArchiMate, TOGAF alignment follows transitively.

UBML is referenced alongside TOGAF in [PRINCIPLES.md](../PRINCIPLES.md) §P10.3: "APQC, TOGAF, and ArchiMate define hierarchies differently. UBML provides mechanisms; users provide context-specific semantics."

### TOGAF Architecture Domains → UBML

| TOGAF Domain | ADM Phase | UBML Coverage | Notes |
|-------------|-----------|---------------|-------|
| **Business Architecture** | Phase B | ✅ Full | Processes, actors, capabilities, value streams, services, products — UBML's core domain. |
| **Data Architecture** | Phase C | ◐ Partial | UBML `Entity` models business information objects with attributes and relationships. No physical data model (tables, schemas, ERDs). |
| **Application Architecture** | Phase C | ✗ Minimal | UBML `Actor.type: system` names application components as black boxes. No application function, interface, or interaction modeling. |
| **Technology Architecture** | Phase D | ✗ None | Out of UBML scope. No infrastructure, network, or deployment modeling. |

### TOGAF Content Metamodel → UBML

| TOGAF Metamodel Entity | UBML Equivalent | Notes |
|-----------------------|-----------------|-------|
| Organization Unit | `Actor` (type: organization/team) | |
| Actor / Role | `Actor` (type: role/person) | |
| Business Service | `Service` | |
| Business Process / Function | `Process` / `Step` | |
| Data Entity | `Entity` | |
| Capability | `Capability` | |
| Value Stream | `ValueStream` | |
| Product | `Product` | |
| Application Component | `Actor` (type: system) | Black box only |
| Technology Component | *(not modeled)* | |
| Work Package | *(not modeled)* | No implementation/migration |
| Plateau | *(not modeled)* | No transition architectures |
| Gap | `HypothesisNode` (complication) | Analytical, not formal |
| Requirement | `HypothesisNode` (recommendation) | Analytical, not formal |
| Constraint | `Annotation` (type: compliance) | Informal |
| Principle | *(not modeled)* | See BMM gaps in [BMM.md](BMM.md) |
| Driver | `Persona.motivations` | Stakeholder-scoped |
| Goal | `Persona.goals` | Stakeholder-scoped |
| Objective | `KPI.target` | Measurable target |
| Measure | `KPI` | With formula, thresholds |

**Key insight:** UBML covers TOGAF's Business Architecture domain comprehensively and exceeds it in operational detail (RACI, scheduling, approval gates, process mining). TOGAF's Application, Technology, and Migration domains are out of UBML scope — use ArchiMate directly for those.

---

## Related: CMMI Maturity Scale

UBML's `Capability.maturity` (1–5 integer) uses the **CMMI (Capability Maturity Model Integration)** scale developed at Carnegie Mellon University (now ISACA/CMMI Institute, v3.0).

| CMMI Level | UBML `Capability.maturity` | Description |
|-----------|---------------------------|-------------|
| 1 — Initial | 1 | Ad-hoc, inconsistent |
| 2 — Managed | 2 | Basic processes in place |
| 3 — Defined | 3 | Standardized, documented |
| 4 — Quantitatively Managed | 4 | Measured, controlled |
| 5 — Optimizing | 5 | Continuously improving |

The UBML schema already embeds this scale (see `Capability.maturity` and `Capability.targetMaturity` in the strategy types schema). CMMI is a process maturity appraisal framework, not a modeling notation — there is no diagram to project to. The integration is at the **vocabulary level**: UBML speaks the same maturity language as CMMI.

CMMI's 17+ Practice Areas (originally Process Areas) map conceptually to UBML's capability hierarchy, but the specific PA taxonomy (e.g., "Requirements Management", "Configuration Management") is domain-specific to software/systems engineering and not embedded in UBML's schema.

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
