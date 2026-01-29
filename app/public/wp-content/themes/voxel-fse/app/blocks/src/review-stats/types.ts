/**
 * Review Stats Block - TypeScript Interfaces
 *
 * Type definitions for the Review Stats block.
 * Following Plan C+ architecture patterns.
 *
 * @package VoxelFSE
 */



/**
 * Block attributes interface
 */
export interface ReviewStatsAttributes {
	/** Unique block identifier */
	blockId: string;
	/** Stats display mode: overall scores or by category */
	statMode: 'overall' | 'by_category';
	/** Number of grid columns (responsive) */
	columns: number;
	columns_tablet?: number;
	columns_mobile?: number;
	/** Gap between items (responsive) */
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	/** Icon size for category mode (responsive) */
	iconSize: number;
	iconSize_tablet?: number;
	iconSize_mobile?: number;
	/** Icon right spacing */
	iconSpacing?: number;
	/** Label typography settings */
	labelTypography: TypographyValue;
	/** Label color */
	labelColor: string;
	/** Score typography settings */
	scoreTypography: TypographyValue;
	/** Score color */
	scoreColor: string;
	/** Chart background color */
	chartBgColor: string;
	/** Chart bar height (responsive) */
	chartHeight: number;
	chartHeight_tablet?: number;
	chartHeight_mobile?: number;
	/** Chart border radius (responsive) */
	chartRadius: number;
	chartRadius_tablet?: number;
	chartRadius_mobile?: number;
	/** Hide on desktop */
	hideDesktop: boolean;
	/** Hide on tablet */
	hideTablet: boolean;
	/** Hide on mobile */
	hideMobile: boolean;
	/** Custom CSS classes */
	customClasses: string;
	/** Active inspector tab */
	activeTab?: string;

	// VoxelTab attributes (visibility, loop, sticky, container)
	visibilityBehavior?: string;
	visibilityRules?: any[];
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;
	stickyEnabled?: boolean;
	stickyDesktop?: string;
	stickyTablet?: string;
	stickyMobile?: string;
	stickyTop?: number;
	stickyTop_tablet?: number;
	stickyTop_mobile?: number;
	stickyTopUnit?: string;
	enableInlineFlex?: boolean;
	enableCalcMinHeight?: boolean;
	calcMinHeight?: string;
	enableCalcMaxHeight?: boolean;
	calcMaxHeight?: string;
	scrollbarColor?: string;
	enableBackdropBlur?: boolean;
	backdropBlurStrength?: number;

	// AdvancedTab attributes (catch-all for shared utility)
	[key: string]: any;
}

/**
  * Typography Value Interface (copied from TypographyPopup)
  */
export interface TypographyValue {
	fontFamily?: string;
	fontSize?: number;
	fontSize_tablet?: number;
	fontSize_mobile?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textTransform?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeight_tablet?: number;
	lineHeight_mobile?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacing_tablet?: number;
	letterSpacing_mobile?: number;
	letterSpacingUnit?: string;
	wordSpacing?: number;
	wordSpacing_tablet?: number;
	wordSpacing_mobile?: number;
	wordSpacingUnit?: string;
}

/**
 * vxconfig structure for frontend hydration
 */
export interface ReviewStatsVxConfig {
	statMode: string;
	columns: number;
	columns_tablet?: number;
	columns_mobile?: number;
	itemGap: number;
	itemGap_tablet?: number;
	itemGap_mobile?: number;
	iconSize: number;
	iconSize_tablet?: number;
	iconSize_mobile?: number;
	iconSpacing?: number;
	labelTypography: TypographyValue;
	labelColor: string;
	scoreTypography: TypographyValue;
	scoreColor: string;
	chartBgColor: string;
	chartHeight: number;
	chartHeight_tablet?: number;
	chartHeight_mobile?: number;
	chartRadius: number;
	chartRadius_tablet?: number;
	chartRadius_mobile?: number;
}

/**
 * Rating level data structure
 */
export interface RatingLevel {
	key: string;
	label: string;
	score: number;
	color?: string;
}

/**
 * Category stats structure for by_category mode
 */
export interface CategoryStat {
	key: string;
	label: string;
	icon?: string;
	score: number;
	color?: string;
}

/**
 * Review stats data from REST API
 */
export interface ReviewStatsData {
	/** Overall stats by rating level (excellent, very_good, etc.) */
	overall: {
		excellent: number;
		very_good: number;
		good: number;
		fair: number;
		poor: number;
	};
	/** Rating levels with labels and colors */
	ratingLevels: RatingLevel[];
	/** Stats by category (for by_category mode) */
	byCategory: CategoryStat[];
	/** Total number of reviews */
	totalReviews: number;
}

/**
 * Edit component props with context
 */
export interface ReviewStatsEditProps {
	attributes: ReviewStatsAttributes;
	setAttributes: (attrs: Partial<ReviewStatsAttributes>) => void;
	clientId: string;
	context: {
		postId?: number;
		postType?: string;
	};
}

/**
 * Shared component props
 */
export interface ReviewStatsComponentProps {
	attributes: ReviewStatsAttributes;
	statsData: ReviewStatsData | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
	postId?: number | null;
}
