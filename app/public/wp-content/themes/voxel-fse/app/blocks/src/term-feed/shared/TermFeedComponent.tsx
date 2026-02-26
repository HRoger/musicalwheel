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

import { useRef, useEffect, useCallback } from 'react';
import type {
	TermFeedAttributes,
	TermFeedVxConfig,
		TermFeedComponentProps,
} from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons, renderIcon } from '@shared/utils';
import { generateTermFeedResponsiveCSS } from '../styles';

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
	cssSelector,
}: TermFeedComponentProps) {
	const feedRef = useRef<HTMLDivElement>(null);
	const prevBtnRef = useRef<HTMLAnchorElement>(null);
	const nextBtnRef = useRef<HTMLAnchorElement>(null);

	// Manage 'disabled' class on nav buttons entirely via refs.
	// Matches Voxel carousel-nav.php: frontend starts with 'disabled' (opacity:0),
	// commons.js removes it if scrollWidth > clientWidth.
	//
	// CRITICAL: We CANNOT put 'disabled' in JSX className because React
	// re-renders (e.g. after voxel:markup-update) would overwrite any
	// ref-based removal. Instead, we add/remove 'disabled' entirely via
	// DOM manipulation so React's render cycle never touches it.
	useEffect(() => {
		if (context === 'editor') return; // Editor never has disabled class
		const prev = prevBtnRef.current;
		const next = nextBtnRef.current;
		if (!prev || !next) return;

		// Add disabled initially (matches carousel-nav.php: !is_admin)
		prev.classList.add('disabled');
		next.classList.add('disabled');

		const el = feedRef.current;
		if (!el || attributes.layoutMode !== 'ts-feed-nowrap') return;

		const checkOverflow = () => {
			requestAnimationFrame(() => {
				if (el && el.scrollWidth > el.clientWidth) {
					prev.classList.remove('disabled');
					next.classList.remove('disabled');
				}
			});
		};

		checkOverflow();
		window.addEventListener('resize', checkOverflow);
		return () => window.removeEventListener('resize', checkOverflow);
	}, [terms, context, attributes.layoutMode, attributes.carouselItemWidth, attributes.itemGap, attributes.scrollPadding]);

	// Handle carousel navigation — wrapping scroll (matches Voxel commons.js)
	// Voxel wraps: at the end, prev scrolls to end; at the start, next scrolls to start
	const handlePrev = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		const el = feedRef.current;
		if (!el) return;
		const firstItem = el.querySelector<HTMLElement>('.ts-preview');
		const itemWidth = firstItem?.scrollWidth || 300;
		// If at or near the start, wrap to the end (matches Voxel's circular logic)
		if (Math.abs(el.scrollLeft) <= 10) {
			el.scrollBy({ left: el.scrollWidth - el.clientWidth - el.scrollLeft, behavior: 'smooth' });
		} else {
			el.scrollBy({ left: -itemWidth, behavior: 'smooth' });
		}
	}, []);

	const handleNext = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		const el = feedRef.current;
		if (!el) return;
		const firstItem = el.querySelector<HTMLElement>('.ts-preview');
		const itemWidth = firstItem?.scrollWidth || 300;
		// If at or near the end, wrap to the start (matches Voxel's circular logic)
		if (el.clientWidth + Math.abs(el.scrollLeft) + 10 >= el.scrollWidth) {
			el.scrollBy({ left: -el.scrollLeft, behavior: 'smooth' });
		} else {
			el.scrollBy({ left: itemWidth, behavior: 'smooth' });
		}
	}, []);

	// Autoplay with hover-pause (matches Voxel's setInterval approach)
	useEffect(() => {
		if (attributes.layoutMode !== 'ts-feed-nowrap' || !attributes.carouselAutoplay || !feedRef.current) return;
		if (context === 'editor') return;

		const interval = attributes.carouselAutoplayInterval || 3000;
		if (interval < 20) return;

		let isHovered = false;
		const container = feedRef.current.closest('.voxel-fse-term-feed') || feedRef.current;
		const onEnter = () => { isHovered = true; };
		const onLeave = () => { isHovered = false; };
		container?.addEventListener('mouseenter', onEnter);
		container?.addEventListener('mouseleave', onLeave);

		const timer = setInterval(() => {
			if (!isHovered && feedRef.current) {
				const el = feedRef.current;
				const firstItem = el.querySelector<HTMLElement>('.ts-preview');
				const itemWidth = firstItem?.scrollWidth || 300;
				el.scrollBy({ left: itemWidth, behavior: 'smooth' });
			}
		}, interval);

		return () => {
			clearInterval(timer);
			container?.removeEventListener('mouseenter', onEnter);
			container?.removeEventListener('mouseleave', onLeave);
		};
	}, [attributes.layoutMode, attributes.carouselAutoplay, attributes.carouselAutoplayInterval, context]);

	// Prevent link navigation in editor (matches Elementor's onLinkClick behavior)
	// Skip carousel nav buttons (.ts-icon-btn) so arrows still work
	const handleEditorClick = useCallback((e: React.MouseEvent) => {
		if (context !== 'editor') return;
		const target = (e.target as HTMLElement).closest('a');
		if (target && !target.closest('.post-feed-nav')) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, [context]);

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

	// Generate responsive CSS (carousel item width, gap, nav styles, etc.)
	const responsiveCSS = cssSelector ? generateTermFeedResponsiveCSS(attributes, cssSelector) : '';

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
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// Render term feed - matches Voxel's term-feed.php structure exactly
	return (
		<div className="term-feed-content" onClickCapture={handleEditorClick}>
			{/* vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Responsive layout CSS (carousel widths, gap, nav styles) */}
			{responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
			)}

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
			{/* Voxel behavior (carousel-nav.php lines 4,9):
			    - Frontend (!is_admin): arrows start with 'disabled' class (opacity:0),
			      commons.js removes it if scrollWidth > clientWidth
			    - Editor (is_admin): no 'disabled' class, arrows always visible */}
			{attributes.layoutMode === 'ts-feed-nowrap' && (
				<ul className="simplify-ul flexify post-feed-nav">
					<li style={navListItemStyle}>
						<a
							ref={prevBtnRef}
							href="#"
							className="ts-icon-btn ts-prev-page"
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
							ref={nextBtnRef}
							href="#"
							className="ts-icon-btn ts-next-page"
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
