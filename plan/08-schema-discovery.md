# 08 — Schema Discovery & Introspection

> **Status**: Proposed
> **Depends on**: 01, 03 (schema should be finalized before improving discovery tools)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md) §Bug 4

---

## Goal

Improve how users discover available properties and explore the schema from the CLI. Complement error messages (Plan 06) with proactive exploration tools.

---

## A. Property Search

Let users search for a property across all types:

```bash
ubml schema --find "owner"
# → Process.owner: ActorRef
# → Phase.owner: ActorRef
# → KPI.owner: ActorRef
# → Step: no 'owner' — use RACI (see 'ubml help raci')
```

Helps users discover where properties live without browsing every schema.

---

## B. Categorized Property Display

Show properties grouped by usage instead of flat list:

```
REQUIRED: name, steps
COMMON:   description, level, phases, links, owner
ADVANCED: blocks, custom, tags
```

Use `required` from schema for the first group. Common vs advanced derived from schema metadata or hardcoded initially.

---

## C. Validation Suggestions Mode

`ubml validate --suggest` provides proactive advice beyond errors:

- Process has no RACI assignment on any step
- KPI defined but not linked to any step or process
- Actor defined but never referenced in any process
- Insight has no `about` references

These are **suggestions**, not errors — the model is valid but potentially incomplete.

---

## Checklist

- [ ] Implement `ubml schema --find <property>` search
- [ ] Implement categorized property display (required/common/advanced)
- [ ] Implement `ubml validate --suggest` mode
- [ ] Tests for each feature
