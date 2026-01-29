/**
 * Responsive Dimensions Control Component
 *
 * Wraps DimensionsControl with responsive device switching.
 * Automatically handles attribute selection (desktop/tablet/mobile) based on current device.
 *
 * @package VoxelFSE
 */


import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import DimensionsControl from './DimensionsControl';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import type { UnitType } from './UnitDropdownButton';

import { getCurrentDeviceType, type DeviceType } from '@shared/utils/deviceType';

interface BoxValues {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
}

interface ResponsiveDimensionsControlProps {
    label: string;
    attributes: Record<string, any>;
    setAttributes: (attrs: Record<string, any>) => void;
    attributeBaseName: string;
    availableUnits?: UnitType[];
}

export default function ResponsiveDimensionsControl({
    label,
    attributes,
    setAttributes,
    attributeBaseName,
    availableUnits,
}: ResponsiveDimensionsControlProps) {
    // Get WordPress's current device type from the store
    const currentDevice = useSelect((select) => getCurrentDeviceType(select), []);

    // Get attribute name for current device
    const getAttributeName = () => {
        if (currentDevice === 'desktop') return attributeBaseName;
        return `${attributeBaseName}_${currentDevice}`;
    };

    // Get current value
    const getValue = (): BoxValues => {
        const attrName = getAttributeName();
        const value = attributes[attrName];

        if (!value) return {};

        // Ensure it returns a BoxValues object
        // Voxel saves dimensions as objects { top, right, bottom, left }
        return value as BoxValues;
    };

    // Set value for current device
    const setValue = (newValues: { top?: string; right?: string; bottom?: string; left?: string }) => {
        const attrName = getAttributeName();
        setAttributes({ [attrName]: newValues });
    };

    return (
        <DimensionsControl
            label={label}
            values={getValue()}
            onChange={setValue}
            availableUnits={availableUnits}
            controls={
                <div style={{ marginLeft: '4px' }}>
                    <ResponsiveDropdownButton controlKey={attributeBaseName} />
                </div>
            }
        />
    );
}
