/**
 * FeedFilters Component
 *
 * Filtering controls for the timeline feed.
 * Matches Voxel's timeline filters HTML structure EXACTLY for CSS compatibility.
 *
 * Evidence:
 * - themes/voxel/templates/widgets/timeline/status-feed/status-feed.php:19-54
 *
 * Voxel HTML Structure:
 * <div class="vxf-filters">
 *   <div class="ts-form">
 *     <div class="ts-input-icon flexify">
 *       <icon-search/>
 *       <input type="text" placeholder="Search" class="autofocus" maxlength="128">
 *     </div>
 *   </div>
 *   <a href="#" @mousedown="filterBy.showList = true">
 *     {{ filterLabel }}
 *     <div class="ts-down-icon"></div>
 *   </a>
 *   <dropdown-list v-if="filterBy.showList">...</dropdown-list>
 *   <a href="#" @mousedown="orderBy.showList = true">
 *     {{ orderBy.active.label }}
 *     <div class="ts-down-icon"></div>
 *   </a>
 *   <dropdown-list v-if="orderBy.showList">...</dropdown-list>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect, type ChangeEvent, type MouseEvent } from 'react';
import type { FeedFilters as FeedFiltersType } from '../hooks';
import { useFilteringOptions } from '../hooks';
import type { OrderingOption } from '../types';
import { DropdownList } from './DropdownList';

/**
 * Props
 */
interface FeedFiltersProps {
	filters: FeedFiltersType;
	onFiltersChange: (filters: Partial<FeedFiltersType>) => void;
	orderingOptions?: OrderingOption[];
	showSearch?: boolean;
	showFilterTabs?: boolean;
	className?: string;
}

/**
 * Search icon SVG (matches Voxel's exactly)
 */
const SearchIcon = () => (
	<svg
		width="80"
		height="80"
		viewBox="0 0 24 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		transform="rotate(0 0 0)"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z"
			fill="#343C54"
		/>
	</svg>
);

/**
 * FeedFilters Component
 * Matches Voxel's vxf-filters structure exactly
 */
export function FeedFilters({
	filters,
	onFiltersChange,
	orderingOptions: rawOrderingOptions = [],
	showSearch = true,
	showFilterTabs = true,
	className = '',
}: FeedFiltersProps): JSX.Element {
	// Ensure orderingOptions is always an array
	const orderingOptions = Array.isArray(rawOrderingOptions) ? rawOrderingOptions : [];

	// Search input state (debounced)
	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	const searchTimeoutRef = useRef<number | null>(null);

	// Dropdown visibility states (matches Voxel's Vue data)
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [showOrderDropdown, setShowOrderDropdown] = useState(false);

	// Refs for dropdown targets
	const filterBtnRef = useRef<HTMLAnchorElement>(null);
	const orderBtnRef = useRef<HTMLAnchorElement>(null);

	// Get current ordering option
	const currentOrdering = orderingOptions.find(
		(opt) => opt.order === filters.order && opt.time === filters.time
	) ?? orderingOptions[0];

	// Current filter tab
	const currentFilter = filters.filter ?? 'all';

	// Filter options from post-context endpoint (1:1 Voxel parity)
	// Returns dynamic options based on user permissions (e.g., "pending" only for moderators)
	// See: timeline.php:529-535
	const filteringOptions = useFilteringOptions();

	// Handle search input change (debounced)
	const handleSearchChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchInput(value);

			// Clear previous timeout
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			// Debounce search
			searchTimeoutRef.current = window.setTimeout(() => {
				onFiltersChange({ search: value || undefined });
			}, 300);
		},
		[onFiltersChange]
	);

	// Handle filter selection (matches Voxel's setActiveFilter)
	const handleFilterSelect = useCallback(
		(e: MouseEvent<HTMLAnchorElement>, filterKey: string) => {
			e.preventDefault();
			onFiltersChange({
				filter: filterKey === 'all' ? undefined : filterKey,
			});
			setShowFilterDropdown(false);
		},
		[onFiltersChange]
	);

	// Handle ordering selection (matches Voxel's setActiveOrder)
	const handleOrderSelect = useCallback(
		(e: MouseEvent<HTMLAnchorElement>, option: OrderingOption) => {
			e.preventDefault();
			onFiltersChange({
				order: option.order,
				time: option.time,
				timeCustom: option.time === 'custom' ? option.timeCustom : undefined,
			});
			setShowOrderDropdown(false);
		},
		[onFiltersChange]
	);

	// Handle filter button mousedown - TOGGLE behavior (open/close)
	const handleFilterBtnMouseDown = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setShowFilterDropdown((prev) => !prev);
		// Close other dropdown
		setShowOrderDropdown(false);
	}, []);

	// Handle order button mousedown - TOGGLE behavior (open/close)
	const handleOrderBtnMouseDown = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setShowOrderDropdown((prev) => !prev);
		// Close other dropdown
		setShowFilterDropdown(false);
	}, []);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className={`vxf-filters ${className}`}>
			{/* Search - matches Voxel's ts-form structure exactly */}
			{showSearch && (
				<div className="ts-form">
					<div className="ts-input-icon flexify">
						<SearchIcon />
						<input
							type="text"
							value={searchInput}
							onChange={handleSearchChange}
							placeholder="Search"
							className="autofocus"
							maxLength={128}
						/>
					</div>
				</div>
			)}

			{/* Filter dropdown - matches Voxel's filtering_options structure */}
			{showFilterTabs && Object.keys(filteringOptions).length >= 2 && (
				<>
					<a
						href="#"
						ref={filterBtnRef}
						onClick={(e) => e.preventDefault()}
						onMouseDown={handleFilterBtnMouseDown}
					>
						{filteringOptions[currentFilter] || 'All'}
						<div className="ts-down-icon"></div>
					</a>
					{showFilterDropdown && (
						<DropdownList
							target={filterBtnRef.current}
							onBlur={() => setShowFilterDropdown(false)}
						>
							{Object.entries(filteringOptions).map(([filterKey, filterLabel]) => (
								<li key={filterKey}>
									<a
										href="#"
										className="flexify"
										onClick={(e) => handleFilterSelect(e, filterKey)}
									>
										<span>{filterLabel}</span>
									</a>
								</li>
							))}
						</DropdownList>
					)}
				</>
			)}

			{/* Ordering dropdown - matches Voxel's ordering_options structure exactly */}
			{orderingOptions.length > 0 && currentOrdering && (
				<>
					<a
						href="#"
						ref={orderBtnRef}
						onClick={(e) => e.preventDefault()}
						onMouseDown={handleOrderBtnMouseDown}
					>
						{currentOrdering.label}
						<div className="ts-down-icon"></div>
					</a>
					{showOrderDropdown && (
						<DropdownList
							target={orderBtnRef.current}
							onBlur={() => setShowOrderDropdown(false)}
						>
							{orderingOptions.map((order) => (
								<li key={order._id}>
									<a
										href="#"
										className="flexify"
										onClick={(e) => handleOrderSelect(e, order)}
									>
										<span>{order.label}</span>
									</a>
								</li>
							))}
						</DropdownList>
					)}
				</>
			)}
		</div>
	);
}

export default FeedFilters;
