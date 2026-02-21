/**
 * Current Plan Block - TypeScript Interfaces
 *
 * Type definitions for the Current Plan block.
 * Matches Voxel's current-plan widget structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php
 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php
 *
 * @package VoxelFSE
 */

import type { CombinedStyleAttributes } from '@shared/utils';

/**
 * Icon value structure (matches Elementor ICONS control)
 */
export interface IconValue {
	library: 'icon' | 'svg' | 'dynamic' | 'fa-solid' | 'fa-regular' | 'fa-brands' | 'line-awesome' | '';
	value: string;
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
 * Border value
 */
export interface BorderValue {
	borderType?: string;
	borderWidth?: BoxValues;
	borderColor?: string;
}

/**
 * Block attributes stored in WordPress database
 */
export interface CurrentPlanAttributes extends CombinedStyleAttributes {
	// Index signature to support advanced style attributes
	[key: string]: any;
	// Block & UI State
	blockId: string;
	contentTabOpenPanel: string; // Accordion state persistence for Content tab
	styleTabOpenPanel: string; // Accordion state persistence for Style tab
	secondaryButtonState: string; // State tab persistence (normal/hover)

	// VoxelTab - Visibility Rules
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: Array<Record<string, any>>;

	// VoxelTab - Loop Element
	loopSource?: string;
	loopLimit?: number;
	loopOffset?: number;

	// Content Tab - Icons
	planIcon: IconValue;
	viewPlansIcon: IconValue;
	configureIcon: IconValue;
	switchIcon: IconValue;
	cancelIcon: IconValue;
	portalIcon: IconValue;

	// Style Tab - Panel Accordion
	panelsSpacing?: number;
	panelsSpacing_tablet?: number;
	panelsSpacing_mobile?: number;
	panelBorder?: Record<string, any>;
	panelRadius?: number;
	panelRadius_tablet?: number;
	panelRadius_mobile?: number;
	panelBg?: string;
	panelShadow?: Record<string, any>;

	// Panel head
	headPadding?: Record<string, any>;
	headIcoSize?: number;
	headIcoSize_tablet?: number;
	headIcoSize_mobile?: number;
	headIcoMargin?: number;
	headIcoMargin_tablet?: number;
	headIcoMargin_mobile?: number;
	headIcoCol?: string;
	headTypo?: Record<string, any>;
	headTypoCol?: string;
	headBorderCol?: string;

	// Panel Pricing
	priceAlign?: string;
	priceTypo?: Record<string, any>;
	priceCol?: string;
	periodTypo?: Record<string, any>;
	periodCol?: string;

	// Panel body
	panelSpacing?: number;
	panelSpacing_tablet?: number;
	panelSpacing_mobile?: number;
	panelGap?: number;
	panelGap_tablet?: number;
	panelGap_mobile?: number;
	textAlign?: string;
	bodyTypo?: Record<string, any>;
	bodyTypoCol?: string;
	bodyTypoLink?: Record<string, any>;
	bodyColLink?: string;

	// Panel buttons
	panelButtonsGap?: number;
	panelButtonsGap_tablet?: number;
	panelButtonsGap_mobile?: number;

	// Style Tab - Secondary button Accordion
	scndBtnTypo?: Record<string, any>;
	scndBtnRadius?: number;
	scndBtnRadius_tablet?: number;
	scndBtnRadius_mobile?: number;
	scndBtnC?: string;
	scndBtnPadding?: Record<string, any>;
	scndBtnHeight?: number;
	scndBtnHeight_tablet?: number;
	scndBtnHeight_mobile?: number;
	scndBtnBg?: string;
	scndBtnBorder?: Record<string, any>;
	scndBtnIconSize?: number;
	scndBtnIconSize_tablet?: number;
	scndBtnIconSize_mobile?: number;
	scndBtnIconPad?: number;
	scndBtnIconPad_tablet?: number;
	scndBtnIconPad_mobile?: number;
	scndBtnIconColor?: string;

	// Secondary button - Hover state
	scndBtnCH?: string;
	scndBtnBgH?: string;
	scndBtnBorderH?: string;
	scndBtnIconColorH?: string;
}

/**
 * VxConfig JSON stored in save.tsx output
 * Contains all data needed for frontend hydration
 */
export interface CurrentPlanVxConfig {
	planIcon: IconValue;
	viewPlansIcon: IconValue;
	configureIcon: IconValue;
	switchIcon: IconValue;
	cancelIcon: IconValue;
	portalIcon: IconValue;
}

/**
 * Pricing data structure from REST API
 */
export interface PricingData {
	amount: number;
	currency: string;
	formattedPrice: string;
	interval: string;
	frequency: number;
	formattedPeriod: string;
}

/**
 * REST API response for current plan data
 */
export interface CurrentPlanApiResponse {
	isLoggedIn: boolean;
	membershipType: 'order' | 'default' | null;
	pricing: PricingData | null;
	planLabel: string;
	statusMessage: string | null;
	orderLink: string | null;
	switchPlanUrl: string | null;
	isSubscriptionCanceled: boolean;
}

/**
 * Props for the shared CurrentPlanComponent
 */
export interface CurrentPlanComponentProps {
	attributes: CurrentPlanAttributes;
	planData: CurrentPlanApiResponse | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
}
