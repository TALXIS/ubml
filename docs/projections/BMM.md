# BMM (Business Motivation Model) Projection

> UBML ↔ Business Motivation Model (OMG, v1.3)

**Status:** Stable — UBML's strategy and analysis layers cover ~60% of BMM semantics using consultant vocabulary.

BMM is the OMG standard most directly aligned with UBML's unique differentiators: hypotheses, personas with motivations, the SCQH framework, and strategy elements. Where BPMN covers *how* work happens and ArchiMate covers *what* the architecture looks like, BMM covers *why* the organization does what it does.

---

## BMM Structure

BMM organizes business motivation into four pillars:

```
Ends (desired results)          Means (approaches to achieve ends)
├── Vision                      ├── Mission
├── Goal                        ├── Strategy
└── Objective                   └── Tactic

Influencers (factors)           Assessments (judgments about influencers)
├── Internal                    ├── SWOT-style evaluations
└── External                    └── Potential Impact / Risk
```

Plus **Directives** (Business Rules, Business Policies) that constrain how means are pursued.

---

## UBML → BMM Mapping

### Ends (Vision, Goals, Objectives)

| BMM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Vision** | *(no direct equivalent)* | ✗ Gap | UBML has no Vision primitive. Closest: workspace description or a top-level hypothesis situation statement. |
| **Goal** | `Persona.goals` | ◐ Partial | UBML goals are persona-scoped (stakeholder-specific), not organization-wide. BMM goals are organizational. |
| **Goal** | `ValueStream.valueOutcome` | ◐ Partial | Value outcomes express what the organization delivers — a type of goal. |
| **Goal** | `Capability.targetMaturity` | ◐ Partial | Target maturity implies a capability improvement goal. |
| **Objective** | `KPI.target` / `KPI.thresholds` | ◐ Partial | KPI targets are measurable objectives. But they lack BMM's goal-objective nesting. |

### Means (Mission, Strategies, Tactics)

| BMM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Mission** | *(no direct equivalent)* | ✗ Gap | No Mission primitive in UBML. |
| **Strategy** | `HypothesisNode` (type: recommendation) | ◐ Partial | Hypothesis recommendations propose strategic changes. But they're analytical artifacts, not declared strategies. |
| **Strategy** | `Scenario` (variant scenarios) | ◐ Partial | Scenarios model what-if alternatives — strategy exploration. |
| **Tactic** | `HypothesisNode` (type: recommendation, nested) | ◐ Partial | Tactical recommendations nested under strategic ones. |
| **Tactic** | Process improvement proposals (in annotations) | ◐ Partial | Specific process changes as part of improvement work. |

### Influencers

| BMM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Internal Influencer** | `Persona.painPoints` | ◐ Partial | Pain points capture internal friction, bottlenecks, inefficiencies. |
| **Internal Influencer** | `Insight` (type: observation) | ◐ Partial | Observations from interviews, workshops, data analysis. |
| **External Influencer** | `Persona.motivations` | ◐ Partial | External pressures driving stakeholder behavior. |
| **External Influencer** | `HypothesisNode.situation` | ◐ Partial | SCQH "situation" describes the context including external factors. |
| **Regulation** | `Annotation` (type: compliance) | ◐ Partial | Compliance annotations on steps reference regulations. |

### Assessments

| BMM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Assessment** | `HypothesisNode.complication` | ◐ Partial | SCQH "complication" is an assessment of what's wrong or at risk. |
| **Assessment** | `Insight` (type: finding) | ◐ Partial | Findings from research and analysis — judgments about the current state. |
| **Potential Impact** | `Scenario.evidence` / `Scenario.impact` | ◐ Partial | Scenario analysis quantifies potential impacts. |
| **Risk** | `Annotation` (type: risk/warning) | ◐ Partial | Risk annotations on process elements. No first-class Risk type. |
| **SWOT element** | *(spread across multiple types)* | ◐ Partial | Strengths → capabilities at high maturity. Weaknesses → low maturity + pain points. Opportunities → hypothesis recommendations. Threats → external influencers. |

### Directives

| BMM Element | UBML Concept | Mapping Quality | Notes |
|------------|-------------|-----------------|-------|
| **Business Policy** | *(no direct equivalent)* | ✗ Gap | No Policy primitive. Policies may appear in process descriptions, annotations, or glossary terms. |
| **Business Rule** | `Step.guard` (Expression) | ◐ Partial | Guard expressions are decision rules, but they're embedded in process flow, not standalone business rules. |
| **Business Rule** | `Phase.entryCriteria` / `exitCriteria` | ◐ Partial | Gate criteria are rules about phase transitions. |

---

## UBML Information Lost on BMM Export

| UBML Concept | Why Lost |
|-------------|----------|
| Process flow (steps, blocks, links) | BMM doesn't model processes — it models motivation for processes |
| RACI / actor assignments | BMM has no operational assignment model |
| Entity model | BMM doesn't model data/information objects |
| KPI formulas, frequencies, data sources | BMM objectives are qualitative, not metric-calculated |
| Knowledge layer (sources, observations) | BMM has Influencers but not a knowledge management model |
| Scheduling, duration, effort, cost | BMM is strategic, not operational |
| Process mining configuration | Completely out of scope |
| Equipment, locations, resources | Operational concerns, not motivation |

---

## BMM Concepts UBML Cannot Capture

### Organizational Ends (High Impact)

| BMM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Vision** | Single overarching statement of the desired future state. Organization-wide, long-term, inspirational. | No Vision type. UBML models what organizations *do* and analyzes *why*, but doesn't capture the aspirational vision statement. Could live in workspace metadata or a custom field. |
| **Mission** | What the organization does to pursue the Vision. Defines scope of operations. | No Mission type. Same gap as Vision — UBML starts from capabilities and processes, not from declared purpose. |
| **Goal/Objective hierarchy** | Goals decompose into sub-goals and measurable objectives. BMM defines formal relationships: Goal *is amplified by* Objective, Goal *includes* sub-Goal. | UBML goals are flat lists per persona. No goal hierarchy, no goal-objective decomposition, no cross-stakeholder goal alignment. `KPI.target` serves as a proxy for objectives but isn't linked back to organizational goals. |

**Severity: High.** Consultants doing strategy work often start with Vision → Goals → Objectives decomposition. UBML skips straight to capabilities and processes, leaving the "why" underspecified relative to BMM.

### Means Architecture (Medium Impact)

| BMM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Strategy** (as declared intent) | Named, organization-wide approach to achieving goals. Persists across projects. | UBML doesn't have a first-class Strategy element (despite having a "strategy" document type). Hypothesis recommendations are *analytical proposals*, not *declared organizational strategies*. The distinction: "We should pursue digital-first" (strategy) vs. "Hypothesis: digital-first would reduce costs by 20%" (recommendation). |
| **Tactic** (as operational approach) | Specific operational approach implementing a strategy. | No Tactic type. Process improvements are implicit in process changes, not declared as tactical means. |
| **Strategy/Tactic → Goal traceability** | BMM formally links means to ends: "Strategy X *is a component of the plan for* Goal Y." | No traceability from improvement proposals to organizational goals. Hypothesis recommendations exist in isolation from declared objectives. |

**Severity: Medium.** UBML's hypothesis framework *serves a similar purpose* (analyzing what to change and why), but using a different framing. The gap is in declared intent vs. analytical proposals.

### Directive Framework (Medium Impact)

| BMM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Business Policy** | Directive that governs business activity. Non-actionable constraint (e.g., "All customer data must be encrypted at rest"). | No Policy type. Policies appear informally in annotations, descriptions, and glossary entries. Compliance annotations (`type: compliance`) reference regulations but aren't structured policy objects. |
| **Business Rule** | Actionable directive derived from policy (e.g., "Encrypt fields X, Y, Z using AES-256"). | UBML expressions and guards are process-level rules, not standalone business rules. No rule library, no rule-to-policy traceability. |
| **Policy → Rule derivation** | Business rules are governed by and derived from business policies. | No chain from policy → rule → process constraint. |

**Severity: Medium.** Organizations with strong governance (finance, healthcare, government) need policy-rule-process traceability. UBML captures the process end but not the policy end.

### Assessment Formalism (Low Impact)

| BMM Concept | Description | UBML Gap |
|------------|-------------|----------|
| **Assessment** (formal) | Structured judgment about how an influencer impacts ends/means. Has formal relationships to both. | UBML insights and hypothesis complications are informal text. No structured "Influencer X impacts Goal Y with severity Z" assessment. |
| **Influencer categorization** | BMM categorizes influencers: Technology, Competitor, Customer, Environment, etc. with taxonomy. | UBML personas, pain points, and sources are not categorized by influencer type. |
| **Potential Impact** | Quantified or qualified impact of an influencer on an end or mean. | UBML scenarios can model impact but don't link back to specific influencers. |

**Severity: Low.** UBML's informal approach (insights, SCQH, personas) captures the same information with less structure. The trade-off is intentional — consultants prefer narrative over formal assessment graphs.

---

## Integration Pattern

BMM and UBML are **complementary** rather than competing. A recommended integration:

```
BMM Layer (Why)          →  UBML Layer (What/How)
─────────────────────────────────────────────────
Vision / Mission         →  Workspace description + glossary
Goals / Objectives       →  Persona.goals + KPI targets
Strategies               →  HypothesisTree recommendations
Tactics                  →  Process improvement proposals
Business Policies        →  Annotations (type: compliance)
Business Rules           →  Step guards + Phase criteria
Influencers              →  Knowledge Sources + Insights
Assessments              →  Hypothesis complications + Scenarios
```

For organizations that need formal BMM compliance, consider:
1. Maintain BMM artifacts in an EA tool (Sparx, Archi)
2. Reference BMM elements from UBML via `custom` fields
3. Use UBML for operational detail BMM doesn't cover
4. Use BMM for strategic intent UBML doesn't cover

---

## Relationship to Other Standards

- **ArchiMate Motivation Layer** is derived from BMM. See [ARCHIMATE.md](ARCHIMATE.md) — ArchiMate's Goal, Driver, Assessment, Stakeholder elements are BMM-inspired but simplified.
- **SBVR** (Semantics of Business Vocabulary and Rules) is a sibling OMG standard. SBVR's business rules formalize what BMM's Directives describe.
- **TOGAF** uses BMM concepts in its Business Architecture phase (Phase B of ADM).

---

*See [README.md](README.md) for the full projection index and information loss matrix.*
