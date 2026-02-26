/**
 * ElementVisibilityModal Component
 *
 * Modal for editing element visibility rules - matches Voxel's vx-dynamic-data structure.
 * Renders directly without WordPress Modal wrapper to use Voxel's backend.css styling.
 *
 * Based on: voxel/templates/backend/dynamic-data/mode-edit-visibility/edit-visibility.php
 * Pattern from: shared/dynamic-tags/DynamicTagBuilder/index.tsx
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef, useCallback } from 'react';

// Simple UUID generator
const generateRuleId = (): string => {
	return 'rule_' + Math.random().toString(36).substr(2, 9);
};

export interface VisibilityRule {
	id: string;
	filterKey: string;
	/** For dtag rules: the VoxelScript expression (e.g., "@post(:status.key)") */
	tag?: string;
	/** For dtag rules: the comparison modifier key (e.g., "is_equal_to") */
	compare?: string;
	/** For dtag rules: array of comparison arguments (e.g., ["publish"]) */
	arguments?: string[];
	/** Legacy operator field (kept for non-dtag rules) */
	operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
	/** For non-dtag rules: the comparison value */
	value?: string;
	/** Group index for OR logic between groups (rules within same group are AND'd) */
	groupIndex?: number;
}

interface ElementVisibilityModalProps {
	isOpen: boolean;
	onClose: () => void;
	rules: VisibilityRule[];
	onSave: (rules: VisibilityRule[]) => void;
}

// Voxel's condition options from vx-dynamic-data
export const CONDITION_OPTIONS = [
	{ value: '', label: __('Select condition', 'voxel-fse') },
	{ value: 'dtag', label: __('Dynamic tag', 'voxel-fse') },
	{ value: 'user:logged_in', label: __('User is logged in', 'voxel-fse') },
	{ value: 'user:logged_out', label: __('User is logged out', 'voxel-fse') },
	{ value: 'user:plan', label: __('User membership plan is', 'voxel-fse') },
	{ value: 'user:role', label: __('User role is', 'voxel-fse') },
	{ value: 'user:is_author', label: __('User is author of current post', 'voxel-fse') },
	{ value: 'user:can_create_post', label: __('User can create new post', 'voxel-fse') },
	{ value: 'user:can_edit_post', label: __('User can edit current post', 'voxel-fse') },
	{ value: 'user:is_verified', label: __('User is verified', 'voxel-fse') },
	{ value: 'user:is_vendor', label: __('User is a Stripe Connect vendor', 'voxel-fse') },
	{ value: 'user:has_bought_product', label: __('User has bought product', 'voxel-fse') },
	{ value: 'user:has_bought_product_type', label: __('User has bought product type', 'voxel-fse') },
	{ value: 'user:is_customer_of_author', label: __('User is customer of author', 'voxel-fse') },
	{ value: 'user:follows_post', label: __('User follows post', 'voxel-fse') },
	{ value: 'user:follows_author', label: __('User follows author', 'voxel-fse') },
	{ value: 'author:plan', label: __('Author membership plan is', 'voxel-fse') },
	{ value: 'author:role', label: __('Author role is', 'voxel-fse') },
	{ value: 'author:is_verified', label: __('Author is verified', 'voxel-fse') },
	{ value: 'author:is_vendor', label: __('Author is a Stripe Connect vendor', 'voxel-fse') },
	{ value: 'template:is_page', label: __('Is page', 'voxel-fse') },
	{ value: 'template:is_child_of_page', label: __('Is child of page', 'voxel-fse') },
	{ value: 'template:is_single_post', label: __('Is single post', 'voxel-fse') },
	{ value: 'template:is_post_type_archive', label: __('Is post type archive', 'voxel-fse') },
	{ value: 'template:is_author', label: __('Is author profile', 'voxel-fse') },
	{ value: 'template:is_single_term', label: __('Is single term', 'voxel-fse') },
	{ value: 'template:is_homepage', label: __('Is homepage', 'voxel-fse') },
	{ value: 'template:is_404', label: __('Is 404 page', 'voxel-fse') },
	{ value: 'post:is_verified', label: __('Post is verified', 'voxel-fse') },
	{ value: 'product:is_available', label: __('Product is available', 'voxel-fse') },
	{ value: 'product_type:is', label: __('Product type is', 'voxel-fse') },
	{ value: 'listing:plan', label: __('Listing plan is', 'voxel-fse') },
	{ value: 'user:has_listing_plan', label: __('User has bought listing plan', 'voxel-fse') },
	{ value: 'author:has_listing_plan', label: __('Author has bought listing plan', 'voxel-fse') },
];

/**
 * Compare operators for dtag rules.
 * Matches Voxel's control-structure modifiers from config.php lines 62-74.
 * Excludes 'then' and 'else' (internal control flow, not user-facing comparisons).
 */
const COMPARE_OPTIONS = [
	{ value: '', label: __('Select an option', 'voxel-fse') },
	{ value: 'is_empty', label: __('Is empty', 'voxel-fse') },
	{ value: 'is_not_empty', label: __('Is not empty', 'voxel-fse') },
	{ value: 'is_equal_to', label: __('Is equal to', 'voxel-fse') },
	{ value: 'is_not_equal_to', label: __('Is not equal to', 'voxel-fse') },
	{ value: 'is_greater_than', label: __('Is greater than', 'voxel-fse') },
	{ value: 'is_less_than', label: __('Is less than', 'voxel-fse') },
	{ value: 'is_between', label: __('Is between', 'voxel-fse') },
	{ value: 'is_checked', label: __('Is checked', 'voxel-fse') },
	{ value: 'is_unchecked', label: __('Is unchecked', 'voxel-fse') },
	{ value: 'contains', label: __('Contains', 'voxel-fse') },
	{ value: 'does_not_contain', label: __('Does not contain', 'voxel-fse') },
];

/**
 * Compare operators that require a value/arguments field.
 * is_empty, is_not_empty, is_checked, is_unchecked don't need a value.
 */
const COMPARE_NEEDS_VALUE = new Set([
	'is_equal_to',
	'is_not_equal_to',
	'is_greater_than',
	'is_less_than',
	'is_between',
	'contains',
	'does_not_contain',
]);

// Conditions that require a value field (non-dtag)
type ValueType = 'membership_plan' | 'role' | 'post_type' | 'page' | 'product_type' | 'listing_plan' | 'text';

const CONDITIONS_WITH_VALUES: Record<string, ValueType> = {
	'user:plan': 'membership_plan',
	'user:role': 'role',
	'user:can_create_post': 'post_type',
	'user:has_bought_product_type': 'product_type',
	'author:plan': 'membership_plan',
	'author:role': 'role',
	'template:is_page': 'page',
	'template:is_child_of_page': 'page',
	'template:is_single_post': 'post_type',
	'template:is_post_type_archive': 'post_type',
	'template:is_single_term': 'text',
	'product_type:is': 'product_type',
	'listing:plan': 'listing_plan',
	'user:has_listing_plan': 'listing_plan',
	'author:has_listing_plan': 'listing_plan',
};

// Helper to check if a condition requires a value
const conditionRequiresValue = (filterKey: string): boolean => {
	return filterKey in CONDITIONS_WITH_VALUES;
};

// Get value options based on value type
interface ValueOption {
	value: string;
	label: string;
}

const getValueOptions = (valueType: ValueType): ValueOption[] => {
	const Voxel = (window as any).Voxel;
	const voxelConfig = Voxel?.config || {};

	switch (valueType) {
		case 'membership_plan':
			if (voxelConfig.membership_plans) {
				return Object.entries(voxelConfig.membership_plans).map(([key, plan]: [string, any]) => ({
					value: key,
					label: plan.label || plan.title || key,
				}));
			}
			return [
				{ value: '', label: __('Select an option', 'voxel-fse') },
				{ value: 'default', label: __('Free plan', 'voxel-fse') },
			];

		case 'role':
			if (voxelConfig.roles) {
				return Object.entries(voxelConfig.roles).map(([key, role]: [string, any]) => ({
					value: key,
					label: role.label || role.name || key,
				}));
			}
			return [
				{ value: '', label: __('Select an option', 'voxel-fse') },
				{ value: 'administrator', label: __('Administrator', 'voxel-fse') },
				{ value: 'editor', label: __('Editor', 'voxel-fse') },
				{ value: 'author', label: __('Author', 'voxel-fse') },
				{ value: 'contributor', label: __('Contributor', 'voxel-fse') },
				{ value: 'subscriber', label: __('Subscriber', 'voxel-fse') },
			];

		case 'post_type':
			if (voxelConfig.post_types) {
				return [
					{ value: '', label: __('Select an option', 'voxel-fse') },
					...Object.entries(voxelConfig.post_types).map(([key, pt]: [string, any]) => ({
						value: key,
						label: pt.label || pt.singular_name || key,
					})),
				];
			}
			return [{ value: '', label: __('Select an option', 'voxel-fse') }];

		case 'product_type':
			return [
				{ value: '', label: __('Select an option', 'voxel-fse') },
				{ value: 'booking', label: __('Booking', 'voxel-fse') },
				{ value: 'claim', label: __('Claim', 'voxel-fse') },
				{ value: 'promotion', label: __('Promotion', 'voxel-fse') },
			];

		case 'listing_plan':
			if (voxelConfig.listing_plans) {
				return [
					{ value: '', label: __('Select an option', 'voxel-fse') },
					...Object.entries(voxelConfig.listing_plans).map(([key, plan]: [string, any]) => ({
						value: key,
						label: plan.label || plan.title || key,
					})),
				];
			}
			return [{ value: '', label: __('Select an option', 'voxel-fse') }];

		case 'page':
		case 'text':
		default:
			return [];
	}
};

/**
 * VoxelScript Syntax Highlighter
 *
 * Matches Voxel's code-editor Vue component highlighting (dynamic-data.js).
 * Uses the same span nesting pattern as Voxel's Token.highlighted() method:
 *   <span class="hl-group">@group(<span class="hl-group-props">:prop.path</span>)<span class="hl-group-mods">.mod(<span class="hl-group-arg">args</span>)</span></span>
 *
 * Color scheme from Voxel's backend.css:
 * - hl-group (#ff459a pink): @group() wrappers — includes @name( and )
 * - hl-group-props (#67feb5 green): property paths (e.g., :status.key)
 * - hl-group-mods (#6e88a6 blue-gray): modifier calls (.date_format)
 * - hl-group-arg (#e3b45a gold): modifier arguments
 */
function highlightVoxelScript(text: string): string {
	if (!text) return '';

	// Escape HTML entities first
	let escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Match @group(:property.path).modifier(args) patterns and colorize
	// First pass: match full tag expressions with optional modifiers
	escaped = escaped.replace(
		/@(\w+)\(([^)]*)\)((?:\.\w+\([^)]*\))*)/g,
		(_match, group, inner, mods) => {
			// Properties inside parens: hl-group-props (green #67feb5 from backend.css)
			const coloredInner = inner
				? `<span class="hl-group-props">${inner}</span>`
				: '';

			// Modifiers: hl-group-mods (blue-gray #6e88a6) with hl-group-arg (gold #e3b45a)
			let coloredMods = '';
			if (mods) {
				coloredMods = mods.replace(
					/\.(\w+)\(([^)]*)\)/g,
					(_m: string, mod: string, args: string) => {
						const coloredArgs = args
							? `<span class="hl-group-arg">${args}</span>`
							: '';
						return `.${mod}(${coloredArgs})`;
					}
				);
				coloredMods = `<span class="hl-group-mods">${coloredMods}</span>`;
			}

			// Wrap entire expression in hl-group (pink #ff459a from backend.css)
			return `<span class="hl-group">@${group}(${coloredInner})${coloredMods}</span>`;
		}
	);

	return escaped;
}

/**
 * VoxelScript Input with Syntax Highlighting
 *
 * Mirrors Voxel's <code-editor layout="input"> pattern:
 * - Transparent textarea for editing
 * - Overlaid <pre> with syntax-highlighted content
 * - Both scroll in sync
 */
function VoxelScriptInput({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const preRef = useRef<HTMLPreElement>(null);

	const handleScroll = useCallback(() => {
		if (textareaRef.current && preRef.current) {
			preRef.current.scrollLeft = textareaRef.current.scrollLeft;
			preRef.current.scrollTop = textareaRef.current.scrollTop;
		}
	}, []);

	const highlighted = highlightVoxelScript(value || '');

	return (
		<div className="dtags-mode-input">
			<div className="dtags-mode-input__content">
				<pre
					ref={preRef}
					className="ts-snippet nvx-scrollable"
					dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
				/>
				<textarea
					ref={textareaRef}
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					onScroll={handleScroll}
					placeholder={placeholder}
					rows={1}
					spellCheck={false}
					className="nvx-scrollable"
				/>
			</div>
		</div>
	);
}

/**
 * Migrate legacy dtag rules that stored everything in `value` field.
 * Old format: { filterKey: 'dtag', value: '@post(:status.key)' }
 * New format: { filterKey: 'dtag', tag: '@post(:status.key)', compare: 'is_equal_to', arguments: ['publish'] }
 */
function migrateRule(r: any, defaultGroupIndex = 0): VisibilityRule {
	const base = {
		id: r.id || generateRuleId(),
		filterKey: r.filterKey || '',
		operator: r.operator || 'equals',
		value: r.value || '',
		groupIndex: r.groupIndex ?? defaultGroupIndex,
	};

	if (r.filterKey === 'dtag') {
		// Already new format
		if (r.tag !== undefined) {
			return {
				...base,
				tag: r.tag || '',
				compare: r.compare || '',
				arguments: Array.isArray(r.arguments) ? r.arguments : [],
			};
		}
		// Legacy format: value contains the full expression
		return {
			...base,
			tag: r.value || '',
			compare: '',
			arguments: [],
			value: '',
		};
	}

	return base;
}

/**
 * Group flat rules array into groups by groupIndex.
 * Returns array of arrays (groups of rules).
 */
function groupRules(rules: VisibilityRule[]): VisibilityRule[][] {
	const groups: Map<number, VisibilityRule[]> = new Map();
	for (const rule of rules) {
		const gi = rule.groupIndex ?? 0;
		if (!groups.has(gi)) groups.set(gi, []);
		groups.get(gi)!.push(rule);
	}
	// Sort by group index and return as ordered array
	const sorted = [...groups.entries()].sort((a, b) => a[0] - b[0]);
	return sorted.map(([, g]) => g);
}

/**
 * Flatten grouped rules back to flat array with correct groupIndex.
 */
function flattenGroups(groups: VisibilityRule[][]): VisibilityRule[] {
	return groups.flatMap((group, gi) =>
		group.map((rule) => ({ ...rule, groupIndex: gi }))
	);
}

export default function ElementVisibilityModal({
	isOpen,
	onClose,
	rules,
	onSave,
}: ElementVisibilityModalProps) {
	const [ruleGroups, setRuleGroups] = useState<VisibilityRule[][]>([]);

	// Initialize local rules when modal opens
	useEffect(() => {
		if (isOpen) {
			const normalizedRules = Array.isArray(rules)
				? rules
					.filter((r): r is VisibilityRule => r != null && typeof r === 'object')
					.map((r) => migrateRule(r))
				: [];

			if (normalizedRules.length === 0) {
				// Start with one empty group containing one empty rule
				setRuleGroups([
					[
						{
							id: generateRuleId(),
							filterKey: '',
							operator: 'equals',
							value: '',
							groupIndex: 0,
						},
					],
				]);
			} else {
				setRuleGroups(groupRules(normalizedRules));
			}
		}
	}, [isOpen, rules]);

	// Dynamically load Voxel's backend.css when modal opens
	useEffect(() => {
		if (!isOpen) return;

		const styleId = 'voxel-backend-css-dynamic';
		if (document.getElementById(styleId)) return;

		const link = document.createElement('link');
		link.id = styleId;
		link.rel = 'stylesheet';
		link.href = '/wp-content/themes/voxel/assets/dist/backend.css';
		document.head.appendChild(link);
	}, [isOpen]);

	const addCondition = (groupIdx: number) => {
		setRuleGroups(
			ruleGroups.map((group, gi) =>
				gi === groupIdx
					? [
						...group,
						{
							id: generateRuleId(),
							filterKey: '',
							operator: 'equals',
							value: '',
							groupIndex: groupIdx,
						},
					]
					: group
			)
		);
	};

	const addRuleGroup = () => {
		setRuleGroups([
			...ruleGroups,
			[
				{
					id: generateRuleId(),
					filterKey: '',
					operator: 'equals',
					value: '',
					groupIndex: ruleGroups.length,
				},
			],
		]);
	};

	const removeCondition = (groupIdx: number, ruleId: string) => {
		const updated = ruleGroups.map((group, gi) => {
			if (gi !== groupIdx) return group;
			return group.filter((r) => r.id !== ruleId);
		});
		// Remove empty groups
		const filtered = updated.filter((g) => g.length > 0);
		if (filtered.length === 0) {
			// Keep at least one group with one empty rule
			setRuleGroups([
				[
					{
						id: generateRuleId(),
						filterKey: '',
						operator: 'equals',
						value: '',
						groupIndex: 0,
					},
				],
			]);
		} else {
			setRuleGroups(filtered);
		}
	};

	const updateRule = (groupIdx: number, ruleId: string, updater: (r: VisibilityRule) => VisibilityRule) => {
		setRuleGroups(
			ruleGroups.map((group, gi) => {
				if (gi !== groupIdx) return group;
				return group.map((r) => (r.id === ruleId ? updater(r) : r));
			})
		);
	};

	const updateCondition = (groupIdx: number, ruleId: string, condition: string) => {
		updateRule(groupIdx, ruleId, (r) => {
			if (condition === 'dtag') {
				return { ...r, filterKey: condition, tag: '', compare: '', arguments: [], value: '' };
			}
			return { ...r, filterKey: condition, operator: 'equals', value: '' };
		});
	};

	const updateDtagField = (groupIdx: number, ruleId: string, field: 'tag' | 'compare', val: string) => {
		updateRule(groupIdx, ruleId, (r) => {
			if (field === 'compare') {
				return { ...r, compare: val, arguments: [] };
			}
			return { ...r, [field]: val };
		});
	};

	const updateDtagArgument = (groupIdx: number, ruleId: string, argIndex: number, val: string) => {
		updateRule(groupIdx, ruleId, (r) => {
			const args = [...(r.arguments || [])];
			args[argIndex] = val;
			return { ...r, arguments: args };
		});
	};

	const updateValue = (groupIdx: number, ruleId: string, value: string) => {
		updateRule(groupIdx, ruleId, (r) => ({ ...r, value }));
	};

	const handleSave = () => {
		const flat = flattenGroups(ruleGroups).filter((r) => r.filterKey);
		onSave(flat);
		onClose();
	};

	const handleDiscard = () => {
		onClose();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="nvx-editor nvx-editor-visibility">
			{/* Top bar */}
			<div className="nvx-topbar">
				<div className="nvx-topbar__title nvx-flex nvx-v-center">
					<h2>{__('Visibility rules', 'voxel-fse')}</h2>
				</div>
				<div className="nvx-topbar__buttons nvx-flex nvx-v-center">
					<button
						type="button"
						className="ts-button ts-outline"
						onClick={handleDiscard}
					>
						{__('Discard', 'voxel-fse')}
					</button>
					<button
						type="button"
						className="ts-button btn-shadow ts-save-settings"
						onClick={handleSave}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H15.3809C15.977 3.25 16.5488 3.48658 16.9707 3.90779L20.0897 7.02197C20.5124 7.44403 20.7499 8.01685 20.7499 8.61418L20.7499 18.5C20.7499 19.7426 19.7425 20.75 18.4999 20.75H16.75V16.25C16.75 15.0074 15.7426 14 14.5 14L9.5 14C8.25736 14 7.25 15.0074 7.25 16.25L7.25001 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H12C12.4142 7.75 12.75 7.41421 12.75 7C12.75 6.58579 12.4142 6.25 12 6.25H8Z" fill="currentColor" />
							<path d="M8.75001 20.75L15.25 20.75V16.25C15.25 15.8358 14.9142 15.5 14.5 15.5L9.5 15.5C9.08579 15.5 8.75 15.8358 8.75 16.25L8.75001 20.75Z" fill="currentColor" />
						</svg>
						{__('Save', 'voxel-fse')}
					</button>
				</div>
			</div>

			{/* Editor body */}
			<div className="nvx-editor-body">
				<div className="nvx-scrollable nvx-visibility-rules">
					<div className="nvx-rules-container">
						{ruleGroups.map((group, groupIdx) => (
							<div key={groupIdx} className="nvx-rule-group">
								<div className="x-row">
									<div className="nvx-rule-group-head x-col-12">
										<h2>{groupIdx === 0 ? __('Rule group', 'voxel-fse') : __('Or', 'voxel-fse')}</h2>
									</div>

									{group.map((rule, ruleIndex) => {
										if (!rule || typeof rule !== 'object') {
											return null;
										}
										const filterKey = rule.filterKey || '';
										const isDtag = filterKey === 'dtag';

										return (
											<div key={rule.id} className="nvx-rule x-col-12">
												<div className="x-row x-nowrap">
													{/* Condition dropdown */}
													<div className="ts-form-group x-col-2 x-grow">
														<label>
															{ruleIndex === 0
																? __('Condition', 'voxel-fse')
																: __('And', 'voxel-fse')}
														</label>
														<select
															value={filterKey}
															onChange={(e) =>
																updateCondition(groupIdx, rule.id, e.target.value)
															}
														>
															{CONDITION_OPTIONS.map((opt) => (
																<option key={opt.value} value={opt.value}>
																	{opt.label}
																</option>
															))}
														</select>
													</div>

													{/* DTag-specific fields: Dynamic Tag + Compare + Value */}
													{isDtag && (
														<>
															{/* Dynamic Tag input with syntax highlighting */}
															<div className="ts-form-group x-col-3 x-grow">
																<label>{__('Dynamic Tag', 'voxel-fse')}</label>
																<VoxelScriptInput
																	value={rule.tag || ''}
																	onChange={(val) => updateDtagField(groupIdx, rule.id, 'tag', val)}
																	placeholder={__('e.g. @post(:status.key)', 'voxel-fse')}
																/>
															</div>

															{/* Compare dropdown */}
															<div className="ts-form-group x-col-2 x-grow">
																<label>{__('Compare', 'voxel-fse')}</label>
																<select
																	value={rule.compare || ''}
																	onChange={(e) =>
																		updateDtagField(groupIdx, rule.id, 'compare', e.target.value)
																	}
																>
																	{COMPARE_OPTIONS.map((opt) => (
																		<option key={opt.value} value={opt.value}>
																			{opt.label}
																		</option>
																	))}
																</select>
															</div>

															{/* Value field — only for comparisons that need arguments */}
															{rule.compare && COMPARE_NEEDS_VALUE.has(rule.compare) && (
																<div className="ts-form-group x-col-3 x-grow">
																	<label>{__('Value', 'voxel-fse')}</label>
																	<VoxelScriptInput
																		value={(rule.arguments && rule.arguments[0]) || ''}
																		onChange={(val) => updateDtagArgument(groupIdx, rule.id, 0, val)}
																		placeholder={__('Enter value', 'voxel-fse')}
																	/>
																</div>
															)}

															{/* Second value for "is_between" */}
															{rule.compare === 'is_between' && (
																<div className="ts-form-group x-col-3 x-grow">
																	<label>{__('And', 'voxel-fse')}</label>
																	<VoxelScriptInput
																		value={(rule.arguments && rule.arguments[1]) || ''}
																		onChange={(val) => updateDtagArgument(groupIdx, rule.id, 1, val)}
																		placeholder={__('Enter value', 'voxel-fse')}
																	/>
																</div>
															)}
														</>
													)}

													{/* Non-dtag value field */}
													{!isDtag && filterKey && conditionRequiresValue(filterKey) && (() => {
														const valueType = CONDITIONS_WITH_VALUES[filterKey];
														const valueOptions = valueType ? getValueOptions(valueType) : [];
														const useTextInput = valueType === 'text' || valueType === 'page' || valueOptions.length === 0;

														return (
															<div className="ts-form-group x-col-2 x-grow">
																<label>{__('Value', 'voxel-fse')}</label>
																{useTextInput ? (
																	<input
																		type="text"
																		value={rule.value || ''}
																		onChange={(e) => updateValue(groupIdx, rule.id, e.target.value)}
																		placeholder={valueType === 'page' ? __('Enter page ID or slug', 'voxel-fse') : __('Enter value', 'voxel-fse')}
																	/>
																) : (
																	<select
																		value={rule.value || ''}
																		onChange={(e) => updateValue(groupIdx, rule.id, e.target.value)}
																	>
																		{valueOptions.map((opt) => (
																			<option key={opt.value} value={opt.value}>
																				{opt.label}
																			</option>
																		))}
																	</select>
																)}
															</div>
														);
													})()}

													{/* Delete button */}
													<div className="x-col-2 x-grow-0 ts-form-group">
														<label>&nbsp;</label>
														<a
															href="#"
															className="ts-button ts-outline icon-only"
															onClick={(e) => {
																e.preventDefault();
																removeCondition(groupIdx, rule.id);
															}}
														>
															<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
																<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="currentColor" />
																<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="currentColor" />
															</svg>
														</a>
													</div>
												</div>
											</div>
										);
									})}

									<div className="x-col-12 h-center">
										<a
											href="#"
											className="ts-button ts-transparent"
											onClick={(e) => {
												e.preventDefault();
												addCondition(groupIdx);
											}}
										>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor" />
											</svg>
											{__('Add condition', 'voxel-fse')}
										</a>
									</div>
								</div>
							</div>
						))}

						{/* Add another rule group button */}
						<div className="h-center">
							<a
								href="#"
								className="ts-button ts-transparent"
								onClick={(e) => {
									e.preventDefault();
									addRuleGroup();
								}}
							>
								<svg width="20" height="20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M10.9942 3.16428C11.6277 2.84758 12.3732 2.84758 13.0066 3.16429L19.9641 6.64292C20.1194 6.72054 20.263 6.8147 20.3933 6.92264L12.3358 10.9513C12.2309 11.0037 12.1168 11.0301 12.0026 11.0304C11.887 11.0308 11.7713 11.0044 11.665 10.9513L3.60758 6.92265C3.73788 6.81471 3.88151 6.72054 4.03676 6.64292L10.9942 3.16428Z" fill="currentColor" />
									<path d="M2.83659 8.2142C2.80788 8.35783 2.79297 8.50549 2.79297 8.65539V16.8443C2.79297 17.6966 3.27448 18.4757 4.03676 18.8568L10.9942 22.3355C11.0777 22.3772 11.1631 22.4134 11.25 22.4442L11.25 12.4016C11.1631 12.3709 11.0777 12.3346 10.9942 12.2929L3.44415 8.51797L2.83659 8.2142Z" fill="currentColor" />
									<path d="M12.75 22.4445C12.8372 22.4137 12.9229 22.3773 13.0066 22.3355L19.9641 18.8568C20.7264 18.4757 21.2079 17.6966 21.2079 16.8443V8.65539C21.2079 8.50549 21.193 8.35782 21.1643 8.21419L13.0066 12.2929C12.9229 12.3348 12.8372 12.3711 12.75 12.4019L12.75 22.4445Z" fill="currentColor" />
								</svg>
								{__('Add another rule group', 'voxel-fse')}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Get the display label for a visibility rule
 */
export function getVisibilityRuleLabel(rule: VisibilityRule): string {
	if (rule === undefined || rule === null) return '';
	if (typeof rule !== 'object') return '';

	const filterKey = rule.filterKey;
	if (!filterKey || typeof filterKey !== 'string') return '';

	const options = CONDITION_OPTIONS || [];
	if (!Array.isArray(options)) return filterKey;

	const option = options.find((opt) => opt && opt.value === filterKey);

	if (!option || !option.label) {
		return filterKey || '';
	}

	// DTag rules: show "Dynamic tag @post(:status.key)"
	if (filterKey === 'dtag' && rule.tag) {
		return `${option.label} ${rule.tag}`;
	}

	// Legacy or non-dtag: show "Condition value"
	if (rule.value) {
		return `${option.label} ${rule.value}`;
	}

	return option.label;
}
