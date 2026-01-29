/**
 * AlignmentControl Component
 *
 * Icon button group for alignment/justification controls.
 * Matches Stackable's alignment control UI.
 *
 * TypeScript Strict Mode Compliant
 *
 * @package VoxelFSE
 */

import { Button, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type AlignmentValue = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

export interface AlignmentControlProps {
	label?: string;
	value: AlignmentValue;
	onChange: (value: AlignmentValue) => void;
	options?: AlignmentValue[];
	showLabels?: boolean;
}

const DEFAULT_OPTIONS: AlignmentValue[] = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'];

const ALIGNMENT_ICONS: Record<AlignmentValue, string> = {
	'flex-start': 'align-left',
	'center': 'align-center',
	'flex-end': 'align-right',
	'space-between': 'align-wide',
	'space-around': 'align-full-width',
	'space-evenly': 'align-full-width',
};

const ALIGNMENT_LABELS: Record<AlignmentValue, string> = {
	'flex-start': __('Start', 'voxel-fse'),
	'center': __('Center', 'voxel-fse'),
	'flex-end': __('End', 'voxel-fse'),
	'space-between': __('Space Between', 'voxel-fse'),
	'space-around': __('Space Around', 'voxel-fse'),
	'space-evenly': __('Space Evenly', 'voxel-fse'),
};

export default function AlignmentControl({
	label,
	value,
	onChange,
	options = DEFAULT_OPTIONS,
	showLabels = false,
}: AlignmentControlProps) {
	return (
		<div className="voxel-fse-alignment-control">
			{label && (
				<BaseControl.VisualLabel>
					{label}
				</BaseControl.VisualLabel>
			)}
			<div className="voxel-fse-alignment-control__buttons">
				{options.map((option) => (
					<Button
						key={option}
						icon={ALIGNMENT_ICONS[option] || 'align-left'}
						onClick={() => onChange(option)}
						isPressed={value === option}
						label={ALIGNMENT_LABELS[option]}
						className="voxel-fse-alignment-control__button"
						showTooltip={!showLabels}
					>
						{showLabels && ALIGNMENT_LABELS[option]}
					</Button>
				))}
			</div>
		</div>
	);
}

