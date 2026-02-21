/**
 * Login Block - Style Generation
 *
 * @package VoxelFSE
 */

import type { LoginAttributes } from './types';
import {
    generateDimensionsCSS,
    generateTypographyCSS,
    generateBorderCSS,
    generateBoxShadowCSS,
} from '@shared/utils/css-generators';

/**
 * Generate block-specific styles for the editor
 */
export function generateBlockStyles(_attributes: LoginAttributes): Record<string, string | number> {
    // Most styles are handled via responsive CSS to support tablet/mobile
    return {};
}

/**
 * Generate responsive CSS for the block
 */
export function generateBlockResponsiveCSS(
    attributes: LoginAttributes,
    uniqueSelector: string
): string {
    const desktopRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    // ==================== LAYOUT ====================

    // Content Spacing
    if (attributes.contentSpacing !== undefined) {
        desktopRules.push(`${uniqueSelector} .login-section { gap: ${attributes.contentSpacing}px; }`);
    }

    // Title Styles
    const titleSelector = `${uniqueSelector} .vx-step-title`;
    const titleTypography = generateTypographyCSS(attributes.titleTypography);
    if (titleTypography.desktop) desktopRules.push(`${titleSelector} { ${titleTypography.desktop} }`);
    if (titleTypography.tablet) tabletRules.push(`${titleSelector} { ${titleTypography.tablet} }`);
    if (titleTypography.mobile) mobileRules.push(`${titleSelector} { ${titleTypography.mobile} }`);

    if (attributes.titleColor) {
        desktopRules.push(`${titleSelector} { color: ${attributes.titleColor}; }`);
    }
    if (attributes.contentSpacing_tablet !== undefined) {
        tabletRules.push(`${uniqueSelector} .login-section { gap: ${attributes.contentSpacing_tablet}px; }`);
    }
    if (attributes.contentSpacing_mobile !== undefined) {
        mobileRules.push(`${uniqueSelector} .login-section { gap: ${attributes.contentSpacing_mobile}px; }`);
    }

    // ==================== FIELD LABEL ====================

    // Typography
    const labelTypography = generateTypographyCSS(attributes.fieldLabelTypography);
    if (labelTypography.desktop) desktopRules.push(`${uniqueSelector} .ts-form-group > label { ${labelTypography.desktop} }`);
    if (labelTypography.tablet) tabletRules.push(`${uniqueSelector} .ts-form-group > label { ${labelTypography.tablet} }`);
    if (labelTypography.mobile) mobileRules.push(`${uniqueSelector} .ts-form-group > label { ${labelTypography.mobile} }`);

    // Color
    if (attributes.fieldLabelColor) {
        desktopRules.push(`${uniqueSelector} .ts-form-group > label { color: ${attributes.fieldLabelColor}; }`);
    }

    // Link Color
    if (attributes.fieldLabelLinkColor) {
        desktopRules.push(`${uniqueSelector} .ts-form-group > label a { color: ${attributes.fieldLabelLinkColor}; }`);
    }

    // Padding
    const labelPadding = generateDimensionsCSS(attributes, 'fieldLabelPadding');
    if (labelPadding.desktop) desktopRules.push(`${uniqueSelector} .ts-form-group > label { ${labelPadding.desktop} }`);
    if (labelPadding.tablet) tabletRules.push(`${uniqueSelector} .ts-form-group > label { ${labelPadding.tablet} }`);
    if (labelPadding.mobile) mobileRules.push(`${uniqueSelector} .ts-form-group > label { ${labelPadding.mobile} }`);

    // Optional Label
    const optLabelTypography = generateTypographyCSS(attributes.fieldOptionalLabelTypography);
    if (optLabelTypography.desktop) desktopRules.push(`${uniqueSelector} .ts-form-group > label small { ${optLabelTypography.desktop} }`);
    if (optLabelTypography.tablet) tabletRules.push(`${uniqueSelector} .ts-form-group > label small { ${optLabelTypography.tablet} }`);
    if (optLabelTypography.mobile) mobileRules.push(`${uniqueSelector} .ts-form-group > label small { ${optLabelTypography.mobile} }`);

    if (attributes.fieldOptionalLabelColor) {
        desktopRules.push(`${uniqueSelector} .ts-form-group > label small { color: ${attributes.fieldOptionalLabelColor}; }`);
    }

    // ==================== INPUT ====================

    const inputSelector = `${uniqueSelector} .ts-filter`;
    const inputGroupSelector = `${uniqueSelector} .ts-input-icon`;

    // Placeholder
    if (attributes.fieldInputPlaceholderColor) {
        desktopRules.push(`${inputSelector}::placeholder { color: ${attributes.fieldInputPlaceholderColor}; opacity: 1; }`);
    }
    if (attributes.fieldInputPlaceholderColorHover) {
        desktopRules.push(`${inputSelector}:hover::placeholder { color: ${attributes.fieldInputPlaceholderColorHover}; }`);
    }
    if (attributes.fieldInputPlaceholderColorActive) {
        desktopRules.push(`${inputSelector}:focus::placeholder { color: ${attributes.fieldInputPlaceholderColorActive}; }`);
    }

    const placeholderTypography = generateTypographyCSS(attributes.fieldInputPlaceholderTypography);
    if (placeholderTypography.desktop) desktopRules.push(`${inputSelector}::placeholder { ${placeholderTypography.desktop} }`);
    if (placeholderTypography.tablet) tabletRules.push(`${inputSelector}::placeholder { ${placeholderTypography.tablet} }`);
    if (placeholderTypography.mobile) mobileRules.push(`${inputSelector}::placeholder { ${placeholderTypography.mobile} }`);

    // Input styles
    const inputTypography = generateTypographyCSS(attributes.fieldInputTypography);
    if (inputTypography.desktop) desktopRules.push(`${inputSelector} { ${inputTypography.desktop} }`);
    if (inputTypography.tablet) tabletRules.push(`${inputSelector} { ${inputTypography.tablet} }`);
    if (inputTypography.mobile) mobileRules.push(`${inputSelector} { ${inputTypography.mobile} }`);

    if (attributes.fieldInputTextColor) {
        desktopRules.push(`${inputSelector} { color: ${attributes.fieldInputTextColor}; }`);
    }
    if (attributes.fieldInputTextColorHover) {
        desktopRules.push(`${inputSelector}:hover { color: ${attributes.fieldInputTextColorHover}; }`);
    }
    if (attributes.fieldInputTextColorActive) {
        desktopRules.push(`${inputSelector}:focus { color: ${attributes.fieldInputTextColorActive}; }`);
    }

    if (attributes.fieldInputBackgroundColor) {
        desktopRules.push(`${inputSelector} { background-color: ${attributes.fieldInputBackgroundColor}; }`);
    }
    if (attributes.fieldInputBackgroundColorHover) {
        desktopRules.push(`${inputSelector}:hover { background-color: ${attributes.fieldInputBackgroundColorHover}; }`);
    }
    if (attributes.fieldInputBackgroundColorActive) {
        desktopRules.push(`${inputSelector}:focus { background-color: ${attributes.fieldInputBackgroundColorActive}; }`);
    }

    // Border
    const inputBorder = generateBorderCSS(attributes, 'fieldInputBorder');
    if (inputBorder.desktop) desktopRules.push(`${inputSelector} { ${inputBorder.desktop} }`);
    if (inputBorder.tablet) tabletRules.push(`${inputSelector} { ${inputBorder.tablet} }`);
    if (inputBorder.mobile) mobileRules.push(`${inputSelector} { ${inputBorder.mobile} }`);

    if (attributes.fieldInputBorderColorHover) {
        desktopRules.push(`${inputSelector}:hover { border-color: ${attributes.fieldInputBorderColorHover}; }`);
    }
    if (attributes.fieldInputBorderColorActive) {
        desktopRules.push(`${inputSelector}:focus { border-color: ${attributes.fieldInputBorderColorActive}; }`);
    }

    // Padding & Radius
    const inputPadding = generateDimensionsCSS(attributes, 'fieldInputPadding');
    if (inputPadding.desktop) desktopRules.push(`${inputSelector} { ${inputPadding.desktop} }`);
    if (inputPadding.tablet) tabletRules.push(`${inputSelector} { ${inputPadding.tablet} }`);
    if (inputPadding.mobile) mobileRules.push(`${inputSelector} { ${inputPadding.mobile} }`);

    // Radius (ResponsiveRangeControl returns number)
    if (attributes.fieldInputBorderRadius !== undefined) {
        desktopRules.push(`${inputSelector} { border-radius: ${attributes.fieldInputBorderRadius}px; }`);
    }
    if (attributes.fieldInputBorderRadius_tablet !== undefined) {
        tabletRules.push(`${inputSelector} { border-radius: ${attributes.fieldInputBorderRadius_tablet}px; }`);
    }
    if (attributes.fieldInputBorderRadius_mobile !== undefined) {
        mobileRules.push(`${inputSelector} { border-radius: ${attributes.fieldInputBorderRadius_mobile}px; }`);
    }

    // ==================== INPUT WITH ICON ====================

    // Padding
    const iconInputPadding = generateDimensionsCSS(attributes, 'fieldInputIconPadding');
    if (iconInputPadding.desktop) desktopRules.push(`${inputGroupSelector}.flexify ${inputSelector} { ${iconInputPadding.desktop} }`);
    if (iconInputPadding.tablet) tabletRules.push(`${inputGroupSelector}.flexify ${inputSelector} { ${iconInputPadding.tablet} }`);
    if (iconInputPadding.mobile) mobileRules.push(`${inputGroupSelector}.flexify ${inputSelector} { ${iconInputPadding.mobile} }`);

    // Icon Color (with default)
    const iconColor = attributes.fieldInputIconColor || 'currentColor';
    if (iconColor && iconColor !== 'currentColor') {
        desktopRules.push(`${inputGroupSelector} > i { color: ${iconColor}; }`);
        desktopRules.push(`${inputGroupSelector} > svg { fill: ${iconColor}; }`);
    } else {
        // Apply default icon styling to ensure icons are visible
        desktopRules.push(`${inputGroupSelector} > i { color: inherit; opacity: 0.7; }`);
        desktopRules.push(`${inputGroupSelector} > svg { fill: inherit; opacity: 0.7; }`);
    }
    if (attributes.fieldInputIconColorHover) {
        desktopRules.push(`${inputGroupSelector}:hover > i { color: ${attributes.fieldInputIconColorHover}; }`);
        desktopRules.push(`${inputGroupSelector}:hover > svg { fill: ${attributes.fieldInputIconColorHover}; }`);
    }

    // Icon Size
    if (attributes.fieldInputIconSize !== undefined) {
        desktopRules.push(`${inputGroupSelector} > i { font-size: ${attributes.fieldInputIconSize}px; }`);
        desktopRules.push(`${inputGroupSelector} > svg { width: ${attributes.fieldInputIconSize}px; height: ${attributes.fieldInputIconSize}px; }`);
    }
    if (attributes.fieldInputIconSize_tablet !== undefined) {
        tabletRules.push(`${inputGroupSelector} > i { font-size: ${attributes.fieldInputIconSize_tablet}px; }`);
        tabletRules.push(`${inputGroupSelector} > svg { width: ${attributes.fieldInputIconSize_tablet}px; height: ${attributes.fieldInputIconSize_tablet}px; }`);
    }
    if (attributes.fieldInputIconSize_mobile !== undefined) {
        mobileRules.push(`${inputGroupSelector} > i { font-size: ${attributes.fieldInputIconSize_mobile}px; }`);
        mobileRules.push(`${inputGroupSelector} > svg { width: ${attributes.fieldInputIconSize_mobile}px; height: ${attributes.fieldInputIconSize_mobile}px; }`);
    }

    // Icon Side Padding
    if (attributes.fieldInputIconSidePadding !== undefined) {
        desktopRules.push(`${inputGroupSelector} > i, ${inputGroupSelector} > svg { left: ${attributes.fieldInputIconSidePadding}px; }`);
    }
    if (attributes.fieldInputIconSidePadding_tablet !== undefined) {
        tabletRules.push(`${inputGroupSelector} > i, ${inputGroupSelector} > svg { left: ${attributes.fieldInputIconSidePadding_tablet}px; }`);
    }
    if (attributes.fieldInputIconSidePadding_mobile !== undefined) {
        mobileRules.push(`${inputGroupSelector} > i, ${inputGroupSelector} > svg { left: ${attributes.fieldInputIconSidePadding_mobile}px; }`);
    }

    // ==================== TEXTAREA ====================

    const textareaSelector = `${uniqueSelector} textarea.ts-filter`;

    const textareaPadding = generateDimensionsCSS(attributes, 'fieldTextareaPadding');
    if (textareaPadding.desktop) desktopRules.push(`${textareaSelector} { ${textareaPadding.desktop} }`);
    if (textareaPadding.tablet) tabletRules.push(`${textareaSelector} { ${textareaPadding.tablet} }`);
    if (textareaPadding.mobile) mobileRules.push(`${textareaSelector} { ${textareaPadding.mobile} }`);

    // Height
    if (attributes.fieldTextareaHeight !== undefined) {
        desktopRules.push(`${textareaSelector} { height: ${attributes.fieldTextareaHeight}px; min-height: ${attributes.fieldTextareaHeight}px; }`);
    }
    if (attributes.fieldTextareaHeight_tablet !== undefined) {
        tabletRules.push(`${textareaSelector} { height: ${attributes.fieldTextareaHeight_tablet}px; min-height: ${attributes.fieldTextareaHeight_tablet}px; }`);
    }
    if (attributes.fieldTextareaHeight_mobile !== undefined) {
        mobileRules.push(`${textareaSelector} { height: ${attributes.fieldTextareaHeight_mobile}px; min-height: ${attributes.fieldTextareaHeight_mobile}px; }`);
    }

    // Radius
    if (attributes.fieldTextareaBorderRadius !== undefined) {
        desktopRules.push(`${textareaSelector} { border-radius: ${attributes.fieldTextareaBorderRadius}px; }`);
    }
    if (attributes.fieldTextareaBorderRadius_tablet !== undefined) {
        tabletRules.push(`${textareaSelector} { border-radius: ${attributes.fieldTextareaBorderRadius_tablet}px; }`);
    }
    if (attributes.fieldTextareaBorderRadius_mobile !== undefined) {
        mobileRules.push(`${textareaSelector} { border-radius: ${attributes.fieldTextareaBorderRadius_mobile}px; }`);
    }

    // ==================== POPUP BUTTON ====================

    const popupBtnSelector = `${uniqueSelector} .ts-filter.ts-popup-target`;

    // Typography
    const popupTypography = generateTypographyCSS(attributes.fieldPopupBtnTypography);
    if (popupTypography.desktop) desktopRules.push(`${popupBtnSelector} { ${popupTypography.desktop} }`);
    if (popupTypography.tablet) tabletRules.push(`${popupBtnSelector} { ${popupTypography.tablet} }`);
    if (popupTypography.mobile) mobileRules.push(`${popupBtnSelector} { ${popupTypography.mobile} }`);

    // Padding
    const popupPadding = generateDimensionsCSS(attributes, 'fieldPopupBtnPadding');
    if (popupPadding.desktop) desktopRules.push(`${popupBtnSelector} { ${popupPadding.desktop} }`);
    if (popupPadding.tablet) tabletRules.push(`${popupBtnSelector} { ${popupPadding.tablet} }`);
    if (popupPadding.mobile) mobileRules.push(`${popupBtnSelector} { ${popupPadding.mobile} }`);

    // Height
    if (attributes.fieldPopupBtnHeight !== undefined) {
        desktopRules.push(`${popupBtnSelector} { height: ${attributes.fieldPopupBtnHeight}px; line-height: ${attributes.fieldPopupBtnHeight}px; }`);
    }
    if (attributes.fieldPopupBtnHeight_tablet !== undefined) {
        tabletRules.push(`${popupBtnSelector} { height: ${attributes.fieldPopupBtnHeight_tablet}px; line-height: ${attributes.fieldPopupBtnHeight_tablet}px; }`);
    }
    if (attributes.fieldPopupBtnHeight_mobile !== undefined) {
        mobileRules.push(`${popupBtnSelector} { height: ${attributes.fieldPopupBtnHeight_mobile}px; line-height: ${attributes.fieldPopupBtnHeight_mobile}px; }`);
    }

    // Box Shadow
    const popupShadow = generateBoxShadowCSS(attributes.fieldPopupBtnBoxShadow);
    if (popupShadow) {
        desktopRules.push(`${popupBtnSelector} { box-shadow: ${popupShadow}; }`);
    }

    // Colors
    if (attributes.fieldPopupBtnBackgroundColor) {
        desktopRules.push(`${popupBtnSelector} { background-color: ${attributes.fieldPopupBtnBackgroundColor}; }`);
    }
    if (attributes.fieldPopupBtnTextColor) {
        desktopRules.push(`${popupBtnSelector} { color: ${attributes.fieldPopupBtnTextColor}; }`);
    }

    // Border
    const popupBorder = generateBorderCSS(attributes, 'fieldPopupBtnBorder');
    if (popupBorder.desktop) desktopRules.push(`${popupBtnSelector} { ${popupBorder.desktop} }`);
    if (popupBorder.tablet) tabletRules.push(`${popupBtnSelector} { ${popupBorder.tablet} }`);
    if (popupBorder.mobile) mobileRules.push(`${popupBtnSelector} { ${popupBorder.mobile} }`);

    // Radius
    if (attributes.fieldPopupBtnBorderRadius !== undefined) {
        desktopRules.push(`${popupBtnSelector} { border-radius: ${attributes.fieldPopupBtnBorderRadius}px; }`);
    }
    if (attributes.fieldPopupBtnBorderRadius_tablet !== undefined) {
        tabletRules.push(`${popupBtnSelector} { border-radius: ${attributes.fieldPopupBtnBorderRadius_tablet}px; }`);
    }
    if (attributes.fieldPopupBtnBorderRadius_mobile !== undefined) {
        mobileRules.push(`${popupBtnSelector} { border-radius: ${attributes.fieldPopupBtnBorderRadius_mobile}px; }`);
    }

    // Icon
    // Note: Popup button icons typically use .ts-icon or specific selectors.
    // Adjusting based on Voxel standard.
    const popupIconSelector = `${popupBtnSelector} i, ${popupBtnSelector} svg`;

    if (attributes.fieldPopupBtnIconColor) {
        desktopRules.push(`${popupIconSelector} { color: ${attributes.fieldPopupBtnIconColor}; fill: ${attributes.fieldPopupBtnIconColor}; }`);
    }

    if (attributes.fieldPopupBtnIconSize !== undefined) {
        desktopRules.push(`${popupIconSelector} { font-size: ${attributes.fieldPopupBtnIconSize}px; width: ${attributes.fieldPopupBtnIconSize}px; height: ${attributes.fieldPopupBtnIconSize}px; }`);
    }
    if (attributes.fieldPopupBtnIconSize_tablet !== undefined) {
        tabletRules.push(`${popupIconSelector} { font-size: ${attributes.fieldPopupBtnIconSize_tablet}px; width: ${attributes.fieldPopupBtnIconSize_tablet}px; height: ${attributes.fieldPopupBtnIconSize_tablet}px; }`);
    }
    if (attributes.fieldPopupBtnIconSize_mobile !== undefined) {
        mobileRules.push(`${popupIconSelector} { font-size: ${attributes.fieldPopupBtnIconSize_mobile}px; width: ${attributes.fieldPopupBtnIconSize_mobile}px; height: ${attributes.fieldPopupBtnIconSize_mobile}px; }`);
    }

    // Icon Spacing (using gap if flex, or margin if not)
    if (attributes.fieldPopupBtnIconSpacing !== undefined) {
        desktopRules.push(`${popupBtnSelector} { gap: ${attributes.fieldPopupBtnIconSpacing}px; }`);
    }
    if (attributes.fieldPopupBtnIconSpacing_tablet !== undefined) {
        tabletRules.push(`${popupBtnSelector} { gap: ${attributes.fieldPopupBtnIconSpacing_tablet}px; }`);
    }
    if (attributes.fieldPopupBtnIconSpacing_mobile !== undefined) {
        mobileRules.push(`${popupBtnSelector} { gap: ${attributes.fieldPopupBtnIconSpacing_mobile}px; }`);
    }

    // Chevron
    if (attributes.fieldPopupBtnHideChevron) {
        desktopRules.push(`${popupBtnSelector} .ts-down-icon { display: none; }`);
    }
    if (attributes.fieldPopupBtnChevronColor) {
        desktopRules.push(`${popupBtnSelector} .ts-down-icon { color: ${attributes.fieldPopupBtnChevronColor}; }`);
    }

    // Hover State
    if (attributes.fieldPopupBtnBackgroundColorHover) {
        desktopRules.push(`${popupBtnSelector}:hover { background-color: ${attributes.fieldPopupBtnBackgroundColorHover}; }`);
    }
    if (attributes.fieldPopupBtnTextColorHover) {
        desktopRules.push(`${popupBtnSelector}:hover { color: ${attributes.fieldPopupBtnTextColorHover}; }`);
    }
    if (attributes.fieldPopupBtnBorderColorHover) {
        desktopRules.push(`${popupBtnSelector}:hover { border-color: ${attributes.fieldPopupBtnBorderColorHover}; }`);
    }
    if (attributes.fieldPopupBtnIconColorHover) {
        desktopRules.push(`${popupBtnSelector}:hover i { color: ${attributes.fieldPopupBtnIconColorHover}; }`);
        desktopRules.push(`${popupBtnSelector}:hover svg { fill: ${attributes.fieldPopupBtnIconColorHover}; }`);
    }
    const popupShadowHover = generateBoxShadowCSS(attributes.fieldPopupBtnBoxShadowHover);
    if (popupShadowHover) {
        desktopRules.push(`${popupBtnSelector}:hover { box-shadow: ${popupShadowHover}; }`);
    }

    // Filled State (.ts-filled)
    const popupFilledSelector = `${uniqueSelector} .ts-filter.ts-popup-target.ts-filled`;

    const filledTypography = generateTypographyCSS(attributes.fieldPopupBtnFilledTypography);
    if (filledTypography.desktop) desktopRules.push(`${popupFilledSelector} { ${filledTypography.desktop} }`);

    if (attributes.fieldPopupBtnFilledBackground) {
        desktopRules.push(`${popupFilledSelector} { background-color: ${attributes.fieldPopupBtnFilledBackground}; }`);
    }
    if (attributes.fieldPopupBtnFilledTextColor) {
        desktopRules.push(`${popupFilledSelector} { color: ${attributes.fieldPopupBtnFilledTextColor}; }`);
    }
    if (attributes.fieldPopupBtnFilledIconColor) {
        desktopRules.push(`${popupFilledSelector} i { color: ${attributes.fieldPopupBtnFilledIconColor}; }`);
        desktopRules.push(`${popupFilledSelector} svg { fill: ${attributes.fieldPopupBtnFilledIconColor}; }`);
    }
    if (attributes.fieldPopupBtnFilledBorderColor) {
        desktopRules.push(`${popupFilledSelector} { border-color: ${attributes.fieldPopupBtnFilledBorderColor}; }`);
    }
    if (attributes.fieldPopupBtnFilledBorderWidth !== undefined) {
        desktopRules.push(`${popupFilledSelector} { border-width: ${attributes.fieldPopupBtnFilledBorderWidth}px; }`);
    }
    if (attributes.fieldPopupBtnFilledBorderWidth_tablet !== undefined) {
        tabletRules.push(`${popupFilledSelector} { border-width: ${attributes.fieldPopupBtnFilledBorderWidth_tablet}px; }`);
    }
    if (attributes.fieldPopupBtnFilledBorderWidth_mobile !== undefined) {
        mobileRules.push(`${popupFilledSelector} { border-width: ${attributes.fieldPopupBtnFilledBorderWidth_mobile}px; }`);
    }
    const popupShadowFilled = generateBoxShadowCSS(attributes.fieldPopupBtnFilledBoxShadow);
    if (popupShadowFilled) {
        desktopRules.push(`${popupFilledSelector} { box-shadow: ${popupShadowFilled}; }`);
    }


    // ==================== SWITCHER ====================

    const switchLabelSelector = `${uniqueSelector} .onoffswitch-label`;
    const switchCheckboxSelector = `${uniqueSelector} .onoffswitch-checkbox`;

    if (attributes.fieldSwitcherBackgroundColor) {
        desktopRules.push(`${switchLabelSelector} { background-color: ${attributes.fieldSwitcherBackgroundColor}; }`);
    }
    if (attributes.fieldSwitcherBackgroundColorActive) {
        desktopRules.push(`${switchCheckboxSelector}:checked + ${switchLabelSelector} { background-color: ${attributes.fieldSwitcherBackgroundColorActive}; }`);
    }
    if (attributes.fieldSwitcherHandleColor) {
        desktopRules.push(`${switchLabelSelector}:before { background-color: ${attributes.fieldSwitcherHandleColor}; }`);
    }

    // ==================== CHECKBOX ====================

    // Target the checkmark span which handles the visual box
    const checkboxSelector = `${uniqueSelector} .container-checkbox .checkmark`;
    const checkboxCheckedSelector = `${uniqueSelector} .container-checkbox input:checked ~ .checkmark`;

    // Size
    if (attributes.fieldCheckboxSize !== undefined) {
        desktopRules.push(`${checkboxSelector} { width: ${attributes.fieldCheckboxSize}px; height: ${attributes.fieldCheckboxSize}px; }`);
        // Voxel checkmark often uses :after for the tick, which might need adjustment if size changes drastically,
        // but base size is on the .checkmark container.
    }
    if (attributes.fieldCheckboxSize_tablet !== undefined) {
        tabletRules.push(`${checkboxSelector} { width: ${attributes.fieldCheckboxSize_tablet}px; height: ${attributes.fieldCheckboxSize_tablet}px; }`);
    }
    if (attributes.fieldCheckboxSize_mobile !== undefined) {
        mobileRules.push(`${checkboxSelector} { width: ${attributes.fieldCheckboxSize_mobile}px; height: ${attributes.fieldCheckboxSize_mobile}px; }`);
    }

    // Radius
    if (attributes.fieldCheckboxBorderRadius !== undefined) {
        desktopRules.push(`${checkboxSelector} { border-radius: ${attributes.fieldCheckboxBorderRadius}px; }`);
    }
    if (attributes.fieldCheckboxBorderRadius_tablet !== undefined) {
        tabletRules.push(`${checkboxSelector} { border-radius: ${attributes.fieldCheckboxBorderRadius_tablet}px; }`);
    }
    if (attributes.fieldCheckboxBorderRadius_mobile !== undefined) {
        mobileRules.push(`${checkboxSelector} { border-radius: ${attributes.fieldCheckboxBorderRadius_mobile}px; }`);
    }

    // Border
    const checkboxBorder = generateBorderCSS(attributes, 'fieldCheckboxBorder');
    if (checkboxBorder.desktop) desktopRules.push(`${checkboxSelector} { ${checkboxBorder.desktop} }`);
    if (checkboxBorder.tablet) tabletRules.push(`${checkboxSelector} { ${checkboxBorder.tablet} }`);
    if (checkboxBorder.mobile) mobileRules.push(`${checkboxSelector} { ${checkboxBorder.mobile} }`);

    // Colors
    if (attributes.fieldCheckboxBackgroundColor) {
        desktopRules.push(`${checkboxSelector} { background-color: ${attributes.fieldCheckboxBackgroundColor}; }`);
    }
    if (attributes.fieldCheckboxBackgroundColorChecked) {
        desktopRules.push(`${checkboxCheckedSelector} { background-color: ${attributes.fieldCheckboxBackgroundColorChecked}; }`);
    }
    if (attributes.fieldCheckboxBorderColorChecked) {
        desktopRules.push(`${checkboxCheckedSelector} { border-color: ${attributes.fieldCheckboxBorderColorChecked}; }`);
    }
    // Note: Checkmark color usually handled via SVG fill or ::after, depends on Voxel implementation.
    // Voxel checkboxes use an SVG or pseudo element. Assuming ::after or similar for checkmark.
    // Inspecting defaults: Voxel often uses ::before for checkmark.
    // But controls show "Background color (checked)" and "Border-color (checked)".
    // We might need to handle checkmark color matching if user requests it, but it wasn't explicit in `FieldStyleTab.tsx` props.


    // ==================== ROLE SELECTION ====================

    const roleSelector = `${uniqueSelector} .ts-role-item`;

    // Min Width
    if (attributes.roleMinWidth !== undefined) {
        desktopRules.push(`${roleSelector} { min-width: ${attributes.roleMinWidth}px; }`);
    }
    if (attributes.roleMinWidth_tablet !== undefined) {
        tabletRules.push(`${roleSelector} { min-width: ${attributes.roleMinWidth_tablet}px; }`);
    }
    if (attributes.roleMinWidth_mobile !== undefined) {
        mobileRules.push(`${roleSelector} { min-width: ${attributes.roleMinWidth_mobile}px; }`);
    }

    // Border
    const roleBorder = generateBorderCSS(attributes, 'roleBorder');
    if (roleBorder.desktop) desktopRules.push(`${roleSelector} { ${roleBorder.desktop} }`);
    if (roleBorder.tablet) tabletRules.push(`${roleSelector} { ${roleBorder.tablet} }`);
    if (roleBorder.mobile) mobileRules.push(`${roleSelector} { ${roleBorder.mobile} }`);

    // Radius
    if (attributes.roleBorderRadius !== undefined) {
        desktopRules.push(`${roleSelector} { border-radius: ${attributes.roleBorderRadius}px; }`);
    }
    if (attributes.roleBorderRadius_tablet !== undefined) {
        tabletRules.push(`${roleSelector} { border-radius: ${attributes.roleBorderRadius_tablet}px; }`);
    }
    if (attributes.roleBorderRadius_mobile !== undefined) {
        mobileRules.push(`${roleSelector} { border-radius: ${attributes.roleBorderRadius_mobile}px; }`);
    }

    // Typography
    const roleTypography = generateTypographyCSS(attributes.roleTypography);
    if (roleTypography.desktop) desktopRules.push(`${roleSelector} { ${roleTypography.desktop} }`);
    if (roleTypography.tablet) tabletRules.push(`${roleSelector} { ${roleTypography.tablet} }`);
    if (roleTypography.mobile) mobileRules.push(`${roleSelector} { ${roleTypography.mobile} }`);

    // Colors
    if (attributes.roleSeparatorColor) {
        desktopRules.push(`${roleSelector} { border-color: ${attributes.roleSeparatorColor}; }`);
    }
    if (attributes.roleTextColor) {
        desktopRules.push(`${roleSelector} { color: ${attributes.roleTextColor}; }`);
    }
    if (attributes.roleBackgroundColor) {
        desktopRules.push(`${roleSelector} { background-color: ${attributes.roleBackgroundColor}; }`);
    }

    // Active State
    const roleActiveSelector = `${uniqueSelector} .ts-role-item.current`;

    const roleActiveTypography = generateTypographyCSS(attributes.roleActiveTypography);
    if (roleActiveTypography.desktop) desktopRules.push(`${roleActiveSelector} { ${roleActiveTypography.desktop} }`);

    if (attributes.roleActiveTextColor) {
        desktopRules.push(`${roleActiveSelector} { color: ${attributes.roleActiveTextColor}; }`);
    }
    if (attributes.roleActiveBackgroundColor) {
        desktopRules.push(`${roleActiveSelector} { background-color: ${attributes.roleActiveBackgroundColor}; }`);
    }


    // ==================== PRIMARY BUTTON ====================

    const primaryBtnSelector = `${uniqueSelector} .ts-btn.ts-btn-1`;

    // Typography
    const primaryBtnTypography = generateTypographyCSS(attributes.primaryBtnTypography);
    if (primaryBtnTypography.desktop) desktopRules.push(`${primaryBtnSelector} { ${primaryBtnTypography.desktop} }`);
    if (primaryBtnTypography.tablet) tabletRules.push(`${primaryBtnSelector} { ${primaryBtnTypography.tablet} }`);
    if (primaryBtnTypography.mobile) mobileRules.push(`${primaryBtnSelector} { ${primaryBtnTypography.mobile} }`);

    // Radius
    if (attributes.primaryBtnBorderRadius !== undefined) {
        desktopRules.push(`${primaryBtnSelector} { border-radius: ${attributes.primaryBtnBorderRadius}px; }`);
    }
    if (attributes.primaryBtnBorderRadius_tablet !== undefined) {
        tabletRules.push(`${primaryBtnSelector} { border-radius: ${attributes.primaryBtnBorderRadius_tablet}px; }`);
    }
    if (attributes.primaryBtnBorderRadius_mobile !== undefined) {
        mobileRules.push(`${primaryBtnSelector} { border-radius: ${attributes.primaryBtnBorderRadius_mobile}px; }`);
    }

    // Text Color
    if (attributes.primaryBtnTextColor) {
        desktopRules.push(`${primaryBtnSelector} { color: ${attributes.primaryBtnTextColor}; }`);
    }

    // Padding
    const primaryBtnPadding = generateDimensionsCSS(attributes, 'primaryBtnPadding');
    if (primaryBtnPadding.desktop) desktopRules.push(`${primaryBtnSelector} { ${primaryBtnPadding.desktop} }`);
    if (primaryBtnPadding.tablet) tabletRules.push(`${primaryBtnSelector} { ${primaryBtnPadding.tablet} }`);
    if (primaryBtnPadding.mobile) mobileRules.push(`${primaryBtnSelector} { ${primaryBtnPadding.mobile} }`);

    // Height
    if (attributes.primaryBtnHeight !== undefined) {
        desktopRules.push(`${primaryBtnSelector} { height: ${attributes.primaryBtnHeight}px; min-height: ${attributes.primaryBtnHeight}px; }`);
    }
    if (attributes.primaryBtnHeight_tablet !== undefined) {
        tabletRules.push(`${primaryBtnSelector} { height: ${attributes.primaryBtnHeight_tablet}px; min-height: ${attributes.primaryBtnHeight_tablet}px; }`);
    }
    if (attributes.primaryBtnHeight_mobile !== undefined) {
        mobileRules.push(`${primaryBtnSelector} { height: ${attributes.primaryBtnHeight_mobile}px; min-height: ${attributes.primaryBtnHeight_mobile}px; }`);
    }

    // Background
    if (attributes.primaryBtnBackgroundColor) {
        desktopRules.push(`${primaryBtnSelector} { background-color: ${attributes.primaryBtnBackgroundColor}; }`);
    }

    // Border
    const primaryBtnBorder = generateBorderCSS(attributes, 'primaryBtnBorder');
    if (primaryBtnBorder.desktop) desktopRules.push(`${primaryBtnSelector} { ${primaryBtnBorder.desktop} }`);
    if (primaryBtnBorder.tablet) tabletRules.push(`${primaryBtnSelector} { ${primaryBtnBorder.tablet} }`);
    if (primaryBtnBorder.mobile) mobileRules.push(`${primaryBtnSelector} { ${primaryBtnBorder.mobile} }`);

    // Icon
    const primaryBtnIconSelector = `${primaryBtnSelector} i, ${primaryBtnSelector} svg`;

    // Icon Size
    if (attributes.primaryBtnIconSize !== undefined) {
        desktopRules.push(`${primaryBtnIconSelector} { font-size: ${attributes.primaryBtnIconSize}px; width: ${attributes.primaryBtnIconSize}px; height: ${attributes.primaryBtnIconSize}px; }`);
    }
    if (attributes.primaryBtnIconSize_tablet !== undefined) {
        tabletRules.push(`${primaryBtnIconSelector} { font-size: ${attributes.primaryBtnIconSize_tablet}px; width: ${attributes.primaryBtnIconSize_tablet}px; height: ${attributes.primaryBtnIconSize_tablet}px; }`);
    }
    if (attributes.primaryBtnIconSize_mobile !== undefined) {
        mobileRules.push(`${primaryBtnIconSelector} { font-size: ${attributes.primaryBtnIconSize_mobile}px; width: ${attributes.primaryBtnIconSize_mobile}px; height: ${attributes.primaryBtnIconSize_mobile}px; }`);
    }

    // Icon Spacing (using gap)
    if (attributes.primaryBtnIconSpacing !== undefined) {
        desktopRules.push(`${primaryBtnSelector} { gap: ${attributes.primaryBtnIconSpacing}px; }`);
    }
    if (attributes.primaryBtnIconSpacing_tablet !== undefined) {
        tabletRules.push(`${primaryBtnSelector} { gap: ${attributes.primaryBtnIconSpacing_tablet}px; }`);
    }
    if (attributes.primaryBtnIconSpacing_mobile !== undefined) {
        mobileRules.push(`${primaryBtnSelector} { gap: ${attributes.primaryBtnIconSpacing_mobile}px; }`);
    }

    // Icon Color
    if (attributes.primaryBtnIconColor) {
        desktopRules.push(`${primaryBtnIconSelector} { color: ${attributes.primaryBtnIconColor}; fill: ${attributes.primaryBtnIconColor}; }`);
    }

    // Hover State
    if (attributes.primaryBtnTextColorHover) {
        desktopRules.push(`${primaryBtnSelector}:hover { color: ${attributes.primaryBtnTextColorHover}; }`);
    }
    if (attributes.primaryBtnBackgroundColorHover) {
        desktopRules.push(`${primaryBtnSelector}:hover { background-color: ${attributes.primaryBtnBackgroundColorHover}; }`);
    }
    if (attributes.primaryBtnBorderColorHover) {
        desktopRules.push(`${primaryBtnSelector}:hover { border-color: ${attributes.primaryBtnBorderColorHover}; }`);
    }
    if (attributes.primaryBtnIconColorHover) {
        desktopRules.push(`${primaryBtnSelector}:hover i { color: ${attributes.primaryBtnIconColorHover}; }`);
        desktopRules.push(`${primaryBtnSelector}:hover svg { fill: ${attributes.primaryBtnIconColorHover}; }`);
    }


    // ==================== SECONDARY BUTTON ====================

    const secondaryBtnSelector = `${uniqueSelector} .ts-btn.ts-btn-2`;

    // Typography
    const secondaryBtnTypography = generateTypographyCSS(attributes.secondaryBtnTypography);
    if (secondaryBtnTypography.desktop) desktopRules.push(`${secondaryBtnSelector} { ${secondaryBtnTypography.desktop} }`);
    if (secondaryBtnTypography.tablet) tabletRules.push(`${secondaryBtnSelector} { ${secondaryBtnTypography.tablet} }`);
    if (secondaryBtnTypography.mobile) mobileRules.push(`${secondaryBtnSelector} { ${secondaryBtnTypography.mobile} }`);

    // Radius
    if (attributes.secondaryBtnBorderRadius !== undefined) {
        desktopRules.push(`${secondaryBtnSelector} { border-radius: ${attributes.secondaryBtnBorderRadius}px; }`);
    }
    if (attributes.secondaryBtnBorderRadius_tablet !== undefined) {
        tabletRules.push(`${secondaryBtnSelector} { border-radius: ${attributes.secondaryBtnBorderRadius_tablet}px; }`);
    }
    if (attributes.secondaryBtnBorderRadius_mobile !== undefined) {
        mobileRules.push(`${secondaryBtnSelector} { border-radius: ${attributes.secondaryBtnBorderRadius_mobile}px; }`);
    }

    // Text Color
    if (attributes.secondaryBtnTextColor) {
        desktopRules.push(`${secondaryBtnSelector} { color: ${attributes.secondaryBtnTextColor}; }`);
    }

    // Padding
    const secondaryBtnPadding = generateDimensionsCSS(attributes, 'secondaryBtnPadding');
    if (secondaryBtnPadding.desktop) desktopRules.push(`${secondaryBtnSelector} { ${secondaryBtnPadding.desktop} }`);
    if (secondaryBtnPadding.tablet) tabletRules.push(`${secondaryBtnSelector} { ${secondaryBtnPadding.tablet} }`);
    if (secondaryBtnPadding.mobile) mobileRules.push(`${secondaryBtnSelector} { ${secondaryBtnPadding.mobile} }`);

    // Height
    if (attributes.secondaryBtnHeight !== undefined) {
        desktopRules.push(`${secondaryBtnSelector} { height: ${attributes.secondaryBtnHeight}px; min-height: ${attributes.secondaryBtnHeight}px; }`);
    }
    if (attributes.secondaryBtnHeight_tablet !== undefined) {
        tabletRules.push(`${secondaryBtnSelector} { height: ${attributes.secondaryBtnHeight_tablet}px; min-height: ${attributes.secondaryBtnHeight_tablet}px; }`);
    }
    if (attributes.secondaryBtnHeight_mobile !== undefined) {
        mobileRules.push(`${secondaryBtnSelector} { height: ${attributes.secondaryBtnHeight_mobile}px; min-height: ${attributes.secondaryBtnHeight_mobile}px; }`);
    }

    // Background
    if (attributes.secondaryBtnBackgroundColor) {
        desktopRules.push(`${secondaryBtnSelector} { background-color: ${attributes.secondaryBtnBackgroundColor}; }`);
    }

    // Border
    const secondaryBtnBorder = generateBorderCSS(attributes, 'secondaryBtnBorder');
    if (secondaryBtnBorder.desktop) desktopRules.push(`${secondaryBtnSelector} { ${secondaryBtnBorder.desktop} }`);
    if (secondaryBtnBorder.tablet) tabletRules.push(`${secondaryBtnSelector} { ${secondaryBtnBorder.tablet} }`);
    if (secondaryBtnBorder.mobile) mobileRules.push(`${secondaryBtnSelector} { ${secondaryBtnBorder.mobile} }`);

    // Icon
    const secondaryBtnIconSelector = `${secondaryBtnSelector} i, ${secondaryBtnSelector} svg`;

    // Icon Size
    if (attributes.secondaryBtnIconSize !== undefined) {
        desktopRules.push(`${secondaryBtnIconSelector} { font-size: ${attributes.secondaryBtnIconSize}px; width: ${attributes.secondaryBtnIconSize}px; height: ${attributes.secondaryBtnIconSize}px; }`);
    }
    if (attributes.secondaryBtnIconSize_tablet !== undefined) {
        tabletRules.push(`${secondaryBtnIconSelector} { font-size: ${attributes.secondaryBtnIconSize_tablet}px; width: ${attributes.secondaryBtnIconSize_tablet}px; height: ${attributes.secondaryBtnIconSize_tablet}px; }`);
    }
    if (attributes.secondaryBtnIconSize_mobile !== undefined) {
        mobileRules.push(`${secondaryBtnIconSelector} { font-size: ${attributes.secondaryBtnIconSize_mobile}px; width: ${attributes.secondaryBtnIconSize_mobile}px; height: ${attributes.secondaryBtnIconSize_mobile}px; }`);
    }

    // Icon Spacing (using gap)
    if (attributes.secondaryBtnIconSpacing !== undefined) {
        desktopRules.push(`${secondaryBtnSelector} { gap: ${attributes.secondaryBtnIconSpacing}px; }`);
    }
    if (attributes.secondaryBtnIconSpacing_tablet !== undefined) {
        tabletRules.push(`${secondaryBtnSelector} { gap: ${attributes.secondaryBtnIconSpacing_tablet}px; }`);
    }
    if (attributes.secondaryBtnIconSpacing_mobile !== undefined) {
        mobileRules.push(`${secondaryBtnSelector} { gap: ${attributes.secondaryBtnIconSpacing_mobile}px; }`);
    }

    // Icon Color
    if (attributes.secondaryBtnIconColor) {
        desktopRules.push(`${secondaryBtnIconSelector} { color: ${attributes.secondaryBtnIconColor}; fill: ${attributes.secondaryBtnIconColor}; }`);
    }

    // Hover State
    if (attributes.secondaryBtnTextColorHover) {
        desktopRules.push(`${secondaryBtnSelector}:hover { color: ${attributes.secondaryBtnTextColorHover}; }`);
    }
    if (attributes.secondaryBtnBackgroundColorHover) {
        desktopRules.push(`${secondaryBtnSelector}:hover { background-color: ${attributes.secondaryBtnBackgroundColorHover}; }`);
    }
    if (attributes.secondaryBtnBorderColorHover) {
        desktopRules.push(`${secondaryBtnSelector}:hover { border-color: ${attributes.secondaryBtnBorderColorHover}; }`);
    }
    if (attributes.secondaryBtnIconColorHover) {
        desktopRules.push(`${secondaryBtnSelector}:hover i { color: ${attributes.secondaryBtnIconColorHover}; }`);
        desktopRules.push(`${secondaryBtnSelector}:hover svg { fill: ${attributes.secondaryBtnIconColorHover}; }`);
    }


    // ==================== GOOGLE BUTTON ====================

    const googleBtnSelector = `${uniqueSelector} .ts-btn.ts-google-btn`;

    // Typography
    const googleBtnTypography = generateTypographyCSS(attributes.googleBtnTypography);
    if (googleBtnTypography.desktop) desktopRules.push(`${googleBtnSelector} { ${googleBtnTypography.desktop} }`);

    // Radius
    if (attributes.googleBtnBorderRadius !== undefined) {
        desktopRules.push(`${googleBtnSelector} { border-radius: ${attributes.googleBtnBorderRadius}px; }`);
    }

    // Text Color
    if (attributes.googleBtnTextColor) {
        desktopRules.push(`${googleBtnSelector} { color: ${attributes.googleBtnTextColor}; }`);
    }

    // Padding
    const googleBtnPadding = generateDimensionsCSS(attributes, 'googleBtnPadding');
    if (googleBtnPadding.desktop) desktopRules.push(`${googleBtnSelector} { ${googleBtnPadding.desktop} }`);

    // Height
    if (attributes.googleBtnHeight !== undefined) {
        desktopRules.push(`${googleBtnSelector} { height: ${attributes.googleBtnHeight}px; min-height: ${attributes.googleBtnHeight}px; }`);
    }

    // Background
    if (attributes.googleBtnBackgroundColor) {
        desktopRules.push(`${googleBtnSelector} { background-color: ${attributes.googleBtnBackgroundColor}; }`);
    }

    // Border
    const googleBtnBorder = generateBorderCSS(attributes, 'googleBtnBorder');
    if (googleBtnBorder.desktop) desktopRules.push(`${googleBtnSelector} { ${googleBtnBorder.desktop} }`);

    // Icon
    const googleBtnIconSelector = `${googleBtnSelector} i, ${googleBtnSelector} svg`;

    // Icon Size
    if (attributes.googleBtnIconSize !== undefined) {
        desktopRules.push(`${googleBtnIconSelector} { font-size: ${attributes.googleBtnIconSize}px; width: ${attributes.googleBtnIconSize}px; height: ${attributes.googleBtnIconSize}px; }`);
    }

    // Icon Spacing
    if (attributes.googleBtnIconSpacing !== undefined) {
        desktopRules.push(`${googleBtnSelector} { gap: ${attributes.googleBtnIconSpacing}px; }`);
    }

    // Icon Color
    if (attributes.googleBtnIconColor) {
        desktopRules.push(`${googleBtnIconSelector} { color: ${attributes.googleBtnIconColor}; fill: ${attributes.googleBtnIconColor}; }`);
    }

    // Hover State
    if (attributes.googleBtnTextColorHover) {
        desktopRules.push(`${googleBtnSelector}:hover { color: ${attributes.googleBtnTextColorHover}; }`);
    }
    if (attributes.googleBtnBackgroundColorHover) {
        desktopRules.push(`${googleBtnSelector}:hover { background-color: ${attributes.googleBtnBackgroundColorHover}; }`);
    }
    if (attributes.googleBtnBorderColorHover) {
        desktopRules.push(`${googleBtnSelector}:hover { border-color: ${attributes.googleBtnBorderColorHover}; }`);
    }
    if (attributes.googleBtnIconColorHover) {
        desktopRules.push(`${googleBtnSelector}:hover i { color: ${attributes.googleBtnIconColorHover}; }`);
        desktopRules.push(`${googleBtnSelector}:hover svg { fill: ${attributes.googleBtnIconColorHover}; }`);
    }


    // ==================== SECTION DIVIDER ====================

    const dividerSelector = `${uniqueSelector} .ts-login-separator`;

    // Typography (for text inside divider)
    const dividerTypography = generateTypographyCSS(attributes.dividerTypography);
    if (dividerTypography.desktop) desktopRules.push(`${uniqueSelector} .ts-separator-text { ${dividerTypography.desktop} }`);

    // Text Color
    if (attributes.dividerTextColor) {
        desktopRules.push(`${uniqueSelector} .ts-separator-text { color: ${attributes.dividerTextColor}; }`);
    }

    // Divider Color
    if (attributes.dividerColor) {
        desktopRules.push(`${dividerSelector}::before, ${dividerSelector}::after { background-color: ${attributes.dividerColor}; }`);
    }

    // Height (Thickness)
    if (attributes.dividerHeight !== undefined) {
        desktopRules.push(`${dividerSelector}::before, ${dividerSelector}::after { height: ${attributes.dividerHeight}px; }`);
    }


    // ==================== WELCOME ====================

    const welcomeSelector = `${uniqueSelector} .ts-welcome-message`;

    // Alignment
    if (attributes.welcomeAlignContent) {
        desktopRules.push(`${welcomeSelector} { align-items: ${attributes.welcomeAlignContent}; }`);
    }
    if (attributes.welcomeTextAlign) {
        desktopRules.push(`${welcomeSelector} { text-align: ${attributes.welcomeTextAlign}; }`);
    }

    // Icon Size
    if (attributes.welcomeIconSize !== undefined) {
        desktopRules.push(`${welcomeSelector} i { font-size: ${attributes.welcomeIconSize}px; }`);
        desktopRules.push(`${welcomeSelector} svg { width: ${attributes.welcomeIconSize}px; height: ${attributes.welcomeIconSize}px; }`);
    }

    // Icon Color
    if (attributes.welcomeIconColor) {
        desktopRules.push(`${welcomeSelector} i { color: ${attributes.welcomeIconColor}; }`);
        desktopRules.push(`${welcomeSelector} svg { fill: ${attributes.welcomeIconColor}; }`);
    }

    // Heading Typography
    const welcomeHeadingTypography = generateTypographyCSS(attributes.welcomeHeadingTypography);
    if (welcomeHeadingTypography.desktop) desktopRules.push(`${welcomeSelector} h2 { ${welcomeHeadingTypography.desktop} }`);
    if (welcomeHeadingTypography.tablet) tabletRules.push(`${welcomeSelector} h2 { ${welcomeHeadingTypography.tablet} }`);
    if (welcomeHeadingTypography.mobile) mobileRules.push(`${welcomeSelector} h2 { ${welcomeHeadingTypography.mobile} }`);

    // Heading Color
    if (attributes.welcomeHeadingColor) {
        desktopRules.push(`${welcomeSelector} h2 { color: ${attributes.welcomeHeadingColor}; }`);
    }

    // Top Margin
    if (attributes.welcomeHeadingTopMargin !== undefined) {
        desktopRules.push(`${welcomeSelector} h2 { margin-top: ${attributes.welcomeHeadingTopMargin}px; }`);
    }


    // ==================== FORM: FILE/GALLERY ====================

    const formFileSelector = `${uniqueSelector} .ts-form-group.ts-file-upload`;

    // Item Gap
    if (attributes.formFileItemGap !== undefined) {
        desktopRules.push(`${formFileSelector} .ts-file-list { gap: ${attributes.formFileItemGap}px; }`);
    }

    const fileSelectSelector = `${formFileSelector} .ts-file-select`;

    // Icon Color
    if (attributes.formFileSelectIconColor) {
        desktopRules.push(`${fileSelectSelector} i { color: ${attributes.formFileSelectIconColor}; }`);
        desktopRules.push(`${fileSelectSelector} svg { fill: ${attributes.formFileSelectIconColor}; }`);
    }

    // Icon Size
    if (attributes.formFileSelectIconSize !== undefined) {
        desktopRules.push(`${fileSelectSelector} i { font-size: ${attributes.formFileSelectIconSize}px; }`);
        desktopRules.push(`${fileSelectSelector} svg { width: ${attributes.formFileSelectIconSize}px; height: ${attributes.formFileSelectIconSize}px; }`);
    }

    // Background
    if (attributes.formFileSelectBackground) {
        desktopRules.push(`${fileSelectSelector} { background-color: ${attributes.formFileSelectBackground}; }`);
    }

    // Border
    const fileSelectBorder = generateBorderCSS(attributes, 'formFileSelectBorder');
    if (fileSelectBorder.desktop) desktopRules.push(`${fileSelectSelector} { ${fileSelectBorder.desktop} }`);

    // Radius
    if (attributes.formFileSelectBorderRadius !== undefined) {
        desktopRules.push(`${fileSelectSelector} { border-radius: ${attributes.formFileSelectBorderRadius}px; }`);
    }

    // Typography
    const fileSelectTypography = generateTypographyCSS(attributes.formFileSelectTypography);
    if (fileSelectTypography.desktop) desktopRules.push(`${fileSelectSelector} { ${fileSelectTypography.desktop} }`);

    // Text Color
    if (attributes.formFileSelectTextColor) {
        desktopRules.push(`${fileSelectSelector} { color: ${attributes.formFileSelectTextColor}; }`);
    }

    // Hover State
    if (attributes.formFileSelectIconColorHover) {
        desktopRules.push(`${fileSelectSelector}:hover i { color: ${attributes.formFileSelectIconColorHover}; }`);
        desktopRules.push(`${fileSelectSelector}:hover svg { fill: ${attributes.formFileSelectIconColorHover}; }`);
    }
    if (attributes.formFileSelectBackgroundHover) {
        desktopRules.push(`${fileSelectSelector}:hover { background-color: ${attributes.formFileSelectBackgroundHover}; }`);
    }
    if (attributes.formFileSelectBorderColorHover) {
        desktopRules.push(`${fileSelectSelector}:hover { border-color: ${attributes.formFileSelectBorderColorHover}; }`);
    }
    if (attributes.formFileSelectTextColorHover) {
        desktopRules.push(`${fileSelectSelector}:hover { color: ${attributes.formFileSelectTextColorHover}; }`);
    }

    // Added File Section
    const fileAddedSelector = `${formFileSelector} .ts-file-item`;

    if (attributes.formFileAddedBorderRadius !== undefined) {
        desktopRules.push(`${fileAddedSelector} { border-radius: ${attributes.formFileAddedBorderRadius}px; }`);
    }
    if (attributes.formFileAddedBackground) {
        desktopRules.push(`${fileAddedSelector} { background-color: ${attributes.formFileAddedBackground}; }`);
    }
    if (attributes.formFileAddedIconColor) {
        desktopRules.push(`${fileAddedSelector} i { color: ${attributes.formFileAddedIconColor}; }`);
        desktopRules.push(`${fileAddedSelector} svg { fill: ${attributes.formFileAddedIconColor}; }`);
    }
    if (attributes.formFileAddedIconSize !== undefined) {
        desktopRules.push(`${fileAddedSelector} i { font-size: ${attributes.formFileAddedIconSize}px; }`);
        desktopRules.push(`${fileAddedSelector} svg { width: ${attributes.formFileAddedIconSize}px; height: ${attributes.formFileAddedIconSize}px; }`);
    }
    const fileAddedTypography = generateTypographyCSS(attributes.formFileAddedTypography);
    if (fileAddedTypography.desktop) desktopRules.push(`${fileAddedSelector} { ${fileAddedTypography.desktop} }`);

    if (attributes.formFileAddedTextColor) {
        desktopRules.push(`${fileAddedSelector} { color: ${attributes.formFileAddedTextColor}; }`);
    }

    // Remove Button
    const fileRemoveSelector = `${fileAddedSelector} .ts-remove-file`;

    if (attributes.formFileRemoveBackground) {
        desktopRules.push(`${fileRemoveSelector} { background-color: ${attributes.formFileRemoveBackground}; }`);
    }
    if (attributes.formFileRemoveBackgroundHover) {
        desktopRules.push(`${fileRemoveSelector}:hover { background-color: ${attributes.formFileRemoveBackgroundHover}; }`);
    }
    if (attributes.formFileRemoveColor) {
        desktopRules.push(`${fileRemoveSelector} { color: ${attributes.formFileRemoveColor}; }`);
    }
    if (attributes.formFileRemoveColorHover) {
        desktopRules.push(`${fileRemoveSelector}:hover { color: ${attributes.formFileRemoveColorHover}; }`);
    }
    if (attributes.formFileRemoveBorderRadius !== undefined) {
        desktopRules.push(`${fileRemoveSelector} { border-radius: ${attributes.formFileRemoveBorderRadius}px; }`);
    }
    if (attributes.formFileRemoveSize !== undefined) {
        desktopRules.push(`${fileRemoveSelector} { width: ${attributes.formFileRemoveSize}px; height: ${attributes.formFileRemoveSize}px; }`);
    }
    if (attributes.formFileRemoveIconSize !== undefined) {
        desktopRules.push(`${fileRemoveSelector} i { font-size: ${attributes.formFileRemoveIconSize}px; }`);
        desktopRules.push(`${fileRemoveSelector} svg { width: ${attributes.formFileRemoveIconSize}px; height: ${attributes.formFileRemoveIconSize}px; }`);
    }

    // ==================== FORM: DIALOG ====================

    const dialogSelector = `${uniqueSelector} .vx-dialog-content`;
    const dialogIconSelector = `${uniqueSelector} .vx-dialog > i`;

    if (attributes.formDialogIconColor) {
        desktopRules.push(`${dialogIconSelector} { color: ${attributes.formDialogIconColor}; }`);
    }
    if (attributes.formDialogIconSize !== undefined) {
        desktopRules.push(`${dialogIconSelector} { font-size: ${attributes.formDialogIconSize}px; }`);
    }
    if (attributes.formDialogTextColor) {
        desktopRules.push(`${dialogSelector} { color: ${attributes.formDialogTextColor}; }`);
    }
    const dialogTypography = generateTypographyCSS(attributes.formDialogTypography);
    if (dialogTypography.desktop) desktopRules.push(`${dialogSelector} { ${dialogTypography.desktop} }`);

    if (attributes.formDialogBackgroundColor) {
        desktopRules.push(`${dialogSelector} { background-color: ${attributes.formDialogBackgroundColor}; }`);
    }
    if (attributes.formDialogRadius !== undefined) {
        desktopRules.push(`${dialogSelector} { border-radius: ${attributes.formDialogRadius}px; }`);
    }
    const dialogShadow = generateBoxShadowCSS(attributes.formDialogBoxShadow);
    if (dialogShadow) {
        desktopRules.push(`${dialogSelector} { box-shadow: ${dialogShadow}; }`);
    }
    const dialogBorder = generateBorderCSS(attributes, 'formDialogBorder');
    if (dialogBorder.desktop) desktopRules.push(`${dialogSelector} { ${dialogBorder.desktop} }`);


    // Compile CSS
    let css = desktopRules.join('\n');

    if (tabletRules.length > 0) {
        css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
    }

    if (mobileRules.length > 0) {
        css += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
    }

    return css;
}
