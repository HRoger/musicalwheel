/**
 * SwitcherAddon Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Simple on/off addon with a price. Used for things like "Gift wrapping" or "Priority support".
 * The simplest addon type - just a toggle and a price input.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/switcher.php
 * - Uses <small> for description instead of vx-dialog (inline style)
 * - Only has one field: price input with currency suffix
 *
 * Backend: themes/voxel/app/product-types/product-addons/switcher-addon.php
 */
import React from 'react';
import type { AddonConfig, SwitcherAddonValue } from '../../../types';
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
interface SwitcherAddonProps {
	addon: AddonConfig;
	value: SwitcherAddonValue | undefined;
	onChange: (value: SwitcherAddonValue) => void;
}

/**
 * Get default value for switcher addon
 */
function getDefaultValue(): SwitcherAddonValue {
	return {
		enabled: false,
		price: null,
	};
}

/**
 * SwitcherAddon Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/switcher.php:25-35
 */
export const SwitcherAddon: React.FC<SwitcherAddonProps> = ({
	addon,
	value,
	onChange,
}) => {
	// Get currency from global config (default to USD if not set)
	const currency = window.Voxel_Config?.currency || 'USD';

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

	// Determine if addon is enabled (required addons are always enabled)
	const isEnabled = addon.required || currentValue.enabled === true;

	return (
		<AddonWrapper
			addon={addon}
			enabled={isEnabled}
			onToggleEnabled={handleToggleEnabled}
			descriptionStyle="inline"
		>
			{/* Expanded content - matches Voxel switcher.php:25-35 */}
			<div className="ts-field-repeater">
				<div className="medium form-field-grid">
					{/* Price input - matches Voxel switcher.php:27-33 */}
					<div className="ts-form-group">
						<label>Enter price for this add-on</label>
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
				</div>
			</div>
		</AddonWrapper>
	);
};
