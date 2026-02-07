# 01 — Knowledge Layer Schema Fixes

> **Status**: Proposed
> **Depends on**: Nothing (independent of Plan 00)
> **Effort**: Small–Medium (one session)
> **Schema version**: 1.4 → 1.5
> **References**: [Evaluation Findings](_reference/EVALUATION-FINDINGS.md)

---

## Goal

Fix five design flaws in the knowledge layer (Source → Insight → Model) discovered during blind testing. No backward compatibility — all changes ship together.

---

## F1: Rename `source` → `sources` (array) on Insight

**Problem**: Single `SourceRef` can't represent insights corroborated across multiple sources.

**Fix**: Rename to `sources`, change type to `SourceRef[]`.

---

## F2: Expand `about` to accept Step and Capability refs

**Problem**: `about` on Insight only accepts `ActorRef | EntityRef | ProcessRef`. Insights about steps or capability gaps can't reference `ST#####` or `CP#####`.

**Fix**: Add `StepRef` and `CapabilityRef` to the `about` oneOf.

---

## F3: Remove `default: proposed` on Insight status

**Problem**: Violates P4.4 (No Hidden Defaults). Users miss `validated`, `disputed`, `retired`.

**Fix**: Remove `default: proposed`. Add per-value descriptions to the enum.

---

## F4: Widen `attribution` to accept `ActorRef | string`

**Problem**: Attribution is a plain string — same person exists as `AC00001` in actors and `"Jan Tilsch, CEO"` in attribution with no linkage.

**Fix**: Change to `oneOf: [ActorRef, string]`. Matches `participants` pattern.

---

## F5: Remove `notes` from Insight

**Problem**: Three free-text fields (`text`, `context`, `notes`) with unclear boundary. Violates P9.1 (No Alternative Representations).

**Fix**: Remove `notes`. Users use `context` for supplementary information.

---

## Checklist

- [ ] Update `schemas/1.4/types/knowledge.types.yaml` (all five changes)
- [ ] Run `npm run generate` → regenerate types, data, constants
- [ ] Update `src/semantic-validator.ts` — `source` → `sources` in ref extraction, add `attribution` ActorRef handling
- [ ] Update CLI templates for insights
- [ ] Update `example/insights.ubml.yaml`
- [ ] Update `sandbox/cetin-ftth/` files
- [ ] Run `npm test` + `npm run build && npx tsx bin/ubml.ts validate example/`
- [ ] Add rationale to `docs/DESIGN-DECISIONS.md`

---

## Design Notes

- **Why not all ref types in `about`?** Only high-frequency types: Steps and Capabilities. Expand if real usage shows demand.
- **Why keep `notes` on Source?** Source has `description` (content) + `notes` (meta-commentary) — the distinction is clearer there. The overlap is specific to Insight.
- **No insight `name` field** — Insights ARE their text. Listing/search tooling truncates `text` for display.

### Considered But Not Changed

- **`participants` inconsistency across sources** — `oneOf: [ActorRef, string]` intentionally allows both for progressive refinement (P12.1). Capture names first, upgrade to refs when actors are modeled.
- **`related` limited to InsightRef only** — Reverse path exists (`HypothesisNode.derivedFrom`). Adding all ref types would create a kitchen-sink field. Expand if real usage shows demand.
- **`format: date` not enforced at runtime** — Ajv configuration issue (`validateFormats: true`), not a schema design issue. Tracked in [Plan 04 D](04-validation-bugs.md).
