/**
 * Vite plugin to handle WordPress package externals in dev mode
 * Returns virtual modules that map to window.wp globals at runtime
 * 
 * This allows HMR to work while WordPress packages are resolved via import maps
 */
export function wordpressExternals() {
	return {
		name: 'wordpress-externals',
		resolveId(id, importer) {
			// CRITICAL: Intercept rungen FIRST (before other checks)
			// This prevents Vite from trying to load it from node_modules
			// rungen is a CommonJS module that Vite tries to serve as ES module
			if (id === 'rungen' || id.startsWith('rungen/')) {
				return `\0virtual:rungen`;
			}
			
			// Intercept @wordpress/* imports
			if (id.startsWith('@wordpress/')) {
				return `\0virtual:${id}`;
			}
			// Also handle react and react-dom
			if (id === 'react' || id === 'react-dom') {
				return `\0virtual:${id}`;
			}
		},
		load(id) {
			// Return virtual module stubs for dev mode
			if (id.startsWith('\0virtual:@wordpress/')) {
				const packageName = id.replace('\0virtual:', '');
				
				// Return stub exports - actual values come from window.wp at runtime via import maps
				if (packageName === '@wordpress/blocks') {
					return `export const registerBlockType = () => {};
export const unregisterBlockType = () => {};
export default {};`;
				}
				if (packageName === '@wordpress/block-editor') {
					return `export const useBlockProps = () => ({});
export const InspectorControls = () => null;
export const BlockControls = () => null;
export const RichText = () => null;
export const AlignmentToolbar = () => null;
export const BlockAlignmentToolbar = () => null;
export const PanelColorSettings = () => null;
export default {};`;
				}
				if (packageName === '@wordpress/components') {
					return `export const Button = () => null;
export const ButtonGroup = () => null;
export const PanelBody = () => null;
export const PanelRow = () => null;
export const TextControl = () => null;
export const TextareaControl = () => null;
export const SelectControl = () => null;
export const ToggleControl = () => null;
export const RangeControl = () => null;
export const Modal = () => null;
export const BaseControl = () => null;
export const Panel = () => null;
export const ToolbarGroup = () => null;
export const ToolbarButton = () => null;
export const Spinner = () => null;
export const Placeholder = () => null;
export const ColorPalette = () => null;
export default {};`;
				}
				if (packageName === '@wordpress/data') {
					return `export const useSelect = () => ({});
export const useDispatch = () => ({});
export const select = () => ({});
export const dispatch = () => ({});
export const subscribe = () => () => {};
export const registerStore = () => {};
export default {};`;
				}
				if (packageName === '@wordpress/element') {
					return `export const createElement = () => null;
export const Fragment = Symbol('Fragment');
export const useState = () => [null, () => {}];
export const useEffect = () => {};
export const useRef = () => ({ current: null });
export const useMemo = () => null;
export const useCallback = () => () => {};
export default {};`;
				}
				if (packageName === '@wordpress/i18n') {
					return `export const __ = (text) => text;
export const _x = (text) => text;
export const _n = (text) => text;
export default {};`;
				}
				if (packageName === '@wordpress/core-data') {
					return `export const useEntityProp = () => [null, () => {}];
export const useEntityRecord = () => ({});
export const useEntityRecords = () => ({ data: [], isResolving: false });
export default {};`;
				}
				if (packageName === '@wordpress/server-side-render') {
					return `const ServerSideRender = () => null;
export default ServerSideRender;`;
				}
				if (packageName === '@wordpress/api-fetch') {
					return `const apiFetch = () => Promise.resolve({});
export default apiFetch;`;
				}
				if (packageName === '@wordpress/icons') {
					return `export const Icon = () => null;
export default {};`;
				}
				// Generic fallback
				return `export default {};`;
			}
			// Handle react and react-dom
			if (id === '\0virtual:react') {
				return `export const createElement = () => null;
export const Fragment = Symbol('Fragment');
export const Component = class {};
export const useState = () => [null, () => {}];
export const useEffect = () => {};
export const useRef = () => ({ current: null });
export const useMemo = () => null;
export const useCallback = () => () => {};
export default {};`;
			}
			if (id === '\0virtual:react-dom') {
				return `export const createRoot = () => ({ render: () => {}, unmount: () => {} });
export default {};`;
			}
			// CRITICAL: Handle rungen (dependency of @wordpress/data)
			if (id === '\0virtual:rungen') {
				return `export const create = () => {};
export default { create: () => {} };`;
			}
		},
	};
}

