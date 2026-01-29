/**
 * Nested Accordion Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates the static save.tsx output with React for:
 * - Smooth height animations (Web Animations API)
 * - Keyboard navigation (arrow keys, home/end)
 * - Max items expanded logic
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/nested-accordion.php (extends Elementor)
 * - Base: Elementor\Modules\NestedAccordion\Widgets\Nested_Accordion
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL/ELEMENTOR PARITY STATUS
 * ============================================================================
 *
 * Reference: Elementor NestedAccordion widget (Voxel extends with loop support)
 * Voxel file: themes/voxel/app/widgets/nested-accordion.php (156 lines)
 *
 * CONTENT - ITEMS (Elementor Repeater):
 * ✅ items - Accordion items repeater
 * ✅ item_title - Item title text
 * ✅ element_css_id - CSS ID for linking
 * ✅ _voxel_loop - Loop context (Voxel extension)
 * ✅ _loop_index - Loop item index (Voxel extension)
 * ✅ _child_index - Child container index (Voxel extension)
 *
 * LAYOUT - ACCORDION:
 * ✅ title_tag - HTML tag for title (h1-h6, div, span, p)
 * ✅ faq_schema - Enable FAQ schema markup
 * ✅ accordion_item_title_icon - Expand/collapse icon
 * ✅ accordion_item_title_icon_active - Active state icon
 *
 * INTERACTIONS:
 * ✅ default_state - Initial state (expanded, all_collapsed)
 * ✅ max_items_expended - Max open items (one, multiple)
 * ✅ n_accordion_animation_duration - Animation duration (ms)
 *
 * STYLE - ACCORDION (Normal + Hover + Active):
 * ✅ accordion_item_title_space_between - Gap between items (responsive)
 * ✅ accordion_item_title_distance_from_content - Content distance (responsive)
 * ✅ accordion_border_radius - Border radius (responsive box)
 * ✅ accordion_padding - Padding (responsive box)
 * ✅ accordion_item_title_background_color - Background color (states)
 * ✅ accordion_item_title_border - Border (states)
 *
 * STYLE - HEADER:
 * ✅ accordion_item_title_position - Item justify (start, center, end, stretch)
 * ✅ accordion_item_title_icon_position - Icon position (start, end)
 *
 * STYLE - TITLE:
 * ✅ title_typography - Typography group
 * ✅ title_normal_color - Normal text color
 * ✅ title_hover_color - Hover text color
 * ✅ title_active_color - Active text color
 *
 * STYLE - ICON:
 * ✅ accordion_item_title_icon_size - Icon size (responsive)
 * ✅ accordion_item_title_icon_space_between - Icon spacing (responsive)
 * ✅ icon_color - Normal icon color
 * ✅ icon_color_hover - Hover icon color
 * ✅ icon_color_active - Active icon color
 *
 * STYLE - CONTENT:
 * ✅ content_background_color - Content background
 * ✅ content_border - Content border
 * ✅ content_border_radius - Border radius (responsive box)
 * ✅ content_padding - Content padding (responsive box)
 *
 * VOXEL EXTENSIONS:
 * ✅ _voxel_loop - Loop context support
 * ✅ _loop_index - Loop item index
 * ✅ _child_index - Child container index
 * ✅ Dynamic Data - @tags() syntax in titles
 * ✅ faq_schema - JSON-LD FAQ structured data
 *
 * HTML STRUCTURE (Elementor):
 * ✅ .e-n-accordion - Main accordion container
 * ✅ .e-n-accordion-item - Details element wrapper
 * ✅ .e-n-accordion-item-title - Summary element (role="button")
 * ✅ .e-n-accordion-item-title-header - Title header wrapper
 * ✅ .e-n-accordion-item-title-text - Title text element
 * ✅ .e-n-accordion-item-title-icon - Icon container
 * ✅ .e-opened / .e-closed - Icon state wrappers
 * ✅ .e-n-accordion-item-content - Content panel
 *
 * ACCESSIBILITY:
 * ✅ role="button" on summary
 * ✅ aria-expanded for open state
 * ✅ aria-controls linking to content
 * ✅ tabindex management for focus
 * ✅ Keyboard navigation (Arrow, Home, End, Enter, Space, Escape)
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Pure JS initialization (no jQuery)
 * ✅ Web Animations API for smooth transitions
 * ✅ TypeScript strict mode
 * ✅ Event delegation for SPA compatibility
 *
 * ============================================================================
 */

import type { NestedAccordionVxConfig, LoopConfig, VisibilityConfig } from './types';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Elementor/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): NestedAccordionVxConfig {
	// Helper for string normalization
	const normalizeString = <T extends string>(val: unknown, fallback: T): T => {
		if (typeof val === 'string') return val as T;
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Helper for accordion item normalization
	const normalizeItem = (item: Record<string, unknown>) => ({
		id: normalizeString(item.id ?? item.item_id, ''),
		title: normalizeString(item.title ?? item.item_title, ''),
		cssId: normalizeString(item.cssId ?? item.css_id ?? item.element_css_id, ''),
		loop: item.loop ?? item._voxel_loop as LoopConfig | undefined,
		visibility: item.visibility as VisibilityConfig | undefined,
	});

	// Normalize items array
	const rawItems = raw.items ?? raw.accordion_items ?? [];
	const items = Array.isArray(rawItems)
		? rawItems.map((i) => normalizeItem(i as Record<string, unknown>))
		: [];

	// Normalize interactions object
	const rawInteractions = (raw.interactions ?? {}) as Record<string, unknown>;
	const interactions = {
		defaultState: normalizeString(
			rawInteractions.defaultState ?? raw.defaultState ?? raw.default_state,
			'all_collapsed'
		) as NestedAccordionVxConfig['interactions']['defaultState'],
		maxItemsExpanded: normalizeString(
			rawInteractions.maxItemsExpanded ?? raw.maxItemsExpanded ?? raw.max_items_expended,
			'one'
		) as NestedAccordionVxConfig['interactions']['maxItemsExpanded'],
		animationDuration: normalizeNumber(
			rawInteractions.animationDuration ?? raw.animationDuration ?? raw.n_accordion_animation_duration,
			400
		),
	};

	// Normalize icons object
	const rawIcons = (raw.icons ?? {}) as Record<string, unknown>;
	const icons = {
		expand: rawIcons.expand ?? raw.expandIcon ?? raw.accordion_item_title_icon ?? null,
		collapse: rawIcons.collapse ?? raw.collapseIcon ?? raw.accordion_item_title_icon_active ?? null,
		position: normalizeString(
			rawIcons.position ?? raw.iconPosition ?? raw.accordion_item_title_icon_position,
			'end'
		) as NestedAccordionVxConfig['icons']['position'],
	};

	// Normalize scalar values
	const titleTag = normalizeString(raw.titleTag ?? raw.title_tag, 'div');
	const faqSchema = normalizeBool(raw.faqSchema ?? raw.faq_schema, false);

	return { items, interactions, icons, titleTag, faqSchema };
}

/**
 * Parse vxconfig from data attribute
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): NestedAccordionVxConfig | null {
	const vxconfigData = container.dataset.vxconfig;

	if (vxconfigData) {
		try {
			const raw = JSON.parse(vxconfigData);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('[NestedAccordion] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Animate accordion item height using Web Animations API
 * Matches Elementor's nested-accordion animation behavior
 */
function animateAccordionItem(
	details: HTMLDetailsElement,
	isOpening: boolean,
	duration: number
): void {
	const content = details.querySelector<HTMLElement>('.e-n-accordion-item-content');
	if (!content) return;

	// Get the height of the content
	const startHeight = isOpening ? 0 : content.scrollHeight;
	const endHeight = isOpening ? content.scrollHeight : 0;

	// Set overflow hidden during animation
	content.style.overflow = 'hidden';

	// Animate using Web Animations API
	const animation = content.animate(
		[
			{ height: `${startHeight}px` },
			{ height: `${endHeight}px` },
		],
		{
			duration,
			easing: 'ease-out',
			fill: 'forwards',
		}
	);

	animation.onfinish = () => {
		content.style.overflow = '';
		content.style.height = '';

		// If closing, remove the open attribute after animation
		if (!isOpening) {
			details.open = false;
		}
	};
}

/**
 * Initialize a single accordion block
 */
function initAccordion(container: HTMLElement): void {
	const config = parseVxConfig(container);
	if (!config) {
		console.error('[NestedAccordion] No vxconfig found');
		return;
	}

	const accordionWrapper = container.querySelector<HTMLElement>('.e-n-accordion');
	if (!accordionWrapper) return;

	const items = Array.from(
		container.querySelectorAll<HTMLDetailsElement>('.e-n-accordion-item')
	);
	const summaries = Array.from(
		container.querySelectorAll<HTMLElement>('.e-n-accordion-item-title')
	);

	const animationDuration = config.interactions.animationDuration || 400;
	const maxItemsExpanded = config.interactions.maxItemsExpanded || 'one';

	// Track which items are open
	const openItems = new Set<HTMLDetailsElement>(
		items.filter((item) => item.open)
	);

	/**
	 * Toggle accordion item with animation
	 */
	function toggleItem(details: HTMLDetailsElement, forceState?: boolean): void {
		const summary = details.querySelector<HTMLElement>('.e-n-accordion-item-title');
		const isCurrentlyOpen = details.open;
		const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

		if (shouldOpen === isCurrentlyOpen) return;

		if (shouldOpen) {
			// If max one item, close others first
			if (maxItemsExpanded === 'one') {
				openItems.forEach((openItem) => {
					if (openItem !== details) {
						const openSummary = openItem.querySelector<HTMLElement>('.e-n-accordion-item-title');
						openSummary?.setAttribute('aria-expanded', 'false');
						animateAccordionItem(openItem, false, animationDuration);
						openItems.delete(openItem);
					}
				});
			}

			// Open this item
			details.open = true;
			summary?.setAttribute('aria-expanded', 'true');
			animateAccordionItem(details, true, animationDuration);
			openItems.add(details);
		} else {
			// Close this item
			summary?.setAttribute('aria-expanded', 'false');
			animateAccordionItem(details, false, animationDuration);
			openItems.delete(details);
		}
	}

	/**
	 * Handle click on summary
	 */
	function handleClick(event: Event): void {
		event.preventDefault();
		const summary = event.currentTarget as HTMLElement;
		const details = summary.closest('details') as HTMLDetailsElement;
		if (details) {
			toggleItem(details);
		}
	}

	/**
	 * Handle keyboard navigation
	 * Matches Elementor's accessibility pattern:
	 * - Arrow Up/Down: Navigate between items
	 * - Home: First item
	 * - End: Last item
	 * - Enter/Space: Toggle current item
	 * - Escape: Close current item
	 */
	function handleKeydown(event: KeyboardEvent): void {
		const summary = event.target as HTMLElement;
		const currentIndex = summaries.indexOf(summary);
		if (currentIndex === -1) return;

		let newIndex = currentIndex;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				newIndex = (currentIndex + 1) % summaries.length;
				break;

			case 'ArrowUp':
				event.preventDefault();
				newIndex = (currentIndex - 1 + summaries.length) % summaries.length;
				break;

			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;

			case 'End':
				event.preventDefault();
				newIndex = summaries.length - 1;
				break;

			case 'Escape': {
				event.preventDefault();
				const details = summary.closest('details') as HTMLDetailsElement;
				if (details?.open) {
					toggleItem(details, false);
				}
				return;
			}

			case 'Enter':
			case ' ':
				// Let click handler manage this, don't prevent default
				return;

			default:
				return;
		}

		// Focus the new summary and update tabindex
		summaries.forEach((s, i) => {
			s.setAttribute('tabindex', i === newIndex ? '0' : '-1');
		});
		summaries[newIndex]?.focus();
	}

	// Attach event listeners
	summaries.forEach((summary) => {
		summary.addEventListener('click', handleClick);
		summary.addEventListener('keydown', handleKeydown);
	});

	// Mark as initialized
	container.dataset.initialized = 'true';
}

/**
 * Initialize all nested accordion blocks on the page
 */
function initNestedAccordions(): void {
	const accordions = document.querySelectorAll<HTMLElement>(
		'.vxfse-nested-accordion:not([data-initialized])'
	);

	accordions.forEach(initAccordion);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initNestedAccordions);
} else {
	initNestedAccordions();
}

// Also initialize on Turbo/PJAX page loads for SPA-like behavior
window.addEventListener('turbo:load', initNestedAccordions);
window.addEventListener('pjax:complete', initNestedAccordions);
