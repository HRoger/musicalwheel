/**
 * Gallery Block - Frontend Entry Point (Plan C+)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Enables WordPress frontend rendering while being
 * compatible with Next.js headless architecture.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/gallery.php
 * - Template: themes/voxel/templates/widgets/gallery.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/gallery.php (1,031 lines)
 *
 * IMAGES SECTION:
 * ✅ ts_gallery_images - Image repeater (uses media gallery control)
 * ✅ ts_visible_count - Number of visible images (with "View all" for overflow)
 * ✅ ts_display_size - Display image size (thumbnail, medium, large, full)
 * ✅ ts_lightbox_size - Lightbox image size
 *
 * COLUMNS SECTION:
 * ✅ ts_gl_col_gap - Column gap (px)
 * ✅ ts_gl_column_no - Number of columns (1-12, responsive)
 * ✅ ts_remove_empty - Remove empty items from grid
 * ✅ ts_gl_autofit - Auto-fit items (minmax grid)
 *
 * ROW HEIGHT SECTION:
 * ✅ ts_gl_row_height - Row height (px, responsive)
 * ✅ ts_gl_row_aspect - Use aspect ratio mode (aspect-ratio-row)
 * ✅ ts_aspect_ratio - Aspect ratio value (e.g., "16/9", "4/3")
 *
 * MOSAIC SECTION (6 items):
 * ✅ ts_gl_mosaic_item_N - Each item has:
 *    - ts_gl_col_span_N - Column span
 *    - ts_gl_col_start_N - Column start position
 *    - ts_gl_row_span_N - Row span
 *    - ts_gl_row_start_N - Row start position
 *    - All with responsive variants (_tablet, _mobile)
 *
 * STYLE - IMAGE:
 * ✅ ts_gl_img_radius - Border radius (px, responsive)
 *
 * STYLE - OVERLAY:
 * ✅ ts_gl_overlay_color - Overlay background color (normal)
 * ✅ ts_gl_overlay_color_h - Overlay background color (hover)
 *
 * STYLE - EMPTY ITEM:
 * ✅ ts_empty_border - Border type (none, solid, dashed, etc.)
 * ✅ ts_empty_border_width - Border width (px)
 * ✅ ts_empty_border_color - Border color
 * ✅ ts_empty_radius - Border radius (px, responsive)
 *
 * STYLE - VIEW ALL BUTTON:
 * ✅ ts_viewall_bg - Background color (normal)
 * ✅ ts_viewall_bg_h - Background color (hover)
 * ✅ ts_viewall_icon_color - Icon color (normal)
 * ✅ ts_viewall_icon_color_h - Icon color (hover)
 * ✅ ts_viewall_ico - Icon (library + value)
 * ✅ ts_viewall_icon_size - Icon size (px, responsive)
 * ✅ ts_viewall_text_color - Text color (normal)
 * ✅ ts_viewall_text_color_h - Text color (hover)
 *
 * HTML STRUCTURE:
 * ✅ .ts-gallery - Main container
 * ✅ .ts-gallery-grid - CSS Grid wrapper
 * ✅ .ts-gallery-item - Individual image item
 * ✅ .ts-view-all - "View all" overlay button
 * ✅ .ts-gallery-lightbox - Lightbox trigger
 * ✅ grid-column/grid-row CSS for mosaic
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ GalleryComponent accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   blockId: string,
 *   images: ProcessedImage[],
 *   visibleCount: number,
 *   columnCount: number (+ tablet/mobile),
 *   columnGap: number (+ tablet/mobile),
 *   rowHeight: number (+ tablet/mobile),
 *   useAspectRatio: boolean (+ tablet/mobile),
 *   aspectRatio: string (+ tablet/mobile),
 *   removeEmpty: boolean,
 *   autoFit: boolean,
 *   mosaic: MosaicConfig (6 items),
 *   imageBorderRadius: number (+ tablet/mobile),
 *   overlayColor/overlayColorHover: string,
 *   emptyBorder*: border settings,
 *   viewAll*: button styling
 * }
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import GalleryComponent from './shared/GalleryComponent';
import type {
	GalleryBlockAttributes,
	GalleryVxConfig,
	GalleryImage,
	MosaicConfig,
	MosaicItemConfig,
	ProcessedImage,
} from './types';
import type { IconValue } from '@shared/types';

/**
 * Default icon structure
 */
const DEFAULT_ICON: IconValue = {
	library: '',
	value: '',
};

/**
 * Default mosaic item config
 */
const DEFAULT_MOSAIC_ITEM: MosaicItemConfig = {
	colSpan: null,
	colStart: null,
	rowSpan: null,
	rowStart: null,
};

/**
 * Default mosaic config (6 items)
 */
const DEFAULT_MOSAIC: MosaicConfig = {
	item1: { ...DEFAULT_MOSAIC_ITEM },
	item2: { ...DEFAULT_MOSAIC_ITEM },
	item3: { ...DEFAULT_MOSAIC_ITEM },
	item4: { ...DEFAULT_MOSAIC_ITEM },
	item5: { ...DEFAULT_MOSAIC_ITEM },
	item6: { ...DEFAULT_MOSAIC_ITEM },
};

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: themes/voxel/app/widgets/gallery.php control names
 */
function normalizeConfig(raw: Record<string, unknown>): GalleryVxConfig {
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

	// Helper for icon normalization
	const normalizeIcon = (val: unknown): IconValue => {
		if (val && typeof val === 'object') {
			const iconObj = val as Record<string, unknown>;
			return {
				library: normalizeString(iconObj['library'], '') as IconValue['library'],
				value: normalizeString(iconObj['value'], ''),
			};
		}
		return { ...DEFAULT_ICON };
	};

	// Helper for mosaic item normalization
	const normalizeMosaicItem = (val: unknown, index: number): MosaicItemConfig => {
		if (!val || typeof val !== 'object') return { ...DEFAULT_MOSAIC_ITEM };
		const item = val as Record<string, unknown>;

		// Support both camelCase and snake_case with index suffix
		const snakePrefix = `ts_gl_`;
		const suffix = `_${index}`;

		return {
			colSpan: normalizeOptionalNumber(item['colSpan'] ?? item[`${snakePrefix}col_span${suffix}`]) ?? null,
			colStart: normalizeOptionalNumber(item['colStart'] ?? item[`${snakePrefix}col_start${suffix}`]) ?? null,
			rowSpan: normalizeOptionalNumber(item['rowSpan'] ?? item[`${snakePrefix}row_span${suffix}`]) ?? null,
			rowStart: normalizeOptionalNumber(item['rowStart'] ?? item[`${snakePrefix}row_start${suffix}`]) ?? null,
			colSpan_tablet: normalizeOptionalNumber(item['colSpan_tablet']) ?? null,
			colStart_tablet: normalizeOptionalNumber(item['colStart_tablet']) ?? null,
			rowSpan_tablet: normalizeOptionalNumber(item['rowSpan_tablet']) ?? null,
			rowStart_tablet: normalizeOptionalNumber(item['rowStart_tablet']) ?? null,
			colSpan_mobile: normalizeOptionalNumber(item['colSpan_mobile']) ?? null,
			colStart_mobile: normalizeOptionalNumber(item['colStart_mobile']) ?? null,
			rowSpan_mobile: normalizeOptionalNumber(item['rowSpan_mobile']) ?? null,
			rowStart_mobile: normalizeOptionalNumber(item['rowStart_mobile']) ?? null,
		};
	};

	// Helper for mosaic config normalization
	const normalizeMosaic = (val: unknown): MosaicConfig => {
		if (!val || typeof val !== 'object') return { ...DEFAULT_MOSAIC };
		const mosaic = val as Record<string, unknown>;

		return {
			item1: normalizeMosaicItem(mosaic['item1'] ?? mosaic['ts_gl_mosaic_item_1'], 1),
			item2: normalizeMosaicItem(mosaic['item2'] ?? mosaic['ts_gl_mosaic_item_2'], 2),
			item3: normalizeMosaicItem(mosaic['item3'] ?? mosaic['ts_gl_mosaic_item_3'], 3),
			item4: normalizeMosaicItem(mosaic['item4'] ?? mosaic['ts_gl_mosaic_item_4'], 4),
			item5: normalizeMosaicItem(mosaic['item5'] ?? mosaic['ts_gl_mosaic_item_5'], 5),
			item6: normalizeMosaicItem(mosaic['item6'] ?? mosaic['ts_gl_mosaic_item_6'], 6),
		};
	};

	// Helper for images normalization
	const normalizeImages = (val: unknown): ProcessedImage[] => {
		if (!val || !Array.isArray(val)) return [];
		return val.map((img: unknown) => {
			const imgObj = (img ?? {}) as Record<string, unknown>;
			return {
				id: normalizeNumber(imgObj['id'], 0),
				src_display: normalizeString(imgObj['src_display'] ?? imgObj['srcDisplay'] ?? imgObj['url'], ''),
				src_lightbox: normalizeString(imgObj['src_lightbox'] ?? imgObj['srcLightbox'] ?? imgObj['url'], ''),
				alt: normalizeString(imgObj['alt'], ''),
				caption: normalizeString(imgObj['caption'], ''),
				description: normalizeString(imgObj['description'], ''),
				title: normalizeString(imgObj['title'], ''),
				display_size: normalizeString(imgObj['display_size'] ?? imgObj['displaySize'], 'medium'),
			};
		});
	};

	return {
		// Block ID
		blockId: normalizeString(raw['blockId'] ?? raw['block_id'], ''),

		// Images
		images: normalizeImages(raw['images'] ?? raw['ts_gallery_images']),
		visibleCount: normalizeNumber(raw['visibleCount'] ?? raw['visible_count'] ?? raw['ts_visible_count'], 6),

		// Columns
		columnCount: normalizeNumber(raw['columnCount'] ?? raw['column_count'] ?? raw['ts_gl_column_no'], 3),
		columnCount_tablet: normalizeOptionalNumber(raw['columnCount_tablet'] ?? raw['column_count_tablet']),
		columnCount_mobile: normalizeOptionalNumber(raw['columnCount_mobile'] ?? raw['column_count_mobile']),
		columnGap: normalizeOptionalNumber(raw['columnGap'] ?? raw['column_gap'] ?? raw['ts_gl_col_gap']),
		columnGap_tablet: normalizeOptionalNumber(raw['columnGap_tablet'] ?? raw['column_gap_tablet']),
		columnGap_mobile: normalizeOptionalNumber(raw['columnGap_mobile'] ?? raw['column_gap_mobile']),
		removeEmpty: normalizeBool(raw['removeEmpty'] ?? raw['remove_empty'] ?? raw['ts_remove_empty'], false),
		autoFit: normalizeBool(raw['autoFit'] ?? raw['auto_fit'] ?? raw['ts_gl_autofit'], false),

		// Row Height
		rowHeight: normalizeNumber(raw['rowHeight'] ?? raw['row_height'] ?? raw['ts_gl_row_height'], 180),
		rowHeight_tablet: normalizeOptionalNumber(raw['rowHeight_tablet'] ?? raw['row_height_tablet']),
		rowHeight_mobile: normalizeOptionalNumber(raw['rowHeight_mobile'] ?? raw['row_height_mobile']),
		useAspectRatio: normalizeBool(raw['useAspectRatio'] ?? raw['use_aspect_ratio'] ?? raw['ts_gl_row_aspect'], false),
		useAspectRatio_tablet: raw['useAspectRatio_tablet'] !== undefined
			? normalizeBool(raw['useAspectRatio_tablet'], false)
			: undefined,
		useAspectRatio_mobile: raw['useAspectRatio_mobile'] !== undefined
			? normalizeBool(raw['useAspectRatio_mobile'], false)
			: undefined,
		aspectRatio: normalizeString(raw['aspectRatio'] ?? raw['aspect_ratio'] ?? raw['ts_aspect_ratio'], '16/9'),
		aspectRatio_tablet: raw['aspectRatio_tablet'] !== undefined
			? normalizeString(raw['aspectRatio_tablet'], '')
			: undefined,
		aspectRatio_mobile: raw['aspectRatio_mobile'] !== undefined
			? normalizeString(raw['aspectRatio_mobile'], '')
			: undefined,

		// Mosaic
		mosaic: normalizeMosaic(raw['mosaic']),

		// Style - Image
		imageBorderRadius: normalizeNumber(raw['imageBorderRadius'] ?? raw['borderRadius'] ?? raw['border_radius'] ?? raw['ts_gl_img_radius'], 0),
		imageBorderRadius_tablet: normalizeOptionalNumber(raw['imageBorderRadius_tablet'] ?? raw['borderRadius_tablet'] ?? raw['border_radius_tablet']),
		imageBorderRadius_mobile: normalizeOptionalNumber(raw['imageBorderRadius_mobile'] ?? raw['borderRadius_mobile'] ?? raw['border_radius_mobile']),

		// Style - Overlay
		overlayColor: normalizeString(raw['overlayColor'] ?? raw['overlay_color'] ?? raw['ts_gl_overlay_color'], ''),
		overlayColorHover: normalizeString(
			raw['overlayColorHover'] ?? raw['overlay_color_hover'] ?? raw['ts_gl_overlay_color_h'],
			''
		),

		// Style - Empty Item
		emptyBorderType: normalizeString(raw['emptyBorderType'] ?? raw['empty_border_type'] ?? raw['ts_empty_border'], 'none'),
		emptyBorderWidth: normalizeOptionalNumber(raw['emptyBorderWidth'] ?? raw['empty_border_width'] ?? raw['ts_empty_border_width']),
		emptyBorderColor: normalizeString(raw['emptyBorderColor'] ?? raw['empty_border_color'] ?? raw['ts_empty_border_color'], ''),
		emptyBorderRadius: normalizeOptionalNumber(raw['emptyBorderRadius'] ?? raw['empty_border_radius'] ?? raw['ts_empty_radius']),
		emptyBorderRadius_tablet: normalizeOptionalNumber(raw['emptyBorderRadius_tablet'] ?? raw['empty_border_radius_tablet']),
		emptyBorderRadius_mobile: normalizeOptionalNumber(raw['emptyBorderRadius_mobile'] ?? raw['empty_border_radius_mobile']),

		// Style - View All Button
		viewAllBgColor: normalizeString(raw['viewAllBgColor'] ?? raw['view_all_bg_color'] ?? raw['ts_viewall_bg'], ''),
		viewAllBgColorHover: normalizeString(
			raw['viewAllBgColorHover'] ?? raw['view_all_bg_color_hover'] ?? raw['ts_viewall_bg_h'],
			''
		),
		viewAllIconColor: normalizeString(
			raw['viewAllIconColor'] ?? raw['view_all_icon_color'] ?? raw['ts_viewall_icon_color'],
			''
		),
		viewAllIconColorHover: normalizeString(
			raw['viewAllIconColorHover'] ?? raw['view_all_icon_color_hover'] ?? raw['ts_viewall_icon_color_h'],
			''
		),
		viewAllIcon: normalizeIcon(raw['viewAllIcon'] ?? raw['view_all_icon'] ?? raw['ts_viewall_ico']),
		viewAllIconSize: normalizeOptionalNumber(raw['viewAllIconSize'] ?? raw['view_all_icon_size'] ?? raw['ts_viewall_icon_size']),
		viewAllIconSize_tablet: normalizeOptionalNumber(raw['viewAllIconSize_tablet'] ?? raw['view_all_icon_size_tablet']),
		viewAllIconSize_mobile: normalizeOptionalNumber(raw['viewAllIconSize_mobile'] ?? raw['view_all_icon_size_mobile']),
		viewAllTextColor: normalizeString(
			raw['viewAllTextColor'] ?? raw['view_all_text_color'] ?? raw['ts_viewall_text_color'],
			''
		),
		viewAllTextColorHover: normalizeString(
			raw['viewAllTextColorHover'] ?? raw['view_all_text_color_hover'] ?? raw['ts_viewall_text_color_h'],
			''
		),
		viewAllTypography: raw['viewAllTypography'] as GalleryVxConfig['viewAllTypography'],
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): GalleryVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent);
			// Use normalizeConfig for consistent format handling
			return normalizeConfig(rawConfig);
		} catch (error) {
			console.error('[Gallery] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Convert vxconfig to block attributes for component
 */
function vxConfigToAttributes(config: GalleryVxConfig): GalleryBlockAttributes {
	// Convert processed images back to GalleryImage format
	const images: GalleryImage[] = config.images.map((img) => ({
		id: img.id,
		url: img.src_display,
		alt: img.alt,
		caption: img.caption,
		description: img.description,
		title: img.title,
	}));

	return {
		blockId: config.blockId,
		images,
		visibleCount: config.visibleCount,
		displaySize: 'medium', // Default, actual URLs already in config
		lightboxSize: 'large', // Default, actual URLs already in config
		columnCount: config.columnCount,
		columnCount_tablet: config.columnCount_tablet,
		columnCount_mobile: config.columnCount_mobile,
		columnGap: config.columnGap,
		columnGap_tablet: config.columnGap_tablet,
		columnGap_mobile: config.columnGap_mobile,
		rowHeight: config.rowHeight,
		rowHeight_tablet: config.rowHeight_tablet,
		rowHeight_mobile: config.rowHeight_mobile,
		useAspectRatio: config.useAspectRatio,
		useAspectRatio_tablet: config.useAspectRatio_tablet,
		useAspectRatio_mobile: config.useAspectRatio_mobile,
		aspectRatio: config.aspectRatio,
		aspectRatio_tablet: config.aspectRatio_tablet,
		aspectRatio_mobile: config.aspectRatio_mobile,
		removeEmpty: config.removeEmpty,
		autoFit: config.autoFit,
		mosaic: config.mosaic,
		imageBorderRadius: config.imageBorderRadius,
		imageBorderRadius_tablet: config.imageBorderRadius_tablet,
		imageBorderRadius_mobile: config.imageBorderRadius_mobile,
		overlayColor: config.overlayColor,
		overlayColorHover: config.overlayColorHover,
		emptyBorderType: config.emptyBorderType,
		emptyBorderWidth: config.emptyBorderWidth,
		emptyBorderColor: config.emptyBorderColor,
		emptyBorderRadius: config.emptyBorderRadius,
		emptyBorderRadius_tablet: config.emptyBorderRadius_tablet,
		emptyBorderRadius_mobile: config.emptyBorderRadius_mobile,
		viewAllBgColor: config.viewAllBgColor,
		viewAllBgColorHover: config.viewAllBgColorHover,
		viewAllIconColor: config.viewAllIconColor,
		viewAllIconColorHover: config.viewAllIconColorHover,
		viewAllIcon: config.viewAllIcon,
		viewAllIconSize: config.viewAllIconSize,
		viewAllIconSize_tablet: config.viewAllIconSize_tablet,
		viewAllIconSize_mobile: config.viewAllIconSize_mobile,
		viewAllTextColor: config.viewAllTextColor,
		viewAllTextColorHover: config.viewAllTextColorHover,
		viewAllTypography: config.viewAllTypography,
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
	};
}

/**
 * Initialize gallery blocks on the page
 */
function initGalleryBlocks() {
	// Find all gallery blocks by the Voxel class pattern
	const galleryBlocks = document.querySelectorAll<HTMLElement>('.ts-gallery.voxel-fse-gallery');

	galleryBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['reactMounted'] === 'true') {
			return;
		}

		// Parse vxconfig
		const vxConfig = parseVxConfig(container);
		if (!vxConfig) {
			console.warn('[Gallery] No vxconfig found, skipping hydration');
			return;
		}

		// Convert to attributes
		const attributes = vxConfigToAttributes(vxConfig);

		// Mark as mounted to prevent double initialization
		container.dataset['reactMounted'] = 'true';

		// Clear placeholder content
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<GalleryComponent
				attributes={attributes}
				context="frontend"
				blockId={vxConfig.blockId}
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initGalleryBlocks);
} else {
	initGalleryBlocks();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initGalleryBlocks);
window.addEventListener('pjax:complete', initGalleryBlocks);
