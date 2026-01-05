# @ubml/core

[![npm version](https://img.shields.io/npm/v/@ubml/core.svg)](https://www.npmjs.com/package/@ubml/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

Core library for UBML (Unified Business Modeling Language) — parsing, validation, and serialization.

> 📖 **Part of the [UBML monorepo](https://github.com/TALXIS/ubml)**

## Installation

```bash
npm install @ubml/core
```

## Usage

### Browser-Safe API

Works everywhere: browser, Node.js, Deno, Bun.

```typescript
import { parse, validate, serialize } from '@ubml/core';

// Parse UBML document
const result = parse(yamlContent, 'process.ubml.yaml');

if (result.ok) {
  // Validate (schema + cross-references)
  const validation = await validate([result.document]);
  
  if (validation.valid) {
    console.log('Valid UBML document!');
  } else {
    console.error(validation.errors);
  }
}
```

### Node.js File Operations

```typescript
import { parseFile, validateWorkspace, serializeToFile } from '@ubml/core/node';

// Validate entire workspace
const result = await validateWorkspace('./my-workspace');

if (!result.valid) {
  for (const file of result.files) {
    for (const error of file.errors) {
      console.error(`${file.path}:${error.line} - ${error.message}`);
    }
  }
}
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

## CLI Tool

For command-line usage, install the [@ubml/cli](https://www.npmjs.com/package/@ubml/cli) package:

```bash
npm install -g @ubml/cli
ubml validate ./workspace
```

## Documentation

- [GitHub Repository](https://github.com/TALXIS/ubml)
- [Schema Reference](https://github.com/TALXIS/ubml/blob/master/docs/schema-reference.md)
- [Best Practices](https://github.com/TALXIS/ubml/blob/master/docs/best-practices.md)

## License

MIT — see [LICENSE](../../LICENSE)
