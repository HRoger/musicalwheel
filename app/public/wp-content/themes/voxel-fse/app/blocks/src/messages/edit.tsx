/**
 * Messages Block - Editor Component
 *
 * 1:1 match with Voxel's Messages (VX) widget:
 * - Direct messages inbox functionality
 * - Real-time chat with polling
 * - Icon configuration
 * - Extensive style controls
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/direct-messages/widgets/messages-widget.php
 * - Template: themes/voxel/app/modules/direct-messages/templates/frontend/messages-widget.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useEffect, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import type { MessagesAttributes } from './types';
import MessagesComponent from './shared/MessagesComponent';
import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateMessagesResponsiveCSS } from './styles';

// Import inspector tabs
import { ContentTab, StyleTab } from './inspector';

interface EditProps {
	attributes: MessagesAttributes;
	setAttributes: (attrs: Partial<MessagesAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'voxel-fse-messages',
		selectorPrefix: 'voxel-fse-messages',
	});

	// Generate messages-specific responsive CSS
	const messagesResponsiveCSS = useMemo(
		() => generateMessagesResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, messagesResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, messagesResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

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
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
					defaultTab="content"
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Editor Preview */}
				<MessagesComponent attributes={attributes} context="editor" />
			</div>
		</>
	);
}
