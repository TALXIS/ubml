var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/tsup/assets/esm_shims.js
import path from "path";
import { fileURLToPath } from "url";
var init_esm_shims = __esm({
  "../../node_modules/tsup/assets/esm_shims.js"() {
    "use strict";
  }
});

// src/generated/metadata.ts
function isDocumentType(type) {
  return DOCUMENT_TYPES.includes(type);
}
function getSchemaPathForDocumentType(type) {
  return SCHEMA_PATHS.documents[type];
}
function validateId(type, id) {
  const pattern = ID_PATTERNS[type];
  return pattern?.test(id) ?? false;
}
function isValidId(id) {
  return ALL_ID_PATTERN.test(id);
}
function getElementTypeFromId(id) {
  const match = id.match(/^([A-Z]+)\d{3,}$/);
  if (match) {
    const prefix = match[1];
    return ID_PREFIXES[prefix];
  }
  return void 0;
}
function isReferenceField(fieldName) {
  return REFERENCE_FIELDS.includes(fieldName);
}
function detectDocumentType(filename) {
  const lower = filename.toLowerCase();
  for (const type of DOCUMENT_TYPES) {
    if (lower.includes(`.${type}.ubml.yaml`) || lower.includes(`.${type}.ubml.yml`) || lower.endsWith(`${type}.ubml.yaml`) || lower.endsWith(`${type}.ubml.yml`)) {
      return type;
    }
  }
  return void 0;
}
function detectDocumentTypeFromContent(content) {
  if (!content || typeof content !== "object") {
    return void 0;
  }
  const obj = content;
  if ("processes" in obj) return "process";
  if ("actors" in obj) return "actors";
  if ("entities" in obj) return "entities";
  if ("hypothesisTrees" in obj) return "hypotheses";
  if ("kpis" in obj || "metrics" in obj) return "metrics";
  if ("scenarios" in obj) return "scenarios";
  if ("valueStreams" in obj || "capabilities" in obj) return "strategy";
  if ("miningSources" in obj) return "mining";
  if ("views" in obj) return "views";
  if ("links" in obj && !("processes" in obj)) return "links";
  if ("terms" in obj || "glossary" in obj) return "glossary";
  if ("organization" in obj || "documents" in obj) return "workspace";
  return void 0;
}
function getUBMLFilePatterns() {
  const patterns = [];
  for (const type of DOCUMENT_TYPES) {
    patterns.push(`**/*.${type}.ubml.yaml`);
    patterns.push(`**/${type}.ubml.yaml`);
  }
  return patterns;
}
function isUBMLFile(filename) {
  return detectDocumentType(filename) !== void 0;
}
function getSchemaPathForFileSuffix(filepath) {
  for (const type of DOCUMENT_TYPES) {
    if (filepath.endsWith(`.${type}.ubml.yaml`) || filepath.endsWith(`.${type}.ubml.yml`) || filepath.endsWith(`${type}.ubml.yaml`) || filepath.endsWith(`${type}.ubml.yml`)) {
      return SCHEMA_PATHS.documents[type];
    }
  }
  return void 0;
}
var DOCUMENT_TYPES, FRAGMENT_NAMES, SCHEMA_VERSION, SCHEMA_PATHS, ID_PREFIXES, ID_PATTERNS, ALL_ID_PATTERN, REFERENCE_FIELDS, DURATION_PATTERN, TIME_PATTERN;
var init_metadata = __esm({
  "src/generated/metadata.ts"() {
    "use strict";
    init_esm_shims();
    DOCUMENT_TYPES = [
      "actors",
      "entities",
      "glossary",
      "hypotheses",
      "links",
      "metrics",
      "mining",
      "process",
      "scenarios",
      "strategy",
      "views",
      "workspace"
    ];
    FRAGMENT_NAMES = [
      "actor",
      "entity",
      "hypothesis",
      "link",
      "metrics",
      "mining",
      "process",
      "resource",
      "scenario",
      "step",
      "strategy",
      "view"
    ];
    SCHEMA_VERSION = "1.0";
    SCHEMA_PATHS = {
      root: "ubml.schema.yaml",
      defs: "common/defs.schema.yaml",
      documents: {
        actors: "documents/actors.document.yaml",
        entities: "documents/entities.document.yaml",
        glossary: "documents/glossary.document.yaml",
        hypotheses: "documents/hypotheses.document.yaml",
        links: "documents/links.document.yaml",
        metrics: "documents/metrics.document.yaml",
        mining: "documents/mining.document.yaml",
        process: "documents/process.document.yaml",
        scenarios: "documents/scenarios.document.yaml",
        strategy: "documents/strategy.document.yaml",
        views: "documents/views.document.yaml",
        workspace: "documents/workspace.document.yaml"
      },
      fragments: {
        actor: "fragments/actor.fragment.yaml",
        entity: "fragments/entity.fragment.yaml",
        hypothesis: "fragments/hypothesis.fragment.yaml",
        link: "fragments/link.fragment.yaml",
        metrics: "fragments/metrics.fragment.yaml",
        mining: "fragments/mining.fragment.yaml",
        process: "fragments/process.fragment.yaml",
        resource: "fragments/resource.fragment.yaml",
        scenario: "fragments/scenario.fragment.yaml",
        step: "fragments/step.fragment.yaml",
        strategy: "fragments/strategy.fragment.yaml",
        view: "fragments/view.fragment.yaml"
      }
    };
    ID_PREFIXES = {
      AC: "actor",
      BK: "block",
      CP: "capability",
      DC: "document",
      EN: "entity",
      EQ: "equipment",
      EV: "evidence",
      HY: "hypothesis",
      KP: "kpi",
      LC: "location",
      PD: "product",
      PF: "portfolio",
      PH: "phase",
      PR: "process",
      PS: "persona",
      RP: "resourcePool",
      SC: "scenario",
      SK: "skill",
      ST: "step",
      SV: "service",
      VS: "valueStream",
      VW: "view"
    };
    ID_PATTERNS = Object.fromEntries(
      Object.entries(ID_PREFIXES).map(([prefix, type]) => [
        type,
        new RegExp(`^${prefix}\\d{3,}$`)
      ])
    );
    ALL_ID_PATTERN = new RegExp(
      `^(${Object.keys(ID_PREFIXES).join("|")})\\d{3,}$`
    );
    REFERENCE_FIELDS = [
      "accountable",
      "actor",
      "approvedBy",
      "approvers",
      "baseScenario",
      "basedOn",
      "capabilities",
      "children",
      "compareScenario",
      "consulted",
      "customer",
      "endMilestone",
      "endsWith",
      "entity",
      "equipment",
      "from",
      "includeSteps",
      "informed",
      "kpis",
      "location",
      "notify",
      "owner",
      "parent",
      "party",
      "process",
      "processRef",
      "processes",
      "products",
      "recipients",
      "ref",
      "relatedEntity",
      "relatedProducts",
      "relatedServices",
      "relativeTo",
      "reportsTo",
      "represents",
      "requiredCapabilities",
      "requiredSkill",
      "responsible",
      "reviewers",
      "services",
      "skill",
      "skills",
      "source",
      "stakeholders",
      "startMilestone",
      "startsWith",
      "step",
      "steps",
      "systems",
      "target",
      "templateSource",
      "to",
      "valueStream"
    ];
    DURATION_PATTERN = /^[0-9]+(\.[0-9]+)?(min|h|d|wk|mo)$/;
    TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/;
  }
});

// src/semantic-validator.ts
var semantic_validator_exports = {};
__export(semantic_validator_exports, {
  DOCUMENT_MULTIPLICITY: () => DOCUMENT_MULTIPLICITY,
  extractDefinedIds: () => extractDefinedIds,
  extractReferencedIds: () => extractReferencedIds,
  getDocumentMultiplicity: () => getDocumentMultiplicity,
  validateDocuments: () => validateDocuments,
  validateWorkspaceStructure: () => validateWorkspaceStructure
});
function extractDefinedIds(content, filepath, path2 = "") {
  const ids = /* @__PURE__ */ new Map();
  if (content && typeof content === "object") {
    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        const childIds = extractDefinedIds(item, filepath, `${path2}[${index}]`);
        for (const [id, info] of childIds) {
          ids.set(id, info);
        }
      });
    } else {
      const obj = content;
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path2 ? `${path2}.${key}` : key;
        if (isValidId(key)) {
          ids.set(key, { filepath, path: currentPath });
        }
        const childIds = extractDefinedIds(value, filepath, currentPath);
        for (const [id, info] of childIds) {
          ids.set(id, info);
        }
      }
    }
  }
  return ids;
}
function extractReferencedIds(content, filepath, path2 = "") {
  const refs = /* @__PURE__ */ new Map();
  function addRef(id, refPath) {
    const existing = refs.get(id) ?? [];
    existing.push({ filepath, path: refPath });
    refs.set(id, existing);
  }
  if (content && typeof content === "object") {
    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        if (typeof item === "string" && isValidId(item)) {
          addRef(item, `${path2}[${index}]`);
        }
        const childRefs = extractReferencedIds(item, filepath, `${path2}[${index}]`);
        for (const [id, locations] of childRefs) {
          const existing = refs.get(id) ?? [];
          existing.push(...locations);
          refs.set(id, existing);
        }
      });
    } else {
      const obj = content;
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path2 ? `${path2}.${key}` : key;
        if (REFERENCE_FIELDS.includes(key)) {
          if (typeof value === "string" && isValidId(value)) {
            addRef(value, currentPath);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === "string" && isValidId(item)) {
                addRef(item, `${currentPath}[${index}]`);
              }
            });
          }
        }
        const childRefs = extractReferencedIds(value, filepath, currentPath);
        for (const [id, locations] of childRefs) {
          const existing = refs.get(id) ?? [];
          existing.push(...locations);
          refs.set(id, existing);
        }
      }
    }
  }
  return refs;
}
function validateDocuments(documents, options = {}) {
  const errors = [];
  const warnings = [];
  const definedIds = /* @__PURE__ */ new Map();
  const referencedIds = /* @__PURE__ */ new Map();
  for (const document of documents) {
    const filepath = document.meta.filename || "unknown";
    const ids = extractDefinedIds(document.content, filepath);
    for (const [id, info] of ids) {
      if (definedIds.has(id)) {
        const existing = definedIds.get(id);
        errors.push({
          message: `Duplicate ID "${id}" (also defined in ${existing.filepath})`,
          filepath: info.filepath,
          path: info.path,
          code: "ubml/duplicate-id"
        });
      } else {
        definedIds.set(id, info);
      }
    }
    const refs = extractReferencedIds(document.content, filepath);
    for (const [id, locations] of refs) {
      const existing = referencedIds.get(id) ?? [];
      existing.push(...locations.map((l) => l.filepath));
      referencedIds.set(id, existing);
    }
  }
  for (const [id, filepaths] of referencedIds) {
    if (!definedIds.has(id)) {
      const uniqueFiles = [...new Set(filepaths)];
      for (const filepath of uniqueFiles) {
        errors.push({
          message: `Reference to undefined ID "${id}"`,
          filepath,
          code: "ubml/undefined-reference"
        });
      }
    }
  }
  if (!options.suppressUnusedWarnings) {
    for (const [id, info] of definedIds) {
      if (!referencedIds.has(id)) {
        const doc = documents.find((d) => d.meta.filename === info.filepath);
        const jsonPointerPath = "/" + info.path.replace(/\./g, "/");
        const location = doc?.getSourceLocation(jsonPointerPath);
        warnings.push({
          message: `ID "${id}" is defined but never referenced`,
          filepath: info.filepath,
          path: info.path,
          code: "ubml/unused-id",
          ...location && {
            line: location.line,
            column: location.column
          }
        });
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    definedIds,
    referencedIds
  };
}
function getDocumentMultiplicity(type) {
  return DOCUMENT_MULTIPLICITY[type] ?? "multiple";
}
function validateWorkspaceStructure(documents) {
  const warnings = [];
  const documentTypes = /* @__PURE__ */ new Map();
  for (const doc of documents) {
    const type = doc.meta.type;
    if (type) {
      const files = documentTypes.get(type) ?? [];
      files.push(doc.meta.filename || "unknown");
      documentTypes.set(type, files);
    }
  }
  if (!documentTypes.has("workspace")) {
    warnings.push({
      message: "No workspace file found",
      code: "ubml/missing-workspace",
      suggestion: "Create a *.workspace.ubml.yaml file to define your project"
    });
  }
  for (const [type, files] of documentTypes) {
    const multiplicity = DOCUMENT_MULTIPLICITY[type];
    if (multiplicity === "singleton" && files.length > 1) {
      warnings.push({
        message: `Multiple ${type} files found (expected single file)`,
        code: "ubml/multiple-singleton",
        files,
        suggestion: `Consider consolidating into one ${type}.ubml.yaml file`
      });
    }
  }
  const hasProcesses = documentTypes.has("process");
  if (hasProcesses) {
    if (!documentTypes.has("actors")) {
      warnings.push({
        message: "Process files exist but no actors defined",
        code: "ubml/missing-actors",
        suggestion: "Add actors.ubml.yaml to define who performs process steps"
      });
    }
  }
  const totalFiles = documents.length;
  if (totalFiles >= 5 && !documentTypes.has("glossary")) {
    warnings.push({
      message: "Complex workspace without glossary",
      code: "ubml/suggest-glossary",
      suggestion: "Consider adding glossary.ubml.yaml for consistent terminology"
    });
  }
  return {
    valid: true,
    // Structure warnings don't fail validation
    warnings,
    documentTypes
  };
}
var DOCUMENT_MULTIPLICITY;
var init_semantic_validator = __esm({
  "src/semantic-validator.ts"() {
    "use strict";
    init_esm_shims();
    init_metadata();
    DOCUMENT_MULTIPLICITY = {
      workspace: "singleton",
      // Exactly one per workspace
      glossary: "singleton",
      // Should be unified for consistency
      strategy: "singleton",
      // Single strategic context
      actors: "catalog",
      // Shared definitions, can split for large orgs
      entities: "catalog",
      // Shared definitions, can split by domain
      metrics: "catalog",
      // Shared definitions, can split by initiative
      process: "multiple",
      // One per business process
      scenarios: "multiple",
      // Grouped by process or initiative
      hypotheses: "multiple",
      // One per problem/initiative
      links: "multiple",
      // Can be split for manageability
      views: "multiple",
      // Different views for different audiences
      mining: "multiple"
      // Per data source or analysis
    };
  }
});

// src/index.ts
init_esm_shims();

// src/parser.ts
init_esm_shims();
init_metadata();
import { parseDocument as parseYamlDocument, isMap, isSeq, Pair, Scalar } from "yaml";
function parse(content, filename) {
  const errors = [];
  const warnings = [];
  let documentType;
  if (filename) {
    documentType = detectDocumentType(filename);
    if (!documentType) {
      warnings.push({
        message: `Could not detect document type from filename. Expected pattern: *.{type}.ubml.yaml`
      });
    }
  }
  let parsedContent;
  let yamlDoc;
  try {
    yamlDoc = parseYamlDocument(content);
    for (const error of yamlDoc.errors) {
      errors.push({
        message: error.message,
        line: error.linePos?.[0]?.line,
        column: error.linePos?.[0]?.col,
        endLine: error.linePos?.[1]?.line,
        endColumn: error.linePos?.[1]?.col
      });
    }
    for (const warning of yamlDoc.warnings) {
      warnings.push({
        message: warning.message,
        line: warning.linePos?.[0]?.line,
        column: warning.linePos?.[0]?.col,
        endLine: warning.linePos?.[1]?.line,
        endColumn: warning.linePos?.[1]?.col
      });
    }
    if (errors.length > 0) {
      return { document: void 0, errors, warnings, ok: false };
    }
    parsedContent = yamlDoc.toJSON();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      message: `YAML parse error: ${message}`
    });
    return { document: void 0, errors, warnings, ok: false };
  }
  if (!documentType && parsedContent) {
    documentType = detectDocumentTypeFromContent(parsedContent);
  }
  const ubmlVersion = parsedContent?.["ubml"] ?? "1.0";
  const meta = {
    version: ubmlVersion,
    type: documentType,
    filename
  };
  const getSourceLocation = (path2) => {
    if (!path2 || path2 === "/") {
      const range = yamlDoc.contents?.range;
      if (range) {
        let line = 1;
        let column = 1;
        for (let i = 0; i < range[0]; i++) {
          if (content[i] === "\n") {
            line++;
            column = 1;
          } else {
            column++;
          }
        }
        return { line, column, offset: range[0] };
      }
      return void 0;
    }
    const parts = path2.split("/").filter(Boolean);
    let node = yamlDoc.contents;
    for (const part of parts) {
      if (!node) return void 0;
      if (isMap(node)) {
        const pair = node.items.find((item) => {
          if (item instanceof Pair) {
            const key = item.key;
            if (key instanceof Scalar) {
              return key.value === part;
            }
          }
          return false;
        });
        if (!pair) return void 0;
        node = pair.value;
      } else if (isSeq(node)) {
        const index = parseInt(part, 10);
        if (isNaN(index) || index < 0 || index >= node.items.length) {
          return void 0;
        }
        node = node.items[index];
      } else {
        return void 0;
      }
    }
    if (node && "range" in node && Array.isArray(node.range)) {
      const offset = node.range[0];
      let line = 1;
      let column = 1;
      for (let i = 0; i < offset; i++) {
        if (content[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
      return { line, column, offset };
    }
    return void 0;
  };
  const document = {
    content: parsedContent,
    meta,
    source: content,
    getSourceLocation
  };
  return { document, errors, warnings, ok: true };
}

// src/validator.ts
init_esm_shims();

// src/generated/bundled.ts
init_esm_shims();
var rootSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ubml.io/schemas/1.0/ubml.schema.yaml",
  "title": "UBML - Unified Business Modeling Language",
  "description": '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  UBML - UNIFIED BUSINESS MODELING LANGUAGE                               \u2551\n\u2551  Version 1.0                                                             \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\nUBML is a YAML-based domain-specific language for business process modeling.\nIt supports the full lifecycle of process improvement projects:\n\nPROBLEM FRAMING\n   Hypothesis trees with SCQH (Situation-Complication-Question-Hypothesis)\n\nPROCESS MODELING  \n   Multi-level processes (L1-L4), steps, links, blocks, phases\n\nACTORS & RESOURCES\n   Roles, teams, systems, skills, resource pools, equipment\n\nINFORMATION MODEL\n   Entities, documents, locations, relationships\n\nMETRICS & ANALYSIS\n   KPIs, ROI analysis, simulation scenarios\n\nPROCESS MINING\n   Event log integration, activity mapping, conformance checking\n\nSTRATEGY\n   Value streams, capabilities, products, services, portfolios\n\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nFILE TYPES:\n\nFor modular projects, use separate files with these patterns:\n\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 File Pattern                   \u2502 Purpose                                \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 *.workspace.ubml.yaml          \u2502 Root workspace configuration           \u2502\n\u2502 *.process.ubml.yaml            \u2502 Process definitions                    \u2502\n\u2502 *.actors.ubml.yaml             \u2502 Actors, skills, resource pools         \u2502\n\u2502 *.entities.ubml.yaml           \u2502 Entities, documents, locations         \u2502\n\u2502 *.scenarios.ubml.yaml          \u2502 Simulation scenarios                   \u2502\n\u2502 *.hypotheses.ubml.yaml         \u2502 Hypothesis trees                       \u2502\n\u2502 *.strategy.ubml.yaml           \u2502 Value streams, capabilities            \u2502\n\u2502 *.metrics.ubml.yaml            \u2502 KPIs and ROI analyses                  \u2502\n\u2502 *.mining.ubml.yaml             \u2502 Process mining configuration           \u2502\n\u2502 *.views.ubml.yaml              \u2502 Custom views and diagrams              \u2502\n\u2502 *.links.ubml.yaml              \u2502 Cross-process links                    \u2502\n\u2502 *.glossary.ubml.yaml           \u2502 Terminology and definitions            \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nThis root schema validates combined files containing multiple sections.\n\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nGETTING STARTED:\n\n1. Create a workspace file (myproject.workspace.ubml.yaml)\n2. Add process files for your workflows\n3. Define actors and their skills\n4. Model your information (entities, documents)\n5. Add metrics and scenarios for analysis\n\nFor VS Code support, add to settings.json:\n\n  "yaml.schemas": {\n    "https://ubml.io/schemas/1.0/documents/process.document.yaml": "*.process.ubml.yaml",\n    "https://ubml.io/schemas/1.0/documents/actors.document.yaml": "*.actors.ubml.yaml",\n    ...\n  }\n\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n',
  "type": "object",
  "additionalProperties": false,
  "required": [
    "ubml"
  ],
  "properties": {
    "ubml": {
      "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
      "type": "string",
      "const": "1.0"
    },
    "name": {
      "description": "Workspace or document name.",
      "type": "string"
    },
    "description": {
      "description": "Detailed description.",
      "type": "string"
    },
    "version": {
      "description": "Document version (e.g., '1.0.0').",
      "type": "string"
    },
    "status": {
      "description": "Document status.",
      "type": "string",
      "enum": [
        "draft",
        "review",
        "approved",
        "archived"
      ]
    },
    "processes": {
      "description": "Process definitions.\nKeyed by process ID (PR### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^PR\\d{3,}$": {
          "$ref": "fragments/process.fragment.yaml#/$defs/Process"
        }
      }
    },
    "actors": {
      "description": "Actor definitions.\nKeyed by actor ID (AC### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^AC\\d{3,}$": {
          "$ref": "fragments/actor.fragment.yaml#/$defs/Actor"
        }
      }
    },
    "skills": {
      "description": "Skill definitions.\nKeyed by skill ID (SK### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^SK\\d{3,}$": {
          "$ref": "fragments/resource.fragment.yaml#/$defs/Skill"
        }
      }
    },
    "resourcePools": {
      "description": "Resource pool definitions.\nKeyed by pool ID (RP### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^RP\\d{3,}$": {
          "$ref": "fragments/resource.fragment.yaml#/$defs/ResourcePool"
        }
      }
    },
    "equipment": {
      "description": "Equipment definitions.\nKeyed by equipment ID (EQ### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^EQ\\d{3,}$": {
          "$ref": "fragments/resource.fragment.yaml#/$defs/Equipment"
        }
      }
    },
    "entities": {
      "description": "Entity definitions.\nKeyed by entity ID (EN### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^EN\\d{3,}$": {
          "$ref": "fragments/entity.fragment.yaml#/$defs/Entity"
        }
      }
    },
    "documents": {
      "description": "Document definitions.\nKeyed by document ID (DC### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^DC\\d{3,}$": {
          "$ref": "fragments/entity.fragment.yaml#/$defs/Document"
        }
      }
    },
    "locations": {
      "description": "Location definitions.\nKeyed by location ID (LO### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^LO\\d{3,}$": {
          "$ref": "fragments/entity.fragment.yaml#/$defs/Location"
        }
      }
    },
    "scenarios": {
      "description": "Scenario definitions.\nKeyed by scenario ID (SC### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^SC\\d{3,}$": {
          "$ref": "fragments/scenario.fragment.yaml#/$defs/Scenario"
        }
      }
    },
    "hypothesisTrees": {
      "description": "Hypothesis tree definitions.\nKeyed by tree ID (HT### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^HT\\d{3,}$": {
          "$ref": "fragments/hypothesis.fragment.yaml#/$defs/HypothesisTree"
        }
      }
    },
    "valueStreams": {
      "description": "Value stream definitions.\nKeyed by value stream ID (VS### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^VS\\d{3,}$": {
          "$ref": "fragments/strategy.fragment.yaml#/$defs/ValueStream"
        }
      }
    },
    "capabilities": {
      "description": "Capability definitions.\nKeyed by capability ID (CP### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^CP\\d{3,}$": {
          "$ref": "fragments/strategy.fragment.yaml#/$defs/Capability"
        }
      }
    },
    "products": {
      "description": "Product definitions.\nKeyed by product ID (PD### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^PD\\d{3,}$": {
          "$ref": "fragments/strategy.fragment.yaml#/$defs/Product"
        }
      }
    },
    "services": {
      "description": "Service definitions.\nKeyed by service ID (SV### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^SV\\d{3,}$": {
          "$ref": "fragments/strategy.fragment.yaml#/$defs/Service"
        }
      }
    },
    "portfolios": {
      "description": "Portfolio definitions.\nKeyed by portfolio ID (PF### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^PF\\d{3,}$": {
          "$ref": "fragments/strategy.fragment.yaml#/$defs/Portfolio"
        }
      }
    },
    "kpis": {
      "description": "KPI definitions.\nKeyed by KPI ID (KP### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^KP\\d{3,}$": {
          "$ref": "fragments/metrics.fragment.yaml#/$defs/KPI"
        }
      }
    },
    "roiAnalyses": {
      "description": "ROI analysis definitions.\nKeyed by ROI ID (ROI### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^ROI\\d{3,}$": {
          "$ref": "fragments/metrics.fragment.yaml#/$defs/ROI"
        }
      }
    },
    "miningSources": {
      "description": "Mining source definitions.\nKeyed by source ID (MS### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^MS\\d{3,}$": {
          "$ref": "fragments/mining.fragment.yaml#/$defs/MiningSource"
        }
      }
    },
    "views": {
      "description": "View definitions.\nKeyed by view ID (VW### pattern).\n",
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^VW\\d{3,}$": {
          "$ref": "fragments/view.fragment.yaml#/$defs/View"
        }
      }
    },
    "links": {
      "description": "Cross-process links.\n",
      "type": "array",
      "items": {
        "$ref": "fragments/link.fragment.yaml#/$defs/Link"
      }
    },
    "metadata": {
      "description": "Document metadata.",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "createdBy": {
          "type": "string"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedBy": {
          "type": "string"
        },
        "approvedAt": {
          "type": "string",
          "format": "date-time"
        },
        "approvedBy": {
          "type": "string"
        }
      }
    },
    "owner": {
      "description": "Document owner.",
      "$ref": "common/defs.schema.yaml#/$defs/ActorRef"
    },
    "stakeholders": {
      "description": "Key stakeholders.",
      "type": "array",
      "items": {
        "$ref": "common/defs.schema.yaml#/$defs/ActorRef"
      }
    },
    "tags": {
      "description": "Tags for filtering and organization.",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "custom": {
      "description": "User-defined custom fields.",
      "$ref": "common/defs.schema.yaml#/$defs/CustomFields"
    }
  }
};
var defsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ubml.io/schemas/1.0/common/defs.schema.yaml",
  "title": "UBML Common Definitions",
  "description": "Shared type definitions for UBML (Unified Business Modeling Language).\n\nThis schema defines:\n- Reference types for linking between model elements\n- Primitive types for durations, money, rates\n- Expression language specification\n- Common enums and value types\n",
  "$defs": {
    "ActorRef": {
      "description": "Reference to an actor (AC### pattern).\n\nActors represent WHO does work in your processes:\n- People, roles, teams, organizations\n- Systems and external parties\n\nExamples: AC001, AC042, AC100\n",
      "type": "string",
      "pattern": "^AC\\d{3,}$"
    },
    "StepRef": {
      "description": "Reference to a step (ST### pattern).\n\nSteps are the individual activities within a process.\n\nExamples: ST001, ST015, ST200\n",
      "type": "string",
      "pattern": "^ST\\d{3,}$"
    },
    "ProcessRef": {
      "description": "Reference to a process (PR### pattern).\n\nProcesses are workflows containing steps, links, and control flow.\n\nExamples: PR001, PR010, PR100\n",
      "type": "string",
      "pattern": "^PR\\d{3,}$"
    },
    "EntityRef": {
      "description": "Reference to an entity (EN### pattern).\n\nEntities are core business objects like Order, Customer, Contract.\n\nExamples: EN001, EN015, EN100\n",
      "type": "string",
      "pattern": "^EN\\d{3,}$"
    },
    "DocumentRef": {
      "description": "Reference to a document (DC### pattern).\n\nDocuments are representations of entities:\n- Forms, contracts, reports, invoices\n- Files, templates, signed documents\n\nExamples: DC001, DC010, DC100\n",
      "type": "string",
      "pattern": "^DC\\d{3,}$"
    },
    "SkillRef": {
      "description": "Reference to a skill (SK### pattern).\n\nSkills define what people can do:\n- Certifications (HGV license, crane operator)\n- Competencies (negotiation, technical review)\n\nExamples: SK001, SK010, SK100\n",
      "type": "string",
      "pattern": "^SK\\d{3,}$"
    },
    "ServiceRef": {
      "description": "Reference to a service (SV### pattern).\n\nServices are offerings in the service catalog.\n\nExamples: SV001, SV010, SV100\n",
      "type": "string",
      "pattern": "^SV\\d{3,}$"
    },
    "ScenarioRef": {
      "description": "Reference to a scenario (SC### pattern).\n\nScenarios define simulation configurations for what-if analysis.\n\nExamples: SC001, SC010, SC100\n",
      "type": "string",
      "pattern": "^SC\\d{3,}$"
    },
    "HypothesisRef": {
      "description": "Reference to a hypothesis node (HY### pattern).\n\nHypotheses are nodes in the SCQH hypothesis tree.\n\nExamples: HY001, HY010, HY100\n",
      "type": "string",
      "pattern": "^HY\\d{3,}$"
    },
    "EvidenceRef": {
      "description": "Reference to evidence (EV### pattern).\n\nEvidence items are structured workshop findings:\n- Quotes, observations, pain points\n- Assumptions, metrics, insights\n\nExamples: EV001, EV010, EV100\n",
      "type": "string",
      "pattern": "^EV\\d{3,}$"
    },
    "KpiRef": {
      "description": "Reference to a KPI (KP### pattern).\n\nKPIs are key performance indicators with targets.\n\nExamples: KP001, KP010, KP100\n",
      "type": "string",
      "pattern": "^KP\\d{3,}$"
    },
    "CapabilityRef": {
      "description": "Reference to a capability (CP### pattern).\n\nCapabilities describe what the organization can do.\n\nExamples: CP001, CP010, CP100\n",
      "type": "string",
      "pattern": "^CP\\d{3,}$"
    },
    "ValueStreamRef": {
      "description": "Reference to a value stream (VS### pattern).\n\nValue streams show end-to-end value flows across processes.\n\nExamples: VS001, VS010, VS100\n",
      "type": "string",
      "pattern": "^VS\\d{3,}$"
    },
    "ProductRef": {
      "description": "Reference to a product (PD### pattern).\n\nProducts are bundled offerings to customers.\n\nExamples: PD001, PD010, PD100\n",
      "type": "string",
      "pattern": "^PD\\d{3,}$"
    },
    "PortfolioRef": {
      "description": 'Reference to a portfolio (PF### pattern).\n\nPortfolios group related products, services, or process types.\nThey enable executive-level views and organizational structuring:\n- Product portfolios: "Consumer Products", "Enterprise Solutions"\n- Service portfolios: "Professional Services", "Support Services"\n- Project portfolios: "Infrastructure Projects", "Digital Transformation"\n\nPortfolios can be hierarchical (parent portfolios contain sub-portfolios).\n\nExamples: PF001, PF010, PF100\n',
      "type": "string",
      "pattern": "^PF\\d{3,}$"
    },
    "EquipmentRef": {
      "description": "Reference to equipment (EQ### pattern).\n\nEquipment represents physical assets used to perform work:\n- Vehicles: trucks, forklifts, cranes\n- Machines: production lines, CNC machines, 3D printers\n- Tools: specialized equipment, testing devices\n- Devices: scanners, tablets, measurement instruments\n\nEquipment is separate from actors because:\n1. Equipment cannot be accountable (RACI only has people/roles)\n2. Equipment requires operators with specific skills\n3. Equipment has physical location constraints\n4. Equipment has capacity/throughput characteristics\n\nExamples: EQ001, EQ010, EQ100\n",
      "type": "string",
      "pattern": "^EQ\\d{3,}$"
    },
    "LocationRef": {
      "description": "Reference to a location (LC### pattern).\n\nLocations answer WHERE work happens or equipment is stationed:\n- Sites: construction sites, customer premises\n- Facilities: factories, warehouses, offices\n- Regions: geographic areas for service coverage\n- Zones: areas within a facility (assembly line, loading dock)\n\nLocations are separate from actors because:\n1. A location is not a participant - it's a place\n2. Multiple actors can work at the same location\n3. Equipment is stationed at locations\n4. Some steps are location-specific (on-site vs remote)\n\nExamples: LC001, LC010, LC100\n",
      "type": "string",
      "pattern": "^LC\\d{3,}$"
    },
    "BlockRef": {
      "description": "Reference to a control flow block (BK### pattern).\n\nBlocks define EXECUTION semantics - how steps run together:\n- par: parallel execution\n- alt: alternative paths (branching)\n- loop: repeated execution\n- opt: optional execution\n\nExamples: BK001, BK010, BK100\n",
      "type": "string",
      "pattern": "^BK\\d{3,}$"
    },
    "PhaseRef": {
      "description": "Reference to a process phase (PH### pattern).\n\nPhases are ORGANIZATIONAL overlays on the process graph:\n- lifecycle: project stages like Design \u2192 Build \u2192 Test\n- delivery: release scopes like MVP, Phase 1, Future\n\nPhases do NOT affect execution - they're purely for visualization\nand stakeholder communication. Use blocks for execution semantics.\n\nExamples: PH001, PH010, PH100\n",
      "type": "string",
      "pattern": "^PH\\d{3,}$"
    },
    "PersonaRef": {
      "description": "Reference to a persona (PS### pattern).\n\nPersonas are stakeholder archetypes with goals and pain points.\n\nExamples: PS001, PS010, PS100\n",
      "type": "string",
      "pattern": "^PS\\d{3,}$"
    },
    "ResourcePoolRef": {
      "description": "Reference to a resource pool (RP### pattern).\n\nResource pools group interchangeable resources for simulation.\n\nExamples: RP001, RP010, RP100\n",
      "type": "string",
      "pattern": "^RP\\d{3,}$"
    },
    "ViewRef": {
      "description": "Reference to a view (VW### pattern).\n\nViews are saved diagram configurations.\n\nExamples: VW001, VW010, VW100\n",
      "type": "string",
      "pattern": "^VW\\d{3,}$"
    },
    "DataObjectInput": {
      "description": "Reference to an entity or document as step input.\n\nInputs are read-only and don't change document state.\nUse 'inState' to require the document be in a specific lifecycle state.\n\nExamples:\n  # Simple reference\n  - ref: DC001\n  \n  # With required state\n  - ref: DC002\n    inState: approved\n",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "ref"
      ],
      "properties": {
        "ref": {
          "description": "Entity or document ID.",
          "oneOf": [
            {
              "$ref": "#/$defs/EntityRef"
            },
            {
              "$ref": "#/$defs/DocumentRef"
            }
          ]
        },
        "inState": {
          "description": "Required document state (precondition).\nMust match a state from the document's lifecycle array.\nOptional - omit if any state is acceptable.\n",
          "type": "string"
        }
      }
    },
    "DataObjectOutput": {
      "description": "Reference to an entity or document as step output.\n\nOutputs can change document state. Lifecycle progression:\n- First output of a document \u2192 created in first lifecycle state\n- Subsequent outputs \u2192 document advances to next lifecycle state\n- Use explicit toState for non-linear flows (rejection, rework)\n\nExamples:\n  # Simple reference (auto-advance state)\n  - ref: DC001\n  \n  # With explicit target state (for rejection/rework)\n  - ref: DC002\n    toState: draft\n",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "ref"
      ],
      "properties": {
        "ref": {
          "description": "Entity or document ID.",
          "oneOf": [
            {
              "$ref": "#/$defs/EntityRef"
            },
            {
              "$ref": "#/$defs/DocumentRef"
            }
          ]
        },
        "toState": {
          "description": "Target document state after this step completes.\nMust match a state from the document's lifecycle array.\n\nUse only for non-linear flows (rejection, rework, cancellation).\nFor normal forward progression, omit this - the tool infers\nthe next state from the document's lifecycle order.\n",
          "type": "string"
        }
      }
    },
    "CustomFields": {
      "description": 'User-defined key-value pairs for extensibility.\n\nCustom fields allow adding domain-specific metadata without\nschema changes. Values can be strings, numbers, booleans,\nor arrays of strings/numbers.\n\nExamples:\n  custom:\n    region: "EMEA"\n    priority: 1\n    isLegacy: true\n    tags: ["urgent", "customer-facing"]\n',
      "type": "object",
      "additionalProperties": {
        "oneOf": [
          {
            "type": "string"
          },
          {
            "type": "number"
          },
          {
            "type": "boolean"
          },
          {
            "type": "array",
            "items": {
              "oneOf": [
                {
                  "type": "string"
                },
                {
                  "type": "number"
                }
              ]
            }
          }
        ]
      }
    },
    "Money": {
      "description": 'Monetary amount with currency.\n\nUses ISO 4217 currency codes.\n\nExamples:\n  amount: 1500.00\n  currency: "EUR"\n',
      "type": "object",
      "additionalProperties": false,
      "required": [
        "amount",
        "currency"
      ],
      "properties": {
        "amount": {
          "description": "Monetary amount (decimal).",
          "type": "number"
        },
        "currency": {
          "description": "ISO 4217 currency code.",
          "type": "string",
          "examples": [
            "USD",
            "EUR",
            "CZK",
            "GBP"
          ]
        }
      }
    },
    "Rate": {
      "description": 'Cost rate with currency and time unit.\n\nUsed for actor/resource costing in simulation.\n\nExamples:\n  # Hourly rate\n  amount: 75\n  currency: "EUR"\n  per: h\n  \n  # Daily rate\n  amount: 500\n  currency: "USD"\n  per: d\n',
      "type": "object",
      "additionalProperties": false,
      "required": [
        "amount",
        "currency",
        "per"
      ],
      "properties": {
        "amount": {
          "description": "Rate amount per time unit.",
          "type": "number"
        },
        "currency": {
          "description": "ISO 4217 currency code.",
          "type": "string"
        },
        "per": {
          "description": "Time unit for rate.",
          "type": "string",
          "enum": [
            "h",
            "d",
            "wk",
            "mo"
          ]
        }
      }
    },
    "DurationString": {
      "description": 'Duration string in format: number + unit.\n\nSupported units:\n- min: minutes\n- h: hours\n- d: days\n- wk: weeks\n- mo: months\n\nExamples: "2d", "4h", "30min", "1.5wk", "3mo"\n',
      "type": "string",
      "pattern": "^[0-9]+(\\.[0-9]+)?(min|h|d|wk|mo)$"
    },
    "Duration": {
      "description": 'Duration value: literal string or expression.\n\nThree forms (pick one):\n\n1. Direct string (shorthand for fixed literal):\n   duration: "2d"\n   duration: "4h"\n\n2. Object with fixed literal:\n   duration: { fixed: "2d" }\n\n3. Object with expression (calculation or work attribute):\n   duration: { expr: "tri(d(1),d(2),d(4))" }   # distribution\n   duration: { expr: "baseEffort * 1.5" }      # calculation\n   duration: { expr: adjustedEffort }          # work attribute\n',
      "oneOf": [
        {
          "$ref": "#/$defs/DurationString"
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "fixed"
          ],
          "properties": {
            "fixed": {
              "description": "Fixed duration literal.",
              "$ref": "#/$defs/DurationString"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "expr"
          ],
          "properties": {
            "expr": {
              "description": "Expression that evaluates to a duration.\nCan be a calculation, distribution, or work attribute.\n\nExamples:\n  tri(d(1),d(2),d(4))    # triangular distribution\n  baseEffort * 1.5       # calculation\n  adjustedEffort         # work attribute\n",
              "type": "string"
            }
          }
        }
      ]
    },
    "TimeString": {
      "description": 'Time in HH:MM format (24-hour).\n\nExamples: "08:00", "17:30", "00:00", "23:59"\n',
      "type": "string",
      "pattern": "^[0-2][0-9]:[0-5][0-9]$"
    },
    "DateString": {
      "description": 'Date in ISO 8601 format (YYYY-MM-DD).\n\nExamples: "2026-01-03", "2025-12-31"\n',
      "type": "string",
      "format": "date"
    },
    "Month": {
      "description": "Three-letter month abbreviation.\nUsed for scenario arrival patterns.\n",
      "type": "string",
      "enum": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
    },
    "Weekday": {
      "description": "Three-letter weekday abbreviation.\nUsed for calendar work day configuration.\n",
      "type": "string",
      "enum": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]
    },
    "Expression": {
      "description": `TypeScript-subset expression string (ts-subset-v1).

Expressions can be:
- Calculations: "orderValue > 50000 && customer.segment == 'enterprise'"
- Work attribute references: isHighValue (a simple variable name)

WORK ATTRIBUTES:
Expressions can reference work attributes defined in workAttributes[]:
- bindsTo: keys that map to information model attributes
- expr: computed keys that derive values from other attributes

USAGE EXAMPLES:
  # In guards
  guard: "isHighValue && customer.segment == 'enterprise'"
  guard: isHighValue
  
  # In durations
  duration: { expr: "adjustedEffort * 1.2" }
  duration: { expr: adjustedEffort }

ALLOWED SYNTAX:
- Literals: number, string, boolean, null
- Operators: + - * / %, comparisons, && || !, ternary (cond ? a : b)
- Property access: customer.region, order.value
- Work attribute keys: orderValue, isHighValue, adjustedEffort
- Built-in functions: tri(min,mode,max), min(...), max(...), 
  clamp(x,lo,hi), round(x,digits?), floor(x), ceil(x)
- Duration helpers: min(x), h(x), d(x), wk(x), mo(x)

DISALLOWED:
- Assignments, loops, if statements
- new, classes, imports
- Global access (window, globalThis, etc.)
`,
      "type": "string"
    },
    "Annotation": {
      "description": `Notes and markers attached to steps or blocks.

Use annotations for:
- note: free-form documentation or clarification
- compliance: regulatory/compliance markers (e.g., SOX, GDPR)
- sla: service level agreement markers
- warning: cautions or risk indicators

IMPORTANT: Milestones are NOT annotations. Use Step.kind = 'milestone'
to create a real milestone node in the process graph. Milestones are
significant process checkpoints that can be referenced by Phases.

Examples:
  annotations:
    - type: compliance
      text: "GDPR data handling requirements"
      code: "GDPR-Art17"
    - type: sla
      text: "Must complete within 4 hours"
      code: "SLA-RESP-4H"
`,
      "type": "object",
      "additionalProperties": false,
      "required": [
        "text"
      ],
      "properties": {
        "type": {
          "description": "Annotation type. Each type may be rendered differently in diagrams:\n- note: informational callout\n- compliance: regulatory badge with code reference\n- sla: timing/performance indicator\n- warning: alert/caution marker\n",
          "type": "string",
          "enum": [
            "note",
            "compliance",
            "sla",
            "warning"
          ]
        },
        "text": {
          "description": "The annotation content displayed to users.",
          "type": "string"
        },
        "code": {
          "description": 'External reference code for traceability.\nExamples: "FAST 1.1", "SOX-42", "GDPR-Art17", "SLA-RESP-4H"\n',
          "type": "string"
        }
      }
    },
    "StepLifecycleEvent": {
      "description": "Events in a step's lifecycle that can trigger notifications or actions.\n\nUsed by:\n- Notification.trigger: when to send alerts\n- Future: automation hooks, audit logging\n\nEVENTS:\n- onStart: step begins execution\n- onComplete: step finishes successfully\n- onError: step fails or encounters an error\n- onAssign: step is assigned to a resource\n- onReassign: step is reassigned to different resource\n- onOutcome: specific approval/decision outcome reached\n- onReviewComplete: all required reviews received\n- onDeadlineWarning: approaching deadline (requires threshold)\n- onDeadlineBreach: deadline exceeded\n",
      "type": "string",
      "enum": [
        "onStart",
        "onComplete",
        "onError",
        "onAssign",
        "onReassign",
        "onOutcome",
        "onReviewComplete",
        "onDeadlineWarning",
        "onDeadlineBreach"
      ]
    },
    "ProcessTriggerEvent": {
      "description": "Events that can trigger cross-process orchestration.\n\nUsed by ProcessTrigger.event to start another process.\n\nEVENTS:\n- onComplete: source step finishes successfully\n- onStart: source step begins execution\n- onError: source step fails or encounters an error\n",
      "type": "string",
      "enum": [
        "onComplete",
        "onStart",
        "onError"
      ]
    },
    "StandardOutcome": {
      "description": "Common approval/decision outcomes for consistency across processes.\n\nThese are the recommended standard outcomes. Custom outcomes can\nstill be defined in Approval.outcomes as strings.\n\nSTANDARD OUTCOMES:\n- approved: request accepted, proceed with next steps\n- rejected: request denied, typically ends the flow or returns\n- returned: sent back for revision (not denied, needs rework)\n- deferred: decision postponed to a later time\n- escalated: decision elevated to higher authority\n- timeout: deadline breached without decision\n",
      "type": "string",
      "enum": [
        "approved",
        "rejected",
        "returned",
        "deferred",
        "escalated",
        "timeout"
      ]
    },
    "Priority": {
      "description": "Priority levels for notifications, tasks, and work items.\n\nLEVELS:\n- low: informational, can be batched or delayed\n- normal: standard handling (default)\n- high: prompt attention, visual emphasis\n- urgent: immediate action required, may trigger escalation\n",
      "type": "string",
      "enum": [
        "low",
        "normal",
        "high",
        "urgent"
      ]
    },
    "CommentRequirement": {
      "description": "When comments are required from approvers or reviewers.\n\nVALUES:\n- never: comments optional (default)\n- onNegative: required when rejecting, returning, or flagging issues\n- always: required for all responses\n",
      "type": "string",
      "enum": [
        "never",
        "onNegative",
        "always"
      ]
    }
  }
};
var documentSchemas = {
  "actors": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/actors.document.yaml",
    "title": "Actors",
    "description": "Actor documents define the people, roles, teams, and systems that \nparticipate in business processes.\n\nWHAT IS AN ACTOR?\nAn actor is any entity that performs work in a process:\n- Roles (Job titles, functional roles)\n- Teams (Departments, groups)\n- Systems (IT systems, automated services)\n- External parties (Customers, vendors)\n\nACTOR COMPONENTS:\n- Actors: The participants themselves with skills and availability\n- Skills: Competencies and capabilities actors possess\n- ResourcePools: Groups of actors for capacity planning\n- Equipment: Physical resources used by actors\n\nFILE NAMING: *.actors.ubml.yaml\nExamples:\n  - sales-team.actors.ubml.yaml\n  - operations-department.actors.ubml.yaml\n  - external-parties.actors.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "core",
      "categoryDisplayName": "Core Modeling",
      "workflowOrder": 2,
      "shortDescription": "Define people, roles, teams, and systems that participate in processes.",
      "gettingStarted": [
        "Define actors with their types (role, team, system, external)",
        "Add skills they possess",
        "Define availability and capacity",
        "Optionally add personas and pain points"
      ],
      "exampleFilename": "actors.ubml.yaml",
      "exampleFilenameAlternative": "organization.actors.ubml.yaml",
      "templateDefaults": {
        "actors": {
          "type": "role",
          "kind": "human"
        }
      }
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what actors are defined in this file.\n",
        "type": "string"
      },
      "actors": {
        "description": 'Actor definitions, keyed by actor ID.\n\nActor IDs follow the AC### pattern (e.g., AC001, AC002).\n\nExample:\n  actors:\n    AC001:\n      name: "Sales Representative"\n      type: role\n      skills:\n        - skill: SK001\n          level: expert\n      availability:\n        hoursPerDay: 8\n        daysPerWeek: 5\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^AC\\d{3,}$": {
            "$ref": "../fragments/actor.fragment.yaml#/$defs/Actor"
          }
        }
      },
      "skills": {
        "description": 'Skill definitions, keyed by skill ID.\n\nSkill IDs follow the SK### pattern.\n\nExample:\n  skills:\n    SK001:\n      name: "Customer Communication"\n      category: soft-skill\n      description: "Ability to communicate effectively with customers"\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^SK\\d{3,}$": {
            "$ref": "../fragments/resource.fragment.yaml#/$defs/Skill"
          }
        }
      },
      "resourcePools": {
        "description": 'Resource pool definitions, keyed by pool ID.\n\nResource pool IDs follow the RP### pattern.\n\nExample:\n  resourcePools:\n    RP001:\n      name: "Order Processing Team"\n      members: [AC001, AC002, AC003]\n      capacity: 24\n      capacityUnit: hours-per-day\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^RP\\d{3,}$": {
            "$ref": "../fragments/resource.fragment.yaml#/$defs/ResourcePool"
          }
        }
      },
      "equipment": {
        "description": 'Equipment definitions, keyed by equipment ID.\n\nEquipment IDs follow the EQ### pattern.\n\nExample:\n  equipment:\n    EQ001:\n      name: "Forklift"\n      type: vehicle\n      capacity: 2000\n      capacityUnit: kg\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^EQ\\d{3,}$": {
            "$ref": "../fragments/resource.fragment.yaml#/$defs/Equipment"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "entities": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/entities.document.yaml",
    "title": "Entities",
    "description": "Entity documents define the information model - the data objects,\ndocuments, and locations relevant to business processes.\n\nWHAT IS AN INFORMATION MODEL?\nThe information model describes the data landscape:\n- Entities: Business objects (Order, Customer, Product)\n- Documents: Files and forms (Contract, Invoice, Report)\n- Locations: Physical/logical places (Warehouse, Office, Region)\n\nWHY DEFINE ENTITIES?\nEntity definitions enable:\n- Data flow visualization\n- Integration planning\n- Requirements documentation\n- System design\n\nFILE NAMING: *.entities.ubml.yaml\nExamples:\n  - order-model.entities.ubml.yaml\n  - customer-data.entities.ubml.yaml\n  - master-data.entities.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "core",
      "categoryDisplayName": "Core Modeling",
      "workflowOrder": 4,
      "shortDescription": "Define the information model - data objects, documents, and locations.",
      "gettingStarted": [
        "Define entities for your core business objects",
        "Add attributes with types and relationships",
        "Add documents that flow through processes",
        "Optionally add locations for physical context"
      ],
      "exampleFilename": "entities.ubml.yaml",
      "exampleFilenameAlternative": "data-model.entities.ubml.yaml",
      "templateDefaults": {
        "entities": {
          "type": "business-object"
        }
      }
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what information model elements are defined in this file.\n",
        "type": "string"
      },
      "entities": {
        "description": 'Entity definitions, keyed by entity ID.\n\nEntity IDs follow the EN### pattern (e.g., EN001, EN002).\n\nExample:\n  entities:\n    EN001:\n      name: "Sales Order"\n      description: "Customer order with line items"\n      attributes:\n        orderId:\n          type: string\n          required: true\n        totalValue:\n          type: money\n      relationships:\n        customer:\n          target: EN002\n          type: many-to-one\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^EN\\d{3,}$": {
            "$ref": "../fragments/entity.fragment.yaml#/$defs/Entity"
          }
        }
      },
      "documents": {
        "description": 'Document definitions, keyed by document ID.\n\nDocument IDs follow the DC### pattern (e.g., DC001, DC002).\n\nExample:\n  documents:\n    DC001:\n      name: "Purchase Order"\n      format: pdf\n      requiresSignature: true\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^DC\\d{3,}$": {
            "$ref": "../fragments/entity.fragment.yaml#/$defs/Document"
          }
        }
      },
      "locations": {
        "description": 'Location definitions, keyed by location ID.\n\nLocation IDs follow the LO### pattern (e.g., LO001, LO002).\n\nExample:\n  locations:\n    LO001:\n      name: "Main Warehouse"\n      type: warehouse\n      address: "123 Industrial Blvd"\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^LO\\d{3,}$": {
            "$ref": "../fragments/entity.fragment.yaml#/$defs/Location"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "glossary": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/glossary.document.yaml",
    "title": "Glossary",
    "description": "Glossary documents define business terminology and definitions.\n\nWHY A GLOSSARY?\nA glossary ensures consistent terminology across:\n- Process documentation\n- Stakeholder communication\n- Team collaboration\n- Training materials\n\nGLOSSARY ENTRIES:\nEach entry includes:\n- Term: The word or phrase\n- Definition: Clear explanation\n- Aliases: Alternative names\n- Context: Where/how it's used\n\nFILE NAMING: *.glossary.ubml.yaml\nExamples:\n  - business-terms.glossary.ubml.yaml\n  - technical-glossary.glossary.ubml.yaml\n  - domain-vocabulary.glossary.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "advanced",
      "categoryDisplayName": "Advanced",
      "workflowOrder": 9,
      "shortDescription": "Define business terminology and definitions.",
      "gettingStarted": [
        "Identify key terms in your domain",
        "Write clear, concise definitions",
        "Add aliases for common variations",
        "Categorize for easier navigation"
      ],
      "exampleFilename": "business-terms.glossary.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what terminology is covered in this glossary.\n",
        "type": "string"
      },
      "terms": {
        "description": 'Glossary term definitions.\n\nExample:\n  terms:\n    - term: "Order Fulfillment"\n      definition: "The complete process from receiving an order to delivering the product"\n      aliases: ["Order Processing", "Order Completion"]\n      category: "Process"\n    - term: "SLA"\n      definition: "Service Level Agreement - contractual commitment for service delivery"\n      aliases: ["Service Level Agreement"]\n      category: "Governance"\n',
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "term",
            "definition"
          ],
          "properties": {
            "term": {
              "description": "The term being defined.",
              "type": "string"
            },
            "definition": {
              "description": "Clear, concise definition of the term.",
              "type": "string"
            },
            "aliases": {
              "description": "Alternative names or abbreviations.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "category": {
              "description": 'Category for grouping terms.\n\nExamples: "Process", "Technical", "Business", "Legal"\n',
              "type": "string"
            },
            "context": {
              "description": "Where or how this term is used.",
              "type": "string"
            },
            "examples": {
              "description": "Usage examples.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relatedTerms": {
              "description": "Related glossary terms.",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "source": {
              "description": "Source or authority for the definition.",
              "type": "string"
            },
            "tags": {
              "description": "Tags for filtering.",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
      },
      "categories": {
        "description": 'Category definitions for organizing terms.\n\nExample:\n  categories:\n    - name: "Process"\n      description: "Process-related terminology"\n    - name: "Technical"\n      description: "Technical and IT terms"\n',
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            }
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "hypotheses": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/hypotheses.document.yaml",
    "title": "Hypotheses",
    "description": "Hypothesis documents define hypothesis trees for structured problem framing.\n\nWHAT IS A HYPOTHESIS TREE?\nA hypothesis tree decomposes a main hypothesis into sub-hypotheses\nthat can be independently validated. It uses the SCQH framework:\n- Situation: Current state/context\n- Complication: What changed/problem\n- Question: Key question arising\n- Hypothesis: Proposed answer\n\nWHY USE HYPOTHESIS TREES?\nHypothesis trees enable:\n- Structured problem decomposition\n- Evidence-based decision making\n- Clear communication of reasoning\n- Progress tracking on analysis\n\nFILE NAMING: *.hypotheses.ubml.yaml\nExamples:\n  - process-improvement.hypotheses.ubml.yaml\n  - market-entry.hypotheses.ubml.yaml\n  - cost-reduction.hypotheses.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "analysis",
      "categoryDisplayName": "Analysis & Planning",
      "workflowOrder": 6,
      "shortDescription": "Define hypothesis trees for structured problem framing.",
      "gettingStarted": [
        "Define the SCQH context",
        "Create the root hypothesis",
        "Decompose into sub-hypotheses",
        "Track validation status as you gather evidence"
      ],
      "exampleFilename": "solution.hypotheses.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what analysis is contained in this file.\n",
        "type": "string"
      },
      "hypothesisTrees": {
        "description": 'Hypothesis tree definitions, keyed by tree ID.\n\nHypothesis tree IDs follow the HT### pattern (e.g., HT001, HT002).\n\nExample:\n  hypothesisTrees:\n    HT001:\n      name: "Process Optimization Analysis"\n      scqh:\n        situation: "Current process takes 5 days"\n        complication: "Customers expect 2 days"\n        question: "How can we reduce to 2 days?"\n        hypothesis: "Streamline approvals and automate"\n      root:\n        id: H001\n        text: "We can achieve 2-day processing"\n        children:\n          - id: H002\n            text: "Approvals can be streamlined"\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^HT\\d{3,}$": {
            "$ref": "../fragments/hypothesis.fragment.yaml#/$defs/HypothesisTree"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "links": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/links.document.yaml",
    "title": "Links",
    "description": "Link documents define relationships between steps across processes.\n\nWHEN TO USE LINK DOCUMENTS?\nLinks within a single process are defined in the process document.\nUse a separate links document when:\n- Connecting steps across different process files\n- Managing complex cross-process dependencies\n- Keeping interface definitions separate from processes\n\nLINK TYPES:\n- Routing: Control flow connections\n- Scheduling: Timing dependencies\n- Data flow: Information passing\n\nFILE NAMING: *.links.ubml.yaml\nExamples:\n  - cross-process-links.links.ubml.yaml\n  - order-to-fulfillment.links.ubml.yaml\n  - integration-links.links.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "advanced",
      "categoryDisplayName": "Advanced",
      "workflowOrder": 11,
      "shortDescription": "Define relationships between steps across processes.",
      "gettingStarted": [
        "Identify cross-process connections",
        "Define links with source and target steps",
        "Add conditions or scheduling as needed",
        "Document data bindings if applicable"
      ],
      "exampleFilename": "cross-process.links.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what links are defined in this file.\n",
        "type": "string"
      },
      "links": {
        "description": 'Cross-process link definitions.\n\nExample:\n  links:\n    - from: ST015\n      to: ST101\n      condition: "order.approved"\n      schedule:\n        type: finish-to-start\n        lag: "1h"\n      dataBindings:\n        orderId: approvedOrderId\n',
        "type": "array",
        "items": {
          "$ref": "../fragments/link.fragment.yaml#/$defs/Link"
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "metrics": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/metrics.document.yaml",
    "title": "Metrics",
    "description": "Metrics documents define Key Performance Indicators (KPIs) and \nReturn on Investment (ROI) analyses.\n\nWHAT ARE METRICS?\nMetrics are quantifiable measures used to evaluate performance:\n- KPIs: Ongoing performance measures with targets\n- ROI: Investment analysis comparing costs to benefits\n\nWHY DEFINE METRICS?\nMetrics enable:\n- Performance monitoring\n- Objective setting and tracking\n- Business case justification\n- Continuous improvement\n\nFILE NAMING: *.metrics.ubml.yaml\nExamples:\n  - process-kpis.metrics.ubml.yaml\n  - automation-roi.metrics.ubml.yaml\n  - performance-targets.metrics.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "analysis",
      "categoryDisplayName": "Analysis & Planning",
      "workflowOrder": 5,
      "shortDescription": "Define KPIs and ROI analyses for performance measurement.",
      "gettingStarted": [
        "Define KPIs for your key processes",
        "Set baseline and target values",
        "Define thresholds for performance levels",
        "Add ROI analysis for improvement initiatives"
      ],
      "exampleFilename": "process-kpis.metrics.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what metrics are defined in this file.\n",
        "type": "string"
      },
      "kpis": {
        "description": 'KPI definitions, keyed by KPI ID.\n\nKPI IDs follow the KP### pattern (e.g., KP001, KP002).\n\nExample:\n  kpis:\n    KP001:\n      name: "Order Cycle Time"\n      description: "Time from order to delivery"\n      type: process\n      unit: hours\n      baseline: 120\n      target: 48\n      thresholds:\n        - level: red\n          value: 120\n          operator: gte\n        - level: green\n          value: 48\n          operator: lte\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^KP\\d{3,}$": {
            "$ref": "../fragments/metrics.fragment.yaml#/$defs/KPI"
          }
        }
      },
      "roiAnalyses": {
        "description": 'ROI analysis definitions, keyed by ROI ID.\n\nROI IDs follow the ROI### pattern (e.g., ROI001, ROI002).\n\nExample:\n  roiAnalyses:\n    ROI001:\n      name: "Process Automation Business Case"\n      analysisPeriod: 36\n      discountRate: 0.08\n      costs:\n        - name: "Software License"\n          amount: 50000\n          timing: one-time\n      benefits:\n        - name: "Labor Savings"\n          amount: 40000\n          timing: recurring\n          frequency: annually\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^ROI\\d{3,}$": {
            "$ref": "../fragments/metrics.fragment.yaml#/$defs/ROI"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "mining": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/mining.document.yaml",
    "title": "Mining",
    "description": "Mining documents configure process mining data sources and mappings.\n\nWHAT IS PROCESS MINING?\nProcess mining extracts insights from system event logs to:\n- Discover actual process flows\n- Compare reality vs. documented processes\n- Identify bottlenecks and variations\n- Validate process improvements\n\nWHY MINING CONFIGURATION?\nMining configuration enables:\n- Connecting event log data to UBML models\n- Mapping activities to steps\n- Mapping resources to actors\n- Conformance checking\n\nFILE NAMING: *.mining.ubml.yaml\nExamples:\n  - sap-order-mining.mining.ubml.yaml\n  - crm-ticket-mining.mining.ubml.yaml\n  - erp-integration.mining.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "advanced",
      "categoryDisplayName": "Advanced",
      "workflowOrder": 12,
      "shortDescription": "Configure process mining data sources and mappings.",
      "gettingStarted": [
        "Define the data source (CSV, database, API)",
        "Map columns to event log fields",
        "Map activities to UBML steps",
        "Map resources to UBML actors"
      ],
      "exampleFilename": "event-log.mining.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what mining configuration is in this file.\n",
        "type": "string"
      },
      "miningSources": {
        "description": 'Mining source definitions, keyed by source ID.\n\nMining source IDs follow the MS### pattern (e.g., MS001, MS002).\n\nExample:\n  miningSources:\n    MS001:\n      name: "SAP Order Log"\n      type: csv\n      columns:\n        caseId: "Order_Number"\n        activity: "Activity_Name"\n        timestamp: "Event_Time"\n        resource: "User_ID"\n      timestampFormat: "YYYY-MM-DD HH:mm:ss"\n      process: PR001\n      activityMappings:\n        - activity: "Create Order"\n          step: ST001\n        - activity: "Approve Order"\n          step: ST002\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^MS\\d{3,}$": {
            "$ref": "../fragments/mining.fragment.yaml#/$defs/MiningSource"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "process": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/process.document.yaml",
    "title": "Process",
    "description": "Process documents define business processes with steps, links, and control flow.\n\nWHAT IS A PROCESS DOCUMENT?\nA process document contains one or more related processes that describe\nhow work flows through an organization. Processes can be hierarchical\n(L1 strategic to L4 work instructions) and can reference each other.\n\nPROCESS COMPONENTS:\n- Steps: Activities, tasks, decisions, events, milestones\n- Links: Connections between steps (routing and scheduling)\n- Blocks: Control flow groupings (parallel, alternative, loops)\n- Phases: Organizational groupings (lifecycle, delivery)\n\nFILE NAMING: *.process.ubml.yaml\nExamples:\n  - order-fulfillment.process.ubml.yaml\n  - customer-onboarding.process.ubml.yaml\n  - invoice-processing.process.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "core",
      "categoryDisplayName": "Core Modeling",
      "workflowOrder": 3,
      "shortDescription": "Define business processes with steps, links, and control flow.",
      "gettingStarted": [
        "Define the process with id, name, and description",
        "Add steps for each activity in the process",
        "Add links to connect steps and define flow",
        "Optionally add phases and blocks for organization"
      ],
      "exampleFilename": "process.ubml.yaml",
      "exampleFilenameAlternative": "order-fulfillment.process.ubml.yaml",
      "templateDefaults": {
        "processes": {
          "steps": {
            "ST001": {
              "name": "First Step",
              "kind": "action",
              "description": "First step description"
            }
          }
        }
      }
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml",
      "processes"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what processes are contained in this file.\n",
        "type": "string"
      },
      "processes": {
        "description": 'Process definitions, keyed by process ID.\n\nProcess IDs follow the PR### pattern (e.g., PR001, PR002).\n\nExample:\n  processes:\n    PR001:\n      name: "Order Fulfillment"\n      description: "End-to-end order processing"\n      steps:\n        ST001:\n          name: "Receive Order"\n          kind: event\n        ST002:\n          name: "Validate Order"\n          kind: task\n      links:\n        - from: ST001\n          to: ST002\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^PR\\d{3,}$": {
            "$ref": "../fragments/process.fragment.yaml#/$defs/Process"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "scenarios": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/scenarios.document.yaml",
    "title": "Scenarios",
    "description": 'Scenario documents define simulation scenarios for "what-if" analysis.\n\nWHAT IS A SCENARIO?\nA scenario captures the conditions and assumptions for simulating\nprocess execution:\n- Work arrivals (how work enters the system)\n- Work mix (distribution of case types)\n- Work attributes (characteristics affecting processing)\n- Evidence (historical data for validation)\n\nWHY DEFINE SCENARIOS?\nScenarios enable:\n- Capacity planning\n- Bottleneck identification\n- Process improvement validation\n- Resource optimization\n\nFILE NAMING: *.scenarios.ubml.yaml\nExamples:\n  - baseline-2024.scenarios.ubml.yaml\n  - growth-scenarios.scenarios.ubml.yaml\n  - peak-season.scenarios.ubml.yaml\n',
    "x-ubml-cli": {
      "category": "analysis",
      "categoryDisplayName": "Analysis & Planning",
      "workflowOrder": 7,
      "shortDescription": "Define simulation scenarios for what-if analysis.",
      "gettingStarted": [
        "Define a baseline scenario with current volumes",
        "Add work arrival patterns",
        "Define work mix distribution",
        "Create alternative scenarios for comparison"
      ],
      "exampleFilename": "baseline.scenarios.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what scenarios are defined in this file.\n",
        "type": "string"
      },
      "scenarios": {
        "description": 'Scenario definitions, keyed by scenario ID.\n\nScenario IDs follow the SC### pattern (e.g., SC001, SC002).\n\nExample:\n  scenarios:\n    SC001:\n      name: "Current State Baseline"\n      description: "2024 Q1 baseline scenario"\n      arrivals:\n        pattern: poisson\n        rate: 50\n        rateUnit: per-day\n      workMix:\n        - name: Standard\n          probability: 0.8\n        - name: Complex\n          probability: 0.2\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^SC\\d{3,}$": {
            "$ref": "../fragments/scenario.fragment.yaml#/$defs/Scenario"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "strategy": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/strategy.document.yaml",
    "title": "Strategy",
    "description": "Strategy documents define strategic elements that provide context\nfor process models.\n\nWHAT ARE STRATEGIC ELEMENTS?\nStrategic elements connect processes to business value:\n- Value Streams: End-to-end value delivery flows\n- Capabilities: What the organization can do\n- Products: Tangible offerings\n- Services: Intangible offerings\n- Portfolios: Groupings for management\n\nWHY DEFINE STRATEGY?\nStrategic elements enable:\n- Process prioritization\n- Capability gap analysis\n- Investment decisions\n- Strategic alignment\n\nFILE NAMING: *.strategy.ubml.yaml\nExamples:\n  - enterprise-capabilities.strategy.ubml.yaml\n  - product-portfolio.strategy.ubml.yaml\n  - value-streams.strategy.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "strategy",
      "categoryDisplayName": "Strategy",
      "workflowOrder": 8,
      "shortDescription": "Define value streams, capabilities, products, and services.",
      "gettingStarted": [
        "Define value streams for customer journeys",
        "Map capabilities required",
        "Connect to products and services",
        "Link processes to capabilities"
      ],
      "exampleFilename": "enterprise.strategy.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what strategic elements are defined in this file.\n",
        "type": "string"
      },
      "valueStreams": {
        "description": 'Value stream definitions, keyed by value stream ID.\n\nValue stream IDs follow the VS### pattern (e.g., VS001, VS002).\n\nExample:\n  valueStreams:\n    VS001:\n      name: "Order to Cash"\n      description: "From order to payment collection"\n      customer: AC001\n      triggeringEvent: "Customer places order"\n      endingEvent: "Payment received"\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^VS\\d{3,}$": {
            "$ref": "../fragments/strategy.fragment.yaml#/$defs/ValueStream"
          }
        }
      },
      "capabilities": {
        "description": 'Capability definitions, keyed by capability ID.\n\nCapability IDs follow the CP### pattern (e.g., CP001, CP002).\n\nExample:\n  capabilities:\n    CP001:\n      name: "Manage Customer Orders"\n      level: 2\n      maturity: 3\n      targetMaturity: 4\n      strategicImportance: essential\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^CP\\d{3,}$": {
            "$ref": "../fragments/strategy.fragment.yaml#/$defs/Capability"
          }
        }
      },
      "products": {
        "description": 'Product definitions, keyed by product ID.\n\nProduct IDs follow the PD### pattern (e.g., PD001, PD002).\n\nExample:\n  products:\n    PD001:\n      name: "Enterprise License"\n      category: software\n      lifecycle: maturity\n      price: 50000\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^PD\\d{3,}$": {
            "$ref": "../fragments/strategy.fragment.yaml#/$defs/Product"
          }
        }
      },
      "services": {
        "description": 'Service definitions, keyed by service ID.\n\nService IDs follow the SV### pattern (e.g., SV001, SV002).\n\nExample:\n  services:\n    SV001:\n      name: "Implementation Services"\n      type: professional\n      deliveryModel: hybrid\n      pricing: fixed\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^SV\\d{3,}$": {
            "$ref": "../fragments/strategy.fragment.yaml#/$defs/Service"
          }
        }
      },
      "portfolios": {
        "description": 'Portfolio definitions, keyed by portfolio ID.\n\nPortfolio IDs follow the PF### pattern (e.g., PF001, PF002).\n\nExample:\n  portfolios:\n    PF001:\n      name: "Enterprise Product Line"\n      type: product\n      products: [PD001, PD002, PD003]\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^PF\\d{3,}$": {
            "$ref": "../fragments/strategy.fragment.yaml#/$defs/Portfolio"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "views": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/views.document.yaml",
    "title": "Views",
    "description": "View documents define custom perspectives and diagram configurations.\n\nWHAT IS A VIEW?\nA view is a filtered, styled perspective on the process model:\n- Executive views (high-level, key metrics)\n- Operational views (detailed, full RACI)\n- System views (integrations, data flows)\n- Comparison views (as-is vs. to-be)\n\nWHY DEFINE VIEWS?\nViews enable:\n- Stakeholder-specific presentations\n- Focused documentation\n- Diagram customization\n- Comparison and analysis\n\nFILE NAMING: *.views.ubml.yaml\nExamples:\n  - executive-dashboard.views.ubml.yaml\n  - training-materials.views.ubml.yaml\n  - comparison-views.views.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "advanced",
      "categoryDisplayName": "Advanced",
      "workflowOrder": 10,
      "shortDescription": "Define custom perspectives and diagram configurations.",
      "gettingStarted": [
        "Identify your target audience",
        "Create a view with appropriate filters",
        "Configure what to show/hide",
        "Add custom styling if needed"
      ],
      "exampleFilename": "executive-dashboard.views.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": "Optional document name.\nIf not provided, the filename is used.\n",
        "type": "string"
      },
      "description": {
        "description": "Document description.\nExplain what views are defined in this file.\n",
        "type": "string"
      },
      "views": {
        "description": 'View definitions, keyed by view ID.\n\nView IDs follow the VW### pattern (e.g., VW001, VW002).\n\nExample:\n  views:\n    VW001:\n      name: "Executive Overview"\n      description: "High-level process view for leadership"\n      type: process\n      process: PR001\n      filters:\n        - type: kind\n          include: [milestone, subprocess, event]\n      show:\n        steps: true\n        links: true\n        actors: false\n        metrics: true\n',
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^VW\\d{3,}$": {
            "$ref": "../fragments/view.fragment.yaml#/$defs/View"
          }
        }
      },
      "metadata": {
        "description": "Document metadata.",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          }
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  },
  "workspace": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/documents/workspace.document.yaml",
    "title": "Workspace",
    "description": "The workspace document is the root configuration file for a UBML project.\n\nWHAT IS A WORKSPACE?\nA workspace is a collection of related process models, actors, entities,\nand other artifacts that together describe a business domain or initiative.\n\nWORKSPACE STRUCTURE:\nA typical UBML workspace contains:\n- One workspace.ubml.yaml (this file)\n- One or more process files (*.process.ubml.yaml)\n- Actor definitions (*.actors.ubml.yaml)\n- Information model (*.entities.ubml.yaml)\n- And other domain-specific files\n\nFILE NAMING: *.workspace.ubml.yaml\nExample: acme-order-management.workspace.ubml.yaml\n",
    "x-ubml-cli": {
      "category": "core",
      "categoryDisplayName": "Core Modeling",
      "workflowOrder": 1,
      "shortDescription": "Root configuration file for a UBML project.",
      "gettingStarted": [
        "Create a workspace file with name and description",
        "Add process files for your business processes",
        "Add actor files to define roles and teams",
        "Add entity files for your information model"
      ],
      "exampleFilename": "acme-project.workspace.ubml.yaml"
    },
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ubml",
      "name"
    ],
    "properties": {
      "ubml": {
        "description": 'UBML version identifier.\nMust be "1.0" for this schema version.\n',
        "type": "string",
        "const": "1.0"
      },
      "name": {
        "description": 'Workspace name.\nShould be descriptive and unique within your organization.\n\nExamples:\n  - "ACME Order Management"\n  - "Customer Onboarding Transformation"\n  - "Supply Chain Optimization"\n',
        "type": "string"
      },
      "description": {
        "description": "Detailed workspace description.\nExplain the scope, objectives, and context of this workspace.\n",
        "type": "string"
      },
      "version": {
        "description": 'Workspace version for change tracking.\nRecommend semantic versioning (e.g., "1.0.0").\n',
        "type": "string"
      },
      "status": {
        "description": "Workspace status:\n- draft: Work in progress\n- review: Under stakeholder review\n- approved: Formally approved\n- archived: No longer active\n",
        "type": "string",
        "enum": [
          "draft",
          "review",
          "approved",
          "archived"
        ],
        "default": "draft"
      },
      "organization": {
        "description": "Organization this workspace belongs to.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "description": "Organization name.",
            "type": "string"
          },
          "department": {
            "description": "Department or business unit.",
            "type": "string"
          },
          "contact": {
            "description": "Primary contact email.",
            "type": "string",
            "format": "email"
          }
        }
      },
      "scope": {
        "description": "Scope definition for the workspace.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "inScope": {
            "description": "What is included in this workspace.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "outOfScope": {
            "description": "What is explicitly excluded.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "assumptions": {
            "description": "Key assumptions.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "constraints": {
            "description": "Known constraints.",
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "files": {
        "description": "Explicit file references (optional).\nBy default, all .ubml.yaml files in the workspace directory are included.\nUse this to specify explicit includes/excludes or order.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "include": {
            "description": "Glob patterns for files to include.",
            "type": "array",
            "items": {
              "type": "string"
            },
            "default": [
              "**/*.ubml.yaml"
            ]
          },
          "exclude": {
            "description": "Glob patterns for files to exclude.",
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "defaults": {
        "description": "Default values applied to all elements in the workspace.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "processLevel": {
            "description": "Default process level.",
            "type": "integer",
            "minimum": 1,
            "maximum": 6
          },
          "currency": {
            "description": "Default currency code (ISO 4217).",
            "type": "string",
            "pattern": "^[A-Z]{3}$"
          },
          "timezone": {
            "description": "Default timezone (IANA name).",
            "type": "string"
          },
          "workingHours": {
            "description": "Default working hours.",
            "type": "string"
          }
        }
      },
      "terminology": {
        "description": 'Custom terminology mappings.\nAllows organizations to use their own terms while maintaining\nUBML compatibility.\n\nExample:\n  terminology:\n    step: "Activity"\n    actor: "Role"\n    process: "Workflow"\n',
        "type": "object",
        "additionalProperties": {
          "type": "string"
        }
      },
      "metadata": {
        "description": "Workspace metadata for tracking and governance.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedBy": {
            "type": "string"
          },
          "approvedAt": {
            "type": "string",
            "format": "date-time"
          },
          "approvedBy": {
            "type": "string"
          }
        }
      },
      "owner": {
        "description": "Workspace owner.",
        "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
      },
      "stakeholders": {
        "description": "Key stakeholders.",
        "type": "array",
        "items": {
          "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
        }
      },
      "tags": {
        "description": "Tags for filtering and organization.",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "custom": {
        "description": "User-defined custom fields.",
        "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
      }
    }
  }
};
var fragmentSchemas = {
  "actor": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/actor.fragment.yaml",
    "title": "UBML Actor Fragment",
    "description": "Actors represent WHO does work in your business processes.\nThis fragment defines Actor and Persona types.\n",
    "$defs": {
      "Actor": {
        "description": "Unified participant: people, roles, systems, external parties.\n\nOne registry with subtypes for projection mapping:\n- BPMN: organizations/systems \u2192 pools, roles/teams \u2192 lanes\n- UML use case: roles/external systems \u2192 actors\n- RACI: prefer roles, allow teams, people optional\n- ArchiMate: organization/team/person/system \u2192 Actor, role \u2192 Role\n\nACTOR TYPES:\n- person: Named individual (for staffing, optional)\n- role: Business role, job function (preferred for RACI)\n- team: Organizational unit, group\n- organization: Legal entity, department\n- system: Application, platform, external API\n- external: Regulator, outsourced provider\n- customer: Customer as a participant\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "type",
          "kind"
        ],
        "properties": {
          "name": {
            "description": 'Human-readable name displayed in diagrams and reports.\n\nExamples:\n  - "Sales Manager"\n  - "Customer Service Team"\n  - "SAP ERP"\n  - "Building Authority"\n',
            "type": "string"
          },
          "type": {
            "description": "Classification for views and RACI targeting.\n\n- person: named individual (optional, for staffing)\n- role: business role, job function (preferred for RACI)\n- team: org unit, group\n- organization: legal entity, customer org, supplier\n- system: application/platform/external API\n- external: regulator, outsourced provider\n- customer: customer as a party\n",
            "type": "string",
            "enum": [
              "person",
              "role",
              "team",
              "system",
              "organization",
              "external",
              "customer"
            ]
          },
          "kind": {
            "description": "Behavioral category for simulation and views.\n\n- human: people who perform work\n- org: organizational entities\n- system: automated systems\n\nDefault derivation if omitted:\n- system \u2192 system\n- person/role/team \u2192 human\n- organization/external/customer \u2192 org\n",
            "type": "string",
            "enum": [
              "human",
              "org",
              "system"
            ]
          },
          "isExternal": {
            "description": "Whether this actor is external to the organization.\n\nExternal actors are outside your organization's direct control:\n- Government agencies, regulators\n- Customers, suppliers, partners\n- Outsourced service providers\n- Third-party systems\n\nUsed for:\n- Deadline tracking (external parties may have SLA obligations)\n- Simulation (external steps may have different duration distributions)\n- Views (swimlane separation of internal vs external)\n\nDefault derivation if omitted:\n- true for type: external, customer\n- false for type: person, role, team, organization\n- true for type: system when party is external org\n",
            "type": "boolean"
          },
          "rate": {
            "description": 'Cost rate per time unit for simulation costing.\n\nExample:\n  rate:\n    amount: 75\n    currency: "EUR"\n    per: h\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Rate"
          },
          "party": {
            "description": "Parent organization (actor ID).\nUsed for containment/ownership hierarchy.\n\nExample: A role belongs to a team, which belongs to an organization.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "reportsTo": {
            "description": "Reporting line (actor ID).\nUsed for management hierarchy, separate from containment.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "skills": {
            "description": 'Skills this actor has, optionally with proficiency levels.\n\nTwo forms supported:\n1. Simple reference: "SK001"\n2. With proficiency: { skill: "SK001", level: 3 }\n\nProficiency levels (1-5) match step.requiresSkills.level:\n1 = Novice, 2 = Basic, 3 = Intermediate, 4 = Advanced, 5 = Expert\n',
            "type": "array",
            "items": {
              "oneOf": [
                {
                  "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
                },
                {
                  "$ref": "#/$defs/ActorSkill"
                }
              ]
            }
          },
          "description": {
            "description": "Detailed description of this actor's role and responsibilities.",
            "type": "string"
          },
          "tags": {
            "description": 'Tags for filtering and stakeholder-specific views.\n\nExamples: ["customer-facing", "management", "technical"]\n',
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "ActorSkill": {
        "description": "Skill reference with proficiency level for an actor.\n\nProficiency levels enable matching against step requirements:\nActor can perform step if actor.skill.level >= step.requiresSkills.level\n\nExample:\n  skill: SK001\n  level: 3\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "skill"
        ],
        "properties": {
          "skill": {
            "description": "Skill ID reference.",
            "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
          },
          "level": {
            "description": "Proficiency level (1-5).\n\n1 = Novice: Learning, needs supervision\n2 = Basic: Can perform with guidance\n3 = Intermediate: Independent performer\n4 = Advanced: Can handle complex cases\n5 = Expert: Can teach and innovate\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          }
        }
      },
      "PainPoint": {
        "description": 'Structured pain point with severity.\n\nCapture specific issues stakeholders experience.\nSeverity scale matches Evidence.severity for consistency.\n\nExample:\n  text: "Long approval wait times causing project delays"\n  severity: 4\n  frequency: frequent\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "text"
        ],
        "properties": {
          "text": {
            "description": "Description of the pain point.",
            "type": "string"
          },
          "severity": {
            "description": "Severity level (1-5, 5 being most severe).\n\n1 = Minor inconvenience\n2 = Noticeable issue\n3 = Significant problem\n4 = Major blocker\n5 = Critical showstopper\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          },
          "frequency": {
            "description": "How often this pain point occurs.",
            "type": "string",
            "enum": [
              "rare",
              "occasional",
              "frequent",
              "constant"
            ]
          }
        }
      },
      "Persona": {
        "description": 'Stakeholder archetype with goals and pain points.\n\nPersonas represent user segments for workshop capture and design thinking.\nThey help consultants understand different stakeholder perspectives.\n\nExample:\n  id: PS001\n  name: "Field Service Manager"\n  represents: [AC005, AC006]\n  goals:\n    - "Optimize technician routes"\n    - "Reduce response times"\n  painPoints:\n    - text: "No visibility into technician location"\n      severity: 4\n    - "Manual scheduling is time-consuming"\n  motivations:\n    - "Career advancement"\n    - "Team efficiency"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "description": "Unique persona ID (PS### pattern).",
            "type": "string",
            "pattern": "^PS\\d{3,}$"
          },
          "name": {
            "description": 'Persona name - a memorable label for this archetype.\n\nExamples:\n  - "Busy Executive"\n  - "Field Service Manager"\n  - "Compliance Officer"\n',
            "type": "string"
          },
          "represents": {
            "description": "Actor IDs this persona represents.\nLinks the archetype to actual organizational roles.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "goals": {
            "description": "What this persona wants to achieve.\nCapture objectives and desired outcomes.\n",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "painPoints": {
            "description": 'Pain points experienced by this persona.\n\nTwo forms supported:\n1. Simple text: "Long approval wait times"\n2. Structured: { text: "Long approval wait times", severity: 4 }\n',
            "type": "array",
            "items": {
              "oneOf": [
                {
                  "type": "string"
                },
                {
                  "$ref": "#/$defs/PainPoint"
                }
              ]
            }
          },
          "motivations": {
            "description": "What drives this persona's behavior.\nUnderstand underlying motivations for better solutions.\n",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "tags": {
            "description": "Tags for filtering and grouping personas.",
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "entity": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/entity.fragment.yaml",
    "title": "UBML Entity Fragment",
    "description": "Information model entities representing the data landscape of a process.\n\nEntities fall into three categories:\n- Data Entities: Business objects that hold structured data\n- Documents: Physical or digital documents that carry information\n- Locations: Physical or logical places where work happens\n",
    "$defs": {
      "Relationship": {
        "description": 'Defines a relationship between entities in the information model.\n\nRELATIONSHIP TYPES:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 Type           \u2502 Description                                   \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 one-to-one     \u2502 Each A has exactly one B                      \u2502\n\u2502 one-to-many    \u2502 Each A has zero or more Bs                    \u2502\n\u2502 many-to-one    \u2502 Many As belong to one B                       \u2502\n\u2502 many-to-many   \u2502 Many As relate to many Bs                     \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nExample:\n  relationships:\n    lines:\n      target: EN002\n      type: one-to-many\n      description: "Order contains multiple line items"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "target",
          "type"
        ],
        "properties": {
          "target": {
            "description": "Target entity ID.",
            "$ref": "../common/defs.schema.yaml#/$defs/EntityRef"
          },
          "type": {
            "description": "Cardinality of the relationship.",
            "type": "string",
            "enum": [
              "one-to-one",
              "one-to-many",
              "many-to-one",
              "many-to-many"
            ]
          },
          "description": {
            "description": "Description of the relationship semantics.",
            "type": "string"
          },
          "required": {
            "description": "Whether this relationship is required.",
            "type": "boolean",
            "default": false
          }
        }
      },
      "Attribute": {
        "description": 'A single attribute/field of an entity or document.\n\nData types follow common industry standards:\n- string: Text values\n- number: Numeric values (integer or decimal)\n- boolean: True/false values\n- date: Date only (YYYY-MM-DD)\n- datetime: Date and time (ISO 8601)\n- duration: Time duration (e.g., "1d", "2h30m")\n- money: Currency amount with optional currency code\n- reference: Reference to another entity\n\nExample:\n  attributes:\n    orderValue:\n      type: money\n      required: true\n      description: "Total value of the order"\n    customerId:\n      type: reference\n      ref: EN003\n      required: true\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "type"
        ],
        "properties": {
          "type": {
            "description": "Data type of the attribute.",
            "type": "string",
            "enum": [
              "string",
              "number",
              "boolean",
              "date",
              "datetime",
              "duration",
              "money",
              "reference"
            ]
          },
          "description": {
            "description": "Description of the attribute.",
            "type": "string"
          },
          "required": {
            "description": "Whether this attribute is required.",
            "type": "boolean",
            "default": false
          },
          "ref": {
            "description": "For type=reference, the target entity ID.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/EntityRef"
          },
          "default": {
            "description": "Default value for the attribute.",
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "number"
              },
              {
                "type": "boolean"
              }
            ]
          },
          "enum": {
            "description": "Allowed values for this attribute.",
            "type": "array",
            "items": {
              "oneOf": [
                {
                  "type": "string"
                },
                {
                  "type": "number"
                }
              ]
            }
          }
        }
      },
      "Entity": {
        "description": 'A data entity in the information model.\n\nEntities represent business objects that:\n- Are created, read, updated, or deleted by process steps\n- Have structured attributes with defined types\n- Have relationships to other entities\n\nENTITY EXAMPLES:\n- Order, Customer, Product, Invoice\n- Contract, Case, Request, Incident\n- Employee, Department, Project, Task\n\nENTITY vs DOCUMENT:\nEntities are structured data objects in systems.\nDocuments are physical or digital files with content.\n\nExample:\n  EN001:\n    name: Sales Order\n    description: "Customer order with line items"\n    attributes:\n      orderId:\n        type: string\n        required: true\n      orderDate:\n        type: date\n        required: true\n      totalValue:\n        type: money\n    relationships:\n      customer:\n        target: EN002\n        type: many-to-one\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Human-readable entity name.",
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the entity.",
            "type": "string"
          },
          "attributes": {
            "description": "Entity attributes, keyed by attribute name.\n",
            "type": "object",
            "additionalProperties": {
              "$ref": "#/$defs/Attribute"
            }
          },
          "relationships": {
            "description": "Relationships to other entities, keyed by relationship name.\n",
            "type": "object",
            "additionalProperties": {
              "$ref": "#/$defs/Relationship"
            }
          },
          "system": {
            "description": 'System or application where this entity is mastered.\nUsed for data lineage and integration planning.\n\nExample: "SAP ERP", "Salesforce CRM"\n',
            "type": "string"
          },
          "lifecycle": {
            "description": 'Entity lifecycle states, if applicable.\n\nExample: ["Draft", "Submitted", "Approved", "Closed"]\n',
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Document": {
        "description": 'A document in the information model.\n\nDocuments represent physical or digital files that:\n- Are inputs to or outputs from process steps\n- Have a format (PDF, Word, Excel, etc.)\n- May require signatures or approvals\n- May be templates or generated documents\n\nDOCUMENT EXAMPLES:\n- Contract, Invoice, Purchase Order, Report\n- Application Form, Approval Form, Checklist\n- Technical Drawing, Specification, Manual\n\nDOCUMENT vs ENTITY:\nDocuments have file content and format.\nEntities are structured data in systems.\n\nExample:\n  DC001:\n    name: Contract Agreement\n    format: pdf\n    description: "Signed contract between parties"\n    isTemplate: false\n    requiresSignature: true\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Human-readable document name.",
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the document.",
            "type": "string"
          },
          "format": {
            "description": 'Document format or file type.\n\nExamples: "pdf", "docx", "xlsx", "jpg", "dwg"\n',
            "type": "string"
          },
          "isTemplate": {
            "description": "Whether this is a template document.\nTemplates are used to generate actual documents.\n",
            "type": "boolean",
            "default": false
          },
          "templateSource": {
            "description": "For generated documents, the template document ID.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/DocumentRef"
          },
          "requiresSignature": {
            "description": "Whether the document requires signature(s).",
            "type": "boolean",
            "default": false
          },
          "signatureCount": {
            "description": "Number of signatures required.",
            "type": "integer",
            "minimum": 0
          },
          "retentionPeriod": {
            "description": 'How long the document must be retained.\n\nExample: "7y" (7 years)\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "confidentiality": {
            "description": "Confidentiality classification.\n\nCommon values:\n- public: No restrictions\n- internal: Internal use only\n- confidential: Restricted access\n- secret: Highly restricted\n",
            "type": "string",
            "enum": [
              "public",
              "internal",
              "confidential",
              "secret"
            ]
          },
          "system": {
            "description": 'System or repository where this document is stored.\n\nExample: "SharePoint", "DMS", "Archive System"\n',
            "type": "string"
          },
          "relatedEntity": {
            "description": "Entity this document relates to or is attached to.\n\nExample: A contract document relates to a Contract entity.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/EntityRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Location": {
        "description": 'A physical or logical location where work happens.\n\nLocations are important for:\n- Understanding where work is performed\n- Modeling travel time between locations\n- Capacity planning for physical spaces\n- Compliance with location-specific regulations\n\nLOCATION EXAMPLES:\n- Office, Warehouse, Factory, Store\n- Field Site, Customer Premises\n- Data Center, Cloud Region\n\nExample:\n  LO001:\n    name: Main Warehouse\n    type: warehouse\n    address: "123 Industrial Blvd, City"\n    capacity: 1000\n    capacityUnit: "pallets"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Human-readable location name.",
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the location.",
            "type": "string"
          },
          "type": {
            "description": "Location type classification.\n",
            "type": "string",
            "examples": [
              "office",
              "warehouse",
              "factory",
              "store",
              "field",
              "customer-site",
              "data-center",
              "remote"
            ]
          },
          "address": {
            "description": "Physical address, if applicable.",
            "type": "string"
          },
          "coordinates": {
            "description": "Geographic coordinates (latitude, longitude).\nUsed for travel time calculations and mapping.\n",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "latitude": {
                "type": "number",
                "minimum": -90,
                "maximum": 90
              },
              "longitude": {
                "type": "number",
                "minimum": -180,
                "maximum": 180
              }
            }
          },
          "timezone": {
            "description": 'Timezone for the location (IANA timezone name).\n\nExample: "Europe/Prague", "America/New_York"\n',
            "type": "string"
          },
          "capacity": {
            "description": "Location capacity (numeric value).",
            "type": "number",
            "minimum": 0
          },
          "capacityUnit": {
            "description": 'Unit of capacity measurement.\n\nExamples: "people", "pallets", "vehicles", "desks"\n',
            "type": "string"
          },
          "workingHours": {
            "description": 'Working hours for this location.\n\nExample: "Mon-Fri 08:00-17:00"\n',
            "type": "string"
          },
          "parent": {
            "description": "Parent location for hierarchical structure.\n\nExample: A warehouse inside a larger logistics hub.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/LocationRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "hypothesis": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/hypothesis.fragment.yaml",
    "title": "UBML Hypothesis Fragment",
    "description": "Hypothesis trees provide structured problem framing using the SCQH \n(Situation-Complication-Question-Hypothesis) framework from the \nMinto Pyramid Principle.\n\nWHAT IS SCQH?\nThe SCQH framework structures problem-solving communication:\n- Situation: The current state or context\n- Complication: What changed or what's the problem\n- Question: The key question that arises\n- Hypothesis: The proposed answer to validate/invalidate\n\nWHY HYPOTHESIS TREES?\nHypothesis trees decompose complex questions into testable sub-hypotheses.\nThis enables:\n- Structured analysis and prioritization\n- Evidence-based decision making\n- Clear communication of reasoning\n- Tracking validation progress\n",
    "$defs": {
      "SCQHContext": {
        "description": "Situation-Complication-Question-Hypothesis framing context.\n\nThe SCQH framework (from Barbara Minto's Pyramid Principle)\nstructures problem framing for clear communication.\n\nEXAMPLE - Process Improvement Project:\n\n  scqh:\n    situation: |\n      Order processing currently takes 5 days on average,\n      involving 3 departments and 12 handoffs.\n    \n    complication: |\n      Customer expectations have shifted to 2-day delivery,\n      and competitors are achieving this target.\n    \n    question: |\n      How can we reduce order processing time to 2 days\n      while maintaining quality and without major investment?\n    \n    hypothesis: |\n      By eliminating redundant approvals and automating\n      data entry, we can achieve 2-day processing.\n\nEXAMPLE - Strategic Analysis:\n\n  scqh:\n    situation: |\n      We are a mid-sized logistics company with 15% market share\n      in the regional B2B delivery market.\n    \n    complication: |\n      A major e-commerce player is entering our market\n      with aggressive pricing and same-day delivery.\n    \n    question: |\n      Should we compete on speed, differentiate on service,\n      or focus on a defensible niche?\n    \n    hypothesis: |\n      We should focus on high-value B2B logistics where\n      reliability matters more than speed.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "situation": {
            "description": 'The current state, background, or context.\n\nThis is the "stable state" that existed before the complication.\nIt should be factual and uncontroversial.\n\nGood situation statements:\n- Describe the relevant context concisely\n- Are accepted as true by all stakeholders\n- Set the stage for the complication\n',
            "type": "string"
          },
          "complication": {
            "description": "What changed or what's the problem.\n\nThe complication creates tension that demands a response.\nIt's what makes the situation unstable or unsatisfactory.\n\nCommon complication patterns:\n- Something changed (new competitor, regulation, technology)\n- Something went wrong (quality issue, cost overrun)\n- An opportunity emerged (new market, acquisition target)\n- Current approach is inadequate (capacity, capability gap)\n",
            "type": "string"
          },
          "question": {
            "description": "The key question that arises from the situation and complication.\n\nThe question should be:\n- Specific and answerable\n- Directly relevant to the audience\n- Framed to lead to actionable insights\n\nQuestion types:\n- What should we do?\n- How should we do it?\n- Why is this happening?\n- Which option should we choose?\n",
            "type": "string"
          },
          "hypothesis": {
            "description": "The proposed answer or thesis statement.\n\nThe hypothesis is your best current answer to the question.\nIt should be:\n- Specific and testable\n- Falsifiable (can be proven wrong)\n- Actionable if validated\n\nThe hypothesis tree below this context decomposes the\nmain hypothesis into sub-hypotheses that can be validated\nindependently.\n",
            "type": "string"
          }
        }
      },
      "HypothesisNode": {
        "description": 'A node in the hypothesis tree structure.\n\nHypothesis trees decompose a main hypothesis into supporting\nsub-hypotheses that can be independently validated.\n\nNODE TYPES:\n- hypothesis: A testable claim (can be true or false)\n- question: A question that needs answering\n- evidence: Supporting evidence or data point\n- insight: Derived insight or conclusion\n- recommendation: Actionable recommendation\n\nVALIDATION STATUS:\n- untested: Not yet validated\n- validated: Confirmed as true\n- invalidated: Confirmed as false\n- partial: Partially validated (some aspects true)\n\nOPERATORS (for grouping children):\n- and: All children must be true for parent to be true\n- or: Any child being true makes parent true\n- mece: Mutually Exclusive, Collectively Exhaustive grouping\n\nEXAMPLE - Sub-hypothesis breakdown:\n\n  Main: "We can reduce processing time to 2 days"\n  \u251C\u2500\u2500 "Approval delays account for 60% of time" (evidence)\n  \u2502   \u251C\u2500\u2500 "Manager approval takes 1.5 days average"\n  \u2502   \u2514\u2500\u2500 "Finance approval takes 1 day average"\n  \u2514\u2500\u2500 "Approvals can be streamlined" (hypothesis)\n      \u251C\u2500\u2500 "Auto-approve orders under $10K" (recommendation)\n      \u2514\u2500\u2500 "Parallel instead of sequential approvals" (recommendation)\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "text"
        ],
        "properties": {
          "id": {
            "description": "Unique node identifier.\nTypically follows HY### pattern.\n",
            "type": "string"
          },
          "text": {
            "description": "The hypothesis, question, or insight text.\nShould be a complete, clear statement.\n",
            "type": "string"
          },
          "type": {
            "description": "Node type classification.",
            "type": "string",
            "enum": [
              "hypothesis",
              "question",
              "evidence",
              "insight",
              "recommendation"
            ],
            "default": "hypothesis"
          },
          "status": {
            "description": "Validation status of this node.\nOnly applicable for hypothesis and evidence types.\n",
            "type": "string",
            "enum": [
              "untested",
              "validated",
              "invalidated",
              "partial"
            ],
            "default": "untested"
          },
          "confidence": {
            "description": "Confidence level in the validation (0-1).\n1.0 = high confidence, 0.5 = uncertain\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "operator": {
            "description": "Logical operator for child nodes:\n- and: All children must be true\n- or: Any child can be true\n- mece: MECE grouping (consulting standard)\n",
            "type": "string",
            "enum": [
              "and",
              "or",
              "mece"
            ],
            "default": "and"
          },
          "priority": {
            "description": "Priority for investigation/validation.\nHelps prioritize analysis efforts.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Priority"
          },
          "owner": {
            "description": "Person responsible for validating this node.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "dueDate": {
            "description": "Target date for validation.",
            "type": "string",
            "format": "date"
          },
          "evidence": {
            "description": "Evidence supporting or refuting this node.\nFree-form text describing the evidence.\n",
            "type": "string"
          },
          "source": {
            "description": "Source of the evidence or claim.\nCitation, document reference, or interview.\n",
            "type": "string"
          },
          "notes": {
            "description": "Additional notes or context.",
            "type": "string"
          },
          "children": {
            "description": "Child nodes (sub-hypotheses, supporting evidence, etc.).\n",
            "type": "array",
            "items": {
              "$ref": "#/$defs/HypothesisNode"
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "HypothesisTree": {
        "description": 'A complete hypothesis tree with SCQH context.\n\nThe hypothesis tree is a key artifact in consulting and\nstrategic analysis, enabling structured problem decomposition.\n\nTREE STRUCTURE:\n- Root node contains the main hypothesis (from SCQH)\n- Children decompose into sub-hypotheses\n- Leaves are typically evidence or recommendations\n\nBEST PRACTICES:\n- Use MECE (Mutually Exclusive, Collectively Exhaustive) groupings\n- Keep trees focused (max 3-4 levels deep)\n- Validate bottom-up (evidence \u2192 sub-hypotheses \u2192 main)\n- Update status as validation progresses\n\nEXAMPLE - Complete Tree:\n\n  hypothesisTrees:\n    HT001:\n      name: "Process Optimization Analysis"\n      scqh:\n        situation: "Current order processing takes 5 days"\n        complication: "Customers expect 2-day delivery"\n        question: "How to reduce to 2 days?"\n        hypothesis: "Streamline approvals and automate data entry"\n      root:\n        id: H001\n        text: "We can achieve 2-day processing"\n        operator: and\n        children:\n          - id: H002\n            text: "Approval delays can be reduced by 2 days"\n            children: [...]\n          - id: H003\n            text: "Automation can save 0.5 days"\n            children: [...]\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "root"
        ],
        "properties": {
          "name": {
            "description": "Human-readable name for the hypothesis tree.",
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the analysis.",
            "type": "string"
          },
          "scqh": {
            "description": "SCQH problem framing context.",
            "$ref": "#/$defs/SCQHContext"
          },
          "root": {
            "description": "Root node of the hypothesis tree.",
            "$ref": "#/$defs/HypothesisNode"
          },
          "status": {
            "description": "Overall status of the hypothesis tree analysis.\n",
            "type": "string",
            "enum": [
              "draft",
              "in-progress",
              "validated",
              "invalidated",
              "closed"
            ],
            "default": "draft"
          },
          "owner": {
            "description": "Person responsible for this analysis.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "stakeholders": {
            "description": "Key stakeholders for the analysis.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "createdAt": {
            "description": "When the analysis was created.",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "description": "When the analysis was last updated.",
            "type": "string",
            "format": "date-time"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "link": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/link.fragment.yaml",
    "title": "UBML Link Fragment",
    "description": "Links represent relationships between steps. In UBML, links unify three \nconcerns that are often separated in other process modeling notations:\n\n1. ROUTING - Control flow (sequence, conditions, probability)\n2. SCHEDULING - Timing relationships (before, after, start-to-start)\n3. DATA FLOW - Information passing between steps\n\nWHY UNIFIED LINKS:\nMost notations force separate edge types for sequence flows, data flows,\nand dependencies. UBML unifies these because in practice, most edges\ncarry multiple semantic layers simultaneously.\n",
    "$defs": {
      "SchedulingProperties": {
        "description": "Timing relationship properties for scheduling constraints.\n\nDEPENDENCY TYPES (MSProject-compatible):\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 Type                   \u2502 Meaning                               \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 finish-to-start (FS)   \u2502 B starts after A finishes (default)   \u2502\n\u2502 start-to-start (SS)    \u2502 B starts when A starts                \u2502\n\u2502 finish-to-finish (FF)  \u2502 B finishes when A finishes            \u2502\n\u2502 start-to-finish (SF)   \u2502 B finishes when A starts              \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nLAG - adds delay between linked steps\nPRIORITY - affects scheduling order when resources are constrained\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "description": "Scheduling dependency type.\nDefault is finish-to-start (FS) if not specified.\n",
            "type": "string",
            "enum": [
              "finish-to-start",
              "start-to-start",
              "finish-to-finish",
              "start-to-finish"
            ],
            "default": "finish-to-start"
          },
          "lag": {
            "description": 'Time delay between linked steps.\nPositive = delay, Negative = overlap.\n\nExamples:\n  "1d" - 1 day delay\n  "-2h" - 2 hour overlap\n  "30m" - 30 minute delay\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "priority": {
            "description": "Scheduling priority for resource-constrained scenarios.\nHigher priority links are scheduled first.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Priority"
          }
        }
      },
      "Link": {
        "description": 'Unified edge carrying routing, scheduling, and data flow.\n\nROUTING PROPERTIES:\n- condition: Guard expression (only follow if true)\n- probability: Branch probability for simulation\n- isDefault: Fallback route when no conditions match\n\nSCHEDULING PROPERTIES:\n- schedule.type: Dependency type (FS, SS, FF, SF)\n- schedule.lag: Time delay/overlap\n- schedule.priority: Scheduling priority\n\nDATA FLOW:\n- dataBindings: Map of data passed between steps\n\nEXAMPLES:\n\nSimple sequence (A \u2192 B):\n  - from: ST001\n    to: ST002\n\nConditional branch:\n  - from: ST001\n    to: ST002\n    condition: "amount > 10000"\n  - from: ST001\n    to: ST003\n    isDefault: true\n\nProbabilistic branch (for simulation):\n  - from: ST001\n    to: ST002\n    probability: 0.7\n  - from: ST001\n    to: ST003\n    probability: 0.3\n\nScheduling dependency with lag:\n  - from: ST001\n    to: ST002\n    schedule:\n      type: finish-to-start\n      lag: "2d"\n\nStart-to-start with data binding:\n  - from: ST001\n    to: ST002\n    schedule:\n      type: start-to-start\n    dataBindings:\n      targetField: sourceField\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "from",
          "to"
        ],
        "properties": {
          "from": {
            "description": "Source step ID.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "to": {
            "description": "Target step ID.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "condition": {
            "description": `Guard expression. If present, link is only followed when true.

Examples:
  condition: "amount > 10000"
  condition: "status == 'approved'"
  condition: requiresManagerApproval
`,
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          },
          "probability": {
            "description": "Branch probability for simulation.\nAll outgoing probabilities from a step should sum to 1.0.\n\nNote: Probabilities are for SIMULATION ONLY and do not affect\nactual process execution, which uses conditions.\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "isDefault": {
            "description": "Marks this as the default/fallback route.\nFollowed when no other conditional links from the same step match.\n\nOnly ONE link from a step should have isDefault: true.\n",
            "type": "boolean"
          },
          "schedule": {
            "description": "Scheduling properties for project planning.",
            "$ref": "#/$defs/SchedulingProperties"
          },
          "dataBindings": {
            "description": "Data passed from source to target step.\nKeys are target step fields, values are source step fields.\n\nExample:\n  dataBindings:\n    customerName: approvedName\n    orderId: generatedOrderId\n",
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "label": {
            "description": "Optional label for the link, displayed in diagrams.\nUsed when condition text is too verbose for edge labels.\n",
            "type": "string"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "metrics": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/metrics.fragment.yaml",
    "title": "UBML Metrics Fragment",
    "description": "Metrics and measurement structures for process performance,\nbusiness outcomes, and ROI analysis.\n\nThis fragment defines:\n- KPI: Key Performance Indicators with targets and thresholds\n- ROI: Return on Investment analysis structure\n",
    "$defs": {
      "KPIThreshold": {
        "description": "A threshold level for KPI performance evaluation.\n\nThresholds define the boundaries between performance levels.\nTypically used for traffic-light indicators (red/amber/green).\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "level",
          "value"
        ],
        "properties": {
          "level": {
            "description": 'Threshold level name.\nCommon values: "red", "amber", "green" or "critical", "warning", "good"\n',
            "type": "string"
          },
          "value": {
            "description": "Threshold boundary value.",
            "type": "number"
          },
          "operator": {
            "description": "Comparison operator:\n- gte: Greater than or equal (green if >= value)\n- lte: Less than or equal (green if <= value)\n- eq: Equal to\n",
            "type": "string",
            "enum": [
              "gte",
              "lte",
              "eq"
            ],
            "default": "gte"
          },
          "color": {
            "description": 'Display color for this threshold level.\n\nExample: "#FF0000" for red, "#00FF00" for green\n',
            "type": "string"
          }
        }
      },
      "KPI": {
        "description": 'Key Performance Indicator definition.\n\nKPIs are quantifiable measures used to evaluate success\nagainst objectives. They can be attached to:\n- Processes (process performance)\n- Steps (step performance)\n- Value streams (end-to-end performance)\n- Capabilities (capability performance)\n\nKPI TYPES:\n- outcome: Measures end results (revenue, customer satisfaction)\n- process: Measures process performance (cycle time, error rate)\n- leading: Predicts future outcomes (pipeline value, order backlog)\n- lagging: Measures past results (completed orders, revenue)\n\nEXAMPLES:\n\nCycle time KPI:\n  KP001:\n    name: "Order Processing Cycle Time"\n    description: "End-to-end time from order to shipment"\n    type: process\n    unit: hours\n    target: 24\n    thresholds:\n      - level: red\n        value: 48\n        operator: gte\n      - level: amber\n        value: 24\n        operator: gte\n      - level: green\n        value: 24\n        operator: lte\n\nQuality KPI:\n  KP002:\n    name: "First Pass Yield"\n    description: "Percentage of orders completed without errors"\n    type: process\n    unit: percent\n    target: 98\n    baseline: 92\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "KPI name.",
            "type": "string"
          },
          "description": {
            "description": "Detailed KPI description.",
            "type": "string"
          },
          "type": {
            "description": "KPI type classification.\n",
            "type": "string",
            "enum": [
              "outcome",
              "process",
              "leading",
              "lagging"
            ]
          },
          "category": {
            "description": 'Category for grouping KPIs.\n\nExamples: "quality", "speed", "cost", "satisfaction", "compliance"\n',
            "type": "string"
          },
          "unit": {
            "description": 'Unit of measurement.\n\nExamples: "hours", "days", "percent", "count", "currency"\n',
            "type": "string"
          },
          "formula": {
            "description": 'Calculation formula for derived KPIs.\n\nExample: "(completed_orders / total_orders) * 100"\n',
            "type": "string"
          },
          "baseline": {
            "description": 'Baseline/current value for comparison.\nUsed as the "as-is" reference point.\n',
            "type": "number"
          },
          "target": {
            "description": 'Target value to achieve.\nUsed as the "to-be" goal.\n',
            "type": "number"
          },
          "stretch": {
            "description": "Stretch/aspirational target.\nRepresents excellent performance.\n",
            "type": "number"
          },
          "thresholds": {
            "description": "Performance thresholds for evaluation.\n",
            "type": "array",
            "items": {
              "$ref": "#/$defs/KPIThreshold"
            }
          },
          "frequency": {
            "description": 'Measurement frequency.\n\nExamples: "real-time", "daily", "weekly", "monthly", "quarterly"\n',
            "type": "string"
          },
          "source": {
            "description": 'Data source for this KPI.\n\nExample: "ERP system", "CRM reports", "Manual tracking"\n',
            "type": "string"
          },
          "process": {
            "description": "Process this KPI measures.",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "step": {
            "description": "Step this KPI measures.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "owner": {
            "description": "KPI owner responsible for tracking.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "ROIComponent": {
        "description": "A component of ROI analysis (cost or benefit).\n\nEach component represents either:\n- A cost item (investment required)\n- A benefit item (value delivered)\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "amount"
        ],
        "properties": {
          "name": {
            "description": "Component name.",
            "type": "string"
          },
          "description": {
            "description": "Component description.",
            "type": "string"
          },
          "amount": {
            "description": "Monetary value of this component.",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "timing": {
            "description": "When this cost/benefit occurs.\n\nValues:\n- one-time: Single occurrence\n- recurring: Repeats at specified frequency\n",
            "type": "string",
            "enum": [
              "one-time",
              "recurring"
            ]
          },
          "frequency": {
            "description": 'For recurring items: how often.\n\nExamples: "monthly", "quarterly", "annually"\n',
            "type": "string"
          },
          "startPeriod": {
            "description": "When this component starts (period number).\nPeriod 0 = project start, 1 = first period after go-live.\n",
            "type": "integer",
            "minimum": 0
          },
          "endPeriod": {
            "description": "When this component ends (for recurring items).\n",
            "type": "integer",
            "minimum": 0
          },
          "confidence": {
            "description": "Confidence in this estimate (0-1).\n1.0 = highly certain, 0.5 = rough estimate\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "category": {
            "description": 'Category for grouping.\n\nCost categories: "labor", "technology", "consulting", "training"\nBenefit categories: "cost-savings", "revenue", "productivity", "risk-reduction"\n',
            "type": "string"
          },
          "assumptions": {
            "description": "Key assumptions underlying this estimate.\n",
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "ROI": {
        "description": 'Return on Investment analysis structure.\n\nROI analysis quantifies the business case for process improvements\nor initiatives by comparing costs against benefits.\n\nKEY METRICS:\n- ROI %: (Total Benefits - Total Costs) / Total Costs \xD7 100\n- NPV: Net Present Value of benefits minus costs\n- Payback Period: Time to recover initial investment\n- IRR: Internal Rate of Return\n\nEXAMPLE:\n\n  ROI001:\n    name: "Process Automation Business Case"\n    description: "ROI analysis for automating order processing"\n    analysisPeriod: 36\n    discountRate: 0.08\n    \n    costs:\n      - name: "Automation Software License"\n        amount: 50000\n        timing: one-time\n        category: technology\n      - name: "Implementation Services"\n        amount: 30000\n        timing: one-time\n        category: consulting\n      - name: "Annual Maintenance"\n        amount: 10000\n        timing: recurring\n        frequency: annually\n        category: technology\n    \n    benefits:\n      - name: "FTE Reduction"\n        amount: 60000\n        timing: recurring\n        frequency: annually\n        category: cost-savings\n      - name: "Error Reduction"\n        amount: 15000\n        timing: recurring\n        frequency: annually\n        category: cost-savings\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "costs",
          "benefits"
        ],
        "properties": {
          "name": {
            "description": "Analysis name.",
            "type": "string"
          },
          "description": {
            "description": "Analysis description.",
            "type": "string"
          },
          "analysisPeriod": {
            "description": "Time horizon for analysis in months.\nTypical values: 12, 24, 36, 60 months.\n",
            "type": "integer",
            "minimum": 1
          },
          "discountRate": {
            "description": "Discount rate for NPV calculation (decimal).\n0.08 = 8% annual discount rate.\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "costs": {
            "description": "Cost components of the investment.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ROIComponent"
            }
          },
          "benefits": {
            "description": "Benefit components from the investment.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ROIComponent"
            }
          },
          "assumptions": {
            "description": "Key assumptions for the analysis.\n",
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "name",
                "value"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "value": {
                  "type": "string"
                },
                "sensitivity": {
                  "description": "Impact if assumption is wrong: high, medium, low",
                  "type": "string",
                  "enum": [
                    "high",
                    "medium",
                    "low"
                  ]
                }
              }
            }
          },
          "risks": {
            "description": "Risks that could affect the ROI.\n",
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "name"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "probability": {
                  "type": "string",
                  "enum": [
                    "low",
                    "medium",
                    "high"
                  ]
                },
                "impact": {
                  "type": "string",
                  "enum": [
                    "low",
                    "medium",
                    "high"
                  ]
                },
                "mitigation": {
                  "type": "string"
                }
              }
            }
          },
          "results": {
            "description": "Calculated results (typically filled by tooling).\n",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "totalCosts": {
                "$ref": "../common/defs.schema.yaml#/$defs/Money"
              },
              "totalBenefits": {
                "$ref": "../common/defs.schema.yaml#/$defs/Money"
              },
              "netBenefit": {
                "$ref": "../common/defs.schema.yaml#/$defs/Money"
              },
              "roiPercent": {
                "type": "number"
              },
              "npv": {
                "$ref": "../common/defs.schema.yaml#/$defs/Money"
              },
              "paybackMonths": {
                "type": "integer"
              },
              "irr": {
                "type": "number"
              }
            }
          },
          "owner": {
            "description": "Analysis owner.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "approvedBy": {
            "description": "Who approved the business case.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "approvedAt": {
            "description": "When the business case was approved.",
            "type": "string",
            "format": "date"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "mining": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/mining.fragment.yaml",
    "title": "UBML Mining Fragment",
    "description": "Process mining configuration for connecting UBML models with event log data.\n\nProcess mining extracts insights from system event logs to:\n- Discover actual process flows\n- Compare reality vs. documented processes (conformance)\n- Identify bottlenecks and variations\n- Validate process improvements\n\nThis fragment enables mapping between:\n- Event log activities \u2192 UBML steps\n- Event log resources \u2192 UBML actors\n- Event log attributes \u2192 UBML entities\n",
    "$defs": {
      "ActivityMapping": {
        "description": 'Maps event log activity names to UBML step IDs.\n\nActivity names in event logs often differ from step names in the model.\nThis mapping enables conformance checking and performance analysis.\n\nMAPPING TYPES:\n- exact: One-to-one mapping\n- pattern: Regex pattern matching\n- group: Multiple activities map to one step\n\nEXAMPLES:\n\nExact mapping:\n  - activity: "Create Purchase Order"\n    step: ST001\n    type: exact\n\nPattern mapping:\n  - activity: "Approve*"\n    step: ST005\n    type: pattern\n\nGroup mapping (multiple activities \u2192 one step):\n  - activity: ["Review Level 1", "Review Level 2", "Final Review"]\n    step: ST010\n    type: group\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "step"
        ],
        "properties": {
          "activity": {
            "description": "Activity name(s) from the event log.\nCan be a single string, regex pattern, or array of strings.\n",
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            ]
          },
          "step": {
            "description": "UBML step ID this activity maps to.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "type": {
            "description": "Mapping type:\n- exact: Exact string match\n- pattern: Regex pattern\n- group: Multiple activities to one step\n",
            "type": "string",
            "enum": [
              "exact",
              "pattern",
              "group"
            ],
            "default": "exact"
          },
          "description": {
            "description": "Description of the mapping logic.",
            "type": "string"
          }
        }
      },
      "ResourceMapping": {
        "description": 'Maps event log resource identifiers to UBML actors.\n\nResources in event logs are typically user IDs or role names.\nThis mapping connects them to the actor model.\n\nEXAMPLES:\n\nRole-based mapping:\n  - resource: "Approver"\n    actor: AC003\n    type: role\n\nIndividual mapping:\n  - resource: "john.smith@company.com"\n    actor: AC001\n    type: individual\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "resource",
          "actor"
        ],
        "properties": {
          "resource": {
            "description": "Resource identifier from the event log.\nCan be a user ID, role name, or pattern.\n",
            "type": "string"
          },
          "actor": {
            "description": "UBML actor ID this resource maps to.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "type": {
            "description": "Mapping type:\n- role: Maps a role/group to an actor\n- individual: Maps a specific user to an actor\n- pattern: Regex pattern for multiple users\n",
            "type": "string",
            "enum": [
              "role",
              "individual",
              "pattern"
            ],
            "default": "role"
          },
          "description": {
            "description": "Description of the mapping logic.",
            "type": "string"
          }
        }
      },
      "AttributeMapping": {
        "description": 'Maps event log attributes to UBML entity fields.\n\nEvent logs often contain case-level attributes that\ncorrespond to entity fields in the process model.\n\nEXAMPLE:\n  - attribute: "order_value"\n    entity: EN001\n    field: totalValue\n    transform: none\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "attribute"
        ],
        "properties": {
          "attribute": {
            "description": "Attribute name in the event log.",
            "type": "string"
          },
          "entity": {
            "description": "UBML entity this attribute belongs to.",
            "$ref": "../common/defs.schema.yaml#/$defs/EntityRef"
          },
          "field": {
            "description": "Field name within the entity.",
            "type": "string"
          },
          "transform": {
            "description": "Transformation to apply:\n- none: Use as-is\n- uppercase: Convert to uppercase\n- lowercase: Convert to lowercase\n- numeric: Parse as number\n- date: Parse as date\n",
            "type": "string",
            "enum": [
              "none",
              "uppercase",
              "lowercase",
              "numeric",
              "date"
            ],
            "default": "none"
          },
          "description": {
            "description": "Description of the attribute meaning.",
            "type": "string"
          }
        }
      },
      "MiningSource": {
        "description": 'Configuration for a process mining data source.\n\nA mining source defines:\n- Where to get the event log data\n- How to interpret the data (column mappings)\n- How to map activities/resources to the UBML model\n\nSUPPORTED SOURCE TYPES:\n- csv: CSV file with standard event log columns\n- database: Direct database connection\n- api: REST API endpoint\n- xes: XES (IEEE 1849) standard format\n\nEXAMPLE - CSV Source:\n\n  MS001:\n    name: "SAP Order Log Export"\n    description: "Monthly export from SAP order processing"\n    type: csv\n    \n    columns:\n      caseId: "Order_Number"\n      activity: "Activity_Name"\n      timestamp: "Event_Time"\n      resource: "User_ID"\n    \n    timestampFormat: "YYYY-MM-DD HH:mm:ss"\n    \n    filters:\n      - column: "Order_Type"\n        operator: equals\n        value: "Standard"\n    \n    activityMappings:\n      - activity: "Create Sales Order"\n        step: ST001\n      - activity: "Credit Check"\n        step: ST002\n    \n    resourceMappings:\n      - resource: "OrderClerk"\n        actor: AC001\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "type"
        ],
        "properties": {
          "name": {
            "description": "Data source name.",
            "type": "string"
          },
          "description": {
            "description": "Data source description.",
            "type": "string"
          },
          "type": {
            "description": "Data source type.",
            "type": "string",
            "enum": [
              "csv",
              "database",
              "api",
              "xes"
            ]
          },
          "connection": {
            "description": "Connection configuration (for database/api types).\n",
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "host": {
                "type": "string"
              },
              "port": {
                "type": "integer"
              },
              "database": {
                "type": "string"
              },
              "table": {
                "type": "string"
              },
              "url": {
                "type": "string"
              }
            }
          },
          "columns": {
            "description": "Column name mappings for event log fields.\n",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "caseId": {
                "description": "Column containing case/process instance ID.",
                "type": "string"
              },
              "activity": {
                "description": "Column containing activity name.",
                "type": "string"
              },
              "timestamp": {
                "description": "Column containing event timestamp.",
                "type": "string"
              },
              "startTimestamp": {
                "description": "Column containing activity start time (if separate).",
                "type": "string"
              },
              "endTimestamp": {
                "description": "Column containing activity end time (if separate).",
                "type": "string"
              },
              "resource": {
                "description": "Column containing resource/user identifier.",
                "type": "string"
              },
              "lifecycle": {
                "description": "Column containing lifecycle transition (start/complete).",
                "type": "string"
              }
            }
          },
          "timestampFormat": {
            "description": 'Timestamp format string.\nUses standard date format patterns.\n\nExamples:\n  "YYYY-MM-DD HH:mm:ss"\n  "DD/MM/YYYY HH:mm"\n  "ISO8601"\n',
            "type": "string"
          },
          "filters": {
            "description": "Filters to apply when loading data.\n",
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "column",
                "operator",
                "value"
              ],
              "properties": {
                "column": {
                  "type": "string"
                },
                "operator": {
                  "type": "string",
                  "enum": [
                    "equals",
                    "not_equals",
                    "contains",
                    "starts_with",
                    "ends_with",
                    "greater_than",
                    "less_than"
                  ]
                },
                "value": {
                  "oneOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "number"
                    }
                  ]
                }
              }
            }
          },
          "process": {
            "description": "UBML process this source provides data for.",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "activityMappings": {
            "description": "Activity to step mappings.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ActivityMapping"
            }
          },
          "resourceMappings": {
            "description": "Resource to actor mappings.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ResourceMapping"
            }
          },
          "attributeMappings": {
            "description": "Attribute to entity field mappings.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/AttributeMapping"
            }
          },
          "refreshSchedule": {
            "description": 'Schedule for refreshing data.\nCron-like expression or predefined values.\n\nExamples: "daily", "weekly", "0 0 * * *"\n',
            "type": "string"
          },
          "lastRefresh": {
            "description": "When data was last refreshed.",
            "type": "string",
            "format": "date-time"
          },
          "recordCount": {
            "description": "Number of events in the source.",
            "type": "integer",
            "minimum": 0
          },
          "caseCount": {
            "description": "Number of unique cases in the source.",
            "type": "integer",
            "minimum": 0
          },
          "dateRange": {
            "description": "Date range covered by the data.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "from": {
                "type": "string",
                "format": "date"
              },
              "to": {
                "type": "string",
                "format": "date"
              }
            }
          },
          "quality": {
            "description": "Data quality metrics.\n",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "completeness": {
                "description": "Percentage of complete cases.",
                "type": "number",
                "minimum": 0,
                "maximum": 100
              },
              "unmappedActivities": {
                "description": "Count of activities not mapped to steps.",
                "type": "integer",
                "minimum": 0
              },
              "unmappedResources": {
                "description": "Count of resources not mapped to actors.",
                "type": "integer",
                "minimum": 0
              }
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "process": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/process.fragment.yaml",
    "title": "UBML Process Fragment",
    "description": "Processes are the core workflows containing steps, links, and control flow.\nThis fragment defines Process, Phase, and ProcessTrigger types.\n",
    "$defs": {
      "Phase": {
        "description": 'A non-executable grouping of steps for organizational purposes.\n\nWHY PHASES EXIST:\nPhases provide an OVERLAY on the process graph without changing\nexecution semantics. They answer questions like:\n- "Which lifecycle stage is this step part of?" (kind: lifecycle)\n- "Which delivery phase/release includes this step?" (kind: delivery)\n\nPHASES vs BLOCKS - CRITICAL DISTINCTION:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502 PHASES (PH###)          \u2502 BLOCKS (BK###)          \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 Purpose     \u2502 Organizational view     \u2502 Execution semantics     \u2502\n\u2502 Operators   \u2502 lifecycle, delivery     \u2502 par, alt, loop, opt     \u2502\n\u2502 Affects     \u2502 Nothing (metadata only) \u2502 Routing & scheduling    \u2502\n\u2502 Question    \u2502 "What stage is this?"   \u2502 "How does this run?"    \u2502\n\u2502 Simulation  \u2502 No effect               \u2502 Changes behavior        \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nINDUSTRY EXAMPLES:\n- Construction: Design Phase, Build Phase, Handover Phase\n- Manufacturing: Planning Phase, Production Phase, QA Phase\n- Engineering: Discovery Phase, Design Phase, Delivery Phase\n- Services: Intake Phase, Fulfillment Phase, Closure Phase\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "kind"
        ],
        "anyOf": [
          {
            "required": [
              "startMilestone",
              "endMilestone"
            ]
          },
          {
            "required": [
              "includeSteps"
            ]
          }
        ],
        "properties": {
          "name": {
            "description": 'Human-readable phase name displayed in diagrams and reports.\n\nExamples:\n  - "Requirements Gathering"\n  - "MVP Scope"\n  - "Phase 2 Delivery"\n',
            "type": "string"
          },
          "kind": {
            "description": 'Phase classification:\n\n- lifecycle: Stage in the process lifecycle.\n  Typically sequential, non-overlapping stages like SDLC phases.\n  Rendered as horizontal bands or swimlane backgrounds.\n  Examples: "Initiation", "Planning", "Execution", "Closure"\n\n- delivery: Delivery phase, release, or iteration.\n  May overlap; often tied to roadmaps.\n  Rendered with distinct colors or collapsible groups.\n  Examples: "MVP", "Release 1.0", "Sprint 3", "Future Backlog"\n',
            "type": "string",
            "enum": [
              "lifecycle",
              "delivery"
            ]
          },
          "description": {
            "description": "Detailed description of the phase's purpose, scope, or goals.\n",
            "type": "string"
          },
          "entryCriteria": {
            "description": 'Conditions that must be met before work in this phase can begin.\nThese are documentation/governance criteria, NOT executable guards.\n\nExample: "Requirements document approved by stakeholders"\n',
            "type": "string"
          },
          "exitCriteria": {
            "description": 'Conditions that must be met before this phase is considered complete.\nUsed for quality gates and governance checkpoints.\n\nExample: "All test cases passed with >95% coverage"\n',
            "type": "string"
          },
          "owner": {
            "description": "Actor responsible for this phase's completion.\nTypically a role or team, not an individual.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "startMilestone": {
            "description": "Step ID marking the beginning of this phase.\nMUST reference a step with kind: milestone.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "endMilestone": {
            "description": "Step ID marking the end of this phase.\nMUST reference a step with kind: milestone.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "includeSteps": {
            "description": "Explicit list of step IDs included in this phase.\nUse when milestone boundaries don't cleanly divide stages.\n\nNote: Steps can only belong to ONE phase of each kind.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "ProcessTrigger": {
        "description": 'Events that start other processes or steps.\n\nEnables cross-process orchestration where completion of one step\ntriggers the start of another process.\n\nExample:\n  triggers:\n    - event: onComplete\n      source: ST015\n      target: PR010\n      condition: "order.value > 100000"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "event",
          "source",
          "target"
        ],
        "properties": {
          "event": {
            "description": "Trigger event type.",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessTriggerEvent"
          },
          "source": {
            "description": "Step ID that fires the trigger.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "target": {
            "description": "Process ID to start.",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "condition": {
            "description": 'Guard expression for conditional triggering.\n\nExamples:\n  condition: "order.value > 50000"\n  condition: requiresEscalation\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          }
        }
      },
      "Process": {
        "description": "The core process model.\n\nSupports:\n- Multi-level hierarchy (L1 strategic to L4 detailed)\n- Cross-process triggers\n- Unified links for routing and scheduling\n- Blocks for control flow grouping (par, alt, loop) - EXECUTION semantics\n- Phases for lifecycle stages and delivery phases - ORGANIZATIONAL overlay\n\nPROCESS LEVELS:\n- L1: Strategic (value chain level)\n- L2: Operational (major processes)\n- L3: Procedural (detailed processes)\n- L4: Work instructions (task-level detail)\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name",
          "steps"
        ],
        "properties": {
          "id": {
            "description": "Unique process ID (PR### pattern).",
            "type": "string",
            "pattern": "^PR\\d{3,}$"
          },
          "name": {
            "description": 'Short label for diagrams.\n\nExamples:\n  - "Order Fulfillment"\n  - "Customer Onboarding"\n  - "Easement Acquisition"\n',
            "type": "string"
          },
          "description": {
            "description": "Longer description for documentation.",
            "type": "string"
          },
          "level": {
            "description": "Process hierarchy level:\n1 = L1 strategic (value chain)\n2 = L2 operational (major processes)\n3 = L3 procedural (detailed processes)\n4 = L4 work instructions\n5-6 = reserved for future use\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 6
          },
          "parent": {
            "description": "Parent process ID for hierarchy.",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "startsWith": {
            "description": "Step IDs that are entry points to this process.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
            }
          },
          "endsWith": {
            "description": "Step IDs that are exit points from this process.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
            }
          },
          "triggers": {
            "description": "Events that start other processes or steps.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ProcessTrigger"
            }
          },
          "steps": {
            "description": "Steps in this process.\nKeyed by step ID (ST### pattern).\n",
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^ST\\d{3,}$": {
                "$ref": "step.fragment.yaml#/$defs/Step"
              }
            }
          },
          "links": {
            "description": "Relationships between steps.\nEach link can carry both routing and scheduling properties.\n",
            "type": "array",
            "items": {
              "$ref": "link.fragment.yaml#/$defs/Link"
            }
          },
          "blocks": {
            "description": "Control flow blocks with EXECUTION semantics.\nFor organizational grouping, use 'phases' instead.\n",
            "type": "array",
            "items": {
              "$ref": "step.fragment.yaml#/$defs/Block"
            }
          },
          "phases": {
            "description": "Non-executable organizational groupings.\nKeyed by phase ID (PH### pattern).\n",
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^PH\\d{3,}$": {
                "$ref": "#/$defs/Phase"
              }
            }
          },
          "subprocesses": {
            "description": "Child processes (for L1-L4 hierarchy).\nKeyed by process ID (PR### pattern).\n",
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^PR\\d{3,}$": {
                "$ref": "#/$defs/Process"
              }
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "resource": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/resource.fragment.yaml",
    "title": "UBML Resource Fragment",
    "description": "Resources enable capacity-based simulation and resource matching.\nThis fragment defines Skills, Resource Pools, and Equipment.\n",
    "$defs": {
      "Skill": {
        "description": 'Skill definition for capacity planning and resource matching.\n\nSkills represent:\n- Certifications (HGV license, crane operator, PMP)\n- Competencies (negotiation, technical review, coding)\n- Training (safety training, product knowledge)\n\nSkills are referenced by:\n- Actors: who has the skill (with proficiency level)\n- Steps: who can perform the step (with required level)\n- Equipment: who can operate the equipment\n\nExample:\n  name: "Crane Operator Certification"\n  description: "Licensed to operate tower cranes per OSHA requirements"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": 'Human-readable skill name.\n\nExamples:\n  - "Crane Operator Certification"\n  - "HGV License Class C"\n  - "Contract Negotiation"\n  - "SAP Configuration"\n',
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the skill requirements.\nInclude certification bodies, validity periods, or prerequisites.\n",
            "type": "string"
          }
        }
      },
      "ResourcePool": {
        "description": 'Resource pool for capacity-based simulation.\n\nA resource pool represents a group of interchangeable resources\n(people with the same role/skills, or people + equipment pairs).\n\nWHY EQUIPMENT ON RESOURCE POOLS:\nMany industries require pairing people with equipment:\n- "Delivery crew" = driver with HGV license + delivery truck\n- "Crane crew" = crane operator with certification + tower crane\n- "Field technician" = technician + service vehicle + tools\n\nWhen equipment is specified, simulation matches:\n1. Available person from pool with required skills\n2. Available equipment from the equipment list\nOnly when BOTH are available can work proceed.\n\nExample:\n  name: "Delivery Crew"\n  actor: AC010  # Delivery Driver role\n  capacity: 5\n  hoursPerDay: 8\n  skills: [SK001]  # HGV License\n  equipment: [EQ001, EQ002, EQ003, EQ004, EQ005]  # 5 trucks\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "actor"
        ],
        "properties": {
          "name": {
            "description": 'Human-readable pool name.\n\nExamples:\n  - "Delivery Crew"\n  - "Senior Engineers"\n  - "Customer Service Agents"\n',
            "type": "string"
          },
          "actor": {
            "description": "Actor ID (usually a role or team) that members of this pool have.\nUsed to connect the pool to organizational structure.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "capacity": {
            "description": "Number of people in this pool.\nLimits concurrent work - only 'capacity' work items can be processed.\n",
            "type": "integer",
            "minimum": 1
          },
          "hoursPerDay": {
            "description": "Available hours per day per person.\nUsed for effort-based scheduling in simulation.\n\nExample: 8 for full-time, 4 for half-time\n",
            "type": "number"
          },
          "rate": {
            "description": "Cost rate for this pool.\nOverrides individual actor rates for simulation costing.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Rate"
          },
          "skills": {
            "description": "Skill IDs available in this pool.\nAll members of the pool are assumed to have these skills.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
            }
          },
          "equipment": {
            "description": 'Equipment IDs that members of this pool use.\n\nWhen specified, each pool member is paired with equipment.\nWork can only proceed when both person AND equipment are available.\n\nExample: A "Delivery Crew" pool with 5 drivers and 5 trucks.\nOnly 5 deliveries can happen concurrently even if demand is higher.\n',
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/EquipmentRef"
            }
          },
          "wipLimit": {
            "description": "Maximum concurrent work items (for ops/service modeling).\n\nDifferent from capacity: wipLimit is per-pool, capacity is headcount.\nUse for kanban-style WIP limits.\n",
            "type": "integer",
            "minimum": 1
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Equipment": {
        "description": 'Physical equipment, vehicle, machine, or tool used in processes.\n\nWHY EQUIPMENT IS SEPARATE FROM ACTORS:\nActors answer "WHO does the work?" - people, roles, teams, organizations.\nEquipment answers "WHAT physical assets are used?"\n\nThis separation matters because:\n1. Equipment cannot be accountable - only people appear in RACI\n2. Equipment requires operators with specific skills/certifications\n3. Equipment has physical location constraints\n4. Simulation must match: available skilled person + available equipment\n\nEXAMPLES BY INDUSTRY:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 Industry        \u2502 Equipment Examples                             \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 Construction    \u2502 Cranes, excavators, concrete mixers, scaffolds \u2502\n\u2502 Manufacturing   \u2502 CNC machines, assembly lines, forklifts        \u2502\n\u2502 Logistics       \u2502 Trucks, vans, warehouse robots, pallet jacks   \u2502\n\u2502 Healthcare      \u2502 MRI machines, surgical robots, monitors        \u2502\n\u2502 Field Services  \u2502 Service vehicles, diagnostic tools, meters     \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "type"
        ],
        "properties": {
          "name": {
            "description": 'Human-readable equipment name.\n\nExamples:\n  - "Tower Crane #1"\n  - "Delivery Truck - Prague"\n  - "CNC Mill Station A"\n',
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the equipment.",
            "type": "string"
          },
          "type": {
            "description": "Equipment classification:\n\n- vehicle: cars, trucks, vans, forklifts, cranes\n- machine: production lines, CNC, 3D printers, assembly equipment\n- tool: hand tools, power tools, specialized equipment\n- device: sensors, scanners, diagnostic equipment, tablets\n- infrastructure: fixed assets like loading docks, test rigs\n",
            "type": "string",
            "enum": [
              "vehicle",
              "machine",
              "tool",
              "device",
              "infrastructure"
            ]
          },
          "requiredSkill": {
            "description": "Skill required to operate this equipment.\n\nMaps to certifications and licenses:\n- HGV license for trucks\n- Forklift certification for forklifts\n- Crane operator license for cranes\n- Working at height certification for scaffolding\n\nWhen set, only actors with this skill can use this equipment.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
          },
          "location": {
            "description": "Where this equipment is stationed or stored.\n\nFor mobile equipment (vehicles), this is the home base.\nFor fixed equipment (machines), this is the installation site.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/LocationRef"
          },
          "capacity": {
            "description": "Throughput or load capacity of this equipment.\n\nUnits depend on equipment type:\n- Vehicle: load capacity in kg or items\n- Machine: units per hour\n- Tool: N/A (typically omit)\n",
            "type": "number"
          },
          "rate": {
            "description": "Cost per time unit when equipment is in use.\nUsed for simulation costing.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Rate"
          },
          "owner": {
            "description": "Actor who owns or manages this equipment.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and grouping equipment.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "scenario": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/scenario.fragment.yaml",
    "title": "UBML Scenario Fragment",
    "description": 'Scenarios enable simulation and "what-if" analysis by defining:\n- Work arrivals (how work enters the process)\n- Work mix (distribution of different case types)\n- Work attributes (characteristics that affect processing)\n- Evidence data (historical observations for validation)\n',
    "$defs": {
      "WorkAttribute": {
        "description": "Characteristics of work items that affect processing.\n\nWork attributes capture variables that influence:\n- Routing decisions (which path a case takes)\n- Processing time (complexity, value thresholds)\n- Resource requirements (special skills needed)\n\nATTRIBUTE TYPES:\n- categorical: Discrete categories (region, type, priority)\n- numeric: Continuous values (value, quantity, age)\n\nEXAMPLES:\n\nCategorical:\n  region:\n    type: categorical\n    values:\n      - name: North\n        probability: 0.3\n      - name: South\n        probability: 0.5\n      - name: West\n        probability: 0.2\n\nNumeric (Normal distribution):\n  orderValue:\n    type: numeric\n    distribution: normal\n    mean: 5000\n    stdDev: 1500\n\nNumeric (Fixed value):\n  standardQuantity:\n    type: numeric\n    distribution: fixed\n    value: 10\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "type"
        ],
        "properties": {
          "type": {
            "description": "Attribute type classification.",
            "type": "string",
            "enum": [
              "categorical",
              "numeric"
            ]
          },
          "description": {
            "description": "Description of the attribute.",
            "type": "string"
          },
          "values": {
            "description": "For categorical attributes: possible values with probabilities.\nProbabilities should sum to 1.0.\n",
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "name",
                "probability"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "probability": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1
                },
                "description": {
                  "type": "string"
                }
              }
            }
          },
          "distribution": {
            "description": "Distribution type for numeric attributes:\n- fixed: Single constant value\n- uniform: Uniform random between min and max\n- normal: Normal/Gaussian distribution\n- exponential: Exponential distribution\n- lognormal: Log-normal distribution\n- triangular: Triangular distribution\n",
            "type": "string",
            "enum": [
              "fixed",
              "uniform",
              "normal",
              "exponential",
              "lognormal",
              "triangular"
            ]
          },
          "value": {
            "description": "For fixed distribution: the constant value.",
            "type": "number"
          },
          "min": {
            "description": "Minimum value (uniform, triangular).",
            "type": "number"
          },
          "max": {
            "description": "Maximum value (uniform, triangular).",
            "type": "number"
          },
          "mean": {
            "description": "Mean value (normal, lognormal).",
            "type": "number"
          },
          "stdDev": {
            "description": "Standard deviation (normal, lognormal).",
            "type": "number"
          },
          "rate": {
            "description": "Rate parameter (exponential).",
            "type": "number"
          },
          "mode": {
            "description": "Mode/peak value (triangular).",
            "type": "number"
          }
        }
      },
      "WorkMixItem": {
        "description": 'A category of work in the work mix distribution.\n\nWork mix defines the proportion of different case types.\nEach item represents a distinct category with its own\ncharacteristics and probability.\n\nExample:\n  workMix:\n    - name: Standard Order\n      probability: 0.7\n      description: "Regular orders under $10,000"\n    - name: Large Order\n      probability: 0.2\n      description: "Orders over $10,000, require approval"\n    - name: Expedited Order\n      probability: 0.1\n      description: "Rush orders with priority handling"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "probability"
        ],
        "properties": {
          "name": {
            "description": "Name of this work category.",
            "type": "string"
          },
          "probability": {
            "description": "Probability/proportion of this work type.\nAll work mix probabilities should sum to 1.0.\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "description": {
            "description": "Description of this work category.",
            "type": "string"
          },
          "attributes": {
            "description": "Attribute overrides specific to this work type.\nThese override the scenario-level work attributes.\n",
            "type": "object",
            "additionalProperties": {
              "$ref": "#/$defs/WorkAttribute"
            }
          }
        }
      },
      "Arrivals": {
        "description": 'Work arrival patterns for simulation.\n\nArrivals define how work items enter the process.\nThis is crucial for capacity planning and queue analysis.\n\nARRIVAL PATTERNS:\n\nPoisson arrivals (most common for random demand):\n  arrivals:\n    pattern: poisson\n    rate: 10\n    rateUnit: per-day\n\nScheduled arrivals (batch processing):\n  arrivals:\n    pattern: scheduled\n    schedule: "0 9 * * MON-FRI"\n    batchSize: 50\n\nUniform arrivals (steady stream):\n  arrivals:\n    pattern: uniform\n    rate: 5\n    rateUnit: per-hour\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "pattern"
        ],
        "properties": {
          "pattern": {
            "description": "Arrival pattern type:\n- poisson: Random arrivals (Poisson process)\n- uniform: Even distribution over time\n- scheduled: Fixed schedule (cron-like)\n- burst: Periodic bursts of arrivals\n",
            "type": "string",
            "enum": [
              "poisson",
              "uniform",
              "scheduled",
              "burst"
            ]
          },
          "rate": {
            "description": "Arrival rate (for poisson, uniform).\nInterpreted according to rateUnit.\n",
            "type": "number",
            "minimum": 0
          },
          "rateUnit": {
            "description": "Unit for the rate value.",
            "type": "string",
            "enum": [
              "per-minute",
              "per-hour",
              "per-day",
              "per-week",
              "per-month"
            ]
          },
          "schedule": {
            "description": 'For scheduled arrivals: cron-like schedule expression.\n\nFormat: "minute hour day month weekday"\n\nExamples:\n  "0 9 * * MON-FRI" - 9 AM weekdays\n  "0 */2 * * *" - Every 2 hours\n  "30 8 1 * *" - 8:30 AM on 1st of each month\n',
            "type": "string"
          },
          "batchSize": {
            "description": "Number of items per arrival event.",
            "type": "integer",
            "minimum": 1,
            "default": 1
          },
          "burstSize": {
            "description": "For burst pattern: items per burst.",
            "type": "integer",
            "minimum": 1
          },
          "burstInterval": {
            "description": "For burst pattern: time between bursts.",
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "seasonality": {
            "description": "Seasonal adjustment factors by time period.\nValues multiply the base rate.\n\nExample (higher demand in Q4):\n  seasonality:\n    Q1: 0.8\n    Q2: 0.9\n    Q3: 1.0\n    Q4: 1.3\n",
            "type": "object",
            "additionalProperties": {
              "type": "number",
              "minimum": 0
            }
          }
        }
      },
      "Evidence": {
        "description": 'Historical observation data for model validation.\n\nEvidence provides actual measurements to validate\nthat the process model matches reality.\n\nEVIDENCE TYPES:\n- duration: Actual processing time observations\n- count: Volume/count measurements\n- rate: Throughput measurements\n- cost: Cost observations\n\nExample:\n  evidence:\n    - type: duration\n      step: ST005\n      metric: processingTime\n      value: "4h30m"\n      observedAt: "2024-01-15"\n      source: "Time tracking system"\n    - type: count\n      metric: dailyVolume\n      value: 45\n      period: "2024-01"\n      source: "Monthly report"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "type",
          "metric",
          "value"
        ],
        "properties": {
          "type": {
            "description": "Evidence type classification.",
            "type": "string",
            "enum": [
              "duration",
              "count",
              "rate",
              "cost"
            ]
          },
          "metric": {
            "description": 'Name of the metric being measured.\n\nExamples: "processingTime", "waitTime", "dailyVolume", "throughput"\n',
            "type": "string"
          },
          "value": {
            "description": "Observed value. Can be:\n- Duration string for duration type\n- Number for count, rate, cost types\n",
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "number"
              }
            ]
          },
          "step": {
            "description": "Step this evidence relates to (if step-specific).",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "process": {
            "description": "Process this evidence relates to (if process-level).",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "observedAt": {
            "description": "Date/time of observation (ISO 8601).",
            "type": "string",
            "format": "date-time"
          },
          "period": {
            "description": 'Time period covered by the measurement.\n\nExamples: "2024-01", "2024-Q1", "2024"\n',
            "type": "string"
          },
          "source": {
            "description": 'Source of the evidence data.\n\nExamples: "Time tracking system", "ERP export", "Manual survey"\n',
            "type": "string"
          },
          "confidence": {
            "description": "Confidence level in the measurement (0-1).\n1.0 = highly reliable, 0.5 = rough estimate\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "notes": {
            "description": "Additional notes about the observation.",
            "type": "string"
          }
        }
      },
      "Scenario": {
        "description": 'A simulation scenario defining work characteristics and arrivals.\n\nScenarios enable "what-if" analysis by defining:\n- How work arrives (arrivals pattern)\n- What types of work exist (work mix)\n- What attributes work items have (work attributes)\n- Historical data for validation (evidence)\n\nSCENARIO EXAMPLES:\n\nCurrent state baseline:\n  SC001:\n    name: Current State\n    description: "Baseline scenario from 2023 data"\n    arrivals:\n      pattern: poisson\n      rate: 50\n      rateUnit: per-day\n    workMix:\n      - name: Standard\n        probability: 0.8\n      - name: Complex\n        probability: 0.2\n\nGrowth scenario:\n  SC002:\n    name: 2x Volume\n    description: "What if volume doubles?"\n    arrivals:\n      pattern: poisson\n      rate: 100\n      rateUnit: per-day\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Scenario name.",
            "type": "string"
          },
          "description": {
            "description": "Detailed scenario description.",
            "type": "string"
          },
          "basedOn": {
            "description": "Parent scenario this inherits from.\nUsed for scenario variations.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ScenarioRef"
          },
          "arrivals": {
            "description": "Work arrival patterns.",
            "$ref": "#/$defs/Arrivals"
          },
          "workMix": {
            "description": "Distribution of work types.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/WorkMixItem"
            }
          },
          "workAttributes": {
            "description": "Work attributes that affect processing.\nKeyed by attribute name.\n",
            "type": "object",
            "additionalProperties": {
              "$ref": "#/$defs/WorkAttribute"
            }
          },
          "evidence": {
            "description": "Historical observations for validation.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/Evidence"
            }
          },
          "simulationConfig": {
            "description": "Simulation-specific configuration.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "warmupPeriod": {
                "description": "Simulation warmup period to discard.",
                "$ref": "../common/defs.schema.yaml#/$defs/Duration"
              },
              "runLength": {
                "description": "Total simulation run length.",
                "$ref": "../common/defs.schema.yaml#/$defs/Duration"
              },
              "replications": {
                "description": "Number of simulation replications.",
                "type": "integer",
                "minimum": 1,
                "default": 10
              },
              "randomSeed": {
                "description": "Random seed for reproducibility.",
                "type": "integer"
              }
            }
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "step": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/step.fragment.yaml",
    "title": "UBML Step Fragment",
    "description": "Steps are the building blocks of processes.\nThis fragment defines Step, Block, RACI, Approval, Review, and related types.\n",
    "$defs": {
      "Message": {
        "description": 'Message sent during a step (for sequence diagrams).\n\nMESSAGES vs NOTIFICATIONS:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502 MESSAGES                    \u2502 NOTIFICATIONS               \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 Purpose     \u2502 Communication IS the work   \u2502 Alerts ABOUT the work       \u2502\n\u2502 When        \u2502 During step execution       \u2502 At step lifecycle events    \u2502\n\u2502 Examples    \u2502 "Send proposal to client"   \u2502 "Alert when overdue"        \u2502\n\u2502 Diagrams    \u2502 Sequence diagram arrows     \u2502 Not shown in diagrams       \u2502\n\u2502 Simulation  \u2502 Part of step duration       \u2502 Zero duration, metadata     \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nUse messages when the communication is the actual work being done.\nUse notifications for governance, monitoring, and RACI.informed automation.\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "to",
          "name"
        ],
        "properties": {
          "to": {
            "description": "Recipient actor ID.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "name": {
            "description": 'Message name/content.\n\nExamples:\n  - "Send proposal"\n  - "Request approval"\n  - "Notify completion"\n',
            "type": "string"
          },
          "channel": {
            "description": 'Communication channel.\n\nExamples: "email", "API", "in-person", "phone", "portal"\n',
            "type": "string"
          }
        }
      },
      "RACI": {
        "description": "RACI matrix for responsibility assignment.\n\n- Responsible: Who performs the work\n- Accountable: Who is ultimately answerable\n- Consulted: Who provides input (two-way communication)\n- Informed: Who is kept updated (one-way communication)\n\nCONNECTION TO NOTIFICATIONS:\nThe 'informed' array defines WHO should be notified.\nThe 'notifications' array on the step defines WHEN they are notified.\nWhen a notification omits 'recipients', it defaults to raci.informed.\n\nCONNECTION TO REVIEWS:\nThe 'consulted' array defines default reviewers.\nWhen step.review omits 'reviewers', it defaults to raci.consulted.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "responsible": {
            "description": 'Actor IDs who perform the work.\n\nBest practice: Use roles, not individuals.\nExample: [AC010] where AC010 is "Sales Manager" role\n',
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "accountable": {
            "description": "Actor IDs who are ultimately answerable.\n\nBest practice: Usually one person/role per step.\nThe accountable party has final authority and sign-off.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "consulted": {
            "description": "Actor IDs whose opinions are sought.\nUsed as default reviewers when step.review omits 'reviewers'.\n\nTwo-way communication: you ask, they respond.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "informed": {
            "description": "Actor IDs who are kept up-to-date.\nUsed as default recipients for step notifications when not specified.\n\nOne-way communication: you tell, they receive.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          }
        }
      },
      "Loop": {
        "description": "Rework/iteration modeling for simulation.\n\nLoops model repeated execution of a step:\n- repeat: Execute N times\n- rework: Probability-based retry (defect modeling)\n- forEach: Iterate over a collection\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "kind": {
            "description": "Loop type:\n- none: no looping\n- repeat: repeat N times\n- rework: probability-based retry\n- forEach: iterate over collection\n",
            "type": "string",
            "enum": [
              "none",
              "repeat",
              "rework",
              "forEach"
            ]
          },
          "over": {
            "description": 'Entity ID or case attribute to iterate over (for forEach kind).\n\nExample: "orderLines" to iterate over each line item\n',
            "type": "string"
          },
          "max": {
            "description": "Maximum iterations.",
            "type": "integer",
            "minimum": 1
          },
          "probability": {
            "description": "Probability of repeating (0-1, for repeat/rework kinds).\n\nExample: 0.1 means 10% chance of rework\n",
            "type": "number",
            "minimum": 0,
            "maximum": 1
          }
        }
      },
      "SkillRequirement": {
        "description": "Skill required to perform a step.\n\nUsed for resource matching in simulation.\nStep can only be performed by actors whose skill level >= required level.\n\nExample:\n  skill: SK001\n  level: 3  # Requires at least Intermediate level\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "skill"
        ],
        "properties": {
          "skill": {
            "description": "Skill ID reference.",
            "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
          },
          "level": {
            "description": "Required proficiency level (1-5).\n\n1 = Novice, 2 = Basic, 3 = Intermediate, 4 = Advanced, 5 = Expert\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          }
        }
      },
      "StepTrigger": {
        "description": "When a step is activated.\n\nTriggers control how steps start:\n- immediate: Start as soon as predecessors complete\n- scheduled: Start after a delay\n- event: Start when an event occurs\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "description": "Trigger type.",
            "type": "string",
            "enum": [
              "immediate",
              "scheduled",
              "event"
            ],
            "default": "immediate"
          },
          "delay": {
            "description": 'Delay before activation.\n\nExamples:\n  delay: "30d"                        # fixed literal\n  delay: { expr: "waitPeriod * 1.5" } # calculation\n  delay: { expr: standardDelay }      # work attribute\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "relativeTo": {
            "description": "Step ID the delay is relative to.",
            "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
          },
          "condition": {
            "description": 'Expression that must be true for trigger to fire.\n\nExamples:\n  condition: "order.value > 10000"    # calculation\n  condition: requiresFollowup         # work attribute\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          }
        }
      },
      "Batch": {
        "description": "Batching configuration for steps that process items together.\n\nUsed for manufacturing/service operations where items are\nprocessed in groups rather than individually.\n\nExample: Processing 10 orders at once in a batch print job\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "size": {
            "description": "Number of items processed together.",
            "type": "integer",
            "minimum": 1
          }
        }
      },
      "Notification": {
        "description": `Notification configuration for alerting stakeholders about step events.

NOTIFICATIONS vs MESSAGES:
- Messages = communication IS the work (shown in sequence diagrams)
- Notifications = system alerts ABOUT the work (governance/monitoring)

RACI CONNECTION:
When 'recipients' is omitted, notifications are sent to raci.informed.
This makes the RACI matrix actionable for automated notifications.

Examples:
  # Notify RACI.informed when step starts
  - trigger: onStart
  
  # Warn approvers 1 day before deadline
  - trigger: onDeadlineWarning
    threshold: "1d"
    recipients: [AC002, AC007]
    priority: high
  
  # Notify customer on rejection
  - trigger: onOutcome
    outcome: rejected
    recipients: [AC001]
`,
        "type": "object",
        "additionalProperties": false,
        "required": [
          "trigger"
        ],
        "properties": {
          "trigger": {
            "description": "Step lifecycle event that triggers this notification.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/StepLifecycleEvent"
          },
          "outcome": {
            "description": "For trigger: onOutcome, which outcome triggers this notification.\nMust match an outcome defined in the step's approval.outcomes.\n",
            "type": "string"
          },
          "recipients": {
            "description": "Actor IDs to notify.\nIf omitted, defaults to raci.informed.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "threshold": {
            "description": 'For trigger: onDeadlineWarning, time before deadline to notify.\nExample: "2d" = notify 2 days before deadline expires.\n',
            "$ref": "../common/defs.schema.yaml#/$defs/DurationString"
          },
          "priority": {
            "description": "Notification urgency level.",
            "$ref": "../common/defs.schema.yaml#/$defs/Priority"
          },
          "condition": {
            "description": "Guard expression - notification only sent if condition is true.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          }
        }
      },
      "Approval": {
        "description": `Approval configuration for steps requiring sign-off or authorization.

Adds structured approval semantics to any step, enabling:
- Multi-approver workflows with quorum rules
- Explicit outcomes tied to routing decisions
- Delegation support

OUTCOMES:
Define explicit outcomes (e.g., approved, rejected, returned) that
can be referenced in link guards for routing:

  links:
    - from: ST015
      to: ST016
      guard: "step.outcome == 'approved'"
    - from: ST015
      to: ST010
      guard: "step.outcome == 'returned'"

QUORUM:
Use 'required' to specify how many approvers must agree:
- required: 1 = any one approver (default)
- required: 2 = at least 2 must approve
- required: all = unanimous approval
`,
        "type": "object",
        "additionalProperties": false,
        "required": [
          "approvers"
        ],
        "properties": {
          "approvers": {
            "description": "Actor IDs who can approve this step.\nAt least one approver must be specified.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            },
            "minItems": 1
          },
          "required": {
            "description": "How many approvers must approve for the step to complete.\n- number: exact count required (e.g., 2 means 2 of N must approve)\n- 'all': unanimous approval required\n- 'any': any single approver suffices (default)\n",
            "oneOf": [
              {
                "type": "integer",
                "minimum": 1
              },
              {
                "type": "string",
                "enum": [
                  "all",
                  "any"
                ]
              }
            ],
            "default": "any"
          },
          "outcomes": {
            "description": "Possible outcomes of the approval.\nThese can be referenced in link guards for conditional routing.\n\nRecommended: Use standard outcomes (approved, rejected, returned,\ndeferred, escalated, timeout). Custom outcomes allowed as strings.\n",
            "type": "array",
            "items": {
              "type": "string"
            },
            "default": [
              "approved",
              "rejected"
            ]
          },
          "allowDelegation": {
            "description": "Whether approvers can delegate their approval to others.\nUseful for vacation coverage or workload balancing.\n",
            "type": "boolean",
            "default": false
          },
          "allowReassignment": {
            "description": "Whether the approval can be reassigned to a different approver.\nTypically used when original approver is unavailable.\n",
            "type": "boolean",
            "default": false
          },
          "requireComment": {
            "description": "Whether approvers must provide a comment with their decision.\n- never: comments optional (default)\n- onNegative: required when rejecting/returning\n- always: required for all outcomes\n",
            "$ref": "../common/defs.schema.yaml#/$defs/CommentRequirement"
          },
          "deadline": {
            "description": "Time limit for approvers to make a decision.\nIf breached, can trigger notifications or auto-outcomes.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/DurationString"
          }
        }
      },
      "Review": {
        "description": "Review configuration for gathering feedback (non-blocking).\n\nREVIEW vs APPROVAL:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502 REVIEW                      \u2502 APPROVAL                    \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 Blocking    \u2502 No - process continues      \u2502 Yes - gates progression     \u2502\n\u2502 Purpose     \u2502 Gather feedback, comments   \u2502 Authorize, sign-off         \u2502\n\u2502 Outcome     \u2502 Feedback collected          \u2502 Decision made               \u2502\n\u2502 RACI link   \u2502 Defaults to Consulted       \u2502 Specified explicitly        \u2502\n\u2502 Routing     \u2502 No effect on flow           \u2502 Guards control routing      \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nRACI CONNECTION:\nWhen 'reviewers' is omitted, defaults to raci.consulted.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "reviewers": {
            "description": "Actor IDs who should provide feedback.\nIf omitted, defaults to raci.consulted.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "required": {
            "description": "How many reviewers must respond.\n- number: exact count required\n- 'all': all reviewers must respond\n- 'any': at least one reviewer (default)\n",
            "oneOf": [
              {
                "type": "integer",
                "minimum": 1
              },
              {
                "type": "string",
                "enum": [
                  "all",
                  "any"
                ]
              }
            ],
            "default": "any"
          },
          "waitFor": {
            "description": "Number of reviews to wait for before step can complete.\n- 0 or omitted: step completes immediately, reviews are async\n- number: wait for N reviews before step completes\n- 'all': wait for all reviewers (makes review blocking)\n",
            "oneOf": [
              {
                "type": "integer",
                "minimum": 0
              },
              {
                "type": "string",
                "enum": [
                  "all"
                ]
              }
            ],
            "default": 0
          },
          "deadline": {
            "description": "Time limit for reviewers to respond.\nAfter deadline, step proceeds with whatever reviews are in.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/DurationString"
          },
          "requireComment": {
            "description": "Whether reviewers must provide comments.\n- never: feedback optional (default)\n- onNegative: required when flagging issues/concerns\n- always: comments required from all reviewers\n",
            "$ref": "../common/defs.schema.yaml#/$defs/CommentRequirement"
          }
        }
      },
      "Deadline": {
        "description": "Contractual or SLA deadline for a step.\nSeparate from 'duration' which is the expected time for simulation.\n\nUse deadline for:\n- External party response SLAs\n- Contractual completion requirements\n- Regulatory or procedural timeframes\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "limit"
        ],
        "properties": {
          "limit": {
            "description": "Maximum allowed duration from step start.",
            "$ref": "../common/defs.schema.yaml#/$defs/DurationString"
          },
          "procedureRef": {
            "description": 'Reference to external procedure, regulation, or SLA.\n\nExamples:\n  - "Building permit review - \xA7123 Stavebn\xED z\xE1kon"\n  - "SLA-RESP-4H"\n  - "Contract clause 5.2.1"\n  - "GDPR Art.17 - Right to erasure"\n',
            "type": "string"
          },
          "onBreach": {
            "description": "Actions when deadline is breached.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "notify": {
                "description": "Actor IDs to notify on breach.",
                "type": "array",
                "items": {
                  "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
                }
              },
              "outcome": {
                "description": "Outcome to apply when deadline breaches.\nRecommended: use 'timeout' from StandardOutcome.\n",
                "type": "string"
              }
            }
          }
        }
      },
      "Step": {
        "description": "A node in the work graph.\n\nSteps can represent:\n- action: work that transforms inputs to outputs\n- milestone: significant point in the process\n- decision: routing decision point\n- subprocess: grouped work (can contain nested steps)\n- wait: waiting for external event\n- handoff: transfer to another actor\n- start: process entry point\n- end: process exit point\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "kind"
        ],
        "properties": {
          "name": {
            "description": 'Short label for diagrams (3-7 words).\n\nExamples:\n  - "Review Purchase Order"\n  - "Approve Budget"\n  - "Dispatch Technician"\n',
            "type": "string"
          },
          "kind": {
            "description": "Step type:\n- action: work that transforms inputs to outputs\n- milestone: significant checkpoint in the process\n- decision: routing decision point (gateway)\n- subprocess: grouped work with nested steps\n- wait: waiting for external event or time\n- handoff: transfer to another actor/team\n- start: process entry point\n- end: process exit point\n",
            "type": "string",
            "enum": [
              "action",
              "milestone",
              "decision",
              "subprocess",
              "wait",
              "handoff",
              "start",
              "end"
            ]
          },
          "systems": {
            "description": "Software systems used in this step.\nReferences actors with type: system.\n\nFor physical equipment, use 'equipment' instead.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
            }
          },
          "equipment": {
            "description": "Physical equipment used in this step.\n\nEquipment is separate from systems because:\n1. Equipment requires operators with specific skills\n2. Equipment has physical location constraints\n3. Simulation matches person with skill + available equipment\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/EquipmentRef"
            }
          },
          "guard": {
            "description": 'Condition for this step to execute.\n\nExamples:\n  guard: "orderValue > 50000"\n  guard: isHighValueEnterprise\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          },
          "duration": {
            "description": 'Elapsed time for this step.\n\nExamples:\n  duration: "2d"\n  duration: { expr: "tri(d(1),d(2),d(4))" }\n  duration: { expr: adjustedDuration }\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "effort": {
            "description": 'Work time (may differ from duration if waiting involved).\n\nExamples:\n  effort: "4h"\n  effort: { expr: "baseEffort * 1.5" }\n',
            "$ref": "../common/defs.schema.yaml#/$defs/Duration"
          },
          "fixedCost": {
            "description": "Fixed cost for outsourced/third-party work.\nIf not specified, cost is calculated from actor rates * effort.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "inputs": {
            "description": "Entities or documents consumed by this step.\nInput references are read-only and don't change document state.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/DataObjectInput"
            }
          },
          "outputs": {
            "description": "Entities or documents produced or modified by this step.\nDocument lifecycle progresses based on output ordering.\n",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/DataObjectOutput"
            }
          },
          "messages": {
            "description": "Messages sent during this step (for sequence diagrams).",
            "type": "array",
            "items": {
              "$ref": "#/$defs/Message"
            }
          },
          "raci": {
            "description": "RACI matrix for this step.",
            "$ref": "#/$defs/RACI"
          },
          "steps": {
            "description": "Inline nested steps (for subprocess kind).\nMutually exclusive with 'processRef'.\n",
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^ST\\d{3,}$": {
                "$ref": "#/$defs/Step"
              }
            }
          },
          "processRef": {
            "description": "Reference to an existing process (for subprocess kind).\nMutually exclusive with 'steps'.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "loop": {
            "description": "Rework/iteration configuration.",
            "$ref": "#/$defs/Loop"
          },
          "requiresSkills": {
            "description": "Skills required to perform this step.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/SkillRequirement"
            }
          },
          "annotations": {
            "description": "Notes and markers attached to this step.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/Annotation"
            }
          },
          "trigger": {
            "description": "When this step is activated.",
            "$ref": "#/$defs/StepTrigger"
          },
          "batch": {
            "description": "Batching configuration for batch processing.",
            "$ref": "#/$defs/Batch"
          },
          "approval": {
            "description": "Approval configuration for steps requiring sign-off.\nWhen present, this step is treated as an approval gate.\n",
            "$ref": "#/$defs/Approval"
          },
          "review": {
            "description": "Review configuration for gathering non-blocking feedback.\nWhen reviewers omitted, defaults to raci.consulted.\n",
            "$ref": "#/$defs/Review"
          },
          "notifications": {
            "description": "Notifications sent at step lifecycle events.\nWhen recipients omitted, defaults to raci.informed.\n",
            "type": "array",
            "items": {
              "$ref": "#/$defs/Notification"
            }
          },
          "deadline": {
            "description": "Contractual or SLA deadline for this step.",
            "$ref": "#/$defs/Deadline"
          },
          "constraint": {
            "description": "Schedule constraint type for project planning.\n- asap: as soon as possible (default)\n- alap: as late as possible\n- mustStartOn: must start on constraintDate\n- mustFinishOn: must finish on constraintDate\n- startNoEarlierThan: cannot start before constraintDate\n- finishNoLaterThan: must finish by constraintDate\n",
            "type": "string",
            "enum": [
              "asap",
              "alap",
              "mustStartOn",
              "mustFinishOn",
              "startNoEarlierThan",
              "finishNoLaterThan"
            ]
          },
          "constraintDate": {
            "description": "Date for schedule constraint (ISO 8601).",
            "$ref": "../common/defs.schema.yaml#/$defs/DateString"
          },
          "description": {
            "description": "Longer description for reports and documentation.",
            "type": "string"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Block": {
        "description": 'Control flow block for grouping steps with execution semantics.\n\nOPERATORS:\n- seq: sequential execution (default)\n- par: parallel execution (all branches run concurrently)\n- alt: alternative paths (exactly one branch based on guards)\n- opt: optional execution (executes if guard is true)\n- loop: repeated execution\n- break: exit enclosing block\n\nBLOCKS vs PHASES:\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502 BLOCKS (BK###)          \u2502 PHASES (PH###)          \u2502\n\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 Purpose     \u2502 Execution semantics     \u2502 Organizational view     \u2502\n\u2502 Operators   \u2502 par, alt, loop, opt     \u2502 lifecycle, delivery     \u2502\n\u2502 Affects     \u2502 Routing & scheduling    \u2502 Nothing (metadata only) \u2502\n\u2502 Question    \u2502 "How does this run?"    \u2502 "What stage is this?"   \u2502\n\u2502 Simulation  \u2502 Yes, changes behavior   \u2502 No effect               \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "description": "Unique block ID (BK### pattern).",
            "type": "string",
            "pattern": "^BK\\d{3,}$"
          },
          "name": {
            "description": "Human-readable block name.",
            "type": "string"
          },
          "operator": {
            "description": "Block operator defining execution semantics.\n- seq: sequential (default)\n- par: parallel\n- alt: alternative paths\n- opt: optional\n- loop: repeated\n- break: exit enclosing block\n",
            "type": "string",
            "enum": [
              "seq",
              "par",
              "alt",
              "opt",
              "loop",
              "break"
            ],
            "default": "seq"
          },
          "guard": {
            "description": "Condition for opt/alt/loop blocks.\nFor loop operator: loop continues while guard is true.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/Expression"
          },
          "maxIterations": {
            "description": "Maximum iterations for loop operator.\nPrevents infinite loops in simulation.\n",
            "type": "integer",
            "minimum": 1
          },
          "steps": {
            "description": "Step IDs in this block.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/StepRef"
            }
          },
          "operands": {
            "description": "Nested blocks (for alt branches or parallel regions).",
            "type": "array",
            "items": {
              "$ref": "#/$defs/Block"
            }
          },
          "annotations": {
            "description": "Notes and markers attached to this block.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/Annotation"
            }
          }
        }
      }
    }
  },
  "strategy": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/strategy.fragment.yaml",
    "title": "UBML Strategy Fragment",
    "description": "Strategic modeling elements that connect business processes to\norganizational capabilities and value delivery.\n\nThis fragment defines:\n- Value Streams: End-to-end value creation flows\n- Capabilities: What the organization can do\n- Products: Tangible offerings to customers\n- Services: Intangible offerings to customers\n- Portfolios: Groupings of products/services/capabilities\n",
    "$defs": {
      "ValueStream": {
        "description": 'An end-to-end sequence of activities that delivers value to a customer.\n\nValue streams differ from processes:\n- VALUE STREAMS are customer-focused, end-to-end flows\n- PROCESSES are operational, may be internal\n\nA value stream often spans multiple processes and may cross\norganizational boundaries.\n\nEXAMPLES:\n- "Order to Cash" - from order to payment collection\n- "Hire to Retire" - employee lifecycle\n- "Concept to Market" - product development\n- "Issue to Resolution" - customer support\n\nUSAGE:\nValue streams provide strategic context for process optimization.\nThey help answer "why does this process exist?" and "who cares?"\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": 'Value stream name.\nOften uses "X to Y" naming convention.\n',
            "type": "string"
          },
          "description": {
            "description": "Detailed description of the value stream.",
            "type": "string"
          },
          "customer": {
            "description": "The customer or beneficiary of this value stream.\nCan be external customer or internal stakeholder.\n",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "triggeringEvent": {
            "description": 'What triggers/starts this value stream.\n\nExample: "Customer places order", "Employee submits request"\n',
            "type": "string"
          },
          "endingEvent": {
            "description": 'What marks completion of this value stream.\n\nExample: "Payment received", "Issue resolved"\n',
            "type": "string"
          },
          "stages": {
            "description": "High-level stages of the value stream.\nEach stage may correspond to one or more processes.\n",
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "name"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "processes": {
                  "type": "array",
                  "items": {
                    "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
                  }
                }
              }
            }
          },
          "valueOutcome": {
            "description": 'The value delivered at the end of this stream.\n\nExample: "Customer receives working product on time"\n',
            "type": "string"
          },
          "kpis": {
            "description": "Key Performance Indicators for this value stream.\n",
            "type": "array",
            "items": {
              "$ref": "metrics.fragment.yaml#/$defs/KPI"
            }
          },
          "owner": {
            "description": "Value stream owner/sponsor.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Capability": {
        "description": 'An organizational capability - what the organization can do.\n\nCapabilities abstract away HOW things are done (processes) to focus\non WHAT the organization can do. This enables:\n- Strategic planning independent of current implementation\n- Gap analysis and capability development planning\n- Sourcing decisions (build vs. buy vs. outsource)\n\nCAPABILITY vs PROCESS:\n- Capability: "We can fulfill orders" (what)\n- Process: "Order fulfillment process" (how)\n\nCapabilities are typically organized in a hierarchy (capability map).\n\nMATURITY LEVELS:\n1 - Initial: Ad-hoc, inconsistent\n2 - Repeatable: Basic processes in place\n3 - Defined: Standardized, documented\n4 - Managed: Measured, controlled\n5 - Optimizing: Continuously improving\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": 'Capability name.\nShould start with a verb (action-oriented).\n\nExamples:\n  - "Manage Customer Relationships"\n  - "Process Orders"\n  - "Develop Products"\n',
            "type": "string"
          },
          "description": {
            "description": "Detailed capability description.",
            "type": "string"
          },
          "level": {
            "description": "Hierarchy level in the capability map.\n1 = Top-level (business area)\n2 = Mid-level (capability group)\n3 = Detailed (specific capability)\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          },
          "parent": {
            "description": "Parent capability for hierarchy.",
            "$ref": "../common/defs.schema.yaml#/$defs/CapabilityRef"
          },
          "children": {
            "description": "Child capabilities.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/CapabilityRef"
            }
          },
          "maturity": {
            "description": "Current maturity level (1-5).\nBased on capability maturity model.\n",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          },
          "targetMaturity": {
            "description": "Target maturity level.",
            "type": "integer",
            "minimum": 1,
            "maximum": 5
          },
          "strategicImportance": {
            "description": "Strategic importance classification:\n- differentiating: Competitive advantage, must excel\n- essential: Must be good, but not differentiating\n- commodity: Table stakes, can be outsourced\n",
            "type": "string",
            "enum": [
              "differentiating",
              "essential",
              "commodity"
            ]
          },
          "processes": {
            "description": "Processes that implement this capability.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
            }
          },
          "skills": {
            "description": "Skills required for this capability.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/SkillRef"
            }
          },
          "systems": {
            "description": "IT systems that enable this capability.\nFree-form list of system names.\n",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "owner": {
            "description": "Capability owner.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Product": {
        "description": "A product offered by the organization.\n\nProducts are tangible offerings that can be:\n- Physical goods (manufactured items)\n- Digital products (software, digital content)\n- Composite products (bundles, kits)\n\nPRODUCT vs SERVICE:\n- Products are tangible, can be inventoried\n- Services are intangible, consumed when delivered\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Product name.",
            "type": "string"
          },
          "description": {
            "description": "Product description.",
            "type": "string"
          },
          "sku": {
            "description": "Stock Keeping Unit or product code.",
            "type": "string"
          },
          "category": {
            "description": "Product category or type.",
            "type": "string"
          },
          "lifecycle": {
            "description": "Product lifecycle stage.\n",
            "type": "string",
            "enum": [
              "concept",
              "development",
              "introduction",
              "growth",
              "maturity",
              "decline",
              "retired"
            ]
          },
          "price": {
            "description": "Base price.",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "cost": {
            "description": "Unit cost.",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "margin": {
            "description": "Profit margin percentage.",
            "type": "number",
            "minimum": 0,
            "maximum": 100
          },
          "requiredCapabilities": {
            "description": "Capabilities needed to deliver this product.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/CapabilityRef"
            }
          },
          "processes": {
            "description": "Processes involved in delivering this product.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
            }
          },
          "relatedProducts": {
            "description": "Related or complementary products.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ProductRef"
            }
          },
          "owner": {
            "description": "Product owner/manager.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Service": {
        "description": "A service offered by the organization.\n\nServices are intangible offerings characterized by:\n- Consumed when delivered (no inventory)\n- Often involve customer interaction\n- Quality depends on delivery\n\nEXAMPLES:\n- Consulting, training, support\n- Maintenance, repair, installation\n- Subscription services\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "description": "Service name.",
            "type": "string"
          },
          "description": {
            "description": "Service description.",
            "type": "string"
          },
          "type": {
            "description": "Service type classification.\n",
            "type": "string",
            "examples": [
              "professional",
              "managed",
              "support",
              "subscription",
              "on-demand"
            ]
          },
          "deliveryModel": {
            "description": 'How the service is delivered.\n\nExamples: "on-site", "remote", "hybrid", "self-service"\n',
            "type": "string"
          },
          "sla": {
            "description": 'Service Level Agreement summary.\n\nExample: "4-hour response, 99.9% uptime"\n',
            "type": "string"
          },
          "pricing": {
            "description": 'Pricing model.\n\nExample: "hourly", "fixed", "subscription", "outcome-based"\n',
            "type": "string"
          },
          "basePrice": {
            "description": "Base price for the service.",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "requiredCapabilities": {
            "description": "Capabilities needed to deliver this service.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/CapabilityRef"
            }
          },
          "processes": {
            "description": "Processes involved in delivering this service.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
            }
          },
          "relatedServices": {
            "description": "Related or bundled services.",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ServiceRef"
            }
          },
          "owner": {
            "description": "Service owner/manager.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      },
      "Portfolio": {
        "description": "A grouping of products, services, or capabilities.\n\nPortfolios enable:\n- Strategic grouping and management\n- Investment prioritization\n- Lifecycle management across offerings\n\nPORTFOLIO TYPES:\n- product: Product portfolio\n- service: Service portfolio\n- capability: Capability portfolio\n- project: Project portfolio\n",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "type"
        ],
        "properties": {
          "name": {
            "description": "Portfolio name.",
            "type": "string"
          },
          "description": {
            "description": "Portfolio description.",
            "type": "string"
          },
          "type": {
            "description": "Portfolio type classification.",
            "type": "string",
            "enum": [
              "product",
              "service",
              "capability",
              "project"
            ]
          },
          "products": {
            "description": "Products in this portfolio (for type: product).",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ProductRef"
            }
          },
          "services": {
            "description": "Services in this portfolio (for type: service).",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/ServiceRef"
            }
          },
          "capabilities": {
            "description": "Capabilities in this portfolio (for type: capability).",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/CapabilityRef"
            }
          },
          "strategy": {
            "description": 'Portfolio strategy description.\n\nExample: "Focus on high-margin enterprise products"\n',
            "type": "string"
          },
          "investmentBudget": {
            "description": "Total investment budget for this portfolio.",
            "$ref": "../common/defs.schema.yaml#/$defs/Money"
          },
          "owner": {
            "description": "Portfolio owner/manager.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  },
  "view": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://ubml.io/schemas/1.0/fragments/view.fragment.yaml",
    "title": "UBML View Fragment",
    "description": "Views are custom perspectives on the process model that highlight\nspecific aspects for different audiences or purposes.\n\nViews enable:\n- Filtered views for specific stakeholders\n- Focused diagrams for presentations\n- Comparison views (as-is vs. to-be)\n- Custom layouts and styling\n",
    "$defs": {
      "ViewFilter": {
        "description": 'A filter condition to include/exclude elements from a view.\n\nFilters can target:\n- Specific element IDs\n- Tags\n- Types (step kinds, actor types, etc.)\n- Custom properties\n\nEXAMPLES:\n\nFilter by tag:\n  - type: tag\n    include: ["customer-facing", "critical"]\n\nFilter by step kind:\n  - type: kind\n    property: kind\n    include: ["task", "subprocess"]\n\nFilter by specific IDs:\n  - type: id\n    include: ["ST001", "ST002", "ST003"]\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "type"
        ],
        "properties": {
          "type": {
            "description": "Filter type:\n- tag: Filter by tags\n- kind: Filter by element kind/type\n- id: Filter by specific IDs\n- property: Filter by custom property value\n",
            "type": "string",
            "enum": [
              "tag",
              "kind",
              "id",
              "property"
            ]
          },
          "property": {
            "description": "Property name (for property filter type).",
            "type": "string"
          },
          "include": {
            "description": "Values to include.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "exclude": {
            "description": "Values to exclude.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "operator": {
            "description": "How to combine include/exclude:\n- and: All conditions must match\n- or: Any condition matches\n",
            "type": "string",
            "enum": [
              "and",
              "or"
            ],
            "default": "or"
          }
        }
      },
      "ViewStyling": {
        "description": "Custom styling rules for elements in a view.\n\nStyling enables visual differentiation based on:\n- Element types\n- Tags\n- Properties\n- Status or state\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "selector": {
            "description": 'CSS-like selector for targeting elements.\n\nExamples:\n  "[kind=task]" - All tasks\n  "[tag=critical]" - Elements with critical tag\n  "#ST001" - Specific element\n',
            "type": "string"
          },
          "styles": {
            "description": "Styles to apply.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "backgroundColor": {
                "type": "string"
              },
              "borderColor": {
                "type": "string"
              },
              "borderWidth": {
                "type": "integer"
              },
              "textColor": {
                "type": "string"
              },
              "fontWeight": {
                "type": "string",
                "enum": [
                  "normal",
                  "bold"
                ]
              },
              "opacity": {
                "type": "number",
                "minimum": 0,
                "maximum": 1
              },
              "shape": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              }
            }
          }
        }
      },
      "ViewLayout": {
        "description": "Layout configuration for the view.\n",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "description": "Layout algorithm:\n- auto: Automatic layout\n- horizontal: Left-to-right flow\n- vertical: Top-to-bottom flow\n- hierarchical: Layered hierarchy\n- manual: User-defined positions\n",
            "type": "string",
            "enum": [
              "auto",
              "horizontal",
              "vertical",
              "hierarchical",
              "manual"
            ],
            "default": "auto"
          },
          "direction": {
            "description": "Primary flow direction.",
            "type": "string",
            "enum": [
              "left-to-right",
              "right-to-left",
              "top-to-bottom",
              "bottom-to-top"
            ]
          },
          "spacing": {
            "description": "Spacing between elements.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "horizontal": {
                "type": "integer",
                "minimum": 0
              },
              "vertical": {
                "type": "integer",
                "minimum": 0
              }
            }
          },
          "swimlanes": {
            "description": "Swimlane configuration.\nGroups elements by actor or other property.\n",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "enabled": {
                "type": "boolean"
              },
              "groupBy": {
                "description": "Property to group by (actor, phase, etc.).",
                "type": "string"
              },
              "orientation": {
                "type": "string",
                "enum": [
                  "horizontal",
                  "vertical"
                ]
              }
            }
          },
          "positions": {
            "description": "Manual positions for elements (layout: manual).\nKeyed by element ID.\n",
            "type": "object",
            "additionalProperties": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "x": {
                  "type": "number"
                },
                "y": {
                  "type": "number"
                },
                "width": {
                  "type": "number"
                },
                "height": {
                  "type": "number"
                }
              }
            }
          }
        }
      },
      "View": {
        "description": 'A custom view or diagram configuration.\n\nViews provide different perspectives on the same underlying model:\n- Executive summary (high-level, key metrics)\n- Detailed operational view (all steps, RACI)\n- System integration view (systems, data flows)\n- Compliance view (controls, approvals)\n\nEXAMPLE - Executive Summary View:\n\n  VW001:\n    name: "Executive Summary"\n    description: "High-level process overview for leadership"\n    type: process\n    process: PR001\n    \n    filters:\n      - type: kind\n        include: [milestone, subprocess, event]\n    \n    show:\n      steps: true\n      links: true\n      actors: false\n      annotations: false\n    \n    styling:\n      - selector: "[tag=critical]"\n        styles:\n          backgroundColor: "#FF0000"\n          fontWeight: bold\n\nEXAMPLE - Comparison View:\n\n  VW002:\n    name: "As-Is vs To-Be Comparison"\n    type: comparison\n    baseScenario: SC001\n    compareScenario: SC002\n    highlightDifferences: true\n',
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "type"
        ],
        "properties": {
          "name": {
            "description": "View name.",
            "type": "string"
          },
          "description": {
            "description": "View description and purpose.",
            "type": "string"
          },
          "type": {
            "description": "View type:\n- process: Process diagram view\n- capability: Capability map view\n- value-stream: Value stream map\n- entity: Entity relationship diagram\n- actor: Actor/organization view\n- comparison: Side-by-side comparison\n- metrics: Metrics dashboard\n- custom: Custom view type\n",
            "type": "string",
            "enum": [
              "process",
              "capability",
              "value-stream",
              "entity",
              "actor",
              "comparison",
              "metrics",
              "custom"
            ]
          },
          "process": {
            "description": "Process to display (for process views).",
            "$ref": "../common/defs.schema.yaml#/$defs/ProcessRef"
          },
          "valueStream": {
            "description": "Value stream to display (for value-stream views).",
            "$ref": "../common/defs.schema.yaml#/$defs/ValueStreamRef"
          },
          "filters": {
            "description": "Filters to apply to the view.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ViewFilter"
            }
          },
          "show": {
            "description": "What elements to show/hide.",
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "steps": {
                "type": "boolean",
                "default": true
              },
              "links": {
                "type": "boolean",
                "default": true
              },
              "actors": {
                "type": "boolean",
                "default": true
              },
              "phases": {
                "type": "boolean",
                "default": true
              },
              "blocks": {
                "type": "boolean",
                "default": true
              },
              "annotations": {
                "type": "boolean",
                "default": true
              },
              "metrics": {
                "type": "boolean",
                "default": false
              },
              "timing": {
                "type": "boolean",
                "default": false
              }
            }
          },
          "layout": {
            "description": "Layout configuration.",
            "$ref": "#/$defs/ViewLayout"
          },
          "styling": {
            "description": "Custom styling rules.",
            "type": "array",
            "items": {
              "$ref": "#/$defs/ViewStyling"
            }
          },
          "baseScenario": {
            "description": "Base scenario for comparison views.",
            "$ref": "../common/defs.schema.yaml#/$defs/ScenarioRef"
          },
          "compareScenario": {
            "description": "Comparison scenario.",
            "$ref": "../common/defs.schema.yaml#/$defs/ScenarioRef"
          },
          "highlightDifferences": {
            "description": "Whether to highlight differences in comparison.",
            "type": "boolean",
            "default": true
          },
          "kpis": {
            "description": "KPIs to display (for metrics views).",
            "type": "array",
            "items": {
              "$ref": "../common/defs.schema.yaml#/$defs/KPIRef"
            }
          },
          "audience": {
            "description": 'Intended audience for this view.\n\nExamples: "executive", "operations", "IT", "compliance"\n',
            "type": "string"
          },
          "purpose": {
            "description": 'Purpose of this view.\n\nExamples: "decision-making", "training", "audit", "presentation"\n',
            "type": "string"
          },
          "lastGenerated": {
            "description": "When this view was last generated.",
            "type": "string",
            "format": "date-time"
          },
          "owner": {
            "description": "View owner.",
            "$ref": "../common/defs.schema.yaml#/$defs/ActorRef"
          },
          "tags": {
            "description": "Tags for filtering and views.",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "custom": {
            "description": "User-defined custom fields.",
            "$ref": "../common/defs.schema.yaml#/$defs/CustomFields"
          }
        }
      }
    }
  }
};
function getAllSchemasById() {
  const schemas2 = /* @__PURE__ */ new Map();
  const addSchema = (schema) => {
    const id = schema.$id;
    if (id) {
      schemas2.set(id, schema);
    }
  };
  addSchema(rootSchema);
  addSchema(defsSchema);
  Object.values(documentSchemas).forEach(addSchema);
  Object.values(fragmentSchemas).forEach(addSchema);
  return schemas2;
}

// src/validator.ts
function convertAjvErrors(ajvErrors) {
  if (!ajvErrors) return [];
  return ajvErrors.map((err) => ({
    message: err.message ?? "Unknown validation error",
    path: err.instancePath || void 0,
    code: err.keyword
  }));
}
async function createValidator() {
  const [{ default: Ajv2020 }, { default: addFormats }] = await Promise.all([
    import("ajv/dist/2020.js"),
    import("ajv-formats")
  ]);
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false
  });
  addFormats(ajv);
  const allSchemas = getAllSchemasById();
  for (const [id, schema] of allSchemas) {
    try {
      ajv.addSchema(schema);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (!errMsg.includes("already exists")) {
        console.warn(`Warning: Could not add schema ${id}: ${errMsg}`);
      }
    }
  }
  const validatorCache = /* @__PURE__ */ new Map();
  function getOrCompileValidator(documentType) {
    let validate2 = validatorCache.get(documentType);
    if (!validate2) {
      const schema = documentSchemas[documentType];
      if (!schema) {
        throw new Error(`Unknown document type: ${documentType}`);
      }
      validate2 = ajv.compile(schema);
      validatorCache.set(documentType, validate2);
    }
    return validate2;
  }
  const validator = {
    validate(content, documentType) {
      const validate2 = getOrCompileValidator(documentType);
      const valid = validate2(content);
      return {
        valid,
        errors: valid ? [] : convertAjvErrors(validate2.errors),
        warnings: []
      };
    },
    validateDocument(doc) {
      const documentType = doc.meta.type;
      if (!documentType) {
        return {
          valid: false,
          errors: [{
            message: `Could not detect document type. Expected pattern: *.{type}.ubml.yaml`,
            line: 1,
            column: 1
          }],
          warnings: []
        };
      }
      const validate2 = getOrCompileValidator(documentType);
      const valid = validate2(doc.content);
      if (valid) {
        return { valid: true, errors: [], warnings: [] };
      }
      const errors = (validate2.errors ?? []).map((err) => {
        const path2 = err.instancePath || void 0;
        const loc = path2 ? doc.getSourceLocation(path2) : void 0;
        return {
          message: err.message ?? "Unknown validation error",
          path: path2,
          code: err.keyword,
          line: loc?.line,
          column: loc?.column
        };
      });
      return { valid: false, errors, warnings: [] };
    }
  };
  return validator;
}
var defaultValidator = null;
async function getValidator() {
  if (!defaultValidator) {
    defaultValidator = await createValidator();
  }
  return defaultValidator;
}
async function parseAndValidate(content, filename) {
  const parseResult = parse(content, filename);
  if (!parseResult.ok || !parseResult.document) {
    return {
      ...parseResult,
      validation: void 0
    };
  }
  const validator = await getValidator();
  const validation = validator.validateDocument(parseResult.document);
  return {
    ...parseResult,
    validation
  };
}
async function validate(documents, options = {}) {
  const { extractDefinedIds: extractDefinedIds2, extractReferencedIds: extractReferencedIds2 } = await Promise.resolve().then(() => (init_semantic_validator(), semantic_validator_exports));
  const errors = [];
  const warnings = [];
  const validator = await getValidator();
  for (const doc of documents) {
    const schemaResult = validator.validateDocument(doc);
    errors.push(...schemaResult.errors);
    warnings.push(...schemaResult.warnings);
  }
  const definedIds = /* @__PURE__ */ new Map();
  const referencedIds = /* @__PURE__ */ new Map();
  for (const doc of documents) {
    const filepath = doc.meta.filename || "unknown";
    const ids = extractDefinedIds2(doc.content, filepath);
    for (const [id, info] of ids) {
      if (definedIds.has(id)) {
        const existing = definedIds.get(id);
        errors.push({
          code: "ubml/duplicate-id",
          message: `ID "${id}" is defined in multiple files: ${existing.filepath} and ${info.filepath}`,
          filepath: info.filepath,
          path: info.path
        });
      } else {
        definedIds.set(id, info);
      }
    }
    const refs = extractReferencedIds2(doc.content, filepath);
    for (const [id, locations] of refs) {
      const existing = referencedIds.get(id) ?? [];
      existing.push(...locations.map((l) => l.filepath));
      referencedIds.set(id, existing);
    }
  }
  for (const [id, filepaths] of referencedIds) {
    if (!definedIds.has(id)) {
      const uniqueFiles = [...new Set(filepaths)];
      for (const filepath of uniqueFiles) {
        errors.push({
          code: "ubml/undefined-reference",
          message: `Reference to undefined ID "${id}"`,
          filepath
        });
      }
    }
  }
  if (!options.suppressUnusedWarnings) {
    for (const [id, info] of definedIds) {
      if (!referencedIds.has(id)) {
        const doc = documents.find((d) => d.meta.filename === info.filepath);
        const jsonPointerPath = "/" + info.path.replace(/\./g, "/");
        const location = doc?.getSourceLocation(jsonPointerPath);
        warnings.push({
          code: "ubml/unused-id",
          message: `ID "${id}" is defined but never referenced`,
          filepath: info.filepath,
          path: info.path,
          ...location && {
            line: location.line,
            column: location.column
          }
        });
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// src/index.ts
init_semantic_validator();

// src/serializer.ts
init_esm_shims();
import { stringify } from "yaml";
var DEFAULT_OPTIONS = {
  indent: 2,
  lineWidth: 120,
  flowLevel: -1,
  // Never use flow style
  trailingNewline: true,
  sortKeys: false,
  quoteStyle: null
};
function serialize(content, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const yamlOptions = {
    indent: opts.indent,
    lineWidth: opts.lineWidth,
    minContentWidth: 0,
    defaultKeyType: "PLAIN",
    defaultStringType: opts.quoteStyle === "single" ? "QUOTE_SINGLE" : opts.quoteStyle === "double" ? "QUOTE_DOUBLE" : "PLAIN",
    sortMapEntries: opts.sortKeys
  };
  let yaml = stringify(content, yamlOptions);
  if (opts.trailingNewline && !yaml.endsWith("\n")) {
    yaml += "\n";
  } else if (!opts.trailingNewline && yaml.endsWith("\n")) {
    yaml = yaml.slice(0, -1);
  }
  return yaml;
}

// src/schemas.ts
init_esm_shims();
init_metadata();
var schemas = {
  /**
   * UBML schema version.
   */
  version: SCHEMA_VERSION,
  /**
   * Get a document schema by type.
   * 
   * @example
   * ```typescript
   * const schema = schemas.document('process');
   * const actorsSchema = schemas.document('actors');
   * ```
   */
  document(type) {
    const schema = documentSchemas[type];
    if (!schema) {
      throw new Error(`Unknown document type: ${type}`);
    }
    return schema;
  },
  /**
   * Get a fragment schema by name.
   * 
   * @example
   * ```typescript
   * const stepSchema = schemas.fragment('step');
   * ```
   */
  fragment(name) {
    const schema = fragmentSchemas[name];
    if (!schema) {
      throw new Error(`Unknown fragment: ${name}`);
    }
    return schema;
  },
  /**
   * Get the root UBML schema.
   */
  root() {
    return rootSchema;
  },
  /**
   * Get the common definitions schema.
   */
  defs() {
    return defsSchema;
  },
  /**
   * Get all schemas as a Map keyed by $id.
   * 
   * Useful for configuring Ajv's loadSchema callback.
   * 
   * @example
   * ```typescript
   * const allSchemas = schemas.all();
   * const ajv = new Ajv({
   *   loadSchema: async (uri) => allSchemas.get(uri),
   * });
   * ```
   */
  all() {
    return getAllSchemasById();
  },
  /**
   * List all available document types.
   */
  documentTypes() {
    return DOCUMENT_TYPES;
  },
  /**
   * List all available fragment names.
   */
  fragmentNames() {
    return FRAGMENT_NAMES;
  }
};

// src/detect.ts
init_esm_shims();
init_metadata();

// src/types.ts
init_esm_shims();

// src/generated/types.ts
init_esm_shims();
function createRef(id) {
  return id;
}

// src/index.ts
init_metadata();

// src/constants.ts
init_esm_shims();
var VERSION = "1.0.0";
var PACKAGE_NAME = "ubml";
var REPOSITORY_URL = "https://github.com/TALXIS/ubml";
export {
  ALL_ID_PATTERN,
  DOCUMENT_MULTIPLICITY,
  DOCUMENT_TYPES,
  DURATION_PATTERN,
  FRAGMENT_NAMES,
  ID_PATTERNS,
  ID_PREFIXES,
  PACKAGE_NAME,
  REFERENCE_FIELDS,
  REPOSITORY_URL,
  SCHEMA_PATHS,
  SCHEMA_VERSION,
  TIME_PATTERN,
  VERSION,
  createRef,
  createValidator,
  detectDocumentType,
  detectDocumentTypeFromContent,
  extractDefinedIds,
  extractReferencedIds,
  getDocumentMultiplicity,
  getElementTypeFromId,
  getSchemaPathForDocumentType,
  getSchemaPathForFileSuffix,
  getUBMLFilePatterns,
  getValidator,
  isDocumentType,
  isReferenceField,
  isUBMLFile,
  isValidId,
  parse,
  parseAndValidate,
  schemas,
  serialize,
  validate,
  validateDocuments,
  validateId,
  validateWorkspaceStructure
};
