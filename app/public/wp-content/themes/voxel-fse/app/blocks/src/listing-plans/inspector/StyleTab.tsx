/**
 * Listing Plans Block - Style Tab Inspector Controls
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    ToggleControl,
    SelectControl,
} from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
    SectionHeading,
    ResponsiveRangeControl,
    AdvancedIconControl,
    ColorControl,
    TypographyControl,
    BorderGroupControl,
    BoxShadowPopup,
    StyleTabPanel,
    ResponsiveDimensionsControl,
} from '@shared/controls';
import type {
    ListingPlansAttributes,
} from '../types';

interface StyleTabProps {
    attributes: ListingPlansAttributes;
    setAttributes: (attrs: Partial<ListingPlansAttributes>) => void;
}

export function StyleTab({
    attributes,
    setAttributes,
}: StyleTabProps): JSX.Element {
    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            stateAttribute="styleTabOpenPanel"
            defaultPanel="general"
        >
            <AccordionPanel id="general" title={__('General', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Number of columns', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="plansColumns"
                    min={1}
                    max={6}
                    enableDynamicTags={true}
                />

                <ResponsiveRangeControl
                    label={__('Item gap', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="plansGap"
                    min={0}
                    max={100}
                />

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.plansBorderType,
                        borderWidth: attributes.plansBorderWidth,
                        borderColor: attributes.plansBorderColor,
                    }}
                    onChange={(value: any) => setAttributes({
                        plansBorderType: value.borderType,
                        plansBorderWidth: value.borderWidth as any,
                        plansBorderColor: value.borderColor,
                    })}
                    hideRadius={true}
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="plansBorderRadius"
                    min={0}
                    max={50}
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background', 'voxel-fse')}
                        value={attributes.plansBackground}
                        onChange={(value) => setAttributes({ plansBackground: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <BoxShadowPopup
                        label={__('Box Shadow', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        shadowAttributeName="plansBoxShadow"
                    />
                </div>

                <SectionHeading label={__('Plan body', 'voxel-fse')} />

                <ResponsiveRangeControl
                    label={__('Body padding', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="bodyPadding"
                    min={0}
                    max={100}
                />

                <ResponsiveRangeControl
                    label={__('Body content gap', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="bodyContentGap"
                    min={0}
                    max={100}
                />

                <SectionHeading label={__('Plan image', 'voxel-fse')} />

                <ResponsiveDimensionsControl
                    label={__('Image padding', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="imagePadding"
                />

                <ResponsiveRangeControl
                    label={__('Height', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="imageHeight"
                    min={0}
                    max={500}
                />

                <SectionHeading label={__('Plan pricing', 'voxel-fse')} />

                <SelectControl
                    label={__('Align', 'voxel-fse')}
                    value={attributes.pricingAlign}
                    options={[
                        { value: 'flex-start', label: __('Left', 'voxel-fse') },
                        { value: 'center', label: __('Center', 'voxel-fse') },
                        { value: 'flex-end', label: __('Right', 'voxel-fse') },
                    ]}
                    onChange={(value: any) =>
                        setAttributes({
                            pricingAlign: value as 'flex-start' | 'center' | 'flex-end',
                        })
                    }
                />

                <TypographyControl
                    label={__('Price typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="priceTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Price text color', 'voxel-fse')}
                        value={attributes.priceColor}
                        onChange={(value) => setAttributes({ priceColor: value })}
                    />
                </div>

                <TypographyControl
                    label={__('Period typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="periodTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Period text color', 'voxel-fse')}
                        value={attributes.periodColor}
                        onChange={(value) => setAttributes({ periodColor: value })}
                    />
                </div>

                <SectionHeading label={__('Plan name', 'voxel-fse')} />

                <SelectControl
                    label={__('Align content', 'voxel-fse')}
                    value={attributes.contentAlign}
                    options={[
                        { value: 'flex-start', label: __('Left', 'voxel-fse') },
                        { value: 'center', label: __('Center', 'voxel-fse') },
                        { value: 'flex-end', label: __('Right', 'voxel-fse') },
                    ]}
                    onChange={(value: any) =>
                        setAttributes({
                            contentAlign: value as 'flex-start' | 'center' | 'flex-end',
                        })
                    }
                />

                <TypographyControl
                    label={__('Name typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="nameTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Name text color', 'voxel-fse')}
                        value={attributes.nameColor}
                        onChange={(value) => setAttributes({ nameColor: value })}
                    />
                </div>

                <SectionHeading label={__('Plan description', 'voxel-fse')} />

                <SelectControl
                    label={__('Text align', 'voxel-fse')}
                    value={attributes.descAlign}
                    options={[
                        { value: 'left', label: __('Left', 'voxel-fse') },
                        { value: 'center', label: __('Center', 'voxel-fse') },
                        { value: 'right', label: __('Right', 'voxel-fse') },
                    ]}
                    onChange={(value: any) =>
                        setAttributes({
                            descAlign: value as 'left' | 'center' | 'right',
                        })
                    }
                />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="descTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Color', 'voxel-fse')}
                        value={attributes.descColor}
                        onChange={(value) => setAttributes({ descColor: value })}
                    />
                </div>

                <SectionHeading label={__('Plan features', 'voxel-fse')} />

                <SelectControl
                    label={__('Align content', 'voxel-fse')}
                    value={attributes.listAlign}
                    options={[
                        { value: 'flex-start', label: __('Left', 'voxel-fse') },
                        { value: 'center', label: __('Center', 'voxel-fse') },
                        { value: 'flex-end', label: __('Right', 'voxel-fse') },
                    ]}
                    onChange={(value: any) =>
                        setAttributes({
                            listAlign: value as 'flex-start' | 'center' | 'flex-end',
                        })
                    }
                />

                <ResponsiveRangeControl
                    label={__('Item gap', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="listGap"
                    min={0}
                    max={50}
                />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="listTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Color', 'voxel-fse')}
                        value={attributes.listColor}
                        onChange={(value) => setAttributes({ listColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Icon color', 'voxel-fse')}
                        value={attributes.listIconColor}
                        onChange={(value) => setAttributes({ listIconColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="listIconSize"
                    min={10}
                    max={50}
                />

                <ResponsiveRangeControl
                    label={__('Icon right padding', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="listIconRightPad"
                    min={0}
                    max={30}
                />

                <SectionHeading label={__('Featured Plan', 'voxel-fse')} />

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.featuredBorderType,
                        borderWidth: attributes.featuredBorderWidth,
                        borderColor: attributes.featuredBorderColor,
                    }}
                    onChange={(value: any) => setAttributes({
                        featuredBorderType: value.borderType,
                        featuredBorderWidth: value.borderWidth as any,
                        featuredBorderColor: value.borderColor,
                    })}
                    hideRadius={true}
                />

                <div className="voxel-fse-control-row">
                    <BoxShadowPopup
                        label={__('Box Shadow', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        shadowAttributeName="featuredBoxShadow"
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Badge background', 'voxel-fse')}
                        value={attributes.featuredBadgeBg}
                        onChange={(value) => setAttributes({ featuredBadgeBg: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Badge text color', 'voxel-fse')}
                        value={attributes.featuredBadgeColor}
                        onChange={(value) => setAttributes({ featuredBadgeColor: value })}
                    />
                </div>

                <TypographyControl
                    label={__('Badge typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="featuredBadgeTypography"
                />

            </AccordionPanel>

            <AccordionPanel id="tabs" title={__('Tabs', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab Content - All controls including Disable, Layout, Spacing, Typography, Colors */}
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Tabs', 'voxel-fse')} />

                                    <ToggleControl
                                        label={__('Disable tabs', 'voxel-fse')}
                                        checked={attributes.tabsDisabled}
                                        onChange={(value: boolean) => setAttributes({ tabsDisabled: value })}
                                    />

                                    <SelectControl
                                        label={__('Justify', 'voxel-fse')}
                                        value={attributes.tabsJustify}
                                        options={[
                                            { value: 'flex-start', label: __('Left', 'voxel-fse') },
                                            { value: 'center', label: __('Center', 'voxel-fse') },
                                            { value: 'flex-end', label: __('Right', 'voxel-fse') },
                                            { value: 'space-between', label: __('Space between', 'voxel-fse') },
                                            { value: 'space-around', label: __('Space around', 'voxel-fse') },
                                        ]}
                                        onChange={(value: any) =>
                                            setAttributes({
                                                tabsJustify: value as ListingPlansAttributes['tabsJustify'],
                                            })
                                        }
                                    />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsPadding"
                                    />

                                    <ResponsiveDimensionsControl
                                        label={__('Margin', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsMargin"
                                    />

                                    <TypographyControl
                                        label={__('Tab typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="tabTypography"
                                    />

                                    <TypographyControl
                                        label={__('Active tab typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="tabActiveTypography"
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.tabColor}
                                            onChange={(value) => setAttributes({ tabColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active text color', 'voxel-fse')}
                                            value={attributes.tabActiveColor}
                                            onChange={(value) => setAttributes({ tabActiveColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.tabBackground}
                                            onChange={(value) => setAttributes({ tabBackground: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active background', 'voxel-fse')}
                                            value={attributes.tabActiveBackground}
                                            onChange={(value) => setAttributes({ tabActiveBackground: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <SelectControl
                                            label={__('Border Type', 'voxel-fse')}
                                            value={attributes.tabBorderType}
                                            options={[
                                                { label: __('Default', 'voxel-fse'), value: 'default' },
                                                { label: __('None', 'voxel-fse'), value: 'none' },
                                                { label: __('Solid', 'voxel-fse'), value: 'solid' },
                                                { label: __('Double', 'voxel-fse'), value: 'double' },
                                                { label: __('Dotted', 'voxel-fse'), value: 'dotted' },
                                                { label: __('Dashed', 'voxel-fse'), value: 'dashed' },
                                                { label: __('Groove', 'voxel-fse'), value: 'groove' },
                                            ]}
                                            onChange={(value: any) => setAttributes({ tabBorderType: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.tabBorderColor}
                                            onChange={(value) => setAttributes({ tabBorderColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active border color', 'voxel-fse')}
                                            value={attributes.tabActiveBorderColor}
                                            onChange={(value) => setAttributes({ tabActiveBorderColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsBorderRadius"
                                        min={0}
                                        max={30}
                                    />
                                </>
                            )}

                            {/* Hover Tab Content - Only Hover specific colors if any (based on Voxel source usually nothing or just link hover) */}
                            {/* Checking Voxel source: It seems Voxel listings plans widget 'Tabs' hover tab is mostly empty or specific interactions. */}
                            {/* Based on user request/image, they wanted Normal/Hover tabs structure. */}
                            {tab.name === 'hover' && (
                                <>
                                    <SectionHeading label={__('Tabs', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.tabsTextColorHover}
                                            onChange={(value) => setAttributes({ tabsTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active text color', 'voxel-fse')}
                                            value={attributes.tabsActiveTextColorHover}
                                            onChange={(value) => setAttributes({ tabsActiveTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.tabsBorderColorHover}
                                            onChange={(value) => setAttributes({ tabsBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active border color', 'voxel-fse')}
                                            value={attributes.tabsActiveBorderColorHover}
                                            onChange={(value) => setAttributes({ tabsActiveBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.tabsBgColorHover}
                                            onChange={(value) => setAttributes({ tabsBgColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Active background', 'voxel-fse')}
                                            value={attributes.tabsActiveBgColorHover}
                                            onChange={(value) => setAttributes({ tabsActiveBgColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Primary Button - Normal state has all controls, Hover only has colors */}
            <AccordionPanel id="primary_btn" title={__('Primary button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal state - all controls */}
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="primaryBtnTypography"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnRadius"
                                        min={0}
                                        max={30}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.primaryBtnColor}
                                            onChange={(value) => setAttributes({ primaryBtnColor: value })}
                                        />
                                    </div>

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.primaryBtnBg}
                                            onChange={(value) => setAttributes({ primaryBtnBg: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.primaryBtnBorderType,
                                            borderWidth: attributes.primaryBtnBorderWidth,
                                            borderColor: attributes.primaryBtnBorderColor,
                                        }}
                                        onChange={(value: any) => setAttributes({
                                            primaryBtnBorderType: value.borderType,
                                            primaryBtnBorderWidth: value.borderWidth as any,
                                            primaryBtnBorderColor: value.borderColor,
                                        })}
                                        hideRadius={true}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="primaryBtnBoxShadow"
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconSize"
                                        min={10}
                                        max={40}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Text/Icon spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconPad"
                                        min={0}
                                        max={30}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.primaryBtnIconColor}
                                            onChange={(value) => setAttributes({ primaryBtnIconColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover state - only color controls */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.primaryBtnColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.primaryBtnBgHover}
                                            onChange={(value) => setAttributes({ primaryBtnBgHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.primaryBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.primaryBtnIconColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnIconColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="primaryBtnBoxShadowHover"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* Secondary Button - Normal state has all controls, Hover only has colors */}
            <AccordionPanel id="secondary_btn" title={__('Secondary button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal state - all controls */}
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="secondaryBtnTypography"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnRadius"
                                        min={0}
                                        max={30}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.secondaryBtnColor}
                                            onChange={(value) => setAttributes({ secondaryBtnColor: value })}
                                        />
                                    </div>

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBg}
                                            onChange={(value) => setAttributes({ secondaryBtnBg: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.secondaryBtnBorderType,
                                            borderWidth: attributes.secondaryBtnBorderWidth,
                                            borderColor: attributes.secondaryBtnBorderColor,
                                        }}
                                        onChange={(value: any) => setAttributes({
                                            secondaryBtnBorderType: value.borderType,
                                            secondaryBtnBorderWidth: value.borderWidth as any,
                                            secondaryBtnBorderColor: value.borderColor,
                                        })}
                                        hideRadius={true}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="secondaryBtnBoxShadow"
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconSize"
                                        min={10}
                                        max={40}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Text/Icon spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconPad"
                                        min={0}
                                        max={30}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.secondaryBtnIconColor}
                                            onChange={(value) => setAttributes({ secondaryBtnIconColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover state - only color controls */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.secondaryBtnColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBgHover}
                                            onChange={(value) => setAttributes({ secondaryBtnBgHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.secondaryBtnIconColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnIconColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="secondaryBtnBoxShadowHover"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            <AccordionPanel id="dialog" title={__('Dialog', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="dialogTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Text color', 'voxel-fse')}
                        value={attributes.dialogColor}
                        onChange={(value) => setAttributes({ dialogColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background', 'voxel-fse')}
                        value={attributes.dialogBackground}
                        onChange={(value) => setAttributes({ dialogBackground: value })}
                    />
                </div>

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.dialogBorderType,
                        borderWidth: attributes.dialogBorderWidth,
                        borderColor: attributes.dialogBorderColor,
                    }}
                    onChange={(value: any) => setAttributes({
                        dialogBorderType: value.borderType,
                        dialogBorderWidth: value.borderWidth as any,
                        dialogBorderColor: value.borderColor,
                    })}
                    hideRadius={true}
                />

                <div className="voxel-fse-control-row">
                    <BoxShadowPopup
                        label={__('Box Shadow', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        shadowAttributeName="dialogBoxShadow"
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="dialogBorderRadius"
                    min={0}
                    max={50}
                />
            </AccordionPanel>

            <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
                <AdvancedIconControl
                    label={__('Right arrow', 'voxel-fse')}
                    value={attributes.arrowIcon}
                    onChange={(value: any) => setAttributes({ arrowIcon: value })}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
