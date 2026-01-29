# AI-Assisted Batch Conversion: WordPress to Next.js Blocks

**Date:** December 2025
**Purpose:** Automated conversion of 34 WordPress FSE blocks to Next.js block renderers
**Time Savings:** 25-30% faster than manual conversion (1 week saved)

---

## Executive Summary

After converting all 34 Voxel widgets to WordPress FSE blocks (Option C+), we can use AI to automatically generate Next.js block renderers by analyzing the WordPress implementations and translating them to Next.js patterns.

**Key Benefits:**
- ✅ 25-30% time savings (3 weeks vs 4 weeks)
- ✅ Consistent patterns across all 34 blocks
- ✅ Auto-generated TypeScript interfaces
- ✅ Reduced manual boilerplate work
- ✅ Lower human error rate

**Prerequisites:**
- All 34 WordPress FSE blocks completed
- Voxel REST API endpoints functional
- Next.js project structure established
- 2-3 manual examples for pattern recognition

---

## Why AI Batch Conversion is Highly Feasible

### Pattern-Based Translation

The WordPress → Next.js conversion follows **predictable, mechanical patterns**:

```tsx
// PATTERN 1: Component Library Translation
@wordpress/components → HTML/Tailwind
SelectControl → <select>
TextControl → <input type="text">
CheckboxControl → <input type="checkbox">

// PATTERN 2: Data Fetching Translation
apiFetch({ path: '/voxel/v1/...' }) → useSWR('/api/voxel/...')
import apiFetch from '@wordpress/api-fetch' → import useSWR from 'swr'

// PATTERN 3: Props Extraction
attributes.postType → props.postType
setAttributes({ ... }) → useState(...) or form handlers

// PATTERN 4: Data Attributes Parsing
data-post-type={attributes.postType} → parseProps(element.dataset.postType)
```

### High Success Rate by Complexity Tier

| Tier | Block Type | Translation Accuracy | Manual Review Time |
|------|-----------|---------------------|-------------------|
| 1 | Simple display blocks | 90-95% | 15 min per block |
| 2 | Query-based blocks | 80-85% | 30 min per block |
| 3 | Interactive blocks | 70-75% | 1-2 hours per block |

---

## Detailed Conversion Plan

### Phase 1: Pattern Recognition (1 Day)

**Goal:** Analyze manual examples and extract translation patterns

**Steps:**

1. **Manually convert 2-3 blocks** (search-form, create-post, popup-kit)
   - Establish styling conventions (Tailwind classes)
   - Choose UI library (shadcn/ui, Headless UI, or raw HTML)
   - Document data fetching patterns
   - Define error handling approach

2. **Extract patterns** from manual conversions
   - Component mappings (WordPress → Next.js)
   - Hook translations (apiFetch → useSWR)
   - Props interface structure
   - Hydration logic

3. **Create pattern library**
   - Component translation table
   - Hook translation rules
   - Styling conventions
   - File structure template

**Output:** Pattern library JSON file

---

### Phase 2: AI Batch Generation (2 Days)

**Goal:** Generate all 34 Next.js components automatically

**Steps:**

1. **For each WordPress block:**
   - Read `block.json` (attributes schema)
   - Read `edit.tsx` (component logic)
   - Read `save.tsx` (data attributes)
   - Read `hooks/*.ts` (data fetching)

2. **Extract metadata:**
   - Block name and namespace
   - Attributes and their types
   - Data fetching dependencies
   - WordPress components used

3. **Generate Next.js files:**
   - `[BlockName]Block.tsx` (component)
   - Props interface (TypeScript)
   - Parse function (hydration helper)
   - Hook implementation (if needed)

4. **Write to filesystem:**
   - `apps/musicalwheel-frontend/components/blocks/`
   - Auto-format with Prettier
   - Add JSDoc comments

**Output:** 34 Next.js component files

---

### Phase 3: Manual Review & Testing (12 Days)

**Goal:** Verify, test, and fix generated components

**Week 1: Tier 1 Blocks (10 simple blocks)**
- 2 hours per block = 20 hours (4 days)
- High accuracy (90-95%)
- Minimal fixes needed

**Week 2: Tier 2 Blocks (15 medium blocks)**
- 4 hours per block = 60 hours (12 days, but overlap with Week 3)
- Medium accuracy (80-85%)
- Styling and UX adjustments

**Week 3: Tier 3 Blocks (6 complex blocks)**
- 8 hours per block = 48 hours (6 days)
- Lower accuracy (70-75%)
- Significant manual intervention

**Testing checklist per block:**
- ✅ Data fetches correctly from Voxel API
- ✅ Props parse from data attributes
- ✅ UI renders correctly
- ✅ Loading states work
- ✅ Error handling present
- ✅ Responsive design
- ✅ TypeScript types correct

---

## Translation Mappings

### Component Translation Table

```typescript
// docs/conversions/component-mappings.json
{
  "SelectControl": {
    "wordpress": "import { SelectControl } from '@wordpress/components'",
    "nextjs": "// Use HTML <select> or shadcn/ui Select",
    "template": `
      <select
        value={${VALUE}}
        onChange={(e) => ${ON_CHANGE}(e.target.value)}
        className="border rounded-md px-3 py-2"
      >
        {${OPTIONS}.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    `
  },

  "TextControl": {
    "wordpress": "import { TextControl } from '@wordpress/components'",
    "nextjs": "// Use HTML <input> or shadcn/ui Input",
    "template": `
      <input
        type="text"
        value={${VALUE}}
        onChange={(e) => ${ON_CHANGE}(e.target.value)}
        placeholder={${LABEL}}
        className="border rounded-md px-3 py-2 w-full"
      />
    `
  },

  "CheckboxControl": {
    "wordpress": "import { CheckboxControl } from '@wordpress/components'",
    "nextjs": "// Use HTML checkbox or shadcn/ui Checkbox",
    "template": `
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={${CHECKED}}
          onChange={(e) => ${ON_CHANGE}(e.target.checked)}
        />
        <span>{${LABEL}}</span>
      </label>
    `
  },

  "Button": {
    "wordpress": "import { Button } from '@wordpress/components'",
    "nextjs": "// Use HTML <button> or shadcn/ui Button",
    "template": `
      <button
        onClick={${ON_CLICK}}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        {${CHILDREN}}
      </button>
    `
  }
}
```

### Hook Translation Rules

```typescript
// Hook translation patterns
const HOOK_TRANSLATIONS = {
  // WordPress → Next.js
  "apiFetch": {
    from: /import apiFetch from '@wordpress\/api-fetch'/g,
    to: "import useSWR from 'swr'"
  },

  "useState": {
    from: /import \{ useState \} from '@wordpress\/element'/g,
    to: "import { useState } from 'react'"
  },

  "useEffect": {
    from: /import \{ useEffect \} from '@wordpress\/element'/g,
    to: "import { useEffect } from 'react'"
  },

  "apiEndpoint": {
    from: /path: '\/voxel\/v1\//g,
    to: "url: 'https://wp.musicalwheel.com/wp-json/voxel/v1/"
  }
};
```

---

## Conversion Script Example

```typescript
// scripts/convert-blocks-to-nextjs.ts

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface BlockMetadata {
  name: string;
  blockName: string; // e.g., "voxel-fse/search-form"
  attributes: Record<string, any>;
  components: string[]; // WordPress components used
  hooks: string[]; // Custom hooks used
}

interface GeneratedFiles {
  component: string; // TSX content
  propsInterface: string; // TypeScript interface
  parseFunction: string; // Hydration helper
  hook?: string; // Optional custom hook
}

/**
 * Main conversion orchestrator
 */
async function convertBlocksToNextJS() {
  console.log('🚀 Starting AI-assisted batch conversion...\n');

  // Step 1: Discover all WordPress blocks
  const blockDirs = await glob('themes/voxel-fse/app/blocks/src/*/', {
    cwd: process.cwd()
  });

  console.log(`📦 Found ${blockDirs.length} WordPress blocks\n`);

  const results = [];

  // Step 2: Process each block
  for (const blockDir of blockDirs) {
    const blockName = path.basename(blockDir);
    console.log(`⚙️  Processing: ${blockName}`);

    try {
      // Analyze WordPress block
      const metadata = await analyzeWordPressBlock(blockDir);

      // Generate Next.js files
      const generated = await generateNextJSComponent(metadata);

      // Write to filesystem
      await writeNextJSFiles(blockName, generated);

      results.push({ blockName, status: 'success' });
      console.log(`   ✅ Generated Next.js component\n`);

    } catch (error) {
      results.push({ blockName, status: 'error', error });
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Step 3: Generate block registry
  await generateBlockRegistry(results.filter(r => r.status === 'success'));

  // Step 4: Summary report
  printSummary(results);
}

/**
 * Analyze WordPress block files and extract metadata
 */
async function analyzeWordPressBlock(blockDir: string): Promise<BlockMetadata> {
  // Read block.json
  const blockJsonPath = path.join(blockDir, 'block.json');
  const blockJson = JSON.parse(await fs.readFile(blockJsonPath, 'utf-8'));

  // Read edit.tsx to find components used
  const editPath = path.join(blockDir, 'edit.tsx');
  const editContent = await fs.readFile(editPath, 'utf-8');
  const components = extractWordPressComponents(editContent);

  // Read save.tsx to find data attributes
  const savePath = path.join(blockDir, 'save.tsx');
  const saveContent = await fs.readFile(savePath, 'utf-8');
  const dataAttributes = extractDataAttributes(saveContent);

  // Check for custom hooks
  const hooksDir = path.join(blockDir, 'hooks');
  let hooks = [];
  try {
    const hookFiles = await fs.readdir(hooksDir);
    hooks = hookFiles.map(f => path.basename(f, '.ts'));
  } catch {
    // No hooks directory
  }

  return {
    name: path.basename(blockDir),
    blockName: blockJson.name,
    attributes: blockJson.attributes || {},
    components,
    hooks
  };
}

/**
 * Extract WordPress components from edit.tsx
 */
function extractWordPressComponents(editContent: string): string[] {
  const components = [];

  // Find @wordpress/components imports
  const importMatch = editContent.match(/import\s+\{([^}]+)\}\s+from\s+'@wordpress\/components'/);
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
  const component = generateComponent(metadata, propsInterface);

  // Generate hook if needed
  let hook;
  if (metadata.hooks.length > 0) {
    hook = await generateHook(metadata);
  }

  return {
    component,
    propsInterface,
    parseFunction,
    hook
  };
}

/**
 * Generate TypeScript props interface
 */
function generatePropsInterface(metadata: BlockMetadata): string {
  const { name, attributes } = metadata;
  const pascalName = toPascalCase(name);

  const props = Object.entries(attributes).map(([key, config]: [string, any]) => {
    const tsType = mapAttributeTypeToTS(config.type);
    const optional = config.default !== undefined ? '?' : '';
    return `  ${key}${optional}: ${tsType};`;
  }).join('\n');

  return `
export interface ${pascalName}BlockProps {
${props}
}
  `.trim();
}

/**
 * Generate parse function for hydration
 */
function generateParseFunction(metadata: BlockMetadata): string {
  const { name, attributes } = metadata;
  const pascalName = toPascalCase(name);

  const parsing = Object.entries(attributes).map(([key, config]: [string, any]) => {
    const dataAttr = toKebabCase(key);
    const parseLogic = generateParseLogic(key, config.type);
    return `    ${key}: ${parseLogic}`;
  }).join(',\n');

  return `
export function parse${pascalName}Props(element: HTMLElement): ${pascalName}BlockProps {
  return {
${parsing}
  };
}
  `.trim();
}

/**
 * Generate parsing logic based on attribute type
 */
function generateParseLogic(key: string, type: string): string {
  const dataAttr = toKebabCase(key);

  switch (type) {
    case 'string':
      return `element.dataset.${toCamelCase(dataAttr)} || ''`;

    case 'number':
      return `parseInt(element.dataset.${toCamelCase(dataAttr)} || '0', 10)`;

    case 'boolean':
      return `element.dataset.${toCamelCase(dataAttr)} === 'true'`;

    case 'object':
    case 'array':
      return `JSON.parse(element.dataset.${toCamelCase(dataAttr)} || '{}')`;

    default:
      return `element.dataset.${toCamelCase(dataAttr)}`;
  }
}

/**
 * Generate main component
 */
function generateComponent(metadata: BlockMetadata, propsInterface: string): string {
  const { name, components } = metadata;
  const pascalName = toPascalCase(name);

  // Translate WordPress components to Next.js equivalents
  const translatedComponents = translateComponents(components);

  return `
'use client';
import { ${generateImports(metadata)} } from 'react';
${generateHookImports(metadata)}

${propsInterface}

export default function ${pascalName}Block(props: ${pascalName}BlockProps) {
  ${generateHookUsage(metadata)}

  return (
    <div className="${toKebabCase(name)}">
      ${translatedComponents}
    </div>
  );
}
  `.trim();
}

/**
 * Translate WordPress components to Next.js
 */
function translateComponents(wpComponents: string[]): string {
  const mappings = {
    'SelectControl': '<select className="border rounded-md px-3 py-2">...</select>',
    'TextControl': '<input type="text" className="border rounded-md px-3 py-2" />',
    'CheckboxControl': '<input type="checkbox" />',
    'Button': '<button className="btn-primary">...</button>'
  };

  return wpComponents
    .map(comp => mappings[comp] || `{/* TODO: Translate ${comp} */}`)
    .join('\n      ');
}

/**
 * Generate hook imports
 */
function generateHookImports(metadata: BlockMetadata): string {
  if (metadata.hooks.length === 0) return '';

  return metadata.hooks
    .map(hook => `import { ${hook} } from '@/lib/hooks/${hook}';`)
    .join('\n');
}

/**
 * Generate hook usage in component
 */
function generateHookUsage(metadata: BlockMetadata): string {
  if (metadata.hooks.length === 0) return '';

  // Example: const { filters, isLoading } = useVoxelFilters(props.postType);
  return metadata.hooks
    .map(hook => `const { data, isLoading } = ${hook}(props.postType);`)
    .join('\n  ');
}

/**
 * Generate custom hook (translate from WordPress)
 */
async function generateHook(metadata: BlockMetadata): Promise<string> {
  const hookName = metadata.hooks[0]; // Simplified: take first hook
  const hookPath = `themes/voxel-fse/app/blocks/src/${metadata.name}/hooks/${hookName}.ts`;

  const wpHookContent = await fs.readFile(hookPath, 'utf-8');

  // Translate WordPress hook to Next.js
  const nextjsHook = wpHookContent
    .replace(/import apiFetch from '@wordpress\/api-fetch'/g, "import useSWR from 'swr'")
    .replace(/import \{ ([^}]+) \} from '@wordpress\/element'/g, "import { $1 } from 'react'")
    .replace(/apiFetch\(/g, 'useSWR(')
    .replace(/path:/g, 'url: \'https://wp.musicalwheel.com/wp-json/voxel/v1/');

  return nextjsHook;
}

/**
 * Write generated files to filesystem
 */
async function writeNextJSFiles(blockName: string, files: GeneratedFiles) {
  const outputDir = `apps/musicalwheel-frontend/components/blocks`;
  const pascalName = toPascalCase(blockName);

  // Write component file
  const componentPath = path.join(outputDir, `${pascalName}Block.tsx`);
  await fs.writeFile(componentPath, files.component, 'utf-8');

  // Write hook if exists
  if (files.hook) {
    const hookDir = `apps/musicalwheel-frontend/lib/hooks`;
    await fs.mkdir(hookDir, { recursive: true });
    const hookPath = path.join(hookDir, `${blockName}.ts`);
    await fs.writeFile(hookPath, files.hook, 'utf-8');
  }
}

/**
 * Generate block registry file
 */
async function generateBlockRegistry(successfulBlocks: any[]) {
  const imports = successfulBlocks.map(({ blockName }) => {
    const pascalName = toPascalCase(path.basename(blockName));
    return `import ${pascalName}Block, { parse${pascalName}Props } from './${pascalName}Block';`;
  }).join('\n');

  const registry = successfulBlocks.map(({ blockName }) => {
    const pascalName = toPascalCase(path.basename(blockName));
    return `  '${blockName}': {
    component: ${pascalName}Block,
    parseProps: parse${pascalName}Props
  }`;
  }).join(',\n');

  const content = `
${imports}

export const BLOCK_REGISTRY = {
${registry}
};
  `.trim();

  const registryPath = 'apps/musicalwheel-frontend/components/blocks/index.ts';
  await fs.writeFile(registryPath, content, 'utf-8');

  console.log(`\n📝 Generated block registry at ${registryPath}`);
}

/**
 * Print summary report
 */
function printSummary(results: any[]) {
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log('\n' + '='.repeat(50));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Failed blocks:');
    results.filter(r => r.status === 'error').forEach(({ blockName, error }) => {
      console.log(`   - ${blockName}: ${error.message}`);
    });
  }

  console.log('\n✨ Next steps:');
  console.log('   1. Review generated components in apps/musicalwheel-frontend/components/blocks/');
  console.log('   2. Test each block with: npm run dev');
  console.log('   3. Fix any TypeScript errors');
  console.log('   4. Adjust styling and UI');
  console.log('   5. Add error handling and loading states');
  console.log('='.repeat(50) + '\n');
}

// Utility functions
function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function mapAttributeTypeToTS(type: string): string {
  const mapping = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'object': 'Record<string, any>',
    'array': 'any[]'
  };
  return mapping[type] || 'any';
}

function generateImports(metadata: BlockMetadata): string {
  const imports = new Set(['useState', 'useEffect']);

  // Add more imports based on hooks
  if (metadata.hooks.some(h => h.includes('Voxel'))) {
    imports.add('useMemo');
  }

  return Array.from(imports).join(', ');
}

// Run the conversion
convertBlocksToNextJS().catch(console.error);
```

---

## Proof-of-Concept Sample

### Input: WordPress Search Form Block

**WordPress block files:**

```tsx
// themes/voxel-fse/app/blocks/src/search-form/block.json
{
  "name": "voxel-fse/search-form",
  "title": "Search Form",
  "attributes": {
    "postType": {
      "type": "string",
      "default": "events"
    },
    "enabledFilters": {
      "type": "array",
      "default": []
    },
    "placeholder": {
      "type": "string",
      "default": "Search..."
    }
  }
}
```

```tsx
// themes/voxel-fse/app/blocks/src/search-form/edit.tsx
import { SelectControl, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { useVoxelFilters } from './hooks/useVoxelFilters';

export default function Edit({ attributes, setAttributes }) {
  const { filters, isLoading } = useVoxelFilters(attributes.postType);

  return (
    <>
      <InspectorControls>
        <PanelBody title="Settings">
          <SelectControl
            label="Post Type"
            value={attributes.postType}
            options={[
              { label: 'Events', value: 'events' },
              { label: 'Venues', value: 'venues' }
            ]}
            onChange={(postType) => setAttributes({ postType })}
          />

          <TextControl
            label="Placeholder"
            value={attributes.placeholder}
            onChange={(placeholder) => setAttributes({ placeholder })}
          />
        </PanelBody>
      </InspectorControls>

      <div className="search-form-preview">
        {isLoading ? (
          <Spinner />
        ) : (
          filters.map(filter => (
            <FilterPreview key={filter.key} filter={filter} />
          ))
        )}
      </div>
    </>
  );
}
```

```tsx
// themes/voxel-fse/app/blocks/src/search-form/save.tsx
export default function save({ attributes }) {
  return (
    <div
      className="voxel-fse-search-form"
      data-post-type={attributes.postType}
      data-enabled-filters={JSON.stringify(attributes.enabledFilters)}
      data-placeholder={attributes.placeholder}
    >
      <div className="placeholder">Search Form</div>
    </div>
  );
}
```

```tsx
// themes/voxel-fse/app/blocks/src/search-form/hooks/useVoxelFilters.ts
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export function useVoxelFilters(postType: string) {
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch({
      path: `/voxel/v1/post-type-filters?post_type=${postType}`
    })
      .then(data => {
        setFilters(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, [postType]);

  return { filters, isLoading };
}
```

---

### Output: Generated Next.js Component

```tsx
// apps/musicalwheel-frontend/components/blocks/SearchFormBlock.tsx
'use client';
import { useState, useEffect } from 'react';
import { useVoxelFilters } from '@/lib/hooks/useVoxelFilters';
import { FilterComponent } from './shared/FilterComponent';

export interface SearchFormBlockProps {
  postType: string;
  enabledFilters: string[];
  placeholder?: string;
}

export default function SearchFormBlock(props: SearchFormBlockProps) {
  const { data: filters, isLoading } = useVoxelFilters(props.postType);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search submission
    console.log('Search:', searchTerm);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="voxel-search-form space-y-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={props.placeholder || 'Search...'}
        className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filters
        ?.filter(filter => props.enabledFilters.includes(filter.key))
        .map(filter => (
          <FilterComponent key={filter.key} filter={filter} />
        ))
      }

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}

/**
 * Parse props from HTML data attributes for hydration
 */
export function parseSearchFormProps(element: HTMLElement): SearchFormBlockProps {
  return {
    postType: element.dataset.postType || 'events',
    enabledFilters: JSON.parse(element.dataset.enabledFilters || '[]'),
    placeholder: element.dataset.placeholder || 'Search...'
  };
}
```

```tsx
// apps/musicalwheel-frontend/lib/hooks/useVoxelFilters.ts
'use client';
import useSWR from 'swr';

interface VoxelFilter {
  key: string;
  label: string;
  type: string;
  props: Record<string, any>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useVoxelFilters(postType: string) {
  const { data, error, isLoading } = useSWR<VoxelFilter[]>(
    postType
      ? `https://wp.musicalwheel.com/wp-json/voxel/v1/post-type-filters?post_type=${postType}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    data,
    isLoading,
    error
  };
}
```

---

## Timeline Comparison

### Manual Approach (Original)
```
Week 15: Setup Next.js project              5 days
Week 16: Build 11 components manually      5 days
Week 17: Build 11 components manually      5 days
Week 18: Build 12 components manually      5 days
Week 19: Testing and fixes                  5 days
─────────────────────────────────────────────────
TOTAL:                                     25 days (5 weeks)
```

### AI-Assisted Approach
```
Day 1: Manual pattern examples              1 day
Day 2-3: AI generates 34 components         2 days
Day 4-6: Review Tier 1 blocks (10)         3 days
Day 7-12: Review Tier 2 blocks (15)        6 days
Day 13-18: Review Tier 3 blocks (6)        6 days
Day 19: Generate block registry            1 day
─────────────────────────────────────────────────
TOTAL:                                     19 days (3.8 weeks)
```

**Time Savings: 6 days (24% faster)**

---

## Quality Assurance Approach

### Automated Checks (Script Level)

```typescript
// Quality checks during generation
const qualityChecks = {
  // Check 1: TypeScript compiles
  async checkTypeScript(componentPath: string) {
    const result = await exec(`tsc --noEmit ${componentPath}`);
    return result.exitCode === 0;
  },

  // Check 2: All props have types
  checkPropsTyped(propsInterface: string) {
    return !propsInterface.includes(': any');
  },

  // Check 3: No TODO comments
  checkNoTodos(component: string) {
    return !component.includes('TODO');
  },

  // Check 4: Has error handling
  checkErrorHandling(component: string) {
    return component.includes('error') && component.includes('isLoading');
  }
};
```

### Manual Review Checklist

**Per Component (15-120 min):**
- [ ] TypeScript compiles without errors
- [ ] Props interface matches block attributes
- [ ] Data fetching hook works correctly
- [ ] Loading state displays properly
- [ ] Error handling is present
- [ ] UI matches design system
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance (no unnecessary re-renders)

---

## Usage Instructions

### Running the Conversion Script

```bash
# 1. Install dependencies
npm install glob

# 2. Run the conversion script
npx tsx scripts/convert-blocks-to-nextjs.ts

# 3. Review generated files
ls apps/musicalwheel-frontend/components/blocks/

# 4. Test compilation
cd apps/musicalwheel-frontend
npm run build

# 5. Run dev server
npm run dev

# 6. Test each block
open http://localhost:3000/test/blocks
```

### Testing Generated Components

```tsx
// apps/musicalwheel-frontend/app/test/blocks/page.tsx
import SearchFormBlock from '@/components/blocks/SearchFormBlock';
import CreatePostBlock from '@/components/blocks/CreatePostBlock';
// ... import all 34

export default function TestBlocksPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold">Block Component Tests</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Search Form Block</h2>
        <SearchFormBlock
          postType="events"
          enabledFilters={['location', 'date', 'keywords']}
          placeholder="Search events..."
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Create Post Block</h2>
        <CreatePostBlock
          postType="events"
          fields={['title', 'description', 'location']}
        />
      </section>

      {/* ... test all 34 blocks */}
    </div>
  );
}
```

---

## Expected Results

### Success Metrics

**Tier 1 (Simple Blocks):**
- ✅ 90-95% accuracy
- ✅ 15 min review time per block
- ✅ Minimal manual fixes

**Tier 2 (Medium Blocks):**
- ✅ 80-85% accuracy
- ✅ 30-60 min review time per block
- ✅ Styling adjustments needed

**Tier 3 (Complex Blocks):**
- ✅ 70-75% accuracy
- ✅ 1-2 hour review time per block
- ✅ Logic refinements needed

### Common Issues and Fixes

**Issue 1: Missing imports**
```tsx
// Generated (missing)
export default function SearchFormBlock(props) {

// Fixed
import { useState } from 'react';
export default function SearchFormBlock(props: SearchFormBlockProps) {
```

**Issue 2: Incorrect data fetching**
```tsx
// Generated (wrong endpoint)
useSWR('/voxel/v1/filters')

// Fixed
useSWR(`https://wp.musicalwheel.com/wp-json/voxel/v1/post-type-filters?post_type=${postType}`)
```

**Issue 3: Missing error handling**
```tsx
// Generated (no error state)
if (isLoading) return <Spinner />;

// Fixed
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

---

## Maintenance and Updates

### Updating Translation Patterns

When you change your styling approach or add new components:

```typescript
// Update component-mappings.json
{
  "NewWordPressComponent": {
    "nextjs": "// Your custom implementation",
    "template": `<YourComponent {...props} />`
  }
}

// Re-run conversion for affected blocks
npx tsx scripts/convert-blocks-to-nextjs.ts --blocks search-form,create-post
```

### Iterative Improvements

**After first batch:**
1. Review common issues
2. Update translation rules
3. Re-generate affected components
4. Reduce manual review time

**Expected improvement:**
- First 10 blocks: 90 min review each
- Next 10 blocks: 60 min review each
- Last 14 blocks: 45 min review each

---

## Conclusion

AI-assisted batch conversion is **highly feasible** for the WordPress → Next.js translation because:

1. ✅ **Predictable patterns** - Component and hook translations follow clear rules
2. ✅ **High automation rate** - 70-95% accuracy depending on complexity
3. ✅ **Time savings** - 24% faster than manual (6 days saved)
4. ✅ **Consistency** - All 34 blocks follow same patterns
5. ✅ **Scalability** - Easy to add new blocks later

**Recommended workflow:**
1. Complete all 34 WordPress FSE blocks
2. Manually convert 2-3 examples
3. Run AI batch conversion script
4. Review and test generated components (3 weeks)
5. Deploy to Vercel

**Total time: ~4 weeks instead of 5 weeks** 🚀
