/**
 * Custom Prices Field Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/custom-prices-field.php
 *
 * Complex draggable repeater field with:
 * - Enable/disable toggle
 * - Draggable list of pricing items (drag-drop reordering)
 * - Each item: collapsible, enable/disable, label, custom pricing
 * - Add/delete functionality
 * - Limit from field.props.limits.custom_prices
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SinglePrice } from './custom-prices/SinglePrice';
import type {
	CustomPricesFieldConfig,
	CustomPricesFieldValue,
	CustomPricingRule,
	ProductTypeField,
		AddonConfig,
} from '../../types';

/**
 * Product type with fields - used for custom prices context
 */
interface ProductType {
	fields?: {
		addons?: {
			props?: {
				addons?: Record<string, AddonConfig> | AddonConfig[];
			};
		};
	};
}

/**
 * Addon choice item for custom-select lists
 */
interface AddonChoiceItem {
	value: string;
	label?: string;
	enabled?: boolean;
}

/**
 * Product field value with addons data
 */
interface ProductFieldValue {
	addons?: Record<string, {
		enabled?: boolean;
		list?: AddonChoiceItem[];
		choices?: Record<string, { enabled?: boolean; price?: number | null }>;
	}>;
}

// SVG Icons - Exact Voxel markup from handle.svg
// @ts-ignore -- unused but kept for future use
const _HandleIcon = () => (
	<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 480" fill="currentColor">
		<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
	</svg>
);

const PlusIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor" />
	</svg>
);

const MinusIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4.875 12C4.875 11.3787 5.37868 10.875 6 10.875H18.0007C18.622 10.875 19.1257 11.3787 19.1257 12C19.1257 12.6213 18.622 13.125 18.0007 13.125H6C5.37868 13.125 4.875 12.6213 4.875 12Z" fill="currentColor" />
	</svg>
);

const TrashIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="currentColor" />
		<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="currentColor" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="currentColor" />
	</svg>
);

const IconInfo = () => (
	<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.5 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm1.5 10.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v6z" fill="currentColor" />
	</svg>
);

// Generate unique ID
const generateUid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create empty pricing rule
const createEmptyPricingRule = (): CustomPricingRule => ({
	_uid: generateUid(),
	enabled: true,
	label: '',
	conditions: [],
	prices: {
		base_price: {
			amount: null,
			discount_amount: null,
		},
		addons: {},
	},
});

interface CustomPricesFieldProps {
	field: ProductTypeField & {
		props: CustomPricesFieldConfig;
	};
	value: CustomPricesFieldValue;
	onChange: (value: CustomPricesFieldValue) => void;
	productType: ProductType;
	productFieldValue: ProductFieldValue;
	productFieldKey: string;
}

// Sortable Pricing Rule Item
interface SortablePricingRuleProps {
	pricing: CustomPricingRule;
	index: number;
	isActive: boolean;
	onToggleActive: () => void;
	onToggleEnabled: () => void;
	onDelete: () => void;
	onUpdate: (updated: CustomPricingRule) => void;
	field: ProductTypeField & { props: CustomPricesFieldConfig };
	productType: ProductType;
	productFieldValue: ProductFieldValue;
}

const SortablePricingRule: React.FC<SortablePricingRuleProps> = ({
	pricing,
	index,
	isActive,
	onToggleActive,
	onToggleEnabled,
	onDelete,
	onUpdate,
	field,
	productType,
	productFieldValue,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: pricing._uid || `pricing-${index}` });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		// Only set opacity when dragging - disabled state handled by CSS class
		...(isDragging && { opacity: 0.5 }),
		pointerEvents: 'all' as const, // Voxel uses this
	};

	// Build class names matching Voxel exactly
	const classNames = ['ts-field-repeater'];
	if (!isActive) classNames.push('collapsed');
	if (!pricing.enabled) classNames.push('disabled');

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={classNames.join(' ')}
		>
			{/* Repeater Head - Click anywhere on head to toggle, drag handle is separate */}
			<div
				className="ts-repeater-head"
				onClick={onToggleActive}
			>
				{/* Drag handle - only this has drag listeners */}
				<svg
					{...attributes}
					{...listeners}
					id="Layer_1"
					data-name="Layer 1"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 288 480"
					fill="currentColor"
					style={{ cursor: 'grab' }}
					onClick={(e) => e.stopPropagation()}
				>
					<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
				</svg>
				<label>{pricing.label || '(untitled)'}</label>
				<div className="ts-repeater-controller">
					{/* Enable/Disable button - Show plus when disabled, minus when enabled */}
					{!pricing.enabled ? (
						<a
							href="#"
							onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleEnabled(); }}
							className="ts-icon-btn ts-smaller no-drag"
							title="Enable pricing rule"
						>
							<PlusIcon />
						</a>
					) : (
						<a
							href="#"
							onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleEnabled(); }}
							className="ts-icon-btn ts-smaller no-drag"
							title="Disable pricing rule"
						>
							<MinusIcon />
						</a>
					)}
					{/* Delete button */}
					<a
						href="#"
						onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
						className="ts-icon-btn ts-smaller no-drag"
						title="Delete pricing rule"
					>
						<TrashIcon />
					</a>
					{/* Expand/Collapse button */}
					<a
						href="#"
						className="ts-icon-btn ts-smaller no-drag"
						onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleActive(); }}
					>
						<ChevronDownIcon />
					</a>
				</div>
			</div>

			{/* Expanded Content - shown when active (disabled state handled by CSS opacity) */}
			{isActive && (
				<div className="form-field-grid medium">
					<SinglePrice
						pricing={pricing}
						onChange={onUpdate}
						field={field}
						productType={productType}
						productFieldValue={productFieldValue}
					/>
				</div>
			)}
		</div>
	);
};

/**
 * Custom Prices Field
 *
 * Allows vendors to create conditional pricing rules based on:
 * - Day of week (weekday checkboxes)
 * - Specific date (single date picker)
 * - Date range (start/end date picker)
 */
export const CustomPricesField: React.FC<CustomPricesFieldProps> = ({
	field,
	value,
	onChange,
	productType,
	productFieldValue,
	productFieldKey: _productFieldKey,
}) => {
	// Track which pricing rule is currently expanded
	const [activeId, setActiveId] = useState<string | null>(null);

	// Initialize value if empty
	const currentValue: CustomPricesFieldValue = useMemo(() => {
		if (!value || typeof value !== 'object') {
			return { enabled: false, list: [] };
		}
		return {
			enabled: value.enabled ?? false,
			list: Array.isArray(value.list) ? value.list.map(item => ({
				...item,
				_uid: item._uid || generateUid(),
			})) : [],
		};
	}, [value]);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Handle drag end
	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = currentValue.list.findIndex(p => p._uid === active.id);
			const newIndex = currentValue.list.findIndex(p => p._uid === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newList = arrayMove(currentValue.list, oldIndex, newIndex);
				onChange({ ...currentValue, list: newList });
			}
		}
	}, [currentValue, onChange]);

	// Toggle master enable/disable
	const handleToggleMaster = useCallback(() => {
		onChange({ ...currentValue, enabled: !currentValue.enabled });
	}, [currentValue, onChange]);

	// Create new pricing rule
	const handleCreatePrice = useCallback(() => {
		const maxPrices = field.props?.limits?.custom_prices ?? 5;
		if (currentValue.list.length >= maxPrices) return;

		const newPricing = createEmptyPricingRule();
		const newList = [...currentValue.list, newPricing];
		onChange({ ...currentValue, list: newList });
		setActiveId(newPricing._uid!);
	}, [currentValue, field.props?.limits?.custom_prices, onChange]);

	// Delete pricing rule
	const handleDeletePrice = useCallback((uid: string) => {
		const newList = currentValue.list.filter(p => p._uid !== uid);
		onChange({ ...currentValue, list: newList });
		if (activeId === uid) {
			setActiveId(null);
		}
	}, [currentValue, activeId, onChange]);

	// Toggle pricing rule enabled state
	const handleToggleEnabled = useCallback((uid: string) => {
		const newList = currentValue.list.map(p =>
			p._uid === uid ? { ...p, enabled: !p.enabled } : p
		);
		onChange({ ...currentValue, list: newList });
	}, [currentValue, onChange]);

	// Toggle active (expanded) pricing rule
	const handleToggleActive = useCallback((uid: string) => {
		setActiveId(prev => prev === uid ? null : uid);
	}, []);

	// Update a specific pricing rule
	const handleUpdatePricing = useCallback((uid: string, updated: CustomPricingRule) => {
		const newList = currentValue.list.map(p =>
			p._uid === uid ? { ...updated, _uid: uid } : p
		);
		onChange({ ...currentValue, list: newList });
	}, [currentValue, onChange]);

	const maxPrices = field.props?.limits?.custom_prices ?? 5;
	const canAddMore = currentValue.list.length < maxPrices;

	return (
		<div className="ts-form-group">
			{/* Master Enable/Disable Toggle - Exact Voxel structure */}
			<div className="ts-form-group switcher-label">
				<label>
					<div className="switch-slider">
						<div className="onoffswitch">
							<input
								type="checkbox"
								className="onoffswitch-checkbox"
								checked={currentValue.enabled}
								onChange={handleToggleMaster}
							/>
							<label
								className="onoffswitch-label"
								onClick={(e) => { e.preventDefault(); handleToggleMaster(); }}
							></label>
						</div>
					</div>
					{field.label || 'Custom prices'}
					{!!(field as any).description && (
						<div className="vx-dialog">
							<IconInfo />
							<div className="vx-dialog-content min-scroll">
								<p dangerouslySetInnerHTML={{ __html: (field as any).description as string }} />
							</div>
						</div>
					)}
				</label>

				{/* Pricing Rules List (shown when enabled) - INSIDE the switcher-label for proper nesting */}
				{currentValue.enabled && (
					<>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={currentValue.list.map(p => p._uid || '')}
								strategy={verticalListSortingStrategy}
							>
								<div className="ts-repeater-container" style={{ marginTop: '15px' }}>
									{currentValue.list.map((pricing, index) => (
										<SortablePricingRule
											key={pricing._uid}
											pricing={pricing}
											index={index}
											isActive={activeId === pricing._uid}
											onToggleActive={() => handleToggleActive(pricing._uid!)}
											onToggleEnabled={() => handleToggleEnabled(pricing._uid!)}
											onDelete={() => handleDeletePrice(pricing._uid!)}
											onUpdate={(updated) => handleUpdatePricing(pricing._uid!, updated)}
											field={field}
											productType={productType}
											productFieldValue={productFieldValue}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>

						{/* Add Pricing Rule Button */}
						{canAddMore && (
							<a
								href="#"
								className="ts-repeater-add ts-btn ts-btn-4 form-btn"
								onClick={(e) => { e.preventDefault(); handleCreatePrice(); }}
							>
								<PlusIcon />
								Create custom pricing
							</a>
						)}

						{/* Limit reached message */}
						{!canAddMore && (
							<p className="ts-form-note">
								Maximum of {maxPrices} custom pricing rules reached.
							</p>
						)}
					</>
				)}
			</div>
		</div>
	);
};
