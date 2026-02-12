/**
 * Image Block - Save Function
 *
 * Renders static HTML matching Elementor Widget_Image output 1:1.
 * No JavaScript hydration needed for images - purely CSS/HTML.
 *
 * Evidence: plugins/elementor/includes/widgets/image.php:render()
 * HTML structure:
 * - figure.wp-caption (when has caption)
 * - a (when linked; .elementor-clickable is editor-only per Elementor image.php:746-749)
 * - img with elementor-animation-* class (when hover animation set)
 * - figcaption.widget-image-caption.wp-caption-text (when has caption)
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { ImageBlockAttributes, SliderValue } from './types';
import { generateImageStyles } from './styles';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '../../shared/utils/generateAdvancedStyles';

interface SaveProps {
	attributes: ImageBlockAttributes;
}

/**
 * Build inline styles for the image
 */
/**
 * Build inline styles for the image
 */
function buildImageStyles(attributes: ImageBlockAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// All responsive styles (Width, Height, ObjectFit, Position, Opacity, Filters, Border, Shadow, Transition)
	// are handled via generated CSS in styles.ts.

	// Aspect Ratio
	if (attributes.aspectRatio) {
		styles.aspectRatio = attributes.aspectRatio;
	}

	return styles;
}

/**
 * Build inline styles for the wrapper
 */
function buildWrapperStyles(_attributes: ImageBlockAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// Text Align handled via generated CSS in styles.ts

	return styles;
}

/**
 * Build inline styles for the caption
 */
function buildCaptionStyles(attributes: ImageBlockAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// Caption Alignment handled via generated CSS in styles.ts

	// Text Color
	if (attributes.captionTextColor) {
		styles.color = attributes.captionTextColor;
	}

	// Background Color
	if (attributes.captionBackgroundColor) {
		styles.backgroundColor = attributes.captionBackgroundColor;
	}

	// Spacing
	const captionSpacing = attributes.captionSpacing as SliderValue;
	if (captionSpacing?.size !== undefined) {
		styles.marginBlockStart = `${captionSpacing.size}${captionSpacing.unit || 'px'}`;
	}

	return styles;
}

export default function save({ attributes }: SaveProps) {
	// Return null if no image
	if (!attributes.image.url) {
		return null;
	}

	const blockId = attributes.blockId || 'block';
	const uniqueSelector = `.voxel-fse-image-wrapper-${blockId}`;

	// Generate advanced styles from AdvancedTab
	const advancedStyles = generateAdvancedStyles(attributes);

	// Build styles
	const imageStyles = buildImageStyles(attributes);
	const wrapperStyles = buildWrapperStyles(attributes);
	const captionStyles = buildCaptionStyles(attributes);

	// Merge advanced styles with wrapper styles
	const mergedWrapperStyles = { ...advancedStyles, ...wrapperStyles };

	// Build image classes - matches WordPress + Elementor pattern
	// Evidence: plugins/elementor/includes/controls/groups/image-size.php:99-127
	const imageClasses: string[] = [];

	// WordPress image classes (required for theme compatibility)
	if (attributes.image.id) {
		const size = attributes.imageSize || 'large';
		imageClasses.push(`attachment-${size}`);
		imageClasses.push(`size-${size}`);
		imageClasses.push(`wp-image-${attributes.image.id}`);
	}

	// Elementor hover animation class
	if (attributes.hoverAnimation) {
		imageClasses.push(`elementor-animation-${attributes.hoverAnimation}`);
	}

	// Build visibility classes
	const visibilityClasses: string[] = [];
	if (attributes.hideDesktop) visibilityClasses.push('vx-hidden-desktop');
	if (attributes.hideTablet) visibilityClasses.push('vx-hidden-tablet');
	if (attributes.hideMobile) visibilityClasses.push('vx-hidden-mobile');
	if (attributes.customClasses) visibilityClasses.push(attributes.customClasses);

	// Check for caption
	// Evidence: Elementor image.php:697-722 - has_caption() checks captionSource != 'none'
	const hasCaption = attributes.captionSource !== 'none';
	// For 'custom': use the user-entered caption text
	// For 'attachment': render empty figcaption placeholder — render.php injects wp_get_attachment_caption()
	const caption = attributes.captionSource === 'custom' ? (attributes.caption || '') : '';

	// Check for link
	const hasLink = attributes.linkTo !== 'none';
	let linkUrl = '';
	if (attributes.linkTo === 'custom') {
		linkUrl = attributes.link.url || '';
	} else if (attributes.linkTo === 'file') {
		linkUrl = attributes.image.url || '';
	}

	// Generate responsive CSS (Style tab + Advanced tab)
	const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);
	const styleTabCSS = generateImageStyles(attributes, blockId);
	const combinedCSS = [advancedResponsiveCSS, styleTabCSS].filter(Boolean).join('\n');

	// Parse custom attributes
	const customAttrs = parseCustomAttributes(attributes.customAttributes);

	// Block props - matches .elementor-widget-image
	const blockProps = useBlockProps.save({
		id: attributes.elementId || undefined,
		className: combineBlockClasses(
			`voxel-fse-image voxel-fse-image-wrapper-${blockId}`,
			attributes
		),
		style: mergedWrapperStyles,
		...customAttrs,
	});

	// Build the image element - matches Elementor output exactly
	// Evidence: plugins/elementor/includes/widgets/image.php:752
	const imageElement = (
		<img
			src={attributes.image.url}
			alt={attributes.image.alt}
			title={attributes.image.alt || ''}
			loading="lazy"
			className={imageClasses.length > 0 ? imageClasses.join(' ') : undefined}
			style={Object.keys(imageStyles).length > 0 ? imageStyles : undefined}
		/>
	);

	// Wrap with link if needed
	// Evidence: .elementor-clickable is editor-only in Elementor (image.php:746-749)
	// Frontend <a> has NO class attribute by default
	let content = imageElement;
	if (hasLink && linkUrl) {
		const linkAttributes: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
			href: linkUrl,
		};

		// Add lightbox data attributes
		// Evidence: Elementor image.php:752-754 applies data-elementor-open-lightbox
		// and data-elementor-lightbox-slideshow for gallery grouping
		if (attributes.linkTo === 'file' && attributes.openLightbox !== 'no') {
			linkAttributes['data-elementor-open-lightbox'] = attributes.openLightbox;
			if (attributes.lightboxGroup) {
				linkAttributes['data-elementor-lightbox-slideshow'] = attributes.lightboxGroup;
			}
		}

		// Add target/rel for custom links
		if (attributes.linkTo === 'custom') {
			if (attributes.link.target) {
				linkAttributes.target = attributes.link.target;
			}
			if (attributes.link.rel) {
				linkAttributes.rel = attributes.link.rel;
			}
		}

		content = <a {...linkAttributes}>{imageElement}</a>;
	}

	// Wrap with figure if has caption - matches figure.wp-caption
	if (hasCaption) {
		return (
			<div {...blockProps}>
				{combinedCSS && <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />}
				<figure className="wp-caption">
					{content}
					{(caption || attributes.captionSource === 'attachment') && (
						<figcaption
							className="widget-image-caption wp-caption-text"
							style={Object.keys(captionStyles).length > 0 ? captionStyles : undefined}
						>
							{caption}
						</figcaption>
					)}
				</figure>
			</div>
		);
	}

	// No caption - just the image (possibly linked)
	return (
		<div {...blockProps}>
			{combinedCSS && <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />}
			{content}
		</div>
	);
}
