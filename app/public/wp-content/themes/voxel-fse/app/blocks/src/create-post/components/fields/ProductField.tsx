/**
 * ProductField Component
 *
 * Container field that manages product configuration with:
 * - Enable/disable toggle (if optional)
 * - Product type selector (if multiple types)
 * - Dynamic sub-field rendering based on selected product type
 *
 * EXACT Voxel: Matches product-field.php template structure
 * Evidence: themes/voxel/templates/widgets/create-post/product-field.php
 *
 * Value Structure:
 * {
 *   enabled: boolean,
 *   product_type: string,
 *   // ... sub-field values dynamically added based on product type
 *   //     e.g., base_price, stock, shipping, addons, booking, etc.
 * }
 *
 * Backend Implementation:
 * - File: themes/voxel/app/post-types/fields/product-field.php
 * - Props structure: lines 244-269 (frontend_props method)
 * - Product types: Array of product type configs with fields
 * - Sub-fields: Each product type has its own set of fields
 *
 * Template Implementation:
 * - File: themes/voxel/templates/widgets/create-post/product-field.php
 * - Lines 13-30: Enable/disable switcher (if !field.required)
 * - Lines 45-56: Product type selector (if multiple types)
 * - Lines 59-69: Dynamic sub-field rendering
 */
import React, { useCallback, useMemo } from 'react';
import type { VoxelField } from '../../types';
import { BasePriceField, StockField, ShippingField, SubscriptionIntervalField, DeliverablesField, CustomPricesField, AddonsField, BookingField, VariationsField } from '../product-fields';
import type { BookingFieldValue } from '../product-fields/booking/types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Product field value structure
 */
interface ProductFieldValue {
	enabled?: boolean;
	product_type?: string;
	[key: string]: unknown; // Sub-field values (base_price, stock, shipping, etc.)
}

interface ProductFieldProps {
	field: VoxelField;
	value: ProductFieldValue | null;
	onChange: (value: ProductFieldValue) => void;
}

export const ProductField: React.FC<ProductFieldProps> = ({
	field,
	value,
	onChange
}) => {
	// DEBUG: Log field props to understand what data we're receiving
	React.useEffect(() => {
		console.log('='.repeat(80));
		console.log('ProductField: Mounted/Updated');
		console.log('='.repeat(80));
		console.log('field.key:', field.key);
		console.log('field.type:', field.type);
		console.log('field.label:', field.label);
		console.log('field.required:', field.required);
		console.log('field.props:', field.props);
		console.log('field.props.product_types:', field.props?.['product_types']);
		console.log('value:', value);
		console.log('='.repeat(80));
	}, [field, value]);

	// Normalize value to object
	// EXACT Voxel: Value structure from product-field.php lines 56-60
	const productValue = useMemo(() => {
		if (typeof value === 'object' && value !== null) {
			return value;
		}
		// Default value structure
		const productTypes = field.props?.['product_types'] || {};
		const defaultType = Object.keys(productTypes)[0] || '';
		console.log('ProductField: Creating default value', {
			productTypes,
			defaultType,
			enabled: field.required ? true : false,
		});
		return {
			enabled: field.required ? true : false, // If required, default to enabled
			product_type: defaultType,
		};
	}, [value, field.required, field.props?.['product_types']]);

	// Get validation error from field
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Get product types from field props
	// EXACT Voxel: field.props.product_types - product-field.php line 244-269
	const productTypes = field.props?.['product_types'] || {};
	const productTypeKeys = Object.keys(productTypes);

	// Get selected product type
	const selectedProductType = productValue.product_type || productTypeKeys[0] || '';
	const currentProductTypeConfig = productTypes[selectedProductType];

	// DEBUG: Log product type configuration
	console.log('ProductField: Product Type Config', {
		productTypes,
		productTypeKeys,
		selectedProductType,
		currentProductTypeConfig,
		currentProductTypeConfigFields: currentProductTypeConfig?.fields,
		enabled: productValue.enabled,
	});

	// Handle enable/disable toggle
	const handleEnabledChange = useCallback(() => {
		const newValue = {
			...productValue,
			enabled: !productValue.enabled,
		};
		onChange(newValue);
	}, [productValue, onChange]);

	// Handle product type change
	// EXACT Voxel: set_product_type() - product-field.php line 49
	const handleProductTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value;
		const newValue = {
			...productValue,
			product_type: newType,
		};
		onChange(newValue);
	}, [productValue, onChange]);

	// Handle sub-field value change
	// Normalize key to underscore format for consistent storage (base-price -> base_price)
	const handleSubFieldChange = useCallback((subFieldKey: string, subFieldValue: unknown) => {
		const normalizedKey = subFieldKey.replace(/-/g, '_');
		const newValue = {
			...productValue,
			[normalizedKey]: subFieldValue,
		};
		onChange(newValue);
	}, [productValue, onChange]);

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<div className="form-field-grid">
				{/* Enable/Disable Switcher - EXACT Voxel lines 13-30 (if not required) */}
				{/* Enable/Disable Switcher - EXACT Voxel lines 13-30 (if not required) */}
				{!field.required ? (
					<div className="ts-form-group switcher-label">
						<label>
							<div className="switch-slider">
								<div className="onoffswitch">
									<input
										type="checkbox"
										className="onoffswitch-checkbox"
										checked={productValue.enabled || false}
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
							{field.label}
							{hasError ? (
								<span className="is-required">{displayError}</span>
							) : (
								<span className="is-required">Optional</span>
							)}
							{field.description && (
								<div className="vx-dialog">
									<InfoIcon />
									<div className="vx-dialog-content min-scroll">
										<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
									</div>
								</div>
							)}
						</label>
					</div>
				) : (
					/* If required, always show label and error when present */
					<div className="ts-form-group">
						<label>
							{field.label}
							{hasError && (
								<span className="is-required">{displayError}</span>
							)}
							{field.description && (
								<div className="vx-dialog">
									<InfoIcon />
									<div className="vx-dialog-content min-scroll">
										<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
									</div>
								</div>
							)}
						</label>
					</div>
				)}

				{/* Product Type Selector - EXACT Voxel lines 45-56 */}
				{productValue.enabled && productTypeKeys.length >= 2 && (
					<div className="ts-form-group">
						<label>Product type</label>
						<div className="ts-filter">
							<select
								value={selectedProductType}
								onChange={handleProductTypeChange}
							>
								{productTypeKeys.map(key => {
									const config = productTypes[key];
									return (
										<option key={key} value={key}>
											{config?.label || key}
										</option>
									);
								})}
							</select>
							<div className="ts-down-icon"></div>
						</div>
					</div>
				)}

				{/* Dynamic Sub-fields - EXACT Voxel lines 59-69 */}
				{productValue.enabled && currentProductTypeConfig && (
					<>
						{Object.keys(currentProductTypeConfig.fields || {}).map(subFieldKey => {
							const subField = currentProductTypeConfig.fields[subFieldKey];
							if (!subField) {
								console.log('ProductField: Sub-field is null/undefined', { subFieldKey });
								return null;
							}

							// Get sub-field value from productValue
							// Handle key format mismatch: config may use 'base-price' (hyphen) but stored as 'base_price' (underscore)
							const normalizedKey = subFieldKey.replace(/-/g, '_');
							const subFieldValue = productValue[subFieldKey] ?? productValue[normalizedKey];

							// Render product-specific field components
							// Evidence: themes/voxel/templates/widgets/create-post/product-field/
							const key = `${selectedProductType}:${subFieldKey}`;

							console.log('ProductField: Rendering sub-field', {
								subFieldKey,
								subField,
								subFieldValue,
								key,
							});

							switch (subFieldKey) {
								case 'base-price':
								case 'base_price':
									return (
										<BasePriceField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'stock':
									return (
										<StockField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'shipping':
									return (
										<ShippingField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'subscription-interval':
								case 'subscription_interval':
									return (
										<SubscriptionIntervalField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'deliverables':
									return (
										<DeliverablesField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'custom-prices':
								case 'custom_prices':
									return (
										<CustomPricesField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
											productType={currentProductTypeConfig}
											productFieldValue={productValue}
											productFieldKey={field.key}
										/>
									);

								case 'addons':
									return (
										<AddonsField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'booking':
									return (
										<BookingField
											key={key}
											field={subField}
											value={subFieldValue as BookingFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								case 'variations':
									return (
										<VariationsField
											key={key}
											field={subField}
											value={subFieldValue}
											onChange={(newValue) => handleSubFieldChange(subFieldKey, newValue)}
										/>
									);

								default:
									// Unknown product field type
									return (
										<div key={key} className="ts-form-group">
											<div className="ts-alert ts-warning">
												<i className="las la-exclamation-triangle"></i>
												<p>Product field type "{subFieldKey}" not yet implemented.</p>
											</div>
										</div>
									);
							}
						})}
					</>
				)}
			</div>
		</div>
	);
};

