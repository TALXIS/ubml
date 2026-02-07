# 03 — CLI Error Messages & Guidance

> **Status**: Proposed
> **Depends on**: 01, 02 (schema should be stable before improving error messages about it)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Improve CLI error messages and guidance so users can self-correct without consulting documentation. Users in blind testing accumulated errors silently and couldn't discover native schema features.

---

## A. Enhanced Error Hints

Extend the existing `misplacementHints` functionality in the validator/CLI with:

### A1: Duration Format Hints

When validation catches an invalid duration value:
```
Invalid duration '90 days'. Use UBML format: 90d, 2h, 30min, 1wk, 3mo
```

### A2: Reference Context Hints

When an undefined reference is found:
```
Unknown actor 'AC99999'. Defined actors: AC00001 (Radek), AC00002 (Jana)...
```

The "did you mean?" feature already exists and works well — extend it with the list of available IDs.

### A3: RACI Guidance

When users put `participants`, `actors`, or `owner` on a Step:
```
Steps don't have 'actors'. Assign responsibility using RACI:
  RACI:
    responsible: [AC00001]
    accountable: [AC00002]
Run 'ubml help raci' for details.
```

### A4: Schema Discovery Prompt

Append to validation errors:
```
Run 'ubml schema <type>' for valid properties.
```

---

## B. Missing Help Topics

`ubml help <topic>` is missing coverage for key concepts. Add:

| Topic | Content |
|-------|---------|
| `blocks` | What blocks are, operator types (parallel, alternative, optional), examples |
| `phases` | Phase structure, `includeSteps`, relationship to process |
| `links` | Link kinds, `from`/`to` structure, cross-process links |
| `raci` | RACI methodology, how it maps to steps, why not `owner` |
| `custom` | When and how to use `custom:` fields, when to use native properties instead |

---

## C. Duration Normalization (stretch goal)

If time permits, implement natural language → UBML duration normalization:
- `90 days` → `90d`
- `2 hours` → `2h`  
- `3 months` → `3mo`

Could be part of a future `ubml fix` command or auto-correction during `ubml add`. Schema stays strict for interchange; CLI is lenient on input.

---

## D. Semantic Hints Architecture (design aspiration)

Currently, hints like "goals belong in strategy, not process" are hardcoded in `validation-errors.ts`. These encode semantic relationships between document types (process vs. strategy vs. hypotheses) that should ideally come from schema metadata (e.g., `x-ubml` annotations). This would make semantic guidance maintainable alongside schema evolution and allow schema authors to define cross-document guidance without modifying TypeScript code.

Not blocking implementation of hardcoded hints (A1–A4), but keep this in mind as the long-term architecture.

---

## Implementation Checklist

- [ ] Extend error hint system with duration format hints
- [ ] Add reference context to "undefined reference" errors
- [ ] Add RACI guidance for misplaced ownership/participant properties
- [ ] Add schema discovery prompt to validation error output
- [ ] Implement `ubml help blocks`
- [ ] Implement `ubml help phases`
- [ ] Implement `ubml help links`
- [ ] Implement `ubml help raci`
- [ ] Implement `ubml help custom`
- [ ] Tests for new hint messages
