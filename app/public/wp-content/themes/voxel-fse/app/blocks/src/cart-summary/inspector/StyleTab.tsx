/**
 * Cart Summary Block - Style Tab
 *
 * Inspector controls for the Style tab.
 *
 * @package VoxelFSE
 */

import {
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
    AccordionPanelGroup,
    AccordionPanel,
    ColorControl,
    TypographyControl,
    BoxShadowPopup,
    ResponsiveDimensionsControl,
    ResponsiveRangeControlWithDropdown,
    SliderControl,
    SectionHeading,
    StyleTabPanel,
    BorderGroupControl,
} from '@shared/controls';

import type { StyleTab } from '@shared/controls/StyleTabPanel';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
import type { CartSummaryBlockAttributes } from '../types';

interface StyleTabProps {
    attributes: CartSummaryBlockAttributes;
    setAttributes: (attributes: Partial<CartSummaryBlockAttributes>) => void;
}

const normalHoverTabs: StyleTab[] = [
    { name: 'normal', title: __('Normal', 'voxel-fse') },
    { name: 'hover', title: __('Hover', 'voxel-fse') },
];

const normalSelectedTabs: StyleTab[] = [
    { name: 'normal', title: __('Normal', 'voxel-fse') },
    { name: 'selected', title: __('Selected', 'voxel-fse') },
];

const normalHoverFilledTabs: StyleTab[] = [
    { name: 'normal', title: __('Normal', 'voxel-fse') },
    { name: 'hover', title: __('Hover', 'voxel-fse') },
    { name: 'filled', title: __('Filled', 'voxel-fse') },
];

const normalHoverActiveTabs: StyleTab[] = [
    { name: 'normal', title: __('Normal', 'voxel-fse') },
    { name: 'hover', title: __('Hover', 'voxel-fse') },
    { name: 'active', title: __('Active', 'voxel-fse') },
];

export default function StyleTab({ attributes, setAttributes }: StyleTabProps) {
    return (
        <AccordionPanelGroup
            defaultPanel="general"
            attributes={attributes}
            setAttributes={setAttributes}
        >
            {/* General Section */}
            <AccordionPanel id="general" title={__('General', 'voxel-fse')}>
                <SectionHeading label={__('Sections', 'voxel-fse')} />
                <ResponsiveRangeControlWithDropdown
                    label={__('Spacing', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="sectionSpacing"
                    min={0}
                    max={100}
                />

                <SectionHeading label={__('Title', 'voxel-fse')} />
                <TypographyControl
                    label={__('Title typography', 'voxel-fse')}
                    value={attributes.titleTypography}
                    onChange={(value) => setAttributes({ titleTypography: value })}
                />
                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.titleColor}
                    onChange={(value) => setAttributes({ titleColor: value })}
                />

                <SectionHeading label={__('Empty cart', 'voxel-fse')} />
                <ResponsiveRangeControlWithDropdown
                    label={__('Content gap', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="emptyCartGap"
                    min={0}
                    max={100}
                />
                <ResponsiveRangeControlWithDropdown
                    label={__('Icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="emptyCartIconSize"
                    min={0}
                    max={200}
                />
                <ColorControl
                    label={__('Icon color', 'voxel-fse')}
                    value={attributes.emptyCartIconColor}
                    onChange={(value) => setAttributes({ emptyCartIconColor: value })}
                />
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.emptyCartTypography}
                    onChange={(value) => setAttributes({ emptyCartTypography: value })}
                />
                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.emptyCartTextColor}
                    onChange={(value) => setAttributes({ emptyCartTextColor: value })}
                />
            </AccordionPanel>

            {/* Primary Button */}
            <AccordionPanel id="primary_btn" title={__('Primary button', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        value={attributes.primaryBtnTypography}
                                        onChange={(value) => setAttributes({ primaryBtnTypography: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.primaryBtnBorderType || '',
                                            borderWidth: attributes.primaryBtnBorderWidth || {},
                                            borderColor: attributes.primaryBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.primaryBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.primaryBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.primaryBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="primaryBtnBoxShadow"
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.primaryBtnTextColor}
                                        onChange={(value) => setAttributes({ primaryBtnTextColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.primaryBtnBgColor}
                                        onChange={(value) => setAttributes({ primaryBtnBgColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.primaryBtnIconColor}
                                        onChange={(value) => setAttributes({ primaryBtnIconColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconSpacing"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.primaryBtnTextColorHover}
                                        onChange={(value) => setAttributes({ primaryBtnTextColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.primaryBtnBgColorHover}
                                        onChange={(value) => setAttributes({ primaryBtnBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.primaryBtnBorderColorHover}
                                        onChange={(value) => setAttributes({ primaryBtnBorderColorHover: value })}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="primaryBtnBoxShadowHover"
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.primaryBtnIconColorHover}
                                        onChange={(value) => setAttributes({ primaryBtnIconColorHover: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Secondary Button */}
            <AccordionPanel id="secondary_btn" title={__('Secondary button', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        value={attributes.secondaryBtnTypography}
                                        onChange={(value) => setAttributes({ secondaryBtnTypography: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.secondaryBtnTextColor}
                                        onChange={(value) => setAttributes({ secondaryBtnTextColor: value })}
                                    />
                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnPadding"
                                        availableUnits={['px', '%', 'em']}
                                    />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.secondaryBtnBgColor}
                                        onChange={(value) => setAttributes({ secondaryBtnBgColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.secondaryBtnBorderType || '',
                                            borderWidth: attributes.secondaryBtnBorderWidth || {},
                                            borderColor: attributes.secondaryBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.secondaryBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.secondaryBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.secondaryBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconSpacing"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.secondaryBtnIconColor}
                                        onChange={(value) => setAttributes({ secondaryBtnIconColor: value })}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.secondaryBtnTextColorHover}
                                        onChange={(value) => setAttributes({ secondaryBtnTextColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.secondaryBtnBgColorHover}
                                        onChange={(value) => setAttributes({ secondaryBtnBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.secondaryBtnBorderColorHover}
                                        onChange={(value) => setAttributes({ secondaryBtnBorderColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.secondaryBtnIconColorHover}
                                        onChange={(value) => setAttributes({ secondaryBtnIconColorHover: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Loading */}
            <AccordionPanel id="loading" title={__('Loading', 'voxel-fse')}>
                <ColorControl
                    label={__('Color 1', 'voxel-fse')}
                    value={attributes.loaderColor1}
                    onChange={(value) => setAttributes({ loaderColor1: value })}
                />
                <ColorControl
                    label={__('Color 2', 'voxel-fse')}
                    value={attributes.loaderColor2}
                    onChange={(value) => setAttributes({ loaderColor2: value })}
                />
            </AccordionPanel>

            {/* Radio/Checkboxes */}
            <AccordionPanel id="radio_checkboxes" title={__('Radio/Checkboxes', 'voxel-fse')}>
                <StyleTabPanel tabs={normalSelectedTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <ColorControl
                                    label={__('Border-color', 'voxel-fse')}
                                    value={attributes.checkboxBorderColor}
                                    onChange={(value) => setAttributes({ checkboxBorderColor: value })}
                                />
                            )}
                            {tab.name === 'selected' && (
                                <>
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.checkboxSelectedBgColor}
                                        onChange={(value) => setAttributes({ checkboxSelectedBgColor: value })}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="checkboxSelectedBoxShadow"
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Cart styling */}
            <AccordionPanel id="cart_styling" title={__('Cart styling', 'voxel-fse')}>
                <ResponsiveRangeControlWithDropdown
                    label={__('Item spacing', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="cartItemSpacing"
                    min={0}
                    max={100}
                />
                <ResponsiveRangeControlWithDropdown
                    label={__('Item content spacing', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="cartItemContentSpacing"
                    min={0}
                    max={100}
                />
                <ResponsiveRangeControlWithDropdown
                    label={__('Picture size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="cartPictureSize"
                    min={0}
                    max={200}
                />
                <ResponsiveRangeControlWithDropdown
                    label={__('Picture radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="cartPictureRadius"
                    min={0}
                    max={100}
                />
                <TypographyControl
                    label={__('Title typography', 'voxel-fse')}
                    value={attributes.cartTitleTypography}
                    onChange={(value) => setAttributes({ cartTitleTypography: value })}
                />
                <ColorControl
                    label={__('Color', 'voxel-fse')}
                    value={attributes.cartTitleColor}
                    onChange={(value) => setAttributes({ cartTitleColor: value })}
                />
                <TypographyControl
                    label={__('Title typography', 'voxel-fse')}
                    value={attributes.cartSubtitleTypography}
                    onChange={(value) => setAttributes({ cartSubtitleTypography: value })}
                />
                <ColorControl
                    label={__('Color', 'voxel-fse')}
                    value={attributes.cartSubtitleColor}
                    onChange={(value) => setAttributes({ cartSubtitleColor: value })}
                />
            </AccordionPanel>

            {/* Icon Button */}
            <AccordionPanel id="icon_btn" title={__('Icon Button', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <ColorControl
                                        label={__('Button icon color', 'voxel-fse')}
                                        value={attributes.iconBtnColor}
                                        onChange={(value) => setAttributes({ iconBtnColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Button background', 'voxel-fse')}
                                        value={attributes.iconBtnBgColor}
                                        onChange={(value) => setAttributes({ iconBtnBgColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.iconBtnBorderType || '',
                                            borderWidth: attributes.iconBtnBorderWidth || {},
                                            borderColor: attributes.iconBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.iconBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.iconBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.iconBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Button border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="iconBtnRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <SliderControl
                                        label={__('Value size', 'voxel-fse')}
                                        value={attributes.iconBtnValueSize ?? undefined}
                                        onChange={(value) => setAttributes({ iconBtnValueSize: value ?? null })}
                                        min={0}
                                        max={100}
                                    />
                                    <ColorControl
                                        label={__('Value color', 'voxel-fse')}
                                        value={attributes.iconBtnValueColor}
                                        onChange={(value) => setAttributes({ iconBtnValueColor: value })}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <ColorControl
                                        label={__('Button icon color', 'voxel-fse')}
                                        value={attributes.iconBtnColorHover}
                                        onChange={(value) => setAttributes({ iconBtnColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Button background color', 'voxel-fse')}
                                        value={attributes.iconBtnBgColorHover}
                                        onChange={(value) => setAttributes({ iconBtnBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Button border color', 'voxel-fse')}
                                        value={attributes.iconBtnBorderColorHover}
                                        onChange={(value) => setAttributes({ iconBtnBorderColorHover: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Dropdown button */}
            <AccordionPanel id="dropdown_btn" title={__('Dropdown button', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverFilledTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Style', 'voxel-fse')} />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.dropdownTypography}
                                        onChange={(value) => setAttributes({ dropdownTypography: value })}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="dropdownBoxShadow"
                                    />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.dropdownBgColor}
                                        onChange={(value) => setAttributes({ dropdownBgColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.dropdownTextColor}
                                        onChange={(value) => setAttributes({ dropdownTextColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.dropdownBorderType || '',
                                            borderWidth: attributes.dropdownBorderWidth || {},
                                            borderColor: attributes.dropdownBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.dropdownBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.dropdownBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.dropdownBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="dropdownRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="dropdownHeight"
                                        min={0}
                                        max={200}
                                        availableUnits={['px']}
                                    />
                                    <SectionHeading label={__('Icons', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.dropdownIconColor}
                                        onChange={(value) => setAttributes({ dropdownIconColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="dropdownIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="dropdownIconSpacing"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <SectionHeading label={__('Chevron', 'voxel-fse')} />
                                    <ToggleControl
                                        label={__('Hide chevron', 'voxel-fse')}
                                        checked={attributes.dropdownHideChevron}
                                        onChange={(value: boolean) => setAttributes({ dropdownHideChevron: value })}
                                    />
                                    <ColorControl
                                        label={__('Chevron color', 'voxel-fse')}
                                        value={attributes.dropdownChevronColor}
                                        onChange={(value) => setAttributes({ dropdownChevronColor: value })}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <SectionHeading label={__('Style', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.dropdownBgColorHover}
                                        onChange={(value) => setAttributes({ dropdownBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.dropdownTextColorHover}
                                        onChange={(value) => setAttributes({ dropdownTextColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.dropdownBorderColorHover}
                                        onChange={(value) => setAttributes({ dropdownBorderColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.dropdownIconColorHover}
                                        onChange={(value) => setAttributes({ dropdownIconColorHover: value })}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="dropdownBoxShadowHover"
                                    />
                                </>
                            )}
                            {tab.name === 'filled' && (
                                <>
                                    <SectionHeading label={__('Style (Filled)', 'voxel-fse')} />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.dropdownTypographyFilled}
                                        onChange={(value) => setAttributes({ dropdownTypographyFilled: value })}
                                    />
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.dropdownBgColorFilled}
                                        onChange={(value) => setAttributes({ dropdownBgColorFilled: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.dropdownTextColorFilled}
                                        onChange={(value) => setAttributes({ dropdownTextColorFilled: value })}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.dropdownIconColorFilled}
                                        onChange={(value) => setAttributes({ dropdownIconColorFilled: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.dropdownBorderColorFilled}
                                        onChange={(value) => setAttributes({ dropdownBorderColorFilled: value })}
                                    />
                                    <SliderControl
                                        label={__('Border width', 'voxel-fse')}
                                        value={attributes.dropdownBorderWidthFilled ?? undefined}
                                        onChange={(value) => setAttributes({ dropdownBorderWidthFilled: value ?? null })}
                                        min={0}
                                        max={20}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="dropdownBoxShadowFilled"
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Ship to */}
            <AccordionPanel id="ship_to" title={__('Ship to', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.shipToTypography}
                    onChange={(value) => setAttributes({ shipToTypography: value })}
                />
                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.shipToTextColor}
                    onChange={(value) => setAttributes({ shipToTextColor: value })}
                />
                <ColorControl
                    label={__('Link color', 'voxel-fse')}
                    value={attributes.shipToLinkColor}
                    onChange={(value) => setAttributes({ shipToLinkColor: value })}
                />
            </AccordionPanel>

            {/* Section divider */}
            <AccordionPanel id="section_divider" title={__('Section divider', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.dividerTypography}
                    onChange={(value) => setAttributes({ dividerTypography: value })}
                />
                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.dividerTextColor}
                    onChange={(value) => setAttributes({ dividerTextColor: value })}
                />
                <ColorControl
                    label={__('Divider color', 'voxel-fse')}
                    value={attributes.dividerLineColor}
                    onChange={(value) => setAttributes({ dividerLineColor: value })}
                />
                <SliderControl
                    label={__('Divider height', 'voxel-fse')}
                    value={attributes.dividerLineHeight ?? undefined}
                    onChange={(value) => setAttributes({ dividerLineHeight: value ?? null })}
                    min={0}
                    max={20}
                />
            </AccordionPanel>

            {/* Subtotal */}
            <AccordionPanel id="subtotal" title={__('Subtotal', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography (Total)', 'voxel-fse')}
                    value={attributes.subtotalTypography}
                    onChange={(value) => setAttributes({ subtotalTypography: value })}
                />
                <ColorControl
                    label={__('Text color (Total)', 'voxel-fse')}
                    value={attributes.subtotalTextColor}
                    onChange={(value) => setAttributes({ subtotalTextColor: value })}
                />
            </AccordionPanel>

            {/* Field label */}
            <AccordionPanel id="field_label" title={__('Field label', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.fieldLabelTypography}
                    onChange={(value) => setAttributes({ fieldLabelTypography: value })}
                />
                <ColorControl
                    label={__('Color', 'voxel-fse')}
                    value={attributes.fieldLabelColor}
                    onChange={(value) => setAttributes({ fieldLabelColor: value })}
                />
                <ColorControl
                    label={__('Link color', 'voxel-fse')}
                    value={attributes.fieldLabelLinkColor}
                    onChange={(value) => setAttributes({ fieldLabelLinkColor: value })}
                />
            </AccordionPanel>

            {/* Input & Textarea */}
            <AccordionPanel id="input_textarea" title={__('Input & Textarea', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverActiveTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Placeholder', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Placeholder color', 'voxel-fse')}
                                        value={attributes.inputPlaceholderColor}
                                        onChange={(value) => setAttributes({ inputPlaceholderColor: value })}
                                    />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.inputPlaceholderTypography}
                                        onChange={(value) => setAttributes({ inputPlaceholderTypography: value })}
                                    />
                                    <SectionHeading label={__('Value', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.inputValueColor}
                                        onChange={(value) => setAttributes({ inputValueColor: value })}
                                    />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.inputValueTypography}
                                        onChange={(value) => setAttributes({ inputValueTypography: value })}
                                    />
                                    <SectionHeading label={__('General', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.inputBgColor}
                                        onChange={(value) => setAttributes({ inputBgColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.inputBorderType || '',
                                            borderWidth: attributes.inputBorderWidth || {},
                                            borderColor: attributes.inputBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.inputBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.inputBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.inputBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <SectionHeading label={__('Input', 'voxel-fse')} />
                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputPadding"
                                        availableUnits={['px', '%', 'em']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputHeight"
                                        min={0}
                                        max={200}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <SectionHeading label={__('Input with icon', 'voxel-fse')} />
                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputWithIconPadding"
                                        availableUnits={['px', '%', 'em']}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.inputIconColor}
                                        onChange={(value) => setAttributes({ inputIconColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon side padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="inputIconMargin"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <SectionHeading label={__('Textarea', 'voxel-fse')} />
                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="textareaPadding"
                                        availableUnits={['px', '%', 'em']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="textareaRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.inputBgColorHover}
                                        onChange={(value) => setAttributes({ inputBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.inputBorderColorHover}
                                        onChange={(value) => setAttributes({ inputBorderColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Placeholder color', 'voxel-fse')}
                                        value={attributes.inputPlaceholderColorHover}
                                        onChange={(value) => setAttributes({ inputPlaceholderColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.inputValueColorHover}
                                        onChange={(value) => setAttributes({ inputValueColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.inputIconColorHover}
                                        onChange={(value) => setAttributes({ inputIconColorHover: value })}
                                    />
                                </>
                            )}
                            {tab.name === 'active' && (
                                <>
                                    <ColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        value={attributes.inputBgColorActive}
                                        onChange={(value) => setAttributes({ inputBgColorActive: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.inputBorderColorActive}
                                        onChange={(value) => setAttributes({ inputBorderColorActive: value })}
                                    />
                                    <ColorControl
                                        label={__('Placeholder color', 'voxel-fse')}
                                        value={attributes.inputPlaceholderColorActive}
                                        onChange={(value) => setAttributes({ inputPlaceholderColorActive: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.inputValueColorActive}
                                        onChange={(value) => setAttributes({ inputValueColorActive: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Cards */}
            <AccordionPanel id="cards" title={__('Cards', 'voxel-fse')}>
                <StyleTabPanel tabs={normalSelectedTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Cards', 'voxel-fse')} />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Gap', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="cardsGap"
                                        min={0}
                                        max={100}
                                    />
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.cardsBgColor}
                                        onChange={(value) => setAttributes({ cardsBgColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.cardsBorderType || '',
                                            borderWidth: attributes.cardsBorderWidth || {},
                                            borderColor: attributes.cardsBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.cardsBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.cardsBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.cardsBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="cardsRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <SectionHeading label={__('Text', 'voxel-fse')} />
                                    <TypographyControl
                                        label={__('Primary', 'voxel-fse')}
                                        value={attributes.cardsPrimaryTypography}
                                        onChange={(value) => setAttributes({ cardsPrimaryTypography: value })}
                                    />
                                    <ColorControl
                                        label={__('Primary Color', 'voxel-fse')}
                                        value={attributes.cardsPrimaryColor}
                                        onChange={(value) => setAttributes({ cardsPrimaryColor: value })}
                                    />
                                    <TypographyControl
                                        label={__('Secondary', 'voxel-fse')}
                                        value={attributes.cardsSecondaryTypography}
                                        onChange={(value) => setAttributes({ cardsSecondaryTypography: value })}
                                    />
                                    <ColorControl
                                        label={__('Secondary Color', 'voxel-fse')}
                                        value={attributes.cardsSecondaryColor}
                                        onChange={(value) => setAttributes({ cardsSecondaryColor: value })}
                                    />
                                    <TypographyControl
                                        label={__('Price', 'voxel-fse')}
                                        value={attributes.cardsPriceTypography}
                                        onChange={(value) => setAttributes({ cardsPriceTypography: value })}
                                    />
                                    <ColorControl
                                        label={__('Price color Color', 'voxel-fse')}
                                        value={attributes.cardsPriceColor}
                                        onChange={(value) => setAttributes({ cardsPriceColor: value })}
                                    />
                                    <SectionHeading label={__('Image', 'voxel-fse')} />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="cardsImageRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="cardsImageSize"
                                        min={0}
                                        max={200}
                                    />
                                </>
                            )}
                            {tab.name === 'selected' && (
                                <>
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.cardsSelectedBgColor}
                                        onChange={(value) => setAttributes({ cardsSelectedBgColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.cardsSelectedBorderColor}
                                        onChange={(value) => setAttributes({ cardsSelectedBorderColor: value })}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="cardsSelectedBoxShadow"
                                    />
                                    <TypographyControl
                                        label={__('Primary text', 'voxel-fse')}
                                        value={attributes.cardsSelectedPrimaryTypography}
                                        onChange={(value) => setAttributes({ cardsSelectedPrimaryTypography: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Form: File/Gallery */}
            <AccordionPanel id="file_gallery" title={__('Form: File/Gallery', 'voxel-fse')}>
                <StyleTabPanel tabs={normalHoverTabs}>
                    {(tab) => (
                        <>
                            {tab.name === 'normal' && (
                                <>
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Item gap', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fileFieldGap"
                                        min={0}
                                        max={100}
                                    />
                                    <SectionHeading label={__('Select files', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.fileSelectIconColor}
                                        onChange={(value) => setAttributes({ fileSelectIconColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fileSelectIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.fileSelectBgColor}
                                        onChange={(value) => setAttributes({ fileSelectBgColor: value })}
                                    />
                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.fileSelectBorderType || '',
                                            borderWidth: attributes.fileSelectBorderWidth || {},
                                            borderColor: attributes.fileSelectBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<CartSummaryBlockAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.fileSelectBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.fileSelectBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.fileSelectBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fileSelectRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.fileSelectTypography}
                                        onChange={(value) => setAttributes({ fileSelectTypography: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.fileSelectTextColor}
                                        onChange={(value) => setAttributes({ fileSelectTextColor: value })}
                                    />
                                    <SectionHeading label={__('Added file/image', 'voxel-fse')} />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="addedFileRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.addedFileBgColor}
                                        onChange={(value) => setAttributes({ addedFileBgColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        value={attributes.addedFileIconColor}
                                        onChange={(value) => setAttributes({ addedFileIconColor: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="addedFileIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        value={attributes.addedFileTypography}
                                        onChange={(value) => setAttributes({ addedFileTypography: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.addedFileTextColor}
                                        onChange={(value) => setAttributes({ addedFileTextColor: value })}
                                    />
                                    <SectionHeading label={__('Remove/Check button', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Background', 'voxel-fse')}
                                        value={attributes.removeFileBgColor}
                                        onChange={(value) => setAttributes({ removeFileBgColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Background (Hover)', 'voxel-fse')}
                                        value={attributes.removeFileBgColorHover}
                                        onChange={(value) => setAttributes({ removeFileBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Color', 'voxel-fse')}
                                        value={attributes.removeFileColor}
                                        onChange={(value) => setAttributes({ removeFileColor: value })}
                                    />
                                    <ColorControl
                                        label={__('Color (Hover)', 'voxel-fse')}
                                        value={attributes.removeFileColorHover}
                                        onChange={(value) => setAttributes({ removeFileColorHover: value })}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="removeFileRadius"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="removeFileSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="removeFileIconSize"
                                        min={0}
                                        max={100}
                                        availableUnits={['px']}
                                    />
                                </>
                            )}
                            {tab.name === 'hover' && (
                                <>
                                    <SectionHeading label={__('Select files', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Button icon color', 'voxel-fse')}
                                        value={attributes.fileSelectIconColorHover}
                                        onChange={(value) => setAttributes({ fileSelectIconColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Button background', 'voxel-fse')}
                                        value={attributes.fileSelectBgColorHover}
                                        onChange={(value) => setAttributes({ fileSelectBgColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.fileSelectBorderColorHover}
                                        onChange={(value) => setAttributes({ fileSelectBorderColorHover: value })}
                                    />
                                    <ColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        value={attributes.fileSelectTextColorHover}
                                        onChange={(value) => setAttributes({ fileSelectTextColorHover: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
