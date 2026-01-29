/**
 * Visit Chart Block - Style Generation
 *
 * Generates CSS for all Style tab controls targeting Voxel CSS classes.
 * Reference: themes/voxel/app/widgets/visits-chart.php:102-1039
 *
 * @package VoxelFSE
 */

import type { VisitChartAttributes } from './types';

/**
 * Helper: Generate dimensions CSS (padding, margin)
 */
function generateDimensionsCSS(
	dimensions: any,
	property: string
): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	// Parse to handle empty strings from DimensionsControl
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Helper: Generate border CSS from BorderGroupValue
 */
function generateBorderCSS(border: any): string {
	if (!border?.borderType || border.borderType === 'none') return '';
	const width = border.borderWidth || {};
	const top = parseFloat(String(width.top)) || 0;
	const right = parseFloat(String(width.right)) || 0;
	const bottom = parseFloat(String(width.bottom)) || 0;
	const left = parseFloat(String(width.left)) || 0;
	const color = border.borderColor || '#000000';
	return `border-style: ${border.borderType}; border-width: ${top}px ${right}px ${bottom}px ${left}px; border-color: ${color};`;
}

/**
 * Helper: Generate box-shadow CSS
 */
function generateBoxShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const {
		horizontal = 0,
		vertical = 0,
		blur = 0,
		spread = 0,
		color = 'rgba(0,0,0,0.1)',
		position = 'outline',
	} = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

/**
 * Helper: Generate typography CSS
 */
function generateTypographyCSS(typography: any): string {
	if (!typography) return '';
	let css = '';
	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize)
		css += `font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}; `;
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform)
		css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration)
		css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight)
		css += `line-height: ${typography.lineHeight}${typography.lineHeightUnit || ''}; `;
	if (typography.letterSpacing)
		css += `letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}; `;
	return css;
}

/**
 * Helper: Generate background CSS from BackgroundControl
 * BackgroundControl stores all data in a single object attribute
 */
function generateBackgroundCSS(bg: any): string {
	if (!bg) return '';

	// BackgroundControl stores: { backgroundType, backgroundColor, backgroundImage, backgroundGradient }
	const bgType = bg.backgroundType || 'classic';

	if (bgType === 'gradient' && bg.backgroundGradient) {
		return `background-image: ${bg.backgroundGradient}; `;
	}

	// Classic background
	let css = '';
	if (bg.backgroundColor) {
		css += `background-color: ${bg.backgroundColor}; `;
	}

	if (bg.backgroundImage?.url) {
		const img = bg.backgroundImage;
		css += `background-image: url(${img.url}); `;
		if (img.position) css += `background-position: ${img.position}; `;
		if (img.attachment) css += `background-attachment: ${img.attachment}; `;
		if (img.repeat) css += `background-repeat: ${img.repeat}; `;
		if (img.size) css += `background-size: ${img.size}; `;
	}

	return css;
}

/**
 * Generate responsive CSS for Visit Chart block
 *
 * Targets Voxel CSS classes with block-scoped selector.
 * Handles desktop, tablet, and mobile responsive attributes.
 */
export function generateVisitChartResponsiveCSS(
	attributes: VisitChartAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-visit-chart-frontend.voxel-fse-visit-chart-${blockId}`;

	// ============================================
	// SECTION: Chart Accordion
	// Source: visits-chart.php:110-420
	// ============================================

	// Content height - visits-chart.php:110-128
	// Selector: '{{WRAPPER}} .ts-chart .ts-no-posts, {{WRAPPER}} .ts-chart .chart-content'
	if (attributes.chartHeight !== undefined) {
		cssRules.push(
			`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.chartHeight}px; }`
		);
	}
	if (attributes.chartHeight_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.chartHeight_tablet}px; }`
		);
	}
	if (attributes.chartHeight_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.chartHeight_mobile}px; }`
		);
	}

	// Axis Typography - visits-chart.php:139-146
	// Selector: '{{WRAPPER}} .chart-content span'
	const axisTypoCSS = generateTypographyCSS(attributes.axisTypography);
	if (axisTypoCSS) {
		cssRules.push(`${selector} .chart-content span { ${axisTypoCSS} }`);
	}

	// Axis Text color - visits-chart.php:150-160
	// Selector: '{{WRAPPER}} .chart-content span'
	if (attributes.axisTextColor) {
		cssRules.push(
			`${selector} .chart-content span { color: ${attributes.axisTextColor}; }`
		);
	}

	// Vertical axis width - visits-chart.php:162-179
	// Selector: '{{WRAPPER}} .chart-content.min-scroll'
	if (attributes.verticalAxisWidth !== undefined) {
		cssRules.push(
			`${selector} .chart-content.min-scroll { margin-left: ${attributes.verticalAxisWidth}px; }`
		);
	}
	if (attributes.verticalAxisWidth_tablet !== undefined) {
		tabletRules.push(
			`${selector} .chart-content.min-scroll { margin-left: ${attributes.verticalAxisWidth_tablet}px; }`
		);
	}
	if (attributes.verticalAxisWidth_mobile !== undefined) {
		mobileRules.push(
			`${selector} .chart-content.min-scroll { margin-left: ${attributes.verticalAxisWidth_mobile}px; }`
		);
	}

	// Chart lines Border Type - visits-chart.php:190-197
	// Selector: '{{WRAPPER}} .chart-content .bar-values span'
	if (attributes.chartLineBorderType && attributes.chartLineBorderType !== 'default') {
		if (attributes.chartLineBorderType === 'none') {
			cssRules.push(
				`${selector} .chart-content .bar-values span { border-top-style: none; }`
			);
		} else {
			cssRules.push(
				`${selector} .chart-content .bar-values span { border-top-style: ${attributes.chartLineBorderType}; }`
			);
		}
	}

	// Bar gap - visits-chart.php:208-225
	// Selector: '{{WRAPPER}} .chart-content'
	if (attributes.barGap !== undefined) {
		cssRules.push(
			`${selector} .chart-content { grid-gap: ${attributes.barGap}px; }`
		);
	}
	if (attributes.barGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .chart-content { grid-gap: ${attributes.barGap_tablet}px; }`
		);
	}
	if (attributes.barGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .chart-content { grid-gap: ${attributes.barGap_mobile}px; }`
		);
	}

	// Bar width - visits-chart.php:229-246
	// Selector: '{{WRAPPER}} .chart-content .bar-item'
	if (attributes.barWidth !== undefined) {
		cssRules.push(
			`${selector} .chart-content .bar-item { width: ${attributes.barWidth}px; }`
		);
	}
	if (attributes.barWidth_tablet !== undefined) {
		tabletRules.push(
			`${selector} .chart-content .bar-item { width: ${attributes.barWidth_tablet}px; }`
		);
	}
	if (attributes.barWidth_mobile !== undefined) {
		mobileRules.push(
			`${selector} .chart-content .bar-item { width: ${attributes.barWidth_mobile}px; }`
		);
	}

	// Bar radius - visits-chart.php:248-265
	// Selector: '{{WRAPPER}} .chart-content .bar-item'
	if (attributes.barRadius !== undefined) {
		cssRules.push(
			`${selector} .chart-content .bar-item { border-radius: ${attributes.barRadius}px; }`
		);
	}
	if (attributes.barRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .chart-content .bar-item { border-radius: ${attributes.barRadius_tablet}px; }`
		);
	}
	if (attributes.barRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .chart-content .bar-item { border-radius: ${attributes.barRadius_mobile}px; }`
		);
	}

	// Background color (BackgroundControl) - visits-chart.php:267-276
	// Selector: '{{WRAPPER}} .chart-content .bar-item'
	const barBgCSS = generateBackgroundCSS(attributes.barBackground);
	if (barBgCSS) {
		cssRules.push(`${selector} .chart-content .bar-item { ${barBgCSS} }`);
	}

	// Background color (Hover) - visits-chart.php:278-288
	// Selector: '{{WRAPPER}} .chart-content .bar-item:hover'
	if (attributes.barBackgroundHover) {
		cssRules.push(
			`${selector} .chart-content .bar-item:hover { background-color: ${attributes.barBackgroundHover}; }`
		);
	}

	// Box Shadow - visits-chart.php:290-297
	// Selector: '{{WRAPPER}} .chart-content .bar-item'
	const barShadowCSS = generateBoxShadowCSS(attributes.barBoxShadow);
	if (barShadowCSS) {
		cssRules.push(`${selector} .chart-content .bar-item { ${barShadowCSS} }`);
	}

	// Bar popup Background color - visits-chart.php:309-319
	// Selector: '{{WRAPPER}} .bar-item-data'
	if (attributes.barPopupBackground) {
		cssRules.push(
			`${selector} .bar-item-data { background-color: ${attributes.barPopupBackground}; }`
		);
	}

	// Bar popup Border - visits-chart.php:321-328
	// Selector: '{{WRAPPER}} .bar-item-data'
	const barPopupBorderCSS = generateBorderCSS({
		borderType: attributes.barPopupBorderType,
		borderWidth: attributes.barPopupBorderWidth,
		borderColor: attributes.barPopupBorderColor,
	});
	if (barPopupBorderCSS) {
		cssRules.push(`${selector} .bar-item-data { ${barPopupBorderCSS} }`);
	}

	// Bar popup Radius - visits-chart.php:330-347
	// Selector: '{{WRAPPER}} .bar-item-data'
	if (attributes.barPopupRadius !== undefined) {
		cssRules.push(
			`${selector} .bar-item-data { border-radius: ${attributes.barPopupRadius}px; }`
		);
	}
	if (attributes.barPopupRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .bar-item-data { border-radius: ${attributes.barPopupRadius_tablet}px; }`
		);
	}
	if (attributes.barPopupRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .bar-item-data { border-radius: ${attributes.barPopupRadius_mobile}px; }`
		);
	}

	// Bar popup Box Shadow - visits-chart.php:349-356
	// Selector: '{{WRAPPER}} .bar-item-data'
	const barPopupShadowCSS = generateBoxShadowCSS(attributes.barPopupBoxShadow);
	if (barPopupShadowCSS) {
		cssRules.push(`${selector} .bar-item-data { ${barPopupShadowCSS} }`);
	}

	// Bar popup Value Typography - visits-chart.php:367-374
	// Selector: '{{WRAPPER}} .bar-item-data li'
	const barPopupValueTypoCSS = generateTypographyCSS(
		attributes.barPopupValueTypography
	);
	if (barPopupValueTypoCSS) {
		cssRules.push(`${selector} .bar-item-data li { ${barPopupValueTypoCSS} }`);
	}

	// Bar popup Value Color - visits-chart.php:376-385
	// Selector: '{{WRAPPER}} .bar-item-data li'
	if (attributes.barPopupValueColor) {
		cssRules.push(
			`${selector} .bar-item-data li { color: ${attributes.barPopupValueColor}; }`
		);
	}

	// Bar popup Label Typography - visits-chart.php:396-403
	// Selector: '{{WRAPPER}} .bar-item-data li small'
	const barPopupLabelTypoCSS = generateTypographyCSS(
		attributes.barPopupLabelTypography
	);
	if (barPopupLabelTypoCSS) {
		cssRules.push(
			`${selector} .bar-item-data li small { ${barPopupLabelTypoCSS} }`
		);
	}

	// Bar popup Label Color - visits-chart.php:405-414
	// Selector: '{{WRAPPER}} .bar-item-data li small'
	if (attributes.barPopupLabelColor) {
		cssRules.push(
			`${selector} .bar-item-data li small { color: ${attributes.barPopupLabelColor}; }`
		);
	}

	// ============================================
	// SECTION: Tabs Accordion
	// Source: visits-chart.php:422-712
	// ============================================

	// Timeline tabs Justify - visits-chart.php:453-471
	// Selector: '{{WRAPPER}} .ts-generic-tabs'
	if (attributes.tabsJustify) {
		cssRules.push(
			`${selector} .ts-generic-tabs { justify-content: ${attributes.tabsJustify}; }`
		);
	}

	// Tabs Padding - visits-chart.php:473-483
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	const tabsPaddingCSS = generateDimensionsCSS(attributes.tabsPadding, 'padding');
	if (tabsPaddingCSS) {
		cssRules.push(`${selector} .ts-generic-tabs li a { ${tabsPaddingCSS} }`);
	}

	// Tabs Margin - visits-chart.php:485-502
	// Selector: '{{WRAPPER}} .ts-generic-tabs li'
	const tabsMarginCSS = generateDimensionsCSS(attributes.tabsMargin, 'margin');
	if (tabsMarginCSS) {
		cssRules.push(`${selector} .ts-generic-tabs li { ${tabsMarginCSS} }`);
	}

	// Tab typography - visits-chart.php:504-511
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	const tabsTypoCSS = generateTypographyCSS(attributes.tabsTypography);
	if (tabsTypoCSS) {
		cssRules.push(`${selector} .ts-generic-tabs li a { ${tabsTypoCSS} }`);
	}

	// Active tab typography - visits-chart.php:513-520
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	const tabsActiveTypoCSS = generateTypographyCSS(attributes.tabsActiveTypography);
	if (tabsActiveTypoCSS) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { ${tabsActiveTypoCSS} }`
		);
	}

	// Text color - visits-chart.php:523-533
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsTextColor) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a { color: ${attributes.tabsTextColor}; }`
		);
	}

	// Active text color - visits-chart.php:535-545
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveTextColor) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { color: ${attributes.tabsActiveTextColor}; }`
		);
	}

	// Background - visits-chart.php:547-557
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBackground) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a { background-color: ${attributes.tabsBackground}; }`
		);
	}

	// Active background - visits-chart.php:559-569
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveBackground) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { background-color: ${attributes.tabsActiveBackground}; }`
		);
	}

	// Border Type - visits-chart.php:571-578
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBorderType && attributes.tabsBorderType !== 'default') {
		if (attributes.tabsBorderType === 'none') {
			cssRules.push(
				`${selector} .ts-generic-tabs li a { border-style: none; }`
			);
		} else {
			cssRules.push(
				`${selector} .ts-generic-tabs li a { border-style: ${attributes.tabsBorderType}; }`
			);
		}
	}

	// Active border color - visits-chart.php:580-590
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveBorderColor) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { border-color: ${attributes.tabsActiveBorderColor}; }`
		);
	}

	// Border radius - visits-chart.php:592-610
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius}px; }`
		);
	}
	if (attributes.tabsBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius_tablet}px; }`
		);
	}
	if (attributes.tabsBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius_mobile}px; }`
		);
	}

	// HOVER STATE - visits-chart.php:617-708

	// Text color (Hover) - visits-chart.php:633-643
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover'
	if (attributes.tabsTextColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { color: ${attributes.tabsTextColorHover}; }`
		);
	}

	// Active text color (Hover) - visits-chart.php:647-657
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover'
	if (attributes.tabsActiveTextColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { color: ${attributes.tabsActiveTextColorHover}; }`
		);
	}

	// Border color (Hover) - visits-chart.php:659-669
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover'
	if (attributes.tabsBorderColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { border-color: ${attributes.tabsBorderColorHover}; }`
		);
	}

	// Active border color (Hover) - visits-chart.php:671-681
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover'
	if (attributes.tabsActiveBorderColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { border-color: ${attributes.tabsActiveBorderColorHover}; }`
		);
	}

	// Background (Hover) - visits-chart.php:683-693
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover'
	if (attributes.tabsBackgroundHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { background-color: ${attributes.tabsBackgroundHover}; }`
		);
	}

	// Active background (Hover) - visits-chart.php:695-705
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover'
	if (attributes.tabsActiveBackgroundHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { background-color: ${attributes.tabsActiveBackgroundHover}; }`
		);
	}

	// ============================================
	// SECTION: Next/Prev week buttons Accordion
	// Source: visits-chart.php:714-951
	// ============================================

	// Range Typography - visits-chart.php:745-752
	// Selector: '{{WRAPPER}} .ts-chart-nav p'
	const weekRangeTypoCSS = generateTypographyCSS(attributes.weekRangeTypography);
	if (weekRangeTypoCSS) {
		cssRules.push(`${selector} .ts-chart-nav p { ${weekRangeTypoCSS} }`);
	}

	// Range Text color - visits-chart.php:754-764
	// Selector: '{{WRAPPER}} .ts-chart-nav p'
	if (attributes.weekRangeTextColor) {
		cssRules.push(
			`${selector} .ts-chart-nav p { color: ${attributes.weekRangeTextColor}; }`
		);
	}

	// Button icon color - visits-chart.php:781-792
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn i' and svg
	if (attributes.weekButtonIconColor) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn i { color: ${attributes.weekButtonIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn svg { fill: ${attributes.weekButtonIconColor}; }`
		);
	}

	// Button icon size - visits-chart.php:794-816
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn i' and svg
	if (attributes.weekButtonIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn i { font-size: ${attributes.weekButtonIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn svg { width: ${attributes.weekButtonIconSize}px; height: ${attributes.weekButtonIconSize}px; }`
		);
	}
	if (attributes.weekButtonIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn i { font-size: ${attributes.weekButtonIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn svg { width: ${attributes.weekButtonIconSize_tablet}px; height: ${attributes.weekButtonIconSize_tablet}px; }`
		);
	}
	if (attributes.weekButtonIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn i { font-size: ${attributes.weekButtonIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn svg { width: ${attributes.weekButtonIconSize_mobile}px; height: ${attributes.weekButtonIconSize_mobile}px; }`
		);
	}

	// Button background - visits-chart.php:818-829
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn'
	if (attributes.weekButtonBackground) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { background-color: ${attributes.weekButtonBackground}; }`
		);
	}

	// Button border - visits-chart.php:831-838
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn'
	const weekButtonBorderCSS = generateBorderCSS({
		borderType: attributes.weekButtonBorderType,
		borderWidth: attributes.weekButtonBorderWidth,
		borderColor: attributes.weekButtonBorderColor,
	});
	if (weekButtonBorderCSS) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { ${weekButtonBorderCSS} }`
		);
	}

	// Button border radius - visits-chart.php:840-861
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn'
	if (attributes.weekButtonBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { border-radius: ${attributes.weekButtonBorderRadius}px; }`
		);
	}
	if (attributes.weekButtonBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { border-radius: ${attributes.weekButtonBorderRadius_tablet}px; }`
		);
	}
	if (attributes.weekButtonBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { border-radius: ${attributes.weekButtonBorderRadius_mobile}px; }`
		);
	}

	// Button size - visits-chart.php:863-884
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn'
	if (attributes.weekButtonSize !== undefined) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { width: ${attributes.weekButtonSize}px; height: ${attributes.weekButtonSize}px; min-width: ${attributes.weekButtonSize}px; }`
		);
	}
	if (attributes.weekButtonSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { width: ${attributes.weekButtonSize_tablet}px; height: ${attributes.weekButtonSize_tablet}px; min-width: ${attributes.weekButtonSize_tablet}px; }`
		);
	}
	if (attributes.weekButtonSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn { width: ${attributes.weekButtonSize_mobile}px; height: ${attributes.weekButtonSize_mobile}px; min-width: ${attributes.weekButtonSize_mobile}px; }`
		);
	}

	// HOVER STATE - visits-chart.php:901-947

	// Button icon color (Hover) - visits-chart.php:908-919
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn:hover i' and svg
	if (attributes.weekButtonIconColorHover) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn:hover i { color: ${attributes.weekButtonIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn:hover svg { fill: ${attributes.weekButtonIconColorHover}; }`
		);
	}

	// Button background color (Hover) - visits-chart.php:921-932
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn:hover'
	if (attributes.weekButtonBackgroundHover) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn:hover { background-color: ${attributes.weekButtonBackgroundHover}; }`
		);
	}

	// Button border color (Hover) - visits-chart.php:934-945
	// Selector: '{{WRAPPER}} .ts-chart-nav .ts-icon-btn:hover'
	if (attributes.weekButtonBorderColorHover) {
		cssRules.push(
			`${selector} .ts-chart-nav .ts-icon-btn:hover { border-color: ${attributes.weekButtonBorderColorHover}; }`
		);
	}

	// ============================================
	// SECTION: No activity Accordion
	// Source: visits-chart.php:953-1039
	// ============================================

	// Content gap - visits-chart.php:963-980
	// Selector: '{{WRAPPER}} .ts-no-posts'
	if (attributes.noActivityContentGap !== undefined) {
		cssRules.push(
			`${selector} .ts-no-posts { grid-gap: ${attributes.noActivityContentGap}px; }`
		);
	}
	if (attributes.noActivityContentGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-no-posts { grid-gap: ${attributes.noActivityContentGap_tablet}px; }`
		);
	}
	if (attributes.noActivityContentGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-no-posts { grid-gap: ${attributes.noActivityContentGap_mobile}px; }`
		);
	}

	// Icon size - visits-chart.php:982-1000
	// Selector: '{{WRAPPER}} .ts-no-posts i' and svg
	if (attributes.noActivityIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-no-posts i { font-size: ${attributes.noActivityIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-no-posts svg { width: ${attributes.noActivityIconSize}px; height: ${attributes.noActivityIconSize}px; }`
		);
	}
	if (attributes.noActivityIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-no-posts i { font-size: ${attributes.noActivityIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-no-posts svg { width: ${attributes.noActivityIconSize_tablet}px; height: ${attributes.noActivityIconSize_tablet}px; }`
		);
	}
	if (attributes.noActivityIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-no-posts i { font-size: ${attributes.noActivityIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-no-posts svg { width: ${attributes.noActivityIconSize_mobile}px; height: ${attributes.noActivityIconSize_mobile}px; }`
		);
	}

	// Icon color - visits-chart.php:1002-1013
	// Selector: '{{WRAPPER}} .ts-no-posts i' and svg
	if (attributes.noActivityIconColor) {
		cssRules.push(
			`${selector} .ts-no-posts i { color: ${attributes.noActivityIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-no-posts svg { fill: ${attributes.noActivityIconColor}; }`
		);
	}

	// Typography - visits-chart.php:1015-1022
	// Selector: '{{WRAPPER}} .ts-no-posts p'
	const noActivityTypoCSS = generateTypographyCSS(attributes.noActivityTypography);
	if (noActivityTypoCSS) {
		cssRules.push(`${selector} .ts-no-posts p { ${noActivityTypoCSS} }`);
	}

	// Text color - visits-chart.php:1024-1034
	// Selector: '{{WRAPPER}} .ts-no-posts p'
	if (attributes.noActivityTextColor) {
		cssRules.push(
			`${selector} .ts-no-posts p { color: ${attributes.noActivityTextColor}; }`
		);
	}

	// ============================================
	// Combine CSS with media queries
	// ============================================
	let finalCSS = '';
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}
	return finalCSS;
}
