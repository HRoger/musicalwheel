/**
 * Gallery Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig JSON for React hydration.
 * No PHP rendering - fully headless-ready.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/gallery.php
 * - Template: themes/voxel/templates/widgets/gallery.php
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { GalleryBlockAttributes, ProcessedImage, GalleryVxConfig } from './types';
import { getAdvancedVoxelTabProps } from '@shared/utils';

interface SaveProps {
	attributes: GalleryBlockAttributes;
}

/**
 * Process images for vxconfig
 * Converts WordPress media objects to processed images with display/lightbox URLs
 */
function processImages(attributes: GalleryBlockAttributes): ProcessedImage[] {
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

export default function save({ attributes }: SaveProps) {
	// Generate Advanced and Voxel tab props
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || 'gallery-block',
		baseClass: 'ts-gallery flexify simplify-ul voxel-fse-gallery',
	});

	// Block props including Advanced/Voxel styling
	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// Build vxconfig JSON (matching Voxel pattern)
	const vxConfig: GalleryVxConfig = {
		blockId: attributes.blockId,
		images: processImages(attributes),
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
	};

	return (
		<ul {...blockProps}>
			{/* Render responsive CSS from tabs */}
			{advancedProps.responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
			)}

			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration - matches ts-gallery-grid structure */}
			<div className="ts-gallery-grid">
				<li className="voxel-fse-block-placeholder">
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							aspectRatio: '1',
							borderRadius: '10px', // Placeholder styling
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="32"
							height="32"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 19V5H19V19H5ZM13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H17.5L13.96 12.29Z" />
						</svg>
					</div>
				</li>
			</div>
		</ul>
	);
}
