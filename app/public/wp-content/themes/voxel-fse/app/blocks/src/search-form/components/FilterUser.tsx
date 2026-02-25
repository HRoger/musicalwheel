/**
 * FilterUser Component
 *
 * User/author filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/user-filter.php
 *
 * 1:1 VOXEL PARITY:
 * The PHP controller now calls $filter->set_value() before $filter->frontend_props(),
 * so filterData.value and filterData.props.user are properly populated.
 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
 *
 * This component now uses:
 * - filterData.value: The current filter value (set by PHP)
 * - filterData.props.user: User data (name) populated by frontend_props()
 * - value (state): User interactions that override the initial value
 *
 * ADAPTER PATTERN:
 * Uses useUserData hook for fallback API calls, keeping API logic
 * centralized for future Voxel API compatibility.
 *
 * Voxel HTML structure:
 * <div class="ts-form-group">
 *   <label>Author</label>
 *   <div class="ts-filter ts-popup-target ts-filled">
 *     <span></span>
 *     <div class="ts-filter-text">Roger</div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useRef } from 'react';
import type { FilterComponentProps } from '../types';
import { getFilterWrapperStyles } from '@shared';
import { useUserData } from '../hooks/useUserData';

export default function FilterUser({
	config,
	filterData,
	value,
}: FilterComponentProps) {
	// ALL HOOKS MUST BE AT THE TOP - before any conditional returns
	const triggerRef = useRef<HTMLDivElement>(null);

	const props = (filterData.props || {}) as Record<string, unknown>;
	const filterIcon = filterData.icon || '';
	// User data from PHP frontend_props() - populated when set_value() was called
	const propsUserData = props['user'] as { name?: string; avatar?: string } | undefined;

	// Determine effective value using 1:1 Voxel parity approach
	// Priority:
	// 1. State value (from user interaction or clearAll) - if explicitly set
	// 2. filterData.value from PHP (set via set_value() before frontend_props())
	//
	// The `value` prop comes from state.filterValues[filterKey]
	// - undefined = not initialized yet, use filterData.value
	// - null = explicitly cleared (e.g., clearAll with resetValue='empty')
	// - value = has a value from user interaction
	let effectiveValue: string | number | null | undefined;

	if (value !== undefined) {
		// State has been set - could be a value or null (from clearAll)
		effectiveValue = value as string | number | null;
	} else if (filterData.value !== null && filterData.value !== undefined) {
		// Use filterData.value from PHP (1:1 Voxel parity)
		effectiveValue = filterData.value as string | number;
	} else {
		// No value at all
		effectiveValue = null;
	}

	// Convert to number for user ID
	const userId = effectiveValue ? Number(effectiveValue) : null;
	const isValidUserId = userId !== null && !isNaN(userId) && userId > 0;

	// ADAPTER PATTERN: Use hook for fallback API calls
	// Skip fetching if we already have data from PHP props
	const hasPropsData = !!(propsUserData?.name);
	const { userData: fetchedUserData, isLoading } = useUserData({
		userId: isValidUserId ? userId : null,
		skip: hasPropsData,
	});

	// Determine final user data - prefer PHP props, fallback to fetched
	const userData = hasPropsData
		? { id: userId!, name: propsUserData!.name!, avatar: propsUserData!.avatar || '' }
		: fetchedUserData;

	// === CONDITIONAL RETURNS AFTER ALL HOOKS ===

	// CRITICAL: Filter only shows when there's a valid user ID
	// This matches Voxel's v-if="filter.value !== null" pattern
	if (!isValidUserId) {
		return null;
	}

	// Get display name
	const displayValue = userData?.name || (isLoading ? 'Loading...' : 'Unknown');

	// Voxel structure
	const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');

	return (
		<div className={className} style={style}>
			{!config.hideLabel && <label>{filterData.label}</label>}

			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target ts-filled${isLoading ? ' ts-loading' : ''}`}
			>
				<span dangerouslySetInnerHTML={{ __html: filterIcon }} />
				<div className="ts-filter-text">
					{displayValue}
				</div>
			</div>
		</div>
	);
}
