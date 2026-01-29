/**
 * CustomSelectAddon Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Custom select addon type where vendors can define their own choices.
 * Supports drag-drop reordering, delete, and various display modes.
 * Used for things like "Extras" or "Add-ons" with vendor-defined options.
 *
 * Note: Also used for custom-multiselect (same template, different frontend behavior)
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/custom-select.php
 * - Draggable list of vendor-created choices
 * - Per-choice: label, price, optional subheading/image, quantity settings
 * - Add choice button
 * - Delete button for each choice
 * - Display modes affect which fields show
 *
 * Backend: themes/voxel/app/product-types/product-addons/custom-select-addon.php
 */
import React, { useState, useEffect, useRef } from 'react';
import {
	DndContext,
	closestCenter,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	arrayMove,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AddonConfig, CustomSelectAddonValue, CustomSelectChoiceWithId, AddonDisplayMode } from '../../../types';
import { AddonWrapper } from './AddonWrapper';
import { InfoIcon } from '../../icons/InfoIcon';

/**
 * Component props interface
 */
interface CustomSelectAddonProps {
	addon: AddonConfig;
	value: CustomSelectAddonValue | undefined;
	onChange: (value: CustomSelectAddonValue) => void;
}

/**
 * Generate unique ID for choices
 */
function generateUid(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format currency
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
	return `${currency}${amount.toFixed(2)}`;
}

/**
 * Get default value for custom select addon
 */
function getDefaultValue(): CustomSelectAddonValue {
	return {
		enabled: false,
		choices: {},
	};
}

/**
 * Convert choices object to array with UIDs for drag-drop
 */
function choicesToArray(choices: CustomSelectAddonValue['choices'] | undefined): CustomSelectChoiceWithId[] {
	if (!choices || typeof choices !== 'object') return [];
	return Object.entries(choices).map(([value, data]) => ({
		_uid: generateUid(),
		value,
		...data,
	}));
}

/**
 * Convert choices array back to object for storage
 */
function arrayToChoices(choicesArray: CustomSelectChoiceWithId[]): CustomSelectAddonValue['choices'] {
	const result: CustomSelectAddonValue['choices'] = {};
	choicesArray.forEach(choice => {
		result[choice.value] = {
			price: choice.price,
			quantity: choice.quantity,
			image: choice.image,
			subheading: choice.subheading,
		};
	});
	return result;
}

/**
 * SortableChoiceRow Component
 * Individual draggable choice row
 */
interface SortableChoiceRowProps {
	choice: CustomSelectChoiceWithId;
	isActive: boolean;
	displayMode: AddonDisplayMode;
	currency: string;
	onToggle: () => void;
	onUpdate: (updates: Partial<CustomSelectChoiceWithId>) => void;
	onDelete: () => void;
}

const SortableChoiceRow: React.FC<SortableChoiceRowProps> = ({
	choice,
	isActive,
	displayMode,
	currency,
	onToggle,
	onUpdate,
	onDelete,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: choice._uid });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const hasPrice = typeof choice.price === 'number';

	// Determine which optional fields to show based on display_mode
	const showSubheading = displayMode === 'cards';
	const showImage = displayMode === 'cards' || displayMode === 'images';
	const showQuantity = ['cards', 'radio', 'checkboxes'].includes(displayMode);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`ts-field-repeater ${isActive ? '' : 'collapsed'}`}
		>
			{/* Choice header - matches Voxel custom-select.php:45-65 */}
			<div className="ts-repeater-head" onClick={onToggle}>
				{/* Drag handle icon - matches Voxel handle.svg */}
				<svg
					{...attributes}
					{...listeners}
					id="Layer_1"
					data-name="Layer 1"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 288 480"
					style={{ cursor: 'grab' }}
				>
					<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
				</svg>

				{/* Choice label */}
				<label>{choice.value || 'Untitled'}</label>

				{/* Price display - matches Voxel custom-select.php:51-56 */}
				{hasPrice ? (
					<em>{formatCurrency(choice.price!, currency)}</em>
				) : (
					<em>No price added</em>
				)}

				{/* Controller - matches Voxel custom-select.php:57-64 */}
				<div className="ts-repeater-controller">
					{/* Delete button */}
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onDelete();
						}}
						className="ts-icon-btn ts-smaller no-drag"
					>
						{/* Trash icon - matches Voxel trash-can.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54" />
							<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54" />
						</svg>
					</a>

					{/* Chevron icon */}
					<a
						href="#"
						className="ts-icon-btn ts-smaller no-drag"
						onClick={(e) => e.preventDefault()}
					>
						{/* Chevron down icon - matches Voxel chevron-down.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="#343C54" />
						</svg>
					</a>
				</div>
			</div>

			{/* Expanded content - matches Voxel custom-select.php:67-122 */}
			{isActive && (
				<div className="medium form-field-grid">
					{/* Label field - matches Voxel custom-select.php:68-73 */}
					<div className="ts-form-group ts-choice-label vx-1-2">
						<label>Label</label>
						<div className="input-container">
							<input
								type="text"
								className="ts-filter"
								value={choice.value}
								onChange={(e) => onUpdate({ value: e.target.value })}
							/>
						</div>
					</div>

					{/* Price field - matches Voxel custom-select.php:74-80 */}
					<div className="ts-form-group vx-1-2">
						<label>Price</label>
						<div className="input-container">
							<input
								type="number"
								className="ts-filter"
								value={choice.price ?? ''}
								onChange={(e) => {
									const price = e.target.value === '' ? null : parseFloat(e.target.value);
									onUpdate({ price: isNaN(price as number) ? null : price });
								}}
								min="0"
								placeholder="Add price"
							/>
							<span className="input-suffix">{currency}</span>
						</div>
					</div>

					{/* Subheading field - cards mode only - matches Voxel custom-select.php:81-86 */}
					{showSubheading && (
						<div className="ts-form-group">
							<label>Subheading</label>
							<div className="input-container">
								<input
									type="text"
									className="ts-filter"
									value={choice.subheading || ''}
									onChange={(e) => onUpdate({ subheading: e.target.value })}
								/>
							</div>
						</div>
					)}

					{/* Image field - cards/images mode - matches Voxel custom-select.php:87-92 */}
					{showImage && (
						<div className="ts-form-group">
							<label>Image</label>
							<div className="ts-alert ts-info" style={{ fontSize: '0.85em' }}>
								Image upload for addons will be available in a future update.
							</div>
						</div>
					)}

					{/* Quantity settings - cards/radio/checkboxes mode - matches Voxel custom-select.php:93-121 */}
					{showQuantity && (
						<div className="ts-form-group vx-1-1 switcher-label">
							<label>
								<div className="switch-slider">
									<div className="onoffswitch">
										<input
											type="checkbox"
											className="onoffswitch-checkbox"
											checked={choice.quantity?.enabled || false}
											onChange={(e) => onUpdate({
												quantity: {
													...choice.quantity,
													enabled: e.target.checked,
													min: choice.quantity?.min ?? null,
													max: choice.quantity?.max ?? null,
												}
											})}
										/>
										<label
											className="onoffswitch-label"
											onClick={(e) => {
												e.preventDefault();
												onUpdate({
													quantity: {
														...choice.quantity,
														enabled: !choice.quantity?.enabled,
														min: choice.quantity?.min ?? null,
														max: choice.quantity?.max ?? null,
													}
												});
											}}
										></label>
									</div>
								</div>
								Sold in bulk
								<div className="vx-dialog">
									<InfoIcon />
									<div className="vx-dialog-content min-scroll">
										<p>Multiple units of this item can be purchased in the same order</p>
									</div>
								</div>
							</label>

							{/* Min/Max fields when quantity is enabled */}
							{choice.quantity?.enabled && (
								<div className="ts-field-repeater">
									<div className="medium form-field-grid">
										<div className="ts-form-group vx-1-2">
											<label>Minimum</label>
											<input
												type="number"
												className="ts-filter"
												value={choice.quantity?.min ?? ''}
												onChange={(e) => {
													const min = e.target.value === '' ? null : parseInt(e.target.value);
													onUpdate({
														quantity: {
															...choice.quantity!,
															min: isNaN(min as number) ? null : min,
														}
													});
												}}
												min="0"
												placeholder="Min"
											/>
										</div>
										<div className="ts-form-group vx-1-2">
											<label>Maximum</label>
											<input
												type="number"
												className="ts-filter"
												value={choice.quantity?.max ?? ''}
												onChange={(e) => {
													const max = e.target.value === '' ? null : parseInt(e.target.value);
													onUpdate({
														quantity: {
															...choice.quantity!,
															max: isNaN(max as number) ? null : max,
														}
													});
												}}
												min="0"
												placeholder="Max"
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

/**
 * CustomSelectAddon Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/custom-select.php
 */
export const CustomSelectAddon: React.FC<CustomSelectAddonProps> = ({
	addon,
	value,
	onChange,
}) => {
	// Get currency from global config (default to USD if not set)
	const currency = (window as any).Voxel_Config?.['currency'] || 'USD';

	// Get display mode from addon config
	const displayMode: AddonDisplayMode = addon.props?.display_mode || 'dropdown';

	// Ensure we have a value object
	const currentValue = value || getDefaultValue();

	// Convert choices to array format for drag-drop
	const [choicesArray, setChoicesArray] = useState<CustomSelectChoiceWithId[]>(() =>
		choicesToArray(currentValue.choices)
	);

	// Track if we're making a local update (to prevent infinite loops)
	const isLocalUpdate = useRef(false);

	// Track if we've done initial sync from props
	const hasInitialized = useRef(false);

	// CRITICAL FIX: Only sync from props on initial mount or when data is clearly
	// loaded from the server (has non-empty choices that don't exist locally).
	// After that, local state is the source of truth.
	useEffect(() => {
		// Skip sync if this is our own local update
		if (isLocalUpdate.current) {
			isLocalUpdate.current = false;
			return;
		}

		const propChoices = value?.choices || {};
		const propKeys = Object.keys(propChoices);

		// Only sync on initial mount when we have prop data but no local data yet
		if (!hasInitialized.current && propKeys.length > 0) {
			const newArray = choicesToArray(propChoices);
			setChoicesArray(newArray);
			hasInitialized.current = true;
			return;
		}

		// Mark as initialized even if props are empty
		if (!hasInitialized.current) {
			hasInitialized.current = true;
		}

		// After initialization, only sync if props have NEW choices that we
		// don't have locally (e.g., data loaded from server after component mounted)
		// This preserves local edits while allowing server data to be loaded
		const localKeys = new Set(choicesArray.map(c => c.value).filter(v => v !== ''));
		const newPropsKeys = propKeys.filter(k => k !== '' && !localKeys.has(k));

		if (newPropsKeys.length > 0) {
			// Preserve existing local choices, add new ones from props
			const newChoicesFromProps = newPropsKeys.map(key => ({
				_uid: generateUid(),
				value: key,
				...propChoices[key],
			}));
			setChoicesArray(prev => [...prev, ...newChoicesFromProps]);
		}
	}, [value?.choices]);

	// Track which choice is currently expanded
	const [activeChoiceId, setActiveChoiceId] = useState<string | null>(null);

	// Handle enabled toggle
	const handleToggleEnabled = (enabled: boolean) => {
		onChange({
			...currentValue,
			enabled,
		});
	};

	// Handle drag end
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = choicesArray.findIndex(c => c._uid === active.id);
		const newIndex = choicesArray.findIndex(c => c._uid === over.id);

		const newArray = arrayMove(choicesArray, oldIndex, newIndex);
		setChoicesArray(newArray);
		isLocalUpdate.current = true;
		onChange({
			...currentValue,
			choices: arrayToChoices(newArray),
		});
	};

	// Add new choice
	const addChoice = () => {
		const newChoice: CustomSelectChoiceWithId = {
			_uid: generateUid(),
			value: '',
			price: null,
			quantity: {
				enabled: false,
				min: null,
				max: null,
			},
		};

		const newArray = [...choicesArray, newChoice];
		setChoicesArray(newArray);
		isLocalUpdate.current = true;
		onChange({
			...currentValue,
			choices: arrayToChoices(newArray),
		});

		// Auto-expand new choice
		setActiveChoiceId(newChoice._uid);
	};

	// Delete choice
	const deleteChoice = (uid: string) => {
		const newArray = choicesArray.filter(c => c._uid !== uid);
		setChoicesArray(newArray);
		isLocalUpdate.current = true;
		onChange({
			...currentValue,
			choices: arrayToChoices(newArray),
		});

		if (activeChoiceId === uid) {
			setActiveChoiceId(null);
		}
	};

	// Update choice
	const updateChoice = (uid: string, updates: Partial<CustomSelectChoiceWithId>) => {
		const newArray = choicesArray.map(c =>
			c._uid === uid ? { ...c, ...updates } : c
		);
		setChoicesArray(newArray);
		isLocalUpdate.current = true;

		onChange({
			...currentValue,
			choices: arrayToChoices(newArray),
		});
	};

	// Toggle choice expansion
	const toggleChoice = (uid: string) => {
		setActiveChoiceId(activeChoiceId === uid ? null : uid);
	};

	// Determine if addon is enabled (required addons are always enabled)
	const isEnabled = addon.required || currentValue.enabled === true;

	return (
		<AddonWrapper
			addon={addon}
			enabled={isEnabled}
			onToggleEnabled={handleToggleEnabled}
		>
			{/* Draggable choices container - matches Voxel custom-select.php:36-125 */}
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={choicesArray.map(c => c._uid)}
					strategy={verticalListSortingStrategy}
				>
					<div className="ts-repeater-container">
						{choicesArray.map((choice) => (
							<SortableChoiceRow
								key={choice._uid}
								choice={choice}
								isActive={activeChoiceId === choice._uid}
								displayMode={displayMode as AddonDisplayMode}
								currency={currency}
								onToggle={() => toggleChoice(choice._uid)}
								onUpdate={(updates) => updateChoice(choice._uid, updates)}
								onDelete={() => deleteChoice(choice._uid)}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* Add option button - matches Voxel custom-select.php:127-130 */}
			<a
				href="#"
				onClick={(e) => {
					e.preventDefault();
					addChoice();
				}}
				className="ts-repeater-add ts-btn ts-btn-4 form-btn"
			>
				{/* Plus icon - matches Voxel plus.svg */}
				<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#343C54" />
				</svg>
				Add option
			</a>
		</AddonWrapper>
	);
};
