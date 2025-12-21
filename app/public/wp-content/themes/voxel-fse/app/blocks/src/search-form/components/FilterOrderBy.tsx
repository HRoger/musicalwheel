/**
 * FilterOrderBy Component
 *
 * Order by/sorting filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php
 *
 * CRITICAL: Supports 4 display modes based on config.displayAs:
 * 1. Popup mode (line 64-97): Dropdown with radio list (default)
 * 2. Buttons mode (line 2-16): Horizontal button list (addon-buttons)
 * 3. Alt-btn mode (line 18-27): Individual filter buttons
 * 4. Post-feed mode (line 29-62): Teleported to post feed header (NOT IMPLEMENTED)
 *
 * REUSES: FieldPopup from create-post block
 * - Portal-based popup positioning
 * - Click-outside-to-close (blurable mixin)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { VoxelIcons, getFilterWrapperStyles, FieldPopup } from '@shared';

interface OrderByOption {
	key: string;
	label: string;
	placeholder?: string;
	icon?: string;
}

export default function FilterOrderBy( {
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps ) {
	const triggerRef = useRef< HTMLDivElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const props = filterData.props || {};
	const displayAs = config.displayAs || filterData.props?.display_as || 'popup';
	const placeholder = props.placeholder || filterData.label || 'Order By';

	// Parse choices from props (comes from Voxel PHP)
	// Evidence: order-by-filter.php:63-76 returns choices as array with key, label, placeholder, icon
	const options: OrderByOption[] = useMemo( () => {
		const choices = props.choices || {};
		// Choices can be object or array
		if ( Array.isArray( choices ) ) {
			return choices;
		}
		return Object.entries( choices ).map( ( [ key, choice ]: [ string, any ] ) => ( {
			key,
			label: choice.label || choice,
			placeholder: choice.placeholder || choice.label || choice,
			icon: choice.icon || VoxelIcons.orderBy,
		} ) );
	}, [ props.choices ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const handleSelect = useCallback( ( optionKey: string ) => {
		onChange( optionKey );
		// Only close popup in popup mode
		if ( displayAs === 'popup' ) {
			setIsOpen( false );
		}
	}, [ onChange, displayAs ] );

	const handleClear = useCallback( () => {
		onChange( null );
	}, [ onChange ] );

	const stringValue = typeof value === 'string' ? value : '';
	const hasValue = !! stringValue;
	const selectedOption = options.find( ( opt ) => opt.key === stringValue );
	const displayValue = selectedOption?.placeholder || selectedOption?.label || placeholder;

	// Render radio list (used in popup mode)
	const renderRadioList = () => (
		<div className="ts-term-dropdown ts-md-group">
			<ul className="simplify-ul ts-term-dropdown-list min-scroll">
				{ options.map( ( option ) => {
					const isSelected = stringValue === option.key;
					return (
						<li key={ option.key } className={ isSelected ? 'ts-selected' : '' }>
							<a
								href="#"
								className="flexify"
								onClick={ ( e ) => {
									e.preventDefault();
									handleSelect( option.key );
								} }
							>
								<div className="ts-radio-container">
									<label className="container-radio">
										<input
											type="radio"
											value={ option.key }
											checked={ isSelected }
											readOnly
											disabled
											hidden
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{ option.label }</span>
								{ option.icon && (
									<div className="ts-term-icon">
										<span dangerouslySetInnerHTML={ { __html: option.icon } } />
									</div>
								) }
							</a>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	// MODE 1: Buttons mode - Horizontal button list
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 2-16
	if ( displayAs === 'buttons' ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
		return (
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }
				<ul className="simplify-ul addon-buttons flexify">
					{ options.map( ( option ) => {
						const isSelected = stringValue === option.key;
						return (
							<li
								key={ option.key }
								className={ `flexify${ isSelected ? ' adb-selected' : '' }` }
								onClick={ () => handleSelect( option.key ) }
							>
								{ option.placeholder || option.label }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}

	// MODE 2: Alt-btn mode - Individual filter buttons for each choice
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 18-27
	if ( displayAs === 'alt-btn' ) {
		return (
			<>
				{ options.map( ( option ) => {
					const isSelected = stringValue === option.key;
					const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
					return (
						<div key={ option.key } className={ className } style={ style }>
							{ ! config.hideLabel && <label>{ option.label }</label> }
							<div
								className={ `ts-filter${ isSelected ? ' ts-filled' : '' }` }
								onClick={ () => handleSelect( option.key ) }
							>
								{ option.icon && <span dangerouslySetInnerHTML={ { __html: option.icon } } /> }
								<div className="ts-filter-text">
									<span>{ option.placeholder || option.label }</span>
								</div>
							</div>
						</div>
					);
				} ) }
			</>
		);
	}

	// MODE 3: Post-feed mode - Teleported to post feed header
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 29-62
	// NOTE: This requires React Portal to a specific element ID which may not exist
	// For now, fall through to popup mode
	// TODO: Implement post-feed mode when needed

	// MODE 4: Popup mode (default) - Dropdown with radio list
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 64-97
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }

			{ /* Trigger button */ }
			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
				onClick={ openPopup }
				onMouseDown={ ( e ) => e.preventDefault() }
				role="button"
				tabIndex={ 0 }
			>
				<span>{ VoxelIcons.orderBy }</span>
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title=""
				icon={ VoxelIcons.orderBy }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ hasValue }
				showSave={ false }
				onSave={ () => setIsOpen( false ) }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
				className="hide-head"
			>
				{ renderRadioList() }
			</FieldPopup>
		</div>
	);
}
