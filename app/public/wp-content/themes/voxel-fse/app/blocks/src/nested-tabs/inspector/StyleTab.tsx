/**
 * Nested Tabs Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the mandatory inspector folder pattern.
 * Maps to Voxel Nested Tabs Elementor widget Style tab controls.
 *
 * Accordions:
 * 1. Tabs - Gap, Distance from content, Normal/Hover/Active states (Background, Border, Shadow, Border Radius, Padding)
 * 2. Titles - Typography, Normal/Hover/Active states (Color, Text Shadow, Text Stroke)
 * 3. Icon - Position, Size, Spacing, Normal/Hover/Active states (Color)
 * 4. Content - Background, Border, Border Radius, Padding
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ResponsiveRangeControl,
	ResponsiveDropdownButton,
	StateTabPanel,
	ChooseControl,
	DimensionsControl,
	ColorControl,
	BoxShadowPopup,
	TypographyControl,
	TextShadowPopup,
	BorderGroupControl,
} from '@shared/controls';
import type { NestedTabsAttributes } from '../types';

interface StyleTabProps {
	attributes: NestedTabsAttributes;
	setAttributes: (attrs: Partial<NestedTabsAttributes>) => void;
}

/**
 * Icon position options
 * Maps to Elementor's icon_position control with 4 positions
 * Using Elementor icons for visual consistency
 */
const ICON_POSITION_OPTIONS = [
	{ value: 'block-start', title: __('Top', 'voxel-fse'), icon: 'eicon-v-align-top' },
	{ value: 'inline-end', title: __('End', 'voxel-fse'), icon: 'eicon-h-align-right' },
	{ value: 'block-end', title: __('Bottom', 'voxel-fse'), icon: 'eicon-v-align-bottom' },
	{ value: 'inline-start', title: __('Start', 'voxel-fse'), icon: 'eicon-h-align-left' },
];

/**
 * Background type options for inline ChooseControl
 * Matches Elementor's Background Type control pattern
 */
const BACKGROUND_TYPE_OPTIONS = [
	{ value: 'classic', title: __('Classic', 'voxel-fse'), icon: 'eicon-paint-brush' },
	{ value: 'gradient', title: __('Gradient', 'voxel-fse'), icon: 'eicon-barcode' },
];

/**
 * Style Tab Component
 *
 * Contains four accordion sections:
 * 1. Tabs - Tab button styling with state controls
 * 2. Titles - Typography and text styling for tab titles
 * 3. Icon - Icon positioning and color per state
 * 4. Content - Content area styling
 */
export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="tabs"
		>
			{/* Accordion 1: Tabs */}
			<AccordionPanel id="tabs" title={__('Tabs', 'voxel-fse')}>
				{/* Gap between tabs */}
				<ResponsiveRangeControl
					label={__('Gap between tabs', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="tabsGap"
					min={0}
					max={100}
					step={1}
					units={['px', 'em', '%']}
				/>

				{/* Distance from content */}
				<ResponsiveRangeControl
					label={__('Distance from content', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="tabsContentDistance"
					min={0}
					max={100}
					step={1}
					units={['px', 'em', '%']}
				/>

				{/* Normal/Hover/Active State Tabs */}
				<StateTabPanel
					attributeName="tabsStateTab"
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
									{/* Background Type */}
									<ChooseControl
										label={__('Background Type', 'voxel-fse')}
										value={attributes.tabsNormalBgType || ''}
										onChange={(value) => setAttributes({ tabsNormalBgType: value as any })}
										options={BACKGROUND_TYPE_OPTIONS}
										variant="inline"
									/>

									{/* Background Color - only show when classic selected */}
									{attributes.tabsNormalBgType === 'classic' && (
										<ColorControl
											label={__('Color', 'voxel-fse')}
											value={attributes.tabsNormalBg}
											onChange={(value) => setAttributes({ tabsNormalBg: value })}
										/>
									)}

									{/* Border Type using BorderGroupControl */}
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabsNormalBorderType || '',
											borderWidth: attributes.tabsNormalBorderWidth || {},
											borderColor: attributes.tabsNormalBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<NestedTabsAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tabsNormalBorderType = value.borderType as any;
											}
											if (value.borderWidth !== undefined) {
												updates.tabsNormalBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tabsNormalBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="tabsNormalBoxShadow"
									/>

									{/* Border Radius */}
									<DimensionsControl
										label={__('Border Radius', 'voxel-fse')}
										values={attributes.tabsBorderRadius?.desktop || {}}
										onChange={(value) =>
											setAttributes({
												tabsBorderRadius: { ...attributes.tabsBorderRadius, desktop: value },
											})
										}
										availableUnits={['px', '%', 'em']}
										controls={<ResponsiveDropdownButton />}
									/>

									{/* Padding */}
									<DimensionsControl
										label={__('Padding', 'voxel-fse')}
										values={attributes.tabsPadding?.desktop || {}}
										onChange={(value) =>
											setAttributes({
												tabsPadding: { ...attributes.tabsPadding, desktop: value },
											})
										}
										availableUnits={['px', '%', 'em']}
										controls={<ResponsiveDropdownButton />}
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Background Type */}
									<ChooseControl
										label={__('Background Type', 'voxel-fse')}
										value={attributes.tabsHoverBgType || ''}
										onChange={(value) => setAttributes({ tabsHoverBgType: value as any })}
										options={BACKGROUND_TYPE_OPTIONS}
										variant="inline"
									/>

									{/* Background Color - only show when classic selected */}
									{attributes.tabsHoverBgType === 'classic' && (
										<ColorControl
											label={__('Color', 'voxel-fse')}
											value={attributes.tabsHoverBg}
											onChange={(value) => setAttributes({ tabsHoverBg: value })}
										/>
									)}

									{/* Border Type using BorderGroupControl */}
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabsHoverBorderType || '',
											borderWidth: attributes.tabsHoverBorderWidth || {},
											borderColor: attributes.tabsHoverBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<NestedTabsAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tabsHoverBorderType = value.borderType as any;
											}
											if (value.borderWidth !== undefined) {
												updates.tabsHoverBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tabsHoverBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="tabsHoverBoxShadow"
									/>
								</>
							)}

							{tab.name === 'active' && (
								<>
									{/* Background Type */}
									<ChooseControl
										label={__('Background Type', 'voxel-fse')}
										value={attributes.tabsActiveBgType || ''}
										onChange={(value) => setAttributes({ tabsActiveBgType: value as any })}
										options={BACKGROUND_TYPE_OPTIONS}
										variant="inline"
									/>

									{/* Background Color - only show when classic selected */}
									{attributes.tabsActiveBgType === 'classic' && (
										<ColorControl
											label={__('Color', 'voxel-fse')}
											value={attributes.tabsActiveBg}
											onChange={(value) => setAttributes({ tabsActiveBg: value })}
										/>
									)}

									{/* Border Type using BorderGroupControl */}
									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tabsActiveBorderType || '',
											borderWidth: attributes.tabsActiveBorderWidth || {},
											borderColor: attributes.tabsActiveBorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<NestedTabsAttributes> = {};
											if (value.borderType !== undefined) {
												updates.tabsActiveBorderType = value.borderType as any;
											}
											if (value.borderWidth !== undefined) {
												updates.tabsActiveBorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tabsActiveBorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									{/* Box Shadow */}
									<BoxShadowPopup
										label={__('Box Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="tabsActiveBoxShadow"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 2: Titles */}
			<AccordionPanel id="titles" title={__('Titles', 'voxel-fse')}>
				{/* Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.titleTypography}
					onChange={(value) => setAttributes({ titleTypography: value })}
				/>

				{/* Normal/Hover/Active State Tabs for Titles */}
				<StateTabPanel
					attributeName="titlesStateTab"
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
									{/* Color */}
									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={attributes.titleNormalColor}
										onChange={(value) => setAttributes({ titleNormalColor: value })}
									/>

									{/* Text Shadow */}
									<TextShadowPopup
										label={__('Text Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleNormalTextShadow"
									/>

									{/* Text Stroke */}
									<TextShadowPopup
										label={__('Text Stroke', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleNormalTextStroke"
									/>
								</>
							)}

							{tab.name === 'hover' && (
								<>
									{/* Color */}
									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={attributes.titleHoverColor}
										onChange={(value) => setAttributes({ titleHoverColor: value })}
									/>

									{/* Text Shadow */}
									<TextShadowPopup
										label={__('Text Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleHoverTextShadow"
									/>

									{/* Text Stroke */}
									<TextShadowPopup
										label={__('Text Stroke', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleHoverTextStroke"
									/>
								</>
							)}

							{tab.name === 'active' && (
								<>
									{/* Color */}
									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={attributes.titleActiveColor}
										onChange={(value) => setAttributes({ titleActiveColor: value })}
									/>

									{/* Text Shadow */}
									<TextShadowPopup
										label={__('Text Shadow', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleActiveTextShadow"
									/>

									{/* Text Stroke */}
									<TextShadowPopup
										label={__('Text Stroke', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										shadowAttributeName="titleActiveTextStroke"
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 3: Icon */}
			<AccordionPanel id="icon" title={__('Icon', 'voxel-fse')}>
				{/* Position - ChooseControl with 4 position icons */}
				<ChooseControl
					label={__('Position', 'voxel-fse')}
					value={attributes.iconPosition?.desktop || 'inline-start'}
					onChange={(value) =>
						setAttributes({
							iconPosition: { ...attributes.iconPosition, desktop: value as any },
						})
					}
					options={ICON_POSITION_OPTIONS}
					controls={<ResponsiveDropdownButton />}
				/>

				{/* Size */}
				<ResponsiveRangeControl
					label={__('Size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="iconSize"
					min={0}
					max={100}
					step={1}
					units={['px', 'em', '%']}
				/>

				{/* Spacing */}
				<ResponsiveRangeControl
					label={__('Spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="iconSpacing"
					min={0}
					max={100}
					step={1}
					units={['px', 'em', '%']}
				/>

				{/* Normal/Hover/Active State Tabs for Icon */}
				<StateTabPanel
					attributeName="iconStateTab"
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
								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.iconNormalColor}
									onChange={(value) => setAttributes({ iconNormalColor: value })}
								/>
							)}

							{tab.name === 'hover' && (
								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.iconHoverColor}
									onChange={(value) => setAttributes({ iconHoverColor: value })}
								/>
							)}

							{tab.name === 'active' && (
								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.iconActiveColor}
									onChange={(value) => setAttributes({ iconActiveColor: value })}
								/>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 4: Content */}
			<AccordionPanel id="content" title={__('Content', 'voxel-fse')}>
				{/* Background Type */}
				<ChooseControl
					label={__('Background Type', 'voxel-fse')}
					value={attributes.contentBgType || ''}
					onChange={(value) => setAttributes({ contentBgType: value as any })}
					options={BACKGROUND_TYPE_OPTIONS}
					variant="inline"
				/>

				{/* Background Color - only show when classic selected */}
				{attributes.contentBgType === 'classic' && (
					<ColorControl
						label={__('Color', 'voxel-fse')}
						value={attributes.contentBg}
						onChange={(value) => setAttributes({ contentBg: value })}
					/>
				)}

				{/* Border Type using BorderGroupControl */}
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.contentBorderType || '',
						borderWidth: attributes.contentBorderWidth || {},
						borderColor: attributes.contentBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<NestedTabsAttributes> = {};
						if (value.borderType !== undefined) {
							updates.contentBorderType = value.borderType as any;
						}
						if (value.borderWidth !== undefined) {
							updates.contentBorderWidth = value.borderWidth as any;
						}
						if (value.borderColor !== undefined) {
							updates.contentBorderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				{/* Border Radius */}
				<DimensionsControl
					label={__('Border Radius', 'voxel-fse')}
					values={attributes.contentBorderRadius?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							contentBorderRadius: { ...attributes.contentBorderRadius, desktop: value },
						})
					}
					availableUnits={['px', '%', 'em']}
					controls={<ResponsiveDropdownButton />}
				/>

				{/* Padding */}
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.contentPadding?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							contentPadding: { ...attributes.contentPadding, desktop: value },
						})
					}
					availableUnits={['px', '%', 'em']}
					controls={<ResponsiveDropdownButton />}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
