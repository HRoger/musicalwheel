/**
 * Current Plan Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches plan data from REST API for authenticated users.
 *
 * Evidence:
 * - Widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php (806 lines)
 * - Template: themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php (806 lines)
 *
 * ICONS (Content Tab):
 * ✅ ts_plan_ico - Plan icon
 * ✅ ts_viewplan_ico - View plans icon
 * ✅ ts_configure_ico - Configure icon
 * ✅ ts_switch_ico - Switch plan icon
 * ✅ ts_cancel_ico - Cancel icon
 * ✅ ts_stripe_ico - Stripe portal icon
 *
 * PANEL STYLE (Style Tab):
 * ✅ panels_spacing - Gap between panels
 * ✅ panel_border - Panel border
 * ✅ panel_radius - Panel border radius (responsive box)
 * ✅ panel_bg - Panel background color
 * ✅ panel_shadow - Panel box shadow
 *
 * PANEL HEAD:
 * ✅ head_padding - Head padding (responsive box)
 * ✅ head_ico_size - Icon size (responsive slider)
 * ✅ head_ico_margin - Icon margin (responsive slider)
 * ✅ head_ico_col - Icon color
 * ✅ head_typo - Label typography (group control)
 * ✅ head_typo_col - Label text color
 *
 * PANEL PRICING:
 * ✅ price_align - Price alignment (flex-start, center, flex-end)
 * ✅ price_typo - Price typography (group control)
 * ✅ price_col - Price text color
 * ✅ period_typo - Period typography (group control)
 * ✅ period_col - Period text color
 *
 * PANEL BODY:
 * ✅ panel_spacing - Body padding (responsive box)
 * ✅ panel_gap - Gap between elements (responsive slider)
 * ✅ text_align - Text alignment
 * ✅ body_typo - Body typography (group control)
 * ✅ body_typo_col - Body text color
 * ✅ body_typo_link - Link typography (group control)
 * ✅ body_col_link - Link color
 *
 * PANEL BUTTONS:
 * ✅ panel_btn_gap - Gap between buttons (responsive slider)
 *
 * SECONDARY BUTTON (Normal):
 * ✅ scnd_btn_typo - Typography (group control)
 * ✅ scnd_btn_radius - Border radius (responsive box)
 * ✅ scnd_btn_c - Text color
 * ✅ scnd_btn_padding - Padding (responsive box)
 * ✅ scnd_btn_height - Min height (responsive slider)
 * ✅ scnd_btn_bg - Background color
 * ✅ scnd_btn_border - Border
 * ✅ scnd_btn_icon_size - Icon size (responsive slider)
 * ✅ scnd_btn_icon_pad - Icon padding (responsive slider)
 * ✅ scnd_btn_icon_color - Icon color
 *
 * SECONDARY BUTTON (Hover):
 * ✅ scnd_btn_c_h - Text color (hover)
 * ✅ scnd_btn_bg_h - Background (hover)
 * ✅ scnd_btn_border_h - Border (hover)
 * ✅ scnd_btn_icon_color_h - Icon color (hover)
 *
 * HTML STRUCTURE:
 * ✅ .ts-panel - Panel container
 * ✅ .ts-panel-head - Header with icon and label
 * ✅ .ts-panel-body - Content area
 * ✅ .ts-pricing - Price display section
 * ✅ .ts-pricing-amount - Price amount
 * ✅ .ts-pricing-period - Billing period
 * ✅ .ts-status-message - Status text
 * ✅ .ts-panel-footer - Footer with action buttons
 *
 * REST API:
 * ✅ voxel-fse/v1/current-plan - Plan data endpoint
 * ✅ Response: isLoggedIn, membershipType, pricing, planLabel, statusMessage, etc.
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
import CurrentPlanComponent from './shared/CurrentPlanComponent';
import type {
	CurrentPlanAttributes,
	CurrentPlanVxConfig,
	CurrentPlanApiResponse,
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
function normalizeConfig(raw: Record<string, unknown>): CurrentPlanVxConfig {
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
				library: normalizeString(obj.library, fallback.library) as IconValue['library'],
				value: normalizeString(obj.value, fallback.value),
			};
		}
		return fallback;
	};

	// Default icon structure
	const defaultIcon: IconValue = { library: '', value: '' };

	return {
		// Icons - support both camelCase (FSE) and snake_case (Voxel)
		planIcon: normalizeIcon(
			raw.planIcon ?? raw.plan_icon ?? raw.ts_plan_ico,
			defaultIcon
		),
		viewPlansIcon: normalizeIcon(
			raw.viewPlansIcon ?? raw.view_plans_icon ?? raw.ts_viewplan_ico,
			defaultIcon
		),
		configureIcon: normalizeIcon(
			raw.configureIcon ?? raw.configure_icon ?? raw.ts_configure_ico,
			defaultIcon
		),
		switchIcon: normalizeIcon(
			raw.switchIcon ?? raw.switch_icon ?? raw.ts_switch_ico,
			defaultIcon
		),
		cancelIcon: normalizeIcon(
			raw.cancelIcon ?? raw.cancel_icon ?? raw.ts_cancel_ico,
			defaultIcon
		),
		portalIcon: normalizeIcon(
			raw.portalIcon ?? raw.portal_icon ?? raw.ts_stripe_ico,
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
function parseVxConfig(container: HTMLElement): CurrentPlanVxConfig | null {
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
 * Fetch plan data from REST API
 */
async function fetchPlanData(): Promise<CurrentPlanApiResponse> {
	const restUrl = getRestUrl();
	const response = await fetch(`${restUrl}voxel-fse/v1/current-plan`, {
		credentials: 'same-origin', // Include cookies for auth
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch plan data: ${response.statusText}`);
	}

	return (await response.json()) as CurrentPlanApiResponse;
}

/**
 * Wrapper component that handles data fetching
 */
interface CurrentPlanWrapperProps {
	config: CurrentPlanVxConfig;
}

function CurrentPlanWrapper({ config }: CurrentPlanWrapperProps): JSX.Element {
	const [planData, setPlanData] = useState<CurrentPlanApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPlanData() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchPlanData();

				if (!cancelled) {
					setPlanData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Failed to load plan data'
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPlanData();

		return () => {
			cancelled = true;
		};
	}, []);

	// Build attributes from config
	const attributes: CurrentPlanAttributes = {
		blockId: '',
		planIcon: config.planIcon,
		viewPlansIcon: config.viewPlansIcon,
		configureIcon: config.configureIcon,
		switchIcon: config.switchIcon,
		cancelIcon: config.cancelIcon,
		portalIcon: config.portalIcon,
	};

	return (
		<CurrentPlanComponent
			attributes={attributes}
			planData={planData}
			isLoading={isLoading}
			error={error}
			context="frontend"
		/>
	);
}

/**
 * Initialize current plan blocks on the page
 */
function initCurrentPlanBlocks(): void {
	// Find all current plan blocks
	const currentPlanBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-current-plan'
	);

	currentPlanBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for current plan block');
			return;
		}

		// Mark as hydrated and clear placeholder
		container.dataset.hydrated = 'true';
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(<CurrentPlanWrapper config={config} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCurrentPlanBlocks);
} else {
	initCurrentPlanBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initCurrentPlanBlocks);
window.addEventListener('pjax:complete', initCurrentPlanBlocks);
