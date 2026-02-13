/**
 * Cart Summary Icon Defaults — Single Source of Truth
 *
 * All three consumers (save.tsx, frontend.tsx, CartSummaryComponent.tsx)
 * import from here instead of maintaining their own copies.
 *
 * @package VoxelFSE
 */

import {
	getIconWithFallback,
	hasIconValue,
	EMPTY_ICON,
} from '../../../shared/utils/iconDefaults';
import type { IconValue } from '../../../shared/utils/iconDefaults';
import type { CartSummaryIcons } from '../types';

// Re-export shared utilities for convenience
export { getIconWithFallback, hasIconValue, EMPTY_ICON };
export type { IconValue };

/**
 * Cart summary icon defaults used for rendering.
 *
 * - noProductsIcon is intentionally empty: the component renders
 *   VoxelIcons.boxRemove SVG as the fallback (matching Voxel parent).
 * - All other icons default to their Line Awesome class names.
 */
export const CART_ICON_DEFAULTS: CartSummaryIcons = {
	deleteIcon: { library: 'line-awesome', value: 'las la-trash-alt' },
	noProductsIcon: EMPTY_ICON, // Component renders VoxelIcons.boxRemove SVG
	loginIcon: { library: 'line-awesome', value: 'las la-sign-in-alt' },
	emailIcon: { library: 'line-awesome', value: 'las la-envelope' },
	userIcon: { library: 'line-awesome', value: 'las la-user' },
	uploadIcon: { library: 'line-awesome', value: 'las la-cloud-upload-alt' },
	shippingIcon: { library: 'line-awesome', value: 'las la-shipping-fast' },
	minusIcon: { library: 'line-awesome', value: 'las la-minus' },
	plusIcon: { library: 'line-awesome', value: 'las la-plus' },
	checkoutIcon: { library: 'line-awesome', value: 'las la-arrow-right' },
	continueIcon: { library: 'line-awesome', value: 'las la-arrow-right' },
};

/**
 * Get a cart-summary icon with its default fallback.
 *
 * @param attrValue - The attribute value (from block attributes or vxconfig)
 * @param key - The icon key in CART_ICON_DEFAULTS
 */
export function getCartIcon(
	attrValue: IconValue | undefined,
	key: keyof CartSummaryIcons
): IconValue {
	return getIconWithFallback(attrValue, CART_ICON_DEFAULTS[key]);
}

/**
 * Old default that was incorrectly baked into page HTML by previous save.tsx.
 * Used by frontend.tsx to detect and ignore stale vxconfig values.
 */
export const LEGACY_NO_PRODUCTS_ICON_VALUE = 'las la-box';
