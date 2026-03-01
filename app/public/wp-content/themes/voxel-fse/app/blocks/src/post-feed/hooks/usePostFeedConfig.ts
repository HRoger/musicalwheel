/**
 * Post Feed Configuration Hook
 *
 * Fetches post feed configuration from REST API.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { PostFeedConfig } from '../types';

interface UsePostFeedConfigReturn {
	config: PostFeedConfig | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Read inline editor config (injected by Block_Loader::inject_editor_config_data).
 * Eliminates REST API round-trip for post-feed config in the editor.
 */
function getInlineConfig(): PostFeedConfig | null {
	try {
		const data = (window as any).__voxelFseEditorConfig?.postFeed;
		if (data && Array.isArray(data.postTypes) && data.postTypes.length > 0) {
			return data as PostFeedConfig;
		}
	} catch {
		// Ignore
	}
	return null;
}

/**
 * Hook to fetch post feed configuration
 */
export function usePostFeedConfig(): UsePostFeedConfigReturn {
	const inlineConfig = getInlineConfig();
	const [config, setConfig] = useState<PostFeedConfig | null>(inlineConfig);
	const [isLoading, setIsLoading] = useState(!inlineConfig);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Skip REST fetch if inline config is available
		if (inlineConfig) return;

		let isMounted = true;

		async function fetchConfig(): Promise<void> {
			try {
				const response = await apiFetch<PostFeedConfig>({
					path: '/voxel-fse/v1/post-feed/config',
				});

				if (isMounted) {
					setConfig(response);
					setIsLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					const message = err instanceof Error ? err.message : 'Failed to fetch configuration';
					setError(message);
					setIsLoading(false);
				}
			}
		}

		fetchConfig();

		return () => {
			isMounted = false;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { config, isLoading, error };
}

export default usePostFeedConfig;
