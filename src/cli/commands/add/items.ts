/**
 * Item Generators for UBML CLI Add Command
 *
 * Generate sample items for different document sections.
 *
 * @module ubml/cli/commands/add/items
 */

import { 
  type DocumentType, 
  type IdPrefix,
  ID_CONFIG,
  formatId,
} from '../../../metadata.js';
import { TEMPLATE_DATA } from '../../../templates.js';

export interface SectionItem {
  id: string;
  properties: Record<string, unknown>;
  commentedProps?: Record<string, unknown>;
}

/**
 * Format a name for display in comments.
 */
export function formatDisplayName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate sample items for a section based on document type and section.
 */
export function generateSectionItems(
  docType: DocumentType,
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const items: SectionItem[] = [];
  const prefix = section.idPrefix;
  
  // Build required properties from schema
  const requiredProps: Record<string, unknown> = {};
  const optionalProps: Record<string, unknown> = {};
  
  for (const prop of section.properties) {
    if (prop.required) {
      if (prop.name === 'name') {
        requiredProps.name = 'TODO: Add name';
      } else if (prop.name === 'id') {
        // id will be set from the key
        requiredProps.id = formatId(prefix as IdPrefix, ID_CONFIG.addOffset);
      } else if (prop.enumValues && prop.enumValues.length > 0) {
        // Use first enum value as default, or schema default
        requiredProps[prop.name] = prop.default ?? prop.enumValues[0];
      } else if (prop.default !== undefined) {
        requiredProps[prop.name] = prop.default;
      } else if (prop.type === 'ref') {
        // Reference fields should use a placeholder ID pattern
        // Uses addOffset series to avoid conflicts with init templates
        requiredProps[prop.name] = formatId('AC', ID_CONFIG.addOffset);
      } else {
        requiredProps[prop.name] = 'TODO';
      }
    } else {
      // Collect interesting optional props to show as comments
      if (['description', 'duration', 'unit', 'target', 'baseline'].includes(prop.name)) {
        if (prop.enumValues && prop.enumValues.length > 0) {
          optionalProps[prop.name] = prop.enumValues[0];
        } else if (prop.type === 'string') {
          optionalProps[prop.name] = '...';
        } else if (prop.type === 'number') {
          optionalProps[prop.name] = 0;
        }
      }
    }
  }
  
  // Apply section defaults from schema
  if (section.defaults) {
    Object.assign(requiredProps, section.defaults);
  }
  
  // Handle special cases per document/section type
  switch (docType) {
    case 'process':
      if (section.name === 'processes') {
        return generateProcessItems(section, name);
      }
      break;
    case 'actors':
      if (section.name === 'actors') {
        return generateActorItems(section);
      }
      if (section.name === 'skills') {
        return generateSkillItems(section);
      }
      break;
    case 'hypotheses':
      if (section.name === 'hypothesisTrees') {
        return generateHypothesisTreeItems(section, name);
      }
      break;
  }
  
  // Default: single item with required props
  // Uses addOffset series to avoid conflicts with init templates
  items.push({
    id: formatId(prefix as IdPrefix, ID_CONFIG.addOffset),
    properties: requiredProps,
    commentedProps: Object.keys(optionalProps).length > 0 ? optionalProps : undefined,
  });
  
  return items;
}

/**
 * Generate process items with proper step structure.
 */
export function generateProcessItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const displayName = formatDisplayName(name);
  
  // Use centralized ID generation with addOffset
  const offset = ID_CONFIG.addOffset;
  const prId = formatId('PR', offset);
  const st1 = formatId('ST', offset);
  const st2 = formatId('ST', offset + 1);
  const stEnd = formatId('ST', offset + 199);
  const acRef = formatId('AC', offset);
  
  // Build steps inline - processes need nested structure
  const processContent = `
    id: ${prId}
    name: "${displayName}"
    description: "TODO: Describe what this process achieves"
    level: 3
    steps:
      ${st1}:
        name: "Start"
        kind: start
        description: "Process entry point"
      ${st2}:
        name: "First Activity"
        kind: action
        description: "TODO: What happens in this step?"
        # duration: "1h"
        # RACI:
        #   responsible: [${acRef}]
      ${stEnd}:
        name: "End"
        kind: end
        description: "Process completes"
    links:
      - from: ${st1}
        to: ${st2}
      - from: ${st2}
        to: ${stEnd}`;
  
  // Return as raw YAML to preserve nesting
  return [{
    id: prId,
    properties: {
      __raw: processContent,
    },
  }];
}

/**
 * Generate actor items with different types.
 */
export function generateActorItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number]
): SectionItem[] {
  const defaults = section.defaults || {};
  const offset = ID_CONFIG.addOffset;
  
  return [
    {
      id: formatId('AC', offset),
      properties: {
        name: 'Process Owner',
        type: defaults.type ?? 'role',
        kind: defaults.kind ?? 'human',
        description: 'Responsible for process outcomes',
      },
    },
    {
      id: formatId('AC', offset + 10),
      properties: {
        name: 'Core System',
        type: 'system',
        kind: 'system',
        description: 'Primary application',
      },
    },
  ];
}

/**
 * Generate skill items.
 */
export function generateSkillItems(
  _section: typeof TEMPLATE_DATA[DocumentType]['sections'][number]
): SectionItem[] {
  return [
    {
      id: formatId('SK', ID_CONFIG.addOffset),
      properties: {
        name: 'Domain Expertise',
        description: 'Deep knowledge of the business domain',
      },
    },
  ];
}

/**
 * Generate hypothesis tree items with proper nested structure.
 */
export function generateHypothesisTreeItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const displayName = formatDisplayName(name);
  const offset = ID_CONFIG.addOffset;
  // HT pattern for hypothesis trees (not a standard IdPrefix in metadata)
  const htId = `HT${String(offset).padStart(ID_CONFIG.digitLength, '0')}`;
  
  // H prefix is used for hypothesis nodes within a tree
  const h1 = `H${String(offset).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  const h2 = `H${String(offset + 1).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  const h3 = `H${String(offset + 2).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  
  const treeContent = `
    name: "${displayName} Analysis"
    SCQH:
      situation: "TODO: Current state description"
      complication: "TODO: What problem exists?"
      question: "How can we improve?"
      hypothesis: "By doing X we can achieve Y"
    root:
      id: ${h1}
      text: "Main hypothesis to validate"
      type: hypothesis
      status: untested
      children:
        - id: ${h2}
          text: "Sub-hypothesis 1"
          type: hypothesis
          status: untested
        - id: ${h3}
          text: "Sub-hypothesis 2"
          type: hypothesis
          status: untested`;
  
  return [{
    id: htId,
    properties: {
      __raw: treeContent,
    },
  }];
}
