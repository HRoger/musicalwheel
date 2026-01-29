/**
 * ChoicesManager Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Manages the list of choices for a single attribute with drag-and-drop reordering.
 * Nested component within AttributeEditor.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php:31-88
 * - Add button: "Add value" with form-btn class
 * - Choice rows default to collapsed
 * - Uses draggable container
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
import type { AttributeChoice, AttributeDisplayMode } from '../../../types';
import { ChoiceRow } from './ChoiceRow';

/**
 * Component props interface
 */
interface ChoicesManagerProps {
	choices: AttributeChoice[];
	displayMode: AttributeDisplayMode;
	onChange: (choices: AttributeChoice[]) => void;
}

/**
 * Generate globally unique ID for choices
 */
function generateUid(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ChoicesManager Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php
 */
export const ChoicesManager: React.FC<ChoicesManagerProps> = ({
	choices: rawChoices,
	displayMode,
	onChange,
}) => {
	// Ensure choices is an array (backend might return objects)
	const choices = Array.isArray(rawChoices) ? rawChoices : [];

	// Track which choice is currently expanded - matches Voxel activeChoice
	const [activeChoiceId, setActiveChoiceId] = useState<string | null>(null);

	/**
	 * Handle drag-and-drop reordering
	 */
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = choices.findIndex(c => c._uid === active.id);
		const newIndex = choices.findIndex(c => c._uid === over.id);

		onChange(arrayMove(choices, oldIndex, newIndex));
	};

	/**
	 * Add new choice - matches Voxel createChoice
	 */
	const addChoice = () => {
		const newChoice: AttributeChoice = {
			_uid: generateUid(),
			label: '',
			value: '',
		};

		onChange([...choices, newChoice]);
		// Auto-expand new choice
		setActiveChoiceId(newChoice._uid);
	};

	/**
	 * Remove choice by UID
	 */
	const removeChoice = (uid: string) => {
		onChange(choices.filter(c => c._uid !== uid));

		if (activeChoiceId === uid) {
			setActiveChoiceId(null);
		}
	};

	/**
	 * Update choice properties
	 */
	const updateChoice = (uid: string, updates: Partial<AttributeChoice>) => {
		onChange(choices.map(c =>
			c._uid === uid ? { ...c, ...updates } : c
		));
	};

	/**
	 * Toggle choice collapse/expand
	 */
	const toggleChoice = (uid: string) => {
		setActiveChoiceId(activeChoiceId === uid ? null : uid);
	};

	// Determine which optional fields to show based on display mode
	const needsColor = displayMode === 'colors';
	const needsSubheading = displayMode === 'cards';
	const needsImage = displayMode === 'cards' || displayMode === 'images';

	return (
		<>
			{/* Drag-and-drop context - matches Voxel attribute.php:32-83 */}
			<DndContext
				onDragEnd={handleDragEnd}
				collisionDetection={closestCenter}
			>
				<SortableContext
					items={choices.map(c => c._uid)}
					strategy={verticalListSortingStrategy}
				>
					<div className="ts-repeater-container">
						{choices.map((choice, index) => (
							<ChoiceRow
								key={choice._uid}
								choice={choice}
								displayMode={displayMode}
								isActive={activeChoiceId === choice._uid}
								needsColor={needsColor}
								needsSubheading={needsSubheading}
								needsImage={needsImage}
								onToggle={() => toggleChoice(choice._uid)}
								onUpdate={(updates) => updateChoice(choice._uid, updates)}
								onRemove={() => removeChoice(choice._uid)}
								onCreateNext={addChoice}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* Add choice button - matches Voxel attribute.php:85-88 */}
			<a
				href="#"
				className="ts-repeater-add ts-btn ts-btn-4 form-btn"
				onClick={(e) => {
					e.preventDefault();
					addChoice();
				}}
			>
				{/* Plus icon - matches Voxel plus.svg */}
				<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor"/>
				</svg>
				{' '}Add value
			</a>
		</>
	);
};
