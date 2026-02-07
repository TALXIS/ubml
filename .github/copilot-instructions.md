# Copilot Instructions for UBML

## What This Is

UBML is a YAML-based DSL for modeling business processes, organizations, and strategy. Designed for business analysts, not engineers - readability and consultant vocabulary matter most.

**Source of truth flow:**
1. **Schemas** (`schemas/`) - Primary source of truth for the DSL structure
2. **Docs** (`/docs/`) - Design principles, strategy, and decision rationale
3. **Build** (`npm run generate`) - Generates TypeScript types from schemas
4. **SDK** (`src/`) - Built using generated types for parsing/validation
5. **CLI** (`src/cli/`) - Built on top of SDK, intended as the primary user interface

## When Schemas Change

After modifying `schemas/`:
1. Document rationale in `/docs/DESIGN-DECISIONS.md`
2. Run `npm run generate` to regenerate TypeScript types
3. Update SDK (`src/`) if semantics changed
4. Update CLI (`src/cli/`) if new elements/features added
5. Add/update tests

Note: Some duplication exists - check for hardcoded element types, validation logic, or CLI prompts.

## Updating UBML Version

1. Update `package.json` version (e.g., `1.3.0` → `1.4.0`)
2. Run: `npm run update-schema-versions && npm run generate && npm run verify-versions`

## Guidance

**Read `/docs/PRINCIPLES.md` before changing language design or schemas** - contains binding design constraints.

**Key docs:**
- `VISION.md` - Why UBML exists
- `WORKSPACE-SEMANTICS.md` - How concepts relate
- `PRINCIPLES.md` - Non-negotiable rules
- `DESIGN-DECISIONS.md` - Rationale for major choices (add new decisions here)
- `OPEN-TOPICS.md` - Unresolved questions

## Architecture Notes

**Runtime split:**
- Core (`src/`) - Browser-safe, zero Node dependencies
- Node-specific (`src/node/`) - File system operations only
- Generated (`src/generated/`) - **Never edit directly**, run `npm run generate`

## Testing & Experiments

**`sandbox/`** (gitignored) - Local testing data for CLI experiments

**Run local CLI:** `npx tsx bin/ubml.ts <command>` (e.g., `npx tsx bin/ubml.ts validate sandbox/`)
