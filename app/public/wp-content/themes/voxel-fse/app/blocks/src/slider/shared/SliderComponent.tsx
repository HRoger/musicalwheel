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

import { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { __ } from '@wordpress/i18n';
import type { SliderComponentProps, ProcessedImage, SliderVxConfig } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons } from '@shared/utils';

/**
 * Lightbox component
 */
interface LightboxProps {
	images: ProcessedImage[];
	currentIndex: number;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
	galleryId: string;
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
	const currentImage = images[currentIndex];

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowLeft') onPrev();
			if (e.key === 'ArrowRight') onNext();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [onClose, onPrev, onNext]);

	if (!currentImage) return null;

	return (
		<div
			className="voxel-fse-lightbox"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.9)',
				zIndex: 999999,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
			onClick={onClose}
		>
			{/* Close button */}
			<button
				onClick={onClose}
				style={{
					position: 'absolute',
					top: '20px',
					right: '20px',
					background: 'none',
					border: 'none',
					color: '#fff',
					fontSize: '32px',
					cursor: 'pointer',
					zIndex: 10,
				}}
				aria-label={__('Close', 'voxel-fse')}
			>
				&times;
			</button>

			{/* Image */}
			<img
				src={currentImage.srcLightbox}
				alt={currentImage.alt}
				style={{
					maxWidth: '90%',
					maxHeight: '90vh',
					objectFit: 'contain',
				}}
				onClick={(e) => e.stopPropagation()}
			/>

			{/* Navigation */}
			{images.length > 1 && (
				<>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onPrev();
						}}
						style={{
							position: 'absolute',
							left: '20px',
							top: '50%',
							transform: 'translateY(-50%)',
							background: 'rgba(255, 255, 255, 0.2)',
							border: 'none',
							color: '#fff',
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						aria-label={__('Previous', 'voxel-fse')}
					>
						{VoxelIcons.chevronLeft}
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNext();
						}}
						style={{
							position: 'absolute',
							right: '20px',
							top: '50%',
							transform: 'translateY(-50%)',
							background: 'rgba(255, 255, 255, 0.2)',
							border: 'none',
							color: '#fff',
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						aria-label={__('Next', 'voxel-fse')}
					>
						{VoxelIcons.chevronRight}
					</button>
				</>
			)}

			{/* Caption */}
			{currentImage.caption && (
				<div
					style={{
						position: 'absolute',
						bottom: '20px',
						left: '50%',
						transform: 'translateX(-50%)',
						color: '#fff',
						textAlign: 'center',
						padding: '10px 20px',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						borderRadius: '4px',
						maxWidth: '80%',
					}}
				>
					{currentImage.caption}
				</div>
			)}

			{/* Counter */}
			<div
				style={{
					position: 'absolute',
					top: '20px',
					left: '20px',
					color: '#fff',
					fontSize: '14px',
				}}
			>
				{currentIndex + 1} / {images.length}
			</div>
		</div>
	);
}

/**
 * Main Slider Component
 */
export default function SliderComponent({
	attributes,
	context,
	processedImages = [],
	galleryId = 'slider-default',
	onOpenMediaLibrary,
}: SliderComponentProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const sliderRef = useRef<HTMLDivElement>(null);
	const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const images = processedImages;
	const isSingleImage = images.length === 1;
	const hasMultipleImages = images.length > 1;

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
	 * Scroll to a specific slide
	 */
	const scrollToSlide = useCallback((index: number) => {
		if (sliderRef.current) {
			const slide = sliderRef.current.querySelector(`[data-slide-index="${index}"]`);
			if (slide) {
				slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
				setCurrentSlide(index);
			}
		}
	}, []);

	/**
	 * Navigate to previous slide
	 */
	const handlePrev = useCallback(() => {
		const newIndex = currentSlide > 0 ? currentSlide - 1 : images.length - 1;
		scrollToSlide(newIndex);
	}, [currentSlide, images.length, scrollToSlide]);

	/**
	 * Navigate to next slide
	 */
	const handleNext = useCallback(() => {
		const newIndex = currentSlide < images.length - 1 ? currentSlide + 1 : 0;
		scrollToSlide(newIndex);
	}, [currentSlide, images.length, scrollToSlide]);

	/**
	 * Open lightbox
	 */
	const openLightbox = useCallback((index: number) => {
		if (attributes.linkType === 'lightbox') {
			setLightboxIndex(index);
			setLightboxOpen(true);
		}
	}, [attributes.linkType]);

	/**
	 * Auto-slide effect
	 */
	useEffect(() => {
		if (attributes.autoSlide && hasMultipleImages && context === 'frontend') {
			autoSlideRef.current = setInterval(() => {
				setCurrentSlide((prev) => {
					const newIndex = prev < images.length - 1 ? prev + 1 : 0;
					scrollToSlide(newIndex);
					return newIndex;
				});
			}, attributes.autoSlideInterval);

			return () => {
				if (autoSlideRef.current) {
					clearInterval(autoSlideRef.current);
				}
			};
		}
	}, [attributes.autoSlide, attributes.autoSlideInterval, hasMultipleImages, images.length, context, scrollToSlide]);

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
	 */
	const getLinkProps = (image: ProcessedImage, index: number) => {
		if (attributes.linkType === 'custom_link' && attributes.customLinkUrl) {
			return {
				href: attributes.customLinkUrl,
				target: attributes.customLinkTarget || undefined,
			};
		}
		if (attributes.linkType === 'lightbox') {
			return {
				href: image.srcLightbox,
				onClick: (e: React.MouseEvent) => {
					e.preventDefault();
					openLightbox(index);
				},
				'data-lightbox-gallery': galleryId,
			};
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
			{hasMultipleImages && (
				<div className="ts-slider flexify" style={sliderStyle}>
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

							return (
								<div
									key={image.id}
									className="ts-preview"
									data-slide-index={index}
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
			{hasMultipleImages && (
				<ul className="simplify-ul flexify post-feed-nav">
					<li>
						<a
							href="#"
							className="ts-icon-btn ts-prev-page"
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
							className="ts-icon-btn ts-next-page"
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

			{/* Lightbox */}
			{lightboxOpen && (
				<Lightbox
					images={images}
					currentIndex={lightboxIndex}
					onClose={() => setLightboxOpen(false)}
					onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
					onNext={() => setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
					galleryId={galleryId}
				/>
			)}
		</>
	);
}
