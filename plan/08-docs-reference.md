# 08 — Docs: Reference Content

> **Status**: Proposed
> **Depends on**: 06 (docs structure), 07 (guides provide the learning path; reference supports it)
> **Effort**: Large (may span two sessions)

---

## Goal

Write the reference documentation that supports independent learning: element catalog, concepts guide, FAQ, and troubleshooting. These let users answer their own questions after completing the tutorial.

---

## A. Element Catalog (`docs/guide/ELEMENTS.md`)

Reference for all UBML element types — what they mean, when to use them, key properties, and a minimal example.

**Structure per element**:
- **What**: One-sentence definition
- **When to use**: 2–3 bullet points with real scenarios
- **Key properties**: Required + most common (not exhaustive — link to `ubml schema <type>`)
- **Example**: 5–10 line YAML snippet
- **Related**: Links to related elements
- **CLI**: `ubml add <type>`, `ubml schema <type>`

**Elements to cover**:
- Process, Step, Phase, Link, Block
- Actor, Skill
- Value Stream, Capability
- Metric (KPI), Hypothesis, Scenario
- Source, Insight
- Entity, Location
- Glossary
- Custom fields (when to use vs native properties)

**Source**: Derive from `schemas/1.4/types/`, CLI `ubml enums` output, example workspace.

---

## B. Concepts Guide (`docs/guide/CONCEPTS.md`)

Explain how UBML pieces fit together. Not a reference — a conceptual overview.

**Topics**:
1. **Workspaces** — What they are, file structure, why split files
2. **Documents vs Elements** — File-level vs item-level
3. **IDs and References** — ID patterns, cross-referencing, validation
4. **Validation Levels** — Syntax → Schema → References → Semantics (progressive)
5. **Knowledge Layer** — Source → Insight → Model traceability chain
6. **Process Levels** (L1–L4) — Value stream → subprocess hierarchy
7. **RACI Matrix** — How responsibility works on steps
8. **Blocks vs Phases** — Control flow vs organizational grouping
9. **Export & Projections** — UBML as working format, export to standards

---

## C. FAQ (`docs/guide/FAQ.md`)

Extract from common mistakes observed in testing and anticipated questions.

**Topics**:
- When to use UBML vs BPMN?
- Why are my files not validating? (file naming pattern)
- How do I model parallel activities? (blocks)
- Can I use UBML without CLI? (yes, direct YAML editing)
- What's the difference between actor types (person, team, system)?
- How do I handle subprocess calls?
- What if UBML doesn't have the element I need? (custom fields)
- Is UBML production-ready?

---

## D. Troubleshooting Guide (`docs/guide/TROUBLESHOOTING.md`)

Error-driven guide — user sees an error, finds the fix.

**Sections**:
- "Unknown property X at line Y" → check spelling, document type, use `ubml schema`
- "Reference to undefined ID" → check ID exists, spelling, file naming
- "Invalid duration format" → UBML duration syntax reference
- "Files not found by validator" → file naming pattern requirements
- "Command not found: ubml" → installation options
- VS Code schema validation not working → extension, file extension, reload

---

## Implementation Checklist

- [ ] Write `docs/guide/ELEMENTS.md` element catalog
- [ ] Write `docs/guide/CONCEPTS.md` concepts guide
- [ ] Write `docs/guide/FAQ.md`
- [ ] Write `docs/guide/TROUBLESHOOTING.md`
- [ ] Cross-link all four documents with each other and with guides (07)
- [ ] Link from `docs/index.md`
- [ ] Review for accuracy against current schema and CLI behavior
