/**
 * Icon Renderer Utility
 * Renders icons from icon attributes (library icons or SVG uploads)
 */
import React from 'react';
import type { IconValue } from '@shared/types';

/**
 * Render an icon based on IconValue
 * Handles both icon library (Font Icons) and uploaded SVGs
 * 
 * @param iconValue Icon object with library and value
 * @param fallbackSVG Optional fallback SVG element if no icon is set
 * @returns React element (icon or SVG)
 */
export const renderIcon = (
	iconValue?: IconValue,
	fallbackSVG?: React.ReactElement
): React.ReactElement => {
	// If no icon value provided or empty, use fallback
	if (!iconValue || !iconValue.value) {
		return fallbackSVG || <></>;
	}

	// Render icon library icon (e.g., Line Awesome, Font Awesome)
	if (iconValue.library === 'icon') {
		return <i className={iconValue.value} aria-hidden="true" />;
	}

	// Render uploaded SVG
	if (iconValue.library === 'svg') {
		return (
			<img 
				src={iconValue.value} 
				alt="" 
				style={{ width: '24px', height: '24px' }}
				aria-hidden="true"
			/>
		);
	}

	// Fallback
	return fallbackSVG || <></>;
};

/**
 * Default fallback SVGs for common icons
 * These match Voxel's default icons
 */
export const defaultIcons = {
	next: (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="currentColor"/>
		</svg>
	),
	prev: (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="currentColor" transform="scale(-1, 1) translate(-24, 0)"/>
		</svg>
	),
	draft: (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H15.3809C15.977 3.25 16.5488 3.48658 16.9707 3.90779L20.0897 7.02197C20.5124 7.44403 20.7499 8.01685 20.7499 8.61418L20.7499 18.5C20.7499 19.7426 19.7425 20.75 18.4999 20.75H16.75V16.25C16.75 15.0074 15.7426 14 14.5 14L9.5 14C8.25736 14 7.25 15.0074 7.25 16.25L7.25001 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H12C12.4142 7.75 12.75 7.41421 12.75 7C12.75 6.58579 12.4142 6.25 12 6.25H8Z" fill="currentColor"/>
			<path d="M8.75001 20.75L15.25 20.75V16.25C15.25 15.8358 14.9142 15.5 14.5 15.5L9.5 15.5C9.08579 15.5 8.75 15.8358 8.75 16.25L8.75001 20.75Z" fill="currentColor"/>
		</svg>
	),
	plus: (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="2"/>
		</svg>
	),
	minus: (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 6H12" stroke="currentColor" strokeWidth="2"/>
		</svg>
	),
	calendar: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="currentColor"/>
			<path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19Z" fill="currentColor"/>
		</svg>
	),
	clock: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
			<path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),
	email: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.73592 4.5C2.77726 4.5 2.00014 5.27724 2.00031 6.2359L2.00031 6.26829C2.01064 6.81904 2.28199 7.33272 2.732 7.65165L2.74287 7.65929L10.7131 13.2171C11.3897 13.689 12.2609 13.7479 12.9861 13.3941C13.0897 13.3435 13.1904 13.2845 13.287 13.2171L21.2569 7.65949C21.7225 7.33485 21.9999 6.8031 21.9998 6.23554C21.9997 5.27702 21.2229 4.5 20.2644 4.5H3.73592Z" fill="currentColor"/>
			<path d="M22.0001 8.96994L14.145 14.4475C12.8562 15.3462 11.1438 15.3462 9.85507 14.4475L2.00023 8.97012L2 17.25C2 18.4926 3.00736 19.5 4.25 19.5H19.75C20.9926 19.5 22 18.4926 22 17.25L22.0001 8.96994Z" fill="currentColor"/>
		</svg>
	),
	phone: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
		</svg>
	),
	upload: (
		<svg width="80" height="80" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12.4239 3.25C12.2079 3.25 12.0132 3.34131 11.8763 3.48744L7.26675 8.0941C6.97376 8.3869 6.97361 8.86177 7.26641 9.15476C7.55921 9.44775 8.03408 9.4479 8.32707 9.1551L11.6739 5.81043L11.6739 16C11.6739 16.4142 12.0096 16.75 12.4239 16.75C12.8381 16.75 13.1739 16.4142 13.1739 16L13.1739 5.81455L16.5168 9.15511C16.8098 9.4479 17.2846 9.44774 17.5774 9.15474C17.8702 8.86175 17.87 8.38687 17.5771 8.09408L13.0021 3.52236C12.8646 3.356 12.6566 3.25 12.4239 3.25Z" fill="currentColor"/>
			<path d="M5.17188 16C5.17188 15.5858 4.83609 15.25 4.42188 15.25C4.00766 15.25 3.67188 15.5858 3.67188 16V18.5C3.67188 19.7426 4.67923 20.75 5.92188 20.75H18.9227C20.1654 20.75 21.1727 19.7426 21.1727 18.5V16C21.1727 15.5858 20.837 15.25 20.4227 15.25C20.0085 15.25 19.6727 15.5858 19.6727 16V18.5C19.6727 18.9142 19.337 19.25 18.9227 19.25H5.92188C5.50766 19.25 5.17188 18.9142 5.17188 18.5V16Z" fill="currentColor"/>
		</svg>
	),
	location: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),
};

