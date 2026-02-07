# PlantUML Projection

> UBML → PlantUML diagram rendering

**Status:** Evolving — rich feature set including native ArchiMate syntax.

PlantUML supports **richer diagram types** than Mermaid — including native ArchiMate, WBS, and more complex activity diagram syntax — making it ideal for detailed exports and enterprise documentation. Like Mermaid, PlantUML diagrams are generated from UBML; there is no import direction.

---

## Process → Activity Diagram

Best for: **Detailed process flows with full BPMN-like semantics**

| UBML Concept | PlantUML Syntax | Notes |
|-------------|----------------|-------|
| Step (`kind: action`) | `:Step name;` | Activity node |
| Step (`kind: decision`) | `if (condition?) then (yes)` / `else (no)` | Branch |
| Step (`kind: start`) | `start` | Initial node |
| Step (`kind: end`) | `stop` or `end` | Final node |
| Step (`kind: wait`) | `#LightBlue:Wait for X;` | Colored activity |
| Step (`kind: milestone`) | `#Gold:**Milestone**;` | Emphasized activity |
| Step (`kind: subprocess`) | Subprocess syntax | Embed or reference |
| Block (`operator: par`) | `fork` / `fork again` / `end fork` | Parallel |
| Block (`operator: alt`) | `if`/`elseif`/`else`/`endif` | Alternative |
| Block (`operator: loop`) | `repeat`/`repeat while` or `while`/`endwhile` | Loop |
| Actor (swimlane) | `\|Swim Lane Name\|` | Partition |
| Annotation | `note right: text` | Attached note |

### Information Lost

- Approval/review gate detail (simplified to activity)
- Scheduling dependencies (FS/SS/FF/SF)
- Duration/effort/cost values (not rendered)
- Entity data flow (simplified to notes)
- Notification configuration

## Process → Sequence Diagram

Best for: **Cross-actor message flows with timing**

| UBML Concept | PlantUML Syntax |
|-------------|----------------|
| Actor | `participant "Name" as AC00001` |
| Message | `AC00001 -> AC00002 : text` |
| Async message | `AC00001 ->> AC00002 : text` |
| Return | `AC00002 --> AC00001 : text` |
| Activation | `activate`/`deactivate` |
| Decision | `alt` / `else` / `end` |
| Parallel | `par` / `else` / `end` |
| Loop | `loop N times` / `end` |
| Note | `note over AC00001 : text` |
| Phase | `group Phase Name` / `end` |

## Entity Model → Class Diagram

Best for: **Detailed entity-relationship models with attributes**

| UBML Concept | PlantUML Syntax |
|-------------|----------------|
| Entity | `class EntityName { ... }` |
| Attribute | `+type attributeName` |
| Attribute (required) | Bold or marked |
| Relationship (1:1) | `EntityA "1" -- "1" EntityB` |
| Relationship (1:N) | `EntityA "1" -- "*" EntityB` |
| Relationship (M:N) | `EntityA "*" -- "*" EntityB` |
| Document | `class DocName <<document>> { ... }` |

### Information Lost

- Entity.lifecycle (use state diagram instead)
- Entity.system (master system name)
- Attribute defaults and enum values (partially via notes)

## Strategy → ArchiMate Diagram

Best for: **Enterprise architecture views, capability maps, value streams**

PlantUML has **native ArchiMate syntax** via the ArchiMate sprite library:

| UBML Concept | PlantUML ArchiMate |
|-------------|-------------------|
| Capability | `Strategy_Capability(id, "name")` |
| ValueStream | `Strategy_ValueStream(id, "name")` |
| Product | `Business_Product(id, "name")` |
| Service | `Business_Service(id, "name")` |
| Business Process | `Business_Process(id, "name")` |
| Business Actor | `Business_Actor(id, "name")` |
| Business Role | `Business_Role(id, "name")` |
| Business Object | `Business_Object(id, "name")` |
| Application Component | `Application_Component(id, "name")` |
| Location | `Location(id, "name")` |
| Realization | `Rel_Realization(from, to)` |
| Composition | `Rel_Composition(from, to)` |
| Assignment | `Rel_Assignment(from, to)` |
| Triggering | `Rel_Triggering(from, to)` |

### Information Lost

- Same as ArchiMate export losses (see [ARCHIMATE.md](ARCHIMATE.md))
- Capability maturity levels (can be shown via coloring)
- Strategic importance classification

## Scheduling → Gantt Diagram

Best for: **Project timelines with dependencies**

| UBML Concept | PlantUML Syntax |
|-------------|----------------|
| Process | `@startgantt` / `@endgantt` |
| Step | `[Task name] lasts N days` |
| Link (FS) | `[B] starts after [A]'s end` |
| Link (SS) | `[B] starts after [A]'s start` |
| Link (FF) | `[B] ends at [A]'s end` |
| Milestone | `[Milestone] happens at [Task]'s end` |
| Phase | `-- Phase Name --` |

PlantUML Gantt supports **more dependency types** than Mermaid — SS, FF in addition to FS.

### Information Lost

- SF dependency type (not supported)
- Effort vs. duration
- Resource assignment (RACI)
- Cost data

## Entity Lifecycle → State Diagram

Best for: **Entity state machines**

| UBML Concept | PlantUML Syntax |
|-------------|----------------|
| Lifecycle states | `state "Name" as S1` |
| Transitions | `S1 --> S2 : trigger` |
| Initial state | `[*] --> S1` |
| Final state | `S2 --> [*]` |

### Information Lost

- UBML lifecycle is a flat list — no composite/hierarchical states
- No guard conditions on transitions
- No entry/exit/do activities

## Hypothesis → WBS / Mindmap

Best for: **Hypothesis tree decomposition**

| UBML Concept | PlantUML Syntax |
|-------------|----------------|
| HypothesisTree | `@startmindmap` or `@startwbs` |
| Root | `* Root hypothesis text` |
| Children | `** Child` (deeper: `***`, etc.) |
| Status | Color: `[#green]` validated, `[#red]` invalidated |
| Type | Icon prefix per node type |

### Information Lost

- SCQH framing (situation, complication, question, hypothesis)
- Confidence levels
- Evidence references
- Operator semantics (AND/OR/MECE between children)

---

## PlantUML Diagram Types with No UBML Source

| PlantUML Diagram | Why No UBML Source |
|-----------------|-------------------|
| **Use Case Diagram** | Partially mappable (see UML), but UBML processes are richer than use cases |
| **Component Diagram** | Software architecture (out of scope) |
| **Deployment Diagram** | Infrastructure (out of scope) |
| **Object Diagram** | Instance-level data (UBML models types) |
| **Timing Diagram** | Concurrent state timelines (no UBML equivalent) |
| **Network Diagram (nwdiag)** | Network topology (out of scope) |
| **Salt (UI Mockups)** | Interface design (out of scope) |
| **Ditaa** | ASCII art diagrams (manual authoring) |
| **BPMN Diagram** | PlantUML has experimental BPMN; prefer native BPMN export instead |
| **Chronology Diagram** | Historical timelines (no UBML equivalent) |
| **Information Engineering Diagram** | Could map to Entity model but ER/Class is preferred |

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
