/**
 * ShippingField Component
 *
 * Product sub-field for shipping configuration (enable shipping, shipping class).
 *
 * EXACT Voxel: Matches shipping-field.php template structure
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/shipping-field.php
 *
 * Value Structure:
 * {
 *   enabled: boolean,        // Enable shipping toggle
 *   shipping_class: string,  // Selected shipping class key
 * }
 *
 * Template Evidence:
 * - Lines 6-23: Enable shipping switcher (if not required)
 * - Lines 25-44: Shipping class dropdown
 * - Default option: Shows "Default" or "None" based on default_shipping_class
 */
import React from 'react';
import type { VoxelField } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Shipping field value structure
 */
interface ShippingValue {
	enabled?: boolean;
	shipping_class?: string;
}

interface ShippingFieldProps {
	field: VoxelField;
	value: ShippingValue;
	onChange: (value: ShippingValue) => void;
}

export const ShippingField: React.FC<ShippingFieldProps> = ({
	field,
	value,
	onChange
}) => {
	// Normalize value
	const shippingValue = value || {
		enabled: field.props?.required || false,
		shipping_class: ''
	};

	// Get shipping classes from field props
	const shippingClasses = field.props?.shipping_classes || {};
	const defaultShippingClass = field.props?.default_shipping_class || '';
	const isRequired = field.props?.required || false;

	// Handle enable toggle
	const handleEnabledChange = () => {
		onChange({
			...shippingValue,
			enabled: !shippingValue.enabled
		});
	};

	// Determine if shipping inputs should be shown
	const showShippingInputs = shippingValue.enabled || isRequired;

	return (
		<div className="ts-form-group switcher-label">
			{/* Enable Shipping Toggle - EXACT Voxel lines 7-23 (if not required) */}
			{!isRequired && (
				<label>
					<div className="switch-slider">
						<div className="onoffswitch">
							<input
								type="checkbox"
								className="onoffswitch-checkbox"
								checked={shippingValue.enabled || false}
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
					{field.label || 'Enable shipping'}
					{field.description && (
						<div className="vx-dialog">
							<InfoIcon />
							<div className="vx-dialog-content min-scroll">
								<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
							</div>
						</div>
					)}
				</label>
			)}

			{/* Shipping Class Dropdown - EXACT Voxel lines 25-44 */}
			{showShippingInputs && (
				<div className="ts-form-group">
					<label>Shipping class</label>
					<div className="ts-filter">
						<select
							value={shippingValue.shipping_class || ''}
							onChange={(e) => onChange({
								...shippingValue,
								shipping_class: e.target.value
							})}
						>
							{/* Default/None option - lines 30-36 */}
							<option value="">
								{defaultShippingClass && shippingClasses[defaultShippingClass]
									? 'Default'
									: 'None'
								}
							</option>

							{/* Shipping class options - lines 38-40 */}
							{Object.keys(shippingClasses).map(key => {
								const shippingClass = shippingClasses[key];
								return (
									<option key={key} value={key}>
										{shippingClass.label || key}
									</option>
								);
							})}
						</select>
						<div className="ts-down-icon"></div>
					</div>
				</div>
			)}
		</div>
	);
};
