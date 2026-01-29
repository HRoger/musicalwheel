import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.tsx'],
		include: ['**/*.test.{ts,tsx}'],
		exclude: ['node_modules', 'dist'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['app/blocks/src/**/*.{ts,tsx}'],
			exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
		},
	},
	resolve: {
		alias: {
			'@blocks': path.resolve(__dirname, 'app/blocks/src'),
			'@shared': path.resolve(__dirname, 'app/blocks/shared'),
			'@styles': path.resolve(__dirname, 'assets/styles'),
			'@scripts': path.resolve(__dirname, 'assets/scripts'),
		},
	},
});
