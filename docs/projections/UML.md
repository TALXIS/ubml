# UML 2.5 Projection

> UBML ↔ Unified Modeling Language (OMG, ISO 19505)

**Status:** Stable — Activity, Use Case, Class, and State Machine mappings established.

UBML maps to **four UML diagram types**, each projecting a different facet of the model. UML's remaining diagram types (sequence, component, deployment, timing, etc.) either overlap with other projections (BPMN for sequence) or address software architecture (out of UBML scope).

---

## UBML → UML Mapping

### Activity Diagram (Process Flow)

| UBML Concept | UML Element | Notes |
|-------------|------------|-------|
| Process | Activity | Top-level container |
| Step (`kind: action`) | OpaqueAction / CallBehaviorAction | Unit of work |
| Step (`kind: decision`) | DecisionNode + MergeNode | Branch and rejoin |
| Step (`kind: start`) | InitialNode | Single entry point |
| Step (`kind: end`) | ActivityFinalNode | Process termination |
| Step (`kind: milestone`) | AcceptEventAction | Signal/event receipt |
| Step (`kind: wait`) | AcceptTimeEventAction | Timer-based wait |
| Step (`kind: subprocess`) | CallBehaviorAction | Invokes sub-activity |
| Step (`kind: handoff`) | SendSignalAction + AcceptEventAction | Inter-partition communication |
| Block (`operator: par`) | ForkNode + JoinNode | Parallel execution |
| Block (`operator: alt`) | DecisionNode (with guards) | Conditional branching |
| Block (`operator: loop`) | LoopNode | Structured loop |
| Link | ControlFlow | Sequence between actions |
| Link with `dataBindings` | ObjectFlow | Data-carrying edge |
| Actor (in RACI) | ActivityPartition | Swimlane |
| Entity (as input/output) | ObjectNode / Pin | Data flowing through activity |

### Use Case Diagram (Actor-Process View)

| UBML Concept | UML Element | Notes |
|-------------|------------|-------|
| Actor (`type: role`) | Actor | Stick figure |
| Actor (`type: external`) | Actor | External participant |
| Actor (`type: system`) | System Boundary | Rectangular boundary |
| Actor (`type: customer`) | Actor | Primary actor |
| Process (L1/L2) | Use Case | High-level process as use case |
| ProcessCall (sync) | «include» | Required sub-process |
| ProcessCall (async) | «extend» | Optional/conditional trigger |
| Actor → Process (via RACI) | Association | Participation |

### Class Diagram (Entity Model)

| UBML Concept | UML Element | Notes |
|-------------|------------|-------|
| Entity | Class | With attributes |
| Entity.attributes | Property / Attribute | Typed fields |
| Attribute.type | UML DataType | string, number, boolean, date, etc. |
| Attribute.required | Multiplicity `[1..1]` vs `[0..1]` | |
| Relationship (`one-to-one`) | Association `1..1` | |
| Relationship (`one-to-many`) | Association `1..*` | |
| Relationship (`many-to-one`) | Association `*..1` | |
| Relationship (`many-to-many`) | Association `*`..`*` | |
| Document | Class «document» | Stereotyped class |
| Entity.lifecycle | *(note)* | State list as note attachment |

### State Machine Diagram (Entity Lifecycle)

| UBML Concept | UML Element | Notes |
|-------------|------------|-------|
| Entity.lifecycle states | State | Each value → state |
| Entity.lifecycle ordering | Transition | Sequential transitions |
| DataObjectInput.inState | Guard condition | Precondition state |
| DataObjectOutput.toState | Effect / target state | Post-condition |
| Step that changes entity state | Trigger on transition | Activity causing change |

---

## UBML Information Lost on UML Export

| UBML Concept | Why Lost |
|-------------|----------|
| Knowledge layer | UML has no knowledge representation |
| Hypotheses, SCQH | UML is structural/behavioral, not analytical |
| Scenarios, simulation | UML is design-time, not simulation |
| KPIs, ROI | No metrics model |
| Scheduling (FS/SS/FF/SF) | Activity diagrams have no scheduling semantics |
| Block operators beyond par/alt | UML has no opt/loop-with-guard structure (must decompose) |
| Phase concept | No process phase in UML |
| Approval/review gates | Simplified to actions |
| Notifications | No notification model |
| Actor skills, equipment | No resource model in UML |
| Process hierarchy (L1–L4) | No built-in leveling system |
| Capabilities, value streams | UML doesn't model enterprise strategy |
| Duration, effort, cost | UML is structural, not operational |

---

## UML Concepts UBML Cannot Capture

UML is a comprehensive software modeling language with 14 diagram types. UBML uses only four. The remainder address software architecture and detailed design concerns outside UBML's scope.

### Structural Diagrams (High Impact)

| UML Diagram / Concept | Description | UBML Gap |
|-----------------------|-------------|----------|
| **Component Diagram** | Software components, their interfaces, and dependencies. | UBML has no software architecture model. `Actor.type: system` names a system but doesn't decompose it into components. |
| **Deployment Diagram** | Hardware nodes, execution environments, and artifact deployment. | Completely out of scope. UBML has `Location` but no concept of servers, containers, or deployment topology. |
| **Package Diagram** | Namespace organization of model elements. | UBML files organize by domain (P3.4) but have no formal package/namespace mechanism. |
| **Composite Structure Diagram** | Internal structure of a class/component at runtime. | No equivalent. UBML entities don't have internal structural decomposition with ports and connectors. |
| **Profile Diagram** | Stereotype definitions extending UML metaclasses. | UBML has `custom` fields for extension but no formal metamodel extension mechanism. |
| **Object Diagram** | Instance-level snapshot of objects and their values. | UBML models types (entities, actors), not instances. No snapshot of actual data values. |

**Severity: High.** UML's structural diagrams serve software architects. UBML is deliberately not a software architecture language.

### Behavioral Diagrams (Medium Impact)

| UML Diagram / Concept | Description | UBML Gap |
|-----------------------|-------------|----------|
| **Sequence Diagram** | Lifeline-based message exchange with precise ordering. | UBML `Step.messages` models messages but lacks lifeline activation/deactivation, destruction, and combined fragments (critical, negative regions). For rendering, use Mermaid/PlantUML sequence diagrams directly. |
| **Communication Diagram** | Object interaction organized around links (same semantics as sequence, different layout). | Not needed — sequence view covers the same semantics. |
| **Timing Diagram** | State changes across concurrent lifelines over wall-clock time. | No equivalent. UBML entities have lifecycle states but not timeline-based state visualization with precise timing constraints. |
| **Interaction Overview Diagram** | Activity diagram where nodes are interaction fragments (sequences). | No equivalent. UBML doesn't compose interaction fragments. |

### Class/Entity Modeling Depth (Medium Impact)

| UML Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Generalization / Inheritance** | Class hierarchies with "is-a" relationships and property inheritance. | UBML entities have `parent` references for hierarchy but no true inheritance (shared attributes, polymorphism). An "Order" entity doesn't formally inherit from a "Business Transaction" base entity. |
| **Abstract Classes / Interfaces** | Types that define contracts without implementation. | No concept. All UBML entities are concrete. |
| **Visibility Modifiers** | Public, private, protected, package access on attributes and operations. | UBML attributes have no visibility concept. All attributes are "public" in the model. |
| **Operations / Methods** | Behavioral features of classes. | UBML entities have attributes only, not operations. Business objects don't "do" things in UBML — processes act on them. |
| **Constraints (OCL)** | Object Constraint Language for formal invariants, pre/post conditions. | UBML has `Expression` (TypeScript-subset) for guards and conditions, but no formal constraint language on entity types. No class invariants. |
| **Association Classes** | Relationships that carry their own attributes. | UBML `Relationship` has only `target`, `type`, `description`, `required`. No attributes on the relationship itself. |
| **Qualified Associations** | Associations navigated via a qualifier key. | No equivalent. |
| **N-ary Associations** | Relationships involving 3+ classes. | UBML relationships are binary only. |
| **Multiplicity (beyond cardinality)** | Ordered, unique, bag, sequence constraints on collections. | UBML uses simple cardinality: `one-to-one`, `one-to-many`, `many-to-one`, `many-to-many`. No ordering or uniqueness constraints. |
| **Derived Attributes / Unions** | Computed attributes and subset relationships. | UBML has no derived attributes (P1.3 prohibits computed aggregations). |
| **Template / Parameterized Classes** | Generic types. | No equivalent. |

### State Machine Depth (Low–Medium Impact)

| UML Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Composite States** | States containing sub-state machines (hierarchical, orthogonal regions). | UBML `Entity.lifecycle` is a flat list of state names. No nested states, no parallel regions. |
| **History States** | Pseudo-states remembering last active sub-state. | No equivalent. |
| **Junction / Choice Pseudo-States** | Complex conditional transitions. | No equivalent. UBML lifecycle is a simple ordered sequence. |
| **Entry/Exit/Do Activities** | Activities triggered on state entry, exit, or while in a state. | No equivalent. UBML doesn't attach behavior to entity states. |
| **Guard Conditions on Transitions** | Formal guard expressions for state transitions. | UBML lifecycle doesn't model transition guards. Transitions are implied by ordering. |
| **Event-triggered Transitions** | Signals, calls, or time events causing state changes. | `DataObjectInput.inState` / `DataObjectOutput.toState` on steps partially models this, but the entity itself doesn't declare what events cause its transitions. |

---

## Import Considerations (UML → UBML)

| UML Element | UBML Import Strategy |
|------------|---------------------|
| Activity Diagram actions | Import as Steps with appropriate `kind` |
| Activity partitions | Import as Actors |
| Use Case actors | Import as Actors |
| Use Cases | Import as high-level Processes |
| Classes | Import as Entities with attributes |
| Associations | Import as Entity Relationships |
| State Machines | Import as Entity `lifecycle` (flattened to ordered list) |
| Component/Deployment | **Skip** — out of UBML scope |
| Sequence Diagrams | Import as Process steps with messages |
| OCL constraints | **Skip** — no formal constraint language in UBML |

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
