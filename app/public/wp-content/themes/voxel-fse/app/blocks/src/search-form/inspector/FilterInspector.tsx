/**
 * FilterInspector Component
 *
 * Elementor-style filter configuration panel matching Voxel's widget controls.
 * Evidence: themes/voxel/app/widgets/search-form.php (lines 203-434)
 *
 * Filter-type specific controls based on Voxel's get_elementor_controls():
 * - keywords-filter.php: display_as (popup|inline), value
 * - terms-filter.php: display_as (popup|inline|buttons), value, hide_empty_terms, columns
 * - stepper-filter.php: display_as (popup|inline), value
 * - range-filter.php: display_as (popup|inline|minmax), value
 * - location-filter.php: display_as (popup|inline), display_proximity_as, default_search_method
 * - date-filter.php: NO display_as, only value
 * - recurring-date-filter.php: NO display_as
 * - order-by-filter.php: display_as (popup|buttons|alt-btn|post-feed), value, choices
 * - post-status-filter.php: display_as (popup|buttons), value, choices
 * - relations-filter.php: NO display_as, only value
 * - switcher-filter.php: value, open_in_popup (toggle, not select)
 * - availability-filter.php: NO display_as
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	SelectControl,
	TextControl,
	Button,
	BaseControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { SectionHeading, SliderControl, ChooseControl, ResponsiveRangeControl, DynamicTagTextControl, LoopVisibilityControl, FilterPopupStyleControl } from '@shared/controls';
import type { FilterConfig, FilterData } from '../types';

/**
 * Get Voxel range presets for date filters
 * Evidence: themes/voxel/app/post-types/filters/traits/date-filter-helpers.php:125-128
 */
const DATE_PRESETS = [
	{ label: __('All', 'voxel-fse'), value: '' },
	{ label: __('Upcoming', 'voxel-fse'), value: 'upcoming' },
	{ label: __('Today', 'voxel-fse'), value: 'today' },
	{ label: __('Tomorrow', 'voxel-fse'), value: 'tomorrow' },
	{ label: __('This weekend', 'voxel-fse'), value: 'this-weekend' },
	{ label: __('This week', 'voxel-fse'), value: 'this-week' },
	{ label: __('Next week', 'voxel-fse'), value: 'next-week' },
	{ label: __('Next 7 days', 'voxel-fse'), value: 'next-7-days' },
	{ label: __('This month', 'voxel-fse'), value: 'this-month' },
	{ label: __('Next month', 'voxel-fse'), value: 'next-month' },
	{ label: __('Next 30 days', 'voxel-fse'), value: 'next-30-days' },
	{ label: __('This year', 'voxel-fse'), value: 'this-year' },
	{ label: __('Next year', 'voxel-fse'), value: 'next-year' },
	{ label: __('Next 365 days', 'voxel-fse'), value: 'next-365-days' },
	{ label: __('Last 24h', 'voxel-fse'), value: 'last-24h' },
	{ label: __('Last week', 'voxel-fse'), value: 'last-week' },
	{ label: __('Last month', 'voxel-fse'), value: 'last-month' },
];

interface FilterInspectorProps {
	filter: FilterConfig;
	filterData: FilterData | undefined;
	availableFilters: FilterData[];
	onUpdate: (updates: Partial<FilterConfig>) => void;
	onRemove: () => void;
	onEditRules: () => void;
}

/**
 * Get the default display_as value for a filter type
 * This should match the defaults used in the component files
 * Evidence: themes/voxel/app/post-types/filters/*.php
 */
function getDefaultDisplayAs(filterType: string | undefined): string {
	switch (filterType) {
		// These filter types default to 'inline' in their components
		case 'keywords':
		case 'location':
			return 'inline';
		// All other types default to 'popup'
		default:
			return 'popup';
	}
}

/**
 * Get display_as options for a filter type
 * Evidence: themes/voxel/app/post-types/filters/*.php
 */
function getDisplayAsOptions(filterType: string | undefined): { label: string; value: string }[] | null {
	switch (filterType) {
		case 'keywords':
		case 'stepper':
		case 'location':
			// Evidence: keywords-filter.php, stepper-filter.php, location-filter.php
			return [
				{ label: __('Popup', 'voxel-fse'), value: 'popup' },
				{ label: __('Inline', 'voxel-fse'), value: 'inline' },
			];

		case 'terms':
			// Evidence: terms-filter.php:22-31
			return [
				{ label: __('Popup', 'voxel-fse'), value: 'popup' },
				{ label: __('Inline', 'voxel-fse'), value: 'inline' },
				{ label: __('Buttons', 'voxel-fse'), value: 'buttons' },
			];

		case 'range':
			// Evidence: range-filter.php:14-24
			return [
				{ label: __('Popup', 'voxel-fse'), value: 'popup' },
				{ label: __('Inline', 'voxel-fse'), value: 'inline' },
				{ label: __('Min max input fields', 'voxel-fse'), value: 'minmax' },
			];

		case 'order-by':
			// Evidence: order-by-filter.php:77-90
			return [
				{ label: __('Popup', 'voxel-fse'), value: 'popup' },
				{ label: __('Buttons', 'voxel-fse'), value: 'buttons' },
				{ label: __('Icon buttons', 'voxel-fse'), value: 'alt-btn' },
				{ label: __('Post feed', 'voxel-fse'), value: 'post-feed' },
			];

		case 'post-status':
			// Evidence: post-status-filter.php:57-66
			return [
				{ label: __('Popup', 'voxel-fse'), value: 'popup' },
				{ label: __('Buttons', 'voxel-fse'), value: 'buttons' },
			];

		// Filters with NO display_as control:
		// Evidence: date-filter.php, recurring-date-filter.php, relations-filter.php,
		// availability-filter.php, user-filter.php, open-now-filter.php, ui-heading, switcher
		case 'date':
		case 'recurring-date':
		case 'relations':
		case 'availability':
		case 'user':
		case 'open-now':
		case 'switcher':
		case 'ui-heading':
		case 'following':
		case 'followed-by':
		case 'following-post':
		case 'following-user':
			return null;

		default:
			return null;
	}
}

/**
 * Determine if a filter type uses a popup
 * These filters should show popup styling options (min/max width/height)
 * regardless of whether they have display_as options
 */
function filterUsesPopup(type: string | undefined): boolean {
	switch (type) {
		// Filters that use FieldPopup for selection
		case 'terms':
		case 'location':
		case 'availability':
		case 'date':
		case 'recurring-date':
		case 'relations':
		case 'user':
		case 'order-by':
		case 'post-status':
			return true;

		// Filters that render inline (no popup)
		case 'keywords': // inline input
		case 'range': // inline slider
		case 'stepper': // inline buttons
		case 'open-now': // inline toggle
		case 'switcher': // inline toggle
		case 'ui-heading': // static text
		case 'following': // inline toggle
		case 'followed-by':
		case 'following-post':
		case 'following-user':
		default:
			return false;
	}
}

export default function FilterInspector({
	filter,
	filterData,
	availableFilters,
	onUpdate,
	onRemove,
	onEditRules,
}: FilterInspectorProps) {
	// Get filter-type specific display_as options
	const displayAsOptions = getDisplayAsOptions(filterData?.type);
	// Popup support is independent of display_as - any filter that uses FieldPopup supports styling
	const supportsPopup = filterUsesPopup(filterData?.type);

	// Determine if filter is in buttons display mode (for showing column settings)
	const isButtonsMode = filter.displayAs === 'buttons';

	return (
		<div className="voxel-fse-filter-inspector">
			{/* Choose Filter */}
			<SelectControl
				label={__('Choose filter', 'voxel-fse')}
				value={filter.filterKey}
				options={[
					{ label: __('Select a filter...', 'voxel-fse'), value: '' },
					...availableFilters.map((f) => ({
						label: f.label,
						value: f.key,
					})),
				]}
				onChange={(value) => {
					const selectedFilter = availableFilters.find((f) => f.key === value);
					onUpdate({
						filterKey: value,
						type: selectedFilter?.type || 'keywords',
						label: selectedFilter?.label || '',
					});
				}}
			/>

			{/* Add default value toggle */}
			<ToggleControl
				label={__('Add default value', 'voxel-fse')}
				checked={filter.defaultValueEnabled ?? false}
				onChange={(value) => onUpdate({ defaultValueEnabled: value })}
			/>

			{/* Default value controls - filter-type-specific */}
			{/* Evidence: themes/voxel/app/post-types/filters/*.php - each filter's get_elementor_controls() */}
			{filter.defaultValueEnabled && (
				<>
					{/* ===== AVAILABILITY FILTER ===== */}
					{/* Evidence: availability-filter.php:313-355 */}
					{filterData?.type === 'availability' && (
						<>
							<SelectControl
								label={__('Default value', 'voxel-fse')}
								value={(filter.defaultValueType as string) || 'date'}
								options={[
									{ label: __('Custom date', 'voxel-fse'), value: 'date' },
									{ label: __('Preset', 'voxel-fse'), value: 'preset' },
								]}
								onChange={(value) => onUpdate({ defaultValueType: value })}
							/>

							{/* Custom date fields - show when defaultValueType is 'date' */}
							{(filter.defaultValueType || 'date') === 'date' && (
								<>
									<DynamicTagTextControl
										label={__('Default start date', 'voxel-fse')}
										value={(filter.defaultStartDate as string) || ''}
										onChange={(value) => onUpdate({ defaultStartDate: value })}
										placeholder="YYYY-MM-DD"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Default end date', 'voxel-fse')}
										value={(filter.defaultEndDate as string) || ''}
										onChange={(value) => onUpdate({ defaultEndDate: value })}
										placeholder="YYYY-MM-DD"
										context="post"
									/>
								</>
							)}

							{/* Preset selector - show when defaultValueType is 'preset' */}
							{filter.defaultValueType === 'preset' && (
								<SelectControl
									label={__('Default preset', 'voxel-fse')}
									value={(filter.defaultPreset as string) || ''}
									options={DATE_PRESETS}
									onChange={(value) => onUpdate({ defaultPreset: value })}
								/>
							)}
						</>
					)}

					{/* ===== DATE / RECURRING-DATE FILTER ===== */}
					{/* Evidence: date-filter-helpers.php:97-138 */}
					{(filterData?.type === 'date' || filterData?.type === 'recurring-date') && (
						<>
							<SelectControl
								label={__('Default value', 'voxel-fse')}
								value={(filter.defaultValueType as string) || 'date'}
								options={[
									{ label: __('Custom date', 'voxel-fse'), value: 'date' },
									{ label: __('Preset', 'voxel-fse'), value: 'preset' },
								]}
								onChange={(value) => onUpdate({ defaultValueType: value })}
							/>

							{/* Custom date fields */}
							{(filter.defaultValueType || 'date') === 'date' && (
								<>
									<DynamicTagTextControl
										label={__('Default start date', 'voxel-fse')}
										value={(filter.defaultStartDate as string) || ''}
										onChange={(value) => onUpdate({ defaultStartDate: value })}
										placeholder="YYYY-MM-DD"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Default end date', 'voxel-fse')}
										value={(filter.defaultEndDate as string) || ''}
										onChange={(value) => onUpdate({ defaultEndDate: value })}
										placeholder="YYYY-MM-DD"
										context="post"
									/>
								</>
							)}

							{/* Preset selector */}
							{filter.defaultValueType === 'preset' && (
								<SelectControl
									label={__('Default preset', 'voxel-fse')}
									value={(filter.defaultPreset as string) || ''}
									options={DATE_PRESETS}
									onChange={(value) => onUpdate({ defaultPreset: value })}
								/>
							)}
						</>
					)}

					{/* ===== LOCATION FILTER ===== */}
					{/* Evidence: location-filter.php:439-567 */}
					{filterData?.type === 'location' && (
						<>
							<DynamicTagTextControl
								label={__('Default address', 'voxel-fse')}
								value={(filter.defaultAddress as string) || ''}
								onChange={(value) => onUpdate({ defaultAddress: value })}
								context="post"
							/>

							<SelectControl
								label={__('Search method', 'voxel-fse')}
								value={(filter.defaultMethod as string) || 'area'}
								options={[
									{ label: __('Search by radius', 'voxel-fse'), value: 'radius' },
									{ label: __('Search by area', 'voxel-fse'), value: 'area' },
								]}
								onChange={(value) => onUpdate({ defaultMethod: value })}
							/>

							{/* Radius search fields */}
							{filter.defaultMethod === 'radius' && (
								<>
									<p style={{ fontSize: '12px', color: '#757575', margin: '8px 0' }}>
										<strong>{__('Default location', 'voxel-fse')}</strong><br />
										{__('Enter location coordinates and radius.', 'voxel-fse')}
									</p>
									<DynamicTagTextControl
										label={__('Latitude', 'voxel-fse')}
										value={(filter.defaultLat as string) || ''}
										onChange={(value) => onUpdate({ defaultLat: value })}
										placeholder="-90 to 90"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Longitude', 'voxel-fse')}
										value={(filter.defaultLng as string) || ''}
										onChange={(value) => onUpdate({ defaultLng: value })}
										placeholder="-180 to 180"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Radius', 'voxel-fse')}
										value={(filter.defaultRadius as string) || ''}
										onChange={(value) => onUpdate({ defaultRadius: value })}
										placeholder="0 to 8000"
										context="post"
									/>
								</>
							)}

							{/* Area search fields */}
							{(filter.defaultMethod || 'area') === 'area' && (
								<>
									<p style={{ fontSize: '12px', color: '#757575', margin: '8px 0' }}>
										<strong>{__('Default search area', 'voxel-fse')}</strong><br />
										{__('Enter coordinates for the southwest and northeast points of the default area to be searched.', 'voxel-fse')}
									</p>
									<p style={{ fontSize: '11px', fontWeight: 600, color: '#1e1e1e', margin: '12px 0 4px' }}>
										{__('Southwest', 'voxel-fse')}
									</p>
									<DynamicTagTextControl
										label={__('Latitude', 'voxel-fse')}
										value={(filter.defaultSwLat as string) || ''}
										onChange={(value) => onUpdate({ defaultSwLat: value })}
										placeholder="-90 to 90"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Longitude', 'voxel-fse')}
										value={(filter.defaultSwLng as string) || ''}
										onChange={(value) => onUpdate({ defaultSwLng: value })}
										placeholder="-180 to 180"
										context="post"
									/>
									<p style={{ fontSize: '11px', fontWeight: 600, color: '#1e1e1e', margin: '12px 0 4px' }}>
										{__('Northeast', 'voxel-fse')}
									</p>
									<DynamicTagTextControl
										label={__('Latitude', 'voxel-fse')}
										value={(filter.defaultNeLat as string) || ''}
										onChange={(value) => onUpdate({ defaultNeLat: value })}
										placeholder="-90 to 90"
										context="post"
									/>
									<DynamicTagTextControl
										label={__('Longitude', 'voxel-fse')}
										value={(filter.defaultNeLng as string) || ''}
										onChange={(value) => onUpdate({ defaultNeLng: value })}
										placeholder="-180 to 180"
										context="post"
									/>
								</>
							)}
						</>
					)}

					{/* ===== RANGE FILTER ===== */}
					{/* Evidence: range-filter.php:26-47 (Elementor controls: default_start, default_end) */}
					{filterData?.type === 'range' && (
						<>
							<DynamicTagTextControl
								label={__('Default start value', 'voxel-fse')}
								value={
									// Parse from defaultValue "min..max" if available, or fall back to individual prop
									filter.defaultValue && typeof filter.defaultValue === 'string' && filter.defaultValue.includes('..')
										? filter.defaultValue.split('..')[0]
										: (filter.defaultStart as string) || ''
								}
								onChange={(value) => {
									const start = value;
									const end = filter.defaultValue && typeof filter.defaultValue === 'string' && filter.defaultValue.includes('..')
										? filter.defaultValue.split('..')[1]
										: (filter.defaultEnd as string) || '';

									// Update individual prop AND composite defaultValue
									onUpdate({
										defaultStart: start,
										defaultValue: `${start}..${end}`
									});
								}}
								context="post"
							/>
							<DynamicTagTextControl
								label={__('Default end value', 'voxel-fse')}
								value={
									// Parse from defaultValue "min..max" if available
									filter.defaultValue && typeof filter.defaultValue === 'string' && filter.defaultValue.includes('..')
										? filter.defaultValue.split('..')[1]
										: (filter.defaultEnd as string) || ''
								}
								onChange={(value) => {
									const start = filter.defaultValue && typeof filter.defaultValue === 'string' && filter.defaultValue.includes('..')
										? filter.defaultValue.split('..')[0]
										: (filter.defaultStart as string) || '';
									const end = value;

									// Update individual prop AND composite defaultValue
									onUpdate({
										defaultEnd: end,
										defaultValue: `${start}..${end}`
									});
								}}
								context="post"
							/>
						</>
					)}

					{/* ===== GENERIC FILTERS (keywords, stepper, terms, etc.) ===== */}
					{/* Use simple text input with Dynamic Tag support */}
					{filterData?.type !== 'availability' &&
						filterData?.type !== 'date' &&
						filterData?.type !== 'recurring-date' &&
						filterData?.type !== 'location' &&
						filterData?.type !== 'range' && ( // Exclude range filter
							<DynamicTagTextControl
								label={__('Default value', 'voxel-fse')}
								value={(filter.defaultValue as string) || ''}
								onChange={(value) => onUpdate({ defaultValue: value })}
								context="post"
							/>
						)}

					{/* On search form reset */}
					<SelectControl
						className="voxel-fse-normal-case-label"
						label={__('On search form reset, set the value of this filter to:', 'voxel-fse')}
						value={filter.resetValue || 'empty'}
						options={[
							{ label: __('Empty value', 'voxel-fse'), value: 'empty' },
							{ label: __('Default value', 'voxel-fse'), value: 'default_value' },
						]}
						onChange={(value) => onUpdate({ resetValue: value as 'empty' | 'default_value' })}
					/>
				</>
			)}

			{/* Display as - filter-type specific options */}
			{/* Evidence: themes/voxel/app/post-types/filters/*.php - each filter's get_elementor_controls() */}
			{supportsPopup && displayAsOptions && (
				<SelectControl
					label={__('Display as', 'voxel-fse')}
					value={filter.displayAs || getDefaultDisplayAs(filterData?.type)}
					options={displayAsOptions}
					onChange={(value) => onUpdate({ displayAs: value as FilterConfig['displayAs'] })}
				/>
			)}

			{/* Switcher/Open Now filter: open_in_popup toggle instead of display_as select */}
			{/* Evidence: switcher-filter.php:176, open-now-filter.php:111-116 */}
			{(filterData?.type === 'switcher' || filterData?.type === 'open-now') && (
				<ToggleControl
					label={__('Open in popup', 'voxel-fse')}
					checked={filter.openInPopup ?? false}
					onChange={(value) => onUpdate({ openInPopup: value })}
				/>
			)}

			{/* Terms filter specific controls */}
			{/* Evidence: terms-filter.php:33-52 */}
			{filterData?.type === 'terms' && (
				<>
					<ToggleControl
						label={__('Hide empty terms', 'voxel-fse')}
						checked={filter.hideEmptyTerms ?? false}
						onChange={(value) => onUpdate({ hideEmptyTerms: value })}
					/>

					{/* Show column settings when display_as is 'buttons' */}
					{isButtonsMode && (
						<ResponsiveRangeControl
							label={__('Columns', 'voxel-fse')}
							attributes={filter}
							setAttributes={(attrs) => onUpdate(attrs)}
							attributeBaseName="termsColumns"
							min={1}
							max={6}
						/>
					)}
				</>
			)}

			{/* Location filter specific controls */}
			{/* Evidence: location-filter.php:118-147 */}
			{filterData?.type === 'location' && (
				<>
					<SelectControl
						label={__('Display proximity as', 'voxel-fse')}
						value={filter.displayProximityAs || 'popup'}
						options={[
							{ label: __('Popup', 'voxel-fse'), value: 'popup' },
							{ label: __('Inline', 'voxel-fse'), value: 'inline' },
							{ label: __('Hide', 'voxel-fse'), value: 'none' },
						]}
						onChange={(value) => onUpdate({ displayProximityAs: value as 'popup' | 'inline' | 'none' })}
					/>

					<SelectControl
						label={__('Default search method', 'voxel-fse')}
						value={filter.defaultSearchMethod || 'area'}
						options={[
							{ label: __('Search by Area', 'voxel-fse'), value: 'area' },
							{ label: __('Search by Radius', 'voxel-fse'), value: 'radius' },
						]}
						onChange={(value) => onUpdate({ defaultSearchMethod: value as 'area' | 'radius' })}
					/>
				</>
			)}
			{/* ===== VISUAL SECTION ===== */}
			{/* Evidence: themes/voxel/app/widgets/search-form.php:254-331 */}
			<SectionHeading label={__('Visual', 'voxel-fse')} />

			{/* Width (%) - Evidence: search-form.php:263-275 */}
			<ResponsiveRangeControl
				label={__('Width (%)', 'voxel-fse')}
				help={__('Leave empty for auto width', 'voxel-fse')}
				attributes={filter}
				setAttributes={(attrs) => onUpdate(attrs)}
				attributeBaseName="width"
				min={0}
				max={100}
				step={5}
				units={['%']}
			/>

			{/* Hide filter - Evidence: search-form.php:281-292 */}
			<ToggleControl
				label={__('Hide filter', 'voxel-fse')}
				help={__('Visually hide this filter but keep it functional', 'voxel-fse')}
				checked={filter.hideFilter ?? false}
				onChange={(value) => onUpdate({ hideFilter: value })}
			/>

			{/* Align button content - Evidence: search-form.php:294-318 */}
			<ChooseControl
				label={__('Align button content', 'voxel-fse')}
				value={filter.alignContent}
				onChange={(value) => onUpdate({ alignContent: value as 'flex-start' | 'center' | 'flex-end' })}
				options={[
					{ value: 'flex-start', icon: 'eicon-text-align-left', title: __('Left', 'voxel-fse') },
					{ value: 'center', icon: 'eicon-text-align-center', title: __('Center', 'voxel-fse') },
					{ value: 'flex-end', icon: 'eicon-text-align-right', title: __('Right', 'voxel-fse') },
				]}
			/>

			{/* Hide label - Evidence: search-form.php:320-331 */}
			<ToggleControl
				label={__('Hide label', 'voxel-fse')}
				help={__('Hide label for this filter only', 'voxel-fse')}
				checked={filter.hideLabel ?? false}
				onChange={(value) => onUpdate({ hideLabel: value })}
			/>

			{/* ===== POPUP SECTION ===== */}
			{/* Evidence: themes/voxel/app/widgets/search-form.php:334-434 */}
			{supportsPopup && (
				<>
					<SectionHeading label={__('Popup', 'voxel-fse')} />

					<FilterPopupStyleControl
						attributes={filter}
						setAttributes={(attrs) => onUpdate(attrs)}
						attributeNames={{
							enable: 'customPopupEnabled',
							minWidth: 'popupMinWidth',
							maxWidth: 'popupMaxWidth',
							maxHeight: 'popupMaxHeight',
							centerPosition: 'popupCenterPosition',
						}}
					/>

					{/* Terms filter: Multi column popup menu */}
					{filterData?.type === 'terms' && filter.customPopupEnabled && (
						<>
							<ToggleControl
								label={__('Multi column popup menu?', 'voxel-fse')}
								checked={filter.popupMenuColumnsEnabled ?? false}
								onChange={(value) => onUpdate({ popupMenuColumnsEnabled: value })}
							/>

							{filter.popupMenuColumnsEnabled && (
								<>
									<ResponsiveRangeControl
										label={__('Menu columns', 'voxel-fse')}
										help={__('We recommend increasing popup min width before if you plan to display the menu in multiple columns', 'voxel-fse')}
										attributes={filter}
										setAttributes={(attrs) => onUpdate(attrs)}
										attributeBaseName="popupMenuColumns"
										min={1}
										max={6}
										step={1}
									/>
									<ResponsiveRangeControl
										label={__('Column gap', 'voxel-fse')}
										attributes={filter}
										setAttributes={(attrs) => onUpdate(attrs)}
										attributeBaseName="popupMenuColumnGap"
										min={0}
										max={100}
										step={1}
										units={['px']}
									/>
								</>
							)}
						</>
					)}
				</>
			)}

			{/* ===== ROW VISIBILITY SECTION ===== */}
			<LoopVisibilityControl
				rowVisibility={filter.rowVisibility || 'show'}
				visibilityRules={filter.visibilityRules || []}
				onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
				onEditVisibilityRules={onEditRules}
				onClearVisibilityRules={() => onUpdate({ visibilityRules: [], rowVisibility: 'show' })}
			/>
		</div>
	);
}
