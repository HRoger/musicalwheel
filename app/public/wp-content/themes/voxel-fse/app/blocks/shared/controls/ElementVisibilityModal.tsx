/**
 * ElementVisibilityModal Component
 *
 * Modal for editing element visibility rules - matches Voxel's vx-dynamic-data structure.
 * Renders directly without WordPress Modal wrapper to use Voxel's backend.css styling.
 *
 * Based on: search-form/inspector/VisibilityRulesModal.tsx
 * Pattern from: shared/dynamic-tags/DynamicTagBuilder/index.tsx
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';

// Simple UUID generator
const generateRuleId = (): string => {
	return 'rule_' + Math.random().toString(36).substr(2, 9);
};

export interface VisibilityRule {
	id: string;
	filterKey: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
	value?: string;
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

// Conditions that require a value field
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
	'template:is_single_term': 'text', // Taxonomy:term format
	'product_type:is': 'product_type',
	'listing:plan': 'listing_plan',
	'user:has_listing_plan': 'listing_plan',
	'author:has_listing_plan': 'listing_plan',
	'dtag': 'text',
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
	// Try to get options from Voxel's global data
	const Voxel = (window as any).Voxel;
	const voxelConfig = Voxel?.config || {};

	switch (valueType) {
		case 'membership_plan':
			// Try to get membership plans from Voxel config
			if (voxelConfig.membership_plans) {
				return Object.entries(voxelConfig.membership_plans).map(([key, plan]: [string, any]) => ({
					value: key,
					label: plan.label || plan.title || key,
				}));
			}
			// Fallback to common plans
			return [
				{ value: '', label: __('Select an option', 'voxel-fse') },
				{ value: 'default', label: __('Free plan', 'voxel-fse') },
			];

		case 'role':
			// Try to get roles from Voxel config
			if (voxelConfig.roles) {
				return Object.entries(voxelConfig.roles).map(([key, role]: [string, any]) => ({
					value: key,
					label: role.label || role.name || key,
				}));
			}
			// Fallback to common WordPress roles
			return [
				{ value: '', label: __('Select an option', 'voxel-fse') },
				{ value: 'administrator', label: __('Administrator', 'voxel-fse') },
				{ value: 'editor', label: __('Editor', 'voxel-fse') },
				{ value: 'author', label: __('Author', 'voxel-fse') },
				{ value: 'contributor', label: __('Contributor', 'voxel-fse') },
				{ value: 'subscriber', label: __('Subscriber', 'voxel-fse') },
			];

		case 'post_type':
			// Try to get post types from Voxel config
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
			// Try to get listing plans from Voxel config
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
			return []; // These use text input instead
	}
};

export default function ElementVisibilityModal({
	isOpen,
	onClose,
	rules,
	onSave,
}: ElementVisibilityModalProps) {
	const [localRules, setLocalRules] = useState<VisibilityRule[]>([]);

	// Initialize local rules when modal opens
	useEffect(() => {
		if (isOpen) {
			// Normalize and validate incoming rules
			const normalizedRules = Array.isArray(rules)
				? rules
					.filter((r): r is VisibilityRule => r != null && typeof r === 'object')
					.map((r) => ({
						id: r.id || generateRuleId(),
						filterKey: r.filterKey || '',
						operator: r.operator || 'equals',
						value: r.value || '',
					}))
				: [];

			// If no rules, start with one empty rule
			if (normalizedRules.length === 0) {
				setLocalRules([
					{
						id: generateRuleId(),
						filterKey: '',
						operator: 'equals',
						value: '',
					},
				]);
			} else {
				setLocalRules(normalizedRules);
			}
		}
	}, [isOpen, rules]);

	// Dynamically load Voxel's backend.css when modal opens
	// This prevents style conflicts with Gutenberg FSE layout
	// Pattern from: shared/dynamic-tags/DynamicTagBuilder/index.tsx
	useEffect(() => {
		if (!isOpen) return;

		const styleId = 'voxel-backend-css-dynamic';

		// Check if already loaded
		if (document.getElementById(styleId)) return;

		// Create link element to load Voxel's backend.css
		const link = document.createElement('link');
		link.id = styleId;
		link.rel = 'stylesheet';
		link.href = '/wp-content/themes/voxel/assets/dist/backend.css';
		document.head.appendChild(link);

		// Cleanup not needed - keep CSS loaded for subsequent opens
	}, [isOpen]);

	const addCondition = () => {
		setLocalRules([
			...localRules,
			{
				id: generateRuleId(),
				filterKey: '',
				operator: 'equals',
				value: '',
			},
		]);
	};

	const removeCondition = (ruleId: string) => {
		setLocalRules(localRules.filter((r) => r.id !== ruleId));
	};

	const updateCondition = (ruleId: string, condition: string) => {
		setLocalRules(
			localRules.map((r) =>
				r.id === ruleId ? { ...r, filterKey: condition, operator: 'equals', value: '' } : r
			)
		);
	};

	const updateValue = (ruleId: string, value: string) => {
		setLocalRules(
			localRules.map((r) =>
				r.id === ruleId ? { ...r, value } : r
			)
		);
	};

	const handleSave = () => {
		// Filter out empty/invalid rules
		const validRules = localRules.filter((r) => r.filterKey);
		onSave(validRules);
		onClose();
	};

	const handleDiscard = () => {
		onClose();
	};

	// Don't render if not open
	if (!isOpen) {
		return null;
	}

	// Render directly without WordPress Modal wrapper
	// This allows Voxel's backend.css to style the nvx-editor correctly
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
						<div className="nvx-rule-group">
							<div className="x-row">
								<div className="nvx-rule-group-head x-col-12">
									<h2>{__('Rule group', 'voxel-fse')}</h2>
								</div>

								{localRules.map((rule, index) => {
									// Defensive check for malformed rules
									if (!rule || typeof rule !== 'object') {
										return null;
									}
									const filterKey = rule.filterKey || '';
									const needsValue = filterKey ? conditionRequiresValue(filterKey) : false;
									const valueType = filterKey ? CONDITIONS_WITH_VALUES[filterKey] : undefined;
									const valueOptions = needsValue && valueType ? getValueOptions(valueType) : [];
									const useTextInput = needsValue && (valueType === 'text' || valueType === 'page' || valueOptions.length === 0);

									return (
										<div key={rule.id} className="nvx-rule x-col-12">
											<div className="x-row x-nowrap">
												{/* Condition dropdown */}
												<div className="ts-form-group x-col-2 x-grow">
													<label>
														{index === 0
															? __('Condition', 'voxel-fse')
															: __('And', 'voxel-fse')}
													</label>
													<select
														value={filterKey}
														onChange={(e) =>
															updateCondition(rule.id, e.target.value)
														}
													>
														{CONDITION_OPTIONS.map((opt) => (
															<option key={opt.value} value={opt.value}>
																{opt.label}
															</option>
														))}
													</select>
												</div>

												{/* Value field - only shown when condition requires it */}
												{needsValue && (
													<div className="ts-form-group x-col-2 x-grow">
														<label>{__('Value', 'voxel-fse')}</label>
														{useTextInput ? (
															<input
																type="text"
																value={rule.value || ''}
																onChange={(e) => updateValue(rule.id, e.target.value)}
																placeholder={valueType === 'page' ? __('Enter page ID or slug', 'voxel-fse') : __('Enter value', 'voxel-fse')}
															/>
														) : (
															<select
																value={rule.value || ''}
																onChange={(e) => updateValue(rule.id, e.target.value)}
															>
																{valueOptions.map((opt) => (
																	<option key={opt.value} value={opt.value}>
																		{opt.label}
																	</option>
																))}
															</select>
														)}
													</div>
												)}

												{/* Delete button */}
												<div className="x-col-2 x-grow-0 ts-form-group">
													<label>&nbsp;</label>
													<a
														href="#"
														className="ts-button ts-outline icon-only"
														onClick={(e) => {
															e.preventDefault();
															removeCondition(rule.id);
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
											addCondition();
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
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Get the display label for a visibility rule
 * @param rule The visibility rule
 * @returns The human-readable label for the rule
 */
export function getVisibilityRuleLabel(rule: VisibilityRule): string {
	// Extra defensive checks for undefined/null rules
	if (rule === undefined || rule === null) return '';
	if (typeof rule !== 'object') return '';

	const filterKey = rule.filterKey;
	if (!filterKey || typeof filterKey !== 'string') return '';

	// Safety check for undefined options
	const options = CONDITION_OPTIONS || [];
	if (!Array.isArray(options)) return filterKey;

	const option = options.find((opt) => opt && opt.value === filterKey);

	if (!option || !option.label) {
		return filterKey || '';
	}

	// If the rule has a value, append it to the label
	if (rule.value) {
		return `${option.label} ${rule.value}`;
	}

	return option.label;
}
