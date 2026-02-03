/**
 * Popup Kit Block - TypeScript Interfaces
 * 
 * Defines all types for the popup-kit block following Plan C+ architecture.
 */

export interface PopupKitAttributes {
    // General
    popupId: string;
    title: string;
    icon: string;
    showSave: boolean;
    showClear: boolean;
    showClearMobile: boolean;
    showClose: boolean;
    clearLabel: string;
    saveLabel: string;
    wrapperClass: string;
    controllerClass: string;

    // Popup General
    pgBackground: string;
    pgTopMargin?: number;
    pgTopMargin_tablet?: number;
    pgTopMargin_mobile?: number;
    pgShadow?: any;
    pgBorder?: {
        type: string;
        width: number;
        color: string;
    };
    pgRadius?: number;
    pgRadius_tablet?: number;
    pgRadius_mobile?: number;
    pgScrollColor: string;
    disableRevealFx: boolean;
    pgTitleSeparator: string;

    // Colors
    elementorAccent: string;
    elementorPrimary: string;
    elementorText: string;
    elementorFontFamily: string;
    tsAccent1: string;
    tsAccent2: string;

    // Popup Head
    phIconSize?: number;
    phIconSize_tablet?: number;
    phIconSize_mobile?: number;
    phIconSpacing?: number;
    phIconSpacing_tablet?: number;
    phIconSpacing_mobile?: number;
    phIconColor: string;
    phTitleColor: string;
    phTitleFontFamily: string;
    phTitleFontSize?: any;
    phTitleFontWeight: string;
    phTitleLineHeight?: any;
    phAvatarSize?: number;
    phAvatarSize_tablet?: number;
    phAvatarSize_mobile?: number;
    phAvatarRadius?: number;
    phAvatarRadius_tablet?: number;
    phAvatarRadius_mobile?: number;
    phAvatarRadiusUnit: string;

    // Buttons
    pbTypo?: any;
    pbRadius?: number;
    pbRadius_tablet?: number;
    pbRadius_mobile?: number;
    pbButton1Bg?: string;
    pbButton1Text?: string;
    pbButton1Icon?: string;
    pbButton1Icon_tablet?: string;
    pbButton1Icon_mobile?: string;
    pbButton1Border?: any;
    pbButton2Bg?: string;
    pbButton2Text?: string;
    pbButton2Icon?: string;
    pbButton2Icon_tablet?: string;
    pbButton2Icon_mobile?: string;
    pbButton2Border?: any;
    pbButton1HoverBg?: string;
    pbButton1HoverText?: string;
    pbButton1HoverBorder?: string;
    pbButton2HoverBg?: string;
    pbButton2HoverText?: string;
    pbButton2HoverBorder?: string;
    pbButton3Bg?: string;
    pbButton3Text?: string;
    pbButton3Icon?: string;
    pbButton3Icon_tablet?: string;
    pbButton3Icon_mobile?: string;
    pbButton3HoverBg?: string;
    pbButton3HoverText?: string;

    // Labels
    plLabelTypo?: any;
    plLabelColor?: string;
    plLabelColor_tablet?: string;
    plLabelColor_mobile?: string;
    plDescTypo?: any;
    plDescColor?: string;
    plDescColor_tablet?: string;
    plDescColor_mobile?: string;

    // Menu
    pmItemPadding?: any;
    pmItemPaddingLinked: boolean;
    pmItemHeight?: number;
    pmItemHeight_tablet?: number;
    pmItemHeight_mobile?: number;
    pmSeparatorColor?: string;
    pmTitleColor?: string;
    pmTitleTypo?: any;
    pmIconColor?: string;
    pmIconSize?: number;
    pmIconSize_tablet?: number;
    pmIconSize_mobile?: number;
    pmIconSpacing?: number;
    pmIconSpacing_tablet?: number;
    pmIconSpacing_mobile?: number;
    pmChevronColor?: string;
    pmHoverBg?: string;
    pmHoverTitleColor?: string;
    pmHoverIconColor?: string;
    pmSelectedTitleTypo?: any;
    pmSelectedTitleColor?: string;
    pmSelectedIconColor?: string;
    pmParentTitleTypo?: any;

    // Choices
    pcItemSpacing?: number;
    pcItemSpacing_tablet?: number;
    pcItemSpacing_mobile?: number;
    pcItemContentSpacing?: number;
    pcItemContentSpacing_tablet?: number;
    pcItemContentSpacing_mobile?: number;
    pcPictureSize?: number;
    pcPictureSize_tablet?: number;
    pcPictureSize_mobile?: number;
    pcPictureRadius?: number;
    pcPictureRadius_tablet?: number;
    pcPictureRadius_mobile?: number;
    pcTitleTypo?: any;
    pcTitleColor?: string;
    pcSubtitleTypo?: any;
    pcSubtitleColor?: string;

    // Subtotal
    psSubtotalTypo?: any;
    psSubtotalTypoFontFamily?: string;
    psSubtotalColor?: string;

    // No Results (pn prefix)
    pnIconSize: number;
    pnIconSize_tablet?: number;
    pnIconSize_mobile?: number;
    pnIconColor?: string;
    pnTitleColor?: string;
    pnTitleTypo?: any;
    pnTitleTypoFontFamily?: string;

    // Notifications (pnot prefix)
    pnotTitleColor?: string;
    pnotTitleTypo?: any;
    pnotSubtitleColor?: string;
    pnotSubtitleTypo?: any;
    pnotIconColor?: string;
    pnotIconBg?: string;
    pnotIconSize?: number;
    pnotIconSize_tablet?: number;
    pnotIconSize_mobile?: number;
    pnotIconSizeUnit?: string;
    pnotIconContainerSize?: number;
    pnotIconContainerSize_tablet?: number;
    pnotIconContainerSize_mobile?: number;
    pnotIconContainerSizeUnit?: string;
    pnotBorderRadius?: number;
    pnotBorderRadius_tablet?: number;
    pnotBorderRadius_mobile?: number;
    pnotBorderRadiusUnit?: string;
    pnotUnvisitedTitleTypo?: any;
    pnotUnvisitedTitleColor?: string;
    pnotUnseenIconColor?: string;
    pnotUnseenIconBg?: string;
    pnotUnseenBorder?: any;
    pnotUnseenBorderWidth?: number;
    pnotUnseenBorderWidth_tablet?: number;
    pnotUnseenBorderWidth_mobile?: number;
    pnotBgHover?: string;
    pnotTitleColorHover?: string;
    pnotSubtitleColorHover?: string;
    pnotIconColorHover?: string;
    pnotIconBgHover?: string;
    pnotIconBorderHover?: string;

    // Checkboxes
    pcCheckboxSize?: number;
    pcCheckboxSize_tablet?: number;
    pcCheckboxSize_mobile?: number;
    pcCheckboxRadius?: number;
    pcCheckboxRadius_tablet?: number;
    pcCheckboxRadius_mobile?: number;
    pcCheckboxBorder?: any;
    pcCheckboxBorderWidth?: number;
    pcCheckboxBorderWidth_tablet?: number;
    pcCheckboxBorderWidth_mobile?: number;
    pcCheckboxBgUnchecked?: string;
    pcCheckboxBgChecked?: string;
    pcCheckboxBorderChecked?: string;

    // Radio buttons
    prRadioSize?: number;
    prRadioSize_tablet?: number;
    prRadioSize_mobile?: number;
    prRadioRadius?: number;
    prRadioRadius_tablet?: number;
    prRadioRadius_mobile?: number;
    prRadioBorder?: any;
    prRadioBorderWidth?: number;
    prRadioBorderWidth_tablet?: number;
    prRadioBorderWidth_mobile?: number;
    prRadioBgUnchecked?: string;
    prRadioBgChecked?: string;
    prRadioBorderChecked?: string;

    // Inputs
    piInputHeight?: number;
    piInputHeight_tablet?: number;
    piInputHeight_mobile?: number;
    piInputHeightUnit: string;
    piInputTypo?: any;
    piInputTypoFontFamily?: string;
    piInputPadding?: any;
    piInputPaddingLinked: boolean;
    piInputPaddingIcon?: any;
    piInputPaddingIconLinked: boolean;
    piInputValueColor?: string;
    piInputPlaceholderColor?: string;
    piIconColor?: string;
    piIconSize?: number;
    piIconSize_tablet?: number;
    piIconSize_mobile?: number;
    piIconSizeUnit: string;
    piIconLeftMargin?: number;
    piIconLeftMargin_tablet?: number;
    piIconLeftMargin_mobile?: number;
    piIconLeftMarginUnit: string;

    // File Upload
    pfItemGap?: number;
    pfItemGap_tablet?: number;
    pfItemGap_mobile?: number;
    pfIconColor?: string;
    pfIconSize?: number;
    pfIconSize_tablet?: number;
    pfIconSize_mobile?: number;
    pfBackground?: string;
    pfBorder?: any;
    pfBorderWidth?: number;
    pfBorderWidth_tablet?: number;
    pfBorderWidth_mobile?: number;
    pfBorderRadius?: number;
    pfBorderRadius_tablet?: number;
    pfBorderRadius_mobile?: number;
    pfBorderRadiusUnit: string;
    pfTypo?: any;
    pfTypoFontFamily?: string;
    pfTextColor?: string;
    pfAddedBorderRadius?: number;
    pfAddedBorderRadius_tablet?: number;
    pfAddedBorderRadius_mobile?: number;
    pfAddedBorderRadiusUnit: string;
    pfAddedBackground?: string;
    pfAddedIconColor?: string;
    pfAddedIconSize?: number;
    pfAddedIconSize_tablet?: number;
    pfAddedIconSize_mobile?: number;
    pfAddedIconSizeUnit: string;
    pfAddedTypo?: any;
    pfAddedTypoFontFamily?: string;
    pfAddedTextColor?: string;
    pfRemoveBackground?: string;
    pfRemoveBackgroundHover?: string;
    pfRemoveColor?: string;
    pfRemoveColorHover?: string;
    pfRemoveBorderRadius?: number;
    pfRemoveBorderRadius_tablet?: number;
    pfRemoveBorderRadius_mobile?: number;
    pfRemoveBorderRadiusUnit: string;
    pfRemoveSize?: number;
    pfRemoveSize_tablet?: number;
    pfRemoveSize_mobile?: number;
    pfRemoveIconSize?: number;
    pfRemoveIconSize_tablet?: number;
    pfRemoveIconSize_mobile?: number;
    pfIconColorHover?: string;
    pfBackgroundHover?: string;
    pfBorderColorHover?: string;
    pfTextColorHover?: string;
    pfActiveTab: string;

    // Number Input
    pnNumberInputSize: number;
    pnNumberInputSize_tablet?: number;
    pnNumberInputSize_mobile?: number;
    pnNumberInputSizeUnit: string;

    // Range
    prRangeValueSize: number;
    prRangeValueSize_tablet?: number;
    prRangeValueSize_mobile?: number;
    prRangeValueSizeUnit: string;
    prRangeValueColor?: string;
    prRangeBg?: string;
    prRangeBgSelected?: string;
    prRangeHandleBg?: string;
    prRangeHandleBorder?: any;
    prRangeHandleBorderWidth?: number;
    prRangeHandleBorderWidth_tablet?: number;
    prRangeHandleBorderWidth_mobile?: number;

    // Textarea
    ptextHeight?: number;
    ptextHeight_tablet?: number;
    ptextHeight_mobile?: number;
    ptextHeightUnit: string;
    ptextTypo?: any;
    ptextTypoFontFamily?: string;
    ptextValueColor?: string;
    ptextPlaceholderColor?: string;
    ptextPadding?: any;
    ptextPaddingLinked: boolean;
    ptextBorder?: any;
    ptextBorderWidth?: number;
    ptextBorderWidth_tablet?: number;
    ptextBorderWidth_mobile?: number;
    ptextBorderRadius?: number;
    ptextBorderRadius_tablet?: number;
    ptextBorderRadius_mobile?: number;
    ptextBorderRadiusUnit: string;
    ptextBg?: string;
    ptextBgFocus?: string;
    ptextTextColor?: string;
    ptextBgHover?: string;

    // Alerts
    palertShadow?: any;
    palertBorder?: any;
    palertBorderWidth?: number;
    palertBorderWidth_tablet?: number;
    palertBorderWidth_mobile?: number;
    palertBg?: string;
    palertDividerColor?: string;
    palertInfoColor?: string;
    palertErrorColor?: string;
    palertSuccessColor?: string;
    palertRadius?: number;
    palertRadius_tablet?: number;
    palertRadius_mobile?: number;
    palertRadiusUnit?: string;
    palertIconSize?: number;
    palertIconSize_tablet?: number;
    palertIconSize_mobile?: number;
    palertIconSizeUnit: string;
    palertIconColor?: string;
    palertTextColor?: string;
    palertTypo?: any;
    palertTextTypo?: any;
    palertTextTypoFontFamily?: string;
    palertLinkTypo?: any;
    palertLinkTypoFontFamily?: string;
    palertLinkColor?: string;
    palertLinkColorHover?: string;
    palertLinkBgHover?: string;

    // Datepicker Head
    pdhIconSize?: number;
    pdhIconSize_tablet?: number;
    pdhIconSize_mobile?: number;
    pdhIconSizeUnit?: string;
    pdhIconColor?: string;
    pdhIconSpacing?: number;
    pdhIconSpacing_tablet?: number;
    pdhIconSpacing_mobile?: number;
    pdhIconSpacingUnit?: string;
    pdhTitleColor?: string;
    pdhTitleTypo?: any;
    pdhSubtitleColor?: string;
    pdhSubtitleTypo?: any;

    // Datepicker Tooltips
    pdtBgColor?: string;
    pdtTextColor?: string;
    pdtRadius?: number;
    pdtRadius_tablet?: number;
    pdtRadius_mobile?: number;
    pdtRadiusUnit?: string;

    // Calendar
    pcalMonthsTypo?: any;
    pcalMonthsColor?: string;
    pcalDaysTypo?: any;
    pcalDaysColor?: string;
    pcalAvailableTypo?: any;
    pcalAvailableColor?: string;
    pcalAvailableColorHover?: string;
    pcalAvailableBgHover?: string;
    pcalAvailableBorderHover?: string;
    pcalRangeColor?: string;
    pcalRangeBg?: string;
    pcalRangeStartEndColor?: string;
    pcalRangeStartEndBg?: string;
    pcalSelectedColor?: string;
    pcalSelectedBg?: string;
    pcalDisabledTypo?: any;
    pcalDisabledColor?: string;

    // Switch
    psSwitchBgInactive?: string;
    psSwitchBgActive?: string;
    psSwitchHandleBg?: string;

    // Icon Button
    pibIconColor?: string;
    pibBg?: string;
    pibBorder?: any;
    pibBorderWidth?: number;
    pibBorderWidth_tablet?: number;
    pibBorderWidth_mobile?: number;
    pibRadius?: number;
    pibRadius_tablet?: number;
    pibRadius_mobile?: number;
    pibRadiusUnit?: string;
    pibIconColorHover?: string;
    pibBgHover?: string;
    pibBorderColorHover?: string;

    // Additional properties
    [key: string]: any; // Allow index signature for dynamic access
}

/**
 * VxConfig - Configuration stored in database as JSON
 * This is what gets saved in save.tsx and parsed in frontend.tsx
 */
export interface PopupKitVxConfig extends PopupKitAttributes {
    // All attributes are included in vxconfig
}

/**
 * Edit component props
 */
export interface PopupKitEditProps {
    attributes: PopupKitAttributes;
    setAttributes: (attrs: Partial<PopupKitAttributes>) => void;
    clientId: string;
}
