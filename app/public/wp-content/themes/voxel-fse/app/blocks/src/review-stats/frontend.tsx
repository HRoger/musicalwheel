/**
 * Review Stats Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches review statistics from REST API for dynamic display.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/review-stats.php (285 lines)
 * - Template: themes/voxel/templates/widgets/review-stats.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/review-stats.php (285 lines)
 *
 * SETTINGS (Content Tab):
 * ✅ stat_mode - Show stats for (overall, by_category)
 *   - overall: Shows rating distribution (excellent, very_good, good, fair, poor)
 *   - by_category: Shows scores per review category
 *
 * REVIEWS GRID (Style Tab):
 * ✅ ts_rs_column_no - Number of columns (responsive, 1-6)
 * ✅ ts_rs_col_gap - Item gap (responsive slider, px)
 *
 * REVIEW STATS (Style Tab):
 * ✅ ts_review_icon_size - Icon size (responsive slider, 16-80px)
 * ✅ ts_review_icon_spacing - Icon right spacing (slider, px)
 * ✅ ts_review_typo - Label typography (group control)
 * ✅ ts_review_typo_color - Label color
 * ✅ ts_review_score - Score typography (group control)
 * ✅ ts_review_score_color - Score color
 * ✅ ts_review_chart_bg - Chart background color
 * ✅ ts_chart_height - Chart height (responsive slider, px)
 * ✅ ts_chart_rad - Chart border radius (responsive slider, px)
 *
 * VISIBILITY (FSE Extensions):
 * ✅ hideDesktop - Hide on desktop devices
 * ✅ hideTablet - Hide on tablet devices
 * ✅ hideMobile - Hide on mobile devices
 *
 * STYLING (FSE Extensions):
 * ✅ customClasses - Additional CSS classes
 *
 * DATA STRUCTURE:
 * ✅ Rating levels - excellent(2), very_good(1), good(0), fair(-1), poor(-2)
 * ✅ Percentage calculation - (count / total) * 100
 * ✅ Category stats - Per-category scores with icons
 *
 * HTML STRUCTURE:
 * ✅ .ts-review-bars - Grid container for review bars
 * ✅ .ts-bar-data - Data row (icon + label + score)
 * ✅ .ts-bar-data i/svg - Category icon
 * ✅ .ts-bar-data p - Label text
 * ✅ .ts-bar-data p span - Score value
 * ✅ .ts-bar-chart - Progress bar container
 * ✅ .ts-bar-value - Progress bar fill (width = percentage)
 *
 * REST API:
 * ✅ voxel-fse/v1/review-stats - Review stats endpoint
 * ✅ Query params: post_id
 * ✅ Response: overall, ratingLevels, byCategory, totalReviews
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
import ReviewStatsComponent from './shared/ReviewStatsComponent';
import type {
	ReviewStatsAttributes,
	ReviewStatsVxConfig,
	ReviewStatsData,
} from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): ReviewStatsVxConfig {
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
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Helper for responsive number value normalization
	const normalizeResponsiveNumber = (
		val: unknown,
		fallback: number
	): { desktop: number; tablet?: number; mobile?: number } => {
		if (typeof val === 'object' && val !== null) {
			const obj = val as Record<string, unknown>;
			return {
				desktop: obj['desktop'] !== undefined ? normalizeNumber(obj['desktop'], fallback) : fallback,
				tablet: obj['tablet'] !== undefined ? normalizeNumber(obj['tablet'], fallback) : undefined,
				mobile: obj['mobile'] !== undefined ? normalizeNumber(obj['mobile'], fallback) : undefined,
			};
		}
		if (typeof val === 'number') return { desktop: val };
		return { desktop: fallback };
	};

	// Helper for responsive string value normalization
	const normalizeResponsiveString = (
		val: unknown,
		fallback: string
	): { desktop: string; tablet?: string; mobile?: string } => {
		if (typeof val === 'object' && val !== null) {
			const obj = val as Record<string, unknown>;
			return {
				desktop: obj['desktop'] !== undefined ? normalizeString(obj['desktop'], fallback) : fallback,
				tablet: obj['tablet'] !== undefined ? normalizeString(obj['tablet'], fallback) : undefined,
				mobile: obj['mobile'] !== undefined ? normalizeString(obj['mobile'], fallback) : undefined,
			};
		}
		if (typeof val === 'string') return { desktop: val };
		return { desktop: fallback };
	};

	// Helper to extract numeric value from string
	const extractNumber = (val: string | undefined): number | undefined => {
		if (!val) return undefined;
		const num = parseFloat(val);
		return isNaN(num) ? undefined : num;
	};

	// Normalize responsive values first
	const columnsRes = normalizeResponsiveNumber(raw['columns'] ?? raw['ts_rs_column_no'], 1);
	const itemGapRes = normalizeResponsiveString(raw['itemGap'] ?? raw['item_gap'] ?? raw['ts_rs_col_gap'], '');
	const iconSizeRes = normalizeResponsiveString(raw['iconSize'] ?? raw['icon_size'] ?? raw['ts_review_icon_size'], '');
	const chartHeightRes = normalizeResponsiveString(raw['chartHeight'] ?? raw['chart_height'] ?? raw['ts_chart_height'], '');
	const chartRadiusRes = normalizeResponsiveString(raw['chartRadius'] ?? raw['chart_radius'] ?? raw['ts_chart_rad'], '');

	return {
		// Display mode
		statMode: normalizeString(
			raw['statMode'] ?? raw['stat_mode'],
			'overall'
		),
		// Grid settings
		columns: columnsRes.desktop,
		columns_tablet: columnsRes.tablet,
		columns_mobile: columnsRes.mobile,

		itemGap: typeof raw['itemGap'] === 'number' ? raw['itemGap'] : (extractNumber(itemGapRes.desktop) ?? 0),
		itemGap_tablet: typeof raw['itemGap_tablet'] === 'number' ? raw['itemGap_tablet'] as number : extractNumber(itemGapRes.tablet),
		itemGap_mobile: typeof raw['itemGap_mobile'] === 'number' ? raw['itemGap_mobile'] as number : extractNumber(itemGapRes.mobile),

		// Icon styling
		iconSize: typeof raw['iconSize'] === 'number' ? raw['iconSize'] : (extractNumber(iconSizeRes.desktop) ?? 0),
		iconSize_tablet: typeof raw['iconSize_tablet'] === 'number' ? raw['iconSize_tablet'] as number : extractNumber(iconSizeRes.tablet),
		iconSize_mobile: typeof raw['iconSize_mobile'] === 'number' ? raw['iconSize_mobile'] as number : extractNumber(iconSizeRes.mobile),

		iconSpacing: raw['iconSpacing'] !== undefined
			? normalizeNumber(raw['iconSpacing'], undefined as unknown as number)
			: raw['icon_spacing'] !== undefined
				? normalizeNumber(raw['icon_spacing'], undefined as unknown as number)
				: raw['ts_review_icon_spacing'] !== undefined
					? normalizeNumber(raw['ts_review_icon_spacing'], undefined as unknown as number)
					: undefined,
		// Label styling
		labelTypography: (raw['labelTypography'] ?? raw['label_typography'] ?? raw['ts_review_typo'] ?? {}) as ReviewStatsVxConfig['labelTypography'],
		labelColor: normalizeString(
			raw['labelColor'] ?? raw['label_color'] ?? raw['ts_review_typo_color'],
			''
		),
		// Score styling
		scoreTypography: (raw['scoreTypography'] ?? raw['score_typography'] ?? raw['ts_review_score'] ?? {}) as ReviewStatsVxConfig['scoreTypography'],
		scoreColor: normalizeString(
			raw['scoreColor'] ?? raw['score_color'] ?? raw['ts_review_score_color'],
			''
		),
		// Chart styling
		chartBgColor: normalizeString(
			raw['chartBgColor'] ?? raw['chart_bg_color'] ?? raw['ts_review_chart_bg'],
			''
		),

		chartHeight: typeof raw['chartHeight'] === 'number' ? raw['chartHeight'] : (extractNumber(chartHeightRes.desktop) ?? 0),
		chartHeight_tablet: typeof raw['chartHeight_tablet'] === 'number' ? raw['chartHeight_tablet'] as number : extractNumber(chartHeightRes.tablet),
		chartHeight_mobile: typeof raw['chartHeight_mobile'] === 'number' ? raw['chartHeight_mobile'] as number : extractNumber(chartHeightRes.mobile),

		chartRadius: typeof raw['chartRadius'] === 'number' ? raw['chartRadius'] : (extractNumber(chartRadiusRes.desktop) ?? 0),
		chartRadius_tablet: typeof raw['chartRadius_tablet'] === 'number' ? raw['chartRadius_tablet'] as number : extractNumber(chartRadiusRes.tablet),
		chartRadius_mobile: typeof raw['chartRadius_mobile'] === 'number' ? raw['chartRadius_mobile'] as number : extractNumber(chartRadiusRes.mobile),
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
 * Get the current post ID from page context
 * This is needed because save.tsx doesn't have access to post context
 */
function getPostIdFromContext(): number | null {
	// Try to get from Voxel's global context
	const voxelPost = (window as unknown as { voxelCurrentPost?: { id: number } }).voxelCurrentPost;
	if (voxelPost?.id) {
		return voxelPost.id;
	}

	// Try to get from body class (WordPress convention)
	const bodyClasses = document.body.className.split(' ');
	for (const cls of bodyClasses) {
		// Check for both postid- and page-id- formats
		if (cls.startsWith('postid-') || cls.startsWith('page-id-')) {
			const id = parseInt(cls.replace('postid-', '').replace('page-id-', ''), 10);
			if (!isNaN(id)) {
				return id;
			}
		}
	}

	// Try to get from wp.data (if available)
	const wpData = (window as unknown as { wp?: { data?: { select: (store: string) => { getCurrentPostId?: () => number } } } }).wp;
	if (wpData?.data?.select) {
		const postId = wpData.data.select('core/editor')?.getCurrentPostId?.();
		if (postId) {
			return postId;
		}
	}

	// Try to get from closest article element
	const article = document.querySelector('article[id^="post-"]');
	if (article) {
		const id = parseInt(article.id.replace('post-', ''), 10);
		if (!isNaN(id)) {
			return id;
		}
	}

	return null;
}

/**
 * Parse vxconfig from container's script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): ReviewStatsVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript?.textContent) {
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
 * Build attributes from vxconfig
 */
function buildAttributesFromVxConfig(
	vxconfig: ReviewStatsVxConfig,
	blockId: string
): ReviewStatsAttributes {
	return {
		blockId,
		statMode: (vxconfig.statMode as 'overall' | 'by_category') || 'overall',
		columns: vxconfig.columns || 1,
		columns_tablet: vxconfig.columns_tablet,
		columns_mobile: vxconfig.columns_mobile,
		itemGap: vxconfig.itemGap || 0,
		itemGap_tablet: vxconfig.itemGap_tablet,
		itemGap_mobile: vxconfig.itemGap_mobile,
		iconSize: vxconfig.iconSize || 0,
		iconSize_tablet: vxconfig.iconSize_tablet,
		iconSize_mobile: vxconfig.iconSize_mobile,
		iconSpacing: vxconfig.iconSpacing,
		labelTypography: vxconfig.labelTypography || {},
		labelColor: vxconfig.labelColor || '',
		scoreTypography: vxconfig.scoreTypography || {},
		scoreColor: vxconfig.scoreColor || '',
		chartBgColor: vxconfig.chartBgColor || '',
		chartHeight: vxconfig.chartHeight || 0,
		chartHeight_tablet: vxconfig.chartHeight_tablet,
		chartHeight_mobile: vxconfig.chartHeight_mobile,
		chartRadius: vxconfig.chartRadius || 0,
		chartRadius_tablet: vxconfig.chartRadius_tablet,
		chartRadius_mobile: vxconfig.chartRadius_mobile,
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
	};
}

/**
 * Fetch review stats data from REST API
 */
async function fetchReviewStats(postId: number): Promise<ReviewStatsData> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/review-stats?post_id=${postId}`;

	const headers: HeadersInit = {};
	const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
	if (nonce) {
		headers['X-WP-Nonce'] = nonce;
	}

	const response = await fetch(endpoint, {
		credentials: 'same-origin',
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error((error as { message?: string }).message || `HTTP error ${response.status}`);
	}

	return response.json() as Promise<ReviewStatsData>;
}

/**
 * Wrapper component that handles data fetching
 */
interface ReviewStatsWrapperProps {
	attributes: ReviewStatsAttributes;
	postId: number;
}

function ReviewStatsWrapper({ attributes, postId }: ReviewStatsWrapperProps) {
	const [statsData, setStatsData] = useState<ReviewStatsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadStatsData() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchReviewStats(postId);
				if (!cancelled) {
					setStatsData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load review stats');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadStatsData();

		return () => {
			cancelled = true;
		};
	}, [postId]);

	return (
		<ReviewStatsComponent
			attributes={attributes}
			statsData={statsData}
			isLoading={isLoading}
			error={error}
			context="frontend"
			postId={postId}
		/>
	);
}

/**
 * Initialize review stats blocks on the page
 */
function initReviewStatsBlocks() {
	// Find all review stats blocks
	const containers = document.querySelectorAll<HTMLElement>('.vxfse-review-stats');

	containers.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const vxconfig = parseVxConfig(container);
		if (!vxconfig) {
			return;
		}

		// Get post ID from page context
		const postId = getPostIdFromContext();
		if (!postId) {
			return;
		}

		// Build attributes from vxconfig
		const blockId = container.dataset['blockId'] || '';
		const attributes = buildAttributesFromVxConfig(vxconfig, blockId);

		// Mark as hydrated to prevent double-initialization
		container.dataset['hydrated'] = 'true';

		// Clear placeholder content
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<ReviewStatsWrapper
				attributes={attributes}
				postId={postId}
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initReviewStatsBlocks);
} else {
	initReviewStatsBlocks();
}

// Support Turbo/PJAX navigation (for single-page app experience)
window.addEventListener('turbo:load', initReviewStatsBlocks);
window.addEventListener('pjax:complete', initReviewStatsBlocks);
