# Refactoring Plan: Split Large Files

**Date:** February 1, 2026  
**Status:** 🔄 **READY FOR IMPLEMENTATION**  
**Previous Work:** Phases 1-5 and 7 completed (see REFACTORING-PLAN-COMPLETED.md and git commits)

## Background

Initial refactoring phases successfully completed:
- ✅ Created shared utilities (`src/utils/`)
- ✅ Consolidated detection and hint functions  
- ✅ Removed dead code (3 items)
- ✅ Fixed code smells (any casts, magic numbers)
- ✅ Established single source of truth for utilities

**This plan covers the remaining work: Split Large Files (Phase 6)**

---

## Objective

Improve Single Responsibility Principle (SRP) compliance by splitting files that exceed ~500 lines and have multiple concerns.

## Target Files

Non-generated files with potential SRP violations:

| File | Lines | Concerns |
|------|-------|----------|
| `src/cli/commands/add.ts` | 665 | Template generation, YAML creation, section handling all in one |
| `scripts/generate/extract-metadata.ts` | 619 | 10+ extraction functions in one file |
| `src/schema/introspection.ts` | 595 | Multiple responsibilities: document types, element types, workflow |
| `src/cli/commands/help.ts` | 565 | Large file for single command (possibly acceptable) |
| `scripts/generate/generate-types.ts` | 543 | Complex type generation with multiple stages |
| `src/validator.ts` | 521 | Schema context building, error conversion, validation all mixed |

---

## Task 6.1: Split `scripts/generate/extract-metadata.ts` (619 lines)

**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Risk:** Low (scripts, not runtime code)

### Proposed Structure

```
scripts/generate/extract-metadata/
├── index.ts           # Main exports, orchestration
├── extract-id.ts      # extractIdPatterns, extractIdConfig
├── extract-hints.ts   # extractToolingHints, nested/pattern/enum hints
├── extract-templates.ts # extractTemplateData, section extraction
└── extract-content.ts # extractContentDetectionConfig, extractCommonProperties
```

### Files to Create

| New File | Contents | Exports |
|----------|----------|---------|
| `extract-id.ts` | ID pattern and config extraction | `extractIdPatterns`, `extractIdConfig` |
| `extract-hints.ts` | Tooling hints extraction | `extractToolingHints` and related helpers |
| `extract-templates.ts` | Template data extraction | `extractTemplateData` and section helpers |
| `extract-content.ts` | Detection and common props | `extractContentDetectionConfig`, `extractCommonProperties` |
| `index.ts` | Re-export all + remaining functions | All exports, `extractReferenceFields`, `extractValidationPatterns`, `extractCategoryConfig` |

### Implementation Steps

1. Create `scripts/generate/extract-metadata/` directory
2. Move ID-related functions to `extract-id.ts`
3. Move hint-related functions to `extract-hints.ts`
4. Move template-related functions to `extract-templates.ts`
5. Move content detection to `extract-content.ts`
6. Create `index.ts` with re-exports and remaining functions
7. Update `scripts/generate/index.ts` imports
8. Run `npm run generate` to verify
9. Run `npm test` to ensure nothing broke

---

## Task 6.2: Split `src/cli/commands/add.ts` (665 lines)

**Priority:** High (frequently modified, user-facing)  
**Estimated Effort:** 2-3 hours  
**Risk:** Medium (CLI command, needs testing)

### Proposed Structure

```
src/cli/commands/add/
├── index.ts              # Command definition, main addCommand()
├── templates.ts          # Template generation (createCommentedTemplate, generateSectionYaml)
└── items.ts             # Item generators (generateProcessItems, generateActorItems, etc.)
```

### Files to Create

| New File | Contents | Key Functions |
|----------|----------|---------------|
| `index.ts` | Main command | `addCommand()`, file writing logic |
| `templates.ts` | Template generation | `createCommentedTemplate`, `generateSectionYaml` |
| `items.ts` | Item generators | `generateProcessItems`, `generateActorItems`, `generateEntityItems`, etc. |

### Implementation Steps

1. Create `src/cli/commands/add/` directory
2. Extract template generation functions to `templates.ts`
3. Extract item generator functions to `items.ts`
4. Keep command definition and file operations in `index.ts`
5. Update `src/cli/index.ts` to import from `add/index.ts`
6. Run CLI tests: `npm test -- tests/integration/cli-add.test.ts`
7. Manual smoke test: `npx ubml add process`

---

## Task 6.3: Split `src/schema/introspection.ts` (595 lines)

**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Risk:** Medium (used by CLI and exports)

### Proposed Structure

```
src/schema/introspection/
├── index.ts                # Re-exports all
├── document-info.ts        # getDocumentTypeInfo, getAllDocumentTypes, getDocumentTypesByCategory
├── element-info.ts         # getAllElementTypes, getElementTypeInfo
└── workflow.ts            # getSuggestedWorkflow, getSuggestedNextStep
```

### Files to Create

| New File | Contents | Key Functions |
|----------|----------|---------------|
| `document-info.ts` | Document type introspection | `getDocumentTypeInfo`, `getAllDocumentTypes`, `getDocumentTypesByCategory` |
| `element-info.ts` | Element type introspection | `getAllElementTypes`, `getElementTypeInfo` |
| `workflow.ts` | Workflow suggestions | `getSuggestedWorkflow`, `getSuggestedNextStep` |
| `index.ts` | Re-exports | All public functions |

### Implementation Steps

1. Create `src/schema/introspection/` directory
2. Move document type functions to `document-info.ts`
3. Move element type functions to `element-info.ts`
4. Move workflow functions to `workflow.ts`
5. Create `index.ts` with re-exports
6. Update `src/schema/index.ts` to import from `introspection/index.ts`
7. Run `npm test` to verify
8. Check that CLI commands still work

---

## Optional: Additional Code Smell Fixes (Low Priority)

These can be done opportunistically while working on the splits:

| Task | Description | File | Effort |
|------|-------------|------|--------|
| Convert switch to handler map | Replace 12-case switch | `cli/formatters/validation-errors.ts` | 1 hour |
| Registry pattern for items | Replace switch in `generateSectionItems` | `cli/commands/add/items.ts` (if split) | 1 hour |

---

## Testing Strategy

After each file split:

1. **Build:** `npm run build`
2. **Tests:** `npm test`
3. **CLI:** Manual smoke tests for affected commands
4. **Scripts:** `npm run generate` (if script files changed)

### Test Checklist

- [ ] All 247 tests passing
- [ ] Build successful with no TypeScript errors
- [ ] `npm run generate` works correctly (for script splits)
- [ ] CLI commands work as expected (`ubml add`, `ubml help`, etc.)
- [ ] No circular dependencies introduced
- [ ] All exports still available from public API

---

## Success Criteria

- [ ] All split files under 400 lines each
- [ ] Clear separation of concerns
- [ ] All tests passing
- [ ] Build successful
- [ ] No regressions in functionality
- [ ] Code is easier to understand and maintain

---

## Estimated Total Effort

**6-9 hours** (can be split into 3 separate PRs)

## Recommended Approach

### Option A: One Large PR
Complete all three splits in one PR for consistency.

### Option B: Three Separate PRs (Recommended)
1. **PR 1:** Split `extract-metadata.ts` (lowest risk, 2-3 hours)
2. **PR 2:** Split `introspection.ts` (medium risk, 2-3 hours)  
3. **PR 3:** Split `add.ts` (highest user impact, 2-3 hours)

Each PR can be reviewed and tested independently.

---

## Notes for Implementation

- Preserve all JSDoc comments when moving functions
- Keep imports minimal (import only what's needed)
- Use relative imports within split modules
- Consider adding barrel exports (`index.ts`) for clean public API
- Run `npm run lint` after each change
- Verify no circular dependencies with `npm run build`

## Reference

For context on completed refactoring work, see:
- `REFACTORING-PLAN-COMPLETED.md` - Full details of phases 1-5, 7
- Git commits: `03ffd5d` and `bfd258c`
