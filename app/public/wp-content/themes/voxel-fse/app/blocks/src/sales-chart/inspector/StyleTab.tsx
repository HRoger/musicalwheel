/**
 * Sales Chart Block - Style Tab Inspector Controls
 *
 * Extracted from Elementor widget for maintainability.
 * Source: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php:86-695
 *
 * @package VoxelFSE
 */

import React from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	ResponsiveRangeControl,
	AccordionPanelGroup,
	AccordionPanel,
	TypographyControl,
	ColorControl,
	BorderGroupControl,
	BackgroundControl,
	BoxShadowPopup,
	SectionHeading,
	DimensionsControl,
	StateTabPanel,
} from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
import type { SalesChartAttributes } from '../types';

interface StyleTabProps {
	attributes: SalesChartAttributes;
	setAttributes: (attrs: Partial<SalesChartAttributes>) => void;
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
			{/* Accordion 1: Chart */}
			<AccordionPanel id="chart" title={__('Chart', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Content height', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_chart_height"
					min={0}
					max={1000}
					availableUnits={['px']}
				/>

				<SectionHeading label={__('Axis', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="axis_typo"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.ts_axis_typo_col}
					onChange={(value) => setAttributes({ ts_axis_typo_col: value })}
				/>

				<ResponsiveRangeControl
					label={__('Vertical axis width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="vertical_axis_width"
					min={50}
					max={200}
					availableUnits={['px']}
				/>

				<SectionHeading label={__('Chart lines', 'voxel-fse')} />

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.chart_line_borderType || '',
						borderWidth: attributes.chart_line_borderWidth || {},
						borderColor: attributes.chart_line_borderColor || '',
					}}
					onChange={(value: BorderGroupValue) => {
						const updates: Partial<SalesChartAttributes> = {};
						if (value.borderType !== undefined) {
							updates.chart_line_borderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.chart_line_borderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.chart_line_borderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<SectionHeading label={__('Chart Bars', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Bar gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="chart_col_gap"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Bar width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bar_width"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Bar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bar_radius"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<BackgroundControl
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					showHoverState={false}
					showImageControls={false}
					showGradientMode={true}
				/>

				<ColorControl
					label={__('Background color (Hover)', 'voxel-fse')}
					value={attributes.bar_bg_hover}
					onChange={(value) => setAttributes({ bar_bg_hover: value })}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="bar_sh_shadow"
				/>

				<SectionHeading label={__('Bar popup', 'voxel-fse')} />

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.bar_pop_bg}
					onChange={(value) => setAttributes({ bar_pop_bg: value })}
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.bar_pop_borderType || '',
						borderWidth: attributes.bar_pop_borderWidth || {},
						borderColor: attributes.bar_pop_borderColor || '',
					}}
					onChange={(value: BorderGroupValue) => {
						const updates: Partial<SalesChartAttributes> = {};
						if (value.borderType !== undefined) {
							updates.bar_pop_borderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.bar_pop_borderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.bar_pop_borderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Bar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bar_pop_radius"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="bar_pop_shadow"
				/>

				<SectionHeading label={__('Bar popup: Value', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_primary_typo"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.ts_primary_color}
					onChange={(value) => setAttributes({ ts_primary_color: value })}
				/>

				<SectionHeading label={__('Bar popup: Label', 'voxel-fse')} />

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_secondary_typo"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.ts_secondary_color}
					onChange={(value) => setAttributes({ ts_secondary_color: value })}
				/>
			</AccordionPanel>

			{/* Accordion 2: Tabs (with Normal/Hover states) */}
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
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Timeline tabs', 'voxel-fse')} />

									<SelectControl
										label={__('Justify', 'voxel-fse')}
										value={attributes.ts_tabs_justify || 'left'}
										options={[
											{ label: __('Left', 'voxel-fse'), value: 'left' },
											{ label: __('Center', 'voxel-fse'), value: 'center' },
											{ label: __('Right', 'voxel-fse'), value: 'flex-end' },
											{ label: __('Space between', 'voxel-fse'), value: 'space-between' },
											{ label: __('Space around', 'voxel-fse'), value: 'space-around' },
										]}
										onChange={(value) => setAttributes({ ts_tabs_justify: value })}
										__nextHasNoMarginBottom
									/>

									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.ts_tabs_padding || {}}
										onChange={(values) => setAttributes({ ts_tabs_padding: values })}
									/>

									<DimensionsControl
										label={__('Margin', 'voxel-fse')}
										values={attributes.ts_tabs_margin || {}}
										onChange={(values) => setAttributes({ ts_tabs_margin: values })}
									/>

									<TypographyControl
										label={__('Tab typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_tabs_text"
									/>

									<TypographyControl
										label={__('Active tab typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_tabs_text_active"
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.ts_tabs_text_color}
										onChange={(value) => setAttributes({ ts_tabs_text_color: value })}
									/>

									<ColorControl
										label={__('Active text color', 'voxel-fse')}
										value={attributes.ts_active_text_color}
										onChange={(value) => setAttributes({ ts_active_text_color: value })}
									/>

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.ts_tabs_bg_color}
										onChange={(value) => setAttributes({ ts_tabs_bg_color: value })}
									/>

									<ColorControl
										label={__('Active background', 'voxel-fse')}
										value={attributes.ts_tabs_bg_active_color}
										onChange={(value) => setAttributes({ ts_tabs_bg_active_color: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.ts_tabs_borderType || '',
											borderWidth: attributes.ts_tabs_borderWidth || {},
											borderColor: attributes.ts_tabs_borderColor || '',
										}}
										onChange={(value: BorderGroupValue) => {
											const updates: Partial<SalesChartAttributes> = {};
											if (value.borderType !== undefined) {
												updates.ts_tabs_borderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.ts_tabs_borderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.ts_tabs_borderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ColorControl
										label={__('Active border color', 'voxel-fse')}
										value={attributes.ts_tabs_border_active}
										onChange={(value) => setAttributes({ ts_tabs_border_active: value })}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_tabs_radius"
										min={0}
										max={100}
										availableUnits={['px']}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<SectionHeading label={__('Timeline tabs', 'voxel-fse')} />

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.ts_tabs_text_color_h}
										onChange={(value) => setAttributes({ ts_tabs_text_color_h: value })}
									/>

									<ColorControl
										label={__('Active text color', 'voxel-fse')}
										value={attributes.ts_tabs_active_text_color_h}
										onChange={(value) => setAttributes({ ts_tabs_active_text_color_h: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.ts_tabs_border_color_h}
										onChange={(value) => setAttributes({ ts_tabs_border_color_h: value })}
									/>

									<ColorControl
										label={__('Active border color', 'voxel-fse')}
										value={attributes.ts_tabs_border_h_active}
										onChange={(value) => setAttributes({ ts_tabs_border_h_active: value })}
									/>

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.ts_tabs_bg_color_h}
										onChange={(value) => setAttributes({ ts_tabs_bg_color_h: value })}
									/>

									<ColorControl
										label={__('Active background', 'voxel-fse')}
										value={attributes.ts_bg_active_color_h}
										onChange={(value) => setAttributes({ ts_bg_active_color_h: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 3: Next/Prev week buttons (with Normal/Hover states) */}
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
					{(tab) => (
						<>
							{tab.name === 'normal' && (
								<>
									<SectionHeading label={__('Range', 'voxel-fse')} />

									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="week_range_typo"
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.week_range_col}
										onChange={(value) => setAttributes({ week_range_col: value })}
									/>

									<SectionHeading label={__('Week buttons', 'voxel-fse')} />

									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.ts_week_btn_color}
										onChange={(value) => setAttributes({ ts_week_btn_color: value })}
									/>

									<ResponsiveRangeControl
										label={__('Button icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_week_btn_icon_size"
										min={0}
										max={100}
										availableUnits={['px', '%']}
									/>

									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.ts_week_btn_bg}
										onChange={(value) => setAttributes({ ts_week_btn_bg: value })}
									/>

									<BorderGroupControl
										label={__('Button border', 'voxel-fse')}
										value={{
											borderType: attributes.ts_week_btn_borderType || '',
											borderWidth: attributes.ts_week_btn_borderWidth || {},
											borderColor: attributes.ts_week_btn_borderColor || '',
										}}
										onChange={(value: BorderGroupValue) => {
											const updates: Partial<SalesChartAttributes> = {};
											if (value.borderType !== undefined) {
												updates.ts_week_btn_borderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.ts_week_btn_borderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.ts_week_btn_borderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<ResponsiveRangeControl
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_week_btn_radius"
										min={0}
										max={100}
										availableUnits={['px', '%']}
									/>

									<ResponsiveRangeControl
										label={__('Button size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="ts_week_btn_size"
										min={0}
										max={100}
										availableUnits={['px', '%']}
									/>

									<SectionHeading label={__('Icons', 'voxel-fse')} />
								</>
							)}

							{tab.name === 'hover' && (
								<>
									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.ts_week_btn_h}
										onChange={(value) => setAttributes({ ts_week_btn_h: value })}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.ts_week_btn_bg_h}
										onChange={(value) => setAttributes({ ts_week_btn_bg_h: value })}
									/>

									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.ts_week_border_c_h}
										onChange={(value) => setAttributes({ ts_week_border_c_h: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 4: No activity */}
			<AccordionPanel id="no-activity" title={__('No activity', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_nopost_content_Gap"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_nopost_ico_size"
					min={0}
					max={100}
					availableUnits={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.ts_nopost_ico_col}
					onChange={(value) => setAttributes({ ts_nopost_ico_col: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="ts_nopost_typo"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.ts_nopost_typo_col}
					onChange={(value) => setAttributes({ ts_nopost_typo_col: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
