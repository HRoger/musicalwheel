/**
 * Gallery Block - Editor Component
 *
 * 1:1 match with Voxel Gallery widget controls:
 * - Content: Images, columns, row height, mosaic settings
 * - Style: Image styling, overlay, empty item, view all button
 * - Advanced: Auto-merged by Block_Loader.php
 * - Voxel: Visibility controls
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/gallery.php
 * - Template: themes/voxel/templates/widgets/gallery.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import type { GalleryBlockAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import GalleryComponent from './shared/GalleryComponent';
import { getAdvancedVoxelTabProps } from '@shared/utils';

interface EditProps {
	attributes: GalleryBlockAttributes;
	setAttributes: (attrs: Partial<GalleryBlockAttributes>) => void;
	clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-gallery-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/gallery.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Generate Advanced and Voxel tab props
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || clientId,
		baseClass: 'ts-gallery flexify simplify-ul voxel-fse-gallery',
	});

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	return (
		<ul {...blockProps}>
			{/* Render responsive CSS from tabs */}
			{advancedProps.responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
			)}

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
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<GalleryComponent
				attributes={attributes}
				context="editor"
				blockId={clientId}
			/>
		</ul>
	);
}
