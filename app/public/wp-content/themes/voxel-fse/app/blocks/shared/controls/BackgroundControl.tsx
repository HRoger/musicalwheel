/**
 * Background Control Component
 *
 * Comprehensive background control matching Elementor's Group_Control_Background.
 * Supports Classic (Color + Image), Gradient, Video, and Slideshow modes with Normal/Hover states.
 *
 * Features:
 * - Background type selector (Classic/Gradient/Video/Slideshow)
 * - Color picker for solid backgrounds
 * - Image upload with responsive support
 * - Image sub-controls (position, attachment, repeat, size)
 * - Gradient controls (2 colors, locations, type, angle/position)
 * - Video background (YouTube/Vimeo/mp4 with start/end time, play options)
 * - Slideshow background (gallery with transitions, Ken Burns effect)
 * - Normal/Hover state tabs
 * - Transition duration for hover effects
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import {
	SelectControl,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import StateTabPanel from './StateTabPanel';
import ChooseControl from './ChooseControl';
import ColorPickerControl from './ColorPickerControl';
import ImageUploadControl, { ImageUploadValue } from './ImageUploadControl';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import GalleryUploadControl from './GalleryUploadControl';
import { getImageSizeOptions } from './image-options';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface BackgroundControlAttributes {
	// Tab state
	backgroundActiveTab?: string;

	// Background Type (Normal/Hover) - 'classic' | 'gradient'
	backgroundType?: string;
	backgroundTypeHover?: string;

	// Background Color (Normal/Hover)
	backgroundColor?: string;
	backgroundColorHover?: string;

	// Background Image (Normal, responsive)
	backgroundImage?: ImageUploadValue;
	backgroundImage_tablet?: ImageUploadValue;
	backgroundImage_mobile?: ImageUploadValue;

	// Background Image (Hover, responsive)
	backgroundImageHover?: ImageUploadValue;
	backgroundImageHover_tablet?: ImageUploadValue;
	backgroundImageHover_mobile?: ImageUploadValue;

	// Image Resolution (Normal/Hover)
	bgImageResolution?: string;
	bgImageResolutionHover?: string;

	// Image Position (Normal/Hover, responsive)
	bgImagePosition?: string;
	bgImagePosition_tablet?: string;
	bgImagePosition_mobile?: string;
	bgImagePositionHover?: string;
	bgImagePositionHover_tablet?: string;
	bgImagePositionHover_mobile?: string;

	// Image Attachment (Normal/Hover)
	bgImageAttachment?: string;
	bgImageAttachmentHover?: string;

	// Image Repeat (Normal/Hover, responsive)
	bgImageRepeat?: string;
	bgImageRepeat_tablet?: string;
	bgImageRepeat_mobile?: string;
	bgImageRepeatHover?: string;
	bgImageRepeatHover_tablet?: string;
	bgImageRepeatHover_mobile?: string;

	// Image Size (Normal/Hover, responsive)
	bgImageSize?: string;
	bgImageSize_tablet?: string;
	bgImageSize_mobile?: string;
	bgImageSizeHover?: string;
	bgImageSizeHover_tablet?: string;
	bgImageSizeHover_mobile?: string;

	// Image Custom Width (Normal/Hover, responsive)
	bgImageCustomWidth?: number;
	bgImageCustomWidth_tablet?: number;
	bgImageCustomWidth_mobile?: number;
	bgImageCustomWidthUnit?: string;
	bgImageCustomWidthHover?: number;
	bgImageCustomWidthHover_tablet?: number;
	bgImageCustomWidthHover_mobile?: number;
	bgImageCustomWidthHoverUnit?: string;

	// Dynamic Image Tags (Normal/Hover)
	bgImageDynamicTag?: string;
	bgImageDynamicTagHover?: string;

	// Gradient Color (Normal/Hover)
	gradientColor?: string;
	gradientColorHover?: string;

	// Gradient Location (Normal/Hover, responsive)
	gradientLocation?: number;
	gradientLocation_tablet?: number;
	gradientLocation_mobile?: number;
	gradientLocationHover?: number;
	gradientLocationHover_tablet?: number;
	gradientLocationHover_mobile?: number;

	// Gradient Second Color (Normal/Hover)
	gradientSecondColor?: string;
	gradientSecondColorHover?: string;

	// Gradient Second Location (Normal/Hover, responsive)
	gradientSecondLocation?: number;
	gradientSecondLocation_tablet?: number;
	gradientSecondLocation_mobile?: number;
	gradientSecondLocationHover?: number;
	gradientSecondLocationHover_tablet?: number;
	gradientSecondLocationHover_mobile?: number;

	// Gradient Type (Normal/Hover) - 'linear' | 'radial'
	gradientType?: string;
	gradientTypeHover?: string;

	// Gradient Angle (Linear, Normal/Hover, responsive)
	gradientAngle?: number;
	gradientAngle_tablet?: number;
	gradientAngle_mobile?: number;
	gradientAngleHover?: number;
	gradientAngleHover_tablet?: number;
	gradientAngleHover_mobile?: number;

	// Gradient Position (Radial, Normal/Hover, responsive)
	gradientPosition?: string;
	gradientPosition_tablet?: string;
	gradientPosition_mobile?: string;
	gradientPositionHover?: string;
	gradientPositionHover_tablet?: string;
	gradientPositionHover_mobile?: string;

	// Background Transition Duration
	bgTransitionDuration?: number;

	// === VIDEO BACKGROUND ===
	// Video Link (YouTube/Vimeo/mp4 URL)
	bgVideoLink?: string;
	// Video Start Time (seconds)
	bgVideoStartTime?: number;
	// Video End Time (seconds)
	bgVideoEndTime?: number;
	// Play Once
	bgVideoPlayOnce?: boolean;
	// Play On Mobile
	bgVideoPlayOnMobile?: boolean;
	// Privacy Mode (YouTube no-cookie)
	bgVideoPrivacyMode?: boolean;
	// Video Fallback Image
	bgVideoFallback?: ImageUploadValue;

	// === SLIDESHOW BACKGROUND ===
	// Gallery images
	bgSlideshowGallery?: ImageUploadValue[];
	// Infinite Loop
	bgSlideshowInfiniteLoop?: boolean;
	// Duration (ms)
	bgSlideshowDuration?: number;
	// Transition type
	bgSlideshowTransition?: string;
	// Transition Duration (ms)
	bgSlideshowTransitionDuration?: number;
	// Background Size (responsive)
	bgSlideshowSize?: string;
	bgSlideshowSize_tablet?: string;
	bgSlideshowSize_mobile?: string;
	// Background Position (responsive)
	bgSlideshowPosition?: string;
	bgSlideshowPosition_tablet?: string;
	bgSlideshowPosition_mobile?: string;
	// Lazyload
	bgSlideshowLazyload?: boolean;
	// Ken Burns Effect
	bgSlideshowKenBurns?: boolean;
	// Ken Burns Direction (in/out)
	bgSlideshowKenBurnsDirection?: string;

	// Allow indexing for dynamic attribute access
	[key: string]: any;
}

export interface BackgroundControlProps {
	/** Block attributes containing background settings */
	attributes: BackgroundControlAttributes;
	/** Function to update block attributes */
	setAttributes: (attrs: Partial<BackgroundControlAttributes>) => void;
	/** Show hover state tab (default: true) */
	showHoverState?: boolean;
	/** Show image controls in classic mode (default: true) */
	showImageControls?: boolean;
	/** Show gradient mode option (default: true) */
	showGradientMode?: boolean;
	/** Show video background option (default: false, flex-container only) */
	showVideoBackground?: boolean;
	/** Show slideshow/gallery background option (default: false, flex-container only) */
	showSlideshowBackground?: boolean;
	/** Custom label for the section */
	label?: string;
}

/**
 * Background attribute definitions for block.json
 * Use spread operator: ...backgroundControlAttributes
 */
export const backgroundControlAttributes = {
	// Tab state
	backgroundActiveTab: { type: 'string', default: 'normal' },

	// Background Type
	backgroundType: { type: 'string', default: 'classic' },
	backgroundTypeHover: { type: 'string', default: 'classic' },

	// Background Color
	backgroundColor: { type: 'string' },
	backgroundColorHover: { type: 'string' },

	// Background Image (responsive)
	backgroundImage: { type: 'object' },
	backgroundImage_tablet: { type: 'object' },
	backgroundImage_mobile: { type: 'object' },
	backgroundImageHover: { type: 'object' },
	backgroundImageHover_tablet: { type: 'object' },
	backgroundImageHover_mobile: { type: 'object' },

	// Image Resolution
	bgImageResolution: { type: 'string', default: 'full' },
	bgImageResolutionHover: { type: 'string', default: 'full' },

	// Image Position (responsive)
	bgImagePosition: { type: 'string' },
	bgImagePosition_tablet: { type: 'string' },
	bgImagePosition_mobile: { type: 'string' },
	bgImagePositionHover: { type: 'string' },
	bgImagePositionHover_tablet: { type: 'string' },
	bgImagePositionHover_mobile: { type: 'string' },

	// Image Attachment
	bgImageAttachment: { type: 'string' },
	bgImageAttachmentHover: { type: 'string' },

	// Image Repeat (responsive)
	bgImageRepeat: { type: 'string' },
	bgImageRepeat_tablet: { type: 'string' },
	bgImageRepeat_mobile: { type: 'string' },
	bgImageRepeatHover: { type: 'string' },
	bgImageRepeatHover_tablet: { type: 'string' },
	bgImageRepeatHover_mobile: { type: 'string' },

	// Image Size (responsive)
	bgImageSize: { type: 'string' },
	bgImageSize_tablet: { type: 'string' },
	bgImageSize_mobile: { type: 'string' },
	bgImageSizeHover: { type: 'string' },
	bgImageSizeHover_tablet: { type: 'string' },
	bgImageSizeHover_mobile: { type: 'string' },

	// Image Custom Width (responsive)
	bgImageCustomWidth: { type: 'number' },
	bgImageCustomWidth_tablet: { type: 'number' },
	bgImageCustomWidth_mobile: { type: 'number' },
	bgImageCustomWidthUnit: { type: 'string', default: '%' },
	bgImageCustomWidthHover: { type: 'number' },
	bgImageCustomWidthHover_tablet: { type: 'number' },
	bgImageCustomWidthHover_mobile: { type: 'number' },
	bgImageCustomWidthHoverUnit: { type: 'string', default: '%' },

	// Dynamic Image Tags
	bgImageDynamicTag: { type: 'string' },
	bgImageDynamicTagHover: { type: 'string' },

	// Gradient Color
	gradientColor: { type: 'string' },
	gradientColorHover: { type: 'string' },

	// Gradient Location (responsive)
	gradientLocation: { type: 'number', default: 0 },
	gradientLocation_tablet: { type: 'number' },
	gradientLocation_mobile: { type: 'number' },
	gradientLocationHover: { type: 'number', default: 0 },
	gradientLocationHover_tablet: { type: 'number' },
	gradientLocationHover_mobile: { type: 'number' },

	// Gradient Second Color
	gradientSecondColor: { type: 'string' },
	gradientSecondColorHover: { type: 'string' },

	// Gradient Second Location (responsive)
	gradientSecondLocation: { type: 'number', default: 100 },
	gradientSecondLocation_tablet: { type: 'number' },
	gradientSecondLocation_mobile: { type: 'number' },
	gradientSecondLocationHover: { type: 'number', default: 100 },
	gradientSecondLocationHover_tablet: { type: 'number' },
	gradientSecondLocationHover_mobile: { type: 'number' },

	// Gradient Type
	gradientType: { type: 'string', default: 'linear' },
	gradientTypeHover: { type: 'string', default: 'linear' },

	// Gradient Angle (responsive)
	gradientAngle: { type: 'number', default: 180 },
	gradientAngle_tablet: { type: 'number' },
	gradientAngle_mobile: { type: 'number' },
	gradientAngleHover: { type: 'number', default: 180 },
	gradientAngleHover_tablet: { type: 'number' },
	gradientAngleHover_mobile: { type: 'number' },

	// Gradient Position (responsive)
	gradientPosition: { type: 'string', default: 'center center' },
	gradientPosition_tablet: { type: 'string' },
	gradientPosition_mobile: { type: 'string' },
	gradientPositionHover: { type: 'string', default: 'center center' },
	gradientPositionHover_tablet: { type: 'string' },
	gradientPositionHover_mobile: { type: 'string' },

	// Transition Duration
	bgTransitionDuration: { type: 'number', default: 0.3 },
};

/**
 * Extended background attribute definitions for Video and Slideshow
 * Use spread operator for flex-container: ...extendedBackgroundControlAttributes
 */
export const extendedBackgroundControlAttributes = {
	// === VIDEO BACKGROUND ===
	bgVideoLink: { type: 'string' },
	bgVideoStartTime: { type: 'number' },
	bgVideoEndTime: { type: 'number' },
	bgVideoPlayOnce: { type: 'boolean', default: false },
	bgVideoPlayOnMobile: { type: 'boolean', default: false },
	bgVideoPrivacyMode: { type: 'boolean', default: false },
	bgVideoFallback: { type: 'object' },

	// === SLIDESHOW BACKGROUND ===
	bgSlideshowGallery: { type: 'array', default: [] },
	bgSlideshowInfiniteLoop: { type: 'boolean', default: true },
	bgSlideshowDuration: { type: 'number', default: 5000 },
	bgSlideshowTransition: { type: 'string', default: 'fade' },
	bgSlideshowTransitionDuration: { type: 'number', default: 500 },
	bgSlideshowSize: { type: 'string' },
	bgSlideshowSize_tablet: { type: 'string' },
	bgSlideshowSize_mobile: { type: 'string' },
	bgSlideshowPosition: { type: 'string' },
	bgSlideshowPosition_tablet: { type: 'string' },
	bgSlideshowPosition_mobile: { type: 'string' },
	bgSlideshowLazyload: { type: 'boolean', default: false },
	bgSlideshowKenBurns: { type: 'boolean', default: false },
	bgSlideshowKenBurnsDirection: { type: 'string', default: 'in' },
};

/**
 * BackgroundControl - Comprehensive background control matching Elementor
 *
 * @example
 * // Basic usage with all features
 * <BackgroundControl
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 * />
 *
 * @example
 * // Simple mode - color only, no hover
 * <BackgroundControl
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 *   showHoverState={false}
 *   showImageControls={false}
 *   showGradientMode={false}
 * />
 */
export default function BackgroundControl({
	attributes,
	setAttributes,
	showHoverState = true,
	showImageControls = true,
	showGradientMode = true,
	showVideoBackground = false,
	showSlideshowBackground = false,
}: BackgroundControlProps) {
	// Get WordPress's current device type
	const wpDeviceType = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
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
		},
		[]
	);

	const wpDevice = wpDeviceType
		? (wpDeviceType.toLowerCase() as DeviceType)
		: 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	// Sync with WordPress device type
	useEffect(() => {
		setCurrentDevice(wpDevice);
	}, [wpDevice]);

	// Fetch media details for normal background image (for resolution selection)
	const normalImageMedia = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
			const imageId = attributes.backgroundImage?.id;
			return imageId ? (select('core') as any).getMedia(imageId) : null;
		},
		[attributes.backgroundImage?.id]
	);

	// Fetch media details for hover background image (for resolution selection)
	const hoverImageMedia = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
			const imageId = attributes.backgroundImageHover?.id;
			return imageId ? (select('core') as any).getMedia(imageId) : null;
		},
		[attributes.backgroundImageHover?.id]
	);

	// Render content for a single state (normal or hover)
	const renderStateContent = (isHover: boolean) => {
		const bgType = isHover
			? attributes.backgroundTypeHover
			: attributes.backgroundType;
		const currentImage = isHover
			? attributes.backgroundImageHover
			: attributes.backgroundImage;
		const currentGradientType = isHover
			? attributes.gradientTypeHover
			: attributes.gradientType;
		const currentDynamicTag = isHover
			? attributes.bgImageDynamicTagHover
			: attributes.bgImageDynamicTag;
		const hasDynamicImage = typeof currentDynamicTag === 'string' &&
			currentDynamicTag.startsWith('@tags()') &&
			currentDynamicTag.includes('@endtags()');

		// Build background type options dynamically
		const bgTypeOptions = [
			{
				value: 'classic',
				icon: 'eicon-paint-brush',
				title: __('Classic', 'voxel-fse'),
			},
			...(showGradientMode
				? [
					{
						value: 'gradient',
						icon: 'eicon-barcode',
						title: __('Gradient', 'voxel-fse'),
					},
				]
				: []),
			...(showVideoBackground && !isHover
				? [
					{
						value: 'video',
						icon: 'eicon-video-camera',
						title: __('Video', 'voxel-fse'),
					},
				]
				: []),
			...(showSlideshowBackground && !isHover
				? [
					{
						value: 'slideshow',
						icon: 'eicon-slideshow',
						title: __('Slideshow', 'voxel-fse'),
					},
				]
				: []),
		];

		return (
			<>
				{/* Background Type Toggle */}
				{bgTypeOptions.length > 1 && (
					<ChooseControl
						label={__('Background Type', 'voxel-fse')}
						value={bgType || 'classic'}
						onChange={(value) => {
							if (isHover) {
								setAttributes({ backgroundTypeHover: value });
							} else {
								setAttributes({ backgroundType: value });
							}
						}}
						options={bgTypeOptions}
						variant="inline"
					/>
				)}

				{/* === CLASSIC MODE === */}
				{(bgType === 'classic' || !bgType || !showGradientMode) && (
					<>
						{/* Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={
								isHover
									? attributes.backgroundColorHover
									: attributes.backgroundColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ backgroundColorHover: value });
								} else {
									setAttributes({ backgroundColor: value });
								}
							}}
						/>

						{/* Image */}
						{showImageControls && (
							<>
								<ImageUploadControl
									label={__('Image', 'voxel-fse')}
									value={
										isHover
											? attributes.backgroundImageHover
											: attributes.backgroundImage
									}
									valueTablet={
										isHover
											? attributes.backgroundImageHover_tablet
											: attributes.backgroundImage_tablet
									}
									valueMobile={
										isHover
											? attributes.backgroundImageHover_mobile
											: attributes.backgroundImage_mobile
									}
									onChange={(value) => {
										if (isHover) {
											setAttributes({ backgroundImageHover: value });
										} else {
											setAttributes({ backgroundImage: value });
										}
									}}
									onChangeTablet={(value) => {
										if (isHover) {
											setAttributes({ backgroundImageHover_tablet: value });
										} else {
											setAttributes({ backgroundImage_tablet: value });
										}
									}}
									onChangeMobile={(value) => {
										if (isHover) {
											setAttributes({ backgroundImageHover_mobile: value });
										} else {
											setAttributes({ backgroundImage_mobile: value });
										}
									}}
									responsive
									enableDynamicTags
									dynamicTagValue={
										isHover
											? attributes.bgImageDynamicTagHover
											: attributes.bgImageDynamicTag
									}
									onDynamicTagChange={(value) => {
										if (isHover) {
											setAttributes({ bgImageDynamicTagHover: value });
										} else {
											setAttributes({ bgImageDynamicTag: value });
										}
									}}
								/>

								{/* Image sub-controls - show when image is set OR dynamic tags are active */}
								{(currentImage?.url || hasDynamicImage) && (
									<>
										{/* Image Resolution */}
										<SelectControl
											label={__('Image Resolution', 'voxel-fse')}
											value={
												isHover
													? attributes.bgImageResolutionHover
													: attributes.bgImageResolution
											}
											options={getImageSizeOptions()}
											onChange={(value: string) => {
												console.log('[BackgroundControl] Image Resolution onChange:', { value, isHover });

												// Get the appropriate media object for this state
												const media = isHover ? hoverImageMedia : normalImageMedia;
												const currentImg = isHover ? attributes.backgroundImageHover : attributes.backgroundImage;

												// Build updates
												const updates: Partial<BackgroundControlAttributes> = {};

												// Set the resolution attribute
												if (isHover) {
													updates.bgImageResolutionHover = value;
												} else {
													updates.bgImageResolution = value;
												}

												// Update the image URL if media details are available
												if (media && media.media_details && media.media_details.sizes) {
													let newUrl: string | undefined;

													if (media.media_details.sizes[value]) {
														newUrl = media.media_details.sizes[value].source_url;
													} else if (value === 'full' && media.source_url) {
														newUrl = media.source_url;
													}

													if (newUrl) {
														if (isHover) {
															updates.backgroundImageHover = {
																...currentImg,
																url: newUrl,
															};
														} else {
															updates.backgroundImage = {
																...currentImg,
																url: newUrl,
															};
														}
														console.log('[BackgroundControl] Updated image URL to:', newUrl);
													}
												}

												setAttributes(updates);

											}}
											help={__(
												"Image size settings don't apply to Dynamic Images.",
												'voxel-fse'
											)}
											__nextHasNoMarginBottom
										/>

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
															return attributes.bgImagePositionHover_tablet || '';
														if (currentDevice === 'mobile')
															return attributes.bgImagePositionHover_mobile || '';
														return attributes.bgImagePositionHover || '';
													}
													if (currentDevice === 'tablet')
														return attributes.bgImagePosition_tablet || '';
													if (currentDevice === 'mobile')
														return attributes.bgImagePosition_mobile || '';
													return attributes.bgImagePosition || '';
												})()}
												options={[
													{ label: __('Default', 'voxel-fse'), value: '' },
													{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
													{
														label: __('Top Center', 'voxel-fse'),
														value: 'top center',
													},
													{
														label: __('Top Right', 'voxel-fse'),
														value: 'top right',
													},
													{
														label: __('Center Left', 'voxel-fse'),
														value: 'center left',
													},
													{
														label: __('Center Center', 'voxel-fse'),
														value: 'center center',
													},
													{
														label: __('Center Right', 'voxel-fse'),
														value: 'center right',
													},
													{
														label: __('Bottom Left', 'voxel-fse'),
														value: 'bottom left',
													},
													{
														label: __('Bottom Center', 'voxel-fse'),
														value: 'bottom center',
													},
													{
														label: __('Bottom Right', 'voxel-fse'),
														value: 'bottom right',
													},
												]}
												onChange={(value: string) => {
													if (isHover) {
														if (currentDevice === 'tablet') {
															setAttributes({
																bgImagePositionHover_tablet: value,
															});
														} else if (currentDevice === 'mobile') {
															setAttributes({
																bgImagePositionHover_mobile: value,
															});
														} else {
															setAttributes({ bgImagePositionHover: value });
														}
													} else {
														if (currentDevice === 'tablet') {
															setAttributes({ bgImagePosition_tablet: value });
														} else if (currentDevice === 'mobile') {
															setAttributes({ bgImagePosition_mobile: value });
														} else {
															setAttributes({ bgImagePosition: value });
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
														? attributes.bgImageAttachmentHover
														: attributes.bgImageAttachment
												}
												options={[
													{ label: __('Default', 'voxel-fse'), value: '' },
													{ label: __('Scroll', 'voxel-fse'), value: 'scroll' },
													{ label: __('Fixed', 'voxel-fse'), value: 'fixed' },
												]}
												onChange={(value: string) => {
													if (isHover) {
														setAttributes({ bgImageAttachmentHover: value });
													} else {
														setAttributes({ bgImageAttachment: value });
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
															return attributes.bgImageRepeatHover_tablet || '';
														if (currentDevice === 'mobile')
															return attributes.bgImageRepeatHover_mobile || '';
														return attributes.bgImageRepeatHover || '';
													}
													if (currentDevice === 'tablet')
														return attributes.bgImageRepeat_tablet || '';
													if (currentDevice === 'mobile')
														return attributes.bgImageRepeat_mobile || '';
													return attributes.bgImageRepeat || '';
												})()}
												options={[
													{ label: __('Default', 'voxel-fse'), value: '' },
													{
														label: __('No-repeat', 'voxel-fse'),
														value: 'no-repeat',
													},
													{ label: __('Repeat', 'voxel-fse'), value: 'repeat' },
													{
														label: __('Repeat-x', 'voxel-fse'),
														value: 'repeat-x',
													},
													{
														label: __('Repeat-y', 'voxel-fse'),
														value: 'repeat-y',
													},
												]}
												onChange={(value: string) => {
													if (isHover) {
														if (currentDevice === 'tablet') {
															setAttributes({ bgImageRepeatHover_tablet: value });
														} else if (currentDevice === 'mobile') {
															setAttributes({ bgImageRepeatHover_mobile: value });
														} else {
															setAttributes({ bgImageRepeatHover: value });
														}
													} else {
														if (currentDevice === 'tablet') {
															setAttributes({ bgImageRepeat_tablet: value });
														} else if (currentDevice === 'mobile') {
															setAttributes({ bgImageRepeat_mobile: value });
														} else {
															setAttributes({ bgImageRepeat: value });
														}
													}
												}}
												__nextHasNoMarginBottom
											/>
										</div>

										{/* Display Size (responsive) */}
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
													{__('Display Size', 'voxel-fse')}
												</span>
												<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
											</div>
											<SelectControl
												value={(() => {
													if (isHover) {
														if (currentDevice === 'tablet')
															return attributes.bgImageSizeHover_tablet || '';
														if (currentDevice === 'mobile')
															return attributes.bgImageSizeHover_mobile || '';
														return attributes.bgImageSizeHover || '';
													}
													if (currentDevice === 'tablet')
														return attributes.bgImageSize_tablet || '';
													if (currentDevice === 'mobile')
														return attributes.bgImageSize_mobile || '';
													return attributes.bgImageSize || '';
												})()}
												options={[
													{ label: __('Default', 'voxel-fse'), value: '' },
													{ label: __('Auto', 'voxel-fse'), value: 'auto' },
													{ label: __('Cover', 'voxel-fse'), value: 'cover' },
													{ label: __('Contain', 'voxel-fse'), value: 'contain' },
													{ label: __('Custom', 'voxel-fse'), value: 'custom' },
												]}
												onChange={(value: string) => {
													if (isHover) {
														if (currentDevice === 'tablet') {
															setAttributes({ bgImageSizeHover_tablet: value });
														} else if (currentDevice === 'mobile') {
															setAttributes({ bgImageSizeHover_mobile: value });
														} else {
															setAttributes({ bgImageSizeHover: value });
														}
													} else {
														if (currentDevice === 'tablet') {
															setAttributes({ bgImageSize_tablet: value });
														} else if (currentDevice === 'mobile') {
															setAttributes({ bgImageSize_mobile: value });
														} else {
															setAttributes({ bgImageSize: value });
														}
													}
												}}
												__nextHasNoMarginBottom
											/>
										</div>

										{/* Custom Width - show when Display Size = custom */}
										{(() => {
											const currentSize = (() => {
												if (isHover) {
													if (currentDevice === 'tablet')
														return attributes.bgImageSizeHover_tablet;
													if (currentDevice === 'mobile')
														return attributes.bgImageSizeHover_mobile;
													return attributes.bgImageSizeHover;
												}
												if (currentDevice === 'tablet')
													return attributes.bgImageSize_tablet;
												if (currentDevice === 'mobile')
													return attributes.bgImageSize_mobile;
												return attributes.bgImageSize;
											})();
											if (currentSize === 'custom') {
												return (
													<ResponsiveRangeControl
														label={__('Width', 'voxel-fse')}
														attributes={attributes}
														setAttributes={setAttributes}
														attributeBaseName={
															isHover
																? 'bgImageCustomWidthHover'
																: 'bgImageCustomWidth'
														}
														min={0}
														max={200}
														availableUnits={['%', 'px', 'em', 'vw']}
														unitAttributeName={
															isHover
																? 'bgImageCustomWidthHoverUnit'
																: 'bgImageCustomWidthUnit'
														}
													/>
												);
											}
											return null;
										})()}
									</>
								)}
							</>
						)}
					</>
				)}

				{/* === GRADIENT MODE === */}
				{bgType === 'gradient' && showGradientMode && (
					<>
						{/* Gradient Info Box */}
						<div
							style={{
								padding: '12px',
								backgroundColor: '#fffbeb',
								borderLeft: '4px solid #f59e0b',
								marginBottom: '16px',
								fontSize: '12px',
								fontStyle: 'italic',
								color: '#92400e',
							}}
						>
							{__(
								'Set locations and angle for each breakpoint to ensure the gradient adapts to different screen sizes.',
								'voxel-fse'
							)}
						</div>

						{/* First Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={
								isHover
									? attributes.gradientColorHover
									: attributes.gradientColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ gradientColorHover: value });
								} else {
									setAttributes({ gradientColor: value });
								}
							}}
						/>

						{/* First Location */}
						<ResponsiveRangeControl
							label={__('Location', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName={
								isHover ? 'gradientLocationHover' : 'gradientLocation'
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
									? attributes.gradientSecondColorHover
									: attributes.gradientSecondColor
							}
							onChange={(value) => {
								if (isHover) {
									setAttributes({ gradientSecondColorHover: value });
								} else {
									setAttributes({ gradientSecondColor: value });
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
									? 'gradientSecondLocationHover'
									: 'gradientSecondLocation'
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
									setAttributes({ gradientTypeHover: value });
								} else {
									setAttributes({ gradientType: value });
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
									isHover ? 'gradientAngleHover' : 'gradientAngle'
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
												return (
													attributes.gradientPositionHover_tablet ||
													'center center'
												);
											if (currentDevice === 'mobile')
												return (
													attributes.gradientPositionHover_mobile ||
													'center center'
												);
											return (
												attributes.gradientPositionHover || 'center center'
											);
										}
										if (currentDevice === 'tablet')
											return (
												attributes.gradientPosition_tablet || 'center center'
											);
										if (currentDevice === 'mobile')
											return (
												attributes.gradientPosition_mobile || 'center center'
											);
										return attributes.gradientPosition || 'center center';
									})()}
									options={[
										{
											label: __('Center Center', 'voxel-fse'),
											value: 'center center',
										},
										{
											label: __('Center Left', 'voxel-fse'),
											value: 'center left',
										},
										{
											label: __('Center Right', 'voxel-fse'),
											value: 'center right',
										},
										{
											label: __('Top Center', 'voxel-fse'),
											value: 'top center',
										},
										{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
										{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
										{
											label: __('Bottom Center', 'voxel-fse'),
											value: 'bottom center',
										},
										{
											label: __('Bottom Left', 'voxel-fse'),
											value: 'bottom left',
										},
										{
											label: __('Bottom Right', 'voxel-fse'),
											value: 'bottom right',
										},
									]}
									onChange={(value: string) => {
										if (isHover) {
											if (currentDevice === 'tablet') {
												setAttributes({ gradientPositionHover_tablet: value });
											} else if (currentDevice === 'mobile') {
												setAttributes({ gradientPositionHover_mobile: value });
											} else {
												setAttributes({ gradientPositionHover: value });
											}
										} else {
											if (currentDevice === 'tablet') {
												setAttributes({ gradientPosition_tablet: value });
											} else if (currentDevice === 'mobile') {
												setAttributes({ gradientPosition_mobile: value });
											} else {
												setAttributes({ gradientPosition: value });
											}
										}
									}}
									__nextHasNoMarginBottom
								/>
							</div>
						)}
					</>
				)}

				{/* === VIDEO MODE === */}
				{bgType === 'video' && showVideoBackground && !isHover && (
					<>
						{/* Color */}
						<ColorPickerControl
							label={__('Color', 'voxel-fse')}
							value={attributes.backgroundColor}
							onChange={(value) => {
								setAttributes({ backgroundColor: value });
							}}
						/>

						{/* Video Link */}
						<TextControl
							label={__('Video Link', 'voxel-fse')}
							value={attributes.bgVideoLink || ''}
							onChange={(value: string) =>
								setAttributes({ bgVideoLink: value })
							}
							help={__(
								'YouTube/Vimeo link, or link to video file (mp4 is recommended).',
								'voxel-fse'
							)}
							__nextHasNoMarginBottom
						/>

						{/* Start Time */}
						<div style={{ marginTop: '16px' }}>
							<TextControl
								label={__('Start Time', 'voxel-fse')}
								type="number"
								value={
									attributes.bgVideoStartTime !== undefined
										? String(attributes.bgVideoStartTime)
										: ''
								}
								onChange={(value: string) =>
									setAttributes({
										bgVideoStartTime: value ? Number(value) : undefined,
									})
								}
								help={__('Specify a start time (in seconds).', 'voxel-fse')}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* End Time */}
						<div style={{ marginTop: '16px' }}>
							<TextControl
								label={__('End Time', 'voxel-fse')}
								type="number"
								value={
									attributes.bgVideoEndTime !== undefined
										? String(attributes.bgVideoEndTime)
										: ''
								}
								onChange={(value: string) =>
									setAttributes({
										bgVideoEndTime: value ? Number(value) : undefined,
									})
								}
								help={__('Specify an end time (in seconds).', 'voxel-fse')}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Play Once */}
						<div style={{ marginTop: '16px' }}>
							<ToggleControl
								label={__('Play Once', 'voxel-fse')}
								checked={attributes.bgVideoPlayOnce || false}
								onChange={(value: boolean) =>
									setAttributes({ bgVideoPlayOnce: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Play On Mobile */}
						<div style={{ marginTop: '8px' }}>
							<ToggleControl
								label={__('Play On Mobile', 'voxel-fse')}
								checked={attributes.bgVideoPlayOnMobile || false}
								onChange={(value: boolean) =>
									setAttributes({ bgVideoPlayOnMobile: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Privacy Mode */}
						<div style={{ marginTop: '8px' }}>
							<ToggleControl
								label={__('Privacy Mode', 'voxel-fse')}
								checked={attributes.bgVideoPrivacyMode || false}
								onChange={(value: boolean) =>
									setAttributes({ bgVideoPrivacyMode: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Background Fallback */}
						<div style={{ marginTop: '16px' }}>
							<ImageUploadControl
								label={__('Background Fallback', 'voxel-fse')}
								value={attributes.bgVideoFallback}
								onChange={(value) =>
									setAttributes({ bgVideoFallback: value })
								}
								help={__(
									'This cover image will replace the background video in case that the video could not be loaded.',
									'voxel-fse'
								)}
							/>
						</div>
					</>
				)}

				{/* === SLIDESHOW MODE === */}
				{bgType === 'slideshow' && showSlideshowBackground && !isHover && (
					<>
						{/* Gallery */}
						<GalleryUploadControl
							label={__('Images', 'voxel-fse')}
							value={attributes.bgSlideshowGallery || []}
							onChange={(value) =>
								setAttributes({ bgSlideshowGallery: value })
							}
						/>

						{/* Infinite Loop */}
						<div style={{ marginTop: '16px' }}>
							<ToggleControl
								label={__('Infinite Loop', 'voxel-fse')}
								checked={attributes.bgSlideshowInfiniteLoop ?? true}
								onChange={(value: boolean) =>
									setAttributes({ bgSlideshowInfiniteLoop: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Duration */}
						<div style={{ marginTop: '16px' }}>
							<TextControl
								label={__('Duration (ms)', 'voxel-fse')}
								type="number"
								value={String(attributes.bgSlideshowDuration ?? 5000)}
								onChange={(value: string) =>
									setAttributes({
										bgSlideshowDuration: value ? Number(value) : 5000,
									})
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Transition */}
						<div style={{ marginTop: '16px' }}>
							<SelectControl
								label={__('Transition', 'voxel-fse')}
								value={attributes.bgSlideshowTransition || 'fade'}
								options={[
									{ label: __('Fade', 'voxel-fse'), value: 'fade' },
									{ label: __('Slide Right', 'voxel-fse'), value: 'slide_right' },
									{ label: __('Slide Left', 'voxel-fse'), value: 'slide_left' },
									{ label: __('Slide Up', 'voxel-fse'), value: 'slide_up' },
									{ label: __('Slide Down', 'voxel-fse'), value: 'slide_down' },
								]}
								onChange={(value: string) =>
									setAttributes({ bgSlideshowTransition: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Transition Duration */}
						<div style={{ marginTop: '16px' }}>
							<TextControl
								label={__('Transition Duration (ms)', 'voxel-fse')}
								type="number"
								value={String(attributes.bgSlideshowTransitionDuration ?? 500)}
								onChange={(value: string) =>
									setAttributes({
										bgSlideshowTransitionDuration: value ? Number(value) : 500,
									})
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Background Size (responsive) */}
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
									{__('Background Size', 'voxel-fse')}
								</span>
								<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
							</div>
							<SelectControl
								value={(() => {
									if (currentDevice === 'tablet')
										return attributes.bgSlideshowSize_tablet || '';
									if (currentDevice === 'mobile')
										return attributes.bgSlideshowSize_mobile || '';
									return attributes.bgSlideshowSize || '';
								})()}
								options={[
									{ label: __('Default', 'voxel-fse'), value: '' },
									{ label: __('Auto', 'voxel-fse'), value: 'auto' },
									{ label: __('Cover', 'voxel-fse'), value: 'cover' },
									{ label: __('Contain', 'voxel-fse'), value: 'contain' },
								]}
								onChange={(value: string) => {
									if (currentDevice === 'tablet') {
										setAttributes({ bgSlideshowSize_tablet: value });
									} else if (currentDevice === 'mobile') {
										setAttributes({ bgSlideshowSize_mobile: value });
									} else {
										setAttributes({ bgSlideshowSize: value });
									}
								}}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Background Position (responsive) */}
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
									{__('Background Position', 'voxel-fse')}
								</span>
								<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
							</div>
							<SelectControl
								value={(() => {
									if (currentDevice === 'tablet')
										return attributes.bgSlideshowPosition_tablet || '';
									if (currentDevice === 'mobile')
										return attributes.bgSlideshowPosition_mobile || '';
									return attributes.bgSlideshowPosition || '';
								})()}
								options={[
									{ label: __('Default', 'voxel-fse'), value: '' },
									{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
									{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
									{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
									{
										label: __('Center Left', 'voxel-fse'),
										value: 'center left',
									},
									{
										label: __('Center Center', 'voxel-fse'),
										value: 'center center',
									},
									{
										label: __('Center Right', 'voxel-fse'),
										value: 'center right',
									},
									{
										label: __('Bottom Left', 'voxel-fse'),
										value: 'bottom left',
									},
									{
										label: __('Bottom Center', 'voxel-fse'),
										value: 'bottom center',
									},
									{
										label: __('Bottom Right', 'voxel-fse'),
										value: 'bottom right',
									},
								]}
								onChange={(value: string) => {
									if (currentDevice === 'tablet') {
										setAttributes({ bgSlideshowPosition_tablet: value });
									} else if (currentDevice === 'mobile') {
										setAttributes({ bgSlideshowPosition_mobile: value });
									} else {
										setAttributes({ bgSlideshowPosition: value });
									}
								}}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Lazyload */}
						<div style={{ marginTop: '16px' }}>
							<ToggleControl
								label={__('Lazyload', 'voxel-fse')}
								checked={attributes.bgSlideshowLazyload || false}
								onChange={(value: boolean) =>
									setAttributes({ bgSlideshowLazyload: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Ken Burns Effect */}
						<div style={{ marginTop: '8px' }}>
							<ToggleControl
								label={__('Ken Burns Effect', 'voxel-fse')}
								checked={attributes.bgSlideshowKenBurns || false}
								onChange={(value: boolean) =>
									setAttributes({ bgSlideshowKenBurns: value })
								}
								__nextHasNoMarginBottom
							/>
						</div>

						{/* Ken Burns Direction - show when Ken Burns is enabled */}
						{attributes.bgSlideshowKenBurns && (
							<div style={{ marginTop: '16px' }}>
								<SelectControl
									label={__('Direction', 'voxel-fse')}
									value={attributes.bgSlideshowKenBurnsDirection || 'in'}
									options={[
										{ label: __('In', 'voxel-fse'), value: 'in' },
										{ label: __('Out', 'voxel-fse'), value: 'out' },
									]}
									onChange={(value: string) =>
										setAttributes({ bgSlideshowKenBurnsDirection: value })
									}
									__nextHasNoMarginBottom
								/>
							</div>
						)}
					</>
				)}

				{/* Transition Duration - Only show in Hover tab */}
				{isHover && showHoverState && (
					<div style={{ marginTop: '16px' }}>
						<RangeControl
							label={__('Transition Duration (s)', 'voxel-fse')}
							value={attributes.bgTransitionDuration ?? 0.3}
							onChange={(value: number | undefined) =>
								setAttributes({ bgTransitionDuration: value ?? 0.3 })
							}
							min={0}
							max={3}
							step={0.1}
						/>
					</div>
				)}
			</>
		);
	};

	// If hover state is disabled, just render normal state content directly
	if (!showHoverState) {
		return <div className="voxel-fse-background-control">{renderStateContent(false)}</div>;
	}

	// Render with Normal/Hover tabs
	return (
		<div className="voxel-fse-background-control">
			<StateTabPanel
				attributeName="backgroundActiveTab"
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
