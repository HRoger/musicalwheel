/**
 * Post Feed Block - Style Generation
 *
 * Generates CSS from Style Tab inspector controls.
 * Targets Voxel CSS classes within a scoped block selector.
 *
 * Evidence: themes/voxel/app/widgets/post-feed.php
 *
 * @package VoxelFSE
 */

import type { PostFeedAttributes } from './types';

// Type definitions for style configs
interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
	wordSpacing?: number;
	wordSpacingUnit?: string;
	textTransform?: string;
}

// Dimensions config type
interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

/**
 * Generate typography CSS properties from config
 */
function generateTypographyCSS(typography: TypographyConfig | undefined): string {
	if (!typography) return '';
	const rules: string[] = [];

	if (typography.fontFamily) {
		rules.push(`font-family: ${typography.fontFamily};`);
	}
	if (typography.fontSize !== undefined) {
		const unit = typography.fontSizeUnit || 'px';
		rules.push(`font-size: ${typography.fontSize}${unit};`);
	}
	if (typography.fontWeight) {
		rules.push(`font-weight: ${typography.fontWeight};`);
	}
	if (typography.fontStyle && typography.fontStyle !== 'default') {
		rules.push(`font-style: ${typography.fontStyle};`);
	}
	if (typography.textDecoration && typography.textDecoration !== 'none') {
		rules.push(`text-decoration: ${typography.textDecoration};`);
	}
	if (typography.lineHeight !== undefined) {
		const unit = typography.lineHeightUnit || '';
		rules.push(`line-height: ${typography.lineHeight}${unit};`);
	}
	if (typography.letterSpacing !== undefined) {
		const unit = typography.letterSpacingUnit || 'px';
		rules.push(`letter-spacing: ${typography.letterSpacing}${unit};`);
	}
	if (typography.wordSpacing !== undefined) {
		const unit = typography.wordSpacingUnit || 'px';
		rules.push(`word-spacing: ${typography.wordSpacing}${unit};`);
	}
	if (typography.textTransform && typography.textTransform !== 'none') {
		rules.push(`text-transform: ${typography.textTransform};`);
	}

	return rules.join(' ');
}

/**
 * Check if typography config has any values set
 */
function hasTypography(typography: TypographyConfig | undefined): boolean {
	if (!typography) return false;
	return !!(
		typography.fontFamily ||
		typography.fontSize !== undefined ||
		typography.fontWeight ||
		(typography.fontStyle && typography.fontStyle !== 'default') ||
		(typography.textDecoration && typography.textDecoration !== 'none') ||
		typography.lineHeight !== undefined ||
		typography.letterSpacing !== undefined ||
		typography.wordSpacing !== undefined ||
		(typography.textTransform && typography.textTransform !== 'none')
	);
}

/**
 * Generate CSS for dimensions (padding/margin/border-width)
 */
function generateDimensionsCSS(
	config: DimensionsConfig | undefined,
	property: string
): string {
	if (!config) return '';

	const top = config.top !== undefined && config.top !== '' ? config.top : undefined;
	const right = config.right !== undefined && config.right !== '' ? config.right : undefined;
	const bottom = config.bottom !== undefined && config.bottom !== '' ? config.bottom : undefined;
	const left = config.left !== undefined && config.left !== '' ? config.left : undefined;

	if (top === undefined && right === undefined && bottom === undefined && left === undefined) {
		return '';
	}

	const rules: string[] = [];
	if (top !== undefined) rules.push(`${property}-top: ${top};`);
	if (right !== undefined) rules.push(`${property}-right: ${right};`);
	if (bottom !== undefined) rules.push(`${property}-bottom: ${bottom};`);
	if (left !== undefined) rules.push(`${property}-left: ${left};`);

	return rules.join(' ');
}

/**
 * Generate CSS for Post Feed block Style Tab controls
 *
 * @param attributes - Block attributes
 * @param blockId - Block ID for scoped selector
 * @returns CSS string
 */
export function generatePostFeedStyles(
	attributes: PostFeedAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `[data-block-id="${blockId}"]`;

	// ============================================
	// CONTAINER POSITIONING
	// Evidence: themes/voxel/assets/dist/post-feed.css - .post-feed-nav uses position:absolute
	// The carousel nav is position:absolute and expects its container to be position:relative
	// In Voxel, this is provided by .elementor-element ancestor
	// In FSE, we add it to the block container itself
	// FIX: Add layout constraints to prevent carousel from expanding parent
	// Evidence: Browser inspection showed container expanding to content width (1134px) instead of parent (400px)
	// causing scrollWidth == clientWidth and breaking carousel functionality
	cssRules.push(`${selector} { position: relative; max-width: 100%; min-width: 0; }`);
	cssRules.push(`${selector} .post-feed-grid { max-width: 100%; }`);

	// ============================================
	// COUNTER STYLES
	// Evidence: post-feed.php:488-535
	// ============================================

	// Counter typography - Evidence: post-feed.php:494-499
	if (hasTypography(attributes.counterTypography as TypographyConfig)) {
		const typo = generateTypographyCSS(attributes.counterTypography as TypographyConfig);
		if (typo) {
			cssRules.push(`${selector} .result-count { ${typo} }`);
		}
	}

	// Counter text color - Evidence: post-feed.php:501-508
	if (attributes.counterTextColor) {
		cssRules.push(`${selector} .result-count { color: ${attributes.counterTextColor}; }`);
	}

	// Counter bottom spacing - Evidence: post-feed.php:510-535
	if (attributes.counterBottomSpacing !== undefined) {
		cssRules.push(`${selector} .post-feed-header { margin-bottom: ${attributes.counterBottomSpacing}px; }`);
	}
	if (attributes.counterBottomSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-header { margin-bottom: ${attributes.counterBottomSpacing_tablet}px; }`);
	}
	if (attributes.counterBottomSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-header { margin-bottom: ${attributes.counterBottomSpacing_mobile}px; }`);
	}

	// ============================================
	// ORDER BY STYLES
	// Evidence: post-feed.php:540-579
	// ============================================

	// Order by typography - Evidence: post-feed.php:547-553
	if (hasTypography(attributes.orderByTypography as TypographyConfig)) {
		const typo = generateTypographyCSS(attributes.orderByTypography as TypographyConfig);
		if (typo) {
			cssRules.push(`${selector} .vxf-sort { ${typo} }`);
		}
	}

	// Order by text color (Normal) - Evidence: post-feed.php:557-566
	// CRITICAL: Voxel uses --ts-shade-3 CSS custom property
	if (attributes.orderByTextColor) {
		cssRules.push(`${selector} .vxf-sort { --ts-shade-3: ${attributes.orderByTextColor}; }`);
	}

	// Order by text color (Hover) - Evidence: post-feed.php:569-578
	// CRITICAL: Voxel uses --ts-shade-2 CSS custom property
	if (attributes.orderByTextColorHover) {
		cssRules.push(`${selector} .vxf-sort { --ts-shade-2: ${attributes.orderByTextColorHover}; }`);
	}

	// ============================================
	// NO RESULTS STYLES
	// Evidence: post-feed.php:682-780
	// ============================================

	// No results content gap - Evidence: post-feed.php:697-722
	if (attributes.noResultsContentGap !== undefined) {
		cssRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap}px; }`);
	}
	if (attributes.noResultsContentGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap_tablet}px; }`);
	}
	if (attributes.noResultsContentGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap_mobile}px; }`);
	}

	// No results icon size - Evidence: post-feed.php:724-749
	if (attributes.noResultsIconSize !== undefined) {
		cssRules.push(`${selector} .ts-no-posts > svg, ${selector} .ts-no-posts > i { --ts-icon-size: ${attributes.noResultsIconSize}px; width: ${attributes.noResultsIconSize}px; height: ${attributes.noResultsIconSize}px; font-size: ${attributes.noResultsIconSize}px; }`);
	}
	if (attributes.noResultsIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-no-posts > svg, ${selector} .ts-no-posts > i { --ts-icon-size: ${attributes.noResultsIconSize_tablet}px; width: ${attributes.noResultsIconSize_tablet}px; height: ${attributes.noResultsIconSize_tablet}px; font-size: ${attributes.noResultsIconSize_tablet}px; }`);
	}
	if (attributes.noResultsIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-no-posts > svg, ${selector} .ts-no-posts > i { --ts-icon-size: ${attributes.noResultsIconSize_mobile}px; width: ${attributes.noResultsIconSize_mobile}px; height: ${attributes.noResultsIconSize_mobile}px; font-size: ${attributes.noResultsIconSize_mobile}px; }`);
	}

	// No results icon color - Evidence: post-feed.php:751-758
	if (attributes.noResultsIconColor) {
		cssRules.push(`${selector} .ts-no-posts > svg, ${selector} .ts-no-posts > i { --ts-icon-color: ${attributes.noResultsIconColor}; color: ${attributes.noResultsIconColor}; fill: ${attributes.noResultsIconColor}; }`);
	}

	// No results typography - Evidence: post-feed.php:760-765
	if (hasTypography(attributes.noResultsTypography as TypographyConfig)) {
		const typo = generateTypographyCSS(attributes.noResultsTypography as TypographyConfig);
		if (typo) {
			cssRules.push(`${selector} .ts-no-posts p { ${typo} }`);
		}
	}

	// No results text color - Evidence: post-feed.php:767-774
	if (attributes.noResultsTextColor) {
		cssRules.push(`${selector} .ts-no-posts p { color: ${attributes.noResultsTextColor}; }`);
	}

	// No results link color - Evidence: post-feed.php:776-780
	if (attributes.noResultsLinkColor) {
		cssRules.push(`${selector} .ts-no-posts a { color: ${attributes.noResultsLinkColor}; }`);
	}

	// ============================================
	// PAGINATION STYLES (Load more / Next / Prev)
	// Evidence: post-feed.php:782-1080
	// ============================================

	// Pagination top margin - Evidence: post-feed.php:803-828
	if (attributes.paginationTopMargin !== undefined) {
		cssRules.push(`${selector} .feed-pagination { margin-top: ${attributes.paginationTopMargin}px; }`);
	}
	if (attributes.paginationTopMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .feed-pagination { margin-top: ${attributes.paginationTopMargin_tablet}px; }`);
	}
	if (attributes.paginationTopMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .feed-pagination { margin-top: ${attributes.paginationTopMargin_mobile}px; }`);
	}

	// Pagination typography - Evidence: post-feed.php:830-835
	if (hasTypography(attributes.paginationTypography as TypographyConfig)) {
		const typo = generateTypographyCSS(attributes.paginationTypography as TypographyConfig);
		if (typo) {
			cssRules.push(`${selector} .feed-pagination .ts-btn { ${typo} }`);
		}
	}

	// Pagination padding - Evidence: post-feed.php:885-900 (inferred)
	if (attributes.paginationPadding) {
		const padding = generateDimensionsCSS(attributes.paginationPadding as DimensionsConfig, 'padding');
		if (padding) {
			cssRules.push(`${selector} .feed-pagination .ts-btn { ${padding} }`);
		}
	}

	// Pagination height - Evidence: post-feed.php:902-907
	if (attributes.paginationHeight !== undefined) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { height: ${attributes.paginationHeight}px; }`);
	}
	if (attributes.paginationHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .feed-pagination .ts-btn { height: ${attributes.paginationHeight_tablet}px; }`);
	}
	if (attributes.paginationHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .feed-pagination .ts-btn { height: ${attributes.paginationHeight_mobile}px; }`);
	}

	// Pagination width - Evidence: post-feed.php:909-917
	if (attributes.paginationWidth !== undefined && attributes.paginationWidth > 0) {
		const unit = attributes.paginationWidthUnit || '%';
		cssRules.push(`${selector} .feed-pagination .ts-btn { width: ${attributes.paginationWidth}${unit}; }`);
	} else if (attributes.paginationWidth === undefined) {
		// Default width might be 100% or auto depending on context, block.json says default 100%
	}

	// Pagination icon text spacing - Evidence: post-feed.php:1038-1045
	if (attributes.paginationIconTextSpacing !== undefined) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { gap: ${attributes.paginationIconTextSpacing}px; }`);
	}

	// Pagination border type - Evidence: post-feed.php:919-923
	if (attributes.paginationBorderType) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { border-style: ${attributes.paginationBorderType}; }`);
		if (attributes.paginationBorderType !== 'none') {
			cssRules.push(`${selector} .feed-pagination .ts-btn { border-width: 1px; }`); // Default width if type set?
		}
	}

	// Pagination justify - Evidence: post-feed.php:837-856
	if (attributes.paginationJustify) {
		cssRules.push(`${selector} .feed-pagination { justify-content: ${attributes.paginationJustify}; }`);
	}

	// Pagination spacing between buttons - Evidence: post-feed.php:858-883
	if (attributes.paginationSpacing !== undefined) {
		cssRules.push(`${selector} .feed-pagination { gap: ${attributes.paginationSpacing}px; }`);
	}
	if (attributes.paginationSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .feed-pagination { gap: ${attributes.paginationSpacing_tablet}px; }`);
	}
	if (attributes.paginationSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .feed-pagination { gap: ${attributes.paginationSpacing_mobile}px; }`);
	}

	// Pagination border radius - Evidence: post-feed.php:919-944
	if (attributes.paginationBorderRadius !== undefined) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { border-radius: ${attributes.paginationBorderRadius}px; }`);
	}
	if (attributes.paginationBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .feed-pagination .ts-btn { border-radius: ${attributes.paginationBorderRadius_tablet}px; }`);
	}
	if (attributes.paginationBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .feed-pagination .ts-btn { border-radius: ${attributes.paginationBorderRadius_mobile}px; }`);
	}

	// Pagination text color (Normal) - Evidence: post-feed.php:946-953
	if (attributes.paginationTextColor) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { color: ${attributes.paginationTextColor}; }`);
	}

	// Pagination background color (Normal) - Evidence: post-feed.php:955-962
	if (attributes.paginationBackgroundColor) {
		cssRules.push(`${selector} .feed-pagination .ts-btn { background-color: ${attributes.paginationBackgroundColor}; }`);
	}

	// Pagination icon size - Evidence: post-feed.php:1002-1027
	if (attributes.paginationIconSize !== undefined) {
		cssRules.push(`${selector} .feed-pagination .ts-btn svg, ${selector} .feed-pagination .ts-btn i { --ts-icon-size: ${attributes.paginationIconSize}px; width: ${attributes.paginationIconSize}px; height: ${attributes.paginationIconSize}px; font-size: ${attributes.paginationIconSize}px; }`);
	}
	if (attributes.paginationIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .feed-pagination .ts-btn svg, ${selector} .feed-pagination .ts-btn i { --ts-icon-size: ${attributes.paginationIconSize_tablet}px; width: ${attributes.paginationIconSize_tablet}px; height: ${attributes.paginationIconSize_tablet}px; font-size: ${attributes.paginationIconSize_tablet}px; }`);
	}
	if (attributes.paginationIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .feed-pagination .ts-btn svg, ${selector} .feed-pagination .ts-btn i { --ts-icon-size: ${attributes.paginationIconSize_mobile}px; width: ${attributes.paginationIconSize_mobile}px; height: ${attributes.paginationIconSize_mobile}px; font-size: ${attributes.paginationIconSize_mobile}px; }`);
	}

	// Pagination icon color (Normal) - Evidence: post-feed.php:1029-1036
	if (attributes.paginationIconColor) {
		cssRules.push(`${selector} .feed-pagination .ts-btn svg, ${selector} .feed-pagination .ts-btn i { --ts-icon-color: ${attributes.paginationIconColor}; color: ${attributes.paginationIconColor}; fill: ${attributes.paginationIconColor}; }`);
	}

	// Pagination text color (Hover) - Evidence: post-feed.php:1047-1054
	if (attributes.paginationTextColorHover) {
		cssRules.push(`${selector} .feed-pagination .ts-btn:hover { color: ${attributes.paginationTextColorHover}; }`);
	}

	// Pagination background color (Hover) - Evidence: post-feed.php:1056-1063
	if (attributes.paginationBackgroundColorHover) {
		cssRules.push(`${selector} .feed-pagination .ts-btn:hover { background-color: ${attributes.paginationBackgroundColorHover}; }`);
	}

	// Pagination border color (Hover) - Evidence: post-feed.php:1065-1072
	if (attributes.paginationBorderColorHover) {
		cssRules.push(`${selector} .feed-pagination .ts-btn:hover { border-color: ${attributes.paginationBorderColorHover}; }`);
	}

	// Pagination icon color (Hover) - Evidence: post-feed.php:1074-1080
	if (attributes.paginationIconColorHover) {
		cssRules.push(`${selector} .feed-pagination .ts-btn:hover svg, ${selector} .feed-pagination .ts-btn:hover i { --ts-icon-color: ${attributes.paginationIconColorHover}; color: ${attributes.paginationIconColorHover}; fill: ${attributes.paginationIconColorHover}; }`);
	}

	// ============================================
	// CAROUSEL NAVIGATION STYLES
	// Evidence: post-feed.php:1082-1370
	// ============================================

	// Carousel nav horizontal position - Evidence: post-feed.php:1103-1128
	if (attributes.carouselNavHorizontalPosition !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-prev-page { left: ${attributes.carouselNavHorizontalPosition}px; }`);
		cssRules.push(`${selector} .post-feed-nav .ts-next-page { right: ${attributes.carouselNavHorizontalPosition}px; }`);
	}
	if (attributes.carouselNavHorizontalPosition_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-prev-page { left: ${attributes.carouselNavHorizontalPosition_tablet}px; }`);
		tabletRules.push(`${selector} .post-feed-nav .ts-next-page { right: ${attributes.carouselNavHorizontalPosition_tablet}px; }`);
	}
	if (attributes.carouselNavHorizontalPosition_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-prev-page { left: ${attributes.carouselNavHorizontalPosition_mobile}px; }`);
		mobileRules.push(`${selector} .post-feed-nav .ts-next-page { right: ${attributes.carouselNavHorizontalPosition_mobile}px; }`);
	}

	// Carousel nav vertical position - Evidence: post-feed.php:1130-1155
	if (attributes.carouselNavVerticalPosition !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { top: ${attributes.carouselNavVerticalPosition}%; transform: translateY(-50%); }`);
	}
	if (attributes.carouselNavVerticalPosition_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { top: ${attributes.carouselNavVerticalPosition_tablet}%; transform: translateY(-50%); }`);
	}
	if (attributes.carouselNavVerticalPosition_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { top: ${attributes.carouselNavVerticalPosition_mobile}%; transform: translateY(-50%); }`);
	}

	// Carousel nav icon color (Normal) - Evidence: post-feed.php:1157-1164
	if (attributes.carouselNavIconColor) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn svg, ${selector} .post-feed-nav .ts-icon-btn i { --ts-icon-color: ${attributes.carouselNavIconColor}; color: ${attributes.carouselNavIconColor}; fill: ${attributes.carouselNavIconColor}; }`);
	}

	// Carousel nav button size - Evidence: post-feed.php:1166-1191
	if (attributes.carouselNavButtonSize !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.carouselNavButtonSize}px; height: ${attributes.carouselNavButtonSize}px; }`);
	}
	if (attributes.carouselNavButtonSize_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.carouselNavButtonSize_tablet}px; height: ${attributes.carouselNavButtonSize_tablet}px; }`);
	}
	if (attributes.carouselNavButtonSize_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.carouselNavButtonSize_mobile}px; height: ${attributes.carouselNavButtonSize_mobile}px; }`);
	}

	// Carousel nav icon size - Evidence: post-feed.php:1193-1218
	if (attributes.carouselNavIconSize !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn svg, ${selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: ${attributes.carouselNavIconSize}px; width: ${attributes.carouselNavIconSize}px; height: ${attributes.carouselNavIconSize}px; font-size: ${attributes.carouselNavIconSize}px; }`);
	}
	if (attributes.carouselNavIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn svg, ${selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: ${attributes.carouselNavIconSize_tablet}px; width: ${attributes.carouselNavIconSize_tablet}px; height: ${attributes.carouselNavIconSize_tablet}px; font-size: ${attributes.carouselNavIconSize_tablet}px; }`);
	}
	if (attributes.carouselNavIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn svg, ${selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: ${attributes.carouselNavIconSize_mobile}px; width: ${attributes.carouselNavIconSize_mobile}px; height: ${attributes.carouselNavIconSize_mobile}px; font-size: ${attributes.carouselNavIconSize_mobile}px; }`);
	}

	// Carousel nav background - Evidence: post-feed.php:1220-1227
	if (attributes.carouselNavBackground) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { background-color: ${attributes.carouselNavBackground}; }`);
	}

	// Carousel nav backdrop blur - Evidence: post-feed.php:1229-1239
	if (attributes.carouselNavBackdropBlur !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur(${attributes.carouselNavBackdropBlur}px); -webkit-backdrop-filter: blur(${attributes.carouselNavBackdropBlur}px); }`);
	}

	// Carousel nav border type - Evidence: post-feed.php:1241-1250
	if (attributes.carouselNavBorderType) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-style: ${attributes.carouselNavBorderType}; }`);
		if (attributes.carouselNavBorderType !== 'none') {
			cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-width: 1px; }`); // Default width
		}
	}

	// Carousel nav border radius - Evidence: post-feed.php:1252-1277
	if (attributes.carouselNavBorderRadius !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.carouselNavBorderRadius}px; }`);
	}
	if (attributes.carouselNavBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.carouselNavBorderRadius_tablet}px; }`);
	}
	if (attributes.carouselNavBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.carouselNavBorderRadius_mobile}px; }`);
	}

	// Carousel nav hover states
	// Button size hover - Evidence: post-feed.php:1295-1320
	if (attributes.carouselNavButtonSizeHover !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.carouselNavButtonSizeHover}px; height: ${attributes.carouselNavButtonSizeHover}px; }`);
	}
	if (attributes.carouselNavButtonSizeHover_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.carouselNavButtonSizeHover_tablet}px; height: ${attributes.carouselNavButtonSizeHover_tablet}px; }`);
	}
	if (attributes.carouselNavButtonSizeHover_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.carouselNavButtonSizeHover_mobile}px; height: ${attributes.carouselNavButtonSizeHover_mobile}px; }`);
	}

	// Icon size hover - Evidence: post-feed.php:1322-1347
	if (attributes.carouselNavIconSizeHover !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover svg, ${selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: ${attributes.carouselNavIconSizeHover}px; width: ${attributes.carouselNavIconSizeHover}px; height: ${attributes.carouselNavIconSizeHover}px; font-size: ${attributes.carouselNavIconSizeHover}px; }`);
	}
	if (attributes.carouselNavIconSizeHover_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover svg, ${selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: ${attributes.carouselNavIconSizeHover_tablet}px; width: ${attributes.carouselNavIconSizeHover_tablet}px; height: ${attributes.carouselNavIconSizeHover_tablet}px; font-size: ${attributes.carouselNavIconSizeHover_tablet}px; }`);
	}
	if (attributes.carouselNavIconSizeHover_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover svg, ${selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: ${attributes.carouselNavIconSizeHover_mobile}px; width: ${attributes.carouselNavIconSizeHover_mobile}px; height: ${attributes.carouselNavIconSizeHover_mobile}px; font-size: ${attributes.carouselNavIconSizeHover_mobile}px; }`);
	}

	// Icon color hover - Evidence: post-feed.php:1349-1356
	if (attributes.carouselNavIconColorHover) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover svg, ${selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-color: ${attributes.carouselNavIconColorHover}; color: ${attributes.carouselNavIconColorHover}; fill: ${attributes.carouselNavIconColorHover}; }`);
	}

	// Background hover - Evidence: post-feed.php:1358-1365
	if (attributes.carouselNavBackgroundHover) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { background-color: ${attributes.carouselNavBackgroundHover}; }`);
	}

	// Border color hover - Evidence: post-feed.php:1367-1370
	if (attributes.carouselNavBorderColorHover) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { border-color: ${attributes.carouselNavBorderColorHover}; }`);
	}

	// ============================================
	// LOADING STYLES
	// Evidence: post-feed.php:588-680
	// ============================================

	// Loading opacity - Evidence: post-feed.php:611-621
	if (attributes.loadingStyle === 'opacity' && attributes.loadingOpacity !== undefined) {
		cssRules.push(`${selector} .post-feed-grid.vx-opacity { opacity: ${attributes.loadingOpacity}; }`);
	}

	// ============================================
	// COMBINE ALL RULES
	// ============================================

	let css = cssRules.join('\n');

	if (tabletRules.length > 0) {
		css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	if (mobileRules.length > 0) {
		css += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return css;
}
