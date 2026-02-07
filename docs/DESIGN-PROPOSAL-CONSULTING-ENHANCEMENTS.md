# Design Proposal: Management Consulting Framework Enhancements

> **Status**: Proposed  
> **Author**: Research based on management consulting frameworks analysis  
> **Date**: 2026-02-07  
> **Related**: CONSULTING-FRAMEWORKS-RESEARCH.md  

---

## Overview

This proposal outlines enhancements to UBML to better support professional management consulting practice, based on analysis of frameworks used by McKinsey, BCG, Bain, and other top-tier firms.

**Scope**: This proposal focuses on **Phase 1: Quick Wins** - high-impact, low-effort changes that align with existing UBML principles.

---

## Proposed Changes

### Change 1: Three Horizons Strategic Classification

**Status**: RECOMMENDED

**Rationale**: 
- Standard framework across BCG, McKinsey for portfolio planning
- Minimal schema change (single enum field)
- High value for strategic planning
- Aligns with P6 (business vocabulary)

**Schema Changes**:

Add to `/schemas/1.4/types/strategy.types.yaml`:

```yaml
# In Capability definition
strategicHorizon:
  description: |
    Strategic time horizon for this capability (BCG Three Horizons):
    - h1: Core business - Maintain and defend (0-1 year)
    - h2: Emerging opportunities - Invest and grow (1-3 years)  
    - h3: Future options - Explore and experiment (3+ years)
    
    Used for portfolio balancing and investment allocation.
  type: string
  enum: [h1, h2, h3]
  x-ubml:
    propertyNames: ["strategicHorizon", "horizon"]
    valueMistakes:
      horizon1:
        value: "horizon1"
        hint: "Use 'h1' for Horizon 1 (core business)."
      horizon2:
        value: "horizon2"
        hint: "Use 'h2' for Horizon 2 (emerging opportunities)."
      horizon3:
        value: "horizon3"
        hint: "Use 'h3' for Horizon 3 (future options)."
      core:
        value: "core"
        hint: "Use 'h1' for core business capabilities."
      future:
        value: "future"
        hint: "Use 'h3' for future/experimental capabilities."

# In Product definition
strategicHorizon:
  description: |
    Strategic time horizon for this product offering.
    See Capability.strategicHorizon for framework details.
  type: string
  enum: [h1, h2, h3]

# In Service definition  
strategicHorizon:
  description: |
    Strategic time horizon for this service offering.
    See Capability.strategicHorizon for framework details.
  type: string
  enum: [h1, h2, h3]
```

**Design Decision Documentation** (add to DESIGN-DECISIONS.md):

```markdown
## DD-NNN: Strategic Horizons Framework

**Status**: Accepted

### Context

Management consultancies commonly use the "Three Horizons" framework (popularized by McKinsey) for portfolio planning and investment allocation. The framework categorizes initiatives/offerings by time horizon:

- **Horizon 1**: Core business - defend and extend current success
- **Horizon 2**: Emerging opportunities - build emerging businesses  
- **Horizon 3**: Create viable options - seed future opportunities

Organizations need to balance investment across all three horizons.

### Decision

Add `strategicHorizon` enum property to Capability, Product, and Service types with values `h1`, `h2`, `h3`.

### Rationale

1. **Standard framework**: Used by McKinsey, BCG, Bain for strategy work
2. **Minimal impact**: Single optional field, no breaking changes
3. **High value**: Enables portfolio analysis and investment planning
4. **Aligns with principles**: 
   - P6 (business vocabulary) - consultants use this language
   - P5.2 (minimal required) - optional property
   - P10 (projection) - strategic layer, no BPMN mapping expected

### Alternatives Rejected

- **Horizon 1/2/3 as values**: Too verbose, `h1/h2/h3` is standard shorthand
- **Separate type for initiatives**: Too heavy for a classification dimension
- **Time-based instead**: Horizons are conceptual, not fixed time periods

### Consequences

- Enables strategy consultants to classify portfolio items
- Supports horizon-based filtering and views
- Aligns UBML with industry-standard strategic planning
```

**Effort**: 2-4 hours (schema + tests + docs)

---

### Change 2: Portfolio Strategic Classification (BCG Matrix)

**Status**: RECOMMENDED

**Rationale**:
- BCG Growth-Share Matrix is foundational in strategy consulting
- Helps prioritize investment decisions  
- Natural extension of existing Product/Service types
- Aligns with P6 (business vocabulary)

**Schema Changes**:

Add to `/schemas/1.4/types/strategy.types.yaml` in Product and Service definitions:

```yaml
# Portfolio positioning properties
portfolioClassification:
  description: |
    BCG Growth-Share Matrix classification.
    
    Based on market growth rate (high/low) and relative market share (high/low):
    - star: High growth, high share - Invest heavily
    - cash-cow: Low growth, high share - Maintain, harvest cash
    - question-mark: High growth, low share - Selective investment
    - dog: Low growth, low share - Harvest or divest
    
    Standard framework for portfolio strategy decisions.
  type: string
  enum: [star, cash-cow, question-mark, dog]
  x-ubml:
    propertyNames: ["portfolioClassification", "bcgClassification"]
    valueMistakes:
      "star-product":
        value: "star-product"
        hint: "Use 'star' for high-growth, high-share products."
      "cash cow":
        value: "cash cow"
        hint: "Use 'cash-cow' (hyphenated) for low-growth, high-share products."
      question:
        value: "question"
        hint: "Use 'question-mark' for high-growth, low-share products."
      problem-child:
        value: "problem-child"
        hint: "Use 'question-mark' - this is the modern BCG term."

marketGrowthRate:
  description: |
    Market growth rate classification for BCG matrix.
    Typically >10% is high, <10% is low, but industry-specific.
  type: string
  enum: [high, low]

relativeMarketShare:
  description: |
    Relative market share (vs. largest competitor) for BCG matrix.
    >1.0 is high (market leader), <1.0 is low (follower).
  type: string  
  enum: [high, low]

strategicAction:
  description: |
    Recommended strategic action based on portfolio position.
    - invest: Grow aggressively (typical for stars, selective question-marks)
    - maintain: Defend position (typical for cash-cows)
    - harvest: Maximize short-term cash (aging cash-cows, dogs)
    - divest: Exit the business (dogs with no turnaround potential)
  type: string
  enum: [invest, maintain, harvest, divest]
  x-ubml:
    propertyNames: ["strategicAction", "action"]
    valueMistakes:
      grow:
        value: "grow"
        hint: "Use 'invest' for growth strategy."
      hold:
        value: "hold"
        hint: "Use 'maintain' to defend current position."
      exit:
        value: "exit"
        hint: "Use 'divest' for exit strategy."
```

**Design Decision Documentation** (add to DESIGN-DECISIONS.md):

```markdown
## DD-NNN: BCG Growth-Share Matrix Support

**Status**: Accepted

### Context

The BCG Growth-Share Matrix (developed by Boston Consulting Group in the 1970s) is one of the most widely-used strategy frameworks for portfolio analysis. It classifies offerings based on:

1. Market growth rate (proxy for market attractiveness)
2. Relative market share (proxy for competitive strength)

This creates a 2x2 matrix with strategic implications for resource allocation.

### Decision

Add portfolio classification fields to Product and Service types:
- `portfolioClassification`: star/cash-cow/question-mark/dog
- `marketGrowthRate`: high/low
- `relativeMarketShare`: high/low  
- `strategicAction`: invest/maintain/harvest/divest

All fields optional. Classification can be derived from growth/share or set directly.

### Rationale

1. **Ubiquitous framework**: Every strategy consultant knows the BCG matrix
2. **Portfolio decisions**: Enables investment prioritization across products/services
3. **Minimal intrusion**: Optional fields on existing types
4. **Consultant vocabulary**: Uses standard BCG terminology
5. **Aligns with principles**:
   - P6 (business vocabulary) - BCG terms are universal in consulting
   - P5.2 (minimal required) - all optional
   - P10 (projection) - strategic framework, no OMG equivalent

### Alternatives Rejected

- **Separate portfolio analysis type**: Over-engineered for simple classification
- **Numeric growth/share values**: Too detailed for strategic modeling; consultants think in high/low
- **Different classification scheme**: BCG is the industry standard

### Consequences

- Strategy consultants can classify portfolio items using standard framework
- Enables portfolio-level views and investment prioritization
- Opens door for future portfolio analysis tools (bubble charts, etc.)
- No impact on users who don't need portfolio strategy features
```

**Effort**: 4-6 hours (schema + tests + docs + examples)

---

### Change 3: Customer Journey Metadata on Value Streams

**Status**: RECOMMENDED

**Rationale**:
- Customer journey mapping is standard consulting practice
- Natural fit with existing ValueStream.stages
- Service design principles increasingly important
- Minimal schema change (extend existing)

**Schema Changes**:

Extend ValueStream.stages in `/schemas/1.4/types/strategy.types.yaml`:

```yaml
# In ValueStream.stages items
stages:
  type: array
  items:
    type: object
    additionalProperties: false
    required: [name]
    properties:
      name:
        type: string
      description:
        type: string
      processes:
        type: array
        items:
          $ref: "../defs/refs.defs.yaml#/$defs/ProcessRef"
      
      # NEW: Customer journey properties
      customerTouchpoints:
        description: |
          Customer interaction points in this stage.
          Where/how the customer experiences this part of the journey.
          
          Examples: "Website", "Sales call", "Email notification", "Support chat"
        type: array
        items:
          type: string
      
      customerEmotionalState:
        description: |
          Customer's emotional state during this stage.
          Helps identify moments of delight or frustration.
        type: string
        examples:
          - curious
          - anxious
          - frustrated
          - delighted
          - confused
          - confident
      
      painPoints:
        description: |
          Customer pain points or frustrations in this stage.
          Service design opportunities.
        type: array
        items:
          type: string
      
      momentsOfTruth:
        description: |
          Critical moments that shape customer perception.
          Make-or-break touchpoints in this stage.
        type: array
        items:
          type: string
      
      customerValue:
        description: |
          Value delivered to customer in this stage.
          What the customer gains or accomplishes.
        type: string
```

**Design Decision Documentation** (add to DESIGN-DECISIONS.md):

```markdown
## DD-NNN: Customer Journey Mapping in Value Streams

**Status**: Accepted

### Context

Service design and customer experience (CX) consulting require understanding the customer's journey - touchpoints, emotions, pain points, and moments of truth. This is distinct from operational process modeling (which focuses on internal activities).

Value streams already model end-to-end customer value delivery. They are the natural place to capture customer journey metadata.

### Decision

Extend ValueStream.stages with optional customer journey properties:
- `customerTouchpoints`: Where/how customer interacts
- `customerEmotionalState`: How customer feels  
- `painPoints`: Customer frustrations
- `momentsOfTruth`: Critical perception-shaping moments
- `customerValue`: What customer gains

All properties optional and free-text/arrays for flexibility.

### Rationale

1. **Natural fit**: Value streams are already customer-focused
2. **Service design**: Standard CX consulting practice
3. **Minimal intrusion**: Extends existing type, fully optional
4. **Flexibility**: Free-text supports diverse industries/contexts
5. **Aligns with principles**:
   - P3.1 (nesting for ownership) - journey metadata owned by stage
   - P5.2 (minimal required) - all optional
   - P6 (business vocabulary) - CX/service design terms

### Alternatives Rejected

- **Separate journey document type**: Would duplicate value stream structure
- **Link to separate journey maps**: Value stream IS the journey at strategic level
- **Structured emotion taxonomy**: Too rigid; context varies by industry

### Consequences

- CX consultants can model customer journeys within value streams
- Service design insights captured alongside operational processes
- Enables journey-focused views and pain point analysis
- Bridges strategy (value streams) and operations (processes)
```

**Effort**: 3-5 hours (schema + tests + docs + examples)

---

### Change 4: Enhanced MECE Validation Warnings

**Status**: RECOMMENDED

**Rationale**:
- MECE principle is core to consulting problem-solving
- Current schema has `operator: mece` but no validation
- Low-cost enhancement to existing feature
- Improves consultant workflow

**Implementation**:

Add validation warnings (not errors) for hypothesis trees with `operator: mece`:

```typescript
// In validator
if (node.operator === 'mece' && node.children) {
  const childCount = Object.keys(node.children).length;
  
  // MECE typically has 2-5 categories; >7 suggests not truly MECE
  if (childCount > 7) {
    warnings.push({
      path: `${path}.children`,
      message: `MECE grouping has ${childCount} children. MECE groups typically have 2-5 categories. Consider if these are truly mutually exclusive and collectively exhaustive.`,
      severity: 'warning',
      hint: 'Review if this decomposition is actually MECE, or if some categories could be combined.'
    });
  }
  
  // Check for potential overlap in names (heuristic)
  const childTexts = Object.values(node.children).map(c => c.text.toLowerCase());
  for (let i = 0; i < childTexts.length; i++) {
    for (let j = i + 1; j < childTexts.length; j++) {
      if (haveSignificantOverlap(childTexts[i], childTexts[j])) {
        warnings.push({
          path: `${path}.children`,
          message: `Potential MECE violation: Child nodes may overlap. "${childTexts[i]}" and "${childTexts[j]}" seem similar.`,
          severity: 'info',
          hint: 'Ensure categories are mutually exclusive (no overlap).'
        });
      }
    }
  }
}
```

**Design Decision Documentation** (add to DESIGN-DECISIONS.md):

```markdown
## DD-NNN: MECE Validation Heuristics

**Status**: Accepted

### Context

The MECE principle (Mutually Exclusive, Collectively Exhaustive) is fundamental to McKinsey-style problem decomposition. UBML supports `operator: mece` on hypothesis nodes, but provides no guidance on whether a decomposition is actually MECE.

True MECE validation requires semantic understanding beyond schema validation. However, heuristics can warn users of likely violations.

### Decision

Add validation warnings (not errors) for hypothesis nodes with `operator: mece`:
1. Warn if >7 children (MECE groups are typically 2-5 categories)
2. Warn if child node texts appear to overlap (basic string similarity)

Warnings are advisory only; users can dismiss if they understand the issue.

### Rationale

1. **Consulting practice**: MECE groups are typically small (2-5 items)
2. **Educational**: Teaches MECE principle to users
3. **Non-blocking**: Warnings don't prevent saving/validation
4. **Aligns with principles**:
   - P6 (business vocabulary) - MECE is core consulting term
   - P4.1 (semantic validation) - validates meaning, not just structure

### Alternatives Rejected

- **No validation**: Misses opportunity to teach MECE
- **Hard errors**: Too strict; only user knows if decomposition is truly MECE
- **AI-based MECE checking**: Out of scope for core validation; could be future tool

### Consequences

- Users get feedback on likely MECE violations
- Educational benefit for consultants learning structured problem-solving
- May generate false positives; must be warnings, not errors
```

**Effort**: 4-6 hours (validation logic + tests + docs)

---

## Summary of Changes

| Change | Type | Effort | Impact | Priority |
|--------|------|--------|--------|----------|
| Three Horizons | Schema extension | 2-4h | High | P0 |
| BCG Matrix | Schema extension | 4-6h | High | P0 |
| Customer Journey | Schema extension | 3-5h | Medium | P1 |
| MECE Validation | Validation logic | 4-6h | Medium | P1 |

**Total Effort**: 13-21 hours

**Risk**: Low - all changes are additive, optional, and backward-compatible

---

## Principles Compliance

All proposed changes comply with UBML design principles:

- ✅ **P1 (Single Source of Truth)**: No duplication introduced
- ✅ **P2 (Consistent Patterns)**: Uses existing enum patterns
- ✅ **P3 (Hierarchy & Nesting)**: Extends existing structures appropriately
- ✅ **P4 (Explicitness)**: All semantics explicit, no inference
- ✅ **P5 (Schema Design)**: Documented enums, minimal required fields
- ✅ **P6 (Business Vocabulary)**: Uses standard consulting terms
- ✅ **P7 (Export Compatibility)**: Strategic layer, no BPMN mapping expected
- ✅ **P10 (Projection-First)**: Strategic frameworks beyond OMG scope

---

## Next Steps

If approved:

1. **Schema Changes** (Week 1)
   - Update strategy.types.yaml
   - Update hypothesis validation
   - Run schema generation

2. **Documentation** (Week 1-2)
   - Add design decisions to DESIGN-DECISIONS.md
   - Update WORKSPACE-SEMANTICS.md
   - Add consulting frameworks to README

3. **Examples** (Week 2)
   - Create example workspace with BCG classifications
   - Add three horizons example
   - Customer journey example

4. **Testing** (Week 2)
   - Schema validation tests
   - MECE validation tests
   - Integration tests

5. **CLI Support** (Week 3)
   - Add prompts for new fields
   - Update help text
   - Add consulting frameworks guide

---

## Future Phases

**Phase 2: Core Consulting** (deferred to Schema 1.6+):
- Issue trees (distinct from hypothesis trees)
- Options analysis with decision matrices
- Value propositions framework
- RAPID decision modeling

**Phase 3: Strategic Planning** (future):
- Implementation roadmaps
- Storylines and key messages
- Competitive analysis (Porter's Five Forces)

These are documented in CONSULTING-FRAMEWORKS-RESEARCH.md for future consideration.

---

## Questions for Review

1. **Scope**: Are these four changes the right "Phase 1"?
2. **Terminology**: BCG uses "problem child" historically, but "question mark" is modern. Confirm "question-mark"?
3. **MECE validation**: Should this be in core validator or separate linter?
4. **Horizons naming**: `h1/h2/h3` vs `horizon1/horizon2/horizon3` - preference?
5. **Additional Phase 1 items**: Should we include anything else as quick wins?

---

## Approval

- [ ] Design approved by maintainers
- [ ] Principles compliance verified
- [ ] Implementation plan approved
- [ ] Schema version increment planned (1.4 → 1.5)
