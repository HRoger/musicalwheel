/**
 * ExternalChoicePopup Component
 *
 * Popup for selecting quantity when an external addon button is clicked.
 * Appears near the clicked element with quantity controls.
 *
 * Evidence: voxel-product-form.beautified.js lines 1994-2000, 2037-2043
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AddonChoice } from '../types';

export interface ExternalChoicePopupProps {
	active: boolean;
	element: HTMLElement | null;
	choice: AddonChoice | null;
	onClose: () => void;
	onConfirm: ( quantity: number ) => void;
	icons?: {
		minusIcon?: { library?: string; value?: string } | null;
		plusIcon?: { library?: string; value?: string } | null;
	};
}

/**
 * Render icon from IconValue
 */
function renderIcon( icon: { library?: string; value?: string } | undefined | null ): React.ReactNode {
	if ( ! icon?.value ) return null;

	if ( icon.library === 'line-awesome' || icon.value.startsWith( 'la-' ) ) {
		return <i className={ `las ${ icon.value }` } />;
	}

	return <i className={ `las ${ icon.value }` } />;
}

/**
 * ExternalChoicePopup - Quantity selection popup for external addon buttons
 */
export default function ExternalChoicePopup( {
	active,
	element,
	choice,
	onClose,
	onConfirm,
	icons,
}: ExternalChoicePopupProps ) {
	const popupRef = useRef<HTMLDivElement>( null );
	const [ quantity, setQuantity ] = useState( 1 );

	// Get min/max from choice config
	const minQuantity = choice?.props?.quantity?.min ?? 1;
	const maxQuantity = choice?.props?.quantity?.max ?? 999;

	// Reset quantity when popup opens
	useEffect( () => {
		if ( active ) {
			setQuantity( minQuantity );
		}
	}, [ active, minQuantity ] );

	// Position popup near the clicked element
	useEffect( () => {
		if ( ! active || ! element || ! popupRef.current ) return;

		const popup = popupRef.current;
		const rect = element.getBoundingClientRect();
		const popupRect = popup.getBoundingClientRect();

		// Position below the element
		let top = rect.bottom + window.scrollY + 8;
		let left = rect.left + window.scrollX + ( rect.width / 2 ) - ( popupRect.width / 2 );

		// Keep popup within viewport
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		if ( left < 8 ) left = 8;
		if ( left + popupRect.width > viewportWidth - 8 ) {
			left = viewportWidth - popupRect.width - 8;
		}

		// If popup would be off bottom, position above element
		if ( rect.bottom + popupRect.height + 16 > viewportHeight ) {
			top = rect.top + window.scrollY - popupRect.height - 8;
		}

		popup.style.top = `${ top }px`;
		popup.style.left = `${ left }px`;
	}, [ active, element ] );

	// Close on outside click
	useEffect( () => {
		if ( ! active ) return;

		const handleClickOutside = ( event: MouseEvent ) => {
			if ( popupRef.current && ! popupRef.current.contains( event.target as Node ) ) {
				onClose();
			}
		};

		// Delay to prevent immediate close
		const timeoutId = setTimeout( () => {
			document.addEventListener( 'click', handleClickOutside );
		}, 100 );

		return () => {
			clearTimeout( timeoutId );
			document.removeEventListener( 'click', handleClickOutside );
		};
	}, [ active, onClose ] );

	// Close on Escape key
	useEffect( () => {
		if ( ! active ) return;

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onClose();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ active, onClose ] );

	const increment = useCallback( () => {
		setQuantity( prev => Math.min( prev + 1, maxQuantity ) );
	}, [ maxQuantity ] );

	const decrement = useCallback( () => {
		setQuantity( prev => Math.max( prev - 1, minQuantity ) );
	}, [ minQuantity ] );

	const handleConfirm = useCallback( () => {
		onConfirm( quantity );
	}, [ quantity, onConfirm ] );

	if ( ! active || ! choice ) {
		return null;
	}

	return (
		<div
			ref={ popupRef }
			className="ts-popup ts-external-choice-popup"
			style={ {
				position: 'absolute',
				zIndex: 9999,
			} }
		>
			<div className="ts-popup-content">
				<div className="ts-form-group">
					<label>{ choice.label } - Quantity</label>
					<div className="ts-stepper-input flexify">
						<button
							className={ `ts-stepper-left ts-icon-btn${ quantity <= minQuantity ? ' vx-disabled' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								e.stopPropagation();
								decrement();
							} }
							type="button"
							disabled={ quantity <= minQuantity }
						>
							{ renderIcon( icons?.minusIcon ) || <i className="las la-minus" /> }
						</button>
						<input
							type="number"
							className="ts-input-box"
							value={ quantity }
							onChange={ ( e ) => {
								const val = parseInt( e.target.value, 10 );
								if ( ! isNaN( val ) ) {
									setQuantity( Math.max( minQuantity, Math.min( val, maxQuantity ) ) );
								}
							} }
							min={ minQuantity }
							max={ maxQuantity }
						/>
						<button
							className={ `ts-stepper-right ts-icon-btn${ quantity >= maxQuantity ? ' vx-disabled' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								e.stopPropagation();
								increment();
							} }
							type="button"
							disabled={ quantity >= maxQuantity }
						>
							{ renderIcon( icons?.plusIcon ) || <i className="las la-plus" /> }
						</button>
					</div>
				</div>

				<div className="ts-form-group ts-popup-actions flexify">
					<a
						href="#"
						className="ts-btn ts-btn-1"
						onClick={ ( e ) => {
							e.preventDefault();
							onClose();
						} }
					>
						Cancel
					</a>
					<a
						href="#"
						className="ts-btn ts-btn-2"
						onClick={ ( e ) => {
							e.preventDefault();
							handleConfirm();
						} }
					>
						Confirm
					</a>
				</div>
			</div>
		</div>
	);
}
