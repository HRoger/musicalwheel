/**
 * Gallery Component - Shared between Editor and Frontend
 *
 * Renders gallery grid matching Voxel template 1:1.
 * - Visible images with lightbox links
 * - "View all" button for hidden images
 * - Empty filler items for grid layout
 * - Mosaic grid positioning
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/gallery.php
 * - CSS: themes/voxel/assets/dist/gallery.css
 *
 * HTML Structure (from Voxel):
 * <ul class="ts-gallery flexify simplify-ul">
 *   <div class="ts-gallery-grid">
 *     <li>
 *       <a href="{lightbox}" data-elementor-open-lightbox="yes" ...>
 *         <div class="ts-image-overlay"></div>
 *         <img ...>
 *       </a>
 *     </li>
 *     <li class="ts-gallery-last-item">...</li>
 *     <li class="ts-empty-item"><div></div></li>
 *   </div>
 * </ul>
 *
 * @package VoxelFSE
 */

import { useMemo, useCallback } from 'react';
import type {
	GalleryBlockAttributes,
	GalleryComponentProps,
	ProcessedImage,
	GalleryVxConfig,
	MosaicConfig,
} from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons, renderIcon } from '@shared/utils';
import { generateGalleryStyles } from '../styles';

/**
 * Global VoxelLightbox API (provided by assets/dist/yarl-lightbox.js)
 */
interface VoxelLightboxAPI {
	open: (slides: Array<{ src: string; alt?: string }>, index?: number) => void;
	close: () => void;
}

/**
 * Process images for rendering
 */
function processImagesForRender(attributes: GalleryBlockAttributes): ProcessedImage[] {
	return attributes.images.map((img) => {
		// Get display URL based on selected size
		let srcDisplay = img.url;
		if (img.sizes && img.sizes[attributes.displaySize]) {
			srcDisplay = img.sizes[attributes.displaySize].url;
		}

		// Get lightbox URL based on selected size
		let srcLightbox = img.url;
		if (img.sizes && img.sizes[attributes.lightboxSize]) {
			srcLightbox = img.sizes[attributes.lightboxSize].url;
		}

		return {
			id: img.id,
			src_display: srcDisplay,
			src_lightbox: srcLightbox,
			alt: img.alt || '',
			caption: img.caption || '',
			description: img.description || '',
			title: img.title || '',
			display_size: attributes.displaySize,
		};
	});
}

/**
 * Extended CSSProperties to support CSS custom properties
 */
type CSSPropertiesWithCustom = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * Build CSS custom properties for inline styles
 */
function buildGridStyles(attributes: GalleryBlockAttributes): CSSPropertiesWithCustom {
	const styles: CSSPropertiesWithCustom = {};

	// Column gap
	if (attributes.columnGap !== undefined) {
		styles['--gallery-gap'] = `${attributes.columnGap}px`;
	}

	// Column count
	if (attributes.columnCount) {
		styles['--gallery-columns'] = attributes.columnCount;
	}

	// Row height (when not using aspect ratio)
	if (!attributes.useAspectRatio && attributes.rowHeight) {
		styles['--gallery-row-height'] = `${attributes.rowHeight}px`;
	}

	// Aspect ratio
	if (attributes.useAspectRatio && attributes.aspectRatio) {
		styles['--gallery-aspect-ratio'] = attributes.aspectRatio;
	}

	// Border radius
	if (attributes.imageBorderRadius) {
		styles['--gallery-radius'] = `${attributes.imageBorderRadius}px`;
	}

	// Overlay colors
	if (attributes.overlayColor) {
		styles['--gallery-overlay-color'] = attributes.overlayColor;
	}
	if (attributes.overlayColorHover) {
		styles['--gallery-overlay-color-hover'] = attributes.overlayColorHover;
	}

	// Empty item border
	if (attributes.emptyBorderType && attributes.emptyBorderType !== 'none') {
		styles['--gallery-empty-border-style'] = attributes.emptyBorderType;
		if (attributes.emptyBorderWidth) {
			styles['--gallery-empty-border-width'] = `${attributes.emptyBorderWidth}px`;
		}
		if (attributes.emptyBorderColor) {
			styles['--gallery-empty-border-color'] = attributes.emptyBorderColor;
		}
	}
	if (attributes.emptyBorderRadius) {
		styles['--gallery-empty-radius'] = `${attributes.emptyBorderRadius}px`;
	}

	// View all button
	if (attributes.viewAllBgColor) {
		styles['--gallery-viewall-bg'] = attributes.viewAllBgColor;
	}
	if (attributes.viewAllBgColorHover) {
		styles['--gallery-viewall-bg-hover'] = attributes.viewAllBgColorHover;
	}
	if (attributes.viewAllIconColor) {
		styles['--gallery-viewall-icon'] = attributes.viewAllIconColor;
	}
	if (attributes.viewAllIconColorHover) {
		styles['--gallery-viewall-icon-hover'] = attributes.viewAllIconColorHover;
	}
	if (attributes.viewAllIconSize) {
		styles['--gallery-viewall-icon-size'] = `${attributes.viewAllIconSize}px`;
	}
	if (attributes.viewAllTextColor) {
		styles['--gallery-viewall-text'] = attributes.viewAllTextColor;
	}
	if (attributes.viewAllTextColorHover) {
		styles['--gallery-viewall-text-hover'] = attributes.viewAllTextColorHover;
	}

	return styles;
}

/**
 * Build mosaic styles for individual grid item
 */
function buildMosaicItemStyles(
	mosaic: MosaicConfig,
	itemIndex: number
): React.CSSProperties {
	const itemKey = `item${itemIndex + 1}` as keyof MosaicConfig;
	const item = mosaic[itemKey];

	if (!item) return {};

	const styles: React.CSSProperties = {};

	if (item.colSpan) {
		styles.gridColumnEnd = `span ${item.colSpan}`;
	}
	if (item.colStart) {
		styles.gridColumnStart = item.colStart;
	}
	if (item.rowSpan) {
		styles.gridRowEnd = `span ${item.rowSpan}`;
	}
	if (item.rowStart) {
		styles.gridRowStart = item.rowStart;
	}

	return styles;
}


/**
 * Gallery Component
 */
export default function GalleryComponent({
	attributes,
	context,
	blockId,
}: GalleryComponentProps) {
	// Process images
	const processedImages = useMemo(
		() => processImagesForRender(attributes),
		[attributes.images, attributes.displaySize, attributes.lightboxSize]
	);

	// Calculate visible/hidden images
	const visibleCount = attributes.visibleCount;
	const hasHiddenImages = processedImages.length > visibleCount;

	// Split images
	const visible = hasHiddenImages
		? processedImages.slice(0, visibleCount - 1)
		: processedImages;

	const hidden = hasHiddenImages ? processedImages.slice(visibleCount - 1) : [];

	// Calculate filler count
	const fillerCount =
		!attributes.removeEmpty && visibleCount > processedImages.length
			? visibleCount - processedImages.length
			: 0;

	// Build unique gallery ID for lightbox slideshow
	const galleryId = `gallery-${blockId}-${Date.now()}`;

	// Is slideshow (multiple images)
	const isSlideshow = processedImages.length > 1;

	// Build grid styles
	const gridStyles = buildGridStyles(attributes);

	// Generate responsive CSS for gallery-specific properties
	const galleryCSS = useMemo(
		() => generateGalleryStyles(attributes, blockId),
		[attributes, blockId]
	);

	// Build lightbox slides from ALL images (visible + hidden)
	const lightboxSlides = useMemo(
		() => processedImages.map((img) => ({
			src: img.src_lightbox || img.src_display,
			alt: img.alt || '',
		})),
		[processedImages]
	);

	// Lightbox click handler - opens at the correct image index
	const handleLightboxClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
			e.preventDefault();
			const lightbox = (window as unknown as { VoxelLightbox?: VoxelLightboxAPI }).VoxelLightbox;
			if (lightbox) {
				lightbox.open(lightboxSlides, index);
			}
		},
		[lightboxSlides]
	);

	// Build vxconfig for re-rendering (CRITICAL for DevTools visibility)
	const vxConfig: GalleryVxConfig = {
		blockId: attributes.blockId,
		images: processedImages,
		visibleCount: attributes.visibleCount,
		columnCount: attributes.columnCount,
		columnCount_tablet: attributes.columnCount_tablet,
		columnCount_mobile: attributes.columnCount_mobile,
		columnGap: attributes.columnGap,
		columnGap_tablet: attributes.columnGap_tablet,
		columnGap_mobile: attributes.columnGap_mobile,
		rowHeight: attributes.rowHeight,
		rowHeight_tablet: attributes.rowHeight_tablet,
		rowHeight_mobile: attributes.rowHeight_mobile,
		useAspectRatio: attributes.useAspectRatio,
		useAspectRatio_tablet: attributes.useAspectRatio_tablet,
		useAspectRatio_mobile: attributes.useAspectRatio_mobile,
		aspectRatio: attributes.aspectRatio,
		aspectRatio_tablet: attributes.aspectRatio_tablet,
		aspectRatio_mobile: attributes.aspectRatio_mobile,
		removeEmpty: attributes.removeEmpty,
		autoFit: attributes.autoFit,
		mosaic: attributes.mosaic,
		imageBorderRadius: attributes.imageBorderRadius,
		imageBorderRadius_tablet: attributes.imageBorderRadius_tablet,
		imageBorderRadius_mobile: attributes.imageBorderRadius_mobile,
		overlayColor: attributes.overlayColor,
		overlayColorHover: attributes.overlayColorHover,
		emptyBorderType: attributes.emptyBorderType,
		emptyBorderWidth: attributes.emptyBorderWidth,
		emptyBorderColor: attributes.emptyBorderColor,
		emptyBorderRadius: attributes.emptyBorderRadius,
		emptyBorderRadius_tablet: attributes.emptyBorderRadius_tablet,
		emptyBorderRadius_mobile: attributes.emptyBorderRadius_mobile,
		viewAllBgColor: attributes.viewAllBgColor,
		viewAllBgColorHover: attributes.viewAllBgColorHover,
		viewAllIconColor: attributes.viewAllIconColor,
		viewAllIconColorHover: attributes.viewAllIconColorHover,
		viewAllIcon: attributes.viewAllIcon,
		viewAllIconSize: attributes.viewAllIconSize,
		viewAllIconSize_tablet: attributes.viewAllIconSize_tablet,
		viewAllIconSize_mobile: attributes.viewAllIconSize_mobile,
		viewAllTextColor: attributes.viewAllTextColor,
		viewAllTextColorHover: attributes.viewAllTextColorHover,
		viewAllTypography: attributes.viewAllTypography,
	};

	// Build grid class names
	const gridClassNames = ['ts-gallery-grid'];
	if (attributes.autoFit && attributes.removeEmpty) {
		gridClassNames.push('ts-gallery-autofit');
	}

	// Empty state for editor
	if (processedImages.length === 0 && context === 'editor') {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{galleryCSS && (
					<style dangerouslySetInnerHTML={{ __html: galleryCSS }} />
				)}
				<li style={{ listStyle: 'none', width: '100%' }}>
					<EmptyPlaceholder />
				</li>
			</>
		);
	}

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility (CRITICAL) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Responsive CSS for gallery-specific properties */}
			{galleryCSS && (
				<style dangerouslySetInnerHTML={{ __html: galleryCSS }} />
			)}

			{/* Gallery Grid - matches Voxel structure 1:1 */}
			<div
				className={gridClassNames.join(' ')}
				style={{
					...gridStyles,
					display: 'grid',
					gridTemplateColumns: `repeat(${attributes.columnCount}, 1fr)`,
					gap: `${attributes.columnGap || 10}px`,
					gridAutoRows: !attributes.useAspectRatio ? `${attributes.rowHeight}px` : 'auto',
					width: '100%',
				}}
			>
				{/* Visible images */}
				{visible.map((image, index) => (
					<li
						key={image.id}
						style={{
							listStyle: 'none',
							...buildMosaicItemStyles(attributes.mosaic, index),
						}}
					>
						<a
							href={image.src_lightbox}
							data-elementor-open-lightbox="yes"
							{...(isSlideshow
								? { 'data-elementor-lightbox-slideshow': galleryId }
								: {})}
							data-elementor-lightbox-description={
								image.caption || image.alt || image.description
							}
							onClick={(e) => handleLightboxClick(e, index)}
							style={{
								display: 'block',
								width: '100%',
								height: '100%',
								position: 'relative',
								borderRadius: `${attributes.imageBorderRadius}px`,
								overflow: 'hidden',
							}}
						>
							<div
								className="ts-image-overlay"
								style={{
									position: 'absolute',
									inset: 0,
									zIndex: 1,
									backgroundColor: attributes.overlayColor || undefined,
									transition: 'background-color 0.2s',
								}}
							/>
							<img
								src={image.src_display}
								alt={image.alt || image.description}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									...(attributes.useAspectRatio && attributes.aspectRatio
										? { aspectRatio: attributes.aspectRatio }
										: {}),
								}}
								loading="lazy"
							/>
						</a>
					</li>
				))}

				{/* View all / hidden images trigger */}
				{hidden.length > 0 && (
					<li
						className="ts-gallery-last-item"
						style={{
							listStyle: 'none',
							...buildMosaicItemStyles(attributes.mosaic, visible.length),
						}}
					>
						<a
							href={hidden[0].src_lightbox}
							data-elementor-open-lightbox="yes"
							{...(isSlideshow
								? { 'data-elementor-lightbox-slideshow': galleryId }
								: {})}
							data-elementor-lightbox-description={
								hidden[0].caption || hidden[0].alt || hidden[0].description
							}
							onClick={(e) => handleLightboxClick(e, visible.length)}
							style={{
								display: 'block',
								width: '100%',
								height: '100%',
								position: 'relative',
								borderRadius: `${attributes.imageBorderRadius}px`,
								overflow: 'hidden',
							}}
						>
							<div
								className="ts-image-overlay"
								style={{
									position: 'absolute',
									inset: 0,
									zIndex: 1,
									backgroundColor: attributes.viewAllBgColor || 'rgba(0,0,0,0.6)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									color: attributes.viewAllIconColor || '#fff',
									transition: 'background-color 0.2s',
								}}
							>
								<span
									style={{
										width: attributes.viewAllIconSize || 24,
										height: attributes.viewAllIconSize || 24,
										marginBottom: '8px',
									}}
								>
									{renderIcon(attributes.viewAllIcon, VoxelIcons.grid)}
								</span>
								<p
									className="ts-gallery-viewall-text"
									style={{
										margin: 0,
										color: attributes.viewAllTextColor || '#fff',
									}}
								>
									+{hidden.length}
								</p>
							</div>
							<img
								src={hidden[0].src_display}
								alt={hidden[0].alt || hidden[0].description}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									...(attributes.useAspectRatio && attributes.aspectRatio
										? { aspectRatio: attributes.aspectRatio }
										: {}),
								}}
								loading="lazy"
							/>
						</a>

						{/* Hidden images for lightbox slideshow */}
						<div className="hidden" style={{ display: 'none' }}>
							{hidden.slice(1).map((image) => (
								<a
									key={image.id}
									href={image.src_lightbox}
									data-elementor-open-lightbox="yes"
									data-elementor-lightbox-slideshow={galleryId}
									data-elementor-lightbox-description={
										image.caption || image.alt || image.description
									}
								/>
							))}
						</div>
					</li>
				)}

				{/* Empty filler items */}
				{Array.from({ length: fillerCount }).map((_, index) => (
					<li
						key={`empty-${index}`}
						className="ts-empty-item"
						style={{
							listStyle: 'none',
							...buildMosaicItemStyles(attributes.mosaic, visible.length + (hidden.length > 0 ? 1 : 0) + index),
						}}
					>
						<div
							style={{
								width: '100%',
								height: '100%',
								borderRadius: `${attributes.emptyBorderRadius || attributes.imageBorderRadius}px`,
								border: attributes.emptyBorderType
									? `${attributes.emptyBorderWidth || 1}px ${attributes.emptyBorderType} ${attributes.emptyBorderColor || '#ddd'}`
									: undefined,
								backgroundColor: '#f5f5f5',
							}}
						/>
					</li>
				))}
			</div>
		</>
	);
}
