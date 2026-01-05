#!/usr/bin/env node

// src/cli/index.ts
import { Command as Command6 } from "commander";
import chalk6 from "chalk";
import { VERSION as VERSION2 } from "@ubml/core";

// src/cli/commands/validate.ts
import { Command } from "commander";
import { statSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { validateFile, validateWorkspace } from "@ubml/core/node";

// src/cli/formatters/common.ts
function groupMessagesByFile(result, options = {}) {
  const { includeWarnings = true } = options;
  const byFile = /* @__PURE__ */ new Map();
  for (const error of result.errors) {
    const existing = byFile.get(error.filepath) ?? { errors: [], warnings: [] };
    existing.errors.push(error);
    byFile.set(error.filepath, existing);
  }
  if (includeWarnings) {
    for (const warning of result.warnings) {
      const existing = byFile.get(warning.filepath) ?? { errors: [], warnings: [] };
      existing.warnings.push(warning);
      byFile.set(warning.filepath, existing);
    }
  }
  return byFile;
}
function formatLocation(message) {
  if (!message.line) return "";
  const column = message.column ?? 1;
  return `:${message.line}:${column}`;
}
function formatPath(message) {
  return message.path ? ` (${message.path})` : "";
}
var SUCCESS_MESSAGES = {
  allFilesValid: (count) => `\u2713 ${count} file${count === 1 ? "" : "s"} validated successfully`,
  noFilesFound: "No UBML files found to validate"
};
var ERROR_CODES = {
  PARSE_ERROR: "PARSE_ERROR",
  SCHEMA_ERROR: "SCHEMA_ERROR",
  REFERENCE_ERROR: "REFERENCE_ERROR",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  IO_ERROR: "IO_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
};

// src/cli/formatters/stylish.ts
function formatStylish(result, options = {}) {
  const { quiet = false } = options;
  const lines = [];
  const byFile = groupMessagesByFile(result, { includeWarnings: !quiet });
  for (const [filepath, messages] of byFile) {
    lines.push("");
    lines.push(filepath);
    for (const error of messages.errors) {
      const location = formatLocation(error);
      const path = formatPath(error);
      lines.push(`  ${location}  error  ${error.message}${path}`);
    }
    for (const warning of messages.warnings) {
      const location = formatLocation(warning);
      const path = formatPath(warning);
      lines.push(`  ${location}  warning  ${warning.message}${path}`);
    }
  }
  lines.push("");
  const errorCount = result.errors.length;
  const warningCount = quiet ? 0 : result.warnings.length;
  const problemCount = errorCount + warningCount;
  if (problemCount === 0) {
    lines.push(SUCCESS_MESSAGES.allFilesValid(result.filesValidated));
  } else {
    const parts = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`);
    }
    lines.push(`\u2717 ${problemCount} problem${problemCount === 1 ? "" : "s"} (${parts.join(", ")})`);
  }
  return lines.join("\n");
}

// src/cli/formatters/json.ts
function formatJson(result) {
  const output = {
    valid: result.valid,
    filesValidated: result.filesValidated,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors.map((e) => ({
      message: e.message,
      filepath: e.filepath,
      line: e.line,
      column: e.column,
      path: e.path,
      code: e.code
    })),
    warnings: result.warnings.map((w) => ({
      message: w.message,
      filepath: w.filepath,
      line: w.line,
      column: w.column,
      path: w.path,
      code: w.code
    }))
  };
  return JSON.stringify(output, null, 2);
}

// src/cli/formatters/sarif.ts
import { VERSION, PACKAGE_NAME, REPOSITORY_URL } from "@ubml/core";
function formatSarif(result) {
  const sarifResults = [];
  for (const error of result.errors) {
    sarifResults.push(createSarifResult(error, "error"));
  }
  for (const warning of result.warnings) {
    sarifResults.push(createSarifResult(warning, "warning"));
  }
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: PACKAGE_NAME,
            version: VERSION,
            informationUri: REPOSITORY_URL,
            rules: [
              {
                id: ERROR_CODES.SCHEMA_ERROR,
                shortDescription: { text: "UBML schema validation error" }
              },
              {
                id: ERROR_CODES.PARSE_ERROR,
                shortDescription: { text: "UBML parse error" }
              },
              {
                id: ERROR_CODES.REFERENCE_ERROR,
                shortDescription: { text: "Reference to undefined ID" }
              }
            ]
          }
        },
        results: sarifResults
      }
    ]
  };
  return JSON.stringify(sarif, null, 2);
}
function createSarifResult(message, level) {
  const sarifResult = {
    ruleId: message.code ?? (level === "error" ? ERROR_CODES.SCHEMA_ERROR : ERROR_CODES.UNKNOWN_ERROR),
    level,
    message: { text: message.message }
  };
  if (message.filepath) {
    sarifResult.locations = [
      {
        physicalLocation: {
          artifactLocation: { uri: message.filepath },
          region: message.line ? {
            startLine: message.line,
            startColumn: message.column
          } : void 0
        }
      }
    ];
  }
  return sarifResult;
}

// src/cli/commands/validate.ts
function formatStructureWarnings(result) {
  if (result.structureWarnings.length === 0) {
    return "";
  }
  const lines = [""];
  lines.push(chalk.bold.cyan("Workspace Structure Hints:"));
  for (const warning of result.structureWarnings) {
    lines.push(`  ${chalk.yellow("\u25CB")} ${warning.message}`);
    if (warning.suggestion) {
      lines.push(chalk.dim(`    \u2192 ${warning.suggestion}`));
    }
    if (warning.files && warning.files.length > 0) {
      lines.push(chalk.dim(`    Files: ${warning.files.join(", ")}`));
    }
  }
  return lines.join("\n");
}
function validateCommand() {
  const command = new Command("validate");
  command.description("Validate UBML documents against schemas").argument("<path>", "File or directory to validate").option("-f, --format <format>", "Output format: stylish, json, sarif", "stylish").option("-s, --strict", "Treat warnings as errors", false).option("-q, --quiet", "Only output errors", false).option("--suppress-unused", "Suppress unused-id warnings (useful for catalog documents)", false).action(async (path, options) => {
    const absolutePath = resolve(path);
    let isDirectory;
    try {
      isDirectory = statSync(absolutePath).isDirectory();
    } catch (err) {
      console.error(`Error: Path not found: ${absolutePath}`);
      process.exit(2);
    }
    const rawResult = isDirectory ? await validateWorkspace(absolutePath, { suppressUnusedWarnings: options.suppressUnused }) : await validateFile(absolutePath);
    const result = isDirectory ? {
      valid: rawResult.valid,
      errors: rawResult.files.flatMap(
        (f) => f.errors.map((e) => ({ ...e, filepath: f.path }))
      ),
      warnings: rawResult.files.flatMap(
        (f) => f.warnings.map((w) => ({ ...w, filepath: f.path }))
      ),
      filesValidated: rawResult.fileCount
    } : {
      valid: rawResult.valid,
      errors: rawResult.errors,
      warnings: rawResult.warnings,
      filesValidated: 1
    };
    if (options.strict) {
      result.errors.push(
        ...result.warnings.map((w) => ({ ...w }))
      );
      result.warnings = [];
      result.valid = result.errors.length === 0;
    }
    let output;
    switch (options.format) {
      case "json":
        output = formatJson(result);
        break;
      case "sarif":
        output = formatSarif(result);
        break;
      case "stylish":
      default:
        output = formatStylish(result, { quiet: options.quiet });
        break;
    }
    console.log(output);
    if (isDirectory && options.format === "stylish" && !options.quiet) {
      const workspaceResult = rawResult;
      const structureOutput = formatStructureWarnings(workspaceResult);
      if (structureOutput) {
        console.log(structureOutput);
      }
    }
    if (!result.valid && options.format === "stylish") {
      console.log();
      console.log(chalk.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
      console.log(chalk.dim("Tip: Fix errors in VS Code with real-time schema validation."));
      console.log(chalk.dim(`     Run: ${chalk.cyan("ubml docs vscode")} for setup guide.`));
    }
    process.exit(result.valid ? 0 : 1);
  });
  return command;
}

// src/cli/commands/init.ts
import { Command as Command2 } from "commander";
import chalk2 from "chalk";
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve as resolve2, basename } from "path";
import { serialize } from "@ubml/core";
import { DOCUMENT_TYPES, SCHEMA_VERSION, SCHEMA_PATHS } from "@ubml/core/generated/metadata";
var INDENT = "  ";
function success(text) {
  return chalk2.green(text);
}
function highlight(text) {
  return chalk2.yellow(text);
}
function code(text) {
  return chalk2.cyan(text);
}
function dim(text) {
  return chalk2.dim(text);
}
function toKebabCase(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function isDirectoryEmpty(dir) {
  try {
    const files = readdirSync(dir);
    return files.filter((f) => !f.startsWith(".")).length === 0;
  } catch {
    return true;
  }
}
function hasUbmlFiles(dir) {
  try {
    const files = readdirSync(dir);
    return files.some((f) => f.endsWith(".ubml.yaml") || f.endsWith(".ubml.yml"));
  } catch {
    return false;
  }
}
function generateVscodeSchemaSettings() {
  const settings = {};
  for (const type of DOCUMENT_TYPES) {
    const schemaUrl = `https://ubml.io/schemas/${SCHEMA_VERSION}/${SCHEMA_PATHS.documents[type]}`;
    settings[schemaUrl] = [
      `*.${type}.ubml.yaml`,
      // Full pattern: organization.actors.ubml.yaml
      `${type}.ubml.yaml`
      // Simple pattern: actors.ubml.yaml
    ];
  }
  return settings;
}
function generateVscodeExtensions() {
  return {
    recommendations: [
      "redhat.vscode-yaml"
      // YAML language support with schema validation
    ]
  };
}
function createDocumentTemplate(type, name) {
  const base = { ubml: SCHEMA_VERSION };
  switch (type) {
    case "workspace":
      return {
        ...base,
        name: name ?? "UBML Workspace",
        description: `${name ?? "UBML"} workspace - add your project description here`,
        status: "draft",
        organization: {
          name: "Your Organization",
          department: "Department"
        }
      };
    case "process":
      return {
        ...base,
        processes: {
          PR001: {
            name: "Sample Process",
            description: "A sample business process - replace with your actual process",
            level: 3,
            steps: {
              ST001: {
                name: "Start",
                kind: "event",
                description: "Process start event"
              },
              ST002: {
                name: "First Activity",
                kind: "action",
                description: "First activity - describe what happens here"
              },
              ST003: {
                name: "End",
                kind: "event",
                description: "Process end event"
              }
            },
            links: [
              { from: "ST001", to: "ST002" },
              { from: "ST002", to: "ST003" }
            ]
          }
        }
      };
    case "actors":
      return {
        ...base,
        actors: {
          AC001: {
            name: "Business User",
            type: "role",
            kind: "human",
            description: "Primary business user role - replace with actual roles"
          }
        }
      };
  }
}
function initNewDirectory(name, parentDir, options) {
  const workspaceDir = resolve2(parentDir, name);
  const safeName = toKebabCase(name);
  if (existsSync(workspaceDir) && !options.force) {
    if (!isDirectoryEmpty(workspaceDir)) {
      console.error(chalk2.red(`Error: Directory already exists and is not empty: ${workspaceDir}`));
      console.error();
      console.error("Options:");
      console.error(INDENT + "Use " + code("--force") + " to initialize anyway");
      console.error(INDENT + "Use " + code("ubml init --here") + " to initialize in current directory");
      process.exit(1);
    }
  }
  mkdirSync(workspaceDir, { recursive: true });
  createWorkspaceFiles(workspaceDir, safeName, name, options.minimal);
  printSuccessMessage(workspaceDir, name, false);
}
function initCurrentDirectory(options) {
  const workspaceDir = resolve2(".");
  const dirName = basename(workspaceDir);
  const safeName = toKebabCase(dirName);
  if (hasUbmlFiles(workspaceDir) && !options.force) {
    console.error(chalk2.red("Error: UBML files already exist in this directory."));
    console.error();
    console.error("Use " + code("--force") + " to reinitialize.");
    process.exit(1);
  }
  createWorkspaceFiles(workspaceDir, safeName, dirName, options.minimal);
  printSuccessMessage(workspaceDir, dirName, true);
}
function createWorkspaceFiles(workspaceDir, safeName, displayName, minimal) {
  const createdFiles = [];
  const workspaceFile = join(workspaceDir, `${safeName}.workspace.ubml.yaml`);
  writeFileSync(workspaceFile, serialize(createDocumentTemplate("workspace", displayName)));
  createdFiles.push(workspaceFile);
  if (!minimal) {
    const processFile = join(workspaceDir, "process.ubml.yaml");
    writeFileSync(processFile, serialize(createDocumentTemplate("process")));
    createdFiles.push(processFile);
    const actorsFile = join(workspaceDir, "actors.ubml.yaml");
    writeFileSync(actorsFile, serialize(createDocumentTemplate("actors")));
    createdFiles.push(actorsFile);
  }
  const vscodeDir = join(workspaceDir, ".vscode");
  mkdirSync(vscodeDir, { recursive: true });
  const settingsFile = join(vscodeDir, "settings.json");
  let existingSettings = {};
  if (existsSync(settingsFile)) {
    try {
      const content = readFileSync(settingsFile, "utf-8");
      existingSettings = JSON.parse(content);
    } catch {
    }
  }
  const newSettings = {
    ...existingSettings,
    "yaml.schemas": {
      ...existingSettings["yaml.schemas"] || {},
      ...generateVscodeSchemaSettings()
    }
  };
  writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
  createdFiles.push(settingsFile);
  const extensionsFile = join(vscodeDir, "extensions.json");
  if (!existsSync(extensionsFile)) {
    writeFileSync(extensionsFile, JSON.stringify(generateVscodeExtensions(), null, 2));
    createdFiles.push(extensionsFile);
  }
  console.log();
  console.log(chalk2.bold("Created files:"));
  for (const file of createdFiles) {
    const relativePath = file.replace(workspaceDir + "/", "");
    console.log(INDENT + success("\u2713") + " " + relativePath);
  }
}
function printSuccessMessage(workspaceDir, name, inPlace) {
  console.log();
  console.log(success("\u2713") + chalk2.bold(" Workspace initialized successfully!"));
  console.log();
  console.log(chalk2.bold.cyan("VS Code Setup"));
  console.log(dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log(INDENT + success("\u2713") + " Schema validation configured in " + code(".vscode/settings.json"));
  console.log(INDENT + success("\u2713") + " YAML extension recommended in " + code(".vscode/extensions.json"));
  console.log();
  console.log(chalk2.bold("Next steps:"));
  console.log();
  if (!inPlace) {
    console.log(INDENT + chalk2.bold("1.") + " Open in VS Code:");
    console.log(INDENT + INDENT + code(`code ${basename(workspaceDir)}`));
    console.log();
    console.log(INDENT + chalk2.bold("2.") + " Install recommended extensions when prompted");
    console.log(INDENT + INDENT + dim('(or manually: Cmd+Shift+X \u2192 search "YAML")'));
  } else {
    console.log(INDENT + chalk2.bold("1.") + " Reload VS Code window to apply settings");
    console.log(INDENT + INDENT + dim('(Cmd+Shift+P \u2192 "Developer: Reload Window")'));
    console.log();
    console.log(INDENT + chalk2.bold("2.") + " Ensure YAML extension is installed");
    console.log(INDENT + INDENT + dim('(Cmd+Shift+X \u2192 search "YAML" by Red Hat)'));
  }
  console.log();
  console.log(INDENT + chalk2.bold(inPlace ? "3." : "3.") + " Start editing - you'll get autocomplete and validation!");
  console.log(INDENT + INDENT + dim("Open any .ubml.yaml file and start typing"));
  console.log();
  console.log(INDENT + chalk2.bold(inPlace ? "4." : "4.") + " Add more content:");
  console.log(INDENT + INDENT + code("ubml add") + dim("              # See what you can add"));
  console.log(INDENT + INDENT + code("ubml add process") + dim("      # Add a new process"));
  console.log();
  console.log(INDENT + chalk2.bold(inPlace ? "5." : "5.") + " Validate your model:");
  console.log(INDENT + INDENT + code("ubml validate ."));
  console.log();
  console.log(dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log(chalk2.bold("Tips:"));
  console.log(INDENT + "\u2022 " + dim("In VS Code, press ") + code("Ctrl+Space") + dim(" for autocomplete"));
  console.log(INDENT + "\u2022 " + dim("Hover over properties to see documentation"));
  console.log(INDENT + "\u2022 " + dim("Red squiggles show validation errors"));
  console.log();
  console.log("More help: " + code("ubml docs vscode"));
  console.log();
}
function initCommand() {
  const command = new Command2("init");
  command.description("Initialize a new UBML workspace").argument("[name]", "Workspace name (creates new directory)").option("--here", "Initialize in current directory instead of creating new one").option("-m, --minimal", "Create only workspace file, no samples", false).option("-f, --force", "Force initialization even if files exist", false).addHelpText("after", `
Examples:
  ${chalk2.dim("# Create a new workspace directory")}
  ubml init my-project

  ${chalk2.dim("# Initialize in the current (empty) directory")}
  ubml init --here

  ${chalk2.dim("# Create minimal workspace (no sample files)")}
  ubml init my-project --minimal

  ${chalk2.dim("# Force reinitialize existing directory")}
  ubml init my-project --force

What gets created:
  ${highlight("<name>.workspace.ubml.yaml")}  Workspace configuration
  ${highlight("process.ubml.yaml")}           Sample process (unless --minimal)
  ${highlight("actors.ubml.yaml")}            Sample actors (unless --minimal)
  ${highlight(".vscode/settings.json")}       VS Code YAML schema settings
  ${highlight(".vscode/extensions.json")}     Recommended extensions
`).action((name, options) => {
    if (options.here) {
      initCurrentDirectory(options);
    } else if (name) {
      initNewDirectory(name, ".", options);
    } else {
      console.error(chalk2.red("Error: Please provide a workspace name or use --here"));
      console.error();
      console.error("Usage:");
      console.error(INDENT + code("ubml init <name>") + dim("    # Create new directory"));
      console.error(INDENT + code("ubml init --here") + dim("    # Initialize current directory"));
      process.exit(1);
    }
  });
  return command;
}

// src/cli/commands/schema.ts
import { Command as Command3 } from "commander";
import chalk3 from "chalk";

// src/cli/schema-introspection.ts
import {
  DOCUMENT_TYPES as DOCUMENT_TYPES2
} from "@ubml/core/generated/metadata";
import { documentSchemas, fragmentSchemas } from "@ubml/core/generated/bundled";
function getCliMetadata(type) {
  const schema = documentSchemas[type];
  if (!schema) return null;
  const metadata = schema["x-ubml-cli"];
  return metadata ?? null;
}
function extractIdPrefix(sectionSchema) {
  const patternProps = sectionSchema.patternProperties;
  if (!patternProps) return null;
  for (const pattern of Object.keys(patternProps)) {
    const match = pattern.match(/^\^([A-Z]{2})/);
    if (match) return match[1];
  }
  return null;
}
function getTypeString(schema) {
  if (schema.$ref) {
    const ref = schema.$ref;
    const match = ref.match(/#\/\$defs\/(\w+)/);
    return match ? match[1] : "object";
  }
  if (schema.type === "array") {
    const items = schema.items;
    if (items == null ? void 0 : items.$ref) {
      const ref = items.$ref;
      const match = ref.match(/#\/\$defs\/(\w+)/);
      return match ? `${match[1]}[]` : "array";
    }
    return `${(items == null ? void 0 : items.type) ?? "any"}[]`;
  }
  if (schema.enum) {
    return "enum";
  }
  return schema.type ?? "any";
}
function getDocumentTypeInfo(type) {
  var _a;
  const schema = documentSchemas[type];
  const metadata = getCliMetadata(type);
  const sections = [];
  const properties = (schema == null ? void 0 : schema.properties) ?? {};
  const required = (schema == null ? void 0 : schema.required) ?? [];
  const skipProps = /* @__PURE__ */ new Set(["ubml", "name", "description", "metadata", "tags", "custom"]);
  for (const [propName, propSchema] of Object.entries(properties)) {
    if (skipProps.has(propName)) continue;
    sections.push({
      name: propName,
      idPrefix: extractIdPrefix(propSchema),
      description: ((_a = propSchema.description) == null ? void 0 : _a.split("\n")[0]) ?? "",
      required: required.includes(propName)
    });
  }
  return {
    type,
    filePattern: `*.${type}.ubml.yaml`,
    title: (schema == null ? void 0 : schema.title) ?? type,
    shortDescription: (metadata == null ? void 0 : metadata.shortDescription) ?? (schema == null ? void 0 : schema.description) ?? "",
    fullDescription: (schema == null ? void 0 : schema.description) ?? "",
    category: (metadata == null ? void 0 : metadata.category) ?? "advanced",
    categoryDisplayName: (metadata == null ? void 0 : metadata.categoryDisplayName) ?? "Advanced",
    workflowOrder: (metadata == null ? void 0 : metadata.workflowOrder) ?? 99,
    gettingStarted: (metadata == null ? void 0 : metadata.gettingStarted) ?? [],
    exampleFilename: (metadata == null ? void 0 : metadata.exampleFilename) ?? `sample.${type}.ubml.yaml`,
    sections,
    requiredProperties: required,
    templateDefaults: metadata == null ? void 0 : metadata.templateDefaults
  };
}
function getAllDocumentTypes() {
  return DOCUMENT_TYPES2.map((type) => getDocumentTypeInfo(type));
}
function getAllElementTypes() {
  const elements = [];
  const prefixMap = {
    Process: "PR",
    Step: "ST",
    Actor: "AC",
    Entity: "EN",
    Hypothesis: "HY",
    Scenario: "SC",
    KPI: "KP",
    Capability: "CP",
    ValueStream: "VS",
    Service: "SV",
    Product: "PD",
    Portfolio: "PF",
    View: "VW",
    Link: "LC"
  };
  for (const [fragName, schema] of Object.entries(fragmentSchemas)) {
    const defs = schema.$defs;
    if (!defs) continue;
    for (const defName of Object.keys(defs)) {
      if (prefixMap[defName]) {
        elements.push({
          type: defName.toLowerCase(),
          prefix: prefixMap[defName]
        });
      }
    }
  }
  return elements;
}
function getElementTypeInfo(elementType) {
  var _a, _b;
  for (const [fragName, schema] of Object.entries(fragmentSchemas)) {
    const defs = schema.$defs;
    if (!defs) continue;
    for (const [defName, defSchema] of Object.entries(defs)) {
      if (defName.toLowerCase() === elementType.toLowerCase()) {
        const properties = defSchema.properties ?? {};
        const required = defSchema.required ?? [];
        const props = [];
        for (const [propName, propSchema] of Object.entries(properties)) {
          props.push({
            name: propName,
            type: getTypeString(propSchema),
            description: ((_a = propSchema.description) == null ? void 0 : _a.split("\n")[0]) ?? "",
            required: required.includes(propName),
            enumValues: propSchema.enum,
            default: propSchema.default
          });
        }
        const elements = getAllElementTypes();
        const element = elements.find((e) => e.type === elementType.toLowerCase());
        return {
          type: elementType,
          idPrefix: (element == null ? void 0 : element.prefix) ?? "XX",
          idPattern: `${(element == null ? void 0 : element.prefix) ?? "XX"}###`,
          description: ((_b = defSchema.description) == null ? void 0 : _b.split("\n")[0]) ?? "",
          properties: props,
          requiredProperties: required
        };
      }
    }
  }
  return null;
}
function getSuggestedWorkflow() {
  const all = getAllDocumentTypes();
  const ordered = all.filter((info) => info.workflowOrder < 99).sort((a, b) => a.workflowOrder - b.workflowOrder);
  return ordered.map((info) => ({
    step: info.workflowOrder,
    type: info.type,
    reason: info.gettingStarted[0] ?? info.shortDescription
  }));
}
function getSuggestedNextStep(existingTypes) {
  const workflow = getSuggestedWorkflow();
  const existing = new Set(existingTypes);
  for (const step of workflow) {
    if (!existing.has(step.type)) {
      return step;
    }
  }
  return null;
}
function getMinimalTemplate(type) {
  const info = getDocumentTypeInfo(type);
  const template = {
    ubml: "1.0"
  };
  if (type !== "links") {
    template.name = `My ${info.title}`;
    template.description = "Description goes here";
  }
  for (const section of info.sections) {
    if (section.required && section.idPrefix) {
      template[section.name] = createSampleSection(section, type);
    }
  }
  return template;
}
function createSampleSection(section, docType) {
  var _a;
  const id = `${section.idPrefix}001`;
  const singularName = section.name.replace(/e?s$/, "");
  const elementInfo = getElementTypeInfo(singularName);
  const sample = {
    name: `Sample ${singularName}`,
    description: "Description goes here"
  };
  const info = getDocumentTypeInfo(docType);
  const defaults = (_a = info.templateDefaults) == null ? void 0 : _a[section.name];
  if (defaults) {
    Object.assign(sample, defaults);
  }
  return { [id]: sample };
}
function getAnnotatedTemplate(type) {
  const info = getDocumentTypeInfo(type);
  const template = getMinimalTemplate(type);
  const lines = [
    `# ${info.title}`,
    `# ${info.shortDescription}`,
    `# File: ${info.exampleFilename}`,
    "#",
    `# See: ubml schema ${type} --properties`,
    ""
  ];
  lines.push('ubml: "1.0"  # UBML version (required)');
  if (template.name) {
    lines.push(`name: "${template.name}"`);
  }
  if (template.description) {
    lines.push(`description: "${template.description}"`);
  }
  for (const section of info.sections) {
    if (template[section.name]) {
      lines.push("");
      lines.push(`# ${section.description}`);
      lines.push(`${section.name}:`);
      const sectionData = template[section.name];
      for (const [id, value] of Object.entries(sectionData)) {
        lines.push(`  ${id}:`);
        const obj = value;
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === "object" && val !== null) {
            lines.push(`    ${key}:`);
            for (const [subKey, subVal] of Object.entries(val)) {
              lines.push(`      ${subKey}:`);
              const subObj = subVal;
              for (const [k, v] of Object.entries(subObj)) {
                lines.push(`        ${k}: "${v}"`);
              }
            }
          } else {
            lines.push(`    ${key}: "${val}"`);
          }
        }
      }
    }
  }
  return lines.join("\n");
}

// src/cli/commands/schema.ts
import { DOCUMENT_TYPES as DOCUMENT_TYPES3 } from "@ubml/core/generated/metadata";
var INDENT2 = "  ";
function header(text) {
  return chalk3.bold.cyan(text);
}
function subheader(text) {
  return chalk3.bold.white(text);
}
function dim2(text) {
  return chalk3.dim(text);
}
function success2(text) {
  return chalk3.green(text);
}
function highlight2(text) {
  return chalk3.yellow(text);
}
function code2(text) {
  return chalk3.cyan(text);
}
function displayOverview() {
  console.log();
  console.log(header("UBML Schema Overview"));
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("UBML (Unified Business Modeling Language) uses YAML files to model");
  console.log("business processes, actors, entities, and more.");
  console.log();
  console.log(subheader("Document Types:"));
  console.log();
  const docTypes = getAllDocumentTypes();
  const categoryOrder = ["core", "analysis", "strategy", "advanced"];
  const grouped = /* @__PURE__ */ new Map();
  for (const info of docTypes) {
    const displayName = info.categoryDisplayName;
    if (!grouped.has(displayName)) {
      grouped.set(displayName, []);
    }
    grouped.get(displayName).push(info);
  }
  for (const types of grouped.values()) {
    types.sort((a, b) => a.workflowOrder - b.workflowOrder);
  }
  for (const category of categoryOrder) {
    const types = docTypes.filter((d) => d.category === category);
    if (types.length === 0) continue;
    const displayName = types[0].categoryDisplayName;
    console.log(INDENT2 + chalk3.bold(displayName));
    for (const info of types.sort((a, b) => a.workflowOrder - b.workflowOrder)) {
      console.log(INDENT2 + INDENT2 + highlight2(info.filePattern.padEnd(28)) + dim2(info.title));
    }
    console.log();
  }
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Use " + code2("ubml schema <type>") + " to see details about a document type.");
  console.log("Use " + code2("ubml schema --workflow") + " to see the recommended modeling workflow.");
  console.log();
}
function displayWorkflow() {
  console.log();
  console.log(header("Recommended UBML Workflow"));
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Follow these steps to build a complete business model:");
  console.log();
  const workflow = getSuggestedWorkflow();
  for (const step of workflow) {
    const info = getDocumentTypeInfo(step.type);
    console.log(
      INDENT2 + chalk3.bold.green(`${step.step}.`) + ` Create ${highlight2(info.filePattern)}`
    );
    console.log(INDENT2 + INDENT2 + dim2(step.reason));
    console.log();
  }
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Quick start:");
  console.log(INDENT2 + code2("ubml init my-project") + dim2("        # Create a new workspace"));
  console.log(INDENT2 + code2("ubml add process") + dim2("           # Add a process file"));
  console.log(INDENT2 + code2("ubml validate .") + dim2("            # Validate all files"));
  console.log();
}
function displayDocumentType(type, options) {
  const info = getDocumentTypeInfo(type);
  console.log();
  console.log(header(info.title));
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log(info.shortDescription);
  console.log();
  console.log(subheader("File Pattern:") + " " + highlight2(info.filePattern));
  console.log(subheader("Example:") + "      " + code2(info.exampleFilename));
  console.log();
  if (info.sections.length > 0) {
    console.log(subheader("Sections:"));
    console.log();
    for (const section of info.sections) {
      const prefix = section.idPrefix ? dim2(` (${section.idPrefix}###)`) : "";
      const req = section.required ? success2(" [required]") : "";
      console.log(INDENT2 + highlight2(section.name) + prefix + req);
      console.log(INDENT2 + INDENT2 + dim2(section.description));
    }
    console.log();
  }
  if (options.properties) {
    displayElementProperties(info);
  }
  if (options.template) {
    displayTemplate(type);
  }
  if (!options.template) {
    console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
    console.log();
    console.log("Use " + code2(`ubml schema ${type} --template`) + " to see a starter template.");
    console.log("Use " + code2(`ubml schema ${type} --properties`) + " to see all available properties.");
    console.log("Use " + code2(`ubml add ${type}`) + " to create a new file of this type.");
    console.log();
  }
}
function displayElementProperties(docInfo) {
  console.log(subheader("Element Properties:"));
  console.log();
  for (const section of docInfo.sections) {
    if (!section.idPrefix) continue;
    const elementTypes = getAllElementTypes();
    const element = elementTypes.find((e) => e.prefix === section.idPrefix);
    if (!element) continue;
    const info = getElementTypeInfo(element.type);
    if (!info || info.properties.length === 0) continue;
    console.log(INDENT2 + chalk3.bold(section.name) + dim2(` (${section.idPrefix}###)`));
    console.log();
    for (const prop of info.properties) {
      const req = prop.required ? success2("*") : " ";
      const typeStr = dim2(`<${prop.type}>`);
      console.log(INDENT2 + INDENT2 + req + highlight2(prop.name.padEnd(20)) + typeStr);
      if (prop.description) {
        console.log(INDENT2 + INDENT2 + "  " + dim2(prop.description));
      }
      if (prop.enumValues) {
        console.log(INDENT2 + INDENT2 + "  " + dim2("Values: ") + prop.enumValues.join(", "));
      }
    }
    console.log();
  }
  console.log(dim2("* = required"));
  console.log();
}
function displayTemplate(type) {
  console.log(subheader("Template:"));
  console.log();
  const template = getAnnotatedTemplate(type);
  const lines = template.split("\n");
  for (const line of lines) {
    if (line.startsWith("#")) {
      console.log(dim2(line));
    } else if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      const value = rest.join(":");
      console.log(highlight2(key) + ":" + value);
    } else {
      console.log(line);
    }
  }
  console.log();
}
function displayElements() {
  console.log();
  console.log(header("UBML Element Types"));
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Elements are identified by prefixed IDs. Each prefix indicates the type:");
  console.log();
  const elements = getAllElementTypes();
  const groups = {
    "Process Elements": elements.filter((e) => ["PR", "ST", "PH", "BK"].includes(e.prefix)),
    "Actors & Resources": elements.filter((e) => ["AC", "SK", "RP", "EQ", "PS"].includes(e.prefix)),
    "Information Model": elements.filter((e) => ["EN", "DC", "LC"].includes(e.prefix)),
    "Strategy": elements.filter((e) => ["VS", "CP", "PD", "SV", "PF"].includes(e.prefix)),
    "Analysis": elements.filter((e) => ["HY", "EV", "SC", "KP"].includes(e.prefix)),
    "Other": elements.filter((e) => ["VW"].includes(e.prefix))
  };
  for (const [group, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    console.log(INDENT2 + chalk3.bold(group));
    for (const item of items) {
      console.log(
        INDENT2 + INDENT2 + code2(item.prefix.padEnd(4)) + highlight2(item.type.padEnd(16)) + dim2(`Example: ${item.prefix}001`)
      );
    }
    console.log();
  }
  console.log(dim2("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Use " + code2("ubml schema <type> --properties") + " to see properties for a document type.");
  console.log();
}
function schemaCommand() {
  const command = new Command3("schema");
  command.description("Explore UBML schema and learn what you can model").argument("[type]", "Document type to show details for").option("-w, --workflow", "Show recommended modeling workflow").option("-e, --elements", "Show all element types and ID patterns").option("-p, --properties", "Show detailed property information").option("-t, --template", "Show a starter template for the type").option("--json", "Output in JSON format").addHelpText("after", `
Examples:
  ${chalk3.dim("# Show overview of all document types")}
  ubml schema

  ${chalk3.dim("# Show recommended workflow for new users")}
  ubml schema --workflow

  ${chalk3.dim("# Show details for process documents")}
  ubml schema process

  ${chalk3.dim("# Show a template for a new process file")}
  ubml schema process --template

  ${chalk3.dim("# Show all properties for actors")}
  ubml schema actors --properties

  ${chalk3.dim("# Show all element ID patterns")}
  ubml schema --elements
`).action((type, options) => {
    if (options.json) {
      if (type && isValidDocumentType(type)) {
        const info = getDocumentTypeInfo(type);
        console.log(JSON.stringify(info, null, 2));
      } else {
        const allTypes = getAllDocumentTypes();
        console.log(JSON.stringify(allTypes, null, 2));
      }
      return;
    }
    if (options.workflow) {
      displayWorkflow();
      return;
    }
    if (options.elements) {
      displayElements();
      return;
    }
    if (type) {
      if (!isValidDocumentType(type)) {
        console.error(chalk3.red(`Error: Unknown document type "${type}"`));
        console.error();
        console.error("Available types:");
        for (const t of DOCUMENT_TYPES3) {
          console.error(INDENT2 + highlight2(t));
        }
        process.exit(1);
      }
      displayDocumentType(type, {
        properties: options.properties,
        template: options.template
      });
      return;
    }
    displayOverview();
  });
  return command;
}
function isValidDocumentType(type) {
  return DOCUMENT_TYPES3.includes(type);
}

// src/cli/commands/add.ts
import { Command as Command4 } from "commander";
import chalk4 from "chalk";
import { existsSync as existsSync2, writeFileSync as writeFileSync2, readdirSync as readdirSync2 } from "fs";
import { join as join2, resolve as resolve3, basename as basename2 } from "path";
import { serialize as serialize2 } from "@ubml/core";
import { DOCUMENT_TYPES as DOCUMENT_TYPES4, detectDocumentType } from "@ubml/core/generated/metadata";
var INDENT3 = "  ";
function success3(text) {
  return chalk4.green(text);
}
function highlight3(text) {
  return chalk4.yellow(text);
}
function code3(text) {
  return chalk4.cyan(text);
}
function dim3(text) {
  return chalk4.dim(text);
}
function toKebabCase2(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function findExistingUbmlFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync2(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".ubml.yaml")) {
        const type = detectDocumentType(entry.name);
        if (type) {
          files.push({ path: join2(dir, entry.name), type });
        }
      }
    }
  } catch {
  }
  return files;
}
function getExistingTypes(dir) {
  const files = findExistingUbmlFiles(dir);
  return [...new Set(files.map((f) => f.type))];
}
function createTemplate(type, name) {
  const template = getMinimalTemplate(type);
  switch (type) {
    case "workspace":
      return {
        ...template,
        name,
        description: `${name} workspace`
      };
    case "process": {
      const processName = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        ubml: "1.0",
        processes: {
          PR001: {
            name: processName,
            description: `${processName} process`,
            level: 3,
            steps: {
              ST001: {
                name: "Start",
                kind: "event",
                description: "Process start event"
              },
              ST002: {
                name: "First Activity",
                kind: "action",
                description: "First activity in the process"
              },
              ST003: {
                name: "End",
                kind: "event",
                description: "Process end event"
              }
            },
            links: [
              { from: "ST001", to: "ST002" },
              { from: "ST002", to: "ST003" }
            ]
          }
        }
      };
    }
    case "actors":
      return {
        ubml: "1.0",
        actors: {
          AC001: {
            name: "Business User",
            type: "role",
            kind: "human",
            description: "Primary business user role"
          }
        },
        skills: {
          SK001: {
            name: "Domain Knowledge",
            description: "Knowledge of business domain"
          }
        }
      };
    case "entities":
      return {
        ubml: "1.0",
        entities: {
          EN001: {
            name: "Primary Entity",
            description: "Main business entity"
          }
        }
      };
    case "hypotheses":
      return {
        ubml: "1.0",
        hypothesisTrees: {
          HT001: {
            name: "Improvement Analysis",
            situation: "Describe the current situation",
            complication: "What is causing problems or inefficiency?",
            question: "What problem should we solve?",
            hypotheses: {
              HY001: {
                name: "Primary Hypothesis",
                statement: "We believe that...",
                status: "open"
              }
            }
          }
        }
      };
    case "metrics":
      return {
        ubml: "1.0",
        kpis: {
          KP001: {
            name: "Process Cycle Time",
            description: "Total time from start to finish",
            unit: "hours",
            direction: "lower-is-better"
          },
          KP002: {
            name: "Throughput",
            description: "Number of completed cases per period",
            unit: "cases/day",
            direction: "higher-is-better"
          }
        }
      };
    case "scenarios":
      return {
        ubml: "1.0",
        scenarios: {
          SC001: {
            name: "Current State",
            description: "Baseline scenario representing current operations",
            type: "baseline"
          },
          SC002: {
            name: "Improved State",
            description: "Target scenario after improvements",
            type: "target"
          }
        }
      };
    case "strategy":
      return {
        ubml: "1.0",
        valueStreams: {
          VS001: {
            name: "Core Value Delivery",
            description: "Primary value stream to customers"
          }
        },
        capabilities: {
          CP001: {
            name: "Core Capability",
            description: "Essential business capability"
          }
        }
      };
    default:
      return template;
  }
}
function showWhatCanBeAdded(dir) {
  const existingTypes = getExistingTypes(dir);
  const existingFiles = findExistingUbmlFiles(dir);
  console.log();
  console.log(chalk4.bold.cyan("UBML Document Types"));
  console.log(dim3("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  if (existingFiles.length > 0) {
    console.log(chalk4.bold("Existing files:"));
    for (const file of existingFiles) {
      console.log(INDENT3 + success3("\u2713") + " " + basename2(file.path) + dim3(` (${file.type})`));
    }
    console.log();
  }
  const nextStep = getSuggestedNextStep(existingTypes);
  if (nextStep) {
    console.log(chalk4.bold("Suggested next:"));
    const info = getDocumentTypeInfo(nextStep.type);
    console.log(INDENT3 + highlight3(nextStep.type) + " - " + info.title);
    console.log(INDENT3 + dim3(nextStep.reason));
    console.log();
    console.log(INDENT3 + "Run: " + code3(`ubml add ${nextStep.type}`));
    console.log();
  }
  console.log(chalk4.bold("Available document types:"));
  console.log();
  for (const type of DOCUMENT_TYPES4) {
    const info = getDocumentTypeInfo(type);
    const exists = existingTypes.includes(type);
    const marker = exists ? dim3(" (exists)") : "";
    console.log(INDENT3 + highlight3(type.padEnd(12)) + info.title + marker);
  }
  console.log();
  console.log(dim3("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Usage: " + code3("ubml add <type> [name]"));
  console.log();
  console.log("Examples:");
  console.log(INDENT3 + code3("ubml add process") + dim3("              # Creates process.ubml.yaml"));
  console.log(INDENT3 + code3("ubml add process order-fulfillment") + dim3(" # Creates order-fulfillment.process.ubml.yaml"));
  console.log();
}
function addDocument(type, name, options) {
  const dir = resolve3(options.dir);
  const info = getDocumentTypeInfo(type);
  const baseName = name ? toKebabCase2(name) : getDefaultName(type, dir);
  const filename = `${baseName}.${type}.ubml.yaml`;
  const filepath = join2(dir, filename);
  if (existsSync2(filepath) && !options.force) {
    console.error(chalk4.red(`Error: File already exists: ${filename}`));
    console.error();
    console.error("Use " + code3("--force") + " to overwrite, or specify a different name:");
    console.error(INDENT3 + code3(`ubml add ${type} my-custom-name`));
    process.exit(1);
  }
  const template = createTemplate(type, name || baseName);
  const content = serialize2(template);
  writeFileSync2(filepath, content);
  console.log();
  console.log(success3("\u2713") + " Created " + highlight3(filename));
  console.log();
  console.log(chalk4.bold("File type:") + " " + info.title);
  console.log(chalk4.bold("Location:") + "  " + dim3(filepath));
  console.log();
  if (info.sections.length > 0) {
    console.log(chalk4.bold("Contains:"));
    for (const section of info.sections.filter((s) => s.idPrefix)) {
      console.log(INDENT3 + highlight3(section.name) + dim3(` (${section.idPrefix}###)`));
    }
    console.log();
  }
  console.log(chalk4.bold.cyan("In VS Code:"));
  console.log(INDENT3 + "\u2022 Open " + code3(filename) + " - you'll get autocomplete and validation");
  console.log(INDENT3 + "\u2022 Press " + code3("Ctrl+Space") + " to see available properties");
  console.log(INDENT3 + "\u2022 Hover over properties for documentation");
  console.log();
  console.log(chalk4.bold("Next steps:"));
  console.log(INDENT3 + "1. Edit the template to match your business");
  console.log(INDENT3 + "2. Run " + code3("ubml validate .") + " to check for errors");
  console.log();
  const existingTypes = getExistingTypes(dir);
  existingTypes.push(type);
  const nextStep = getSuggestedNextStep(existingTypes);
  if (nextStep) {
    console.log(chalk4.bold("Then:"));
    console.log(INDENT3 + "Add " + highlight3(nextStep.type) + " - " + nextStep.reason);
    console.log(INDENT3 + "Run: " + code3(`ubml add ${nextStep.type}`));
    console.log();
  }
}
function getDefaultName(type, dir) {
  const defaults = {
    workspace: basename2(dir) || "my-workspace",
    process: "sample",
    actors: "organization",
    entities: "data-model",
    hypotheses: "analysis",
    scenarios: "scenarios",
    strategy: "strategy",
    metrics: "kpis",
    mining: "mining",
    views: "views",
    links: "links",
    glossary: "glossary"
  };
  return defaults[type] || type;
}
function addCommand() {
  const command = new Command4("add");
  command.description("Add a new UBML document to your workspace").argument("[type]", "Document type to add").argument("[name]", "Name for the document (used in filename)").option("-d, --dir <directory>", "Directory to create the file in", ".").option("-f, --force", "Overwrite existing file", false).addHelpText("after", `
Examples:
  ${chalk4.dim("# Show available document types")}
  ubml add

  ${chalk4.dim("# Add a process document")}
  ubml add process

  ${chalk4.dim("# Add a named process document")}
  ubml add process customer-onboarding

  ${chalk4.dim("# Add actors to a subdirectory")}
  ubml add actors sales-team --dir ./sales

Document Types:
  workspace    Root workspace configuration
  process      Business process definitions
  actors       Roles, teams, and systems
  entities     Business entities and documents
  hypotheses   Problem framing with SCQH
  scenarios    Simulation scenarios
  strategy     Value streams and capabilities
  metrics      KPIs and ROI analysis
  mining       Process mining configuration
  views        Custom visualizations
  links        Cross-process links
  glossary     Business terminology
`).action((type, name, options) => {
    if (!type) {
      showWhatCanBeAdded(resolve3(options.dir));
      return;
    }
    if (!DOCUMENT_TYPES4.includes(type)) {
      console.error(chalk4.red(`Error: Unknown document type "${type}"`));
      console.error();
      console.error("Available types:");
      for (const t of DOCUMENT_TYPES4) {
        console.error(INDENT3 + highlight3(t));
      }
      console.error();
      console.error("Run " + code3("ubml add") + " to see details.");
      process.exit(1);
    }
    addDocument(type, name, options);
  });
  return command;
}

// src/cli/commands/docs.ts
import { Command as Command5 } from "commander";
import chalk5 from "chalk";
var INDENT4 = "  ";
function header2(text) {
  return chalk5.bold.cyan(text);
}
function subheader2(text) {
  return chalk5.bold.white(text);
}
function dim4(text) {
  return chalk5.dim(text);
}
function code4(text) {
  return chalk5.cyan(text);
}
function highlight4(text) {
  return chalk5.yellow(text);
}
var QUICKSTART = `
${header2("UBML Quick Start Guide")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

UBML (Unified Business Modeling Language) helps you capture how 
your business works in structured, validated YAML files.

${subheader2("1. Initialize a Workspace")}

   ${code4("ubml init my-project")}      ${dim4("# Create new project folder")}
   ${code4("cd my-project")}
   ${code4("code .")}                    ${dim4("# Open in VS Code")}

${subheader2("2. Explore What You Can Model")}

   ${code4("ubml schema")}               ${dim4("# See all document types")}
   ${code4("ubml schema process")}       ${dim4("# Learn about processes")}
   ${code4("ubml schema --workflow")}    ${dim4("# See recommended order")}

${subheader2("3. Add Content")}

   ${code4("ubml add")}                  ${dim4("# See what you can add")}
   ${code4("ubml add process")}          ${dim4("# Add a process file")}
   ${code4("ubml add actors")}           ${dim4("# Add actors/roles")}

${subheader2("4. Validate Your Model")}

   ${code4("ubml validate .")}           ${dim4("# Check for errors")}

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
`;
var CONCEPTS = `
${header2("UBML Core Concepts")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

${subheader2("Workspace")}
  The root of your UBML project. Contains metadata about the 
  project and references to other documents.
  ${dim4("File: *.workspace.ubml.yaml")}

${subheader2("Processes")}
  Business workflows with steps, decisions, and links.
  Processes can be hierarchical (L1-L4) for different detail levels.
  ${dim4("File: *.process.ubml.yaml")}

${subheader2("Steps")}
  Activities within a process. Types include:
  ${highlight4("action")}     - Work activity or task
  ${highlight4("decision")}   - Gateway/decision point  
  ${highlight4("event")}      - Start, end, or intermediate event
  ${highlight4("wait")}       - Waiting for external trigger
  ${highlight4("subprocess")} - Call to another process

${subheader2("Actors")}
  Who participates in processes. Types include:
  ${highlight4("role")}         - Job function (preferred for RACI)
  ${highlight4("team")}         - Department or group
  ${highlight4("system")}       - IT system or application
  ${highlight4("external")}     - External party (customer, vendor)
  ${highlight4("organization")} - Legal entity

${subheader2("Entities")}
  Business objects that flow through processes.
  Documents, data objects, physical items.

${subheader2("Links")}
  Connections between steps defining process flow.
  Support dependencies, conditions, and timing.

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
Learn more: ${code4("ubml schema <type> --properties")}
`;
var ID_REFERENCE = `
${header2("UBML ID Reference")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

Every element in UBML has a typed ID prefix:

${subheader2("Process Elements")}
  ${highlight4("PR###")}  Process           ${dim4("PR001, PR002...")}
  ${highlight4("ST###")}  Step              ${dim4("ST001, ST002...")}
  ${highlight4("PH###")}  Phase             ${dim4("PH001, PH002...")}
  ${highlight4("BK###")}  Block             ${dim4("BK001, BK002...")}

${subheader2("Actors & Resources")}
  ${highlight4("AC###")}  Actor             ${dim4("AC001, AC002...")}
  ${highlight4("SK###")}  Skill             ${dim4("SK001, SK002...")}
  ${highlight4("RP###")}  Resource Pool     ${dim4("RP001, RP002...")}
  ${highlight4("EQ###")}  Equipment         ${dim4("EQ001, EQ002...")}
  ${highlight4("PS###")}  Persona           ${dim4("PS001, PS002...")}

${subheader2("Information Model")}
  ${highlight4("EN###")}  Entity            ${dim4("EN001, EN002...")}
  ${highlight4("DC###")}  Document          ${dim4("DC001, DC002...")}
  ${highlight4("LC###")}  Location          ${dim4("LC001, LC002...")}

${subheader2("Strategy")}
  ${highlight4("VS###")}  Value Stream      ${dim4("VS001, VS002...")}
  ${highlight4("CP###")}  Capability        ${dim4("CP001, CP002...")}
  ${highlight4("PD###")}  Product           ${dim4("PD001, PD002...")}
  ${highlight4("SV###")}  Service           ${dim4("SV001, SV002...")}
  ${highlight4("PF###")}  Portfolio         ${dim4("PF001, PF002...")}

${subheader2("Analysis")}
  ${highlight4("HY###")}  Hypothesis        ${dim4("HY001, HY002...")}
  ${highlight4("HT###")}  Hypothesis Tree   ${dim4("HT001, HT002...")}
  ${highlight4("EV###")}  Evidence          ${dim4("EV001, EV002...")}
  ${highlight4("SC###")}  Scenario          ${dim4("SC001, SC002...")}
  ${highlight4("KP###")}  KPI               ${dim4("KP001, KP002...")}

${subheader2("Other")}
  ${highlight4("VW###")}  View              ${dim4("VW001, VW002...")}
  ${highlight4("MS###")}  Mining Source     ${dim4("MS001, MS002...")}
  ${highlight4("ROI###")} ROI Analysis      ${dim4("ROI001, ROI002...")}

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
${dim4("Tip: Leave gaps in IDs for future additions (ST001, ST005, ST010...)")}
`;
var EXAMPLES = `
${header2("UBML Examples")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

${subheader2("Simple Process")}

${dim4("# order-fulfillment.process.ubml.yaml")}
${highlight4("ubml")}: "1.0"
${highlight4("processes")}:
  ${code4("PR001")}:
    ${highlight4("name")}: "Order Fulfillment"
    ${highlight4("description")}: "Process customer orders from receipt to delivery"
    ${highlight4("level")}: 3
    ${highlight4("steps")}:
      ${code4("ST001")}:
        ${highlight4("name")}: "Receive Order"
        ${highlight4("kind")}: event
      ${code4("ST002")}:
        ${highlight4("name")}: "Validate Order"
        ${highlight4("kind")}: action
        ${highlight4("responsible")}: AC001
      ${code4("ST003")}:
        ${highlight4("name")}: "Ship Order"
        ${highlight4("kind")}: action
    ${highlight4("links")}:
      - ${highlight4("from")}: ST001
        ${highlight4("to")}: ST002
      - ${highlight4("from")}: ST002
        ${highlight4("to")}: ST003

${subheader2("Actors File")}

${dim4("# actors.ubml.yaml")}
${highlight4("ubml")}: "1.0"
${highlight4("actors")}:
  ${code4("AC001")}:
    ${highlight4("name")}: "Order Processor"
    ${highlight4("type")}: role
    ${highlight4("kind")}: human
    ${highlight4("skills")}:
      - SK001
  ${code4("AC002")}:
    ${highlight4("name")}: "ERP System"
    ${highlight4("type")}: system
    ${highlight4("kind")}: system

${highlight4("skills")}:
  ${code4("SK001")}:
    ${highlight4("name")}: "Order Management"
    ${highlight4("description")}: "Knowledge of order processing procedures"

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
Get templates: ${code4("ubml schema <type> --template")}
`;
var FILE_PATTERNS = `
${header2("UBML File Patterns")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

UBML supports two filename patterns:

  ${highlight4("type.ubml.yaml")}          ${dim4("Simple (actors.ubml.yaml)")}
  ${highlight4("prefix.type.ubml.yaml")}   ${dim4("Prefixed (sales.actors.ubml.yaml)")}

${subheader2("Core Document Types")}
  ${highlight4("workspace")}   Root workspace config (one per project)
  ${highlight4("process")}     Business process definitions
  ${highlight4("actors")}      People, roles, teams, systems
  ${highlight4("entities")}    Information model, documents

${subheader2("Analysis & Strategy")}
  ${highlight4("hypotheses")}  SCQH problem framing
  ${highlight4("scenarios")}   Simulation scenarios
  ${highlight4("metrics")}     KPIs and measurements
  ${highlight4("strategy")}    Value streams, capabilities
  ${highlight4("glossary")}    Business terminology

${subheader2("Advanced")}
  ${highlight4("mining")}      Process mining config
  ${highlight4("views")}       Custom visualizations
  ${highlight4("links")}       Cross-document references

${subheader2("Example Structures")}

  ${dim4("Simple project:")}
  my-project/
  \u251C\u2500\u2500 my-project.workspace.ubml.yaml
  \u251C\u2500\u2500 process.ubml.yaml
  \u251C\u2500\u2500 actors.ubml.yaml
  \u2514\u2500\u2500 entities.ubml.yaml

  ${dim4("Complex project:")}
  my-project/
  \u251C\u2500\u2500 my-project.workspace.ubml.yaml
  \u251C\u2500\u2500 glossary.ubml.yaml
  \u251C\u2500\u2500 customer-service/
  \u2502   \u251C\u2500\u2500 onboarding.process.ubml.yaml
  \u2502   \u2514\u2500\u2500 service-team.actors.ubml.yaml
  \u2514\u2500\u2500 shared/
      \u2514\u2500\u2500 entities.ubml.yaml

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
${dim4("Tip: Organize by domain, not by file type")}
`;
var VSCODE_GUIDE = `
${header2("UBML in VS Code")}
${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}

UBML is designed to work seamlessly with VS Code.

${subheader2("Setup")}

  ${highlight4("1.")} Initialize a workspace (creates .vscode settings):
     ${code4("ubml init my-project")}

  ${highlight4("2.")} Open in VS Code:
     ${code4("code my-project")}

  ${highlight4("3.")} Install the YAML extension when prompted
     ${dim4('(or: Cmd+Shift+X \u2192 search "YAML" by Red Hat)')}

${subheader2("Features You Get")}

  ${highlight4("Autocomplete")}      Press ${code4("Ctrl+Space")} to see available properties
  ${highlight4("Hover Docs")}        Hover over any property for documentation
  ${highlight4("Validation")}        Red squiggles show errors as you type
  ${highlight4("Quick Fixes")}       Click lightbulb for suggestions
  ${highlight4("Go to Definition")} ${code4("Cmd+Click")} on IDs to jump to definitions

${subheader2("Keyboard Shortcuts")}

  ${code4("Ctrl+Space")}     Show autocomplete suggestions
  ${code4("Cmd+Shift+P")}    Command palette (search "YAML")
  ${code4("Cmd+.")}          Quick fix suggestions
  ${code4("F12")}            Go to definition
  ${code4("Shift+F12")}      Find all references

${subheader2("Recommended Extensions")}

  ${highlight4("YAML")}              Required - schema validation & autocomplete
  ${dim4("                    (redhat.vscode-yaml)")}

${subheader2("Troubleshooting")}

  ${highlight4("No autocomplete?")}
    \u2022 Check YAML extension is installed and enabled
    \u2022 Verify .vscode/settings.json has yaml.schemas
    \u2022 Reload window: ${code4("Cmd+Shift+P")} \u2192 "Reload Window"

  ${highlight4("Wrong schema?")}
    \u2022 File must end in ${code4(".type.ubml.yaml")} or ${code4("type.ubml.yaml")}
    \u2022 Example: ${code4("actors.ubml.yaml")} or ${code4("sales.actors.ubml.yaml")}

  ${highlight4("Red squiggles everywhere?")}
    \u2022 Run ${code4("ubml validate .")} in terminal for clearer errors
    \u2022 Check for YAML syntax errors (indentation!)

${subheader2("Manual Setup (if not using ubml init)")}

  Add to ${code4(".vscode/settings.json")}:

  ${dim4("{")}
  ${dim4('  "yaml.schemas": {')}
  ${dim4('    "https://ubml.io/schemas/1.0/documents/process.document.yaml":')}
  ${dim4('      ["*.process.ubml.yaml", "process.ubml.yaml"],')}
  ${dim4("    // ... repeat for other types")}
  ${dim4("  }")}
  ${dim4("}")}

  Or reinstall: ${code4("ubml init --here --force")}

${dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")}
`;
var TOPICS = {
  quickstart: { title: "Quick Start Guide", content: QUICKSTART },
  concepts: { title: "Core Concepts", content: CONCEPTS },
  ids: { title: "ID Reference", content: ID_REFERENCE },
  examples: { title: "Examples", content: EXAMPLES },
  files: { title: "File Patterns", content: FILE_PATTERNS },
  vscode: { title: "VS Code Guide", content: VSCODE_GUIDE }
};
function displayTopic(topic) {
  console.log(TOPICS[topic].content);
}
function displayTopicList() {
  console.log();
  console.log(header2("UBML Documentation"));
  console.log(dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Available topics:");
  console.log();
  for (const [key, value] of Object.entries(TOPICS)) {
    console.log(INDENT4 + highlight4(key.padEnd(12)) + value.title);
  }
  console.log();
  console.log(dim4("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log();
  console.log("Usage: " + code4("ubml docs <topic>"));
  console.log();
  console.log("Examples:");
  console.log(INDENT4 + code4("ubml docs quickstart") + dim4("  # Get started with UBML"));
  console.log(INDENT4 + code4("ubml docs concepts") + dim4("    # Learn core concepts"));
  console.log(INDENT4 + code4("ubml docs examples") + dim4("    # See code examples"));
  console.log();
  console.log("Also see:");
  console.log(INDENT4 + code4("ubml schema") + dim4("            # Explore the schema"));
  console.log(INDENT4 + code4("ubml schema --workflow") + dim4("  # Recommended modeling workflow"));
  console.log();
}
function docsCommand() {
  const command = new Command5("docs");
  command.description("Quick reference documentation for UBML").argument("[topic]", "Documentation topic").addHelpText("after", `
Topics:
  ${highlight4("quickstart")}   Get started with UBML
  ${highlight4("concepts")}     Core concepts explained
  ${highlight4("ids")}          ID prefixes and patterns
  ${highlight4("examples")}     Code examples
  ${highlight4("files")}        File naming and structure

Examples:
  ${code4("ubml docs")}              ${dim4("# List available topics")}
  ${code4("ubml docs quickstart")}   ${dim4("# Show quick start guide")}
  ${code4("ubml docs examples")}     ${dim4("# Show code examples")}
`).action((topic) => {
    if (!topic) {
      displayTopicList();
      return;
    }
    const normalizedTopic = topic.toLowerCase();
    if (!(normalizedTopic in TOPICS)) {
      console.error(chalk5.red(`Unknown topic: ${topic}`));
      console.error();
      console.error("Available topics:");
      for (const key of Object.keys(TOPICS)) {
        console.error(INDENT4 + highlight4(key));
      }
      process.exit(1);
    }
    displayTopic(normalizedTopic);
  });
  return command;
}

// src/cli/index.ts
function createProgram() {
  const program = new Command6();
  program.name("ubml").description("UBML - Unified Business Modeling Language CLI\n\nCapture how your business works in structured, validated YAML files.").version(VERSION2).addHelpText("after", `
${chalk6.bold("Getting Started:")}
  ${chalk6.cyan("ubml init my-project")}     Create a new UBML workspace
  ${chalk6.cyan("ubml schema")}              Explore what you can model
  ${chalk6.cyan("ubml add process")}         Add a new process file
  ${chalk6.cyan("ubml validate .")}          Validate all files

${chalk6.bold("Learn More:")}
  ${chalk6.cyan("ubml docs quickstart")}     Quick start guide
  ${chalk6.cyan("ubml schema --workflow")}   Recommended modeling workflow
  ${chalk6.cyan("ubml docs examples")}       See code examples

${chalk6.dim("Documentation: https://ubml.io/docs")}
`);
  program.addCommand(initCommand());
  program.addCommand(schemaCommand());
  program.addCommand(addCommand());
  program.addCommand(validateCommand());
  program.addCommand(docsCommand());
  return program;
}
async function run(args) {
  const program = createProgram();
  await program.parseAsync(["node", "ubml", ...args]);
}

// src/cli.ts
run(process.argv.slice(2)).catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(2);
});
