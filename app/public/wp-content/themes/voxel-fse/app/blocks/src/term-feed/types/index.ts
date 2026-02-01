/**
 * Term Feed Block - Type Definitions
 *
 * TypeScript interfaces for the Term Feed block.
 * Matches Voxel's Term_Feed widget attributes.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/term-feed.php
 * - Template: themes/voxel/templates/widgets/term-feed.php
 *
 * @package VoxelFSE
 */

/**
 * Icon value type from shared controls
 */
import type { IconValue } from '@shared/types';

/**
 * Border width value type
 */
export interface BorderWidth {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/**
 * Manual term selection item
 */
export interface ManualTermItem {
	term_id: number;
}

/**
 * Term data from REST API
 *
 * PARITY: Matches response from fse-term-feed-controller.php get_terms()
 */
export interface TermData {
	id: number;
	name: string;
	slug: string;
	description: string;
	count: number;
	parent: number;
	taxonomy: string;
	link: string; // Voxel term link URL
	color: string; // Voxel term color (for accent replacement)
	icon: string; // Rendered icon HTML markup
	cardHtml: string; // Rendered term card template HTML
}

/**
 * Taxonomy option for dropdown
 */
export interface TaxonomyOption {
	key: string;
	label: string;
}

/**
 * Post type option for dropdown
 */
export interface PostTypeOption {
	key: string;
	label: string;
}

/**
 * Term card template option
 */
export interface CardTemplateOption {
	id: string;
	label: string;
}

/**
 * Term Feed block attributes
 * Matches Voxel's term-feed widget controls
 */
export interface TermFeedAttributes {
	// Block identification
	blockId: string;

	// Data source settings
	source: 'filters' | 'manual';
	manualTerms: ManualTermItem[];
	taxonomy: string;
	parentTermId: number;
	order: 'default' | 'name';
	perPage: number;
	hideEmpty: boolean;
	hideEmptyPostType: string;
	cardTemplate: string;

	// Layout settings
	layoutMode: 'ts-feed-grid-default' | 'ts-feed-nowrap';

	// Carousel settings (when layoutMode === 'ts-feed-nowrap')
	carouselItemWidth: number;
	carouselItemWidth_tablet?: number;
	carouselItemWidth_mobile?: number;
	carouselItemWidthUnit: string;
	carouselAutoplay: boolean;
	carouselAutoplayInterval: number;

	// Grid settings (when layoutMode === 'ts-feed-grid-default')
	gridColumns: number;
	gridColumns_tablet?: number;
	gridColumns_mobile?: number;

	// Common layout settings
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	scrollPadding: number;
	scrollPadding_tablet?: number;
	scrollPadding_mobile?: number;
	itemPadding: number;
	itemPadding_tablet?: number;
	itemPadding_mobile?: number;
	replaceAccentColor: boolean;

	// Carousel navigation style - Normal state
	navHorizontalPosition: number;
	navHorizontalPosition_tablet?: number;
	navHorizontalPosition_mobile?: number;
	navVerticalPosition: number;
	navVerticalPosition_tablet?: number;
	navVerticalPosition_mobile?: number;
	navButtonIconColor: string;
	navButtonSize?: number;
	navButtonSize_tablet?: number;
	navButtonSize_mobile?: number;
	navButtonIconSize?: number;
	navButtonIconSize_tablet?: number;
	navButtonIconSize_mobile?: number;
	navButtonBackground: string;
	navBackdropBlur?: number;
	navBackdropBlur_tablet?: number;
	navBackdropBlur_mobile?: number;
	navBorderType: string;
	navBorderWidth: BorderWidth;
	navBorderColor: string;
	navBorderRadius: number;
	navBorderRadius_tablet?: number;
	navBorderRadius_mobile?: number;

	// Carousel navigation style - Hover state
	navButtonSizeHover?: number;
	navButtonSizeHover_tablet?: number;
	navButtonSizeHover_mobile?: number;
	navButtonIconSizeHover?: number;
	navButtonIconSizeHover_tablet?: number;
	navButtonIconSizeHover_mobile?: number;
	navButtonIconColorHover: string;
	navButtonBackgroundHover: string;
	navButtonBorderColorHover: string;

	// Icons
	rightChevronIcon: IconValue;
	leftChevronIcon: IconValue;

	// VoxelTab attributes
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: any[];
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;

	// Allow for advanced style attributes
	[key: string]: any;
}

/**
 * VxConfig for frontend hydration
 * Contains all data needed to render the term feed on frontend
 */
export interface TermFeedVxConfig {
	// Data source
	source: 'filters' | 'manual';
	manualTermIds: number[];
	taxonomy: string;
	parentTermId: number;
	order: 'default' | 'name';
	perPage: number;
	hideEmpty: boolean;
	hideEmptyPostType: string;
	cardTemplate: string;

	// Layout
	layoutMode: 'ts-feed-grid-default' | 'ts-feed-nowrap';
	carouselItemWidth: number;
	carouselItemWidthUnit: string;
	carouselAutoplay: boolean;
	carouselAutoplayInterval: number;
	gridColumns: number;
	itemGap: number;
	scrollPadding: number;
	itemPadding: number;
	replaceAccentColor: boolean;

	// Navigation styling
	navHorizontalPosition: number;
	navVerticalPosition: number;
	navButtonIconColor: string;
	navButtonSize?: number;
	navButtonIconSize?: number;
	navButtonBackground: string;
	navBackdropBlur?: number;
	navBorderType: string;
	navBorderWidth: BorderWidth;
	navBorderColor: string;
	navBorderRadius: number;

	// Navigation hover styling
	navButtonSizeHover?: number;
	navButtonIconSizeHover?: number;
	navButtonIconColorHover: string;
	navButtonBackgroundHover: string;
	navButtonBorderColorHover: string;

	// Icons
	rightChevronIcon: IconValue;
	leftChevronIcon: IconValue;

	// Responsive values (serialized)
	responsive: {
		carouselItemWidth_tablet?: number;
		carouselItemWidth_mobile?: number;
		gridColumns_tablet?: number;
		gridColumns_mobile?: number;
		itemGap_tablet?: number;
		itemGap_mobile?: number;
		scrollPadding_tablet?: number;
		scrollPadding_mobile?: number;
		itemPadding_tablet?: number;
		itemPadding_mobile?: number;
		navHorizontalPosition_tablet?: number;
		navHorizontalPosition_mobile?: number;
		navVerticalPosition_tablet?: number;
		navVerticalPosition_mobile?: number;
		navButtonSize_tablet?: number;
		navButtonSize_mobile?: number;
		navButtonIconSize_tablet?: number;
		navButtonIconSize_mobile?: number;
		navBackdropBlur_tablet?: number;
		navBackdropBlur_mobile?: number;
		navBorderRadius_tablet?: number;
		navBorderRadius_mobile?: number;
		navButtonSizeHover_tablet?: number;
		navButtonSizeHover_mobile?: number;
		navButtonIconSizeHover_tablet?: number;
		navButtonIconSizeHover_mobile?: number;
	};
}

/**
 * Props for shared TermFeedComponent
 */
export interface TermFeedComponentProps {
	attributes: TermFeedAttributes;
	terms: TermData[];
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
}

/**
 * REST API response for term feed endpoint
 */
export interface TermFeedApiResponse {
	terms: TermData[];
	total: number;
	taxonomy: string;
}

/**
 * REST API response for taxonomies endpoint
 */
export interface TaxonomiesApiResponse {
	taxonomies: TaxonomyOption[];
}

/**
 * REST API response for post types endpoint
 */
export interface PostTypesApiResponse {
	postTypes: PostTypeOption[];
}

/**
 * REST API response for card templates endpoint
 */
export interface CardTemplatesApiResponse {
	templates: CardTemplateOption[];
}
