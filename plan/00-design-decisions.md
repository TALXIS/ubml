# 00 — Open Design Decisions (Schema-Blocking)

> **Status**: Proposed
> **Depends on**: Nothing (starting point)
> **Effort**: Small — five focused decisions
> **References**: `docs/DESIGN-DECISIONS.md`, `docs/PRINCIPLES.md`

---

## Goal

Resolve only the design questions that block schema work (Plans 01–03). Make a decision, document it in `docs/DESIGN-DECISIONS.md`, move on. Remaining design questions live in [Plan 17](17-future.md).

---

## D1: Process.owner

**Question**: Add `Process.owner: ActorRef`?

**Context**: Phase, KPI, ROI, HypothesisTree all have `owner`. Process does not. Blind tester naturally wrote `owner: AC00003` on Process. Semantically clear: "who is accountable for this process end-to-end."

**Recommendation**: **Add it.** Consistent with other types. Distinct from RACI (step-level) and Phase.owner (phase-level).

**Blocks**: Plan 02

---

## D2: KPI↔Step linkage direction

**Question**: Should Step have a `kpis` property, or keep KPI→Step only?

**Context**: KPI has `step: StepRef` and `process: ProcessRef`. Testers expected `kpis: [KP00001]` on Step. Adding both directions violates P1.1 (No Dual Hierarchy).

**Recommendation**: **Keep one-way (KPI→Step).** Tooling provides reverse lookup (`ubml trace`, `ubml show`). Document this in CLI help.

**Blocks**: Plan 03 (semantic validation), Plan 07 (schema discovery)

---

## D3: `seq` block operator

**Question**: Add `seq` (sequence) to block operators alongside `par`, `alt`, `opt`, `loop`?

**Context**: Parallel blocks with operands need a way to express "these steps in order" as a track. Without `seq`, there's no way to nest ordered sequences inside a parallel block.

**Recommendation**: **Add `seq`.** Needed for `par` blocks with ordered tracks. Sequential is the default at process level, but explicit `seq` is required inside structured blocks.

**Blocks**: Plan 02

---

## D4: Process vs Workflow boundary

**Question**: Does UBML need a formal boundary definition between process modeling and workflow/automation?

**Context**: UBML = business intent (what/why), workflow tools = automation (how). But `blocks`, `systems`, and detailed step properties push toward workflow territory. DD-006 (Template-Instance Separation) already implies the answer.

**Recommendation**: **Document as a DD, no schema change.** Write a short Design Decision clarifying: UBML describes what happens and who's responsible; it does not describe execution logic, routing rules, or system integrations. Reference DD-006.

**Blocks**: Plan 13 (concepts documentation)

---

## D5: Validation strictness levels

**Question**: How should progressive validation work?

**Context**: P4.3 says documents should declare expected validation strictness. Currently validation is binary (pass/fail). Users need progressive formalization.

**Options**:
- A) Document-level `validation: draft | standard | strict`
- B) CLI flag: `ubml validate --level=draft`
- C) Both — document declares default, CLI overrides

**Recommendation**: **Option C.** Document-level property sets the default (progressive modeling). CLI flag overrides for CI/CD or batch checking. Default when omitted: `standard`.

**Blocks**: Plan 03 (semantic validation)

---

## Implementation

For each decision:
1. Discuss and decide
2. Add rationale to `docs/DESIGN-DECISIONS.md`
3. Mark decided here (update this file)

**Deferred decisions** (D5–D14 from original plan) → [Plan 17](17-future.md)
