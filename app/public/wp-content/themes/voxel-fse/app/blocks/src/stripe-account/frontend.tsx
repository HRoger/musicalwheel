/**
 * Stripe Account Block - Frontend Entry Point (Plan C+)
 *
 * Uses data from vxconfig script tag and fetches runtime data from REST API.
 * Pattern: save.tsx outputs vxconfig → frontend.tsx parses and fetches additional data
 *
 * Evidence:
 * - Widget: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php (2731 lines)
 * - Template: themes/voxel/templates/backend/stripe/account-details.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php (2731 lines)
 *
 * ICONS (Content Tab):
 * ✅ ts_setup_ico - Setup account icon
 * ✅ ts_submit_ico - Submit details icon
 * ✅ ts_update_ico - Update details icon
 * ✅ ts_stripe_ico - Stripe dashboard icon
 * ✅ ts_shipping_ico - Shipping icon
 * ✅ ts_chevron_left - Back chevron icon
 * ✅ save_icon - Save icon
 * ✅ handle_icon - Drag handle icon
 * ✅ ts_zone_ico - Shipping zone icon
 * ✅ trash_icon - Delete/trash icon
 * ✅ down_icon - Dropdown arrow icon
 * ✅ ts_search_icon - Search icon
 * ✅ ts_add_icon - Add new icon
 *
 * PANEL (Style Tab):
 * ✅ panel_border - Panel border (group control)
 * ✅ panel_radius - Border radius (responsive box)
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
 *
 * PANEL BODY:
 * ✅ panel_spacing - Body padding (responsive dimensions)
 * ✅ panel_gap - Body content gap (responsive slider)
 * ✅ text_align - Align text (left, center, right)
 * ✅ body_typo - Typography (group control)
 * ✅ body_typo_col - Text color
 *
 * FORM LABELS:
 * ✅ form_label_typo - Label typography (group control)
 * ✅ form_label_col - Label color
 *
 * FORM INPUTS:
 * ✅ form_input_margin - Input margin top (responsive slider)
 * ✅ form_input_radius - Input border radius (responsive box)
 * ✅ form_input_typo - Input typography (group control)
 * ✅ form_input_padding - Input padding (responsive dimensions)
 * ✅ form_input_bg - Input background color
 * ✅ form_input_bg_focus - Input background focus
 * ✅ form_input_border - Input border (group control)
 * ✅ form_input_border_focus - Input border focus color
 * ✅ form_input_col - Input text color
 * ✅ form_input_col_focus - Input text focus color
 *
 * FORM TEXTAREAS:
 * ✅ form_textarea_min_height - Min height (responsive slider)
 *
 * SUFFIXES:
 * ✅ suffix_col - Suffix text color
 * ✅ suffix_bg - Suffix background color
 * ✅ suffix_typo - Suffix typography (group control)
 *
 * SWITCHERS:
 * ✅ switcher_bg - Switcher background (off)
 * ✅ switcher_bg_checked - Switcher background (on)
 * ✅ switcher_slider - Slider color
 *
 * FORM SELECTS:
 * ✅ select_ico_size - Select icon size (responsive slider)
 * ✅ select_ico_col - Select icon color
 *
 * TABS:
 * ✅ tabs_gap - Tab gap (responsive slider)
 * ✅ tab_padding - Tab padding (responsive dimensions)
 * ✅ tab_radius - Tab border radius (responsive box)
 * ✅ tab_typo - Tab typography (group control)
 * ✅ tab_bg - Tab background color
 * ✅ tab_col - Tab text color
 * ✅ tab_bg_a - Tab active background
 * ✅ tab_col_a - Tab active text color
 *
 * HEADINGS:
 * ✅ heading_typo - Heading typography (group control)
 * ✅ heading_col - Heading text color
 * ✅ heading_margin - Heading margin bottom (responsive slider)
 *
 * REPEATERS:
 * ✅ repeater_bg - Repeater item background
 * ✅ repeater_radius - Repeater border radius (responsive box)
 * ✅ repeater_padding - Repeater padding (responsive dimensions)
 * ✅ repeater_gap - Repeater gap (responsive slider)
 *
 * PILLS:
 * ✅ pill_padding - Pill padding (responsive dimensions)
 * ✅ pill_radius - Pill border radius (responsive box)
 * ✅ pill_typo - Pill typography (group control)
 * ✅ pill_bg - Pill background
 * ✅ pill_col - Pill text color
 * ✅ pill_gap - Pill gap (responsive slider)
 *
 * PRIMARY BUTTON (ts-btn-2):
 * ✅ prm_btn_typo - Typography (group control)
 * ✅ prm_btn_radius - Border radius (responsive box)
 * ✅ prm_btn_c - Text color
 * ✅ prm_btn_padding - Padding (responsive dimensions)
 * ✅ prm_btn_height - Min height (responsive slider)
 * ✅ prm_btn_bg - Background color
 * ✅ prm_btn_border - Border (group control)
 * ✅ prm_btn_icon_size - Icon size (responsive slider)
 * ✅ prm_btn_icon_pad - Icon padding (responsive slider)
 * ✅ prm_btn_icon_color - Icon color
 * ✅ prm_btn_c_h - Text color (hover)
 * ✅ prm_btn_bg_h - Background (hover)
 * ✅ prm_btn_border_h - Border color (hover)
 * ✅ prm_btn_icon_color_h - Icon color (hover)
 *
 * SECONDARY BUTTON (ts-btn-1):
 * ✅ scnd_btn_typo - Typography (group control)
 * ✅ scnd_btn_radius - Border radius (responsive box)
 * ✅ scnd_btn_c - Text color
 * ✅ scnd_btn_padding - Padding (responsive dimensions)
 * ✅ scnd_btn_height - Min height (responsive slider)
 * ✅ scnd_btn_bg - Background color
 * ✅ scnd_btn_border - Border (group control)
 * ✅ scnd_btn_icon_size - Icon size (responsive slider)
 * ✅ scnd_btn_icon_pad - Icon padding (responsive slider)
 * ✅ scnd_btn_icon_color - Icon color
 * ✅ scnd_btn_c_h - Text color (hover)
 * ✅ scnd_btn_bg_h - Background (hover)
 * ✅ scnd_btn_border_h - Border color (hover)
 * ✅ scnd_btn_icon_color_h - Icon color (hover)
 *
 * TERTIARY BUTTON (ts-btn-4):
 * ✅ third_btn_typo - Typography (group control)
 * ✅ third_btn_radius - Border radius (responsive box)
 * ✅ third_btn_c - Text color
 * ✅ third_btn_padding - Padding (responsive dimensions)
 * ✅ third_btn_height - Min height (responsive slider)
 * ✅ third_btn_bg - Background color
 * ✅ third_btn_border - Border (group control)
 * ✅ third_btn_icon_size - Icon size (responsive slider)
 * ✅ third_btn_icon_pad - Icon padding (responsive slider)
 * ✅ third_btn_icon_color - Icon color
 * ✅ third_btn_c_h - Text color (hover)
 * ✅ third_btn_bg_h - Background (hover)
 * ✅ third_btn_border_h - Border color (hover)
 * ✅ third_btn_icon_color_h - Icon color (hover)
 *
 * HTML STRUCTURE:
 * ✅ .ts-panel - Panel container
 * ✅ .ac-head - Header with icon and label
 * ✅ .ac-body - Content area
 * ✅ .ts-form - Form container
 * ✅ .ts-form-group - Form field group
 * ✅ .ts-input-con - Input container
 * ✅ .ts-tabs - Tab navigation
 * ✅ .ts-repeater-head - Repeater header
 * ✅ .shipping-zones - Shipping zones list
 * ✅ .shipping-rates - Shipping rates list
 *
 * REST API:
 * ✅ voxel-fse/v1/stripe-account/config - Account configuration endpoint
 * ✅ Response: account, shipping_enabled, shipping_zones, shipping_rates, etc.
 *
 * AJAX:
 * ✅ stripe_connect.account.save_shipping - Save shipping configuration
 *
 * MULTISITE SUPPORT:
 * ✅ getRestBaseUrl() - Handles subdirectory multisite
 * ✅ getSiteBaseUrl() - Handles AJAX URL for multisite
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
import StripeAccountComponent from './shared/StripeAccountComponent';
import type {
	StripeAccountAttributes,
	StripeAccountConfig,
	ShippingZone,
	ShippingRate,
	VoxelIcon,
} from './types';
import { getSiteBaseUrl, getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Window extension for WordPress API settings
 */
interface WpApiSettings {
	root: string;
	nonce: string;
}

interface VoxelStripeAccountData {
	ajaxUrl?: string;
	nonce?: string;
}

declare global {
	interface Window {
		wp: {
			element: {
				createRoot: (container: Element) => {
					render: (element: React.ReactNode) => void;
					unmount: () => void;
				};
			};
		};
		wpApiSettings?: WpApiSettings;
		voxelStripeAccount?: VoxelStripeAccountData;
	}
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Get Voxel AJAX URL
 * MULTISITE FIX: Uses getSiteBaseUrl() for multisite subdirectory support
 */
function getAjaxUrl(): string {
	if (typeof window !== 'undefined' && window.voxelStripeAccount?.ajaxUrl) {
		return window.voxelStripeAccount.ajaxUrl;
	}
	// MULTISITE FIX: Use getSiteBaseUrl() which properly detects site path
	return getSiteBaseUrl();
}

/**
 * Get WordPress REST API nonce
 */
function getRestNonce(): string {
	if (typeof window !== 'undefined' && window.wpApiSettings?.nonce) {
		return window.wpApiSettings.nonce;
	}
	return '';
}

/**
 * Get nonce for AJAX requests (Voxel's custom AJAX endpoint)
 */
function getAjaxNonce(): string {
	if (typeof window !== 'undefined' && window.voxelStripeAccount?.nonce) {
		return window.voxelStripeAccount.nonce;
	}
	return '';
}

/**
 * VxConfig structure from save.tsx
 */
interface VxConfig {
	genImage?: {
		id: number;
		url: string;
	};
	genImageDynamicTag?: string;
	icons?: {
		setup?: string;
		submit?: string;
		update?: string;
		stripe?: string;
		shipping?: string;
		chevronLeft?: string;
		save?: string;
		handle?: string;
		zone?: string;
		trash?: string;
		down?: string;
		search?: string;
		add?: string;
	};
}

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): VxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseInt(val, 10);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Normalize genImage object
	const normalizeGenImage = (val: unknown): { id: number; url: string } => {
		if (val && typeof val === 'object') {
			const obj = val as Record<string, unknown>;
			return {
				id: normalizeNumber(obj['id'], 0),
				url: normalizeString(obj['url'], ''),
			};
		}
		return { id: 0, url: '' };
	};

	// Normalize icons object - supports both camelCase and snake_case
	const normalizeIcons = (val: unknown): VxConfig['icons'] => {
		if (!val || typeof val !== 'object') {
			return {};
		}
		const obj = val as Record<string, unknown>;
		return {
			// camelCase (FSE) → snake_case (Voxel) fallback
			setup: normalizeString(obj['setup'] ?? obj['ts_setup_ico'], ''),
			submit: normalizeString(obj['submit'] ?? obj['ts_submit_ico'], ''),
			update: normalizeString(obj['update'] ?? obj['ts_update_ico'], ''),
			stripe: normalizeString(obj['stripe'] ?? obj['ts_stripe_ico'], ''),
			shipping: normalizeString(obj['shipping'] ?? obj['ts_shipping_ico'], ''),
			chevronLeft: normalizeString(obj['chevronLeft'] ?? obj['ts_chevron_left'], ''),
			save: normalizeString(obj['save'] ?? obj['save_icon'], ''),
			handle: normalizeString(obj['handle'] ?? obj['handle_icon'], ''),
			zone: normalizeString(obj['zone'] ?? obj['ts_zone_ico'], ''),
			trash: normalizeString(obj['trash'] ?? obj['trash_icon'], ''),
			down: normalizeString(obj['down'] ?? obj['down_icon'], ''),
			search: normalizeString(obj['search'] ?? obj['ts_search_icon'], ''),
			add: normalizeString(obj['add'] ?? obj['ts_add_icon'], ''),
		};
	};

	return {
		genImage: normalizeGenImage(raw['genImage'] ?? raw['gen_image']),
		genImageDynamicTag: normalizeString(raw['genImageDynamicTag'] ?? raw['gen_image_dynamic_tag'], ''),
		icons: normalizeIcons(raw['icons']),
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): VxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('[Stripe Account] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: VxConfig): StripeAccountAttributes {
	// Convert icon strings back to VoxelIcon format
	const parseIcon = (value?: string): VoxelIcon | null => {
		if (!value) return null;
		if (value.startsWith('svg:')) {
			return { library: 'svg', url: value.substring(4) };
		}
		return { library: 'icon', value };
	};

	return {
		genImage: vxConfig.genImage || { id: 0, url: '' },
		genImageDynamicTag: vxConfig.genImageDynamicTag || '',
		previewAsUser: null, // Not used on frontend
		tsSetupIco: parseIcon(vxConfig.icons?.setup),
		tsSubmitIco: parseIcon(vxConfig.icons?.submit),
		tsUpdateIco: parseIcon(vxConfig.icons?.update),
		tsStripeIco: parseIcon(vxConfig.icons?.stripe),
		tsShippingIco: parseIcon(vxConfig.icons?.shipping),
		tsChevronLeft: parseIcon(vxConfig.icons?.chevronLeft),
		saveIcon: parseIcon(vxConfig.icons?.save),
		handleIcon: parseIcon(vxConfig.icons?.handle),
		tsZoneIco: parseIcon(vxConfig.icons?.zone),
		trashIcon: parseIcon(vxConfig.icons?.trash),
		downIcon: parseIcon(vxConfig.icons?.down),
		tsSearchIcon: parseIcon(vxConfig.icons?.search),
		tsAddIcon: parseIcon(vxConfig.icons?.add),
	};
}

/**
 * Fetch Stripe account configuration from REST API
 */
async function fetchConfig(): Promise<StripeAccountConfig | null> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/stripe-account/config`;

	try {
		const response = await fetch(endpoint, {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': getRestNonce(),
			},
			credentials: 'same-origin',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		if (data.success && data.data) {
			return data.data as StripeAccountConfig;
		}
		return null;
	} catch (error) {
		console.error('[Stripe Account] Failed to fetch config:', error);
		return null;
	}
}

/**
 * Save shipping configuration via AJAX
 */
async function saveShipping(zones: ShippingZone[], rates: ShippingRate[]): Promise<{ success: boolean; message: string }> {
	const ajaxUrl = getAjaxUrl();
	const nonce = getAjaxNonce();

	const formData = new FormData();
	formData.append('action', 'stripe_connect.account.save_shipping');
	formData.append('_wpnonce', nonce);
	formData.append('shipping_zones', JSON.stringify(zones));
	formData.append('shipping_rates', JSON.stringify(rates));

	try {
		const response = await fetch(ajaxUrl, {
			method: 'POST',
			body: formData,
			credentials: 'same-origin',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return {
			success: data.success ?? false,
			message: data.message || '',
		};
	} catch (error) {
		console.error('[Stripe Account] Failed to save shipping:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Failed to save shipping configuration',
		};
	}
}

/**
 * Frontend Wrapper Component
 * Fetches config from REST API and renders the shared component
 */
interface FrontendWrapperProps {
	attributes: StripeAccountAttributes;
}

function FrontendWrapper({ attributes }: FrontendWrapperProps) {
	const [config, setConfig] = useState<StripeAccountConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadConfig() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchConfig();

				if (!cancelled) {
					if (data) {
						setConfig(data);
					} else {
						setError('Failed to load Stripe account configuration');
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	// Handle save shipping
	const handleSaveShipping = async (zones: ShippingZone[], rates: ShippingRate[]) => {
		const result = await saveShipping(zones, rates);
		if (!result.success) {
			alert(result.message || 'Failed to save shipping configuration');
			throw new Error(result.message);
		}
		// Optionally show success message
		alert(result.message || 'Shipping configuration saved successfully');
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="ts-panel">
				<div className="ac-body" style={{ textAlign: 'center', padding: '40px' }}>
					<p>Loading Stripe account...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="ts-panel">
				<div className="ac-body" style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
					<p>Error: {error}</p>
				</div>
			</div>
		);
	}

	// No config
	if (!config) {
		return (
			<div className="ts-panel">
				<div className="ac-body" style={{ textAlign: 'center', padding: '40px' }}>
					<p>Stripe Connect is not configured.</p>
				</div>
			</div>
		);
	}

	return (
		<StripeAccountComponent
			attributes={attributes}
			config={config}
			context="frontend"
			onSaveShipping={handleSaveShipping}
		/>
	);
}

/**
 * Initialize Stripe Account blocks on the page
 */
function initStripeAccountBlocks() {
	// Find all stripe account blocks by the class
	const containers = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-stripe-account-frontend:not([data-react-mounted])'
	);

	containers.forEach((container) => {
		// Mark as mounted to prevent double-mounting
		container.setAttribute('data-react-mounted', 'true');

		// Parse vxconfig from the container
		const vxConfig = parseVxConfig(container);

		if (!vxConfig) {
			console.error('[Stripe Account] Failed to find vxconfig');
			return;
		}

		// Build attributes from vxconfig
		const attributes = buildAttributes(vxConfig);

		// Clear placeholder content and create React root
		container.innerHTML = '';

		const root = createRoot(container);
		root.render(<FrontendWrapper attributes={attributes} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initStripeAccountBlocks);
} else {
	initStripeAccountBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initStripeAccountBlocks);
window.addEventListener('pjax:complete', initStripeAccountBlocks);
