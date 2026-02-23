/**
 * Post Select Control
 *
 * Matches Voxel's `voxel-post-select` Elementor control behavior:
 * - Selected item displayed in a box with CLEAR button
 * - Persistent search input field (always visible)
 * - Dropdown results on search
 * - Dynamic tag support via DynamicTagBuilder
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DynamicTagBuilder } from '../dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

// Types
export interface PostSelectOption {
	id: string;
	title: string;
	type?: string;
	subtype?: string;
}

export interface PostSelectControlProps {
	/** Control label */
	label: string;
	/** Current value (post ID, dynamic tag expression, or empty string) */
	value: string;
	/** Change handler */
	onChange: (value: string) => void;
	/** Post types to search (e.g., ['page', 'wp_block']) */
	postTypes?: string[];
	/** Placeholder text for search input */
	placeholder?: string;
	/** Clear button text */
	clearText?: string;
	/** Empty results message */
	emptyMessage?: string;
	/** Enable dynamic tag support */
	enableDynamicTags?: boolean;
	/** Context for dynamic tag builder */
	context?: string;
}

// REST API endpoints for each post type (fallback for single-post lookups)
const POST_TYPE_ENDPOINTS: Record<string, string> = {
	page: '/wp/v2/pages',
	post: '/wp/v2/posts',
	wp_block: '/wp/v2/blocks',
	wp_template: '/wp/v2/templates',
	wp_template_part: '/wp/v2/template-parts',
};

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
	let timeoutId: ReturnType<typeof setTimeout>;
	return ((...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	}) as T;
}

export default function PostSelectControl({
	label,
	value,
	onChange,
	postTypes = ['page', 'wp_block'],
	placeholder = __('Search templates', 'voxel-fse'),
	clearText = __('CLEAR', 'voxel-fse'),
	emptyMessage = __('No results found', 'voxel-fse'),
	enableDynamicTags = false,
	context = 'post',
}: PostSelectControlProps) {
	// State
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState<PostSelectOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedPost, setSelectedPost] = useState<PostSelectOption | null>(null);
	const [isLoadingSelected, setIsLoadingSelected] = useState(false);

	// Dynamic tag modal state
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Refs
	const containerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Check if value contains dynamic tags
	const hasDynamicTags = enableDynamicTags && typeof value === 'string' && value.startsWith('@tags()');

	// Extract tag content (without @tags() wrapper)
	const getTagContent = useCallback(() => {
		if (!hasDynamicTags) return value || '';
		const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value;
	}, [hasDynamicTags, value]);

	// Enable dynamic tags
	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	// Disable dynamic tags
	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange('');
		}
	};

	// Save dynamic tag
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange(`@tags()${newValue}@endtags()`);
		}
		setIsModalOpen(false);
	};

	// Fetch single post by ID using the custom WP_Query search endpoint
	const fetchSinglePost = useCallback(async (postId: string): Promise<PostSelectOption | null> => {
		const numericId = parseInt(postId, 10);
		if (isNaN(numericId)) return null;

		try {
			// Use our custom endpoint which searches by ID via WP_Query
			const results = (await apiFetch({
				path: `/voxel-fse/v1/post-search?search=${encodeURIComponent('#' + numericId)}&post_types=${encodeURIComponent(postTypes.join(','))}&per_page=1`,
			})) as PostSelectOption[];

			if (results.length > 0) {
				return results[0];
			}
		} catch {
			// Fallback: try standard REST endpoints
			for (const [type, endpoint] of Object.entries(POST_TYPE_ENDPOINTS)) {
				if (!postTypes.includes(type) && !['page', 'post', 'wp_block'].includes(type)) {
					continue;
				}
				try {
					const post = (await apiFetch({
						path: `${endpoint}/${numericId}`,
					})) as {
						id: number;
						title: { rendered: string };
						type: string;
					};

					if (post && post.id) {
						return {
							id: String(post.id),
							title: post.title?.rendered ? `#${post.id}: ${post.title.rendered}` : `#${post.id}`,
							type: post.type || type,
						};
					}
				} catch {
					// Continue to next endpoint
				}
			}
		}
		return null;
	}, [postTypes]);

	// Search posts across all post types using custom WP_Query endpoint
	// Matches Voxel's voxel-post-select behavior: searches by title AND by ID
	const searchPosts = useCallback(async (search: string): Promise<PostSelectOption[]> => {
		if (search.length < 1) return [];

		try {
			const results = (await apiFetch({
				path: `/voxel-fse/v1/post-search?search=${encodeURIComponent(search)}&post_types=${encodeURIComponent(postTypes.join(','))}&per_page=20`,
			})) as PostSelectOption[];

			return results;
		} catch {
			return [];
		}
	}, [postTypes]);

	// Debounced search
	const debouncedSearch = useCallback(
		debounce(async (term: string) => {
			// Allow single character for ID searches (#1, 1), require 2+ for text search
			const isIdSearch = /^#?\d+$/.test(term.trim());
			if (term.length < (isIdSearch ? 1 : 2)) {
				setResults([]);
				setShowDropdown(false);
				return;
			}

			setIsLoading(true);
			setShowDropdown(true);

			try {
				const searchResults = await searchPosts(term);
				setResults(searchResults);
			} catch (error) {
				console.error('Search failed:', error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 300),
		[searchPosts]
	);

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const term = e.target.value;
		setSearchTerm(term);
		debouncedSearch(term);
	};

	// Handle result selection
	const handleSelect = (post: PostSelectOption) => {
		onChange(post.id);
		setSelectedPost(post);
		setSearchTerm('');
		setResults([]);
		setShowDropdown(false);
	};

	// Handle clear
	const handleClear = () => {
		onChange('');
		setSelectedPost(null);
		setSearchTerm('');
		setResults([]);
		setShowDropdown(false);
	};

	// Load selected post on mount or value change
	useEffect(() => {
		if (hasDynamicTags) {
			setSelectedPost(null);
			return;
		}

		if (value && !selectedPost) {
			setIsLoadingSelected(true);
			fetchSinglePost(value)
				.then((post) => {
					if (post) {
						setSelectedPost(post);
					}
				})
				.finally(() => {
					setIsLoadingSelected(false);
				});
		} else if (!value) {
			setSelectedPost(null);
		}
	}, [value, hasDynamicTags, fetchSinglePost]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div
			ref={containerRef}
			className="vxfse-post-select-control"
			style={{
				marginBottom: '16px',
			}}
		>
			{/* Label with Voxel Dynamic Tag button */}
			<div
				className="vxfse-post-select-label"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '8px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					{/* Voxel Dynamic Tag Button */}
					{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
					<label style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
						{label}
					</label>
				</div>
			</div>

			{/* Dynamic Tag Mode - Dark theme matching DynamicTagTextControl */}
			{hasDynamicTags ? (
				<div
					className="edit-voxel-tags"
					style={{
						backgroundColor: 'rgb(47, 47, 49)',
						borderRadius: '10px',
						overflow: 'hidden',
						padding: '12px',
					}}
				>
					{/* Tag content preview */}
					<div style={{ marginBottom: '12px' }}>
						<span
							style={{
								color: '#fff',
								fontSize: '13px',
								fontFamily: 'inherit',
								wordBreak: 'break-all',
							}}
						>
							{getTagContent()}
						</span>
					</div>

					{/* Light gray divider */}
					<div
						style={{
							height: '1px',
							backgroundColor: 'rgba(255, 255, 255, 0.15)',
							marginBottom: '8px',
						}}
					/>

					{/* Action buttons row */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							className="edit-tags"
							onClick={() => setIsModalOpen(true)}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'left',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							className="disable-tags"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.5)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'right',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				<>
					{/* Selected Item Box */}
					{(selectedPost || isLoadingSelected) && (
						<div
							className="vxfse-post-select-selected"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								padding: '10px 12px',
								marginBottom: '8px',
								backgroundColor: '#f9f9f9',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '13px',
								lineHeight: '1.4',
							}}
						>
							{isLoadingSelected ? (
								<span style={{ color: '#757575' }}>
									<Spinner style={{ marginRight: '8px' }} />
									{__('Loading...', 'voxel-fse')}
								</span>
							) : selectedPost ? (
								<>
									<span
										style={{
											flex: 1,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											color: '#1e1e1e',
										}}
									>
										{selectedPost.title}
									</span>
									<button
										type="button"
										onClick={handleClear}
										style={{
											background: 'none',
											border: 'none',
											color: '#757575',
											cursor: 'pointer',
											fontSize: '11px',
											fontWeight: 600,
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											padding: '4px 8px',
											marginLeft: '8px',
											flexShrink: 0,
										}}
										onMouseEnter={(e) => {
											(e.target as HTMLElement).style.color = '#d63638';
										}}
										onMouseLeave={(e) => {
											(e.target as HTMLElement).style.color = '#757575';
										}}
									>
										{clearText}
									</button>
								</>
							) : null}
						</div>
					)}

					{/* Search Input (always visible) */}
					<div
						className="vxfse-post-select-search"
						style={{
							position: 'relative',
						}}
					>
						<input
							ref={searchInputRef}
							type="search"
							value={searchTerm}
							onChange={handleSearchChange}
							onFocus={() => {
								if (results.length > 0) {
									setShowDropdown(true);
								}
							}}
							placeholder={placeholder}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							style={{
								width: '100%',
								padding: '10px 12px',
								border: '1px solid #8c8f94',
								borderRadius: '4px',
								fontSize: '13px',
								boxSizing: 'border-box',
								backgroundColor: '#fff',
							}}
						/>
					</div>

					{/* Search Results Dropdown */}
					{showDropdown && (
						<div
							className="vxfse-post-select-dropdown"
							style={{
								position: 'absolute',
								zIndex: 1000000,
								width: 'calc(100% - 32px)',
								maxWidth: '260px',
								backgroundColor: '#fff',
								border: '1px solid #ddd',
								borderTop: 'none',
								borderRadius: '0 0 4px 4px',
								boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
								maxHeight: '250px',
								overflowY: 'auto',
							}}
						>
							{isLoading ? (
								<div style={{ padding: '16px', textAlign: 'center' }}>
									<Spinner />
								</div>
							) : results.length > 0 ? (
								<ul
									style={{
										margin: 0,
										padding: 0,
										listStyle: 'none',
									}}
								>
									{results.map((post) => (
										<li
											key={post.id}
											onClick={() => handleSelect(post)}
											style={{
												padding: '10px 12px',
												cursor: 'pointer',
												borderBottom: '1px solid #f0f0f0',
												fontSize: '13px',
												color: '#1e1e1e',
												lineHeight: '1.4',
											}}
											onMouseEnter={(e) => {
												(e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
											}}
											onMouseLeave={(e) => {
												(e.target as HTMLElement).style.backgroundColor = 'transparent';
											}}
										>
											{post.title}
										</li>
									))}
								</ul>
							) : searchTerm.length >= 1 ? (
								<div
									style={{
										padding: '16px',
										textAlign: 'center',
										color: '#757575',
										fontSize: '13px',
									}}
								>
									{emptyMessage}
								</div>
							) : null}
						</div>
					)}
				</>
			)}

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={context}
					onClose={() => setIsModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}

// Also export as named export for convenience
export { PostSelectControl };
