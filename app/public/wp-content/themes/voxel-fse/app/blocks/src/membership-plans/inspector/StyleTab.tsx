/**
 * Membership Plans Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Matches Voxel's pricing-plans widget Style tab controls.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	ResponsiveRangeControl,
	ResponsiveDimensionsControl,
	ColorControl,
	TypographyControl,
	BorderGroupControl,
	BoxShadowPopup,
	StyleTabPanel,
	AdvancedIconControl,
} from '@shared/controls';
import type { MembershipPlansAttributes } from '../types';

interface StyleTabProps {
	attributes: MembershipPlansAttributes;
	setAttributes: (attrs: Partial<MembershipPlansAttributes>) => void;
}

export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="general"
		>
			{/* ==================== GENERAL ==================== */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Number of columns', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="plansColumns"
					min={1}
					max={6}
				/>

				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="plansGap"
					min={0}
					max={100}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="plansBorderRadius"
					min={0}
					max={50}
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.plansBorderType || '',
						borderWidth: attributes.plansBorderWidth || {},
						borderColor: attributes.plansBorderColor || '',
					}}
					onChange={(value: any) => {
						const updates: Partial<MembershipPlansAttributes> = {};
						if (value.borderType !== undefined) {
							updates.plansBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.plansBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.plansBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Background', 'voxel-fse')}
						value={attributes.plansBg}
						onChange={(value: any) => setAttributes({ plansBg: value })}
					/>
				</div>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="plansShadow"
				/>

				<SectionHeading label={__('Plan body', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Body padding', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bodyPadding"
					min={0}
					max={100}
				/>

				<ResponsiveRangeControl
					label={__('Body content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bodyContentGap"
					min={0}
					max={100}
				/>

				<SectionHeading label={__('Plan image', 'voxel-fse')} />

				<ResponsiveDimensionsControl
					label={__('Image padding', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="imagePadding"
				/>

				<ResponsiveRangeControl
					label={__('Height', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="imageHeight"
					min={0}
					max={500}
				/>

				<SectionHeading label={__('Plan pricing', 'voxel-fse')} />

				<SelectControl
					label={__('Align', 'voxel-fse')}
					value={attributes.pricingAlign}
					options={[
						{ value: 'flex-start', label: __('Left', 'voxel-fse') },
						{ value: 'center', label: __('Center', 'voxel-fse') },
						{ value: 'flex-end', label: __('Right', 'voxel-fse') },
					]}
					onChange={(value: any) =>
						setAttributes({
							pricingAlign: value as 'flex-start' | 'center' | 'flex-end',
						})
					}
				/>

				<TypographyControl
					label={__('Price typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="priceTypography"
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Price color', 'voxel-fse')}
						value={attributes.priceColor}
						onChange={(value: any) => setAttributes({ priceColor: value })}
					/>
				</div>

				<TypographyControl
					label={__('Period typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="periodTypography"
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Period color', 'voxel-fse')}
						value={attributes.periodColor}
						onChange={(value: any) => setAttributes({ periodColor: value })}
					/>
				</div>

				<SectionHeading label={__('Plan name', 'voxel-fse')} />

				<SelectControl
					label={__('Align content', 'voxel-fse')}
					value={attributes.contentAlign}
					options={[
						{ value: 'flex-start', label: __('Left', 'voxel-fse') },
						{ value: 'center', label: __('Center', 'voxel-fse') },
						{ value: 'flex-end', label: __('Right', 'voxel-fse') },
					]}
					onChange={(value: any) =>
						setAttributes({
							contentAlign: value as 'flex-start' | 'center' | 'flex-end',
						})
					}
				/>

				<TypographyControl
					label={__('Name typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="nameTypography"
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Name color', 'voxel-fse')}
						value={attributes.nameColor}
						onChange={(value: any) => setAttributes({ nameColor: value })}
					/>
				</div>

				<SectionHeading label={__('Plan description', 'voxel-fse')} />

				<SelectControl
					label={__('Text align', 'voxel-fse')}
					value={attributes.descAlign}
					options={[
						{ value: 'left', label: __('Left', 'voxel-fse') },
						{ value: 'center', label: __('Center', 'voxel-fse') },
						{ value: 'right', label: __('Right', 'voxel-fse') },
					]}
					onChange={(value: any) =>
						setAttributes({
							descAlign: value as 'left' | 'center' | 'right',
						})
					}
				/>

				<TypographyControl
					label={__('Description typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="descTypography"
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Description color', 'voxel-fse')}
						value={attributes.descColor}
						onChange={(value: any) => setAttributes({ descColor: value })}
					/>
				</div>

				<SectionHeading label={__('Plan features', 'voxel-fse')} />

				<SelectControl
					label={__('Align content', 'voxel-fse')}
					value={attributes.listAlign}
					options={[
						{ value: 'flex-start', label: __('Left', 'voxel-fse') },
						{ value: 'center', label: __('Center', 'voxel-fse') },
						{ value: 'flex-end', label: __('Right', 'voxel-fse') },
					]}
					onChange={(value: any) =>
						setAttributes({
							listAlign: value as 'flex-start' | 'center' | 'flex-end',
						})
					}
				/>

				<TypographyControl
					label={__('Feature typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="listTypography"
				/>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Feature text color', 'voxel-fse')}
						value={attributes.listColor}
						onChange={(value: any) => setAttributes({ listColor: value })}
					/>
				</div>

				<div className="voxel-fse-control-row">
					<ColorControl
						label={__('Feature icon color', 'voxel-fse')}
						value={attributes.listIconColor}
						onChange={(value: any) => setAttributes({ listIconColor: value })}
					/>
				</div>

				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="listGap"
					min={0}
					max={50}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="listIconSize"
					min={10}
					max={50}
				/>

				<ResponsiveRangeControl
					label={__('Icon right padding', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="listIconRightPad"
					min={0}
					max={30}
				/>
			</AccordionPanel>

			{/* ==================== TABS ==================== */}
			<AccordionPanel id="tabs" title={__('Tabs', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{/* Normal Tab */}
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Tabs', 'voxel-fse')} />

									<ToggleControl
										label={__('Disable tabs', 'voxel-fse')}
										help={__('Disable label on tablet', 'voxel-fse')}
										checked={attributes.tabsDisabled}
										onChange={(value: any) => setAttributes({ tabsDisabled: value })}
									/>

									<SelectControl
										label={__('Justify', 'voxel-fse')}
										value={attributes.tabsJustify}
										options={[
											{ value: 'flex-start', label: __('Left', 'voxel-fse') },
											{ value: 'center', label: __('Center', 'voxel-fse') },
											{ value: 'flex-end', label: __('Right', 'voxel-fse') },
											{ value: 'space-between', label: __('Space between', 'voxel-fse') },
											{ value: 'space-around', label: __('Space around', 'voxel-fse') },
										]}
										onChange={(value: any) =>
											setAttributes({
												tabsJustify: value as MembershipPlansAttributes['tabsJustify'],
											})
										}
									/>

									<ResponsiveDimensionsControl
										label={__('Padding', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsPadding"
									/>

									<ResponsiveDimensionsControl
										label={__('Margin', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsMargin"
									/>

									<TypographyControl
										label={__('Tab typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="tabTypography"
									/>

									<TypographyControl
										label={__('Active tab typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="tabActiveTypography"
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.tabTextColor}
											onChange={(value: any) => setAttributes({ tabTextColor: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active text color', 'voxel-fse')}
											value={attributes.tabActiveTextColor}
											onChange={(value: any) => setAttributes({ tabActiveTextColor: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.tabBackground}
											onChange={(value: any) => setAttributes({ tabBackground: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active background', 'voxel-fse')}
											value={attributes.tabActiveBackground}
											onChange={(value: any) => setAttributes({ tabActiveBackground: value })}
										/>
									</div>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabBorderType || '',
											borderWidth: attributes.tabBorderWidth || {},
											borderColor: attributes.tabBorderColor || '',
										}}
										onChange={(value: any) => {
											const updates: Partial<MembershipPlansAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tabBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.tabBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tabBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active border color', 'voxel-fse')}
											value={attributes.tabActiveBorderColor}
											onChange={(value: any) => setAttributes({ tabActiveBorderColor: value })}
										/>
									</div>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tabsBorderRadius"
										min={0}
										max={30}
									/>
								</>
							)}

							{/* Hover Tab - Timeline tabs section */}
							{tab.name === 'hover' && (
								<>
									<SectionHeading label={__('Tabs hover', 'voxel-fse')} />

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.tabTextColorHover}
											onChange={(value: any) => setAttributes({ tabTextColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active text color', 'voxel-fse')}
											value={attributes.tabActiveTextColorHover}
											onChange={(value: any) => setAttributes({ tabActiveTextColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.tabBorderColorHover}
											onChange={(value: any) => setAttributes({ tabBorderColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active border color', 'voxel-fse')}
											value={attributes.tabActiveBorderColorHover}
											onChange={(value: any) => setAttributes({ tabActiveBorderColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background', 'voxel-fse')}
											value={attributes.tabBackgroundHover}
											onChange={(value: any) => setAttributes({ tabBackgroundHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Active background', 'voxel-fse')}
											value={attributes.tabActiveBackgroundHover}
											onChange={(value: any) => setAttributes({ tabActiveBackgroundHover: value })}
										/>
									</div>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ==================== PRIMARY BUTTON ==================== */}
			<AccordionPanel id="primary_button" title={__('Primary button', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{/* Normal Tab */}
							{tab.name === 'normal' && (
								<>
									<TypographyControl
										label={__('Button typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="primaryBtnTypography"
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryBtnRadius"
										min={0}
										max={30}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.primaryBtnTextColor}
											onChange={(value: any) => setAttributes({ primaryBtnTextColor: value })}
										/>
									</div>

									<ResponsiveDimensionsControl
										label={__('Padding', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryBtnPadding"
									/>

									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryBtnHeight"
										min={0}
										max={100}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.primaryBtnBgColor}
											onChange={(value: any) => setAttributes({ primaryBtnBgColor: value })}
										/>
									</div>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.primaryBtnBorderType || '',
											borderWidth: attributes.primaryBtnBorderWidth || {},
											borderColor: attributes.primaryBtnBorderColor || '',
										}}
										onChange={(value: any) => {
											const updates: Partial<MembershipPlansAttributes> = {};
											if (value.borderType !== undefined) {
												updates.primaryBtnBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.primaryBtnBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.primaryBtnBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryBtnIconSize"
										min={10}
										max={40}
									/>

									<ResponsiveRangeControl
										label={__('Text/Icon spacing', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="primaryBtnIconPad"
										min={0}
										max={30}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.primaryBtnIconColor}
											onChange={(value: any) => setAttributes({ primaryBtnIconColor: value })}
										/>
									</div>
								</>
							)}

							{/* Hover Tab */}
							{tab.name === 'hover' && (
								<>
									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.primaryBtnTextColorHover}
											onChange={(value: any) => setAttributes({ primaryBtnTextColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.primaryBtnBgColorHover}
											onChange={(value: any) => setAttributes({ primaryBtnBgColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.primaryBtnBorderColorHover}
											onChange={(value: any) => setAttributes({ primaryBtnBorderColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.primaryBtnIconColorHover}
											onChange={(value: any) => setAttributes({ primaryBtnIconColorHover: value })}
										/>
									</div>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ==================== SECONDARY BUTTON ==================== */}
			<AccordionPanel id="secondary_button" title={__('Secondary button', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{/* Normal Tab */}
							{tab.name === 'normal' && (
								<>
									<TypographyControl
										label={__('Button typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										typographyAttributeName="secondaryBtnTypography"
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryBtnRadius"
										min={0}
										max={30}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.secondaryBtnTextColor}
											onChange={(value: any) => setAttributes({ secondaryBtnTextColor: value })}
										/>
									</div>

									<ResponsiveDimensionsControl
										label={__('Padding', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryBtnPadding"
									/>

									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryBtnHeight"
										min={0}
										max={100}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.secondaryBtnBgColor}
											onChange={(value: any) => setAttributes({ secondaryBtnBgColor: value })}
										/>
									</div>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.secondaryBtnBorderType || '',
											borderWidth: attributes.secondaryBtnBorderWidth || {},
											borderColor: attributes.secondaryBtnBorderColor || '',
										}}
										onChange={(value: any) => {
											const updates: Partial<MembershipPlansAttributes> = {};
											if (value.borderType !== undefined) {
												updates.secondaryBtnBorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.secondaryBtnBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.secondaryBtnBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryBtnIconSize"
										min={10}
										max={40}
									/>

									<ResponsiveRangeControl
										label={__('Text/Icon spacing', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="secondaryBtnIconPad"
										min={0}
										max={30}
									/>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.secondaryBtnIconColor}
											onChange={(value: any) => setAttributes({ secondaryBtnIconColor: value })}
										/>
									</div>
								</>
							)}

							{/* Hover Tab */}
							{tab.name === 'hover' && (
								<>
									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Text color', 'voxel-fse')}
											value={attributes.secondaryBtnTextColorHover}
											onChange={(value: any) => setAttributes({ secondaryBtnTextColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Background color', 'voxel-fse')}
											value={attributes.secondaryBtnBgColorHover}
											onChange={(value: any) => setAttributes({ secondaryBtnBgColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Border color', 'voxel-fse')}
											value={attributes.secondaryBtnBorderColorHover}
											onChange={(value: any) => setAttributes({ secondaryBtnBorderColorHover: value })}
										/>
									</div>

									<div className="voxel-fse-control-row">
										<ColorControl
											label={__('Icon color', 'voxel-fse')}
											value={attributes.secondaryBtnIconColorHover}
											onChange={(value: any) => setAttributes({ secondaryBtnIconColorHover: value })}
										/>
									</div>
								</>
							)}
						</>
					)}
				</StyleTabPanel>
			</AccordionPanel>

			{/* ==================== ICONS ==================== */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Right arrow', 'voxel-fse')}
					value={attributes.arrowIcon as any}
					onChange={(value: any) => setAttributes({ arrowIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
