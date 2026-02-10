/**
 * Render Icon Utility
 *
 * Renders icons from Voxel's icon format (Line Awesome icons or custom SVG).
 * Matches Voxel's icon markup exactly for CSS compatibility.
 *
 * @package VoxelFSE
 */

import type { ReactNode } from 'react';

interface IconConfig {
	library?: string;
	value?: string;
}

/**
 * Default icons (Line Awesome) for fallbacks
 */
const defaultIcons: Record<string, string> = {
	user: 'las la-user',
	lock: 'las la-lock',
	eye: 'las la-eye',
	envelope: 'las la-envelope',
	google: 'lab la-google',
	chevronLeft: 'las la-chevron-left',
	info: 'las la-info-circle',
	happy: 'las la-smile',
	phone: 'las la-phone',
	link: 'las la-link',
	calendar: 'las la-calendar',
	upload: 'las la-upload',
	copy: 'las la-copy',
	cloud: 'las la-cloud',
	device: 'las la-laptop',
	shield: 'las la-shield-alt',
	privacy: 'las la-database',
	trash: 'las la-trash',
	logout: 'las la-sign-out-alt',
};

/**
 * Render an icon from IconConfig
 *
 * @param icon - Icon configuration object
 * @param fallbackKey - Key for fallback icon from defaultIcons
 * @returns React element for the icon
 */
export function renderIcon(icon?: IconConfig, fallbackKey?: string): ReactNode {
	// If icon has a value, render it
	if (icon && icon.value) {
		// Handle Line Awesome icons (most common)
		if (icon.library === 'icon' || !icon.library || icon.library === '') {
			return <i className={icon.value}></i>;
		}

		// Handle custom SVG
		if (icon.library === 'svg' && icon.value) {
			// SVG value could be a URL or inline SVG
			// For inline SVG, we use dangerouslySetInnerHTML (same as Voxel does)
			if (icon.value.startsWith('<svg') || icon.value.startsWith('<?xml')) {
				return (
					<span
						className="ts-icon-svg"
						dangerouslySetInnerHTML={{ __html: icon.value }}
					/>
				);
			}
			// URL to SVG file - use img tag
			return <img src={icon.value} alt="" className="ts-icon-svg" />;
		}
	}

	// If no icon or no value, use fallback
	if (fallbackKey && defaultIcons[fallbackKey]) {
		return <i className={defaultIcons[fallbackKey]}></i>;
	}

	// Final fallback: return null
	return null;
}

/**
 * Get icon class string from IconConfig
 * Useful when you need just the class name, not the element
 */
export function getIconClass(icon?: IconConfig, fallbackKey?: string): string {
	if (icon?.library === 'icon' && icon.value) {
		return icon.value;
	}
	if (fallbackKey && defaultIcons[fallbackKey]) {
		return defaultIcons[fallbackKey];
	}
	return '';
}

export default renderIcon;
