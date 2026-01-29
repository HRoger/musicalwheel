/**
 * StockField Component
 *
 * Product sub-field for stock management (quantity, SKU, sold individually).
 *
 * EXACT Voxel: Matches stock-field.php template structure
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/stock-field.php
 *
 * Value Structure:
 * {
 *   enabled: boolean,          // Manage stock toggle
 *   quantity: number,          // Stock quantity
 *   sku: string,              // Stock-keeping unit (optional)
 *   sold_individually: boolean // Limit to 1 per order
 * }
 *
 * Template Evidence:
 * - Lines 6-23: Manage stock switcher
 * - Lines 24-29: Quantity input
 * - Lines 30-33: SKU input (if enabled)
 * - Lines 34-44: Sold individually switcher
 */
import React from 'react';
import type { VoxelField } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Stock field value structure
 */
interface StockValue {
	enabled?: boolean;
	quantity?: number | null;
	sku?: string;
	sold_individually?: boolean;
}

interface StockFieldProps {
	field: VoxelField;
	value: StockValue;
	onChange: (value: StockValue) => void;
}

export const StockField: React.FC<StockFieldProps> = ({
	field,
	value,
	onChange
}) => {
	// Normalize value
	const stockValue = value || {
		enabled: false,
		quantity: null,
		sku: '',
		sold_individually: false
	};

	// Check if SKU is enabled
	const skuEnabled = field.props?.sku?.enabled || false;

	// Handle enable toggle
	const handleEnabledChange = () => {
		onChange({
			...stockValue,
			enabled: !stockValue.enabled
		});
	};

	// Handle sold individually toggle
	const handleSoldIndividuallyChange = () => {
		onChange({
			...stockValue,
			sold_individually: !stockValue.sold_individually
		});
	};

	return (
		<div className="ts-form-group switcher-label">
			{/* Manage Stock Toggle - EXACT Voxel lines 6-23 */}
			<label>
				<div className="switch-slider">
					<div className="onoffswitch">
						<input
							type="checkbox"
							className="onoffswitch-checkbox"
							checked={stockValue.enabled || false}
							onChange={handleEnabledChange}
						/>
						<label
							className="onoffswitch-label"
							onClick={(e) => {
								e.preventDefault();
								handleEnabledChange();
							}}
						></label>
					</div>
				</div>
				{field.label || 'Manage stock'}
				{field.description && (
					<div className="vx-dialog">
						<InfoIcon />
						<div className="vx-dialog-content min-scroll">
							<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
						</div>
					</div>
				)}
			</label>

			{/* Stock Inputs - EXACT Voxel lines 24-46 */}
			{stockValue.enabled && (
				<div className="ts-field-repeater">
					<div className="medium form-field-grid">
						{/* Quantity Input - lines 26-29 */}
						<div className="ts-form-group vx-1-2">
							<label>Stock</label>
							<input
								type="number"
								className="ts-filter"
								value={stockValue.quantity || ''}
								onChange={(e) => onChange({
									...stockValue,
									quantity: e.target.value ? parseInt(e.target.value) : null
								})}
								min="0"
								placeholder="Set quantity"
							/>
						</div>

						{/* SKU Input - lines 30-33 */}
						{skuEnabled && (
							<div className="ts-form-group vx-1-2">
								<label>SKU</label>
								<input
									type="text"
									className="ts-filter"
									value={stockValue.sku || ''}
									onChange={(e) => onChange({
										...stockValue,
										sku: e.target.value
									})}
									placeholder="Stock-keeping unit"
								/>
							</div>
						)}

						{/* Sold Individually Toggle - lines 34-44 */}
						<div className="ts-form-group switcher-label">
							<label>
								<div className="switch-slider">
									<div className="onoffswitch">
										<input
											type="checkbox"
											className="onoffswitch-checkbox"
											checked={stockValue.sold_individually || false}
											onChange={handleSoldIndividuallyChange}
										/>
										<label
											className="onoffswitch-label"
											onClick={(e) => {
												e.preventDefault();
												handleSoldIndividuallyChange();
											}}
										></label>
									</div>
								</div>
								Limit purchases to 1 item per order
							</label>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
