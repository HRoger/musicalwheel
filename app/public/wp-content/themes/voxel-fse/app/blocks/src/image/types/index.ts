/**
 * Image Block - TypeScript Interfaces
 *
 * Matches Elementor Widget_Image controls with Plan C+ architecture.
 *
 * @package VoxelFSE
 */

/**
 * Image media object
 */
export interface ImageMedia {
	id: number;
	url: string;
	alt: string;
	width: number;
	height: number;
}

/**
 * Link object for custom URLs
 */
export interface LinkObject {
	url: string;
	target: string;
	rel: string;
}

/**
 * Slider value object (size + unit)
 */
export interface SliderValue {
	size?: number;
	unit?: string;
}

/**
 * Box dimensions (top, right, bottom, left)
 */
export interface BoxDimensions {
	top?: number | string;
	right?: number | string;
	bottom?: number | string;
	left?: number | string;
	unit?: string;
	isLinked?: boolean;
}

/**
 * CSS Filter values
 */
export interface CSSFilters {
	blur?: number;
	brightness?: number;
	contrast?: number;
	saturation?: number;
	hue?: number;
}

/**
 * Box Shadow values
 */
export interface BoxShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: string;
}

/**
 * Typography values
 */
export interface TypographyValue {
	fontFamily?: string;
	fontSize?: SliderValue;
	fontWeight?: string;
	textTransform?: string;
	fontStyle?: string;
	textDecoration?: string;
	lineHeight?: SliderValue;
	letterSpacing?: SliderValue;
	wordSpacing?: SliderValue;
}

/**
 * Text Shadow values
 */
export interface TextShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	color?: string;
}

/**
 * Image Block Attributes
 */
export interface ImageBlockAttributes {
	blockId: string;
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;

	// Content
	image: ImageMedia;
	imageSize: string;
	customWidth?: number;
	customHeight?: number;
	captionSource: 'none' | 'attachment' | 'custom';
	caption: string;
	linkTo: 'none' | 'file' | 'custom';
	link: LinkObject;
	openLightbox: 'default' | 'yes' | 'no';
	lightboxGroup: string;

	// Style - Image
	imageAlign: string;
	imageAlign_tablet?: string;
	imageAlign_mobile?: string;
	width: SliderValue;
	width_tablet?: SliderValue;
	width_mobile?: SliderValue;
	maxWidth: SliderValue;
	maxWidth_tablet?: SliderValue;
	maxWidth_mobile?: SliderValue;
	height: SliderValue;
	height_tablet?: SliderValue;
	height_mobile?: SliderValue;
	objectFit: string;
	objectFit_tablet?: string;
	objectFit_mobile?: string;
	objectPosition: string;
	objectPosition_tablet?: string;
	objectPosition_mobile?: string;

	// Style - Effects & Border (active attributes, prefixed with 'image')
	hoverAnimation: string;
	aspectRatio: string;

	// Style - Caption
	captionAlign: string;
	captionAlign_tablet?: string;
	captionAlign_mobile?: string;
	captionTextColor: string;
	captionBackgroundColor: string;
	captionTypography: TypographyValue;
	captionTextShadow: TextShadowValue;
	captionSpacing: SliderValue;
	captionSpacing_tablet?: SliderValue;
	captionSpacing_mobile?: SliderValue;

	// Visibility
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;

	// Dynamic Tags
	imageDynamicTag: string;

	// State management
	imageStyleState?: string;
	imageOpacity?: number;
	imageOpacityHover?: number;
	imageCssFilters?: CSSFilters;
	imageCssFiltersHover?: CSSFilters;
	imageBorder?: any;
	imageBorderRadius?: BoxDimensions;
	imageBoxShadow?: BoxShadowValue;
	imageTransitionDuration?: number;

	// Allow extension with block-specific attributes
	[key: string]: any;
}

/**
 * VxConfig structure for save.tsx / frontend.tsx
 */
export interface ImageVxConfig {
	// Image data
	image: ImageMedia;
	imageSize: string;
	customWidth?: number;
	customHeight?: number;

	// Caption
	captionSource: string;
	caption: string;

	// Link
	linkTo: string;
	link: LinkObject;
	openLightbox: string;

	// Style - Image
	imageAlign: string;
	imageAlign_tablet?: string;
	imageAlign_mobile?: string;
	width: SliderValue;
	width_tablet?: SliderValue;
	width_mobile?: SliderValue;
	maxWidth: SliderValue;
	maxWidth_tablet?: SliderValue;
	maxWidth_mobile?: SliderValue;
	height: SliderValue;
	height_tablet?: SliderValue;
	height_mobile?: SliderValue;
	objectFit: string;
	objectFit_tablet?: string;
	objectFit_mobile?: string;
	objectPosition: string;

	// Style - Effects & Border
	hoverAnimation: string;
	aspectRatio: string;

	// Active prefixed attributes
	imageOpacity?: number;
	imageOpacityHover?: number;
	imageCssFilters?: CSSFilters;
	imageCssFiltersHover?: CSSFilters;
	imageTransitionDuration?: number;
	imageBorder?: any;
	imageBoxShadow?: BoxShadowValue;

	// Style - Caption
	captionAlign: string;
	captionTextColor: string;
	captionBackgroundColor: string;
	captionTypography: TypographyValue;
	captionTextShadow: TextShadowValue;
	captionSpacing: SliderValue;

	// Visibility
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;
}

/**
 * Shared component props
 */
export interface ImageComponentProps {
	attributes: ImageBlockAttributes;
	context: 'editor' | 'frontend';
	onSelectImage?: (image: ImageMedia) => void;
}
