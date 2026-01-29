/**
 * Sales Chart Block - Styles Generator
 *
 * Generates CSS and responsive styles for the sales-chart block.
 * Matches Voxel's Elementor selectors exactly.
 *
 * @package VoxelFSE
 */

import {
    generateDimensionsCSS,
    generateTypographyCSS,
    generateBorderCSS,
    generateBoxShadowCSS,
    generateBackgroundCSS,
} from '../../shared/utils/css-generators';
import type { SalesChartAttributes } from './types';

/**
 * Generate block-specific styles for the editor (inline)
 */
export function generateBlockStyles(_attributes: SalesChartAttributes): Record<string, string | number> {
    return {};
}

/**
 * Generate responsive CSS for sales-chart block
 */
export function generateSalesChartResponsiveCSS(attributes: SalesChartAttributes, blockId: string): string {
    const selector = `.voxel-fse-sales-chart-${blockId}`;
    const desktopRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    // --- Chart Section ---

    // Content height
    if (attributes.ts_chart_height !== undefined) {
        desktopRules.push(`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.ts_chart_height}px; }`);
    }
    if (attributes.ts_chart_height_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.ts_chart_height_tablet}px; }`);
    }
    if (attributes.ts_chart_height_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-chart .ts-no-posts, ${selector} .ts-chart .chart-content { height: ${attributes.ts_chart_height_mobile}px; }`);
    }

    // Axis Typography & Color
    const axisSelector = `${selector} .chart-content span`;
    const axisTypo = generateTypographyCSS(attributes.axis_typo);
    if (axisTypo.desktop) desktopRules.push(`${axisSelector} { ${axisTypo.desktop} }`);
    if (axisTypo.tablet) tabletRules.push(`${axisSelector} { ${axisTypo.tablet} }`);
    if (axisTypo.mobile) mobileRules.push(`${axisSelector} { ${axisTypo.mobile} }`);
    if (attributes.ts_axis_typo_col) {
        desktopRules.push(`${axisSelector} { color: ${attributes.ts_axis_typo_col}; }`);
    }

    // Vertical axis width
    if (attributes.vertical_axis_width !== undefined) {
        desktopRules.push(`${selector} .chart-content.min-scroll { margin-left: ${attributes.vertical_axis_width}px; }`);
    }
    if (attributes.vertical_axis_width_tablet !== undefined) {
        tabletRules.push(`${selector} .chart-content.min-scroll { margin-left: ${attributes.vertical_axis_width_tablet}px; }`);
    }
    if (attributes.vertical_axis_width_mobile !== undefined) {
        mobileRules.push(`${selector} .chart-content.min-scroll { margin-left: ${attributes.vertical_axis_width_mobile}px; }`);
    }

    // Chart lines border
    const lineSelector = `${selector} .chart-content .bar-values span`;
    const lineBorder = generateBorderCSS(attributes, 'chart_line_border');
    if (lineBorder.desktop) desktopRules.push(`${lineSelector} { ${lineBorder.desktop} }`);

    // Bar gap
    if (attributes.chart_col_gap !== undefined) {
        desktopRules.push(`${selector} .chart-content { grid-gap: ${attributes.chart_col_gap}px; }`);
    }
    if (attributes.chart_col_gap_tablet !== undefined) {
        tabletRules.push(`${selector} .chart-content { grid-gap: ${attributes.chart_col_gap_tablet}px; }`);
    }
    if (attributes.chart_col_gap_mobile !== undefined) {
        mobileRules.push(`${selector} .chart-content { grid-gap: ${attributes.chart_col_gap_mobile}px; }`);
    }

    // Bar width
    if (attributes.bar_width !== undefined) {
        desktopRules.push(`${selector} .chart-content .bar-item { width: ${attributes.bar_width}px; }`);
    }
    if (attributes.bar_width_tablet !== undefined) {
        tabletRules.push(`${selector} .chart-content .bar-item { width: ${attributes.bar_width_tablet}px; }`);
    }
    if (attributes.bar_width_mobile !== undefined) {
        mobileRules.push(`${selector} .chart-content .bar-item { width: ${attributes.bar_width_mobile}px; }`);
    }

    // Bar radius
    if (attributes.bar_radius !== undefined) {
        desktopRules.push(`${selector} .chart-content .bar-item { border-radius: ${attributes.bar_radius}px; }`);
    }
    if (attributes.bar_radius_tablet !== undefined) {
        tabletRules.push(`${selector} .chart-content .bar-item { border-radius: ${attributes.bar_radius_tablet}px; }`);
    }
    if (attributes.bar_radius_mobile !== undefined) {
        mobileRules.push(`${selector} .chart-content .bar-item { border-radius: ${attributes.bar_radius_mobile}px; }`);
    }

    // Bar background
    const barSelector = `${selector} .chart-content .bar-item`;
    const barBackground = generateBackgroundCSS(attributes.bar_bg);
    if (barBackground) {
        desktopRules.push(`${barSelector} { ${barBackground} }`);
    }

    // Bar hover
    if (attributes.bar_bg_hover) {
        desktopRules.push(`${barSelector}:hover { background-color: ${attributes.bar_bg_hover}; }`);
    }

    // Bar shadow
    const barShadow = generateBoxShadowCSS(attributes.bar_sh_shadow);
    if (barShadow) {
        desktopRules.push(`${barSelector} { box-shadow: ${barShadow}; }`);
    }

    // --- Bar Popup Section ---

    const popupSelector = `${selector} .bar-item-data`;
    if (attributes.bar_pop_bg) {
        desktopRules.push(`${popupSelector} { background-color: ${attributes.bar_pop_bg}; }`);
    }
    const popupBorder = generateBorderCSS(attributes, 'bar_pop_border');
    if (popupBorder.desktop) desktopRules.push(`${popupSelector} { ${popupBorder.desktop} }`);

    if (attributes.bar_pop_radius !== undefined) {
        desktopRules.push(`${popupSelector} { border-radius: ${attributes.bar_pop_radius}px; }`);
    }
    if (attributes.bar_pop_radius_tablet !== undefined) {
        tabletRules.push(`${popupSelector} { border-radius: ${attributes.bar_pop_radius_tablet}px; }`);
    }
    if (attributes.bar_pop_radius_mobile !== undefined) {
        mobileRules.push(`${popupSelector} { border-radius: ${attributes.bar_pop_radius_mobile}px; }`);
    }

    const popupShadow = generateBoxShadowCSS(attributes.bar_pop_shadow);
    if (popupShadow) {
        desktopRules.push(`${popupSelector} { box-shadow: ${popupShadow}; }`);
    }

    // Popup Value (Primary)
    const primarySelector = `${popupSelector} li`;
    const primaryTypo = generateTypographyCSS(attributes.ts_primary_typo);
    if (primaryTypo.desktop) desktopRules.push(`${primarySelector} { ${primaryTypo.desktop} }`);
    if (primaryTypo.tablet) tabletRules.push(`${primarySelector} { ${primaryTypo.tablet} }`);
    if (primaryTypo.mobile) mobileRules.push(`${primarySelector} { ${primaryTypo.mobile} }`);
    if (attributes.ts_primary_color) {
        desktopRules.push(`${primarySelector} { color: ${attributes.ts_primary_color}; }`);
    }

    // Popup Label (Secondary)
    const secondarySelector = `${popupSelector} li small`;
    const secondaryTypo = generateTypographyCSS(attributes.ts_secondary_typo);
    if (secondaryTypo.desktop) desktopRules.push(`${secondarySelector} { ${secondaryTypo.desktop} }`);
    if (secondaryTypo.tablet) tabletRules.push(`${secondarySelector} { ${secondaryTypo.tablet} }`);
    if (secondaryTypo.mobile) mobileRules.push(`${secondarySelector} { ${secondaryTypo.mobile} }`);
    if (attributes.ts_secondary_color) {
        desktopRules.push(`${secondarySelector} { color: ${attributes.ts_secondary_color}; }`);
    }

    // --- Tabs Section ---

    const tabsSelector = `${selector} .ts-generic-tabs`;
    if (attributes.ts_tabs_justify) {
        desktopRules.push(`${tabsSelector} { justify-content: ${attributes.ts_tabs_justify}; }`);
    }

    const tabItemSelector = `${selector} .ts-generic-tabs li`;
    const tabMargin = generateDimensionsCSS(attributes, 'ts_tabs_margin', 'margin');
    if (tabMargin.desktop) {
        desktopRules.push(`${tabItemSelector} { ${tabMargin.desktop} }`);
    }

    const tabLinkSelector = `${selector} .ts-generic-tabs li a`;
    const tabPadding = generateDimensionsCSS(attributes, 'ts_tabs_padding');
    if (tabPadding.desktop) desktopRules.push(`${tabLinkSelector} { ${tabPadding.desktop} }`);

    const tabTypo = generateTypographyCSS(attributes.ts_tabs_text);
    if (tabTypo.desktop) desktopRules.push(`${tabLinkSelector} { ${tabTypo.desktop} }`);

    if (attributes.ts_tabs_text_color) {
        desktopRules.push(`${tabLinkSelector} { color: ${attributes.ts_tabs_text_color}; }`);
    }
    if (attributes.ts_tabs_bg_color) {
        desktopRules.push(`${tabLinkSelector} { background-color: ${attributes.ts_tabs_bg_color}; }`);
    }

    const tabBorder = generateBorderCSS(attributes, 'ts_tabs_border');
    if (tabBorder.desktop) desktopRules.push(`${tabLinkSelector} { ${tabBorder.desktop} }`);

    if (attributes.ts_tabs_radius !== undefined) {
        desktopRules.push(`${tabLinkSelector} { border-radius: ${attributes.ts_tabs_radius}px; }`);
    }

    // Active Tab
    const activeTabSelector = `${selector} .ts-generic-tabs li.ts-tab-active a`;
    const activeTabTypo = generateTypographyCSS(attributes.ts_tabs_text_active);
    if (activeTabTypo.desktop) desktopRules.push(`${activeTabSelector} { ${activeTabTypo.desktop} }`);

    if (attributes.ts_active_text_color) {
        desktopRules.push(`${activeTabSelector} { color: ${attributes.ts_active_text_color}; }`);
    }
    if (attributes.ts_tabs_bg_active_color) {
        desktopRules.push(`${activeTabSelector} { background-color: ${attributes.ts_tabs_bg_active_color}; }`);
    }
    if (attributes.ts_tabs_border_active) {
        desktopRules.push(`${activeTabSelector} { border-color: ${attributes.ts_tabs_border_active}; }`);
    }

    // Hover State
    const hoverTabSelector = `${tabLinkSelector}:hover`;
    if (attributes.ts_tabs_text_color_h) {
        desktopRules.push(`${hoverTabSelector} { color: ${attributes.ts_tabs_text_color_h}; }`);
    }
    if (attributes.ts_tabs_border_color_h) {
        desktopRules.push(`${hoverTabSelector} { border-color: ${attributes.ts_tabs_border_color_h}; }`);
    }
    if (attributes.ts_tabs_bg_color_h) {
        desktopRules.push(`${hoverTabSelector} { background-color: ${attributes.ts_tabs_bg_color_h}; }`);
    }

    // Active Hover
    const activeHoverSelector = `${selector} .ts-generic-tabs li.ts-tab-active a:hover`;
    if (attributes.ts_tabs_active_text_color_h) {
        desktopRules.push(`${activeHoverSelector} { color: ${attributes.ts_tabs_active_text_color_h}; }`);
    }
    if (attributes.ts_tabs_border_h_active) {
        desktopRules.push(`${activeHoverSelector} { border-color: ${attributes.ts_tabs_border_h_active}; }`);
    }
    if (attributes.ts_bg_active_color_h) {
        desktopRules.push(`${activeHoverSelector} { background-color: ${attributes.ts_bg_active_color_h}; }`);
    }

    // --- Week Buttons ---

    const navTextSelector = `${selector} .ts-chart-nav p`;
    const navTypo = generateTypographyCSS(attributes.week_range_typo);
    if (navTypo.desktop) desktopRules.push(`${navTextSelector} { ${navTypo.desktop} }`);
    if (attributes.week_range_col) {
        desktopRules.push(`${navTextSelector} { color: ${attributes.week_range_col}; }`);
    }

    const navBtnSelector = `${selector} .ts-chart-nav .ts-icon-btn`;
    if (attributes.ts_week_btn_color) {
        desktopRules.push(`${navBtnSelector} i { color: ${attributes.ts_week_btn_color}; }`);
        desktopRules.push(`${navBtnSelector} svg { fill: ${attributes.ts_week_btn_color}; }`);
    }
    if (attributes.ts_week_btn_icon_size !== undefined) {
        desktopRules.push(`${navBtnSelector} i { font-size: ${attributes.ts_week_btn_icon_size}px; }`);
        desktopRules.push(`${navBtnSelector} svg { width: ${attributes.ts_week_btn_icon_size}px; height: ${attributes.ts_week_btn_icon_size}px; }`);
    }
    if (attributes.ts_week_btn_size !== undefined) {
        desktopRules.push(`${navBtnSelector} { width: ${attributes.ts_week_btn_size}px; height: ${attributes.ts_week_btn_size}px; min-width: ${attributes.ts_week_btn_size}px; }`);
    }
    if (attributes.ts_week_btn_bg) {
        desktopRules.push(`${navBtnSelector} { background-color: ${attributes.ts_week_btn_bg}; }`);
    }
    const navBtnBorder = generateBorderCSS(attributes, 'ts_week_btn_border');
    if (navBtnBorder.desktop) desktopRules.push(`${navBtnSelector} { ${navBtnBorder.desktop} }`);

    if (attributes.ts_week_btn_radius !== undefined) {
        desktopRules.push(`${navBtnSelector} { border-radius: ${attributes.ts_week_btn_radius}px; }`);
    }

    // Hover
    const navBtnHoverSelector = `${navBtnSelector}:hover`;
    if (attributes.ts_week_btn_h) {
        desktopRules.push(`${navBtnHoverSelector} i { color: ${attributes.ts_week_btn_h}; }`);
        desktopRules.push(`${navBtnHoverSelector} svg { fill: ${attributes.ts_week_btn_h}; }`);
    }
    if (attributes.ts_week_btn_bg_h) {
        desktopRules.push(`${navBtnHoverSelector} { background-color: ${attributes.ts_week_btn_bg_h}; }`);
    }
    if (attributes.ts_week_border_c_h) {
        desktopRules.push(`${navBtnHoverSelector} { border-color: ${attributes.ts_week_border_c_h}; }`);
    }

    // --- No Activity ---

    const noActivitySelector = `${selector} .ts-no-posts`;
    if (attributes.ts_nopost_content_Gap !== undefined) {
        desktopRules.push(`${noActivitySelector} { grid-gap: ${attributes.ts_nopost_content_Gap}px; }`);
    }
    const noActivityIconSelector = `${noActivitySelector} i, ${noActivitySelector} svg`;
    if (attributes.ts_nopost_ico_size !== undefined) {
        desktopRules.push(`${noActivityIconSelector} { font-size: ${attributes.ts_nopost_ico_size}px; width: ${attributes.ts_nopost_ico_size}px; height: ${attributes.ts_nopost_ico_size}px; }`);
    }
    if (attributes.ts_nopost_ico_col) {
        desktopRules.push(`${noActivityIconSelector} { color: ${attributes.ts_nopost_ico_col}; fill: ${attributes.ts_nopost_ico_col}; }`);
    }
    const noActivityTextSelector = `${noActivitySelector} p`;
    const noActivityTypo = generateTypographyCSS(attributes.ts_nopost_typo);
    if (noActivityTypo.desktop) desktopRules.push(`${noActivityTextSelector} { ${noActivityTypo.desktop} }`);
    if (attributes.ts_nopost_typo_col) {
        desktopRules.push(`${noActivityTextSelector} { color: ${attributes.ts_nopost_typo_col}; }`);
    }

    // Assemble final CSS
    let finalCSS = desktopRules.join('\n');
    if (tabletRules.length > 0) {
        finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
    }
    if (mobileRules.length > 0) {
        finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
    }

    return finalCSS;
}
