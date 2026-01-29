/**
 * Current Plan Block - Style Tab Inspector Controls
 *
 * Contains styling controls for the Current Plan block.
 * Matches Voxel's current-plan widget Style tab structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:L105-L774
 * - Sections: panel_options (Panel), scnd_btn (Secondary button)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	ResponsiveRangeControl,
	BorderGroupControl,
	ColorControl,
	BoxShadowPopup,
	DimensionsControl,
	TypographyControl,
	SectionHeading,
	StateTabPanel,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';
import type { CurrentPlanAttributes } from '../types';

interface StyleTabProps {
	attributes: CurrentPlanAttributes;
	setAttributes: (attrs: Partial<CurrentPlanAttributes>) => void;
}

/**
 * Style Tab Component
 *
 * Renders the Style tab with two accordion sections:
 * - Panel (panel styling, headings, pricing, body, buttons)
 * - Secondary button (Normal/Hover states)
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
			{/* Panel Accordion - matches Voxel's panel_options section (L105-L520) */}
			<AccordionPanel id="panel" title={__('Panel', 'voxel-fse')}>
				{/* Panel gap - L113-L130 */}
				<ResponsiveRangeControl
					label={__('Panel gap', 'voxel-fse')}
					attributeBaseName="panelsSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
				/>

				{/* Border - L132-L139 */}
				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={attributes.panelBorder || {}}
					onChange={(value) => setAttributes({ panelBorder: value })}
					hideRadius={true}
				/>

				{/* Border radius - L142-L163 */}
				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributeBaseName="panelRadius"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				{/* Background - L165-L175 */}
				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.panelBg}
					onChange={(value) => setAttributes({ panelBg: value })}
				/>

				{/* Box Shadow - L177-L184 */}
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="panelShadow"
				/>

				{/* Panel head section - L186-L295 */}
				<SectionHeading label={__('Panel head', 'voxel-fse')} />

				{/* Padding - L195-L205 */}
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.headPadding || {}}
					onChange={(values) => setAttributes({ headPadding: values })}
				/>

				{/* Icon size - L207-L229 */}
				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributeBaseName="headIcoSize"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
				/>

				{/* Icon right margin - L231-L249 */}
				<ResponsiveRangeControl
					label={__('Icon right margin', 'voxel-fse')}
					attributeBaseName="headIcoMargin"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
				/>

				{/* Icon color - L251-L262 */}
				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.headIcoCol}
					onChange={(value) => setAttributes({ headIcoCol: value })}
				/>

				{/* Typography - L264-L271 */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="headTypo"
				/>

				{/* Text color - L273-L283 */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.headTypoCol}
					onChange={(value) => setAttributes({ headTypoCol: value })}
				/>

				{/* Separator color - L285-L295 */}
				<ColorControl
					label={__('Separator color', 'voxel-fse')}
					value={attributes.headBorderCol}
					onChange={(value) => setAttributes({ headBorderCol: value })}
				/>

				{/* Panel Pricing section - L297-L365 */}
				<SectionHeading label={__('Panel Pricing', 'voxel-fse')} />

				{/* Align content - L306-L322 */}
				<SelectControl
					label={__('Align content', 'voxel-fse')}
					value={attributes.priceAlign || 'left'}
					options={[
						{ label: __('Left', 'voxel-fse'), value: 'left' },
						{ label: __('Center', 'voxel-fse'), value: 'center' },
						{ label: __('Right', 'voxel-fse'), value: 'flex-end' },
					]}
					onChange={(value) => setAttributes({ priceAlign: value })}
				/>

				{/* Price typography - L324-L331 */}
				<TypographyControl
					label={__('Price typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="priceTypo"
				/>

				{/* Price text color - L333-L343 */}
				<ColorControl
					label={__('Price text color', 'voxel-fse')}
					value={attributes.priceCol}
					onChange={(value) => setAttributes({ priceCol: value })}
				/>

				{/* Period typography - L345-L352 */}
				<TypographyControl
					label={__('Period typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="periodTypo"
				/>

				{/* Text color (Period) - L354-L364 */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.periodCol}
					onChange={(value) => setAttributes({ periodCol: value })}
				/>

				{/* Panel body section - L368-L484 */}
				<SectionHeading label={__('Panel body', 'voxel-fse')} />

				{/* Body spacing - L379-L400 */}
				<ResponsiveRangeControl
					label={__('Body spacing', 'voxel-fse')}
					attributeBaseName="panelSpacing"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				{/* Body content gap - L402-L423 */}
				<ResponsiveRangeControl
					label={__('Body content gap', 'voxel-fse')}
					attributeBaseName="panelGap"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				{/* Align text - L426-L442 */}
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

				{/* Typography - L444-L451 */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="bodyTypo"
				/>

				{/* Text color - L453-L463 */}
				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.bodyTypoCol}
					onChange={(value) => setAttributes({ bodyTypoCol: value })}
				/>

				{/* Link typography - L465-L472 */}
				<TypographyControl
					label={__('Link typography', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					typographyAttributeName="bodyTypoLink"
				/>

				{/* Link color - L474-L484 */}
				<ColorControl
					label={__('Link color', 'voxel-fse')}
					value={attributes.bodyColLink}
					onChange={(value) => setAttributes({ bodyColLink: value })}
				/>

				{/* Panel buttons section - L488-L518 */}
				<SectionHeading label={__('Panel buttons', 'voxel-fse')} />

				{/* Item gap - L499-L518 */}
				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributeBaseName="panelButtonsGap"
					attributes={attributes}
					setAttributes={setAttributes}
					min={0}
					max={100}
					step={1}
				/>
			</AccordionPanel>

			{/* Secondary button Accordion - matches Voxel's scnd_btn section (L523-L774) */}
			<AccordionPanel id="secondary-button" title={__('Secondary button', 'voxel-fse')}>
				{/* State Tabs: Normal / Hover - L531-L772 */}
				<StateTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeName="secondaryButtonState"
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{/* Normal State Controls - L537-L707 */}

								{/* Button typography - L546-L553 */}
								<TypographyControl
									label={__('Button typography', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									typographyAttributeName="scndBtnTypo"
								/>

								{/* Border radius - L556-L581 */}
								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributeBaseName="scndBtnRadius"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									step={1}
									units={['px', '%']}
								/>

								{/* Text color - L583-L593 */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndBtnC}
									onChange={(value) => setAttributes({ scndBtnC: value })}
								/>

								{/* Padding - L595-L605 */}
								<DimensionsControl
									label={__('Padding', 'voxel-fse')}
									values={attributes.scndBtnPadding || {}}
									onChange={(values) => setAttributes({ scndBtnPadding: values })}
								/>

								{/* Height - L607-L624 */}
								<ResponsiveRangeControl
									label={__('Height', 'voxel-fse')}
									attributeBaseName="scndBtnHeight"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									step={1}
								/>

								{/* Background color - L627-L637 */}
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.scndBtnBg}
									onChange={(value) => setAttributes({ scndBtnBg: value })}
								/>

								{/* Border - L639-L646 */}
								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.scndBtnBorder || {}}
									onChange={(value) => setAttributes({ scndBtnBorder: value })}
									hideRadius={true}
								/>

								{/* Icon size - L649-L671 */}
								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributeBaseName="scndBtnIconSize"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									step={1}
									units={['px', '%']}
								/>

								{/* Icon/Text spacing - L673-L690 */}
								<ResponsiveRangeControl
									label={__('Icon/Text spacing', 'voxel-fse')}
									attributeBaseName="scndBtnIconPad"
									attributes={attributes}
									setAttributes={setAttributes}
									min={0}
									max={100}
									step={1}
								/>

								{/* Icon color - L692-L703 */}
								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.scndBtnIconColor}
									onChange={(value) => setAttributes({ scndBtnIconColor: value })}
								/>
							</>
						) : (
							<>
								{/* Hover State Controls - L712-L770 */}

								{/* Text color (Hover) - L719-L729 */}
								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.scndBtnCH}
									onChange={(value) => setAttributes({ scndBtnCH: value })}
								/>

								{/* Background color (Hover) - L731-L741 */}
								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.scndBtnBgH}
									onChange={(value) => setAttributes({ scndBtnBgH: value })}
								/>

								{/* Border color (Hover) - L743-L753 */}
								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.scndBtnBorderH}
									onChange={(value) => setAttributes({ scndBtnBorderH: value })}
								/>

								{/* Icon color (Hover) - L755-L766 */}
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
