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

### 1.3 Duration Natural Language Normalization

Users write `duration: 90 days` but schema requires `90d`. CLI should accept natural language and normalize:
- `90 days` → `90d`
- `2 hours` → `2h`
- `3 months` → `3mo`

Implement as part of a `ubml fix` command or as auto-correction during `ubml add`. Schema stays strict for interchange.

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

### 5.4 Insight Review Workflow

```bash
ubml insights review    # Interactive status management for insights
```

Walk through insights by status (proposed → validated/disputed/retired). Useful after a batch of meeting captures to triage and confirm findings.

### 5.5 Insight Deduplication Warning

During `ubml validate` or `ubml add insight`, warn when a new insight's `text` is 85%+ similar to an existing insight. Prevents duplicate capture across meetings.

```
⚠ IN00007 text is 92% similar to IN00003 — possible duplicate?
  IN00003: "Preparation phase takes 450 days on average"
  IN00007: "The preparation phase averages 450 days"
```

---

## Priority 6: Larger Features (Future)

These are significant features requested during evaluation. Not prioritized for immediate work but worth tracking.

### 6.1 Visual Export / Projections

Users consistently requested diagram generation. Design docs exist in `docs/projections/` (Mermaid, BPMN, PlantUML, ArchiMate, etc.) but no implementation.

Minimal viable version:
```bash
ubml export --format=mermaid process.ubml.yaml   # Process flow diagram
ubml export --format=mermaid actors.ubml.yaml     # Org chart
```

Mermaid is the lowest-effort target (text-based, widely supported). BPMN export has higher fidelity requirements — see `docs/projections/BPMN.md`.

### 6.2 `ubml rename` — Safe ID Refactoring

Rename an element ID across all files in the workspace:
```bash
ubml rename AC00001 AC10001   # Updates all references
```

Needs: workspace scanning, reference field awareness, atomic multi-file update.

### 6.3 `ubml doctor` — Workspace Health Check

Combined diagnostics beyond validation:
- Schema version consistency
- Orphaned elements (defined but unreferenced)
- Missing recommended files (glossary, strategy)
- ID pattern consistency
- Coverage stats (% elements with derivedFrom, % steps with RACI)

### 6.4 `ubml lint` — Style Suggestions

Non-blocking suggestions for model quality:
- Naming conventions (capabilities should start with verb)
- Missing descriptions on key elements
- Unused custom fields that have native equivalents
- ID gaps (AC00001, AC00003 — missing AC00002)

### 6.5 AI-Assisted Extraction

Automated extraction from source documents (meeting transcripts, interviews):
```bash
ubml analyze meetings/*.md --suggest
```

Scan documents for actors, systems, metrics, processes. Preview candidates, confirm before adding. Depends on LLM provider abstraction. Deferred until manual workflow is proven — tracked in `docs/OPEN-TOPICS.md`.

---

## Not Doing (Principle Violations)

These were proposed in testing but correctly rejected:

- **Step.participants shorthand** — Violates P9.1, P9.2, DD-004. RACI is the one way to express responsibility. CLI should guide to RACI, not provide shortcuts.
- **Entity.properties alias** — Violates P9.1. Use `attributes` (typed) or `custom:` (freeform).
- **Process.goal property** — Rejected per semantic separation. Goals belong in strategy/hypotheses/metrics. CLI provides hint when users try this.
- **Duration schema relaxation** — Schema stays strict (`90d`). CLI handles normalization (see 1.3).

---

*Prioritize P1-P2 for next development cycle. P3-P5 as time permits. P6 is future work.*
