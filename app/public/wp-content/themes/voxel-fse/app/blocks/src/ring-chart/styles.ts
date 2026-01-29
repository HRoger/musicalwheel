/**
 * Ring Chart Block - Responsive CSS Generation
 *
 * Handles responsive CSS for:
 * - Animation duration (Content tab)
 * - Typography (Style tab - font size, line height, letter spacing)
 *
 * Matches Voxel's responsive control pattern from ring-chart.php
 *
 * @package VoxelFSE
 */

import type { RingChartAttributes } from './types';

/**
 * Generate responsive CSS for ring chart block
 *
 * Handles:
 * - Animation duration (tablet/mobile) - Content tab
 * - Typography (font size, line height, letter spacing) - Style tab
 *
 * Desktop values are handled as inline styles in RingChartComponent
 *
 * @param attributes - Block attributes
 * @param blockId - Unique block identifier for scoped selector
 * @returns CSS string with media queries
 */
export function generateRingChartResponsiveCSS(
	attributes: RingChartAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-ring-chart-${blockId}`;

	// ============================================
	// CONTENT TAB - Animation Duration (Responsive)
	// Voxel source: ring-chart.php:97-110
	// Selector: '{{WRAPPER}} .circle-chart__circle'
	// ============================================

	// Desktop value is handled as inline style in RingChartComponent
	// Only need to generate CSS for tablet/mobile overrides

	// Tablet
	if (attributes.ts_chart_animation_duration_tablet !== undefined) {
		tabletRules.push(
			`${selector} .circle-chart__circle { animation-duration: ${attributes.ts_chart_animation_duration_tablet}s; }`
		);
	}

	// Mobile
	if (attributes.ts_chart_animation_duration_mobile !== undefined) {
		mobileRules.push(
			`${selector} .circle-chart__circle { animation-duration: ${attributes.ts_chart_animation_duration_mobile}s; }`
		);
	}

	// ============================================
	// STYLE TAB - Value Typography (Responsive)
	// Voxel source: ring-chart.php:151-156
	// Selector: '{{WRAPPER}} .circle-chart .chart-value'
	// ============================================

	// Font size - Tablet
	if (attributes.chart_value_typography_font_size_tablet) {
		tabletRules.push(
			`${selector} .circle-chart .chart-value { font-size: ${attributes.chart_value_typography_font_size_tablet}; }`
		);
	}

	// Font size - Mobile
	if (attributes.chart_value_typography_font_size_mobile) {
		mobileRules.push(
			`${selector} .circle-chart .chart-value { font-size: ${attributes.chart_value_typography_font_size_mobile}; }`
		);
	}

	// Line height - Tablet
	if (attributes.chart_value_typography_line_height_tablet) {
		tabletRules.push(
			`${selector} .circle-chart .chart-value { line-height: ${attributes.chart_value_typography_line_height_tablet}; }`
		);
	}

	// Line height - Mobile
	if (attributes.chart_value_typography_line_height_mobile) {
		mobileRules.push(
			`${selector} .circle-chart .chart-value { line-height: ${attributes.chart_value_typography_line_height_mobile}; }`
		);
	}

	// Letter spacing - Tablet
	if (attributes.chart_value_typography_letter_spacing_tablet) {
		tabletRules.push(
			`${selector} .circle-chart .chart-value { letter-spacing: ${attributes.chart_value_typography_letter_spacing_tablet}; }`
		);
	}

	// Letter spacing - Mobile
	if (attributes.chart_value_typography_letter_spacing_mobile) {
		mobileRules.push(
			`${selector} .circle-chart .chart-value { letter-spacing: ${attributes.chart_value_typography_letter_spacing_mobile}; }`
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
