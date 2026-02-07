# Contributing to UBML

UBML is maintained by [NETWORG](https://networg.com) and used in production by TALXIS®.

## Development Setup

```bash
npm install
npm run build
npm test
```

## Making Changes

1. Read `/docs/PRINCIPLES.md` before modifying the language
2. For significant changes, add a decision record to `/docs/DESIGN-DECISIONS.md`
3. Track unresolved design questions in `/plan/00-design-decisions.md`
4. Run `npm test` and `npm run typecheck` before committing

## Schema Files

| Type | Pattern | Location |
|------|---------|----------|
| Shared definitions | `*.defs.yaml` | `schemas/{version}/defs/` |
| Type definitions | `*.types.yaml` | `schemas/{version}/types/` |
| Document schemas | `*.schema.yaml` | `schemas/{version}/documents/` |

Every property must have a description explaining purpose, not just type.

## Questions?

Open an issue or check `/docs/` for design context.
