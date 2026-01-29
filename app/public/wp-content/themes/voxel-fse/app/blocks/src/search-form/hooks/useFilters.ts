/**
 * useFilters Hook
 *
 * Fetches available filters for a specific Voxel post type.
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { FilterData } from '../types';

interface UseFiltersReturn {
	filters: FilterData[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useFilters( postTypeKey: string | null ): UseFiltersReturn {
	const [ filters, setFilters ] = useState<FilterData[]>( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState<string | null>( null );

	const fetchFilters = useCallback( async () => {
		if ( ! postTypeKey ) {
			setFilters( [] );
			return;
		}

		setIsLoading( true );
		setError( null );

		try {
			const data = await apiFetch<FilterData[]>( {
				path: `/voxel-fse/v1/search-form/filters?post_type=${ encodeURIComponent( postTypeKey ) }`,
			} );
			setFilters( data || [] );
		} catch ( err ) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load filters';
			setError( errorMessage );
			console.error( 'useFilters error:', err );
		} finally {
			setIsLoading( false );
		}
	}, [ postTypeKey ] );

	useEffect( () => {
		fetchFilters();
	}, [ fetchFilters ] );

	return {
		filters,
		isLoading,
		error,
		refetch: fetchFilters,
	};
}

export default useFilters;
