/**
 * FilterTerms Component - FIXED VERSION
 *
 * CRITICAL FIXES APPLIED (2026-01-28):
 * 1. ✅ Added parent reference building in term tree
 * 2. ✅ Added parent-child exclusion logic (matching Voxel beautified.js lines 1123-1145)
 * 3. ✅ Fixed auto-save logic for single-select popup mode
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
 * Enriched term option with parent references and depth
 * CRITICAL: parentRef is required for parent-child exclusion logic
 * Reference: voxel-search-form.beautified.js lines 1070-1079
 */
interface EnrichedTermOption extends TermOption {
	parentRef?: EnrichedTermOption;
	hasSelection?: boolean;
	depth: number;
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
	// Evidence: controller line 667 extracts taxonomy_label from frontend_props() taxonomy.label
	// Wired for 1:1 parity with Voxel's frontend_props() taxonomy object {key, label}
	const taxonomyLabel = (props['taxonomy_label'] as string) ?? '';
	const placeholder = props['placeholder'] || filterData.label || taxonomyLabel || 'Select';
	const displayAs = config.displayAs || props['display_as'] || 'popup';
	const hideEmptyTerms = config.hideEmptyTerms ?? props['hide_empty_terms'] ?? false;
	// Evidence: terms-filter.php:191 returns per_page (default 20 via filter)
	// Used by Voxel's TermList and inline mode for "Load more" pagination
	const perPage = props['per_page'] ?? 20;

	// Pagination state for "Load more" (matches Voxel's TermList page state)
	// Evidence: search-form.js TermList data() { perPage: this.main.filter.props.per_page, page: 1 }
	const [page, setPage] = useState(1);

	// Get filter icon - from API data (HTML markup)
	const filterIcon = filterData.icon || '';

	// Adaptive filtering: Get taxonomy key and narrowed term counts
	const taxonomyKey = (props['taxonomy'] as string) || config.filterKey;
	const narrowedTerms = narrowedValues?.terms?.[taxonomyKey];

	/**
	 * Build term tree with parent references (CRITICAL FIX)
	 * Reference: voxel-search-form.beautified.js lines 1070-1079
	 *
	 * This recursive function builds the parent-child relationships
	 * needed for the exclusion logic to work properly.
	 */
	const buildTermTree = useCallback((terms: TermOption[]): EnrichedTermOption[] => {
		const setupTerm = (
			term: TermOption,
			parent: EnrichedTermOption | null,
			depth: number
		): EnrichedTermOption => {
			const enrichedTerm: EnrichedTermOption = {
				...term,
				parentRef: parent || undefined,
				hasSelection: false,
				depth,
			};

			// Recursively setup children
			if (term.children && term.children.length > 0) {
				enrichedTerm.children = term.children.map(child =>
					setupTerm(child, enrichedTerm, depth + 1)
				);
			}

			return enrichedTerm;
		};

		return terms.map(term => setupTerm(term, null, 0));
	}, []);

	// Build enriched term tree with parent references
	const enrichedTerms = useMemo(() => {
		const terms = (props['terms'] as TermOption[]) || [];
		return buildTermTree(terms);
	}, [props, buildTermTree]);

	// Create a map for quick term lookup by slug
	const termMap = useMemo(() => {
		const map = new Map<string, EnrichedTermOption>();

		const addToMap = (term: EnrichedTermOption) => {
			map.set(term.slug, term);
			if (term.children) {
				term.children.forEach(child => addToMap(child as EnrichedTermOption));
			}
		};

		enrichedTerms.forEach(term => addToMap(term));
		return map;
	}, [enrichedTerms]);

	// Flatten enriched terms for display
	const flattenedTerms = useMemo(() => {
		const result: EnrichedTermOption[] = [];

		const flatten = (terms: EnrichedTermOption[]) => {
			terms.forEach(term => {
				// Adaptive filtering: Filter out terms with 0 results if hideEmptyTerms is enabled
				if (hideEmptyTerms && narrowedTerms && term.term_taxonomy_id) {
					const count = narrowedTerms[term.term_taxonomy_id];
					if (count === 0) {
						return; // Skip this term
					}
				}

				result.push(term);

				if (term.children && term.children.length > 0) {
					flatten(term.children as EnrichedTermOption[]);
				}
			});
		};

		flatten(enrichedTerms);
		return result;
	}, [enrichedTerms, hideEmptyTerms, narrowedTerms]);

	// Helper to get narrowed count for a term
	const getTermCount = useCallback((term: EnrichedTermOption): number | null => {
		if (!narrowedTerms || !term.term_taxonomy_id) return null;
		return narrowedTerms[term.term_taxonomy_id] ?? null;
	}, [narrowedTerms]);

	// Parse current value into array of slugs
	const selectedSlugs = useMemo(() => {
		return parseTermsValue(value);
	}, [value]);

	// Helper to check if a term is selected by slug
	const isTermSelected = useCallback((term: EnrichedTermOption): boolean => {
		if (!term.slug) return false;
		return selectedSlugs.includes(term.slug);
	}, [selectedSlugs]);

	// Get selected options for display
	const selectedOptions = useMemo(() => {
		return flattenedTerms.filter(opt => opt.slug && selectedSlugs.includes(opt.slug));
	}, [flattenedTerms, selectedSlugs]);

	// Visible terms for inline/popup modes — limited by per_page pagination
	// Evidence: Voxel search-form.js visibleFlatTerms computed paginates to perPage * page + 1
	const visibleFlatTerms = useMemo(() => {
		const limit = perPage * page;
		return flattenedTerms.slice(0, limit);
	}, [flattenedTerms, perPage, page]);

	const hasMoreTerms = flattenedTerms.length > perPage * page;

	// Filter options based on search query
	const filteredOptions = useMemo(() => {
		if (!searchQuery) return visibleFlatTerms;
		// When searching, search ALL terms (not just visible page), matching Voxel behavior
		const query = searchQuery.toLowerCase();
		return flattenedTerms.filter((opt) => opt.label.toLowerCase().includes(query));
	}, [flattenedTerms, visibleFlatTerms, searchQuery]);

	// Init search when popup opens
	useEffect(() => {
		if (isOpen) {
			setSearchQuery('');
			// Focus search input if many options
			if (flattenedTerms.length >= 15) {
				setTimeout(() => searchInputRef.current?.focus(), 50);
			}
		}
	}, [isOpen, flattenedTerms.length]);

	const openPopup = useCallback(() => {
		setIsOpen(true);
	}, []);

	/**
	 * Handle term selection with parent-child exclusion logic (CRITICAL FIX)
	 * Reference: voxel-search-form.beautified.js lines 1100-1156
	 */
	const handleSelect = useCallback((term: EnrichedTermOption) => {
		const termSlug = term.slug;
		if (!termSlug) return;

		if (multiple) {
			// Multiple selection: toggle term with parent-child exclusion
			let currentSlugs = [...selectedSlugs];

			if (currentSlugs.includes(termSlug)) {
				// DESELECT: Remove term
				currentSlugs = currentSlugs.filter((slug) => slug !== termSlug);

				// Update hasSelection flags for parents
				let parent = term.parentRef;
				while (parent) {
					// Check if parent still has selected children
					const hasSelectedChildren = parent.children?.some(
						child => currentSlugs.includes((child as EnrichedTermOption).slug) || (child as EnrichedTermOption).hasSelection
					);
					if (!hasSelectedChildren) {
						parent.hasSelection = false;
					}
					parent = parent.parentRef;
				}

				onChange(serializeTermsValue(currentSlugs));
			} else {
				// SELECT: Add term with exclusion logic
				currentSlugs.push(termSlug);

				// CRITICAL: Parent-child exclusion logic
				// Reference: voxel-search-form.beautified.js lines 1123-1145

				// Step 1: Deselect parent terms when selecting child
				let parent = term.parentRef;
				while (parent) {
					currentSlugs = currentSlugs.filter(slug => slug !== parent!.slug);
					parent.hasSelection = true;
					parent = parent.parentRef;
				}

				// Step 2: Deselect conflicting sibling terms
				// If we select a parent term, deselect any children that have this parent in their ancestry
				const toRemove = new Set<string>();

				currentSlugs.forEach(slug => {
					const selectedTerm = termMap.get(slug);
					if (!selectedTerm) return;

					// Traverse up to check if the newly selected term is an ancestor
					let ancestor = selectedTerm.parentRef;
					const ancestorChain: EnrichedTermOption[] = [];
					let foundConflict = false;

					while (ancestor) {
						if (ancestor.slug === termSlug) {
							foundConflict = true;
							break;
						}
						ancestorChain.push(ancestor);
						ancestor = ancestor.parentRef;
					}

					// If conflict found, mark for removal and clear hasSelection flags
					if (foundConflict) {
						toRemove.add(selectedTerm.slug);
						ancestorChain.forEach(anc => {
							anc.hasSelection = false;
						});
					}
				});

				// Remove conflicting terms
				currentSlugs = currentSlugs.filter(slug => !toRemove.has(slug));

				onChange(serializeTermsValue(currentSlugs));
			}
		} else {
			// Single select - save and close
			onChange(serializeTermsValue([termSlug]));

			// Auto-close for popup mode (Voxel pattern - beautified.js lines 1146-1155)
			// Popup mode closes automatically, inline mode stays open
			if (displayAs !== 'inline') {
				setIsOpen(false);
			}
		}
	}, [multiple, selectedSlugs, onChange, termMap, displayAs]);

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
	// Evidence: terms-filter.php template lines 2-42 (inline with Load more pagination)
	if (displayAs === 'inline') {
		const { style, className } = getFilterWrapperStyles(config, 'ts-form-group inline-terms-wrapper ts-inline-filter min-scroll');
		return (
			<div className={`${className}${isNarrowing ? ' ts-loading' : ''}`} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}
				<div className="ts-term-dropdown ts-multilevel-dropdown inline-multilevel">
					<ul className="simplify-ul ts-term-dropdown-list">
						{visibleFlatTerms.map((option) => {
							const isSelected = isTermSelected(option);
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
										<span>{option.depth > 0 ? '— '.repeat(option.depth) : ''}{option.label}</span>
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
						{/* Load more button - matches Voxel template line 31-38 */}
						{hasMoreTerms && (
							<li className="ts-term-centered">
								<a href="#" onClick={(e) => { e.preventDefault(); setPage(p => p + 1); }} className="flexify">
									<div className="ts-term-icon">
										{VoxelIcons.reload || <span>&#x21bb;</span>}
									</div>
									<span>Load more</span>
								</a>
							</li>
						)}
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
					{flattenedTerms.map((option) => {
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
				{flattenedTerms.length >= 15 && (
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
										<span>{option.depth > 0 ? '— '.repeat(option.depth) : ''}{option.label}</span>
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
						{/* Load more button for popup mode — matches Voxel TermList template line 165-172 */}
						{!searchQuery && hasMoreTerms && (
							<li className="ts-term-centered">
								<a href="#" onClick={(e) => { e.preventDefault(); setPage(p => p + 1); }} className="flexify">
									<div className="ts-term-icon">
										{VoxelIcons.reload || <span>&#x21bb;</span>}
									</div>
									<span>Load more</span>
								</a>
							</li>
						)}
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
