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
- **KPI.actuals (time-series data)** — Should KPIs store historical values? Concerns: (1) Violates P1.4 (No Built-In Version Control) — historical data is version tracking inside the document. (2) Violates P1.3 (No Computed Aggregations) — who updates stale values? (3) Scope creep — UBML models how organizations work, not a metrics dashboard. Alternative: use `custom:` fields or external BI tools.

## Schema Evolution

Active questions about the current schema:

- Review step `kind` values — are all needed? Any missing?
- Block operators (`par`, `alt`, `opt`, `loop`) — sufficient for common patterns?
- Duration/Money/Rate primitives — are the formats right?
- Expression language — what subset do we actually need?

## Tooling Considerations

Things that affect language design but are primarily tooling concerns:

- Validation strictness levels — how do we implement progressive validation?
- BPMN export fidelity — what's acceptable loss?
- Process mining import — what evidence types do we need?
- **Semantic hints in validation** — Currently, hints like "goals belong in strategy, not process" are hardcoded in `validation-errors.ts`. These encode semantic relationships between document types (process vs. strategy vs. hypotheses) that should ideally come from schema metadata (e.g., `x-ubml` annotations). This would make semantic guidance maintainable alongside schema evolution and allow schema authors to define cross-document guidance without modifying TypeScript code.

---

*Add topics as they arise. Move to DESIGN-DECISIONS.md once resolved.*
