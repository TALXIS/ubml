/**
 * Schema Introspection
 *
 * Query schema metadata for CLI and consumer use.
 * Reads structured information from x-ubml and x-ubml-cli extensions.
 *
 * @module ubml/schema/introspection
 */

// Re-export all functions and types
export {
  getDocumentTypeInfo,
  getAllDocumentTypes,
  getDocumentTypesByCategory,
} from './document-info.js';

export {
  getAllElementTypes,
  getElementTypeInfo,
  getIdPrefixInfo,
  getAllIdPrefixes,
  getConceptInfo,
} from './element-info.js';

export {
  getSuggestedWorkflow,
  getSuggestedNextStep,
  getHelpTopics,
  getHelpTopicsByCategory,
  findHelpTopic,
  type HelpTopicCategory,
  type HelpTopic,
} from './workflow.js';
