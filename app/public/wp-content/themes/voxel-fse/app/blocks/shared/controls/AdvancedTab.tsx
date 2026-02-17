/**
 * Reusable Advanced Tab Component
 *
 * Replicates Elementor's "Advanced" tab functionality with FULL parity.
 * Based on: plugins/elementor/includes/widgets/common-base.php:L288-L818
 *
 * Layout Section Features (L288-L818):
 * - Responsive Margin & Padding (DimensionsControl)
 * - Width controls (Default/Full/Inline/Custom)
 * - Grid Item controls (Column Span, Row Span)
 * - Vertical Align (legacy BC)
 * - Position controls (Absolute/Fixed + offsets)
 * - Responsive Z-Index
 * - CSS ID & Classes
 *
 * Other Sections:
 * - Responsive Visibility (Hide on Desktop/Tablet/Mobile)
 * - Custom CSS
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import {
	ToggleControl,
	SelectControl,
	RangeControl,
} from '@wordpress/components';
import { AccordionPanelGroup, AccordionPanel } from './AccordionPanelGroup';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import DimensionsControl from './DimensionsControl';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import ResponsiveTextControl from './ResponsiveTextControl';
import ResponsiveControl from './ResponsiveControl';
import ChooseControl from './ChooseControl';
import SectionHeading from './SectionHeading';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import UnitDropdownButton from './UnitDropdownButton';
import StateTabPanel from './StateTabPanel';
import ColorPickerControl from './ColorPickerControl';
import ImageUploadControl from './ImageUploadControl';
import type { ImageUploadValue } from './ImageUploadControl';
import CodeEditorControl from './CodeEditorControl';
import { getImageSizeOptions } from './image-options';
import DynamicTagTextControl from './DynamicTagTextControl';
import DynamicTagTextareaControl from './DynamicTagTextareaControl';
import TransformControls, { transformAttributes } from './TransformControls';
import type { TransformAttributes } from './TransformControls';
import MotionEffectsControls, { motionEffectsAttributes } from './MotionEffectsControls';
import type { MotionEffectsAttributes } from './MotionEffectsControls';
import AdvancedBorderControl from './AdvancedBorderControl';

// Voxel/Gutenberg attribute structure for dimensions
export interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

// Slider value with unit (for custom width, offsets)
export interface SliderValue {
	size?: number;
	unit?: string;
}

interface AdvancedTabProps {
	attributes: TransformAttributes & MotionEffectsAttributes & {
		// Margin (responsive)
		blockMargin?: DimensionsConfig;
		blockMargin_tablet?: DimensionsConfig;
		blockMargin_mobile?: DimensionsConfig;

		// Padding (responsive)
		blockPadding?: DimensionsConfig;
		blockPadding_tablet?: DimensionsConfig;
		blockPadding_mobile?: DimensionsConfig;

		// Width controls (responsive)
		elementWidth?: string;
		elementWidth_tablet?: string;
		elementWidth_mobile?: string;
		elementCustomWidth?: number;
		elementCustomWidth_tablet?: number;
		elementCustomWidth_mobile?: number;
		elementCustomWidthUnit?: string;

		// Flexbox Item controls (responsive)
		flexAlignSelf?: string;
		flexAlignSelf_tablet?: string;
		flexAlignSelf_mobile?: string;
		flexOrder?: string;
		flexOrder_tablet?: string;
		flexOrder_mobile?: string;
		flexOrderCustom?: number;
		flexOrderCustom_tablet?: number;
		flexOrderCustom_mobile?: number;
		flexSize?: string;
		flexSize_tablet?: string;
		flexSize_mobile?: string;
		flexGrow?: number;
		flexGrow_tablet?: number;
		flexGrow_mobile?: number;
		flexShrink?: number;
		flexShrink_tablet?: number;
		flexShrink_mobile?: number;

		// Position controls
		position?: string;
		offsetOrientationH?: string;
		offsetX?: number;
		offsetX_tablet?: number;
		offsetX_mobile?: number;
		offsetXUnit?: string;
		offsetXEnd?: number;
		offsetXEnd_tablet?: number;
		offsetXEnd_mobile?: number;
		offsetXEndUnit?: string;
		offsetOrientationV?: string;
		offsetY?: number;
		offsetY_tablet?: number;
		offsetY_mobile?: number;
		offsetYUnit?: string;
		offsetYEnd?: number;
		offsetYEnd_tablet?: number;
		offsetYEnd_mobile?: number;
		offsetYEndUnit?: string;

		// Z-Index (responsive) - string to support dynamic tags
		zIndex?: string;
		zIndex_tablet?: string;
		zIndex_mobile?: string;

		// CSS ID & Classes
		elementId?: string;
		customClasses?: string;
		// Dynamic Tags for CSS ID & Classes
		elementIdDynamicTag?: string;
		customClassesDynamicTag?: string;

		// Border (Active tab state)
		borderActiveTab?: string;

		// Border (Normal state)
		borderType?: string;
		borderWidth?: DimensionsConfig;
		borderColor?: string;
		borderRadius?: DimensionsConfig;
		borderRadius_tablet?: DimensionsConfig;
		borderRadius_mobile?: DimensionsConfig;
		boxShadow?: any;

		// Border (Hover state)
		borderTypeHover?: string;
		borderWidthHover?: DimensionsConfig;
		borderColorHover?: string;
		borderRadiusHover?: DimensionsConfig;
		borderRadiusHover_tablet?: DimensionsConfig;
		borderRadiusHover_mobile?: DimensionsConfig;
		boxShadowHover?: any;

		// Background (Active tab state)
		backgroundActiveTab?: string;

		// Background - Normal state
		backgroundType?: string; // 'classic' | 'gradient'
		backgroundColor?: string;
		backgroundImage?: ImageUploadValue;
		backgroundImage_tablet?: ImageUploadValue;
		backgroundImage_mobile?: ImageUploadValue;

		// Image sub-controls (when image is set)
		bgImageResolution?: string;
		bgImagePosition?: string;
		bgImagePosition_tablet?: string;
		bgImagePosition_mobile?: string;
		bgImageAttachment?: string;
		bgImageRepeat?: string;
		bgImageRepeat_tablet?: string;
		bgImageRepeat_mobile?: string;
		bgImageSize?: string;
		bgImageSize_tablet?: string;
		bgImageSize_mobile?: string;
		bgImageCustomWidth?: number;
		bgImageCustomWidth_tablet?: number;
		bgImageCustomWidth_mobile?: number;
		bgImageCustomWidthUnit?: string;

		// Gradient settings (Normal)
		gradientColor?: string;
		gradientLocation?: number;
		gradientLocation_tablet?: number;
		gradientLocation_mobile?: number;
		gradientSecondColor?: string;
		gradientSecondLocation?: number;
		gradientSecondLocation_tablet?: number;
		gradientSecondLocation_mobile?: number;
		gradientType?: string; // 'linear' | 'radial'
		gradientAngle?: number;
		gradientAngle_tablet?: number;
		gradientAngle_mobile?: number;
		gradientPosition?: string;
		gradientPosition_tablet?: string;
		gradientPosition_mobile?: string;

		// Background - Hover state
		backgroundTypeHover?: string;
		backgroundColorHover?: string;
		backgroundImageHover?: ImageUploadValue;
		backgroundImageHover_tablet?: ImageUploadValue;
		backgroundImageHover_mobile?: ImageUploadValue;

		// Image sub-controls Hover
		bgImageResolutionHover?: string;
		bgImagePositionHover?: string;
		bgImagePositionHover_tablet?: string;
		bgImagePositionHover_mobile?: string;
		bgImageAttachmentHover?: string;
		bgImageRepeatHover?: string;
		bgImageRepeatHover_tablet?: string;
		bgImageRepeatHover_mobile?: string;
		bgImageSizeHover?: string;
		bgImageSizeHover_tablet?: string;
		bgImageSizeHover_mobile?: string;
		bgImageCustomWidthHover?: number;
		bgImageCustomWidthHover_tablet?: number;
		bgImageCustomWidthHover_mobile?: number;
		bgImageCustomWidthHoverUnit?: string;

		// Dynamic Tags for Background Image (Normal/Hover)
		bgImageDynamicTag?: string;
		bgImageDynamicTagHover?: string;

		// Gradient settings (Hover)
		gradientColorHover?: string;
		gradientLocationHover?: number;
		gradientLocationHover_tablet?: number;
		gradientLocationHover_mobile?: number;
		gradientSecondColorHover?: string;
		gradientSecondLocationHover?: number;
		gradientSecondLocationHover_tablet?: number;
		gradientSecondLocationHover_mobile?: number;
		gradientTypeHover?: string;
		gradientAngleHover?: number;
		gradientAngleHover_tablet?: number;
		gradientAngleHover_mobile?: number;
		gradientPositionHover?: string;
		gradientPositionHover_tablet?: string;
		gradientPositionHover_mobile?: string;

		// Background Transition
		bgTransitionDuration?: number;

		// Mask controls (Elementor common-base.php:L1077-L1302)
		maskSwitch?: boolean;
		maskShape?: string;
		maskImage?: { id?: number; url?: string };
		maskImage_tablet?: { id?: number; url?: string };
		maskImage_mobile?: { id?: number; url?: string };
		maskSize?: string;
		maskSize_tablet?: string;
		maskSize_mobile?: string;
		maskSizeScale?: number;
		maskSizeScale_tablet?: number;
		maskSizeScale_mobile?: number;
		maskSizeScaleUnit?: string;
		maskPosition?: string;
		maskPosition_tablet?: string;
		maskPosition_mobile?: string;
		maskPositionX?: number;
		maskPositionX_tablet?: number;
		maskPositionX_mobile?: number;
		maskPositionXUnit?: string;
		maskPositionY?: number;
		maskPositionY_tablet?: number;
		maskPositionY_mobile?: number;
		maskPositionYUnit?: string;
		maskRepeat?: string;
		maskRepeat_tablet?: string;
		maskRepeat_mobile?: string;

		// Responsive Visibility
		hideDesktop?: boolean;
		hideTablet?: boolean;
		hideMobile?: boolean;

		// Custom CSS
		customCSS?: string;

		// Custom Attributes (Elementor Pro feature)
		customAttributes?: string;
		// Dynamic Tag for Custom Attributes
		customAttributesDynamicTag?: string;

		[key: string]: unknown;
	};
	setAttributes: (attrs: Partial<AdvancedTabProps['attributes']>) => void;
}

import { getCurrentDeviceType, type DeviceType } from '@shared/utils/deviceType';

/**
 * Hook to sync with WordPress's responsive preview state
 */
function useWordPressDevice(): DeviceType {
	return useSelect((select) => getCurrentDeviceType(select), []);
}

/**
 * Responsive wrapper for DimensionsControl
 * Matches Elementor's layout: Label + responsive icon inline on left
 */
interface ResponsiveDimensionsControlProps {
	label: string;
	value: DimensionsConfig;
	valueTablet?: DimensionsConfig;
	valueMobile?: DimensionsConfig;
	onChange: (value: DimensionsConfig) => void;
	onChangeTablet: (value: DimensionsConfig) => void;
	onChangeMobile: (value: DimensionsConfig) => void;
	controlKey?: string;
}

function ResponsiveDimensionsControl({
	label,
	value,
	valueTablet,
	valueMobile,
	onChange,
	onChangeTablet,
	onChangeMobile,
	controlKey,
}: ResponsiveDimensionsControlProps) {
	const wpDevice = useWordPressDevice();
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	// Sync with WordPress device type
	useEffect(() => {
		setCurrentDevice(wpDevice);
	}, [wpDevice]);

	const normalizeDimensions = (val?: DimensionsConfig) => ({
		top: val?.top,
		right: val?.right,
		bottom: val?.bottom,
		left: val?.left,
	});

	const getCurrentValue = () => {
		switch (currentDevice) {
			case 'tablet':
				return valueTablet || {};
			case 'mobile':
				return valueMobile || {};
			default:
				return value || {};
		}
	};

	const handleChange = (newValues: { top?: string; right?: string; bottom?: string; left?: string }) => {
		const currentConfig =
			currentDevice === 'desktop' ? value : currentDevice === 'tablet' ? valueTablet : valueMobile;
		const unit = currentConfig?.unit || 'px';
		const linked = currentConfig?.linked ?? true;

		const config: DimensionsConfig = {
			...newValues,
			unit,
			linked,
		};

		switch (currentDevice) {
			case 'tablet':
				onChangeTablet(config);
				break;
			case 'mobile':
				onChangeMobile(config);
				break;
			default:
				onChange(config);
				break;
		}
	};

	const handleLinkedChange = (linked: boolean) => {
		const currentConfig = getCurrentValue();
		const newConfig = { ...currentConfig, linked };

		switch (currentDevice) {
			case 'tablet':
				onChangeTablet(newConfig);
				break;
			case 'mobile':
				onChangeMobile(newConfig);
				break;
			default:
				onChange(newConfig);
				break;
		}
	};

	return (
		<div className="elementor-control elementor-control-type-dimensions" style={{ marginBottom: '16px' }}>
			{/* Title row: Label + ResponsiveDropdownButton (left), UnitDropdown (right) */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '8px'
			}}>
				{/* Left side: Label + ResponsiveDropdownButton inline */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span style={{ fontWeight: 500, fontSize: '13px' }}>{label}</span>
					<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey={controlKey} />
				</div>

				{/* Right side: Unit Dropdown */}
				<UnitDropdownButton
					currentUnit={(getCurrentValue().unit || 'px') as any}
					onUnitChange={(unit) => {
						const currentConfig = getCurrentValue();
						const newConfig = { ...currentConfig, unit };
						switch (currentDevice) {
							case 'tablet':
								onChangeTablet(newConfig);
								break;
							case 'mobile':
								onChangeMobile(newConfig);
								break;
							default:
								onChange(newConfig);
								break;
						}
					}}
					availableUnits={['px', '%', 'em', 'rem', 'vw']}
				/>
			</div>

			{/* Input row: DimensionsControl without label or unit dropdown */}
			<DimensionsControl
				label=""
				values={normalizeDimensions(getCurrentValue())}
				onChange={handleChange}
				isLinked={getCurrentValue().linked}
				onLinkedChange={handleLinkedChange}
				availableUnits={[]} // Don't show unit dropdown in DimensionsControl
			/>
		</div>
	);
}

/**
 * Responsive wrapper for SelectControl
 * Matches Elementor's layout: Label + responsive icon inline on left
 */
interface ResponsiveSelectControlProps {
	label: string;
	value?: string;
	valueTablet?: string;
	valueMobile?: string;
	onChange: (value: string) => void;
	onChangeTablet: (value: string) => void;
	onChangeMobile: (value: string) => void;
	options: { label: string; value: string }[];
	controlKey?: string;
}

function ResponsiveSelectControl({
	label,
	value,
	valueTablet,
	valueMobile,
	onChange,
	onChangeTablet,
	onChangeMobile,
	options,
	controlKey,
}: ResponsiveSelectControlProps) {
	const wpDevice = useWordPressDevice();
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	// Sync with WordPress device type
	useEffect(() => {
		setCurrentDevice(wpDevice);
	}, [wpDevice]);

	const getCurrentValue = () => {
		switch (currentDevice) {
			case 'tablet':
				return valueTablet ?? value ?? '';
			case 'mobile':
				return valueMobile ?? valueTablet ?? value ?? '';
			default:
				return value ?? '';
		}
	};

	const handleChange = (newValue: string) => {
		switch (currentDevice) {
			case 'tablet':
				onChangeTablet(newValue);
				break;
			case 'mobile':
				onChangeMobile(newValue);
				break;
			default:
				onChange(newValue);
				break;
		}
	};

	return (
		<div className="elementor-control elementor-control-type-select" style={{ marginBottom: '16px' }}>
			{/* Elementor-style header: Label + Responsive Button inline */}
			<div
				className="elementor-control-content"
				style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
			>
				<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
					{label}
				</span>
				<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey={controlKey} />
			</div>
			<SelectControl value={getCurrentValue()} onChange={handleChange} options={options} __nextHasNoMarginBottom />
		</div>
	);
}





// Width options matching Elementor (common-base.php:L340-L345)
const WIDTH_OPTIONS = [
	{ label: __('Default', 'voxel-fse'), value: '' },
	{ label: __('Full Width', 'voxel-fse') + ' (100%)', value: 'inherit' },
	{ label: __('Inline', 'voxel-fse') + ' (auto)', value: 'auto' },
	{ label: __('Custom', 'voxel-fse'), value: 'initial' },
];


const POSITION_OPTIONS = [
	{ label: __('Default', 'voxel-fse'), value: '' },
	{ label: __('Absolute', 'voxel-fse'), value: 'absolute' },
	{ label: __('Fixed', 'voxel-fse'), value: 'fixed' },
];

// Mask shapes matching Elementor (common-base.php:L133-L215)
// Uses Elementor's built-in mask-shapes SVGs from their assets folder
const ELEMENTOR_ASSETS_URL = '/wp-content/plugins/elementor/assets/';
const MASK_SHAPES = [
	{ value: 'circle', title: __('Circle', 'voxel-fse') },
	{ value: 'oval-vertical', title: __('Oval Vertical', 'voxel-fse') },
	{ value: 'oval-horizontal', title: __('Oval Horizontal', 'voxel-fse') },
	{ value: 'pill-vertical', title: __('Pill Vertical', 'voxel-fse') },
	{ value: 'pill-horizontal', title: __('Pill Horizontal', 'voxel-fse') },
	{ value: 'triangle', title: __('Triangle', 'voxel-fse') },
	{ value: 'diamond', title: __('Diamond', 'voxel-fse') },
	{ value: 'pentagon', title: __('Pentagon', 'voxel-fse') },
	{ value: 'hexagon-vertical', title: __('Hexagon Vertical', 'voxel-fse') },
	{ value: 'hexagon-horizontal', title: __('Hexagon Horizontal', 'voxel-fse') },
	{ value: 'heptagon', title: __('Heptagon', 'voxel-fse') },
	{ value: 'octagon', title: __('Octagon', 'voxel-fse') },
	{ value: 'parallelogram-right', title: __('Parallelogram Right', 'voxel-fse') },
	{ value: 'parallelogram-left', title: __('Parallelogram Left', 'voxel-fse') },
	{ value: 'trapezoid-up', title: __('Trapezoid Up', 'voxel-fse') },
	{ value: 'trapezoid-down', title: __('Trapezoid Down', 'voxel-fse') },
	{ value: 'flower', title: __('Flower', 'voxel-fse') },
	{ value: 'sketch', title: __('Sketch', 'voxel-fse') },
	{ value: 'hexagon', title: __('Hexagon Donut', 'voxel-fse') },
	{ value: 'blob', title: __('Blob', 'voxel-fse') },
];

// Mask Size options (common-base.php:L1137-L1141)
const MASK_SIZE_OPTIONS = [
	{ label: __('Fit', 'voxel-fse'), value: 'contain' },
	{ label: __('Fill', 'voxel-fse'), value: 'cover' },
	{ label: __('Custom', 'voxel-fse'), value: 'custom' },
];

// Mask Position options (common-base.php:L1190-L1200)
const MASK_POSITION_OPTIONS = [
	{ label: __('Center Center', 'voxel-fse'), value: 'center center' },
	{ label: __('Center Left', 'voxel-fse'), value: 'center left' },
	{ label: __('Center Right', 'voxel-fse'), value: 'center right' },
	{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
	{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
	{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
	{ label: __('Bottom Center', 'voxel-fse'), value: 'bottom center' },
	{ label: __('Bottom Left', 'voxel-fse'), value: 'bottom left' },
	{ label: __('Bottom Right', 'voxel-fse'), value: 'bottom right' },
	{ label: __('Custom', 'voxel-fse'), value: 'custom' },
];

// Mask Repeat options (common-base.php:L1281-L1287)
const MASK_REPEAT_OPTIONS = [
	{ label: __('No-repeat', 'voxel-fse'), value: 'no-repeat' },
	{ label: __('Repeat', 'voxel-fse'), value: 'repeat' },
	{ label: __('Repeat-x', 'voxel-fse'), value: 'repeat-x' },
	{ label: __('Repeat-y', 'voxel-fse'), value: 'repeat-y' },
	{ label: __('Round', 'voxel-fse'), value: 'round' },
	{ label: __('Space', 'voxel-fse'), value: 'space' },
];

export default function AdvancedTab({ attributes, setAttributes }: AdvancedTabProps) {
	const wpDeviceType = useSelect((select) => getCurrentDeviceType(select), []);

	// Convert WordPress device type to our format (Desktop -> desktop)
	const wpDevice = wpDeviceType ? wpDeviceType.toLowerCase() as 'desktop' | 'tablet' | 'mobile' : 'desktop';

	// Sync local state with WordPress's device type
	const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>(wpDevice);

	// Update local state when WordPress device type changes
	useEffect(() => {
		if (wpDeviceType) {
			setCurrentDevice(wpDevice);
		}
	}, [wpDeviceType, wpDevice]);

	// Fetch media details for normal background image (for resolution selection)
	const normalBgImageMedia = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
			const imageId = attributes.backgroundImage?.id;
			return imageId ? (select('core') as any).getMedia(imageId) : null;
		},
		[attributes.backgroundImage?.id]
	);

	// Fetch media details for hover background image (for resolution selection)
	const hoverBgImageMedia = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
			const imageId = attributes.backgroundImageHover?.id;
			return imageId ? (select('core') as any).getMedia(imageId) : null;
		},
		[attributes.backgroundImageHover?.id]
	);

	const isPositionSet = attributes.position && attributes.position !== '';
	const showCustomWidth = attributes.elementWidth === 'initial';
	const showFlexOrderCustom = attributes.flexOrder === 'custom';
	const showFlexGrowShrink = attributes.flexSize === 'custom';

	// Helper to get responsive value for current device
	const getResponsiveValue = <T,>(baseName: keyof typeof attributes): T | undefined => {
		if (currentDevice === 'desktop') {
			return attributes[baseName] as T | undefined;
		}
		const deviceAttr = `${String(baseName)}_${currentDevice}` as keyof typeof attributes;
		const value = attributes[deviceAttr] as T | undefined;
		// If value is undefined, inherit from desktop (or tablet for mobile)
		if (value === undefined) {
			if (currentDevice === 'mobile') {
				const tabletValue = attributes[`${String(baseName)}_tablet` as keyof typeof attributes] as T | undefined;
				return tabletValue !== undefined ? tabletValue : attributes[baseName] as T | undefined;
			}
			return attributes[baseName] as T | undefined;
		}
		return value;
	};

	// Helper to set responsive value for current device
	const setResponsiveValue = <T,>(baseName: string, value: T | undefined) => {
		if (currentDevice === 'desktop') {
			setAttributes({ [baseName]: value });
		} else {
			setAttributes({ [`${baseName}_${currentDevice}`]: value });
		}
	};

	return (
		<AccordionPanelGroup
			defaultPanel="layout"
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="advancedOpenPanel"
		>
			{/* LAYOUT SECTION - Elementor _section_style (L288-L818) */}
			<AccordionPanel id="layout" title={__('Layout', 'voxel-fse')}>
				{/* Margin (responsive) - L307-L317 */}
				<ResponsiveDimensionsControl
					label={__('Margin', 'voxel-fse')}
					value={attributes.blockMargin || {}}
					valueTablet={attributes.blockMargin_tablet}
					valueMobile={attributes.blockMargin_mobile}
					onChange={(value) => setAttributes({ blockMargin: value })}
					onChangeTablet={(value) => setAttributes({ blockMargin_tablet: value })}
					onChangeMobile={(value) => setAttributes({ blockMargin_mobile: value })}
					controlKey="blockMargin"
				/>

				{/* Padding (responsive) - L319-L329 */}
				<ResponsiveDimensionsControl
					label={__('Padding', 'voxel-fse')}
					value={attributes.blockPadding || {}}
					valueTablet={attributes.blockPadding_tablet}
					valueMobile={attributes.blockPadding_mobile}
					onChange={(value) => setAttributes({ blockPadding: value })}
					onChangeTablet={(value) => setAttributes({ blockPadding_tablet: value })}
					onChangeMobile={(value) => setAttributes({ blockPadding_mobile: value })}
					controlKey="blockPadding"
				/>

				{/* Width (responsive) - L334-L354 */}
				<ResponsiveSelectControl
					label={__('Width', 'voxel-fse')}
					value={attributes.elementWidth}
					valueTablet={attributes.elementWidth_tablet}
					valueMobile={attributes.elementWidth_mobile}
					onChange={(value) => setAttributes({ elementWidth: value })}
					onChangeTablet={(value) => setAttributes({ elementWidth_tablet: value })}
					onChangeMobile={(value) => setAttributes({ elementWidth_mobile: value })}
					options={WIDTH_OPTIONS}
					controlKey="elementWidth"
				/>

				{/* Custom Width (responsive) - L356-L375 - Conditional on width=initial */}
				{showCustomWidth && (
					<ResponsiveRangeControl
						label={__('Custom Width', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="elementCustomWidth"
						min={0}
						max={1000}
						availableUnits={['px', '%', 'em', 'rem', 'vw']}
						unitAttributeName="elementCustomWidthUnit"
					/>
				)}

				{/* Flexbox Item Heading - L475-L499 */}
				<SectionHeading label={__('Flexbox Item', 'voxel-fse')} />

				{/* Align Self (responsive) - flex-item.php:L50-L77 */}
				<div style={{ marginBottom: '16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Align Self', 'voxel-fse')}</span>
						<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="flexAlignSelf" />
					</div>
					<ChooseControl
						label=""
						value={getResponsiveValue<string>('flexAlignSelf')}
						onChange={(value) => setResponsiveValue('flexAlignSelf', value)}
						options={[
							{ value: 'flex-start', icon: 'eicon-align-start-v', title: __('Start', 'voxel-fse') },
							{ value: 'center', icon: 'eicon-align-center-v', title: __('Center', 'voxel-fse') },
							{ value: 'flex-end', icon: 'eicon-align-end-v', title: __('End', 'voxel-fse') },
							{ value: 'stretch', icon: 'eicon-align-stretch-v', title: __('Stretch', 'voxel-fse') },
						]}
					/>
				</div>

				{/* Order (responsive) - flex-item.php:L79-L110 */}
				<div style={{ marginBottom: '16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Order', 'voxel-fse')}</span>
						<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="flexOrder" />
					</div>
					<ChooseControl
						label=""
						value={getResponsiveValue<string>('flexOrder')}
						onChange={(value) => setResponsiveValue('flexOrder', value)}
						options={[
							{ value: 'start', icon: 'eicon-order-start', title: __('Start', 'voxel-fse') },
							{ value: 'end', icon: 'eicon-order-end', title: __('End', 'voxel-fse') },
							{ value: 'custom', icon: 'eicon-ellipsis-v', title: __('Custom', 'voxel-fse') },
						]}
					/>
				</div>

				{/* Order Custom (responsive) - flex-item.php:L112-L122 */}
				{showFlexOrderCustom && (
					<ResponsiveRangeControl
						label={__('Custom Order', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="flexOrderCustom"
						min={-10}
						max={10}
						step={1}
					/>
				)}

				{/* Size (responsive) - flex-item.php:L124-L156 */}
				<div style={{ marginBottom: '16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Size', 'voxel-fse')}</span>
						<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="flexSize" />
					</div>
					<ChooseControl
						label=""
						value={getResponsiveValue<string>('flexSize')}
						onChange={(value) => setResponsiveValue('flexSize', value)}
						options={[
							{ value: 'none', icon: 'eicon-ban', title: __('None', 'voxel-fse') },
							{ value: 'grow', icon: 'eicon-grow', title: __('Grow', 'voxel-fse') },
							{ value: 'shrink', icon: 'eicon-shrink', title: __('Shrink', 'voxel-fse') },
							{ value: 'custom', icon: 'eicon-ellipsis-v', title: __('Custom', 'voxel-fse') },
						]}
					/>
				</div>

				{/* Flex Grow (responsive) - flex-item.php:L158-L170 */}
				{showFlexGrowShrink && (
					<ResponsiveRangeControl
						label={__('Flex Grow', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="flexGrow"
						min={0}
						max={10}
						step={1}
					/>
				)}

				{/* Flex Shrink (responsive) - flex-item.php:L172-L184 */}
				{showFlexGrowShrink && (
					<ResponsiveRangeControl
						label={__('Flex Shrink', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="flexShrink"
						min={0}
						max={10}
						step={1}
					/>
				)}

				{/* Grid Item Heading - common-base.php L377-L473 */}
				<SectionHeading label={__('Grid Item', 'voxel-fse')} />

				{/* Column Span (responsive) */}
				<div style={{ marginBottom: '16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Column Span', 'voxel-fse')}</span>
						<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="gridColumn" />
					</div>
					<ChooseControl
						label=""
						value={getResponsiveValue<string>('gridColumn')}
						onChange={(value) => setResponsiveValue('gridColumn', value)}
						options={[
							{ value: '', icon: 'eicon-ban', title: __('None', 'voxel-fse') },
							{ value: 'custom', icon: 'eicon-ellipsis-v', title: __('Custom', 'voxel-fse') },
						]}
					/>
				</div>

				{/* Column Custom (responsive) - shown when Column Span is 'custom' */}
				{attributes.gridColumn === 'custom' && (
					<ResponsiveTextControl
						label={__('Custom Column', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="gridColumnCustom"
						placeholder="1 / -1"
					/>
				)}

				{/* Row Span (responsive) */}
				<div style={{ marginBottom: '16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Row Span', 'voxel-fse')}</span>
						<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="gridRow" />
					</div>
					<ChooseControl
						label=""
						value={getResponsiveValue<string>('gridRow')}
						onChange={(value) => setResponsiveValue('gridRow', value)}
						options={[
							{ value: '', icon: 'eicon-ban', title: __('None', 'voxel-fse') },
							{ value: 'custom', icon: 'eicon-ellipsis-v', title: __('Custom', 'voxel-fse') },
						]}
					/>
				</div>

				{/* Row Custom (responsive) - shown when Row Span is 'custom' */}
				{attributes.gridRow === 'custom' && (
					<ResponsiveTextControl
						label={__('Custom Row', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="gridRowCustom"
						placeholder="1 / -1"
					/>
				)}

				{/* Position - L551-L566 */}
				<SelectControl
					label={__('Position', 'voxel-fse')}
					value={attributes.position || ''}
					onChange={(value: string) => setAttributes({ position: value })}
					options={POSITION_OPTIONS}
					__nextHasNoMarginBottom
				/>

				{/* Position Warning - L537-L549 */}
				{isPositionSet && (
					<div
						style={{
							padding: '8px 12px',
							backgroundColor: '#fff3cd',
							borderLeft: '4px solid #ffc107',
							marginBottom: '16px',
							fontSize: '12px',
						}}
					>
						<strong>{__('Please note!', 'voxel-fse')}</strong>
						<p style={{ margin: '4px 0 0' }}>
							{__(
								'Custom positioning is not considered best practice for responsive web design and should not be used too frequently.',
								'voxel-fse'
							)}
						</p>
					</div>
				)}

				{/* Horizontal Orientation - L571-L594 */}
				{isPositionSet && (
					<ChooseControl
						label={__('Horizontal Orientation', 'voxel-fse')}
						value={attributes.offsetOrientationH || 'start'}
						onChange={(value) => setAttributes({ offsetOrientationH: value })}
						options={[
							{ value: 'start', icon: 'eicon-h-align-left', title: __('Left', 'voxel-fse') },
							{ value: 'end', icon: 'eicon-h-align-right', title: __('Right', 'voxel-fse') },
						]}
					/>
				)}

				{/* Offset X (start) - L596-L632 */}
				{isPositionSet && attributes.offsetOrientationH !== 'end' && (
					<ResponsiveRangeControl
						label={__('Offset', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="offsetX"
						min={-1000}
						max={1000}
						availableUnits={['px', '%', 'em', 'rem', 'vw', 'vh']}
						unitAttributeName="offsetXUnit"
					/>
				)}

				{/* Offset X End - L634-L670 */}
				{isPositionSet && attributes.offsetOrientationH === 'end' && (
					<ResponsiveRangeControl
						label={__('Offset', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="offsetXEnd"
						min={-1000}
						max={1000}
						availableUnits={['px', '%', 'em', 'rem', 'vw', 'vh']}
						unitAttributeName="offsetXEndUnit"
					/>
				)}

				{/* Vertical Orientation - L672-L694 */}
				{isPositionSet && (
					<ChooseControl
						label={__('Vertical Orientation', 'voxel-fse')}
						value={attributes.offsetOrientationV || 'start'}
						onChange={(value) => setAttributes({ offsetOrientationV: value })}
						options={[
							{ value: 'start', icon: 'eicon-v-align-top', title: __('Top', 'voxel-fse') },
							{ value: 'end', icon: 'eicon-v-align-bottom', title: __('Bottom', 'voxel-fse') },
						]}
					/>
				)}

				{/* Offset Y (start) - L696-L731 */}
				{isPositionSet && attributes.offsetOrientationV !== 'end' && (
					<ResponsiveRangeControl
						label={__('Offset', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="offsetY"
						min={-1000}
						max={1000}
						availableUnits={['px', '%', 'em', 'rem', 'vh', 'vw']}
						unitAttributeName="offsetYUnit"
					/>
				)}

				{/* Offset Y End - L733-L768 */}
				{isPositionSet && attributes.offsetOrientationV === 'end' && (
					<ResponsiveRangeControl
						label={__('Offset', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="offsetYEnd"
						min={-1000}
						max={1000}
						availableUnits={['px', '%', 'em', 'rem', 'vh', 'vw']}
						unitAttributeName="offsetYEndUnit"
					/>
				)}

				{/* Z-Index (responsive) - L770-L779 - with Voxel dynamic tags support */}
				<ResponsiveTextControl
					label={__('Z-Index', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="zIndex"
					enableDynamicTags={true}
					controlKey="zIndex"
				/>

				{/* CSS ID - L781-L797 - with Voxel dynamic tags support */}
				<DynamicTagTextControl
					label={__('CSS ID', 'voxel-fse')}
					value={attributes.elementId || ''}
					onChange={(value: string) => setAttributes({ elementId: value })}
					help={__('Add your custom id WITHOUT the Pound key. e.g: my-id', 'voxel-fse')}
					placeholder="my-id"
					context="post"
				/>

				{/* CSS Classes - L799-L814 - with Voxel dynamic tags support */}
				<DynamicTagTextControl
					label={__('CSS Classes', 'voxel-fse')}
					value={attributes.customClasses || ''}
					onChange={(value: string) => setAttributes({ customClasses: value })}
					help={__('Add your custom class WITHOUT the dot. e.g: my-class', 'voxel-fse')}
					placeholder="my-class"
					context="post"
				/>
			</AccordionPanel>

			{/* TRANSFORM SECTION - Elementor Pro Advanced Tab */}
			<AccordionPanel id="transform" title={__('Transform', 'voxel-fse')}>
				<TransformControls attributes={attributes} setAttributes={setAttributes} />
			</AccordionPanel>

			{/* MOTION EFFECTS SECTION - Elementor Pro Advanced Tab */}
			<AccordionPanel id="motion-effects" title={__('Motion Effects', 'voxel-fse')}>
				<MotionEffectsControls attributes={attributes} setAttributes={setAttributes} />
			</AccordionPanel>

			{/* BACKGROUND SECTION */}
			<AccordionPanel id="background" title={__('Background', 'voxel-fse')}>
				<StateTabPanel
					attributeName="backgroundActiveTab"
					attributes={attributes}
					setAttributes={setAttributes}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) => {
						const isHover = tab.name === 'hover';
						const bgType = isHover ? attributes.backgroundTypeHover : attributes.backgroundType;
						const currentImage = isHover ? attributes.backgroundImageHover : attributes.backgroundImage;
						const currentGradientType = isHover ? attributes.gradientTypeHover : attributes.gradientType;

						return (
							<>
								{/* Background Type Toggle: Classic | Gradient */}
								<ChooseControl
									label={__('Background Type', 'voxel-fse')}
									value={bgType || 'classic'}
									onChange={(value) => {
										if (isHover) {
											setAttributes({ backgroundTypeHover: value });
										} else {
											setAttributes({ backgroundType: value });
										}
									}}
									options={[
										{ value: 'classic', icon: 'eicon-paint-brush', title: __('Classic', 'voxel-fse') },
										{ value: 'gradient', icon: 'eicon-barcode', title: __('Gradient', 'voxel-fse') },
									]}
									variant="inline"
								/>

								{/* === CLASSIC MODE === */}
								{(bgType === 'classic' || !bgType) && (
									<>
										{/* Color */}
										<ColorPickerControl
											label={__('Color', 'voxel-fse')}
											value={isHover ? attributes.backgroundColorHover : attributes.backgroundColor}
											onChange={(value) => {
												if (isHover) {
													setAttributes({ backgroundColorHover: value });
												} else {
													setAttributes({ backgroundColor: value });
												}
											}}
										/>

										{/* Image */}
										<ImageUploadControl
											label={__('Image', 'voxel-fse')}
											value={isHover ? attributes.backgroundImageHover : attributes.backgroundImage}
											valueTablet={isHover ? attributes.backgroundImageHover_tablet : attributes.backgroundImage_tablet}
											valueMobile={isHover ? attributes.backgroundImageHover_mobile : attributes.backgroundImage_mobile}
											onChange={(value) => {
												if (isHover) {
													setAttributes({ backgroundImageHover: value });
												} else {
													setAttributes({ backgroundImage: value });
												}
											}}
											onChangeTablet={(value) => {
												if (isHover) {
													setAttributes({ backgroundImageHover_tablet: value });
												} else {
													setAttributes({ backgroundImage_tablet: value });
												}
											}}
											onChangeMobile={(value) => {
												if (isHover) {
													setAttributes({ backgroundImageHover_mobile: value });
												} else {
													setAttributes({ backgroundImage_mobile: value });
												}
											}}
											responsive
											enableDynamicTags
											dynamicTagValue={
												isHover
													? attributes.bgImageDynamicTagHover
													: attributes.bgImageDynamicTag
											}
											onDynamicTagChange={(value) => {
												if (isHover) {
													setAttributes({ bgImageDynamicTagHover: value });
												} else {
													setAttributes({ bgImageDynamicTag: value });
												}
											}}
										/>

										{/* Image sub-controls - only show when image is set */}
										{currentImage?.url && (
											<>
												{/* Image Resolution */}
												<SelectControl
													label={__('Image Resolution', 'voxel-fse')}
													value={isHover ? attributes.bgImageResolutionHover : attributes.bgImageResolution}
													options={getImageSizeOptions()}
													onChange={(value: string) => {
														// Get the appropriate media object for this state
														const media = isHover ? hoverBgImageMedia : normalBgImageMedia;
														const currentImg = isHover ? attributes.backgroundImageHover : attributes.backgroundImage;

														// Build updates object
														const updates: Record<string, any> = {};

														// Set the resolution attribute
														if (isHover) {
															updates.bgImageResolutionHover = value;
														} else {
															updates.bgImageResolution = value;
														}

														// Update the image URL if media details are available
														if (media && media.media_details && media.media_details.sizes) {
															let newUrl: string | undefined;

															if (media.media_details.sizes[value]) {
																newUrl = media.media_details.sizes[value].source_url;
															} else if (value === 'full' && media.source_url) {
																newUrl = media.source_url;
															}

															if (newUrl) {
																if (isHover) {
																	updates.backgroundImageHover = {
																		...currentImg,
																		url: newUrl,
																	};
																} else {
																	updates.backgroundImage = {
																		...currentImg,
																		url: newUrl,
																	};
																}
															}
														}

														setAttributes(updates);
													}}
													help={__("Image size settings don't apply to Dynamic Images.", 'voxel-fse')}
													__nextHasNoMarginBottom
												/>

												{/* Position (responsive) */}
												<div style={{ marginTop: '16px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
														<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Position', 'voxel-fse')}</span>
														<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="bgImagePosition" />
													</div>
													<SelectControl
														value={(() => {
															if (isHover) {
																if (currentDevice === 'tablet') return attributes.bgImagePositionHover_tablet || '';
																if (currentDevice === 'mobile') return attributes.bgImagePositionHover_mobile || '';
																return attributes.bgImagePositionHover || '';
															}
															if (currentDevice === 'tablet') return attributes.bgImagePosition_tablet || '';
															if (currentDevice === 'mobile') return attributes.bgImagePosition_mobile || '';
															return attributes.bgImagePosition || '';
														})()}
														options={[
															{ label: __('Default', 'voxel-fse'), value: '' },
															{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
															{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
															{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
															{ label: __('Center Left', 'voxel-fse'), value: 'center left' },
															{ label: __('Center Center', 'voxel-fse'), value: 'center center' },
															{ label: __('Center Right', 'voxel-fse'), value: 'center right' },
															{ label: __('Bottom Left', 'voxel-fse'), value: 'bottom left' },
															{ label: __('Bottom Center', 'voxel-fse'), value: 'bottom center' },
															{ label: __('Bottom Right', 'voxel-fse'), value: 'bottom right' },
														]}
														onChange={(value: string) => {
															if (isHover) {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImagePositionHover_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImagePositionHover_mobile: value });
																} else {
																	setAttributes({ bgImagePositionHover: value });
																}
															} else {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImagePosition_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImagePosition_mobile: value });
																} else {
																	setAttributes({ bgImagePosition: value });
																}
															}
														}}
														__nextHasNoMarginBottom
													/>
												</div>

												{/* Attachment */}
												<div style={{ marginTop: '16px' }}>
													<SelectControl
														label={__('Attachment', 'voxel-fse')}
														value={isHover ? attributes.bgImageAttachmentHover : attributes.bgImageAttachment}
														options={[
															{ label: __('Default', 'voxel-fse'), value: '' },
															{ label: __('Scroll', 'voxel-fse'), value: 'scroll' },
															{ label: __('Fixed', 'voxel-fse'), value: 'fixed' },
														]}
														onChange={(value: string) => {
															if (isHover) {
																setAttributes({ bgImageAttachmentHover: value });
															} else {
																setAttributes({ bgImageAttachment: value });
															}
														}}
														__nextHasNoMarginBottom
													/>
												</div>

												{/* Repeat (responsive) */}
												<div style={{ marginTop: '16px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
														<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Repeat', 'voxel-fse')}</span>
														<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="bgImageRepeat" />
													</div>
													<SelectControl
														value={(() => {
															if (isHover) {
																if (currentDevice === 'tablet') return attributes.bgImageRepeatHover_tablet || '';
																if (currentDevice === 'mobile') return attributes.bgImageRepeatHover_mobile || '';
																return attributes.bgImageRepeatHover || '';
															}
															if (currentDevice === 'tablet') return attributes.bgImageRepeat_tablet || '';
															if (currentDevice === 'mobile') return attributes.bgImageRepeat_mobile || '';
															return attributes.bgImageRepeat || '';
														})()}
														options={[
															{ label: __('Default', 'voxel-fse'), value: '' },
															{ label: __('No-repeat', 'voxel-fse'), value: 'no-repeat' },
															{ label: __('Repeat', 'voxel-fse'), value: 'repeat' },
															{ label: __('Repeat-x', 'voxel-fse'), value: 'repeat-x' },
															{ label: __('Repeat-y', 'voxel-fse'), value: 'repeat-y' },
														]}
														onChange={(value: string) => {
															if (isHover) {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImageRepeatHover_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImageRepeatHover_mobile: value });
																} else {
																	setAttributes({ bgImageRepeatHover: value });
																}
															} else {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImageRepeat_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImageRepeat_mobile: value });
																} else {
																	setAttributes({ bgImageRepeat: value });
																}
															}
														}}
														__nextHasNoMarginBottom
													/>
												</div>

												{/* Display Size (responsive) */}
												<div style={{ marginTop: '16px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
														<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Display Size', 'voxel-fse')}</span>
														<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="bgImageSize" />
													</div>
													<SelectControl
														value={(() => {
															if (isHover) {
																if (currentDevice === 'tablet') return attributes.bgImageSizeHover_tablet || '';
																if (currentDevice === 'mobile') return attributes.bgImageSizeHover_mobile || '';
																return attributes.bgImageSizeHover || '';
															}
															if (currentDevice === 'tablet') return attributes.bgImageSize_tablet || '';
															if (currentDevice === 'mobile') return attributes.bgImageSize_mobile || '';
															return attributes.bgImageSize || '';
														})()}
														options={[
															{ label: __('Default', 'voxel-fse'), value: '' },
															{ label: __('Auto', 'voxel-fse'), value: 'auto' },
															{ label: __('Cover', 'voxel-fse'), value: 'cover' },
															{ label: __('Contain', 'voxel-fse'), value: 'contain' },
															{ label: __('Custom', 'voxel-fse'), value: 'custom' },
														]}
														onChange={(value: string) => {
															if (isHover) {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImageSizeHover_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImageSizeHover_mobile: value });
																} else {
																	setAttributes({ bgImageSizeHover: value });
																}
															} else {
																if (currentDevice === 'tablet') {
																	setAttributes({ bgImageSize_tablet: value });
																} else if (currentDevice === 'mobile') {
																	setAttributes({ bgImageSize_mobile: value });
																} else {
																	setAttributes({ bgImageSize: value });
																}
															}
														}}
														__nextHasNoMarginBottom
													/>
												</div>

												{/* Custom Width - show when Display Size = custom */}
												{(() => {
													const currentSize = (() => {
														if (isHover) {
															if (currentDevice === 'tablet') return attributes.bgImageSizeHover_tablet;
															if (currentDevice === 'mobile') return attributes.bgImageSizeHover_mobile;
															return attributes.bgImageSizeHover;
														}
														if (currentDevice === 'tablet') return attributes.bgImageSize_tablet;
														if (currentDevice === 'mobile') return attributes.bgImageSize_mobile;
														return attributes.bgImageSize;
													})();
													if (currentSize === 'custom') {
														return (
															<ResponsiveRangeControl
																label={__('Width', 'voxel-fse')}
																attributes={attributes}
																setAttributes={setAttributes}
																attributeBaseName={isHover ? 'bgImageCustomWidthHover' : 'bgImageCustomWidth'}
																min={0}
																max={200}
																availableUnits={['%', 'px', 'em', 'vw']}
																unitAttributeName={isHover ? 'bgImageCustomWidthHoverUnit' : 'bgImageCustomWidthUnit'}
															/>
														);
													}
													return null;
												})()}
											</>
										)}
									</>
								)}

								{/* === GRADIENT MODE === */}
								{bgType === 'gradient' && (
									<>
										{/* Gradient Info Box */}
										<div
											style={{
												padding: '12px',
												backgroundColor: '#fffbeb',
												borderLeft: '4px solid #f59e0b',
												marginBottom: '16px',
												fontSize: '12px',
												fontStyle: 'italic',
												color: '#92400e',
											}}
										>
											{__('Set locations and angle for each breakpoint to ensure the gradient adapts to different screen sizes.', 'voxel-fse')}
										</div>

										{/* First Color */}
										<ColorPickerControl
											label={__('Color', 'voxel-fse')}
											value={isHover ? attributes.gradientColorHover : attributes.gradientColor}
											onChange={(value) => {
												if (isHover) {
													setAttributes({ gradientColorHover: value });
												} else {
													setAttributes({ gradientColor: value });
												}
											}}
										/>

										{/* First Location */}
										<ResponsiveRangeControl
											label={__('Location', 'voxel-fse')}
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={isHover ? 'gradientLocationHover' : 'gradientLocation'}
											min={0}
											max={100}
											availableUnits={['%']}
										/>

										{/* Second Color */}
										<ColorPickerControl
											label={__('Second Color', 'voxel-fse')}
											value={isHover ? attributes.gradientSecondColorHover : attributes.gradientSecondColor}
											onChange={(value) => {
												if (isHover) {
													setAttributes({ gradientSecondColorHover: value });
												} else {
													setAttributes({ gradientSecondColor: value });
												}
											}}
										/>

										{/* Second Location */}
										<ResponsiveRangeControl
											label={__('Location', 'voxel-fse')}
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={isHover ? 'gradientSecondLocationHover' : 'gradientSecondLocation'}
											min={0}
											max={100}
											availableUnits={['%']}
										/>

										{/* Type */}
										<SelectControl
											label={__('Type', 'voxel-fse')}
											value={currentGradientType || 'linear'}
											options={[
												{ label: __('Linear', 'voxel-fse'), value: 'linear' },
												{ label: __('Radial', 'voxel-fse'), value: 'radial' },
											]}
											onChange={(value: string) => {
												if (isHover) {
													setAttributes({ gradientTypeHover: value });
												} else {
													setAttributes({ gradientType: value });
												}
											}}
											__nextHasNoMarginBottom
										/>

										{/* Angle (for Linear) */}
										{(currentGradientType === 'linear' || !currentGradientType) && (
											<ResponsiveRangeControl
												label={__('Angle', 'voxel-fse')}
												attributes={attributes}
												setAttributes={setAttributes}
												attributeBaseName={isHover ? 'gradientAngleHover' : 'gradientAngle'}
												min={0}
												max={360}
												availableUnits={['deg']}
											/>
										)}

										{/* Position (for Radial) */}
										{currentGradientType === 'radial' && (
											<div style={{ marginTop: '16px' }}>
												<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
													<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Position', 'voxel-fse')}</span>
													<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} controlKey="gradientPosition" />
												</div>
												<SelectControl
													value={(() => {
														if (isHover) {
															if (currentDevice === 'tablet') return attributes.gradientPositionHover_tablet || 'center center';
															if (currentDevice === 'mobile') return attributes.gradientPositionHover_mobile || 'center center';
															return attributes.gradientPositionHover || 'center center';
														}
														if (currentDevice === 'tablet') return attributes.gradientPosition_tablet || 'center center';
														if (currentDevice === 'mobile') return attributes.gradientPosition_mobile || 'center center';
														return attributes.gradientPosition || 'center center';
													})()}
													options={[
														{ label: __('Center Center', 'voxel-fse'), value: 'center center' },
														{ label: __('Center Left', 'voxel-fse'), value: 'center left' },
														{ label: __('Center Right', 'voxel-fse'), value: 'center right' },
														{ label: __('Top Center', 'voxel-fse'), value: 'top center' },
														{ label: __('Top Left', 'voxel-fse'), value: 'top left' },
														{ label: __('Top Right', 'voxel-fse'), value: 'top right' },
														{ label: __('Bottom Center', 'voxel-fse'), value: 'bottom center' },
														{ label: __('Bottom Left', 'voxel-fse'), value: 'bottom left' },
														{ label: __('Bottom Right', 'voxel-fse'), value: 'bottom right' },
													]}
													onChange={(value: string) => {
														if (isHover) {
															if (currentDevice === 'tablet') {
																setAttributes({ gradientPositionHover_tablet: value });
															} else if (currentDevice === 'mobile') {
																setAttributes({ gradientPositionHover_mobile: value });
															} else {
																setAttributes({ gradientPositionHover: value });
															}
														} else {
															if (currentDevice === 'tablet') {
																setAttributes({ gradientPosition_tablet: value });
															} else if (currentDevice === 'mobile') {
																setAttributes({ gradientPosition_mobile: value });
															} else {
																setAttributes({ gradientPosition: value });
															}
														}
													}}
													__nextHasNoMarginBottom
												/>
											</div>
										)}
									</>
								)}

								{/* Transition Duration - Only show in Hover tab */}
								{isHover && (
									<div style={{ marginTop: '16px' }}>
										<RangeControl
											label={__('Transition Duration (s)', 'voxel-fse')}
											value={attributes.bgTransitionDuration ?? 0.3}
											onChange={(value: number | undefined) =>
												setAttributes({ bgTransitionDuration: value ?? 0.3 })
											}
											min={0}
											max={3}
											step={0.1}
										/>
									</div>
								)}
							</>
						);
					}}
				</StateTabPanel>
			</AccordionPanel>

			{/* MASK SECTION (Elementor common-base.php:L1077-L1302) */}
			<AccordionPanel id="mask" title={__('Mask', 'voxel-fse')}>
				{/* Enable Mask Switch */}
				<ToggleControl
					label={__('Mask', 'voxel-fse')}
					checked={!!attributes.maskSwitch}
					onChange={(value: boolean) => setAttributes({ maskSwitch: value })}
				/>

				{/* Mask Controls - Only show when enabled */}
				{attributes.maskSwitch && (
					<>
						{/* Mask Shape Selection (4-column grid) - Toggle behavior: click to select, click again to deselect */}
						<div style={{ marginTop: '16px' }}>
							<label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', textTransform: 'capitalize', color: 'rgb(30, 30, 30)' }}>
								{__('Shape', 'voxel-fse')}
							</label>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(4, 1fr)',
									gap: '8px',
								}}
							>
								{MASK_SHAPES.map((shape) => (
									<button
										key={shape.value}
										type="button"
										title={shape.title}
										onClick={() => {
											// Toggle behavior: if already selected, deselect (set to empty string)
											if (attributes.maskShape === shape.value) {
												setAttributes({ maskShape: '' });
											} else {
												setAttributes({ maskShape: shape.value });
											}
										}}
										style={{
											width: '100%',
											aspectRatio: '1 / 1',
											padding: '4px',
											border: attributes.maskShape === shape.value ? '2px solid var(--vxfse-accent-color, #3858e9)' : '1px solid #ddd',
											borderRadius: '4px',
											backgroundColor: attributes.maskShape === shape.value ? 'color-mix(in srgb, var(--vxfse-accent-color, #3858e9) 10%, #fff)' : '#fff',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s ease',
										}}
									>
										<img
											src={`${ELEMENTOR_ASSETS_URL}mask-shapes/${shape.value}.svg`}
											alt={shape.title}
											style={{ width: '100%', height: '100%', objectFit: 'contain' }}
										/>
									</button>
								))}
							</div>
						</div>

						{/* Custom Mask Image (responsive) */}
						<div style={{ marginTop: '16px' }}>
							<ImageUploadControl
								label={__('Custom Mask', 'voxel-fse')}
								value={attributes.maskImage}
								valueTablet={attributes.maskImage_tablet}
								valueMobile={attributes.maskImage_mobile}
								onChange={(v) => setAttributes({ maskImage: v, maskShape: '' })}
								onChangeTablet={(v) => setAttributes({ maskImage_tablet: v })}
								onChangeMobile={(v) => setAttributes({ maskImage_mobile: v })}
								responsive
								buttons={[
									{ label: __('Choose Image', 'voxel-fse'), allowedTypes: ['image'] },
									{ label: __('Choose SVG', 'voxel-fse'), allowedTypes: ['image/svg+xml'] },
								]}
							/>
						</div>

						{/* Mask Size (responsive) */}
						<div style={{ marginTop: '16px' }}>
							<ResponsiveControl
								label={__('Size', 'voxel-fse')}
								currentDevice={currentDevice}
								onDeviceChange={setCurrentDevice}
							>
								<SelectControl
									value={
										currentDevice === 'desktop'
											? attributes.maskSize || 'contain'
											: currentDevice === 'tablet'
												? attributes.maskSize_tablet || ''
												: attributes.maskSize_mobile || ''
									}
									options={MASK_SIZE_OPTIONS}
									onChange={(value: string) => {
										if (currentDevice === 'desktop') {
											setAttributes({ maskSize: value });
										} else if (currentDevice === 'tablet') {
											setAttributes({ maskSize_tablet: value });
										} else {
											setAttributes({ maskSize_mobile: value });
										}
									}}
									__nextHasNoMarginBottom
								/>
							</ResponsiveControl>
						</div>

						{/* Custom Size Scale - Show only when Size is 'custom' */}
						{(attributes.maskSize === 'custom' ||
							(currentDevice === 'tablet' && attributes.maskSize_tablet === 'custom') ||
							(currentDevice === 'mobile' && attributes.maskSize_mobile === 'custom')) && (
								<div style={{ marginTop: '16px' }}>
									<ResponsiveRangeControl
										label={__('Scale', 'voxel-fse')}
										attributeBaseName="maskSizeScale"
										attributes={attributes}
										setAttributes={setAttributes}
										min={0}
										max={200}
										step={1}
										units={['%', 'px', 'vw']}
										unitAttributeName="maskSizeScaleUnit"
									/>
								</div>
							)}

						{/* Mask Position (responsive) */}
						<div style={{ marginTop: '16px' }}>
							<ResponsiveControl
								label={__('Position', 'voxel-fse')}
								currentDevice={currentDevice}
								onDeviceChange={setCurrentDevice}
							>
								<SelectControl
									value={
										currentDevice === 'desktop'
											? attributes.maskPosition || 'center center'
											: currentDevice === 'tablet'
												? attributes.maskPosition_tablet || ''
												: attributes.maskPosition_mobile || ''
									}
									options={MASK_POSITION_OPTIONS}
									onChange={(value: string) => {
										if (currentDevice === 'desktop') {
											setAttributes({ maskPosition: value });
										} else if (currentDevice === 'tablet') {
											setAttributes({ maskPosition_tablet: value });
										} else {
											setAttributes({ maskPosition_mobile: value });
										}
									}}
									__nextHasNoMarginBottom
								/>
							</ResponsiveControl>
						</div>

						{/* Custom Position X/Y - Show only when Position is 'custom' */}
						{(attributes.maskPosition === 'custom' ||
							(currentDevice === 'tablet' && attributes.maskPosition_tablet === 'custom') ||
							(currentDevice === 'mobile' && attributes.maskPosition_mobile === 'custom')) && (
								<>
									<div style={{ marginTop: '16px' }}>
										<ResponsiveRangeControl
											label={__('X Position', 'voxel-fse')}
											attributeBaseName="maskPositionX"
											attributes={attributes}
											setAttributes={setAttributes}
											min={-200}
											max={200}
											step={1}
											units={['%', 'px', 'vw']}
											unitAttributeName="maskPositionXUnit"
										/>
									</div>
									<div style={{ marginTop: '16px' }}>
										<ResponsiveRangeControl
											label={__('Y Position', 'voxel-fse')}
											attributeBaseName="maskPositionY"
											attributes={attributes}
											setAttributes={setAttributes}
											min={-200}
											max={200}
											step={1}
											units={['%', 'px', 'vh']}
											unitAttributeName="maskPositionYUnit"
										/>
									</div>
								</>
							)}

						{/* Mask Repeat - Show only when Size is not 'cover' (responsive) */}
						{attributes.maskSize !== 'cover' && (
							<div style={{ marginTop: '16px' }}>
								<ResponsiveControl
									label={__('Repeat', 'voxel-fse')}
									currentDevice={currentDevice}
									onDeviceChange={setCurrentDevice}
								>
									<SelectControl
										value={
											currentDevice === 'desktop'
												? attributes.maskRepeat || 'no-repeat'
												: currentDevice === 'tablet'
													? attributes.maskRepeat_tablet || ''
													: attributes.maskRepeat_mobile || ''
										}
										options={MASK_REPEAT_OPTIONS}
										onChange={(value: string) => {
											if (currentDevice === 'desktop') {
												setAttributes({ maskRepeat: value });
											} else if (currentDevice === 'tablet') {
												setAttributes({ maskRepeat_tablet: value });
											} else {
												setAttributes({ maskRepeat_mobile: value });
											}
										}}
										__nextHasNoMarginBottom
									/>
								</ResponsiveControl>
							</div>
						)}
					</>
				)}
			</AccordionPanel>

			{/* BORDER SECTION */}
			<AccordionPanel id="border" title={__('Border', 'voxel-fse')}>
				<AdvancedBorderControl
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</AccordionPanel>

			{/* RESPONSIVE SECTION */}
			<AccordionPanel id="responsive" title={__('Responsive', 'voxel-fse')}>
				<ToggleControl
					label={__('Hide on Desktop', 'voxel-fse')}
					checked={attributes.hideDesktop || false}
					onChange={(value: boolean) => setAttributes({ hideDesktop: value })}
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__('Hide on Tablet', 'voxel-fse')}
					checked={attributes.hideTablet || false}
					onChange={(value: boolean) => setAttributes({ hideTablet: value })}
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__('Hide on Mobile', 'voxel-fse')}
					checked={attributes.hideMobile || false}
					onChange={(value: boolean) => setAttributes({ hideMobile: value })}
					__nextHasNoMarginBottom
				/>
			</AccordionPanel>

			{/* CUSTOM CSS SECTION - with Voxel dynamic tags support */}
			<AccordionPanel id="custom-css" title={__('Custom CSS', 'voxel-fse')}>
				<CodeEditorControl
					label={__('Add your own custom CSS', 'voxel-fse')}
					value={attributes.customCSS || ''}
					onChange={(value: string) => setAttributes({ customCSS: value })}
					help={
						<>
							{__('Use', 'voxel-fse')}{' '}
							<code style={{ color: '#93003f', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>selector</code>
							{' '}{__('to target this block specifically, or add', 'voxel-fse')}{' '}
							<code style={{ color: '#93003f', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>selector</code>
							{' '}{__('prefix to target specific elements.', 'voxel-fse')}
						</>
					}
					height={140}
					mode="css"
					enableDynamicTags
					context="post"
				/>
			</AccordionPanel>

			{/* ATTRIBUTES SECTION - Elementor Pro feature - with Voxel dynamic tags support */}
			<AccordionPanel id="attributes" title={__('Attributes', 'voxel-fse')}>
				<DynamicTagTextareaControl
					label={__('Custom Attributes', 'voxel-fse')}
					value={attributes.customAttributes || ''}
					onChange={(value: string) => setAttributes({ customAttributes: value })}
					placeholder={__('key|value', 'voxel-fse')}
					help={__('Set custom attributes for the wrapper element. Each attribute in a separate line. Separate attribute key from the value using | character.', 'voxel-fse')}
					rows={4}
					context="post"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}

/**
 * Helper: Get default attributes for AdvancedTab
 *
 * Use this in your block.json or block registration to define the full attribute schema.
 */
export const advancedTabAttributes = {
	// Margin (responsive)
	blockMargin: { type: 'object', default: {} },
	blockMargin_tablet: { type: 'object' },
	blockMargin_mobile: { type: 'object' },

	// Padding (responsive)
	blockPadding: { type: 'object', default: {} },
	blockPadding_tablet: { type: 'object' },
	blockPadding_mobile: { type: 'object' },

	// Width controls (responsive)
	elementWidth: { type: 'string', default: '' },
	elementWidth_tablet: { type: 'string' },
	elementWidth_mobile: { type: 'string' },
	elementCustomWidth: { type: 'number' },
	elementCustomWidth_tablet: { type: 'number' },
	elementCustomWidth_mobile: { type: 'number' },
	elementCustomWidthUnit: { type: 'string', default: '%' },

	// Vertical Align (Elementor common-base.php L511-L535)
	elementVerticalAlign: { type: 'string' },
	elementVerticalAlign_tablet: { type: 'string' },
	elementVerticalAlign_mobile: { type: 'string' },

	// Grid Item controls (Elementor common-base.php L377-L473)
	gridColumn: { type: 'string', default: '' },
	gridColumn_tablet: { type: 'string' },
	gridColumn_mobile: { type: 'string' },
	gridColumnCustom: { type: 'string' },
	gridColumnCustom_tablet: { type: 'string' },
	gridColumnCustom_mobile: { type: 'string' },
	gridRow: { type: 'string', default: '' },
	gridRow_tablet: { type: 'string' },
	gridRow_mobile: { type: 'string' },
	gridRowCustom: { type: 'string' },
	gridRowCustom_tablet: { type: 'string' },
	gridRowCustom_mobile: { type: 'string' },

	// Flexbox Item controls (responsive)
	flexAlignSelf: { type: 'string' },
	flexAlignSelf_tablet: { type: 'string' },
	flexAlignSelf_mobile: { type: 'string' },
	flexOrder: { type: 'string', default: '' },
	flexOrder_tablet: { type: 'string' },
	flexOrder_mobile: { type: 'string' },
	flexOrderCustom: { type: 'number' },
	flexOrderCustom_tablet: { type: 'number' },
	flexOrderCustom_mobile: { type: 'number' },
	flexSize: { type: 'string', default: '' },
	flexSize_tablet: { type: 'string' },
	flexSize_mobile: { type: 'string' },
	flexGrow: { type: 'number', default: 1 },
	flexGrow_tablet: { type: 'number' },
	flexGrow_mobile: { type: 'number' },
	flexShrink: { type: 'number', default: 1 },
	flexShrink_tablet: { type: 'number' },
	flexShrink_mobile: { type: 'number' },

	// Position controls
	position: { type: 'string', default: '' },
	offsetOrientationH: { type: 'string', default: 'start' },
	offsetX: { type: 'number' },
	offsetX_tablet: { type: 'number' },
	offsetX_mobile: { type: 'number' },
	offsetXUnit: { type: 'string', default: 'px' },
	offsetXEnd: { type: 'number' },
	offsetXEnd_tablet: { type: 'number' },
	offsetXEnd_mobile: { type: 'number' },
	offsetXEndUnit: { type: 'string', default: 'px' },
	offsetOrientationV: { type: 'string', default: 'start' },
	offsetY: { type: 'number' },
	offsetY_tablet: { type: 'number' },
	offsetY_mobile: { type: 'number' },
	offsetYUnit: { type: 'string', default: 'px' },
	offsetYEnd: { type: 'number' },
	offsetYEnd_tablet: { type: 'number' },
	offsetYEnd_mobile: { type: 'number' },
	offsetYEndUnit: { type: 'string', default: 'px' },

	// Z-Index (responsive) - string type to support dynamic tags
	zIndex: { type: 'string' },
	zIndex_tablet: { type: 'string' },
	zIndex_mobile: { type: 'string' },

	// CSS ID & Classes
	elementId: { type: 'string' },
	customClasses: { type: 'string' },

	// Background (Active tab state)
	backgroundActiveTab: { type: 'string', default: 'normal' },

	// Background Type (Normal/Hover) - 'classic' | 'gradient'
	backgroundType: { type: 'string', default: 'classic' },
	backgroundTypeHover: { type: 'string', default: 'classic' },

	// Background Color (Normal/Hover)
	backgroundColor: { type: 'string' },
	backgroundColorHover: { type: 'string' },

	// Background Image (Normal, responsive)
	backgroundImage: { type: 'object' },
	backgroundImage_tablet: { type: 'object' },
	backgroundImage_mobile: { type: 'object' },

	// Background Image (Hover, responsive)
	backgroundImageHover: { type: 'object' },
	backgroundImageHover_tablet: { type: 'object' },
	backgroundImageHover_mobile: { type: 'object' },

	// Dynamic Tags for Background Image
	bgImageDynamicTag: { type: 'string' },
	bgImageDynamicTagHover: { type: 'string' },

	// Image Resolution (Normal/Hover, responsive)
	bgImageResolution: { type: 'string', default: 'full' },
	bgImageResolution_tablet: { type: 'string' },
	bgImageResolution_mobile: { type: 'string' },
	bgImageResolutionHover: { type: 'string', default: 'full' },
	bgImageResolutionHover_tablet: { type: 'string' },
	bgImageResolutionHover_mobile: { type: 'string' },

	// Image Position (Normal/Hover, responsive)
	bgImagePosition: { type: 'string', default: 'center center' },
	bgImagePosition_tablet: { type: 'string' },
	bgImagePosition_mobile: { type: 'string' },
	bgImagePositionHover: { type: 'string', default: 'center center' },
	bgImagePositionHover_tablet: { type: 'string' },
	bgImagePositionHover_mobile: { type: 'string' },

	// Image Attachment (Normal/Hover) - not responsive
	bgImageAttachment: { type: 'string', default: 'scroll' },
	bgImageAttachmentHover: { type: 'string', default: 'scroll' },

	// Image Repeat (Normal/Hover, responsive)
	bgImageRepeat: { type: 'string', default: 'no-repeat' },
	bgImageRepeat_tablet: { type: 'string' },
	bgImageRepeat_mobile: { type: 'string' },
	bgImageRepeatHover: { type: 'string', default: 'no-repeat' },
	bgImageRepeatHover_tablet: { type: 'string' },
	bgImageRepeatHover_mobile: { type: 'string' },

	// Image Display Size (Normal/Hover, responsive) - 'auto' | 'cover' | 'contain' | 'custom'
	bgImageDisplaySize: { type: 'string', default: 'cover' },
	bgImageDisplaySize_tablet: { type: 'string' },
	bgImageDisplaySize_mobile: { type: 'string' },
	bgImageDisplaySizeHover: { type: 'string', default: 'cover' },
	bgImageDisplaySizeHover_tablet: { type: 'string' },
	bgImageDisplaySizeHover_mobile: { type: 'string' },

	// Image Width (Custom size, Normal/Hover, responsive)
	bgImageWidth: { type: 'number' },
	bgImageWidth_tablet: { type: 'number' },
	bgImageWidth_mobile: { type: 'number' },
	bgImageWidthUnit: { type: 'string', default: '%' },
	bgImageWidthHover: { type: 'number' },
	bgImageWidthHover_tablet: { type: 'number' },
	bgImageWidthHover_mobile: { type: 'number' },
	bgImageWidthUnitHover: { type: 'string', default: '%' },

	// Gradient Color (Normal/Hover)
	gradientColor: { type: 'string' },
	gradientColorHover: { type: 'string' },

	// Gradient Location (Normal/Hover, responsive)
	gradientLocation: { type: 'number', default: 0 },
	gradientLocation_tablet: { type: 'number' },
	gradientLocation_mobile: { type: 'number' },
	gradientLocationHover: { type: 'number', default: 0 },
	gradientLocationHover_tablet: { type: 'number' },
	gradientLocationHover_mobile: { type: 'number' },

	// Gradient Second Color (Normal/Hover)
	gradientSecondColor: { type: 'string' },
	gradientSecondColorHover: { type: 'string' },

	// Gradient Second Location (Normal/Hover, responsive)
	gradientSecondLocation: { type: 'number', default: 100 },
	gradientSecondLocation_tablet: { type: 'number' },
	gradientSecondLocation_mobile: { type: 'number' },
	gradientSecondLocationHover: { type: 'number', default: 100 },
	gradientSecondLocationHover_tablet: { type: 'number' },
	gradientSecondLocationHover_mobile: { type: 'number' },

	// Gradient Type (Normal/Hover) - 'linear' | 'radial'
	gradientType: { type: 'string', default: 'linear' },
	gradientTypeHover: { type: 'string', default: 'linear' },

	// Gradient Angle (Linear, Normal/Hover, responsive)
	gradientAngle: { type: 'number', default: 180 },
	gradientAngle_tablet: { type: 'number' },
	gradientAngle_mobile: { type: 'number' },
	gradientAngleHover: { type: 'number', default: 180 },
	gradientAngleHover_tablet: { type: 'number' },
	gradientAngleHover_mobile: { type: 'number' },

	// Gradient Position (Radial, Normal/Hover, responsive)
	gradientPosition: { type: 'string', default: 'center center' },
	gradientPosition_tablet: { type: 'string' },
	gradientPosition_mobile: { type: 'string' },
	gradientPositionHover: { type: 'string', default: 'center center' },
	gradientPositionHover_tablet: { type: 'string' },
	gradientPositionHover_mobile: { type: 'string' },

	// Background Transition Duration (for hover)
	bgTransitionDuration: { type: 'number', default: 0.3 },

	// Mask (Elementor common-base.php:L1077-L1302)
	maskSwitch: { type: 'boolean', default: false },
	maskShape: { type: 'string', default: 'circle' },
	maskImage: { type: 'object' },
	maskImage_tablet: { type: 'object' },
	maskImage_mobile: { type: 'object' },
	maskSize: { type: 'string', default: 'contain' },
	maskSize_tablet: { type: 'string' },
	maskSize_mobile: { type: 'string' },
	maskSizeScale: { type: 'number' },
	maskSizeScale_tablet: { type: 'number' },
	maskSizeScale_mobile: { type: 'number' },
	maskSizeScaleUnit: { type: 'string', default: '%' },
	maskPosition: { type: 'string', default: 'center center' },
	maskPosition_tablet: { type: 'string' },
	maskPosition_mobile: { type: 'string' },
	maskPositionX: { type: 'number' },
	maskPositionX_tablet: { type: 'number' },
	maskPositionX_mobile: { type: 'number' },
	maskPositionXUnit: { type: 'string', default: '%' },
	maskPositionY: { type: 'number' },
	maskPositionY_tablet: { type: 'number' },
	maskPositionY_mobile: { type: 'number' },
	maskPositionYUnit: { type: 'string', default: '%' },
	maskRepeat: { type: 'string', default: 'no-repeat' },
	maskRepeat_tablet: { type: 'string' },
	maskRepeat_mobile: { type: 'string' },

	// Border (Active tab state)
	borderActiveTab: { type: 'string', default: 'normal' },

	// Border (Normal state)
	borderType: { type: 'string', default: '' },
	borderWidth: { type: 'object', default: {} },
	borderColor: { type: 'string' },
	borderRadius: { type: 'object', default: {} },
	borderRadius_tablet: { type: 'object' },
	borderRadius_mobile: { type: 'object' },
	boxShadow: { type: 'object', default: {} },

	// Border (Hover state)
	borderTypeHover: { type: 'string', default: '' },
	borderWidthHover: { type: 'object', default: {} },
	borderColorHover: { type: 'string' },
	borderRadiusHover: { type: 'object', default: {} },
	borderRadiusHover_tablet: { type: 'object' },
	borderRadiusHover_mobile: { type: 'object' },
	boxShadowHover: { type: 'object', default: {} },

	// Responsive Visibility
	hideDesktop: { type: 'boolean', default: false },
	hideTablet: { type: 'boolean', default: false },
	hideMobile: { type: 'boolean', default: false },

	// Custom CSS
	customCSS: { type: 'string' },

	// Custom Attributes (Elementor Pro feature)
	customAttributes: { type: 'string' },

	// Transform attributes (Elementor Pro Advanced Tab)
	...transformAttributes,

	// Motion Effects attributes (Elementor Pro Advanced Tab)
	...motionEffectsAttributes,

	// Inspector panel state persistence
	advancedOpenPanel: { type: 'string', default: 'layout' },
};
