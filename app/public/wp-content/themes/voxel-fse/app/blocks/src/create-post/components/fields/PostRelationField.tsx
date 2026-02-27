/**
 * Post Relation Field Component - ENHANCED to Level 2
 * Handles: post-relation field type with searchable post selector
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/post-relation-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-12-01
 *
 * Features Added:
 * - FieldPopup integration for post selector
 * - Search functionality with search icon
 * - Checkbox/radio selection (multiple or single)
 * - Load more functionality
 * - Empty states with icons
 * - Post logo display support
 * - Validation error support
 * - Description tooltip
 *
 * Value structure:
 * - Multiple: Array of post IDs [123, 456, 789]
 * - Single: Single post ID 123
 *
 * ⚠️ NOTE: This is a FRONTEND-ONLY implementation
 * - Search and load more use MOCK data (no backend integration)
 * - For full functionality, integrate with WordPress REST API or Voxel's AJAX endpoints
 */
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { getSiteBaseUrl } from '@shared/utils/siteUrl';
// Import shared components (Voxel's commons.js pattern)
import { FieldPopup } from '@shared';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_SEARCH_ICON, VOXEL_RELOAD_ICON } from '../../utils/voxelDefaultIcons';

// EXACT Voxel: Post structure matches post-relations-controller.php lines 199-206
interface Post {
	id: number;
	title: string;
	logo?: string; // HTML markup from $post->get_avatar_markup()
	type?: string;
	icon?: string;
	requires_approval?: boolean;
}

interface PostRelationFieldProps {
	field: VoxelField;
	value: number[] | number | null;
	onChange: (value: number[] | number | null) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
	postTypeKey?: string; // Post type key for AJAX calls
}

// EXACT Voxel: AJAX response structure from post-relations-controller.php lines 210-214
interface PostsResponse {
	success: boolean;
	has_more: boolean;
	data: Post[];
}

export const PostRelationField: React.FC<PostRelationFieldProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons,
	postTypeKey
}) => {
	const inputRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Field props
	const isMultiple = field.props?.['multiple'] ?? false;
	const placeholder = (field.props?.['placeholder'] || field.label) as string;
	// Evidence: post-relation-field.php:128-129 — max_count limits how many posts can be selected
	const maxCount = field.props?.['max_count'] as number | null | undefined;
	// Evidence: post-relation-field.php:155 — relation_type: 'has_one'|'has_many'|'belongs_to_one'|'belongs_to_many'
	// @ts-ignore -- unused but kept for future use
	const _relationType = field.props?.['relation_type'] as string | undefined;
	// @ts-ignore -- unused but kept for future use
	// Evidence: post-relation-field.php:157 — post_types array of allowed post type keys
	const _postTypes = field.props?.['post_types'] as string[] | undefined;
	// Evidence: post-relation-field.php:183 — require_author_approval flag
	const requireAuthorApproval = field.props?.['require_author_approval'] === true;
	// Evidence: post-relation-field.php:186 — pending_ids: post IDs pending approval
	const pendingIds = (field.props?.['pending_ids'] || []) as number[];

	// Get validation error from field
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// State
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	// Initial posts list (loaded on open)
	const [initialPosts, setInitialPosts] = useState<Post[]>([]);
	const [initialHasMore, setInitialHasMore] = useState(false);
	const [initialOffset, setInitialOffset] = useState(0);
	const [initialLoading, setInitialLoading] = useState(false);

	// Search results
	const [searchResults, setSearchResults] = useState<Post[]>([]);
	const [searchHasMore, setSearchHasMore] = useState(false);
	const [searchOffset, setSearchOffset] = useState(0);
	const [searchLoading, setSearchLoading] = useState(false);

	// Selected posts data (from field.props.selected)
	const [selectedPostsData, setSelectedPostsData] = useState<Record<number, Post>>({});

	// Track which post IDs we've already attempted to fetch (to prevent infinite loops)
	const fetchedIdsRef = useRef<Set<number>>(new Set());

	// Set of pending post IDs for O(1) lookup — Evidence: post-relation-field.php:186
	const pendingSet = useMemo(() => new Set(pendingIds), [pendingIds]);

	// EXACT Voxel: Get search icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/post-relation-field.php:24,69,122
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'search.svg' )
	const searchIconHtml = iconToHtml(icons?.tsSearchIcon, VOXEL_SEARCH_ICON);

	// EXACT Voxel: Get reload icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/post-relation-field.php:62,109,117
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'reload.svg' )
	const reloadIconHtml = iconToHtml(icons?.tsTimelineLoadIcon, VOXEL_RELOAD_ICON);

	// Normalize value to object (id: boolean)
	// MUST be defined BEFORE fetchPosts since fetchPosts depends on it
	const selectedPosts = useMemo(() => {
		const selected: Record<number, boolean> = {};
		if (Array.isArray(value)) {
			value.forEach(id => selected[id] = true);
		} else if (typeof value === 'number') {
			selected[value] = true;
		}
		return selected;
	}, [value]);

	// Initialize selected posts data from field.props.selected
	// EXACT Voxel: Field receives selected posts data in frontend_props() - post-relation-field.php lines 177-186
	// FIX: Re-sync selectedPostsData whenever value changes (e.g., when navigating between form steps)
	// This ensures post titles are preserved when returning to a previous step
	React.useEffect(() => {
		const storageKey = `voxel_post_relation_${postTypeKey}_${field.key}`;

		// First, try to restore from sessionStorage
		try {
			const storedData = sessionStorage.getItem(storageKey);
			if (storedData) {
				const parsedData = JSON.parse(storedData);
				setSelectedPostsData(prev => ({
					...prev,
					...parsedData
				}));
				console.log('[PostRelation] Restored from sessionStorage:', parsedData);
			}
		} catch (error) {
			console.error('[PostRelation] Error reading from sessionStorage:', error);
		}

		// Then, initialize from field.props.selected if available (server-side data)
		if (field.props?.['selected'] && typeof field.props['selected'] === 'object') {
			const selectedObj = field.props['selected'] as Record<number, Post>;
			setSelectedPostsData(prev => ({
				...prev,
				...selectedObj
			}));
			// Persist to sessionStorage
			try {
				sessionStorage.setItem(storageKey, JSON.stringify(selectedObj));
			} catch (error) {
				console.error('[PostRelation] Error writing to sessionStorage:', error);
			}
		}

		// Second, check if we have selected IDs but missing title data
		// This happens when component remounts during step navigation
		const selectedIds = Object.keys(selectedPosts).filter(id => selectedPosts[Number(id)]);
		const missingIds = selectedIds.filter(id => {
			const numId = Number(id);
			const alreadyFetched = fetchedIdsRef.current.has(numId);
			const hasData = selectedPostsData[numId]?.title;
			return !alreadyFetched && !hasData;
		});

		// Fetch missing post details from server
		if (missingIds.length > 0) {
			console.log('[PostRelation] Fetching missing post titles for IDs:', missingIds);

			// Mark IDs as being fetched to prevent duplicate requests
			missingIds.forEach(id => fetchedIdsRef.current.add(Number(id)));

			// Build query to fetch post details by IDs
			const params = new URLSearchParams({
				action: 'create_post.relations.get_posts',
				post_type: postTypeKey || '',
				field_key: field.key,
				ids: missingIds.join(','), // Pass IDs to fetch
			});

			// MULTISITE FIX: Use getSiteBaseUrl() instead of window.location.origin
			const ajaxUrl = (window as any).Voxel_Config?.ajax_url || getSiteBaseUrl();
			const url = `${ajaxUrl}&${params.toString()}`;

			fetch(url)
				.then(response => response.json())
				.then((data: PostsResponse) => {
					if (data.success && data.data) {
						console.log('[PostRelation] Fetched post details:', data.data);
						const postsById: Record<number, Post> = {};
						data.data.forEach(post => {
							postsById[post.id] = post;
						});
						setSelectedPostsData(prev => ({
							...prev,
							...postsById
						}));
					}
				})
				.catch(error => {
					console.error('[PostRelation] Error fetching post details:', error);
					// Remove from fetched set on error so we can retry
					missingIds.forEach(id => fetchedIdsRef.current.delete(Number(id)));
				});
		}
	}, [field.props?.['selected'], postTypeKey, field.key]); // Only run on mount and when field.props.selected changes

	// EXACT Voxel: Fetch posts from WordPress AJAX endpoint
	// Evidence: post-relations-controller.php lines 12 (hook), 15-221 (handler)
	// Endpoint: voxel_ajax_create_post.relations.get_posts
	const fetchPosts = useCallback(async (searchQuery: string = '', offset: number = 0): Promise<PostsResponse | null> => {
		try {
			// Get selected post IDs to exclude from results
			const selectedIds = Object.keys(selectedPosts).filter(id => selectedPosts[Number(id)]);

			// Build query parameters matching Voxel's expected format
			// Evidence: post-relations-controller.php lines 17-113
			const params = new URLSearchParams({
				action: 'create_post.relations.get_posts',
				post_type: postTypeKey || '',
				field_key: field.key,
				offset: offset.toString(),
			});

			if (searchQuery.trim()) {
				params.append('search', searchQuery.trim());
			}

			if (selectedIds.length > 0) {
				params.append('exclude', selectedIds.join(','));
			}

			// ========================================================================
			// CRITICAL: Voxel's Custom AJAX System (NOT standard WordPress)
			// ========================================================================
			// Evidence: themes/voxel/app/controllers/ajax-controller.php
			//
			// HOW IT WORKS:
			// 1. Ajax_Controller hooks 'template_redirect' (line 19), NOT 'wp_ajax_*'
			// 2. Requests MUST go to site URL, NOT /wp-admin/admin-ajax.php
			// 3. 'vx=1' parameter triggers Ajax_Controller (line 23)
			// 4. Ajax_Controller reads 'action' and ADDS 'voxel_ajax_' prefix (line 73)
			// 5. Calls do_action("voxel_ajax_{$action}") for logged-in users (line 78)
			//
			// CORRECT:  http://site.com/?vx=1&action=create_post.relations.get_posts
			//           → template_redirect fires → Ajax_Controller runs
			//           → Adds prefix: voxel_ajax_create_post.relations.get_posts
			//
			// WRONG:    http://site.com/wp-admin/admin-ajax.php?vx=1&action=...
			//           → admin-ajax.php takes over BEFORE template_redirect
			//           → Ajax_Controller never runs → returns '0'
			// ========================================================================
			// MULTISITE FIX: Use getSiteBaseUrl() instead of window.location.origin
			const ajaxUrl = (window as any).Voxel_Config?.ajax_url || getSiteBaseUrl();
			const url = `${ajaxUrl}&${params.toString()}`;
			console.log('[PostRelation] Fetching:', { url, post_type: postTypeKey, field_key: field.key, offset });
			const response = await fetch(url);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('[PostRelation] Server error:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
					params: { post_type: postTypeKey, field_key: field.key, offset }
				});
				throw new Error(`Server returned ${response.status}: ${errorText}`);
			}

			const data: PostsResponse = await response.json();
			console.log('[PostRelation] Response:', { success: data.success, count: data.data?.length, has_more: data.has_more });
			return data.success ? data : null;
		} catch (error) {
			console.error('Error fetching posts:', error);
			return null;
		}
	}, [field.key, postTypeKey, selectedPosts]);

	// Display value (post titles or placeholder)
	// EXACT Voxel: Display selected post titles joined by comma
	const displayValue = useMemo(() => {
		const selectedIds = Object.keys(selectedPosts).filter(id => selectedPosts[Number(id)]);
		if (selectedIds.length === 0) return null;

		const titles = selectedIds.map(id => {
			const postData = selectedPostsData[Number(id)];
			return postData?.title || `Post ${id}`;
		});

		return titles.join(', ');
	}, [selectedPosts, selectedPostsData]);

	/**
	 * Eager Loading - Load initial posts on component mount
	 *
	 * DEVIATION FROM VOXEL: Voxel uses lazy loading (loads on popup open).
	 * We use eager loading for better perceived performance.
	 *
	 * Pattern: docs/conversions/popup-eager-loading-optimization.md
	 * Same optimization applied to MediaPopup
	 */
	useEffect(() => {
		const loadInitialPosts = async () => {
			if (initialPosts.length === 0 && !initialLoading) {
				setInitialLoading(true);
				const response = await fetchPosts('', 0);
				if (response) {
					setInitialPosts(response.data);
					setInitialHasMore(response.has_more);
					setInitialOffset(10); // Per page is 10 - post-relations-controller.php:66
				}
				setInitialLoading(false);
			}
		};

		loadInitialPosts();
	}, []); // Empty deps = run once on mount

	// Open popup - data already loaded via eager loading
	const openPopup = useCallback(() => {
		setIsOpen(true);
		// Focus search input after popup opens
		setTimeout(() => searchInputRef.current?.focus(), 100);
	}, []);

	// Close popup
	const closePopup = useCallback(() => {
		setIsOpen(false);
		setSearchTerm('');
		setSearchResults([]);
		setSearchOffset(0);
		onBlur?.();
	}, [onBlur]);

	// Handle post selection
	const selectPost = useCallback((post: Post) => {
		const storageKey = `voxel_post_relation_${postTypeKey}_${field.key}`;

		// Store post data for display
		setSelectedPostsData(prev => {
			const updated = { ...prev, [post.id]: post };
			// Persist to sessionStorage
			try {
				sessionStorage.setItem(storageKey, JSON.stringify(updated));
			} catch (error) {
				console.error('[PostRelation] Error writing to sessionStorage:', error);
			}
			return updated;
		});

		if (isMultiple) {
			// Multiple selection: toggle
			const newSelected = { ...selectedPosts };
			if (newSelected[post.id]) {
				delete newSelected[post.id];
			} else {
				// Enforce max_count — Evidence: post-relation-field.php:128-129
				if (maxCount && maxCount > 0) {
					const currentCount = Object.values(newSelected).filter(Boolean).length;
					if (currentCount >= maxCount) {
						if (field.validation) {
							field.validation.errors = [`You can select up to ${maxCount} items`];
						}
						return;
					}
				}
				newSelected[post.id] = true;
			}

			// Clear validation error when under limit
			if (field.validation?.errors?.length) {
				const count = Object.values(newSelected).filter(Boolean).length;
				if (!maxCount || count <= maxCount) {
					field.validation.errors = [];
				}
			}

			const ids = Object.keys(newSelected).map(Number);
			onChange(ids.length > 0 ? ids : null);
		} else {
			// Single selection: replace
			onChange(post.id);
			closePopup();
		}
	}, [isMultiple, selectedPosts, onChange, closePopup, postTypeKey, field.key, maxCount, field.validation]);

	// Handle search input change
	// EXACT Voxel: Debounced search with loading state
	const handleSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const term = e.target.value;
		setSearchTerm(term);

		if (term.trim()) {
			setSearchLoading(true);
			setSearchOffset(0);
			const response = await fetchPosts(term, 0);
			if (response) {
				setSearchResults(response.data);
				setSearchHasMore(response.has_more);
				setSearchOffset(10);
			}
			setSearchLoading(false);
		} else {
			setSearchResults([]);
			setSearchOffset(0);
		}
	}, [fetchPosts]);

	// Handle load more (for initial posts)
	// EXACT Voxel: Load more posts with pagination
	const handleLoadMore = useCallback(async () => {
		setInitialLoading(true);
		const response = await fetchPosts('', initialOffset);
		if (response) {
			setInitialPosts(prev => [...prev, ...response.data]);
			setInitialHasMore(response.has_more);
			setInitialOffset(prev => prev + 10);
		}
		setInitialLoading(false);
	}, [fetchPosts, initialOffset]);

	// Handle load more for search results
	const handleSearchLoadMore = useCallback(async () => {
		setSearchLoading(true);
		const response = await fetchPosts(searchTerm, searchOffset);
		if (response) {
			setSearchResults(prev => [...prev, ...response.data]);
			setSearchHasMore(response.has_more);
			setSearchOffset(prev => prev + 10);
		}
		setSearchLoading(false);
	}, [fetchPosts, searchTerm, searchOffset]);

	// Handle clear
	const handleClear = useCallback(() => {
		onChange(null);
	}, [onChange]);

	// Handle save (close popup)
	const handleSave = useCallback(() => {
		closePopup();
	}, [closePopup]);

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Label with error/optional display - 1:1 match with Voxel location-field.php lines 4-13 */}
			<label>
				{field.label}

				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* Description tooltip - 1:1 match with Voxel location-field.php lines 7-12 */}
				{field.description && (
					<div className="vx-dialog">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
						</svg>
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* Trigger button - 1:1 match with Voxel post-relation-field.php lines 14-19 */}
			<div
				ref={inputRef}
				className={`ts-filter ts-popup-target ${displayValue !== null ? 'ts-filled' : ''}`}
				onClick={openPopup}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openPopup();
					}
				}}
			>
				<div className="ts-filter-text">
					<span>{displayValue !== null ? displayValue : placeholder}</span>
				</div>
				<div className="ts-down-icon"></div>
			</div>

			{/* Popup with post selector - 1:1 match with Voxel structure */}
			<FieldPopup
				isOpen={isOpen}
				target={inputRef as React.RefObject<HTMLDivElement>}
				title=""
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				onSave={handleSave}
				onClear={handleClear}
				onClose={closePopup}
			>
				{/* Search header - 1:1 match with Voxel post-relation-field.php lines 22-30 */}
				<div className="ts-sticky-top uib b-bottom">
					<div className="ts-input-icon flexify">
						<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
						<input
							ref={searchInputRef}
							type="text"
							className="autofocus"
							placeholder="Search"
							value={searchTerm}
							onChange={handleSearchChange}
						/>
					</div>
				</div>

				{/* Search results OR initial posts list */}
				{searchTerm.trim() ? (
					/* Search results - 1:1 match with Voxel post-relation-field.php lines 32-75 */
					<div className={`ts-term-dropdown ts-md-group ts-multilevel-dropdown ${searchLoading ? 'vx-disabled' : ''}`}>
						<ul className="simplify-ul ts-term-dropdown-list min-scroll">
							{searchResults.length > 0 ? (
								<>
									{searchResults.map(post => (
										<li key={post.id} className={pendingSet.has(post.id) ? 'ts-pending' : ''}>
											<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); selectPost(post); }}>
												<div className="ts-checkbox-container">
													<label className={`container-${isMultiple ? 'checkbox' : 'radio'}`}>
														<input
															type={isMultiple ? 'checkbox' : 'radio'}
															value={post.id}
															checked={selectedPosts[post.id] || false}
															disabled
															hidden
														/>
														<span className="checkmark"></span>
													</label>
												</div>
												<span>{post.title}</span>
												{requireAuthorApproval && pendingSet.has(post.id) && (
													<span className="ts-status-badge" style={{ fontSize: '11px', opacity: 0.7 }}>Pending</span>
												)}
												{post.logo && (
													<div className="ts-term-image">
														<span dangerouslySetInnerHTML={{ __html: post.logo }} />
													</div>
												)}
											</a>
										</li>
									))}
									{/* Load more button for search results - 1:1 match with Voxel lines 60-65 */}
									{searchHasMore && (
										<li>
											<a
												href="#"
												onClick={(e) => { e.preventDefault(); handleSearchLoadMore(); }}
												className={`ts-btn ts-btn-4 ${searchLoading ? 'vx-pending' : ''}`}
											>
												<span dangerouslySetInnerHTML={{ __html: reloadIconHtml }} />
												Load more
											</a>
										</li>
									)}
								</>
							) : (
								/* Empty state - no results - 1:1 match with Voxel lines 67-72 */
								<li className="ts-empty-user-tab">
									<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
									<p>{searchLoading ? 'Searching posts' : 'No posts found'}</p>
								</li>
							)}
						</ul>
					</div>
				) : (
					/* Initial posts list - 1:1 match with Voxel post-relation-field.php lines 76-127 */
					<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
						<ul className="simplify-ul ts-term-dropdown-list min-scroll">
							{initialPosts.length > 0 ? (
								<>
									{initialPosts.map(post => (
										<li key={post.id} className={pendingSet.has(post.id) ? 'ts-pending' : ''}>
											<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); selectPost(post); }}>
												<div className="ts-checkbox-container">
													<label className={`container-${isMultiple ? 'checkbox' : 'radio'}`}>
														<input
															type={isMultiple ? 'checkbox' : 'radio'}
															value={post.id}
															checked={selectedPosts[post.id] || false}
															disabled
															hidden
														/>
														<span className="checkmark"></span>
													</label>
												</div>
												<span>{post.title}</span>
												{requireAuthorApproval && pendingSet.has(post.id) && (
													<span className="ts-status-badge" style={{ fontSize: '11px', opacity: 0.7 }}>Pending</span>
												)}
												{post.logo && (
													<div className="ts-term-image">
														<span dangerouslySetInnerHTML={{ __html: post.logo }} />
													</div>
												)}
											</a>
										</li>
									))}
									{/* Load more button - 1:1 match with Voxel lines 107-112 */}
									{initialHasMore && (
										<li>
											<a
												href="#"
												onClick={(e) => { e.preventDefault(); handleLoadMore(); }}
												className={`ts-btn ts-btn-4 ${initialLoading ? 'vx-pending' : ''}`}
											>
												<span dangerouslySetInnerHTML={{ __html: reloadIconHtml }} />
												Load more
											</a>
										</li>
									)}
								</>
							) : (
								/* Empty state - loading or no posts - 1:1 match with Voxel lines 114-125 */
								<li className="ts-empty-user-tab">
									{initialLoading ? (
										<>
											<span dangerouslySetInnerHTML={{ __html: reloadIconHtml }} />
											<p>Loading</p>
										</>
									) : (
										<>
											<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
											<p>No posts found</p>
										</>
									)}
								</li>
							)}
						</ul>
					</div>
				)}
			</FieldPopup>
		</div>
	);
};

export default PostRelationField;
