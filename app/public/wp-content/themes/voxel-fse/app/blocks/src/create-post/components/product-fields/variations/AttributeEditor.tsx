/**
 * AttributeEditor Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Configuration form for a single attribute.
 * Handles both custom attributes (full editing UI) and preset attributes (select items checklist).
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php
 * - Lines 8-89: Custom attribute UI (v-if="attribute.type === 'custom'")
 *   - Label field, Display mode selector, Values (draggable choices)
 * - Lines 91-117: Preset attribute UI (v-else)
 *   - "Select items" checklist with checkboxes
 *   - Uses attribute.choices as object { value: boolean }
 */
import React from 'react';
import type { ProductAttribute, AttributeDisplayMode, PresetAttribute, AttributeChoice } from '../../../types';
import { ChoicesManager } from './ChoicesManager';

/**
 * Component props interface
 */
interface AttributeEditorProps {
	attribute: ProductAttribute;
	onUpdate: (updates: Partial<ProductAttribute>) => void;
	preset?: PresetAttribute;
}

/**
 * AttributeEditor Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php
 */
export const AttributeEditor: React.FC<AttributeEditorProps> = ({
	attribute,
	onUpdate,
	preset,
}) => {
	// Determine if this is a custom or preset attribute
	const isCustom = attribute.type === 'custom' || !preset;

	/**
	 * Handle attribute label change (custom only)
	 * Auto-generates key (slug) from label
	 */
	const handleLabelChange = (label: string) => {
		const key = label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

		onUpdate({ label, key });
	};

	/**
	 * Handle display mode change (custom only)
	 */
	const handleDisplayModeChange = (display_mode: AttributeDisplayMode) => {
		onUpdate({ display_mode });
	};

	/**
	 * Handle choices array change (custom only)
	 */
	const handleChoicesChange = (choices: AttributeChoice[]) => {
		onUpdate({ choices });
	};

	/**
	 * Toggle preset choice selection
	 * Choices for preset attributes are stored as object { value: boolean }
	 * Evidence: attribute.php:97-104 - attribute.choices[choice.value]
	 */
	const toggleChoice = (choice: AttributeChoice) => {
		// Get current choices object (or initialize empty)
		const currentChoices = (attribute.choices && typeof attribute.choices === 'object' && !Array.isArray(attribute.choices))
			? attribute.choices as { [key: string]: boolean }
			: {};

		// Toggle the choice
		const newChoices = {
			...currentChoices,
			[choice.value]: !currentChoices[choice.value]
		};

		onUpdate({ choices: newChoices });
	};

	/**
	 * Check if a preset choice is selected
	 */
	const isChoiceSelected = (choice: AttributeChoice): boolean => {
		if (!attribute.choices || Array.isArray(attribute.choices)) return false;
		return !!(attribute.choices as { [key: string]: boolean })[choice.value];
	};

	return (
		<div className="ts-form-group _variation-box">
			{/* Grid layout - matches Voxel attribute.php:7 */}
			<div className="medium form-field-grid">

				{isCustom ? (
					<>
						{/* Custom attribute UI - matches Voxel attribute.php:8-89 */}

						{/* Label field - matches Voxel attribute.php:10-15 */}
						<div className="ts-form-group ts-attribute-label vx-1-2">
							<label>Label</label>
							<div className="input-container">
								<input
									type="text"
									value={attribute.label}
									onChange={(e) => handleLabelChange(e.target.value)}
									className="ts-filter"
								/>
							</div>
						</div>

						{/* Display mode selector - matches Voxel attribute.php:16-29 */}
						<div className="ts-form-group vx-1-2">
							<label>Display mode</label>
							<div className="ts-filter">
								<select
									value={attribute.display_mode}
									onChange={(e) => handleDisplayModeChange(e.target.value as AttributeDisplayMode)}
								>
									<option value="dropdown">Dropdown</option>
									<option value="buttons">Buttons</option>
									<option value="radio">Radio</option>
									<option value="colors">Colors</option>
									<option value="cards">Cards</option>
									<option value="images">Images</option>
								</select>
								<div className="ts-down-icon"></div>
							</div>
						</div>

						{/* Values section - matches Voxel attribute.php:30-89 */}
						<div className="ts-form-group vx-1-1">
							<label>Values</label>
							<ChoicesManager
								choices={Array.isArray(attribute.choices) ? attribute.choices : []}
								displayMode={attribute.display_mode}
								onChange={handleChoicesChange}
							/>
						</div>
					</>
				) : (
					<>
						{/* Preset attribute UI - matches Voxel attribute.php:91-117 */}

						{/* Select items checklist */}
						<div className="ts-form-group vx-1-1">
							<label>Select items</label>
							<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown inline-multilevel min-scroll">
								<ul className="simplify-ul ts-term-dropdown-list">
									{(preset?.choices || []).map((choice) => (
										<li
											key={choice.value}
											className={isChoiceSelected(choice) ? 'ts-selected' : ''}
										>
											<a
												href="#"
												className="flexify"
												onClick={(e) => {
													e.preventDefault();
													toggleChoice(choice);
												}}
											>
												<div className="ts-checkbox-container">
													<label className="container-checkbox">
														<input
															type="checkbox"
															value={choice.value}
															checked={isChoiceSelected(choice)}
															disabled
															hidden
														/>
														<span className="checkmark"></span>
													</label>
												</div>
												<span>{choice.label}</span>
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
					</>
				)}

			</div>
		</div>
	);
};
