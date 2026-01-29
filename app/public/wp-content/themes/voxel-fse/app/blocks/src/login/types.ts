/**
 * Login/Register Block - TypeScript Interfaces
 *
 * @package VoxelFSE
 */

/**
 * Screen types for the auth widget
 */
export type AuthScreen =
	| 'login'
	| 'register'
	| 'confirm_account'
	| 'recover'
	| 'recover_confirm'
	| 'recover_set_password'
	| 'welcome'
	| 'security'
	| 'security_update_password'
	| 'security_update_email'
	| 'security_privacy'
	| 'security_delete_account'
	| 'security_delete_account_confirm'
	| 'security_2fa_setup'
	| 'security_2fa_backup_codes'
	| 'security_2fa_manage'
	| 'security_2fa_disable'
	| 'login_2fa_verify';

/**
 * Role source type
 */
export type RoleSource = 'auto' | 'manual';

/**
 * Icon configuration matching Elementor's icon format
 */
export interface IconConfig {
	library?: string;
	value?: string;
}

/**
 * Dimensions configuration
 */
export interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

/**
 * Image upload value
 */
export interface ImageUploadValue {
	id?: number;
	url?: string;
	width?: number;
	height?: number;
	caption?: string;
	alt?: string;
}

/**
 * Range slider value
 */
export interface RangeSliderValue {
	start: number;
	end: number;
}

/**
 * Role field configuration from Voxel
 */
export interface RoleField {
	id: string;
	key: string;
	type: string;
	label: string;
	description?: string;
	required: boolean;
	placeholder?: string;
	value?: unknown;
	props?: Record<string, unknown>;
	_is_auth_field?: boolean;
	conditions?: FieldCondition[];
}

/**
 * Visibility Rule from ElementVisibilityModal
 */
export interface VisibilityRule {
	id: string;
	type: string;
	[key: string]: unknown;
}

/**
 * Field condition for conditional logic
 */
export interface FieldCondition {
	field: string;
	compare: string;
	value: unknown;
}

/**
 * Role configuration from Voxel
 */
export interface RoleConfig {
	key: string;
	label: string;
	allow_social_login: boolean;
	social_login: {
		google: string;
		google_register: string;
	};
	fields: RoleField[];
}

/**
 * ReCAPTCHA configuration
 */
export interface RecaptchaConfig {
	enabled: boolean;
	key: string;
}

/**
 * Two-factor authentication configuration
 */
export interface TwoFactorConfig {
	enabled: boolean;
	backup_codes_count: number;
	trusted_devices_count: number;
}

/**
 * Registration configuration
 */
export interface RegistrationConfig {
	roles: Record<string, RoleConfig>;
	default_role: string | null;
}

/**
 * Localization strings
 */
export interface AuthL10n {
	twofa_enabled: string;
	twofa_disabled: string;
	twofa_disable_confirm: string;
	twofa_regenerate_backups_confirm: string;
	twofa_backups_generated: string;
	twofa_remove_trusted_devices_confirm: string;
	twofa_trusted_devices_removed: string;
}

/**
 * Google auth configuration
 */
export interface GoogleAuthConfig {
	enabled: boolean;
	loginUrl: string;
	registerUrl: string;
}

/**
 * URLs configuration
 */
export interface UrlsConfig {
	terms: string;
	privacy: string;
	logout: string;
	editProfile: string;
}

/**
 * Auth configuration returned by REST API (matches Voxel's widget config)
 */
export interface AuthConfig {
	screen: AuthScreen;
	nonce: string;
	redirectUrl: string;
	recaptcha: RecaptchaConfig;
	errors: {
		social_login_requires_account: {
			message: string;
		};
	};
	l10n: AuthL10n;
	twofa: TwoFactorConfig;
	registration: RegistrationConfig;
	editProfileUrl?: string;
	userDisplayName?: string;
	google: GoogleAuthConfig;
	urls: UrlsConfig;
	logoutUrl: string;
}

/**
 * Field configuration (alias for RoleField for clarity)
 */
export type FieldConfig = RoleField;

/**
 * Block attributes
 */
export interface LoginAttributes {
	// Block ID
	blockId: string;

	// Content Tab - General Section
	previewScreen: AuthScreen;
	loginTitle: string;
	registerTitle: string;
	confirmTitle: string;
	passwordRecoveryTitle: string;
	confirmCodeTitle: string;
	newPasswordTitle: string;
	updatePasswordTitle: string;
	updateEmailTitle: string;
	welcomeTitle: string;

	// Content Tab - Registration Section
	roleSource: RoleSource;
	manualRoles: string[];

	// Content Tab - Icons Section
	googleIcon: IconConfig;
	signUpIcon: IconConfig;
	usernameIcon: IconConfig;
	passwordIcon: IconConfig;
	eyeIcon: IconConfig;
	emailIcon: IconConfig;
	welcomeIcon: IconConfig;
	leftChevronIcon: IconConfig;
	privacyIcon: IconConfig;
	trashIcon: IconConfig;
	logoutIcon: IconConfig;
	phoneIcon: IconConfig;
	linkIcon: IconConfig;
	calendarIcon: IconConfig;
	taxonomyIcon: IconConfig;
	uploadIcon: IconConfig;
	copyIcon: IconConfig;
	cloudIcon: IconConfig;
	deviceIcon: IconConfig;
	shieldIcon: IconConfig;

	// Style Tab - General Section
	titleTypography?: Record<string, unknown>;
	titleColor?: string;
	contentSpacing?: number;
	contentSpacing_tablet?: number;
	contentSpacing_mobile?: number;

	// Style Tab - Role Selection Section
	roleMinWidth?: number;
	roleMinWidth_tablet?: number;
	roleMinWidth_mobile?: number;
	roleBorderRadius?: number;
	roleBorderRadius_tablet?: number;
	roleBorderRadius_mobile?: number;
	roleBorderType?: string;
	roleBorderWidth?: Record<string, unknown>;
	roleBorderColor?: string;
	roleTypography?: Record<string, unknown>;
	roleSeparatorColor?: string;
	roleTextColor?: string;
	roleBackgroundColor?: string;
	roleActiveTypography?: Record<string, unknown>;
	roleActiveTextColor?: string;
	roleActiveBackgroundColor?: string;

	// Style Tab - Primary Button Section (Normal)
	primaryBtnTypography?: Record<string, unknown>;
	primaryBtnBorderRadius?: number;
	primaryBtnBorderRadius_tablet?: number;
	primaryBtnBorderRadius_mobile?: number;
	primaryBtnTextColor?: string;
	primaryBtnPadding?: Record<string, unknown>;
	primaryBtnPadding_tablet?: Record<string, unknown>;
	primaryBtnPadding_mobile?: Record<string, unknown>;
	primaryBtnHeight?: number;
	primaryBtnHeight_tablet?: number;
	primaryBtnHeight_mobile?: number;
	primaryBtnBackgroundColor?: string;
	primaryBtnBorderType?: string;
	primaryBtnBorderWidth?: Record<string, unknown>;
	primaryBtnBorderColor?: string;
	primaryBtnIconSize?: number;
	primaryBtnIconSize_tablet?: number;
	primaryBtnIconSize_mobile?: number;
	primaryBtnIconSpacing?: number;
	primaryBtnIconSpacing_tablet?: number;
	primaryBtnIconSpacing_mobile?: number;
	primaryBtnIconColor?: string;
	// Style Tab - Primary Button Section (Hover)
	primaryBtnTextColorHover?: string;
	primaryBtnBackgroundColorHover?: string;
	primaryBtnBorderColorHover?: string;
	primaryBtnIconColorHover?: string;

	// Style Tab - Secondary Button Section (Normal)
	secondaryBtnTypography?: Record<string, unknown>;
	secondaryBtnBorderRadius?: number;
	secondaryBtnBorderRadius_tablet?: number;
	secondaryBtnBorderRadius_mobile?: number;
	secondaryBtnTextColor?: string;
	secondaryBtnPadding?: Record<string, unknown>;
	secondaryBtnPadding_tablet?: Record<string, unknown>;
	secondaryBtnPadding_mobile?: Record<string, unknown>;
	secondaryBtnHeight?: number;
	secondaryBtnHeight_tablet?: number;
	secondaryBtnHeight_mobile?: number;
	secondaryBtnBackgroundColor?: string;
	secondaryBtnBorderType?: string;
	secondaryBtnBorderWidth?: Record<string, unknown>;
	secondaryBtnBorderColor?: string;
	secondaryBtnIconSize?: number;
	secondaryBtnIconSize_tablet?: number;
	secondaryBtnIconSize_mobile?: number;
	secondaryBtnIconSpacing?: number;
	secondaryBtnIconSpacing_tablet?: number;
	secondaryBtnIconSpacing_mobile?: number;
	secondaryBtnIconColor?: string;
	// Style Tab - Secondary Button Section (Hover)
	secondaryBtnTextColorHover?: string;
	secondaryBtnBackgroundColorHover?: string;
	secondaryBtnBorderColorHover?: string;
	secondaryBtnIconColorHover?: string;

	// Style Tab - Google Button Section (Normal)
	googleBtnTypography?: Record<string, unknown>;
	googleBtnBorderRadius?: number;
	googleBtnBorderRadius_tablet?: number;
	googleBtnBorderRadius_mobile?: number;
	googleBtnTextColor?: string;
	googleBtnPadding?: Record<string, unknown>;
	googleBtnPadding_tablet?: Record<string, unknown>;
	googleBtnPadding_mobile?: Record<string, unknown>;
	googleBtnHeight?: number;
	googleBtnHeight_tablet?: number;
	googleBtnHeight_mobile?: number;
	googleBtnBackgroundColor?: string;
	googleBtnBorderType?: string;
	googleBtnBorderWidth?: Record<string, unknown>;
	googleBtnBorderColor?: string;
	googleBtnIconSize?: number;
	googleBtnIconSize_tablet?: number;
	googleBtnIconSize_mobile?: number;
	googleBtnIconSpacing?: number;
	googleBtnIconSpacing_tablet?: number;
	googleBtnIconSpacing_mobile?: number;
	googleBtnIconColor?: string;
	// Style Tab - Google Button Section (Hover)
	googleBtnTextColorHover?: string;
	googleBtnBackgroundColorHover?: string;
	googleBtnBorderColorHover?: string;
	googleBtnIconColorHover?: string;

	// Style Tab - Section Divider
	dividerTypography?: Record<string, unknown>;
	dividerTextColor?: string;
	dividerColor?: string;
	dividerHeight?: number;
	dividerHeight_tablet?: number;
	dividerHeight_mobile?: number;

	// Style Tab - Welcome Section
	welcomeAlignContent?: string;
	welcomeTextAlign?: string;
	welcomeIconSize?: number;
	welcomeIconSize_tablet?: number;
	welcomeIconSize_mobile?: number;
	welcomeIconColor?: string;
	welcomeHeadingTypography?: Record<string, unknown>;
	welcomeHeadingColor?: string;
	welcomeHeadingTopMargin?: number;
	welcomeHeadingTopMargin_tablet?: number;
	welcomeHeadingTopMargin_mobile?: number;

	// Style Tab - Form File/Gallery Section
	formFileItemGap?: number;
	formFileItemGap_tablet?: number;
	formFileItemGap_mobile?: number;
	// Select files - Normal
	formFileSelectIconColor?: string;
	formFileSelectIconSize?: number;
	formFileSelectIconSize_tablet?: number;
	formFileSelectIconSize_mobile?: number;
	formFileSelectBackground?: string;
	formFileSelectBorderType?: string;
	formFileSelectBorderWidth?: Record<string, unknown>;
	formFileSelectBorderColor?: string;
	formFileSelectBorderRadius?: number;
	formFileSelectBorderRadius_tablet?: number;
	formFileSelectBorderRadius_mobile?: number;
	formFileSelectTypography?: Record<string, unknown>;
	formFileSelectTextColor?: string;
	// Select files - Hover
	formFileSelectIconColorHover?: string;
	formFileSelectBackgroundHover?: string;
	formFileSelectBorderColorHover?: string;
	formFileSelectTextColorHover?: string;
	// Added file/image
	formFileAddedBorderRadius?: number;
	formFileAddedBorderRadius_tablet?: number;
	formFileAddedBorderRadius_mobile?: number;
	formFileAddedBackground?: string;
	formFileAddedIconColor?: string;
	formFileAddedIconSize?: number;
	formFileAddedIconSize_tablet?: number;
	formFileAddedIconSize_mobile?: number;
	formFileAddedTypography?: Record<string, unknown>;
	formFileAddedTextColor?: string;
	// Remove/Check button
	formFileRemoveBackground?: string;
	formFileRemoveBackgroundHover?: string;
	formFileRemoveColor?: string;
	formFileRemoveColorHover?: string;
	formFileRemoveBorderRadius?: number;
	formFileRemoveBorderRadius_tablet?: number;
	formFileRemoveBorderRadius_mobile?: number;
	formFileRemoveSize?: number;
	formFileRemoveSize_tablet?: number;
	formFileRemoveSize_mobile?: number;
	formFileRemoveIconSize?: number;
	formFileRemoveIconSize_tablet?: number;
	formFileRemoveIconSize_mobile?: number;

	// Style Tab - Form Dialog Section
	formDialogIconColor?: string;
	formDialogIconSize?: number;
	formDialogIconSize_tablet?: number;
	formDialogIconSize_mobile?: number;
	formDialogTextColor?: string;
	formDialogTypography?: Record<string, unknown>;
	formDialogBackgroundColor?: string;
	formDialogRadius?: number;
	formDialogRadius_tablet?: number;
	formDialogRadius_mobile?: number;
	formDialogBoxShadow?: Record<string, unknown>;
	formDialogBorderType?: string;
	formDialogBorderWidth?: Record<string, unknown>;
	formDialogBorderColor?: string;

	// Style Tab - Inspector state
	styleTabOpenPanel?: string;

	// Field Style Tab - Label Section
	fieldLabelTypography?: Record<string, unknown>;
	fieldLabelColor?: string;
	fieldLabelLinkColor?: string;
	fieldLabelPadding?: Record<string, unknown>;
	fieldLabelPadding_tablet?: Record<string, unknown>;
	fieldLabelPadding_mobile?: Record<string, unknown>;
	// Optional label
	fieldOptionalLabelTypography?: Record<string, unknown>;
	fieldOptionalLabelColor?: string;

	// Field Style Tab - Form: Input & Textarea Section (Normal)
	fieldInputPlaceholderColor?: string;
	fieldInputPlaceholderTypography?: Record<string, unknown>;
	fieldInputTextColor?: string;
	fieldInputTypography?: Record<string, unknown>;
	fieldInputBackgroundColor?: string;
	fieldInputBorderType?: string;
	fieldInputBorderWidth?: Record<string, unknown>;
	fieldInputBorderColor?: string;
	fieldInputPadding?: Record<string, unknown>;
	fieldInputPadding_tablet?: Record<string, unknown>;
	fieldInputPadding_mobile?: Record<string, unknown>;
	fieldInputBorderRadius?: number;
	fieldInputBorderRadius_tablet?: number;
	fieldInputBorderRadius_mobile?: number;
	// Input with icon
	fieldInputIconPadding?: Record<string, unknown>;
	fieldInputIconPadding_tablet?: Record<string, unknown>;
	fieldInputIconPadding_mobile?: Record<string, unknown>;
	fieldInputIconColor?: string;
	fieldInputIconSize?: number;
	fieldInputIconSize_tablet?: number;
	fieldInputIconSize_mobile?: number;
	fieldInputIconSidePadding?: number;
	fieldInputIconSidePadding_tablet?: number;
	fieldInputIconSidePadding_mobile?: number;
	// Textarea
	fieldTextareaPadding?: Record<string, unknown>;
	fieldTextareaPadding_tablet?: Record<string, unknown>;
	fieldTextareaPadding_mobile?: Record<string, unknown>;
	fieldTextareaHeight?: number;
	fieldTextareaHeight_tablet?: number;
	fieldTextareaHeight_mobile?: number;
	fieldTextareaBorderRadius?: number;
	fieldTextareaBorderRadius_tablet?: number;
	fieldTextareaBorderRadius_mobile?: number;
	// Input/Textarea Hover state
	fieldInputBackgroundColorHover?: string;
	fieldInputBorderColorHover?: string;
	fieldInputPlaceholderColorHover?: string;
	fieldInputTextColorHover?: string;
	fieldInputIconColorHover?: string;
	// Input/Textarea Active state
	fieldInputBackgroundColorActive?: string;
	fieldInputBorderColorActive?: string;
	fieldInputPlaceholderColorActive?: string;
	fieldInputTextColorActive?: string;

	// Field Style Tab - Form: Popup Button Section (Normal)
	fieldPopupBtnTypography?: Record<string, unknown>;
	fieldPopupBtnPadding?: Record<string, unknown>;
	fieldPopupBtnPadding_tablet?: Record<string, unknown>;
	fieldPopupBtnPadding_mobile?: Record<string, unknown>;
	fieldPopupBtnHeight?: number;
	fieldPopupBtnHeight_tablet?: number;
	fieldPopupBtnHeight_mobile?: number;
	fieldPopupBtnBoxShadow?: Record<string, unknown>;
	fieldPopupBtnBackgroundColor?: string;
	fieldPopupBtnTextColor?: string;
	fieldPopupBtnBorderType?: string;
	fieldPopupBtnBorderWidth?: Record<string, unknown>;
	fieldPopupBtnBorderColor?: string;
	fieldPopupBtnBorderRadius?: number;
	fieldPopupBtnBorderRadius_tablet?: number;
	fieldPopupBtnBorderRadius_mobile?: number;
	fieldPopupBtnIconColor?: string;
	fieldPopupBtnIconSize?: number;
	fieldPopupBtnIconSize_tablet?: number;
	fieldPopupBtnIconSize_mobile?: number;
	fieldPopupBtnIconSpacing?: number;
	fieldPopupBtnIconSpacing_tablet?: number;
	fieldPopupBtnIconSpacing_mobile?: number;
	fieldPopupBtnHideChevron?: boolean;
	fieldPopupBtnChevronColor?: string;
	// Popup Button Hover state
	fieldPopupBtnBackgroundColorHover?: string;
	fieldPopupBtnTextColorHover?: string;
	fieldPopupBtnBorderColorHover?: string;
	fieldPopupBtnIconColorHover?: string;
	fieldPopupBtnBoxShadowHover?: Record<string, unknown>;
	// Popup Button Filled state
	fieldPopupBtnFilledTypography?: Record<string, unknown>;
	fieldPopupBtnFilledBackground?: string;
	fieldPopupBtnFilledTextColor?: string;
	fieldPopupBtnFilledIconColor?: string;
	fieldPopupBtnFilledBorderColor?: string;
	fieldPopupBtnFilledBorderWidth?: number;
	fieldPopupBtnFilledBorderWidth_tablet?: number;
	fieldPopupBtnFilledBorderWidth_mobile?: number;
	fieldPopupBtnFilledBoxShadow?: Record<string, unknown>;

	// Field Style Tab - Form: Switcher Section
	fieldSwitcherSize?: number;
	fieldSwitcherSize_tablet?: number;
	fieldSwitcherSize_mobile?: number;
	fieldSwitcherBackgroundColor?: string;
	fieldSwitcherBackgroundColorActive?: string;
	fieldSwitcherHandleColor?: string;
	fieldSwitcherHandleColorActive?: string;

	// Field Style Tab - Checkbox Section
	fieldCheckboxSize?: number;
	fieldCheckboxSize_tablet?: number;
	fieldCheckboxSize_mobile?: number;
	fieldCheckboxBorderRadius?: number;
	fieldCheckboxBorderRadius_tablet?: number;
	fieldCheckboxBorderRadius_mobile?: number;
	fieldCheckboxBorderType?: string;
	fieldCheckboxBorderWidth?: Record<string, unknown>;
	fieldCheckboxBackgroundColor?: string;
	fieldCheckboxBorderColor?: string;
	fieldCheckboxCheckmarkColor?: string;
	// Checked state
	fieldCheckboxBackgroundColorChecked?: string;
	fieldCheckboxBorderColorChecked?: string;

	// Field Style Tab - Inspector state
	fieldStyleTabOpenPanel?: string;

	// Advanced Tab (common across blocks)
	hideDesktop?: boolean;
	hideTablet?: boolean;
	hideMobile?: boolean;
	customClasses?: string;

	// VOXEL TAB ATTRIBUTES
	// Widget options - Sticky
	stickyEnabled?: boolean;
	stickyDesktop?: 'sticky' | 'initial';
	stickyTablet?: 'sticky' | 'initial';
	stickyMobile?: 'sticky' | 'initial';
	stickyTop?: number;
	stickyTop_tablet?: number;
	stickyTop_mobile?: number;
	stickyTopUnit?: string;
	stickyLeft?: number;
	stickyLeft_tablet?: number;
	stickyLeft_mobile?: number;
	stickyLeftUnit?: string;
	stickyRight?: number;
	stickyRight_tablet?: number;
	stickyRight_mobile?: number;
	stickyRightUnit?: string;
	stickyBottom?: number;
	stickyBottom_tablet?: number;
	stickyBottom_mobile?: number;
	stickyBottomUnit?: string;

	// Visibility
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];

	// Loop element
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: number | string;
	loopOffset?: number | string;

	// Inspector state
	// Advanced Tab - Layout Section
	blockMargin?: DimensionsConfig;
	blockMargin_tablet?: DimensionsConfig;
	blockMargin_mobile?: DimensionsConfig;
	blockPadding?: DimensionsConfig;
	blockPadding_tablet?: DimensionsConfig;
	blockPadding_mobile?: DimensionsConfig;
	elementWidth?: string;
	elementWidth_tablet?: string;
	elementWidth_mobile?: string;
	elementCustomWidth?: number;
	elementCustomWidth_tablet?: number;
	elementCustomWidth_mobile?: number;
	elementCustomWidthUnit?: string;
	flexAlignSelf?: string;
	flexAlignSelf_tablet?: string;
	flexAlignSelf_mobile?: string;
	flexOrder?: string;
	flexOrder_tablet?: string;
	flexOrder_mobile?: string;
	flexOrderCustom?: number;
	flexOrderCustom_tablet?: number;
	flexOrderCustom_mobile?: number;
	flexSize?: string;
	flexSize_tablet?: string;
	flexSize_mobile?: string;
	flexGrow?: number;
	flexGrow_tablet?: number;
	flexGrow_mobile?: number;
	flexShrink?: number;
	flexShrink_tablet?: number;
	flexShrink_mobile?: number;

	// Advanced Tab - Position Section
	position?: string;
	offsetOrientationH?: string;
	offsetX?: number;
	offsetX_tablet?: number;
	offsetX_mobile?: number;
	offsetXUnit?: string;
	offsetXEnd?: number;
	offsetXEnd_tablet?: number;
	offsetXEnd_mobile?: number;
	offsetXEndUnit?: string;
	offsetOrientationV?: string;
	offsetY?: number;
	offsetY_tablet?: number;
	offsetY_mobile?: number;
	offsetYUnit?: string;
	offsetYEnd?: number;
	offsetYEnd_tablet?: number;
	offsetYEnd_mobile?: number;
	offsetYEndUnit?: string;
	zIndex?: string;
	zIndex_tablet?: string;
	zIndex_mobile?: string;

	// Advanced Tab - Identity Section
	elementId?: string;
	elementIdDynamicTag?: string;
	customClassesDynamicTag?: string;

	// Advanced Tab - Border Section
	borderActiveTab?: string;
	borderType?: string;
	borderWidth?: DimensionsConfig;
	borderColor?: string;
	borderRadius?: DimensionsConfig;
	borderRadius_tablet?: DimensionsConfig;
	borderRadius_mobile?: DimensionsConfig;
	boxShadow?: Record<string, unknown>;
	borderTypeHover?: string;
	borderWidthHover?: DimensionsConfig;
	borderColorHover?: string;
	borderRadiusHover?: DimensionsConfig;
	borderRadiusHover_tablet?: DimensionsConfig;
	borderRadiusHover_mobile?: DimensionsConfig;
	boxShadowHover?: Record<string, unknown>;

	// Advanced Tab - Background Section
	backgroundActiveTab?: string;
	backgroundType?: string;
	backgroundColor?: string;
	backgroundImage?: ImageUploadValue;
	backgroundImage_tablet?: ImageUploadValue;
	backgroundImage_mobile?: ImageUploadValue;
	bgImageResolution?: string;
	bgImagePosition?: string;
	bgImagePosition_tablet?: string;
	bgImagePosition_mobile?: string;
	bgImageAttachment?: string;
	bgImageRepeat?: string;
	bgImageRepeat_tablet?: string;
	bgImageRepeat_mobile?: string;
	bgImageSize?: string;
	bgImageSize_tablet?: string;
	bgImageSize_mobile?: string;
	bgImageCustomWidth?: number;
	bgImageCustomWidth_tablet?: number;
	bgImageCustomWidth_mobile?: number;
	bgImageCustomWidthUnit?: string;
	gradientColor?: string;
	gradientLocation?: number;
	gradientLocation_tablet?: number;
	gradientLocation_mobile?: number;
	gradientSecondColor?: string;
	gradientSecondLocation?: number;
	gradientSecondLocation_tablet?: number;
	gradientSecondLocation_mobile?: number;
	gradientType?: string;
	gradientAngle?: number;
	gradientAngle_tablet?: number;
	gradientAngle_mobile?: number;
	gradientPosition?: string;
	gradientPosition_tablet?: string;
	gradientPosition_mobile?: string;
	backgroundTypeHover?: string;
	backgroundColorHover?: string;
	backgroundImageHover?: ImageUploadValue;
	backgroundImageHover_tablet?: ImageUploadValue;
	backgroundImageHover_mobile?: ImageUploadValue;
	bgImageResolutionHover?: string;
	bgImagePositionHover?: string;
	bgImagePositionHover_tablet?: string;
	bgImagePositionHover_mobile?: string;
	bgImageAttachmentHover?: string;
	bgImageRepeatHover?: string;
	bgImageRepeatHover_tablet?: string;
	bgImageRepeatHover_mobile?: string;
	bgImageSizeHover?: string;
	bgImageSizeHover_tablet?: string;
	bgImageSizeHover_mobile?: string;
	bgImageCustomWidthHover?: number;
	bgImageCustomWidthHover_tablet?: number;
	bgImageCustomWidthHover_mobile?: number;
	bgImageCustomWidthHoverUnit?: string;
	bgImageDynamicTag?: string;
	bgImageDynamicTagHover?: string;
	gradientColorHover?: string;
	gradientLocationHover?: number;
	gradientLocationHover_tablet?: number;
	gradientLocationHover_mobile?: number;
	gradientSecondColorHover?: string;
	gradientSecondLocationHover?: number;
	gradientSecondLocationHover_tablet?: number;
	gradientSecondLocationHover_mobile?: number;
	gradientTypeHover?: string;
	gradientAngleHover?: number;
	gradientAngleHover_tablet?: number;
	gradientAngleHover_mobile?: number;
	gradientPositionHover?: string;
	gradientPositionHover_tablet?: string;
	gradientPositionHover_mobile?: string;
	bgTransitionDuration?: number;

	// Advanced Tab - Mask Section
	maskSwitch?: boolean;
	maskShape?: string;
	maskImage?: ImageUploadValue;
	maskImage_tablet?: ImageUploadValue;
	maskImage_mobile?: ImageUploadValue;
	maskSize?: string;
	maskSize_tablet?: string;
	maskSize_mobile?: string;
	maskSizeScale?: number;
	maskSizeScale_tablet?: number;
	maskSizeScale_mobile?: number;
	maskSizeScaleUnit?: string;
	maskPosition?: string;
	maskPosition_tablet?: string;
	maskPosition_mobile?: string;
	maskPositionX?: number;
	maskPositionX_tablet?: number;
	maskPositionX_mobile?: number;
	maskPositionXUnit?: string;
	maskPositionY?: number;
	maskPositionY_tablet?: number;
	maskPositionY_mobile?: number;
	maskPositionYUnit?: string;
	maskRepeat?: string;
	maskRepeat_tablet?: string;
	maskRepeat_mobile?: string;

	// Advanced Tab - Custom CSS & Attributes
	customCSS?: string;
	customAttributes?: string;
	customAttributesDynamicTag?: string;

	// Advanced Tab - Inspector state
	advancedOpenPanel?: string;

	// Advanced Tab - Transform
	transformActiveTab?: string;
	transformRotate?: number;
	transformRotate_tablet?: number;
	transformRotate_mobile?: number;
	transformRotate3D?: boolean;
	transformRotateX?: number;
	transformRotateX_tablet?: number;
	transformRotateX_mobile?: number;
	transformRotateY?: number;
	transformRotateY_tablet?: number;
	transformRotateY_mobile?: number;
	transformPerspective?: number;
	transformPerspective_tablet?: number;
	transformPerspective_mobile?: number;
	transformRotateHover?: number;
	transformRotateHover_tablet?: number;
	transformRotateHover_mobile?: number;
	transformRotate3DHover?: boolean;
	transformRotateXHover?: number;
	transformRotateXHover_tablet?: number;
	transformRotateXHover_mobile?: number;
	transformRotateYHover?: number;
	transformRotateYHover_tablet?: number;
	transformRotateYHover_mobile?: number;
	transformPerspectiveHover?: number;
	transformPerspectiveHover_tablet?: number;
	transformPerspectiveHover_mobile?: number;
	transformTranslateX?: number;
	transformTranslateX_tablet?: number;
	transformTranslateX_mobile?: number;
	transformTranslateXUnit?: string;
	transformTranslateY?: number;
	transformTranslateY_tablet?: number;
	transformTranslateY_mobile?: number;
	transformTranslateYUnit?: string;
	transformTranslateXHover?: number;
	transformTranslateXHover_tablet?: number;
	transformTranslateXHover_mobile?: number;
	transformTranslateXHoverUnit?: string;
	transformTranslateYHover?: number;
	transformTranslateYHover_tablet?: number;
	transformTranslateYHover_mobile?: number;
	transformTranslateYHoverUnit?: string;
	transformScaleProportions?: boolean;
	transformScale?: number;
	transformScale_tablet?: number;
	transformScale_mobile?: number;
	transformScaleX?: number;
	transformScaleX_tablet?: number;
	transformScaleX_mobile?: number;
	transformScaleY?: number;
	transformScaleY_tablet?: number;
	transformScaleY_mobile?: number;
	transformScaleProportionsHover?: boolean;
	transformScaleHover?: number;
	transformScaleHover_tablet?: number;
	transformScaleHover_mobile?: number;
	transformScaleXHover?: number;
	transformScaleXHover_tablet?: number;
	transformScaleXHover_mobile?: number;
	transformScaleYHover?: number;
	transformScaleYHover_tablet?: number;
	transformScaleYHover_mobile?: number;
	transformSkewX?: number;
	transformSkewX_tablet?: number;
	transformSkewX_mobile?: number;
	transformSkewY?: number;
	transformSkewY_tablet?: number;
	transformSkewY_mobile?: number;
	transformSkewXHover?: number;
	transformSkewXHover_tablet?: number;
	transformSkewXHover_mobile?: number;
	transformSkewYHover?: number;
	transformSkewYHover_tablet?: number;
	transformSkewYHover_mobile?: number;
	transformFlipX?: boolean;
	transformFlipY?: boolean;
	transformFlipXHover?: boolean;
	transformFlipYHover?: boolean;
	transformOriginX?: string;
	transformOriginX_tablet?: string;
	transformOriginX_mobile?: string;
	transformOriginY?: string;
	transformOriginY_tablet?: string;
	transformOriginY_mobile?: string;
	transformOriginXHover?: string;
	transformOriginXHover_tablet?: string;
	transformOriginXHover_mobile?: string;
	transformOriginYHover?: string;
	transformOriginYHover_tablet?: string;
	transformOriginYHover_mobile?: string;
	transformTransitionDuration?: number;

	// Advanced Tab - Motion Effects - Scrolling
	scrollingEffectsEnabled?: boolean;
	verticalScrollEnabled?: boolean;
	verticalScrollDirection?: string;
	verticalScrollSpeed?: number;
	verticalScrollViewport?: RangeSliderValue;
	horizontalScrollEnabled?: boolean;
	horizontalScrollDirection?: string;
	horizontalScrollSpeed?: number;
	horizontalScrollViewport?: RangeSliderValue;
	transparencyEnabled?: boolean;
	transparencyDirection?: string;
	transparencyLevel?: number;
	transparencyViewport?: RangeSliderValue;
	blurEnabled?: boolean;
	blurDirection?: string;
	blurLevel?: number;
	blurViewport?: RangeSliderValue;
	rotateEnabled?: boolean;
	rotateDirection?: string;
	rotateSpeed?: number;
	rotateViewport?: RangeSliderValue;
	scaleEnabled?: boolean;
	scaleDirection?: string;
	scaleSpeed?: number;
	scaleViewport?: RangeSliderValue;
	motionFxXAnchor?: string;
	motionFxYAnchor?: string;
	motionFxDevices?: string[];
	motionFxRange?: string;

	// Advanced Tab - Motion Effects - Mouse
	mouseEffectsEnabled?: boolean;
	mouseTrackEnabled?: boolean;
	mouseTrackDirection?: string;
	mouseTrackSpeed?: number;
	tiltEnabled?: boolean;
	tiltDirection?: string;
	tiltSpeed?: number;

	// Advanced Tab - Sticky
	sticky?: string;
	stickyOn?: string[];
	stickyOffset?: number;
	stickyOffset_tablet?: number;
	stickyOffset_mobile?: number;
	stickyEffectsOffset?: number;
	stickyEffectsOffset_tablet?: number;
	stickyEffectsOffset_mobile?: number;
	stickyAnchorOffset?: number;
	stickyAnchorOffset_tablet?: number;
	stickyAnchorOffset_mobile?: number;
	stickyParent?: boolean;

	// Advanced Tab - Entrance Animation
	entranceAnimation?: string;
	entranceAnimation_tablet?: string;
	entranceAnimation_mobile?: string;
	animationDuration?: string;
	animationDelay?: number;

	loginActiveTab?: string;
}

/**
 * Login form state
 */
export interface LoginFormState {
	username: string;
	password: string;
	showPassword: boolean;
}

/**
 * Register form state
 */
export interface RegisterFormState {
	showPassword: boolean;
	terms_agreed: boolean;
}

/**
 * Recovery form state
 */
export interface RecoverFormState {
	email: string;
	code: string;
	newPassword: string;
	confirmPassword: string;
	showPassword: boolean;
}

/**
 * Security update form state
 */
export interface SecurityUpdateFormState {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	newEmail: string;
	showPassword: boolean;
}

/**
 * Two-factor authentication state
 */
export interface TwoFactorFormState {
	code: string;
	trustDevice: boolean;
}

/**
 * Complete auth state
 */
export interface AuthState {
	screen: AuthScreen;
	pending: boolean;
	error: string | null;
	login: LoginFormState;
	register: RegisterFormState;
	recover: RecoverFormState;
	security: SecurityUpdateFormState;
	twofa: TwoFactorFormState;
	activeRole: RoleConfig | null;
}

/**
 * Props for shared LoginComponent
 */
export interface LoginComponentProps {
	attributes: LoginAttributes;
	config: AuthConfig | null;
	context: 'editor' | 'frontend';
	isLoading?: boolean;
}

/**
 * Props for screen components
 */
export interface ScreenProps {
	attributes: LoginAttributes;
	config: AuthConfig;
	state: AuthState;
	setState: React.Dispatch<React.SetStateAction<AuthState>>;
	onSubmit: (action: string, data: Record<string, unknown>) => Promise<void>;
}

/**
 * VxConfig structure saved in post_content
 */
export interface LoginVxConfig {
	previewScreen: AuthScreen;
	loginTitle: string;
	registerTitle: string;
	confirmTitle: string;
	passwordRecoveryTitle: string;
	confirmCodeTitle: string;
	newPasswordTitle: string;
	updatePasswordTitle: string;
	updateEmailTitle: string;
	welcomeTitle: string;
	roleSource: RoleSource;
	manualRoles: string[];
	icons: {
		google: IconConfig;
		signUp: IconConfig;
		username: IconConfig;
		password: IconConfig;
		eye: IconConfig;
		email: IconConfig;
		welcome: IconConfig;
		leftChevron: IconConfig;
		privacy: IconConfig;
		trash: IconConfig;
		logout: IconConfig;
		phone: IconConfig;
		link: IconConfig;
		calendar: IconConfig;
		taxonomy: IconConfig;
		upload: IconConfig;
		copy: IconConfig;
		cloud: IconConfig;
		device: IconConfig;
		shield: IconConfig;
	};
}

/**
 * Extend Window interface for global variables
 */
declare global {
	interface Window {
		voxelFseLogin?: {
			attributes: LoginAttributes;
			config: AuthConfig;
			nonce: string;
		};
	}
}
