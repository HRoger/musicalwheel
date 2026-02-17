/**
 * Image Block - Shared Component
 *
 * 1:1 match with Elementor Widget_Image HTML structure:
 * - figure.wp-caption wrapper (when has caption)
 * - a link (when linked; .elementor-clickable editor-only per Elementor image.php:746-749)
 * - img with elementor-animation-* class (when hover animation set)
 * - figcaption.widget-image-caption (when has caption)
 *
 * Evidence:
 * - Elementor widget: plugins/elementor/includes/widgets/image.php:render()
 * - HTML classes: wp-caption, elementor-clickable, widget-image-caption, wp-caption-text
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import type { ImageBlockAttributes, SliderValue } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';

/**
 * Global VoxelLightbox API (provided by assets/dist/yarl-lightbox.js)
 */
interface VoxelLightboxAPI {
	open: (slides: Array<{ src: string; alt?: string }>, index?: number) => void;
	close: () => void;
}

interface ImageComponentProps {
	attributes: ImageBlockAttributes;
	context: 'editor' | 'frontend';
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
	// are handled via generated CSS in styles.ts to support media queries and prevent inline overrides.

	// Aspect Ratio (Static)
	if (attributes.aspectRatio) {
		styles.aspectRatio = attributes.aspectRatio;
	}

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

/**
 * Get image classes - WordPress + Elementor pattern
 * Evidence: plugins/elementor/includes/controls/groups/image-size.php:99-127
 */
function getImageClass(attributes: ImageBlockAttributes): string {
	const classes: string[] = [];

	// WordPress image classes (required for theme compatibility)
	if (attributes.image.id) {
		const size = attributes.imageSize || 'large';
		classes.push(`attachment-${size}`);
		classes.push(`size-${size}`);
		classes.push(`wp-image-${attributes.image.id}`);
	}

	// Elementor hover animation class
	if (attributes.hoverAnimation) {
		classes.push(`elementor-animation-${attributes.hoverAnimation}`);
	}

	return classes.join(' ');
}

/**
 * Get caption text
 * Evidence: Elementor image.php:710-722 uses wp_get_attachment_caption() for 'attachment' source
 */
function getCaption(attributes: ImageBlockAttributes, context: 'editor' | 'frontend'): string {
	if (attributes.captionSource === 'custom') {
		return attributes.caption || '';
	}
	if (attributes.captionSource === 'attachment') {
		// Frontend: render.php resolves wp_get_attachment_caption() server-side
		// Editor: show placeholder text so the user knows a caption will appear
		if (context === 'editor') {
			return attributes.image.alt || '(Attachment caption)';
		}
		return '';
	}
	return '';
}

/**
 * Check if image has caption
 */
function hasCaption(attributes: ImageBlockAttributes): boolean {
	return attributes.captionSource !== 'none';
}

/**
 * Get link URL
 */
function getLinkUrl(attributes: ImageBlockAttributes): string | null {
	if (attributes.linkTo === 'none') {
		return null;
	}
	if (attributes.linkTo === 'custom') {
		return attributes.link.url || null;
	}
	if (attributes.linkTo === 'file') {
		return attributes.image.url || null;
	}
	return null;
}

export default function ImageComponent({ attributes, context }: ImageComponentProps) {
	const imageStyles = buildImageStyles(attributes);
	const captionStyles = buildCaptionStyles(attributes);
	const imageClass = getImageClass(attributes);
	const caption = getCaption(attributes, context);
	const showCaption = hasCaption(attributes);
	const linkUrl = getLinkUrl(attributes);

	// Lightbox click handler for "file" link type
	const handleLightboxClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement | HTMLImageElement>) => {
			e.preventDefault();
			e.stopPropagation();
			const lightbox = (window as unknown as { VoxelLightbox?: VoxelLightboxAPI }).VoxelLightbox;
			if (lightbox && attributes.image.url) {
				lightbox.open([{ src: attributes.image.url, alt: attributes.image.alt || '' }], 0);
			}
		},
		[attributes.image.url, attributes.image.alt]
	);

	// Visibility classes
	const visibilityClasses: string[] = [];
	if (attributes.hideDesktop) visibilityClasses.push('vx-hidden-desktop');
	if (attributes.hideTablet) visibilityClasses.push('vx-hidden-tablet');
	if (attributes.hideMobile) visibilityClasses.push('vx-hidden-mobile');
	if (attributes.customClasses) visibilityClasses.push(attributes.customClasses);

	// Build wrapper class
	const wrapperClass = ['voxel-fse-image-wrapper', `voxel-fse-image-wrapper-${attributes.blockId}`, ...visibilityClasses].filter(Boolean).join(' ');

	// No image selected - show placeholder
	if (!attributes.image.url) {
		if (context === 'editor') {
			return (
				<div className={wrapperClass}>
					<EmptyPlaceholder />
				</div>
			);
		}
		// Frontend with no image - return empty
		return null;
	}

	// Determine if image should open lightbox in editor
	const isEditorLightbox = context === 'editor' && attributes.linkTo === 'file' && attributes.openLightbox !== 'no';

	// Build the image element - matches Elementor output exactly
	// Evidence: plugins/elementor/includes/widgets/image.php:752
	const imageElement = (
		<img
			src={attributes.image.url}
			alt={attributes.image.alt}
			title={attributes.image.alt || ''}
			loading="lazy"
			className={imageClass || undefined}
			style={imageStyles}
		/>
	);

	// Wrap with link if needed
	// Evidence: .elementor-clickable is editor-only in Elementor (image.php:746-749)
	let content = imageElement;
	if (linkUrl) {
		const linkAttributes: any = {
			href: linkUrl,
			className: context === 'editor' ? 'elementor-clickable' : undefined,
		};

		// Add lightbox data attributes and click handler
		// Evidence: Elementor image.php:752-754
		if (attributes.linkTo === 'file' && attributes.openLightbox !== 'no') {
			linkAttributes['data-elementor-open-lightbox'] = attributes.openLightbox;
			if (attributes.lightboxGroup) {
				linkAttributes['data-elementor-lightbox-slideshow'] = attributes.lightboxGroup;
			}
			linkAttributes.onClick = handleLightboxClick;
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

		// In editor: override display:contents from style.css so <a> has a box
		// and can receive click events. Same pattern as GalleryComponent.
		if (context === 'editor' && isEditorLightbox) {
			linkAttributes.style = { display: 'inline-block', cursor: 'pointer' };
		}

		content = <a {...(linkAttributes as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{imageElement}</a>;
	}

	// Wrap with figure if has caption
	if (showCaption) {
		return (
			<div className={wrapperClass}>
				<figure className="wp-caption">
					{content}
					{caption && (
						<figcaption className="widget-image-caption wp-caption-text" style={captionStyles}>
							{caption}
						</figcaption>
					)}
				</figure>
			</div>
		);
	}

	// No caption - just the image (possibly linked)
	return (
		<div className={wrapperClass}>
			{content}
		</div>
	);
}
