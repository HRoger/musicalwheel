/**
 * Cart Summary Block - useCartConfig Hook
 *
 * Fetches cart configuration from REST API for editor preview.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import type { CartConfig } from '../types';

interface UseCartConfigResult {
	config: CartConfig | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Get the REST API base URL
 */
function getRestUrl(): string {
	// WordPress provides wpApiSettings when scripts are properly enqueued
	const win = window as unknown as { wpApiSettings?: { root?: string } };
	if (typeof window !== 'undefined' && win.wpApiSettings?.root) {
		return win.wpApiSettings.root;
	}
	// Fallback to relative path
	return '/wp-json/';
}

/**
 * Hook to fetch cart configuration from REST API
 */
export function useCartConfig(): UseCartConfigResult {
	const [config, setConfig] = useState<CartConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchConfig() {
			const restUrl = getRestUrl();

			try {
				const response = await fetch(`${restUrl}voxel-fse/v1/cart/config`, {
					credentials: 'same-origin',
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = (await response.json()) as CartConfig;

				if (!cancelled) {
					setConfig(data);
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					const errorMessage =
						err instanceof Error ? err.message : 'Failed to fetch cart config';
					setError(errorMessage);
					console.error('Failed to fetch cart config:', err);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	return { config, isLoading, error };
}

export default useCartConfig;
