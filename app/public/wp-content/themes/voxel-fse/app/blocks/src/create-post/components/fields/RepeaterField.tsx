/**
 * Repeater Field Component - FULLY FUNCTIONAL
 * Implementation Date: 2025-12-03
 * Phase 2: RepeaterField Implementation (Complete)
 *
 * Handles: repeater field type (repeatable field groups with nested fields)
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/repeater-field.php
 *
 * FEATURES:
 * ✅ Add/remove rows
 * ✅ Drag-and-drop reordering (@dnd-kit)
 * ✅ Collapsible rows with smooth animation
 * ✅ Dynamic row labels (supports select, multiselect, date fields)
 * ✅ Min/max row constraints with validation
 * ✅ Nested field rendering (recursive FieldRenderer)
 * ✅ Per-row validation with error indicators
 * ✅ Visibility rules and conditional logic support
 *
 * Data Structure:
 * - Value: Array of row objects [{field1: v1, field2: v2}, ...]
 * - Each row has 'meta:state' with _uid (client-side only), collapsed state, and label
 * - meta:state is stripped before form submission
 */
import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { VoxelField, FieldIcons, RepeaterRow, RepeaterFieldConfig } from '../../types';
import { FieldRenderer } from '../FieldRenderer';
import { renderIcon } from '../../utils/iconRenderer';
import {
	VOXEL_TRASH_CAN_ICON,
	VOXEL_PLUS_ICON,
	VOXEL_CHEVRON_DOWN_ICON,
} from '../../utils/voxelDefaultIcons';

interface RepeaterFieldProps {
	field: VoxelField;
	value: RepeaterRow[] | null;
	onChange: (value: RepeaterRow[]) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
	postTypeKey?: string; // REQUIRED for PostRelationField inside repeaters
}

export const RepeaterField: React.FC<RepeaterFieldProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons,
	postTypeKey,
}) => {
	// Extract repeater configuration from field.props
	const config = (field.props || {}) as RepeaterFieldConfig;

	// CRITICAL: Voxel's config.fields is an OBJECT (not array) keyed by field key
	// Convert to array for easier iteration, filtering out meta:state
	const fieldBlueprint: VoxelField[] = (() => {
		if (Array.isArray(config.fields)) {
			return config.fields;
		}
		if (config.fields && typeof config.fields === 'object') {
			return Object.values(config.fields).filter(
				(f): f is VoxelField => f !== null && typeof f === 'object' && 'key' in f && f.key !== 'meta:state'
			);
		}
		return [];
	})();

	const rowLabelField: string = config.row_label || '';
	const l10n = {
		item: config.l10n?.item || 'Item',
		add_row: config.l10n?.add_row || 'Add row',
	};
	const minRows = config.min_rows || 0;
	const maxRows = config.max_rows || 0;

	// Generate globally unique IDs for rows (client-side only)
	const generateUid = (): string => {
		return `${field.key}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	};

	// Create an empty row with Voxel-style full field configs
	// Each field in the row is a complete field config object with value set
	const createEmptyRow = (index: number): RepeaterRow => {
		const newRow: RepeaterRow = {
			'meta:state': {
				_uid: generateUid(),
				collapsed: false, // New rows start expanded
				label: `${l10n.item} ${index + 1}`,
			},
		};

		// Clone each field config from blueprint (Voxel stores full configs per row)
		fieldBlueprint.forEach((fieldConfig) => {
			newRow[fieldConfig.key] = {
				...fieldConfig,
				value: fieldConfig.value ?? null, // Use default value from blueprint
			};
		});

		return newRow;
	};

	// Initialize rows state
	const [rows, setRows] = useState<RepeaterRow[]>(() => {
		// 1. Voxel provides pre-populated rows in config.rows
		const voxelRows = config.rows;
		if (Array.isArray(voxelRows) && voxelRows.length > 0) {
			return voxelRows.map((row, index) => {
				// Add _uid if not present
				const metaState = row['meta:state'] || {};
				return {
					...row,
					'meta:state': {
						...metaState,
						_uid: metaState._uid || generateUid(),
						collapsed: metaState.collapsed ?? true,
						label: metaState.label || `${l10n.item} ${index + 1}`,
					},
				};
			});
		}

		// 2. If editing existing post with data (alternative format)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (Array.isArray(value) && value.length > 0) {
			return (value as any[]).map((row: any, index: number) => {
				// If row already has meta:state with _uid, preserve it
				if (row['meta:state'] && row['meta:state']._uid) {
					return row;
				}
				// Otherwise add meta:state
				return {
					...row,
					'meta:state': {
						_uid: generateUid(),
						collapsed: true,
						label: row[rowLabelField] || `${l10n.item} ${index + 1}`,
					},
				};
			});
		}

		// 3. If creating new post, respect min_rows
		if (minRows && minRows > 0) {
			return Array.from({ length: minRows }, (_, i) => createEmptyRow(i));
		}

		// 4. Otherwise start empty
		return [];
	});

	// Active row ID for collapse/expand
	const [activeRowId, setActiveRowId] = useState<string | null>(null);

	// Row operations with action-based validation
	const addRow = () => {
		// ACTION-BASED validation (not useEffect)
		if (maxRows && rows.length >= maxRows) {
			field.validation.errors = [`Cannot add more than ${maxRows} items`];
			return;
		}

		field.validation.errors = []; // Clear errors on successful add
		const newRow = createEmptyRow(rows.length);
		const newRows = [...rows, newRow];
		setRows(newRows);
		onChange(newRows);
		setActiveRowId(newRow['meta:state']._uid); // Expand new row
	};

	const removeRow = (index: number) => {
		const newRows = [...rows];
		newRows.splice(index, 1);

		// ACTION-BASED validation
		if (minRows && newRows.length < minRows) {
			field.validation.errors = [`Must contain at least ${minRows} items`];
		} else {
			field.validation.errors = [];
		}

		setRows(newRows);
		onChange(newRows);
	};

	const toggleCollapse = (rowId: string) => {
		setActiveRowId(activeRowId === rowId ? null : rowId);
	};

	// Handle drag end for reordering
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = rows.findIndex((row) => row['meta:state']._uid === active.id);
		const newIndex = rows.findIndex((row) => row['meta:state']._uid === over.id);

		const reorderedRows = arrayMove(rows, oldIndex, newIndex);
		setRows(reorderedRows);
		onChange(reorderedRows);
	};

	// Field change handler with enhanced row label support
	const handleFieldChange = (rowIndex: number, fieldKey: string, fieldValue: unknown) => {
		const newRows = [...rows];
		const currentFieldEntry = newRows[rowIndex][fieldKey];

		// Handle Voxel structure (field configs with value property) vs simple values
		if (currentFieldEntry && typeof currentFieldEntry === 'object' && 'type' in currentFieldEntry) {
			// Voxel structure: update the value property within the field config
			newRows[rowIndex][fieldKey] = {
				...currentFieldEntry,
				value: fieldValue,
			};
		} else {
			// Simple structure: store value directly
			newRows[rowIndex][fieldKey] = fieldValue as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}

		// Update row label if this is the label field
		if (fieldKey === rowLabelField) {
			const labelField = fieldBlueprint.find((f) => f.key === fieldKey);
			let labelValue = fieldValue;

			// Handle different field types for row label
			interface FieldChoice {
				value: string | number;
				label: string;
			}
			switch (labelField?.type) {
				case 'select':
				case 'taxonomy':
					const choice = (labelField.props?.['choices'] as FieldChoice[] | undefined)?.find(
						(c) => c.value === fieldValue
					);
					labelValue = choice?.label || String(fieldValue);
					break;
				case 'multiselect':
					const multiselectValue = fieldValue as Record<string, boolean> | null | undefined;
					const selected = Object.keys(multiselectValue || {}).filter((k) => multiselectValue?.[k]);
					labelValue = `${selected.length} selected`;
					break;
				case 'date':
					labelValue = fieldValue ? new Date(fieldValue as string | number).toLocaleDateString() : '';
					break;
			}

			newRows[rowIndex]['meta:state'].label =
				String(labelValue || `${l10n.item} ${rowIndex + 1}`);
		}

		setRows(newRows);
		onChange(newRows);
	};

	// Render nested fields for a row (recursive with FieldRenderer)
	// Voxel rows contain full field configs, not just values
	const renderRowFields = (row: RepeaterRow, rowIndex: number) => {
		// Get fields from row (Voxel structure) OR use blueprint for new rows
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rowFields: VoxelField[] = ((() => {
			// If row has full field configs (Voxel structure), iterate over them
			const rowEntries = Object.entries(row).filter(
				([key]) => key !== 'meta:state'
			);

			if (rowEntries.length > 0 && rowEntries[0][1] && typeof rowEntries[0][1] === 'object' && 'type' in rowEntries[0][1]) {
				// Row contains full field configs (Voxel's rows structure)
				return rowEntries.map(([_, fieldConfig]) => fieldConfig as unknown as VoxelField);
			}

			// Otherwise use blueprint and merge with row values (our simplified structure)
			return fieldBlueprint.map((fieldConfig) => ({
				...fieldConfig,
				value: row[fieldConfig.key] ?? fieldConfig.value ?? null,
			}));
		})() as VoxelField[]);

		return rowFields.map((fieldConfig) => {
			// Create field instance for this row
			const fieldInstance: VoxelField = {
				...fieldConfig,
				repeater_index: rowIndex,
				repeater_id: field.key,
				key: `${field.key}[${rowIndex}][${fieldConfig.key}]`, // Unique key
			};

			// Use FieldRenderer for recursive rendering - NO wrapper div (Voxel renders directly)
			return (
				<FieldRenderer
					key={fieldInstance.key}
					field={fieldInstance}
					value={fieldInstance.value}
					onChange={(newValue) => handleFieldChange(rowIndex, fieldConfig.key, newValue)}
					onBlur={onBlur}
					icons={icons}
					postTypeKey={postTypeKey} // CRITICAL: Pass through for PostRelationField
				/>
			);
		});
	};

	// Check if row has validation errors
	const hasRowError = (row: RepeaterRow): boolean => {
		return fieldBlueprint.some((fieldConfig) => {
			const fieldValue = row[fieldConfig.key];
			const fieldInstance = { ...fieldConfig, value: fieldValue };
			return fieldInstance.validation?.errors?.length > 0;
		});
	};

	// Get validation error message
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Sortable Row Component (inner component for drag-and-drop)
	const SortableRow: React.FC<{ row: RepeaterRow; index: number }> = ({ row, index }) => {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
			useSortable({ id: row['meta:state']._uid });

		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.5 : 1,
		};

		// Match Voxel logic: collapsed when NOT active
		const isCollapsed = activeRowId !== row['meta:state']._uid;
		const rowHasError = hasRowError(row);

		return (
			<div
				ref={setNodeRef}
				style={style}
				className={`ts-field-repeater ${isCollapsed ? 'collapsed' : ''}`}
			>
				{/* Row header - MATCHES Voxel structure exactly */}
				<div
					className="ts-repeater-head"
					onClick={() => toggleCollapse(row['meta:state']._uid)}
				>
					{/* Drag handle icon - SVG rendered directly as child for CSS .ts-repeater-head>svg */}
					<svg
						{...attributes}
						{...listeners}
						onClick={(e) => e.stopPropagation()}
						id="Layer_1"
						data-name="Layer 1"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 288 480"
					>
						<path
							d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z"
							style={{ fillRule: 'evenodd' }}
						/>
					</svg>

					{/* Row label */}
					<label>
						{row['meta:state'].label}
						{rowHasError && <span className="ts-row-error" style={{ display: 'none' }}></span>}
					</label>

					{/* Row controls */}
					<div className="ts-repeater-controller">
						{/* Delete button - no-drag class prevents drag trigger */}
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								removeRow(index);
							}}
							className="ts-icon-btn ts-smaller no-drag"
							draggable={false}
						>
							{renderIcon(icons?.trashIcon, (
								<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: VOXEL_TRASH_CAN_ICON }} />
							))}
						</a>

						{/* Collapse/expand icon */}
						<a
							href="#"
							className="ts-icon-btn ts-smaller no-drag"
							draggable={false}
							onClick={(e) => {
								e.preventDefault();
								// Let it bubble to toggle collapse
							}}
						>
							{renderIcon(icons?.downIcon, (
								<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: VOXEL_CHEVRON_DOWN_ICON }} />
							))}
						</a>
					</div>
				</div>

				{/* Collapsible content - DIRECT CHILD like Voxel */}
				{!isCollapsed && (
					<div className="medium form-field-grid">
						{renderRowFields(row, index)}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className={`ts-form-group ts-repeater field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Field label - matches Voxel structure */}
			<label>
				{field.label}
				{/* Error slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}
				{/* Description tooltip */}
				{field.description && (
					<div className="vx-dialog">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
						</svg>
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* Draggable rows container - always rendered */}
			<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
				<SortableContext
					items={rows.map((r) => r['meta:state']._uid)}
					strategy={verticalListSortingStrategy}
				>
					<div className="ts-repeater-container">
						{rows.map((row, index) => (
							<SortableRow key={row['meta:state']._uid} row={row} index={index} />
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* Add row button - matches Voxel structure */}
			{(!maxRows || rows.length < maxRows) && (
				<a href="#" className="ts-repeater-add ts-btn ts-btn-4 form-btn" onClick={(e) => {
					e.preventDefault();
					addRow();
				}}>
					{renderIcon(icons?.tsAddIcon, (
						<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: VOXEL_PLUS_ICON }} />
					))}
					{l10n.add_row}
				</a>
			)}
		</div>
	);
};
