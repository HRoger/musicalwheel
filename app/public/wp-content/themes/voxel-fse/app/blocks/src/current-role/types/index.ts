/**
 * Current Role Block - TypeScript Interfaces
 *
 * Type definitions for the Current Role block.
 * Matches Voxel's current-role widget structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/current-role.php
 * - Voxel template: themes/voxel/templates/widgets/current-role.php
 *
 * @package VoxelFSE
 */

/**
 * Icon value structure (matches Elementor ICONS control)
 */
export interface IconValue {
	library: 'icon' | 'svg' | 'dynamic' | 'fa-solid' | 'fa-regular' | 'fa-brands' | 'line-awesome' | '';
	value: string;
}

/**
 * Helper interfaces for style values
 */
export interface TypographyValue {
	[key: string]: unknown;
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
	textTransform?: string;
}

export interface BoxShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
}

export interface BorderValue {
	borderType?: string;
	borderWidth?: BoxValues;
	borderColor?: string;
}

export interface BoxValues {
	top?: number | string;
	right?: number | string;
	bottom?: number | string;
	left?: number | string;
	unit?: string;
}

/**
 * Block attributes stored in WordPress database
 */
export interface CurrentRoleAttributes {
	[key: string]: any; // Allow responsive variants (_tablet, _mobile, etc.)

	blockId: string;
	roleIcon: IconValue;
	switchIcon: IconValue;

	// Inspector state
	inspectorActiveTab?: string;
	contentTabOpenPanel?: string;
	styleTabOpenPanel?: string;
	buttonState?: string;

	// Panel accordion
	panelBorder?: BorderValue;
	panelRadius?: number;
	panelBg?: string;
	panelShadow?: BoxShadowValue;
	headPadding?: BoxValues;
	headIcoSize?: number;
	headIcoMargin?: number;
	headIcoCol?: string;
	headTypo?: TypographyValue;
	headTypoCol?: string;
	headBorderCol?: string;
	panelSpacing?: number;
	panelGap?: number;
	textAlign?: string;
	bodyTypo?: TypographyValue;
	bodyTypoCol?: string;
	panelButtonsGap?: number;

	// Button accordion (Normal state)
	scndBtnTypo?: TypographyValue;
	scndBtnRadius?: number;
	scndBtnC?: string;
	scndBtnPadding?: BoxValues;
	scndBtnHeight?: number;
	scndBtnBg?: string;
	scndBtnBorder?: BorderValue;
	scndBtnIconSize?: number;
	scndBtnIconPad?: number;
	scndBtnIconColor?: string;

	// Button accordion (Hover state)
	scndBtnCH?: string;
	scndBtnBgH?: string;
	scndBtnBorderH?: string;
	scndBtnIconColorH?: string;
}

/**
 * VxConfig JSON stored in save.tsx output
 * Contains all data needed for frontend hydration
 */
export interface CurrentRoleVxConfig {
	roleIcon: IconValue;
	switchIcon: IconValue;
}

/**
 * Role data structure from REST API
 */
export interface RoleData {
	key: string;
	label: string;
}

/**
 * Switchable role data structure from REST API
 */
export interface SwitchableRoleData extends RoleData {
	switchUrl: string;
}

/**
 * REST API response for current role data
 */
export interface CurrentRoleApiResponse {
	isLoggedIn: boolean;
	canSwitch: boolean;
	currentRoles: RoleData[];
	switchableRoles: SwitchableRoleData[];
	rolesLabel: string;
}

/**
 * Props for the shared CurrentRoleComponent
 */
export interface CurrentRoleComponentProps {
	attributes: CurrentRoleAttributes;
	roleData: CurrentRoleApiResponse | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
}
