# Changelog

Notable changes to UBML.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Initial development. Schema structure and core concepts are stabilizing.

See `/plan/README.md` for the roadmap and `/plan/00-design-decisions.md` for open design questions.

### Fixed

- **`ubml add` scaffolded a document that `ubml validate` rejects, for 13 of the 13 document types it can create.** `transformTemplateData` hardcoded `properties: []` for every section, so `TEMPLATE_DATA` carried no property information at all. The scaffolder then wrote an item key with an empty body — `TM01000:` with nothing under it parses as `null`, not an object — and validation failed on a file the tool had just produced. Types that appeared to work did so only because `items.ts` carried a hand-written example for them. Section properties are now extracted from the schema, resolving `$ref` into `types/`, so the scaffold satisfies the schema it was generated from.
- Sequence-typed sections (`links`, glossary `categories`) were scaffolded as ID-keyed maps. They now scaffold as an empty list with the item shape shown in comments, because a sample item would carry references to IDs the user has not created yet.
- Reference placeholders were always `AC#####` regardless of what the field accepts, so a scaffolded step link failed its own pattern check. The prefix now comes from the referenced definition's own pattern.
- Required array and object properties were filled with the string `TODO`, which is a type error the moment it is written.
- Section ID prefixes were read with a two-letter regex, so `roiAnalyses` (`ROI#####`) was scaffolded as `RO#####`.
- `ubml add hypotheses` wrote `root` and `children` as `{id, text, …}` objects and arrays; the schema wants `HY#####`-keyed maps. The scaffold was teaching a shape its own bundled validator refuses.
- `ubml add process` wrote an `id` property inside the process. The ID is the key and `Process` declares no `id`, so `additionalProperties: false` rejected it.
- Removed `templateDefaults.entities.type` from the entities schema. `Entity` has no `type` property and sets `additionalProperties: false`, so the default made every scaffolded entities document invalid.
- **`ubml nextid` could not be trusted as a source of truth, three ways.** It wrote its own answer back to the cache, so asking twice gave two answers and the number climbed on every call. `writeIdStats` only ever kept the larger of the cached and supplied value, so `syncids` could not lower a stale entry, which is the one case it exists for. And `minStart` was applied even when IDs already existed, so a workspace numbered from 1 was told its next actor was `AC01000`, leaving a 989-wide hole and two disjoint ranges in one document. A query no longer mutates the cache, a scan replaces rather than merges, and the floor applies only to a workspace with no IDs yet.
- `ubml nextid` printed `Highest:` from the cache while presenting it as fact. It now names the cache as its source and points at `ubml syncids`.
- `ubml add --dir <folder>` failed with ENOENT when the folder did not exist yet. It creates it now, as `ubml import` does.
- `ubml init` closed by pointing at `ubml docs vscode`, which does not exist; the topic is `ubml help vscode`. It also listed the files it created as absolute paths on Windows.

### Added

- `ubml validate` warns (`ubml/superseded-not-retired`) when an insight names what it `supersedes` and the claim it replaces is not `retired`. Without it a workspace can assert a claim and its replacement at once, and every element citing either still looks sourced. An older claim with no `status` counts as `proposed`, the schema default. A warning, because the model still reads and the fix is one word.
- `walk next` shows the whole bundle: the claim with its date, tags, note and who said it; the source it cites, with who was there and the path of the stored text a quote can be checked against; ids resolved to names wherever one is known; a step placed in its process, "step 2 of 16", by the shortest path from an entry point; a parent's child elements counted rather than printed, each reviewed on its own; and a note when the same source later revises the claim, so it is not settled blind.
- `walk legend` prints what each status means for a claim and for an element, side by side, out of the schema. The first bundle of a source points at it.
- `walk context <id>` prints the passage a claim's quote came from in the stored text, with what was said either side of it.
- `walk set` adds the field it records where the claim or element does not carry it yet, rather than only rewriting one already there, and `--by <name>` writes who settled a claim into its new `reviewedBy` field - for a walk run on somebody else's behalf, or a room where different people settled different claims. A name YAML would read as a number, a boolean or null is quoted, so it reads back as the name. If the name cannot be written, the command says the status was written and the name was not, and exits 1.
- `ubml enums`, `ubml syntax`, `ubml schema <type> --properties` and the comments in `ubml add` templates list an enum written behind a `$ref`, so `reviewStatus` shows beside `status` instead of only the enums written inline.
- `ubml walk` drives the whole bundle: `walk next` shows the elements a claim proposes beside the claim itself, and `walk set` records either half - an insight takes `validated`/`disputed`/`deferred`, an element takes `accepted`/`rejected`, and the id says which is meant. Reviewing a claim without the element it would create approves the extraction and leaves the interpretation unasked. Once no claim is left to offer, or none was ever extracted, `walk next` lists every element still `proposed`, one citing no claim included, instead of calling the walk finished; and `walk set <id> accepted` prints the warning `validate` would give when the element rests on a claim that is not validated, or on none.
- Insight `status` gains `deferred`: the reviewer reached the claim and decided not to decide, usually because settling it needs somebody who was not in the room. `walk next` moves past it, and `proposed` keeps meaning that nobody has looked yet.
- `HT#####` is a reference type, so a hypothesis tree can be cited by its id, and anything resolving an id knows it names a tree.
- **`ubml import`** turns a WebVTT transcript into the text a source points at, written wherever it is pointed - as a second argument or with `-o` - the folder included. Teams writes one long utterance as a run of cues and closes the speaker tag only on the last, so a parser matching open-close pairs keeps the final fragment of every run and drops the rest without saying so; every cue that carried words has to come out the other side or the command refuses and writes nothing. A cue timing may leave out its hours, as WebVTT allows. Only `.vtt` is read; other formats are converted by hand, verbatim.
- `quote` on an insight: the words that were said, one entry per continuous span, separate from `context`, which is the reading of them. `ubml validate` checks each span against the source's stored text, normalising curly quotes and runs of space and treating an ellipsis as a cut. A span it cannot find is a warning (`QUOTE_NOT_IN_SOURCE`), because the stored text may be behind the claim; quoting a source with no `file` at all is an error (`QUOTED_SOURCE_HAS_NO_FILE`).
- **`reviewStatus` on every element that can carry `derivedFrom`** (`proposed` | `accepted` | `rejected`). `derivedFrom` proves an element came from evidence somebody confirmed; it says nothing about whether anyone agreed that evidence should become THIS element, with THIS name, merged with THAT one. A workspace whose modelling was argued over and one whose modelling was guessed looked identical. Extraction can now propose an element beside the insight that suggested it, and a reviewer approves the pair. Hypothesis trees and glossary terms gain `derivedFrom` as well, so everything that can be approved says what it rests on. Absence means not specified and nothing more, per P4.4. See DD-012.
- `ubml validate` warns (`ubml/accepted-on-unvalidated-insight`) when an element marked `reviewStatus: accepted` rests on a claim nobody validated: each insight its `derivedFrom` cites that is not `validated` is named with its status, and an accepted element citing no insight at all is reported too. An insight with no `status` reads as `proposed`, the schema default. A warning rather than an error, because the model still reads and the answer - validate the claim, or reopen the element - is the reviewer's.
- `ubml validate` names the model elements still `proposed` (`ubml/unreviewed-model-elements`) and `ubml show` counts them, as a hint rather than an error - a workspace mid-review is a legitimate state, it just should not be indistinguishable from a reviewed one.
- **`ubml walk`** — bookkeeping for a stakeholder review of extracted insights. `walk next` shows the next `proposed` insight in the order the material was produced, with the source text beside the claim and a position counter; `walk set <id> <status>` records the answer. A claim citing no source, or one no sources document defines, has no place in that order, so once the sourced claims are done `walk next` lists those claims rather than calling the walk finished. Deliberately stops at bookkeeping: reading a reviewer's reply, judging an ambiguous answer, or noticing that a correction changed the meaning is the caller's, not the CLI's. `set` rewrites one line rather than reserialising, because a workspace is a document a human is reading and its comments and quoting are content. A status one line cannot hold - a block scalar, a value on the next line, a key quoted or spaced before its colon - is refused with nothing written, and so is any edit that would not read back as the same document with only that status changed, such as one removing an anchor an alias elsewhere still names. A workspace file `walk` cannot parse stops it with the file named and exit code 1, rather than being read as empty.
- `derivedFrom` on `valueStreams` and `capabilities`. Every other element type could cite the insights behind it; strategy could not, so a strategy document's provenance was prose the validator never saw. It is now checked like anywhere else.
- `tests/integration/cli-add-validates.test.ts` — asserts that every type `ubml add` can create produces a document `ubml validate` accepts. All 13 cases fail against the previous behaviour.

### Changed

- `ubml help workflow`, `ubml schema --workflow` and the next document `ubml add` suggests put sources and insights second and third, directly after the workspace. 1.4.1 put them last, behind every modelling document, so the order the tool recommended was the reverse of the one it supports. `ubml help quickstart` walks the pipeline - register the source and store its text, draw claims from it, walk them with somebody who was there, model what was settled, validate - and a step for a document `init` scaffolds points at the file `init` wrote rather than at a bare `ubml add`.
- **`ubml init` scaffolds a worked example** instead of three unrelated samples: a source, the text it points at in `sources/`, a claim quoted verbatim from that text, and a step citing the claim, with a README saying what each file holds and the order they are worked in. It validates with no errors. The next steps start by going into the new folder and then walk the pipeline, so every command they print runs as printed from where `init` was run. `--minimal` still writes the workspace file alone, and its next steps mention only what it wrote. 1.4.1 scaffolded a process, actors and an insight that cited nothing.
- `ubml add <type>` without a name refuses a type the workspace already holds, names the file that holds it and points at `ubml add <type> <name>`. 1.4.1 wrote a second document beside the first. `ubml add workspace` names the workspace a folder already has instead of offering to overwrite it or to add a second, and every other place the CLI prints an add command - `ubml --help`, `ubml schema`, `ubml add`'s own examples and listing, `ubml show` - prints one that runs once `init` has.
- `ubml init --force` writes only the document types the folder does not hold yet, judged by type as `add` judges them rather than by file name, and keeps every file already there. 1.4.1 overwrote the workspace, process, actors and insights files with fresh samples, discarding whatever had been written in them, every claim and every status a walk had recorded included.
- **`ubml validate` enforces what `file` on a source always meant.** It is documented as a path relative to the declaring document, and a real workspace had all five sources holding a URL there instead - which validated cleanly and quietly meant no reader could check a quote against what was read. A URL in `file` is now an error naming `url` as the right field (`SOURCE_FILE_IS_URL`), and a `file` that resolves to nothing is an error too (`SOURCE_FILE_MISSING`), because a dangling pointer looks like filed evidence and is not. 1.4.1 accepted both. A source with no `file` stays valid: a corridor conversation has no artifact. See DD-013, which amends P12.2 - the artifact stays out, the text an extraction read comes in.

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
