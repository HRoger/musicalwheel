/**
 * FilterKeywords Component
 *
 * Keywords/text search filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/keywords-filter.php
 *
 * REUSES: FieldPopup from create-post block for popup mode
 * - Portal-based popup positioning
 * - Click-outside-to-close (blurable mixin)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
// VoxelIcons.search is still used for input field UI icons (internal decoration)
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

export default function FilterKeywords( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${blockId}` : '';
	const triggerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLInputElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ inputValue, setInputValue ] = useState( '' );
	// Inline mode local state — Voxel only commits on blur/Enter, not on every keystroke
	// Evidence: keywords-filter.php:14 @keyup.enter="saveValue(); onEnter();" and :15 @blur="saveValue"
	const [ inlineValue, setInlineValue ] = useState( '' );

	const stringValue = typeof value === 'string' ? value : '';
	const placeholder = String(filterData.props?.['placeholder'] || filterData.label || 'Type keywords...');
	// Evidence: keywords-filter.php:278 default is 'popup'
	const displayAs = config.displayAs || filterData.props?.['display_as'] || 'popup';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Sync inline value from external value changes
	useEffect( () => {
		setInlineValue( stringValue );
	}, [ stringValue ] );

	// Sync popup input value when popup opens
	useEffect( () => {
		if ( isOpen ) {
			setInputValue( stringValue );
			// Focus input when popup opens
			setTimeout( () => {
				inputRef.current?.focus();
			}, 50 );
		}
	}, [ isOpen, stringValue ] );

	// Inline mode: local state updates on type, commit on blur/Enter
	// Evidence: Voxel keywords-filter.php:14 @keyup.enter="saveValue(); onEnter();" :15 @blur="saveValue"
	// Evidence: search-form.js saveValue() { this.filter.value = this.isFilled() ? this.value.trim() : null }
	const handleInlineChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setInlineValue( e.target.value );
	};

	const saveInlineValue = useCallback( () => {
		// Matches Voxel isFilled(): this.value.trim().length
		const trimmed = inlineValue.trim();
		onChange( trimmed.length > 0 ? trimmed : '' );
	}, [ inlineValue, onChange ] );

	const handleInlineKeyDown = useCallback( ( e: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();
			saveInlineValue();
		}
	}, [ saveInlineValue ] );

	const handlePopupInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setInputValue( e.target.value );
	};

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const handleSave = useCallback( () => {
		// Evidence: search-form.js saveValue() { this.filter.value = this.isFilled() ? this.value.trim() : null }
		const trimmed = inputValue.trim();
		onChange( trimmed.length > 0 ? trimmed : '' );
		setIsOpen( false );
	}, [ inputValue, onChange ] );

	const handleClear = useCallback( () => {
		setInputValue( '' );
		onChange( '' );
	}, [ onChange ] );

	const handleKeyDown = useCallback( ( e: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();
			handleSave();
		}
	}, [ handleSave ] );

	// Voxel inline mode: ts-form-group ts-inline-filter
	// Structure matches: templates/widgets/search-form/keywords-filter.php
	if ( displayAs === 'inline' ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group ts-inline-filter' );
		return (
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }
				<div className="ts-input-icon flexify">
					{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
					{ /* If no icon configured, show NO icon (not a default fallback) */ }
					{ filterIcon && (
						<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
					) }
					<input
						type="text"
						value={ inlineValue }
						onChange={ handleInlineChange }
						onBlur={ saveInlineValue }
						onKeyDown={ handleInlineKeyDown }
						placeholder={ placeholder }
						className="inline-input"
					/>
				</div>
			</div>
		);
	}

	// Popup mode - uses portal-based FieldPopup from create-post
	// Evidence: search-form.js isFilled() { return this.value.trim().length }
	const hasValue = stringValue.trim().length > 0;
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
				<div className="ts-filter-text">
					{ hasValue ? stringValue : placeholder }
				</div>
				{ /* Keywords filter does NOT have ts-down-icon per Voxel original */ }
				{ /* Evidence: templates/widgets/search-form/keywords-filter.php:22-25 */ }
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef as any }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ true }
				onSave={ handleSave }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
				className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
				popupStyle={ popupStyles.style }
			>
				{ /* Popup content - matches Voxel's keywords-filter.php popup structure */ }
				<div className="ts-input-icon ts-sticky-top flexify">
					<span>{ VoxelIcons.search }</span>
					<input
						ref={ inputRef }
						type="text"
						value={ inputValue }
						onChange={ handlePopupInputChange }
						onKeyDown={ handleKeyDown }
						placeholder={ placeholder }
						className="autofocus border-none"
					/>
				</div>
			</FieldPopup>
		</div>
	);
}
