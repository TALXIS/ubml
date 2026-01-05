/**
 * UBML TypeScript Types
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * These types are generated from the YAML schemas in /schemas.
 * They provide type-safe access to UBML document structures.
 * 
 * @module ubml/types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// =============================================================================
// REFERENCE TYPES (Branded strings for type safety)
// =============================================================================

/** ActorRef (AC### pattern) */
export type ActorRef = string & { readonly __brand: 'ActorRef' };

/** BlockRef (BK### pattern) */
export type BlockRef = string & { readonly __brand: 'BlockRef' };

/** CapabilityRef (CP### pattern) */
export type CapabilityRef = string & { readonly __brand: 'CapabilityRef' };

/** DocumentRef (DC### pattern) */
export type DocumentRef = string & { readonly __brand: 'DocumentRef' };

/** EntityRef (EN### pattern) */
export type EntityRef = string & { readonly __brand: 'EntityRef' };

/** EquipmentRef (EQ### pattern) */
export type EquipmentRef = string & { readonly __brand: 'EquipmentRef' };

/** EvidenceRef (EV### pattern) */
export type EvidenceRef = string & { readonly __brand: 'EvidenceRef' };

/** HypothesisRef (HY### pattern) */
export type HypothesisRef = string & { readonly __brand: 'HypothesisRef' };

/** KpiRef (KP### pattern) */
export type KpiRef = string & { readonly __brand: 'KpiRef' };

/** LocationRef (LC### pattern) */
export type LocationRef = string & { readonly __brand: 'LocationRef' };

/** ProductRef (PD### pattern) */
export type ProductRef = string & { readonly __brand: 'ProductRef' };

/** PortfolioRef (PF### pattern) */
export type PortfolioRef = string & { readonly __brand: 'PortfolioRef' };

/** PhaseRef (PH### pattern) */
export type PhaseRef = string & { readonly __brand: 'PhaseRef' };

/** ProcessRef (PR### pattern) */
export type ProcessRef = string & { readonly __brand: 'ProcessRef' };

/** PersonaRef (PS### pattern) */
export type PersonaRef = string & { readonly __brand: 'PersonaRef' };

/** ResourcePoolRef (RP### pattern) */
export type ResourcePoolRef = string & { readonly __brand: 'ResourcePoolRef' };

/** ScenarioRef (SC### pattern) */
export type ScenarioRef = string & { readonly __brand: 'ScenarioRef' };

/** SkillRef (SK### pattern) */
export type SkillRef = string & { readonly __brand: 'SkillRef' };

/** StepRef (ST### pattern) */
export type StepRef = string & { readonly __brand: 'StepRef' };

/** ServiceRef (SV### pattern) */
export type ServiceRef = string & { readonly __brand: 'ServiceRef' };

/** ValueStreamRef (VS### pattern) */
export type ValueStreamRef = string & { readonly __brand: 'ValueStreamRef' };

/** ViewRef (VW### pattern) */
export type ViewRef = string & { readonly __brand: 'ViewRef' };

/** Helper to create typed references */
export function createRef<T extends string>(id: string): T {
  return id as T;
}

// =============================================================================
// PRIMITIVE TYPES
// =============================================================================

/** Duration string (e.g., "2h", "30min", "1.5d") */
export type Duration = string;

/** Time string in HH:MM format */
export type Time = string;

/** Money amount (e.g., "$100", "100 USD") */
export type Money = string;

/** Date string in ISO format */
export type ISODate = string;

/** DateTime string in ISO format */
export type ISODateTime = string;

/** Rate expression (e.g., "10/h", "100/wk") */
export type Rate = string;

/** Custom fields object */
export type CustomFields = Record<string, unknown>;

// =============================================================================
// ACTOR TYPES
// =============================================================================

export type ActorType = 'person' | 'role' | 'team' | 'system' | 'organization' | 'external' | 'customer';
export type ActorKind = 'human' | 'org' | 'system';

export interface Actor {
  name: string;
  type: ActorType;
  kind: ActorKind;
  description?: string;
  isExternal?: boolean;
  skills?: SkillRef[];
  reportingTo?: ActorRef;
  members?: ActorRef[];
  contact?: ContactInfo;
  custom?: CustomFields;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

// =============================================================================
// PROCESS TYPES
// =============================================================================

export type ProcessLevel = 1 | 2 | 3 | 4;
export type ProcessStatus = 'draft' | 'review' | 'approved' | 'deprecated';

export interface Process {
  id: string;
  name: string;
  description?: string;
  level?: ProcessLevel;
  status?: ProcessStatus;
  owner?: ActorRef;
  steps?: Record<string, Step>;
  links?: Link[];
  phases?: Record<string, Phase>;
  triggers?: ProcessTrigger[];
  custom?: CustomFields;
}

// =============================================================================
// STEP TYPES
// =============================================================================

export type StepKind = 'task' | 'event' | 'gateway' | 'milestone' | 'subprocess' | 'block';
export type GatewayType = 'exclusive' | 'parallel' | 'inclusive' | 'event';
export type BlockOperator = 'par' | 'alt' | 'loop' | 'opt';

export interface Step {
  name: string;
  kind: StepKind;
  description?: string;
  responsible?: ActorRef;
  accountable?: ActorRef;
  duration?: Duration;
  cost?: Money;
  inputs?: DataFlow[];
  outputs?: DataFlow[];
  raci?: RACI;
  gatewayType?: GatewayType;
  conditions?: GatewayCondition[];
  operator?: BlockOperator;
  children?: StepRef[];
  subprocess?: ProcessRef;
  custom?: CustomFields;
}

export interface DataFlow {
  ref: EntityRef | DocumentRef;
  name?: string;
  description?: string;
}

export interface RACI {
  responsible?: ActorRef[];
  accountable?: ActorRef[];
  consulted?: ActorRef[];
  informed?: ActorRef[];
}

export interface GatewayCondition {
  to: StepRef;
  condition?: string;
  probability?: number;
  isDefault?: boolean;
}

// =============================================================================
// LINK TYPES
// =============================================================================

export type LinkType = 'sequence' | 'message' | 'signal' | 'timer' | 'conditional' | 'default';

export interface Link {
  from: StepRef;
  to: StepRef;
  type?: LinkType;
  condition?: string;
  label?: string;
  probability?: number;
}

// =============================================================================
// PHASE TYPES
// =============================================================================

export type PhaseKind = 'lifecycle' | 'delivery';

export interface Phase {
  name: string;
  kind: PhaseKind;
  description?: string;
  entryCriteria?: string;
  exitCriteria?: string;
  startMilestone?: StepRef;
  endMilestone?: StepRef;
  includeSteps?: StepRef[];
}

export interface ProcessTrigger {
  name: string;
  type: 'event' | 'schedule' | 'message' | 'signal';
  source?: ProcessRef | ActorRef;
  schedule?: string;
  description?: string;
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export type EntityType = 'master' | 'transactional' | 'reference' | 'document';

export interface Entity {
  name: string;
  type?: EntityType;
  description?: string;
  attributes?: Record<string, Attribute>;
  relationships?: Relationship[];
  custom?: CustomFields;
}

export interface Attribute {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
}

export interface Relationship {
  target: EntityRef;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  name?: string;
  description?: string;
}

// =============================================================================
// HYPOTHESIS TYPES
// =============================================================================

export type HypothesisType = 'root' | 'supporting' | 'assumption';
export type HypothesisStatus = 'untested' | 'testing' | 'validated' | 'invalidated';

export interface HypothesisTree {
  name: string;
  scqh: SCQH;
  hypotheses?: Record<string, Hypothesis>;
  evidence?: Record<string, Evidence>;
  custom?: CustomFields;
}

export interface SCQH {
  situation: string;
  complication: string;
  question: string;
  hypothesis: string;
}

export interface Hypothesis {
  name: string;
  type: HypothesisType;
  description?: string;
  status?: HypothesisStatus;
  children?: HypothesisRef[];
  evidence?: string[];
}

export interface Evidence {
  type: 'observation' | 'data' | 'interview' | 'document' | 'analysis';
  title: string;
  description?: string;
  source?: string;
  linkedHypotheses?: HypothesisRef[];
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export interface BaseDocument {
  ubml: '1.0';
  name?: string;
  description?: string;
  metadata?: DocumentMetadata;
  tags?: string[];
  custom?: CustomFields;
}

export interface DocumentMetadata {
  createdAt?: ISODateTime;
  createdBy?: string;
  updatedAt?: ISODateTime;
  updatedBy?: string;
}

export interface ProcessDocument extends BaseDocument {
  processes: Record<string, Process>;
}

export interface ActorsDocument extends BaseDocument {
  actors?: Record<string, Actor>;
  skills?: Record<string, Skill>;
  resourcePools?: Record<string, ResourcePool>;
}

export interface EntitiesDocument extends BaseDocument {
  entities?: Record<string, Entity>;
  documents?: Record<string, DocumentDef>;
  locations?: Record<string, Location>;
}

export interface WorkspaceDocument extends BaseDocument {
  organization?: Organization;
  scope?: Scope;
  settings?: WorkspaceSettings;
  documents?: string[];
}

export interface HypothesesDocument extends BaseDocument {
  hypothesisTrees?: Record<string, HypothesisTree>;
}

export interface ScenariosDocument extends BaseDocument {
  scenarios?: Record<string, Scenario>;
}

export interface StrategyDocument extends BaseDocument {
  valueStreams?: Record<string, ValueStream>;
  capabilities?: Record<string, Capability>;
  portfolios?: Record<string, Portfolio>;
}

export interface MetricsDocument extends BaseDocument {
  kpis?: Record<string, KPI>;
  roiAnalyses?: Record<string, ROIAnalysis>;
}

export interface MiningDocument extends BaseDocument {
  miningSources?: Record<string, MiningSource>;
}

export interface ViewsDocument extends BaseDocument {
  views?: Record<string, View>;
}

export interface LinksDocument extends BaseDocument {
  links?: ExternalLink[];
}

export interface GlossaryDocument extends BaseDocument {
  terms?: Record<string, Term>;
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

export interface Skill {
  name: string;
  description?: string;
  category?: string;
}

export interface ResourcePool {
  name: string;
  members?: ActorRef[];
  capacity?: number;
  skills?: SkillRef[];
}

export interface DocumentDef {
  name: string;
  description?: string;
  entity?: EntityRef;
  format?: string;
}

export interface Location {
  name: string;
  description?: string;
  address?: string;
  type?: string;
}

export interface Organization {
  name: string;
  department?: string;
  description?: string;
}

export interface Scope {
  inScope?: string[];
  outOfScope?: string[];
  assumptions?: string[];
  constraints?: string[];
}

export interface WorkspaceSettings {
  defaultCurrency?: string;
  defaultTimezone?: string;
  workingHoursPerDay?: number;
  workingDaysPerWeek?: number;
}

export interface Scenario {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ValueStream {
  name: string;
  description?: string;
  stages?: string[];
}

export interface Capability {
  name: string;
  description?: string;
  level?: number;
}

export interface Portfolio {
  name: string;
  description?: string;
  products?: ProductRef[];
  services?: ServiceRef[];
}

export interface KPI {
  name: string;
  description?: string;
  unit?: string;
  target?: number;
  current?: number;
}

export interface ROIAnalysis {
  name: string;
  description?: string;
  costs?: Money;
  benefits?: Money;
}

export interface MiningSource {
  name: string;
  type: string;
  description?: string;
}

export interface View {
  name: string;
  description?: string;
  type: string;
  elements?: string[];
}

export interface ExternalLink {
  url: string;
  title?: string;
  description?: string;
}

export interface Term {
  name: string;
  definition: string;
  synonyms?: string[];
  related?: string[];
}

// =============================================================================
// UNION TYPE FOR ALL DOCUMENTS
// =============================================================================

export type UBMLDocumentContent =
  | ProcessDocument
  | ActorsDocument
  | EntitiesDocument
  | WorkspaceDocument
  | HypothesesDocument
  | ScenariosDocument
  | StrategyDocument
  | MetricsDocument
  | MiningDocument
  | ViewsDocument
  | LinksDocument
  | GlossaryDocument;
