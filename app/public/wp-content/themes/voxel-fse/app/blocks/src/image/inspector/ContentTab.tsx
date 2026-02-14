/**
 * Image Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Maps 1:1 to Elementor Widget_Image Content tab controls.
 *
 * Evidence: themes/voxel/app/widgets/image.php:9 (extends Elementor Widget_Image)
 * Documentation: docs/block-conversions/image/phase2-improvements.md
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ImageUploadControl,
	DynamicTagTextControl,
	ImageSizeWithCustomControl,
} from '@shared/controls';
import type { ImageBlockAttributes } from '../types';

interface ContentTabProps {
	attributes: ImageBlockAttributes;
	setAttributes: (attrs: Partial<ImageBlockAttributes>) => void;
}

/**
 * Caption source options
 */
const CAPTION_OPTIONS = [
	{ label: __('None', 'voxel-fse'), value: 'none' },
	{ label: __('Attachment Caption', 'voxel-fse'), value: 'attachment' },
	{ label: __('Custom Caption', 'voxel-fse'), value: 'custom' },
];

/**
 * Link options
 */
const LINK_OPTIONS = [
	{ label: __('None', 'voxel-fse'), value: 'none' },
	{ label: __('Media File', 'voxel-fse'), value: 'file' },
	{ label: __('Custom URL', 'voxel-fse'), value: 'custom' },
];

/**
 * Lightbox options
 */
const LIGHTBOX_OPTIONS = [
	{ label: __('Default', 'voxel-fse'), value: 'default' },
	{ label: __('Yes', 'voxel-fse'), value: 'yes' },
	{ label: __('No', 'voxel-fse'), value: 'no' },
];

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	// Fetch media details to get available sizes
	const media = useSelect((select: any) => {
		return attributes.image.id ? select('core').getMedia(attributes.image.id) : null;
	});

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="image"
		>
			{/* Image Section - Contains all Content tab controls */}
			<AccordionPanel id="image" title={__('Image', 'voxel-fse')}>
				<ImageUploadControl
					label={__('Choose Image', 'voxel-fse')}
					value={attributes.image}
					onChange={(media: any) => {
						if (!media) {
							setAttributes({
								image: {
									id: 0,
									url: '',
									alt: '',
									width: 0,
									height: 0,
								},
							});
							return;
						}

						// Get the URL for the selected size
						let url = media.url || '';
						if (media.sizes && attributes.imageSize && media.sizes[attributes.imageSize]) {
							url = media.sizes[attributes.imageSize].url;
						}

						setAttributes({
							image: {
								id: media.id || 0,
								url: url,
								alt: media.alt || '',
								width: (media.width as number) || 0,
								height: (media.height as number) || 0,
							},
						});
					}}
					enableDynamicTags={true}
					dynamicTagValue={attributes.imageDynamicTag}
					onDynamicTagChange={(value) => setAttributes({ imageDynamicTag: value })}
				/>

				<ImageSizeWithCustomControl
					label={__('Image Resolution', 'voxel-fse')}
					value={attributes.imageSize}
					onChange={(value) => {
						const newAttrs: Partial<ImageBlockAttributes> = { imageSize: value };

						// Try to find the URL for the selected size
						if (value !== 'custom' && media && media.media_details && media.media_details.sizes) {
							if (media.media_details.sizes[value]) {
								newAttrs.image = {
									...attributes.image,
									url: media.media_details.sizes[value].source_url
								};
							} else if (value === 'full' && media.source_url) {
								newAttrs.image = {
									...attributes.image,
									url: media.source_url
								};
							}
						}

						setAttributes(newAttrs);
					}}
					customWidth={attributes.customWidth}
					customHeight={attributes.customHeight}
					onCustomDimensionsChange={(width, height) => setAttributes({ customWidth: width, customHeight: height })}
				/>

				{/* Caption controls within Image accordion */}
				<SelectControl
					label={__('Caption', 'voxel-fse')}
					value={attributes.captionSource}
					options={CAPTION_OPTIONS}
					onChange={(value: any) => setAttributes({ captionSource: value as 'none' | 'attachment' | 'custom' })}
				/>

				{attributes.captionSource === 'custom' && (
					<DynamicTagTextControl
						label={__('Custom Caption', 'voxel-fse')}
						value={attributes.caption}
						onChange={(value) => setAttributes({ caption: value })}
						placeholder={__('Enter your image caption', 'voxel-fse')}
						context="post"
					/>
				)}

				{/* Link controls within Image accordion */}
				<SelectControl
					label={__('Link', 'voxel-fse')}
					value={attributes.linkTo}
					options={LINK_OPTIONS}
					onChange={(value: any) => setAttributes({ linkTo: value as 'none' | 'file' | 'custom' })}
				/>

				{attributes.linkTo === 'custom' && (
					<DynamicTagTextControl
						label={__('Link URL', 'voxel-fse')}
						value={attributes.link.url}
						onChange={(value) => setAttributes({ link: { ...attributes.link, url: value } })}
						placeholder={__('Type or paste your URL', 'voxel-fse')}
						context="post"
					/>
				)}

				{attributes.linkTo === 'file' && (
					<>
						<SelectControl
							label={__('Lightbox', 'voxel-fse')}
							value={attributes.openLightbox}
							options={LIGHTBOX_OPTIONS}
							onChange={(value: any) => setAttributes({ openLightbox: value as 'default' | 'yes' | 'no' })}
							help={__("Manage your site's lightbox settings in the Lightbox panel.", 'voxel-fse')}
						/>
						<TextControl
							label={__('Lightbox Group', 'voxel-fse')}
							value={attributes.lightboxGroup || ''}
							onChange={(value: string) => setAttributes({ lightboxGroup: value })}
							placeholder={__('e.g. gallery-1', 'voxel-fse')}
							help={__('Group images into a slideshow by entering the same name.', 'voxel-fse')}
							__nextHasNoMarginBottom
						/>
					</>
				)}
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
