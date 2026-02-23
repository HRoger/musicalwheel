/**
 * Responsive Control Wrapper Component
 *
 * Wraps any control with a label and responsive device selector.
 * Used for controls that need responsive support but aren't sliders.
 *
 * @package VoxelFSE
 */

import { BaseControl } from '@wordpress/components';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveControlProps {
	label: string;
	currentDevice: DeviceType;
	onDeviceChange: (device: DeviceType) => void;
	children: React.ReactNode;
	help?: string;
}

export default function ResponsiveControl({
	label,
	currentDevice: _currentDevice,
	onDeviceChange,
	children,
	help,
}: ResponsiveControlProps) {
	return (
		<BaseControl
			label={
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
					<span>{label}</span>
					<ResponsiveDropdownButton onDeviceChange={onDeviceChange} />
				</div>
			}
			help={help}
			__nextHasNoMarginBottom
		>
			{children}
		</BaseControl>
	);
}