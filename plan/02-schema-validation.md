# 02 — Schema & Validation Improvements

> **Status**: Proposed
> **Depends on**: 01 (knowledge layer schema should be settled first)
> **Effort**: Medium (one session)
> **Schema version**: 1.4
> **References**: [Schema Gaps Review (old)](https://github.com/TALXIS/ubml), [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Tighten schema constraints and extend semantic validation to catch structural errors that currently pass silently.

---

## A. Block Content Enforcement (Schema Change)

**Problem**: `Block` allows neither `steps` nor `operands` — an empty block is valid but meaningless.

**Fix**: Add `anyOf` constraint to `block.types.yaml`:

```yaml
anyOf:
  - required: [steps]
  - required: [operands]
```

**Effort**: Small. Schema change + regenerate + test.

**Pre-check**: Verify no legitimate use case for an empty block.

---

## B. Semantic Validation Improvements (Code Changes)

Extend `src/semantic-validator.ts` with these checks, prioritized by value:

### B1: Cycle Detection (High value)

**Problem**: No validation that parent chains (capability, process, location) are acyclic. A cycle causes infinite loops in renderers or tree views.

**Fix**: Walk `parent` references and detect cycles. Emit error: `"Circular parent chain detected: CP00001 → CP00002 → CP00001"`.

### B2: Type-Correct References (High value)

**Problem**: Cross-reference check verifies existence but not type-correctness. If `CP00002.parent = CP00001`, it checks CP00001 exists but not that it's actually a capability.

**Fix**: When resolving references, verify the target ID's type matches the expected ref type (e.g., `CapabilityRef` must point to a capability, not an actor).

### B3: Phase/Block Step Scope (Medium value)

**Problem**: Steps referenced in `phase.includeSteps` or `block.steps` should exist within the same process, not just globally.

**Fix**: Validate that step references in phases/blocks resolve to steps defined in the containing process.

### B4: Orphaned Step Detection (Low value — warning only)

**Problem**: Steps defined in a process but not reachable from any link, phase, or block could indicate modeling errors.

**Fix**: Emit warning (not error): `"Step ST00005 is defined but not referenced by any link, phase, or block in PR00001"`.

---

## Implementation Checklist

- [ ] Schema: Add `anyOf` to `schemas/1.4/types/block.types.yaml` (or wherever block is defined)
- [ ] Run `npm run generate`
- [ ] Code: Add cycle detection to `src/semantic-validator.ts`
- [ ] Code: Add type-correct reference checking
- [ ] Code: Add same-process scope validation for phase/block step refs
- [ ] Code: Add orphaned step warning
- [ ] Tests: Add unit tests for each new validation rule
- [ ] Run full test suite + validate example workspace

---

## Design Notes

- Cycle detection should error, not warn — cycles are always bugs.
- Type-correct refs should error — referencing an actor where a capability is expected is always wrong.
- Orphaned steps should warn — a step may be intentionally disconnected during progressive modeling.
- Tackle B1 and B2 first. B3 and B4 can be follow-ups if the session runs long.
