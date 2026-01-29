/**
 * Create Post Block - Frontend Entry Point (Plan C+)
 *
 * Uses data from wp_localize_script (window.voxelFseCreatePost) which contains
 * full fieldsConfig from PHP. NO REST API fetch needed - data is inline.
 *
 * Pattern: render.php passes all data → frontend.tsx uses it directly
 * This matches Voxel's approach where vxconfig contains full field data.
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: docs/block-conversions/create-post/voxel-create-post.beautified.js (1,941 lines)
 * Original: themes/voxel/assets/dist/create-post.js (~69KB)
 *
 * FIELD COMPONENTS (20+ types implemented):
 * ✅ TitleField - Post title with placeholder/minlength/maxlength
 * ✅ DescriptionField - wp-editor/plain-text/TinyMCE
 * ✅ TextField - Single line text input
 * ✅ TextareaField - Multi-line text input
 * ✅ NumberField - Numeric input with min/max/step
 * ✅ EmailField - Email validation
 * ✅ UrlField - URL validation
 * ✅ PhoneField - Phone number input
 * ✅ SelectField - Dropdown with choices (popup mode)
 * ✅ TaxonomyField - Term picker with hierarchy
 * ✅ FileField - Media upload with drag/drop
 * ✅ LocationField - Google Maps + Places Autocomplete
 * ✅ DateField - Pikaday date picker
 * ✅ SwitcherField - Toggle switch
 * ✅ WorkHoursField - Week schedule editor
 * ✅ RepeaterField - Dynamic row fields
 * ✅ ProductField - E-commerce (booking, variations, addons)
 * ✅ UIStep - Multi-step wizard navigation
 * ✅ UIHeading - Section headings
 * ✅ UIHtml - Custom HTML blocks
 *
 * CORE FEATURES:
 * ✅ HTML structure matches (ts-form, ts-create-post, ts-form-group)
 * ✅ Multi-step wizard navigation
 * ✅ Conditional field visibility
 * ✅ Client-side validation
 * ✅ Draft saving (localStorage + AJAX)
 * ✅ File upload session management
 * ✅ Success/error messaging (Voxel.alert)
 * ✅ Admin metabox mode
 * ✅ Edit mode (post_id param)
 * ✅ Form head with back button
 * ✅ Turbo/PJAX navigation support
 *
 * AJAX SYSTEM:
 * - Voxel: `?vx=1&action=create_post.submit` or `create_post.save_draft`
 * - FSE: Same endpoints via getSiteBaseUrl() + ?vx=1
 * - File uploads: Session-based via `_vx_file_upload_cache`
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ CreatePostForm accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ REST API endpoint for headless field fetching
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   postTypeKey: string,
 *   submitButtonText: string,
 *   successMessage: string,
 *   redirectAfterSubmit: string,
 *   showFormHead: boolean,
 *   enableDraftSaving: boolean,
 *   icons: { popupIcon, infoIcon, tsMediaIco, ... }
 * }
 *
 * REST API: GET voxel-fse/v1/create-post/fields-config?post_type={key}&post_id={id}
 * Returns: { fieldsConfig: VoxelField[], postId: number|null, postStatus: string|null }
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import { CreatePostForm } from './shared';
import type { CreatePostAttributes, VoxelField } from './types';

/**
 * Window extension for WordPress API settings and Voxel data
 */
interface WpApiSettings {
	root: string;
	nonce: string;
}

interface VoxelFseCreatePostData {
	restUrl?: string;
	ajaxUrl?: string;
	nonce?: string;
	postStatus?: string | null;
	adminModeNonce?: string;
	isAdminMode?: boolean;
	isAdminMetabox?: boolean;
	i18n?: Record<string, string>;
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
		voxelFseCreatePost?: VoxelFseCreatePostData;
	}
}

import { getSiteBaseUrl, getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Get Voxel AJAX URL for form submission
 * MULTISITE FIX: Uses getSiteBaseUrl() for multisite subdirectory support
 */
function getAjaxUrl(): string {
	if (typeof window !== 'undefined' && window.voxelFseCreatePost?.ajaxUrl) {
		return window.voxelFseCreatePost.ajaxUrl;
	}
	// MULTISITE FIX: Use getSiteBaseUrl() which properly detects site path
	return getSiteBaseUrl();
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Fetch fields configuration from REST API (Plan C+ pattern - headless-ready)
 */
interface FieldsConfigResponse {
	fieldsConfig: VoxelField[];
	postId: number | null;
	postStatus: string | null;
}

async function fetchFieldsConfig(
	postTypeKey: string,
	postId: number | null = null,
	isAdminMetabox: boolean = false
): Promise<FieldsConfigResponse | null> {
	const restUrl = getRestUrl();
	console.log('[Create Post DEBUG] fetchFieldsConfig - restUrl:', restUrl);
	console.log('[Create Post DEBUG] fetchFieldsConfig - postTypeKey:', postTypeKey);
	console.log('[Create Post DEBUG] fetchFieldsConfig - postId:', postId);
	console.log('[Create Post DEBUG] fetchFieldsConfig - isAdminMetabox:', isAdminMetabox);

	const params = new URLSearchParams({
		post_type: postTypeKey,
	});

	if (postId) {
		params.append('post_id', postId.toString());
	}

	if (isAdminMetabox) {
		params.append('is_admin_metabox', 'true');
	}

	const endpoint = `${restUrl}voxel-fse/v1/create-post/fields-config?${params.toString()}`;
	console.log('[Create Post DEBUG] fetchFieldsConfig - endpoint:', endpoint);

	try {
		console.log('[Create Post DEBUG] fetchFieldsConfig - Sending fetch request...');
		const response = await fetch(endpoint);
		console.log('[Create Post DEBUG] fetchFieldsConfig - Response status:', response.status);
		console.log('[Create Post DEBUG] fetchFieldsConfig - Response ok:', response.ok);
		if (!response.ok) {
			const errorText = await response.text();
			console.error('[Create Post DEBUG] fetchFieldsConfig - Error response:', errorText);
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.log('[Create Post DEBUG] fetchFieldsConfig - Parsed JSON data:', data);
		return data as FieldsConfigResponse;
	} catch (error) {
		console.error('[Create Post DEBUG] fetchFieldsConfig - Caught error:', error);
		return null;
	}
}

/**
 * Parse JSON safely with fallback
 */
function parseJson(value: string | null | undefined, fallback: unknown): unknown {
	if (!value) return fallback;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

/**
 * Parse boolean from string
 */
function parseBool(value: string | null | undefined): boolean {
	return value === 'true';
}

/**
 * Parse data attributes from save.tsx output into CreatePostAttributes
 * Fallback when vxconfig is not found (matching search-form pattern)
 */
function parseDataAttributes(container: HTMLElement): CreatePostAttributes {
	return {
		postTypeKey: container.dataset.postType || '',
		submitButtonText: container.dataset.submitButtonText || 'Publish',
		successMessage: container.dataset.successMessage || '',
		redirectAfterSubmit: container.dataset.redirectAfterSubmit || '',
		showFormHead: parseBool(container.dataset.showFormHead),
		enableDraftSaving: parseBool(container.dataset.enableDraftSaving),
		// Icon attributes - parse from data attributes if available
		popupIcon: parseJson(container.dataset.popupIcon, null) as any,
		infoIcon: parseJson(container.dataset.infoIcon, null) as any,
		tsMediaIco: parseJson(container.dataset.tsMediaIco, null) as any,
		nextIcon: parseJson(container.dataset.nextIcon, null) as any,
		prevIcon: parseJson(container.dataset.prevIcon, null) as any,
		downIcon: parseJson(container.dataset.downIcon, null) as any,
		trashIcon: parseJson(container.dataset.trashIcon, null) as any,
		draftIcon: parseJson(container.dataset.draftIcon, null) as any,
		publishIcon: parseJson(container.dataset.publishIcon, null) as any,
		saveIcon: parseJson(container.dataset.saveIcon, null) as any,
		successIcon: parseJson(container.dataset.successIcon, null) as any,
		viewIcon: parseJson(container.dataset.viewIcon, null) as any,
		tsCalendarIcon: parseJson(container.dataset.tsCalendarIcon, null) as any,
		tsCalminusIcon: parseJson(container.dataset.tsCalminusIcon, null) as any,
		tsAddIcon: parseJson(container.dataset.tsAddIcon, null) as any,
		tsEmailIcon: parseJson(container.dataset.tsEmailIcon, null) as any,
		tsPhoneIcon: parseJson(container.dataset.tsPhoneIcon, null) as any,
		tsLocationIcon: parseJson(container.dataset.tsLocationIcon, null) as any,
		tsMylocationIcon: parseJson(container.dataset.tsMylocationIcon, null) as any,
		tsMinusIcon: parseJson(container.dataset.tsMinusIcon, null) as any,
		tsPlusIcon: parseJson(container.dataset.tsPlusIcon, null) as any,
		tsListIcon: parseJson(container.dataset.tsListIcon, null) as any,
		tsSearchIcon: parseJson(container.dataset.tsSearchIcon, null) as any,
		tsClockIcon: parseJson(container.dataset.tsClockIcon, null) as any,
		tsLinkIcon: parseJson(container.dataset.tsLinkIcon, null) as any,
		tsRtimeslotIcon: parseJson(container.dataset.tsRtimeslotIcon, null) as any,
		tsUploadIco: parseJson(container.dataset.tsUploadIco, null) as any,
		tsLoadMore: parseJson(container.dataset.tsLoadMore, null) as any,
	};
}

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: voxel-create-post.beautified.js vxconfig format
 */
function normalizeConfig(raw: Record<string, unknown>): CreatePostAttributes {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1) return true;
		if (val === 'false' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for icon normalization (from icons object or top-level)
	const normalizeIcon = (val: unknown): Record<string, unknown> | null => {
		if (val && typeof val === 'object') return val as Record<string, unknown>;
		return null;
	};

	// Get icons from nested object or top-level
	const icons = (raw.icons && typeof raw.icons === 'object' ? raw.icons : {}) as Record<string, unknown>;

	return {
		// Core settings - support both camelCase and snake_case
		postTypeKey: (raw.postTypeKey ?? raw.post_type_key ?? raw.post_type ?? '') as string,
		submitButtonText: (raw.submitButtonText ?? raw.submit_button_text ?? 'Publish') as string,
		successMessage: (raw.successMessage ?? raw.success_message ?? '') as string,
		redirectAfterSubmit: (raw.redirectAfterSubmit ?? raw.redirect_after_submit ?? '') as string,
		showFormHead: normalizeBool(raw.showFormHead ?? raw.show_form_head, true),
		enableDraftSaving: normalizeBool(raw.enableDraftSaving ?? raw.enable_draft_saving, true),

		// Icons - from nested icons object or top-level
		popupIcon: normalizeIcon(icons.popupIcon ?? icons.popup_icon ?? raw.popupIcon),
		infoIcon: normalizeIcon(icons.infoIcon ?? icons.info_icon ?? raw.infoIcon),
		tsMediaIco: normalizeIcon(icons.tsMediaIco ?? icons.ts_media_ico ?? raw.tsMediaIco),
		nextIcon: normalizeIcon(icons.nextIcon ?? icons.next_icon ?? raw.nextIcon),
		prevIcon: normalizeIcon(icons.prevIcon ?? icons.prev_icon ?? raw.prevIcon),
		downIcon: normalizeIcon(icons.downIcon ?? icons.down_icon ?? raw.downIcon),
		trashIcon: normalizeIcon(icons.trashIcon ?? icons.trash_icon ?? raw.trashIcon),
		draftIcon: normalizeIcon(icons.draftIcon ?? icons.draft_icon ?? raw.draftIcon),
		publishIcon: normalizeIcon(icons.publishIcon ?? icons.publish_icon ?? raw.publishIcon),
		saveIcon: normalizeIcon(icons.saveIcon ?? icons.save_icon ?? raw.saveIcon),
		successIcon: normalizeIcon(icons.successIcon ?? icons.success_icon ?? raw.successIcon),
		viewIcon: normalizeIcon(icons.viewIcon ?? icons.view_icon ?? raw.viewIcon),
		tsCalendarIcon: normalizeIcon(icons.tsCalendarIcon ?? icons.ts_calendar_icon ?? raw.tsCalendarIcon),
		tsCalminusIcon: normalizeIcon(icons.tsCalminusIcon ?? icons.ts_calminus_icon ?? raw.tsCalminusIcon),
		tsAddIcon: normalizeIcon(icons.tsAddIcon ?? icons.ts_add_icon ?? raw.tsAddIcon),
		tsEmailIcon: normalizeIcon(icons.tsEmailIcon ?? icons.ts_email_icon ?? raw.tsEmailIcon),
		tsPhoneIcon: normalizeIcon(icons.tsPhoneIcon ?? icons.ts_phone_icon ?? raw.tsPhoneIcon),
		tsLocationIcon: normalizeIcon(icons.tsLocationIcon ?? icons.ts_location_icon ?? raw.tsLocationIcon),
		tsMylocationIcon: normalizeIcon(icons.tsMylocationIcon ?? icons.ts_mylocation_icon ?? raw.tsMylocationIcon),
		tsMinusIcon: normalizeIcon(icons.tsMinusIcon ?? icons.ts_minus_icon ?? raw.tsMinusIcon),
		tsPlusIcon: normalizeIcon(icons.tsPlusIcon ?? icons.ts_plus_icon ?? raw.tsPlusIcon),
		tsListIcon: normalizeIcon(icons.tsListIcon ?? icons.ts_list_icon ?? raw.tsListIcon),
		tsSearchIcon: normalizeIcon(icons.tsSearchIcon ?? icons.ts_search_icon ?? raw.tsSearchIcon),
		tsClockIcon: normalizeIcon(icons.tsClockIcon ?? icons.ts_clock_icon ?? raw.tsClockIcon),
		tsLinkIcon: normalizeIcon(icons.tsLinkIcon ?? icons.ts_link_icon ?? raw.tsLinkIcon),
		tsRtimeslotIcon: normalizeIcon(icons.tsRtimeslotIcon ?? icons.ts_rtimeslot_icon ?? raw.tsRtimeslotIcon),
		tsUploadIco: normalizeIcon(icons.tsUploadIco ?? icons.ts_upload_ico ?? raw.tsUploadIco),
		tsLoadMore: normalizeIcon(icons.tsLoadMore ?? icons.ts_load_more ?? raw.tsLoadMore),
	};
}

/**
 * Parse vxconfig from script tag (matching search-form pattern - Plan C+)
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): CreatePostAttributes {
	console.log('[Create Post DEBUG] parseVxConfig called');
	console.log('[Create Post DEBUG] Container classes:', container.className);
	console.log('[Create Post DEBUG] Container innerHTML (first 500 chars):', container.innerHTML.substring(0, 500));

	// Look for vxconfig script tag (matching Voxel pattern)
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');
	console.log('[Create Post DEBUG] vxconfigScript found:', !!vxconfigScript);

	if (vxconfigScript) {
		console.log('[Create Post DEBUG] vxconfigScript.textContent:', vxconfigScript.textContent?.substring(0, 200));
	}

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const config = JSON.parse(vxconfigScript.textContent);
			console.log('[Create Post DEBUG] Parsed vxconfig:', config);

			// Use normalizeConfig for consistent format handling
			const attributes = normalizeConfig(config);
			console.log('[Create Post DEBUG] Normalized attributes:', attributes);
			return attributes;
		} catch (error) {
			console.error('[Create Post DEBUG] Failed to parse vxconfig:', error);
		}
	}

	// Fallback to data attributes if vxconfig not found (matching search-form pattern)
	console.log('[Create Post DEBUG] Falling back to data attributes');
	return parseDataAttributes(container);
}

/**
 * Get post ID from URL query parameter
 * Matches Voxel's pattern: /create-{post-type}/?post_id=123
 */
function getPostIdFromUrl(): number | null {
	if (typeof window === 'undefined') return null;

	const params = new URLSearchParams(window.location.search);
	const postIdParam = params.get('post_id');

	if (postIdParam) {
		const postId = parseInt(postIdParam, 10);
		return isNaN(postId) ? null : postId;
	}

	return null;
}

/**
 * Frontend Wrapper Component
 * Fetches fieldsConfig from REST API (Plan C+ pattern - headless-ready)
 * Matching search-form pattern: accepts attributes directly
 */
interface FrontendWrapperProps {
	attributes: CreatePostAttributes;
	isAdminMetabox?: boolean;
}

function FrontendWrapper({ attributes, isAdminMetabox = false }: FrontendWrapperProps) {
	console.log('[Create Post DEBUG] FrontendWrapper rendered with:', { attributes, isAdminMetabox });

	const [fieldsConfig, setFieldsConfig] = useState<VoxelField[]>([]);
	const [postId, setPostId] = useState<number | null>(null);
	const [postStatus, setPostStatus] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Get post ID from URL or data attribute
	const urlPostId = getPostIdFromUrl();
	console.log('[Create Post DEBUG] urlPostId:', urlPostId);

	useEffect(() => {
		console.log('[Create Post DEBUG] useEffect triggered, postTypeKey:', attributes.postTypeKey);
		let cancelled = false;

		async function loadFieldsConfig() {
			console.log('[Create Post DEBUG] loadFieldsConfig called');
			setIsLoading(true);
			setError(null);

			try {
				console.log('[Create Post DEBUG] Fetching fields config for:', attributes.postTypeKey);
				const data = await fetchFieldsConfig(
					attributes.postTypeKey,
					urlPostId,
					isAdminMetabox
				);
				console.log('[Create Post DEBUG] fetchFieldsConfig result:', data);

				if (!cancelled && data) {
					console.log('[Create Post DEBUG] Setting fieldsConfig, count:', data.fieldsConfig?.length);
					setFieldsConfig(data.fieldsConfig);
					setPostId(data.postId);
					setPostStatus(data.postStatus);
				} else if (!cancelled) {
					console.log('[Create Post DEBUG] No data returned from fetchFieldsConfig');
					setError('Failed to load form configuration');
				}
			} catch (err) {
				console.error('[Create Post DEBUG] fetchFieldsConfig error:', err);
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadFieldsConfig();

		return () => {
			cancelled = true;
		};
	}, [attributes.postTypeKey, urlPostId, isAdminMetabox]);

	// Loading state
	if (isLoading) {
		return (
			<div className="ts-form ts-create-post voxel-fse-loading">
				<div className="loading-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
					<p>Loading form...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="ts-form ts-create-post voxel-fse-error">
				<div className="error-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
					<p>Error loading form: {error}</p>
				</div>
			</div>
		);
	}

	// No fields configured
	if (fieldsConfig.length === 0) {
		return (
			<div className="ts-form ts-create-post voxel-fse-empty">
				<div className="empty-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
					<p>No fields configured for this post type.</p>
				</div>
			</div>
		);
	}

	return (
		<CreatePostForm
			attributes={attributes}
			fieldsConfig={fieldsConfig}
			context="frontend"
			postId={postId}
			postStatus={postStatus}
			isAdminMode={isAdminMetabox}
		/>
	);
}

/**
 * Initialize create post forms on the page (matching search-form pattern)
 */
function initCreatePostForms() {
	console.log('[Create Post DEBUG] initCreatePostForms called');

	// Find all create post blocks by the class
	const containers = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-create-post-frontend:not([data-react-mounted])'
	);
	console.log('[Create Post DEBUG] Found containers:', containers.length);

	// Also log what other voxel containers exist on page
	const allTsForms = document.querySelectorAll('.ts-form');
	console.log('[Create Post DEBUG] All .ts-form elements:', allTsForms.length);
	allTsForms.forEach((el, i) => {
		console.log(`[Create Post DEBUG] .ts-form[${i}] classes:`, el.className);
	});

	containers.forEach((container, index) => {
		console.log(`[Create Post DEBUG] Processing container ${index}:`, container.className);

		// Mark as mounted immediately to prevent double-mounting
		container.setAttribute('data-react-mounted', 'true');

		// Parse attributes from vxconfig (matching search-form pattern - Plan C+)
		// parseVxConfig builds full CreatePostAttributes object with fallback to data attributes
		const attributes = parseVxConfig(container);
		console.log(`[Create Post DEBUG] Container ${index} attributes:`, attributes);

		// Check if this is admin metabox context from data attribute
		const isAdminMetabox = container.dataset.adminMode === '1';
		console.log(`[Create Post DEBUG] Container ${index} isAdminMetabox:`, isAdminMetabox);

		// Clear placeholder content and create React root
		container.innerHTML = '';

		const root = createRoot(container);
		console.log(`[Create Post DEBUG] Rendering FrontendWrapper for container ${index}`);
		root.render(
			<FrontendWrapper
				attributes={attributes}
				isAdminMetabox={isAdminMetabox}
			/>
		);
	});
}

// DEBUG: Script loaded
console.log('[Create Post DEBUG] frontend.tsx script LOADED');
console.log('[Create Post DEBUG] document.readyState:', document.readyState);
console.log('[Create Post DEBUG] window.wp available:', typeof window.wp !== 'undefined');
console.log('[Create Post DEBUG] window.wp.element available:', typeof window.wp?.element !== 'undefined');
console.log('[Create Post DEBUG] window.voxelFseCreatePost:', window.voxelFseCreatePost);

// Initialize on DOM ready
if (document.readyState === 'loading') {
	console.log('[Create Post DEBUG] Adding DOMContentLoaded listener');
	document.addEventListener('DOMContentLoaded', initCreatePostForms);
} else {
	console.log('[Create Post DEBUG] DOM already ready, calling initCreatePostForms immediately');
	initCreatePostForms();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initCreatePostForms);
window.addEventListener('pjax:complete', initCreatePostForms);
