// src/generated/metadata.ts
var DOCUMENT_TYPES = [
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
function isDocumentType(type) {
  return DOCUMENT_TYPES.includes(type);
}
var FRAGMENT_NAMES = [
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
var SCHEMA_VERSION = "1.0";
var SCHEMA_PATHS = {
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
function getSchemaPathForDocumentType(type) {
  return SCHEMA_PATHS.documents[type];
}
var ID_PREFIXES = {
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
var ID_PATTERNS = Object.fromEntries(
  Object.entries(ID_PREFIXES).map(([prefix, type]) => [
    type,
    new RegExp(`^${prefix}\\d{3,}$`)
  ])
);
var ALL_ID_PATTERN = new RegExp(
  `^(${Object.keys(ID_PREFIXES).join("|")})\\d{3,}$`
);
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
var REFERENCE_FIELDS = [
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
function isReferenceField(fieldName) {
  return REFERENCE_FIELDS.includes(fieldName);
}
var DURATION_PATTERN = /^[0-9]+(\.[0-9]+)?(min|h|d|wk|mo)$/;
var TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/;
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
export {
  ALL_ID_PATTERN,
  DOCUMENT_TYPES,
  DURATION_PATTERN,
  FRAGMENT_NAMES,
  ID_PATTERNS,
  ID_PREFIXES,
  REFERENCE_FIELDS,
  SCHEMA_PATHS,
  SCHEMA_VERSION,
  TIME_PATTERN,
  detectDocumentType,
  detectDocumentTypeFromContent,
  getElementTypeFromId,
  getSchemaPathForDocumentType,
  getSchemaPathForFileSuffix,
  getUBMLFilePatterns,
  isDocumentType,
  isReferenceField,
  isUBMLFile,
  isValidId,
  validateId
};
