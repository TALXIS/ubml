# Changelog

Notable changes to UBML.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Initial development. Schema structure and core concepts are stabilizing.

See `/plan/README.md` for the roadmap and `/plan/00-design-decisions.md` for open design questions.

### Fixed

- `ubml add hypotheses` wrote `root` and `children` as `{id, text, …}` objects and arrays; the schema wants `HY#####`-keyed maps. The scaffold was teaching a shape its own bundled validator refuses.
- `ubml add process` wrote an `id` property inside the process. The ID is the key and `Process` declares no `id`, so `additionalProperties: false` rejected it.
- Removed `templateDefaults.entities.type` from the entities schema. `Entity` has no `type` property and sets `additionalProperties: false`, so the default made every scaffolded entities document invalid.

## [1.4.1] - 2026-09-04

### Fixed

- **`ubml validate <dir>` was silently skipping all schema validation.** The workspace-level validator ran each document's schema check but never attached a `filepath` to the resulting errors/warnings, and the file-result distribution step only keeps errors that have one — so every schema violation (missing required fields, invalid enum values, disallowed properties, bad patterns, etc.) was discarded for the whole workspace. Only cross-document reference errors and semantic warnings were ever reported. Single-file validation (`ubml validate <file>`) was unaffected. Now `ubml validate <dir>` reports schema errors correctly, attributed to the right file.
- `sources.participants` and `hypotheses` node `source` accepted a typed ID (`AC#####` / `SR#####`) *or* free text via `oneOf`, but any string shaped like a valid ID matched both branches, so ajv rejected it as "ambiguous" — the exact form shown in the `sources` schema's own example. Changed both to `anyOf`.
- Fixed the repo's own `example/` workspace, which the bug above had been silently letting through invalid: `example/actors.ubml.yaml` referenced a non-existent skill ID (`SK003` instead of `SK00003`).

## [1.4.0] - 2026-09-04

### Added

- **Knowledge layer**: two new document types for capturing where information comes from and what was learned from it.
  - `sources` (`*.sources.ubml.yaml`) — catalog of knowledge sources: interviews, meetings, workshops, documents, emails, surveys, observations, system exports, research.
  - `insights` (`*.insights.ubml.yaml`) — atomic derived knowledge (pain, opportunity, process-fact, stakeholder, decision, risk, assumption, constraint) that stays understandable in isolation, with an `IN#####` ID and a `SR#####` ID for sources.
  - New `derivedFrom` reference field on actors and hypothesis nodes, linking model elements back to the insights that justified them.
  - Hypothesis `source` field now accepts a typed `SourceRef` (`SR#####`) in addition to free text.
  - `ubml init`, `ubml add`, and `ubml help` all support the two new document types (init now scaffolds a sample `insights.ubml.yaml`).
- `ubml` CLI now checks once a day for newer releases and prints an update notice.
- `ubml validate` now warns (`SKIPPED_FILE`) about `*.ubml.yaml` files that don't match any recognized document-type naming pattern, instead of silently ignoring them.
- More validation error hints for properties placed on the wrong document type (`owner`, `properties`, `goal`, `objective`, `target`).
- New docs: `docs/WORKSPACE-SEMANTICS.md`, `docs/CONSUMERS.md`, and a `docs/projections/` guide covering BPMN, UML, ArchiMate, BMM, DMN/CMMN, Mermaid, PlantUML, VSM and other export targets.

### Changed

- Schema version bumped to **1.4** — all schema `$id`s and the `ubml:` document version now point at `/schemas/1.4/...`.
- **Breaking (scenarios schema):** renamed `evidence` → `observations` (and the `Evidence` type → `Observation`) in `*.scenarios.ubml.yaml` for consistency with the knowledge layer's terminology. Existing scenario files using `evidence:` need to rename the field to `observations:`.

### Fixed

- `ubml init` scaffolds `.vscode/settings.json` with `yaml.schemas` pointing at the current schema version for every known document type. The previously published `1.3.0` build predated the knowledge layer, so its `.vscode/settings.json` was missing `insights`/`sources` entries entirely ([#34](https://github.com/TALXIS/ubml/issues/34)).
- Fixed CLI command execution to use the correct distribution path after global install.
- CI/publish pipeline reliability fixes (dependency cache cleanup, explicit build step before `npm publish`).
