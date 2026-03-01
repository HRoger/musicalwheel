/**
 * Hook to fetch post context for editor preview.
 *
 * Mirrors Voxel's get_post_for_preview(): resolves the first published post
 * of the template's post type and fetches its context (permissions, status,
 * product data, etc.) so the editor can show/hide action buttons with the
 * same logic as the frontend.
 *
 * @package VoxelFSE
 */

import { useEffect, useState, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { PostContext } from '../types';

/**
 * Fetch post context for editor preview using the template's post type.
 *
 * @param postType - The Voxel post type key (e.g. 'place', 'event')
 * @returns PostContext or null if not available
 */
export function useEditorPostContext(
	postType: string | undefined,
): PostContext | null {
	const [context, setContext] = useState<PostContext | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (!postType) {
			setContext(null);
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		apiFetch<PostContext>({
			path: `/voxel-fse/v1/advanced-list/post-context?post_type=${encodeURIComponent(postType)}`,
			signal: controller.signal,
		})
			.then((res) => {
				setContext(res);
			})
			.catch((err: Error) => {
				if (err.name !== 'AbortError') {
					setContext(null);
				}
			});

		return () => {
			controller.abort();
		};
	}, [postType]);

	return context;
}
