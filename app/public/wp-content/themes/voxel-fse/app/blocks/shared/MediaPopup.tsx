/**
 * MediaPopup Component
 *
 * 1:1 match with Voxel's media library popup implementation
 * Template: themes/voxel/templates/widgets/create-post/_media-popup.php
 * Controller: themes/voxel/app/controllers/frontend/media-library-controller.php
 *
 * Features:
 * - Search user's media library
 * - Pagination (load more)
 * - File selection (single/multiple)
 * - Preview images
 * - Uses Voxel's custom AJAX system (/?vx=1&action=list_media)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect } from 'react';
import { FormPopup } from './popup-kit';

/**
 * Media file format from Voxel's list_media endpoint
 */
interface MediaFile {
	source: 'existing';
	id: number;
	name: string;
	type: string;
	preview?: string;
	is_private?: boolean;
}

/**
 * Session file format (uploaded files, not yet in WordPress)
 * Matches Voxel's session file structure
 */
interface SessionFile {
	source: 'new_upload';
	name: string;
	type: string;
	size: number;
	preview: string; // Blob URL
	item: File; // Original File object
	_id: string; // Unique session ID
}

/**
 * API response from list_media endpoint
 */
interface MediaListResponse {
	success: boolean;
	data: MediaFile[];
	has_more: boolean;
	message?: string;
}

/**
 * Global window data for create post form
 */
interface VoxelFseCreatePostData {
	ajaxUrl?: string;
	nonce?: string;
}

/**
 * Voxel's native configuration object
 * Available on frontend when Voxel is active
 */
interface VoxelConfig {
	ajax_url?: string;
	[key: string]: unknown;
}

/**
 * WordPress API settings (available in Gutenberg editor)
 */
interface WpApiSettings {
	root?: string;
	nonce?: string;
	[key: string]: unknown;
}

/**
 * Global cache for session files (Voxel pattern)
 * Stores uploaded files that haven't been saved to WordPress yet
 */
declare global {
	interface Window {
		_vx_file_upload_cache?: SessionFile[];
		voxelFseCreatePost?: VoxelFseCreatePostData;
		Voxel_Config?: VoxelConfig;
		wpApiSettings?: WpApiSettings;
	}
}

/**
 * Get the Voxel AJAX URL, handling subdirectory installations
 *
 * Priority:
 * 1. window.voxelFseCreatePost.ajaxUrl (set by our block render)
 * 2. window.Voxel_Config.ajax_url (Voxel's native config)
 * 3. Extract from window.wpApiSettings.root (Gutenberg editor)
 * 4. Fallback to window.location.origin (last resort)
 *
 * @returns {string} The AJAX URL with ?vx=1 parameter
 */
function getVoxelAjaxUrl(): string {
	// 1. Try our block's localized data
	if (window.voxelFseCreatePost?.ajaxUrl) {
		return window.voxelFseCreatePost.ajaxUrl;
	}

	// 2. Try Voxel's native config (available on frontend)
	if (window.Voxel_Config?.ajax_url) {
		// Voxel_Config.ajax_url is usually like "http://site.com/subdir/?vx=1"
		return window.Voxel_Config.ajax_url;
	}

	// 3. Try extracting site URL from WordPress REST API settings (Gutenberg editor)
	if (window.wpApiSettings?.root) {
		// wpApiSettings.root is like "http://site.com/subdir/wp-json/"
		// Extract the site URL by removing /wp-json/
		const siteUrl = window.wpApiSettings.root.replace(/\/wp-json\/?$/, '');
		return `${siteUrl}/?vx=1`;
	}

	// 4. Fallback to origin (may not work for subdirectory installations)
	return `${window.location.origin}/?vx=1`;
}

// Initialize global cache if it doesn't exist
if (typeof window !== 'undefined' && typeof window._vx_file_upload_cache === 'undefined') {
	window._vx_file_upload_cache = [];
}

/**
 * MediaPopup props
 */
interface MediaPopupProps {
	/** Called when popup closes */
	onBlur?: () => void;
	/** Called when user clicks Save with selected files */
	onSave?: (files: MediaFile[]) => void;
	/** Allow multiple file selection */
	multiple?: boolean;
	/** Save button label */
	saveLabel?: string;
	/** Custom trigger button (children) */
	children?: React.ReactNode;
	/** Minimum width for popup (default: 450) */
	minWidth?: number;
	/** Target element for popup positioning (defaults to trigger button) */
	target?: HTMLElement | null;
}

/**
 * MediaPopup Component
 *
 * Provides a popup to select files from user's WordPress media library.
 * Matches Voxel's media-popup implementation exactly.
 */
export default function MediaPopup({
	onBlur,
	onSave,
	multiple = false,
	saveLabel = 'Save',
	children,
	minWidth = 450,
	target: externalTarget,
}: MediaPopupProps) {
	// Popup state
	const [active, setActive] = useState(false);

	// Popup trigger button ref
	const popupTargetRef = useRef<HTMLDivElement>(null);

	// Search input ref (for autofocus)
	const searchInputRef = useRef<HTMLInputElement>(null);

	// State
	const [files, setFiles] = useState<MediaFile[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [hasMore, setHasMore] = useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);
	const [selected, setSelected] = useState<Record<string | number, MediaFile | SessionFile>>({});

	// Search state
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [searchResults, setSearchResults] = useState<MediaFile[]>([]);
	const [searchLoading, setSearchLoading] = useState<boolean>(false);
	const [searchHasMore, setSearchHasMore] = useState<boolean>(false);
	const [searchOffset, setSearchOffset] = useState<number>(0);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);

	/**
	 * Load files from media library
	 * Matches Voxel's AJAX endpoint: /?vx=1&action=list_media
	 *
	 * Uses fetch() API for modern JavaScript compatibility
	 * Note: jQuery version worked but fetch() is better for Phase 3 headless architecture
	 */
	const loadFiles = async (currentOffset = 0) => {
		// Set appropriate loading state
		const isLoadMore = currentOffset > 0;
		if (isLoadMore) {
			setLoadingMore(true);
		} else {
			setLoading(true);
		}

		try {
			// Use helper function that handles subdirectory installations
			const ajaxUrl = getVoxelAjaxUrl();

			// Build query parameters
			const params = new URLSearchParams({
				action: 'list_media',
				offset: currentOffset.toString(),
			});

			const url = `${ajaxUrl}&${params.toString()}`;

			const response = await fetch(url, {
				method: 'GET',
				credentials: 'same-origin',
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: MediaListResponse = await response.json();

			if (result.success) {
				// Append to existing files for load more
				setFiles((prev) => (currentOffset > 0 ? [...prev, ...result.data] : result.data));
				setHasMore(result.has_more);
				setOffset(currentOffset + result.data.length);
			}
		} catch (error) {
			console.error('[MediaPopup] Error loading files:', error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	/**
	 * Search files in media library
	 * Matches Voxel's search implementation with fulltext search
	 * Uses fetch() API for consistency with loadFiles
	 */
	const searchFiles = async (loadMore = false) => {
		if (!searchTerm.trim()) {
			setSearchResults([]);
			return;
		}

		try {
			const currentOffset = loadMore ? searchOffset : 0;
			setSearchLoading(!loadMore);
			setLoadingMore(loadMore);

			// Use helper function that handles subdirectory installations
			const ajaxUrl = getVoxelAjaxUrl();

			// Build query parameters
			const params = new URLSearchParams({
				action: 'list_media',
				search: searchTerm,
				offset: currentOffset.toString(),
			});

			const url = `${ajaxUrl}&${params.toString()}`;

			const response = await fetch(url, {
				method: 'GET',
				credentials: 'same-origin',
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: MediaListResponse = await response.json();

			if (result.success) {
				// Append to existing results for load more
				setSearchResults((prev) => (loadMore ? [...prev, ...result.data] : result.data));
				setSearchHasMore(result.has_more);
				setSearchOffset(currentOffset + result.data.length);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			setSearchResults([]);
		} finally {
			setSearchLoading(false);
			setLoadingMore(false);
		}
	};

	/**
	 * Handle file selection
	 * Single mode: replace selection
	 * Multiple mode: toggle selection
	 */
	const selectFile = (file: MediaFile) => {
		if (multiple) {
			// Toggle selection
			setSelected((prev) => {
				const newSelected = { ...prev };
				if (newSelected[file.id]) {
					delete newSelected[file.id];
				} else {
					newSelected[file.id] = file;
				}
				return newSelected;
			});
		} else {
			// Single selection
			setSelected({ [file.id]: file });
		}
	};

	/**
	 * Handle save button
	 * Supports both session files (_id) and existing files (id)
	 */
	const handleSave = () => {
		const selectedFiles = Object.values(selected).map((file) => {
			// Session file (has _id)
			if ('_id' in file && file._id) {
				return {
					source: 'new_upload' as const,
					_id: file._id,
					file: (file as SessionFile).item, // Original File object
					name: file.name,
					type: file.type,
					preview: file.preview,
				};
			}

			// Existing file (has id)
			return {
				source: 'existing' as const,
				id: (file as MediaFile).id,
				name: file.name,
				type: file.type,
				preview: file.preview,
			};
		});

		if (onSave) {
			onSave(selectedFiles as MediaFile[]);
		}
		setActive(false);
		setSelected({});
	};

	/**
	 * Handle popup blur/close
	 */
	const handleBlur = () => {
		setActive(false);
		setSelected({});
		if (onBlur) {
			onBlur();
		}
	};

	/**
	 * Handle clear button
	 */
	const handleClear = () => {
		setSelected({});
	};

	/**
	 * Get background style for file preview
	 * Matches Voxel's getStyle method
	 */
	const getStyle = (file: MediaFile | SessionFile): React.CSSProperties => {
		if (file.type.startsWith('image/') && file.preview) {
			return {
				backgroundImage: `url(${file.preview})`,
			};
		}
		return {};
	};

	/**
	 * Check if file is an image
	 */
	const isImage = (file: MediaFile | SessionFile): boolean => {
		return file.type.startsWith('image/');
	};

	/**
	 * Get session files from global cache
	 * Matches Voxel's sessionFiles() method
	 */
	const getSessionFiles = (): SessionFile[] => {
		if (!Array.isArray(window._vx_file_upload_cache)) {
			window._vx_file_upload_cache = [];
		}
		// Return copy (most recent first)
		return [...window._vx_file_upload_cache];
	};

	/**
	 * Handle session file selection
	 * Uses _id instead of id for session files
	 */
	const handleSessionFileSelect = (file: SessionFile) => {
		setSelected((prev) => {
			const newSelected = { ...prev };

			if (newSelected[file._id]) {
				// Deselect
				delete newSelected[file._id];
			} else {
				// Select
				if (!multiple) {
					// Single select - clear others
					return { [file._id]: file };
				}
				newSelected[file._id] = file;
			}

			return newSelected;
		});
	};

	/**
	 * Search when search term changes (debounced)
	 */
	useEffect(() => {
		if (!searchTerm.trim()) {
			setSearchResults([]);
			setSearchOffset(0);
			return;
		}

		const timer = setTimeout(() => {
			searchFiles(false);
		}, 300); // 300ms debounce

		return () => clearTimeout(timer);
	}, [searchTerm]);

	/**
	 * Focus search input when popup opens
	 */
	useEffect(() => {
		if (active && searchInputRef.current) {
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		}
	}, [active]);

	/**
	 * Eager Loading - Load files on component mount
	 *
	 * DEVIATION FROM VOXEL: Voxel uses lazy loading (loads on first open).
	 * We use eager loading for better perceived performance.
	 *
	 * Trade-off: Loads data even if user never opens popup, but results
	 * in instant popup opening (4s → 0s delay).
	 */
	useEffect(() => {
		// Load initial batch of files when component mounts
		loadFiles(0);
	}, []); // Empty dependency array = run once on mount

	// Determine which file list to show
	const displayFiles = searchTerm.trim() ? searchResults : files;
	const displayHasMore = searchTerm.trim() ? searchHasMore : hasMore;
	const displayLoading = searchTerm.trim() ? searchLoading : loading;

	/**
	 * Handle popup opening - matches Voxel @mousedown="openLibrary"
	 * Evidence: themes/voxel/templates/widgets/create-post/_media-popup.php line 3
	 */
	const openLibrary = (e: React.MouseEvent) => {
		e.preventDefault();
		setActive(true);
	};

	return (
		<>
			{/* Trigger button slot - matches Voxel _media-popup.php line 2-7 */}
			{/* Voxel uses @mousedown="openLibrary" to trigger popup */}
			{/* Using wrapper span with onMouseDown instead of cloneElement (not available in wp.element) */}
			<span ref={popupTargetRef} onMouseDown={openLibrary} style={{ cursor: 'pointer' }}>
				{children || (
					<a
						href="#"
						onClick={(e) => e.preventDefault()}
						className="ts-btn ts-btn-4 form-btn"
					>
						<svg
							width="80"
							height="80"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5C19.7426 20.75 20.75 19.7426 20.75 18.5V5.5C20.75 4.25736 19.7426 3.25 18.5 3.25H5.5ZM6.20103 13.6808C7.10463 12.4977 8.88749 12.5025 9.78466 13.6905L11.0002 15.3001C11.3508 15.7643 12.0734 15.6701 12.2931 15.1315L14.2708 10.2852C14.9381 8.65008 17.1428 8.3859 18.1774 9.81704L18.9656 10.9072C19.1505 11.1629 19.25 11.4705 19.25 11.786V13.8608V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V18.0031V16.088C4.75 15.7589 4.85819 15.439 5.05792 15.1775L6.20103 13.6808ZM7.01953 8.55957C7.01953 7.66211 7.74707 6.93457 8.64453 6.93457H8.65453C9.55199 6.93457 10.2795 7.66211 10.2795 8.55957C10.2795 9.45703 9.55199 10.1846 8.65453 10.1846H8.64453C7.74707 10.1846 7.01953 9.45703 7.01953 8.55957Z"
								fill="#343C54"
							/>
						</svg>
						<span>Media library</span>
					</a>
				)}
			</span>

			{/* Popup - matches Voxel _media-popup.php lines 8-116 */}
			{active && (
				<FormPopup
					isOpen={active}
					popupId="media-library-popup"
					target={externalTarget || popupTargetRef.current}
					onClose={handleBlur}
					onSave={handleSave}
					onClear={handleClear}
					saveLabel={saveLabel}
					popupClass="ts-media-library prmr-popup"
					showHeader={false}
					minWidth={minWidth}
				>
					{/* Search bar - sticky top */}
					<div className="ts-sticky-top uib b-bottom">
						<div className="ts-input-icon flexify">
							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"
									fill="currentColor"
								/>
							</svg>
							<input
								ref={searchInputRef}
								type="text"
								className="autofocus"
								placeholder="Search files"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					{/* File list */}
					<div
						className={`ts-form-group min-scroll ts-list-container ${displayLoading ? 'vx-disabled' : ''}`}
					>
						{displayFiles.length > 0 || getSessionFiles().length > 0 ? (
							<>
								<div className="ts-file-list">
									{/* Session files first (temporary uploads with upload icon) */}
									{getSessionFiles().map((file) => (
										<div
											key={file._id}
											className={`ts-file ${selected[file._id] ? 'selected' : ''} ${
												isImage(file) ? 'ts-file-img' : ''
											}`}
											style={getStyle(file)}
											onClick={() => handleSessionFileSelect(file)}
										>
											<div className="ts-file-info">
												<svg
													width="18"
													height="18"
													viewBox="0 0 18 18"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M9 0L0 5V13L9 18L18 13V5L9 0ZM16 12L9 16L2 12V6L9 2L16 6V12Z"
														fill="currentColor"
													/>
												</svg>
												<code>{file.name}</code>
											</div>
											{/* Upload icon badge (session files only) */}
											<div className="ts-remove-file">
												<svg
													width="20"
													height="20"
													viewBox="0 0 25 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M12.4239 3.25C12.2079 3.25 11.9908 3.33022 11.8251 3.49073L7.30978 7.88732C6.97375 8.21414 6.97375 8.74449 7.30978 9.07131C7.64581 9.39812 8.19149 9.39812 8.52752 9.07131L11.6739 6.00692L11.6739 15.9C11.6739 16.3556 12.0525 16.725 12.5197 16.725C12.9869 16.725 13.3655 16.3556 13.3655 15.9L13.3655 6.00692L16.5119 9.07131C16.8479 9.39812 17.3936 9.39812 17.7296 9.07131C18.0657 8.74449 18.0657 8.21414 17.7296 7.88732L13.2143 3.49073C13.0486 3.33022 12.8316 3.25 12.6156 3.25L12.4239 3.25Z"
														fill="currentColor"
													/>
													<path
														d="M5.17188 16C5.17188 15.5858 4.84402 15.25 4.43948 15.25C4.03495 15.25 3.70709 15.5858 3.70709 16V16.0549C3.70703 16.8531 3.70698 17.5055 3.76469 18.0316C3.82466 18.5774 3.95363 19.0607 4.24635 19.4857C4.54794 19.9226 4.94971 20.2516 5.44348 20.4865C5.91891 20.7134 6.47396 20.8128 7.08817 20.857C7.68568 20.9 8.42494 20.9 9.33715 20.9H15.7023C16.6145 20.9 17.3538 20.9 17.9513 20.857C18.5655 20.8128 19.1206 20.7134 19.596 20.4865C20.0898 20.2516 20.4915 19.9226 20.7931 19.4857C21.0858 19.0607 21.2148 18.5774 21.2748 18.0316C21.3325 17.5055 21.3325 16.8531 21.3324 16.0549V16C21.3324 15.5858 21.0046 15.25 20.6 15.25C20.1955 15.25 19.8676 15.5858 19.8676 16C19.8676 16.8631 19.8666 17.4573 19.818 17.9105C19.7703 18.355 19.6812 18.5956 19.5524 18.7816C19.4153 18.9782 19.2355 19.1296 19.0087 19.2351C18.7906 19.3355 18.4991 19.4049 17.9944 19.4431C17.4776 19.4821 16.8019 19.4833 15.7397 19.4833H9.29978C8.23757 19.4833 7.56186 19.4821 7.04512 19.4431C6.54041 19.4049 6.24886 19.3355 6.03081 19.2351C5.80404 19.1296 5.62416 18.9782 5.48711 18.7816C5.35829 18.5956 5.26921 18.355 5.22145 17.9105C5.17292 17.4573 5.17188 16.8631 5.17188 16Z"
														fill="currentColor"
													/>
												</svg>
											</div>
											{/* Checkmark badge (when selected) */}
											<div className="ts-remove-file ts-select-file">
												<svg
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M19.5455 6.4965C19.9848 6.93584 19.9848 7.64815 19.5455 8.08749L10.1286 17.5043C9.6893 17.9437 8.97699 17.9437 8.53765 17.5043L4.45451 13.4212C4.01517 12.9819 4.01516 12.2695 4.4545 11.8302C4.89384 11.3909 5.60616 11.3909 6.0455 11.8302L9.33315 15.1179L17.9545 6.4965C18.3938 6.05716 19.1062 6.05716 19.5455 6.4965Z"
														fill="#343C54"
													/>
												</svg>
											</div>
										</div>
									))}

									{/* Existing files from library */}
									{displayFiles.map((file) => (
										<div
											key={file.id}
											className={`ts-file ${selected[file.id] ? 'selected' : ''} ${
												isImage(file) ? 'ts-file-img' : ''
											}`}
											style={getStyle(file)}
											onClick={() => selectFile(file)}
										>
											<div className="ts-file-info">
												<svg
													width="18"
													height="18"
													viewBox="0 0 18 18"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M9 0L0 5V13L9 18L18 13V5L9 0ZM16 12L9 16L2 12V6L9 2L16 6V12Z"
														fill="currentColor"
													/>
												</svg>
												<code>{file.name}</code>
											</div>
											<div className="ts-remove-file ts-select-file">
												<svg
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M19.5455 6.4965C19.9848 6.93584 19.9848 7.64815 19.5455 8.08749L10.1286 17.5043C9.6893 17.9437 8.97699 17.9437 8.53765 17.5043L4.45451 13.4212C4.01517 12.9819 4.01516 12.2695 4.4545 11.8302C4.89384 11.3909 5.60616 11.3909 6.0455 11.8302L9.33315 15.1179L17.9545 6.4965C18.3938 6.05716 19.1062 6.05716 19.5455 6.4965Z"
														fill="#343C54"
													/>
												</svg>
											</div>
										</div>
									))}
								</div>

								{/* Load more button */}
								{displayHasMore && (
									<div>
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation(); // Prevent click from bubbling to backdrop
												if (searchTerm.trim()) {
													searchFiles(true);
												} else {
													loadFiles(offset);
												}
											}}
											className={`ts-btn ts-btn-4 ${loadingMore ? 'vx-pending' : ''}`}
										>
											<svg
												width="18"
												height="18"
												viewBox="0 0 25 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M21.6009 10.4593C22.001 10.3521 22.2384 9.94088 22.1312 9.54078C21.59 7.52089 20.3974 5.73603 18.7384 4.46302C17.0793 3.19001 15.0466 2.5 12.9555 2.5C10.8644 2.5 8.83164 3.19001 7.17262 4.46302C6.12405 5.26762 5.26179 6.2767 4.63257 7.42036L2.86504 6.92617C2.76093 6.89707 2.65423 6.89133 2.55153 6.9068C2.46222 6.91962 2.37374 6.94889 2.29039 6.99582C1.92945 7.19903 1.80158 7.65636 2.00479 8.0173L3.73942 11.0983C3.83701 11.2717 3.99946 11.3991 4.19104 11.4527C4.30333 11.4841 4.42023 11.4886 4.53266 11.4673C4.61373 11.4524 4.69254 11.4242 4.7657 11.383L7.84641 9.64831C8.11073 9.49948 8.25936 9.20608 8.22302 8.90493C8.18668 8.60378 7.9725 8.35417 7.68037 8.27249L6.1241 7.83737C6.6343 6.99996 7.29751 6.2579 8.08577 5.65305C9.48282 4.58106 11.1946 4 12.9555 4C14.7164 4 16.4282 4.58106 17.8252 5.65305C19.2223 6.72504 20.2266 8.22807 20.6823 9.92901C20.7895 10.3291 21.2008 10.5665 21.6009 10.4593Z"
													fill="#343C54"
												/>
												<path
													d="M4.30739 13.5387C3.90729 13.6459 3.66985 14.0572 3.77706 14.4573C4.31829 16.4771 5.51089 18.262 7.16991 19.535C8.82892 20.808 10.8616 21.498 12.9528 21.498C15.0439 21.498 17.0766 20.808 18.7356 19.535C19.7859 18.7291 20.6493 17.7181 21.2787 16.5722L23.0083 17.0557C23.1218 17.0961 23.2447 17.1091 23.3661 17.0917C23.5554 17.0658 23.7319 16.968 23.8546 16.8116C24.0419 16.573 24.0669 16.245 23.9181 15.9807L22.1835 12.8996C22.0859 12.7263 21.9234 12.5988 21.7319 12.5453C21.64 12.5196 21.5451 12.5119 21.4521 12.5216C21.3493 12.5317 21.2488 12.5629 21.1571 12.6146L18.0764 14.3493C17.7155 14.5525 17.5876 15.0099 17.7909 15.3708C17.9016 15.5675 18.0879 15.695 18.2929 15.7373L19.7875 16.1552C19.2768 16.9949 18.6125 17.7388 17.8225 18.345C16.4255 19.417 14.7137 19.998 12.9528 19.998C11.1918 19.998 9.4801 19.417 8.08305 18.345C6.686 17.273 5.68171 15.77 5.22595 14.069C5.11874 13.6689 4.70749 13.4315 4.30739 13.5387Z"
													fill="#343C54"
												/>
											</svg>
											Load more
										</a>
									</div>
								)}
							</>
						) : (
							<div className="ts-empty-user-tab">
								<p>{displayLoading ? 'Loading files...' : 'No files found'}</p>
							</div>
						)}
					</div>
				</FormPopup>
			)}
		</>
	);
}
