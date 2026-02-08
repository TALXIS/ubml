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

## F4: Change `attribution` to `ActorRef`

**Problem**: Attribution is a plain string — same person exists as `AC00001` in actors and `"Jan Tilsch, CEO"` in attribution with no linkage.

**Fix**: Change type to `ActorRef`. All people referenced in the workspace must exist as actors. External participants use actor `type: external`. No `string` alternative (P1.5, DD-010).

---

## F5: Remove `notes` from Insight

**Problem**: Three free-text fields (`text`, `context`, `notes`) with unclear boundary. Violates P9.1 (No Alternative Representations).

**Fix**: Remove `notes`. Users use `context` for supplementary information.

---

## F6: Remove `source` from HypothesisNode

**Problem**: Free-text `source` on HypothesisNode is a parallel knowledge provenance mechanism that bypasses the formal Source → Insight → Model chain. Violates P1 (Single Source of Truth), P9.1 (No Alternative Representations), and P12.6 (Single Provenance Path). With `text` as the only required Insight field, there's negligible friction in creating an insight and linking via `derivedFrom`.

**Fix**: Remove `source` property from HypothesisNode. Users link to insights via `derivedFrom: [IN#####]`.

---

## F7: Change `participants` on Source to `ActorRef[]`

**Problem**: `participants` on Source accepts `oneOf: [ActorRef, string]`, creating two ways to reference people. Violates P1.5 (Typed References for Modeled Concepts). External participants should be modeled as actors with `type: external`.

**Fix**: Change `participants` items type to `ActorRef` only. Remove the `string` alternative (DD-010).

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
- **Why not `ActorRef | string` for attribution/participants?** P1.5 — if the concept is modeled, use the model. String alternatives create parallel identity systems (DD-010).

### Considered But Not Changed

- **`related` limited to InsightRef only** — Reverse path exists (`HypothesisNode.derivedFrom`). Adding all ref types would create a kitchen-sink field. Expand if real usage shows demand.
- **`format: date` not enforced at runtime** — Ajv configuration issue (`validateFormats: true`), not a schema design issue. Tracked in [Plan 05 D](05-validation-bugs.md).
