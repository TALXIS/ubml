# Roadmap Review — Principles & Vision Alignment

> **Date**: 2026-02-07
> **Scope**: All items in `plan/` validated against `docs/PRINCIPLES.md`, `docs/VISION.md`, `docs/WORKSPACE-SEMANTICS.md`, and `docs/DESIGN-DECISIONS.md`

---

## Principle Tensions

These aren't outright violations — they're trade-offs that need explicit resolution and documentation.

### 1. Plan 00 D5 — Validation strictness default vs P4.4

**Plans affected**: 00, 04
**Resolve before**: Plan 04

Plan 00 D5 recommends: *"Default when omitted: `standard`"*. P4.4 (No Hidden Defaults) says: *"Schema properties with meaningful choices must not have defaults. Users must explicitly specify values."*

If a document omits `validation` and the system silently treats it as `standard`, the user never discovers `draft` and `strict` exist.

**Options**:
- (a) Make `validation` a **tooling** default (CLI defaults to `standard` when the property is absent), not a **schema** default. The schema has no `default:` keyword. This preserves P4.4.
- (b) Accept this as a documented P4.4 exception. Justify: validation strictness is a meta-property, not a modeling choice.

---



## Missing Dependencies

### 3. Plan 16 Phase 2 — No prerequisite on expression language

**Plans affected**: 16, 18
**Resolve before**: Plan 16 Phase 2 starts

Plan 16 Phase 2 targets BPMN 2.0 XML export. BPMN requires **parseable expressions** for gateway conditions. Plan 18 defers expression language design with the note *"When to decide: Before BPMN export"* — but Plan 16's dependency list (`01–04, 10`) does not include expression language resolution.

If someone starts BPMN export, they'll hit a wall at gateway condition serialization.

**Fix**: Add expression language resolution as an explicit prerequisite in Plan 16 Phase 2. Either promote it to its own plan file or add a blocking note in Plan 16.

---

## Summary

| # | Issue | Type | Plans | Urgency |
|---|-------|------|-------|--------|
| 1 | Validation strictness default vs P4.4 | Principle tension | 00, 04 | Before Plan 04 |
| 2 | Expression language prerequisite missing from Plan 16 | Missing dependency | 16, 18 | Before Plan 16 Phase 2 |

**2 items require decisions.**
