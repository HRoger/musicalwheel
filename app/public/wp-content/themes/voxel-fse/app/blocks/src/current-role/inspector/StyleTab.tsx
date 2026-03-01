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
	ResponsiveColorControl,
	BoxShadowPopup,
	SectionHeading,
	ResponsiveDimensionsControl,
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
					value={(attributes.panelBorder as any) || {}}
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

				<ResponsiveColorControl
					label={__('Background', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="panelBg"
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="panelShadow"
				/>

				<SectionHeading label={__('Panel head', 'voxel-fse')} />

				<ResponsiveDimensionsControl
					label={__('Padding', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headPadding"
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

				<ResponsiveColorControl
					label={__('Icon color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headIcoCol"
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="headTypo"
				/>

				<ResponsiveColorControl
					label={__('Text color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headTypoCol"
				/>

				<ResponsiveColorControl
					label={__('Separator color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="headBorderCol"
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
					onChange={(value: any) => setAttributes({ textAlign: value })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="bodyTypo"
				/>

				<ResponsiveColorControl
					label={__('Text color', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="bodyTypoCol"
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
									typographyAttributeName="scndBtnTypo"
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

								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnC"
								/>

								<ResponsiveDimensionsControl
									label={__('Padding', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnPadding"
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

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnBg"
								/>

								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={(attributes.scndBtnBorder as any) || {}}
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

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnIconColor"
								/>
							</>
						) : (
							<>
								{/* Hover State */}
								<ResponsiveColorControl
									label={__('Text color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnCH"
								/>

								<ResponsiveColorControl
									label={__('Background color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnBgH"
								/>

								<ResponsiveColorControl
									label={__('Border color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnBorderH"
								/>

								<ResponsiveColorControl
									label={__('Icon color', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="scndBtnIconColorH"
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
