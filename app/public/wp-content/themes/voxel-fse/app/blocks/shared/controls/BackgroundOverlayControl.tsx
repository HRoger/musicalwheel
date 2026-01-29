/**
 * Background Overlay Control Component
 *
 * Comprehensive background overlay control matching Elementor's Group_Control_Background for overlays.
 * Supports Classic (Color + Image) and Gradient modes with Normal/Hover states.
 *
 * Features:
 * - Background type selector (Classic/Gradient)
 * - Color picker for solid backgrounds
 * - Image upload with responsive support
 * - Opacity slider (0-1, default 0.5)
 * - CSS Filters popup (blur, brightness, contrast, saturation, hue)
 * - Normal/Hover state tabs
 * - Transition duration for hover effects
 *
 * Evidence:
 * - Elementor: Container > Style > Background Overlay
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import { SelectControl, RangeControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import StateTabPanel from './StateTabPanel';
import ChooseControl from './ChooseControl';
import ColorPickerControl from './ColorPickerControl';
import ImageUploadControl, { ImageUploadValue } from './ImageUploadControl';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import CssFiltersPopup, { CssFiltersValue } from './CssFiltersPopup';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface BackgroundOverlayControlAttributes {
	// Tab state
	bgOverlayActiveTab?: string;

	// Background Type (Normal/Hover) - 'classic' | 'gradient'
	bgOverlayType?: string;
	bgOverlayTypeHover?: string;

	// Background Color (Normal/Hover)
	bgOverlayColor?: string;
	bgOverlayColorHover?: string;

	// Background Image (Normal, responsive)
	bgOverlayImage?: ImageUploadValue;
	bgOverlayImage_tablet?: ImageUploadValue;
	bgOverlayImage_mobile?: ImageUploadValue;

	// Background Image (Hover, responsive)
	bgOverlayImageHover?: ImageUploadValue;
	bgOverlayImageHover_tablet?: ImageUploadValue;
	bgOverlayImageHover_mobile?: ImageUploadValue;

	// Dynamic Tags for Overlay Image (Normal/Hover)
	bgOverlayImageDynamicTag?: string;
	bgOverlayImageDynamicTagHover?: string;

	// Image Position (Normal/Hover, responsive)
	bgOverlayImagePosition?: string;
	bgOverlayImagePosition_tablet?: string;
	bgOverlayImagePosition_mobile?: string;
	bgOverlayImagePositionHover?: string;
	bgOverlayImagePositionHover_tablet?: string;
	bgOverlayImagePositionHover_mobile?: string;

	// Image Attachment (Normal/Hover)
	bgOverlayImageAttachment?: string;
	bgOverlayImageAttachmentHover?: string;

	// Image Repeat (Normal/Hover, responsive)
	bgOverlayImageRepeat?: string;
	bgOverlayImageRepeat_tablet?: string;
	bgOverlayImageRepeat_mobile?: string;
	bgOverlayImageRepeatHover?: string;
	bgOverlayImageRepeatHover_tablet?: string;
	bgOverlayImageRepeatHover_mobile?: string;

	// Image Size (Normal/Hover, responsive)
	bgOverlayImageSize?: string;
	bgOverlayImageSize_tablet?: string;
	bgOverlayImageSize_mobile?: string;
	bgOverlayImageSizeHover?: string;
	bgOverlayImageSizeHover_tablet?: string;
	bgOverlayImageSizeHover_mobile?: string;

	// Opacity (Normal/Hover)
	bgOverlayOpacity?: number;
	bgOverlayOpacityHover?: number;

	// Gradient Color (Normal/Hover)
	bgOverlayGradientColor?: string;
	bgOverlayGradientColorHover?: string;

	// Gradient Location (Normal/Hover, responsive)
	bgOverlayGradientLocation?: number;
	bgOverlayGradientLocation_tablet?: number;
	bgOverlayGradientLocation_mobile?: number;
	bgOverlayGradientLocationHover?: number;
	bgOverlayGradientLocationHover_tablet?: number;
	bgOverlayGradientLocationHover_mobile?: number;

	// Gradient Second Color (Normal/Hover)
	bgOverlayGradientSecondColor?: string;
	bgOverlayGradientSecondColorHover?: string;

	// Gradient Second Location (Normal/Hover, responsive)
	bgOverlayGradientSecondLocation?: number;
	bgOverlayGradientSecondLocation_tablet?: number;
	bgOverlayGradientSecondLocation_mobile?: number;
	bgOverlayGradientSecondLocationHover?: number;
	bgOverlayGradientSecondLocationHover_tablet?: number;
	bgOverlayGradientSecondLocationHover_mobile?: number;

	// Gradient Type (Normal/Hover) - 'linear' | 'radial'
	bgOverlayGradientType?: string;
	bgOverlayGradientTypeHover?: string;

	// Gradient Angle (Linear, Normal/Hover, responsive)
	bgOverlayGradientAngle?: number;
	bgOverlayGradientAngle_tablet?: number;
	bgOverlayGradientAngle_mobile?: number;
	bgOverlayGradientAngleHover?: number;
	bgOverlayGradientAngleHover_tablet?: number;
	bgOverlayGradientAngleHover_mobile?: number;

	// Gradient Position (Radial, Normal/Hover, responsive)
	bgOverlayGradientPosition?: string;
	bgOverlayGradientPosition_tablet?: string;
	bgOverlayGradientPosition_mobile?: string;
	bgOverlayGradientPositionHover?: string;
	bgOverlayGradientPositionHover_tablet?: string;
	bgOverlayGradientPositionHover_mobile?: string;

	// CSS Filters (Normal/Hover)
	bgOverlayCssFilters?: CssFiltersValue;
	bgOverlayCssFiltersHover?: CssFiltersValue;

	// Transition Duration
	bgOverlayTransitionDuration?: number;

	// Allow indexing for dynamic attribute access
	[key: string]: any;
}

export interface BackgroundOverlayControlProps {
	/** Block attributes containing background overlay settings */
	attributes: BackgroundOverlayControlAttributes;
	/** Function to update block attributes */
	setAttributes: (attrs: Partial<BackgroundOverlayControlAttributes>) => void;
}

/**
 * Background Overlay attribute definitions for block.json
 * Use spread operator: ...backgroundOverlayControlAttributes
 */
export const backgroundOverlayControlAttributes = {
	// Tab state
	bgOverlayActiveTab: { type: 'string', default: 'normal' },

	// Background Type
	bgOverlayType: { type: 'string', default: 'classic' },
	bgOverlayTypeHover: { type: 'string', default: 'classic' },

	// Background Color
	bgOverlayColor: { type: 'string' },
	bgOverlayColorHover: { type: 'string' },

	// Background Image (responsive)
	bgOverlayImage: { type: 'object' },
	bgOverlayImage_tablet: { type: 'object' },
	bgOverlayImage_mobile: { type: 'object' },
	bgOverlayImageHover: { type: 'object' },
	bgOverlayImageHover_tablet: { type: 'object' },
	bgOverlayImageHover_mobile: { type: 'object' },

	// Dynamic Tags for Overlay Image
	bgOverlayImageDynamicTag: { type: 'string' },
	bgOverlayImageDynamicTagHover: { type: 'string' },

	// Image Position (responsive)
	bgOverlayImagePosition: { type: 'string' },
	bgOverlayImagePosition_tablet: { type: 'string' },
	bgOverlayImagePosition_mobile: { type: 'string' },
	bgOverlayImagePositionHover: { type: 'string' },
	bgOverlayImagePositionHover_tablet: { type: 'string' },
	bgOverlayImagePositionHover_mobile: { type: 'string' },

	// Image Attachment
	bgOverlayImageAttachment: { type: 'string' },
	bgOverlayImageAttachmentHover: { type: 'string' },

	// Image Repeat (responsive)
	bgOverlayImageRepeat: { type: 'string' },
	bgOverlayImageRepeat_tablet: { type: 'string' },
	bgOverlayImageRepeat_mobile: { type: 'string' },
	bgOverlayImageRepeatHover: { type: 'string' },
	bgOverlayImageRepeatHover_tablet: { type: 'string' },
	bgOverlayImageRepeatHover_mobile: { type: 'string' },

	// Image Size (responsive)
	bgOverlayImageSize: { type: 'string' },
	bgOverlayImageSize_tablet: { type: 'string' },
	bgOverlayImageSize_mobile: { type: 'string' },
	bgOverlayImageSizeHover: { type: 'string' },
	bgOverlayImageSizeHover_tablet: { type: 'string' },
	bgOverlayImageSizeHover_mobile: { type: 'string' },

	// Opacity
	bgOverlayOpacity: { type: 'number', default: 0.5 },
	bgOverlayOpacityHover: { type: 'number' },

	// Gradient Color
	bgOverlayGradientColor: { type: 'string' },
	bgOverlayGradientColorHover: { type: 'string' },

	// Gradient Location (responsive)
	bgOverlayGradientLocation: { type: 'number', default: 0 },
	bgOverlayGradientLocation_tablet: { type: 'number' },
	bgOverlayGradientLocation_mobile: { type: 'number' },
	bgOverlayGradientLocationHover: { type: 'number', default: 0 },
	bgOverlayGradientLocationHover_tablet: { type: 'number' },
	bgOverlayGradientLocationHover_mobile: { type: 'number' },

	// Gradient Second Color
	bgOverlayGradientSecondColor: { type: 'string' },
	bgOverlayGradientSecondColorHover: { type: 'string' },

	// Gradient Second Location (responsive)
	bgOverlayGradientSecondLocation: { type: 'number', default: 100 },
	bgOverlayGradientSecondLocation_tablet: { type: 'number' },
	bgOverlayGradientSecondLocation_mobile: { type: 'number' },
	bgOverlayGradientSecondLocationHover: { type: 'number', default: 100 },
	bgOverlayGradientSecondLocationHover_tablet: { type: 'number' },
	bgOverlayGradientSecondLocationHover_mobile: { type: 'number' },

	// Gradient Type
	bgOverlayGradientType: { type: 'string', default: 'linear' },
	bgOverlayGradientTypeHover: { type: 'string', default: 'linear' },

	// Gradient Angle (responsive)
	bgOverlayGradientAngle: { type: 'number', default: 180 },
	bgOverlayGradientAngle_tablet: { type: 'number' },
	bgOverlayGradientAngle_mobile: { type: 'number' },
	bgOverlayGradientAngleHover: { type: 'number', default: 180 },
	bgOverlayGradientAngleHover_tablet: { type: 'number' },
	bgOverlayGradientAngleHover_mobile: { type: 'number' },

	// Gradient Position (responsive)
	bgOverlayGradientPosition: { type: 'string', default: 'center center' },
	bgOverlayGradientPosition_tablet: { type: 'string' },
	bgOverlayGradientPosition_mobile: { type: 'string' },
	bgOverlayGradientPositionHover: { type: 'string', default: 'center center' },
	bgOverlayGradientPositionHover_tablet: { type: 'string' },
	bgOverlayGradientPositionHover_mobile: { type: 'string' },

	// CSS Filters
	bgOverlayCssFilters: { type: 'object', default: {} },
	bgOverlayCssFiltersHover: { type: 'object', default: {} },

	// Transition Duration
	bgOverlayTransitionDuration: { type: 'number', default: 0.3 },
};

/**
 * BackgroundOverlayControl - Comprehensive background overlay control matching Elementor
 */
export default function BackgroundOverlayControl({
	attributes,
	setAttributes,
}: BackgroundOverlayControlProps) {
	// Get WordPress's current device type
	const wpDeviceType = useSelect((select) => {
		const { getDeviceType } = (select('core/editor') as any) || {};
		if (typeof getDeviceType === 'function') {
			return getDeviceType();
		}
		const { __experimentalGetPreviewDeviceType } =
			(select('core/edit-post') as any) || {};
		if (typeof __experimentalGetPreviewDeviceType === 'function') {
			return __experimentalGetPreviewDeviceType();
		}
		return 'Desktop';
	}, []);

	const wpDevice = wpDeviceType
		? (wpDeviceType.toLowerCase() as DeviceType)
		: 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	// Sync with WordPress device type
	useEffect(() => {
		setCurrentDevice(wpDevice);
	}, [wpDevice]);

	// Render content for a single state (normal or hover)
	const renderStateContent = (isHover: boolean) => {
		const bgType = isHover
			? attributes.bgOverlayTypeHover
			: attributes.bgOverlayType;
		const currentImage = isHover
			? attributes.bgOverlayImageHover
			: attributes.bgOverlayImage;
		const currentGradientType = isHover
			? attributes.bgOverlayGradientTypeHover
			: attributes.bgOverlayGradientType;

		return (
			<>
				{/* Background Type Toggle: Classic | Gradient */}
				<ChooseControl
					label={__('Background Type', 'voxel-fse')}
					value={bgType || 'classic'}
					onChange={(value) => {
						if (isHover) {
							setAttributes({ bgOverlayTypeHover: value });
						} else {
							setAttributes({ bgOverlayType: value });
						}
					}}
					options={[
						{
							value: 'classic',
							icon: 'eicon-paint-brush',
							title: __('Classic', 'voxel-fse'),
						},
						{
							value: 'gradient',
							icon: 'eicon-barcode',
							title: __('Gradient', 'voxel-fse'),
						},
					]}
					variant="inline"
				/>

				{/* === CLASSIC MODE === */}
				{(bgType === 'classic' || !bgType) && (
					<>
						{/* Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={
								isHover
									? attributes.bgOverlayColorHover
									: attributes.bgOverlayColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayColorHover: value });
								} else {
									setAttributes({ bgOverlayColor: value });
								}
							}}
						/>

						{/* Image */}
						<ImageUploadControl
							label={__('Image', 'voxel-fse')}
							value={
								isHover
									? attributes.bgOverlayImageHover
									: attributes.bgOverlayImage
							}
							valueTablet={
								isHover
									? attributes.bgOverlayImageHover_tablet
									: attributes.bgOverlayImage_tablet
							}
							valueMobile={
								isHover
									? attributes.bgOverlayImageHover_mobile
									: attributes.bgOverlayImage_mobile
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayImageHover: value });
								} else {
									setAttributes({ bgOverlayImage: value });
								}
							}}
							onChangeTablet={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayImageHover_tablet: value });
								} else {
									setAttributes({ bgOverlayImage_tablet: value });
								}
							}}
							onChangeMobile={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayImageHover_mobile: value });
								} else {
									setAttributes({ bgOverlayImage_mobile: value });
								}
							}}
							responsive
							enableDynamicTags
							dynamicTagValue={
								isHover
									? attributes.bgOverlayImageDynamicTagHover
									: attributes.bgOverlayImageDynamicTag
							}
							onDynamicTagChange={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayImageDynamicTagHover: value });
								} else {
									setAttributes({ bgOverlayImageDynamicTag: value });
								}
							}}
						/>

						{/* Image sub-controls - only show when image is set */}
						{currentImage?.url && (
							<>
								{/* Position (responsive) */}
								<div style={{ marginTop: '16px' }}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											marginBottom: '8px',
										}}
									>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>
											{__('Position', 'voxel-fse')}
										</span>
										<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
									</div>
									<SelectControl
										value={(() => {
											if (isHover) {
												if (currentDevice === 'tablet')
													return attributes.bgOverlayImagePositionHover_tablet || '';
												if (currentDevice === 'mobile')
													return attributes.bgOverlayImagePositionHover_mobile || '';
												return attributes.bgOverlayImagePositionHover || '';
											}
											if (currentDevice === 'tablet')
												return attributes.bgOverlayImagePosition_tablet || '';
											if (currentDevice === 'mobile')
												return attributes.bgOverlayImagePosition_mobile || '';
											return attributes.bgOverlayImagePosition || '';
										})()}
										options={[
											{ label: __('Default', 'voxel-fse'), value: '' },
											{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
											{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
											{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
											{ label: __('Center Left', 'voxel-fse'), value: 'center left' },
											{ label: __('Center Center', 'voxel-fse'), value: 'center center' },
											{ label: __('Center Right', 'voxel-fse'), value: 'center right' },
											{ label: __('Bottom Left', 'voxel-fse'), value: 'bottom left' },
											{ label: __('Bottom Center', 'voxel-fse'), value: 'bottom center' },
											{ label: __('Bottom Right', 'voxel-fse'), value: 'bottom right' },
										]}
										onChange={(value: string) => {
											if (isHover) {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImagePositionHover_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImagePositionHover_mobile: value });
												} else {
													setAttributes({ bgOverlayImagePositionHover: value });
												}
											} else {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImagePosition_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImagePosition_mobile: value });
												} else {
													setAttributes({ bgOverlayImagePosition: value });
												}
											}
										}}
										__nextHasNoMarginBottom
									/>
								</div>

								{/* Attachment */}
								<div style={{ marginTop: '16px' }}>
									<SelectControl
										label={__('Attachment', 'voxel-fse')}
										value={
											isHover
												? attributes.bgOverlayImageAttachmentHover
												: attributes.bgOverlayImageAttachment
										}
										options={[
											{ label: __('Default', 'voxel-fse'), value: '' },
											{ label: __('Scroll', 'voxel-fse'), value: 'scroll' },
											{ label: __('Fixed', 'voxel-fse'), value: 'fixed' },
										]}
										onChange={(value: string) => {
											if (isHover) {
												setAttributes({ bgOverlayImageAttachmentHover: value });
											} else {
												setAttributes({ bgOverlayImageAttachment: value });
											}
										}}
										__nextHasNoMarginBottom
									/>
								</div>

								{/* Repeat (responsive) */}
								<div style={{ marginTop: '16px' }}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											marginBottom: '8px',
										}}
									>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>
											{__('Repeat', 'voxel-fse')}
										</span>
										<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
									</div>
									<SelectControl
										value={(() => {
											if (isHover) {
												if (currentDevice === 'tablet')
													return attributes.bgOverlayImageRepeatHover_tablet || '';
												if (currentDevice === 'mobile')
													return attributes.bgOverlayImageRepeatHover_mobile || '';
												return attributes.bgOverlayImageRepeatHover || '';
											}
											if (currentDevice === 'tablet')
												return attributes.bgOverlayImageRepeat_tablet || '';
											if (currentDevice === 'mobile')
												return attributes.bgOverlayImageRepeat_mobile || '';
											return attributes.bgOverlayImageRepeat || '';
										})()}
										options={[
											{ label: __('Default', 'voxel-fse'), value: '' },
											{ label: __('No-repeat', 'voxel-fse'), value: 'no-repeat' },
											{ label: __('Repeat', 'voxel-fse'), value: 'repeat' },
											{ label: __('Repeat-x', 'voxel-fse'), value: 'repeat-x' },
											{ label: __('Repeat-y', 'voxel-fse'), value: 'repeat-y' },
										]}
										onChange={(value: string) => {
											if (isHover) {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImageRepeatHover_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImageRepeatHover_mobile: value });
												} else {
													setAttributes({ bgOverlayImageRepeatHover: value });
												}
											} else {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImageRepeat_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImageRepeat_mobile: value });
												} else {
													setAttributes({ bgOverlayImageRepeat: value });
												}
											}
										}}
										__nextHasNoMarginBottom
									/>
								</div>

								{/* Size (responsive) */}
								<div style={{ marginTop: '16px' }}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											marginBottom: '8px',
										}}
									>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>
											{__('Size', 'voxel-fse')}
										</span>
										<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
									</div>
									<SelectControl
										value={(() => {
											if (isHover) {
												if (currentDevice === 'tablet')
													return attributes.bgOverlayImageSizeHover_tablet || '';
												if (currentDevice === 'mobile')
													return attributes.bgOverlayImageSizeHover_mobile || '';
												return attributes.bgOverlayImageSizeHover || '';
											}
											if (currentDevice === 'tablet')
												return attributes.bgOverlayImageSize_tablet || '';
											if (currentDevice === 'mobile')
												return attributes.bgOverlayImageSize_mobile || '';
											return attributes.bgOverlayImageSize || '';
										})()}
										options={[
											{ label: __('Default', 'voxel-fse'), value: '' },
											{ label: __('Auto', 'voxel-fse'), value: 'auto' },
											{ label: __('Cover', 'voxel-fse'), value: 'cover' },
											{ label: __('Contain', 'voxel-fse'), value: 'contain' },
										]}
										onChange={(value: string) => {
											if (isHover) {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImageSizeHover_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImageSizeHover_mobile: value });
												} else {
													setAttributes({ bgOverlayImageSizeHover: value });
												}
											} else {
												if (currentDevice === 'tablet') {
													setAttributes({ bgOverlayImageSize_tablet: value });
												} else if (currentDevice === 'mobile') {
													setAttributes({ bgOverlayImageSize_mobile: value });
												} else {
													setAttributes({ bgOverlayImageSize: value });
												}
											}
										}}
										__nextHasNoMarginBottom
									/>
								</div>
							</>
						)}

						{/* Opacity slider */}
						<div style={{ marginTop: '16px' }}>
							<RangeControl
								label={__('Opacity', 'voxel-fse')}
								value={
									isHover
										? (attributes.bgOverlayOpacityHover ?? 0.5)
										: (attributes.bgOverlayOpacity ?? 0.5)
								}
								onChange={(value: number | undefined) => {
									if (isHover) {
										setAttributes({ bgOverlayOpacityHover: value });
									} else {
										setAttributes({ bgOverlayOpacity: value });
									}
								}}
								min={0}
								max={1}
								step={0.01}
							/>
						</div>
					</>
				)}

				{/* === GRADIENT MODE === */}
				{bgType === 'gradient' && (
					<>
						{/* First Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={
								isHover
									? attributes.bgOverlayGradientColorHover
									: attributes.bgOverlayGradientColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayGradientColorHover: value });
								} else {
									setAttributes({ bgOverlayGradientColor: value });
								}
							}}
						/>

						{/* First Location */}
						<ResponsiveRangeControl
							label={__('Location', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName={
								isHover ? 'bgOverlayGradientLocationHover' : 'bgOverlayGradientLocation'
							}
							min={0}
							max={100}
							availableUnits={['%']}
						/>

						{/* Second Color */}
						<ColorPickerControl
							label={__('Second Color', 'voxel-fse')}
							value={
								isHover
									? attributes.bgOverlayGradientSecondColorHover
									: attributes.bgOverlayGradientSecondColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ bgOverlayGradientSecondColorHover: value });
								} else {
									setAttributes({ bgOverlayGradientSecondColor: value });
								}
							}}
						/>

						{/* Second Location */}
						<ResponsiveRangeControl
							label={__('Location', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName={
								isHover
									? 'bgOverlayGradientSecondLocationHover'
									: 'bgOverlayGradientSecondLocation'
							}
							min={0}
							max={100}
							availableUnits={['%']}
						/>

						{/* Type */}
						<SelectControl
							label={__('Type', 'voxel-fse')}
							value={currentGradientType || 'linear'}
							options={[
								{ label: __('Linear', 'voxel-fse'), value: 'linear' },
								{ label: __('Radial', 'voxel-fse'), value: 'radial' },
							]}
							onChange={(value: string) => {
								if (isHover) {
									setAttributes({ bgOverlayGradientTypeHover: value });
								} else {
									setAttributes({ bgOverlayGradientType: value });
								}
							}}
							__nextHasNoMarginBottom
						/>

						{/* Angle (for Linear) */}
						{(currentGradientType === 'linear' || !currentGradientType) && (
							<ResponsiveRangeControl
								label={__('Angle', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={
									isHover ? 'bgOverlayGradientAngleHover' : 'bgOverlayGradientAngle'
								}
								min={0}
								max={360}
								availableUnits={['deg']}
							/>
						)}

						{/* Position (for Radial) */}
						{currentGradientType === 'radial' && (
							<div style={{ marginTop: '16px' }}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										marginBottom: '8px',
									}}
								>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>
										{__('Position', 'voxel-fse')}
									</span>
									<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
								</div>
								<SelectControl
									value={(() => {
										if (isHover) {
											if (currentDevice === 'tablet')
												return attributes.bgOverlayGradientPositionHover_tablet || 'center center';
											if (currentDevice === 'mobile')
												return attributes.bgOverlayGradientPositionHover_mobile || 'center center';
											return attributes.bgOverlayGradientPositionHover || 'center center';
										}
										if (currentDevice === 'tablet')
											return attributes.bgOverlayGradientPosition_tablet || 'center center';
										if (currentDevice === 'mobile')
											return attributes.bgOverlayGradientPosition_mobile || 'center center';
										return attributes.bgOverlayGradientPosition || 'center center';
									})()}
									options={[
										{ label: __('Center Center', 'voxel-fse'), value: 'center center' },
										{ label: __('Center Left', 'voxel-fse'), value: 'center left' },
										{ label: __('Center Right', 'voxel-fse'), value: 'center right' },
										{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
										{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
										{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
										{ label: __('Bottom Center', 'voxel-fse'), value: 'bottom center' },
										{ label: __('Bottom Left', 'voxel-fse'), value: 'bottom left' },
										{ label: __('Bottom Right', 'voxel-fse'), value: 'bottom right' },
									]}
									onChange={(value: string) => {
										if (isHover) {
											if (currentDevice === 'tablet') {
												setAttributes({ bgOverlayGradientPositionHover_tablet: value });
											} else if (currentDevice === 'mobile') {
												setAttributes({ bgOverlayGradientPositionHover_mobile: value });
											} else {
												setAttributes({ bgOverlayGradientPositionHover: value });
											}
										} else {
											if (currentDevice === 'tablet') {
												setAttributes({ bgOverlayGradientPosition_tablet: value });
											} else if (currentDevice === 'mobile') {
												setAttributes({ bgOverlayGradientPosition_mobile: value });
											} else {
												setAttributes({ bgOverlayGradientPosition: value });
											}
										}
									}}
									__nextHasNoMarginBottom
								/>
							</div>
						)}

						{/* Opacity slider for gradient */}
						<div style={{ marginTop: '16px' }}>
							<RangeControl
								label={__('Opacity', 'voxel-fse')}
								value={
									isHover
										? (attributes.bgOverlayOpacityHover ?? 0.5)
										: (attributes.bgOverlayOpacity ?? 0.5)
								}
								onChange={(value: number | undefined) => {
									if (isHover) {
										setAttributes({ bgOverlayOpacityHover: value });
									} else {
										setAttributes({ bgOverlayOpacity: value });
									}
								}}
								min={0}
								max={1}
								step={0.01}
							/>
						</div>
					</>
				)}

				{/* Transition Duration - Only show in Hover tab */}
				{isHover && (
					<div style={{ marginTop: '16px' }}>
						<RangeControl
							label={__('Transition Duration (s)', 'voxel-fse')}
							value={attributes.bgOverlayTransitionDuration ?? 0.3}
							onChange={(value: number | undefined) =>
								setAttributes({ bgOverlayTransitionDuration: value ?? 0.3 })
							}
							min={0}
							max={3}
							step={0.1}
						/>
					</div>
				)}

				{/* CSS Filters - Only show in Hover tab */}
				{isHover && (
					<div style={{ marginTop: '16px' }}>
						<CssFiltersPopup
							label={__('CSS Filters', 'voxel-fse')}
							value={attributes.bgOverlayCssFiltersHover || {}}
							onChange={(value) => {
								setAttributes({ bgOverlayCssFiltersHover: value });
							}}
						/>
					</div>
				)}
			</>
		);
	};

	// Render with Normal/Hover tabs
	return (
		<div className="voxel-fse-background-overlay-control">
			<StateTabPanel
				attributeName="bgOverlayActiveTab"
				attributes={attributes}
				setAttributes={setAttributes}
				tabs={[
					{ name: 'normal', title: __('Normal', 'voxel-fse') },
					{ name: 'hover', title: __('Hover', 'voxel-fse') },
				]}
			>
				{(tab) => renderStateContent(tab.name === 'hover')}
			</StateTabPanel>
		</div>
	);
}
