import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * YARL Lightbox — Standalone IIFE Build
 *
 * Builds the shared VoxelLightbox as a single IIFE script that exposes
 * window.VoxelLightbox = { open(slides, index), close() }.
 *
 * Pattern: Same as Voxel's Swiper — one global script, every block
 * that needs lightbox declares it as a WordPress script dependency.
 *
 * Output: assets/dist/yarl-lightbox.js
 * WordPress handle: mw-yarl-lightbox
 * Depends on: react, react-dom (WordPress globals)
 *
 * Usage: npm run build:yarl-js
 */
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'assets/dist',
    emptyOutDir: false, // Don't wipe other build outputs
    lib: {
      entry: resolve(__dirname, 'app/blocks/shared/components/Lightbox/lightbox-frontend.tsx'),
      name: 'VoxelLightboxIIFE',
      formats: ['iife'],
      fileName: () => 'yarl-lightbox.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './app/blocks/shared'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});
