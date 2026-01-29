
import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { useState } from 'react';
import {
    RepeaterControl,
    SectionHeading,
    AdvancedIconControl,
    AccordionPanelGroup,
    AccordionPanel,
    LoopVisibilityControl,
    ElementVisibilityModal,
    LoopElementModal,
} from '@shared/controls';
import type {
    UserbarAttributes,
    UserbarItem,
    UserbarComponentType,
} from '../types';
import { DEFAULT_USERBAR_ITEM } from '../types';

interface ContentTabProps {
    attributes: UserbarAttributes;
    setAttributes: (attrs: Partial<UserbarAttributes>) => void;
    navMenus: Array<{ value: string; label: string }>;
}

const COMPONENT_TYPE_OPTIONS: Array<{
    label: string;
    value: UserbarComponentType;
}> = [
        { label: __('Notifications', 'voxel-fse'), value: 'notifications' },
        { label: __('Cart', 'voxel-fse'), value: 'cart' },
        { label: __('Messages', 'voxel-fse'), value: 'messages' },
        { label: __('User Menu', 'voxel-fse'), value: 'user_menu' },
        { label: __('Menu', 'voxel-fse'), value: 'select_wp_menu' },
        { label: __('Custom link', 'voxel-fse'), value: 'link' },
    ];

const VISIBILITY_OPTIONS = [
    { label: __('Show', 'voxel-fse'), value: 'flex' },
    { label: __('Hide', 'voxel-fse'), value: 'none' },
];

export default function ContentTab({
    attributes,
    setAttributes,
    navMenus,
}: ContentTabProps) {
    const [activeVisibilityItemIndex, setActiveVisibilityItemIndex] = useState<number | null>(null);
    const [activeLoopItemIndex, setActiveLoopItemIndex] = useState<number | null>(null);

    const getItemLabel = (item: UserbarItem): string => {
        switch (item.componentType) {
            case 'notifications':
                return item.notificationsTitle || 'Notifications';
            case 'messages':
                return item.messagesTitle || 'Messages';
            case 'cart':
                return item.cartTitle || 'Cart';
            case 'user_menu':
            case 'select_wp_menu':
                return item.wpMenuTitle || 'Menu';
            case 'link':
                return item.componentTitle || 'Link';
            default:
                return item.componentType;
        }
    };

    const updateIcons = (field: keyof UserbarAttributes['icons'], value: any) => {
        setAttributes({
            icons: {
                ...attributes.icons,
                [field]: value
            }
        });
    };

    const updateItem = (index: number, updates: Partial<UserbarItem>) => {
        const newItems = [...attributes.items];
        newItems[index] = { ...newItems[index], ...updates };
        setAttributes({ items: newItems });
    };

    return (
        <>
            {/* User area components (Repeater) and Icons in single Accordion Group */}
            <div className="voxel-inspector-section">
                <AccordionPanelGroup defaultPanel="items">
                    <AccordionPanel id="items" title={__('User area components', 'voxel-fse')}>
                        <RepeaterControl
                            items={attributes.items}
                            onChange={(newItems) => setAttributes({ items: newItems })}
                            getItemLabel={(item) => getItemLabel(item)}
                            createItem={() => ({
                                ...DEFAULT_USERBAR_ITEM,
                                _id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                rowVisibility: 'show' as const,
                                visibilityRules: [],
                                userBarVisibilityDesktop: 'flex' as const,
                                userBarVisibilityTablet: 'flex' as const,
                                userBarVisibilityMobile: 'flex' as const,
                            } as UserbarItem)}
                            renderContent={({ item, index, onUpdate }) => {
                                const updateField = <K extends keyof UserbarItem>(
                                    field: K,
                                    value: UserbarItem[K]
                                ) => {
                                    onUpdate({ [field]: value });
                                };

                                return (
                                    <div className="voxel-repeater-content">
                                        <SectionHeading label={__('Component details', 'voxel-fse')} />

                                        <SelectControl
                                            label={__('Component type', 'voxel-fse')}
                                            value={item.componentType}
                                            options={COMPONENT_TYPE_OPTIONS}
                                            onChange={(value: string) =>
                                                updateField('componentType', value as UserbarComponentType)
                                            }
                                        />

                                        {/* Menu selector */}
                                        {(item.componentType === 'user_menu' ||
                                            item.componentType === 'select_wp_menu') && (
                                                <SelectControl
                                                    label={__('Choose menu', 'voxel-fse')}
                                                    value={item.chooseMenu}
                                                    options={navMenus}
                                                    onChange={(value: string) => updateField('chooseMenu', value)}
                                                />
                                            )}

                                        {/* Icon */}
                                        <AdvancedIconControl
                                            label={__('Icon', 'voxel-fse')}
                                            value={item.icon}
                                            onChange={(value) => updateField('icon', value)}
                                        />

                                        {/* URL - for links only */}
                                        {item.componentType === 'link' && (
                                            <>
                                                <TextControl
                                                    label={__('Link URL', 'voxel-fse')}
                                                    value={item.componentUrl.url}
                                                    onChange={(value: string) =>
                                                        updateField('componentUrl', {
                                                            ...item.componentUrl,
                                                            url: value,
                                                        })
                                                    }
                                                    placeholder="https://your-link.com"
                                                />
                                                <ToggleControl
                                                    label={__('Open in new tab', 'voxel-fse')}
                                                    checked={item.componentUrl.is_external}
                                                    onChange={(value: boolean) =>
                                                        updateField('componentUrl', {
                                                            ...item.componentUrl,
                                                            is_external: value,
                                                        })
                                                    }
                                                />
                                            </>
                                        )}

                                        {/* Labels based on component type */}
                                        {item.componentType === 'link' && (
                                            <TextControl
                                                label={__('Label', 'voxel-fse')}
                                                value={item.componentTitle}
                                                onChange={(value: string) => updateField('componentTitle', value)}
                                            />
                                        )}
                                        {item.componentType === 'messages' && (
                                            <TextControl
                                                label={__('Label', 'voxel-fse')}
                                                value={item.messagesTitle}
                                                onChange={(value: string) => updateField('messagesTitle', value)}
                                            />
                                        )}
                                        {item.componentType === 'select_wp_menu' && (
                                            <TextControl
                                                label={__('Label', 'voxel-fse')}
                                                value={item.wpMenuTitle}
                                                onChange={(value: string) => updateField('wpMenuTitle', value)}
                                            />
                                        )}
                                        {item.componentType === 'notifications' && (
                                            <TextControl
                                                label={__('Label', 'voxel-fse')}
                                                value={item.notificationsTitle}
                                                onChange={(value: string) => updateField('notificationsTitle', value)}
                                            />
                                        )}
                                        {item.componentType === 'cart' && (
                                            <TextControl
                                                label={__('Label', 'voxel-fse')}
                                                value={item.cartTitle}
                                                onChange={(value: string) => updateField('cartTitle', value)}
                                            />
                                        )}

                                        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />

                                        {/* Label visibility */}
                                        <ToggleControl
                                            label={__('Enable label visibility', 'voxel-fse')}
                                            checked={item.labelVisibility}
                                            onChange={(value: boolean) => updateField('labelVisibility', value)}
                                        />
                                        {item.labelVisibility && (
                                            <>
                                                <SelectControl
                                                    label={__('Show on desktop', 'voxel-fse')}
                                                    value={item.labelVisibilityDesktop}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField(
                                                            'labelVisibilityDesktop',
                                                            value as 'flex' | 'none'
                                                        )
                                                    }
                                                />
                                                <SelectControl
                                                    label={__('Show on tablet', 'voxel-fse')}
                                                    value={item.labelVisibilityTablet}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField('labelVisibilityTablet', value as 'flex' | 'none')
                                                    }
                                                />
                                                <SelectControl
                                                    label={__('Show on mobile', 'voxel-fse')}
                                                    value={item.labelVisibilityMobile}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField('labelVisibilityMobile', value as 'flex' | 'none')
                                                    }
                                                />
                                            </>
                                        )}

                                        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />

                                        {/* Component visibility */}
                                        <ToggleControl
                                            label={__('Component visibility', 'voxel-fse')}
                                            checked={item.componentVisibility}
                                            onChange={(value: boolean) => updateField('componentVisibility', value)}
                                        />
                                        {item.componentVisibility && (
                                            <>
                                                <SelectControl
                                                    label={__('Show on desktop', 'voxel-fse')}
                                                    value={item.userBarVisibilityDesktop}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField(
                                                            'userBarVisibilityDesktop',
                                                            value as 'flex' | 'none'
                                                        )
                                                    }
                                                />
                                                <SelectControl
                                                    label={__('Show on tablet', 'voxel-fse')}
                                                    value={item.userBarVisibilityTablet}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField(
                                                            'userBarVisibilityTablet',
                                                            value as 'flex' | 'none'
                                                        )
                                                    }
                                                />
                                                <SelectControl
                                                    label={__('Show on mobile', 'voxel-fse')}
                                                    value={item.userBarVisibilityMobile}
                                                    options={VISIBILITY_OPTIONS}
                                                    onChange={(value: string) =>
                                                        updateField(
                                                            'userBarVisibilityMobile',
                                                            value as 'flex' | 'none'
                                                        )
                                                    }
                                                />
                                            </>
                                        )}

                                        {/* Loop & Visibility Reusable Control */}
                                        <LoopVisibilityControl
                                            itemId={item._id}
                                            rowVisibility={item.rowVisibility || 'show'}
                                            onRowVisibilityChange={(value) => updateField('rowVisibility', value)}
                                            visibilityRules={item.visibilityRules || []}
                                            onEditVisibilityRules={() => setActiveVisibilityItemIndex(index)}
                                            onClearVisibilityRules={() => updateField('visibilityRules', [])}

                                            showLoopSection={true}
                                            loopSource={item.loopSource}
                                            loopProperty={item.loopProperty}
                                            loopLimit={item.loopLimit}
                                            loopOffset={item.loopOffset}
                                            onEditLoop={() => setActiveLoopItemIndex(index)}
                                            onClearLoop={() => {
                                                updateField('loopSource', '');
                                                updateField('loopProperty', '');
                                            }}
                                            onLoopLimitChange={(val) => updateField('loopLimit', val)}
                                            onLoopOffsetChange={(val) => updateField('loopOffset', val)}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </AccordionPanel>

                    <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
                        <AdvancedIconControl
                            label={__('Down arrow', 'voxel-fse')}
                            value={attributes.icons.downArrow}
                            onChange={(value) => updateIcons('downArrow', value)}
                        />
                        <AdvancedIconControl
                            label={__('Right arrow', 'voxel-fse')}
                            value={attributes.icons.rightArrow}
                            onChange={(value) => updateIcons('rightArrow', value)}
                        />
                        <AdvancedIconControl
                            label={__('Left arrow', 'voxel-fse')}
                            value={attributes.icons.leftArrow}
                            onChange={(value) => updateIcons('leftArrow', value)}
                        />
                        <AdvancedIconControl
                            label={__('Close icon', 'voxel-fse')}
                            value={attributes.icons.close}
                            onChange={(value) => updateIcons('close', value)}
                        />
                        <AdvancedIconControl
                            label={__('Trash icon', 'voxel-fse')}
                            value={attributes.icons.trash}
                            onChange={(value) => updateIcons('trash', value)}
                        />
                        <AdvancedIconControl
                            label={__('Inbox icon', 'voxel-fse')}
                            value={attributes.icons.inbox}
                            onChange={(value) => updateIcons('inbox', value)}
                        />
                        <AdvancedIconControl
                            label={__('Load more icon', 'voxel-fse')}
                            value={attributes.icons.loadMore}
                            onChange={(value) => updateIcons('loadMore', value)}
                        />
                    </AccordionPanel>
                </AccordionPanelGroup>
            </div>

            {/* Visibility Rules Modal */}
            {activeVisibilityItemIndex !== null && (

                <ElementVisibilityModal
                    isOpen={true}
                    rules={attributes.items[activeVisibilityItemIndex].visibilityRules || []}
                    onClose={() => setActiveVisibilityItemIndex(null)}
                    onSave={(newRules) => {
                        updateItem(activeVisibilityItemIndex, { visibilityRules: newRules });
                    }}
                />
            )}

            {/* Loop Config Modal */}
            {activeLoopItemIndex !== null && (
                <LoopElementModal
                    isOpen={true}
                    config={{
                        source: attributes.items[activeLoopItemIndex].loopSource,
                        property: attributes.items[activeLoopItemIndex].loopProperty,
                    } as any}
                    onClose={() => setActiveLoopItemIndex(null)}
                    onSave={(newConfig: any) => {
                        updateItem(activeLoopItemIndex, {
                            loopSource: newConfig.source,
                            loopProperty: newConfig.property,
                        });
                    }}
                />
            )}
        </>
    );
}
