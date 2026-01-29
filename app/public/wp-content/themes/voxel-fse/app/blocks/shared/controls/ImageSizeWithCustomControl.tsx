/**
 * ImageSizeWithCustomControl
 *
 * Image size selector with optional custom dimensions.
 * Shows Width/Height inputs when "Custom" is selected.
 *
 * Extracted from Image block ContentTab.tsx for reusability.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ImageSizeSelectControl from './ImageSizeSelectControl';

interface ImageSizeWithCustomControlProps {
	/** Label for the control */
	label?: string;
	/** Current image size value */
	value: string;
	/** Change handler for image size */
	onChange: (value: string) => void;
	/** Custom width value */
	customWidth?: number;
	/** Custom height value */
	customHeight?: number;
	/** Change handler for custom dimensions */
	onCustomDimensionsChange?: (width?: number, height?: number) => void;
	/** Help text */
	help?: string;
}

/**
 * Custom dimensions input component
 * Replicates Elementor's Width x Height + Apply layout
 */
function CustomDimensionsInput({
	width,
	height,
	onChange,
}: {
	width?: number;
	height?: number;
	onChange: (width?: number, height?: number) => void;
}) {
	const [tempWidth, setTempWidth] = useState(width);
	const [tempHeight, setTempHeight] = useState(height);

	useEffect(() => {
		setTempWidth(width);
		setTempHeight(height);
	}, [width, height]);

	return (
		<div className="voxel-custom-image-size-control" style={{ marginBottom: '24px' }}>
			<label
				className="components-base-control__label"
				style={{ marginBottom: '8px', display: 'block' }}
			>
				{__('Image Dimensions', 'voxel-fse')}{' '}
				<span style={{ color: '#757575', fontWeight: 400, marginLeft: '4px' }}>px</span>
			</label>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
				<div style={{ flex: 1 }}>
					<TextControl
						value={tempWidth ?? ''}
						onChange={(val: string) => setTempWidth(val ? parseFloat(val) : undefined)}
						placeholder={__('Width', 'voxel-fse')}
						type="number"
						__nextHasNoMarginBottom
					/>
					<small
						style={{
							color: '#757575',
							fontSize: '11px',
							display: 'block',
							marginTop: '4px',
							textAlign: 'center',
						}}
					>
						{__('Width', 'voxel-fse')}
					</small>
				</div>
				<div style={{ paddingTop: '8px', color: '#757575', fontWeight: 500 }}>x</div>
				<div style={{ flex: 1 }}>
					<TextControl
						value={tempHeight ?? ''}
						onChange={(val: string) => setTempHeight(val ? parseFloat(val) : undefined)}
						placeholder={__('Height', 'voxel-fse')}
						type="number"
						__nextHasNoMarginBottom
					/>
					<small
						style={{
							color: '#757575',
							fontSize: '11px',
							display: 'block',
							marginTop: '4px',
							textAlign: 'center',
						}}
					>
						{__('Height', 'voxel-fse')}
					</small>
				</div>
				<Button
					variant="secondary"
					onClick={() => onChange(tempWidth, tempHeight)}
					style={{ marginTop: '0', height: '30px' }}
				>
					{__('Apply', 'voxel-fse')}
				</Button>
			</div>
		</div>
	);
}

/**
 * Image size control with custom dimensions support
 *
 * @example
 * <ImageSizeWithCustomControl
 *   value={attributes.imageSize}
 *   onChange={(value) => setAttributes({ imageSize: value })}
 *   customWidth={attributes.customWidth}
 *   customHeight={attributes.customHeight}
 *   onCustomDimensionsChange={(w, h) => setAttributes({ customWidth: w, customHeight: h })}
 * />
 */
export default function ImageSizeWithCustomControl({
	label = __('Image Resolution', 'voxel-fse'),
	value,
	onChange,
	customWidth,
	customHeight,
	onCustomDimensionsChange,
	help,
}: ImageSizeWithCustomControlProps) {
	const isCustom = value === 'custom';

	return (
		<div className="voxel-fse-image-size-with-custom">
			<ImageSizeSelectControl
				label={label}
				value={value}
				onChange={onChange}
				includeCustom={true}
				help={!isCustom ? help : undefined}
			/>

			{isCustom && (
				<>
					<p
						className="components-base-control__help"
						style={{ marginTop: '-8px', marginBottom: '12px' }}
					>
						{help ||
							__(
								'You can crop the original image size to any custom size. You can also set a single value for height or width in order to keep the original size ratio.',
								'voxel-fse'
							)}
					</p>
					{onCustomDimensionsChange && (
						<CustomDimensionsInput
							width={customWidth}
							height={customHeight}
							onChange={onCustomDimensionsChange}
						/>
					)}
				</>
			)}
		</div>
	);
}
