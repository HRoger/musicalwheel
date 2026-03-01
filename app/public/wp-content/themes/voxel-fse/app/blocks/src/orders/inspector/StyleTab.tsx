/**
 * Orders Block - Style Tab Inspector Controls
 *
 * All styling controls for the Orders block, organized into 16 accordion sections.
 * Extracted from edit.tsx for maintainability and following the AccordionPanelGroup pattern.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ColorControl,
	TypographyControl,
	ResponsiveRangeControl,
	DimensionsControl,
	BoxShadowPopup,
	StateTabPanel,
} from '@shared/controls';
import type { OrdersBlockAttributes } from '../types';

interface StyleTabProps {
	attributes: OrdersBlockAttributes;
	setAttributes: (attrs: Partial<OrdersBlockAttributes>) => void;
}

interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	isLinked?: boolean;
}

interface TypographyConfig {
	[key: string]: unknown;
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textTransform?: string;
	lineHeight?: number;
	letterSpacing?: number;
}



export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			defaultPanel="general"
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
		>
			{/* 1. General */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<TypographyControl
					label={__('Title typography', 'voxel-fse')}
					value={attributes.generalTitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ generalTitleTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.generalTitleColor}
					onChange={(value: string | undefined) => setAttributes({ generalTitleColor: value })}
				/>

				<TypographyControl
					label={__('Title typography', 'voxel-fse')}
					value={attributes.generalSubtitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ generalSubtitleTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.generalSubtitleColor}
					onChange={(value: string | undefined) => setAttributes({ generalSubtitleColor: value })}
				/>

				<ResponsiveRangeControl
					label={__('Spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="generalSpacing"
					min={0}
					max={100}
					units={['px']}
				/>
			</AccordionPanel>


		{/* 2. Primary button */}
		<AccordionPanel id="primary-button" title={__('Primary button', 'voxel-fse')}>
			<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="primaryBtnState"
				tabs={[
					{ name: 'normal', title: __('Normal', 'voxel-fse') },
					{ name: 'hover', title: __('Hover', 'voxel-fse') },
				]}
			>
				{(tab) =>
					tab.name === 'normal' ? (
						<>
							<TypographyControl
								label={__('Typography', 'voxel-fse')}
								value={attributes.primaryBtnTypography as TypographyConfig}
								onChange={(value: any) => setAttributes({ primaryBtnTypography: value })}
							/>

							<SelectControl
								label={__('Border type', 'voxel-fse')}
								value={attributes.primaryBtnBorderType}
								options={[
									{ label: __('Default', 'voxel-fse'), value: 'Default' },
									{ label: __('None', 'voxel-fse'), value: 'None' },
									{ label: __('Solid', 'voxel-fse'), value: 'Solid' },
									{ label: __('Double', 'voxel-fse'), value: 'Double' },
									{ label: __('Dotted', 'voxel-fse'), value: 'Dotted' },
									{ label: __('Dashed', 'voxel-fse'), value: 'Dashed' },
									{ label: __('Groove', 'voxel-fse'), value: 'Groove' },
								]}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnBorderType: value })}
							/>

							<ResponsiveRangeControl
								label={__('Border radius', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								attributeBaseName="primaryBtnBorderRadius"
								min={0}
								max={100}
								units={['px']}
							/>

							<BoxShadowPopup
								label={__("Box Shadow", "voxel-fse")}
								shadowAttributeName="primaryBtnBoxShadow"
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
							/>

							<ColorControl
								label={__('Text color', 'voxel-fse')}
								value={attributes.primaryBtnTextColor}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnTextColor: value })}
							/>

							<ColorControl
								label={__('Background color', 'voxel-fse')}
								value={attributes.primaryBtnBackground}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnBackground: value })}
							/>

							<ResponsiveRangeControl
								label={__('Icon size', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								attributeBaseName="primaryBtnIconSize"
								min={0}
								max={50}
								units={['px']}
							/>

							<ColorControl
								label={__('Icon color', 'voxel-fse')}
								value={attributes.primaryBtnIconColor}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnIconColor: value })}
							/>

							<ResponsiveRangeControl
								label={__('Icon/Text spacing', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								attributeBaseName="primaryBtnIconSpacing"
								min={0}
								max={50}
								units={['px']}
							/>
						</>
					) : (
						<>
							<ColorControl
								label={__('Text color', 'voxel-fse')}
								value={attributes.primaryBtnTextColorHover}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnTextColorHover: value })}
							/>

							<ColorControl
								label={__('Background color', 'voxel-fse')}
								value={attributes.primaryBtnBackgroundHover}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnBackgroundHover: value })}
							/>

							<ColorControl
								label={__('Border color', 'voxel-fse')}
								value={attributes.primaryBtnBorderColorHover}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnBorderColorHover: value })}
							/>

							<BoxShadowPopup
								label={__("Box Shadow", "voxel-fse")}
								shadowAttributeName="primaryBtnBoxShadowHover"
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
							/>

							<ColorControl
								label={__('Icon color', 'voxel-fse')}
								value={attributes.primaryBtnIconColorHover}
								onChange={(value: string | undefined) => setAttributes({ primaryBtnIconColorHover: value })}
							/>
						</>
					)
				}
			</StateTabPanel>
		</AccordionPanel>

			{/* 3. Secondary button */}
			<AccordionPanel id="secondary-button" title={__('Secondary button', 'voxel-fse')}>
				<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="secondaryBtnState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.secondaryBtnIconColor}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="secondaryBtnIconSize"
									min={0}
									max={50}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="secondaryBtnIconSpacing"
									min={0}
									max={50}
									units={['px']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.secondaryBtnBackground}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnBackground: value })}
								/>

								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.secondaryBtnBorderType || 'Default'}
									options={[
										{ label: __('Default', 'voxel-fse'), value: 'Default' },
										{ label: __('None', 'voxel-fse'), value: 'none' },
										{ label: __('Solid', 'voxel-fse'), value: 'solid' },
										{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
										{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
										{ label: __('Double', 'voxel-fse'), value: 'double' },
									]}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnBorderType: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="secondaryBtnBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.secondaryBtnTypography as TypographyConfig}
									onChange={(value: any) => setAttributes({ secondaryBtnTypography: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.secondaryBtnTextColor}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnTextColor: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.secondaryBtnIconColorHover}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnIconColorHover: value })}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.secondaryBtnBackgroundHover}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnBackgroundHover: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.secondaryBtnBorderColorHover}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnBorderColorHover: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.secondaryBtnTextColorHover}
									onChange={(value: string | undefined) => setAttributes({ secondaryBtnTextColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 4. Cards */}
			<AccordionPanel id="cards" title={__('Cards', 'voxel-fse')}>
				<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="cardState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.cardBackground}
									onChange={(value: string | undefined) => setAttributes({ cardBackground: value })}
								/>

								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.cardBorderType || 'Default'}
									options={[
										{ label: __('Default', 'voxel-fse'), value: 'Default' },
										{ label: __('None', 'voxel-fse'), value: 'none' },
										{ label: __('Solid', 'voxel-fse'), value: 'solid' },
										{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
										{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
										{ label: __('Double', 'voxel-fse'), value: 'double' },
									]}
									onChange={(value: string | undefined) => setAttributes({ cardBorderType: value })}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="cardBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>

								{/* Avatar */}
								<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Avatar', 'voxel-fse')}
									</p>
								</div>

								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="cardAvatarSize"
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="cardAvatarBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>

								{/* Order ID */}
								<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Order ID', 'voxel-fse')}
									</p>
								</div>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.cardOrderIdTypography as TypographyConfig}
									onChange={(value: any) => setAttributes({ cardOrderIdTypography: value })}
								/>

								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.cardOrderIdColor}
									onChange={(value: string | undefined) => setAttributes({ cardOrderIdColor: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.cardOrderIdBackground}
									onChange={(value: string | undefined) => setAttributes({ cardOrderIdBackground: value })}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="cardOrderIdBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>

								{/* Order title */}
								<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Order title', 'voxel-fse')}
									</p>
								</div>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.cardOrderTitleTypography as TypographyConfig}
									onChange={(value: any) => setAttributes({ cardOrderTitleTypography: value })}
								/>

								<TypographyControl
									label={__('Typography (Pending)', 'voxel-fse')}
									value={attributes.cardOrderTitleTypographyPending as TypographyConfig}
									onChange={(value: any) => setAttributes({ cardOrderTitleTypographyPending: value })}
								/>

								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.cardOrderTitleColor}
									onChange={(value: string | undefined) => setAttributes({ cardOrderTitleColor: value })}
								/>

								{/* Order details */}
								<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Order details', 'voxel-fse')}
									</p>
								</div>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.cardOrderDetailsTypography as TypographyConfig}
									onChange={(value: any) => setAttributes({ cardOrderDetailsTypography: value })}
								/>

								<ColorControl
									label={__('Color', 'voxel-fse')}
									value={attributes.cardOrderDetailsColor}
									onChange={(value: string | undefined) => setAttributes({ cardOrderDetailsColor: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Card background', 'voxel-fse')}
									value={attributes.cardBackgroundHover}
									onChange={(value: string | undefined) => setAttributes({ cardBackgroundHover: value })}
								/>

								<ColorControl
									label={__('Card border color', 'voxel-fse')}
									value={attributes.cardBorderColorHover}
									onChange={(value: string | undefined) => setAttributes({ cardBorderColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 5. Order statuses */}
			<AccordionPanel id="order-statuses" title={__('Order statuses', 'voxel-fse')}>
				<div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('General', 'voxel-fse')}
					</p>
				</div>

				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.statusPadding as DimensionsConfig || {}}
					onChange={(values) => setAttributes({ statusPadding: values })}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="statusBorderRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.statusTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ statusTypography: value })}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Colors', 'voxel-fse')}
					</p>
				</div>

				<ColorControl
					label={__('Orange', 'voxel-fse')}
					value={attributes.statusOrangeColor}
					onChange={(value: string | undefined) => setAttributes({ statusOrangeColor: value })}
				/>

				<ColorControl
					label={__('Green', 'voxel-fse')}
					value={attributes.statusGreenColor}
					onChange={(value: string | undefined) => setAttributes({ statusGreenColor: value })}
				/>

				<ColorControl
					label={__('Neutral', 'voxel-fse')}
					value={attributes.statusNeutralColor}
					onChange={(value: string | undefined) => setAttributes({ statusNeutralColor: value })}
				/>

				<ColorControl
					label={__('Red', 'voxel-fse')}
					value={attributes.statusRedColor}
					onChange={(value: string | undefined) => setAttributes({ statusRedColor: value })}
				/>

				<ColorControl
					label={__('Grey', 'voxel-fse')}
					value={attributes.statusGreyColor}
					onChange={(value: string | undefined) => setAttributes({ statusGreyColor: value })}
				/>

				<ColorControl
					label={__('Blue', 'voxel-fse')}
					value={attributes.statusBlueColor}
					onChange={(value: string | undefined) => setAttributes({ statusBlueColor: value })}
				/>
			</AccordionPanel>

			{/* 6. Filters: Common styles */}
			<AccordionPanel id="filters-common" title={__('Filters: Common styles', 'voxel-fse')}>
				<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="filterCommonState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Filters', 'voxel-fse')}
									</p>
								</div>

								<ResponsiveRangeControl
									label={__('Filter height', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="filterHeight"
									min={0}
									max={100}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="filterBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>

								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									shadowAttributeName="filterBoxShadow"
								/>

								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.filterBorderType || 'Default'}
									options={[
										{ label: __('Default', 'voxel-fse'), value: 'Default' },
										{ label: __('None', 'voxel-fse'), value: 'none' },
										{ label: __('Solid', 'voxel-fse'), value: 'solid' },
										{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
										{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
										{ label: __('Double', 'voxel-fse'), value: 'double' },
									]}
									onChange={(value: string | undefined) => setAttributes({ filterBorderType: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.filterBackground}
									onChange={(value: string | undefined) => setAttributes({ filterBackground: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.filterTextColor}
									onChange={(value: string | undefined) => setAttributes({ filterTextColor: value })}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.filterTypography as TypographyConfig}
									onChange={(value: any) => setAttributes({ filterTypography: value })}
								/>

								<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
									<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
										{__('Chevron', 'voxel-fse')}
									</p>
								</div>

								<ColorControl
									label={__('Chevron color', 'voxel-fse')}
									value={attributes.filterChevronColor}
									onChange={(value: string | undefined) => setAttributes({ filterChevronColor: value })}
								/>
							</>
						) : (
							<>
								<BoxShadowPopup
									label={__('Box Shadow', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									shadowAttributeName="filterBoxShadowHover"
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.filterBorderColorHover}
									onChange={(value: string | undefined) => setAttributes({ filterBorderColorHover: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.filterBackgroundHover}
									onChange={(value: string | undefined) => setAttributes({ filterBackgroundHover: value })}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.filterTextColorHover}
									onChange={(value: string | undefined) => setAttributes({ filterTextColorHover: value })}
								/>

								<ColorControl
									label={__('Chevron color', 'voxel-fse')}
									value={attributes.filterChevronColorHover}
									onChange={(value: string | undefined) => setAttributes({ filterChevronColorHover: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 7. Filter: Dropdown */}
			<AccordionPanel id="filter-dropdown" title={__('Filter: Dropdown', 'voxel-fse')}>
				<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="filterDropdownState"
					tabs={[{ name: 'filled', title: __('Filled', 'voxel-fse') }]}
				>
					{() => (
						<>
							<TypographyControl
								label={__('Typography', 'voxel-fse')}
								value={attributes.filterDropdownTypography as TypographyConfig}
								onChange={(value: any) => setAttributes({ filterDropdownTypography: value })}
							/>

							<ColorControl
								label={__('Background', 'voxel-fse')}
								value={attributes.filterDropdownBackground}
								onChange={(value: string | undefined) => setAttributes({ filterDropdownBackground: value })}
							/>

							<ColorControl
								label={__('Text color', 'voxel-fse')}
								value={attributes.filterDropdownTextColor}
								onChange={(value: string | undefined) => setAttributes({ filterDropdownTextColor: value })}
							/>

							<ColorControl
								label={__('Border color', 'voxel-fse')}
								value={attributes.filterDropdownBorderColor}
								onChange={(value: string | undefined) => setAttributes({ filterDropdownBorderColor: value })}
							/>

							<ResponsiveRangeControl
								label={__('Border width', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								attributeBaseName="filterDropdownBorderWidth"
								min={0}
								max={10}
								units={['px']}
							/>

							<BoxShadowPopup
								label={__('Box Shadow', 'voxel-fse')}
								attributes={attributes as Record<string, any>}
								setAttributes={setAttributes as (attrs: Record<string, any>) => void}
								shadowAttributeName="filterDropdownBoxShadow"
							/>

							<ColorControl
								label={__('Chevron color', 'voxel-fse')}
								value={attributes.filterDropdownChevronColor}
								onChange={(value: string | undefined) => setAttributes({ filterDropdownChevronColor: value })}
							/>
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* 8. Filter: Input */}
			<AccordionPanel id="filter-input" title={__('Filter: Input', 'voxel-fse')}>
				<StateTabPanel
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				attributeName="filterInputState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'focus', title: __('Focus', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ColorControl
									label={__('Input placeholder color', 'voxel-fse')}
									value={attributes.filterInputPlaceholderColor}
									onChange={(value: string | undefined) => setAttributes({ filterInputPlaceholderColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Component icon', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="filterInputIconSize"
									min={0}
									max={50}
									units={['px']}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.filterInputIconColor}
									onChange={(value: string | undefined) => setAttributes({ filterInputIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Icon side margin', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="filterInputIconMargin"
									min={0}
									max={50}
									units={['px']}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.filterInputBackgroundFocus}
									onChange={(value: string | undefined) => setAttributes({ filterInputBackgroundFocus: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.filterInputBorderColorFocus}
									onChange={(value: string | undefined) => setAttributes({ filterInputBorderColorFocus: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 9. Single: Order event */}
			<AccordionPanel id="single-order-event" title={__('Single: Order event', 'voxel-fse')}>
				<div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Avatar', 'voxel-fse')}
					</p>
				</div>

				<ResponsiveRangeControl
					label={__('Size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleEventAvatarSize"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleEventAvatarBorderRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Order title', 'voxel-fse')}
					</p>
				</div>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleEventOrderTitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleEventOrderTitleTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleEventOrderTitleColor}
					onChange={(value: string | undefined) => setAttributes({ singleEventOrderTitleColor: value })}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Event title', 'voxel-fse')}
					</p>
				</div>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleEventTitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleEventTitleTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleEventTitleColor}
					onChange={(value: string | undefined) => setAttributes({ singleEventTitleColor: value })}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Event details', 'voxel-fse')}
					</p>
				</div>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleEventDetailsTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleEventDetailsTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleEventDetailsColor}
					onChange={(value: string | undefined) => setAttributes({ singleEventDetailsColor: value })}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Divider', 'voxel-fse')}
					</p>
				</div>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.singleEventDividerColor}
					onChange={(value: string | undefined) => setAttributes({ singleEventDividerColor: value })}
				/>

				<div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
					<p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
						{__('Files', 'voxel-fse')}
					</p>
				</div>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleEventFilesTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleEventFilesTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleEventFilesColor}
					onChange={(value: string | undefined) => setAttributes({ singleEventFilesColor: value })}
				/>
			</AccordionPanel>

			{/* 10. Single: Event Box */}
			<AccordionPanel id="single-event-box" title={__('Single: Event Box', 'voxel-fse')}>
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.singleEventBoxPadding as DimensionsConfig || {}}
					onChange={(values) => setAttributes({ singleEventBoxPadding: values })}
				/>

				<SelectControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.singleEventBoxBorderType || 'Default'}
					options={[
						{ label: __('Default', 'voxel-fse'), value: 'Default' },
						{ label: __('None', 'voxel-fse'), value: 'none' },
						{ label: __('Solid', 'voxel-fse'), value: 'solid' },
						{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
						{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
						{ label: __('Double', 'voxel-fse'), value: 'double' },
					]}
					onChange={(value: string | undefined) => setAttributes({ singleEventBoxBorderType: value })}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleEventBoxBorderRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.singleEventBoxBackground}
					onChange={(value: string | undefined) => setAttributes({ singleEventBoxBackground: value })}
				/>
			</AccordionPanel>

			{/* 11. Single: Order items */}
			<AccordionPanel id="single-order-items" title={__('Single: Order items', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Item spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleItemSpacing"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Item content spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleItemContentSpacing"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Picture size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleItemPictureSize"
					min={0}
					max={200}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Picture radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleItemPictureRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				<TypographyControl
					label={__('Title typography', 'voxel-fse')}
					value={attributes.singleItemTitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleItemTitleTypography: value })}
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.singleItemTitleColor}
					onChange={(value: string | undefined) => setAttributes({ singleItemTitleColor: value })}
				/>

				<TypographyControl
					label={__('Subtitle typography', 'voxel-fse')}
					value={attributes.singleItemSubtitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleItemSubtitleTypography: value })}
				/>

				<ColorControl
					label={__('Subtitle color', 'voxel-fse')}
					value={attributes.singleItemSubtitleColor}
					onChange={(value: string | undefined) => setAttributes({ singleItemSubtitleColor: value })}
				/>
			</AccordionPanel>

			{/* 12. Single: Table */}
			<AccordionPanel id="single-table" title={__('Single: Table', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('List spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="singleTableListSpacing"
					min={0}
					max={100}
					units={['px']}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleTableTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleTableTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleTableTextColor}
					onChange={(value: string | undefined) => setAttributes({ singleTableTextColor: value })}
				/>

				<TypographyControl
					label={__('Typography (Total)', 'voxel-fse')}
					value={attributes.singleTableTypographyTotal as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleTableTypographyTotal: value })}
				/>

				<ColorControl
					label={__('Text color (Total)', 'voxel-fse')}
					value={attributes.singleTableTextColorTotal}
					onChange={(value: string | undefined) => setAttributes({ singleTableTextColorTotal: value })}
				/>
			</AccordionPanel>

			{/* 13. Single: Accordion title */}
			<AccordionPanel id="single-accordion-title" title={__('Single: Accordion title', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleAccordionTitleTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleAccordionTitleTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleAccordionTitleColor}
					onChange={(value: string | undefined) => setAttributes({ singleAccordionTitleColor: value })}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.singleAccordionIconColor}
					onChange={(value: string | undefined) => setAttributes({ singleAccordionIconColor: value })}
				/>

				<ColorControl
					label={__('Divider color', 'voxel-fse')}
					value={attributes.singleAccordionDividerColor}
					onChange={(value: string | undefined) => setAttributes({ singleAccordionDividerColor: value })}
				/>
			</AccordionPanel>

			{/* 14. Single: Notes */}
			<AccordionPanel id="single-notes" title={__('Single: Notes', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.singleNotesTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ singleNotesTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.singleNotesTextColor}
					onChange={(value: string | undefined) => setAttributes({ singleNotesTextColor: value })}
				/>

				<ColorControl
					label={__('Link color', 'voxel-fse')}
					value={attributes.singleNotesLinkColor}
					onChange={(value: string | undefined) => setAttributes({ singleNotesLinkColor: value })}
				/>
			</AccordionPanel>

			{/* 15. No results */}
			<AccordionPanel id="no-results" title={__('No results', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="noResultsContentGap"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="noResultsIconSize"
					min={0}
					max={100}
					units={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.noResultsIconColor}
					onChange={(value: string | undefined) => setAttributes({ noResultsIconColor: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={attributes.noResultsTypography as TypographyConfig}
					onChange={(value: any) => setAttributes({ noResultsTypography: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.noResultsTextColor}
					onChange={(value: string | undefined) => setAttributes({ noResultsTextColor: value })}
				/>

				<ColorControl
					label={__('Link color', 'voxel-fse')}
					value={attributes.noResultsLinkColor}
					onChange={(value: string | undefined) => setAttributes({ noResultsLinkColor: value })}
				/>
			</AccordionPanel>

			{/* 16. Loading spinner */}
			<AccordionPanel id="loading-spinner" title={__('Loading spinner', 'voxel-fse')}>
				<ColorControl
					label={__('Color 1', 'voxel-fse')}
					value={attributes.loadingSpinnerColor1}
					onChange={(value: string | undefined) => setAttributes({ loadingSpinnerColor1: value })}
				/>

				<ColorControl
					label={__('Color 2', 'voxel-fse')}
					value={attributes.loadingSpinnerColor2}
					onChange={(value: string | undefined) => setAttributes({ loadingSpinnerColor2: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
