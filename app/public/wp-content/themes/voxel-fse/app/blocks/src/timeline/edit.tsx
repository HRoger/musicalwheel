/**
 * Timeline Block - Editor Component
 *
 * Maps all Voxel Timeline Elementor controls to Gutenberg InspectorControls.
 * Evidence: themes/voxel/app/widgets/timeline.php (lines 23-307)
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { EditProps } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab } from './inspector';
import { Timeline } from './shared';

/**
 * Timeline Block Editor Component
 */
export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const blockProps = useBlockProps({
		className: 'voxel-fse-timeline-block-editor',
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
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Block Preview - Shared Timeline Component */}
			<div {...blockProps}>
				<Timeline attributes={attributes} context="editor" className="voxel-fse-timeline-editor" />
			</div>
		</>
	);
}
