# 07 — Docs: Guides (Tutorial + CLI Reference)

> **Status**: Proposed
> **Depends on**: 06 (docs structure must exist first)
> **Effort**: Medium (one session)

---

## Goal

Write the two most critical user-facing documents: a quickstart tutorial that gets someone modeling in 10 minutes, and a complete CLI reference.

---

## A. Quickstart Tutorial (`docs/guide/QUICKSTART.md`)

10–15 minute guided walkthrough building a real process.

**Outline**:

1. **Prerequisites** (30s) — Node.js 18+, basic YAML knowledge
2. **Create Workspace** (2 min) — `ubml init`, explain generated files
3. **Model the Process** (5 min) — Add steps via CLI and file editing, show both approaches
4. **Add Actors** (3 min) — Who does the work, actor types
5. **Connect and Validate** (2 min) — Assign RACI, run validation, fix one intentional error
6. **Next Steps** — Links to concepts, examples, CLI reference

**Principles**:
- Use realistic business scenario (invoice approval, not foo/bar)
- Show validation errors and how to fix them
- Show both CLI and direct YAML editing
- End with a valid, complete mini-workspace

---

## B. CLI Command Reference (`docs/guide/CLI-REFERENCE.md`)

Searchable reference for every CLI command.

**Structure per command**:
- Usage syntax
- Arguments and options
- Examples
- What it does (brief)
- Links to related commands

**Commands to document**:

| Command | Description |
|---------|-------------|
| `ubml init` | Create new workspace |
| `ubml add` | Add elements (all subcommands) |
| `ubml validate` | Validate files or workspace |
| `ubml show` | Display workspace views (tree, actors, etc.) |
| `ubml schema` | Explore schema and properties |
| `ubml help` | Topic-based help |
| `ubml nextid` | Generate next ID |
| `ubml syncids` | Synchronize IDs |
| `ubml enums` | List enum values |
| `ubml examples` | Show examples (if implemented in plan 04) |

**Source**: Extract from Commander.js definitions in `src/cli/commands/`, expand with examples. Could be partially auto-generated.

---

## Implementation Checklist

- [ ] Write `docs/guide/QUICKSTART.md` tutorial
- [ ] Test tutorial end-to-end (follow your own instructions, verify it works)
- [ ] Write `docs/guide/CLI-REFERENCE.md`
- [ ] Verify all commands are covered and examples are accurate
- [ ] Link from `docs/index.md` landing page
- [ ] Link from root `README.md` getting started section
