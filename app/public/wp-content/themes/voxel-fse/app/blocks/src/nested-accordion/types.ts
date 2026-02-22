/**
 * Nested Accordion Block - Type Definitions
 *
 * 1:1 match with Voxel's nested-accordion widget controls
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/controls/IconPickerControl';
import type { TypographyValue } from '@shared/controls/TypographyPopup';

/**
 * Responsive value wrapper
 */
export interface ResponsiveValue<T> {
	desktop?: T;
	tablet?: T;
	mobile?: T;
}

/**
 * Box/dimensions value (padding, margin, border-radius)
 */
export interface BoxValue {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

/**
 * Border value
 */
export interface BorderValue {
	width?: string;
	style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
	color?: string;
}

/**
 * Text shadow value
 */
export interface TextShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	color?: string;
}

/**
 * Text stroke value
 */
export interface TextStrokeValue {
	color?: string;
	width?: number;
}

/**
 * Visibility rule structure (matches Voxel)
 */
export interface VisibilityRule {
	type: string;
	[key: string]: unknown;
}

/**
 * Loop configuration for repeater items
 */
export interface LoopConfig {
	source: string; // e.g., "@post(related_posts)"
	limit?: number;
	offset?: number;
}

/**
 * Visibility configuration for repeater items
 */
export interface VisibilityConfig {
	behavior: 'show' | 'hide';
	rules: VisibilityRule[][];
}

/**
 * Single accordion item data
 */
export interface AccordionItemData {
	id: string;
	title: string;
	cssId: string;
	// Voxel features (stored in vxconfig, not WP attributes)
	loop?: LoopConfig;
	visibility?: VisibilityConfig;
}

/**
 * Animation duration value
 */
export interface AnimationDuration {
	size: number;
	unit: 'ms' | 's';
}

/**
 * Main block attributes
 */
export interface NestedAccordionAttributes {
	// Core
	blockId: string;

	// Tab panel states (for UI persistence)
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;
	accordionState?: string;
	titleColorState?: string;
	iconColorState?: string;

	// Layout - Items
	items: AccordionItemData[];

	// Layout - Position
	itemPosition: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;

	// Layout - Title
	titleTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
	faqSchema: boolean;

	// Layout - Icons
	iconPosition: ResponsiveValue<'start' | 'end'>;
	expandIcon: IconValue;
	collapseIcon: IconValue;

	// Interactions
	defaultState: 'expanded' | 'all_collapsed';
	maxItemsExpanded: 'one' | 'multiple';
	animationDuration: AnimationDuration;

	// Style - Accordion (flat numeric attributes for ResponsiveRangeControl)
	itemSpacing: number;
	itemSpacing_tablet?: number;
	itemSpacing_mobile?: number;
	itemSpacingUnit?: string;
	contentDistance: number;
	contentDistance_tablet?: number;
	contentDistance_mobile?: number;
	contentDistanceUnit?: string;
	accordionBorderRadius: ResponsiveValue<BoxValue>;
	accordionPadding: ResponsiveValue<BoxValue>;

	// Style - Accordion States (Normal)
	accordionNormalBgType?: string;
	accordionNormalBg: string;
	accordionNormalBorderType?: string;
	accordionNormalBorderWidth?: Record<string, any>;
	accordionNormalBorderColor?: string;

	// Style - Accordion States (Hover)
	accordionHoverBgType?: string;
	accordionHoverBg: string;
	accordionHoverBorderType?: string;
	accordionHoverBorderWidth?: Record<string, any>;
	accordionHoverBorderColor?: string;

	// Style - Accordion States (Active)
	accordionActiveBgType?: string;
	accordionActiveBg: string;
	accordionActiveBorderType?: string;
	accordionActiveBorderWidth?: Record<string, any>;
	accordionActiveBorderColor?: string;

	// Style - Title
	titleTypography: TypographyValue;
	titleNormalColor: string;
	titleHoverColor: string;
	titleActiveColor: string;
	titleNormalTextShadow?: TextShadowValue;
	titleHoverTextShadow?: TextShadowValue;
	titleActiveTextShadow?: TextShadowValue;
	titleNormalTextStroke?: TextStrokeValue;
	titleHoverTextStroke?: TextStrokeValue;
	titleActiveTextStroke?: TextStrokeValue;

	// Style - Icon (flat numeric attributes for ResponsiveRangeControl)
	iconSize: number;
	iconSize_tablet?: number;
	iconSize_mobile?: number;
	iconSpacing: number;
	iconSpacing_tablet?: number;
	iconSpacing_mobile?: number;
	iconNormalColor: string;
	iconHoverColor: string;
	iconActiveColor: string;

	// Style - Content
	contentBgType?: string;
	contentBg: string;
	contentBorderType?: string;
	contentBorderWidth?: Record<string, any>;
	contentBorderColor?: string;
	contentBorderRadius: ResponsiveValue<BoxValue>;
	contentPadding: ResponsiveValue<BoxValue>;

	// Visibility
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: NestedAccordionAttributes;
	setAttributes: (attrs: Partial<NestedAccordionAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * vxconfig structure for frontend hydration
 */
export interface NestedAccordionVxConfig {
	items: Array<{
		id: string;
		title: string;
		cssId: string;
		loop?: LoopConfig;
		visibility?: VisibilityConfig;
	}>;
	interactions: {
		defaultState: 'expanded' | 'all_collapsed';
		maxItemsExpanded: 'one' | 'multiple';
		animationDuration: number; // in ms
	};
	icons: {
		expand: IconValue;
		collapse: IconValue;
		position: 'start' | 'end';
	};
	titleTag: string;
	faqSchema: boolean;
}

/**
 * Accordion item component props
 */
export interface AccordionItemProps {
	item: AccordionItemData;
	index: number;
	isOpen: boolean;
	onToggle: () => void;
	titleTag: string;
	expandIcon: IconValue;
	collapseIcon: IconValue;
	iconPosition: 'start' | 'end';
	children?: React.ReactNode;
}

/**
 * Hook configuration for accordion toggle
 */
export interface AccordionToggleConfig {
	defaultState: 'expanded' | 'all_collapsed';
	maxItemsExpanded: 'one' | 'multiple';
	animationDuration: number;
	itemCount: number;
}

/**
 * Hook return type for accordion toggle
 */
export interface AccordionToggleReturn {
	openItems: Set<number>;
	toggleItem: (index: number, element: HTMLDetailsElement) => void;
	isOpen: (index: number) => boolean;
	closeAll: () => void;
}
