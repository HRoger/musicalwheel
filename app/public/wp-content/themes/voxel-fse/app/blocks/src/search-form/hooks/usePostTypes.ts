/**
 * usePostTypes Hook
 *
 * Fetches available Voxel post types from the REST API.
 *
 * CRITICAL: For proper 1:1 Voxel parity, this hook now supports passing
 * filter configurations which allows the PHP controller to:
 * 1. Call $filter->set_value() before frontend_props()
 * 2. Call $filter->resets_to() based on resetValue config
 * 3. Return proper `value` and `resets_to` in the response
 *
 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { PostTypeConfig, FilterConfig } from '../types';

interface UsePostTypesReturn {
	postTypes: PostTypeConfig[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

interface UsePostTypesOptions {
	/**
	 * Filter configurations keyed by post type key
	 * When provided, the API will use these to set filter values and resets_to
	 * This enables proper 1:1 Voxel parity for default values and reset behavior
	 */
	filterConfigs?: Record<string, FilterConfig[]>;
}

/**
 * Get pre-injected editor config from window.__voxelFseEditorConfig
 * This is set by Block_Loader::inject_editor_config_data() via wp_add_inline_script
 */
function getInlineEditorConfig(): PostTypeConfig[] | null {
	try {
		const config = (window as any).__voxelFseEditorConfig?.searchForm;
		if (Array.isArray(config) && config.length > 0) {
			return config;
		}
	} catch {}
	return null;
}

export function usePostTypes(options: UsePostTypesOptions = {}): UsePostTypesReturn {
	// Check for pre-injected data on initial render (eliminates spinner)
	const inlineData = getInlineEditorConfig();

	const [ postTypes, setPostTypes ] = useState<PostTypeConfig[]>( inlineData || [] );
	const [ isLoading, setIsLoading ] = useState( !inlineData );
	const [ error, setError ] = useState<string | null>( null );

	// Track the last filterConfigs to detect changes
	const filterConfigsRef = useRef<string>('');

	const fetchPostTypes = useCallback(async (filterConfigs?: Record<string, FilterConfig[]>) => {
		setIsLoading( true );
		setError( null );

		try {
			// Build filter_configs object for the API
			// Transform FilterConfig[] to the format expected by PHP controller
			const apiFilterConfigs: Record<string, Record<string, {
				defaultValueEnabled?: boolean;
				defaultValue?: unknown;
				resetValue?: string;
			}>> = {};

			if (filterConfigs) {
				Object.entries(filterConfigs).forEach(([postTypeKey, configs]) => {
					apiFilterConfigs[postTypeKey] = {};
					configs.forEach((config) => {
						apiFilterConfigs[postTypeKey][config.filterKey] = {
							defaultValueEnabled: config.defaultValueEnabled,
							defaultValue: config.defaultValue,
							resetValue: config.resetValue,
						};
					});
				});
			}

			// Use POST if we have filter configs, GET otherwise
			const hasFilterConfigs = Object.keys(apiFilterConfigs).length > 0;

			let data: PostTypeConfig[];
			if (hasFilterConfigs) {
				// POST to frontend-config with filter_configs in body
				// This allows PHP to set proper value and resets_to
				data = await apiFetch<PostTypeConfig[]>({
					path: '/voxel-fse/v1/search-form/frontend-config',
					method: 'POST',
					data: {
						filter_configs: apiFilterConfigs,
					},
				});
			} else {
				// GET for basic post types (no filter config needed)
				// Uses frontend-config (public) instead of post-types (editor-only)
				// to avoid 401 errors for logged-out users
				data = await apiFetch<PostTypeConfig[]>( {
					path: '/voxel-fse/v1/search-form/frontend-config',
				} );
			}

			setPostTypes( data || [] );
		} catch ( err ) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load post types';
			setError( errorMessage );
			console.error( 'usePostTypes error:', err );
		} finally {
			setIsLoading( false );
		}
	}, []);

	// Initial fetch - skip if we have inline data and no filter configs
	useEffect( () => {
		const hasFilterConfigs = options.filterConfigs && Object.keys(options.filterConfigs).length > 0;
		if (inlineData && !hasFilterConfigs) {
			// Already have data from inline injection, skip REST call
			return;
		}
		fetchPostTypes(options.filterConfigs);
	}, [] );

	// Refetch when filterConfigs change (deep comparison via JSON string)
	useEffect(() => {
		const newConfigsStr = JSON.stringify(options.filterConfigs || {});
		if (filterConfigsRef.current !== newConfigsStr && filterConfigsRef.current !== '') {
			// Filter configs changed, refetch
			fetchPostTypes(options.filterConfigs);
		}
		filterConfigsRef.current = newConfigsStr;
	}, [options.filterConfigs, fetchPostTypes]);

	const refetch = useCallback(() => {
		fetchPostTypes(options.filterConfigs);
	}, [fetchPostTypes, options.filterConfigs]);

	return {
		postTypes,
		isLoading,
		error,
		refetch,
	};
}

export default usePostTypes;
