/**
 * Slider Block - Save Function (Plan C+)
 *
 * Outputs static HTML with vxconfig JSON for frontend hydration.
 * No PHP rendering - headless-ready architecture.
 *
 * Evidence: themes/voxel/templates/widgets/slider.php
 * HTML structure matches Voxel widget 1:1
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { SaveProps, SliderVxConfig, ProcessedImage } from './types';
import { generateSliderResponsiveCSS } from './styles';

/**
 * Get icon class string from IconValue
 */
function getIconClass(icon: { library: string; value: string } | undefined): string {
	if (!icon || !icon.value) {
		return '';
	}
	return icon.value;
}

/**
 * Process images for vxconfig
 */
function processImagesForConfig(
	images: SaveProps['attributes']['images'],
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

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'slider';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'voxel-fse-slider',
		});

		// Generate slider-specific responsive CSS
		const sliderResponsiveCSS = generateSliderResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, sliderResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Block props with AdvancedTab styles wired
		const blockProps = useBlockProps.save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes.visibilityBehavior || undefined,
			'data-visibility-rules': attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes.loopSource || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Process images for config
		const processedImages = processImagesForConfig(
			attributes.images,
			attributes.displaySize,
			attributes.lightboxSize,
			attributes.visibleCount
		);

		// Generate unique gallery ID
		const galleryId = `slider-${attributes.blockId || 'default'}`;

		// Build vxconfig object
		const vxConfig: SliderVxConfig = {
			// Images
			images: processedImages,
			visibleCount: attributes.visibleCount,
			displaySize: attributes.displaySize,
			lightboxSize: attributes.lightboxSize,
			linkType: attributes.linkType,
			customLinkUrl: attributes.customLinkUrl,
			customLinkTarget: attributes.customLinkTarget,
			showThumbnails: attributes.showThumbnails,
			autoSlide: attributes.autoSlide,
			autoSlideInterval: attributes.autoSlideInterval,

			// Icons
			rightChevronIcon: getIconClass(attributes.rightChevronIcon),
			leftChevronIcon: getIconClass(attributes.leftChevronIcon),

			// Gallery ID for lightbox grouping
			galleryId,

			// Style settings
			imageAspectRatio: attributes.imageAspectRatio,
			imageBorderRadius: attributes.imageBorderRadius,
			imageOpacity: attributes.imageOpacity,
			imageOpacityHover: attributes.imageOpacityHover,
			thumbnailSize: attributes.thumbnailSize,
			thumbnailBorderRadius: attributes.thumbnailBorderRadius,
			thumbnailOpacity: attributes.thumbnailOpacity,
			thumbnailOpacityHover: attributes.thumbnailOpacityHover,
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* vxconfig JSON for frontend hydration */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Placeholder for React hydration */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							padding: '40px 16px',
							minHeight: '200px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="48"
							height="48"
							fill="currentColor"
							style={{ opacity: 0.3 }}
						>
							<path d="M2 6h4v12H2V6zm6-2h8v16H8V4zm10 2h4v12h-4V6z" />
						</svg>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
