/**
 * RepeaterControl Component
 *
 * Elementor-style repeater control with drag-and-drop reordering.
 * Supports expandable items, clone, delete, and custom content rendering.
 *
 * Pattern: Matches Voxel/Elementor repeater field behavior
 * - Item titles show "Item #N" for empty items, custom label when configured
 * - Drag-and-drop reordering via @dnd-kit
 * - Clone and delete actions in mini toolbar
 * - Expandable/collapsible items
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState, useCallback } from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Styles
import './RepeaterControl.css';

// Simple UUID generator for item IDs
const generateId = (): string => {
	return 'item_' + Math.random().toString(36).substr(2, 9);
};

// Export for external use (alias for backward compatibility)
export const generateRepeaterId = generateId;

/**
 * Base item interface - items must have an id or _id
 */
export interface RepeaterItem {
	id?: string;
	_id?: string;
	[key: string]: any;
}

const getItemId = (item: RepeaterItem): string => {
	return item.id || item._id || '';
}

/**
 * Props for the sortable item wrapper
 */
interface SortableItemProps<T extends RepeaterItem> {
	item: T;
	index: number;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onUpdate: (updates: Partial<T>) => void;
	onRemove: () => void;
	onClone: () => void;
	getItemLabel: (item: T, index: number) => string;
	renderContent: (props: RepeaterItemRenderProps<T>) => React.ReactNode;
	showClone?: boolean;
	showDelete?: boolean;
}

/**
 * Props passed to the renderContent function
 */
export interface RepeaterItemRenderProps<T extends RepeaterItem> {
	item: T;
	index: number;
	onUpdate: (updates: Partial<T>) => void;
	onRemove: () => void;
}

/**
 * Sortable Item Component
 * Wraps each repeater item with drag-and-drop functionality
 * Header is draggable (Elementor-style) - click to expand, drag to reorder
 */
function SortableItem<T extends RepeaterItem>({
	item,
	index,
	isExpanded,
	onToggleExpand,
	onUpdate,
	onRemove,
	onClone,
	getItemLabel,
	renderContent,
	showClone = true,
	showDelete = true,
}: SortableItemProps<T>) {
	const itemId = getItemId(item);
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: itemId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: 1, // Fixed opacity as requested (removed 0.5 drag opacity)
		zIndex: isDragging ? 1000 : 'auto',
	};

	const itemLabel = getItemLabel(item, index);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`voxel-fse-repeater-item ${isExpanded ? 'is-expanded' : ''} ${isDragging ? 'is-dragging' : ''}`}
		>
			{/* Header is fully draggable (Elementor-style) */}
			<div
				className="voxel-fse-repeater-item-header"
				{...attributes}
				{...listeners}
				onClick={onToggleExpand}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						onToggleExpand();
					}
				}}
			>
				<span className="voxel-fse-repeater-item-label">{itemLabel}</span>

				<span className="voxel-fse-repeater-item-actions">
					{showClone && (
						<button
							type="button"
							className="voxel-fse-repeater-action-btn voxel-fse-repeater-clone"
							onClick={(e) => {
								e.stopPropagation();
								onClone();
							}}
							title={__('Clone', 'voxel-fse')}
						>
							<i className="eicon-copy" />
						</button>
					)}
					{showDelete && (
						<button
							type="button"
							className="voxel-fse-repeater-action-btn voxel-fse-repeater-delete"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
							title={__('Delete', 'voxel-fse')}
						>
							<i className="eicon-close" />
						</button>
					)}
				</span>
			</div>

			{isExpanded && (
				<div className="voxel-fse-repeater-item-content">
					{renderContent({ item, index, onUpdate, onRemove })}
				</div>
			)}
		</div>
	);
}

/**
 * Props for RepeaterControl
 */
export interface RepeaterControlProps<T extends RepeaterItem> {
	/** Label displayed above the repeater */
	label?: string;
	/** Array of items */
	items: T[];
	/** Called when items change (reorder, add, remove, update) */
	onChange: (items: T[]) => void;
	/** Function to get the label for each item */
	getItemLabel?: (item: T, index: number) => string;
	/** Render function for item content when expanded */
	renderContent: (props: RepeaterItemRenderProps<T>) => React.ReactNode;
	/** Factory function to create a new item */
	createItem?: () => T;
	/** Text for add button */
	addButtonText?: string;
	/** Show clone button */
	showClone?: boolean;
	/** Show delete button */
	showDelete?: boolean;
	/** Minimum number of items (prevents deletion below this) */
	minItems?: number;
	/** Maximum number of items (hides add button when reached) */
	maxItems?: number;
	/** Additional CSS class */
	className?: string;
}

/**
 * RepeaterControl Component
 *
 * A reusable Elementor-style repeater field with:
 * - Drag-and-drop reordering
 * - Expandable/collapsible items
 * - Clone and delete actions
 * - Custom item rendering via render prop
 */
export default function RepeaterControl<T extends RepeaterItem>({
	label,
	items,
	onChange,
	getItemLabel,
	renderContent,
	createItem,
	addButtonText = __('Add Item', 'voxel-fse'),
	showClone = true,
	showDelete = true,
	minItems = 0,
	maxItems,
	className = '',
}: RepeaterControlProps<T>) {
	const [expandedItem, setExpandedItem] = useState<string | null>(null);

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

	// Default item label: "Item #N" (1-indexed)
	const defaultGetItemLabel = useCallback(
		(_item: T, index: number) => `Item #${index + 1}`,
		[]
	);

	const itemLabelFn = getItemLabel || defaultGetItemLabel;

	// Default create item function
	// Use _id by default now as preferred by Voxel, but fallback to id logic if needed
	// Actually generateId simple wrapper
	const defaultCreateItem = useCallback(
		() => ({ _id: generateId() } as T),
		[]
	);

	const createItemFn = createItem || defaultCreateItem;

	// Handle drag end for reordering
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			// Find index using getItemId helper on items
			const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
			const newIndex = items.findIndex((item) => getItemId(item) === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				onChange(arrayMove(items, oldIndex, newIndex));
			}
		}
	};

	// Add new item
	const addItem = () => {
		if (maxItems && items.length >= maxItems) return;
		const newItem = createItemFn();
		const newItemId = getItemId(newItem);
		onChange([...items, newItem]);
		// Auto-expand new item
		setExpandedItem(newItemId);
	};

	// Remove item
	const removeItem = (itemId: string) => {
		if (items.length <= minItems) return;
		onChange(items.filter((item) => getItemId(item) !== itemId));
		if (expandedItem === itemId) {
			setExpandedItem(null);
		}
	};

	// Update item
	const updateItem = (itemId: string, updates: Partial<T>) => {
		onChange(
			items.map((item) =>
				getItemId(item) === itemId ? { ...item, ...updates } : item
			)
		);
	};

	// Clone item
	const cloneItem = (item: T, index: number) => {
		if (maxItems && items.length >= maxItems) return;
		// Clone: we need to generate new ID. 
		// We'll create a basic copy and assign new _id or id depending on what's present
		const newItem = { ...item };
		if (newItem._id) newItem._id = generateId();
		else newItem.id = generateId();

		const newItems = [
			...items.slice(0, index + 1),
			newItem,
			...items.slice(index + 1),
		];
		onChange(newItems);
	};

	const itemIds = items.map((item) => getItemId(item));
	const canAdd = !maxItems || items.length < maxItems;
	const canDelete = items.length > minItems;

	return (
		<div className={`voxel-fse-repeater-control ${className}`}>
			{label && (
				<span className="voxel-fse-repeater-label">{label}</span>
			)}

			<div className="voxel-fse-repeater-items">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={itemIds}
						strategy={verticalListSortingStrategy}
					>
						{items.map((item, index) => {
							const itemId = getItemId(item);
							return (
								<SortableItem
									key={itemId}
									item={item}
									index={index}
									isExpanded={expandedItem === itemId}
									onToggleExpand={() =>
										setExpandedItem(
											expandedItem === itemId ? null : itemId
										)
									}
									onUpdate={(updates) => updateItem(itemId, updates)}
									onRemove={() => removeItem(itemId)}
									onClone={() => cloneItem(item, index)}
									getItemLabel={itemLabelFn}
									renderContent={renderContent}
									showClone={showClone && canAdd}
									showDelete={showDelete && canDelete}
								/>
							);
						})}
					</SortableContext>
				</DndContext>

				{canAdd && (
					<Button
						variant="secondary"
						onClick={addItem}
						className="voxel-fse-repeater-add-btn"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
						</svg>
						{addButtonText}
					</Button>
				)}
			</div>
		</div>
	);
}

// Export the generateId utility for consumers
export { generateId };
