/**
 * Slider Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the mandatory inspector folder pattern.
 * Maps to Voxel Slider Elementor widget Style tab controls.
 *
 * Evidence:
 * - General section: themes/voxel/app/widgets/slider.php
 * - Thumbnails section: themes/voxel/app/widgets/slider.php
 * - Carousel navigation section: themes/voxel/app/widgets/slider.php
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	StateTabPanel,
	ColorControl,
	ResponsiveRangeControl,
	ResponsiveRangeControlWithDropdown,
} from '@shared/controls';
import type { SliderBlockAttributes } from '../types';

interface StyleTabProps {
	attributes: SliderBlockAttributes;
	setAttributes: (attrs: Partial<SliderBlockAttributes>) => void;
}

/**
 * Border type options for navigation buttons
 */
const BORDER_TYPE_OPTIONS = [
	{ label: __('Default', 'voxel-fse'), value: '' },
	{ label: __('None', 'voxel-fse'), value: 'none' },
	{ label: __('Solid', 'voxel-fse'), value: 'solid' },
	{ label: __('Double', 'voxel-fse'), value: 'double' },
	{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
	{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
	{ label: __('Groove', 'voxel-fse'), value: 'groove' },
];

/**
 * Style Tab Component
 *
 * Contains three accordion sections:
 * 1. General - Image styling (Normal/Hover states)
 * 2. Thumbnails - Thumbnail styling (Normal/Hover states)
 * 3. Carousel navigation - Navigation button styling (Normal/Hover states)
 */
export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="style-general"
		>
			{/* Accordion 1: General */}
			<AccordionPanel id="style-general" title={__('General', 'voxel-fse')}>
				<StateTabPanel
					attributeName="generalImageState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{/* Image aspect ratio - Normal */}
								<ResponsiveRangeControlWithDropdown
									label={__('Image aspect ratio', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="imageAspectRatio"
									min={0}
									max={100}
								/>

								{/* Border radius - Normal */}
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="imageBorderRadius"
									min={0}
									max={100}
								/>

								{/* Opacity - Normal */}
								<ResponsiveRangeControl
									label={__('Opacity', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="imageOpacity"
									min={0}
									max={1}
									step={0.05}
								/>
							</>
						) : (
							<>
								{/* Opacity - Hover */}
								<ResponsiveRangeControl
									label={__('Opacity', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="imageOpacityHover"
									min={0}
									max={1}
									step={0.05}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 2: Thumbnails */}
			<AccordionPanel id="thumbnails" title={__('Thumbnails', 'voxel-fse')}>
				<StateTabPanel
					attributeName="thumbnailState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{/* Size - Normal */}
								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="thumbnailSize"
									min={20}
									max={200}
								/>

								{/* Border radius - Normal */}
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="thumbnailBorderRadius"
									min={0}
									max={100}
								/>

								{/* Opacity - Normal */}
								<ResponsiveRangeControl
									label={__('Opacity', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="thumbnailOpacity"
									min={0}
									max={1}
									step={0.05}
								/>
							</>
						) : (
							<>
								{/* Opacity - Hover */}
								<ResponsiveRangeControl
									label={__('Opacity', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="thumbnailOpacityHover"
									min={0}
									max={1}
									step={0.05}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 3: Carousel navigation */}
			<AccordionPanel id="carousel-navigation" title={__('Carousel navigation', 'voxel-fse')}>
				<StateTabPanel
					attributeName="navState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{/* Horizontal position - Normal */}
								<ResponsiveRangeControl
									label={__('Horizontal position', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navHorizontalPosition"
									min={-100}
									max={100}
								/>

								{/* Vertical position - Normal */}
								<ResponsiveRangeControl
									label={__('Vertical position', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navVerticalPosition"
									min={-500}
									max={500}
								/>

								{/* Button icon color - Normal */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.navButtonIconColor}
									onChange={(value) => setAttributes({ navButtonIconColor: value })}
								/>

								{/* Button size - Normal */}
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navButtonSize"
									min={0}
									max={100}
								/>

								{/* Button icon size - Normal */}
								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navButtonIconSize"
									min={0}
									max={100}
								/>

								{/* Button background - Normal */}
								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.navButtonBackground}
									onChange={(value) => setAttributes({ navButtonBackground: value })}
								/>

								{/* Backdrop blur - Normal */}
								<ResponsiveRangeControl
									label={__('Backdrop blur', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navBackdropBlur"
									min={0}
									max={10}
								/>

								{/* Border Type - Normal */}
								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.navBorderType}
									options={BORDER_TYPE_OPTIONS}
									onChange={(value) => setAttributes({ navBorderType: value })}
									__nextHasNoMarginBottom
								/>

								{/* Border color - Normal (conditional on border type) */}
								{attributes.navBorderType && attributes.navBorderType !== 'none' && (
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.navBorderColor}
										onChange={(value) => setAttributes({ navBorderColor: value })}
									/>
								)}

								{/* Button border radius - Normal */}
								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navButtonBorderRadius"
									min={0}
									max={100}
								/>
							</>
						) : (
							<>
								{/* Button size - Hover */}
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navButtonSizeHover"
									min={0}
									max={100}
								/>

								{/* Button icon size - Hover */}
								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="navButtonIconSizeHover"
									min={0}
									max={100}
								/>

								{/* Button icon color - Hover */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.navButtonIconColorHover}
									onChange={(value) => setAttributes({ navButtonIconColorHover: value })}
								/>

								{/* Button background color - Hover */}
								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.navButtonBackgroundHover}
									onChange={(value) => setAttributes({ navButtonBackgroundHover: value })}
								/>

								{/* Button border color - Hover */}
								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.navBorderColorHover}
									onChange={(value) => setAttributes({ navBorderColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
