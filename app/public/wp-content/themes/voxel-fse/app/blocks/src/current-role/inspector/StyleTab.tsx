/**
 * Current Role Block - Style Tab Inspector Controls
 *
 * Extracted from Voxel current-role widget Style tab.
 * Contains: Panel, Button accordions.
 *
 * Evidence:
 * - Source: themes/voxel/app/widgets/current-role.php:L57-L571
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	BorderGroupControl,
	ResponsiveRangeControl,
	ColorControl,
	BoxShadowPopup,
	SectionHeading,
	DimensionsControl,
	TypographyControl,
	StateTabPanel,
} from '@shared/controls';
import type { CurrentRoleAttributes } from '../types';

interface StyleTabProps {
	attributes: CurrentRoleAttributes;
	setAttributes: (attrs: Partial<CurrentRoleAttributes>) => void;
}

/**
 * Style Tab Component
 *
 * Renders the Style tab with two accordion sections:
 * - Panel (panel styling, head, body, buttons)
 * - Button (button styling with Normal/Hover states)
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
			defaultPanel="panel"
		>
			{/* Panel Accordion */}
			<AccordionPanel id="panel" title={__('Panel', 'voxel-fse')}>
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={attributes.panelBorder || {}}
					onChange={(value) => setAttributes({ panelBorder: value })}
				hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="panelRadius"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.panelBg}
					onChange={(value) => setAttributes({ panelBg: value })}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="panelShadow"
				/>

				<SectionHeading label={__('Panel head', 'voxel-fse')} />

				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.headPadding || {}}
					onChange={(values) => setAttributes({ headPadding: values })}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headIcoSize"
					min={0}
					max={100}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Icon right margin', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headIcoMargin"
					min={0}
					max={100}
					units={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.headIcoCol}
					onChange={(value) => setAttributes({ headIcoCol: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributePrefix="headTypo"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.headTypoCol}
					onChange={(value) => setAttributes({ headTypoCol: value })}
				/>

				<ColorControl
					label={__('Separator color', 'voxel-fse')}
					value={attributes.headBorderCol}
					onChange={(value) => setAttributes({ headBorderCol: value })}
				/>

				<SectionHeading label={__('Panel body', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Body spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="panelSpacing"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<ResponsiveRangeControl
					label={__('Body content gap', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="panelGap"
					min={0}
					max={100}
					units={['px', '%']}
				/>

				<SelectControl
					label={__('Align text', 'voxel-fse')}
					value={attributes.textAlign || 'left'}
					options={[
						{ label: __('Left', 'voxel-fse'), value: 'left' },
						{ label: __('Center', 'voxel-fse'), value: 'center' },
						{ label: __('Right', 'voxel-fse'), value: 'right' },
					]}
					onChange={(value) => setAttributes({ textAlign: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributePrefix="bodyTypo"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.bodyTypoCol}
					onChange={(value) => setAttributes({ bodyTypoCol: value })}
				/>

				<SectionHeading label={__('Panel buttons', 'voxel-fse')} />

				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="panelButtonsGap"
					min={0}
					max={100}
					units={['px']}
				/>
			</AccordionPanel>

			{/* Button Accordion with Normal/Hover States */}
			<AccordionPanel id="button" title={__('Button', 'voxel-fse')}>
				<StateTabPanel
					attributes={attributes}
					setAttributes={setAttributes}
					attributeName="buttonState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<TypographyControl
									label={__('Button typography', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributePrefix="scndBtnTypo"
								/>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnRadius"
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndBtnC}
									onChange={(value) => setAttributes({ scndBtnC: value })}
								/>

								<DimensionsControl
									label={__('Padding', 'voxel-fse')}
									values={attributes.scndBtnPadding || {}}
									onChange={(values) => setAttributes({ scndBtnPadding: values })}
								/>

								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnHeight"
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.scndBtnBg}
									onChange={(value) => setAttributes({ scndBtnBg: value })}
								/>

								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.scndBtnBorder || {}}
									onChange={(value) => setAttributes({ scndBtnBorder: value })}
								hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnIconSize"
									min={0}
									max={100}
									units={['px', '%']}
								/>

								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnIconPad"
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.scndBtnIconColor}
									onChange={(value) => setAttributes({ scndBtnIconColor: value })}
								/>
							</>
						) : (
							<>
								{/* Hover State */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndBtnCH}
									onChange={(value) => setAttributes({ scndBtnCH: value })}
								/>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.scndBtnBgH}
									onChange={(value) => setAttributes({ scndBtnBgH: value })}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.scndBtnBorderH}
									onChange={(value) => setAttributes({ scndBtnBorderH: value })}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.scndBtnIconColorH}
									onChange={(value) => setAttributes({ scndBtnIconColorH: value })}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
