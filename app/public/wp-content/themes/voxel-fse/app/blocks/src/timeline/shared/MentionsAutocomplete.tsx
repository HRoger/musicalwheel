/**
 * MentionsAutocomplete Component
 *
 * Dropdown autocomplete for @mentions in timeline composer.
 * Searches users and posts via API.
 *
 * VOXEL PARITY: Global mentions cache (window._vx_mentions_cache)
 * Voxel caches mention search results globally to avoid redundant API calls.
 * When a search is performed, results are stored in window._vx_mentions_cache[query].
 * Before making an API call, we check if results exist in the cache.
 * See: timeline-composer.beautified.js lines 77-92, 107-109
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { searchMentions } from '../api';
import type { MentionResult } from '../api';
import { getInitials, stringToColor } from '../utils';

// Declare global mentions cache type
declare global {
	interface Window {
		_vx_mentions_cache?: Record<string, MentionResult[]>;
	}
}

/**
 * Initialize global mentions cache if not exists
 * This matches Voxel's initialization in timeline-main.beautified.js line 1367
 */
function initMentionsCache(): Record<string, MentionResult[]> {
	if (typeof window._vx_mentions_cache !== 'object') {
		window._vx_mentions_cache = {};
	}
	return window._vx_mentions_cache;
}

/**
 * Props
 */
interface MentionsAutocompleteProps {
	query: string;
	isActive: boolean;
	onSelect: (mention: MentionResult) => void;
	onClose: () => void;
	position?: { top: number; left: number };
	className?: string;
}

/**
 * MentionsAutocomplete Component
 */
export function MentionsAutocomplete({
	query,
	isActive,
	onSelect,
	onClose,
	position,
	className = '',
}: MentionsAutocompleteProps): JSX.Element | null {
	const [results, setResults] = useState<MentionResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Debounced search with global cache (matches Voxel's behavior)
	// See: timeline-composer.beautified.js lines 77-92, 107-109
	useEffect(() => {
		if (!isActive || !query || query.length < 1) {
			setResults([]);
			return;
		}

		// Cancel previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Initialize global cache
		const cache = initMentionsCache();

		// Check cache first (matches Voxel's check at line 107)
		if (Array.isArray(cache[query])) {
			setResults(cache[query]);
			setSelectedIndex(0);
			setIsLoading(false);
			return;
		}

		// Debounce API call (200ms like Voxel's debounce at line 78)
		const timeoutId = setTimeout(async () => {
			setIsLoading(true);
			setError(null);

			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				const response = await searchMentions(query, controller.signal);
				const searchResults = response.results || [];

				// Cache the results (matches Voxel's caching at line 90)
				cache[query] = searchResults;

				setResults(searchResults);
				setSelectedIndex(0);
			} catch (err) {
				if (err instanceof Error && err.name !== 'AbortError') {
					setError('Failed to search');
					setResults([]);
				}
			} finally {
				setIsLoading(false);
			}
		}, 200);

		return () => {
			clearTimeout(timeoutId);
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [query, isActive]);

	// Handle keyboard navigation
	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex((prev) =>
						prev < results.length - 1 ? prev + 1 : 0
					);
					break;

				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex((prev) =>
						prev > 0 ? prev - 1 : results.length - 1
					);
					break;

				case 'Enter':
					e.preventDefault();
					if (results[selectedIndex]) {
						onSelect(results[selectedIndex]);
					}
					break;

				case 'Escape':
					e.preventDefault();
					onClose();
					break;

				case 'Tab':
					e.preventDefault();
					if (results[selectedIndex]) {
						onSelect(results[selectedIndex]);
					}
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isActive, results, selectedIndex, onSelect, onClose]);

	// Close on click outside
	useEffect(() => {
		if (!isActive) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isActive, onClose]);

	// Scroll selected item into view
	useEffect(() => {
		if (!containerRef.current) return;

		const selectedElement = containerRef.current.querySelector(
			'.vxf-mention-item--selected'
		);
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: 'nearest' });
		}
	}, [selectedIndex]);

	// Handle selection
	const handleSelect = useCallback(
		(mention: MentionResult) => {
			onSelect(mention);
		},
		[onSelect]
	);

	// Don't render if not active
	if (!isActive) return null;

	// Position styles
	const positionStyles = position
		? {
				position: 'absolute' as const,
				top: position.top,
				left: position.left,
			}
		: {};

	return (
		<div
			ref={containerRef}
			className={`vxf-mentions-autocomplete ${className}`}
			style={positionStyles}
			role="listbox"
			aria-label="Mention suggestions"
		>
			{/* Loading state - matches Voxel standard */}
			{isLoading && (
				<div className="ts-no-posts">
					<span className="ts-loader" />
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className="vxf-mentions-autocomplete-error">
					{error}
				</div>
			)}

			{/* Results */}
			{!isLoading && !error && results.length > 0 && (
				<ul className="vxf-mentions-autocomplete-list">
					{results.map((result, index) => (
						<li
							key={`${result.type}-${result.id}`}
							className={`vxf-mention-item ${index === selectedIndex ? 'vxf-mention-item--selected' : ''}`}
							role="option"
							aria-selected={index === selectedIndex}
							onClick={() => handleSelect(result)}
							onMouseEnter={() => setSelectedIndex(index)}
						>
							<div className="vxf-mention-item-avatar">
								{result.avatar_url ? (
									<img src={result.avatar_url} alt="" />
								) : (
									<span
										className="vxf-mention-item-avatar-placeholder"
										style={{ backgroundColor: stringToColor(result.name) }}
									>
										{getInitials(result.name)}
									</span>
								)}
							</div>
							<div className="vxf-mention-item-info">
								<span className="vxf-mention-item-name">
									{result.name}
								</span>
								<span className="vxf-mention-item-type">
									{result.type === 'user' ? 'User' : 'Post'}
								</span>
							</div>
						</li>
					))}
				</ul>
			)}

			{/* No results */}
			{!isLoading && !error && query.length > 0 && results.length === 0 && (
				<div className="vxf-mentions-autocomplete-empty">
					No matches found for "@{query}"
				</div>
			)}
		</div>
	);
}

export default MentionsAutocomplete;
