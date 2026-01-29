/**
 * FilterRelations Component
 *
 * Relations filter for connected posts matching Voxel's HTML structure exactly.
 *
 * REUSES: FieldPopup from create-post block
 * - Portal-based popup positioning
 * - Click-outside-to-close (blurable mixin)
 *
 * 1:1 VOXEL PARITY:
 * The PHP controller now calls $filter->set_value() before $filter->frontend_props(),
 * so filterData.value and filterData.props.post are properly populated.
 * Evidence: themes/voxel/app/post-types/filters/relations-filter.php:127-138
 *
 * This component now uses:
 * - filterData.value: The current filter value (set by PHP)
 * - filterData.props.post: Post data (title, logo) populated by frontend_props()
 * - value (state): User interactions that override the initial value
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface RelationOption {
	id: number;
	title: string;
}

interface PostData {
	title?: string;
	logo?: string;
}

export default function FilterRelations( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';

	const triggerRef = useRef< HTMLDivElement >( null );
	const searchInputRef = useRef< HTMLInputElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ options, setOptions ] = useState< RelationOption[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );

	const props = filterData.props || {};
	const placeholder = props.placeholder || filterData.label || 'Related';
	// Post data from PHP frontend_props() - populated when set_value() was called
	// Evidence: themes/voxel/app/post-types/filters/relations-filter.php:127-138
	const propsPostData = props.post as PostData | undefined;

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Focus search input when popup opens
	useEffect( () => {
		if ( isOpen ) {
			setSearchTerm( '' );
			setOptions( [] );
			setTimeout( () => searchInputRef.current?.focus(), 50 );
		}
	}, [ isOpen ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const handleSearch = useCallback( ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const term = e.target.value;
		setSearchTerm( term );

		if ( term.length >= 2 ) {
			setIsLoading( true );
			// In a real implementation, this would search related posts via REST API
			setTimeout( () => {
				setOptions( [] );
				setIsLoading( false );
			}, 300 );
		} else {
			setOptions( [] );
		}
	}, [] );

	const handleSelect = useCallback( ( optionId: number, optionTitle: string ) => {
		onChange( { id: optionId, title: optionTitle } );
		setIsOpen( false );
		setSearchTerm( '' );
	}, [ onChange ] );

	const handleClear = useCallback( () => {
		onChange( null );
		setSearchTerm( '' );
		setOptions( [] );
	}, [ onChange ] );

	// Determine effective value using 1:1 Voxel parity approach
	// Priority:
	// 1. State value (from user interaction or clearAll) - if explicitly set
	// 2. filterData.value from PHP (set via set_value() before frontend_props())
	//
	// The `value` prop comes from state.filterValues[filterKey]
	// - undefined = not initialized yet, use filterData.value
	// - null = explicitly cleared (e.g., clearAll with resetValue='empty')
	// - value = has a value from user interaction
	let effectiveValue: number | null = null;

	if ( value !== undefined ) {
		// State has been set - could be a value or null (from clearAll)
		const stateValue = value as { id?: number; title?: string } | number | null;
		if ( stateValue === null ) {
			effectiveValue = null;
		} else if ( typeof stateValue === 'number' ) {
			effectiveValue = stateValue;
		} else if ( typeof stateValue === 'object' && stateValue?.id ) {
			effectiveValue = stateValue.id;
		}
	} else if ( filterData.value !== null && filterData.value !== undefined ) {
		// Use filterData.value from PHP (1:1 Voxel parity)
		effectiveValue = typeof filterData.value === 'number' ? filterData.value : Number( filterData.value );
	}

	const hasValue = effectiveValue !== null && ! isNaN( effectiveValue ) && effectiveValue > 0;

	// Get display name from props.post (PHP) or state value
	let displayValue = placeholder;
	if ( hasValue ) {
		// Priority 1: State value with title (user selected)
		const stateValue = value as { id?: number; title?: string } | null;
		if ( stateValue && typeof stateValue === 'object' && stateValue.title ) {
			displayValue = stateValue.title;
		}
		// Priority 2: PHP props.post data (from frontend_props)
		else if ( propsPostData?.title ) {
			displayValue = propsPostData.title;
		}
	}

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
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
				{ /* If no icon configured, show NO icon (not a default fallback) */ }
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ hasValue }
				showSave={ false }
				onSave={ () => setIsOpen( false ) }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
				className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
				popupStyle={ popupStyles.style }
			>
				{ /* Search input */ }
				<div className="ts-form-group">
					<div className="flexify ts-input-icon">
						<span>{ VoxelIcons.search }</span>
						<input
							ref={ searchInputRef }
							type="text"
							className="inline-input"
							value={ searchTerm }
							onChange={ handleSearch }
							placeholder="Search..."
						/>
					</div>
				</div>

				{ /* Results */ }
				{ isLoading ? (
					<div className="ts-loading">
						<span className="ts-loader"></span>
					</div>
				) : options.length > 0 ? (
					<div className="ts-term-dropdown">
						<ul className="simplify-ul ts-term-dropdown-list">
							{ options.map( ( option ) => (
								<li key={ option.id }>
									<a
										href="#"
										className="flexify"
										onClick={ ( e ) => {
											e.preventDefault();
											handleSelect( option.id, option.title );
										} }
									>
										<span>{ option.title }</span>
									</a>
								</li>
							) ) }
						</ul>
					</div>
				) : searchTerm.length >= 2 ? (
					<div className="ts-empty-user-tab">
						{ /* Only show icon if configured - no fallback */ }
						{ filterIcon && (
							<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
						) }
						<p>No results found</p>
					</div>
				) : null }
			</FieldPopup>
		</div>
	);
}
