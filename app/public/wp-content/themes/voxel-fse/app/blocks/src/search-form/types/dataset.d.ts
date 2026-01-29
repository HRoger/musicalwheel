/**
 * Custom TypeScript interface for search-form block dataset attributes
 *
 * This interface properly types the DOMStringMap dataset properties to avoid
 * TypeScript TS4111 errors ("Property comes from an index signature").
 *
 * @package VoxelFSE
 */

export interface SearchFormDataset extends DOMStringMap {
	// Block identification
	postTypes?: string;

	// Post type filter
	showPostTypeFilter?: string;
	postTypeFilterWidth?: string;
	postTypeFilterWidthTablet?: string;
	postTypeFilterWidthMobile?: string;

	// Filter configuration
	filterLists?: string;

	// Form behavior
	onSubmit?: string;
	postToFeedId?: string;
	postToMapId?: string;
	searchOn?: string;

	// Search button
	showSearchButton?: string;
	searchButtonText?: string;
	searchButtonIcon?: string;
	searchButtonWidth?: string;
	searchButtonWidthTablet?: string;
	searchButtonWidthMobile?: string;
	searchButtonWidthUnit?: string;

	// Reset button
	showResetButton?: string;
	resetButtonText?: string;
	resetButtonIcon?: string;
	resetButtonWidth?: string;
	resetButtonWidthTablet?: string;
	resetButtonWidthMobile?: string;
	resetButtonWidthUnit?: string;

	// Integration
	voxelIntegration?: string;
	adaptiveFiltering?: string;

	// Portal mode
	portalMode?: string;
	formToggleDesktop?: string;
	formToggleTablet?: string;
	formToggleMobile?: string;
	toggleText?: string;
	toggleIcon?: string;
}

/**
 * Typed interface for API response/config normalization
 * Supports both camelCase and snake_case field names for compatibility
 */
export interface SearchFormRawConfig {
	blockId?: string;
	block_id?: string;
	postTypes?: unknown;
	post_types?: unknown;
	showPostTypeFilter?: unknown;
	show_post_type_filter?: unknown;
	postTypeFilterWidth?: unknown;
	post_type_filter_width?: unknown;
	postTypeFilterWidth_tablet?: unknown;
	post_type_filter_width_tablet?: unknown;
	postTypeFilterWidth_mobile?: unknown;
	post_type_filter_width_mobile?: unknown;
	filterLists?: unknown;
	filter_lists?: unknown;
	onSubmit?: unknown;
	on_submit?: unknown;
	postToFeedId?: unknown;
	post_to_feed_id?: unknown;
	postToMapId?: unknown;
	post_to_map_id?: unknown;
	searchOn?: unknown;
	search_on?: unknown;
	updateUrl?: unknown;
	update_url?: unknown;
	submitToPageId?: unknown;
	submit_to_page_id?: unknown;
	mapAdditionalMarkers?: unknown;
	map_additional_markers?: unknown;
	mapEnableClusters?: unknown;
	map_enable_clusters?: unknown;
	mfSwitcherDesktop?: unknown;
	mf_switcher_desktop?: unknown;
	mfSwitcherDesktopDefault?: unknown;
	mf_switcher_desktop_default?: unknown;
	mfSwitcherTablet?: unknown;
	mf_switcher_tablet?: unknown;
	mfSwitcherTabletDefault?: unknown;
	mf_switcher_tablet_default?: unknown;
	mfSwitcherMobile?: unknown;
	mf_switcher_mobile?: unknown;
	mfSwitcherMobileDefault?: unknown;
	mf_switcher_mobile_default?: unknown;
	showSearchButton?: unknown;
	show_search_button?: unknown;
	searchButtonText?: unknown;
	search_button_text?: unknown;
	searchButtonIcon?: unknown;
	search_button_icon?: unknown;
	searchButtonWidth?: unknown;
	search_button_width?: unknown;
	searchButtonWidth_tablet?: unknown;
	search_button_width_tablet?: unknown;
	searchButtonWidth_mobile?: unknown;
	search_button_width_mobile?: unknown;
	searchButtonWidthUnit?: unknown;
	search_button_width_unit?: unknown;
	showResetButton?: unknown;
	show_reset_button?: unknown;
	resetButtonText?: unknown;
	reset_button_text?: unknown;
	resetButtonIcon?: unknown;
	reset_button_icon?: unknown;
	resetButtonWidth?: unknown;
	reset_button_width?: unknown;
	resetButtonWidth_tablet?: unknown;
	reset_button_width_tablet?: unknown;
	resetButtonWidth_mobile?: unknown;
	reset_button_width_mobile?: unknown;
	resetButtonWidthUnit?: unknown;
	reset_button_width_unit?: unknown;
	voxelIntegration?: unknown;
	voxel_integration?: unknown;
	adaptiveFiltering?: unknown;
	adaptive_filtering?: unknown;
	portalMode?: unknown;
	portal_mode?: unknown;
	formToggleDesktop?: unknown;
	form_toggle_desktop?: unknown;
	formToggleTablet?: unknown;
	form_toggle_tablet?: unknown;
	formToggleMobile?: unknown;
	form_toggle_mobile?: unknown;
	toggleText?: unknown;
	toggle_text?: unknown;
	toggleIcon?: unknown;
	toggle_icon?: unknown;
	[key: string]: unknown;
}
