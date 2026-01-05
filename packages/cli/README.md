# @ubml/cli

Command-line interface for UBML (Unified Business Modeling Language).

## Installation

```bash
npm install -g @ubml/cli
```

## Usage

```bash
# Validate a single file
ubml validate process.ubml.yaml

# Validate entire workspace
ubml validate ./my-workspace

# JSON output for CI/CD
ubml validate . --format json

# Get help
ubml --help
```

## Commands

- `validate <path>` - Validate UBML documents (schema + cross-references)
- `init <name>` - Initialize new UBML workspace
- `schema <type>` - Show schema for a document type

## Documentation

See the main [@ubml/core](https://www.npmjs.com/package/@ubml/core) package for complete documentation.

## License

MIT
