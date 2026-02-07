# 08 — Quick Capture & Search

> **Status**: Proposed
> **Depends on**: 01, 02 (schema stable), 05 (help topics exist)
> **Effort**: Medium (one session)
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Reduce friction for the most common daily workflows: capturing knowledge during meetings and finding things in the workspace. These were the most-requested features during blind testing.

---

## A. Quick Capture CLI Flags

Reduce friction for knowledge layer operations:

```bash
ubml add insight "CEO mentioned 180K target" --source SO00001 --kind decision
ubml add source --name "Strategy Meeting" --type meeting --date 2026-01-15
```

Currently requires manual YAML editing. CLI shortcuts make capture possible during/after meetings.

**Scope**: Extend existing `ubml add` subcommands with inline flags for the most common properties. Not all properties — just the high-frequency ones that make "capture now, refine later" practical.

---

## B. Workspace Search

```bash
ubml find "Jan Til"     # Fuzzy search across all elements by name/text
ubml list actors        # Quick reference table of all actors with IDs
ubml list processes     # All processes with IDs and names
```

**Scope**: `find` does fuzzy text search across all element names, descriptions, and text fields. `list <type>` prints a formatted table of all elements of that type.

---

## C. Knowledge Trace

```bash
ubml trace IN00005      # Show derivedFrom chain back to sources
ubml trace AC00001      # Show where this actor appears across all documents
```

Answers "where did this come from?" by walking the knowledge chain, and "where is this used?" by scanning all references.

---

## Checklist

- [ ] Add inline flags to `ubml add insight` (--source, --kind, --about)
- [ ] Add inline flags to `ubml add source` (--name, --type, --date)
- [ ] Implement `ubml find <query>` fuzzy search
- [ ] Implement `ubml list <type>` formatted table
- [ ] Implement `ubml trace <id>` reference chain
- [ ] Tests for each new command/flag
