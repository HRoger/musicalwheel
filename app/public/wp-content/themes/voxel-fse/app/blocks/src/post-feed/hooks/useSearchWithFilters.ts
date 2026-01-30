/**
 * Search With Filters Hook
 *
 * Executes search using our REST endpoint that properly replicates
 * Voxel's filter lifecycle (set_elementor_config + get_default_value_from_elementor).
 *
 * 1:1 PARITY Evidence:
 * - Voxel post-feed.php:1443-1506 (search-filters source mode)
 * - Our endpoint /post-feed/search-with-filters replicates this exact lifecycle
 *
 * @package VoxelFSE
 */

import { useCallback, useState } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { FilterConfig, SearchWithFiltersResponse } from '../types';

interface SearchWithFiltersParams {
	postType: string;
	filters?: FilterConfig[];
	limit?: number;
	offset?: number;
	page?: number;
	exclude?: string;
	priorityFilter?: boolean;
	priorityMin?: number;
	priorityMax?: number;
	cardTemplate?: string;
	getTotalCount?: boolean;
}

interface UseSearchWithFiltersReturn {
	search: (params: SearchWithFiltersParams) => Promise<SearchWithFiltersResponse>;
	isSearching: boolean;
	lastError: string | null;
}

/**
 * Hook to execute search with pre-configured filters
 *
 * Uses our REST endpoint that properly sets up filter lifecycle:
 * 1. Calls set_elementor_config() on each filter
 * 2. Calls get_default_value_from_elementor() to get filter values
 * 3. Passes to \Voxel\get_search_results()
 */
export function useSearchWithFilters(): UseSearchWithFiltersReturn {
	const [isSearching, setIsSearching] = useState(false);
	const [lastError, setLastError] = useState<string | null>(null);

	const search = useCallback(async (params: SearchWithFiltersParams): Promise<SearchWithFiltersResponse> => {
		setIsSearching(true);
		setLastError(null);

		try {
			const response = await apiFetch<SearchWithFiltersResponse>({
				path: '/voxel-fse/v1/post-feed/search-with-filters',
				method: 'POST',
				data: {
					post_type: params.postType,
					filters: params.filters || [],
					limit: params.limit || 10,
					offset: params.offset || 0,
					page: params.page || 1,
					exclude: params.exclude || '',
					priority_filter: params.priorityFilter || false,
					priority_min: params.priorityMin || 0,
					priority_max: params.priorityMax || 0,
					card_template: params.cardTemplate || 'main',
					get_total_count: params.getTotalCount || false,
				},
			});

			setIsSearching(false);

			if (!response.success && response.error) {
				setLastError(response.error);
			}

			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Search failed';
			setLastError(message);
			setIsSearching(false);

			// Return error response
			return {
				success: false,
				html: '',
				ids: [],
				hasResults: false,
				hasPrev: false,
				hasNext: false,
				totalCount: 0,
				displayCount: '0',
				templateId: null,
				page: params.page || 1,
				error: message,
			};
		}
	}, []);

	return { search, isSearching, lastError };
}

export default useSearchWithFilters;
