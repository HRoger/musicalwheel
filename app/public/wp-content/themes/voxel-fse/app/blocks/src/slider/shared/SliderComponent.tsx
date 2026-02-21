/**
 * Slider Component - Shared
 *
 * Renders the slider with HTML structure matching Voxel widget 1:1.
 * Used by both edit.tsx (editor preview) and frontend.tsx (hydration).
 *
 * Evidence: themes/voxel/templates/widgets/slider.php
 *
 * CSS Classes used (inherited from Voxel parent):
 * - ts-slider, flexify
 * - post-feed-grid, ts-feed-nowrap, nav-type-dots
 * - ts-preview, ts-single-slide
 * - ts-slide-nav
 * - simplify-ul, post-feed-nav
 * - ts-icon-btn, ts-prev-page, ts-next-page
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import type { SliderComponentProps, ProcessedImage, SliderVxConfig } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons } from '@shared/utils';

/**
 * Global VoxelLightbox API (provided by assets/dist/yarl-lightbox.js)
 */
interface VoxelLightboxAPI {
	open: (slides: Array<{ src: string; alt?: string }>, index?: number) => void;
	close: () => void;
}

/**
 * Check if page is RTL
 * Evidence: themes/voxel/assets/dist/commons.js - Voxel_Config.is_rtl
 */
const isRTL = (): boolean => {
	if (typeof window !== 'undefined') {
		// Check Voxel config first
		const voxelConfig = (window as unknown as Record<string, unknown>)['Voxel_Config'] as { is_rtl?: boolean } | undefined;
		if (voxelConfig?.is_rtl !== undefined) {
			return voxelConfig.is_rtl;
		}
		// Fallback to document direction
		return document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
	}
	return false;
};

/**
 * Get image description for Elementor lightbox
 * Evidence: themes/voxel/templates/widgets/slider.php:19,44
 * Uses caption, falls back to alt, then description
 */
const getLightboxDescription = (image: ProcessedImage): string => {
	return image.caption || image.alt || image.description || '';
};

/**
 * Main Slider Component
 */
export default function SliderComponent({
	attributes,
	context,
	processedImages = [],
	galleryId = 'slider-default',
	onOpenMediaLibrary: _onOpenMediaLibrary,
	templateContext = 'post',
	templatePostType,
}: SliderComponentProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(true);
	const sliderRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Dynamic tag resolution for editor preview
	const hasDynamicImages = attributes.imagesDynamicTag && attributes.imagesDynamicTag.includes('@');
	const [dynamicImages, setDynamicImages] = useState<ProcessedImage[]>([]);

	useEffect(() => {
		if (context !== 'editor' || !hasDynamicImages || processedImages.length > 0) {
			setDynamicImages([]);
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				// Step 1: Resolve the dynamic tag to get comma-separated attachment IDs
				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: {
						expression: attributes.imagesDynamicTag,
						preview_context: previewContext,
					},
				});

				if (cancelled) return;

				// Strip @tags()...@endtags() wrapper
				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				// Parse comma-separated IDs
				const ids = rendered.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => n > 0);
				if (ids.length === 0) {
					setDynamicImages([]);
					return;
				}

				// Step 2: Fetch media data for each ID
				const images: ProcessedImage[] = [];
				for (const id of ids) {
					if (cancelled) return;
					try {
						const media = await apiFetch<{ source_url: string; alt_text?: string; caption?: { rendered?: string }; title?: { rendered?: string }; description?: { rendered?: string }; media_details?: { sizes?: Record<string, { source_url: string }> } }>({
							path: `/wp/v2/media/${id}`,
						});
						if (media?.source_url) {
							const sizes = media.media_details?.sizes || {};
							const displayUrl = sizes[attributes.displaySize]?.source_url || media.source_url;
							const lightboxUrl = sizes[attributes.lightboxSize]?.source_url || media.source_url;
							const thumbnailUrl = sizes['thumbnail']?.source_url || media.source_url;
							images.push({
								id,
								src: displayUrl,
								srcLightbox: lightboxUrl,
								srcThumbnail: thumbnailUrl,
								alt: media.alt_text || '',
								caption: media.caption?.rendered?.replace(/<[^>]*>/g, '') || '',
								description: media.description?.rendered?.replace(/<[^>]*>/g, '') || '',
								title: media.title?.rendered || '',
							});
						}
					} catch {
						// Skip failed media fetches
					}
				}

				if (!cancelled) {
					setDynamicImages(images);
				}
			} catch (err) {
				if (!cancelled) {
					console.error('Failed to resolve dynamic slider images:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	}, [context, attributes.imagesDynamicTag, hasDynamicImages, templateContext, templatePostType, processedImages.length, attributes.displaySize, attributes.lightboxSize]);

	// Generate unique slider ID matching Voxel pattern
	// Evidence: themes/voxel/app/widgets/slider.php:694 - $slider_id = 'slider-'.wp_unique_id()
	const sliderId = useMemo(() => `slider-${galleryId}`, [galleryId]);

	// Use dynamic images when no static images but dynamic tag is set
	const effectiveImages = processedImages.length > 0 ? processedImages : dynamicImages;

	// Determine if this is a slideshow (multiple images) for lightbox grouping
	// Evidence: themes/voxel/templates/widgets/slider.php:18,43
	const isSlideshow = effectiveImages.length > 1;

	const images = effectiveImages;
	const isSingleImage = images.length === 1;
	const hasMultipleImages = images.length > 1;

	// Build lightbox slides from all images
	const lightboxSlides = useMemo(
		() => images.map((img) => ({
			src: img.srcLightbox || img.src,
			alt: img.alt || '',
		})),
		[images]
	);

	// Lightbox click handler - opens at the correct image index
	const handleLightboxClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
			e.preventDefault();
			const lightbox = (window as unknown as { VoxelLightbox?: VoxelLightboxAPI }).VoxelLightbox;
			if (lightbox) {
				lightbox.open(lightboxSlides, index);
			}
		},
		[lightboxSlides]
	);

	// Build inline styles based on attributes
	const sliderStyle: CSSProperties = {};
	const imageStyle: CSSProperties = {};

	if (attributes.imageAspectRatio) {
		imageStyle.aspectRatio = attributes.imageAspectRatio;
	}
	if (attributes.imageBorderRadius !== undefined) {
		sliderStyle.borderRadius = `${attributes.imageBorderRadius}px`;
	}
	if (attributes.imageOpacity !== undefined) {
		imageStyle.opacity = attributes.imageOpacity;
	}

	// Thumbnail styles
	const thumbnailStyle: CSSProperties = {};
	if (attributes.thumbnailSize !== undefined) {
		thumbnailStyle.width = `${attributes.thumbnailSize}px`;
		thumbnailStyle.height = `${attributes.thumbnailSize}px`;
	}
	if (attributes.thumbnailBorderRadius !== undefined) {
		thumbnailStyle.borderRadius = `${attributes.thumbnailBorderRadius}px`;
	}
	if (attributes.thumbnailOpacity !== undefined) {
		thumbnailStyle.opacity = attributes.thumbnailOpacity;
	}

	/**
	 * Update scroll state for nav button disabled states
	 * Evidence: themes/voxel/assets/dist/commons.js - scroll detection logic
	 */
	const updateScrollState = useCallback(() => {
		if (!sliderRef.current) return;

		const container = sliderRef.current;
		const scrollLeft = Math.abs(container.scrollLeft);
		const maxScroll = container.scrollWidth - container.clientWidth;

		// At start (can't scroll prev)
		setCanScrollPrev(scrollLeft > 10);
		// At end (can't scroll next)
		setCanScrollNext(scrollLeft < maxScroll - 10);
	}, []);

	/**
	 * Scroll to a specific slide by index
	 * Evidence: themes/voxel/templates/widgets/slider.php:59 - scroll logic
	 */
	const scrollToSlide = useCallback((index: number) => {
		if (sliderRef.current) {
			const slide = sliderRef.current.querySelector(`[data-slide-index="${index}"]`) as HTMLElement | null;
			if (slide) {
				// Match Voxel's scroll behavior: scrollLeft = slide.offsetLeft
				sliderRef.current.scrollTo({
					left: slide.offsetLeft,
					behavior: 'smooth',
				});
				setCurrentSlide(index);
			}
		}
	}, []);

	/**
	 * Navigate to previous slide
	 * Evidence: themes/voxel/assets/dist/commons.js - navigation logic with RTL support
	 */
	const handlePrev = useCallback(() => {
		if (!sliderRef.current) return;

		const container = sliderRef.current;
		const firstSlide = container.querySelector('.ts-preview') as HTMLElement | null;
		if (!firstSlide) return;

		let scrollAmount = -firstSlide.scrollWidth;

		// At start - wrap to end
		if (Math.abs(container.scrollLeft) <= 10) {
			scrollAmount = container.scrollWidth - container.clientWidth - container.scrollLeft;
		}

		// RTL support
		container.scrollBy({
			left: isRTL() ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		});

		// Update current slide index
		const newIndex = currentSlide > 0 ? currentSlide - 1 : images.length - 1;
		setCurrentSlide(newIndex);
	}, [currentSlide, images.length]);

	/**
	 * Navigate to next slide
	 * Evidence: themes/voxel/assets/dist/commons.js - navigation logic with RTL support
	 */
	const handleNext = useCallback(() => {
		if (!sliderRef.current) return;

		const container = sliderRef.current;
		const firstSlide = container.querySelector('.ts-preview') as HTMLElement | null;
		if (!firstSlide) return;

		let scrollAmount = firstSlide.scrollWidth;

		// At end - wrap to start
		if (container.clientWidth + Math.abs(container.scrollLeft) + 10 >= container.scrollWidth) {
			scrollAmount = -container.scrollLeft;
		}

		// RTL support
		container.scrollBy({
			left: isRTL() ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		});

		// Update current slide index
		const newIndex = currentSlide < images.length - 1 ? currentSlide + 1 : 0;
		setCurrentSlide(newIndex);
	}, [currentSlide, images.length]);

	/**
	 * Auto-slide effect with hover pause
	 * Evidence: themes/voxel/assets/dist/commons.js - auto-slide with hover check
	 * "Array.from(document.querySelectorAll(":hover")).includes(o)||l(o,"next")"
	 */
	useEffect(() => {
		if (attributes.autoSlide && hasMultipleImages && context === 'frontend') {
			const interval = attributes.autoSlideInterval || 3000;

			// Don't start auto-slide if interval is too short (Voxel uses 20ms minimum)
			if (interval <= 20) return;

			autoSlideRef.current = setInterval(() => {
				// Pause auto-slide when hovered (Voxel parity)
				if (isHovered) return;

				setCurrentSlide((prev) => {
					const newIndex = prev < images.length - 1 ? prev + 1 : 0;
					scrollToSlide(newIndex);
					return newIndex;
				});
			}, interval);

			return () => {
				if (autoSlideRef.current) {
					clearInterval(autoSlideRef.current);
				}
			};
		}
		return undefined;
	}, [attributes.autoSlide, attributes.autoSlideInterval, hasMultipleImages, images.length, context, scrollToSlide, isHovered]);

	/**
	 * Scroll event listener for updating nav button states
	 */
	useEffect(() => {
		const container = sliderRef.current;
		if (!container || !hasMultipleImages) return;

		// Initial state
		updateScrollState();

		// Listen for scroll events
		container.addEventListener('scroll', updateScrollState);

		return () => {
			container.removeEventListener('scroll', updateScrollState);
		};
	}, [hasMultipleImages, updateScrollState]);

	/**
	 * Render icon (either custom or default from VoxelIcons)
	 */
	const renderNavIcon = (iconValue: string | undefined, defaultIcon: JSX.Element) => {
		if (iconValue) {
			return <i className={iconValue} aria-hidden="true" />;
		}
		return defaultIcon;
	};

	/**
	 * Get link props for image
	 * Evidence: themes/voxel/templates/widgets/slider.php:14-22, 39-47
	 *
	 * For lightbox mode, uses VoxelLightbox global API via onClick handler.
	 * data-elementor-* attributes are kept for HTML parity only.
	 */
	const getLinkProps = (image: ProcessedImage, index: number) => {
		if (attributes.linkType === 'custom_link' && attributes.customLinkUrl) {
			return {
				href: attributes.customLinkUrl,
				target: attributes.customLinkTarget || undefined,
			};
		}
		if (attributes.linkType === 'lightbox') {
			const props: Record<string, unknown> = {
				href: image.srcLightbox,
				'data-elementor-open-lightbox': 'yes',
				'data-elementor-lightbox-description': getLightboxDescription(image),
				onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleLightboxClick(e, index),
			};

			// Only add slideshow attribute for multiple images
			if (isSlideshow) {
				props['data-elementor-lightbox-slideshow'] = galleryId;
			}

			return props;
		}
		return null;
	};

	// Editor empty state - non-interactive placeholder matching Elementor
	if (context === 'editor' && images.length === 0) {
		return <EmptyPlaceholder />;
	}

	// Frontend empty state
	if (context === 'frontend' && images.length === 0) {
		return null;
	}

	// Build vxconfig for re-rendering (CRITICAL for Plan C+)
	const vxConfig: SliderVxConfig = {
		images,
		visibleCount: attributes.visibleCount,
		displaySize: attributes.displaySize,
		lightboxSize: attributes.lightboxSize,
		linkType: attributes.linkType,
		customLinkUrl: attributes.customLinkUrl,
		customLinkTarget: attributes.customLinkTarget,
		showThumbnails: attributes.showThumbnails,
		autoSlide: attributes.autoSlide,
		autoSlideInterval: attributes.autoSlideInterval,
		rightChevronIcon: attributes.rightChevronIcon?.value || '',
		leftChevronIcon: attributes.leftChevronIcon?.value || '',
		galleryId,
		imageAspectRatio: attributes.imageAspectRatio,
		imageBorderRadius: attributes.imageBorderRadius,
		imageOpacity: attributes.imageOpacity,
		imageOpacityHover: attributes.imageOpacityHover,
		thumbnailSize: attributes.thumbnailSize,
		thumbnailBorderRadius: attributes.thumbnailBorderRadius,
		thumbnailOpacity: attributes.thumbnailOpacity,
		thumbnailOpacityHover: attributes.thumbnailOpacityHover,
	};

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility (Plan C+ requirement) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Single Image Layout */}
			{isSingleImage && (
				<div className="ts-preview ts-single-slide" style={sliderStyle}>
					{(() => {
						const image = images[0];
						const linkProps = getLinkProps(image, 0);

						const imageElement = (
							<img
								src={image.src}
								alt={image.alt}
								loading="lazy"
								style={imageStyle}
							/>
						);

						if (linkProps) {
							return (
								<a {...linkProps}>
									{imageElement}
								</a>
							);
						}

						return imageElement;
					})()}
				</div>
			)}

			{/* Multiple Images Layout - Slider */}
			{/* Evidence: themes/voxel/templates/widgets/slider.php:29-55 */}
			{hasMultipleImages && (
				<div
					ref={containerRef}
					className="ts-slider flexify"
					style={sliderStyle}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<div
						ref={sliderRef}
						className="post-feed-grid ts-feed-nowrap nav-type-dots"
						data-auto-slide={attributes.autoSlide ? attributes.autoSlideInterval : 0}
						style={{
							display: 'flex',
							overflowX: 'auto',
							scrollSnapType: 'x mandatory',
							scrollBehavior: 'smooth',
							gap: '0',
						}}
					>
						{images.map((image, index) => {
							const linkProps = getLinkProps(image, index);

							const imageElement = (
								<img
									src={image.src}
									alt={image.alt}
									loading="lazy"
									style={imageStyle}
								/>
							);

							{/* Evidence: themes/voxel/templates/widgets/slider.php:33
							    _id="slide-{slider_id}-{image_id}" id="ts-media-{image_id}" */}
							return (
								<div
									key={image.id}
									className="ts-preview"
									data-slide-index={index}
									data-id={`slide-${sliderId}-${image.id}`}
									id={`ts-media-${image.id}`}
									style={{
										flex: '0 0 100%',
										scrollSnapAlign: 'start',
									}}
								>
									{linkProps ? (
										<a {...linkProps}>
											{imageElement}
										</a>
									) : (
										imageElement
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Thumbnail Navigation */}
			{attributes.showThumbnails && hasMultipleImages && (
				<div className="ts-slide-nav" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
					{images.map((image, index) => (
						<a
							key={image.id}
							href="#"
							onClick={(e) => {
								e.preventDefault();
								scrollToSlide(index);
							}}
							style={{
								...thumbnailStyle,
								display: 'block',
								overflow: 'hidden',
								opacity: currentSlide === index ? 1 : (thumbnailStyle.opacity || 0.6),
								border: currentSlide === index ? '2px solid var(--vx-primary-color, #3b82f6)' : 'none',
							}}
						>
							<img
								src={image.srcThumbnail}
								alt={image.alt}
								loading="lazy"
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						</a>
					))}
				</div>
			)}

			{/* Carousel Navigation Buttons */}
			{/* Evidence: themes/voxel/templates/widgets/slider.php:67-79 */}
			{hasMultipleImages && (
				<ul className="simplify-ul flexify post-feed-nav">
					<li>
						<a
							href="#"
							className={`ts-icon-btn ts-prev-page${!canScrollPrev ? ' disabled' : ''}`}
							aria-label={__('Previous', 'voxel-fse')}
							onClick={(e) => {
								e.preventDefault();
								handlePrev();
							}}
						>
							{renderNavIcon(attributes.leftChevronIcon?.value, VoxelIcons.chevronLeft)}
						</a>
					</li>
					<li>
						<a
							href="#"
							className={`ts-icon-btn ts-next-page${!canScrollNext ? ' disabled' : ''}`}
							aria-label={__('Next', 'voxel-fse')}
							onClick={(e) => {
								e.preventDefault();
								handleNext();
							}}
						>
							{renderNavIcon(attributes.rightChevronIcon?.value, VoxelIcons.chevronRight)}
						</a>
					</li>
				</ul>
			)}

			{/* Lightbox is handled by Elementor's native lightbox via data attributes */}
			{/* Evidence: themes/voxel/templates/widgets/slider.php:17-19, 42-44 */}
			{/* data-elementor-open-lightbox="yes" triggers Elementor's lightbox automatically */}
		</>
	);
}
