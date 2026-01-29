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
    pgShadow?: object;
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
    phTitleFontSize?: object;
    phTitleFontWeight: string;
    phTitleLineHeight?: object;
    phAvatarSize?: number;
    phAvatarSize_tablet?: number;
    phAvatarSize_mobile?: number;
    phAvatarRadius?: number;
    phAvatarRadius_tablet?: number;
    phAvatarRadius_mobile?: number;
    phAvatarRadiusUnit: string;

    // Buttons
    pbTypo?: object;
    pbRadius?: number;
    pbRadius_tablet?: number;
    pbRadius_mobile?: number;
    pbButton1Bg?: string;
    pbButton1Text?: string;
    pbButton1Icon?: string;
    pbButton1Icon_tablet?: string;
    pbButton1Icon_mobile?: string;
    pbButton1Border?: object;
    pbButton2Bg?: string;
    pbButton2Text?: string;
    pbButton2Icon?: string;
    pbButton2Icon_tablet?: string;
    pbButton2Icon_mobile?: string;
    pbButton2Border?: object;
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
    plLabelTypo?: object;
    plLabelColor?: string;
    plLabelColor_tablet?: string;
    plLabelColor_mobile?: string;
    plDescTypo?: object;
    plDescColor?: string;
    plDescColor_tablet?: string;
    plDescColor_mobile?: string;

    // Menu
    pmItemPadding?: object;
    pmItemPaddingLinked: boolean;
    pmItemHeight?: number;
    pmItemHeight_tablet?: number;
    pmItemHeight_mobile?: number;
    pmSeparatorColor?: string;
    pmTitleColor?: string;
    pmTitleTypo?: object;
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
    pmSelectedTitleTypo?: object;
    pmSelectedTitleColor?: string;
    pmSelectedIconColor?: string;
    pmParentTitleTypo?: object;

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
    pcTitleTypo?: object;
    pcTitleColor?: string;
    pcSubtitleTypo?: object;
    pcSubtitleColor?: string;

    // Subtotal
    psSubtotalTypo?: object;
    psSubtotalTypoFontFamily?: string;
    psSubtotalColor?: string;

    // Notifications
    pnIconSize: number;
    pnIconSize_tablet?: number;
    pnIconSize_mobile?: number;
    pnIconColor?: string;
    pnTitleColor?: string;
    pnTitleTypo?: object;
    pnTitleTypoFontFamily?: string;

    // Checkboxes
    pcCheckboxSize?: number;
    pcCheckboxSize_tablet?: number;
    pcCheckboxSize_mobile?: number;
    pcCheckboxRadius?: number;
    pcCheckboxRadius_tablet?: number;
    pcCheckboxRadius_mobile?: number;
    pcCheckboxBorder?: object;
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
    prRadioBorder?: object;
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
    piInputTypo?: object;
    piInputTypoFontFamily?: string;
    piInputPadding?: object;
    piInputPaddingLinked: boolean;
    piInputPaddingIcon?: object;
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
    pfBorder?: object;
    pfBorderWidth?: number;
    pfBorderWidth_tablet?: number;
    pfBorderWidth_mobile?: number;
    pfBorderRadius?: number;
    pfBorderRadius_tablet?: number;
    pfBorderRadius_mobile?: number;
    pfBorderRadiusUnit: string;
    pfTypo?: object;
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
    pfAddedTypo?: object;
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
    prRangeHandleBorder?: object;

    // Textarea
    ptextHeight?: number;
    ptextHeight_tablet?: number;
    ptextHeight_mobile?: number;
    ptextHeightUnit: string;
    ptextTypo?: object;
    ptextTypoFontFamily?: string;
    ptextValueColor?: string;
    ptextPlaceholderColor?: string;
    ptextPadding?: object;
    ptextPaddingLinked: boolean;
    ptextBorder?: object;
    ptextBorderWidth?: number;
    ptextBorderWidth_tablet?: number;
    ptextBorderWidth_mobile?: number;
    ptextBorderRadius?: number;
    ptextBorderRadius_tablet?: number;
    ptextBorderRadius_mobile?: number;
    ptextBorderRadiusUnit: string;

    // Alerts
    palertIconSize?: number;
    palertIconSize_tablet?: number;
    palertIconSize_mobile?: number;
    palertIconSizeUnit: string;
    palertIconColor?: string;
    palertTextColor?: string;
    palertTextTypo?: object;
    palertTextTypoFontFamily?: string;
    palertLinkTypo?: object;
    palertLinkTypoFontFamily?: string;
    palertLinkColor?: string;
    palertLinkColorHover?: string;
    palertLinkBgHover?: string;

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
