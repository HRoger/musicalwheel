/**
 * Box Control Component
 *
 * A 4-sided input control for margin/padding values.
 * Each side (top, right, bottom, left) has its own input.
 *
 * @package VoxelFSE
 */

import React from 'react';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface BoxValues {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

export interface BoxControlProps {
	label: string;
	values: BoxValues;
	onChange: (values: BoxValues) => void;
	placeholder?: string;
}

export const BoxControl: React.FC<BoxControlProps> = ({
	label,
	values,
	onChange,
	placeholder = '0px',
}) => {
	const updateValue = (side: keyof BoxValues, value: string) => {
		onChange({ ...values, [side]: value });
	};

	return (
		<div className="voxel-fse-box-control">
			<label className="components-base-control__label">{label}</label>
			<div className="voxel-fse-box-control__grid">
				<TextControl
					label={__('Top', 'voxel-fse')}
					value={values?.top || ''}
					onChange={(value) => updateValue('top', value)}
					placeholder={placeholder}
				/>
				<TextControl
					label={__('Right', 'voxel-fse')}
					value={values?.right || ''}
					onChange={(value) => updateValue('right', value)}
					placeholder={placeholder}
				/>
				<TextControl
					label={__('Bottom', 'voxel-fse')}
					value={values?.bottom || ''}
					onChange={(value) => updateValue('bottom', value)}
					placeholder={placeholder}
				/>
				<TextControl
					label={__('Left', 'voxel-fse')}
					value={values?.left || ''}
					onChange={(value) => updateValue('left', value)}
					placeholder={placeholder}
				/>
			</div>
		</div>
	);
};

export default BoxControl;
