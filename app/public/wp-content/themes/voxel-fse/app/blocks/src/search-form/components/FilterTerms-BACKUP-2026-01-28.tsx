/**
 * FilterTerms Component
 *
 * Taxonomy terms filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/terms-filter.php
 *
 * REUSES: FieldPopup from create-post block
 * - Portal-based popup positioning
 * - Click-outside-to-close (blurable mixin)
 *
 * ADAPTIVE FILTERING (Voxel Parity):
 * When narrowedValues is provided, terms display counts based on current
 * search results. Terms with 0 results can be hidden via hideEmptyTerms config.
 * Reference: voxel-search-form.beautified.js lines 600-650
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
// VoxelIcons.search is still used for search input UI icons (internal decoration)
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface TermOption {
	slug: string;
	label: string;
	count?: number;
	icon?: string;
	children?: TermOption[];
	// term_taxonomy_id is used for adaptive filtering lookups (not for selection value)
	term_taxonomy_id?: number;
}

/**
 * Parse Voxel terms value - comma-separated SLUGS
 * Evidence: themes/voxel/app/post-types/filters/terms-filter.php uses slugs
 */
function parseTermsValue(value: unknown): string[] {
	if (value === null || value === undefined || value === '') {
		return [];
	}

	// Handle string format (Voxel API format - comma-separated slugs)
	if (typeof value === 'string') {
		return value.split(',')
			.map(slug => slug.trim())
			.filter(slug => slug !== '');
	}

	// Handle array of strings (slugs)
	if (Array.isArray(value)) {
		if (value.length > 0 && typeof value[0] === 'string') {
			return value as string[];
		}
		// Try to convert numbers to strings if necessary, though slugs are preferred
		if (value.length > 0 && typeof value[0] === 'number') {
			return value.map(String);
		}
		return [];
	}

	return [];
}

/**
 * Serialize term slugs to Voxel API format
 */
function serializeTermsValue(slugs: string[]): string | null {
	if (slugs.length === 0) return null;
	return slugs.join(',');
}

export default function FilterTerms({
	config,
	filterData,
	value,
	onChange,
	blockId,
	narrowedValues,
	isNarrowing,
}: FilterComponentProps) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${blockId}` : '';

	const triggerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const props = (filterData.props || {}) as Record<string, any>;
	const multiple = props['multiple'] ?? true; // Voxel default is true
	const placeholder = props['placeholder'] || filterData.label || 'Select';
	const displayAs = config.displayAs || props['display_as'] || 'popup';
	const hideEmptyTerms = config.hideEmptyTerms ?? props['hide_empty_terms'] ?? false;

	// Get filter icon - from API data (HTML markup)
	const filterIcon = filterData.icon || '';

	// Adaptive filtering: Get taxonomy key and narrowed term counts
	const taxonomyKey = (props['taxonomy'] as string) || config.filterKey;
	const narrowedTerms = narrowedValues?.terms?.[taxonomyKey];

	// Flatten nested terms structure from Voxel's frontend_props()
	const flattenTerms = useCallback((terms: TermOption[], depth = 0): TermOption[] => {
		const result: TermOption[] = [];
		for (const term of terms) {
			result.push({ ...term, depth } as TermOption & { depth: number });
			if (term.children && term.children.length > 0) {
				result.push(...flattenTerms(term.children, depth + 1));
			}
		}
		return result;
	}, []);

	// Get terms from props (provided by PHP's frontend_props())
	const options = useMemo(() => {
		const terms = (props['terms'] as TermOption[]) || [];
		let flattened = flattenTerms(terms);

		// Adaptive filtering: Filter out terms with 0 results if hideEmptyTerms is enabled
		// Uses term_taxonomy_id for lookup
		if (hideEmptyTerms && narrowedTerms) {
			flattened = flattened.filter((term) => {
				if (!term.term_taxonomy_id) return true; // Keep if no ID (can't check)
				const count = narrowedTerms[term.term_taxonomy_id];
				return count === undefined || count > 0; // undefined means not narrowed yet
			});
		}

		return flattened;
	}, [props, flattenTerms, hideEmptyTerms, narrowedTerms]);

	// Helper to get narrowed count for a term
	const getTermCount = useCallback((term: TermOption): number | null => {
		if (!narrowedTerms || !term.term_taxonomy_id) return null;
		return narrowedTerms[term.term_taxonomy_id] ?? null;
	}, [narrowedTerms]);

	// Parse current value into array of slugs
	const selectedSlugs = useMemo(() => {
		return parseTermsValue(value);
	}, [value]);

	// Helper to check if a term is selected by slug
	const isTermSelected = useCallback((term: TermOption): boolean => {
		if (!term.slug) return false;
		return selectedSlugs.includes(term.slug);
	}, [selectedSlugs]);

	// Get selected options for display
	const selectedOptions = useMemo(() => {
		return options.filter(opt => opt.slug && selectedSlugs.includes(opt.slug));
	}, [options, selectedSlugs]);

	// Filter options based on search query
	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options;
		const query = searchQuery.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(query));
	}, [options, searchQuery]);

	// Init search when popup opens
	useEffect(() => {
		if (isOpen) {
			setSearchQuery('');
			// Focus search input if many options
			if (options.length >= 15) {
				setTimeout(() => searchInputRef.current?.focus(), 50);
			}
		}
	}, [isOpen, options.length]);

	const openPopup = useCallback(() => {
		setIsOpen(true);
	}, []);

	// Handle term selection - UPDATE DIRECTLY using slugs
	const handleSelect = useCallback((term: TermOption) => {
		const termSlug = term.slug;
		if (!termSlug) return;

		if (multiple) {
			// Multiple selection: toggle term and update immediately
			const currentSlugs = [...selectedSlugs];
			if (currentSlugs.includes(termSlug)) {
				// Remove
				const newSlugs = currentSlugs.filter((slug) => slug !== termSlug);
				onChange(serializeTermsValue(newSlugs));
			} else {
				// Add
				const newSlugs = [...currentSlugs, termSlug];
				onChange(serializeTermsValue(newSlugs));
			}
		} else {
			// Single select - save and close
			onChange(serializeTermsValue([termSlug]));
			setIsOpen(false);
		}
	}, [multiple, selectedSlugs, onChange]);

	// Handle save - just close popup, value is already updated
	const handleSave = useCallback(() => {
		setIsOpen(false);
	}, []);

	const handleClear = useCallback(() => {
		onChange(null);
	}, [onChange]);

	const hasValue = selectedSlugs.length > 0;
	const displayValue = hasValue
		? selectedOptions[0]?.label || placeholder
		: placeholder;
	const additionalCount = selectedOptions.length > 1 ? selectedOptions.length - 1 : 0;

	// Inline mode - display terms directly without popup
	if (displayAs === 'inline') {
		const { style, className } = getFilterWrapperStyles(config, 'ts-form-group inline-terms-wrapper ts-inline-filter min-scroll');
		return (
			<div className={`${className}${isNarrowing ? ' ts-loading' : ''}`} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}
				<div className="ts-term-dropdown ts-multilevel-dropdown inline-multilevel">
					<ul className="simplify-ul ts-term-dropdown-list">
						{options.map((option) => {
							const isSelected = isTermSelected(option);
							const optionDepth = (option as TermOption & { depth?: number }).depth || 0;
							const termCount = getTermCount(option);
							const isDisabled = termCount === 0;
							return (
								<li
									key={option.slug}
									className={`${isSelected ? 'ts-selected' : ''}${isDisabled ? ' ts-disabled' : ''}`}
								>
									<a
										href="#"
										className="flexify"
										onClick={(e) => {
											e.preventDefault();
											if (!isDisabled) handleSelect(option);
										}}
									>
										<div className="ts-checkbox-container">
											<label className={`container-${multiple ? 'checkbox' : 'radio'}`}>
												<input
													type={multiple ? 'checkbox' : 'radio'}
													checked={isSelected}
													readOnly
													disabled
													hidden
												/>
												<span className="checkmark"></span>
											</label>
										</div>
										<span>{optionDepth > 0 ? '— '.repeat(optionDepth) : ''}{option.label}</span>
										{termCount !== null && (
											<span className="ts-term-count">({termCount})</span>
										)}
										{option.icon && (
											<div className="ts-term-icon" dangerouslySetInnerHTML={{ __html: option.icon }} />
										)}
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}

	// Buttons mode
	if (displayAs === 'buttons') {
		const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
		return (
			<div className={className} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}
				<ul className="simplify-ul addon-buttons flexify">
					{options.map((option) => {
						const isSelected = isTermSelected(option);
						return (
							<li
								key={option.slug}
								className={`flexify ${isSelected ? 'adb-selected' : ''}`}
								onClick={() => handleSelect(option)}
							>
								{option.label}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	// Popup mode - uses portal-based FieldPopup from create-post
	const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
	const popupStyles = getPopupStyles(config);

	return (
		<div className={className} style={style}>
			{!config.hideLabel && <label>{filterData.label}</label>}

			{ /* Trigger button */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target ${hasValue ? 'ts-filled' : ''}`}
				onClick={openPopup}
				onMouseDown={(e) => e.preventDefault()}
				role="button"
				tabIndex={0}
			>
				{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */}
				{filterIcon && (
					<span dangerouslySetInnerHTML={{ __html: filterIcon }} />
				)}
				<div className="ts-filter-text">
					{displayValue}
					{additionalCount > 0 && (
						<span className="term-count">+{additionalCount}</span>
					)}
				</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef as any}
				title=""
				icon={filterIcon}
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				showSave={multiple}
				onSave={handleSave}
				onClear={handleClear}
				onClose={() => setIsOpen(false)}
				className={`${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}`}
				popupStyle={popupStyles.style}
			>
				{ /* Search input - shown if many options (matching Voxel behavior) */}
				{options.length >= 15 && (
					<div className="ts-sticky-top uib b-bottom">
						<div className="ts-input-icon flexify">
							<span>{VoxelIcons.search}</span>
							<input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search"
								className="autofocus"
							/>
						</div>
					</div>
				)}

				{ /* Term list with adaptive filtering support */}
				{ /* Note: Multi-column grid styles are generated in styles.ts for responsive support */}
				<div className={`ts-term-dropdown ts-multilevel-dropdown ts-md-group${isNarrowing ? ' ts-loading' : ''}`}>
					<ul className="simplify-ul ts-term-dropdown-list">
						{filteredOptions.map((option) => {
							const isSelected = isTermSelected(option);
							const optionDepth = (option as TermOption & { depth?: number }).depth || 0;
							const termCount = getTermCount(option);
							const isDisabled = termCount === 0;
							return (
								<li
									key={option.slug}
									className={`${isSelected ? 'ts-selected' : ''}${isDisabled ? ' ts-disabled' : ''}`}
								>
									<a
										href="#"
										className="flexify"
										onClick={(e) => {
											e.preventDefault();
											if (!isDisabled) handleSelect(option);
										}}
									>
										<div className="ts-checkbox-container">
											<label className={`container-${multiple ? 'checkbox' : 'radio'}`}>
												<input
													type={multiple ? 'checkbox' : 'radio'}
													checked={isSelected}
													readOnly
													disabled
													hidden
												/>
												<span className="checkmark"></span>
											</label>
										</div>
										<span>{optionDepth > 0 ? '— '.repeat(optionDepth) : ''}{option.label}</span>
										{termCount !== null && (
											<span className="ts-term-count">({termCount})</span>
										)}
										{option.icon && (
											<div className="ts-term-icon" dangerouslySetInnerHTML={{ __html: option.icon }} />
										)}
									</a>
								</li>
							);
						})}
					</ul>
					{filteredOptions.length === 0 && (
						<div className="ts-empty-user-tab">
							{filterIcon && (
								<span dangerouslySetInnerHTML={{ __html: filterIcon }} />
							)}
							<p>No results found</p>
						</div>
					)}
				</div>
			</FieldPopup>
		</div>
	);
}
