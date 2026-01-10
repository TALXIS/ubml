# UBML Tool Evaluation - Handover Document

**Evaluation Date:** January 10, 2026  
**Evaluator Role:** Business Analyst (simulated)  
**Scenario:** Initial stakeholder interviews for power transformer manufacturing company  
**UBML Version:** 1.1

---

## What Was Done

### Methodology
Simulated a real-world business analyst scenario:
- Role-played as BA meeting with various stakeholders (Operations Director, Production Manager, Engineering Lead, Procurement Manager, QA Manager)
- Captured business processes, pain points, metrics, and improvement hypotheses using UBML CLI
- Created a complete workspace from scratch using only the CLI tools and documentation
- Performed exploratory testing to identify bugs and usability issues

### Workspace Created
Complete business process model for power transformer manufacturing:

| File Type | Count | Elements |
|-----------|-------|----------|
| Processes | 3 | 30 steps across Engineering, Production, Procurement |
| Actors | 1 | 13 actors (6 roles, 5 systems, 1 customer, 1 external) |
| Entities | 1 | 4 entities + 3 documents + 2 locations |
| Metrics | 1 | 5 KPIs with baselines and targets |
| Hypotheses | 1 | 1 hypothesis tree (SCQH format, 9 nodes) |
| Scenarios | 1 | 2 scenarios (baseline + improvement) |
| Glossary | 1 | 13 domain terms + 6 categories |
| Links | 1 | 3 cross-process links |
| **Total** | **11 files** | **58+ elements** |

All files validated successfully (only unreferenced ID warnings, no errors).

---

## Key Findings

### ✅ What Works Well

1. **Excellent validation and error handling**
   - Clear error messages with line numbers
   - **Outstanding feature:** "did you mean?" suggestions for undefined references
   - Workspace-level hints (e.g., suggesting glossary for complex workspaces)

2. **Good help system structure**
   - `ubml schema --properties` shows available fields
   - `ubml syntax <element>` gives quick reference
   - `ubml show tree` provides excellent visualization

3. **Readable YAML format**
   - Business stakeholders can review raw files
   - Version control friendly
   - Intuitive nesting structure

4. **Smart CLI features**
   - `ubml nextid` prevents ID conflicts
   - `ubml show` gives quick workspace overview
   - Auto-generates helpful file templates

### ❌ Critical Usability Issues

#### Issue 1: Incomplete Documentation in CLI
**Severity:** High  
**Impact:** New users get stuck, can't learn the tool without external resources

| Command | Problem | Example |
|---------|---------|---------|
| `ubml schema hypotheses --properties` | Returns empty properties list | Shows no properties at all |
| `ubml examples <type>` | Minimal or empty output for most types | `examples hypothesisTree` returns nothing |
| `ubml schema links --template` | No example structure provided | Template is nearly empty |

**Result:** Had to guess syntax for links, hypothesis trees, and blocks. Trial-and-error learning.

#### Issue 2: Template Quality Varies Wildly
**Severity:** High  
**Impact:** Inconsistent onboarding experience

- ✅ Good: `process.ubml.yaml` has helpful starter content
- ❌ Poor: `links.ubml.yaml` is essentially empty
- ❌ Poor: `hypotheses.ubml.yaml` has structure but no guidance
- ❌ Poor: `glossary.ubml.yaml` uses numeric IDs (inconsistent with other element types)

**Recommendation:** Every template should include:
- Complete, commented example showing all major properties
- Inline documentation explaining when to use each property
- Real-world scenario (not "TODO: add description")

#### Issue 3: No Help for Advanced Features
**Severity:** Medium  
**Impact:** Can't use advanced features without external docs

Missing or insufficient help for:
- `blocks` (parallel execution) - no help topic
- `phases` - no help topic
- Cross-process `links` - no structure guidance
- `approval`, `review`, `batch` properties on steps

**Example:** Used blocks successfully but only by guessing syntax:
```yaml
blocks:
  BK02001:
    name: Parallel Quotation Requests
    operator: par
    steps: [ST02002, ST02003]
```

No documentation told me this was the correct structure.

---

### 🐛 Bugs Discovered

#### Bug 1: Glossary Template Has Inconsistent ID Pattern
**Steps to Reproduce:**
1. `ubml add glossary`
2. Observe template uses `01000:` (numeric, no prefix)
3. But all other elements use typed prefixes (AC###, PR###, etc.)

**Expected:** Either use `TM###` prefix or document that string keys are preferred  
**Actual:** Template suggests numeric keys; I used string keys (`MVA:`) which worked but unclear if correct

#### Bug 2: Single-File Validation Misses Cross-References
**Steps to Reproduce:**
1. Create a process file referencing non-existent actor `AC99999`
2. `ubml validate single-file.yaml` → passes ✓
3. `ubml validate .` → fails with undefined reference error

**Expected:** Warning when validating single file that cross-references won't be checked  
**Actual:** Silent pass, false sense of correctness

#### Bug 3: Missing Help Topics
**Steps to Reproduce:**
1. `ubml help blocks` → "Unknown topic: blocks"
2. Yet blocks are documented in schema and work in files

**Expected:** Help topic explaining blocks, phases, control flow  
**Actual:** Error message

---

### 📋 Documentation vs. Reality Discrepancies

#### Discrepancy 1: Duration Format
**Documentation says (PRINCIPLES.md):**
> Valid: `30min`, `2h`, `1.5d`, `1wk`, `3mo`  
> Invalid: `PT30M`

**Tool accepts:** ISO 8601 format `P21D`, `P14D`, `P7D`

**Used in evaluation:** ISO 8601 (validated successfully)

**Question:** Which is canonical? Docs need update or tool needs stricter validation?

#### Discrepancy 2: Glossary ID Patterns
**Template generates:** `01000:` (numeric)  
**Other elements use:** `AC###`, `PR###`, etc. (typed prefixes)  
**What I used:** String keys like `MVA:`, `ONAN:` (worked fine)

**Recommendation:** Document clearly what's expected for glossary terms.

---

## Recommendations for UBML Team

### Priority 1 (Must Fix)
| # | Issue | Solution |
|---|-------|----------|
| 1 | Empty schema properties output | Fix `schema --properties` to show all fields for all types |
| 2 | Minimal templates | Enhance all templates with complete, commented examples |
| 3 | Missing examples | Add realistic examples for all element types to `examples` command |
| 4 | Duration format confusion | Clarify canonical format in docs AND enforce in validator |

### Priority 2 (Should Fix)
| # | Issue | Solution |
|---|-------|----------|
| 5 | No cross-reference warning | Add warning when validating single files |
| 6 | Missing help topics | Add `help blocks`, `help phases`, `help links` |
| 7 | Glossary ID inconsistency | Document preferred pattern (string keys vs. numeric IDs) |
| 8 | No guidance on handoffs | Document pattern for modeling work transitions between roles |

### Priority 3 (Nice to Have)
| # | Enhancement | Benefit |
|---|-------------|---------|
| 9 | `ubml lint` command | Style suggestions, naming improvements |
| 10 | `ubml doctor` command | Workspace health check (orphaned elements, missing connections) |
| 11 | Interactive mode `--interactive` | Step-by-step prompts for element creation |
| 12 | `ubml rename` command | Safe ID refactoring across workspace |

---

## Strengths to Preserve

1. **Validation with suggestions** - The "did you mean?" feature is excellent
2. **Show tree visualization** - Clear, helpful overview with visual indicators
3. **Workspace hints** - Contextual suggestions (e.g., add glossary) are valuable
4. **ID management** - `nextid` command is very helpful
5. **Clean YAML format** - Readable by non-technical stakeholders

---

## Test Coverage Achieved

✅ **Successfully tested:**
- Workspace initialization
- Creating all major file types (process, actors, entities, metrics, hypotheses, scenarios, glossary, links)
- RACI assignments with actor references
- Cross-process links and triggers
- Parallel blocks (operator: par)
- Decision points and conditional flows
- Validation (both single-file and workspace-level)
- Show commands (summary, tree, processes, actors)
- Next ID generation
- Hypothesis trees with SCQH structure
- KPI definitions with thresholds

❌ **Not tested:**
- Process mining integration (*.mining.ubml.yaml)
- Strategy documents (*.strategy.ubml.yaml)
- Views (*.views.ubml.yaml)
- Phases (organizational groupings)
- Loop constructs
- Subprocess references with `processRef`
- Equipment and resource pools
- Skills and skill requirements
- Approval/review properties
- Constraint dates
- Message passing

---

## Bottom Line

**The UBML tool has a solid foundation but needs documentation and template improvements before it's ready for new users.**

### What's Working
- Core validation engine is excellent
- YAML format is appropriate for target audience
- File organization is logical
- Smart features (nextid, show tree, suggestions) are valuable

### What's Blocking Adoption
- Incomplete help system makes learning frustrating
- Template quality varies wildly
- Advanced features are undocumented
- Documentation/tool mismatches create confusion

### Recommended Next Steps
1. Fix schema properties output for all types
2. Enhance all templates with complete examples
3. Add missing help topics (blocks, phases, links)
4. Clarify duration format (docs vs. tool)
5. Add cross-reference validation warnings
