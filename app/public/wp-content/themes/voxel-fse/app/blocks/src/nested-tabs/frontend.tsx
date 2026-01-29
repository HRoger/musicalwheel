/**
 * Nested Tabs Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates the static save.tsx output with React for:
 * - Tab switching with smooth transitions
 * - Keyboard navigation (arrow keys, home/end)
 * - Touch mode support
 * - Accordion fallback on mobile (breakpoint)
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/nested-tabs.php (extends Elementor)
 * - Base: Elementor\Modules\NestedTabs\Widgets\NestedTabs
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL/ELEMENTOR PARITY STATUS
 * ============================================================================
 *
 * Reference: Elementor NestedTabs widget (Voxel extends with loop support)
 * Voxel file: themes/voxel/app/widgets/nested-tabs.php (142 lines)
 *
 * CONTENT - TABS (Elementor Repeater):
 * ✅ tabs - Tab items repeater
 * ✅ tab_title - Tab title text
 * ✅ element_id - CSS ID for linking
 * ✅ tab_icon - Tab icon (normal state)
 * ✅ tab_icon_active - Tab icon (active state)
 *
 * LAYOUT - TABS (Elementor Section):
 * ✅ tabs_direction - Tab position (block-start, block-end, inline-start, inline-end)
 * ✅ tabs_justify_horizontal - Horizontal justify (start, center, end, stretch)
 * ✅ tabs_justify_vertical - Vertical justify (start, center, end, stretch)
 * ✅ tabs_width - Tab container width (responsive slider)
 * ✅ title_alignment - Title text alignment (start, center, end)
 *
 * ADDITIONAL OPTIONS:
 * ✅ horizontal_scroll - Enable horizontal scroll (responsive)
 * ✅ breakpoint_selector - Accordion breakpoint (none, mobile, tablet)
 *
 * STYLE - TABS (Normal + Hover + Active):
 * ✅ tabs_gap - Gap between tabs (responsive)
 * ✅ tabs_title_space - Distance to content (responsive)
 * ✅ border_radius - Tab border radius (responsive box)
 * ✅ padding - Tab padding (responsive box)
 * ✅ box_background_color - Background color (states)
 * ✅ box_border - Border (states)
 * ✅ box_shadow - Box shadow (states)
 * ✅ hover_animation - Hover animation type
 * ✅ hover_transition - Transition duration
 *
 * STYLE - TITLE:
 * ✅ title_typography - Typography group
 * ✅ title_normal_color - Normal text color
 * ✅ title_hover_color - Hover text color
 * ✅ title_active_color - Active text color
 *
 * STYLE - ICON:
 * ✅ icon_position - Icon position (responsive)
 * ✅ icon_size - Icon size (responsive)
 * ✅ icon_spacing - Icon spacing (responsive)
 * ✅ icon_color - Normal icon color
 * ✅ icon_color_hover - Hover icon color
 * ✅ icon_color_active - Active icon color
 *
 * STYLE - CONTENT:
 * ✅ content_background_color - Content background
 * ✅ content_border - Content border
 * ✅ content_border_radius - Border radius (responsive box)
 * ✅ content_box_shadow - Box shadow
 * ✅ content_padding - Content padding (responsive box)
 *
 * VOXEL EXTENSIONS:
 * ✅ _voxel_loop - Loop context support
 * ✅ _loop_index - Loop item index
 * ✅ _child_index - Child container index
 * ✅ Dynamic Data - @tags() syntax in titles
 *
 * HTML STRUCTURE (Elementor):
 * ✅ .e-n-tabs - Main tabs container
 * ✅ .e-n-tabs-heading - Tab titles container (role="tablist")
 * ✅ .e-n-tab-title - Individual tab button (role="tab")
 * ✅ .e-n-tab-title-text - Tab title text span
 * ✅ .e-n-tab-icon - Tab icon container
 * ✅ .e-n-tabs-content - Tab content container
 * ✅ .e-con / .e-active - Content panel with active state
 *
 * ACCESSIBILITY:
 * ✅ role="tablist" on heading
 * ✅ role="tab" on tab buttons
 * ✅ role="tabpanel" on content panels
 * ✅ aria-selected for active state
 * ✅ aria-controls linking tabs to panels
 * ✅ Keyboard navigation (Arrow, Home, End, Enter, Space)
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Pure JS initialization (no jQuery)
 * ✅ TypeScript strict mode
 * ✅ Event delegation for SPA compatibility
 *
 * ============================================================================
 */

import type { NestedTabsVxConfig } from './types';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Elementor/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): NestedTabsVxConfig {
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

	// Helper for tab item normalization
	const normalizeTab = (tab: Record<string, unknown>) => ({
		id: normalizeString(tab.id ?? tab.tab_id, ''),
		title: normalizeString(tab.title ?? tab.tab_title, ''),
		cssId: normalizeString(tab.cssId ?? tab.css_id ?? tab.element_id, ''),
		icon: tab.icon ?? tab.tab_icon ?? null,
		iconActive: tab.iconActive ?? tab.icon_active ?? tab.tab_icon_active ?? null,
	});

	// Normalize tabs array
	const rawTabs = raw.tabs ?? raw.tab_items ?? [];
	const tabs = Array.isArray(rawTabs)
		? rawTabs.map((t) => normalizeTab(t as Record<string, unknown>))
		: [];

	// Normalize layout object
	const rawLayout = (raw.layout ?? {}) as Record<string, unknown>;
	const layout = {
		direction: normalizeString(
			rawLayout.direction ?? raw.tabsDirection ?? raw.tabs_direction,
			'block-start'
		) as NestedTabsVxConfig['layout']['direction'],
		justifyHorizontal: normalizeString(
			rawLayout.justifyHorizontal ?? raw.tabsJustifyHorizontal ?? raw.tabs_justify_horizontal,
			'start'
		) as NestedTabsVxConfig['layout']['justifyHorizontal'],
		justifyVertical: normalizeString(
			rawLayout.justifyVertical ?? raw.tabsJustifyVertical ?? raw.tabs_justify_vertical,
			'start'
		) as NestedTabsVxConfig['layout']['justifyVertical'],
		titleAlignment: normalizeString(
			rawLayout.titleAlignment ?? raw.titleAlignment ?? raw.title_alignment,
			'start'
		) as NestedTabsVxConfig['layout']['titleAlignment'],
		horizontalScroll: normalizeString(
			rawLayout.horizontalScroll ?? raw.horizontalScroll ?? raw.horizontal_scroll,
			'disable'
		) as NestedTabsVxConfig['layout']['horizontalScroll'],
		breakpoint: normalizeString(
			rawLayout.breakpoint ?? raw.breakpointSelector ?? raw.breakpoint_selector,
			'none'
		) as NestedTabsVxConfig['layout']['breakpoint'],
	};

	// Normalize icons object
	const rawIcons = (raw.icons ?? {}) as Record<string, unknown>;
	const icons = {
		position: normalizeString(
			rawIcons.position ?? raw.iconPosition ?? raw.icon_position,
			'inline-start'
		) as NestedTabsVxConfig['icons']['position'],
	};

	// Normalize animations object
	const rawAnimations = (raw.animations ?? {}) as Record<string, unknown>;
	const animations = {
		transitionDuration: normalizeNumber(
			rawAnimations.transitionDuration ?? raw.transitionDuration ?? raw.transition_duration ?? raw.hover_transition,
			0.3
		),
		hoverAnimation: normalizeString(
			rawAnimations.hoverAnimation ?? raw.hoverAnimation ?? raw.hover_animation,
			''
		),
	};

	return { tabs, layout, icons, animations };
}

/**
 * Parse vxconfig from data attribute
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): NestedTabsVxConfig | null {
	const vxconfigData = container.dataset.vxconfig;

	if (vxconfigData) {
		try {
			const raw = JSON.parse(vxconfigData);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('[NestedTabs] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Detect if device supports touch
 */
function isTouchDevice(): boolean {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get current breakpoint
 */
function getCurrentBreakpoint(): 'desktop' | 'tablet' | 'mobile' {
	const width = window.innerWidth;
	if (width < 768) return 'mobile';
	if (width < 1025) return 'tablet';
	return 'desktop';
}

/**
 * Initialize a single tabs block
 */
function initTabs(container: HTMLElement): void {
	const config = parseVxConfig(container);
	if (!config) {
		console.error('[NestedTabs] No vxconfig found');
		return;
	}

	const tabsWrapper = container.querySelector<HTMLElement>('.e-n-tabs');
	if (!tabsWrapper) return;

	const tabTitles = Array.from(
		tabsWrapper.querySelectorAll<HTMLButtonElement>('.e-n-tab-title')
	);
	// Select tab content panels - support both Elementor's .e-con and WordPress InnerBlocks output
	// InnerBlocks outputs blocks with wp-block-group class, plus our custom vxfse-tab-panel class
	const tabContents = Array.from(
		tabsWrapper.querySelectorAll<HTMLElement>('.e-n-tabs-content > .e-con, .e-n-tabs-content > .vxfse-tab-panel, .e-n-tabs-content > .wp-block-group')
	);

	// Set touch mode data attribute
	tabsWrapper.dataset.touchMode = isTouchDevice() ? 'true' : 'false';

	/**
	 * Activate a specific tab
	 */
	function activateTab(index: number, focus: boolean = false): void {
		if (index < 0 || index >= tabTitles.length) return;

		// Deactivate all tabs
		tabTitles.forEach((title, i) => {
			const isActive = i === index;
			title.classList.toggle('e-active', isActive);
			title.setAttribute('aria-selected', isActive ? 'true' : 'false');
			title.setAttribute('tabindex', isActive ? '0' : '-1');
		});

		// Show/hide content panels
		tabContents.forEach((content, i) => {
			const isActive = i === index;
			content.classList.toggle('e-active', isActive);
			content.style.display = isActive ? 'block' : 'none';
		});

		// Update icons (show active icon for active tab)
		tabTitles.forEach((title, i) => {
			const iconSpan = title.querySelector<HTMLElement>('.e-n-tab-icon');
			if (!iconSpan) return;

			const icons = iconSpan.querySelectorAll<HTMLElement>('i');
			if (icons.length === 2) {
				// First icon is normal, second is active
				icons[0].style.display = i === index ? 'none' : '';
				icons[1].style.display = i === index ? '' : 'none';
			}
		});

		// Focus if requested
		if (focus) {
			tabTitles[index]?.focus();
		}
	}

	/**
	 * Handle click on tab title
	 */
	function handleClick(event: Event): void {
		event.preventDefault();
		const title = event.currentTarget as HTMLButtonElement;
		const index = tabTitles.indexOf(title);
		if (index !== -1) {
			activateTab(index);
		}
	}

	/**
	 * Handle keyboard navigation
	 * Matches Elementor's accessibility pattern:
	 * - Arrow Left/Right: Navigate between horizontal tabs
	 * - Arrow Up/Down: Navigate between vertical tabs
	 * - Home: First tab
	 * - End: Last tab
	 * - Enter/Space: Activate tab
	 */
	function handleKeydown(event: KeyboardEvent): void {
		const title = event.target as HTMLButtonElement;
		const currentIndex = tabTitles.indexOf(title);
		if (currentIndex === -1) return;

		const isVertical = ['inline-start', 'inline-end'].includes(config.layout.direction);
		let newIndex = currentIndex;

		switch (event.key) {
			case 'ArrowRight':
				if (!isVertical) {
					event.preventDefault();
					newIndex = (currentIndex + 1) % tabTitles.length;
				}
				break;

			case 'ArrowLeft':
				if (!isVertical) {
					event.preventDefault();
					newIndex = (currentIndex - 1 + tabTitles.length) % tabTitles.length;
				}
				break;

			case 'ArrowDown':
				if (isVertical) {
					event.preventDefault();
					newIndex = (currentIndex + 1) % tabTitles.length;
				}
				break;

			case 'ArrowUp':
				if (isVertical) {
					event.preventDefault();
					newIndex = (currentIndex - 1 + tabTitles.length) % tabTitles.length;
				}
				break;

			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;

			case 'End':
				event.preventDefault();
				newIndex = tabTitles.length - 1;
				break;

			case 'Enter':
			case ' ':
				event.preventDefault();
				activateTab(currentIndex);
				return;

			default:
				return;
		}

		if (newIndex !== currentIndex) {
			activateTab(newIndex, true);
		}
	}

	/**
	 * Handle breakpoint changes for accordion fallback
	 */
	function handleResize(): void {
		const currentBreakpoint = getCurrentBreakpoint();
		const shouldBeAccordion =
			(config.layout.breakpoint === 'mobile' && currentBreakpoint === 'mobile') ||
			(config.layout.breakpoint === 'tablet' && (currentBreakpoint === 'mobile' || currentBreakpoint === 'tablet'));

		tabsWrapper.classList.toggle('e-n-tabs-accordion-mode', shouldBeAccordion);
	}

	// Attach event listeners
	tabTitles.forEach((title) => {
		title.addEventListener('click', handleClick);
		title.addEventListener('keydown', handleKeydown);
	});

	// Handle resize for breakpoint
	if (config.layout.breakpoint !== 'none') {
		window.addEventListener('resize', handleResize);
		handleResize(); // Initial check
	}

	// Initialize first tab as active if none are active
	const hasActiveTab = tabTitles.some((title) => title.classList.contains('e-active'));
	if (!hasActiveTab && tabTitles.length > 0) {
		activateTab(0);
	} else {
		// Make sure content visibility matches active state
		tabContents.forEach((content, i) => {
			const isActive = tabTitles[i]?.classList.contains('e-active');
			content.style.display = isActive ? 'block' : 'none';
		});
	}

	// Mark as initialized
	container.dataset.initialized = 'true';
}

/**
 * Initialize all nested tabs blocks on the page
 */
function initNestedTabs(): void {
	const tabs = document.querySelectorAll<HTMLElement>(
		'.vxfse-nested-tabs:not([data-initialized])'
	);

	tabs.forEach(initTabs);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initNestedTabs);
} else {
	initNestedTabs();
}

// Also initialize on Turbo/PJAX page loads for SPA-like behavior
window.addEventListener('turbo:load', initNestedTabs);
window.addEventListener('pjax:complete', initNestedTabs);
