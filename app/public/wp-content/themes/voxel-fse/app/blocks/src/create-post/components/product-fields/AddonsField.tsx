/**
 * AddonsField Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Main container component for the addons product field.
 * Dynamically renders each addon based on its type, similar to Voxel's dynamic component rendering.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons-field.php
 * ```html
 * <template v-for="addon in field.props.addons">
 *   <component
 *     :is="addon.component_key"
 *     :addon="addon"
 *     :product="product"
 *     :field="this"
 *   ></component>
 * </template>
 * ```
 *
 * Backend: themes/voxel/app/product-types/product-fields/addons-field.php
 * Backend expects: $value['addons'][$addon->get_key()]
 *
 * Data Format Handling:
 * - ProductField stores at: productValue['addons'] = AddonsFieldValue
 * - AddonsFieldValue structure: { addons: { [addonKey]: addonValue } }
 * - Old Voxel data may have addon values at root level: { [addonKey]: addonValue }
 * - This component normalizes both formats to the correct structure
 *
 * 6 addon types, 4 unique components:
 * - numeric → NumericAddon
 * - switcher → SwitcherAddon
 * - select, multiselect → SelectAddon
 * - custom-select, custom-multiselect → CustomSelectAddon
 */
import React from 'react';
import type {
	AddonConfig,
	AddonType,
	AddonsFieldValue,
	NumericAddonValue,
	SwitcherAddonValue,
	SelectAddonValue,
	CustomSelectAddonValue,
} from '../../types';
import { NumericAddon } from './addons/NumericAddon';
import { SwitcherAddon } from './addons/SwitcherAddon';
import { SelectAddon } from './addons/SelectAddon';
import { CustomSelectAddon } from './addons/CustomSelectAddon';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Component props interface
 * Note: Backend returns addons as an object keyed by addon key, not an array
 */
interface AddonsFieldProps {
	field: {
		key: string;
		label?: string;
		props?: {
			addons?: Record<string, AddonConfig> | AddonConfig[];
		};
	};
	value: AddonsFieldValue | undefined;
	onChange: (value: AddonsFieldValue) => void;
}

/**
 * Convert addons object/array to array format
 * Backend returns addons as {addonKey: addonConfig} object
 */
function normalizeAddonsConfig(addons: Record<string, AddonConfig> | AddonConfig[] | undefined): AddonConfig[] {
	if (!addons) return [];

	// Already an array
	if (Array.isArray(addons)) return addons;

	// Object format: convert to array
	if (typeof addons === 'object') {
		return Object.entries(addons).map(([key, addon]) => ({
			...addon,
			key: addon.key || key, // Ensure key is set
		}));
	}

	return [];
}

/**
 * Base addon component props
 */
interface AddonComponentProps {
	addon: AddonConfig;
	value: NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue | undefined;
	onChange: (value: NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue) => void;
}

/**
 * Get the appropriate addon component based on type
 */
function getAddonComponent(type: AddonType): React.FC<AddonComponentProps> | null {
	switch (type) {
		case 'numeric':
			return NumericAddon as React.FC<AddonComponentProps>;
		case 'switcher':
			return SwitcherAddon as React.FC<AddonComponentProps>;
		case 'select':
		case 'multiselect':
			return SelectAddon as React.FC<AddonComponentProps>;
		case 'custom-select':
		case 'custom-multiselect':
			return CustomSelectAddon as React.FC<AddonComponentProps>;
		default:
			return null;
	}
}

/**
 * Normalize incoming value to internal AddonsFieldValue structure
 *
 * Input formats handled:
 * 1. Correct format (matches backend): { 'custom-multiselect-addon': {...}, 'numeric-addon': {...} }
 * 2. Double-nested bug: { addons: { 'custom-multiselect-addon': {...} } }
 * 3. Triple-nested bug: { addons: { addons: { 'custom-multiselect-addon': {...} } } }
 *
 * Internal format: { addons: { [addonKey]: addonValue } }
 * This wrapper is for internal use only - output is unwrapped in handleAddonChange
 *
 * Backend expects (at productValue.addons): { [addonKey]: addonValue }
 */
function normalizeValue(value: AddonsFieldValue | undefined, addonsConfig: AddonConfig[]): AddonsFieldValue {
	const normalized: AddonsFieldValue = { addons: {} };

	if (!value) return normalized;

	// Get addon keys from config to identify addon values
	const addonKeys = new Set(addonsConfig.map((a) => a.key));

	// Handle different input formats
	const valueObj = value as unknown as Record<string, unknown>;

	// Check if value has an 'addons' property (indicates wrapped format)
	if (valueObj['addons'] && typeof valueObj['addons'] === 'object') {
		const addonsObj = valueObj['addons'] as Record<string, unknown>;

		// Check for triple-nesting: value.addons.addons
		if (addonsObj['addons'] && typeof addonsObj['addons'] === 'object') {
			// Triple nested - extract from value.addons.addons
			const innerAddons = addonsObj['addons'] as Record<string, NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue>;
			Object.entries(innerAddons).forEach(([key, val]) => {
				if (addonKeys.has(key)) {
					normalized.addons[key] = val;
				}
			});
		}

		// Also copy direct addon values from value.addons (if not already set)
		Object.entries(addonsObj).forEach(([key, val]) => {
			if (key !== 'addons' && addonKeys.has(key) && !normalized.addons[key]) {
				normalized.addons[key] = val as NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue;
			}
		});
	}

	// Also check for addon values at root level (correct format from backend)
	// This is the format we should be receiving: { [addonKey]: value }
	Object.entries(valueObj).forEach(([key, val]) => {
		if (key !== 'addons' && addonKeys.has(key) && !normalized.addons[key]) {
			normalized.addons[key] = val as NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue;
		}
	});

	return normalized;
}

/**
 * AddonsField Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons-field.php
 */
export const AddonsField: React.FC<AddonsFieldProps> = ({
	field,
	value,
	onChange,
}) => {
	// Get addons configuration from field props
	// Backend returns addons as object {addonKey: config}, convert to array
	const addonsConfig: AddonConfig[] = normalizeAddonsConfig(field.props?.addons);

	// Normalize value to correct structure
	// Handles both old format (addon values at root) and new format (addon values in .addons)
	// Also fixes double-nesting bug where value.addons.addons existed
	const currentValue: AddonsFieldValue = normalizeValue(value, addonsConfig);

	// Handle individual addon value change
	// CRITICAL: Output structure must match backend expectation
	//
	// Data flow:
	// 1. ProductField calls handleSubFieldChange('addons', value)
	// 2. ProductField stores at: productValue['addons'] = value
	// 3. Backend (addons-field.php) reads: $value['addons'][$addon->get_key()]
	//
	// So backend expects productValue.addons[addonKey]
	// Therefore AddonsField must output: { [addonKey]: addonValue }
	// NOT: { addons: { [addonKey]: addonValue } } (would cause double nesting)
	const handleAddonChange = (addonKey: string, addonValue: NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue) => {
		// Build the output object directly with addon keys at root level
		// This matches what backend expects when stored at productValue.addons
		const outputValue = {
			...currentValue.addons,
			[addonKey]: addonValue,
		};

		// Cast to AddonsFieldValue for type compatibility
		// The actual structure is { [addonKey]: value }, not { addons: {...} }
		// TODO: Update AddonsFieldValue type to match this structure
		onChange(outputValue as unknown as AddonsFieldValue);
	};

	// If no addons configured, show info message
	if (addonsConfig.length === 0) {
		return (
			<div className="ts-form-group">
				<label>{field.label || 'Product Addons'}</label>
				<div className="ts-alert ts-info" style={{ marginTop: '10px' }}>
					<InfoIcon />
					<div>
						<p>No addons have been configured for this product type.</p>
						<p style={{ fontSize: '0.9em', marginTop: '4px', opacity: 0.8 }}>
							Addons can be configured in the Product Type settings.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Render each addon dynamically based on type - matches Voxel addons-field.php */}
			{addonsConfig.map((addon) => {
				const AddonComponent = getAddonComponent(addon.type);

				// Skip unknown addon types
				if (!AddonComponent) {
					console.warn(`Unknown addon type: ${addon.type}`);
					return null;
				}

				// Get the current value for this addon
				const addonValue = currentValue.addons[addon.key];

				return (
					<AddonComponent
						key={addon.key}
						addon={addon}
						value={addonValue}
						onChange={(newValue: NumericAddonValue | SwitcherAddonValue | SelectAddonValue | CustomSelectAddonValue) => handleAddonChange(addon.key, newValue)}
					/>
				);
			})}
		</>
	);
};
