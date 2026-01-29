/**
 * TagMultiSelect Component
 *
 * Multi-select component matching Elementor's Select2 pattern.
 * Shows selected items as tags in a container with dropdown for selection.
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';

// Note: elementor-controls.css is loaded via shared-styles.ts entry point

interface TagMultiSelectOption {
	label: string;
	value: string;
}

interface TagMultiSelectProps {
	label: string;
	value: string[];
	options: TagMultiSelectOption[];
	onChange: ( value: string[] ) => void;
	placeholder?: string;
}

/**
 * TagMultiSelect - Select2-style multi-select control
 *
 * Matches Elementor's select2-selection--multiple pattern with
 * inline tags and dropdown selection.
 *
 * @example
 * <TagMultiSelect
 *   label="Choose post types"
 *   value={attributes.postTypes}
 *   options={postTypeOptions}
 *   onChange={(types) => setAttributes({ postTypes: types })}
 * />
 */
export default function TagMultiSelect( {
	label,
	value = [],
	options,
	onChange,
	placeholder = __( 'Select items...', 'voxel-fse' ),
}: TagMultiSelectProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const containerRef = useRef< HTMLDivElement >( null );
	const dropdownRef = useRef< HTMLDivElement >( null );
	const searchInputRef = useRef< HTMLInputElement >( null );

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			if (
				containerRef.current &&
				! containerRef.current.contains( event.target as Node )
			) {
				setIsOpen( false );
				setSearchTerm( '' );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [] );

	// Position dropdown
	useEffect( () => {
		if ( ! isOpen || ! dropdownRef.current || ! containerRef.current ) {
			return;
		}

		const updatePosition = () => {
			if ( ! dropdownRef.current || ! containerRef.current ) {
				return;
			}
			const rect = containerRef.current.getBoundingClientRect();
			const dropdown = dropdownRef.current;
			const dropdownHeight = dropdown.offsetHeight;
			const viewportHeight = window.innerHeight;

			// Position below the container
			let top = rect.bottom + 1;

			// If not enough space below, position above
			if ( top + dropdownHeight > viewportHeight - 8 ) {
				top = rect.top - dropdownHeight - 1;
			}

			dropdown.style.top = `${ top }px`;
			dropdown.style.left = `${ rect.left }px`;
			dropdown.style.width = `${ rect.width }px`;
		};

		updatePosition();

		window.addEventListener( 'resize', updatePosition );
		window.addEventListener( 'scroll', updatePosition, true );
		return () => {
			window.removeEventListener( 'resize', updatePosition );
			window.removeEventListener( 'scroll', updatePosition, true );
		};
	}, [ isOpen ] );

	// Focus search input when dropdown opens
	useEffect( () => {
		if ( isOpen && searchInputRef.current ) {
			searchInputRef.current.focus();
		}
	}, [ isOpen ] );

	// Get label for a value
	const getLabel = ( val: string ) => {
		const option = options.find( ( opt ) => opt.value === val );
		return option ? option.label : val;
	};

	// Remove item
	const removeItem = ( val: string, e: React.MouseEvent ) => {
		e.stopPropagation();
		onChange( value.filter( ( v ) => v !== val ) );
	};

	// Toggle item selection
	const toggleItem = ( val: string ) => {
		if ( value.includes( val ) ) {
			onChange( value.filter( ( v ) => v !== val ) );
		} else {
			onChange( [ ...value, val ] );
		}
	};

	// Filter options by search term
	const filteredOptions = options.filter( ( option ) =>
		option.label.toLowerCase().includes( searchTerm.toLowerCase() )
	);

	// Handle container click
	const handleContainerClick = () => {
		setIsOpen( true );
	};

	// Handle keyboard navigation
	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( e.key === 'Backspace' && searchTerm === '' && value.length > 0 ) {
			// Remove last selected item
			onChange( value.slice( 0, -1 ) );
		} else if ( e.key === 'Escape' ) {
			setIsOpen( false );
			setSearchTerm( '' );
		}
	};

	return (
		<div className="vxfse-select2-wrap select2-container select2-container--default" ref={ containerRef }>
			{ label && (
				<label className="components-base-control__label">{ label }</label>
			) }
			<span
				className={ `select2-selection select2-selection--multiple ${
					isOpen ? 'select2-selection--focus' : ''
				}` }
				onClick={ handleContainerClick }
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={ isOpen }
			>
				<ul className="select2-selection__rendered">
					{ value.map( ( val ) => (
						<li key={ val } className="select2-selection__choice">
							<button
								type="button"
								className="select2-selection__choice__remove"
								onClick={ ( e ) => removeItem( val, e ) }
								aria-label={ __( 'Remove', 'voxel-fse' ) }
							>
								<span aria-hidden="true">×</span>
							</button>
							<span className="select2-selection__choice__display">
								{ getLabel( val ) }
							</span>
						</li>
					) ) }
					<li className="select2-search select2-search--inline">
						<input
							ref={ searchInputRef }
							type="search"
							className="select2-search__field"
							placeholder={ value.length === 0 ? placeholder : '' }
							value={ searchTerm }
							onChange={ ( e ) => setSearchTerm( e.target.value ) }
							onKeyDown={ handleKeyDown }
							onFocus={ () => setIsOpen( true ) }
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
						/>
					</li>
				</ul>
			</span>

			{ isOpen && (
				<div
					ref={ dropdownRef }
					className="vxfse-select2-dropdown select2-dropdown select2-dropdown--below"
					style={ {
						position: 'fixed',
						zIndex: 1000000,
					} }
				>
					<span className="select2-results">
						<ul className="select2-results__options" role="listbox">
							{ filteredOptions.length === 0 ? (
								<li className="select2-results__option select2-results__message">
									{ __( 'No results found', 'voxel-fse' ) }
								</li>
							) : (
								filteredOptions.map( ( option ) => {
									const isSelected = value.includes( option.value );
									return (
										<li
											key={ option.value }
											className={ `select2-results__option ${
												isSelected
													? 'select2-results__option--selected'
													: ''
											}` }
											role="option"
											aria-selected={ isSelected }
											onClick={ () => toggleItem( option.value ) }
										>
											{ option.label }
										</li>
									);
								} )
							) }
						</ul>
					</span>
				</div>
			) }
		</div>
	);
}
