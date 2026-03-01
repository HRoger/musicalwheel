/**
 * DynamicTagBuilder Component
 *
 * Main component that provides a visual interface for building dynamic tag expressions.
 * Opens in a modal and allows users to browse tags, add modifiers, and preview the result.
 *
 * @package MusicalWheel
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TagTree } from './TagTree';
import { TagSearch } from './TagSearch';
import { CodeEditor } from './CodeEditor';
import { ModifierEditor } from './ModifierEditor';
import { DynamicTagBuilderProps, DataGroup, Modifier, AppliedModifier, TagExport } from './types';
import apiFetch from '@wordpress/api-fetch';
import { useTemplateContext, useTemplatePostType } from '@shared/utils/useTemplateContext';
import './styles.scss';
import './line-awesome-icons.css';

/**
 * Build a fully-resolved tree by embedding children from the flat cache into TagExports.
 * Mirrors Voxel's approach where all data is pre-loaded in memory.
 *
 * @param exports  Flat list of tag exports at this level
 * @param groupType  The group type (e.g., 'post', 'site')
 * @param parentPath  The parent path prefix for cache key lookup (e.g., 'post.amenities')
 * @param allChildren  The flat children cache (keys like 'post', 'post:post.amenities', etc.)
 * @param depth  Current recursion depth (prevent infinite loops)
 */
function resolveChildren(
	exports: TagExport[],
	groupType: string,
	parentPath: string | null,
	allChildren: Record<string, any[]>,
	depth: number = 0,
): TagExport[] {
	if (depth > 5) return exports; // Safety limit matching PHP's max_depth

	return exports.map(tag => {
		if (!tag.hasChildren && !(tag.children && tag.children.length > 0)) {
			return tag;
		}

		// Build cache key for this tag's children
		const tagPath = parentPath ? `${parentPath}.${tag.key}` : `${groupType}.${tag.key}`;
		const cacheKey = `${groupType}:${tagPath}`;

		// Look up children from the flat cache
		const cachedChildren = allChildren[cacheKey];
		const resolvedChildren = cachedChildren && cachedChildren.length > 0
			? resolveChildren(cachedChildren, groupType, tagPath, allChildren, depth + 1)
			: (tag.children || []);

		return {
			...tag,
			children: resolvedChildren,
			isLoaded: resolvedChildren.length > 0,
		};
	});
}

/**
 * Recursively filter exports, keeping only leaf nodes that match the query.
 * Mirrors Voxel's _searchProperty() behavior exactly:
 *
 * - Leaf nodes: kept only if their label/key matches the query
 * - Object/group nodes: kept only if they have matching descendants,
 *   and only with those matching descendants (not all children)
 * - Parent label matching does NOT cause all children to show
 *
 * @param exports  The exports at this tree level
 * @param query    Lowercase search query
 * @param labelChain  Accumulated label path for matching (Voxel matches "Post Amenities Icon")
 */
function filterExports(exports: TagExport[], query: string, labelChain: string[] = []): TagExport[] {
	const result: TagExport[] = [];

	for (const tag of exports) {
		const currentChain = [...labelChain, tag.label];

		if (tag.children && tag.children.length > 0) {
			// Object/group node: only include if descendants match
			const filteredChildren = filterExports(tag.children, query, currentChain);
			if (filteredChildren.length > 0) {
				result.push({
					...tag,
					children: filteredChildren,
				});
			}
		} else {
			// Leaf node: check label, key, AND label chain (Voxel behavior)
			const leafMatches =
				tag.label.toLowerCase().includes(query) ||
				tag.key.toLowerCase().includes(query) ||
				currentChain.join(' ').toLowerCase().includes(query);

			if (leafMatches) {
				result.push(tag);
			}
		}
	}

	return result;
}

export const DynamicTagBuilder: React.FC<DynamicTagBuilderProps> = ({
	value,
	onChange,
	label = 'Dynamic Content',
	context: contextProp = 'post',
	onClose,
	autoOpen = false,
}) => {
	// Auto-detect context from template slug (term_card → 'term', user_card → 'user')
	// Only override when the prop is the default 'post' (i.e., no explicit context was passed)
	const detectedContext = useTemplateContext();
	const context = contextProp === 'post' ? detectedContext : contextProp;
	// Extract post type from template slug (e.g., "voxel-place-card" → "place")
	// Used to fetch post-type-specific custom fields from Voxel's Exporter
	const postType = useTemplatePostType();
	const [isOpen, setIsOpen] = useState(autoOpen);
	const [content, setContent] = useState(value);
	const [searchQuery, setSearchQuery] = useState('');
	const [dataGroups, setDataGroups] = useState<DataGroup[]>([]);
	const [availableModifiers, setAvailableModifiers] = useState<Modifier[]>([]);
	const [selectedToken, setSelectedToken] = useState<number | null>(null);
	const [currentModifiers, setCurrentModifiers] = useState<AppliedModifier[]>([]);
	const [currentTag, setCurrentTag] = useState<{ group: string; property: string; breadcrumb?: string } | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [childrenCache, setChildrenCache] = useState<Record<string, any[]>>({});
	const [childrenReady, setChildrenReady] = useState(false);
	const insertTagRef = React.useRef<((tag: string) => void) | null>(null);

	/**
	 * Build filtered groups for search (mirrors Voxel's getGroups() + _searchProperty()).
	 *
	 * When the user types a search query, we:
	 * 1. Gather ALL children from both the React childrenCache and the global store's groupChildren
	 * 2. Resolve the full nested tree from the flat cache
	 * 3. Recursively filter it, keeping only matching items with hierarchy preserved
	 *
	 * This produces pre-resolved DataGroup[] with children embedded — TagTree renders them
	 * without any lazy loading.
	 */
	const filteredGroups = useMemo((): DataGroup[] => {
		if (!searchQuery.trim()) return [];
		// Don't filter until eager loading is complete (prevents flash of wrong results)
		if (!childrenReady) return [];

		const query = searchQuery.trim().toLowerCase();
		const globalStore = (window as any).VoxelFSE_Dynamic_Data_Store;

		// Merge all known children: React cache + global store
		const allChildren: Record<string, any[]> = {};
		if (globalStore?.groupChildren) {
			Object.assign(allChildren, globalStore.groupChildren);
		}
		// React childrenCache may have fresher data (e.g., post-type-specific fields)
		Object.assign(allChildren, childrenCache);

		const result: DataGroup[] = [];

		for (const group of dataGroups) {
			// Get top-level exports from cache
			const topLevelExports: TagExport[] = allChildren[group.type] || group.exports || [];
			if (topLevelExports.length === 0) continue;

			// Build fully nested tree from flat cache
			const resolvedExports = resolveChildren(topLevelExports, group.type, null, allChildren, 0);

			// Filter the resolved tree recursively (pass group label for chain matching)
			const filtered = filterExports(resolvedExports, query, [group.label]);

			if (filtered.length === 0) continue;

			result.push({
				...group,
				exports: filtered,
				isLoaded: true,
			});
		}

		return result;
	}, [searchQuery, dataGroups, childrenCache, childrenReady]);

	// Load data from pre-loaded global store (Voxel pattern for <100ms performance)
	// Re-load when context or post type changes (e.g., template type detected after initial mount)
	useEffect(() => {
		if (isOpen) {
			loadDataFromGlobalStore();
		}
	}, [isOpen, context, postType]);

	const loadDataFromGlobalStore = () => {
		// Clear cache when reloading (post type may have changed)
		setChildrenCache({});
		setChildrenReady(false);

		// Read from window.VoxelFSE_Dynamic_Data_Store (pre-loaded on page load)
		const globalStore = (window as any).VoxelFSE_Dynamic_Data_Store;

		// When postType is detected, always fetch from API because the global store
		// was pre-loaded at admin_head time without post type context (it only has
		// generic fields, not post-type-specific custom fields like Gallery, Amenities, etc.)
		if (postType) {
			// Use modifiers from global store if available (they don't depend on post type)
			if (globalStore?.modifiers) {
				setAvailableModifiers(globalStore.modifiers);
			}
			fetchDataGroupsFromAPI();
			return;
		}

		if (globalStore) {
			// Use context-specific groups if available, fall back to default groups
			const contextGroups = globalStore.groupsByContext?.[context];
			const groups = contextGroups || globalStore.groups || [];
			setDataGroups(groups);
			setAvailableModifiers(globalStore.modifiers || []);
			// Global store has all children pre-loaded — ready immediately
			setChildrenReady(true);
		} else {
			// Fallback to API if global store not available
			fetchDataGroupsFromAPI();
		}
	};

	/**
	 * Fallback: Fetch from API if global store not available
	 */
	const fetchDataGroupsFromAPI = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const postTypeParam = postType ? `&post_type=${postType}` : '';
			const groups = await apiFetch<DataGroup[]>({
				path: `/voxel-fse/v1/dynamic-data/groups?context=${context}${postTypeParam}`,
			});
			setDataGroups(groups || []);

			const modifiers = await apiFetch<Modifier[]>({
				path: '/voxel-fse/v1/dynamic-data/modifiers',
			});
			setAvailableModifiers(modifiers || []);

			// Show the tree immediately — don't block on eager loading
			setIsLoading(false);

			// Eagerly load all children in the background so search can find
			// post-type-specific fields (e.g., "Type of rental", "Amenities").
			// childrenReady gate prevents search from running with incomplete data.
			if (postType && groups) {
				eagerLoadGroupChildren(groups).then(() => {
					setChildrenReady(true);
				});
			} else {
				setChildrenReady(true);
			}
		} catch (err) {
			setError('Failed to load data groups. Please try again.');
			console.error('Failed to fetch data groups:', err);
			setIsLoading(false);
		}
	};

	/**
	 * Eagerly load all children for groups (recursively up to 3 levels).
	 * Runs in the background after initial load so search can work on full data.
	 */
	const eagerLoadGroupChildren = async (groups: DataGroup[]) => {
		const postTypeParam = postType ? `&post_type=${postType}` : '';
		const newCache: Record<string, any[]> = {};

		const loadRecursive = async (groupType: string, parent: string | null, depth: number) => {
			if (depth > 3) return; // Don't go too deep

			const cacheKey = parent ? `${groupType}:${parent}` : groupType;

			// Skip if already in cache
			if (newCache[cacheKey] || childrenCache[cacheKey]) return;

			const path = parent
				? `/voxel-fse/v1/dynamic-data/groups?group=${groupType}&parent=${parent}${postTypeParam}`
				: `/voxel-fse/v1/dynamic-data/groups?group=${groupType}${postTypeParam}`;

			try {
				const children = await apiFetch<any[]>({ path });
				if (!children || children.length === 0) return;
				newCache[cacheKey] = children;

				// Recursively load children that have hasChildren flag
				const childPromises: Promise<void>[] = [];
				for (const child of children) {
					if (child.hasChildren && child.key) {
						const nextParent = parent
							? `${parent}.${child.key}`
							: `${groupType}.${child.key}`;
						childPromises.push(loadRecursive(groupType, nextParent, depth + 1));
					}
				}
				await Promise.all(childPromises);
			} catch {
				// Silently skip failures in background loading
			}
		};

		// Load children for all groups in parallel
		const promises = groups.map(g => loadRecursive(g.type, null, 0));
		await Promise.all(promises);

		// Batch update the cache with all fetched data
		if (Object.keys(newCache).length > 0) {
			setChildrenCache(prev => ({ ...prev, ...newCache }));
		}
	};

	/**
	 * Lazy load children for a specific group when expanded (with caching)
	 */
	const fetchGroupChildren = async (groupType: string, parent?: string) => {
		// Create cache key
		const cacheKey = parent ? `${groupType}:${parent}` : groupType;

		// Check cache first
		if (childrenCache[cacheKey]) {
			console.log(`[fetchGroupChildren] Using cached children for ${cacheKey}`);
			return childrenCache[cacheKey];
		}

		// Check global store for pre-loaded children (instant for ALL levels!)
		// Skip global store for "post" group when postType is set, because the store
		// was pre-loaded without post type context (missing custom fields)
		const globalStore = (window as any).VoxelFSE_Dynamic_Data_Store;
		const isPostGroup = groupType === 'post' || (parent && parent.startsWith('post.'));
		if (globalStore?.groupChildren?.[cacheKey] && !(postType && isPostGroup)) {
			console.log(`[fetchGroupChildren] Loading children from global store for ${cacheKey} (instant!)`);
			const children = globalStore.groupChildren[cacheKey];

			// Cache it
			setChildrenCache(prev => ({
				...prev,
				[cacheKey]: children
			}));

			// Update the data groups state for top-level only
			if (!parent) {
				setDataGroups(prevGroups => {
					return prevGroups.map(group => {
						if (group.type === groupType) {
							return {
								...group,
								exports: children || [],
								isLoaded: true,
							};
						}
						return group;
					});
				});
			}

			return children;
		}

		console.log(`[fetchGroupChildren] Fetching children from API for ${cacheKey}...`);

		try {
			const postTypeParam = postType ? `&post_type=${postType}` : '';
			const path = parent
				? `/voxel-fse/v1/dynamic-data/groups?group=${groupType}&parent=${parent}${postTypeParam}`
				: `/voxel-fse/v1/dynamic-data/groups?group=${groupType}${postTypeParam}`;

			const children = await apiFetch<any[]>({ path });

			console.log(`[fetchGroupChildren] Loaded ${children?.length || 0} children for ${cacheKey}`);

			// Cache the result
			setChildrenCache(prev => ({
				...prev,
				[cacheKey]: children || []
			}));

			// Update the data groups state with the loaded children
			setDataGroups(prevGroups => {
				return prevGroups.map(group => {
					if (group.type === groupType && !parent) {
						// Top-level group
						return {
							...group,
							exports: children || [],
							isLoaded: true,
						};
					}
					// For nested groups, we'll handle this in TagTree
					return group;
				});
			});

			return children || [];
		} catch (err) {
			console.error(`Failed to fetch children for ${groupType}:`, err);
			// Cache empty array to prevent repeated failed requests
			setChildrenCache(prev => ({
				...prev,
				[cacheKey]: []
			}));
			return [];
		}
	};

	const handleSelectTag = (group: string, property: string, tagType?: string) => {
		// Insert tag at cursor position (Evidence: Voxel inserts at cursor, not at end)
		// Check if this is a method (Evidence: methods use @group().method() syntax)
		const tag = tagType === 'method'
			? `@${group}().${property}()`  // Method syntax: @site().query_var()
			: `@${group}(${property})`;     // Property syntax: @site(title)

		// Use insertTagAtCursor function from CodeEditor if available
		if (insertTagRef.current) {
			insertTagRef.current(tag);
		} else {
			// Fallback: append to end if insertTag not available yet
			setContent(prevContent => prevContent + (prevContent ? ' ' : '') + tag);
		}
	};

	/**
	 * Parse tag from content to extract group, property, and modifiers
	 * Supports both property syntax: @site(title) and method syntax: @site().method()
	 */
	const parseTagAtIndex = (text: string, tokenIndex: number) => {
		// Changed ([^)]+) to ([^)]*) to allow empty parentheses for methods
		const tagRegex = /@(\w+)\(([^)]*)\)((?:\.\w+(?:\([^)]*\))?)*)/g;
		let match;
		let currentIndex = 0;

		while ((match = tagRegex.exec(text)) !== null) {
			if (currentIndex === tokenIndex) {
				const group = match[1];
				const property = match[2];
				const modifiersStr = match[3] || '';

				// Parse modifiers
				const modifiers: AppliedModifier[] = [];
				const modifierRegex = /\.(\w+)(?:\(([^)]*)\))?/g;
				let modMatch;

				while ((modMatch = modifierRegex.exec(modifiersStr)) !== null) {
					const key = modMatch[1];
					const argsStr = modMatch[2] || '';
					const args = argsStr ? argsStr.split(',').map(a => a.trim()) : [];

					modifiers.push({ key, args });
				}

				// Format breadcrumb — strip colon prefix from aliases (e.g., ":image" → "Image")
				const formatLabel = (str: string) => {
					const clean = str.startsWith(':') ? str.slice(1) : str;
					return clean.charAt(0).toUpperCase() + clean.slice(1).replace(/_/g, ' ');
				};
				const breadcrumb = `${formatLabel(group)} / ${formatLabel(property)}`;

				return {
					group,
					property,
					breadcrumb,
					modifiers
				};
			}
			currentIndex++;
		}

		return null;
	};

	const handleTokenFocus = (tokenIndex: number) => {
		setSelectedToken(tokenIndex);

		// Parse tag at this index
		const tagInfo = parseTagAtIndex(content, tokenIndex);
		if (tagInfo) {
			setCurrentTag({
				group: tagInfo.group,
				property: tagInfo.property,
				breadcrumb: tagInfo.breadcrumb
			});
			setCurrentModifiers(tagInfo.modifiers);
		} else {
			setCurrentTag(null);
			setCurrentModifiers([]);
		}
	};

	/**
	 * Update the content when modifiers change
	 */
	const handleModifiersUpdate = (modifiers: AppliedModifier[]) => {
		setCurrentModifiers(modifiers);

		if (selectedToken === null || selectedToken < 0 || !currentTag) return;

		// Find the tag and replace it with updated modifiers
		// FIX: Changed ([^)]+) to ([^)]*) to allow empty parentheses for method syntax
		const tagRegex = /@(\w+)\(([^)]*)\)((?:\.\w+(?:\([^)]*\))?)*)/g;
		let match;
		let currentIndex = 0;
		let newContent = content;

		while ((match = tagRegex.exec(content)) !== null) {
			if (currentIndex === selectedToken) {
				const group = match[1];
				const property = match[2];

				// Build new tag with modifiers
				let newTag = `@${group}(${property})`;

				if (modifiers.length > 0) {
					modifiers.forEach(mod => {
						newTag += `.${mod.key}`;
						if (mod.args && mod.args.length > 0) {
							newTag += `(${mod.args.join(', ')})`;
						} else {
							newTag += `()`;
						}
					});
				}

				// Replace the old tag with the new one
				newContent = content.substring(0, match.index) + newTag + content.substring(match.index + match[0].length);

				// Keep the tag selected - don't trigger token detection
				// This prevents the sidebar from hiding when modifiers change
				setContent(newContent);
				return; // Exit early to avoid the setContent at the end
			}
			currentIndex++;
		}

		setContent(newContent);
	};

	const handleSave = () => {
		onChange(content);
		setIsOpen(false);
		if (onClose) {
			onClose();
		}
	};

	const handleDiscard = () => {
		setContent(value); // Reset to original value
		setIsOpen(false);
		if (onClose) {
			onClose();
		}
	};

	// Dynamically load Voxel's backend.css when modal opens
	useEffect(() => {
		if (!isOpen) return;

		const styleId = 'voxel-backend-css-dynamic';

		// Check if already loaded
		if (document.getElementById(styleId)) return;

		// Create link element to load Voxel's backend.css
		const link = document.createElement('link');
		link.id = styleId;
		link.rel = 'stylesheet';
		link.href = '/wp-content/themes/voxel/assets/dist/backend.css';
		document.head.appendChild(link);

		// Cleanup not needed - keep CSS loaded for subsequent opens
	}, [isOpen]);

	return (
		<>
			<div className="mw-dynamic-tag-builder-trigger">
				<button
					type="button"
					className="components-button is-secondary"
					onClick={() => setIsOpen(true)}
				>
					<span className="dashicons dashicons-tag"></span>
					{label}
				</button>
				{value && (
					<div className="mw-dynamic-tag-builder-trigger__preview">
						<code>{value}</code>
					</div>
				)}
			</div>

			{isOpen && (
				<div className="nvx-editor">
				<div className="nvx-topbar">
					<div className="nvx-topbar__title nvx-flex nvx-v-center">
						<h2>Dynamic data</h2>
					</div>
					<div className="nvx-topbar__buttons nvx-flex nvx-v-center">
						<button
							type="button"
							className="ts-button ts-outline"
							onClick={handleDiscard}
						>
							Discard
						</button>
						<button
							type="button"
							className="ts-button btn-shadow ts-save-settings"
							onClick={handleSave}
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H15.3809C15.977 3.25 16.5488 3.48658 16.9707 3.90779L20.0897 7.02197C20.5124 7.44403 20.7499 8.01685 20.7499 8.61418L20.7499 18.5C20.7499 19.7426 19.7425 20.75 18.4999 20.75H16.75V16.25C16.75 15.0074 15.7426 14 14.5 14L9.5 14C8.25736 14 7.25 15.0074 7.25 16.25L7.25001 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H12C12.4142 7.75 12.75 7.41421 12.75 7C12.75 6.58579 12.4142 6.25 12 6.25H8Z" fill="currentColor"/>
								<path d="M8.75001 20.75L15.25 20.75V16.25C15.25 15.8358 14.9142 15.5 14.5 15.5L9.5 15.5C9.08579 15.5 8.75 15.8358 8.75 16.25L8.75001 20.75Z" fill="currentColor"/>
							</svg>
							Save
						</button>
					</div>
				</div>

				{error && (
					<div className="mw-dynamic-tag-builder__error">
						{error}
					</div>
				)}

				{isLoading ? (
					<div className="mw-dynamic-tag-builder__loading">
						Loading...
					</div>
				) : (
					<div className="nvx-editor-body">
						<div className="nvx-left-sidebar nvx-scrollable">
							<TagSearch
								value={searchQuery}
								onChange={setSearchQuery}
							/>
							<TagTree
								groups={searchQuery.trim() ? filteredGroups : dataGroups}
								searchQuery={searchQuery}
								onSelectTag={handleSelectTag}
								onLoadChildren={fetchGroupChildren}
							/>
						</div>

						<div className="nvx-main">
							<div className="nvx-visual-editor">
								<CodeEditor
									value={content}
									onChange={setContent}
									onTokenFocus={handleTokenFocus}
									onInsertTag={(insertFn) => {
										insertTagRef.current = insertFn;
									}}
								/>
							</div>
						</div>

						<div className="nvx-right-sidebar nvx-scrollable">
							{selectedToken !== null && selectedToken >= 0 && currentTag ? (
								<ModifierEditor
									modifiers={currentModifiers}
									availableModifiers={availableModifiers}
									onUpdate={handleModifiersUpdate}
									currentTag={currentTag}
								/>
							) : (
								<div className="nvx-placeholder placeholder-all-center">
									<svg width="80" height="80" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M11.5811 3.06348C11.5811 2.81389 11.4569 2.58066 11.2498 2.44129C11.0428 2.30193 10.78 2.27469 10.5487 2.36864C8.65206 3.13926 7.3125 5.00074 7.3125 7.17688C7.3125 9.16904 8.43512 10.8975 10.0801 11.7667V20.0655C10.0801 21.3082 11.0874 22.3155 12.3301 22.3155H12.6701C13.9128 22.3155 14.9201 21.3082 14.9201 20.0655V11.7673C16.5657 10.8983 17.6888 9.16949 17.6888 7.17688C17.6888 5.00111 16.3497 3.13989 14.4535 2.36904C14.2223 2.27503 13.9595 2.30223 13.7524 2.44159C13.5453 2.58095 13.4211 2.8142 13.4211 3.06382V6.24913C13.4211 6.66334 13.0853 6.99913 12.6711 6.99913H12.3311C11.9168 6.99913 11.5811 6.66334 11.5811 6.24913V3.06348Z" fill="#343C54"/>
									</svg>
									<p>Click on a tag to view options</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
			)}
		</>
	);
};

export default DynamicTagBuilder;
