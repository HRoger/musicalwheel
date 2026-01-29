/**
 * Quick Search Block - Style Tab
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    AccordionPanelGroup,
    AccordionPanel,
    StateTabPanel,
    ResponsiveColorControl,
    ResponsiveRangeControl,
    ResponsiveDimensionsControl,
    TypographyControl,
    BoxShadowPopup,
    SectionHeading,
    ColorControl,
    ResponsiveToggle,
    PopupCustomStyleControl,
    CustomPopupMenuControl,
} from '@shared/controls';
import {
    SelectControl,
    RangeControl
} from '@wordpress/components';

import type { QuickSearchAttributes } from '../types';

interface StyleTabProps {
    attributes: QuickSearchAttributes;
    setAttributes: (attributes: Partial<QuickSearchAttributes>) => void;
}

export default function StyleTab({
    attributes,
    setAttributes,
}: StyleTabProps) {
    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            stateAttribute="styleTabOpenPanel"
            defaultPanel="search_button"
        >
            <AccordionPanel
                id="search_button"
                title={__('Search button', 'voxel-fse')}
            >
                <StateTabPanel
                    attributeName="searchButtonState"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                        { name: 'filled', title: __('Filled', 'voxel-fse') },
                    ]}
                >
                    {(tab) => {
                        if (tab.name === 'normal') {
                            return (
                                <>
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="buttonTypography"
                                    />
                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonPadding"
                                    />
                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonHeight"
                                        min={0}
                                        max={200}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="buttonBoxShadow"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonBackground"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonTextColor"
                                    />
                                    <div className="voxel-control-group">
                                        <SelectControl
                                            label={__('Border Type', 'voxel-fse')}
                                            value={attributes.buttonBorderType || 'none'}
                                            options={[
                                                { label: __('None', 'voxel-fse'), value: 'none' },
                                                { label: __('Solid', 'voxel-fse'), value: 'solid' },
                                                { label: __('Double', 'voxel-fse'), value: 'double' },
                                                { label: __('Dotted', 'voxel-fse'), value: 'dotted' },
                                                { label: __('Dashed', 'voxel-fse'), value: 'dashed' },
                                                { label: __('Groove', 'voxel-fse'), value: 'groove' },
                                            ]}
                                            onChange={(value: string) => setAttributes({ buttonBorderType: value })}
                                        />
                                        {attributes.buttonBorderType && attributes.buttonBorderType !== 'none' && (
                                            <>
                                                <RangeControl
                                                    label={__('Width', 'voxel-fse')}
                                                    value={attributes.buttonBorderWidth}
                                                    onChange={(value: number) => setAttributes({ buttonBorderWidth: value })}
                                                    min={0}
                                                    max={50}
                                                />
                                                <ColorControl
                                                    label={__('Color', 'voxel-fse')}
                                                    value={attributes.buttonBorderColor}
                                                    onChange={(value: string) => setAttributes({ buttonBorderColor: value })}
                                                />
                                            </>
                                        )}
                                        <ResponsiveRangeControl
                                            label={__('Border radius', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            attributeBaseName="buttonBorderRadius"
                                            min={0}
                                            max={100}
                                        />
                                    </div>

                                    <SectionHeading>{__('Icons', 'voxel-fse')}</SectionHeading>

                                    <ResponsiveColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonIconColor"
                                    />
                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonIconSize"
                                        min={0}
                                        max={100}
                                    />
                                    <ResponsiveRangeControl
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonIconSpacing"
                                        min={0}
                                        max={100}
                                    />
                                </>
                            );
                        }

                        if (tab.name === 'hover') {
                            return (
                                <>
                                    <ResponsiveColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonBackgroundHover"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonTextColorHover"
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.buttonBorderColorHover}
                                        onChange={(value: string) => setAttributes({ buttonBorderColorHover: value })}
                                    />
                                    <ResponsiveColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonIconColorHover"
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="buttonBoxShadowHover"
                                    />
                                </>
                            );
                        }

                        if (tab.name === 'filled') {
                            return (
                                <>
                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="buttonTypographyFilled"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Background color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonBackgroundFilled"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonTextColorFilled"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Icon color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="buttonIconColorFilled"
                                    />
                                    <ColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        value={attributes.buttonBorderColorFilled}
                                        onChange={(value: string) => setAttributes({ buttonBorderColorFilled: value })}
                                    />
                                    <RangeControl
                                        label={__('Border width', 'voxel-fse')}
                                        value={attributes.buttonBorderWidthFilled}
                                        onChange={(value: number) => setAttributes({ buttonBorderWidthFilled: value })}
                                        min={0}
                                        max={50}
                                    />
                                    <BoxShadowPopup
                                        label={__('Box Shadow', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        shadowAttributeName="buttonBoxShadowFilled"
                                    />
                                </>
                            );
                        }

                        return null;
                    }}
                </StateTabPanel>
            </AccordionPanel>

            <AccordionPanel
                id="button_suffix"
                title={__('Button suffix', 'voxel-fse')}
            >
                <ResponsiveToggle
                    label={__('Hide suffix', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixHide"
                />
                <ResponsiveDimensionsControl
                    label={__('Padding', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixPadding"
                />
                <TypographyControl
                    label={__('Button typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="suffixTypography"
                />
                <ResponsiveColorControl
                    label={__('Text color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixTextColor"
                />
                <ResponsiveColorControl
                    label={__('Background color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixBackground"
                />
                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixBorderRadius"
                    min={0}
                    max={100}
                />
                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    shadowAttributeName="suffixBoxShadow"
                />
                <ResponsiveRangeControl
                    label={__('Side margin', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="suffixMargin"
                    min={0}
                    max={100}
                />
            </AccordionPanel>

            <AccordionPanel
                id="popup_tabs"
                title={__('Popup: Tabs', 'voxel-fse')}
            >
                <StateTabPanel
                    attributeName="popupTabsState"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => {
                        if (tab.name === 'normal') {
                            return (
                                <>
                                    <SectionHeading>{__('Timeline tabs', 'voxel-fse')}</SectionHeading>

                                    <ResponsiveColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsTextColor"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Active text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsActiveTextColor"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsBorderColor"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Active border color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsActiveBorderColor"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Background', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsBackground"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Active background', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsActiveBackground"
                                    />
                                </>
                            );
                        }

                        if (tab.name === 'hover') {
                            return (
                                <>
                                    <SectionHeading>{__('Timeline tabs', 'voxel-fse')}</SectionHeading>

                                    <ResponsiveColorControl
                                        label={__('Text color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsTextColorHover"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Border color', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsBorderColorHover"
                                    />
                                    <ResponsiveColorControl
                                        label={__('Background', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="tabsBackgroundHover"
                                    />
                                </>
                            );
                        }

                        return null;
                    }}
                </StateTabPanel>
            </AccordionPanel>

            <AccordionPanel
                id="popup_custom_style"
                title={__('Popups: Custom style', 'voxel-fse')}
            >
                <PopupCustomStyleControl
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeNames={{
                        enable: 'popupCustomEnable',
                        backdrop: 'popupBackdropBackground',
                        pointerEvents: 'popupPointerEvents',
                        centerPosition: 'popupCenterPosition',
                        shadow: 'popupBoxShadow',
                        border: 'popupBorder',
                        topMargin: 'popupTopBottomMargin',
                        minWidth: 'popupMinWidth',
                        maxWidth: 'popupMaxWidth',
                        maxHeight: 'popupMaxHeight',
                    }}
                    exclude={['autosuggestTopMargin']}
                />
            </AccordionPanel>

            {attributes.popupCustomEnable && (
                <AccordionPanel
                    id="popup_menu"
                    title={__('Custom popup: Menu', 'voxel-fse')}
                >
                    <CustomPopupMenuControl
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </AccordionPanel>
            )}
        </AccordionPanelGroup>
    );
}
