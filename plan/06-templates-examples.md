# 06 — Templates & Examples

> **Status**: Proposed
> **Depends on**: 01, 02 (schema changes affect template content)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md) §Template Quality Issues

---

## Goal

Fix template quality so `ubml add <type>` produces useful starting points. Users in blind testing fell back to `custom:` fields because templates didn't demonstrate native schema features.

---

## A. Fix Links Template

**Current**: Essentially empty (`01000:` placeholder, no structure).

**Fix**: Add complete example:
```yaml
links:
  LK00001:
    name: "Submit to Review"
    from: ST00001
    to: ST00002
    kind: sequence
```

---

## B. Fix Glossary Template

**Current**: Categories use numeric IDs (`01000:`) inconsistent with other element types.

**Fix**: Decide on preferred key pattern and make consistent. Document the decision in template comments.

---

## C. Fix Hypotheses Template

**Current**: Structure present but no SCQH example.

**Fix**: Add commented example showing Situation → Complication → Question → Hypothesis pattern with nodes and operators.

---

## D. Template Quality Audit

Every template must include:
1. One complete, uncommented example showing all major properties
2. Inline comments explaining when to use each property
3. Realistic scenario content (not "TODO: add description")
4. Reference to `ubml help <type>` or `ubml schema <type>` for full property list

Audit all templates against this standard. Fix any that fall short.

---

## E. Add `ubml examples <type>` Command

New command that prints realistic example YAML for learning (distinct from templates for creating files).

Priority examples:

| Type | Focus |
|------|-------|
| `process` | Full L3 process with steps, phases, links, blocks |
| `hypothesisTree` | SCQH format with nested nodes |
| `blocks` | Parallel, alternative, optional, sequence patterns |
| `links` | Cross-step and cross-process connections |
| `insights` | Full example with sources, attribution, about |
| `raci` | RACI matrix on steps |

---

## Checklist

- [ ] Fix links template
- [ ] Fix glossary template (resolve key pattern)
- [ ] Fix hypotheses template (add SCQH example)
- [ ] Audit all other templates against quality standard
- [ ] Implement `ubml examples <type>` command
- [ ] Add example content for priority types
- [ ] Tests for new command
