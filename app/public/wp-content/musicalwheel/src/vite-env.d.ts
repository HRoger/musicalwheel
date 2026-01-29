/// <reference types="vite/client" />

/**
 * Global type declarations for Vite environment
 */

// Vite environment variables
interface ImportMetaEnv {
	readonly MODE: string;
	readonly BASE_URL: string;
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly SSR: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Global constants defined in vite.config.ts
declare const __DEV__: boolean;

// WordPress globals (externalized in build)
declare module '@wordpress/element' {
	export * from 'react';
	export { default } from 'react';
}

declare module '@wordpress/blocks' {
	export const registerBlockType: (name: string, settings: any) => any;
	export const unregisterBlockType: (name: string) => any;
}

declare module '@wordpress/block-editor' {
	export const InspectorControls: React.ComponentType<any>;
	export const BlockControls: React.ComponentType<any>;
	export const useBlockProps: (props?: any) => any;
	export const RichText: React.ComponentType<any>;
}

declare module '@wordpress/components' {
	export const Panel: React.ComponentType<any>;
	export const PanelBody: React.ComponentType<any>;
	export const PanelRow: React.ComponentType<any>;
	export const Button: React.ComponentType<any>;
	export const TextControl: React.ComponentType<any>;
}

declare module '@wordpress/data' {
	export const useSelect: (fn: any) => any;
	export const useDispatch: (storeName: string) => any;
}

declare module '@wordpress/i18n' {
	export const __: (text: string, domain?: string) => string;
	export const _x: (text: string, context: string, domain?: string) => string;
	export const _n: (singular: string, plural: string, number: number, domain?: string) => string;
}

declare module '@wordpress/api-fetch' {
	const apiFetch: (options: any) => Promise<any>;
	export default apiFetch;
}

declare module '@wordpress/dom-ready' {
	const domReady: (callback: () => void) => void;
	export default domReady;
}

declare module '@wordpress/hooks' {
	export const addFilter: (hookName: string, namespace: string, callback: any) => void;
	export const addAction: (hookName: string, namespace: string, callback: any) => void;
}
