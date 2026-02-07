# 12 — Element Catalog

> **Status**: Proposed
> **Depends on**: 10 (docs structure), 11 (quickstart provides the learning path)
> **Effort**: Medium (one session)

---

## Goal

Write the element reference: what every UBML type means, when to use it, key properties, and a minimal example.

---

## Structure per Element

- **What**: One-sentence definition
- **When to use**: 2–3 bullet points with real scenarios
- **Key properties**: Required + most common (not exhaustive — link to `ubml schema <type>`)
- **Example**: 5–10 line YAML snippet
- **Related**: Links to related elements
- **CLI**: `ubml add <type>`, `ubml schema <type>`

---

## Elements to Cover

### Process Layer
- Process, Step, Phase, Link, Block

### Organization Layer
- Actor, Skill

### Strategy Layer
- Value Stream, Capability

### Measurement Layer
- Metric (KPI), Hypothesis, Scenario

### Knowledge Layer
- Source, Insight

### Data Layer
- Entity, Location

### Supporting
- Glossary
- Custom fields (when to use vs native properties)

---

## Source Material

- `schemas/1.4/types/` — canonical property definitions
- `example/` workspace — realistic usage
- `ubml enums` output — valid enum values
- Evaluation findings — what users got wrong (inform "When to use" sections)

---

## Checklist

- [ ] Write element catalog in `docs/guide/ELEMENTS.md`
- [ ] Cover all element types listed above
- [ ] Verify examples validate against current schema
- [ ] Cross-link with CLI reference and concepts guide
- [ ] Link from `docs/index.md`
