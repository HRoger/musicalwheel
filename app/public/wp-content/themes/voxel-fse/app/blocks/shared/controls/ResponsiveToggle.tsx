/**
 * Responsive Toggle Control Component
 *
 * A toggle/switcher with responsive device dropdown, matching Elementor's pattern.
 * Shows Yes/No switcher style toggle that can vary by device.
 *
 * IMPORTANT: Device state is managed by WordPress global store, not local state.
 * This ensures all responsive controls stay in sync when any one is changed.
 *
 * @package VoxelFSE
 */

import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveToggleProps {
	/** Control label */
	label: string;
	/** Help text */
	help?: string;
	/** Block attributes object */
	attributes: Record<string, any>;
	/** setAttributes function */
	setAttributes: (attrs: Record<string, any>) => void;
	/** Base attribute name (e.g., 'enableInlineFlex' → enableInlineFlex, enableInlineFlex_tablet, enableInlineFlex_mobile) */
	attributeBaseName: string;
	/** Whether to show the responsive device button (default: true) */
	showResponsiveButton?: boolean;
}

/**
 * Get the attribute name for a specific device
 */
function getAttributeName(baseName: string, device: DeviceType): string {
	if (device === 'desktop') return baseName;
	return `${baseName}_${device}`;
}

export default function ResponsiveToggle({
	label,
	help,
	attributes,
	setAttributes,
	attributeBaseName,
	showResponsiveButton = true,
}: ResponsiveToggleProps) {
	// Get WordPress's current device type from the store - this is the source of truth
	const activeDevice = useSelect((select) => {
		const { getDeviceType } = (select('core/editor') as any) || {};
		if (typeof getDeviceType === 'function') {
			const device = getDeviceType();
			if (device) return device.toLowerCase() as DeviceType;
		}

		const { __experimentalGetPreviewDeviceType: experimentalGetPreviewDeviceType } =
			(select('core/edit-post') as any) || {};
		if (typeof experimentalGetPreviewDeviceType === 'function') {
			const device = experimentalGetPreviewDeviceType();
			if (device) return device.toLowerCase() as DeviceType;
		}

		return 'desktop' as DeviceType;
	}, []);

	// Get attribute name for current device
	const attributeName = showResponsiveButton
		? getAttributeName(attributeBaseName, activeDevice)
		: attributeBaseName;

	// Get current value - for responsive, cascade from desktop if not set explicitly
	const desktopValue = attributes[attributeBaseName] ?? false;

	let currentValue: boolean;
	if (!showResponsiveButton) {
		currentValue = desktopValue;
	} else if (activeDevice === 'desktop') {
		currentValue = desktopValue;
	} else if (activeDevice === 'tablet') {
		// Tablet defaults to desktop value if not explicitly set
		currentValue = attributes[`${attributeBaseName}_tablet`] ?? desktopValue;
	} else {
		// Mobile defaults to tablet value, then desktop
		currentValue =
			attributes[`${attributeBaseName}_mobile`] ??
			attributes[`${attributeBaseName}_tablet`] ??
			desktopValue;
	}

	if (!showResponsiveButton) {
		return (
			<ToggleControl
				__nextHasNoMarginBottom
				label={label}
				help={help}
				checked={currentValue}
				onChange={(value) => setAttributes({ [attributeName]: value })}
			/>
		);
	}

	return (
		<div className="voxel-fse-responsive-toggle" style={{ marginBottom: '20px' }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span className="components-base-control__label" style={{ marginBottom: 0 }}>
						{label}
					</span>
					<ResponsiveDropdownButton />
				</div>
				<div>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={currentValue}
						onChange={(value) => setAttributes({ [attributeName]: value })}
					/>
				</div>
			</div>
			{help && (
				<p className="components-base-control__help" style={{ marginTop: '4px', marginBottom: 0 }}>
					{help}
				</p>
			)}
		</div>
	);
}
