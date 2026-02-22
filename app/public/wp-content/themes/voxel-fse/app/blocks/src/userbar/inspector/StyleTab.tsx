
import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    ToggleControl
} from '@wordpress/components';
import {
    SectionHeading,
    ColorControl,
    TypographyControl,
    ResponsiveRangeControl,
    PopupCustomStyleControl,
    AccordionPanelGroup,
    AccordionPanel,
    DimensionsControl,
    BoxShadowPopup
} from '@shared/controls';
import type { UserbarAttributes } from '../types';

interface StyleTabProps {
    attributes: UserbarAttributes;
    setAttributes: (attrs: Partial<UserbarAttributes>) => void;
}

/**
 * Alignment options
 */
const ALIGN_OPTIONS = [
    { label: __('Left', 'voxel-fse'), value: 'left' },
    { label: __('Center', 'voxel-fse'), value: 'center' },
    { label: __('Right', 'voxel-fse'), value: 'right' },
    { label: __('Space between', 'voxel-fse'), value: 'space-between' },
    { label: __('Space around', 'voxel-fse'), value: 'space-around' },
];

export default function StyleTab({
    attributes,
    setAttributes,
}: StyleTabProps) {
    return (
        <>
            {/* User Area: General Style */}
            <div className="voxel-inspector-section">
                <AccordionPanelGroup defaultPanel="general">
                    <AccordionPanel
                        id="general"
                        title={__('User area: General', 'voxel-fse')}
                    >
                        <SectionHeading label={__('Layout', 'voxel-fse')} />

                        <SelectControl
                            label={__('Align items', 'voxel-fse')}
                            value={attributes.itemsAlign}
                            options={ALIGN_OPTIONS}
                            onChange={(value: string) =>
                                setAttributes({
                                    itemsAlign: value as UserbarAttributes['itemsAlign'],
                                })
                            }
                        />

                        <ToggleControl
                            label={__('Vertical orientation?', 'voxel-fse')}
                            checked={attributes.verticalOrientation}
                            onChange={(value: boolean) => setAttributes({ verticalOrientation: value })}
                        />

                        {attributes.verticalOrientation && (
                            <SelectControl
                                label={__('Align item content', 'voxel-fse')}
                                value={attributes.itemContentAlign}
                                options={[
                                    { label: __('Left', 'voxel-fse'), value: 'left' },
                                    { label: __('Center', 'voxel-fse'), value: 'center' },
                                    { label: __('Right', 'voxel-fse'), value: 'right' },
                                ]}
                                onChange={(value: string) =>
                                    setAttributes({
                                        itemContentAlign: value as UserbarAttributes['itemContentAlign'],
                                    })
                                }
                            />
                        )}

                        <SectionHeading label={__('Item', 'voxel-fse')} />

                        <ResponsiveRangeControl
                            label={__('Gap', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="itemGap"
                            min={0}
                            max={50}
                        />

                        <ColorControl
                            label={__('Item background', 'voxel-fse')}
                            value={attributes.itemBackground}
                            onChange={(value) => setAttributes({ itemBackground: value ?? '' })}
                        />

                        <ColorControl
                            label={__('Item background (hover)', 'voxel-fse')}
                            value={attributes.itemBackgroundHover}
                            onChange={(value) =>
                                setAttributes({ itemBackgroundHover: value ?? '#fff' })
                            }
                        />

                        <ResponsiveRangeControl
                            label={__('Item border radius', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="itemBorderRadius"
                            min={0}
                            max={100}
                        />

                        {/* Item Margin - user-bar.php:584-594 */}
                        <DimensionsControl
                            label={__('Margin', 'voxel-fse')}
                            values={attributes.itemMargin || { top: '', right: '', bottom: '', left: '', unit: 'px' }}
                            onChange={(values: any) => setAttributes({ itemMargin: { ...values, unit: values.unit || 'px' } })}
                            availableUnits={['px', '%', 'em']}
                        />

                        {/* Item Padding - user-bar.php:596-606 */}
                        <DimensionsControl
                            label={__('Padding', 'voxel-fse')}
                            values={attributes.itemPadding || { top: '', right: '', bottom: '', left: '', unit: 'px' }}
                            onChange={(values: any) => setAttributes({ itemPadding: { ...values, unit: values.unit || 'px' } })}
                            availableUnits={['px', '%', 'em']}
                        />

                        {/* Item Box Shadow - user-bar.php:642-649 */}
                        <BoxShadowPopup
                            label={__('Box shadow', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            shadowAttributeName="itemBoxShadow"
                        />

                        {/* Item Box Shadow Hover - user-bar.php:1005-1012 */}
                        <BoxShadowPopup
                            label={__('Box shadow (hover)', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            shadowAttributeName="itemBoxShadowHover"
                        />

                        <ResponsiveRangeControl
                            label={__('Item content gap', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="itemContentGap"
                            min={0}
                            max={50}
                        />

                        <SectionHeading label={__('Item icon', 'voxel-fse')} />

                        <ResponsiveRangeControl
                            label={__('Container size', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="iconContainerSize"
                            min={30}
                            max={80}
                        />

                        <ResponsiveRangeControl
                            label={__('Container border radius', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="iconContainerRadius"
                            min={0}
                            max={100}
                        />

                        <ColorControl
                            label={__('Container background', 'voxel-fse')}
                            value={attributes.iconContainerBackground}
                            onChange={(value) =>
                                setAttributes({ iconContainerBackground: value ?? '' })
                            }
                        />

                        <ColorControl
                            label={__('Container background (hover)', 'voxel-fse')}
                            value={attributes.iconContainerBackgroundHover}
                            onChange={(value) =>
                                setAttributes({ iconContainerBackgroundHover: value ?? '' })
                            }
                        />

                        <ResponsiveRangeControl
                            label={__('Icon size', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="iconSize"
                            min={10}
                            max={50}
                        />

                        <ColorControl
                            label={__('Icon color', 'voxel-fse')}
                            value={attributes.iconColor}
                            onChange={(value) => setAttributes({ iconColor: value ?? '' })}
                        />

                        <ColorControl
                            label={__('Icon color (hover)', 'voxel-fse')}
                            value={attributes.iconColorHover}
                            onChange={(value) => setAttributes({ iconColorHover: value ?? '' })}
                        />

                        <SectionHeading label={__('Unread indicator', 'voxel-fse')} />

                        <ColorControl
                            label={__('Unread indicator color', 'voxel-fse')}
                            value={attributes.unreadIndicatorColor}
                            onChange={(value) =>
                                setAttributes({ unreadIndicatorColor: value ?? '' })
                            }
                        />

                        <ResponsiveRangeControl
                            label={__('Indicator top margin', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="unreadIndicatorMargin"
                            min={0}
                            max={50}
                        />

                        <ResponsiveRangeControl
                            label={__('Indicator size', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="unreadIndicatorSize"
                            min={0}
                            max={50}
                        />

                        <SectionHeading label={__('Avatar', 'voxel-fse')} />

                        <ResponsiveRangeControl
                            label={__('Avatar size', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="avatarSize"
                            min={20}
                            max={100}
                        />

                        <ResponsiveRangeControl
                            label={__('Avatar radius', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName="avatarRadius"
                            min={0}
                            max={100}
                        />

                        <SectionHeading label={__('Item label', 'voxel-fse')} />

                        <TypographyControl
                            label={__('Typography', 'voxel-fse')}
                            value={attributes.labelTypography as any}
                            onChange={(value) => setAttributes({ labelTypography: value as any })}
                        />

                        <ColorControl
                            label={__('Color', 'voxel-fse')}
                            value={attributes.labelColor}
                            onChange={(value) => setAttributes({ labelColor: value ?? '' })}
                        />

                        <ColorControl
                            label={__('Color (hover)', 'voxel-fse')}
                            value={attributes.labelColorHover}
                            onChange={(value) => setAttributes({ labelColorHover: value ?? '' })}
                        />

                        <SectionHeading label={__('Chevron', 'voxel-fse')} />

                        <ColorControl
                            label={__('Chevron color', 'voxel-fse')}
                            value={attributes.chevronColor}
                            onChange={(value) => setAttributes({ chevronColor: value ?? '' })}
                        />

                        <ColorControl
                            label={__('Chevron color (hover)', 'voxel-fse')}
                            value={attributes.chevronColorHover}
                            onChange={(value) => setAttributes({ chevronColorHover: value ?? '' })}
                        />

                        <ToggleControl
                            label={__('Hide chevron', 'voxel-fse')}
                            checked={attributes.hideChevron}
                            onChange={(value: boolean) => setAttributes({ hideChevron: value })}
                        />
                    </AccordionPanel>

                    {/* Custom Popup Style */}
                    <AccordionPanel
                        id="popups"
                        title={__('Popups: Custom style', 'voxel-fse')}
                    >
                        <PopupCustomStyleControl
                            attributes={attributes}
                            setAttributes={setAttributes}
                        />
                    </AccordionPanel>
                </AccordionPanelGroup>
            </div>
        </>
    );
}
