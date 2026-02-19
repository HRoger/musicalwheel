/**
 * Listing Plans Block - TypeScript Interfaces
 *
 * Type definitions for the Listing Plans block.
 * Matches Voxel's listing-plans widget data structures.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-listings/widgets/listing-plans-widget.php
 * - Voxel template: themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php
 *
 * @package VoxelFSE
 */

import { VisibilityRule } from '@shared/controls/ElementVisibilityModal';

/**
 * Icon value interface (matches Voxel's icon structure)
 */
import { IconValue } from '../../../shared/types';

/**
 * Feature item in a plan
 */
export interface PlanFeature {
	id: string;
	text: string;
	icon: IconValue;
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Plan configuration stored in block attributes
 *
 * Evidence: listing-plans-widget.php:1494-1538
 * - image: ts_plan__{key}__image
 * - features: ts_plan__{key}__features
 * - featured: ts_plan__{key}__featured (switcher, 'yes'/'')
 * - featuredText: ts_plan__{key}__featured_text (default 'Featured')
 */
export interface PlanConfig {
	image: {
		id: number;
		url: string;
	} | null;
	imageDynamicTag?: string; // For dynamic images
	features: PlanFeature[];
	featured?: boolean;
	featuredText?: string;
}

/**
 * Price group item (for tabs)
 */
export interface PriceGroup {
	id: string;
	label: string;
	icon: IconValue;
	prices: string[]; // Array of plan keys
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Block attributes interface
 */
export interface ListingPlansAttributes {
	blockId: string;

	// Price groups (tabs)
	priceGroups: PriceGroup[];

	// Plan configurations (keyed by plan key)
	planConfigs: Record<string, PlanConfig>;

	// Style attributes - General
	plansColumns: number;
	plansColumns_tablet?: number;
	plansColumns_mobile?: number;
	plansGap: number;
	plansGap_tablet?: number;
	plansGap_mobile?: number;
	plansBorderRadius: number;
	plansBorderRadius_tablet?: number;
	plansBorderRadius_mobile?: number;
	plansBorderType?: string;
	plansBorderWidth?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string };
	plansBorderColor?: string;
	plansBackground?: string;
	plansBoxShadow?: {}; // BoxShadow type

	// Plan body
	bodyPadding: number;
	bodyPadding_tablet?: number;
	bodyPadding_mobile?: number;
	bodyContentGap: number;
	bodyContentGap_tablet?: number;
	bodyContentGap_mobile?: number;

	// Plan image
	imagePadding: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	imagePadding_tablet?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	imagePadding_mobile?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	imageHeight: number;
	imageHeight_tablet?: number;
	imageHeight_mobile?: number;

	// Pricing alignment
	pricingAlign: 'flex-start' | 'center' | 'flex-end';
	priceTypography?: {};
	priceColor?: string;
	periodTypography?: {};
	periodColor?: string;

	// Plan name alignment
	contentAlign: 'flex-start' | 'center' | 'flex-end';
	nameTypography?: {};
	nameColor?: string;

	// Plan description alignment
	descAlign: 'left' | 'center' | 'right';
	descTypography?: {};
	descColor?: string;

	// Plan features alignment
	listAlign: 'flex-start' | 'center' | 'flex-end';
	listGap: number;
	listGap_tablet?: number;
	listGap_mobile?: number;
	listIconSize: number;
	listIconSize_tablet?: number;
	listIconSize_mobile?: number;
	listIconRightPad: number;
	listIconRightPad_tablet?: number;
	listIconRightPad_mobile?: number;
	listTypography?: {};
	listColor?: string;
	listIconColor?: string;

	// Featured Plan
	featuredBorderType?: string;
	featuredBorderWidth?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string };
	featuredBorderColor?: string;
	featuredBoxShadow?: {};
	featuredBadgeBg?: string;
	featuredBadgeColor?: string;
	featuredBadgeTypography?: {};

	// Tabs
	tabsDisabled: boolean;
	tabsJustify:
	| 'flex-start'
	| 'center'
	| 'flex-end'
	| 'space-between'
	| 'space-around';
	tabsPadding: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsPadding_tablet?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsPadding_mobile?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsMargin: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsMargin_tablet?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsMargin_mobile?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	tabsBorderRadius: number;
	tabsBorderRadius_tablet?: number;
	tabsBorderRadius_mobile?: number;
	tabTypography?: {};
	tabActiveTypography?: {};
	tabColor?: string;
	tabActiveColor?: string;
	tabBorderColor?: string;
	tabActiveBorderColor?: string;
	tabBackground?: string;
	tabActiveBackground?: string;

	// Tabs Hover
	tabsTextColorHover?: string;
	tabsActiveTextColorHover?: string;
	tabsBorderColorHover?: string;
	tabsActiveBorderColorHover?: string;
	tabsBgColorHover?: string;
	tabsActiveBgColorHover?: string;
	tabBorderType?: string;

	// Primary button (ts-btn-2)
	primaryBtnRadius: number;
	primaryBtnRadius_tablet?: number;
	primaryBtnRadius_mobile?: number;
	primaryBtnHeight: number;
	primaryBtnHeight_tablet?: number;
	primaryBtnHeight_mobile?: number;
	primaryBtnIconSize: number;
	primaryBtnIconSize_tablet?: number;
	primaryBtnIconSize_mobile?: number;
	primaryBtnPadding?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	primaryBtnPadding_tablet?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	primaryBtnPadding_mobile?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	primaryBtnIconPad: number;
	primaryBtnIconPad_tablet?: number;
	primaryBtnIconPad_mobile?: number;
	primaryBtnTypography?: {};
	primaryBtnColor?: string;
	primaryBtnBg?: string;
	primaryBtnBorderType?: string;
	primaryBtnBorderWidth?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string };
	primaryBtnBorderColor?: string;
	primaryBtnBoxShadow?: {};

	primaryBtnIconColor?: string;
	primaryBtnColorHover?: string;
	primaryBtnBgHover?: string;
	primaryBtnBorderColorHover?: string;
	primaryBtnIconColorHover?: string;
	primaryBtnBoxShadowHover?: {};

	// Secondary button (ts-btn-1)
	secondaryBtnRadius: number;
	secondaryBtnRadius_tablet?: number;
	secondaryBtnRadius_mobile?: number;
	secondaryBtnHeight: number;
	secondaryBtnHeight_tablet?: number;
	secondaryBtnHeight_mobile?: number;
	secondaryBtnIconSize: number;
	secondaryBtnIconSize_tablet?: number;
	secondaryBtnIconSize_mobile?: number;
	secondaryBtnPadding?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	secondaryBtnPadding_tablet?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	secondaryBtnPadding_mobile?: {
		top: string | number;
		right: string | number;
		bottom: string | number;
		left: string | number;
	};
	secondaryBtnIconPad: number;
	secondaryBtnIconPad_tablet?: number;
	secondaryBtnIconPad_mobile?: number;
	secondaryBtnTypography?: {};
	secondaryBtnColor?: string;
	secondaryBtnBg?: string;
	secondaryBtnBorderType?: string;
	secondaryBtnBorderWidth?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string };
	secondaryBtnBorderColor?: string;
	secondaryBtnBoxShadow?: {};

	secondaryBtnIconColor?: string;
	secondaryBtnColorHover?: string;
	secondaryBtnBgHover?: string;
	secondaryBtnBorderColorHover?: string;
	secondaryBtnIconColorHover?: string;
	secondaryBtnBoxShadowHover?: {};

	// Dialog
	dialogTypography?: {};
	dialogColor?: string;
	dialogBackground?: string;
	dialogBorderRadius?: number;
	dialogBorderRadius_tablet?: number;
	dialogBorderRadius_mobile?: number;
	dialogBorderType?: string;
	dialogBorderWidth?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string };
	dialogBorderColor?: string;
	dialogBoxShadow?: {};

	// Icons
	arrowIcon: IconValue;

	// Redirect options — matches Voxel widget ts_direct_purchase_flow (line 1549-1582)
	directPurchaseRedirect: 'order' | 'new_post' | 'custom';
	directPurchasePostType?: string;
	directPurchaseCustomUrl?: string;

	// Allow extension with block-specific attributes
	[key: string]: any;
}

/**
 * Listing Plan from API
 */
export interface ListingPlan {
	key: string;
	label: string;
	description: string;
	submissions: {
		count: number | null;
		mode: 'unlimited' | 'limited';
	};
}

/**
 * Price data from API
 */
export interface PriceData {
	planKey: string;
	key: string;
	label: string;
	description: string;
	image: string | null;
	features: PlanFeature[];
	link: string;
	isFree: boolean;
	amount?: string;
	discountAmount?: string | null;
	period?: string;
	alreadyPurchased?: boolean;
	disableRepeatPurchase?: boolean;
}

/**
 * API response for listing plans
 */
/**
 * Package data from API (available packages for a plan)
 *
 * Evidence: listing-plans-widget.php:1641 - $packages_by_plan
 */
export interface PackageData {
	packageId: number;
	total: number;
	used: number;
}

export interface ListingPlansApiResponse {
	isLoggedIn: boolean;
	availablePlans: ListingPlan[];
	priceGroups: ApiPriceGroup[];
	packagesByPlan?: Record<string, PackageData>;
	currentPlanKey?: string | null;
	process?: string | null;
}

/**
 * API price group
 */
export interface ApiPriceGroup {
	id: string;
	label: string;
	prices: PriceData[];
}

/**
 * VxConfig stored in script tag
 */
export interface ListingPlansVxConfig {
	priceGroups: PriceGroup[];
	planConfigs: Record<string, PlanConfig>;
	arrowIcon: IconValue;
	// Redirect options (Content Tab) — matches Voxel widget ts_direct_purchase_flow
	directPurchaseRedirect: 'order' | 'new_post' | 'custom';
	directPurchasePostType?: string;
	directPurchaseCustomUrl?: string;
	style: {
		// General
		plansColumns: number;
		plansColumns_tablet?: number;
		plansColumns_mobile?: number;
		plansGap: number;
		plansBorderRadius?: number;
		plansBorderRadius_tablet?: number;
		plansBorderRadius_mobile?: number;

		// Alignments
		pricingAlign: string;
		contentAlign: string;
		descAlign: string;
		listAlign: string;

		// Tabs
		tabsDisabled: boolean;
		tabsJustify: string;

		// Allow indexing for other style props (colors, typo, etc)
		[key: string]: any;
	};
}

/**
 * Component props
 */
export interface ListingPlansComponentProps {
	attributes: ListingPlansAttributes;
	apiData: ListingPlansApiResponse | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
	onTabChange?: (groupId: string) => void;
}

/**
 * Default icon value
 */
export const defaultIconValue: IconValue = {
	library: '',
	value: '',
};

/**
 * Default plan config
 */
export const defaultPlanConfig: PlanConfig = {
	image: null,
	features: [],
};

/**
 * Default price group
 */
export const defaultPriceGroup: PriceGroup = {
	id: '',
	label: 'Monthly',
	icon: defaultIconValue,
	prices: [],
};

/**
 * Default attributes
 */
export const defaultAttributes: Partial<ListingPlansAttributes> = {
	blockId: '',
	priceGroups: [],
	planConfigs: {},
	plansColumns: 3,
	plansGap: 20,
	plansBorderRadius: 0,
	bodyPadding: 20,
	bodyContentGap: 15,
	imagePadding: { top: '0', right: '0', bottom: '0', left: '0' },
	imageHeight: 0,
	pricingAlign: 'flex-start',
	contentAlign: 'flex-start',
	descAlign: 'left',
	listAlign: 'flex-start',
	listGap: 10,
	listIconSize: 18,
	listIconRightPad: 8,
	tabsDisabled: false,
	tabsJustify: 'flex-start',
	tabsPadding: { top: '0', right: '0', bottom: '0', left: '0' },
	tabsMargin: { top: '0', right: '15', bottom: '15', left: '0' },
	tabsBorderRadius: 0,
	primaryBtnRadius: 5,
	primaryBtnHeight: 0,
	primaryBtnIconSize: 18,
	primaryBtnIconPad: 8,
	secondaryBtnRadius: 5,
	secondaryBtnHeight: 0,
	secondaryBtnIconSize: 18,
	secondaryBtnIconPad: 8,
	dialogBorderRadius: 10,
	arrowIcon: defaultIconValue,
	directPurchaseRedirect: 'order',
	// Defaults for new attributes
	plansBorderType: 'default',
};
