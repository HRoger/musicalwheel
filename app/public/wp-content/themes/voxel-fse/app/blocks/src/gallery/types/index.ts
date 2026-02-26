/**
 * Gallery Block TypeScript Types
 *
 * Defines interfaces for the Gallery block attributes and components.
 * Matches Voxel Gallery widget structure from:
 * - themes/voxel/app/widgets/gallery.php
 * - themes/voxel/templates/widgets/gallery.php
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';
import type { CombinedStyleAttributes } from '@shared/utils';
import type { TypographyValue } from '@shared/controls/TypographyPopup';

/**
 * Gallery image structure
 */
export interface GalleryImage {
	id: number;
	url: string;
	alt: string;
	caption: string;
	description: string;
	title: string;
	sizes?: {
		[key: string]: {
			url: string;
			width: number;
			height: number;
		};
	};
}

/**
 * Mosaic item configuration
 * Controls grid span and positioning for individual items
 */
export interface MosaicItemConfig {
	colSpan: number | null;
	colStart: number | null;
	rowSpan: number | null;
	rowStart: number | null;
	colSpan_tablet?: number | null;
	colStart_tablet?: number | null;
	rowSpan_tablet?: number | null;
	rowStart_tablet?: number | null;
	colSpan_mobile?: number | null;
	colStart_mobile?: number | null;
	rowSpan_mobile?: number | null;
	rowStart_mobile?: number | null;
	// Dynamic tag support
	colSpanDynamicTag?: string;
	colStartDynamicTag?: string;
	rowSpanDynamicTag?: string;
	rowStartDynamicTag?: string;
}

/**
 * Mosaic configuration object
 * Up to 6 items can have individual mosaic settings
 */
export interface MosaicConfig {
	item1: MosaicItemConfig;
	item2: MosaicItemConfig;
	item3: MosaicItemConfig;
	item4: MosaicItemConfig;
	item5: MosaicItemConfig;
	item6: MosaicItemConfig;
}

/**
 * Gallery Block Attributes
 * Matches Elementor widget controls from gallery.php
 * Extends CombinedStyleAttributes for full Advanced tab support
 */
export interface GalleryBlockAttributes extends Partial<CombinedStyleAttributes> {
	// Block ID
	blockId: string;

	// Images Section
	images: GalleryImage[];
	imagesDynamicTag?: string; // Dynamic tag value for gallery images
	visibleCount: number;
	visibleCountDynamicTag?: string; // Dynamic tag for visible count
	displaySize: string;
	displaySize_tablet?: string;
	displaySize_mobile?: string;
	lightboxSize: string;
	lightboxSize_tablet?: string;
	lightboxSize_mobile?: string;

	// Columns Section
	columnGap?: number;
	columnGap_tablet?: number;
	columnGap_mobile?: number;
	columnCount: number;
	columnCount_tablet?: number;
	columnCount_mobile?: number;
	columnCountDynamicTag?: string; // Dynamic tag for column count
	removeEmpty: boolean;
	autoFit: boolean;

	// Row Height Section
	rowHeight: number;
	rowHeight_tablet?: number;
	rowHeight_mobile?: number;
	useAspectRatio: boolean;
	useAspectRatio_tablet?: boolean;
	useAspectRatio_mobile?: boolean;
	aspectRatio: string;
	aspectRatio_tablet?: string;
	aspectRatio_mobile?: string;

	// Mosaic Section
	mosaic: MosaicConfig;

	// Style - Image
	imageBorderRadius: number;
	imageBorderRadius_tablet?: number;
	imageBorderRadius_mobile?: number;

	// Style - Overlay
	overlayColor: string;
	overlayColorHover: string;

	// Style - Empty Item
	emptyBorderType: string;
	emptyBorderWidth?: number;
	emptyBorderColor: string;
	emptyBorderRadius?: number;
	emptyBorderRadius_tablet?: number;
	emptyBorderRadius_mobile?: number;

	// Style - View All Button
	viewAllBgColor: string;
	viewAllBgColorHover: string;
	viewAllIconColor: string;
	viewAllIconColorHover: string;
	viewAllIcon: IconValue;
	viewAllIconSize?: number;
	viewAllIconSize_tablet?: number;
	viewAllIconSize_mobile?: number;
	viewAllTextColor: string;
	viewAllTextColorHover: string;
	viewAllTypography?: TypographyValue;

	// Advanced - Visibility
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;

	// Inspector State Persistence
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;
	generalStateTab?: 'normal' | 'hover';

	// Allow extension with block-specific attributes
	[key: string]: any;
}

/**
 * Processed image for rendering
 * Contains computed URLs and metadata
 */
export interface ProcessedImage {
	id: number;
	src_display: string;
	src_lightbox: string;
	alt: string;
	caption: string;
	description: string;
	title: string;
	display_size: string;
}

/**
 * Gallery vxconfig structure
 * JSON configuration stored in script tag for frontend hydration
 */
export interface GalleryVxConfig {
	blockId: string;
	images: ProcessedImage[];
	visibleCount: number;
	columnCount: number;
	columnCount_tablet?: number;
	columnCount_mobile?: number;
	columnGap?: number;
	columnGap_tablet?: number;
	columnGap_mobile?: number;
	rowHeight: number;
	rowHeight_tablet?: number;
	rowHeight_mobile?: number;
	useAspectRatio: boolean;
	useAspectRatio_tablet?: boolean;
	useAspectRatio_mobile?: boolean;
	aspectRatio: string;
	aspectRatio_tablet?: string;
	aspectRatio_mobile?: string;
	removeEmpty: boolean;
	autoFit: boolean;
	mosaic: MosaicConfig;
	imageBorderRadius: number;
	imageBorderRadius_tablet?: number;
	imageBorderRadius_mobile?: number;
	overlayColor: string;
	overlayColorHover: string;
	emptyBorderType: string;
	emptyBorderWidth?: number;
	emptyBorderColor: string;
	emptyBorderRadius?: number;
	emptyBorderRadius_tablet?: number;
	emptyBorderRadius_mobile?: number;
	viewAllBgColor: string;
	viewAllBgColorHover: string;
	viewAllIconColor: string;
	viewAllIconColorHover: string;
	viewAllIcon: IconValue;
	viewAllIconSize?: number;
	viewAllIconSize_tablet?: number;
	viewAllIconSize_mobile?: number;
	viewAllTextColor: string;
	viewAllTextColorHover: string;
	viewAllTypography?: TypographyValue;
}

/**
 * Gallery Component Props
 * Shared between editor and frontend
 */
export interface GalleryComponentProps {
	attributes: GalleryBlockAttributes;
	context: 'editor' | 'frontend';
	blockId: string;
	/** Template context for dynamic tag resolution in editor */
	templateContext?: string;
	/** Post type extracted from template slug (e.g., 'place') */
	templatePostType?: string;
}

/**
 * WordPress image sizes with labels
 * Typically fetched from REST API or localized data
 */
export interface ImageSizeOption {
	value: string;
	label: string;
}

/**
 * Default image sizes available in WordPress
 */
export const DEFAULT_IMAGE_SIZES: ImageSizeOption[] = [
	{ value: 'thumbnail', label: 'Thumbnail (150x150)' },
	{ value: 'medium', label: 'Medium (300x300)' },
	{ value: 'medium_large', label: 'Medium Large (768x0)' },
	{ value: 'large', label: 'Large (1024x1024)' },
	{ value: 'full', label: 'Full Size' },
];
