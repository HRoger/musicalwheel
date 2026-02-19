/**
 * Taxonomy Field Component - Phase D Implementation
 * Handles: taxonomy field type (WordPress categories/tags/custom taxonomies)
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/taxonomy-field.php
 *
 * Value structure: { [term_slug]: boolean }
 * Example: { "genre": true, "rock": true, "alternative": true }
 *
 * Phase D Improvements:
 * ✅ Full-screen popup using FieldPopup component
 * ✅ Hierarchical term navigation with TermList component
 * ✅ Parent/child term relationships with slide navigation
 * ✅ "Go back" navigation between term levels
 * ✅ Pagination (10 terms per page with "Load more")
 * ✅ Search functionality when terms >= 15
 * ✅ Icon rendering for all terms (server-side processed)
 * ✅ Single or multiple selection based on field config
 *
 * Features:
 * - Two display modes: inline (checkboxes directly) and popup (FieldPopup modal)
 * - Hierarchical term tree with navigation
 * - Term icons from term meta (voxel_icon)
 * - Search filters all terms (flattens hierarchy)
 * - Selection state visualization (ts-selected class)
 *
 * Uses:
 * - FieldPopup for popup display mode (Phase D)
 * - FieldLabel for consistent label rendering
 * - TermList for hierarchical term display
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { FieldPopup } from '@shared';
import { FieldLabel } from './FieldLabel';
import { TermList } from '../TermList';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_MENU_ICON, VOXEL_SEARCH_ICON } from '../../utils/voxelDefaultIcons';

interface Term {
	id: number;
	slug: string;
	label: string;
	icon?: string;
	parent: number;
	children?: Term[];
}

interface TaxonomyFieldProps {
	field: VoxelField;
	value: { [key: string]: boolean };
	onChange: (value: { [key: string]: boolean }) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

// Helper to flatten term tree for search
const flattenTerms = (terms: Term[]): Term[] => {
	const flattened: Term[] = [];
	const flatten = (termList: Term[]) => {
		termList.forEach(term => {
			flattened.push(term);
			if (term.children && term.children.length > 0) {
				flatten(term.children);
			}
		});
	};
	flatten(terms);
	return flattened;
};

// Helper to count selected terms
const getSelectedCount = (value: { [key: string]: boolean }): number => {
	return Object.values(value || {}).filter(Boolean).length;
};

// Helper to get display value (comma-separated labels)
const getDisplayValue = (value: { [key: string]: boolean }, allTerms: Term[]): string => {
	if (!value || getSelectedCount(value) === 0) return '';

	const flatTerms = flattenTerms(allTerms);
	const selectedLabels = flatTerms
		.filter(term => value[term.slug])
		.map(term => term.label);

	return selectedLabels.join(', ');
};

export const TaxonomyField: React.FC<TaxonomyFieldProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons
}) => {
	const displayMode = field.props?.['display_as'] || 'popup';
	// Evidence: taxonomy-field.php:326 — (bool) $this->props['multiple'], defaults to false
	const multiple = field.props?.['multiple'] === true;
	const terms: Term[] = field.props?.['terms'] || [];
	// Evidence: taxonomy-field.php:329-330 — min/max selection counts from admin config
	const minSelections = field.props?.['min'] as number | null | undefined;
	const maxSelections = field.props?.['max'] as number | null | undefined;
	const inputRef = useRef<HTMLDivElement>(null);

	// Popup state (only used for popup display mode)
	const [isOpen, setIsOpen] = useState(false);

	// Navigation state for hierarchical term lists
	const [activeList, setActiveList] = useState('toplevel');

	// Search state
	const [search, setSearch] = useState('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Normalize value to object format
	const currentValue: { [key: string]: boolean } = value || {};

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Count total terms (flattened)
	const totalTermCount = useMemo(() => flattenTerms(terms).length, [terms]);

	// Open popup
	const openPopup = useCallback(() => {
		setSearch(''); // Reset search when opening
		setActiveList('toplevel'); // Reset navigation to top level
		setIsOpen(true);
	}, []);

	// Close popup
	const closePopup = useCallback(() => {
		setIsOpen(false);
		setSearch(''); // Reset search when closing
		setActiveList('toplevel'); // Reset navigation
	}, []);

	// EXACT Voxel: Toggle term selection with min/max enforcement
	// Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php
	const selectTerm = useCallback((term: Term) => {
		const newValue = { ...currentValue };

		if (multiple) {
			// Multiple selection: toggle term
			if (newValue[term.slug]) {
				delete newValue[term.slug];
			} else {
				// Enforce max selections — Evidence: taxonomy-field.php:330
				if (maxSelections && maxSelections > 0) {
					const currentCount = Object.values(newValue).filter(Boolean).length;
					if (currentCount >= maxSelections) {
						// At max — don't allow more selections
						if (field.validation) {
							field.validation.errors = [`You can select up to ${maxSelections} items`];
						}
						return;
					}
				}
				newValue[term.slug] = true;
			}

			// Clear max validation error when under limit
			if (field.validation?.errors?.length) {
				const count = Object.values(newValue).filter(Boolean).length;
				if (!maxSelections || count <= maxSelections) {
					field.validation.errors = [];
				}
			}
		} else {
			// Single selection: replace all with this term
			Object.keys(newValue).forEach(key => delete newValue[key]);
			newValue[term.slug] = true;
		}

		onChange(newValue);
	}, [currentValue, multiple, maxSelections, onChange, field.validation]);

	// Handle save (for popup mode) — validate min selections on save
	const handleSave = useCallback(() => {
		// Enforce min selections — Evidence: taxonomy-field.php:329
		if (minSelections && minSelections > 0) {
			const count = getSelectedCount(currentValue);
			if (count < minSelections) {
				if (field.validation) {
					field.validation.errors = [`Please select at least ${minSelections} items`];
				}
				return;
			}
		}
		onBlur?.();
		closePopup();
	}, [onBlur, closePopup, minSelections, currentValue, field.validation]);

	// Handle clear
	const handleClear = useCallback(() => {
		onChange({});
		setSearch('');
		setActiveList('toplevel');
	}, [onChange]);

	// Filter terms based on search
	// EXACT Voxel: Show search input when totalTermCount >= 15
	// Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php:82
	const showSearch = totalTermCount >= 15;

	const searchResults = useMemo(() => {
		if (!search.trim()) return null;

		const flatTerms = flattenTerms(terms);
		return flatTerms.filter(term =>
			term.label.toLowerCase().includes(search.toLowerCase())
		);
	}, [search, terms]);

	// Display value for the trigger (selected items as comma-separated string)
	const displayValue = useMemo(() => {
		return getDisplayValue(currentValue, terms);
	}, [currentValue, terms]);

	// EXACT Voxel: Use popup_icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php:71
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'menu.svg' )
	const triggerIconHtml = iconToHtml(icons?.popup_icon, VOXEL_MENU_ICON);

	// EXACT Voxel: Get search icon from widget settings OR use Voxel default
	// Pattern: Similar to other fields with search
	const searchIconHtml = iconToHtml(icons?.tsSearchIcon, VOXEL_SEARCH_ICON);

	// Render search results list (flat list of terms matching search)
	const renderSearchResults = () => {
		if (!searchResults || searchResults.length === 0) {
			return (
				<div className="ts-empty-user-tab">
					<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
					<p>No results found</p>
				</div>
			);
		}

		return (
			<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
				<ul className="simplify-ul ts-term-dropdown-list">
					{searchResults.map((term) => (
						<li
							key={term.slug}
							className={currentValue[term.slug] ? 'ts-selected' : ''}
						>
							<a
								href="#"
								className="flexify"
								onClick={(e) => {
									e.preventDefault();
									selectTerm(term);
								}}
							>
								<div className="ts-checkbox-container">
									<label className={multiple ? 'container-checkbox' : 'container-radio'}>
										<input
											type={multiple ? 'checkbox' : 'radio'}
											value={term.slug}
											checked={!!currentValue[term.slug]}
											disabled
											hidden
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{term.label}</span>
								<div className="ts-term-icon">
									<span dangerouslySetInnerHTML={{ __html: term.icon || '' }} />
								</div>
							</a>
						</li>
					))}
				</ul>
			</div>
		);
	};

	// ========================================
	// INLINE DISPLAY MODE
	// ========================================
	// Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php:2-55
	if (displayMode === 'inline') {
		return (
			<div className={`ts-form-group inline-terms-wrapper ts-inline-filter field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
				<FieldLabel
					field={field}
					value={null}
					className="ts-form-label"
				/>

				{/* Search results or hierarchical term list */}
				{searchResults ? (
					renderSearchResults()
				) : (
					<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown inline-multilevel min-scroll">
						<TermList
							terms={terms}
							value={currentValue}
							multiple={multiple}
							onSelectTerm={selectTerm}
							activeList={activeList}
							setActiveList={setActiveList}
							listKey="toplevel"
						/>
					</div>
				)}
			</div>
		);
	}

	// ========================================
	// POPUP DISPLAY MODE (default)
	// ========================================
	// Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php:57-125
	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Field label */}
			<FieldLabel
				field={field}
				value={getSelectedCount(currentValue) > 0 ? displayValue : null}
				className="ts-form-label"
			/>

			{/* Trigger button to open popup */}
			{/* EXACT Voxel: taxonomy-field.php:70-77 */}
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
				aria-label={`Select ${field.props?.['taxonomy']?.label || 'terms'}: ${displayValue || field.props?.['placeholder']}`}
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

			{/* Taxonomy popup */}
			{/* EXACT Voxel: No title shown in popup header for taxonomy */}
			{/* Evidence: themes/voxel/templates/widgets/create-post/taxonomy-field.php:57-125 */}
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
				{/* Search input (when >= 15 terms) */}
				{/* Evidence: taxonomy-field.php:82-90 */}
				{showSearch && (
					<div className="ts-sticky-top uib b-bottom">
						<div className="ts-input-icon flexify">
							<span dangerouslySetInnerHTML={{ __html: searchIconHtml }} />
							<input
								ref={searchInputRef}
								type="text"
								className="autofocus"
								placeholder={`Search ${field.props?.['taxonomy']?.label || ''}`}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>
				)}

				{/* Search results or hierarchical term list */}
				{/* Evidence: taxonomy-field.php:92-123 */}
				{searchResults ? (
					renderSearchResults()
				) : (
					<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
						<TermList
							terms={terms}
							value={currentValue}
							multiple={multiple}
							onSelectTerm={selectTerm}
							activeList={activeList}
							setActiveList={setActiveList}
							listKey="toplevel"
						/>
					</div>
				)}
			</FieldPopup>
		</div>
	);
};

export default TaxonomyField;
