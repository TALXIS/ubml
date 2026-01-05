# @ubml/cli

[![npm version](https://img.shields.io/npm/v/@ubml/cli.svg)](https://www.npmjs.com/package/@ubml/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

Command-line interface for UBML (Unified Business Modeling Language).

> 📖 **Part of the [UBML monorepo](https://github.com/TALXIS/ubml)**

## Installation

```bash
npm install -g @ubml/cli
```

Or use directly with npx:

```bash
npx @ubml/cli validate ./workspace
```

## Usage

### Initialize a Workspace

```bash
ubml init my-project
cd my-project
```

Creates a new UBML workspace with starter files and VS Code configuration.

### Validate Documents

```bash
# Validate a single file
ubml validate process.ubml.yaml

# Validate entire workspace
ubml validate ./my-workspace

# JSON output for CI/CD
ubml validate . --format json

# SARIF output for GitHub Actions
ubml validate . --format sarif
```

### Explore Schema

```bash
# List all document types
ubml schema

# Show details for a type
ubml schema process

# Generate a template
ubml schema process --template
```

### Add Documents

```bash
# Add a new process file
ubml add process

# Add with custom name
ubml add process customer-onboarding
```

### Quick Reference

```bash
# Show documentation
ubml docs

# Show quickstart guide
ubml docs quickstart

# Show code examples
ubml docs examples
```

## Commands

| Command | Description |
|---------|-------------|
| `init [name]` | Initialize a new UBML workspace |
| `validate <path>` | Validate UBML documents (schema + cross-references) |
| `schema [type]` | Explore UBML schema and document types |
| `add [type] [name]` | Add a new UBML document |
| `docs [topic]` | Quick reference documentation |

## Library Usage

For programmatic usage, install the [@ubml/core](https://www.npmjs.com/package/@ubml/core) package:

```typescript
import { parse, validate } from '@ubml/core';
import { validateWorkspace } from '@ubml/core/node';
```

## Documentation

- [GitHub Repository](https://github.com/TALXIS/ubml)
- [Schema Reference](https://github.com/TALXIS/ubml/blob/master/docs/schema-reference.md)
- [Best Practices](https://github.com/TALXIS/ubml/blob/master/docs/best-practices.md)

## License

MIT — see [LICENSE](../../LICENSE)
