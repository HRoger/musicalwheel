/**
 * Slider Block - Editor Component
 *
 * InspectorControls matching Voxel Elementor widget 1:1.
 * Evidence: themes/voxel/app/widgets/slider.php
 *
 * Control Sections:
 * - Content Tab: Images, Icons
 * - Style Tab: General, Thumbnails, Carousel Navigation
 * - Advanced Tab: Standard Voxel advanced controls
 * - Voxel Tab: Visibility
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback, useRef, useMemo } from 'react';
import type { EditProps, SliderBlockAttributes, SliderImage, ProcessedImage } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import SliderComponent from './shared/SliderComponent';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateSliderResponsiveCSS } from './styles';

/**
 * Process images for display
 */
function processImages(
	images: SliderImage[],
	displaySize: string,
	lightboxSize: string,
	visibleCount: number
): ProcessedImage[] {
	// Remove duplicates by ID
	const uniqueImages = images.filter(
		(img, index, self) => self.findIndex((i) => i.id === img.id) === index
	);

	// Limit to visible count
	const limitedImages = visibleCount > 0 ? uniqueImages.slice(0, visibleCount) : uniqueImages;

	return limitedImages.map((image) => {
		// Get URL for display size
		let src = image.url;
		if (image.sizes && image.sizes[displaySize]) {
			src = image.sizes[displaySize]?.url || image.url;
		}

		// Get URL for lightbox size
		let srcLightbox = image.url;
		if (image.sizes && image.sizes[lightboxSize]) {
			srcLightbox = image.sizes[lightboxSize]?.url || image.url;
		}

		// Get thumbnail URL
		let srcThumbnail = image.url;
		if (image.sizes && image.sizes.thumbnail) {
			srcThumbnail = image.sizes.thumbnail.url;
		}

		return {
			id: image.id,
			src,
			srcLightbox,
			srcThumbnail,
			alt: image.alt || '',
			caption: image.caption || '',
			description: image.description || '',
			title: image.title || '',
		};
	});
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-slider',
	});

	// Generate slider-specific responsive CSS with useMemo for performance
	const sliderResponsiveCSS = useMemo(
		() => generateSliderResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, sliderResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, sliderResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// Generate gallery ID for lightbox grouping
	const galleryId = `slider-${attributes.blockId || clientId}`;

	// Process images for display
	const processedImages = processImages(
		attributes.images || [],
		attributes.displaySize,
		attributes.lightboxSize,
		attributes.visibleCount
	);

	/**
	 * Handle image selection from media library
	 */
	const onSelectImages = useCallback(
		(mediaItems: SliderImage[]) => {
			const newImages: SliderImage[] = mediaItems.map((media) => ({
				id: media.id,
				url: media.url,
				alt: media.alt || '',
				caption: media.caption || '',
				description: media.description || '',
				title: media.title || '',
				sizes: media.sizes,
			}));
			setAttributes({ images: newImages });
		},
		[setAttributes]
	);

	/**
	 * Media frame ref for wp.media
	 */
	const mediaFrameRef = useRef<ReturnType<typeof wp.media> | null>(null);

	/**
	 * Open media library gallery
	 */
	const openMediaLibrary = useCallback(() => {
		// If frame already exists, open it
		if (mediaFrameRef.current) {
			mediaFrameRef.current.open();
			return;
		}

		// Create new frame
		// @ts-ignore - wp.media is global
		mediaFrameRef.current = wp.media({
			title: __('Select Images for Slider', 'voxel-fse'),
			button: { text: __('Add to Slider', 'voxel-fse') },
			multiple: 'add',
			library: { type: 'image' },
		});

		// Handle selection
		mediaFrameRef.current.on('select', () => {
			const selection = mediaFrameRef.current?.state().get('selection');
			if (selection) {
				const mediaItems = selection.map((attachment: { toJSON: () => SliderImage }) => {
					const json = attachment.toJSON();
					return {
						id: json.id,
						url: json.url,
						alt: json.alt || '',
						caption: json.caption || '',
						description: json.description || '',
						title: json.title || '',
						sizes: json.sizes,
					};
				});
				onSelectImages(mediaItems);
			}
		});

		mediaFrameRef.current.open();
	}, [onSelectImages]);

	return (
		<div {...blockProps}>
			{/* Output combined responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
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
			<SliderComponent
				attributes={attributes}
				context="editor"
				processedImages={processedImages}
				galleryId={galleryId}
				onOpenMediaLibrary={openMediaLibrary}
			/>
		</div>
	);
}
