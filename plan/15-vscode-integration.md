# 15 — VS Code & Editor Integration

> **Status**: Proposed
> **Depends on**: 01–04 (schema stable), 05 (validation working correctly)
> **Effort**: Medium (one session)

---

## Goal

Meet users where they work. VS Code is the primary editing environment — provide schema validation and auto-completion without requiring the CLI.

---

## A. YAML Schema Association

Ship `.vscode/settings.json` or workspace-level config that associates `*.ubml.yaml` files with the UBML JSON Schema via `yaml.schemas` (Red Hat YAML extension).

**Scope**:
- `ubml init` generates `.vscode/settings.json` with schema mapping
- Auto-completion for all properties, enum values, ref patterns
- Inline validation errors as you type

---

## B. `.vscode/settings.json` Template in `ubml init`

Ensure `ubml init` scaffolds editor config:

```json
{
  "yaml.schemas": {
    "https://ubml.talxis.com/schemas/1.5/ubml.schema.yaml": "*.ubml.yaml"
  },
  "files.associations": {
    "*.ubml.yaml": "yaml"
  }
}
```

Schemas are hosted via GitHub Pages at ubml.talxis.com. No npm package required for editor integration.

---

## Checklist

- [ ] Add `.vscode/settings.json` generation to `ubml init`
- [ ] Test YAML schema auto-completion with Red Hat YAML extension
- [ ] Verify inline validation matches CLI validation
- [ ] Document VS Code setup in quickstart guide (Plan 12)
