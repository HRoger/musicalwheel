/**
 * Nested Accordion Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Matches Elementor's nested-accordion widget Style tab exactly.
 *
 * Accordions:
 * - Accordion: Space between items, Distance from content, Background Type, Border, Border Radius, Padding (with Normal/Hover/Active states)
 * - Header: Title (Typography, Color, Text Shadow, Text Stroke), Icon (Size, Spacing, Color) - all with states
 * - Content: Background Type, Border, Border Radius, Padding
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ResponsiveRangeControl,
	StateTabPanel,
	ColorControl,
	BorderGroupControl,
	DimensionsControl,
	TypographyControl,
	SectionHeading,
	ChooseControl,
	TextShadowPopup,
	TextStrokePopup,
} from '@shared/controls';
import type { NestedAccordionAttributes } from '../types';

interface StyleTabProps {
	attributes: NestedAccordionAttributes;
	setAttributes: (attrs: Partial<NestedAccordionAttributes>) => void;
	clientId: string;
}

export function StyleTab({ attributes, setAttributes }: StyleTabProps) {
	// Helper to capitalize first letter for state attribute names
	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="accordion-style"
		>
			{/* ========== ACCORDION SECTION ========== */}
			<AccordionPanel id="accordion-style" title={__('Accordion', 'voxel-fse')}>
				{/* Space between Items */}
				<ResponsiveRangeControl
					label={__('Space between Items', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="itemSpacing"
					min={0}
					max={200}
					units={['px', 'em', 'rem']}
				/>

				{/* Distance from Content */}
				<ResponsiveRangeControl
					label={__('Distance from content', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="contentDistance"
					min={0}
					max={200}
					units={['px', 'em', 'rem']}
				/>

				{/* Normal/Hover/Active State Tabs */}
				<StateTabPanel
					attributeName="accordionState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
					]}
				>
					{(tab) => {
						const stateName = capitalize(tab.name);
						const bgTypeAttr = `accordion${stateName}BgType` as keyof NestedAccordionAttributes;
						const bgAttr = `accordion${stateName}Bg` as keyof NestedAccordionAttributes;
						const borderTypeAttr = `accordion${stateName}BorderType` as keyof NestedAccordionAttributes;
						const borderWidthAttr = `accordion${stateName}BorderWidth` as keyof NestedAccordionAttributes;
						const borderColorAttr = `accordion${stateName}BorderColor` as keyof NestedAccordionAttributes;

						return (
							<>
								{/* Background Type (Classic/Gradient) */}
								<ChooseControl
									label={__('Background Type', 'voxel-fse')}
									value={(attributes as Record<string, any>)[bgTypeAttr] || 'classic'}
									onChange={(value) =>
										setAttributes({
											[bgTypeAttr]: value,
										} as Partial<NestedAccordionAttributes>)
									}
									options={[
										{
											value: 'classic',
											icon: 'eicon-paint-brush',
											title: __('Classic', 'voxel-fse'),
										},
										{
											value: 'gradient',
											icon: 'eicon-barcode',
											title: __('Gradient', 'voxel-fse'),
										},
									]}
									variant="inline"
								/>

								{/* Background Color (only for classic mode) */}
								{((attributes as Record<string, any>)[bgTypeAttr] === 'classic' ||
									!(attributes as Record<string, any>)[bgTypeAttr]) && (
									<ColorControl
										label={__('Color', 'voxel-fse')}
										value={(attributes as Record<string, any>)[bgAttr] || ''}
										onChange={(value) =>
											setAttributes({
												[bgAttr]: value || '',
											} as Partial<NestedAccordionAttributes>)
										}
									/>
								)}

								{/* Border */}
								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={{
										borderType: (attributes as Record<string, any>)[borderTypeAttr] || '',
										borderWidth: (attributes as Record<string, any>)[borderWidthAttr] || {},
										borderColor: (attributes as Record<string, any>)[borderColorAttr] || '',
									}}
									onChange={(value) => {
										const updates: Record<string, any> = {};
										if (value.borderType !== undefined) {
											updates[borderTypeAttr] = value.borderType;
										}
										if (value.borderWidth !== undefined) {
											updates[borderWidthAttr] = value.borderWidth;
										}
										if (value.borderColor !== undefined) {
											updates[borderColorAttr] = value.borderColor;
										}
										setAttributes(updates as Partial<NestedAccordionAttributes>);
									}}
									hideRadius={true}
								/>
							</>
						);
					}}
				</StateTabPanel>

				{/* Border Radius (outside state tabs) */}
				<DimensionsControl
					label={__('Border Radius', 'voxel-fse')}
					values={attributes.accordionBorderRadius?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							accordionBorderRadius: {
								...attributes.accordionBorderRadius,
								desktop: value,
							},
						})
					}
				/>

				{/* Padding */}
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.accordionPadding?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							accordionPadding: {
								...attributes.accordionPadding,
								desktop: value,
							},
						})
					}
				/>
			</AccordionPanel>

			{/* ========== HEADER SECTION ========== */}
			<AccordionPanel id="header-style" title={__('Header', 'voxel-fse')}>
				{/* Title Sub-section */}
				<SectionHeading label={__('Title', 'voxel-fse')} />

				{/* Title Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.titleTypography}
					onChange={(value) => setAttributes({ titleTypography: value })}
				/>

				{/* Title Color States */}
				<StateTabPanel
					attributeName="titleColorState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
					]}
				>
					{(tab) => {
						const stateName = capitalize(tab.name);
						const colorAttr = `title${stateName}Color` as keyof NestedAccordionAttributes;
						const textShadowAttr = `title${stateName}TextShadow`;
						const textStrokeAttr = `title${stateName}TextStroke`;

						return (
							<>
								{/* Color */}
								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={(attributes as Record<string, any>)[colorAttr] || ''}
									onChange={(value) =>
										setAttributes({
											[colorAttr]: value || '',
										} as Partial<NestedAccordionAttributes>)
									}
								/>

								{/* Text Shadow */}
								<TextShadowPopup
									label={__('Text Shadow', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									shadowAttributeName={textShadowAttr}
								/>

								{/* Text Stroke */}
								<TextStrokePopup
									label={__('Text Stroke', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									strokeAttributeName={textStrokeAttr}
								/>
							</>
						);
					}}
				</StateTabPanel>

				{/* Icon Sub-section */}
				<SectionHeading label={__('Icon', 'voxel-fse')} />

				{/* Icon Size */}
				<ResponsiveRangeControl
					label={__('Size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="iconSize"
					min={0}
					max={100}
					units={['px', '%', 'em', 'rem', 'vw']}
				/>

				{/* Icon Spacing */}
				<ResponsiveRangeControl
					label={__('Spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="iconSpacing"
					min={0}
					max={100}
					units={['px', '%', 'em', 'rem', 'vw']}
				/>

				{/* Icon Color States */}
				<StateTabPanel
					attributeName="iconColorState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
					]}
				>
					{(tab) => {
						const stateName = capitalize(tab.name);
						const colorAttr = `icon${stateName}Color` as keyof NestedAccordionAttributes;

						return (
							<ColorControl
								label={__('Color', 'voxel-fse')}
								value={(attributes as Record<string, any>)[colorAttr] || ''}
								onChange={(value) =>
									setAttributes({
										[colorAttr]: value || '',
									} as Partial<NestedAccordionAttributes>)
								}
							/>
						);
					}}
				</StateTabPanel>
			</AccordionPanel>

			{/* ========== CONTENT SECTION ========== */}
			<AccordionPanel id="content-style" title={__('Content', 'voxel-fse')}>
				{/* Background Type (Classic/Gradient) */}
				<ChooseControl
					label={__('Background Type', 'voxel-fse')}
					value={(attributes as Record<string, any>)['contentBgType'] || 'classic'}
					onChange={(value) => setAttributes({ contentBgType: value } as any)}
					options={[
						{
							value: 'classic',
							icon: 'eicon-paint-brush',
							title: __('Classic', 'voxel-fse'),
						},
						{
							value: 'gradient',
							icon: 'eicon-barcode',
							title: __('Gradient', 'voxel-fse'),
						},
					]}
					variant="inline"
				/>

				{/* Background Color (only for classic mode) */}
				{((attributes as Record<string, any>)['contentBgType'] === 'classic' ||
					!(attributes as Record<string, any>)['contentBgType']) && (
					<ColorControl
						label={__('Color', 'voxel-fse')}
						value={attributes.contentBg || ''}
						onChange={(value) => setAttributes({ contentBg: value || '' })}
					/>
				)}

				{/* Border */}
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.contentBorderType || '',
						borderWidth: attributes.contentBorderWidth || {},
						borderColor: attributes.contentBorderColor || '',
					}}
					onChange={(value) => {
						const updates: Record<string, any> = {};
						if (value.borderType !== undefined) {
							updates['contentBorderType'] = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates['contentBorderWidth'] = value.borderWidth;
						}
						if (value.borderColor !== undefined) {
							updates['contentBorderColor'] = value.borderColor;
						}
						setAttributes(updates as Partial<NestedAccordionAttributes>);
					}}
					hideRadius={true}
				/>

				{/* Border Radius */}
				<DimensionsControl
					label={__('Border Radius', 'voxel-fse')}
					values={attributes.contentBorderRadius?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							contentBorderRadius: {
								...attributes.contentBorderRadius,
								desktop: value,
							},
						})
					}
				/>

				{/* Padding */}
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.contentPadding?.desktop || {}}
					onChange={(value) =>
						setAttributes({
							contentPadding: {
								...attributes.contentPadding,
								desktop: value,
							},
						})
					}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
