/**
 * Current Role Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches role data from REST API for authenticated users.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/current-role.php (596 lines)
 * - Template: themes/voxel/templates/widgets/current-role.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/current-role.php (596 lines)
 *
 * ICONS (Content Tab):
 * ✅ ts_role_ico - Role icon
 * ✅ ts_switch_ico - Switch icon
 *
 * PANEL (Style Tab):
 * ✅ panel_border - Panel border (group control)
 * ✅ panel_radius - Border radius (responsive slider)
 * ✅ panel_bg - Background color
 * ✅ panel_shadow - Box shadow (group control)
 *
 * PANEL HEAD:
 * ✅ head_padding - Head padding (responsive dimensions)
 * ✅ head_ico_size - Icon size (responsive slider)
 * ✅ head_ico_margin - Icon right margin (responsive slider)
 * ✅ head_ico_col - Icon color
 * ✅ head_typo - Typography (group control)
 * ✅ head_typo_col - Text color
 * ✅ head_border_col - Separator color
 *
 * PANEL BODY:
 * ✅ panel_spacing - Body padding (responsive slider)
 * ✅ panel_gap - Body content gap (responsive slider)
 * ✅ text_align - Align text (left, center, right)
 * ✅ body_typo - Typography (group control)
 * ✅ body_typo_col - Text color
 *
 * PANEL BUTTONS:
 * ✅ panel_buttons_gap - Item gap (responsive slider)
 *
 * BUTTON (Normal):
 * ✅ scnd_btn_typo - Button typography (group control)
 * ✅ scnd_btn_radius - Border radius (responsive slider)
 * ✅ scnd_btn_c - Text color
 * ✅ scnd_btn_padding - Padding (responsive dimensions)
 * ✅ scnd_btn_height - Height (responsive slider)
 * ✅ scnd_btn_bg - Background color
 * ✅ scnd_btn_border - Border (group control)
 * ✅ scnd_btn_icon_size - Icon size (responsive slider)
 * ✅ scnd_btn_icon_pad - Icon/Text spacing (responsive slider)
 * ✅ scnd_btn_icon_color - Icon color
 *
 * BUTTON (Hover):
 * ✅ scnd_btn_c_h - Text color (hover)
 * ✅ scnd_btn_bg_h - Background color (hover)
 * ✅ scnd_btn_border_h - Border color (hover)
 * ✅ scnd_btn_icon_color_h - Icon color (hover)
 *
 * HTML STRUCTURE:
 * ✅ .ts-panel - Panel container
 * ✅ .ac-head - Header with icon and label
 * ✅ .ac-head i/svg - Header icon
 * ✅ .ac-head b - Header label text
 * ✅ .ac-body - Content area
 * ✅ .ac-body p - Body text
 * ✅ .current-plan-btn - Button container
 * ✅ .ts-btn-1 - Button styling
 *
 * REST API:
 * ✅ voxel-fse/v1/current-role - Role data endpoint
 * ✅ Response: isLoggedIn, canSwitch, currentRoles, switchableRoles, rolesLabel
 *
 * MULTISITE SUPPORT:
 * ✅ getRestBaseUrl() - Handles subdirectory multisite
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Async data fetching with proper error handling
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import CurrentRoleComponent from './shared/CurrentRoleComponent';
import type {
	CurrentRoleAttributes,
	CurrentRoleVxConfig,
	CurrentRoleApiResponse,
	IconValue,
} from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): CurrentRoleVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for icon normalization
	const normalizeIcon = (val: unknown, fallback: IconValue): IconValue => {
		if (val && typeof val === 'object') {
			const obj = val as Record<string, unknown>;
			return {
				library: normalizeString(obj['library'], fallback.library) as IconValue['library'],
				value: normalizeString(obj['value'], fallback.value),
			};
		}
		return fallback;
	};

	// Default icon structure
	const defaultIcon: IconValue = { library: '', value: '' };

	return {
		// Icons - support both camelCase (FSE) and snake_case (Voxel)
		roleIcon: normalizeIcon(
			raw['roleIcon'] ?? raw['role_icon'] ?? raw['ts_role_ico'],
			defaultIcon
		),
		switchIcon: normalizeIcon(
			raw['switchIcon'] ?? raw['switch_icon'] ?? raw['ts_switch_ico'],
			defaultIcon
		),
	};
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): CurrentRoleVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Fetch role data from REST API
 */
async function fetchRoleData(): Promise<CurrentRoleApiResponse> {
	const restUrl = getRestUrl();

	const headers: HeadersInit = {};
	const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
	if (nonce) {
		headers['X-WP-Nonce'] = nonce;
	}

	const response = await fetch(`${restUrl}voxel-fse/v1/current-role`, {
		credentials: 'same-origin', // Include cookies for auth
		headers,
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch role data: ${response.statusText}`);
	}

	return (await response.json()) as CurrentRoleApiResponse;
}

/**
 * Wrapper component that handles data fetching
 */
interface CurrentRoleWrapperProps {
	config: CurrentRoleVxConfig;
}

function CurrentRoleWrapper({ config }: CurrentRoleWrapperProps): JSX.Element {
	const [roleData, setRoleData] = useState<CurrentRoleApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadRoleData() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchRoleData();

				if (!cancelled) {
					setRoleData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Failed to load role data'
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadRoleData();

		return () => {
			cancelled = true;
		};
	}, []);

	// Build attributes from config
	const attributes: CurrentRoleAttributes = {
		blockId: '',
		roleIcon: config.roleIcon,
		switchIcon: config.switchIcon,
	};

	return (
		<CurrentRoleComponent
			attributes={attributes}
			roleData={roleData}
			isLoading={isLoading}
			error={error}
			context="frontend"
		/>
	);
}

/**
 * Initialize current role blocks on the page
 */
function initCurrentRoleBlocks(): void {
	// Find all current role blocks
	const currentRoleBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-current-role'
	);

	currentRoleBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for current role block');
			return;
		}

		// Mark as hydrated and clear placeholder
		container.dataset['hydrated'] = 'true';
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(<CurrentRoleWrapper config={config} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCurrentRoleBlocks);
} else {
	initCurrentRoleBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initCurrentRoleBlocks);
window.addEventListener('pjax:complete', initCurrentRoleBlocks);
