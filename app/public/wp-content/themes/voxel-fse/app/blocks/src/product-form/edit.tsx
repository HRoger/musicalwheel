/**
 * Product Form Block - Editor Component
 *
 * 1:1 match with Voxel's Product Form (VX) widget:
 * - Dynamic product fields based on product type configuration
 * - Cart integration with add-to-cart / checkout
 * - Price calculator with pricing summary
 * - Extensive style controls for all form components
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/product-form.php
 * - Template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import type { ProductFormAttributes, ProductFormIcons } from './types';
import { DEFAULT_PRODUCT_FORM_ICONS } from './types';
import IconPickerControl from '@shared/controls/IconPickerControl';
import {
	SectionHeading,
	SliderControl,
	ColorControl,
	TypographyControl,
	BoxShadowControl,
	ResponsiveRangeControl,
	StyleTabPanel,
} from '@shared/controls';
import ProductFormComponent from './shared/ProductFormComponent';

interface EditProps {
	attributes: ProductFormAttributes;
	setAttributes: (attrs: Partial<ProductFormAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockProps = useBlockProps({
		className: 'ts-form ts-product-form voxel-fse-product-form',
	});

	// Initialize blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Helper to update nested icons object
	const updateIcon = (key: keyof ProductFormIcons, value: ProductFormIcons[keyof ProductFormIcons]) => {
		setAttributes({
			icons: {
				...DEFAULT_PRODUCT_FORM_ICONS,
				...attributes.icons,
				[key]: value,
			},
		});
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				{/* === CONTENT TAB === */}

				{/* Settings Section */}
				<PanelBody title={__('Settings', 'voxel-fse')} initialOpen={true}>
					<SelectControl
						label={__('Show Price Calculator', 'voxel-fse')}
						value={attributes.showPriceCalculator}
						options={[
							{ label: __('Show', 'voxel-fse'), value: 'show' },
							{ label: __('Hide', 'voxel-fse'), value: 'hide' },
						]}
						onChange={(value) =>
							setAttributes({ showPriceCalculator: value as 'show' | 'hide' })
						}
					/>
					<ToggleControl
						label={__('Show only subtotal?', 'voxel-fse')}
						checked={attributes.showSubtotalOnly}
						onChange={(value) => setAttributes({ showSubtotalOnly: value })}
					/>
				</PanelBody>

				{/* Cards Section */}
				<PanelBody title={__('Cards', 'voxel-fse')} initialOpen={false}>
					<ToggleControl
						label={__('Hide Cards subheading', 'voxel-fse')}
						checked={attributes.hideCardSubheading}
						onChange={(value) => setAttributes({ hideCardSubheading: value })}
					/>
					<ToggleControl
						label={__('Select/Deselect on click', 'voxel-fse')}
						help={__(
							'Useful if you are selecting add-ons through Select add-on action',
							'voxel-fse'
						)}
						checked={!attributes.cardSelectOnClick}
						onChange={(value) => setAttributes({ cardSelectOnClick: !value })}
					/>
				</PanelBody>

				{/* Icons Section */}
				<PanelBody title={__('Icons', 'voxel-fse')} initialOpen={false}>
					<IconPickerControl
						label={__('Add to cart icon', 'voxel-fse')}
						value={attributes.icons?.addToCart || DEFAULT_PRODUCT_FORM_ICONS.addToCart}
						onChange={(value) => updateIcon('addToCart', value)}
					/>
					<IconPickerControl
						label={__('Out of stock icons', 'voxel-fse')}
						value={attributes.icons?.outOfStock || DEFAULT_PRODUCT_FORM_ICONS.outOfStock}
						onChange={(value) => updateIcon('outOfStock', value)}
					/>
					<IconPickerControl
						label={__('Checkout icon', 'voxel-fse')}
						value={attributes.icons?.checkout || DEFAULT_PRODUCT_FORM_ICONS.checkout}
						onChange={(value) => updateIcon('checkout', value)}
					/>
					<IconPickerControl
						label={__('Calendar icon', 'voxel-fse')}
						value={attributes.icons?.calendar || DEFAULT_PRODUCT_FORM_ICONS.calendar}
						onChange={(value) => updateIcon('calendar', value)}
					/>
					<IconPickerControl
						label={__('Clock icon', 'voxel-fse')}
						value={attributes.icons?.clock || DEFAULT_PRODUCT_FORM_ICONS.clock}
						onChange={(value) => updateIcon('clock', value)}
					/>
				</PanelBody>

				{/* === STYLE TAB === */}

				{/* General Section */}
				<PanelBody title={__('General', 'voxel-fse')} initialOpen={false}>
					<SectionHeading>{__('Field', 'voxel-fse')}</SectionHeading>
					<ResponsiveRangeControl
						label={__('Spacing', 'voxel-fse')}
						value={attributes.fieldSpacing}
						onChange={(value) => setAttributes({ fieldSpacing: value ?? 20 })}
						valueTablet={attributes.fieldSpacingTablet}
						onChangeTablet={(value) => setAttributes({ fieldSpacingTablet: value })}
						valueMobile={attributes.fieldSpacingMobile}
						onChangeMobile={(value) => setAttributes({ fieldSpacingMobile: value })}
						min={0}
						max={50}
					/>

					<SectionHeading>{__('Field label', 'voxel-fse')}</SectionHeading>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.fieldLabelTypography}
						onChange={(value) => setAttributes({ fieldLabelTypography: value })}
					/>
					<ColorControl
						label={__('Color', 'voxel-fse')}
						value={attributes.fieldLabelColor}
						onChange={(value) => setAttributes({ fieldLabelColor: value ?? '' })}
					/>
				</PanelBody>

				{/* Primary Button Section */}
				<PanelBody title={__('Primary button', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<TypographyControl
											label={__('Button typography', 'voxel-fse')}
											value={attributes.primaryButtonTypography}
											onChange={(value) =>
												setAttributes({ primaryButtonTypography: value })
											}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.primaryButtonBorderRadius}
											onChange={(value) =>
												setAttributes({ primaryButtonBorderRadius: value ?? 0 })
											}
											min={0}
											max={100}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.primaryButtonBoxShadow}
											onChange={(value) =>
												setAttributes({ primaryButtonBoxShadow: value })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.primaryButtonTextColor}
											onChange={(value) =>
												setAttributes({ primaryButtonTextColor: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.primaryButtonBackground}
											onChange={(value) =>
												setAttributes({ primaryButtonBackground: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Icon size', 'voxel-fse')}
											value={attributes.primaryButtonIconSize}
											onChange={(value) =>
												setAttributes({ primaryButtonIconSize: value ?? 24 })
											}
											min={0}
											max={100}
										/>
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.primaryButtonIconColor}
											onChange={(value) =>
												setAttributes({ primaryButtonIconColor: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Icon/Text spacing', 'voxel-fse')}
											value={attributes.primaryButtonIconTextSpacing}
											onChange={(value) =>
												setAttributes({ primaryButtonIconTextSpacing: value ?? 8 })
											}
											min={0}
											max={100}
										/>
									</>
								)}

								{tab.name === 'hover' && (
									<>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.primaryButtonTextColorHover}
											onChange={(value) =>
												setAttributes({ primaryButtonTextColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.primaryButtonBackgroundHover}
											onChange={(value) =>
												setAttributes({ primaryButtonBackgroundHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.primaryButtonBorderColorHover}
											onChange={(value) =>
												setAttributes({ primaryButtonBorderColorHover: value ?? '' })
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.primaryButtonBoxShadowHover}
											onChange={(value) =>
												setAttributes({ primaryButtonBoxShadowHover: value })
											}
										/>
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.primaryButtonIconColorHover}
											onChange={(value) =>
												setAttributes({ primaryButtonIconColorHover: value ?? '' })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Price Calculator Section */}
				<PanelBody title={__('Price calculator', 'voxel-fse')} initialOpen={false}>
					<SliderControl
						label={__('List spacing', 'voxel-fse')}
						value={attributes.priceCalculatorListSpacing}
						onChange={(value) =>
							setAttributes({ priceCalculatorListSpacing: value ?? 10 })
						}
						min={0}
						max={50}
					/>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.priceCalculatorTypography}
						onChange={(value) => setAttributes({ priceCalculatorTypography: value })}
					/>
					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.priceCalculatorTextColor}
						onChange={(value) =>
							setAttributes({ priceCalculatorTextColor: value ?? '' })
						}
					/>
					<TypographyControl
						label={__('Typography (Total)', 'voxel-fse')}
						value={attributes.priceCalculatorTotalTypography}
						onChange={(value) =>
							setAttributes({ priceCalculatorTotalTypography: value })
						}
					/>
					<ColorControl
						label={__('Text color (Total)', 'voxel-fse')}
						value={attributes.priceCalculatorTotalTextColor}
						onChange={(value) =>
							setAttributes({ priceCalculatorTotalTextColor: value ?? '' })
						}
					/>
				</PanelBody>

				{/* Loading / Out of Stock Section */}
				<PanelBody title={__('Loading / Out of stock', 'voxel-fse')} initialOpen={false}>
					<SectionHeading>{__('Loading', 'voxel-fse')}</SectionHeading>
					<ColorControl
						label={__('Color 1', 'voxel-fse')}
						value={attributes.loadingColor1}
						onChange={(value) => setAttributes({ loadingColor1: value ?? '' })}
					/>
					<ColorControl
						label={__('Color 2', 'voxel-fse')}
						value={attributes.loadingColor2}
						onChange={(value) => setAttributes({ loadingColor2: value ?? '' })}
					/>

					<SectionHeading>{__('Out of stock', 'voxel-fse')}</SectionHeading>
					<SliderControl
						label={__('Content gap', 'voxel-fse')}
						value={attributes.outOfStockContentGap}
						onChange={(value) => setAttributes({ outOfStockContentGap: value ?? 15 })}
						min={0}
						max={100}
					/>
					<SliderControl
						label={__('Icon size', 'voxel-fse')}
						value={attributes.outOfStockIconSize}
						onChange={(value) => setAttributes({ outOfStockIconSize: value ?? 40 })}
						min={0}
						max={100}
					/>
					<ColorControl
						label={__('Icon color', 'voxel-fse')}
						value={attributes.outOfStockIconColor}
						onChange={(value) => setAttributes({ outOfStockIconColor: value ?? '' })}
					/>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.outOfStockTypography}
						onChange={(value) => setAttributes({ outOfStockTypography: value })}
					/>
					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.outOfStockTextColor}
						onChange={(value) => setAttributes({ outOfStockTextColor: value ?? '' })}
					/>
				</PanelBody>

				{/* Number Stepper Section */}
				<PanelBody title={__('Number stepper', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SliderControl
											label={__('Input value size', 'voxel-fse')}
											value={attributes.stepperInputSize}
											onChange={(value) =>
												setAttributes({ stepperInputSize: value ?? 16 })
											}
											min={13}
											max={30}
										/>
										<ColorControl
											label={__('Button icon color', 'voxel-fse')}
											value={attributes.stepperButtonIconColor}
											onChange={(value) =>
												setAttributes({ stepperButtonIconColor: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Button background', 'voxel-fse')}
											value={attributes.stepperButtonBackground}
											onChange={(value) =>
												setAttributes({ stepperButtonBackground: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Button border radius', 'voxel-fse')}
											value={attributes.stepperButtonBorderRadius}
											onChange={(value) =>
												setAttributes({ stepperButtonBorderRadius: value ?? 0 })
											}
											min={0}
											max={50}
										/>
									</>
								)}

								{tab.name === 'hover' && (
									<>
										<ColorControl
											label={__('Button icon color', 'voxel-fse')}
											value={attributes.stepperButtonIconColorHover}
											onChange={(value) =>
												setAttributes({ stepperButtonIconColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Button background color', 'voxel-fse')}
											value={attributes.stepperButtonBackgroundHover}
											onChange={(value) =>
												setAttributes({ stepperButtonBackgroundHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Button border color', 'voxel-fse')}
											value={attributes.stepperButtonBorderColorHover}
											onChange={(value) =>
												setAttributes({ stepperButtonBorderColorHover: value ?? '' })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Cards Section */}
				<PanelBody title={__('Cards', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'selected', title: __('Selected', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SectionHeading>{__('Cards', 'voxel-fse')}</SectionHeading>
										<SliderControl
											label={__('Gap', 'voxel-fse')}
											value={attributes.cardsGap}
											onChange={(value) => setAttributes({ cardsGap: value ?? 10 })}
											min={0}
											max={100}
										/>
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.cardsBackground}
											onChange={(value) =>
												setAttributes({ cardsBackground: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.cardsBorderRadius}
											onChange={(value) =>
												setAttributes({ cardsBorderRadius: value ?? 0 })
											}
											min={0}
											max={50}
										/>

										<SectionHeading>{__('Text', 'voxel-fse')}</SectionHeading>
										<TypographyControl
											label={__('Primary', 'voxel-fse')}
											value={attributes.cardsPrimaryTypography}
											onChange={(value) =>
												setAttributes({ cardsPrimaryTypography: value })
											}
										/>
										<ColorControl
											label={__('Primary Color', 'voxel-fse')}
											value={attributes.cardsPrimaryColor}
											onChange={(value) =>
												setAttributes({ cardsPrimaryColor: value ?? '' })
											}
										/>
										<TypographyControl
											label={__('Secondary', 'voxel-fse')}
											value={attributes.cardsSecondaryTypography}
											onChange={(value) =>
												setAttributes({ cardsSecondaryTypography: value })
											}
										/>
										<ColorControl
											label={__('Secondary Color', 'voxel-fse')}
											value={attributes.cardsSecondaryColor}
											onChange={(value) =>
												setAttributes({ cardsSecondaryColor: value ?? '' })
											}
										/>
										<TypographyControl
											label={__('Price', 'voxel-fse')}
											value={attributes.cardsPriceTypography}
											onChange={(value) =>
												setAttributes({ cardsPriceTypography: value })
											}
										/>
										<ColorControl
											label={__('Price color Color', 'voxel-fse')}
											value={attributes.cardsPriceColor}
											onChange={(value) =>
												setAttributes({ cardsPriceColor: value ?? '' })
											}
										/>

										<SectionHeading>{__('Image', 'voxel-fse')}</SectionHeading>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.cardsImageBorderRadius}
											onChange={(value) =>
												setAttributes({ cardsImageBorderRadius: value ?? 0 })
											}
											min={0}
											max={100}
										/>
										<SliderControl
											label={__('Size', 'voxel-fse')}
											value={attributes.cardsImageSize}
											onChange={(value) =>
												setAttributes({ cardsImageSize: value ?? 60 })
											}
											min={20}
											max={200}
										/>
									</>
								)}

								{tab.name === 'selected' && (
									<>
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.cardsSelectedBackground}
											onChange={(value) =>
												setAttributes({ cardsSelectedBackground: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.cardsSelectedBorderColor}
											onChange={(value) =>
												setAttributes({ cardsSelectedBorderColor: value ?? '' })
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.cardsSelectedBoxShadow}
											onChange={(value) =>
												setAttributes({ cardsSelectedBoxShadow: value })
											}
										/>
										<TypographyControl
											label={__('Primary text', 'voxel-fse')}
											value={attributes.cardsSelectedPrimaryTypography}
											onChange={(value) =>
												setAttributes({ cardsSelectedPrimaryTypography: value })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Buttons Section */}
				<PanelBody title={__('Buttons', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'selected', title: __('Selected', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SliderControl
											label={__('Gap', 'voxel-fse')}
											value={attributes.buttonsGap}
											onChange={(value) =>
												setAttributes({ buttonsGap: value ?? 10 })
											}
											min={0}
											max={100}
										/>
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.buttonsBackground}
											onChange={(value) =>
												setAttributes({ buttonsBackground: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.buttonsBorderRadius}
											onChange={(value) =>
												setAttributes({ buttonsBorderRadius: value ?? 0 })
											}
											min={0}
											max={50}
										/>
										<TypographyControl
											label={__('Text', 'voxel-fse')}
											value={attributes.buttonsTextTypography}
											onChange={(value) =>
												setAttributes({ buttonsTextTypography: value })
											}
										/>
										<ColorControl
											label={__('Text Color', 'voxel-fse')}
											value={attributes.buttonsTextColor}
											onChange={(value) =>
												setAttributes({ buttonsTextColor: value ?? '' })
											}
										/>
									</>
								)}

								{tab.name === 'selected' && (
									<>
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.buttonsSelectedBackground}
											onChange={(value) =>
												setAttributes({ buttonsSelectedBackground: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.buttonsSelectedBorderColor}
											onChange={(value) =>
												setAttributes({ buttonsSelectedBorderColor: value ?? '' })
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.buttonsSelectedBoxShadow}
											onChange={(value) =>
												setAttributes({ buttonsSelectedBoxShadow: value })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Dropdown Section */}
				<PanelBody title={__('Dropdown', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
							{ name: 'filled', title: __('Filled', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SectionHeading>{__('Style', 'voxel-fse')}</SectionHeading>
										<TypographyControl
											label={__('Typography', 'voxel-fse')}
											value={attributes.dropdownTypography}
											onChange={(value) =>
												setAttributes({ dropdownTypography: value })
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.dropdownBoxShadow}
											onChange={(value) =>
												setAttributes({ dropdownBoxShadow: value })
											}
										/>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.dropdownBackground}
											onChange={(value) =>
												setAttributes({ dropdownBackground: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.dropdownTextColor}
											onChange={(value) =>
												setAttributes({ dropdownTextColor: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.dropdownBorderRadius}
											onChange={(value) =>
												setAttributes({ dropdownBorderRadius: value ?? 0 })
											}
											min={0}
											max={50}
										/>

										<SectionHeading>{__('Icons', 'voxel-fse')}</SectionHeading>
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.dropdownIconColor}
											onChange={(value) =>
												setAttributes({ dropdownIconColor: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Icon size', 'voxel-fse')}
											value={attributes.dropdownIconSize}
											onChange={(value) =>
												setAttributes({ dropdownIconSize: value ?? 24 })
											}
											min={0}
											max={50}
										/>
										<SliderControl
											label={__('Icon/Text spacing', 'voxel-fse')}
											value={attributes.dropdownIconTextSpacing}
											onChange={(value) =>
												setAttributes({ dropdownIconTextSpacing: value ?? 10 })
											}
											min={0}
											max={50}
										/>

										<SectionHeading>{__('Chevron', 'voxel-fse')}</SectionHeading>
										<ToggleControl
											label={__('Hide chevron', 'voxel-fse')}
											checked={attributes.dropdownHideChevron}
											onChange={(value) =>
												setAttributes({ dropdownHideChevron: value })
											}
										/>
										<ColorControl
											label={__('Chevron color', 'voxel-fse')}
											value={attributes.dropdownChevronColor}
											onChange={(value) =>
												setAttributes({ dropdownChevronColor: value ?? '' })
											}
										/>
									</>
								)}

								{tab.name === 'hover' && (
									<>
										<SectionHeading>{__('Style', 'voxel-fse')}</SectionHeading>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.dropdownBackgroundHover}
											onChange={(value) =>
												setAttributes({ dropdownBackgroundHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.dropdownTextColorHover}
											onChange={(value) =>
												setAttributes({ dropdownTextColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.dropdownBorderColorHover}
											onChange={(value) =>
												setAttributes({ dropdownBorderColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.dropdownIconColorHover}
											onChange={(value) =>
												setAttributes({ dropdownIconColorHover: value ?? '' })
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.dropdownBoxShadowHover}
											onChange={(value) =>
												setAttributes({ dropdownBoxShadowHover: value })
											}
										/>
									</>
								)}

								{tab.name === 'filled' && (
									<>
										<SectionHeading>{__('Style (Filled)', 'voxel-fse')}</SectionHeading>
										<TypographyControl
											label={__('Typography', 'voxel-fse')}
											value={attributes.dropdownFilledTypography}
											onChange={(value) =>
												setAttributes({ dropdownFilledTypography: value })
											}
										/>
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.dropdownFilledBackground}
											onChange={(value) =>
												setAttributes({ dropdownFilledBackground: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.dropdownFilledTextColor}
											onChange={(value) =>
												setAttributes({ dropdownFilledTextColor: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.dropdownFilledIconColor}
											onChange={(value) =>
												setAttributes({ dropdownFilledIconColor: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.dropdownFilledBorderColor}
											onChange={(value) =>
												setAttributes({ dropdownFilledBorderColor: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Border width', 'voxel-fse')}
											value={attributes.dropdownFilledBorderWidth}
											onChange={(value) =>
												setAttributes({ dropdownFilledBorderWidth: value ?? 0 })
											}
											min={0}
											max={10}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.dropdownFilledBoxShadow}
											onChange={(value) =>
												setAttributes({ dropdownFilledBoxShadow: value })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Radio/Checkboxes Section */}
				<PanelBody title={__('Radio/Checkboxes', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'selected', title: __('Selected', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<ColorControl
											label={__('Border-color', 'voxel-fse')}
											value={attributes.radioCheckboxBorderColor}
											onChange={(value) =>
												setAttributes({ radioCheckboxBorderColor: value ?? '' })
											}
										/>
										<TypographyControl
											label={__('Text', 'voxel-fse')}
											value={attributes.radioCheckboxTextTypography}
											onChange={(value) =>
												setAttributes({ radioCheckboxTextTypography: value })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.radioCheckboxTextColor}
											onChange={(value) =>
												setAttributes({ radioCheckboxTextColor: value ?? '' })
											}
										/>
									</>
								)}

								{tab.name === 'selected' && (
									<>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.radioCheckboxSelectedBackground}
											onChange={(value) =>
												setAttributes({
													radioCheckboxSelectedBackground: value ?? '',
												})
											}
										/>
										<TypographyControl
											label={__('Text', 'voxel-fse')}
											value={attributes.radioCheckboxSelectedTextTypography}
											onChange={(value) =>
												setAttributes({
													radioCheckboxSelectedTextTypography: value,
												})
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.radioCheckboxSelectedTextColor}
											onChange={(value) =>
												setAttributes({
													radioCheckboxSelectedTextColor: value ?? '',
												})
											}
										/>
										<BoxShadowControl
											label={__('Box Shadow', 'voxel-fse')}
											value={attributes.radioCheckboxSelectedBoxShadow}
											onChange={(value) =>
												setAttributes({ radioCheckboxSelectedBoxShadow: value })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Switcher Section */}
				<PanelBody title={__('Switcher', 'voxel-fse')} initialOpen={false}>
					<SectionHeading>{__('Switch slider', 'voxel-fse')}</SectionHeading>
					<ColorControl
						label={__('Background (Inactive)', 'voxel-fse')}
						value={attributes.switcherBackgroundInactive}
						onChange={(value) =>
							setAttributes({ switcherBackgroundInactive: value ?? '' })
						}
					/>
					<ColorControl
						label={__('Background (Active)', 'voxel-fse')}
						value={attributes.switcherBackgroundActive}
						onChange={(value) =>
							setAttributes({ switcherBackgroundActive: value ?? '' })
						}
					/>
					<ColorControl
						label={__('Handle background', 'voxel-fse')}
						value={attributes.switcherHandleBackground}
						onChange={(value) =>
							setAttributes({ switcherHandleBackground: value ?? '' })
						}
					/>
				</PanelBody>

				{/* Images Section */}
				<PanelBody title={__('Images', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'selected', title: __('Selected', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SliderControl
											label={__('Gap', 'voxel-fse')}
											value={attributes.imagesGap}
											onChange={(value) => setAttributes({ imagesGap: value ?? 10 })}
											min={0}
											max={50}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.imagesBorderRadius}
											onChange={(value) =>
												setAttributes({ imagesBorderRadius: value ?? 0 })
											}
											min={0}
											max={100}
										/>
									</>
								)}

								{tab.name === 'selected' && (
									<>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.imagesSelectedBorderColor}
											onChange={(value) =>
												setAttributes({ imagesSelectedBorderColor: value ?? '' })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>

				{/* Colors Section */}
				<PanelBody title={__('Colors', 'voxel-fse')} initialOpen={false}>
					<SliderControl
						label={__('Gap', 'voxel-fse')}
						value={attributes.colorsGap}
						onChange={(value) => setAttributes({ colorsGap: value ?? 10 })}
						min={0}
						max={50}
					/>
					<SliderControl
						label={__('Size', 'voxel-fse')}
						value={attributes.colorsSize}
						onChange={(value) => setAttributes({ colorsSize: value ?? 30 })}
						min={10}
						max={100}
					/>
					<SliderControl
						label={__('Border radius', 'voxel-fse')}
						value={attributes.colorsBorderRadius}
						onChange={(value) => setAttributes({ colorsBorderRadius: value ?? 50 })}
						min={0}
						max={100}
					/>
					<ColorControl
						label={__('Inset color', 'voxel-fse')}
						value={attributes.colorsInsetColor}
						onChange={(value) => setAttributes({ colorsInsetColor: value ?? '' })}
					/>
				</PanelBody>

				{/* Input and Textarea Section */}
				<PanelBody title={__('Input and Textarea', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						className="voxel-fse-state-tabs"
						activeClass="is-active"
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
							{ name: 'active', title: __('Active', 'voxel-fse') },
						]}
					>
						{(tab) => (
							<div style={{ paddingTop: '16px' }}>
								{tab.name === 'normal' && (
									<>
										<SectionHeading>{__('Placeholder', 'voxel-fse')}</SectionHeading>
										<ColorControl
											label={__('Placeholder color', 'voxel-fse')}
											value={attributes.inputPlaceholderColor}
											onChange={(value) =>
												setAttributes({ inputPlaceholderColor: value ?? '' })
											}
										/>
										<TypographyControl
											label={__('Typography', 'voxel-fse')}
											value={attributes.inputPlaceholderTypography}
											onChange={(value) =>
												setAttributes({ inputPlaceholderTypography: value })
											}
										/>

										<SectionHeading>{__('Value', 'voxel-fse')}</SectionHeading>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.inputValueColor}
											onChange={(value) =>
												setAttributes({ inputValueColor: value ?? '' })
											}
										/>
										<TypographyControl
											label={__('Typography', 'voxel-fse')}
											value={attributes.inputValueTypography}
											onChange={(value) =>
												setAttributes({ inputValueTypography: value })
											}
										/>

										<SectionHeading>{__('General', 'voxel-fse')}</SectionHeading>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.inputBackground}
											onChange={(value) =>
												setAttributes({ inputBackground: value ?? '' })
											}
										/>
										<SliderControl
											label={__('Border radius', 'voxel-fse')}
											value={attributes.inputBorderRadius}
											onChange={(value) =>
												setAttributes({ inputBorderRadius: value ?? 0 })
											}
											min={0}
											max={50}
										/>
									</>
								)}

								{tab.name === 'hover' && (
									<>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.inputBackgroundHover}
											onChange={(value) =>
												setAttributes({ inputBackgroundHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.inputBorderColorHover}
											onChange={(value) =>
												setAttributes({ inputBorderColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Placeholder color', 'voxel-fse')}
											value={attributes.inputPlaceholderColorHover}
											onChange={(value) =>
												setAttributes({ inputPlaceholderColorHover: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.inputTextColorHover}
											onChange={(value) =>
												setAttributes({ inputTextColorHover: value ?? '' })
											}
										/>
									</>
								)}

								{tab.name === 'active' && (
									<>
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.inputBackgroundActive}
											onChange={(value) =>
												setAttributes({ inputBackgroundActive: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.inputBorderColorActive}
											onChange={(value) =>
												setAttributes({ inputBorderColorActive: value ?? '' })
											}
										/>
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.inputTextColorActive}
											onChange={(value) =>
												setAttributes({ inputTextColorActive: value ?? '' })
											}
										/>
									</>
								)}
							</div>
						)}
					</StyleTabPanel>
				</PanelBody>
			</InspectorControls>

			{/* Editor Preview */}
			<ProductFormComponent attributes={attributes} context="editor" />
		</div>
	);
}
