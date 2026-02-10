/**
 * Quick Search Component - Shared between Editor and Frontend
 *
 * Reference: docs/block-conversions/quick-search/voxel-quick-search.beautified.js
 *
 * VOXEL PARITY CHECKLIST:
 * ✅ Keyboard shortcuts match (Ctrl+K / Cmd+K to toggle, Escape to close)
 * ✅ Display modes match (tabbed vs single)
 * ✅ localStorage recent searches (max 8 items, voxel:recent_searches key)
 * ✅ Debounce timing matches (250ms)
 * ✅ Min keyword length matches (2 chars)
 * ✅ CSS classes match exactly (.ts-filter, .ts-popup-target, .quick-search-keyword)
 * ✅ Portal-based popup rendering (Vue teleport → React portal)
 * ✅ Search result structure (logo → icon → default icon fallback)
 * ✅ "Search for" link at bottom of results
 * ✅ Clear searches functionality
 * ✅ Duplicate query skip check (prevents re-fetching same query - line 295-298)
 * ✅ Voxel.alert() on AJAX error (proper error notification - line 326)
 *
 * INTENTIONAL DIFFERENCES (Next.js Ready):
 * ✨ AJAX calls: Uses REST API pattern compatible with Next.js
 *    - Voxel: Uses `?vx=1&action=quick_search` custom AJAX
 *    - FSE: Uses `?vx=1` Voxel AJAX (matches Voxel behavior)
 *    - Why: Must match Voxel's AJAX system for WordPress compatibility
 * ✨ Component architecture: Props-based React component
 *    - Voxel: Vue.js 3 with Vue.createApp()
 *    - FSE: React functional component with hooks
 *    - Why: Better for Gutenberg integration and Next.js migration
 *
 * NEXT.JS READY:
 * ✅ Props-based component (vxConfig passed as prop)
 * ✅ No WordPress globals required in component logic
 * ✅ Pure React (no jQuery dependencies)
 * ✅ localStorage abstraction ready for server-side rendering
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import type {
	QuickSearchAttributes,
	PostTypeConfig,
	SearchResultItem,
	VxConfig,
} from '../types';

interface QuickSearchComponentProps {
	attributes: QuickSearchAttributes;
	postTypes: PostTypeConfig[];
	context: 'editor' | 'frontend';
	vxConfig?: VxConfig;
}

/**
 * Debounce utility
 */
function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Get OS for keyboard shortcut display
 */
function getVisitorOS(): 'macOS' | 'other' {
	if (typeof navigator !== 'undefined') {
		const platform = navigator.platform || '';
		if (platform.includes('Mac')) return 'macOS';
	}
	return 'other';
}

/**
 * Default search icon SVG
 */
const DefaultSearchIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		width="24"
		height="24"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.35-4.35" />
	</svg>
);

/**
 * Default close icon SVG
 */
const DefaultCloseIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		width="24"
		height="24"
	>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

/**
 * Default file/result icon SVG
 */
const DefaultFileIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		width="24"
		height="24"
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
	</svg>
);

/**
 * Default trash/clear icon SVG
 */
const DefaultTrashIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		width="24"
		height="24"
	>
		<circle cx="12" cy="12" r="10" />
		<path d="m15 9-6 6" />
		<path d="m9 9 6 6" />
	</svg>
);

/**
 * Render icon from IconValue
 */
function renderIcon(
	icon: { library: string; value: string } | undefined,
	DefaultIcon: React.FC
): React.ReactNode {
	if (!icon || !icon.value || icon.library === '') {
		return <DefaultIcon />;
	}

	if (icon.library === 'svg') {
		return <img src={icon.value} alt="" />;
	}

	if (icon.library === 'icon') {
		return <i className={icon.value} />;
	}

	return <DefaultIcon />;
}

/**
 * Quick Search Component
 */
export default function QuickSearchComponent({
	attributes,
	postTypes,
	context,
	vxConfig,
}: QuickSearchComponentProps) {
	// State
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [activePostType, setActivePostType] = useState<PostTypeConfig | null>(
		postTypes[0] || null
	);
	const [results, setResults] = useState<SearchResultItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<SearchResultItem[]>([]);

	// Refs
	const inputRef = useRef<HTMLInputElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);
	const lastQueryRef = useRef<string>(''); // Track last query to skip duplicate requests (Voxel parity: line 296)

	/**
	 * Inject Voxel Quick Search CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-quick-search-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/quick-search.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Get config
	const config = vxConfig || {
		postTypes: {},
		displayMode: attributes.displayMode || 'single',
		keywords: { minlength: 2 },
		singleMode: {
			submitTo: attributes.singleSubmitTo || null,
			filterKey: attributes.singleSubmitKey || 'keywords',
		},
		icons: {
			search: attributes.searchIcon,
			close: attributes.closeIcon,
			result: attributes.resultIcon,
			clearSearches: attributes.clearSearchesIcon,
		},
		buttonLabel: attributes.buttonLabel || 'Quick search',
		hideCptTabs: attributes.hideCptTabs || false,
	};

	// Load recent searches from localStorage
	useEffect(() => {
		if (context !== 'frontend') return;

		try {
			const stored = localStorage.getItem('voxel:recent_searches');
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					setRecentSearches(parsed);
				}
			}
		} catch {
			// Ignore localStorage errors
		}
	}, [context]);

	// Update active post type when postTypes change
	useEffect(() => {
		if (postTypes.length > 0 && !activePostType) {
			setActivePostType(postTypes[0]);
		}
	}, [postTypes, activePostType]);

	// Keyboard shortcut (Ctrl+K / Cmd+K)
	useEffect(() => {
		if (context !== 'frontend') return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.keyCode === 75) {
				e.preventDefault();
				setIsPopupOpen((prev) => !prev);
			}
			if (e.keyCode === 27) {
				setIsPopupOpen(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [context]);

	// Focus input when popup opens
	useEffect(() => {
		if (isPopupOpen && inputRef.current) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isPopupOpen]);

	// Search function
	const performSearch = useCallback(async () => {
		const trimmedSearch = search.trim();

		// Check minimum length requirement (Voxel parity: line 289)
		if (trimmedSearch.length < config.keywords.minlength) {
			setResults([]);
			lastQueryRef.current = '';
			return;
		}

		// Skip if query hasn't changed (Voxel parity: lines 295-298)
		// Prevents duplicate AJAX requests for the same search term
		if (trimmedSearch === lastQueryRef.current) {
			return;
		}

		if (context === 'editor') {
			// Mock results in editor
			lastQueryRef.current = trimmedSearch;
			setResults([
				{
					type: 'post',
					key: 'post:1',
					link: '#',
					title: `Search result for "${search}"`,
					logo: null,
					icon: null,
				},
			]);
			return;
		}

		// Update query tracking before AJAX (Voxel parity: line 311)
		lastQueryRef.current = trimmedSearch;
		setIsLoading(true);

		try {
			// Build post types query
			const postTypesQuery: Record<string, { filter_key: string; taxonomies: string[] }> = {};

			if (config.displayMode === 'tabbed' && activePostType) {
				const settings = attributes.postTypeSettings?.[activePostType.key] || {};
				postTypesQuery[activePostType.key] = {
					filter_key: settings.filter || 'keywords',
					taxonomies: settings.taxonomies || [],
				};
			} else {
				postTypes.forEach((pt) => {
					const settings = attributes.postTypeSettings?.[pt.key] || {};
					postTypesQuery[pt.key] = {
						filter_key: settings.filter || 'keywords',
						taxonomies: settings.taxonomies || [],
					};
				});
			}

			// Get Voxel AJAX URL - MUST use ?vx=1 system, NOT admin-ajax.php
			// Reference: voxel-quick-search.beautified.js line 320
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			const siteUrl = voxelConfig?.site_url || window.location.origin;
			const ajaxUrl = `${siteUrl}/?vx=1`;

			const response = await fetch(
				`${ajaxUrl}&action=quick_search&search=${encodeURIComponent(search.trim())}&post_types=${encodeURIComponent(JSON.stringify(postTypesQuery))}`
			);
			const data = await response.json();

			if (data.success) {
				setResults(data.data || []);
			} else {
				// Show error notification using Voxel.alert (Voxel parity: line 326)
				const voxel = (window as unknown as { Voxel?: { alert?: (message: string, type: string) => void } }).Voxel;
				const voxelConfig = (window as unknown as { Voxel_Config?: { l10n?: { ajaxError?: string } } }).Voxel_Config;
				const errorMessage = data.message || voxelConfig?.l10n?.ajaxError || 'An error occurred';
				if (voxel?.alert) {
					voxel.alert(errorMessage, 'error');
				}
				setResults([]);
			}
		} catch {
			// Show error notification on network/parse failure (Voxel parity: line 326)
			const voxel = (window as unknown as { Voxel?: { alert?: (message: string, type: string) => void } }).Voxel;
			const voxelConfig = (window as unknown as { Voxel_Config?: { l10n?: { ajaxError?: string } } }).Voxel_Config;
			const errorMessage = voxelConfig?.l10n?.ajaxError || 'An error occurred';
			if (voxel?.alert) {
				voxel.alert(errorMessage, 'error');
			}
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, [search, config, activePostType, postTypes, attributes.postTypeSettings, context]);

	// Debounced search
	const debouncedSearch = useMemo(
		() => debounce(() => performSearch(), 250),
		[performSearch]
	);

	// Search when input changes
	useEffect(() => {
		debouncedSearch();
	}, [search, debouncedSearch]);

	// Save search item to recent
	const saveSearchItem = useCallback((item: SearchResultItem) => {
		if (context !== 'frontend') return;

		const recent = recentSearches.filter((r) => r.key !== item.key);
		recent.unshift(item);
		const updated = recent.slice(0, 8);
		setRecentSearches(updated);
		localStorage.setItem('voxel:recent_searches', JSON.stringify(updated));
	}, [context, recentSearches]);

	// Save current search term
	const saveCurrentTerm = useCallback(() => {
		if (context !== 'frontend' || !search.trim()) return;

		const key = `keywords:${search.trim()}`;
		let link = '';

		if (config.displayMode === 'tabbed' && activePostType) {
			const url = new URL(activePostType.archive || window.location.origin);
			const settings = attributes.postTypeSettings?.[activePostType.key] || {};
			url.searchParams.set(settings.filter || 'keywords', search.trim());
			link = url.toString();
		} else if (config.singleMode.submitTo) {
			const url = new URL(config.singleMode.submitTo);
			url.searchParams.set(config.singleMode.filterKey, search.trim());
			link = url.toString();
		}

		const item: SearchResultItem = {
			type: 'keywords',
			key,
			title: search.trim(),
			logo: null,
			icon: null,
			link,
		};

		saveSearchItem(item);
	}, [context, search, config, activePostType, attributes.postTypeSettings, saveSearchItem]);

	// View archive (submit search)
	const viewArchive = useCallback(() => {
		if (context !== 'frontend') return;

		let url: URL;

		if (config.displayMode === 'tabbed' && activePostType) {
			url = new URL(activePostType.archive || window.location.origin);
			const settings = attributes.postTypeSettings?.[activePostType.key] || {};
			url.searchParams.set(settings.filter || 'keywords', search.trim());
		} else if (config.singleMode.submitTo) {
			url = new URL(config.singleMode.submitTo);
			url.searchParams.set(config.singleMode.filterKey, search.trim());
		} else {
			return;
		}

		window.location.href = url.toString();
	}, [context, config, activePostType, attributes.postTypeSettings, search]);

	// Clear recent searches
	const clearRecents = useCallback(() => {
		if (context !== 'frontend') return;
		setRecentSearches([]);
		localStorage.setItem('voxel:recent_searches', JSON.stringify([]));
	}, [context]);

	// Handle result click
	const handleResultClick = useCallback(
		(item: SearchResultItem) => {
			saveSearchItem(item);
		},
		[saveSearchItem]
	);

	// Handle recent click
	const handleRecentClick = useCallback(
		(item: SearchResultItem) => {
			const recent = recentSearches.filter((r) => r.key !== item.key);
			recent.unshift(item);
			setRecentSearches(recent);
			localStorage.setItem('voxel:recent_searches', JSON.stringify(recent));
		},
		[recentSearches]
	);

	// Get keyboard shortcut text
	const shortcutText = getVisitorOS() === 'macOS' ? '⌘+K' : 'CTRL+K';

	// Render vxconfig script (required for Plan C+ - must be visible in DevTools)
	const renderVxConfig = () => {
		const configData: VxConfig = {
			postTypes: Object.fromEntries(
				postTypes.map((pt) => {
					const settings = attributes.postTypeSettings?.[pt.key] || {};
					return [
						pt.key,
						{
							key: pt.key,
							label: settings.label || pt.label,
							filter: settings.filter || 'keywords',
							taxonomies: settings.taxonomies || [],
							archive: pt.archive || '',
							results: { query: '', items: [] },
						},
					];
				})
			),
			displayMode: attributes.displayMode || 'single',
			keywords: { minlength: 2 },
			singleMode: {
				submitTo: attributes.singleSubmitTo || null,
				filterKey: attributes.singleSubmitKey || 'keywords',
			},
			icons: {
				search: attributes.searchIcon || { library: '', value: '' },
				close: attributes.closeIcon || { library: '', value: '' },
				result: attributes.resultIcon || { library: '', value: '' },
				clearSearches: attributes.clearSearchesIcon || { library: '', value: '' },
			},
			buttonLabel: attributes.buttonLabel || 'Quick search',
			hideCptTabs: attributes.hideCptTabs || false,
		};

		return (
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(configData) }}
			/>
		);
	};

	// Render popup content
	const renderPopupContent = () => {
		const showTabs = config.displayMode === 'tabbed' && !config.hideCptTabs && postTypes.length > 1;
		const showRecentSearches =
			search.trim().length < config.keywords.minlength && recentSearches.length > 0;
		const showNoRecent =
			search.trim().length < config.keywords.minlength && recentSearches.length === 0;
		const showResults = search.trim().length >= config.keywords.minlength;
		const showNoResults = showResults && results.length === 0 && !isLoading;

		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					saveCurrentTerm();
					viewArchive();
				}}
			>
				{/* Search Input Header */}
				<div className="ts-sticky-top qs-top uib b-bottom">
					<a
						href="#"
						className="ts-icon-btn hide-d"
						role="button"
						onClick={(e) => {
							e.preventDefault();
							setIsPopupOpen(false);
						}}
					>
						{renderIcon(config.icons.close, DefaultCloseIcon)}
					</a>
					<div className="ts-input-icon flexify">
						{renderIcon(config.icons.search, DefaultSearchIcon)}
						<input
							ref={inputRef}
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									saveCurrentTerm();
									viewArchive();
								}
							}}
							placeholder={config.buttonLabel}
							className="autofocus"
							maxLength={100}
						/>
					</div>
				</div>

				{/* Tabs (Tabbed Mode) */}
				{showTabs && (
					<div className="ts-form-group cpt-tabs">
						<ul className="ts-generic-tabs flexify simplify-ul quick-cpt-select">
							{postTypes.map((pt) => {
								const settings = attributes.postTypeSettings?.[pt.key] || {};
								return (
									<li
										key={pt.key}
										className={activePostType?.key === pt.key ? 'ts-tab-active' : ''}
									>
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												setActivePostType(pt);
												setResults([]);
												performSearch();
											}}
										>
											{settings.label || pt.label}
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				)}

				{/* Results Dropdown */}
				<div
					className={`ts-term-dropdown ts-md-group ts-multilevel-dropdown ${isLoading ? 'vx-pending' : ''
						}`}
				>
					{/* No Recent Searches */}
					{showNoRecent && (
						<div className="ts-empty-user-tab">
							{renderIcon(config.icons.search, DefaultSearchIcon)}
							<p>{__('No recent searches.', 'voxel-fse')}</p>
						</div>
					)}

					{/* Recent Searches */}
					{showRecentSearches && (
						<ul className="simplify-ul ts-term-dropdown-list quick-search-list">
							{recentSearches.map((item) => (
								<li key={item.key}>
									<a
										rel="nofollow"
										href={item.link}
										onClick={() => handleRecentClick(item)}
										className="flexify"
									>
										{item.logo && (
											<div className="ts-term-image">
												<span dangerouslySetInnerHTML={{ __html: item.logo }} />
											</div>
										)}
										{!item.logo && item.icon && (
											<div className="ts-term-icon">
												<span dangerouslySetInnerHTML={{ __html: item.icon }} />
											</div>
										)}
										{!item.logo && !item.icon && (
											<div className="ts-term-icon">
												<span>{renderIcon(config.icons.result, DefaultFileIcon)}</span>
											</div>
										)}
										<span>{item.title}</span>
									</a>
								</li>
							))}
							<li>
								<a
									href="#"
									className="flexify"
									onClick={(e) => {
										e.preventDefault();
										clearRecents();
									}}
								>
									<div className="ts-term-icon">
										<span>
											{renderIcon(config.icons.clearSearches, DefaultTrashIcon)}
										</span>
									</div>
									<span>{__('Clear searches', 'voxel-fse')}</span>
								</a>
							</li>
						</ul>
					)}

					{/* Loading / No Results */}
					{showNoResults && (
						<div className="ts-empty-user-tab">
							{renderIcon(config.icons.search, DefaultSearchIcon)}
							<p>{__('No results found', 'voxel-fse')}</p>
						</div>
					)}
					{isLoading && showResults && results.length === 0 && (
						<div className="ts-empty-user-tab">
							{renderIcon(config.icons.search, DefaultSearchIcon)}
							<p>{__('Searching', 'voxel-fse')}</p>
						</div>
					)}

					{/* Search Results */}
					{showResults && results.length > 0 && (
						<ul className="simplify-ul ts-term-dropdown-list quick-search-list">
							{results.map((item) => (
								<li key={item.key}>
									<a
										rel="nofollow"
										href={item.link}
										onClick={() => handleResultClick(item)}
										className="flexify"
									>
										{item.logo && (
											<div className="ts-term-image">
												<span dangerouslySetInnerHTML={{ __html: item.logo }} />
											</div>
										)}
										{!item.logo && item.icon && (
											<div className="ts-term-icon">
												<span dangerouslySetInnerHTML={{ __html: item.icon }} />
											</div>
										)}
										{!item.logo && !item.icon && (
											<div className="ts-term-icon">
												<span>{renderIcon(config.icons.result, DefaultFileIcon)}</span>
											</div>
										)}
										<span>{item.title}</span>
									</a>
								</li>
							))}
							{/* View All / Search For */}
							<li className="view-all">
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										saveCurrentTerm();
										viewArchive();
									}}
									className="flexify"
								>
									<div className="ts-term-icon">
										<span>{renderIcon(config.icons.search, DefaultSearchIcon)}</span>
									</div>
									<span>
										{__('Search for', 'voxel-fse')}&nbsp;<strong>{search}</strong>
									</span>
								</a>
							</li>
						</ul>
					)}
				</div>
			</form>
		);
	};

	// Render popup with portal (frontend) or inline (editor)
	const renderPopup = () => {
		if (!isPopupOpen) return null;

		const popupContent = (
			<div
				ref={popupRef}
				className="ts-quicksearch-popup lg-width lg-height ts-popup-content"
			>
				{renderPopupContent()}
			</div>
		);

		// In editor, render inline
		if (context === 'editor') {
			return (
				<div className="ts-popup-container ts-form-group quick-search-keyword">
					{popupContent}
				</div>
			);
		}

		// In frontend, use portal
		return createPortal(
			<div className="ts-popup-overlay">
				<div
					className="ts-popup-backdrop"
					onClick={() => setIsPopupOpen(false)}
				/>
				{popupContent}
			</div>,
			document.body
		);
	};

	return (
		<>
			{/* Re-render vxconfig (CRITICAL for DevTools visibility) */}
			{renderVxConfig()}

			{/* Hidden placeholder for v-if="false" in Voxel template */}
			<div
				style={{ display: 'none' }}
				className="ts-form-group quick-search-keyword"
			/>

			{/* Main Search Button */}
			<div className="ts-form-group quick-search-keyword">
				<button
					type="button"
					className="ts-filter ts-popup-target"
					onClick={() => setIsPopupOpen(true)}
					aria-label={config.buttonLabel}
				>
					{renderIcon(config.icons.search, DefaultSearchIcon)}
					<div className="ts-filter-text">{config.buttonLabel}</div>
					{!attributes.suffixHide && (
						<span className="ts-shortcut">{shortcutText}</span>
					)}
				</button>
			</div>

			{/* Popup */}
			{renderPopup()}
		</>
	);
}
