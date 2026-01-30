/**
 * Userbar Block - TypeScript Types
 *
 * Based on Voxel User Bar widget controls from:
 * - themes/voxel/app/widgets/user-bar.php
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';
import type { VisibilityRule } from '@shared/controls';

export interface TypographyValue {
	fontFamily?: string;
	fontWeight?: string;
	fontSize?: { size: number; unit: string };
	lineHeight?: { size: number; unit: string };
	letterSpacing?: { size: number; unit: string };
	textTransform?: string;
	textDecoration?: string;
	fontStyle?: string;
}

export interface BoxShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outline' | 'inset';
}

/**
 * Component type options matching Voxel's ts_component_type control
 */
export type UserbarComponentType =
	| 'notifications'
	| 'cart'
	| 'messages'
	| 'user_menu'
	| 'select_wp_menu'
	| 'link';

/**
 * Visibility options for responsive controls
 */
export type VisibilityOption = 'flex' | 'none';

/**
 * URL configuration for custom links
 */
export interface ComponentUrl {
	url: string;
	is_external: boolean;
	nofollow: boolean;
}

/**
 * Single userbar item (repeater item)
 * Matches Voxel's ts_userbar_items repeater controls
 */
export interface UserbarItem {
	/** Unique item ID */
	_id: string;
	/** Component type */
	componentType: UserbarComponentType;
	/** WordPress menu slug (for user_menu and select_wp_menu) */
	chooseMenu: string;
	/** Icon configuration */
	icon: IconValue;
	/** URL for custom links */
	componentUrl: ComponentUrl;
	/** Label for custom link */
	componentTitle: string;
	/** Label for messages component */
	messagesTitle: string;
	/** Label for WP menu component */
	wpMenuTitle: string;
	/** Label for notifications component */
	notificationsTitle: string;
	/** Label for cart component */
	cartTitle: string;
	/** Enable label visibility control */
	labelVisibility: boolean;
	/** Show label on desktop */
	labelVisibilityDesktop: VisibilityOption;
	/** Show label on tablet */
	labelVisibilityTablet: VisibilityOption;
	/** Show label on mobile */
	labelVisibilityMobile: VisibilityOption;
	/** Enable component visibility control */
	componentVisibility: boolean;
	/** Show component on desktop */
	userBarVisibilityDesktop: VisibilityOption;
	/** Show component on tablet */
	userBarVisibilityTablet: VisibilityOption;
	/** Show component on mobile */
	userBarVisibilityMobile: VisibilityOption;

	// Loop & Visibility
	/** Loop source */
	loopSource?: string;
	/** Loop property */
	loopProperty?: string;
	/** Loop limit */
	loopLimit?: string;
	/** Loop offset */
	loopOffset?: string;
	/** Row visibility mode */
	rowVisibility?: 'show' | 'hide';
	/** Visibility rules */
	visibilityRules?: VisibilityRule[];
}

/**
 * Default userbar item
 */
export const DEFAULT_USERBAR_ITEM: UserbarItem = {
	_id: '',
	componentType: 'notifications',
	chooseMenu: '',
	icon: { library: 'icon', value: 'las la-bell' },
	componentUrl: { url: '', is_external: true, nofollow: true },
	componentTitle: '',
	messagesTitle: 'Messages',
	wpMenuTitle: 'Menu',
	notificationsTitle: 'Notifications',
	cartTitle: 'Cart',
	labelVisibility: false,
	labelVisibilityDesktop: 'none',
	labelVisibilityTablet: 'none',
	labelVisibilityMobile: 'none',
	componentVisibility: false,
	userBarVisibilityDesktop: 'flex',
	userBarVisibilityTablet: 'flex',
	userBarVisibilityMobile: 'flex',
	// Loop defaults
	rowVisibility: 'show',
	visibilityRules: [],
};

/**
 * Icons configuration for the block
 */
export interface UserbarIcons {
	downArrow: IconValue;
	rightArrow: IconValue;
	leftArrow: IconValue;
	close: IconValue;
	trash: IconValue;
	inbox: IconValue;
	loadMore: IconValue;
}

/**
 * Box dimensions (margin/padding)
 */
export interface BoxDimensions {
	top: string;
	right: string;
	bottom: string;
	left: string;
	unit: string;
}

/**
 * Block attributes interface
 * Complete type definition for all Userbar block attributes
 */
export interface UserbarAttributes {
	/** Block instance ID */
	blockId: string;
	/** Userbar items (repeater) */
	items: UserbarItem[];
	/** Icons configuration */
	icons: UserbarIcons;

	// Layout - General
	/** Horizontal alignment of items */
	itemsAlign: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
	itemsAlign_tablet?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
	itemsAlign_mobile?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
	/** Vertical orientation on desktop */
	verticalOrientation: boolean;
	/** Vertical orientation on tablet */
	verticalOrientationTablet: boolean;
	/** Vertical orientation on mobile */
	verticalOrientationMobile: boolean;
	/** Align content within vertical items */
	itemContentAlign: 'left' | 'center' | 'right';
	itemContentAlign_tablet?: 'left' | 'center' | 'right';
	itemContentAlign_mobile?: 'left' | 'center' | 'right';

	// Item Spacing
	/** Gap between items */
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	/** Item margin */
	itemMargin: BoxDimensions;
	/** Item padding */
	itemPadding: BoxDimensions;

	// Item Background
	/** Item background color */
	itemBackground: string;
	/** Item background color on hover */
	itemBackgroundHover: string;
	/** Item border radius */
	itemBorderRadius: number;
	itemBorderRadius_tablet?: number;
	itemBorderRadius_mobile?: number;
	/** Gap between icon and label */
	itemContentGap: number;
	itemContentGap_tablet?: number;
	itemContentGap_mobile?: number;

	// Icon Container
	/** Icon container size */
	iconContainerSize: number;
	iconContainerSize_tablet?: number;
	iconContainerSize_mobile?: number;
	/** Icon container border radius */
	iconContainerRadius: number;
	iconContainerRadius_tablet?: number;
	iconContainerRadius_mobile?: number;
	/** Icon container background */
	iconContainerBackground: string;
	/** Icon container background on hover */
	iconContainerBackgroundHover: string;

	// Icon
	/** Icon size */
	iconSize: number;
	iconSize_tablet?: number;
	iconSize_mobile?: number;
	/** Icon color */
	iconColor: string;
	/** Icon color on hover */
	iconColorHover: string;

	// Unread Indicator
	/** Unread indicator color */
	unreadIndicatorColor: string;
	/** Unread indicator top margin */
	unreadIndicatorMargin: number;
	unreadIndicatorMargin_tablet?: number;
	unreadIndicatorMargin_mobile?: number;
	/** Unread indicator size */
	unreadIndicatorSize: number;
	unreadIndicatorSize_tablet?: number;
	unreadIndicatorSize_mobile?: number;

	// Avatar (for user_menu)
	/** Avatar size */
	avatarSize: number;
	avatarSize_tablet?: number;
	avatarSize_mobile?: number;
	/** Avatar border radius */
	avatarRadius: number;
	avatarRadius_tablet?: number;
	avatarRadius_mobile?: number;

	// Label Typography
	/** Label typography settings */
	labelTypography: TypographyValue;
	/** Label text color */
	labelColor: string;
	/** Label text color on hover */
	labelColorHover: string;

	// Chevron
	/** Chevron color */
	chevronColor: string;
	/** Chevron color on hover */
	chevronColorHover: string;
	/** Hide chevron */
	hideChevron: boolean;

	// Custom Popup Styling
	/** Enable custom popup styling */
	customPopupEnable: boolean;
	/** Popup backdrop color */
	popupBackdropColor: string;
	/** Enable pointer events for backdrop */
	popupPointerEvents: boolean;
	/** Popup box shadow */
	popupBoxShadow: BoxShadowValue;
	/** Popup top/bottom margin */
	popupTopMargin: number;
	popupTopMargin_tablet?: number;
	popupTopMargin_mobile?: number;
	/** Popup max height */
	popupMaxHeight: number;
	popupMaxHeight_tablet?: number;
	popupMaxHeight_mobile?: number;
}

/**
 * VxConfig structure for frontend hydration
 * Contains all data needed for React to render the block on frontend
 */
export interface UserbarVxConfig {
	items: UserbarItem[];
	icons: UserbarIcons;
	settings: {
		itemsAlign: string;
		verticalOrientation: boolean;
		verticalOrientationTablet: boolean;
		verticalOrientationMobile: boolean;
		itemContentAlign: string;
		hideChevron: boolean;
		customPopupEnable: boolean;
	};
}

/**
 * User data from REST API
 */
export interface UserData {
	id: number;
	displayName: string;
	avatarUrl: string;
	avatarMarkup: string;
}

/**
 * Notification item from REST API
 */
export interface NotificationItem {
	id: string;
	subject: string;
	time: string;
	image_url: string | null;
	links_to: string;
	seen: boolean;
	is_new: boolean;
	actions?: NotificationAction[];
	actions_page?: number;
	total_pages?: number;
	_loading?: boolean;
}

/**
 * Notification action
 */
export interface NotificationAction {
	type: 'list-item' | 'button';
	key?: string;
	subject?: string;
	details?: string;
	image_markup?: string;
	links_to?: string;
	label?: string;
	actions?: NotificationAction[];
	_loading?: boolean;
	_page?: number;
}

/**
 * Chat item from REST API
 */
export interface ChatItem {
	id: string;
	target: {
		name: string;
		avatar: string;
	};
	excerpt: string;
	time: string;
	link: string;
	seen: boolean;
	is_new: boolean;
}

/**
 * Cart item from REST API
 */
export interface CartItem {
	key: string;
	title: string;
	subtitle?: string;
	logo: string;
	link: string;
	product_mode: 'regular' | 'variable';
	stock_id: string;
	quantity: {
		enabled: boolean;
		max: number;
	};
	value: {
		stock?: { quantity: number };
		variations?: { quantity: number };
	};
	pricing: {
		total_amount: number;
		_currency?: string;
	};
	_disabled?: boolean;
}

/**
 * WordPress Nav Menu item
 */
export interface NavMenuItem {
	id: number;
	title: string;
	url: string;
	target?: string;
	classes?: string[];
	children?: NavMenuItem[];
}

/**
 * REST API response types
 */
export interface NotificationsListResponse {
	success: boolean;
	list: NotificationItem[];
	has_more: boolean;
	message?: string;
}

export interface ChatsListResponse {
	success: boolean;
	list: ChatItem[];
	has_more: boolean;
	message?: string;
}

export interface CartItemsResponse {
	success: boolean;
	items: Record<string, CartItem>;
	checkout_link: string;
	message?: string;
}

export interface NavMenusResponse {
	menus: Array<{
		slug: string;
		name: string;
		items: NavMenuItem[];
	}>;
}

export interface UserDataResponse {
	success: boolean;
	user: UserData | null;
	isLoggedIn: boolean;
}

/**
 * Global variable injected by functions.php
 */
export interface GlobalVoxelFSEUser {
	isLoggedIn: boolean;
	avatarUrl: string;
	avatarMarkup: string;
	displayName: string;
	id: number;
}

/**
 * VX_Cart global interface - exposed for external scripts
 * Reference: voxel-user-bar.beautified.js line 210 (window.VX_Cart = this)
 */
export interface VXCartGlobal {
	/** Open the cart popup */
	open: () => void;
	/** Refresh cart items from server */
	getItems: () => void;
	/** Check if cart has items */
	hasItems: () => boolean;
	/** Get subtotal */
	getSubtotal: () => number;
	/** Whether cart is currently loading */
	loading: boolean;
	/** Whether cart is loaded */
	loaded: boolean;
	/** Current cart items */
	items: Record<string, CartItem> | null;
	/** Checkout link */
	checkout_link: string;
}

declare global {
	interface Window {
		VoxelFSEUser?: GlobalVoxelFSEUser;
		VX_Cart?: VXCartGlobal;
	}
}
