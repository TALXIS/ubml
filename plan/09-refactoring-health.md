# 09 — Refactoring & Health Tools

> **Status**: Proposed
> **Depends on**: 03 (semantic validation), 04 (validation bugs fixed)
> **Effort**: Large (split into sub-items, implement incrementally)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Add tools for safe refactoring, workspace health diagnostics, and style guidance. These build on top of stable validation (Plans 03–04).

---

## A. Safe ID Rename (`ubml rename`)

Rename an element ID across all files in the workspace:

```bash
ubml rename AC00001 AC10001
# Scanning workspace...
# Found 47 references to AC00001 across 8 files
# Preview:
#   actors.ubml.yaml: AC00001 → AC10001 (definition)
#   process.ubml.yaml: 12 references updated
#   ...
# Apply? [y/N]
```

**Requirements**:
- Workspace scanning + reference field awareness
- Dry-run by default, `--apply` or confirmation to write
- Atomic multi-file update (all or nothing)
- Validate workspace after rename

---

## B. Workspace Diagnostics (`ubml doctor`)

Combined health check beyond validation:

- Schema version consistency across files
- Orphaned elements (defined but never referenced)
- Missing recommended files (glossary for complex workspaces)
- ID pattern consistency (gaps, mixed patterns)
- Coverage stats (% elements with derivedFrom, % steps with RACI)

---

## C. Style Suggestions (`ubml lint`)

Non-blocking suggestions for model quality:

- Naming conventions (capabilities should start with verb)
- Missing descriptions on key elements
- Unused custom fields that have native equivalents
- ID gaps (AC00001, AC00003 — missing AC00002)

---

## D. Model Health Reports (`ubml report`)

Focused metric commands as lighter alternatives to `ubml doctor`:

```bash
ubml report coverage    # % of elements with derivedFrom links
ubml report orphans     # Unused insights, unreferenced actors
```

---

## E. Migration Command (`ubml migrate`)

When schema versions change, assist with migration:

```bash
ubml migrate --from 1.4 --to 1.5
# Renaming source → sources on insights... 3 files updated
# Removing notes from insights... 1 occurrence merged into context
```

**Scope**: Handles mechanical transformations for known breaking changes. Complex changes require manual review — the command flags them.

---

## Checklist

- [ ] Implement `ubml rename <old> <new>` with dry-run + confirmation
- [ ] Implement `ubml doctor` diagnostics
- [ ] Implement `ubml report coverage` and `ubml report orphans`
- [ ] Implement `ubml lint` style suggestions
- [ ] Implement `ubml migrate` for schema version transitions
- [ ] Tests for each command
