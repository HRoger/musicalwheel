/**
 * Timeline Kit Block - Style Tab Inspector Controls
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/timeline-kit.php (lines 27-732)
 * - Control mapping follows /convert:inspector-tab workflow
 *
 * 5 Accordions:
 * 1. General - Primary styling (colors, shadow, radius)
 * 2. Icons - Icon sizing and colors
 * 3. Post reviews - Review category width
 * 4. Buttons - Button styling with Normal/Hover states
 * 5. Loading spinner - Spinner colors
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ColorControl,
	BoxShadowPopup,
	ResponsiveRangeControl,
	TypographyControl,
	BorderGroupControl,
	StateTabPanel,
	SectionHeading,
} from '@shared/controls';
import type { Attributes } from '../types';

interface StyleTabProps {
	attributes: Attributes;
	setAttributes: (attrs: Partial<Attributes>) => void;
}

export function StyleTab({ attributes, setAttributes }: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="general"
		>
			{/* Accordion 1: General (lines 27-168) */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<ColorControl
					label={__('Primary text', 'voxel-fse')}
					value={attributes.vxfText1}
					onChange={(value) => setAttributes({ vxfText1: value })}
				/>

				<ColorControl
					label={__('Secondary text', 'voxel-fse')}
					value={attributes.vxfText2}
					onChange={(value) => setAttributes({ vxfText2: value })}
				/>

				<ColorControl
					label={__('Link color', 'voxel-fse')}
					value={attributes.vxfText3}
					onChange={(value) => setAttributes({ vxfText3: value })}
				/>

				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.vxfBg}
					onChange={(value) => setAttributes({ vxfBg: value })}
				/>

				<ColorControl
					label={__('Border Color', 'voxel-fse')}
					value={attributes.vxfBorder}
					onChange={(value) => setAttributes({ vxfBorder: value })}
				/>

				<ColorControl
					label={__('Detail color', 'voxel-fse')}
					value={attributes.vxfDetail}
					onChange={(value) => setAttributes({ vxfDetail: value })}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="vxfShadow"
				/>

				<ResponsiveRangeControl
					label={__('XL radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="xlRadius"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('LG radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="lgRadius"
					min={0}
					max={30}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('MD radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="mdRadius"
					min={0}
					max={15}
					step={1}
					units={['px']}
				/>
			</AccordionPanel>

			{/* Accordion 2: Icons (lines 170-273) */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Post Actions', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="mainIconSize"
					min={15}
					max={50}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Reply actions', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="replyIconSize"
					min={15}
					max={50}
					step={1}
					units={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.vxfAction1}
					onChange={(value) => setAttributes({ vxfAction1: value })}
				/>

				<ColorControl
					label={__('Liked Icon color', 'voxel-fse')}
					value={attributes.vxfAction2}
					onChange={(value) => setAttributes({ vxfAction2: value })}
				/>

				<ColorControl
					label={__('Reposted Icon color', 'voxel-fse')}
					value={attributes.vxfAction3}
					onChange={(value) => setAttributes({ vxfAction3: value })}
				/>

				<ColorControl
					label={__('Verified Icon color', 'voxel-fse')}
					value={attributes.vxfAction4}
					onChange={(value) => setAttributes({ vxfAction4: value })}
				/>

				<ColorControl
					label={__('Star Icon color', 'voxel-fse')}
					value={attributes.vxfAction5}
					onChange={(value) => setAttributes({ vxfAction5: value })}
				/>
			</AccordionPanel>

			{/* Accordion 3: Post reviews (lines 275-301) */}
			<AccordionPanel id="post-reviews" title={__('Post reviews', 'voxel-fse')}>
				{/*
					IMPORTANT: Elementor uses size_units: ['px'] but range is 0-100%
					User requirement: "has a responsive dropdown control, BUT not the unitdropdown button"
					Solution: Don't pass 'units' prop - this keeps responsive dropdown but hides unit dropdown
					The value is stored without unit suffix in the attribute (just the number).
				*/}
				<ResponsiveRangeControl
					label={__('Review categories (Min width)', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="revMinWidth"
					min={0}
					max={100}
					step={1}
				/>
			</AccordionPanel>

			{/* Accordion 4: Buttons (lines 304-699) */}
			<AccordionPanel id="buttons" title={__('Buttons', 'voxel-fse')}>
				<StateTabPanel
					attributeName="buttonsState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' ? (
								<>
									<SectionHeading label={__('General', 'voxel-fse')} />

									<TypographyControl
										label={__('Button typography', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										typographyAttributeName="tsPopupBtnTypo"
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes as Record<string, any>}
										setAttributes={setAttributes as (attrs: Record<string, any>) => void}
										attributeBaseName="tsPopupBtnRadius"
										unitAttributeName="tsPopupBtnRadiusUnit"
										min={0}
										max={100}
										step={1}
										units={['px', '%']}
									/>

									<SectionHeading label={__('Primary button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopupButton1}
										onChange={(value) => setAttributes({ tsPopupButton1: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupButton1C}
										onChange={(value) => setAttributes({ tsPopupButton1C: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupButton1Icon}
										onChange={(value) => setAttributes({ tsPopupButton1Icon: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tsPopupButton1BorderType || '',
											borderWidth: attributes.tsPopupButton1BorderWidth || {},
											borderColor: attributes.tsPopupButton1BorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<Attributes> = {};
											if (value.borderType !== undefined) {
												updates.tsPopupButton1BorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.tsPopupButton1BorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tsPopupButton1BorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<SectionHeading label={__('Accent button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopupButton2}
										onChange={(value) => setAttributes({ tsPopupButton2: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupButton2C}
										onChange={(value) => setAttributes({ tsPopupButton2C: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupButton2Icon}
										onChange={(value) => setAttributes({ tsPopupButton2Icon: value })}
									/>

									<BorderGroupControl
										label={__('Border', 'voxel-fse')}
										value={{
											borderType: attributes.tsPopupButton2BorderType || '',
											borderWidth: attributes.tsPopupButton2BorderWidth || {},
											borderColor: attributes.tsPopupButton2BorderColor || '',
										}}
										onChange={(value) => {
											const updates: Partial<Attributes> = {};
											if (value.borderType !== undefined) {
												updates.tsPopupButton2BorderType = value.borderType;
											}
											if (value.borderWidth !== undefined) {
												updates.tsPopupButton2BorderWidth = value.borderWidth as any;
											}
											if (value.borderColor !== undefined) {
												updates.tsPopupButton2BorderColor = value.borderColor;
											}
											setAttributes(updates);
										}}
										hideRadius={true}
									/>

									<SectionHeading label={__('Tertiary button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopuptertiary2}
										onChange={(value) => setAttributes({ tsPopuptertiary2: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupTertiary2C}
										onChange={(value) => setAttributes({ tsPopupTertiary2C: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupButton3Icon}
										onChange={(value) => setAttributes({ tsPopupButton3Icon: value })}
									/>
								</>
							) : (
								<>
									{/* Hover State */}
									<SectionHeading label={__('Primary button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopupButton1H}
										onChange={(value) => setAttributes({ tsPopupButton1H: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupButton1CH}
										onChange={(value) => setAttributes({ tsPopupButton1CH: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupButton1IconH}
										onChange={(value) => setAttributes({ tsPopupButton1IconH: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tsPopupButton1BH}
										onChange={(value) => setAttributes({ tsPopupButton1BH: value })}
									/>

									<SectionHeading label={__('Accent button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopupButton2H}
										onChange={(value) => setAttributes({ tsPopupButton2H: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupButton2CH}
										onChange={(value) => setAttributes({ tsPopupButton2CH: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupButton2IconH}
										onChange={(value) => setAttributes({ tsPopupButton2IconH: value })}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.tsPopupButton2BH}
										onChange={(value) => setAttributes({ tsPopupButton2BH: value })}
									/>

									<SectionHeading label={__('Tertiary button', 'voxel-fse')} />

									<ColorControl
										label={__('Background', 'voxel-fse')}
										value={attributes.tsPopupTertiary2H}
										onChange={(value) => setAttributes({ tsPopupTertiary2H: value })}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.tsPopupTertiary2CH}
										onChange={(value) => setAttributes({ tsPopupTertiary2CH: value })}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.tsPopupTertiaryIconH}
										onChange={(value) => setAttributes({ tsPopupTertiaryIconH: value })}
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>
			</AccordionPanel>

			{/* Accordion 5: Loading spinner (lines 701-732) */}
			<AccordionPanel id="loading-spinner" title={__('Loading spinner', 'voxel-fse')}>
				<ColorControl
					label={__('Color 1', 'voxel-fse')}
					value={attributes.tmColor1}
					onChange={(value) => setAttributes({ tmColor1: value })}
				/>

				<ColorControl
					label={__('Color 2', 'voxel-fse')}
					value={attributes.tmColor2}
					onChange={(value) => setAttributes({ tmColor2: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
