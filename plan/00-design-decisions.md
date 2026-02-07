# 00 — Open Design Decisions

> **Status**: Proposed
> **Depends on**: Nothing (this is the starting point)
> **Effort**: Small per decision, but requires deliberation
> **References**: `docs/DESIGN-DECISIONS.md`, `docs/PRINCIPLES.md`

---

## Goal

Resolve open conceptual questions before schema and CLI work begins. Each decision here may affect plans 01–05. Decisions should be documented in `docs/DESIGN-DECISIONS.md` once made.

---

## Decisions Needed

### D1: Process.owner

**Question**: Should Process have an `owner: ActorRef` property?

**Context**: Phase already has `owner`. KPI, ROI, and HypothesisTree all have `owner`. Process does not. Evaluation tester naturally wrote `owner: AC00003` on Process. Semantically distinct from RACI (step-level) and Phase.owner (phase-level).

**Options**:
- A) Add `Process.owner: ActorRef` — consistent with other types, clear semantics ("who is accountable for this process")
- B) Keep as-is — process accountability via RACI on key steps, avoid confusion with Phase.owner

**Blocking**: Plan 01 (schema changes), Plan 03 (RACI guidance messaging)

---

### D2: KPI.actuals (time-series data)

**Question**: Should KPIs store historical actual values?

**Context**: Currently only `baseline`, `target`, `stretch`. Users may expect to track actuals over time. Potential violations of P1.3 (No Computed Aggregations) and P1.4 (No Built-In Version Control).

**Options**:
- A) No — violates principles. Use `custom:` or external BI tools.
- B) Yes — add structured actuals with timestamps.

**Blocking**: Plan 02 (schema validation)

---

### D3: KPI ↔ Step linkage direction

**Question**: Should Step have a `kpis` property, or keep the current KPI→Step direction only?

**Context**: KPI already has `step: StepRef` and `process: ProcessRef`. Users in testing expected `kpis: [KP00001]` on Step. Adding both directions would violate P1.1 (No Dual Hierarchy).

**Options**:
- A) Keep one-way (KPI→Step) — single source of truth, tooling provides reverse lookup
- B) Add `kpis` array on Step — more discoverable, but dual hierarchy

**Blocking**: Plan 02 (semantic validation), Plan 05 (discovery UX)

---

### D4: Process vs Workflow boundary

**Question**: Does UBML need to explicitly define where process modeling ends and workflow/automation begins?

**Context**: Existing principles + DD-006 (Template-Instance Separation) imply the answer: UBML = business intent (what/why), workflow tools = automation (how). But `blocks`, `systems`, and detailed step properties may push toward workflow territory. A blind tester's "broken" intuitive format was more readable by executives than the schema-valid version.

**Options**:
- A) Already answered — just needs clearer documentation in VISION.md or a short DD
- B) Needs a formal DD with full analysis of where the boundary lies

**Blocking**: Plan 01 (what goes in schema), Plan 08 (concepts documentation)

---

### D5: Actor types and RACI → ArchiMate projection

**Question**: How do actor types (person/role/team/system/organization/external/customer) and RACI assignments project to ArchiMate Actor vs Role?

**Context**: Current actor `type` enum covers many things. ArchiMate distinguishes Business Actor (who) from Business Role (what hat they wear). UBML's `type: role` maps to ArchiMate Role; `type: person` maps to Actor. But RACI assignments reference actors — should RACI prefer roles (P10.4)?

**Options**:
- A) Document projection mapping, no schema change
- B) Add constraints or guidance (RACI should reference `type: role`, not `type: person`)
- C) Defer until ArchiMate export is implemented

**Blocking**: Plan 08 (element catalog docs), potentially ArchiMate projection (plan 10)

---

### D6: Metrics and measurement model

**Question**: Is the current metrics model sufficient? How should KPIs relate to processes, steps, scenarios, and evidence?

**Context**: KPI already has `process`, `step`, `owner` refs. Scenario has `observations` for evidence. Missing link: how do observed actuals from process mining feed into KPIs? Is there overlap between Scenario.observations and KPI tracking?

**Options**: Needs analysis of current schema + real usage patterns.

**Blocking**: Plan 02 (validation), Plan 04 (examples)

---

### D7: Expression language subset

**Question**: What expression syntax does UBML need for guards, conditions, and formulas?

**Context**: Used in block guards (`"priority == 'urgent'"`), step guards, call conditions, and KPI formulas. Currently free-text strings with no defined grammar. Validation can't check expressions. Projection to BPMN requires parseable expressions.

**Options**:
- A) Define a minimal expression grammar (comparisons, boolean operators, field references)
- B) Keep as free-text strings — BPMN export handles mapping
- C) Defer until projection implementation

**Blocking**: Plan 02 (validation), plan 10 (visual export)

---

### D8: Block operators — is `seq` missing?

**Question**: Should `seq` (sequence) be added to block operators alongside `par`, `alt`, `opt`, `loop`?

**Context**: DD-003 examples show `operator: seq` for sequential tracks within parallel blocks, but it's unclear if `seq` is actually in the schema enum. If a parallel block has operands, each operand may need to be a sequence — currently there's no way to express "these steps in order" as a block operand without `seq`.

**Options**:
- A) Add `seq` operator — needed for nested parallelism (parallel tracks with ordered steps)
- B) Keep as-is — sequential is the default behavior within a track

**Blocking**: Plan 02 (schema validation), Plan 04 (block examples)

---

### D9: Entity relationships — review implementation quality

**Question**: Is the current entity relationship model implemented well enough? Are foreign keys, association types, and cardinality constraints properly covered?

**Context**: Entity has a `relationships` map with `target: EntityRef`, `type` (one-to-one, one-to-many, many-to-one, many-to-many), `description`, `required`. This was implemented but never tested against real-world data modeling scenarios. Questions: (1) Is the relationship model expressive enough for consultants modeling information flows? (2) Are the cardinality types sufficient, or do we need richer association semantics? (3) How do entity relationships project to UML class diagrams or ER diagrams?

**Options**: Needs hands-on review with real entity modeling.

**Blocking**: Plan 04 (entity examples), Plan 08 (element catalog)

---

### D10: Hypothesis decomposition — review implementation quality

**Question**: Is the recursive hypothesis tree implemented well? Are `and`/`or`/`mece` operators tested and sufficient?

**Context**: HypothesisNode supports recursive `children` with operators (`and`, `or`, `mece`) and unbounded depth. This was implemented but the blind test showed users struggled to discover the SCQH structure and operators. Questions: (1) Are the operators sufficient for real consulting use? (2) Is the nesting depth handled well by validation and tree display? (3) Does the `type` enum on HypothesisNode (hypothesis/question/evidence/insight/recommendation) cover all real use cases?

**Options**: Needs validation against real hypothesis-driven consulting scenarios.

**Blocking**: Plan 04 (hypothesis templates/examples), Plan 08 (element catalog)

---

### D11: Workspace organization — review conventions

**Question**: Are workspace organization conventions clear enough and properly validated?

**Context**: P3.4 (domain-based files) and P3.5 (coherent boundaries) define principles. Workspace validator exists. But questions remain: (1) When should content be split across files — is the guidance concrete enough? (2) How do cross-file references resolve in practice — are there edge cases? (3) Is file naming (`*.process.ubml.yaml`) discoverable — the blind test showed users used wrong patterns (`process-broken.ubml.yaml`)?

**Options**: Needs review of file naming conventions, splitting guidance, and cross-file resolution.

**Blocking**: Plan 05 (single-file validation warning), Plan 08 (concepts guide)

---

### D12: Validation strictness levels

**Question**: How should progressive validation be implemented?

**Context**: P4.3 says "Documents should be able to declare their expected validation strictness." Currently validation is binary (pass/fail). Users need progressive formalization from rough drafts to validated models. Questions: (1) What levels make sense? (draft → standard → strict?) (2) Per-document declaration or workspace-level setting? (3) How does this interact with the `--suggest` mode (plan 05)?

**Options**:
- A) Document-level `validation` property: `draft` (suppress warnings), `standard` (default), `strict` (all checks)
- B) CLI flag only: `ubml validate --level=draft`
- C) Workspace-level setting in `workspace.ubml.yaml`

**Blocking**: Plan 02 (validation), Plan 05 (validation UX)

---

### D13: BPMN export fidelity

**Question**: What's acceptable information loss when exporting to BPMN?

**Context**: UBML captures richer context than BPMN can represent (hypotheses, insights, knowledge provenance, custom fields). P7.1 says lossless round-trip is not required, but we need to define what IS preserved. Questions: (1) What's the minimal viable BPMN export? (2) Which UBML constructs have no BPMN equivalent and how to handle them? (3) Should lost information be emitted as BPMN documentation/annotations?

**Options**: Needs analysis of projection docs (`docs/projections/BPMN.md`) against current schema.

**Blocking**: Plan 10 (visual export)

---

### D14: Process mining import — observation types

**Question**: What observation types are needed for process mining data import?

**Context**: Scenario has an `observations`/`evidence` array for quantitative measurements from mining tools (Celonis, etc.). Questions: (1) Are the current evidence types (duration, count, cost) sufficient? (2) How should mining-derived frequencies, variant distributions, and bottleneck data map to UBML? (3) What's the relationship between mining observations and KPI actuals?

**Options**: Needs research into common process mining export formats.

**Blocking**: Plan 02 (validation), Plan 10 (future considerations)

---

## Decisions Deferred (need real usage data)

These are also tracked in [10-future-considerations.md](10-future-considerations.md):

- **HypothesisNode.source → citation rename** — `source` on HypothesisNode semantically means "evidence citation" not "knowledge provenance." Renaming to `citation` would disambiguate from Insight `sources`. Breaking change, needs migration tooling. Revisit after F1 ships. (plan 10, D4)
- **Knowledge indexing/caching strategy** — Pre-computed index files (`.ubml/index/`) for LLM context and fast search. Key questions: gitignored vs committed? Index format? Stale detection? Rebuild cost at scale (1000+ insights)? Needs real usage data. (plan 10)
- **LLM extraction pipeline** — Automated claim extraction from transcripts. Chunked processing, deduplication, confidence scoring. Depends on provider abstraction (OpenAI, Anthropic, local). Implement after manual workflow is proven. (plan 10, C)
- **Insight deduplication strategy** — When the same fact appears in multiple interviews, merge or keep separate with cross-references? Trade-off between data fidelity and noise. (plan 09, H)
- **Insight splitting conventions** — As workspaces grow, insight files need splitting. By domain (recommended), by source, by date, or by topic? Need real usage patterns. Current recommendation is domain-based per P3.4.
- **Step `kind` values review** — Current kinds: `action`, `decision`, `milestone`, `wait`, `handoff`, `start`, `end`. Are all needed? Any missing for real-world modeling? E.g., `review`, `approval` are properties not kinds (P10.2) — is that sufficient? Needs usage data.
- **Duration/Money/Rate primitives** — Are the current formats right? Duration uses `30min`, `2h`, `1.5d`, `1wk`, `3mo`. Money and Rate formats defined in schema. Questions: (1) Is ISO 8601 (`PT30M`) correctly rejected? (2) Are rate expressions expressive enough? Needs format validation testing.
- **Tooling coverage for knowledge layer** — Verify that ESLint rules, CLI help text, and validation hints correctly reference `observations`, `SourceRef`, `InsightRef`, and other knowledge layer names introduced in DD-008. May have gaps introduced during implementation.
