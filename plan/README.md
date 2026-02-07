# UBML Roadmap

> **Last updated**: 2026-02-07
> **Source**: Blind testing sessions (CETIN FTTH, power transformer eval), schema review, documentation audit
> **Historical context**: [`_reference/EVALUATION-FINDINGS.md`](_reference/EVALUATION-FINDINGS.md)

---

## Principles

- **No backward compatibility** — pre-release, all breaking changes allowed
- **Small deliverables** — each plan is one focused session
- **Dependency order** — complete earlier plans before starting later ones
- **Schema first** — get the DSL right, then improve tooling, then document

---

## Plan Files

### Milestone 1: Schema & Validation (get the DSL right)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 00 | [Design Decisions](00-design-decisions.md) | 5 schema-blocking decisions (D1–D5) | Small | — |
| 01 | [Knowledge Layer Schema](01-knowledge-layer-schema.md) | F1–F5: sources array, expand about, remove default, widen attribution, remove notes | Small–Med | — |
| 02 | [Process & Block Schema](02-process-block-schema.md) | Process.owner, seq operator, block enforcement, KPI direction | Medium | 00 |
| 03 | [Semantic Validation](03-semantic-validation.md) | Cycle detection, type-correct refs, scope validation, orphan detection | Medium | 01, 02 |
| 04 | [Validation Bugs](04-validation-bugs.md) | Exit code fix, skipped file warning, single-file warning, schema properties, date format enforcement | Small | — |

### Milestone 2: CLI & UX (make it usable)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 05 | [CLI Error Messages](05-cli-error-messages.md) | Duration hints, ref context, RACI guidance, help topics, knowledge layer coverage | Medium | 01, 02 |
| 06 | [Templates & Examples](06-templates-examples.md) | Fix templates, quality audit, `ubml examples` command | Medium | 01, 02 |
| 07 | [Schema Discovery](07-schema-discovery.md) | Property search, categorized display, `--suggest` mode | Medium | 01, 02 |
| 08 | [Quick Capture & Search](08-quick-capture-search.md) | Inline add flags, `ubml find`, `ubml list`, `ubml trace` | Medium | 01, 02, 05 |
| 09 | [Refactoring & Health](09-refactoring-health.md) | `ubml rename`, `ubml doctor`, `ubml report`, `ubml lint`, `ubml migrate` | Large | 03, 04 |

### Milestone 3: Documentation (make it learnable)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 10 | [Docs Structure](10-docs-structure.md) | Reorganize docs/, landing page, example/README | Small | 05–07 |
| 11 | [Quickstart & CLI Ref](11-quickstart-cli-reference.md) | Tutorial + command reference | Medium | 10 |
| 12 | [Element Catalog](12-element-catalog.md) | Per-element reference with examples | Medium | 10, 11 |
| 13 | [Concepts, FAQ, Troubleshooting](13-concepts-faq-troubleshooting.md) | Conceptual overview + support docs | Large | 10, 12 |

### Milestone 4: Integration & Export (make it powerful)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 14 | [VS Code Integration](14-vscode-integration.md) | YAML schema association, init scaffolding, stretch: extension | Medium | 01–03 |
| 15 | [Visual Export](15-visual-export.md) | Mermaid → BPMN → PlantUML/ArchiMate | Large | 01–03 |
| 16 | [CI/CD & Release](16-ci-release.md) | GitHub Actions, release workflow, version strategy | Small–Med | 04, 09 |
| 17 | [Future](17-future.md) | Deferred decisions, AI extraction, playground, deduplication, indexing, insight splitting | Exploratory | — |

---

## Dependency Graph

```
                ┌── 01 Knowledge Layer ──┐
00 Decisions ───┤                        ├── 03 Semantic Validation ──┐
                └── 02 Process/Block ────┘                           │
                                                                     ├── 09 Refactoring/Health
04 Validation Bugs ──────────────────────────────────────────────────┘
                                                                      
01 + 02 ──┬── 05 Error Messages ──┐                                  
          ├── 06 Templates ────────┤                                  
          ├── 07 Schema Discovery ─┼── 10 Docs Structure ── 11 Quickstart
          └── 08 Quick Capture ────┘         │                  │
                                             └── 12 Elements ── 13 Concepts
                                                                      
01–03 ──┬── 14 VS Code Integration                                   
        └── 15 Visual Export                                          
                                                                      
04 + 09 ── 16 CI/Release                                              
                                                                      
17 Future (independent, exploratory)                                  
```

---

## Parallel Tracks

Plans 01 and 04 can start immediately (no dependencies). Within each milestone, independent plans can run in parallel:

- **Milestone 1**: 00 + 01 + 04 in parallel → then 02 → then 03
- **Milestone 2**: 05 + 06 + 07 in parallel → then 08 → then 09
- **Milestone 3**: 10 → 11 → 12 → 13 (sequential)
- **Milestone 4**: 14, 15, 16 can run in parallel once prerequisites met

---

## Status Key

Each plan file tracks its own status:
- **Proposed** — Written, not yet started
- **In Progress** — Actively being implemented
- **Complete** — All tasks done, verified
- **Deferred** — Postponed with rationale
