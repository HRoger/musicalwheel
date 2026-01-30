/**
 * Sales Chart Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from the save.tsx output.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * Evidence:
 * - Widget: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php (1066 lines)
 * - Template: themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php
 * - Vendor Stats: themes/voxel/app/modules/stripe-connect/vendor-stats.php
 * - Script: vx:vendor-stats.js
 * - Style: vx:bar-chart.css
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: Voxel sales-chart-widget.php (Sales chart VX widget - Stripe Connect)
 *
 * CHART SETTINGS (Content Tab):
 * ✅ ts_active_chart - Default view (this-week/this-month/this-year/all-time)
 *
 * ICONS (Content Tab):
 * ✅ chart_icon - Chart icon
 * ✅ ts_chevron_right - Right chevron icon
 * ✅ ts_chevron_left - Left chevron icon
 *
 * CHART (Style Tab):
 * ✅ ts_chart_height - Content height (responsive slider)
 * ✅ axis_typo - Axis typography (group control)
 * ✅ ts_axis_typo_col - Axis text color
 * ✅ vertical_axis_width - Vertical axis width (responsive slider)
 * ✅ chart_line_border - Chart lines border (group control)
 * ✅ chart_col_gap - Bar gap (responsive slider)
 * ✅ bar_width - Bar width (responsive slider)
 * ✅ bar_radius - Bar radius (responsive slider)
 * ✅ bar_bg - Bar background (group control, supports gradient)
 * ✅ bar_bg_hover - Bar background hover color
 * ✅ bar_sh_shadow - Bar box shadow (group control)
 *
 * BAR POPUP:
 * ✅ bar_pop_bg - Popup background color
 * ✅ bar_pop_border - Popup border (group control)
 * ✅ bar_pop_radius - Popup border radius
 * ✅ bar_pop_shadow - Popup box shadow (group control)
 * ✅ ts_primary_typo - Popup value typography (group control)
 * ✅ ts_primary_color - Popup value text color
 * ✅ ts_secondary_typo - Popup label typography (group control)
 * ✅ ts_secondary_color - Popup label text color
 *
 * TABS - NORMAL (Style Tab):
 * ✅ ts_tabs_justify - Tab justify (select)
 * ✅ ts_tabs_padding - Tab padding (dimensions)
 * ✅ ts_tabs_margin - Tab margin (dimensions)
 * ✅ ts_tabs_text - Tab typography (group control)
 * ✅ ts_tabs_text_active - Active tab typography (group control)
 * ✅ ts_tabs_text_color - Tab text color
 * ✅ ts_active_text_color - Active tab text color
 * ✅ ts_tabs_bg_color - Tab background color
 * ✅ ts_tabs_bg_active_color - Active tab background
 * ✅ ts_tabs_border - Tab border (group control)
 * ✅ ts_tabs_border_active - Active tab border color
 * ✅ ts_tabs_radius - Tab border radius
 *
 * TABS - HOVER:
 * ✅ ts_tabs_text_color_h - Text color hover
 * ✅ ts_tabs_active_text_color_h - Active text color hover
 * ✅ ts_tabs_border_color_h - Border color hover
 * ✅ ts_tabs_border_h_active - Active border color hover
 * ✅ ts_tabs_bg_color_h - Background color hover
 * ✅ ts_bg_active_color_h - Active background hover
 *
 * NEXT/PREV WEEK - NORMAL (Style Tab):
 * ✅ week_range_typo - Range typography (group control)
 * ✅ week_range_col - Range text color
 * ✅ ts_week_btn_color - Button icon color
 * ✅ ts_week_btn_icon_size - Button icon size (responsive)
 * ✅ ts_week_btn_bg - Button background
 * ✅ ts_week_btn_border - Button border (group control)
 * ✅ ts_week_btn_radius - Button border radius (responsive)
 * ✅ ts_week_btn_size - Button size (responsive)
 *
 * NEXT/PREV WEEK - HOVER:
 * ✅ ts_week_btn_h - Button icon color hover
 * ✅ ts_week_btn_bg_h - Button background hover
 * ✅ ts_week_border_c_h - Button border color hover
 *
 * NO ACTIVITY (Style Tab):
 * ✅ ts_nopost_content_Gap - Content gap (responsive slider)
 * ✅ ts_nopost_ico_size - Icon size (responsive slider)
 * ✅ ts_nopost_ico_col - Icon color
 * ✅ ts_nopost_typo - Typography (group control)
 * ✅ ts_nopost_typo_col - Text color
 *
 * HTML STRUCTURE:
 * ✅ .ts-chart - Chart container
 * ✅ .ts-generic-tabs - Timeframe tabs
 * ✅ .ts-tab-active - Active tab state
 * ✅ .chart-content - Chart content area
 * ✅ .bar-item - Individual bar
 * ✅ .bar-item-data - Bar popup/tooltip
 * ✅ .bar-values - Y-axis values
 * ✅ .ts-chart-nav - Navigation container
 * ✅ .ts-icon-btn - Navigation buttons
 * ✅ .ts-no-posts - No activity state
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ REST API data fetching with nonce
 * ✅ Multisite support via getRestBaseUrl()
 *
 * ============================================================================
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SalesChartComponent } from './SalesChartComponent';
import type {
  SalesChartAttributes,
  SalesChartApiConfig,
  SalesChartVxConfig,
  ChartRange,
  ChartItem,
  ChartMeta,
  ChartMetaState,
  ChartData,
  ChartsCollection,
} from './types';
import type { IconValue } from '@shared/types';

/**
 * Normalize config from various API sources
 *
 * This function handles both vxconfig (from save.tsx) and REST API formats,
 * ensuring consistent data structure for the React component regardless of source.
 *
 * Supports:
 * - camelCase (JavaScript convention)
 * - snake_case (PHP/REST API convention)
 * - ts_* prefixed names (Voxel Elementor convention)
 */
function normalizeConfig(
  raw: Record<string, unknown>
): Omit<SalesChartVxConfig, 'charts'> {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
  };

  // Helper for ChartRange normalization
  const normalizeChartRange = (val: unknown): ChartRange => {
    const validRanges: ChartRange[] = [
      'this-week',
      'this-month',
      'this-year',
      'all-time',
    ];
    if (typeof val === 'string' && validRanges.includes(val as ChartRange)) {
      return val as ChartRange;
    }
    return 'this-week'; // Default
  };

  // Helper for IconValue normalization
  const normalizeIcon = (val: unknown): IconValue => {
    const icon = (val && typeof val === 'object' ? val : {}) as Record<
      string,
      unknown
    >;
    return {
      library: normalizeString(icon.library, ''),
      value: normalizeString(icon.value, ''),
    };
  };

  // Build normalized config
  // Support both camelCase and snake_case/ts_* prefixed names
  return {
    activeChart: normalizeChartRange(
      raw.activeChart ?? raw.active_chart ?? raw.ts_active_chart
    ),
    chartIcon: normalizeIcon(raw.chartIcon ?? raw.chart_icon),
    chevronRight: normalizeIcon(
      raw.chevronRight ?? raw.chevron_right ?? raw.ts_chevron_right
    ),
    chevronLeft: normalizeIcon(
      raw.chevronLeft ?? raw.chevron_left ?? raw.ts_chevron_left
    ),
  };
}

/**
 * Normalize chart data from API response
 *
 * Handles the charts collection returned from REST API,
 * ensuring consistent data structure for all chart ranges.
 */
function normalizeChartsData(
  raw: Record<string, unknown>
): ChartsCollection | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

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
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  // Helper for boolean normalization
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === 'yes' || val === '1' || val === 1 || val === 'true')
      return true;
    if (val === 'no' || val === '0' || val === 0 || val === 'false')
      return false;
    return fallback;
  };

  // Helper for ChartItem normalization
  const normalizeChartItem = (val: unknown): ChartItem => {
    const item = (val && typeof val === 'object' ? val : {}) as Record<
      string,
      unknown
    >;
    return {
      label: normalizeString(item.label, ''),
      percent: normalizeNumber(item.percent, 0),
      earnings: normalizeString(item.earnings, '$0.00'),
      orders: item.orders !== undefined ? item.orders as string | number : 0,
    };
  };

  // Helper for ChartMetaState normalization
  const normalizeMetaState = (val: unknown): ChartMetaState => {
    const state = (val && typeof val === 'object' ? val : {}) as Record<
      string,
      unknown
    >;
    return {
      date:
        state.date !== null && state.date !== undefined
          ? normalizeString(state.date, null as unknown as string)
          : null,
      has_next: normalizeBoolean(state.has_next ?? state.hasNext, false),
      has_prev: normalizeBoolean(state.has_prev ?? state.hasPrev, false),
      has_activity: normalizeBoolean(
        state.has_activity ?? state.hasActivity,
        false
      ),
    };
  };

  // Helper for ChartMeta normalization
  const normalizeChartMeta = (val: unknown): ChartMeta => {
    const meta = (val && typeof val === 'object' ? val : {}) as Record<
      string,
      unknown
    >;
    return {
      label: normalizeString(meta.label, ''),
      state: normalizeMetaState(meta.state),
    };
  };

  // Helper for ChartData normalization
  const normalizeChartData = (val: unknown): ChartData => {
    const data = (val && typeof val === 'object' ? val : {}) as Record<
      string,
      unknown
    >;

    // Normalize items array
    let items: ChartItem[] = [];
    if (Array.isArray(data.items)) {
      items = data.items.map(normalizeChartItem);
    }

    // Normalize steps array
    let steps: string[] = [];
    if (Array.isArray(data.steps)) {
      steps = data.steps.map((s) => normalizeString(s, ''));
    }

    return {
      steps,
      items,
      meta: normalizeChartMeta(data.meta),
    };
  };

  // Create default chart data for missing ranges
  const defaultChartData: ChartData = {
    steps: [],
    items: [],
    meta: {
      label: '',
      state: {
        date: null,
        has_next: false,
        has_prev: false,
        has_activity: false,
      },
    },
  };

  // Normalize all chart ranges
  const charts = raw as Record<string, unknown>;
  return {
    'this-week': charts['this-week']
      ? normalizeChartData(charts['this-week'])
      : { ...defaultChartData },
    'this-month': charts['this-month']
      ? normalizeChartData(charts['this-month'])
      : { ...defaultChartData },
    'this-year': charts['this-year']
      ? normalizeChartData(charts['this-year'])
      : { ...defaultChartData },
    'all-time': charts['all-time']
      ? normalizeChartData(charts['all-time'])
      : { ...defaultChartData },
  };
}

/**
 * Parse vxconfig JSON from script tag
 */
function parseVxConfig(
  block: Element
): Omit<SalesChartVxConfig, 'charts'> | null {
  const script = block.querySelector('script.vxconfig');
  if (!script || !script.textContent) {
    console.error('[SalesChart] vxconfig script not found');
    return null;
  }

  try {
    const raw = JSON.parse(script.textContent) as Record<string, unknown>;
    return normalizeConfig(raw);
  } catch (error) {
    console.error('[SalesChart] Failed to parse vxconfig:', error);
    return null;
  }
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(
  vxConfig: Omit<SalesChartVxConfig, 'charts'>
): SalesChartAttributes {
  return {
    ts_active_chart: vxConfig.activeChart as ChartRange,
    chart_icon: vxConfig.chartIcon,
    ts_chevron_right: vxConfig.chevronRight,
    ts_chevron_left: vxConfig.chevronLeft,
  };
}

/**
 * Get wpApiSettings from window (localized by Block_Loader.php)
 */
interface WpApiSettings {
  root?: string;
  nonce?: string;
}

declare global {
  interface Window {
    wpApiSettings?: WpApiSettings;
  }
}

import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Voxel global types for alert and config
 * Matches: Voxel.alert(message, type) and Voxel_Config.l10n.ajaxError
 */
interface VoxelGlobals {
  Voxel?: {
    alert?: (message: string, type: 'error' | 'success') => void;
  };
  Voxel_Config?: {
    l10n?: {
      ajaxError?: string;
    };
  };
}

/**
 * Show Voxel alert notification
 * Matches Voxel parity: Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error")
 * Reference: voxel-vendor-stats.beautified.js line 133
 */
function showVoxelAlert(message?: string, type: 'error' | 'success' = 'error'): void {
  const win = window as unknown as VoxelGlobals;
  const fallbackMessage = win.Voxel_Config?.l10n?.ajaxError || 'An error occurred';
  const alertMessage = message || fallbackMessage;

  if (win.Voxel?.alert) {
    win.Voxel.alert(alertMessage, type);
  } else {
    // Fallback to console when Voxel is not available
    if (type === 'error') {
      console.error('[SalesChart]', alertMessage);
    } else {
      console.log('[SalesChart]', alertMessage);
    }
  }
}

/**
 * Fetch chart data from REST API
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
async function fetchChartData(): Promise<SalesChartApiConfig | null> {
  try {
    const wpApiSettings = window.wpApiSettings || {};
    // MULTISITE FIX: Use getRestBaseUrl() for proper multisite support
    const restUrl = getRestBaseUrl();
    const nonce = wpApiSettings.nonce || '';

    // Build headers with nonce for WordPress REST API authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add nonce header if available (required for cookie authentication)
    if (nonce) {
      headers['X-WP-Nonce'] = nonce;
    }

    // Include credentials to send auth cookies for authenticated endpoint
    const response = await fetch(`${restUrl}voxel-fse/v1/sales-chart`, {
      credentials: 'same-origin',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as SalesChartApiConfig;
  } catch (error) {
    // Use Voxel.alert() for error display (Voxel parity: line 133)
    const errorMessage = error instanceof Error ? error.message : undefined;
    showVoxelAlert(errorMessage, 'error');
    return null;
  }
}

/**
 * Initialize a single sales chart block
 */
async function initSalesChart(block: Element): Promise<void> {
  // Prevent double-initialization
  if (block.hasAttribute('data-react-mounted')) {
    return;
  }

  const vxConfig = parseVxConfig(block);
  if (!vxConfig) {
    return;
  }

  // Mark as mounted before rendering
  block.setAttribute('data-react-mounted', 'true');

  const attributes = buildAttributes(vxConfig);

  // Initial render with loading state
  const root = createRoot(block);
  root.render(
    <SalesChartComponent
      attributes={attributes}
      config={null}
      isLoading={true}
      error={null}
      context="frontend"
    />
  );

  // Fetch chart data
  const config = await fetchChartData();

  // Re-render with data
  // Note: Errors are handled via Voxel.alert() in fetchChartData(), not inline UI
  root.render(
    <SalesChartComponent
      attributes={attributes}
      config={config}
      isLoading={false}
      error={null}
      context="frontend"
    />
  );
}

/**
 * Initialize all sales chart blocks on page
 */
function initAllSalesCharts(): void {
  const blocks = document.querySelectorAll('.voxel-fse-sales-chart');
  blocks.forEach((block) => {
    initSalesChart(block);
  });
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllSalesCharts);
} else {
  initAllSalesCharts();
}

/**
 * Support Turbo/PJAX navigation
 */
document.addEventListener('turbo:load', initAllSalesCharts);
document.addEventListener('turbo:render', initAllSalesCharts);

/**
 * Support Voxel's markup update event
 */
document.addEventListener('voxel:markup-update', initAllSalesCharts);

/**
 * Export for manual initialization if needed
 */
export { initAllSalesCharts, initSalesChart };
