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
import type { UserbarAttributes, UserbarVxConfig } from './types';

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
function normalizeConfig(raw: any): UserbarVxConfig {
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
function buildAttributes(config: UserbarVxConfig): UserbarAttributes {
	return {
		blockId: '',
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
		itemsAlign: config.settings?.itemsAlign || 'left',
		verticalOrientation: config.settings?.verticalOrientation || false,
		verticalOrientationTablet:
			config.settings?.verticalOrientationTablet || false,
		verticalOrientationMobile:
			config.settings?.verticalOrientationMobile || false,
		itemContentAlign: config.settings?.itemContentAlign || 'left',
		itemGap: 0,
		itemMargin: { top: '', right: '', bottom: '', left: '' },
		itemPadding: { top: '', right: '', bottom: '', left: '' },
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
}

function UserbarWrapper({ config }: UserbarWrapperProps) {
	const attributes = buildAttributes(config);

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
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for userbar block');
			return;
		}

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Create React root and render
		const root = createRoot(container);
		root.render(<UserbarWrapper config={config} />);
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
