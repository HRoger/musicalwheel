/**
 * SelectAddon Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Select addon type with predefined choices from admin configuration.
 * Vendors can enable/disable choices and set prices for each.
 * Used for things like "Size" or "Color" with admin-defined options.
 *
 * Note: This is also used for multiselect (same template, different frontend behavior)
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/select.php
 * - Collapsible list of predefined choices (from addon.props.choices)
 * - Per-choice: price input only (no delete, choices are predefined)
 * - Uses handle.svg for drag handle icon (but not draggable in this context)
 *
 * Backend: themes/voxel/app/product-types/product-addons/select-addon.php
 */
import React, { useState } from 'react';
import type { AddonConfig, SelectAddonValue, AddonPresetChoice } from '../../../types';
import { AddonWrapper } from './AddonWrapper';

/**
 * Voxel config interface for window global
 */
interface VoxelConfig {
	currency?: string;
}

declare global {
	interface Window {
		Voxel_Config?: VoxelConfig;
	}
}

/**
 * Component props interface
 */
interface SelectAddonProps {
	addon: AddonConfig;
	value: SelectAddonValue | undefined;
	onChange: (value: SelectAddonValue) => void;
}

/**
 * Format currency (simple implementation)
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
	return `${currency}${amount.toFixed(2)}`;
}

/**
 * Get default value for select addon
 */
function getDefaultValue(choices: AddonPresetChoice[]): SelectAddonValue {
	const choicesValue: SelectAddonValue['choices'] = {};
	// Defensive guard - ensure choices is an array
	if (!Array.isArray(choices)) {
		return { enabled: false, choices: {} };
	}
	choices.forEach(choice => {
		choicesValue[choice.value] = {
			enabled: false,
			price: null,
		};
	});
	return {
		enabled: false,
		choices: choicesValue,
	};
}

/**
 * SelectAddon Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/select.php:36-70
 */
export const SelectAddon: React.FC<SelectAddonProps> = ({
	addon,
	value,
	onChange,
}) => {
	// Get currency from global config (default to USD if not set)
	const currency = window.Voxel_Config?.currency || 'USD';
	// Get predefined choices from addon config
	// Ensure it's actually an array (backend might return object)
	const rawChoices = addon.props?.choices;
	const presetChoices = Array.isArray(rawChoices) ? rawChoices : [];

	// Ensure we have a value object
	const currentValue = value || getDefaultValue(presetChoices);

	// Track which choice is currently expanded
	const [activeChoice, setActiveChoice] = useState<string | null>(null);

	// Handle enabled toggle
	const handleToggleEnabled = (enabled: boolean) => {
		onChange({
			...currentValue,
			enabled,
		});
	};

	// Handle choice price change
	const handleChoicePriceChange = (choiceValue: string, priceStr: string) => {
		const price = priceStr === '' ? null : parseFloat(priceStr);
		onChange({
			...currentValue,
			choices: {
				...currentValue.choices,
				[choiceValue]: {
					...currentValue.choices[choiceValue],
					price: isNaN(price as number) ? null : price,
				},
			},
		});
	};

	// Toggle choice expansion
	const toggleChoice = (choiceValue: string) => {
		setActiveChoice(activeChoice === choiceValue ? null : choiceValue);
	};

	// Get price for a choice
	const getChoicePrice = (choiceValue: string): number | null => {
		return currentValue.choices[choiceValue]?.price ?? null;
	};

	// Determine if addon is enabled (required addons are always enabled)
	const isEnabled = addon.required || currentValue.enabled === true;

	return (
		<AddonWrapper
			addon={addon}
			enabled={isEnabled}
			onToggleEnabled={handleToggleEnabled}
		>
			{/* Choices container - matches Voxel select.php:37-69 */}
			<div className="ts-repeater-container">
				{presetChoices.map((choice) => {
					const isActive = activeChoice === choice.value;
					const price = getChoicePrice(choice.value);
					const hasPrice = typeof price === 'number';

					return (
						<div
							key={choice.value}
							className={`ts-field-repeater ${isActive ? '' : 'collapsed'}`}
						>
							{/* Choice header - matches Voxel select.php:40-56 */}
							<div
								className="ts-repeater-head"
								onClick={() => toggleChoice(choice.value)}
							>
								{/* Handle icon - matches Voxel handle.svg */}
								<svg
									id="Layer_1"
									data-name="Layer 1"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 288 480"
								>
									<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
								</svg>

								{/* Choice label */}
								<label>{choice.label}</label>

								{/* Price display - matches Voxel select.php:45-50 */}
								{hasPrice ? (
									<em>{formatCurrency(price, currency)}</em>
								) : (
									<em>No price added</em>
								)}

								{/* Controller - matches Voxel select.php:51-55 */}
								<div className="ts-repeater-controller">
									<a
										href="#"
										className="ts-icon-btn ts-smaller"
										onClick={(e) => e.preventDefault()}
									>
										{/* Chevron down icon - matches Voxel chevron-down.svg */}
										<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="#343C54"/>
										</svg>
									</a>
								</div>
							</div>

							{/* Expanded content - matches Voxel select.php:58-66 */}
							{isActive && (
								<div className="medium form-field-grid">
									<div className="ts-form-group">
										<label>Price</label>
										<div className="input-container">
											<input
												type="number"
												className="ts-filter"
												value={price ?? ''}
												onChange={(e) => handleChoicePriceChange(choice.value, e.target.value)}
												min="0"
												placeholder="Add price"
											/>
											<span className="input-suffix">{currency}</span>
										</div>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</AddonWrapper>
	);
};
