# 17 — CI/CD & Release Process

> **Status**: Proposed
> **Depends on**: 05 (validation working), 10 (migration tooling exists)
> **Effort**: Small–Medium
> **Note**: Can be implemented incrementally alongside other work

---

## Goal

Automate testing, validation, and release so quality is maintained as the project scales.

---

## A. CI Pipeline

GitHub Actions workflow:

1. **On every PR**:
   - `npm test` — unit + integration tests pass
   - `npm run build` — TypeScript compiles
   - `npx tsx bin/ubml.ts validate example/` — example workspace validates
   - `npm run verify-versions` — schema versions consistent

2. **On merge to main**:
   - All of the above
   - Generate and check that generated files are up-to-date (`npm run generate` produces no diff)

---

## B. Release Workflow

1. Bump `package.json` version
2. `npm run update-schema-versions && npm run generate && npm run verify-versions`
3. Run full test suite
4. Tag release
5. `npm publish`
6. Update CHANGELOG.md

**Stretch**: Automate with GitHub Actions release workflow.

---

## C. Schema Versioning Strategy

Document how schema evolution works:

- Schema versions track the UBML DSL, not the npm package
- Breaking changes → new schema version (1.4 → 1.5)
- `ubml migrate` (Plan 10 D) handles transitions
- Old schema versions are NOT maintained — this is pre-1.0 software

---

## Checklist

- [ ] Create `.github/workflows/ci.yml` for PR checks
- [ ] Create `.github/workflows/release.yml` (or document manual process)
- [ ] Document schema versioning strategy in `docs/design/` or `CONTRIBUTING.md`
- [ ] Verify CI catches real failures (test with intentional breakage)
