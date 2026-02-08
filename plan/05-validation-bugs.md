# 05 — Validation Bugs & Critical UX Fixes

> **Status**: Proposed
> **Depends on**: Nothing (existing bugs, can start anytime)
> **Effort**: Small (one focused session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md) §Bug 1, §Bug 4, §Priority 1

---

## Goal

Fix the three highest-impact bugs from blind testing. These undermine user trust in validation and should be fixed as early as possible — they don't depend on schema changes.

---

## A. Exit Code 0 With Errors (Critical)

**Bug**: `ubml validate .` returns exit code 0 and reports "79 warnings" when files with 53 schema errors exist but don't match `*.{type}.ubml.yaml` naming pattern.

**Root cause**: Workspace scan silently skips files not matching the naming pattern. Skipped files with errors are invisible.

**Fix (two parts)**:

1. **Warn about skipped YAML files**: If the workspace contains `*.ubml.yaml` or `*.yaml` files that don't match the expected pattern, emit:
   ```
   Warning: Skipped 2 YAML files not matching *.{type}.ubml.yaml pattern:
     process-broken.ubml.yaml → Did you mean *.process.ubml.yaml?
     my-actors.yaml → UBML files must end in .ubml.yaml
   ```

2. **Exit code correctness**: Ensure exit code is non-zero when validation errors exist, regardless of how they're classified.

---

## B. Single-File Validation Warning

**Bug**: `ubml validate single-file.yaml` silently skips cross-reference checks, giving false confidence.

**Fix**: When validating a single file, emit:
```
Note: Single-file mode checks schema only. Cross-references
(actors, processes, entities) require workspace validation:
  ubml validate .
```

---

## C. Schema Properties Output Empty

**Bug**: `ubml schema hypotheses --properties` returns empty. Users can't discover available fields.

**Fix**: Debug property extraction logic. Ensure all document types return their full property list from schema introspection.

---

## D. Date Format Not Enforced at Runtime

**Bug**: `format: date` in schema is not enforced by Ajv at runtime. Invalid dates pass validation.

**Fix**: Ensure Ajv is configured with `validateFormats: true`. Verify all format keywords (`date`, `uri`, etc.) are validated.

---

## Checklist

- [ ] Fix workspace scan to warn about skipped YAML files with naming suggestions
- [ ] Fix exit code to reflect actual error state
- [ ] Add single-file validation warning about cross-references
- [ ] Fix `ubml schema --properties` for all document types
- [ ] Ensure Ajv `validateFormats: true` — date and other format keywords enforced
- [ ] Tests for each fix
- [ ] Verify with evaluation scenario: misnamed file must produce visible warning
