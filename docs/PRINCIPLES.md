# UBML DSL Design Principles

> Language design principles for the Unified Business Modeling Language.
> These principles govern how the DSL schema is designed, not how users write models.

---

## Purpose

This document defines **binding constraints** for UBML language design. When designing new schema elements or refactoring existing ones, these principles must be followed. Violations indicate a design flaw that must be resolved before release.

---

## Design Philosophy

### Target Audience

UBML is designed for **business analysts and management consultants** — professionals who understand organizations, not software engineering. Every design decision must be evaluated from their perspective.

These users:
- Think in terms of *who does what*, *where time goes*, *what causes pain*, *how to improve ROI*
- Work in workshops, interviews, and stakeholder sessions — often capturing knowledge in real-time
- Need to communicate findings to executives and domain experts who have zero tolerance for technical notation
- May need to export to formal standards (BPMN, ArchiMate) when required by enterprise clients

### Design Goal

UBML should be **the tool consultants love** — something they reach for naturally because it makes their work easier, not because they're forced to use it.

This means:
- **Learnable in minutes, not days** — a consultant should capture their first process during a workshop, not after a training course
- **Readable by stakeholders** — the raw YAML should be understandable by a business executive with no technical background
- **Forgiving during capture, rigorous when needed** — rough models welcome, validation optional until you need it
- **Native format first, export second** — UBML is where consultants think; OMG standards are where they deliver

### UBML vs. Formal Standards

UBML is not competing with BPMN, ArchiMate, or UML. It's the **working format** that sits upstream of these standards.

| Concern | UBML | OMG Standards |
|---------|------|---------------|
| Optimized for | Human authoring & reading | Tool interchange & execution |
| Learning curve | Minutes | Days to weeks |
| Audience | Consultants, analysts, executives | Architects, tool vendors |
| Precision | Capture intent, refine later | Precise semantics required |
| Validation | Progressive (draft → strict) | Always strict |

When a client requires BPMN or ArchiMate, consultants export from UBML. The export may be lossy (UBML captures context that formal notations don't support), but the UBML model remains the source of truth.

---

## Core Values

These values resolve conflicts when principles compete:

1. **Readability over writability** — Optimize for humans scanning and understanding, even if it means more keystrokes when authoring
2. **Consultant vocabulary over standards vocabulary** — Use terms analysts actually say, not terms from specifications
3. **Progressive complexity** — Simple things simple, complex things possible
4. **Forgiveness over strictness** — Accept rough input, guide toward precision

---

## Evolution Philosophy

See **P11: Language Clarity Over Compatibility** for the formal principle governing UBML evolution.

---

## Structural Design Principles

### P1: Single Source of Truth

**Every piece of information must exist in exactly one location.**

Violations create sync bugs, editing burden, and validation complexity.

#### P1.1: No Dual Hierarchy Specification

When expressing parent-child relationships, the schema must support **ONE** direction only — either parent references or children lists, never both on the same element type.

**Rationale:** If both exist, they can contradict. Users must update two places when restructuring.

#### P1.2: No Redundant ID Declaration

Elements in keyed dictionaries must not duplicate the dictionary key as an `id` property. The key IS the identity.

This applies at all nesting levels — flat collections, nested hierarchies, and recursive structures all use the same pattern: ID as key, never as property.

**Rationale:** Redundant IDs create sync bugs when keys and properties diverge. Dictionary keys guarantee uniqueness. One representation eliminates ambiguity.

#### P1.3: No Computed Aggregations

The schema must not include properties whose values can be derived from other model elements (counts, totals, membership lists computable from graph structure).

**Rationale:** Computed values go stale. Tooling computes; users model.

#### P1.4: No Built-In Version Control

The schema must not include version history, change tracking, or diff capabilities. Use git for version control.

**Rationale:** Git provides proven version control, branching, and diffing. UBML files are plain text designed for git. Don't reinvent what git does well. Process variants use file-based organization (current/proposed folders), not schema properties.

---

### P2: Consistent Structural Patterns

**The same concept must be expressed the same way everywhere.**

#### P2.1: Uniform ID Patterns

Every element type must have a defined, validated ID pattern. All IDs must use typed prefixes that identify the element type at a glance.

**Rationale:** Enables instant recognition, tooling support, and cross-reference validation.

#### P2.2: Uniform Reference Syntax

References to other elements must use consistent syntax across all schema fragments. Reference types should be defined once and reused.

**Rationale:** Users learn one pattern. Tooling has one code path.

#### P2.3: Uniform Optional Property Behavior

Optional properties, when absent, null, or empty, must be semantically identical. The validator must not distinguish between these states.

**Rationale:** Predictable behavior. No surprises when cleaning up files.

---

### P3: Hierarchy and Nesting

**Structure should be visible through indentation.**

#### P3.1: Nesting for Ownership

When element B cannot exist without element A (ownership relationship), B must be nested inside A in the schema structure.

**Rationale:** Prevents orphans. Structure implies relationship. Moving an element automatically updates its parentage.

#### P3.2: References for Cross-Cutting Relationships

When an element can relate to multiple other elements or must span files, use references rather than nesting.

**Rationale:** Avoids duplication. Enables reuse.

#### P3.3: Maximum Nesting Depth

The schema should provide a flattening mechanism (parent references) for hierarchies exceeding 4 levels. Deep nesting becomes hard to scan and edit.

**Rationale:** Human readability. Editor usability.

---

## Semantic Design Principles

### P4: Explicitness

**Behavior must be declared, not inferred.**

#### P4.1: Semantic Properties Required

Properties that affect interpretation, execution, or visualization must be explicit in the schema. The system must not infer meaning from naming conventions or position.

**Rationale:** Predictable behavior. Renaming doesn't change semantics. Tooling doesn't guess.

#### P4.2: No Context-Dependent Defaults

Default values must not change based on where an element appears. An omitted property means the same thing everywhere.

**Rationale:** Consistency. No hidden rules to learn. Context should never change meaning.

#### P4.3: Validation Modes Explicit

Documents should be able to declare their expected validation strictness. This allows progressive formalization from rough drafts to validated models.

**Rationale:** Supports workshop capture (loose) through to production models (strict).

#### P4.4: No Hidden Defaults

Schema properties with meaningful choices (enums, type discriminators) must not have defaults. Users must explicitly specify values.

**Rationale:** Defaults hide options. Requiring explicit choice nudges users to consult help and understand alternatives. An analyst who types `kind: action` has learned that other kinds exist; one who relies on a default has not.

---

### P5: Schema Design Rules

**How to structure schema definitions.**

#### P5.1: Fragment Modularity

Each concept gets its own fragment file. Fragments must not cross-import except through shared common definitions.

**Rationale:** Clear ownership. Independent evolution. Manageable file sizes.

#### P5.2: Required Properties Minimal

Only properties essential for element identification should be required. Everything else optional.

**Rationale:** Low barrier to start. Enables progressive detail. Workshop-friendly.

#### P5.3: Enums Complete and Documented

Every enum must include all valid values, each with a description explaining its meaning and when to use it.

**Rationale:** Self-documenting schema. AI can understand options.

#### P5.4: Descriptions as Documentation

Schema descriptions must explain purpose and usage, not just restate the type. Include guidance on when and why to use the property.

**Rationale:** Schema is the primary documentation source. Users read schema tooltips.

---

### P6: Terminology

**Use language that consultants and analysts actually speak.**

#### P6.1: Business Vocabulary First

Property names, enum values, and documentation must use terms from business and consulting practice, not from software engineering or standards specifications.

**Rationale:** Users should recognize concepts immediately. No translation required.

#### P6.2: Avoid Jargon Without Context

When a technical term is unavoidable, the schema description must explain it in plain language with a business example.

**Rationale:** Consultants shouldn't need to look things up.

#### P6.3: Consistent Naming Across Schema

The same concept must use the same term everywhere. Create a controlled vocabulary and stick to it.

**Rationale:** Reduces cognitive load. Enables search and tooling.

---

### P7: Export Compatibility

**UBML is the source; formal standards are projections.**

#### P7.1: Lossless Round-Trip Not Required

Export to OMG standards (BPMN, ArchiMate, etc.) may lose information that the target notation cannot represent. This is acceptable.

**Rationale:** UBML captures richer context (stakeholder concerns, hypotheses, evidence) that formal notations don't support. Forcing parity would impoverish UBML.

#### P7.2: Import Should Enrich

When importing from formal standards, the schema should allow capturing additional context not present in the source.

**Rationale:** Consultants enhance imported models with observations and analysis.

#### P7.3: Mapping Documented

For each target standard, document which UBML concepts map and which are lost. Users must understand export trade-offs.

**Rationale:** No surprises. Consultants can plan what to capture in UBML vs. what to add post-export.

---

## Validation and Projection Principles

### P8: Semantic Validation Rules

**What the validator must check beyond structural schema.**

#### P8.1: Reference Integrity

All references must resolve to existing elements. Dangling references are errors.

#### P8.2: Type-Correct References

References must point to the correct element type. An actor reference must point to an actor, not an entity.

#### P8.3: Hierarchy Consistency

If a schema allows both parent and children (during migration), the validator must ensure they are consistent. Contradictions are errors.

#### P8.4: Global ID Uniqueness

All IDs must be globally unique across the entire workspace. Any ID can be referenced from anywhere without qualification.

#### P8.5: Cycle Detection

Hierarchical relationships must not contain cycles. The validator must detect and report circular references.

---

### P9: One Canonical Form

**Every concept has exactly one way to be expressed.**

#### P9.1: No Alternative Representations

For any given concept, the schema must define exactly one structure. No shorthands, no alternative syntaxes, no "you can also write it this way."

**Rationale:** One way to express a thing means one pattern to learn, one pattern to parse, one pattern to validate. Alternatives create cognitive load and tooling complexity.

**Example - Duration Format:**

The duration format is exactly `{number}{unit}` where units are:
- `min` - minutes (not `m`, not `minute`)
- `h` - hours (not `hr`, not `hour`)
- `d` - days (not `day`)
- `wk` - weeks (not `w`, not `week`)
- `mo` - months (not `month`)

Valid: `30min`, `2h`, `1.5d`, `1wk`, `3mo`  
Invalid: `30m`, `1h30m`, `PT30M`, `2 hours`

Use decimals for compound durations: `1.5h` (not `1h30m`).

#### P9.2: No Shorthand Properties

Do not provide abbreviated property names or condensed formats alongside full formats.

**Rationale:** Shorthands create two ways to express the same thing. Pick the clearer one and use it exclusively.

#### P9.3: Bare ID References

References to other elements use the element ID only, without file path qualification or wrapper syntax.

**Rationale:** Simple and readable. Global ID uniqueness makes this unambiguous.

#### P9.4: One Command Per Action (CLI)

The CLI must have exactly one command for each action. No aliases, no alternative spellings, no hidden synonyms.

**Rationale:** One canonical form applies to tooling, not just schema. Users should learn one vocabulary. Documentation stays simple. Tab-completion is unambiguous.

---

### P10: Projection-First Design

**Schema elements must map cleanly to formal standards (BPMN, ArchiMate, UML).**

UBML is designed for export to OMG standards. Schema design must preserve clean mappings.

#### P10.1: Element Types as Semantic Primitives

Core element types (step kinds, actor types) are semantic primitives that map directly to formal standard constructs. Each primitive should have a clear 1:1 mapping to BPMN and ArchiMate elements.

**Rationale:** Clean projection requires stable primitives. Adding primitives requires defining their projection to all target standards.

#### P10.2: Behavioral Richness via Properties

Model behavioral variations (approval, review, notification) using properties on primitives, not by creating new primitive types.

**Rationale:** Properties add richness without fragmenting the primitive set. Export logic stays simple: each primitive has one mapping.

#### P10.3: Avoid Standard-Specific Semantics

Do not embed semantics from one standard that conflict with another. Keep definitions generic where standards diverge.

**Rationale:** APQC, TOGAF, and ArchiMate define hierarchies differently. UBML provides mechanisms; users provide context-specific semantics.

#### P10.4: Separation of Modeling and Operational Concerns

Keep process modeling (roles, workflows) separate from operational data (staffing, instances). RACI references roles, not persons.

**Rationale:** BPMN lanes map to roles. ArchiMate separates Actor from Role. Mixing creates ambiguous projections.

#### P10.5: New Primitives Require Projection Mapping

Before adding any new enum value to a primitive type, document its projection to all supported standards (BPMN, ArchiMate, UML).

**Rationale:** Undocumented primitives create export ambiguity. No projection, no primitive.

---

## Evolution Principles

### P11: Language Clarity Over Compatibility

**UBML prioritizes a pristine, correct DSL over backward compatibility.**

#### P11.1: No Legacy Debt

The language must not carry design mistakes forward to avoid breaking changes. When a flaw is discovered, fix it.

**Rationale:** UBML is maturing. Accumulating legacy cruft now will permanently compromise the notation's clarity. Users can tolerate migrations; they cannot tolerate a confusing, inconsistent language.

#### P11.2: Versioned Breaking Changes

When a breaking change is necessary:

1. **Increment the version** — the version field in documents must change
2. **CLI detects mismatch** — tooling must refuse to process mismatched versions
3. **Interactive migration** — CLI provides an upgrade wizard that prompts for any information that cannot be automatically inferred
4. **No silent degradation** — old files must not parse with new tooling without explicit migration

**Rationale:** Explicit versions prevent silent corruption. Migration tooling reduces friction. Users control when they upgrade.

#### P11.3: Migration Tooling Required

Breaking changes require CLI migration support:

- Automated migration command with interactive prompts for ambiguous changes
- Dry-run mode to preview changes without applying
- Batch mode for CI that fails if human input would be required
- Clear diff output showing what changed and why

**Rationale:** Breaking changes are acceptable only if migration is automated. Never force manual file editing across a workspace.

---

## Principles Summary

| # | Principle | Constraint |
|---|-----------|------------|
| **P1** | Single Source of Truth | No redundant information |
| P1.1 | No Dual Hierarchy | Choose parent OR children, not both |
| P1.2 | No Redundant ID Declaration | ID in key only, not as property |
| P1.3 | No Computed Aggregations | Don't store derivable values |
| P1.4 | No Built-In Version Control | Use git for history/diffing |
| **P2** | Consistent Patterns | Same concept, same syntax |
| P2.1 | Uniform ID Patterns | Enforced prefixes and formats |
| P2.2 | Uniform Reference Syntax | Shared reference type definitions |
| P2.3 | Uniform Optional Behavior | null/empty = absent |
| **P3** | Hierarchy Through Structure | Nesting implies ownership |
| P3.1 | Nesting for Ownership | Contained elements nested |
| P3.2 | References for Cross-Cutting | Shared elements referenced |
| P3.3 | Maximum Nesting Depth | Flatten deep hierarchies |
| **P4** | Explicitness | Declare behavior, don't infer |
| P4.1 | Semantic Properties Required | Meaning is explicit |
| P4.2 | No Context-Dependent Defaults | Same default everywhere |
| P4.3 | Validation Modes Explicit | Document declares strictness |
| P4.4 | No Hidden Defaults | Choices require explicit values |
| **P5** | Schema Design Rules | How to write schemas |
| P5.1 | Fragment Modularity | One concept per file |
| P5.2 | Required Properties Minimal | Only identification required |
| P5.3 | Enums Complete | All values documented |
| P5.4 | Descriptions as Documentation | Explain purpose, not structure |
| **P6** | Terminology | Consultant vocabulary |
| P6.1 | Business Vocabulary First | Terms analysts actually use |
| P6.2 | Avoid Jargon | Plain language explanations |
| P6.3 | Consistent Naming | Same concept, same term |
| **P7** | Export Compatibility | Source format, not interchange |
| P7.1 | Lossless Round-Trip Not Required | Export may lose context |
| P7.2 | Import Should Enrich | Add context to imported models |
| P7.3 | Mapping Documented | Explicit export trade-offs |
| **P8** | Semantic Validation | What validator checks |
| P8.1 | Reference Integrity | All refs resolve |
| P8.2 | Type-Correct References | Ref matches target type |
| P8.3 | Hierarchy Consistency | Parent/children agree |
| P8.4 | Global ID Uniqueness | All IDs unique across workspace |
| P8.5 | Cycle Detection | No circular hierarchies |
| **P9** | One Canonical Form | One way to express each concept |
| P9.1 | No Alternative Representations | No multiple syntaxes |
| P9.2 | No Shorthand Properties | No abbreviated forms |
| P9.3 | Bare ID References | Simple ID, no qualification |
| P9.4 | One Command Per Action (CLI) | No aliases, no synonyms |
| **P10** | Projection-First Design | Clean mapping to formal standards |
| P10.1 | Element Types as Semantic Primitives | Kinds/types map 1:1 to BPMN/ArchiMate |
| P10.2 | Behavioral Richness via Properties | Properties, not new primitive types |
| P10.3 | Avoid Standard-Specific Semantics | No hardcoded APQC/TOGAF definitions |
| P10.4 | Separation of Modeling and Operational | Roles for process, persons for staffing |
| P10.5 | New Primitives Require Projection Mapping | Document all standard mappings first |
| **P11** | Language Clarity Over Compatibility | Pristine DSL, not backward compatibility |
| P11.1 | No Legacy Debt | Fix design mistakes, don't carry them forward |
| P11.2 | Versioned Breaking Changes | Explicit versions, CLI detects mismatch |
| P11.3 | Migration Tooling Required | Automated migration for breaking changes |


