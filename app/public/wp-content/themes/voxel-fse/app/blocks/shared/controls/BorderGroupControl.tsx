/**
 * BorderGroupControl Component
 *
 * Replicates Elementor's border controls group.
 * Includes: Border Type, Width (Dimensions), Color, Border Radius (Dimensions).
 *
 * @package VoxelFSE
 */

import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DimensionsControl from './DimensionsControl';
import ColorControl from './ColorControl'; // Assuming this exists

export interface DimensionsConfig {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
    unit?: string;
    linked?: boolean;
}

export interface BorderGroupValue {
    [key: string]: unknown;
    borderType?: string; // '' (default), 'solid', 'double', 'dotted', 'dashed', 'groove', 'none'
    borderWidth?: DimensionsConfig;
    borderColor?: string;
    borderRadius?: DimensionsConfig;
}

interface BorderGroupControlProps {
    label?: string;
    value: BorderGroupValue;
    onChange: (value: BorderGroupValue) => void;
    // Options to toggle visibility of sub-controls
    hideRadius?: boolean;
}

const BORDER_TYPES = [
    { label: __('Default', 'voxel-fse'), value: '' },
    { label: __('None', 'voxel-fse'), value: 'none' },
    { label: __('Solid', 'voxel-fse'), value: 'solid' },
    { label: __('Double', 'voxel-fse'), value: 'double' },
    { label: __('Dotted', 'voxel-fse'), value: 'dotted' },
    { label: __('Dashed', 'voxel-fse'), value: 'dashed' },
    { label: __('Groove', 'voxel-fse'), value: 'groove' },
];

export default function BorderGroupControl({
    label = __('Border', 'voxel-fse'),
    value,
    onChange,
    hideRadius = false,
}: BorderGroupControlProps) {
    const { borderType: rawBorderType, borderWidth, borderColor, borderRadius } = value;

    // Normalize 'default' to '' for consistent comparison with BORDER_TYPES options
    const borderType = rawBorderType === 'default' ? '' : rawBorderType;

    const hasBorder = borderType && borderType !== 'none' && borderType !== '';

    const updateValue = (key: keyof BorderGroupValue, newVal: any) => {
        onChange({
            ...value,
            [key]: newVal,
        });
    };

    return (
        <div className="voxel-fse-border-group-control" style={{ marginBottom: '10px' }}>
            <div className="voxel-fse-border-type-control">
                <label
                    className="voxel-fse-control-label"
                    style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        textTransform: 'none',
                    }}
                >
                    {label}
                </label>
                <SelectControl
                    value={borderType || ''}
                    options={BORDER_TYPES}
                    onChange={(newType: string) => updateValue('borderType', newType)}
                    __nextHasNoMarginBottom
                    hideLabelFromVision
                />
            </div>

            {hasBorder && (
                <>
                    <div className="voxel-fse-control-group" style={{ marginBottom: '16px' }}>
                        <DimensionsControl
                            label={__('Border Width', 'voxel-fse')}
                            values={borderWidth || {}}
                            onChange={(newWidth) => updateValue('borderWidth', newWidth)}
                            availableUnits={['px', 'em', 'rem', 'vw']} // Width usually px
                        />
                    </div>

                    <div className="voxel-fse-control-group" style={{ marginBottom: '16px' }}>
                        <ColorControl
                            label={__('Border Color', 'voxel-fse')}
                            value={borderColor}
                            onChange={(newColor) => updateValue('borderColor', newColor)}
                        />
                    </div>
                </>
            )}

            {!hideRadius && (
                <div className="voxel-fse-control-group" style={{ marginTop: '16px' }}>
                    <DimensionsControl
                        label={__('Border Radius', 'voxel-fse')}
                        values={borderRadius || {}}
                        onChange={(newRadius) => updateValue('borderRadius', newRadius)}
                        availableUnits={['px', '%', 'em', 'rem']} // Radius supports %
                    />
                </div>
            )}
        </div>
    );
}
