/**
 * useExpandedLoopItems Hook
 *
 * Calls the REST endpoint to expand per-item loop configurations in the editor.
 * Mirrors the PHP-side expand_item_loops() in Block_Loader.php, but for editor preview.
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { useState, useEffect, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';

interface UseExpandedLoopItemsOptions {
	items: any[];
	postId?: number;
}

interface UseExpandedLoopItemsResult {
	items: any[];
	isExpanded: boolean;
	isLoading: boolean;
	hasLoops: boolean;
}

/**
 * Check if an item has loop configuration (any of the 3 formats)
 */
function itemHasLoop(item: any): boolean {
	if (!item || typeof item !== 'object') return false;
	// Flat format (userbar, navbar, advanced-list) — requires both source AND property
	if (item.loopSource && item.loopProperty) return true;
	// Nested loop format (nested-accordion) — source is already a full tag
	if (item.loop?.source) return true;
	// Nested loopConfig format (nested-tabs) — requires both source AND property
	if (item.loopConfig?.loopSource && item.loopConfig?.loopProperty) return true;
	return false;
}

export function useExpandedLoopItems({
	items,
	postId,
}: UseExpandedLoopItemsOptions): UseExpandedLoopItemsResult {
	const [expandedItems, setExpandedItems] = useState<any[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	// Check if any item has loop config
	const hasLoops = Array.isArray(items) && items.some(itemHasLoop);

	// Serialize items for dependency tracking
	const itemsKey = JSON.stringify(items);

	useEffect(() => {
		if (!hasLoops || !Array.isArray(items) || items.length === 0) {
			setExpandedItems(null);
			return;
		}

		// Abort previous request
		if (abortRef.current) {
			abortRef.current.abort();
		}

		let cancelled = false;

		// Debounce 300ms to avoid API spam during typing
		const timer = setTimeout(async () => {
			const controller = new AbortController();
			abortRef.current = controller;
			setIsLoading(true);

			try {
				const response: any = await apiFetch({
					path: '/voxel-fse/v1/loop/expand-items',
					method: 'POST',
					data: { items, postId },
					signal: controller.signal,
				});

				if (!cancelled && response?.items) {
					setExpandedItems(response.items);
				}
			} catch (err: any) {
				if (err?.name !== 'AbortError' && !cancelled) {
					console.error('[useExpandedLoopItems] Expansion failed:', err);
					setExpandedItems(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}, 300);

		return () => {
			cancelled = true;
			clearTimeout(timer);
			if (abortRef.current) {
				abortRef.current.abort();
			}
		};
	}, [itemsKey, postId, hasLoops]);

	return {
		items: expandedItems ?? items,
		isExpanded: expandedItems !== null,
		isLoading,
		hasLoops,
	};
}
