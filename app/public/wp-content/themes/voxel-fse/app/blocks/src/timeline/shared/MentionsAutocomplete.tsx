/**
 * MentionsAutocomplete Component
 *
 * Dropdown autocomplete for @mentions in timeline composer.
 * Matches Voxel's mention dropdown HTML structure EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from status-composer.php lines 100-113):
 * <div class="vxfeed__mentions" :style="mentions.style">
 *   <ul class="simplify-ul">
 *     <li v-for="mention in mentions.list">
 *       <a href="#" :class="{'is-active': focused}">
 *         <strong>display_name</strong>
 *         <span>@username</span>
 *       </a>
 *     </li>
 *   </ul>
 * </div>
 *
 * VOXEL PARITY: Global mentions cache (window._vx_mentions_cache)
 * See: timeline-composer.beautified.js lines 77-92, 107-109
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { searchMentions } from '../api';
import type { MentionResult } from '../api';

// Declare global mentions cache type
declare global {
	interface Window {
		_vx_mentions_cache?: Record<string, MentionResult[]>;
	}
}

/**
 * Initialize global mentions cache if not exists
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
	style?: React.CSSProperties;
}

/**
 * MentionsAutocomplete Component
 * Matches Voxel's vxfeed__mentions structure (teleported to body)
 */
export function MentionsAutocomplete({
	query,
	isActive,
	onSelect,
	onClose,
	style,
}: MentionsAutocompleteProps): JSX.Element | null {
	const [results, setResults] = useState<MentionResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Debounced search with global cache
	useEffect(() => {
		if (!isActive || !query || query.length < 1) {
			setResults([]);
			return;
		}

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const cache = initMentionsCache();

		// Check cache first
		if (Array.isArray(cache[query])) {
			setResults(cache[query]);
			setSelectedIndex(0);
			setIsLoading(false);
			return;
		}

		// Debounce API call (200ms like Voxel)
		const timeoutId = setTimeout(async () => {
			setIsLoading(true);

			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				const response = await searchMentions(query, controller.signal);
				const searchResults = response.results || [];
				cache[query] = searchResults;
				setResults(searchResults);
				setSelectedIndex(0);
			} catch (err) {
				if (err instanceof Error && err.name !== 'AbortError') {
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

	// Handle selection
	const handleSelect = useCallback(
		(mention: MentionResult) => {
			onSelect(mention);
		},
		[onSelect]
	);

	// Don't render if not active or no results
	if (!isActive || (!isLoading && results.length === 0)) return null;

	// Render with portal to body (matches Voxel's teleport to body)
	const dropdown = (
		<div
			ref={containerRef}
			className="vxfeed__mentions"
			style={style}
		>
			{!isLoading && results.length > 0 && (
				<ul className="simplify-ul">
					{results.map((result, index) => (
						<li key={`${result.type}-${result.id}`}>
							<a
								href="#"
								className={index === selectedIndex ? 'is-active' : ''}
								onClick={(e) => { e.preventDefault(); handleSelect(result); }}
								onMouseEnter={() => setSelectedIndex(index)}
							>
								<strong>{result.name}</strong>
								<span>@{result.username ?? result.name}</span>
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);

	return createPortal(dropdown, document.body);
}

export default MentionsAutocomplete;
