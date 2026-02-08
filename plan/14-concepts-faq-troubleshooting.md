# 14 — Concepts, FAQ & Troubleshooting

> **Status**: Proposed
> **Depends on**: 11 (docs structure), 13 (element catalog provides specifics; concepts provide the big picture)
> **Effort**: Large (one to two sessions)

---

## Goal

Write three documents that support independent learning after the quickstart: how UBML pieces fit together, common questions, and error-driven fixes.

---

## A. Concepts Guide (`docs/guide/CONCEPTS.md`)

User-facing adaptation of `docs/design/WORKSPACE-SEMANTICS.md`. Same conceptual layers and relationships, rewritten with examples and plain language for analysts — not schema-level precision for maintainers. WORKSPACE-SEMANTICS.md remains the authoritative design reference; CONCEPTS.md teaches.

**Topics**:
1. **Workspaces** — What they are, file structure, why split files
2. **Documents vs Elements** — File-level vs item-level
3. **IDs and References** — ID patterns, cross-referencing, validation
4. **Validation Levels** — Syntax → Schema → References → Semantics (progressive)
5. **Knowledge Layer** — Source → Insight → Model traceability chain
6. **Process Levels** (L1–L4) — Value stream → subprocess hierarchy
7. **RACI Matrix** — How responsibility works on steps, why not `owner` on steps
8. **Blocks vs Phases** — Control flow vs organizational grouping
9. **Process vs Workflow** — Where UBML ends and automation begins (from Plan 00 D4)
10. **Export & Projections** — UBML as working format, export to standards

---

## B. FAQ (`docs/guide/FAQ.md`)

Extract from testing observations and anticipated questions:

- When to use UBML vs BPMN?
- Why are my files not validating? (file naming pattern)
- How do I model parallel activities? (blocks)
- Can I use UBML without CLI? (yes, direct YAML editing)
- What's the difference between actor types?
- How do I handle subprocess calls?
- What if UBML doesn't have the element I need? (custom fields)
- Why can't I put `kpis` on a Step? (one-way references, Plan 00 D2)
- Is UBML production-ready?

---

## C. Troubleshooting (`docs/guide/TROUBLESHOOTING.md`)

Error-driven guide — user sees an error, finds the fix:

- "Unknown property X at line Y" → spelling, document type, `ubml schema`
- "Reference to undefined ID" → check ID exists, file naming, workspace mode
- "Invalid duration format" → UBML duration syntax reference
- "Files not found by validator" → file naming pattern requirements
- "Command not found: ubml" → installation options
- VS Code schema not working → check file extension (.ubml.yaml), reload window, verify Red Hat YAML extension installed

---

## Checklist

- [ ] Write `docs/guide/CONCEPTS.md`
- [ ] Write `docs/guide/FAQ.md`
- [ ] Write `docs/guide/TROUBLESHOOTING.md`
- [ ] Cross-link all three with each other, element catalog, and CLI reference
- [ ] Link from `docs/index.md`
