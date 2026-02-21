/**
 * Gallery Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains General accordion with Normal/Hover state tabs.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, RangeControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ColorControl,
	AdvancedIconControl,
	ResponsiveRangeControl,
	StateTabPanel,
	TypographyControl,
} from '@shared/controls';
import type { GalleryBlockAttributes } from '../types';
import type { IconValue } from '@shared/types';
import type { TypographyValue } from '@shared/controls/TypographyPopup';

interface StyleTabProps {
	attributes: GalleryBlockAttributes;
	setAttributes: (attrs: Partial<GalleryBlockAttributes>) => void;
}

/**
 * Border type options
 */
const BORDER_TYPE_OPTIONS = [
	{ label: __('Default', 'voxel-fse'), value: '' },
	{ label: __('None', 'voxel-fse'), value: 'none' },
	{ label: __('Solid', 'voxel-fse'), value: 'solid' },
	{ label: __('Double', 'voxel-fse'), value: 'double' },
	{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
	{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
];

export function StyleTab({ attributes, setAttributes }: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="general"
		>
			{/* General Accordion */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<StateTabPanel
					attributeName="generalStateTab"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								{/* Image Section */}
								<h4 style={{ marginBottom: '12px', fontWeight: 600 }}>
									{__('Image', 'voxel-fse')}
								</h4>

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="imageBorderRadius"
									min={0}
									max={100}
								/>

								{/* Overlay Section */}
								<h4
									style={{
										marginTop: '24px',
										marginBottom: '12px',
										fontWeight: 600,
									}}
								>
									{__('Overlay', 'voxel-fse')}
								</h4>

								<ColorControl
									label={__('Overlay background color', 'voxel-fse')}
									value={attributes.overlayColor}
									onChange={(value: string | undefined) =>
										setAttributes({ overlayColor: value ?? '' })
									}
								/>

								{/* Empty Item Section */}
								<h4
									style={{
										marginTop: '24px',
										marginBottom: '12px',
										fontWeight: 600,
									}}
								>
									{__('Empty item', 'voxel-fse')}
								</h4>

								<SelectControl
									label={__('Border Type', 'voxel-fse')}
									value={attributes.emptyBorderType}
									options={BORDER_TYPE_OPTIONS}
									onChange={(value: string) =>
										setAttributes({ emptyBorderType: value })
									}
								/>

								{attributes.emptyBorderType &&
									attributes.emptyBorderType !== 'none' && (
										<>
											<RangeControl
												label={__('Border Width', 'voxel-fse')}
												value={attributes.emptyBorderWidth}
												onChange={(value: number | undefined) =>
													setAttributes({ emptyBorderWidth: value })
												}
												min={0}
												max={20}
											/>
											<ColorControl
												label={__('Border Color', 'voxel-fse')}
												value={attributes.emptyBorderColor}
												onChange={(value: string | undefined) =>
													setAttributes({ emptyBorderColor: value ?? '' })
												}
											/>
										</>
									)}

								<ResponsiveRangeControl
									label={__('Border radius', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="emptyBorderRadius"
									min={0}
									max={100}
								/>

								{/* View All Button Section */}
								<h4
									style={{
										marginTop: '24px',
										marginBottom: '12px',
										fontWeight: 600,
									}}
								>
									{__('View all button', 'voxel-fse')}
								</h4>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.viewAllBgColor}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllBgColor: value ?? '' })
									}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.viewAllIconColor}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllIconColor: value ?? '' })
									}
								/>

								<AdvancedIconControl
									label={__('Icon', 'voxel-fse')}
									value={attributes.viewAllIcon}
									onChange={(value) =>
										setAttributes({ viewAllIcon: value as IconValue })
									}
									supportsDynamicTags={true}
									dynamicTagContext="post"
								/>

								<ResponsiveRangeControl
									label={__('Icon size', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="viewAllIconSize"
									min={0}
									max={70}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.viewAllTextColor}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllTextColor: value ?? '' })
									}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									value={attributes.viewAllTypography as TypographyValue}
									onChange={(value: TypographyValue) =>
										setAttributes({ viewAllTypography: value })
									}
								/>
							</>
						) : (
							<>
								{/* Hover - Overlay */}
								<h4 style={{ marginBottom: '12px', fontWeight: 600 }}>
									{__('Overlay', 'voxel-fse')}
								</h4>

								<ColorControl
									label={__('Overlay background color', 'voxel-fse')}
									value={attributes.overlayColorHover}
									onChange={(value: string | undefined) =>
										setAttributes({ overlayColorHover: value ?? '' })
									}
								/>

								{/* Hover - View All Button */}
								<h4
									style={{
										marginTop: '24px',
										marginBottom: '12px',
										fontWeight: 600,
									}}
								>
									{__('View all button', 'voxel-fse')}
								</h4>

								<ColorControl
									label={__('Background color', 'voxel-fse')}
									value={attributes.viewAllBgColorHover}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllBgColorHover: value ?? '' })
									}
								/>

								<ColorControl
									label={__('Icon color', 'voxel-fse')}
									value={attributes.viewAllIconColorHover}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllIconColorHover: value ?? '' })
									}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.viewAllTextColorHover}
									onChange={(value: string | undefined) =>
										setAttributes({ viewAllTextColorHover: value ?? '' })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
