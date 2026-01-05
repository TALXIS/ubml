import { DocumentType } from './metadata.js';

/**
 * Bundled UBML schemas.
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 *
 * These schemas are embedded at build time for browser compatibility.
 * They can be used without any file system access.
 */

/** Root UBML schema */
declare const rootSchema: {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $id: "https://ubml.io/schemas/1.0/ubml.schema.yaml";
    readonly title: "UBML - Unified Business Modeling Language";
    readonly description: "╔══════════════════════════════════════════════════════════════════════════╗\n║  UBML - UNIFIED BUSINESS MODELING LANGUAGE                               ║\n║  Version 1.0                                                             ║\n╚══════════════════════════════════════════════════════════════════════════╝\n\nUBML is a YAML-based domain-specific language for business process modeling.\nIt supports the full lifecycle of process improvement projects:\n\nPROBLEM FRAMING\n   Hypothesis trees with SCQH (Situation-Complication-Question-Hypothesis)\n\nPROCESS MODELING  \n   Multi-level processes (L1-L4), steps, links, blocks, phases\n\nACTORS & RESOURCES\n   Roles, teams, systems, skills, resource pools, equipment\n\nINFORMATION MODEL\n   Entities, documents, locations, relationships\n\nMETRICS & ANALYSIS\n   KPIs, ROI analysis, simulation scenarios\n\nPROCESS MINING\n   Event log integration, activity mapping, conformance checking\n\nSTRATEGY\n   Value streams, capabilities, products, services, portfolios\n\n════════════════════════════════════════════════════════════════════════════\n\nFILE TYPES:\n\nFor modular projects, use separate files with these patterns:\n\n┌────────────────────────────────┬────────────────────────────────────────┐\n│ File Pattern                   │ Purpose                                │\n├────────────────────────────────┼────────────────────────────────────────┤\n│ *.workspace.ubml.yaml          │ Root workspace configuration           │\n│ *.process.ubml.yaml            │ Process definitions                    │\n│ *.actors.ubml.yaml             │ Actors, skills, resource pools         │\n│ *.entities.ubml.yaml           │ Entities, documents, locations         │\n│ *.scenarios.ubml.yaml          │ Simulation scenarios                   │\n│ *.hypotheses.ubml.yaml         │ Hypothesis trees                       │\n│ *.strategy.ubml.yaml           │ Value streams, capabilities            │\n│ *.metrics.ubml.yaml            │ KPIs and ROI analyses                  │\n│ *.mining.ubml.yaml             │ Process mining configuration           │\n│ *.views.ubml.yaml              │ Custom views and diagrams              │\n│ *.links.ubml.yaml              │ Cross-process links                    │\n│ *.glossary.ubml.yaml           │ Terminology and definitions            │\n└────────────────────────────────┴────────────────────────────────────────┘\n\nThis root schema validates combined files containing multiple sections.\n\n════════════════════════════════════════════════════════════════════════════\n\nGETTING STARTED:\n\n1. Create a workspace file (myproject.workspace.ubml.yaml)\n2. Add process files for your workflows\n3. Define actors and their skills\n4. Model your information (entities, documents)\n5. Add metrics and scenarios for analysis\n\nFor VS Code support, add to settings.json:\n\n  \"yaml.schemas\": {\n    \"https://ubml.io/schemas/1.0/documents/process.document.yaml\": \"*.process.ubml.yaml\",\n    \"https://ubml.io/schemas/1.0/documents/actors.document.yaml\": \"*.actors.ubml.yaml\",\n    ...\n  }\n\n════════════════════════════════════════════════════════════════════════════\n";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["ubml"];
    readonly properties: {
        readonly ubml: {
            readonly description: "UBML version identifier.\nMust be \"1.0\" for this schema version.\n";
            readonly type: "string";
            readonly const: "1.0";
        };
        readonly name: {
            readonly description: "Workspace or document name.";
            readonly type: "string";
        };
        readonly description: {
            readonly description: "Detailed description.";
            readonly type: "string";
        };
        readonly version: {
            readonly description: "Document version (e.g., '1.0.0').";
            readonly type: "string";
        };
        readonly status: {
            readonly description: "Document status.";
            readonly type: "string";
            readonly enum: readonly ["draft", "review", "approved", "archived"];
        };
        readonly processes: {
            readonly description: "Process definitions.\nKeyed by process ID (PR### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^PR\\d{3,}$": {
                    readonly $ref: "fragments/process.fragment.yaml#/$defs/Process";
                };
            };
        };
        readonly actors: {
            readonly description: "Actor definitions.\nKeyed by actor ID (AC### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^AC\\d{3,}$": {
                    readonly $ref: "fragments/actor.fragment.yaml#/$defs/Actor";
                };
            };
        };
        readonly skills: {
            readonly description: "Skill definitions.\nKeyed by skill ID (SK### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^SK\\d{3,}$": {
                    readonly $ref: "fragments/resource.fragment.yaml#/$defs/Skill";
                };
            };
        };
        readonly resourcePools: {
            readonly description: "Resource pool definitions.\nKeyed by pool ID (RP### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^RP\\d{3,}$": {
                    readonly $ref: "fragments/resource.fragment.yaml#/$defs/ResourcePool";
                };
            };
        };
        readonly equipment: {
            readonly description: "Equipment definitions.\nKeyed by equipment ID (EQ### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^EQ\\d{3,}$": {
                    readonly $ref: "fragments/resource.fragment.yaml#/$defs/Equipment";
                };
            };
        };
        readonly entities: {
            readonly description: "Entity definitions.\nKeyed by entity ID (EN### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^EN\\d{3,}$": {
                    readonly $ref: "fragments/entity.fragment.yaml#/$defs/Entity";
                };
            };
        };
        readonly documents: {
            readonly description: "Document definitions.\nKeyed by document ID (DC### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^DC\\d{3,}$": {
                    readonly $ref: "fragments/entity.fragment.yaml#/$defs/Document";
                };
            };
        };
        readonly locations: {
            readonly description: "Location definitions.\nKeyed by location ID (LO### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^LO\\d{3,}$": {
                    readonly $ref: "fragments/entity.fragment.yaml#/$defs/Location";
                };
            };
        };
        readonly scenarios: {
            readonly description: "Scenario definitions.\nKeyed by scenario ID (SC### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^SC\\d{3,}$": {
                    readonly $ref: "fragments/scenario.fragment.yaml#/$defs/Scenario";
                };
            };
        };
        readonly hypothesisTrees: {
            readonly description: "Hypothesis tree definitions.\nKeyed by tree ID (HT### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^HT\\d{3,}$": {
                    readonly $ref: "fragments/hypothesis.fragment.yaml#/$defs/HypothesisTree";
                };
            };
        };
        readonly valueStreams: {
            readonly description: "Value stream definitions.\nKeyed by value stream ID (VS### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^VS\\d{3,}$": {
                    readonly $ref: "fragments/strategy.fragment.yaml#/$defs/ValueStream";
                };
            };
        };
        readonly capabilities: {
            readonly description: "Capability definitions.\nKeyed by capability ID (CP### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^CP\\d{3,}$": {
                    readonly $ref: "fragments/strategy.fragment.yaml#/$defs/Capability";
                };
            };
        };
        readonly products: {
            readonly description: "Product definitions.\nKeyed by product ID (PD### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^PD\\d{3,}$": {
                    readonly $ref: "fragments/strategy.fragment.yaml#/$defs/Product";
                };
            };
        };
        readonly services: {
            readonly description: "Service definitions.\nKeyed by service ID (SV### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^SV\\d{3,}$": {
                    readonly $ref: "fragments/strategy.fragment.yaml#/$defs/Service";
                };
            };
        };
        readonly portfolios: {
            readonly description: "Portfolio definitions.\nKeyed by portfolio ID (PF### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^PF\\d{3,}$": {
                    readonly $ref: "fragments/strategy.fragment.yaml#/$defs/Portfolio";
                };
            };
        };
        readonly kpis: {
            readonly description: "KPI definitions.\nKeyed by KPI ID (KP### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^KP\\d{3,}$": {
                    readonly $ref: "fragments/metrics.fragment.yaml#/$defs/KPI";
                };
            };
        };
        readonly roiAnalyses: {
            readonly description: "ROI analysis definitions.\nKeyed by ROI ID (ROI### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^ROI\\d{3,}$": {
                    readonly $ref: "fragments/metrics.fragment.yaml#/$defs/ROI";
                };
            };
        };
        readonly miningSources: {
            readonly description: "Mining source definitions.\nKeyed by source ID (MS### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^MS\\d{3,}$": {
                    readonly $ref: "fragments/mining.fragment.yaml#/$defs/MiningSource";
                };
            };
        };
        readonly views: {
            readonly description: "View definitions.\nKeyed by view ID (VW### pattern).\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly patternProperties: {
                readonly "^VW\\d{3,}$": {
                    readonly $ref: "fragments/view.fragment.yaml#/$defs/View";
                };
            };
        };
        readonly links: {
            readonly description: "Cross-process links.\n";
            readonly type: "array";
            readonly items: {
                readonly $ref: "fragments/link.fragment.yaml#/$defs/Link";
            };
        };
        readonly metadata: {
            readonly description: "Document metadata.";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly createdBy: {
                    readonly type: "string";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly updatedBy: {
                    readonly type: "string";
                };
                readonly approvedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly approvedBy: {
                    readonly type: "string";
                };
            };
        };
        readonly owner: {
            readonly description: "Document owner.";
            readonly $ref: "common/defs.schema.yaml#/$defs/ActorRef";
        };
        readonly stakeholders: {
            readonly description: "Key stakeholders.";
            readonly type: "array";
            readonly items: {
                readonly $ref: "common/defs.schema.yaml#/$defs/ActorRef";
            };
        };
        readonly tags: {
            readonly description: "Tags for filtering and organization.";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly custom: {
            readonly description: "User-defined custom fields.";
            readonly $ref: "common/defs.schema.yaml#/$defs/CustomFields";
        };
    };
};
/** Common definitions schema */
declare const defsSchema: {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $id: "https://ubml.io/schemas/1.0/common/defs.schema.yaml";
    readonly title: "UBML Common Definitions";
    readonly description: "Shared type definitions for UBML (Unified Business Modeling Language).\n\nThis schema defines:\n- Reference types for linking between model elements\n- Primitive types for durations, money, rates\n- Expression language specification\n- Common enums and value types\n";
    readonly $defs: {
        readonly ActorRef: {
            readonly description: "Reference to an actor (AC### pattern).\n\nActors represent WHO does work in your processes:\n- People, roles, teams, organizations\n- Systems and external parties\n\nExamples: AC001, AC042, AC100\n";
            readonly type: "string";
            readonly pattern: "^AC\\d{3,}$";
        };
        readonly StepRef: {
            readonly description: "Reference to a step (ST### pattern).\n\nSteps are the individual activities within a process.\n\nExamples: ST001, ST015, ST200\n";
            readonly type: "string";
            readonly pattern: "^ST\\d{3,}$";
        };
        readonly ProcessRef: {
            readonly description: "Reference to a process (PR### pattern).\n\nProcesses are workflows containing steps, links, and control flow.\n\nExamples: PR001, PR010, PR100\n";
            readonly type: "string";
            readonly pattern: "^PR\\d{3,}$";
        };
        readonly EntityRef: {
            readonly description: "Reference to an entity (EN### pattern).\n\nEntities are core business objects like Order, Customer, Contract.\n\nExamples: EN001, EN015, EN100\n";
            readonly type: "string";
            readonly pattern: "^EN\\d{3,}$";
        };
        readonly DocumentRef: {
            readonly description: "Reference to a document (DC### pattern).\n\nDocuments are representations of entities:\n- Forms, contracts, reports, invoices\n- Files, templates, signed documents\n\nExamples: DC001, DC010, DC100\n";
            readonly type: "string";
            readonly pattern: "^DC\\d{3,}$";
        };
        readonly SkillRef: {
            readonly description: "Reference to a skill (SK### pattern).\n\nSkills define what people can do:\n- Certifications (HGV license, crane operator)\n- Competencies (negotiation, technical review)\n\nExamples: SK001, SK010, SK100\n";
            readonly type: "string";
            readonly pattern: "^SK\\d{3,}$";
        };
        readonly ServiceRef: {
            readonly description: "Reference to a service (SV### pattern).\n\nServices are offerings in the service catalog.\n\nExamples: SV001, SV010, SV100\n";
            readonly type: "string";
            readonly pattern: "^SV\\d{3,}$";
        };
        readonly ScenarioRef: {
            readonly description: "Reference to a scenario (SC### pattern).\n\nScenarios define simulation configurations for what-if analysis.\n\nExamples: SC001, SC010, SC100\n";
            readonly type: "string";
            readonly pattern: "^SC\\d{3,}$";
        };
        readonly HypothesisRef: {
            readonly description: "Reference to a hypothesis node (HY### pattern).\n\nHypotheses are nodes in the SCQH hypothesis tree.\n\nExamples: HY001, HY010, HY100\n";
            readonly type: "string";
            readonly pattern: "^HY\\d{3,}$";
        };
        readonly EvidenceRef: {
            readonly description: "Reference to evidence (EV### pattern).\n\nEvidence items are structured workshop findings:\n- Quotes, observations, pain points\n- Assumptions, metrics, insights\n\nExamples: EV001, EV010, EV100\n";
            readonly type: "string";
            readonly pattern: "^EV\\d{3,}$";
        };
        readonly KpiRef: {
            readonly description: "Reference to a KPI (KP### pattern).\n\nKPIs are key performance indicators with targets.\n\nExamples: KP001, KP010, KP100\n";
            readonly type: "string";
            readonly pattern: "^KP\\d{3,}$";
        };
        readonly CapabilityRef: {
            readonly description: "Reference to a capability (CP### pattern).\n\nCapabilities describe what the organization can do.\n\nExamples: CP001, CP010, CP100\n";
            readonly type: "string";
            readonly pattern: "^CP\\d{3,}$";
        };
        readonly ValueStreamRef: {
            readonly description: "Reference to a value stream (VS### pattern).\n\nValue streams show end-to-end value flows across processes.\n\nExamples: VS001, VS010, VS100\n";
            readonly type: "string";
            readonly pattern: "^VS\\d{3,}$";
        };
        readonly ProductRef: {
            readonly description: "Reference to a product (PD### pattern).\n\nProducts are bundled offerings to customers.\n\nExamples: PD001, PD010, PD100\n";
            readonly type: "string";
            readonly pattern: "^PD\\d{3,}$";
        };
        readonly PortfolioRef: {
            readonly description: "Reference to a portfolio (PF### pattern).\n\nPortfolios group related products, services, or process types.\nThey enable executive-level views and organizational structuring:\n- Product portfolios: \"Consumer Products\", \"Enterprise Solutions\"\n- Service portfolios: \"Professional Services\", \"Support Services\"\n- Project portfolios: \"Infrastructure Projects\", \"Digital Transformation\"\n\nPortfolios can be hierarchical (parent portfolios contain sub-portfolios).\n\nExamples: PF001, PF010, PF100\n";
            readonly type: "string";
            readonly pattern: "^PF\\d{3,}$";
        };
        readonly EquipmentRef: {
            readonly description: "Reference to equipment (EQ### pattern).\n\nEquipment represents physical assets used to perform work:\n- Vehicles: trucks, forklifts, cranes\n- Machines: production lines, CNC machines, 3D printers\n- Tools: specialized equipment, testing devices\n- Devices: scanners, tablets, measurement instruments\n\nEquipment is separate from actors because:\n1. Equipment cannot be accountable (RACI only has people/roles)\n2. Equipment requires operators with specific skills\n3. Equipment has physical location constraints\n4. Equipment has capacity/throughput characteristics\n\nExamples: EQ001, EQ010, EQ100\n";
            readonly type: "string";
            readonly pattern: "^EQ\\d{3,}$";
        };
        readonly LocationRef: {
            readonly description: "Reference to a location (LC### pattern).\n\nLocations answer WHERE work happens or equipment is stationed:\n- Sites: construction sites, customer premises\n- Facilities: factories, warehouses, offices\n- Regions: geographic areas for service coverage\n- Zones: areas within a facility (assembly line, loading dock)\n\nLocations are separate from actors because:\n1. A location is not a participant - it's a place\n2. Multiple actors can work at the same location\n3. Equipment is stationed at locations\n4. Some steps are location-specific (on-site vs remote)\n\nExamples: LC001, LC010, LC100\n";
            readonly type: "string";
            readonly pattern: "^LC\\d{3,}$";
        };
        readonly BlockRef: {
            readonly description: "Reference to a control flow block (BK### pattern).\n\nBlocks define EXECUTION semantics - how steps run together:\n- par: parallel execution\n- alt: alternative paths (branching)\n- loop: repeated execution\n- opt: optional execution\n\nExamples: BK001, BK010, BK100\n";
            readonly type: "string";
            readonly pattern: "^BK\\d{3,}$";
        };
        readonly PhaseRef: {
            readonly description: "Reference to a process phase (PH### pattern).\n\nPhases are ORGANIZATIONAL overlays on the process graph:\n- lifecycle: project stages like Design → Build → Test\n- delivery: release scopes like MVP, Phase 1, Future\n\nPhases do NOT affect execution - they're purely for visualization\nand stakeholder communication. Use blocks for execution semantics.\n\nExamples: PH001, PH010, PH100\n";
            readonly type: "string";
            readonly pattern: "^PH\\d{3,}$";
        };
        readonly PersonaRef: {
            readonly description: "Reference to a persona (PS### pattern).\n\nPersonas are stakeholder archetypes with goals and pain points.\n\nExamples: PS001, PS010, PS100\n";
            readonly type: "string";
            readonly pattern: "^PS\\d{3,}$";
        };
        readonly ResourcePoolRef: {
            readonly description: "Reference to a resource pool (RP### pattern).\n\nResource pools group interchangeable resources for simulation.\n\nExamples: RP001, RP010, RP100\n";
            readonly type: "string";
            readonly pattern: "^RP\\d{3,}$";
        };
        readonly ViewRef: {
            readonly description: "Reference to a view (VW### pattern).\n\nViews are saved diagram configurations.\n\nExamples: VW001, VW010, VW100\n";
            readonly type: "string";
            readonly pattern: "^VW\\d{3,}$";
        };
        readonly DataObjectInput: {
            readonly description: "Reference to an entity or document as step input.\n\nInputs are read-only and don't change document state.\nUse 'inState' to require the document be in a specific lifecycle state.\n\nExamples:\n  # Simple reference\n  - ref: DC001\n  \n  # With required state\n  - ref: DC002\n    inState: approved\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref"];
            readonly properties: {
                readonly ref: {
                    readonly description: "Entity or document ID.";
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/EntityRef";
                    }, {
                        readonly $ref: "#/$defs/DocumentRef";
                    }];
                };
                readonly inState: {
                    readonly description: "Required document state (precondition).\nMust match a state from the document's lifecycle array.\nOptional - omit if any state is acceptable.\n";
                    readonly type: "string";
                };
            };
        };
        readonly DataObjectOutput: {
            readonly description: "Reference to an entity or document as step output.\n\nOutputs can change document state. Lifecycle progression:\n- First output of a document → created in first lifecycle state\n- Subsequent outputs → document advances to next lifecycle state\n- Use explicit toState for non-linear flows (rejection, rework)\n\nExamples:\n  # Simple reference (auto-advance state)\n  - ref: DC001\n  \n  # With explicit target state (for rejection/rework)\n  - ref: DC002\n    toState: draft\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref"];
            readonly properties: {
                readonly ref: {
                    readonly description: "Entity or document ID.";
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/EntityRef";
                    }, {
                        readonly $ref: "#/$defs/DocumentRef";
                    }];
                };
                readonly toState: {
                    readonly description: "Target document state after this step completes.\nMust match a state from the document's lifecycle array.\n\nUse only for non-linear flows (rejection, rework, cancellation).\nFor normal forward progression, omit this - the tool infers\nthe next state from the document's lifecycle order.\n";
                    readonly type: "string";
                };
            };
        };
        readonly CustomFields: {
            readonly description: "User-defined key-value pairs for extensibility.\n\nCustom fields allow adding domain-specific metadata without\nschema changes. Values can be strings, numbers, booleans,\nor arrays of strings/numbers.\n\nExamples:\n  custom:\n    region: \"EMEA\"\n    priority: 1\n    isLegacy: true\n    tags: [\"urgent\", \"customer-facing\"]\n";
            readonly type: "object";
            readonly additionalProperties: {
                readonly oneOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "number";
                }, {
                    readonly type: "boolean";
                }, {
                    readonly type: "array";
                    readonly items: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "number";
                        }];
                    };
                }];
            };
        };
        readonly Money: {
            readonly description: "Monetary amount with currency.\n\nUses ISO 4217 currency codes.\n\nExamples:\n  amount: 1500.00\n  currency: \"EUR\"\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["amount", "currency"];
            readonly properties: {
                readonly amount: {
                    readonly description: "Monetary amount (decimal).";
                    readonly type: "number";
                };
                readonly currency: {
                    readonly description: "ISO 4217 currency code.";
                    readonly type: "string";
                    readonly examples: readonly ["USD", "EUR", "CZK", "GBP"];
                };
            };
        };
        readonly Rate: {
            readonly description: "Cost rate with currency and time unit.\n\nUsed for actor/resource costing in simulation.\n\nExamples:\n  # Hourly rate\n  amount: 75\n  currency: \"EUR\"\n  per: h\n  \n  # Daily rate\n  amount: 500\n  currency: \"USD\"\n  per: d\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["amount", "currency", "per"];
            readonly properties: {
                readonly amount: {
                    readonly description: "Rate amount per time unit.";
                    readonly type: "number";
                };
                readonly currency: {
                    readonly description: "ISO 4217 currency code.";
                    readonly type: "string";
                };
                readonly per: {
                    readonly description: "Time unit for rate.";
                    readonly type: "string";
                    readonly enum: readonly ["h", "d", "wk", "mo"];
                };
            };
        };
        readonly DurationString: {
            readonly description: "Duration string in format: number + unit.\n\nSupported units:\n- min: minutes\n- h: hours\n- d: days\n- wk: weeks\n- mo: months\n\nExamples: \"2d\", \"4h\", \"30min\", \"1.5wk\", \"3mo\"\n";
            readonly type: "string";
            readonly pattern: "^[0-9]+(\\.[0-9]+)?(min|h|d|wk|mo)$";
        };
        readonly Duration: {
            readonly description: "Duration value: literal string or expression.\n\nThree forms (pick one):\n\n1. Direct string (shorthand for fixed literal):\n   duration: \"2d\"\n   duration: \"4h\"\n\n2. Object with fixed literal:\n   duration: { fixed: \"2d\" }\n\n3. Object with expression (calculation or work attribute):\n   duration: { expr: \"tri(d(1),d(2),d(4))\" }   # distribution\n   duration: { expr: \"baseEffort * 1.5\" }      # calculation\n   duration: { expr: adjustedEffort }          # work attribute\n";
            readonly oneOf: readonly [{
                readonly $ref: "#/$defs/DurationString";
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["fixed"];
                readonly properties: {
                    readonly fixed: {
                        readonly description: "Fixed duration literal.";
                        readonly $ref: "#/$defs/DurationString";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["expr"];
                readonly properties: {
                    readonly expr: {
                        readonly description: "Expression that evaluates to a duration.\nCan be a calculation, distribution, or work attribute.\n\nExamples:\n  tri(d(1),d(2),d(4))    # triangular distribution\n  baseEffort * 1.5       # calculation\n  adjustedEffort         # work attribute\n";
                        readonly type: "string";
                    };
                };
            }];
        };
        readonly TimeString: {
            readonly description: "Time in HH:MM format (24-hour).\n\nExamples: \"08:00\", \"17:30\", \"00:00\", \"23:59\"\n";
            readonly type: "string";
            readonly pattern: "^[0-2][0-9]:[0-5][0-9]$";
        };
        readonly DateString: {
            readonly description: "Date in ISO 8601 format (YYYY-MM-DD).\n\nExamples: \"2026-01-03\", \"2025-12-31\"\n";
            readonly type: "string";
            readonly format: "date";
        };
        readonly Month: {
            readonly description: "Three-letter month abbreviation.\nUsed for scenario arrival patterns.\n";
            readonly type: "string";
            readonly enum: readonly ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        };
        readonly Weekday: {
            readonly description: "Three-letter weekday abbreviation.\nUsed for calendar work day configuration.\n";
            readonly type: "string";
            readonly enum: readonly ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        };
        readonly Expression: {
            readonly description: "TypeScript-subset expression string (ts-subset-v1).\n\nExpressions can be:\n- Calculations: \"orderValue > 50000 && customer.segment == 'enterprise'\"\n- Work attribute references: isHighValue (a simple variable name)\n\nWORK ATTRIBUTES:\nExpressions can reference work attributes defined in workAttributes[]:\n- bindsTo: keys that map to information model attributes\n- expr: computed keys that derive values from other attributes\n\nUSAGE EXAMPLES:\n  # In guards\n  guard: \"isHighValue && customer.segment == 'enterprise'\"\n  guard: isHighValue\n  \n  # In durations\n  duration: { expr: \"adjustedEffort * 1.2\" }\n  duration: { expr: adjustedEffort }\n\nALLOWED SYNTAX:\n- Literals: number, string, boolean, null\n- Operators: + - * / %, comparisons, && || !, ternary (cond ? a : b)\n- Property access: customer.region, order.value\n- Work attribute keys: orderValue, isHighValue, adjustedEffort\n- Built-in functions: tri(min,mode,max), min(...), max(...), \n  clamp(x,lo,hi), round(x,digits?), floor(x), ceil(x)\n- Duration helpers: min(x), h(x), d(x), wk(x), mo(x)\n\nDISALLOWED:\n- Assignments, loops, if statements\n- new, classes, imports\n- Global access (window, globalThis, etc.)\n";
            readonly type: "string";
        };
        readonly Annotation: {
            readonly description: "Notes and markers attached to steps or blocks.\n\nUse annotations for:\n- note: free-form documentation or clarification\n- compliance: regulatory/compliance markers (e.g., SOX, GDPR)\n- sla: service level agreement markers\n- warning: cautions or risk indicators\n\nIMPORTANT: Milestones are NOT annotations. Use Step.kind = 'milestone'\nto create a real milestone node in the process graph. Milestones are\nsignificant process checkpoints that can be referenced by Phases.\n\nExamples:\n  annotations:\n    - type: compliance\n      text: \"GDPR data handling requirements\"\n      code: \"GDPR-Art17\"\n    - type: sla\n      text: \"Must complete within 4 hours\"\n      code: \"SLA-RESP-4H\"\n";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["text"];
            readonly properties: {
                readonly type: {
                    readonly description: "Annotation type. Each type may be rendered differently in diagrams:\n- note: informational callout\n- compliance: regulatory badge with code reference\n- sla: timing/performance indicator\n- warning: alert/caution marker\n";
                    readonly type: "string";
                    readonly enum: readonly ["note", "compliance", "sla", "warning"];
                };
                readonly text: {
                    readonly description: "The annotation content displayed to users.";
                    readonly type: "string";
                };
                readonly code: {
                    readonly description: "External reference code for traceability.\nExamples: \"FAST 1.1\", \"SOX-42\", \"GDPR-Art17\", \"SLA-RESP-4H\"\n";
                    readonly type: "string";
                };
            };
        };
        readonly StepLifecycleEvent: {
            readonly description: "Events in a step's lifecycle that can trigger notifications or actions.\n\nUsed by:\n- Notification.trigger: when to send alerts\n- Future: automation hooks, audit logging\n\nEVENTS:\n- onStart: step begins execution\n- onComplete: step finishes successfully\n- onError: step fails or encounters an error\n- onAssign: step is assigned to a resource\n- onReassign: step is reassigned to different resource\n- onOutcome: specific approval/decision outcome reached\n- onReviewComplete: all required reviews received\n- onDeadlineWarning: approaching deadline (requires threshold)\n- onDeadlineBreach: deadline exceeded\n";
            readonly type: "string";
            readonly enum: readonly ["onStart", "onComplete", "onError", "onAssign", "onReassign", "onOutcome", "onReviewComplete", "onDeadlineWarning", "onDeadlineBreach"];
        };
        readonly ProcessTriggerEvent: {
            readonly description: "Events that can trigger cross-process orchestration.\n\nUsed by ProcessTrigger.event to start another process.\n\nEVENTS:\n- onComplete: source step finishes successfully\n- onStart: source step begins execution\n- onError: source step fails or encounters an error\n";
            readonly type: "string";
            readonly enum: readonly ["onComplete", "onStart", "onError"];
        };
        readonly StandardOutcome: {
            readonly description: "Common approval/decision outcomes for consistency across processes.\n\nThese are the recommended standard outcomes. Custom outcomes can\nstill be defined in Approval.outcomes as strings.\n\nSTANDARD OUTCOMES:\n- approved: request accepted, proceed with next steps\n- rejected: request denied, typically ends the flow or returns\n- returned: sent back for revision (not denied, needs rework)\n- deferred: decision postponed to a later time\n- escalated: decision elevated to higher authority\n- timeout: deadline breached without decision\n";
            readonly type: "string";
            readonly enum: readonly ["approved", "rejected", "returned", "deferred", "escalated", "timeout"];
        };
        readonly Priority: {
            readonly description: "Priority levels for notifications, tasks, and work items.\n\nLEVELS:\n- low: informational, can be batched or delayed\n- normal: standard handling (default)\n- high: prompt attention, visual emphasis\n- urgent: immediate action required, may trigger escalation\n";
            readonly type: "string";
            readonly enum: readonly ["low", "normal", "high", "urgent"];
        };
        readonly CommentRequirement: {
            readonly description: "When comments are required from approvers or reviewers.\n\nVALUES:\n- never: comments optional (default)\n- onNegative: required when rejecting, returning, or flagging issues\n- always: required for all responses\n";
            readonly type: "string";
            readonly enum: readonly ["never", "onNegative", "always"];
        };
    };
};
/** Document schemas by type */
declare const documentSchemas: Record<DocumentType, object>;
/** Fragment schemas by name */
declare const fragmentSchemas: Record<string, object>;
/**
 * Get all schemas as a map keyed by $id.
 * Useful for Ajv's loadSchema callback.
 */
declare function getAllSchemasById(): Map<string, object>;

export { defsSchema, documentSchemas, fragmentSchemas, getAllSchemasById, rootSchema };
