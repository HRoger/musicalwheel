/**
 * Voxel Icons - SVG icons matching Voxel theme exactly
 *
 * These are 1:1 copies of the SVGs from themes/voxel/assets/images/svgs/
 * to ensure HTML structure matches Voxel exactly.
 *
 * @package VoxelFSE
 */

import type { IconConfig } from '../types';

/**
 * Render an IconConfig to JSX
 *
 * Handles three types of icons:
 * - library: 'icon' - CSS class icon (e.g., "las la-search")
 * - library: 'svg' - SVG URL (renders as img)
 * - library: '' or undefined - No icon (returns null)
 *
 * @param iconConfig - IconConfig object with library and value
 * @param fallback - Optional fallback JSX element if no icon configured
 * @param className - Optional additional className for the icon wrapper
 * @returns JSX element or null
 */
export function renderIcon(
	iconConfig: IconConfig | undefined,
	fallback?: JSX.Element | null,
	className?: string
): JSX.Element | null {
	// No icon configured - return fallback
	if (!iconConfig || !iconConfig.library || !iconConfig.value) {
		return fallback ?? null;
	}

	const { library, value } = iconConfig;

	// CSS class icon (e.g., Line Awesome "las la-search")
	if (library === 'icon') {
		return (
			<i
				className={className ? `${value} ${className}` : value}
				aria-hidden="true"
			/>
		);
	}

	// SVG URL icon
	if (library === 'svg') {
		return (
			<img
				src={value}
				alt=""
				className={className}
				style={{ width: '1em', height: '1em' }}
			/>
		);
	}

	// Dynamic tags - value contains @tags()...@endtags()
	// This should be pre-rendered on the server or handled separately
	if (library === 'dynamic') {
		// For now, return null - dynamic icons need special handling
		return fallback ?? null;
	}

	return fallback ?? null;
}

/**
 * Check if an IconConfig has a valid icon value
 */
export function hasIcon(iconConfig: IconConfig | undefined): boolean {
	return !!(iconConfig?.library && iconConfig?.value);
}

export const VoxelIcons = {
	search: (
		<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path fillRule="evenodd" clipRule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="#343C54"/>
		</svg>
	),

	close: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path d="M5.9545 5.95548C6.39384 5.51614 7.10616 5.51614 7.5455 5.95548L11.999 10.409L16.4524 5.95561C16.8918 5.51627 17.6041 5.51627 18.0434 5.95561C18.4827 6.39495 18.4827 7.10726 18.0434 7.5466L13.59 12L18.0434 16.4534C18.4827 16.8927 18.4827 17.605 18.0434 18.0444C17.6041 18.4837 16.8918 18.4837 16.4524 18.0444L11.999 13.591L7.5455 18.0445C7.10616 18.4839 6.39384 18.4839 5.9545 18.0445C5.51517 17.6052 5.51516 16.8929 5.9545 16.4535L10.408 12L5.9545 7.54647C5.51516 7.10713 5.51517 6.39482 5.9545 5.95548Z" fill="#343C54"/>
		</svg>
	),

	reload: (
		<svg width="80" height="80" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path d="M21.6009 10.4593C22.001 10.3521 22.2384 9.94088 22.1312 9.54078C21.59 7.52089 20.3974 5.73603 18.7384 4.46302C17.0793 3.19001 15.0466 2.5 12.9555 2.5C10.8644 2.5 8.83164 3.19001 7.17262 4.46302C6.12405 5.26762 5.26179 6.2767 4.63257 7.42036L2.86504 6.92617C2.76093 6.89707 2.65423 6.89133 2.55153 6.9068C2.46222 6.91962 2.37374 6.94889 2.29039 6.99582C1.92945 7.19903 1.80158 7.65636 2.00479 8.0173L3.73942 11.0983C3.83701 11.2717 3.99946 11.3991 4.19104 11.4527C4.30333 11.4841 4.42023 11.4886 4.53266 11.4673C4.61373 11.4524 4.69254 11.4242 4.7657 11.383L7.84641 9.64831C8.11073 9.49948 8.25936 9.20608 8.22302 8.90493C8.18668 8.60378 7.9725 8.35417 7.68037 8.27249L6.1241 7.83737C6.6343 6.99996 7.29751 6.2579 8.08577 5.65305C9.48282 4.58106 11.1946 4 12.9555 4C14.7164 4 16.4282 4.58106 17.8252 5.65305C19.2223 6.72504 20.2266 8.22807 20.6823 9.92901C20.7895 10.3291 21.2008 10.5665 21.6009 10.4593Z" fill="#343C54"/>
			<path d="M4.30739 13.5387C3.90729 13.6459 3.66985 14.0572 3.77706 14.4573C4.31829 16.4771 5.51089 18.262 7.16991 19.535C8.82892 20.808 10.8616 21.498 12.9528 21.498C15.0439 21.498 17.0766 20.808 18.7356 19.535C19.7859 18.7291 20.6493 17.7181 21.2787 16.5722L23.0083 17.0557C23.1218 17.0961 23.2447 17.1091 23.3661 17.0917C23.5554 17.0658 23.7319 16.968 23.8546 16.8116C24.0419 16.573 24.0669 16.245 23.9181 15.9807L22.1835 12.8996C22.0859 12.7263 21.9234 12.5988 21.7319 12.5453C21.64 12.5196 21.5451 12.5119 21.4521 12.5216C21.3493 12.5317 21.2488 12.5629 21.1571 12.6146L18.0764 14.3493C17.7155 14.5525 17.5876 15.0099 17.7909 15.3708C17.9016 15.5675 18.0879 15.695 18.2929 15.7373L19.7875 16.1552C19.2768 16.9949 18.6125 17.7388 17.8225 18.345C16.4255 19.417 14.7137 19.998 12.9528 19.998C11.1918 19.998 9.4801 19.417 8.08305 18.345C6.686 17.273 5.68171 15.77 5.22595 14.069C5.11874 13.6689 4.70749 13.4315 4.30739 13.5387Z" fill="#343C54"/>
		</svg>
	),

	filterslider: (
		<svg width="80" height="80" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path d="M8.89789 3.25C10.3318 3.25 11.5358 4.23471 11.8704 5.56481H20.3125C20.7267 5.56481 21.0625 5.90059 21.0625 6.31481C21.0625 6.72902 20.7267 7.06481 20.3125 7.06481H11.8705C11.536 8.3951 10.332 9.38 8.89789 9.38C7.46381 9.38 6.25976 8.3951 5.92527 7.06481H4.3125C3.89829 7.06481 3.5625 6.72902 3.5625 6.31481C3.5625 5.90059 3.89829 5.56481 4.3125 5.56481H5.92537C6.26 4.23471 7.46395 3.25 8.89789 3.25Z" fill="#343C54"/>
			<path d="M12.737 12.7503H4.3125C3.89829 12.7503 3.5625 12.4145 3.5625 12.0003C3.5625 11.5861 3.89829 11.2503 4.3125 11.2503H12.7369C13.0714 9.91998 14.2754 8.93506 15.7095 8.93506C17.1436 8.93506 18.3477 9.91998 18.6822 11.2503H20.3125C20.7267 11.2503 21.0625 11.5861 21.0625 12.0003C21.0625 12.4145 20.7267 12.7503 20.3125 12.7503H18.682C18.3474 14.0804 17.1435 15.0651 15.7095 15.0651C14.2756 15.0651 13.0717 14.0804 12.737 12.7503Z" fill="#343C54"/>
			<path d="M12.5932 16.9354C12.2587 15.605 11.0546 14.6201 9.62055 14.6201C8.18645 14.6201 6.9824 15.605 6.64792 16.9354H4.3125C3.89829 16.9354 3.5625 17.2711 3.5625 17.6854C3.5625 18.0996 3.89829 18.4354 4.3125 18.4354H6.64804C6.98268 19.7654 8.18662 20.7501 9.62055 20.7501C11.0545 20.7501 12.2584 19.7654 12.5931 18.4354H20.3125C20.7267 18.4354 21.0625 18.0996 21.0625 17.6854C21.0625 17.2711 20.7267 16.9354 20.3125 16.9354H12.5932Z" fill="#343C54"/>
		</svg>
	),

	chevronDown: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z" fill="#343C54"/>
		</svg>
	),

	tag: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M11.8284 2.10556L22 12.2772V22.0001H12.2771L2.10547 11.8285V2.10556H11.8284ZM10.9999 4.10556H4.10547V11.0001L12.6055 19.5001L19.5 19.5001V12.6057L10.9999 4.10556Z" fill="#343C54"/>
			<path d="M9 8.5C9 9.32843 8.32843 10 7.5 10C6.67157 10 6 9.32843 6 8.5C6 7.67157 6.67157 7 7.5 7C8.32843 7 9 7.67157 9 8.5Z" fill="#343C54"/>
		</svg>
	),

	marker: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M12 2C7.58172 2 4 5.58172 4 10C4 12.9646 5.43348 15.8125 7.5 18C9.16667 19.7708 11 21 12 21C13 21 14.8333 19.7708 16.5 18C18.5665 15.8125 20 12.9646 20 10C20 5.58172 16.4183 2 12 2ZM12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="#343C54"/>
		</svg>
	),

	calendar: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M8 2V4H6C4.89543 4 4 4.89543 4 6V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V6C20 4.89543 19.1046 4 18 4H16V2H14V4H10V2H8ZM6 8V20H18V8H6Z" fill="#343C54"/>
		</svg>
	),

	clock: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM13 6V11.382L16.447 13.106L15.553 14.894L11 12.618V6H13Z" fill="#343C54"/>
		</svg>
	),

	user: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2ZM4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21H4Z" fill="#343C54"/>
		</svg>
	),

	toggle: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M17 6H7C4.23858 6 2 8.23858 2 11C2 13.7614 4.23858 16 7 16H17C19.7614 16 22 13.7614 22 11C22 8.23858 19.7614 6 17 6ZM7 9C5.89543 9 5 9.89543 5 11C5 12.1046 5.89543 13 7 13C8.10457 13 9 12.1046 9 11C9 9.89543 8.10457 9 7 9Z" fill="#343C54"/>
		</svg>
	),

	plusMinus: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 5H8V4H10V5H14V7H10V8H8V7H4V5Z" fill="#343C54"/>
			<path d="M4 11H8V10H10V11H14V13H10V14H8V13H4V11Z" fill="#343C54"/>
			<path d="M4 17H14V19H4V17Z" fill="#343C54"/>
			<path d="M16 4H20V6H16V4Z" fill="#343C54"/>
			<path d="M18 7V11H20V7H18Z" fill="#343C54"/>
			<path d="M18 13V17H20V13H18Z" fill="#343C54"/>
		</svg>
	),

	orderBy: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M8 4V20L4 16" fill="none" stroke="#343C54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M16 20V4L20 8" fill="none" stroke="#343C54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),

	link: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="#343C54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),

	heading: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 4H6V11H14V4H16V20H14V13H6V20H4V4Z" fill="#343C54"/>
		</svg>
	),

	crosshairs: (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M12 2C12.5523 2 13 2.44772 13 3V4.06189C16.6187 4.51314 19.4869 7.38128 19.9381 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H19.9381C19.4869 16.6187 16.6187 19.4869 13 19.9381V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V19.9381C7.38128 19.4869 4.51314 16.6187 4.06189 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H4.06189C4.51314 7.38128 7.38128 4.51314 11 4.06189V3C11 2.44772 11.4477 2 12 2ZM6.07089 11C6.50618 8.48991 8.48991 6.50618 11 6.07089V8C11 8.55228 11.4477 9 12 9C12.5523 9 13 8.55228 13 8V6.07089C15.5101 6.50618 17.4938 8.48991 17.9291 11H16C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13H17.9291C17.4938 15.5101 15.5101 17.4938 13 17.9291V16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16V17.9291C8.48991 17.4938 6.50618 15.5101 6.07089 13H8C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11H6.07089Z" fill="#343C54"/>
		</svg>
	),

	// Navigation chevrons (stroke-based, for carousels/sliders)
	chevronLeft: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),

	chevronRight: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),

	// Pagination arrows (with horizontal line)
	arrowLeft: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),

	arrowRight: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),

	// Plan feature icons
	checkmark: (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),

	crossCircle: (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
			<path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),

	chevronRightSmall: (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),

	// Grid icon (3x3 pattern for gallery/lightbox)
	grid: (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="10" y="3" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="17" y="3" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="3" y="10" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="10" y="10" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="17" y="10" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="3" y="17" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="10" y="17" width="5" height="5" rx="1" fill="currentColor"/>
			<rect x="17" y="17" width="5" height="5" rx="1" fill="currentColor"/>
		</svg>
	),

	// Load more / Plus icon
	plus: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),

	// Reset/Refresh icon
	refresh: (
		<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 4v5h.582M19.938 13A8.001 8.001 0 005.217 9.144M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.721-3.856M14.42 15H19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
		</svg>
	),
};

/**
 * Get icon by filter type - matches Voxel's icon mapping
 */
export function getFilterIcon( filterType: string ): JSX.Element {
	switch ( filterType ) {
		case 'keywords':
			return VoxelIcons.search;
		case 'terms':
			return VoxelIcons.tag;
		case 'location':
			return VoxelIcons.marker;
		case 'date':
		case 'recurring-date':
		case 'availability':
			return VoxelIcons.calendar;
		case 'open-now':
			return VoxelIcons.clock;
		case 'user':
		case 'following':
			return VoxelIcons.user;
		case 'switcher':
			return VoxelIcons.toggle;
		case 'stepper':
		case 'range':
			return VoxelIcons.plusMinus;
		case 'order-by':
			return VoxelIcons.orderBy;
		case 'relations':
			return VoxelIcons.link;
		case 'ui-heading':
			return VoxelIcons.heading;
		default:
			return VoxelIcons.search;
	}
}
