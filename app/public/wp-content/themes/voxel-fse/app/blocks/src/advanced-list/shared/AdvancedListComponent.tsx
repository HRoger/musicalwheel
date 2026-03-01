/**
 * Advanced List Block - Shared Component
 *
 * Renders the Advanced List (Actions VX) widget HTML structure.
 * Used by both editor (edit.tsx) and frontend (frontend.tsx).
 *
 * HTML structure matches Voxel's advanced-list.php exactly:
 * <ul class="flexify simplify-ul ts-advanced-list">
 *   <li class="elementor-repeater-item-{id} flexify ts-action" data-tooltip="...">
 *     <div class="ts-action-con">
 *       <div class="ts-action-icon">{icon}</div>
 *       {text}
 *     </div>
 *   </li>
 * </ul>
 *
 * @package VoxelFSE
 */

import { useMemo, useCallback, useState, useRef } from 'react';
import { FormPopup } from '@shared/popup-kit/FormPopup';
import { InlineSvg } from '@shared/InlineSvg';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import type {
	AdvancedListAttributes,
	AdvancedListComponentProps,
	ActionItem,
	IconValue,
	PostContext,
	VxConfig,
} from '../types';
import { POST_DEPENDENT_ACTIONS, ACTIVE_STATE_ACTIONS } from '../types';
import { useResolvedDynamicTexts, useResolvedDynamicIcon } from '../../../shared/utils/useResolvedDynamicText';

/**
 * Share configuration from Voxel's share.js
 * Based on themes/voxel/assets/dist/js/share.js
 */
interface ShareItem {
	type: string;
	label: string;
	icon: string;
	link: string;
}

const DEFAULT_SHARE_LIST: Omit<ShareItem, 'link'>[] = [
	{ type: 'facebook', label: 'Facebook', icon: '<i class="fab fa-facebook"></i>' },
	{ type: 'twitter', label: 'Twitter', icon: '<i class="fab fa-twitter"></i>' },
	{ type: 'linkedin', label: 'LinkedIn', icon: '<i class="fab fa-linkedin"></i>' },
	{ type: 'pinterest', label: 'Pinterest', icon: '<i class="fab fa-pinterest"></i>' },
	{ type: 'whatsapp', label: 'WhatsApp', icon: '<i class="fab fa-whatsapp"></i>' },
	{ type: 'email', label: 'Email', icon: '<i class="las la-envelope"></i>' },
	{ type: 'copy', label: 'Copy link', icon: '<i class="las la-link"></i>' },
];

/**
 * Generate share URLs for social platforms
 */
function getShareLink(type: string, title: string, url: string): string {
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);

	switch (type) {
		case 'facebook':
			return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
		case 'twitter':
			return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
		case 'linkedin':
			return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
		case 'pinterest':
			return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
		case 'whatsapp':
			return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
		case 'email':
			return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
		case 'copy':
			return '#';
		default:
			return '#';
	}
}

/**
 * Generate Google Calendar URL
 * Matches Voxel's \Voxel\Utils\Sharer::get_google_calendar_link()
 * See: themes/voxel/app/utils/sharer.php:161-189
 */
function getGoogleCalendarUrl(args: {
	start: string;
	end?: string;
	title: string;
	description?: string;
	location?: string;
	timezone?: string;
}): string | null {
	const startDate = args.start ? new Date(args.start) : null;
	if (!startDate || isNaN(startDate.getTime())) {
		return null;
	}

	let endDate = args.end ? new Date(args.end) : null;
	if (!endDate || isNaN(endDate.getTime()) || endDate < startDate) {
		endDate = startDate;
	}

	// Format: YYYYMMDDTHHMMSS
	const formatDate = (d: Date): string => {
		return d.toISOString().replace(/[-:]/g, '').split('.')[0];
	};

	const params = new URLSearchParams({
		action: 'TEMPLATE',
		trp: 'true',
		text: args.title || '',
		dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
	});

	if (args.description) {
		// Strip HTML tags like Voxel's wp_kses($args['description'], [])
		const plainDescription = args.description.replace(/<[^>]*>/g, '');
		params.set('details', plainDescription);
	}
	if (args.location) {
		params.set('location', args.location);
	}
	if (args.timezone) {
		params.set('ctz', args.timezone);
	}

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate iCalendar (ICS) data URL
 * Matches Voxel's \Voxel\Utils\Sharer::get_icalendar_data()
 * See: themes/voxel/app/utils/sharer.php:191-243
 */
function getICalendarDataUrl(args: {
	start: string;
	end?: string;
	title: string;
	description?: string;
	location?: string;
	url?: string;
}): { dataUrl: string; filename: string } | null {
	const startDate = args.start ? new Date(args.start) : null;
	if (!startDate || isNaN(startDate.getTime())) {
		return null;
	}

	let endDate = args.end ? new Date(args.end) : null;
	if (!endDate || isNaN(endDate.getTime()) || endDate < startDate) {
		endDate = startDate;
	}

	// Format: YYYYMMDDTHHMMSS
	const formatDate = (d: Date): string => {
		return d.toISOString().replace(/[-:]/g, '').split('.')[0];
	};

	const start = formatDate(startDate);
	const end = formatDate(endDate);
	const title = (args.title || 'event').replace(/[^\w\s-]/g, '');
	const description = (args.description || '')
		.replace(/<[^>]*>/g, '') // Strip HTML
		.replace(/\r\n|\r|\n/g, '\\n') // Convert newlines
		.replace(/&nbsp;/g, '');
	const location = (args.location || '').replace(/[^\w\s,-]/g, '');
	const url = args.url || '';
	const dtstamp = formatDate(new Date());
	const uid = `${window.location.origin}/?ics_uid=${btoa(JSON.stringify([title, start, end, url])).slice(0, 20)}`;

	// Build ICS content (no leading whitespace per line - ICS format requirement)
	const icsContent = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//hacksw/handcal//NONSGML v1.0//EN',
		'CALSCALE:GREGORIAN',
		'BEGIN:VEVENT',
		`LOCATION:${location}`,
		`DESCRIPTION:${description}`,
		`DTSTART:${start}`,
		`DTEND:${end}`,
		`SUMMARY:${title}`,
		`URL;VALUE=URI:${url}`,
		`DTSTAMP:${dtstamp}`,
		`UID:${uid}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n');

	// Create base64 data URL (matches Voxel's base64_encode approach)
	const dataUrl = `data:text/calendar;base64,${btoa(icsContent)}`;
	const filename = `${title || 'event'}.ics`;

	return { dataUrl, filename };
}

/**
 * Edit Steps Popup Component
 * Uses shared FormPopup for correct FSE editor positioning.
 * Matches edit-post-action.php:16-50 structure.
 *
 * The popup header (hide-d) is rendered inside children, NOT via FormPopup's
 * showHeader prop, because Voxel's edit-post popup header uses hide-d class
 * (hidden on desktop, shown on mobile) — FormPopup's built-in header has
 * different behavior.
 */
interface EditStepsPopupProps {
	editSteps: Array<{ key: string; label: string; link: string }>;
	icon: IconValue | null;
	resolvedIconUrl?: string | null;
	onClose: () => void;
	isOpen: boolean;
	target: HTMLElement | null;
}

function EditStepsPopup({ editSteps, icon, resolvedIconUrl, onClose, isOpen, target }: EditStepsPopupProps) {
	return (
		<FormPopup
			isOpen={isOpen}
			popupId="edit-steps-popup"
			target={target}
			showHeader={false}
			showFooter={false}
			onClose={onClose}
		>
			{/* edit-post-action.php:23-35 — hide-d: hidden on desktop, visible on mobile */}
			<div className="ts-popup-head ts-sticky-top flexify hide-d">
				<div className="ts-popup-name flexify">
					{renderIcon(icon, resolvedIconUrl)}
					<span>Edit</span>
				</div>
				<ul className="flexify simplify-ul">
					<li className="flexify ts-popup-close">
						<a
							role="button"
							href="#"
							className="ts-icon-btn"
							onClick={(e) => {
								e.preventDefault();
								onClose();
							}}
						>
							{/* FormPopup provides the close SVG; replicate it here for the mobile header */}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor" />
							</svg>
						</a>
					</li>
				</ul>
			</div>
			{/* edit-post-action.php:36-47 */}
			<div className="ts-term-dropdown ts-md-group">
				<ul className="simplify-ul ts-term-dropdown-list min-scroll">
					{editSteps.map((step) => (
						<li key={step.key}>
							<a href={step.link} className="flexify">
								<span>{step.label}</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		</FormPopup>
	);
}

/**
 * Share Popup Component
 * Uses shared FormPopup for correct FSE editor positioning.
 * Matches share-post-action.php:18-62 structure.
 */
interface SharePopupProps {
	title: string;
	link: string;
	icon: IconValue | null;
	resolvedIconUrl?: string | null;
	onClose: () => void;
	isOpen: boolean;
	target: HTMLElement | null;
}

function SharePopup({ title, link, icon, resolvedIconUrl, onClose, isOpen, target }: SharePopupProps) {
	const [copied, setCopied] = useState(false);

	const handleShare = async (item: ShareItem, e: React.MouseEvent) => {
		if (item.type === 'copy') {
			e.preventDefault();
			try {
				await navigator.clipboard.writeText(link);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (_err) {
				// Fallback for older browsers
				const textarea = document.createElement('textarea');
				textarea.value = link;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
			return;
		}
		// For social links, let them open normally
	};

	const shareList: ShareItem[] = DEFAULT_SHARE_LIST.map((item) => ({
		...item,
		link: getShareLink(item.type, title, link),
	}));

	return (
		<FormPopup
			isOpen={isOpen}
			popupId="share-post-popup"
			target={target}
			showHeader={false}
			showFooter={false}
			onClose={onClose}
		>
			{/* share-post-action.php:21-33 — hide-d: hidden on desktop, visible on mobile */}
			<div className="ts-popup-head ts-sticky-top flexify hide-d">
				<div className="ts-popup-name flexify">
					{renderIcon(icon, resolvedIconUrl)}
					<span>Share post</span>
				</div>
				<ul className="flexify simplify-ul">
					<li className="flexify ts-popup-close">
						<a
							role="button"
							href="#"
							className="ts-icon-btn"
							onClick={(e) => {
								e.preventDefault();
								onClose();
							}}
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor" />
							</svg>
						</a>
					</li>
				</ul>
			</div>
			{/* share-post-action.php:37-58 */}
			<div className="ts-term-dropdown ts-md-group">
				<ul className="simplify-ul ts-term-dropdown-list min-scroll ts-social-share">
					{shareList.map((item) => (
						item.type === 'ui-heading' ? (
							/* ui-heading dividers (share-post-action.php:40-46) */
							<li key={`heading-${item.label}`} className="ts-parent-item vx-noevent">
								<a href="#" className="flexify">
									<span>{item.label}</span>
								</a>
							</li>
						) : (
							<li key={item.type} className={`ts-share-${item.type}`}>
								<a
									href={item.link}
									target={item.type !== 'copy' && item.type !== 'email' ? '_blank' : undefined}
									className="flexify"
									rel="nofollow"
									onClick={(e) => handleShare(item, e)}
								>
									<div className="ts-term-icon">
										<span dangerouslySetInnerHTML={{ __html: item.icon }} />
									</div>
									<span>{item.type === 'copy' && copied ? 'Copied!' : item.label}</span>
								</a>
							</li>
						)
					))}
				</ul>
			</div>
		</FormPopup>
	);
}

/**
 * Render icon from IconValue
 * Uses InlineSvg for SVG URLs (matching navbar/userbar pattern)
 * so CSS fill/color variables work correctly.
 *
 * @param icon - The icon value
 * @param resolvedDynamicUrl - Pre-resolved URL for dynamic icons (from useResolvedDynamicIcon)
 */
function renderIcon(icon: IconValue | null, resolvedDynamicUrl?: string | null): React.ReactNode {
	if (!icon || !icon.value) {
		return null;
	}
	if (icon.library === 'svg') {
		return <InlineSvg url={icon.value} />;
	}
	// Dynamic icon: render the resolved URL as inline SVG
	if (icon.library === 'dynamic') {
		if (resolvedDynamicUrl) {
			return <InlineSvg url={resolvedDynamicUrl} />;
		}
		// Not yet resolved — render nothing (loading state)
		return null;
	}
	// Build the full CSS class for the icon.
	// When library is 'icon', value is already the full class (e.g. "las la-eye").
	// When library is a pack prefix (e.g. "las", "lar", "lab"), combine with value.
	const iconClass = icon.library && icon.library !== 'icon'
		? `${icon.library} ${icon.value}`
		: icon.value;
	return <i className={iconClass} aria-hidden="true" />;
}

/**
 * Build inline styles for list container
 */
function buildListStyles(attributes: AdvancedListAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	if (attributes.enableCssGrid) {
		styles.display = 'grid';
		if (attributes.gridColumns) {
			styles.gridTemplateColumns = `repeat(${attributes.gridColumns}, minmax(auto, 1fr))`;
		}
	} else {
		if (attributes.listJustify) {
			styles.justifyContent = attributes.listJustify;
		}
	}

	if (attributes.itemGap) {
		styles.gap = `${attributes.itemGap}${attributes.itemGapUnit || 'px'}`;
	}

	return styles;
}

// Note: Item styles (height, justify-content, padding, border, colors, etc.) are ALL
// handled by the CSS style generator in styles.ts via scoped <style> tags. No inline
// styles needed on .ts-action-con. This ensures responsive breakpoints work properly.

/**
 * Build inline styles for icon container
 */
function buildIconStyles(attributes: AdvancedListAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	if (attributes.iconContainerSize) {
		const size = `${attributes.iconContainerSize}${attributes.iconContainerSizeUnit || 'px'}`;
		styles.width = size;
		styles.height = size;
	}

	if (attributes.iconContainerBackground) {
		styles.background = attributes.iconContainerBackground;
	}

	if (attributes.iconContainerBorderRadius) {
		styles.borderRadius = `${attributes.iconContainerBorderRadius}${attributes.iconContainerBorderRadiusUnit || 'px'}`;
	}

	// Icon size
	if (attributes.iconSize) {
		(styles as Record<string, string>)['--ts-icon-size'] = `${attributes.iconSize}${attributes.iconSizeUnit || 'px'}`;
	}

	// Icon color
	if (attributes.iconColor) {
		(styles as Record<string, string>)['--ts-icon-color'] = attributes.iconColor;
	}

	return styles;
}

/**
 * Build custom item width style
 */
function buildItemWidthStyle(attributes: AdvancedListAttributes): React.CSSProperties {
	if (!attributes.enableCssGrid && attributes.itemWidth === 'custom' && attributes.customItemWidth) {
		return {
			width: `${attributes.customItemWidth}${attributes.customItemWidthUnit || 'px'}`,
		};
	}
	return {};
}

/**
 * Action Item Component
 */
interface ActionItemProps {
	item: ActionItem;
	index: number;
	attributes: AdvancedListAttributes;
	context: 'editor' | 'frontend';
	postContext?: PostContext | null;
	templateContext?: string;
	templatePostType?: string;
}

function ActionItemComponent({ item, index, attributes, context, postContext, templateContext, templatePostType }: ActionItemProps) {
	// State for popups
	const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
	const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
	const targetRef = useRef<HTMLAnchorElement>(null);
	const isPostDependent = POST_DEPENDENT_ACTIONS.includes(item.actionType);
	const hasActiveState = ACTIVE_STATE_ACTIONS.includes(item.actionType);

	// Resolve dynamic tags for editor preview
	// Collects all text fields that might contain @tags()...@endtags() and resolves them in parallel
	const resolveOpts = useMemo(() => ({ templateContext, templatePostType }), [templateContext, templatePostType]);
	const dynamicTexts = useMemo(() => ({
		text: item.text || '',
		activeText: item.activeText || '',
		tooltipText: item.tooltipText || '',
		activeTooltipText: item.activeTooltipText || '',
		cartOptsText: item.cartOptsText || '',
		cartOptsTooltipText: item.cartOptsTooltipText || '',
		calTitle: item.calTitle || '',
		calDescription: item.calDescription || '',
		calLocation: item.calLocation || '',
		calUrl: item.calUrl || '',
	}), [item.text, item.activeText, item.tooltipText, item.activeTooltipText,
		item.cartOptsText, item.cartOptsTooltipText, item.calTitle, item.calDescription,
		item.calLocation, item.calUrl]);
	const resolved = useResolvedDynamicTexts(
		context === 'editor' ? dynamicTexts : {},
		resolveOpts,
	);
	// Use resolved values in editor, raw values on frontend (PHP handles resolution)
	// When the API resolves to empty (no post context in template editor),
	// fall back to showing the raw VoxelScript expression as a dimmed preview.
	const txt = useMemo(() => {
		if (context !== 'editor') return dynamicTexts;
		const result = { ...resolved };
		const rawTexts = dynamicTexts as Record<string, string>;
		for (const key of Object.keys(result)) {
			const raw = rawTexts[key] || '';
			if (!result[key] && raw.includes('@tags()')) {
				// Strip @tags()/@endtags() wrapper and show the raw expression
				result[key] = raw.replace(/@tags\(\)/g, '').replace(/@endtags\(\)/g, '').trim();
			}
		}
		return result;
	}, [context, resolved, dynamicTexts]);

	// Resolve dynamic icon tags for editor preview
	// Each icon field (icon, activeIcon, cartOptsIcon) can have library: 'dynamic'
	// with a @tags() wrapped VoxelScript expression that needs two-step resolution
	const iconDynamicValue = context === 'editor' && item.icon?.library === 'dynamic'
		? item.icon.value : undefined;
	const activeIconDynamicValue = context === 'editor' && item.activeIcon?.library === 'dynamic'
		? item.activeIcon.value : undefined;
	const cartOptsIconDynamicValue = context === 'editor' && item.cartOptsIcon?.library === 'dynamic'
		? item.cartOptsIcon.value : undefined;

	const resolvedIcon = useResolvedDynamicIcon(iconDynamicValue, resolveOpts);
	const resolvedActiveIcon = useResolvedDynamicIcon(activeIconDynamicValue, resolveOpts);
	const resolvedCartOptsIcon = useResolvedDynamicIcon(cartOptsIconDynamicValue, resolveOpts);

	// Determine if action should be rendered based on context and per-item visibility
	//
	// VISIBILITY ARCHITECTURE:
	// - Editor: Always show all items (matches Voxel Elementor repeater-control.php
	//   _voxel_should_render() which returns true in edit mode).
	// - Frontend: render.php filters items via Visibility_Evaluator before React
	//   hydrates. Items that fail are removed from vxconfig JSON.
	const shouldRender = useMemo(() => {
		// Editor always shows all items (1:1 Voxel Elementor parity)
		if (context === 'editor') {
			return true;
		}

		// Frontend: items with failing visibility rules were already removed by
		// render.php. If the item is still in vxconfig, it passed evaluation.
		// Only check simple rowVisibility toggle (no rules = direct toggle).
		const hasVisibilityRules = item.visibilityRules && item.visibilityRules.length > 0;
		if (!hasVisibilityRules && item.rowVisibility === 'hide') {
			return false;
		}

		// For post-dependent actions in frontend, check if we have post context
		if (isPostDependent && !postContext) {
			return false;
		}

		// edit_post requires editability (frontend only)
		if (item.actionType === 'edit_post' && postContext && !postContext.isEditable) {
			return false;
		}

		return true;
	}, [context, isPostDependent, postContext, item.actionType, item.rowVisibility, item.visibilityRules]);

	// Check visibility based on permissions
	// (Replaces PHP early returns in each action template)
	// Runs in BOTH editor and frontend when postContext is available.
	// In editor: postContext comes from useEditorPostContext (preview post).
	// In frontend: postContext comes from fetchPostContext (current post).
	const canRender = useMemo(() => {
		if (!shouldRender) return false;

		// When postContext is not yet loaded, show all items (loading state)
		if (!postContext) {
			// In editor without postContext, show non-post-dependent actions
			// but hide post-dependent ones that have no context to evaluate
			if (context === 'editor' && isPostDependent) return true;
			return true;
		}

		// delete-post-action.php:3 - is_deletable_by_current_user()
		if (item.actionType === 'delete_post') {
			return postContext.permissions?.delete ?? false;
		}

		// publish-post-action.php - requires editable + unpublished status
		if (item.actionType === 'publish_post') {
			return (postContext.permissions?.publish ?? false) && postContext.status === 'unpublished';
		}

		// unpublish-post-action.php - requires editable + publish status
		if (item.actionType === 'unpublish_post') {
			return (postContext.permissions?.publish ?? false) && postContext.status === 'publish';
		}

		// add-to-cart-action.php:16-20 - requires valid product
		if (item.actionType === 'add_to_cart') {
			return postContext.product?.isEnabled ?? false;
		}

		// show-post-on-map.php:7-11 - requires location with lat/lng
		if (item.actionType === 'show_post_on_map') {
			return postContext.location?.mapLink != null;
		}

		// view-post-stats-action.php:3-8 - requires editable + tracking enabled
		if (item.actionType === 'view_post_stats') {
			return postContext.postStatsLink != null;
		}

		// promote-post-action.php:6-9 - requires is_promotable_by_user()
		if (item.actionType === 'promote_post') {
			return postContext.promote?.isPromotable ?? false;
		}

		// follow-post-action.php:6-8, follow-user-action.php:6-8 - requires timeline enabled
		if (['action_follow_post', 'action_follow'].includes(item.actionType)) {
			if (postContext.timelineEnabled === false) return false;
		}

		// follow-user-action.php:10-12 - requires author exists
		if (item.actionType === 'action_follow') {
			return postContext.authorId != null;
		}

		return true;
	}, [context, shouldRender, isPostDependent, item.actionType, postContext]);

	// Build icon styles (per-item customIconColor requires inline styles)
	const iconStyles = buildIconStyles(attributes);
	const itemWidthStyle = buildItemWidthStyle(attributes);

	// Custom icon color override
	if (item.customStyle && item.customIconColor) {
		(iconStyles as Record<string, string>)['--ts-icon-color'] = item.customIconColor;
	}

	// Get tooltip data (use resolved text in editor)
	const tooltipText = item.enableTooltip ? txt.tooltipText : undefined;

	// Determine active state for follow/save actions (follow-post-action.php:21, promote-post-action.php:12)
	const isActive = useMemo(() => {
		if (!hasActiveState || !postContext) {
			return false;
		}

		if (item.actionType === 'action_follow_post') {
			return postContext.isFollowed;
		}

		if (item.actionType === 'action_follow') {
			return postContext.isAuthorFollowed;
		}

		if (item.actionType === 'promote_post') {
			return postContext.promote?.isActive ?? false;
		}

		return false;
	}, [hasActiveState, postContext, item.actionType]);

	// Determine intermediate state for pending follow requests (follow-post-action.php:22, follow-user-action.php:14)
	const isIntermediate = useMemo(() => {
		if (!postContext) return false;

		if (item.actionType === 'action_follow_post') {
			return postContext.isFollowRequested;
		}

		if (item.actionType === 'action_follow') {
			return postContext.isAuthorFollowRequested;
		}

		return false;
	}, [postContext, item.actionType]);

	// Helper to construct Voxel Action URLs
	const getVoxelActionUrl = (actionName: string, args: Record<string, string | number> = {}) => {
		if (!postContext) return '#';
		const params = new URLSearchParams();
		params.set('vx', '1');
		params.set('action', actionName);
		Object.entries(args).forEach(([k, v]) => params.set(k, String(v)));

		// Add nonce if available
		const nonceMap: Record<string, string> = {
			'user.posts.delete_post': postContext.nonces?.delete_post || '',
			'user.posts.republish_post': postContext.nonces?.modify_post || '',
			'user.posts.unpublish_post': postContext.nonces?.modify_post || '',
			'user.follow_post': postContext.nonces?.follow || '',
			'user.follow_user': postContext.nonces?.follow || '',
		};

		if (nonceMap[actionName]) {
			params.set('_wpnonce', nonceMap[actionName]);
		}

		return `${window.wpApiSettings?.root || '/'}?${params.toString()}`;
	};

	// Build action link/behavior
	const getActionProps = useCallback(() => {
		if (!postContext && context === 'frontend' && isPostDependent) {
			return { tag: 'div' };
		}

		switch (item.actionType) {
			case 'action_link':
				return {
					tag: 'a',
					href: item.link?.url || '#',
					target: item.link?.isExternal ? '_blank' : undefined,
					rel: item.link?.nofollow ? 'nofollow' : undefined,
					// Prevent navigation in editor (Elementor preview also blocks link clicks)
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'delete_post':
				// delete-post-action.php:8-18 - Uses data-confirm attribute for Voxel AJAX
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.posts.delete_post', { post_id: postContext.postId }),
					className: 'ts-action-con',
					'vx-action': '', // Voxel directive (empty string = boolean attr)
					rel: 'nofollow',
					'data-confirm': postContext.confirmMessages?.delete || 'Are you sure?',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'publish_post':
				// publish-post-action.php - Uses vx-action for Voxel AJAX
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.posts.republish_post', { post_id: postContext.postId }),
					className: 'ts-action-con',
					'vx-action': '',
					rel: 'nofollow',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'unpublish_post':
				// unpublish-post-action.php - Uses vx-action for Voxel AJAX
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.posts.unpublish_post', { post_id: postContext.postId }),
					className: 'ts-action-con',
					'vx-action': '',
					rel: 'nofollow',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'add_to_cart':
				if (!postContext) return { tag: 'div' };
				if (postContext.product?.oneClick) {
					return {
						tag: 'a',
						href: '#',
						target: '_blank',
						rel: 'nofollow',
						'data-product-id': postContext.product.productId,
						onClick: (e: React.MouseEvent) => {
							// Call global Voxel handler if available
							// @ts-ignore
							if (typeof window.Voxel !== 'undefined' && window.Voxel.addToCartAction) {
								// @ts-ignore
								window.Voxel.addToCartAction(e, e.currentTarget);
							}
						}
					};
				}
				// Select options variant (add-to-cart-action.php:33-43) — links to post with cart opts icon/text
				return {
					tag: 'a',
					href: postContext.postLink,
					className: 'ts-action-con',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'select_addition':
				return {
					tag: 'a',
					href: '#',
					role: 'button',
					className: 'ts-action-con ts-use-addition', // Voxel JS likely binds to this class
					'data-id': item.additionId,
					onClick: (e: React.MouseEvent) => {
						// Prevent default jump, let Voxel JS handle it
						e.preventDefault();
					}
				};

			case 'action_follow_post':
				// follow-post-action.php:32-47 - Uses ts-action-follow class with active/intermediate states
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.follow_post', { post_id: postContext.postId }),
					rel: 'nofollow',
					role: 'button',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'action_follow':
				// follow-user-action.php:24-41 - Follow post author
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.follow_user', { user_id: postContext.authorId || 0 }),
					rel: 'nofollow',
					role: 'button',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};

			case 'show_post_on_map':
				// show-post-on-map.php:24-29 - Links to archive with location filter
				if (postContext?.location?.mapLink) {
					return {
						tag: 'a',
						href: postContext.location.mapLink,
						rel: 'nofollow',
						className: 'ts-action-con ts-action-show-on-map',
						'data-post-id': postContext.postId,
						...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
					};
				}
				return { tag: 'div' };

			case 'view_post_stats':
				// view-post-stats-action.php:11-16 - Links to post stats page
				if (postContext?.postStatsLink) {
					return {
						tag: 'a',
						href: postContext.postStatsLink,
						rel: 'nofollow',
						...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
					};
				}
				return { tag: 'div' };

			case 'promote_post':
				// promote-post-action.php:12-40 - Promote or view active promotion
				if (postContext?.promote?.isPromotable) {
					const editorBlock = context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {};
					if (postContext.promote.isActive && postContext.promote.orderLink) {
						return {
							tag: 'a',
							href: postContext.promote.orderLink,
							rel: 'nofollow',
							...editorBlock,
						};
					} else if (postContext.promote.promoteLink) {
						return {
							tag: 'a',
							href: postContext.promote.promoteLink,
							rel: 'nofollow',
							role: 'button',
							...editorBlock,
						};
					}
				}
				return { tag: 'div' };

			case 'back_to_top':
				return {
					tag: 'a',
					href: '#',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						if (typeof window !== 'undefined') {
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					},
				};

			case 'go_back':
				return {
					tag: 'a',
					href: '#',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						if (context !== 'editor') {
							window.history.back();
						}
					},
				};

			case 'scroll_to_section':
				return {
					tag: 'a',
					href: '#',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						if (typeof window !== 'undefined' && item.scrollToId) {
							const element = document.getElementById(item.scrollToId);
							if (element) {
								element.scrollIntoView({ behavior: 'smooth' });
							}
						}
					},
				};

			case 'edit_post':
				// edit-post-action.php:16-56 - Multi-step popup or direct link
				if (postContext?.editLink) {
					// If multiple edit steps, show popup (edit-post-action.php:16-50)
					if (postContext.editSteps && postContext.editSteps.length > 1) {
						return {
							tag: 'a',
							href: '#',
							ref: targetRef,
							role: 'button',
							onClick: (e: React.MouseEvent) => {
								e.preventDefault();
								setIsEditPopupOpen(true);
							},
						};
					}
					// Single step - direct link (edit-post-action.php:51-55)
					return {
						tag: 'a',
						href: postContext.editLink,
						...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
					};
				}
				return { tag: 'div' };

			case 'share_post':
				// share-post-action.php:10-63 - Voxel share popup
				return {
					tag: 'a',
					href: '#',
					ref: targetRef,
					role: 'button',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						setIsSharePopupOpen(true);
					},
				};

			case 'action_gcal': {
				// add-to-gcal-action.php:7-23 - Google Calendar link
				// Uses \Voxel\Utils\Sharer::get_google_calendar_link()
				const gcalUrl = getGoogleCalendarUrl({
					start: item.calStartDate,
					end: item.calEndDate,
					title: item.calTitle,
					description: item.calDescription,
					location: item.calLocation,
					// Note: timezone would need to come from post context if available
				});
				if (!gcalUrl) {
					return { tag: 'div' };
				}
				return {
					tag: 'a',
					href: gcalUrl,
					target: '_blank',
					rel: 'nofollow',
					className: 'ts-action-con',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};
			}

			case 'action_ical': {
				// add-to-ical-action.php:6-24 - iCalendar download link
				// Uses \Voxel\Utils\Sharer::get_icalendar_data()
				const icalData = getICalendarDataUrl({
					start: item.calStartDate,
					end: item.calEndDate,
					title: item.calTitle,
					description: item.calDescription,
					location: item.calLocation,
					url: item.calUrl,
				});
				if (!icalData) {
					return { tag: 'div' };
				}
				return {
					tag: 'a',
					href: icalData.dataUrl,
					download: icalData.filename,
					role: 'button',
					rel: 'nofollow',
					className: 'ts-action-con',
					...(context === 'editor' ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {}),
				};
			}

			default:
				return { tag: 'div' };
		}
	}, [item, postContext, context, isPostDependent]);

	const actionProps = getActionProps();
	const Tag = actionProps.tag as keyof JSX.IntrinsicElements;

	// All hooks called above — safe to return null now
	if (!canRender) {
		return null;
	}

	// Cart "Select Options" variant (add-to-cart-action.php:33-43):
	// Uses cartOptsIcon/cartOptsText instead of normal icon/text
	const isCartSelectOptions = item.actionType === 'add_to_cart' && postContext?.product && !postContext.product.oneClick;

	// Render content based on active state
	// Voxel ALWAYS renders both .ts-initial and .ts-reveal spans for active-state actions
	// (follow-post-action.php:33-40, follow-user-action.php:33-40, select-addon.php:15-20)
	// CSS handles visibility via .active class on parent — no inline display:none needed
	const renderContent = () => {
		if (hasActiveState) {
			return (
				<>
					<span className="ts-initial">
						<div className="ts-action-icon" style={iconStyles}>
							{renderIcon(item.icon, resolvedIcon.url)}
						</div>
						{txt.text}
					</span>
					<span className="ts-reveal">
						<div className="ts-action-icon" style={iconStyles}>
							{renderIcon(item.activeIcon, resolvedActiveIcon.url)}
						</div>
						{txt.activeText}
					</span>
				</>
			);
		}

		// Cart "Select Options" variant uses different icon/text (add-to-cart-action.php:39-41)
		const displayIcon = isCartSelectOptions ? (item.cartOptsIcon || item.icon) : item.icon;
		const displayText = isCartSelectOptions ? txt.cartOptsText : txt.text;
		// Pick the matching resolved URL for the displayed icon
		const displayResolvedUrl = isCartSelectOptions
			? (resolvedCartOptsIcon.url || resolvedIcon.url)
			: resolvedIcon.url;

		return (
			<>
				<div className="ts-action-icon" style={iconStyles}>
					{renderIcon(displayIcon, displayResolvedUrl)}
				</div>
				{displayText}
			</>
		);
	};

	// Build CSS classes
	const itemClasses = [
		`vxfse-repeater-item-${item.id || index}`,
		'flexify',
		'ts-action',
	].join(' ');

	// Merge action classes with existing props className
	// Includes intermediate class for pending follow requests (follow-post-action.php:40, follow-user-action.php:31)
	const actionClasses = [
		(actionProps as any).className || 'ts-action-con',
		// Add ts-action-follow for follow actions
		['action_follow_post', 'action_follow'].includes(item.actionType) ? 'ts-action-follow' : '',
		isActive ? 'active' : '',
		isIntermediate ? 'intermediate' : '',
	].filter(Boolean).join(' ');

	// Tooltip attributes
	// Different actions use different tooltip attribute patterns:
	// - Follow actions (follow-post-action.php:25-30): tooltip-inactive, tooltip-active
	// - Select addition (select-addon.php:6-12): data-tooltip, data-tooltip-default, data-tooltip-active
	// - Other actions: data-tooltip
	const isFollowAction = ['action_follow_post', 'action_follow'].includes(item.actionType);
	const isSelectAddition = item.actionType === 'select_addition';
	const tooltipAttrs: Record<string, string | undefined> = {};

	if (isFollowAction) {
		// Use tooltip-inactive for normal state and tooltip-active for active state
		if (item.enableTooltip && txt.tooltipText) {
			tooltipAttrs['tooltip-inactive'] = txt.tooltipText;
		}
		if (item.activeEnableTooltip && txt.activeTooltipText) {
			tooltipAttrs['tooltip-active'] = txt.activeTooltipText;
		}
	} else if (isSelectAddition) {
		// select-addon.php:6-12 - Uses data-tooltip + data-tooltip-default for normal, data-tooltip-active for active
		if (item.enableTooltip && txt.tooltipText) {
			tooltipAttrs['data-tooltip'] = txt.tooltipText;
			tooltipAttrs['data-tooltip-default'] = txt.tooltipText;
		}
		if (item.activeEnableTooltip && txt.activeTooltipText) {
			tooltipAttrs['data-tooltip-active'] = txt.activeTooltipText;
		}
	} else if (isCartSelectOptions) {
		// Cart select options variant (add-to-cart-action.php:35-36) uses its own tooltip
		if (item.cartOptsEnableTooltip && txt.cartOptsTooltipText) {
			tooltipAttrs['data-tooltip'] = txt.cartOptsTooltipText;
		}
	} else {
		// Regular data-tooltip for non-follow actions
		if (tooltipText) {
			tooltipAttrs['data-tooltip'] = tooltipText;
		}
	}

	// Wrapper for items that need popups (edit_post, share_post)
	const isEditAction = item.actionType === 'edit_post' && postContext?.editSteps && postContext.editSteps.length > 1;
	const isShareAction = item.actionType === 'share_post';
	const needsWrapper = isEditAction || isShareAction;

	const TagEl = Tag as any;
	if (needsWrapper) {
		// Wrapper class varies by action type (edit-post-action.php:17, share-post-action.php:10)
		const wrapperClass = isShareAction
			? 'ts-action-wrap ts-share-post'
			: 'ts-action-wrap ts-popup-component';

		return (
			<li
				className={itemClasses}
				style={itemWidthStyle}
				{...tooltipAttrs}
			>
				<div className={wrapperClass}>
					<TagEl
						{...actionProps}
						className={actionClasses}
						aria-label={txt.text || tooltipText}
						role={Tag === 'a' ? undefined : 'button'}
					>
						{renderContent()}
					</TagEl>
					{/* Edit steps popup (edit-post-action.php:22-49) */}
					{isEditAction && postContext && (
						<EditStepsPopup
							editSteps={postContext.editSteps}
							icon={item.icon}
							resolvedIconUrl={resolvedIcon.url}
							isOpen={isEditPopupOpen}
							onClose={() => setIsEditPopupOpen(false)}
							target={targetRef.current}
						/>
					)}
					{/* Share popup (share-post-action.php:18-62) */}
					{isShareAction && postContext && (
						<SharePopup
							title={postContext.postTitle}
							link={postContext.postLink}
							icon={item.icon}
							resolvedIconUrl={resolvedIcon.url}
							isOpen={isSharePopupOpen}
							onClose={() => setIsSharePopupOpen(false)}
							target={targetRef.current}
						/>
					)}
				</div>
			</li>
		);
	}

	return (
		<li
			className={itemClasses}
			style={itemWidthStyle}
			{...tooltipAttrs}
		>
			<TagEl
				{...actionProps}
				className={actionClasses}
				aria-label={txt.text || tooltipText}
				role={Tag === 'a' ? undefined : 'button'}
			>
				{renderContent()}
			</TagEl>
		</li>
	);
}

/**
 * Main Shared Component
 */
export function AdvancedListComponent({
	attributes,
	context,
	postContext,
	templateContext,
	templatePostType,
}: AdvancedListComponentProps) {
	const listStyles = buildListStyles(attributes);

	// Build vxconfig for re-rendering (Plan C+ pattern)
	const vxConfig: VxConfig = useMemo(() => ({
		items: attributes.items,
		icons: {
			closeIcon: attributes.closeIcon?.value ? attributes.closeIcon : null,
			messageIcon: attributes.messageIcon?.value ? attributes.messageIcon : null,
			linkIcon: attributes.linkIcon?.value ? attributes.linkIcon : null,
			shareIcon: attributes.shareIcon?.value ? attributes.shareIcon : null,
		},
		list: {
			enableCssGrid: attributes.enableCssGrid,
			gridColumns: attributes.gridColumns,
			itemWidth: attributes.itemWidth,
			customItemWidth: attributes.customItemWidth,
			customItemWidthUnit: attributes.customItemWidthUnit,
			listJustify: attributes.listJustify,
			itemGap: attributes.itemGap,
			itemGapUnit: attributes.itemGapUnit,
		},
		itemStyle: {
			justifyContent: attributes.itemJustifyContent,
			padding: attributes.itemPadding,
			paddingUnit: attributes.itemPaddingUnit,
			height: attributes.itemHeight,
			heightUnit: attributes.itemHeightUnit,
			borderType: attributes.itemBorderType,
			borderWidth: attributes.itemBorderWidth,
			borderWidthUnit: attributes.itemBorderWidthUnit,
			borderColor: attributes.itemBorderColor,
			borderRadius: attributes.itemBorderRadius,
			borderRadiusUnit: attributes.itemBorderRadiusUnit,
			boxShadow: attributes.itemBoxShadow,
			typography: attributes.itemTypography,
			textColor: attributes.itemTextColor,
			backgroundColor: attributes.itemBackgroundColor,
		},
		iconContainer: {
			background: attributes.iconContainerBackground,
			size: attributes.iconContainerSize,
			sizeUnit: attributes.iconContainerSizeUnit,
			borderType: attributes.iconContainerBorderType,
			borderWidth: attributes.iconContainerBorderWidth,
			borderWidthUnit: attributes.iconContainerBorderWidthUnit,
			borderColor: attributes.iconContainerBorderColor,
			borderRadius: attributes.iconContainerBorderRadius,
			borderRadiusUnit: attributes.iconContainerBorderRadiusUnit,
			boxShadow: attributes.iconContainerBoxShadow,
			textSpacing: attributes.iconTextSpacing,
			textSpacingUnit: attributes.iconTextSpacingUnit,
		},
		icon: {
			onTop: attributes.iconOnTop,
			size: attributes.iconSize,
			sizeUnit: attributes.iconSizeUnit,
			color: attributes.iconColor,
		},
		hoverStyle: {
			boxShadow: attributes.itemBoxShadowHover,
			borderColor: attributes.itemBorderColorHover,
			textColor: attributes.itemTextColorHover,
			backgroundColor: attributes.itemBackgroundColorHover,
			iconContainerBackground: attributes.iconContainerBackgroundHover,
			iconContainerBorderColor: attributes.iconContainerBorderColorHover,
			iconColor: attributes.iconColorHover,
		},
		activeStyle: {
			boxShadow: attributes.itemBoxShadowActive,
			textColor: attributes.itemTextColorActive,
			backgroundColor: attributes.itemBackgroundColorActive,
			borderColor: attributes.itemBorderColorActive,
			iconContainerBackground: attributes.iconContainerBackgroundActive,
			iconContainerBorderColor: attributes.iconContainerBorderColorActive,
			iconColor: attributes.iconColorActive,
		},
		tooltip: {
			bottom: attributes.tooltipBottom,
			textColor: attributes.tooltipTextColor,
			typography: attributes.tooltipTypography,
			backgroundColor: attributes.tooltipBackgroundColor,
			borderRadius: attributes.tooltipBorderRadius,
			borderRadiusUnit: attributes.tooltipBorderRadiusUnit,
		},
	}), [attributes]);

	// Empty state
	if (!attributes.items || attributes.items.length === 0) {
		if (context === 'frontend') {
			// Frontend: render directly into the outer <ul> container (no wrapper)
			return null;
		}
		return (
			<ul className="flexify simplify-ul ts-advanced-list voxel-fse-empty">
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<li className="flexify ts-action">
					<EmptyPlaceholder />
				</li>
			</ul>
		);
	}

	// Frontend context: render items directly into the outer <ul> container.
	// The outer <ul> already has WordPress block classes + Voxel classes (flexify,
	// simplify-ul, ts-advanced-list) and list layout styles (gap, grid, justify-content)
	// applied by frontend.tsx. Wrapping in another <ul> would create invalid nested
	// <ul><ul> and break the layout. Voxel parent uses a single flat <ul>.
	if (context === 'frontend') {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility (Plan C+ requirement) */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{attributes.items.map((item, index) => (
					<ActionItemComponent
						key={item.id || index}
						item={item}
						index={index}
						attributes={attributes}
						context={context}
						postContext={postContext}
						templateContext={templateContext}
						templatePostType={templatePostType}
					/>
				))}
			</>
		);
	}

	return (
		<ul className="flexify simplify-ul ts-advanced-list" style={listStyles}>
			{/* Re-render vxconfig for DevTools visibility (Plan C+ requirement) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{attributes.items.map((item, index) => (
				<ActionItemComponent
					key={item.id || index}
					item={item}
					index={index}
					attributes={attributes}
					context={context}
					postContext={postContext}
					templateContext={templateContext}
					templatePostType={templatePostType}
				/>
			))}
		</ul>
	);
}

export default AdvancedListComponent;
