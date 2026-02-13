/**
 * Advanced List Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates the Advanced List block on the frontend.
 * Parses vxconfig from script tag and mounts React component.
 *
 * Pattern follows Plan C+ architecture:
 * - Parse vxconfig JSON from script tag
 * - Optionally fetch post context from REST API
 * - Mount React component using createRoot
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/advanced-list.php (1185 lines)
 * - Template: themes/voxel/templates/widgets/advanced-list.php
 * - Style: vx:action.css
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: Voxel advanced-list.php (Actions VX widget)
 *
 * REPEATER ITEM (Content Tab - ts_actions):
 * ✅ ts_action_type - Action type (18 options: none, action_link, add_to_cart, etc.)
 * ✅ ts_addition_id - Addition ID (for select_addition)
 * ✅ ts_action_link - Link URL control (for action_link)
 * ✅ ts_scroll_to - Section ID (for scroll_to_section)
 * ✅ ts_action_cal_start_date - Event start date (for gcal/ical)
 * ✅ ts_action_cal_end_date - Event end date (for gcal/ical)
 * ✅ ts_action_cal_title - Event title (for gcal/ical)
 * ✅ ts_action_cal_desc - Event description (for gcal/ical)
 * ✅ ts_action_cal_location - Event location (for gcal/ical)
 * ✅ ts_action_cal_url - Event URL (for ical only)
 * ✅ ts_acw_initial_text - Default text
 * ✅ ts_enable_tooltip - Enable tooltip switch
 * ✅ ts_tooltip_text - Tooltip text
 * ✅ ts_acw_initial_icon - Default icon (icons control)
 * ✅ ts_cart_opts_text - Select options text (add_to_cart)
 * ✅ ts_cart_opts_enable_tooltip - Select options tooltip switch
 * ✅ ts_cart_opts_tooltip_text - Select options tooltip text
 * ✅ ts_cart_opts_icon - Select options icon
 * ✅ ts_acw_reveal_text - Active state text
 * ✅ ts_acw_enable_tooltip - Active tooltip switch
 * ✅ ts_acw_tooltip_text - Active tooltip text
 * ✅ ts_acw_reveal_icon - Active state icon
 * ✅ ts_acw_custom_style - Custom styling switch
 * ✅ ts_acw_icon_color_custom - Custom icon color
 * ✅ ts_acw_icon_color_a_custom - Custom icon color (active)
 *
 * ICONS (Content Tab):
 * ✅ ts_close_ico - Close icon
 * ✅ ts_message_ico - Direct message icon
 * ✅ ts_link_ico - Copy link icon
 * ✅ ts_share_ico - Share via icon
 *
 * LIST (Style Tab):
 * ✅ csgrid_action_on - Enable CSS grid (responsive switcher)
 * ✅ ts_cgrid_columns - Grid columns (responsive number)
 * ✅ ts_al_columns_no - Item width mode (auto/custom)
 * ✅ ts_al_columns_cstm - Custom item width (responsive slider)
 * ✅ ts_al_justify - List justify (responsive select)
 * ✅ ts_cgrid_gap - Item gap (responsive slider)
 *
 * LIST ITEM - NORMAL (Style Tab):
 * ✅ ts_al_align - Justify content (responsive choose)
 * ✅ ts_action_padding - Item padding (responsive dimensions)
 * ✅ ts_acw_height - Item height (responsive slider)
 * ✅ ts_acw_border - Border (group control)
 * ✅ ts_acw_border_radius - Border radius (slider)
 * ✅ ts_acw_border_shadow - Box shadow (group control)
 * ✅ ts_acw_typography - Typography (group control)
 * ✅ ts_acw_initial_color - Text color
 * ✅ ts_acw_initial_bg - Background color
 *
 * ICON CONTAINER - NORMAL:
 * ✅ ts_acw_icon_con_bg - Icon container background
 * ✅ ts_acw_icon_con_size - Icon container size (responsive slider)
 * ✅ ts_acw_icon_con_border - Icon container border (group)
 * ✅ ts_acw_icon_con_radius - Icon container border radius
 * ✅ ts_acw_con_shadow - Icon container box shadow (group)
 * ✅ ts_acw_icon_margin - Icon/text spacing (responsive slider)
 *
 * ICON - NORMAL:
 * ✅ ts_acw_icon_orient - Icon on top (switcher)
 * ✅ ts_acw_icon_size - Icon size (responsive slider)
 * ✅ ts_acw_icon_color - Icon color
 *
 * LIST ITEM - HOVER:
 * ✅ ts_acw_border_shadow_h - Box shadow (hover)
 * ✅ ts_acw_border_h - Border color (hover)
 * ✅ ts_acw_initial_color_h - Text color (hover)
 * ✅ ts_acw_initial_bg_h - Background color (hover)
 * ✅ ts_acw_icon_con_bg_h - Icon container bg (hover)
 * ✅ ts_acw_icon_con_bord_h - Icon container border (hover)
 * ✅ ts_acw_icon_color_h - Icon color (hover)
 *
 * LIST ITEM - ACTIVE:
 * ✅ ts_acw_border_shadow_a - Box shadow (active)
 * ✅ ts_acw_initial_color_a - Text color (active)
 * ✅ ts_acw_initial_bg_a - Background color (active)
 * ✅ ts_acw_initial_border_a - Border color (active)
 * ✅ ts_acw_icon_con_bg_a - Icon container bg (active)
 * ✅ ts_acw_icon_con_bord_a - Icon container border (active)
 * ✅ ts_acw_icon_color_a - Icon color (active)
 *
 * TOOLTIPS (Style Tab):
 * ✅ tooltip_bottom - Display below item (switcher)
 * ✅ ts_tooltip_color - Tooltip text color
 * ✅ ts_tooltip_typo - Tooltip typography (group control)
 * ✅ ts_tooltip_bg - Tooltip background color
 * ✅ ts_tooltip_radius - Tooltip border radius (responsive slider)
 *
 * HTML STRUCTURE:
 * ✅ .ts-advanced-list - List container
 * ✅ .ts-action - Action item wrapper
 * ✅ .ts-action-con - Action container (linkable)
 * ✅ .ts-action-icon - Icon container
 * ✅ .active - Active state class
 * ✅ ::after pseudo - Tooltip content
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ REST API post context fetching
 * ✅ Multisite support via getRestBaseUrl()
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { AdvancedListComponent } from './shared/AdvancedListComponent';
import type {
	AdvancedListAttributes,
	VxConfig,
	PostContext,
	ActionItem,
	ActionType,
	LinkConfig,
	IconValue,
	BoxValues,
	BoxShadowValue,
	TypographyValue,
} from './types';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
import { DEFAULT_ACTION_ITEM } from './types';

/**
 * Window extension for WordPress API settings
 */
declare global {
	interface Window {
		wp: {
			element: {
				createRoot: (container: Element) => {
					render: (element: React.ReactNode) => void;
					unmount: () => void;
				};
			};
		};
		wpApiSettings?: {
			root: string;
			nonce: string;
		};
		voxelFseAdvancedList?: {
			restUrl?: string;
		};
	}
}

/**
 * Default values for types
 */
const DEFAULT_BOX_VALUES: BoxValues = { top: '', right: '', bottom: '', left: '' };
const DEFAULT_BOX_SHADOW: BoxShadowValue = {
	horizontal: 0,
	vertical: 0,
	blur: 0,
	spread: 0,
	color: 'rgba(0,0,0,0.1)',
};
const DEFAULT_TYPOGRAPHY: TypographyValue = {};
const DEFAULT_ICON: IconValue = { library: '', value: '' };

import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): VxConfig {
	// Using 'any' for internal object access to avoid index signature errors
	// This is safe because we immediately normalize all values to typed outputs
	type JsonObj = Record<string, any>;
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

	// Helper for boolean normalization
	const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'yes' || val === 'true' || val === '1' || val === 1) return true;
		if (val === '' || val === 'no' || val === 'false' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for IconValue normalization
	const normalizeIcon = (val: unknown): IconValue | null => {
		if (!val || typeof val !== 'object') return null;
		const obj = val as JsonObj;
		if (!obj['library'] && !obj['value']) return null;
		return {
			library: normalizeString(obj['library'], '') as IconValue['library'],
			value: normalizeString(obj['value'], ''),
		};
	};

	// Helper for BoxValues normalization
	const normalizeBoxValues = (val: unknown): BoxValues => {
		if (!val || typeof val !== 'object') return DEFAULT_BOX_VALUES;
		const obj = val as JsonObj;
		return {
			top: normalizeString(obj['top'], ''),
			right: normalizeString(obj['right'], ''),
			bottom: normalizeString(obj['bottom'], ''),
			left: normalizeString(obj['left'], ''),
		};
	};

	// Helper for BoxShadowValue normalization
	const normalizeBoxShadow = (val: unknown): BoxShadowValue => {
		if (!val || typeof val !== 'object') return DEFAULT_BOX_SHADOW;
		const obj = val as JsonObj;
		return {
			horizontal: normalizeNumber(obj['horizontal'], 0),
			vertical: normalizeNumber(obj['vertical'], 0),
			blur: normalizeNumber(obj['blur'], 0),
			spread: normalizeNumber(obj['spread'], 0),
			color: normalizeString(obj['color'], 'rgba(0,0,0,0.1)'),
		};
	};

	// Helper for TypographyValue normalization
	const normalizeTypography = (val: unknown): TypographyValue => {
		if (!val || typeof val !== 'object') return DEFAULT_TYPOGRAPHY;
		const obj = val as JsonObj;
		return {
			fontFamily: obj['fontFamily'] !== undefined ? normalizeString(obj['fontFamily'] ?? obj['font_family'], '') : undefined,
			fontSize: obj['fontSize'] !== undefined ? normalizeNumber(obj['fontSize'] ?? obj['font_size'], 14) : undefined,
			fontSizeUnit: obj['fontSizeUnit'] !== undefined ? normalizeString(obj['fontSizeUnit'] ?? obj['font_size_unit'], 'px') : undefined,
			fontWeight: obj['fontWeight'] !== undefined ? normalizeString(obj['fontWeight'] ?? obj['font_weight'], '') : undefined,
			textTransform: obj['textTransform'] !== undefined ? normalizeString(obj['textTransform'] ?? obj['text_transform'], '') : undefined,
			fontStyle: obj['fontStyle'] !== undefined ? normalizeString(obj['fontStyle'] ?? obj['font_style'], '') : undefined,
			textDecoration: obj['textDecoration'] !== undefined ? normalizeString(obj['textDecoration'] ?? obj['text_decoration'], '') : undefined,
			lineHeight: obj['lineHeight'] !== undefined ? normalizeNumber(obj['lineHeight'] ?? obj['line_height'], 1.5) : undefined,
			lineHeightUnit: obj['lineHeightUnit'] !== undefined ? normalizeString(obj['lineHeightUnit'] ?? obj['line_height_unit'], 'em') : undefined,
			letterSpacing: obj['letterSpacing'] !== undefined ? normalizeNumber(obj['letterSpacing'] ?? obj['letter_spacing'], 0) : undefined,
			letterSpacingUnit: obj['letterSpacingUnit'] !== undefined ? normalizeString(obj['letterSpacingUnit'] ?? obj['letter_spacing_unit'], 'px') : undefined,
		};
	};

	// Helper for LinkConfig normalization
	const normalizeLinkConfig = (val: unknown): LinkConfig | null => {
		if (!val || typeof val !== 'object') return null;
		const obj = val as JsonObj;
		return {
			url: normalizeString(obj['url'], ''),
			isExternal: normalizeBoolean(obj['isExternal'] ?? obj['is_external'], false),
			nofollow: normalizeBoolean(obj['nofollow'], false),
		};
	};

	// Helper for ActionItem normalization
	const normalizeActionItem = (val: unknown): ActionItem => {
		if (!val || typeof val !== 'object') {
			return { ...DEFAULT_ACTION_ITEM, id: crypto.randomUUID?.() || String(Date.now()) };
		}
		const obj = val as JsonObj;
		return {
			id: normalizeString(obj['id'] ?? obj['_id'], crypto.randomUUID?.() || String(Date.now())),
			actionType: normalizeString(obj['actionType'] ?? obj['ts_action_type'], 'none') as ActionType,
			text: normalizeString(obj['text'] ?? obj['ts_acw_initial_text'], 'Action'),
			icon: normalizeIcon(obj['icon'] ?? obj['ts_acw_initial_icon']),
			enableTooltip: normalizeBoolean(obj['enableTooltip'] ?? obj['ts_enable_tooltip'], false),
			tooltipText: normalizeString(obj['tooltipText'] ?? obj['ts_tooltip_text'], ''),
			link: normalizeLinkConfig(obj['link'] ?? obj['ts_action_link']),
			scrollToId: normalizeString(obj['scrollToId'] ?? obj['ts_scroll_to'], ''),
			additionId: normalizeString(obj['additionId'] ?? obj['ts_addition_id'], ''),
			calStartDate: normalizeString(obj['calStartDate'] ?? obj['ts_action_cal_start_date'], ''),
			calEndDate: normalizeString(obj['calEndDate'] ?? obj['ts_action_cal_end_date'], ''),
			calTitle: normalizeString(obj['calTitle'] ?? obj['ts_action_cal_title'], ''),
			calDescription: normalizeString(obj['calDescription'] ?? obj['ts_action_cal_desc'], ''),
			calLocation: normalizeString(obj['calLocation'] ?? obj['ts_action_cal_location'], ''),
			calUrl: normalizeString(obj['calUrl'] ?? obj['ts_action_cal_url'], ''),
			cartOptsText: normalizeString(obj['cartOptsText'] ?? obj['ts_cart_opts_text'], 'Select options'),
			cartOptsEnableTooltip: normalizeBoolean(obj['cartOptsEnableTooltip'] ?? obj['ts_cart_opts_enable_tooltip'], false),
			cartOptsTooltipText: normalizeString(obj['cartOptsTooltipText'] ?? obj['ts_cart_opts_tooltip_text'], ''),
			cartOptsIcon: normalizeIcon(obj['cartOptsIcon'] ?? obj['ts_cart_opts_icon']),
			activeText: normalizeString(obj['activeText'] ?? obj['ts_acw_reveal_text'], 'Action'),
			activeIcon: normalizeIcon(obj['activeIcon'] ?? obj['ts_acw_reveal_icon']),
			activeEnableTooltip: normalizeBoolean(obj['activeEnableTooltip'] ?? obj['ts_acw_enable_tooltip'], false),
			activeTooltipText: normalizeString(obj['activeTooltipText'] ?? obj['ts_acw_tooltip_text'], ''),
			customStyle: normalizeBoolean(obj['customStyle'] ?? obj['ts_acw_custom_style'], false),
			customIconColor: normalizeString(obj['customIconColor'] ?? obj['ts_acw_icon_color_custom'], ''),
			customIconColorActive: normalizeString(obj['customIconColorActive'] ?? obj['ts_acw_icon_color_a_custom'], ''),
			// Loop repeater row fields
			loopSource: normalizeString(obj['loopSource'], ''),
			loopProperty: normalizeString(obj['loopProperty'], ''),
			loopLimit: normalizeString(obj['loopLimit'], ''),
			loopOffset: normalizeString(obj['loopOffset'], ''),
			// Row visibility fields
			rowVisibility: normalizeString(obj['rowVisibility'], 'show') as 'show' | 'hide',
			visibilityRules: Array.isArray(obj['visibilityRules']) ? obj['visibilityRules'] as VisibilityRule[] : [],
		};
	};

	// Helper for ActionItem array normalization
	const normalizeItems = (val: unknown): ActionItem[] => {
		if (!val) return [];
		if (Array.isArray(val)) return val.map(normalizeActionItem);
		// Handle object format (Voxel sometimes returns objects keyed by index)
		if (typeof val === 'object') {
			return Object.values(val).map(normalizeActionItem);
		}
		return [];
	};

	// Normalize icons object
	const normalizeIcons = (val: unknown): VxConfig['icons'] => {
		const defaults: VxConfig['icons'] = {
			closeIcon: DEFAULT_ICON,
			messageIcon: DEFAULT_ICON,
			linkIcon: DEFAULT_ICON,
			shareIcon: DEFAULT_ICON,
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			closeIcon: normalizeIcon(obj['closeIcon'] ?? obj['ts_close_ico']) || DEFAULT_ICON,
			messageIcon: normalizeIcon(obj['messageIcon'] ?? obj['ts_message_ico']) || DEFAULT_ICON,
			linkIcon: normalizeIcon(obj['linkIcon'] ?? obj['ts_link_ico']) || DEFAULT_ICON,
			shareIcon: normalizeIcon(obj['shareIcon'] ?? obj['ts_share_ico']) || DEFAULT_ICON,
		};
	};

	// Normalize list settings
	const normalizeList = (val: unknown): VxConfig['list'] => {
		const defaults: VxConfig['list'] = {
			enableCssGrid: false,
			gridColumns: 3,
			itemWidth: 'auto',
			customItemWidth: 100,
			customItemWidthUnit: 'px',
			listJustify: 'left',
			itemGap: 10,
			itemGapUnit: 'px',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			enableCssGrid: normalizeBoolean(obj['enableCssGrid'] ?? obj['csgrid_action_on'], false),
			gridColumns: normalizeNumber(obj['gridColumns'] ?? obj['ts_cgrid_columns'], 3),
			itemWidth: normalizeString(obj['itemWidth'] ?? obj['ts_al_columns_no'], 'auto'),
			customItemWidth: normalizeNumber(obj['customItemWidth'] ?? obj['ts_al_columns_cstm'], 100),
			customItemWidthUnit: normalizeString(obj['customItemWidthUnit'], 'px'),
			listJustify: normalizeString(obj['listJustify'] ?? obj['ts_al_justify'], 'left'),
			itemGap: normalizeNumber(obj['itemGap'] ?? obj['ts_cgrid_gap'], 10),
			itemGapUnit: normalizeString(obj['itemGapUnit'], 'px'),
		};
	};

	// Normalize itemStyle
	const normalizeItemStyle = (val: unknown): VxConfig['itemStyle'] => {
		const defaults: VxConfig['itemStyle'] = {
			justifyContent: 'flex-start',
			padding: DEFAULT_BOX_VALUES,
			paddingUnit: 'px',
			height: 48,
			heightUnit: 'px',
			borderType: 'none',
			borderWidth: DEFAULT_BOX_VALUES,
			borderWidthUnit: 'px',
			borderColor: '',
			borderRadius: 0,
			borderRadiusUnit: 'px',
			boxShadow: DEFAULT_BOX_SHADOW,
			typography: DEFAULT_TYPOGRAPHY,
			textColor: '',
			backgroundColor: '',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			justifyContent: normalizeString(obj['justifyContent'] ?? obj['ts_al_align'], 'flex-start'),
			padding: normalizeBoxValues(obj['padding'] ?? obj['ts_action_padding']),
			paddingUnit: normalizeString(obj['paddingUnit'], 'px'),
			height: normalizeNumber(obj['height'] ?? obj['ts_acw_height'], 48),
			heightUnit: normalizeString(obj['heightUnit'], 'px'),
			borderType: normalizeString(obj['borderType'] ?? obj['ts_acw_border'], 'none'),
			borderWidth: normalizeBoxValues(obj['borderWidth']),
			borderWidthUnit: normalizeString(obj['borderWidthUnit'], 'px'),
			borderColor: normalizeString(obj['borderColor'], ''),
			borderRadius: normalizeNumber(obj['borderRadius'] ?? obj['ts_acw_border_radius'], 0),
			borderRadiusUnit: normalizeString(obj['borderRadiusUnit'], 'px'),
			boxShadow: normalizeBoxShadow(obj['boxShadow'] ?? obj['ts_acw_border_shadow']),
			typography: normalizeTypography(obj['typography'] ?? obj['ts_acw_typography']),
			textColor: normalizeString(obj['textColor'] ?? obj['ts_acw_initial_color'], ''),
			backgroundColor: normalizeString(obj['backgroundColor'] ?? obj['ts_acw_initial_bg'], ''),
		};
	};

	// Normalize iconContainer
	const normalizeIconContainer = (val: unknown): VxConfig['iconContainer'] => {
		const defaults: VxConfig['iconContainer'] = {
			background: '',
			size: 36,
			sizeUnit: 'px',
			borderType: 'solid',
			borderWidth: DEFAULT_BOX_VALUES,
			borderWidthUnit: 'px',
			borderColor: '',
			borderRadius: 50,
			borderRadiusUnit: 'px',
			boxShadow: DEFAULT_BOX_SHADOW,
			textSpacing: 0,
			textSpacingUnit: 'px',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			background: normalizeString(obj['background'] ?? obj['ts_acw_icon_con_bg'], ''),
			size: normalizeNumber(obj['size'] ?? obj['ts_acw_icon_con_size'], 36),
			sizeUnit: normalizeString(obj['sizeUnit'], 'px'),
			borderType: normalizeString(obj['borderType'] ?? obj['ts_acw_icon_con_border'], 'solid'),
			borderWidth: normalizeBoxValues(obj['borderWidth']),
			borderWidthUnit: normalizeString(obj['borderWidthUnit'], 'px'),
			borderColor: normalizeString(obj['borderColor'], ''),
			borderRadius: normalizeNumber(obj['borderRadius'] ?? obj['ts_acw_icon_con_radius'], 50),
			borderRadiusUnit: normalizeString(obj['borderRadiusUnit'], 'px'),
			boxShadow: normalizeBoxShadow(obj['boxShadow'] ?? obj['ts_acw_con_shadow']),
			textSpacing: normalizeNumber(obj['textSpacing'] ?? obj['ts_acw_icon_margin'], 0),
			textSpacingUnit: normalizeString(obj['textSpacingUnit'], 'px'),
		};
	};

	// Normalize icon settings
	const normalizeIconSettings = (val: unknown): VxConfig['icon'] => {
		const defaults: VxConfig['icon'] = {
			onTop: false,
			size: 18,
			sizeUnit: 'px',
			color: '',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			onTop: normalizeBoolean(obj['onTop'] ?? obj['ts_acw_icon_orient'], false),
			size: normalizeNumber(obj['size'] ?? obj['ts_acw_icon_size'], 18),
			sizeUnit: normalizeString(obj['sizeUnit'], 'px'),
			color: normalizeString(obj['color'] ?? obj['ts_acw_icon_color'], ''),
		};
	};

	// Normalize hover style
	const normalizeHoverStyle = (val: unknown): VxConfig['hoverStyle'] => {
		const defaults: VxConfig['hoverStyle'] = {
			boxShadow: DEFAULT_BOX_SHADOW,
			borderColor: '',
			textColor: '',
			backgroundColor: '',
			iconContainerBackground: '',
			iconContainerBorderColor: '',
			iconColor: '',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			boxShadow: normalizeBoxShadow(obj['boxShadow'] ?? obj['ts_acw_border_shadow_h']),
			borderColor: normalizeString(obj['borderColor'] ?? obj['ts_acw_border_h'], ''),
			textColor: normalizeString(obj['textColor'] ?? obj['ts_acw_initial_color_h'], ''),
			backgroundColor: normalizeString(obj['backgroundColor'] ?? obj['ts_acw_initial_bg_h'], ''),
			iconContainerBackground: normalizeString(obj['iconContainerBackground'] ?? obj['ts_acw_icon_con_bg_h'], ''),
			iconContainerBorderColor: normalizeString(obj['iconContainerBorderColor'] ?? obj['ts_acw_icon_con_bord_h'], ''),
			iconColor: normalizeString(obj['iconColor'] ?? obj['ts_acw_icon_color_h'], ''),
		};
	};

	// Normalize active style
	const normalizeActiveStyle = (val: unknown): VxConfig['activeStyle'] => {
		const defaults: VxConfig['activeStyle'] = {
			boxShadow: DEFAULT_BOX_SHADOW,
			textColor: '',
			backgroundColor: '',
			borderColor: '',
			iconContainerBackground: '',
			iconContainerBorderColor: '',
			iconColor: '',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			boxShadow: normalizeBoxShadow(obj['boxShadow'] ?? obj['ts_acw_border_shadow_a']),
			textColor: normalizeString(obj['textColor'] ?? obj['ts_acw_initial_color_a'], ''),
			backgroundColor: normalizeString(obj['backgroundColor'] ?? obj['ts_acw_initial_bg_a'], ''),
			borderColor: normalizeString(obj['borderColor'] ?? obj['ts_acw_initial_border_a'], ''),
			iconContainerBackground: normalizeString(obj['iconContainerBackground'] ?? obj['ts_acw_icon_con_bg_a'], ''),
			iconContainerBorderColor: normalizeString(obj['iconContainerBorderColor'] ?? obj['ts_acw_icon_con_bord_a'], ''),
			iconColor: normalizeString(obj['iconColor'] ?? obj['ts_acw_icon_color_a'], ''),
		};
	};

	// Normalize tooltip settings
	const normalizeTooltip = (val: unknown): VxConfig['tooltip'] => {
		const defaults: VxConfig['tooltip'] = {
			bottom: false,
			textColor: '',
			typography: DEFAULT_TYPOGRAPHY,
			backgroundColor: '',
			borderRadius: 0,
			borderRadiusUnit: 'px',
		};
		if (!val || typeof val !== 'object') return defaults;
		const obj = val as Record<string, unknown>;
		return {
			bottom: normalizeBoolean(obj['bottom'] ?? obj['tooltip_bottom'], false),
			textColor: normalizeString(obj['textColor'] ?? obj['ts_tooltip_color'], ''),
			typography: normalizeTypography(obj['typography'] ?? obj['ts_tooltip_typo']),
			backgroundColor: normalizeString(obj['backgroundColor'] ?? obj['ts_tooltip_bg'], ''),
			borderRadius: normalizeNumber(obj['borderRadius'] ?? obj['ts_tooltip_radius'], 0),
			borderRadiusUnit: normalizeString(obj['borderRadiusUnit'], 'px'),
		};
	};

	return {
		items: normalizeItems(raw.items ?? raw.ts_actions),
		icons: normalizeIcons(raw.icons),
		list: normalizeList(raw.list),
		itemStyle: normalizeItemStyle(raw.itemStyle ?? raw.item_style),
		iconContainer: normalizeIconContainer(raw.iconContainer ?? raw.icon_container),
		icon: normalizeIconSettings(raw.icon),
		hoverStyle: normalizeHoverStyle(raw.hoverStyle ?? raw.hover_style),
		activeStyle: normalizeActiveStyle(raw.activeStyle ?? raw.active_style),
		tooltip: normalizeTooltip(raw.tooltip),
	};
}

/**
 * Parse vxconfig JSON from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): VxConfig | null {
	const script = container.querySelector<HTMLScriptElement>('script.vxconfig');
	if (!script?.textContent) {
		console.error('[Advanced List] No vxconfig found');
		return null;
	}

	try {
		const raw = JSON.parse(script.textContent);
		return normalizeConfig(raw);
	} catch (e) {
		console.error('[Advanced List] Failed to parse vxconfig:', e);
		return null;
	}
}

/**
 * Build AdvancedListAttributes from VxConfig
 */
function buildAttributes(config: VxConfig): AdvancedListAttributes {
	return {
		// Items
		items: config.items || [],

		// Icons
		closeIcon: config.icons?.closeIcon || DEFAULT_ICON,
		messageIcon: config.icons?.messageIcon || DEFAULT_ICON,
		linkIcon: config.icons?.linkIcon || DEFAULT_ICON,
		shareIcon: config.icons?.shareIcon || DEFAULT_ICON,

		// List settings
		enableCssGrid: config.list?.enableCssGrid || false,
		gridColumns: config.list?.gridColumns || 3,
		itemWidth: config.list?.itemWidth || 'auto',
		customItemWidth: config.list?.customItemWidth || 100,
		customItemWidthUnit: config.list?.customItemWidthUnit || 'px',
		listJustify: config.list?.listJustify || 'left',
		itemGap: config.list?.itemGap || 10,
		itemGapUnit: config.list?.itemGapUnit || 'px',

		// Item style - normal
		itemJustifyContent: config.itemStyle?.justifyContent || 'flex-start',
		itemPadding: config.itemStyle?.padding || DEFAULT_BOX_VALUES,
		itemPaddingUnit: config.itemStyle?.paddingUnit || 'px',
		itemHeight: config.itemStyle?.height || 48,
		itemHeightUnit: config.itemStyle?.heightUnit || 'px',
		itemBorderType: config.itemStyle?.borderType || 'none',
		itemBorderWidth: config.itemStyle?.borderWidth || DEFAULT_BOX_VALUES,
		itemBorderWidthUnit: config.itemStyle?.borderWidthUnit || 'px',
		itemBorderColor: config.itemStyle?.borderColor || '',
		itemBorderRadius: config.itemStyle?.borderRadius || 0,
		itemBorderRadiusUnit: config.itemStyle?.borderRadiusUnit || 'px',
		itemBoxShadow: config.itemStyle?.boxShadow || DEFAULT_BOX_SHADOW,
		itemTypography: config.itemStyle?.typography || DEFAULT_TYPOGRAPHY,
		itemTextColor: config.itemStyle?.textColor || '',
		itemBackgroundColor: config.itemStyle?.backgroundColor || '',

		// Icon container
		iconContainerBackground: config.iconContainer?.background || '',
		iconContainerSize: config.iconContainer?.size || 36,
		iconContainerSizeUnit: config.iconContainer?.sizeUnit || 'px',
		iconContainerBorderType: config.iconContainer?.borderType || 'solid',
		iconContainerBorderWidth: config.iconContainer?.borderWidth || DEFAULT_BOX_VALUES,
		iconContainerBorderWidthUnit: config.iconContainer?.borderWidthUnit || 'px',
		iconContainerBorderColor: config.iconContainer?.borderColor || '',
		iconContainerBorderRadius: config.iconContainer?.borderRadius || 50,
		iconContainerBorderRadiusUnit: config.iconContainer?.borderRadiusUnit || 'px',
		iconContainerBoxShadow: config.iconContainer?.boxShadow || DEFAULT_BOX_SHADOW,
		iconTextSpacing: config.iconContainer?.textSpacing || 0,
		iconTextSpacingUnit: config.iconContainer?.textSpacingUnit || 'px',

		// Icon
		iconOnTop: config.icon?.onTop || false,
		iconSize: config.icon?.size || 18,
		iconSizeUnit: config.icon?.sizeUnit || 'px',
		iconColor: config.icon?.color || '',

		// Hover style
		itemBoxShadowHover: config.hoverStyle?.boxShadow || DEFAULT_BOX_SHADOW,
		itemBorderColorHover: config.hoverStyle?.borderColor || '',
		itemTextColorHover: config.hoverStyle?.textColor || '',
		itemBackgroundColorHover: config.hoverStyle?.backgroundColor || '',
		iconContainerBackgroundHover: config.hoverStyle?.iconContainerBackground || '',
		iconContainerBorderColorHover: config.hoverStyle?.iconContainerBorderColor || '',
		iconColorHover: config.hoverStyle?.iconColor || '',

		// Active style
		itemBoxShadowActive: config.activeStyle?.boxShadow || DEFAULT_BOX_SHADOW,
		itemTextColorActive: config.activeStyle?.textColor || '',
		itemBackgroundColorActive: config.activeStyle?.backgroundColor || '',
		itemBorderColorActive: config.activeStyle?.borderColor || '',
		iconContainerBackgroundActive: config.activeStyle?.iconContainerBackground || '',
		iconContainerBorderColorActive: config.activeStyle?.iconContainerBorderColor || '',
		iconColorActive: config.activeStyle?.iconColor || '',

		// Tooltip
		tooltipBottom: config.tooltip?.bottom || false,
		tooltipTextColor: config.tooltip?.textColor || '',
		tooltipTypography: config.tooltip?.typography || DEFAULT_TYPOGRAPHY,
		tooltipBackgroundColor: config.tooltip?.backgroundColor || '',
		tooltipBorderRadius: config.tooltip?.borderRadius || 0,
		tooltipBorderRadiusUnit: config.tooltip?.borderRadiusUnit || 'px',
	};
}

/**
 * Get REST API URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	if (window.voxelFseAdvancedList?.restUrl) {
		return window.voxelFseAdvancedList.restUrl;
	}
	return getRestBaseUrl();
}

/**
 * Fetch post context from REST API (if needed)
 * This provides data for post-dependent actions
 */
async function fetchPostContext(): Promise<PostContext | null> {
	// Try to get post ID from page context
	// This would need to be enhanced based on how Voxel provides post context
	const postIdMeta = document.querySelector<HTMLMetaElement>('meta[name="vx-post-id"]');
	const postId = postIdMeta?.content ? parseInt(postIdMeta.content, 10) : null;

	if (!postId) {
		// No post context available - post-dependent actions won't work
		return null;
	}

	try {
		const restUrl = getRestUrl();

		const headers: HeadersInit = {};
		const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(
			`${restUrl}voxel-fse/v1/advanced-list/post-context?post_id=${postId}`,
			{
				credentials: 'same-origin',
				headers,
			}
		);

		if (!response.ok) {
			console.warn('[Advanced List] Failed to fetch post context');
			return null;
		}

		return await response.json();
	} catch (error) {
		console.warn('[Advanced List] Error fetching post context:', error);
		return null;
	}
}

/**
 * Check if any items need post context
 */
function needsPostContext(items: ActionItem[]): boolean {
	const postDependentActions = [
		'action_follow_post',
		'action_follow',
		'edit_post',
		'delete_post',
		'unpublish_post',
		'publish_post',
		'show_post_on_map',
		'share_post',
		'view_post_stats',
		'add_to_cart',
		'promote_post',
		'select_addition',
		'action_gcal',
		'action_ical',
	];

	return items.some((item) => postDependentActions.includes(item.actionType));
}

/**
 * Frontend wrapper component
 */
interface FrontendWrapperProps {
	attributes: AdvancedListAttributes;
	postContext: PostContext | null;
}

function FrontendWrapper({ attributes, postContext }: FrontendWrapperProps) {
	return (
		<AdvancedListComponent
			attributes={attributes}
			context="frontend"
			postContext={postContext}
		/>
	);
}

/**
 * Initialize all Advanced List blocks on the page
 */
async function initBlocks() {
	const containers = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-advanced-list-frontend:not([data-react-mounted])'
	);

	if (containers.length === 0) {
		return;
	}

	// Fetch post context once for all blocks
	let postContext: PostContext | null = null;

	// Check if any block needs post context
	const configs: Array<{ container: HTMLElement; config: VxConfig }> = [];

	containers.forEach((container) => {
		const config = parseVxConfig(container);
		if (config) {
			configs.push({ container, config });
		}
	});

	// Check if we need to fetch post context
	const needsContext = configs.some(({ config }) =>
		needsPostContext(config.items)
	);

	if (needsContext) {
		postContext = await fetchPostContext();
	}

	// Mount React components
	for (const { container, config } of configs) {
		// Mark as mounted to prevent double initialization
		container.setAttribute('data-react-mounted', 'true');

		const attributes = buildAttributes(config);

		// Clear placeholder content
		container.innerHTML = '';

		// Mount React component
		const root = createRoot(container);
		root.render(
			<FrontendWrapper
				attributes={attributes}
				postContext={postContext}
			/>
		);
	}
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initBlocks);
} else {
	initBlocks();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initBlocks);
window.addEventListener('pjax:complete', initBlocks);
