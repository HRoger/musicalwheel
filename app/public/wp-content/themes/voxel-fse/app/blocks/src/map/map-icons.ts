/**
 * Map Block - Shared Icon Constants & Utilities
 *
 * DRY: Used by BOTH edit.tsx (editor preview) and frontend.tsx (frontend rendering)
 * to ensure consistent icon rendering across contexts.
 *
 * @package VoxelFSE
 */

/**
 * Default checkmark SVG (fallback when no icon is configured)
 * Matches Voxel's checkmark-circle.svg (exact copy from voxel/assets/images/svgs/checkmark-circle.svg)
 */
export const DEFAULT_CHECKMARK_SVG = `<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)"><path d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM15.5071 9.85447C15.2142 9.56158 14.7393 9.56158 14.4464 9.85447L10.9649 13.336L9.55359 11.9247C9.2607 11.6318 8.78582 11.6318 8.49293 11.9247C8.20004 12.2176 8.20004 12.6925 8.49294 12.9854L10.4346 14.927C10.7275 15.2199 11.2023 15.2199 11.4952 14.927L15.5071 10.9151C15.8 10.6222 15.8 10.1474 15.5071 9.85447Z" fill="#343C54"/></svg>`;

/**
 * Default search SVG (fallback when no icon is configured)
 * Matches Voxel's search.svg (exact copy from voxel/assets/images/svgs/search.svg)
 */
export const DEFAULT_SEARCH_SVG = `<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="#343C54"/></svg>`;

/**
 * Default geolocation SVG (fallback when no icon is configured)
 * Matches Voxel's current-location-icon.svg
 */
export const DEFAULT_GEOLOCATION_SVG = `<svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z" fill="currentColor"/><path d="M13.1523 2.19141C13.1523 1.77719 12.8166 1.44141 12.4023 1.44141C11.9881 1.44141 11.6523 1.77719 11.6523 2.19141V3.72405C7.5566 4.0822 4.29367 7.34575 3.93549 11.4414H2.40234C1.98813 11.4414 1.65234 11.7772 1.65234 12.1914C1.65234 12.6056 1.98813 12.9414 2.40234 12.9414H3.93545C4.29344 17.0373 7.55645 20.301 11.6523 20.6592V22.1914C11.6523 22.6056 11.9881 22.9414 12.4023 22.9414C12.8166 22.9414 13.1523 22.6056 13.1523 22.1914V20.6592C17.2482 20.301 20.5113 17.0373 20.8692 12.9414H22.4023C22.8166 12.9414 23.1523 12.6056 23.1523 12.1914C23.1523 11.7772 22.8166 11.4414 22.4023 11.4414H20.8692C20.511 7.34575 17.2481 4.0822 13.1523 3.72405V2.19141ZM12.4025 7.94141C14.7496 7.94141 16.6522 9.84446 16.6522 12.1914C16.6522 14.5383 14.7496 16.4414 12.4025 16.4414C10.0554 16.4414 8.15283 14.5384 8.15283 12.1914C8.15283 9.84446 10.0554 7.94141 12.4025 7.94141ZM12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z" fill="currentColor"/></svg>`;

/**
 * Icon value interface (matches Voxel's icon configuration)
 */
export interface IconValue {
	library?: string;
	value?: string;
}

/**
 * Render an IconValue to HTML string
 * Implements 1:1 parity with Voxel's \Voxel\get_icon_markup() function
 *
 * @param icon - The icon configuration (library + value)
 * @param fallbackHtml - Fallback HTML if icon is empty/invalid
 * @returns HTML string for the icon
 */
export function renderIconToHtml(
	icon: IconValue | undefined,
	fallbackHtml: string = ''
): string {
	// No icon configured - use fallback
	if (!icon || !icon.value) {
		return fallbackHtml;
	}

	// Icon font library (Line Awesome, Font Awesome, etc.)
	// library values: 'icon', 'fa-solid', 'fa-regular', 'fa-brands', 'line-awesome', ''
	if (icon.library === 'icon' || !icon.library || icon.library === '' ||
		icon.library === 'fa-solid' || icon.library === 'fa-regular' ||
		icon.library === 'fa-brands' || icon.library === 'line-awesome') {
		return `<i class="${icon.value}"></i>`;
	}

	// SVG library - can be inline SVG or URL
	if (icon.library === 'svg' && icon.value) {
		// Inline SVG (starts with <svg or <?xml)
		if (icon.value.startsWith('<svg') || icon.value.startsWith('<?xml')) {
			return `<span class="ts-icon-svg">${icon.value}</span>`;
		}
		// SVG URL
		return `<img src="${icon.value}" alt="" class="ts-icon-svg" />`;
	}

	// Dynamic library - treat as icon class
	if (icon.library === 'dynamic') {
		return `<i class="${icon.value}"></i>`;
	}

	// Fallback for unknown library types
	return fallbackHtml;
}
