/**
 * ColumnGapControl Component
 *
 * Control for spacing between columns with responsive support.
 * Matches Stackable's column gap control UI.
 *
 * TypeScript Strict Mode Compliant
 *
 * @package VoxelFSE
 */

import { RangeControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useSelect } from '@wordpress/data';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import { getCurrentDeviceType } from '@shared/utils/deviceType';

export interface ColumnGapControlProps {
	label?: string;
	value?: number;
	valueTablet?: number;
	valueMobile?: number;
	unit?: string;
	onChange?: (value: number) => void;
	onChangeTablet?: (value: number) => void;
	onChangeMobile?: (value: number) => void;
	onUnitChange?: (unit: string) => void;
	min?: number;
	max?: number;
	step?: number;
	units?: string[];
}

const DEFAULT_UNITS = ['px', 'em', '%', 'vw'];
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

export default function ColumnGapControl({
	label = __('Column Gap', 'voxel-fse'),
	value = 20,
	valueTablet,
	valueMobile,
	unit = 'px',
	onChange,
	onChangeTablet,
	onChangeMobile,
	onUnitChange,
	min = DEFAULT_MIN,
	max = DEFAULT_MAX,
	step = DEFAULT_STEP,
	units = DEFAULT_UNITS,
}: ColumnGapControlProps) {
	// Get the current device preview from WordPress
	const deviceType = useSelect((select) => getCurrentDeviceType(select), []);

	// Local state for device (synced with WordPress)
	const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>(deviceType);

	// Calculate current value and onChange based on device
	const currentValue = currentDevice === 'mobile' ? valueMobile : currentDevice === 'tablet' ? valueTablet : value;
	const currentOnChange = currentDevice === 'mobile' ? onChangeMobile : currentDevice === 'tablet' ? onChangeTablet : onChange;

	return (
		<div className="voxel-fse-column-gap-control">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' as const, color: 'rgb(30, 30, 30)' }}>
					{label}
				</span>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					{onUnitChange && (
						<SelectControl
							value={unit}
							options={units.map(u => ({ label: u, value: u }))}
							onChange={onUnitChange}
							className="voxel-fse-column-gap-control__unit-selector"
							__nextHasNoMarginBottom
						/>
					)}
					<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
				</div>
			</div>
			<RangeControl
				label=""
				value={currentValue}
				onChange={currentOnChange}
				min={min}
				max={max}
				step={step}
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

