/**
 * Stripe Account Block - Style Tab Inspector Controls
 *
 * Contains all styling accordions for the Stripe Account block.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
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
					onChange={(value: any) => {
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
					onChange={(value: string | undefined) => setAttributes({ panelBackground: value })}
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
					typographyAttributeName="panelTypography"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.panelTextColor}
					onChange={(value: string | undefined) => setAttributes({ panelTextColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Fields general Accordion */}
			<AccordionPanel id="form-fields-general" title={__('Form: Fields general', 'voxel-fse')}>
				<SectionHeading label={__('Field label', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="fieldLabelTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldLabelColor}
					onChange={(value: string | undefined) => setAttributes({ fieldLabelColor: value })}
				/>

				<SectionHeading label={__('Select/Unselect', 'voxel-fse')} />

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.fieldSelectColor}
					onChange={(value: string | undefined) => setAttributes({ fieldSelectColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ inputPlaceholderColor: value })}
									/>

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="inputPlaceholderTypography"
									/>

									<SectionHeading label={__('Value', 'voxel-fse')} />

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputValueTextColor}
										onChange={(value: string | undefined) => setAttributes({ inputValueTextColor: value })}
									/>

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="inputValueTypography"
									/>

									<SectionHeading label={__('General', 'voxel-fse')} />

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColor}
										onChange={(value: string | undefined) => setAttributes({ inputBackgroundColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.inputBorderType || '',
											borderWidth: attributes.inputBorderWidth || {},
											borderColor: attributes.inputBorderColor || '',
										}}
										onChange={(value: any) => {
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
										onChange={(value: string | undefined) => setAttributes({ inputBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ inputBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColorHover}
										onChange={(value: string | undefined) => setAttributes({ inputPlaceholderColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorHover}
										onChange={(value: string | undefined) => setAttributes({ inputTextColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.inputIconColorHover}
										onChange={(value: string | undefined) => setAttributes({ inputIconColorHover: value })}
									/>
								</>
							)}

							{tab.name === 'active' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColorActive}
										onChange={(value: string | undefined) => setAttributes({ inputBackgroundColorActive: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorActive}
										onChange={(value: string | undefined) => setAttributes({ inputBorderColorActive: value })}
									/>

									<ColorControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColorActive}
										onChange={(value: string | undefined) => setAttributes({ inputPlaceholderColorActive: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColorActive}
										onChange={(value: string | undefined) => setAttributes({ inputTextColorActive: value })}
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
					typographyAttributeName="inputSuffixButtonTypography"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.inputSuffixTextColor}
					onChange={(value: string | undefined) => setAttributes({ inputSuffixTextColor: value })}
				/>

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.inputSuffixBackgroundColor}
					onChange={(value: string | undefined) => setAttributes({ inputSuffixBackgroundColor: value })}
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
					onChange={(value: string | undefined) => setAttributes({ inputSuffixIconColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Switcher Accordion */}
			<AccordionPanel id="form-switcher" title={__('Form: Switcher', 'voxel-fse')}>
				<SectionHeading label={__('Switch slider', 'voxel-fse')} />

				<ColorControl
					label={__('Background (Inactive)', 'voxel-fse')}
					value={attributes.switcherBackgroundInactive}
					onChange={(value: string | undefined) => setAttributes({ switcherBackgroundInactive: value })}
				/>

				<ColorControl
					label={__('Background (Active)', 'voxel-fse')}
					value={attributes.switcherBackgroundActive}
					onChange={(value: string | undefined) => setAttributes({ switcherBackgroundActive: value })}
				/>

				<ColorControl
					label={__('Handle background', 'voxel-fse')}
					value={attributes.switcherHandleBackground}
					onChange={(value: string | undefined) => setAttributes({ switcherHandleBackground: value })}
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
										onChange={(value: string | undefined) => setAttributes({ selectBackgroundColor: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.selectTextColor}
										onChange={(value: string | undefined) => setAttributes({ selectTextColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.selectBorderType || '',
											borderWidth: attributes.selectBorderWidth || {},
											borderColor: attributes.selectBorderColor || '',
										}}
										onChange={(value: any) => {
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
										onChange={(value: boolean) => setAttributes({ selectHideChevron: value })}
									/>

									<ColorControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.selectChevronColor}
										onChange={(value: string) => setAttributes({ selectChevronColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.selectBackgroundColorHover}
										onChange={(value: string | undefined) => setAttributes({ selectBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.selectTextColorHover}
										onChange={(value: string | undefined) => setAttributes({ selectTextColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.selectBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ selectBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.selectIconColorHover}
										onChange={(value: string | undefined) => setAttributes({ selectIconColorHover: value })}
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
										onChange={(value: string | undefined) => setAttributes({ tabsBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabsBorderType || '',
											borderWidth: attributes.tabsBorderWidth || {},
											borderColor: attributes.tabsBorderColor || '',
										}}
										onChange={(value: any) => {
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
										typographyAttributeName="tabsTextTypography"
									/>

									<ColorControl
										label={__('Text Color', 'voxel-fse')}
										value={attributes.tabsTextColor}
										onChange={(value: string | undefined) => setAttributes({ tabsTextColor: value })}
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tabsBackgroundSelected}
										onChange={(value: string | undefined) => setAttributes({ tabsBackgroundSelected: value })}
									/>

									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={attributes.tabsColorSelected}
										onChange={(value: string | undefined) => setAttributes({ tabsColorSelected: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tabsBorderColorSelected}
										onChange={(value: string | undefined) => setAttributes({ tabsBorderColorSelected: value })}
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
					typographyAttributeName="headingTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.headingColor}
					onChange={(value: string | undefined) => setAttributes({ headingColor: value })}
				/>
			</AccordionPanel>

			{/* Form: Repeater Accordion */}
			<AccordionPanel id="form-repeater" title={__('Form: Repeater', 'voxel-fse')}>
				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.repeaterBackground}
					onChange={(value: string | undefined) => setAttributes({ repeaterBackground: value })}
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.repeaterBorderType || '',
						borderWidth: attributes.repeaterBorderWidth || {},
						borderColor: attributes.repeaterBorderColor || '',
					}}
					onChange={(value: any) => {
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
					onChange={(value: string | undefined) => setAttributes({ repeaterHeadSecondaryColor: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="repeaterHeadSecondaryTypography"
				/>

				<SectionHeading label={__('Other', 'voxel-fse')} />

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.repeaterHeadIconColor}
					onChange={(value: string | undefined) => setAttributes({ repeaterHeadIconColor: value })}
				/>

				<ColorControl
					label={__('Border color', 'voxel-fse')}
					value={attributes.repeaterHeadBorderColor}
					onChange={(value: string | undefined) => setAttributes({ repeaterHeadBorderColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ repeaterIconButtonColor: value })}
									/>

									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.repeaterIconButtonBackground}
										onChange={(value: string | undefined) => setAttributes({ repeaterIconButtonBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.repeaterIconButtonBorderType || '',
											borderWidth: attributes.repeaterIconButtonBorderWidth || {},
											borderColor: attributes.repeaterIconButtonBorderColor || '',
										}}
										onChange={(value: any) => {
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
										onChange={(value: string | undefined) => setAttributes({ repeaterIconButtonColorHover: value })}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.repeaterIconButtonBackgroundHover}
										onChange={(value: string | undefined) => setAttributes({ repeaterIconButtonBackgroundHover: value })}
									/>

									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.repeaterIconButtonBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ repeaterIconButtonBorderColorHover: value })}
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
										typographyAttributeName="pillsTypography"
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
										onChange={(value: string | undefined) => setAttributes({ pillsTextColor: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.pillsBackgroundColor}
										onChange={(value: string | undefined) => setAttributes({ pillsBackgroundColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pillsTextColorHover}
										onChange={(value: string | undefined) => setAttributes({ pillsTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.pillsBackgroundColorHover}
										onChange={(value: string | undefined) => setAttributes({ pillsBackgroundColorHover: value })}
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
										typographyAttributeName="primaryButtonTypography"
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.primaryButtonBorderType || '',
											borderWidth: attributes.primaryButtonBorderWidth || {},
											borderColor: attributes.primaryButtonBorderColor || '',
										}}
										onChange={(value: any) => {
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
										onChange={(value: string | undefined) => setAttributes({ primaryButtonTextColor: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackgroundColor}
										onChange={(value: string | undefined) => setAttributes({ primaryButtonBackgroundColor: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.primaryButtonBorderColor}
										onChange={(value: string | undefined) => setAttributes({ primaryButtonBorderColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ primaryButtonIconColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ primaryButtonTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.primaryButtonBackgroundColorHover}
										onChange={(value: string | undefined) => setAttributes({ primaryButtonBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.primaryButtonBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ primaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.primaryButtonIconColorHover}
										onChange={(value: string | undefined) => setAttributes({ primaryButtonIconColorHover: value })}
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
										typographyAttributeName="secondaryButtonTypography"
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
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonTextColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonBackgroundColor: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.secondaryButtonBorderType || '',
											borderWidth: attributes.secondaryButtonBorderWidth || {},
											borderColor: attributes.secondaryButtonBorderColor || '',
										}}
										onChange={(value: any) => {
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
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.secondaryButtonTextColorHover}
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonTextColorHover: value })}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.secondaryButtonBackgroundColorHover}
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonBackgroundColorHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.secondaryButtonBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.secondaryButtonIconColorHover}
										onChange={(value: string | undefined) => setAttributes({ secondaryButtonIconColorHover: value })}
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
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonIconColor: value })}
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
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonBackground: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tertiaryButtonBorderType || '',
											borderWidth: attributes.tertiaryButtonBorderWidth || {},
											borderColor: attributes.tertiaryButtonBorderColor || '',
										}}
										onChange={(value: any) => {
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
										typographyAttributeName="tertiaryButtonTypography"
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tertiaryButtonTextColor}
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonTextColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.tertiaryButtonIconColorHover}
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonIconColorHover: value })}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.tertiaryButtonBackgroundHover}
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonBackgroundHover: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tertiaryButtonBorderColorHover}
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonBorderColorHover: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tertiaryButtonTextColorHover}
										onChange={(value: string | undefined) => setAttributes({ tertiaryButtonTextColorHover: value })}
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
