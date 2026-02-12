/**
 * Print Template Block - Editor Component
 *
 * Uses ServerSideRender so the editor preview uses render.php —
 * the SAME code path as the frontend. Zero duplicated rendering logic.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/print-template.php
 * - render.php handles all rendering (Voxel + WordPress fallback)
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import ServerSideRender from '@wordpress/server-side-render';
import type { PrintTemplateAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab } from './inspector';

interface EditProps {
	attributes: PrintTemplateAttributes;
	setAttributes: (attrs: Partial<PrintTemplateAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockProps = useBlockProps({
		className: 'voxel-fse-print-template',
	});

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	return (
		<div {...blockProps}>
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
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Editor preview — calls render.php (same code path as frontend) */}
			<ServerSideRender
				block="voxel-fse/print-template"
				attributes={attributes}
			/>
		</div>
	);
}
