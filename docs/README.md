# UBML Language Design

These documents define the **notation and abstractions** of the Unified Business Modeling Language — the concepts, vocabulary, and structure used to model how organizations work.

**Scope**: Language design only. These documents do not cover tooling, CLI implementation, or editor features. They define what UBML *is* as a notation.

**Purpose**: To keep UBML focused, consistent, and effective at its goal: enabling consultants to capture and communicate business reality.

| Document | Purpose |
|----------|--------|
| [VISION.md](VISION.md) | Why UBML exists, what problem it solves, who it serves |
| [WORKSPACE-SEMANTICS.md](WORKSPACE-SEMANTICS.md) | Semantic structure of a workspace — what it contains and how parts relate |
| [PRINCIPLES.md](PRINCIPLES.md) | Binding constraints that govern language design decisions |
| [DESIGN-DECISIONS.md](DESIGN-DECISIONS.md) | Specific choices made, alternatives rejected, and why |
| [projections/](projections/README.md) | How UBML maps to BPMN, ArchiMate, UML, Mermaid, PlantUML, and other standards — and what each standard captures that UBML cannot |
| [CONSUMERS.md](CONSUMERS.md) | Who uses UBML, what they need, and how they interact with the tooling |
| [plan/00-design-decisions.md](../plan/00-design-decisions.md) | Open design questions and unresolved topics |

**Audience**: Maintainers and contributors evolving the language.

**Primary users of UBML**: See [CONSUMERS.md](CONSUMERS.md) for detailed persona definitions. Every design decision must be evaluated from their perspective.
