/**
 * Init command for UBML CLI.
 */

import { Command } from 'commander';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { serializeToString } from '../../serializer/index.js';
import { DOCUMENT_TYPES, SCHEMA_VERSION, SCHEMA_PATHS } from '../../schemas/loader.js';
import { CLI_MESSAGES, SUCCESS_MESSAGES } from '../../validator/messages.js';

/**
 * Generate VS Code YAML schema settings from document types.
 */
function generateVscodeSchemaSettings(): Record<string, string> {
  const settings: Record<string, string> = {};
  for (const type of DOCUMENT_TYPES) {
    const schemaUrl = `https://ubml.io/schemas/${SCHEMA_VERSION}/${SCHEMA_PATHS.documents[type]}`;
    const filePattern = `*.${type}.ubml.yaml`;
    settings[schemaUrl] = filePattern;
  }
  return settings;
}

/**
 * Document template type.
 */
type TemplateType = 'workspace' | 'process' | 'actors';

/**
 * Template factory for creating UBML document templates.
 */
function createDocumentTemplate(type: TemplateType, name?: string): unknown {
  const base = { ubml: SCHEMA_VERSION };

  switch (type) {
    case 'workspace':
      return {
        ...base,
        name: name ?? 'UBML Workspace',
        description: `${name ?? 'UBML'} workspace`,
        status: 'draft',
        organization: {
          name: 'Your Organization',
          department: 'Department',
        },
        documents: [],
      };

    case 'process':
      return {
        ...base,
        processes: {
          PR001: {
            name: 'Sample Process',
            description: 'A sample business process',
            level: 'L3',
            steps: {
              ST001: {
                name: 'First Step',
                type: 'task',
                description: 'Description of the first step',
              },
              ST002: {
                name: 'Second Step',
                type: 'task',
                description: 'Description of the second step',
              },
            },
          },
        },
      };

    case 'actors':
      return {
        ...base,
        actors: {
          AC001: {
            name: 'Sample Actor',
            type: 'role',
            description: 'A sample actor/role',
          },
        },
      };
  }
}

/**
 * Create the init command.
 */
export function initCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize a new UBML workspace')
    .argument('<name>', 'Workspace name')
    .option('-d, --dir <directory>', 'Directory to create workspace in', '.')
    .action((name: string, options: { dir: string }) => {
      const workspaceDir = resolve(options.dir, name);
      const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Check if directory exists
      if (existsSync(workspaceDir)) {
        console.error(CLI_MESSAGES.DIRECTORY_EXISTS(workspaceDir));
        process.exit(1);
      }

      // Create directory
      mkdirSync(workspaceDir, { recursive: true });
      console.log(SUCCESS_MESSAGES.CREATED_DIR(workspaceDir));

      // Create workspace file
      const workspaceFile = join(workspaceDir, `${safeName}.workspace.ubml.yaml`);
      writeFileSync(workspaceFile, serializeToString(createDocumentTemplate('workspace', name)));
      console.log(SUCCESS_MESSAGES.CREATED_FILE(workspaceFile));

      // Create sample process file
      const processFile = join(workspaceDir, 'sample.process.ubml.yaml');
      writeFileSync(processFile, serializeToString(createDocumentTemplate('process')));
      console.log(SUCCESS_MESSAGES.CREATED_FILE(processFile));

      // Create sample actors file
      const actorsFile = join(workspaceDir, 'organization.actors.ubml.yaml');
      writeFileSync(actorsFile, serializeToString(createDocumentTemplate('actors')));
      console.log(SUCCESS_MESSAGES.CREATED_FILE(actorsFile));

      // Create VS Code settings
      const vscodeDir = join(workspaceDir, '.vscode');
      mkdirSync(vscodeDir, { recursive: true });
      
      const vscodeSettings = {
        'yaml.schemas': generateVscodeSchemaSettings(),
      };
      writeFileSync(
        join(vscodeDir, 'settings.json'),
        JSON.stringify(vscodeSettings, null, 2)
      );
      console.log(SUCCESS_MESSAGES.CREATED_FILE(join(vscodeDir, 'settings.json')));

      console.log(`\n${SUCCESS_MESSAGES.WORKSPACE_CREATED}`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${name}`);
      console.log(`  npx ubml validate .`);
    });

  return command;
}
