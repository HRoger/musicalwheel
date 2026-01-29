/**
 * ImageSizeSelectControl
 *
 * SelectControl pre-configured with WordPress image sizes.
 * Wraps @wordpress/components SelectControl with sensible defaults.
 *
 * @package VoxelFSE
 */

import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getImageSizeOptions, type ImageSizeOption } from './image-options';

interface ImageSizeSelectControlProps {
	/** Label for the control */
	label?: string;
	/** Current value */
	value: string;
	/** Change handler */
	onChange: (value: string) => void;
	/** Include 'Custom' option (default: false) */
	includeCustom?: boolean;
	/** Custom options array (overrides includeCustom) */
	options?: ImageSizeOption[];
	/** Help text */
	help?: string;
}

/**
 * Image size select control with WordPress standard sizes
 *
 * @example
 * // Basic usage
 * <ImageSizeSelectControl
 *   value={attributes.imageSize}
 *   onChange={(value) => setAttributes({ imageSize: value })}
 * />
 *
 * @example
 * // With custom option enabled
 * <ImageSizeSelectControl
 *   value={attributes.imageSize}
 *   onChange={(value) => setAttributes({ imageSize: value })}
 *   includeCustom={true}
 * />
 */
export default function ImageSizeSelectControl({
	label = __('Image Resolution', 'voxel-fse'),
	value,
	onChange,
	includeCustom = false,
	options,
	help,
}: ImageSizeSelectControlProps) {
	const finalOptions = options || getImageSizeOptions({ includeCustom });

	return (
		<SelectControl
			label={label}
			value={value}
			options={finalOptions}
			onChange={onChange}
			help={help}
			__nextHasNoMarginBottom
		/>
	);
}
