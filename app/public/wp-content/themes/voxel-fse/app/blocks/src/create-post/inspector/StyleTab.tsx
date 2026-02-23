/**
 * Create Post Block - Style Tab Inspector Controls
 *
 * Converted from Voxel Elementor widget Style tab.
 * Source: themes/voxel/app/widgets/create-post.php:387-4944
 *
 * Contains 11 accordion sections:
 * 1. Form: Head
 * 2. Head: Next/Prev buttons
 * 3. Form: Footer
 * 4. Form: Primary button
 * 5. Form: Secondary button
 * 6. Form: Tertiary button
 * 7. Form: File/Gallery
 * 8. Form: Post submitted/Updated
 * 9. Form: Tooltips
 * 10. Form: Dialog
 * 11. Popups: Custom style
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	ColorControl,
	ResponsiveColorControl,
	ResponsiveRangeControl,
	TypographyControl,
	BorderGroupControl,
	BoxShadowPopup,
	StateTabPanel,
	PopupCustomStyleControl,
} from '@shared/controls';
import type { CreatePostStyleAttributes } from '../types';

interface StyleTabProps {
	attributes: CreatePostStyleAttributes;
	setAttributes: (attrs: Partial<CreatePostStyleAttributes>) => void;
}

export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, unknown>}
			setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="form-head"
		>
			{/* =====================================================
			    1. FORM: HEAD
			    Source: create-post.php:387-587
			    ===================================================== */}
			<AccordionPanel id="form-head" title={__('Form: Head', 'voxel-fse')}>
				<ToggleControl
					label={__('Hide', 'voxel-fse')}
					checked={attributes.headHide === true}
					onChange={(value: any) => setAttributes({ headHide: value })}
				/>

				<ResponsiveRangeControl
					label={__('Bottom spacing', 'voxel-fse')}
					attributeBaseName="headSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<SectionHeading label={__('Form steps bar', 'voxel-fse')} />

				<ToggleControl
					label={__('Hide', 'voxel-fse')}
					checked={attributes.stepsBarHide === true}
					onChange={(value: any) => setAttributes({ stepsBarHide: value })}
				/>

				<ResponsiveRangeControl
					label={__('Height', 'voxel-fse')}
					attributeBaseName="stepsBarHeight"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="stepsBarRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ResponsiveRangeControl
					label={__('Bottom spacing', 'voxel-fse')}
					attributeBaseName="percentageSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ColorControl
					label={__('Progress bar background', 'voxel-fse')}
					value={attributes.stepBarBg}
					onChange={(value) => setAttributes({ stepBarBg: value })}
				/>

				<ColorControl
					label={__('Progress background (Filled)', 'voxel-fse')}
					value={attributes.stepBarDone}
					onChange={(value) => setAttributes({ stepBarDone: value })}
				/>

				<SectionHeading label={__('Step heading', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.currentStepText}
					onChange={(value) => setAttributes({ currentStepText: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="currentStepCol"
				/>
			</AccordionPanel>

			{/* =====================================================
			    2. HEAD: NEXT/PREV BUTTONS
			    Source: create-post.php:589-771
			    ===================================================== */}
			<AccordionPanel id="head-nav" title={__('Head: Next/Prev buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="headNavActiveTab"
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
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.fnavBtnColor}
									onChange={(value) => setAttributes({ fnavBtnColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributeBaseName="fnavBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.fnavBtnBg}
									onChange={(value) => setAttributes({ fnavBtnBg: value })}
								/>

								<BorderGroupControl
									label={__('Button border', 'voxel-fse')}
									value={attributes.fnavBtnBorder as any}
									onChange={(value) => setAttributes({ fnavBtnBorder: value })}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="fnavBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributeBaseName="fnavBtnSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.fnavBtnColorHover}
									onChange={(value) => setAttributes({ fnavBtnColorHover: value })}
								/>

								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.fnavBtnBgHover}
									onChange={(value) => setAttributes({ fnavBtnBgHover: value })}
								/>

								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.fnavBorderColorHover}
									onChange={(value) => setAttributes({ fnavBorderColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    3. FORM: FOOTER
			    Source: create-post.php:773-802
			    ===================================================== */}
			<AccordionPanel id="form-footer" title={__('Form: Footer', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Top spacing', 'voxel-fse')}
					attributeBaseName="footerTopSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    4. FORM: FIELDS GENERAL
			    Source: create-post.php:fields-general
			    ===================================================== */}
			<AccordionPanel id="form-fields-general" title={__('Form: Fields general', 'voxel-fse')}>
				<SectionHeading label={__('Field label', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.sf1InputLabelTypo}
					onChange={(value) => setAttributes({ sf1InputLabelTypo: value })}
				/>
				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.sf1InputLabelCol}
					onChange={(value) => setAttributes({ sf1InputLabelCol: value })}
				/>

				<SectionHeading label={__('Field validation', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.sf1FieldReqTypo}
					onChange={(value) => setAttributes({ sf1FieldReqTypo: value })}
				/>
				<ColorControl
					label={__('Default Color', 'voxel-fse')}
					value={attributes.sf1FieldReqCol}
					onChange={(value) => setAttributes({ sf1FieldReqCol: value })}
				/>
				<ColorControl
					label={__('Error Color', 'voxel-fse')}
					value={attributes.sf1FieldReqColErr}
					onChange={(value) => setAttributes({ sf1FieldReqColErr: value })}
				/>
			</AccordionPanel>

			{/* =====================================================
			    5. FORM: INPUT & TEXTAREA
			    Source: create-post.php:input-textarea
			    ===================================================== */}
			<AccordionPanel id="form-input-textarea" title={__('Form: Input & Textarea', 'voxel-fse')}>
				<StateTabPanel
					attributeName="intxtActiveTab"
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
								<ColorControl
									label={__('Placeholder color', 'voxel-fse')}
									value={attributes.intxtPlaceholderCol}
									onChange={(value) => setAttributes({ intxtPlaceholderCol: value })}
								/>
								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.intxtPlaceholderTypo}
									onChange={(value) => setAttributes({ intxtPlaceholderTypo: value })}
								/>

								<SectionHeading label={__('Value', 'voxel-fse')} />
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.intxtValueCol}
									onChange={(value) => setAttributes({ intxtValueCol: value })}
								/>
								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.intxtValueTypo}
									onChange={(value) => setAttributes({ intxtValueTypo: value })}
								/>

								<SectionHeading label={__('General', 'voxel-fse')} />
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.intxtBg}
									onChange={(value) => setAttributes({ intxtBg: value })}
								/>
								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.intxtBorder as any}
									onChange={(value) => setAttributes({ intxtBorder: value })}
									hideRadius={true}
								/>

								<SectionHeading label={__('Input', 'voxel-fse')} />
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="intxtInputRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="intxtInputHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>
								<ResponsiveRangeControl
									label={__('Padding', 'voxel-fse')}
									attributeBaseName="intxtInputPadding"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', 'em', '%']}
								/>

								<SectionHeading label={__('Textarea', 'voxel-fse')} />
								<ResponsiveRangeControl
									label={__('Padding', 'voxel-fse')}
									attributeBaseName="intxtTextareaPadding"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', 'em', '%']}
								/>
								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="intxtTextareaHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={1500}
									units={['px', '%']}
								/>
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="intxtTextareaRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<SectionHeading label={__('Input with icon', 'voxel-fse')} />
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.intxtIconCol}
									onChange={(value) => setAttributes({ intxtIconCol: value })}
								/>
								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="intxtIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>
								<ResponsiveRangeControl
									label={__('Icon side padding', 'voxel-fse')}
									attributeBaseName="intxtIconMargin"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.intxtBgHover}
									onChange={(value) => setAttributes({ intxtBgHover: value })}
								/>
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.intxtBorderHover}
									onChange={(value) => setAttributes({ intxtBorderHover: value })}
								/>
								<ColorControl
									label={__('Placeholder color', 'voxel-fse')}
									value={attributes.intxtPlaceholderColHover}
									onChange={(value) => setAttributes({ intxtPlaceholderColHover: value })}
								/>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.intxtValueColHover}
									onChange={(value) => setAttributes({ intxtValueColHover: value })}
								/>
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.intxtIconColHover}
									onChange={(value) => setAttributes({ intxtIconColHover: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.intxtBgActive}
									onChange={(value) => setAttributes({ intxtBgActive: value })}
								/>
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.intxtBorderActive}
									onChange={(value) => setAttributes({ intxtBorderActive: value })}
								/>
								<ColorControl
									label={__('Placeholder color', 'voxel-fse')}
									value={attributes.intxtPlaceholderColActive}
									onChange={(value) => setAttributes({ intxtPlaceholderColActive: value })}
								/>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.intxtValueColActive}
									onChange={(value) => setAttributes({ intxtValueColActive: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    6. FORM: INPUT SUFFIX
			    Source: create-post.php:input-suffix
			    ===================================================== */}
			<AccordionPanel id="form-input-suffix" title={__('Form: Input suffix', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.suffixTypo}
					onChange={(value) => setAttributes({ suffixTypo: value })}
				/>
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.suffixTextCol}
					onChange={(value) => setAttributes({ suffixTextCol: value })}
				/>
				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.suffixBg}
					onChange={(value) => setAttributes({ suffixBg: value })}
				/>
				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="suffixRadius"
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
					shadowAttributeName="suffixShadow"
				/>
				<ResponsiveRangeControl
					label={__('Side margin', 'voxel-fse')}
					attributeBaseName="suffixMargin"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>
				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.suffixIconCol}
					onChange={(value) => setAttributes({ suffixIconCol: value })}
				/>
			</AccordionPanel>

			{/* =====================================================
			    7. FORM: POPUP BUTTON
			    Source: create-post.php:styling-filters
			    ===================================================== */}
			<AccordionPanel id="form-popup-button" title={__('Form: Popup button', 'voxel-fse')}>
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
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.popupBtnBg}
									onChange={(value) => setAttributes({ popupBtnBg: value })}
								/>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.popupBtnValueCol}
									onChange={(value) => setAttributes({ popupBtnValueCol: value })}
								/>
								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
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
									max={100}
									units={['px', '%']}
								/>

								<SectionHeading label={__('Icons', 'voxel-fse')} />
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.popupBtnIconCol}
									onChange={(value) => setAttributes({ popupBtnIconCol: value })}
								/>
								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="popupBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>
								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="popupBtnIconMargin"
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
								<ColorControl
									label={__('Chevron color', 'voxel-fse')}
									value={attributes.popupBtnChevronCol}
									onChange={(value) => setAttributes({ popupBtnChevronCol: value })}
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<SectionHeading label={__('Style', 'voxel-fse')} />
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.popupBtnBgHover}
									onChange={(value) => setAttributes({ popupBtnBgHover: value })}
								/>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.popupBtnValueColHover}
									onChange={(value) => setAttributes({ popupBtnValueColHover: value })}
								/>
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.popupBtnBorderHover}
									onChange={(value) => setAttributes({ popupBtnBorderHover: value })}
								/>
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.popupBtnIconColHover}
									onChange={(value) => setAttributes({ popupBtnIconColHover: value })}
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
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.popupBtnBgFilled}
									onChange={(value) => setAttributes({ popupBtnBgFilled: value })}
								/>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.popupBtnValueColFilled}
									onChange={(value) => setAttributes({ popupBtnValueColFilled: value })}
								/>
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.popupBtnIconColFilled}
									onChange={(value) => setAttributes({ popupBtnIconColFilled: value })}
								/>
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.popupBtnBorderFilled}
									onChange={(value) => setAttributes({ popupBtnBorderFilled: value })}
								/>
								<ResponsiveRangeControl
									label={__('Border width', 'voxel-fse')}
									attributeBaseName="popupBtnBorderWidthFilled"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
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
			    4. FORM: PRIMARY BUTTON
			    Source: create-post.php:3868-4099
			    ===================================================== */}
			<AccordionPanel id="primary-btn" title={__('Form: Primary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="primaryBtnActiveTab"
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
									label={__('Button typography', 'voxel-fse')}
									value={attributes.submitBtnTypo}
									onChange={(value) => setAttributes({ submitBtnTypo: value })}
								/>

								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.formBtnBorder as any}
									onChange={(value) => setAttributes({ formBtnBorder: value })}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="formBtnRadius"
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
									shadowAttributeName="formBtnShadow"
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.formBtnColor}
									onChange={(value) => setAttributes({ formBtnColor: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.formBtnBg}
									onChange={(value) => setAttributes({ formBtnBg: value })}
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="formBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.formBtnIconColor}
									onChange={(value) => setAttributes({ formBtnIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="formBtnIconMargin"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.formBtnColorHover}
									onChange={(value) => setAttributes({ formBtnColorHover: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.formBtnBgHover}
									onChange={(value) => setAttributes({ formBtnBgHover: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.formBtnBorderColorHover}
									onChange={(value) => setAttributes({ formBtnBorderColorHover: value })}
								/>

								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									shadowAttributeName="formBtnShadowHover"
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.formBtnIconColorHover}
									onChange={(value) => setAttributes({ formBtnIconColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    5. FORM: SECONDARY BUTTON
			    Source: create-post.php:4101-4320
			    ===================================================== */}
			<AccordionPanel id="secondary-btn" title={__('Form: Secondary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="secondaryBtnActiveTab"
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
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.scndryBtnIconColor}
									onChange={(value) => setAttributes({ scndryBtnIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributeBaseName="scndryBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="scndryBtnIconMargin"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.scndryBtnBg}
									onChange={(value) => setAttributes({ scndryBtnBg: value })}
								/>

								<BorderGroupControl
									label={__('Button border', 'voxel-fse')}
									value={attributes.scndryBtnBorder as any}
									onChange={(value) => setAttributes({ scndryBtnBorder: value })}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="scndryBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.scndryBtnText}
									onChange={(value) => setAttributes({ scndryBtnText: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndryBtnTextColor}
									onChange={(value) => setAttributes({ scndryBtnTextColor: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.scndryBtnIconColorHover}
									onChange={(value) => setAttributes({ scndryBtnIconColorHover: value })}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.scndryBtnBgHover}
									onChange={(value) => setAttributes({ scndryBtnBgHover: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.scndryBtnBorderHover}
									onChange={(value) => setAttributes({ scndryBtnBorderHover: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndryBtnTextColorHover}
									onChange={(value) => setAttributes({ scndryBtnTextColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    6. FORM: TERTIARY BUTTON
			    Source: create-post.php:4322-4517
			    ===================================================== */}
			<AccordionPanel id="tertiary-btn" title={__('Form: Tertiary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="tertiaryBtnActiveTab"
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
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.tertiaryBtnIconColor}
									onChange={(value) => setAttributes({ tertiaryBtnIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributeBaseName="tertiaryBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.tertiaryBtnBg}
									onChange={(value) => setAttributes({ tertiaryBtnBg: value })}
								/>

								<BorderGroupControl
									label={__('Button border', 'voxel-fse')}
									value={attributes.tertiaryBtnBorder as any}
									onChange={(value) => setAttributes({ tertiaryBtnBorder: value })}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributeBaseName="tertiaryBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.tertiaryBtnText}
									onChange={(value) => setAttributes({ tertiaryBtnText: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tertiaryBtnTextColor}
									onChange={(value) => setAttributes({ tertiaryBtnTextColor: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.tertiaryBtnIconColorHover}
									onChange={(value) => setAttributes({ tertiaryBtnIconColorHover: value })}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.tertiaryBtnBgHover}
									onChange={(value) => setAttributes({ tertiaryBtnBgHover: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.tertiaryBtnBorderHover}
									onChange={(value) => setAttributes({ tertiaryBtnBorderHover: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tertiaryBtnTextColorHover}
									onChange={(value) => setAttributes({ tertiaryBtnTextColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    7. FORM: FILE/GALLERY
			    Source: option-groups/file-field.php:12-493
			    ===================================================== */}
			<AccordionPanel id="file-gallery" title={__('Form: File/Gallery', 'voxel-fse')}>
				<StateTabPanel
					attributeName="fileGalleryActiveTab"
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
									label={__('Item gap', 'voxel-fse')}
									attributeBaseName="fileColGap"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<SectionHeading label={__('Select files', 'voxel-fse')} />

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.fileIconColor}
									onChange={(value) => setAttributes({ fileIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="fileIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.fileBg}
									onChange={(value) => setAttributes({ fileBg: value })}
								/>

								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.fileBorder as any}
									onChange={(value) => setAttributes({ fileBorder: value })}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="fileRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.fileText}
									onChange={(value) => setAttributes({ fileText: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.fileTextColor}
									onChange={(value) => setAttributes({ fileTextColor: value })}
								/>

								<SectionHeading label={__('Added file/image', 'voxel-fse')} />

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="addedRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.addedBg}
									onChange={(value) => setAttributes({ addedBg: value })}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.addedIconColor}
									onChange={(value) => setAttributes({ addedIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="addedIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.addedText}
									onChange={(value) => setAttributes({ addedText: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.addedTextColor}
									onChange={(value) => setAttributes({ addedTextColor: value })}
								/>

								<SectionHeading label={__('Remove/Check button', 'voxel-fse')} />

								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.rmfBg}
									onChange={(value) => setAttributes({ rmfBg: value })}
								/>

								<ColorControl
									label={__('Background (Hover)', 'voxel-fse')}
									value={attributes.rmfBgHover}
									onChange={(value) => setAttributes({ rmfBgHover: value })}
								/>

								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.rmfColor}
									onChange={(value) => setAttributes({ rmfColor: value })}
								/>

								<ColorControl
									label={__('Color (Hover)', 'voxel-fse')}
									value={attributes.rmfColorHover}
									onChange={(value) => setAttributes({ rmfColorHover: value })}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="rmfRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributeBaseName="rmfSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="rmfIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									units={['px']}
								/>
							</>
						) : (
							<>
								<SectionHeading label={__('Select files', 'voxel-fse')} />

								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.fileIconColorHover}
									onChange={(value) => setAttributes({ fileIconColorHover: value })}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.fileBgHover}
									onChange={(value) => setAttributes({ fileBgHover: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.fileBorderHover}
									onChange={(value) => setAttributes({ fileBorderHover: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.fileColorHover}
									onChange={(value) => setAttributes({ fileColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* =====================================================
			    8. FORM: POST SUBMITTED/UPDATED
			    Source: create-post.php:4523-4656
			    ===================================================== */}
			<AccordionPanel id="post-submitted" title={__('Form: Post submitted/Updated', 'voxel-fse')}>
				<SelectControl
					label={__('Align icon', 'voxel-fse')}
					value={attributes.welcAlign || 'center'}
					options={[
						{ label: __('Left', 'voxel-fse'), value: 'flex-start' },
						{ label: __('Center', 'voxel-fse'), value: 'center' },
						{ label: __('Right', 'voxel-fse'), value: 'flex-end' },
					]}
					onChange={(value: any) => setAttributes({ welcAlign: value })}
				/>

				<SelectControl
					label={__('Text align', 'voxel-fse')}
					value={attributes.welcAlignText || 'center'}
					options={[
						{ label: __('Left', 'voxel-fse'), value: 'left' },
						{ label: __('Center', 'voxel-fse'), value: 'center' },
						{ label: __('Right', 'voxel-fse'), value: 'right' },
					]}
					onChange={(value: any) => setAttributes({ welcAlignText: value })}
				/>

				<SectionHeading label={__('Icon', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributeBaseName="welcIcoSize"
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
					attributeBaseName="welcIcoColor"
				/>

				<SectionHeading label={__('Heading', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.welcHeadingT}
					onChange={(value) => setAttributes({ welcHeadingT: value })}
				/>

				<ResponsiveColorControl
					label={__('Color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="welcHeadingCol"
				/>

				<ResponsiveRangeControl
					label={__('Top margin', 'voxel-fse')}
					attributeBaseName="welcTopMargin"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    9. FORM: TOOLTIPS
			    Source: create-post.php:4658-4723
			    ===================================================== */}
			<AccordionPanel id="tooltips" title={__('Form: Tooltips', 'voxel-fse')}>
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.tooltipColor}
					onChange={(value) => setAttributes({ tooltipColor: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.tooltipTypo}
					onChange={(value) => setAttributes({ tooltipTypo: value })}
				/>

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.tooltipBg}
					onChange={(value) => setAttributes({ tooltipBg: value })}
				/>

				<ResponsiveRangeControl
					label={__('Radius', 'voxel-fse')}
					attributeBaseName="tooltipRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>
			</AccordionPanel>

			{/* =====================================================
			    10. FORM: DIALOG
			    Source: create-post.php:4725-4842
			    ===================================================== */}
			<AccordionPanel id="dialog" title={__('Form: Dialog', 'voxel-fse')}>
				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.dialogIconColor}
					onChange={(value) => setAttributes({ dialogIconColor: value })}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributeBaseName="dialogIconSize"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.dialogColor}
					onChange={(value) => setAttributes({ dialogColor: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.dialogTypo}
					onChange={(value) => setAttributes({ dialogTypo: value })}
				/>

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.dialogBg}
					onChange={(value) => setAttributes({ dialogBg: value })}
				/>

				<ResponsiveRangeControl
					label={__('Radius', 'voxel-fse')}
					attributeBaseName="dialogRadius"
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
					shadowAttributeName="dialogShadow"
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={attributes.dialogBorder as any}
					onChange={(value) => setAttributes({ dialogBorder: value })}
					hideRadius={true}
				/>
			</AccordionPanel>

			{/* =====================================================
			    11. POPUPS: CUSTOM STYLE
			    Source: create-post.php:4844-4944
			    ===================================================== */}
			<AccordionPanel id="custom-popup" title={__('Popups: Custom style', 'voxel-fse')}>
				<PopupCustomStyleControl
					attributes={attributes}
					setAttributes={setAttributes}
					attributeNames={{
						enable: 'customPopupEnable',
						backdrop: 'custmPgBackdrop',
						pointerEvents: 'popupPointerEvents',
						shadow: 'pgShadow',
						topMargin: 'customPgTopMargin',
						autosuggestTopMargin: 'googleTopMargin',
					}}
				/>
				<p style={{ fontSize: '11px', color: '#757575', fontStyle: 'italic', marginTop: '16px' }}>
					{__('In wp-admin > templates > Style kits > Popup styles you can control the global popup styles that affect all the popups on the site. Enabling this option will override some of those styles only for this specific widget.', 'voxel-fse')}
				</p>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
