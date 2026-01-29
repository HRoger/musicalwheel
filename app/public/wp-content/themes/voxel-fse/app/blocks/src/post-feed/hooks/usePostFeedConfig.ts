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
 * Hook to fetch post feed configuration
 */
export function usePostFeedConfig(): UsePostFeedConfigReturn {
	const [config, setConfig] = useState<PostFeedConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
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
	}, []);

	return { config, isLoading, error };
}

export default usePostFeedConfig;
