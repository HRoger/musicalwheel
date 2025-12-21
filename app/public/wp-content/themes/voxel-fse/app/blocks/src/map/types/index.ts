/**
 * Map (VX) Block - TypeScript Type Definitions
 *
 * Follows Plan C+ architecture - no PHP rendering
 */

import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks';

import type { IconValue } from '@shared/types';

/**
 * Box shadow value structure
 */
export interface BoxShadowValue {
	enable?: boolean;
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outline' | 'inset';
}

/**
 * Typography value structure
 */
export interface TypographyValue {
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
 * Box (padding/margin) value structure
 */
export interface BoxValue {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

/**
 * Map source modes
 */
export type MapSource = 'search-form' | 'current-post';

/**
 * Drag search modes
 */
export type DragSearchMode = 'automatic' | 'manual';

/**
 * Drag search default state
 */
export type DragSearchDefault = 'checked' | 'unchecked';

/**
 * Map block attributes interface
 */
export interface MapAttributes {
	// Block identification
	blockId: string;

	// Content - Map Settings
	source: MapSource;
	searchFormId: string;
	dragSearch: boolean;
	dragSearchMode: DragSearchMode;
	dragSearchDefault: DragSearchDefault;

	// Content - Height
	height: number;
	height_tablet?: number;
	height_mobile?: number;
	heightUnit: string;
	enableCalcHeight: boolean;
	enableCalcHeight_tablet?: boolean;
	enableCalcHeight_mobile?: boolean;
	calcHeight: string;
	calcHeight_tablet?: string;
	calcHeight_mobile?: string;
	borderRadius: number;
	borderRadius_tablet?: number;
	borderRadius_mobile?: number;

	// Content - Default Map Location
	defaultLat: number;
	defaultLng: number;
	defaultZoom: number;
	minZoom: number;
	maxZoom: number;

	// Style - Clusters
	clusterSize?: number;
	clusterSize_tablet?: number;
	clusterSize_mobile?: number;
	clusterBgColor?: string;
	clusterBgColor_tablet?: string;
	clusterBgColor_mobile?: string;
	clusterShadow: BoxShadowValue;
	clusterRadius?: number;
	clusterRadius_tablet?: number;
	clusterRadius_mobile?: number;
	clusterTypography: TypographyValue;
	clusterTextColor?: string;
	clusterTextColor_tablet?: string;
	clusterTextColor_mobile?: string;

	// Style - Icon Marker
	iconMarkerSize?: number;
	iconMarkerSize_tablet?: number;
	iconMarkerSize_mobile?: number;
	iconMarkerIconSize?: number;
	iconMarkerIconSize_tablet?: number;
	iconMarkerIconSize_mobile?: number;
	iconMarkerRadius?: number;
	iconMarkerRadius_tablet?: number;
	iconMarkerRadius_mobile?: number;
	iconMarkerShadow: BoxShadowValue;
	iconMarkerStaticBg?: string;
	iconMarkerStaticBg_tablet?: string;
	iconMarkerStaticBg_mobile?: string;
	iconMarkerStaticBgActive?: string;
	iconMarkerStaticBgActive_tablet?: string;
	iconMarkerStaticBgActive_mobile?: string;
	iconMarkerStaticIconColor?: string;
	iconMarkerStaticIconColor_tablet?: string;
	iconMarkerStaticIconColor_mobile?: string;
	iconMarkerStaticIconColorActive?: string;
	iconMarkerStaticIconColorActive_tablet?: string;
	iconMarkerStaticIconColorActive_mobile?: string;

	// Style - Text Marker
	textMarkerBgColor?: string;
	textMarkerBgColor_tablet?: string;
	textMarkerBgColor_mobile?: string;
	textMarkerBgColorActive?: string;
	textMarkerBgColorActive_tablet?: string;
	textMarkerBgColorActive_mobile?: string;
	textMarkerTextColor?: string;
	textMarkerTextColor_tablet?: string;
	textMarkerTextColor_mobile?: string;
	textMarkerTextColorActive?: string;
	textMarkerTextColorActive_tablet?: string;
	textMarkerTextColorActive_mobile?: string;
	textMarkerRadius?: number;
	textMarkerRadius_tablet?: number;
	textMarkerRadius_mobile?: number;
	textMarkerTypography: TypographyValue;
	textMarkerPadding: BoxValue;
	textMarkerPadding_tablet?: BoxValue;
	textMarkerPadding_mobile?: BoxValue;
	textMarkerShadow: BoxShadowValue;

	// Style - Image Marker
	imageMarkerSize?: number;
	imageMarkerSize_tablet?: number;
	imageMarkerSize_mobile?: number;
	imageMarkerRadius?: number;
	imageMarkerRadius_tablet?: number;
	imageMarkerRadius_mobile?: number;
	imageMarkerShadow: BoxShadowValue;

	// Style - Map Popup
	popupCardWidth: number;
	popupCardWidth_tablet?: number;
	popupCardWidth_mobile?: number;
	popupLoaderColor1?: string;
	popupLoaderColor2?: string;

	// Style - Search Button
	searchBtnTypography: TypographyValue;
	searchBtnTextColor?: string;
	searchBtnTextColor_tablet?: string;
	searchBtnTextColor_mobile?: string;
	searchBtnBgColor?: string;
	searchBtnBgColor_tablet?: string;
	searchBtnBgColor_mobile?: string;
	searchBtnIconColor?: string;
	searchBtnIconColor_tablet?: string;
	searchBtnIconColor_mobile?: string;
	searchBtnIconColorActive?: string;
	searchBtnIconColorActive_tablet?: string;
	searchBtnIconColorActive_mobile?: string;
	searchBtnRadius?: number;
	searchBtnRadius_tablet?: number;
	searchBtnRadius_mobile?: number;
	checkmarkIcon: IconValue;

	// Style - Next/Prev Buttons
	navBtnIconColor?: string;
	navBtnIconSize?: number;
	navBtnIconSize_tablet?: number;
	navBtnIconSize_mobile?: number;
	navBtnBgColor?: string;
	navBtnBorderType: string;
	navBtnBorderWidth?: number;
	navBtnBorderWidth_tablet?: number;
	navBtnBorderWidth_mobile?: number;
	navBtnBorderColor?: string;
	navBtnRadius: number;
	navBtnRadius_tablet?: number;
	navBtnRadius_mobile?: number;
	navBtnShadow: BoxShadowValue;
	navBtnSize?: number;
	navBtnSize_tablet?: number;
	navBtnSize_mobile?: number;
	navBtnIconColorHover?: string;
	navBtnBgColorHover?: string;
	navBtnBorderColorHover?: string;
}

/**
 * Edit component props
 */
export type MapEditProps = BlockEditProps<MapAttributes>;

/**
 * Save component props
 */
export type MapSaveProps = BlockSaveProps<MapAttributes>;

/**
 * Shared component props
 */
export interface MapComponentProps {
	attributes: MapAttributes;
	context: 'editor' | 'frontend';
	setAttributes?: (attrs: Partial<MapAttributes>) => void;
}

/**
 * vxconfig structure for save.tsx and frontend.tsx
 */
export interface MapVxConfig {
	source: MapSource;
	searchFormId: string;
	dragSearch: boolean;
	dragSearchMode: DragSearchMode;
	dragSearchDefault: DragSearchDefault;
	center: {
		lat: number;
		lng: number;
	};
	zoom: number;
	minZoom: number;
	maxZoom: number;
	styles: MapStyleConfig;
}

/**
 * Style configuration for vxconfig
 */
export interface MapStyleConfig {
	height: ResponsiveValue<number>;
	heightUnit: string;
	calcHeight: ResponsiveValue<string>;
	enableCalcHeight: ResponsiveValue<boolean>;
	borderRadius: ResponsiveValue<number>;
	cluster: ClusterStyleConfig;
	iconMarker: IconMarkerStyleConfig;
	textMarker: TextMarkerStyleConfig;
	imageMarker: ImageMarkerStyleConfig;
	popup: PopupStyleConfig;
	searchBtn: SearchBtnStyleConfig;
	navBtn: NavBtnStyleConfig;
}

/**
 * Responsive value helper
 */
export interface ResponsiveValue<T> {
	desktop?: T;
	tablet?: T;
	mobile?: T;
}

/**
 * Cluster style configuration
 */
export interface ClusterStyleConfig {
	size: ResponsiveValue<number>;
	bgColor: ResponsiveValue<string>;
	shadow: BoxShadowValue;
	radius: ResponsiveValue<number>;
	typography: TypographyValue;
	textColor: ResponsiveValue<string>;
}

/**
 * Icon marker style configuration
 */
export interface IconMarkerStyleConfig {
	size: ResponsiveValue<number>;
	iconSize: ResponsiveValue<number>;
	radius: ResponsiveValue<number>;
	shadow: BoxShadowValue;
	staticBg: ResponsiveValue<string>;
	staticBgActive: ResponsiveValue<string>;
	staticIconColor: ResponsiveValue<string>;
	staticIconColorActive: ResponsiveValue<string>;
}

/**
 * Text marker style configuration
 */
export interface TextMarkerStyleConfig {
	bgColor: ResponsiveValue<string>;
	bgColorActive: ResponsiveValue<string>;
	textColor: ResponsiveValue<string>;
	textColorActive: ResponsiveValue<string>;
	radius: ResponsiveValue<number>;
	typography: TypographyValue;
	padding: ResponsiveValue<BoxValue>;
	shadow: BoxShadowValue;
}

/**
 * Image marker style configuration
 */
export interface ImageMarkerStyleConfig {
	size: ResponsiveValue<number>;
	radius: ResponsiveValue<number>;
	shadow: BoxShadowValue;
}

/**
 * Popup style configuration
 */
export interface PopupStyleConfig {
	cardWidth: ResponsiveValue<number>;
	loaderColor1?: string;
	loaderColor2?: string;
}

/**
 * Search button style configuration
 */
export interface SearchBtnStyleConfig {
	typography: TypographyValue;
	textColor: ResponsiveValue<string>;
	bgColor: ResponsiveValue<string>;
	iconColor: ResponsiveValue<string>;
	iconColorActive: ResponsiveValue<string>;
	radius: ResponsiveValue<number>;
	checkmarkIcon: IconValue;
}

/**
 * Navigation button style configuration
 */
export interface NavBtnStyleConfig {
	iconColor?: string;
	iconColorHover?: string;
	iconSize: ResponsiveValue<number>;
	bgColor?: string;
	bgColorHover?: string;
	borderType: string;
	borderWidth?: number;
	borderColor?: string;
	borderColorHover?: string;
	radius: ResponsiveValue<number>;
	shadow: BoxShadowValue;
	size: ResponsiveValue<number>;
}

/**
 * Map data-config structure (matches Voxel's format)
 */
export interface MapDataConfig {
	center: {
		lat: number;
		lng: number;
	};
	zoom: number;
	minZoom: number;
	maxZoom: number;
	markers?: MarkerConfig[];
}

/**
 * Marker configuration
 */
export interface MarkerConfig {
	lat: number;
	lng: number;
	template: string;
	uriencoded?: boolean;
}

/**
 * Post location response from REST API
 */
export interface PostLocationResponse {
	latitude: number;
	longitude: number;
	marker: string;
}

/**
 * Search submit event detail
 */
export interface SearchSubmitEventDetail {
	targetId: string;
	postType: string;
	filters: Record<string, unknown>;
}
