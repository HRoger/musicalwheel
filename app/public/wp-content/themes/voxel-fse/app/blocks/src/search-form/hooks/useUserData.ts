/**
 * useUserData Hook
 *
 * Fetches user display data from the REST API.
 * Used as a fallback when PHP frontend_props() doesn't provide user data.
 *
 * ADAPTER PATTERN:
 * This hook wraps the API call so when Voxel releases an official API,
 * we only need to update the endpoint URL here.
 *
 * Evidence: themes/voxel/app/post-types/filters/user-filter.php:51-62
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback } from 'react';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

export interface UserData {
	id: number;
	name: string;
	avatar: string;
}

interface UseUserDataOptions {
	/** User ID to fetch data for */
	userId: number | null;
	/** Skip fetching if we already have data from PHP props */
	skip?: boolean;
}

interface UseUserDataReturn {
	userData: UserData | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Hook to fetch user data for display in filters
 *
 * @param options - Configuration options
 * @returns User data, loading state, and error
 */
export function useUserData(options: UseUserDataOptions): UseUserDataReturn {
	const { userId, skip = false } = options;

	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUserData = useCallback(async () => {
		if (!userId || skip) {
			setUserData(null);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// ADAPTER PATTERN: API endpoint is defined here
			// When Voxel releases official API, update this URL
			const restUrl = getRestBaseUrl();
			const response = await fetch(
				`${restUrl}voxel-fse/v1/search-form/user-data?user_id=${userId}`
			);

			if (response.ok) {
				const data = await response.json();
				setUserData({
					id: data.id,
					name: data.name,
					avatar: data.avatar || '',
				});
			} else {
				// User not found or error - set fallback
				setUserData({
					id: userId,
					name: 'Unknown',
					avatar: '',
				});
				setError('User not found');
			}
		} catch (err) {
			console.error('useUserData: Error fetching user data:', err);
			setUserData({
				id: userId,
				name: 'Unknown',
				avatar: '',
			});
			setError(err instanceof Error ? err.message : 'Failed to fetch user data');
		} finally {
			setIsLoading(false);
		}
	}, [userId, skip]);

	// Fetch on mount and when userId changes
	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	return {
		userData,
		isLoading,
		error,
		refetch: fetchUserData,
	};
}

export default useUserData;
