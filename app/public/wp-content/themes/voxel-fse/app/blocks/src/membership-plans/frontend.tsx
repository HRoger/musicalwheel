/**
 * Membership Plans Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from the save.tsx output.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * Evidence:
 * - Widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php (1570 lines)
 * - Template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
 * - Script: vx:pricing-plans.js
 * - Style: vx:pricing-plan.css
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: Voxel pricing-plans-widget.php (Membership plans VX widget)
 *
 * PRICE GROUPS (Content Tab):
 * ✅ ts_price_groups - Price groups repeater
 *   ✅ group_label - Group label text
 *   ✅ prices - Multi-select for prices
 *
 * GENERAL (Style Tab):
 * ✅ plans_columns - Number of columns (responsive)
 * ✅ pplans_gap - Item gap (responsive slider)
 * ✅ pplans_border - Border (group control)
 * ✅ pplans_radius - Border radius (responsive slider)
 * ✅ pplans_bg - Background color
 * ✅ pplans_shadow - Box shadow (group control)
 *
 * PLAN BODY:
 * ✅ pplans_spacing - Body padding (responsive slider)
 * ✅ panel_gap - Body content gap (responsive slider)
 *
 * PLAN IMAGE:
 * ✅ plan_img_pad - Image padding (dimensions)
 * ✅ plan_img_max - Image height (responsive slider)
 *
 * PLAN PRICING:
 * ✅ pricing_align - Align (left/center/right)
 * ✅ price_typo - Price typography (group control)
 * ✅ price_col - Price text color
 * ✅ period_typo - Period typography (group control)
 * ✅ period_col - Period text color
 *
 * PLAN NAME:
 * ✅ content_align - Align content
 * ✅ name_typo - Name typography (group control)
 * ✅ name_col - Name text color
 *
 * PLAN DESCRIPTION:
 * ✅ desc_align - Text align
 * ✅ desc_typo - Typography (group control)
 * ✅ desc_col - Color
 *
 * PLAN FEATURES:
 * ✅ list_align - Align content
 * ✅ list_gap - Item gap (responsive slider)
 * ✅ list_typo - Typography (group control)
 * ✅ list_col - Color
 * ✅ list_ico_col - Icon color
 * ✅ list_ico_size - Icon size (responsive slider)
 * ✅ list_ico_right_pad - Icon right padding (responsive slider)
 *
 * TABS - NORMAL (Style Tab):
 * ✅ pltabs_disable - Disable tabs (switcher)
 * ✅ pltabs_justify - Justify (5 options)
 * ✅ pltabs_padding - Padding (dimensions)
 * ✅ pltabs_margin - Margin (dimensions)
 * ✅ pltabs_text - Tab typography (group control)
 * ✅ pltabs_active - Active tab typography (group control)
 * ✅ pltabs_text_color - Text color
 * ✅ pltabs_active_text_color - Active text color
 * ✅ pltabs_bg_color - Background
 * ✅ pltabs_bg_active_color - Active background
 * ✅ pltabs_border - Border (group control)
 * ✅ pltabs_border_active - Active border color
 * ✅ pltabs_radius - Border radius
 *
 * TABS - HOVER:
 * ✅ pltabs_text_color_h - Text color hover
 * ✅ pltabs_active_text_color_h - Active text color hover
 * ✅ pltabs_border_color_h - Border color hover
 * ✅ pltabs_border_h_active - Active border color hover
 * ✅ pltabs_bg_color_h - Background hover
 * ✅ pltabs_active_color_h - Active background hover
 *
 * PRIMARY BUTTON - NORMAL (Style Tab):
 * ✅ primary_btn_typo - Typography (group control)
 * ✅ primary_btn_radius - Border radius (responsive slider)
 * ✅ primary_btn_c - Text color
 * ✅ primary_btn_padding - Padding (dimensions)
 * ✅ primary_btn_height - Height (responsive slider)
 * ✅ primary_btn_bg - Background color
 * ✅ primary_btn_border - Border (group control)
 * ✅ primary_btn_icon_size - Icon size (responsive slider)
 * ✅ primary_btn_icon_pad - Text/Icon spacing (responsive slider)
 * ✅ primary_btn_icon_color - Icon color
 *
 * PRIMARY BUTTON - HOVER:
 * ✅ primary_btn_c_h - Text color hover
 * ✅ primary_btn_bg_h - Background color hover
 * ✅ primary_btn_border_h - Border color hover
 * ✅ primary_btn_icon_color_h - Icon color hover
 *
 * SECONDARY BUTTON - NORMAL (Style Tab):
 * ✅ scnd_btn_typo - Typography (group control)
 * ✅ scnd_btn_radius - Border radius (responsive slider)
 * ✅ scnd_btn_c - Text color
 * ✅ scnd_btn_padding - Padding (dimensions)
 * ✅ scnd_btn_height - Height (responsive slider)
 * ✅ scnd_btn_bg - Background color
 * ✅ scnd_btn_border - Border (group control)
 * ✅ scnd_btn_icon_size - Icon size (responsive slider)
 * ✅ scnd_btn_icon_pad - Text/Icon spacing (responsive slider)
 * ✅ scnd_btn_icon_color - Icon color
 *
 * SECONDARY BUTTON - HOVER:
 * ✅ scnd_btn_c_h - Text color hover
 * ✅ scnd_btn_bg_h - Background color hover
 * ✅ scnd_btn_border_h - Border color hover
 * ✅ scnd_btn_icon_color_h - Icon color hover
 *
 * ICONS (Style Tab):
 * ✅ ts_arrow_right - Right arrow icon
 *
 * PER-PLAN CONFIGURATION (Content Tab per plan):
 * ✅ ts_plan:{key}:image - Plan image
 * ✅ ts_plan:{key}:features - Plan features repeater
 *   ✅ text - Feature text
 *   ✅ feature_ico - Feature icon
 *
 * HTML STRUCTURE:
 * ✅ .ts-plan-tabs - Tabs container
 * ✅ .ts-generic-tabs - Tab list
 * ✅ .ts-tab-active - Active tab state
 * ✅ .ts-plans-list - Plans grid container
 * ✅ .ts-plan-container - Plan card
 * ✅ .ts-plan-image - Plan image
 * ✅ .ts-plan-body - Plan body
 * ✅ .ts-plan-pricing - Pricing section
 * ✅ .ts-plan-price - Price amount
 * ✅ .ts-price-period - Billing period
 * ✅ .ts-plan-details - Plan name section
 * ✅ .ts-plan-name - Plan name
 * ✅ .ts-plan-desc - Plan description
 * ✅ .ts-plan-features - Features list
 * ✅ .ts-btn-2 - Primary button
 * ✅ .ts-btn-1 - Secondary button
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ REST API data fetching with auth
 * ✅ Multisite support via getRestBaseUrl()
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import MembershipPlansComponent from './shared/MembershipPlansComponent';
import type {
	MembershipPlansAttributes,
	MembershipPlansVxConfig,
	MembershipPlansApiResponse,
	IconValue,
	PriceGroup,
	PlanConfig,
	PlanFeature,
} from './types';
import { defaultIconValue } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize vxconfig from various API formats
 *
 * Handles dual-format support for:
 * - camelCase (JavaScript standard)
 * - snake_case (PHP/REST API)
 * - ts_* prefixed (Voxel widget controls)
 *
 * @param raw - Raw config object from vxconfig or API
 * @returns Normalized MembershipPlansVxConfig
 */
function normalizeConfig(raw: Record<string, unknown>): MembershipPlansVxConfig {
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
			const parsed = parseFloat(val);
			return isNaN(parsed) ? fallback : parsed;
		}
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'yes' || val === '1' || val === 1) return true;
		if (val === 'no' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for IconValue normalization
	const normalizeIcon = (val: unknown): IconValue => {
		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const obj = val as Record<string, unknown>;
			return {
				library: normalizeString(obj['library'], ''),
				value: normalizeString(obj['value'], ''),
			};
		}
		return { library: '', value: '' };
	};

	// Helper for PlanFeature normalization
	const normalizeFeature = (val: unknown): PlanFeature => {
		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const obj = val as Record<string, unknown>;
			return {
				text: normalizeString(obj['text'] ?? obj['feature_text'], ''),
				icon: normalizeIcon(obj['icon'] ?? obj['feature_ico']),
			};
		}
		return { text: '', icon: { library: '', value: '' } };
	};

	// Helper for PlanConfig normalization
	const normalizePlanConfig = (val: unknown): PlanConfig => {
		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const obj = val as Record<string, unknown>;
			const imageObj = obj['image'] as Record<string, unknown> | null;

			return {
				image: imageObj
					? {
						id: normalizeNumber(imageObj['id'], 0),
						url: normalizeString(imageObj['url'], ''),
					}
					: null,
				features: Array.isArray(obj['features'])
					? (obj['features'] as unknown[]).map(normalizeFeature)
					: [],
			};
		}
		return { image: null, features: [] };
	};

	// Helper for PriceGroup normalization
	const normalizePriceGroup = (val: unknown): PriceGroup => {
		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const obj = val as Record<string, unknown>;
			return {
				id: normalizeString(obj['id'] ?? obj['_id'], ''),
				label: normalizeString(obj['label'] ?? obj['group_label'], ''),
				prices: Array.isArray(obj['prices'])
					? (obj['prices'] as unknown[]).map((p) => normalizeString(p, ''))
					: [],
			};
		}
		return { id: '', label: '', prices: [] };
	};

	// Helper for style object normalization
	const normalizeStyle = (
		val: unknown
	): MembershipPlansVxConfig['style'] => {
		const styleObj =
			val && typeof val === 'object' && !Array.isArray(val)
				? (val as Record<string, unknown>)
				: {};

		return {
			plansColumns: normalizeNumber(
				styleObj['plansColumns'] ?? styleObj['plans_columns'] ?? styleObj['ts_plans_columns'],
				3
			),
			plansColumns_tablet: styleObj['plansColumns_tablet'] !== undefined
				? normalizeNumber(styleObj['plansColumns_tablet'], undefined as unknown as number)
				: undefined,
			plansColumns_mobile: styleObj['plansColumns_mobile'] !== undefined
				? normalizeNumber(styleObj['plansColumns_mobile'], undefined as unknown as number)
				: undefined,
			plansGap: normalizeNumber(
				styleObj['plansGap'] ?? styleObj['plans_gap'] ?? styleObj['pplans_gap'],
				20
			),
			tabsDisabled: normalizeBoolean(
				styleObj['tabsDisabled'] ?? styleObj['tabs_disabled'] ?? styleObj['pltabs_disable'],
				false
			),
			tabsJustify: normalizeString(
				styleObj['tabsJustify'] ?? styleObj['tabs_justify'] ?? styleObj['pltabs_justify'],
				'flex-start'
			),
			pricingAlign: normalizeString(
				styleObj['pricingAlign'] ?? styleObj['pricing_align'],
				'flex-start'
			),
			contentAlign: normalizeString(
				styleObj['contentAlign'] ?? styleObj['content_align'],
				'flex-start'
			),
			descAlign: normalizeString(
				styleObj['descAlign'] ?? styleObj['desc_align'],
				'left'
			),
			listAlign: normalizeString(
				styleObj['listAlign'] ?? styleObj['list_align'],
				'flex-start'
			),
		};
	};

	// Normalize price groups
	const rawPriceGroups = (raw['priceGroups'] ?? raw['price_groups'] ?? raw['ts_price_groups']) as unknown[];
	const priceGroups: PriceGroup[] = Array.isArray(rawPriceGroups)
		? rawPriceGroups.map(normalizePriceGroup)
		: [];

	// Normalize plan configs (object keyed by plan key)
	const rawPlanConfigs = raw['planConfigs'] ?? raw['plan_configs'];
	const planConfigs: Record<string, PlanConfig> = {};
	if (rawPlanConfigs && typeof rawPlanConfigs === 'object' && !Array.isArray(rawPlanConfigs)) {
		const configsObj = rawPlanConfigs as Record<string, unknown>;
		for (const key of Object.keys(configsObj)) {
			planConfigs[key] = normalizePlanConfig(configsObj[key]);
		}
	}

	// Normalize arrow icon
	const arrowIcon = normalizeIcon(
		raw['arrowIcon'] ?? raw['arrow_icon'] ?? raw['ts_arrow_right']
	);

	// Normalize style
	const style = normalizeStyle(raw['style']);

	return {
		priceGroups,
		planConfigs,
		arrowIcon,
		style,
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
 * Uses normalizeConfig() for dual-format API compatibility
 */
function parseVxConfig(container: HTMLElement): MembershipPlansVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent) as Record<string, unknown>;
			return normalizeConfig(raw);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Fetch plans data from REST API
 */
async function fetchPlansData(): Promise<MembershipPlansApiResponse> {
	const restUrl = getRestUrl();

	const headers: HeadersInit = {};
	const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
	if (nonce) {
		headers['X-WP-Nonce'] = nonce;
	}

	const response = await fetch(`${restUrl}voxel-fse/v1/membership-plans`, {
		credentials: 'same-origin', // Include cookies for auth
		headers,
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch plans data: ${response.statusText}`);
	}

	return (await response.json()) as MembershipPlansApiResponse;
}

/**
 * Wrapper component that handles data fetching
 */
interface MembershipPlansWrapperProps {
	config: MembershipPlansVxConfig;
	dataset: Record<string, string>;
}

function MembershipPlansWrapper({ config, dataset }: MembershipPlansWrapperProps): JSX.Element {
	const [apiData, setApiData] = useState<MembershipPlansApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPlansData() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchPlansData();

				if (!cancelled) {
					setApiData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load plans data');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPlansData();

		return () => {
			cancelled = true;
		};
	}, []);

	// Build attributes from config & dataset
	const attributes: Partial<MembershipPlansAttributes> = {
		blockId: dataset['blockId'] || '',
		priceGroups: config.priceGroups,
		planConfigs: config.planConfigs,
		arrowIcon: config.arrowIcon ?? defaultIconValue,

		// Voxel Tab Hydration
		visibilityBehavior: (dataset['visibilityBehavior'] as any) || 'show',
		visibilityRules: dataset['visibilityRules'] ? JSON.parse(dataset['visibilityRules']) : [],
		loopEnabled: dataset['loopEnabled'] === 'true',
		loopSource: dataset['loopSource'] || '',
		loopProperty: dataset['loopProperty'] || '',
		loopLimit: dataset['loopLimit'] || '',
		loopOffset: dataset['loopOffset'] || '',

		// Style from config
		plansColumns: config.style.plansColumns ?? 3,
		plansColumns_tablet: config.style.plansColumns_tablet,
		plansColumns_mobile: config.style.plansColumns_mobile,
		plansGap: config.style.plansGap ?? 20,
		plansBorderRadius: 0,
		bodyPadding: 20,
		bodyContentGap: 15,
		imagePadding: { top: '0', right: '0', bottom: '0', left: '0' },
		imageHeight: 0,
		pricingAlign: (config.style.pricingAlign as any) ?? 'flex-start',
		contentAlign: (config.style.contentAlign as any) ?? 'flex-start',
		descAlign: (config.style.descAlign as any) ?? 'left',
		listAlign: (config.style.listAlign as any) ?? 'flex-start',
		listGap: 10,
		listIconSize: 18,
		listIconRightPad: 8,
		tabsDisabled: config.style.tabsDisabled ?? false,
		tabsJustify: (config.style.tabsJustify as any) ?? 'flex-start',
		tabsPadding: { top: '0', right: '0', bottom: '0', left: '0' },
		tabsMargin: { top: '0', right: '15', bottom: '15', left: '0' },
		tabsBorderRadius: 0,
		primaryBtnRadius: 5,
		primaryBtnHeight: 0,
		primaryBtnIconSize: 18,
		primaryBtnIconPad: 8,
		secondaryBtnRadius: 5,
		secondaryBtnHeight: 0,
		secondaryBtnIconSize: 18,
		secondaryBtnIconPad: 8,
	};

	return (
		<MembershipPlansComponent
			attributes={attributes as MembershipPlansAttributes}
			apiData={apiData}
			isLoading={isLoading}
			error={error}
			context="frontend"
		/>
	);
}

/**
 * Initialize membership plans blocks on the page
 */
function initMembershipPlansBlocks(): void {
	// Find all membership plans blocks
	const membershipPlansBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-membership-plans'
	);

	membershipPlansBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for membership plans block');
			return;
		}

		// Mark as hydrated and clear placeholder
		container.dataset['hydrated'] = 'true';
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<MembershipPlansWrapper
				config={config}
				dataset={container.dataset as Record<string, string>}
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initMembershipPlansBlocks);
} else {
	initMembershipPlansBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initMembershipPlansBlocks);
window.addEventListener('pjax:complete', initMembershipPlansBlocks);
