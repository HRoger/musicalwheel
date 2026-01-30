/**
 * Post Feed Filters Hook
 *
 * Fetches available filters for a post type from the REST API.
 * Used in "Filters" source mode for 1:1 Voxel parity.
 *
 * 1:1 PARITY Evidence:
 * - Voxel post-feed.php:1374-1438 builds filter repeater per post type
 * - Each filter has elementor_controls that define how it can be configured
 * - Our REST endpoint /post-feed/filters exposes this same data
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';

/**
 * Filter control definition from API
 */
export interface FilterControl {
	key: string;
	fullKey: string;
	label: string;
	type: string;
	default: unknown;
	options?: Record<string, string>;
}

/**
 * Filter data from API
 */
export interface FilterData {
	key: string;
	label: string;
	type: string;
	description: string;
	icon: string;
	controls: FilterControl[];
}

/**
 * API response structure
 */
interface FiltersResponse {
	filters: FilterData[];
	postType: string;
	error?: string;
}

interface UseFiltersReturn {
	filters: FilterData[];
	isLoading: boolean;
	error: string | null;
}

/**
 * Hook to fetch available filters for a post type
 *
 * @param postType - The post type key to fetch filters for
 */
export function useFilters(postType: string | null): UseFiltersReturn {
	const [filters, setFilters] = useState<FilterData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Don't fetch if no post type
		if (!postType) {
			setFilters([]);
			return;
		}

		let isMounted = true;
		setIsLoading(true);
		setError(null);

		async function fetchFilters(): Promise<void> {
			try {
				const response = await apiFetch<FiltersResponse>({
					path: `/voxel-fse/v1/post-feed/filters?post_type=${encodeURIComponent(postType)}`,
				});

				if (isMounted) {
					if (response.error) {
						setError(response.error);
						setFilters([]);
					} else {
						setFilters(response.filters || []);
					}
					setIsLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					const message = err instanceof Error ? err.message : 'Failed to fetch filters';
					setError(message);
					setFilters([]);
					setIsLoading(false);
				}
			}
		}

		fetchFilters();

		return () => {
			isMounted = false;
		};
	}, [postType]);

	return { filters, isLoading, error };
}

export default useFilters;
