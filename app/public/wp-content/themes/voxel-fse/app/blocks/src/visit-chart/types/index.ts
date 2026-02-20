/**
 * Visit Chart Block - TypeScript Interfaces
 *
 * Strict mode compliant - NO `any` types.
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';

/**
 * Source type for stats data
 */
export type StatsSource = 'post' | 'user' | 'site';

/**
 * Timeframe options for chart display
 */
export type ChartTimeframe = '24h' | '7d' | '30d' | '12m';

/**
 * View type for displaying data
 */
export type ViewType = 'views' | 'unique_views';

/**
 * Dimensions configuration
 */
export interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	isLinked?: boolean;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textTransform?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
}

/**
 * Background configuration
 */
export interface BackgroundConfig {
	backgroundType?: 'classic' | 'gradient';
	backgroundColor?: string;
	backgroundImage?: {
		url?: string;
		id?: number;
	};
	backgroundPosition?: string;
	backgroundAttachment?: string;
	backgroundRepeat?: string;
	backgroundSize?: string;
	gradientType?: 'linear' | 'radial';
	gradientAngle?: number;
	gradientPosition?: string;
	gradientColor?: string;
	gradientColorB?: string;
	gradientColorBLocation?: number;
	gradientColorLocation?: number;
}

/**
 * Box Shadow configuration
 */
export interface BoxShadowConfig {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outset' | 'inset';
}

/**
 * Block attributes stored in database
 */
export interface VisitChartAttributes {
	// Content tab attributes
	blockId: string;
	source: StatsSource;
	activeChart: ChartTimeframe;
	viewType: ViewType;
	chartIcon: IconValue;
	chevronRight: IconValue;
	chevronLeft: IconValue;
	contentTabOpenPanel: string;

	// Style tab attributes
	styleTabOpenPanel: string;

	// Chart section
	chartHeight?: number;
	chartHeight_tablet?: number;
	chartHeight_mobile?: number;
	axisTypography?: TypographyConfig;
	axisTextColor?: string;
	verticalAxisWidth?: number;
	verticalAxisWidth_tablet?: number;
	verticalAxisWidth_mobile?: number;
	chartLineBorderType?: string;
	barGap?: number;
	barGap_tablet?: number;
	barGap_mobile?: number;
	barWidth?: number;
	barWidth_tablet?: number;
	barWidth_mobile?: number;
	barRadius?: number;
	barRadius_tablet?: number;
	barRadius_mobile?: number;
	barBackground?: BackgroundConfig;
	barBackgroundHover?: string;
	barBoxShadow?: BoxShadowConfig;
	barPopupBackground?: string;
	barPopupBorderType?: string;
	barPopupBorderWidth?: DimensionsConfig;
	barPopupBorderColor?: string;
	barPopupRadius?: number;
	barPopupRadius_tablet?: number;
	barPopupRadius_mobile?: number;
	barPopupBoxShadow?: BoxShadowConfig;
	barPopupValueTypography?: TypographyConfig;
	barPopupValueColor?: string;
	barPopupLabelTypography?: TypographyConfig;
	barPopupLabelColor?: string;

	// Tabs section
	tabsState?: string;
	tabsJustify?: string;
	tabsPadding?: DimensionsConfig;
	tabsMargin?: DimensionsConfig;
	tabsTypography?: TypographyConfig;
	tabsActiveTypography?: TypographyConfig;
	tabsTextColor?: string;
	tabsActiveTextColor?: string;
	tabsBackground?: string;
	tabsActiveBackground?: string;
	tabsBorderType?: string;
	tabsActiveBorderColor?: string;
	tabsBorderRadius?: number;
	tabsBorderRadius_tablet?: number;
	tabsBorderRadius_mobile?: number;
	tabsTextColorHover?: string;
	tabsActiveTextColorHover?: string;
	tabsBorderColorHover?: string;
	tabsActiveBorderColorHover?: string;
	tabsBackgroundHover?: string;
	tabsActiveBackgroundHover?: string;

	// Week buttons section
	weekButtonsState?: string;
	weekRangeTypography?: TypographyConfig;
	weekRangeTextColor?: string;
	weekButtonIconColor?: string;
	weekButtonIconSize?: number;
	weekButtonIconSize_tablet?: number;
	weekButtonIconSize_mobile?: number;
	weekButtonBackground?: string;
	weekButtonBorderType?: string;
	weekButtonBorderWidth?: DimensionsConfig;
	weekButtonBorderColor?: string;
	weekButtonBorderRadius?: number;
	weekButtonBorderRadius_tablet?: number;
	weekButtonBorderRadius_mobile?: number;
	weekButtonSize?: number;
	weekButtonSize_tablet?: number;
	weekButtonSize_mobile?: number;
	weekButtonIconColorHover?: string;
	weekButtonBackgroundHover?: string;
	weekButtonBorderColorHover?: string;

	// No activity section
	noActivityContentGap?: number;
	noActivityContentGap_tablet?: number;
	noActivityContentGap_mobile?: number;
	noActivityIconSize?: number;
	noActivityIconSize_tablet?: number;
	noActivityIconSize_mobile?: number;
	noActivityIconColor?: string;
	noActivityTypography?: TypographyConfig;
	noActivityTextColor?: string;
}

/**
 * vxconfig structure saved to database (matching Voxel pattern)
 */
export interface VisitChartVxConfig {
	source: StatsSource;
	activeChart: ChartTimeframe;
	viewType: ViewType;
	nonce: string;
	postId?: number;
	charts: Record<ChartTimeframe, ChartState>;
}

/**
 * State for a single chart timeframe
 */
export interface ChartState {
	loaded: boolean;
	error?: boolean;
	steps?: string[];
	items?: ChartItem[];
	meta?: ChartMeta;
}

/**
 * Single bar item in the chart
 */
export interface ChartItem {
	label: string;
	percent: number;
	count: string;
	unique_count: string;
}

/**
 * Chart metadata
 */
export interface ChartMeta {
	label: string;
	has_activity: boolean;
}

/**
 * REST API response for chart data
 */
export interface ChartDataResponse {
	success: boolean;
	data?: {
		steps: string[];
		items: ChartItem[];
		meta: ChartMeta;
		views: Record<string, { views: number; unique_views: number }>;
	};
	message?: string;
	code?: number;
}

/**
 * Props for the shared VisitChartComponent
 */
export interface VisitChartComponentProps {
	attributes: VisitChartAttributes;
	context: 'editor' | 'frontend';
	vxconfig?: VisitChartVxConfig;
}

/**
 * Props for the Edit component
 */
export interface EditProps {
	attributes: VisitChartAttributes;
	setAttributes: (attrs: Partial<VisitChartAttributes>) => void;
	clientId: string;
}

/**
 * Props for the Save component
 */
export interface SaveProps {
	attributes: VisitChartAttributes;
}
