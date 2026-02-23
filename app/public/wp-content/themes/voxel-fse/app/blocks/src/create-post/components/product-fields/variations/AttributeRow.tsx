/**
 * AttributeRow Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Displays a single attribute in the attributes list with drag-and-drop support.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attributes.php:24-50
 * - Value count in <em> tag: "X values" or "No values"
 * - Controller buttons have no-drag class
 * - Expanded content wrapper: form-field-grid medium
 * - Uses handle.svg, trash-can.svg, chevron-down.svg icons
 */
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ProductAttribute, PresetAttribute } from '../../../types';
import { AttributeEditor } from './AttributeEditor';

/**
 * Component props interface
 */
interface AttributeRowProps {
	attribute: ProductAttribute;
	index: number;
	isActive: boolean;
	onToggle: () => void;
	onUpdate: (updates: Partial<ProductAttribute>) => void;
	onRemove: () => void;
	getPreset?: (attribute: ProductAttribute) => PresetAttribute | undefined;
}

/**
 * AttributeRow Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attributes.php
 */
export const AttributeRow: React.FC<AttributeRowProps> = ({
	attribute,
	index: _index,
	isActive,
	onToggle,
	onUpdate,
	onRemove,
	getPreset,
}) => {
	// Set up drag-and-drop functionality
	const {
		attributes: dndAttributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: attribute._uid });

	// Apply drag transform styles
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// Get choice count for display - matches Voxel "X values" or "No values"
	// For custom attributes: choices is an array
	// For preset attributes: choices is an object { value: boolean }
	const choiceCount = Array.isArray(attribute.choices)
		? attribute.choices.length
		: Object.values(attribute.choices || {}).filter(Boolean).length;

	// Display label (show placeholder if empty) - matches Voxel "Untitled"
	const displayLabel = attribute.label || 'Untitled';

	// CSS classes for row state - matches Voxel :class="{collapsed: active !== attribute}"
	const rowClasses = ['ts-field-repeater', isActive ? '' : 'collapsed']
		.filter(Boolean)
		.join(' ');

	return (
		<div ref={setNodeRef} style={style} className={rowClasses}>
			{/* Repeater head - matches Voxel attributes.php:26 */}
			<div className="ts-repeater-head" onClick={onToggle}>
				{/* Drag handle icon - matches Voxel handle.svg */}
				<svg
					{...dndAttributes}
					{...listeners}
					id="Layer_1"
					data-name="Layer 1"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 288 480"
					style={{ cursor: 'grab' }}
				>
					<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
				</svg>

				{/* Attribute label - matches Voxel attributes.php:28-29 */}
				<label>{displayLabel}</label>

				{/* Value count in <em> - matches Voxel attributes.php:31-36 */}
				{choiceCount > 0 ? (
					<em>{choiceCount} values</em>
				) : (
					<em>No values</em>
				)}

				{/* Controller buttons - matches Voxel attributes.php:37-44 */}
				<div className="ts-repeater-controller">
					{/* Delete button - matches Voxel with no-drag class */}
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove();
						}}
						className="ts-icon-btn ts-smaller no-drag"
					>
						{/* Trash icon - matches Voxel trash-can.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54"/>
							<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54"/>
						</svg>
					</a>

					{/* Collapse/expand icon - matches Voxel with no-drag class */}
					<a
						href="#"
						className="ts-icon-btn ts-smaller no-drag"
						onClick={(e) => e.preventDefault()}
					>
						{/* Chevron down icon - matches Voxel chevron-down.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="#343C54"/>
						</svg>
					</a>
				</div>
			</div>

			{/* Expanded content - matches Voxel attributes.php:46-48 */}
			{isActive && (
				<div className="form-field-grid medium">
					<AttributeEditor
						attribute={attribute}
						onUpdate={onUpdate}
						preset={getPreset?.(attribute)}
					/>
				</div>
			)}
		</div>
	);
};
