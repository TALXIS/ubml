# 02 — Typed Reference Compliance

> **Status**: Proposed
> **Depends on**: Nothing (independent)
> **Effort**: Small (one session)
> **Schema version**: 1.4 → 1.5
> **Principle**: [P1.5 Typed References for Modeled Concepts](../docs/PRINCIPLES.md), [DD-010](../docs/DESIGN-DECISIONS.md)

---

## Goal

Enforce P1.5 across the entire schema: every property that refers to a modeled concept must use the corresponding typed reference. No string alternatives.

Plan 01 covers the knowledge layer (Source, Insight, HypothesisNode). This plan covers the remaining violations in strategy, entity, document, metrics, scenario, and glossary schemas.

---

## A: `Capability.systems` → `ActorRef[]`

**File**: `schemas/1.4/types/strategy.types.yaml` (line 241)

**Problem**: `systems` is `array items: type: string` — free-form system names. But systems are modeled as actors with `type: system`. Compare with `Step.systems` which already correctly uses `ActorRef[]`.

**Fix**: Change items type from `string` to `ActorRef`.

---

## B: `Document.system` → `ActorRef`

**File**: `schemas/1.4/types/document.types.yaml` (line 109)

**Problem**: `system` is `type: string` — a repository name like "SharePoint" or "DMS". Systems are modeled as actors with `type: system`.

**Fix**: Change type from `string` to `ActorRef`.

---

## C: `Entity.system` → `ActorRef`

**File**: `schemas/1.4/types/entity.types.yaml` (line 252)

**Problem**: `system` is `type: string` — master system like "SAP ERP". Same as Document.system — systems are modeled actors.

**Fix**: Change type from `string` to `ActorRef`.

---

## D: `KPI.source` → `ActorRef`

**File**: `schemas/1.4/types/metrics.types.yaml` (line 221)

**Problem**: `source` is `type: string` — data source like "ERP system" or "CRM reports". These are systems that produce measurement data — modeled as actors with `type: system`.

**Fix**: Change type from `string` to `ActorRef`.

---

## E: `Observation.source` → `ActorRef`

**File**: `schemas/1.4/types/scenario.types.yaml` (line 379)

**Problem**: `source` is `type: string` — measurement origin like "Time tracking system" or "ERP export". Same pattern as KPI.source.

**Fix**: Change type from `string` to `ActorRef`.

---

## F: `GlossaryTerm.source` → `SourceRef`

**File**: `schemas/1.4/documents/glossary.schema.yaml` (line 140)

**Problem**: `source` is `type: string` — authority for a definition like "ISO 9001" or "ITIL". Definition authorities are information sources — modeled as Sources with `type: document` or `type: research`.

**Fix**: Change type from `string` to `SourceRef`.

---

## Checklist

- [ ] Update `schemas/1.4/types/strategy.types.yaml` — Capability.systems
- [ ] Update `schemas/1.4/types/document.types.yaml` — Document.system
- [ ] Update `schemas/1.4/types/entity.types.yaml` — Entity.system
- [ ] Update `schemas/1.4/types/metrics.types.yaml` — KPI.source
- [ ] Update `schemas/1.4/types/scenario.types.yaml` — Observation.source
- [ ] Update `schemas/1.4/documents/glossary.schema.yaml` — GlossaryTerm.source
- [ ] Run `npm run generate` → regenerate types
- [ ] Update `src/semantic-validator.ts` — add ref extraction for new ActorRef/SourceRef fields
- [ ] Update example workspace if affected
- [ ] Update sandbox files if affected
- [ ] Run `npm test` + `npm run build && npx tsx bin/ubml.ts validate example/`

---

## Design Notes

- **Why `ActorRef` for `system` properties?** Systems are actors with `type: system` in UBML. `Step.systems` already uses `ActorRef[]`. Same concept, same type.
- **Why `ActorRef` for `KPI.source` and `Observation.source`?** These refer to IT systems that produce data, not knowledge sources (SR#####). The system is an actor; the data it produces may become a Source if captured.
- **Why `SourceRef` for `GlossaryTerm.source`?** Definition authorities (ISO standards, ITIL, internal policies) are information sources — catalog them as Sources with `type: document` or `type: research`.
