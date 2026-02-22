/**
 * Timezone Field Component - Phase D Implementation
 * Handles: timezone field type
 *
 * EXACT 1:1 match with Voxel's timezone-field.php
 * Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php
 *
 * Key Voxel patterns:
 * - Flat list of all timezones (NO grouping) - Line 30: v-for="timezone in choices"
 * - Radio buttons (NOT checkboxes) - Lines 32-36: .ts-radio-container structure
 * - Full timezone identifiers - Line 39: "America/New_York" NOT "New York"
 * - NO chevron icon on trigger - Lines 14-19: only clock icon + text
 * - Uses full timezone_identifiers_list() from PHP - Line 58: timezone_identifiers_list()
 */
import React, { useState, useMemo, useRef } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
// Import shared components (Voxel's commons.js pattern)
import { FieldPopup } from '@shared';
import { FieldLabel } from './FieldLabel';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_CLOCK_ICON, VOXEL_SEARCH_ICON } from '../../utils/voxelDefaultIcons';

interface TimezoneFieldProps {
	field: VoxelField;
	value: string | null; // Timezone string like "America/New_York"
	onChange: (value: string | null) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const TimezoneField: React.FC<TimezoneFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	const [selected, setSelected] = useState<string | null>(value);
	const [searchTerm, setSearchTerm] = useState('');

	// Get timezone list from field props (provided by Voxel's frontend_props())
	// Evidence: themes/voxel/app/post-types/fields/singular/timezone-field.php:58
	const timezones: string[] = Array.isArray(field.props?.['list']) ? field.props['list'] as string[] : [];
	const defaultTimezone: string = String(field.props?.['default'] ?? '+00:00 (site default)');

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Filter timezones by search term
	const filteredTimezones = useMemo(() => {
		if (!searchTerm.trim()) return timezones;

		return timezones.filter((tz) =>
			tz.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [searchTerm, timezones]);

	// Handle timezone selection
	// IMPORTANT: Set value IMMEDIATELY when selecting (like Voxel)
	// Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php:31
	// Pattern: @click.prevent="field.value = timezone" (sets value immediately, NOT on Save)
	const handleSelect = (timezone: string) => {
		setSelected(timezone);
		onChange(timezone); // Set value immediately (Voxel pattern)
		onBlur?.(); // Trigger validation
	};

	// Handle clear
	const handleClear = () => {
		setSelected(null);
		onChange(null);
	};

	// Display value (use selected timezone or default)
	const displayValue = selected || defaultTimezone;

	// Popup state
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Open popup
	const openPopup = () => {
		setSearchTerm(''); // Reset search when opening
		setIsOpen(true);
	};

	// Close popup
	const closePopup = () => {
		setIsOpen(false);
		setSearchTerm(''); // Reset search when closing
	};

	// EXACT Voxel: Get clock icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php:15
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'clock.svg' )
	const clockIconHtml = iconToHtml(icons?.tsClockIcon, VOXEL_CLOCK_ICON);

	// EXACT Voxel: Get search icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php:24
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'search.svg' )
	const searchIconHtml = iconToHtml(icons?.tsSearchIcon, VOXEL_SEARCH_ICON);

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Field label */}
			<FieldLabel
				field={field}
				value={selected}
				errors={field.validation?.errors || []}
			/>

			{/* Trigger button to open popup */}
			{/* EXACT Voxel: NO chevron icon, only clock + text */}
			{/* Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php:14-19 */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target ${selected ? 'ts-filled' : ''}`}
				role="button"
				tabIndex={0}
				onClick={openPopup}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openPopup();
					}
				}}
				aria-label={`Select timezone: ${displayValue}`}
			>
				<span dangerouslySetInnerHTML={{ __html: clockIconHtml }} />
				<div className="ts-filter-text">
					<span>{displayValue}</span>
				</div>
			</div>

			{/* Timezone popup */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef as React.RefObject<HTMLElement>}
				title=""
				icon={clockIconHtml}
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				onSave={() => {
					onChange(selected);
					onBlur?.();
					closePopup();
				}}
				onClear={handleClear}
				onClose={closePopup}
			>
				{/* Search Bar */}
				{/* EXACT Voxel: themes/voxel/templates/widgets/create-post/timezone-field.php:22-27 */}
				<div className="ts-sticky-top uib b-bottom">
					<div className="ts-input-icon flexify">
						<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search timezones"
							className="autofocus"
						/>
					</div>
				</div>

				{/* Timezone List - FLAT, NO GROUPING */}
				{/* EXACT Voxel: themes/voxel/templates/widgets/create-post/timezone-field.php:28-44 */}
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					<ul className="simplify-ul ts-term-dropdown-list min-scroll">
						{filteredTimezones.length > 0 ? (
							filteredTimezones.map((timezone) => (
								<li key={timezone}>
									<a
										href="#"
										className="flexify"
										onClick={(e) => {
											e.preventDefault();
											handleSelect(timezone);
										}}
									>
										{/* EXACT Voxel: Radio button container */}
										{/* Evidence: themes/voxel/templates/widgets/create-post/timezone-field.php:32-36 */}
										<div className="ts-radio-container">
											<label className="container-radio">
												<input
													type="radio"
													value={timezone}
													checked={selected === timezone}
													disabled
													hidden
												/>
												<span className="checkmark"></span>
											</label>
										</div>

										{/* EXACT Voxel: Full timezone identifier */}
										{/* Evidence: Line 39: {{ timezone }} - displays "America/New_York" NOT "New York" */}
										<span>{timezone}</span>
									</a>
								</li>
							))
						) : (
							<div className="ts-empty-user-tab">
								<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
								<p>No timezones found</p>
							</div>
						)}
					</ul>
				</div>
			</FieldPopup>
		</div>
	);
};

export default TimezoneField;
