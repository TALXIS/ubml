# 18 — Future Considerations

> **Status**: Proposed (exploratory — no immediate action)
> **Depends on**: Most earlier plans
> **Effort**: Varies

---

## Goal

Track deferred design decisions, larger features, and infrastructure changes that aren't ready for implementation. Items graduate to their own plan file when they become actionable.

---

## Deferred Design Decisions

### ArchiMate Projection Mapping

**Question**: How do actor types and RACI map to ArchiMate Actor vs Role?

**When to decide**: Before implementing ArchiMate export (Plan 16 Phase 3).

### Metrics & Measurement Model

**Question**: Is the metrics model sufficient? How do KPI actuals, process mining observations, and scenario evidence relate?

**When to decide**: When real usage data on KPI tracking accumulates.

### Expression Language

**Question**: Define a grammar for guards, conditions, and formulas? Or keep as free-text?

**When to decide**: Before BPMN export (Plan 16 Phase 2) — BPMN requires parseable expressions.

### Entity Relationships Quality

**Question**: Is the relationship model (cardinality, association types) expressive enough for real data modeling?

**When to decide**: After hands-on testing with real entity modeling scenarios.

### Hypothesis Decomposition Quality

**Question**: Are `and`/`or`/`mece` operators and the `type` enum sufficient for real consulting use?

**When to decide**: After validation against real hypothesis-driven scenarios.

### Workspace Organization Conventions

**Question**: Are file naming conventions and splitting guidance concrete enough?

**When to decide**: After more user testing; partially addressed by Plan 05 A (skipped file warning).

### BPMN Export Fidelity

**Question**: What's acceptable information loss when exporting to BPMN?

**When to decide**: Before Plan 16 Phase 2.

### Process Mining Import

**Question**: What observation types are needed for process mining data import?

**When to decide**: When process mining integration becomes a real use case.

### Step `kind` Values Review

**Question**: Are current step kinds (`action`, `decision`, `milestone`, `wait`, `handoff`, `start`, `end`) sufficient? Are `review`/`approval` missing, or covered by properties per P10.2?

**When to decide**: After real-world modeling usage across multiple projects.

### Duration/Money/Rate Primitives

**Question**: Are the current format definitions right? Duration uses `30min`, `2h`, `1.5d`, `1wk`, `3mo`. Is ISO 8601 (`PT30M`) correctly rejected? Are rate expressions expressive enough?

**When to decide**: After format validation testing (partially addressed by Plan 05 D).

### Expand HypothesisNode `about` Scope (was F6)

**Question**: Minor consistency gap — should HypothesisNode `about` accept the same ref types as Insight `about`?

**When to decide**: After real usage data. Low priority.

---

## Deferred Schema Changes

### `workStatus` on HypothesisNode

Gap: No implementation status field. Users used `custom` workaround.

**Recommendation**: Add if demand persists across multiple projects.

### `displayNumber` on HypothesisNode

Gap: No display labels ("1.1", "1.2.3") independent of IDs.

**Recommendation**: Let renderers auto-generate from tree position. Add general `label` if demand persists.

### Impact Scoring

Gap: Only `priority` enum. No numeric or multi-dimensional scoring.

**Recommendation**: `priority` + `custom` covers most needs.

### KPI.actuals (time-series data)

**Question**: Should KPIs store historical actual values?

**Recommendation**: No — violates P1.3 (No Computed Aggregations) and P1.4 (No Built-In Version Control). Use `custom:` or external BI tools.

---

## Large Features

### AI-Assisted Extraction

```bash
ubml analyze meetings/*.md --suggest
```

Scan documents for actors, systems, metrics, processes. Preview candidates, confirm before adding.

**Details**: Chunked processing for large documents, deduplication against existing elements, confidence scoring per candidate. Depends on LLM provider abstraction (OpenAI, Anthropic, local models). Implement after manual workflow is proven.

**Prerequisite**: Manual workflow proven first.

### Documentation Framework Migration

Options: VitePress (recommended), Docusaurus, MkDocs Material.

**Prerequisite**: Content exists (Plans 10–13) before framework matters.

### Interactive Playground

Web-based UBML editor with live validation. CodeSandbox/StackBlitz or custom.

### Video Tutorial

5-minute screencast: `ubml init` → add process → validate → VS Code integration.

**Prerequisite**: CLI and docs stable.

### Insight Review Workflow

```bash
ubml insights review    # Interactive status management
```

Walk through insights by status (proposed → validated/disputed/retired).

### Insight Deduplication

Warn when new insight text is 85%+ similar to existing:

```
⚠ IN00007 text is 92% similar to IN00003 — possible duplicate?
  IN00003: "Preparation phase takes 450 days on average"
  IN00007: "The preparation phase averages 450 days"
```

Open question: When the same fact appears in multiple interviews, merge or keep separate with cross-references? Trade-off between data fidelity and noise.

### Knowledge Indexing & Caching

Pre-computed index files (`.ubml/index/`) for LLM context and fast search.

**Open questions**: Gitignored vs committed? Index format? Stale detection? Rebuild cost at scale (1000+ insights)?

**Prerequisite**: Real usage data on workspace scale.

### Insight Splitting Conventions

As workspaces grow, insight files need splitting. By domain (recommended per P3.4), by source, by date, or by topic? Need real usage patterns to decide.

---

## Graduation Criteria

An item moves from this file to its own plan file when:
1. Clear demand (multiple users/projects requesting)
2. Prerequisites complete
3. Design specific enough to implement in 1–2 sessions
