# 19 — Refinement Questions

> **Status**: Proposed
> **Depends on**: 04 (semantic validation framework), 06 (CLI error messages architecture), 08 (schema discovery), 15 (VS Code integration)
> **Effort**: Large (multi-session, phased delivery)
> **Schema version**: 1.5+
> **References**: `docs/DESIGN-DECISIONS.md` (DD-011), `docs/PRINCIPLES.md` (P1.3, P4.3, P5.2, P5.4, P12.1, P12.7), Plan 06 F, Plan 08 C, Plan 18

---

## Goal

Build a **refinement question system** — a declarative, schema-driven mechanism that identifies missing or incomplete information in a workspace and surfaces human-friendly questions to guide progressive modeling.

Refinement questions are NOT validation errors. They are conversational prompts: "Who is responsible for this step?" not "Missing required property 'RACI'." They help analysts build richer models incrementally, starting from rough captures and working toward complete, evidence-backed models.

This system replaces the need for a `maturity` schema property (P1.3 — No Computed Aggregations). Maturity is **inferred** from how many refinement questions remain open, not stored in the model.

---

## Why This Matters

### The Progressive Modeling Gap

UBML's schema is deliberately strict (P5.2 — Required Properties Minimal). A process needs only `name` and `steps`; a step needs only `name` and `kind`. This is correct for capture friction (P12.1), but creates a gap: after initial capture, users don't know **what to refine next** or **what's most impactful**.

Today this gap is addressed by:
- `ubml doctor` (Plan 10 B) — workspace-level health diagnostics, not element-level guidance
- Manual review — requires expertise to know what's missing

**Note**: Plan 08 C originally proposed `ubml validate --suggest`, which this plan subsumes with the more comprehensive refinement question system.

Refinement questions close this gap with schema-declared, prioritized, element-scoped prompts that tooling can surface progressively.

### What This Enables

1. **Computed maturity** — Tooling reports element/workspace maturity as a percentage of answered questions, without a schema property (P1.3)
2. **AI-driven refinement** — LLM copilots compose dialog from structured questions, applying answers directly to the model
3. **Interactive CLI** — `ubml refine PR00001` walks through questions one at a time
4. **Team onboarding** — New analysts see exactly what needs attention without reading the whole model

---

## A. Schema Annotation Format (`x-ubml-questions`)

### A.1: Annotation Structure

Each schema type declares refinement questions using `x-ubml-questions` at the type level. These are **not** JSON Schema validation — they are metadata consumed by tooling.

```yaml
# In schemas/1.5/types/step.types.yaml

Step:
  type: object
  required: [name, kind]
  x-ubml-questions:
    - id: step.raci
      tier: 1
      property: RACI
      question: "Who is responsible for performing '{{name}}'?"
      context: "RACI assignment ensures clear accountability. Without it, process diagrams can't show swim lanes."
      condition:
        missing: RACI
      category: responsibility
      appliesWhen:
        kindNot: [start, end, milestone]

    - id: step.systems
      tier: 2
      property: systems
      question: "What systems or tools are used during '{{name}}'?"
      context: "System references enable application landscape mapping and integration analysis."
      condition:
        missing: systems
      category: systems

    - id: step.duration
      tier: 2
      property: duration
      question: "How long does '{{name}}' typically take?"
      context: "Duration enables cycle time analysis and simulation."
      condition:
        missing: duration
      category: performance
      appliesWhen:
        kindNot: [start, end, milestone]

    - id: step.inputs-outputs
      tier: 3
      property: [inputs, outputs]
      question: "What data does '{{name}}' consume or produce?"
      context: "Input/output mapping enables data flow diagrams and entity lifecycle tracking."
      condition:
        allMissing: [inputs, outputs]
      category: data-flow

    - id: step.derivedFrom
      tier: 3
      property: derivedFrom
      question: "What evidence supports the existence of '{{name}}'?"
      context: "Linking to insights creates an audit trail from model back to sources."
      condition:
        missing: derivedFrom
      category: provenance
```

### A.2: Annotation Schema

```yaml
# In schemas/1.5/defs/refinement.defs.yaml

$defs:
  RefinementQuestion:
    description: |
      A declarative refinement question attached to a schema type.
      Consumed by tooling to guide progressive modeling.
    type: object
    required: [id, tier, property, question, condition, category]
    properties:
      id:
        description: |
          Stable identifier for this question. Format: {type}.{topic}.
          Used for suppression, tracking, and deduplication.
        type: string
        pattern: "^[a-z]+\\.[a-z][a-z0-9-]*$"

      tier:
        description: |
          Priority tier (1 = most impactful, 3 = nice-to-have).
          Controls which questions surface first.
          
          Tier 1: Core modeling (RACI, owner, kind, type)
          Tier 2: Analytical value (duration, systems, KPIs, relationships)
          Tier 3: Traceability and evidence (derivedFrom, tags, descriptions)
        type: integer
        minimum: 1
        maximum: 3

      property:
        description: |
          The property or properties this question is about.
          Single string or array for multi-property questions.
        oneOf:
          - type: string
          - type: array
            items:
              type: string

      question:
        description: |
          Human-readable question text. Supports {{property}} interpolation
          from the element's existing properties (e.g., {{name}}).
        type: string

      context:
        description: |
          Why this information matters. Shown as supplementary guidance.
          Should mention what analysis or export this enables.
        type: string

      condition:
        description: |
          When this question is active. Evaluated against the element instance.
        type: object
        properties:
          missing:
            description: "Property name that must be absent/empty."
            type: string
          allMissing:
            description: "All listed properties must be absent/empty."
            type: array
            items:
              type: string
          anyMissing:
            description: "At least one listed property must be absent/empty."
            type: array
            items:
              type: string
          empty:
            description: "Property exists but is an empty array/object."
            type: string
          hasValue:
            description: "Property must have a specific value for this question to apply."
            type: object
            additionalProperties:
              oneOf:
                - type: string
                - type: array
                  items:
                    type: string

      category:
        description: |
          Thematic category for grouping questions in reports.
        type: string
        enum:
          - responsibility   # RACI, owner, accountability
          - systems          # IT systems, equipment, tools
          - performance      # Duration, effort, cost, KPIs
          - data-flow        # Inputs, outputs, entities
          - provenance       # derivedFrom, sources, evidence
          - structure        # Hierarchy, relationships, links
          - classification   # Type, kind, strategic importance
          - description      # Free-text descriptions, context

      appliesWhen:
        description: |
          Additional conditions based on element property values.
          Used to skip irrelevant questions (e.g., don't ask about
          duration for milestone steps).
        type: object
        properties:
          kindNot:
            type: array
            items:
              type: string
          kindIs:
            type: array
            items:
              type: string
          typeNot:
            type: array
            items:
              type: string
          typeIs:
            type: array
            items:
              type: string

      followUp:
        description: |
          Question ID(s) that become relevant after this one is answered.
          Creates a guided dialog flow.
        type: array
        items:
          type: string
```

### A.3: Placement in Schema Files

Questions are declared on the **type definition**, not on individual properties. This keeps question metadata colocated with the type's semantic intent.

**Files modified:**
- `schemas/1.5/types/step.types.yaml` — Step questions
- `schemas/1.5/types/actor.types.yaml` — Actor questions
- `schemas/1.5/types/process.types.yaml` — Process questions
- `schemas/1.5/types/entity.types.yaml` — Entity questions
- `schemas/1.5/types/knowledge.types.yaml` — Source, Insight questions
- `schemas/1.5/types/strategy.types.yaml` — Capability, ValueStream questions
- `schemas/1.5/types/metrics.types.yaml` — KPI questions
- `schemas/1.5/defs/refinement.defs.yaml` — Question schema definition (new)

---

## B. Concrete Question Catalog

### B.1: Actor Questions

```yaml
Actor:
  x-ubml-questions:
    - id: actor.description
      tier: 2
      property: description
      question: "What does '{{name}}' do in the organization?"
      context: "Descriptions help new team members understand the actor registry."
      condition:
        missing: description
      category: description

    - id: actor.party
      tier: 2
      property: party
      question: "Which organization or team does '{{name}}' belong to?"
      context: "Party hierarchy enables org chart views and ArchiMate export."
      condition:
        missing: party
      category: structure
      appliesWhen:
        typeNot: [organization]

    - id: actor.skills
      tier: 3
      property: skills
      question: "What skills does '{{name}}' have?"
      context: "Skills enable resource matching in simulation and gap analysis."
      condition:
        missing: skills
      category: classification
      appliesWhen:
        typeIs: [person, role]

    - id: actor.derivedFrom
      tier: 3
      property: derivedFrom
      question: "What evidence supports '{{name}}' as a distinct actor?"
      context: "Linking to insights creates traceability from actor registry back to interview data."
      condition:
        missing: derivedFrom
      category: provenance
```

### B.2: Process Questions

```yaml
Process:
  x-ubml-questions:
    - id: process.owner
      tier: 1
      property: owner
      question: "Who is accountable for '{{name}}' end-to-end?"
      context: "Process owner is the single point of accountability. Distinct from step-level RACI."
      condition:
        missing: owner
      category: responsibility

    - id: process.level
      tier: 1
      property: level
      question: "What level is '{{name}}'? (L1 strategic → L4 work instruction)"
      context: "Level determines how this process fits in the process architecture hierarchy."
      condition:
        missing: level
      category: classification

    - id: process.startsWith
      tier: 2
      property: startsWith
      question: "Which step(s) are the entry point(s) to '{{name}}'?"
      context: "Start/end points enable BPMN export and control flow validation."
      condition:
        missing: startsWith
      category: structure

    - id: process.endsWith
      tier: 2
      property: endsWith
      question: "Which step(s) are the exit point(s) of '{{name}}'?"
      context: "Start/end points enable BPMN export and control flow validation."
      condition:
        missing: endsWith
      category: structure

    - id: process.links
      tier: 1
      property: links
      question: "How do the steps in '{{name}}' connect to each other?"
      context: "Links define the flow. Without them, steps are isolated nodes with no sequence."
      condition:
        missing: links
      category: structure

    - id: process.derivedFrom
      tier: 3
      property: derivedFrom
      question: "What evidence supports the existence of '{{name}}'?"
      context: "Linking to insights creates an audit trail."
      condition:
        missing: derivedFrom
      category: provenance
```

### B.3: Entity Questions

```yaml
Entity:
  x-ubml-questions:
    - id: entity.attributes
      tier: 2
      property: attributes
      question: "What data fields does '{{name}}' have?"
      context: "Attributes define the entity's structure for data modeling and system integration."
      condition:
        missing: attributes
      category: data-flow

    - id: entity.relationships
      tier: 2
      property: relationships
      question: "How does '{{name}}' relate to other entities?"
      context: "Relationships enable ER diagrams and data lineage analysis."
      condition:
        missing: relationships
      category: structure

    - id: entity.system
      tier: 2
      property: system
      question: "In which system is '{{name}}' mastered?"
      context: "Master system identification is critical for integration planning."
      condition:
        missing: system
      category: systems

    - id: entity.derivedFrom
      tier: 3
      property: derivedFrom
      question: "What evidence supports '{{name}}' as a distinct entity?"
      context: "Linking to insights creates traceability."
      condition:
        missing: derivedFrom
      category: provenance
```

### B.4: KPI Questions

```yaml
KPI:
  x-ubml-questions:
    - id: kpi.target
      tier: 1
      property: target
      question: "What is the target value for '{{name}}'?"
      context: "A KPI without a target is just a metric. Targets enable performance evaluation."
      condition:
        missing: target
      category: performance

    - id: kpi.baseline
      tier: 2
      property: baseline
      question: "What is the current (as-is) value for '{{name}}'?"
      context: "Baseline enables gap analysis and improvement measurement."
      condition:
        missing: baseline
      category: performance

    - id: kpi.process
      tier: 1
      property: [process, step]
      question: "Which process or step does '{{name}}' measure?"
      context: "Linking KPIs to processes/steps enables performance dashboards per process."
      condition:
        allMissing: [process, step]
      category: structure

    - id: kpi.owner
      tier: 2
      property: owner
      question: "Who is responsible for tracking '{{name}}'?"
      context: "KPI ownership ensures someone is accountable for measurement and improvement."
      condition:
        missing: owner
      category: responsibility

    - id: kpi.source
      tier: 2
      property: source
      question: "What system produces the data for '{{name}}'?"
      context: "Data source identification enables automated measurement and data quality assessment."
      condition:
        missing: source
      category: systems
```

### B.5: Insight Questions

```yaml
Insight:
  x-ubml-questions:
    - id: insight.source
      tier: 1
      property: source
      question: "Where did '{{text}}' come from?"
      context: "Source linkage enables provenance tracking. Without it, the insight is unverifiable."
      condition:
        missing: source
      category: provenance

    - id: insight.kind
      tier: 1
      property: kind
      question: "What kind of knowledge is '{{text}}'? (pain, opportunity, decision, risk...)"
      context: "Classification enables filtering insights by type for analysis."
      condition:
        missing: kind
      category: classification

    - id: insight.about
      tier: 2
      property: about
      question: "What element(s) does '{{text}}' relate to?"
      context: "About-references connect insights to the model elements they inform."
      condition:
        missing: about
      category: structure

    - id: insight.status
      tier: 2
      property: status
      question: "Has '{{text}}' been validated, or is it still proposed?"
      context: "Status tracking prevents stale or disputed insights from driving decisions."
      condition:
        missing: status
      category: classification
```

### B.6: Capability Questions

```yaml
Capability:
  x-ubml-questions:
    - id: capability.processes
      tier: 1
      property: processes
      question: "Which processes implement '{{name}}'?"
      context: "Process linkage closes the strategy-to-execution gap."
      condition:
        missing: processes
      category: structure

    - id: capability.maturity
      tier: 2
      property: maturity
      question: "What is the current maturity level of '{{name}}'? (1=Initial to 5=Optimizing)"
      context: "Maturity assessment enables gap analysis and investment prioritization."
      condition:
        missing: maturity
      category: classification

    - id: capability.strategicImportance
      tier: 2
      property: strategicImportance
      question: "How strategically important is '{{name}}'? (differentiating, essential, commodity)"
      context: "Strategic importance drives sourcing decisions and investment allocation."
      condition:
        missing: strategicImportance
      category: classification

    - id: capability.owner
      tier: 2
      property: owner
      question: "Who owns '{{name}}'?"
      context: "Capability ownership ensures accountability for development and maintenance."
      condition:
        missing: owner
      category: responsibility
```

---

## C. TypeScript Interface and Runtime Engine

### C.1: Core Types

```typescript
// src/refinement.ts

/**
 * A refinement question instance — a specific question about a specific element.
 */
export interface RefinementQuestion {
  /** Stable question definition ID (e.g., "step.raci") */
  questionId: string;

  /** Priority tier (1 = most impactful) */
  tier: 1 | 2 | 3;

  /** The element this question is about */
  element: {
    /** Element ID (e.g., "ST00001") */
    id: string;
    /** Element type (e.g., "Step") */
    type: string;
    /** Element name for display */
    name: string;
    /** File where the element is defined */
    filepath: string;
    /** JSON path within the file */
    path: string;
  };

  /** The property or properties to fill in */
  property: string | string[];

  /** Human-readable question text (interpolated) */
  question: string;

  /** Why this information matters */
  context: string;

  /** Thematic category */
  category: RefinementCategory;

  /** Question IDs that become relevant after this is answered */
  followUp?: string[];
}

export type RefinementCategory =
  | 'responsibility'
  | 'systems'
  | 'performance'
  | 'data-flow'
  | 'provenance'
  | 'structure'
  | 'classification'
  | 'description';

/**
 * Result of refinement analysis on a workspace.
 */
export interface RefinementResult {
  /** All active questions, sorted by tier then category */
  questions: RefinementQuestion[];

  /** Maturity summary */
  maturity: MaturitySummary;
}

/**
 * Computed maturity metrics (P1.3 compliant — never stored in schema).
 */
export interface MaturitySummary {
  /** Overall workspace maturity (0.0 – 1.0) */
  overall: number;

  /** Per-element-type maturity */
  byType: Record<string, {
    total: number;
    answered: number;
    ratio: number;
  }>;

  /** Per-tier completion */
  byTier: Record<1 | 2 | 3, {
    total: number;
    answered: number;
    ratio: number;
  }>;

  /** Per-category breakdown */
  byCategory: Record<RefinementCategory, {
    total: number;
    answered: number;
    ratio: number;
  }>;
}
```

### C.2: Question Engine

```typescript
// src/refinement-engine.ts

import type { RefinementQuestion, RefinementResult, MaturitySummary } from './refinement.js';
import type { UBMLDocument } from './parser.js';

/**
 * Raw question definition from schema x-ubml-questions annotation.
 */
interface QuestionDefinition {
  id: string;
  tier: 1 | 2 | 3;
  property: string | string[];
  question: string;
  context: string;
  condition: {
    missing?: string;
    allMissing?: string[];
    anyMissing?: string[];
    empty?: string;
    hasValue?: Record<string, string | string[]>;
  };
  category: string;
  appliesWhen?: {
    kindNot?: string[];
    kindIs?: string[];
    typeNot?: string[];
    typeIs?: string[];
  };
  followUp?: string[];
}

/**
 * Registry of question definitions loaded from schema annotations.
 * Populated at build time by the code generator.
 */
export type QuestionRegistry = Map<string, QuestionDefinition[]>;

/**
 * Evaluate whether a question's condition is active for an element.
 */
function isConditionActive(
  condition: QuestionDefinition['condition'],
  element: Record<string, unknown>
): boolean {
  if (condition.missing) {
    const val = element[condition.missing];
    if (val !== undefined && val !== null && val !== '') return false;
    if (Array.isArray(val) && val.length > 0) return false;
  }

  if (condition.allMissing) {
    const allEmpty = condition.allMissing.every(prop => {
      const val = element[prop];
      return val === undefined || val === null || val === '' ||
        (Array.isArray(val) && val.length === 0);
    });
    if (!allEmpty) return false;
  }

  if (condition.anyMissing) {
    const anyEmpty = condition.anyMissing.some(prop => {
      const val = element[prop];
      return val === undefined || val === null || val === '' ||
        (Array.isArray(val) && val.length === 0);
    });
    if (!anyEmpty) return false;
  }

  if (condition.empty) {
    const val = element[condition.empty];
    if (val === undefined || val === null) return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === 'object' && Object.keys(val as object).length === 0) return true;
    return false;
  }

  if (condition.hasValue) {
    for (const [prop, expected] of Object.entries(condition.hasValue)) {
      const val = element[prop];
      if (Array.isArray(expected)) {
        if (!expected.includes(String(val))) return false;
      } else {
        if (String(val) !== expected) return false;
      }
    }
  }

  return true;
}

/**
 * Check if appliesWhen constraints are satisfied.
 */
function appliesWhenSatisfied(
  appliesWhen: QuestionDefinition['appliesWhen'],
  element: Record<string, unknown>
): boolean {
  if (!appliesWhen) return true;

  if (appliesWhen.kindNot && appliesWhen.kindNot.includes(String(element.kind))) return false;
  if (appliesWhen.kindIs && !appliesWhen.kindIs.includes(String(element.kind))) return false;
  if (appliesWhen.typeNot && appliesWhen.typeNot.includes(String(element.type))) return false;
  if (appliesWhen.typeIs && !appliesWhen.typeIs.includes(String(element.type))) return false;

  return true;
}

/**
 * Interpolate template variables in question text.
 */
function interpolate(template: string, element: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = element[key];
    if (typeof val === 'string') return val;
    if (val === undefined || val === null) return `(unnamed)`;
    return String(val);
  });
}

/**
 * Analyze a workspace and return all active refinement questions.
 */
export function analyzeRefinement(
  documents: UBMLDocument[],
  registry: QuestionRegistry
): RefinementResult {
  const questions: RefinementQuestion[] = [];
  let totalPossible = 0;
  let totalAnswered = 0;

  for (const doc of documents) {
    // Walk the document tree looking for elements that have question definitions
    walkElements(doc, registry, (elementId, elementType, element, filepath, path, defs) => {
      for (const def of defs) {
        totalPossible++;

        if (!appliesWhenSatisfied(def.appliesWhen, element)) {
          totalAnswered++; // N/A counts as answered
          continue;
        }

        if (!isConditionActive(def.condition, element)) {
          totalAnswered++; // Already filled in
          continue;
        }

        questions.push({
          questionId: def.id,
          tier: def.tier,
          element: {
            id: elementId,
            type: elementType,
            name: String(element.name ?? element.text ?? elementId),
            filepath,
            path,
          },
          property: def.property,
          question: interpolate(def.question, element),
          context: def.context,
          category: def.category as RefinementQuestion['category'],
          followUp: def.followUp,
        });
      }
    });
  }

  // Sort: tier ascending, then category alphabetical
  questions.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.category.localeCompare(b.category);
  });

  const maturity = computeMaturity(questions, totalPossible, totalAnswered);

  return { questions, maturity };
}
```

### C.3: Build-Time Integration

The code generator (`scripts/generate/`) extracts `x-ubml-questions` from schema files and emits a `src/generated/questions.ts` module:

```typescript
// src/generated/questions.ts (auto-generated, never edit)

import type { QuestionRegistry } from '../refinement-engine.js';

export const QUESTION_REGISTRY: QuestionRegistry = new Map([
  ['Step', [
    { id: 'step.raci', tier: 1, property: 'RACI', question: "Who is responsible for performing '{{name}}'?", ... },
    { id: 'step.systems', tier: 2, property: 'systems', question: "What systems or tools are used during '{{name}}'?", ... },
    // ...
  ]],
  ['Actor', [
    { id: 'actor.description', tier: 2, property: 'description', ... },
    // ...
  ]],
  // ... all types
]);
```

**Files modified:**
- `scripts/generate/extract-questions.ts` — New generator script
- `scripts/generate/index.ts` — Add question extraction to build pipeline
- `src/generated/questions.ts` — Generated output (never edit)

---

## D. Two Surfaces

**Note**: Refinement questions are surfaced through ESLint and CLI only. IDE tooltip integration via schema enhancement would require publishing modified schemas to GitHub Pages, adding unnecessary complexity. A future custom VS Code extension could provide richer IDE integration if needed.

### D.1: ESLint Rules (Inline Warnings)

New ESLint rule `ubml/refinement-questions` that emits warnings for active refinement questions:

```typescript
// src/eslint/rules/refinement-questions.ts

export const refinementQuestionsRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Surface refinement questions for incomplete elements',
      category: 'Best Practices',
      recommended: false, // Opt-in, not auto-enabled
    },
    messages: {
      refinementQuestion: '[Tier {{tier}}] {{question}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxTier: {
            type: 'number',
            description: 'Maximum tier to surface (1-3). Default: 2',
            default: 2,
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Categories to include. Default: all',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  // ... implementation uses QUESTION_REGISTRY
};
```

**Configuration in `.eslintrc` / `eslint.config.js`:**

```javascript
{
  rules: {
    'ubml/refinement-questions': ['warn', { maxTier: 1 }], // Only tier 1 in CI
  }
}
```

**Files modified:**
- `src/eslint/rules/refinement-questions.ts` — New rule
- `src/eslint/plugin.ts` — Register new rule
- `src/eslint/index.ts` — Export new rule

### D.2: CLI Validation Output

Three CLI integration points:

#### `ubml validate --refine`

Appends refinement questions to validation output:

```
$ ubml validate .

✓ 12 files validated, 0 errors, 3 warnings

Refinement Questions (23 open — 67% mature):

  Tier 1 (8 open — most impactful):
    PR00001 "Order Fulfillment"
      → Who is accountable for 'Order Fulfillment' end-to-end?
      → How do the steps connect to each other?
    ST00003 "Review Purchase Order"
      → Who is responsible for performing 'Review Purchase Order'?
    KP00001 "Cycle Time"
      → Which process or step does 'Cycle Time' measure?
    ...

  Tier 2 (10 open):
    ST00003 → What systems are used during 'Review Purchase Order'?
    ...

  Run 'ubml refine PR00001' for interactive refinement.
```

#### `ubml refine <id>` (new command)

Interactive, element-scoped refinement dialog:

```
$ ubml refine PR00001

Refining: PR00001 "Order Fulfillment" (process.ubml.yaml)
3 questions remaining (Tier 1: 2, Tier 2: 1)

[1/3] Who is accountable for 'Order Fulfillment' end-to-end?
      Context: Process owner is the single point of accountability.
      Property: owner (ActorRef)
      Available actors: AC00001 (Sales Manager), AC00002 (Ops Lead), ...
> AC00002

✓ Set PR00001.owner = AC00002

[2/3] How do the steps in 'Order Fulfillment' connect to each other?
      Context: Links define the flow.
      Property: links
      This requires manual editing. Opening file...
> skip

[3/3] Which step(s) are the entry point(s) to 'Order Fulfillment'?
      Property: startsWith (StepRef[])
      Steps in this process: ST00001 (Receive Order), ST00002 (Validate), ...
> ST00001

✓ Set PR00001.startsWith = [ST00001]

Done! PR00001 maturity: 42% → 58%
```

#### `ubml report maturity`

Workspace maturity dashboard:

```
$ ubml report maturity

Workspace Maturity: 67%

By Type:
  Processes:    ████████░░  78% (7 of 9 questions answered)
  Steps:        ██████░░░░  62% (31 of 50)
  Actors:       █████████░  90% (18 of 20)
  KPIs:         ████░░░░░░  40% (4 of 10)
  Entities:     ███░░░░░░░  33% (3 of 9)

By Tier:
  Tier 1 (core):  ████████░░  82%
  Tier 2 (analysis): ██████░░░░  60%
  Tier 3 (trace):    ████░░░░░░  45%

By Category:
  responsibility:  █████████░  91%
  structure:       ███████░░░  72%
  systems:         █████░░░░░  55%
  performance:     ████░░░░░░  42%
  provenance:      ██░░░░░░░░  25%
```

**Files modified:**
- `src/cli/commands/validate.ts` — Add `--refine` flag
- `src/cli/commands/refine.ts` — New command
- `src/cli/commands/report.ts` — Add `maturity` subcommand
- `src/cli/formatters/refinement.ts` — Formatting for CLI output

---

## E. Conversation-Ready Output

### E.1: Structured JSON Output

All surfaces emit refinement questions in a structured format for tool consumption:

```typescript
/**
 * Machine-readable refinement output for tooling integration.
 */
export interface RefinementOutput {
  /** Schema version */
  schemaVersion: string;

  /** Questions grouped by element */
  elements: {
    id: string;
    type: string;
    name: string;
    filepath: string;
    path: string;
    questions: {
      questionId: string;
      tier: 1 | 2 | 3;
      property: string | string[];
      question: string;
      context: string;
      category: string;
      /** Expected value type for the property */
      valueType: 'ActorRef' | 'ActorRef[]' | 'string' | 'number' | 'enum' | 'complex';
      /** For enum types, the allowed values */
      allowedValues?: string[];
      /** For ref types, available IDs in workspace */
      availableRefs?: { id: string; name: string }[];
    }[];
  }[];

  /** Overall maturity */
  maturity: MaturitySummary;
}
```

CLI outputs this with `--format=json`:

```bash
ubml validate --refine --format=json > refinement.json
```

### E.2: AI Copilot Integration

The structured output is designed for LLM consumption. An AI assistant can:

1. Read the refinement JSON
2. Pick the highest-tier unanswered question
3. Ask the user in natural language
4. Map the answer to a YAML edit
5. Apply the edit and move to the next question

Example prompt template for AI tooling:

```
The following UBML element needs refinement:

Element: {{element.id}} "{{element.name}}" ({{element.type}})
File: {{element.filepath}}

Question: {{question.question}}
Context: {{question.context}}
Property to fill: {{question.property}}
Expected type: {{question.valueType}}
{{#if question.availableRefs}}
Available references: {{question.availableRefs}}
{{/if}}

Ask the user this question and apply their answer to the YAML file.
```

---

## F. Maturity Inference (Replaces Schema Property)

### F.1: Why Not a `maturity` Property

Per P1.3 (No Computed Aggregations), maturity is never stored in the schema. It is **computed** from refinement question completion:

```
Element maturity = (answered questions) / (applicable questions)
Type maturity    = average of element maturities for that type
Workspace maturity = weighted average across all types
```

Tier weights (configurable):
- Tier 1: weight 3
- Tier 2: weight 2
- Tier 3: weight 1

This means:
- A process with `name`, `steps`, `owner`, `links`, `startsWith`, `endsWith` = high maturity
- A process with only `name` and `steps` = low maturity
- Maturity is always current — no stale computed values

### F.2: Relationship to `Capability.maturity`

`Capability.maturity` is a **user-assessed** organizational maturity level (CMM 1-5), not a model completeness metric. It stays in the schema. Refinement question maturity is orthogonal — it measures **how well the capability is documented**, not how mature the capability itself is.

---

## G. Design Constraints and Decisions

### G.1: Schema Stays Strict

Refinement questions do NOT relax the schema. Required properties remain required. The question system operates **above** schema validation — it's about completeness, not correctness.

Schema: "Is this valid YAML that conforms to the type definition?" → Pass/fail
Refinement: "Is this element well-modeled enough for analysis?" → Progressive

### G.2: `step.kind` Stays Required

`kind` is projection-critical (P10.1). Every step must declare its kind. This is NOT a refinement question — it's a schema requirement. The question system only addresses truly optional properties.

### G.3: `actor.kind` Should Be Removed

`actor.kind` (`human`, `org`, `system`) is derivable from `actor.type`:
- `system` → `system`
- `person`, `role`, `team` → `human`
- `organization`, `external`, `customer` → `org`

This should be resolved in a schema change (Plan 01 or separate) before refinement questions ship, so there's no question for a derivable property. If `kind` remains, it should NOT have a refinement question (P1.3 applies — don't ask users for computable values).

### G.4: `process.steps` Should Become Optional

Currently `steps` is required on Process. For placeholder processes (L1 strategic, early capture), requiring steps creates friction. Making `steps` optional enables:

```yaml
PR00001:
  name: "Order Fulfillment"
  level: 1
  # Steps will be added as the process is detailed
```

Then the refinement system asks: "What are the steps in 'Order Fulfillment'?" at tier 1.

This change should be made in the schema before or alongside this plan.

### G.5: No `validation: draft` Relaxation

Plan 00 D5 proposed validation strictness levels. Refinement questions provide a better answer to the same problem: instead of relaxing validation, keep validation strict and use refinement questions to guide progressive enrichment. The schema is always valid; the model is progressively refined.

If D5 strictness levels are still implemented (Plan 04 E), refinement questions are orthogonal — they work at any strictness level.

### G.6: Principle Compliance

| Principle | How refinement questions comply |
|-----------|-------------------------------|
| P1.3 No Computed Aggregations | Maturity is computed at query time, never stored |
| P4.4 No Hidden Defaults | Questions don't introduce defaults — they surface missing optional info |
| P5.2 Required Properties Minimal | Questions guide enrichment of optional properties |
| P5.4 Descriptions as Documentation | Question `context` explains why each property matters |
| P12.1 Minimal Capture Friction | Questions come AFTER capture, not during |
| P9.1 No Alternative Representations | Questions point to the one correct property to fill |

---

## Checklist

### Phase 1: Schema Annotations & Generator

- [ ] Define `RefinementQuestion` annotation schema in `schemas/1.5/defs/refinement.defs.yaml`
- [ ] Add `x-ubml-questions` to Step schema (`schemas/1.5/types/step.types.yaml`)
- [ ] Add `x-ubml-questions` to Actor schema (`schemas/1.5/types/actor.types.yaml`)
- [ ] Add `x-ubml-questions` to Process schema (`schemas/1.5/types/process.types.yaml`)
- [ ] Add `x-ubml-questions` to Entity schema (`schemas/1.5/types/entity.types.yaml`)
- [ ] Add `x-ubml-questions` to Insight/Source schema (`schemas/1.5/types/knowledge.types.yaml`)
- [ ] Add `x-ubml-questions` to Capability/ValueStream schema (`schemas/1.5/types/strategy.types.yaml`)
- [ ] Add `x-ubml-questions` to KPI schema (`schemas/1.5/types/metrics.types.yaml`)
- [ ] Create `scripts/generate/extract-questions.ts` — extract questions from schemas
- [ ] Add question extraction to `scripts/generate/index.ts` build pipeline
- [ ] Generate `src/generated/questions.ts` with question registry
- [ ] Run `npm run generate` and verify output

### Phase 2: Runtime Engine

- [ ] Create `src/refinement.ts` — Core types (`RefinementQuestion`, `RefinementResult`, `MaturitySummary`)
- [ ] Create `src/refinement-engine.ts` — Condition evaluation, question instantiation, maturity computation
- [ ] Export from `src/index.ts` for SDK consumers
- [ ] Unit tests for condition evaluation (missing, allMissing, anyMissing, empty, hasValue)
- [ ] Unit tests for `appliesWhen` filtering (kindNot, kindIs, typeNot, typeIs)
- [ ] Unit tests for template interpolation
- [ ] Unit tests for maturity computation
- [ ] Integration test: analyze example workspace, verify expected questions

### Phase 3: CLI Integration

- [ ] Add `--refine` flag to `ubml validate` command
- [ ] Create `src/cli/commands/refine.ts` — Interactive refinement dialog
- [ ] Create `src/cli/formatters/refinement.ts` — CLI output formatting
- [ ] Add `maturity` subcommand to `ubml report`
- [ ] Add `--format=json` support for machine-readable refinement output
- [ ] Tests for CLI output formatting
- [ ] Tests for interactive refinement flow

### Phase 4: ESLint Rule

- [ ] Create `src/eslint/rules/refinement-questions.ts`
- [ ] Register in `src/eslint/plugin.ts`
- [ ] Export from `src/eslint/index.ts`
- [ ] Add `maxTier` and `categories` configuration options
- [ ] Tests for ESLint rule
- [ ] Document configuration in ESLint plugin README

### Phase 5: Documentation

- [ ] Add design rationale to `docs/DESIGN-DECISIONS.md`
- [ ] Document `ubml refine` in CLI reference (Plan 12)
- [ ] Document `ubml report maturity` in CLI reference
- [ ] Document ESLint rule configuration
- [ ] Add refinement questions concept to `docs/` (Plan 14)

---

## Design Notes

### Why Schema-Declared, Not Hardcoded

Plan 06 F identified the problem: hints like "goals belong in strategy, not process" are hardcoded in `validation-errors.ts`. Refinement questions solve this by moving semantic guidance into schema annotations. When the schema evolves, questions evolve with it. No TypeScript code changes needed to add, modify, or remove questions.

### Why Not JSON Schema `if/then`

JSON Schema conditional validation (`if/then/else`) could technically express "if RACI is missing, warn." But:
1. No standard for conditional **suggestions** (only errors/warnings)
2. Over-constrains editors that treat schema violations as errors
3. Conflates structural validation with modeling guidance
4. No way to express tiers, categories, or conversation flow

`x-ubml-questions` is a custom annotation that lives alongside but separate from structural validation.

### Why Tiers Instead of Numeric Priority

Three tiers (not 1-100 priority scores) because:
1. Simple to understand and configure ("show me tier 1 only")
2. Avoids false precision in priority ordering
3. Maps to natural workflow stages: capture → analyze → trace
4. Easy to filter in ESLint config (`maxTier: 1` for CI)

### Why `appliesWhen` Instead of Complex Conditions

`appliesWhen` handles the most common filtering case: skip questions based on element `kind` or `type`. More complex conditions (e.g., "ask about approval only if step has kind=action and systems include ERP") are deferred. Start simple, extend if needed.

### Relationship to Plan 08 C (`--suggest`)

Plan 08 C proposes `ubml validate --suggest` for proactive advice. Refinement questions **subsume** this — `--suggest` becomes `--refine`. The suggest mode from Plan 08 C can be implemented as a thin wrapper that emits only tier-1 refinement questions. If Plan 08 C ships first, Plan 19 replaces its internals with the question engine.

### Question ID Stability

Question IDs (`step.raci`, `process.owner`, etc.) are stable across schema versions. They form a contract for tooling that tracks question history. Renaming a question ID requires a migration note. Adding new questions is always safe.

### Future: Cross-Element Questions

Phase 1 covers single-element questions ("this step is missing RACI"). Future extensions could add cross-element questions:
- "Process PR00001 has no KPIs measuring it" (KPI→Process linkage)
- "Actor AC00005 is defined but never appears in any RACI" (workspace-level)
- "Source SR00001 has no insights derived from it" (knowledge chain completeness)

These require workspace-level analysis (Plan 04 semantic validation) and would be implemented as a separate question source alongside schema-declared questions.
