/**
 * FilterFollowing Component
 *
 * Following/Followed by filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/ssr/following-post-ssr.php
 *
 * 1:1 VOXEL PARITY:
 * The PHP controller now calls $filter->set_value() before $filter->frontend_props(),
 * so filterData.value and filterData.props.user are properly populated.
 * Evidence:
 * - themes/voxel/app/post-types/filters/followed-by-filter.php:72-85
 * - themes/voxel/app/post-types/filters/following-user-filter.php:61-74
 *
 * This component now uses:
 * - filterData.value: The current filter value (set by PHP)
 * - filterData.props.user: User data (name, avatar) populated by frontend_props()
 * - value (state): User interactions that override the initial value
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles } from '@shared';

interface FollowingValue {
	id?: number;
	name?: string;
}

interface UserData {
	name?: string;
	avatar?: string;
}

export default function FilterFollowing( {
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ results, setResults ] = useState< Array< { id: number; name: string } > >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );

	const props = filterData.props || {};
	const placeholder = props.placeholder || filterData.label || 'Following';
	// User data from PHP frontend_props() - populated when set_value() was called
	// Evidence: themes/voxel/app/post-types/filters/followed-by-filter.php:72-85
	const propsUserData = props.user as UserData | undefined;

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	const handleSearch = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const term = e.target.value;
		setSearchTerm( term );

		if ( term.length >= 2 ) {
			setIsLoading( true );
			// In a real implementation, this would search via REST API
			setTimeout( () => {
				setResults( [] );
				setIsLoading( false );
			}, 300 );
		} else {
			setResults( [] );
		}
	};

	const handleSelect = ( id: number, name: string ) => {
		onChange( { id, name } );
		setIsOpen( false );
		setSearchTerm( '' );
	};

	const toggleOpen = ( e: React.MouseEvent ) => {
		e.preventDefault();
		setIsOpen( ! isOpen );
	};

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			if ( containerRef.current && ! containerRef.current.contains( event.target as Node ) ) {
				setIsOpen( false );
			}
		};

		if ( isOpen ) {
			document.addEventListener( 'mousedown', handleClickOutside );
		}

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ isOpen ] );

	// Determine effective value using 1:1 Voxel parity approach
	// Priority:
	// 1. State value (from user interaction or clearAll) - if explicitly set
	// 2. filterData.value from PHP (set via set_value() before frontend_props())
	let effectiveValue: number | null = null;

	if ( value !== undefined ) {
		// State has been set - could be a value or null (from clearAll)
		const stateValue = value as FollowingValue | number | null;
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

	// Get display name from props.user (PHP) or state value
	let displayValue = placeholder;
	if ( hasValue ) {
		// Priority 1: State value with name (user selected)
		const stateValue = value as FollowingValue | null;
		if ( stateValue && typeof stateValue === 'object' && stateValue.name ) {
			displayValue = stateValue.name;
		}
		// Priority 2: PHP props.user data (from frontend_props)
		else if ( propsUserData?.name ) {
			displayValue = propsUserData.name;
		}
	}

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ className } style={ style } ref={ containerRef }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }
			<div
				className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
				onClick={ toggleOpen }
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

			{ /* Voxel dropdown structure */ }
			{ isOpen && (
				<div className="ts-field-popup-container">
					<div className={ popupStyles.className } style={ popupStyles.style }>
						<div className="ts-popup-content-wrapper min-scroll">
							<div className="ts-form-group">
								<div className="flexify ts-input-icon">
									<span>{ VoxelIcons.search }</span>
									<input
										type="text"
										className="inline-input"
										value={ searchTerm }
										onChange={ handleSearch }
										placeholder="Search..."
									/>
								</div>
							</div>

							{ isLoading ? (
								<div className="ts-loading">
									<span className="ts-loader"></span>
								</div>
							) : results.length > 0 ? (
								<div className="ts-term-dropdown">
									<ul className="simplify-ul ts-term-dropdown-list">
										{ results.map( ( item ) => (
											<li key={ item.id }>
												<a
													href="#"
													className="flexify"
													onClick={ ( e ) => {
														e.preventDefault();
														handleSelect( item.id, item.name );
													} }
												>
													<span>{ item.name }</span>
												</a>
											</li>
										) ) }
									</ul>
								</div>
							) : searchTerm.length >= 2 ? (
								<div className="ts-empty-user-list">
									<span>No results found</span>
								</div>
							) : null }
						</div>
					</div>
				</div>
			) }
		</div>
	);
}
