/**
 * Print Template Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Matches Voxel's print-template widget: themes/voxel/app/widgets/print-template.php:L27-39
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	AccordionPanelGroup,
	AccordionPanel,
	PostSelectControl,
} from '@shared/controls';
import type { PrintTemplateAttributes } from '../types';

interface ContentTabProps {
	attributes: PrintTemplateAttributes;
	setAttributes: (attrs: Partial<PrintTemplateAttributes>) => void;
}

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="print-template"
		>
			<AccordionPanel
				id="print-template"
				title={__('Print an Elementor template', 'voxel-fse')}
			>
				{/* Single unified template selector - matches Voxel's voxel-post-select */}
				<PostSelectControl
					label={__('Template', 'voxel-fse')}
					value={attributes.templateId}
					onChange={(value) => setAttributes({ templateId: value })}
					postTypes={['page', 'wp_block', 'elementor_library']}
					placeholder={__('Search templates', 'voxel-fse')}
					enableDynamicTags={true}
					context="post"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
