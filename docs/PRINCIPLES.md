# UBML Language Design Principles

> Binding constraints for designing the UBML notation.
> These principles govern the abstractions, vocabulary, and structure of the language — not tooling or implementation.

---

## Purpose

This document defines **binding constraints** for UBML language design. When designing new abstractions, refining existing ones, or evaluating proposed changes, these principles must be followed. Violations indicate a design flaw that must be resolved before the change is accepted.

The goal is a **focused, coherent notation** that serves its purpose: enabling business consultants to model how organizations create and deliver value.

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

#### P1.5: Typed References for Modeled Concepts

When a property refers to a concept that has its own element type in the workspace, it must use the typed reference for that element type. String alternatives must not be provided.

**Rationale:** A string and a typed reference to the same real-world thing create parallel identity systems. Strings cannot be traced, validated, deduplicated, or queried. If the workspace models a concept, every reference to that concept must go through the model.

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

#### P3.4: Domain-Based File Organization

When splitting models across multiple files, organize by business domain (customer-service, order-management) rather than by element type (all processes together, all actors together).

**Rationale:** Domain organization keeps related concepts together, making it easier to understand a business area holistically. Type-based organization scatters domain knowledge across the workspace.

#### P3.5: Coherent Model Boundaries

Each file should represent a coherent, understandable unit. A process file should cover one workflow that can be understood in a single reading. If a model grows too large to comprehend, split by subprocess boundaries.

**Rationale:** Models exist to communicate understanding. A model too large to hold in working memory fails its purpose. Splitting should follow natural business boundaries, not arbitrary size limits.

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

#### P4.3: Schema Always Fully Validated

The schema is always strictly validated — there are no modes that suppress errors. A model with only required fields is structurally correct. Progressive formalization comes from guided refinement of optional properties, not from relaxing what the schema enforces.

**Rationale:** Validation modes hide problems instead of guiding improvement. A model missing optional fields is valid but incomplete — tooling should tell the user what to add next, not pretend errors don't exist.

#### P4.4: No Hidden Defaults

Schema properties with meaningful choices (enums, type discriminators) must not have defaults. Users must explicitly specify values. Property absence must not carry semantic meaning beyond "not specified."

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

If a schema allows both parent and children, the validator must ensure they are consistent. Contradictions are errors.

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

Formatted values (durations, references, expressions) must have exactly one canonical syntax defined in the schema. See schema documentation for current format specifications.

#### P9.2: No Shorthand Properties

Do not provide abbreviated property names or condensed formats alongside full formats.

**Rationale:** Shorthands create two ways to express the same thing. Pick the clearer one and use it exclusively.

#### P9.3: Bare ID References

References to other elements use the element ID only, without file path qualification or wrapper syntax.

**Rationale:** Simple and readable. Global ID uniqueness makes this unambiguous.

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

### P11: Language Clarity and Precision

**UBML prioritizes a pristine, correct DSL.**

#### P11.1: Fix Design Flaws Immediately

The language must not carry design mistakes forward. When a flaw is discovered, fix it.

**Rationale:** Accumulating compromises will permanently damage the notation's clarity. A confusing, inconsistent language is worse than any short-term inconvenience.

#### P11.2: Versioned Schema

All UBML documents declare their schema version. Tooling must refuse to process documents with an unrecognized version.

**Rationale:** Explicit versions prevent silent corruption and ensure tooling and documents stay in sync.

#### P11.3: Future Schema Evolution

When future schema versions introduce incompatible changes:

- Automated migration command with interactive prompts for ambiguous changes
- Dry-run mode to preview changes without applying
- Batch mode for CI that fails if human input would be required
- Clear diff output showing what changed and why

**Rationale:** Schema evolution must be automated. Never force manual file editing across a workspace.

---

### P12: Knowledge Capture

**The workspace must serve as a living knowledge base with minimal friction for adding information.**

UBML workspaces are long-lived (5+ years) digital twins of organizations. They must continuously absorb new information from interviews, workshops, documents, observations, research, surveys, and corridor conversations. The language must make it trivially easy to catalog information and extract structured insights.

#### P12.1: Minimal Capture Friction

Users must be able to record knowledge with as little structure as they have at the moment of capture. A consultant who hears a key fact in a meeting should be able to add it to the workspace in seconds, not minutes. Structure guides, never blocks.

**Rationale:** If the barrier to recording information is higher than writing it on a napkin, consultants will use the napkin. The tool must be faster than alternatives for capturing knowledge. Tooling should guide users from minimal capture toward complete models — but the guidance comes after capture, never during it.

#### P12.2: Catalog, Not Container

The workspace catalogs where information lives, not the information itself. Large artifacts (recordings, PDFs, transcripts) live externally; the workspace stores just enough metadata to find them later.

**Rationale:** Git repos should stay small. Knowledge sources are diverse and large. The workspace needs to know what exists and where to find it, not store everything.

#### P12.3: Append-Friendly Knowledge

Knowledge accumulates over time. Changed understanding supersedes previous knowledge with explicit references to what it replaces. The full history of organizational understanding is preserved, never deleted.

**Rationale:** Long-lived workspaces will accumulate thousands of knowledge entries. The structure must handle growth gracefully. Deleting knowledge destroys audit trails and breaks traceability.

#### P12.4: Layered Truth

The workspace separates raw information, derived knowledge, and interpreted models into distinct layers. Each layer references the one below for traceability, enabling auditing of why the model looks the way it does.

**Rationale:** Separating raw information from interpretation prevents mixing opinion with observation. Traceability enables stakeholders to challenge conclusions by following the chain back to original sources.

#### P12.5: Context Over Precision

Derived knowledge carries human-readable context (who, when, about what, how confident) rather than precise mechanical pointers (line numbers, timestamps). Context survives editing, reformatting, and the passage of time. Precise pointers do not.

**Rationale:** A consultant reading a knowledge entry 3 years after it was captured needs to understand its provenance at a glance, not chase brittle references in a document that may have been reformatted.

#### P12.6: Single Provenance Path

All knowledge provenance must flow through the formal chain: Source → Insight → Model. Schema types must not provide alternative provenance mechanisms (free-text citation fields, inline source references, shortcut attribution) that bypass this chain.

**Rationale:** Parallel provenance paths fragment knowledge management. Free-text citations can't be traced, validated, or queried. If the formal chain has too much friction, fix the chain (P12.1) — don't add a side channel.

#### P12.7: Progressive Refinement Through Questions

Schema consistency is never relaxed to lower the capture barrier. Instead, missing optional information is surfaced as human-friendly questions that guide the user toward a more complete model. Tooling presents questions progressively — prioritized by impact — not all at once.

The primary input pattern is unstructured content (meeting transcripts, interview notes, anecdotes) that tooling structures into the model. Conflicting information from different sources is expected and tracked through the knowledge layer, not rejected.

Model completeness is always derived from what's present in the workspace, never stored as a property (P1.3). The workspace grows from rough fragments to a complete model through guided refinement, not through mode switches.

**Rationale:** Consultants work with messy, contradictory, incomplete information. A tool that rejects this reality will not be used. Questions drive improvement better than errors — they tell users what to do, not just what's wrong.
