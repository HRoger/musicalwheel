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
        // Shared control styles - dedicated entry for proper CSS naming
        'shared-controls': './app/blocks/shared/controls/shared-styles.ts',
        // React-compatible Voxel commons (replaces Vue-based commons.js in editor)
        'voxel-commons': './app/blocks/shared/voxel-commons.ts',
        'create-post/index': './app/blocks/src/create-post/index.tsx',
        'product-price/index': './app/blocks/src/product-price/index.tsx',
        'popup-kit/index': './app/blocks/src/popup-kit/index.tsx',
        'admin-icon-picker': './templates/backend/admin-icon-picker/index.tsx',
        'search-form/index': './app/blocks/src/search-form/index.tsx',
        'print-template/index': './app/blocks/src/print-template/index.tsx',
        'nested-accordion/index': './app/blocks/src/nested-accordion/index.tsx',
        'nested-tabs/index': './app/blocks/src/nested-tabs/index.tsx',
        'image/index': './app/blocks/src/image/index.tsx',
        'review-stats/index': './app/blocks/src/review-stats/index.tsx',
        'countdown/index': './app/blocks/src/countdown/index.tsx',
        'ring-chart/index': './app/blocks/src/ring-chart/index.tsx',
        'timeline/index': './app/blocks/src/timeline/index.tsx',
        'timeline-kit/index': './app/blocks/src/timeline-kit/index.tsx',
        // 'columns/index': './app/blocks/src/columns/index.tsx',
        // 'column/index': './app/blocks/src/column/index.tsx',
        'term-feed/index': './app/blocks/src/term-feed/index.tsx',
        'work-hours/index': './app/blocks/src/work-hours/index.tsx',
        'sales-chart/index': './app/blocks/src/sales-chart/index.tsx',
        'visit-chart/index': './app/blocks/src/visit-chart/index.tsx',
        'navbar/index': './app/blocks/src/navbar/index.tsx',
        'advanced-list/index': './app/blocks/src/advanced-list/index.tsx',
        'userbar/index': './app/blocks/src/userbar/index.tsx',
        'quick-search/index': './app/blocks/src/quick-search/index.tsx',
        'map/index': './app/blocks/src/map/index.tsx',
        'current-role/index': './app/blocks/src/current-role/index.tsx',
        'current-plan/index': './app/blocks/src/current-plan/index.tsx',
        'membership-plans/index': './app/blocks/src/membership-plans/index.tsx',
        'listing-plans/index': './app/blocks/src/listing-plans/index.tsx',
        'slider/index': './app/blocks/src/slider/index.tsx',
        'gallery/index': './app/blocks/src/gallery/index.tsx',
        'post-feed/index': './app/blocks/src/post-feed/index.tsx',
        'stripe-account/index': './app/blocks/src/stripe-account/index.tsx',
        'login/index': './app/blocks/src/login/index.tsx',
        'product-form/index': './app/blocks/src/product-form/index.tsx',
        'messages/index': './app/blocks/src/messages/index.tsx',
        'orders/index': './app/blocks/src/orders/index.tsx',
        'cart-summary/index': './app/blocks/src/cart-summary/index.tsx',
        'flex-container/index': './app/blocks/src/flex-container/index.tsx',
        // Note: Frontend scripts (search-form, print-template, nested-accordion, nested-tabs, image, review-stats, countdown, ring-chart, timeline, term-feed, work-hours, sales-chart, visit-chart, navbar, advanced-list, userbar, quick-search, map, current-role, current-plan, slider, gallery, post-feed, stripe-account, login, product-form, messages, orders) are built via separate configs (IIFE format)
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
