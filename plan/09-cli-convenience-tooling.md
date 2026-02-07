# 09 — CLI Convenience & Tooling Commands

> **Status**: Proposed
> **Depends on**: 03–05 (core CLI should be solid before adding new commands)
> **Effort**: Large (multiple sessions likely — implement incrementally)

---

## Goal

Add CLI commands that make common workflows faster: quick knowledge capture, workspace search, safe refactoring, and health diagnostics. These were the most-requested features during blind testing.

---

## A. Quick Capture Commands

Reduce friction for knowledge layer operations:

```bash
ubml add insight "CEO mentioned 180K target" --source SO00001 --kind decision
ubml add source --name "Strategy Meeting" --type meeting --date 2026-01-15
```

Currently requires manual YAML editing for knowledge capture. CLI shortcuts make it possible to capture insights during/after meetings without opening files.

---

## B. Search & Discovery

```bash
ubml find "Jan Til"     # Fuzzy search across all elements by name/text
ubml list actors        # Quick reference table of all actors with IDs
ubml trace AC00001      # Show derivedFrom chain back to sources
```

`trace` is particularly valuable — it answers "where did this come from?" by walking the knowledge chain.

---

## C. Model Health Reports

```bash
ubml report coverage    # % of elements with derivedFrom links
ubml report orphans     # Unused insights, unreferenced actors
```

Lightweight alternative to full `doctor` command — focused on specific metrics.

---

## D. Safe ID Refactoring (`ubml rename`)

Rename an element ID across all files in the workspace:

```bash
ubml rename AC00001 AC10001   # Updates all references everywhere
```

**Requirements**: Workspace scanning, reference field awareness, atomic multi-file update, dry-run mode.

---

## E. Workspace Diagnostics (`ubml doctor`)

Combined health check beyond validation:

- Schema version consistency across files
- Orphaned elements (defined but never referenced)
- Missing recommended files (glossary for complex workspaces, strategy)
- ID pattern consistency (gaps, mixed patterns)
- Coverage stats (% elements with derivedFrom, % steps with RACI)

---

## F. Style Suggestions (`ubml lint`)

Non-blocking suggestions for model quality:

- Naming conventions (capabilities should start with verb)
- Missing descriptions on key elements
- Unused custom fields that have native equivalents
- ID gaps (AC00001, AC00003 — missing AC00002)

---

## G. Insight Review Workflow

```bash
ubml insights review    # Interactive status management
```

Walk through insights by status (proposed → validated/disputed/retired). Useful after batch meeting captures.

---

## H. Insight Deduplication Warning

During `ubml validate` or `ubml add insight`, warn when new insight text is 85%+ similar to existing:

```
⚠ IN00007 text is 92% similar to IN00003 — possible duplicate?
  IN00003: "Preparation phase takes 450 days on average"
  IN00007: "The preparation phase averages 450 days"
```

---

## Implementation Order

Implement in priority order (each sub-item is roughly one PR):

1. **A** — Quick capture (highest daily-use value)
2. **B** — Search/list/trace (discoverability)
3. **D** — Rename (safety-critical refactoring)
4. **E** — Doctor (workspace health)
5. **C** — Reports (nice to have)
6. **F** — Lint (nice to have)
7. **G, H** — Insight workflows (specialized)

---

## Implementation Checklist

- [ ] Implement `ubml add insight` with CLI flags
- [ ] Implement `ubml add source` with CLI flags
- [ ] Implement `ubml find` fuzzy search
- [ ] Implement `ubml list <type>` quick reference
- [ ] Implement `ubml trace <id>` derivedFrom chain
- [ ] Implement `ubml rename <old> <new>` with dry-run
- [ ] Implement `ubml doctor` diagnostics
- [ ] Implement `ubml report coverage` and `ubml report orphans`
- [ ] Implement `ubml lint` style suggestions
- [ ] Implement `ubml insights review` interactive workflow
- [ ] Add deduplication warning to validate/add
