/**
 * Membership Plans Block - TypeScript Interfaces
 *
 * Type definitions for the Membership Plans block.
 * Matches Voxel's pricing-plans widget data structures.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

/**
 * Icon value interface (matches Voxel's icon structure)
 */
export interface IconValue {
	library: string;
	value: string;
}

// Import and re-export VisibilityRule from shared controls to avoid type conflict
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
export type { VisibilityRule };

/**
 * Feature item in a plan
 */
export interface PlanFeature {
	id?: string;
	text: string;
	icon: IconValue;
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Plan configuration stored in block attributes
 */
export interface PlanConfig {
	image: {
		id: number;
		url: string;
	} | null;
	imageDynamicTag?: string;
	features: PlanFeature[];
}

/**
 * Price group item (for tabs)
 */
export interface PriceGroup {
	id: string;
	label: string;
	prices: string[]; // Array of price keys like "plan_key@price_key" or "default"
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Block attributes interface
 */
export interface MembershipPlansAttributes {
	blockId: string;

	// Inspector Tab State
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;

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

	// Plan body
	bodyPadding: number;
	bodyPadding_tablet?: number;
	bodyPadding_mobile?: number;
	bodyContentGap: number;
	bodyContentGap_tablet?: number;
	bodyContentGap_mobile?: number;

	// Plan image
	imagePadding: Record<string, string>;
	imagePadding_tablet?: Record<string, string>;
	imagePadding_mobile?: Record<string, string>;
	imageHeight: number;
	imageHeight_tablet?: number;
	imageHeight_mobile?: number;

	// Pricing alignment
	pricingAlign: 'flex-start' | 'center' | 'flex-end';

	// Plan name alignment
	contentAlign: 'flex-start' | 'center' | 'flex-end';

	// Plan description alignment
	descAlign: 'left' | 'center' | 'right';

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

	// Typography & color controls
	priceTypography: Record<string, any>;
	priceColor: string;
	periodTypography: Record<string, any>;
	periodColor: string;
	nameTypography: Record<string, any>;
	nameColor: string;
	descTypography: Record<string, any>;
	descColor: string;
	listTypography: Record<string, any>;
	listColor: string;
	listIconColor: string;

	// Card container
	plansBorderType: string;
	plansBorderWidth: Record<string, string>;
	plansBorderColor: string;
	plansBg: string;
	plansShadow: Record<string, any>;

	// Tabs
	tabsDisabled: boolean;
	tabsJustify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
	tabsPadding: Record<string, string>;
	tabsPadding_tablet?: Record<string, string>;
	tabsPadding_mobile?: Record<string, string>;
	tabsMargin: Record<string, string>;
	tabsMargin_tablet?: Record<string, string>;
	tabsMargin_mobile?: Record<string, string>;
	tabsBorderRadius: number;
	tabsBorderRadius_tablet?: number;
	tabsBorderRadius_mobile?: number;
	tabTypography: Record<string, any>;
	tabActiveTypography: Record<string, any>;
	tabTextColor: string;
	tabActiveTextColor: string;
	tabBackground: string;
	tabActiveBackground: string;
	tabBorderType: string;
	tabBorderWidth: Record<string, string>;
	tabBorderColor: string;
	tabActiveBorderColor: string;
	// Tabs hover states
	tabTextColorHover: string;
	tabActiveTextColorHover: string;
	tabBorderColorHover: string;
	tabActiveBorderColorHover: string;
	tabBackgroundHover: string;
	tabActiveBackgroundHover: string;

	// Primary button (ts-btn-2)
	primaryBtnTypography: Record<string, any>;
	primaryBtnRadius: number;
	primaryBtnRadius_tablet?: number;
	primaryBtnRadius_mobile?: number;
	primaryBtnTextColor: string;
	primaryBtnPadding: Record<string, string>;
	primaryBtnPadding_tablet?: Record<string, string>;
	primaryBtnPadding_mobile?: Record<string, string>;
	primaryBtnHeight: number;
	primaryBtnHeight_tablet?: number;
	primaryBtnHeight_mobile?: number;
	primaryBtnBgColor: string;
	primaryBtnBorderType: string;
	primaryBtnBorderWidth: Record<string, string>;
	primaryBtnBorderColor: string;
	primaryBtnIconSize: number;
	primaryBtnIconSize_tablet?: number;
	primaryBtnIconSize_mobile?: number;
	primaryBtnIconPad: number;
	primaryBtnIconPad_tablet?: number;
	primaryBtnIconPad_mobile?: number;
	primaryBtnIconColor: string;
	// Primary button hover states
	primaryBtnTextColorHover: string;
	primaryBtnBgColorHover: string;
	primaryBtnBorderColorHover: string;
	primaryBtnIconColorHover: string;

	// Secondary button (ts-btn-1)
	secondaryBtnTypography: Record<string, any>;
	secondaryBtnRadius: number;
	secondaryBtnRadius_tablet?: number;
	secondaryBtnRadius_mobile?: number;
	secondaryBtnTextColor: string;
	secondaryBtnPadding: Record<string, string>;
	secondaryBtnPadding_tablet?: Record<string, string>;
	secondaryBtnPadding_mobile?: Record<string, string>;
	secondaryBtnHeight: number;
	secondaryBtnHeight_tablet?: number;
	secondaryBtnHeight_mobile?: number;
	secondaryBtnBgColor: string;
	secondaryBtnBorderType: string;
	secondaryBtnBorderWidth: Record<string, string>;
	secondaryBtnBorderColor: string;
	secondaryBtnIconSize: number;
	secondaryBtnIconSize_tablet?: number;
	secondaryBtnIconSize_mobile?: number;
	secondaryBtnIconPad: number;
	secondaryBtnIconPad_tablet?: number;
	secondaryBtnIconPad_mobile?: number;
	secondaryBtnIconColor: string;
	// Secondary button hover states
	secondaryBtnTextColorHover: string;
	secondaryBtnBgColorHover: string;
	secondaryBtnBorderColorHover: string;
	secondaryBtnIconColorHover: string;

	// Icons
	arrowIcon: IconValue;

	// Voxel Tab - Sticky
	stickyEnabled?: boolean;
	stickyDesktop?: 'sticky' | 'initial';
	stickyTablet?: 'sticky' | 'initial';
	stickyMobile?: 'sticky' | 'initial';
	stickyTop?: number;
	stickyTop_tablet?: number;
	stickyTop_mobile?: number;
	stickyTopUnit?: string;
	stickyLeft?: number;
	stickyLeft_tablet?: number;
	stickyLeft_mobile?: number;
	stickyLeftUnit?: string;
	stickyRight?: number;
	stickyRight_tablet?: number;
	stickyRight_mobile?: number;
	stickyRightUnit?: string;
	stickyBottom?: number;
	stickyBottom_tablet?: number;
	stickyBottom_mobile?: number;
	stickyBottomUnit?: string;

	// Voxel Tab - Visibility
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];

	// Voxel Tab - Loop element
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: number | string;
	loopOffset?: number | string;

	// Persistence
	activeTabAttribute?: string;

	// Index signature for dynamic attributes (needed for AdvancedStyleAttributes)
	[key: string]: unknown;
}

/**
 * Price data from API
 */
export interface PriceData {
	priceId: string;
	key: string; // "plan_key@price_key" or "default"
	group: string; // Price group ID
	label: string; // Plan label
	description: string;
	image: string; // HTML or URL
	features: PlanFeature[];
	link: string; // Checkout/action URL
	isFree: boolean;
	amount?: string; // Formatted price
	discountAmount?: string | null; // Formatted discount price
	period?: string; // Formatted billing period
	trialDays?: number | null;
}

/**
 * API response for membership plans
 */
export interface MembershipPlansApiResponse {
	isLoggedIn: boolean;
	availablePlans: AvailablePlan[];
	userMembership: UserMembership | null;
	priceGroups: ApiPriceGroup[];
}

/**
 * Available plan from API
 */
export interface AvailablePlan {
	key: string;
	label: string;
	description: string;
	prices: AvailablePrice[];
}

/**
 * Available price from API
 */
export interface AvailablePrice {
	key: string;
	priceKey: string; // "plan_key@price_key"
	label: string;
	amount: number;
	currency: string;
	formattedAmount: string;
	interval: string | null;
	frequency: number | null;
	formattedPeriod: string | null;
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
 * User membership info
 */
export interface UserMembership {
	type: 'order' | 'default' | 'legacy_subscription' | 'legacy_payment';
	planKey: string;
	priceKey: string | null;
	isSubscriptionCanceled: boolean;
	isInitialState: boolean;
}

/**
 * VxConfig stored in script tag
 */
export interface MembershipPlansVxConfig {
	priceGroups: PriceGroup[];
	planConfigs: Record<string, PlanConfig>;
	arrowIcon: IconValue;
	style: {
		plansColumns: number;
		plansColumns_tablet?: number;
		plansColumns_mobile?: number;
		plansGap: number;
		tabsDisabled: boolean;
		tabsJustify: string;
		pricingAlign: string;
		contentAlign: string;
		descAlign: string;
		listAlign: string;
	};
}

/**
 * Component props
 */
export interface MembershipPlansComponentProps {
	attributes: MembershipPlansAttributes;
	apiData: MembershipPlansApiResponse | null;
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
	prices: [],
};

/**
 * Default attributes
 */
export const defaultAttributes: Partial<MembershipPlansAttributes> = {
	blockId: '',
	priceGroups: [],
	planConfigs: {},
	plansColumns: 3,
	plansGap: 20,
	plansBorderRadius: 0,
	bodyPadding: 20,
	bodyContentGap: 15,
	imagePadding: {},
	imageHeight: 0,
	pricingAlign: 'flex-start',
	contentAlign: 'flex-start',
	descAlign: 'left',
	listAlign: 'flex-start',
	listGap: 10,
	listIconSize: 18,
	listIconRightPad: 8,
	// Typography & color
	priceTypography: {},
	priceColor: '',
	periodTypography: {},
	periodColor: '',
	nameTypography: {},
	nameColor: '',
	descTypography: {},
	descColor: '',
	listTypography: {},
	listColor: '',
	listIconColor: '',
	// Card container
	plansBorderType: '',
	plansBorderWidth: {},
	plansBorderColor: '',
	plansBg: '',
	plansShadow: {},
	// Tabs
	tabsDisabled: false,
	tabsJustify: 'flex-start',
	tabsPadding: {},
	tabsMargin: {},
	tabsBorderRadius: 0,
	tabTypography: {},
	tabActiveTypography: {},
	tabTextColor: '',
	tabActiveTextColor: '',
	tabBackground: '',
	tabActiveBackground: '',
	tabBorderType: '',
	tabBorderWidth: {},
	tabBorderColor: '',
	tabActiveBorderColor: '',
	tabTextColorHover: '',
	tabActiveTextColorHover: '',
	tabBorderColorHover: '',
	tabActiveBorderColorHover: '',
	tabBackgroundHover: '',
	tabActiveBackgroundHover: '',
	// Primary button
	primaryBtnTypography: {},
	primaryBtnRadius: 5,
	primaryBtnTextColor: '',
	primaryBtnPadding: {},
	primaryBtnHeight: 0,
	primaryBtnBgColor: '',
	primaryBtnBorderType: '',
	primaryBtnBorderWidth: {},
	primaryBtnBorderColor: '',
	primaryBtnIconSize: 18,
	primaryBtnIconPad: 8,
	primaryBtnIconColor: '',
	primaryBtnTextColorHover: '',
	primaryBtnBgColorHover: '',
	primaryBtnBorderColorHover: '',
	primaryBtnIconColorHover: '',
	// Secondary button
	secondaryBtnTypography: {},
	secondaryBtnRadius: 5,
	secondaryBtnTextColor: '',
	secondaryBtnPadding: {},
	secondaryBtnHeight: 0,
	secondaryBtnBgColor: '',
	secondaryBtnBorderType: '',
	secondaryBtnBorderWidth: {},
	secondaryBtnBorderColor: '',
	secondaryBtnIconSize: 18,
	secondaryBtnIconPad: 8,
	secondaryBtnIconColor: '',
	secondaryBtnTextColorHover: '',
	secondaryBtnBgColorHover: '',
	secondaryBtnBorderColorHover: '',
	secondaryBtnIconColorHover: '',
	// Icons
	arrowIcon: defaultIconValue,
};
