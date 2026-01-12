# UBML Schema Reference

This directory contains the UBML (Unified Business Modeling Language) JSON Schema definitions.

> For file naming conventions, ID patterns, and VS Code setup, see the main [README](../README.md).

## Architecture

The schema follows a three-tier architecture for maintainability and modularity:

```
schemas/
├── ubml.schema.yaml              # Root schema - validates complete UBML files
│
├── common/                       # Layer 1: Shared Definitions
│   └── defs.schema.yaml          # References, primitives, expressions
│
├── fragments/                    # Layer 2: Reusable Type Definitions
│   ├── actor.fragment.yaml       # Actor, Persona
│   ├── entity.fragment.yaml      # Entity, Document, Location
│   ├── hypothesis.fragment.yaml  # SCQH, HypothesisNode, HypothesisTree
│   ├── link.fragment.yaml        # Link definitions
│   ├── metrics.fragment.yaml     # KPI, ROI
│   ├── mining.fragment.yaml      # Mining source, mappings
│   ├── process.fragment.yaml     # Process, Phase
│   ├── resource.fragment.yaml    # Skill, ResourcePool, Equipment
│   ├── scenario.fragment.yaml    # Scenario, WorkAttribute
│   ├── step.fragment.yaml        # Step, Block, RACI, ProcessCall
│   ├── strategy.fragment.yaml    # ValueStream, Capability, Product
│   └── view.fragment.yaml        # View definitions
│
└── documents/                    # Layer 3: File-Level Validation
    ├── actors.document.yaml      # *.actors.ubml.yaml
    ├── entities.document.yaml    # *.entities.ubml.yaml
    ├── glossary.document.yaml    # *.glossary.ubml.yaml
    ├── hypotheses.document.yaml  # *.hypotheses.ubml.yaml
    ├── links.document.yaml       # *.links.ubml.yaml
    ├── metrics.document.yaml     # *.metrics.ubml.yaml
    ├── mining.document.yaml      # *.mining.ubml.yaml
    ├── process.document.yaml     # *.process.ubml.yaml
    ├── scenarios.document.yaml   # *.scenarios.ubml.yaml
    ├── strategy.document.yaml    # *.strategy.ubml.yaml
    ├── views.document.yaml       # *.views.ubml.yaml
    └── workspace.document.yaml   # *.workspace.ubml.yaml
```

## Schema Composition

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ubml.schema.yaml                             │
│                    (Complete model validation)                      │
│         Used for validating single-file UBML documents              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────────┐
         │                        │                            │
         ▼                        ▼                            ▼
┌─────────────────┐    ┌─────────────────┐          ┌─────────────────┐
│   documents/    │    │   documents/    │          │   documents/    │
│ process.document│    │ actors.document │   ...    │ hypotheses.doc  │
│                 │    │                 │          │                 │
│ Validates:      │    │ Validates:      │          │ Validates:      │
│ *.process.ubml  │    │ *.actors.ubml   │          │ *.hypotheses.*  │
└────────┬────────┘    └────────┬────────┘          └────────┬────────┘
         │                      │                            │
         ▼                      ▼                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         fragments/                                  │
│              Reusable type definitions ($defs)                      │
│                 Imported via $ref by documents                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     common/defs.schema.yaml                         │
│          Foundation: primitives, refs, expressions                  │
│                    Always required by all schemas                   │
└─────────────────────────────────────────────────────────────────────┘
```

## JSON Schema Version

All schemas use JSON Schema draft 2020-12:

```yaml
$schema: "https://json-schema.org/draft/2020-12/schema"
```

## Getting Started

See individual schema files for detailed examples and documentation. Each schema file contains comprehensive descriptions, use cases, and examples.

For usage examples, see the [examples directory](../examples/).

