/**
 * Default Icon SVG Strings
 *
 * SVG strings for icons used in dangerouslySetInnerHTML contexts.
 * These are needed when icons must be inserted as HTML strings (e.g., pagination buttons).
 *
 * Evidence:
 * - Used in: post-feed pagination, no results, carousel navigation
 *
 * @package VoxelFSE
 */

/**
 * Default icons as SVG strings for HTML injection
 */
export const DEFAULT_ICONS = {
	/** Plus icon for "Load more" button */
	loadMore: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,

	/** Magnifying glass for "No results" state (matches Voxel's keyword-research.svg) */
	noResults: `<svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="currentColor"/></svg>`,

	/** Left arrow for "Previous" pagination button */
	leftArrow: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,

	/** Right arrow for "Next" pagination button */
	rightArrow: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,

	/** Left chevron for carousel "Previous" button */
	leftChevron: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,

	/** Right chevron for carousel "Next" button */
	rightChevron: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,

	/** Reset/refresh icon for "Reset filters" link */
	reset: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4v5h.582M19.938 13A8.001 8.001 0 005.217 9.144M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.721-3.856M14.42 15H19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
};

/**
 * Icon value type (matches block attribute structure)
 */
export interface IconValue {
	library?: string;
	value?: string;
}

/**
 * Get icon HTML from IconValue or use default
 *
 * Resolves an IconValue to an HTML string for dangerouslySetInnerHTML.
 *
 * @param icon - The icon value from attributes
 * @param defaultIcon - Default SVG string if icon is not set
 * @returns HTML string for the icon
 */
export function getIconHtml(
	icon: IconValue | undefined,
	defaultIcon: string
): string {
	if (!icon || !icon.value) {
		return defaultIcon;
	}

	if (icon.library === 'svg') {
		// SVG URL or inline SVG
		return icon.value;
	}

	// Icon font class (e.g., "las la-arrow-left")
	return `<i class="${icon.value}"></i>`;
}
