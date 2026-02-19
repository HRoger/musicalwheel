/**
 * Navbar Block - Frontend Entry Point (Plan C+)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches menu data from REST API for headless-ready rendering.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/navbar.php
 * - Voxel template: themes/voxel/templates/widgets/navbar.php
 * - REST API: /voxel-fse/v1/navbar/menu
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/navbar.php (1,183 lines)
 *
 * SOURCE TYPES (4):
 * ✅ add_links_manually - Manual repeater links
 * ✅ select_wp_menu - WordPress registered menus
 * ✅ template_tabs - Link to Template Tabs widget
 * ✅ search_form - Link to Search Form widget
 *
 * SETTINGS:
 * ✅ Orientation: horizontal/vertical
 * ✅ Collapsible (for vertical) - collapsed/expanded width
 * ✅ Justify: left/center/right/space-between/space-around
 * ✅ Hamburger menu settings (title, show on desktop/tablet)
 * ✅ Show menu label option
 * ✅ Icons: hamburger, close
 *
 * MANUAL ITEMS (repeater):
 * ✅ Title, Icon, Link (URL, external, nofollow)
 * ✅ Active state toggle
 *
 * MENU FEATURES:
 * ✅ Multi-column popup menu (custom_menu_cols, set_menu_cols)
 * ✅ Icon display options (show/hide, icon on top)
 * ✅ Custom popup styles (backdrop, shadow, dimensions)
 * ✅ Current/hover/active item states
 * ✅ Chevron for dropdown items
 * ✅ Horizontal scroll on overflow
 *
 * HTML STRUCTURE:
 * ✅ .ts-nav / .ts-nav-horizontal / .ts-nav-vertical
 * ✅ .ts-wp-menu / .menu-item / .ts-item-link
 * ✅ .ts-mobile-menu / hamburger button
 * ✅ .ts-item-icon / .ts-down-icon (chevron)
 * ✅ .current-menu-item active state
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ NavbarComponent accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ REST API endpoint for headless menu fetching
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   source: 'add_links_manually' | 'select_wp_menu' | 'template_tabs' | 'search_form',
 *   menuLocation: string,
 *   mobileMenuLocation: string,
 *   orientation: 'horizontal' | 'vertical',
 *   justify: 'left' | 'center' | 'right' | 'space-between' | 'space-around',
 *   collapsible: boolean,
 *   collapsedWidth: number,
 *   expandedWidth: number,
 *   hamburgerTitle: string,
 *   showBurgerDesktop: boolean,
 *   showBurgerTablet: boolean,
 *   showMenuLabel: boolean,
 *   hamburgerIcon: VoxelIcon,
 *   closeIcon: VoxelIcon,
 *   manualItems: NavbarManualItem[],
 *   showIcon: 'flex' | 'none',
 *   iconOnTop: boolean,
 *   customPopupEnabled: boolean,
 *   multiColumnMenu: boolean,
 *   menuColumns: number
 * }
 *
 * REST API: GET voxel-fse/v1/navbar/menu?location={location}
 * Returns: NavbarMenuApiResponse with menu items
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import NavbarComponent from './shared/NavbarComponent';
import type {
	NavbarAttributes,
	NavbarVxConfig,
	NavbarMenuApiResponse,
	VoxelIcon,
	NavbarManualItem,
	LinkedPostTypeData,
} from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Default icon structure
 */
const DEFAULT_ICON: VoxelIcon = {
	library: '',
	value: '',
};

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: themes/voxel/app/widgets/navbar.php control names
 */
function normalizeConfig(raw: Record<string, unknown>): any {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseInt(val, 10);
			return isNaN(parsed) ? fallback : parsed;
		}
		return fallback;
	};

	// Helper for icon normalization
	const normalizeIcon = (val: unknown): VoxelIcon => {
		if (val && typeof val === 'object') {
			const iconObj = val as Record<string, unknown>;
			return {
				library: normalizeString(iconObj.library, '') as any,
				value: normalizeString(iconObj.value, ''),
			};
		}
		return { ...DEFAULT_ICON };
	};

	// Helper for manual items normalization
	const normalizeManualItems = (val: unknown): NavbarManualItem[] => {
		if (!val) return [];
		if (!Array.isArray(val)) {
			// Handle object format (keyed by ID)
			if (typeof val === 'object') {
				return Object.entries(val).map(([key, item]: [string, unknown]) => {
					const itemObj = item as Record<string, unknown>;
					return {
						id: normalizeString(itemObj.id ?? key, key),
						text: normalizeString(itemObj.text ?? itemObj.ts_navbar_item_text, ''),
						icon: normalizeIcon(itemObj.icon ?? itemObj.ts_navbar_item_icon),
						url: normalizeString(itemObj.url ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.url, ''),
						isExternal: normalizeBool(itemObj.isExternal ?? itemObj.is_external ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.is_external, false),
						nofollow: normalizeBool(itemObj.nofollow ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.nofollow, false),
						isActive: normalizeBool(itemObj.isActive ?? itemObj.is_active ?? itemObj.navbar_item__active, false),
					} as any;
				});
			}
			return [];
		}
		return val.map((item: unknown, index: number) => {
			const itemObj = (item ?? {}) as Record<string, unknown>;
			return {
				id: normalizeString(itemObj.id, `item-${index}`),
				text: normalizeString(itemObj.text ?? itemObj.ts_navbar_item_text, ''),
				icon: normalizeIcon(itemObj.icon ?? itemObj.ts_navbar_item_icon),
				url: normalizeString(itemObj.url ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.url, ''),
				isExternal: normalizeBool(itemObj.isExternal ?? itemObj.is_external ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.is_external, false),
				nofollow: normalizeBool(itemObj.nofollow ?? (itemObj.ts_navbar_item_link as Record<string, unknown>)?.nofollow, false),
				isActive: normalizeBool(itemObj.isActive ?? itemObj.is_active ?? itemObj.navbar_item__active, false),
			} as any;
		});
	};

	return {
		// Source - support both camelCase and snake_case
		source: normalizeString(
			raw.source ?? raw.navbar_choose_source,
			'add_links_manually'
		) as NavbarVxConfig['source'],

		// Menu locations
		menuLocation: normalizeString(
			raw.menuLocation ?? raw.menu_location ?? raw.ts_choose_menu,
			''
		),
		mobileMenuLocation: normalizeString(
			raw.mobileMenuLocation ?? raw.mobile_menu_location ?? raw.ts_choose_mobile_menu,
			''
		),

		// Layout settings
		orientation: normalizeString(
			raw.orientation ?? raw.ts_navbar_orientation,
			'horizontal'
		) as NavbarVxConfig['orientation'],
		justify: normalizeString(
			raw.justify ?? raw.ts_navbar_justify,
			'left'
		) as NavbarVxConfig['justify'],

		// Collapsible settings
		collapsible: normalizeBool(raw.collapsible ?? raw.ts_collapsed, false),
		collapsedWidth: normalizeNumber(raw.collapsedWidth ?? raw.collapsed_width ?? raw.collapsible_min_width, 60),
		expandedWidth: normalizeNumber(raw.expandedWidth ?? raw.expanded_width ?? raw.collapsible_max_width, 280),

		// Hamburger settings
		hamburgerTitle: normalizeString(raw.hamburgerTitle ?? raw.hamburger_title, 'Menu'),
		showBurgerDesktop: normalizeBool(raw.showBurgerDesktop ?? raw.show_burger_desktop, false),
		showBurgerTablet: normalizeBool(raw.showBurgerTablet ?? raw.show_burger_tablet, true),
		showMenuLabel: normalizeBool(raw.showMenuLabel ?? raw.show_menu_label, false),

		// Icons
		hamburgerIcon: normalizeIcon(raw.hamburgerIcon ?? raw.hamburger_icon ?? raw.ts_mobile_menu_icon),
		closeIcon: normalizeIcon(raw.closeIcon ?? raw.close_icon ?? raw.ts_close_ico),

		// Manual items
		manualItems: normalizeManualItems(raw.manualItems ?? raw.manual_items ?? raw.ts_navbar_items),

		// Icon display
		showIcon: normalizeString(
			raw.showIcon ?? raw.show_icon ?? raw.ts_action_icon_show,
			'flex'
		) as NavbarVxConfig['showIcon'],
		iconOnTop: normalizeBool(raw.iconOnTop ?? raw.icon_on_top ?? raw.action_icon_orient, false),

		// Popup settings
		customPopupEnabled: normalizeBool(raw.customPopupEnabled ?? raw.custom_popup_enabled ?? raw.custom_popup_enable, false),
		multiColumnMenu: normalizeBool(raw.multiColumnMenu ?? raw.multi_column_menu ?? raw.custom_menu_cols, false),
		menuColumns: normalizeNumber(raw.menuColumns ?? raw.menu_columns ?? raw.set_menu_cols, 1),

		// Linked block IDs
		searchFormId: normalizeString(raw.searchFormId ?? raw.search_form_id, ''),
		templateTabsId: normalizeString(raw.templateTabsId ?? raw.template_tabs_id, ''),
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): NavbarVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent);
			// Use normalizeConfig for consistent format handling
			return normalizeConfig(rawConfig);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Fetch menu items for a location
 */
async function fetchMenuItems(
	location: string
): Promise<NavbarMenuApiResponse | null> {
	if (!location) return null;

	const restUrl = getRestUrl();

	try {
		const headers: HeadersInit = {};
		const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(
			`${restUrl}voxel-fse/v1/navbar/menu?location=${encodeURIComponent(location)}`,
			{
				credentials: 'same-origin',
				headers,
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return (await response.json()) as NavbarMenuApiResponse;
	} catch (error) {
		console.error('Failed to fetch menu items:', error);
		return null;
	}
}

/**
 * Wrapper component that handles data fetching
 */
interface InlineNavbarData {
	mainMenu?: NavbarMenuApiResponse;
	mobileMenu?: NavbarMenuApiResponse;
	searchFormId?: string;
	linkedPostTypes?: Array<{ key: string; label: string; icon: string | null; isActive: boolean }>;
}

interface NavbarWrapperProps {
	config: NavbarVxConfig;
	inlineData?: InlineNavbarData | null;
	blockId: string;
}

function NavbarWrapper({ config, inlineData, blockId }: NavbarWrapperProps) {
	const [menuData, setMenuData] = useState<NavbarMenuApiResponse | null>(
		inlineData?.mainMenu || null
	);
	const [mobileMenuData, setMobileMenuData] =
		useState<NavbarMenuApiResponse | null>(
			inlineData?.mobileMenu || null
		);
	const [isLoading, setIsLoading] = useState(
		!inlineData && config.source === 'select_wp_menu'
	);
	const [error, setError] = useState<string | null>(null);

	// Fetch menu data on mount (skip if inline data present)
	useEffect(() => {
		// Skip REST fetch if we have inline data from server-side config injection
		// See: docs/headless-architecture/17-server-side-config-injection.md
		if (inlineData) {
			return;
		}

		let cancelled = false;

		async function loadMenuData() {
			if (config.source !== 'select_wp_menu') {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				// Fetch both menus in parallel
				const [mainMenu, mobileMenu] = await Promise.all([
					config.menuLocation ? fetchMenuItems(config.menuLocation) : null,
					config.mobileMenuLocation
						? fetchMenuItems(config.mobileMenuLocation)
						: null,
				]);

				if (!cancelled) {
					setMenuData(mainMenu);
					setMobileMenuData(mobileMenu);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Failed to load menu'
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadMenuData();

		return () => {
			cancelled = true;
		};
	}, [inlineData, config.source, config.menuLocation, config.mobileMenuLocation]);

	// Build attributes from config
	const attributes: any = {
		blockId,
		source: config.source,
		menuLocation: config.menuLocation,
		mobileMenuLocation: config.mobileMenuLocation,
		orientation: config.orientation,
		justify: config.justify,
		collapsible: config.collapsible,
		collapsedWidth: config.collapsedWidth,
		expandedWidth: config.expandedWidth,
		hamburgerTitle: config.hamburgerTitle,
		showBurgerDesktop: config.showBurgerDesktop,
		showBurgerTablet: config.showBurgerTablet,
		showMenuLabel: config.showMenuLabel,
		hamburgerIcon: config.hamburgerIcon,
		closeIcon: config.closeIcon,
		manualItems: config.manualItems,
		showIcon: config.showIcon,
		iconOnTop: config.iconOnTop,
		customPopupEnabled: config.customPopupEnabled,
		multiColumnMenu: config.multiColumnMenu,
		menuColumns: config.menuColumns,
		searchFormId: config.searchFormId,
		templateTabsId: config.templateTabsId,
	};

	// Resolve linked post types from inline hydration data (search_form source)
	const linkedPostTypes: LinkedPostTypeData[] | undefined = inlineData?.linkedPostTypes || undefined;
	const linkedBlockId: string | undefined = config.searchFormId || inlineData?.searchFormId || undefined;

	return (
		<NavbarComponent
			attributes={attributes}
			menuData={menuData}
			mobileMenuData={mobileMenuData}
			isLoading={isLoading}
			error={error}
			context="frontend"
			linkedPostTypes={linkedPostTypes}
			linkedBlockId={linkedBlockId}
		/>
	);
}

/**
 * Initialize navbar blocks on the page
 */
function initNavbars() {
	// Find all navbar blocks
	const navbars = document.querySelectorAll<HTMLElement>('.voxel-fse-navbar');

	navbars.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for navbar block');
			return;
		}

		// Read inline config data injected by PHP render_block filter (eliminates REST API spinner)
		// See: docs/headless-architecture/17-server-side-config-injection.md
		const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
		let inlineData: InlineNavbarData | null = null;
		if (hydrateScript?.textContent) {
			try {
				inlineData = JSON.parse(hydrateScript.textContent);
			} catch {
				// Fall back to REST API if inline data is malformed
			}
		}

		// Extract blockId from container className (set by getAdvancedVoxelTabProps)
		// Container has class "voxel-fse-navbar-{uuid}"
		const blockIdMatch = container.className.match(/voxel-fse-navbar-([a-f0-9-]{36})/);
		const blockId = blockIdMatch ? blockIdMatch[1] : 'default';

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Preserve <style> elements before createRoot replaces all children.
		// save.tsx outputs responsive CSS as <style> tags inside the container.
		const styleElements = container.querySelectorAll<HTMLStyleElement>(':scope > style');
		styleElements.forEach((style) => {
			container.parentNode?.insertBefore(style, container);
		});

		// Clear remaining placeholder content
		container.innerHTML = '';

		// Prevent Voxel's render_static_popups (commons.js) from mounting Vue
		// on .ts-popup-component elements inside this React tree.
		// MutationObserver fires synchronously during DOM mutation.
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of Array.from(mutation.addedNodes)) {
					if (node instanceof HTMLElement) {
						if (node.classList.contains('ts-popup-component')) {
							(node as any).__vue_app__ = true;
						}
						node.querySelectorAll('.ts-popup-component').forEach((el) => {
							(el as any).__vue_app__ = true;
						});
					}
				}
			}
		});
		observer.observe(container, { childList: true, subtree: true });

		// Create React root and render
		const root = createRoot(container);
		root.render(<NavbarWrapper config={config} inlineData={inlineData} blockId={blockId} />);

		// Disconnect observer after initial render is committed
		requestAnimationFrame(() => observer.disconnect());
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initNavbars);
} else {
	initNavbars();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initNavbars);
window.addEventListener('pjax:complete', initNavbars);
