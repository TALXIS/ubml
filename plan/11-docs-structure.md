# 11 — Docs Structure & Landing Page

> **Status**: Proposed
> **Depends on**: 06–08 (document stable CLI behavior, not in-flux features)
> **Effort**: Small (one session)

---

## Goal

Reorganize `docs/` so users and maintainers find the right content immediately. Current `docs/README.md` says "Audience: Maintainers" — new users bounce.

---

## A. Create `docs/guide/` Folder

User-facing documentation goes here. Maintainer docs stay in `docs/design/`.

**New structure**:
```
docs/
├── index.md                    # Landing page (NEW)
├── VISION.md                   # Stays here (for everyone)
├── guide/                      # USER-FACING (NEW)
│   ├── QUICKSTART.md           # → Plan 12
│   ├── CLI-REFERENCE.md        # → Plan 12
│   ├── ELEMENTS.md             # → Plan 13
│   ├── CONCEPTS.md             # → Plan 14
│   ├── FAQ.md                  # → Plan 14
│   └── TROUBLESHOOTING.md      # → Plan 14
├── projections/                # Keep as-is
├── design/                     # MAINTAINER-FACING (MOVED)
│   ├── README.md               # "Audience: Contributors"
│   ├── PRINCIPLES.md
│   ├── DESIGN-DECISIONS.md
│   └── WORKSPACE-SEMANTICS.md
```

---

## B. Create `docs/index.md` Landing Page

First page on `ubml.talxis.com`. Must orient within 10 seconds.

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

Export & Integration:
- **[BPMN/ArchiMate Export](projections/README.md)** — Mapping to standards
```

---

## C. Add `example/README.md`

Explain the example workspace: what it contains, how to use it, what concepts it demonstrates.

---

## D. Update References

- Move `PRINCIPLES.md`, `DESIGN-DECISIONS.md`, `WORKSPACE-SEMANTICS.md` to `docs/design/`
- Update root `README.md` links
- Update `.github/copilot-instructions.md` paths
- Find and fix all broken internal doc links

---

## Checklist

- [ ] Create `docs/guide/` directory with placeholder files
- [ ] Move design docs to `docs/design/`, create `docs/design/README.md`
- [ ] Create `docs/index.md` landing page
- [ ] Create `example/README.md`
- [ ] Update root `README.md` links
- [ ] Update `.github/copilot-instructions.md` paths
- [ ] Find and fix all broken internal doc links
