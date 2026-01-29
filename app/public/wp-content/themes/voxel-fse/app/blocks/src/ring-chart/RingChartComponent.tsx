import React from 'react';
import type { RingChartComponentProps, CircleGeometry } from './types';

/**
 * Ring Chart Component
 *
 * Matches Voxel widget HTML structure 1:1
 * Used by both editor (edit.tsx) and frontend (frontend.tsx)
 *
 * Voxel source: themes/voxel/templates/widgets/ring-chart.php
 */
export function RingChartComponent({ attributes, isEditor = false }: RingChartComponentProps): JSX.Element {
  // Calculate SVG geometry (matches Voxel PHP calculations)
  const calculateGeometry = (): CircleGeometry => {
    const radius = 100 / (Math.PI * 2); // ≈ 15.915
    const cxcy = radius + attributes.ts_chart_stroke_width / 2;
    const viewBoxSize = cxcy * 2;
    return {
      radius,
      cxcy,
      viewBox: `0 0 ${viewBoxSize} ${viewBoxSize}`,
    };
  };

  const geometry = calculateGeometry();
  const { radius, cxcy, viewBox } = geometry;

  // Generate inline styles for responsive animation duration
  const generateAnimationDurationStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    // Desktop (default)
    if (attributes.ts_chart_animation_duration) {
      style.animationDuration = `${attributes.ts_chart_animation_duration}s`;
    }

    return style;
  };

  // Generate inline styles for typography
  const generateTypographyStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (attributes.chart_value_typography_font_family) {
      style.fontFamily = attributes.chart_value_typography_font_family;
    }
    if (attributes.chart_value_typography_font_size) {
      style.fontSize = attributes.chart_value_typography_font_size;
    }
    if (attributes.chart_value_typography_font_weight) {
      style.fontWeight = attributes.chart_value_typography_font_weight;
    }
    if (attributes.chart_value_typography_line_height) {
      style.lineHeight = attributes.chart_value_typography_line_height;
    }
    if (attributes.chart_value_typography_letter_spacing) {
      style.letterSpacing = attributes.chart_value_typography_letter_spacing;
    }
    if (attributes.chart_value_typography_text_transform) {
      style.textTransform = attributes.chart_value_typography_text_transform as React.CSSProperties['textTransform'];
    }
    if (attributes.chart_value_typography_text_decoration) {
      style.textDecoration = attributes.chart_value_typography_text_decoration;
    }
    if (attributes.ts_chart_value_color) {
      style.color = attributes.ts_chart_value_color;
    }

    return style;
  };

  // Generate wrapper style for justify
  const wrapperStyle: React.CSSProperties = {
    justifyContent: attributes.ts_chart_position,
  };

  const animationStyle = generateAnimationDurationStyle();
  const typographyStyle = generateTypographyStyle();

  /**
   * Re-render vxconfig for frontend hydration
   * CRITICAL: This makes the vxconfig visible in DevTools for debugging
   * Matches pattern from search-form and create-post blocks
   */
  const vxconfig = isEditor ? null : (
    <script
      type="application/json"
      className="vxconfig"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(attributes, null, 2),
      }}
    />
  );

  return (
    <>
      {vxconfig}
      <div className="circle-chart-position">
        <div className="circle-chart-wrapper flexify" style={wrapperStyle}>
          <div className="circle-chart">
            <svg
              className="circle-chart"
              viewBox={viewBox}
              width={attributes.ts_chart_size}
              height={attributes.ts_chart_size}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background circle */}
              <circle
                className="circle-chart__background"
                stroke={attributes.ts_chart_cirle_color}
                strokeWidth={attributes.ts_chart_stroke_width}
                fill="none"
                cx={cxcy}
                cy={cxcy}
                r={radius}
              />
              {/* Animated progress circle */}
              <circle
                className="circle-chart__circle"
                stroke={attributes.ts_chart_fill_color}
                strokeWidth={attributes.ts_chart_stroke_width}
                strokeDasharray={`${attributes.ts_chart_value},100`}
                strokeLinecap="round"
                fill="none"
                cx={cxcy}
                cy={cxcy}
                r={radius}
                style={animationStyle}
              />
            </svg>
            <p className="chart-value" style={typographyStyle}>
              {attributes.ts_chart_value}
              {attributes.ts_chart_value_suffix}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
