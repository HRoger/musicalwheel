/**
 * useExternalAddons Hook
 *
 * Binds external .ts-use-addition buttons to product form addons.
 * Allows addon selection from elements outside the form (e.g., pricing cards).
 *
 * Evidence: voxel-product-form.beautified.js lines 1927-2054
 *
 * Data format: Elements with class .ts-use-addition and data-id attribute
 * data-id: base64 encoded JSON { addon: "addon_key", choice: "choice_value" }
 *
 * @package VoxelFSE
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type {
	ExtendedProductFormConfig,
	AddonValue,
	AddonConfig,
	AddonChoice,
} from '../types';

/**
 * External choice popup state
 */
export interface ExternalChoiceState {
	active: boolean;
	element: HTMLElement | null;
	choice: AddonChoice | null;
	addonKey: string | null;
}

/**
 * Reference data from external button
 */
interface ExternalAddonReference {
	addon: string;
	choice: string;
}

/**
 * Hook options
 */
export interface UseExternalAddonsOptions {
	config: ExtendedProductFormConfig | null;
	addonValues: Record<string, AddonValue>;
	onAddonValueChange: ( addonKey: string, value: AddonValue ) => void;
}

/**
 * Hook return value
 */
export interface UseExternalAddonsReturn {
	/** External choice popup state */
	externalChoice: ExternalChoiceState;
	/** Close the external choice popup */
	closeExternalChoice: () => void;
	/** Update quantity for external choice */
	updateExternalChoiceQuantity: ( quantity: number ) => void;
}

/**
 * Default external choice state
 */
const DEFAULT_EXTERNAL_CHOICE: ExternalChoiceState = {
	active: false,
	element: null,
	choice: null,
	addonKey: null,
};

/**
 * useExternalAddons hook
 *
 * Binds external .ts-use-addition elements to addon selection.
 */
export function useExternalAddons( options: UseExternalAddonsOptions ): UseExternalAddonsReturn {
	const { config, addonValues, onAddonValueChange } = options;
	const [ externalChoice, setExternalChoice ] = useState<ExternalChoiceState>( DEFAULT_EXTERNAL_CHOICE );

	// Store cleanup functions for watchers
	const cleanupRef = useRef<( () => void )[]>( [] );

	/**
	 * Parse base64 encoded reference from data-id
	 */
	const parseReference = useCallback( ( dataId: string ): ExternalAddonReference | null => {
		try {
			return JSON.parse( atob( dataId ) );
		} catch {
			return null;
		}
	}, [] );

	/**
	 * Update element active state and tooltip
	 */
	const updateElementState = useCallback( (
		element: HTMLElement,
		isActive: boolean,
		defaultTooltip: string | null,
		activeTooltip: string | null
	) => {
		const container = element.parentElement;
		if ( ! container ) return;

		if ( isActive ) {
			element.classList.add( 'active' );
			if ( activeTooltip ) {
				container.dataset['tooltip'] = activeTooltip;
			} else {
				delete container.dataset['tooltip'];
			}
		} else {
			element.classList.remove( 'active' );
			if ( defaultTooltip ) {
				container.dataset['tooltip'] = defaultTooltip;
			} else {
				delete container.dataset['tooltip'];
			}
		}
	}, [] );

	/**
	 * Close external choice popup
	 */
	const closeExternalChoice = useCallback( () => {
		setExternalChoice( DEFAULT_EXTERNAL_CHOICE );
	}, [] );

	/**
	 * Update quantity for external choice
	 */
	const updateExternalChoiceQuantity = useCallback( ( quantity: number ) => {
		if ( ! externalChoice.active || ! externalChoice.addonKey || ! externalChoice.choice ) {
			return;
		}

		const addonKey = externalChoice.addonKey;
		const choiceValue = externalChoice.choice.value;
		const currentValue = addonValues[ addonKey ];

		if ( ! currentValue ) return;

		// Find addon config to determine type
		const addon = config?.props?.fields?.[ 'form-addons' ]?.props?.addons?.[ addonKey ];
		if ( ! addon ) return;

		if ( addon.type === 'custom-multiselect' ) {
			// For multiselect, find and update the selection
			const selected = ( currentValue as { selected: Array<{ item: string; quantity: number }> } ).selected || [];
			const selectionIndex = selected.findIndex( sel => sel.item === choiceValue );

			if ( selectionIndex !== -1 ) {
				const newSelected = [ ...selected ];
				newSelected[ selectionIndex ] = { ...newSelected[ selectionIndex ], quantity };
				onAddonValueChange( addonKey, { ...currentValue, selected: newSelected } );
			}
		} else if ( addon.type === 'custom-select' ) {
			// For single select, update quantity directly
			const selectedData = ( currentValue as { selected: { item: string | null; quantity: number } } ).selected;
			if ( selectedData.item === choiceValue ) {
				onAddonValueChange( addonKey, {
					...currentValue,
					selected: { ...selectedData, quantity },
				} );
			}
		}

		closeExternalChoice();
	}, [ externalChoice, addonValues, config, onAddonValueChange, closeExternalChoice ] );

	/**
	 * Bind external addon elements
	 */
	useEffect( () => {
		if ( ! config ) return;

		// Clean up previous listeners
		cleanupRef.current.forEach( cleanup => cleanup() );
		cleanupRef.current = [];

		const addons = config.props?.fields?.[ 'form-addons' ]?.props?.addons;
		if ( ! addons ) return;

		// Find all .ts-use-addition elements
		const elements = document.querySelectorAll<HTMLElement>( '.ts-use-addition' );

		elements.forEach( ( element ) => {
			const dataId = element.dataset['id'];
			if ( ! dataId ) return;

			const reference = parseReference( dataId );
			if ( ! reference ) return;

			const addon = addons[ reference.addon ];
			const choice = addon?.props?.choices?.[ reference.choice ];

			if ( ! addon || ! choice ) return;

			// Get tooltip configuration
			const container = element.parentElement;
			const defaultTooltip = container?.dataset['tooltipDefault'] || null;
			const activeTooltip = container?.dataset['tooltipActive'] || null;

			// Mark addon as having external handler
			( addon as AddonConfig & { _has_external_handler?: boolean } )._has_external_handler = true;

			/**
			 * Handle click for custom-multiselect
			 */
			if ( addon.type === 'custom-multiselect' ) {
				const handleClick = ( event: Event ) => {
					event.preventDefault();

					const currentValue = addonValues[ reference.addon ] as { selected: Array<{ item: string; quantity: number }> } | undefined;
					const selected = currentValue?.selected || [];
					const selectionIndex = selected.findIndex( sel => sel.item === reference.choice );

					if ( selectionIndex === -1 ) {
						// Add selection
						const newSelected = [
							...selected,
							{
								item: reference.choice,
								quantity: choice.props?.quantity?.min ?? 1,
							},
						];
						onAddonValueChange( reference.addon, {
							...currentValue,
							selected: newSelected,
						} as AddonValue );

						// Show quantity popup if enabled
						if ( choice.props?.quantity?.enabled ) {
							setExternalChoice( {
								active: true,
								element,
								choice,
								addonKey: reference.addon,
							} );
						}
					} else {
						// Remove selection
						const newSelected = selected.filter( ( _, idx ) => idx !== selectionIndex );
						onAddonValueChange( reference.addon, {
							...currentValue,
							selected: newSelected,
						} as AddonValue );
					}
				};

				element.addEventListener( 'click', handleClick );
				cleanupRef.current.push( () => element.removeEventListener( 'click', handleClick ) );

				// Update initial state
				const currentValue = addonValues[ reference.addon ] as { selected: Array<{ item: string; quantity: number }> } | undefined;
				const isSelected = currentValue?.selected?.some( sel => sel.item === reference.choice ) ?? false;
				updateElementState( element, isSelected, defaultTooltip, activeTooltip );
			}
			/**
			 * Handle click for custom-select
			 */
			else if ( addon.type === 'custom-select' ) {
				const handleClick = ( event: Event ) => {
					event.preventDefault();

					const currentValue = addonValues[ reference.addon ] as { selected: { item: string | null; quantity: number } } | undefined;
					const selectedItem = currentValue?.selected?.item;

					if ( selectedItem !== reference.choice ) {
						// Select this choice
						onAddonValueChange( reference.addon, {
							...currentValue,
							selected: {
								item: reference.choice,
								quantity: choice.props?.quantity?.min ?? 1,
							},
						} as AddonValue );

						// Show quantity popup if enabled
						if ( choice.props?.quantity?.enabled ) {
							setExternalChoice( {
								active: true,
								element,
								choice,
								addonKey: reference.addon,
							} );
						}
					} else {
						// Deselect
						onAddonValueChange( reference.addon, {
							...currentValue,
							selected: {
								item: null,
								quantity: 1,
							},
						} as AddonValue );
					}
				};

				element.addEventListener( 'click', handleClick );
				cleanupRef.current.push( () => element.removeEventListener( 'click', handleClick ) );

				// Update initial state
				const currentValue = addonValues[ reference.addon ] as { selected: { item: string | null; quantity: number } } | undefined;
				const isSelected = currentValue?.selected?.item === reference.choice;
				updateElementState( element, isSelected, defaultTooltip, activeTooltip );
			}
		} );

		// Cleanup on unmount
		return () => {
			cleanupRef.current.forEach( cleanup => cleanup() );
			cleanupRef.current = [];
		};
	}, [ config, parseReference, updateElementState ] );

	/**
	 * Watch for addon value changes to update element states
	 */
	useEffect( () => {
		if ( ! config ) return;

		const addons = config.props?.fields?.[ 'form-addons' ]?.props?.addons;
		if ( ! addons ) return;

		const elements = document.querySelectorAll<HTMLElement>( '.ts-use-addition' );

		elements.forEach( ( element ) => {
			const dataId = element.dataset['id'];
			if ( ! dataId ) return;

			const reference = parseReference( dataId );
			if ( ! reference ) return;

			const addon = addons[ reference.addon ];
			if ( ! addon ) return;

			const container = element.parentElement;
			const defaultTooltip = container?.dataset['tooltipDefault'] || null;
			const activeTooltip = container?.dataset['tooltipActive'] || null;

			if ( addon.type === 'custom-multiselect' ) {
				const currentValue = addonValues[ reference.addon ] as { selected: Array<{ item: string; quantity: number }> } | undefined;
				const isSelected = currentValue?.selected?.some( sel => sel.item === reference.choice ) ?? false;
				updateElementState( element, isSelected, defaultTooltip, activeTooltip );
			} else if ( addon.type === 'custom-select' ) {
				const currentValue = addonValues[ reference.addon ] as { selected: { item: string | null; quantity: number } } | undefined;
				const isSelected = currentValue?.selected?.item === reference.choice;
				updateElementState( element, isSelected, defaultTooltip, activeTooltip );
			}
		} );
	}, [ config, addonValues, parseReference, updateElementState ] );

	return {
		externalChoice,
		closeExternalChoice,
		updateExternalChoiceQuantity,
	};
}

export default useExternalAddons;
