/**
 * Generate Timeline Kit CSS
 *
 * Shared utility to generate CSS for both editor and frontend.
 * Applies CSS custom properties to .vxfeed elements globally.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/timeline-kit.php (lines 27-732)
 * - Attribute names match Elementor control IDs exactly
 */
import { Attributes } from './types';

/**
 * Safely parse a numeric value from a string that might already contain a unit
 */
function safeValue(value: string | number | undefined): string {
	if (value === undefined || value === null || value === '') return '0';
	const str = String(value);
	const match = str.match(/^([\d.]+)/);
	return match ? match[1] : '0';
}

/**
 * Get responsive value based on device type
 */
function getResponsiveValue(
	baseName: string,
	attributes: any,
	defaultUnit: string = 'px',
	device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string | undefined {
	const baseValue = attributes[baseName];
	const tabletValue = attributes[`${baseName}_tablet`];
	const mobileValue = attributes[`${baseName}_mobile`];

	let value = baseValue;
	if (device === 'tablet' && tabletValue !== undefined) {
		value = tabletValue;
	} else if (device === 'mobile' && mobileValue !== undefined) {
		value = mobileValue;
	}

	const unit = attributes[`${baseName}Unit`] || defaultUnit;
	return value !== undefined ? `${safeValue(value)}${unit}` : undefined;
}

/**
 * Generate full responsive CSS for Timeline Kit
 * Combines desktop, tablet, and mobile media queries.
 */
export function generateTimelineResponsiveCSS(attributes: Attributes): string {
	const desktopCSS = generateTimelineCSS(attributes, 'desktop');
	const tabletCSS = generateTimelineCSS(attributes, 'tablet');
	const mobileCSS = generateTimelineCSS(attributes, 'mobile');

	let combinedCSS = desktopCSS;

	if (tabletCSS) {
		combinedCSS += `@media (max-width: 1024px) {\n${tabletCSS}\n}\n`;
	}

	if (mobileCSS) {
		combinedCSS += `@media (max-width: 767px) {\n${mobileCSS}\n}\n`;
	}

	return combinedCSS;
}

/**
 * Generate border CSS from BorderGroupControl value
 */
function generateBorderCSS(
	borderType?: string,
	borderWidth?: any,
	borderColor?: string
): string {
	if (!borderType || borderType === 'none' || borderType === '') return '';

	const width = borderWidth;
	if (!width) return '';

	const top = safeValue(width.top ?? 1);
	const right = safeValue(width.right ?? 1);
	const bottom = safeValue(width.bottom ?? 1);
	const left = safeValue(width.left ?? 1);
	const unit = width.unit || 'px';

	return `border: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit} ${borderType} ${borderColor || '#000'};`;
}

/**
 * Generate box shadow CSS
 */
function generateBoxShadowCSS(shadow?: any): string {
	if (!shadow || typeof shadow !== 'object') return '';

	const {
		horizontal = 0,
		vertical = 0,
		blur = 0,
		spread = 0,
		color = 'rgba(0,0,0,0.1)',
		position = 'outset'
	} = shadow;

	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

/**
 * Generate typography CSS
 */
function generateTypographyCSS(
	typo: any,
	device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
	if (!typo || typeof typo !== 'object') return '';

	let css = '';
	if (typo.fontFamily) css += `font-family: ${typo.fontFamily};\n`;

	// Responsive Font Size
	let fontSize = typo.fontSize;
	if (device === 'tablet' && typo.fontSize_tablet !== undefined) fontSize = typo.fontSize_tablet;
	if (device === 'mobile' && typo.fontSize_mobile !== undefined) fontSize = typo.fontSize_mobile;
	if (fontSize) css += `font-size: ${fontSize}${typo.fontSizeUnit || 'px'};\n`;

	if (typo.fontWeight) css += `font-weight: ${typo.fontWeight};\n`;
	if (typo.fontStyle) css += `font-style: ${typo.fontStyle};\n`;
	if (typo.textTransform) css += `text-transform: ${typo.textTransform};\n`;
	if (typo.textDecoration) css += `text-decoration: ${typo.textDecoration};\n`;

	// Responsive Line Height
	let lineHeight = typo.lineHeight;
	if (device === 'tablet' && typo.lineHeight_tablet !== undefined) lineHeight = typo.lineHeight_tablet;
	if (device === 'mobile' && typo.lineHeight_mobile !== undefined) lineHeight = typo.lineHeight_mobile;
	if (lineHeight) css += `line-height: ${lineHeight}${typo.lineHeightUnit || ''};\n`;

	// Responsive Letter Spacing
	let letterSpacing = typo.letterSpacing;
	if (device === 'tablet' && typo.letterSpacing_tablet !== undefined) letterSpacing = typo.letterSpacing_tablet;
	if (device === 'mobile' && typo.letterSpacing_mobile !== undefined) letterSpacing = typo.letterSpacing_mobile;
	if (letterSpacing) css += `letter-spacing: ${letterSpacing}${typo.letterSpacingUnit || 'px'};\n`;

	// Responsive Word Spacing
	let wordSpacing = typo.wordSpacing;
	if (device === 'tablet' && typo.wordSpacing_tablet !== undefined) wordSpacing = typo.wordSpacing_tablet;
	if (device === 'mobile' && typo.wordSpacing_mobile !== undefined) wordSpacing = typo.wordSpacing_mobile;
	if (wordSpacing) css += `word-spacing: ${wordSpacing}${typo.wordSpacingUnit || 'px'};\n`;

	return css;
}

/**
 * Generate dynamic CSS for Timeline Kit
 */
export function generateTimelineCSS(
	attributes: Attributes,
	device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
	let css = '';

	// 1. General accordion - CSS Custom Properties on .vxfeed
	// Build the vxfeed properties first, only output if there are any
	let vxfeedProps = '';
	if (attributes.vxfText1) vxfeedProps += `  --main-text: ${attributes.vxfText1};\n`;
	if (attributes.vxfText2) vxfeedProps += `  --faded-text: ${attributes.vxfText2};\n`;
	if (attributes.vxfText3) vxfeedProps += `  --main-link: ${attributes.vxfText3};\n`;
	if (attributes.vxfBg) vxfeedProps += `  --main-bg: ${attributes.vxfBg};\n`;
	if (attributes.vxfBorder) vxfeedProps += `  --main-border: ${attributes.vxfBorder};\n`;
	if (attributes.vxfDetail) vxfeedProps += `  --detail-color: ${attributes.vxfDetail};\n`;

	// Radius values (responsive)
	const xlRadius = getResponsiveValue('xlRadius', attributes, 'px', device);
	if (xlRadius) vxfeedProps += `  --xl-radius: ${xlRadius};\n`;

	const lgRadius = getResponsiveValue('lgRadius', attributes, 'px', device);
	if (lgRadius) vxfeedProps += `  --lg-radius: ${lgRadius};\n`;

	const mdRadius = getResponsiveValue('mdRadius', attributes, 'px', device);
	if (mdRadius) vxfeedProps += `  --md-radius: ${mdRadius};\n`;

	// Icons accordion - Icon sizes (responsive)
	const mainIconSize = getResponsiveValue('mainIconSize', attributes, 'px', device);
	if (mainIconSize) vxfeedProps += `  --main-icon-size: ${mainIconSize};\n`;

	const replyIconSize = getResponsiveValue('replyIconSize', attributes, 'px', device);
	if (replyIconSize) vxfeedProps += `  --reply-icon-size: ${replyIconSize};\n`;

	// Main icon color
	if (attributes.vxfAction1) vxfeedProps += `  --main-icon-color: ${attributes.vxfAction1};\n`;

	// Only output .vxfeed block if there are properties
	if (vxfeedProps) {
		css += `.vxfeed {\n${vxfeedProps}}\n\n`;
	}

	// 1.5. Demofeed wrapper styling
	css += `.demofeed {\n`;
	css += `  width: 100%;\n`;
	css += `  max-width: 600px;\n`;
	css += `  margin: auto;\n`;
	css += `  padding: 20px;\n`;
	css += '}\n\n';

	// 2. General accordion - Box Shadow
	const boxShadowCSS = generateBoxShadowCSS(attributes.vxfShadow);
	if (boxShadowCSS) {
		css += `.vxf-post, .vxf-create-post {\n  ${boxShadowCSS}\n}\n\n`;
	}

	// 3. Icons accordion - Icon state colors (specific selectors)
	if (attributes.vxfAction2) {
		css += `.vxf-liked {\n  --ts-icon-color: ${attributes.vxfAction2};\n}\n\n`;
	}
	if (attributes.vxfAction3) {
		css += `.vxf-reposted {\n  --ts-icon-color: ${attributes.vxfAction3};\n}\n\n`;
	}
	if (attributes.vxfAction4) {
		css += `.vxf-verified {\n  --ts-icon-color: ${attributes.vxfAction4};\n}\n\n`;
	}
	if (attributes.vxfAction5) {
		css += `.rs-stars li .ts-star-icon {\n  --ts-icon-color: ${attributes.vxfAction5};\n}\n\n`;
	}

	// 4. Post reviews accordion - Review categories min width (responsive)
	const revMinWidth = getResponsiveValue('revMinWidth', attributes, '%', device);
	if (revMinWidth) {
		css += `.rev-cats {\n  --max-r-width: ${revMinWidth};\n}\n\n`;
	}

	// 5. Buttons accordion - General section (Typography + Border Radius)
	// Match Voxel's original selectors: .vxfeed .ts-btn (specificity 0-2-0)
	const typoCSS = generateTypographyCSS(attributes.tsPopupBtnTypo, device);
	const btnRadius = getResponsiveValue('tsPopupBtnRadius', attributes, 'px', device);

	if (typoCSS || btnRadius) {
		css += `.vxfeed .ts-btn {\n`;
		if (typoCSS) css += `  ${typoCSS}`;
		if (btnRadius) css += `  border-radius: ${btnRadius};\n`;
		css += '}\n\n';
	}

	// 6. Buttons accordion - Primary Button (Normal) - .ts-btn-1
	// Match Voxel's original selector: .vxfeed .ts-btn-1
	// Only output if there are actual properties to set
	const primaryBorder = generateBorderCSS(
		attributes.tsPopupButton1BorderType,
		attributes.tsPopupButton1BorderWidth,
		attributes.tsPopupButton1BorderColor
	);
	if (attributes.tsPopupButton1 || attributes.tsPopupButton1C || attributes.tsPopupButton1Icon || primaryBorder) {
		css += `.vxfeed .ts-btn-1 {\n`;
		if (attributes.tsPopupButton1) css += `  background: ${attributes.tsPopupButton1};\n`;
		if (attributes.tsPopupButton1C) css += `  color: ${attributes.tsPopupButton1C};\n`;
		if (attributes.tsPopupButton1Icon) css += `  --ts-icon-color: ${attributes.tsPopupButton1Icon};\n`;
		if (primaryBorder) css += `  ${primaryBorder}\n`;
		css += '}\n\n';
	}

	// 7. Buttons accordion - Primary Button (Hover)
	if (attributes.tsPopupButton1H || attributes.tsPopupButton1CH || attributes.tsPopupButton1IconH || attributes.tsPopupButton1BH) {
		css += `.vxfeed .ts-btn-1:hover {\n`;
		if (attributes.tsPopupButton1H) css += `  background: ${attributes.tsPopupButton1H};\n`;
		if (attributes.tsPopupButton1CH) css += `  color: ${attributes.tsPopupButton1CH};\n`;
		if (attributes.tsPopupButton1IconH) css += `  --ts-icon-color: ${attributes.tsPopupButton1IconH};\n`;
		if (attributes.tsPopupButton1BH) css += `  border-color: ${attributes.tsPopupButton1BH};\n`;
		css += '}\n\n';
	}

	// 8. Buttons accordion - Accent Button (Normal) - .ts-btn-2
	const accentBorder = generateBorderCSS(
		attributes.tsPopupButton2BorderType,
		attributes.tsPopupButton2BorderWidth,
		attributes.tsPopupButton2BorderColor
	);
	if (attributes.tsPopupButton2 || attributes.tsPopupButton2C || attributes.tsPopupButton2Icon || accentBorder) {
		css += `.vxfeed .ts-btn-2 {\n`;
		if (attributes.tsPopupButton2) css += `  background: ${attributes.tsPopupButton2};\n`;
		if (attributes.tsPopupButton2C) css += `  color: ${attributes.tsPopupButton2C};\n`;
		if (attributes.tsPopupButton2Icon) css += `  --ts-icon-color: ${attributes.tsPopupButton2Icon};\n`;
		if (accentBorder) css += `  ${accentBorder}\n`;
		css += '}\n\n';
	}

	// 9. Buttons accordion - Accent Button (Hover)
	if (attributes.tsPopupButton2H || attributes.tsPopupButton2CH || attributes.tsPopupButton2IconH || attributes.tsPopupButton2BH) {
		css += `.vxfeed .ts-btn-2:hover {\n`;
		if (attributes.tsPopupButton2H) css += `  background: ${attributes.tsPopupButton2H};\n`;
		if (attributes.tsPopupButton2CH) css += `  color: ${attributes.tsPopupButton2CH};\n`;
		if (attributes.tsPopupButton2IconH) css += `  --ts-icon-color: ${attributes.tsPopupButton2IconH};\n`;
		if (attributes.tsPopupButton2BH) css += `  border-color: ${attributes.tsPopupButton2BH};\n`;
		css += '}\n\n';
	}

	// 10. Buttons accordion - Tertiary Button (Normal) - .ts-btn-4
	if (attributes.tsPopuptertiary2 || attributes.tsPopupTertiary2C || attributes.tsPopupButton3Icon) {
		css += `.vxfeed .ts-btn-4 {\n`;
		if (attributes.tsPopuptertiary2) css += `  background: ${attributes.tsPopuptertiary2};\n`;
		if (attributes.tsPopupTertiary2C) css += `  color: ${attributes.tsPopupTertiary2C};\n`;
		if (attributes.tsPopupButton3Icon) css += `  --ts-icon-color: ${attributes.tsPopupButton3Icon};\n`;
		css += '}\n\n';
	}

	// 11. Buttons accordion - Tertiary Button (Hover)
	if (attributes.tsPopupTertiary2H || attributes.tsPopupTertiary2CH || attributes.tsPopupTertiaryIconH) {
		css += `.vxfeed .ts-btn-4:hover {\n`;
		if (attributes.tsPopupTertiary2H) css += `  background: ${attributes.tsPopupTertiary2H};\n`;
		if (attributes.tsPopupTertiary2CH) css += `  color: ${attributes.tsPopupTertiary2CH};\n`;
		if (attributes.tsPopupTertiaryIconH) css += `  --ts-icon-color: ${attributes.tsPopupTertiaryIconH};\n`;
		css += '}\n\n';
	}

	// 12. Loading spinner accordion - Spinner Colors
	if (attributes.tmColor1 || attributes.tmColor2) {
		css += `.vxfeed .ts-loader {\n`;
		if (attributes.tmColor1) css += `  border-color: ${attributes.tmColor1};\n`;
		if (attributes.tmColor2) css += `  border-bottom-color: ${attributes.tmColor2};\n`;
		css += '}\n\n';
	}

	return css;
}
