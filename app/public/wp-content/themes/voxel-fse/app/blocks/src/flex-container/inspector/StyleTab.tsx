/**
 * Flex Container Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Background, Background Overlay, Border, Shape Divider accordions.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

import {
	BackgroundControl,
	BackgroundOverlayControl,
	StateTabPanel,
	DimensionsControl,
	ColorPickerControl,
	BoxShadowPopup,
	ShapeDividerControl,
} from '@shared/controls';
import { AccordionPanelGroup, AccordionPanel } from '@shared/controls/AccordionPanelGroup';

interface StyleTabProps {
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
}

/**
 * Style Tab Component
 *
 * Renders the Style tab with four accordion sections:
 * - Background (color, image, video, slideshow)
 * - Background Overlay (overlay options)
 * - Border (type, width, color, radius, box shadow with Normal/Hover states)
 * - Shape Divider (top/bottom shape dividers)
 */
export function StyleTab({ attributes, setAttributes }: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			defaultPanel="background"
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="styleOpenPanel"
		>
			<AccordionPanel id="background" title={__('Background', 'voxel-fse')}>
				<BackgroundControl
					attributes={attributes}
					setAttributes={setAttributes}
					showVideoBackground={true}
					showSlideshowBackground={true}
				/>
			</AccordionPanel>

			<AccordionPanel id="background-overlay" title={__('Background Overlay', 'voxel-fse')}>
				<BackgroundOverlayControl attributes={attributes} setAttributes={setAttributes} />
			</AccordionPanel>

			<AccordionPanel id="border" title={__('Border', 'voxel-fse')}>
				<StateTabPanel
					attributeName="borderActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						const borderTypeAttr = isHover ? 'borderTypeHover' : 'borderType';
						const borderWidthAttr = isHover ? 'borderWidthHover' : 'borderWidth';
						const borderColorAttr = isHover ? 'borderColorHover' : 'borderColor';
						const borderRadiusAttr = isHover ? 'borderRadiusHover' : 'borderRadiusDimensions';

						return (
							<>
								{/* Border Type */}
								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes[borderTypeAttr] || 'none'}
									options={[
										{ label: __('None', 'voxel-fse'), value: 'none' },
										{ label: __('Solid', 'voxel-fse'), value: 'solid' },
										{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
										{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
										{ label: __('Double', 'voxel-fse'), value: 'double' },
										{ label: __('Groove', 'voxel-fse'), value: 'groove' },
									]}
									onChange={(val) => setAttributes({ [borderTypeAttr]: val })}
									__nextHasNoMarginBottom
								/>

								{/* Border Width - 4 input fields (only show when border type is not 'none') */}
								{attributes[borderTypeAttr] && attributes[borderTypeAttr] !== 'none' && (
									<DimensionsControl
										label={__('Border Width', 'voxel-fse')}
										values={attributes[borderWidthAttr] || {}}
										onChange={(values) => setAttributes({ [borderWidthAttr]: values })}
										availableUnits={['px', 'em']}
									/>
								)}

								{/* Border Color */}
								{attributes[borderTypeAttr] && attributes[borderTypeAttr] !== 'none' && (
									<ColorPickerControl
										label={__('Border Color', 'voxel-fse')}
										value={attributes[borderColorAttr]}
										onChange={(val) => setAttributes({ [borderColorAttr]: val })}
									/>
								)}

								{/* Border Radius - 4 input fields */}
								<DimensionsControl
									label={__('Border Radius', 'voxel-fse')}
									values={attributes[borderRadiusAttr] || {}}
									onChange={(values) => setAttributes({ [borderRadiusAttr]: values })}
									availableUnits={['px', '%', 'em']}
								/>
							</>
						);
					}}
				</StateTabPanel>

				{/* Box Shadow - outside of tabs */}
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					shadowAttributeName="boxShadow"
				/>
			</AccordionPanel>

			<AccordionPanel id="shape-divider" title={__('Shape Divider', 'voxel-fse')}>
				<ShapeDividerControl attributes={attributes} setAttributes={setAttributes} />
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
