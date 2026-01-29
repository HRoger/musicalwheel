/**
 * Nested Tabs Block - Type Definitions
 *
 * 1:1 match with Voxel/Elementor's nested-tabs widget controls
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/controls/IconPickerControl';
import type { TypographyValue } from '@shared/controls/TypographyPopup';
import type { LoopConfig } from '@shared/controls/LoopElementModal';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';

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
 * Slider value with size and unit
 */
export interface SliderValue {
	size: number;
	unit: string;
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
 * Box shadow value
 */
export interface BoxShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'inset' | 'outset';
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
 * Background type options
 */
export type BackgroundType = '' | 'classic' | 'gradient';

/**
 * Single tab item data
 */
export interface TabItemData {
	id: string;
	title: string;
	cssId: string;
	icon: IconValue | null;
	iconActive: IconValue | null;
	// Loop repeater row configuration
	loopConfig?: LoopConfig;
	// Row visibility settings
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
}

/**
 * Tab direction options
 */
export type TabDirection = 'block-start' | 'block-end' | 'inline-start' | 'inline-end';

/**
 * Tab justify options
 */
export type TabJustify = 'start' | 'center' | 'end' | 'stretch';

/**
 * Title alignment options
 */
export type TitleAlignment = 'start' | 'center' | 'end';

/**
 * Horizontal scroll options
 */
export type HorizontalScroll = 'disable' | 'enable';

/**
 * Breakpoint selector options
 */
export type BreakpointSelector = 'none' | 'mobile' | 'tablet';

/**
 * Icon position options
 */
export type IconPosition = 'block-start' | 'inline-end' | 'block-end' | 'inline-start';

/**
 * Main block attributes
 */
export interface NestedTabsAttributes {
	// Core
	blockId: string;

	// Inspector tab state
	activeInspectorTab: string;
	contentTabOpenPanel: string;
	styleTabOpenPanel: string;
	tabsStateTab: string;
	titlesStateTab: string;
	iconStateTab: string;

	// Layout - Tabs
	tabs: TabItemData[];

	// Layout - Direction & Alignment
	tabsDirection: ResponsiveValue<TabDirection>;
	tabsJustifyHorizontal: ResponsiveValue<TabJustify>;
	tabsJustifyVertical: ResponsiveValue<TabJustify>;
	tabsWidth: ResponsiveValue<SliderValue>;
	titleAlignment: ResponsiveValue<TitleAlignment>;

	// Additional Settings
	horizontalScroll: ResponsiveValue<HorizontalScroll>;
	breakpointSelector: BreakpointSelector;

	// Style - Tabs
	tabsGap: ResponsiveValue<string>;
	tabsContentDistance: ResponsiveValue<string>;
	tabsBorderRadius: ResponsiveValue<BoxValue>;
	tabsPadding: ResponsiveValue<BoxValue>;

	// Style - Tabs States
	tabsNormalBgType: BackgroundType;
	tabsNormalBg: string;
	tabsNormalBorderType: string;
	tabsNormalBorderWidth: BoxValue;
	tabsNormalBorderColor: string;
	tabsNormalBoxShadow: BoxShadowValue;
	tabsHoverBgType: BackgroundType;
	tabsHoverBg: string;
	tabsHoverBorderType: string;
	tabsHoverBorderWidth: BoxValue;
	tabsHoverBorderColor: string;
	tabsHoverBoxShadow: BoxShadowValue;
	tabsHoverAnimation: string;
	tabsTransitionDuration: ResponsiveValue<SliderValue>;
	tabsActiveBgType: BackgroundType;
	tabsActiveBg: string;
	tabsActiveBorderType: string;
	tabsActiveBorderWidth: BoxValue;
	tabsActiveBorderColor: string;
	tabsActiveBoxShadow: BoxShadowValue;

	// Style - Title
	titleTypography: TypographyValue;
	titleNormalColor: string;
	titleNormalTextShadow: TextShadowValue;
	titleNormalTextStroke: TextShadowValue;
	titleHoverColor: string;
	titleHoverTextShadow: TextShadowValue;
	titleHoverTextStroke: TextShadowValue;
	titleActiveColor: string;
	titleActiveTextShadow: TextShadowValue;
	titleActiveTextStroke: TextShadowValue;

	// Style - Icon
	iconPosition: ResponsiveValue<IconPosition>;
	iconSize: ResponsiveValue<string>;
	iconSpacing: ResponsiveValue<string>;
	iconNormalColor: string;
	iconHoverColor: string;
	iconActiveColor: string;

	// Style - Content
	contentBgType: BackgroundType;
	contentBg: string;
	contentBorderType: string;
	contentBorderWidth: BoxValue;
	contentBorderColor: string;
	contentBorderRadius: ResponsiveValue<BoxValue>;
	contentBoxShadow: BoxShadowValue;
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
	attributes: NestedTabsAttributes;
	setAttributes: (attrs: Partial<NestedTabsAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * vxconfig structure for frontend hydration
 */
export interface NestedTabsVxConfig {
	tabs: Array<{
		id: string;
		title: string;
		cssId: string;
		icon: IconValue | null;
		iconActive: IconValue | null;
	}>;
	layout: {
		direction: TabDirection;
		justifyHorizontal: TabJustify;
		justifyVertical: TabJustify;
		titleAlignment: TitleAlignment;
		horizontalScroll: HorizontalScroll;
		breakpoint: BreakpointSelector;
	};
	icons: {
		position: IconPosition;
	};
	animations: {
		transitionDuration: number; // in seconds
		hoverAnimation: string;
	};
}

/**
 * Tab item component props
 */
export interface TabItemProps {
	tab: TabItemData;
	index: number;
	isActive: boolean;
	onSelect: () => void;
	widgetNumber: string;
	iconPosition: IconPosition;
}

/**
 * Tab content component props
 */
export interface TabContentProps {
	tab: TabItemData;
	index: number;
	isActive: boolean;
	widgetNumber: string;
	children?: React.ReactNode;
}
