/**
 * Image Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Replaces placeholder with fully interactive ImageComponent.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/image.php (16 lines - extends Elementor)
 * - Elementor: elementor/includes/widgets/image.php (Elementor Widget_Image)
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: Voxel image.php extends Elementor Widget_Image
 * Note: Voxel's image widget is a thin wrapper around Elementor's Image widget
 *
 * IMAGE (Content Tab):
 * ✅ image - Image selector (media control)
 * ✅ image_size - Image size select (thumbnail, medium, large, full, custom)
 * ✅ image_custom_dimension - Custom width/height (dimensions control)
 *
 * CAPTION:
 * ✅ caption_source - Caption source (none, attachment, custom)
 * ✅ caption - Custom caption text
 *
 * LINK:
 * ✅ link_to - Link destination (none, file, custom)
 * ✅ link - Custom link URL (url control)
 * ✅ open_lightbox - Open in lightbox (default, yes, no)
 *
 * IMAGE STYLE (Style Tab):
 * ✅ align - Image alignment (left, center, right) [responsive]
 * ✅ width - Width (slider with px, %, vw) [responsive]
 * ✅ space - Max width (slider with px, %) [responsive]
 * ✅ height - Height (slider with px, vh) [responsive]
 * ✅ object-fit - Object fit (fill, contain, cover, none, scale-down) [responsive]
 * ✅ object-position - Object position (center center, top left, etc.)
 *
 * EFFECTS:
 * ✅ opacity - Normal opacity (slider 0-1)
 * ✅ _css_filters - CSS filters (blur, brightness, contrast, saturation, hue)
 * ✅ opacity_hover - Hover opacity (slider 0-1)
 * ✅ css_filters_hover - Hover CSS filters
 * ✅ background_hover_transition - Transition duration (slider ms)
 * ✅ hover_animation - Hover animation (grow, shrink, pulse, etc.)
 *
 * BORDER:
 * ✅ image_border - Border type (none, solid, dashed, dotted, double)
 * ✅ image_border_width - Border width (dimensions)
 * ✅ image_border_color - Border color
 * ✅ image_border_radius - Border radius (dimensions) [responsive]
 * ✅ image_box_shadow - Box shadow (group control)
 * ✅ aspect_ratio - Aspect ratio (n/a, 1:1, 3:2, 4:3, 9:16, 16:9, 21:9)
 *
 * CAPTION STYLE:
 * ✅ caption_align - Caption alignment [responsive]
 * ✅ text_color - Caption text color
 * ✅ caption_background_color - Caption background color
 * ✅ caption_typography - Caption typography (group control)
 * ✅ caption_text_shadow - Caption text shadow (group control)
 * ✅ caption_space - Caption spacing (slider) [responsive]
 *
 * HTML STRUCTURE:
 * ✅ .elementor-image - Image wrapper
 * ✅ .elementor-image img - Image element
 * ✅ .elementor-image a - Link wrapper (when linked)
 * ✅ .widget-image-caption - Caption element
 * ✅ .attachment-{size} - Size class on img
 * ✅ .size-{size} - Size class on img
 *
 * LIGHTBOX:
 * ✅ data-elementor-open-lightbox - Lightbox trigger attribute
 * ✅ data-elementor-lightbox-slideshow - Slideshow grouping
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ SSR-compatible image rendering
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import ImageComponent from './shared/ImageComponent';
import type {
	ImageBlockAttributes,
	ImageVxConfig,
	ImageMedia,
	LinkObject,
	SliderValue,
	BoxDimensions,
	CSSFilters,
	BoxShadowValue,
	TypographyValue,
	TextShadowValue,
} from './types';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Elementor/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): ImageVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number | undefined): number | undefined => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1) return true;
		if (val === 'false' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for ImageMedia normalization
	const normalizeImageMedia = (val: unknown): ImageMedia => {
		const defaultImage: ImageMedia = { id: 0, url: '', alt: '', width: 0, height: 0 };
		if (!val || typeof val !== 'object') return defaultImage;
		const obj = val as Record<string, unknown>;
		return {
			id: normalizeNumber(obj.id, 0) ?? 0,
			url: normalizeString(obj.url, ''),
			alt: normalizeString(obj.alt, ''),
			width: normalizeNumber(obj.width, 0) ?? 0,
			height: normalizeNumber(obj.height, 0) ?? 0,
		};
	};

	// Helper for LinkObject normalization
	const normalizeLinkObject = (val: unknown): LinkObject => {
		const defaultLink: LinkObject = { url: '', target: '', rel: '' };
		if (!val || typeof val !== 'object') return defaultLink;
		const obj = val as Record<string, unknown>;
		return {
			url: normalizeString(obj.url, ''),
			target: normalizeString(obj.target ?? obj._target, ''),
			rel: normalizeString(obj.rel ?? obj.nofollow, ''),
		};
	};

	// Helper for SliderValue normalization
	const normalizeSliderValue = (val: unknown): SliderValue => {
		const defaultSlider: SliderValue = { size: undefined, unit: 'px' };
		if (!val || typeof val !== 'object') return defaultSlider;
		const obj = val as Record<string, unknown>;
		return {
			size: normalizeNumber(obj.size, undefined),
			unit: normalizeString(obj.unit, 'px'),
		};
	};

	// Helper for BoxDimensions normalization
	const normalizeBoxDimensions = (val: unknown): BoxDimensions => {
		const defaultBox: BoxDimensions = {};
		if (!val || typeof val !== 'object') return defaultBox;
		const obj = val as Record<string, unknown>;
		return {
			top: obj.top !== undefined ? normalizeNumber(obj.top, undefined) : undefined,
			right: obj.right !== undefined ? normalizeNumber(obj.right, undefined) : undefined,
			bottom: obj.bottom !== undefined ? normalizeNumber(obj.bottom, undefined) : undefined,
			left: obj.left !== undefined ? normalizeNumber(obj.left, undefined) : undefined,
			unit: normalizeString(obj.unit, 'px'),
			isLinked: normalizeBoolean(obj.isLinked ?? obj.is_linked, true),
		};
	};

	// Helper for CSSFilters normalization
	const normalizeCSSFilters = (val: unknown): CSSFilters => {
		const defaultFilters: CSSFilters = {};
		if (!val || typeof val !== 'object') return defaultFilters;
		const obj = val as Record<string, unknown>;
		return {
			blur: normalizeNumber(obj.blur, undefined),
			brightness: normalizeNumber(obj.brightness, undefined),
			contrast: normalizeNumber(obj.contrast, undefined),
			saturation: normalizeNumber(obj.saturation, undefined),
			hue: normalizeNumber(obj.hue, undefined),
		};
	};

	// Helper for BoxShadowValue normalization
	const normalizeBoxShadow = (val: unknown): BoxShadowValue => {
		const defaultShadow: BoxShadowValue = {};
		if (!val || typeof val !== 'object') return defaultShadow;
		const obj = val as Record<string, unknown>;
		return {
			horizontal: normalizeNumber(obj.horizontal, undefined),
			vertical: normalizeNumber(obj.vertical, undefined),
			blur: normalizeNumber(obj.blur, undefined),
			spread: normalizeNumber(obj.spread, undefined),
			color: normalizeString(obj.color, ''),
			position: normalizeString(obj.position, ''),
		};
	};

	// Helper for TypographyValue normalization
	const normalizeTypography = (val: unknown): TypographyValue => {
		const defaultTypo: TypographyValue = {};
		if (!val || typeof val !== 'object') return defaultTypo;
		const obj = val as Record<string, unknown>;
		return {
			fontFamily: normalizeString(obj.fontFamily ?? obj.font_family, ''),
			fontSize: normalizeSliderValue(obj.fontSize ?? obj.font_size),
			fontWeight: normalizeString(obj.fontWeight ?? obj.font_weight, ''),
			textTransform: normalizeString(obj.textTransform ?? obj.text_transform, ''),
			fontStyle: normalizeString(obj.fontStyle ?? obj.font_style, ''),
			textDecoration: normalizeString(obj.textDecoration ?? obj.text_decoration, ''),
			lineHeight: normalizeSliderValue(obj.lineHeight ?? obj.line_height),
			letterSpacing: normalizeSliderValue(obj.letterSpacing ?? obj.letter_spacing),
			wordSpacing: normalizeSliderValue(obj.wordSpacing ?? obj.word_spacing),
		};
	};

	// Helper for TextShadowValue normalization
	const normalizeTextShadow = (val: unknown): TextShadowValue => {
		const defaultShadow: TextShadowValue = {};
		if (!val || typeof val !== 'object') return defaultShadow;
		const obj = val as Record<string, unknown>;
		return {
			horizontal: normalizeNumber(obj.horizontal, undefined),
			vertical: normalizeNumber(obj.vertical, undefined),
			blur: normalizeNumber(obj.blur, undefined),
			color: normalizeString(obj.color, ''),
		};
	};

	return {
		// Image data
		image: normalizeImageMedia(raw.image),
		imageSize: normalizeString(raw.imageSize ?? raw.image_size, 'full'),
		customWidth: normalizeNumber(raw.customWidth ?? raw.custom_width, undefined),
		customHeight: normalizeNumber(raw.customHeight ?? raw.custom_height, undefined),

		// Caption
		captionSource: normalizeString(raw.captionSource ?? raw.caption_source, 'none'),
		caption: normalizeString(raw.caption, ''),

		// Link
		linkTo: normalizeString(raw.linkTo ?? raw.link_to, 'none'),
		link: normalizeLinkObject(raw.link),
		openLightbox: normalizeString(raw.openLightbox ?? raw.open_lightbox, 'default'),

		// Style - Image
		imageAlign: normalizeString(raw.imageAlign ?? raw.image_align ?? raw.align, ''),
		imageAlign_tablet: normalizeString(raw.imageAlign_tablet ?? raw.image_align_tablet, ''),
		imageAlign_mobile: normalizeString(raw.imageAlign_mobile ?? raw.image_align_mobile, ''),
		width: normalizeSliderValue(raw.width),
		width_tablet: normalizeSliderValue(raw.width_tablet),
		width_mobile: normalizeSliderValue(raw.width_mobile),
		maxWidth: normalizeSliderValue(raw.maxWidth ?? raw.max_width ?? raw.space),
		maxWidth_tablet: normalizeSliderValue(raw.maxWidth_tablet ?? raw.max_width_tablet ?? raw.space_tablet),
		maxWidth_mobile: normalizeSliderValue(raw.maxWidth_mobile ?? raw.max_width_mobile ?? raw.space_mobile),
		height: normalizeSliderValue(raw.height),
		height_tablet: normalizeSliderValue(raw.height_tablet),
		height_mobile: normalizeSliderValue(raw.height_mobile),
		objectFit: normalizeString(raw.objectFit ?? raw.object_fit, ''),
		objectFit_tablet: normalizeString(raw.objectFit_tablet ?? raw.object_fit_tablet, ''),
		objectFit_mobile: normalizeString(raw.objectFit_mobile ?? raw.object_fit_mobile, ''),
		objectPosition: normalizeString(raw.objectPosition ?? raw.object_position, 'center center'),

		// Style - Effects
		opacity: normalizeNumber(raw.opacity, undefined),
		cssFilters: normalizeCSSFilters(raw.cssFilters ?? raw.css_filters ?? raw._css_filters),
		opacityHover: normalizeNumber(raw.opacityHover ?? raw.opacity_hover, undefined),
		cssFiltersHover: normalizeCSSFilters(raw.cssFiltersHover ?? raw.css_filters_hover),
		transitionDuration: normalizeNumber(raw.transitionDuration ?? raw.transition_duration ?? raw.background_hover_transition, undefined),
		hoverAnimation: normalizeString(raw.hoverAnimation ?? raw.hover_animation, ''),

		// Style - Border
		borderType: normalizeString(raw.borderType ?? raw.border_type ?? raw.image_border, ''),
		borderWidth: normalizeBoxDimensions(raw.borderWidth ?? raw.border_width ?? raw.image_border_width),
		borderColor: normalizeString(raw.borderColor ?? raw.border_color ?? raw.image_border_color, ''),
		borderRadius: normalizeBoxDimensions(raw.borderRadius ?? raw.border_radius ?? raw.image_border_radius),
		borderRadius_tablet: normalizeBoxDimensions(raw.borderRadius_tablet ?? raw.border_radius_tablet ?? raw.image_border_radius_tablet),
		borderRadius_mobile: normalizeBoxDimensions(raw.borderRadius_mobile ?? raw.border_radius_mobile ?? raw.image_border_radius_mobile),
		boxShadow: normalizeBoxShadow(raw.boxShadow ?? raw.box_shadow ?? raw.image_box_shadow),
		aspectRatio: normalizeString(raw.aspectRatio ?? raw.aspect_ratio, ''),

		// Style - Caption
		captionAlign: normalizeString(raw.captionAlign ?? raw.caption_align, ''),
		captionTextColor: normalizeString(raw.captionTextColor ?? raw.caption_text_color ?? raw.text_color, ''),
		captionBackgroundColor: normalizeString(raw.captionBackgroundColor ?? raw.caption_background_color, ''),
		captionTypography: normalizeTypography(raw.captionTypography ?? raw.caption_typography),
		captionTextShadow: normalizeTextShadow(raw.captionTextShadow ?? raw.caption_text_shadow),
		captionSpacing: normalizeSliderValue(raw.captionSpacing ?? raw.caption_spacing ?? raw.caption_space),

		// Visibility
		hideDesktop: normalizeBoolean(raw.hideDesktop ?? raw.hide_desktop, false),
		hideTablet: normalizeBoolean(raw.hideTablet ?? raw.hide_tablet, false),
		hideMobile: normalizeBoolean(raw.hideMobile ?? raw.hide_mobile, false),
		customClasses: normalizeString(raw.customClasses ?? raw.custom_classes, ''),
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): ImageVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('[voxel-fse/image] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: ImageVxConfig): ImageBlockAttributes {
	return {
		blockId: '',

		// Image data
		image: config.image,
		imageSize: config.imageSize,
		customWidth: config.customWidth,
		customHeight: config.customHeight,

		// Caption
		captionSource: config.captionSource as 'none' | 'attachment' | 'custom',
		caption: config.caption,

		// Link
		linkTo: config.linkTo as 'none' | 'file' | 'custom',
		link: config.link,
		openLightbox: config.openLightbox as 'default' | 'yes' | 'no',

		// Style - Image
		imageAlign: config.imageAlign,
		imageAlign_tablet: config.imageAlign_tablet,
		imageAlign_mobile: config.imageAlign_mobile,
		width: config.width,
		width_tablet: config.width_tablet,
		width_mobile: config.width_mobile,
		maxWidth: config.maxWidth,
		maxWidth_tablet: config.maxWidth_tablet,
		maxWidth_mobile: config.maxWidth_mobile,
		height: config.height,
		height_tablet: config.height_tablet,
		height_mobile: config.height_mobile,
		objectFit: config.objectFit,
		objectFit_tablet: config.objectFit_tablet,
		objectFit_mobile: config.objectFit_mobile,
		objectPosition: config.objectPosition,
		objectPosition_tablet: undefined,
		objectPosition_mobile: undefined,

		// Style - Effects
		opacity: config.opacity,
		cssFilters: config.cssFilters,
		opacityHover: config.opacityHover,
		cssFiltersHover: config.cssFiltersHover,
		transitionDuration: config.transitionDuration,
		hoverAnimation: config.hoverAnimation,

		// Style - Border
		borderType: config.borderType,
		borderWidth: config.borderWidth,
		borderColor: config.borderColor,
		borderRadius: config.borderRadius,
		borderRadius_tablet: config.borderRadius_tablet,
		borderRadius_mobile: config.borderRadius_mobile,
		boxShadow: config.boxShadow,
		aspectRatio: config.aspectRatio,

		// Style - Caption
		captionAlign: config.captionAlign,
		captionAlign_tablet: undefined,
		captionAlign_mobile: undefined,
		captionTextColor: config.captionTextColor,
		captionBackgroundColor: config.captionBackgroundColor,
		captionTypography: config.captionTypography,
		captionTextShadow: config.captionTextShadow,
		captionSpacing: config.captionSpacing,
		captionSpacing_tablet: undefined,
		captionSpacing_mobile: undefined,

		// Visibility
		hideDesktop: config.hideDesktop,
		hideTablet: config.hideTablet,
		hideMobile: config.hideMobile,
		customClasses: config.customClasses,
	};
}

/**
 * Initialize Image blocks on the page
 */
function initImageBlocks() {
	// Find all image blocks
	const imageBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-image:not([data-hydrated])'
	);

	imageBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('[voxel-fse/image] No vxconfig found for image block');
			return;
		}

		// Mark as hydrated and clear placeholder
		container.dataset.hydrated = 'true';
		container.innerHTML = '';

		// Build attributes from config
		const attributes = buildAttributes(config);

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<ImageComponent
				attributes={attributes}
				context="frontend"
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initImageBlocks);
} else {
	initImageBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initImageBlocks);
window.addEventListener('pjax:complete', initImageBlocks);
