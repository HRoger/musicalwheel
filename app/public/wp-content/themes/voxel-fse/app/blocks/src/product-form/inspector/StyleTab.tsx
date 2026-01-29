/**
 * Product Form Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains all style-related accordions
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl } from '@wordpress/components';
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
					onChange={(value) => setAttributes({ fieldLabelTypography: value })}
				/>
				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldLabelColor}
					onChange={(value) => setAttributes({ fieldLabelColor: value ?? '' })}
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
										onChange={(value) =>
											setAttributes({ primaryButtonTypography: value })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.primaryButtonBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) =>
											setAttributes({ primaryButtonBorder: value })
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
										units={['px']}
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
										units={['px']}
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
										units={['px']}
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
										onChange={(value) =>
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
					onChange={(value) =>
						setAttributes({ priceCalculatorListSpacing: value ?? 10 })
					}
					min={0}
					max={50}
					units={['px']}
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
					onChange={(value) => setAttributes({ loadingColor1: value ?? '' })}
				/>
				<ColorControl
					label={__('Color 2', 'voxel-fse')}
					value={attributes.loadingColor2}
					onChange={(value) => setAttributes({ loadingColor2: value ?? '' })}
				/>

				<SectionHeading label={__('Out of stock', 'voxel-fse')} />
				<SliderControl
					label={__('Content gap', 'voxel-fse')}
					value={attributes.outOfStockContentGap}
					onChange={(value) => setAttributes({ outOfStockContentGap: value ?? 15 })}
					min={0}
					max={100}
					units={['px']}
				/>
				<SliderControl
					label={__('Icon size', 'voxel-fse')}
					value={attributes.outOfStockIconSize}
					onChange={(value) => setAttributes({ outOfStockIconSize: value ?? 40 })}
					min={0}
					max={100}
					units={['px']}
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
										onChange={(value) =>
											setAttributes({ stepperInputSize: value ?? 16 })
										}
										min={13}
										max={30}
										units={['px']}
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
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.stepperButtonBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) =>
											setAttributes({ stepperButtonBorder: value })
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
										units={['px']}
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
											setAttributes({
												stepperButtonBackgroundHover: value ?? '',
											})
										}
									/>
									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.stepperButtonBorderColorHover}
										onChange={(value) =>
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
										onChange={(value) => setAttributes({ cardsGap: value ?? 10 })}
										min={0}
										max={100}
										units={['px']}
									/>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.cardsBackground}
										onChange={(value) =>
											setAttributes({ cardsBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.cardsBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) => setAttributes({ cardsBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.cardsBorderRadius}
										onChange={(value) =>
											setAttributes({ cardsBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										units={['px']}
									/>

									<SectionHeading label={__('Text', 'voxel-fse')} />
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

									<SectionHeading label={__('Image', 'voxel-fse')} />
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.cardsImageBorderRadius}
										onChange={(value) =>
											setAttributes({ cardsImageBorderRadius: value ?? 0 })
										}
										min={0}
										max={100}
										units={['px']}
									/>
									<SliderControl
										label={__('Size', 'voxel-fse')}
										value={attributes.cardsImageSize}
										onChange={(value) =>
											setAttributes({ cardsImageSize: value ?? 60 })
										}
										min={20}
										max={200}
										units={['px']}
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
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="cardsSelectedBoxShadow"
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
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Buttons Section */}
			<AccordionPanel id="buttons" title={__('Buttons', 'voxel-fse')}>
				<StateTabPanel
t			attributeName="buttonsState"
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
										onChange={(value) => setAttributes({ buttonsGap: value ?? 10 })}
										min={0}
										max={100}
										units={['px']}
									/>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.buttonsBackground}
										onChange={(value) =>
											setAttributes({ buttonsBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.buttonsBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) => setAttributes({ buttonsBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.buttonsBorderRadius}
										onChange={(value) =>
											setAttributes({ buttonsBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										units={['px']}
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
t			attributeName="dropdownState"
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
										onChange={(value) =>
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
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.dropdownBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) =>
											setAttributes({ dropdownBorder: value })
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
										units={['px']}
									/>

									<SectionHeading label={__('Icons', 'voxel-fse')} />
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
										units={['px']}
									/>
									<SliderControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										value={attributes.dropdownIconTextSpacing}
										onChange={(value) =>
											setAttributes({ dropdownIconTextSpacing: value ?? 10 })
										}
										min={0}
										max={50}
										units={['px']}
									/>

									<SectionHeading label={__('Chevron', 'voxel-fse')} />
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
									<SectionHeading label={__('Style', 'voxel-fse')} />
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
										units={['px']}
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
t			attributeName="radioCheckboxState"
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
			</AccordionPanel>

			{/* Images Section */}
			<AccordionPanel id="images" title={__('Images', 'voxel-fse')}>
				<StateTabPanel
t			attributeName="imagesState"
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
										onChange={(value) => setAttributes({ imagesGap: value ?? 10 })}
										min={0}
										max={50}
										units={['px']}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.imagesBorderRadius}
										onChange={(value) =>
											setAttributes({ imagesBorderRadius: value ?? 0 })
										}
										min={0}
										max={100}
										units={['px']}
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
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Colors Section */}
			<AccordionPanel id="colors" title={__('Colors', 'voxel-fse')}>
				<SliderControl
					label={__('Gap', 'voxel-fse')}
					value={attributes.colorsGap}
					onChange={(value) => setAttributes({ colorsGap: value ?? 10 })}
					min={0}
					max={50}
					units={['px']}
				/>
				<SliderControl
					label={__('Size', 'voxel-fse')}
					value={attributes.colorsSize}
					onChange={(value) => setAttributes({ colorsSize: value ?? 30 })}
					min={10}
					max={100}
					units={['px']}
				/>
				<SliderControl
					label={__('Border radius', 'voxel-fse')}
					value={attributes.colorsBorderRadius}
					onChange={(value) => setAttributes({ colorsBorderRadius: value ?? 50 })}
					min={0}
					max={100}
					units={['px']}
				/>
				<ColorControl
					label={__('Inset color', 'voxel-fse')}
					value={attributes.colorsInsetColor}
					onChange={(value) => setAttributes({ colorsInsetColor: value ?? '' })}
				/>
			</AccordionPanel>

			{/* Input and Textarea Section */}
			<AccordionPanel
				id="input-textarea"
				title={__('Input and Textarea', 'voxel-fse')}
			>
				<StateTabPanel
t			attributeName="inputTextareaState"
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

									<SectionHeading label={__('Value', 'voxel-fse')} />
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

									<SectionHeading label={__('General', 'voxel-fse')} />
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackground}
										onChange={(value) =>
											setAttributes({ inputBackground: value ?? '' })
										}
									/>
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.inputBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
										onChange={(value) => setAttributes({ inputBorder: value })}
									/>
									<SliderControl
										label={__('Border radius', 'voxel-fse')}
										value={attributes.inputBorderRadius}
										onChange={(value) =>
											setAttributes({ inputBorderRadius: value ?? 0 })
										}
										min={0}
										max={50}
										units={['px']}
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
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
