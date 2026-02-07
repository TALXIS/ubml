# CLI & UX Improvements

> **Source**: Extracted from blind testing sessions (CETIN FTTH, power transformer eval) and usability analysis conducted late 2025 / early 2026.
> **Date**: 2026-02-07
> **Status**: Proposed
> 
> **Context**: See `plan/EVALUATION-FINDINGS.md` for detailed bug reports, test results, and analysis.

---

## Context

Two rounds of blind testing revealed that UBML's schema and validation are solid, but CLI guidance, error messages, and discoverability lag behind. Users model successfully but accumulate errors silently, fall back to `custom:` when native structure isn't discoverable, and miss advanced features because help topics don't exist.

The knowledge layer schema fixes are tracked separately in `plan/KNOWLEDGE-LAYER-FIXES.md`.

For full evaluation context including bug reproduction steps, priority analysis, and modeling decisions, see `plan/EVALUATION-FINDINGS.md`.

---

## Priority 1: Error Messages & Guidance

### 1.1 Enhanced Error Hints

Extend existing `misplacementHints` functionality:

- Add format hints for duration: `"Invalid duration '90 days'. Use: 90d, 2h, 30min, 1wk, 3mo"`
- Add reference hints: `"Unknown actor 'AC99999'. Defined actors: AC00001 (Radek), AC00002 (Jana)..."`
- On validation errors, append: `"Run 'ubml schema <type>' for valid properties."`
- Add `participants` / `actors` on Step → guide to RACI

### 1.2 Add `ubml help custom` Topic

Explain when and how to use `custom:` fields.

---

## Priority 2: Templates & Examples

### 2.1 Improve Template Quality

**Templates that need work:**
- **links** — Template is essentially empty (just `01000:` placeholder, no `from`/`to` structure). Add example showing `from`, `to`, `name`, `kind`.
- **glossary** — Categories still use numeric IDs (`01000:`) inconsistent with terms (TM###). Document preferred pattern or make consistent.

### 2.2 Add Examples Command

`ubml examples <type>` command doesn't exist. Need to implement:
- Realistic examples for all element types
- `hypothesisTree` — SCQH format with nodes
- `blocks` — parallel/alternative/optional patterns
- `links` — cross-step and cross-process connections
- `insights` — full example with source, attribution, about

---

## Priority 3: Schema Property Discovery

### 3.1 Fix Empty Properties Output

`ubml schema hypotheses --properties` returns empty. Ensure all document types return their full property list.

### 3.2 Property Search Command

```bash
ubml schema --find "owner"
# → Process.owner (not available)
# → Phase.owner: ActorRef
```

Helps users discover where properties live across types without browsing every schema.

### 3.3 Categorized Property Display

Show properties in categories (required, common, advanced) instead of flat list:
```
REQUIRED: name, steps
COMMON:   description, level, phases, links
ADVANCED: blocks, custom, tags
```

---

## Priority 4: Validation UX

### 4.1 Validate with Suggestions Mode

`ubml validate --suggest` could provide proactive advice:
- Process has no owner defined
- KPI not linked to any step
- Actor defined but never referenced

---

## Priority 5: CLI Convenience Commands

### 5.1 Quick Capture Commands (Knowledge Layer)

```bash
ubml add insight "CEO mentioned 180K target" --source SO00001 --kind decision
ubml add source --name "Strategy Meeting" --type meeting --date 2026-01-15
```

Currently requires manual YAML editing for knowledge capture.

### 5.2 Search & Discovery

```bash
ubml find "Jan Til"     # Fuzzy search across all elements
ubml list actors        # Quick reference table of all actors
ubml trace AC00001      # Show derivedFrom chain back to sources
```

### 5.3 Model Health

```bash
ubml report coverage    # % of elements with derivedFrom links
ubml report orphans     # Unused insights, unreferenced actors
```

---

## Not Doing (Principle Violations)

These were proposed in testing but correctly rejected:

- **Step.participants shorthand** — Violates P9.1, P9.2, DD-004. RACI is the one way to express responsibility. CLI should guide to RACI, not provide shortcuts.
- **Entity.properties alias** — Violates P9.1. Use `attributes` (typed) or `custom:` (freeform).
- **Process.goal property** — Rejected per semantic separation. Goals belong in strategy/hypotheses/metrics. CLI provides hint when users try this.
- **Duration schema relaxation** — Schema stays strict (`90d`). CLI handles normalization from `90 days` → `90d`.

---

*Prioritize P1-P2 for next development cycle. P3-P5 as time permits.*
