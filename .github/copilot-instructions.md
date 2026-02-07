# Copilot Instructions for UBML

## What This Is

UBML (Unified Business Modeling Language) is a YAML-based notation for modeling business processes, organizations, and strategy. It's designed for business analysts and consultants, not software engineers - readability and consultant vocabulary matter more than technical precision.

**This repo contains:**
- **DSL schema** (`schemas/`) - JSON schemas defining the UBML language
- **SDK** (`src/`) - TypeScript library for parsing, validating, and serializing UBML
- **CLI tools** (`src/cli/`) - Command-line interface for working with UBML files

## How It Works

**Source of truth flow:**
1. **Schemas** (`schemas/`) - Primary source of truth for the DSL structure
2. **Docs** (`/docs/`) - Design principles, strategy, and decision rationale
3. **Build** (`npm run generate`) - Generates TypeScript types from schemas
4. **SDK** (`src/`) - Built using generated types for parsing/validation
5. **CLI** (`src/cli/`) - Built on top of SDK, intended as the primary user interface

**Users should interact via CLI**, not by hand-editing YAML files (though it's supported).

## Critical Guidance

**Before changing language design or schemas:** Read `/docs/PRINCIPLES.md` - it contains binding design constraints. Violating these principles is a design flaw that must be fixed.

**The `/docs/` directory steers everything:**
- `VISION.md` - Why UBML exists and what it solves
- `WORKSPACE-SEMANTICS.md` - Semantic structure of a workspace and how concepts relate
- `PRINCIPLES.md` - Non-negotiable design rules
- `DESIGN-DECISIONS.md` - Rationale for major choices
- `OPEN-TOPICS.md` - Unresolved questions

When making schema changes, add decisions to `DESIGN-DECISIONS.md`. When uncertain, check `OPEN-TOPICS.md`.

## Architecture Notes

**Runtime split:**
- Core (`src/`) - Browser-safe, zero Node dependencies
- Node-specific (`src/node/`) - File system operations only
- Generated (`src/generated/`) - **Never edit directly**, run `npm run generate`
