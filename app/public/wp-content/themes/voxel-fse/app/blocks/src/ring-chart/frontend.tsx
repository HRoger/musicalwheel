/**
 * Ring Chart Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Renders animated SVG ring chart with configurable value display.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/ring-chart.php (188 lines)
 * - Template: themes/voxel/templates/widgets/ring-chart.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/ring-chart.php (188 lines)
 *
 * CONTENT:
 * ✅ ts_chart_position - Justify alignment (flex-start, center, flex-end)
 * ✅ ts_chart_value - Chart value (number, 0-100)
 * ✅ ts_chart_value_suffix - Value suffix text (e.g., "%")
 * ✅ ts_chart_size - Circle size in pixels (0-300)
 * ✅ ts_chart_stroke_width - Stroke width (0-5)
 * ✅ ts_chart_animation_duration - Animation duration in seconds (responsive, 0-5)
 *
 * CIRCLE STYLE:
 * ✅ ts_chart_cirle_color - Background circle color (default: #efefef)
 * ✅ ts_chart_fill_color - Fill/progress circle color (default: #00acc1)
 *
 * VALUE STYLE:
 * ✅ chart_value_typography - Typography group control
 *   - font_family, font_size (responsive), font_weight
 *   - line_height (responsive), letter_spacing (responsive)
 *   - text_transform, text_decoration
 * ✅ ts_chart_value_color - Value text color
 *
 * SVG STRUCTURE:
 * ✅ viewBox - Dynamic based on size (0 0 {size} {size})
 * ✅ circle.circle-chart__background - Background ring
 * ✅ circle.circle-chart__circle - Animated progress ring
 * ✅ stroke-dasharray - Calculated from circumference
 * ✅ stroke-dashoffset - Calculated from value percentage
 *
 * HTML STRUCTURE:
 * ✅ .circle-chart-wrapper - Outer wrapper with justify alignment
 * ✅ .circle-chart - SVG container
 * ✅ .chart-value - Value text display
 *
 * ANIMATION:
 * ✅ CSS animation on .circle-chart__circle
 * ✅ animation-duration from ts_chart_animation_duration
 * ✅ stroke-dashoffset animation for fill effect
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Pure client-side rendering (createRoot)
 * ✅ TypeScript strict mode
 * ✅ Turbo/PJAX navigation support
 *
 * ============================================================================
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RingChartComponent } from './RingChartComponent';
import type { RingChartAttributes } from './types';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): RingChartAttributes {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	return {
		// Content attributes
		ts_chart_position: normalizeString(
			raw.ts_chart_position ?? raw.chartPosition ?? raw.position,
			'flex-start'
		) as RingChartAttributes['ts_chart_position'],
		ts_chart_value: normalizeNumber(
			raw.ts_chart_value ?? raw.chartValue ?? raw.value,
			0
		),
		ts_chart_value_suffix: normalizeString(
			raw.ts_chart_value_suffix ?? raw.chartValueSuffix ?? raw.valueSuffix ?? raw.suffix,
			''
		),
		ts_chart_size: normalizeNumber(
			raw.ts_chart_size ?? raw.chartSize ?? raw.size,
			100
		),
		ts_chart_stroke_width: normalizeNumber(
			raw.ts_chart_stroke_width ?? raw.chartStrokeWidth ?? raw.strokeWidth,
			2
		),
		// Animation (responsive)
		ts_chart_animation_duration: normalizeNumber(
			raw.ts_chart_animation_duration ?? raw.chartAnimationDuration ?? raw.animationDuration,
			3
		),
		ts_chart_animation_duration_tablet: raw.ts_chart_animation_duration_tablet !== undefined
			? normalizeNumber(raw.ts_chart_animation_duration_tablet, undefined as unknown as number)
			: undefined,
		ts_chart_animation_duration_mobile: raw.ts_chart_animation_duration_mobile !== undefined
			? normalizeNumber(raw.ts_chart_animation_duration_mobile, undefined as unknown as number)
			: undefined,
		// Circle style
		ts_chart_cirle_color: normalizeString(
			raw.ts_chart_cirle_color ?? raw.chartCircleColor ?? raw.circleColor,
			'#efefef'
		),
		ts_chart_fill_color: normalizeString(
			raw.ts_chart_fill_color ?? raw.chartFillColor ?? raw.fillColor,
			'#00acc1'
		),
		// Value style
		ts_chart_value_color: raw.ts_chart_value_color !== undefined
			? normalizeString(raw.ts_chart_value_color, '')
			: raw.chartValueColor !== undefined
				? normalizeString(raw.chartValueColor, '')
				: undefined,
		// Typography (pass through as-is for complex group control)
		chart_value_typography_font_family: raw.chart_value_typography_font_family as string | undefined,
		chart_value_typography_font_size: raw.chart_value_typography_font_size as string | undefined,
		chart_value_typography_font_size_tablet: raw.chart_value_typography_font_size_tablet as string | undefined,
		chart_value_typography_font_size_mobile: raw.chart_value_typography_font_size_mobile as string | undefined,
		chart_value_typography_font_weight: raw.chart_value_typography_font_weight as string | undefined,
		chart_value_typography_line_height: raw.chart_value_typography_line_height as string | undefined,
		chart_value_typography_line_height_tablet: raw.chart_value_typography_line_height_tablet as string | undefined,
		chart_value_typography_line_height_mobile: raw.chart_value_typography_line_height_mobile as string | undefined,
		chart_value_typography_letter_spacing: raw.chart_value_typography_letter_spacing as string | undefined,
		chart_value_typography_letter_spacing_tablet: raw.chart_value_typography_letter_spacing_tablet as string | undefined,
		chart_value_typography_letter_spacing_mobile: raw.chart_value_typography_letter_spacing_mobile as string | undefined,
		chart_value_typography_text_transform: raw.chart_value_typography_text_transform as string | undefined,
		chart_value_typography_text_decoration: raw.chart_value_typography_text_decoration as string | undefined,
	};
}

/**
 * Parse vxconfig JSON from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(block: Element): RingChartAttributes | null {
	const script = block.querySelector('script.vxconfig');
	if (!script || !script.textContent) {
		console.error('[Ring Chart] vxconfig script not found');
		return null;
	}

	try {
		const raw = JSON.parse(script.textContent);
		return normalizeConfig(raw);
	} catch (error) {
		console.error('[Ring Chart] Failed to parse vxconfig:', error);
		return null;
	}
}

/**
 * Initialize a single ring chart block
 */
function initRingChart(block: Element): void {
  // Prevent double-initialization
  if (block.hasAttribute('data-react-mounted')) {
    return;
  }

  const attributes = parseVxConfig(block);
  if (!attributes) {
    return;
  }

  // Mark as mounted before rendering
  block.setAttribute('data-react-mounted', 'true');

  // Mount React component
  const root = createRoot(block);
  root.render(<RingChartComponent attributes={attributes} isEditor={false} />);
}

/**
 * Initialize all ring chart blocks on page
 */
function initAllRingCharts(): void {
  const blocks = document.querySelectorAll('.voxel-fse-ring-chart');
  blocks.forEach((block) => initRingChart(block));
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllRingCharts);
} else {
  initAllRingCharts();
}

/**
 * Support Turbo/PJAX navigation
 */
document.addEventListener('turbo:load', initAllRingCharts);
document.addEventListener('turbo:render', initAllRingCharts);

/**
 * Export for manual initialization if needed
 */
export { initAllRingCharts, initRingChart };
