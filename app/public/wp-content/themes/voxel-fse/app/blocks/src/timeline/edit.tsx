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
import { useEffect } from 'react';
import type { EditProps } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab } from './inspector';
import { Timeline } from './shared';

/**
 * Timeline Block Editor Component
 */
export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-social-feed-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/social-feed.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

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
