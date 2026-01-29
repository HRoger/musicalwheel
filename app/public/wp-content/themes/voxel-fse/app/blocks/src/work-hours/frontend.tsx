/**
 * Work Hours Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches work-hours data from REST API for dynamic schedule display.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/work-hours.php (797 lines)
 * - Field type: themes/voxel/app/post-types/fields/work-hours-field.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/work-hours.php (797 lines)
 *
 * GENERAL:
 * ✅ ts_source_field - Work hours field key (voxel-post-field control)
 * ✅ ts_wh_collapse - Collapse mode (full, toggle)
 * ✅ wh_wrapper_border - Wrapper border
 * ✅ wh_wrapper_border_radius - Border radius (responsive box)
 * ✅ wh_wrapper_shadow - Box shadow
 *
 * TOP AREA:
 * ✅ wh_status_bg - Status background color
 * ✅ wh_status_icon_size - Status icon size (responsive)
 * ✅ wh_status_label_typo - Label typography
 * ✅ wh_status_label_color - Label text color
 * ✅ wh_current_hours_typo - Current hours typography
 * ✅ wh_current_hours_color - Current hours text color
 * ✅ wh_top_padding - Top area padding (responsive box)
 *
 * BODY:
 * ✅ wh_body_bg - Body background color
 * ✅ wh_separator_color - Day separator color
 * ✅ wh_day_typo - Day name typography
 * ✅ wh_day_color - Day name text color
 * ✅ wh_hours_typo - Hours typography
 * ✅ wh_hours_color - Hours text color
 * ✅ wh_body_padding - Body padding (responsive box)
 *
 * OPEN STATE:
 * ✅ wh_open_icon - Open state icon
 * ✅ wh_open_text - Open state text (default: "Open now")
 * ✅ wh_open_icon_color - Icon color
 * ✅ wh_open_text_color - Text color
 * ✅ wh_open_bg - Background color
 *
 * CLOSED STATE:
 * ✅ wh_closed_icon - Closed state icon
 * ✅ wh_closed_text - Closed state text (default: "Closed now")
 * ✅ wh_closed_icon_color - Icon color
 * ✅ wh_closed_text_color - Text color
 * ✅ wh_closed_bg - Background color
 *
 * APPOINTMENT ONLY STATE:
 * ✅ wh_appointment_icon - Appointment only icon
 * ✅ wh_appointment_text - Appointment text (default: "By appointment only")
 * ✅ wh_appointment_icon_color - Icon color
 * ✅ wh_appointment_text_color - Text color
 * ✅ wh_appointment_bg - Background color
 *
 * NOT AVAILABLE STATE:
 * ✅ wh_na_icon - Not available icon
 * ✅ wh_na_text - Not available text
 * ✅ wh_na_icon_color - Icon color
 * ✅ wh_na_text_color - Text color
 * ✅ wh_na_bg - Background color
 *
 * ICONS:
 * ✅ wh_down_icon - Dropdown/toggle icon
 *
 * ACCORDION BUTTON:
 * ✅ wh_acc_btn_size - Button size (responsive)
 * ✅ wh_acc_btn_icon_size - Button icon size (responsive)
 * ✅ wh_acc_btn_icon_color - Icon color (normal)
 * ✅ wh_acc_btn_icon_color_hover - Icon color (hover)
 * ✅ wh_acc_btn_bg - Background color (normal)
 * ✅ wh_acc_btn_bg_hover - Background color (hover)
 * ✅ wh_acc_btn_border - Border (normal)
 * ✅ wh_acc_btn_border_hover - Border (hover)
 * ✅ wh_acc_btn_border_radius - Border radius (responsive box)
 *
 * HTML STRUCTURE:
 * ✅ .ts-work-hours - Main container
 * ✅ .ts-wh-top - Status area (icon + label + current hours)
 * ✅ .ts-wh-body - Schedule body (day rows)
 * ✅ .ts-wh-day - Day row container
 * ✅ .ts-wh-day-name - Day name text
 * ✅ .ts-wh-hours - Hours text
 * ✅ .ts-wh-toggle - Toggle button (when collapse='toggle')
 * ✅ .ts-wh-open / .ts-wh-closed - State classes
 *
 * DATA ATTRIBUTES:
 * ✅ data-field - Field key for REST API
 * ✅ data-collapse - Collapse mode (full/toggle)
 *
 * REST API:
 * ✅ voxel-fse/v1/work-hours/{postId} - Schedule data endpoint
 * ✅ Response: schedule, isOpenNow, weekdays, today, localTime
 *
 * MULTISITE SUPPORT:
 * ✅ getRestBaseUrl() - Handles subdirectory multisite
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Async data fetching with proper error handling
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import WorkHoursComponent from './shared/WorkHoursComponent';
import { WorkHoursAttributes, VxConfig } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

interface Window {
	__voxelFseFrontend?: boolean;
	__post_id?: number;
}

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): VxConfig {
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
			const parsed = parseInt(val, 10);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Normalize attributes object
	const rawAttrs = (raw.attributes ?? {}) as Record<string, unknown>;
	const attributes: WorkHoursAttributes = {
		blockId: normalizeString(rawAttrs.blockId ?? rawAttrs.block_id, ''),
		fieldKey: normalizeString(rawAttrs.fieldKey ?? rawAttrs.field_key ?? rawAttrs.ts_source_field, ''),
		collapseMode: normalizeString(rawAttrs.collapseMode ?? rawAttrs.collapse_mode ?? rawAttrs.ts_wh_collapse, 'full') as 'full' | 'toggle',
		// Wrapper styling
		wrapperBorder: rawAttrs.wrapperBorder ?? rawAttrs.wrapper_border ?? rawAttrs.wh_wrapper_border,
		wrapperBorderRadius: rawAttrs.wrapperBorderRadius ?? rawAttrs.wrapper_border_radius ?? rawAttrs.wh_wrapper_border_radius,
		wrapperShadow: rawAttrs.wrapperShadow ?? rawAttrs.wrapper_shadow ?? rawAttrs.wh_wrapper_shadow,
		// Top area styling
		statusBg: normalizeString(rawAttrs.statusBg ?? rawAttrs.status_bg ?? rawAttrs.wh_status_bg, ''),
		statusIconSize: rawAttrs.statusIconSize ?? rawAttrs.status_icon_size ?? rawAttrs.wh_status_icon_size,
		labelTypo: rawAttrs.labelTypo ?? rawAttrs.label_typo ?? rawAttrs.wh_status_label_typo,
		labelColor: normalizeString(rawAttrs.labelColor ?? rawAttrs.label_color ?? rawAttrs.wh_status_label_color, ''),
		currentHoursTypo: rawAttrs.currentHoursTypo ?? rawAttrs.current_hours_typo ?? rawAttrs.wh_current_hours_typo,
		currentHoursColor: normalizeString(rawAttrs.currentHoursColor ?? rawAttrs.current_hours_color ?? rawAttrs.wh_current_hours_color, ''),
		topPadding: rawAttrs.topPadding ?? rawAttrs.top_padding ?? rawAttrs.wh_top_padding,
		// Body styling
		bodyBg: normalizeString(rawAttrs.bodyBg ?? rawAttrs.body_bg ?? rawAttrs.wh_body_bg, ''),
		separatorColor: normalizeString(rawAttrs.separatorColor ?? rawAttrs.separator_color ?? rawAttrs.wh_separator_color, ''),
		dayTypo: rawAttrs.dayTypo ?? rawAttrs.day_typo ?? rawAttrs.wh_day_typo,
		dayColor: normalizeString(rawAttrs.dayColor ?? rawAttrs.day_color ?? rawAttrs.wh_day_color, ''),
		hoursTypo: rawAttrs.hoursTypo ?? rawAttrs.hours_typo ?? rawAttrs.wh_hours_typo,
		hoursColor: normalizeString(rawAttrs.hoursColor ?? rawAttrs.hours_color ?? rawAttrs.wh_hours_color, ''),
		bodyPadding: rawAttrs.bodyPadding ?? rawAttrs.body_padding ?? rawAttrs.wh_body_padding,
		// Status states
		openIcon: rawAttrs.openIcon ?? rawAttrs.open_icon ?? rawAttrs.wh_open_icon,
		openText: normalizeString(rawAttrs.openText ?? rawAttrs.open_text ?? rawAttrs.wh_open_text, 'Open now'),
		openIconColor: normalizeString(rawAttrs.openIconColor ?? rawAttrs.open_icon_color ?? rawAttrs.wh_open_icon_color, ''),
		openTextColor: normalizeString(rawAttrs.openTextColor ?? rawAttrs.open_text_color ?? rawAttrs.wh_open_text_color, ''),
		openBg: normalizeString(rawAttrs.openBg ?? rawAttrs.open_bg ?? rawAttrs.wh_open_bg, ''),
		closedIcon: rawAttrs.closedIcon ?? rawAttrs.closed_icon ?? rawAttrs.wh_closed_icon,
		closedText: normalizeString(rawAttrs.closedText ?? rawAttrs.closed_text ?? rawAttrs.wh_closed_text, 'Closed now'),
		closedIconColor: normalizeString(rawAttrs.closedIconColor ?? rawAttrs.closed_icon_color ?? rawAttrs.wh_closed_icon_color, ''),
		closedTextColor: normalizeString(rawAttrs.closedTextColor ?? rawAttrs.closed_text_color ?? rawAttrs.wh_closed_text_color, ''),
		closedBg: normalizeString(rawAttrs.closedBg ?? rawAttrs.closed_bg ?? rawAttrs.wh_closed_bg, ''),
		appointmentIcon: rawAttrs.appointmentIcon ?? rawAttrs.appointment_icon ?? rawAttrs.wh_appointment_icon,
		appointmentText: normalizeString(rawAttrs.appointmentText ?? rawAttrs.appointment_text ?? rawAttrs.wh_appointment_text, 'By appointment only'),
		appointmentIconColor: normalizeString(rawAttrs.appointmentIconColor ?? rawAttrs.appointment_icon_color ?? rawAttrs.wh_appointment_icon_color, ''),
		appointmentTextColor: normalizeString(rawAttrs.appointmentTextColor ?? rawAttrs.appointment_text_color ?? rawAttrs.wh_appointment_text_color, ''),
		appointmentBg: normalizeString(rawAttrs.appointmentBg ?? rawAttrs.appointment_bg ?? rawAttrs.wh_appointment_bg, ''),
		naIcon: rawAttrs.naIcon ?? rawAttrs.na_icon ?? rawAttrs.wh_na_icon,
		naText: normalizeString(rawAttrs.naText ?? rawAttrs.na_text ?? rawAttrs.wh_na_text, ''),
		naIconColor: normalizeString(rawAttrs.naIconColor ?? rawAttrs.na_icon_color ?? rawAttrs.wh_na_icon_color, ''),
		naTextColor: normalizeString(rawAttrs.naTextColor ?? rawAttrs.na_text_color ?? rawAttrs.wh_na_text_color, ''),
		naBg: normalizeString(rawAttrs.naBg ?? rawAttrs.na_bg ?? rawAttrs.wh_na_bg, ''),
		// Toggle/accordion button
		downIcon: rawAttrs.downIcon ?? rawAttrs.down_icon ?? rawAttrs.wh_down_icon,
		accBtnSize: rawAttrs.accBtnSize ?? rawAttrs.acc_btn_size ?? rawAttrs.wh_acc_btn_size,
		accBtnIconSize: rawAttrs.accBtnIconSize ?? rawAttrs.acc_btn_icon_size ?? rawAttrs.wh_acc_btn_icon_size,
		accBtnIconColor: normalizeString(rawAttrs.accBtnIconColor ?? rawAttrs.acc_btn_icon_color ?? rawAttrs.wh_acc_btn_icon_color, ''),
		accBtnIconColorHover: normalizeString(rawAttrs.accBtnIconColorHover ?? rawAttrs.acc_btn_icon_color_hover ?? rawAttrs.wh_acc_btn_icon_color_hover, ''),
		accBtnBg: normalizeString(rawAttrs.accBtnBg ?? rawAttrs.acc_btn_bg ?? rawAttrs.wh_acc_btn_bg, ''),
		accBtnBgHover: normalizeString(rawAttrs.accBtnBgHover ?? rawAttrs.acc_btn_bg_hover ?? rawAttrs.wh_acc_btn_bg_hover, ''),
		accBtnBorder: rawAttrs.accBtnBorder ?? rawAttrs.acc_btn_border ?? rawAttrs.wh_acc_btn_border,
		accBtnBorderHover: rawAttrs.accBtnBorderHover ?? rawAttrs.acc_btn_border_hover ?? rawAttrs.wh_acc_btn_border_hover,
		accBtnBorderRadius: rawAttrs.accBtnBorderRadius ?? rawAttrs.acc_btn_border_radius ?? rawAttrs.wh_acc_btn_border_radius,
	} as WorkHoursAttributes;

	return {
		attributes,
		postId: normalizeNumber(raw.postId ?? raw.post_id, 0),
		fieldKey: normalizeString(raw.fieldKey ?? raw.field_key ?? rawAttrs.fieldKey ?? rawAttrs.field_key, ''),
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: Element): VxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');
	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent);
			return normalizeConfig(raw);
		} catch (e) {
			console.error('Failed to parse vxconfig:', e);
			return null;
		}
	}
	return null;
}

// Fetch work-hours data from REST API
async function fetchWorkHoursData(
  postId: number,
  fieldKey: string
): Promise<{
  schedule: Record<string, any>;
  isOpenNow: boolean;
  weekdays: Record<string, string>;
  today: string;
  localTime: string;
} | null> {
  try {
    // MULTISITE FIX: Use getRestBaseUrl() for multisite subdirectory support
    const restUrl = getRestBaseUrl();
    const response = await fetch(
      `${restUrl}voxel-fse/v1/work-hours/${postId}?field=${encodeURIComponent(fieldKey)}`
    );

    if (!response.ok) {
      console.error('Failed to fetch work-hours data:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching work-hours data:', error);
    return null;
  }
}

// Hydrate work-hours blocks on frontend
function initBlocks() {
  const blocks = document.querySelectorAll<HTMLDivElement>(
    '.wp-block-voxel-fse-work-hours'
  );

  blocks.forEach((block) => {
    // Check if already initialized
    if (block.dataset.reactMounted === 'true') {
      return;
    }

    const vxconfig = parseVxConfig(block);
    if (!vxconfig) {
      console.warn('No vxconfig found for work-hours block');
      return;
    }

    const { attributes, postId, fieldKey } = vxconfig;

    // Find or create container for React
    let placeholder = block.querySelector<HTMLDivElement>(
      '.voxel-fse-work-hours-placeholder'
    );

    if (!placeholder) {
      // Create placeholder if it doesn't exist
      placeholder = document.createElement('div');
      placeholder.className = 'voxel-fse-work-hours-placeholder';
      block.appendChild(placeholder);
    }

    // Fetch work-hours data from API
    if (postId && fieldKey) {
      fetchWorkHoursData(postId, fieldKey)
        .then((data) => {
          if (data) {
            const root = createRoot(placeholder!);
            root.render(
              <WorkHoursComponent
                attributes={attributes}
                scheduleData={data.schedule}
                isOpenNow={data.isOpenNow}
                weekdays={data.weekdays}
                today={data.today}
                localTime={data.localTime}
                isPreview={false}
              />
            );
            block.dataset.reactMounted = 'true';
          }
        })
        .catch((error) => {
          console.error('Failed to initialize work-hours block:', error);
        });
    } else {
      // If no post ID or field key, render with mock data
      const root = createRoot(placeholder);
      root.render(
        <WorkHoursComponent attributes={attributes} isPreview={true} />
      );
      block.dataset.reactMounted = 'true';
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlocks);
} else {
  initBlocks();
}

// Support Turbo/PJAX navigation
if ((window as any).Turbo) {
  document.addEventListener('turbo:load', initBlocks);
}

// Support custom events
document.addEventListener('voxel:blocks:init', initBlocks);

export default initBlocks;
