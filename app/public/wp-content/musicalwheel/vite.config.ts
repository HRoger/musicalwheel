import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Vite Configuration for MusicalWheel FSE Theme
 * 
 * Configured for WordPress FSE development with:
 * - React + TypeScript
 * - Tailwind CSS v4
 * - Hot Module Replacement (HMR)
 * - WordPress globals externalization
 * - Manifest generation for PHP asset loader
 */
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
	],

	// Development server
	server: {
		host: 'localhost',
		port: 3000,
		strictPort: true,
		cors: true,
		hmr: {
			host: 'localhost',
			port: 3000,
		},
	},

	// Build configuration
	build: {
		// Output directory (relative to theme root) - matches Voxel structure
		outDir: 'assets/dist',
		
		// Generate manifest.json for PHP asset loader
		manifest: true,
		
		// Source maps for debugging
		sourcemap: process.env['NODE_ENV'] === 'development',
		
		// Rollup options
		rollupOptions: {
			input: {
				// Main entry point
				main: resolve(__dirname, 'src/main.tsx'),
				
				// Editor styles (for block editor)
				editor: resolve(__dirname, 'src/editor.tsx'),
				
				// Blocks
				'blocks/timeline/index': resolve(__dirname, 'src/blocks/timeline/index.tsx'),
			},
			
			output: {
				// Organize assets by type
				entryFileNames: 'js/[name]-[hash].js',
				chunkFileNames: 'js/[name]-[hash].js',
				format: 'es',
				assetFileNames: (assetInfo) => {
					if (/\.(css)$/.test(assetInfo.name ?? '')) {
						return 'css/[name]-[hash][extname]';
					}
					if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name ?? '')) {
						return 'images/[name]-[hash][extname]';
					}
					if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name ?? '')) {
						return 'fonts/[name]-[hash][extname]';
					}
					
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
		
		// Improve chunk size warnings threshold
		chunkSizeWarningLimit: 1000,
		
		// CSS code splitting
		cssCodeSplit: true,
		
		// Minification
		minify: 'terser',
	},

	// Resolve configuration
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@components': resolve(__dirname, 'src/components'),
			'@blocks': resolve(__dirname, 'src/blocks'),
			'@styles': resolve(__dirname, 'src/styles'),
			'@utils': resolve(__dirname, 'src/utils'),
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},

	// CSS configuration
	css: {
		devSourcemap: true,
	},

	// Optimize dependencies
	optimizeDeps: {
		include: ['react', 'react-dom'],
		exclude: [
			'@wordpress/element',
			'@wordpress/blocks',
			'@wordpress/block-editor',
			'@wordpress/components',
			'@wordpress/data',
		],
	},

	// Define global constants
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV'] || 'development'),
		__DEV__: process.env['NODE_ENV'] !== 'production',
	},
});
