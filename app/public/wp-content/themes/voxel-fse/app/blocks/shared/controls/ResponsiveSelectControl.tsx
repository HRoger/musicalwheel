/**
 * Responsive Select Control Component
 *
 * A select dropdown with responsive device dropdown, matching Elementor's pattern.
 * Used for options that can vary by device (e.g., image sizes, positions).
 *
 * IMPORTANT: Device state is managed by WordPress global store, not local state.
 * This ensures all responsive controls stay in sync when any one is changed.
 *
 * Features:
 * - Responsive device dropdown (desktop/tablet/mobile)
 * - Value cascade from desktop to smaller devices
 * - Elementor-style layout
 *
 * @package VoxelFSE
 */

import { SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from 'react';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveSelectControlProps {
    /** Control label */
    label: string;
    /** Desktop value */
    value?: string;
    /** Tablet value */
    valueTablet?: string;
    /** Mobile value */
    valueMobile?: string;
    /** Desktop onChange handler */
    onChange: (value: string) => void;
    /** Tablet onChange handler */
    onChangeTablet: (value: string) => void;
    /** Mobile onChange handler */
    onChangeMobile: (value: string) => void;
    /** Select options */
    options: { label: string; value: string }[];
    /** Optional control key for state persistence */
    controlKey?: string;
    /** Help text */
    help?: string;
}

/**
 * Hook to sync with WordPress's responsive preview state
 */
function useWordPressDevice(): DeviceType {
    const wpDeviceType = useSelect(
        (select: (store: string) => Record<string, unknown>) => {
            // Standard way: use core/edit-post store (for post editor)
            const editPostStore = select('core/edit-post') as {
                getPreviewDeviceType?: () => string;
                __experimentalGetPreviewDeviceType?: () => string;
            };
            if (editPostStore && typeof editPostStore.getPreviewDeviceType === 'function') {
                return editPostStore.getPreviewDeviceType();
            }

            // Fallback to experimental method
            if (editPostStore && typeof editPostStore.__experimentalGetPreviewDeviceType === 'function') {
                return editPostStore.__experimentalGetPreviewDeviceType();
            }

            // Try core/editor (for FSE templates)
            const editorStore = select('core/editor') as { getDeviceType?: () => string };
            if (editorStore && typeof editorStore.getDeviceType === 'function') {
                return editorStore.getDeviceType();
            }

            return 'Desktop';
        }
    );

    return wpDeviceType ? (wpDeviceType.toLowerCase() as DeviceType) : 'desktop';
}

export default function ResponsiveSelectControl({
    label,
    value,
    valueTablet,
    valueMobile,
    onChange,
    onChangeTablet,
    onChangeMobile,
    options,
    controlKey,
    help,
}: ResponsiveSelectControlProps) {
    const wpDevice = useWordPressDevice();
    const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

    // Debug: Log when component renders with new props
    console.log('[ResponsiveSelectControl] render:', { label, value, valueTablet, valueMobile, currentDevice });

    // Sync with WordPress device type
    useEffect(() => {
        setCurrentDevice(wpDevice);
    }, [wpDevice]);

    const getCurrentValue = () => {
        let result: string;
        switch (currentDevice) {
            case 'tablet':
                result = valueTablet ?? value ?? '';
                break;
            case 'mobile':
                result = valueMobile ?? valueTablet ?? value ?? '';
                break;
            default:
                result = value ?? '';
                break;
        }
        console.log('[ResponsiveSelectControl] getCurrentValue:', { currentDevice, value, valueTablet, valueMobile, result });
        return result;
    };

    const handleChange = (newValue: string) => {
        console.log('[ResponsiveSelectControl] handleChange called:', { newValue, currentDevice, options });
        switch (currentDevice) {
            case 'tablet':
                onChangeTablet(newValue);
                break;
            case 'mobile':
                onChangeMobile(newValue);
                break;
            default:
                onChange(newValue);
                break;
        }
    };

    return (
        <div className="elementor-control elementor-control-type-select" style={{ marginBottom: '16px' }}>
            {/* Elementor-style header: Label + Responsive Button inline */}
            <div
                className="elementor-control-content"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
            >
                <span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
                    {label}
                </span>
                <ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey={controlKey} />
            </div>
            <SelectControl value={getCurrentValue()} onChange={handleChange} options={options} help={help} __nextHasNoMarginBottom />
        </div>
    );
}
