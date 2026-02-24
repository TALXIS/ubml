# UBML - Unified Business Modeling Language

[![npm version](https://img.shields.io/npm/v/ubml.svg)](https://www.npmjs.com/package/ubml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**A notation for understanding how organizations create and deliver value.**

UBML is a YAML-based format for capturing business processes, organizational structures, and strategic initiatives. It provides structure for the space between informal workshop discovery and formal business modeling — designed for business analysts and management consultants, with first-class support for AI assistance and version control.

**[Vision](./docs/VISION.md)** · **[Getting Started](#getting-started)** · **[Example Workspace](./example/)** · **[Documentation](#documentation)** · **[Personas](./docs/CONSUMERS.md)** · **[npm](https://www.npmjs.com/package/ubml)**

---

## The Problem

AI-assisted coding is compressing implementation timelines from weeks to hours. But a new bottleneck has emerged: **understanding what to build**. Implementation accelerates while specification remains stuck in slides, scattered notes, and diagrams that can't be validated or versioned.

Existing tools don't address this well:

- **UML/BPMN** require precise semantics before you've understood the business
- **Diagramming tools** present a blank canvas with no structure or guidance
- **Workshop notes** can't be validated, connected across sources, or processed by machines
- **Process mining** reveals *what* happened but rarely *why*

UBML bridges the gap between informal discovery and formal modeling — structured enough for validation and AI processing, readable enough for stakeholders who have never seen a modeling notation.

[Read the full vision](./docs/VISION.md)

---

## Key Characteristics

- **Human-readable YAML** — Business stakeholders can read and validate models without learning a notation
- **Validation** — Schema checking, cross-document reference validation, and business rule verification
- **Version control** — Plain text files designed for Git: change history, branching, concurrent editing
- **Editor support** — Auto-complete, error highlighting, and field descriptions in VS Code
- **AI-ready** — Semantic structure designed as input for AI-assisted modeling and analysis
- **Progressive formalization** — Start with rough models during workshops, add rigor as understanding deepens
- **Standard projections** — Export to BPMN, ArchiMate, UML, Mermaid, PlantUML when formal notation is required
- **Open standard** — MIT licensed, no vendor lock-in, no proprietary formats

---

## What a Workspace Contains

A UBML workspace is a structured model of an organization — designed to be maintained across multiple improvement cycles rather than delivered once and discarded.

```
┌─────────────────────────────────────────────────────────────┐
│                        STRATEGY                             │
│       Value streams, capabilities, products, portfolios     │
├─────────────────────────────────────────────────────────────┤
│                     CHANGE & ANALYSIS                       │
│     Hypotheses, scenarios, KPIs, ROI business cases         │
├─────────────────────────────────────────────────────────────┤
│                     OPERATIONAL MODEL                       │
│         Processes, actors, entities, resources              │
├─────────────────────────────────────────────────────────────┤
│                       KNOWLEDGE                             │
│       Sources, insights, glossary, evidence chains          │
├─────────────────────────────────────────────────────────────┤
│                       WORKSPACE                             │
│            Configuration, scope, and conventions            │
└─────────────────────────────────────────────────────────────┘
```

Information flows between layers: knowledge feeds the operational model, the model informs analysis, analysis shapes strategy, and strategic priorities direct where to gather more knowledge. See [Workspace Anatomy](./docs/WORKSPACE-SEMANTICS.md) for details.

---

## Format

UBML files are plain YAML:

```yaml
ubml: "1.4"

processes:
  PR00001:
    name: "Customer Onboarding"
    description: "End-to-end process for onboarding new customers"
    level: 3

    steps:
      ST00001:
        name: "Receive Customer Application"
        kind: action
        inputs:
          - ref: EN00001  # Customer Application Form
        outputs:
          - ref: EN00002  # Verified Customer Record

      ST00002:
        name: "Verify Customer Identity"
        kind: action
        inputs:
          - ref: EN00002
          - ref: EN00003  # ID Documents

      ST00003:
        name: "Review Application"
        kind: decision
        description: "Approval or rejection decision point"
```

Files can be opened in any text editor, reviewed in Git diffs, and processed by AI assistants. The format is readable by both business stakeholders and engineers.

---

## Audience

UBML is designed for consultant-led engagements that transition into client self-service. All participants work in the same workspace on the same model, with views adapted to their role.

| Role | What you do with UBML |
|------|----------------------|
| **Business Analysts** | Process transcripts and interviews into validated models. Map end-to-end workflows. Build hypothesis trees. |
| **Management Consultants** | Drop in meeting notes, capture observations, review models, present findings to leadership. |
| **Client Stakeholders** | Validate models — confirm "yes, this is what we actually do." Provide corrections and context. |
| **Operations Leaders** | Identify bottlenecks, define KPIs, evaluate business cases for proposed changes. |
| **Strategy Teams** | Map capabilities, design value streams, prioritize investments across initiatives. |
| **Software Developers** | Receive business context — understand *why* the process works this way before building. |

See [Personas & Consumers](./docs/CONSUMERS.md) for detailed definitions.

---

## Why Plain Text

The choice of YAML plain text is deliberate:

- **Ownership** — Models are files, not database records in a vendor's cloud. They can be shared, archived, and processed with any tool.
- **Version control** — Git provides change history, branching, and concurrent editing across analysts without overwriting.
- **AI compatibility** — Semantic YAML structure is well-suited for AI-assisted modeling: gap identification, hypothesis generation, and structuring unstructured interview notes.
- **Validation** — Unlike diagrams, text can be automatically checked for structural correctness, missing fields, and broken cross-references.
- **Durability** — Plain text remains readable indefinitely. A workspace created in Year 1 should still be usable in Year 5.

---

## Improvement Cycle

UBML supports iterative organizational improvement — the workspace persists across cycles rather than being delivered once:

```
 ┌────────────────────────────────────────────────┐
 │                                                │
 ▼                                                │
Capture as-is → Analyze → Plan → Execute → Absorb ┘
```

1. **Capture** — Model how the business actually operates today
2. **Analyze** — Decompose issues, form hypotheses, simulate scenarios, build business cases
3. **Plan** — Prioritize improvements, sequence initiatives, define the target operating model
4. **Execute** — Implement changes (outside UBML — this is project management territory)
5. **Absorb** — Yesterday's target state becomes today's baseline. The model is ready for the next cycle.

Process changes trace back through the initiative that delivered them, the hypothesis that proposed them, and the evidence that justified them. The workspace accumulates context across cycles.

---

## Relationship to Formal Standards

UBML does not replace BPMN, ArchiMate, or UML. It sits upstream as the working format where business understanding is captured. When a client or enterprise tooling requires a formal notation, UBML exports to it.

| Standard | UBML Relationship |
|----------|-------------------|
| **BPMN 2.0** | Primary process export target |
| **ArchiMate 3.2** | Business and strategy layer mapping |
| **UML 2.5** | Activity, Use Case, Class, State Machine diagrams |
| **DMN / CMMN** | Decision modeling and case management |
| **Lean VSM** | Native value stream stage and flow time support |
| **Mermaid / PlantUML** | Markdown-embeddable diagrams for documentation |

Exports are lossy by design — UBML captures stakeholder context, hypotheses, and evidence chains that formal notations have no place for. The UBML model remains the source of truth. See [Projections & Export Mappings](./docs/projections/) for detailed mapping documentation.

---

## Getting Started

### 1. Create Your First Workspace

```bash
npx ubml init my-first-project
cd my-first-project
```

This generates template files with example content showing the UBML structure.

> You'll need [Node.js](https://nodejs.org/) 18+. Visual tools are coming — for now, UBML uses the command line.

### 2. Explore and Build

```bash
# Browse your model
npx ubml show process

# Add elements interactively — the CLI guides you
npx ubml add process "Order Fulfillment"
npx ubml add step "Receive Order"
npx ubml add actor "Warehouse Worker"

# Validate everything
npx ubml validate .
```

Or open the folder in VS Code — UBML configures schema validation automatically for auto-complete, error highlighting, and field descriptions.

### 3. Iterate

Start with process and actors. Add entities, metrics, hypotheses, and strategy as understanding deepens. UBML supports progressive formalization — rough models are valid, additional rigor is optional until needed. See the [example workspace](./example/) for a complete sample.

---

## File Types

All files end in `.ubml.yaml`. Add them as you need them:

| File Type | What Goes There |
|-----------|----------------|
| `*.workspace.ubml.yaml` | Project scope and configuration |
| `*.process.ubml.yaml` | How work gets done — workflows, steps, decisions |
| `*.actors.ubml.yaml` | Who does the work — roles, teams, systems |
| `*.entities.ubml.yaml` | What they work with — documents, data, locations |
| `*.metrics.ubml.yaml` | How you measure — KPIs, costs, targets |
| `*.hypotheses.ubml.yaml` | Problem analysis — issue trees, root causes |
| `*.strategy.ubml.yaml` | Strategic elements — capabilities, value streams |
| `*.scenarios.ubml.yaml` | What-if analysis — simulations, forecasts |
| `*.sources.ubml.yaml` | Where knowledge comes from — interviews, documents |
| `*.insights.ubml.yaml` | What was learned — pains, observations, opportunities |
| `*.glossary.ubml.yaml` | Shared vocabulary — domain-specific term definitions |

---

## Documentation

| Document | What You'll Find |
|----------|-----------------|
| **[Vision](./docs/VISION.md)** | Why UBML exists, the specification crisis, what success looks like |
| **[Workspace Anatomy](./docs/WORKSPACE-SEMANTICS.md)** | How the five conceptual layers connect and what each contains |
| **[Design Principles](./docs/PRINCIPLES.md)** | Binding constraints that govern every language design decision |
| **[Design Decisions](./docs/DESIGN-DECISIONS.md)** | Specific choices made, alternatives rejected, and rationale |
| **[Personas & Consumers](./docs/CONSUMERS.md)** | Who uses UBML, what they need, and how they collaborate |
| **[Projections & Exports](./docs/projections/)** | How UBML maps to BPMN, ArchiMate, UML, Mermaid, PlantUML, and more |
| **[Example Workspace](./example/)** | A complete sample workspace with all document types |
| **[Schema Reference](./schemas/)** | The YAML schema definitions that power validation |
| **[Contributing](./CONTRIBUTING.md)** | Development setup and contribution guidelines |
| **[Changelog](./CHANGELOG.md)** | Notable changes to UBML |
| **[Code of Conduct](./CODE_OF_CONDUCT.md)** | Community standards |

### Projection Details

| Target Standard | Mapping Document |
|----------------|-----------------|
| BPMN 2.0 | **[BPMN Projection](./docs/projections/BPMN.md)** |
| ArchiMate 3.2 | **[ArchiMate Projection](./docs/projections/ARCHIMATE.md)** |
| UML 2.5 | **[UML Projection](./docs/projections/UML.md)** |
| DMN / CMMN | **[DMN-CMMN Projection](./docs/projections/DMN-CMMN.md)** |
| BMM 1.3 | **[BMM Projection](./docs/projections/BMM.md)** |
| Value Stream Mapping | **[VSM Projection](./docs/projections/VSM.md)** |
| Mermaid | **[Mermaid Rendering](./docs/projections/MERMAID.md)** |
| PlantUML | **[PlantUML Rendering](./docs/projections/PLANTUML.md)** |
| Data Formats | **[Data Format Mappings](./docs/projections/DATA-FORMATS.md)** |

---

## For Developers

UBML works as a library in any JavaScript/TypeScript environment:

```bash
npm install ubml
```

```typescript
import { parse, validate } from 'ubml';
import { validateWorkspace } from 'ubml/node';
import ubml from 'ubml/eslint';
```

Parse UBML files, validate schema + cross-document references, serialize back to YAML. Full TypeScript types for all elements. Works in browser, Node, Deno, Bun — zero Node dependencies in the core.

---

## Open Standard

UBML is released under the MIT License and developed in the open. Models are plain text files that can be versioned, exported, and processed with any tool. Commercial tooling may be built on top of UBML, but the notation and models carry no vendor dependency.

---

## Get Involved

- **Questions?** [GitHub Discussions](https://github.com/TALXIS/ubml/discussions)
- **Found a bug?** [File an issue](https://github.com/TALXIS/ubml/issues)
- **Want to contribute?** [Contributing guide](./CONTRIBUTING.md)

---

*UBML is developed by [NETWORG](https://networg.com), a consulting and technology firm focused on business process improvement. Part of the [TALXIS](https://talxis.com) platform ecosystem.*
