# Knowledge Layer — Design Fixes

> **Basis**: Test results from `temp/knowledge-layer-test/`, principles in `docs/PRINCIPLES.md`
> **Schema version**: 1.3
> **Date**: 2026-02-07
> **Status**: Proposed
> 
> **Context**: See `plan/EVALUATION-FINDINGS.md` for test methodology, bug reports, and full analysis.

These are design flaws discovered during realistic test-driven validation of the knowledge layer (Source → Insight → Model). Each fix references the principle it restores or the real-world scenario that exposed the problem.

---

## Summary

| # | Fix | Severity | Principle | Breaking? |
|---|-----|----------|-----------|-----------|
| F1 | `source` → `sources` (array) on Insight | High | P12.4, real-world | Yes (rename) |
| F2 | Expand `about` to accept Step, Capability refs | High | Completeness | No (additive) |
| F3 | Remove `default: proposed` on `status` | Medium | P4.4 | No |
| F4 | Make `attribution` accept `ActorRef \| string` | Medium | P2.2, traceability | No (widen type) |
| F5 | Remove `notes` from Insight | Low | P9.1 | Yes (remove field) |
| F6 | Add `source` to HypothesisNode `about` scope | Low | Consistency | No (additive) |
| F7 | Align `HypothesisNode.source` with knowledge chain | Medium | P12.4 | Discuss |

---

## F1: Insight.source should be an array

### Problem

`source` on Insight is a single `SourceRef`. In practice, insights are frequently corroborated or synthesized across multiple sources. Our test exposed this immediately:

- **IN00006** ("Jan Tilsch approved hiring 3 PMs") was discussed in Meeting 1 (as a possibility) and confirmed in Meeting 2 (as a decision). Only one source can be linked.
- A consultant confirming a pain point across 3 interviews must either pick one source arbitrarily, duplicate the insight, or create a synthetic "combined" source.

All workarounds violate either atomicity (one insight = one fact) or traceability (every model element traces to its origins). P12.4 (Layered Truth) requires "each layer references the one below for traceability" — singular `source` breaks this when reality involves multiple origins.

### Fix

Rename `source` to `sources` and change type from single ref to array.

**Schema change** in `knowledge.types.yaml`:

```yaml
# Before
source:
  description: "Reference to the source this insight was extracted from."
  $ref: "../defs/refs.defs.yaml#/$defs/SourceRef"

# After
sources:
  description: |
    References to knowledge sources this insight was extracted or derived from.
    Most insights come from a single source. Use multiple when an insight
    is corroborated across interviews, confirmed in a follow-up meeting,
    or synthesized from several documents.
  type: array
  items:
    $ref: "../defs/refs.defs.yaml#/$defs/SourceRef"
```

### Migration

Mechanical rename + wrap in array:
```yaml
# Before
source: SR00001

# After
sources: [SR00001]
```

### Impact

- Schema: `knowledge.types.yaml` — field rename + type change
- Generated types: regenerate
- Semantic validator: `source` → `sources` in reference field extraction
- CLI templates: update insight template
- Existing examples: `example/insights.ubml.yaml`, `example_cetin/` files
- Test workspace: `temp/knowledge-layer-test/`
- Plans/docs: update `SOURCES-AND-DERIVED-KNOWLEDGE-PLAN.md`, `KNOWLEDGE-LAYER-IMPLEMENTATION.md`

### Principle alignment

- **P12.4** (Layered Truth): Full traceability requires linking to all contributing sources
- **P5.2** (Required Properties Minimal): Array can be empty or have one item — no added friction
- **P9.1** (No Alternative Representations): Single field, array type — one way to express it

---

## F2: Expand `about` to accept Step and Capability refs

### Problem

`about` on Insight accepts only `ActorRef | EntityRef | ProcessRef`. The test immediately produced an insight *about a specific step*:

- **IN00003** ("Preparation phase takes 450 days") — this is about ST00001 (Preparation Phase), not the whole process PR00001. There's no way to express that.
- Capability-gap insights ("We lack digital onboarding capability") can't reference `CP#####`.
- Value stream insights can't reference `VS#####`.

This limits `about` for the two most common insight kinds — `pain` and `process-fact` — which are almost always about specific steps, not whole processes.

### Fix

Add `StepRef` and `CapabilityRef` to the `about` oneOf list.

**Schema change** in `knowledge.types.yaml`:

```yaml
# Before
about:
  type: array
  items:
    oneOf:
      - $ref: "../defs/refs.defs.yaml#/$defs/ActorRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/EntityRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/ProcessRef"

# After
about:
  description: |
    What or who this insight is about.
    References to actors, entities, processes, steps, or capabilities
    that this insight concerns.
  type: array
  items:
    oneOf:
      - $ref: "../defs/refs.defs.yaml#/$defs/ActorRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/EntityRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/ProcessRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/StepRef"
      - $ref: "../defs/refs.defs.yaml#/$defs/CapabilityRef"
```

### Migration

None — additive change, existing documents remain valid.

### Impact

- Schema: `knowledge.types.yaml` — add refs to oneOf
- Generated types: regenerate (union type widens)
- Docs: update `about` field description

### Discussion: Why not all ref types?

We could add every ref type (`LocationRef`, `EquipmentRef`, `SkillRef`, `MetricRef`, etc.), but that creates a kitchen-sink field. The principle is: **add refs for types that insights are commonly _about_**. Steps and capabilities are high-frequency targets. Equipment and locations are rare. If usage shows demand, expand later.

**Not included (for now):**
- `LocationRef` — insights rarely "about" a location
- `EquipmentRef` — rare outside manufacturing contexts
- `SkillRef` — captured via actor references
- `MetricRef` / `ScenarioRef` — metrics and scenarios reference insights, not the reverse

---

## F3: Remove `default: proposed` on Insight status

### Problem

The schema sets `default: proposed` on `status`. This directly violates **P4.4 (No Hidden Defaults)**:

> "Schema properties with meaningful choices (enums, type discriminators) must not have defaults. Users must explicitly specify values."

`status` is a meaningful choice with four values (`proposed`, `validated`, `disputed`, `retired`). A default hides the existence of other options from the user. A consultant who omits `status` doesn't know that `validated` and `disputed` exist.

### Fix

Remove `default: proposed` from the status property.

**Schema change** in `knowledge.types.yaml`:

```yaml
# Before
status:
  description: |
    Validation status of this insight.
    Insights start as 'proposed' and move through review.
  type: string
  enum: [proposed, validated, disputed, retired]
  default: proposed

# After
status:
  description: |
    Validation status of this insight.
    - proposed: Captured but not yet reviewed or validated
    - validated: Confirmed as accurate by review or corroboration
    - disputed: Challenged or contradicted by other information
    - retired: No longer relevant (superseded or context changed)
  type: string
  enum: [proposed, validated, disputed, retired]
```

### Migration

None — removing a default doesn't invalidate existing documents. Documents that omit `status` previously got `proposed` silently; now they simply have no status (which is semantically correct for a freshly captured insight with unknown review state).

### Impact

- Schema: `knowledge.types.yaml` — remove one line
- Generated types: no change (default doesn't affect TS type)

---

## F4: Make `attribution` accept `ActorRef | string`

### Problem

`attribution` is a plain string. In our test, every insight with attribution duplicates actor identity:

```yaml
# Actor already modeled
AC00001:
  name: "Jan Tilsch"

# But attribution is just a string — no link
IN00001:
  attribution: "Jan Tilsch, CEO"
  about: [AC00001]
```

The same person exists in three representations:
1. `AC00001` in actor model
2. `"Jan Tilsch, CEO"` in attribution
3. `"Jan Tilsch (CEO)"` in source participants

There's no programmatic way to answer "what did AC00001 say?" without text-matching strings. This violates the spirit of **P2.2 (Uniform Reference Syntax)** — the same concept (referencing a person) uses typed refs in some places and free text in others.

### Fix

Change `attribution` to accept `ActorRef | string`, matching the pattern already used by `participants` on Source.

**Schema change** in `knowledge.types.yaml`:

```yaml
# Before
attribution:
  description: |
    Who said or observed this. Plain text — can be a name, role, or
    description like "multiple workshop participants".
  type: string

# After
attribution:
  description: |
    Who said or observed this.
    Can reference a modeled actor by ID or use plain text for external
    participants, groups, or people not yet modeled.
    Examples: AC00001, "Karel Dvořák, Warehouse Manager", "multiple workshop participants"
  oneOf:
    - $ref: "../defs/refs.defs.yaml#/$defs/ActorRef"
    - type: string
```

### Migration

None — existing string values remain valid (string is still accepted). Users can upgrade to ActorRef when the person is modeled.

### Impact

- Schema: `knowledge.types.yaml` — change type
- Generated types: regenerate (type widens from `string` to `string | ActorRef`)
- Reference extraction: `attribution` must be added to `REFERENCE_FIELDS` in the generator if not already present, so the semantic validator resolves ActorRefs

### Discussion

This matches the existing `participants` pattern on Source, so it's a proven approach. The `oneOf: [ref, string]` pattern is already blessed by the language design. It preserves P12.1 (minimal friction) — you can still write a string — while enabling P12.4 (traceability) — you can link to modeled actors.

---

## F5: Remove `notes` from Insight

### Problem

Insight has three free-text fields:
1. `text` — the insight statement (required)
2. `context` — provenance and circumstances
3. `notes` — "Additional notes or commentary"

The boundary between `context` and `notes` is unclear. In our test, we never used `notes` — everything that would go there went into `context` instead. Having both violates **P9.1 (No Alternative Representations)**: two fields serve the same purpose with ambiguous boundaries.

Source has a similar issue — both `description` and `notes` — but there the distinction is clearer: `description` summarizes content, `notes` captures meta-commentary. For Insight, `context` already IS the meta-commentary.

### Fix

Remove `notes` from Insight type. Users should use `context` for all supplementary information.

**Schema change** in `knowledge.types.yaml`:

```yaml
# Remove this property from Insight
notes:
  description: "Additional notes or commentary."
  type: string
```

### Migration

Move `notes` content into `context` for any existing insights that use it:
```yaml
# Before
context: "Mentioned during budget meeting"
notes: "Follow up with IT for system logs"

# After
context: |
  Mentioned during budget meeting.
  Follow up with IT for system logs.
```

### Impact

- Schema: `knowledge.types.yaml` — remove property
- Generated types: regenerate
- Migration: mechanical merge of notes → context in any existing files

### Discussion

Keeping `notes` on Source is fine — description and notes serve distinct purposes there (content summary vs. meta-commentary about the source itself). The problem is specific to Insight where `context` already fills the meta-commentary role.

---

## F6: Expand `about` on HypothesisNode to include `SourceRef`

### Problem

This is a minor consistency issue. `HypothesisNode` has a `source` field that accepts `SourceRef | string`, but this is the evidence citation for the hypothesis node, not a link to what the hypothesis is *about*. 

Currently, there's no discoverability issue, but adding `about` or expanding reference scope on HypothesisNode would improve consistency with how insights work.

### Fix

Deferred — low priority. Document the design intent in `OPEN-TOPICS.md` and revisit after real hypothesis usage feedback.

---

## F7: Align HypothesisNode.source with the knowledge chain

### Problem

`HypothesisNode` has both:
- `source: oneOf [SourceRef, string]` — direct source citation
- `derivedFrom: InsightRef[]` — link to insights

This allows hypotheses to bypass the Source → Insight → Model chain by linking directly to sources. The architecture says "source knowledge flows through insights to reach model elements," but hypotheses have a shortcut.

### Discussion

This is **intentionally different** from the Insight architecture, and there's a reasonable argument for keeping it:

**Argument for keeping**: Hypothesis nodes cite evidence. A hypothesis might be backed by external research (`source: "McKinsey Digital Report 2025"`) or by an internal source (`source: SR00003`). The `source` field on HypothesisNode serves as **evidence citation**, not knowledge provenance. It answers "what backs this claim?" not "where did we learn this?"

**Argument for removing**: It violates the layered architecture. If the hypothesis is backed by SR00003, there should be an insight from SR00003 that the hypothesis references via `derivedFrom`. The `source` field on HypothesisNode is a convenience shortcut that undermines the three-layer model.

### Recommendation

**Keep the current design, but document the intent clearly.** The hypothesis `source` field is semantically different from insight `sources` — it's a citation, not a provenance chain. Add a note to `DESIGN-DECISIONS.md` explaining this distinction.

However, we should consider renaming `source` to `citation` on HypothesisNode to make the semantic difference visible:

```yaml
# Current (ambiguous — is this the same as Insight.source?)
source: SR00003

# Proposed (clear semantic difference)
citation: SR00003
```

### Status

Deferred for discussion. If renamed, this is a breaking change that needs migration tooling.

---

## Implementation Order

### Wave 1: Non-breaking fixes (safe to ship immediately)

| Fix | Change | Risk |
|-----|--------|------|
| **F2** | Add StepRef, CapabilityRef to `about` oneOf | None — additive |
| **F3** | Remove `default: proposed` on status | None — strictness increase |
| **F4** | Widen `attribution` to `ActorRef \| string` | None — type widening |

### Wave 2: Breaking changes (require migration)

| Fix | Change | Migration |
|-----|--------|-----------|
| **F1** | Rename `source` → `sources`, change to array | Mechanical: wrap in array |
| **F5** | Remove `notes` from Insight | Merge notes → context |

### Wave 3: Deferred (needs discussion)

| Fix | Blocker |
|-----|---------|
| **F6** | Low priority, needs real usage data |
| **F7** | Rename `source` → `citation` on HypothesisNode — breaking, needs consensus |

---

## Checklist per Fix

For each schema change:

- [ ] Update `schemas/1.3/types/knowledge.types.yaml`
- [ ] Update `schemas/1.3/types/hypothesis.types.yaml` (if F7)
- [ ] Run `npm run generate` → regenerate types, data, constants
- [ ] Update `src/semantic-validator.ts` if reference fields change
- [ ] Update example files: `example/insights.ubml.yaml`, `example_cetin/`
- [ ] Update test workspace: `temp/knowledge-layer-test/`
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run build && ./dist/cli.js validate example/` — examples validate
- [ ] Update `docs/DESIGN-DECISIONS.md` with decision rationale
- [ ] Update `plan/SOURCES-AND-DERIVED-KNOWLEDGE-PLAN.md` to reflect changes

---

## Appendix: Issues Considered But Not Fixed

### `participants` inconsistency across sources

SR00001 uses strings, SR00002 uses ActorRefs for the same people. This is working as designed — `oneOf: [ActorRef, string]` intentionally allows both for progressive refinement (P12.1). A consultant captures names first, upgrades to refs when actors are modeled. Tooling (future `ubml find` command) will help bridge the gap.

### `related` limited to InsightRef only

Cannot express "this insight relates to hypothesis HY00001." Kept as-is because the reverse path exists (`HypothesisNode.derivedFrom: [IN#####]`). Adding all ref types to `related` would make it a kitchen-sink field. If real usage shows demand, revisit.

### `format: date` not enforced at runtime

JSON Schema 2020-12 treats `format` as annotation by default. Whether `format: date` actually validates depends on the Ajv configuration. This is a validator configuration issue, not a schema design issue. Should verify Ajv is configured with `validateFormats: true`.

### No insight `name` field

Insights use `text` as their identity/display. Every other element type uses `name`. This is intentional — insights ARE their text. A separate `name` would create P1.2-like duplication. Listing/search tooling should truncate `text` for display.
