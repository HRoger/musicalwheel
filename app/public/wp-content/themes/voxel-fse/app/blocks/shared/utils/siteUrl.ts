/**
 * Site URL Utility - Multisite Compatibility
 *
 * Provides utilities for getting the correct site base URL in WordPress multisite
 * installations. This is critical for subdirectory multisite setups where relative
 * URLs like `/?vx=1` would resolve to the main site instead of the subsite.
 *
 * Example:
 * - Main site: http://example.com/
 * - Subsite: http://example.com/vx-fse-stays/
 *
 * Without this utility:
 *   `/?vx=1` resolves to http://example.com/?vx=1 (main site!)
 *
 * With this utility:
 *   `getSiteBaseUrl()` returns http://example.com/vx-fse-stays/?vx=1
 *
 * @package VoxelFSE
 */

/**
 * Get the WordPress site base URL with Voxel AJAX endpoint
 *
 * Detects the site path from the WordPress REST API meta tag that WordPress
 * outputs in the page head: <link rel="https://api.w.org/" href="{site_url}/wp-json/" />
 *
 * This works for:
 * - Single-site WordPress
 * - Multisite subdomain (e.g., stays.example.com)
 * - Multisite subdirectory (e.g., example.com/vx-fse-stays/)
 *
 * @returns The site base URL with ?vx=1 appended for Voxel AJAX
 */
export function getSiteBaseUrl(): string {
	// Try to get from WordPress REST API settings (most reliable)
	if (typeof window !== 'undefined' && window.wpApiSettings?.root) {
		// wpApiSettings.root is like "http://example.com/vx-fse-stays/wp-json/"
		// We need "http://example.com/vx-fse-stays/?vx=1"
		const root = window.wpApiSettings.root;
		const siteUrl = root.replace(/\/wp-json\/?$/, '');
		return siteUrl + '?vx=1';
	}

	// Fallback: Parse from REST API link in page head
	if (typeof document !== 'undefined') {
		const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
		if (apiLink) {
			const href = apiLink.getAttribute('href');
			if (href) {
				// href is like "http://example.com/vx-fse-stays/wp-json/"
				const siteUrl = href.replace(/\/wp-json\/?$/, '');
				return siteUrl + '?vx=1';
			}
		}
	}

	// Last resort: Use current origin (may break on multisite subdirectory)
	if (typeof window !== 'undefined') {
		return window.location.origin + '?vx=1';
	}

	// SSR fallback
	return '/?vx=1';
}

/**
 * Get the site base path (without protocol/domain)
 *
 * Useful for constructing relative URLs that work on multisite.
 *
 * @returns The site path, e.g., "/vx-fse-stays" or "" for root
 */
export function getSitePath(): string {
	const baseUrl = getSiteBaseUrl();
	try {
		const url = new URL(baseUrl);
		// Remove the ?vx=1 query string and trailing slash
		return url.pathname.replace(/\/$/, '');
	} catch {
		return '';
	}
}

/**
 * Make a URL multisite-aware
 *
 * If the URL is relative (doesn't start with http:// or https://),
 * prepend the site base path to make it work on multisite subdirectory setups.
 *
 * @param url - The URL to process
 * @returns The multisite-aware URL
 */
export function makeMultisiteAwareUrl(url: string): string {
	// Already absolute URL - return as-is
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url;
	}

	// Get site base (without ?vx=1)
	const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');

	// Ensure URL starts with /
	const normalizedUrl = url.startsWith('/') ? url : '/' + url;

	return siteBase + normalizedUrl;
}

/**
 * Get the WordPress REST API base URL
 *
 * Works correctly on multisite subdirectory installations.
 *
 * @returns The REST API base URL (e.g., "http://example.com/vx-fse-stays/wp-json/")
 */
export function getRestBaseUrl(): string {
	// Try to get from WordPress REST API settings (most reliable)
	if (typeof window !== 'undefined' && window.wpApiSettings?.root) {
		return window.wpApiSettings.root;
	}

	// Fallback: Parse from REST API link in page head
	if (typeof document !== 'undefined') {
		const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
		if (apiLink) {
			const href = apiLink.getAttribute('href');
			if (href) {
				return href;
			}
		}
	}

	// Last resort: Use window.location.origin + /wp-json/
	// NOTE: getSitePath() could fail if getSiteBaseUrl() also can't find values
	// so we avoid the circular dependency and use origin directly
	if (typeof window !== 'undefined' && window.location?.origin) {
		// Try to extract site path from current URL for multisite subdirectory support
		// The pathname might be like /vx-stays/stays-grid/ - we need just /vx-stays
		const pathParts = window.location.pathname.split('/').filter(Boolean);
		// Check if first part looks like a subsite (not a post type or common WP path)
		const wpPaths = ['wp-admin', 'wp-content', 'wp-includes', 'wp-json'];
		if (pathParts.length > 0 && !wpPaths.includes(pathParts[0])) {
			// Might be a multisite subsite path, include first segment
			return window.location.origin + '/' + pathParts[0] + '/wp-json/';
		}
		return window.location.origin + '/wp-json/';
	}

	// SSR fallback - always return a usable value
	return '/wp-json/';
}

// Add window type declarations
declare global {
	interface Window {
		wpApiSettings?: {
			root: string;
			nonce?: string;
		};
	}
}
