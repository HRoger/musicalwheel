/**
 * Print Template Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches templates from multiple sources (Elementor, Pages, Blocks).
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/print-template.php
 * - Helper: themes/voxel/app/utils/print-template.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/print-template.php (51 lines)
 *
 * CONTENT - TEMPLATE:
 * ✅ ts_template_id - Template ID (voxel-post-select control)
 *   - Supports: page, elementor_library post types
 *   - Dynamic tags: @tags()@post(id)@endtags() for current post
 *
 * TEMPLATE SOURCES (FSE Extensions):
 * ✅ Pages - WordPress pages (wp/v2/pages)
 * ✅ Posts - WordPress posts (wp/v2/posts)
 * ✅ Reusable Blocks - wp_block post type (wp/v2/blocks)
 * ✅ Elementor Templates - elementor_library (via Voxel\print_template)
 * ⚠️ FSE Templates - Requires authentication (server-side only)
 *
 * VISIBILITY (FSE Extensions):
 * ✅ hideDesktop - Hide on desktop devices
 * ✅ hideTablet - Hide on tablet devices
 * ✅ hideMobile - Hide on mobile devices
 *
 * STYLING (FSE Extensions):
 * ✅ customClasses - Additional CSS classes
 *
 * DYNAMIC TAGS:
 * ✅ @tags()@post(id)@endtags() - Current post ID
 * ⚠️ Other VoxelScript tags - Partial support (requires server rendering)
 *
 * RENDERING:
 * ✅ Voxel\print_template() - Server-side template rendering
 * ✅ REST API fetching - Client-side for pages/posts/blocks
 * ✅ Loading states - Spinner during fetch
 * ✅ Error states - Graceful error handling
 *
 * HTML STRUCTURE:
 * ✅ .voxel-fse-print-template - Main container
 * ✅ .vxfse-print-template-content - Content wrapper
 * ✅ [data-template-id] - Template ID data attribute
 * ✅ script.vxconfig - JSON configuration
 *
 * MULTISITE SUPPORT:
 * ✅ getRestBaseUrl() - Handles subdirectory multisite
 * ✅ Dynamic REST URL construction
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Async template fetching with proper cancellation
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import PrintTemplateComponent from './shared/PrintTemplateComponent';
import type { PrintTemplateAttributes, PrintTemplateVxConfig } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): PrintTemplateVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	return {
		// Template ID - support both camelCase and snake_case
		templateId: normalizeString(
			raw.templateId ?? raw.template_id ?? raw.ts_template_id,
			''
		),
		// Visibility controls
		hideDesktop: normalizeBool(raw.hideDesktop ?? raw.hide_desktop, false),
		hideTablet: normalizeBool(raw.hideTablet ?? raw.hide_tablet, false),
		hideMobile: normalizeBool(raw.hideMobile ?? raw.hide_mobile, false),
		// Custom classes
		customClasses: normalizeString(raw.customClasses ?? raw.custom_classes, ''),
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
function parseVxConfig(container: HTMLElement): PrintTemplateVxConfig | null {
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
 * Render dynamic tags (VoxelScript)
 */
async function renderDynamicTag(tag: string): Promise<string> {
	// Check if it's a dynamic tag
	if (!tag.startsWith('@tags()')) {
		return tag;
	}

	// Extract the tag content
	const match = tag.match(/@tags\(\)(.*?)@endtags\(\)/s);
	if (!match) {
		return tag;
	}

	const tagContent = match[1].trim();

	// Handle @post(id)
	if (tagContent === '@post(id)') {
		// Get current post ID from body class
		const bodyClasses = document.body.className;
		const postIdMatch = bodyClasses.match(/postid-(\d+)/);
		if (postIdMatch) {
			return postIdMatch[1];
		}

		// Fallback: try to get from URL
		const urlMatch = window.location.pathname.match(/\/(\d+)\/?$/);
		if (urlMatch) {
			return urlMatch[1];
		}
	}

	// For other tags, return empty for now
	console.warn('Dynamic tag not fully supported:', tagContent);
	return '';
}

/**
 * Fetch template content from public REST API endpoints
 * Note: FSE templates/template-parts require authentication and are not available on frontend
 * For frontend, we fetch: Pages, Reusable Blocks, Posts
 */
async function fetchTemplateContent(templateId: string): Promise<string | null> {
	const restUrl = getRestUrl();

	// Handle dynamic tags
	let resolvedId = templateId;
	if (templateId.startsWith('@tags()')) {
		resolvedId = await renderDynamicTag(templateId);
		if (!resolvedId) {
			console.warn('Could not resolve dynamic template ID');
			return null;
		}
	}

	// FSE template IDs (string format like 'theme//template-name') require auth
	// These should be pre-rendered by save.tsx or server-side rendering
	if (resolvedId.includes('//')) {
		console.warn('FSE templates require authentication and cannot be fetched on frontend:', resolvedId);
		return null;
	}

	// Handle numeric IDs
	const id = parseInt(resolvedId, 10);
	if (isNaN(id) || id <= 0) {
		console.warn('Invalid template ID:', resolvedId);
		return null;
	}

	// Try pages first
	try {
		const response = await fetch(`${restUrl}wp/v2/pages/${id}`);
		if (response.ok) {
			const data = await response.json();
			return data.content?.rendered || data.content?.raw || null;
		}
	} catch {
		// Continue
	}

	// Try reusable blocks
	try {
		const response = await fetch(`${restUrl}wp/v2/blocks/${id}`);
		if (response.ok) {
			const data = await response.json();
			return data.content?.rendered || data.content?.raw || null;
		}
	} catch {
		// Continue
	}

	// Try posts
	try {
		const response = await fetch(`${restUrl}wp/v2/posts/${id}`);
		if (response.ok) {
			const data = await response.json();
			return data.content?.rendered || data.content?.raw || null;
		}
	} catch {
		// Continue
	}

	console.error('Template not found in any source:', id);
	return null;
}

/**
 * Wrapper component that handles data fetching
 */
interface PrintTemplateWrapperProps {
	config: PrintTemplateVxConfig;
}

function PrintTemplateWrapper({ config }: PrintTemplateWrapperProps) {
	const [content, setContent] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadTemplate() {
			if (!config.templateId) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const templateContent = await fetchTemplateContent(config.templateId);

				if (!cancelled) {
					if (templateContent !== null) {
						setContent(templateContent);
					} else {
						setError('Template not found');
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load template');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadTemplate();

		return () => {
			cancelled = true;
		};
	}, [config.templateId]);

	// Build attributes from config
	const attributes: PrintTemplateAttributes = {
		blockId: '',
		templateId: config.templateId,
		hideDesktop: config.hideDesktop,
		hideTablet: config.hideTablet,
		hideMobile: config.hideMobile,
		customClasses: config.customClasses,
	};

	return (
		<PrintTemplateComponent
			attributes={attributes}
			templateContent={content}
			isLoading={isLoading}
			error={error}
			context="frontend"
		/>
	);
}

/**
 * Initialize print template blocks on the page
 */
function initPrintTemplates() {
	// Find all print template blocks
	const printTemplates = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-print-template'
	);

	printTemplates.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for print template block');
			return;
		}

		// Mark as hydrated and clear placeholder
		container.dataset.hydrated = 'true';
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(<PrintTemplateWrapper config={config} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPrintTemplates);
} else {
	initPrintTemplates();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initPrintTemplates);
window.addEventListener('pjax:complete', initPrintTemplates);
