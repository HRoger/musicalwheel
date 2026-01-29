/**
 * Slider Block - Frontend Entry Point (Plan C+)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Replaces placeholder with fully interactive SliderComponent.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/slider.php
 * - Template: themes/voxel/templates/widgets/slider.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/slider.php (760 lines)
 *
 * IMAGES SECTION:
 * ✅ ts_slider_images - Gallery control (image repeater)
 * ✅ ts_visible_count - Number of images to load
 * ✅ ts_display_size - Image size (responsive)
 * ✅ ts_lightbox_size - Lightbox image size (responsive)
 * ✅ ts_link_type - Link type (none, custom_link, lightbox)
 * ✅ ts_link_src - Custom URL with target (for custom_link type)
 * ✅ ts_show_navigation - Show thumbnails toggle
 * ✅ carousel_autoplay - Auto slide toggle
 * ✅ carousel_autoplay_interval - Auto slide interval in ms (responsive)
 *
 * ICONS SECTION:
 * ✅ ts_chevron_right - Right navigation chevron icon
 * ✅ ts_chevron_left - Left navigation chevron icon
 *
 * STYLE - GENERAL (Normal + Hover):
 * ✅ image_slider_ratio - Image aspect ratio (responsive, e.g., "16/9")
 * ✅ ts_gl_general_image_radius - Border radius (px, responsive)
 * ✅ ts_gl_general_image_opacity - Opacity (0-1, responsive)
 * ✅ ts_gl_general_image_opacity_hover - Opacity hover (0-1, responsive)
 *
 * STYLE - THUMBNAILS (Normal + Hover):
 * ✅ ts_thumbnail_size - Thumbnail size (px, responsive)
 * ✅ ts_thumbnails_radius - Border radius (px, responsive)
 * ✅ ts_thumbnail_opacity - Opacity (0-1, responsive)
 * ✅ ts_thumbnail_opacity_h - Opacity hover (0-1, responsive)
 *
 * STYLE - CAROUSEL NAVIGATION (Normal):
 * ✅ ts_fnav_btn_horizontal - Horizontal position (px, responsive)
 * ✅ ts_fnav_btn_vertical - Vertical position (px, responsive)
 * ✅ ts_fnav_btn_color - Button icon color
 * ✅ ts_fnav_btn_size - Button size (px, responsive)
 * ✅ ts_fnav_btn_icon_size - Button icon size (px, responsive)
 * ✅ ts_fnav_btn_nbg - Button background color
 * ✅ ts_fnav_blur - Backdrop blur (px, responsive)
 * ✅ ts_fnav_btn_border - Border group (type, width, color)
 * ✅ ts_fnav_btn_radius - Border radius (px, responsive)
 *
 * STYLE - CAROUSEL NAVIGATION (Hover):
 * ✅ ts_fnav_btn_size_h - Button size hover (px, responsive)
 * ✅ ts_fnav_btn_icon_size_h - Icon size hover (px, responsive)
 * ✅ ts_fnav_btn_h - Icon color hover
 * ✅ ts_fnav_btn_nbg_h - Background color hover
 * ✅ ts_fnav_border_c_h - Border color hover
 *
 * HTML STRUCTURE:
 * ✅ .ts-slider - Main slider container
 * ✅ .ts-single-slide - Individual slide wrapper
 * ✅ .ts-slide-nav - Thumbnail navigation container
 * ✅ .post-feed-nav - Carousel nav buttons (prev/next)
 * ✅ .ts-icon-btn - Navigation button styling
 * ✅ Swiper.js integration for slideshow
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ SliderComponent accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   images: ProcessedImage[],
 *   visibleCount: number,
 *   displaySize: string,
 *   lightboxSize: string,
 *   linkType: 'none' | 'custom_link' | 'lightbox',
 *   customLinkUrl: string,
 *   customLinkTarget: string,
 *   showThumbnails: boolean,
 *   autoSlide: boolean,
 *   autoSlideInterval: number,
 *   rightChevronIcon: string,
 *   leftChevronIcon: string,
 *   galleryId: string,
 *   imageAspectRatio?: string,
 *   imageBorderRadius?: number,
 *   imageOpacity?: number,
 *   imageOpacityHover?: number,
 *   thumbnailSize?: number,
 *   thumbnailBorderRadius?: number,
 *   thumbnailOpacity?: number,
 *   thumbnailOpacityHover?: number
 * }
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import SliderComponent from './shared/SliderComponent';
import type { SliderBlockAttributes, SliderVxConfig, ProcessedImage, LinkType } from './types';
import type { IconValue } from '@shared/types';

/**
 * Default icon structure
 */
const DEFAULT_ICON: IconValue = {
	library: '',
	value: '',
};

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: themes/voxel/app/widgets/slider.php control names
 */
function normalizeConfig(raw: Record<string, unknown>): SliderVxConfig {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? fallback : parsed;
		}
		return fallback;
	};

	// Helper for optional number normalization
	const normalizeOptionalNumber = (val: unknown): number | undefined => {
		if (val === undefined || val === null || val === '') return undefined;
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? undefined : parsed;
		}
		return undefined;
	};

	// Helper for images normalization
	const normalizeImages = (val: unknown): ProcessedImage[] => {
		if (!val || !Array.isArray(val)) return [];
		return val.map((img: unknown) => {
			const imgObj = (img ?? {}) as Record<string, unknown>;
			return {
				id: normalizeNumber(imgObj.id, 0),
				src: normalizeString(imgObj.src ?? imgObj.src_display ?? imgObj.url, ''),
				srcLightbox: normalizeString(imgObj.srcLightbox ?? imgObj.src_lightbox, ''),
				srcThumbnail: normalizeString(imgObj.srcThumbnail ?? imgObj.src_thumbnail, ''),
				alt: normalizeString(imgObj.alt, ''),
				caption: normalizeString(imgObj.caption, ''),
				description: normalizeString(imgObj.description, ''),
				title: normalizeString(imgObj.title, ''),
			};
		});
	};

	// Helper for link type normalization
	const normalizeLinkType = (val: unknown): LinkType => {
		const strVal = normalizeString(val, 'lightbox');
		if (strVal === 'none' || strVal === 'custom_link' || strVal === 'lightbox') {
			return strVal;
		}
		return 'lightbox';
	};

	return {
		// Images
		images: normalizeImages(raw.images ?? raw.ts_slider_images),
		visibleCount: normalizeNumber(raw.visibleCount ?? raw.visible_count ?? raw.ts_visible_count, 3),
		displaySize: normalizeString(raw.displaySize ?? raw.display_size ?? raw.ts_display_size, 'medium'),
		lightboxSize: normalizeString(raw.lightboxSize ?? raw.lightbox_size ?? raw.ts_lightbox_size, 'large'),

		// Link settings
		linkType: normalizeLinkType(raw.linkType ?? raw.link_type ?? raw.ts_link_type),
		customLinkUrl: normalizeString(
			raw.customLinkUrl ?? raw.custom_link_url ?? (raw.ts_link_src as Record<string, unknown>)?.url,
			''
		),
		customLinkTarget: normalizeString(
			raw.customLinkTarget ?? raw.custom_link_target ?? (raw.ts_link_src as Record<string, unknown>)?.is_external,
			''
		),

		// Thumbnails and autoplay
		showThumbnails: normalizeBool(raw.showThumbnails ?? raw.show_thumbnails ?? raw.ts_show_navigation, true),
		autoSlide: normalizeBool(raw.autoSlide ?? raw.auto_slide ?? raw.carousel_autoplay, false),
		autoSlideInterval: normalizeNumber(
			raw.autoSlideInterval ?? raw.auto_slide_interval ?? raw.carousel_autoplay_interval,
			3000
		),

		// Icons (as CSS class strings for frontend)
		rightChevronIcon: normalizeString(
			raw.rightChevronIcon ?? raw.right_chevron_icon ?? (raw.ts_chevron_right as Record<string, unknown>)?.value,
			''
		),
		leftChevronIcon: normalizeString(
			raw.leftChevronIcon ?? raw.left_chevron_icon ?? (raw.ts_chevron_left as Record<string, unknown>)?.value,
			''
		),

		// Gallery ID for lightbox grouping
		galleryId: normalizeString(raw.galleryId ?? raw.gallery_id, ''),

		// Style - General
		imageAspectRatio: raw.imageAspectRatio !== undefined || raw.image_aspect_ratio !== undefined || raw.image_slider_ratio !== undefined
			? normalizeString(raw.imageAspectRatio ?? raw.image_aspect_ratio ?? raw.image_slider_ratio, '')
			: undefined,
		imageBorderRadius: normalizeOptionalNumber(
			raw.imageBorderRadius ?? raw.image_border_radius ?? raw.ts_gl_general_image_radius
		),
		imageOpacity: normalizeOptionalNumber(
			raw.imageOpacity ?? raw.image_opacity ?? raw.ts_gl_general_image_opacity
		),
		imageOpacityHover: normalizeOptionalNumber(
			raw.imageOpacityHover ?? raw.image_opacity_hover ?? raw.ts_gl_general_image_opacity_hover
		),

		// Style - Thumbnails
		thumbnailSize: normalizeOptionalNumber(
			raw.thumbnailSize ?? raw.thumbnail_size ?? raw.ts_thumbnail_size
		),
		thumbnailBorderRadius: normalizeOptionalNumber(
			raw.thumbnailBorderRadius ?? raw.thumbnail_border_radius ?? raw.ts_thumbnails_radius
		),
		thumbnailOpacity: normalizeOptionalNumber(
			raw.thumbnailOpacity ?? raw.thumbnail_opacity ?? raw.ts_thumbnail_opacity
		),
		thumbnailOpacityHover: normalizeOptionalNumber(
			raw.thumbnailOpacityHover ?? raw.thumbnail_opacity_hover ?? raw.ts_thumbnail_opacity_h
		),
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): SliderVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent);
			// Use normalizeConfig for consistent format handling
			return normalizeConfig(rawConfig);
		} catch (error) {
			console.error('[voxel-fse/slider] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: SliderVxConfig): SliderBlockAttributes {
	return {
		blockId: '',

		// Images
		images: [], // Images are passed separately as processedImages
		imageSource: 'manual',
		dynamicSource: '',
		visibleCount: config.visibleCount,
		displaySize: config.displaySize,
		displaySize_tablet: undefined,
		displaySize_mobile: undefined,
		lightboxSize: config.lightboxSize,
		lightboxSize_tablet: undefined,
		lightboxSize_mobile: undefined,
		linkType: config.linkType,
		customLinkUrl: config.customLinkUrl,
		customLinkTarget: config.customLinkTarget,
		showThumbnails: config.showThumbnails,
		autoSlide: config.autoSlide,
		autoSlideInterval: config.autoSlideInterval,
		autoSlideInterval_tablet: undefined,
		autoSlideInterval_mobile: undefined,

		// Icons
		rightChevronIcon: {
			library: config.rightChevronIcon ? 'icon' : '',
			value: config.rightChevronIcon || '',
		},
		leftChevronIcon: {
			library: config.leftChevronIcon ? 'icon' : '',
			value: config.leftChevronIcon || '',
		},

		// Style - General
		imageAspectRatio: config.imageAspectRatio || '',
		imageAspectRatio_tablet: undefined,
		imageAspectRatio_mobile: undefined,
		imageBorderRadius: config.imageBorderRadius,
		imageBorderRadius_tablet: undefined,
		imageBorderRadius_mobile: undefined,
		imageOpacity: config.imageOpacity,
		imageOpacity_tablet: undefined,
		imageOpacity_mobile: undefined,
		imageOpacityHover: config.imageOpacityHover,
		imageOpacityHover_tablet: undefined,
		imageOpacityHover_mobile: undefined,

		// Style - Thumbnails
		thumbnailSize: config.thumbnailSize,
		thumbnailSize_tablet: undefined,
		thumbnailSize_mobile: undefined,
		thumbnailBorderRadius: config.thumbnailBorderRadius,
		thumbnailBorderRadius_tablet: undefined,
		thumbnailBorderRadius_mobile: undefined,
		thumbnailOpacity: config.thumbnailOpacity,
		thumbnailOpacity_tablet: undefined,
		thumbnailOpacity_mobile: undefined,
		thumbnailOpacityHover: config.thumbnailOpacityHover,
		thumbnailOpacityHover_tablet: undefined,
		thumbnailOpacityHover_mobile: undefined,

		// Style - Navigation (defaults)
		navHorizontalPosition: undefined,
		navHorizontalPosition_tablet: undefined,
		navHorizontalPosition_mobile: undefined,
		navVerticalPosition: undefined,
		navVerticalPosition_tablet: undefined,
		navVerticalPosition_mobile: undefined,
		navButtonIconColor: '',
		navButtonSize: undefined,
		navButtonSize_tablet: undefined,
		navButtonSize_mobile: undefined,
		navButtonIconSize: undefined,
		navButtonIconSize_tablet: undefined,
		navButtonIconSize_mobile: undefined,
		navButtonBackground: '',
		navBackdropBlur: undefined,
		navBackdropBlur_tablet: undefined,
		navBackdropBlur_mobile: undefined,
		navBorderType: '',
		navBorderWidth: undefined,
		navBorderColor: '',
		navButtonBorderRadius: undefined,
		navButtonBorderRadius_tablet: undefined,
		navButtonBorderRadius_mobile: undefined,
		navButtonSizeHover: undefined,
		navButtonSizeHover_tablet: undefined,
		navButtonSizeHover_mobile: undefined,
		navButtonIconSizeHover: undefined,
		navButtonIconSizeHover_tablet: undefined,
		navButtonIconSizeHover_mobile: undefined,
		navButtonIconColorHover: '',
		navButtonBackgroundHover: '',
		navBorderColorHover: '',

		// Visibility
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
	};
}

/**
 * Initialize Slider blocks on the page
 */
function initSliderBlocks() {
	// Find all slider blocks
	const sliderBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-slider:not([data-hydrated])'
	);

	sliderBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('[voxel-fse/slider] No vxconfig found for slider block');
			return;
		}

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Clear placeholder content
		container.innerHTML = '';

		// Build attributes from config
		const attributes = buildAttributes(config);

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<SliderComponent
				attributes={attributes}
				context="frontend"
				processedImages={config.images}
				galleryId={config.galleryId}
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSliderBlocks);
} else {
	initSliderBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initSliderBlocks);
window.addEventListener('pjax:complete', initSliderBlocks);

// Re-initialize when Voxel updates markup (e.g., after AJAX content load)
document.addEventListener('voxel:markup-update', initSliderBlocks);
