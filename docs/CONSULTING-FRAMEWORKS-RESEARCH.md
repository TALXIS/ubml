# Management Consulting Frameworks Research & UBML Analysis

> **Research Focus**: How top-tier management consultancies (McKinsey, BCG, Bain) approach business modeling and strategy work, and how UBML can better support their methodologies.

---

## Executive Summary

This document analyzes leading management consulting frameworks and identifies opportunities to enhance UBML's support for professional consulting practice. The research reveals several key areas where UBML can better align with how elite consultancies approach strategic problem-solving.

**Key Findings**:
1. UBML has strong foundations in hypothesis-driven problem solving (SCQH, hypothesis trees)
2. Several critical consulting frameworks are underrepresented or missing
3. The current schema could better support issue tree decomposition and prioritization
4. Strategy layer needs stronger support for portfolio analysis and option evaluation
5. Missing explicit support for key consulting artifacts (executive summaries, key messages, storylines)

---

## Part 1: Management Consulting Frameworks

### 1.1 Core Problem-Solving Frameworks

#### McKinsey Problem Solving
McKinsey's approach is built on several foundational frameworks:

**MECE Principle** (Mutually Exclusive, Collectively Exhaustive)
- Every problem decomposition should be MECE
- Categories don't overlap (mutually exclusive)
- Categories cover all possibilities (collectively exhaustive)
- **UBML Status**: Supported in hypothesis trees (`operator: mece`)
- **Gap**: No explicit MECE validation or warnings when decompositions aren't MECE

**Issue Trees**
- Hierarchical breakdown of problems into sub-problems
- Each branch represents a hypothesis or question to investigate
- Prioritize branches by impact and ease
- **UBML Status**: Hypothesis trees support this conceptually
- **Gap**: Missing explicit "issue tree" semantic type distinct from hypothesis validation

**Pyramid Principle** (Barbara Minto)
- Start with the answer (top-down communication)
- Support with grouped arguments (SCQH framework)
- Recursively apply to each argument
- **UBML Status**: SCQH framework directly supports this
- **Strength**: Well-implemented in hypothesis.types.yaml

#### BCG Growth-Share Matrix & Strategy Tools
BCG brings several strategic analysis frameworks:

**Growth-Share Matrix** (BCG Matrix)
- Products/services classified as Stars, Cash Cows, Question Marks, Dogs
- Based on market growth rate and relative market share
- Portfolio balancing and investment decisions
- **UBML Status**: Not directly supported
- **Gap**: No portfolio classification or strategic positioning

**Experience Curve**
- Unit costs decline with cumulative production
- Strategic implications for pricing and market share
- **UBML Status**: Not supported
- **Gap**: Missing cost dynamics modeling

**Three Horizons Framework**
- Horizon 1: Core business (maintain and defend)
- Horizon 2: Emerging opportunities (invest and grow)
- Horizon 3: Future options (explore and experiment)
- **UBML Status**: Not directly supported
- **Gap**: Portfolio and capability types lack horizon classification

#### Bain Methodologies

**Bain's RAPID Decision-Making Framework**
- R: Recommend (who recommends)
- A: Agree (who must agree)
- P: Perform (who executes)
- I: Input (who provides input)
- D: Decide (who decides)
- **UBML Status**: Partially via RACI
- **Gap**: RACI != RAPID; missing decision-making focus

**Net Promoter Score (NPS)**
- Customer loyalty metric
- Strategic tracking of customer satisfaction
- **UBML Status**: Could be modeled as custom KPI
- **Gap**: No explicit support for customer feedback metrics

**Elements of Value Pyramid**
- 30 fundamental value elements organized in hierarchy
- Functional → Emotional → Life Changing → Social Impact
- **UBML Status**: Not supported
- **Gap**: No value proposition framework

### 1.2 Strategic Frameworks Common Across Firms

#### Porter's Five Forces
- Industry structure analysis
- Competitive dynamics assessment
- **UBML Status**: Not supported
- **Gap**: No competitive analysis framework

#### Value Chain Analysis (Porter)
- Primary activities (inbound logistics → operations → outbound → marketing → service)
- Support activities (infrastructure, HR, technology, procurement)
- **UBML Status**: Partially via value streams
- **Gap**: Value streams lack Porter's analytical rigor

#### Blue Ocean Strategy
- Value innovation via differentiation AND low cost
- Four Actions Framework (Eliminate-Reduce-Raise-Create)
- **UBML Status**: Not supported
- **Gap**: No strategic positioning or innovation canvas

#### Business Model Canvas (Osterwalder)
- 9 building blocks of business models
- Customer segments, value propositions, channels, etc.
- **UBML Status**: Partially covered across multiple types
- **Gap**: No integrated business model view

### 1.3 Consulting Workflow & Deliverables

#### Typical Consulting Engagement Flow
```
Kickoff → Data Gathering → Analysis → Synthesis → Recommendations → Delivery
```

**Key Artifacts Produced**:
1. **Situation Assessment** - Current state analysis
2. **Issue Tree / Hypothesis Tree** - Problem decomposition
3. **Analysis Plan** - What to investigate and how
4. **Fact Packs** - Supporting data and evidence
5. **Options Analysis** - Alternative solutions evaluated
6. **Recommendation Deck** - Executive presentation
7. **Implementation Roadmap** - Action plan

**UBML Coverage**:
- ✅ Hypothesis trees (issue decomposition)
- ✅ Evidence/insights (fact gathering)
- ✅ Scenarios (options analysis)
- ❌ Situation assessment (no dedicated type)
- ❌ Recommendation slides/storyline (no presentation layer)
- ❌ Implementation roadmap (no project planning)
- ❌ Options comparison matrix

#### Consulting Communication Patterns

**Executive Summary Structure**:
1. Situation (current context)
2. Complication (the problem)
3. Key Question
4. Answer/Recommendation
5. Support (3-5 key points)

**UBML**: SCQH captures this but lacks the "answer + support structure"

**Slide Storyline**:
- Every slide has a message headline
- Slides flow in logical sequence
- Supporting exhibits referenced but not inline
- **UBML Gap**: No presentation/storyline abstraction

---

## Part 2: UBML Schema Analysis Against Consulting Practice

### 2.1 Strengths

#### Well-Aligned with Consulting Practice
1. **Hypothesis Trees with SCQH** - Excellent foundation for structured problem-solving
2. **Evidence Traceability** - Source → Insight → Model lineage
3. **MECE Operator** - Direct support for MECE decomposition
4. **Process Hierarchy (L1-L4)** - Aligns with APQC and consulting process frameworks
5. **Capability Maturity** - Standard capability assessment approach
6. **KPI & ROI Modeling** - Financial business case support
7. **Stakeholder Focus** - Owner, stakeholders tracked throughout

### 2.2 Gaps & Opportunities

#### GAP 1: Issue Trees vs Hypothesis Trees

**Current State**: UBML has hypothesis trees for validation tracking

**Consulting Reality**: 
- Early in engagement, you have an **issue tree** (problem decomposition)
- Later, it evolves into a **hypothesis tree** (testable claims)
- These are conceptually distinct phases

**Recommendation**: 
- Add `IssueTree` type alongside `HypothesisTree`
- Issue trees focus on "what to investigate" (questions)
- Hypothesis trees focus on "what we believe" (claims to validate)
- Allow evolution/linking from issue tree → hypothesis tree

**Schema Impact**: Medium (new type, similar to HypothesisTree)

#### GAP 2: Options Analysis & Decision Criteria

**Current State**: 
- Scenarios can model different options
- No explicit decision criteria or scoring

**Consulting Reality**:
- Options are explicitly compared on multiple criteria
- Weighted scoring (feasibility, impact, cost, risk)
- Decision matrices are standard deliverables

**Recommendation**:
```yaml
optionsAnalysis:
  OA00001:
    name: "Customer Service Platform Selection"
    question: "Which platform should we choose?"
    criteria:
      - name: "Implementation Cost"
        weight: 0.25
        type: minimize
      - name: "Time to Value"
        weight: 0.30
        type: minimize
      - name: "Feature Coverage"
        weight: 0.45
        type: maximize
    options:
      - name: "Option A: Build Custom"
        scores:
          implementationCost: 2  # 1-5 scale
          timeToValue: 1
          featureCoverage: 5
        scenario: SC00001  # Link to detailed scenario
      - name: "Option B: Buy Salesforce"
        scores:
          implementationCost: 4
          timeToValue: 5
          featureCoverage: 3
        scenario: SC00002
    recommendation: "Option B"
    rationale: "Despite lower feature coverage..."
```

**Schema Impact**: Medium (new document type)

#### GAP 3: Strategic Portfolio Classification

**Current State**:
- Products have lifecycle
- Capabilities have strategic importance
- No cross-cutting portfolio view

**Consulting Reality**:
- BCG Matrix classification (Stars, Cash Cows, etc.)
- Portfolio rebalancing recommendations
- Investment allocation across portfolio

**Recommendation**:
Add to Product/Service:
```yaml
portfolioPosition:
  marketGrowthRate: high  # high/medium/low
  relativeMarketShare: high  # high/low
  classification: star  # star/cash-cow/question-mark/dog
  strategicAction: invest  # invest/maintain/harvest/divest
```

**Schema Impact**: Small (extend existing types)

#### GAP 4: Value Proposition Modeling

**Current State**:
- Products/services exist but lack value articulation
- No customer segment → value mapping

**Consulting Reality**:
- Value propositions are central to strategy work
- Customer jobs, pains, gains framework
- Quantified value (time saved, cost reduced, revenue increased)

**Recommendation**:
```yaml
valuePropositions:
  VP00001:
    name: "Fast Fulfillment Value Prop"
    customerSegment: AC00005  # ActorRef
    customerJobs:
      - "Minimize time from order to delivery"
      - "Reduce inventory holding costs"
    pains:
      - "Long lead times frustrate customers"
      - "High carrying costs for safety stock"
    gains:
      - "Same-day delivery delight"
      - "Reduced working capital"
    offerings:
      - product: PR00001
      - service: SV00001
    quantifiedValue:
      timeReduction: "3 days → 4 hours"
      costSaving:
        amount: 50000
        currency: USD
        period: month
```

**Schema Impact**: Medium (new document type)

#### GAP 5: Storyline & Key Messages

**Current State**:
- Views support projections/filtering
- No support for narrative structure or presentation flow

**Consulting Reality**:
- Recommendation decks have a storyline
- Each slide/section has a key message
- Flow: Situation → Complication → Options → Recommendation → Plan

**Recommendation**:
```yaml
storylines:
  SL00001:
    name: "Steering Committee Presentation"
    audience: [AC00010]  # Executive team
    keyMessages:
      - order: 1
        message: "Current processing takes 5 days, missing 2-day target"
        supportingEvidence: [IN00015, IN00023]
        supportingVisuals: [chart, process-map]
      - order: 2
        message: "Approval delays account for 60% of total time"
        supportingEvidence: [IN00032]
        hypothesis: HY00005
      - order: 3
        message: "Streamlining approvals can achieve 2-day target"
        scenario: SC00001
        roi: RI00001
      - order: 4
        message: "Recommend parallel approvals with $10K auto-approve threshold"
        options: OA00001
    recommendations:
      - priority: 1
        text: "Implement parallel approval workflow"
        owner: AC00012
        timeline: "Q2 2026"
```

**Schema Impact**: Medium-Large (new document type with many references)

#### GAP 6: RAPID vs RACI

**Current State**: RACI (Responsible, Accountable, Consulted, Informed)

**Consulting Reality**: 
- RACI is operational
- RAPID is decision-making focused
- Bain consultants prefer RAPID for governance design

**Recommendation**:
- Keep RACI for process steps
- Add RAPID for decision points
```yaml
decisions:
  DEC00001:
    name: "Approve Capital Expenditure >$100K"
    recommend: AC00005  # CFO recommends
    agree: [AC00006, AC00007]  # VPs must agree
    perform: AC00008  # Finance executes
    input: [AC00009, AC00010]  # Dept heads provide input
    decide: AC00001  # CEO decides
    process: PR00005
    step: ST00023
```

**Schema Impact**: Small-Medium (new type or extend Step)

#### GAP 7: Three Horizons Planning

**Current State**: No temporal strategic categorization

**Consulting Reality**:
- H1: Core business (0-1 year)
- H2: Growth initiatives (1-3 years)
- H3: Options/experiments (3+ years)
- Portfolio balancing across horizons

**Recommendation**:
Add to Capability, Product, Service, Initiative types:
```yaml
strategicHorizon: h1  # h1/h2/h3
```

**Schema Impact**: Trivial (add enum field)

#### GAP 8: Implementation Roadmap

**Current State**: 
- Scenarios model what-if
- No implementation sequencing

**Consulting Reality**:
- Recommendations → Initiatives → Waves/Phases → Milestones
- Dependencies and sequencing
- Resource allocation over time
- Risk and mitigation

**Recommendation**:
```yaml
roadmaps:
  RM00001:
    name: "Process Transformation Roadmap"
    waves:
      - name: "Quick Wins (Q1-Q2)"
        initiatives:
          - name: "Auto-approve under $10K"
            owner: AC00005
            effort: 2wk
            impact: high
            dependencies: []
      - name: "Foundation (Q3-Q4)"
        initiatives:
          - name: "Parallel approval workflow"
            owner: AC00006
            effort: 3mo
            impact: high
            dependencies: [init-001]
      - name: "Optimization (Year 2)"
        initiatives:
          - name: "AI-powered approval routing"
            owner: AC00007
            effort: 6mo
            impact: medium
            dependencies: [init-002]
```

**Schema Impact**: Medium (new document type)

#### GAP 9: Competitive Analysis

**Current State**: No support for competitive landscape

**Consulting Reality**:
- Porter's Five Forces
- Competitive positioning maps
- Competitor capability comparison

**Recommendation**:
```yaml
competitiveAnalysis:
  CA00001:
    name: "Logistics Market Analysis"
    portersFiveForces:
      threatOfNewEntrants: high
      threatOfNewEntrantsRationale: "Low barriers, e-commerce players entering"
      buyerPower: medium
      supplierPower: low
      threatOfSubstitutes: medium
      competitiveRivalry: high
    competitors:
      - name: "Competitor A"
        capabilities:
          fastDelivery: high
          reliability: medium
          pricing: low
        marketShare: 25%
        trend: growing
```

**Schema Impact**: Medium (new document type)

#### GAP 10: Customer Journey & Touchpoints

**Current State**: 
- Value streams cover customer perspective
- Steps don't capture customer experience quality

**Consulting Reality**:
- Customer journey mapping is standard
- Touchpoints and moments of truth
- Pain points and emotional states tracked
- Service design principles

**Recommendation**:
Extend ValueStream stages with customer journey metadata:
```yaml
valueStreams:
  VS00001:
    stages:
      - name: "Discover"
        customerTouchpoints:
          - "Website landing page"
          - "Sales call"
        customerEmotionalState: curious
        painPoints:
          - "Unclear pricing"
          - "Long sales cycle"
        momentsOfTruth:
          - "First pricing quote"
```

**Schema Impact**: Small (extend existing type)

---

## Part 3: Design Recommendations Summary

### Priority 1: High Impact, Low Effort

1. **Three Horizons Field** - Add `strategicHorizon` enum to strategy types
2. **Portfolio Classification** - Add BCG matrix fields to Product/Service
3. **Decision Type (RAPID)** - New lightweight decision type or extend Step
4. **Customer Journey Metadata** - Extend ValueStream stages

### Priority 2: High Impact, Medium Effort

5. **Issue Trees** - New document type distinct from HypothesisTree
6. **Options Analysis** - New document type for decision matrices
7. **Value Propositions** - New document type for customer value
8. **Implementation Roadmap** - New document type for phased execution

### Priority 3: Medium Impact, Medium Effort

9. **Storyline/Key Messages** - Presentation layer for recommendations
10. **Competitive Analysis** - Market and competitor modeling

### Priority 4: Consider for Future

11. **Blue Ocean Canvas** - Four Actions Framework
12. **Business Model Canvas** - Integrated business model view
13. **Elements of Value** - Hierarchical value framework
14. **Experience Curve** - Cost dynamics modeling

---

## Part 4: Principles Alignment Check

### Alignment with UBML Principles

**P1 (Single Source of Truth)**: ✅ All recommendations maintain single source
**P2 (Consistent Patterns)**: ✅ Use existing reference and ID patterns
**P3 (Hierarchy & Nesting)**: ✅ Domain-based file organization maintained
**P4 (Explicitness)**: ✅ All new semantics are explicit
**P5 (Schema Design)**: ✅ Modular fragments, documented enums
**P6 (Terminology)**: ✅ Using consultant vocabulary (horizons, BCG, RAPID)
**P7 (Export Compatibility)**: ⚠️  Some frameworks (BCG, Blue Ocean) have no BPMN/ArchiMate equivalent - acceptable per P7.1
**P10 (Projection-First)**: ⚠️  Strategic frameworks may not map to OMG standards - strategic layer is already beyond BPMN scope

### Potential Principle Tensions

**Complexity vs Learnability**: Adding 8-10 new types increases learning curve
- **Mitigation**: Make these optional; core workflow doesn't require them
- **Justification**: Professional consultants already know these frameworks

**Scope Creep**: Some recommendations edge toward implementation tracking
- **Boundary**: Roadmaps model "what to do when" (planning) not "% complete" (tracking)
- **Keep out**: Project status, burndown, Gantt charts - use PM tools

---

## Part 5: Implementation Approach

### Phased Rollout

**Phase 1: Quick Wins** (Schema 1.5)
- Three horizons field
- Portfolio classification
- Customer journey metadata
- MECE validation warnings

**Phase 2: Core Consulting** (Schema 1.6)
- Issue trees
- Options analysis
- Value propositions
- RAPID decisions

**Phase 3: Strategic Planning** (Schema 1.7)
- Implementation roadmaps
- Storylines/key messages
- Competitive analysis

**Phase 4: Advanced** (Future)
- Blue Ocean canvas
- Business model canvas
- Elements of value

### Documentation Updates Needed

1. **DESIGN-DECISIONS.md** - Document rationale for each new type
2. **WORKSPACE-SEMANTICS.md** - Update layer descriptions
3. **Plan docs** - Add consulting frameworks plan
4. **Examples** - Create consulting engagement example workspace
5. **Projection docs** - Note which frameworks don't map to BPMN/ArchiMate

---

## Conclusion

UBML has excellent foundations for supporting management consulting work, particularly with hypothesis-driven problem solving. The main opportunities are:

1. **Better distinguish issue trees from hypothesis trees** - early vs late stage
2. **Add explicit support for options analysis and decision-making** - core consulting deliverable
3. **Enhance strategic layer with portfolio tools** - BCG matrix, horizons, value props
4. **Support presentation/communication layer** - storylines and key messages
5. **Add lightweight implementation planning** - roadmaps without turning into MS Project

These additions would position UBML as **the notation of choice for elite consulting firms**, while maintaining its core identity as a business modeling DSL, not a project management or workflow tool.

The recommended approach is phased implementation, starting with low-effort/high-impact additions (horizons, portfolio classification) and progressively adding more sophisticated frameworks based on user feedback and adoption patterns.
