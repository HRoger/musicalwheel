/**
 * Render Dynamic Tags Utility
 *
 * Client-side renderer for dynamic tags in editor preview using REST API.
 * Full server-side rendering happens via Block_Renderer.
 *
 * @package VoxelFSE
 */

import apiFetch from '@wordpress/api-fetch';

/**
 * Check if a value contains dynamic tags
 */
export function hasDynamicTags(value: string): boolean {
	return typeof value === 'string' && value.includes('@tags()');
}

/**
 * Extract tag content from wrapped value
 */
export function extractTagContent(value: string): string {
	if (!hasDynamicTags(value)) {
		return value;
	}

	const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
	return match ? match[1] : value;
}

/**
 * Render a dynamic tag expression via REST API
 *
 * @param expression The tag expression to render (without @tags() wrapper)
 * @param context Optional context override
 * @returns Rendered value or original expression on error
 */
export async function renderDynamicExpression(
	expression: string,
	context: Record<string, any> = {}
): Promise<string> {
	try {
		const response = await apiFetch<{ expression: string; rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: {
				expression,
				context,
			},
		});

		return response.rendered;
	} catch (error) {
		console.error('Failed to render dynamic tag:', error);
		// Return original expression on error
		return expression;
	}
}

/**
 * Get display value for editor - shows original value if no tags, expression if tags exist
 * Note: This is synchronous. Use renderDynamicExpression() for async rendering.
 */
export function getDisplayValue(value: string): string {
	if (!value) {
		return '';
	}

	if (hasDynamicTags(value)) {
		// Show the tag expression without the @tags() wrapper
		return extractTagContent(value);
	}

	return value;
}
