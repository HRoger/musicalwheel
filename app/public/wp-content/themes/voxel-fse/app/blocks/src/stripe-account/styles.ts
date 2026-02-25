/**
 * Stripe Account Block - Style Generation
 *
 * @package VoxelFSE
 */

import type { StripeAccountAttributes } from './types';
import {
    generateDimensionsCSS,
    generateTypographyCSS,
    generateBorderCSS,
    generateBoxShadowCSS,
} from '@shared/utils/css-generators';

/**
 * Generate block-specific styles for the editor
 */
export function generateBlockStyles(_attributes: StripeAccountAttributes): Record<string, string | number> {
    return {};
}

/**
 * Generate responsive CSS for the block
 */
export function generateBlockResponsiveCSS(
    attributes: StripeAccountAttributes,
    uniqueSelector: string
): string {
    const desktopRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    // Helper to add rules
    const addRule = (selector: string, rule: string, device: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
        if (device === 'desktop') desktopRules.push(`${uniqueSelector} ${selector} { ${rule} }`);
        if (device === 'tablet') tabletRules.push(`${uniqueSelector} ${selector} { ${rule} }`);
        if (device === 'mobile') mobileRules.push(`${uniqueSelector} ${selector} { ${rule} }`);
    };

    // ==================== PANEL ====================
    const panelSelector = '.ts-panel';

    // Border
    const panelBorder = generateBorderCSS(attributes, 'panelBorder');
    if (panelBorder.desktop) addRule(panelSelector, panelBorder.desktop);
    if (panelBorder.tablet) addRule(panelSelector, panelBorder.tablet, 'tablet');
    if (panelBorder.mobile) addRule(panelSelector, panelBorder.mobile, 'mobile');

    // Radius
    if (attributes.panelBorderRadius !== undefined) addRule(panelSelector, `border-radius: ${attributes.panelBorderRadius}px;`);
    if (attributes.panelBorderRadius_tablet !== undefined) addRule(panelSelector, `border-radius: ${attributes.panelBorderRadius_tablet}px;`, 'tablet');
    if (attributes.panelBorderRadius_mobile !== undefined) addRule(panelSelector, `border-radius: ${attributes.panelBorderRadius_mobile}px;`, 'mobile');

    // Background
    if (attributes.panelBackground) addRule(panelSelector, `background-color: ${attributes.panelBackground};`);

    // Box Shadow
    const panelShadow = generateBoxShadowCSS(attributes.panelBoxShadow);
    if (panelShadow) addRule(panelSelector, `box-shadow: ${panelShadow};`);

    // Panel Body
    const panelBodySelector = '.ac-body';

    // Spacing (Padding)
    if (attributes.panelBodySpacing !== undefined) addRule(panelBodySelector, `padding: ${attributes.panelBodySpacing}px;`);
    if (attributes.panelBodySpacing_tablet !== undefined) addRule(panelBodySelector, `padding: ${attributes.panelBodySpacing_tablet}px;`, 'tablet');
    if (attributes.panelBodySpacing_mobile !== undefined) addRule(panelBodySelector, `padding: ${attributes.panelBodySpacing_mobile}px;`, 'mobile');

    // Content Gap
    if (attributes.panelBodyContentGap !== undefined) addRule(panelBodySelector, `gap: ${attributes.panelBodyContentGap}px; display: flex; flex-direction: column;`);
    if (attributes.panelBodyContentGap_tablet !== undefined) addRule(panelBodySelector, `gap: ${attributes.panelBodyContentGap_tablet}px;`, 'tablet');
    if (attributes.panelBodyContentGap_mobile !== undefined) addRule(panelBodySelector, `gap: ${attributes.panelBodyContentGap_mobile}px;`, 'mobile');

    // Typography
    const panelTypography = generateTypographyCSS(attributes.panelTypography);
    if (panelTypography.desktop) addRule(panelSelector, panelTypography.desktop);
    if (panelTypography.tablet) addRule(panelSelector, panelTypography.tablet, 'tablet');
    if (panelTypography.mobile) addRule(panelSelector, panelTypography.mobile, 'mobile');

    // Text Color
    if (attributes.panelTextColor) addRule(panelSelector, `color: ${attributes.panelTextColor};`);


    // ==================== FORM: FIELDS GENERAL ====================
    const labelSelector = '.ts-form-group label';

    // Typography
    const labelTypography = generateTypographyCSS(attributes.fieldLabelTypography);
    if (labelTypography.desktop) addRule(labelSelector, labelTypography.desktop);
    if (labelTypography.tablet) addRule(labelSelector, labelTypography.tablet, 'tablet');
    if (labelTypography.mobile) addRule(labelSelector, labelTypography.mobile, 'mobile');

    // Color
    if (attributes.fieldLabelColor) addRule(labelSelector, `color: ${attributes.fieldLabelColor};`);

    // Select/Unselect Color (Assuming this targets checkboxes/radio labels when selected, or specific voxel classes)
    // Usually Voxel uses specific classes for this. I'll guess .ts-role-item.current or similar if it's role related, but this is "Form Fields".
    // Maybe it's for multiselect items. I'll skip specific selector if unsure or use a generic one like .ts-term-dropdown li.selected
    if (attributes.fieldSelectColor) {
        addRule('.ts-term-dropdown li.selected', `color: ${attributes.fieldSelectColor};`);
        addRule('.ts-term-dropdown li.selected:before', `border-color: ${attributes.fieldSelectColor}; background-color: ${attributes.fieldSelectColor};`);
    }


    // ==================== FORM: INPUT & TEXTAREA ====================
    const inputSelector = '.ts-filter';
    const inputFocusSelector = '.ts-filter:focus';
    const inputHoverSelector = '.ts-filter:hover';

    // Placeholder
    if (attributes.inputPlaceholderColor) addRule(`${inputSelector}::placeholder`, `color: ${attributes.inputPlaceholderColor}; opacity: 1;`);

    const inputPlaceholderTypography = generateTypographyCSS(attributes.inputPlaceholderTypography);
    if (inputPlaceholderTypography.desktop) addRule(`${inputSelector}::placeholder`, inputPlaceholderTypography.desktop);

    // Value (Input Text) - usually covered by general input typography and color
    if (attributes.inputValueTextColor) addRule(inputSelector, `color: ${attributes.inputValueTextColor};`);

    const inputValueTypography = generateTypographyCSS(attributes.inputValueTypography);
    if (inputValueTypography.desktop) addRule(inputSelector, inputValueTypography.desktop);

    // General Input Styles
    if (attributes.inputBackgroundColor) addRule(inputSelector, `background-color: ${attributes.inputBackgroundColor};`);

    const inputBorder = generateBorderCSS(attributes, 'inputBorder');
    if (inputBorder.desktop) addRule(inputSelector, inputBorder.desktop);
    if (inputBorder.tablet) addRule(inputSelector, inputBorder.tablet, 'tablet');
    if (inputBorder.mobile) addRule(inputSelector, inputBorder.mobile, 'mobile');

    if (attributes.inputBorderRadius !== undefined) addRule(inputSelector, `border-radius: ${attributes.inputBorderRadius}px;`);
    if (attributes.inputBorderRadius_tablet !== undefined) addRule(inputSelector, `border-radius: ${attributes.inputBorderRadius_tablet}px;`, 'tablet');
    if (attributes.inputBorderRadius_mobile !== undefined) addRule(inputSelector, `border-radius: ${attributes.inputBorderRadius_mobile}px;`, 'mobile');

    if (attributes.inputHeight !== undefined) addRule(inputSelector, `height: ${attributes.inputHeight}px;`);
    if (attributes.inputHeight_tablet !== undefined) addRule(inputSelector, `height: ${attributes.inputHeight_tablet}px;`, 'tablet');
    if (attributes.inputHeight_mobile !== undefined) addRule(inputSelector, `height: ${attributes.inputHeight_mobile}px;`, 'mobile');

    // Textarea specific
    const textareaSelector = 'textarea.ts-filter';
    const textareaPadding = generateDimensionsCSS(attributes, 'textareaPadding');
    if (textareaPadding.desktop) addRule(textareaSelector, textareaPadding.desktop);

    if (attributes.textareaHeight !== undefined) addRule(textareaSelector, `height: ${attributes.textareaHeight}px; min-height: ${attributes.textareaHeight}px;`);
    if (attributes.textareaHeight_tablet !== undefined) addRule(textareaSelector, `height: ${attributes.textareaHeight_tablet}px; min-height: ${attributes.textareaHeight_tablet}px;`, 'tablet');
    if (attributes.textareaHeight_mobile !== undefined) addRule(textareaSelector, `height: ${attributes.textareaHeight_mobile}px; min-height: ${attributes.textareaHeight_mobile}px;`, 'mobile');

    if (attributes.textareaBorderRadius !== undefined) addRule(textareaSelector, `border-radius: ${attributes.textareaBorderRadius}px;`);

    // Input States (Hover/Active)
    if (attributes.inputBackgroundColorHover) addRule(inputHoverSelector, `background-color: ${attributes.inputBackgroundColorHover};`);
    if (attributes.inputBorderColorHover) addRule(inputHoverSelector, `border-color: ${attributes.inputBorderColorHover};`);
    if (attributes.inputPlaceholderColorHover) addRule(`${inputHoverSelector}::placeholder`, `color: ${attributes.inputPlaceholderColorHover};`);
    if (attributes.inputTextColorHover) addRule(inputHoverSelector, `color: ${attributes.inputTextColorHover};`);
    // Icon hover (if input has icon)
    if (attributes.inputIconColorHover) addRule('.ts-input-icon:hover i', `color: ${attributes.inputIconColorHover};`);

    if (attributes.inputBackgroundColorActive) addRule(inputFocusSelector, `background-color: ${attributes.inputBackgroundColorActive};`);
    if (attributes.inputBorderColorActive) addRule(inputFocusSelector, `border-color: ${attributes.inputBorderColorActive};`);
    if (attributes.inputPlaceholderColorActive) addRule(`${inputFocusSelector}::placeholder`, `color: ${attributes.inputPlaceholderColorActive};`);
    if (attributes.inputTextColorActive) addRule(inputFocusSelector, `color: ${attributes.inputTextColorActive};`);


    // ==================== FORM: INPUT SUFFIX ====================
    const suffixSelector = '.input-suffix'; // or .ts-input-suffix depending on markup

    const suffixTypography = generateTypographyCSS(attributes.inputSuffixButtonTypography);
    if (suffixTypography.desktop) addRule(suffixSelector, suffixTypography.desktop);

    if (attributes.inputSuffixTextColor) addRule(suffixSelector, `color: ${attributes.inputSuffixTextColor};`);
    if (attributes.inputSuffixBackgroundColor) addRule(suffixSelector, `background-color: ${attributes.inputSuffixBackgroundColor};`);

    if (attributes.inputSuffixBorderRadius !== undefined) addRule(suffixSelector, `border-radius: ${attributes.inputSuffixBorderRadius}px;`);

    const suffixShadow = generateBoxShadowCSS(attributes.inputSuffixBoxShadow);
    if (suffixShadow) addRule(suffixSelector, `box-shadow: ${suffixShadow};`);

    if (attributes.inputSuffixSideMargin !== undefined) addRule(suffixSelector, `inset-inline-end: ${attributes.inputSuffixSideMargin}px;`);

    if (attributes.inputSuffixIconColor) addRule(`${suffixSelector} i`, `color: ${attributes.inputSuffixIconColor};`);


    // ==================== FORM: SWITCHER ====================
    const switcherLabel = '.onoffswitch-label';
    const switcherCheckbox = '.onoffswitch-checkbox';

    if (attributes.switcherBackgroundInactive) addRule(switcherLabel, `background-color: ${attributes.switcherBackgroundInactive};`);

    if (attributes.switcherBackgroundActive) addRule(`${switcherCheckbox}:checked + ${switcherLabel}`, `background-color: ${attributes.switcherBackgroundActive};`);

    if (attributes.switcherHandleBackground) addRule(`${switcherLabel}:before`, `background-color: ${attributes.switcherHandleBackground};`);


    // ==================== FORM: SELECT ====================
    const selectSelector = '.ts-filter select'; // Select inside wrapper
    const selectWrapper = 'div.ts-filter';

    const selectShadow = generateBoxShadowCSS(attributes.selectBoxShadow);
    if (selectShadow) addRule(selectWrapper, `box-shadow: ${selectShadow};`);

    if (attributes.selectBackgroundColor) addRule(selectWrapper, `background-color: ${attributes.selectBackgroundColor};`);
    if (attributes.selectBackgroundColor) addRule(selectSelector, `background-color: ${attributes.selectBackgroundColor};`); // Apply to select too to cover

    if (attributes.selectTextColor) addRule(selectSelector, `color: ${attributes.selectTextColor};`);

    const selectBorder = generateBorderCSS(attributes, 'selectBorder');
    if (selectBorder.desktop) addRule(selectWrapper, selectBorder.desktop);

    if (attributes.selectBorderRadius !== undefined) addRule(selectWrapper, `border-radius: ${attributes.selectBorderRadius}px;`);

    // Chevron
    if (attributes.selectHideChevron) addRule('.ts-down-icon', 'display: none;');
    if (attributes.selectChevronColor) addRule('.ts-down-icon', `color: ${attributes.selectChevronColor};`);

    // Select Hover
    if (attributes.selectBackgroundColorHover) addRule(`${selectWrapper}:hover`, `background-color: ${attributes.selectBackgroundColorHover};`);
    if (attributes.selectTextColorHover) addRule(`${selectWrapper}:hover select`, `color: ${attributes.selectTextColorHover};`);
    if (attributes.selectBorderColorHover) addRule(`${selectWrapper}:hover`, `border-color: ${attributes.selectBorderColorHover};`);
    if (attributes.selectIconColorHover) addRule(`${selectWrapper}:hover .ts-down-icon`, `color: ${attributes.selectIconColorHover};`);

    const selectShadowHover = generateBoxShadowCSS(attributes.selectBoxShadowHover);
    if (selectShadowHover) addRule(`${selectWrapper}:hover`, `box-shadow: ${selectShadowHover};`);


    // ==================== FORM: TABS ====================
    const tabsSelector = '.ts-tabs'; // Container
    const tabItemSelector = '.ts-tab'; // Individual tab

    if (attributes.tabsGap !== undefined) addRule(tabsSelector, `gap: ${attributes.tabsGap}px;`);

    // Tab Item Normal
    if (attributes.tabsBackground) addRule(tabItemSelector, `background-color: ${attributes.tabsBackground};`);

    const tabsBorder = generateBorderCSS(attributes, 'tabsBorder');
    if (tabsBorder.desktop) addRule(tabItemSelector, tabsBorder.desktop);

    if (attributes.tabsBorderRadius !== undefined) addRule(tabItemSelector, `border-radius: ${attributes.tabsBorderRadius}px;`);

    const tabsTypography = generateTypographyCSS(attributes.tabsTextTypography);
    if (tabsTypography.desktop) addRule(tabItemSelector, tabsTypography.desktop);

    if (attributes.tabsTextColor) addRule(tabItemSelector, `color: ${attributes.tabsTextColor};`);

    // Tab Item Selected
    const tabSelectedSelector = '.ts-tab.active';
    if (attributes.tabsBackgroundSelected) addRule(tabSelectedSelector, `background-color: ${attributes.tabsBackgroundSelected};`);
    if (attributes.tabsColorSelected) addRule(tabSelectedSelector, `color: ${attributes.tabsColorSelected};`);
    if (attributes.tabsBorderColorSelected) addRule(tabSelectedSelector, `border-color: ${attributes.tabsBorderColorSelected};`);

    const tabsShadow = generateBoxShadowCSS(attributes.tabsBoxShadowSelected);
    if (tabsShadow) addRule(tabSelectedSelector, `box-shadow: ${tabsShadow};`);


    // ==================== BUTTONS ====================
    // Primary
    const primaryBtn = '.ts-btn-2';
    const primaryBtnTypography = generateTypographyCSS(attributes.primaryButtonTypography);
    if (primaryBtnTypography.desktop) addRule(primaryBtn, primaryBtnTypography.desktop);

    const primaryBtnBorder = generateBorderCSS(attributes, 'primaryButtonBorder');
    if (primaryBtnBorder.desktop) addRule(primaryBtn, primaryBtnBorder.desktop);

    if (attributes.primaryButtonBorderRadius !== undefined) addRule(primaryBtn, `border-radius: ${attributes.primaryButtonBorderRadius}px;`);

    const primaryBtnShadow = generateBoxShadowCSS(attributes.primaryButtonBoxShadow);
    if (primaryBtnShadow) addRule(primaryBtn, `box-shadow: ${primaryBtnShadow};`);

    if (attributes.primaryButtonTextColor) addRule(primaryBtn, `color: ${attributes.primaryButtonTextColor};`);
    if (attributes.primaryButtonBackgroundColor) addRule(primaryBtn, `background-color: ${attributes.primaryButtonBackgroundColor};`);

    // Hover
    if (attributes.primaryButtonTextColorHover) addRule(`${primaryBtn}:hover`, `color: ${attributes.primaryButtonTextColorHover};`);
    if (attributes.primaryButtonBackgroundColorHover) addRule(`${primaryBtn}:hover`, `background-color: ${attributes.primaryButtonBackgroundColorHover};`);
    if (attributes.primaryButtonBorderColorHover) addRule(`${primaryBtn}:hover`, `border-color: ${attributes.primaryButtonBorderColorHover};`);

    // Secondary
    const secondaryBtn = '.ts-btn-1';
    const secondaryBtnTypography = generateTypographyCSS(attributes.secondaryButtonTypography);
    if (secondaryBtnTypography.desktop) addRule(secondaryBtn, secondaryBtnTypography.desktop);

    const secondaryBtnBorder = generateBorderCSS(attributes, 'secondaryButtonBorder');
    if (secondaryBtnBorder.desktop) addRule(secondaryBtn, secondaryBtnBorder.desktop);

    if (attributes.secondaryButtonBorderRadius !== undefined) addRule(secondaryBtn, `border-radius: ${attributes.secondaryButtonBorderRadius}px;`);
    if (attributes.secondaryButtonTextColor) addRule(secondaryBtn, `color: ${attributes.secondaryButtonTextColor};`);

    const secondaryBtnPadding = generateDimensionsCSS(attributes, 'secondaryButtonPadding');
    if (secondaryBtnPadding.desktop) addRule(secondaryBtn, secondaryBtnPadding.desktop);

    if (attributes.secondaryButtonBackgroundColor) addRule(secondaryBtn, `background-color: ${attributes.secondaryButtonBackgroundColor};`);

    // Hover
    if (attributes.secondaryButtonTextColorHover) addRule(`${secondaryBtn}:hover`, `color: ${attributes.secondaryButtonTextColorHover};`);
    if (attributes.secondaryButtonBackgroundColorHover) addRule(`${secondaryBtn}:hover`, `background-color: ${attributes.secondaryButtonBackgroundColorHover};`);
    if (attributes.secondaryButtonBorderColorHover) addRule(`${secondaryBtn}:hover`, `border-color: ${attributes.secondaryButtonBorderColorHover};`);


    // Tertiary
    const tertiaryBtn = '.ts-btn-4';
    if (attributes.tertiaryButtonIconColor) addRule(`${tertiaryBtn} i`, `color: ${attributes.tertiaryButtonIconColor};`);
    if (attributes.tertiaryButtonBackground) addRule(tertiaryBtn, `background-color: ${attributes.tertiaryButtonBackground};`);

    const tertiaryBtnBorder = generateBorderCSS(attributes, 'tertiaryButtonBorder');
    if (tertiaryBtnBorder.desktop) addRule(tertiaryBtn, tertiaryBtnBorder.desktop);

    if (attributes.tertiaryButtonBorderRadius !== undefined) addRule(tertiaryBtn, `border-radius: ${attributes.tertiaryButtonBorderRadius}px;`);

    const tertiaryBtnTypography = generateTypographyCSS(attributes.tertiaryButtonTypography);
    if (tertiaryBtnTypography.desktop) addRule(tertiaryBtn, tertiaryBtnTypography.desktop);

    if (attributes.tertiaryButtonTextColor) addRule(tertiaryBtn, `color: ${attributes.tertiaryButtonTextColor};`);

    // Hover
    if (attributes.tertiaryButtonIconColorHover) addRule(`${tertiaryBtn}:hover i`, `color: ${attributes.tertiaryButtonIconColorHover};`);
    if (attributes.tertiaryButtonBackgroundHover) addRule(`${tertiaryBtn}:hover`, `background-color: ${attributes.tertiaryButtonBackgroundHover};`);
    if (attributes.tertiaryButtonBorderColorHover) addRule(`${tertiaryBtn}:hover`, `border-color: ${attributes.tertiaryButtonBorderColorHover};`);
    if (attributes.tertiaryButtonTextColorHover) addRule(`${tertiaryBtn}:hover`, `color: ${attributes.tertiaryButtonTextColorHover};`);


    // ==================== FORM: HEADING ====================
    const headingSelector = '.ui-heading-field label';
    const headingTypography = generateTypographyCSS(attributes.headingTypography);
    if (headingTypography.desktop) addRule(headingSelector, headingTypography.desktop);
    if (attributes.headingColor) addRule(headingSelector, `color: ${attributes.headingColor};`);


    // ==================== FORM: REPEATER ====================
    const repeaterItemSelector = '.ts-field-repeater';
    if (attributes.repeaterBackground) addRule(repeaterItemSelector, `background-color: ${attributes.repeaterBackground};`);

    const repeaterBorder = generateBorderCSS(attributes, 'repeaterBorder');
    if (repeaterBorder.desktop) addRule(repeaterItemSelector, repeaterBorder.desktop);

    if (attributes.repeaterBorderRadius !== undefined) addRule(repeaterItemSelector, `border-radius: ${attributes.repeaterBorderRadius}px;`);
    if (attributes.repeaterBorderRadius_tablet !== undefined) addRule(repeaterItemSelector, `border-radius: ${attributes.repeaterBorderRadius_tablet}px;`, 'tablet');
    if (attributes.repeaterBorderRadius_mobile !== undefined) addRule(repeaterItemSelector, `border-radius: ${attributes.repeaterBorderRadius_mobile}px;`, 'mobile');

    const repeaterShadow = generateBoxShadowCSS(attributes.repeaterBoxShadow);
    if (repeaterShadow) addRule(repeaterItemSelector, `box-shadow: ${repeaterShadow};`);


    // ==================== FORM: REPEATER HEAD ====================
    const repeaterHeadSelector = '.ts-repeater-head';
    const repeaterSecondarySelector = '.ts-repeater-head label span'; // Assuming span for secondary text

    if (attributes.repeaterHeadSecondaryColor) addRule(repeaterSecondarySelector, `color: ${attributes.repeaterHeadSecondaryColor};`);

    const repeaterSecondaryTypography = generateTypographyCSS(attributes.repeaterHeadSecondaryTypography);
    if (repeaterSecondaryTypography.desktop) addRule(repeaterSecondarySelector, repeaterSecondaryTypography.desktop);

    if (attributes.repeaterHeadIconColor) addRule(`${repeaterHeadSelector} i`, `color: ${attributes.repeaterHeadIconColor};`);
    if (attributes.repeaterHeadBorderColor) addRule(repeaterHeadSelector, `border-bottom: 1px solid ${attributes.repeaterHeadBorderColor};`); // Using border-bottom as it's a head

    if (attributes.repeaterHeadBorderWidth !== undefined) addRule(repeaterHeadSelector, `border-bottom-width: ${attributes.repeaterHeadBorderWidth}px;`);
    if (attributes.repeaterHeadBorderWidth_tablet !== undefined) addRule(repeaterHeadSelector, `border-bottom-width: ${attributes.repeaterHeadBorderWidth_tablet}px;`, 'tablet');
    if (attributes.repeaterHeadBorderWidth_mobile !== undefined) addRule(repeaterHeadSelector, `border-bottom-width: ${attributes.repeaterHeadBorderWidth_mobile}px;`, 'mobile');


    // ==================== REPEATER: ICON BUTTON ====================
    const iconBtnSelector = '.ts-icon-btn';
    if (attributes.repeaterIconButtonColor) addRule(iconBtnSelector, `color: ${attributes.repeaterIconButtonColor};`);
    if (attributes.repeaterIconButtonBackground) addRule(iconBtnSelector, `background-color: ${attributes.repeaterIconButtonBackground};`);

    const iconBtnBorder = generateBorderCSS(attributes, 'repeaterIconButtonBorder');
    if (iconBtnBorder.desktop) addRule(iconBtnSelector, iconBtnBorder.desktop);

    if (attributes.repeaterIconButtonBorderRadius !== undefined) addRule(iconBtnSelector, `border-radius: ${attributes.repeaterIconButtonBorderRadius}px;`);
    if (attributes.repeaterIconButtonBorderRadius_tablet !== undefined) addRule(iconBtnSelector, `border-radius: ${attributes.repeaterIconButtonBorderRadius_tablet}px;`, 'tablet');
    if (attributes.repeaterIconButtonBorderRadius_mobile !== undefined) addRule(iconBtnSelector, `border-radius: ${attributes.repeaterIconButtonBorderRadius_mobile}px;`, 'mobile');

    if (attributes.repeaterIconButtonColorHover) addRule(`${iconBtnSelector}:hover`, `color: ${attributes.repeaterIconButtonColorHover};`);
    if (attributes.repeaterIconButtonBackgroundHover) addRule(`${iconBtnSelector}:hover`, `background-color: ${attributes.repeaterIconButtonBackgroundHover};`);
    if (attributes.repeaterIconButtonBorderColorHover) addRule(`${iconBtnSelector}:hover`, `border-color: ${attributes.repeaterIconButtonBorderColorHover};`);


    // ==================== FORM: PILLS ====================
    const pillSelector = '.attribute-select a';
    const pillTypography = generateTypographyCSS(attributes.pillsTypography);
    if (pillTypography.desktop) addRule(pillSelector, pillTypography.desktop);

    if (attributes.pillsBorderRadius !== undefined) addRule(pillSelector, `border-radius: ${attributes.pillsBorderRadius}px;`);
    if (attributes.pillsBorderRadius_tablet !== undefined) addRule(pillSelector, `border-radius: ${attributes.pillsBorderRadius_tablet}px;`, 'tablet');
    if (attributes.pillsBorderRadius_mobile !== undefined) addRule(pillSelector, `border-radius: ${attributes.pillsBorderRadius_mobile}px;`, 'mobile');

    if (attributes.pillsTextColor) addRule(pillSelector, `color: ${attributes.pillsTextColor};`);
    if (attributes.pillsBackgroundColor) addRule(pillSelector, `background-color: ${attributes.pillsBackgroundColor};`);

    if (attributes.pillsTextColorHover) addRule(`${pillSelector}:hover`, `color: ${attributes.pillsTextColorHover};`);
    if (attributes.pillsBackgroundColorHover) addRule(`${pillSelector}:hover`, `background-color: ${attributes.pillsBackgroundColorHover};`);


    // ==================== BUTTONS REFINEMENT ====================
    // Primary Icon
    if (attributes.primaryButtonIconColor) addRule(`${primaryBtn} i`, `color: ${attributes.primaryButtonIconColor};`);
    if (attributes.primaryButtonIconColorHover) addRule(`${primaryBtn}:hover i`, `color: ${attributes.primaryButtonIconColorHover};`);

    if (attributes.primaryButtonIconSize !== undefined) addRule(`${primaryBtn} i`, `font-size: ${attributes.primaryButtonIconSize}px;`);
    if (attributes.primaryButtonIconSize_tablet !== undefined) addRule(`${primaryBtn} i`, `font-size: ${attributes.primaryButtonIconSize_tablet}px;`, 'tablet');
    if (attributes.primaryButtonIconSize_mobile !== undefined) addRule(`${primaryBtn} i`, `font-size: ${attributes.primaryButtonIconSize_mobile}px;`, 'mobile');

    if (attributes.primaryButtonIconTextSpacing !== undefined) addRule(primaryBtn, `gap: ${attributes.primaryButtonIconTextSpacing}px;`);
    if (attributes.primaryButtonIconTextSpacing_tablet !== undefined) addRule(primaryBtn, `gap: ${attributes.primaryButtonIconTextSpacing_tablet}px;`, 'tablet');
    if (attributes.primaryButtonIconTextSpacing_mobile !== undefined) addRule(primaryBtn, `gap: ${attributes.primaryButtonIconTextSpacing_mobile}px;`, 'mobile');

    // Secondary Height & Icon
    if (attributes.secondaryButtonHeight !== undefined) addRule(secondaryBtn, `height: ${attributes.secondaryButtonHeight}px;`);
    if (attributes.secondaryButtonHeight_tablet !== undefined) addRule(secondaryBtn, `height: ${attributes.secondaryButtonHeight_tablet}px;`, 'tablet');
    if (attributes.secondaryButtonHeight_mobile !== undefined) addRule(secondaryBtn, `height: ${attributes.secondaryButtonHeight_mobile}px;`, 'mobile');

    if (attributes.secondaryButtonIconSize !== undefined) addRule(`${secondaryBtn} i`, `font-size: ${attributes.secondaryButtonIconSize}px;`);
    if (attributes.secondaryButtonIconSize_tablet !== undefined) addRule(`${secondaryBtn} i`, `font-size: ${attributes.secondaryButtonIconSize_tablet}px;`, 'tablet');
    if (attributes.secondaryButtonIconSize_mobile !== undefined) addRule(`${secondaryBtn} i`, `font-size: ${attributes.secondaryButtonIconSize_mobile}px;`, 'mobile');

    if (attributes.secondaryButtonIconRightPadding !== undefined) addRule(`${secondaryBtn} i`, `margin-inline-end: ${attributes.secondaryButtonIconRightPadding}px;`);
    if (attributes.secondaryButtonIconRightPadding_tablet !== undefined) addRule(`${secondaryBtn} i`, `margin-inline-end: ${attributes.secondaryButtonIconRightPadding_tablet}px;`, 'tablet');
    if (attributes.secondaryButtonIconRightPadding_mobile !== undefined) addRule(`${secondaryBtn} i`, `margin-inline-end: ${attributes.secondaryButtonIconRightPadding_mobile}px;`, 'mobile');

    if (attributes.secondaryButtonIconColor) addRule(`${secondaryBtn} i`, `color: ${attributes.secondaryButtonIconColor};`);
    if (attributes.secondaryButtonIconColorHover) addRule(`${secondaryBtn}:hover i`, `color: ${attributes.secondaryButtonIconColorHover};`);

    // Tertiary Icon
    if (attributes.tertiaryButtonIconSize !== undefined) addRule(`${tertiaryBtn} i`, `font-size: ${attributes.tertiaryButtonIconSize}px;`);
    if (attributes.tertiaryButtonIconSize_tablet !== undefined) addRule(`${tertiaryBtn} i`, `font-size: ${attributes.tertiaryButtonIconSize_tablet}px;`, 'tablet');
    if (attributes.tertiaryButtonIconSize_mobile !== undefined) addRule(`${tertiaryBtn} i`, `font-size: ${attributes.tertiaryButtonIconSize_mobile}px;`, 'mobile');


    // Combine rules
    const css = [
        desktopRules.join('\n'),
        tabletRules.length ? `@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}` : '',
        mobileRules.length ? `@media (max-width: 768px) {\n${mobileRules.join('\n')}\n}` : '',
    ].join('\n');

    return css;
}
