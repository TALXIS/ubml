/**
 * Workflow and Help Information
 *
 * Workflow suggestions and help topics derived from schemas.
 *
 * @module ubml/schema/introspection/workflow
 */

import { type DocumentType } from '../../generated/data.js';
import type { WorkflowStep } from '../types.js';
import { getAllDocumentTypes } from './document-info.js';
import { getElementTypeInfo } from './element-info.js';

/**
 * Get suggested workflow order from schema metadata.
 */
export function getSuggestedWorkflow(): WorkflowStep[] {
  const all = getAllDocumentTypes();

  // Filter to those with workflow order and sort
  const ordered = all
    .filter((info) => info.workflowOrder < 99)
    .sort((a, b) => a.workflowOrder - b.workflowOrder);

  return ordered.map((info) => ({
    step: info.workflowOrder,
    type: info.type,
    reason: info.gettingStarted[0] ?? info.shortDescription,
  }));
}

/**
 * Get suggested next document type based on what exists.
 * Returns the next workflow step info, or undefined if all types exist.
 */
export function getSuggestedNextStep(existingTypes: DocumentType[]): WorkflowStep | undefined {
  const workflow = getSuggestedWorkflow();
  const existing = new Set(existingTypes);

  for (const step of workflow) {
    if (!existing.has(step.type)) {
      return step;
    }
  }

  return undefined;
}

/**
 * Help topic category.
 */
export type HelpTopicCategory = 'getting-started' | 'documents' | 'elements' | 'reference';

/**
 * Information about a help topic.
 */
export interface HelpTopic {
  /** Topic name (used as argument to `ubml help <topic>`) */
  name: string;
  /** Aliases for this topic */
  aliases?: string[];
  /** Short description for topic list */
  description: string;
  /** Topic category for grouping */
  category: HelpTopicCategory;
  /** Display order within category */
  order: number;
  /** Topic type for routing */
  type: 'static' | 'document' | 'element';
}

/**
 * Get all help topics derived from schema.
 * 
 * This provides a schema-driven topic list for the help command.
 * Static topics (quickstart, concepts, etc.) are listed first,
 * then document types and element types are derived from schema.
 */
export function getHelpTopics(): HelpTopic[] {
  const topics: HelpTopic[] = [];

  // Static topics (getting started and reference)
  const staticTopics: HelpTopic[] = [
    {
      name: 'quickstart',
      aliases: ['start'],
      description: 'Quick start guide',
      category: 'getting-started',
      order: 1,
      type: 'static',
    },
    {
      name: 'concepts',
      aliases: ['overview'],
      description: 'Core UBML concepts',
      category: 'getting-started',
      order: 2,
      type: 'static',
    },
    {
      name: 'workflow',
      description: 'Recommended modeling order',
      category: 'getting-started',
      order: 3,
      type: 'static',
    },
    {
      name: 'ids',
      description: 'ID pattern reference',
      category: 'reference',
      order: 1,
      type: 'static',
    },
    {
      name: 'duration',
      description: 'Duration format guide',
      category: 'reference',
      order: 2,
      type: 'static',
    },
    {
      name: 'raci',
      description: 'RACI matrix explained',
      category: 'reference',
      order: 3,
      type: 'static',
    },
    {
      name: 'vscode',
      aliases: ['editor'],
      description: 'VS Code setup and tips',
      category: 'reference',
      order: 4,
      type: 'static',
    },
  ];
  topics.push(...staticTopics);

  // Document types from schema
  const docTypes = getAllDocumentTypes();
  for (const docInfo of docTypes) {
    topics.push({
      name: docInfo.type,
      description: docInfo.shortDescription || docInfo.title,
      category: 'documents',
      order: docInfo.workflowOrder,
      type: 'document',
    });
  }

  // Key element types from fragments
  const elementTopics: Array<{ name: string; description: string; order: number }> = [
    { name: 'step', description: 'Process step properties', order: 1 },
    { name: 'actor', description: 'Actor properties and types', order: 2 },
    { name: 'entity', description: 'Entity properties', order: 3 },
    { name: 'hypothesis', description: 'Hypothesis properties', order: 4 },
    { name: 'scenario', description: 'Scenario properties', order: 5 },
  ];

  for (const elem of elementTopics) {
    // Only add if we have schema info
    const info = getElementTypeInfo(elem.name);
    if (info) {
      topics.push({
        name: elem.name,
        description: info.description || elem.description,
        category: 'elements',
        order: elem.order,
        type: 'element',
      });
    }
  }

  return topics;
}

/**
 * Get help topics grouped by category.
 */
export function getHelpTopicsByCategory(): Record<HelpTopicCategory, HelpTopic[]> {
  const topics = getHelpTopics();
  const grouped: Record<HelpTopicCategory, HelpTopic[]> = {
    'getting-started': [],
    'documents': [],
    'elements': [],
    'reference': [],
  };

  for (const topic of topics) {
    grouped[topic.category].push(topic);
  }

  // Sort each category by order
  for (const category of Object.keys(grouped) as HelpTopicCategory[]) {
    grouped[category].sort((a, b) => a.order - b.order);
  }

  return grouped;
}

/**
 * Find a help topic by name or alias.
 */
export function findHelpTopic(name: string): HelpTopic | undefined {
  const normalized = name.toLowerCase();
  const topics = getHelpTopics();

  for (const topic of topics) {
    if (topic.name === normalized) return topic;
    if (topic.aliases?.includes(normalized)) return topic;
  }

  return undefined;
}
