# 06 — CLI Error Messages & Guidance

> **Status**: Proposed
> **Depends on**: 01, 03 (schema should be stable before improving messages about it)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Improve CLI error messages so users can self-correct without consulting documentation. Users in blind testing accumulated errors silently and couldn't discover native schema features.

---

## A. Duration Format Hints

When validation catches an invalid duration value:
```
Invalid duration '90 days'. Use UBML format: 90d, 2h, 30min, 1wk, 3mo
```

---

## B. Reference Context Hints

When an undefined reference is found, list available IDs:
```
Unknown actor 'AC99999'. Defined actors: AC00001 (Radek), AC00002 (Jana)...
```

The "did you mean?" feature already works — extend it with the full list of available IDs for the expected type.

---

## C. RACI Guidance

When users put `participants`, `actors`, or `owner` on a Step:
```
Steps don't have 'actors'. Assign responsibility using RACI:
  RACI:
    responsible: [AC00001]
    accountable: [AC00002]
Run 'ubml help raci' for details.
```

---

## D. Schema Discovery Prompt

Append to validation errors when unknown properties are found:
```
Run 'ubml schema <type>' for valid properties.
```

---

## E. Missing Help Topics

Add `ubml help <topic>` for key concepts:

| Topic | Content |
|-------|---------|
| `blocks` | What blocks are, operator types (par, alt, opt, loop, seq), examples |
| `phases` | Phase structure, `includeSteps`, relationship to process |
| `links` | Link kinds, `from`/`to` structure, cross-process links |
| `raci` | RACI methodology, why UBML uses it instead of `owner` on steps |
| `custom` | When and how to use `custom:` fields vs native properties |

---

## F. Duration Normalization (stretch goal)

If time permits, implement natural language → UBML duration normalization:
- `90 days` → `90d`
- `2 hours` → `2h`
- `3 months` → `3mo`

Could be part of a future `ubml fix` command or auto-correction during `ubml add`. Schema stays strict for interchange; CLI is lenient on input.

---

## F. Semantic Hints Architecture (design aspiration)

Currently, hints like "goals belong in strategy, not process" are hardcoded in `validation-errors.ts`. These encode semantic relationships between document types (process vs. strategy vs. hypotheses) that should ideally come from schema metadata (e.g., `x-ubml` annotations). This would make semantic guidance maintainable alongside schema evolution and allow schema authors to define cross-document guidance without modifying TypeScript code.

Not blocking implementation of hardcoded hints (A–D), but keep this in mind as the long-term architecture.

---

## G. Knowledge Layer Tooling Coverage

Verify that ESLint rules, CLI help text, and validation hints correctly reference `observations`, `SourceRef`, `InsightRef`, and other knowledge layer names introduced in DD-008. May have gaps introduced during implementation.

---

## Checklist

- [ ] Add duration format hints to validation error output
- [ ] Add available ID list to "undefined reference" errors
- [ ] Add RACI guidance hints for misplaced ownership properties on steps
- [ ] Add schema discovery prompt to unknown-property errors
- [ ] Implement `ubml help blocks`
- [ ] Implement `ubml help phases`
- [ ] Implement `ubml help links`
- [ ] Implement `ubml help raci`
- [ ] Implement `ubml help custom`
- [ ] Implement `ubml help durations`
- [ ] Audit ESLint rules, CLI help, and validation hints for knowledge layer coverage (DD-008)
- [ ] Tests for new hint messages
