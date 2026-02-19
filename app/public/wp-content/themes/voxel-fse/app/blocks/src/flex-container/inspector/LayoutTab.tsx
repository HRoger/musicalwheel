/**
 * Flex Container Block - Layout Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Container, Additional Options accordions.
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl, BaseControl, Button, TextControl } from '@wordpress/components';

import {
	ResponsiveRangeControlWithDropdown,
	LinkedGapsControl,
	SectionHeading,
	ResponsiveRangeControl,
} from '@shared/controls';
import { AccordionPanelGroup, AccordionPanel } from '@shared/controls/AccordionPanelGroup';

import { ResponsiveIconButtonGroup } from './ResponsiveIconButtonGroup';
import {
	FlexDirectionIcons,
	JustifyContentIconsHorizontal,
	JustifyContentIconsVertical,
	AlignItemsIconsVertical,
	AlignItemsIconsHorizontal,
	FlexWrapIcons,
	AlignContentIcons,
	isColumnDirection,
} from './icons';

interface LayoutTabProps {
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
}

/**
 * Layout Tab Component
 *
 * Renders the Layout tab with two accordion sections:
 * - Container (layout type, width, height, flex/grid controls)
 * - Additional Options (HTML tag, overflow)
 */
export function LayoutTab({ attributes, setAttributes }: LayoutTabProps): JSX.Element {
	// Content Width Options (Elementor-style dropdown)
	const contentWidthOptions = [
		{ label: __('Boxed', 'voxel-fse'), value: 'boxed' },
		{ label: __('Full Width', 'voxel-fse'), value: 'full' },
	];

	// Flex Direction Options with icons
	const flexDirectionOptions = [
		{ value: 'row', icon: FlexDirectionIcons.row, label: __('Row', 'voxel-fse') },
		{ value: 'column', icon: FlexDirectionIcons.column, label: __('Column', 'voxel-fse') },
		{
			value: 'row-reverse',
			icon: FlexDirectionIcons['row-reverse'],
			label: __('Row Reverse', 'voxel-fse'),
		},
		{
			value: 'column-reverse',
			icon: FlexDirectionIcons['column-reverse'],
			label: __('Column Reverse', 'voxel-fse'),
		},
	];

	// Get current flex direction to determine which icon set to use
	const currentFlexDirection = attributes.flexDirection || 'row';
	const isColumn = isColumnDirection(currentFlexDirection);

	// Justify Content Options - icons change based on flex direction
	const JustifyIcons = isColumn ? JustifyContentIconsVertical : JustifyContentIconsHorizontal;
	const justifyContentOptions = useMemo(
		() => [
			{ value: 'flex-start', icon: JustifyIcons['flex-start'], label: __('Start', 'voxel-fse') },
			{ value: 'center', icon: JustifyIcons['center'], label: __('Center', 'voxel-fse') },
			{ value: 'flex-end', icon: JustifyIcons['flex-end'], label: __('End', 'voxel-fse') },
			{
				value: 'space-between',
				icon: JustifyIcons['space-between'],
				label: __('Space Between', 'voxel-fse'),
			},
			{
				value: 'space-around',
				icon: JustifyIcons['space-around'],
				label: __('Space Around', 'voxel-fse'),
			},
			{
				value: 'space-evenly',
				icon: JustifyIcons['space-evenly'],
				label: __('Space Evenly', 'voxel-fse'),
			},
		],
		[isColumn]
	);

	// Align Items Options - icons change based on flex direction (only 4 options, no baseline)
	const AlignIcons = isColumn ? AlignItemsIconsHorizontal : AlignItemsIconsVertical;
	const alignItemsOptions = useMemo(
		() => [
			{ value: 'flex-start', icon: AlignIcons['flex-start'], label: __('Start', 'voxel-fse') },
			{ value: 'center', icon: AlignIcons['center'], label: __('Center', 'voxel-fse') },
			{ value: 'flex-end', icon: AlignIcons['flex-end'], label: __('End', 'voxel-fse') },
			{ value: 'stretch', icon: AlignIcons['stretch'], label: __('Stretch', 'voxel-fse') },
		],
		[isColumn]
	);

	// Flex Wrap Options with icons (only 2 options matching Elementor)
	const flexWrapOptions = [
		{ value: 'nowrap', icon: FlexWrapIcons['nowrap'], label: __('No Wrap', 'voxel-fse') },
		{ value: 'wrap', icon: FlexWrapIcons['wrap'], label: __('Wrap', 'voxel-fse') },
	];

	// Align Content Options - only shown when wrap is enabled
	const alignContentOptions = [
		{
			value: 'flex-start',
			icon: AlignContentIcons['flex-start'],
			label: __('Start', 'voxel-fse'),
		},
		{ value: 'center', icon: AlignContentIcons['center'], label: __('Center', 'voxel-fse') },
		{ value: 'flex-end', icon: AlignContentIcons['flex-end'], label: __('End', 'voxel-fse') },
		{
			value: 'space-between',
			icon: AlignContentIcons['space-between'],
			label: __('Space Between', 'voxel-fse'),
		},
		{
			value: 'space-around',
			icon: AlignContentIcons['space-around'],
			label: __('Space Around', 'voxel-fse'),
		},
		{
			value: 'space-evenly',
			icon: AlignContentIcons['space-evenly'],
			label: __('Space Evenly', 'voxel-fse'),
		},
	];

	// Container Layout Options (matching Elementor)
	const containerLayoutOptions = [
		{ label: __('Flexbox', 'voxel-fse'), value: 'flexbox' },
		{ label: __('Grid', 'voxel-fse'), value: 'grid' },
	];

	return (
		<AccordionPanelGroup
			defaultPanel="container"
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="layoutOpenPanel"
		>
			<AccordionPanel id="container" title={__('Container', 'voxel-fse')}>
				{/* Container Layout - Dropdown */}
				<SelectControl
					label={__('Container Layout', 'voxel-fse')}
					value={attributes.containerLayout || 'flexbox'}
					options={containerLayoutOptions}
					onChange={(value: any) => setAttributes({ containerLayout: value })}
					__nextHasNoMarginBottom
				/>

				{/* Content Width - Dropdown */}
				<SelectControl
					label={__('Content Width', 'voxel-fse')}
					value={attributes.contentWidthType || 'boxed'}
					options={contentWidthOptions}
					onChange={(value: any) => {
						// Auto-set width values based on content width type
						if (value === 'full') {
							setAttributes({
								contentWidthType: value,
								contentWidth: 100,
								contentWidthUnit: '%',
							});
						} else {
							// Boxed - set to 1140px (inner wrapper will constrain)
							setAttributes({
								contentWidthType: value,
								contentWidth: 1140,
								contentWidthUnit: 'px',
							});
						}
					}}
					__nextHasNoMarginBottom
				/>

				{/* Width - Responsive slider (always visible) */}
				<ResponsiveRangeControlWithDropdown
					label={__('Width', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="contentWidth"
					min={0}
					max={2000}
					availableUnits={['px', '%', 'em', 'rem', 'vw', 'custom']}
					unitAttributeName="contentWidthUnit"
					customValueAttributeName="contentWidthCustom"
					showResetButton={true}
				/>

				{/* Min Height - Responsive slider */}
				<ResponsiveRangeControlWithDropdown
					label={__('Min Height', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="minHeight"
					min={0}
					max={1000}
					availableUnits={['px', '%', 'em', 'rem', 'vh', 'vw', 'custom']}
					unitAttributeName="minHeightUnit"
					customValueAttributeName="minHeightCustom"
					showResetButton={true}
				/>

				{/* Note about 100vh */}
				<p
					style={{
						fontSize: '12px',
						color: '#757575',
						marginTop: '4px',
						marginBottom: '16px',
						fontStyle: 'italic',
					}}
				>
					{__('To achieve full height Container use 100vh.', 'voxel-fse')}
				</p>

				{/* Items Section Heading */}
				<SectionHeading label={__('Items', 'voxel-fse')} />

				{/* FLEXBOX CONTROLS - Only show when containerLayout is 'flexbox' */}
				{(attributes.containerLayout || 'flexbox') === 'flexbox' && (
					<>
						{/* Direction - Responsive icon buttons */}
						<ResponsiveIconButtonGroup
							label={__('Direction', 'voxel-fse')}
							attributeBaseName="flexDirection"
							attributes={attributes}
							setAttributes={setAttributes}
							options={flexDirectionOptions}
						/>

						{/* Justify Content - Responsive icon buttons */}
						<ResponsiveIconButtonGroup
							label={__('Justify Content', 'voxel-fse')}
							attributeBaseName="justifyContent"
							attributes={attributes}
							setAttributes={setAttributes}
							options={justifyContentOptions}
						/>

						{/* Align Items - Responsive icon buttons */}
						<ResponsiveIconButtonGroup
							label={__('Align Items', 'voxel-fse')}
							attributeBaseName="alignItems"
							attributes={attributes}
							setAttributes={setAttributes}
							options={alignItemsOptions}
						/>

						{/* Gaps - Linked dual inputs (Column/Row) */}
						<LinkedGapsControl
							label={__('Gaps', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							columnGapAttr="columnGap"
							rowGapAttr="rowGap"
							unitAttr="gapUnit"
							linkedAttr="gapsLinked"
							min={0}
							max={200}
							availableUnits={['px', 'em', '%']}
							showResetButton={true}
						/>

						{/* Wrap - Responsive icon buttons */}
						<ResponsiveIconButtonGroup
							label={__('Wrap', 'voxel-fse')}
							attributeBaseName="flexWrap"
							attributes={attributes}
							setAttributes={setAttributes}
							options={flexWrapOptions}
						/>

						{/* Align Content - only show when wrap is enabled */}
						{attributes.flexWrap === 'wrap' && (
							<ResponsiveIconButtonGroup
								label={__('Align Content', 'voxel-fse')}
								attributeBaseName="alignContent"
								attributes={attributes}
								setAttributes={setAttributes}
								options={alignContentOptions}
							/>
						)}

						{/* Note about wrap behavior */}
						<p
							style={{
								fontSize: '12px',
								color: '#757575',
								marginTop: '4px',
								marginBottom: '0',
								fontStyle: 'italic',
							}}
						>
							{__(
								'Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).',
								'voxel-fse'
							)}
						</p>
					</>
				)}

				{/* GRID CONTROLS - Only show when containerLayout is 'grid' */}
				{attributes.containerLayout === 'grid' && (
					<>
						{/* Grid Outline Toggle (Editor only) */}
						<BaseControl>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<span
									style={{
										fontSize: '11px',
										fontWeight: 500,
										textTransform: 'uppercase' as const,
										color: '#1e1e1e',
									}}
								>
									{__('Grid Outline', 'voxel-fse')}
								</span>
								<Button
									onClick={() => setAttributes({ gridOutline: !attributes.gridOutline })}
									style={{
										padding: '4px 12px',
										height: '28px',
										backgroundColor: attributes.gridOutline ? 'var(--vxfse-accent-color, #3858e9)' : '#f0f0f1',
										color: attributes.gridOutline ? '#ffffff' : '#1e1e1e',
										borderColor: attributes.gridOutline ? 'var(--vxfse-accent-color, #3858e9)' : '#dcdcde',
										fontSize: '12px',
									}}
								>
									{attributes.gridOutline ? __('Show', 'voxel-fse') : __('Hide', 'voxel-fse')}
								</Button>
							</div>
						</BaseControl>

						{/* Grid Columns */}
						<ResponsiveRangeControlWithDropdown
							label={__('Columns', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="gridColumns"
							min={1}
							max={12}
							availableUnits={['fr', 'px', '%', 'auto']}
							unitAttributeName="gridColumnsUnit"
							showResetButton={true}
						/>

						{/* Grid Rows */}
						<ResponsiveRangeControlWithDropdown
							label={__('Rows', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="gridRows"
							min={1}
							max={12}
							availableUnits={['fr', 'px', '%', 'auto']}
							unitAttributeName="gridRowsUnit"
							showResetButton={true}
						/>

						{/* Gaps - Linked dual inputs (Column/Row) - same control for Grid */}
						<LinkedGapsControl
							label={__('Gaps', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							columnGapAttr="columnGap"
							rowGapAttr="rowGap"
							unitAttr="gapUnit"
							linkedAttr="gapsLinked"
							min={0}
							max={200}
							availableUnits={['px', 'em', '%']}
							showResetButton={true}
						/>

						{/* Auto Flow */}
						<SelectControl
							label={__('Auto Flow', 'voxel-fse')}
							value={attributes.gridAutoFlow || 'row'}
							options={[
								{ label: __('Row', 'voxel-fse'), value: 'row' },
								{ label: __('Column', 'voxel-fse'), value: 'column' },
							]}
							onChange={(value: any) => setAttributes({ gridAutoFlow: value })}
							__nextHasNoMarginBottom
						/>

						{/* Grid Alignment Section */}
						<SectionHeading label={__('Alignment', 'voxel-fse')} />

						{/* Justify Items */}
						<ResponsiveIconButtonGroup
							label={__('Justify Items', 'voxel-fse')}
							attributeBaseName="gridJustifyItems"
							attributes={attributes}
							setAttributes={setAttributes}
							options={[
								{ value: 'start', icon: <span className="eicon-flex eicon-justify-start-h" style={{ fontSize: '16px' }} />, label: __('Start', 'voxel-fse') },
								{ value: 'center', icon: <span className="eicon-flex eicon-justify-center-h" style={{ fontSize: '16px' }} />, label: __('Center', 'voxel-fse') },
								{ value: 'end', icon: <span className="eicon-flex eicon-justify-end-h" style={{ fontSize: '16px' }} />, label: __('End', 'voxel-fse') },
								{ value: 'stretch', icon: <span className="eicon-flex eicon-align-stretch-h" style={{ fontSize: '16px' }} />, label: __('Stretch', 'voxel-fse') },
							]}
						/>

						{/* Align Items */}
						<ResponsiveIconButtonGroup
							label={__('Align Items', 'voxel-fse')}
							attributeBaseName="gridAlignItems"
							attributes={attributes}
							setAttributes={setAttributes}
							options={[
								{ value: 'start', icon: <span className="eicon-flex eicon-align-start-v" style={{ fontSize: '16px' }} />, label: __('Start', 'voxel-fse') },
								{ value: 'center', icon: <span className="eicon-flex eicon-align-center-v" style={{ fontSize: '16px' }} />, label: __('Center', 'voxel-fse') },
								{ value: 'end', icon: <span className="eicon-flex eicon-align-end-v" style={{ fontSize: '16px' }} />, label: __('End', 'voxel-fse') },
								{ value: 'stretch', icon: <span className="eicon-flex eicon-align-stretch-v" style={{ fontSize: '16px' }} />, label: __('Stretch', 'voxel-fse') },
							]}
						/>

						{/* Justify Content */}
						<ResponsiveIconButtonGroup
							label={__('Justify Content', 'voxel-fse')}
							attributeBaseName="gridJustifyContent"
							attributes={attributes}
							setAttributes={setAttributes}
							options={[
								{ value: 'start', icon: <span className="eicon-flex eicon-justify-start-h" style={{ fontSize: '16px' }} />, label: __('Start', 'voxel-fse') },
								{ value: 'center', icon: <span className="eicon-flex eicon-justify-center-h" style={{ fontSize: '16px' }} />, label: __('Center', 'voxel-fse') },
								{ value: 'end', icon: <span className="eicon-flex eicon-justify-end-h" style={{ fontSize: '16px' }} />, label: __('End', 'voxel-fse') },
								{ value: 'space-between', icon: <span className="eicon-flex eicon-justify-space-between-h" style={{ fontSize: '16px' }} />, label: __('Space Between', 'voxel-fse') },
								{ value: 'space-around', icon: <span className="eicon-flex eicon-justify-space-around-h" style={{ fontSize: '16px' }} />, label: __('Space Around', 'voxel-fse') },
								{ value: 'space-evenly', icon: <span className="eicon-flex eicon-justify-space-evenly-h" style={{ fontSize: '16px' }} />, label: __('Space Evenly', 'voxel-fse') },
							]}
						/>

						{/* Align Content */}
						<ResponsiveIconButtonGroup
							label={__('Align Content', 'voxel-fse')}
							attributeBaseName="gridAlignContent"
							attributes={attributes}
							setAttributes={setAttributes}
							options={[
								{ value: 'start', icon: <span className="eicon-flex eicon-align-start-v" style={{ fontSize: '16px' }} />, label: __('Start', 'voxel-fse') },
								{ value: 'center', icon: <span className="eicon-flex eicon-align-center-v" style={{ fontSize: '16px' }} />, label: __('Center', 'voxel-fse') },
								{ value: 'end', icon: <span className="eicon-flex eicon-align-end-v" style={{ fontSize: '16px' }} />, label: __('End', 'voxel-fse') },
								{ value: 'space-between', icon: <span className="eicon-flex eicon-justify-space-between-v" style={{ fontSize: '16px' }} />, label: __('Space Between', 'voxel-fse') },
								{ value: 'space-around', icon: <span className="eicon-flex eicon-justify-space-around-v" style={{ fontSize: '16px' }} />, label: __('Space Around', 'voxel-fse') },
								{ value: 'space-evenly', icon: <span className="eicon-flex eicon-justify-space-evenly-v" style={{ fontSize: '16px' }} />, label: __('Space Evenly', 'voxel-fse') },
							]}
						/>

						{/* Note about Grid */}
						<p
							style={{
								fontSize: '12px',
								color: '#757575',
								marginTop: '8px',
								marginBottom: '0',
								fontStyle: 'italic',
							}}
						>
							{__(
								'CSS Grid provides precise control over rows and columns for complex layouts.',
								'voxel-fse'
							)}
						</p>
					</>
				)}
			</AccordionPanel>

			{/* Additional Options accordion */}
			<AccordionPanel id="additional-options" title={__('Additional Options', 'voxel-fse')}>
				<SelectControl
					label={__('HTML Tag', 'voxel-fse')}
					value={attributes.htmlTag}
					options={[
						{ label: 'div', value: 'div' },
						{ label: 'section', value: 'section' },
						{ label: 'header', value: 'header' },
						{ label: 'footer', value: 'footer' },
						{ label: 'main', value: 'main' },
						{ label: 'article', value: 'article' },
						{ label: 'aside', value: 'aside' },
						{ label: 'nav', value: 'nav' },
						{ label: 'a', value: 'a' },
					]}
					onChange={(value: any) => setAttributes({ htmlTag: value })}
					__nextHasNoMarginBottom
				/>

				{/* Link URL - Only show when HTML Tag is 'a' */}
				{attributes.htmlTag === 'a' && (
					<TextControl
						label={__('Link', 'voxel-fse')}
						value={attributes.containerLink?.url || ''}
						onChange={(url: any) =>
							setAttributes({
								containerLink: {
									...(attributes.containerLink || {}),
									url,
								},
							})
						}
						placeholder="https://"
						__nextHasNoMarginBottom
					/>
				)}

				<SelectControl
					label={__('Overflow', 'voxel-fse')}
					value={attributes.overflow}
					options={[
						{ label: __('Default', 'voxel-fse'), value: '' },
						{ label: __('Visible', 'voxel-fse'), value: 'visible' },
						{ label: __('Hidden', 'voxel-fse'), value: 'hidden' },
						{ label: __('Scroll', 'voxel-fse'), value: 'scroll' },
						{ label: __('Auto', 'voxel-fse'), value: 'auto' },
					]}
					onChange={(value: any) => setAttributes({ overflow: value })}
					__nextHasNoMarginBottom
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
