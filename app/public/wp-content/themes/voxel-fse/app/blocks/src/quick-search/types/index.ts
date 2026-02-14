/**
 * Quick Search Block - TypeScript Types
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';

/**
 * Post type configuration for Quick Search
 */
export interface PostTypeConfig {
	key: string;
	label: string;
	filter: string;
	taxonomies: string[];
	archive: string;
}

/**
 * Individual filter item within a post type's repeater
 */
export interface QuickSearchFilterItem {
	id: string;
	label: string;
	filter: string;
	taxonomies: string[];
	// Visibility
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: any[];
	// Loop
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;
}

/**
 * Per-post-type settings configured in the editor
 */
export interface PostTypeSettings {
	label: string;
	filter: string;
	taxonomies: string[];
	// Repeater filter items
	filterItems?: QuickSearchFilterItem[];
}

/**
 * Search result item
 */
export interface SearchResultItem {
	type: 'post' | 'term' | 'keywords';
	key: string;
	link: string;
	title: string;
	logo: string | null;
	icon: string | null;
}

/**
 * Block attributes for Quick Search
 */
export interface QuickSearchAttributes {
	// Block ID
	blockId: string;
	activeTab: string;
	contentTabOpenPanel: string;
	styleTabOpenPanel: string;
	searchButtonState: string;
	popupTabsState: string;

	// Content - Post Types
	postTypes: string[];
	postTypeSettings: Record<string, PostTypeSettings>;

	// Content - General
	buttonLabel: string;
	displayMode: 'single' | 'tabbed';
	hideCptTabs: boolean;
	singleSubmitTo: string;
	singleSubmitKey: string;

	// Content - Icons
	searchIcon: IconValue;
	closeIcon: IconValue;
	resultIcon: IconValue;
	clearSearchesIcon: IconValue;

	// Style - Search Button (Normal)
	buttonPadding: BoxSpacing;
	buttonPadding_tablet: BoxSpacing;
	buttonPadding_mobile: BoxSpacing;
	buttonHeight: number;
	buttonHeight_tablet: number;
	buttonHeight_mobile: number;
	buttonBackground: string;
	buttonTextColor: string;
	buttonBorderRadius: number;
	buttonIconColor: string;
	buttonIconSize: number;
	buttonIconSpacing: number;
	buttonTypography: object;
	buttonBoxShadow: object;
	buttonBorderType: string;
	buttonBorderWidth: number;
	buttonBorderColor: string;
	buttonBorderRadius_tablet: number;
	buttonBorderRadius_mobile: number;
	buttonIconSize_tablet: number;
	buttonIconSize_mobile: number;
	buttonIconSpacing_tablet: number;
	buttonIconSpacing_mobile: number;

	// Style - Search Button (Hover)
	buttonBackgroundHover: string;
	buttonTextColorHover: string;
	buttonBorderColorHover: string;
	buttonIconColorHover: string;
	buttonBoxShadowHover: object;

	// Style - Search Button (Filled)
	buttonBackgroundFilled: string;
	buttonTextColorFilled: string;
	buttonIconColorFilled: string;
	buttonBorderColorFilled: string;
	buttonBorderWidthFilled: number;
	buttonTypographyFilled: object;
	buttonBoxShadowFilled: object;

	// Style - Button Suffix
	// Style - Button Suffix
	suffixHide: boolean;
	suffixHide_tablet: boolean;
	suffixHide_mobile: boolean;
	suffixPadding: BoxSpacing;
	suffixPadding_tablet: BoxSpacing;
	suffixPadding_mobile: BoxSpacing;
	suffixTypography: object;
	suffixTextColor: string;
	suffixTextColor_tablet: string;
	suffixTextColor_mobile: string;
	suffixBackground: string;
	suffixBackground_tablet: string;
	suffixBackground_mobile: string;
	suffixBorderRadius: number;
	suffixBorderRadius_tablet: number;
	suffixBorderRadius_mobile: number;
	suffixBoxShadow: object;
	suffixMargin: number;
	suffixMargin_tablet: number;
	suffixMargin_mobile: number;

	// Style - Popup Tabs
	tabsJustify: string;
	tabsPadding: BoxSpacing;
	tabsMargin: BoxSpacing;
	tabsTextColor: string;
	tabsActiveTextColor: string;
	tabsBackground: string;
	tabsActiveBackground: string;
	tabsBorderRadius: number;
	tabsBorderColor: string;
	tabsActiveBorderColor: string;
	tabsTextColorHover: string;
	tabsBorderColorHover: string;
	tabsBackgroundHover: string;

	// Style - Popup Custom
	popupCustomEnable: boolean;
	popupBackdropBackground: string;
	popupPointerEvents: boolean;
	popupCenterPosition: boolean;
	popupMinWidth: number;
	popupMinWidth_tablet: number;
	popupMinWidth_mobile: number;
	popupMaxWidth: number;
	popupMaxWidth_tablet: number;
	popupMaxWidth_mobile: number;
	popupMaxHeight: number;
	popupMaxHeight_tablet: number;
	popupMaxHeight_mobile: number;
	popupTopBottomMargin: number;
	popupTopBottomMargin_tablet: number;
	popupTopBottomMargin_mobile: number;
	popupBoxShadow: object;
	popupBorder: any;

	// Style - Custom Popup Menu
	customPopupMenuState: string;

	// Menu - Item
	menuItemPadding: BoxSpacing;
	menuItemHeight: number;
	menuItemHeight_tablet: number;
	menuItemHeight_mobile: number;
	menuItemBorderRadius: number;
	menuItemBorderRadius_tablet: number;
	menuItemBorderRadius_mobile: number;

	// Menu - Title
	menuTitleColor: string;
	menuTitleTypography: object;

	// Menu - Logo
	menuLogoWidth: number;
	menuLogoWidth_tablet: number;
	menuLogoWidth_mobile: number;
	menuLogoRadius: number;
	menuLogoRadius_tablet: number;
	menuLogoRadius_mobile: number;

	// Menu - Icon
	menuIconColor: string;
	menuIconSize: number;
	menuIconSize_tablet: number;
	menuIconSize_mobile: number;

	// Menu - Icon Container
	menuIconContainerSize: number;
	menuIconContainerSize_tablet: number;
	menuIconContainerSize_mobile: number;
	menuIconContainerSpacing: number;
	menuIconContainerSpacing_tablet: number;
	menuIconContainerSpacing_mobile: number;

	// Menu - Chevron
	menuChevronColor: string;

	// Menu - Hover
	menuItemBackgroundHover: string;
	menuTitleColorHover: string;
	menuIconColorHover: string;

	// Advanced
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;

	// Visibility & Loops
	visibilityBehavior?: string;
	visibilityRules?: any[];
	loopSource?: string;
	loopLimit?: string;
	loopOffset?: string;
	loopProperty?: string;

	[key: string]: any;
}

/**
 * Box spacing type
 */
export interface BoxSpacing {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

/**
 * VxConfig structure for save.tsx output
 */
export interface VxConfig {
	postTypes: Record<string, {
		key: string;
		label: string;
		filter: string;
		taxonomies: string[];
		archive: string;
		results: {
			query: string;
			items: SearchResultItem[];
		};
	}>;
	displayMode: 'single' | 'tabbed';
	keywords: {
		minlength: number;
	};
	singleMode: {
		submitTo: string | null;
		filterKey: string;
	};
	icons: {
		search: IconValue;
		close: IconValue;
		result: IconValue;
		clearSearches: IconValue;
	};
	buttonLabel: string;
	hideCptTabs: boolean;
}

/**
 * REST API response for post types
 */
export interface PostTypesResponse {
	postTypes: PostTypeConfig[];
	keywordsMinlength: number;
}

/**
 * Search API response
 */
export interface SearchResponse {
	success: boolean;
	data: SearchResultItem[];
	message?: string;
}
