/**
 * Countdown Block - Frontend Hydration
 *
 * Parses vxconfig and mounts React on the frontend
 */
import { createRoot } from 'react-dom/client';
import { CountdownComponent } from './shared/CountdownComponent';
import type { CountdownConfig } from './types';

/**
 * Parse vxconfig JSON from script tag (previous sibling to countdown widget)
 */
function parseVxConfig(widget: Element): CountdownConfig | null {
	// vxconfig is the previous sibling script tag
	const vxconfigScript = widget.previousElementSibling;
	if (!vxconfigScript || !vxconfigScript.classList.contains('vxconfig')) {
		console.error('[Countdown] vxconfig script tag not found');
		return null;
	}

	try {
		const config = JSON.parse(vxconfigScript.textContent || '{}') as CountdownConfig;
		return config;
	} catch (error) {
		console.error('[Countdown] Failed to parse vxconfig:', error);
		return null;
	}
}

/**
 * Initialize countdown blocks on the page
 */
function initCountdownBlocks(): void {
	// Select countdown widgets that haven't been mounted yet
	const widgets = document.querySelectorAll('.ts-countdown-widget:not([data-react-mounted])');

	widgets.forEach((widget) => {
		// Parse vxconfig from previous sibling
		const config = parseVxConfig(widget);
		if (!config) {
			return;
		}

		// Mark as mounted to prevent double initialization
		widget.setAttribute('data-react-mounted', 'true');

		// Mount React (replaces the widget content)
		const root = createRoot(widget);
		root.render(<CountdownComponent config={config} isEditor={false} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCountdownBlocks);
} else {
	initCountdownBlocks();
}

// Re-initialize on Turbo/PJAX navigation (if applicable)
document.addEventListener('turbo:load', initCountdownBlocks);
document.addEventListener('pjax:complete', initCountdownBlocks);

// Listen for Voxel markup updates
document.addEventListener('voxel:markup-update', initCountdownBlocks);
