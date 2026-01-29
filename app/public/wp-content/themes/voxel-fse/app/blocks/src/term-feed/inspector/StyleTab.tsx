/**
 * Term Feed Block - Style Tab Inspector Controls
 *
 * Implements all Style tab controls from Voxel's Term_Feed widget.
 *
 * Evidence:
 * - Source: themes/voxel/app/widgets/term-feed.php:296-577
 * - Accordions:
 *   1. Carousel navigation (line 296) - Normal/Hover state tabs
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	ResponsiveRangeControl,
	ColorControl,
	BorderGroupControl,
	AccordionPanelGroup,
	AccordionPanel,
	StateTabPanel,
} from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
import type { TermFeedAttributes } from '../types';

interface StyleTabProps {
	attributes: TermFeedAttributes;
	setAttributes: (attrs: Partial<TermFeedAttributes>) => void;
}

export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="carousel-navigation"
		>
			{/* Accordion 1: Carousel navigation */}
			<AccordionPanel
				id="carousel-navigation"
				title={__('Carousel navigation', 'voxel-fse')}
			>
				{/* State tabs: Normal / Hover */}
				<StateTabPanel
					attributeName="carouselNavState"
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
								{/* Normal tab controls */}
								{/* Horizontal position - ts_fnav_btn_horizontal */}
								<ResponsiveRangeControl
									label={__('Horizontal position', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navHorizontalPosition"
									min={-100}
									max={100}
									step={1}
								/>

								{/* Vertical position - ts_fnav_btn_vertical */}
								<ResponsiveRangeControl
									label={__('Vertical position', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navVerticalPosition"
									min={-500}
									max={500}
									step={1}
								/>

								{/* Button icon color - ts_fnav_btn_color */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.navButtonIconColor}
									onChange={(value) =>
										setAttributes({
											navButtonIconColor: value || '',
										})
									}
								/>

								{/* Button size - ts_fnav_btn_size */}
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navButtonSize"
									min={0}
									max={100}
									step={1}
								/>

								{/* Button icon size - ts_fnav_btn_icon_size */}
								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navButtonIconSize"
									min={0}
									max={100}
									step={1}
								/>

								{/* Button background - ts_fnav_btn_nbg */}
								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.navButtonBackground}
									onChange={(value) =>
										setAttributes({
											navButtonBackground: value || '',
										})
									}
								/>

								{/* Backdrop blur - ts_fnav_blur */}
								<ResponsiveRangeControl
									label={__('Backdrop blur', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navBackdropBlur"
									min={0}
									max={10}
									step={1}
								/>

								{/* Border - ts_fnav_btn_border (group control) */}
								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={{
										borderType: attributes.navBorderType || '',
										borderWidth: attributes.navBorderWidth || {},
										borderColor: attributes.navBorderColor || '',
									}}
									onChange={(value) => {
										const updates: Partial<TermFeedAttributes> = {};
										if (value.borderType !== undefined) {
											updates.navBorderType = value.borderType;
										}
										if (value.borderWidth !== undefined) {
											updates.navBorderWidth = value.borderWidth as any;
										}
										if (value.borderColor !== undefined) {
											updates.navBorderColor = value.borderColor;
										}
										setAttributes(updates);
									}}
									hideRadius={true}
								/>

								{/* Button border radius - ts_fnav_btn_radius */}
								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navBorderRadius"
									min={0}
									max={100}
									step={1}
								/>
							</>
						) : (
							<>
								{/* Hover tab controls */}
								{/* Button size - ts_fnav_btn_size_h */}
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navButtonSizeHover"
									min={0}
									max={100}
									step={1}
								/>

								{/* Button icon size - ts_fnav_btn_icon_size_h */}
								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="navButtonIconSizeHover"
									min={0}
									max={100}
									step={1}
								/>

								{/* Button icon color - ts_fnav_btn_h */}
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.navButtonIconColorHover}
									onChange={(value) =>
										setAttributes({
											navButtonIconColorHover: value || '',
										})
									}
								/>

								{/* Button background color - ts_fnav_btn_nbg_h */}
								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.navButtonBackgroundHover}
									onChange={(value) =>
										setAttributes({
											navButtonBackgroundHover: value || '',
										})
									}
								/>

								{/* Button border color - ts_fnav_border_c_h */}
								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.navButtonBorderColorHover}
									onChange={(value) =>
										setAttributes({
											navButtonBorderColorHover: value || '',
										})
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
