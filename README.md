# UBML — Unified Business Modeling Language

[![npm version](https://img.shields.io/npm/v/@ubml/core.svg)](https://www.npmjs.com/package/@ubml/core)
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

UBML solves this by treating business understanding as code - structured, validated, version-controlled and designed for AI assistance.

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

- **Version control** — Track changes to business processes with Git
- **Validation** — Schema + cross-document references in one call 
- **Editor support** — Red squiggles in VS Code as you type
- **CLI for CI/CD** — Validate models in your pipeline
- **Universal** — Works everywhere: browser, Node, Deno, Bun (zero Node deps)
- **AI-ready** — Semantic structure designed for AI assistance
- **Open standard** — MIT licensed, no vendor lock-in

---

## Quick Example

```yaml
# process.ubml.yaml
ubml: "1.0"

processes:
  PR001:
    id: "PR001"
    name: "Customer Onboarding"
    description: "End-to-end onboarding from application to activation"
    level: 3

    steps:
      ST001:
        name: "Receive Application"
        kind: action
        description: "Receive and log new application"

      ST002:
        name: "Verify Identity"
        kind: action
        description: "Verify customer identity documents"
        inputs:
          - ref: DC001
        outputs:
          - ref: DC002

      ST003:
        name: "Approved?"
        kind: decision
        description: "Decision point for application approval"
```

See the [example/](./example) directory for a complete workspace.

---

## Getting Started

### Install

**CLI (for validation):**
```bash
npm install -g @ubml/cli
```

**Library (for integration):**
```bash
npm install @ubml/core
```

### Initialize a workspace

```bash
ubml init my-project
cd my-project
```

This creates:

```
my-project/
├── my-project.workspace.ubml.yaml
├── process.ubml.yaml
└── actors.ubml.yaml
```

### Configure VS Code

Install the [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), then add to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "node_modules/@ubml/core/schemas/documents/workspace.document.yaml": "*.workspace.ubml.yaml",
    "node_modules/@ubml/core/schemas/documents/process.document.yaml": ["*.process.ubml.yaml", "process.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/actors.document.yaml": ["*.actors.ubml.yaml", "actors.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/entities.document.yaml": ["*.entities.ubml.yaml", "entities.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/metrics.document.yaml": ["*.metrics.ubml.yaml", "metrics.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/hypotheses.document.yaml": ["*.hypotheses.ubml.yaml", "hypotheses.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/strategy.document.yaml": ["*.strategy.ubml.yaml", "strategy.ubml.yaml"],
    "node_modules/@ubml/core/schemas/documents/scenarios.document.yaml": ["*.scenarios.ubml.yaml", "scenarios.ubml.yaml"]
  }
}
```

> **Tip:** Running `ubml init` automatically creates these settings for you.
```

### Validate

```bash
# Single file
ubml validate process.ubml.yaml

# Entire workspace
ubml validate ./my-project

# JSON output for CI/CD
ubml validate . --format json
```

---

## For Developers

### Library Usage

```typescript
// Parse, validate, serialize (works everywhere - browser, Node, Deno, Bun)
import { parse, validate, serialize, schemas } from '@ubml/core';

// Node.js file operations
import { parseFile, validateWorkspace, serializeToFile } from '@ubml/core/node';

// ESLint plugin
import ubml from '@ubml/core/eslint';
```

### Parse and Validate

```typescript
import { parse, validate } from '@ubml/core';

// Parse documents
const actors = parse(actorsYaml, 'actors.actors.ubml.yaml');
const process = parse(processYaml, 'process.process.ubml.yaml');

// Validate everything (schema + cross-document references)
const result = await validate([actors.document!, process.document!]);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(`${error.filepath}: ${error.message}`);
  }
}

// Check for warnings (unused IDs with line numbers)
for (const warning of result.warnings) {
  console.warn(`${warning.filepath}:${warning.line}:${warning.column} - ${warning.message}`);
}
```

### Validate Workspace (Node.js)

```typescript
import { validateWorkspace } from '@ubml/core/node';

// Validate all UBML files in a directory (schema + references)
const result = await validateWorkspace('./my-workspace');

if (!result.valid) {
  console.log(`${result.errorCount} errors in ${result.fileCount} files`);
  for (const file of result.files) {
    for (const error of file.errors) {
      console.error(`${file.path}:${error.line} - ${error.message}`);
    }
  }
}
```

### TypeScript Types

```typescript
import type { Process, Step, Actor, ProcessDocument } from '@ubml/core';

const process: Process = {
  id: 'PR001',
  name: 'Customer Onboarding',
  level: 3,
  steps: {
    ST001: {
      name: 'Receive Application',
      kind: 'action',
    }
  }
};
```

### ESLint Integration

```javascript
// eslint.config.js
import ubml from '@ubml/core/eslint';

export default [
  {
    files: ['**/*.ubml.yaml'],
    ...ubml.configs.recommended,
  },
];
```

---

## File Naming Convention

| Pattern | Purpose |
|---------|---------|
| `*.workspace.ubml.yaml` | Workspace configuration |
| `*.process.ubml.yaml` | Process definitions |
| `*.actors.ubml.yaml` | Roles, teams, systems |
| `*.entities.ubml.yaml` | Data model |
| `*.hypotheses.ubml.yaml` | Problem framing |
| `*.strategy.ubml.yaml` | Strategic elements |
| `*.metrics.ubml.yaml` | KPIs and analysis |
| `*.scenarios.ubml.yaml` | Simulations |

---

## Packages

This monorepo contains two packages:

| Package | Description | npm |
|---------|-------------|-----|
| [@ubml/core](./packages/core) | Core library for parsing, validation, and serialization | [![npm](https://img.shields.io/npm/v/@ubml/core.svg)](https://www.npmjs.com/package/@ubml/core) |
| [@ubml/cli](./packages/cli) | Command-line interface | [![npm](https://img.shields.io/npm/v/@ubml/cli.svg)](https://www.npmjs.com/package/@ubml/cli) |

---

## Documentation

- **[Vision](./docs/VISION.md)** — Why UBML exists and where it's going
- **[Best Practices](./docs/best-practices.md)** — Guidelines for effective modeling
- **[Schema Reference](./docs/schema-reference.md)** — Complete element documentation
- **[Examples](./example)** — Sample workspace with all document types

---

## Open Standard

UBML is released under the MIT License. Your models belong to you—plain text files you can version, export, and process with any tool. No vendor lock-in, no proprietary formats.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

```bash
# Install dependencies (uses npm workspaces)
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Type check
npm run typecheck
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

*UBML is developed by [NETWORG](https://networg.com), a consulting and technology firm focused on business process improvement.*
