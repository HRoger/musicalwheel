/**
 * Advanced List Block - TypeScript Interfaces
 *
 * Type definitions for the Advanced List (Actions VX) block.
 *
 * @package VoxelFSE
 */

/**
 * Action types available in the widget
 * Matches Voxel's advanced-list widget action types
 */
export type ActionType =
	| 'none'
	| 'action_link'
	| 'add_to_cart'
	| 'promote_post'
	| 'action_follow_post'
	| 'action_follow'
	| 'edit_post'
	| 'delete_post'
	| 'unpublish_post'
	| 'publish_post'
	| 'show_post_on_map'
	| 'share_post'
	| 'view_post_stats'
	| 'go_back'
	| 'select_addition'
	| 'back_to_top'
	| 'scroll_to_section'
	| 'action_gcal'
	| 'action_ical'
	| 'action_save'
	| 'direct_message'
	| 'direct_message_user'
	| 'relist_post'
	| 'switch_listing_plan';

/**
 * Icon value structure
 * Matches Voxel's icon control format
 */
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
import type { CombinedStyleAttributes } from '../../../shared/utils';
import type { IconValue } from '@shared/types';

// Re-export shared types for convenience
export type { IconValue } from '@shared/types';

/**
 * Link configuration for action_link type
 */
export interface LinkConfig {
	url: string;
	isExternal: boolean;
	nofollow: boolean;
}

/**
 * Box values for dimensions (padding, margin, border-width)
 */
export interface BoxValues {
	top: string;
	right: string;
	bottom: string;
	left: string;
}

/**
 * Box shadow value structure
 */
export interface BoxShadowValue {
	horizontal: number;
	vertical: number;
	blur: number;
	spread: number;
	color: string;
}

/**
 * Typography value structure
 */
export interface TypographyValue {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	textTransform?: string;
	fontStyle?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
}

/**
 * Single action item in the repeater
 */
export interface ActionItem {
	id: string;
	actionType: ActionType;
	text: string;
	icon: IconValue | null;
	enableTooltip: boolean;
	tooltipText: string;
	// Link-specific
	link: LinkConfig | null;
	// Scroll to section
	scrollToId: string;
	// Addition ID
	additionId: string;
	// Calendar event fields
	calStartDate: string;
	calEndDate: string;
	calTitle: string;
	calDescription: string;
	calLocation: string;
	calUrl: string;
	// Cart select options
	cartOptsText: string;
	cartOptsEnableTooltip: boolean;
	cartOptsTooltipText: string;
	cartOptsIcon: IconValue | null;
	// Active state (for follow, save, select_addition, promote)
	activeText: string;
	activeIcon: IconValue | null;
	activeEnableTooltip: boolean;
	activeTooltipText: string;
	// Custom styling
	customStyle: boolean;
	customIconColor: string;
	customIconColorActive: string;
	// Loop repeater row
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string | number;
	loopOffset?: string | number;
	// Row visibility
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Block attributes interface
 * Matches block.json attributes
 */
export interface AdvancedListAttributes {
	// Items repeater
	items: ActionItem[];

	// Global icons
	closeIcon: IconValue;
	messageIcon: IconValue;
	linkIcon: IconValue;
	shareIcon: IconValue;

	// List styling
	enableCssGrid: boolean;
	enableCssGrid_tablet?: boolean;
	enableCssGrid_mobile?: boolean;
	gridColumns: number;
	gridColumns_tablet?: number;
	gridColumns_mobile?: number;
	itemWidth: string;
	customItemWidth: number;
	customItemWidth_tablet?: number;
	customItemWidth_mobile?: number;
	customItemWidthUnit: string;
	listJustify: string;
	listJustify_tablet?: string;
	listJustify_mobile?: string;
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	itemGapUnit: string;

	// List item normal state
	itemJustifyContent: string;
	itemJustifyContent_tablet?: string;
	itemJustifyContent_mobile?: string;
	itemPadding: BoxValues;
	itemPadding_tablet?: BoxValues;
	itemPadding_mobile?: BoxValues;
	itemPaddingUnit: string;
	itemHeight: number;
	itemHeight_tablet?: number;
	itemHeight_mobile?: number;
	itemHeightUnit: string;
	itemBorderType: string;
	itemBorderWidth: BoxValues;
	itemBorderWidthUnit: string;
	itemBorderColor: string;
	itemBorderRadius: number;
	itemBorderRadius_tablet?: number;
	itemBorderRadius_mobile?: number;
	itemBorderRadiusUnit: string;
	itemBoxShadow: BoxShadowValue;
	itemTypography: TypographyValue;
	itemTextColor: string;
	itemBackgroundColor: string;
	itemMargin: BoxValues;
	itemMargin_tablet?: BoxValues;
	itemMargin_mobile?: BoxValues;
	itemMarginUnit: string;

	// Icon container
	iconContainerBackground: string;
	iconContainerSize: number;
	iconContainerSize_tablet?: number;
	iconContainerSize_mobile?: number;
	iconContainerSizeUnit: string;
	iconContainerBorderType: string;
	iconContainerBorderWidth: BoxValues;
	iconContainerBorderWidthUnit: string;
	iconContainerBorderColor: string;
	iconContainerBorderRadius: number;
	iconContainerBorderRadius_tablet?: number;
	iconContainerBorderRadius_mobile?: number;
	iconContainerBorderRadiusUnit: string;
	iconContainerBoxShadow: BoxShadowValue;
	iconTextSpacing: number;
	iconTextSpacing_tablet?: number;
	iconTextSpacing_mobile?: number;
	iconTextSpacingUnit: string;

	// Icon
	iconOnTop: boolean;
	iconSize: number;
	iconSize_tablet?: number;
	iconSize_mobile?: number;
	iconSizeUnit: string;
	iconColor: string;

	// Hover state
	itemBoxShadowHover: BoxShadowValue;
	itemBorderColorHover: string;
	itemTextColorHover: string;
	itemBackgroundColorHover: string;
	iconContainerBackgroundHover: string;
	iconContainerBorderColorHover: string;
	iconColorHover: string;

	// Active state
	itemBoxShadowActive: BoxShadowValue;
	itemTextColorActive: string;
	itemBackgroundColorActive: string;
	itemBorderColorActive: string;
	iconContainerBackgroundActive: string;
	iconContainerBorderColorActive: string;
	iconColorActive: string;

	// Tooltip
	tooltipBottom: boolean;
	tooltipTextColor: string;
	tooltipTypography: TypographyValue;
	tooltipBackgroundColor: string;
	tooltipBorderRadius: number;
	tooltipBorderRadius_tablet?: number;
	tooltipBorderRadius_mobile?: number;
	tooltipBorderRadiusUnit: string;
}

/**
 * Extended attributes type that includes AdvancedTab + VoxelTab attributes
 * Use this type in edit.tsx and save.tsx for proper typing of all block attributes
 */
export type ExtendedAttributes = AdvancedListAttributes & CombinedStyleAttributes & {
	blockId?: string;
	// VoxelTab attributes
	visibilityBehavior?: string;
	visibilityRules?: Array<Record<string, unknown>>;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: number | string;
	loopOffset?: number | string;
};

/**
 * vxconfig structure for frontend hydration
 */
export interface VxConfig {
	items: ActionItem[];
	icons: {
		closeIcon: IconValue | null;
		messageIcon: IconValue | null;
		linkIcon: IconValue | null;
		shareIcon: IconValue | null;
	};
	list: {
		enableCssGrid: boolean;
		gridColumns: number;
		itemWidth: string;
		customItemWidth: number;
		customItemWidthUnit: string;
		listJustify: string;
		itemGap: number;
		itemGapUnit: string;
	};
	itemStyle: {
		justifyContent: string;
		padding: BoxValues;
		paddingUnit: string;
		height: number;
		heightUnit: string;
		borderType: string;
		borderWidth: BoxValues;
		borderWidthUnit: string;
		borderColor: string;
		borderRadius: number;
		borderRadiusUnit: string;
		boxShadow: BoxShadowValue;
		typography: TypographyValue;
		textColor: string;
		backgroundColor: string;
	};
	iconContainer: {
		background: string;
		size: number;
		sizeUnit: string;
		borderType: string;
		borderWidth: BoxValues;
		borderWidthUnit: string;
		borderColor: string;
		borderRadius: number;
		borderRadiusUnit: string;
		boxShadow: BoxShadowValue;
		textSpacing: number;
		textSpacingUnit: string;
	};
	icon: {
		onTop: boolean;
		size: number;
		sizeUnit: string;
		color: string;
	};
	hoverStyle: {
		boxShadow: BoxShadowValue;
		borderColor: string;
		textColor: string;
		backgroundColor: string;
		iconContainerBackground: string;
		iconContainerBorderColor: string;
		iconColor: string;
	};
	activeStyle: {
		boxShadow: BoxShadowValue;
		textColor: string;
		backgroundColor: string;
		borderColor: string;
		iconContainerBackground: string;
		iconContainerBorderColor: string;
		iconColor: string;
	};
	tooltip: {
		bottom: boolean;
		textColor: string;
		typography: TypographyValue;
		backgroundColor: string;
		borderRadius: number;
		borderRadiusUnit: string;
	};
}

/**
 * Shared component props
 */
export interface AdvancedListComponentProps {
	attributes: AdvancedListAttributes;
	context: 'editor' | 'frontend';
	postContext?: PostContext | null;
}

/**
 * Post context for post-dependent actions
 */
export interface PostContext {
	postId: number;
	postTitle: string;
	postLink: string;
	editLink: string | null;
	isEditable: boolean;
	isFollowed: boolean;
	isFollowRequested: boolean;
	isAuthorFollowed: boolean;
	isAuthorFollowRequested: boolean;
	editSteps: EditStep[];
}

/**
 * Edit step for multi-step edit action
 */
export interface EditStep {
	key: string;
	label: string;
	link: string;
}

/**
 * Default action item for creating new items
 */
export const DEFAULT_ACTION_ITEM: ActionItem = {
	id: '',
	actionType: 'none',
	text: 'Action',
	icon: null,
	enableTooltip: false,
	tooltipText: '',
	link: null,
	scrollToId: '',
	additionId: '',
	calStartDate: '',
	calEndDate: '',
	calTitle: '',
	calDescription: '',
	calLocation: '',
	calUrl: '',
	cartOptsText: 'Select options',
	cartOptsEnableTooltip: false,
	cartOptsTooltipText: '',
	cartOptsIcon: null,
	activeText: 'Action',
	activeIcon: null,
	activeEnableTooltip: false,
	activeTooltipText: '',
	customStyle: false,
	customIconColor: '',
	customIconColorActive: '',
	// Loop repeater row
	loopSource: '',
	loopProperty: '',
	loopLimit: '',
	loopOffset: '',
	// Row visibility
	rowVisibility: 'show',
	visibilityRules: [],
};

/**
 * Action type labels for display
 */
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
	none: 'None',
	action_link: 'Link',
	add_to_cart: 'Add to cart',
	promote_post: 'Promote post',
	action_follow_post: 'Follow post',
	action_follow: 'Follow post author',
	edit_post: 'Edit post',
	delete_post: 'Delete post',
	unpublish_post: 'Unpublish post',
	publish_post: 'Publish post',
	show_post_on_map: 'Show on map',
	share_post: 'Share post',
	view_post_stats: 'View post stats',
	go_back: 'Go back',
	select_addition: 'Select add-on',
	back_to_top: 'Back to top',
	scroll_to_section: 'Scroll to section',
	action_gcal: 'Add to Google Calendar',
	action_ical: 'Add to iCalendar',
	action_save: 'Save post to collection',
	direct_message: 'Message post',
	direct_message_user: 'Message post author',
	relist_post: 'Relist post',
	switch_listing_plan: 'Switch listing plan',
};

/**
 * Actions that require post context
 */
export const POST_DEPENDENT_ACTIONS: ActionType[] = [
	'action_follow_post',
	'action_follow',
	'edit_post',
	'delete_post',
	'unpublish_post',
	'publish_post',
	'show_post_on_map',
	'share_post',
	'view_post_stats',
	'add_to_cart',
	'promote_post',
	'select_addition',
	'action_gcal',
	'action_ical',
	'action_save',
	'direct_message',
	'direct_message_user',
	'relist_post',
	'switch_listing_plan',
];

/**
 * Actions that have active state
 */
export const ACTIVE_STATE_ACTIONS: ActionType[] = [
	'action_follow',
	'action_follow_post',
	'select_addition',
	'promote_post',
	'action_save',
];
