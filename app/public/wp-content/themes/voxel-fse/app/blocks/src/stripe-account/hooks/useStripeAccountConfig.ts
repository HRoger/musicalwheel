/**
 * Stripe Account Configuration Hook
 *
 * Fetches Stripe account configuration from REST API for Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import type { StripeAccountConfig } from '../types';

/**
 * REST API response structure
 */
interface APIResponse {
	success: boolean;
	data?: StripeAccountConfig;
	message?: string;
}

/**
 * Hook state interface
 */
interface UseStripeAccountConfigResult {
	config: StripeAccountConfig | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * WordPress API settings type
 */
interface WPApiSettings {
	root?: string;
	nonce?: string;
}

/**
 * Get REST API base URL
 */
function getRestUrl(): string {
	// WordPress provides wpApiSettings when scripts are properly enqueued
	const win = window as unknown as { wpApiSettings?: WPApiSettings };
	if (typeof window !== 'undefined' && win.wpApiSettings?.root) {
		return win.wpApiSettings.root;
	}
	// Fallback to relative path
	return '/wp-json/';
}

/**
 * Get WordPress REST API nonce
 */
function getNonce(): string {
	const win = window as unknown as { wpApiSettings?: WPApiSettings };
	return win.wpApiSettings?.nonce || '';
}

/**
 * Custom hook to fetch Stripe account configuration
 *
 * @param previewAsUser - User ID or dynamic tag to preview as (editor only)
 */
export function useStripeAccountConfig(previewAsUser?: string | number | null): UseStripeAccountConfigResult {
	const [config, setConfig] = useState<StripeAccountConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [fetchTrigger, setFetchTrigger] = useState(0);

	const refetch = () => {
		setFetchTrigger((prev) => prev + 1);
	};

	useEffect(() => {
		let cancelled = false;

		async function fetchConfig() {
			setIsLoading(true);
			setError(null);

			const restUrl = getRestUrl();
			const params = new URLSearchParams();

			if (previewAsUser) {
				params.append('user_id', previewAsUser.toString());
			}

			const endpoint = `${restUrl}voxel-fse/v1/stripe-account/config${params.toString() ? `?${params.toString()}` : ''}`;

			try {
				const response = await fetch(endpoint, {
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': getNonce(),
					},
					credentials: 'same-origin',
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data: APIResponse = await response.json();

				if (!cancelled) {
					if (data.success && data.data) {
						setConfig(data.data);
					} else {
						setError(data.message || 'Failed to load configuration');
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load configuration');
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
	}, [previewAsUser, fetchTrigger]);

	return { config, isLoading, error, refetch };
}

export default useStripeAccountConfig;
