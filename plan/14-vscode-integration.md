# 14 — VS Code & Editor Integration

> **Status**: Proposed
> **Depends on**: 01–03 (schema stable), 04 (validation working correctly)
> **Effort**: Medium (one session for basics, ongoing for advanced)

---

## Goal

Meet users where they work. VS Code is the primary editing environment — provide schema validation, auto-completion, and reference navigation without requiring the CLI.

---

## A. YAML Schema Association

Ship `.vscode/settings.json` or workspace-level config that associates `*.ubml.yaml` files with the UBML JSON Schema via `yaml.schemas` (Red Hat YAML extension).

**Scope**:
- `ubml init` generates `.vscode/settings.json` with schema mapping
- Auto-completion for all properties, enum values, ref patterns
- Inline validation errors as you type

---

## B. UBML VS Code Extension (stretch)

If YAML extension integration isn't sufficient, build a lightweight VS Code extension:

- Go-to-definition for references (click `AC00001` → jump to actor definition)
- Hover info for IDs (show element name and type)
- Validation-on-save using the SDK
- Reference count decorations (e.g., "3 references" on actor)

**Architecture**: Use `src/` SDK (browser-safe) directly in the extension. The core is already designed for this split.

---

## C. `.vscode/settings.json` Template in `ubml init`

Ensure `ubml init` scaffolds editor config:

```json
{
  "yaml.schemas": {
    "./node_modules/ubml/schemas/1.5/ubml.schema.yaml": "*.ubml.yaml"
  },
  "files.associations": {
    "*.ubml.yaml": "yaml"
  }
}
```

---

## Checklist

- [ ] Add `.vscode/settings.json` generation to `ubml init`
- [ ] Test YAML schema auto-completion with Red Hat YAML extension
- [ ] Verify inline validation matches CLI validation
- [ ] (Stretch) Prototype VS Code extension with go-to-definition
- [ ] Document VS Code setup in quickstart guide (Plan 11)
