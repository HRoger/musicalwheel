/**
 * Multiselect Field Component - Phase D Implementation
 * Handles: multiselect field type (multiple selection with checkboxes)
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/multiselect-field.php
 *
 * Value structure: { [choiceValue: string]: boolean }
 * Example: { "option1": true, "option2": true, "option3": false }
 *
 * Phase D Improvements:
 * ✅ Full-screen popup using FieldPopup component
 * ✅ React Portal rendering for correct z-index
 * ✅ Matches Voxel's exact HTML structure
 * ✅ ESC key and backdrop click to close
 * ✅ Search functionality when choices >= 15
 * ✅ Proper Save/Clear buttons
 *
 * Features:
 * - Two display modes: inline (checkboxes directly) and popup (FieldPopup modal)
 * - Search functionality when choices.length >= 15
 * - Checkbox list with icons and selected state styling
 * - Toggle selection on click (Voxel pattern)
 *
 * Uses:
 * - FieldPopup for popup display mode (Phase D)
 * - FieldLabel for consistent label rendering
 * - Checkbox list matching Voxel's structure
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
// Import shared components (Voxel's commons.js pattern)
import { FieldPopup } from '@shared';
import { FieldLabel } from './FieldLabel';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_MENU_ICON, VOXEL_SEARCH_ICON } from '../../utils/voxelDefaultIcons';

interface Choice {
	value: string;
	label: string;
	icon?: string;
}

interface MultiselectFieldProps {
	field: VoxelField;
	value: { [key: string]: boolean };
	onChange: (value: { [key: string]: boolean }) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

// Helper to count selected choices
const getSelectedCount = (value: { [key: string]: boolean }): number => {
	return Object.values(value || {}).filter(Boolean).length;
};

// Helper to get display value (comma-separated labels)
const getDisplayValue = (value: { [key: string]: boolean }, choices: Choice[]): string => {
	if (!value || getSelectedCount(value) === 0) return '';

	const selectedLabels = choices
		.filter(choice => value[choice.value])
		.map(choice => choice.label);

	return selectedLabels.join(', ');
};

export const MultiselectField: React.FC<MultiselectFieldProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons
}) => {
	const displayMode = field.props?.['display_as'] || 'popup';
	const choices: Choice[] = field.props?.['choices'] || [];
	const inputRef = useRef<HTMLDivElement>(null);

	// Popup state (only used for popup display mode)
	const [isOpen, setIsOpen] = useState(false);

	// Search state
	const [search, setSearch] = useState('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Normalize value to object format
	const currentValue: { [key: string]: boolean } = value || {};

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Open popup
	const openPopup = useCallback(() => {
		setSearch(''); // Reset search when opening
		setIsOpen(true);
	}, []);

	// Close popup
	const closePopup = useCallback(() => {
		setIsOpen(false);
		setSearch(''); // Reset search when closing
	}, []);

	// EXACT Voxel: Toggle choice selection
	// Evidence: themes/voxel/templates/widgets/create-post/multiselect-field.php:17
	// Logic: @click.prevent="selectChoice(choice)"
	const selectChoice = useCallback((choice: Choice) => {
		const newValue = { ...currentValue };

		// Toggle the value
		if (newValue[choice.value]) {
			delete newValue[choice.value]; // Remove if already selected
		} else {
			newValue[choice.value] = true; // Add if not selected
		}

		onChange(newValue);
	}, [currentValue, onChange]);

	// Handle save (for popup mode)
	const handleSave = useCallback(() => {
		onBlur?.();
		closePopup();
	}, [onBlur, closePopup]);

	// Handle clear
	const handleClear = useCallback(() => {
		onChange({});
		setSearch('');
	}, [onChange]);

	// Filter choices based on search
	// EXACT Voxel: Show search input when field.props.choices.length >= 15
	// Evidence: themes/voxel/templates/widgets/create-post/multiselect-field.php:64
	const showSearch = choices.length >= 15;

	const searchResults = useMemo(() => {
		if (!search.trim()) return null;

		return choices.filter(choice =>
			choice.label.toLowerCase().includes(search.toLowerCase())
		);
	}, [search, choices]);

	const displayedChoices = searchResults || choices;

	// Display value for the trigger (selected items as comma-separated string)
	const displayValue = useMemo(() => {
		return getDisplayValue(currentValue, choices);
	}, [currentValue, choices]);

	// EXACT Voxel: Use popup_icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/multiselect-field.php:55
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'menu.svg' )
	const triggerIconHtml = iconToHtml(icons?.popup_icon, VOXEL_MENU_ICON);

	// EXACT Voxel: Get search icon from widget settings OR use Voxel default
	// Pattern: Similar to other fields with search
	const searchIconHtml = iconToHtml(icons?.tsSearchIcon, VOXEL_SEARCH_ICON);

	// Render checkbox list
	// EXACT Voxel: Matches HTML structure from multiselect-field.php
	const renderCheckboxList = (isInline: boolean = false) => {
		// DEBUG: Comprehensive data structure logging
		console.group('MultiselectField - Data Structure Debug');
		console.log('Field label:', field.label);
		console.log('Field props:', field.props);
		console.log('Choices array length:', choices.length);
		console.log('All choices:', choices);
		if (displayedChoices.length > 0) {
			console.log('First choice:', displayedChoices[0]);
			console.log('First choice.value:', displayedChoices[0].value);
			console.log('First choice.label:', displayedChoices[0].label);
			console.log('First choice.icon:', displayedChoices[0].icon);
			console.log('First choice.icon type:', typeof displayedChoices[0].icon);
			console.log('First choice keys:', Object.keys(displayedChoices[0]));
		}
		console.groupEnd();
		// DEBUG END

		return (
			<div className={`ts-term-dropdown ts-md-group ts-multilevel-dropdown ${isInline ? 'inline-multilevel min-scroll' : ''}`}>
				<ul className="simplify-ul ts-term-dropdown-list">
					{displayedChoices.map((choice) => (
						<li
							key={choice.value}
							className={currentValue[choice.value] ? 'ts-selected' : ''}
						>
							<a
								href="#"
								className="flexify"
								onClick={(e) => {
									e.preventDefault();
									selectChoice(choice);
								}}
							>
								<div className="ts-checkbox-container">
									<label className="container-checkbox">
										<input
											type="checkbox"
											value={choice.value}
											checked={!!currentValue[choice.value]}
											disabled
											hidden
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{choice.label}</span>
								<div className="ts-term-icon">
									<span dangerouslySetInnerHTML={{ __html: choice.icon || '' }} />
								</div>
							</a>
						</li>
					))}
				</ul>

				{/* No results message */}
				{searchResults && searchResults.length === 0 && (
					<div className="ts-empty-user-tab">
						<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
						<p>No results found</p>
					</div>
				)}
			</div>
		);
	};

	// ========================================
	// INLINE DISPLAY MODE
	// ========================================
	if (displayMode === 'inline') {
		return (
			<div className={`ts-form-group inline-terms-wrapper ts-inline-filter field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
				<FieldLabel
					field={field}
					value={null}
					className="ts-form-label"
				/>
				{renderCheckboxList(true)}
			</div>
		);
	}

	// ========================================
	// POPUP DISPLAY MODE (default)
	// ========================================
	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Field label */}
			<FieldLabel
				field={field}
				value={getSelectedCount(currentValue) > 0 ? displayValue : null}
				className="ts-form-label"
			/>

			{/* Trigger button to open popup */}
			{/* EXACT Voxel: multiselect-field.php:54-61 */}
			<div
				ref={inputRef}
				className={`ts-filter ts-popup-target ${displayValue ? 'ts-filled' : ''}`}
				role="button"
				tabIndex={0}
				onClick={openPopup}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openPopup();
					}
				}}
				aria-label={`Select options: ${displayValue || field.props?.['placeholder']}`}
			>
				<span dangerouslySetInnerHTML={{ __html: triggerIconHtml }} />
				<div className="ts-filter-text">
					{displayValue ? (
						<span>{displayValue}</span>
					) : (
						<span>{field.props?.['placeholder']}</span>
					)}
				</div>
				<div className="ts-down-icon"></div>
			</div>

			{/* Multiselect popup */}
			{/* EXACT Voxel: No title shown in popup header for multiselect */}
			{/* Evidence: themes/voxel/templates/widgets/create-post/multiselect-field.php:40-114 */}
			<FieldPopup
				isOpen={isOpen}
				target={inputRef}
				title=""
				icon={triggerIconHtml}
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				onSave={handleSave}
				onClear={handleClear}
				onClose={closePopup}
			>
				{/* Search input (when >= 15 choices) */}
				{showSearch && (
					<div className="ts-sticky-top uib b-bottom">
						<div className="ts-input-icon flexify">
							<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
							<input
								ref={searchInputRef}
								type="text"
								className="autofocus"
								placeholder="Search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>
				)}

				{/* Checkbox list */}
				{renderCheckboxList()}
			</FieldPopup>
		</div>
	);
};

export default MultiselectField;

