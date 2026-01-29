/**
 * FilterPostStatus Component
 *
 * Post status filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/post-status-filter.php
 *
 * CRITICAL: Supports 2 display modes based on config.displayAs:
 * 1. Popup mode (line 13-53): Dropdown with radio list (default) - uses FieldPopup with React Portal
 * 2. Buttons mode (line 2-11): Individual filter buttons for each choice
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface PostStatusChoice {
	key: string;
	label: string;
}

export default function FilterPostStatus( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';

	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLDivElement >( null );

	const props = filterData.props || {};
	const displayAs = config.displayAs || filterData.props?.display_as || 'popup';
	const placeholder = props.placeholder || filterData.label || 'Status';

	// Parse choices from props (comes from Voxel PHP)
	// Evidence: post-status-filter.php:84-88 returns choices as array with key, label
	const choices: PostStatusChoice[] = useMemo( () => {
		const statusChoices = props.choices || {};
		// Choices can be object or array
		if ( Array.isArray( statusChoices ) ) {
			return statusChoices;
		}
		return Object.entries( statusChoices ).map( ( [ key, choice ]: [ string, any ] ) => ( {
			key,
			label: choice.label || choice,
		} ) );
	}, [ props.choices ] );

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	const handleSelect = useCallback( ( statusValue: string ) => {
		onChange( statusValue );
		setIsOpen( false );
	}, [ onChange ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const stringValue = typeof value === 'string' ? value : '';
	const hasValue = !! stringValue;
	const selectedChoice = choices.find( ( opt ) => opt.key === stringValue );
	const displayValue = hasValue ? selectedChoice?.label || placeholder : placeholder;

	// Render radio list (used in popup mode)
	const renderRadioList = () => (
		<div className="ts-term-dropdown ts-md-group">
			<ul className="simplify-ul ts-term-dropdown-list min-scroll">
				{ choices.map( ( choice ) => {
					const isSelected = stringValue === choice.key;
					return (
						<li key={ choice.key }>
							<a
								href="#"
								className="flexify"
								onClick={ ( e ) => {
									e.preventDefault();
									handleSelect( choice.key );
								} }
							>
								<div className="ts-radio-container">
									<label className="container-radio">
										<input
											type="radio"
											value={ choice.key }
											checked={ isSelected }
											readOnly
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{ choice.label }</span>
								{ /* Icon from API (HTML markup) - matches Voxel v-html pattern */ }
								{ filterIcon && (
									<div className="ts-term-icon">
										<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
									</div>
								) }
							</a>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	// MODE 1: Buttons mode - Individual filter buttons for each choice
	// Evidence: themes/voxel/templates/widgets/search-form/post-status-filter.php line 2-11
	if ( displayAs === 'buttons' ) {
		return (
			<>
				{ choices.map( ( choice ) => {
					const isSelected = stringValue === choice.key;
					const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
					return (
						<div key={ choice.key } className={ className } style={ style }>
							{ ! config.hideLabel && <label>{ filterData.label }</label> }
							<div
								className={ `ts-filter${ isSelected ? ' ts-filled' : '' }` }
								onClick={ () => onChange( choice.key ) }
							>
								{ /* Icon from API (HTML markup) - matches Voxel v-html pattern */ }
								{ filterIcon && (
									<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
								) }
								<div className="ts-filter-text">
									<span>{ choice.label }</span>
								</div>
							</div>
						</div>
					);
				} ) }
			</>
		);
	}

	// MODE 2: Popup mode (default) - Dropdown with radio list using FieldPopup
	// Evidence: themes/voxel/templates/widgets/search-form/post-status-filter.php line 13-53
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

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
				{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				showSave={ false }
				showClear={ false }
				onSave={ () => setIsOpen( false ) }
				onClose={ () => setIsOpen( false ) }
				className={ `hide-head ${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}`.trim() }
				popupStyle={ popupStyles.style }
			>
				{ renderRadioList() }
			</FieldPopup>
		</div>
	);
}
