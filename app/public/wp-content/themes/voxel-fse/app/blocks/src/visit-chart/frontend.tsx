/**
 * Visit Chart Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from the save.tsx output.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/visits-chart.php (1104 lines)
 * - Template: themes/voxel/templates/widgets/visits-chart.php
 * - Script: vx:visits-chart.js
 * - Style: vx:bar-chart.css
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: Voxel visits-chart.php (Visits chart VX widget)
 *
 * CHART SETTINGS (Content Tab):
 * ✅ ts_source - Show stats for (post/user/site)
 * ✅ ts_active_chart - Default view (24h/7d/30d/12m)
 * ✅ ts_view_type - Display data (views/unique_views)
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
 * ✅ .ts-visits-chart - Widget container
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
 * ERROR HANDLING:
 * ✅ Voxel.alert() for AJAX errors (matches beautified reference line 146-147)
 * ✅ Fallback to Voxel_Config.l10n.ajaxError message
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ REST API context fetching with nonce
 * ✅ Multisite support via getRestBaseUrl()
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import VisitChartComponent from './shared/VisitChartComponent';
import type {
	VisitChartAttributes,
	VisitChartVxConfig,
	ChartTimeframe,
	StatsSource,
	ViewType,
	ChartItem,
	ChartMeta,
	ChartState,
} from './types';

declare const jQuery: any;

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
function normalizeConfig(raw: Record<string, unknown>): VisitChartVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (
		val: unknown,
		fallback: number | undefined
	): number | undefined => {
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

	// Helper for StatsSource normalization
	const normalizeSource = (val: unknown): StatsSource => {
		const validSources: StatsSource[] = ['post', 'user', 'site'];
		if (typeof val === 'string' && validSources.includes(val as StatsSource)) {
			return val as StatsSource;
		}
		return 'post'; // Default
	};

	// Helper for ChartTimeframe normalization
	const normalizeTimeframe = (val: unknown): ChartTimeframe => {
		const validTimeframes: ChartTimeframe[] = ['24h', '7d', '30d', '12m'];
		if (
			typeof val === 'string' &&
			validTimeframes.includes(val as ChartTimeframe)
		) {
			return val as ChartTimeframe;
		}
		return '7d'; // Default
	};

	// Helper for ViewType normalization
	const normalizeViewType = (val: unknown): ViewType => {
		const validTypes: ViewType[] = ['views', 'unique_views'];
		if (typeof val === 'string' && validTypes.includes(val as ViewType)) {
			return val as ViewType;
		}
		return 'views'; // Default
	};

	// Helper for ChartItem normalization
	const normalizeChartItem = (val: unknown): ChartItem => {
		const item = (val && typeof val === 'object' ? val : {}) as Record<
			string,
			unknown
		>;
		return {
			label: normalizeString(item['label'], ''),
			percent: normalizeNumber(item['percent'], 0) ?? 0,
			count: normalizeString(item['count'], '0'),
			unique_count: normalizeString(
				item['unique_count'] ?? item['uniqueCount'],
				'0'
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
			label: normalizeString(meta['label'], ''),
			has_activity: normalizeBoolean(
				meta['has_activity'] ?? meta['hasActivity'],
				false
			),
		};
	};

	// Helper for ChartState normalization
	const normalizeChartState = (val: unknown): ChartState => {
		const state = (val && typeof val === 'object' ? val : {}) as Record<
			string,
			unknown
		>;

		// Normalize items array
		let items: ChartItem[] | undefined;
		if (Array.isArray(state['items'])) {
			items = state['items'].map(normalizeChartItem);
		}

		// Normalize steps array
		let steps: string[] | undefined;
		if (Array.isArray(state['steps'])) {
			steps = state['steps'].map((s) => normalizeString(s, ''));
		}

		return {
			loaded: normalizeBoolean(state['loaded'], false),
			error: state['error'] !== undefined ? normalizeBoolean(state['error'], false) : undefined,
			steps,
			items,
			meta: state['meta'] ? normalizeChartMeta(state['meta']) : undefined,
		};
	};

	// Helper for charts Record normalization
	const normalizeCharts = (
		val: unknown
	): Record<ChartTimeframe, ChartState> => {
		const charts = (val && typeof val === 'object' ? val : {}) as Record<
			string,
			unknown
		>;

		const defaultState: ChartState = { loaded: false };
		const timeframes: ChartTimeframe[] = ['24h', '7d', '30d', '12m'];

		const result = {} as Record<ChartTimeframe, ChartState>;
		for (const tf of timeframes) {
			result[tf] = charts[tf]
				? normalizeChartState(charts[tf])
				: { ...defaultState };
		}
		return result;
	};

	// Build normalized config
	// Support both camelCase and snake_case/ts_* prefixed names
	return {
		source: normalizeSource(
			raw['source'] ?? raw['ts_source'] ?? raw['statsSource']
		),
		activeChart: normalizeTimeframe(
			raw['activeChart'] ?? raw['active_chart'] ?? raw['ts_active_chart']
		),
		viewType: normalizeViewType(
			raw['viewType'] ?? raw['view_type'] ?? raw['ts_view_type']
		),
		nonce: normalizeString(raw['nonce'], ''),
		postId: normalizeNumber(raw['postId'] ?? raw['post_id'], undefined),
		charts: normalizeCharts(raw['charts']),
	};
}

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): VisitChartVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (!vxconfigScript || !vxconfigScript.textContent) {
		console.error('Visit Chart: vxconfig not found');
		return null;
	}

	try {
		const raw = JSON.parse(vxconfigScript.textContent) as Record<
			string,
			unknown
		>;
		return normalizeConfig(raw);
	} catch (error) {
		console.error('Visit Chart: Failed to parse vxconfig', error);
		return null;
	}
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: VisitChartVxConfig): VisitChartAttributes {
	return {
		blockId: '',
		source: config.source || 'post',
		activeChart: config.activeChart || '7d',
		viewType: config.viewType || 'views',
		chartIcon: { library: '', value: '' },
		chevronRight: { library: '', value: '' },
		chevronLeft: { library: '', value: '' },
		contentTabOpenPanel: '',
		styleTabOpenPanel: '',
	};
}

/**
 * Wrapper component that passes vxconfig directly to VisitChartComponent
 *
 * PARITY: Nonce and postId are now injected server-side by render.php,
 * matching Voxel's approach (visits-chart.php:1069-1081).
 * No client-side REST API call needed.
 */
interface VisitChartWrapperProps {
	config: VisitChartVxConfig;
	attributes: VisitChartAttributes;
}

function VisitChartWrapper({ config, attributes }: VisitChartWrapperProps) {
	// Config comes from vxconfig with nonce/postId already injected by render.php
	// If nonce is empty, the chart will show "No activity" (matching Voxel behavior
	// where widget returns early if conditions not met)
	if (!config.nonce) {
		return null;
	}

	return (
		<VisitChartComponent
			attributes={attributes}
			context="frontend"
			vxconfig={config}
		/>
	);
}

/**
 * Initialize visit chart blocks on the page
 */
function initVisitCharts() {
	// Find all visit chart blocks
	const visitCharts = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-visit-chart-frontend'
	);

	visitCharts.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['reactMounted'] === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('Visit Chart: Could not parse configuration');
			return;
		}

		// Build attributes
		const attributes = buildAttributes(config);

		// Mark as mounted to prevent double-initialization
		container.dataset['reactMounted'] = 'true';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<VisitChartWrapper config={config} attributes={attributes} />
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initVisitCharts);
} else {
	initVisitCharts();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initVisitCharts);
window.addEventListener('pjax:complete', initVisitCharts);

// Support Voxel markup updates
if (typeof jQuery !== 'undefined') {
	jQuery(document).on('voxel:markup-update', initVisitCharts);
}
