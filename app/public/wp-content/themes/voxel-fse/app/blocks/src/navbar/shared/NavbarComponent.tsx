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
import { InlineSvg } from '@shared/InlineSvg';

/**
 * Collect all submenu screens from a menu item tree.
 * Voxel uses screen-based navigation: each parent with children gets a screen
 * that shows/hides via v-show="screen === 'screenId'".
 *
 * Evidence: themes/voxel/app/utils/nav-menu-walker.php lines 30-90
 */
interface SubmenuScreen {
	id: string;
	parentScreenId: string;
	parentItem: NavbarMenuItem;
	children: NavbarMenuItem[];
}

function collectSubmenuScreens(
	items: NavbarMenuItem[],
	parentScreenId: string = 'main'
): SubmenuScreen[] {
	const screens: SubmenuScreen[] = [];
	for (const item of items) {
		if (item.hasChildren && item.children.length > 0) {
			const screenId = `submenu-${item.id}`;
			screens.push({
				id: screenId,
				parentScreenId,
				parentItem: item,
				children: item.children,
			});
			// Recurse into deeper levels
			screens.push(...collectSubmenuScreens(item.children, screenId));
		}
	}
	return screens;
}

/**
 * Hook for screen-based navigation with Voxel slide transitions.
 *
 * Voxel uses Vue <transition-group> with CSS classes:
 * - slide-from-right-enter-active / leave-active (transition running)
 * - slide-from-right-enter-from (start: translateX(100%))
 * - slide-from-left-enter-from / slide-from-right-leave-to (translateX(-100%))
 *
 * CSS source: themes/voxel/assets/dist/popup-kit.css
 * Grid layout: .ts-multilevel-dropdown { display: grid; grid-template-columns: 1fr }
 *              .ts-multilevel-dropdown ul { grid-row-start: 1; grid-column-start: 1 }
 *
 * This hook replicates Vue's transition lifecycle in React:
 * 1. Set entering screen to *-enter-from (off-screen position)
 * 2. Next frame: switch to *-enter-active (triggers CSS transition)
 * 3. After transition: remove classes
 */
function useScreenNav(initialScreen: string = 'main') {
	const [activeScreen, setActiveScreen] = useState(initialScreen);
	const [transitionClasses, setTransitionClasses] = useState<Record<string, string>>({});
	const prevScreenRef = useRef(initialScreen);

	const navigateTo = useCallback((targetScreen: string) => {
		const prevScreen = prevScreenRef.current;
		if (targetScreen === prevScreen) return;

		// Determine direction: navigating "deeper" = slide from right, "back" = slide from left
		const isGoingBack = targetScreen === 'main' || targetScreen.split('-').length < prevScreen.split('-').length;
		const direction = isGoingBack ? 'left' : 'right';

		// Step 1: Set initial positions (enter-from / leave classes)
		setTransitionClasses({
			[targetScreen]: `slide-from-${direction}-enter-from`,
			[prevScreen]: `slide-from-${direction}-leave-active`,
		});

		setActiveScreen(targetScreen);
		prevScreenRef.current = targetScreen;

		// Step 2: Next frame — trigger enter transition
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setTransitionClasses({
					[targetScreen]: `slide-from-${direction}-enter-active`,
					[prevScreen]: `slide-from-${direction}-leave-active slide-from-${direction}-leave-to`,
				});

				// Step 3: After transition completes, clean up
				setTimeout(() => {
					setTransitionClasses({});
				}, 350); // Slightly longer than .3s transition
			});
		});
	}, []);

	const reset = useCallback(() => {
		setActiveScreen(initialScreen);
		prevScreenRef.current = initialScreen;
		setTransitionClasses({});
	}, [initialScreen]);

	const getScreenStyle = useCallback((screenId: string): React.CSSProperties => {
		const isActive = screenId === activeScreen;
		const hasTransition = !!transitionClasses[screenId];

		if (hasTransition) {
			// During transition: show both screens (grid stacks them)
			return {};
		}
		if (!isActive) {
			return { display: 'none' };
		}
		return {};
	}, [activeScreen, transitionClasses]);

	const getScreenClassName = useCallback((screenId: string): string => {
		return transitionClasses[screenId] || '';
	}, [transitionClasses]);

	return { activeScreen, navigateTo, reset, getScreenStyle, getScreenClassName };
}

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
		return <InlineSvg url={icon.value} className="ts-svg-icon" />;
	}

	// Icon library (Line Awesome, etc.)
	return <i className={icon.value} aria-hidden="true" />;
}

/**
 * Menu Item Component - top-level items in the nav bar
 * Only depth=0 items use this component directly.
 * Submenus use screen-based multi-level navigation inside FormPopup.
 *
 * Evidence: themes/voxel/app/utils/nav-menu-walker.php lines 30-90
 */
interface MenuItemProps {
	item: NavbarMenuItem;
	attributes: NavbarAttributes;
	onSubmenuToggle?: (itemId: number, isOpen: boolean) => void;
	popupScopeClass?: string;
	context?: 'editor' | 'frontend';
}

function MenuItem({ item, attributes, onSubmenuToggle, popupScopeClass, context }: MenuItemProps) {
	const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
	const screenNav = useScreenNav('main');
	const itemRef = useRef<HTMLLIElement>(null);
	const triggerRef = useRef<HTMLAnchorElement | null>(null);

	// Build class list for menu item
	const itemClasses = [
		'menu-item',
		`menu-item-${item.id}`,
		...item.classes,
		item.isCurrent ? 'current-menu-item' : '',
		item.hasChildren ? 'ts-popup-component ts-trigger-on-hover' : '',
	]
		.filter(Boolean)
		.join(' ');

	// Handle click — prevent navigation in editor, toggle submenu for parents
	const handleItemClick = useCallback(
		(e: React.MouseEvent) => {
			if (context === 'editor') {
				e.preventDefault();
			}
			if (item.hasChildren) {
				e.preventDefault();
				const newState = !isSubmenuOpen;
				setIsSubmenuOpen(newState);
				if (newState) screenNav.reset(); // Reset to main screen on open
				onSubmenuToggle?.(item.id, newState);
			}
		},
		[context, item.hasChildren, item.id, isSubmenuOpen, onSubmenuToggle, screenNav]
	);

	// Close submenu when clicking outside
	// Editor-aware: respect portaled popups and sidebar clicks
	useEffect(() => {
		if (!isSubmenuOpen) return;

		const editorIframe = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');

		const handleClickOutside = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			if (itemRef.current && itemRef.current.contains(clickTarget)) {
				return;
			}

			// Click inside a portaled popup — don't close
			if (clickTarget.closest('.ts-field-popup') || clickTarget.closest('.ts-field-popup-container')) {
				return;
			}

			// In editor: don't close when clicking sidebar/toolbar
			if (editorIframe) {
				const gutenbergSelectors = [
					'.interface-interface-skeleton__sidebar',
					'.block-editor-block-inspector',
					'.components-popover',
					'.components-modal__screen-overlay',
					'.edit-post-sidebar',
					'.interface-interface-skeleton__header',
					'.interface-interface-skeleton__secondary-sidebar',
				];
				for (const selector of gutenbergSelectors) {
					if (clickTarget.closest(selector)) {
						return;
					}
				}
			}

			setIsSubmenuOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isSubmenuOpen]);

	// Collect all submenu screens for multi-level navigation
	const submenuScreens = item.hasChildren ? collectSubmenuScreens(item.children) : [];

	return (
		<li ref={itemRef} className={itemClasses}>
			<a
				ref={triggerRef}
				href={item.url}
				target={item.target || undefined}
				rel={item.rel || undefined}
				title={item.attrTitle || undefined}
				aria-current={item.isCurrent ? 'page' : undefined}
				className="ts-item-link"
				onClick={handleItemClick}
			>
				<div className="ts-item-icon flexify">
					{item.icon ? <span dangerouslySetInnerHTML={{ __html: item.icon }} /> : null}
				</div>
				<span>{item.title}</span>
				{item.hasChildren && <div className="ts-down-icon" />}
			</a>

			{/* Submenu popup with screen-based multi-level navigation */}
			{item.hasChildren && (
				<FormPopup
					isOpen={isSubmenuOpen}
					popupId={`navbar-submenu-${item.id}`}
					target={triggerRef.current}
					title=""
					icon=""
					showHeader={false}
					showFooter={false}
					clearButton={false}
					popupClass={popupScopeClass}
					onClose={() => {
						setIsSubmenuOpen(false);
						onSubmenuToggle?.(item.id, false);
					}}
				>
					<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
						{/* Main screen: direct children */}
						<ul
							className={`simplify-ul ts-term-dropdown-list sub-menu ${screenNav.getScreenClassName('main')}`}
							style={screenNav.getScreenStyle('main')}
						>
							{/* Parent item link */}
							<li className="ts-parent-menu">
								<a
									href={item.url}
									rel={item.rel || undefined}
									title={item.attrTitle || undefined}
									className="flexify"
									onClick={context === 'editor' ? (e: React.MouseEvent) => e.preventDefault() : undefined}
								>
									{item.icon && <span dangerouslySetInnerHTML={{ __html: item.icon }} />}
									<span>{item.title}</span>
								</a>
							</li>
							{/* Child items */}
							{item.children.map((child) => (
								<SubmenuItem
									key={child.id}
									item={child}
									context={context}
									onNavigate={(screenId) => screenNav.navigateTo(screenId)}
								/>
							))}
						</ul>

						{/* Nested submenu screens */}
						{submenuScreens.map((screen) => (
							<ul
								key={screen.id}
								className={`simplify-ul ts-term-dropdown-list sub-menu ${screenNav.getScreenClassName(screen.id)}`}
								style={screenNav.getScreenStyle(screen.id)}
							>
								{/* Go back button */}
								<li className="ts-term-centered">
									<a
										href="#"
										className="flexify"
										onClick={(e) => {
											e.preventDefault();
											screenNav.navigateTo(screen.parentScreenId);
										}}
									>
										<div className="ts-left-icon" />
										<span>Go back</span>
									</a>
								</li>
								{/* Parent item */}
								<li className="ts-parent-menu">
									<a
										href={screen.parentItem.url}
										className="flexify"
										onClick={context === 'editor' ? (e: React.MouseEvent) => e.preventDefault() : undefined}
									>
										{screen.parentItem.icon && <span dangerouslySetInnerHTML={{ __html: screen.parentItem.icon }} />}
										<span>{screen.parentItem.title}</span>
									</a>
								</li>
								{/* Children */}
								{screen.children.map((child) => (
									<SubmenuItem
										key={child.id}
										item={child}
										context={context}
										onNavigate={(screenId) => screenNav.navigateTo(screenId)}
									/>
								))}
							</ul>
						))}
					</div>
				</FormPopup>
			)}
		</li>
	);
}

/**
 * Submenu Item - rendered inside popup screens (both desktop and mobile)
 * Handles navigation to deeper levels when item has children.
 */
interface SubmenuItemProps {
	item: NavbarMenuItem;
	context?: 'editor' | 'frontend';
	onNavigate: (screenId: string) => void;
}

function SubmenuItem({ item, context, onNavigate }: SubmenuItemProps) {
	return (
		<li className={`menu-item menu-item-${item.id} ${item.isCurrent ? 'current-menu-item' : ''}`}>
			<a
				href={item.hasChildren ? '#' : item.url}
				target={item.hasChildren ? undefined : item.target || undefined}
				rel={item.hasChildren ? undefined : item.rel || undefined}
				title={item.attrTitle || undefined}
				aria-current={item.isCurrent ? 'page' : undefined}
				className="flexify"
				onClick={(e) => {
					if (context === 'editor') {
						e.preventDefault();
					}
					if (item.hasChildren) {
						e.preventDefault();
						onNavigate(`submenu-${item.id}`);
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
 * Mobile Menu Component - hamburger trigger and popup
 */
interface MobileMenuProps {
	attributes: NavbarAttributes;
	menuData: NavbarMenuApiResponse | null;
	popupScopeClass?: string;
}

function MobileMenu({ attributes, menuData, popupScopeClass }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const screenNav = useScreenNav('main');
	const menuRef = useRef<HTMLLIElement>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	// Close menu when clicking outside
	// Same editor-aware logic as MenuItem: respect portaled popups and sidebar clicks
	useEffect(() => {
		if (!isOpen) return;

		const editorIframe = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');

		const handleClickOutside = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			// Click inside the mobile menu container — don't close
			if (menuRef.current && menuRef.current.contains(clickTarget)) {
				return;
			}

			// Click inside a portaled popup (FormPopup renders outside menuRef) — don't close
			if (clickTarget.closest('.ts-field-popup') || clickTarget.closest('.ts-field-popup-container')) {
				return;
			}

			// In editor: don't close when clicking sidebar/toolbar
			if (editorIframe) {
				const gutenbergSelectors = [
					'.interface-interface-skeleton__sidebar',
					'.block-editor-block-inspector',
					'.components-popover',
					'.components-modal__screen-overlay',
					'.edit-post-sidebar',
					'.interface-interface-skeleton__header',
					'.interface-interface-skeleton__secondary-sidebar',
				];
				for (const selector of gutenbergSelectors) {
					if (clickTarget.closest(selector)) {
						return;
					}
				}
			}

			setIsOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	// Collect all submenu screens for mobile multi-level navigation
	const mobileSubmenuScreens = menuData?.items ? collectSubmenuScreens(menuData.items) : [];

	return (
		<li ref={menuRef} className="ts-popup-component ts-mobile-menu">
			<button
				ref={triggerRef}
				type="button"
				className="ts-item-link"
				onClick={() => {
					const newState = !isOpen;
					setIsOpen(newState);
					if (newState) screenNav.reset(); // Reset on open
				}}
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
				popupClass={popupScopeClass}
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

				{/* Screen-based multi-level navigation (matches Voxel's popup-menu-walker.php) */}
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					{/* Main screen: top-level items */}
					<ul
						className={`simplify-ul ts-term-dropdown-list ${screenNav.getScreenClassName('main')}`}
						style={screenNav.getScreenStyle('main')}
					>
						{menuData?.items.map((item) => (
							<SubmenuItem
								key={item.id}
								item={item}
								onNavigate={(screenId) => screenNav.navigateTo(screenId)}
							/>
						))}
					</ul>

					{/* Nested submenu screens */}
					{mobileSubmenuScreens.map((screen) => (
						<ul
							key={screen.id}
							className={`simplify-ul ts-term-dropdown-list sub-menu ${screenNav.getScreenClassName(screen.id)}`}
							style={screenNav.getScreenStyle(screen.id)}
						>
							{/* Go back button */}
							<li className="ts-term-centered">
								<a
									href="#"
									className="flexify"
									onClick={(e) => {
										e.preventDefault();
										screenNav.navigateTo(screen.parentScreenId);
									}}
								>
									<div className="ts-left-icon" />
									<span>Go back</span>
								</a>
							</li>
							{/* Parent item */}
							<li className="ts-parent-menu">
								<a href={screen.parentItem.url} className="flexify">
									{screen.parentItem.icon && <span dangerouslySetInnerHTML={{ __html: screen.parentItem.icon }} />}
									<span>{screen.parentItem.title}</span>
								</a>
							</li>
							{/* Children */}
							{screen.children.map((child) => (
								<SubmenuItem
									key={child.id}
									item={child}
									onNavigate={(screenId) => screenNav.navigateTo(screenId)}
								/>
							))}
						</ul>
					))}
				</div>
			</FormPopup>
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
	context,
	linkedTabs,
	linkedPostTypes,
	linkedBlockId,
}: NavbarComponentProps) {
	// Track active post type for search_form source (bidirectional sync with search-form block)
	// Evidence: voxel-search-form.beautified.js:2367-2373 $watch('post_type') updates navbar active state
	const [activePostType, setActivePostType] = useState<string | null>(
		linkedPostTypes?.find(pt => pt.isActive)?.key || linkedPostTypes?.[0]?.key || null
	);

	useEffect(() => {
		if (attributes.source !== 'search_form' || context !== 'frontend' || !linkedBlockId) return;

		const handlePostTypeChanged = (event: Event) => {
			const { searchFormId, postType } = (event as CustomEvent).detail || {};
			if (searchFormId !== linkedBlockId) return;
			if (postType) setActivePostType(postType);
		};

		window.addEventListener('voxel-search-form-post-type-changed', handlePostTypeChanged);
		return () => window.removeEventListener('voxel-search-form-post-type-changed', handlePostTypeChanged);
	}, [attributes.source, context, linkedBlockId]);

	// Compute popup scope class for custom popup styling (portaled popups)
	const popupScopeClass = attributes.customPopupEnabled
		? `voxel-popup-navbar-${attributes.blockId || 'default'}`
		: undefined;

	// Build vxconfig for re-render (required for DevTools visibility)
	const vxConfig: any = {
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
				{context === 'editor' && <EmptyPlaceholder />}
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
				{context === 'editor' && <EmptyPlaceholder />}
			</>
		);
	}

	// Render based on source
	if (attributes.source === 'add_links_manually') {
		// Show EmptyPlaceholder when no manual items (editor only)
		if ((!attributes.manualItems || attributes.manualItems.length === 0) && context === 'editor') {
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
						{attributes.manualItems.map((item) => {
							// Parse custom attributes (key|value format, comma-separated)
							const customAttrs: Record<string, string> = {};
							if (item.customAttributes) {
								item.customAttributes.split(',').forEach((pair) => {
									const [key, val] = pair.split('|').map((s) => s.trim());
									if (key) customAttrs[key] = val || '';
								});
							}
							return (
							<li key={item.id} className={`menu-item ${item.isActive ? 'current-menu-item' : ''}`}>
								<a
									href={item.url}
									target={item.isExternal ? '_blank' : undefined}
									rel={item.nofollow ? 'nofollow noopener' : undefined}
									className="ts-item-link"
									onClick={context === 'editor' ? (e: React.MouseEvent) => e.preventDefault() : undefined}
									{...customAttrs}
								>
									<div className="ts-item-icon flexify">{renderIcon(item.icon)}</div>
									<span>{item.text}</span>
								</a>
							</li>
							);
						})}
					</ul>
				</nav>
			</>
		);
	}

	if (attributes.source === 'select_wp_menu') {
		// WordPress menu mode
		const effectiveMenuData = mobileMenuData || menuData;
		const hasMenuItems = menuData?.items && menuData.items.length > 0;

		// Show EmptyPlaceholder when menu has no items (e.g. menu doesn't exist)
		if (!hasMenuItems && context === 'editor') {
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
							<MobileMenu attributes={attributes} menuData={effectiveMenuData} popupScopeClass={popupScopeClass} />
						)}

						{/* Desktop menu items */}
						{menuData?.items.map((item) => (
							<MenuItem key={item.id} item={item} attributes={attributes} popupScopeClass={popupScopeClass} context={context} />
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
					<nav className={`ts-nav-menu ts-nav-sf flexify${linkedBlockId ? ` ts-nav-sf-${linkedBlockId}` : ''}`}>
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
				<nav className={`ts-nav-menu ts-nav-sf flexify${linkedBlockId ? ` ts-nav-sf-${linkedBlockId}` : ''}`}>
					<ul className={navClasses}>
						{linkedPostTypes.map((postType) => (
							<li
								key={postType.key}
								className={`menu-item ${(activePostType ? postType.key === activePostType : postType.isActive) ? 'current-menu-item' : ''}`}
								data-post-type={postType.key}
							>
								<a
									href="#"
									className="ts-item-link"
									onClick={(e) => {
										e.preventDefault();
										// Update local active state immediately
										setActivePostType(postType.key);
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
