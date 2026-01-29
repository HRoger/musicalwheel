import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Consolidated Frontend Build Configuration (IIFE format)
 *
 * Builds frontend scripts in IIFE format because:
 * - Frontend pages don't have WordPress import maps (only editor has them)
 * - ES modules with bare specifiers (@wordpress/element) won't resolve
 * - IIFE format with globals maps to wp.* available on frontend
 *
 * Editor scripts use vite.blocks.config.js (ES modules format)
 *
 * Usage:
 *   npm run build:frontend                    # Build ALL frontend scripts
 *   npm run build:frontend:search-form        # Build specific block
 *   VITE_BLOCK=search-form npm run dev        # Dev mode for specific block
 *
 * @see docs/conversions/create-post/create-post-critical-errors-solved.md
 */

// All blocks with frontend scripts
const BLOCKS = [
  'advanced-list',
  'cart-summary',
  'countdown',
  'create-post',
  'current-plan',
  'current-role',
  'flex-container',
  'gallery',
  'image',
  'listing-plans',
  'login',
  'map',
  'membership-plans',
  'messages',
  'navbar',
  'nested-accordion',
  'nested-tabs',
  'orders',
  'post-feed',
  'print-template',
  'product-form',
  'product-price',
  'quick-search',
  'review-stats',
  'ring-chart',
  'sales-chart',
  'search-form',
  'slider',
  'stripe-account',
  'term-feed',
  'timeline',
  'userbar',
  'visit-chart',
  'work-hours',
];

// Parse command line for target block
// Supports: --block=name, VITE_BLOCK=name env var, or 'all' for building everything
function getTargetBlock() {
  const args = process.argv;

  // Check for --block=name argument
  const blockArg = args.find((arg) => arg.startsWith('--block='));
  if (blockArg) {
    return blockArg.split('=')[1];
  }

  // Check for environment variable
  if (process.env.VITE_BLOCK) {
    return process.env.VITE_BLOCK;
  }

  // Default to 'all' - but this will be handled by the build:frontend script
  // which runs this config multiple times with different --block values
  return null;
}

const targetBlock = getTargetBlock();

// Validate block name if specified
if (targetBlock && targetBlock !== 'all' && !BLOCKS.includes(targetBlock)) {
  console.error(`\n❌ Unknown block: "${targetBlock}"`);
  console.error(`\nAvailable blocks:\n  ${BLOCKS.join('\n  ')}\n`);
  process.exit(1);
}

// Generate PascalCase name for IIFE global
function toPascalCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Build config for a single block
function createBlockConfig(blockName) {
  return {
    entry: resolve(__dirname, `./app/blocks/src/${blockName}/frontend.tsx`),
    outDir: `app/blocks/src/${blockName}`,
    name: `VoxelFSE${toPascalCase(blockName)}`,
  };
}

const config = targetBlock ? createBlockConfig(targetBlock) : createBlockConfig(BLOCKS[0]);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    outDir: config.outDir,
    emptyOutDir: false, // Don't clear block directory
    lib: {
      entry: config.entry,
      name: config.name,
      formats: ['iife'],
      fileName: () => 'frontend.js', // Must match block.json viewScript reference
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        '@wordpress/element',
        '@wordpress/api-fetch',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
          '@wordpress/element': 'wp.element',
          '@wordpress/api-fetch': 'wp.apiFetch',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './app/blocks/shared'),
      '@styles': resolve(__dirname, './assets/styles'),
      '@scripts': resolve(__dirname, './assets/scripts'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});
