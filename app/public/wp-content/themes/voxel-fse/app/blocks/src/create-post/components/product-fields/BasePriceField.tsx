/**
 * BasePriceField Component
 *
 * Product sub-field for base price and discount price inputs.
 *
 * EXACT Voxel: Matches base-price-field.php template structure
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/base-price-field.php
 *
 * Value Structure:
 * {
 *   amount: number,           // Base price
 *   discount_amount: number,  // Discount price (optional)
 * }
 *
 * Template Evidence:
 * - Lines 6-25: Base price input with currency suffix
 * - Lines 27-36: Discount price input (if enabled)
 * - Class vx-1-2: Half-width when discount price enabled
 */
import React from 'react';
import type { VoxelField } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Voxel config interface for window global
 */
interface VoxelConfig {
	currency?: string;
	stripe?: {
		currency?: string;
	};
}

declare global {
	interface Window {
		Voxel_Config?: VoxelConfig;
	}
}

/**
 * Base price field value structure
 */
interface BasePriceValue {
	amount?: number | null;
	discount_amount?: number | null;
}

interface BasePriceFieldProps {
	field: VoxelField;
	value: BasePriceValue;
	onChange: (value: BasePriceValue) => void;
}

export const BasePriceField: React.FC<BasePriceFieldProps> = ({
	field,
	value,
	onChange
}) => {
	// Normalize value
	const priceValue = value || { amount: null, discount_amount: null };

	// Check if discount price is enabled
	const discountEnabled = field.props?.discount_price?.enabled || false;

	// Get currency (default to USD if not set)
	const currency = window.Voxel_Config?.currency || 'USD';

	return (
		<>
			{/* Base Price - EXACT Voxel lines 6-25 */}
			<div className={`ts-form-group ${discountEnabled ? 'vx-1-2' : ''}`}>
				<label>
					{field.label || 'Price'}
					{field.description && (
						<div className="vx-dialog">
							<InfoIcon />
							<div className="vx-dialog-content min-scroll">
								<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
							</div>
						</div>
					)}
				</label>
				<div className="input-container">
					<input
						type="number"
						className="ts-filter"
						value={priceValue.amount || ''}
						onChange={(e) => onChange({
							...priceValue,
							amount: e.target.value ? parseFloat(e.target.value) : null
						})}
						min="0"
						placeholder="Add price"
					/>
					<span className="input-suffix">{currency}</span>
				</div>
			</div>

			{/* Discount Price - EXACT Voxel lines 27-36 */}
			{discountEnabled && (
				<div className="ts-form-group vx-1-2">
					<label>Discount price</label>
					<div className="input-container">
						<input
							type="number"
							className="ts-filter"
							value={priceValue.discount_amount || ''}
							onChange={(e) => onChange({
								...priceValue,
								discount_amount: e.target.value ? parseFloat(e.target.value) : null
							})}
							min="0"
							placeholder="Add price"
						/>
						<span className="input-suffix">{currency}</span>
					</div>
				</div>
			)}
		</>
	);
};
