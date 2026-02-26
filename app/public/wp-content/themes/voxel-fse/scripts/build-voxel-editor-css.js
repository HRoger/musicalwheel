/**
 * Build script: Concatenate all Voxel parent CSS files + child theme CSS
 * into a single `voxel-editor-combined.css` for the block editor.
 *
 * This reduces ~20 individual <link> tags in the editor iframe to just 1,
 * eliminating the white flash / flicker when switching viewports.
 *
 * NectarBlocks uses the same pattern: 2 CSS files total (editor.css + frontend-styles.css).
 * We had 20+ files causing slow iframe loading.
 *
 * Usage: node scripts/build-voxel-editor-css.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const themeDir = resolve(__dirname, '..');
const voxelParentDir = resolve(themeDir, '../voxel');

// Voxel parent CSS files needed in editor (from Block_Loader::enqueue_voxel_styles_for_iframe)
// These are in assets/dist/
const voxelParentDistFiles = [
  'commons.css',
  'forms.css',
  'popup-kit.css',
  'product-form.css',
  'social-feed.css',
  'post-feed.css',
  'work-hours.css',
  'map.css',
  'create-post.css',
  'review-stats.css',
  'bar-chart.css',
  'ring-chart.css',
  'pricing-plan.css',
  'action.css',
];

// Vendor CSS files (in assets/vendor/, use .prod suffix for production)
const voxelVendorFiles = [
  'pikaday/pikaday.prod.css',
  'nouislider/nouislider.prod.css',
];

// Child theme CSS files
const childThemeFiles = [
  { path: 'assets/css/voxel-fse-commons.css', base: themeDir },
  { path: 'assets/gutenberg-editor-overrides.css', base: themeDir },
  { path: 'assets/css/responsive-visibility.css', base: themeDir },
];

// Per-block frontend CSS files (that have "style" in block.json)
const perBlockFiles = [
  'app/blocks/src/image/style.css',
  'app/blocks/src/login/frontend-base-styles.css',
  'app/blocks/src/nested-accordion/style.css',
  'app/blocks/src/nested-tabs/style.css',
  'app/blocks/src/search-form/style.css',
  'app/blocks/src/timeline/frontend.css',
  // print-template/style.css doesn't exist (block.json references it but it was never created)
];

let combined = '';
let fileCount = 0;

// 1a. Voxel parent dist CSS
for (const file of voxelParentDistFiles) {
  const filePath = resolve(voxelParentDir, 'assets/dist', file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf8');
    combined += `/* === Voxel Parent: ${file} === */\n`;
    combined += content + '\n\n';
    fileCount++;
  } else {
    console.warn(`  WARN: Missing ${filePath}`);
  }
}

// 1b. Voxel vendor CSS (pikaday, nouislider)
for (const file of voxelVendorFiles) {
  const filePath = resolve(voxelParentDir, 'assets/vendor', file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf8');
    combined += `/* === Voxel Vendor: ${file} === */\n`;
    combined += content + '\n\n';
    fileCount++;
  } else {
    console.warn(`  WARN: Missing ${filePath}`);
  }
}

// 2. Child theme CSS
for (const { path, base } of childThemeFiles) {
  const filePath = resolve(base, path);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf8');
    combined += `/* === Child Theme: ${path} === */\n`;
    combined += content + '\n\n';
    fileCount++;
  } else {
    console.warn(`  WARN: Missing ${filePath}`);
  }
}

// 3. Per-block CSS
for (const file of perBlockFiles) {
  const filePath = resolve(themeDir, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf8');
    combined += `/* === Block: ${file} === */\n`;
    combined += content + '\n\n';
    fileCount++;
  } else {
    console.warn(`  WARN: Missing ${filePath}`);
  }
}

// Write combined file
const outPath = resolve(themeDir, 'assets/dist/voxel-editor-combined.css');
writeFileSync(outPath, combined);

const sizeKB = (Buffer.byteLength(combined, 'utf8') / 1024).toFixed(1);
console.log(`✓ voxel-editor-combined.css: ${fileCount} files → ${sizeKB}KB`);
