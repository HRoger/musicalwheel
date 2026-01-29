import { defineConfig } from 'vite';
import { resolve } from 'path';
// @ts-ignore - JS file without types
import { wordpressExternals } from './vite-wordpress-externals.js';

export default defineConfig({
	plugins: [
		wordpressExternals(), // Enable HMR with WordPress package externals
	],
	base: '/',
	server: {
		port: 3000,
		strictPort: true,
		origin: 'http://localhost:3000',
		cors: true, // Enable CORS
		hmr: {
			host: 'localhost',
			port: 3000,
			protocol: 'ws'
		}
	},
	resolve: {
		alias: {
			'@styles': resolve(__dirname, './assets/styles'),
			'@scripts': resolve(__dirname, './assets/scripts'),
		},
	},
	ssr: {
		noExternal: ['rungen'], // Don't externalize rungen - use our virtual module
	},
	optimizeDeps: {
		exclude: [
			'react',
			'react-dom',
			'@wordpress/element',
			'@wordpress/blocks',
			'@wordpress/block-editor',
			'@wordpress/components',
			'@wordpress/i18n',
			'@wordpress/icons',
			'@wordpress/api-fetch',
			'@wordpress/core-data',
			'@wordpress/server-side-render',
			'@wordpress/data',
			'rungen', // Dependency of @wordpress/data - CommonJS module
		],
	},
	build: {
		outDir: 'assets/dist',
		assetsDir: '',
		emptyOutDir: true,
		manifest: true, // Generate manifest.json for production
		rollupOptions: {
			input: {
				// General theme scripts
				'main': 'assets/scripts/main.tsx',
				'editor': 'assets/scripts/editor.tsx',
				// Block-specific scripts
				'dynamic-heading-example': 'app/blocks/src/dynamic-heading-example/index.js',
				'dynamic-text': 'app/blocks/src/dynamic-text/index.js',
				'create-post': 'app/blocks/src/create-post/index.tsx',
				'product-price': 'app/blocks/src/product-price/index.tsx',
				'popup-kit': 'app/blocks/src/popup-kit/index.tsx',
				// Admin metaboxes
				'admin-metaboxes': 'app/blocks/src/admin-metaboxes/index.tsx',
				// Admin icon picker for taxonomy pages
				'admin-icon-picker': 'app/blocks/src/admin-icon-picker/index.tsx'
			},
			external: [
				'react',
				'react-dom',
				'@wordpress/blocks',
				'@wordpress/block-editor',
				'@wordpress/components',
				'@wordpress/data',
				'@wordpress/element',
				'@wordpress/i18n',
				'@wordpress/icons',
				'@wordpress/api-fetch',
				'@wordpress/core-data',
				'@wordpress/server-side-render'
			],
			output: {
				entryFileNames: 'js/[name]-[hash].js',
				chunkFileNames: 'js/[name]-[hash].js',
				assetFileNames: '[ext]/[name]-[hash][extname]',
				globals: {
					'react': 'window.React',
					'react-dom': 'window.ReactDOM',
					'@wordpress/blocks': 'window.wp.blocks',
					'@wordpress/block-editor': 'window.wp.blockEditor',
					'@wordpress/components': 'window.wp.components',
					'@wordpress/data': 'window.wp.data',
					'@wordpress/element': 'window.wp.element',
					'@wordpress/i18n': 'window.wp.i18n',
					'@wordpress/icons': 'window.wp.icons',
					'@wordpress/api-fetch': 'window.wp.apiFetch',
					'@wordpress/core-data': 'window.wp.coreData',
					'@wordpress/server-side-render': 'window.wp.serverSideRender'
				}
			}
		}
	}
});
