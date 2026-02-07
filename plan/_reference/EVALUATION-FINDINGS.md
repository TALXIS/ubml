# UBML Evaluation Findings — Reference

> **Source**: Blind testing sessions (CETIN FTTH, power transformer manufacturing) conducted late 2025 / early 2026
> **Evaluators**: Simulated business analysts with no prior UBML training
> **Date**: 2026-02-07
> **Status**: Historical reference - preserves context from evaluation sessions
> 
> **Note**: This document captures what was discovered during testing. For actionable plans based on these findings, see:
> - [03-cli-error-messages.md](../03-cli-error-messages.md), [04-templates-examples.md](../04-templates-examples.md), [05-schema-discovery-validation.md](../05-schema-discovery-validation.md) — CLI/UX work
> - [01-knowledge-layer-schema.md](../01-knowledge-layer-schema.md) — Schema fixes

---

## Executive Summary

Two comprehensive blind tests revealed that UBML's core architecture is solid but CLI/UX needs improvement. Users successfully modeled complex real-world scenarios (21 meeting transcripts, 30 KPIs, 62 actors) but accumulated errors silently, couldn't discover native schema features, and fell back to `custom:` fields.

**Key Success**: Progressive discovery workflow validated. Users modeled iteratively without training.

**Key Failure**: Validation gave false confidence. Exit code 0 with 53 schema errors hidden for 84 minutes.

---

## What Worked Well

### ✅ Core Architecture
- **Progressive modeling** — Add partial info, refine later. Praised by both testers.
- **ID namespacing** — AC00001, KP00001, ST00001 prevented collisions across large workspaces.
- **Git-friendly YAML** — Version control worked flawlessly.
- **Workspace-level validation** — Cross-file reference checking caught real errors.
- **"Did you mean?" suggestions** — Outstanding feature for undefined references.

### ✅ Knowledge Layer (Sources → Insights → Model)
- **Traceability worked** — `derivedFrom` chains traced actors/processes back to meeting transcripts.
- **Minimal capture friction** — Can record insight with just `text` field in seconds.
- **Cross-referencing** — Same person across 21 meetings handled via ActorRef.
- **Insight linking** — `related` field connected corroborating/contradicting insights.

### ✅ Validation Quality
- Clear error messages with line numbers
- Contextual hints (e.g., "consider adding glossary for complex workspaces")
- `ubml show tree` visualization excellent

---

## Critical Bugs (P1 - Must Fix)

### Bug 1: False Validation Success
**Severity:** Critical  
**Impact:** User trust undermined

**Steps to reproduce:**
1. Create `process-broken.ubml.yaml` (note: not `*.process.ubml.yaml` pattern)
2. Fill with 53 schema violations (unknown properties, wrong types)
3. Run `ubml validate .` → Exit code 0, "79 warnings"
4. Run `ubml validate process-broken.ubml.yaml` → 53 errors revealed

**Root cause:** Workspace scan silently skips files not matching `*.{type}.ubml.yaml` pattern.

---

### Bug 2: Glossary Template Inconsistent ID Pattern
**Severity:** Medium  
**Impact:** Confusing onboarding experience

**Steps to reproduce:**
1. `ubml add glossary`
2. Observe template uses `01000:` (numeric, no prefix)
3. All other elements use typed prefixes (AC###, PR###)

**Question:** Are string keys (`MVA:`, `ONAN:`) preferred? Template suggests numeric.

---

### Bug 3: Missing Help Topics
**Severity:** Medium  
**Impact:** Advanced features undiscoverable

**Steps to reproduce:**
1. `ubml help blocks` → "Unknown topic: blocks"
2. Yet `blocks` is valid schema concept with operator types

**Missing topics:** `blocks`, `phases`, `links`, `RACI`, `custom`

---

### Bug 4: Single-File Validation Misses Cross-References
**Severity:** Medium  
**Impact:** False sense of correctness

**Steps to reproduce:**
1. Create process file referencing non-existent `AC99999`
2. `ubml validate single-file.yaml` → passes ✓
3. `ubml validate .` → fails with undefined reference error

**Expected:** Warning that cross-references won't be checked in single-file mode

---

## Schema Gaps (Implemented vs Needed)

### User Expectations vs Current Schema

| What Users Wrote | Schema Reality | Gap Type | Priority | Status |
|------------------|----------------|----------|----------|--------|
| `owner: AC00003` on Process | ❌ Not a Process property | Missing semantic property | High | Phase.owner exists; Process.owner in discussion |
| `goal: "Deploy 180K..."` on Process | ❌ Not a Process property | Semantic misplacement | Medium | Rejected - belongs in strategy/hypotheses |
| `kpis: [KP00001]` on Step/Process | ❌ Not a property | Missing linkage | High | Should add |
| `avgDuration: 90 days` | ❌ Wrong property + format | Naming + format | High | Property is `duration`, format is `90d` |
| `nextStep: ST00002` on Step | ❌ Not a property | Structural difference | By design | Use `links` array separately |
| `actors: [AC00001, AC00004]` on Step | ❌ Not a property | Semantic misunderstanding | By design | Use RACI matrix |
| `source` (singular) on Insight | ✅ Exists but limiting | Schema limitation | High | Should be `sources` (array) - see plan 01 F1 |
| `attribution: "Jan Tilsch"` | ✅ Works but no linkage | Missed opportunity | Medium | Should accept `ActorRef \| string` - see F4 |
| `notes` on Insight | ✅ Exists | Redundant field | Low | Remove - duplicates `context` - see F5 |
| `default: proposed` on status | ❌ Principle violation | Hidden default | Medium | Remove - violates P4.4 - see F3 |
| `about` can't reference Steps | ❌ Limited oneOf | Schema gap | High | Add StepRef, CapabilityRef - see F2 |

---

## Template Quality Issues

### Good Templates
- ✅ `process.ubml.yaml` — Has helpful starter content with commented examples
- ✅ `actors.ubml.yaml` — Clear structure with type/kind guidance

### Poor Templates
- ❌ `links.ubml.yaml` — Essentially empty, no `from`/`to` structure shown
- ❌ `hypotheses.ubml.yaml` — Structure present but no SCQH example or guidance
- ❌ `glossary.ubml.yaml` — Uses numeric IDs inconsistent with other element types

**Principle:** Every template should include:
1. Complete, commented example showing all major properties
2. Inline documentation explaining when to use each property
3. Real-world scenario (not "TODO: add description")

---

## Documentation vs Reality Discrepancies

### Discrepancy 1: Duration Format
**PRINCIPLES.md says:**
> Valid: `30min`, `2h`, `1.5d`, `1wk`, `3mo`  
> Invalid: `PT30M` (ISO 8601)

**User tested:** ISO 8601 format `P21D`, `P14D` validated successfully

**Also:** User naturally wrote `90 days` (rejected), expected `90 days` → normalized to `90d`

**Question:** Which is canonical? Tester intuitively wrote natural language.

**Recommendation:** CLI accepts `90 days` and normalizes to `90d`. Schema stays strict for interchange.

---

### Discrepancy 2: RACI vs Simple Ownership
**User expectation:** `owner: AC00003` (executive-readable)

**Schema reality:**
```yaml
RACI:
  responsible: ["AC00004"]
  accountable: ["AC00003"]
  consulted: ["AC00005", AC00007"]
  informed: ["AC00001"]
```

**Observation:** Tester's "broken" format was MORE readable by executives. Valid RACI format requires understanding RACI methodology.

**Design tension:** Readability (P2) vs No Shorthand Properties (P9.2)

**Decision:** Keep RACI as only way (aligns with P9.1, P9.2, DD-004). CLI should guide users to RACI with explanations, not provide shortcuts.

---

## Priority Recommendations (from Handover Document)

### Priority 1: Must Fix Before Production
| # | Issue | Solution | Effort |
|---|-------|----------|--------|
| 1 | Empty schema properties output | Fix `schema --properties` for all types | Low |
| 2 | Minimal templates | Enhance all templates with complete examples | Medium |
| 3 | Missing examples | Add realistic examples to `examples` command | Medium |
| 4 | Duration format confusion | Clarify canonical format + enforce in validator | Low |
| 5 | Exit code with errors | Exit 1 when validation errors exist | Low |

### Priority 2: Should Fix (High Value)
| # | Issue | Solution | Effort |
|---|-------|----------|--------|
| 6 | No cross-reference warning | Add warning when validating single files | Low |
| 7 | Missing help topics | Add `help blocks`, `help phases`, `help links`, `help RACI` | Medium |
| 8 | Glossary ID inconsistency | Document preferred pattern | Low |
| 9 | Smart error messages | Guide to native alternatives (RACI, attributes) | Medium |

### Priority 3: Nice to Have
| # | Enhancement | Benefit | Effort |
|---|-------------|---------|--------|
| 10 | `ubml lint` command | Style suggestions, naming improvements | High |
| 11 | `ubml doctor` command | Workspace health check | Medium |
| 12 | Interactive mode `--interactive` | Step-by-step prompts for element creation | High |
| 13 | `ubml rename` command | Safe ID refactoring across workspace | High |

---

## CLI Features Requested (Knowledge Layer Testing)

### High Priority (Minimal Friction)
```bash
ubml add insight "CFO mentioned budget freeze" --source SO00001 --kind constraint
ubml add source --name "Strategy Meeting" --type meeting --date 2026-01-15
ubml list actors       # Quick reference table
ubml find "Jan Til"    # Fuzzy search across all elements
```

### Medium Priority (Traceability)
```bash
ubml trace AC00001         # Show derivedFrom chain back to sources
ubml report coverage       # % of elements with derivedFrom links
ubml report orphans        # Unused insights, unreferenced actors
```

### Low Priority (Workflow Support)
```bash
ubml insights review       # Workflow for proposed→validated status
ubml import meetings/*.md  # Multi-source batch import
```

---

## Deferred Items Worth Revisiting

### Phase 6: File Splitting (from Refactoring Plan)

Large files that violate SRP but are functional:

**`cli/commands/add.ts` (665 lines)**
Split into:
- `add/index.ts` — Command definition, main `addCommand()`
- `add/templates.ts` — Template generation (`createCommentedTemplate`, `generateSectionYaml`)
- `add/items.ts` — Item generators (`generateProcessItems`, `generateActorItems`)

**`schema/introspection.ts` (595 lines)**
Split into:
- `introspection/document-info.ts` — Document type operations
- `introspection/element-info.ts` — Element type operations  
- `introspection/workflow.ts` — Workflow suggestions
- `introspection/index.ts` — Re-exports

**`scripts/generate/extract-metadata.ts` (619 lines)**
Split into:
- `extract-id.ts` — ID pattern extraction
- `extract-hints.ts` — Tooling hints extraction
- `extract-templates.ts` — Template data extraction
- `extract-content.ts` — Content detection config
- `extract-metadata.ts` — Re-exports + remaining

**Status:** ✅ Completed (all three tasks implemented)

---

### LLM-Assisted Features (Knowledge Layer)

**Deferred until manual workflow proven:**
- Automated claim extraction from transcripts
- Insight deduplication detection (85%+ text similarity warning)
- Auto-suggest `kind` based on text analysis
- Participant name extraction from meeting notes

**Rationale:** Need real usage patterns before building automation. Get manual workflow right first.

---

### Knowledge Indexing (from OPEN-TOPICS)

**Problem:** Workspaces with 5+ years of sources and 1000+ insights need efficient querying.

**Proposed:** Pre-computed index files (`.ubml/index/`) denormalizing insights for LLM context.

**Open questions:**
1. Gitignored (local cache) or committed (shared)?
2. What index formats serve LLM context best?
3. How to detect stale indices?
4. Rebuild cost at scale?

**Status:** Too complex without real usage data. Defer until workspaces reach scale.

---

## Test Results Summary

### CETIN FTTH Blind Test
- **Duration:** 84 min modeling + 30 min fixing
- **Output:** 62 actors, 30 KPIs, 7 processes, 21 sources, 58 insights
- **Errors:** 53 schema errors accumulated silently
- **Validation exit code:** 0 (false success)
- **User verdict:** "Would use it, but needs better error catching"

### Power Transformer Blind Test
- **Duration:** ~2 hours
- **Output:** 11 files, 58+ elements across processes/actors/entities/metrics/hypotheses/scenarios
- **Issues:** Template quality gaps, missing help topics, no cross-reference warnings
- **User verdict:** "Excellent validation, need better discovery"

---

## What NOT to Do (Principle Violations)

These were proposed but correctly rejected:

### ❌ Step.participants Shorthand
**Why rejected:** Violates P9.1 (No Alternative Representations), P9.2 (No Shorthand Properties), DD-004 (Why No Shorthand Syntaxes)

**Reason:** RACI is THE way to express responsibility. Adding `participants: [AC00001]` creates two paths to the same semantics. CLI should guide to RACI with helpful messages, not provide shortcuts.

### ❌ Entity.properties Alias
**Why rejected:** Violates P9.1

**Reason:** Schema has `attributes` (typed) and `custom:` (freeform). Adding `properties` creates ambiguity.

### ❌ Process.goal Property
**Why rejected:** Semantic misplacement

**Reason:** Goals belong in strategy (valueStreams), hypotheses (SCQH), or metrics (KPIs with targets). Processes describe HOW work happens, not WHY. Mixing concerns violates separation of concerns.

**CLI solution:** When user writes `goal:` on Process, show hint pointing to correct location.

### ❌ Relaxing Duration Schema Pattern
**Why rejected:** Violates P9.1 (canonical format)

**Reason:** Schema must stay strict (`90d`) for tool interchange. CLI can accept `90 days` and normalize to `90d` on save. Separation of concerns: schema = contract, CLI = UX.

---

## Modeling Decisions Log (from Knowledge Layer Test)

### Challenge 1: Same person mentioned inconsistently
**Problem:** Meeting 1 says "Jan Tilsch (CEO)", Meeting 5 says "Jan", Meeting 10 says "Tilsch"

**Decision:** Created `AC00001` on first mention, used ActorRef in later sources

**Reasoning:** Single source of truth. Avoid duplicate actors.

---

### Challenge 2: Conflicting cycle time numbers
**Problem:** Meeting 1: "137 days", Meeting 11: "142 days actual in Q1"

**Decision:** Captured both as separate insights (IN00002, IN00035), marked context

**Reasoning:** Both are true at different times. Context explains the change.

---

### Challenge 3: Insight granularity
**Problem:** Should "450-day prep phase has 3 bottlenecks" be 1 or 4 insights?

**Decision:** 4 insights — 1 for overall statement, 3 for each bottleneck

**Reasoning:** Atomic = easier to link. Each bottleneck may trace to different sources.

---

### Challenge 4: When to create a process vs just insights?
**Problem:** Lots of insights about "deployment" — when to formalize as `PR00001`?

**Decision:** After 10+ insights about same workflow, extracted common structure into process model

**Reasoning:** Process model forces you to think about sequence and links. Worth it when you have critical mass.

---

## Success Metrics

**Target: "Learnable in minutes, not days"**
- ✅ Tester productive in 84 minutes without training
- ❌ Learned WRONG patterns (accumulated errors silently)
- **Verdict:** Partially met. Need earlier guidance.

**Target: "Readable by stakeholders"**
- ✅ Tester's intuitive format more readable than valid format
- ⚠️ Valid RACI format requires RACI methodology knowledge
- **Verdict:** Tension between readability and rigor. CLI must bridge gap.

**Target: "Forgiving during capture, rigorous when needed"**
- ❌ Schema was strict immediately, no normalization
- ❌ No guidance to correct properties
- **Verdict:** Not met. Tooling should normalize (e.g., `90 days` → `90d`).

**Target: "Progressive discovery works perfectly"**
- ✅ Both testers praised incremental refinement workflow
- ✅ Add minimal info early, enrich later
- **Verdict:** Met. Core strength.

---

## Recommendations Still Relevant

Based on evaluation findings, these areas still need attention:

### Templates & Examples
- Links template needs example structure (`from`, `to`, `kind`)
- Glossary category IDs inconsistent (numeric vs TM### pattern)
- Examples command doesn't exist (`ubml examples <type>`)

### CLI Convenience
- No quick capture: `ubml add insight "..."`, `ubml add source ...`
- No search/discovery: `ubml find`, `ubml list`, `ubml trace`
- No model health: `ubml report coverage`, `ubml report orphans`

### Validation Enhancements
- Duration normalization (`90 days` → `90d`)
- Schema property search (`ubml schema --find "owner"`)
- Validate with suggestions mode (`--suggest`)

### Help & Guidance
- `ubml help custom` topic missing
- Duration format hints in error messages
- Reference hints showing defined actors
- `participants`/`actors` misplacement hint

See plans [03](../03-cli-error-messages.md), [04](../04-templates-examples.md), [05](../05-schema-discovery-validation.md), and [09](../09-cli-convenience-tooling.md) for detailed implementation proposals.

### Note on Completed Work
- File splitting refactoring (Phase 6) has been completed - see `sandbox/cetin-ftth-eval/` for details

