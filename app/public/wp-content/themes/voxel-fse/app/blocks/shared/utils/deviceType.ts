/**
 * Device Type Utility
 *
 * Centralized utility for getting the current device type from WordPress editor stores.
 * Handles deprecation of __experimentalGetPreviewDeviceType in WordPress 6.5+.
 *
 * @package VoxelFSE
 */

declare global {
	interface Window {
		wp: {
			data: {
				select: (store: string) => any;
				dispatch: (store: string) => any;
			};
		};
	}
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Get current device type from WordPress editor
 *
 * WordPress 6.5+ deprecation:
 * - OLD: select('core/edit-post').__experimentalGetPreviewDeviceType()
 * - NEW: select('core/editor').getDeviceType()
 *
 * This function tries the new API first, then falls back to older APIs for compatibility.
 *
 * @param selectFn - Optional select function. If not provided, uses the global select.
 * @returns Current device type (desktop/tablet/mobile)
 */
export function getCurrentDeviceType(selectFn?: (store: string) => any): DeviceType {
	// Use global wp.data.select if not provided
	const select = selectFn || (typeof window !== 'undefined' ? window.wp?.data?.select : null);

	if (!select) return 'desktop';

	// Try core/editor first (WordPress 6.5+ and FSE)
	const editorStore = select('core/editor') as any;
	if (editorStore && typeof editorStore.getDeviceType === 'function') {
		const device = editorStore.getDeviceType();
		if (device) return device.toLowerCase() as DeviceType;
	}

	// Fallback to core/edit-site for Site Editor (pre-6.5)
	const editSiteStore = select('core/edit-site') as any;
	if (editSiteStore && typeof editSiteStore.getDeviceType === 'function') {
		const device = editSiteStore.getDeviceType();
		if (device) return device.toLowerCase() as DeviceType;
	}

	// Last fallback to deprecated API (WordPress < 6.5)
	// This is still needed for older WordPress versions
	const editPostStore = select('core/edit-post') as any;
	if (editPostStore && typeof editPostStore.getDeviceType === 'function') {
		const device = editPostStore.getDeviceType();
		if (device) return device.toLowerCase() as DeviceType;
	}

	// Final fallback - return desktop
	return 'desktop';
}

/**
 * Set device type in WordPress editor
 *
 * WordPress 6.5+ deprecation:
 * - OLD: dispatch('core/edit-post').__experimentalSetPreviewDeviceType()
 * - NEW: dispatch('core/editor').setDeviceType()
 *
 * @param device - Device type to set
 */
export function setDeviceType(device: DeviceType): void {
	if (typeof window === 'undefined' || !window.wp?.data?.dispatch) return;

	const dispatch = window.wp.data.dispatch;
	const deviceCapitalized = device.charAt(0).toUpperCase() + device.slice(1);

	// Try core/editor first (WordPress 6.5+)
	const editorDispatch = dispatch('core/editor') as any;
	if (editorDispatch && typeof editorDispatch.setDeviceType === 'function') {
		editorDispatch.setDeviceType(deviceCapitalized);
		return;
	}

	// Fallback to core/edit-site for Site Editor
	const editSiteDispatch = dispatch('core/edit-site') as any;
	if (editSiteDispatch && typeof editSiteDispatch.setDeviceType === 'function') {
		editSiteDispatch.setDeviceType(deviceCapitalized);
		return;
	}

	// Last fallback to deprecated API (WordPress < 6.5)
	const editPostDispatch = dispatch('core/edit-post') as any;
	if (editPostDispatch && typeof editPostDispatch.setDeviceType === 'function') {
		editPostDispatch.setDeviceType(deviceCapitalized);
	}
}

