# 16 — Visual Export & Projections

> **Status**: Proposed (exploratory)
> **Depends on**: 01–04 (schema stable), 10 (workspace tooling)
> **Effort**: Large (multiple sessions)
> **References**: `docs/projections/` (Mermaid, BPMN, PlantUML, ArchiMate)

---

## Goal

Implement diagram generation — the most consistently requested feature from users.

---

## Phase 1: Mermaid Export (lowest effort)

```bash
ubml export --format=mermaid process.ubml.yaml   # Process flow diagram
ubml export --format=mermaid actors.ubml.yaml     # Org chart / actor relationships
```

**Scope**:
- Process → Mermaid flowchart (steps, links, blocks)
- Actors → Mermaid org chart or graph
- Capability tree → Mermaid mindmap
- Hypothesis tree → Mermaid mindmap

**Challenges**: Block rendering (parallel lanes), cross-process links, phase overlays.

---

## Phase 2: BPMN Export

Formal BPMN 2.0 XML generation for enterprise interchange.

**Prerequisites**: Resolve Plan 00 D4 (process/workflow boundary) if not already decided.

**Scope**:
- Steps → BPMN Tasks
- Links → BPMN Sequence Flows
- Blocks → BPMN Gateways (par→parallel, alt→exclusive, opt→inclusive)
- Phases → BPMN Lanes or Groups
- RACI → BPMN Participants/Lanes

**Information loss**: Hypotheses, insights, knowledge provenance, custom fields have no BPMN equivalent. Emit as BPMN documentation annotations.

---

## Phase 3: PlantUML & ArchiMate (if demand)

Lower priority. Implement if users request it.

---

## Checklist

- [ ] Implement Mermaid process flow export
- [ ] Implement Mermaid actor/org chart export
- [ ] Implement Mermaid capability/hypothesis tree export
- [ ] Tests + visual verification for Mermaid outputs
- [ ] (Phase 2) Implement BPMN 2.0 XML export
- [ ] (Phase 2) Document information loss and mapping decisions
- [ ] (Phase 3) PlantUML/ArchiMate if demanded
