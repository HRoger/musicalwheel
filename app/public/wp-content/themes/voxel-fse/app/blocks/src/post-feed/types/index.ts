/**
 * Post Feed Block - TypeScript Interfaces
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/controls/IconPickerControl';
import type { TypographyValue } from '@shared/controls/TypographyPopup';

export interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}
import type { CombinedStyleAttributes } from '../../../shared/utils';

/**
 * Data source types for post feed
 */
export type PostFeedSource = 'search-form' | 'search-filters' | 'manual' | 'archive';

/**
 * Pagination types
 */
export type PaginationType = 'load_more' | 'prev_next' | 'none';

/**
 * Layout modes
 */
export type LayoutMode = 'grid' | 'carousel';

/**
 * Loading style types
 */
export type LoadingStyle = 'opacity' | 'skeleton' | 'none';

/**
 * Block attributes interface
 * Extends CombinedStyleAttributes for AdvancedTab + VoxelTab support
 */
export interface PostFeedAttributes extends CombinedStyleAttributes {
	// Identification
	blockId: string;

	// Data Source Settings
	source: PostFeedSource;
	searchFormId: string;
	postType: string;
	manualPostIds: number[];
	filters: Record<string, unknown>;

	// Filters Mode Settings
	excludePosts: string;
	priorityFilter: boolean;
	priorityMin: number;
	priorityMax: number;
	offset: number;
	cardTemplate: string;

	// Pagination Settings
	pagination: PaginationType;
	postsPerPage: number;
	displayDetails: boolean;
	noResultsLabel: string;

	// Layout Settings
	layoutMode: LayoutMode;
	columns: number;
	columns_tablet?: number;
	columns_mobile?: number;
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;

	// Carousel Settings
	carouselItemWidth?: number;
	carouselItemWidth_tablet?: number;
	carouselItemWidth_mobile?: number;
	carouselItemWidthUnit: string;
	carouselAutoSlide: boolean;
	scrollPadding?: number;
	scrollPadding_tablet?: number;
	scrollPadding_mobile?: number;
	itemPadding?: number;
	itemPadding_tablet?: number;
	itemPadding_mobile?: number;

	// Icon Settings
	loadMoreIcon: IconValue;
	noResultsIcon: IconValue;
	rightArrowIcon: IconValue;
	leftArrowIcon: IconValue;
	rightChevronIcon: IconValue;
	leftChevronIcon: IconValue;
	resetIcon: IconValue;

	// Counter Style
	counterTypography: TypographyValue;
	counterTextColor: string;
	counterBottomSpacing?: number;
	counterBottomSpacing_tablet?: number;
	counterBottomSpacing_mobile?: number;

	// Order By Style
	orderByTypography: TypographyValue;
	orderByTextColor: string;
	orderByTextColorHover: string;

	// Loading Style
	loadingStyle: LoadingStyle;
	loadingOpacity: number;

	// No Results Style
	noResultsHideScreen: boolean;
	noResultsContentGap?: number;
	noResultsContentGap_tablet?: number;
	noResultsContentGap_mobile?: number;
	noResultsIconSize?: number;
	noResultsIconSize_tablet?: number;
	noResultsIconSize_mobile?: number;
	noResultsIconColor: string;
	noResultsTypography: TypographyValue;
	noResultsTextColor: string;
	noResultsLinkColor: string;

	// Pagination Style (Normal)
	paginationTopMargin?: number;
	paginationTopMargin_tablet?: number;
	paginationTopMargin_mobile?: number;
	paginationTypography: TypographyValue;
	paginationPadding: DimensionsConfig;
	paginationHeight?: number;
	paginationHeight_tablet?: number;
	paginationHeight_mobile?: number;
	paginationWidth: number;
	paginationWidthUnit: string;
	paginationJustify: string;
	paginationSpacing?: number;
	paginationSpacing_tablet?: number;
	paginationSpacing_mobile?: number;
	paginationBorderType: string;
	paginationBorderRadius?: number;
	paginationBorderRadius_tablet?: number;
	paginationBorderRadius_mobile?: number;
	paginationTextColor: string;
	paginationBackgroundColor: string;
	paginationIconSize?: number;
	paginationIconSize_tablet?: number;
	paginationIconSize_mobile?: number;
	paginationIconColor: string;
	paginationIconTextSpacing?: number;

	// Pagination Style (Hover)
	paginationTextColorHover: string;
	paginationBackgroundColorHover: string;
	paginationBorderColorHover: string;
	paginationIconColorHover: string;

	// Carousel Navigation Style (Normal)
	carouselNavHorizontalPosition?: number;
	carouselNavHorizontalPosition_tablet?: number;
	carouselNavHorizontalPosition_mobile?: number;
	carouselNavVerticalPosition?: number;
	carouselNavVerticalPosition_tablet?: number;
	carouselNavVerticalPosition_mobile?: number;
	carouselNavIconColor: string;
	carouselNavButtonSize?: number;
	carouselNavButtonSize_tablet?: number;
	carouselNavButtonSize_mobile?: number;
	carouselNavIconSize?: number;
	carouselNavIconSize_tablet?: number;
	carouselNavIconSize_mobile?: number;
	carouselNavBackground: string;
	carouselNavBackdropBlur?: number;
	carouselNavBorderType: string;
	carouselNavBorderRadius?: number;
	carouselNavBorderRadius_tablet?: number;
	carouselNavBorderRadius_mobile?: number;

	// Carousel Navigation Style (Hover)
	carouselNavButtonSizeHover?: number;
	carouselNavButtonSizeHover_tablet?: number;
	carouselNavButtonSizeHover_mobile?: number;
	carouselNavIconSizeHover?: number;
	carouselNavIconSizeHover_tablet?: number;
	carouselNavIconSizeHover_mobile?: number;
	carouselNavIconColorHover: string;
	carouselNavBackgroundHover: string;
	carouselNavBorderColorHover: string;

	// Note: hideDesktop, hideTablet, hideMobile, customClasses, customCSS
	// are inherited from CombinedStyleAttributes (AdvancedTab + VoxelTab)

	// Persistence for Accordion Panel Groups
	postFeedSettingsAccordion?: string;
	postFeedIconsAccordion?: string;
	postFeedStylesAccordion?: string;

	// Tab persistence
	postFeedActiveTab?: string;
}

/**
 * vxconfig structure stored in save.tsx
 */
export interface PostFeedVxConfig {
	blockId: string;
	source: PostFeedSource;
	searchFormId: string;
	postType: string;
	manualPostIds: number[];
	filters: Record<string, unknown>;
	// Filters mode settings
	excludePosts: string;
	priorityFilter: boolean;
	priorityMin: number;
	priorityMax: number;
	offset: number;
	cardTemplate: string;
	pagination: PaginationType;
	postsPerPage: number;
	displayDetails: boolean;
	noResultsLabel: string;
	layoutMode: LayoutMode;
	columns: number;
	columns_tablet?: number;
	columns_mobile?: number;
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	carouselItemWidth?: number;
	carouselItemWidth_tablet?: number;
	carouselItemWidth_mobile?: number;
	carouselItemWidthUnit: string;
	carouselAutoSlide: boolean;
	scrollPadding?: number;
	scrollPadding_tablet?: number;
	scrollPadding_mobile?: number;
	itemPadding?: number;
	itemPadding_tablet?: number;
	itemPadding_mobile?: number;
	loadingStyle: LoadingStyle;
	loadingOpacity: number;
	icons: {
		loadMore: IconValue;
		noResults: IconValue;
		rightArrow: IconValue;
		leftArrow: IconValue;
		rightChevron: IconValue;
		leftChevron: IconValue;
		reset: IconValue;
	};
}

/**
 * Search form relation data
 */
export interface SearchFormRelation {
	id: string;
	label: string;
}

/**
 * Post type data from API
 */
export interface PostTypeData {
	key: string;
	label: string;
	singular: string;
	plural: string;
}

/**
 * Filter configuration for "Filters" source mode
 * 1:1 PARITY: Matches Voxel post-feed.php:1456-1466 filter_list structure
 */
export interface FilterConfig {
	/** Filter key (e.g., 'keywords', 'location', 'date') */
	filter: string;
	/** Control values keyed by control key or full key */
	[key: string]: unknown;
}

/**
 * Search results response from Voxel's native endpoint
 */
export interface SearchResultsResponse {
	success: boolean;
	html: string;
	totalCount: number;
	displayCount: string;
	hasPrev: boolean;
	hasNext: boolean;
	hasResults: boolean;
	styles?: string;
	scripts?: string;
}

/**
 * Search with filters response from our REST endpoint
 * 1:1 PARITY: /voxel-fse/v1/post-feed/search-with-filters
 */
export interface SearchWithFiltersResponse {
	success: boolean;
	html: string;
	ids: number[];
	hasResults: boolean;
	hasPrev: boolean;
	hasNext: boolean;
	totalCount: number;
	displayCount: string;
	templateId: number | null;
	page: number;
	error?: string;
}

/**
 * Post feed state for frontend
 */
export interface PostFeedState {
	loading: boolean;
	page: number;
	results: string;
	totalCount: number;
	displayCount: string;
	hasPrev: boolean;
	hasNext: boolean;
	hasResults: boolean;
}

/**
 * Edit component props
 */
export interface PostFeedEditProps {
	attributes: PostFeedAttributes;
	setAttributes: (attrs: Partial<PostFeedAttributes>) => void;
	clientId: string;
}

/**
 * Shared component props
 */
export interface PostFeedComponentProps {
	attributes: PostFeedAttributes;
	config?: PostFeedConfig | null;
	context: 'editor' | 'frontend';
	onSearch?: (filters: Record<string, unknown>) => Promise<SearchResultsResponse>;
	/**
	 * Editor filter values from linked Search Form
	 * Synced via useSelect watching Search Form's editorFilterValues attribute
	 * Used for editor preview sync when filters change
	 */
	editorFilters?: Record<string, unknown>;
}

/**
 * Post feed configuration from REST API
 */
export interface PostFeedConfig {
	searchForms: SearchFormRelation[];
	postTypes: PostTypeData[];
	ajaxUrl: string;
	restUrl: string;
}

/**
 * Extend Window interface for global variables
 */
declare global {
	interface Window {
		voxelFsePostFeed?: {
			ajaxUrl: string;
			restUrl: string;
			nonce: string;
		};
	}
}
