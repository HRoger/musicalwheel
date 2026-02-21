import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
      // noUiSlider is loaded from Voxel parent theme, not npm
      'nouislider',
    ],
  },
  build: {
    outDir: 'assets/dist',
    manifest: true,
    rollupOptions: {
      input: {
        // NOTE: editor.js is built separately via vite.editor.config.js (IIFE format)
        // to prevent viewport flicker. ES modules cause flicker; IIFE does not.
        // Shared control styles - dedicated entry for proper CSS naming
        'shared-controls': './app/blocks/shared/controls/shared-styles.ts',
        // React-compatible Voxel commons (replaces Vue-based commons.js in editor)
        'voxel-commons': './app/blocks/shared/voxel-commons.ts',
        'admin-icon-picker': './templates/backend/admin-icon-picker/index.tsx',
        // Note: Frontend scripts are built via vite.frontend.config.js (IIFE format)
      },
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        // NOTE: @wordpress/element is NOT external - it's aliased to 'react' in resolve.alias
        // This allows packages like @wordpress/icons to have their forwardRef imports work correctly
        // The alias redirects to 'react' which IS external and resolved via WordPress import maps
        '@wordpress/blocks',
        '@wordpress/block-editor',
        '@wordpress/components',
        '@wordpress/i18n',
        '@wordpress/server-side-render',
        '@wordpress/core-data',
        '@wordpress/data',
        '@wordpress/api-fetch',
        // CRITICAL: Use Voxel's registered noUiSlider instead of bundling from npm
        // This avoids code duplication and ensures CSS/JS consistency with parent theme
        // Evidence: themes/voxel/app/controllers/assets-controller.php:134,141
        'nouislider',
      ],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name][extname]',
        manualChunks: undefined,
        globals: {
          react: 'wp.element',
          'react-dom': 'wp.element',
          'react-dom/client': 'wp.element',
          // @wordpress/element not needed here - aliased to react before bundling
          '@wordpress/blocks': 'wp.blocks',
          '@wordpress/block-editor': 'wp.blockEditor',
          '@wordpress/components': 'wp.components',
          '@wordpress/i18n': 'wp.i18n',
          '@wordpress/server-side-render': 'wp.serverSideRender',
          '@wordpress/core-data': 'wp.coreData',
          '@wordpress/data': 'wp.data',
          '@wordpress/api-fetch': 'wp.apiFetch',
          // noUiSlider global - loaded via WordPress enqueue from Voxel parent theme
          nouislider: 'noUiSlider',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@styles': resolve(__dirname, './assets/styles'),
      '@scripts': resolve(__dirname, './assets/scripts'),
      '@shared': resolve(__dirname, './app/blocks/shared'),
      // Redirect @wordpress/element to react - both map to wp.element at runtime
      // This fixes bundled packages (like @wordpress/icons) that import forwardRef from @wordpress/element
      '@wordpress/element': 'react',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});
