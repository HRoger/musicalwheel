/**
 * CodeEditor Component
 *
 * Text area for editing dynamic tag expressions with syntax highlighting and autocomplete.
 *
 * @package MusicalWheel
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';

interface TagSuggestion {
	group: string;
	key: string;
	label: string;
	fullPath: string;
	breadcrumb?: string;
}

interface ModifierSuggestion {
	key: string;
	label: string;
	category: string;
	code: string;
	fullSignature?: string;  // Full signature with argument labels for display
	description?: string;
}

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	onTokenFocus?: (tokenIndex: number) => void;
	onInsertTag?: (insertFn: (tag: string) => void) => void;
	context?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, onTokenFocus, onInsertTag, context = 'post' }) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const autocompleteRef = useRef<HTMLDivElement>(null);
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
	const [autocompleteCursorPos, setAutocompleteCursorPos] = useState(0);
	const [suggestions, setSuggestions] = useState<(TagSuggestion | ModifierSuggestion)[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [autocompleteType, setAutocompleteType] = useState<'tag' | 'modifier'>('tag');
	const [tagCache, setTagCache] = useState<TagSuggestion[] | null>(null);
	const [modifierCache, setModifierCache] = useState<any>(null);
	const [isLoadingTags, setIsLoadingTags] = useState(false);

	// NO PRELOADING on mount - tags loaded LAZILY when @ is first pressed
	// This avoids 5-10s delay on modal open while still providing full autocomplete

	/**
	 * Insert tag at cursor position (called from tree selection)
	 * Evidence: Voxel inserts at cursor, not at end
	 */
	const insertTagAtCursor = useCallback((tag: string) => {
		if (!textareaRef.current) {
			return;
		}

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = value.substring(0, cursorPos);
		const textAfter = value.substring(cursorPos);

		// Insert tag at cursor position
		const newText = textBefore + tag + textAfter;
		onChange(newText);

		// Move cursor to after the inserted tag
		setTimeout(() => {
			if (textareaRef.current) {
				const newCursorPos = cursorPos + tag.length;
				textareaRef.current.selectionStart = newCursorPos;
				textareaRef.current.selectionEnd = newCursorPos;
				textareaRef.current.focus();
			}
		}, 0);
	}, [value, onChange]);

	// Expose insertTagAtCursor to parent component
	useEffect(() => {
		if (onInsertTag) {
			onInsertTag(insertTagAtCursor);
		}
	}, [onInsertTag, insertTagAtCursor]);

	// Reposition autocomplete after DOM updates
	useEffect(() => {
		if (showAutocomplete && textareaRef.current) {
			// Use setTimeout to ensure React has rendered the updated highlighter
			setTimeout(() => {
				if (textareaRef.current) {
					const coords = getCursorCoordinates(textareaRef.current, autocompleteCursorPos);
					//console.log('[CodeEditor] Repositioning autocomplete at:', coords);
					setAutocompletePosition(coords);
				}
			}, 0);
		}
	}, [showAutocomplete, value, autocompleteCursorPos]);

	/**
	 * Fetch all tags for autocomplete (instant from global store, fallback to API)
	 * Returns all 400+ tags with breadcrumbs (like Voxel's autocomplete)
	 *
	 * Performance: <100ms from global store vs 5-10s from API
	 */
	const fetchAllTagsForAutocomplete = async (): Promise<TagSuggestion[]> => {
		// Return cached data if already loaded
		if (tagCache) {
			//console.log('[CodeEditor] Using cached tags:', tagCache.length);
			return tagCache;
		}

		// Check global store first (Voxel pattern for instant loading)
		const globalStore = (window as any).VoxelFSE_Dynamic_Data_Store;
		if (globalStore && globalStore.flatTags && Array.isArray(globalStore.flatTags)) {
			//console.log('[CodeEditor] Loading tags from global store (instant!):', globalStore.flatTags.length);

			const tags: TagSuggestion[] = globalStore.flatTags.map((item: any) => ({
				group: item.group,
				key: item.key,
				label: item.label,
				fullPath: item.fullPath || `@${item.group}(${item.key})`,
				breadcrumb: item.breadcrumb || item.group
			}));

			setTagCache(tags);
			return tags;
		}

		// Fallback: Fetch from API if global store not available
		// Avoid duplicate API calls if already loading
		if (isLoadingTags) {
			//console.log('[CodeEditor] Already loading tags, waiting...');
			// Wait for cache to be populated
			return new Promise((resolve) => {
				const checkCache = setInterval(() => {
					if (tagCache) {
						clearInterval(checkCache);
						resolve(tagCache);
					}
				}, 100);
			});
		}

		//console.log('[CodeEditor] Global store not available, fetching tags from API...');
		setIsLoadingTags(true);

		try {
			const response = await apiFetch({
				path: `/voxel-fse/v1/dynamic-data/tags-flat?context=${context}`,
			}) as any;

			const tags: TagSuggestion[] = Array.isArray(response)
				? response.map((item: any) => ({
					group: item.group,
					key: item.key,
					label: item.label,
					fullPath: item.fullPath || `@${item.group}(${item.key})`,
					breadcrumb: item.breadcrumb || item.group
				}))
				: [];

			//console.log('[CodeEditor] Loaded', tags.length, 'tags from API');
			setTagCache(tags);
			setIsLoadingTags(false);
			return tags;
		} catch (err) {
			console.error('[CodeEditor] Failed to fetch tags:', err);
			setIsLoadingTags(false);
			// Return empty array on error
			setTagCache([]);
			return [];
		}
	};

	/**
	 * Fetch all modifiers for autocomplete
	 * Evidence: Load from global store for instant performance (Voxel pattern)
	 */
	const fetchAllModifiersForAutocomplete = async () => {
		// Return cached data if already loaded
		if (modifierCache) {
			//console.log('[CodeEditor] Using cached modifiers:', modifierCache.length);
			return modifierCache;
		}

		// Check global store first (Voxel pattern for instant loading)
		const globalStore = (window as any).VoxelFSE_Dynamic_Data_Store;
		if (globalStore && globalStore.modifiers && Array.isArray(globalStore.modifiers)) {
			//console.log('[CodeEditor] Loading modifiers from global store (instant!):', globalStore.modifiers.length);
			setModifierCache(globalStore.modifiers);
			return globalStore.modifiers;
		}

		// Fallback to API if global store not available
		//console.log('[CodeEditor] Global store not available, fetching modifiers from API...');
		try {
			const modifiers = await apiFetch({
				path: '/voxel-fse/v1/dynamic-data/modifiers',
			}) as any[];
			setModifierCache(modifiers);
			return modifiers;
		} catch (err) {
			console.error('Failed to fetch modifiers for autocomplete:', err);
			return [];
		}
	};

	/**
	 * Calculate cursor position in pixels for autocomplete dropdown placement
	 * Uses mirror div technique with exact textarea styling
	 */
	const getCursorCoordinates = (textarea: HTMLTextAreaElement, position: number): { top: number; left: number } => {
		const container = textarea.closest('.dtags-content') as HTMLElement;
		if (!container) {
			console.log('[getCursorCoordinates] No container found');
			return { top: 0, left: 0 };
		}

		const containerRect = container.getBoundingClientRect();

		// Create mirror div
		const mirror = document.createElement('div');
		const computedStyle = window.getComputedStyle(textarea);

		// Copy all relevant styles exactly
		[
			'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
			'letterSpacing', 'textTransform',
			'wordSpacing', 'textIndent', 'textAlign',
			'lineHeight', 'whiteSpace', 'wordWrap', 'wordBreak',
			'overflowWrap', 'padding', 'border', 'boxSizing', 'tabSize'
		].forEach(prop => {
			(mirror.style as any)[prop] = (computedStyle as any)[prop];
		});

		// Position mirror at same location as textarea
		mirror.style.position = 'absolute';
		mirror.style.visibility = 'hidden';
		mirror.style.width = `${textarea.clientWidth}px`;
		mirror.style.height = 'auto';
		mirror.style.top = '0';
		mirror.style.left = '0';
		mirror.style.overflow = 'hidden';
		mirror.style.pointerEvents = 'none';

		// Get text up to cursor and add marker
		const textBeforeCursor = textarea.value.substring(0, position);
		const textNode = document.createTextNode(textBeforeCursor);
		mirror.appendChild(textNode);

		// Create marker span at cursor position
		const marker = document.createElement('span');
		marker.textContent = '|';
		marker.style.position = 'relative';
		mirror.appendChild(marker);

		// Add mirror to container temporarily
		container.appendChild(mirror);

		// Get marker position in viewport
		const markerRect = marker.getBoundingClientRect();

		// Clean up
		container.removeChild(mirror);

		// Calculate position relative to container
		// Account for scroll position of textarea
		const top = markerRect.top - containerRect.top + markerRect.height + 4;
		const left = markerRect.left - containerRect.left;

		console.log('[getCursorCoordinates] Details:', {
			position,
			textBeforeCursor: textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 20)),
			containerRect: { top: containerRect.top, left: containerRect.left },
			markerRect: { top: markerRect.top, left: markerRect.left, height: markerRect.height },
			calculated: { top, left },
			textareaScroll: { top: textarea.scrollTop, left: textarea.scrollLeft }
		});

		return { top, left };
	};

	/**
	 * Handle keyboard input for autocomplete triggers
	 */
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const { key } = e;

		// Handle autocomplete navigation
		if (showAutocomplete) {
			if (key === 'ArrowDown') {
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
				return;
			}
			if (key === 'ArrowUp') {
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
				return;
			}
			if (key === 'Enter' || key === 'Tab') {
				e.preventDefault();
				if (suggestions[selectedIndex]) {
					handleSelectSuggestion(suggestions[selectedIndex]);
				}
				return;
			}
			if (key === 'Escape') {
				e.preventDefault();
				setShowAutocomplete(false);
				return;
			}
		}

		// Note: @ and . autocomplete triggering moved to handleInputChange
		// because we need the updated value, not the old value before keypress
	};

	/**
	 * Handle input changes to update autocomplete filtering
	 */
	const handleInputChange = async (newValue: string) => {
		onChange(newValue);

		if (!textareaRef.current) return;

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = newValue.substring(0, cursorPos);

		// Check if user just typed @ (trigger tag autocomplete)
		if (textBefore.match(/@(\w*)$/)) {
			console.log('[CodeEditor] @ detected in onChange, triggering autocomplete');
			// Call directly instead of setTimeout to avoid race conditions
			await showTagAutocomplete(newValue);
			return;
		}

		// Check if user just typed . after a tag or modifier (trigger modifier autocomplete)
		// Evidence from Voxel: They check if dot is typed after a closing parenthesis
		// This works for: @group(prop). AND @group(prop).modifier().
		if (textBefore.endsWith('.') && textBefore.charAt(cursorPos - 2) === ')') {
			// Check if there's a tag before the dot (starts with @)
			if (textBefore.match(/@\w+\(/)) {
				console.log('[CodeEditor] . after ) detected, triggering modifier autocomplete');
				await checkForModifierAutocomplete(newValue);
				return;
			}
		}

		// Update autocomplete filtering if active
		if (showAutocomplete) {
			updateAutocompleteFilter(newValue, cursorPos);
		}
	};

	/**
	 * Show tag autocomplete dropdown
	 * LAZY: Fetches all tags from API on first @ press, then caches for subsequent uses
	 */
	const showTagAutocomplete = async (currentValue?: string) => {
		const textValue = currentValue !== undefined ? currentValue : value;
		console.log('[CodeEditor] showTagAutocomplete() called');

		if (!textareaRef.current) {
			console.log('[CodeEditor] No textarea ref, aborting');
			return;
		}

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = textValue.substring(0, cursorPos);

		// Find the @ symbol position
		const atMatch = textBefore.match(/@(\w*)$/);
		if (!atMatch) {
			console.log('[CodeEditor] No @ match found, aborting');
			return;
		}

		const query = atMatch[1] || '';
		console.log('[CodeEditor] @ match found, query:', query);

		// Fetch all tags (uses cache if already loaded)
		const allTags = await fetchAllTagsForAutocomplete();
		console.log('[CodeEditor] Total tags available:', allTags.length);

		// Filter based on query
		const filteredTags = query
			? allTags.filter(
					(tag) =>
						tag.label.toLowerCase().includes(query.toLowerCase()) ||
						tag.group.toLowerCase().includes(query.toLowerCase()) ||
						tag.breadcrumb?.toLowerCase().includes(query.toLowerCase())
			  )
			: allTags; // Show all tags (400+) if no query

		console.log('[CodeEditor] Filtered tags:', filteredTags.length);

		// Set suggestions
		setSuggestions(filteredTags);
		setSelectedIndex(0);
		setAutocompleteType('tag');
		setShowAutocomplete(filteredTags.length > 0);

		console.log('[CodeEditor] showAutocomplete set to:', filteredTags.length > 0);

		// Store cursor position for positioning (useEffect will calculate coords after DOM update)
		setAutocompleteCursorPos(cursorPos);
	};

	/**
	 * Check if we should show modifier autocomplete
	 */
	const checkForModifierAutocomplete = async (currentValue?: string) => {
		const textValue = currentValue !== undefined ? currentValue : value;
		if (!textareaRef.current) return;

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = textValue.substring(0, cursorPos);

		// Evidence from Voxel: They check if we're after a tag or modifier (ending with closing paren + dot)
		// This simplified check: find the last @ before cursor, then get text from there to cursor
		// This works for ANY number of chained modifiers: @group(p).mod1().mod2().mod3().
		const lastAtIndex = textBefore.lastIndexOf('@');
		if (lastAtIndex === -1) return;

		// Get everything from @ to cursor
		const tagText = textBefore.substring(lastAtIndex);

		// Check if it ends with ).XXX where XXX is the query
		const dotMatch = tagText.match(/\)\.(\w*)$/);
		if (!dotMatch) return;

		const query = dotMatch[1] || '';

		// Evidence from Voxel: Load modifiers from global store (instant) or API
		const modifiers = await fetchAllModifiersForAutocomplete();

		if (!modifiers || modifiers.length === 0) {
			console.log('[CodeEditor] No modifiers available');
			return;
		}

		// Extract tag group from text to determine which group methods to show
		// Pattern: @group(property).modifiers.
		// Note: lastAtIndex and tagText already declared above (lines 429, 433)
		const groupMatch = tagText.match(/@(\w+)\(/);
		const currentGroup = groupMatch ? groupMatch[1] : null;

		console.log('[CodeEditor] Current group for modifiers:', currentGroup);

		// Add group methods dynamically based on current tag (Voxel pattern)
		// Evidence: themes/voxel/app/dynamic-data/data-groups/*/methods()
		const getGroupMethods = (group: string | null): any[] => {
			if (!group) return [];

			const methods: Record<string, any[]> = {
				'post': [
					{ key: 'meta', label: 'Post meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
				],
				'author': [
					{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
				],
				'user': [
					{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
				],
				'site': [
					{ key: 'query_var', label: 'Query variable', category: 'other', args: [{ type: 'text', label: 'Variable name' }] },
					{ key: 'math', label: 'Math expression', category: 'other', args: [{ type: 'text', label: 'Math expression' }] }
				]
			};
			return methods[group] || [];
		};

		// Combine regular modifiers with group methods
		const allModifiers = [...modifiers, ...getGroupMethods(currentGroup)];

		// Convert modifiers to suggestions with full argument labels
		// Evidence from Voxel _mod-autocomplete.php:15
		// `.${modifier.key}(${modifier.arguments.map(arg => arg.label).join(', ')})`
		const modifierSuggestions: ModifierSuggestion[] = allModifiers.map((mod: any) => {
			// Build full signature with argument labels
			const argLabels = mod.args?.map((arg: any) => arg.label).join(', ') || '';
			const fullSignature = `.${mod.key}(${argLabels})`;

			return {
				key: mod.key,
				label: mod.label,
				category: mod.category || 'other',
				code: `.${mod.key}()`,  // Actual code to insert (empty args)
				fullSignature,  // Display signature with labels
				description: mod.description
			};
		});

		// Filter by query
		const filtered = query
			? modifierSuggestions.filter(mod =>
					mod.label.toLowerCase().includes(query.toLowerCase()) ||
					mod.key.toLowerCase().includes(query.toLowerCase())
			  )
			: modifierSuggestions;

		setSuggestions(filtered);
		setSelectedIndex(0);
		setAutocompleteType('modifier');
		setShowAutocomplete(true);

		// Store cursor position for positioning (useEffect will calculate coords after DOM update)
		setAutocompleteCursorPos(cursorPos);
	};

	/**
	 * Update autocomplete filter as user types
	 */
	const updateAutocompleteFilter = (text: string, cursorPos: number) => {
		const textBefore = text.substring(0, cursorPos);

		if (autocompleteType === 'tag') {
			const atMatch = textBefore.match(/@(\w*)$/);
			if (!atMatch) {
				setShowAutocomplete(false);
				return;
			}
			const query = atMatch[1] || '';

			// Re-filter suggestions
			if (tagCache && Array.isArray(tagCache)) {
				const flatTags: TagSuggestion[] = tagCache.map((item: any) => ({
					group: item.group,
					key: item.key,
					label: item.label,
					fullPath: item.fullPath || `@${item.group}(${item.key})`,
					breadcrumb: item.breadcrumb || item.group
				}));

				const filtered = query
					? flatTags.filter(tag =>
							tag.label.toLowerCase().includes(query.toLowerCase()) ||
							tag.group.toLowerCase().includes(query.toLowerCase()) ||
							tag.breadcrumb?.toLowerCase().includes(query.toLowerCase())
					  )
					: flatTags.slice(0, 50);

				setSuggestions(filtered);
				setSelectedIndex(0);
			}
		} else if (autocompleteType === 'modifier') {
			// Simplified pattern: find last @ and check if ends with ).query
			const lastAtIndex = textBefore.lastIndexOf('@');
			if (lastAtIndex === -1) {
				setShowAutocomplete(false);
				return;
			}

			const tagText = textBefore.substring(lastAtIndex);
			const dotMatch = tagText.match(/\)\.(\w*)$/);
			if (!dotMatch) {
				setShowAutocomplete(false);
				return;
			}

			const query = dotMatch[1] || '';

			// Re-filter modifiers with full signature
			if (modifierCache && Array.isArray(modifierCache)) {
				// Extract current tag group to add dynamic group methods
				const groupMatch = tagText.match(/@(\w+)\(/);
				const currentGroup = groupMatch ? groupMatch[1] : null;

				// Add group methods dynamically based on current tag (Voxel pattern)
				// Evidence: themes/voxel/app/dynamic-data/data-groups/*/methods()
				const getGroupMethods = (group: string | null): any[] => {
					if (!group) return [];

					const methods: Record<string, any[]> = {
						'post': [
							{ key: 'meta', label: 'Post meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
						],
						'author': [
							{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
						],
						'user': [
							{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key' }] }
						],
						'site': [
							{ key: 'query_var', label: 'Query variable', category: 'other', args: [{ type: 'text', label: 'Variable name' }] },
							{ key: 'math', label: 'Math expression', category: 'other', args: [{ type: 'text', label: 'Math expression' }] }
						]
					};
					return methods[group] || [];
				};

				// Combine regular modifiers with group methods
				const allModifiers = [...modifierCache, ...getGroupMethods(currentGroup)];

				const modifierSuggestions: ModifierSuggestion[] = allModifiers.map((mod: any) => {
					const argLabels = mod.args?.map((arg: any) => arg.label).join(', ') || '';
					const fullSignature = `.${mod.key}(${argLabels})`;

					return {
						key: mod.key,
						label: mod.label,
						category: mod.category || 'other',
						code: `.${mod.key}()`,
						fullSignature,
						description: mod.description
					};
				});

				const filtered = query
					? modifierSuggestions.filter(mod =>
							mod.label.toLowerCase().includes(query.toLowerCase()) ||
							mod.key.toLowerCase().includes(query.toLowerCase())
					  )
					: modifierSuggestions;

				setSuggestions(filtered);
				setSelectedIndex(0);
			}
		}
	};

	/**
	 * Handle selection from autocomplete
	 */
	const handleSelectSuggestion = (suggestion: TagSuggestion | ModifierSuggestion) => {
		console.log('[CodeEditor] handleSelectSuggestion called, type:', autocompleteType, 'suggestion:', suggestion);

		if (!textareaRef.current) {
			console.log('[CodeEditor] No textarea ref, aborting');
			return;
		}

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = value.substring(0, cursorPos);
		const textAfter = value.substring(cursorPos);

		console.log('[CodeEditor] Current value:', value);
		console.log('[CodeEditor] Text before cursor:', textBefore);
		console.log('[CodeEditor] Text after cursor:', textAfter);

		if (autocompleteType === 'tag') {
			const tagSuggestion = suggestion as TagSuggestion;
			console.log('[CodeEditor] Tag suggestion:', tagSuggestion);

			// Find the @ position and replace from there
			const atMatch = textBefore.match(/@(\w*)$/);
			if (atMatch) {
				const atPos = textBefore.lastIndexOf('@');
				const newText = value.substring(0, atPos) + tagSuggestion.fullPath + textAfter;
				console.log('[CodeEditor] New text:', newText);
				onChange(newText);

				// Move cursor to after the inserted tag
				setTimeout(() => {
					if (textareaRef.current) {
						const newCursorPos = atPos + tagSuggestion.fullPath.length;
						textareaRef.current.selectionStart = newCursorPos;
						textareaRef.current.selectionEnd = newCursorPos;
						textareaRef.current.focus();
					}
				}, 0);
			} else {
				console.log('[CodeEditor] No @ match found in textBefore');
			}
		} else if (autocompleteType === 'modifier') {
			const modSuggestion = suggestion as ModifierSuggestion;

			// Find the last dot position and replace from there
			// This works with any number of chained modifiers
			const dotPos = textBefore.lastIndexOf('.');
			const beforeDot = value.substring(0, dotPos);
			const newText = beforeDot + modSuggestion.code + textAfter;
			onChange(newText);

			// Move cursor to inside the parentheses if modifier has args
			setTimeout(() => {
				if (textareaRef.current && modSuggestion.code.includes('()')) {
					const newCursorPos = dotPos + modSuggestion.code.length - 1;
					textareaRef.current.selectionStart = newCursorPos;
					textareaRef.current.selectionEnd = newCursorPos;
					textareaRef.current.focus();
				}
			}, 0);
		}

		setShowAutocomplete(false);
	};

	/**
	 * Render syntax-highlighted version of the text (Voxel approach)
	 * Uses Voxel's class structure: hl-group, hl-group-mods, hl-group-props, hl-group-arg
	 */
	const renderHighlighted = (text: string): string => {
		// Split into lines for Voxel's line-based structure
		const lines = text.split('\n');

		// Ensure at least one line for proper rendering
		if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
			return '<span class="ts-line"><span class="ts-line-number">1</span></span>';
		}

		return lines.map((line, lineIndex) => {
			// Escape HTML characters in the line first
			const escapedLine = line
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');

			// Highlight all tags in this line
			const highlightedLine = escapedLine.replace(
				/@(\w+)\(([^)]*)\)((?:\.\w+(?:\([^)]*\))?)*)/g,
				(_match, group, property, modifiers) => {
					// Determine if this is method syntax (empty parens) or property syntax
					const isMethod = property === '';

					// Process modifiers to highlight arguments
					let highlightedModifiers = modifiers;
					if (modifiers) {
						// Replace modifier arguments: .modifier(arg) -> .modifier(<span class="hl-group-arg">arg</span>)
						highlightedModifiers = modifiers.replace(
							/\.(\w+)\(([^)]*)\)/g,
							(_modMatch: string, modName: string, args: string) => {
								if (args) {
									return `.${modName}(<span class="hl-group-arg">${args}</span>)`;
								}
								return `.${modName}()`;
							}
						);
					}

					if (isMethod) {
						// Method syntax: @site().method() -> entire thing is hl-group with nested hl-group-mods
						return `<span class="hl-group">@${group}()${highlightedModifiers ? `<span class="hl-group-mods">${highlightedModifiers}</span>` : ''}</span>`;
					} else {
						// Property syntax: @site(property) -> entire thing is hl-group with nested hl-group-props
						return `<span class="hl-group">@${group}(<span class="hl-group-props">${property}</span>)${highlightedModifiers ? `<span class="hl-group-mods">${highlightedModifiers}</span>` : ''}</span>`;
					}
				}
			);

			// CRITICAL: No space after line number - must match textarea exactly for cursor alignment
			return `<span class="ts-line"><span class="ts-line-number">${lineIndex + 1}</span>${highlightedLine}</span>`;
		}).join('\n');
	};

	// Synchronize scroll between pre and textarea
	const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
		const textarea = e.currentTarget;
		const pre = textarea.parentElement?.querySelector('pre');
		if (pre) {
			pre.scrollTop = textarea.scrollTop;
			pre.scrollLeft = textarea.scrollLeft;
		}
	};

	// Handle token detection when value or cursor position changes
	const handleTokenDetection = () => {
		if (!textareaRef.current || !onTokenFocus) {
			return;
		}

		const cursorPosition = textareaRef.current.selectionStart;

		// Enhanced regex to match both property and method syntax
		// Matches: @site(title) and @site().method()
		const tagRegex = /@(\w+)\(([^)]*)\)((?:\.\w+(?:\([^)]*\))?)*)/g;
		let match: RegExpExecArray | null;
		let tokenIndex = 0;
		let foundTag = false;

		while ((match = tagRegex.exec(value)) !== null) {
			const matchStart = match.index;
			const matchEnd = match.index + match[0].length;

			// Check if cursor is within this tag
			if (cursorPosition >= matchStart && cursorPosition <= matchEnd) {
				onTokenFocus(tokenIndex);
				foundTag = true;
				break;
			}
			tokenIndex++;
		}

		// If cursor is not inside any tag, notify parent to clear selection
		if (!foundTag) {
			onTokenFocus(-1);
		}

		// Check if we should show modifier autocomplete when clicking after a closing paren
		// This fixes the issue where autocomplete doesn't show on first click
		const textBefore = value.substring(0, cursorPosition);
		if (textBefore.endsWith('.') && textBefore.charAt(cursorPosition - 2) === ')') {
			// Check if there's a tag before the dot (starts with @)
			if (textBefore.match(/@\w+\(/)) {
				console.log('[CodeEditor] Click detected after ), triggering modifier autocomplete');
				void checkForModifierAutocomplete(value);
			}
		}
	};

	// Don't call token detection when value changes - only on user interaction (onClick, onKeyUp)
	// This prevents the sidebar from hiding when modifiers are updated programmatically
	// useEffect(() => {
	// 	handleTokenDetection();
	// }, [value]);

	// Close autocomplete when clicking outside (Voxel pattern)
	useEffect(() => {
		if (!showAutocomplete) return;

		const handleOutsideClick = (e: MouseEvent) => {
			// Voxel's exact approach: if click target's closest .dtags-ac doesn't exist, hide dropdown
			if (!(e.target as HTMLElement).closest('.dtags-ac')) {
				console.log('[CodeEditor] Click outside .dtags-ac, closing autocomplete');
				setShowAutocomplete(false);
			}
		};

		// Small delay to ensure autocomplete is rendered
		const timeoutId = setTimeout(() => {
			document.addEventListener('click', handleOutsideClick);
			console.log('[CodeEditor] Voxel-style click-outside listener attached');
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('click', handleOutsideClick);
			console.log('[CodeEditor] Voxel-style click-outside listener removed');
		};
	}, [showAutocomplete]);

	// Debug render state
	console.log('[CodeEditor] Render - showAutocomplete:', showAutocomplete, 'suggestions:', suggestions.length);

	return (
		<div className="dtags-wrapper">
			<div className="dtags-content">
				{/* Syntax highlighted preview using Voxel's exact structure */}
				<pre
					className="ts-snippet nvx-scrollable"
					dangerouslySetInnerHTML={{ __html: renderHighlighted(value || '') }}
				/>

				{/* Plain textarea for actual editing - Voxel structure */}
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => handleInputChange(e.target.value)}
					onKeyDown={handleKeyDown}
					onClick={handleTokenDetection}
					onKeyUp={handleTokenDetection}
					onScroll={handleScroll}
					rows={4}
					className="nvx-scrollable"
					placeholder="Press @ to quickly add a tag, or pick one from the left sidebar"
					spellCheck={false}
				/>

				{/* Autocomplete dropdown - MOVED INSIDE .dtags-content for correct positioning */}
				{showAutocomplete && suggestions.length > 0 && (
					<div
						ref={autocompleteRef}
						className="dtags-ac nvx-scrollable"
						style={{
							top: `${autocompletePosition.top}px`,
							left: `${autocompletePosition.left}px`,
						}}
					>
						{autocompleteType === 'tag' ? (
							<ul className="nvx-quick-tags">
								{suggestions.map((suggestion, index) => {
									const tagSuggestion = suggestion as TagSuggestion;
									return (
										<li
											key={index}
											className={index === selectedIndex ? 'is-active' : ''}
											data-result-index={index}
											title={`${tagSuggestion.breadcrumb} / ${tagSuggestion.label}`}
											onClick={() => handleSelectSuggestion(suggestion)}
											onMouseEnter={() => setSelectedIndex(index)}
										>
											<span>{tagSuggestion.breadcrumb}</span>
											<p>{tagSuggestion.label}</p>
										</li>
									);
								})}
							</ul>
						) : (
							<ul className="nvx-quick-tags nvx-insert-mod">
								{(() => {
									// Group modifiers by category - Voxel pattern
									const categoryOrder = ['text', 'number', 'date', 'other', 'control'];
									const categoryLabels: Record<string, string> = {
										text: 'Text',
										number: 'Number',
										date: 'Date',
										other: 'Other',
										control: 'Conditionals'
									};
									const grouped = suggestions.reduce((acc, s) => {
										const mod = s as ModifierSuggestion;
										if (!acc[mod.category]) acc[mod.category] = [];
										acc[mod.category].push(mod);
										return acc;
									}, {} as Record<string, ModifierSuggestion[]>);

									let flatIndex = 0;
									return categoryOrder.map((category) => {
										if (!grouped[category]) return null;
										const items = grouped[category];
										return (
											<React.Fragment key={category}>
												<li className="vx-inert">
													<span>{categoryLabels[category]}</span>
												</li>
												{items.map((mod, idx) => {
													const currentIndex = flatIndex++;
													const isFirstItem = currentIndex === 0;
													const classNames = [
														currentIndex === selectedIndex ? 'is-active' : '',
														isFirstItem ? 'first-item' : ''
													].filter(Boolean).join(' ');
													return (
														<li
															key={`${category}-${idx}`}
															className={classNames}
															data-result-index={currentIndex}
															title={mod.label}
															onClick={() => handleSelectSuggestion(mod)}
														>
															<p>{mod.label} <code>{mod.fullSignature || mod.code}</code></p>
														</li>
													);
												})}
											</React.Fragment>
										);
									});
								})()}
							</ul>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
