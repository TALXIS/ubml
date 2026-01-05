import * as eslint from 'eslint';
import { Rule } from 'eslint';

/**
 * ESLint plugin definition for UBML.
 */
/**
 * UBML ESLint plugin.
 */
declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'valid-ubml': eslint.Rule.RuleModule;
    };
};
/**
 * Predefined configurations.
 */
declare const configs: {
    /**
     * Recommended configuration for UBML files.
     */
    recommended: {
        plugins: {
            ubml: {
                meta: {
                    name: string;
                    version: string;
                };
                rules: {
                    'valid-ubml': eslint.Rule.RuleModule;
                };
            };
        };
        rules: {
            'ubml/valid-ubml': string;
        };
    };
};

/**
 * ESLint rule for validating UBML documents.
 *
 * Uses the browser-safe parser and validator directly,
 * no file system operations needed.
 */

/**
 * ESLint rule for validating UBML documents.
 */
declare const validUbmlRule: Rule.RuleModule;

export { configs, plugin as default, validUbmlRule };
