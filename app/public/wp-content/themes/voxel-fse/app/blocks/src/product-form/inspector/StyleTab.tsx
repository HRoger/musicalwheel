/**
 * Product Form Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains all style-related accordions
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	SliderControl,
	ColorControl,
	TypographyControl,
	BoxShadowPopup,
	ResponsiveRangeControl,
	StateTabPanel,
	BorderGroupControl,
} from '@shared/controls';
import type { ProductFormAttributes } from '../types';

interface StyleTabProps {
	attributes: ProductFormAttributes;
	setAttributes: (attrs: Partial<ProductFormAttributes>) => void;
}

export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="general"
		>
			{/* General Section */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<SectionHeading label={__('Field', 'voxel-fse')} />
				<ResponsiveRangeControl
					label={__('Spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="fieldSpacing"
					min={0}
					max={50}
				/>

				<SectionHeading label={__('Field label', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.fieldLabelTypography}
					onChange={(value: any) => setAttributes({ fieldLabelTypography: value })}
				/>
				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldLabelColor}
					onChange={(value: string | undefined) => setAttributes({ fieldLabelColor: value ?? '' })}
				/>
			</AccordionPanel>

			{/* Primary Button Section */}
			<AccordionPanel id="primary-button" title={__('Primary button', 'voxel-fse')}>
				<StateTabPanel
				attributeName="primaryBtnState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<TypographyControl
										label={__('Button typography', 'voxel-fse')}
										value={attributes.primaryButtonTypography}
										onChange={(value: any) =>
											setAttributes({ primaryButtonTypography: value })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.primaryButtonBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) =>
											setAttributes({ primaryButtonBorder: value })
										}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.primaryButtonBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ primaryButtonBorderRadius: value ?? 0 })
										}
										min={0}
										max={100}
										unit="px"
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="primaryButtonBoxShadow"
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.primaryButtonTextColor}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonTextColor: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonBackground: value ?? '' })
										}
									/>
									<SliderControl
										label={__('Icon size', 'voxel-fse')}
										value={attributes.primaryButtonIconSize}
										onChange={(value: number | undefined) =>
											setAttributes({ primaryButtonIconSize: value ?? 24 })
										}
										min={0}
										max={100}
										unit="px"
									/>
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.primaryButtonIconColor}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonIconColor: value ?? '' })
										}
									/>
									<SliderControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										value={attributes.primaryButtonIconTextSpacing}
										onChange={(value: number | undefined) =>
											setAttributes({ primaryButtonIconTextSpacing: value ?? 8 })
										}
										min={0}
										max={100}
										unit="px"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.primaryButtonTextColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonTextColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackgroundHover}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonBackgroundHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.primaryButtonBorderColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({
												primaryButtonBorderColorHover: value ?? '',
											})
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="primaryButtonBoxShadowHover"
									/>
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.primaryButtonIconColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ primaryButtonIconColorHover: value ?? '' })
										}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Price Calculator Section */}
			<AccordionPanel id="price-calculator" title={__('Price calculator', 'voxel-fse')}>
				<SliderControl
					label={__('List spacing', 'voxel-fse')}
					value={attributes.priceCalculatorListSpacing}
					onChange={(value: number | undefined) =>
						setAttributes({ priceCalculatorListSpacing: value ?? 10 })
					}
					min={0}
					max={50}
					unit="px"
				/>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.priceCalculatorTypography}
					onChange={(value: any) => setAttributes({ priceCalculatorTypography: value })}
				/>
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.priceCalculatorTextColor}
					onChange={(value: string | undefined) =>
						setAttributes({ priceCalculatorTextColor: value ?? '' })
					}
				/>
				<TypographyControl
					label={__('Typography (Total)', 'voxel-fse')}
					value={attributes.priceCalculatorTotalTypography}
					onChange={(value: any) =>
						setAttributes({ priceCalculatorTotalTypography: value })
					}
				/>
				<ColorControl
					label={__('Text color (Total)', 'voxel-fse')}
					value={attributes.priceCalculatorTotalTextColor}
					onChange={(value: string | undefined) =>
						setAttributes({ priceCalculatorTotalTextColor: value ?? '' })
					}
				/>
			</AccordionPanel>

			{/* Loading / Out of Stock Section */}
			<AccordionPanel
				id="loading-out-of-stock"
				title={__('Loading / Out of stock', 'voxel-fse')}
			>
				<SectionHeading label={__('Loading', 'voxel-fse')} />
				<ColorControl
					label={__('Color 1', 'voxel-fse')}
					value={attributes.loadingColor1}
					onChange={(value: string | undefined) => setAttributes({ loadingColor1: value ?? '' })}
				/>
				<ColorControl
					label={__('Color 2', 'voxel-fse')}
					value={attributes.loadingColor2}
					onChange={(value: string | undefined) => setAttributes({ loadingColor2: value ?? '' })}
				/>

				<SectionHeading label={__('Out of stock', 'voxel-fse')} />
				<SliderControl
					label={__('Content gap', 'voxel-fse')}
					value={attributes.outOfStockContentGap}
					onChange={(value: number | undefined) => setAttributes({ outOfStockContentGap: value ?? 15 })}
					min={0}
					max={100}
					unit="px"
				/>
				<SliderControl
					label={__('Icon size', 'voxel-fse')}
					value={attributes.outOfStockIconSize}
					onChange={(value: number | undefined) => setAttributes({ outOfStockIconSize: value ?? 40 })}
					min={0}
					max={100}
					unit="px"
				/>
				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.outOfStockIconColor}
					onChange={(value: string | undefined) => setAttributes({ outOfStockIconColor: value ?? '' })}
				/>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.outOfStockTypography}
					onChange={(value: any) => setAttributes({ outOfStockTypography: value })}
				/>
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.outOfStockTextColor}
					onChange={(value: string | undefined) => setAttributes({ outOfStockTextColor: value ?? '' })}
				/>
			</AccordionPanel>

			{/* Number Stepper Section */}
			<AccordionPanel id="number-stepper" title={__('Number stepper', 'voxel-fse')}>
				<StateTabPanel
				attributeName="stepperState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SliderControl
										label={__('Input value size', 'voxel-fse')}
										value={attributes.stepperInputSize}
										onChange={(value: number | undefined) =>
											setAttributes({ stepperInputSize: value ?? 16 })
										}
										min={13}
										max={30}
										unit="px"
									/>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.stepperButtonIconColor}
										onChange={(value: string | undefined) =>
											setAttributes({ stepperButtonIconColor: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.stepperButtonBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ stepperButtonBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.stepperButtonBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) =>
											setAttributes({ stepperButtonBorder: value })
										}
									/>
									<SliderControl
										label={__('Button border radius', 'voxel-fse')}
										value={attributes.stepperButtonBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ stepperButtonBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										unit="px"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.stepperButtonIconColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ stepperButtonIconColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.stepperButtonBackgroundHover}
										onChange={(value: string | undefined) =>
											setAttributes({
												stepperButtonBackgroundHover: value ?? '',
											})
										}
									/>
									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.stepperButtonBorderColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({
												stepperButtonBorderColorHover: value ?? '',
											})
										}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Cards Style Section */}
			<AccordionPanel id="cards-style" title={__('Cards', 'voxel-fse')}>
				<StateTabPanel
				attributeName="cardsState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Cards', 'voxel-fse')} />
									<SliderControl
										label={__('Gap', 'voxel-fse')}
										value={attributes.cardsGap}
										onChange={(value: number | undefined) => setAttributes({ cardsGap: value ?? 10 })}
										min={0}
										max={100}
										unit="px"
									/>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.cardsBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.cardsBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) => setAttributes({ cardsBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.cardsBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ cardsBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										unit="px"
									/>

									<SectionHeading label={__('Text', 'voxel-fse')} />
									<TypographyControl
										label={__('Primary', 'voxel-fse')}
										value={attributes.cardsPrimaryTypography}
										onChange={(value: any) =>
											setAttributes({ cardsPrimaryTypography: value })
										}
									/>
									<ColorControl
										label={__('Primary Color', 'voxel-fse')}
										value={attributes.cardsPrimaryColor}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsPrimaryColor: value ?? '' })
										}
									/>
									<TypographyControl
										label={__('Secondary', 'voxel-fse')}
										value={attributes.cardsSecondaryTypography}
										onChange={(value: any) =>
											setAttributes({ cardsSecondaryTypography: value })
										}
									/>
									<ColorControl
										label={__('Secondary Color', 'voxel-fse')}
										value={attributes.cardsSecondaryColor}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsSecondaryColor: value ?? '' })
										}
									/>
									<TypographyControl
										label={__('Price', 'voxel-fse')}
										value={attributes.cardsPriceTypography}
										onChange={(value: any) =>
											setAttributes({ cardsPriceTypography: value })
										}
									/>
									<ColorControl
										label={__('Price color Color', 'voxel-fse')}
										value={attributes.cardsPriceColor}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsPriceColor: value ?? '' })
										}
									/>

									<SectionHeading label={__('Image', 'voxel-fse')} />
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.cardsImageBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ cardsImageBorderRadius: value ?? 0 })
										}
										min={0}
										max={100}
										unit="px"
									/>
									<SliderControl
										label={__('Size', 'voxel-fse')}
										value={attributes.cardsImageSize}
										onChange={(value: number | undefined) =>
											setAttributes({ cardsImageSize: value ?? 60 })
										}
										min={20}
										max={200}
										unit="px"
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.cardsSelectedBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsSelectedBackground: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.cardsSelectedBorderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ cardsSelectedBorderColor: value ?? '' })
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="cardsSelectedBoxShadow"
									/>
									<TypographyControl
										label={__('Primary text', 'voxel-fse')}
										value={attributes.cardsSelectedPrimaryTypography}
										onChange={(value: any) =>
											setAttributes({ cardsSelectedPrimaryTypography: value })
										}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Buttons Section */}
			<AccordionPanel id="buttons" title={__('Buttons', 'voxel-fse')}>
				<StateTabPanel
				attributeName="buttonsState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SliderControl
										label={__('Gap', 'voxel-fse')}
										value={attributes.buttonsGap}
										onChange={(value: number | undefined) => setAttributes({ buttonsGap: value ?? 10 })}
										min={0}
										max={100}
										unit="px"
									/>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.buttonsBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ buttonsBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.buttonsBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) => setAttributes({ buttonsBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.buttonsBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ buttonsBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										unit="px"
									/>
									<TypographyControl
										label={__('Text', 'voxel-fse')}
										value={attributes.buttonsTextTypography}
										onChange={(value: any) =>
											setAttributes({ buttonsTextTypography: value })
										}
									/>
									<ColorControl
										label={__('Text Color', 'voxel-fse')}
										value={attributes.buttonsTextColor}
										onChange={(value: string | undefined) =>
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
										onChange={(value: string | undefined) =>
											setAttributes({ buttonsSelectedBackground: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.buttonsSelectedBorderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ buttonsSelectedBorderColor: value ?? '' })
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="buttonsSelectedBoxShadow"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Dropdown Section */}
			<AccordionPanel id="dropdown" title={__('Dropdown', 'voxel-fse')}>
				<StateTabPanel
				attributeName="dropdownState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'filled', title: __('Filled', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Style', 'voxel-fse')} />
									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										value={attributes.dropdownTypography}
										onChange={(value: any) =>
											setAttributes({ dropdownTypography: value })
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="dropdownBoxShadow"
									/>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.dropdownBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownBackground: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.dropdownTextColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownTextColor: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.dropdownBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) =>
											setAttributes({ dropdownBorder: value })
										}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.dropdownBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ dropdownBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										unit="px"
									/>

									<SectionHeading label={__('Icons', 'voxel-fse')} />
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.dropdownIconColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownIconColor: value ?? '' })
										}
									/>
									<SliderControl
										label={__('Icon size', 'voxel-fse')}
										value={attributes.dropdownIconSize}
										onChange={(value: number | undefined) =>
											setAttributes({ dropdownIconSize: value ?? 24 })
										}
										min={0}
										max={50}
										unit="px"
									/>
									<SliderControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										value={attributes.dropdownIconTextSpacing}
										onChange={(value: number | undefined) =>
											setAttributes({ dropdownIconTextSpacing: value ?? 10 })
										}
										min={0}
										max={50}
										unit="px"
									/>

									<SectionHeading label={__('Chevron', 'voxel-fse')} />
									<ToggleControl
										label={__('Hide chevron', 'voxel-fse')}
										checked={attributes.dropdownHideChevron}
										onChange={(value: boolean) =>
											setAttributes({ dropdownHideChevron: value })
										}
									/>
									<ColorControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.dropdownChevronColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownChevronColor: value ?? '' })
										}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<SectionHeading label={__('Style', 'voxel-fse')} />
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.dropdownBackgroundHover}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownBackgroundHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.dropdownTextColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownTextColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.dropdownBorderColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownBorderColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.dropdownIconColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownIconColorHover: value ?? '' })
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="dropdownBoxShadowHover"
									/>
								</>
							)}

							{tab.name === 'filled' && (
								<>
									<SectionHeading label={__('Style (Filled)', 'voxel-fse')} />
									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										value={attributes.dropdownFilledTypography}
										onChange={(value: any) =>
											setAttributes({ dropdownFilledTypography: value })
										}
									/>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.dropdownFilledBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownFilledBackground: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.dropdownFilledTextColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownFilledTextColor: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.dropdownFilledIconColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownFilledIconColor: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.dropdownFilledBorderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ dropdownFilledBorderColor: value ?? '' })
										}
									/>
									<SliderControl
										label={__('Border width', 'voxel-fse')}
										value={attributes.dropdownFilledBorderWidth}
										onChange={(value: number | undefined) =>
											setAttributes({ dropdownFilledBorderWidth: value ?? 0 })
										}
										min={0}
										max={10}
										unit="px"
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="dropdownFilledBoxShadow"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Radio/Checkboxes Section */}
			<AccordionPanel
				id="radio-checkboxes"
				title={__('Radio/Checkboxes', 'voxel-fse')}
			>
				<StateTabPanel
				attributeName="radioCheckboxState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<ColorControl
										label={__('Border-color', 'voxel-fse')}
										value={attributes.radioCheckboxBorderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ radioCheckboxBorderColor: value ?? '' })
										}
									/>
									<TypographyControl
										label={__('Text', 'voxel-fse')}
										value={attributes.radioCheckboxTextTypography}
										onChange={(value: any) =>
											setAttributes({ radioCheckboxTextTypography: value })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.radioCheckboxTextColor}
										onChange={(value: string | undefined) =>
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
										onChange={(value: string | undefined) =>
											setAttributes({
												radioCheckboxSelectedBackground: value ?? '',
											})
										}
									/>
									<TypographyControl
										label={__('Text', 'voxel-fse')}
										value={attributes.radioCheckboxSelectedTextTypography}
										onChange={(value: any) =>
											setAttributes({
												radioCheckboxSelectedTextTypography: value,
											})
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.radioCheckboxSelectedTextColor}
										onChange={(value: string | undefined) =>
											setAttributes({
												radioCheckboxSelectedTextColor: value ?? '',
											})
										}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="radioCheckboxSelectedBoxShadow"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Switcher Section */}
			<AccordionPanel id="switcher" title={__('Switcher', 'voxel-fse')}>
				<SectionHeading label={__('Switch slider', 'voxel-fse')} />
				<ColorControl
					label={__('Background (Inactive)', 'voxel-fse')}
					value={attributes.switcherBackgroundInactive}
					onChange={(value: string | undefined) =>
						setAttributes({ switcherBackgroundInactive: value ?? '' })
					}
				/>
				<ColorControl
					label={__('Background (Active)', 'voxel-fse')}
					value={attributes.switcherBackgroundActive}
					onChange={(value: string | undefined) =>
						setAttributes({ switcherBackgroundActive: value ?? '' })
					}
				/>
				<ColorControl
					label={__('Handle background', 'voxel-fse')}
					value={attributes.switcherHandleBackground}
					onChange={(value: string | undefined) =>
						setAttributes({ switcherHandleBackground: value ?? '' })
					}
				/>
			</AccordionPanel>

			{/* Images Section */}
			<AccordionPanel id="images" title={__('Images', 'voxel-fse')}>
				<StateTabPanel
				attributeName="imagesState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SliderControl
										label={__('Gap', 'voxel-fse')}
										value={attributes.imagesGap}
										onChange={(value: number | undefined) => setAttributes({ imagesGap: value ?? 10 })}
										min={0}
										max={50}
										unit="px"
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.imagesBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ imagesBorderRadius: value ?? 0 })
										}
										min={0}
										max={100}
										unit="px"
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.imagesSelectedBorderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ imagesSelectedBorderColor: value ?? '' })
										}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Colors Section */}
			<AccordionPanel id="colors" title={__('Colors', 'voxel-fse')}>
				<SliderControl
					label={__('Gap', 'voxel-fse')}
					value={attributes.colorsGap}
					onChange={(value: number | undefined) => setAttributes({ colorsGap: value ?? 10 })}
					min={0}
					max={50}
					unit="px"
				/>
				<SliderControl
					label={__('Size', 'voxel-fse')}
					value={attributes.colorsSize}
					onChange={(value: number | undefined) => setAttributes({ colorsSize: value ?? 30 })}
					min={10}
					max={100}
					unit="px"
				/>
				<SliderControl
					label={__('Border radius', 'voxel-fse')}
					value={attributes.colorsBorderRadius}
					onChange={(value: number | undefined) => setAttributes({ colorsBorderRadius: value ?? 50 })}
					min={0}
					max={100}
					unit="px"
				/>
				<ColorControl
					label={__('Inset color', 'voxel-fse')}
					value={attributes.colorsInsetColor}
					onChange={(value: string | undefined) => setAttributes({ colorsInsetColor: value ?? '' })}
				/>
			</AccordionPanel>

			{/* Input and Textarea Section */}
			<AccordionPanel
				id="input-textarea"
				title={__('Input and Textarea', 'voxel-fse')}
			>
				<StateTabPanel
				attributeName="inputTextareaState"
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Placeholder', 'voxel-fse')} />
									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColor}
										onChange={(value: string | undefined) =>
											setAttributes({ inputPlaceholderColor: value ?? '' })
										}
									/>
									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										value={attributes.inputPlaceholderTypography}
										onChange={(value: any) =>
											setAttributes({ inputPlaceholderTypography: value })
										}
									/>

									<SectionHeading label={__('Value', 'voxel-fse')} />
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputValueColor}
										onChange={(value: string | undefined) =>
											setAttributes({ inputValueColor: value ?? '' })
										}
									/>
									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										value={attributes.inputValueTypography}
										onChange={(value: any) =>
											setAttributes({ inputValueTypography: value })
										}
									/>

									<SectionHeading label={__('General', 'voxel-fse')} />
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackground}
										onChange={(value: string | undefined) =>
											setAttributes({ inputBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.inputBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value: any) => setAttributes({ inputBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.inputBorderRadius}
										onChange={(value: number | undefined) =>
											setAttributes({ inputBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										unit="px"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundHover}
										onChange={(value: string | undefined) =>
											setAttributes({ inputBackgroundHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ inputBorderColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColorHover}
										onChange={(value: string | undefined) =>
											setAttributes({ inputPlaceholderColorHover: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorHover}
										onChange={(value: string | undefined) =>
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
										onChange={(value: string | undefined) =>
											setAttributes({ inputBackgroundActive: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorActive}
										onChange={(value: string | undefined) =>
											setAttributes({ inputBorderColorActive: value ?? '' })
										}
									/>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorActive}
										onChange={(value: string | undefined) =>
											setAttributes({ inputTextColorActive: value ?? '' })
										}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
