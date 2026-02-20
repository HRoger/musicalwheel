/**
 * Single Price Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/custom-prices/single-price.php
 *
 * Single pricing rule editor containing:
 * - Label input
 * - Conditions list (add/delete conditions)
 * - Base price fields (amount + discount_amount)
 * - Addon price fields (numeric/switcher + select/multiselect)
 */
import React, { useCallback } from 'react';
import { PricingConditionRow } from './PricingConditionRow';
import type {
	CustomPricingRule,
	PricingCondition,
	CustomPricesFieldConfig,
	ProductTypeField,
	AddonConfig,
} from '../../../types';

// Voxel_Config is declared globally in voxelShim.ts

/**
 * Choice item for addon lists
 */
interface AddonChoiceItem {
	value: string;
	label?: string;
	enabled?: boolean;
}

/**
 * Product type with fields
 */
interface ProductType {
	fields?: {
		addons?: {
			props?: {
				addons?: Record<string, AddonConfig> | AddonConfig[];
			};
		};
	};
}

/**
 * Product field value with addons
 */
interface ProductFieldValue {
	addons?: Record<string, {
		enabled?: boolean;
		list?: AddonChoiceItem[];
		choices?: Record<string, { enabled?: boolean; price?: number | null }>;
	}>;
}

// Plus Icon
const PlusIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#343C54" />
	</svg>
);

// Generate unique ID
const generateUid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Normalize addons config from object to array
 * Backend returns addons as {addonKey: addonConfig} object, not array
 */
function normalizeAddonsConfig(addons: Record<string, AddonConfig> | AddonConfig[] | undefined): AddonConfig[] {
	if (!addons) return [];

	// Already an array
	if (Array.isArray(addons)) return addons;

	// Object format: convert to array
	if (typeof addons === 'object') {
		return Object.entries(addons).map(([key, addon]) => ({
			...addon,
			key: addon.key || key,
		}));
	}

	return [];
}

// Create empty condition
const createEmptyCondition = (): PricingCondition => ({
	_uid: generateUid(),
	type: 'day_of_week',
	days: [],
	date: null,
	range: { from: null, to: null },
});

interface SinglePriceProps {
	pricing: CustomPricingRule;
	onChange: (updated: CustomPricingRule) => void;
	field: ProductTypeField & { props: CustomPricesFieldConfig };
	productType: ProductType;
	productFieldValue: ProductFieldValue;
}

export const SinglePrice: React.FC<SinglePriceProps> = ({
	pricing,
	onChange,
	field,
	productType,
	productFieldValue,
}) => {
	// Get config from field props
	const basePriceEnabled = field.props?.base_price?.enabled ?? false;
	const discountPriceEnabled = field.props?.base_price?.discount_price?.enabled ?? false;
	const addonsEnabled = field.props?.addons?.enabled ?? false;
	const weekdays = field.props?.weekdays ?? {};
	const maxConditions = field.props?.limits?.custom_price_conditions ?? 10;

	// Get addons from product type (normalize object to array)
	const addonsConfig = normalizeAddonsConfig(productType?.fields?.addons?.props?.addons);

	// Get the actual addons data from productFieldValue
	// After AddonsField fix: data is stored directly at productFieldValue.addons
	// Structure: productFieldValue.addons = { [addonKey]: addonValue }
	const getAddonsData = useCallback(() => {
		if (!productFieldValue || typeof productFieldValue !== 'object') return null;
		const addonsField = productFieldValue.addons as Record<string, unknown> | undefined;
		if (!addonsField || typeof addonsField !== 'object') return null;
		return addonsField;
	}, [productFieldValue]);

	// Check if an addon is active (enabled or required)
	// Matches Voxel's logic: addon is active if required OR enabled by vendor
	const isAddonActive = useCallback((addonKey: string): boolean => {
		// Find addon config first
		const addonConfig = addonsConfig.find((a) => a.key === addonKey);

		// If addon is required by config, always show it
		if (addonConfig?.required) return true;

		// Check if vendor has this addon enabled
		const addonsData = getAddonsData();
		if (!addonsData) return false;

		const addonValue = addonsData[addonKey] as { enabled?: boolean } | undefined;
		if (!addonValue) return false;

		// Consider active if enabled is true OR if enabled is not explicitly false
		// (some addons might just have value without explicit enabled flag)
		return addonValue.enabled !== false;
	}, [getAddonsData, addonsConfig]);

	// Check if a choice is active
	// For custom-select: all choices with a price are considered active
	// For select/multiselect: check the enabled flag
	const isChoiceActive = useCallback((choiceValue: string, addonKey: string): boolean => {
		const addonsData = getAddonsData();
		if (!addonsData) return false;

		const addonValue = addonsData[addonKey] as {
			list?: AddonChoiceItem[];
			choices?: Record<string, { enabled?: boolean; price?: number | null }>;
		} | undefined;
		if (!addonValue) return false;

		// For custom-select/custom-multiselect, check if choice exists in choices object
		// and has a price set (Voxel considers choices with price as active)
		if (addonValue.choices) {
			const choice = addonValue.choices[choiceValue];
			// A choice is active if it exists - price being set means it's available
			return choice !== undefined;
		}

		// Legacy: For list array format (if ever used)
		if (addonValue.list) {
			return addonValue.list.some((item) => item.value === choiceValue && item.enabled !== false);
		}

		return false;
	}, [getAddonsData]);

	// Get addon reference (for custom-select/custom-multiselect choices)
	// Returns the addon value with choices converted to list array format
	const getAddonRef = useCallback((addonKey: string): { list: AddonChoiceItem[] } | null => {
		const addonsData = getAddonsData();
		if (!addonsData) return null;

		const addonValue = addonsData[addonKey] as {
			enabled?: boolean;
			choices?: Record<string, { price?: number | null; quantity?: unknown }>;
		} | undefined;
		if (!addonValue) return null;

		// Convert choices object to list array format
		// This matches Voxel's Vue component which uses list for custom-select
		if (addonValue.choices && typeof addonValue.choices === 'object') {
			const list: AddonChoiceItem[] = Object.entries(addonValue.choices).map(([value, _data]) => ({
				value,
				label: value,
				enabled: true, // If it's in choices, it's enabled
			}));
			return { list };
		}

		return null;
	}, [getAddonsData]);

	// Handle label change
	const handleLabelChange = useCallback((label: string) => {
		onChange({ ...pricing, label });
	}, [pricing, onChange]);

	// Handle base price amount change
	const handleBasePriceChange = useCallback((amount: number | null) => {
		onChange({
			...pricing,
			prices: {
				...pricing.prices,
				base_price: {
					...pricing.prices.base_price,
					amount,
				},
			},
		});
	}, [pricing, onChange]);

	// Handle discount price amount change
	const handleDiscountPriceChange = useCallback((discount_amount: number | null) => {
		onChange({
			...pricing,
			prices: {
				...pricing.prices,
				base_price: {
					amount: pricing.prices.base_price?.amount ?? null,
					...pricing.prices.base_price,
					discount_amount,
				},
			},
		});
	}, [pricing, onChange]);

	// Handle addon price change (for numeric/switcher)
	const handleAddonPriceChange = useCallback((addonKey: string, price: number | null) => {
		const currentAddons = pricing.prices.addons || {};
		onChange({
			...pricing,
			prices: {
				...pricing.prices,
				addons: {
					...currentAddons,
					[addonKey]: {
						...currentAddons[addonKey],
						price,
					},
				},
			},
		});
	}, [pricing, onChange]);

	// Handle addon choice price change (for select/multiselect)
	const handleAddonChoicePriceChange = useCallback((addonKey: string, choiceValue: string, price: number | null) => {
		const currentAddons = pricing.prices.addons || {};
		const currentAddonValue = currentAddons[addonKey] || {};
		onChange({
			...pricing,
			prices: {
				...pricing.prices,
				addons: {
					...currentAddons,
					[addonKey]: {
						...currentAddonValue,
						[choiceValue]: {
							...(currentAddonValue[choiceValue] || {}),
							price,
						},
					},
				},
			},
		});
	}, [pricing, onChange]);

	// Create new condition
	const handleCreateCondition = useCallback(() => {
		if ((pricing.conditions?.length || 0) >= maxConditions) return;

		const newCondition = createEmptyCondition();
		onChange({
			...pricing,
			conditions: [...(pricing.conditions || []), newCondition],
		});
	}, [pricing, maxConditions, onChange]);

	// Delete condition
	const handleDeleteCondition = useCallback((uid: string) => {
		onChange({
			...pricing,
			conditions: (pricing.conditions || []).filter(c => c._uid !== uid),
		});
	}, [pricing, onChange]);

	// Update condition
	const handleUpdateCondition = useCallback((uid: string, updated: PricingCondition) => {
		onChange({
			...pricing,
			conditions: (pricing.conditions || []).map(c =>
				c._uid === uid ? { ...updated, _uid: uid } : c
			),
		});
	}, [pricing, onChange]);

	const canAddMoreConditions = (pricing.conditions?.length || 0) < maxConditions;

	// Get currency suffix from Voxel config
	const currencySuffix = (window as any).Voxel_Config?.stripe?.currency?.toUpperCase() || 'USD';

	return (
		<>
			{/* Label Input */}
			<div className="ts-form-group ts-pricing-label vx-1-1">
				<label>Set name</label>
				<div className="input-container">
					<input
						type="text"
						className="ts-filter"
						placeholder="Name your custom price"
						value={pricing.label || ''}
						onChange={(e) => handleLabelChange(e.target.value)}
					/>
				</div>
			</div>

			{/* Conditions and Set Prices Section - Same grid container like Voxel */}
			<div className="ts-form-group">
				<div className="form-field-grid medium">
					<div className="ts-form-group vx-1-1 ui-heading-field">
						<label>Conditions</label>
					</div>

					{/* Condition Rows */}
					{(pricing.conditions || []).map((condition, index) => (
						<PricingConditionRow
							key={condition._uid || index}
							condition={condition}
							onChange={(updated) => handleUpdateCondition(condition._uid!, updated)}
							onDelete={() => handleDeleteCondition(condition._uid!)}
							weekdays={weekdays}
							popupKeyPrefix={`${pricing._uid}-cond-${index}`}
						/>
					))}

					{/* Add Condition Button */}
					<div className="ts-form-group">
						{canAddMoreConditions ? (
							<a
								href="#"
								className="ts-btn ts-btn-4 form-btn"
								onClick={(e) => { e.preventDefault(); handleCreateCondition(); }}
							>
								<PlusIcon />
								Add condition
							</a>
						) : (
							<p className="ts-form-note">
								Maximum of {maxConditions} conditions reached.
							</p>
						)}
					</div>

					{/* Set Prices Section - Inside the same grid like Voxel */}
					<div className="ts-form-group vx-1-1">
						<div className="form-field-grid medium custom-price-table">
							<div className="ts-form-group vx-1-1 ui-heading-field">
								<label>Set prices</label>
							</div>

					{/* Base Price (if enabled) */}
					{basePriceEnabled && (
						<>
							<div className="ts-form-group vx-1-2">
								<label>Price</label>
								<div className="input-container">
									<input
										type="number"
										className="ts-filter"
										min="0"
										step="0.01"
										placeholder="Add price"
										value={pricing.prices?.base_price?.amount ?? ''}
										onChange={(e) => handleBasePriceChange(
											e.target.value ? parseFloat(e.target.value) : null
										)}
									/>
									<span className="input-suffix">{currencySuffix}</span>
								</div>
							</div>

							{/* Discount Price (if enabled) */}
							{discountPriceEnabled && (
								<div className="ts-form-group vx-1-2">
									<label>Discount price</label>
									<div className="input-container">
										<input
											type="number"
											className="ts-filter"
											min="0"
											step="0.01"
											placeholder="Add price"
											value={pricing.prices?.base_price?.discount_amount ?? ''}
											onChange={(e) => handleDiscountPriceChange(
												e.target.value ? parseFloat(e.target.value) : null
											)}
										/>
										<span className="input-suffix">{currencySuffix}</span>
									</div>
								</div>
							)}
						</>
					)}

					{/* Addons (if enabled) */}
					{addonsEnabled && (
						<>
							{/* Numeric & Switcher Addons (vx-1-2 per addon) */}
							{addonsConfig.map((addon) => {
								if (!isAddonActive(addon.key)) return null;
								if (addon.type !== 'numeric' && addon.type !== 'switcher') return null;

								const currentPrice = pricing.prices?.addons?.[addon.key]?.price ?? null;

								return (
									<div key={addon.key} className="ts-form-group vx-1-2">
										<label>{addon.label}</label>
										<div className="input-container">
											<input
												type="number"
												className="ts-filter"
												min="0"
												step="0.01"
												placeholder="Add price"
												value={currentPrice ?? ''}
												onChange={(e) => handleAddonPriceChange(
													addon.key,
													e.target.value ? parseFloat(e.target.value) : null
												)}
											/>
											<span className="input-suffix">{currencySuffix}</span>
										</div>
									</div>
								);
							})}

							{/* Custom-Select & Custom-Multiselect Addons (vx-1-1 with nested grid) */}
							{addonsConfig.map((addon) => {
								if (!isAddonActive(addon.key)) return null;
								if (addon.type !== 'custom-select' && addon.type !== 'custom-multiselect') return null;

								const addonRef = getAddonRef(addon.key);
								const choices = addonRef?.list || [];

								return (
									<div key={addon.key} className="ts-form-group vx-1-1">
										<div className="form-field-grid medium">
											<div className="ts-form-group ui-heading-field">
												<label>{addon.label}</label>
											</div>
											{choices.map((choice) => {
												if (!isChoiceActive(choice.value, addon.key)) return null;

												const currentPrice = (pricing.prices?.addons?.[addon.key]?.[choice.value] as any)?.price ?? null;

												return (
													<div key={choice.value} className="ts-form-group vx-1-2">
														<label>{choice.value}</label>
														<div className="input-container">
															<input
																type="number"
																className="ts-filter"
																min="0"
																step="0.01"
																placeholder="Add price"
																value={currentPrice ?? ''}
																onChange={(e) => handleAddonChoicePriceChange(
																	addon.key,
																	choice.value,
																	e.target.value ? parseFloat(e.target.value) : null
																)}
															/>
															<span className="input-suffix">{currencySuffix}</span>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}

							{/* Select & Multiselect Addons (vx-1-1 with nested grid) */}
							{addonsConfig.map((addon) => {
								if (!isAddonActive(addon.key)) return null;
								if (addon.type !== 'select' && addon.type !== 'multiselect') return null;

								const choices = addon.props?.choices || [];

								return (
									<div key={addon.key} className="ts-form-group vx-1-1">
										<div className="form-field-grid medium custom-price-table">
											<div className="ts-form-group ui-heading-field">
												<label>{addon.label}</label>
											</div>
											{choices.map((choice) => {
												if (!isChoiceActive(choice.value, addon.key)) return null;

												const currentPrice = (pricing.prices?.addons?.[addon.key]?.[choice.value] as any)?.price ?? null;

												return (
													<div key={choice.value} className="ts-form-group vx-1-2">
														<label>{choice.label}</label>
														<div className="input-container">
															<input
																type="number"
																className="ts-filter"
																min="0"
																step="0.01"
																placeholder="Add price"
																value={currentPrice ?? ''}
																onChange={(e) => handleAddonChoicePriceChange(
																	addon.key,
																	choice.value,
																	e.target.value ? parseFloat(e.target.value) : null
																)}
															/>
															<span className="input-suffix">{currencySuffix}</span>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</>
					)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
