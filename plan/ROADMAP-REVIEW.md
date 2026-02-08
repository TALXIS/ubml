# Roadmap Review — Principles & Vision Alignment

> **Date**: 2026-02-08
> **Scope**: All items in `plan/` validated against `docs/PRINCIPLES.md`, `docs/VISION.md`, `docs/WORKSPACE-SEMANTICS.md`, and `docs/DESIGN-DECISIONS.md`

---

## Open Issues

### 1. Plan 16 Phase 2 — No prerequisite on expression language

**Plans affected**: 16, 18
**Resolve before**: Plan 16 Phase 2 starts

Plan 16 Phase 2 targets BPMN 2.0 XML export. BPMN requires **parseable expressions** for gateway conditions. Plan 18 defers expression language design with the note *"When to decide: Before BPMN export"* — but Plan 16's dependency list (`01–04, 10`) does not include expression language resolution.

If someone starts BPMN export, they'll hit a wall at gateway condition serialization.

**Fix**: Add expression language resolution as an explicit prerequisite in Plan 16 Phase 2. Either promote it to its own plan file or add a blocking note in Plan 16.

---

## Summary

| # | Issue | Plans | Urgency |
|---|-------|-------|---------|
| 1 | Expression language prerequisite | 16, 18 | Before Plan 16 Phase 2 |

**1 item requires a decision.**
