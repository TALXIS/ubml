# Mermaid Projection

> UBML → Mermaid diagram rendering

**Status:** Evolving — new Mermaid diagram types added frequently.

Mermaid is the **primary rendering target for embedded documentation** — Markdown-compatible, widely supported in GitHub, GitLab, Confluence, Notion, and documentation tools. Mermaid diagrams are generated from UBML models for visual communication; there is no import direction.

---

## Process → Flowchart

Best for: **Process overviews, stakeholder communication**

| UBML Concept | Mermaid Syntax | Example |
|-------------|---------------|---------|
| Step (`kind: action`) | Rectangle `[text]` | `ST00001[Receive order]` |
| Step (`kind: decision`) | Diamond `{text}` | `ST00002{Credit check?}` |
| Step (`kind: start`) | Stadium `([text])` | `ST00003([Start])` |
| Step (`kind: end`) | Stadium `([text])` | `ST00004([End])` |
| Step (`kind: milestone`) | Hexagon `{{text}}` | `ST00005{{Order confirmed}}` |
| Step (`kind: wait`) | Asymmetric `>text]` | `ST00006>Wait for payment]` |
| Step (`kind: subprocess`) | Subroutine `[[text]]` | `ST00007[[Run credit check]]` |
| Step (`kind: handoff`) | Parallelogram `[/text/]` | `ST00008[/Send to warehouse/]` |
| Link | Arrow `-->` | `ST00001 --> ST00002` |
| Link with condition | Arrow `-->\|text\|` | `ST00002 -->\|approved\| ST00003` |
| Link with `isDefault` | Arrow `-->\|default\|` | `ST00002 -->\|default\| ST00004` |

### Information Lost

- RACI assignments (no swimlane support in flowchart)
- Duration, effort, cost
- Block operators (par/alt must be flattened to explicit edges)
- Approval/review/notification configuration
- Scheduling dependencies
- Data inputs/outputs

## Process with Messages → Sequence Diagram

Best for: **Cross-actor interactions, handoffs, message flows**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| Actor | `participant AC00001 as Customer Service` |
| Step with message | `AC00001->>AC00002: Process order` |
| Wait step | `Note over AC00001: Waiting for approval` |
| Decision outcome | `alt approved` / `else rejected` |
| Parallel block | `par Thread 1` / `and Thread 2` |
| Loop block | `loop Every 5 minutes` |
| Subprocess call | `AC00001->>AC00003: Call credit check` |

### Information Lost

- Step kinds other than action/handoff (flattened to messages)
- Entity/document data flow
- Scheduling dependencies
- Approval/review gate detail

## Process Scheduling → Gantt Diagram

Best for: **Project planning, timeline visualization**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| Phase | `section Phase Name` |
| Step | `Step name :id, start, duration` |
| Step.duration | Duration value |
| Link (finish-to-start) | `after` dependency |
| Milestone step | `Milestone :milestone, id, date, 0d` |
| Step status | `:active`, `:done`, etc. |

### Information Lost

- SS, FF, SF dependency types (Mermaid Gantt only supports FS)
- Effort vs. duration distinction
- RACI (no resource assignment)
- Conditional/probabilistic flows
- Lag/lead times

## Entity Model → ER Diagram

Best for: **Information model visualization**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| Entity | Entity block: `ENTITY_NAME { ... }` |
| Attribute | `type name "description"` |
| Relationship (1:1) | `A \|\|--\|\| B : "relates"` |
| Relationship (1:N) | `A \|\|--o{ B : "has"` |
| Relationship (M:N) | `A }o--o{ B : "links"` |

### Information Lost

- Entity.lifecycle (no state model in ER)
- Attribute defaults, enums, required flag
- Document type distinction
- Entity.system (master system)

## Capability/Strategy → Mindmap

Best for: **Capability hierarchy visualization**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| Root capability | Root node |
| Child capabilities | Indented children |
| Capability.maturity | Node shape varies |

### Information Lost

- Maturity target vs. current
- Strategic importance classification
- Skills, systems, processes linked to capabilities
- Full value stream stage detail

## Value Stream → User Journey

Best for: **Customer experience / value delivery visualization**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| ValueStream | `title Stream Name` |
| Stages | `section Stage Name` |
| Steps within stage | `Description: score: Actor` |

### Information Lost

- KPIs and metrics
- Triggering/ending events
- Process references within stages
- Value outcome text

## Actor Hierarchy → Flowchart

Best for: **Organizational structure**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| Actor (org) | Root node |
| Actor.reportsTo | Directed edge |
| Actor (team) | Group node |
| Actor (role) | Leaf node |

### Information Lost

- Skills, rates, personas
- Equipment assignments
- Resource pool configuration

## KPIs → Quadrant Chart

Best for: **Priority/performance matrix**

| UBML Concept | Mermaid Syntax |
|-------------|---------------|
| KPI set | `quadrantChart` |
| KPI values | Point coordinates |
| Labels | Axis labels |

### Information Lost

- Thresholds (red/amber/green)
- Formula, frequency, source
- Time series / historical values

---

## Mermaid Concepts with No UBML Source

These Mermaid diagram types have no natural UBML data source — they would be authored manually or serve non-UBML purposes:

| Mermaid Diagram | Why No UBML Source |
|----------------|-------------------|
| **Git Graph** | Version control visualization, not business modeling |
| **Pie Chart** | Requires ad-hoc percentage data not in UBML schema |
| **C4 Diagram** | Software architecture (out of UBML scope) |
| **Requirement Diagram** | Requirements management (not UBML's purpose) |
| **Packet Diagram** | Network protocol (out of scope) |
| **Architecture Diagram** | Infrastructure (out of scope) |
| **Sankey Diagram** | Flow quantities — could potentially render value stream throughput but no schema support yet |
| **Kanban** | Task management, not process modeling |
| **Radar Chart** | Could render capability maturity across dimensions but no direct mapping defined |

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
