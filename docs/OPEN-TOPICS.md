# Open Topics

Language design questions and areas that need further work.

## Needs Design Decision

Areas where we need to make and document architectural choices:

- **Actor types and RACI** — How do actor types (role, system, external) interact with RACI assignments? What's the projection to ArchiMate Actor vs Role?
- **Entity relationships** — How do we model relationships between entities? Foreign keys? Association types?
- **Metrics and measurement** — How do KPIs connect to process steps and scenarios? What's the relationship between metrics and evidence?
- **Hypothesis decomposition** — How deep can hypothesis trees go? What operators (AND/OR) are supported?
- **Workspace organization** — When should content be split across files? How do cross-file references resolve?
- **Process.owner vs Phase.owner** — Phase.owner already exists. Should Process have a separate owner? What's the semantic distinction? If process owner = "overall accountable", how does it relate to phase owners? Risk of violating P1.1 (No Dual Hierarchy).
- **Process vs Workflow separation** — A process is the end-to-end business intent and structure (what and why); a workflow is the automated/executable part (how — routing, connectors, error handling, payload mapping). UBML currently models both under `process`. Should UBML distinguish these levels? A blind test showed that the "broken" intuitive process format was more readable to executives, while the schema-valid version (RACI, duration codes, blocks) looks more like a workflow artifact. Questions: (1) Should UBML stay at the process (business intent) level and leave workflow details to export targets like BPMN/Power Automate? (2) Do `blocks`, `systems`, and detailed step properties push UBML toward workflow territory? (3) Would a clear conceptual boundary help users know what belongs in UBML vs. what belongs in an automation tool?
- **KPI.actuals (time-series data)** — Should KPIs store historical values? Concerns: (1) Violates P1.4 (No Built-In Version Control) — historical data is version tracking inside the document. (2) Violates P1.3 (No Computed Aggregations) — who updates stale values? (3) Scope creep — UBML models how organizations work, not a metrics dashboard. Alternative: use `custom:` fields or external BI tools.

## Schema Evolution

Active questions about the current schema:

- Review step `kind` values — are all needed? Any missing?
- Block operators (`par`, `alt`, `opt`, `loop`) — sufficient for common patterns?
- Duration/Money/Rate primitives — are the formats right?
- Expression language — what subset do we actually need?
- **HypothesisNode.source → citation rename** — `source` on HypothesisNode is semantically a citation (evidence backing a claim), not a provenance chain like Insight.sources. Consider renaming to `citation` to disambiguate from the knowledge-layer `source`/`sources` pattern. Breaking change — needs migration tooling. See `plan/KNOWLEDGE-LAYER-FIXES.md` F7.

## Knowledge Layer

Open design questions related to the Sources & Insights knowledge layer (see DD-008):

- **Knowledge indexing and caching strategy** — Workspaces accumulating 5+ years of sources and insights need efficient querying. Pre-computed index files (`.ubml/index/`) could denormalize insights for LLM context and fast search. Key questions: (1) Should indices be gitignored (local cache) or committed (shared)? (2) What index formats serve LLM context best? (3) How to detect stale indices? (4) What's the rebuild cost at scale (1000+ insights)? Deferred from initial implementation — too complex to get right without real usage data.
- **LLM extraction pipeline** — Automated claim extraction from source transcripts. Chunked processing, deduplication, confidence scoring. Depends on provider abstraction (OpenAI, Anthropic, local). Deferred — implement after manual workflow is proven.
- **Insight deduplication across sources** — When the same fact appears in multiple interviews, should insights be merged or kept separate with cross-references? Trade-off between data fidelity and noise.
- **Tooling coverage for knowledge layer** — Verify that ESLint rules, CLI help text, and validation hints correctly reference `observations`, `SourceRef`, `InsightRef`, and other knowledge layer names. See DD-008.
- **Insight splitting strategy** — As workspaces grow, insight files need splitting. By domain (recommended), by source, by date, or by topic? Need real usage patterns to decide conventions.

## Tooling Considerations

Things that affect language design but are primarily tooling concerns:

- Validation strictness levels — how do we implement progressive validation?
- BPMN export fidelity — what's acceptable loss?
- Process mining import — what observation types do we need?
- **Semantic hints in validation** — Currently, hints like "goals belong in strategy, not process" are hardcoded in `validation-errors.ts`. These encode semantic relationships between document types (process vs. strategy vs. hypotheses) that should ideally come from schema metadata (e.g., `x-ubml` annotations). This would make semantic guidance maintainable alongside schema evolution and allow schema authors to define cross-document guidance without modifying TypeScript code.
- **Duration natural language normalization** — CLI should accept `90 days` and normalize to `90d`. Schema stays strict for interchange. Aligns with "Forgiveness over Strictness" principle. Needs `ubml fix` command to auto-correct.
- **Template quality gaps** — Templates for `links`, `hypotheses`, `glossary` are minimal or empty. Every template should include complete, commented examples with real-world scenarios. Glossary template uses numeric IDs inconsistent with other elements.
- **Missing CLI help topics** — `blocks`, `phases`, `links` have no help topics despite being valid schema concepts. `ubml help blocks` returns "Unknown topic."
- **Single-file validation silently skips cross-references** — `ubml validate single-file.yaml` passes even when referencing undefined actors. Should warn that cross-references are not checked.
- **Schema browser / property search** — `ubml schema <type> --properties` returns empty for some types (hypotheses). `ubml schema --find "owner"` would help users discover where properties live across types.

---

*Add topics as they arise. Move to DESIGN-DECISIONS.md once resolved.*
