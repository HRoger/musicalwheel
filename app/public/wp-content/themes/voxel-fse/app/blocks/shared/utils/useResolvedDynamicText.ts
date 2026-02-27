/**
 * Hooks to resolve VoxelScript dynamic tags for editor preview.
 *
 * Takes a string that may contain @tags()...@endtags() wrappers and resolves
 * the VoxelScript expression via the REST API. Returns the resolved value for
 * display in the editor canvas.
 *
 * The TagPreview panel in the inspector shows the raw expression — these hooks
 * are for resolving the value in the actual block output.
 *
 * Exports:
 * - useResolvedDynamicText: Resolve a single text tag
 * - useResolvedDynamicTexts: Batch-resolve multiple text tags
 * - useResolvedDynamicIcon: Resolve an icon dynamic tag to a usable icon URL
 *
 * @package VoxelFSE
 */

import { useEffect, useState, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';

/** Check if a string contains @tags()...@endtags() wrapper */
function hasDynamicTags(value: string): boolean {
	return typeof value === 'string' && value.includes('@tags()') && value.includes('@endtags()');
}

/** Extract the inner expression from @tags()...@endtags() */
function extractExpression(value: string): string {
	const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
	return match ? match[1] : value;
}

interface ResolveOptions {
	templateContext?: string;
	templatePostType?: string;
}

/**
 * Resolve a single dynamic tag text value for editor preview.
 *
 * @param value - The raw attribute value (may contain @tags()...@endtags())
 * @param options - Template context for resolution
 * @returns The resolved text, or the original value if no tags present
 */
export function useResolvedDynamicText(
	value: string,
	options: ResolveOptions = {},
): string {
	const [resolved, setResolved] = useState<string>(value);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (!value || !hasDynamicTags(value)) {
			setResolved(value);
			return;
		}

		const expression = extractExpression(value);
		if (!expression) {
			setResolved('');
			return;
		}

		// Abort previous in-flight request
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const previewContext: Record<string, string> = { type: options.templateContext || 'post' };
		if (options.templatePostType) {
			previewContext['post_type'] = options.templatePostType;
		}

		apiFetch<{ rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: {
				expression,
				preview_context: previewContext,
			},
			signal: controller.signal,
		})
			.then((res) => {
				setResolved(res.rendered ?? expression);
			})
			.catch((err: Error) => {
				if (err.name !== 'AbortError') {
					// On error, show the raw expression rather than the @tags() wrapper
					setResolved(expression);
				}
			});

		return () => {
			controller.abort();
		};
	}, [value, options.templateContext, options.templatePostType]);

	return resolved;
}

/**
 * Batch-resolve multiple dynamic tag expressions in a single REST call.
 *
 * Used when a component has many text fields that might contain VoxelScript
 * (e.g. advanced-list items with text, tooltipText, activeText, etc.).
 *
 * @param values - Record of key → raw attribute value
 * @param options - Template context for resolution
 * @returns Record of key → resolved value
 */
export function useResolvedDynamicTexts(
	values: Record<string, string>,
	options: ResolveOptions = {},
): Record<string, string> {
	const [resolved, setResolved] = useState<Record<string, string>>(values);
	const abortRef = useRef<AbortController | null>(null);
	// Serialize keys+values for dependency tracking
	const serialized = JSON.stringify(values);

	useEffect(() => {
		const entries = Object.entries(values);
		const dynamicEntries = entries.filter(([, v]) => hasDynamicTags(v));

		if (dynamicEntries.length === 0) {
			setResolved(values);
			return;
		}

		// Abort previous in-flight requests
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const previewContext: Record<string, string> = { type: options.templateContext || 'post' };
		if (options.templatePostType) {
			previewContext['post_type'] = options.templatePostType;
		}

		// Resolve each dynamic entry in parallel
		const promises = dynamicEntries.map(([key, val]) => {
			const expression = extractExpression(val);
			return apiFetch<{ rendered: string }>({
				path: '/voxel-fse/v1/dynamic-data/render',
				method: 'POST',
				data: {
					expression,
					preview_context: previewContext,
				},
				signal: controller.signal,
			})
				.then((res) => [key, res.rendered ?? expression] as const)
				.catch((err: Error) => {
					if (err.name !== 'AbortError') {
						return [key, expression] as const;
					}
					return null;
				});
		});

		Promise.all(promises).then((results) => {
			const result: Record<string, string> = { ...values };
			for (const entry of results) {
				if (entry) {
					result[entry[0]] = entry[1];
				}
			}
			setResolved(result);
		});

		return () => {
			controller.abort();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serialized, options.templateContext, options.templatePostType]);

	return resolved;
}

/**
 * Resolved icon result — either an SVG URL or null if not resolvable.
 */
export interface ResolvedIcon {
	url: string | null;
}

/**
 * Resolve a dynamic icon tag to a usable image URL for editor preview.
 *
 * When an AdvancedIconControl has `library: 'dynamic'`, its value is a
 * @tags()...@endtags() wrapped VoxelScript expression (e.g. @post(amenities.icon)).
 * Voxel resolves this to formats like:
 * - "svg:72" → attachment ID 72 (SVG icon)
 * - "123" → numeric attachment ID
 * - "https://..." → direct URL
 *
 * This hook performs the two-step resolution:
 * 1. Resolve the VoxelScript expression via REST API
 * 2. Fetch the attachment URL from WP media API if needed
 *
 * @param dynamicValue - The @tags() wrapped expression, or undefined if not dynamic
 * @param options - Template context for resolution
 * @returns The resolved icon URL, or null
 */
export function useResolvedDynamicIcon(
	dynamicValue: string | undefined,
	options: ResolveOptions = {},
): ResolvedIcon {
	const [resolved, setResolved] = useState<ResolvedIcon>({ url: null });
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (!dynamicValue || !hasDynamicTags(dynamicValue)) {
			setResolved({ url: null });
			return;
		}

		const expression = extractExpression(dynamicValue);
		if (!expression) {
			setResolved({ url: null });
			return;
		}

		// Abort previous in-flight request
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const previewContext: Record<string, string> = { type: options.templateContext || 'post' };
		if (options.templatePostType) {
			previewContext['post_type'] = options.templatePostType;
		}

		(async () => {
			try {
				// Step 1: Resolve the dynamic tag expression
				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: {
						expression,
						preview_context: previewContext,
					},
					signal: controller.signal,
				});

				if (controller.signal.aborted) return;

				let rendered = renderResult.rendered;
				// Strip any lingering @tags() wrapper
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				// Parse the rendered value:
				// - "svg:72" → attachment ID 72
				// - "123" → numeric attachment ID
				// - "https://..." → direct URL
				let attachmentId: number;
				const svgMatch = rendered.match(/^svg:(\d+)$/);
				if (svgMatch) {
					attachmentId = parseInt(svgMatch[1], 10);
				} else {
					attachmentId = parseInt(rendered, 10);
				}

				// Direct URL — use it as-is
				if (!attachmentId || isNaN(attachmentId)) {
					if (rendered.startsWith('http://') || rendered.startsWith('https://') || rendered.startsWith('/')) {
						if (!controller.signal.aborted) {
							setResolved({ url: rendered });
						}
					} else {
						if (!controller.signal.aborted) {
							setResolved({ url: null });
						}
					}
					return;
				}

				// Step 2: Fetch the attachment URL from WP media API
				const media = await apiFetch<{
					source_url: string;
					media_details?: { sizes?: Record<string, { source_url: string }> };
				}>({
					path: `/wp/v2/media/${attachmentId}?context=edit`,
					signal: controller.signal,
				});

				if (controller.signal.aborted) return;

				if (media) {
					setResolved({ url: media.source_url });
				}
			} catch (err: unknown) {
				if (err instanceof Error && err.name !== 'AbortError') {
					setResolved({ url: null });
				}
			}
		})();

		return () => {
			controller.abort();
		};
	}, [dynamicValue, options.templateContext, options.templatePostType]);

	return resolved;
}
