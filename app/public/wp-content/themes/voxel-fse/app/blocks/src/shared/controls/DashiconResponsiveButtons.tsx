import { Button, ButtonGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface DashiconResponsiveButtonsProps {
    currentDevice: 'desktop' | 'tablet' | 'mobile';
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function DashiconResponsiveButtons({
    currentDevice,
    onDeviceChange,
}: DashiconResponsiveButtonsProps) {
    // Essential Blocks responsive button styling
    const getButtonStyle = (device: string) => ({
        backgroundColor: currentDevice === device ? '#6C40F7' : '#e8e8e8',
        borderRadius: '3px',
        color: currentDevice === device ? '#ffffff' : '#5f5f5f',
        cursor: 'pointer',
        fontSize: '11px',
        height: '18px',
        lineHeight: '18px',
        width: '18px',
        minWidth: '18px',
        margin: '0 8px 0 0',
        padding: 0,
        position: 'relative' as const,
        textAlign: 'center' as const,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    return (
        <ButtonGroup style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <Button
                onClick={() => onDeviceChange('desktop')}
                style={getButtonStyle('desktop')}
                aria-label={__('Desktop', 'voxel-fse')}
                showTooltip
            >
                <span className="dashicons dashicons-desktop" style={{ fontSize: '11px' }} />
            </Button>
            <Button
                onClick={() => onDeviceChange('tablet')}
                style={getButtonStyle('tablet')}
                aria-label={__('Tablet', 'voxel-fse')}
                showTooltip
            >
                <span className="dashicons dashicons-tablet" style={{ fontSize: '11px' }} />
            </Button>
            <Button
                onClick={() => onDeviceChange('mobile')}
                style={getButtonStyle('mobile')}
                aria-label={__('Mobile', 'voxel-fse')}
                showTooltip
            >
                <span className="dashicons dashicons-smartphone" style={{ fontSize: '11px' }} />
            </Button>
        </ButtonGroup>
    );
}
