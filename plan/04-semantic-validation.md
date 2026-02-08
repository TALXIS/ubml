# 04 — Semantic Validation

> **Status**: Proposed
> **Depends on**: 01, 02, 03 (schema must be stable before adding semantic checks)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Extend `src/semantic-validator.ts` to catch structural errors that currently pass silently. Prioritized by value.

---

## A. Cycle Detection (high value)

**Problem**: No validation that parent chains (capability, process, location) are acyclic. Cycles cause infinite loops in renderers or tree views.

**Fix**: Walk `parent` references and detect cycles.

**Error**: `"Circular parent chain detected: CP00001 → CP00002 → CP00001"`

**Severity**: Error (cycles are always bugs).

---

## B. Type-Correct References (high value)

**Problem**: Cross-reference check verifies existence but not type-correctness. `CP00002.parent = AC00001` passes if AC00001 exists, even though it's an actor not a capability.

**Fix**: When resolving references, verify the target ID's prefix matches the expected ref type.

**Error**: `"CP00002.parent references AC00001 (Actor), but CapabilityRef expected"`

**Severity**: Error.

---

## C. Phase/Block Step Scope (medium value)

**Problem**: Steps in `phase.includeSteps` or `block.steps` should exist within the same process, not just globally.

**Fix**: Validate that step references in phases/blocks resolve to steps defined in the containing process.

**Error**: `"Phase PH00001 references ST00005, which is not defined in process PR00001"`

**Severity**: Error.

---

## D. Orphaned Step Detection (low value)

**Problem**: Steps defined but not reachable from any link, phase, or block may indicate modeling errors.

**Fix**: Emit warning: `"Step ST00005 is defined but not referenced by any link, phase, or block in PR00001"`

**Severity**: Warning (step may be intentionally disconnected during progressive modeling).

---

## E. Validation Strictness Levels (if D5 decided)

If Plan 00 D5 resolves to support validation levels, implement the framework here:

- `draft`: Suppress warnings, only schema errors
- `standard`: Warnings + errors (default)
- `strict`: All checks including style suggestions

**Implementation**: Check document-level `validation` property, allow CLI `--level` override.

---

## Checklist

- [ ] Implement cycle detection for parent chains
- [ ] Implement type-correct reference validation
- [ ] Implement same-process scope for phase/block step refs
- [ ] Implement orphaned step warning
- [ ] (If D5 resolved) Implement validation strictness framework
- [ ] Unit tests for each new validation rule
- [ ] Run full test suite + validate example workspace

---

## Design Notes

- Tackle A and B first — highest value, most likely to catch real errors.
- C and D can be follow-ups if the session runs long.
- Each check should be independently toggleable for future strictness levels.
