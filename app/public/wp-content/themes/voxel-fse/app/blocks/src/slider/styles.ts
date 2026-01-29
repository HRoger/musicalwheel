/**
 * Slider Block - Style Generation
 *
 * Generates responsive CSS for Style tab controls targeting Voxel CSS classes.
 * Evidence: themes/voxel/app/widgets/slider.php
 *
 * CSS Selector Mapping:
 * - General (Images): {{WRAPPER}}, {{WRAPPER}} .ts-slider, {{WRAPPER}} .ts-single-slide
 * - Thumbnails: {{WRAPPER}} .ts-slide-nav a
 * - Carousel Navigation: {{WRAPPER}} .post-feed-nav .ts-icon-btn
 *
 * @package VoxelFSE
 */

import type { SliderBlockAttributes } from './types';

/**
 * Generate responsive CSS for slider block
 *
 * Handles three accordion sections:
 * 1. General - Image styling (Normal/Hover)
 * 2. Thumbnails - Thumbnail navigation styling (Normal/Hover)
 * 3. Carousel Navigation - Previous/Next buttons (Normal/Hover)
 */
export function generateSliderResponsiveCSS(
	attributes: SliderBlockAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-slider-${blockId}`;

	// ============================================
	// SECTION 1: GENERAL (Image Styling)
	// Source: slider.php:170-267
	// ============================================

	// Image aspect ratio (Normal)
	// Voxel: slider.php:190 - '{{WRAPPER}} .ts-preview img' => 'aspect-ratio: {{SIZE}};'
	if (attributes.imageAspectRatio) {
		cssRules.push(`${selector} .ts-preview img { aspect-ratio: ${attributes.imageAspectRatio}; }`);
	}
	if (attributes.imageAspectRatio_tablet) {
		tabletRules.push(`${selector} .ts-preview img { aspect-ratio: ${attributes.imageAspectRatio_tablet}; }`);
	}
	if (attributes.imageAspectRatio_mobile) {
		mobileRules.push(`${selector} .ts-preview img { aspect-ratio: ${attributes.imageAspectRatio_mobile}; }`);
	}

	// Border radius (Normal)
	// Voxel: slider.php:210 - '{{WRAPPER}} .ts-slider, {{WRAPPER}} .ts-single-slide' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.imageBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-slider, ${selector} .ts-single-slide { border-radius: ${attributes.imageBorderRadius}px; }`);
	}
	if (attributes.imageBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-slider, ${selector} .ts-single-slide { border-radius: ${attributes.imageBorderRadius_tablet}px; }`);
	}
	if (attributes.imageBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-slider, ${selector} .ts-single-slide { border-radius: ${attributes.imageBorderRadius_mobile}px; }`);
	}

	// Opacity (Normal)
	// Voxel: slider.php:229 - '{{WRAPPER}}' => 'opacity: {{SIZE}};'
	if (attributes.imageOpacity !== undefined) {
		cssRules.push(`${selector} { opacity: ${attributes.imageOpacity}; }`);
	}
	if (attributes.imageOpacity_tablet !== undefined) {
		tabletRules.push(`${selector} { opacity: ${attributes.imageOpacity_tablet}; }`);
	}
	if (attributes.imageOpacity_mobile !== undefined) {
		mobileRules.push(`${selector} { opacity: ${attributes.imageOpacity_mobile}; }`);
	}

	// Opacity (Hover)
	// Voxel: slider.php:260 - '{{WRAPPER}}:hover' => 'opacity: {{SIZE}};'
	if (attributes.imageOpacityHover !== undefined) {
		cssRules.push(`${selector}:hover { opacity: ${attributes.imageOpacityHover}; }`);
	}
	if (attributes.imageOpacityHover_tablet !== undefined) {
		tabletRules.push(`${selector}:hover { opacity: ${attributes.imageOpacityHover_tablet}; }`);
	}
	if (attributes.imageOpacityHover_mobile !== undefined) {
		mobileRules.push(`${selector}:hover { opacity: ${attributes.imageOpacityHover_mobile}; }`);
	}

	// ============================================
	// SECTION 2: THUMBNAILS
	// Source: slider.php:271-385
	// ============================================

	// Thumbnail size (Normal)
	// Voxel: slider.php:307 - '{{WRAPPER}} .ts-slide-nav a' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.thumbnailSize !== undefined) {
		cssRules.push(`${selector} .ts-slide-nav a { width: ${attributes.thumbnailSize}px; height: ${attributes.thumbnailSize}px; }`);
	}
	if (attributes.thumbnailSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-slide-nav a { width: ${attributes.thumbnailSize_tablet}px; height: ${attributes.thumbnailSize_tablet}px; }`);
	}
	if (attributes.thumbnailSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-slide-nav a { width: ${attributes.thumbnailSize_mobile}px; height: ${attributes.thumbnailSize_mobile}px; }`);
	}

	// Thumbnail border radius (Normal)
	// Voxel: slider.php:326 - '{{WRAPPER}} .ts-slide-nav a' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.thumbnailBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-slide-nav a { border-radius: ${attributes.thumbnailBorderRadius}px; }`);
	}
	if (attributes.thumbnailBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-slide-nav a { border-radius: ${attributes.thumbnailBorderRadius_tablet}px; }`);
	}
	if (attributes.thumbnailBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-slide-nav a { border-radius: ${attributes.thumbnailBorderRadius_mobile}px; }`);
	}

	// Thumbnail opacity (Normal)
	// Voxel: slider.php:345 - '{{WRAPPER}} .ts-slide-nav a' => 'opacity: {{SIZE}};'
	if (attributes.thumbnailOpacity !== undefined) {
		cssRules.push(`${selector} .ts-slide-nav a { opacity: ${attributes.thumbnailOpacity}; }`);
	}
	if (attributes.thumbnailOpacity_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-slide-nav a { opacity: ${attributes.thumbnailOpacity_tablet}; }`);
	}
	if (attributes.thumbnailOpacity_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-slide-nav a { opacity: ${attributes.thumbnailOpacity_mobile}; }`);
	}

	// Thumbnail opacity (Hover)
	// Voxel: slider.php:376 - '{{WRAPPER}} .ts-slide-nav a:hover' => 'opacity: {{SIZE}};'
	if (attributes.thumbnailOpacityHover !== undefined) {
		cssRules.push(`${selector} .ts-slide-nav a:hover { opacity: ${attributes.thumbnailOpacityHover}; }`);
	}
	if (attributes.thumbnailOpacityHover_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-slide-nav a:hover { opacity: ${attributes.thumbnailOpacityHover_tablet}; }`);
	}
	if (attributes.thumbnailOpacityHover_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-slide-nav a:hover { opacity: ${attributes.thumbnailOpacityHover_mobile}; }`);
	}

	// ============================================
	// SECTION 3: CAROUSEL NAVIGATION
	// Source: slider.php:386-686
	// ============================================

	// Horizontal position (Normal)
	// Voxel: slider.php:422-424 - '{{WRAPPER}} .post-feed-nav li:last-child' => 'margin-right: {{SIZE}}{{UNIT}};'
	// Voxel: slider.php:424 - '{{WRAPPER}} .post-feed-nav li:first-child' => 'margin-left: {{SIZE}}{{UNIT}};'
	if (attributes.navHorizontalPosition !== undefined) {
		cssRules.push(
			`${selector} .post-feed-nav li:last-child { margin-right: ${attributes.navHorizontalPosition}px; }`,
			`${selector} .post-feed-nav li:first-child { margin-left: ${attributes.navHorizontalPosition}px; }`
		);
	}
	if (attributes.navHorizontalPosition_tablet !== undefined) {
		tabletRules.push(
			`${selector} .post-feed-nav li:last-child { margin-right: ${attributes.navHorizontalPosition_tablet}px; }`,
			`${selector} .post-feed-nav li:first-child { margin-left: ${attributes.navHorizontalPosition_tablet}px; }`
		);
	}
	if (attributes.navHorizontalPosition_mobile !== undefined) {
		mobileRules.push(
			`${selector} .post-feed-nav li:last-child { margin-right: ${attributes.navHorizontalPosition_mobile}px; }`,
			`${selector} .post-feed-nav li:first-child { margin-left: ${attributes.navHorizontalPosition_mobile}px; }`
		);
	}

	// Vertical position (Normal)
	// Voxel: slider.php:443 - '{{WRAPPER}} .post-feed-nav li' => 'margin-top: {{SIZE}}{{UNIT}};'
	if (attributes.navVerticalPosition !== undefined) {
		cssRules.push(`${selector} .post-feed-nav li { margin-top: ${attributes.navVerticalPosition}px; }`);
	}
	if (attributes.navVerticalPosition_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav li { margin-top: ${attributes.navVerticalPosition_tablet}px; }`);
	}
	if (attributes.navVerticalPosition_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav li { margin-top: ${attributes.navVerticalPosition_mobile}px; }`);
	}

	// Button icon color (Normal)
	// Voxel: slider.php:460-461 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn i' => 'color: {{VALUE}}'
	// Voxel: slider.php:461 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn svg' => 'fill: {{VALUE}}'
	if (attributes.navButtonIconColor) {
		cssRules.push(
			`${selector} .post-feed-nav .ts-icon-btn i { color: ${attributes.navButtonIconColor}; }`,
			`${selector} .post-feed-nav .ts-icon-btn svg { fill: ${attributes.navButtonIconColor}; }`
		);
	}

	// Button size (Normal)
	// Voxel: slider.php:485 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.navButtonSize !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.navButtonSize}px; height: ${attributes.navButtonSize}px; }`);
	}
	if (attributes.navButtonSize_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.navButtonSize_tablet}px; height: ${attributes.navButtonSize_tablet}px; }`);
	}
	if (attributes.navButtonSize_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { width: ${attributes.navButtonSize_mobile}px; height: ${attributes.navButtonSize_mobile}px; }`);
	}

	// Button icon size (Normal)
	// Voxel: slider.php:508-509 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn i' => 'font-size: {{SIZE}}{{UNIT}};'
	// Voxel: slider.php:509 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.navButtonIconSize !== undefined) {
		cssRules.push(
			`${selector} .post-feed-nav .ts-icon-btn i { font-size: ${attributes.navButtonIconSize}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn svg { width: ${attributes.navButtonIconSize}px; height: ${attributes.navButtonIconSize}px; }`
		);
	}
	if (attributes.navButtonIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .post-feed-nav .ts-icon-btn i { font-size: ${attributes.navButtonIconSize_tablet}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn svg { width: ${attributes.navButtonIconSize_tablet}px; height: ${attributes.navButtonIconSize_tablet}px; }`
		);
	}
	if (attributes.navButtonIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .post-feed-nav .ts-icon-btn i { font-size: ${attributes.navButtonIconSize_mobile}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn svg { width: ${attributes.navButtonIconSize_mobile}px; height: ${attributes.navButtonIconSize_mobile}px; }`
		);
	}

	// Button background (Normal)
	// Voxel: slider.php:520 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn' => 'background-color: {{VALUE}}'
	if (attributes.navButtonBackground) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { background-color: ${attributes.navButtonBackground}; }`);
	}

	// Backdrop blur (Normal)
	// Voxel: slider.php:541 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn' => 'backdrop-filter: blur({{SIZE}}{{UNIT}});'
	if (attributes.navBackdropBlur !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur(${attributes.navBackdropBlur}px); }`);
	}
	if (attributes.navBackdropBlur_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur(${attributes.navBackdropBlur_tablet}px); }`);
	}
	if (attributes.navBackdropBlur_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur(${attributes.navBackdropBlur_mobile}px); }`);
	}

	// Border (Normal)
	// Voxel: slider.php:553 - Border group control targeting '{{WRAPPER}} .post-feed-nav .ts-icon-btn'
	if (attributes.navBorderType && attributes.navBorderType !== 'none') {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-style: ${attributes.navBorderType}; }`);

		if (attributes.navBorderColor) {
			cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-color: ${attributes.navBorderColor}; }`);
		}

		// Border width (default to 1px if not specified)
		const borderWidth = attributes.navBorderWidth !== undefined ? `${attributes.navBorderWidth}px` : '1px';
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-width: ${borderWidth}; }`);
	}

	// Button border radius (Normal)
	// Voxel: slider.php:575 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.navButtonBorderRadius !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.navButtonBorderRadius}px; }`);
	}
	if (attributes.navButtonBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.navButtonBorderRadius_tablet}px; }`);
	}
	if (attributes.navButtonBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn { border-radius: ${attributes.navButtonBorderRadius_mobile}px; }`);
	}

	// Button size (Hover)
	// Voxel: slider.php:614 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.navButtonSizeHover !== undefined) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.navButtonSizeHover}px; height: ${attributes.navButtonSizeHover}px; }`);
	}
	if (attributes.navButtonSizeHover_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.navButtonSizeHover_tablet}px; height: ${attributes.navButtonSizeHover_tablet}px; }`);
	}
	if (attributes.navButtonSizeHover_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { width: ${attributes.navButtonSizeHover_mobile}px; height: ${attributes.navButtonSizeHover_mobile}px; }`);
	}

	// Button icon size (Hover)
	// Voxel: slider.php:637-638 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover i' => 'font-size: {{SIZE}}{{UNIT}};'
	// Voxel: slider.php:638 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.navButtonIconSizeHover !== undefined) {
		cssRules.push(
			`${selector} .post-feed-nav .ts-icon-btn:hover i { font-size: ${attributes.navButtonIconSizeHover}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn:hover svg { width: ${attributes.navButtonIconSizeHover}px; height: ${attributes.navButtonIconSizeHover}px; }`
		);
	}
	if (attributes.navButtonIconSizeHover_tablet !== undefined) {
		tabletRules.push(
			`${selector} .post-feed-nav .ts-icon-btn:hover i { font-size: ${attributes.navButtonIconSizeHover_tablet}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn:hover svg { width: ${attributes.navButtonIconSizeHover_tablet}px; height: ${attributes.navButtonIconSizeHover_tablet}px; }`
		);
	}
	if (attributes.navButtonIconSizeHover_mobile !== undefined) {
		mobileRules.push(
			`${selector} .post-feed-nav .ts-icon-btn:hover i { font-size: ${attributes.navButtonIconSizeHover_mobile}px; }`,
			`${selector} .post-feed-nav .ts-icon-btn:hover svg { width: ${attributes.navButtonIconSizeHover_mobile}px; height: ${attributes.navButtonIconSizeHover_mobile}px; }`
		);
	}

	// Button icon color (Hover)
	// Voxel: slider.php:649-650 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover i' => 'color: {{VALUE}};'
	// Voxel: slider.php:650 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover svg' => 'fill: {{VALUE}};'
	if (attributes.navButtonIconColorHover) {
		cssRules.push(
			`${selector} .post-feed-nav .ts-icon-btn:hover i { color: ${attributes.navButtonIconColorHover}; }`,
			`${selector} .post-feed-nav .ts-icon-btn:hover svg { fill: ${attributes.navButtonIconColorHover}; }`
		);
	}

	// Button background color (Hover)
	// Voxel: slider.php:662 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover' => 'background-color: {{VALUE}};'
	if (attributes.navButtonBackgroundHover) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { background-color: ${attributes.navButtonBackgroundHover}; }`);
	}

	// Button border color (Hover)
	// Voxel: slider.php:675 - '{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover' => 'border-color: {{VALUE}};'
	if (attributes.navBorderColorHover) {
		cssRules.push(`${selector} .post-feed-nav .ts-icon-btn:hover { border-color: ${attributes.navBorderColorHover}; }`);
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
