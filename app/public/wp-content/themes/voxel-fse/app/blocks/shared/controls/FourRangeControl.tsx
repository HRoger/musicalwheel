/**
 * FourRangeControl Component
 *
 * A 4-sided range control for margin/padding values matching Stackable's UI.
 * Features:
 * - Linked/unlinked mode toggle
 * - Unit selector (px, em, %, vw)
 * - Range sliders for each side
 * - Visual preview
 *
 * TypeScript Strict Mode Compliant
 *
 * @deprecated Use DimensionsControl instead for Elementor 1:1 matching
 * @package VoxelFSE
 */

import { useState, useCallback } from 'react';
import { RangeControl, SelectControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	linked?: boolean;
}

export interface FourRangeControlProps {
	label?: string;
	value?: DimensionsConfig;
	onChange: (value: DimensionsConfig) => void;
	units?: string[];
	min?: number;
	max?: number;
	step?: number;
	enableTop?: boolean;
	enableRight?: boolean;
	enableBottom?: boolean;
	enableLeft?: boolean;
	defaultLocked?: boolean;
}

const DEFAULT_UNITS = ['px', 'em', '%', 'vw'];
const DEFAULT_MIN = -100;
const DEFAULT_MAX = 200;
const DEFAULT_STEP = 1;

export default function FourRangeControl({
	label,
	value = {},
	onChange,
	units = DEFAULT_UNITS,
	min = DEFAULT_MIN,
	max = DEFAULT_MAX,
	step = DEFAULT_STEP,
	enableTop = true,
	enableRight = true,
	enableBottom = true,
	enableLeft = true,
	defaultLocked = true,
}: FourRangeControlProps) {
	const [linked, setLinked] = useState(value?.linked ?? defaultLocked);

	const currentValue: DimensionsConfig = {
		top: value?.top ?? 0,
		right: value?.right ?? 0,
		bottom: value?.bottom ?? 0,
		left: value?.left ?? 0,
		unit: value?.unit ?? 'px',
		linked: linked,
	};

	const handleLinkedToggle = useCallback(() => {
		const newLinked = !linked;
		setLinked(newLinked);

		if (newLinked) {
			// When linking, set all sides to the top value
			onChange({
				...currentValue,
				top: currentValue.top,
				right: currentValue.top,
				bottom: currentValue.top,
				left: currentValue.top,
				linked: true,
			});
		} else {
			onChange({
				...currentValue,
				linked: false,
			});
		}
	}, [linked, currentValue, onChange]);

	const handleUnitChange = useCallback((newUnit: string) => {
		onChange({
			...currentValue,
			unit: newUnit,
		});
	}, [currentValue, onChange]);

	const handleSideChange = useCallback((side: 'top' | 'right' | 'bottom' | 'left', newValue: number | undefined) => {
		if (linked) {
			// When linked, update all sides
			onChange({
				...currentValue,
				top: newValue,
				right: newValue,
				bottom: newValue,
				left: newValue,
				linked: true,
			});
		} else {
			// When unlinked, update only the specific side
			onChange({
				...currentValue,
				[side]: newValue,
				linked: false,
			});
		}
	}, [linked, currentValue, onChange]);

	return (
		<div className="voxel-fse-four-range-control">
			{label && (
				<div className="voxel-fse-four-range-control__header">
					<span className="components-base-control__label">{label}</span>
					<div className="voxel-fse-four-range-control__header-actions">
						<SelectControl
							value={currentValue.unit}
							options={units.map(unit => ({ label: unit, value: unit }))}
							onChange={handleUnitChange}
							className="voxel-fse-four-range-control__unit-selector"
							__nextHasNoMarginBottom
						/>
						<Button
							icon={linked ? 'admin-links' : 'editor-unlink'}
							onClick={handleLinkedToggle}
							isPressed={linked}
							label={linked ? __('Unlink sides', 'voxel-fse') : __('Link sides', 'voxel-fse')}
							className="voxel-fse-four-range-control__link-button"
						/>
					</div>
				</div>
			)}

			<div className="voxel-fse-four-range-control__inputs">
				{enableTop && (
					<div className="voxel-fse-four-range-control__input">
						<RangeControl
							label={__('Top', 'voxel-fse')}
							value={currentValue.top}
							onChange={(newValue: number | undefined) => handleSideChange('top', newValue)}
							min={min}
							max={max}
							step={step}
							__nextHasNoMarginBottom
						/>
					</div>
				)}

				{enableRight && (
					<div className="voxel-fse-four-range-control__input">
						<RangeControl
							label={__('Right', 'voxel-fse')}
							value={currentValue.right}
							onChange={(newValue: number | undefined) => handleSideChange('right', newValue)}
							min={min}
							max={max}
							step={step}
							disabled={linked}
							__nextHasNoMarginBottom
						/>
					</div>
				)}

				{enableBottom && (
					<div className="voxel-fse-four-range-control__input">
						<RangeControl
							label={__('Bottom', 'voxel-fse')}
							value={currentValue.bottom}
							onChange={(newValue: number | undefined) => handleSideChange('bottom', newValue)}
							min={min}
							max={max}
							step={step}
							disabled={linked}
							__nextHasNoMarginBottom
						/>
					</div>
				)}

				{enableLeft && (
					<div className="voxel-fse-four-range-control__input">
						<RangeControl
							label={__('Left', 'voxel-fse')}
							value={currentValue.left}
							onChange={(newValue: number | undefined) => handleSideChange('left', newValue)}
							min={min}
							max={max}
							step={step}
							disabled={linked}
							__nextHasNoMarginBottom
						/>
					</div>
				)}
			</div>
		</div>
	);
}

