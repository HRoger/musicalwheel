/**
 * AttributesManager Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Manages the list of product attributes with drag-and-drop reordering.
 * Each attribute represents a dimension along which products can vary (e.g., Size, Color).
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attributes.php
 * - Lines 52-62: Pre-defined attribute buttons in `flexify simplify-ul attribute-select`
 * - Lines 63-68: Custom attribute button (standalone if no presets)
 * - Label: "Product attributes" with info dialog
 * - Value count in <em> tag: "X values" or "No values"
 * - Controller buttons have no-drag class
 */
import React, { useState } from 'react';
import {
	DndContext,
	closestCenter,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';
import type { ProductAttribute, PresetAttribute, LegacyAttribute } from '../../../types';
import { AttributeRow } from './AttributeRow';

/**
 * Component props interface
 */
interface AttributesManagerProps {
	attributes: ProductAttribute[];
	onChange: (attributes: ProductAttribute[]) => void;
	presetAttributes?: PresetAttribute[]; // Pre-defined attributes from admin (shown as buttons)
	customAttributesEnabled?: boolean; // Whether users can create custom attributes
	existingAttributes?: LegacyAttribute[]; // Legacy: From taxonomy (future enhancement)
	l10n?: {
		attribute?: string;
		add_attribute?: string;
	};
}

/**
 * Generate globally unique ID for attributes
 */
function generateUid(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * AttributesManager Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attributes.php
 */
export const AttributesManager: React.FC<AttributesManagerProps> = ({
	attributes: rawAttributes,
	onChange,
	presetAttributes: rawPresetAttributes = [],
	customAttributesEnabled = true,
	existingAttributes,
	l10n,
}) => {
	// Ensure arrays are actually arrays (backend might return objects)
	const attributes = Array.isArray(rawAttributes) ? rawAttributes : [];
	const presetAttributes = Array.isArray(rawPresetAttributes) ? rawPresetAttributes : [];

	// Track which attribute is currently expanded
	const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);

	/**
	 * Check if a preset attribute is already used
	 * Evidence: Voxel attributes.php:54 - :class="{disabled: isUsed(attribute)}"
	 */
	const isUsed = (preset: PresetAttribute): boolean => {
		return attributes.some(attr => attr.key === preset.key);
	};

	/**
	 * Add a preset attribute to the list
	 * Evidence: Voxel attributes.php:54 - @click.prevent="useAttribute(attribute)"
	 */
	const useAttribute = (preset: PresetAttribute) => {
		if (isUsed(preset)) return;
		if (attributes.length >= 10) {
			console.error('Maximum 10 attributes allowed');
			return;
		}

		const newAttr: ProductAttribute = {
			_uid: generateUid(),
			label: preset.label,
			key: preset.key,
			display_mode: preset.display_mode,
			choices: {}, // Start with empty selection (object for preset type)
			type: 'preset',
		};

		onChange([...attributes, newAttr]);
		setActiveAttributeId(newAttr._uid);
	};

	/**
	 * Handle drag-and-drop reordering
	 */
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = attributes.findIndex(a => a._uid === active.id);
		const newIndex = attributes.findIndex(a => a._uid === over.id);

		const reordered = arrayMove(attributes, oldIndex, newIndex);
		onChange(reordered);
	};

	/**
	 * Add new custom attribute
	 * Max 10 attributes validation (Voxel constraint)
	 */
	const addAttribute = () => {
		if (attributes.length >= 10) {
			console.error('Maximum 10 attributes allowed');
			return;
		}

		const newAttr: ProductAttribute = {
			_uid: generateUid(),
			label: '',
			key: '',
			display_mode: 'dropdown',
			choices: [],
			type: 'custom',
		};

		onChange([...attributes, newAttr]);
		setActiveAttributeId(newAttr._uid);
	};

	/**
	 * Remove attribute by UID
	 */
	const removeAttribute = (uid: string) => {
		onChange(attributes.filter(a => a._uid !== uid));

		if (activeAttributeId === uid) {
			setActiveAttributeId(null);
		}
	};

	/**
	 * Update attribute properties
	 */
	const updateAttribute = (uid: string, updates: Partial<ProductAttribute>) => {
		onChange(attributes.map(a =>
			a._uid === uid ? { ...a, ...updates } : a
		));
	};

	/**
	 * Toggle attribute collapse/expand
	 */
	const toggleAttribute = (uid: string) => {
		setActiveAttributeId(activeAttributeId === uid ? null : uid);
	};

	/**
	 * Get preset for an attribute (used in AttributeEditor for "Select items" UI)
	 */
	const getPreset = (attribute: ProductAttribute): PresetAttribute | undefined => {
		return presetAttributes.find(p => p.key === attribute.key);
	};

	// Check if we have preset attributes to show
	const hasPresetAttributes = presetAttributes.length > 0;

	return (
		<div className="ts-form-group">
			{/* Label with info dialog - matches Voxel attributes.php:7-15 */}
			<label>
				Product attributes
				<div className="vx-dialog">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
						<path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<div className="vx-dialog-content min-scroll">
						<p>Create attributes which are used to generate variations for your product e.g Color, Size etc.</p>
					</div>
				</div>
			</label>

			{/* Drag-and-drop context - matches Voxel attributes.php:16-51 */}
			<DndContext
				onDragEnd={handleDragEnd}
				collisionDetection={closestCenter}
			>
				<SortableContext
					items={attributes.map(a => a._uid)}
					strategy={verticalListSortingStrategy}
				>
					<div className="ts-repeater-container">
						{attributes.map((attribute, index) => (
							<AttributeRow
								key={attribute._uid}
								attribute={attribute}
								index={index}
								isActive={activeAttributeId === attribute._uid}
								onToggle={() => toggleAttribute(attribute._uid)}
								onUpdate={(updates) => updateAttribute(attribute._uid, updates)}
								onRemove={() => removeAttribute(attribute._uid)}
								getPreset={getPreset}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* Attribute buttons - matches Voxel attributes.php:52-68 */}
			{hasPresetAttributes ? (
				/* Pre-defined attributes exist: Show horizontal bar with buttons */
				/* Evidence: Voxel attributes.php:52-62 */
				<div className="flexify simplify-ul attribute-select">
					{presetAttributes.map((preset) => (
						<a
							key={preset.key}
							href="#"
							className={isUsed(preset) ? 'disabled' : ''}
							onClick={(e) => {
								e.preventDefault();
								useAttribute(preset);
							}}
						>
							{preset.label}
						</a>
					))}
					{customAttributesEnabled && (
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								addAttribute();
							}}
						>
							{/* Plus icon - matches Voxel plus.svg */}
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor"/>
							</svg>
							{' '}Add custom attribute
						</a>
					)}
				</div>
			) : customAttributesEnabled ? (
				/* No pre-defined attributes: Show standalone custom attribute button */
				/* Evidence: Voxel attributes.php:63-68 */
				<a
					href="#"
					className="ts-repeater-add ts-btn ts-btn-4 form-btn"
					onClick={(e) => {
						e.preventDefault();
						addAttribute();
					}}
				>
					{/* Plus icon - matches Voxel plus.svg */}
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor"/>
					</svg>
					{' '}Add custom attribute
				</a>
			) : null}
		</div>
	);
};
