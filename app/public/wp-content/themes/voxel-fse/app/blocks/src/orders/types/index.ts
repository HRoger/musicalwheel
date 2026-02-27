/**
 * Orders Block - Type Definitions
 *
 * TypeScript interfaces for the Orders block following Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';

/**
 * Icon configuration for the block
 */
export interface OrdersIcons {
	searchIcon: IconValue;
	noResultsIcon: IconValue;
	resetSearchIcon: IconValue;
	backIcon: IconValue;
	forwardIcon: IconValue;
	downIcon: IconValue;
	inboxIcon: IconValue;
	checkmarkIcon: IconValue;
	menuIcon: IconValue;
	infoIcon: IconValue;
	filesIcon: IconValue;
	trashIcon: IconValue;
	calendarIcon: IconValue;
}

/**
 * Box/spacing values (top, right, bottom, left)
 */
export interface BoxValues {
	top?: number | string;
	right?: number | string;
	bottom?: number | string;
	left?: number | string;
}

/**
 * Typography values
 */
export interface TypographyValue {
	[key: string]: unknown;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: string;
	lineHeight?: number;
	letterSpacing?: number;
	textTransform?: string;
}

/**
 * Block attributes as stored in block.json
 */
export interface OrdersBlockAttributes {
	blockId: string;

	// Head section
	headHide: boolean;
	ordersTitle: string;
	ordersSubtitle: string;

	// Icons
	searchIcon: IconValue;
	noResultsIcon: IconValue;
	resetSearchIcon: IconValue;
	backIcon: IconValue;
	forwardIcon: IconValue;
	downIcon: IconValue;
	inboxIcon: IconValue;
	checkmarkIcon: IconValue;
	menuIcon: IconValue;
	infoIcon: IconValue;
	filesIcon: IconValue;
	trashIcon: IconValue;
	calendarIcon: IconValue;

	// Legacy title styling
	titleTypography: TypographyValue;
	titleColor: string;
	subtitleTypography: TypographyValue;
	subtitleColor: string;

	// Style Tab panel state
	styleTabOpenPanel: string;

	// Section 1: General
	generalTitleTypography: TypographyValue;
	generalTitleColor: string;
	generalSubtitleTypography: TypographyValue;
	generalSubtitleColor: string;
	generalSpacing: number;
	generalSpacing_tablet: number;
	generalSpacing_mobile: number;

	// Section 2: Primary button
	primaryBtnState: string;
	primaryBtnTypography: TypographyValue;
	primaryBtnBorderType: string;
	primaryBtnBorderRadius: number;
	primaryBtnBorderRadius_tablet: number;
	primaryBtnBorderRadius_mobile: number;
	primaryBtnBoxShadow: Record<string, unknown>;
	primaryBtnTextColor: string;
	primaryBtnBackground: string;
	primaryBtnIconSize: number;
	primaryBtnIconSize_tablet: number;
	primaryBtnIconSize_mobile: number;
	primaryBtnIconColor: string;
	primaryBtnIconSpacing: number;
	primaryBtnIconSpacing_tablet: number;
	primaryBtnIconSpacing_mobile: number;
	primaryBtnTextColorHover: string;
	primaryBtnBackgroundHover: string;
	primaryBtnBorderColorHover: string;
	primaryBtnBoxShadowHover: Record<string, unknown>;
	primaryBtnIconColorHover: string;

	// Section 3: Secondary button
	secondaryBtnState: string;
	secondaryBtnIconColor: string;
	secondaryBtnIconSize: number;
	secondaryBtnIconSize_tablet: number;
	secondaryBtnIconSize_mobile: number;
	secondaryBtnIconSpacing: number;
	secondaryBtnIconSpacing_tablet: number;
	secondaryBtnIconSpacing_mobile: number;
	secondaryBtnBackground: string;
	secondaryBtnBorderType: string;
	secondaryBtnBorderRadius: number;
	secondaryBtnBorderRadius_tablet: number;
	secondaryBtnBorderRadius_mobile: number;
	secondaryBtnTypography: TypographyValue;
	secondaryBtnTextColor: string;
	secondaryBtnIconColorHover: string;
	secondaryBtnBackgroundHover: string;
	secondaryBtnBorderColorHover: string;
	secondaryBtnTextColorHover: string;

	// Section 4: Cards
	cardState: string;
	cardBackground: string;
	cardBorderType: string;
	cardBorderRadius: number;
	cardBorderRadius_tablet: number;
	cardBorderRadius_mobile: number;
	cardAvatarSize: number;
	cardAvatarSize_tablet: number;
	cardAvatarSize_mobile: number;
	cardAvatarBorderRadius: number;
	cardAvatarBorderRadius_tablet: number;
	cardAvatarBorderRadius_mobile: number;
	cardOrderIdTypography: TypographyValue;
	cardOrderIdColor: string;
	cardOrderIdBackground: string;
	cardOrderIdBorderRadius: number;
	cardOrderIdBorderRadius_tablet: number;
	cardOrderIdBorderRadius_mobile: number;
	cardOrderTitleTypography: TypographyValue;
	cardOrderTitleTypographyPending: TypographyValue;
	cardOrderTitleColor: string;
	cardOrderDetailsTypography: TypographyValue;
	cardOrderDetailsColor: string;
	cardBackgroundHover: string;
	cardBorderColorHover: string;
	cardPadding: BoxValues;
	cardPadding_tablet: BoxValues;
	cardPadding_mobile: BoxValues;

	// Section 5: Order statuses
	statusPadding: BoxValues;
	statusBorderRadius: number;
	statusBorderRadius_tablet: number;
	statusBorderRadius_mobile: number;
	statusTypography: TypographyValue;
	statusOrangeColor: string;
	statusGreenColor: string;
	statusNeutralColor: string;
	statusRedColor: string;
	statusGreyColor: string;
	statusBlueColor: string;
	statusPendingColor: string;
	statusCompletedColor: string;
	statusCancelledColor: string;
	statusRefundedColor: string;

	// Section 6: Filters common styles
	filterCommonState: string;
	filterHeight: number;
	filterHeight_tablet: number;
	filterHeight_mobile: number;
	filterBorderRadius: number;
	filterBorderRadius_tablet: number;
	filterBorderRadius_mobile: number;
	filterBoxShadow: Record<string, unknown>;
	filterBorderType: string;
	filterBackground: string;
	filterTextColor: string;
	filterTypography: TypographyValue;
	filterChevronColor: string;
	filterBoxShadowHover: Record<string, unknown>;
	filterBorderColorHover: string;
	filterBackgroundHover: string;
	filterTextColorHover: string;
	filterChevronColorHover: string;
	filterBackgroundActive: string;
	filterTextColorActive: string;

	// Section 7: Filter dropdown
	filterDropdownState: string;
	filterDropdownTypography: TypographyValue;
	filterDropdownBackground: string;
	filterDropdownTextColor: string;
	filterDropdownBorderColor: string;
	filterDropdownBorderWidth: number;
	filterDropdownBorderWidth_tablet: number;
	filterDropdownBorderWidth_mobile: number;
	filterDropdownBoxShadow: Record<string, unknown>;
	filterDropdownChevronColor: string;

	// Section 8: Filter input
	filterInputState: string;
	filterInputPlaceholderColor: string;
	filterInputIconSize: number;
	filterInputIconSize_tablet: number;
	filterInputIconSize_mobile: number;
	filterInputIconColor: string;
	filterInputIconMargin: number;
	filterInputIconMargin_tablet: number;
	filterInputIconMargin_mobile: number;
	filterInputBackgroundFocus: string;
	filterInputBorderColorFocus: string;

	// Section 9: Single order event
	singleEventAvatarSize: number;
	singleEventAvatarSize_tablet: number;
	singleEventAvatarSize_mobile: number;
	singleEventAvatarBorderRadius: number;
	singleEventAvatarBorderRadius_tablet: number;
	singleEventAvatarBorderRadius_mobile: number;
	singleEventOrderTitleTypography: TypographyValue;
	singleEventOrderTitleColor: string;
	singleEventTitleTypography: TypographyValue;
	singleEventTitleColor: string;
	singleEventDetailsTypography: TypographyValue;
	singleEventDetailsColor: string;
	singleEventDividerColor: string;
	singleEventFilesTypography: TypographyValue;
	singleEventFilesColor: string;

	// Section 10: Single event box
	singleEventBoxPadding: BoxValues;
	singleEventBoxBorderType: string;
	singleEventBoxBorderRadius: number;
	singleEventBoxBorderRadius_tablet: number;
	singleEventBoxBorderRadius_mobile: number;
	singleEventBoxBackground: string;

	// Section 11: Single order items
	singleItemSpacing: number;
	singleItemSpacing_tablet: number;
	singleItemSpacing_mobile: number;
	singleItemContentSpacing: number;
	singleItemContentSpacing_tablet: number;
	singleItemContentSpacing_mobile: number;
	singleItemPictureSize: number;
	singleItemPictureSize_tablet: number;
	singleItemPictureSize_mobile: number;
	singleItemPictureRadius: number;
	singleItemPictureRadius_tablet: number;
	singleItemPictureRadius_mobile: number;
	singleItemTitleTypography: TypographyValue;
	singleItemTitleColor: string;
	singleItemSubtitleTypography: TypographyValue;
	singleItemSubtitleColor: string;

	// Section 12: Single table
	singleTableListSpacing: number;
	singleTableListSpacing_tablet: number;
	singleTableListSpacing_mobile: number;
	singleTableTypography: TypographyValue;
	singleTableTextColor: string;
	singleTableTypographyTotal: TypographyValue;
	singleTableTextColorTotal: string;

	// Section 13: Single accordion title
	singleAccordionTitleTypography: TypographyValue;
	singleAccordionTitleColor: string;
	singleAccordionIconColor: string;
	singleAccordionDividerColor: string;

	// Section 14: Single notes
	singleNotesTypography: TypographyValue;
	singleNotesTextColor: string;
	singleNotesLinkColor: string;

	// Section 15: No results
	noResultsContentGap: number;
	noResultsContentGap_tablet: number;
	noResultsContentGap_mobile: number;
	noResultsIconSize: number;
	noResultsIconSize_tablet: number;
	noResultsIconSize_mobile: number;
	noResultsIconColor: string;
	noResultsTypography: TypographyValue;
	noResultsTextColor: string;
	noResultsLinkColor: string;

	// Section 16: Loading spinner
	loadingSpinnerColor1: string;
	loadingSpinnerColor2: string;

	// Legacy button styling
	primaryButtonBackground: string;
	primaryButtonBackgroundHover: string;
	primaryButtonTextColor: string;
	primaryButtonTextColorHover: string;
	secondaryButtonBackground: string;
	secondaryButtonBackgroundHover: string;
	secondaryButtonTextColor: string;
	secondaryButtonTextColorHover: string;

	// Block spacing
	blockMargin: BoxValues;
	blockMargin_tablet: BoxValues;
	blockMargin_mobile: BoxValues;
	blockPadding: BoxValues;
	blockPadding_tablet: BoxValues;
	blockPadding_mobile: BoxValues;

	// Visibility
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;

	// Custom
	customClasses: string;
	customCSS: string;

	// Allow dynamic attribute access for shared controls
	[key: string]: unknown;
}

/**
 * Order status enumeration
 */
export type OrderStatus =
	| 'pending_payment'
	| 'pending_approval'
	| 'completed'
	| 'cancelled'
	| 'refunded'
	| 'declined'
	| 'sub_active'
	| 'sub_past_due'
	| 'sub_paused'
	| 'sub_canceled'
	| 'sub_unpaid'
	| 'sub_incomplete';

/**
 * Shipping status enumeration
 */
export type ShippingStatus =
	| 'not_shipped'
	| 'shipped'
	| 'delivered'
	| 'returned';

/**
 * Order customer information
 */
export interface OrderCustomer {
	id: number | null;
	name: string;
	link: string;
	avatar: string;
	customer_details?: Array<{
		label: string;
		content: string;
	}>;
	shipping_details?: Array<{
		label: string;
		content: string;
	}>;
	order_notes?: string;
}

/**
 * Order vendor information
 */
export interface OrderVendor {
	id: number | null;
	name: string;
	link: string;
	avatar: string;
	notes_to_customer?: string;
	fees?: {
		breakdown: Array<{
			label: string;
			content: string;
		}>;
		total: number;
	};
}

/**
 * Product information within an order
 */
export interface OrderProduct {
	id: number;
	label: string;
	description: string;
	link: string;
	thumbnail_url: string;
}

/**
 * Promotion package details (for promotion order items)
 * Reference: voxel-orders.beautified.js lines 168-188
 */
export interface PromotionPackage {
	id: number;
	label: string;
	start_date: string | null;
	end_date: string | null;
	status: 'active' | 'pending' | 'expired' | 'cancelled';
	post_id: number;
	post_title: string;
	post_link: string;
	/** Link to promotion stats page */
	stats_link?: string;
	/** Whether promotion is assigned to a post */
	assigned_to_post?: boolean;
}

/**
 * Order item details structure
 */
export interface OrderItemDetails {
	promotion_package?: PromotionPackage;
	[key: string]: unknown;
}

/**
 * Order item (line item)
 */
export interface OrderItem {
	id: number;
	type: 'regular' | 'subscription' | 'promotion';
	product: OrderProduct;
	subtotal: number;
	currency: string;
	data_inputs_markup: string;
	components: OrderItemComponent[];
	details: OrderItemDetails;
	_expanded?: boolean;
}

/**
 * Order item component (dynamic rendering)
 */
export interface OrderItemComponent {
	type: string;
	data: Record<string, unknown>;
}

/**
 * Order component (for timeline events)
 */
export interface OrderComponent {
	type: string;
	data: Record<string, unknown>;
}

/**
 * Order pricing breakdown
 */
export interface OrderPricing {
	subtotal: number | null;
	discount_amount: number | null;
	tax_amount: number | null;
	shipping_amount: number | null;
	total: number | null;
	currency: string;
	subscription_interval: string | null;
	sections: Array<{
		label: string;
		type: 'list' | 'other';
		items?: Array<{
			label: string;
			content: string;
			bold?: boolean;
		}>;
	}>;
}

/**
 * Order shipping information
 */
export interface OrderShipping {
	enabled: boolean;
	status: {
		key: ShippingStatus;
		label: string;
		class?: string;
	};
}

/**
 * Order action
 */
export interface OrderAction {
	action: string;
	label: string;
	confirm?: string;
	fields?: Array<{
		key: string;
		type: string;
		label: string;
		required?: boolean;
		options?: Array<{
			value: string;
			label: string;
		}>;
	}>;
}

/**
 * Child order (for marketplace orders with multiple vendors)
 */
export interface ChildOrder {
	id: number;
	vendor: {
		id: number;
		name: string;
		avatar: string;
	};
	item_count: number;
	subtotal: number | null;
	total: number | null;
	currency: string;
	status: OrderStatus;
	shipping_status: ShippingStatus | null;
}

/**
 * Complete order object
 */
export interface Order {
	id: number;
	status: {
		key: OrderStatus;
		label: string;
	};
	created_at: string;
	customer: OrderCustomer;
	vendor: OrderVendor;
	items: OrderItem[];
	pricing: OrderPricing;
	shipping: OrderShipping;
	components: OrderComponent[];
	child_orders: ChildOrder[];
	actions: {
		primary: OrderAction[];
		secondary: OrderAction[];
		dms: {
			enabled: boolean;
			vendor_target?: number;
		};
	};
}

/**
 * Order list item (summary for list view)
 */
export interface OrderListItem {
	id: number;
	status: OrderStatus;
	shipping_status: ShippingStatus | null;
	created_at: string;
	item_count: number;
	customer: {
		id: number | null;
		name: string;
		avatar: string;
	};
	vendor: {
		id: number | null;
		name: string;
		avatar: string;
	};
	subtotal: number | null;
	total: number | null;
	currency: string;
	product_type?: string | null;
	first_item_label?: string | null;
	first_item_type?: string | null;
	first_item_claim_title?: string | null;
}

/**
 * Status configuration
 */
export interface StatusConfig {
	key: string;
	label: string;
	class?: string;
}

/**
 * Product type for filtering
 */
export interface ProductTypeFilter {
	key: string;
	label: string;
}

/**
 * Messages configuration for direct messaging
 */
export interface MessagesConfig {
	url: string;
	enquiry_text: {
		vendor: string;
		customer: string;
	};
}

/**
 * Orders configuration from REST API
 */
export interface OrdersConfig {
	statuses: Record<OrderStatus, StatusConfig>;
	statuses_ui: Record<OrderStatus, { class: string }>;
	shipping_statuses: Record<ShippingStatus, StatusConfig>;
	product_types: ProductTypeFilter[];
	available_statuses: string[];
	available_shipping_statuses: string[];
	is_vendor: boolean;
	is_admin: boolean;
	current_user_id: number | null;
	messages?: MessagesConfig;
	data_inputs?: {
		content_length: number;
	};
	nonce?: string;
}

/**
 * Orders list response from REST API
 */
export interface OrdersListResponse {
	orders: OrderListItem[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}

/**
 * Single order response from REST API
 */
export interface SingleOrderResponse {
	order: Order;
}

/**
 * VxConfig structure for save.tsx output
 */
export interface OrdersVxConfig {
	// Head settings
	headHide: boolean;
	ordersTitle: string;
	ordersSubtitle: string;

	// Icons (serialized)
	icons: OrdersIcons;

	// Styling (for CSS custom properties)
	titleColor?: string;
	subtitleColor?: string;
	cardBackground?: string;
	cardBackgroundHover?: string;
	cardBorderRadius?: number;

	// Status colors
	statusPendingColor?: string;
	statusCompletedColor?: string;
	statusCancelledColor?: string;
	statusRefundedColor?: string;

	// Button colors
	primaryButtonBackground?: string;
	primaryButtonTextColor?: string;
	secondaryButtonBackground?: string;
	secondaryButtonTextColor?: string;

	// Filter colors
	filterBackground?: string;
	filterTextColor?: string;
}

/**
 * Component context
 */
export type BlockContext = 'editor' | 'frontend';

/**
 * Orders component props
 */
export interface OrdersComponentProps {
	attributes: OrdersBlockAttributes;
	config: OrdersConfig | null;
	orders: OrderListItem[];
	currentOrder: Order | null;
	context: BlockContext;
	isLoading: boolean;
	error: string | null;
	currentPage: number;
	totalPages: number;
	onSearch?: (query: string) => void;
	onStatusFilter?: (status: OrderStatus | null) => void;
	onProductTypeFilter?: (productType: string | null) => void;
	onOrderSelect?: (orderId: number) => void;
	onOrderBack?: () => void;
	onOrderAction?: (orderId: number, action: string, data?: Record<string, unknown>) => void;
	onPageChange?: (page: number) => void;
	onCancelPromotion?: (orderId: number) => Promise<void>;
}

/**
 * Orders list component props
 */
export interface OrdersListProps {
	orders: OrderListItem[];
	config: OrdersConfig | null;
	attributes: OrdersBlockAttributes;
	isLoading: boolean;
	onOrderSelect: (orderId: number) => void;
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

/**
 * Single order component props
 */
export interface SingleOrderProps {
	order: Order;
	config: OrdersConfig | null;
	attributes: OrdersBlockAttributes;
	isLoading: boolean;
	onBack: () => void;
	onAction: (action: string, data?: Record<string, unknown>) => void;
	onCancelPromotion: (orderId: number) => Promise<void>;
	onMessage?: (order: Order) => void;
}

/**
 * Filter state
 */
export interface OrdersFilterState {
	searchQuery: string;
	status: OrderStatus | null;
	shippingStatus: string | null;
	productType: string | null;
	page: number;
}

/**
 * Edit component props (Gutenberg)
 */
export interface EditProps {
	attributes: OrdersBlockAttributes;
	setAttributes: (attrs: Partial<OrdersBlockAttributes>) => void;
	clientId: string;
}

/**
 * Save component props (Gutenberg)
 */
export interface SaveProps {
	attributes: OrdersBlockAttributes;
}

/**
 * API error response
 */
export interface ApiError {
	code: string;
	message: string;
	data?: {
		status: number;
	};
}

/**
 * Currency format helper type
 */
export type CurrencyFormatter = (amount: number, currency: string) => string;

/**
 * File upload item
 * Reference: voxel-orders.beautified.js lines 616-624
 */
export interface UploadedFile {
	/** Source type: 'existing' for already uploaded, 'new_upload' for pending */
	source: 'existing' | 'new_upload';
	/** File ID (numeric for existing, undefined for new) */
	id?: number;
	/** Temporary ID for new uploads (8-char string) */
	_id?: string;
	/** Original filename */
	name: string;
	/** MIME type */
	type: string;
	/** File size in bytes */
	size: number;
	/** Preview URL (object URL for new, attachment URL for existing) */
	preview: string;
	/** The actual File object (only for new uploads) */
	item?: File;
}

/**
 * File upload field configuration
 */
export interface FileUploadField {
	key: string;
	label: string;
	maxFileCount: number;
	allowedFileTypes: string;
	sortable: boolean;
}

/**
 * File upload component props
 * Reference: voxel-orders.beautified.js lines 538-548
 */
export interface FileUploadProps {
	field: FileUploadField;
	value: UploadedFile[];
	onChange: (files: UploadedFile[]) => void;
	context?: {
		orderId: number;
		itemId?: number;
	};
}

/**
 * Item promotion details component props
 * Reference: voxel-orders.beautified.js lines 120-190
 */
export interface ItemPromotionDetailsProps {
	item: OrderItem;
	order: Order;
	config: OrdersConfig | null;
	onCancelPromotion: () => Promise<void>;
	isRunningAction: boolean;
	/** Info icon from block attributes for .order-event-icon */
	infoIcon?: IconValue;
}
