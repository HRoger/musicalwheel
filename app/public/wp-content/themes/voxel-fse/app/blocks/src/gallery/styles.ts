/**
 * Gallery Block - Style Generation
 *
 * Generates responsive CSS from gallery-specific attributes.
 * Handles @media queries for tablet (≤1024px) and mobile (≤767px).
 *
 * Evidence: themes/voxel/app/widgets/gallery.php (responsive controls)
 *
 * @package VoxelFSE
 */

import type { GalleryBlockAttributes, MosaicConfig } from './types';
import type { TypographyValue } from '@shared/controls/TypographyPopup';

/**
 * Generate typography CSS properties from config
 */
function generateTypographyCSS(typography: TypographyValue | undefined): string {
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
 * Generate responsive typography CSS for tablet/mobile overrides
 */
function generateResponsiveTypographyCSS(
	typography: TypographyValue | undefined,
	suffix: '_tablet' | '_mobile'
): string {
	if (!typography) return '';
	const rules: string[] = [];

	const fsKey = `fontSize${suffix}` as keyof TypographyValue;
	const lhKey = `lineHeight${suffix}` as keyof TypographyValue;
	const lsKey = `letterSpacing${suffix}` as keyof TypographyValue;
	const wsKey = `wordSpacing${suffix}` as keyof TypographyValue;

	if (typography[fsKey] !== undefined) {
		const unit = typography.fontSizeUnit || 'px';
		rules.push(`font-size: ${typography[fsKey]}${unit};`);
	}
	if (typography[lhKey] !== undefined) {
		const unit = typography.lineHeightUnit || '';
		rules.push(`line-height: ${typography[lhKey]}${unit};`);
	}
	if (typography[lsKey] !== undefined) {
		const unit = typography.letterSpacingUnit || 'px';
		rules.push(`letter-spacing: ${typography[lsKey]}${unit};`);
	}
	if (typography[wsKey] !== undefined) {
		const unit = typography.wordSpacingUnit || 'px';
		rules.push(`word-spacing: ${typography[wsKey]}${unit};`);
	}

	return rules.join(' ');
}

/**
 * Generate mosaic CSS for a specific breakpoint suffix
 */
function generateMosaicCSS(
	mosaic: MosaicConfig | undefined,
	selector: string,
	suffix: '' | '_tablet' | '_mobile'
): string[] {
	if (!mosaic) return [];
	const rules: string[] = [];

	for (let i = 1; i <= 6; i++) {
		const itemKey = `item${i}` as keyof MosaicConfig;
		const item = mosaic[itemKey];
		if (!item) continue;

		const props: string[] = [];
		const colSpanKey = suffix ? `colSpan${suffix}` : 'colSpan';
		const colStartKey = suffix ? `colStart${suffix}` : 'colStart';
		const rowSpanKey = suffix ? `rowSpan${suffix}` : 'rowSpan';
		const rowStartKey = suffix ? `rowStart${suffix}` : 'rowStart';

		const colSpan = (item as Record<string, any>)[colSpanKey];
		const colStart = (item as Record<string, any>)[colStartKey];
		const rowSpan = (item as Record<string, any>)[rowSpanKey];
		const rowStart = (item as Record<string, any>)[rowStartKey];

		if (colSpan) props.push(`grid-column-end: span ${colSpan};`);
		if (colStart) props.push(`grid-column-start: ${colStart};`);
		if (rowSpan) props.push(`grid-row-end: span ${rowSpan};`);
		if (rowStart) props.push(`grid-row-start: ${rowStart};`);

		if (props.length > 0) {
			rules.push(`${selector} .ts-gallery-grid > li:nth-child(${i}) { ${props.join(' ')} }`);
		}
	}

	return rules;
}

/**
 * Generate CSS for Gallery block responsive properties
 *
 * @param attributes - Block attributes
 * @param blockId - Block ID for scoped selector
 * @returns CSS string with @media queries
 */
export function generateGalleryStyles(
	attributes: GalleryBlockAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `#${blockId}`;

	// ============================================
	// GRID LAYOUT (desktop defaults via inline styles, responsive via CSS)
	// ============================================

	// Column count - tablet/mobile
	if (attributes.columnCount_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-gallery-grid { grid-template-columns: repeat(${attributes.columnCount_tablet}, 1fr); }`);
	}
	if (attributes.columnCount_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-gallery-grid { grid-template-columns: repeat(${attributes.columnCount_mobile}, 1fr); }`);
	}

	// Column gap - tablet/mobile
	if (attributes.columnGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-gallery-grid { gap: ${attributes.columnGap_tablet}px; }`);
	}
	if (attributes.columnGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-gallery-grid { gap: ${attributes.columnGap_mobile}px; }`);
	}

	// Row height - tablet/mobile (only when not using aspect ratio)
	if (!attributes.useAspectRatio) {
		if (attributes.rowHeight_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-gallery-grid { grid-auto-rows: ${attributes.rowHeight_tablet}px; }`);
		}
		if (attributes.rowHeight_mobile !== undefined) {
			mobileRules.push(`${selector} .ts-gallery-grid { grid-auto-rows: ${attributes.rowHeight_mobile}px; }`);
		}
	}

	// Aspect ratio - tablet/mobile
	if (attributes.useAspectRatio) {
		if (attributes.aspectRatio_tablet) {
			tabletRules.push(`${selector} .ts-gallery-grid img { aspect-ratio: ${attributes.aspectRatio_tablet}; }`);
		}
		if (attributes.aspectRatio_mobile) {
			mobileRules.push(`${selector} .ts-gallery-grid img { aspect-ratio: ${attributes.aspectRatio_mobile}; }`);
		}
	}

	// ============================================
	// IMAGE BORDER RADIUS - tablet/mobile
	// ============================================
	if (attributes.imageBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-gallery-grid > li > a { border-radius: ${attributes.imageBorderRadius_tablet}px; }`);
	}
	if (attributes.imageBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-gallery-grid > li > a { border-radius: ${attributes.imageBorderRadius_mobile}px; }`);
	}

	// ============================================
	// EMPTY ITEM BORDER RADIUS - tablet/mobile
	// ============================================
	if (attributes.emptyBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-gallery-grid .ts-empty-item > div { border-radius: ${attributes.emptyBorderRadius_tablet}px; }`);
	}
	if (attributes.emptyBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-gallery-grid .ts-empty-item > div { border-radius: ${attributes.emptyBorderRadius_mobile}px; }`);
	}

	// ============================================
	// VIEW ALL ICON SIZE - tablet/mobile
	// ============================================
	if (attributes.viewAllIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-gallery-last-item .ts-image-overlay > span { width: ${attributes.viewAllIconSize_tablet}px; height: ${attributes.viewAllIconSize_tablet}px; }`);
	}
	if (attributes.viewAllIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-gallery-last-item .ts-image-overlay > span { width: ${attributes.viewAllIconSize_mobile}px; height: ${attributes.viewAllIconSize_mobile}px; }`);
	}

	// ============================================
	// VIEW ALL TYPOGRAPHY
	// Evidence: themes/voxel/app/widgets/gallery.php:873-880
	// ============================================
	const typo = attributes.viewAllTypography as TypographyValue | undefined;
	if (typo) {
		const desktopTypo = generateTypographyCSS(typo);
		if (desktopTypo) {
			cssRules.push(`${selector} .ts-gallery-last-item .ts-image-overlay > p { ${desktopTypo} }`);
		}
		const tabletTypo = generateResponsiveTypographyCSS(typo, '_tablet');
		if (tabletTypo) {
			tabletRules.push(`${selector} .ts-gallery-last-item .ts-image-overlay > p { ${tabletTypo} }`);
		}
		const mobileTypo = generateResponsiveTypographyCSS(typo, '_mobile');
		if (mobileTypo) {
			mobileRules.push(`${selector} .ts-gallery-last-item .ts-image-overlay > p { ${mobileTypo} }`);
		}
	}

	// ============================================
	// MOSAIC POSITIONING - desktop/tablet/mobile
	// Desktop mosaic is handled by inline styles, but we also generate CSS
	// for tablet/mobile overrides
	// ============================================
	tabletRules.push(...generateMosaicCSS(attributes.mosaic, selector, '_tablet'));
	mobileRules.push(...generateMosaicCSS(attributes.mosaic, selector, '_mobile'));

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
