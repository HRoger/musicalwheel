/**
 * Cart Summary Block - Type Definitions
 *
 * TypeScript interfaces for the Cart Summary block following Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/controls/IconPickerControl';
import type { CombinedStyleAttributes } from '@shared/utils';

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
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: string;
	lineHeight?: number;
	letterSpacing?: number;
	textTransform?: string;
}

/**
 * Box shadow value
 */
export interface BoxShadowValue {
	color?: string;
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	position?: string;
}

/**
 * Icon configuration for the block
 */
export interface CartSummaryIcons {
	deleteIcon: IconValue;
	noProductsIcon: IconValue;
	loginIcon: IconValue;
	emailIcon: IconValue;
	userIcon: IconValue;
	uploadIcon: IconValue;
	shippingIcon: IconValue;
	minusIcon: IconValue;
	plusIcon: IconValue;
	checkoutIcon: IconValue;
	continueIcon: IconValue;
}

/**
 * Block attributes as stored in block.json
 */
export interface CartSummaryBlockAttributes extends CombinedStyleAttributes {
	blockId: string;

	// Icons
	deleteIcon: IconValue;
	noProductsIcon: IconValue;
	loginIcon: IconValue;
	emailIcon: IconValue;
	userIcon: IconValue;
	uploadIcon: IconValue;
	shippingIcon: IconValue;
	minusIcon: IconValue;
	plusIcon: IconValue;
	checkoutIcon: IconValue;
	continueIcon: IconValue;

	// General Section Spacing
	sectionSpacing: number | null;
	sectionSpacing_tablet: number | null;
	sectionSpacing_mobile: number | null;

	// Title styling
	titleTypography: TypographyValue;
	titleColor: string;

	// Empty cart styling
	emptyCartGap: number | null;
	emptyCartGap_tablet: number | null;
	emptyCartGap_mobile: number | null;
	emptyCartIconSize: number | null;
	emptyCartIconSize_tablet: number | null;
	emptyCartIconSize_mobile: number | null;
	emptyCartIconColor: string;
	emptyCartTypography: TypographyValue;
	emptyCartTextColor: string;

	// Primary button styling
	primaryBtnTypography: TypographyValue;
	primaryBtnBorderType: string;
	primaryBtnBorderWidth: BoxValues;
	primaryBtnBorderColor: string;
	primaryBtnRadius: number | null;
	primaryBtnRadius_tablet: number | null;
	primaryBtnRadius_mobile: number | null;
	primaryBtnBoxShadow: BoxShadowValue;
	primaryBtnTextColor: string;
	primaryBtnBgColor: string;
	primaryBtnIconSize: number | null;
	primaryBtnIconSize_tablet: number | null;
	primaryBtnIconSize_mobile: number | null;
	primaryBtnIconColor: string;
	primaryBtnIconSpacing: number | null;
	primaryBtnIconSpacing_tablet: number | null;
	primaryBtnIconSpacing_mobile: number | null;
	primaryBtnTextColorHover: string;
	primaryBtnBgColorHover: string;
	primaryBtnBorderColorHover: string;
	primaryBtnBoxShadowHover: BoxShadowValue;
	primaryBtnIconColorHover: string;

	// Secondary button styling
	secondaryBtnTypography: TypographyValue;
	secondaryBtnRadius: number | null;
	secondaryBtnRadius_tablet: number | null;
	secondaryBtnRadius_mobile: number | null;
	secondaryBtnTextColor: string;
	secondaryBtnPadding: BoxValues;
	secondaryBtnPadding_tablet: BoxValues;
	secondaryBtnPadding_mobile: BoxValues;
	secondaryBtnBgColor: string;
	secondaryBtnBorderType: string;
	secondaryBtnBorderWidth: BoxValues;
	secondaryBtnBorderColor: string;
	secondaryBtnIconSize: number | null;
	secondaryBtnIconSize_tablet: number | null;
	secondaryBtnIconSize_mobile: number | null;
	secondaryBtnIconSpacing: number | null;
	secondaryBtnIconSpacing_tablet: number | null;
	secondaryBtnIconSpacing_mobile: number | null;
	secondaryBtnIconColor: string;
	secondaryBtnTextColorHover: string;
	secondaryBtnBgColorHover: string;
	secondaryBtnBorderColorHover: string;
	secondaryBtnIconColorHover: string;

	// Loading styling
	loaderColor1: string;
	loaderColor2: string;

	// Checkbox styling
	checkboxBorderColor: string;
	checkboxSelectedBgColor: string;
	checkboxSelectedBoxShadow: BoxShadowValue;

	// Cart styling
	cartItemSpacing: number | null;
	cartItemSpacing_tablet: number | null;
	cartItemSpacing_mobile: number | null;
	cartItemContentSpacing: number | null;
	cartItemContentSpacing_tablet: number | null;
	cartItemContentSpacing_mobile: number | null;
	cartPictureSize: number | null;
	cartPictureSize_tablet: number | null;
	cartPictureSize_mobile: number | null;
	cartPictureRadius: number | null;
	cartPictureRadius_tablet: number | null;
	cartPictureRadius_mobile: number | null;
	cartTitleTypography: TypographyValue;
	cartTitleColor: string;
	cartSubtitleTypography: TypographyValue;
	cartSubtitleColor: string;

	// Icon button styling
	iconBtnColor: string;
	iconBtnBgColor: string;
	iconBtnBorderType: string;
	iconBtnBorderWidth: BoxValues;
	iconBtnBorderColor: string;
	iconBtnRadius: number | null;
	iconBtnRadius_tablet: number | null;
	iconBtnRadius_mobile: number | null;
	iconBtnValueSize: number | null;
	iconBtnValueColor: string;
	iconBtnColorHover: string;
	iconBtnBgColorHover: string;
	iconBtnBorderColorHover: string;

	// Dropdown button styling
	dropdownTypography: TypographyValue;
	dropdownBoxShadow: BoxShadowValue;
	dropdownBgColor: string;
	dropdownTextColor: string;
	dropdownBorderType: string;
	dropdownBorderWidth: BoxValues;
	dropdownBorderColor: string;
	dropdownRadius: number | null;
	dropdownRadius_tablet: number | null;
	dropdownRadius_mobile: number | null;
	dropdownHeight: number | null;
	dropdownHeight_tablet: number | null;
	dropdownHeight_mobile: number | null;
	dropdownIconColor: string;
	dropdownIconSize: number;
	dropdownIconSize_tablet: number | null;
	dropdownIconSize_mobile: number | null;
	dropdownIconSpacing: number;
	dropdownIconSpacing_tablet: number | null;
	dropdownIconSpacing_mobile: number | null;
	dropdownHideChevron: boolean;
	dropdownChevronColor: string;
	dropdownBgColorHover: string;
	dropdownTextColorHover: string;
	dropdownBorderColorHover: string;
	dropdownIconColorHover: string;
	dropdownBoxShadowHover: BoxShadowValue;
	dropdownTypographyFilled: TypographyValue;
	dropdownBgColorFilled: string;
	dropdownTextColorFilled: string;
	dropdownIconColorFilled: string;
	dropdownBorderColorFilled: string;
	dropdownBorderWidthFilled: number | null;
	dropdownBoxShadowFilled: BoxShadowValue;

	// Ship to styling
	shipToTypography: TypographyValue;
	shipToTextColor: string;
	shipToLinkColor: string;

	// Section divider styling
	dividerTypography: TypographyValue;
	dividerTextColor: string;
	dividerLineColor: string;
	dividerLineHeight: number | null;

	// Subtotal styling
	subtotalTypography: TypographyValue;
	subtotalTextColor: string;

	// Field label styling
	fieldLabelTypography: TypographyValue;
	fieldLabelColor: string;
	fieldLabelLinkColor: string;

	// Input & Textarea styling (Normal)
	inputPlaceholderColor: string;
	inputPlaceholderTypography: TypographyValue;
	inputValueColor: string;
	inputValueTypography: TypographyValue;
	inputBgColor: string;
	inputBorderType: string;
	inputBorderWidth: BoxValues;
	inputBorderColor: string;
	inputPadding: BoxValues;
	inputPadding_tablet: BoxValues;
	inputPadding_mobile: BoxValues;
	inputHeight: number | null;
	inputHeight_tablet: number | null;
	inputHeight_mobile: number | null;
	inputRadius: number | null;
	inputRadius_tablet: number | null;
	inputRadius_mobile: number | null;
	inputWithIconPadding: BoxValues;
	inputWithIconPadding_tablet: BoxValues;
	inputWithIconPadding_mobile: BoxValues;
	inputIconColor: string;
	inputIconSize: number | null;
	inputIconSize_tablet: number | null;
	inputIconSize_mobile: number | null;
	inputIconMargin: number | null;
	inputIconMargin_tablet: number | null;
	inputIconMargin_mobile: number | null;
	textareaPadding: BoxValues;
	textareaPadding_tablet: BoxValues;
	textareaPadding_mobile: BoxValues;
	textareaRadius: number | null;
	textareaRadius_tablet: number | null;
	textareaRadius_mobile: number | null;

	// Input & Textarea styling (Hover)
	inputBgColorHover: string;
	inputBorderColorHover: string;
	inputPlaceholderColorHover: string;
	inputValueColorHover: string;
	inputIconColorHover: string;

	// Input & Textarea styling (Active)
	inputBgColorActive: string;
	inputBorderColorActive: string;
	inputPlaceholderColorActive: string;
	inputValueColorActive: string;

	// Cards styling (Normal)
	cardsGap: number | null;
	cardsGap_tablet: number | null;
	cardsGap_mobile: number | null;
	cardsBgColor: string;
	cardsBorderType: string;
	cardsBorderWidth: BoxValues;
	cardsBorderColor: string;
	cardsRadius: number | null;
	cardsRadius_tablet: number | null;
	cardsRadius_mobile: number | null;
	cardsPrimaryTypography: TypographyValue;
	cardsPrimaryColor: string;
	cardsSecondaryTypography: TypographyValue;
	cardsSecondaryColor: string;
	cardsPriceTypography: TypographyValue;
	cardsPriceColor: string;
	cardsImageRadius: number | null;
	cardsImageRadius_tablet: number | null;
	cardsImageRadius_mobile: number | null;
	cardsImageSize: number | null;
	cardsImageSize_tablet: number | null;
	cardsImageSize_mobile: number | null;

	// Cards styling (Selected)
	cardsSelectedBgColor: string;
	cardsSelectedBorderColor: string;
	cardsSelectedBoxShadow: BoxShadowValue;
	cardsSelectedPrimaryTypography: TypographyValue;

	// File/Gallery styling (Normal)
	fileFieldGap: number | null;
	fileFieldGap_tablet: number | null;
	fileFieldGap_mobile: number | null;
	fileSelectIconColor: string;
	fileSelectIconSize: number | null;
	fileSelectIconSize_tablet: number | null;
	fileSelectIconSize_mobile: number | null;
	fileSelectBgColor: string;
	fileSelectBorderType: string;
	fileSelectBorderWidth: BoxValues;
	fileSelectBorderColor: string;
	fileSelectRadius: number | null;
	fileSelectRadius_tablet: number | null;
	fileSelectRadius_mobile: number | null;
	fileSelectTypography: TypographyValue;
	fileSelectTextColor: string;
	addedFileRadius: number | null;
	addedFileRadius_tablet: number | null;
	addedFileRadius_mobile: number | null;
	addedFileBgColor: string;
	addedFileIconColor: string;
	addedFileIconSize: number | null;
	addedFileIconSize_tablet: number | null;
	addedFileIconSize_mobile: number | null;
	addedFileTypography: TypographyValue;
	addedFileTextColor: string;
	removeFileBgColor: string;
	removeFileBgColorHover: string;
	removeFileColor: string;
	removeFileColorHover: string;
	removeFileRadius: number | null;
	removeFileRadius_tablet: number | null;
	removeFileRadius_mobile: number | null;
	removeFileSize: number | null;
	removeFileSize_tablet: number | null;
	removeFileSize_mobile: number | null;
	removeFileIconSize: number | null;
	removeFileIconSize_tablet: number | null;
	removeFileIconSize_mobile: number | null;

	// File/Gallery styling (Hover)
	fileSelectIconColorHover: string;
	fileSelectBgColorHover: string;
	fileSelectBorderColorHover: string;
	fileSelectTextColorHover: string;

	// Advanced & Voxel Tab Attributes
	zIndex: number | string;
	zIndex_tablet: number | string;
	zIndex_mobile: number | string;

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

	// Allow dynamic attributes from AdvancedTab/VoxelTab
	[key: string]: any;
}

/**
 * vxconfig structure saved in save.tsx
 */
export interface CartSummaryVxConfig {
	// Icons
	icons: CartSummaryIcons;

	// Styling values for CSS custom properties
	sectionSpacing?: number;
	titleColor?: string;

	// Empty cart
	emptyCartGap?: number;
	emptyCartIconSize?: number;
	emptyCartIconColor?: string;
	emptyCartTextColor?: string;

	// Primary button
	primaryBtnTextColor?: string;
	primaryBtnBgColor?: string;
	primaryBtnBorderColor?: string;
	primaryBtnRadius?: number;
	primaryBtnIconSize?: number;
	primaryBtnIconColor?: string;
	primaryBtnIconSpacing?: number;
	primaryBtnTextColorHover?: string;
	primaryBtnBgColorHover?: string;
	primaryBtnBorderColorHover?: string;
	primaryBtnIconColorHover?: string;

	// Secondary button
	secondaryBtnTextColor?: string;
	secondaryBtnBgColor?: string;
	secondaryBtnBorderColor?: string;
	secondaryBtnRadius?: number;
	secondaryBtnIconSize?: number;
	secondaryBtnIconColor?: string;
	secondaryBtnIconSpacing?: number;
	secondaryBtnTextColorHover?: string;
	secondaryBtnBgColorHover?: string;
	secondaryBtnBorderColorHover?: string;
	secondaryBtnIconColorHover?: string;

	// Loading
	loaderColor1?: string;
	loaderColor2?: string;

	// Checkbox
	checkboxBorderColor?: string;
	checkboxSelectedBgColor?: string;

	// Cart styling
	cartItemSpacing?: number;
	cartItemContentSpacing?: number;
	cartPictureSize?: number;
	cartPictureRadius?: number;
	cartTitleColor?: string;
	cartSubtitleColor?: string;

	// Icon button
	iconBtnColor?: string;
	iconBtnBgColor?: string;
	iconBtnBorderColor?: string;
	iconBtnRadius?: number;
	iconBtnValueSize?: number;
	iconBtnValueColor?: string;
	iconBtnColorHover?: string;
	iconBtnBgColorHover?: string;
	iconBtnBorderColorHover?: string;

	// Dropdown button
	dropdownBgColor?: string;
	dropdownTextColor?: string;
	dropdownBorderColor?: string;
	dropdownRadius?: number;
	dropdownHeight?: number;
	dropdownIconColor?: string;
	dropdownIconSize?: number;
	dropdownIconSpacing?: number;
	dropdownHideChevron?: boolean;
	dropdownChevronColor?: string;
	dropdownBgColorHover?: string;
	dropdownTextColorHover?: string;
	dropdownBorderColorHover?: string;
	dropdownIconColorHover?: string;
	dropdownBgColorFilled?: string;
	dropdownTextColorFilled?: string;
	dropdownIconColorFilled?: string;
	dropdownBorderColorFilled?: string;

	// Ship to
	shipToTextColor?: string;
	shipToLinkColor?: string;

	// Section divider
	dividerTextColor?: string;
	dividerLineColor?: string;
	dividerLineHeight?: number;

	// Subtotal
	subtotalTextColor?: string;

	// Field label
	fieldLabelColor?: string;
	fieldLabelLinkColor?: string;

	// Input
	inputPlaceholderColor?: string;
	inputValueColor?: string;
	inputBgColor?: string;
	inputBorderColor?: string;
	inputHeight?: number;
	inputRadius?: number;
	inputIconColor?: string;
	inputIconSize?: number;
	inputIconMargin?: number;
	textareaRadius?: number;
	inputBgColorHover?: string;
	inputBorderColorHover?: string;
	inputPlaceholderColorHover?: string;
	inputValueColorHover?: string;
	inputIconColorHover?: string;
	inputBgColorActive?: string;
	inputBorderColorActive?: string;
	inputPlaceholderColorActive?: string;
	inputValueColorActive?: string;

	// Cards
	cardsGap?: number;
	cardsBgColor?: string;
	cardsBorderColor?: string;
	cardsRadius?: number;
	cardsPrimaryColor?: string;
	cardsSecondaryColor?: string;
	cardsPriceColor?: string;
	cardsImageRadius?: number;
	cardsImageSize?: number;
	cardsSelectedBgColor?: string;
	cardsSelectedBorderColor?: string;

	// File/Gallery
	fileFieldGap?: number;
	fileSelectIconColor?: string;
	fileSelectIconSize?: number;
	fileSelectBgColor?: string;
	fileSelectBorderColor?: string;
	fileSelectRadius?: number;
	fileSelectTextColor?: string;
	addedFileRadius?: number;
	addedFileBgColor?: string;
	addedFileIconColor?: string;
	addedFileIconSize?: number;
	addedFileTextColor?: string;
	removeFileBgColor?: string;
	removeFileBgColorHover?: string;
	removeFileColor?: string;
	removeFileColorHover?: string;
	removeFileRadius?: number;
	removeFileSize?: number;
	removeFileIconSize?: number;
	fileSelectIconColorHover?: string;
	fileSelectBgColorHover?: string;
	fileSelectBorderColorHover?: string;
	fileSelectTextColorHover?: string;
}

/**
 * Cart item from REST API
 */
export interface CartItem {
	key: string;
	title: string;
	subtitle: string | null;
	link: string;
	logo: string;
	currency: string;
	pricing: {
		total_amount: number;
	};
	quantity: {
		enabled: boolean;
		min: number;
		max: number;
	};
	stock_id: string;
	shipping: {
		is_shippable: boolean;
		shipping_class: string | null;
	};
	vendor: {
		id: number | null;
		display_name: string;
		shipping_zones?: ShippingZones;
		shipping_countries?: ShippingCountries;
	};
	product_mode: 'regular' | 'variable';
	payment_method: string;
	value: Record<string, unknown>;
	components: Record<string, { type: string; src: string }>;
	_disabled?: boolean;
	custom_class?: string;
}

/**
 * Shipping zone configuration
 */
export interface ShippingZone {
	key: string;
	label: string;
	countries: Record<string, boolean>;
	regions?: ShippingRegion[];
	rates: Record<string, ShippingRate>;
}

/**
 * Shipping region within a zone
 */
export interface ShippingRegion {
	country: string;
	states?: string[];
	zip_codes_enabled?: boolean;
	zip_codes?: string;
}

/**
 * Shipping rate configuration
 */
export interface ShippingRate {
	key: string;
	label: string;
	type: 'flat_rate' | 'free_shipping' | 'fixed_rate';
	amount_per_unit?: number;
	delivery_estimate?: string;
	requirements?: string;
	minimum_order_amount?: number;
	calculation_method?: 'per_item' | 'per_order' | 'per_class';
	shipping_classes?: Record<string, number>;
}

/**
 * Shipping zones object
 */
export type ShippingZones = Record<string, ShippingZone>;

/**
 * Country configuration
 */
export interface CountryConfig {
	name: string;
	states?: Record<string, { name: string }>;
}

/**
 * Shipping countries object
 */
export type ShippingCountries = Record<string, CountryConfig>;

/**
 * Cart configuration from REST API
 */
export interface CartConfig {
	is_logged_in: boolean;
	currency: string;
	auth_link: string;
	multivendor: {
		enabled: boolean;
		charge_type?: string;
	};
	shipping: {
		responsibility: 'platform' | 'vendor';
		default_country: string | null;
		saved_address?: {
			first_name?: string;
			last_name?: string;
			country?: string;
			state?: string;
			address?: string;
			zip?: string;
		};
		countries: ShippingCountries;
		zones: ShippingZones;
		shipping_rates_order?: string[];
	};
	guest_customers: {
		behavior: 'redirect_to_login' | 'proceed_with_email';
		proceed_with_email?: {
			require_verification: boolean;
			require_tos: boolean;
			tos_text?: string;
		};
	};
	geoip_providers: Array<{
		url: string;
		prop: string;
	}>;
	recaptcha: {
		enabled: boolean;
		key?: string;
	};
	nonce: {
		cart: string;
		checkout: string;
	};
	l10n: {
		free: string;
		login: string;
	};
}

/**
 * Shipping state for checkout
 */
export interface ShippingState {
	first_name: string;
	last_name: string;
	country: string | null;
	state: string;
	address: string;
	zip: string;
	zone: string | null;
	rate: string | null;
	status: 'pending_setup' | 'processing' | 'completed';
	vendors: Record<string, { zone: string; rate: string } | null>;
}

/**
 * Quick register state for guest checkout
 */
export interface QuickRegisterState {
	email: string;
	sending_code: boolean;
	sent_code: boolean;
	code: string;
	registered: boolean;
	terms_agreed: boolean;
}

/**
 * Order notes state
 */
export interface OrderNotesState {
	enabled: boolean;
	content: string;
}

/**
 * Vendor information
 */
export interface Vendor {
	id: number | null;
	display_name: string;
	vendor_key: string;
	key: string;
	items: Record<string, CartItem>;
	has_shippable_products: boolean;
	shipping_zones: ShippingZones | null;
	shipping_countries: ShippingCountries | null;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: CartSummaryBlockAttributes;
	setAttributes: (attrs: Partial<CartSummaryBlockAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * Save component props
 */
export interface SaveProps {
	attributes: CartSummaryBlockAttributes;
}

/**
 * Shared component props
 */
export interface CartSummaryComponentProps {
	attributes: CartSummaryBlockAttributes;
	config: CartConfig | null;
	items: Record<string, CartItem> | null;
	context: 'editor' | 'frontend';
	isLoading: boolean;
	error: string | null;
	// Event handlers for frontend
	onUpdateQuantity?: (itemKey: string, quantity: number) => void;
	onRemoveItem?: (itemKey: string) => void;
	onCheckout?: () => void;
	// Shipping state
	shipping?: ShippingState;
	onShippingChange?: (shipping: Partial<ShippingState>) => void;
	// Quick register state
	quickRegister?: QuickRegisterState;
	onQuickRegisterChange?: (quickRegister: Partial<QuickRegisterState>) => void;
	// Order notes state
	orderNotes?: OrderNotesState;
	onOrderNotesChange?: (orderNotes: Partial<OrderNotesState>) => void;
}

/**
 * Promotion package
 * Evidence: themes/voxel/app/widgets/cart-summary.php:2571-2579
 */
export interface PromotePackage {
	key: string;
	label: string;
	description: string;
	icon: string;
	color: string;
	price_amount: number;
}

/**
 * Promote screen config
 * Evidence: themes/voxel/app/widgets/cart-summary.php:2566-2581
 */
export interface PromoteConfig {
	post_id: number;
	post_title: string;
	packages: Record<string, PromotePackage>;
	nonce: {
		checkout: string;
	};
}
