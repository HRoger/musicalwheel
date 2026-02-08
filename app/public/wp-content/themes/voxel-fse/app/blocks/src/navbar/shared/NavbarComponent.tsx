/**
 * Navbar Block - Shared Component
 *
 * Used by both edit.tsx (editor) and frontend.tsx (frontend hydration).
 * Matches Voxel's navbar.php template HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/templates/widgets/navbar.php
 * - Walker: themes/voxel/app/utils/nav-menu-walker.php
 * - CSS classes: ts-nav-menu, ts-nav, ts-item-link, ts-item-icon, etc.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { FormPopup } from '@shared';
import { getIconWithFallback as getIconWithFallbackBase, type IconValue } from '@shared/utils';
import type {
	NavbarAttributes,
	NavbarMenuApiResponse,
	NavbarMenuItem,
	NavbarVxConfig,
	LinkedTabData,
	LinkedPostTypeData,
} from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';

interface NavbarComponentProps {
	attributes: NavbarAttributes;
	menuData: NavbarMenuApiResponse | null;
	mobileMenuData: NavbarMenuApiResponse | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
	// Linked block data for template_tabs and search_form sources
	linkedTabs?: LinkedTabData[];
	linkedPostTypes?: LinkedPostTypeData[];
	linkedBlockId?: string;
}

/**
 * Default icons - used when no custom icon is selected
 * Exported for potential reuse in sub-components
 */
export const NAVBAR_ICON_DEFAULTS: Record<string, IconValue> = {
	hamburger: { library: 'line-awesome', value: 'las la-bars' },
	close: { library: 'line-awesome', value: 'las la-times' },
};

/**
 * Get icon with fallback to default
 * Uses shared utility for consistent pattern across all blocks
 */
export function getIconWithFallback(
	icon: IconValue | null | undefined,
	fallbackKey: string
): IconValue {
	return getIconWithFallbackBase(icon ?? undefined, NAVBAR_ICON_DEFAULTS[fallbackKey] || { library: '', value: '' });
}

/**
 * Render icon markup
 */
function renderIcon(icon: { library: string; value: string } | null): JSX.Element | null {
	if (!icon || !icon.value) return null;

	if (icon.library === 'svg') {
		return <img src={icon.value} alt="" className="ts-svg-icon" />;
	}

	// Icon library (Line Awesome, etc.)
	return <i className={icon.value} aria-hidden="true" />;
}

/**
 * Menu Item Component - recursive for submenus
 */
interface MenuItemProps {
	item: NavbarMenuItem;
	depth: number;
	attributes: NavbarAttributes;
	onSubmenuToggle?: (itemId: number, isOpen: boolean) => void;
}

function MenuItem({ item, depth, attributes, onSubmenuToggle }: MenuItemProps) {
	const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
	const itemRef = useRef<HTMLLIElement>(null);
	const triggerRef = useRef<HTMLAnchorElement | null>(null);

	// Build class list for menu item
	const itemClasses = [
		'menu-item',
		`menu-item-${item.id}`,
		...item.classes,
		item.isCurrent ? 'current-menu-item' : '',
		item.hasChildren && depth === 0 ? 'ts-popup-component ts-trigger-on-hover' : '',
	]
		.filter(Boolean)
		.join(' ');

	// Handle click for items with children
	const handleItemClick = useCallback(
		(e: React.MouseEvent) => {
			if (item.hasChildren) {
				e.preventDefault();
				setIsSubmenuOpen(!isSubmenuOpen);
				onSubmenuToggle?.(item.id, !isSubmenuOpen);
			}
		},
		[item.hasChildren, item.id, isSubmenuOpen, onSubmenuToggle]
	);

	// Close submenu when clicking outside
	useEffect(() => {
		if (!isSubmenuOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
				setIsSubmenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isSubmenuOpen]);

	// Render link content
	const linkContent = (
		<>
			{depth === 0 && (
				<div className="ts-item-icon flexify">
					{item.icon ? <span dangerouslySetInnerHTML={{ __html: item.icon }} /> : null}
				</div>
			)}
			{depth > 0 && item.icon && (
				<div className="ts-term-icon">
					<span dangerouslySetInnerHTML={{ __html: item.icon }} />
				</div>
			)}
			<span>{item.title}</span>
			{item.hasChildren && <div className={depth === 0 ? 'ts-down-icon' : 'ts-right-icon'} />}
		</>
	);

	return (
		<li ref={itemRef} className={itemClasses}>
			<a
				ref={triggerRef}
				href={item.url}
				target={item.target || undefined}
				rel={item.rel || undefined} // Voxel walker lines 118-122: noopener for _blank, or xfn
				title={item.attrTitle || undefined} // Voxel walker line 116: tooltip
				aria-current={item.isCurrent ? 'page' : undefined} // Voxel walker line 124: accessibility
				className={depth === 0 ? 'ts-item-link' : 'flexify'}
				onClick={handleItemClick}
			>
				{linkContent}
			</a>

			{/* Submenu popup for top-level items with children (vx-popup portal via FormPopup) */}
			{item.hasChildren && depth === 0 && (
				<FormPopup
					isOpen={isSubmenuOpen}
					popupId={`navbar-submenu-${item.id}`}
					target={triggerRef.current}
					title=""
					icon=""
					showHeader={false}
					showFooter={false}
					clearButton={false}
					onClose={() => {
						setIsSubmenuOpen(false);
						onSubmenuToggle?.(item.id, false);
					}}
				>
					<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
						<ul className="simplify-ul ts-term-dropdown-list sub-menu">
							{/* Parent item link */}
							<li className="ts-parent-menu">
								<a
									href={item.url}
									rel={item.rel || undefined}
									title={item.attrTitle || undefined}
									className="flexify"
								>
									{item.icon && <span dangerouslySetInnerHTML={{ __html: item.icon }} />}
									<span>{item.title}</span>
								</a>
							</li>
							{/* Child items */}
							{item.children.map((child) => (
								<MenuItem key={child.id} item={child} depth={depth + 1} attributes={attributes} />
							))}
						</ul>
					</div>
				</FormPopup>
			)}
		</li>
	);
}

/**
 * Mobile Menu Component - hamburger trigger and popup
 */
interface MobileMenuProps {
	attributes: NavbarAttributes;
	menuData: NavbarMenuApiResponse | null;
}

function MobileMenu({ attributes, menuData }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeScreen, setActiveScreen] = useState('main');
	const [, setSlideFrom] = useState<'left' | 'right'>('right');
	const menuRef = useRef<HTMLLIElement>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	// Close menu when clicking outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	// Handle submenu navigation
	const handleSubmenuNav = useCallback((targetScreen: string, direction: 'left' | 'right') => {
		setSlideFrom(direction);
		setActiveScreen(targetScreen);
	}, []);

	return (
		<li ref={menuRef} className="ts-popup-component ts-mobile-menu">
			<button
				ref={triggerRef}
				type="button"
				className="ts-item-link"
				onClick={() => setIsOpen(!isOpen)}
				aria-haspopup="true"
				aria-expanded={isOpen}
				aria-label={attributes.hamburgerTitle || 'Menu'}
			>
				<div className="ts-item-icon flexify">{renderIcon(getIconWithFallback(attributes.hamburgerIcon, 'hamburger'))}</div>
				{attributes.showMenuLabel && <span>{attributes.hamburgerTitle}</span>}
			</button>

			{/* Mobile menu popup - rendered as vx-popup via FormPopup for 1:1 Voxel match */}
			<FormPopup
				isOpen={isOpen}
				popupId="navbar-mobile-menu"
				target={triggerRef.current}
				title={attributes.hamburgerTitle || ''}
				icon=""
				showHeader={true}
				showFooter={false}
				clearButton={false}
				onClose={() => setIsOpen(false)}
			>
				{/* Popup header (mobile only) */}
				<div className="ts-popup-head flexify hide-d">
					<div className="ts-popup-name flexify">
						{renderIcon(getIconWithFallback(attributes.hamburgerIcon, 'hamburger'))}
						<span>{attributes.hamburgerTitle}</span>
					</div>
					<ul className="flexify simplify-ul">
						<li className="flexify ts-popup-close">
							<button type="button" onClick={() => setIsOpen(false)} className="ts-icon-btn">
								{renderIcon(getIconWithFallback(attributes.closeIcon, 'close'))}
							</button>
						</li>
					</ul>
				</div>

				{/* Menu items */}
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					<ul className="simplify-ul ts-term-dropdown-list">
						{menuData?.items.map((item) => (
							<MobileMenuItem
								key={item.id}
								item={item}
								attributes={attributes}
								activeScreen={activeScreen}
								onNavigate={handleSubmenuNav}
							/>
						))}
					</ul>
				</div>
			</FormPopup>
		</li>
	);
}

/**
 * Mobile Menu Item - handles multi-level navigation
 */
interface MobileMenuItemProps {
	item: NavbarMenuItem;
	attributes: NavbarAttributes;
	activeScreen: string;
	onNavigate: (screen: string, direction: 'left' | 'right') => void;
}

function MobileMenuItem({ item, attributes: _attributes, activeScreen: _activeScreen, onNavigate }: MobileMenuItemProps) {
	const screenId = `submenu-${item.id}`;

	return (
		<li className={`menu-item ${item.isCurrent ? 'current-menu-item' : ''}`}>
			<a
				href={item.hasChildren ? '#' : item.url}
				target={item.hasChildren ? undefined : item.target || undefined}
				rel={item.hasChildren ? undefined : item.rel || undefined} // Voxel walker lines 118-122
				title={item.attrTitle || undefined} // Voxel walker line 116
				aria-current={item.isCurrent ? 'page' : undefined} // Voxel walker line 124
				className="flexify"
				onClick={(e) => {
					if (item.hasChildren) {
						e.preventDefault();
						onNavigate(screenId, 'right');
					}
				}}
			>
				{item.icon && (
					<div className="ts-term-icon">
						<span dangerouslySetInnerHTML={{ __html: item.icon }} />
					</div>
				)}
				<span>{item.title}</span>
				{item.hasChildren && <div className="ts-right-icon" />}
			</a>
		</li>
	);
}

/**
 * Main Navbar Component
 */
export default function NavbarComponent({
	attributes,
	menuData,
	mobileMenuData,
	isLoading,
	error,
	context: _context,
	linkedTabs,
	linkedPostTypes,
	linkedBlockId,
}: NavbarComponentProps) {
	// Build vxconfig for re-render (required for DevTools visibility)
	const vxConfig: NavbarVxConfig = {
		source: attributes.source,
		menuLocation: attributes.menuLocation,
		mobileMenuLocation: attributes.mobileMenuLocation,
		orientation: attributes.orientation,
		justify: attributes.justify,
		collapsible: attributes.collapsible,
		collapsedWidth: attributes.collapsedWidth,
		expandedWidth: attributes.expandedWidth,
		hamburgerTitle: attributes.hamburgerTitle,
		showBurgerDesktop: attributes.showBurgerDesktop,
		showBurgerTablet: attributes.showBurgerTablet,
		showMenuLabel: attributes.showMenuLabel,
		hamburgerIcon: attributes.hamburgerIcon,
		closeIcon: attributes.closeIcon,
		manualItems: attributes.manualItems,
		showIcon: attributes.showIcon,
		iconOnTop: attributes.iconOnTop,
		customPopupEnabled: attributes.customPopupEnabled,
		multiColumnMenu: attributes.multiColumnMenu,
		menuColumns: attributes.menuColumns,
	};

	// Build nav class list
	const navClasses = [
		'ts-nav',
		`ts-nav-${attributes.orientation}`,
		'flexify',
		'simplify-ul',
		attributes.orientation === 'horizontal' ? 'min-scroll min-scroll-h' : '',
		attributes.collapsible ? 'ts-nav-collapsed' : '',
	]
		.filter(Boolean)
		.join(' ');

	// Loading state
	if (isLoading) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// Render based on source
	if (attributes.source === 'add_links_manually') {
		// Manual links mode
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<nav className="ts-nav-menu ts-custom-links flexify">
					<ul className={navClasses}>
						{attributes.manualItems.map((item) => (
							<li key={item.id} className={`menu-item ${item.isActive ? 'current-menu-item' : ''}`}>
								<a
									href={item.url}
									target={item.isExternal ? '_blank' : undefined}
									rel={item.nofollow ? 'nofollow noopener' : undefined}
									className="ts-item-link"
								>
									<div className="ts-item-icon flexify">{renderIcon(item.icon)}</div>
									<span>{item.text}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			</>
		);
	}

	if (attributes.source === 'select_wp_menu') {
		// WordPress menu mode
		const effectiveMenuData = mobileMenuData || menuData;

		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<nav
					className={`ts-nav-menu ts-wp-menu ${attributes.collapsible ? 'ts-nav-collapsed' : ''}`}
				>
					<ul className={navClasses}>
						{/* Mobile menu trigger */}
						{(attributes.showBurgerDesktop || attributes.showBurgerTablet) && (
							<MobileMenu attributes={attributes} menuData={effectiveMenuData} />
						)}

						{/* Desktop menu items */}
						{menuData?.items.map((item) => (
							<MenuItem key={item.id} item={item} depth={0} attributes={attributes} />
						))}
					</ul>
				</nav>
			</>
		);
	}

	// Template tabs mode - render linked tabs or placeholder
	if (attributes.source === 'template_tabs') {
		// No linked tabs yet - show placeholder
		if (!linkedTabs || linkedTabs.length === 0) {
			return (
				<>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<nav className="ts-nav-menu ts-tab-triggers flexify">
						<ul className={navClasses}>
							<li className="menu-item">
								<span className="ts-item-link">
									<span>Template Tabs (link widget to use)</span>
								</span>
							</li>
						</ul>
					</nav>
				</>
			);
		}

		// Render linked tabs (1:1 with Voxel navbar.php lines 27-43)
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<nav className={`ts-nav-menu ts-tab-triggers ts-tab-triggers-${linkedBlockId || ''} flexify`}>
					<ul className={navClasses}>
						{linkedTabs.map((tab) => (
							<li
								key={tab.id}
								className={`menu-item ${tab.isActive ? 'current-menu-item' : ''}`}
								data-tab={tab.urlKey}
							>
								<a
									href={`#${tab.urlKey}`}
									className="ts-item-link"
									onClick={(e) => {
										e.preventDefault();
										// Dispatch event for linked tabs block to handle
										// Matches Voxel's Voxel.loadTab(event, id, urlKey)
										window.dispatchEvent(new CustomEvent('voxel-load-tab', {
											detail: {
												tabsId: linkedBlockId,
												urlKey: tab.urlKey,
											}
										}));
									}}
								>
									<div className="ts-item-icon flexify">
										{tab.icon && <span dangerouslySetInnerHTML={{ __html: tab.icon }} />}
									</div>
									<span>{tab.title}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			</>
		);
	}

	// Search form mode - render linked post types or placeholder
	if (attributes.source === 'search_form') {
		// No linked post types yet - show placeholder
		if (!linkedPostTypes || linkedPostTypes.length === 0) {
			return (
				<>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<nav className="ts-nav-menu ts-nav-sf flexify">
						<ul className={navClasses}>
							<li className="menu-item">
								<span className="ts-item-link">
									<span>Search Form (link widget to use)</span>
								</span>
							</li>
						</ul>
					</nav>
				</>
			);
		}

		// Render linked post types (1:1 with Voxel navbar.php lines 46-75)
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<nav className="ts-nav-menu ts-nav-sf flexify">
					<ul className={navClasses}>
						{linkedPostTypes.map((postType) => (
							<li
								key={postType.key}
								className={`menu-item ${postType.isActive ? 'current-menu-item' : ''}`}
								data-post-type={postType.key}
							>
								<a
									href="#"
									className="ts-item-link"
									onClick={(e) => {
										e.preventDefault();
										// Dispatch event for linked search form to handle post type switch
										window.dispatchEvent(new CustomEvent('voxel-switch-post-type', {
											detail: {
												searchFormId: linkedBlockId,
												postType: postType.key,
											}
										}));
									}}
								>
									<div className="ts-item-icon flexify">
										{postType.icon && <span dangerouslySetInnerHTML={{ __html: postType.icon }} />}
									</div>
									<span>{postType.label}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			</>
		);
	}

	// Fallback - no menu selected
	return (
		<>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			<nav className="ts-nav-menu ts-wp-menu flexify">
				<ul className={navClasses}>
					<li className="menu-item">
						<span className="ts-item-link">
							<span>Select a menu source</span>
						</span>
					</li>
				</ul>
			</nav>
		</>
	);
}
