/**
 * NumericAddon Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Numeric addon type that allows vendors to set a price per quantity
 * with min/max limits. Used for things like "Extra guests" or "Additional hours".
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/numeric.php
 * - Price input with currency suffix
 * - Min number input (vx-1-2)
 * - Max number input (vx-1-2)
 *
 * Backend: themes/voxel/app/product-types/product-addons/numeric-addon.php
 */
import React from 'react';
import type { AddonConfig, NumericAddonValue } from '../../../types';
import { AddonWrapper } from './AddonWrapper';
import { InfoIcon } from '../../icons/InfoIcon';

// Voxel_Config is declared globally in voxelShim.ts

/**
 * Component props interface
 */
interface NumericAddonProps {
	addon: AddonConfig;
	value: NumericAddonValue | undefined;
	onChange: (value: NumericAddonValue) => void;
}

/**
 * Get default value for numeric addon
 */
function getDefaultValue(): NumericAddonValue {
	return {
		enabled: false,
		price: null,
		min: null,
		max: null,
	};
}

/**
 * NumericAddon Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/numeric.php:36-78
 */
export const NumericAddon: React.FC<NumericAddonProps> = ({
	addon,
	value,
	onChange,
}) => {
	// Get currency from global config (default to USD if not set)
	const currency = (window as any).Voxel_Config?.currency || 'USD';

	// Ensure we have a value object
	const currentValue = value || getDefaultValue();

	// Handle enabled toggle
	const handleToggleEnabled = (enabled: boolean) => {
		onChange({
			...currentValue,
			enabled,
		});
	};

	// Handle price change
	const handlePriceChange = (priceStr: string) => {
		const price = priceStr === '' ? null : parseFloat(priceStr);
		onChange({
			...currentValue,
			price: isNaN(price as number) ? null : price,
		});
	};

	// Handle min change
	const handleMinChange = (minStr: string) => {
		const min = minStr === '' ? null : parseInt(minStr);
		onChange({
			...currentValue,
			min: isNaN(min as number) ? null : min,
		});
	};

	// Handle max change
	const handleMaxChange = (maxStr: string) => {
		const max = maxStr === '' ? null : parseInt(maxStr);
		onChange({
			...currentValue,
			max: isNaN(max as number) ? null : max,
		});
	};

	// Determine if addon is enabled (required addons are always enabled)
	const isEnabled = addon.required || currentValue.enabled === true;

	return (
		<AddonWrapper
			addon={addon}
			enabled={isEnabled}
			onToggleEnabled={handleToggleEnabled}
		>
			{/* Expanded content - matches Voxel numeric.php:35-79 */}
			<div className="ts-field-repeater">
				<div className="medium form-field-grid">
					{/* Price input - matches Voxel numeric.php:37-48 */}
					<div className="ts-form-group">
						<label>
							Price
							{/* Info icon placeholder - Voxel has an empty vx-dialog here */}
							<div className="vx-dialog">
								<InfoIcon />
							</div>
						</label>
						<div className="input-container">
							<input
								type="number"
								className="ts-filter"
								value={currentValue.price ?? ''}
								onChange={(e) => handlePriceChange(e.target.value)}
								placeholder="Add price"
								min="0"
							/>
							<span className="input-suffix">{currency}</span>
						</div>
					</div>

					{/* Min number - matches Voxel numeric.php:50-63 */}
					<div className="ts-form-group vx-1-2">
						<label>Min number</label>
						<div className="input-container">
							<input
								type="number"
								className="ts-filter"
								value={currentValue.min ?? ''}
								onChange={(e) => handleMinChange(e.target.value)}
								placeholder="Min"
								min="0"
							/>
						</div>
					</div>

					{/* Max number - matches Voxel numeric.php:64-77 */}
					<div className="ts-form-group vx-1-2">
						<label>Max number</label>
						<div className="input-container">
							<input
								type="number"
								className="ts-filter"
								value={currentValue.max ?? ''}
								onChange={(e) => handleMaxChange(e.target.value)}
								placeholder="Max"
								min="0"
							/>
						</div>
					</div>
				</div>
			</div>
		</AddonWrapper>
	);
};
