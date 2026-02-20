/**
 * Image Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Maps 1:1 to Elementor Widget_Image Style tab controls.
 *
 * Evidence: themes/voxel/app/widgets/image.php:9 (extends Elementor Widget_Image)
 * Documentation: docs/block-conversions/image/phase2-improvements.md
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, TextControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	StateTabPanel,
	ChooseControl,
	ResponsiveRangeControl,
	SliderControl,
	CssFiltersPopup,
	BorderGroupControl,
	BoxShadowPopup,
	ColorControl,
	TypographyControl,
	TextShadowPopup,
	ResponsiveDropdownButton,
} from '@shared/controls';
import { useSelect } from '@wordpress/data';
import { getCurrentDeviceType } from '@shared/utils/deviceType';
import type { ImageBlockAttributes } from '../types';

interface StyleTabProps {
	attributes: ImageBlockAttributes;
	setAttributes: (attrs: Partial<ImageBlockAttributes>) => void;
}


export function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	const currentDevice = (useSelect as any)((select: any) => getCurrentDeviceType(select), []);
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="image"
		>
			<AccordionPanel id="image" title={__('Image', 'voxel-fse')}>
				{/* Alignment - 3 buttons with Elementor icons */}
				{/* Alignment - Responsive */}
				<ChooseControl
					label={__('Alignment', 'voxel-fse')}
					value={(function () {
						const attrName = currentDevice === 'desktop' ? 'imageAlign' : `imageAlign_${currentDevice}`;
						return (attributes as any)[attrName];
					})()}
					onChange={(value) => {
						const attrName = currentDevice === 'desktop' ? 'imageAlign' : `imageAlign_${currentDevice}`;
						setAttributes({ [attrName]: value });
					}}
					options={[
						{ value: 'left', icon: 'eicon-text-align-left', title: __('Left', 'voxel-fse') },
						{ value: 'center', icon: 'eicon-text-align-center', title: __('Center', 'voxel-fse') },
						{ value: 'right', icon: 'eicon-text-align-right', title: __('Right', 'voxel-fse') },
					]}
					allowToggle={false}
					controls={<ResponsiveDropdownButton controlKey="imageAlign" />}
				/>

				{/* Width */}
				<ResponsiveRangeControl
					label={__('Width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="width"
					min={0}
					max={1000}
					units={['px', '%', 'vw']}
					unitAttributeName="widthUnit"
				/>

				{/* Max Width */}
				<ResponsiveRangeControl
					label={__('Max Width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="maxWidth"
					min={0}
					max={1000}
					units={['px', '%', 'vw']}
					unitAttributeName="maxWidthUnit"
				/>

				{/* Height */}
				<ResponsiveRangeControl
					label={__('Height', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="height"
					min={0}
					max={1000}
					units={['px', 'vh']}
					unitAttributeName="heightUnit"
				/>

				{/* State Tabs: Normal / Hover */}
				<StateTabPanel
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="imageStyleState"
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => (
						<>
							{tab.name === 'normal' ? (
								<>
									{/* Opacity */}
									<SliderControl
										label={__('Opacity', 'voxel-fse')}
										value={attributes.imageOpacity ?? 1}
										onChange={(value) => setAttributes({ imageOpacity: value })}
										min={0}
										max={1}
										step={0.01}
									/>

									{/* CSS Filters */}
									<CssFiltersPopup
										label={__('CSS Filters', 'voxel-fse')}
										value={(attributes as any).imageCssFilters || {}}
										onChange={(value: any) => setAttributes({ imageCssFilters: value } as any)}
									/>
								</>
							) : (
								<>
									{/* Opacity Hover */}
									<SliderControl
										label={__('Opacity', 'voxel-fse')}
										value={attributes.imageOpacityHover ?? 1}
										onChange={(value) => setAttributes({ imageOpacityHover: value })}
										min={0}
										max={1}
										step={0.01}
									/>

									{/* CSS Filters Hover */}
									<CssFiltersPopup
										label={__('CSS Filters', 'voxel-fse')}
										value={(attributes as any).imageCssFiltersHover || {}}
										onChange={(value: any) => setAttributes({ imageCssFiltersHover: value } as any)}
									/>

									{/* Transition Duration */}
									<SliderControl
										label={__('Transition Duration', 'voxel-fse')}
										value={attributes.imageTransitionDuration ?? 0.3}
										onChange={(value) => setAttributes({ imageTransitionDuration: value })}
										min={0}
										max={3}
										step={0.1}
									/>

									{/* Hover Animation - matches Elementor HOVER_ANIMATION control */}
									<SelectControl
										label={__('Hover Animation', 'voxel-fse')}
										value={attributes.hoverAnimation || ''}
										onChange={(value: string) => setAttributes({ hoverAnimation: value })}
										options={[
											{ label: __('None', 'voxel-fse'), value: '' },
											{ label: __('Grow', 'voxel-fse'), value: 'grow' },
											{ label: __('Shrink', 'voxel-fse'), value: 'shrink' },
											{ label: __('Pulse', 'voxel-fse'), value: 'pulse' },
											{ label: __('Pulse Grow', 'voxel-fse'), value: 'pulse-grow' },
											{ label: __('Pulse Shrink', 'voxel-fse'), value: 'pulse-shrink' },
											{ label: __('Push', 'voxel-fse'), value: 'push' },
											{ label: __('Pop', 'voxel-fse'), value: 'pop' },
											{ label: __('Bounce In', 'voxel-fse'), value: 'bounce-in' },
											{ label: __('Bounce Out', 'voxel-fse'), value: 'bounce-out' },
											{ label: __('Rotate', 'voxel-fse'), value: 'rotate' },
											{ label: __('Grow Rotate', 'voxel-fse'), value: 'grow-rotate' },
											{ label: __('Float', 'voxel-fse'), value: 'float' },
											{ label: __('Sink', 'voxel-fse'), value: 'sink' },
											{ label: __('Bob', 'voxel-fse'), value: 'bob' },
											{ label: __('Hang', 'voxel-fse'), value: 'hang' },
											{ label: __('Skew', 'voxel-fse'), value: 'skew' },
											{ label: __('Skew Forward', 'voxel-fse'), value: 'skew-forward' },
											{ label: __('Skew Backward', 'voxel-fse'), value: 'skew-backward' },
											{ label: __('Wobble Vertical', 'voxel-fse'), value: 'wobble-vertical' },
											{ label: __('Wobble Horizontal', 'voxel-fse'), value: 'wobble-horizontal' },
											{ label: __('Wobble To Bottom Right', 'voxel-fse'), value: 'wobble-to-bottom-right' },
											{ label: __('Wobble To Top Right', 'voxel-fse'), value: 'wobble-to-top-right' },
											{ label: __('Wobble Top', 'voxel-fse'), value: 'wobble-top' },
											{ label: __('Wobble Bottom', 'voxel-fse'), value: 'wobble-bottom' },
											{ label: __('Wobble Skew', 'voxel-fse'), value: 'wobble-skew' },
											{ label: __('Buzz', 'voxel-fse'), value: 'buzz' },
											{ label: __('Buzz Out', 'voxel-fse'), value: 'buzz-out' },
										]}
										__nextHasNoMarginBottom
									/>
								</>
							)}
						</>
					)}
				</StateTabPanel>

				{/* Border (includes Border Radius internally) */}
				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={attributes.imageBorder || {}}
					onChange={(value) => setAttributes({ imageBorder: value })}
				/>

				{/* Box Shadow */}
				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="imageBoxShadow"
				/>

				{/* Aspect Ratio - matches Elementor's aspect ratio control */}
				<TextControl
					label={__('Aspect Ratio', 'voxel-fse')}
					value={attributes.aspectRatio || ''}
					onChange={(value: string | undefined) => setAttributes({ aspectRatio: value || '' })}
					placeholder={__('e.g. 16/9', 'voxel-fse')}
					help={__('Set image aspect ratio e.g 16/9', 'voxel-fse')}
					__nextHasNoMarginBottom
				/>
			</AccordionPanel>

			<AccordionPanel id="caption" title={__('Caption', 'voxel-fse')}>
				{/* Alignment */}
				{/* Alignment - Responsive */}
				<ChooseControl
					label={__('Alignment', 'voxel-fse')}
					value={(function () {
						const attrName = currentDevice === 'desktop' ? 'captionAlign' : `captionAlign_${currentDevice}`;
						return (attributes as any)[attrName];
					})()}
					onChange={(value) => {
						const attrName = currentDevice === 'desktop' ? 'captionAlign' : `captionAlign_${currentDevice}`;
						setAttributes({ [attrName]: value });
					}}
					options={[
						{ value: 'left', icon: 'eicon-text-align-left', title: __('Left', 'voxel-fse') },
						{ value: 'center', icon: 'eicon-text-align-center', title: __('Center', 'voxel-fse') },
						{ value: 'right', icon: 'eicon-text-align-right', title: __('Right', 'voxel-fse') },
						{ value: 'justify', icon: 'eicon-text-align-justify', title: __('Justify', 'voxel-fse') },
					]}
					allowToggle={false}
					controls={<ResponsiveDropdownButton controlKey="captionAlign" />}
				/>

				{/* Text Color */}
				<ColorControl
					label={__('Text Color', 'voxel-fse')}
					value={attributes.captionTextColor}
					onChange={(value) => setAttributes({ captionTextColor: value })}
				/>

				{/* Background Color */}
				<ColorControl
					label={__('Background Color', 'voxel-fse')}
					value={attributes.captionBackgroundColor}
					onChange={(value) => setAttributes({ captionBackgroundColor: value })}
				/>

				{/* Typography */}
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					value={(attributes.captionTypography || {}) as any}
					onChange={(value: any) => setAttributes({ captionTypography: value })}
				/>

				{/* Text Shadow */}
				<TextShadowPopup
					label={__('Text Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="captionTextShadow"
				/>

				{/* Spacing */}
				<ResponsiveRangeControl
					label={__('Spacing', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="captionSpacing"
					min={0}
					max={100}
					units={['px', 'em', 'rem']}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
