# 01 — Knowledge Layer Schema Fixes

> **Status**: Proposed
> **Depends on**: Nothing (first in sequence)
> **Effort**: Medium (one session)
> **Schema version**: 1.4
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md), `docs/PRINCIPLES.md`

---

## Goal

Fix five design flaws in the knowledge layer schema (Source → Insight → Model) discovered during blind testing. Split into two waves: non-breaking changes first, then breaking changes.

---

## Wave 1: Non-Breaking Changes

Ship immediately — existing documents remain valid.

### F2: Expand `about` to accept Step and Capability refs

**Problem**: `about` on Insight only accepts `ActorRef | EntityRef | ProcessRef`. Insights about specific steps (e.g., "Preparation phase takes 450 days") or capability gaps can't reference `ST#####` or `CP#####`.

**Fix**: Add `StepRef` and `CapabilityRef` to the `about` oneOf list in `knowledge.types.yaml`.

**Migration**: None (additive).

### F3: Remove `default: proposed` on Insight status

**Problem**: Violates P4.4 (No Hidden Defaults). A consultant who omits `status` doesn't discover that `validated`, `disputed`, and `retired` exist.

**Fix**: Remove `default: proposed` from the status property. Add per-value descriptions to the enum.

**Migration**: None (strictness increase).

### F4: Widen `attribution` to accept `ActorRef | string`

**Problem**: `attribution` is a plain string, so the same person exists as `AC00001` in actor model and `"Jan Tilsch, CEO"` in attribution with no linkage. Violates spirit of P2.2 (Uniform Reference Syntax).

**Fix**: Change `attribution` type to `oneOf: [ActorRef, string]` — matches existing `participants` pattern on Source.

**Migration**: None (type widening, existing strings remain valid).

---

## Wave 2: Breaking Changes

Require migration of existing documents.

### F1: Rename `source` → `sources` (array) on Insight

**Problem**: Single `SourceRef` can't represent insights corroborated across multiple sources (e.g., discussed in Meeting 1, confirmed in Meeting 2). Violates P12.4 (Layered Truth).

**Fix**: Rename `source` to `sources`, change type to `array` of `SourceRef`.

**Migration**: Mechanical — wrap existing value in array: `source: SR00001` → `sources: [SR00001]`.

### F5: Remove `notes` from Insight

**Problem**: Three free-text fields (`text`, `context`, `notes`) with unclear `context` vs `notes` boundary. Violates P9.1 (No Alternative Representations).

**Fix**: Remove `notes` property. Users should use `context` for all supplementary information.

**Migration**: Merge `notes` content into `context` for any existing insights.

---

## Implementation Checklist

- [ ] Update `schemas/1.4/types/knowledge.types.yaml` (all five changes)
- [ ] Run `npm run generate` → regenerate types, data, constants
- [ ] Update `src/semantic-validator.ts` — `source` → `sources` in reference field extraction, add `attribution` to ref fields if ActorRef
- [ ] Update CLI templates for insights (`src/cli/` or template data)
- [ ] Update example files: `example/insights.ubml.yaml`
- [ ] Update sandbox files: `sandbox/cetin-ftth/` (if they use affected fields)
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run build && npx tsx bin/ubml.ts validate example/` — examples validate
- [ ] Add decision rationale to `docs/DESIGN-DECISIONS.md`

---

## Design Notes

- **Why not all ref types in `about`?** Only add types insights are commonly *about*: Steps and Capabilities are high-frequency. Equipment, Location, Skill are rare. Expand if usage shows demand.
- **Why keep `notes` on Source?** Source has `description` (content summary) + `notes` (meta-commentary) — the distinction is clearer there. The problem is specific to Insight where `context` already fills the meta-commentary role.

### Considered But Not Changed

- **`participants` inconsistency across sources** — `oneOf: [ActorRef, string]` intentionally allows both for progressive refinement (P12.1). Capture names first, upgrade to refs when actors are modeled.
- **`related` limited to InsightRef only** — Reverse path exists (`HypothesisNode.derivedFrom`). Adding all ref types would create a kitchen-sink field. Expand if real usage shows demand.
- **`format: date` not enforced at runtime** — Ajv configuration issue (`validateFormats: true`), not a schema design issue. Verify separately.
- **No insight `name` field** — Insights ARE their text. A separate `name` would create duplication. Listing/search tooling should truncate `text` for display.
