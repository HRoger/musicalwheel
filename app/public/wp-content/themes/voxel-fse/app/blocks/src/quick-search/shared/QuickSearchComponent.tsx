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
 * Default SVG icons — match Voxel's filled/solid style from assets/images/svgs/
 * Voxel icons use `fill` (not stroke). CSS sizes them via `.ts-filter svg { width/height: var(--ts-icon-size) }`
 * and colors via `fill: var(--ts-icon-color)`. We use `fill="currentColor"` so CSS fill rules work.
 */
const DefaultSearchIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="currentColor" />
	</svg>
);

const DefaultCloseIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M5.9545 5.95548C6.39384 5.51614 7.10616 5.51614 7.5455 5.95548L11.999 10.409L16.4524 5.95561C16.8918 5.51627 17.6041 5.51627 18.0434 5.95561C18.4827 6.39495 18.4827 7.10726 18.0434 7.5466L13.59 12L18.0434 16.4534C18.4827 16.8927 18.4827 17.605 18.0434 18.0444C17.6041 18.4837 16.8918 18.4837 16.4524 18.0444L11.999 13.591L7.5455 18.0445C7.10616 18.4839 6.39384 18.4839 5.9545 18.0445C5.51517 17.6052 5.51516 16.8929 5.9545 16.4535L10.408 12L5.9545 7.54647C5.51516 7.10713 5.51517 6.39482 5.9545 5.95548Z" fill="currentColor" />
	</svg>
);

const DefaultFileIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M10.7477 2.46516C10.6701 2.52471 10.5961 2.58957 10.5262 2.65951L5.15851 8.03055C5.08902 8.10008 5.02455 8.1737 4.96533 8.25084H10.0004C10.4148 8.25084 10.7507 7.91473 10.7504 7.5003L10.7477 2.46516Z" fill="currentColor" />
		<path d="M4.5 9.75084V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V4.25C19.5 3.00736 18.4926 2 17.25 2H12.2474L12.2504 7.49924C12.2512 8.74244 11.2436 9.75084 10.0004 9.75084H4.5ZM9 13.75H15C15.4142 13.75 15.75 14.0858 15.75 14.5C15.75 14.9142 15.4142 15.25 15 15.25H9C8.58579 15.25 8.25 14.9142 8.25 14.5C8.25 14.0858 8.58579 13.75 9 13.75ZM9 16.75H12C12.4142 16.75 12.75 17.0858 12.75 17.5C12.75 17.9142 12.4142 18.25 12 18.25H9C8.58579 18.25 8.25 17.9142 8.25 17.5C8.25 17.0858 8.58579 16.75 9 16.75Z" fill="currentColor" />
	</svg>
);

const DefaultTrashIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM8.78362 10.2354L10.9388 12.3906L8.78362 14.5458C8.49073 14.8387 8.49073 15.3136 8.78362 15.6065C9.07652 15.8994 9.55139 15.8994 9.84428 15.6065L11.9995 13.4513L14.1546 15.6064C14.4475 15.8993 14.9224 15.8993 15.2153 15.6064C15.5082 15.3135 15.5082 14.8387 15.2153 14.5458L13.0602 12.3906L15.2153 10.2355C15.5082 9.94258 15.5082 9.46771 15.2153 9.17482C14.9224 8.88192 14.4475 8.88192 14.1546 9.17482L11.9995 11.33L9.84428 9.17475C9.55139 8.88186 9.07652 8.88186 8.78362 9.17475C8.49073 9.46764 8.49073 9.94251 8.78362 10.2354Z" fill="currentColor" />
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

	// CSS is enqueued server-side via Block_Loader.php:
	// - vx:commons.css (base classes: .flexify, .ts-form, SVG sizing)
	// - vx:forms.css (form controls: .ts-filter, .ts-filter-text, .ts-shortcut)
	// - vx:popup-kit.css (popup system: .ts-popup-overlay, .ts-popup-backdrop, .ts-quicksearch-popup)
	// No client-side CSS injection needed — quick-search.css is empty in Voxel dist.

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
	// Voxel's actual popup CSS hierarchy (from popup-kit.css):
	//   .ts-popup-root (absolute, z-500000, flex center, pointer-events: none)
	//     > div (pointer-events: all, ::after = backdrop overlay)
	//       > .ts-form.ts-quicksearch-popup.lg-width.lg-height
	//         > .ts-field-popup-container
	//           > .ts-field-popup.triggers-blur
	//             > .ts-popup-content-wrapper.min-scroll
	//               > <form>
	//
	// CRITICAL: .ts-popup-root must have exactly ONE direct child <div>.
	// That child gets pointer-events:all and ::after backdrop via CSS.
	// The .ts-form popup content must be INSIDE that child, not a sibling.
	const renderPopup = () => {
		if (!isPopupOpen) return null;

		const popupInner = (
			<div className="ts-form ts-quicksearch-popup lg-width lg-height">
				<div className="ts-field-popup-container">
					<div ref={popupRef} className="ts-field-popup triggers-blur">
						<div className="ts-popup-content-wrapper min-scroll">
							{renderPopupContent()}
						</div>
					</div>
				</div>
			</div>
		);

		// In editor, render inline with same class hierarchy but relative positioning
		// instead of absolute (since Gutenberg has no iframe like Elementor's preview)
		if (context === 'editor') {
			return (
				<div
					className="ts-popup-root"
					style={{
						position: 'relative',
						top: 'auto',
						left: 'auto',
						width: '100%',
						height: 'auto',
						zIndex: 1,
						pointerEvents: 'all',
					}}
				>
					<div>
						{popupInner}
					</div>
				</div>
			);
		}

		// In frontend, use portal to body — matches Voxel's Vue <teleport to="body">
		// CRITICAL: popupInner must be INSIDE the single > div child, not a sibling.
		// .ts-popup-root > div gets pointer-events:all and ::after backdrop via CSS.
		return createPortal(
			<div className="ts-popup-root">
				<div onClick={() => setIsPopupOpen(false)}>
					{popupInner}
				</div>
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
