# 02 — Process & Block Schema Changes

> **Status**: Proposed
> **Depends on**: 00 (D1: Process.owner, D3: seq operator)
> **Effort**: Medium (one session)
> **Schema version**: 1.4 → 1.5
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md), Plan 00

---

## Goal

Add missing process-level properties and fix block schema constraints. These are schema changes driven by design decisions in Plan 00.

---

## A. Add `Process.owner: ActorRef`

**Rationale**: Consistent with Phase, KPI, ROI, HypothesisTree. Clear semantics: "who is accountable for this process end-to-end." Distinct from RACI (step-level) and Phase.owner (phase-level).

**Fix**: Add `owner` property of type `ActorRef` to Process in schema.

---

## B. Add `seq` Block Operator

**Rationale**: Parallel blocks need ordered tracks. Without `seq`, there's no way to express "these steps in order" as an operand of a `par` block.

**Fix**: Add `seq` to the `operator` enum on Block.

**Update**: Templates and examples showing nested `par` → `seq` patterns.

---

## C. Block Content Enforcement

**Problem**: `Block` allows neither `steps` nor `operands` — an empty block is valid but meaningless.

**Fix**: Add `anyOf` constraint:

```yaml
anyOf:
  - required: [steps]
  - required: [operands]
```

---

## D. Document KPI→Step Direction (no schema change)

**Decision**: KPI references Step/Process (one-way). Step does NOT have a `kpis` array. This preserves P1.1 (No Dual Hierarchy).

**Action**: Add inline comment in schema. Ensure CLI `ubml show` and `ubml trace` provide reverse lookup. Document in help topics (Plan 05).

---

## Checklist

- [ ] Add `owner: ActorRef` to Process schema
- [ ] Add `seq` to Block operator enum
- [ ] Add `anyOf` constraint to Block (steps or operands required)
- [ ] Add schema comments documenting KPI→Step direction
- [ ] Run `npm run generate`
- [ ] Update example workspace with Process.owner usage
- [ ] Update example workspace with `seq` block pattern
- [ ] Run `npm test` + validate examples
- [ ] Document decisions in `docs/DESIGN-DECISIONS.md`
