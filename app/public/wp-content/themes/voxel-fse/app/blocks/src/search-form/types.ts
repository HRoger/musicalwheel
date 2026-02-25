/**
 * Search Form Block - TypeScript Interfaces
 *
 * @package VoxelFSE
 */

/**
 * Box Shadow configuration matching Elementor/WordPress patterns
 */
export interface BoxShadowConfig {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outline' | 'inset';
}

/**
 * Border configuration matching Elementor patterns
 */
export interface BorderConfig {
	type?: string; // 'default' | 'none' | 'solid' | 'double' | 'dotted' | 'dashed' | 'groove'
	width?: DimensionsConfig;
	color?: string;
}

export interface SearchFormAttributes {
	// Block ID
	blockId: string;

	// Content Tab
	postTypes: string[];
	/**
	 * Currently selected post type in the dropdown
	 * Used for editor preview syncing with Post Feed
	 */
	selectedPostType: string;
	/**
	 * Current filter values in the editor
	 * Used for editor preview syncing with Post Feed
	 * Only populated in editor context, not saved to post content
	 */
	editorFilterValues?: Record<string, unknown>;
	showPostTypeFilter: boolean;
	postTypeFilterWidth?: number;
	postTypeFilterWidth_tablet?: number;
	postTypeFilterWidth_mobile?: number;
	filterLists: Record<string, FilterConfig[]>;
	// Template settings per post type (Voxel search-form.php:453-472)
	// Dynamic attributes: cardTemplate_{postTypeKey}, mapTemplate_{postTypeKey}
	[key: string]: any; // Allow dynamic template attributes

	// General Tab
	generalTabOpenAccordion?: string;
	onSubmit: 'feed' | 'archive' | 'page';
	submitToPageId?: number;
	postToFeedId?: string;
	postToMapId?: string;
	mapAdditionalMarkers?: number;
	mapEnableClusters?: boolean;
	// Map/Feed Switcher (Content tab - lines 650-735 in search-form.php)
	mfSwitcherDesktop?: boolean;
	mfSwitcherDesktopDefault?: 'feed' | 'map';
	mfSwitcherTablet?: boolean;
	mfSwitcherTabletDefault?: 'feed' | 'map';
	mfSwitcherMobile?: boolean;
	mfSwitcherMobileDefault?: 'feed' | 'map';
	searchOn: 'change' | 'submit';
	updateUrl?: boolean;
	showSearchButton: boolean;
	searchButtonText: string;
	searchButtonIcon: IconConfig;
	searchButtonWidth?: number;
	searchButtonWidth_tablet?: number;
	searchButtonWidth_mobile?: number;
	searchButtonWidthUnit?: string;
	showResetButton: boolean;
	resetButtonText: string;
	resetButtonIcon: IconConfig;
	// Additional icons (lines 745-864 in search-form.php)
	searchInputIcon?: IconConfig;
	locationIcon?: IconConfig;
	myLocationIcon?: IconConfig;
	mapViewIcon?: IconConfig;
	listViewIcon?: IconConfig;
	calendarIcon?: IconConfig;
	minusIcon?: IconConfig;
	plusIcon?: IconConfig;
	dropdownIcon?: IconConfig;
	rightArrowIcon?: IconConfig;
	leftArrowIcon?: IconConfig;
	closeIcon?: IconConfig;
	trashIcon?: IconConfig;
	resetButtonWidth?: number;
	resetButtonWidth_tablet?: number;
	resetButtonWidth_mobile?: number;
	resetButtonWidthUnit?: string;
	toggleText?: string;
	toggleIcon?: IconConfig;

	// Inline Tab - Filter Styling
	filterBackground?: string;
	filterBackgroundHover?: string;
	filterTextColor?: string;
	filterTextColorHover?: string;
	filterTypography?: TypographyConfig;
	filterPadding?: DimensionsConfig;
	filterPadding_tablet?: DimensionsConfig;
	filterPadding_mobile?: DimensionsConfig;
	filterMargin?: DimensionsConfig;
	filterMargin_tablet?: DimensionsConfig;
	filterMargin_mobile?: DimensionsConfig;
	filterBorderRadius?: number;
	filterBorderRadius_tablet?: number;
	filterBorderRadius_mobile?: number;
	filterBorderWidth?: number;
	filterBorderWidth_tablet?: number;
	filterBorderWidth_mobile?: number;
	filterBorderColor?: string;
	filterGap?: number;
	filterGap_tablet?: number;
	filterGap_mobile?: number;

	// Inline Tab - Toggle Button Styling
	toggleBackground?: string;
	toggleBackgroundHover?: string;
	toggleTextColor?: string;
	toggleTextColorHover?: string;
	// Note: toggleIcon and toggleText are defined above in General Tab section

	// Inline Tab - Portal Styling
	portalBackground?: string;
	portalWidth?: {
		desktop?: number;
		tablet?: number;
		mobile?: number;
	};
	portalMaxHeight?: number;
	portalMaxHeight_tablet?: number;
	portalMaxHeight_mobile?: number;

	// Inline Tab - Search Button Styling
	searchButtonBackground?: string;
	searchButtonBackgroundHover?: string;
	searchButtonTextColor?: string;
	searchButtonTextColorHover?: string;
	searchButtonTypography?: TypographyConfig;
	searchButtonPadding?: DimensionsConfig;
	searchButtonBorderRadius?: number;
	searchButtonBorderRadius_tablet?: number;
	searchButtonBorderRadius_mobile?: number;

	// Inline Tab - Reset Button Styling
	resetButtonBackground?: string;
	resetButtonBackgroundHover?: string;
	resetButtonTextColor?: string;
	resetButtonTextColorHover?: string;

	// Advanced Tab
	blockMargin?: DimensionsConfig;
	blockMargin_tablet?: DimensionsConfig;
	blockMargin_mobile?: DimensionsConfig;
	blockPadding?: DimensionsConfig;
	blockPadding_tablet?: DimensionsConfig;
	blockPadding_mobile?: DimensionsConfig;
	hideDesktop?: boolean;
	hideTablet?: boolean;
	hideMobile?: boolean;
	customClasses?: string;
	customCSS?: string;

	// Border (Active tab state)
	borderActiveTab?: string;

	// Border (Normal state)
	borderType?: string;
	borderWidth?: DimensionsConfig;
	borderColor?: string;
	borderRadius?: DimensionsConfig;
	borderRadius_tablet?: DimensionsConfig;
	borderRadius_mobile?: DimensionsConfig;
	boxShadow?: any;

	// Border (Hover state)
	borderTypeHover?: string;
	borderWidthHover?: DimensionsConfig;
	borderColorHover?: string;
	borderRadiusHover?: DimensionsConfig;
	borderRadiusHover_tablet?: DimensionsConfig;
	borderRadiusHover_mobile?: DimensionsConfig;
	boxShadowHover?: any;
	transitionDuration?: number;

	// Layout Width (Advanced Tab)
	elementWidth?: string;
	elementWidth_tablet?: string;
	elementWidth_mobile?: string;
	elementCustomWidth?: number;
	elementCustomWidth_tablet?: number;
	elementCustomWidth_mobile?: number;
	elementCustomWidthUnit?: string;

	// Position (Advanced Tab)
	position?: string;
	offsetOrientationH?: string;
	offsetX?: number;
	offsetX_tablet?: number;
	offsetX_mobile?: number;
	offsetXUnit?: string;
	offsetXEnd?: number;
	offsetXEndUnit?: string;
	offsetOrientationV?: string;
	offsetY?: number;
	offsetY_tablet?: number;
	offsetY_mobile?: number;
	offsetYUnit?: string;
	offsetYEnd?: number;
	offsetYEndUnit?: string;

	// Z-Index responsive
	zIndex?: number;
	zIndex_tablet?: number;
	zIndex_mobile?: number;

	// Background (Advanced Tab)
	backgroundType?: string;
	backgroundColor?: string;
	backgroundImage?: { id?: number; url?: string };
	backgroundImage_tablet?: { id?: number; url?: string };
	backgroundImage_mobile?: { id?: number; url?: string };
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
	gradientSecondColor?: string;
	gradientSecondLocation?: number;
	gradientType?: string;
	gradientAngle?: number;
	gradientPosition?: string;
	backgroundActiveTab?: string;
	backgroundTypeHover?: string;
	backgroundColorHover?: string;
	backgroundImageHover?: { id?: number; url?: string };
	bgTransitionDuration?: number;

	// Transform (Advanced Tab)
	transformRotateZ?: number;
	transformRotateZ_tablet?: number;
	transformRotateZ_mobile?: number;
	transformRotateX?: number;
	transformRotateX_tablet?: number;
	transformRotateX_mobile?: number;
	transformRotateY?: number;
	transformRotateY_tablet?: number;
	transformRotateY_mobile?: number;
	transformOffsetX?: number;
	transformOffsetX_tablet?: number;
	transformOffsetX_mobile?: number;
	transformOffsetXUnit?: string;
	transformOffsetY?: number;
	transformOffsetY_tablet?: number;
	transformOffsetY_mobile?: number;
	transformOffsetYUnit?: string;
	transformScaleX?: number;
	transformScaleX_tablet?: number;
	transformScaleX_mobile?: number;
	transformScaleY?: number;
	transformScaleY_tablet?: number;
	transformScaleY_mobile?: number;
	transformSkewX?: number;
	transformSkewX_tablet?: number;
	transformSkewX_mobile?: number;
	transformSkewY?: number;
	transformSkewY_tablet?: number;
	transformSkewY_mobile?: number;
	transformFlipH?: boolean;
	transformFlipV?: boolean;

	// Mask (Advanced Tab)
	maskSwitch?: boolean;
	maskShape?: string;
	maskImage?: { id?: number; url?: string };
	maskImage_tablet?: { id?: number; url?: string };
	maskImage_mobile?: { id?: number; url?: string };
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

	// Motion Effects (Advanced Tab)
	motionFxScrollingEnabled?: boolean;
	motionFxScrollingEffect?: string;
	motionFxScrollingSpeed?: number;
	motionFxMouseEnabled?: boolean;
	motionFxMouseEffect?: string;
	motionFxMouseSpeed?: number;

	// Custom Attributes (Advanced Tab)
	customAttributes?: string;
	elementId?: string;
	overflow?: string;
	opacity?: number;

	// Voxel Tab
	voxelIntegration?: boolean;
	formToggleDesktop?: boolean;
	formToggleTablet?: boolean;
	formToggleMobile?: boolean;
	portalMode?: {
		desktop: boolean;
		tablet: boolean;
		mobile: boolean;
	};
	adaptiveFiltering?: boolean;

	// Voxel Tab - Widget options: Sticky position
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

	// Voxel Tab - Visibility accordion
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: Array<{
		id: string;
		type: string;
		group?: string;
		condition?: string;
		value?: string;
	}>;

	// Voxel Tab - Loop element accordion
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string | number;
	loopOffset?: string | number;

	// ==================================
	// General Tab - 11 Accordion Sections
	// Source: search-form.php:912-3960
	// ==================================

	// 1. General Section
	showLabels?: boolean;
	labelTypography?: TypographyConfig;
	labelColor?: string;

	// 2. Common Styles Section (Normal/Hover)
	commonHeight?: number;
	commonHeight_tablet?: number;
	commonHeight_mobile?: number;
	commonIconSize?: number;
	commonIconSize_tablet?: number;
	commonIconSize_mobile?: number;
	commonBorderRadius?: number;
	commonBorderRadius_tablet?: number;
	commonBorderRadius_mobile?: number;
	commonBorderRadiusUnit?: string;
	commonBoxShadow?: BoxShadowConfig;
	commonBorder?: BorderConfig;
	commonBackgroundColor?: string;
	commonTextColor?: string;
	commonIconColor?: string;
	commonTypography?: TypographyConfig;
	hideChevron?: boolean;
	chevronColor?: string;
	// Hover state
	commonBoxShadowHover?: BoxShadowConfig;
	commonBorderColorHover?: string;
	commonBackgroundColorHover?: string;
	commonTextColorHover?: string;
	commonIconColorHover?: string;
	chevronColorHover?: string;

	// 3. Button Section (Normal/Filled)
	buttonPadding?: DimensionsConfig;
	buttonPadding_tablet?: DimensionsConfig;
	buttonPadding_mobile?: DimensionsConfig;
	buttonIconSpacing?: number;
	buttonIconSpacing_tablet?: number;
	buttonIconSpacing_mobile?: number;
	// Filled state
	buttonFilledTypography?: TypographyConfig;
	buttonFilledBackground?: string;
	buttonFilledTextColor?: string;
	buttonFilledIconColor?: string;
	buttonFilledBorderColor?: string;
	buttonFilledBorderWidth?: number;
	buttonFilledBorderWidthUnit?: string;
	buttonFilledBoxShadow?: BoxShadowConfig;
	buttonFilledChevronColor?: string;

	// 4. Input Section (Normal/Focus)
	inputTextColor?: string;
	inputPlaceholderColor?: string;
	inputPadding?: DimensionsConfig;
	inputPadding_tablet?: DimensionsConfig;
	inputPadding_mobile?: DimensionsConfig;
	inputIconSideMargin?: number;
	inputIconSideMargin_tablet?: number;
	inputIconSideMargin_mobile?: number;
	// Focus state
	inputBackgroundColorFocus?: string;
	inputBorderColorFocus?: string;
	inputBoxShadowFocus?: BoxShadowConfig;

	// 5. Search Button Section (Normal/Hover)
	searchBtnColor?: string;
	searchBtnIconColor?: string;
	searchBtnBackgroundColor?: string;
	searchBtnBorder?: BorderConfig;
	searchBtnBoxShadow?: BoxShadowConfig;
	// Hover state
	searchBtnTextColorHover?: string;
	searchBtnIconColorHover?: string;
	searchBtnBackgroundColorHover?: string;
	searchBtnBorderColorHover?: string;
	searchBtnBoxShadowHover?: BoxShadowConfig;

	// 6. Toggle Button Section (Normal/Hover/Filled)
	toggleBtnTypography?: TypographyConfig;
	toggleBtnBorderRadius?: number;
	toggleBtnBorderRadius_tablet?: number;
	toggleBtnBorderRadius_mobile?: number;
	toggleBtnBorderRadiusUnit?: string;
	toggleBtnTextColor?: string;
	toggleBtnPadding?: DimensionsConfig;
	toggleBtnPadding_tablet?: DimensionsConfig;
	toggleBtnPadding_mobile?: DimensionsConfig;
	toggleBtnBackgroundColor?: string;
	toggleBtnBorder?: BorderConfig;
	toggleBtnIconSize?: number;
	toggleBtnIconSize_tablet?: number;
	toggleBtnIconSize_mobile?: number;
	toggleBtnIconSpacing?: number;
	toggleBtnIconSpacing_tablet?: number;
	toggleBtnIconSpacing_mobile?: number;
	toggleBtnIconColor?: string;
	// Hover state
	toggleBtnTextColorHover?: string;
	toggleBtnBackgroundColorHover?: string;
	toggleBtnBorderColorHover?: string;
	toggleBtnIconColorHover?: string;
	// Filled state
	toggleBtnTextColorFilled?: string;
	toggleBtnBackgroundColorFilled?: string;
	toggleBtnBorderColorFilled?: string;
	toggleBtnIconColorFilled?: string;
	toggleBtnBoxShadowFilled?: BoxShadowConfig;

	// 7. Toggle: Active Count Section
	activeCountTextColor?: string;
	activeCountBackgroundColor?: string;
	activeCountRightMargin?: number;
	activeCountRightMargin_tablet?: number;
	activeCountRightMargin_mobile?: number;

	// 8. Map/Feed Switcher Section (Normal/Hover)
	mapSwitcherAlign?: string;
	mapSwitcherBottomMargin?: number;
	mapSwitcherBottomMargin_tablet?: number;
	mapSwitcherBottomMargin_mobile?: number;
	mapSwitcherSideMargin?: number;
	mapSwitcherSideMargin_tablet?: number;
	mapSwitcherSideMargin_mobile?: number;
	mapSwitcherTypography?: TypographyConfig;
	mapSwitcherColor?: string;
	mapSwitcherBackgroundColor?: string;
	mapSwitcherHeight?: number;
	mapSwitcherHeight_tablet?: number;
	mapSwitcherHeight_mobile?: number;
	mapSwitcherPadding?: DimensionsConfig;
	mapSwitcherPadding_tablet?: DimensionsConfig;
	mapSwitcherPadding_mobile?: DimensionsConfig;
	mapSwitcherBorder?: BorderConfig;
	mapSwitcherBorderRadius?: number;
	mapSwitcherBorderRadius_tablet?: number;
	mapSwitcherBorderRadius_mobile?: number;
	mapSwitcherBoxShadow?: BoxShadowConfig;
	mapSwitcherIconSpacing?: number;
	mapSwitcherIconSpacing_tablet?: number;
	mapSwitcherIconSpacing_mobile?: number;
	mapSwitcherIconSize?: number;
	mapSwitcherIconSize_tablet?: number;
	mapSwitcherIconSize_mobile?: number;
	mapSwitcherIconColor?: string;
	// Hover state
	mapSwitcherColorHover?: string;
	mapSwitcherBackgroundColorHover?: string;
	mapSwitcherBorderColorHover?: string;
	mapSwitcherIconColorHover?: string;

	// 9. Term Count Section
	termCountNumberColor?: string;
	termCountBorderColor?: string;

	// 10. Other Section
	maxFilterWidth?: number;
	maxFilterWidth_tablet?: number;
	maxFilterWidth_mobile?: number;
	minInputWidth?: number;
	minInputWidth_tablet?: number;
	minInputWidth_mobile?: number;

	// 11. Popups: Custom Style Section
	popupCustomStyleEnabled?: boolean;
	popupBackdropBackground?: string;
	popupBackdropPointerEvents?: boolean;
	popupBoxShadow?: BoxShadowConfig;
	popupTopBottomMargin?: number;
	popupTopBottomMargin_tablet?: number;
	popupTopBottomMargin_mobile?: number;
	popupAutosuggestTopMargin?: number;
	popupAutosuggestTopMargin_tablet?: number;
	popupAutosuggestTopMargin_mobile?: number;

	// ==================================
	// Inline Tab - 9 Accordion Sections
	// Source: Elementor Inspector Screenshots
	// ==================================

	// 1. Terms: Inline Section (Normal/Hover/Selected)
	termsInlineActiveTab?: string;
	// Normal state
	termsInlineTitleColor?: string;
	termsInlineTitleTypographyNormal?: TypographyConfig;
	termsInlineIconColor?: string;
	termsInlineIconSize?: number;
	termsInlineIconSize_tablet?: number;
	termsInlineIconSize_mobile?: number;
	termsInlineIconSizeUnit?: string;
	termsInlineInnerGap?: number;
	termsInlineInnerGap_tablet?: number;
	termsInlineInnerGap_mobile?: number;
	termsInlineChevronColor?: string;
	// Hover state
	termsInlineTitleColorHover?: string;
	termsInlineIconColorHover?: string;
	// Selected state
	termsInlineTitleTypographySelected?: TypographyConfig;
	termsInlineTitleColorSelected?: string;
	termsInlineIconColorSelected?: string;
	termsInlineChevronColorSelected?: string;

	// 2. Terms: Buttons Section (Normal/Selected)
	termsButtonsActiveTab?: string;
	termsButtonsGap?: number;
	termsButtonsGap_tablet?: number;
	termsButtonsGap_mobile?: number;
	termsButtonsBackground?: string;
	termsButtonsBorderType?: string;
	termsButtonsBorderRadius?: number;
	termsButtonsBorderRadius_tablet?: number;
	termsButtonsBorderRadius_mobile?: number;
	termsButtonsTypography?: TypographyConfig;
	termsButtonsTextColor?: string;
	termsButtonsBackgroundSelected?: string;
	termsButtonsColorSelected?: string;
	termsButtonsBorderColorSelected?: string;
	termsButtonsBoxShadowSelected?: BoxShadowConfig;

	// 3. Geolocation Icon Section (Normal/Hover)
	geoIconActiveTab?: string;
	geoIconRightMargin?: number;
	geoIconRightMargin_tablet?: number;
	geoIconRightMargin_mobile?: number;
	geoIconButtonSize?: number;
	geoIconButtonSize_tablet?: number;
	geoIconButtonSize_mobile?: number;
	geoIconButtonSizeUnit?: string;
	geoIconButtonIconColor?: string;
	geoIconButtonIconSize?: number;
	geoIconButtonIconSize_tablet?: number;
	geoIconButtonIconSize_mobile?: number;
	geoIconButtonIconSizeUnit?: string;
	geoIconButtonBackground?: string;
	geoIconButtonBorderType?: string;
	geoIconButtonBorderRadius?: number;
	geoIconButtonBorderRadius_tablet?: number;
	geoIconButtonBorderRadius_mobile?: number;
	geoIconButtonBorderRadiusUnit?: string;
	geoIconButtonIconColorHover?: string;
	geoIconButtonBackgroundHover?: string;
	geoIconButtonBorderColorHover?: string;

	// 4. Stepper Section
	stepperInputValueSize?: number;

	// 5. Stepper Buttons Section (Normal/Hover)
	stepperButtonsActiveTab?: string;
	stepperButtonsSize?: number;
	stepperButtonsSize_tablet?: number;
	stepperButtonsSize_mobile?: number;
	stepperButtonsSizeUnit?: string;
	stepperButtonsIconColor?: string;
	stepperButtonsIconSize?: number;
	stepperButtonsIconSize_tablet?: number;
	stepperButtonsIconSize_mobile?: number;
	stepperButtonsIconSizeUnit?: string;
	stepperButtonsBackground?: string;
	stepperButtonsBorderType?: string;
	stepperButtonsBorderRadius?: number;
	stepperButtonsBorderRadius_tablet?: number;
	stepperButtonsBorderRadius_mobile?: number;
	stepperButtonsBorderRadiusUnit?: string;
	stepperButtonsIconColorHover?: string;
	stepperButtonsBackgroundHover?: string;
	stepperButtonsBorderColorHover?: string;

	// 6. Range Slider Section
	rangeValueSize?: number;
	rangeValueColor?: string;
	rangeBackground?: string;
	rangeSelectedBackground?: string;
	rangeHandleBackground?: string;
	rangeBorderType?: string;

	// 7. Switcher Section
	switcherBackgroundInactive?: string;
	switcherBackgroundActive?: string;
	switcherHandleBackground?: string;

	// 8. Checkbox Section
	checkboxSize?: number;
	checkboxSize_tablet?: number;
	checkboxSize_mobile?: number;
	checkboxRadius?: number;
	checkboxRadius_tablet?: number;
	checkboxRadius_mobile?: number;
	checkboxBorderType?: string;
	checkboxBackgroundUnchecked?: string;
	checkboxBackgroundChecked?: string;
	checkboxBorderColorChecked?: string;

	// 9. Radio Section
	radioSize?: number;
	radioSize_tablet?: number;
	radioSize_mobile?: number;
	radioRadius?: number;
	radioRadius_tablet?: number;
	radioRadius_mobile?: number;
	radioBorderType?: string;
	radioBackgroundUnchecked?: string;
	radioBackgroundChecked?: string;
	radioBorderColorChecked?: string;
}

export interface FilterConfig {
	id: string;
	filterKey: string;
	type: FilterType;
	label: string;
	icon?: IconConfig;
	placeholder?: string;

	// Default value settings
	defaultValueEnabled?: boolean;
	defaultValue?: unknown;
	resetValue?: 'empty' | 'default_value';

	// Filter-type-specific default value settings
	// Evidence: themes/voxel/app/post-types/filters/*.php - get_elementor_controls()

	// Availability/Date/Recurring-date filter default value type
	defaultValueType?: 'date' | 'preset';
	defaultStartDate?: string; // YYYY-MM-DD or @tags() wrapped
	defaultEndDate?: string; // YYYY-MM-DD or @tags() wrapped
	defaultPreset?: string; // Preset key (upcoming, today, etc.)

	// Location filter default values
	defaultAddress?: string; // Address text or @tags() wrapped
	defaultMethod?: 'area' | 'radius';
	// Radius search defaults
	defaultLat?: string; // Latitude or @tags() wrapped
	defaultLng?: string; // Longitude or @tags() wrapped
	defaultRadius?: string; // Radius or @tags() wrapped
	// Area search defaults
	defaultSwLat?: string; // Southwest latitude
	defaultSwLng?: string; // Southwest longitude
	defaultNeLat?: string; // Northeast latitude
	defaultNeLng?: string; // Northeast longitude

	// Display settings
	// Filter-type specific options:
	// - keywords, stepper: popup | inline
	// - terms: popup | inline | buttons
	// - range: popup | inline | minmax
	// - order-by: popup | buttons | alt-btn | post-feed
	// - post-status: popup | buttons
	// - location: popup | inline
	displayAs?: 'popup' | 'inline' | 'buttons' | 'minmax' | 'alt-btn' | 'post-feed';

	// Label override (Voxel: ts_repeater_label)
	labelOverride?: string;

	// Filter-type specific settings:
	// Terms filter
	hideEmptyTerms?: boolean;
	termsColumns?: number;
	termsColumns_tablet?: number;
	termsColumns_mobile?: number;

	// Order-by filter
	orderByChoices?: string[];

	// Post-status filter
	postStatusChoices?: string[];

	// Location filter
	displayProximityAs?: 'popup' | 'inline' | 'none';
	defaultSearchMethod?: 'area' | 'radius';

	// Switcher filter
	openInPopup?: boolean;

	// Visual settings
	width?: number;
	width_tablet?: number;
	width_mobile?: number;
	hideFilter?: boolean;
	alignContent?: 'flex-start' | 'center' | 'flex-end';
	alignContent_tablet?: 'flex-start' | 'center' | 'flex-end';
	alignContent_mobile?: 'flex-start' | 'center' | 'flex-end';
	hideLabel?: boolean;

	// Popup settings
	customPopupEnabled?: boolean;
	popupMinWidth?: number;
	popupMinWidth_tablet?: number;
	popupMinWidth_mobile?: number;
	popupMaxWidth?: number;
	popupMaxWidth_tablet?: number;
	popupMaxWidth_mobile?: number;
	popupMaxHeight?: number;
	popupMaxHeight_tablet?: number;
	popupMaxHeight_mobile?: number;
	popupCenterPosition?: boolean;
	popupMenuColumnsEnabled?: boolean;
	popupMenuColumns?: number;
	popupMenuColumns_tablet?: number;
	popupMenuColumns_mobile?: number;
	popupMenuColumnGap?: number;
	popupMenuColumnGap_tablet?: number;
	popupMenuColumnGap_mobile?: number;

	// Row visibility / conditional logic
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];

	// Type-specific props
	[key: string]: unknown;
}

export interface VisibilityRule {
	id: string;
	filterKey: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
	value?: string;
}

/**
 * Filter types matching Voxel's component registry
 * Reference: voxel-search-form.beautified.js lines 3081-3100
 */
export type FilterType =
	| 'keywords'
	| 'range'
	| 'stepper'
	| 'terms'
	| 'location'
	| 'availability'
	| 'date'
	| 'recurring-date'
	| 'open-now'
	| 'order-by'
	| 'post-status'
	| 'user'
	| 'relations'
	| 'following'
	| 'followed-by'      // filter-followed-by (same component as following)
	| 'following-user'   // filter-following-user (same component as followed-by)
	| 'following-post'   // filter-following-post
	| 'switcher'
	| 'ui-heading';

/**
 * Card template option for Preview card template / Map popup template dropdowns
 * Evidence: themes/voxel/app/widgets/search-form.php:447-472
 */
export interface CardTemplate {
	id: string;
	label: string;
}

export interface PostTypeConfig {
	key: string;
	label: string;
	singular: string;
	plural: string;
	// Icon HTML markup from Voxel's get_icon_markup()
	icon?: string;
	filters: FilterData[];
	// Card templates for Preview card template and Map popup template dropdowns
	// Evidence: themes/voxel/app/widgets/search-form.php:453-472
	templates?: CardTemplate[];
}

export interface FilterData {
	key: string;
	label: string;
	type: FilterType;
	// Icon HTML markup from Voxel's get_icon_markup()
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	icon?: string;
	props: Record<string, unknown>;
	// Current filter value (set via set_value() before frontend_props())
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:101
	// 'value' => $is_valid_value ? $this->get_value() : null
	value?: unknown;
	// Value to reset to on form clear (when resetValue === 'default_value')
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:103
	// 'resets_to' => $this->parse_value( $this->resets_to )
	resets_to?: unknown;
	// Description text shown below the heading
	// Evidence: base-filter.php:99 get_frontend_config() returns description
	description?: string;
}

export interface SearchFormState {
	currentPostType: string;
	filterValues: Record<string, unknown>;
	activeFilterCount: number;
	portalActive: boolean;
	loading: boolean;
	resetting: boolean;
	/** Narrowed values from adaptive filtering AJAX response */
	narrowedValues: NarrowedValues | null;
	/** Whether adaptive filtering request is in progress */
	narrowingFilters: boolean;
	/**
	 * Track which filter was last modified (Voxel optimization)
	 * Used to optimize adaptive filtering - backend only recalculates affected filters
	 * Reference: voxel-search-form.beautified.js lines 1510-1522
	 */
	lastModifiedFilter: string | null;
}

/**
 * Adaptive Filtering - Narrowed Values
 *
 * When adaptiveFiltering is enabled, filters can dynamically update their
 * ranges and available options based on current search results.
 *
 * Reference: voxel-search-form.beautified.js lines 480-550, 1216-1238
 *
 * Voxel AJAX endpoint: ?vx=1&action=search.narrow_filters
 */
export interface NarrowedValues {
	/**
	 * Narrowed range values for range filters
	 * Key: filter key, Value: { min, max } based on current results
	 */
	ranges: Record<string, NarrowedRange>;
	/**
	 * Narrowed term availability for terms filters
	 * Key: taxonomy key, Value: { term_taxonomy_id: count }
	 */
	terms: Record<string, Record<number, number>>;
}

export interface NarrowedRange {
	min: number;
	max: number;
}

export interface IconConfig {
	library: 'icon' | 'svg' | '';
	value: string;
}

export interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSize_tablet?: number;
	fontSize_mobile?: number;
	fontWeight?: string;
	lineHeight?: number;
	letterSpacing?: number;
	textTransform?: string;
}

export interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	linked?: boolean;
}

export interface FilterComponentProps {
	config: FilterConfig;
	filterData: FilterData;
	value: unknown;
	onChange: (value: unknown) => void;
	/** Narrowed values for adaptive filtering (optional) */
	narrowedValues?: NarrowedValues | null;
	/** Whether adaptive filtering is in progress */
	isNarrowing?: boolean;
	/** Block ID for scoping popup styles via className (portal elements) */
	blockId?: string;
	/** Context: 'editor' or 'frontend' - determines value source of truth */
	context?: 'editor' | 'frontend';
	/**
	 * All current filter values - for cross-filter access
	 * Evidence: Voxel's $root.getLocationFilter() lets order-by access location filter
	 * Only passed to filters that need cross-filter communication (order-by)
	 */
	allFilterValues?: Record<string, unknown>;
	/**
	 * All filter data for current post type - for cross-filter access
	 * Used to find the location filter's key by type
	 */
	allFiltersData?: FilterData[];
	/**
	 * Post feed element ID for post-feed display mode teleport
	 * Evidence: order-by-filter.php:31 teleports to postFeedId element
	 */
	postFeedId?: string;
}

// Extend Window interface for global variables
declare global {
	interface Window {
		stackableVersion?: string;
		voxelFseSearchForm?: {
			attributes: SearchFormAttributes;
			postTypes: PostTypeConfig[];
			ajaxUrl: string;
			nonce: string;
		};
	}
}
