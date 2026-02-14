import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Dedicated Vite config for the single editor.js bundle.
 *
 * Builds as IIFE (classic script) instead of ES module to prevent
 * viewport flicker in the Gutenberg editor. ES modules with type="module"
 * cause flicker because they get deferred and re-evaluated differently
 * during iframe rebuilds on viewport switch.
 *
 * NectarBlocks uses the same pattern: single IIFE editor.js bundle.
 */
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  esbuild: {
    jsx: 'automatic',
  },
  optimizeDeps: {
    exclude: [
      '@wordpress/blocks',
      '@wordpress/block-editor',
      '@wordpress/components',
      '@wordpress/i18n',
      '@wordpress/server-side-render',
      '@wordpress/core-data',
      '@wordpress/data',
      '@wordpress/api-fetch',
      'nouislider',
    ],
  },
  build: {
    outDir: 'assets/dist',
    manifest: false,
    emptyOutDir: false,
    // Extract CSS to separate editor.css file instead of injecting inline via JS.
    // Inline CSS injection (~8000+ rules via document.createElement("style"))
    // causes visible flicker when switching viewports with 7+ blocks.
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        'editor': './app/blocks/src/editor.ts',
      },
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@wordpress/blocks',
        '@wordpress/block-editor',
        '@wordpress/components',
        '@wordpress/element',
        '@wordpress/i18n',
        '@wordpress/server-side-render',
        '@wordpress/core-data',
        '@wordpress/data',
        '@wordpress/api-fetch',
        '@wordpress/compose',
        '@wordpress/primitives',
        'nouislider',
      ],
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        // Rename extracted CSS from default "style.css" to "editor.css"
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'editor.css';
          }
          return '[name][extname]';
        },
        // IIFE globals must match WordPress UMD globals (NOT wp.element for React)
        // NectarBlocks uses: React, ReactDOM, ReactJSXRuntime, wp.blocks, etc.
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          '@wordpress/blocks': 'wp.blocks',
          '@wordpress/block-editor': 'wp.blockEditor',
          '@wordpress/components': 'wp.components',
          '@wordpress/element': 'wp.element',
          '@wordpress/i18n': 'wp.i18n',
          '@wordpress/server-side-render': 'wp.serverSideRender',
          '@wordpress/core-data': 'wp.coreData',
          '@wordpress/data': 'wp.data',
          '@wordpress/api-fetch': 'wp.apiFetch',
          '@wordpress/compose': 'wp.compose',
          '@wordpress/primitives': 'wp.primitives',
          'nouislider': 'noUiSlider',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@styles': resolve(__dirname, './assets/styles'),
      '@scripts': resolve(__dirname, './assets/scripts'),
      '@shared': resolve(__dirname, './app/blocks/shared'),
      // Do NOT alias @wordpress/element to react here — it's an external mapped to wp.element
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});
