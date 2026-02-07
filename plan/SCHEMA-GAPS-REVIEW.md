# Schema Gaps & Issues — Review

> **Source**: Review of `sandbox/cetin-ftth/SCHEMA-ISSUES.md` and `sandbox/cetin-ftth/UBML-GAPS.md` against schema v1.4
> **Date**: 2026-02-07
> **Status**: Proposed
>
> **Context**: The two source documents were written against schema v1.0. Many issues have been resolved in v1.4. This plan captures what remains actionable.

---

## Summary

| # | Item | Origin | Severity | Status in v1.4 |
|---|------|--------|----------|-----------------|
| 1 | Semantic validation gaps | SCHEMA-ISSUES #4 | Medium | Partially addressed |
| 2 | Block requires steps or operands | SCHEMA-ISSUES #6 | Low | Still open |
| 3 | workStatus on HypothesisNode | UBML-GAPS #1 | Medium | Still missing |
| 4 | displayNumber on HypothesisNode | UBML-GAPS #2 | Low | Still missing |
| 5 | Impact scoring | UBML-GAPS #3 | Low | Still missing |

---

## Action Items

### A1: Block Content Enforcement (Low effort, schema change)

`Block` currently allows neither `steps` nor `operands` — an empty block is valid but meaningless.

**Proposed fix** — add `anyOf` constraint to `block.types.yaml`:

```yaml
anyOf:
  - required: [steps]
  - required: [operands]
```

This ensures every block has content. Review whether any legitimate use case exists for an empty block first.

**Estimate**: Small. Schema change + regenerate types + test.

### A2: Semantic Validation Improvements (Medium effort)

The semantic validator covers reference integrity and duplicate IDs well. Remaining gaps worth addressing:

1. **Hierarchy consistency** — If `CP00002.parent = CP00001`, check that `CP00001` actually exists and is a capability (not just any ID). Currently the cross-reference check verifies existence but not type-correctness.
2. **Cycle detection** — No validation that parent chains (capability, process, location) are acyclic. A cycle would cause infinite loops in renderers or tree views.
3. **Phase/block step coverage** — Steps referenced in `phase.includeSteps` or `block.steps` should be validated to exist within the same process (not just globally).
4. **Orphaned step detection** — Steps defined in a process but not reachable from any link, phase, or block could be flagged as warnings.

Tackle incrementally — cycle detection and same-process scope checks are highest value.

**Estimate**: 2–3 days across multiple PRs.

### A3: Consider workStatus on HypothesisNode (Design discussion)

**Gap**: Hypothesis nodes have `status` for validation state (`untested`/`validated`/`invalidated`/`partial`) but no field for implementation/work status (`not-started`/`in-progress`/`completed`).

**Use case**: Consulting engagements track which hypothesis areas are being actively worked vs. queued. The CETIN project needed this (used `custom` workaround).

**Options**:
- **A) Add `workStatus` field** — enum `[not-started, in-progress, next, completed, blocked]`. Simple, clear semantics.
- **B) Keep as `custom`** — Already works. Avoids schema bloat.
- **C) Generic `implementationStatus`** on multiple types — Broader but adds complexity.

**Recommendation**: Option A. Small addition, clear real-world demand, avoids `custom` proliferation for a common concern. Decide after reviewing whether other types need similar tracking.

### A4: Consider displayNumber on HypothesisNode (Low priority)

**Gap**: No way to assign display labels (e.g., "1.1", "1.2.3") independent of IDs.

**Assessment**: This is a presentation concern. IDs like `HY00001` are stable references; display numbering is a view/projection concern. Could be handled by:
- Renderers auto-generating numbering from tree position
- A `label` or `displayNumber` field on HypothesisNode

**Recommendation**: Defer. Let renderers/projections handle numbering from tree structure. If demand persists, add `label` (not `displayNumber`) since it's more general.

### A5: Consider Impact Scoring (Low priority)

**Gap**: Only `priority` enum exists (`low`/`normal`/`high`/`urgent`). No numeric scoring or multi-dimensional impact assessment.

**Assessment**: Quantitative impact scoring is useful for prioritization matrices but introduces complexity (dimensions, weights, scoring scales). The `custom` field handles this well for teams that need it.

**Recommendation**: Defer. The `priority` field plus `custom` covers most needs. If structured impact becomes common across multiple projects, revisit as a dedicated type.
