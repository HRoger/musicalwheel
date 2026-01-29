/**
 * Image Size Options - Centralized Constants
 *
 * Single source of truth for WordPress image size options.
 * Prevents duplication across Image, Gallery, Slider, BackgroundControl.
 *
 * IMPORTANT: Use getImageSizeOptions() function instead of IMAGE_SIZES_FULL constant
 * to ensure __() is called at render time, not module initialization time.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';

/**
 * Valid WordPress image size values
 */
export type ImageSizeValue =
	| 'thumbnail'
	| 'medium'
	| 'medium_large'
	| 'large'
	| 'full'
	| 'custom';

/**
 * Option structure for SelectControl
 */
export interface ImageSizeOption {
	label: string;
	value: string;
}

/**
 * Get image size options - MUST be called at render time to ensure i18n works
 *
 * @param options.includeCustom - Whether to include the "Custom" option (default: false)
 * @returns Array of image size options with translated labels
 *
 * @example
 * // Without custom option (Gallery, BackgroundControl)
 * getImageSizeOptions()
 *
 * @example
 * // With custom option (Image block)
 * getImageSizeOptions({ includeCustom: true })
 */
export function getImageSizeOptions(options?: {
	includeCustom?: boolean;
}): ImageSizeOption[] {
	const { includeCustom = false } = options || {};

	const sizes: ImageSizeOption[] = [
		{ label: __('Thumbnail - 150 x 150', 'voxel-fse'), value: 'thumbnail' },
		{ label: __('Medium - 300 x 300', 'voxel-fse'), value: 'medium' },
		{ label: __('Medium Large - 768 x 0', 'voxel-fse'), value: 'medium_large' },
		{ label: __('Large - 1024 x 1024', 'voxel-fse'), value: 'large' },
		{ label: __('Full', 'voxel-fse'), value: 'full' },
	];

	if (includeCustom) {
		sizes.push({ label: __('Custom', 'voxel-fse'), value: 'custom' });
	}

	console.log('[getImageSizeOptions] returning:', sizes);
	return sizes;
}

/**
 * @deprecated Use getImageSizeOptions() instead to ensure proper i18n initialization
 * This constant is kept for backwards compatibility but may have empty labels
 * if accessed before i18n is ready.
 */
export const IMAGE_SIZES_FULL: ImageSizeOption[] = [
	{ label: 'Thumbnail - 150 x 150', value: 'thumbnail' },
	{ label: 'Medium - 300 x 300', value: 'medium' },
	{ label: 'Medium Large - 768 x 0', value: 'medium_large' },
	{ label: 'Large - 1024 x 1024', value: 'large' },
	{ label: 'Full', value: 'full' },
];

/**
 * @deprecated Use getImageSizeOptions({ includeCustom: true }) instead
 */
export const CUSTOM_SIZE_OPTION: ImageSizeOption = {
	label: 'Custom',
	value: 'custom',
};
