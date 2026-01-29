/**
 * Visit Chart Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Based on Voxel widget: themes/voxel/app/widgets/visits-chart.php:102-1039
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	ResponsiveRangeControl,
	TypographyControl,
	ColorControl,
	BorderGroupControl,
	BackgroundControl,
	BoxShadowPopup,
	StateTabPanel,
	DimensionsControl,
} from '@shared/controls';
import type { VisitChartAttributes } from '../types';

interface StyleTabProps {
	attributes: VisitChartAttributes;
	setAttributes: (attrs: Partial<VisitChartAttributes>) => void;
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
			defaultPanel="chart"
		>
			{/* Chart Accordion */}
			<AccordionPanel id="chart" title={__('Chart', 'voxel-fse')}>
				{/* Content height */}
				<ResponsiveRangeControl
					label={__('Content height', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="chartHeight"
					min={0}
					max={1000}
					units={['px']}
				/>

				<SectionHeading label={__('Axis', 'voxel-fse')} />

				{/* Axis Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="axisTypography"
				/>

				{/* Axis Text color */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.axisTextColor || ''}
					onChange={(value) => setAttributes({ axisTextColor: value })}
				/>

				{/* Vertical axis width */}
				<ResponsiveRangeControl
					label={__('Vertical axis width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="verticalAxisWidth"
					min={50}
					max={200}
					units={['px']}
				/>

				<SectionHeading label={__('Chart lines', 'voxel-fse')} />

				{/* Chart lines Border Type */}
				<SelectControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.chartLineBorderType || 'default'}
					options={[
						{ value: 'default', label: __('Default', 'voxel-fse') },
						{ value: 'none', label: __('None', 'voxel-fse') },
						{ value: 'solid', label: __('Solid', 'voxel-fse') },
						{ value: 'dashed', label: __('Dashed', 'voxel-fse') },
						{ value: 'dotted', label: __('Dotted', 'voxel-fse') },
						{ value: 'double', label: __('Double', 'voxel-fse') },
					]}
					onChange={(value) => setAttributes({ chartLineBorderType: value })}
				/>

				<SectionHeading label={__('Chart Bars', 'voxel-fse')} />

				{/* Bar gap */}
				<ResponsiveRangeControl
					label={__('Bar gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="barGap"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Bar width */}
				<ResponsiveRangeControl
					label={__('Bar width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="barWidth"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Bar radius */}
				<ResponsiveRangeControl
					label={__('Bar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="barRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Background Type */}
				<BackgroundControl
					label={__('Background color', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="barBackground"
					types={['classic', 'gradient']}
				/>

				{/* Background color (Hover) */}
				<ColorControl
					label={__('Background color (Hover)', 'voxel-fse')}
					value={attributes.barBackgroundHover || ''}
					onChange={(value) => setAttributes({ barBackgroundHover: value })}
				/>

				{/* Box Shadow */}
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="barBoxShadow"
				/>

				<SectionHeading label={__('Bar popup', 'voxel-fse')} />

				{/* Bar popup Background color */}
				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.barPopupBackground || ''}
					onChange={(value) => setAttributes({ barPopupBackground: value })}
				/>

				{/* Bar popup Border */}
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.barPopupBorderType || '',
						borderWidth: attributes.barPopupBorderWidth || {},
						borderColor: attributes.barPopupBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<VisitChartAttributes> = {};
						if (value.borderType !== undefined) {
							updates.barPopupBorderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.barPopupBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.barPopupBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				{/* Bar popup Radius */}
				<ResponsiveRangeControl
					label={__('Bar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="barPopupRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Bar popup Box Shadow */}
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="barPopupBoxShadow"
				/>

				<SectionHeading label={__('Bar popup: Value', 'voxel-fse')} />

				{/* Bar popup Value Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="barPopupValueTypography"
				/>

				{/* Bar popup Value Color */}
				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.barPopupValueColor || ''}
					onChange={(value) => setAttributes({ barPopupValueColor: value })}
				/>

				<SectionHeading label={__('Bar popup: Label', 'voxel-fse')} />

				{/* Bar popup Label Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="barPopupLabelTypography"
				/>

				{/* Bar popup Label Color */}
				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.barPopupLabelColor || ''}
					onChange={(value) => setAttributes({ barPopupLabelColor: value })}
				/>
			</AccordionPanel>

			{/* Tabs Accordion */}
			<AccordionPanel id="tabs" title={__('Tabs', 'voxel-fse')}>
				<StateTabPanel
					attributeName="tabsState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Timeline tabs', 'voxel-fse')} />

								{/* Justify */}
								<SelectControl
									label={__('Justify', 'voxel-fse')}
									value={attributes.tabsJustify || 'left'}
									options={[
										{ value: 'left', label: __('Left', 'voxel-fse') },
										{ value: 'center', label: __('Center', 'voxel-fse') },
										{ value: 'flex-end', label: __('Right', 'voxel-fse') },
										{
											value: 'space-between',
											label: __('Space between', 'voxel-fse'),
										},
										{
											value: 'space-around',
											label: __('Space around', 'voxel-fse'),
										},
									]}
									onChange={(value) => setAttributes({ tabsJustify: value })}
								/>

								{/* Padding */}
								<DimensionsControl
									label={__('Padding', 'voxel-fse')}
									values={attributes.tabsPadding || {}}
									onChange={(values) => setAttributes({ tabsPadding: values })}
								/>

								{/* Margin */}
								<DimensionsControl
									label={__('Margin', 'voxel-fse')}
									values={attributes.tabsMargin || {}}
									onChange={(values) => setAttributes({ tabsMargin: values })}
								/>

								{/* Tab typography */}
								<TypographyControl
									label={__('Tab typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeName="tabsTypography"
								/>

								{/* Active tab typography */}
								<TypographyControl
									label={__('Active tab typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeName="tabsActiveTypography"
								/>

								{/* Text color */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tabsTextColor || ''}
									onChange={(value) => setAttributes({ tabsTextColor: value })}
								/>

								{/* Active text color */}
								<ColorControl
									label={__('Active text color', 'voxel-fse')}
									value={attributes.tabsActiveTextColor || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveTextColor: value })
									}
								/>

								{/* Background */}
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.tabsBackground || ''}
									onChange={(value) => setAttributes({ tabsBackground: value })}
								/>

								{/* Active background */}
								<ColorControl
									label={__('Active background', 'voxel-fse')}
									value={attributes.tabsActiveBackground || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveBackground: value })
									}
								/>

								{/* Border Type */}
								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.tabsBorderType || 'default'}
									options={[
										{ value: 'default', label: __('Default', 'voxel-fse') },
										{ value: 'none', label: __('None', 'voxel-fse') },
										{ value: 'solid', label: __('Solid', 'voxel-fse') },
										{ value: 'dashed', label: __('Dashed', 'voxel-fse') },
										{ value: 'dotted', label: __('Dotted', 'voxel-fse') },
										{ value: 'double', label: __('Double', 'voxel-fse') },
									]}
									onChange={(value) => setAttributes({ tabsBorderType: value })}
								/>

								{/* Active border color */}
								<ColorControl
									label={__('Active border color', 'voxel-fse')}
									value={attributes.tabsActiveBorderColor || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveBorderColor: value })
									}
								/>

								{/* Border radius */}
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="tabsBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>
							</>
						) : (
							<>
								<SectionHeading label={__('Timeline tabs', 'voxel-fse')} />

								{/* Text color (Hover) */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tabsTextColorHover || ''}
									onChange={(value) =>
										setAttributes({ tabsTextColorHover: value })
									}
								/>

								{/* Active text color (Hover) */}
								<ColorControl
									label={__('Active text color', 'voxel-fse')}
									value={attributes.tabsActiveTextColorHover || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveTextColorHover: value })
									}
								/>

								{/* Border color (Hover) */}
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.tabsBorderColorHover || ''}
									onChange={(value) =>
										setAttributes({ tabsBorderColorHover: value })
									}
								/>

								{/* Active border color (Hover) */}
								<ColorControl
									label={__('Active border color', 'voxel-fse')}
									value={attributes.tabsActiveBorderColorHover || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveBorderColorHover: value })
									}
								/>

								{/* Background (Hover) */}
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.tabsBackgroundHover || ''}
									onChange={(value) =>
										setAttributes({ tabsBackgroundHover: value })
									}
								/>

								{/* Active background (Hover) */}
								<ColorControl
									label={__('Active background', 'voxel-fse')}
									value={attributes.tabsActiveBackgroundHover || ''}
									onChange={(value) =>
										setAttributes({ tabsActiveBackgroundHover: value })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* Next/Prev week buttons Accordion */}
			<AccordionPanel id="week-buttons" title={__('Next/Prev week buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="weekButtonsState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Range', 'voxel-fse')} />

								{/* Range Typography */}
								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeName="weekRangeTypography"
								/>

								{/* Range Text color */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.weekRangeTextColor || ''}
									onChange={(value) =>
										setAttributes({ weekRangeTextColor: value })
									}
								/>

								<SectionHeading label={__('Week buttons', 'voxel-fse')} />

								{/* Button icon color */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.weekButtonIconColor || ''}
									onChange={(value) =>
										setAttributes({ weekButtonIconColor: value })
									}
								/>

								{/* Button icon size */}
								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="weekButtonIconSize"
									min={0}
									max={100}
									units={['px', '%']}
								/>

								{/* Button background */}
								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.weekButtonBackground || ''}
									onChange={(value) =>
										setAttributes({ weekButtonBackground: value })
									}
								/>

								{/* Button border */}
								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={{
										borderType: attributes.weekButtonBorderType || '',
										borderWidth: attributes.weekButtonBorderWidth || {},
										borderColor: attributes.weekButtonBorderColor || '',
									}}
									onChange={(value) => {
										const updates: Partial<VisitChartAttributes> = {};
										if (value.borderType !== undefined) {
											updates.weekButtonBorderType = value.borderType;
										}
										if (value.borderWidth !== undefined) {
											updates.weekButtonBorderWidth = value.borderWidth as any;
										}
										if (value.borderColor !== undefined) {
											updates.weekButtonBorderColor = value.borderColor;
										}
										setAttributes(updates);
									}}
									hideRadius={true}
								/>

								{/* Button border radius */}
								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="weekButtonBorderRadius"
									min={0}
									max={100}
									units={['px', '%']}
								/>

								{/* Button size */}
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="weekButtonSize"
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<SectionHeading label={__('Icons', 'voxel-fse')} />
							</>
						) : (
							<>
								{/* Button icon color (Hover) */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.weekButtonIconColorHover || ''}
									onChange={(value) =>
										setAttributes({ weekButtonIconColorHover: value })
									}
								/>

								{/* Button background color (Hover) */}
								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.weekButtonBackgroundHover || ''}
									onChange={(value) =>
										setAttributes({ weekButtonBackgroundHover: value })
									}
								/>

								{/* Button border color (Hover) */}
								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.weekButtonBorderColorHover || ''}
									onChange={(value) =>
										setAttributes({ weekButtonBorderColorHover: value })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* No activity Accordion */}
			<AccordionPanel id="no-activity" title={__('No activity', 'voxel-fse')}>
				{/* Content gap */}
				<ResponsiveRangeControl
					label={__('Content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="noActivityContentGap"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Icon size */}
				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="noActivityIconSize"
					min={0}
					max={100}
					units={['px']}
				/>

				{/* Icon color */}
				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.noActivityIconColor || ''}
					onChange={(value) => setAttributes({ noActivityIconColor: value })}
				/>

				{/* Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="noActivityTypography"
				/>

				{/* Text color */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.noActivityTextColor || ''}
					onChange={(value) => setAttributes({ noActivityTextColor: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
