/**
 * Ring Chart Block Attributes
 *
 * Matches Voxel Ring Chart widget configuration
 */
export interface RingChartAttributes {
  // Inspector state
  activeTab?: string;

  // Content attributes
  ts_chart_position: 'flex-start' | 'center' | 'flex-end';
  ts_chart_value: number;
  ts_chart_value_suffix: string;
  ts_chart_size: number;
  ts_chart_stroke_width: number;

  // Responsive animation duration
  ts_chart_animation_duration: number;
  ts_chart_animation_duration_tablet?: number;
  ts_chart_animation_duration_mobile?: number;

  // Style attributes
  ts_chart_cirle_color: string;
  ts_chart_fill_color: string;
  ts_chart_value_color?: string;

  // Typography attributes (responsive)
  chart_value_typography_font_family?: string;
  chart_value_typography_font_size?: string;
  chart_value_typography_font_size_tablet?: string;
  chart_value_typography_font_size_mobile?: string;
  chart_value_typography_font_weight?: string;
  chart_value_typography_line_height?: string;
  chart_value_typography_line_height_tablet?: string;
  chart_value_typography_line_height_mobile?: string;
  chart_value_typography_letter_spacing?: string;
  chart_value_typography_letter_spacing_tablet?: string;
  chart_value_typography_letter_spacing_mobile?: string;
  chart_value_typography_text_transform?: string;
  chart_value_typography_text_decoration?: string;
}

/**
 * SVG Circle Calculations
 *
 * Matches Voxel widget's SVG geometry
 */
export interface CircleGeometry {
  radius: number;
  cxcy: number;
  viewBox: string;
}

/**
 * Ring Chart Component Props
 */
export interface RingChartComponentProps {
  attributes: RingChartAttributes;
  isEditor?: boolean;
}
