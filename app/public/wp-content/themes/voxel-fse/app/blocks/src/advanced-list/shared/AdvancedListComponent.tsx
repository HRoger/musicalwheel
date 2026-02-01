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

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import type {
	AdvancedListAttributes,
	AdvancedListComponentProps,
	ActionItem,
	IconValue,
	PostContext,
	VxConfig,
} from '../types';
import { POST_DEPENDENT_ACTIONS, ACTIVE_STATE_ACTIONS } from '../types';

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
 * Edit Steps Popup Component
 * Matches edit-post-action.php:16-50 structure
 */
interface EditStepsPopupProps {
	editSteps: Array<{ key: string; label: string; link: string }>;
	icon: IconValue | null;
	text: string;
	closeIcon: IconValue;
	onClose: () => void;
	isOpen: boolean;
	targetRef: React.RefObject<HTMLElement>;
}

function EditStepsPopup({ editSteps, icon, text, closeIcon, onClose, isOpen, targetRef }: EditStepsPopupProps) {
	const popupRef = useRef<HTMLDivElement>(null);

	// Close popup on outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(e.target as Node) &&
				targetRef.current &&
				!targetRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, onClose, targetRef]);

	if (!isOpen) return null;

	return (
		<div ref={popupRef} className="ts-popup ts-popup--edit-steps">
			<div className="ts-popup-head ts-sticky-top flexify hide-d">
				<div className="ts-popup-name flexify">
					{renderIcon(icon)}
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
							{renderIcon(closeIcon)}
						</a>
					</li>
				</ul>
			</div>
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
		</div>
	);
}

/**
 * Share Popup Component
 * Matches share-post-action.php:18-62 structure
 */
interface SharePopupProps {
	title: string;
	link: string;
	icon: IconValue | null;
	closeIcon: IconValue;
	onClose: () => void;
	isOpen: boolean;
	targetRef: React.RefObject<HTMLElement>;
}

function SharePopup({ title, link, icon, closeIcon, onClose, isOpen, targetRef }: SharePopupProps) {
	const popupRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);

	// Close popup on outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(e.target as Node) &&
				targetRef.current &&
				!targetRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, onClose, targetRef]);

	const handleShare = async (item: ShareItem, e: React.MouseEvent) => {
		if (item.type === 'copy') {
			e.preventDefault();
			try {
				await navigator.clipboard.writeText(link);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
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

	if (!isOpen) return null;

	const shareList: ShareItem[] = DEFAULT_SHARE_LIST.map((item) => ({
		...item,
		link: getShareLink(item.type, title, link),
	}));

	return (
		<div ref={popupRef} className="ts-popup ts-popup--share">
			<div className="ts-popup-head ts-sticky-top flexify hide-d">
				<div className="ts-popup-name flexify">
					{renderIcon(icon)}
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
							{renderIcon(closeIcon)}
						</a>
					</li>
				</ul>
			</div>
			<div className="ts-term-dropdown ts-md-group">
				<ul className="simplify-ul ts-term-dropdown-list min-scroll ts-social-share">
					{shareList.map((item) => (
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
					))}
				</ul>
			</div>
		</div>
	);
}

/**
 * Render icon from IconValue
 */
function renderIcon(icon: IconValue | null): React.ReactNode {
	if (!icon || !icon.value) {
		return null;
	}

	// Handle SVG icons (inline SVG)
	if (icon.library === 'svg' || icon.value.startsWith('<svg')) {
		return <span dangerouslySetInnerHTML={{ __html: icon.value }} />;
	}

	// Handle Font Awesome icons
	if (icon.library === 'fa-solid' || icon.library === 'fa-regular' || icon.library === 'fa-brands') {
		return <i className={icon.value} />;
	}

	// Handle icon class names
	if (icon.value) {
		return <i className={icon.value} />;
	}

	return null;
}

/**
 * Build inline styles for list container
 */
function buildListStyles(attributes: AdvancedListAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	if (attributes.enableCssGrid) {
		styles.display = 'grid';
		if (attributes.gridColumns) {
			styles.gridTemplateColumns = `repeat(${attributes.gridColumns}, minmax(0, 1fr))`;
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

/**
 * Build inline styles for action item
 */
function buildItemStyles(attributes: AdvancedListAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	if (attributes.itemJustifyContent) {
		styles.justifyContent = attributes.itemJustifyContent;
	}

	if (attributes.itemHeight) {
		styles.height = `${attributes.itemHeight}${attributes.itemHeightUnit || 'px'}`;
	}

	// Padding
	const padding = attributes.itemPadding;
	if (padding && (padding.top || padding.right || padding.bottom || padding.left)) {
		const unit = attributes.itemPaddingUnit || 'px';
		styles.padding = `${padding.top || 0}${unit} ${padding.right || 0}${unit} ${padding.bottom || 0}${unit} ${padding.left || 0}${unit}`;
	}

	// Border
	if (attributes.itemBorderType && attributes.itemBorderType !== 'none') {
		styles.borderStyle = attributes.itemBorderType;
		if (attributes.itemBorderColor) {
			styles.borderColor = attributes.itemBorderColor;
		}
		const borderWidth = attributes.itemBorderWidth;
		if (borderWidth) {
			const unit = attributes.itemBorderWidthUnit || 'px';
			styles.borderWidth = `${borderWidth.top || 1}${unit} ${borderWidth.right || 1}${unit} ${borderWidth.bottom || 1}${unit} ${borderWidth.left || 1}${unit}`;
		}
	}

	if (attributes.itemBorderRadius) {
		styles.borderRadius = `${attributes.itemBorderRadius}${attributes.itemBorderRadiusUnit || 'px'}`;
	}

	// Colors
	if (attributes.itemTextColor) {
		styles.color = attributes.itemTextColor;
	}

	if (attributes.itemBackgroundColor) {
		styles.background = attributes.itemBackgroundColor;
	}

	// Box shadow
	const boxShadow = attributes.itemBoxShadow;
	if (boxShadow && (boxShadow.horizontal || boxShadow.vertical || boxShadow.blur || boxShadow.spread)) {
		styles.boxShadow = `${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${boxShadow.color || 'rgba(0,0,0,0.1)'}`;
	}

	// Icon/text spacing
	if (attributes.iconTextSpacing) {
		styles.gap = `${attributes.iconTextSpacing}${attributes.iconTextSpacingUnit || 'px'}`;
	}

	// Icon on top
	if (attributes.iconOnTop) {
		styles.flexDirection = 'column';
	}

	return styles;
}

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
}

function ActionItemComponent({ item, index, attributes, context, postContext }: ActionItemProps) {
	// State for popups
	const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
	const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
	const targetRef = useRef<HTMLAnchorElement>(null);
	const isPostDependent = POST_DEPENDENT_ACTIONS.includes(item.actionType);
	const hasActiveState = ACTIVE_STATE_ACTIONS.includes(item.actionType);

	// Determine if action should be rendered based on context and per-item visibility
	// 
	// ARCHITECTURE NOTE:
	// Per-item visibility rules (rowVisibility, visibilityRules) are evaluated here.
	// However, full Voxel visibility rule evaluation requires server-side context
	// (post data, user data, etc.). For client-side:
	// - rowVisibility='hide' with empty rules = always hide
	// - rowVisibility='show' with empty rules = always show
	// - Rules with conditions require server-side evaluation or dedicated API
	// 
	// For headless (Next.js), the raw visibility data is in vxconfig for custom evaluation.
	const shouldRender = useMemo(() => {
		// In editor, always show all items for preview
		if (context === 'editor') {
			return true;
		}

		// Per-item rowVisibility: Basic client-side evaluation
		// (Full rule evaluation requires server-side Voxel context)
		const hasVisibilityRules = item.visibilityRules && item.visibilityRules.length > 0;

		if (!hasVisibilityRules) {
			// No rules configured - rowVisibility is the simple toggle
			// 'hide' with no rules = always hide (unusual but supported)
			if (item.rowVisibility === 'hide') {
				return false;
			}
		}
		// Note: When rules ARE present, they would need server-side evaluation
		// For now, we default to showing (frontend can't evaluate dynamic rules)
		// TODO: Implement rule evaluation API for client-side consumption

		// For post-dependent actions in frontend, check if we have post context
		if (isPostDependent && !postContext) {
			return false;
		}

		// edit_post requires editability
		if (item.actionType === 'edit_post' && postContext && !postContext.isEditable) {
			return false;
		}

		return true;
	}, [context, isPostDependent, postContext, item.actionType, item.rowVisibility, item.visibilityRules]);

	// Check visibility based on permissions
	// (Replaces PHP early returns in each action template)
	const canRender = useMemo(() => {
		if (context === 'editor') return true;
		if (!shouldRender) return false;

		// delete-post-action.php:3 - is_deletable_by_current_user()
		if (item.actionType === 'delete_post') {
			return postContext?.permissions?.delete ?? false;
		}

		// publish-post-action.php - requires editable + unpublished status
		if (item.actionType === 'publish_post') {
			return (postContext?.permissions?.publish ?? false) && postContext?.status === 'unpublished';
		}

		// unpublish-post-action.php - requires editable + publish status
		if (item.actionType === 'unpublish_post') {
			return (postContext?.permissions?.publish ?? false) && postContext?.status === 'publish';
		}

		// add-to-cart-action.php:16-20 - requires valid product
		if (item.actionType === 'add_to_cart') {
			return postContext?.product?.isEnabled ?? false;
		}

		// show-post-on-map.php:7-11 - requires location with lat/lng
		if (item.actionType === 'show_post_on_map') {
			return postContext?.location?.mapLink != null;
		}

		// view-post-stats-action.php:3-8 - requires editable + tracking enabled
		if (item.actionType === 'view_post_stats') {
			return postContext?.postStatsLink != null;
		}

		// promote-post-action.php:6-9 - requires is_promotable_by_user()
		if (item.actionType === 'promote_post') {
			return postContext?.promote?.isPromotable ?? false;
		}

		// follow-user-action.php:10-12 - requires author exists
		if (item.actionType === 'action_follow') {
			return postContext?.authorId != null;
		}

		return true;
	}, [context, shouldRender, item.actionType, postContext]);

	if (!canRender) {
		return null;
	}

	// Build item styles
	const itemStyles = buildItemStyles(attributes);
	const iconStyles = buildIconStyles(attributes);
	const itemWidthStyle = buildItemWidthStyle(attributes);

	// Custom icon color override
	if (item.customStyle && item.customIconColor) {
		(iconStyles as Record<string, string>)['--ts-icon-color'] = item.customIconColor;
	}

	// Get tooltip data
	const tooltipText = item.enableTooltip ? item.tooltipText : undefined;

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
				// Default to linking to the post
				return {
					tag: 'a',
					href: postContext.postLink,
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
				};

			case 'action_follow':
				// follow-user-action.php:24-41 - Follow post author
				if (!postContext) return { tag: 'div' };
				return {
					tag: 'a',
					href: getVoxelActionUrl('user.follow_user', { user_id: postContext.authorId || 0 }),
					rel: 'nofollow',
					role: 'button',
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
					};
				}
				return { tag: 'div' };

			case 'promote_post':
				// promote-post-action.php:12-40 - Promote or view active promotion
				if (postContext?.promote?.isPromotable) {
					if (postContext.promote.isActive && postContext.promote.orderLink) {
						return {
							tag: 'a',
							href: postContext.promote.orderLink,
							rel: 'nofollow',
						};
					} else if (postContext.promote.promoteLink) {
						return {
							tag: 'a',
							href: postContext.promote.promoteLink,
							rel: 'nofollow',
							role: 'button',
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
					href: 'javascript:history.back();',
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

			default:
				return { tag: 'div' };
		}
	}, [item, postContext, context, isPostDependent]);

	const actionProps = getActionProps();
	const Tag = actionProps.tag as keyof JSX.IntrinsicElements;

	// Render content based on active state
	const renderContent = () => {
		if (hasActiveState && isActive && item.activeText) {
			// Active state content
			return (
				<>
					<span className="ts-initial" style={{ display: 'none' }}>
						<div className="ts-action-icon" style={iconStyles}>
							{renderIcon(item.icon)}
						</div>
						{item.text}
					</span>
					<span className="ts-reveal">
						<div className="ts-action-icon" style={iconStyles}>
							{renderIcon(item.activeIcon)}
						</div>
						{item.activeText}
					</span>
				</>
			);
		}

		// Normal state content
		return (
			<>
				<div className="ts-action-icon" style={iconStyles}>
					{renderIcon(item.icon)}
				</div>
				{item.text}
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

	// Tooltip attributes (follow-post-action.php:25-30)
	// For follow actions, use tooltip-inactive and tooltip-active attributes
	// For other actions, use data-tooltip
	const isFollowAction = ['action_follow_post', 'action_follow'].includes(item.actionType);
	const tooltipAttrs: Record<string, string | undefined> = {};

	if (isFollowAction) {
		// Use tooltip-inactive for normal state and tooltip-active for active state
		if (item.enableTooltip && item.tooltipText) {
			tooltipAttrs['tooltip-inactive'] = item.tooltipText;
		}
		if (item.activeEnableTooltip && item.activeTooltipText) {
			tooltipAttrs['tooltip-active'] = item.activeTooltipText;
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
					<Tag
						{...actionProps}
						className={actionClasses}
						style={itemStyles}
						aria-label={item.text || tooltipText}
						role={Tag === 'a' ? undefined : 'button'}
					>
						{renderContent()}
					</Tag>
					{/* Edit steps popup (edit-post-action.php:22-49) */}
					{isEditAction && postContext && (
						<EditStepsPopup
							editSteps={postContext.editSteps}
							icon={item.icon}
							text={item.text}
							closeIcon={attributes.closeIcon}
							isOpen={isEditPopupOpen}
							onClose={() => setIsEditPopupOpen(false)}
							targetRef={targetRef as React.RefObject<HTMLElement>}
						/>
					)}
					{/* Share popup (share-post-action.php:18-62) */}
					{isShareAction && postContext && (
						<SharePopup
							title={postContext.postTitle}
							link={postContext.postLink}
							icon={item.icon}
							closeIcon={attributes.closeIcon}
							isOpen={isSharePopupOpen}
							onClose={() => setIsSharePopupOpen(false)}
							targetRef={targetRef as React.RefObject<HTMLElement>}
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
			<Tag
				{...actionProps}
				className={actionClasses}
				style={itemStyles}
				aria-label={item.text || tooltipText}
				role={Tag === 'a' ? undefined : 'button'}
			>
				{renderContent()}
			</Tag>
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
		return (
			<ul className="flexify simplify-ul ts-advanced-list voxel-fse-empty">
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<li className="flexify ts-action">
					<div
						className="ts-action-con"
						style={{
							padding: '16px 24px',
							color: '#666',
							background: '#f5f5f5',
							borderRadius: '8px',
						}}
					>
						{context === 'editor'
							? 'Click "+ Add Item" in the sidebar to add actions'
							: 'No actions configured'}
					</div>
				</li>
			</ul>
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
				/>
			))}
		</ul>
	);
}

export default AdvancedListComponent;
