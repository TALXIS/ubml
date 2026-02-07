# UBML Projections & Export Mappings

> How UBML primitives map to formal standards and diagram notations — and what each standard captures that UBML cannot.

---

## Why Projections Exist

UBML is a **working format** that sits upstream of formal standards (see [PRINCIPLES.md](../PRINCIPLES.md) §P7, §P10). Consultants model in UBML; when clients or enterprise tooling require a formal notation, they **project** (export) from UBML.

Projections are **lossy by design** (P7.1). UBML captures business context — stakeholder concerns, hypotheses, evidence chains, simulation scenarios — that formal notations have no place for. Conversely, formal standards model concepts — choreography protocols, decision tables, infrastructure topology — that UBML deliberately excludes.

This directory documents both directions:
- **UBML → Standard**: what maps, what is lost on export
- **Standard → UBML**: what the standard can express that UBML cannot capture

---

## Governing Principles

| Principle | Summary |
|-----------|---------|
| **P7.1** Lossless Round-Trip Not Required | Export may lose information. UBML remains source of truth. |
| **P7.2** Import Should Enrich | Importing from formal standards allows adding UBML-only context. |
| **P7.3** Mapping Documented | Every target must document what maps and what is lost. |
| **P10.1** Element Types as Semantic Primitives | Core types map 1:1 to formal standard constructs. |
| **P10.5** New Primitives Require Projection Mapping | No new enum value without documented projection to all supported standards. |

---

## Projection Targets

### Formal Standards (Interchange)

| Standard | Page | UBML Relationship | Stability |
|----------|------|-------------------|-----------|
| **BPMN 2.0.2** | [BPMN.md](BPMN.md) | Primary process export target | Stable |
| **ArchiMate 3.2** | [ARCHIMATE.md](ARCHIMATE.md) | Enterprise architecture (business + strategy layers) | Stable |
| **UML 2.5** | [UML.md](UML.md) | Activity, Use Case, Class, State Machine diagrams | Stable |
| **DMN 1.4 / CMMN 1.1** | [DMN-CMMN.md](DMN-CMMN.md) | Decision modeling and case management | Exploratory |
| **BMM 1.3** | [BMM.md](BMM.md) | Business motivation (goals, strategies, directives) | Stable |

### Diagram Notations (Rendering)

| Notation | Page | UBML Relationship | Stability |
|----------|------|-------------------|-----------|
| **Mermaid** | [MERMAID.md](MERMAID.md) | Markdown-embeddable diagrams for documentation | Evolving |
| **PlantUML** | [PLANTUML.md](PLANTUML.md) | Rich text-based diagrams incl. native ArchiMate | Evolving |

### Methodology & Practice Notations

| Standard | Page | UBML Relationship | Stability |
|----------|------|-------------------|-----------|
| **Value Stream Mapping** | [VSM.md](VSM.md) | Lean value stream analysis (origin of UBML ValueStream) | Stable |
| **ARIS / EPC** | [BPMN.md](BPMN.md#related-aris--epc-event-driven-process-chains) | SAP-ecosystem process modeling (section in BPMN page) | Stable |
| **TOGAF** | [ARCHIMATE.md](ARCHIMATE.md#related-togaf-content-metamodel-alignment) | Enterprise architecture framework (section in ArchiMate page) | Stable |
| **CMMI** | [ARCHIMATE.md](ARCHIMATE.md#related-cmmi-maturity-scale) | Capability maturity scale (section in ArchiMate page) | Stable |

### Data Formats (Tool Integration)

| Format | Page | UBML Relationship | Stability |
|--------|------|-------------------|-----------|
| **XES / BPSim / MS Project** | [DATA-FORMATS.md](DATA-FORMATS.md) | Process mining, simulation, project scheduling | Exploratory |

---

## Information Loss Matrix

What each projection target **can** and **cannot** represent from a UBML model:

| UBML Concept | BPMN | ArchiMate | UML | BMM | VSM | Mermaid | PlantUML | DMN | XES |
|-------------|------|-----------|-----|-----|-----|---------|----------|-----|-----|
| Process flow | ✅ | ◐ | ✅ | ✗ | ◐ | ✅ | ✅ | — | ◐ |
| Step kinds | ✅ | ◐ | ✅ | ✗ | ✗ | ✅ | ✅ | ◐ | — |
| Block operators (par/alt/loop) | ✅ | ✗ | ✅ | ✗ | ✗ | ◐ | ✅ | — | — |
| Links with conditions | ✅ | ✗ | ✅ | ✗ | ✗ | ✅ | ✅ | ◐ | — |
| Scheduling (FS/SS/FF/SF) | ✗ | ✗ | ✗ | ✗ | ✗ | ◐ | ✅ | — | — |
| RACI assignments | ◐ | ◐ | ◐ | ✗ | ✗ | ✗ | ◐ | — | — |
| Actor hierarchy | ◐ | ✅ | ✅ | ✗ | ✗ | ◐ | ✅ | — | — |
| Actor types (role/team/system) | ✅ | ✅ | ✅ | ✗ | ✗ | ◐ | ✅ | — | ◐ |
| Entity model (attributes) | ✗ | ✗ | ✅ | ✗ | ✗ | ✅ | ✅ | — | — |
| Entity lifecycle/states | ✗ | ✗ | ✅ | ✗ | ✗ | ✅ | ✅ | — | — |
| Capabilities | ✗ | ✅ | ✗ | ◐ | ✗ | ◐ | ✅ | — | — |
| Value streams | ✗ | ✅ | ✗ | ✗ | ✅ | ◐ | ✅ | — | — |
| Products & services | ✗ | ✅ | ◐ | ✗ | ✗ | ✗ | ✅ | — | — |
| KPIs & metrics | ✗ | ✗ | ✗ | ◐ | ◐ | ◐ | ◐ | — | — |
| ROI analysis | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | — |
| Hypotheses & SCQH | ✗ | ✗ | ✗ | ◐ | ◐ | ◐ | ◐ | — | — |
| Scenarios & simulation | ◐ | ✗ | ✗ | ✗ | ◐ | ✗ | ✗ | — | ◐ |
| Knowledge (sources/insights) | ✗ | ✗ | ✗ | ◐ | ✗ | ✗ | ✗ | — | — |
| Glossary | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | — |
| Process mining config | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✅ |
| Personas | ✗ | ◐ | ◐ | ◐ | ✗ | ◐ | ◐ | — | — |
| Views & styling | ✗ | ◐ | ✗ | ✗ | ✗ | ✗ | ✗ | — | — |
| Approval/review gates | ◐ | ✗ | ✗ | ✗ | ✗ | ✗ | ◐ | — | — |
| Equipment & locations | ✗ | ◐ | ✗ | ✗ | ✗ | ✗ | ◐ | — | — |

**Legend:** ✅ Full | ◐ Partial | ✗ Not representable | — Not applicable

---

## Reverse Gap Matrix

What each standard can express that **UBML cannot capture well** (or at all):

| Standard Concept | Standard | UBML Gap | Severity |
|-----------------|----------|----------|----------|
| Choreography diagrams | BPMN | No inter-organization protocol modeling | Medium |
| Conversation diagrams | BPMN | No message correlation model | Low |
| Transaction sub-processes | BPMN | No compensation/rollback semantics | Medium |
| Event sub-processes (non-interrupting) | BPMN | Interrupting vs non-interrupting not distinguished | Medium |
| Boundary events | BPMN | No events attached to activity boundaries | High |
| Complex gateways | BPMN | No m-of-n synchronization pattern | Low |
| Signal/message correlation | BPMN | No message payload matching | Medium |
| Ad-hoc sub-processes | BPMN | No unordered task sets | Low |
| Application layer | ArchiMate | Systems are flat actors, no application architecture | High |
| Technology layer | ArchiMate | No infrastructure modeling at all | High |
| Implementation & Migration layer | ArchiMate | No work packages, gaps, plateaus, transition architectures | Medium |
| Full motivation semantics | ArchiMate | Limited to goals/drivers via personas. No principles, constraints, meanings. | Medium |
| Viewpoint mechanism | ArchiMate | UBML views exist but don't align with ArchiMate's predefined viewpoints | Low |
| Serving relationship | ArchiMate | No explicit "X serves Y" between elements | Medium |
| Influence relationship | ArchiMate | No weighted influence between motivation elements | Low |
| Decision tables | DMN | Decisions are branch points, not structured tables with hit policies | High |
| FEEL expression language | DMN | UBML uses TypeScript-subset expressions, not FEEL | Medium |
| Business Knowledge Models | DMN | No reusable decision logic libraries | Medium |
| Case planning model | CMMN | No discretionary/required task distinction | High |
| Sentries (entry/exit criteria) | CMMN | Phase entry/exit criteria are text, not executable | Medium |
| Case file items | CMMN | Entities exist but lack case-specific lifecycle bindings | Low |
| Timing diagrams | UML | No concurrent state timeline visualization | Low |
| Component/deployment diagrams | UML | No software architecture modeling | High |
| OCL constraints | UML | No formal constraint language on entities | Medium |
| Generalization/inheritance | UML | No entity inheritance hierarchy | Medium |
| Interface/abstract classes | UML | No abstract entity types | Low |
| Vision / Mission | BMM | No Vision or Mission primitive in UBML | High |
| Goal/Objective hierarchy | BMM | Goals are flat per-persona lists, no decomposition tree | High |
| Business Policy / Business Rule library | BMM | No standalone directive framework | Medium |
| Strategy as declared intent | BMM | Hypothesis recommendations ≠ declared organizational strategy | Medium |
| Influencer categorization | BMM | No typed influencer taxonomy | Low |
| Push/pull production control | VSM | No production control semantics on flow | High |
| VA/NVA/NNVA waste classification | VSM | Steps have no value-added classification | High |
| Inventory / WIP between processes | VSM | No inter-process stock/buffer model | Medium |
| Changeover time / uptime | VSM | No manufacturing-specific process metrics | Medium |
| Kanban / supermarket / FIFO | VSM | No pull system or queue discipline | Medium |
| Event-function alternation rule | ARIS/EPC | UBML doesn't enforce event↔function alternation | Low |

**Severity guide:**
- **High** — The standard's core use case includes this; importing from the standard loses significant information
- **Medium** — Important for advanced use cases; workarounds exist (custom fields, annotations)
- **Low** — Edge case or rarely used; acceptable to ignore

See individual standard pages for detailed analysis of each gap.

---

## Projection Rules

### Adding New Primitives (P10.5 Checklist)

Before adding any new enum value to `Step.kind`, `Block.operator`, `Actor.type`, or other semantic primitive:

1. **BPMN mapping** — Document which BPMN 2.0.2 element it projects to
2. **ArchiMate mapping** — Document which ArchiMate 3.2 element it maps to (or "no mapping" with justification)
3. **UML mapping** — Document which UML 2.5 element it maps to for each relevant diagram type
4. **Mermaid rendering** — Define which Mermaid node shape represents it
5. **PlantUML rendering** — Define the PlantUML syntax for rendering it
6. **Update this directory** — Add the mapping to the relevant standard page
7. **Update the schema** — Add `x-ubml` projection annotations to the schema definition
8. **Update DESIGN-DECISIONS.md** — Record the decision with projection rationale

### Export Fidelity Levels

Projections may offer different detail levels:

| Level | Description | When to Use |
|-------|-------------|-------------|
| **Summary** | High-level overview, minimal detail | Executive presentations, stakeholder alignment |
| **Standard** | Core flow with actors and key data | Working documentation, process review |
| **Detailed** | Full model with all properties preserved where possible | Formal interchange, archival |

---

---

## Reference Standards (Vocabulary Alignment)

These standards inform UBML's vocabulary and design but are not projection targets (no diagram to export to):

| Standard | Relationship to UBML | Documented In |
|----------|---------------------|---------------|
| **SBVR 1.5** (Semantics of Business Vocabulary and Rules, OMG) | UBML `Glossary` covers SBVR's noun concepts (terms + definitions) informally. SBVR's verb concepts, fact types, and formal business rule language are beyond UBML's scope — UBML targets consultants, not logicians. SBVR's controlled natural language with alethic/deontic modality is far more formal than UBML's design philosophy requires. | Here |
| **CMMI 3.0** (Capability Maturity Model Integration, ISACA) | UBML `Capability.maturity` uses the CMMI 5-level scale directly. | [ARCHIMATE.md](ARCHIMATE.md#related-cmmi-maturity-scale) |
| **TOGAF 10** (The Open Group Architecture Framework) | ArchiMate is TOGAF's modeling language. UBML covers TOGAF's Business Architecture domain. | [ARCHIMATE.md](ARCHIMATE.md#related-togaf-content-metamodel-alignment) |
| **APQC PCF** (Process Classification Framework) | UBML process hierarchy (L1–L4) aligns conceptually with APQC's framework levels. No formal import/export defined. | — |

---

*This directory is maintained alongside the schema. When the schema changes, projections must be updated. See [PRINCIPLES.md](../PRINCIPLES.md) §P10.5.*
