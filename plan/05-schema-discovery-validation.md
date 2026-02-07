# 05 — Schema Discovery & Validation UX

> **Status**: Proposed
> **Depends on**: 01, 02 (schema should be finalized before improving discovery tools)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md) §Bug 1, §Bug 4

---

## Goal

Fix schema introspection bugs and improve how users discover available properties and get validation feedback. Two critical bugs from blind testing: false validation success and empty schema properties output.

---

## A. Fix Schema Properties Output

**Bug**: `ubml schema hypotheses --properties` returns empty. Users can't discover what fields are available.

**Fix**: Ensure all document types return their full property list. Debug the property extraction logic for types that currently fail.

---

## B. Property Search Command

Let users search for a property across all types:

```bash
ubml schema --find "owner"
# → Phase.owner: ActorRef
# → (Process.owner: not available — use RACI)
```

Helps users discover where properties live without browsing every schema individually.

---

## C. Categorized Property Display

Show properties grouped by usage instead of flat list:

```
REQUIRED: name, steps
COMMON:   description, level, phases, links
ADVANCED: blocks, custom, tags
```

Uses `required` from schema for the first group. Common vs advanced could be derived from frequency in examples or annotated in schema metadata.

---

## D. Single-File Validation Warning

**Bug**: `ubml validate single-file.yaml` silently skips cross-reference checks. Users get false confidence.

**Fix**: When validating a single file (not a workspace), emit:

```
Note: Single-file validation checks schema only. Cross-references
(actor, process, entity links) are checked in workspace mode:
  ubml validate .
```

---

## E. Validation Suggestions Mode (stretch goal)

`ubml validate --suggest` provides proactive advice beyond errors:

- Process has no RACI assignment on any step
- KPI defined but not linked to any step or process
- Actor defined but never referenced in any process
- Insight has no `about` references

These are warnings, not errors — the model is valid but potentially incomplete.

---

## Implementation Checklist

- [ ] Debug and fix `ubml schema --properties` for all types
- [ ] Implement `ubml schema --find <property>` search
- [ ] Implement categorized property display (required/common/advanced)
- [ ] Add single-file validation warning about cross-references
- [ ] (Stretch) Implement `ubml validate --suggest` mode
- [ ] Tests for new commands and fixed output
