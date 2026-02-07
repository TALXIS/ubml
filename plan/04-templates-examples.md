# 04 — Templates & Examples

> **Status**: Proposed
> **Depends on**: 01 (knowledge layer schema changes affect insight templates)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md) §Template Quality Issues

---

## Goal

Improve template quality so `ubml add <type>` produces useful starting points, and add an `ubml examples <type>` command for realistic reference examples. Users in blind testing fell back to `custom:` fields because templates didn't demonstrate native schema features.

---

## A. Fix Existing Templates

### A1: Links Template

**Current**: Essentially empty (`01000:` placeholder, no structure shown).

**Fix**: Add complete example showing `from`, `to`, `name`, `kind`:

```yaml
links:
  LK00001:
    name: "Submit to Review"
    from: ST00001
    to: ST00002
    kind: sequence
```

### A2: Glossary Template

**Current**: Categories use numeric IDs (`01000:`) inconsistent with terms (`TM###`).

**Fix**: Decide on preferred pattern and make consistent. Either:
- String keys for categories (domain-appropriate, e.g., `technical:`, `business:`)
- Typed prefixes consistent with other elements

Document the decision in the template comments.

### A3: Hypotheses Template

**Current**: Structure present but no SCQH example or guidance.

**Fix**: Add commented example showing Situation → Complication → Question → Hypothesis pattern with nodes.

---

## B. Template Quality Standard

Every template should include:
1. One complete, uncommented example showing all major properties
2. Inline comments explaining when to use each property
3. Realistic scenario content (not "TODO: add description")
4. Reference to `ubml help <type>` or `ubml schema <type>` for full property list

Audit all templates against this standard and fix any that fall short.

---

## C. Add `ubml examples <type>` Command

New command that prints realistic example YAML for a given element type. Distinct from templates (which are for creating new files) — examples are for learning.

Priority examples to implement:

| Type | Focus |
|------|-------|
| `process` | Full L3 process with steps, phases, links, blocks |
| `hypothesisTree` | SCQH format with nested nodes |
| `blocks` | Parallel, alternative, and optional patterns |
| `links` | Cross-step and cross-process connections |
| `insights` | Full example with sources, attribution, about |
| `raci` | RACI matrix on steps |

---

## Implementation Checklist

- [ ] Fix links template — add complete from/to/kind example
- [ ] Fix glossary template — resolve ID pattern, document in comments
- [ ] Fix hypotheses template — add SCQH example
- [ ] Audit all other templates against quality standard
- [ ] Implement `ubml examples <type>` command
- [ ] Add example content for priority types listed above
- [ ] Tests for new command
