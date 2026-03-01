/**
 * Create Post Block - Field Style Tab Inspector Controls
 *
 * Converted from Voxel Elementor widget Field Style tab.
 * Source: themes/voxel/app/widgets/create-post.php
 *
 * Contains 18 accordion sections:
 * 1. Form: Fields general
 * 2. Form: Input & Textarea (Normal/Hover/Active)
 * 3. Form: Input suffix
 * 4. Form: Popup button (Normal/Hover/Filled)
 * 5. Form: Inline Terms/List (Normal/Hover/Selected)
 * 6. Form: Inline Checkbox
 * 7. Form: Inline Radio
 * 8. Form: Switcher
 * 9. Form: Number stepper (Normal/Hover)
 * 10. Form: Repeater
 * 11. Form: Repeater head
 * 12. Repeater: Icon button (Normal/Hover)
 * 13. Form: Heading
 * 14. Form: Image
 * 15. Form: Availability calendar
 * 16. Form: Calendar buttons (Normal/Hover)
 * 17. Form: Attributes (Normal/Hover)
 * 18. Form: Color field
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	ResponsiveColorControl,
	ResponsiveRangeControl,
	TypographyControl,
	BorderGroupControl,
	BoxShadowPopup,
	StateTabPanel,
	DimensionsControl,
} from '@shared/controls';
import type { CreatePostFieldStyleAttributes } from '../types';

interface FieldStyleTabProps {
	attributes: CreatePostFieldStyleAttributes;
	setAttributes: (attrs: Partial<CreatePostFieldStyleAttributes>) => void;
}

export function FieldStyleTab({
	attributes,
	setAttributes,
}: FieldStyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, unknown>}
			setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
			stateAttribute="fieldStyleTabOpenPanel"
			defaultPanel="fields-general"
		>
			{/* =====================================================
			    1. FORM: FIELDS GENERAL
			    ===================================================== */}
			<AccordionPanel id="fields-general" title={__('Form: Fields general', 'voxel-fse')}>
				<SectionHeading label={__('Field label', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.fieldLabelTypo}
					onChange={(value) => setAttributes({ fieldLabelTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="fieldLabelColor"
				/>

				<SectionHeading label={__('Field validation', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.fieldValidationTypo}
					onChange={(value) => setAttributes({ fieldValidationTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Default Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="fieldValidationColor"
				/>

				<ResponsiveColorControl
					label={__('Error Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="fieldErrorColor"
				/>
			</AccordionPanel>

			{/* =====================================================
			    2. FORM: INPUT & TEXTAREA (Normal/Hover/Active)
			    ===================================================== */}
			<AccordionPanel id="input-textarea" title={__('Form: Input & Textarea', 'voxel-fse')}>
				<StateTabPanel
					attributeName="inputTextareaActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Placeholder', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Placeholder color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputPlaceholderColor"
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.inputPlaceholderTypo}
									onChange={(value) => setAttributes({ inputPlaceholderTypo: value })}
								/>

								<SectionHeading label={__('Value', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputTextColor"
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.inputTextTypo}
									onChange={(value) => setAttributes({ inputTextTypo: value })}
								/>

								<SectionHeading label={__('General', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputBgColor"
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.inputBorder as any}
									onChange={(value) => setAttributes({ inputBorder: value })}
									hideRadius={true}
									/>

								<SectionHeading label={__('Input', 'voxel-fse')} />

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="inputBorderRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="inputHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={200}
									units={['px']}
								/>

								<SectionHeading label={__('Textarea', 'voxel-fse')} />

								<DimensionsControl
									label={__('Padding', 'voxel-fse')}
									values={attributes.textareaPadding || {}}
									onChange={(values) => setAttributes({ textareaPadding: values })}
								/>

								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="textareaHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={500}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="textareaBorderRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<SectionHeading label={__('Input with icon', 'voxel-fse')} />

								<DimensionsControl
									label={__('Padding', 'voxel-fse')}
									values={attributes.inputIconPadding || {}}
									onChange={(values) => setAttributes({ inputIconPadding: values })}
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputIconColor"
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="inputIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Icon side padding', 'voxel-fse')}
									attributeBaseName="inputIconSidePadding"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputBgColorHover"
								/>

								<ResponsiveColorControl
									label={__('Border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputBorderColorHover"
								/>

								<ResponsiveColorControl
									label={__('Placeholder color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputPlaceholderColorHover"
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputTextColorHover"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputIconColorHover"
								/>
							</>
						) : (
							<>
								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputBgColorActive"
								/>

								<ResponsiveColorControl
									label={__('Border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputBorderColorActive"
								/>

								<ResponsiveColorControl
									label={__('Placeholder color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputPlaceholderColorActive"
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inputTextColorActive"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    3. FORM: INPUT SUFFIX
			    ===================================================== */}
			<AccordionPanel id="input-suffix" title={__('Form: Input suffix', 'voxel-fse')}>
				<TypographyControl
					label={__('Button typography', 'voxel-fse')}
					value={attributes.inputSuffixTypo}
					onChange={(value) => setAttributes({ inputSuffixTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Text color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="inputSuffixTextColor"
				/>

				<ResponsiveColorControl
					label={__('Background color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="inputSuffixBgColor"
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="inputSuffixRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="inputSuffixShadow"
				/>

				<ResponsiveRangeControl
					label={__('Side margin', 'voxel-fse')}
					attributeBaseName="inputSuffixMargin"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveColorControl
					label={__('Icon color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="inputSuffixIconColor"
				/>
			</AccordionPanel>

			{/* =====================================================
			    4. FORM: POPUP BUTTON (Normal/Hover/Filled)
			    ===================================================== */}
			<AccordionPanel id="popup-button" title={__('Form: Popup button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="popupBtnActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'filled', title: __('Filled', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Style', 'voxel-fse')} />

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.popupBtnTypo}
									onChange={(value) => setAttributes({ popupBtnTypo: value })}
								/>

								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									shadowAttributeName="popupBtnShadow"
								/>

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnBgColor"
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnTextColor"
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.popupBtnBorder as any}
									onChange={(value) => setAttributes({ popupBtnBorder: value })}
									hideRadius={true}
									/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="popupBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="popupBtnHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={200}
									units={['px']}
								/>

								<SectionHeading label={__('Icons', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnIconColor"
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="popupBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="popupBtnIconSpacing"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<SectionHeading label={__('Chevron', 'voxel-fse')} />

								<ToggleControl
									label={__('Hide chevron', 'voxel-fse')}
									checked={attributes.popupBtnChevronHide === true}
									onChange={(value: any) => setAttributes({ popupBtnChevronHide: value })}
								/>

								<ResponsiveColorControl
									label={__('Chevron color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnChevronColor"
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<SectionHeading label={__('Style', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnBgColorHover"
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnTextColorHover"
								/>

								<ResponsiveColorControl
									label={__('Border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnBorderColorHover"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnIconColorHover"
								/>

								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									shadowAttributeName="popupBtnShadowHover"
								/>
							</>
						) : (
							<>
								<SectionHeading label={__('Style (Filled)', 'voxel-fse')} />

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.popupBtnTypoFilled}
									onChange={(value) => setAttributes({ popupBtnTypoFilled: value })}
								/>

								<ResponsiveColorControl
									label={__('Background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnBgColorFilled"
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnTextColorFilled"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnIconColorFilled"
								/>

								<ResponsiveColorControl
									label={__('Border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="popupBtnBorderColorFilled"
								/>

								<ResponsiveRangeControl
									label={__('Border width', 'voxel-fse')}
									attributeBaseName="popupBtnBorderWidthFilled"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={20}
									units={['px']}
								/>

								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									shadowAttributeName="popupBtnShadowFilled"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    5. FORM: INLINE TERMS/LIST (Normal/Hover/Selected)
			    ===================================================== */}
			<AccordionPanel id="inline-terms" title={__('Form: Inline Terms/List', 'voxel-fse')}>
				<StateTabPanel
					attributeName="inlineTermsActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('List item', 'voxel-fse')} />

								<SectionHeading label={__('Title', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Title color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsTitleColor"
								/>

								<TypographyControl
									label={__('Title typography', 'voxel-fse')}
									value={attributes.inlineTermsTitleTypo}
									onChange={(value) => setAttributes({ inlineTermsTitleTypo: value })}
								/>

								<SectionHeading label={__('Icon', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsIconColor"
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="inlineTermsIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<SectionHeading label={__('Icon container', 'voxel-fse')} />

								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributeBaseName="inlineTermsIconContainerSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={200}
									units={['px']}
								/>

								<ResponsiveColorControl
									label={__('Background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsIconContainerBg"
								/>

								<ResponsiveRangeControl
									label={__('Radius', 'voxel-fse')}
									attributeBaseName="inlineTermsIconContainerRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="inlineTermsIconSpacing"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<SectionHeading label={__('Chevron', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Chevron color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsChevronColor"
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<SectionHeading label={__('Term item', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('List item background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsBgHover"
								/>

								<ResponsiveColorControl
									label={__('Title color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsTitleColorHover"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsIconColorHover"
								/>
							</>
						) : (
							<>
								<TypographyControl
									label={__('Title typography', 'voxel-fse')}
									value={attributes.inlineTermsTitleTypoSelected}
									onChange={(value) => setAttributes({ inlineTermsTitleTypoSelected: value })}
								/>

								<ResponsiveColorControl
									label={__('Title color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsTitleColorSelected"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="inlineTermsIconColorSelected"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    6. FORM: INLINE CHECKBOX
			    ===================================================== */}
			<AccordionPanel id="inline-checkbox" title={__('Form: Inline Checkbox', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Checkbox size', 'voxel-fse')}
					attributeBaseName="checkboxSize"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Checkbox radius', 'voxel-fse')}
					attributeBaseName="checkboxRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.checkboxBorder as any}
					onChange={(value) => setAttributes({ checkboxBorder: value })}
					hideRadius={true}
					/>

				<ResponsiveColorControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="checkboxBgUnchecked"
				/>

				<ResponsiveColorControl
					label={__('Background color (checked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="checkboxBgChecked"
				/>

				<ResponsiveColorControl
					label={__('Border-color (checked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="checkboxBorderChecked"
				/>
			</AccordionPanel>

			{/* =====================================================
			    7. FORM: INLINE RADIO
			    ===================================================== */}
			<AccordionPanel id="inline-radio" title={__('Form: Inline Radio', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Radio size', 'voxel-fse')}
					attributeBaseName="radioSize"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Radio radius', 'voxel-fse')}
					attributeBaseName="radioRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.radioBorder as any}
					onChange={(value) => setAttributes({ radioBorder: value })}
					hideRadius={true}
					/>

				<ResponsiveColorControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="radioBgUnchecked"
				/>

				<ResponsiveColorControl
					label={__('Background color (checked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="radioBgChecked"
				/>

				<ResponsiveColorControl
					label={__('Border-color (checked)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="radioBorderChecked"
				/>
			</AccordionPanel>

			{/* =====================================================
			    8. FORM: SWITCHER
			    ===================================================== */}
			<AccordionPanel id="switcher" title={__('Form: Switcher', 'voxel-fse')}>
				<SectionHeading label={__('Switch slider', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Background (Inactive)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="switcherBgInactive"
				/>

				<ResponsiveColorControl
					label={__('Background (Active)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="switcherBgActive"
				/>

				<ResponsiveColorControl
					label={__('Handle background', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="switcherHandleBg"
				/>
			</AccordionPanel>

			{/* =====================================================
			    9. FORM: NUMBER STEPPER (Normal/Hover)
			    ===================================================== */}
			<AccordionPanel id="number-stepper" title={__('Form: Number stepper', 'voxel-fse')}>
				<StateTabPanel
					attributeName="numberStepperActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ResponsiveRangeControl
									label={__('Input value size', 'voxel-fse')}
									attributeBaseName="stepperInputSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stepperBtnIconColor"
								/>

								<ResponsiveColorControl
									label={__('Button background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stepperBtnBg"
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.stepperBtnBorder as any}
									onChange={(value) => setAttributes({ stepperBtnBorder: value })}
									hideRadius={true}
									/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="stepperBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
							</>
						) : (
							<>
								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stepperBtnIconColorHover"
								/>

								<ResponsiveColorControl
									label={__('Button background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stepperBtnBgHover"
								/>

								<ResponsiveColorControl
									label={__('Button border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stepperBtnBorderColorHover"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    10. FORM: REPEATER
			    ===================================================== */}
			<AccordionPanel id="repeater" title={__('Form: Repeater', 'voxel-fse')}>
				<ResponsiveColorControl
					label={__('Background', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterBg"
				/>

				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.repeaterBorder as any}
					onChange={(value) => setAttributes({ repeaterBorder: value })}
					hideRadius={true}
					/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="repeaterRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="repeaterShadow"
				/>
			</AccordionPanel>

			{/* =====================================================
			    11. FORM: REPEATER HEAD
			    ===================================================== */}
			<AccordionPanel id="repeater-head" title={__('Form: Repeater head', 'voxel-fse')}>
				<SectionHeading label={__('Secondary text', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterHeadSecondaryColor"
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.repeaterHeadSecondaryTypo}
					onChange={(value) => setAttributes({ repeaterHeadSecondaryTypo: value })}
				/>

				<SectionHeading label={__('Other', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Icon color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterHeadIconColor"
				/>

				<ResponsiveColorControl
					label={__('Icon color (Success)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterHeadIconColorSuccess"
				/>

				<ResponsiveColorControl
					label={__('Icon color (Warning)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterHeadIconColorWarning"
				/>

				<ResponsiveColorControl
					label={__('Border color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="repeaterHeadBorderColor"
				/>

				<ResponsiveRangeControl
					label={__('Border width', 'voxel-fse')}
					attributeBaseName="repeaterHeadBorderWidth"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={20}
					units={['px']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    12. REPEATER: ICON BUTTON (Normal/Hover)
			    ===================================================== */}
			<AccordionPanel id="repeater-icon-btn" title={__('Repeater: Icon button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="repeaterIconBtnActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Button styling', 'voxel-fse')} />

								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="repeaterIconBtnColor"
								/>

								<ResponsiveColorControl
									label={__('Button background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="repeaterIconBtnBg"
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.repeaterIconBtnBorder as any}
									onChange={(value) => setAttributes({ repeaterIconBtnBorder: value })}
									hideRadius={true}
									/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="repeaterIconBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
							</>
						) : (
							<>
								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="repeaterIconBtnColorHover"
								/>

								<ResponsiveColorControl
									label={__('Button background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="repeaterIconBtnBgHover"
								/>

								<ResponsiveColorControl
									label={__('Button border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="repeaterIconBtnBorderColorHover"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    13. FORM: HEADING
			    ===================================================== */}
			<AccordionPanel id="form-heading" title={__('Form: Heading', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.formHeadingTypo}
					onChange={(value) => setAttributes({ formHeadingTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="formHeadingColor"
				/>
			</AccordionPanel>

			{/* =====================================================
			    14. FORM: IMAGE
			    ===================================================== */}
			<AccordionPanel id="form-image" title={__('Form: Image', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Width', 'voxel-fse')}
					attributeBaseName="formImageWidth"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={500}
					units={['px', '%']}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="formImageRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    15. FORM: AVAILABILITY CALENDAR
			    ===================================================== */}
			<AccordionPanel id="availability-calendar" title={__('Form: Availability calendar', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Content spacing', 'voxel-fse')}
					attributeBaseName="calContentSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveColorControl
					label={__('Background', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calBg"
				/>

				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.calBorder as any}
					onChange={(value) => setAttributes({ calBorder: value })}
					hideRadius={true}
					/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="calBorderRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="calShadow"
				/>

				<SectionHeading label={__('Months', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.calMonthTypo}
					onChange={(value) => setAttributes({ calMonthTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calMonthColor"
				/>

				<SectionHeading label={__('Days of the week', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.calDayTypo}
					onChange={(value) => setAttributes({ calDayTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDayColor"
				/>

				<SectionHeading label={__('Dates (available)', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.calDateAvailTypo}
					onChange={(value) => setAttributes({ calDateAvailTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateAvailColor"
				/>

				<ResponsiveColorControl
					label={__('Color (Hover)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateAvailColorHover"
				/>

				<ResponsiveColorControl
					label={__('Background', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateAvailBg"
				/>

				<ResponsiveColorControl
					label={__('Background (Hover)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateAvailBgHover"
				/>

				<SectionHeading label={__('Dates (Disabled)', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Linethrough color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateDisabledLine"
				/>

				<SectionHeading label={__('Dates (unavailable)', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.calDateUnavailTypo}
					onChange={(value) => setAttributes({ calDateUnavailTypo: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="calDateUnavailColor"
				/>

				<SectionHeading label={__('Other settings', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="calOtherRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    16. FORM: CALENDAR BUTTONS (Normal/Hover)
			    ===================================================== */}
			<AccordionPanel id="calendar-buttons" title={__('Form: Calendar buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="calBtnActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Button styling', 'voxel-fse')} />

								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributeBaseName="calBtnSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="calBtnIconColor"
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributeBaseName="calBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveColorControl
									label={__('Button background', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="calBtnBg"
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.calBtnBorder as any}
									onChange={(value) => setAttributes({ calBtnBorder: value })}
									hideRadius={true}
									/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="calBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
							</>
						) : (
							<>
								<ResponsiveColorControl
									label={__('Button icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="calBtnIconColorHover"
								/>

								<ResponsiveColorControl
									label={__('Button background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="calBtnBgHover"
								/>

								<ResponsiveColorControl
									label={__('Button border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="calBtnBorderColorHover"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    17. FORM: ATTRIBUTES (Normal/Hover)
			    ===================================================== */}
			<AccordionPanel id="form-attributes" title={__('Form: Attributes', 'voxel-fse')}>
				<StateTabPanel
					attributeName="formAttrActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.formAttrTypo}
									onChange={(value) => setAttributes({ formAttrTypo: value })}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="formAttrRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="formAttrTextColor"
								/>

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="formAttrBgColor"
								/>
							</>
						) : (
							<>
								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="formAttrTextColorHover"
								/>

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="formAttrBgColorHover"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    18. FORM: COLOR FIELD
			    ===================================================== */}
			<AccordionPanel id="color-field" title={__('Form: Color field', 'voxel-fse')}>
				<SectionHeading label={__('Placeholder', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Placeholder color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="colorFieldPlaceholder"
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.colorFieldPlaceholderTypo}
					onChange={(value) => setAttributes({ colorFieldPlaceholderTypo: value })}
				/>

				<SectionHeading label={__('Value', 'voxel-fse')} />

				<ResponsiveColorControl
					label={__('Text color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="colorFieldTextColor"
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.colorFieldTextTypo}
					onChange={(value) => setAttributes({ colorFieldTextTypo: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
