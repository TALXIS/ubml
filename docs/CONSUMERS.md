# UBML Consumers & Personas

> Who uses UBML, what they need, and how they interact with the tooling.
> This is the single source of truth for persona definitions. Other docs reference this file instead of re-describing audiences.

---

## Go-to-Market Context

UBML is built by a management consulting agency. The primary adoption pattern is **consultant-led engagement** that transitions into **client self-service**:

1. Consultants use UBML to model a client's business during an engagement
2. Client stakeholders collaborate on the same model using the same tools
3. Stakeholders get excited about the tool and start contributing directly
4. Consulting capacity is gradually replaced by client autonomy
5. The agency remains available for advanced modeling and analysis

This means every persona — consultant and client alike — works in the same workspace, with the same tooling, on the same model. The tool must be approachable enough for client people while powerful enough for professional analysts.

---

## Primary Input Pattern

The dominant way content enters UBML is **unstructured capture**:

- Meeting transcripts dropped into the workspace
- Random anecdotes and corridor conversations
- Names of people and their pains
- Interview notes, workshop outputs, observations
- Existing documents, spreadsheets, slide decks

From this raw material, the tooling must:

1. **Create structure** — extract actors, processes, entities, insights
2. **Deduplicate information** — recognize when two sources describe the same thing
3. **Progressively compose a model** — build up a picture of how the business operates, how they make money, and where optimization opportunities exist
4. **Surface conflicts** — flag contradictory information without rejecting it
5. **Ask clarifying questions** — prompt users to resolve ambiguity and fill gaps
6. **Facilitate hypothesis-driven problem solving** — help frame improvements as testable hypotheses with evidence

---

## Personas

### Business Analyst

**The primary persona. UX is optimized for this role.**

Business analysts are the power users who spend the most time in the tool. They bridge the gap between what stakeholders say and what can be modeled, analyzed, and handed off.

| Attribute | Detail |
|-----------|--------|
| **Background** | Process analysis, requirements elicitation, business architecture |
| **Tech comfort** | Comfortable with structured text, spreadsheets, and light tooling — not a developer |
| **Context** | Works across multiple engagements; needs to ramp up and ramp down quickly on different client domains |

**What they do in UBML:**
- Process meeting transcripts and interview notes into structured models
- Map processes end-to-end: who does what, with what information, through which handoffs
- Track anecdotes from stakeholders — pains, workarounds, informal processes
- Build and refine hypotheses about where the business can improve
- Describe the effective (actual) process, not just the official one
- Define and track metrics that measure value delivery
- Plan improvements and build business cases with ROI estimates

**What they need from tooling:**
- Minimal friction to capture — faster than writing on a napkin
- Intelligent structuring of messy input (transcripts → model fragments)
- Guidance on what to capture next (progressive refinement through questions)
- Clear visibility into model completeness and gaps
- Effective handover artifacts for stakeholders and developers

**Key success metric:** An analyst walks out of a workshop with a structured model instead of scattered notes.

---

### Management Consultant

Consultants run the engagement. They facilitate workshops, conduct interviews, and synthesize findings into actionable recommendations. They may or may not do the detailed modeling themselves — often they capture raw material and collaborate with an analyst to structure it.

| Attribute | Detail |
|-----------|--------|
| **Background** | Strategy, operations, organizational design |
| **Tech comfort** | Varies widely — some are highly technical, others work primarily in PowerPoint and Excel |
| **Context** | Time-pressured, client-facing, needs to communicate findings persuasively |

**What they do in UBML:**
- Drop in meeting transcripts, interview recordings, and workshop outputs
- Capture quick observations and anecdotes during or after client interactions
- Review and validate structured models built by analysts
- Frame strategic hypotheses and improvement recommendations
- Present findings to client leadership

**What they need from tooling:**
- Near-zero learning curve for basic capture
- Export to polished presentation decks (PowerPoint) as a premium feature
- Multiple views of the same model — narrative for executives, detailed for analysts
- Collaborative editing so they can work alongside analysts and client stakeholders
- Clear connection between evidence (sources, insights) and recommendations

**Key success metric:** Consultants reach for UBML naturally because it makes their work easier, not because they're forced to use it.

---

### Client Stakeholder

Client stakeholders are the domain experts — the people who actually do the work being modeled. They are the source of truth about how the business really operates. The tool needs to make them comfortable enough to contribute directly.

| Attribute | Detail |
|-----------|--------|
| **Background** | Operations, customer service, logistics, finance — any business function |
| **Tech comfort** | Low to moderate. They use business applications daily but have zero tolerance for technical notation |
| **Context** | Busy with their actual job. Contributing to UBML is secondary to their primary responsibilities |

**What they do in UBML:**
- Validate models — confirm "yes, this is what we actually do"
- Provide corrections and additional context
- Share pains, workarounds, and informal knowledge
- Throw problems and ideas at the tool for the analyst to incorporate
- Review improvement proposals and provide feedback

**What they need from tooling:**
- Plain-language views they can understand without learning any notation
- Low-friction ways to contribute (comments, corrections, quick capture)
- Collaborative features that let them work in the same model as the consulting team
- Confidence that their input is heard and incorporated

**Key success metric:** Stakeholders engage with the model during the engagement, not weeks later when reviewing a report.

---

### Operations Leader

Operations leaders own the processes being modeled. They care about throughput, cost, quality, and bottlenecks. They are both consumers and validators of the model.

| Attribute | Detail |
|-----------|--------|
| **Background** | Process ownership, continuous improvement, lean/six sigma |
| **Tech comfort** | Moderate. Familiar with process maps and KPI dashboards |
| **Context** | Accountable for operational performance. Needs evidence-based justification for changes |

**What they do in UBML:**
- Identify bottlenecks and improvement opportunities
- Validate process models against operational reality
- Define KPIs and performance targets
- Evaluate business cases for proposed changes
- Track improvement execution and measure outcomes

**What they need from tooling:**
- Process views that show flow, timing, and resource utilization
- KPI dashboards connected to the model
- Scenario comparison — current state vs. proposed changes
- Clear ROI and business case artifacts

**Key success metric:** Improvement proposals are grounded in models that show *why* the change will deliver value.

---

### Strategy Team Member

Strategy teams use UBML to connect high-level organizational goals with operational reality. They work at the capability and value stream level.

| Attribute | Detail |
|-----------|--------|
| **Background** | Strategic planning, portfolio management, business architecture |
| **Tech comfort** | Moderate. Comfortable with frameworks like TOGAF, capability maps |
| **Context** | Long planning horizons. Needs to justify investment decisions |

**What they do in UBML:**
- Map capabilities and assess maturity
- Define value streams and connect them to processes
- Build strategic business cases for transformation programs
- Prioritize investments across competing initiatives

**What they need from tooling:**
- Capability maps and value stream views
- Portfolio-level visibility across multiple workspaces
- Investment analysis and prioritization support

---

### Software Developer (Downstream Consumer)

Developers don't author UBML models. They receive them as context for implementation work. One of UBML's core goals is **effective handover from analysts to developers** — not to specify implementation, but to describe how the business makes money and what is part of core operations.

| Attribute | Detail |
|-----------|--------|
| **Background** | Software engineering, system design |
| **Tech comfort** | High |
| **Context** | Needs to understand business context to build the right thing. Often receives incomplete or ambiguous specifications |

**What they consume from UBML:**
- Process models that explain the business workflow they're building for
- Entity models that describe the business objects their system will manage
- Actor models that clarify who uses the system and why
- Hypothesis and metric context that explains what success looks like
- Evidence chains that answer "why does the process work this way?"

**What they need from tooling:**
- Readable exports in formats they're accustomed to (Markdown, diagrams, structured data)
- BPMN/UML exports when formal notation is required
- Clear traceability from model to original business observations
- Ability to ask questions back to the analyst through the tool

**Key success metric:** Developers build software that matches how the business actually works, with fewer change requests traced to specification gaps.

---

## Collaboration Model

All personas work in the **same workspace on the same model**. The tool adapts the view, not the data:

| Persona | Primary interaction | View preference |
|---------|-------------------|-----------------|
| Business Analyst | Model authoring, transcript processing, hypothesis building | Detailed process and entity views |
| Management Consultant | Quick capture, review, presentation | Narrative and summary views |
| Client Stakeholder | Validation, feedback, idea contribution | Plain-language narrative |
| Operations Leader | KPI review, bottleneck analysis, scenario comparison | Process flow and metrics dashboards |
| Strategy Team Member | Capability mapping, value stream design | Strategic and portfolio views |
| Software Developer | Context consumption, question-asking | Structured exports, diagrams |

### Collaboration Principles

1. **Same model, different lenses** — the underlying data is shared; views are persona-specific
2. **Contributor-friendly** — anyone can throw problems, ideas, and observations at the tool; the analyst structures them
3. **Progressive engagement** — stakeholders start by validating, then correcting, then contributing directly
4. **Transparent provenance** — every model element traces back to who said what and when, building trust across roles

---

## What UBML Is Not Optimized For

To stay focused, UBML explicitly deprioritizes:

- **Software architects** designing system internals — use UML, C4, or architecture-specific tools
- **Project managers** tracking task completion — use project management tools
- **IT operations** managing infrastructure — use ITIL tooling and monitoring
- **Data engineers** designing schemas — use ERD tools and data catalogs

UBML describes *how the business makes money and where to optimize* — not how to build the software that supports it.
