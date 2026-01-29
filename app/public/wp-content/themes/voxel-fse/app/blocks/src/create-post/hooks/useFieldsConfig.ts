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
	const [fieldsConfig, setFieldsConfig] = useState<VoxelField[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadFields = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (context === 'editor') {
					// Editor: Load from REST API
					// Endpoint created in Phase 1: /wp-json/voxel-fse/v1/post-type-fields
					if (!postTypeKey) {
						setFieldsConfig([]);
						setIsLoading(false);
						return;
					}

					// Use wp.apiFetch for WordPress REST API calls
					const data = await wp.apiFetch<PostTypeFieldsResponse>({
						path: `/voxel-fse/v1/post-type-fields?post_type=${postTypeKey}`,
					});

					console.log(`useFieldsConfig (editor): Loaded ${data.field_count} fields for ${postTypeKey}`);
					setFieldsConfig(data.fields_config || []);
				} else {
					// Frontend: Load from window object (wp_localize_script)
					const wpData = window.voxelFseCreatePost || {};
					const fields = wpData.fieldsConfig || [];

					console.log(`useFieldsConfig (frontend): Loaded ${fields.length} fields from window object`);
					setFieldsConfig(fields);
				}

				setIsLoading(false);
			} catch (err) {
				console.error(`useFieldsConfig (${context}): Error loading fields`, err);
				setError(err instanceof Error ? err.message : 'Failed to load fields');
				setIsLoading(false);
			}
		};

		loadFields();
	}, [postTypeKey, context]);

	return {
		fieldsConfig,
		isLoading,
		error,
	};
}
