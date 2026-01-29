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

import { useMemo, useCallback } from 'react';
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

	if (!shouldRender) {
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

	// Determine active state for follow/save actions
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

		return false;
	}, [hasActiveState, postContext, item.actionType]);

	// Build action link/behavior
	const getActionProps = useCallback(() => {
		switch (item.actionType) {
			case 'action_link':
				return {
					tag: 'a',
					href: item.link?.url || '#',
					target: item.link?.isExternal ? '_blank' : undefined,
					rel: item.link?.nofollow ? 'nofollow' : undefined,
				};

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
				if (postContext?.editLink) {
					return {
						tag: 'a',
						href: postContext.editLink,
					};
				}
				return { tag: 'div' };

			case 'share_post':
				// Share functionality would need popup implementation
				return {
					tag: 'a',
					href: '#',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						// TODO: Implement share popup
						if (typeof window !== 'undefined' && navigator.share && postContext) {
							navigator.share({
								title: postContext.postTitle,
								url: postContext.postLink,
							}).catch(() => {
								// Fallback to copy link
								navigator.clipboard?.writeText(postContext.postLink);
							});
						}
					},
				};

			case 'action_follow_post':
			case 'action_follow':
				// Follow functionality would need AJAX implementation
				return {
					tag: 'a',
					href: '#',
					onClick: (e: React.MouseEvent) => {
						e.preventDefault();
						// TODO: Implement follow AJAX
					},
				};

			default:
				return { tag: 'div' };
		}
	}, [item, postContext]);

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

	const actionClasses = [
		'ts-action-con',
		isActive ? 'active' : '',
	].filter(Boolean).join(' ');

	// Wrapper for items that need it
	const needsWrapper = ['edit_post', 'share_post'].includes(item.actionType);

	if (needsWrapper) {
		return (
			<li
				className={itemClasses}
				style={itemWidthStyle}
				data-tooltip={tooltipText}
			>
				<div className="ts-action-wrap">
					<Tag
						{...(Tag === 'a' ? { href: (actionProps as { href?: string }).href } : {})}
						{...(actionProps.onClick ? { onClick: actionProps.onClick } : {})}
						{...(Tag === 'a' && (actionProps as { target?: string }).target ? { target: (actionProps as { target?: string }).target } : {})}
						{...(Tag === 'a' && (actionProps as { rel?: string }).rel ? { rel: (actionProps as { rel?: string }).rel } : {})}
						className={actionClasses}
						style={itemStyles}
						aria-label={item.text || tooltipText}
						role={Tag === 'a' ? undefined : 'button'}
					>
						{renderContent()}
					</Tag>
				</div>
			</li>
		);
	}

	return (
		<li
			className={itemClasses}
			style={itemWidthStyle}
			data-tooltip={tooltipText}
		>
			<Tag
				{...(Tag === 'a' ? { href: (actionProps as { href?: string }).href } : {})}
				{...(actionProps.onClick ? { onClick: actionProps.onClick } : {})}
				{...(Tag === 'a' && (actionProps as { target?: string }).target ? { target: (actionProps as { target?: string }).target } : {})}
				{...(Tag === 'a' && (actionProps as { rel?: string }).rel ? { rel: (actionProps as { rel?: string }).rel } : {})}
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
