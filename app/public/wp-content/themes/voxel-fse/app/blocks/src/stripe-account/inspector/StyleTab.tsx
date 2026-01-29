/**
 * Stripe Account Block - Style Tab Inspector Controls
 *
 * Contains all styling accordions for the Stripe Account block.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { TextControl, ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	BorderGroupControl,
	BoxShadowPopup,
	ColorControl,
	DimensionsControl,
	ResponsiveRangeControl,
	SectionHeading,
	StateTabPanel,
	TypographyControl,
} from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
import type { StripeAccountAttributes } from '../types';

interface StyleTabProps {
	attributes: StripeAccountAttributes;
	setAttributes: (attrs: Partial<StripeAccountAttributes>) => void;
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
			defaultPanel="panel"
		>
			{/* Panel Accordion */}
			<AccordionPanel id="panel" title={__('Panel', 'voxel-fse')}>
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.panelBorderType || '',
						borderWidth: attributes.panelBorderWidth || {},
						borderColor: attributes.panelBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<StripeAccountAttributes> = {};
						if (value.borderType !== undefined) {
							updates.panelBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.panelBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.panelBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="panelBorderRadius"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.panelBackground}
					onChange={(value) => setAttributes({ panelBackground: value })}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="panelBoxShadow"
				/>

				<SectionHeading label={__('Panel body', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Body spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="panelBodySpacing"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Body content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="panelBodyContentGap"
					min={0}
					max={100}
					units={['px']}
				/>

				<SectionHeading label={__('Typography', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="panelTypography"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.panelTextColor}
					onChange={(value) => setAttributes({ panelTextColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Fields general Accordion */}
			<AccordionPanel id="form-fields-general" title={__('Form: Fields general', 'voxel-fse')}>
				<SectionHeading label={__('Field label', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="fieldLabelTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldLabelColor}
					onChange={(value) => setAttributes({ fieldLabelColor: value })}
				/>

				<SectionHeading label={__('Select/Unselect', 'voxel-fse')} />

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldSelectColor}
					onChange={(value) => setAttributes({ fieldSelectColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Input & Textarea Accordion */}
			<AccordionPanel id="form-input-textarea" title={__('Form: Input & Textarea', 'voxel-fse')}>
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
										onChange={(value) => setAttributes({ inputPlaceholderColor: value })}
									/>

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="inputPlaceholderTypography"
									/>

									<SectionHeading label={__('Value', 'voxel-fse')} />

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputValueTextColor}
										onChange={(value) => setAttributes({ inputValueTextColor: value })}
									/>

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="inputValueTypography"
									/>

									<SectionHeading label={__('General', 'voxel-fse')} />

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColor}
										onChange={(value) => setAttributes({ inputBackgroundColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.inputBorderType || '',
											borderWidth: attributes.inputBorderWidth || {},
											borderColor: attributes.inputBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.inputBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.inputBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.inputBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<SectionHeading label={__('Input', 'voxel-fse')} />

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="inputBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="inputHeight"
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
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="textareaHeight"
										min={0}
										max={500}
										units={['px']}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="textareaBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColorHover}
										onChange={(value) => setAttributes({ inputBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorHover}
										onChange={(value) => setAttributes({ inputBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColorHover}
										onChange={(value) => setAttributes({ inputPlaceholderColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorHover}
										onChange={(value) => setAttributes({ inputTextColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.inputIconColorHover}
										onChange={(value) => setAttributes({ inputIconColorHover: value })}
									/>
								</>
							)}

							{tab.name === 'active' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColorActive}
										onChange={(value) => setAttributes({ inputBackgroundColorActive: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorActive}
										onChange={(value) => setAttributes({ inputBorderColorActive: value })}
									/>

									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColorActive}
										onChange={(value) => setAttributes({ inputPlaceholderColorActive: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorActive}
										onChange={(value) => setAttributes({ inputTextColorActive: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Form: Input suffix Accordion */}
			<AccordionPanel id="form-input-suffix" title={__('Form: Input suffix', 'voxel-fse')}>
				<TypographyControl
					label={__('Button typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="inputSuffixButtonTypography"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.inputSuffixTextColor}
					onChange={(value) => setAttributes({ inputSuffixTextColor: value })}
				/>

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.inputSuffixBackgroundColor}
					onChange={(value) => setAttributes({ inputSuffixBackgroundColor: value })}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="inputSuffixBorderRadius"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="inputSuffixBoxShadow"
				/>

				<ResponsiveRangeControl
					label={__('Side margin', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="inputSuffixSideMargin"
					min={0}
					max={100}
					units={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.inputSuffixIconColor}
					onChange={(value) => setAttributes({ inputSuffixIconColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Switcher Accordion */}
			<AccordionPanel id="form-switcher" title={__('Form: Switcher', 'voxel-fse')}>
				<SectionHeading label={__('Switch slider', 'voxel-fse')} />

				<ColorControl
					label={__('Background (Inactive)', 'voxel-fse')}
					value={attributes.switcherBackgroundInactive}
					onChange={(value) => setAttributes({ switcherBackgroundInactive: value })}
				/>

				<ColorControl
					label={__('Background (Active)', 'voxel-fse')}
					value={attributes.switcherBackgroundActive}
					onChange={(value) => setAttributes({ switcherBackgroundActive: value })}
				/>

				<ColorControl
					label={__('Handle background', 'voxel-fse')}
					value={attributes.switcherHandleBackground}
					onChange={(value) => setAttributes({ switcherHandleBackground: value })}
				/>
			</AccordionPanel>

			{/* Form: Select Accordion */}
			<AccordionPanel id="form-select" title={__('Form: Select', 'voxel-fse')}>
				<StateTabPanel
					attributeName="selectState"
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
									<SectionHeading label={__('Style', 'voxel-fse')} />

									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="selectBoxShadow"
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.selectBackgroundColor}
										onChange={(value) => setAttributes({ selectBackgroundColor: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.selectTextColor}
										onChange={(value) => setAttributes({ selectTextColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.selectBorderType || '',
											borderWidth: attributes.selectBorderWidth || {},
											borderColor: attributes.selectBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.selectBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.selectBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.selectBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="selectBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<SectionHeading label={__('Chevron', 'voxel-fse')} />

									<ToggleControl
										label={__('Hide chevron', 'voxel-fse')}
										checked={attributes.selectHideChevron || false}
										onChange={(value) => setAttributes({ selectHideChevron: value })}
									/>

									<ColorControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.selectChevronColor}
										onChange={(value) => setAttributes({ selectChevronColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.selectBackgroundColorHover}
										onChange={(value) => setAttributes({ selectBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.selectTextColorHover}
										onChange={(value) => setAttributes({ selectTextColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.selectBorderColorHover}
										onChange={(value) => setAttributes({ selectBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.selectIconColorHover}
										onChange={(value) => setAttributes({ selectIconColorHover: value })}
									/>

									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="selectBoxShadowHover"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Form: Tabs Accordion */}
			<AccordionPanel id="form-tabs" title={__('Form: Tabs', 'voxel-fse')}>
				<StateTabPanel
					attributeName="tabsState"
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
									<ResponsiveRangeControl
										label={__('Gap', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsGap"
										min={0}
										max={100}
										units={['px']}
									/>

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tabsBackground}
										onChange={(value) => setAttributes({ tabsBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabsBorderType || '',
											borderWidth: attributes.tabsBorderWidth || {},
											borderColor: attributes.tabsBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tabsBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.tabsBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tabsBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<SectionHeading label={__('Text', 'voxel-fse')} />

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsTextTypography"
									/>

									<ColorControl
										label={__('Text Color', 'voxel-fse')}
										value={attributes.tabsTextColor}
										onChange={(value) => setAttributes({ tabsTextColor: value })}
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tabsBackgroundSelected}
										onChange={(value) => setAttributes({ tabsBackgroundSelected: value })}
									/>

									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={attributes.tabsColorSelected}
										onChange={(value) => setAttributes({ tabsColorSelected: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tabsBorderColorSelected}
										onChange={(value) => setAttributes({ tabsBorderColorSelected: value })}
									/>

									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="tabsBoxShadowSelected"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Form: Heading Accordion */}
			<AccordionPanel id="form-heading" title={__('Form: Heading', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="headingTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.headingColor}
					onChange={(value) => setAttributes({ headingColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Repeater Accordion */}
			<AccordionPanel id="form-repeater" title={__('Form: Repeater', 'voxel-fse')}>
				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.repeaterBackground}
					onChange={(value) => setAttributes({ repeaterBackground: value })}
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.repeaterBorderType || '',
						borderWidth: attributes.repeaterBorderWidth || {},
						borderColor: attributes.repeaterBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<StripeAccountAttributes> = {};
						if (value.borderType !== undefined) {
							updates.repeaterBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.repeaterBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.repeaterBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="repeaterBorderRadius"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="repeaterBoxShadow"
				/>
			</AccordionPanel>

			{/* Form: Repeater head Accordion */}
			<AccordionPanel id="form-repeater-head" title={__('Form: Repeater head', 'voxel-fse')}>
				<SectionHeading label={__('Secondary text', 'voxel-fse')} />

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.repeaterHeadSecondaryColor}
					onChange={(value) => setAttributes({ repeaterHeadSecondaryColor: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="repeaterHeadSecondaryTypography"
				/>

				<SectionHeading label={__('Other', 'voxel-fse')} />

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.repeaterHeadIconColor}
					onChange={(value) => setAttributes({ repeaterHeadIconColor: value })}
				/>

				<ColorControl
					label={__('Border color', 'voxel-fse')}
					value={attributes.repeaterHeadBorderColor}
					onChange={(value) => setAttributes({ repeaterHeadBorderColor: value })}
				/>

				<ResponsiveRangeControl
					label={__('Border width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="repeaterHeadBorderWidth"
					min={0}
					max={20}
					units={['px']}
				/>
			</AccordionPanel>

			{/* Repeater: Icon button Accordion */}
			<AccordionPanel id="repeater-icon-button" title={__('Repeater: Icon button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="repeaterIconButtonState"
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
									<SectionHeading label={__('Button styling', 'voxel-fse')} />

									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.repeaterIconButtonColor}
										onChange={(value) => setAttributes({ repeaterIconButtonColor: value })}
									/>

									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.repeaterIconButtonBackground}
										onChange={(value) => setAttributes({ repeaterIconButtonBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.repeaterIconButtonBorderType || '',
											borderWidth: attributes.repeaterIconButtonBorderWidth || {},
											borderColor: attributes.repeaterIconButtonBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.repeaterIconButtonBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.repeaterIconButtonBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.repeaterIconButtonBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="repeaterIconButtonBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.repeaterIconButtonColorHover}
										onChange={(value) => setAttributes({ repeaterIconButtonColorHover: value })}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.repeaterIconButtonBackgroundHover}
										onChange={(value) => setAttributes({ repeaterIconButtonBackgroundHover: value })}
									/>

									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.repeaterIconButtonBorderColorHover}
										onChange={(value) => setAttributes({ repeaterIconButtonBorderColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Form: Pills Accordion */}
			<AccordionPanel id="form-pills" title={__('Form: Pills', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pillsState"
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
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="pillsTypography"
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="pillsBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pillsTextColor}
										onChange={(value) => setAttributes({ pillsTextColor: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.pillsBackgroundColor}
										onChange={(value) => setAttributes({ pillsBackgroundColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pillsTextColorHover}
										onChange={(value) => setAttributes({ pillsTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.pillsBackgroundColorHover}
										onChange={(value) => setAttributes({ pillsBackgroundColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Primary button Accordion */}
			<AccordionPanel id="primary-button" title={__('Primary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="primaryButtonState"
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
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryButtonTypography"
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.primaryButtonBorderType || '',
											borderWidth: attributes.primaryButtonBorderWidth || {},
											borderColor: attributes.primaryButtonBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.primaryButtonBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.primaryButtonBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.primaryButtonBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryButtonBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="primaryButtonBoxShadow"
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.primaryButtonTextColor}
										onChange={(value) => setAttributes({ primaryButtonTextColor: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackgroundColor}
										onChange={(value) => setAttributes({ primaryButtonBackgroundColor: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.primaryButtonBorderColor}
										onChange={(value) => setAttributes({ primaryButtonBorderColor: value })}
									/>

									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="primaryButtonBoxShadow"
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.primaryButtonIconColor}
										onChange={(value) => setAttributes({ primaryButtonIconColor: value })}
									/>

									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryButtonIconSize"
										min={0}
										max={100}
										units={['px']}
									/>

									<ResponsiveRangeControl
										label={__('Icon color', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryButtonIconColor"
										min={0}
										max={100}
										units={['px']}
									/>

									<ResponsiveRangeControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryButtonIconTextSpacing"
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
										onChange={(value) => setAttributes({ primaryButtonTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackgroundColorHover}
										onChange={(value) => setAttributes({ primaryButtonBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.primaryButtonBorderColorHover}
										onChange={(value) => setAttributes({ primaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.primaryButtonIconColorHover}
										onChange={(value) => setAttributes({ primaryButtonIconColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Secondary button Accordion */}
			<AccordionPanel id="secondary-button" title={__('Secondary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="secondaryButtonState"
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
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryButtonTypography"
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryButtonBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.secondaryButtonTextColor}
										onChange={(value) => setAttributes({ secondaryButtonTextColor: value })}
									/>

									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.secondaryButtonPadding || {}}
										onChange={(values) => setAttributes({ secondaryButtonPadding: values })}
									/>

									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryButtonHeight"
										min={0}
										max={200}
										units={['px']}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.secondaryButtonBackgroundColor}
										onChange={(value) => setAttributes({ secondaryButtonBackgroundColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.secondaryButtonBorderType || '',
											borderWidth: attributes.secondaryButtonBorderWidth || {},
											borderColor: attributes.secondaryButtonBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.secondaryButtonBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.secondaryButtonBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.secondaryButtonBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryButtonIconSize"
										min={0}
										max={100}
										units={['px']}
									/>

									<ResponsiveRangeControl
										label={__('Icon right padding', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryButtonIconRightPadding"
										min={0}
										max={100}
										units={['px']}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.secondaryButtonIconColor}
										onChange={(value) => setAttributes({ secondaryButtonIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.secondaryButtonTextColorHover}
										onChange={(value) => setAttributes({ secondaryButtonTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.secondaryButtonBackgroundColorHover}
										onChange={(value) => setAttributes({ secondaryButtonBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.secondaryButtonBorderColorHover}
										onChange={(value) => setAttributes({ secondaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.secondaryButtonIconColorHover}
										onChange={(value) => setAttributes({ secondaryButtonIconColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Tertiary button Accordion */}
			<AccordionPanel id="tertiary-button" title={__('Tertiary button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="tertiaryButtonState"
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
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.tertiaryButtonIconColor}
										onChange={(value) => setAttributes({ tertiaryButtonIconColor: value })}
									/>

									<ResponsiveRangeControl
										label={__('Button icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tertiaryButtonIconSize"
										min={0}
										max={100}
										units={['px']}
									/>

									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.tertiaryButtonBackground}
										onChange={(value) => setAttributes({ tertiaryButtonBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tertiaryButtonBorderType || '',
											borderWidth: attributes.tertiaryButtonBorderWidth || {},
											borderColor: attributes.tertiaryButtonBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<StripeAccountAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tertiaryButtonBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.tertiaryButtonBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tertiaryButtonBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tertiaryButtonBorderRadius"
										min={0}
										max={100}
										units={['px', '%']}
									/>

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tertiaryButtonTypography"
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tertiaryButtonTextColor}
										onChange={(value) => setAttributes({ tertiaryButtonTextColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.tertiaryButtonIconColorHover}
										onChange={(value) => setAttributes({ tertiaryButtonIconColorHover: value })}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.tertiaryButtonBackgroundHover}
										onChange={(value) => setAttributes({ tertiaryButtonBackgroundHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tertiaryButtonBorderColorHover}
										onChange={(value) => setAttributes({ tertiaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tertiaryButtonTextColorHover}
										onChange={(value) => setAttributes({ tertiaryButtonTextColorHover: value })}
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
