/**
 * Slider Block - TypeScript Type Definitions
 *
 * Defines interfaces for the Slider block based on Voxel widget controls.
 * Evidence: themes/voxel/app/widgets/slider.php
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';

/**
 * Image object from WordPress Media Library
 */
export interface SliderImage {
	id: number;
	url: string;
	alt: string;
	caption: string;
	description: string;
	title: string;
	sizes?: {
		thumbnail?: { url: string; width: number; height: number };
		medium?: { url: string; width: number; height: number };
		medium_large?: { url: string; width: number; height: number };
		large?: { url: string; width: number; height: number };
		full?: { url: string; width: number; height: number };
		[key: string]: { url: string; width: number; height: number } | undefined;
	};
}

/**
 * Processed image data for rendering
 */
export interface ProcessedImage {
	id: number;
	src: string;
	srcLightbox: string;
	srcThumbnail: string;
	alt: string;
	caption: string;
	description: string;
	title: string;
}

/**
 * Link type options
 */
export type LinkType = 'none' | 'custom_link' | 'lightbox';

/**
 * Image source type
 */
export type ImageSource = 'manual' | 'dynamic';

/**
 * Slider Block Attributes
 * Maps 1:1 with block.json attributes
 */
export interface SliderBlockAttributes {
	// Block identification
	blockId: string;

	// Images - Content Tab
	images: SliderImage[];
	imageSource: ImageSource;
	dynamicSource: string;
	visibleCount: number;
	displaySize: string;
	displaySize_tablet?: string;
	displaySize_mobile?: string;
	lightboxSize: string;
	lightboxSize_tablet?: string;
	lightboxSize_mobile?: string;
	linkType: LinkType;
	customLinkUrl: string;
	customLinkTarget: string;
	showThumbnails: boolean;
	autoSlide: boolean;
	autoSlideInterval: number;
	autoSlideInterval_tablet?: number;
	autoSlideInterval_mobile?: number;

	// Icons - Content Tab
	rightChevronIcon: IconValue;
	leftChevronIcon: IconValue;

	// Style - General Section
	imageAspectRatio: string;
	imageAspectRatio_tablet?: string;
	imageAspectRatio_mobile?: string;
	imageBorderRadius?: number;
	imageBorderRadius_tablet?: number;
	imageBorderRadius_mobile?: number;
	imageOpacity?: number;
	imageOpacity_tablet?: number;
	imageOpacity_mobile?: number;
	imageOpacityHover?: number;
	imageOpacityHover_tablet?: number;
	imageOpacityHover_mobile?: number;

	// Style - Thumbnails Section
	thumbnailSize?: number;
	thumbnailSize_tablet?: number;
	thumbnailSize_mobile?: number;
	thumbnailBorderRadius?: number;
	thumbnailBorderRadius_tablet?: number;
	thumbnailBorderRadius_mobile?: number;
	thumbnailOpacity?: number;
	thumbnailOpacity_tablet?: number;
	thumbnailOpacity_mobile?: number;
	thumbnailOpacityHover?: number;
	thumbnailOpacityHover_tablet?: number;
	thumbnailOpacityHover_mobile?: number;

	// Style - Carousel Navigation Section (Normal)
	navHorizontalPosition?: number;
	navHorizontalPosition_tablet?: number;
	navHorizontalPosition_mobile?: number;
	navVerticalPosition?: number;
	navVerticalPosition_tablet?: number;
	navVerticalPosition_mobile?: number;
	navButtonIconColor: string;
	navButtonSize?: number;
	navButtonSize_tablet?: number;
	navButtonSize_mobile?: number;
	navButtonIconSize?: number;
	navButtonIconSize_tablet?: number;
	navButtonIconSize_mobile?: number;
	navButtonBackground: string;
	navBackdropBlur?: number;
	navBackdropBlur_tablet?: number;
	navBackdropBlur_mobile?: number;
	navBorderType: string;
	navBorderWidth?: number;
	navBorderColor: string;
	navButtonBorderRadius?: number;
	navButtonBorderRadius_tablet?: number;
	navButtonBorderRadius_mobile?: number;

	// Style - Carousel Navigation Section (Hover)
	navButtonSizeHover?: number;
	navButtonSizeHover_tablet?: number;
	navButtonSizeHover_mobile?: number;
	navButtonIconSizeHover?: number;
	navButtonIconSizeHover_tablet?: number;
	navButtonIconSizeHover_mobile?: number;
	navButtonIconColorHover: string;
	navButtonBackgroundHover: string;
	navBorderColorHover: string;

	// Visibility - Voxel Tab
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;

	// Persistence for Accordion Panel Group
	sliderAccordion?: string;

	// Tab panel state persistence
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;

	// Dynamic tag for gallery images
	imagesDynamicTag?: string;
}

/**
 * vxconfig JSON structure saved in script tag
 */
export interface SliderVxConfig {
	// Images
	images: ProcessedImage[];
	visibleCount: number;
	displaySize: string;
	lightboxSize: string;
	linkType: LinkType;
	customLinkUrl: string;
	customLinkTarget: string;
	showThumbnails: boolean;
	autoSlide: boolean;
	autoSlideInterval: number;

	// Icons (as CSS class strings)
	rightChevronIcon: string;
	leftChevronIcon: string;

	// Unique identifier for lightbox grouping
	galleryId: string;

	// Style settings (subset for frontend)
	imageAspectRatio?: string;
	imageBorderRadius?: number;
	imageOpacity?: number;
	imageOpacityHover?: number;
	thumbnailSize?: number;
	thumbnailBorderRadius?: number;
	thumbnailOpacity?: number;
	thumbnailOpacityHover?: number;
}

/**
 * Props for SliderComponent
 */
export interface SliderComponentProps {
	attributes: SliderBlockAttributes;
	context: 'editor' | 'frontend';
	processedImages?: ProcessedImage[];
	galleryId?: string;
	onSelectImages?: (images: SliderImage[]) => void;
	onOpenMediaLibrary?: () => void;
	/** Template context for dynamic tag resolution in editor */
	templateContext?: string;
	/** Post type extracted from template slug (e.g., 'place') */
	templatePostType?: string;
}

/**
 * Props for Edit component
 */
export interface EditProps {
	attributes: SliderBlockAttributes;
	setAttributes: (attrs: Partial<SliderBlockAttributes>) => void;
	clientId: string;
}

/**
 * Props for Save component
 */
export interface SaveProps {
	attributes: SliderBlockAttributes;
}

/**
 * REST API response for image data
 */
export interface ImageDataResponse {
	id: number;
	url: string;
	alt: string;
	caption: string;
	description: string;
	title: string;
	sizes: {
		[key: string]: {
			url: string;
			width: number;
			height: number;
		};
	};
}

/**
 * Lightbox state for frontend
 */
export interface LightboxState {
	isOpen: boolean;
	currentIndex: number;
	images: ProcessedImage[];
}
