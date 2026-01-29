/**
 * Countdown Block - Editor Component
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { InspectorTabs, AdvancedTab, VoxelTab } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';

import type { CountdownAttributes, CountdownConfig } from './types';
import { CountdownComponent } from './shared/CountdownComponent';
import { ContentTab, StyleTab } from './inspector';

interface EditProps {
	attributes: CountdownAttributes;
	setAttributes: (attributes: Partial<CountdownAttributes>) => void;
}

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return `countdown-${Math.random().toString(36).substring(2, 11)}`;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	// Get blockId or use default
	const blockId = attributes.blockId || 'countdown';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-countdown-block-editor',
		selectorPrefix: 'voxel-fse-countdown',
	});

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: advancedProps.styles,
	});

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Convert attributes to config for preview
	const config: CountdownConfig = {
		dueDate: attributes.dueDate,
		countdownEndedText: attributes.countdownEndedText,
		hideSeconds: attributes.hideSeconds,
		hideMinutes: attributes.hideMinutes,
		hideHours: attributes.hideHours,
		hideDays: attributes.hideDays,
		disableAnimation: attributes.disableAnimation,
		horizontalOrientation: attributes.horizontalOrientation,
		itemSpacing: attributes.itemSpacing,
		itemSpacing_tablet: attributes.itemSpacing_tablet,
		itemSpacing_mobile: attributes.itemSpacing_mobile,
		itemSpacingUnit: attributes.itemSpacingUnit,
		contentSpacing: attributes.contentSpacing,
		contentSpacing_tablet: attributes.contentSpacing_tablet,
		contentSpacing_mobile: attributes.contentSpacing_mobile,
		contentSpacingUnit: attributes.contentSpacingUnit,
		textColor: attributes.textColor,
		numberColor: attributes.numberColor,
		endedColor: attributes.endedColor,
		textTypography: attributes.textTypography,
		numberTypography: attributes.numberTypography,
		endedTypography: attributes.endedTypography,
	};

	// Set default due date if not set (tomorrow at current time)
	useEffect(() => {
		if (!attributes.dueDate) {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			setAttributes({ dueDate: tomorrow.toISOString() });
		}
	}, []);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: () => (
								<ContentTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'advanced',
							label: __('Advanced', 'voxel-fse'),
							icon: '\ue916',
							render: () => (
								<AdvancedTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'voxel',
							label: __('Voxel', 'voxel-fse'),
							icon: '/wp-content/themes/voxel/assets/images/post-types/logo.svg',
							render: () => (
								<VoxelTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
					]}
				/>
			</InspectorControls>

			{/* Block Preview */}
			<div {...blockProps}>
				<CountdownComponent config={config} isEditor={true} />
			</div>
		</>
	);
}
