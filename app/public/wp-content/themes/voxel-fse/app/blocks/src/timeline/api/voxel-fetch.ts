/**
 * Voxel Fetch - Base API Client
 *
 * Wrapper for Voxel's AJAX pattern that works in both WordPress and headless environments.
 * Uses REST API endpoints registered by our PHP controller.
 *
 * @package VoxelFSE
 */

import { getSiteBaseUrl } from '@shared/utils/siteUrl';

declare global {
	interface Window {
		wpApiSettings?: {
			nonce: string;
			root: string;
		};
		voxelFseConfig?: {
			restUrl: string;
			nonce: string;
		};
	}
}

/**
 * API Error class for better error handling
 */
export class VoxelApiError extends Error {
	public readonly code: string;
	public readonly status: number;
	public readonly data: unknown;

	constructor(message: string, code: string, status: number, data?: unknown) {
		super(message);
		this.name = 'VoxelApiError';
		this.code = code;
		this.status = status;
		this.data = data;
	}
}

/**
 * Response structure from Voxel API
 */
export interface VoxelResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	code?: string;
	errors?: Record<string, string[]>;
}

/**
 * Request options
 */
export interface FetchOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	body?: Record<string, unknown> | FormData;
	headers?: Record<string, string>;
	signal?: AbortSignal;
}

/**
 * Get REST API base URL
 */
function getRestUrl(): string {
	// Check for voxel-fse config first (headless)
	if (window.voxelFseConfig?.restUrl) {
		return window.voxelFseConfig.restUrl;
	}

	// Fall back to WordPress REST API
	if (window.wpApiSettings?.root) {
		return window.wpApiSettings.root;
	}

	// Default fallback
	return '/wp-json/';
}

/**
 * Get authentication nonce
 */
function getNonce(): string {
	// Check for voxel-fse config first (headless)
	if (window.voxelFseConfig?.nonce) {
		return window.voxelFseConfig.nonce;
	}

	// Fall back to WordPress nonce
	if (window.wpApiSettings?.nonce) {
		return window.wpApiSettings.nonce;
	}

	return '';
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
	const baseUrl = getRestUrl();
	const url = new URL(endpoint, baseUrl);

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, String(value));
			}
		});
	}

	return url.toString();
}

/**
 * Main fetch function for Voxel REST API
 */
export async function voxelFetch<T = unknown>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const { method = 'GET', body, headers = {}, signal } = options;

	const nonce = getNonce();

	const requestHeaders: Record<string, string> = {
		...headers,
	};

	// Add nonce for WordPress authentication
	if (nonce) {
		requestHeaders['X-WP-Nonce'] = nonce;
	}

	// Build fetch options
	const fetchOptions: RequestInit = {
		method,
		headers: requestHeaders,
		credentials: 'same-origin',
		signal,
	};

	// Handle body for POST/PUT/PATCH
	if (body && method !== 'GET') {
		if (body instanceof FormData) {
			// FormData handles its own content-type
			fetchOptions.body = body;
		} else {
			requestHeaders['Content-Type'] = 'application/json';
			fetchOptions.body = JSON.stringify(body);
		}
	}

	// Make the request
	const url = buildUrl(endpoint);

	try {
		const response = await fetch(url, fetchOptions);

		// Parse JSON response
		const data: VoxelResponse<T> = await response.json();

		// Check for API-level errors
		if (!response.ok) {
			throw new VoxelApiError(
				data.message || `HTTP ${response.status}`,
				data.code || 'http_error',
				response.status,
				data
			);
		}

		// Check for success flag in response
		if (data.success === false) {
			throw new VoxelApiError(
				data.message || 'Request failed',
				data.code || 'api_error',
				response.status,
				data
			);
		}

		// Return the data payload
		return data.data as T;
	} catch (error) {
		// Re-throw VoxelApiError as-is
		if (error instanceof VoxelApiError) {
			throw error;
		}

		// Handle network errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			throw new VoxelApiError(
				'Network error. Please check your connection.',
				'network_error',
				0
			);
		}

		// Handle abort errors
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new VoxelApiError(
				'Request was cancelled',
				'abort_error',
				0
			);
		}

		// Unknown error
		throw new VoxelApiError(
			error instanceof Error ? error.message : 'Unknown error',
			'unknown_error',
			0,
			error
		);
	}
}

/**
 * GET request helper
 */
export async function voxelGet<T = unknown>(
	endpoint: string,
	params?: Record<string, string | number | boolean>,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
	const url = params ? buildUrl(endpoint, params) : endpoint;
	return voxelFetch<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function voxelPost<T = unknown>(
	endpoint: string,
	body?: Record<string, unknown> | FormData,
	options?: Omit<FetchOptions, 'method'>
): Promise<T> {
	return voxelFetch<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request helper
 */
export async function voxelPut<T = unknown>(
	endpoint: string,
	body?: Record<string, unknown>,
	options?: Omit<FetchOptions, 'method'>
): Promise<T> {
	return voxelFetch<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request helper
 */
export async function voxelDelete<T = unknown>(
	endpoint: string,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
	return voxelFetch<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Create an abort controller with timeout
 */
export function createAbortController(timeoutMs: number = 30000): {
	controller: AbortController;
	clear: () => void;
} {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	return {
		controller,
		clear: () => clearTimeout(timeoutId),
	};
}

/**
 * Direct AJAX request to Voxel's native endpoint (GET)
 *
 * Uses Voxel's custom AJAX router at `/?vx=1&action={action}`
 * This bypasses REST API proxy issues where wp_send_json() terminates the script.
 *
 * @param action - The Voxel action (e.g., 'timeline/v2/get_feed')
 * @param params - Query parameters to send
 * @param options - Fetch options (mainly for abort signal)
 * @returns The response data from Voxel
 */
export async function voxelAjax<T = unknown>(
	action: string,
	params: Record<string, string | number | boolean | undefined> = {},
	options: Pick<FetchOptions, 'signal'> = {}
): Promise<T> {
	// Build URL manually to match Voxel's jQuery.get() format
	// jQuery doesn't encode slashes in the action parameter
	const queryParts = Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

	// MULTISITE FIX: Use getSiteBaseUrl() instead of hardcoded /?vx=1
	// This ensures the correct site path is used in multisite subdirectory installations
	// e.g., on /vx-fse-stays/ subsite, this returns http://example.com/vx-fse-stays/?vx=1
	const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
	const url = `${siteBase}/?vx=1&action=${action}${queryParts.length ? '&' + queryParts.join('&') : ''}`;

	console.log('[voxelAjax] Calling:', url);

	try {
		const response = await fetch(url, {
			method: 'GET',
			credentials: 'same-origin',
			signal: options.signal,
		});

		if (!response.ok) {
			throw new VoxelApiError(
				`Voxel AJAX failed: HTTP ${response.status}`,
				'http_error',
				response.status
			);
		}

		const data: VoxelResponse<T> = await response.json();

		console.log('[voxelAjax] Response:', data);

		// Check for success flag
		if (data.success === false) {
			throw new VoxelApiError(
				data.message || 'Voxel AJAX request failed',
				data.code || 'voxel_error',
				response.status,
				data
			);
		}

		// Return the full response - Voxel feed includes data, has_more, meta at top level
		return data as T;
	} catch (error) {
		// Re-throw VoxelApiError as-is
		if (error instanceof VoxelApiError) {
			throw error;
		}

		// Handle abort errors
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new VoxelApiError(
				'Request was cancelled',
				'abort_error',
				0
			);
		}

		// Handle network errors
		if (error instanceof TypeError) {
			throw new VoxelApiError(
				'Network error. Please check your connection.',
				'network_error',
				0
			);
		}

		// Unknown error
		throw new VoxelApiError(
			error instanceof Error ? error.message : 'Unknown error',
			'unknown_error',
			0,
			error
		);
	}
}

/**
 * Direct AJAX POST request to Voxel's native endpoint
 *
 * Uses Voxel's custom AJAX router at `/?vx=1&action={action}` with POST method.
 * This bypasses REST API proxy issues where wp_send_json() terminates the script.
 *
 * Voxel's POST endpoints expect form data with:
 * - The action parameters in the URL
 * - The data as FormData in the body
 * - A valid nonce in _wpnonce field
 *
 * @param action - The Voxel action (e.g., 'timeline/v2/status.like')
 * @param params - Parameters to send (will be sent as FormData)
 * @param options - Fetch options (mainly for abort signal)
 * @returns The response data from Voxel
 */
export async function voxelAjaxPost<T = unknown>(
	action: string,
	params: Record<string, string | number | boolean | undefined> = {},
	options: Pick<FetchOptions, 'signal'> = {}
): Promise<T> {
	// MULTISITE FIX: Use getSiteBaseUrl() instead of hardcoded /?vx=1
	// This ensures the correct site path is used in multisite subdirectory installations
	const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
	const url = `${siteBase}/?vx=1&action=${action}`;

	// Build FormData for POST request (matches Voxel's jQuery.post() format)
	const formData = new FormData();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			formData.append(key, String(value));
		}
	});

	console.log('[voxelAjaxPost] Calling:', url, 'with params:', params);

	try {
		const response = await fetch(url, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
			signal: options.signal,
		});

		if (!response.ok) {
			throw new VoxelApiError(
				`Voxel AJAX POST failed: HTTP ${response.status}`,
				'http_error',
				response.status
			);
		}

		const data: VoxelResponse<T> = await response.json();

		console.log('[voxelAjaxPost] Response:', data);

		// Check for success flag
		if (data.success === false) {
			throw new VoxelApiError(
				data.message || 'Voxel AJAX POST request failed',
				data.code || 'voxel_error',
				response.status,
				data
			);
		}

		// Return the full response
		return data as T;
	} catch (error) {
		// Re-throw VoxelApiError as-is
		if (error instanceof VoxelApiError) {
			throw error;
		}

		// Handle abort errors
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new VoxelApiError(
				'Request was cancelled',
				'abort_error',
				0
			);
		}

		// Handle network errors
		if (error instanceof TypeError) {
			throw new VoxelApiError(
				'Network error. Please check your connection.',
				'network_error',
				0
			);
		}

		// Unknown error
		throw new VoxelApiError(
			error instanceof Error ? error.message : 'Unknown error',
			'unknown_error',
			0,
			error
		);
	}
}
