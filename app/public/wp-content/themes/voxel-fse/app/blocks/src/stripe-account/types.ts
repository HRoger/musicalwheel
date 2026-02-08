/**
 * Stripe Account Block - TypeScript Types
 *
 * Plan C+ architecture - headless-ready, no PHP rendering
 * @package VoxelFSE
 */

/**
 * Elementor Icon structure from Voxel
 */
export interface VoxelIcon {
	value?: string;
	library?: string;
	url?: string;
}

/**
 * Stripe Account status from Voxel
 */
export interface StripeAccountStatus {
	exists: boolean;
	charges_enabled: boolean;
	details_submitted: boolean;
}

/**
 * Shipping region configuration
 */
export interface ShippingRegion {
	country: string;
	states?: string[];
	zip_codes_enabled?: boolean;
	zip_codes?: string;
}

/**
 * Shipping zone configuration
 */
export interface ShippingZone {
	key: string;
	label: string;
	regions: ShippingRegion[];
	_activeRegion?: ShippingRegion | null;
}

/**
 * Delivery estimate configuration
 */
export interface DeliveryEstimate {
	enabled: boolean;
	minimum: {
		value: number | null;
		unit: 'hour' | 'day' | 'business_day' | 'week' | 'month';
	};
	maximum: {
		value: number | null;
		unit: 'hour' | 'day' | 'business_day' | 'week' | 'month';
	};
}

/**
 * Shipping class pricing
 */
export interface ShippingClassPrice {
	shipping_class: string;
	amount_per_unit: number | null;
}

/**
 * Shipping rate configuration
 */
export interface ShippingRate {
	key: string;
	label: string;
	zone_keys: string[];
	type: 'free_shipping' | 'fixed_rate';
	free_shipping: {
		requirements: 'none' | 'minimum_order_amount';
		minimum_order_amount: number | null;
		delivery_estimate: DeliveryEstimate;
	};
	fixed_rate: {
		calculation_method: 'per_item' | 'per_order' | 'per_class';
		amount_per_unit: number | null;
		shipping_classes: ShippingClassPrice[];
		delivery_estimate: DeliveryEstimate;
	};
}

/**
 * Shipping class definition
 */
export interface ShippingClass {
	key: string;
	label: string;
}

/**
 * Country data with subdivisions
 */
export interface CountryData {
	name: string;
	continent: string;
	states?: Record<string, { name: string }>;
}

/**
 * Countries grouped by continent
 */
export type CountriesByContinent = Record<string, Record<string, string>>;

/**
 * Block attributes for Stripe Account
 */
export interface StripeAccountAttributes {
	// Block metadata
	blockId?: string;
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;

	// Content settings
	genImage: {
		id: number;
		url: string;
	};
	genImageDynamicTag?: string;
	previewAsUser: number | null;
	previewAsUserDynamicTag?: string;

	// Icons
	tsSetupIco: VoxelIcon | null;
	tsSubmitIco: VoxelIcon | null;
	tsUpdateIco: VoxelIcon | null;
	tsStripeIco: VoxelIcon | null;
	tsShippingIco: VoxelIcon | null;
	tsChevronLeft: VoxelIcon | null;
	saveIcon: VoxelIcon | null;
	handleIcon: VoxelIcon | null;
	tsZoneIco: VoxelIcon | null;
	trashIcon: VoxelIcon | null;
	downIcon: VoxelIcon | null;
	tsSearchIcon: VoxelIcon | null;
	tsAddIcon: VoxelIcon | null;

	// Style: Panel
	panelBorderType?: string;
	panelBorderWidth?: object;
	panelBorderColor?: string;
	panelBorderRadius?: number;
	panelBorderRadius_tablet?: number;
	panelBorderRadius_mobile?: number;
	panelBackground?: string;
	panelBoxShadow?: object;
	panelBodySpacing?: number;
	panelBodySpacing_tablet?: number;
	panelBodySpacing_mobile?: number;
	panelBodyContentGap?: number;
	panelBodyContentGap_tablet?: number;
	panelBodyContentGap_mobile?: number;
	panelTypography?: object;
	panelTextColor?: string;

	// Style: Field Label
	fieldLabelTypography?: object;
	fieldLabelColor?: string;
	fieldSelectColor?: string;

	// Style: Input & Textarea
	inputTextareaState?: string;
	inputPlaceholderColor?: string;
	inputPlaceholderTypography?: object;
	inputValueTextColor?: string;
	inputValueTypography?: object;
	inputBackgroundColor?: string;
	inputBorderType?: string;
	inputBorderWidth?: object;
	inputBorderColor?: string;
	inputBorderRadius?: number;
	inputBorderRadius_tablet?: number;
	inputBorderRadius_mobile?: number;
	inputHeight?: number;
	inputHeight_tablet?: number;
	inputHeight_mobile?: number;
	textareaPadding?: object;
	textareaHeight?: number;
	textareaHeight_tablet?: number;
	textareaHeight_mobile?: number;
	textareaBorderRadius?: number;
	textareaBorderRadius_tablet?: number;
	textareaBorderRadius_mobile?: number;

	// Style: Input Hover
	inputBackgroundColorHover?: string;
	inputBorderColorHover?: string;
	inputPlaceholderColorHover?: string;
	inputTextColorHover?: string;
	inputIconColorHover?: string;

	// Style: Input Active
	inputBackgroundColorActive?: string;
	inputBorderColorActive?: string;
	inputPlaceholderColorActive?: string;
	inputTextColorActive?: string;

	// Style: Input Suffix
	inputSuffixButtonTypography?: object;
	inputSuffixTextColor?: string;
	inputSuffixBackgroundColor?: string;
	inputSuffixBorderRadius?: number;
	inputSuffixBorderRadius_tablet?: number;
	inputSuffixBorderRadius_mobile?: number;
	inputSuffixBoxShadow?: object;
	inputSuffixSideMargin?: number;
	inputSuffixSideMargin_tablet?: number;
	inputSuffixSideMargin_mobile?: number;
	inputSuffixIconColor?: string;

	// Style: Switcher
	switcherBackgroundInactive?: string;
	switcherBackgroundActive?: string;
	switcherHandleBackground?: string;

	// Style: Select
	selectState?: string;
	selectBoxShadow?: object;
	selectBackgroundColor?: string;
	selectTextColor?: string;
	selectBorderType?: string;
	selectBorderWidth?: object;
	selectBorderColor?: string;
	selectBorderRadius?: number;
	selectBorderRadius_tablet?: number;
	selectBorderRadius_mobile?: number;
	selectHideChevron?: boolean;
	selectChevronColor?: string;

	// Style: Select Hover
	selectBackgroundColorHover?: string;
	selectTextColorHover?: string;
	selectBorderColorHover?: string;
	selectIconColorHover?: string;
	selectBoxShadowHover?: object;

	// Style: Tabs
	tabsState?: string;
	tabsGap?: number;
	tabsGap_tablet?: number;
	tabsGap_mobile?: number;
	tabsBackground?: string;
	tabsBorderType?: string;
	tabsBorderWidth?: object;
	tabsBorderColor?: string;
	tabsBorderRadius?: number;
	tabsBorderRadius_tablet?: number;
	tabsBorderRadius_mobile?: number;
	tabsTextTypography?: object;
	tabsTextColor?: string;

	// Style: Tabs Selected
	tabsBackgroundSelected?: string;
	tabsColorSelected?: string;
	tabsBorderColorSelected?: string;
	tabsBoxShadowSelected?: object;

	// Style: Heading
	headingTypography?: object;
	headingColor?: string;

	// Style: Repeater
	repeaterBackground?: string;
	repeaterBorderType?: string;
	repeaterBorderWidth?: object;
	repeaterBorderColor?: string;
	repeaterBorderRadius?: number;
	repeaterBorderRadius_tablet?: number;
	repeaterBorderRadius_mobile?: number;
	repeaterBoxShadow?: object;

	// Style: Repeater Head
	repeaterHeadSecondaryColor?: string;
	repeaterHeadSecondaryTypography?: object;
	repeaterHeadIconColor?: string;
	repeaterHeadBorderColor?: string;
	repeaterHeadBorderWidth?: number;
	repeaterHeadBorderWidth_tablet?: number;
	repeaterHeadBorderWidth_mobile?: number;

	// Style: Repeater Icon Button
	repeaterIconButtonState?: string;
	repeaterIconButtonColor?: string;
	repeaterIconButtonBackground?: string;
	repeaterIconButtonBorderType?: string;
	repeaterIconButtonBorderWidth?: object;
	repeaterIconButtonBorderColor?: string;
	repeaterIconButtonBorderRadius?: number;
	repeaterIconButtonBorderRadius_tablet?: number;
	repeaterIconButtonBorderRadius_mobile?: number;

	// Style: Repeater Icon Button Hover
	repeaterIconButtonColorHover?: string;
	repeaterIconButtonBackgroundHover?: string;
	repeaterIconButtonBorderColorHover?: string;

	// Style: Pills
	pillsState?: string;
	pillsTypography?: object;
	pillsBorderRadius?: number;
	pillsBorderRadius_tablet?: number;
	pillsBorderRadius_mobile?: number;
	pillsTextColor?: string;
	pillsBackgroundColor?: string;

	// Style: Pills Hover
	pillsTextColorHover?: string;
	pillsBackgroundColorHover?: string;

	// Style: Primary Button
	primaryButtonState?: string;
	primaryButtonTypography?: object;
	primaryButtonBorderType?: string;
	primaryButtonBorderWidth?: object;
	primaryButtonBorderRadius?: number;
	primaryButtonBorderRadius_tablet?: number;
	primaryButtonBorderRadius_mobile?: number;
	primaryButtonBoxShadow?: object;
	primaryButtonTextColor?: string;
	primaryButtonBackgroundColor?: string;
	primaryButtonBorderColor?: string;
	primaryButtonIconColor?: string;
	primaryButtonIconSize?: number;
	primaryButtonIconSize_tablet?: number;
	primaryButtonIconSize_mobile?: number;
	primaryButtonIconTextSpacing?: number;
	primaryButtonIconTextSpacing_tablet?: number;
	primaryButtonIconTextSpacing_mobile?: number;

	// Style: Primary Button Hover
	primaryButtonTextColorHover?: string;
	primaryButtonBackgroundColorHover?: string;
	primaryButtonBorderColorHover?: string;
	primaryButtonIconColorHover?: string;

	// Style: Secondary Button
	secondaryButtonState?: string;
	secondaryButtonTypography?: object;
	secondaryButtonBorderRadius?: number;
	secondaryButtonBorderRadius_tablet?: number;
	secondaryButtonBorderRadius_mobile?: number;
	secondaryButtonTextColor?: string;
	secondaryButtonPadding?: object;
	secondaryButtonHeight?: number;
	secondaryButtonHeight_tablet?: number;
	secondaryButtonHeight_mobile?: number;
	secondaryButtonBackgroundColor?: string;
	secondaryButtonBorderType?: string;
	secondaryButtonBorderWidth?: object;
	secondaryButtonBorderColor?: string;
	secondaryButtonIconSize?: number;
	secondaryButtonIconSize_tablet?: number;
	secondaryButtonIconSize_mobile?: number;
	secondaryButtonIconRightPadding?: number;
	secondaryButtonIconRightPadding_tablet?: number;
	secondaryButtonIconRightPadding_mobile?: number;
	secondaryButtonIconColor?: string;

	// Style: Secondary Button Hover
	secondaryButtonTextColorHover?: string;
	secondaryButtonBackgroundColorHover?: string;
	secondaryButtonBorderColorHover?: string;
	secondaryButtonIconColorHover?: string;

	// Style: Tertiary Button
	tertiaryButtonState?: string;
	tertiaryButtonIconColor?: string;
	tertiaryButtonIconSize?: number;
	tertiaryButtonIconSize_tablet?: number;
	tertiaryButtonIconSize_mobile?: number;
	tertiaryButtonBackground?: string;
	tertiaryButtonBorderType?: string;
	tertiaryButtonBorderWidth?: object;
	tertiaryButtonBorderColor?: string;
	tertiaryButtonBorderRadius?: number;
	tertiaryButtonBorderRadius_tablet?: number;
	tertiaryButtonBorderRadius_mobile?: number;
	tertiaryButtonTypography?: object;
	tertiaryButtonTextColor?: string;

	// Style: Tertiary Button Hover
	tertiaryButtonIconColorHover?: string;
	tertiaryButtonBackgroundHover?: string;
	tertiaryButtonBorderColorHover?: string;
	tertiaryButtonTextColorHover?: string;

	// Voxel Tab
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: any[];
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;
}

/**
 * Runtime configuration passed via vxconfig
 * This data comes from REST API in frontend context
 */
export interface StripeAccountConfig {
	// Basic config
	nonce: string;
	is_preview: boolean;

	// Account URLs
	onboard_link: string;
	dashboard_link: string;

	// Account status
	account: StripeAccountStatus;
	is_admin: boolean;
	admin_onboarding_enabled: boolean;

	// Shipping configuration (when vendor shipping enabled)
	shipping_enabled: boolean;
	shipping_countries?: Record<string, CountryData>;
	shipping_countries_by_continent?: CountriesByContinent;
	shipping_classes?: Record<string, ShippingClass>;
	shipping_zones?: ShippingZone[];
	shipping_rates?: ShippingRate[];
	primary_currency?: string;

	// Localization
	l10n?: {
		countries_selected?: string;
	};

	// Icon markup (from widget settings)
	// NOTE: Voxel template uses 'flag_icon' for zones and 'box_icon' for rates,
	// but neither are registered as Elementor controls. They always fall back to SVGs.
	// We use 'zone' for zone headers and 'rate' for rate headers to match visual parity.
	icons: {
		setup?: string;
		submit?: string;
		update?: string;
		stripe?: string;
		shipping?: string;
		chevronLeft?: string;
		save?: string;
		handle?: string;
		zone?: string;
		rate?: string; // For rate headers (Voxel uses box.svg fallback)
		trash?: string;
		down?: string;
		search?: string;
		add?: string;
	};
}

/**
 * REST API response for account data
 */
export interface StripeAccountAPIResponse {
	success: boolean;
	data: StripeAccountConfig;
}

/**
 * Save shipping AJAX response
 */
export interface SaveShippingResponse {
	success: boolean;
	message: string;
}

/**
 * Screen state type
 */
export type ScreenType = 'main' | 'shipping';

/**
 * Active continent filter state per zone
 */
export type ActiveContinentMap = Record<string, string | null>;
