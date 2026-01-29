/**
 * Filter Visibility Utility
 *
 * Evaluates visibility rules for search form filters.
 * Matches Voxel's PHP evaluate_visibility_rules() logic.
 *
 * @package VoxelFSE
 */

import type { FilterConfig, VisibilityRule } from '../types';

/**
 * Check if user is logged in
 * Uses WordPress body class 'logged-in' added by wp_body_class()
 */
function isUserLoggedIn(): boolean {
	if (typeof document === 'undefined') return false;
	return document.body.classList.contains('logged-in');
}

/**
 * Get current user roles from body classes
 * WordPress adds class like 'administrator' or 'role-subscriber'
 */
function getUserRoles(): string[] {
	if (typeof document === 'undefined') return [];

	// WordPress adds role as body class in some themes
	// Also check for Voxel-specific classes
	const bodyClasses = Array.from(document.body.classList);
	const roleClasses = bodyClasses.filter(c =>
		c.startsWith('role-') ||
		['administrator', 'editor', 'author', 'contributor', 'subscriber'].includes(c)
	);

	return roleClasses.map(c => c.replace('role-', ''));
}

/**
 * Evaluate a single visibility rule
 *
 * Supported rule types (matching Voxel's PHP implementation):
 * - user:logged_in - User is logged in
 * - user:logged_out - User is logged out
 * - user:role - User has specific role
 */
function evaluateRule(rule: VisibilityRule): boolean {
	const ruleType = rule.filterKey;

	switch (ruleType) {
		case 'user:logged_in':
			return isUserLoggedIn();

		case 'user:logged_out':
			return !isUserLoggedIn();

		case 'user:role': {
			if (!isUserLoggedIn()) return false;
			const userRoles = getUserRoles();
			const targetRole = rule.value || '';

			switch (rule.operator) {
				case 'equals':
					return userRoles.includes(targetRole);
				case 'not_equals':
					return !userRoles.includes(targetRole);
				default:
					return userRoles.includes(targetRole);
			}
		}

		default:
			// Unknown rule type - pass by default (matches Voxel behavior)
			console.warn(`Unknown visibility rule type: ${ruleType}`);
			return true;
	}
}

/**
 * Evaluate visibility rules for a filter
 *
 * Logic matches Voxel's PHP evaluate_visibility_rules():
 * - Rules are evaluated in groups (OR between groups, AND within groups)
 * - For simplicity, we treat the array as a single AND group
 * - All rules must pass for the condition to be true
 *
 * @param rules Array of visibility rules
 * @returns true if all rules pass
 */
function evaluateVisibilityRules(rules: VisibilityRule[]): boolean {
	if (!rules || rules.length === 0) {
		return true; // No rules = always visible
	}

	// All rules must pass (AND logic within the group)
	return rules.every(rule => evaluateRule(rule));
}

/**
 * Determine if a filter should be rendered based on visibility config
 *
 * @param config Filter configuration with rowVisibility and visibilityRules
 * @returns true if filter should be visible
 */
export function shouldRenderFilter(config: FilterConfig): boolean {
	const { rowVisibility = 'show', visibilityRules = [] } = config;

	// No rules = always visible
	if (!visibilityRules || visibilityRules.length === 0) {
		return true;
	}

	const rulesPass = evaluateVisibilityRules(visibilityRules);

	// Apply behavior:
	// - 'show': Render if rules pass, hide if rules fail
	// - 'hide': Hide if rules pass, render if rules fail
	if (rowVisibility === 'hide') {
		// Hide mode: show when rules FAIL, hide when rules PASS
		return !rulesPass;
	}

	// Show mode (default): show when rules PASS, hide when rules FAIL
	return rulesPass;
}
