/**
 * useTagAutocomplete Hook
 *
 * Reusable hook for @-triggered dynamic tag autocomplete in text inputs.
 * Extracted from CodeEditor.tsx to be shared by both CodeEditor and
 * ElementVisibilityModal's VoxelScriptInput.
 *
 * Shows the nvx-quick-tags dropdown when user types '@', with keyboard
 * navigation (ArrowUp/Down/Enter/Escape) and click-outside dismissal.
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import apiFetch from '@wordpress/api-fetch';

export interface TagSuggestion {
	group: string;
	key: string;
	label: string;
	fullPath: string;
	breadcrumb?: string;
}

interface UseTagAutocompleteReturn {
	showAutocomplete: boolean;
	suggestions: TagSuggestion[];
	selectedIndex: number;
	autocompletePosition: { top: number; left: number };
	autocompleteRef: RefObject<HTMLDivElement | null>;
	setSelectedIndex: (i: number) => void;
	handleInputChange: (newValue: string) => Promise<void>;
	handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	handleSelectSuggestion: (suggestion: TagSuggestion) => void;
}

/**
 * Calculate cursor position in pixels for autocomplete dropdown placement.
 * Uses mirror div technique with exact textarea styling.
 * Extracted from CodeEditor.tsx getCursorCoordinates().
 */
function getCursorCoordinates(
	textarea: HTMLTextAreaElement,
	position: number,
	containerSelector: string,
): { top: number; left: number } {
	const container = textarea.closest(containerSelector) as HTMLElement;
	if (!container) {
		return { top: 0, left: 0 };
	}

	const containerRect = container.getBoundingClientRect();

	const mirror = document.createElement('div');
	const computedStyle = window.getComputedStyle(textarea);

	(
		[
			'fontFamily',
			'fontSize',
			'fontWeight',
			'fontStyle',
			'letterSpacing',
			'textTransform',
			'wordSpacing',
			'textIndent',
			'textAlign',
			'lineHeight',
			'whiteSpace',
			'wordWrap',
			'wordBreak',
			'overflowWrap',
			'padding',
			'border',
			'boxSizing',
			'tabSize',
		] as const
	).forEach((prop) => {
		(mirror.style as unknown as Record<string, string>)[prop] = computedStyle.getPropertyValue(
			prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
		);
	});

	mirror.style.position = 'absolute';
	mirror.style.visibility = 'hidden';
	mirror.style.width = `${textarea.clientWidth}px`;
	mirror.style.height = 'auto';
	mirror.style.top = '0';
	mirror.style.left = '0';
	mirror.style.overflow = 'hidden';
	mirror.style.pointerEvents = 'none';

	const textBeforeCursor = textarea.value.substring(0, position);
	const textNode = document.createTextNode(textBeforeCursor);
	mirror.appendChild(textNode);

	const marker = document.createElement('span');
	marker.textContent = '|';
	marker.style.position = 'relative';
	mirror.appendChild(marker);

	container.appendChild(mirror);

	const markerRect = marker.getBoundingClientRect();

	container.removeChild(mirror);

	const top = markerRect.top - containerRect.top + markerRect.height + 4;
	const left = markerRect.left - containerRect.left;

	return { top, left };
}

export function useTagAutocomplete(
	textareaRef: RefObject<HTMLTextAreaElement | null>,
	value: string,
	onChange: (val: string) => void,
	containerSelector = '.dtags-content',
): UseTagAutocompleteReturn {
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
	const [autocompleteCursorPos, setAutocompleteCursorPos] = useState(0);
	const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [tagCache, setTagCache] = useState<TagSuggestion[] | null>(null);
	const [isLoadingTags, setIsLoadingTags] = useState(false);
	const autocompleteRef = useRef<HTMLDivElement>(null);

	// Reposition autocomplete after DOM updates
	useEffect(() => {
		if (showAutocomplete && textareaRef.current) {
			setTimeout(() => {
				if (textareaRef.current) {
					const coords = getCursorCoordinates(
						textareaRef.current,
						autocompleteCursorPos,
						containerSelector,
					);
					setAutocompletePosition(coords);
				}
			}, 0);
		}
	}, [showAutocomplete, value, autocompleteCursorPos, containerSelector, textareaRef]);

	// Close autocomplete when clicking outside
	useEffect(() => {
		if (!showAutocomplete) return;

		const handleOutsideClick = (e: MouseEvent) => {
			if (!(e.target as HTMLElement).closest('.dtags-ac')) {
				setShowAutocomplete(false);
			}
		};

		const timeoutId = setTimeout(() => {
			document.addEventListener('click', handleOutsideClick);
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('click', handleOutsideClick);
		};
	}, [showAutocomplete]);

	/**
	 * Fetch all tags for autocomplete (instant from global store, fallback to API).
	 * Lazy: only fetches when @ is first pressed, then caches.
	 */
	const fetchAllTags = useCallback(async (): Promise<TagSuggestion[]> => {
		if (tagCache) return tagCache;

		const globalStore = (window as unknown as Record<string, unknown>)['VoxelFSE_Dynamic_Data_Store'] as
			| { flatTags?: Array<{ group: string; key: string; label: string; fullPath?: string; breadcrumb?: string }> }
			| undefined;

		if (globalStore?.flatTags && Array.isArray(globalStore.flatTags)) {
			const tags: TagSuggestion[] = globalStore.flatTags.map((item) => ({
				group: item.group,
				key: item.key,
				label: item.label,
				fullPath: item.fullPath || `@${item.group}(${item.key})`,
				breadcrumb: item.breadcrumb || item.group,
			}));
			setTagCache(tags);
			return tags;
		}

		if (isLoadingTags) {
			return new Promise((resolve) => {
				const checkCache = setInterval(() => {
					if (tagCache) {
						clearInterval(checkCache);
						resolve(tagCache);
					}
				}, 100);
			});
		}

		setIsLoadingTags(true);

		try {
			const response = (await apiFetch({
				path: '/voxel-fse/v1/dynamic-data/tags-flat?context=post',
			})) as Array<{ group: string; key: string; label: string; fullPath?: string; breadcrumb?: string }>;

			const tags: TagSuggestion[] = Array.isArray(response)
				? response.map((item) => ({
						group: item.group,
						key: item.key,
						label: item.label,
						fullPath: item.fullPath || `@${item.group}(${item.key})`,
						breadcrumb: item.breadcrumb || item.group,
					}))
				: [];

			setTagCache(tags);
			setIsLoadingTags(false);
			return tags;
		} catch {
			setIsLoadingTags(false);
			setTagCache([]);
			return [];
		}
	}, [tagCache, isLoadingTags]);

	/**
	 * Show tag autocomplete dropdown, filtered by query after @.
	 */
	const showTagAutocomplete = useCallback(
		async (currentValue: string) => {
			if (!textareaRef.current) return;

			const cursorPos = textareaRef.current.selectionStart;
			const textBefore = currentValue.substring(0, cursorPos);

			const atMatch = textBefore.match(/@(\w*)$/);
			if (!atMatch) return;

			const query = atMatch[1] || '';
			const allTags = await fetchAllTags();

			const filtered = query
				? allTags.filter(
						(tag) =>
							tag.label.toLowerCase().includes(query.toLowerCase()) ||
							tag.group.toLowerCase().includes(query.toLowerCase()) ||
							(tag.breadcrumb?.toLowerCase().includes(query.toLowerCase()) ?? false),
					)
				: allTags;

			setSuggestions(filtered);
			setSelectedIndex(0);
			setShowAutocomplete(filtered.length > 0);
			setAutocompleteCursorPos(cursorPos);
		},
		[textareaRef, fetchAllTags],
	);

	/**
	 * Update autocomplete filter as user types after @.
	 */
	const updateAutocompleteFilter = useCallback(
		(text: string, cursorPos: number) => {
			const textBefore = text.substring(0, cursorPos);
			const atMatch = textBefore.match(/@(\w*)$/);

			if (!atMatch) {
				setShowAutocomplete(false);
				return;
			}

			const query = atMatch[1] || '';

			if (tagCache && Array.isArray(tagCache)) {
				const filtered = query
					? tagCache.filter(
							(tag) =>
								tag.label.toLowerCase().includes(query.toLowerCase()) ||
								tag.group.toLowerCase().includes(query.toLowerCase()) ||
								(tag.breadcrumb?.toLowerCase().includes(query.toLowerCase()) ?? false),
						)
					: tagCache.slice(0, 50);

				setSuggestions(filtered);
				setSelectedIndex(0);
			}
		},
		[tagCache],
	);

	/**
	 * Handle selection from autocomplete dropdown.
	 */
	const handleSelectSuggestion = useCallback(
		(suggestion: TagSuggestion) => {
			if (!textareaRef.current) return;

			const cursorPos = textareaRef.current.selectionStart;
			const textBefore = value.substring(0, cursorPos);
			const textAfter = value.substring(cursorPos);

			const atMatch = textBefore.match(/@(\w*)$/);
			if (atMatch) {
				const atPos = textBefore.lastIndexOf('@');
				const newText = value.substring(0, atPos) + suggestion.fullPath + textAfter;
				onChange(newText);

				setTimeout(() => {
					if (textareaRef.current) {
						const newCursorPos = atPos + suggestion.fullPath.length;
						textareaRef.current.selectionStart = newCursorPos;
						textareaRef.current.selectionEnd = newCursorPos;
						textareaRef.current.focus();
					}
				}, 0);
			}

			setShowAutocomplete(false);
		},
		[textareaRef, value, onChange],
	);

	/**
	 * Handle keyboard input for autocomplete navigation.
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (!showAutocomplete) return;

			const { key } = e;

			if (key === 'ArrowDown') {
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
			} else if (key === 'ArrowUp') {
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
			} else if (key === 'Enter' || key === 'Tab') {
				e.preventDefault();
				if (suggestions[selectedIndex]) {
					handleSelectSuggestion(suggestions[selectedIndex]);
				}
			} else if (key === 'Escape') {
				e.preventDefault();
				setShowAutocomplete(false);
			}
		},
		[showAutocomplete, suggestions, selectedIndex, handleSelectSuggestion],
	);

	/**
	 * Handle input changes — detects @ trigger and updates filter.
	 */
	const handleInputChange = useCallback(
		async (newValue: string) => {
			onChange(newValue);

			if (!textareaRef.current) return;

			const cursorPos = textareaRef.current.selectionStart;
			const textBefore = newValue.substring(0, cursorPos);

			if (textBefore.match(/@(\w*)$/)) {
				await showTagAutocomplete(newValue);
				return;
			}

			if (showAutocomplete) {
				updateAutocompleteFilter(newValue, cursorPos);
			}
		},
		[onChange, textareaRef, showTagAutocomplete, showAutocomplete, updateAutocompleteFilter],
	);

	return {
		showAutocomplete,
		suggestions,
		selectedIndex,
		autocompletePosition,
		autocompleteRef,
		setSelectedIndex,
		handleInputChange,
		handleKeyDown,
		handleSelectSuggestion,
	};
}
