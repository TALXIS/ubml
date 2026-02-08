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
| 01 | [Knowledge Layer Schema](01-knowledge-layer-schema.md) | F1–F7: sources array, expand about, remove defaults, ActorRef-only people, remove notes, remove HypothesisNode.source | Small–Med | — |
| 02 | [Typed Reference Compliance](02-typed-reference-compliance.md) | P1.5 enforcement: Capability.systems, Document/Entity.system, KPI/Observation.source, GlossaryTerm.source | Small | — |
| 03 | [Process & Block Schema](03-process-block-schema.md) | Process.owner, seq operator, block enforcement, KPI direction | Medium | 00 |
| 04 | [Semantic Validation](04-semantic-validation.md) | Cycle detection, type-correct refs, scope validation, orphan detection | Medium | 01, 02, 03 |
| 05 | [Validation Bugs](05-validation-bugs.md) | Exit code fix, skipped file warning, single-file warning, schema properties, date format enforcement | Small | — |

### Milestone 2: CLI & UX (make it usable)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 06 | [CLI Error Messages](06-cli-error-messages.md) | Duration hints, ref context, RACI guidance, help topics, knowledge layer coverage | Medium | 01, 03 |
| 07 | [Templates & Examples](07-templates-examples.md) | Fix templates, quality audit, `ubml examples` command | Medium | 01, 03 |
| 08 | [Schema Discovery](08-schema-discovery.md) | Property search, categorized display, `--suggest` mode | Medium | 01, 03 |
| 09 | [Quick Capture & Search](09-quick-capture-search.md) | Inline add flags, `ubml find`, `ubml trace` | Medium | 01, 03, 06 |
| 10 | [Refactoring & Health](10-refactoring-health.md) | `ubml rename`, `ubml doctor`, `ubml report`, `ubml lint`, `ubml migrate` | Large | 04, 05 |

### Milestone 3: Documentation (make it learnable)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 11 | [Docs Structure](11-docs-structure.md) | Reorganize docs/, landing page, example/README | Small | 06–08 |
| 12 | [Quickstart & CLI Ref](12-quickstart-cli-reference.md) | Tutorial + command reference | Medium | 11 |
| 13 | [Element Catalog](13-element-catalog.md) | Per-element reference with examples | Medium | 11, 12 |
| 14 | [Concepts, FAQ, Troubleshooting](14-concepts-faq-troubleshooting.md) | Conceptual overview + support docs | Large | 11, 13 |

### Milestone 4: Integration & Export (make it powerful)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 15 | [VS Code Integration](15-vscode-integration.md) | YAML schema association, init scaffolding | Medium | 01–04 |
| 16 | [Visual Export](16-visual-export.md) | Mermaid → BPMN → PlantUML/ArchiMate |Large | 01–04, 10 |
| 17 | [CI/CD & Release](17-ci-release.md) | GitHub Actions, release workflow, version strategy | Small–Med | 05, 10 |
| 18 | [Future](18-future.md) | Deferred decisions, AI extraction, playground, deduplication, indexing, insight splitting | Exploratory | — |

### Milestone 5: Progressive Refinement (make it smart)

| # | File | Scope | Effort | Depends on |
|---|------|-------|--------|------------|
| 19 | [Refinement Questions](19-refinement-questions.md) | Schema-declared questions, refinement engine, CLI `ubml refine`, ESLint rule, computed maturity | Large | 04, 06, 08, 15 |
| 20 | [Analysis Feedback Loops](20-analysis-feedback-loops.md) | Cross-element references, consulting framework gaps, cyclic analysis workflow support | Large | 19, 04, 00 |

---

## Dependency Graph

```
                ┌── 01 Knowledge Layer ──┐
                ├── 02 Typed Refs ───────┤
00 Decisions ───┤                        ├── 04 Semantic Validation ──┐
                └── 03 Process/Block ────┘                           │
                                                                     ├── 10 Refactoring/Health
05 Validation Bugs ──────────────────────────────────────────────────┘
                                                                      
01 + 03 ──┬── 06 Error Messages ──┐                                  
          ├── 07 Templates ────────┤                                  
          ├── 08 Schema Discovery ─┼── 11 Docs Structure ── 12 Quickstart
          └── 09 Quick Capture ────┘         │                  │
                                             └── 13 Elements ── 14 Concepts
                                                                      
01–04 ──┬── 15 VS Code Integration                                   
        └── 16 Visual Export                                          
                                                                      
05 + 10 ── 17 CI/Release                                              
                                                                      
18 Future (independent, exploratory)                                  

04 + 06 + 08 + 15 ── 19 Refinement Questions ── 20 Analysis Feedback Loops

---

## Parallel Tracks

Plans 01, 02, and 05 can start immediately (no dependencies). Within each milestone, independent plans can run in parallel:

- **Milestone 1**: 00 + 01 + 02 + 05 in parallel → then 03 → then 04
- **Milestone 2**: 06 + 07 + 08 in parallel → then 09 → then 10
- **Milestone 3**: 11 → 12 → 13 → 14 (sequential)
- **Milestone 4**: 15, 16, 17 can run in parallel once prerequisites met

---

## Status Key

Each plan file tracks its own status:
- **Proposed** — Written, not yet started
- **In Progress** — Actively being implemented
- **Complete** — All tasks done, verified
- **Deferred** — Postponed with rationale
