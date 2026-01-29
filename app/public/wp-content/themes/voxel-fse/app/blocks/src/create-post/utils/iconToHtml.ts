/**
 * Icon to HTML Converter
 * Converts IconValue objects to HTML strings for use with dangerouslySetInnerHTML
 *
 * This is necessary because some components (like FieldPopup) require icon HTML strings,
 * while getFieldIcon() returns React elements.
 *
 * EXACT Voxel Pattern:
 * Voxel uses: \Voxel\get_icon_markup(...) ?: \Voxel\svg('icon.svg')
 * We use: iconToHtml(iconValue, fallback) - returns widget icon OR fallback
 */
import type { IconValue } from '../types';

/**
 * Convert an IconValue object to an HTML string
 *
 * @param iconValue Icon object from Voxel widget settings
 * @param fallback Optional fallback HTML string (Voxel's default SVG)
 * @returns HTML string representation of the icon
 *
 * Examples:
 * - Font icon: iconToHtml({ library: 'icon', value: 'lar la-clock' })
 *   Returns: '<i aria-hidden="true" class="lar la-clock"></i>'
 *
 * - SVG icon: iconToHtml({ library: 'svg', value: 'https://...' })
 *   Returns: '<img src="https://..." ... />'
 *
 * - With fallback: iconToHtml({ library: '', value: '' }, VOXEL_CLOCK_ICON)
 *   Returns: VOXEL_CLOCK_ICON (Voxel's default SVG)
 */
export function iconToHtml(iconValue?: IconValue, fallback: string = ''): string {
	// If no icon value provided or value is empty, use fallback
	if (!iconValue || !iconValue.value) {
		return fallback;
	}

	// Convert font icon (Line Awesome, Font Awesome, etc.) to <i> tag
	if (iconValue.library === 'icon') {
		return `<i aria-hidden="true" class="${iconValue.value}"></i>`;
	}

	// Convert uploaded SVG to <img> tag
	if (iconValue.library === 'svg') {
		return `<img src="${iconValue.value}" alt="" style="width: 24px; height: 24px;" aria-hidden="true" />`;
	}

	// Unknown library type - use fallback
	return fallback;
}
