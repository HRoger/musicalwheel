/**
 * Responsive Text Control Component
 *
 * A text input with responsive device dropdown, matching Elementor's pattern.
 * Used for CSS calc() values that can vary by device.
 *
 * IMPORTANT: Device state is managed by WordPress global store, not local state.
 * This ensures all responsive controls stay in sync when any one is changed.
 *
 * Features:
 * - Responsive device dropdown (desktop/tablet/mobile)
 * - Optional Voxel dynamic tag support
 * - Value cascade from desktop to smaller devices
 *
 * @package VoxelFSE
 */

import { TextControl } from '@wordpress/components';
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

import { useDeviceType, type DeviceType } from '@shared/utils/deviceType';

interface ResponsiveTextControlProps {
	/** Control label */
	label: string;
	/** Help text */
	help?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Block attributes object */
	attributes: Record<string, any>;
	/** setAttributes function */
	setAttributes: (attrs: Record<string, any>) => void;
	/** Base attribute name (e.g., 'calcMinHeight' → calcMinHeight, calcMinHeight_tablet, calcMinHeight_mobile) */
	attributeBaseName: string;
	/** Enable dynamic tags support */
	enableDynamicTags?: boolean;
	/** Dynamic tag context (default: 'post') */
	context?: string;
	/** Optional control key for state persistence */
	controlKey?: string;
}

/**
 * Get the attribute name for a specific device
 */
function getAttributeName(baseName: string, device: DeviceType): string {
	if (device === 'desktop') return baseName;
	return `${baseName}_${device}`;
}

export default function ResponsiveTextControl({
	label,
	help,
	placeholder = '',
	attributes,
	setAttributes,
	attributeBaseName,
	enableDynamicTags = false,
	context = 'post',
	controlKey,
}: ResponsiveTextControlProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Get WordPress's current device type from the store - this is the source of truth
	const activeDevice = useDeviceType();

	// Get attribute name for current device
	const attributeName = getAttributeName(attributeBaseName, activeDevice);

	// Get current value - cascade from desktop if not set
	const desktopValue = attributes[attributeBaseName] ?? '';
	const tabletValue = attributes[`${attributeBaseName}_tablet`] ?? '';
	const mobileValue = attributes[`${attributeBaseName}_mobile`] ?? '';

	let currentValue = '';
	let cascadePlaceholder = placeholder;

	if (activeDevice === 'desktop') {
		currentValue = desktopValue;
	} else if (activeDevice === 'tablet') {
		currentValue = tabletValue;
		cascadePlaceholder = desktopValue || placeholder;
	} else {
		currentValue = mobileValue;
		cascadePlaceholder = tabletValue || desktopValue || placeholder;
	}

	// Dynamic tag helpers
	const hasDynamicTags = () => {
		return typeof currentValue === 'string' && currentValue.startsWith('@tags()') && currentValue.includes('@endtags()');
	};

	const getTagContent = () => {
		if (!hasDynamicTags()) return currentValue || '';
		const match = currentValue.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : currentValue;
	};

	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	const handleEditTags = () => {
		setIsModalOpen(true);
	};

	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			setAttributes({ [attributeName]: '' });
		}
	};

	const handleModalSave = (newValue: string) => {
		if (newValue) {
			setAttributes({ [attributeName]: wrapWithTags(newValue) });
		}
		setIsModalOpen(false);
	};

	const isTagsActive = hasDynamicTags();

	return (
		<div className="voxel-fse-responsive-text-control">
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
				{/* Voxel dynamic tag button - appears before label when enabled */}
				{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
				<div style={{ flex: 1 }}>
					<span className="components-base-control__label" style={{ marginBottom: 0 }}>
						{label}
					</span>
				</div>
				<div>
					<ResponsiveDropdownButton controlKey={controlKey} />
				</div>
			</div>

			{/* Show text input OR dynamic tag panel */}
			{enableDynamicTags && isTagsActive ? (
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
				}}>
					{/* Tag content row */}
					<div style={{ marginBottom: '12px' }}>
						<span style={{
							color: '#fff',
							fontSize: '13px',
							fontFamily: 'inherit',
							wordBreak: 'break-all',
						}}>
							{getTagContent()}
						</span>
					</div>

					{/* Light gray divider */}
					<div style={{
						height: '1px',
						backgroundColor: 'rgba(255, 255, 255, 0.15)',
						marginBottom: '8px',
					}} />

					{/* Action buttons row */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							className="edit-tags"
							onClick={handleEditTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'left',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							className="disable-tags"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.5)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'right',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				<TextControl
					__nextHasNoMarginBottom
					value={currentValue}
					onChange={(value: string) => setAttributes({ [attributeName]: value })}
					placeholder={cascadePlaceholder}
					help={help}
				/>
			)}

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={context}
					onClose={() => setIsModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}
