/**
 * GeneralTab Inspector Component
 *
 * Matches Elementor's Search Form widget "General" tab with 12 accordion sections:
 * 1. General - Filter margin, label settings
 * 2. Common styles - Height, icons, borders, colors (Normal/Hover)
 * 3. Button - Padding, icon spacing (Normal/Filled)
 * 4. Input - Text colors, padding (Normal/Focus)
 * 5. Search button - Colors, border, shadow (Normal/Hover)
 * 6. Toggle button - Typography, colors, padding (Normal/Hover/Filled)
 * 7. Toggle: Active count - Colors, margin
 * 8. Map/feed switcher - Position, button styling (Normal/Hover)
 * 9. Term count - Number color, border color
 * 10. Other - Max/min filter widths
 * 11. Popups: Custom style - Backdrop, margins, heights
 *
 * Source: themes/voxel/app/widgets/search-form.php (lines 912-3960)
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl } from '@wordpress/components';
import type { SearchFormAttributes } from '../types';

// Shared controls
import {
	SectionHeading,
	DimensionsControl,
	ResponsiveRangeControl,
	TypographyPopup,
	BoxShadowPopup,
	BorderGroupControl,
	StyleTabPanel,
	ColorPickerControl,
	AlignmentControl,
	AccordionPanelGroup,
	AccordionPanel,
	PopupCustomStyleControl,
} from '../../../shared/controls';

interface GeneralTabProps {
	attributes: SearchFormAttributes;
	setAttributes: (attrs: Partial<SearchFormAttributes>) => void;
	clientId: string;
}

export default function GeneralTab({
	attributes,
	setAttributes,
}: GeneralTabProps) {
	return (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="generalTabOpenAccordion"
			defaultPanel="general"
		>
			{/* ============================================
			    1. GENERAL ACCORDION
			    Source: search-form.php:912-974
			    ============================================ */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				{/* Filter Margin - ts_sf_form_group_padding */}
				<DimensionsControl
					label={__('Filter Margin', 'voxel-fse')}
					values={attributes.filterMargin || {}}
					onChange={(value) => setAttributes({ filterMargin: value })}
					units={['px']}
					responsive
					tabletValues={attributes.filterMargin_tablet}
					mobileValues={attributes.filterMargin_mobile}
					onTabletChange={(value) => setAttributes({ filterMargin_tablet: value })}
					onMobileChange={(value) => setAttributes({ filterMargin_mobile: value })}
				/>

				{/* Label Section */}
				<SectionHeading>{__('Label', 'voxel-fse')}</SectionHeading>

				{/* Show labels - ts_sf_input_label */}
				<ToggleControl
					label={__('Show labels', 'voxel-fse')}
					checked={attributes.showLabels || false}
					onChange={(value) => setAttributes({ showLabels: value })}
				/>

				{/* Label typography - ts_sf_input_label_text */}
				<TypographyPopup
					label={__('Label typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="labelTypography"
				/>

				{/* Label color - ts_sf_input_label_col (responsive) */}
				<ColorPickerControl
					label={__('Label color', 'voxel-fse')}
					value={attributes.labelColor}
					onChange={(value) => setAttributes({ labelColor: value })}
				/>
			</AccordionPanel>

			{/* ============================================
			    2. COMMON STYLES ACCORDION
			    Source: search-form.php:978-1266
			    ============================================ */}
			<AccordionPanel id="common-styles" title={__('Common styles', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Height - ts_sf_input_height */}
									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="commonHeight"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										controlKey="commonHeight"
									/>

									{/* Icon size - ts_sf_input_icon_size */}
									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="commonIconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										controlKey="commonIconSize"
									/>

									{/* Border radius - ts_sf_input_radius */}
									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="commonBorderRadius"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
										unitAttributeName="commonBorderRadiusUnit"
										controlKey="commonBorderRadius"
									/>

									{/* Box Shadow - ts_sf_input_shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="commonBoxShadow"
									/>

									{/* Border Type - ts_sf_input_border */}
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.commonBorder || {}}
										onChange={(value) => setAttributes({ commonBorder: value })}
										hideRadius={true}
									/>

									{/* Background color - ts_sf_input_bg */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.commonBackgroundColor}
										onChange={(value) => setAttributes({ commonBackgroundColor: value })}
									/>

									{/* Text color - ts_sf_input_value_col */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.commonTextColor}
										onChange={(value) => setAttributes({ commonTextColor: value })}
									/>

									{/* Icon color - ts_sf_input_icon_col */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.commonIconColor}
										onChange={(value) => setAttributes({ commonIconColor: value })}
									/>

									{/* Typography - ts_sf_input_input_typo */}
									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="commonTypography"
									/>

									{/* Chevron Section */}
									<SectionHeading>{__('Chevron', 'voxel-fse')}</SectionHeading>

									{/* Hide chevron - ts_hide_chevron */}
									<ToggleControl
										label={__('Hide chevron', 'voxel-fse')}
										checked={attributes.hideChevron || false}
										onChange={(value) => setAttributes({ hideChevron: value })}
									/>

									{/* Chevron color - ts_chevron_btn_color */}
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.chevronColor}
										onChange={(value) => setAttributes({ chevronColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Box Shadow Hover - ts_sf_input_shadow_hover */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="commonBoxShadowHover"
									/>

									{/* Border color Hover - ts_sf_input_border_h */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.commonBorderColorHover}
										onChange={(value) => setAttributes({ commonBorderColorHover: value })}
									/>

									{/* Background color Hover - ts_sf_input_bg_h */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.commonBackgroundColorHover}
										onChange={(value) => setAttributes({ commonBackgroundColorHover: value })}
									/>

									{/* Text color Hover - ts_sf_input_value_col_h */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.commonTextColorHover}
										onChange={(value) => setAttributes({ commonTextColorHover: value })}
									/>

									{/* Icon color Hover - ts_sf_input_icon_col_h */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.commonIconColorHover}
										onChange={(value) => setAttributes({ commonIconColorHover: value })}
									/>

									{/* Chevron color Hover - ts_chevron_btn_color_h */}
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.chevronColorHover}
										onChange={(value) => setAttributes({ chevronColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    3. BUTTON ACCORDION
			    Source: search-form.php:1270-1468
			    ============================================ */}
			{/* ============================================
			    3. BUTTON ACCORDION
			    Source: search-form.php:1270-1468
			    ============================================ */}
			<AccordionPanel id="button" title={__('Button', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'filled', title: __('Filled', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Padding - ts_sf_input_padding */}
									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.buttonPadding || {}}
										onChange={(value) => setAttributes({ buttonPadding: value })}
										units={['px', '%', 'em']}
										responsive
										tabletValues={attributes.buttonPadding_tablet}
										mobileValues={attributes.buttonPadding_mobile}
										onTabletChange={(value) => setAttributes({ buttonPadding_tablet: value })}
										onMobileChange={(value) => setAttributes({ buttonPadding_mobile: value })}
									/>

									{/* Icons Section */}
									<SectionHeading>{__('Icons', 'voxel-fse')}</SectionHeading>

									{/* Icon/Text spacing - ts_sf_input_icon_margin */}
									<ResponsiveRangeControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="buttonIconSpacing"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										controlKey="buttonIconSpacing"
									/>
								</>
							)}

							{tab.name === 'filled' && (
								<>
									{/* Typography - ts_sf_input_typo_filled */}
									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="buttonFilledTypography"
									/>

									{/* Background - ts_sf_input_background_filled */}
									<ColorPickerControl
										label={__('Background', 'voxel-fse')}
										value={attributes.buttonFilledBackground}
										onChange={(value) => setAttributes({ buttonFilledBackground: value })}
									/>

									{/* Text color - ts_sf_input_value_col_filled */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.buttonFilledTextColor}
										onChange={(value) => setAttributes({ buttonFilledTextColor: value })}
									/>

									{/* Icon color - ts_sf_input_icon_col_filled */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.buttonFilledIconColor}
										onChange={(value) => setAttributes({ buttonFilledIconColor: value })}
									/>

									{/* Border color - ts_sf_input_border_filled */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.buttonFilledBorderColor}
										onChange={(value) => setAttributes({ buttonFilledBorderColor: value })}
									/>

									{/* Border width - ts_sf_border_filled_width */}
									<ResponsiveRangeControl
										label={__('Border width', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="buttonFilledBorderWidth"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
										unitAttributeName="buttonFilledBorderWidthUnit"
										controlKey="buttonFilledBorderWidth"
									/>

									{/* Box Shadow - ts_sf_input_shadow_active */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="buttonFilledBoxShadow"
									/>

									{/* Chevron color - ts_chevron_filled */}
									<ColorPickerControl
										label={__('Chevron color', 'voxel-fse')}
										value={attributes.buttonFilledChevronColor}
										onChange={(value) => setAttributes({ buttonFilledChevronColor: value })}
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    4. INPUT ACCORDION
			    Source: search-form.php:1470-1598
			    ============================================ */}
			<AccordionPanel id="input" title={__('Input', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'focus', title: __('Focus', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Text color - inline_input_c */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.inputTextColor}
										onChange={(value) => setAttributes({ inputTextColor: value })}
									/>

									{/* Input placeholder color - inline_input_placeholder_color */}
									<ColorPickerControl
										label={__('Input placeholder color', 'voxel-fse')}
										value={attributes.inputPlaceholderColor}
										onChange={(value) => setAttributes({ inputPlaceholderColor: value })}
									/>

									{/* Padding - inline_padding_noico */}
									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.inputPadding || {}}
										onChange={(value) => setAttributes({ inputPadding: value })}
										units={['px', '%', 'em']}
										responsive
										tabletValues={attributes.inputPadding_tablet}
										mobileValues={attributes.inputPadding_mobile}
										onTabletChange={(value) => setAttributes({ inputPadding_tablet: value })}
										onMobileChange={(value) => setAttributes({ inputPadding_mobile: value })}
									/>

									<p style={{ fontSize: '11px', color: '#757575', fontStyle: 'italic', marginTop: '-8px' }}>
										{__('To account for the input icon, left padding should be added accordingly', 'voxel-fse')}
									</p>

									{/* Icon side margin - inline_input_icon_size_m */}
									<ResponsiveRangeControl
										label={__('Icon side margin', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="inputIconSideMargin"
										min={0}
										max={40}
										step={1}
										availableUnits={['px']}
										controlKey="inputIconSideMargin"
									/>
								</>
							)}

							{tab.name === 'focus' && (
								<>
									{/* Background color - inline_input_bg_a */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.inputBackgroundColorFocus}
										onChange={(value) => setAttributes({ inputBackgroundColorFocus: value })}
									/>

									{/* Border color - inline_input_a_border */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.inputBorderColorFocus}
										onChange={(value) => setAttributes({ inputBorderColorFocus: value })}
									/>

									{/* Box Shadow Focus - inline_input_shadow_focus */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="inputBoxShadowFocus"
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    5. SEARCH BUTTON ACCORDION
			    Source: search-form.php:1600-1772
			    ============================================ */}
			<AccordionPanel id="search-button" title={__('Search button', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Color - ts_sf_btn_value_col */}
									<ColorPickerControl
										label={__('Color', 'voxel-fse')}
										value={attributes.searchBtnColor}
										onChange={(value) => setAttributes({ searchBtnColor: value })}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.searchBtnIconColor}
										onChange={(value) => setAttributes({ searchBtnIconColor: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.searchBtnBackgroundColor}
										onChange={(value) => setAttributes({ searchBtnBackgroundColor: value })}
									/>

									{/* Border Type */}
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.searchBtnBorder || {}}
										onChange={(value) => setAttributes({ searchBtnBorder: value })}
										hideRadius={true}
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="searchBtnBoxShadow"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Text color */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.searchBtnTextColorHover}
										onChange={(value) => setAttributes({ searchBtnTextColorHover: value })}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.searchBtnIconColorHover}
										onChange={(value) => setAttributes({ searchBtnIconColorHover: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.searchBtnBackgroundColorHover}
										onChange={(value) => setAttributes({ searchBtnBackgroundColorHover: value })}
									/>

									{/* Border color */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.searchBtnBorderColorHover}
										onChange={(value) => setAttributes({ searchBtnBorderColorHover: value })}
									/>

									{/* Box shadow */}
									<BoxShadowPopup
										label={__('Box shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="searchBtnBoxShadowHover"
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    6. TOGGLE BUTTON ACCORDION
			    Source: search-form.php:2996-3284
			    ============================================ */}
			<AccordionPanel id="toggle-button" title={__('Toggle button', 'voxel-fse')}>
				<StyleTabPanel
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
									{/* Typography - one_btn_typo */}
									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="toggleBtnTypography"
									/>



									{/* Text color - one_btn_c */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.toggleBtnTextColor}
										onChange={(value) => setAttributes({ toggleBtnTextColor: value })}
									/>

									{/* Padding - one_btn_padding */}
									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.toggleBtnPadding || {}}
										onChange={(value) => setAttributes({ toggleBtnPadding: value })}
										units={['px', '%', 'em']}
										responsive
										tabletValues={attributes.toggleBtnPadding_tablet}
										mobileValues={attributes.toggleBtnPadding_mobile}
										onTabletChange={(value) => setAttributes({ toggleBtnPadding_tablet: value })}
										onMobileChange={(value) => setAttributes({ toggleBtnPadding_mobile: value })}
									/>

									{/* Background color - one_btn_bg */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.toggleBtnBackgroundColor}
										onChange={(value) => setAttributes({ toggleBtnBackgroundColor: value })}
									/>

									{/* Border Type */}
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.toggleBtnBorder || {}}
										onChange={(value) => setAttributes({ toggleBtnBorder: value })}
										hideRadius={true}
									/>

									{/* Icon size */}
									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="toggleBtnIconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										controlKey="toggleBtnIconSize"
									/>

									{/* Icon/Text spacing */}
									<ResponsiveRangeControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="toggleBtnIconSpacing"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										controlKey="toggleBtnIconSpacing"
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.toggleBtnIconColor}
										onChange={(value) => setAttributes({ toggleBtnIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Text color */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.toggleBtnTextColorHover}
										onChange={(value) => setAttributes({ toggleBtnTextColorHover: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.toggleBtnBackgroundColorHover}
										onChange={(value) => setAttributes({ toggleBtnBackgroundColorHover: value })}
									/>

									{/* Border color */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.toggleBtnBorderColorHover}
										onChange={(value) => setAttributes({ toggleBtnBorderColorHover: value })}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.toggleBtnIconColorHover}
										onChange={(value) => setAttributes({ toggleBtnIconColorHover: value })}
									/>
								</>
							)}

							{tab.name === 'filled' && (
								<>
									{/* Text color */}
									<ColorPickerControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.toggleBtnTextColorFilled}
										onChange={(value) => setAttributes({ toggleBtnTextColorFilled: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.toggleBtnBackgroundColorFilled}
										onChange={(value) => setAttributes({ toggleBtnBackgroundColorFilled: value })}
									/>

									{/* Border color */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.toggleBtnBorderColorFilled}
										onChange={(value) => setAttributes({ toggleBtnBorderColorFilled: value })}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.toggleBtnIconColorFilled}
										onChange={(value) => setAttributes({ toggleBtnIconColorFilled: value })}
									/>

									{/* Box Shadow Filled - one_btn_shadow_active */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="toggleBtnBoxShadowFilled"
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    7. TOGGLE: ACTIVE COUNT ACCORDION
			    Source: search-form.php:3367-3422
			    ============================================ */}
			<AccordionPanel id="toggle-active-count" title={__('Toggle: Active count', 'voxel-fse')}>
				{/* Text color */}
				<ColorPickerControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.activeCountTextColor}
					onChange={(value) => setAttributes({ activeCountTextColor: value })}
				/>

				{/* Background color */}
				<ColorPickerControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.activeCountBackgroundColor}
					onChange={(value) => setAttributes({ activeCountBackgroundColor: value })}
				/>

				{/* Right margin */}
				<ResponsiveRangeControl
					label={__('Right margin', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="activeCountRightMargin"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
					controlKey="activeCountRightMargin"
				/>
			</AccordionPanel>

			{/* ============================================
			    8. MAP/FEED SWITCHER ACCORDION
			    Source: search-form.php:3425-3775
			    ============================================ */}
			<AccordionPanel id="map-feed-switcher" title={__('Map/feed switcher', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									{/* Position Section */}
									<SectionHeading>{__('Position', 'voxel-fse')}</SectionHeading>

									{/* Align button */}
									<SelectControl
										label={__('Align button', 'voxel-fse')}
										value={attributes.mapSwitcherAlign || ''}
										options={[
											{ label: __('Default', 'voxel-fse'), value: '' },
											{ label: __('Left', 'voxel-fse'), value: 'left' },
											{ label: __('Center', 'voxel-fse'), value: 'center' },
											{ label: __('Right', 'voxel-fse'), value: 'right' },
										]}
										onChange={(value) => setAttributes({ mapSwitcherAlign: value })}
									/>

									{/* Bottom margin */}
									<ResponsiveRangeControl
										label={__('Bottom margin', 'voxel-fse')}
										help={__('Distance from bottom of the screen', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherBottomMargin"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%', 'vh']}
										controlKey="mapSwitcherBottomMargin"
									/>

									{/* Side margin */}
									<ResponsiveRangeControl
										label={__('Side margin', 'voxel-fse')}
										help={__('Distance from left/right edges of the screen', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherSideMargin"
										min={0}
										max={200}
										step={1}
										availableUnits={['px']}
									/>

									{/* Button Section */}
									<SectionHeading>{__('Button', 'voxel-fse')}</SectionHeading>

									{/* Typography */}
									<TypographyPopup
										label={__('Typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="mapSwitcherTypography"
									/>

									{/* Color */}
									<ColorPickerControl
										label={__('Color', 'voxel-fse')}
										value={attributes.mapSwitcherColor}
										onChange={(value) => setAttributes({ mapSwitcherColor: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.mapSwitcherBackgroundColor}
										onChange={(value) => setAttributes({ mapSwitcherBackgroundColor: value })}
									/>

									{/* Button Height */}
									<ResponsiveRangeControl
										label={__('Button Height', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherHeight"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									{/* Button padding */}
									<DimensionsControl
										label={__('Button padding', 'voxel-fse')}
										values={attributes.mapSwitcherPadding || {}}
										onChange={(value) => setAttributes({ mapSwitcherPadding: value })}
										units={['px']}
										responsive
										tabletValues={attributes.mapSwitcherPadding_tablet}
										mobileValues={attributes.mapSwitcherPadding_mobile}
										onTabletChange={(value) => setAttributes({ mapSwitcherPadding_tablet: value })}
										onMobileChange={(value) => setAttributes({ mapSwitcherPadding_mobile: value })}
									/>

									{/* Border Type */}
									<BorderGroupControl
										label={__('Border Type', 'voxel-fse')}
										value={attributes.mapSwitcherBorder || {}}
										onChange={(value) => setAttributes({ mapSwitcherBorder: value })}
										hideRadius={true}
									/>

									{/* Border radius */}
									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherBorderRadius"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										shadowAttributeName="mapSwitcherBoxShadow"
									/>

									{/* Icon/Text spacing */}
									<ResponsiveRangeControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherIconSpacing"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									{/* Icon size */}
									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="mapSwitcherIconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.mapSwitcherIconColor}
										onChange={(value) => setAttributes({ mapSwitcherIconColor: value })}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Color */}
									<ColorPickerControl
										label={__('Color', 'voxel-fse')}
										value={attributes.mapSwitcherColorHover}
										onChange={(value) => setAttributes({ mapSwitcherColorHover: value })}
									/>

									{/* Background color */}
									<ColorPickerControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.mapSwitcherBackgroundColorHover}
										onChange={(value) => setAttributes({ mapSwitcherBackgroundColorHover: value })}
									/>

									{/* Border color */}
									<ColorPickerControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.mapSwitcherBorderColorHover}
										onChange={(value) => setAttributes({ mapSwitcherBorderColorHover: value })}
									/>

									{/* Icon color */}
									<ColorPickerControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.mapSwitcherIconColorHover}
										onChange={(value) => setAttributes({ mapSwitcherIconColorHover: value })}
									/>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ============================================
			    9. TERM COUNT ACCORDION
			    Source: search-form.php:3777-3816
			    ============================================ */}
			<AccordionPanel id="term-count" title={__('Term count', 'voxel-fse')}>
				{/* Number color */}
				<ColorPickerControl
					label={__('Number color', 'voxel-fse')}
					value={attributes.termCountNumberColor}
					onChange={(value) => setAttributes({ termCountNumberColor: value })}
				/>

				{/* Border color */}
				<ColorPickerControl
					label={__('Border color', 'voxel-fse')}
					value={attributes.termCountBorderColor}
					onChange={(value) => setAttributes({ termCountBorderColor: value })}
				/>
			</AccordionPanel>

			{/* ============================================
			    10. OTHER ACCORDION
			    Source: search-form.php:3818-3878
			    ============================================ */}
			<AccordionPanel id="other" title={__('Other', 'voxel-fse')}>
				{/* Max filter width */}
				<ResponsiveRangeControl
					label={__('Max filter width', 'voxel-fse')}
					help={__('Useful when filters have auto width to prevent them from using too much space', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="maxFilterWidth"
					min={0}
					max={500}
					step={1}
					availableUnits={['px']}
				/>

				{/* Min input width */}
				<ResponsiveRangeControl
					label={__('Min input width', 'voxel-fse')}
					help={__('Increase the minimum width of inputs, useful when filters have auto width', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="minInputWidth"
					min={0}
					max={500}
					step={1}
					availableUnits={['px']}
				/>
			</AccordionPanel>

			{/* ============================================
			    11. POPUPS: CUSTOM STYLE ACCORDION
			    Source: search-form.php:3880-3960
			    ============================================ */}
			<AccordionPanel id="popups-custom-style" title={__('Popups: Custom style', 'voxel-fse')}>
				<PopupCustomStyleControl
					attributes={attributes}
					setAttributes={setAttributes}
					attributeNames={{
						enable: 'popupCustomStyleEnabled',
						backdrop: 'popupBackdropBackground',
						pointerEvents: 'popupBackdropPointerEvents',
						shadow: 'popupBoxShadow',
						topMargin: 'popupTopBottomMargin',
						maxHeight: 'popupMaxHeight',
						autosuggestTopMargin: 'popupAutosuggestTopMargin',
					}}
				/>
				<p style={{ fontSize: '11px', color: '#757575', fontStyle: 'italic', marginTop: '16px' }}>
					{__('In wp-admin > templates > Style kits > Popup styles you can control the global popup styles that affect all the popups on the site. Enabling this option will override some of those styles only for this specific widget.', 'voxel-fse')}
				</p>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
