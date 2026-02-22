/**
 * Cart Utility Functions
 *
 * Utility functions for product cart operations.
 * Matches Voxel's cart logic from voxel-product-form.beautified.js
 *
 * Evidence:
 * - addToCart: lines 1763-1800
 * - directCart: lines 1832-1852
 * - showAddedToCartAlert: lines 1807-1824
 *
 * @package VoxelFSE
 */

import type {
	ExtendedProductFormConfig,
	AddonValue,
	VariationsValue,
	BookingValue,
	DataInputValue,
} from '../types';

/**
 * Alert action button configuration
 */
export interface AlertAction {
	label: string;
	link: string;
	onClick?: ( event: Event ) => void;
}

/**
 * Cart API response
 */
export interface CartResponse {
	success: boolean;
	message?: string;
	item?: {
		key: string;
		value: unknown;
	};
	guest_cart?: unknown;
	checkout_link?: string;
}

/**
 * Cart item value structure
 */
export interface CartItemValue {
	post_id: number;
	addons?: Record<string, AddonValue>;
	stock?: { quantity: number };
	variations?: VariationsValue;
	booking?: BookingValue;
	data_inputs?: Record<string, DataInputValue>;
}

/**
 * Guest cart storage key
 */
export const GUEST_CART_KEY = 'voxel:guest_cart';

/**
 * Direct cart storage key
 */
export const DIRECT_CART_KEY = 'voxel:direct_cart';

/**
 * Get Voxel AJAX URL with action
 *
 * @param action - The action name
 * @param nonce - Security nonce
 * @returns Full AJAX URL
 */
export function getAjaxUrl( action: string, nonce: string ): string {
	const baseUrl = (window as any).Voxel_Config?.ajax_url ?? '/?vx=1';
	return `${ baseUrl }&action=${ action }&_wpnonce=${ nonce }`;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
	return !!((window as any).Voxel_Config?.is_logged_in);
}

/**
 * Get guest cart from localStorage
 */
export function getGuestCart(): string | null {
	if ( typeof localStorage === 'undefined' ) return null;
	return localStorage.getItem( GUEST_CART_KEY );
}

/**
 * Save guest cart to localStorage
 */
export function saveGuestCart( cart: unknown ): void {
	if ( typeof localStorage === 'undefined' ) return;
	localStorage.setItem( GUEST_CART_KEY, JSON.stringify( cart ) );
}

/**
 * Save direct cart to localStorage
 */
export function saveDirectCart( key: string, value: unknown ): void {
	if ( typeof localStorage === 'undefined' ) return;
	localStorage.setItem( DIRECT_CART_KEY, JSON.stringify( {
		[ key ]: value,
	} ) );
}

/**
 * Show Voxel alert notification
 *
 * Evidence: voxel-product-form.beautified.js lines 1807-1824
 *
 * @param message - Alert message
 * @param type - Alert type
 * @param actions - Optional action buttons
 * @param timeout - Auto-dismiss timeout
 */
export function showAlert(
	message: string,
	type: 'success' | 'error' | 'info' = 'info',
	actions?: AlertAction[],
	timeout?: number
): void {
	if ( (window as any).Voxel?.alert ) {
		(window as any).Voxel.alert( message, type, actions, timeout );
	} else {
		// Fallback to console
		console.log( `[${ type.toUpperCase() }]`, message );
	}
}

/**
 * Show "Added to cart" success alert
 *
 * Evidence: voxel-product-form.beautified.js lines 1807-1824
 *
 * @param l10n - Localization strings
 */
export function showAddedToCartAlert( l10n: { added_to_cart?: string; view_cart?: string } ): void {
	const actions: AlertAction[] = [];

	// Add "View Cart" button if cart popup exists
	if ( typeof document !== 'undefined' && document.querySelector( '.ts-popup-cart > a' ) ) {
		actions.push( {
			label: l10n.view_cart ?? 'View Cart',
			link: '#',
			onClick: ( event ) => {
				event.preventDefault();
				if ( (window as any).Voxel?.openCart ) {
					(window as any).Voxel.openCart();
				}
				// Close the alert
				const target = event.target as HTMLElement;
				const notice = target.closest( '.ts-notice' );
				const closeBtn = notice?.querySelector( '.close-alert' ) as HTMLElement | null;
				closeBtn?.click();
			},
		} );
	}

	showAlert( l10n.added_to_cart ?? 'Added to cart', 'success', actions, 4000 );
}

/**
 * Trigger cart item added event
 *
 * Evidence: voxel-product-form.beautified.js line 1774
 */
export function triggerCartItemAdded( item: unknown ): void {
	if ( (window as any).jQuery ) {
		(window as any).jQuery( document as unknown as string ).trigger( 'voxel:added_cart_item', item );
	}
}

/**
 * Build cart item value from form state
 *
 * @param config - Product configuration
 * @param addonValues - Selected addon values
 * @param quantity - Quantity
 * @param variationsValue - Variations selection
 * @param bookingValue - Booking selection
 * @param dataInputValues - Data input values
 * @returns Cart item value
 */
export function buildCartItemValue(
	config: ExtendedProductFormConfig,
	addonValues: Record<string, AddonValue>,
	quantity: number,
	variationsValue: VariationsValue,
	bookingValue: BookingValue,
	dataInputValues: Record<string, DataInputValue> = {}
): CartItemValue {
	const productMode = config.settings?.product_mode ?? 'regular';

	const value: CartItemValue = {
		post_id: 0, // Will be filled from config
	};

	// Add addons if present
	if ( Object.keys( addonValues ).length > 0 ) {
		value.addons = addonValues;
	}

	// Add mode-specific values
	if ( productMode === 'regular' ) {
		value.stock = { quantity };
	} else if ( productMode === 'variable' ) {
		value.variations = variationsValue;
	} else if ( productMode === 'booking' ) {
		value.booking = bookingValue;
	}

	// Add data inputs if present
	if ( Object.keys( dataInputValues ).length > 0 ) {
		value.data_inputs = dataInputValues;
	}

	return value;
}

/**
 * Make POST request using jQuery or fetch
 *
 * @param url - Request URL
 * @param data - Request data
 * @returns Promise with response
 */
export async function postRequest( url: string, data: Record<string, string> ): Promise<CartResponse> {
	// Try jQuery first (Voxel pattern)
	if ( (window as any).jQuery?.post ) {
		return new Promise( ( resolve ) => {
			(window as any).jQuery.post( url, data ).always( ( response: CartResponse ) => {
				resolve( response );
			} );
		} );
	}

	// Fallback to fetch
	const formData = new FormData();
	Object.entries( data ).forEach( ( [ key, value ] ) => {
		formData.append( key, value );
	} );

	try {
		const response = await fetch( url, {
			method: 'POST',
			body: formData,
		} );
		return await response.json();
	} catch ( error ) {
		return {
			success: false,
			message: (window as any).Voxel_Config?.l10n?.ajaxError ?? 'Request failed',
		};
	}
}
