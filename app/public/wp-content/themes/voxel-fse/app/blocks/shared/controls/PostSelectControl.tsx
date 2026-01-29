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

// REST API endpoints for each post type
const POST_TYPE_ENDPOINTS: Record<string, string> = {
	page: '/wp/v2/pages',
	post: '/wp/v2/posts',
	wp_block: '/wp/v2/blocks',
	elementor_library: '/wp/v2/elementor_library',
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

	// Fetch single post by ID
	const fetchSinglePost = useCallback(async (postId: string): Promise<PostSelectOption | null> => {
		const numericId = parseInt(postId, 10);
		if (isNaN(numericId)) return null;

		// Try each post type endpoint until we find the post
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
					template?: string;
				};

				if (post && post.id) {
					// Build display title matching Voxel format
					let displayTitle = `#${post.id}`;
					const postType = post.type || type;
					const template = post.template || '';

					if (post.title?.rendered) {
						displayTitle = `#${post.id}: ${post.title.rendered}`;
					} else if (postType) {
						displayTitle = `#${post.id}: post type: ${postType}`;
						if (template) {
							displayTitle += ` | template: ${template}`;
						}
					}

					return {
						id: String(post.id),
						title: displayTitle,
						type: postType,
					};
				}
			} catch {
				// Continue to next endpoint
			}
		}
		return null;
	}, [postTypes]);

	// Search posts across all post types
	const searchPosts = useCallback(async (search: string): Promise<PostSelectOption[]> => {
		if (search.length < 2) return [];

		const allResults: PostSelectOption[] = [];

		// Search in parallel across all post types
		const searchPromises = postTypes.map(async (type) => {
			const endpoint = POST_TYPE_ENDPOINTS[type];
			if (!endpoint) return [];

			try {
				const posts = (await apiFetch({
					path: `${endpoint}?search=${encodeURIComponent(search)}&per_page=10&status=publish,draft,private`,
				})) as Array<{
					id: number;
					title: { rendered: string };
					type: string;
					template?: string;
					meta?: Record<string, any>;
				}>;

				return posts.map((post: {
					id: number;
					title: { rendered: string };
					type: string;
					template?: string;
					meta?: Record<string, any>;
				}) => {
					// Build display title matching Voxel format
					let displayTitle = `#${post.id}`;
					const postType = post.type || type;
					const template = post.template || post.meta?.['template'] || '';

					if (post.title?.rendered) {
						displayTitle = `#${post.id}: ${post.title.rendered}`;
					}

					// Add post type and template info if available
					if (postType && !displayTitle.includes('post type')) {
						const typeLabel = postType.replace('_', ' ');
						if (template) {
							displayTitle = `#${post.id}: post type: ${typeLabel} | template: ${template}`;
						}
					}

					return {
						id: String(post.id),
						title: displayTitle,
						type: postType,
					};
				});
			} catch {
				return [];
			}
		});

		const resultsArrays = await Promise.all(searchPromises);
		resultsArrays.forEach((arr) => allResults.push(...arr));

		// Sort by ID descending (newest first)
		return allResults.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
	}, [postTypes]);

	// Debounced search
	const debouncedSearch = useCallback(
		debounce(async (term: string) => {
			if (term.length < 2) {
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

						{/* Dropdown Arrow */}
						<span
							style={{
								position: 'absolute',
								right: '12px',
								top: '50%',
								transform: 'translateY(-50%)',
								pointerEvents: 'none',
							}}
						>
							<svg width="12" height="12" viewBox="0 0 12 12" fill="#757575">
								<path d="M2 4l4 4 4-4" stroke="#757575" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</span>
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
							) : searchTerm.length >= 2 ? (
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
