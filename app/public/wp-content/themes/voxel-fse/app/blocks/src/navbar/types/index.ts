/**
 * Navbar Block - TypeScript Interfaces
 *
 * Type definitions for the Navbar block following Plan C+ architecture.
 * Matches Voxel's Navbar widget structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/navbar.php
 * - Voxel template: themes/voxel/templates/widgets/navbar.php
 *
 * @package VoxelFSE
 */

/**
 * Icon object structure (matches Voxel icon format)
 */
import type { IconValue } from '@shared/types';

/**
 * Icon object structure (matches Voxel icon format)
 */
export type VoxelIcon = IconValue;

/**
 * Visibility Rule structure
 */
export interface VisibilityRule {
	id: string;
	filterKey: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
	value?: string;
}

/**
 * Manual nav item structure (for add_links_manually source)
 */
export interface NavbarManualItem {
	id: string;
	text: string;
	icon: VoxelIcon | null;
	url: string;
	isExternal: boolean;
	nofollow: boolean;
	isActive: boolean;
	// Loop & Visibility
	visibilityRules: VisibilityRule[];
	rowVisibility: 'show' | 'hide';
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;
}

/**
 * Menu item from WordPress nav menu
 */
export interface NavbarMenuItem {
	id: number;
	title: string;
	url: string;
	target: string;
	icon: string; // HTML markup
	classes: string[];
	isCurrent: boolean;
	hasChildren: boolean;
	children: NavbarMenuItem[];
}

/**
 * WordPress registered menu location
 */
export interface MenuLocation {
	slug: string;
	name: string;
	description: string;
}

/**
 * Navbar block attributes
 */
export interface NavbarAttributes {
	blockId: string;
	source: 'add_links_manually' | 'select_wp_menu' | 'template_tabs' | 'search_form';
	menuLocation: string;
	mobileMenuLocation: string;
	orientation: 'horizontal' | 'vertical';
	justify: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
	justify_tablet: string;
	justify_mobile: string;
	contentTabOpenPanel: string;
	templateTabsId: string;
	searchFormId: string;
	collapsible: boolean;
	collapsedWidth: number;
	expandedWidth: number;
	hamburgerTitle: string;
	showBurgerDesktop: boolean;
	showBurgerTablet: boolean;
	showMenuLabel: boolean;
	hamburgerIcon: VoxelIcon;
	closeIcon: VoxelIcon;
	manualItems: NavbarManualItem[];
	showIcon: 'flex' | 'none';
	iconOnTop: boolean;
	customPopupEnabled: boolean;
	multiColumnMenu: boolean;
	menuColumns: number;

	// Style Attributes
	styleTabOpenPanel: string;
	styleTabState: string;
	typography: any;
	linkColor: string;
	linkColorHover: string;
	linkColorActive: string;
	linkBg: string;
	linkBgHover: string;
	linkBgActive: string;
	linkMargin: any;
	linkMargin_tablet: any;
	linkMargin_mobile: any;
	linkPadding: any;
	linkPadding_tablet: any;
	linkPadding_mobile: any;
	linkBorderStyle: string;
	linkBorderRadius: number;
	linkBorderRadius_tablet: number;
	linkBorderRadius_mobile: number;
	linkGap: number;
	linkGap_tablet: number;
	linkGap_mobile: number;
	iconContainerSize: number;
	iconContainerSize_tablet: number;
	iconContainerSize_mobile: number;
	iconContainerRadius: number;
	iconContainerRadius_tablet: number;
	iconContainerRadius_mobile: number;
	iconContainerBg: string;
	iconContainerBgHover: string;
	iconContainerBgActive: string;
	iconSize: number;
	iconSize_tablet: number;
	iconSize_mobile: number;
	iconColor: string;
	iconColorHover: string;
	iconColorActive: string;
	scrollBg: string;
	chevronColor: string;
}

/**
 * VxConfig structure for save.tsx output
 */
export interface NavbarVxConfig {
	source: NavbarAttributes['source'];
	menuLocation: string;
	mobileMenuLocation: string;
	orientation: NavbarAttributes['orientation'];
	justify: NavbarAttributes['justify'];
	templateTabsId: string;
	searchFormId: string;
	collapsible: boolean;
	collapsedWidth: number;
	expandedWidth: number;
	hamburgerTitle: string;
	showBurgerDesktop: boolean;
	showBurgerTablet: boolean;
	showMenuLabel: boolean;
	hamburgerIcon: VoxelIcon;
	closeIcon: VoxelIcon;
	manualItems: NavbarManualItem[];
	showIcon: NavbarAttributes['showIcon'];
	iconOnTop: boolean;
	customPopupEnabled: boolean;
	multiColumnMenu: boolean;
	menuColumns: number;
	styleTabState: string;
	typography: any;
	linkColor: string;
	linkColorHover: string;
	linkColorActive: string;
	linkBg: string;
	linkBgHover: string;
	linkBgActive: string;
	linkMargin: any;
	linkPadding: any;
	linkBorderStyle: string;
	linkBorderRadius: number;
	linkGap: number;
	iconContainerSize: number;
	iconContainerRadius: number;
	iconContainerBg: string;
	iconContainerBgHover: string;
	iconContainerBgActive: string;
	iconSize: number;
	iconColor: string;
	iconColorHover: string;
	iconColorActive: string;
	scrollBg: string;
	chevronColor: string;
}

/**
 * REST API response for menu data
 */
export interface NavbarMenuApiResponse {
	menuLocation: string;
	menuName: string;
	items: NavbarMenuItem[];
}

/**
 * REST API response for menu locations
 */
export interface NavbarLocationsApiResponse {
	locations: MenuLocation[];
}

/**
 * Props for NavbarComponent
 */
export interface NavbarComponentProps {
	attributes: NavbarAttributes;
	menuData: NavbarMenuApiResponse | null;
	mobileMenuData: NavbarMenuApiResponse | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
}

/**
 * Submenu state for popup management
 */
export interface SubmenuState {
	isOpen: boolean;
	activeScreen: string;
	slideFrom: 'left' | 'right';
}
