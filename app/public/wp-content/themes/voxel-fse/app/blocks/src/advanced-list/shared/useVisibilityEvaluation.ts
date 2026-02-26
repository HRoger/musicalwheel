/**
 * Hook to evaluate visibility rules for advanced-list repeater items.
 *
 * Calls the REST endpoint POST /voxel-fse/v1/advanced-list/evaluate-visibility
 * which uses Visibility_Evaluator::evaluate() server-side with skip_edit_check=true
 * so rules are actually evaluated even in the editor context.
 *
 * Returns a map of item_id → shouldRender boolean.
 *
 * @package VoxelFSE
 */

import { useEffect, useState, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { ActionItem } from '../types';

interface VisibilityItem {
	id: string;
	visibilityRules: ActionItem['visibilityRules'];
	rowVisibility: string;
}

/**
 * Evaluate visibility rules for a list of action items.
 *
 * Only items with visibility rules are sent to the server.
 * Items without rules default to visible.
 *
 * @param items - The action items with their visibility rules
 * @param postType - The post type context for dtag rule resolution
 * @returns Record of item_id → shouldRender boolean
 */
export function useVisibilityEvaluation(
	items: ActionItem[],
	postType: string,
): Record<string, boolean> {
	const [results, setResults] = useState<Record<string, boolean>>({});
	const abortRef = useRef<AbortController | null>(null);

	// Only include items that have visibility rules
	const itemsWithRules: VisibilityItem[] = items
		.filter((item) => item.visibilityRules && item.visibilityRules.length > 0)
		.map((item) => ({
			id: item.id,
			visibilityRules: item.visibilityRules,
			rowVisibility: item.rowVisibility || 'show',
		}));

	// Serialize for dependency tracking
	const serialized = JSON.stringify(itemsWithRules);

	useEffect(() => {
		if (itemsWithRules.length === 0) {
			setResults({});
			return;
		}

		// Abort previous in-flight request
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		apiFetch<{ success: boolean; results: Record<string, boolean> }>({
			path: '/voxel-fse/v1/advanced-list/evaluate-visibility',
			method: 'POST',
			data: {
				items: itemsWithRules,
				post_type: postType,
			},
			signal: controller.signal,
		})
			.then((res) => {
				if (res.success && res.results) {
					setResults(res.results);
				}
			})
			.catch((err: Error) => {
				if (err.name !== 'AbortError') {
					// On error, default to showing all items
					setResults({});
				}
			});

		return () => {
			controller.abort();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serialized, postType]);

	return results;
}
