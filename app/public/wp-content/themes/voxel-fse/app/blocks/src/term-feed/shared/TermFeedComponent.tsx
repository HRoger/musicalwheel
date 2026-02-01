/**
 * Term Feed Block - Shared Component
 *
 * Renders the term feed for both editor and frontend contexts.
 * HTML structure matches Voxel's term-feed.php template 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/templates/widgets/term-feed.php
 * - Carousel nav: themes/voxel/templates/widgets/post-feed/carousel-nav.php
 *
 * HTML Structure (from Voxel):
 * <div class="post-feed-grid {layoutMode} min-scroll min-scroll-h" data-auto-slide="0">
 *   <div class="ts-preview" data-term-id="{id}" style="--e-global-color-accent: {color};">
 *     <!-- card template HTML -->
 *   </div>
 * </div>
 * <ul class="simplify-ul flexify post-feed-nav">
 *   <li><a href="#" class="ts-icon-btn ts-prev-page">...</a></li>
 *   <li><a href="#" class="ts-icon-btn ts-next-page">...</a></li>
 * </ul>
 *
 * @package VoxelFSE
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type {
	TermFeedAttributes,
	TermFeedVxConfig,
	TermData,
	TermFeedComponentProps,
} from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons, renderIcon } from '@shared/utils';

/**
 * Build inline styles for the feed container
 */
function buildFeedStyles(): React.CSSProperties {
	return {};
}

/**
 * Build inline styles for carousel item
 */
function buildItemStyles(
	attributes: TermFeedAttributes,
	termColor?: string
): React.CSSProperties {
	const styles: Record<string, string | number> = {};

	// Replace accent color with term color
	if (attributes.replaceAccentColor && termColor) {
		styles['--e-global-color-accent'] = termColor;
	}

	return styles as React.CSSProperties;
}

/**
 * Build inline styles for navigation buttons
 * Most of this is now handled by generated responsive CSS,
 * but keeping static parts that aren't responsive yet.
 */
function buildNavStyles(): {
	navListItemStyle: React.CSSProperties;
	navButtonStyle: React.CSSProperties;
} {
	return {
		navListItemStyle: {},
		navButtonStyle: {},
	};
}

export default function TermFeedComponent({
	attributes,
	terms,
	isLoading,
	error,
	context,
}: TermFeedComponentProps) {
	const feedRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	// Check scroll state for carousel navigation
	const checkScrollState = useCallback(() => {
		if (!feedRef.current || attributes.layoutMode !== 'ts-feed-nowrap') {
			return;
		}

		const el = feedRef.current;
		const scrollLeft = el.scrollLeft;
		const scrollWidth = el.scrollWidth;
		const clientWidth = el.clientWidth;

		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
	}, [attributes.layoutMode]);

	// Update scroll state on mount and resize
	useEffect(() => {
		checkScrollState();

		const el = feedRef.current;
		if (el) {
			el.addEventListener('scroll', checkScrollState);
			window.addEventListener('resize', checkScrollState);
		}

		return () => {
			if (el) {
				el.removeEventListener('scroll', checkScrollState);
			}
			window.removeEventListener('resize', checkScrollState);
		};
	}, [checkScrollState, terms]);

	// Handle carousel navigation
	const handlePrev = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!feedRef.current) return;

		const el = feedRef.current;
		const scrollAmount = el.clientWidth * 0.8;
		el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
	};

	const handleNext = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!feedRef.current) return;

		const el = feedRef.current;
		const scrollAmount = el.clientWidth * 0.8;
		el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	};

	// Auto-slide for carousel
	useEffect(() => {
		if (
			attributes.layoutMode !== 'ts-feed-nowrap' ||
			!attributes.carouselAutoplay ||
			!feedRef.current ||
			context === 'editor'
		) {
			return;
		}

		const interval = setInterval(() => {
			if (!feedRef.current) return;

			const el = feedRef.current;
			const scrollLeft = el.scrollLeft;
			const scrollWidth = el.scrollWidth;
			const clientWidth = el.clientWidth;

			if (scrollLeft + clientWidth >= scrollWidth - 1) {
				// At the end, scroll back to start
				el.scrollTo({ left: 0, behavior: 'smooth' });
			} else {
				// Scroll to next
				el.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' });
			}
		}, attributes.carouselAutoplayInterval);

		return () => clearInterval(interval);
	}, [
		attributes.layoutMode,
		attributes.carouselAutoplay,
		attributes.carouselAutoplayInterval,
		context,
	]);

	// Build vxconfig for re-rendering
	const vxConfig: TermFeedVxConfig = {
		source: attributes.source,
		manualTermIds: attributes.manualTerms?.map((t) => t.term_id) || [],
		taxonomy: attributes.taxonomy,
		parentTermId: attributes.parentTermId,
		order: attributes.order,
		perPage: attributes.perPage,
		hideEmpty: attributes.hideEmpty,
		hideEmptyPostType: attributes.hideEmptyPostType,
		cardTemplate: attributes.cardTemplate,
		layoutMode: attributes.layoutMode,
		carouselItemWidth: attributes.carouselItemWidth,
		carouselItemWidthUnit: attributes.carouselItemWidthUnit,
		carouselAutoplay: attributes.carouselAutoplay,
		carouselAutoplayInterval: attributes.carouselAutoplayInterval,
		gridColumns: attributes.gridColumns,
		itemGap: attributes.itemGap,
		scrollPadding: attributes.scrollPadding,
		itemPadding: attributes.itemPadding,
		replaceAccentColor: attributes.replaceAccentColor,
		navHorizontalPosition: attributes.navHorizontalPosition,
		navVerticalPosition: attributes.navVerticalPosition,
		navButtonIconColor: attributes.navButtonIconColor,
		navButtonSize: attributes.navButtonSize,
		navButtonIconSize: attributes.navButtonIconSize,
		navButtonBackground: attributes.navButtonBackground,
		navBackdropBlur: attributes.navBackdropBlur,
		navBorderType: attributes.navBorderType,
		navBorderWidth: attributes.navBorderWidth,
		navBorderColor: attributes.navBorderColor,
		navBorderRadius: attributes.navBorderRadius,
		navButtonSizeHover: attributes.navButtonSizeHover,
		navButtonIconSizeHover: attributes.navButtonIconSizeHover,
		navButtonIconColorHover: attributes.navButtonIconColorHover,
		navButtonBackgroundHover: attributes.navButtonBackgroundHover,
		navButtonBorderColorHover: attributes.navButtonBorderColorHover,
		rightChevronIcon: attributes.rightChevronIcon,
		leftChevronIcon: attributes.leftChevronIcon,
		responsive: {},
	};

	// Build styles
	const feedStyles = buildFeedStyles();
	const { navListItemStyle, navButtonStyle } = buildNavStyles();

	// Build class names for feed container
	const feedClassNames = [
		'post-feed-grid',
		attributes.layoutMode,
		attributes.layoutMode === 'ts-feed-nowrap'
			? 'min-scroll min-scroll-h'
			: '',
	]
		.filter(Boolean)
		.join(' ');

	// Loading state - matches Voxel's ts-no-posts pattern
	if (isLoading) {
		return (
			<div className="term-feed-content">
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-no-posts">
					<span className="ts-loader" />
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="term-feed-content">
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div
					className="term-feed-error"
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '48px',
						backgroundColor: '#fef2f2',
						color: '#991b1b',
					}}
				>
					{error}
				</div>
			</div>
		);
	}

	// Empty state
	if (!terms || terms.length === 0) {
		return (
			<div className="term-feed-content">
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</div>
		);
	}

	// Render term feed - matches Voxel's term-feed.php structure exactly
	return (
		<div className="term-feed-content">
			{/* vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Term feed grid/carousel - matches Voxel */}
			<div
				ref={feedRef}
				className={feedClassNames}
				style={feedStyles}
				data-auto-slide={
					attributes.carouselAutoplay
						? attributes.carouselAutoplayInterval
						: 0
				}
			>
				{terms.map((term) => (
					<div
						key={term.id}
						className="ts-preview"
						data-term-id={term.id}
						style={buildItemStyles(attributes, term.color)}
					>
						{/* Render term card HTML from API */}
						{term.cardHtml ? (
							<div
								dangerouslySetInnerHTML={{
									__html: term.cardHtml,
								}}
							/>
						) : (
							// Fallback simple card if no template HTML
							<div className="ts-term-card">
								{term.icon && (
									<div
										className="ts-term-icon"
										dangerouslySetInnerHTML={{
											__html: term.icon,
										}}
									/>
								)}
								<div className="ts-term-name">{term.name}</div>
								{term.count > 0 && (
									<div className="ts-term-count">
										{term.count} {term.count === 1 ? 'item' : 'items'}
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Carousel navigation - matches Voxel's carousel-nav.php */}
			{attributes.layoutMode === 'ts-feed-nowrap' && (
				<ul className="simplify-ul flexify post-feed-nav">
					<li style={navListItemStyle}>
						<a
							href="#"
							className={`ts-icon-btn ts-prev-page ${!canScrollLeft ? 'disabled' : ''}`}
							aria-label="Previous"
							onClick={handlePrev}
							style={navButtonStyle}
						>
							{renderIcon(
								attributes.leftChevronIcon,
								VoxelIcons.chevronLeft
							)}
						</a>
					</li>
					<li style={navListItemStyle}>
						<a
							href="#"
							className={`ts-icon-btn ts-next-page ${!canScrollRight ? 'disabled' : ''}`}
							aria-label="Next"
							onClick={handleNext}
							style={navButtonStyle}
						>
							{renderIcon(
								attributes.rightChevronIcon,
								VoxelIcons.chevronRight
							)}
						</a>
					</li>
				</ul>
			)}
		</div>
	);
}
