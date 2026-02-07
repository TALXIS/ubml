# Documentation Improvements Plan

> **Source**: GitHub Pages documentation review and new user onboarding analysis
> **Date**: 2026-02-07
> **Status**: Proposed
> 
> **Context**: UBML has strong technical foundation but documentation structure prevents new users from discovering and learning the notation. Current docs assume maintainer audience; need clear path for consultants, analysts, and developers.

---

## Executive Summary

**Current State**: Documentation is comprehensive but poorly organized for new users. Technical content (VISION, PRINCIPLES) is hidden in maintainer-focused folders. No clear learning path, missing critical tutorials, and broken references.

**Key Issues**:
- GitHub Pages shows flat file list with no navigation
- `docs/README.md` says "Audience: Maintainers" — scares away users
- Missing: tutorial, CLI reference, element catalog, FAQ
- Broken links: `docs/DEVELOPER.md` referenced but doesn't exist
- Examples exist but unexplained

**Goal**: Create documentation that enables a business consultant with zero UBML experience to:
1. Understand what UBML is in 3 minutes (landing page)
2. Model their first process in 15 minutes (tutorial)
3. Find answers independently (reference docs)
4. Export to BPMN when needed (projections guide)

---

## Priority 1: Critical Path for New Users (Must Have)

### 1.1 Create Documentation Landing Page ❌

**File**: `docs/index.md` or restructured root `README.md`

**Purpose**: First page users see on `ubml.talxis.com`. Must orient and guide.

**Content Structure**:
```markdown
# UBML Documentation

Quick navigation:
- **[What is UBML?](VISION.md)** — Problem, solution, who it's for
- **[Get Started in 10 Minutes](guide/QUICKSTART.md)** — First model
- **[CLI Reference](guide/CLI-REFERENCE.md)** — All commands
- **[Element Catalog](guide/ELEMENTS.md)** — What you can model
- **[Concepts](guide/CONCEPTS.md)** — How UBML works
- **[FAQ](guide/FAQ.md)** — Common questions

For developers:
- **[API Documentation](guide/API.md)** — TypeScript/JavaScript SDK
- **[Contributing](../CONTRIBUTING.md)** — Build and extend UBML

Export & Integration:
- **[BPMN/ArchiMate Export](projections/README.md)** — Mapping to standards
```

**Success metric**: User can find tutorial link in <10 seconds

---

### 1.2 Write Step-by-Step Tutorial ❌

**File**: `docs/guide/QUICKSTART.md` (or `TUTORIAL.md`)

**Scope**: 10-15 minute guided walkthrough building a real process

**Outline**:
```markdown
# Your First UBML Model — 10 Minute Tutorial

Learn UBML by modeling a simple invoice approval process.

## Prerequisites
- Node.js 18+ installed
- 15 minutes
- Basic YAML knowledge (we'll teach the UBML parts)

## Step 1: Create Workspace (2 min)
npx ubml init invoice-approval
cd invoice-approval
# Explain what files were created and why

## Step 2: Model the Process (5 min)
# Interactive: ubml add step "Submit Invoice"
# File-based: Edit process.ubml.yaml
# Show BOTH approaches, recommend CLI for learning

## Step 3: Add Actors (3 min)
# Who does the work?
# ubml add actor "Accounts Payable Clerk"

## Step 4: Connect and Validate (2 min)
# Assign actors to steps (RACI)
# Run validation
# Fix one intentional error (shows validation UX)

## Step 5: Export (optional, 2 min)
# Show projection to Mermaid/BPMN
# Open in viewer

## Next Steps
- [Model your own process](CONCEPTS.md#process-modeling)
- [Add metrics](CONCEPTS.md#metrics)
- [Explore examples](../../example/)
```

**Implementation notes**:
- Use realistic business scenario (not "foo/bar")
- Show validation errors and how to fix
- Include screenshots/ASCII diagrams of workflow
- Link to deeper docs from each section

---

### 1.3 CLI Command Reference ❌

**File**: `docs/guide/CLI-REFERENCE.md`

**Purpose**: Searchable documentation for every CLI command

**Structure**:
```markdown
# CLI Command Reference

Complete reference for the UBML command-line interface.

Quick reference: `ubml --help` | [Installation](#installation)

---

## Core Commands

### ubml init
Create a new UBML workspace

**Usage**:
```bash
ubml init [options] <name>
```

**Arguments**:
- `<name>` — Workspace name (creates directory)

**Options**:
- `--template <name>` — Use specific template (default: basic)
- `--no-examples` — Skip example content
- `--git` — Initialize git repository

**Examples**:
```bash
ubml init customer-onboarding
ubml init crm-process --template consulting
```

**What it does**:
1. Creates `<name>/` directory
2. Generates workspace.ubml.yaml config
3. Creates template files (process, actors)
4. Configures VS Code schema validation

**Next**: [Add your first process](#ubml-add)

---

### ubml add
[Full documentation for add command, all subcommands]

### ubml validate
[Full documentation including --fix flag, error interpretation]

### ubml show
[All view types: tree, actors, processes, etc.]

### ubml schema
[Schema exploration command]

---

## Advanced Commands

### ubml nextid
[ID generation]

### ubml syncids
[ID synchronization]

---

## Global Options
```

**Source**: Extract from CLI help output, expand with examples

**Implementation**: Could generate from Commander.js definitions programmatically

---

### 1.4 Element Catalog ❌

**File**: `docs/guide/ELEMENTS.md`

**Purpose**: Reference for all UBML element types — what they mean, when to use

**Structure**:
```markdown
# UBML Element Reference

Catalog of all elements you can model in UBML.

Quick jump: [Process](#process) | [Actor](#actor) | [Entity](#entity) | [Metric](#metric) | ...

---

## Process Elements

### Process
**What**: A sequence of activities that transforms inputs into outputs

**When to use**: Map how work flows through your organization
- Customer onboarding
- Order fulfillment  
- Monthly close process

**Properties**:
- `name` (required) — "Customer Onboarding"
- `level` — Process depth: 1 (value stream) to 4 (detailed)
- `steps` — Activities in this process
- `owner` — ActorRef to responsible role
- `kpi` — Metrics for this process

**Example**:
```yaml
processes:
  PR00001:
    name: "Invoice Approval"
    level: 3
    owner: AC00001  # CFO
    steps:
      ST00001:
        name: "Submit Invoice"
        # ...
```

**Related**: [Step](#step), [Phase](#phase), [Link](#link)
**CLI**: `ubml add process`, `ubml schema process`

---

### Step
[Full step documentation with kind values, RACI explanation]

---

## Organization Elements

### Actor
[Roles, teams, systems, personas]

### Skill
[Competencies and qualifications]

---

## Strategy Elements

### Value Stream
[End-to-end value creation]

### Capability
[Organizational abilities]

---

## Analysis Elements

### Metric (KPI)
[Performance indicators]

### Hypothesis
[Problem analysis trees]

### Scenario
[Simulation and what-if analysis]

---

## Knowledge Layer

### Source
[Meeting transcripts, documents, interviews]

### Insight
[Facts extracted from sources]

---

## Supporting Elements

### Entity
[Data model]

### Location
[Physical/logical places]

### Custom Fields
When to use `custom:` vs native properties
```

**Based on**: schemas/1.3/types/, CLI `ubml enums` output

---

### 1.5 Concepts Guide ❌

**File**: `docs/guide/CONCEPTS.md`

**Purpose**: Explain how UBML pieces fit together conceptually

**Topics**:
```markdown
# UBML Concepts

Understanding how UBML works.

---

## Workspaces
A workspace is a folder containing related UBML documents.

[Diagram: workspace → documents → elements]

**Structure**:
- `*.workspace.ubml.yaml` — Configuration (required, one per workspace)
- `*.process.ubml.yaml` — Process models
- `*.actors.ubml.yaml` — People, teams, systems
- `*.entities.ubml.yaml` — Data/information model
- ... (all document types)

**Why split files?**
- Large models: separate concerns, parallel editing
- Team work: avoid merge conflicts
- Reuse: same actors across multiple processes

---

## Documents vs Elements
- **Document**: A `.ubml.yaml` file (actors, process, metrics)
- **Element**: An item inside a document (actor AC00001, step ST00003)

Documents organize elements by type/purpose.

---

## IDs and References
Every element has a unique ID. Other elements reference it.

**ID patterns**:
- Actors: AC##### (AC00001, AC00002)
- Processes: PR##### (PR00001)
- Steps: ST##### (ST00001)
- [Complete list]

**References**:
```yaml
steps:
  ST00001:
    name: "Review Application"
    performer: AC00003  # ← Reference to actor
```

Validator checks: does AC00003 exist?

**Next ID**: `ubml nextid AC` → suggests AC00015

---

## Validation Levels
UBML has progressive validation:

1. **Syntax**: Valid YAML?
2. **Schema**: All required fields present? Correct types?
3. **References**: Do IDs exist? Cross-file links valid?
4. **Semantics**: Does model make sense? (warnings)

You can save invalid models while exploring. Validate when ready.

---

## Knowledge Layer (Sources → Insights → Model)
[P12.4 from PRINCIPLES — explain traceability chain]

---

## Process Levels (L1-L4)
[Explain value stream → subprocess hierarchy]

---

## RACI Matrix
[How responsibility works on steps]

---

## Blocks vs Phases
[Control flow vs organizational structure]

---

## Export & Projections
UBML is your working format. Export to formal standards when needed.

**Supported targets**:
- BPMN 2.0 (process execution)
- ArchiMate 3.2 (enterprise architecture)
- Mermaid (documentation diagrams)
- [See projections guide](../projections/README.md)

**Note**: Export is lossy (UBML captures context that standards don't)
```

---

### 1.6 FAQ ❌

**File**: `docs/guide/FAQ.md`

**Content**: Extract from GitHub Issues, Discussions, common mistakes

**Topics**:
- When to use UBML vs BPMN?
- Why are my files not validating? (Check file naming pattern)
- How do I model parallel activities? (Blocks)
- Can I use UBML without CLI? (Yes, direct YAML editing)
- What's the difference between actor and persona?
- How do I handle subprocess calls?
- What if UBML doesn't have the element I need? (custom: fields)
- How do I export to BPMN?
- Can I import from existing BPMN? (No, not yet)
- Is UBML production-ready? (See CHANGELOG, version strategy)

---

### 1.7 Fix Broken DEVELOPER.md Reference ❌

**Options**:
1. **Create the guide** at `docs/guide/API.md` (or `DEVELOPER.md`)
2. **Remove the reference** from README until written

**Content for API.md**:
```markdown
# UBML SDK — Developer Guide

Using UBML as a library in TypeScript/JavaScript.

---

## Installation

npm install ubml

---

## Quick Start

### Parsing UBML Files

```typescript
import { parse } from 'ubml';

const yaml = `
ubml: "1.3"
processes:
  PR00001:
    name: "Order Processing"
`;

const doc = parse(yaml);
console.log(doc.processes.PR00001.name);
```

---

### Validation

```typescript
import { validate } from 'ubml';

const result = validate(doc);
if (result.errors.length > 0) {
  console.error(result.errors);
}
```

---

### Node.js File Operations

```typescript
import { validateWorkspace } from 'ubml/node';

const result = await validateWorkspace('/path/to/workspace');
```

---

## API Reference

### Core API
- parse()
- validate()
- serialize()

### Node API  
- validateWorkspace()
- loadWorkspace()
- scanWorkspace()

### TypeScript Types
All UBML elements have TypeScript types:
- Process, Step, Actor, Entity, Metric, ...

Import from 'ubml':
```typescript
import type { Process, Step } from 'ubml';
```

---

## ESLint Plugin

```typescript
import ubml from 'ubml/eslint';

export default [
  ubml.configs.recommended
];
```

---

## Advanced Usage

### Custom Validators
[If extensible]

### Schema Introspection
[How to programmatically explore schema]

---

## Examples

### Build a Process Miner
[Load UBML, extract steps, analyze]

### Generate Documentation Site
[Parse workspace, render HTML]

### Custom VS Code Extension
[Use ubml types for autocomplete]
```

**Decision needed**: Create now or defer?

---

## Priority 2: Improved Discoverability (Should Have)

### 2.1 Reorganize docs/ Folder ❌

**Problem**: `docs/README.md` says "Audience: Maintainers" — users skip valuable content

**Solution**: Separate user-facing from maintainer docs

**New structure**:
```
docs/
├── index.md                    # Landing page (NEW)
├── VISION.md                   # Keep here, link from index
├── guide/                      # USER-FACING (NEW)
│   ├── QUICKSTART.md           # Tutorial
│   ├── CONCEPTS.md             # How UBML works
│   ├── CLI-REFERENCE.md        # Command docs
│   ├── ELEMENTS.md             # Element catalog
│   ├── FAQ.md                  # Common questions
│   ├── TROUBLESHOOTING.md      # Error fixes
│   └── API.md                  # Developer SDK guide
├── projections/                # Keep as-is (already good)
├── design/                     # MAINTAINER-FACING (MOVED)
│   ├── README.md               # "Audience: Contributors"
│   ├── PRINCIPLES.md           # (moved from docs/)
│   ├── DESIGN-DECISIONS.md     # (moved from docs/)
│   ├── WORKSPACE-SEMANTICS.md  # (moved from docs/)
│   └── OPEN-TOPICS.md          # (moved from docs/)
└── schemas/                    # Link to ../schemas/README.md?
```

**Impact**:
- Moves PRINCIPLES/DESIGN-DECISIONS to `design/` (maintainer docs)
- Creates `guide/` for user-facing content
- `docs/index.md` clearly separates audiences
- VISION stays at `docs/` (it's for everyone)

---

### 2.2 Add README to example/ Folder ❌

**File**: `example/README.md`

**Purpose**: Explain what's in the example workspace

**Content**:
```markdown
# Example UBML Workspace

This folder contains a complete UBML workspace modeling customer onboarding for a fictional company (ACME Corp).

---

## What's Here

| File | Purpose | Learning Focus |
|------|---------|----------------|
| [workspace.ubml.yaml](workspace.ubml.yaml) | Workspace configuration | How to set up a UBML project |
| [process.ubml.yaml](process.ubml.yaml) | Customer onboarding process (L3) | Steps, inputs/outputs, decisions |
| [actors.ubml.yaml](actors.ubml.yaml) | Roles, teams, systems | Actor types: person, team, system |
| [entities.ubml.yaml](entities.ubml.yaml) | Documents and data | Entity relationships |
| [metrics.ubml.yaml](metrics.ubml.yaml) | KPIs for the process | Metrics, thresholds, targets |
| [sources.ubml.yaml](sources.ubml.yaml) | Meeting transcripts | Knowledge layer sources |
| [insights.ubml.yaml](insights.ubml.yaml) | Facts from sources | Traceability chain |

---

## How to Use

### Option 1: Explore in Place
```bash
cd example/
ubml validate .
ubml show tree
```

### Option 2: Copy and Modify
```bash
cp -r example/ my-project/
cd my-project/
# Edit files for your use case
```

### Option 3: Learn by Reading
Open files in order:
1. workspace.ubml.yaml — see configuration
2. actors.ubml.yaml — who does the work
3. process.ubml.yaml — what happens
4. entities.ubml.yaml — what information is involved
5. metrics.ubml.yaml — how to measure success

---

## Key Concepts Demonstrated

- **Process levels**: This is a Level 3 (detailed) process
- **RACI assignment**: Steps have `performer` (who does it)
- **Cross-references**: Steps reference actors, entities
- **Progressive disclosure**: Start simple, add detail
- **Knowledge tracing**: Process elements link to insights → sources

---

## More Examples

- **[CETIN FTTH](../example_cetin/)** — Real-world telecom scenario (complex)
- **[Samples](../samples/)** — Mermaid diagrams (pre-UBML modeling notes)

---

## Next Steps

- [Follow the tutorial](../docs/guide/QUICKSTART.md) to build your own
- [Read concepts guide](../docs/guide/CONCEPTS.md) to understand structure
- [Browse CLI reference](../docs/guide/CLI-REFERENCE.md) for commands
```

**Link from**: Main README (Getting Started section)

---

### 2.3 Add Troubleshooting Guide ❌

**File**: `docs/guide/TROUBLESHOOTING.md`

**Purpose**: Help users fix common errors independently

**Structure**:
```markdown
# Troubleshooting Guide

Common UBML errors and how to fix them.

---

## Validation Errors

### "Unknown property X at line Y"
**Cause**: Property doesn't exist in schema, or wrong document type

**Fix**:
1. Check spelling: `owner` vs `owners`
2. Check document type: did you put process fields in actors file?
3. Check schema with: `ubml schema <type>`
4. Use `custom:` for non-standard fields:
   ```yaml
   custom:
     myCustomField: "value"
   ```

**Common mistakes**:
- `owner` on Step → use `performer` or `raci`
- `properties` on Entity → use `attributes`
- `participants` → use `raci` for responsibility
- `goal` → belongs in strategy or hypotheses

---

### "Reference to undefined ID: AC99999"
**Cause**: Referenced an actor/process/entity that doesn't exist

**Fix**:
1. Check ID exists: `ubml show actors` (look for AC99999)
2. Check spelling: AC00001 vs AC0001
3. Check file naming: is `actors.ubml.yaml` → `*.actors.ubml.yaml`?
4. Create missing element: `ubml add actor`

**Workspace validation catches these** (cross-file references)

---

### "Invalid duration format: 90 days"
**Fix**: Use UBML duration syntax:
- `90d` (days)
- `2h` (hours)
- `30min` (minutes)
- `1wk` (weeks)
- `3mo` (months)

---

### Files Not Found by Validator
**Symptom**: ubml validate . → passes, but file has errors

**Cause**: File name doesn't match pattern

**Required patterns**:
- `*.process.ubml.yaml` (not `process-broken.ubml.yaml`)
- `*.actors.ubml.yaml`
- `*.entities.ubml.yaml`
- etc.

**Fix**: Rename file to match pattern

---

## CLI Issues

### "Command not found: ubml"
**Fix**:
- Using npx: `npx ubml <command>`
- Install globally: `npm install -g ubml`

---

### VS Code Schema Validation Not Working
**Symptoms**: No red squiggles, no autocomplete

**Fixes**:
1. Check file extension: `.ubml.yaml` (not `.yaml`)
2. Install YAML extension: "YAML Language Support by Red Hat"
3. Reload VS Code: Cmd+Shift+P → "Reload Window"
4. Check workspace has workspace.ubml.yaml

---

## Model Design Questions

### When to Use custom: Fields?
**Use custom: when**:
- Capturing domain-specific attributes UBML doesn't model
- Prototyping before schema change
- Tool-specific metadata

**Don't use custom: if**:
- Native property exists (check `ubml schema <type>`)
- Could map to existing element (check `ubml help elements`)

---

### How to Model Parallel Activities?
**Use blocks**:
```yaml
blocks:
  BL00001:
    operator: parallel
    members: [ST00001, ST00002, ST00003]
```

See: `ubml help blocks`

---

### Process vs Subprocess?
- **Process**: Top-level workflow (PR00001)
- **Subprocess**: Called from step via `processCall`:
  ```yaml
  steps:
    ST00005:
      kind: processCall
      target: PR00002  # subprocess
  ```

---

## Performance

### Validation is Slow
**Expected**: Workspace-level validation checks all cross-references

**Optimize**:
- Validate single file: `ubml validate process.ubml.yaml`
- Skip semantic checks: `ubml validate --schema-only`

---

## Getting Help

**Still stuck?**
- Search docs: [ubml.talxis.com](https://ubml.talxis.com)
- Ask question: [GitHub Discussions](https://github.com/TALXIS/ubml/discussions)
- Report bug: [GitHub Issues](https://github.com/TALXIS/ubml/issues)
```

---

### 2.4 Link CHANGELOG from README ❌

**Change**: Add CHANGELOG to README "Learn More" table

```markdown
| Resource | What You'll Learn |
|----------|------------------|
| **[Vision](./docs/VISION.md)** | Why UBML exists, what problems it solves |
| **[Design Principles](./docs/PRINCIPLES.md)** | How the language is designed |
| **[Example Workspace](./example)** | Real-world sample with all document types |
| **[Changelog](./CHANGELOG.md)** | Version history and what's new |
| **CLI Help** | Run `ubml --help` for all commands |
```

---

### 2.5 Link Projections from README ❌

**Change**: Add export/projections to README

**Where**: After "File Types" section, add:

```markdown
---

## Exporting to BPMN, ArchiMate, and Other Standards

UBML is your **working format**. When clients or enterprise tools require formal notation, export from UBML:

| Target | Use Case | Status |
|--------|----------|--------|
| **BPMN 2.0** | Process execution engines | Stable |
| **ArchiMate 3.2** | Enterprise architecture | Stable |
| **Mermaid** | Markdown diagrams | Beta |
| **UML** | Activity/Class diagrams | Beta |

📖 **[Export Guide](./docs/projections/README.md)** — Mappings, what's preserved, what's lost

**Note**: Exports may be lossy (UBML captures business context that formal standards don't model). UBML remains source of truth.
```

---

## Priority 3: Nice to Have (Future)

### 3.1 Architecture Diagram ❌

**File**: `docs/ARCHITECTURE.md` or in CONCEPTS

**Content**: Diagram showing:
```
┌─────────────────────────────────────────┐
│           UBML Workspace                │
│  ┌─────────────────────────────────┐   │
│  │  workspace.ubml.yaml (config)   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Documents (*.ubml.yaml files)          │
│  ┌───────────┐  ┌──────────┐           │
│  │ process   │  │ actors   │  ...      │
│  └───────────┘  └──────────┘           │
│       │              │                  │
│       └──────┬───────┘                  │
│              ▼                          │
│      Elements (AC001, PR001, ST001)     │
│              │                          │
│              ▼                          │
│      ┌──────────────┐                   │
│      │  References  │                   │
│      └──────────────┘                   │
└─────────────────────────────────────────┘
         │
         ▼
   ┌────────────────┐
   │   Validation   │  ← Schema (JSON Schema)
   └────────────────┘
         │
         ├─→ CLI (ubml commands)
         ├─→ SDK (parse/validate API)
         └─→ Export (BPMN, ArchiMate)
```

---

### 3.2 Video Tutorial ❌

**Platform**: YouTube, embedded in docs

**Content**: 5-minute screencast
- `ubml init demo`
- Add process with CLI
- Add actors
- Validate
- Show in VS Code with schema hints

**Where to embed**: QUICKSTART.md, README

---

### 3.3 Interactive Playground ❌

**Platform**: CodeSandbox, StackBlitz, or custom web editor

**Content**: 
- Pre-loaded example workspace
- Live validation
- Try editing, see errors
- No installation needed

**Link from**: README, docs index

---

### 3.4 Migrate to Documentation Framework ❌

**Problem**: GitHub Pages default theme is minimal, no search

**Options**:
1. **VitePress** — Modern, Vue-based, great search
2. **Docusaurus** — React-based, versioning support
3. **MkDocs Material** — Python-based, beautiful theme
4. **Docsify** — No build step, dynamic loading

**Recommendation**: VitePress (TypeScript-native, minimal setup)

**Benefits**:
- Built-in search
- Sidebar navigation 
- Version switching
- Better mobile experience
- Code syntax highlighting

**Cost**: Build step required, more complex deployment

---

## Priority 4: Documentation System Improvements

### 4.1 Add Navigation File ❌

**Option A**: Create `_config.yml` for Jekyll (GitHub Pages default)

```yaml
title: UBML Documentation
description: Unified Business Modeling Language
theme: jekyll-theme-cayman  # or custom

navigation:
  - title: Home
    url: /
  - title: Get Started
    url: /guide/QUICKSTART
  - title: Reference
    children:
      - title: CLI Commands
        url: /guide/CLI-REFERENCE
      - title: Elements
        url: /guide/ELEMENTS
  - title: Export
    url: /projections/
```

**Option B**: Move to VitePress (see 3.4)

---

### 4.2 Create CNAME Configuration ✅

**Status**: Already exists (`ubml.talxis.com`)

**Verify**: GitHub Pages settings point to docs/ folder

---

### 4.3 Add Search ❌

**Current**: No search (default GitHub Pages)

**Options**:
1. **Algolia DocSearch** — Free for open source
2. **Lunr.js** — Client-side search
3. **VitePress/Docusaurus** — Built-in search (requires migration)

---

## Implementation Plan

### Phase 1: Critical Path (Week 1)
- [ ] Create docs/guide/ folder
- [ ] Write QUICKSTART.md tutorial
- [ ] Write CLI-REFERENCE.md (extract from CLI help)
- [ ] Create docs/index.md landing page
- [ ] Add example/README.md
- [ ] Fix or remove DEVELOPER.md reference

### Phase 2: Discovery (Week 2)
- [ ] Write CONCEPTS.md
- [ ] Write ELEMENTS.md catalog
- [ ] Write FAQ.md
- [ ] Write TROUBLESHOOTING.md
- [ ] Reorganize docs/ → design/ (maintainer docs)
- [ ] Link CHANGELOG from README
- [ ] Link projections from README

### Phase 3: Polish (Week 3)
- [ ] Create API.md developer guide
- [ ] Add architecture diagram
- [ ] Review all docs for broken links
- [ ] Add navigation (Jekyll config or migration)
- [ ] Set up Algolia search (if staying on GitHub Pages)

### Phase 4: Future Enhancements (Backlog)
- [ ] Video tutorial
- [ ] Interactive playground
- [ ] Migrate to VitePress/Docusaurus
- [ ] Version switching (when 2.0 arrives)

---

## Success Metrics

**Goal**: Reduce "time to first successful model" from unknown to <15 minutes

**Measurements**:
- [ ] User can find tutorial from landing page in <10 seconds
- [ ] Tutorial completion time: <15 minutes
- [ ] CLI reference answers "how do I add X?" for all element types
- [ ] FAQ covers top 10 GitHub Discussions questions
- [ ] Example README gets 30% of users exploring examples

**User feedback loops**:
- GitHub Discussions: "How did you learn UBML?"
- npm survey: "Was documentation helpful?" (post-install)
- Track docs page views (GitHub Pages analytics)

---

## Open Questions

1. **DEVELOPER.md**: Create now or defer until SDK usage stabilizes?
2. **Documentation framework**: Stay on GitHub Pages or migrate to VitePress?
3. **Video tutorial**: Worth investment pre-1.0?
4. **Interactive playground**: Build custom or use CodeSandbox?
5. **Search**: Essential now or defer to framework migration?

---

## Related Work

- **CLI UX improvements**: `plan/CLI-UX-IMPROVEMENTS.md` — Better error messages, help topics
- **Knowledge layer fixes**: `plan/KNOWLEDGE-LAYER-FIXES.md` — Schema improvements
- **Test findings**: `plan/EVALUATION-FINDINGS.md` — Real user pain points

Many documentation needs were exposed by blind testing (see EVALUATION-FINDINGS.md §"Missing Help Topics").

---

## References

- GitHub Pages: https://pages.github.com
- Jekyll themes: https://pages.github.com/themes/
- VitePress: https://vitepress.dev
- Docusaurus: https://docusaurus.io
- UBML Principles (P2: Progressive Discovery, P4: Readability First): `docs/PRINCIPLES.md`
