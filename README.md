# UBML — Unified Business Modeling Language

[![npm version](https://img.shields.io/npm/v/ubml.svg)](https://www.npmjs.com/package/ubml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**A notation for understanding how organizations create and deliver value.**

UBML is a YAML-based format for capturing business processes, organizational structures, and strategic initiatives. It bridges the gap between informal workshop discovery and formal business modeling—designed from the ground up for AI assistance and modern development workflows.

> 📖 **[Read the full vision →](./docs/VISION.md)**

---

## The Problem

Software development is getting dramatically faster. AI-assisted coding tools are turning what took weeks into hours. But this creates a new bottleneck: **understanding what to build**.

The gap is widening. Implementation accelerates while specification stays stuck in slides, scattered notes, and diagrams that can't be validated or versioned. Organizations produce more software, faster, that doesn't match how the business actually works.

Traditional modeling tools don't help:
- **UML/BPMN** demand precise semantics before you've understood the business
- **Diagramming tools** present blank canvases with no guidance
- **Workshop notes** can't be validated, connected, or processed

UBML solves this by treating business understanding as code—structured, validated, version-controlled, and designed for AI assistance.

---

## Who Is This For?

UBML is for everyone who needs to understand how a business works:

| Role | Use Case |
|------|----------|
| **Software engineers** | Understand the real-world context and motivation behind what you're building |
| **Management consultants** | Capture workshop findings in structured, validated models |
| **Business analysts** | Map how organizations actually operate |
| **Strategy teams** | Build ROI-backed business cases for change |
| **Operations leaders** | Identify bottlenecks and improvement opportunities |
| **Tool developers** | Embed UBML editing in web applications |

Whether you're figuring out *what to build* or *why it matters*, UBML provides a shared language between business and technology.

---

## What You Can Model

| Domain | Elements |
|--------|----------|
| **Processes** | Workflows (L1–L4), steps, decisions, phases |
| **Organization** | Roles, teams, systems, resource pools, skills |
| **Information** | Entities, documents, locations, relationships |
| **Strategy** | Value streams, capabilities, products, portfolios |
| **Analysis** | KPIs, ROI models, simulation scenarios |
| **Improvements** | Hypothesis trees to identify how to make more money |

---

## Key Features

- **Human-readable YAML** — Business people can read and validate models
- **Validation built-in** — Catch errors as you type, verify cross-document references
- **Version control with Git** — Track changes like code, see who changed what when
- **Editor support** — Red squiggles in VS Code show errors immediately
- **AI-ready** — Semantic structure designed for AI assistance
- **Open standard** — MIT licensed, no vendor lock-in

---

## Getting Started

### Prerequisites

You'll need **Node.js** installed (version 18 or later). Check if you have it:

```bash
node --version
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/).

> **Note:** UBML uses the command line for now. We're building visual tools, but you'll need a terminal to get started.

### 1. Create Your First Workspace

Use `npx` to run UBML:

```bash
npx ubml init my-first-project
cd my-first-project
```

> **Tip:** Install globally with `npm install -g ubml` if you'll use UBML frequently. Then you can run `ubml` instead of `npx ubml`.

This creates a folder with **template files** containing example content:\n\n```
my-first-project/
├── my-first-project.workspace.ubml.yaml  # Workspace config
├── process.ubml.yaml                      # Example process with steps
└── actors.ubml.yaml                       # Example roles and teams
```

The templates show you the UBML structure with realistic examples.

### 2. Explore with CLI or Editor

**Option A: Use the CLI** (Recommended for getting started):

```bash
# Browse your model structure
npx ubml show process

# Add elements interactively
npx ubml add step
npx ubml add actor
```

The CLI guides you through adding elements with prompts and validation.

**Option B: Edit files directly** (If you prefer text editing):

Open in VS Code:

```bash
code .
```

If you have VS Code installed, this opens the folder. UBML automatically configures schema validation so you get:
- **Auto-complete** as you type
- **Red squiggles** when something's wrong  
- **Tooltips** explaining what each field means

**Don't have VS Code?** Any text editor works, but you won't get live validation.

### 3. Validate Your Model

```bash
# Validate a single file
npx ubml validate process.ubml.yaml

# Validate everything in your workspace
npx ubml validate .
```

UBML checks:
- **Schema** — Are all required fields present? Are values the right type?
- **References** — Do all IDs exist? Are cross-document references valid?
- **Business rules** — Does the model make sense?

### 4. Start Modeling

#### CLI-Based Workflow (Recommended)

Use commands to build your model:

```bash
# Add a new process
npx ubml add process "Order Fulfillment"

# Add steps to your process
npx ubml add step "Receive Order"
npx ubml add step "Pick Items"
npx ubml add step "Pack and Ship"

# Add actors
npx ubml add actor "Warehouse Worker"
npx ubml add actor "Shipping System"
```

The CLI:
- ✅ Guides you with prompts
- ✅ Validates as you go
- ✅ Maintains correct structure
- ✅ Prevents syntax errors

#### File-Based Workflow (Alternative)

If you prefer editing files directly:

1. **Study the templates** — Understand the YAML structure
2. **Modify carefully** — Keep the format, change the content
3. **Validate often** — Run `npx ubml validate .` after changes

| Start With | Then Add |
|------------|----------|
| Process steps (what happens) | Actors (who does it) |
| Inputs/outputs (what's needed) | Entities (data model) |
| Decision points | Metrics (how to measure) |

**Recommended approach:** Start with CLI to learn the structure, then edit files directly when you're comfortable.

### 5. Common CLI Commands

```bash
# View your model
npx ubml show process          # Show all processes
npx ubml show actors           # Show all actors
npx ubml show entities         # Show all entities

# Add elements
npx ubml add process           # Add a new process (interactive)
npx ubml add step              # Add a step to a process
npx ubml add actor             # Add a role, team, or system

# Validate and check
npx ubml validate .            # Validate entire workspace
npx ubml validate --fix        # Auto-fix common issues

# Get help
npx ubml --help                # Show all commands
npx ubml add --help            # Help for specific command
```

For the complete command reference, run `npx ubml --help`.

---

## For Developers

UBML works as a library in any JavaScript/TypeScript environment:

```bash
npm install ubml
```

### Core Usage

```typescript
import { parse, validate } from 'ubml';
import { validateWorkspace } from 'ubml/node';  // Node.js file operations
import ubml from 'ubml/eslint';                 // ESLint plugin
```

**Key capabilities:**
- **Parse** UBML files from YAML strings
- **Validate** schema + cross-document references
- **Serialize** back to YAML
- **TypeScript types** for all UBML elements
- **ESLint integration** for linting UBML files
- **Universal** — Works in browser, Node, Deno, Bun (zero Node dependencies)

📖 Full API documentation and developer guide coming soon

---

## File Types

UBML uses different file types for different aspects of your business model. All files end in `.ubml.yaml`:

| File Type | What Goes There | Examples |
|-----------|----------------|----------|
| `*.workspace.ubml.yaml` | Project configuration | Workspace name, included files |
| `*.process.ubml.yaml` | How work gets done | "Customer Onboarding", "Order Fulfillment" |
| `*.actors.ubml.yaml` | Who/what does the work | Roles, teams, systems, tools |
| `*.entities.ubml.yaml` | Information model | Documents, products, locations |
| `*.metrics.ubml.yaml` | How you measure | KPIs, costs, time tracking |
| `*.hypotheses.ubml.yaml` | Problem analysis | Issue trees, root causes |
| `*.strategy.ubml.yaml` | Strategic elements | Capabilities, value streams |
| `*.scenarios.ubml.yaml` | What-if analysis | Simulations, forecasts |

**Start with just process + actors.** Add other file types as you need them.

---

## Next Steps

### Learn More

| Resource | What You'll Learn |
|----------|------------------|
| **[Vision](./docs/VISION.md)** | Why UBML exists, what problems it solves |
| **[Design Principles](./docs/PRINCIPLES.md)** | How the language is designed |
| **[Example Workspace](./example)** | Real-world sample with all document types |
| **CLI Help** | Run `ubml --help` for all commands |
| **Schema Explorer** | Run `ubml schema` to browse interactively |

### Get Help

- **Questions?** Open a [GitHub Discussion](https://github.com/NETWORG/ubml/discussions)
- **Found a bug?** [File an issue](https://github.com/NETWORG/ubml/issues)
- **Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Open Standard

UBML is released under the MIT License. Your models belong to you—plain text files you can version, export, and process with any tool. No vendor lock-in, no proprietary formats.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

*UBML is developed by [NETWORG](https://networg.com), a consulting and technology firm focused on business process improvement.*
