/**
 * Product Form Block - Type Definitions
 *
 * TypeScript interfaces for the Product Form (VX) block.
 * Matches Voxel's product-form widget structure.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/product-form.php
 * - Template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import type {
	IconValue,
	TypographyValue,
	BorderGroupValue
} from '@shared/controls';

/**
 * Box spacing values (padding/margin)
 */
export interface BoxValues {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

/**
 * Product Form Icons
 */
export interface ProductFormIcons {
	addToCart: IconValue;
	outOfStock: IconValue;
	checkout: IconValue;
	calendar: IconValue;
	clock: IconValue;
}

/**
 * Default icons for the product form
 */
export const DEFAULT_PRODUCT_FORM_ICONS: ProductFormIcons = {
	addToCart: { library: 'icon', value: 'la-shopping-cart' },
	outOfStock: { library: 'icon', value: 'la-exclamation-circle' },
	checkout: { library: 'icon', value: 'la-arrow-right' },
	calendar: { library: 'icon', value: 'la-calendar' },
	clock: { library: 'icon', value: 'la-clock' },
};

/**
 * Product Form Block Attributes
 *
 * Content Tab:
 * - Settings: show_prform_footer, ts_subtotal_only
 * - Cards: ts_hide_card_subheading, ts_card_pointer_events
 * - Icons: various icon pickers
 *
 * Style Tab:
 * - General: field spacing, label typography
 * - Primary button: typography, colors, border, shadow
 * - Price calculator: spacing, typography, colors
 * - Loading/Out of stock: colors, typography
 * - Number stepper: input size, button styles
 * - Cards: gap, background, border, text, image
 * - Buttons: gap, background, border, text
 * - Dropdown: typography, colors, icons
 * - Radio/Checkboxes: border, text, background
 * - Switcher: background colors
 * - Images: gap, border radius
 * - Colors: gap, size, radius
 * - Input and Textarea: placeholder, value, background, border
 */
export interface ProductFormAttributes {
	// Block identification
	blockId: string;

	// === CONTENT TAB ===

	// Settings Section
	showPriceCalculator: 'show' | 'hide' | 'subtotal';
	showPriceCalculatorTablet: 'show' | 'hide';
	showPriceCalculatorMobile: 'show' | 'hide';
	showSubtotalOnly: boolean;

	// Cards Section
	hideCardSubheading: boolean;
	cardSelectOnClick: boolean;

	// Icons Section
	icons: ProductFormIcons;

	// === STYLE TAB ===

	// General Section
	fieldSpacing: number;
	fieldSpacingTablet?: number;
	fieldSpacingMobile?: number;
	fieldLabelTypography: TypographyValue;
	fieldLabelColor: string;

	// Primary Button - Normal
	primaryButtonTypography: TypographyValue;
	primaryButtonBorder: BorderGroupValue;
	primaryButtonBorderRadius: number;
	primaryButtonBorderRadiusTablet?: number;
	primaryButtonBorderRadiusMobile?: number;
	primaryButtonBoxShadow: any;
	primaryButtonTextColor: string;
	primaryButtonBackground: string;
	primaryButtonIconSize: number;
	primaryButtonIconSizeTablet?: number;
	primaryButtonIconSizeMobile?: number;
	primaryButtonIconColor: string;
	primaryButtonIconTextSpacing: number;
	primaryButtonIconTextSpacingTablet?: number;
	primaryButtonIconTextSpacingMobile?: number;

	// Primary Button - Hover
	primaryButtonTextColorHover: string;
	primaryButtonBackgroundHover: string;
	primaryButtonBorderColorHover: string;
	primaryButtonBoxShadowHover: any;
	primaryButtonIconColorHover: string;

	// Price Calculator
	priceCalculatorListSpacing: number;
	priceCalculatorListSpacingTablet?: number;
	priceCalculatorListSpacingMobile?: number;
	priceCalculatorTypography: TypographyValue;
	priceCalculatorTextColor: string;
	priceCalculatorTotalTypography: TypographyValue;
	priceCalculatorTotalTextColor: string;

	// Loading / Out of Stock
	loadingColor1: string;
	loadingColor2: string;
	outOfStockContentGap: number;
	outOfStockContentGapTablet?: number;
	outOfStockContentGapMobile?: number;
	outOfStockIconSize: number;
	outOfStockIconSizeTablet?: number;
	outOfStockIconSizeMobile?: number;
	outOfStockIconColor: string;
	outOfStockTypography: TypographyValue;
	outOfStockTextColor: string;

	// Number Stepper - Normal
	stepperInputSize: number;
	stepperButtonIconColor: string;
	stepperButtonBackground: string;
	stepperButtonBorder: BorderGroupValue;
	stepperButtonBorderRadius: number;
	stepperButtonBorderRadiusTablet?: number;
	stepperButtonBorderRadiusMobile?: number;

	// Number Stepper - Hover
	stepperButtonIconColorHover: string;
	stepperButtonBackgroundHover: string;
	stepperButtonBorderColorHover: string;

	// Cards - Normal
	cardsGap: number;
	cardsGapTablet?: number;
	cardsGapMobile?: number;
	cardsBackground: string;
	cardsBorder: BorderGroupValue;
	cardsBorderRadius: number;
	cardsBorderRadiusTablet?: number;
	cardsBorderRadiusMobile?: number;
	cardsPrimaryTypography: TypographyValue;
	cardsPrimaryColor: string;
	cardsSecondaryTypography: TypographyValue;
	cardsSecondaryColor: string;
	cardsPriceTypography: TypographyValue;
	cardsPriceColor: string;
	cardsImageBorderRadius: number;
	cardsImageBorderRadiusTablet?: number;
	cardsImageBorderRadiusMobile?: number;
	cardsImageSize: number;
	cardsImageSizeTablet?: number;
	cardsImageSizeMobile?: number;

	// Cards - Selected
	cardsSelectedBackground: string;
	cardsSelectedBorderColor: string;
	cardsSelectedBoxShadow: any;
	cardsSelectedPrimaryTypography: TypographyValue;

	// Buttons - Normal
	buttonsGap: number;
	buttonsGapTablet?: number;
	buttonsGapMobile?: number;
	buttonsBackground: string;
	buttonsBorder: BorderGroupValue;
	buttonsBorderRadius: number;
	buttonsBorderRadiusTablet?: number;
	buttonsBorderRadiusMobile?: number;
	buttonsTextTypography: TypographyValue;
	buttonsTextColor: string;

	// Buttons - Selected
	buttonsSelectedBackground: string;
	buttonsSelectedBorderColor: string;
	buttonsSelectedBoxShadow: any;

	// Dropdown - Normal
	dropdownTypography: TypographyValue;
	dropdownBoxShadow: any;
	dropdownBackground: string;
	dropdownTextColor: string;
	dropdownBorder: BorderGroupValue;
	dropdownBorderRadius: number;
	dropdownBorderRadiusTablet?: number;
	dropdownBorderRadiusMobile?: number;
	dropdownIconColor: string;
	dropdownIconSize: number;
	dropdownIconSizeTablet?: number;
	dropdownIconSizeMobile?: number;
	dropdownIconTextSpacing: number;
	dropdownIconTextSpacingTablet?: number;
	dropdownIconTextSpacingMobile?: number;
	dropdownHideChevron: boolean;
	dropdownChevronColor: string;

	// Dropdown - Hover
	dropdownBackgroundHover: string;
	dropdownTextColorHover: string;
	dropdownBorderColorHover: string;
	dropdownIconColorHover: string;
	dropdownBoxShadowHover: any;

	// Dropdown - Filled
	dropdownFilledTypography: TypographyValue;
	dropdownFilledBackground: string;
	dropdownFilledTextColor: string;
	dropdownFilledIconColor: string;
	dropdownFilledBorderColor: string;
	dropdownFilledBorderWidth: number;
	dropdownFilledBoxShadow: any;

	// Radio/Checkboxes - Normal
	radioCheckboxBorderColor: string;
	radioCheckboxTextTypography: TypographyValue;
	radioCheckboxTextColor: string;

	// Radio/Checkboxes - Selected
	radioCheckboxSelectedBackground: string;
	radioCheckboxSelectedTextTypography: TypographyValue;
	radioCheckboxSelectedTextColor: string;
	radioCheckboxSelectedBoxShadow: any;

	// Switcher
	switcherBackgroundInactive: string;
	switcherBackgroundActive: string;
	switcherHandleBackground: string;

	// Images - Normal
	imagesGap: number;
	imagesGapTablet?: number;
	imagesGapMobile?: number;
	imagesBorderRadius: number;
	imagesBorderRadiusTablet?: number;
	imagesBorderRadiusMobile?: number;

	// Images - Selected
	imagesSelectedBorderColor: string;

	// Colors
	colorsGap: number;
	colorsGapTablet?: number;
	colorsGapMobile?: number;
	colorsSize: number;
	colorsSizeTablet?: number;
	colorsSizeMobile?: number;
	colorsBorderRadius: number;
	colorsBorderRadiusTablet?: number;
	colorsBorderRadiusMobile?: number;
	colorsInsetColor: string;

	// Input and Textarea - Normal
	inputPlaceholderColor: string;
	inputPlaceholderTypography: TypographyValue;
	inputValueColor: string;
	inputValueTypography: TypographyValue;
	inputBackground: string;
	inputBorder: BorderGroupValue;
	inputBorderRadius: number;
	inputBorderRadiusTablet?: number;
	inputBorderRadiusMobile?: number;

	// Input and Textarea - Hover
	inputBackgroundHover: string;
	inputBorderColorHover: string;
	inputPlaceholderColorHover: string;
	inputTextColorHover: string;

	// Input and Textarea - Active
	inputBackgroundActive: string;
	inputBorderColorActive: string;
	inputTextColorActive: string;

	// Allow extension with block-specific attributes
	[key: string]: any;
}

/**
 * Default attribute values
 */
export const DEFAULT_PRODUCT_FORM_ATTRIBUTES: ProductFormAttributes = {
	blockId: '',

	// Content Tab
	showPriceCalculator: 'show',
	showPriceCalculatorTablet: 'show',
	showPriceCalculatorMobile: 'show',
	showSubtotalOnly: false,
	hideCardSubheading: false,
	cardSelectOnClick: true,
	icons: DEFAULT_PRODUCT_FORM_ICONS,

	// Style Tab - General
	fieldSpacing: 20,
	fieldLabelTypography: {},
	fieldLabelColor: '',

	// Primary Button
	primaryButtonTypography: {},
	primaryButtonBorder: { borderType: 'none', borderWidth: {}, borderColor: '' },
	primaryButtonBorderRadius: 0,
	primaryButtonBoxShadow: {},
	primaryButtonTextColor: '',
	primaryButtonBackground: '',
	primaryButtonIconSize: 24,
	primaryButtonIconColor: '',
	primaryButtonIconTextSpacing: 8,
	primaryButtonTextColorHover: '',
	primaryButtonBackgroundHover: '',
	primaryButtonBorderColorHover: '',
	primaryButtonBoxShadowHover: {},
	primaryButtonIconColorHover: '',

	// Price Calculator
	priceCalculatorListSpacing: 10,
	priceCalculatorTypography: {},
	priceCalculatorTextColor: '',
	priceCalculatorTotalTypography: {},
	priceCalculatorTotalTextColor: '',

	// Loading / Out of Stock
	loadingColor1: '',
	loadingColor2: '',
	outOfStockContentGap: 15,
	outOfStockIconSize: 40,
	outOfStockIconColor: '',
	outOfStockTypography: {},
	outOfStockTextColor: '',

	// Number Stepper
	stepperInputSize: 16,
	stepperButtonIconColor: '',
	stepperButtonBackground: '',
	stepperButtonBorder: { borderType: 'none', borderWidth: {}, borderColor: '' },
	stepperButtonBorderRadius: 0,
	stepperButtonIconColorHover: '',
	stepperButtonBackgroundHover: '',
	stepperButtonBorderColorHover: '',

	// Cards
	cardsGap: 10,
	cardsBackground: '',
	cardsBorder: { borderType: 'none', borderWidth: {}, borderColor: '' },
	cardsBorderRadius: 0,
	cardsPrimaryTypography: {},
	cardsPrimaryColor: '',
	cardsSecondaryTypography: {},
	cardsSecondaryColor: '',
	cardsPriceTypography: {},
	cardsPriceColor: '',
	cardsImageBorderRadius: 0,
	cardsImageSize: 60,
	cardsSelectedBackground: '',
	cardsSelectedBorderColor: '',
	cardsSelectedBoxShadow: {},
	cardsSelectedPrimaryTypography: {},

	// Buttons
	buttonsGap: 10,
	buttonsBackground: '',
	buttonsBorder: { borderType: 'none', borderWidth: {}, borderColor: '' },
	buttonsBorderRadius: 0,
	buttonsTextTypography: {},
	buttonsTextColor: '',
	buttonsSelectedBackground: '',
	buttonsSelectedBorderColor: '',
	buttonsSelectedBoxShadow: {},

	// Dropdown
	dropdownTypography: {},
	dropdownBoxShadow: {},
	dropdownBackground: '',
	dropdownTextColor: '',
	dropdownBorder: { borderType: 'default', borderWidth: {}, borderColor: '' },
	dropdownBorderRadius: 0,
	dropdownIconColor: '',
	dropdownIconSize: 24,
	dropdownIconTextSpacing: 10,
	dropdownHideChevron: false,
	dropdownChevronColor: '',
	dropdownBackgroundHover: '',
	dropdownTextColorHover: '',
	dropdownBorderColorHover: '',
	dropdownIconColorHover: '',
	dropdownBoxShadowHover: {},
	dropdownFilledTypography: {},
	dropdownFilledBackground: '',
	dropdownFilledTextColor: '',
	dropdownFilledIconColor: '',
	dropdownFilledBorderColor: '',
	dropdownFilledBorderWidth: 0,
	dropdownFilledBoxShadow: {},

	// Radio/Checkboxes
	radioCheckboxBorderColor: '',
	radioCheckboxTextTypography: {},
	radioCheckboxTextColor: '',
	radioCheckboxSelectedBackground: '',
	radioCheckboxSelectedTextTypography: {},
	radioCheckboxSelectedTextColor: '',
	radioCheckboxSelectedBoxShadow: {},

	// Switcher
	switcherBackgroundInactive: '',
	switcherBackgroundActive: '',
	switcherHandleBackground: '',

	// Images
	imagesGap: 10,
	imagesBorderRadius: 0,
	imagesSelectedBorderColor: '',

	// Colors
	colorsGap: 10,
	colorsSize: 30,
	colorsBorderRadius: 50,
	colorsInsetColor: '',

	// Input and Textarea
	inputPlaceholderColor: '',
	inputPlaceholderTypography: {},
	inputValueColor: '',
	inputValueTypography: {},
	inputBackground: '',
	inputBorder: { borderType: 'default', borderWidth: {}, borderColor: '' },
	inputBorderRadius: 0,
	inputBackgroundHover: '',
	inputBorderColorHover: '',
	inputPlaceholderColorHover: '',
	inputTextColorHover: '',
	inputBackgroundActive: '',
	inputBorderColorActive: '',
	inputTextColorActive: '',
};

/**
 * Product field configuration from REST API
 */
export interface ProductFieldConfig {
	key: string;
	label: string;
	component_key: string;
	type: string;
	required: boolean;
	description?: string;
	options?: Array<{
		key: string;
		label: string;
		price?: number;
		image?: string;
		color?: string;
	}>;
}

/**
 * Cart configuration
 */
export interface CartConfig {
	enabled: boolean;
	checkout_url: string;
	currency: string;
	currency_symbol: string;
}

/**
 * Product form configuration from REST API
 */
export interface ProductFormConfig {
	fields: ProductFieldConfig[];
	cart: CartConfig;
	base_price: number;
	is_purchasable: boolean;
	out_of_stock_message?: string;
	nonce: string;
}

/**
 * VxConfig stored in save.tsx for frontend hydration
 */
export interface ProductFormVxConfig {
	blockId: string;
	settings: {
		showPriceCalculator: 'show' | 'hide' | 'subtotal';
		showSubtotalOnly: boolean;
		hideCardSubheading: boolean;
		cardSelectOnClick: boolean;
		productMode?: 'regular' | 'variable' | 'booking';
		cartNonce?: string;
		searchContext?: Record<string, unknown>;
		searchContextConfig?: Record<string, unknown> | null;
	};
	icons: ProductFormIcons;
	props?: Record<string, unknown>;
	value?: Record<string, unknown>;
	l10n?: Record<string, string>;
	// Note: Product configuration is fetched from REST API at runtime
}

/**
 * Pricing summary item
 */
export interface PricingSummaryItem {
	key: string;
	label: string;
	price: number;
	formatted_price: string;
}

/**
 * Pricing summary state
 */
export interface PricingSummary {
	visible_items: PricingSummaryItem[];
	total: number;
	formatted_total: string;
}

/* ==========================================================================
   ADDON TYPE DEFINITIONS
   Evidence: voxel-product-form.beautified.js lines 42-266 (vxconfig format)
   ========================================================================== */

/**
 * Addon choice for select/multiselect types
 */
export interface AddonChoice {
	value: string;
	label: string;
	price: number;
	image?: string | { url: string; alt?: string } | null;
	subheading?: string | null;
	quantity?: {
		enabled: boolean;
		min: number;
		max: number;
	};
	/** External choice popup quantity/display config (from vxconfig) */
	props?: {
		quantity?: {
			enabled: boolean;
			min: number;
			max: number;
		};
		[key: string]: unknown;
	};
}

/**
 * Charge after configuration (first N units free)
 * Evidence: voxel-product-form.beautified.js lines 104-105
 */
export interface ChargeAfterConfig {
	enabled: boolean;
	quantity: number;
}

/**
 * Addon configuration from vxconfig
 * Evidence: voxel-product-form.beautified.js lines 93-116
 */
export interface AddonConfig {
	key: string;
	type: 'switcher' | 'numeric' | 'select' | 'multiselect' | 'custom-select' | 'custom-multiselect';
	label: string;
	required: boolean;
	repeat: boolean;
	_has_external_handler?: boolean;
	props: {
		price?: number;
		min_units?: number;
		max_units?: number;
		charge_after?: ChargeAfterConfig;
		choices?: Record<string, AddonChoice>;
		display_mode?: string;
	};
}

/**
 * Addon value for switcher type
 */
export interface AddonSwitcherValue {
	enabled: boolean;
}

/**
 * Addon value for numeric type
 */
export interface AddonNumericValue {
	quantity: number | null;
}

/**
 * Addon value for select type
 */
export interface AddonSelectValue {
	selected: string | null;
}

/**
 * Addon value for multiselect type
 */
export interface AddonMultiselectValue {
	selected: string[];
}

/**
 * Addon value for custom-select type
 */
export interface AddonCustomSelectValue {
	selected: {
		item: string | null;
		quantity: number;
	};
}

/**
 * Addon value for custom-multiselect type
 */
export interface AddonCustomMultiselectValue {
	selected: Array<{
		item: string;
		quantity: number;
	}>;
}

/**
 * Union type for all addon values
 */
export type AddonValue =
	| AddonSwitcherValue
	| AddonNumericValue
	| AddonSelectValue
	| AddonMultiselectValue
	| AddonCustomSelectValue
	| AddonCustomMultiselectValue;

/**
 * Repeat configuration for date range bookings
 * Evidence: voxel-product-form.beautified.js lines 1060-1085
 */
export interface RepeatConfig {
	start: string;
	end: string;
	count_mode: 'nights' | 'days';
	label: string;
	length?: number;
}

/**
 * Custom price configuration
 * Evidence: voxel-product-form.beautified.js lines 70-85
 */
export interface CustomPriceConfig {
	conditions: Array<{
		type: 'date' | 'date_range' | 'day_of_week';
		date?: string;
		range?: { from: string; to: string };
		days?: string[];
	}>;
	prices: {
		base_price?: { amount: number; discount_amount?: number };
		addons?: Record<string, { price: number } | Record<string, { price: number }>>;
	};
	minimum_price?: number;
}

/**
 * Pricing summary from addon component
 * Evidence: voxel-product-form.beautified.js lines 347-348
 */
export interface AddonPricingSummary {
	label: string;
	amount: number;
}

/**
 * Props passed to addon components
 */
export interface AddonComponentProps {
	addon: AddonConfig;
	value: AddonValue;
	onChange: (value: AddonValue) => void;
	getRepeatConfig: (addon: AddonConfig) => RepeatConfig | null;
	getCustomPrice: (addon: AddonConfig) => CustomPriceConfig | null;
	getCustomPriceForDate: (date: Date) => CustomPriceConfig | null;
}

/**
 * Search context for auto-population of addons
 * Evidence: voxel-product-form.beautified.js lines 49-57
 */
export interface SearchContext {
	availability?: { start: string; end: string };
	numeric_addons?: Record<string, number>;
	switcher_addons?: Record<string, boolean>;
}

/**
 * Search context configuration for URL param mapping
 * Evidence: voxel-product-form.beautified.js lines 49-53
 *
 * Maps addon keys to URL parameter names for search → product form data transfer.
 * Example:
 * {
 *   availability: "availability",
 *   numeric_addons: { "guests": "num_guests" },
 *   switcher_addons: { "breakfast": "include_breakfast" }
 * }
 */
export interface SearchContextConfig {
	/** URL param name for availability date range (format: "2025-01-01..2025-01-05") */
	availability?: string;
	/** Map of addon key → URL param name for numeric addons */
	numeric_addons?: Record<string, string>;
	/** Map of addon key → URL param name for switcher addons */
	switcher_addons?: Record<string, string>;
}

/**
 * Extended product form config with addons support
 */
/* ==========================================================================
   VARIATION TYPE DEFINITIONS
   Evidence: voxel-product-form.beautified.js lines 1260-1600
   ========================================================================== */

/**
 * Variation attribute choice
 * Evidence: lines 1339-1347, 1389-1392
 */
export interface VariationChoice {
	value: string;
	label: string;
	image?: string | { url: string; alt?: string; id?: number } | null;
	color?: string;
	subheading?: string | null;
}

/**
 * Variation attribute configuration
 * Evidence: lines 1274-1394
 */
export interface VariationAttribute {
	key: string;
	label: string;
	display_type: 'dropdown' | 'buttons' | 'radio' | 'cards' | 'images' | 'colors';
	props: {
		display_mode?: 'dropdown' | 'buttons' | 'radio' | 'cards' | 'images' | 'colors';
		choices: Record<string, VariationChoice>;
	};
}

/**
 * Variation stock configuration
 */
export interface VariationStockConfig {
	enabled: boolean;
	quantity: number;
	sold_individually: boolean;
}

/**
 * Variation base price configuration
 */
export interface VariationBasePriceConfig {
	enabled: boolean;
	amount: number;
	discount_amount?: number;
}

/**
 * Single variation configuration
 * Evidence: lines 1317-1330, 1483-1494
 */
export interface Variation {
	id: string;
	attributes: Record<string, string>;
	_status: 'active' | 'out_of_stock' | 'hidden';
	image?: {
		id: number;
		url: string;
	};
	config: {
		base_price: VariationBasePriceConfig;
		stock: VariationStockConfig;
	};
}

/**
 * Variations field configuration
 * Evidence: lines 1260-1600
 */
export interface VariationsFieldConfig {
	props: {
		attributes: Record<string, VariationAttribute>;
		variations: Record<string, Variation>;
		selections: Record<string, string>;
		stock: {
			enabled: boolean;
		};
		l10n?: {
			select_quantity?: string;
		};
	};
}

/**
 * Variations value state
 * Evidence: lines 1400-1401
 */
export interface VariationsValue {
	variation_id: string | null;
	quantity: number;
}

/**
 * Variation pricing summary
 * Evidence: lines 1524-1551
 */
export interface VariationPricingSummary {
	label: string;
	amount: number;
	quantity: number | null;
}

/**
 * Choice status for variation attributes
 * Evidence: lines 1360-1380
 */
export type ChoiceStatus = 'active' | 'out_of_stock' | 'inactive';

/* ==========================================================================
   BOOKING TYPE DEFINITIONS
   Evidence: voxel-product-form.beautified.js lines 163-212, 250-255
   ========================================================================== */

/**
 * Booking mode types
 * - date_range: Check-in/check-out selection (rentals, accommodations)
 * - single_day: Single date selection (events, appointments)
 * - timeslots: Date + time slot selection (appointments, reservations)
 */
export type BookingMode = 'date_range' | 'single_day' | 'timeslots';

/**
 * Count mode for date range bookings
 * - nights: Count as overnight stays (check-in to check-out)
 * - days: Count as full days
 */
export type BookingCountMode = 'nights' | 'days';

/**
 * Availability buffer configuration
 * Evidence: lines 169
 */
export interface AvailabilityBuffer {
	amount: number;
	unit: 'days' | 'hours';
}

/**
 * Availability configuration
 * Evidence: lines 167-170
 */
export interface BookingAvailabilityConfig {
	max_days: number;
	buffer?: AvailabilityBuffer;
}

/**
 * Date range configuration
 * Evidence: lines 171-175
 */
export interface BookingDateRangeConfig {
	min_length: number;
	max_length: number;
	has_custom_limits?: boolean;
}

/**
 * Time slot definition
 * Evidence: lines 182-184
 */
export interface TimeSlot {
	from: string; // "09:00"
	to: string;   // "10:00"
}

/**
 * Time slot group (slots for specific days)
 * Evidence: lines 179-186
 */
export interface TimeSlotGroup {
	days: string[]; // ["mon", "tue", "wed"]
	slots: TimeSlot[];
}

/**
 * Timeslots configuration
 * Evidence: lines 178-188
 */
export interface BookingTimeslotsConfig {
	groups: TimeSlotGroup[];
}

/**
 * Today reference for availability calculations
 * Evidence: lines 193-196
 */
export interface BookingTodayConfig {
	date: string; // "2025-01-15"
	time: string; // "14:30:00"
}

/**
 * Booking field localization strings
 * Evidence: lines 197-210
 */
export interface BookingL10n {
	one_night?: string;
	multiple_nights?: string;
	one_day?: string;
	multiple_days?: string;
	select_nights?: string;
	select_days?: string;
	select_start_and_end_date?: string;
	select_end_date?: string;
	nights_range_error?: string;
	days_range_error?: string;
	booking_price?: string;
	amount_available?: string;
	select_date?: string;
	select_timeslot?: string;
	no_slots_available?: string;
}

/**
 * Complete booking field configuration
 * Evidence: lines 163-212
 */
export interface BookingFieldConfig {
	props: {
		mode: BookingMode;
		count_mode?: BookingCountMode;
		availability?: BookingAvailabilityConfig;
		date_range?: BookingDateRangeConfig;
		excluded_days?: string[];
		excluded_weekdays?: string[];
		timeslots?: BookingTimeslotsConfig;
		quantity_per_slot?: number;
		booked_slot_counts?: Record<string, number>;
		today?: BookingTodayConfig;
		l10n?: BookingL10n;
	};
}

/**
 * Booking value state
 * Evidence: lines 250-255
 */
export interface BookingValue {
	start_date: string | null;  // For date_range mode
	end_date: string | null;    // For date_range mode
	date: string | null;        // For single_day / timeslots mode
	slot: string | null;        // For timeslots mode
}

/**
 * Default booking value
 */
export const DEFAULT_BOOKING_VALUE: BookingValue = {
	start_date: null,
	end_date: null,
	date: null,
	slot: null,
};

/**
 * Booking pricing summary
 * Evidence: lines 1738-1744
 */
export interface BookingPricingSummary {
	label: string;
	amount: number;
	hidden?: boolean;
}

/**
 * FieldAddons ref interface for exposing getPricingSummary to parent
 * Evidence: voxel-product-form.beautified.js lines 1073-1090
 */
export interface FieldAddonsRef {
	getPricingSummary: () => AddonPricingSummary[];
}

/**
 * FieldVariations ref interface for exposing getPricingSummary to parent
 * Evidence: voxel-product-form.beautified.js lines 1524-1551
 */
export interface FieldVariationsRef {
	getPricingSummary: () => VariationPricingSummary | null;
}

/**
 * Computed time slot with availability info
 */
export interface ComputedTimeSlot extends TimeSlot {
	key: string;          // "09:00-10:00"
	label: string;        // "09:00 - 10:00"
	available: number;    // Remaining capacity
	booked: number;       // Current bookings
	isAvailable: boolean; // Has capacity
}

/**
 * Day availability info for calendar
 */
export interface DayAvailability {
	date: string;
	isAvailable: boolean;
	isExcluded: boolean;
	isInPast: boolean;
	slots?: ComputedTimeSlot[];
	price?: number;
}

export interface ExtendedProductFormConfig extends ProductFormConfig {
	settings?: {
		product_mode?: 'regular' | 'variable' | 'booking';
		cart_nonce?: string;
		search_context?: SearchContext;
	};
	props?: {
		base_price?: {
			enabled: boolean;
			amount: number;
			discount_amount?: number;
		};
		minimum_price?: number;
		custom_prices?: {
			enabled: boolean;
			list: CustomPriceConfig[];
		};
		today?: {
			date: string;
			time: string;
		};
		fields?: {
			'form-addons'?: {
				props: {
					addons: Record<string, AddonConfig>;
					l10n?: {
						amount_nights?: string;
						amount_days?: string;
					};
				};
			};
			'form-quantity'?: {
				props: {
					quantity: number;
				};
			};
			'form-variations'?: VariationsFieldConfig;
			'form-booking'?: BookingFieldConfig;
			'form-data-inputs'?: DataInputsFieldConfig;
		};
	};
	value?: {
		addons?: Record<string, AddonValue>;
		stock?: { quantity: number };
		variations?: VariationsValue;
		booking?: BookingValue;
		data_inputs?: Record<string, DataInputValue>;
	};
	l10n?: {
		quantity?: string;
		added_to_cart?: string;
		view_cart?: string;
	};
}

/* ==========================================================================
   DATA INPUT TYPE DEFINITIONS
   Evidence: Voxel PHP templates form-data-inputs/*.php
   ========================================================================== */

/**
 * Data input types supported by product form
 * Evidence: voxel-product-form.beautified.js lines 218
 */
export type DataInputType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'select'
	| 'multiselect'
	| 'email'
	| 'phone'
	| 'url'
	| 'switcher'
	| 'date';

/**
 * Choice option for select/multiselect data inputs
 */
export interface DataInputChoice {
	value: string;
	label: string;
}

/**
 * Data input configuration
 * Evidence: voxel-product-form.beautified.js lines 216-228
 */
export interface DataInputConfig {
	key: string;
	type: DataInputType;
	label: string;
	required?: boolean;
	component_key?: string;
	props: {
		placeholder?: string;
		minlength?: number;
		maxlength?: number;
		min?: number;
		max?: number;
		step?: number;
		display_mode?: 'default' | 'stepper' | 'buttons' | 'radio';
		choices?: Record<string, DataInputChoice>;
		l10n?: {
			default_placeholder?: string;
		};
	};
}

/**
 * Data inputs field configuration
 */
export interface DataInputsFieldConfig {
	props: {
		data_inputs: Record<string, DataInputConfig>;
	};
}

/**
 * Data input value types
 */
export type DataInputValue = string | number | boolean | string[] | null;

/* ==========================================================================
   POST CONTEXT TYPE DEFINITIONS
   Evidence: FSE API Controller fse-product-form-api-controller.php
   ========================================================================== */

/**
 * Cart configuration from API
 */
export interface CartConfigFromAPI {
	enabled: boolean;
	checkout_url: string;
	currency: string;
	currency_symbol: string;
}

/**
 * Post context permissions
 */
export interface ProductFormPermissions {
	edit: boolean;
	purchase: boolean;
}

/**
 * Post context nonces for CSRF protection
 */
export interface ProductFormNonces {
	cart: string;
	checkout: string;
}

/**
 * Localization strings from API
 */
export interface ProductFormL10n {
	added_to_cart: string;
	view_cart: string;
	out_of_stock: string;
	add_to_cart: string;
	continue: string;
}

/**
 * Post context returned by /product-form/post-context endpoint
 * Provides permissions, nonces, and state for React component
 */
export interface ProductFormPostContext {
	success: boolean;
	postId: number;
	postTitle: string;
	postLink: string;
	isLoggedIn: boolean;
	isPurchasable: boolean;
	productMode: 'regular' | 'variable' | 'booking';
	permissions: ProductFormPermissions;
	editLink: string | null;
	checkoutLink: string;
	cartPageLink: string;
	cart: CartConfigFromAPI;
	nonces: ProductFormNonces;
	l10n: ProductFormL10n;
}

/**
 * API response for /product-form/config endpoint
 */
export interface ProductFormAPIResponse extends ExtendedProductFormConfig {
	success: boolean;
	is_purchasable: boolean;
	out_of_stock_message?: string;
}
