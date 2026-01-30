/**
 * Filter Conditions System
 *
 * Evaluates filter-dependent visibility conditions.
 * Matches Voxel's window.Voxel.filterConditionHandlers system.
 *
 * Reference: voxel-search-form.beautified.js lines 1877-1908, 2960-3033
 *
 * Handler signature: (condition, filterValue) => boolean
 *
 * This system allows filters to show/hide based on other filter values.
 * For example:
 * - Show a "rooms" filter only when "property_type" equals "house"
 * - Show a "price" filter only when "category" contains "for-sale"
 *
 * @package VoxelFSE
 */

import type { FilterConfig, FilterData } from '../types';

/**
 * Condition configuration from filter settings
 */
export interface FilterCondition {
	/** Source filter key to evaluate against */
	source: string;
	/** Condition type (e.g., 'common:is_empty', 'text:equals') */
	type: string;
	/** Value to compare against (for equals, contains, gt, lt, etc.) */
	value?: string;
	/** Internal: whether this condition passes (set during evaluation) */
	_passes?: boolean;
}

/**
 * A group of conditions (AND logic within group)
 * Multiple groups are evaluated with OR logic
 */
export type ConditionGroup = FilterCondition[];

/**
 * Filter condition handlers registry
 * Matches Voxel's window.Voxel.filterConditionHandlers
 *
 * Reference: voxel-search-form.beautified.js lines 1887-1908
 */
export const filterConditionHandlers: Record<
	string,
	(condition: FilterCondition, value: unknown) => boolean
> = {
	// ============================================================================
	// Common conditions (work with any filter type)
	// ============================================================================
	'common:is_empty': (_condition, value) => value === null || value === undefined || value === '',
	'common:is_not_empty': (_condition, value) => value !== null && value !== undefined && value !== '',

	// ============================================================================
	// Text conditions
	// ============================================================================
	'text:equals': (condition, value) => value === condition.value,
	'text:not_equals': (condition, value) => value !== condition.value,
	'text:contains': (condition, value) => {
		if (typeof value !== 'string' || !condition.value) return false;
		return new RegExp(condition.value, 'i').test(value);
	},

	// ============================================================================
	// Taxonomy/terms conditions
	// ============================================================================
	'taxonomy:contains': (condition, value) => {
		if (typeof value !== 'string' || !condition.value) return false;
		return value.split(',').includes(condition.value);
	},
	'taxonomy:not_contains': (condition, value) => {
		if (typeof value !== 'string') return true;
		if (!condition.value) return true;
		return !value.split(',').includes(condition.value);
	},

	// ============================================================================
	// Number conditions
	// ============================================================================
	'number:equals': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue === compareValue;
	},
	'number:not_equals': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue !== compareValue;
	},
	'number:gt': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue > compareValue;
	},
	'number:gte': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue >= compareValue;
	},
	'number:lt': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue < compareValue;
	},
	'number:lte': (condition, value) => {
		const numValue = parseFloat(String(value));
		const compareValue = parseFloat(condition.value || '0');
		return numValue <= compareValue;
	},
};

/**
 * Evaluate a single condition
 *
 * Reference: voxel-search-form.beautified.js lines 2995-3009
 *
 * @param condition - The condition to evaluate
 * @param value - The source filter's current value
 * @param sourceFilterType - The type of the source filter (for special handling)
 * @returns Whether the condition passes
 */
export function evaluateCondition(
	condition: FilterCondition,
	value: unknown,
	sourceFilterType?: string
): boolean {
	const handler = filterConditionHandlers[condition.type];

	if (!handler) {
		console.warn(`[filterConditions] Unknown condition type: ${condition.type}`);
		return false;
	}

	// Special handling for order-by filters
	// Reference: voxel-search-form.beautified.js lines 3001-3004
	// Extract the key without coordinates: "nearby(40.7,-74.0)" => "nearby"
	let processedValue = value;
	if (sourceFilterType === 'order-by' && typeof value === 'string' && value.length > 0) {
		processedValue = value.split('(')[0];
	}

	return handler(condition, processedValue);
}

/**
 * Check if all conditions pass for a filter
 *
 * Logic matches Voxel's conditionsPass() method:
 * Reference: voxel-search-form.beautified.js lines 3011-3033
 *
 * - Groups are evaluated with OR logic (any group passing = conditions pass)
 * - Conditions within a group use AND logic (all must pass)
 * - The behavior setting determines final visibility:
 *   - 'show': filter visible when conditions pass
 *   - 'hide': filter hidden when conditions pass
 *
 * @param conditions - Array of condition groups
 * @param conditionsBehavior - 'show' or 'hide'
 * @param filterValues - Current values of all filters
 * @param filtersData - Filter data for type information
 * @returns Whether the filter should be visible
 */
export function conditionsPass(
	conditions: ConditionGroup[] | undefined,
	conditionsBehavior: 'show' | 'hide' = 'show',
	filterValues: Record<string, unknown>,
	filtersData: Record<string, FilterData>
): boolean {
	// No conditions = always visible
	if (!conditions || conditions.length === 0) {
		return true;
	}

	let anyGroupPasses = false;

	conditions.forEach((conditionGroup) => {
		if (!conditionGroup.length) return;

		let allInGroupPass = true;

		conditionGroup.forEach((condition) => {
			// Get the source filter's value
			const sourceValue = filterValues[condition.source];
			const sourceFilterData = filtersData[condition.source];
			const sourceFilterType = sourceFilterData?.type;

			// Evaluate the condition
			const passes = evaluateCondition(condition, sourceValue, sourceFilterType);
			if (!passes) {
				allInGroupPass = false;
			}
		});

		if (allInGroupPass) {
			anyGroupPasses = true;
		}
	});

	// Apply behavior:
	// - 'show': show when conditions pass, hide when conditions fail
	// - 'hide': hide when conditions pass, show when conditions fail
	return conditionsBehavior === 'hide' ? !anyGroupPasses : anyGroupPasses;
}

/**
 * Check if a filter should be visible based on its conditions
 *
 * This is the main entry point for checking filter visibility based on
 * filter-dependent conditions (not user role-based visibility).
 *
 * @param config - Filter configuration with conditions
 * @param filterValues - Current values of all filters
 * @param filtersData - Map of filter keys to filter data (for type info)
 * @returns Whether the filter should be visible
 */
export function shouldShowFilterByConditions(
	config: FilterConfig & {
		conditions?: ConditionGroup[];
		conditions_behavior?: 'show' | 'hide';
	},
	filterValues: Record<string, unknown>,
	filtersData: Record<string, FilterData>
): boolean {
	return conditionsPass(
		config.conditions,
		config.conditions_behavior || 'show',
		filterValues,
		filtersData
	);
}
