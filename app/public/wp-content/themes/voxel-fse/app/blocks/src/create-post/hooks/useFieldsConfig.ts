/**
 * useFieldsConfig Hook
 * Manages field configuration loading for the create-post form
 *
 * Phase 3: Custom hook for data loading
 *
 * Usage:
 * - Editor context: Loads from REST API endpoint
 * - Frontend context: Loads from window.voxelFseCreatePost
 */
import { useState, useEffect } from 'react';
import type { VoxelField } from '../types';

/**
 * WordPress apiFetch function type
 */
declare const wp: {
	apiFetch: <T = unknown>(options: { path: string }) => Promise<T>;
};

/**
 * API Response type for post-type-fields endpoint
 */
interface PostTypeFieldsResponse {
	fields_config: VoxelField[];
	field_count: number;
}

/**
 * Window extension for frontend data
 */
declare global {
	interface Window {
		voxelFseCreatePost?: {
			fieldsConfig?: VoxelField[];
			ajaxUrl?: string;
			nonce?: string;
		};
	}
}

/**
 * Hook return type
 */
export interface UseFieldsConfigReturn {
	fieldsConfig: VoxelField[];
	isLoading: boolean;
	error: string | null;
}

/**
 * Get pre-injected editor config from window.__voxelFseEditorConfig
 * This is set by Block_Loader::inject_editor_config_data() via wp_add_inline_script
 */
function getInlineEditorFields(postTypeKey: string): PostTypeFieldsResponse | null {
	try {
		const config = (window as any).__voxelFseEditorConfig?.createPostFields?.[postTypeKey];
		if (config?.fields_config && Array.isArray(config.fields_config) && config.fields_config.length > 0) {
			return config;
		}
	} catch {}
	return null;
}

/**
 * useFieldsConfig Hook
 *
 * @param postTypeKey - Voxel post type key (e.g., 'places', 'events')
 * @param context - 'editor' or 'frontend'
 * @returns Field configuration, loading state, and error
 */
export function useFieldsConfig(
	postTypeKey: string,
	context: 'editor' | 'frontend'
): UseFieldsConfigReturn {
	// Check for pre-injected editor data (eliminates spinner)
	const inlineData = context === 'editor' && postTypeKey ? getInlineEditorFields(postTypeKey) : null;

	const [fieldsConfig, setFieldsConfig] = useState<VoxelField[]>(
		inlineData?.fields_config || []
	);
	const [isLoading, setIsLoading] = useState<boolean>(!inlineData);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadFields = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (context === 'editor') {
					if (!postTypeKey) {
						setFieldsConfig([]);
						setIsLoading(false);
						return;
					}

					// Check for pre-injected data first
					const inline = getInlineEditorFields(postTypeKey);
					if (inline) {
						setFieldsConfig(inline.fields_config || []);
						setIsLoading(false);
						return;
					}

					// Fallback: Load from REST API
					const data = await wp.apiFetch<PostTypeFieldsResponse>({
						path: `/voxel-fse/v1/post-type-fields?post_type=${postTypeKey}`,
					});

					setFieldsConfig(data.fields_config || []);
				} else {
					// Frontend: Load from window object (wp_localize_script)
					const wpData = window.voxelFseCreatePost || {};
					const fields = wpData.fieldsConfig || [];

					setFieldsConfig(fields);
				}

				setIsLoading(false);
			} catch (err) {
				console.error(`useFieldsConfig (${context}): Error loading fields`, err);
				setError(err instanceof Error ? err.message : 'Failed to load fields');
				setIsLoading(false);
			}
		};

		// Skip if we already have inline data for this post type
		if (inlineData && context === 'editor') {
			return;
		}

		loadFields();
	}, [postTypeKey, context]);

	return {
		fieldsConfig,
		isLoading,
		error,
	};
}
