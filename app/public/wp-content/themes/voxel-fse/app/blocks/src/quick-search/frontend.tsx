/**
 * Quick Search Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/quick-search/voxel-quick-search.beautified.js
 *
 * VOXEL PARITY:
 * ✅ Renders HTML structure with matching CSS classes
 * ✅ Listens for voxel:markup-update event for AJAX content
 * ✅ Prevents double-initialization with data-hydrated check
 * ✅ Uses Voxel's ?vx=1 AJAX system (NOT admin-ajax.php)
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ REST API endpoint for post type configuration
 * ✅ Component receives normalized data as props
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import QuickSearchComponent from './shared/QuickSearchComponent';
import type { QuickSearchAttributes, PostTypeConfig, VxConfig } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): VxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized VxConfig
 */
function normalizeConfig(raw: any): VxConfig {
	// Normalize postTypes (handle both object and array formats)
	const postTypes: VxConfig['postTypes'] = {};
	const rawPostTypes = raw.postTypes ?? raw.post_types ?? {};

	if (Array.isArray(rawPostTypes)) {
		// REST API might return array format
		rawPostTypes.forEach((pt: any) => {
			const key = pt.key ?? pt.slug ?? pt.id;
			postTypes[key] = {
				key,
				label: pt.label ?? pt.name ?? key,
				filter: pt.filter ?? pt.filter_key ?? 'keywords',
				taxonomies: pt.taxonomies ?? [],
				archive: pt.archive ?? pt.archive_url ?? '',
				results: pt.results ?? { query: '', items: [] },
			};
		});
	} else if (typeof rawPostTypes === 'object') {
		// vxconfig uses object format
		Object.entries(rawPostTypes).forEach(([key, pt]: [string, any]) => {
			postTypes[key] = {
				key: pt.key ?? key,
				label: pt.label ?? pt.name ?? key,
				filter: pt.filter ?? pt.filter_key ?? 'keywords',
				taxonomies: pt.taxonomies ?? [],
				archive: pt.archive ?? pt.archive_url ?? '',
				results: pt.results ?? { query: '', items: [] },
			};
		});
	}

	return {
		postTypes,
		displayMode: raw.displayMode ?? raw.display_mode ?? 'single',
		keywords: {
			minlength: raw.keywords?.minlength ?? raw.keywords?.min_length ?? 2,
		},
		singleMode: {
			submitTo: raw.singleMode?.submitTo ?? raw.single_mode?.submit_to ?? null,
			filterKey: raw.singleMode?.filterKey ?? raw.single_mode?.filter_key ?? 'keywords',
		},
		icons: {
			search: raw.icons?.search ?? { library: '', value: '' },
			close: raw.icons?.close ?? { library: '', value: '' },
			result: raw.icons?.result ?? { library: '', value: '' },
			clearSearches: raw.icons?.clearSearches ?? raw.icons?.clear_searches ?? { library: '', value: '' },
		},
		buttonLabel: raw.buttonLabel ?? raw.button_label ?? 'Quick search',
		hideCptTabs: raw.hideCptTabs ?? raw.hide_cpt_tabs ?? false,
	};
}

/**
 * Fetch post types configuration from REST API
 */
async function fetchPostTypes(postTypeKeys: string[]): Promise<PostTypeConfig[]> {
	if (!postTypeKeys || postTypeKeys.length === 0) {
		return [];
	}

	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/quick-search/post-types?post_types=${encodeURIComponent(postTypeKeys.join(','))}`;

	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data.postTypes || [];
	} catch (error) {
		console.error('Failed to fetch post types:', error);
		return [];
	}
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: VxConfig): QuickSearchAttributes {
	// Extract post type keys and settings from config
	const postTypes = Object.keys(config.postTypes || {});
	const postTypeSettings: Record<string, { label: string; filter: string; taxonomies: string[] }> = {};

	Object.entries(config.postTypes || {}).forEach(([key, pt]) => {
		postTypeSettings[key] = {
			label: pt.label || key,
			filter: pt.filter || 'keywords',
			taxonomies: pt.taxonomies || [],
		};
	});

	return {
		blockId: '',
		postTypes,
		postTypeSettings,
		buttonLabel: config.buttonLabel || 'Quick search',
		displayMode: config.displayMode || 'single',
		hideCptTabs: config.hideCptTabs || false,
		singleSubmitTo: config.singleMode?.submitTo || '',
		singleSubmitKey: config.singleMode?.filterKey || 'keywords',
		searchIcon: config.icons?.search || { library: '', value: '' },
		closeIcon: config.icons?.close || { library: '', value: '' },
		resultIcon: config.icons?.result || { library: '', value: '' },
		clearSearchesIcon: config.icons?.clearSearches || { library: '', value: '' },
		// Style attributes with defaults
		buttonPadding: {},
		buttonPadding_tablet: {},
		buttonPadding_mobile: {},
		buttonHeight: 50,
		buttonHeight_tablet: 0,
		buttonHeight_mobile: 0,
		buttonBackground: '',
		buttonTextColor: '',
		buttonBorderRadius: 5,
		buttonIconColor: '',
		buttonIconSize: 24,
		buttonIconSpacing: 10,
		buttonBackgroundHover: '',
		buttonTextColorHover: '',
		buttonBorderColorHover: '',
		buttonIconColorHover: '',
		buttonBackgroundFilled: '',
		buttonTextColorFilled: '',
		buttonIconColorFilled: '',
		buttonBorderColorFilled: '',
		buttonBorderWidthFilled: 0,
		suffixHide: false,
		suffixPadding: { top: 2, right: 8, bottom: 2, left: 8 },
		suffixTextColor: '',
		suffixBackground: '',
		suffixBorderRadius: 50,
		suffixMargin: 0,
		tabsJustify: 'center',
		tabsPadding: {},
		tabsMargin: { top: 10, right: 0, bottom: 10, left: 0 },
		tabsTextColor: '',
		tabsActiveTextColor: '',
		tabsBackground: '',
		tabsActiveBackground: '',
		tabsBorderRadius: 0,
		tabsActiveBorderColor: '',
		popupCustomEnable: false,
		popupBackdropBackground: '',
		popupPointerEvents: false,
		popupCenterPosition: false,
		popupMinWidth: 538,
		popupMaxWidth: 0,
		popupMaxHeight: 0,
		popupTopBottomMargin: 0,
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
	};
}

/**
 * Wrapper component that handles data fetching
 */
interface QuickSearchWrapperProps {
	vxConfig: VxConfig;
	attributes: QuickSearchAttributes;
}

function QuickSearchWrapper({ vxConfig, attributes }: QuickSearchWrapperProps) {
	const [postTypes, setPostTypes] = useState<PostTypeConfig[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadPostTypes() {
			setIsLoading(true);

			try {
				// Get post type keys from vxconfig
				const postTypeKeys = Object.keys(vxConfig.postTypes || {});

				// Fetch full post type data from REST API
				const data = await fetchPostTypes(postTypeKeys);

				if (!cancelled) {
					// Merge REST API data with vxconfig settings
					const mergedPostTypes = data.map((pt) => {
						const configPt = vxConfig.postTypes?.[pt.key];
						return {
							...pt,
							label: configPt?.label || pt.label,
							filter: configPt?.filter || pt.filter || 'keywords',
							taxonomies: configPt?.taxonomies || pt.taxonomies || [],
						};
					});

					setPostTypes(mergedPostTypes);
				}
			} catch (err) {
				console.error('Failed to load post types:', err);
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPostTypes();

		return () => {
			cancelled = true;
		};
	}, [vxConfig]);

	// Loading state
	if (isLoading) {
		return (
			<div className="ts-form-group quick-search-keyword voxel-fse-loading">
				<button type="button" className="ts-filter ts-popup-target" disabled>
					<span className="ts-loader" />
				</button>
			</div>
		);
	}

	return (
		<QuickSearchComponent
			attributes={attributes}
			postTypes={postTypes}
			context="frontend"
			vxConfig={vxConfig}
		/>
	);
}

/**
 * Initialize Quick Search blocks on the page
 */
function initQuickSearchBlocks() {
	// Find all quick search blocks
	const quickSearchBlocks = document.querySelectorAll<HTMLElement>(
		'.quick-search.voxel-fse-quick-search'
	);

	quickSearchBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const rawConfig = parseVxConfig(container);

		if (!rawConfig) {
			console.error('Quick Search: No vxconfig found');
			return;
		}

		// Normalize config for both vxconfig and REST API compatibility
		const vxConfig = normalizeConfig(rawConfig);

		// Build attributes from normalized config
		const attributes = buildAttributes(vxConfig);

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Clear placeholder content
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<QuickSearchWrapper vxConfig={vxConfig} attributes={attributes} />
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initQuickSearchBlocks);
} else {
	initQuickSearchBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initQuickSearchBlocks);
window.addEventListener('pjax:complete', initQuickSearchBlocks);

// Support Voxel's markup update event
if (typeof jQuery !== 'undefined') {
	jQuery(document).on('voxel:markup-update', initQuickSearchBlocks);
}
