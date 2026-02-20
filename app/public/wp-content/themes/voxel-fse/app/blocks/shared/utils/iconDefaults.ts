/**
 * Icon Defaults Utility
 *
 * Provides a standardized pattern for icon fallbacks across all blocks.
 *
 * ## Pattern Overview
 * - block.json: Icons have empty defaults `{ library: "", value: "" }`
 * - Inspector: Shows "None" state when no custom icon is selected
 * - Rendering: Uses fallback defaults so the block displays properly
 *
 * ## Usage
 * ```tsx
 * import { getIconWithFallback, type IconValue } from '@shared/utils';
 *
 * // Define block-specific defaults
 * const ICON_DEFAULTS: Record<string, IconValue> = {
 *   searchIcon: { library: 'icon', value: 'las la-search' },
 *   closeIcon: { library: 'icon', value: 'las la-times' },
 * };
 *
 * // In rendering:
 * renderIcon(getIconWithFallback(attributes.searchIcon, ICON_DEFAULTS.searchIcon))
 * ```
 *
 * @package VoxelFSE
 */

import type { IconValue } from '../types/index';
export type { IconValue };

/**
 * Empty icon constant for comparisons
 */
export const EMPTY_ICON: IconValue = { library: '', value: '' };

/**
 * Check if an icon has a value set
 */
export function hasIconValue(icon: IconValue | undefined): boolean {
	return Boolean(icon && icon.value);
}

/**
 * Get icon with fallback if no custom icon is set.
 *
 * Standard pattern for blocks:
 * - Inspector shows "None" state (empty attribute)
 * - Block renders with fallback icon
 *
 * @param icon - The current icon value from attributes
 * @param fallback - The default icon to use if no custom icon is set
 * @returns The icon to render (custom if set, fallback otherwise)
 *
 * @example
 * // Simple usage
 * const icon = getIconWithFallback(attributes.searchIcon, { library: 'icon', value: 'las la-search' });
 *
 * @example
 * // With defaults object
 * const DEFAULTS = { searchIcon: { library: 'icon', value: 'las la-search' } };
 * const icon = getIconWithFallback(attributes.searchIcon, DEFAULTS.searchIcon);
 */
export function getIconWithFallback(
	icon: IconValue | undefined,
	fallback: IconValue
): IconValue {
	if (hasIconValue(icon)) {
		return icon!;
	}
	return fallback;
}

/**
 * Create a getter function bound to a specific defaults object.
 * Useful when a block has many icons and you want cleaner code.
 *
 * @param defaults - Object mapping icon keys to their fallback values
 * @returns A function that gets an icon with its fallback by key
 *
 * @example
 * const ICON_DEFAULTS = {
 *   searchIcon: { library: 'icon', value: 'las la-search' },
 *   closeIcon: { library: 'icon', value: 'las la-times' },
 * };
 *
 * const getIcon = createIconGetter(ICON_DEFAULTS);
 *
 * // In render:
 * renderIcon(getIcon(attributes, 'searchIcon'))
 * renderIcon(getIcon(attributes, 'closeIcon'))
 */
export function createIconGetter<T extends Record<string, IconValue>>(
	defaults: T
): <K extends keyof T>(attributes: Record<string, any>, key: K) => IconValue {
	return (attributes, key) => {
		const icon = attributes[key as string] as IconValue | undefined;
		const fallback = defaults[key];
		return getIconWithFallback(icon, fallback);
	};
}
