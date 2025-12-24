/**
 * Search Form Block - TypeScript Interfaces
 *
 * @package VoxelFSE
 */

export interface SearchFormAttributes {
	// Block ID
	blockId: string;

	// Content Tab
	postTypes: string[];
	/**
	 * Currently selected post type in the dropdown
	 * Used for editor preview syncing with Post Feed
	 */
	selectedPostType: string;
	showPostTypeFilter: boolean;
	postTypeFilterWidth?: number;
	filterLists: Record<string, FilterConfig[]>;

	// General Tab
	onSubmit: 'refresh' | 'feed' | 'map';
	postToFeedId?: string;
	postToMapId?: string;
	searchOn: 'change' | 'submit';
	updateUrl?: boolean;
	showSearchButton: boolean;
	searchButtonText: string;
	searchButtonIcon: IconConfig;
	searchButtonWidth?: number;
	searchButtonWidth_tablet?: number;
	searchButtonWidth_mobile?: number;
	searchButtonWidthUnit?: string;
	showResetButton: boolean;
	resetButtonText: string;
	resetButtonIcon: IconConfig;
	resetButtonWidth?: number;
	resetButtonWidth_tablet?: number;
	resetButtonWidth_mobile?: number;
	resetButtonWidthUnit?: string;
	toggleText?: string;
	toggleIcon?: IconConfig;

	// Inline Tab - Filter Styling
	filterBackground?: string;
	filterBackgroundHover?: string;
	filterTextColor?: string;
	filterTextColorHover?: string;
	filterTypography?: TypographyConfig;
	filterPadding?: DimensionsConfig;
	filterPadding_tablet?: DimensionsConfig;
	filterPadding_mobile?: DimensionsConfig;
	filterMargin?: DimensionsConfig;
	filterMargin_tablet?: DimensionsConfig;
	filterMargin_mobile?: DimensionsConfig;
	filterBorderRadius?: number;
	filterBorderRadius_tablet?: number;
	filterBorderRadius_mobile?: number;
	filterBorderWidth?: number;
	filterBorderWidth_tablet?: number;
	filterBorderWidth_mobile?: number;
	filterBorderColor?: string;
	filterGap?: number;
	filterGap_tablet?: number;
	filterGap_mobile?: number;

	// Inline Tab - Toggle Button Styling
	toggleBackground?: string;
	toggleBackgroundHover?: string;
	toggleTextColor?: string;
	toggleTextColorHover?: string;
	toggleIcon?: IconConfig;
	toggleText?: string;

	// Inline Tab - Portal Styling
	portalBackground?: string;
	portalWidth?: {
		desktop?: number;
		tablet?: number;
		mobile?: number;
	};
	portalMaxHeight?: number;
	portalMaxHeight_tablet?: number;
	portalMaxHeight_mobile?: number;

	// Inline Tab - Search Button Styling
	searchButtonBackground?: string;
	searchButtonBackgroundHover?: string;
	searchButtonTextColor?: string;
	searchButtonTextColorHover?: string;
	searchButtonTypography?: TypographyConfig;
	searchButtonPadding?: DimensionsConfig;
	searchButtonBorderRadius?: number;
	searchButtonBorderRadius_tablet?: number;
	searchButtonBorderRadius_mobile?: number;

	// Inline Tab - Reset Button Styling
	resetButtonBackground?: string;
	resetButtonBackgroundHover?: string;
	resetButtonTextColor?: string;
	resetButtonTextColorHover?: string;

	// Advanced Tab
	blockMargin?: DimensionsConfig;
	blockMargin_tablet?: DimensionsConfig;
	blockMargin_mobile?: DimensionsConfig;
	blockPadding?: DimensionsConfig;
	blockPadding_tablet?: DimensionsConfig;
	blockPadding_mobile?: DimensionsConfig;
	hideDesktop?: boolean;
	hideTablet?: boolean;
	hideMobile?: boolean;
	customClasses?: string;
	customCSS?: string;

	// Voxel Tab
	voxelIntegration?: boolean;
	formToggleDesktop?: boolean;
	formToggleTablet?: boolean;
	formToggleMobile?: boolean;
	portalMode?: {
		desktop: boolean;
		tablet: boolean;
		mobile: boolean;
	};
	adaptiveFiltering?: boolean;
}

export interface FilterConfig {
	id: string;
	filterKey: string;
	type: FilterType;
	label: string;
	icon?: IconConfig;
	placeholder?: string;

	// Default value settings
	defaultValueEnabled?: boolean;
	defaultValue?: unknown;
	resetValue?: 'empty' | 'default_value';

	// Display settings
	// Filter-type specific options:
	// - keywords, stepper: popup | inline
	// - terms: popup | inline | buttons
	// - range: popup | inline | minmax
	// - order-by: popup | buttons | alt-btn | post-feed
	// - post-status: popup | buttons
	// - location: popup | inline
	displayAs?: 'popup' | 'inline' | 'buttons' | 'minmax' | 'alt-btn' | 'post-feed';

	// Label override (Voxel: ts_repeater_label)
	labelOverride?: string;

	// Filter-type specific settings:
	// Terms filter
	hideEmptyTerms?: boolean;
	termsColumns?: number;
	termsColumns_tablet?: number;
	termsColumns_mobile?: number;

	// Order-by filter
	orderByChoices?: string[];

	// Post-status filter
	postStatusChoices?: string[];

	// Location filter
	displayProximityAs?: 'popup' | 'inline' | 'none';
	defaultSearchMethod?: 'area' | 'radius';

	// Switcher filter
	openInPopup?: boolean;

	// Visual settings
	width?: number;
	width_tablet?: number;
	width_mobile?: number;
	hideFilter?: boolean;
	alignContent?: 'flex-start' | 'center' | 'flex-end';
	alignContent_tablet?: 'flex-start' | 'center' | 'flex-end';
	alignContent_mobile?: 'flex-start' | 'center' | 'flex-end';
	hideLabel?: boolean;

	// Popup settings
	customPopupEnabled?: boolean;
	popupMinWidth?: number;
	popupMinWidth_tablet?: number;
	popupMinWidth_mobile?: number;
	popupMaxWidth?: number;
	popupMaxWidth_tablet?: number;
	popupMaxWidth_mobile?: number;
	popupMaxHeight?: number;
	popupMaxHeight_tablet?: number;
	popupMaxHeight_mobile?: number;
	popupCenterPosition?: boolean;

	// Row visibility / conditional logic
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];

	// Type-specific props
	[key: string]: unknown;
}

export interface VisibilityRule {
	id: string;
	filterKey: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
	value?: string;
}

export type FilterType =
	| 'keywords'
	| 'range'
	| 'stepper'
	| 'terms'
	| 'location'
	| 'availability'
	| 'date'
	| 'recurring-date'
	| 'open-now'
	| 'order-by'
	| 'post-status'
	| 'user'
	| 'relations'
	| 'following'
	| 'switcher'
	| 'ui-heading';

export interface PostTypeConfig {
	key: string;
	label: string;
	singular: string;
	plural: string;
	// Icon HTML markup from Voxel's get_icon_markup()
	icon?: string;
	filters: FilterData[];
}

export interface FilterData {
	key: string;
	label: string;
	type: FilterType;
	// Icon HTML markup from Voxel's get_icon_markup()
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	icon?: string;
	props: Record<string, unknown>;
}

export interface SearchFormState {
	currentPostType: string;
	filterValues: Record<string, unknown>;
	activeFilterCount: number;
	portalActive: boolean;
	loading: boolean;
	resetting: boolean;
	/** Narrowed values from adaptive filtering AJAX response */
	narrowedValues: NarrowedValues | null;
	/** Whether adaptive filtering request is in progress */
	narrowingFilters: boolean;
}

/**
 * Adaptive Filtering - Narrowed Values
 *
 * When adaptiveFiltering is enabled, filters can dynamically update their
 * ranges and available options based on current search results.
 *
 * Reference: voxel-search-form.beautified.js lines 480-550, 1216-1238
 *
 * Voxel AJAX endpoint: ?vx=1&action=search.narrow_filters
 */
export interface NarrowedValues {
	/**
	 * Narrowed range values for range filters
	 * Key: filter key, Value: { min, max } based on current results
	 */
	ranges: Record<string, NarrowedRange>;
	/**
	 * Narrowed term availability for terms filters
	 * Key: taxonomy key, Value: { term_taxonomy_id: count }
	 */
	terms: Record<string, Record<number, number>>;
}

export interface NarrowedRange {
	min: number;
	max: number;
}

export interface IconConfig {
	library: 'icon' | 'svg' | '';
	value: string;
}

export interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSize_tablet?: number;
	fontSize_mobile?: number;
	fontWeight?: string;
	lineHeight?: number;
	letterSpacing?: number;
	textTransform?: string;
}

export interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	linked?: boolean;
}

export interface FilterComponentProps {
	config: FilterConfig;
	filterData: FilterData;
	value: unknown;
	onChange: (value: unknown) => void;
	/** Narrowed values for adaptive filtering (optional) */
	narrowedValues?: NarrowedValues | null;
	/** Whether adaptive filtering is in progress */
	isNarrowing?: boolean;
}

// Extend Window interface for global variables
declare global {
	interface Window {
		stackableVersion?: string;
		voxelFseSearchForm?: {
			attributes: SearchFormAttributes;
			postTypes: PostTypeConfig[];
			ajaxUrl: string;
			nonce: string;
		};
	}
}
