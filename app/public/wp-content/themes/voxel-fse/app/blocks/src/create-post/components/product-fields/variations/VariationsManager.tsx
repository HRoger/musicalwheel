/**
 * VariationsManager Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Manages the auto-generated list of product variations.
 * Uses cartesian product algorithm to generate all combinations of attribute choices.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations-field.php:8-97
 * - Conditional rendering: v-if="variationList.length"
 * - Label: field.label || 'Variations' with count
 * - Info dialog: vx-dialog with description
 * - Container: ts-repeater-container
 * - No "Add" button (variations are auto-generated)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProductAttribute, ProductVariation, PresetAttribute, AttributeChoice } from '../../../types';
import { VariationRow } from './VariationRow';

/**
 * Component props interface
 */
interface VariationsManagerProps {
	variations: ProductVariation[];
	attributes: ProductAttribute[];
	presetAttributes?: PresetAttribute[];
	onChange: (variations: ProductVariation[]) => void;
	onVariationChange: (uid: string, updates: Partial<ProductVariation>) => void;
	stockEnabled?: boolean;
	skuEnabled?: boolean;
	discountEnabled?: boolean;
	currency?: string;
	l10n?: {
		variation?: string;
		description?: string;
	};
}

/**
 * Generate globally unique ID for variations
 */
function generateUid(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cartesian product helper
 * Generates all possible combinations from arrays of choices
 */
function cartesian<T>(arrays: T[][]): T[][] {
	if (arrays.length === 0) return [[]];
	const [first, ...rest] = arrays;
	const restProduct = cartesian(rest);
	return first.flatMap(item => restProduct.map(combo => [item, ...combo]));
}

/**
 * VariationsManager Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations-field.php
 */
export const VariationsManager: React.FC<VariationsManagerProps> = ({
	variations: rawVariations,
	attributes: rawAttributes,
	presetAttributes: rawPresetAttributes,
	onChange,
	onVariationChange,
	stockEnabled = false,
	skuEnabled = true, // SKU is typically enabled by default when stock is enabled
	discountEnabled = true,
	currency = '$',
	l10n,
}) => {
	// Ensure arrays are actually arrays (backend might return objects)
	const variations = Array.isArray(rawVariations) ? rawVariations : [];
	const attributes = Array.isArray(rawAttributes) ? rawAttributes : [];
	const presetAttributes = Array.isArray(rawPresetAttributes) ? rawPresetAttributes : [];

	// Track which variation is currently expanded - matches Voxel activeVariation
	const [activeVariationId, setActiveVariationId] = useState<string | null>(null);

	/**
	 * Get the selected choices for an attribute
	 * Handles both custom (array) and preset (object) choice formats
	 */
	const getSelectedChoices = useCallback((attr: ProductAttribute): AttributeChoice[] => {
		// Custom attributes: choices is an array
		if (attr.type === 'custom' || Array.isArray(attr.choices)) {
			return Array.isArray(attr.choices) ? attr.choices : [];
		}

		// Preset attributes: choices is an object { value: boolean }
		// Need to look up full choice info from presetAttributes
		const preset = presetAttributes?.find(p => p.key === attr.key);
		if (!preset) return [];

		const selectedValues = attr.choices as { [key: string]: boolean };
		return (preset.choices || []).filter(choice => selectedValues[choice.value]);
	}, [presetAttributes]);

	/**
	 * Normalize attributes for cartesian product
	 * Returns attributes with their selected choices as arrays
	 */
	const normalizedAttributes = useMemo(() => {
		return (attributes || []).map(attr => ({
			...attr,
			normalizedChoices: getSelectedChoices(attr)
		})).filter(attr => attr.normalizedChoices.length > 0);
	}, [attributes, getSelectedChoices]);

	/**
	 * Cartesian product algorithm
	 * Generates all variations from attribute choices
	 * Preserves existing variation data when regenerating
	 */
	const regenerateVariations = useCallback(() => {
		// Filter out attributes without choices
		const validAttributes = normalizedAttributes;

		if (validAttributes.length === 0) {
			onChange([]);
			return;
		}

		// Calculate total combinations before generating
		const totalCombinations = validAttributes.reduce(
			(acc, attr) => acc * attr.normalizedChoices.length,
			1
		);

		// ACTION-BASED validation: max 100 variations
		if (totalCombinations > 100) {
			console.error('Maximum 100 variations allowed. Current combination would create:', totalCombinations);
			return;
		}

		// Generate all combinations (cartesian product)
		const combinations = cartesian(validAttributes.map(attr => attr.normalizedChoices));

		// Map to variation objects
		const newVariations = combinations.map(combo => {
			// Build attribute map: { size: "small", color: "red" }
			const attributeMap: { [key: string]: string } = {};
			validAttributes.forEach((attr, index) => {
				attributeMap[attr.key] = combo[index].value;
			});

			// Check if this variation already exists
			const existing = variations.find(v =>
				JSON.stringify(v.attributes) === JSON.stringify(attributeMap)
			);

			// Preserve existing variation data if found
			if (existing) {
				return existing;
			}

			// Create new variation
			return {
				_uid: generateUid(),
				label: combo.map(c => c.label).join(' / '),
				attributes: attributeMap,
				enabled: true,
			} as ProductVariation;
		});

		onChange(newVariations);
	}, [normalizedAttributes, variations, onChange]);

	/**
	 * Auto-regenerate when attributes change
	 */
	useEffect(() => {
		regenerateVariations();
	}, [
		JSON.stringify(normalizedAttributes.map(a => ({
			key: a.key,
			choices: a.normalizedChoices.map(c => ({ value: c.value, label: c.label }))
		})))
	]);

	/**
	 * Toggle variation collapse/expand - matches Voxel activeVariation
	 */
	const toggleVariation = (uid: string) => {
		setActiveVariationId(activeVariationId === uid ? null : uid);
	};

	// Only render if there are variations - matches Voxel v-if="variationList.length"
	if (variations.length === 0) {
		return null;
	}

	// Localization strings with defaults
	const variationLabel = l10n?.variation || 'Variations';
	const descriptionText = l10n?.description || 'Product variations are automatically generated based on your attributes.<br><br>An individual variation requires a price to be available for purchase.<br><br>Variations without a price, are automatically disabled upon saving changes';

	return (
		<div className="ts-form-group">
			{/* Label with info dialog - matches Voxel variations-field.php:9-18 */}
			<label>
				{variationLabel} ({variations.length})
				<div className="vx-dialog">
					{/* Info icon - matches Voxel icon-info */}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
						<path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<div className="vx-dialog-content min-scroll">
						<p dangerouslySetInnerHTML={{ __html: descriptionText }}></p>
					</div>
				</div>
			</label>

			{/* Variations container - matches Voxel variations-field.php:20-96 */}
			<div className="ts-repeater-container">
				{variations.map((variation) => (
					<VariationRow
						key={variation._uid}
						variation={variation}
						isActive={activeVariationId === variation._uid}
						stockEnabled={stockEnabled}
						skuEnabled={skuEnabled}
						discountEnabled={discountEnabled}
						currency={currency}
						attributes={attributes}
						allVariations={variations}
						onToggle={() => toggleVariation(variation._uid)}
						onUpdate={(updates) => onVariationChange(variation._uid, updates)}
						onToggleEnabled={(enabled) => onVariationChange(variation._uid, { enabled })}
					/>
				))}
			</div>
		</div>
	);
};
