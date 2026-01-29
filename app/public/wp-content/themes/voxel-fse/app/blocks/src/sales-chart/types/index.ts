/**
 * Sales Chart Block - Type Definitions
 *
 * TypeScript interfaces for the Sales Chart block.
 * Matches Voxel's Sales Chart widget from Stripe Connect module.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php
 * - Template: themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php
 * - Vendor Stats: themes/voxel/app/modules/stripe-connect/vendor-stats.php
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';
export type { IconValue };

/**
 * Chart time range types
 */
export type ChartRange = 'this-week' | 'this-month' | 'this-year' | 'all-time';

/**
 * Individual chart item (bar data)
 */
export interface ChartItem {
  label: string;
  percent: number;
  earnings: string;
  orders: string | number;
}

/**
 * Chart meta state information
 */
export interface ChartMetaState {
  date: string | null;
  has_next: boolean;
  has_prev: boolean;
  has_activity: boolean;
}

/**
 * Chart meta information
 */
export interface ChartMeta {
  label: string;
  state: ChartMetaState;
}

/**
 * Single chart data structure
 */
export interface ChartData {
  steps: string[];
  items: ChartItem[];
  meta: ChartMeta;
}

/**
 * Charts collection by range
 */
export interface ChartsCollection {
  'this-week': ChartData;
  'this-month': ChartData;
  'this-year': ChartData;
  'all-time': ChartData;
}

/**
 * Sales Chart block attributes
 * Matches Voxel's sales-chart widget controls
 */
export interface SalesChartAttributes {
  // Accordion state persistence
  contentTabOpenPanel?: string;
  styleTabOpenPanel?: string;
  blockId?: string;

  // Content settings
  ts_active_chart: ChartRange;

  // Icons
  chart_icon: IconValue;
  ts_chevron_right: IconValue;
  ts_chevron_left: IconValue;

  // Style Tab - Chart section
  ts_chart_height?: number;
  ts_chart_height_tablet?: number;
  ts_chart_height_mobile?: number;
  ts_axis_typo_col?: string;
  vertical_axis_width?: number;
  vertical_axis_width_tablet?: number;
  vertical_axis_width_mobile?: number;
  chart_col_gap?: number;
  chart_col_gap_tablet?: number;
  chart_col_gap_mobile?: number;
  bar_width?: number;
  bar_width_tablet?: number;
  bar_width_mobile?: number;
  bar_radius?: number;
  bar_radius_tablet?: number;
  bar_radius_mobile?: number;
  bar_bg_hover?: string;
  bar_pop_bg?: string;
  bar_pop_radius?: number;
  bar_pop_radius_tablet?: number;
  bar_pop_radius_mobile?: number;
  ts_primary_color?: string;
  ts_secondary_color?: string;
  chart_line_borderType?: string;
  chart_line_borderWidth?: Record<string, any>;
  chart_line_borderColor?: string;
  bar_pop_borderType?: string;
  bar_pop_borderWidth?: Record<string, any>;
  bar_pop_borderColor?: string;
  axis_typo?: Record<string, any>;
  ts_primary_typo?: Record<string, any>;
  ts_secondary_typo?: Record<string, any>;
  bar_sh_shadow?: Record<string, any>;
  bar_pop_shadow?: Record<string, any>;
  bar_bg?: Record<string, any>;

  // Style Tab - Tabs section
  tabsState?: string;
  ts_tabs_justify?: string;
  ts_tabs_padding?: Record<string, any>;
  ts_tabs_margin?: Record<string, any>;
  ts_tabs_text_color?: string;
  ts_active_text_color?: string;
  ts_tabs_bg_color?: string;
  ts_tabs_bg_active_color?: string;
  ts_tabs_border_active?: string;
  ts_tabs_radius?: number;
  ts_tabs_text_color_h?: string;
  ts_tabs_active_text_color_h?: string;
  ts_tabs_border_color_h?: string;
  ts_tabs_border_h_active?: string;
  ts_tabs_bg_color_h?: string;
  ts_bg_active_color_h?: string;
  ts_tabs_borderType?: string;
  ts_tabs_borderWidth?: Record<string, any>;
  ts_tabs_borderColor?: string;
  ts_tabs_text?: Record<string, any>;
  ts_tabs_text_active?: Record<string, any>;

  // Style Tab - Week buttons section
  weekButtonsState?: string;
  week_range_col?: string;
  ts_week_btn_color?: string;
  ts_week_btn_icon_size?: number;
  ts_week_btn_icon_size_tablet?: number;
  ts_week_btn_icon_size_mobile?: number;
  ts_week_btn_bg?: string;
  ts_week_btn_radius?: number;
  ts_week_btn_radius_tablet?: number;
  ts_week_btn_radius_mobile?: number;
  ts_week_btn_size?: number;
  ts_week_btn_size_tablet?: number;
  ts_week_btn_size_mobile?: number;
  ts_week_btn_h?: string;
  ts_week_btn_bg_h?: string;
  ts_week_border_c_h?: string;
  ts_week_btn_borderType?: string;
  ts_week_btn_borderWidth?: Record<string, any>;
  ts_week_btn_borderColor?: string;
  week_range_typo?: Record<string, any>;

  // Style Tab - No activity section
  ts_nopost_content_Gap?: number;
  ts_nopost_content_Gap_tablet?: number;
  ts_nopost_content_Gap_mobile?: number;
  ts_nopost_ico_size?: number;
  ts_nopost_ico_size_tablet?: number;
  ts_nopost_ico_size_mobile?: number;
  ts_nopost_ico_col?: string;
  ts_nopost_typo_col?: string;
  ts_nopost_typo?: Record<string, any>;

  // Allow indexing for dynamic attribute access
  [key: string]: any;
}

/**
 * VxConfig for frontend hydration
 * Contains all data needed to render the sales chart on frontend
 */
export interface SalesChartVxConfig {
  // Content settings
  activeChart: ChartRange;

  // Icons
  chartIcon: IconValue;
  chevronRight: IconValue;
  chevronLeft: IconValue;

  // Chart data (fetched from API)
  charts: ChartsCollection;
}

/**
 * API config response structure
 */
export interface SalesChartApiConfig {
  charts: ChartsCollection;
}

/**
 * Props for shared SalesChartComponent
 */
export interface SalesChartComponentProps {
  attributes: SalesChartAttributes;
  config: SalesChartApiConfig | null;
  isLoading: boolean;
  error: string | null;
  context: 'editor' | 'frontend';
}

/**
 * Active item for popup display
 */
export interface ActiveItem {
  label: string;
  earnings: string;
  orders: string | number;
}

/**
 * REST API response for sales chart endpoint
 */
export interface SalesChartApiResponse {
  success: boolean;
  data?: {
    charts: ChartsCollection;
  };
  message?: string;
}

/**
 * Load more response structure
 */
export interface LoadMoreResponse {
  success: boolean;
  data?: ChartData;
  message?: string;
}
