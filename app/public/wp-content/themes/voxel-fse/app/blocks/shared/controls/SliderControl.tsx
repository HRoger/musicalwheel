/**
 * Slider Control Component
 *
 * A range slider with optional unit display and description.
 * Wraps WordPress RangeControl with additional features.
 *
 * @package VoxelFSE
 */

import React from 'react';
import { RangeControl } from '@wordpress/components';

export interface SliderControlProps {
	label: string;
	description?: string;
	value: number | undefined;
	onChange: (value: number | undefined) => void;
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
	label,
	description,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	unit = '',
}) => (
	<div className="voxel-fse-slider-control">
		<div className="voxel-fse-slider-header">
			<label>{label}{unit && ` (${unit})`}</label>
		</div>
		{description && (
			<p className="voxel-fse-control-description">{description}</p>
		)}
		<RangeControl
			value={value ?? 0}
			onChange={(val: number | undefined) => onChange(val)}
			min={min}
			max={max}
			step={step}
			withInputField={true}
		/>
	</div>
);

export default SliderControl;
