/**
 * useConditions Hook
 *
 * Implements conditional field visibility matching Voxel's ConditionMixin exactly.
 * Evidence: voxel-create-post.beautified.js lines 1564-1664
 *
 * @package VoxelFSE
 */

import { useMemo, useEffect, useRef } from 'react';
import type { CreatePostField } from '../types';

/**
 * Condition object structure
 */
interface Condition {
	source: string; // e.g., "field_key" or "field_key.property"
	type: string; // e.g., "text:equals", "number:greater_than"
	value: any; // Comparison value
	_passes?: boolean; // Evaluated result
}

/**
 * Condition handler function type
 */
type ConditionHandler = (
	condition: Condition,
	value: any,
	targetField?: CreatePostField,
	sourceField?: CreatePostField
) => boolean;

/**
 * Voxel's condition handlers
 * Evidence: voxel-create-post.beautified.js lines 1627-1664
 */
const conditionHandlers: Record<string, ConditionHandler> = {
	// Text conditions
	'text:equals': (c, v) => v === c.value,
	'text:not_equals': (c, v) => v !== c.value,
	'text:empty': (c, v) => !v?.trim()?.length,
	'text:not_empty': (c, v) => !!v?.trim()?.length,

	// Switcher conditions
	'switcher:checked': (c, v) => !!v,
	'switcher:unchecked': (c, v) => !v,

	// Number conditions
	'number:equals': (c, v) => v === parseFloat(c.value),
	'number:not_equals': (c, v) => v !== parseFloat(c.value),
	'number:greater_than': (c, v) => v > parseFloat(c.value),
	'number:less_than': (c, v) => v < parseFloat(c.value),
	'number:empty': (c, v) => v === null || v === undefined,
	'number:not_empty': (c, v) => v !== null && v !== undefined,

	// Select conditions
	'select:equals': (c, v) => v === c.value,
	'select:not_equals': (c, v) => v !== c.value,
	'select:any_of': (c, v) => c.value.includes(v),
	'select:none_of': (c, v) => !c.value.includes(v),
	'select:empty': (c, v) => !v,
	'select:not_empty': (c, v) => !!v,

	// Date conditions
	'date:equals': (c, v) => v === c.value,
	'date:not_equals': (c, v) => v !== c.value,
	'date:after': (c, v) => v > c.value,
	'date:before': (c, v) => v < c.value,
	'date:empty': (c, v) => !v,
	'date:not_empty': (c, v) => !!v,

	// File conditions
	'file:empty': (c, v) => !Array.isArray(v) || !v.length,
	'file:not_empty': (c, v) => Array.isArray(v) && v.length > 0,

	// Taxonomy conditions
	'taxonomy:any_of': (c, v) => {
		if (!Array.isArray(v) || !v.length) return false;
		return v.some((term: any) => c.value.includes(term));
	},
	'taxonomy:none_of': (c, v) => {
		if (!Array.isArray(v) || !v.length) return true;
		return !v.some((term: any) => c.value.includes(term));
	},
	'taxonomy:empty': (c, v) => !Array.isArray(v) || !v.length,
	'taxonomy:not_empty': (c, v) => Array.isArray(v) && v.length > 0,
};

/**
 * Evaluate a single condition
 * Evidence: lines 1597-1602
 */
function evaluateCondition(
	condition: Condition,
	value: any,
	targetField: CreatePostField,
	sourceField: CreatePostField,
	conditionsPassFn: (field: CreatePostField) => boolean
): boolean {
	const handler = conditionHandlers[condition.type];
	if (!handler) {
		console.warn(`Unknown condition type: ${condition.type}`);
		return false;
	}

	// Check if source field's own conditions pass first
	const sourceFieldPasses = conditionsPassFn(sourceField);

	return sourceFieldPasses && handler(condition, value, targetField, sourceField);
}

/**
 * Check if all conditions pass for a field
 * Evidence: lines 1603-1622
 *
 * Logic:
 * - No conditions → pass
 * - Conditions are OR groups (any group can pass)
 * - Within each group, all conditions must pass (AND)
 * - conditions_behavior: 'hide' inverts the result
 * - Must check parent step visibility first (for non-ui-step fields)
 */
function conditionsPass(
	field: CreatePostField,
	fields: Record<string, CreatePostField>,
	isCreatePost: boolean = true
): boolean {
	// Check parent step visibility first (for non-ui-step fields)
	// Evidence: lines 1604-1608
	if (isCreatePost && field.type !== 'ui-step' && field.step) {
		const step = fields[field.step];
		if (step && !conditionsPass(step, fields, isCreatePost)) {
			return false;
		}
	}

	// No conditions → always visible
	if (!field.conditions || !field.conditions.length) {
		return true;
	}

	// OR groups: at least one group must pass
	let pass = false;
	field.conditions.forEach((group: Condition[]) => {
		if (group.length) {
			// AND within group: all conditions must pass
			let groupPass = true;
			group.forEach((c: Condition) => {
				if (!c._passes) groupPass = false;
			});
			if (groupPass) pass = true;
		}
	});

	// conditions_behavior: 'hide' inverts the result
	// Evidence: line 1621
	return field.conditions_behavior === 'hide' ? !pass : pass;
}

/**
 * Get field value, supporting dot notation for nested properties
 * Evidence: lines 1575-1579
 */
function getFieldValue(field: CreatePostField, sourceProp?: string): any {
	const val = field.value;
	if (sourceProp !== undefined) {
		return val ? (val as any)[sourceProp] : null;
	}
	return val;
}

/**
 * useConditions Hook
 *
 * Sets up conditional field visibility and returns visibility map
 *
 * Evidence: voxel-create-post.beautified.js lines 1566-1596
 */
export function useConditions(
	fields: Record<string, CreatePostField>,
	isCreatePost: boolean = true
): Record<string, boolean> {
	// Store condition evaluation results
	const conditionResultsRef = useRef<Map<Condition, boolean>>(new Map());

	// Setup conditions on mount and when fields change
	// Evidence: lines 1566-1596 (setupConditions method)
	useEffect(() => {
		Object.values(fields).forEach((field) => {
			if (field.conditions) {
				field.conditions.forEach((group: Condition[]) => {
					group.forEach((condition: Condition) => {
						// Parse source: "field_key" or "field_key.property"
						const [sourceKey, sourceProp] = condition.source.split('.');
						const sourceField = fields[sourceKey];

						if (sourceField) {
							// Get current value
							const value = getFieldValue(sourceField, sourceProp);

							// Evaluate condition
							const passes = evaluateCondition(
								condition,
								value,
								field,
								sourceField,
								(f) => conditionsPass(f, fields, isCreatePost)
							);

							// Store result
							condition._passes = passes;
							conditionResultsRef.current.set(condition, passes);
						} else {
							// Source field not found
							condition._passes = false;
							conditionResultsRef.current.set(condition, false);
						}
					});
				});
			}
		});
	}, [fields, isCreatePost]);

	// Compute visibility map for all fields
	// useMemo ensures this only recomputes when fields change
	const visibilityMap = useMemo(() => {
		const map: Record<string, boolean> = {};

		Object.entries(fields).forEach(([key, field]) => {
			map[key] = conditionsPass(field, fields, isCreatePost);
		});

		return map;
	}, [fields, isCreatePost]);

	return visibilityMap;
}

export default useConditions;
