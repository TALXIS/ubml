# 06 — Docs Structure & Landing Page

> **Status**: Proposed
> **Depends on**: 03–05 (document stable CLI behavior, not in-flux features)
> **Effort**: Small (one session)

---

## Goal

Reorganize `docs/` so users and maintainers find the right content immediately. Current `docs/README.md` says "Audience: Maintainers" — new users bounce.

---

## A. Create `docs/guide/` Folder

User-facing documentation goes here. Maintainer docs stay separate.

**New structure**:
```
docs/
├── index.md                    # Landing page (NEW)
├── VISION.md                   # Stays here (for everyone)
├── guide/                      # USER-FACING (NEW)
│   ├── QUICKSTART.md           # → Plan 07
│   ├── CLI-REFERENCE.md        # → Plan 07
│   ├── ELEMENTS.md             # → Plan 08
│   ├── CONCEPTS.md             # → Plan 08
│   ├── FAQ.md                  # → Plan 08
│   └── TROUBLESHOOTING.md      # → Plan 08
├── projections/                # Keep as-is
├── design/                     # MAINTAINER-FACING (MOVED)
│   ├── README.md               # "Audience: Contributors"
│   ├── PRINCIPLES.md
│   ├── DESIGN-DECISIONS.md
│   └── WORKSPACE-SEMANTICS.md
```

**Note**: Moving `PRINCIPLES.md` etc. to `design/` will break some internal links. Update all references. `OPEN-TOPICS.md` has been removed — its content now lives in `plan/00-design-decisions.md`.

---

## B. Create `docs/index.md` Landing Page

First page users see on `ubml.talxis.com`. Must orient within 10 seconds.

```markdown
# UBML Documentation

- **[What is UBML?](VISION.md)** — Problem, solution, who it's for
- **[Get Started](guide/QUICKSTART.md)** — First model in 10 minutes
- **[CLI Reference](guide/CLI-REFERENCE.md)** — All commands
- **[Element Catalog](guide/ELEMENTS.md)** — What you can model
- **[Concepts](guide/CONCEPTS.md)** — How UBML works
- **[FAQ](guide/FAQ.md)** — Common questions

For contributors:
- **[Design Principles](design/PRINCIPLES.md)** — Language design rules
- **[Design Decisions](design/DESIGN-DECISIONS.md)** — Rationale for choices
- **[Contributing](../CONTRIBUTING.md)** — Build and extend UBML

Export & Integration:
- **[BPMN/ArchiMate Export](projections/README.md)** — Mapping to standards
```

---

## C. Add `example/README.md`

Explain what the example workspace contains, how to use it, and what concepts it demonstrates.

Key sections:
- File table with purpose and learning focus per file
- "How to Use" (explore in place / copy and modify / read in order)
- Key concepts demonstrated (process levels, RACI, cross-references, knowledge tracing)
- Links to deeper docs

---

## D. Update Root README Links

- Add CHANGELOG to "Learn More" table
- Add projections/export section
- Update any links broken by the `docs/` reorganization

---

## Implementation Checklist

- [ ] Create `docs/guide/` directory (placeholder files for future plans)
- [ ] Move `PRINCIPLES.md`, `DESIGN-DECISIONS.md`, `WORKSPACE-SEMANTICS.md` to `docs/design/`
- [ ] Create `docs/design/README.md` with "Audience: Contributors" header
- [ ] Create `docs/index.md` landing page
- [ ] Update `docs/README.md` or replace with redirect to index
- [ ] Create `example/README.md`
- [ ] Update root `README.md` links (CHANGELOG, projections, broken paths)
- [ ] Update `.github/copilot-instructions.md` paths if needed
- [ ] Find and fix all broken internal doc links
