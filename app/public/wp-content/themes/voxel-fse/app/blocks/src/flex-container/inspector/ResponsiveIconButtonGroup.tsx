/**
 * Flex Container Block - Responsive Icon Button Group Component
 *
 * A reusable component for responsive icon button groups that:
 * - Syncs with WordPress device preview
 * - Supports value inheritance (mobile inherits from tablet, tablet from desktop)
 * - Toggle functionality (click selected button to deselect)
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import { ButtonGroup, Button } from '@wordpress/components';
import { ResponsiveDropdownButton } from '@shared/controls';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveIconButtonGroupProps {
	label: string;
	attributeBaseName: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	options: { value: string; icon: React.ReactNode; label: string }[];
	note?: string;
}

export function ResponsiveIconButtonGroup({
	label,
	attributeBaseName,
	attributes,
	setAttributes,
	options,
	note,
}: ResponsiveIconButtonGroupProps): JSX.Element {
	// Get WordPress's current device type
	const wpDeviceType = (useSelect as any)((select: any) => {
		const editPostStore = select('core/edit-post');
		if (editPostStore && typeof (editPostStore as any).getPreviewDeviceType === 'function') {
			return (editPostStore as any).getPreviewDeviceType();
		}
		const editorStore = select('core/editor');
		if (editorStore && typeof (editorStore as any).getDeviceType === 'function') {
			return (editorStore as any).getDeviceType();
		}
		return 'Desktop';
	}, []);

	const wpDevice = wpDeviceType ? (wpDeviceType.toLowerCase() as DeviceType) : 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	useEffect(() => {
		if (wpDeviceType) {
			setCurrentDevice(wpDevice);
		}
	}, [wpDeviceType, wpDevice]);

	// Get attribute name for current device
	const getAttributeName = () => {
		if (currentDevice === 'desktop') return attributeBaseName;
		return `${attributeBaseName}_${currentDevice}`;
	};

	// Get current value with inheritance
	const getValue = () => {
		const attrName = getAttributeName();
		let value = attributes[attrName];

		if (value === undefined || value === null) {
			if (currentDevice === 'tablet') {
				return attributes[attributeBaseName];
			} else if (currentDevice === 'mobile') {
				const tabletValue = attributes[`${attributeBaseName}_tablet`];
				return tabletValue !== undefined ? tabletValue : attributes[attributeBaseName];
			}
		}

		return value;
	};

	// Set value for current device - with toggle functionality (Elementor-style)
	// Clicking an already-selected button will deselect it (clear the value)
	const setValue = (newValue: string) => {
		const attrName = getAttributeName();
		// Toggle: if clicking the same value, clear it (deselect)
		if (currentValue === newValue) {
			setAttributes({ [attrName]: undefined });
		} else {
			setAttributes({ [attrName]: newValue });
		}
	};

	const currentValue = getValue();

	return (
		<div className="voxel-fse-responsive-icon-group" style={{ marginBottom: '16px' }}>
			{/* Header with label and responsive toggle (no separate reset - buttons toggle) */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span
						style={{
							fontSize: '11px',
							fontWeight: 500,
							textTransform: 'uppercase' as const,
							color: '#1e1e1e',
						}}
					>
						{label}
					</span>
					<ResponsiveDropdownButton
						onDeviceChange={setCurrentDevice}
					/>
				</div>
			</div>

			{/* Icon Buttons - each button toggles on/off when clicked */}
			<ButtonGroup style={{ display: 'flex', width: '100%', gap: '4px' }}>
				{options.map((opt) => (
					<Button
						key={opt.value}
						onClick={() => setValue(opt.value)}
						style={{
							flex: 1,
							justifyContent: 'center',
							minWidth: '36px',
							height: '36px',
							padding: '0',
							backgroundColor: currentValue === opt.value ? 'var(--vxfse-accent-color, #3858e9)' : '#f0f0f1',
							color: currentValue === opt.value ? '#ffffff' : '#1e1e1e',
							borderColor: currentValue === opt.value ? 'var(--vxfse-accent-color, #3858e9)' : '#dcdcde',
							transition: 'all 0.2s ease',
						}}
						label={opt.label}
						showTooltip
					>
						{opt.icon}
					</Button>
				))}
			</ButtonGroup>

			{/* Note text */}
			{note && (
				<p
					style={{
						fontSize: '12px',
						color: '#757575',
						marginTop: '8px',
						marginBottom: '0',
						fontStyle: 'italic',
					}}
				>
					{note}
				</p>
			)}
		</div>
	);
}
