/**
 * Shape Divider Control Component
 *
 * Elementor-style shape divider control with Top/Bottom tabs and shape type grid selector.
 * Uses image thumbnails from SVG files (same as Elementor).
 *
 * Evidence:
 * - Elementor shapes: plugins/elementor/assets/shapes/
 * - Elementor config: plugins/elementor/includes/shapes.php
 */

import React from 'react';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import StateTabPanel from './StateTabPanel';
import ColorPickerControl from './ColorPickerControl';
import ResponsiveRangeControlWithDropdown from './ResponsiveRangeControlWithDropdown';

// Get theme URL for assets
declare const voxelFseData: { themeUrl: string } | undefined;
const getThemeUrl = () => {
	if (typeof voxelFseData !== 'undefined' && voxelFseData.themeUrl) {
		return voxelFseData.themeUrl;
	}
	// Fallback: try to detect from script URL or use relative path
	return '/wp-content/themes/voxel-fse';
};

// Shape definition - metadata only, images loaded from files
interface ShapeDefinition {
	title: string;
	file: string; // SVG filename (without extension)
	hasFlip?: boolean;
	hasNegative?: boolean;
	heightOnly?: boolean;
}

// Shape definitions matching Elementor's shapes.php order
export const SHAPE_DIVIDERS: Record<string, ShapeDefinition> = {
	mountains: {
		title: __('Mountains', 'voxel-fse'),
		file: 'mountains',
		hasFlip: true,
	},
	drops: {
		title: __('Drops', 'voxel-fse'),
		file: 'drops',
		hasFlip: true,
		hasNegative: true,
		heightOnly: true,
	},
	clouds: {
		title: __('Clouds', 'voxel-fse'),
		file: 'clouds',
		hasFlip: true,
		hasNegative: true,
		heightOnly: true,
	},
	zigzag: {
		title: __('Zigzag', 'voxel-fse'),
		file: 'zigzag',
	},
	pyramids: {
		title: __('Pyramids', 'voxel-fse'),
		file: 'pyramids',
		hasFlip: true,
		hasNegative: true,
	},
	triangle: {
		title: __('Triangle', 'voxel-fse'),
		file: 'triangle',
		hasNegative: true,
	},
	'triangle-asymmetrical': {
		title: __('Triangle Asymmetrical', 'voxel-fse'),
		file: 'triangle-asymmetrical',
		hasFlip: true,
		hasNegative: true,
	},
	tilt: {
		title: __('Tilt', 'voxel-fse'),
		file: 'tilt',
		hasFlip: true,
		heightOnly: true,
	},
	'opacity-tilt': {
		title: __('Tilt Opacity', 'voxel-fse'),
		file: 'opacity-tilt',
		hasFlip: true,
	},
	'opacity-fan': {
		title: __('Fan Opacity', 'voxel-fse'),
		file: 'opacity-fan',
	},
	curve: {
		title: __('Curve', 'voxel-fse'),
		file: 'curve',
		hasNegative: true,
	},
	'curve-asymmetrical': {
		title: __('Curve Asymmetrical', 'voxel-fse'),
		file: 'curve-asymmetrical',
		hasFlip: true,
		hasNegative: true,
	},
	waves: {
		title: __('Waves', 'voxel-fse'),
		file: 'waves',
		hasFlip: true,
		hasNegative: true,
	},
	'wave-brush': {
		title: __('Waves Brush', 'voxel-fse'),
		file: 'wave-brush',
		hasFlip: true,
	},
	'waves-pattern': {
		title: __('Waves Pattern', 'voxel-fse'),
		file: 'waves-pattern',
		hasFlip: true,
	},
	book: {
		title: __('Book', 'voxel-fse'),
		file: 'book',
		hasNegative: true,
	},
	split: {
		title: __('Split', 'voxel-fse'),
		file: 'split',
		hasNegative: true,
	},
	arrow: {
		title: __('Arrow', 'voxel-fse'),
		file: 'arrow',
		hasNegative: true,
	},
};

// Shape order for grid display - matches Elementor's PHP shapes.php order
const SHAPE_ORDER = [
	'mountains',
	'drops',
	'clouds',
	'zigzag',
	'pyramids',
	'triangle',
	'triangle-asymmetrical',
	'tilt',
	'opacity-tilt',
	'opacity-fan',
	'curve',
	'curve-asymmetrical',
	'waves',
	'wave-brush',
	'waves-pattern',
	'book',
	'split',
	'arrow',
];

export interface ShapeDividerValue {
	type?: string;
	color?: string;
	width?: number;
	width_tablet?: number;
	width_mobile?: number;
	widthUnit?: string;
	height?: number;
	height_tablet?: number;
	height_mobile?: number;
	heightUnit?: string;
	flip?: boolean;
	invert?: boolean;
	aboveContent?: boolean;
}

export interface ShapeDividerControlAttributes {
	shapeDividerActiveTab: string;
	shapeDividerTop: ShapeDividerValue;
	shapeDividerBottom: ShapeDividerValue;
}

export const shapeDividerAttributes = {
	shapeDividerActiveTab: {
		type: 'string',
		default: 'top',
	},
	shapeDividerTop: {
		type: 'object',
		default: {},
	},
	shapeDividerBottom: {
		type: 'object',
		default: {},
	},
};

interface ShapeDividerControlProps {
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
}

// Shape thumbnail using Elementor's visual choice pattern
// Uses radio input + label for accessibility, matching Elementor's exact structure
// Custom click handler allows toggle behavior (click to select, click again to deselect)
function ShapeThumbnail({
	shapeId,
	shape,
	isSelected,
	onToggle,
	position,
	controlId,
}: {
	shapeId: string;
	shape: ShapeDefinition;
	isSelected: boolean;
	onToggle: () => void;
	position: 'top' | 'bottom';
	controlId: string;
}) {
	const themeUrl = getThemeUrl();
	const imageUrl = `${themeUrl}/assets/shapes/${shape.file}.svg`;
	const isBottom = position === 'bottom';
	const inputId = `elementor-control-${shapeId}-${controlId}`;
	const inputName = `elementor-visual-choice-shape_divider_${position}-${controlId}`;

	// Handle click on label - allows toggle (select/deselect)
	const handleLabelClick = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent default radio behavior
		onToggle();
	};

	return (
		<div
			className={`elementor-visual-choice-element elementor-visual-choice-element-image${isSelected ? ' elementor-visual-choice-element-selected' : ''}`}
			style={{ '--elementor-visual-choice-span': 1 } as React.CSSProperties}
		>
			<input
				id={inputId}
				type="radio"
				name={inputName}
				value={shapeId}
				checked={isSelected}
				onChange={() => {}} // Handled by label click
				className="elementor-screen-only"
			/>
			<label
				className="elementor-visual-choice-label tooltip-target"
				htmlFor={inputId}
				data-tooltip={shape.title}
				title={shape.title}
				onClick={handleLabelClick}
				style={{
					alignItems: isBottom ? 'flex-start' : 'flex-end',
				}}
			>
				<img
					src={imageUrl}
					aria-hidden="true"
					alt={shape.title}
					data-hover={shapeId}
					style={{
						transform: isBottom ? 'rotate(180deg)' : undefined,
					}}
				/>
				<span className="elementor-screen-only">{shape.title}</span>
			</label>
		</div>
	);
}

export default function ShapeDividerControl({
	attributes,
	setAttributes,
}: ShapeDividerControlProps) {
	const topValue: ShapeDividerValue = attributes['shapeDividerTop'] || {};
	const bottomValue: ShapeDividerValue = attributes['shapeDividerBottom'] || {};

	const handleChange = (position: 'top' | 'bottom', field: string, value: any) => {
		const attrName = position === 'top' ? 'shapeDividerTop' : 'shapeDividerBottom';
		const currentValue = attributes[attrName] || {};
		setAttributes({
			[attrName]: { ...currentValue, [field]: value },
		});
	};

	// Handle shape toggle selection (click to select, click again to deselect)
	const handleShapeToggle = (position: 'top' | 'bottom', shapeId: string) => {
		const attrName = position === 'top' ? 'shapeDividerTop' : 'shapeDividerBottom';
		const currentValue = attributes[attrName] || {};
		// If already selected, deselect (set to undefined). Otherwise, select.
		const newType = currentValue.type === shapeId ? undefined : shapeId;
		setAttributes({
			[attrName]: { ...currentValue, type: newType },
		});
	};

	// Generate unique ID for this control instance
	const controlId = React.useId().replace(/:/g, '');

	const renderShapeControls = (position: 'top' | 'bottom') => {
		const value = position === 'top' ? topValue : bottomValue;
		const selectedShape = value.type;
		const shapeConfig = selectedShape ? SHAPE_DIVIDERS[selectedShape] : null;
		const hasShapeSelected = !!selectedShape && !!shapeConfig;

		// Create a proxy object for ResponsiveRangeControlWithDropdown
		const attrName = position === 'top' ? 'shapeDividerTop' : 'shapeDividerBottom';
		const proxyAttributes = {
			shapeDividerWidth: value.width,
			shapeDividerWidth_tablet: value.width_tablet,
			shapeDividerWidth_mobile: value.width_mobile,
			shapeDividerWidthUnit: value.widthUnit || '%',
			shapeDividerHeight: value.height,
			shapeDividerHeight_tablet: value.height_tablet,
			shapeDividerHeight_mobile: value.height_mobile,
			shapeDividerHeightUnit: value.heightUnit || 'px',
		};

		const handleProxyAttributeChange = (attrs: Record<string, any>) => {
			const updates: Partial<ShapeDividerValue> = {};
			for (const [key, val] of Object.entries(attrs)) {
				if (key === 'shapeDividerWidth') updates.width = val;
				else if (key === 'shapeDividerWidth_tablet') updates.width_tablet = val;
				else if (key === 'shapeDividerWidth_mobile') updates.width_mobile = val;
				else if (key === 'shapeDividerWidthUnit') updates.widthUnit = val;
				else if (key === 'shapeDividerHeight') updates.height = val;
				else if (key === 'shapeDividerHeight_tablet') updates.height_tablet = val;
				else if (key === 'shapeDividerHeight_mobile') updates.height_mobile = val;
				else if (key === 'shapeDividerHeightUnit') updates.heightUnit = val;
			}
			setAttributes({
				[attrName]: { ...value, ...updates },
			});
		};

		return (
			<div className="voxel-fse-shape-divider-controls">
				{/* Type label */}
				<label
					style={{
						display: 'block',
						fontSize: '13px',
						fontWeight: 500,
						textTransform: 'capitalize' as const,
						color: 'rgb(30, 30, 30)',
						marginBottom: '8px',
					}}
				>
					{__('Type', 'voxel-fse')}
				</label>

				{/* Shape grid selector - Elementor visual choice pattern */}
				{/* Bottom tab shapes are rotated 180° to show how they appear at section bottom */}
				<div className="elementor-visual-choice-container elementor-visual-choice-container-shape-divider">
					{SHAPE_ORDER.map((shapeId) => (
						<ShapeThumbnail
							key={shapeId}
							shapeId={shapeId}
							shape={SHAPE_DIVIDERS[shapeId]}
							isSelected={selectedShape === shapeId}
							onToggle={() => handleShapeToggle(position, shapeId)}
							position={position}
							controlId={controlId}
						/>
					))}
				</div>

				{/* Additional controls (only show when a shape is selected) */}
				{hasShapeSelected && (
					<>
						{/* Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={value.color}
							onChange={(color) => handleChange(position, 'color', color)}
						/>

						{/* Width - with responsive and unit dropdowns (hide for heightOnly shapes) */}
						{!shapeConfig?.heightOnly && (
							<ResponsiveRangeControlWithDropdown
								label={__('Width', 'voxel-fse')}
								attributes={proxyAttributes}
								setAttributes={handleProxyAttributeChange}
								attributeBaseName="shapeDividerWidth"
								min={100}
								max={300}
								step={1}
								availableUnits={['%']}
								unitAttributeName="shapeDividerWidthUnit"
							/>
						)}

						{/* Height - with responsive and unit dropdowns */}
						<ResponsiveRangeControlWithDropdown
							label={__('Height', 'voxel-fse')}
							attributes={proxyAttributes}
							setAttributes={handleProxyAttributeChange}
							attributeBaseName="shapeDividerHeight"
							min={0}
							max={500}
							step={1}
							availableUnits={['px', 'vh', 'em']}
							unitAttributeName="shapeDividerHeightUnit"
						/>

						{/* Flip toggle - only show if shape supports flip */}
						{shapeConfig?.hasFlip && (
							<ToggleControl
								label={__('Flip', 'voxel-fse')}
								checked={value.flip || false}
								onChange={(val: boolean) => handleChange(position, 'flip', val)}
								__nextHasNoMarginBottom
							/>
						)}

						{/* Invert toggle - only show if shape supports negative/invert */}
						{shapeConfig?.hasNegative && (
							<ToggleControl
								label={__('Invert', 'voxel-fse')}
								checked={value.invert || false}
								onChange={(val: boolean) => handleChange(position, 'invert', val)}
								__nextHasNoMarginBottom
							/>
						)}

						{/* Bring to Front toggle - always shown */}
						<ToggleControl
							label={__('Bring to Front', 'voxel-fse')}
							checked={value.aboveContent || false}
							onChange={(val: boolean) => handleChange(position, 'aboveContent', val)}
							__nextHasNoMarginBottom
						/>
					</>
				)}
			</div>
		);
	};

	return (
		<div className="voxel-fse-shape-divider-control">
			<StateTabPanel
				attributeName="shapeDividerActiveTab"
				attributes={attributes}
				setAttributes={setAttributes}
				tabs={[
					{ name: 'top', title: __('Top', 'voxel-fse') },
					{ name: 'bottom', title: __('Bottom', 'voxel-fse') },
				]}
			>
				{(tab) => renderShapeControls(tab.name as 'top' | 'bottom')}
			</StateTabPanel>
		</div>
	);
}
