# 10 — Future Considerations

> **Status**: Proposed (exploratory — no immediate action)
> **Depends on**: Most earlier plans
> **Effort**: Varies

---

## Goal

Track larger features, deferred schema discussions, and infrastructure changes that aren't ready for implementation yet. Items here graduate to their own plan files when they become actionable.

---

## A. Visual Export / Projections

Users consistently requested diagram generation. Design docs exist in `docs/projections/` (Mermaid, BPMN, PlantUML, ArchiMate) but no implementation.

**Minimum viable**:
```bash
ubml export --format=mermaid process.ubml.yaml   # Process flow diagram
ubml export --format=mermaid actors.ubml.yaml     # Org chart
```

**Why deferred**: Mermaid is lowest-effort target but still requires full element traversal, layout decisions, and handling of edge cases (blocks, phases, cross-process links). BPMN export has higher fidelity requirements.

**Prerequisite**: Schema and validation should be stable (plans 01–02).

---

## B. Documentation Framework Migration

GitHub Pages default theme is minimal — no search, no sidebar, no versioning.

**Options**:
1. **VitePress** — TypeScript-native, great search, minimal setup (recommended)
2. **Docusaurus** — React-based, versioning support
3. **MkDocs Material** — Python-based, beautiful theme

**Why deferred**: Content must exist before a framework migration is worthwhile. Complete plans 06–08 first, then evaluate whether the framework matters.

---

## C. AI-Assisted Extraction

Automated extraction from source documents:

```bash
ubml analyze meetings/*.md --suggest
```

Scan documents for actors, systems, metrics, processes. Preview candidates, confirm before adding.

**Why deferred**: Manual workflow must be proven first. Depends on LLM provider abstraction. See also plan 00 deferred items.

---

## D. Deferred Schema Discussions

These are schema design questions that need real-world usage data before deciding:

### D1: `workStatus` on HypothesisNode

**Gap**: No field for implementation status (`not-started`/`in-progress`/`completed`). CETIN project used `custom` workaround.

**Options**: Add `workStatus` enum | Keep as `custom` | Generic `implementationStatus` on multiple types.

**Recommendation**: Add `workStatus` if demand persists across multiple projects.

### D2: `displayNumber` on HypothesisNode

**Gap**: No way to assign display labels ("1.1", "1.2.3") independent of IDs.

**Recommendation**: Defer — let renderers auto-generate numbering from tree position. If demand persists, add general `label` field.

### D3: Impact Scoring

**Gap**: Only `priority` enum exists. No numeric scoring or multi-dimensional impact.

**Recommendation**: Defer — `priority` + `custom` covers most needs.

### D4: Rename `source` → `citation` on HypothesisNode (F7)

**Context**: HypothesisNode has `source: SourceRef | string` which semantically means "evidence citation" not "knowledge provenance." Renaming to `citation` would clarify the distinction from Insight `sources`.

**Status**: Breaking change. Needs consensus and migration tooling. Revisit after F1 (`source` → `sources` on Insight) ships.

### D5: Expand HypothesisNode `about` scope (F6)

**Context**: Minor consistency gap. Low priority, needs real usage data.

---

## E. Interactive Playground

Web-based environment for trying UBML without installation:
- CodeSandbox, StackBlitz, or custom editor
- Pre-loaded example workspace with live validation
- Link from README and docs

---

## F. Video Tutorial

5-minute screencast: `ubml init` → add process → validate → VS Code integration.

**Prerequisite**: CLI and docs should be stable.

---

## Graduation Criteria

An item moves from this file to its own plan file when:
1. There is clear demand (multiple users/projects requesting it)
2. Prerequisites are complete
3. Design is specific enough to implement in 1–2 sessions
