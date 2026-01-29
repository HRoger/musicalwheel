#!/usr/bin/env node
/**
 * AI-Assisted Batch Conversion: WordPress FSE Blocks → Next.js Components
 *
 * This script automatically converts WordPress FSE blocks (Option C+) to Next.js
 * block renderers by analyzing block.json, edit.tsx, save.tsx, and hooks.
 *
 * Prerequisites:
 * - All 34 WordPress FSE blocks completed
 * - Voxel REST API endpoints functional
 * - Next.js project structure exists
 *
 * Usage:
 *   npx tsx scripts/convert-blocks-to-nextjs.ts
 *   npx tsx scripts/convert-blocks-to-nextjs.ts --blocks search-form,create-post
 *   npx tsx scripts/convert-blocks-to-nextjs.ts --dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface BlockMetadata {
  name: string;
  blockName: string;
  title: string;
  attributes: Record<string, AttributeConfig>;
  components: string[];
  hooks: string[];
  dataAttributes: Record<string, string>;
}

interface AttributeConfig {
  type: string;
  default?: any;
}

interface GeneratedFiles {
  component: string;
  propsInterface: string;
  parseFunction: string;
  hook?: string;
}

interface ConversionResult {
  blockName: string;
  status: 'success' | 'error';
  error?: Error;
  filesGenerated?: string[];
}

// Configuration
const CONFIG = {
  wordpressBlocksPath: 'themes/voxel-fse/app/blocks/src',
  nextjsOutputPath: 'apps/musicalwheel-frontend/components/blocks',
  nextjsHooksPath: 'apps/musicalwheel-frontend/lib/hooks',
  wpApiUrl: 'https://wp.musicalwheel.com/wp-json',
};

// Component translation mappings
const COMPONENT_MAPPINGS: Record<string, string> = {
  SelectControl: `<select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border rounded-md px-3 py-2"
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>`,

  TextControl: `<input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={label}
    className="border rounded-md px-3 py-2 w-full"
  />`,

  CheckboxControl: `<label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>{label}</span>
  </label>`,

  Button: `<button
    onClick={onClick}
    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
  >
    {children}
  </button>`,
};

/**
 * Main conversion orchestrator
 */
async function convertBlocksToNextJS(options: { blocks?: string[]; dryRun?: boolean } = {}) {
  console.log('🚀 Starting AI-assisted batch conversion...\n');
  console.log(`📁 WordPress blocks: ${CONFIG.wordpressBlocksPath}`);
  console.log(`📁 Next.js output: ${CONFIG.nextjsOutputPath}\n`);

  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be written\n');
  }

  // Step 1: Discover WordPress blocks
  const blockDirs = await discoverBlocks(options.blocks);
  console.log(`📦 Found ${blockDirs.length} WordPress blocks to convert\n`);

  const results: ConversionResult[] = [];

  // Step 2: Process each block
  for (const blockDir of blockDirs) {
    const blockName = path.basename(blockDir);
    console.log(`⚙️  Processing: ${blockName}`);

    try {
      // Analyze WordPress block
      const metadata = await analyzeWordPressBlock(blockDir);
      console.log(`   📊 Attributes: ${Object.keys(metadata.attributes).length}`);
      console.log(`   🧩 Components: ${metadata.components.join(', ') || 'none'}`);
      console.log(`   🪝 Hooks: ${metadata.hooks.join(', ') || 'none'}`);

      // Generate Next.js files
      const generated = await generateNextJSComponent(metadata);

      if (!options.dryRun) {
        // Write to filesystem
        const filesGenerated = await writeNextJSFiles(blockName, generated);
        results.push({ blockName, status: 'success', filesGenerated });
        console.log(`   ✅ Generated ${filesGenerated.length} files\n`);
      } else {
        console.log(`   ✅ Would generate component (dry run)\n`);
        results.push({ blockName, status: 'success' });
      }

    } catch (error) {
      results.push({ blockName, status: 'error', error: error as Error });
      console.error(`   ❌ Error: ${(error as Error).message}\n`);
    }
  }

  // Step 3: Generate block registry
  if (!options.dryRun) {
    await generateBlockRegistry(results.filter(r => r.status === 'success'));
  }

  // Step 4: Summary report
  printSummary(results, options.dryRun);
}

/**
 * Discover WordPress blocks to convert
 */
async function discoverBlocks(specificBlocks?: string[]): Promise<string[]> {
  const allBlockDirs = await glob(`${CONFIG.wordpressBlocksPath}/*/`, {
    cwd: process.cwd(),
  });

  if (specificBlocks && specificBlocks.length > 0) {
    return allBlockDirs.filter(dir => {
      const blockName = path.basename(dir);
      return specificBlocks.includes(blockName);
    });
  }

  return allBlockDirs;
}

/**
 * Analyze WordPress block files and extract metadata
 */
async function analyzeWordPressBlock(blockDir: string): Promise<BlockMetadata> {
  // Read block.json
  const blockJsonPath = path.join(blockDir, 'block.json');
  const blockJson = JSON.parse(await fs.readFile(blockJsonPath, 'utf-8'));

  // Read edit.tsx to find components used
  let editContent = '';
  let components: string[] = [];
  try {
    const editPath = path.join(blockDir, 'edit.tsx');
    editContent = await fs.readFile(editPath, 'utf-8');
    components = extractWordPressComponents(editContent);
  } catch {
    // edit.tsx might not exist or might be index.tsx
  }

  // Read save.tsx to find data attributes
  let dataAttributes: Record<string, string> = {};
  try {
    const savePath = path.join(blockDir, 'save.tsx');
    const saveContent = await fs.readFile(savePath, 'utf-8');
    dataAttributes = extractDataAttributes(saveContent);
  } catch {
    // save.tsx might not exist
  }

  // Check for custom hooks
  const hooksDir = path.join(blockDir, 'hooks');
  let hooks: string[] = [];
  try {
    const hookFiles = await fs.readdir(hooksDir);
    hooks = hookFiles
      .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
      .map(f => path.basename(f, path.extname(f)));
  } catch {
    // No hooks directory
  }

  return {
    name: path.basename(blockDir),
    blockName: blockJson.name,
    title: blockJson.title || path.basename(blockDir),
    attributes: blockJson.attributes || {},
    components,
    hooks,
    dataAttributes,
  };
}

/**
 * Extract WordPress components from edit.tsx
 */
function extractWordPressComponents(editContent: string): string[] {
  const components: string[] = [];

  // Find @wordpress/components imports
  const importMatch = editContent.match(/import\s+\{([^}]+)\}\s+from\s+['"]@wordpress\/components['"]/);
  if (importMatch) {
    components.push(
      ...importMatch[1]
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
    );
  }

  return components;
}

/**
 * Extract data attributes from save.tsx
 */
function extractDataAttributes(saveContent: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  // Find all data-* attributes
  const dataAttrRegex = /data-([a-z-]+)=\{([^}]+)\}/g;
  let match;

  while ((match = dataAttrRegex.exec(saveContent)) !== null) {
    const attrName = match[1];
    const attrValue = match[2];
    attributes[attrName] = attrValue;
  }

  return attributes;
}

/**
 * Generate Next.js component from WordPress block metadata
 */
async function generateNextJSComponent(metadata: BlockMetadata): Promise<GeneratedFiles> {
  // Generate props interface
  const propsInterface = generatePropsInterface(metadata);

  // Generate parse function
  const parseFunction = generateParseFunction(metadata);

  // Generate component
  const component = generateComponent(metadata, propsInterface, parseFunction);

  // Generate hook if needed
  let hook: string | undefined;
  if (metadata.hooks.length > 0) {
    hook = await generateHook(metadata);
  }

  return {
    component,
    propsInterface,
    parseFunction,
    hook,
  };
}

/**
 * Generate TypeScript props interface
 */
function generatePropsInterface(metadata: BlockMetadata): string {
  const { name, attributes } = metadata;
  const pascalName = toPascalCase(name);

  if (Object.keys(attributes).length === 0) {
    return `export interface ${pascalName}BlockProps {
  className?: string;
}`;
  }

  const props = Object.entries(attributes)
    .map(([key, config]) => {
      const tsType = mapAttributeTypeToTS(config.type);
      const optional = config.default !== undefined ? '?' : '';
      const comment = config.default !== undefined ? ` // default: ${JSON.stringify(config.default)}` : '';
      return `  ${key}${optional}: ${tsType};${comment}`;
    })
    .join('\n');

  return `export interface ${pascalName}BlockProps {
${props}
}`;
}

/**
 * Generate parse function for hydration
 */
function generateParseFunction(metadata: BlockMetadata): string {
  const { name, attributes } = metadata;
  const pascalName = toPascalCase(name);

  if (Object.keys(attributes).length === 0) {
    return `export function parse${pascalName}Props(element: HTMLElement): ${pascalName}BlockProps {
  return {
    className: element.className || '',
  };
}`;
  }

  const parsing = Object.entries(attributes)
    .map(([key, config]) => {
      const parseLogic = generateParseLogic(key, config.type);
      return `    ${key}: ${parseLogic}`;
    })
    .join(',\n');

  return `export function parse${pascalName}Props(element: HTMLElement): ${pascalName}BlockProps {
  return {
${parsing}
  };
}`;
}

/**
 * Generate parsing logic based on attribute type
 */
function generateParseLogic(key: string, type: string): string {
  const dataAttr = toKebabCase(key);
  const camelAttr = toCamelCase(dataAttr);

  switch (type) {
    case 'string':
      return `element.dataset.${camelAttr} || ''`;

    case 'number':
      return `parseInt(element.dataset.${camelAttr} || '0', 10)`;

    case 'boolean':
      return `element.dataset.${camelAttr} === 'true'`;

    case 'object':
    case 'array':
      return `JSON.parse(element.dataset.${camelAttr} || '${type === 'array' ? '[]' : '{}'}')`;

    default:
      return `element.dataset.${camelAttr}`;
  }
}

/**
 * Generate main component
 */
function generateComponent(metadata: BlockMetadata, propsInterface: string, parseFunction: string): string {
  const { name, hooks, components } = metadata;
  const pascalName = toPascalCase(name);

  const imports = generateImports(metadata);
  const hookUsage = generateHookUsage(metadata);
  const componentBody = generateComponentBody(metadata);

  return `'use client';
${imports}

${propsInterface}

export default function ${pascalName}Block(props: ${pascalName}BlockProps) {
${hookUsage ? `  ${hookUsage}\n` : ''}
  return (
    <div className="${toKebabCase(name)}-block">
${componentBody}
    </div>
  );
}

${parseFunction}
`.trim();
}

/**
 * Generate imports for component
 */
function generateImports(metadata: BlockMetadata): string {
  const imports: string[] = [];

  // React imports
  const reactImports = new Set<string>();
  if (metadata.hooks.length > 0) {
    reactImports.add('useState');
    reactImports.add('useEffect');
  }

  if (reactImports.size > 0) {
    imports.push(`import { ${Array.from(reactImports).join(', ')} } from 'react';`);
  }

  // Hook imports
  if (metadata.hooks.length > 0) {
    imports.push(...metadata.hooks.map(hook =>
      `import { ${hook} } from '@/lib/hooks/${hook}';`
    ));
  }

  return imports.join('\n');
}

/**
 * Generate hook usage in component
 */
function generateHookUsage(metadata: BlockMetadata): string {
  if (metadata.hooks.length === 0) return '';

  // Determine hook parameters based on hook name
  const hookCalls = metadata.hooks.map(hook => {
    if (hook.includes('Voxel')) {
      // Voxel hooks typically need postType
      return `const { data, isLoading, error } = ${hook}(props.postType);`;
    }
    return `const { data, isLoading, error } = ${hook}();`;
  });

  return hookCalls.join('\n  ');
}

/**
 * Generate component body
 */
function generateComponentBody(metadata: BlockMetadata): string {
  const hasHooks = metadata.hooks.length > 0;

  if (hasHooks) {
    return `      {isLoading && <div className="animate-pulse">Loading...</div>}
      {error && <div className="text-red-500">Error: {error.message}</div>}
      {data && (
        <div className="space-y-4">
          {/* TODO: Render data */}
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}`;
  }

  return `      {/* TODO: Implement ${metadata.title} */}
      <p className="text-gray-500">
        ${metadata.title} component
      </p>`;
}

/**
 * Generate custom hook (translate from WordPress)
 */
async function generateHook(metadata: BlockMetadata): Promise<string> {
  const hookName = metadata.hooks[0]; // Simplified: take first hook
  const hookPath = path.join(CONFIG.wordpressBlocksPath, metadata.name, 'hooks', `${hookName}.ts`);

  try {
    const wpHookContent = await fs.readFile(hookPath, 'utf-8');

    // Translate WordPress hook to Next.js
    const nextjsHook = wpHookContent
      .replace(/import apiFetch from '@wordpress\/api-fetch';/g, "import useSWR from 'swr';")
      .replace(/import \{ ([^}]+) \} from '@wordpress\/element';/g, "import { $1 } from 'react';")
      .replace(/useState, useEffect/g, 'useState, useEffect')
      .replace(/apiFetch<([^>]+)>\(/g, 'useSWR<$1>(')
      .replace(/apiFetch\(/g, 'useSWR(')
      .replace(/path: ['"`]([^'"`]+)['"`]/g, `'${CONFIG.wpApiUrl}$1'`)
      .replace(/\.then\(data => \{/g, '// SWR handles data fetching')
      .replace(/setFilters\(data\);/g, '// Data managed by SWR')
      .replace(/setIsLoading\(false\);/g, '// Loading state managed by SWR')
      .replace(/\.catch\(err => \{/g, '// SWR handles errors');

    return `'use client';
${nextjsHook}

const fetcher = (url: string) => fetch(url).then(res => res.json());
`;
  } catch (error) {
    // Generate a basic hook template
    return generateBasicHook(hookName);
  }
}

/**
 * Generate basic hook template
 */
function generateBasicHook(hookName: string): string {
  return `'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ${hookName}(postType?: string) {
  const { data, error, isLoading } = useSWR(
    postType ? \`${CONFIG.wpApiUrl}/voxel/v1/\${postType}\` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    isLoading,
    error,
  };
}
`;
}

/**
 * Write generated files to filesystem
 */
async function writeNextJSFiles(blockName: string, files: GeneratedFiles): Promise<string[]> {
  const filesWritten: string[] = [];
  const pascalName = toPascalCase(blockName);

  // Ensure output directory exists
  await fs.mkdir(CONFIG.nextjsOutputPath, { recursive: true });

  // Write component file
  const componentPath = path.join(CONFIG.nextjsOutputPath, `${pascalName}Block.tsx`);
  await fs.writeFile(componentPath, files.component, 'utf-8');
  filesWritten.push(componentPath);

  // Write hook if exists
  if (files.hook) {
    await fs.mkdir(CONFIG.nextjsHooksPath, { recursive: true });
    const hookPath = path.join(CONFIG.nextjsHooksPath, `${blockName}.ts`);
    await fs.writeFile(hookPath, files.hook, 'utf-8');
    filesWritten.push(hookPath);
  }

  return filesWritten;
}

/**
 * Generate block registry file
 */
async function generateBlockRegistry(results: ConversionResult[]) {
  const imports = results
    .map(({ blockName }) => {
      const pascalName = toPascalCase(blockName);
      return `import ${pascalName}Block, { parse${pascalName}Props } from './${pascalName}Block';`;
    })
    .join('\n');

  const registry = results
    .map(({ blockName }) => {
      const pascalName = toPascalCase(blockName);
      return `  'voxel-fse/${blockName}': {
    component: ${pascalName}Block,
    parseProps: parse${pascalName}Props,
  }`;
    })
    .join(',\n');

  const content = `/**
 * Auto-generated block registry
 * Generated: ${new Date().toISOString()}
 *
 * This file maps WordPress block names to Next.js components
 * for server-side hydration.
 */

${imports}

export const BLOCK_REGISTRY = {
${registry}
};

export type BlockName = keyof typeof BLOCK_REGISTRY;

export function getBlockComponent(blockName: BlockName) {
  return BLOCK_REGISTRY[blockName];
}
`;

  const registryPath = path.join(CONFIG.nextjsOutputPath, 'index.ts');
  await fs.writeFile(registryPath, content, 'utf-8');

  console.log(`\n📝 Generated block registry at ${registryPath}`);
}

/**
 * Print summary report
 */
function printSummary(results: ConversionResult[], dryRun = false) {
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Failed blocks:');
    results
      .filter(r => r.status === 'error')
      .forEach(({ blockName, error }) => {
        console.log(`   - ${blockName}: ${error?.message}`);
      });
  }

  if (!dryRun && successful > 0) {
    console.log('\n✨ Next steps:');
    console.log('   1. Review generated components:');
    console.log(`      ${CONFIG.nextjsOutputPath}/`);
    console.log('   2. Install dependencies:');
    console.log('      npm install swr');
    console.log('   3. Test components:');
    console.log('      npm run dev');
    console.log('   4. Fix any TypeScript errors');
    console.log('   5. Adjust styling and UI');
    console.log('   6. Add error handling and loading states');
    console.log('   7. Test with real data from Voxel API');
  }

  console.log('='.repeat(60) + '\n');
}

// Utility functions

function toPascalCase(str: string): string {
  return str
    .replace(/(^\w|-\w)/g, match => match.replace('-', '').toUpperCase());
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function mapAttributeTypeToTS(type: string): string {
  const mapping: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'Record<string, any>',
    array: 'any[]',
  };
  return mapping[type] || 'any';
}

// Parse command line arguments
function parseArgs(): { blocks?: string[]; dryRun?: boolean } {
  const args = process.argv.slice(2);
  const options: { blocks?: string[]; dryRun?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--blocks' && args[i + 1]) {
      options.blocks = args[i + 1].split(',').map(b => b.trim());
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// Run the conversion
if (require.main === module) {
  const options = parseArgs();
  convertBlocksToNextJS(options)
    .then(() => {
      console.log('✨ Conversion complete!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Conversion failed:', error);
      process.exit(1);
    });
}

export { convertBlocksToNextJS, analyzeWordPressBlock, generateNextJSComponent };
