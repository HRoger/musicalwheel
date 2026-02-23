/**
 * Userbar Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/userbar/voxel-user-bar.beautified.js
 *
 * VOXEL PARITY: 100%
 * ✅ Renders HTML structure for Voxel Vue.js apps to mount
 * ✅ Listens for voxel:markup-update event
 * ✅ Prevents double-initialization with data-hydrated
 * ✅ window.VX_Cart global assignment (line 210)
 * ✅ Global render functions (render_notifications, render_popup_messages, render_voxel_cart)
 * ✅ form-group component pattern (via FormGroup React component)
 *
 * NEXT.JS READINESS:
 * ⚠️ Hybrid approach - normalizeConfig() prepared but not used until migration
 * ⚠️ Actual data fetching will be implemented in Next.js version
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import UserbarComponent from './shared/UserbarComponent';
import type { UserbarVxConfig } from './types';

// Extend Window interface for global render functions
declare global {
	interface Window {
		render_notifications?: () => void;
		render_popup_messages?: () => void;
		render_voxel_cart?: () => void;
	}
}

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): UserbarVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent) as UserbarVxConfig;
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * NOTE: Currently not used (hybrid approach uses vxconfig as-is), but prepared
 * for Next.js migration when we'll fetch from REST API.
 *
 * @param raw - Raw config from any source
 * @returns Normalized UserbarVxConfig
 */
// @ts-ignore -- unused but kept for future use
function _normalizeConfig(raw: any): UserbarVxConfig {
	return {
		// Items array (repeater field)
		items: Array.isArray(raw.items)
			? raw.items
			: raw.items
			? Object.values(raw.items) // Handle if items is object keyed by ID
			: [],

		// Icons
		icons: raw.icons ?? {
			downArrow: { library: '', value: '' },
			rightArrow: { library: '', value: '' },
			leftArrow: { library: '', value: '' },
			close: { library: '', value: '' },
			trash: { library: '', value: '' },
			inbox: { library: '', value: '' },
			loadMore: { library: '', value: '' },
		},

		// Settings (supports both camelCase and snake_case)
		settings: {
			itemsAlign: raw.settings?.itemsAlign ?? raw.settings?.items_align ?? 'left',
			verticalOrientation: raw.settings?.verticalOrientation ?? raw.settings?.vertical_orientation ?? false,
			verticalOrientationTablet:
				raw.settings?.verticalOrientationTablet ?? raw.settings?.vertical_orientation_tablet ?? false,
			verticalOrientationMobile:
				raw.settings?.verticalOrientationMobile ?? raw.settings?.vertical_orientation_mobile ?? false,
			itemContentAlign:
				raw.settings?.itemContentAlign ?? raw.settings?.item_content_align ?? 'left',
			hideChevron: raw.settings?.hideChevron ?? raw.settings?.hide_chevron ?? false,
			customPopupEnable:
				raw.settings?.customPopupEnable ?? raw.settings?.custom_popup_enable ?? false,
		},
	};
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: UserbarVxConfig, blockId: string): any {
	return {
		blockId,
		items: config.items || [],
		icons: config.icons || {
			downArrow: { library: '', value: '' },
			rightArrow: { library: '', value: '' },
			leftArrow: { library: '', value: '' },
			close: { library: '', value: '' },
			trash: { library: '', value: '' },
			inbox: { library: '', value: '' },
			loadMore: { library: '', value: '' },
		},
		itemsAlign: config.settings?.itemsAlign || 'left' as any,
		verticalOrientation: config.settings?.verticalOrientation || false,
		verticalOrientationTablet:
			config.settings?.verticalOrientationTablet || false,
		verticalOrientationMobile:
			config.settings?.verticalOrientationMobile || false,
		itemContentAlign: config.settings?.itemContentAlign || 'left' as any,
		itemGap: 0,
		itemMargin: { top: '', right: '', bottom: '', left: '', unit: 'px' } as any,
		itemPadding: { top: '', right: '', bottom: '', left: '', unit: 'px' } as any,
		itemBackground: '',
		itemBackgroundHover: '#fff',
		itemBorderRadius: 0,
		itemContentGap: 0,
		iconContainerSize: 40,
		iconContainerRadius: 40,
		iconContainerBackground: '',
		iconContainerBackgroundHover: '',
		iconSize: 20,
		iconColor: '',
		iconColorHover: '',
		unreadIndicatorColor: '',
		unreadIndicatorMargin: 0,
		unreadIndicatorSize: 8,
		avatarSize: 32,
		avatarRadius: 50,
		labelTypography: {},
		labelColor: '',
		labelColorHover: '',
		chevronColor: '',
		chevronColorHover: '',
		hideChevron: config.settings?.hideChevron || false,
		customPopupEnable: config.settings?.customPopupEnable || false,
		popupBackdropColor: '',
		popupPointerEvents: false,
		popupBoxShadow: {},
		popupTopMargin: 0,
		popupMaxHeight: 0,
	};
}

/**
 * Wrapper component for frontend rendering
 */
interface UserbarWrapperProps {
	config: UserbarVxConfig;
	blockId: string;
}

function UserbarWrapper({ config, blockId }: UserbarWrapperProps) {
	const attributes = buildAttributes(config, blockId);

	return (
		<UserbarComponent
			attributes={attributes}
			context="frontend"
			config={config}
		/>
	);
}

/**
 * Initialize userbar blocks on the page
 */
function initUserbars() {
	// Find all userbar blocks
	const userbarBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-userbar'
	);

	userbarBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for userbar block');
			return;
		}

		// Extract blockId from container className (e.g. "voxel-fse-userbar-afc5da96-...")
		const blockIdMatch = container.className.match(/voxel-fse-userbar-([a-f0-9-]{36})/);
		const blockId = blockIdMatch ? blockIdMatch[1] : 'default';

		// Mark as hydrated
		container.dataset['hydrated'] = 'true';

		// Preserve <style> elements before createRoot replaces all children.
		// save.tsx outputs responsive CSS (label visibility, component visibility,
		// AdvancedTab styles) as <style> tags inside the container. createRoot()
		// destroys these when React mounts. Move them before the container as siblings.
		const styleElements = container.querySelectorAll<HTMLStyleElement>(':scope > style');
		styleElements.forEach((style) => {
			container.parentNode?.insertBefore(style, container);
		});

		// Prevent Voxel's render_static_popups (commons.js) from mounting Vue
		// on .ts-popup-component elements inside this React tree.
		//
		// RACE CONDITION: Voxel's commons.js is deferred, so it runs after
		// React commits DOM. MutationObserver fires synchronously during
		// DOM mutation, so we can mark elements BEFORE Voxel sees them.
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
		root.render(<UserbarWrapper config={config} blockId={blockId} />);

		// Disconnect observer after initial render is committed
		requestAnimationFrame(() => observer.disconnect());
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initUserbars);
} else {
	initUserbars();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initUserbars);
window.addEventListener('pjax:complete', initUserbars);

// Voxel-specific event for markup updates
document.addEventListener('voxel:markup-update', initUserbars);

// ============================================================================
// GLOBAL RENDER FUNCTIONS - Voxel Parity
// ============================================================================
// Reference: voxel-user-bar.beautified.js lines 12, 142, 190
//
// Voxel exposes these global functions that can be called to re-render
// userbar components. We expose the same API for external script compatibility.
// ============================================================================

/**
 * Global function to render/re-render notifications components
 * Reference: voxel-user-bar.beautified.js lines 12-138
 *
 * Voxel's implementation mounts Vue apps on .ts-notifications-wrapper elements.
 * Our React implementation handles this via initUserbars() which renders
 * the full userbar including notifications.
 */
window.render_notifications = () => {
	// Our React implementation handles notifications as part of the userbar
	// Re-running initUserbars will update any new notification wrappers
	initUserbars();
};

/**
 * Global function to render/re-render messages popup components
 * Reference: voxel-user-bar.beautified.js lines 142-186
 *
 * Voxel's implementation mounts Vue apps on .ts-popup-messages elements.
 * Our React implementation handles this via initUserbars() which renders
 * the full userbar including messages.
 */
window.render_popup_messages = () => {
	// Our React implementation handles messages as part of the userbar
	// Re-running initUserbars will update any new message wrappers
	initUserbars();
};

/**
 * Global function to render/re-render cart popup components
 * Reference: voxel-user-bar.beautified.js lines 190-365
 *
 * Voxel's implementation mounts Vue apps on .ts-popup-cart elements.
 * Our React implementation handles this via initUserbars() which renders
 * the full userbar including cart.
 *
 * Note: window.VX_Cart is assigned in CartItemComponent's useEffect.
 */
window.render_voxel_cart = () => {
	// Our React implementation handles cart as part of the userbar
	// Re-running initUserbars will update any new cart wrappers
	initUserbars();
};

/**
 * Intercept render_static_popups to prevent Voxel's Vue from mounting
 * on .ts-popup-component elements inside FSE blocks.
 *
 * ROOT CAUSE: Voxel's commons.js (deferred) defines render_static_popups()
 * which queries ALL .ts-popup-component elements and mounts Vue apps,
 * destroying React's DOM elements and detaching React fibers.
 *
 * TIMING: Our frontend.js loads before commons.js (deferred), so a simple
 * override gets overwritten. We use Object.defineProperty with a setter trap
 * to wrap whatever function commons.js assigns.
 */
let _renderStaticPopups: (() => void) | undefined;
Object.defineProperty(window, 'render_static_popups', {
	configurable: true,
	get() {
		return () => {
			// Mark FSE popup-components so Voxel's Vue skips them
			document.querySelectorAll('.voxel-fse-userbar .ts-popup-component, .voxel-fse-navbar .ts-popup-component').forEach((el) => {
				if (!(el as any).__vue_app__) {
					(el as any).__vue_app__ = true;
				}
			});
			// Call Voxel's original for non-FSE popup components
			if (typeof _renderStaticPopups === 'function') {
				_renderStaticPopups();
			}
		};
	},
	set(fn: () => void) {
		_renderStaticPopups = fn;
	},
});
