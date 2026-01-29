/**
 * InlineTab Inspector Component
 *
 * Inline Tab - 9 Accordion Sections matching Elementor's Search Form widget Inline tab:
 * 1. Terms: Inline (Normal/Hover/Selected)
 * 2. Terms: Buttons (Normal/Selected)
 * 3. Geolocation icon (Normal/Hover)
 * 4. Stepper
 * 5. Stepper buttons (Normal/Hover)
 * 6. Range slider
 * 7. Switcher
 * 8. Checkbox
 * 9. Radio
 *
 * Evidence: Elementor inspector screenshots provided by user
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { RangeControl } from '@wordpress/components';
import { AccordionPanelGroup, AccordionPanel } from '@shared/controls/AccordionPanelGroup';
import {
	BorderGroupControl,
	ColorPickerControl,
	ResponsiveRangeControl,
	ResponsiveRangeControlWithDropdown,
	StateTabPanel,
	SectionHeading,
	TypographyPopup,
	BoxShadowPopup,
} from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
import type { SearchFormAttributes } from '../types';

interface InlineTabProps {
	attributes: SearchFormAttributes;
	setAttributes: (attrs: Partial<SearchFormAttributes>) => void;
}


export default function InlineTab({
	attributes,
	setAttributes,
}: InlineTabProps) {
	return (
		<AccordionPanelGroup defaultPanel="terms-inline">
			{/* ========================================
			    1. Terms: Inline (Normal/Hover/Selected)
			    ======================================== */}
			<AccordionPanel id="terms-inline" title={__('Terms: Inline', 'voxel-fse')}>
				<StateTabPanel
					attributeName="termsInlineActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Title Section */}
									<SectionHeading label={__('Title', 'voxel-fse')} />
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.termsInlineTitleColor}
										onChange={(value) => setAttributes({ termsInlineTitleColor: value })}
									/>
									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="termsInlineTitleTypographyNormal"
									/>

									{/* Icon Section */}
									<SectionHeading label={__('Icon', 'voxel-fse')} />
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.termsInlineIconColor}
										onChange={(value) => setAttributes({ termsInlineIconColor: value })}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="termsInlineIconSize"
										min={0}
										max={40}
										availableUnits={['px', '%']}
										unitAttributeName="termsInlineIconSizeUnit"
										controlKey="termsInlineIconSize"
									/>
									<ResponsiveRangeControl
										label={__('Inner gap', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="termsInlineInnerGap"
										min={0}
										max={50}
										controlKey="termsInlineInnerGap"
									/>

									{/* Chevron Section */}
									<SectionHeading label={__('Chevron', 'voxel-fse')} />
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.termsInlineChevronColor}
										onChange={(value) => setAttributes({ termsInlineChevronColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<SectionHeading label={__('Term item', 'voxel-fse')} />
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.termsInlineTitleColorHover}
										onChange={(value) => setAttributes({ termsInlineTitleColorHover: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.termsInlineIconColorHover}
										onChange={(value) => setAttributes({ termsInlineIconColorHover: value })}
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="termsInlineTitleTypographySelected"
									/>
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.termsInlineTitleColorSelected}
										onChange={(value) => setAttributes({ termsInlineTitleColorSelected: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.termsInlineIconColorSelected}
										onChange={(value) => setAttributes({ termsInlineIconColorSelected: value })}
									/>
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.termsInlineChevronColorSelected}
										onChange={(value) => setAttributes({ termsInlineChevronColorSelected: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* ========================================
			    2. Terms: Buttons (Normal/Selected)
			    ======================================== */}
			<AccordionPanel id="terms-buttons" title={__('Terms: Buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="termsButtonsActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
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
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="termsButtonsGap"
										min={0}
										max={50}
										controlKey="termsButtonsGap"
									/>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.termsButtonsBackground}
										onChange={(value) => setAttributes({ termsButtonsBackground: value })}
									/>
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.termsButtonsBorderType || '',
											borderWidth: attributes.termsButtonsBorderWidth || {},
											borderColor: attributes.termsButtonsBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<SearchFormAttributes> = {};
											if (value.borderType !== undefined) {
												updates.termsButtonsBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.termsButtonsBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.termsButtonsBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>
									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="termsButtonsBorderRadius"
										min={0}
										max={50}
										controlKey="termsButtonsBorderRadius"
									/>
									<TypographyPopup
										label={__('Text', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="termsButtonsTypography"
									/>
									<ColorPickerControl
										label={__('Text Color', 'voxel-fse')}
										value={attributes.termsButtonsTextColor}
										onChange={(value) => setAttributes({ termsButtonsTextColor: value })}
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.termsButtonsBackgroundSelected}
										onChange={(value) => setAttributes({ termsButtonsBackgroundSelected: value })}
									/>
									<ColorPickerControl
										label={__('Color', 'voxel-fse')}
										value={attributes.termsButtonsColorSelected}
										onChange={(value) => setAttributes({ termsButtonsColorSelected: value })}
									/>
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.termsButtonsBorderColorSelected}
										onChange={(value) => setAttributes({ termsButtonsBorderColorSelected: value })}
									/>
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="termsButtonsBoxShadowSelected"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* ========================================
			    3. Geolocation icon (Normal/Hover)
			    ======================================== */}
			<AccordionPanel id="geolocation-icon" title={__('Geolocation icon', 'voxel-fse')}>
				<StateTabPanel
					attributeName="geoIconActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<ResponsiveRangeControl
										label={__('Icon right margin', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="geoIconRightMargin"
										min={0}
										max={100}
										controlKey="geoIconRightMargin"
									/>

									<SectionHeading label={__('Button styling', 'voxel-fse')} />

									<ResponsiveRangeControlWithDropdown
										label={__('Button size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="geoIconButtonSize"
										min={0}
										max={100}
										availableUnits={['px', 'em', 'rem', '%']}
										unitAttributeName="geoIconButtonSizeUnit"
										controlKey="geoIconButtonSize"
									/>
									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.geoIconButtonIconColor}
										onChange={(value) => setAttributes({ geoIconButtonIconColor: value })}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Button icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="geoIconButtonIconSize"
										min={0}
										max={100}
										availableUnits={['px', 'em', 'rem']}
										unitAttributeName="geoIconButtonIconSizeUnit"
										controlKey="geoIconButtonIconSize"
									/>
									<ColorPickerControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.geoIconButtonBackground}
										onChange={(value) => setAttributes({ geoIconButtonBackground: value })}
									/>
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.geoIconButtonBorderType || '',
											borderWidth: attributes.geoIconButtonBorderWidth || {},
											borderColor: attributes.geoIconButtonBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<SearchFormAttributes> = {};
											if (value.borderType !== undefined) {
												updates.geoIconButtonBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.geoIconButtonBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.geoIconButtonBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="geoIconButtonBorderRadius"
										min={0}
										max={100}
										availableUnits={['px', '%', 'em']}
										unitAttributeName="geoIconButtonBorderRadiusUnit"
										controlKey="geoIconButtonBorderRadius"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.geoIconButtonIconColorHover}
										onChange={(value) => setAttributes({ geoIconButtonIconColorHover: value })}
									/>
									<ColorPickerControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.geoIconButtonBackgroundHover}
										onChange={(value) => setAttributes({ geoIconButtonBackgroundHover: value })}
									/>
									<ColorPickerControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.geoIconButtonBorderColorHover}
										onChange={(value) => setAttributes({ geoIconButtonBorderColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* ========================================
			    4. Stepper
			    ======================================== */}
			<AccordionPanel id="stepper" title={__('Stepper', 'voxel-fse')}>
				<SectionHeading label={__('Number popup', 'voxel-fse')} />
				<RangeControl
					label={__('Input value size', 'voxel-fse')}
					value={attributes.stepperInputValueSize}
					onChange={(value) => setAttributes({ stepperInputValueSize: value })}
					min={10}
					max={50}
				/>
			</AccordionPanel>

			{/* ========================================
			    5. Stepper buttons (Normal/Hover)
			    ======================================== */}
			<AccordionPanel id="stepper-buttons" title={__('Stepper buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="stepperButtonsActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
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
									<ResponsiveRangeControlWithDropdown
										label={__('Button size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="stepperButtonsSize"
										min={0}
										max={100}
										availableUnits={['px', 'em', 'rem', '%']}
										unitAttributeName="stepperButtonsSizeUnit"
										controlKey="stepperButtonsSize"
									/>
									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.stepperButtonsIconColor}
										onChange={(value) => setAttributes({ stepperButtonsIconColor: value })}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Button icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="stepperButtonsIconSize"
										min={0}
										max={100}
										availableUnits={['px', 'em', 'rem']}
										unitAttributeName="stepperButtonsIconSizeUnit"
										controlKey="stepperButtonsIconSize"
									/>
									<ColorPickerControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.stepperButtonsBackground}
										onChange={(value) => setAttributes({ stepperButtonsBackground: value })}
									/>
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.stepperButtonsBorderType || '',
											borderWidth: attributes.stepperButtonsBorderWidth || {},
											borderColor: attributes.stepperButtonsBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<SearchFormAttributes> = {};
											if (value.borderType !== undefined) {
												updates.stepperButtonsBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.stepperButtonsBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.stepperButtonsBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="stepperButtonsBorderRadius"
										min={0}
										max={100}
										availableUnits={['px', '%', 'em']}
										unitAttributeName="stepperButtonsBorderRadiusUnit"
										controlKey="stepperButtonsBorderRadius"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.stepperButtonsIconColorHover}
										onChange={(value) => setAttributes({ stepperButtonsIconColorHover: value })}
									/>
									<ColorPickerControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.stepperButtonsBackgroundHover}
										onChange={(value) => setAttributes({ stepperButtonsBackgroundHover: value })}
									/>
									<ColorPickerControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.stepperButtonsBorderColorHover}
										onChange={(value) => setAttributes({ stepperButtonsBorderColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* ========================================
			    6. Range slider
			    ======================================== */}
			<AccordionPanel id="range-slider" title={__('Range slider', 'voxel-fse')}>
				<SectionHeading label={__('Range slider', 'voxel-fse')} />
				<RangeControl
					label={__('Range value size', 'voxel-fse')}
					value={attributes.rangeValueSize}
					onChange={(value) => setAttributes({ rangeValueSize: value })}
					min={10}
					max={50}
				/>
				<ColorPickerControl
					label={__('Range value color', 'voxel-fse')}
					value={attributes.rangeValueColor}
					onChange={(value) => setAttributes({ rangeValueColor: value })}
				/>
				<ColorPickerControl
					label={__('Range background', 'voxel-fse')}
					value={attributes.rangeBackground}
					onChange={(value) => setAttributes({ rangeBackground: value })}
				/>
				<ColorPickerControl
					label={__('Selected range background', 'voxel-fse')}
					value={attributes.rangeSelectedBackground}
					onChange={(value) => setAttributes({ rangeSelectedBackground: value })}
				/>
				<ColorPickerControl
					label={__('Handle background color', 'voxel-fse')}
					value={attributes.rangeHandleBackground}
					onChange={(value) => setAttributes({ rangeHandleBackground: value })}
				/>
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.rangeBorderType || '',
						borderWidth: attributes.rangeBorderWidth || {},
						borderColor: attributes.rangeBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<SearchFormAttributes> = {};
						if (value.borderType !== undefined) {
							updates.rangeBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.rangeBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.rangeBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>
			</AccordionPanel>

			{/* ========================================
			    7. Switcher
			    ======================================== */}
			<AccordionPanel id="switcher" title={__('Switcher', 'voxel-fse')}>
				<SectionHeading label={__('Switch slider', 'voxel-fse')} />
				<ColorPickerControl
					label={__('Switch slider background (Inactive)', 'voxel-fse')}
					value={attributes.switcherBackgroundInactive}
					onChange={(value) => setAttributes({ switcherBackgroundInactive: value })}
				/>
				<ColorPickerControl
					label={__('Switch slider background (Active)', 'voxel-fse')}
					value={attributes.switcherBackgroundActive}
					onChange={(value) => setAttributes({ switcherBackgroundActive: value })}
				/>
				<ColorPickerControl
					label={__('Handle background', 'voxel-fse')}
					value={attributes.switcherHandleBackground}
					onChange={(value) => setAttributes({ switcherHandleBackground: value })}
				/>
			</AccordionPanel>

			{/* ========================================
			    8. Checkbox
			    ======================================== */}
			<AccordionPanel id="checkbox" title={__('Checkbox', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Checkbox size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="checkboxSize"
					min={10}
					max={50}
					controlKey="checkboxSize"
				/>
				<ResponsiveRangeControl
					label={__('Checkbox radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="checkboxRadius"
					min={0}
					max={25}
					controlKey="checkboxRadius"
				/>
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.checkboxBorderType || '',
						borderWidth: attributes.checkboxBorderWidth || {},
						borderColor: attributes.checkboxBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<SearchFormAttributes> = {};
						if (value.borderType !== undefined) {
							updates.checkboxBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.checkboxBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.checkboxBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>
				<ColorPickerControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					value={attributes.checkboxBackgroundUnchecked}
					onChange={(value) => setAttributes({ checkboxBackgroundUnchecked: value })}
				/>
				<ColorPickerControl
					label={__('Background color (checked)', 'voxel-fse')}
					value={attributes.checkboxBackgroundChecked}
					onChange={(value) => setAttributes({ checkboxBackgroundChecked: value })}
				/>
				<ColorPickerControl
					label={__('Border-color (checked)', 'voxel-fse')}
					value={attributes.checkboxBorderColorChecked}
					onChange={(value) => setAttributes({ checkboxBorderColorChecked: value })}
				/>
			</AccordionPanel>

			{/* ========================================
			    9. Radio
			    ======================================== */}
			<AccordionPanel id="radio" title={__('Radio', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Radio size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="radioSize"
					min={10}
					max={50}
					controlKey="radioSize"
				/>
				<ResponsiveRangeControl
					label={__('Radio radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="radioRadius"
					min={0}
					max={25}
					controlKey="radioRadius"
				/>
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.radioBorderType || '',
						borderWidth: attributes.radioBorderWidth || {},
						borderColor: attributes.radioBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<SearchFormAttributes> = {};
						if (value.borderType !== undefined) {
							updates.radioBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.radioBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.radioBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>
				<ColorPickerControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					value={attributes.radioBackgroundUnchecked}
					onChange={(value) => setAttributes({ radioBackgroundUnchecked: value })}
				/>
				<ColorPickerControl
					label={__('Background color (checked)', 'voxel-fse')}
					value={attributes.radioBackgroundChecked}
					onChange={(value) => setAttributes({ radioBackgroundChecked: value })}
				/>
				<ColorPickerControl
					label={__('Border-color (checked)', 'voxel-fse')}
					value={attributes.radioBorderColorChecked}
					onChange={(value) => setAttributes({ radioBorderColorChecked: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
