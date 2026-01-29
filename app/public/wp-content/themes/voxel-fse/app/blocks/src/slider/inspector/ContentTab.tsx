/**
 * Slider Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the mandatory inspector folder pattern.
 * Maps to Voxel Slider Elementor widget Content tab controls.
 *
 * Evidence:
 * - Images section: themes/voxel/app/widgets/slider.php
 * - Icons section: themes/voxel/app/widgets/slider.php
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	GalleryUploadControl,
	ResponsiveSelectControl,
	ResponsiveRangeControl,
	AdvancedIconControl,
	IMAGE_SIZES_FULL,
} from '@shared/controls';
import type { SliderBlockAttributes, SliderImage } from '../types';
import type { IconValue } from '@shared/types';
import type { ImageUploadValue } from '@shared/controls/ImageUploadControl';

interface ContentTabProps {
	attributes: SliderBlockAttributes;
	setAttributes: (attrs: Partial<SliderBlockAttributes>) => void;
}

/**
 * Link type options
 */
const LINK_OPTIONS = [
	{ label: __('None', 'voxel-fse'), value: 'none' },
	{ label: __('Custom URL', 'voxel-fse'), value: 'custom_link' },
	{ label: __('Lightbox', 'voxel-fse'), value: 'lightbox' },
];

/**
 * Content Tab Component
 *
 * Contains two accordion sections:
 * 1. Images - Gallery upload, image sizes, link options, thumbnails, auto slide
 * 2. Icons - Left and right chevron icons
 */
export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	/**
	 * Convert SliderImage[] to ImageUploadValue[] for GalleryUploadControl
	 */
	const convertToImageUploadValue = (images: SliderImage[]): ImageUploadValue[] => {
		return images.map((img) => ({
			id: img.id,
			url: img.url,
			alt: img.alt || '',
			sizes: img.sizes,
		}));
	};

	/**
	 * Convert ImageUploadValue[] back to SliderImage[]
	 */
	const convertToSliderImage = (images: ImageUploadValue[]): SliderImage[] => {
		return images.map((img) => ({
			id: img.id || 0,
			url: img.url || '',
			alt: img.alt || '',
			caption: '',
			description: '',
			title: '',
			sizes: img.sizes,
		}));
	};

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="images"
		>
			{/* Accordion 1: Images */}
			<AccordionPanel id="images" title={__('Images', 'voxel-fse')}>
				{/* Add Images - Gallery Upload with Dynamic Tag support */}
				<GalleryUploadControl
					label={__('Add Images', 'voxel-fse')}
					value={convertToImageUploadValue(attributes.images || [])}
					onChange={(images) => setAttributes({ images: convertToSliderImage(images) })}
					enableDynamicTags={true}
					dynamicTagValue={attributes.imagesDynamicTag}
					onDynamicTagChange={(value) => setAttributes({ imagesDynamicTag: value })}
					dynamicTagContext="post"
				/>

				{/* Number of images to load */}
				<TextControl
					type="number"
					label={__('Number of images to load', 'voxel-fse')}
					value={String(attributes.visibleCount || 3)}
					onChange={(value) => setAttributes({ visibleCount: parseInt(value, 10) || 3 })}
					min={1}
					max={50}
				/>

				{/* Image size - Responsive */}
				<ResponsiveSelectControl
					label={__('Image size', 'voxel-fse')}
					value={attributes.displaySize}
					valueTablet={attributes.displaySize_tablet}
					valueMobile={attributes.displaySize_mobile}
					onChange={(value) => setAttributes({ displaySize: value })}
					onChangeTablet={(value) => setAttributes({ displaySize_tablet: value })}
					onChangeMobile={(value) => setAttributes({ displaySize_mobile: value })}
					options={IMAGE_SIZES_FULL}
					controlKey="slider-image-size"
				/>

				{/* Image size (Lightbox) - Responsive */}
				<ResponsiveSelectControl
					label={__('Image size (Lightbox)', 'voxel-fse')}
					value={attributes.lightboxSize}
					valueTablet={attributes.lightboxSize_tablet}
					valueMobile={attributes.lightboxSize_mobile}
					onChange={(value) => setAttributes({ lightboxSize: value })}
					onChangeTablet={(value) => setAttributes({ lightboxSize_tablet: value })}
					onChangeMobile={(value) => setAttributes({ lightboxSize_mobile: value })}
					options={IMAGE_SIZES_FULL}
					controlKey="slider-lightbox-size"
				/>

				{/* Link */}
				<SelectControl
					label={__('Link', 'voxel-fse')}
					value={attributes.linkType}
					options={LINK_OPTIONS}
					onChange={(value) => setAttributes({ linkType: value as SliderBlockAttributes['linkType'] })}
					__nextHasNoMarginBottom
				/>

				{/* Custom URL (conditional - shown when Link = Custom URL) */}
				{attributes.linkType === 'custom_link' && (
					<TextControl
						label={__('Custom URL', 'voxel-fse')}
						value={attributes.customLinkUrl || ''}
						onChange={(value) => setAttributes({ customLinkUrl: value })}
						placeholder="https://your-link.com"
					/>
				)}

				{/* Show thumbnails? */}
				<ToggleControl
					label={__('Show thumbnails?', 'voxel-fse')}
					checked={attributes.showThumbnails}
					onChange={(value) => setAttributes({ showThumbnails: value })}
					__nextHasNoMarginBottom
				/>

				{/* Auto slide? */}
				<ToggleControl
					label={__('Auto slide?', 'voxel-fse')}
					checked={attributes.autoSlide}
					onChange={(value) => setAttributes({ autoSlide: value })}
					__nextHasNoMarginBottom
				/>

				{/* Auto slide interval (ms) - Responsive - conditional on Auto slide = Yes */}
				{attributes.autoSlide && (
					<ResponsiveRangeControl
						label={__('Auto slide interval (ms)', 'voxel-fse')}
						attributes={attributes as Record<string, any>}
						setAttributes={setAttributes as (attrs: Record<string, any>) => void}
						attributeBaseName="autoSlideInterval"
						min={500}
						max={10000}
						step={100}
					/>
				)}
			</AccordionPanel>

			{/* Accordion 2: Icons */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				{/* Right chevron - Advanced Icon Control with large preview */}
				<AdvancedIconControl
					label={__('Right chevron', 'voxel-fse')}
					value={attributes.rightChevronIcon}
					onChange={(value: IconValue) => setAttributes({ rightChevronIcon: value })}
					supportsDynamicTags={true}
					dynamicTagContext="post"
				/>

				{/* Left chevron - Advanced Icon Control with large preview */}
				<AdvancedIconControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.leftChevronIcon}
					onChange={(value: IconValue) => setAttributes({ leftChevronIcon: value })}
					supportsDynamicTags={true}
					dynamicTagContext="post"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
