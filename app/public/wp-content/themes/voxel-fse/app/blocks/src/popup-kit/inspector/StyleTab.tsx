/**
 * Popup Kit Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the MANDATORY inspector folder structure pattern.
 * Contains all 22 Style accordion sections converted from PanelBody to AccordionPanel.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	TextControl,
} from '@wordpress/components';
import {
	ResponsiveRangeControlWithDropdown,
	TypographyPopup,
	BoxShadowPopup,
	DimensionsControl,
	StateTabPanel,
	ColorPickerControl,
	AccordionPanelGroup,
	AccordionPanel,
	BorderGroupControl,
} from '@shared/controls';
import type { PopupKitBlockAttributes } from '../types';

interface StyleTabProps {
	attributes: PopupKitBlockAttributes;
	setAttributes: (attrs: Partial<PopupKitBlockAttributes>) => void;
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
			{/* 1. Popup: General */}
			<AccordionPanel id="general" title={__('Popup: General', 'voxel-fse')}>
				<h3 style={{ marginTop: 0 }}>
					{__('General', 'voxel-fse')}
				</h3>

				<ColorPickerControl
					label={__('Background', 'voxel-fse')}
					value={attributes.pgBackground}
					onChange={(value) => setAttributes({ pgBackground: value })}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Top/Bottom margin', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pgTopMargin"
					min={0}
					max={200}
					step={1}
					availableUnits={['px']}
					unitAttributeName="pgTopMarginUnit"
					help={__('Does not affect mobile', 'voxel-fse')}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="pgShadow"
				/>

				<BorderGroupControl
					value={{
						borderType: attributes.pgBorder?.type || '',
						borderWidth: attributes.pgBorder?.width ? { top: attributes.pgBorder.width, right: attributes.pgBorder.width, bottom: attributes.pgBorder.width, left: attributes.pgBorder.width } : {},
						borderColor: attributes.pgBorder?.color || '',
					}}
					onChange={(value) => {
						setAttributes({
							pgBorder: {
								...attributes.pgBorder,
								type: value.borderType,
								width: value.borderWidth?.top as number | undefined,
								color: value.borderColor,
							},
						});
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pgRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
					unitAttributeName="pgRadiusUnit"
				/>

				<ColorPickerControl
					label={__('Scroll background color', 'voxel-fse')}
					value={attributes.pgScrollColor}
					onChange={(value) => setAttributes({ pgScrollColor: value })}
				/>

				<ToggleControl
					label={__('Disable reveal animation', 'voxel-fse')}
					checked={attributes.disableRevealFx || false}
					onChange={(value: boolean) => setAttributes({ disableRevealFx: value })}
				/>

				<ColorPickerControl
					label={__('Separator color', 'voxel-fse')}
					value={attributes.pgTitleSeparator}
					onChange={(value) => setAttributes({ pgTitleSeparator: value })}
				/>

				<h4>{__('Global Typography', 'voxel-fse')}</h4>
				<TextControl
					label={__('Font family', 'voxel-fse')}
					value={attributes.elementorFontFamily || ''}
					onChange={(value: string) => setAttributes({ elementorFontFamily: value })}
					help={__('Leave empty to use WordPress Global Styles font (var(--wp--preset--font-family--system)). Enter custom font family to override.', 'voxel-fse')}
				/>
			</AccordionPanel>

			{/* 2. Popup: Head */}
			<AccordionPanel id="head" title={__('Popup: Head', 'voxel-fse')}>
				<h3 style={{ marginTop: 0 }}>
					{__('Popup title', 'voxel-fse')}
				</h3>

				<ResponsiveRangeControlWithDropdown
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="phIconSize"
					min={20}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Icon/Text spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="phIconSpacing"
					min={20}
					max={40}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.phIconColor}
					onChange={(value) => setAttributes({ phIconColor: value })}
				/>

				<ColorPickerControl
					label={__('Title color', 'voxel-fse')}
					value={attributes.phTitleColor}
					onChange={(value) => setAttributes({ phTitleColor: value })}
				/>

				<TypographyPopup
					label={__('Title typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="phTitleTypo"
					fontFamilyAttributeName="phTitleFontFamily"
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Avatar size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="phAvatarSize"
					min={20}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Avatar radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="phAvatarRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
					unitAttributeName="phAvatarRadiusUnit"
					showResetButton={true}
				/>
			</AccordionPanel>

			{/* 3. Popup: Buttons */}
			<AccordionPanel id="buttons" title={__('Popup: Buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pbActiveTab"
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
									<h4 style={{ marginTop: 0 }}>{__('General', 'voxel-fse')}</h4>

									<TypographyPopup
										label={__('Button typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pbTypo"
										fontFamilyAttributeName="pbTypoFontFamily"
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pbRadius"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
										unitAttributeName="pbRadiusUnit"
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Primary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton1Bg}
										onChange={(value) => setAttributes({ pbButton1Bg: value })}
									/>
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pbButton1Text}
										onChange={(value) => setAttributes({ pbButton1Text: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pbButton1Icon}
										onChange={(value) => setAttributes({ pbButton1Icon: value })}
									/>
									<BorderGroupControl
										value={{
											borderType: attributes.pbButton1Border?.type || '',
											borderWidth: attributes.pbButton1Border?.width ? { top: attributes.pbButton1Border.width, right: attributes.pbButton1Border.width, bottom: attributes.pbButton1Border.width, left: attributes.pbButton1Border.width } : {},
											borderColor: attributes.pbButton1Border?.color || '',
										}}
										onChange={(value) => {
											setAttributes({
												pbButton1Border: {
													...attributes.pbButton1Border,
													type: value.borderType,
													width: value.borderWidth?.top as number | undefined,
													color: value.borderColor,
												},
											});
										}}
										hideRadius={true}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Secondary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton2Bg}
										onChange={(value) => setAttributes({ pbButton2Bg: value })}
									/>
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pbButton2Text}
										onChange={(value) => setAttributes({ pbButton2Text: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pbButton2Icon}
										onChange={(value) => setAttributes({ pbButton2Icon: value })}
									/>
									<BorderGroupControl
										value={{
											borderType: attributes.pbButton2Border?.type || '',
											borderWidth: attributes.pbButton2Border?.width ? { top: attributes.pbButton2Border.width, right: attributes.pbButton2Border.width, bottom: attributes.pbButton2Border.width, left: attributes.pbButton2Border.width } : {},
											borderColor: attributes.pbButton2Border?.color || '',
										}}
										onChange={(value) => {
											setAttributes({
												pbButton2Border: {
													...attributes.pbButton2Border,
													type: value.borderType,
													width: value.borderWidth?.top as number | undefined,
													color: value.borderColor,
												},
											});
										}}
										hideRadius={true}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Tertiary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton3Bg}
										onChange={(value) => setAttributes({ pbButton3Bg: value })}
									/>
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pbButton3Text}
										onChange={(value) => setAttributes({ pbButton3Text: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pbButton3Icon}
										onChange={(value) => setAttributes({ pbButton3Icon: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<h4 style={{ marginTop: 0 }}>{__('Primary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton1HoverBg}
										onChange={(value) => setAttributes({ pbButton1HoverBg: value })}
									/>
									<ColorPickerControl
										label={__('Button color', 'voxel-fse')}
										value={attributes.pbButton1HoverText}
										onChange={(value) => setAttributes({ pbButton1HoverText: value })}
									/>
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.pbButton1HoverBorder}
										onChange={(value) => setAttributes({ pbButton1HoverBorder: value })}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Secondary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton2HoverBg}
										onChange={(value) => setAttributes({ pbButton2HoverBg: value })}
									/>
									<ColorPickerControl
										label={__('Button color', 'voxel-fse')}
										value={attributes.pbButton2HoverText}
										onChange={(value) => setAttributes({ pbButton2HoverText: value })}
									/>
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.pbButton2HoverBorder}
										onChange={(value) => setAttributes({ pbButton2HoverBorder: value })}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Tertiary button', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pbButton3HoverBg}
										onChange={(value) => setAttributes({ pbButton3HoverBg: value })}
									/>
									<ColorPickerControl
										label={__('Button color', 'voxel-fse')}
										value={attributes.pbButton3HoverText}
										onChange={(value) => setAttributes({ pbButton3HoverText: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 4. Popup: Label and description */}
			<AccordionPanel id="label" title={__('Popup: Label and description', 'voxel-fse')}>
				<h4 style={{ marginTop: 0 }}>{__('Label', 'voxel-fse')}</h4>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="plLabelTypo"
					fontFamilyAttributeName="plLabelTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.plLabelColor}
					onChange={(value) => setAttributes({ plLabelColor: value })}
				/>

				<h4 style={{ marginTop: '24px' }}>{__('Field description', 'voxel-fse')}</h4>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="plDescTypo"
					fontFamilyAttributeName="plDescTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.plDescColor}
					onChange={(value) => setAttributes({ plDescColor: value })}
				/>
			</AccordionPanel>

			{/* 5. Popup: Menu styling */}
			<AccordionPanel id="menu" title={__('Popup: Menu styling', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pmActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'selected', title: __('Selected', 'voxel-fse') },
						{ name: 'parent', title: __('Parent', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<h4 style={{ marginTop: 0 }}>{__('Item', 'voxel-fse')}</h4>

									<DimensionsControl
										label={__('Item padding', 'voxel-fse')}
										values={{
											top: attributes.pmItemPadding?.top || '',
											right: attributes.pmItemPadding?.right || '',
											bottom: attributes.pmItemPadding?.bottom || '',
											left: attributes.pmItemPadding?.left || '',
										}}
										onChange={(values) => setAttributes({
											pmItemPadding: {
												...attributes.pmItemPadding,
												...values
											}
										})}
										isLinked={attributes.pmItemPaddingLinked !== false}
										onLinkedChange={(linked) => setAttributes({ pmItemPaddingLinked: linked })}
										availableUnits={['px', '%', 'em']}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Height', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pmItemHeight"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									<ColorPickerControl
										label={__('Separator color', 'voxel-fse')}
										value={attributes.pmSeparatorColor}
										onChange={(value) => setAttributes({ pmSeparatorColor: value })}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Title', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pmTitleColor}
										onChange={(value) => setAttributes({ pmTitleColor: value })}
									/>
									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pmTitleTypo"
										fontFamilyAttributeName="pmTitleTypoFontFamily"
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Icon', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pmIconColor}
										onChange={(value) => setAttributes({ pmIconColor: value })}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pmIconSize"
										min={0}
										max={40}
										step={1}
										availableUnits={['px']}
									/>
									<ResponsiveRangeControlWithDropdown
										label={__('Spacing', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pmIconSpacing"
										min={0}
										max={50}
										step={1}
										availableUnits={['px']}
									/>

									<h4 style={{ marginTop: '24px' }}>{__('Chevron', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.pmChevronColor}
										onChange={(value) => setAttributes({ pmChevronColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<h4 style={{ marginTop: 0 }}>{__('Term item', 'voxel-fse')}</h4>
									<ColorPickerControl
										label={__('List item background', 'voxel-fse')}
										value={attributes.pmHoverBg}
										onChange={(value) => setAttributes({ pmHoverBg: value })}
									/>
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pmHoverTitleColor}
										onChange={(value) => setAttributes({ pmHoverTitleColor: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pmHoverIconColor}
										onChange={(value) => setAttributes({ pmHoverIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'selected' && (
								<>
									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pmSelectedTitleTypo"
										fontFamilyAttributeName="pmSelectedTitleTypoFontFamily"
									/>
									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pmSelectedTitleColor}
										onChange={(value) => setAttributes({ pmSelectedTitleColor: value })}
									/>
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pmSelectedIconColor}
										onChange={(value) => setAttributes({ pmSelectedIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'parent' && (
								<>
									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pmParentTitleTypo"
										fontFamilyAttributeName="pmParentTitleTypoFontFamily"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 6. Popup: Cart */}
			<AccordionPanel id="cart" title={__('Popup: Cart', 'voxel-fse')}>
				<ResponsiveRangeControlWithDropdown
					label={__('Item spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcItemSpacing"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Item content spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcItemContentSpacing"
					min={0}
					max={50}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Picture size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcPictureSize"
					min={16}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Picture radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcPictureRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
				/>

				<TypographyPopup
					label={__('Title typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcTitleTypo"
					fontFamilyAttributeName="pcTitleTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcTitleColor}
					onChange={(value) => setAttributes({ pcTitleColor: value })}
				/>

				<TypographyPopup
					label={__('Subtitle typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcSubtitleTypo"
					fontFamilyAttributeName="pcSubtitleTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Subtitle Color', 'voxel-fse')}
					value={attributes.pcSubtitleColor}
					onChange={(value) => setAttributes({ pcSubtitleColor: value })}
				/>
			</AccordionPanel>

			{/* 7. Popup: Subtotal */}
			<AccordionPanel id="subtotal" title={__('Popup: Subtotal', 'voxel-fse')}>
				<TypographyPopup
					label={__('Typography (Total)', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="psSubtotalTypo"
					fontFamilyAttributeName="psSubtotalTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Text color (Total)', 'voxel-fse')}
					value={attributes.psSubtotalColor}
					onChange={(value) => setAttributes({ psSubtotalColor: value })}
				/>
			</AccordionPanel>

			{/* 8. Popup: No results */}
			<AccordionPanel id="noresults" title={__('Popup: No results', 'voxel-fse')}>
				<ResponsiveRangeControlWithDropdown
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pnIconSize"
					min={20}
					max={50}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.pnIconColor}
					onChange={(value) => setAttributes({ pnIconColor: value })}
				/>

				<ColorPickerControl
					label={__('Title color', 'voxel-fse')}
					value={attributes.pnTitleColor}
					onChange={(value) => setAttributes({ pnTitleColor: value })}
				/>

				<TypographyPopup
					label={__('Title typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pnTitleTypo"
					fontFamilyAttributeName="pnTitleTypoFontFamily"
				/>
			</AccordionPanel>

			{/* 9. Popup: Checkbox */}
			<AccordionPanel id="checkbox" title={__('Popup: Checkbox', 'voxel-fse')}>
				<ResponsiveRangeControlWithDropdown
					label={__('Checkbox size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcCheckboxSize"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Checkbox radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pcCheckboxRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
				/>

				<BorderGroupControl
					value={{
						borderType: attributes.pcCheckboxBorder?.type || 'solid',
						borderWidth: attributes.pcCheckboxBorderWidth ? { top: attributes.pcCheckboxBorderWidth, right: attributes.pcCheckboxBorderWidth, bottom: attributes.pcCheckboxBorderWidth, left: attributes.pcCheckboxBorderWidth } : {},
						borderColor: attributes.pcCheckboxBorder?.color || '',
					}}
					onChange={(value) => {
						const updates: Record<string, any> = {
							pcCheckboxBorder: {
								...attributes.pcCheckboxBorder,
								type: value.borderType,
								color: value.borderColor,
							},
						};
						if (value.borderWidth?.top !== undefined) {
							updates.pcCheckboxBorderWidth = value.borderWidth.top;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ColorPickerControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					value={attributes.pcCheckboxBgUnchecked}
					onChange={(value) => setAttributes({ pcCheckboxBgUnchecked: value })}
				/>

				<ColorPickerControl
					label={__('Background color (checked)', 'voxel-fse')}
					value={attributes.pcCheckboxBgChecked}
					onChange={(value) => setAttributes({ pcCheckboxBgChecked: value })}
				/>

				<ColorPickerControl
					label={__('Border-color (checked)', 'voxel-fse')}
					value={attributes.pcCheckboxBorderChecked}
					onChange={(value) => setAttributes({ pcCheckboxBorderChecked: value })}
				/>
			</AccordionPanel>

			{/* 10. Popup: Radio */}
			<AccordionPanel id="radio" title={__('Popup: Radio', 'voxel-fse')}>
				<ResponsiveRangeControlWithDropdown
					label={__('Radio size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="prRadioSize"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Radio radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="prRadioRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
				/>

				<BorderGroupControl
					value={{
						borderType: attributes.prRadioBorder?.type || 'solid',
						borderWidth: attributes.prRadioBorderWidth ? { top: attributes.prRadioBorderWidth, right: attributes.prRadioBorderWidth, bottom: attributes.prRadioBorderWidth, left: attributes.prRadioBorderWidth } : {},
						borderColor: attributes.prRadioBorder?.color || '',
					}}
					onChange={(value) => {
						const updates: Record<string, any> = {
							prRadioBorder: {
								...attributes.prRadioBorder,
								type: value.borderType,
								color: value.borderColor,
							},
						};
						if (value.borderWidth?.top !== undefined) {
							updates.prRadioBorderWidth = value.borderWidth.top;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ColorPickerControl
					label={__('Background color (unchecked)', 'voxel-fse')}
					value={attributes.prRadioBgUnchecked}
					onChange={(value) => setAttributes({ prRadioBgUnchecked: value })}
				/>

				<ColorPickerControl
					label={__('Background color (checked)', 'voxel-fse')}
					value={attributes.prRadioBgChecked}
					onChange={(value) => setAttributes({ prRadioBgChecked: value })}
				/>

				<ColorPickerControl
					label={__('Border-color (checked)', 'voxel-fse')}
					value={attributes.prRadioBorderChecked}
					onChange={(value) => setAttributes({ prRadioBorderChecked: value })}
				/>
			</AccordionPanel>

			{/* 11. Popup: Input styling */}
			<AccordionPanel id="input" title={__('Popup: Input styling', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Input', 'voxel-fse')}</strong>
				</div>

				<ResponsiveRangeControlWithDropdown
					label={__('Input height', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="piInputHeight"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
				/>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="piInputTypo"
					fontFamilyAttributeName="piInputTypoFontFamily"
				/>

				<DimensionsControl
					label={__('Input padding', 'voxel-fse')}
					values={attributes.piInputPadding || {}}
					onChange={(values) => setAttributes({ piInputPadding: values })}
					isLinked={attributes.piInputPaddingLinked !== false}
					onLinkedChange={(linked) => setAttributes({ piInputPaddingLinked: linked })}
				/>

				<DimensionsControl
					label={__('Input padding (Input with icon)', 'voxel-fse')}
					values={attributes.piInputPaddingIcon || {}}
					onChange={(values) => setAttributes({ piInputPaddingIcon: values })}
					isLinked={attributes.piInputPaddingIconLinked !== false}
					onLinkedChange={(linked) => setAttributes({ piInputPaddingIconLinked: linked })}
				/>

				<ColorPickerControl
					label={__('Input value color', 'voxel-fse')}
					value={attributes.piInputValueColor}
					onChange={(value) => setAttributes({ piInputValueColor: value })}
				/>

				<ColorPickerControl
					label={__('Input placeholder color', 'voxel-fse')}
					value={attributes.piInputPlaceholderColor}
					onChange={(value) => setAttributes({ piInputPlaceholderColor: value })}
				/>

				<ColorPickerControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.piIconColor}
					onChange={(value) => setAttributes({ piIconColor: value })}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Input icon size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="piIconSize"
					unitAttributeName="piIconSizeUnit"
					min={0}
					max={40}
					step={1}
					availableUnits={['px', '%']}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Input icon left margin', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="piIconLeftMargin"
					unitAttributeName="piIconLeftMarginUnit"
					min={0}
					max={40}
					step={1}
					availableUnits={['px', '%']}
				/>
			</AccordionPanel>

			{/* 12. Popup: File/Gallery */}
			<AccordionPanel id="file" title={__('Popup: File/Gallery', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pfActiveTab"
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
									<ResponsiveRangeControlWithDropdown
										label={__('Item gap', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfItemGap"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Select files', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pfIconColor}
										onChange={(value) => setAttributes({ pfIconColor: value })}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfIconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pfBackground}
										onChange={(value) => setAttributes({ pfBackground: value })}
									/>

									<BorderGroupControl
										value={{
											borderType: attributes.pfBorder?.type || 'solid',
											borderWidth: attributes.pfBorderWidth ? { top: attributes.pfBorderWidth, right: attributes.pfBorderWidth, bottom: attributes.pfBorderWidth, left: attributes.pfBorderWidth } : {},
											borderColor: attributes.pfBorder?.color || '',
										}}
										onChange={(value) => {
											const updates: Record<string, any> = {
												pfBorder: {
													...attributes.pfBorder,
													type: value.borderType,
													color: value.borderColor,
												},
											};
											if (value.borderWidth?.top !== undefined) {
												updates.pfBorderWidth = value.borderWidth.top;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfBorderRadius"
										unitAttributeName="pfBorderRadiusUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pfTypo"
										fontFamilyAttributeName="pfTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pfTextColor}
										onChange={(value) => setAttributes({ pfTextColor: value })}
									/>

									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Added file/image', 'voxel-fse')}</strong>
									</div>

									<ResponsiveRangeControlWithDropdown
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfAddedBorderRadius"
										unitAttributeName="pfAddedBorderRadiusUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pfAddedBackground}
										onChange={(value) => setAttributes({ pfAddedBackground: value })}
									/>

									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pfAddedIconColor}
										onChange={(value) => setAttributes({ pfAddedIconColor: value })}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfAddedIconSize"
										unitAttributeName="pfAddedIconSizeUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pfAddedTypo"
										fontFamilyAttributeName="pfAddedTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pfAddedTextColor}
										onChange={(value) => setAttributes({ pfAddedTextColor: value })}
									/>

									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Remove/Check button', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pfRemoveBackground}
										onChange={(value) => setAttributes({ pfRemoveBackground: value })}
									/>

									<ColorPickerControl
										label={__('Background (Hover)', 'voxel-fse')}
										value={attributes.pfRemoveBackgroundHover}
										onChange={(value) => setAttributes({ pfRemoveBackgroundHover: value })}
									/>

									<ColorPickerControl
										label={__('Color', 'voxel-fse')}
										value={attributes.pfRemoveColor}
										onChange={(value) => setAttributes({ pfRemoveColor: value })}
									/>

									<ColorPickerControl
										label={__('Color (Hover)', 'voxel-fse')}
										value={attributes.pfRemoveColorHover}
										onChange={(value) => setAttributes({ pfRemoveColorHover: value })}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfRemoveBorderRadius"
										unitAttributeName="pfRemoveBorderRadiusUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfRemoveSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pfRemoveIconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Select files', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.pfIconColorHover}
										onChange={(value) => setAttributes({ pfIconColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.pfBackgroundHover}
										onChange={(value) => setAttributes({ pfBackgroundHover: value })}
									/>

									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.pfBorderColorHover}
										onChange={(value) => setAttributes({ pfBorderColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.pfTextColorHover}
										onChange={(value) => setAttributes({ pfTextColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 13. Popup: Number */}
			<AccordionPanel id="number" title={__('Popup: Number', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Number popup', 'voxel-fse')}</strong>
				</div>

				<ResponsiveRangeControlWithDropdown
					label={__('Input value size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pnNumberInputSize"
					min={13}
					max={30}
					step={1}
					availableUnits={['px']}
				/>
			</AccordionPanel>

			{/* 14. Popup: Range slider */}
			<AccordionPanel id="range" title={__('Popup: Range slider', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Range slider', 'voxel-fse')}</strong>
				</div>

				<ResponsiveRangeControlWithDropdown
					label={__('Range value size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="prRangeValueSize"
					min={13}
					max={30}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Range value color', 'voxel-fse')}
					value={attributes.prRangeValueColor}
					onChange={(value) => setAttributes({ prRangeValueColor: value })}
				/>

				<ColorPickerControl
					label={__('Range background', 'voxel-fse')}
					value={attributes.prRangeBg}
					onChange={(value) => setAttributes({ prRangeBg: value })}
				/>

				<ColorPickerControl
					label={__('Selected range background', 'voxel-fse')}
					value={attributes.prRangeBgSelected}
					onChange={(value) => setAttributes({ prRangeBgSelected: value })}
				/>

				<ColorPickerControl
					label={__('Handle background color', 'voxel-fse')}
					value={attributes.prRangeHandleBg}
					onChange={(value) => setAttributes({ prRangeHandleBg: value })}
				/>

				<BorderGroupControl
					label={__('Handle Border', 'voxel-fse')}
					value={{
						borderType: attributes.prRangeHandleBorder?.type || '',
						borderWidth: attributes.prRangeHandleBorderWidth ? { top: attributes.prRangeHandleBorderWidth, right: attributes.prRangeHandleBorderWidth, bottom: attributes.prRangeHandleBorderWidth, left: attributes.prRangeHandleBorderWidth } : {},
						borderColor: attributes.prRangeHandleBorder?.color || '',
					}}
					onChange={(value) => {
						const updates: Record<string, any> = {
							prRangeHandleBorder: {
								...attributes.prRangeHandleBorder,
								type: value.borderType,
								color: value.borderColor,
							},
						};
						if (value.borderWidth?.top !== undefined) {
							updates.prRangeHandleBorderWidth = value.borderWidth.top;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>
			</AccordionPanel>

			{/* 15. Popup: Switch */}
			<AccordionPanel id="switch" title={__('Popup: Switch', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Switch slider', 'voxel-fse')}</strong>
				</div>

				<ColorPickerControl
					label={__('Switch slider background (Inactive)', 'voxel-fse')}
					value={attributes.psSwitchBgInactive}
					onChange={(value) => setAttributes({ psSwitchBgInactive: value })}
				/>

				<ColorPickerControl
					label={__('Switch slider background (Active)', 'voxel-fse')}
					value={attributes.psSwitchBgActive}
					onChange={(value) => setAttributes({ psSwitchBgActive: value })}
				/>

				<ColorPickerControl
					label={__('Handle background', 'voxel-fse')}
					value={attributes.psSwitchHandleBg}
					onChange={(value) => setAttributes({ psSwitchHandleBg: value })}
				/>
			</AccordionPanel>

			{/* 16. Popup: Icon Button */}
			<AccordionPanel id="icon-button" title={__('Popup: Icon Button', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pibActiveTab"
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
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Button styling', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.pibIconColor}
										onChange={(value) => setAttributes({ pibIconColor: value })}
									/>

									<ColorPickerControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.pibBg}
										onChange={(value) => setAttributes({ pibBg: value })}
									/>

									<BorderGroupControl
										value={{
											borderType: attributes.pibBorder?.type || '',
											borderWidth: attributes.pibBorderWidth ? { top: attributes.pibBorderWidth, right: attributes.pibBorderWidth, bottom: attributes.pibBorderWidth, left: attributes.pibBorderWidth } : {},
											borderColor: attributes.pibBorder?.color || '',
										}}
										onChange={(value) => {
											const updates: Record<string, any> = {
												pibBorder: {
													...attributes.pibBorder,
													type: value.borderType,
													color: value.borderColor,
												},
											};
											if (value.borderWidth?.top !== undefined) {
												updates.pibBorderWidth = value.borderWidth.top;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pibRadius"
										unitAttributeName="pibRadiusUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorPickerControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.pibIconColorHover}
										onChange={(value) => setAttributes({ pibIconColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.pibBgHover}
										onChange={(value) => setAttributes({ pibBgHover: value })}
									/>

									<ColorPickerControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.pibBorderColorHover}
										onChange={(value) => setAttributes({ pibBorderColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 17. Popup: Datepicker head */}
			<AccordionPanel id="datepicker-head" title={__('Popup: Datepicker head', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Title', 'voxel-fse')}</strong>
				</div>

				<ResponsiveRangeControlWithDropdown
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pdhIconSize"
					min={20}
					max={40}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.pdhIconColor}
					onChange={(value) => setAttributes({ pdhIconColor: value })}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Icon/Text spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pdhIconSpacing"
					min={20}
					max={40}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Title color', 'voxel-fse')}
					value={attributes.pdhTitleColor}
					onChange={(value) => setAttributes({ pdhTitleColor: value })}
				/>

				<TypographyPopup
					label={__('Title typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pdhTitleTypo"
					fontFamilyAttributeName="pdhTitleTypoFontFamily"
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Subtitle', 'voxel-fse')}</strong>
				</div>

				<ColorPickerControl
					label={__('Subtitle color', 'voxel-fse')}
					value={attributes.pdhSubtitleColor}
					onChange={(value) => setAttributes({ pdhSubtitleColor: value })}
				/>

				<TypographyPopup
					label={__('Subtitle typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pdhSubtitleTypo"
					fontFamilyAttributeName="pdhSubtitleTypoFontFamily"
				/>
			</AccordionPanel>

			{/* 18. Popup: Datepicker tooltips */}
			<AccordionPanel id="datepicker-tooltips" title={__('Popup: Datepicker tooltips', 'voxel-fse')}>
				<ColorPickerControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.pdtBgColor}
					onChange={(value) => setAttributes({ pdtBgColor: value })}
				/>

				<ColorPickerControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.pdtTextColor}
					onChange={(value) => setAttributes({ pdtTextColor: value })}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="pdtRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
				/>
			</AccordionPanel>

			{/* 19. Popup: Calendar */}
			<AccordionPanel id="calendar" title={__('Popup: Calendar', 'voxel-fse')}>
				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Months', 'voxel-fse')}</strong>
				</div>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcalMonthsTypo"
					fontFamilyAttributeName="pcalMonthsTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalMonthsColor}
					onChange={(value) => setAttributes({ pcalMonthsColor: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Days of the week', 'voxel-fse')}</strong>
				</div>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcalDaysTypo"
					fontFamilyAttributeName="pcalDaysTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalDaysColor}
					onChange={(value) => setAttributes({ pcalDaysColor: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Dates (available)', 'voxel-fse')}</strong>
				</div>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcalAvailableTypo"
					fontFamilyAttributeName="pcalAvailableTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalAvailableColor}
					onChange={(value) => setAttributes({ pcalAvailableColor: value })}
				/>

				<ColorPickerControl
					label={__('Color (Hover)', 'voxel-fse')}
					value={attributes.pcalAvailableColorHover}
					onChange={(value) => setAttributes({ pcalAvailableColorHover: value })}
				/>

				<ColorPickerControl
					label={__('Background (Hover)', 'voxel-fse')}
					value={attributes.pcalAvailableBgHover}
					onChange={(value) => setAttributes({ pcalAvailableBgHover: value })}
				/>

				<ColorPickerControl
					label={__('Border color (Hover)', 'voxel-fse')}
					value={attributes.pcalAvailableBorderHover}
					onChange={(value) => setAttributes({ pcalAvailableBorderHover: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Dates (Range)', 'voxel-fse')}</strong>
				</div>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalRangeColor}
					onChange={(value) => setAttributes({ pcalRangeColor: value })}
				/>

				<ColorPickerControl
					label={__('Background', 'voxel-fse')}
					value={attributes.pcalRangeBg}
					onChange={(value) => setAttributes({ pcalRangeBg: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Dates (Range start and end)', 'voxel-fse')}</strong>
				</div>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalRangeStartEndColor}
					onChange={(value) => setAttributes({ pcalRangeStartEndColor: value })}
				/>

				<ColorPickerControl
					label={__('Background', 'voxel-fse')}
					value={attributes.pcalRangeStartEndBg}
					onChange={(value) => setAttributes({ pcalRangeStartEndBg: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Dates (Selected - Single date)', 'voxel-fse')}</strong>
				</div>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalSelectedColor}
					onChange={(value) => setAttributes({ pcalSelectedColor: value })}
				/>

				<ColorPickerControl
					label={__('Background', 'voxel-fse')}
					value={attributes.pcalSelectedBg}
					onChange={(value) => setAttributes({ pcalSelectedBg: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Dates (disabled)', 'voxel-fse')}</strong>
				</div>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="pcalDisabledTypo"
					fontFamilyAttributeName="pcalDisabledTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Color', 'voxel-fse')}
					value={attributes.pcalDisabledColor}
					onChange={(value) => setAttributes({ pcalDisabledColor: value })}
				/>

				<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<strong>{__('Other settings', 'voxel-fse')}</strong>
				</div>
			</AccordionPanel>

			{/* 20. Popup: Notifications */}
			<AccordionPanel id="notifications" title={__('Popup: Notifications', 'voxel-fse')}>
				<StateTabPanel
					attributeName="pnotActiveTab"
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
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Single notification', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pnotTitleColor}
										onChange={(value) => setAttributes({ pnotTitleColor: value })}
									/>

									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pnotTitleTypo"
										fontFamilyAttributeName="pnotTitleTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Subtitle color', 'voxel-fse')}
										value={attributes.pnotSubtitleColor}
										onChange={(value) => setAttributes({ pnotSubtitleColor: value })}
									/>

									<TypographyPopup
										label={__('Subtitle typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pnotSubtitleTypo"
										fontFamilyAttributeName="pnotSubtitleTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pnotIconColor}
										onChange={(value) => setAttributes({ pnotIconColor: value })}
									/>

									<ColorPickerControl
										label={__('Icon background', 'voxel-fse')}
										value={attributes.pnotIconBg}
										onChange={(value) => setAttributes({ pnotIconBg: value })}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pnotIconSize"
										min={20}
										max={50}
										step={1}
										availableUnits={['px']}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Icon container size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pnotIconContainerSize"
										min={20}
										max={50}
										step={1}
										availableUnits={['px']}
									/>

									<ResponsiveRangeControlWithDropdown
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="pnotBorderRadius"
										unitAttributeName="pnotBorderRadiusUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Unvisited notification', 'voxel-fse')}</strong>
									</div>

									<TypographyPopup
										label={__('Title typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="pnotUnvisitedTitleTypo"
										fontFamilyAttributeName="pnotUnvisitedTitleTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pnotUnvisitedTitleColor}
										onChange={(value) => setAttributes({ pnotUnvisitedTitleColor: value })}
									/>

									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Unseen notification', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pnotUnseenIconColor}
										onChange={(value) => setAttributes({ pnotUnseenIconColor: value })}
									/>

									<ColorPickerControl
										label={__('Icon background', 'voxel-fse')}
										value={attributes.pnotUnseenIconBg}
										onChange={(value) => setAttributes({ pnotUnseenIconBg: value })}
									/>

									<BorderGroupControl
										label={__('Icon/Picture Border', 'voxel-fse')}
										value={{
											borderType: attributes.pnotUnseenBorder?.type || '',
											borderWidth: attributes.pnotUnseenBorderWidth ? { top: attributes.pnotUnseenBorderWidth, right: attributes.pnotUnseenBorderWidth, bottom: attributes.pnotUnseenBorderWidth, left: attributes.pnotUnseenBorderWidth } : {},
											borderColor: attributes.pnotUnseenBorder?.color || '',
										}}
										onChange={(value) => {
											const updates: Record<string, any> = {
												pnotUnseenBorder: {
													...attributes.pnotUnseenBorder,
													type: value.borderType,
													color: value.borderColor,
												},
											};
											if (value.borderWidth?.top !== undefined) {
												updates.pnotUnseenBorderWidth = value.borderWidth.top;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Notifications/Messages item', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.pnotBgHover}
										onChange={(value) => setAttributes({ pnotBgHover: value })}
									/>

									<ColorPickerControl
										label={__('Title color', 'voxel-fse')}
										value={attributes.pnotTitleColorHover}
										onChange={(value) => setAttributes({ pnotTitleColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Subtitle color', 'voxel-fse')}
										value={attributes.pnotSubtitleColorHover}
										onChange={(value) => setAttributes({ pnotSubtitleColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.pnotIconColorHover}
										onChange={(value) => setAttributes({ pnotIconColorHover: value })}
									/>

									<ColorPickerControl
										label={__('Icon background', 'voxel-fse')}
										value={attributes.pnotIconBgHover}
										onChange={(value) => setAttributes({ pnotIconBgHover: value })}
									/>

									<ColorPickerControl
										label={__('Icon/Avatar border', 'voxel-fse')}
										value={attributes.pnotIconBorderHover}
										onChange={(value) => setAttributes({ pnotIconBorderHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 21. Popup: Textarea */}
			<AccordionPanel id="textarea" title={__('Popup: Textarea', 'voxel-fse')}>
				<StateTabPanel
					attributeName="ptextActiveTab"
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
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Textarea', 'voxel-fse')}</strong>
									</div>

									<ResponsiveRangeControlWithDropdown
										label={__('Textarea height', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="ptextHeight"
										unitAttributeName="ptextHeightUnit"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
									/>

									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="ptextTypo"
										fontFamilyAttributeName="ptextTypoFontFamily"
									/>

									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.ptextBg}
										onChange={(value) => setAttributes({ ptextBg: value })}
									/>

									<ColorPickerControl
										label={__('Background color (Focus)', 'voxel-fse')}
										value={attributes.ptextBgFocus}
										onChange={(value) => setAttributes({ ptextBgFocus: value })}
									/>

									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.ptextTextColor}
										onChange={(value) => setAttributes({ ptextTextColor: value })}
									/>

									<ColorPickerControl
										label={__('Placeholder color', 'voxel-fse')}
										value={attributes.ptextPlaceholderColor}
										onChange={(value) => setAttributes({ ptextPlaceholderColor: value })}
									/>

									<DimensionsControl
										label={__('Textarea padding', 'voxel-fse')}
										values={attributes.ptextPadding || {}}
										onChange={(values) => setAttributes({ ptextPadding: values })}
										isLinked={attributes.ptextPaddingLinked !== false}
										onLinkedChange={(linked) => setAttributes({ ptextPaddingLinked: linked })}
										availableUnits={['px', '%', 'em']}
									/>

									<BorderGroupControl
										value={{
											borderType: attributes.ptextBorder?.type || '',
											borderWidth: attributes.ptextBorderWidth ? { top: attributes.ptextBorderWidth, right: attributes.ptextBorderWidth, bottom: attributes.ptextBorderWidth, left: attributes.ptextBorderWidth } : {},
											borderColor: attributes.ptextBorder?.color || '',
										}}
										onChange={(value) => {
											const updates: Record<string, any> = {
												ptextBorder: {
													...attributes.ptextBorder,
													type: value.borderType,
													color: value.borderColor,
												},
											};
											if (value.borderWidth?.top !== undefined) {
												updates.ptextBorderWidth = value.borderWidth.top;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
										<strong>{__('Textarea', 'voxel-fse')}</strong>
									</div>

									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.ptextBgHover}
										onChange={(value) => setAttributes({ ptextBgHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 22. Popup: Alert */}
			<AccordionPanel id="alert" title={__('Popup: Alert', 'voxel-fse')}>
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="palertShadow"
				/>

				<BorderGroupControl
					value={{
						borderType: attributes.palertBorder?.type || '',
						borderWidth: attributes.palertBorderWidth ? { top: attributes.palertBorderWidth, right: attributes.palertBorderWidth, bottom: attributes.palertBorderWidth, left: attributes.palertBorderWidth } : {},
						borderColor: attributes.palertBorder?.color || '',
					}}
					onChange={(value) => {
						const updates: Record<string, any> = {
							palertBorder: {
								...attributes.palertBorder,
								type: value.borderType,
								color: value.borderColor,
							},
						};
						if (value.borderWidth?.top !== undefined) {
							updates.palertBorderWidth = value.borderWidth.top;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControlWithDropdown
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="palertRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
				/>

				<ColorPickerControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.palertBg}
					onChange={(value) => setAttributes({ palertBg: value })}
				/>

				<ColorPickerControl
					label={__('Divider color', 'voxel-fse')}
					value={attributes.palertDividerColor}
					onChange={(value) => setAttributes({ palertDividerColor: value })}
				/>

				<TypographyPopup
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="palertTypo"
					fontFamilyAttributeName="palertTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.palertTextColor}
					onChange={(value) => setAttributes({ palertTextColor: value })}
				/>

				<ColorPickerControl
					label={__('Info icon color', 'voxel-fse')}
					value={attributes.palertInfoColor}
					onChange={(value) => setAttributes({ palertInfoColor: value })}
				/>

				<ColorPickerControl
					label={__('Error icon color', 'voxel-fse')}
					value={attributes.palertErrorColor}
					onChange={(value) => setAttributes({ palertErrorColor: value })}
				/>

				<ColorPickerControl
					label={__('Success icon color', 'voxel-fse')}
					value={attributes.palertSuccessColor}
					onChange={(value) => setAttributes({ palertSuccessColor: value })}
				/>

				<TypographyPopup
					label={__('Link Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="palertLinkTypo"
					fontFamilyAttributeName="palertLinkTypoFontFamily"
				/>

				<ColorPickerControl
					label={__('Link color', 'voxel-fse')}
					value={attributes.palertLinkColor}
					onChange={(value) => setAttributes({ palertLinkColor: value })}
				/>

				<ColorPickerControl
					label={__('Link color (Hover)', 'voxel-fse')}
					value={attributes.palertLinkColorHover}
					onChange={(value) => setAttributes({ palertLinkColorHover: value })}
				/>

				<ColorPickerControl
					label={__('Link background (Hover)', 'voxel-fse')}
					value={attributes.palertLinkBgHover}
					onChange={(value) => setAttributes({ palertLinkBgHover: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
