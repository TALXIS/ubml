# UBML Roadmap

> **Last updated**: 2026-02-07
> **Source**: Blind testing sessions (CETIN FTTH, power transformer eval), schema review, documentation audit
> **Historical context**: [`_reference/EVALUATION-FINDINGS.md`](_reference/EVALUATION-FINDINGS.md)

---

## Plan Files

Plans are numbered by dependency order. Complete earlier items before starting later ones — later plans may depend on decisions or changes made in earlier ones.

### Design Prerequisites

| # | File | Scope | Effort |
|---|------|-------|--------|
| 00 | [Open Design Decisions](00-design-decisions.md) | 14 design questions (D1–D14) + 8 deferred items. Process.owner, KPI model, entity relationships, hypothesis quality, workspace conventions, validation strictness, BPMN fidelity, process mining, expression language, block operators | Variable |

### Schema & Core (after design decisions)

| # | File | Scope | Effort |
|---|------|-------|--------|
| 01 | [Knowledge Layer Schema Fixes](01-knowledge-layer-schema.md) | F1–F5: `source→sources`, expand `about`, remove default, widen `attribution`, remove `notes` | Medium |
| 02 | [Schema & Validation Improvements](02-schema-validation.md) | Block content enforcement, cycle detection, type-correct refs, orphan detection | Medium |

### CLI & UX (after schema settles)

| # | File | Scope | Effort |
|---|------|-------|--------|
| 03 | [CLI Error Messages & Guidance](03-cli-error-messages.md) | Duration hints, reference hints, RACI guidance, help topics | Medium |
| 04 | [Templates & Examples](04-templates-examples.md) | Fix links/glossary/hypotheses templates, add `ubml examples` command | Medium |
| 05 | [Schema Discovery & Validation UX](05-schema-discovery-validation.md) | Fix empty properties output, property search, categorized display, `--suggest` mode, single-file warning | Medium |

### Documentation (after CLI stabilizes)

| # | File | Scope | Effort |
|---|------|-------|--------|
| 06 | [Docs Structure & Landing Page](06-docs-structure.md) | Reorganize `docs/`, create `guide/` and `index.md`, add `example/README.md` | Small |
| 07 | [Docs: Guides](07-docs-guides.md) | Quickstart tutorial, CLI reference | Medium |
| 08 | [Docs: Reference Content](08-docs-reference.md) | Element catalog, concepts guide, FAQ, troubleshooting | Large |

### Future & Large Features

| # | File | Scope | Effort |
|---|------|-------|--------|
| 09 | [CLI Convenience & Tooling](09-cli-convenience-tooling.md) | Quick capture, search, trace, rename, doctor, lint | Large |
| 10 | [Future Considerations](10-future-considerations.md) | Visual export, doc framework migration, AI extraction, deferred schema discussions | Exploratory |

---

## Dependency Graph

```
00 Design Decisions ─────────┐
                             ├──▶ 01 Knowledge Layer Schema ──┐
                             │                                 ├──▶ 03 CLI Error Messages ──┐
                             └──▶ 02 Schema & Validation ─────┘                             │
                                                                                             │
                                                               ┌──▶ 04 Templates & Examples ─┤
                                                               │                             │
                                                               └──▶ 05 Schema Discovery ─────┤
                                                                                             │
                                                               06 Docs Structure ◀───────────┘
                                                                      │
                                                                      ▼
                                                               07 Guides ──▶ 08 Reference

09 CLI Convenience & Tooling ──── (independent, after 03–05)
10 Future Considerations ──────── (independent, exploratory)
```

---

## Status Key

Each plan file tracks its own status:
- **Proposed** — Written, not yet started
- **In Progress** — Actively being implemented
- **Complete** — All tasks done, verified
- **Deferred** — Postponed with rationale
