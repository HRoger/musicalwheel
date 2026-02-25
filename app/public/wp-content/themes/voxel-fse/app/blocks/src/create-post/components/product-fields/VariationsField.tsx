/**
 * VariationsField Component
 * Phase 2: Complete implementation with AttributesManager + VariationsManager integration
 *
 * Main container for product variations management.
 * Allows users to configure attributes (Size, Color, etc.) and automatically generates
 * all possible variations using cartesian product algorithm.
 *
 * Features:
 * - Attribute management (add/remove/reorder attributes and choices)
 * - Automatic variation generation (cartesian product)
 * - Variation management (enable/disable, delete, reorder)
 * - Max constraints (10 attributes, 100 variations)
 * - Data preservation during regeneration
 *
 * Future Phases:
 * - Phase 3: Per-variation pricing, images, stock configuration
 * - Phase 4: Advanced display modes (colors, images) and bulk operations
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations-field.php
 */
import React, { useCallback, useMemo } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { AttributesManager } from './variations/AttributesManager';
import { VariationsManager } from './variations/VariationsManager';
import type { ProductAttribute, ProductVariation, VariationsFieldConfig } from '../../types';

/**
 * Variations field value structure
 */
interface VariationsFieldValue {
	attributeList: ProductAttribute[];
	variations: ProductVariation[];
}

/**
 * Component props interface
 */
interface VariationsFieldProps {
	field: VoxelField;
	value: VariationsFieldValue | null;
	onChange: (value: VariationsFieldValue) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
	postTypeKey?: string;
}

/**
 * VariationsField Component
 */
export const VariationsField: React.FC<VariationsFieldProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons: _icons,
	postTypeKey: _postTypeKey
}) => {
	// Parse field config from props
	const config: VariationsFieldConfig = (field.props as VariationsFieldConfig | undefined) || {
		attributeList: [],
		variations: [],
		l10n: {}
	};

	/**
	 * Normalize value to config structure
	 * Handles both object format and null/undefined values
	 */
	const variationsValue = useMemo(() => {
		if (typeof value === 'object' && value !== null) {
			return {
				attributeList: value.attributeList || config.attributeList || [],
				variations: value.variations || config.variations || []
			};
		}
		return {
			attributeList: config.attributeList || [],
			variations: config.variations || []
		};
	}, [value, config]);

	/**
	 * Handle attribute list changes
	 * Triggers variation regeneration through VariationsManager
	 */
	const handleAttributesChange = useCallback((newAttributes: ProductAttribute[]) => {
		const newValue = {
			...variationsValue,
			attributeList: newAttributes
		};
		onChange(newValue);

		// Trigger blur for validation
		if (onBlur) {
			onBlur();
		}
	}, [variationsValue, onChange, onBlur]);

	/**
	 * Handle variations list changes
	 * Used for reordering, deleting variations
	 */
	const handleVariationsChange = useCallback((newVariations: ProductVariation[]) => {
		const newValue = {
			...variationsValue,
			variations: newVariations
		};
		onChange(newValue);

		// Trigger blur for validation
		if (onBlur) {
			onBlur();
		}
	}, [variationsValue, onChange, onBlur]);

	/**
	 * Handle single variation update
	 * Used for enable/disable, price changes, etc.
	 */
	const handleVariationUpdate = useCallback((uid: string, updates: Partial<ProductVariation>) => {
		const newVariations = variationsValue.variations.map(v =>
			v._uid === uid ? { ...v, ...updates } : v
		);
		handleVariationsChange(newVariations);
	}, [variationsValue.variations, handleVariationsChange]);

	return (
		<>
			{/* Attributes Manager - matches Voxel variations-field.php:6 */}
			<AttributesManager
				attributes={variationsValue.attributeList}
				onChange={handleAttributesChange}
				presetAttributes={config.attributes}
				customAttributesEnabled={config.custom_attributes?.enabled ?? true}
				existingAttributes={config.existingAttributes}
				l10n={config.l10n}
			/>

			{/* Variations Manager - matches Voxel variations-field.php:8-97 */}
			<VariationsManager
				variations={variationsValue.variations}
				attributes={variationsValue.attributeList}
				presetAttributes={config.attributes}
				onChange={handleVariationsChange}
				onVariationChange={handleVariationUpdate}
				stockEnabled={config.stock?.enabled ?? false}
				skuEnabled={config.sku?.enabled ?? true}
				discountEnabled={config.discount_price?.enabled ?? true}
				currency={config.currency || '$'}
				l10n={config.l10n}
			/>
		</>
	);
};
