/**
 * Navbar Block - Style Tab Inspector Controls
 *
 * Matches Voxel's Navbar (VX) Style tab:
 * - Navbar: General (Menu item, Icon, Scroll, Chevron) with State tabs (Normal, Hover, Current)
 * - Popups: Custom style (moved from Content tab)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
    SectionHeading,
    StateTabPanel,
    ColorControl,
    TypographyControl,
    ResponsiveDimensionsControl,
    ResponsiveRangeControl,
    PopupCustomStyleControl,
    BorderGroupControl,
} from '@shared/controls';
import type { NavbarAttributes } from '../types';

interface StyleTabProps {
    attributes: NavbarAttributes;
    setAttributes: (attrs: Partial<NavbarAttributes>) => void;
}

export function StyleTab({
    attributes,
    setAttributes,
}: StyleTabProps): JSX.Element {
    return (
        <AccordionPanelGroup
            defaultPanel="general"
            attributes={attributes as Record<string, any>}
            setAttributes={setAttributes as (attrs: Record<string, any>) => void}
            stateAttribute="styleTabOpenPanel"
        >
            {/* Navbar: General Accordion */}
            <AccordionPanel id="general" title={__('Navbar: General', 'voxel-fse')}>
                <StateTabPanel
                    attributeName="styleTabState"
                    attributes={attributes as Record<string, any>}
                    setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                        { name: 'active', title: __('Current', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Menu Item Section */}
                            <SectionHeading label={__('Menu item', 'voxel-fse')} />

                            {tab.name === 'normal' && (
                                <TypographyControl
                                    label={__('Typography', 'voxel-fse')}
                                    attributes={attributes as Record<string, any>}
                                    setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                    typographyAttributeName="typography"
                                />
                            )}

                            <ColorControl
                                label={__('Color', 'voxel-fse')}
                                value={
                                    tab.name === 'hover'
                                        ? attributes.linkColorHover
                                        : tab.name === 'active'
                                            ? attributes.linkColorActive
                                            : attributes.linkColor
                                }
                                onChange={(value: string) => {
                                    if (tab.name === 'hover') setAttributes({ linkColorHover: value });
                                    else if (tab.name === 'active') setAttributes({ linkColorActive: value });
                                    else setAttributes({ linkColor: value });
                                }}
                            />

                            <ColorControl
                                label={__('Background color', 'voxel-fse')}
                                value={
                                    tab.name === 'hover'
                                        ? attributes.linkBgHover
                                        : tab.name === 'active'
                                            ? attributes.linkBgActive
                                            : attributes.linkBg
                                }
                                onChange={(value: string) => {
                                    if (tab.name === 'hover') setAttributes({ linkBgHover: value });
                                    else if (tab.name === 'active') setAttributes({ linkBgActive: value });
                                    else setAttributes({ linkBg: value });
                                }}
                            />

                            {tab.name === 'normal' && (
                                <>
                                    <ResponsiveDimensionsControl
                                        label={__('Margin', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="linkMargin"
                                    />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="linkPadding"
                                    />

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.linkBorderStyle || '',
                                            borderWidth: attributes.linkBorderWidth || {},
                                            borderColor: attributes.linkBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            setAttributes({
                                                linkBorderStyle: value.borderType,
                                                linkBorderWidth: value.borderWidth,
                                                linkBorderColor: value.borderColor,
                                            });
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="linkBorderRadius"
                                        min={0}
                                        max={100}
                                        units={['px', '%', 'em']}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Item content gap', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="linkGap"
                                        min={0}
                                        max={100}
                                    />
                                </>
                            )}

                            {/* Menu Item Icon Section */}
                            <SectionHeading label={__('Menu item icon', 'voxel-fse')} />

                            {tab.name === 'normal' && (
                                <>
                                    <SelectControl
                                        label={__('Show icon', 'voxel-fse')}
                                        help={__('Desktop only', 'voxel-fse')}
                                        value={attributes.showIcon}
                                        options={[
                                            { value: 'flex', label: __('Yes', 'voxel-fse') },
                                            { value: 'none', label: __('No', 'voxel-fse') },
                                        ]}
                                        onChange={(value: string) => setAttributes({ showIcon: value as any })}
                                        __nextHasNoMarginBottom
                                    />

                                    <ToggleControl
                                        label={__('Icon on top?', 'voxel-fse')}
                                        checked={attributes.iconOnTop}
                                        onChange={(value: boolean) => setAttributes({ iconOnTop: value })}
                                        __nextHasNoMarginBottom
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Container size', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="iconContainerSize"
                                        min={0}
                                        max={200}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Container border radius', 'voxel-fse')}
                                        attributes={attributes as Record<string, any>}
                                        setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                        attributeBaseName="iconContainerRadius"
                                        min={0}
                                        max={100}
                                    />
                                </>
                            )}

                            <ColorControl
                                label={__('Container background', 'voxel-fse')}
                                value={
                                    tab.name === 'hover'
                                        ? attributes.iconContainerBgHover
                                        : tab.name === 'active'
                                            ? attributes.iconContainerBgActive
                                            : attributes.iconContainerBg
                                }
                                onChange={(value: string) => {
                                    if (tab.name === 'hover') setAttributes({ iconContainerBgHover: value });
                                    else if (tab.name === 'active') setAttributes({ iconContainerBgActive: value });
                                    else setAttributes({ iconContainerBg: value });
                                }}
                            />

                            {tab.name === 'normal' && (
                                <ResponsiveRangeControl
                                    label={__('Icon size', 'voxel-fse')}
                                    help={__('Must be equal or smaller than icon container', 'voxel-fse')}
                                    attributes={attributes as Record<string, any>}
                                    setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                                    attributeBaseName="iconSize"
                                    min={0}
                                    max={100}
                                />
                            )}

                            <ColorControl
                                label={__('Icon color', 'voxel-fse')}
                                value={
                                    tab.name === 'hover'
                                        ? attributes.iconColorHover
                                        : tab.name === 'active'
                                            ? attributes.iconColorActive
                                            : attributes.iconColor
                                }
                                onChange={(value: string) => {
                                    if (tab.name === 'hover') setAttributes({ iconColorHover: value });
                                    else if (tab.name === 'active') setAttributes({ iconColorActive: value });
                                    else setAttributes({ iconColor: value });
                                }}
                            />

                            {/* Horizontal scroll */}
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Horizontal scroll', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Scroll background color', 'voxel-fse')}
                                        value={attributes.scrollBg}
                                        onChange={(value: string) => setAttributes({ scrollBg: value })}
                                    />
                                </>
                            )}

                            {/* Chevron */}
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Chevron', 'voxel-fse')} />
                                    <ColorControl
                                        label={__('Chevron color', 'voxel-fse')}
                                        value={attributes.chevronColor}
                                        onChange={(value: string) => setAttributes({ chevronColor: value })}
                                    />
                                </>
                            )}
                        </>
                    )}
                </StateTabPanel>
            </AccordionPanel>

            {/* Popups: Custom style Accordion (Moved from Content Tab) */}
            <AccordionPanel
                id="custom_popup"
                title={__('Popups: Custom style', 'voxel-fse')}
            >
                <PopupCustomStyleControl
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeNames={{
                        enable: 'customPopupEnabled',
                        backdrop: 'popupBackdropBackground',
                        pointerEvents: 'popupBackdropPointerEvents',
                        shadow: 'popupBoxShadow',
                        topMargin: 'popupTopBottomMargin',
                        minWidth: 'popupMinWidth',
                        maxWidth: 'popupMaxWidth',
                        maxHeight: 'popupMaxHeight',
                    }}
                />

                <div className="voxel-fse-control-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <SectionHeading label={__('Columns', 'voxel-fse')} />
                </div>

                <ToggleControl
                    label={__('Multi column popup menu?', 'voxel-fse')}
                    checked={attributes.multiColumnMenu}
                    onChange={(value: boolean) => setAttributes({ multiColumnMenu: value })}
                    __nextHasNoMarginBottom
                />

                {attributes.multiColumnMenu && (
                    <RangeControl
                        label={__('Menu columns', 'voxel-fse')}
                        help={__(
                            'We recommend increasing popup min width before if you plan to display the menu in multiple columns',
                            'voxel-fse'
                        )}
                        value={attributes.menuColumns}
                        onChange={(value: number | undefined) =>
                            setAttributes({ menuColumns: value ?? 1 })
                        }
                        min={1}
                        max={6}
                    />
                )}
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
