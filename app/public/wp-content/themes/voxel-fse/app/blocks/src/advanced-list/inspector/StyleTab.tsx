/**
 * Advanced List Block - Style Tab
 *
 * Style controls matching Voxel's advanced-list widget Style tab.
 * Uses native Gutenberg controls with responsive support.
 *
 * DEBUGGING: Stripped down to isolate the error.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import type { AdvancedListAttributes } from '../types';
import {
	ResponsiveToggle,
	ResponsiveRangeControl,
	ResponsiveDropdownButton,
	StateTabPanel,
	ChooseControl,
	DimensionsControl,
	SectionHeading,
	ColorControl,
	BoxShadowPopup,
	TypographyControl,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';
import BorderGroupControl from '@shared/controls/BorderGroupControl';
import { getCurrentDeviceType } from '@shared/utils/deviceType';

interface StyleTabProps {
	attributes: AdvancedListAttributes;
	setAttributes: (attrs: Partial<AdvancedListAttributes>) => void;
}

export default function StyleTab({ attributes, setAttributes }: StyleTabProps) {
	const {
		enableCssGrid,
		enableCssGrid_tablet,
		enableCssGrid_mobile,
		itemWidth,
	} = attributes;

	// Get current device for conditional logic
	const currentDevice = (useSelect as any)((select: any) => getCurrentDeviceType(select), []);

	// Helper to get responsive attribute value
	const getResponsiveAttr = (baseName: string) => {
		const attrs = attributes as Record<string, any>;
		if (currentDevice === 'desktop') return attrs[baseName];
		if (currentDevice === 'tablet') return attrs[`${baseName}_tablet`] ?? attrs[baseName];
		return attrs[`${baseName}_mobile`] ?? attrs[`${baseName}_tablet`] ?? attrs[baseName];
	};

	// Helper to set responsive attribute value
	const setResponsiveAttr = (baseName: string, value: any) => {
		if (currentDevice === 'desktop') setAttributes({ [baseName]: value } as any);
		else if (currentDevice === 'tablet') setAttributes({ [`${baseName}_tablet`]: value } as any);
		else setAttributes({ [`${baseName}_mobile`]: value } as any);
	};

	// Determine if CSS Grid is enabled for current device
	const isCssGridEnabled = (): boolean => {
		if (currentDevice === 'desktop') {
			return enableCssGrid ?? false;
		} else if (currentDevice === 'tablet') {
			return enableCssGrid_tablet ?? enableCssGrid ?? false;
		} else {
			return enableCssGrid_mobile ?? enableCssGrid_tablet ?? enableCssGrid ?? false;
		}
	};

	const gridEnabled = isCssGridEnabled();

	return (
		<AccordionPanelGroup
			defaultPanel="list"
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
		>
			{/* List Accordion */}
			<AccordionPanel id="list" title={__('List', 'voxel-fse')}>
				{/* Enable CSS Grid - Responsive Toggle */}
				<ResponsiveToggle
					label={__('Enable CSS grid', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="enableCssGrid"
				/>

				{/* Number of columns - only shown when CSS grid is enabled */}
				{gridEnabled && (
					<ResponsiveRangeControl
						label={__('Number of columns', 'voxel-fse')}
						attributes={attributes as Record<string, any>}
						setAttributes={setAttributes as (attrs: Record<string, any>) => void}
						attributeBaseName="gridColumns"
						min={1}
						max={24}
						step={1}
						enableDynamicTags={true}
					/>
				)}

				{/* Item width - only shown when CSS grid is disabled */}
				{!gridEnabled && (
					<>
						<div style={{ marginBottom: '16px' }}>
							<SelectControl
								__nextHasNoMarginBottom
								label={__('Item width', 'voxel-fse')}
								value={itemWidth}
								options={[
									{ label: __('Auto', 'voxel-fse'), value: 'auto' },
									{ label: __('Custom item width', 'voxel-fse'), value: 'custom' },
								]}
								onChange={(value: string) => setAttributes({ itemWidth: value })}
							/>
						</div>

						{/* Custom width - only shown when itemWidth is 'custom' */}
						{itemWidth === 'custom' && (
							<ResponsiveRangeControl
								label={__('Width', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								attributeBaseName="customItemWidth"
								min={50}
								max={200}
								step={1}
								availableUnits={['px', '%']}
								unitAttributeName="customItemWidthUnit"
								enableDynamicTags={true}
							/>
						)}
					</>
				)}

				{/* Justify - only shown when CSS grid is disabled */}
				{!gridEnabled && (
					<div style={{ marginBottom: '16px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
							<label style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(30, 30, 30)' }}>
								{__('Justify', 'voxel-fse')}
							</label>
							<ResponsiveDropdownButton />
						</div>
						<SelectControl
							__nextHasNoMarginBottom
							value={getResponsiveAttr('listJustify')}
							options={[
								{ label: __('Left', 'voxel-fse'), value: 'left' },
								{ label: __('Center', 'voxel-fse'), value: 'center' },
								{ label: __('Right', 'voxel-fse'), value: 'right' },
								{ label: __('Space between', 'voxel-fse'), value: 'space-between' },
								{ label: __('Space around', 'voxel-fse'), value: 'space-around' },
							]}
							onChange={(value: string) => setResponsiveAttr('listJustify', value)}
						/>
					</div>
				)}

				{/* Item gap - always shown */}
				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="itemGap"
					min={0}
					max={100}
					step={1}
					availableUnits={['px']}
					unitAttributeName="itemGapUnit"
					enableDynamicTags={true}
				/>
			</AccordionPanel>

			{/* List item Accordion */}
			<AccordionPanel id="list-item" title={__('List item', 'voxel-fse')}>
				<StateTabPanel
					attributeName="listItemActiveTab"
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
									{/* General section heading */}
									<SectionHeading label={__('General', 'voxel-fse')} />

									{/* Justify content */}
									<ChooseControl
										label={__('Justify content', 'voxel-fse')}
										value={getResponsiveAttr('itemJustifyContent')}
										onChange={(value) => setResponsiveAttr('itemJustifyContent', value)}
										options={[
											{ value: 'flex-start', icon: 'eicon-v-align-top', label: __('Start', 'voxel-fse') },
											{ value: 'center', icon: 'eicon-v-align-middle', label: __('Center', 'voxel-fse') },
											{ value: 'flex-end', icon: 'eicon-v-align-bottom', label: __('End', 'voxel-fse') },
										]}
										controls={<ResponsiveDropdownButton />}
									/>

									{/* Item Padding */}
									<DimensionsControl
										label={__('Item Padding', 'voxel-fse')}
										values={getResponsiveAttr('itemPadding') || {}}
										onChange={(value) => setResponsiveAttr('itemPadding', value)}
										availableUnits={['px', '%', 'em']}
										controls={<ResponsiveDropdownButton />}
									/>

									{/* Height */}
									<ResponsiveRangeControl
										label={__('Height', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="itemHeight"
										min={0}
										max={500}
										step={1}
										availableUnits={['px', 'vh']}
										unitAttributeName="itemHeightUnit"
									/>

									{/* Border (using shared BorderGroupControl) */}
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.itemBorderType,
											borderWidth: attributes.itemBorderWidth,
											borderColor: attributes.itemBorderColor,
										}}
										onChange={(val) => setAttributes({
											itemBorderType: val.borderType,
											itemBorderWidth: val.borderWidth,
											itemBorderColor: val.borderColor,
										} as any)}
										hideRadius={true}
									/>

									{/* Border radius (responsive) */}
									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="itemBorderRadius"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
										unitAttributeName="itemBorderRadiusUnit"
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="itemBoxShadow"
									/>

									{/* Typography section heading */}
									<SectionHeading label={__('Typography', 'voxel-fse')} />

									{/* Typography popup control */}
									<TypographyControl
										label={__('Typography', 'voxel-fse')}
										value={attributes.itemTypography}
										onChange={(value) => setAttributes({ itemTypography: value })}
									/>

									{/* Item colors section heading */}
									<SectionHeading label={__('Item colors', 'voxel-fse')} />

									{/* Text color */}
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.itemTextColor}
										onChange={(value) => setAttributes({ itemTextColor: value })}
									/>

									{/* Background color */}
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.itemBackgroundColor}
										onChange={(value) => setAttributes({ itemBackgroundColor: value })}
									/>

									{/* Icon Container section heading */}
									<SectionHeading label={__('Icon Container', 'voxel-fse')} />

									{/* Icon on top toggle */}
									<ToggleControl
										__nextHasNoMarginBottom
										label={__('Icon on top?', 'voxel-fse')}
										checked={attributes.iconOnTop}
										onChange={(value: boolean) => setAttributes({ iconOnTop: value })}
									/>

									{/* Icon container background color */}
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.iconContainerBackground}
										onChange={(value) => setAttributes({ iconContainerBackground: value })}
									/>

									{/* Icon container size */}
									<ResponsiveRangeControl
										label={__('Size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="iconContainerSize"
										min={0}
										max={200}
										step={1}
										availableUnits={['px']}
										unitAttributeName="iconContainerSizeUnit"
									/>

									{/* Icon container border (using shared BorderGroupControl) */}
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.iconContainerBorderType,
											borderWidth: attributes.iconContainerBorderWidth,
											borderColor: attributes.iconContainerBorderColor,
										}}
										onChange={(val) => setAttributes({
											iconContainerBorderType: val.borderType,
											iconContainerBorderWidth: val.borderWidth,
											iconContainerBorderColor: val.borderColor,
										} as any)}
										hideRadius={true}
									/>

									{/* Icon container border radius (responsive) */}
									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="iconContainerBorderRadius"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', '%']}
										unitAttributeName="iconContainerBorderRadiusUnit"
									/>

									{/* Icon container box shadow */}
									<BoxShadowPopup
										label={__('Box shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="iconContainerBoxShadow"
									/>

									{/* Icon/Text spacing */}
									<ResponsiveRangeControl
										label={__('Icon/Text spacing', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="iconTextSpacing"
										min={0}
										max={100}
										step={1}
										availableUnits={['px']}
										unitAttributeName="iconTextSpacingUnit"
									/>

									{/* Icon section heading */}
									<SectionHeading label={__('Icon', 'voxel-fse')} />

									{/* Icon size */}
									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="iconSize"
										min={0}
										max={100}
										step={1}
										availableUnits={['px', 'em']}
										unitAttributeName="iconSizeUnit"
									/>

									{/* Icon color */}
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.iconColor}
										onChange={(value) => setAttributes({ iconColor: value })}
									/>

									{/* Margin (Deprecated) section heading */}
									<SectionHeading label={__('Margin (Deprecated)', 'voxel-fse')} />

									{/* Item margin */}
									<DimensionsControl
										label={__('Margin', 'voxel-fse')}
										values={getResponsiveAttr('itemMargin') || {}}
										onChange={(value) => setResponsiveAttr('itemMargin', value)}
										availableUnits={['px', '%', 'em']}
										controls={<ResponsiveDropdownButton />}
									/>
								</>
							)}
							{tab.name === 'hover' && (
								<>
									{/* Border section */}
									<SectionHeading label={__('Border', 'voxel-fse')} />

									{/* Border color hover */}
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.itemBorderColorHover}
										onChange={(value) => setAttributes({ itemBorderColorHover: value })}
									/>

									{/* Box Shadow hover */}
									<BoxShadowPopup
										label={__('Box shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="itemBoxShadowHover"
									/>

									{/* Background color hover */}
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.itemBackgroundColorHover}
										onChange={(value) => setAttributes({ itemBackgroundColorHover: value })}
									/>

									{/* Item colors section */}
									<SectionHeading label={__('Item colors', 'voxel-fse')} />

									{/* Text color hover */}
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.itemTextColorHover}
										onChange={(value) => setAttributes({ itemTextColorHover: value })}
									/>

									{/* Icon section */}
									<SectionHeading label={__('Icon', 'voxel-fse')} />

									{/* Icon color hover */}
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.iconColorHover}
										onChange={(value) => setAttributes({ iconColorHover: value })}
									/>

									{/* Icon Container section */}
									<SectionHeading label={__('Icon Container', 'voxel-fse')} />

									{/* Icon container background hover */}
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.iconContainerBackgroundHover}
										onChange={(value) => setAttributes({ iconContainerBackgroundHover: value })}
									/>

									{/* Icon container border color hover */}
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.iconContainerBorderColorHover}
										onChange={(value) => setAttributes({ iconContainerBorderColorHover: value })}
									/>
								</>
							)}
							{tab.name === 'active' && (
								<>
									{/* Border section */}
									<SectionHeading label={__('Border', 'voxel-fse')} />

									{/* Border color active */}
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.itemBorderColorActive}
										onChange={(value) => setAttributes({ itemBorderColorActive: value })}
									/>

									{/* Box Shadow active */}
									<BoxShadowPopup
										label={__('Box shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="itemBoxShadowActive"
									/>

									{/* Background color active */}
									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.itemBackgroundColorActive}
										onChange={(value) => setAttributes({ itemBackgroundColorActive: value })}
									/>

									{/* Item colors section */}
									<SectionHeading label={__('Item colors', 'voxel-fse')} />

									{/* Text color active */}
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.itemTextColorActive}
										onChange={(value) => setAttributes({ itemTextColorActive: value })}
									/>

									{/* Icon section */}
									<SectionHeading label={__('Icon', 'voxel-fse')} />

									{/* Icon color active */}
									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.iconColorActive}
										onChange={(value) => setAttributes({ iconColorActive: value })}
									/>

									{/* Icon Container section */}
									<SectionHeading label={__('Icon Container', 'voxel-fse')} />

									{/* Icon container background active */}
									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.iconContainerBackgroundActive}
										onChange={(value) => setAttributes({ iconContainerBackgroundActive: value })}
									/>

									{/* Icon container border color active */}
									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.iconContainerBorderColorActive}
										onChange={(value) => setAttributes({ iconContainerBorderColorActive: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Tooltips Accordion */}
			<AccordionPanel id="tooltips" title={__('Tooltips', 'voxel-fse')}>
				{/* Display below item toggle */}
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Display below item?', 'voxel-fse')}
					checked={attributes.tooltipBottom}
					onChange={(value: boolean) => setAttributes({ tooltipBottom: value })}
				/>

				{/* Text color */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.tooltipTextColor}
					onChange={(value) => setAttributes({ tooltipTextColor: value })}
				/>

				{/* Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.tooltipTypography}
					onChange={(value) => setAttributes({ tooltipTypography: value })}
				/>

				{/* Background color */}
				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.tooltipBackgroundColor}
					onChange={(value) => setAttributes({ tooltipBackgroundColor: value })}
				/>

				{/* Border radius */}
				<ResponsiveRangeControl
					label={__('Radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="tooltipBorderRadius"
					min={0}
					max={100}
					step={1}
					availableUnits={['px', '%']}
					unitAttributeName="tooltipBorderRadiusUnit"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
