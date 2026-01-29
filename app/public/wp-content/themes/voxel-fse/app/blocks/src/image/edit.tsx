/**
 * Image Block - Editor Component
 *
 * Follows the mandatory inspector folder structure pattern.
 * - Edit component: Rendering + data fetching ONLY
 * - Inspector controls: Separated into inspector/ folder
 *
 * 1:1 match with Voxel/Elementor Image widget controls:
 * - Content: Image selection, resolution, caption, link options
 * - Advanced: Layout, spacing, motion effects, custom CSS
 * - Voxel: Visibility controls
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/image.php
 * - Elementor base: Elementor Widget_Image class
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import type { ImageBlockAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import ImageComponent from './shared/ImageComponent';
import { generateImageStyles } from './styles';
import {
	generateAdvancedStyles,
	combineBlockClasses,
} from '../../shared/utils/generateAdvancedStyles';

interface EditProps {
	attributes: ImageBlockAttributes;
	setAttributes: (attrs: Partial<ImageBlockAttributes>) => void;
	clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Generate advanced styles from AdvancedTab controls
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes),
		[attributes]
	);

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-image voxel-fse-image-wrapper-${attributes.blockId}`,
			attributes
		),
		style: advancedStyles,
	});

	/**
	 * Handle image selection from media library
	 */
	const onSelectImage = (media: any) => {
		// Get the URL for the selected size
		let url = media.url;
		if (media.sizes && attributes.imageSize && media.sizes[attributes.imageSize]) {
			url = media.sizes[attributes.imageSize].url;
		}

		setAttributes({
			image: {
				id: media.id || 0,
				url: url,
				alt: media.alt || '',
				width: media.width || 0,
				height: media.height || 0,
			},
		});
	};

	return (
		<div {...blockProps}>
			<style>{generateImageStyles(attributes, attributes.blockId)}</style>
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
			<ImageComponent attributes={attributes} context="editor" onSelectImage={onSelectImage} />
		</div>
	);
}
