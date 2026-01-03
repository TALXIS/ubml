# UBML Package Strategy

## Overview

This document outlines the npm package structure and repository layout for the UBML project.

## Package Architecture

### Single Package Approach: `@ubml/core`

We use a **single-package strategy** with the package name `@ubml/core` (or `ubml`) that provides:

1. **Core Library** - Parsing, validation, and serialization APIs
2. **CLI Tool** - `npx ubml validate` command
3. **ESLint Plugin** - Optional integration for linting UBML files
4. **Schemas** - Bundled YAML schemas for UBML documents

### Why Single Package?

- **Simpler dependency management** - One install gets everything
- **Consistent versioning** - Schema and code always in sync
- **Easier adoption** - `npm install ubml` covers all use cases
- **Smaller maintenance overhead** - No monorepo complexity

---

## Directory Structure

```
ubml/
├── package.json              # Main package configuration
├── tsconfig.json
├── tsup.config.ts            # Build configuration
├── vitest.config.ts          # Test configuration
│
├── bin/
│   └── ubml.ts               # CLI entry point (npx ubml)
│
├── src/
│   ├── index.ts              # Main library exports
│   │
│   ├── parser/
│   │   ├── index.ts          # Parser module exports
│   │   ├── yaml-parser.ts    # YAML parsing with line tracking
│   │   └── document.ts       # Document AST types
│   │
│   ├── validator/
│   │   ├── index.ts          # Validator module exports
│   │   ├── schema-validator.ts  # JSON Schema validation
│   │   ├── semantic-validator.ts # Cross-reference validation
│   │   └── errors.ts         # Error types and formatting
│   │
│   ├── serializer/
│   │   ├── index.ts          # Serializer module exports
│   │   └── yaml-serializer.ts # YAML output with formatting
│   │
│   ├── cli/
│   │   ├── index.ts          # CLI implementation
│   │   ├── commands/
│   │   │   ├── validate.ts   # validate command
│   │   │   ├── init.ts       # init command (scaffold workspace)
│   │   │   └── lint.ts       # lint command
│   │   └── formatters/
│   │       ├── stylish.ts    # Default terminal output
│   │       ├── json.ts       # JSON output for tooling
│   │       └── sarif.ts      # SARIF for VS Code integration
│   │
│   ├── eslint/
│   │   ├── index.ts          # ESLint plugin exports
│   │   ├── plugin.ts         # Plugin definition
│   │   └── rules/
│   │       └── valid-ubml.ts # Main validation rule
│   │
│   └── schemas/
│       └── loader.ts         # Schema loading utilities
│
├── schemas/                  # UBML JSON/YAML Schemas
│   ├── ubml.schema.yaml
│   ├── common/
│   ├── documents/
│   └── fragments/
│
├── example/                  # Example UBML workspace
│   ├── acme-corp.workspace.ubml.yaml
│   ├── customer-onboarding.process.ubml.yaml
│   ├── organization.actors.ubml.yaml
│   ├── data-model.entities.ubml.yaml
│   └── ...
│
├── tests/
│   ├── unit/
│   │   ├── parser.test.ts
│   │   ├── validator.test.ts
│   │   └── serializer.test.ts
│   ├── integration/
│   │   └── cli.test.ts
│   └── workspace/
│       └── example.test.ts   # Validates example/ directory
│
└── docs/
    ├── best-practices.md
    ├── schema-reference.md
    └── api/                  # Generated API docs
```

---

## Exports Strategy

### Package Exports (package.json)

```json
{
  "name": "ubml",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./parser": {
      "types": "./dist/parser/index.d.ts",
      "import": "./dist/parser/index.js"
    },
    "./validator": {
      "types": "./dist/validator/index.d.ts",
      "import": "./dist/validator/index.js"
    },
    "./serializer": {
      "types": "./dist/serializer/index.d.ts",
      "import": "./dist/serializer/index.js"
    },
    "./eslint": {
      "types": "./dist/eslint/index.d.ts",
      "import": "./dist/eslint/index.js"
    },
    "./schemas/*": "./schemas/*"
  }
}
```

### Usage Examples

```typescript
// Full library import
import { parse, validate, serialize } from 'ubml';

// Individual module imports
import { parseDocument } from 'ubml/parser';
import { validateWorkspace } from 'ubml/validator';
import { serializeDocument } from 'ubml/serializer';

// ESLint integration
// eslint.config.js
import ubml from 'ubml/eslint';
```

---

## CLI Design

### Commands

```bash
# Validate a single file
npx ubml validate process.ubml.yaml

# Validate a workspace directory
npx ubml validate ./my-workspace

# Validate with specific output format
npx ubml validate . --format json
npx ubml validate . --format sarif

# Initialize a new workspace
npx ubml init my-project

# Check UBML version
npx ubml --version
```

### Exit Codes

- `0` - Success, no errors
- `1` - Validation errors found
- `2` - Runtime/configuration error

---

## ESLint Integration

### Plugin Configuration

```javascript
// eslint.config.js (flat config)
import ubml from 'ubml/eslint';

export default [
  {
    files: ['**/*.ubml.yaml', '**/*.ubml.yml'],
    ...ubml.configs.recommended,
  },
];
```

### Rules

| Rule | Description |
|------|-------------|
| `ubml/valid-schema` | Validates against UBML JSON Schema |
| `ubml/valid-references` | Validates cross-document references |
| `ubml/consistent-ids` | Enforces ID naming conventions |

---

## Dependencies

### Runtime Dependencies

```json
{
  "dependencies": {
    "yaml": "^2.3.0",
    "ajv": "^8.12.0",
    "ajv-formats": "^3.0.1",
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "glob": "^10.3.0"
  }
}
```

### Optional Peer Dependencies

```json
{
  "peerDependencies": {
    "eslint": "^8.0.0 || ^9.0.0"
  },
  "peerDependenciesMeta": {
    "eslint": { "optional": true }
  }
}
```

---

## Build Configuration

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'parser/index': 'src/parser/index.ts',
    'validator/index': 'src/validator/index.ts',
    'serializer/index': 'src/serializer/index.ts',
    'eslint/index': 'src/eslint/index.ts',
    'cli': 'bin/ubml.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  clean: true,
  shims: true,
});
```

---

## Testing Strategy

### Unit Tests
- Parser correctly handles all UBML document types
- Validator catches schema violations
- Serializer produces valid YAML output

### Integration Tests
- CLI commands work end-to-end
- ESLint plugin integrates correctly
- Error messages are helpful

### Workspace Tests
- `example/` directory validates successfully
- Reference resolution works across files
- Real-world usage patterns are tested

```typescript
// tests/workspace/example.test.ts
import { describe, it, expect } from 'vitest';
import { validateWorkspace } from '../../src/validator';

describe('Example Workspace', () => {
  it('should validate without errors', async () => {
    const result = await validateWorkspace('./example');
    expect(result.errors).toHaveLength(0);
  });
});
```

---

## Versioning Strategy

- Follow **semver** strictly
- Schema version (`ubml: "1.0"`) is independent of package version
- Major bumps for breaking schema changes
- Minor bumps for new features/document types
- Patch bumps for bug fixes and docs

---

## Publishing Checklist

1. [ ] All tests pass (`npm test`)
2. [ ] Schemas validate (`npm run validate`)
3. [ ] Example workspace validates (`npm run validate:example`)
4. [ ] Build succeeds (`npm run build`)
5. [ ] Update CHANGELOG.md
6. [ ] Bump version (`npm version <patch|minor|major>`)
7. [ ] Publish (`npm publish --access public`)
