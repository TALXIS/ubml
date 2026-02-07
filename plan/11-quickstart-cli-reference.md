# 11 — Quickstart Tutorial & CLI Reference

> **Status**: Proposed
> **Depends on**: 10 (docs structure must exist)
> **Effort**: Medium (one session)

---

## Goal

Write the two most critical user-facing documents: a quickstart tutorial and a complete CLI reference.

---

## A. Quickstart Tutorial (`docs/guide/QUICKSTART.md`)

10–15 minute walkthrough building a real process.

**Outline**:

1. **Prerequisites** (30s) — Node.js 18+, basic YAML knowledge
2. **Create Workspace** (2 min) — `ubml init`, explain generated files
3. **Model the Process** (5 min) — Add steps via CLI and file editing, show both
4. **Add Actors** (3 min) — Who does the work, actor types
5. **Connect and Validate** (2 min) — Assign RACI, run validation, fix one error
6. **Next Steps** — Links to concepts, examples, CLI reference

**Rules**:
- Realistic scenario (invoice approval, not foo/bar)
- Show validation errors and how to fix them
- Show both CLI and direct YAML editing
- End with a valid, complete mini-workspace
- Test end-to-end (follow own instructions, verify it works)

---

## B. CLI Command Reference (`docs/guide/CLI-REFERENCE.md`)

Searchable reference for every CLI command.

**Per command**:
- Usage syntax
- Arguments and options
- Examples
- Brief description
- Related commands

**Commands**:

| Command | Description |
|---------|-------------|
| `ubml init` | Create new workspace |
| `ubml add` | Add elements (all subcommands) |
| `ubml validate` | Validate files or workspace |
| `ubml show` | Display workspace views (tree, actors) |
| `ubml schema` | Explore schema and properties |
| `ubml help` | Topic-based help |
| `ubml nextid` | Generate next ID |
| `ubml syncids` | Synchronize IDs |
| `ubml enums` | List enum values |
| `ubml examples` | Show examples (Plan 06) |

**Source**: Extract from Commander.js definitions in `src/cli/commands/`, expand with examples.

---

## Checklist

- [ ] Write `docs/guide/QUICKSTART.md` tutorial
- [ ] Test tutorial end-to-end
- [ ] Write `docs/guide/CLI-REFERENCE.md`
- [ ] Verify all commands covered and examples accurate
- [ ] Link from `docs/index.md` and root `README.md`
