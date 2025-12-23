/**
 * useCart Hook
 *
 * React hook for cart operations (add to cart, direct checkout).
 * Handles both logged-in users and guest cart via localStorage.
 *
 * Evidence:
 * - addToCart: voxel-product-form.beautified.js lines 1763-1800
 * - directCart: voxel-product-form.beautified.js lines 1832-1852
 *
 * @package VoxelFSE
 */

import { useState, useCallback } from 'react';
import {
	getAjaxUrl,
	isLoggedIn,
	getGuestCart,
	saveGuestCart,
	saveDirectCart,
	showAddedToCartAlert,
	showAlert,
	triggerCartItemAdded,
	postRequest,
	buildCartItemValue,
	type CartResponse,
} from './cartUtils';
import type {
	ExtendedProductFormConfig,
	AddonValue,
	VariationsValue,
	BookingValue,
	DataInputValue,
} from '../types';

/**
 * Hook options
 */
export interface UseCartOptions {
	config: ExtendedProductFormConfig | null;
	addonValues: Record<string, AddonValue>;
	quantity: number;
	variationsValue: VariationsValue;
	bookingValue: BookingValue;
	dataInputValues: Record<string, DataInputValue>;
}

/**
 * Hook return value
 */
export interface UseCartReturn {
	/** Whether a cart operation is in progress */
	isProcessing: boolean;
	/** Add product to cart */
	addToCart: () => Promise<boolean>;
	/** Direct checkout (skip cart) */
	directCheckout: () => Promise<boolean>;
	/** Last error message */
	error: string | null;
}

/**
 * useCart hook
 *
 * Provides cart operations for the product form.
 */
export function useCart( options: UseCartOptions ): UseCartReturn {
	const {
		config,
		addonValues,
		quantity,
		variationsValue,
		bookingValue,
		dataInputValues,
	} = options;

	const [ isProcessing, setIsProcessing ] = useState( false );
	const [ error, setError ] = useState<string | null>( null );

	/**
	 * Add product to cart
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1763-1800
	 */
	const addToCart = useCallback( async (): Promise<boolean> => {
		if ( ! config ) {
			setError( 'Product configuration not available' );
			return false;
		}

		setIsProcessing( true );
		setError( null );

		try {
			const cartNonce = config.settings?.cart_nonce ?? config.nonce;
			const itemValue = buildCartItemValue( config, addonValues, quantity, variationsValue, bookingValue, dataInputValues );

			// Merge with config.value if available
			const fullValue = {
				...( config.value ?? {} ),
				...itemValue,
			};

			let response: CartResponse;

			if ( isLoggedIn() ) {
				// Logged-in user: POST to products.add_to_cart
				const url = getAjaxUrl( 'products.add_to_cart', cartNonce );
				response = await postRequest( url, {
					item: JSON.stringify( fullValue ),
				} );
			} else {
				// Guest user: POST to products.add_to_guest_cart with localStorage
				const url = getAjaxUrl( 'products.add_to_guest_cart', cartNonce );
				response = await postRequest( url, {
					item: JSON.stringify( fullValue ),
					guest_cart: getGuestCart() ?? '',
				} );

				// Save guest cart to localStorage on success
				if ( response.success && response.guest_cart ) {
					saveGuestCart( response.guest_cart );
				}
			}

			if ( response.success ) {
				// Trigger event for other components (e.g., userbar cart counter)
				triggerCartItemAdded( response.item );

				// Show success notification
				showAddedToCartAlert( {
					added_to_cart: config.l10n?.added_to_cart,
					view_cart: config.l10n?.view_cart,
				} );

				return true;
			} else {
				const errorMessage = response.message ?? 'Failed to add to cart';
				setError( errorMessage );
				showAlert( errorMessage, 'error' );
				return false;
			}
		} catch ( err ) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
			setError( errorMessage );
			showAlert( errorMessage, 'error' );
			return false;
		} finally {
			setIsProcessing( false );
		}
	}, [ config, addonValues, quantity, variationsValue, bookingValue, dataInputValues ] );

	/**
	 * Direct checkout (skip cart)
	 *
	 * Creates a temporary cart with single item and redirects to checkout.
	 * Used for "Buy Now" buttons.
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1832-1852
	 */
	const directCheckout = useCallback( async (): Promise<boolean> => {
		if ( ! config ) {
			setError( 'Product configuration not available' );
			return false;
		}

		setIsProcessing( true );
		setError( null );

		try {
			const cartNonce = config.settings?.cart_nonce ?? config.nonce;
			const itemValue = buildCartItemValue( config, addonValues, quantity, variationsValue, bookingValue, dataInputValues );

			// Merge with config.value if available
			const fullValue = {
				...( config.value ?? {} ),
				...itemValue,
			};

			const url = getAjaxUrl( 'products.get_direct_cart', cartNonce );
			const response = await postRequest( url, {
				item: JSON.stringify( fullValue ),
			} );

			if ( response.success && response.item && response.checkout_link ) {
				// Store in localStorage for checkout page
				saveDirectCart( response.item.key, response.item.value );

				// Redirect to checkout
				window.location.href = response.checkout_link;
				return true;
			} else {
				const errorMessage = response.message ?? 'Failed to proceed to checkout';
				setError( errorMessage );
				showAlert( errorMessage, 'error' );
				return false;
			}
		} catch ( err ) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to proceed to checkout';
			setError( errorMessage );
			showAlert( errorMessage, 'error' );
			return false;
		} finally {
			setIsProcessing( false );
		}
	}, [ config, addonValues, quantity, variationsValue, bookingValue, dataInputValues ] );

	return {
		isProcessing,
		addToCart,
		directCheckout,
		error,
	};
}

export default useCart;
