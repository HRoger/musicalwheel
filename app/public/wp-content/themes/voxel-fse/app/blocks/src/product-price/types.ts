/**
 * Product Price Block - TypeScript Interfaces
 *
 * Following Plan C+ architecture - headless-ready types
 *
 * @package VoxelFSE
 */

/**
 * Responsive value structure for controls that support
 * desktop/tablet/mobile breakpoints
 */
export interface ResponsiveValue<T> {
	desktop?: T;
	tablet?: T;
	mobile?: T;
}

/**
 * Typography configuration matching Elementor's Group_Control_Typography
 */
export interface TypographyConfig {
	[key: string]: unknown;
	fontFamily?: string;
	fontSize?: string;
	fontSize_tablet?: string;
	fontSize_mobile?: string;
	fontWeight?: string;
	lineHeight?: string;
	letterSpacing?: string;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Block attributes stored in WordPress post_content
 * Matches Elementor controls from Voxel's Product_Price widget
 */
export interface ProductPriceAttributes {
	[key: string]: unknown;
	// Block ID for unique identification
	blockId: string;

	// Typography control (Elementor: price_typo)
	typography?: TypographyConfig;

	// Color controls (responsive)
	// Elementor: ts_price_col - Color for .vx-price
	priceColor?: string;
	priceColor_tablet?: string;
	priceColor_mobile?: string;

	// Elementor: ts_strike_col_text - Strikethrough text color for .vx-price s
	strikethroughTextColor?: string;
	strikethroughTextColor_tablet?: string;
	strikethroughTextColor_mobile?: string;

	// Elementor: ts_strike_col - Strikethrough line color (text-decoration-color)
	strikethroughLineColor?: string;
	strikethroughLineColor_tablet?: string;
	strikethroughLineColor_mobile?: string;

	// Elementor: ts_strike_width - Strikethrough line width (slider)
	strikethroughWidth?: number;
	strikethroughWidth_tablet?: number;
	strikethroughWidth_mobile?: number;
	strikethroughWidthUnit?: string;

	// Elementor: ts_price_nostock - Out of stock color for .vx-price.no-stock
	outOfStockColor?: string;
	outOfStockColor_tablet?: string;
	outOfStockColor_mobile?: string;

	// Advanced/Visibility controls
	hideDesktop?: boolean;
	hideTablet?: boolean;
	hideMobile?: boolean;
	customClasses?: string;
	contentTabOpenPanel?: string;
}

/**
 * Product price data returned from REST API
 * Contains server-calculated pricing information
 */
export interface ProductPriceData {
	// Availability status
	isAvailable: boolean;
	errorMessage: string | null;

	// Price values (in cents/smallest currency unit)
	regularPrice: number;
	discountPrice: number;
	hasDiscount: boolean;

	// Currency info
	currency: string;
	currencySymbol: string;
	currencyPosition: 'before' | 'after';

	// Formatted prices (ready for display)
	formattedRegularPrice: string;
	formattedDiscountPrice: string;

	// Suffix (e.g., "/ night", "/ month")
	suffix: string;
}

/**
 * VxConfig stored in save.tsx output
 * Contains all data needed for frontend hydration
 */
export interface ProductPriceVxConfig {
	// Style settings
	priceColor?: string;
	strikethroughTextColor?: string;
	strikethroughLineColor?: string;
	strikethroughWidth?: number;
	strikethroughWidthUnit?: string;
	outOfStockColor?: string;

	// Typography
	typography?: TypographyConfig;

	// Post context for API fetch
	postId?: number;
	postType?: string;
}

/**
 * Props for the shared ProductPriceComponent
 */
export interface ProductPriceComponentProps {
	// Block attributes for styling
	attributes: ProductPriceAttributes;

	// Price data (from API or mock)
	priceData: ProductPriceData | null;

	// Loading state
	isLoading: boolean;

	// Error state
	error: string | null;

	// Rendering context
	context: 'editor' | 'frontend';
}

/**
 * REST API response structure
 */
export interface ProductPriceApiResponse {
	success: boolean;
	data?: ProductPriceData;
	error?: string;
}

/**
 * Edit component props from WordPress
 */
export interface ProductPriceEditProps {
	attributes: ProductPriceAttributes;
	setAttributes: (attrs: Partial<ProductPriceAttributes>) => void;
	context: {
		postId?: number;
		postType?: string;
	};
	clientId: string;
}

/**
 * Save component props from WordPress
 */
export interface ProductPriceSaveProps {
	attributes: ProductPriceAttributes;
}

/**
 * Frontend wrapper props
 */
export interface ProductPriceFrontendProps {
	attributes: ProductPriceAttributes;
	postId: number;
}

