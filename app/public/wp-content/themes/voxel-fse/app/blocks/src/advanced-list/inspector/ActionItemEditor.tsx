import {
    TextControl,
    SelectControl,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
    ColorControl,
    AdvancedIconControl,
    SectionHeading,
    RepeaterItemRenderProps,
    DynamicTagTextControl,
    LoopVisibilityControl,
} from '@shared/controls';
import type { ActionItem, ActionType } from '../types';
import type { IconValue } from '@shared/types';
import { ACTION_TYPE_LABELS, ACTIVE_STATE_ACTIONS } from '../types';

/**
 * Extended props for ActionItemEditor - includes callbacks for editing visibility rules and loop
 */
export interface ActionItemEditorProps extends RepeaterItemRenderProps<ActionItem> {
    onEditRules?: (itemId: string) => void;
    onEditLoop?: (itemId: string) => void;
}

/**
 * Action Item Content Editor
 * Renders the form fields for an individual action item.
 * Used within RepeaterControl.
 *
 * NOTE: Modal state is managed at parent level (ContentTab) to avoid React hooks issues.
 */
export default function ActionItemEditor({
    item,
    index,
    onUpdate,
    onEditRules,
    onEditLoop,
}: ActionItemEditorProps) {
    // index is used by parent for tracking but not needed here
    void index;

    const actionTypeOptions = Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    const showActiveState = ACTIVE_STATE_ACTIONS.includes(item.actionType);

    return (
        <div className="voxel-fse-action-item-editor">
            <SectionHeading label={__('Action content (Default)', 'voxel-fse')} />

            <SelectControl
                label={__('Choose action', 'voxel-fse')}
                value={item.actionType}
                options={actionTypeOptions}
                onChange={(value: string) =>
                    onUpdate({ actionType: value as ActionType })
                }
            />

            {/* Link-specific controls */}
            {item.actionType === 'action_link' && (
                <DynamicTagTextControl
                    label={__('Link URL', 'voxel-fse')}
                    value={item.link?.url || ''}
                    onChange={(url: string) =>
                        onUpdate({
                            link: { ...(item.link || { url: '', isExternal: true, nofollow: true }), url },
                        })
                    }
                    placeholder={__('https://example.com', 'voxel-fse')}
                />
            )}

            {/* Scroll to section */}
            {item.actionType === 'scroll_to_section' && (
                <TextControl
                    label={__('Section ID', 'voxel-fse')}
                    value={item.scrollToId}
                    onChange={(scrollToId: string) => onUpdate({ scrollToId })}
                />
            )}

            {/* Addition ID */}
            {item.actionType === 'select_addition' && (
                <TextControl
                    label={__('Addition ID', 'voxel-fse')}
                    value={item.additionId}
                    onChange={(additionId: string) => onUpdate({ additionId })}
                />
            )}

            {/* Calendar event fields */}
            {(item.actionType === 'action_gcal' || item.actionType === 'action_ical') && (
                <>
                    <TextControl
                        label={__('Event title', 'voxel-fse')}
                        value={item.calTitle}
                        onChange={(calTitle: string) => onUpdate({ calTitle })}
                    />
                    <TextControl
                        label={__('Event description', 'voxel-fse')}
                        value={item.calDescription}
                        onChange={(calDescription: string) => onUpdate({ calDescription })}
                    />
                    <TextControl
                        label={__('Event location', 'voxel-fse')}
                        value={item.calLocation}
                        onChange={(calLocation: string) => onUpdate({ calLocation })}
                    />
                    {item.actionType === 'action_ical' && (
                        <TextControl
                            label={__('Event URL', 'voxel-fse')}
                            value={item.calUrl}
                            onChange={(calUrl: string) => onUpdate({ calUrl })}
                        />
                    )}
                </>
            )}

            <DynamicTagTextControl
                label={__('Text', 'voxel-fse')}
                value={item.text}
                onChange={(text: string) => onUpdate({ text })}
                placeholder={__('Action title', 'voxel-fse')}
            />

            <ToggleControl
                label={__('Enable tooltip', 'voxel-fse')}
                checked={item.enableTooltip}
                onChange={(enableTooltip: boolean) => onUpdate({ enableTooltip })}
            />

            {item.enableTooltip && (
                <DynamicTagTextControl
                    label={__('Tooltip text', 'voxel-fse')}
                    value={item.tooltipText}
                    onChange={(tooltipText: string) => onUpdate({ tooltipText })}
                />
            )}

            <AdvancedIconControl
                label={__('Icon', 'voxel-fse')}
                value={item.icon || undefined}
                onChange={(icon: IconValue) => onUpdate({ icon })}
            />

            {/* Add to cart specific */}
            {item.actionType === 'add_to_cart' && (
                <>
                    <SectionHeading label={__('Select Options', 'voxel-fse')} />
                    <DynamicTagTextControl
                        label={__('Text', 'voxel-fse')}
                        value={item.cartOptsText}
                        onChange={(cartOptsText: string) => onUpdate({ cartOptsText })}
                    />
                    <ToggleControl
                        label={__('Enable tooltip', 'voxel-fse')}
                        checked={item.cartOptsEnableTooltip}
                        onChange={(cartOptsEnableTooltip: boolean) =>
                            onUpdate({ cartOptsEnableTooltip })
                        }
                    />
                    {item.cartOptsEnableTooltip && (
                        <DynamicTagTextControl
                            label={__('Tooltip text', 'voxel-fse')}
                            value={item.cartOptsTooltipText}
                            onChange={(cartOptsTooltipText: string) =>
                                onUpdate({ cartOptsTooltipText })
                            }
                        />
                    )}
                    <AdvancedIconControl
                        label={__('Icon', 'voxel-fse')}
                        value={item.cartOptsIcon || undefined}
                        onChange={(cartOptsIcon: IconValue) =>
                            onUpdate({ cartOptsIcon })
                        }
                    />
                </>
            )}

            {/* Active state for applicable actions */}
            {showActiveState && (
                <>
                    <SectionHeading label={__('Active state', 'voxel-fse')} />
                    <DynamicTagTextControl
                        label={__('Text', 'voxel-fse')}
                        value={item.activeText}
                        onChange={(activeText: string) => onUpdate({ activeText })}
                    />
                    <ToggleControl
                        label={__('Enable tooltip', 'voxel-fse')}
                        checked={item.activeEnableTooltip}
                        onChange={(activeEnableTooltip: boolean) =>
                            onUpdate({ activeEnableTooltip })
                        }
                    />
                    {item.activeEnableTooltip && (
                        <DynamicTagTextControl
                            label={__('Tooltip text', 'voxel-fse')}
                            value={item.activeTooltipText}
                            onChange={(activeTooltipText: string) =>
                                onUpdate({ activeTooltipText })
                            }
                        />
                    )}
                    <AdvancedIconControl
                        label={__('Icon', 'voxel-fse')}
                        value={item.activeIcon || undefined}
                        onChange={(activeIcon: IconValue) => onUpdate({ activeIcon })}
                    />
                </>
            )}

            {/* Custom styling */}
            <SectionHeading label={__('Custom style', 'voxel-fse')} />
            <ToggleControl
                label={__('Custom style', 'voxel-fse')}
                help={__('Use custom styling for this specific item', 'voxel-fse')}
                checked={item.customStyle}
                onChange={(customStyle: boolean) => onUpdate({ customStyle })}
            />

            {item.customStyle && (
                <>
                    <ColorControl
                        label={__('Icon Color', 'voxel-fse')}
                        value={item.customIconColor}
                        onChange={(customIconColor?: string) =>
                            onUpdate({ customIconColor: customIconColor || '' })
                        }
                    />
                    <ColorControl
                        label={__('Icon Color (Active)', 'voxel-fse')}
                        value={item.customIconColorActive}
                        onChange={(customIconColorActive?: string) =>
                            onUpdate({ customIconColorActive: customIconColorActive || '' })
                        }
                    />
                </>
            )}

            {/* ===== LOOP & VISIBILITY CONTROL ===== */}
            <LoopVisibilityControl
                showLoopSection={true}
                // Loop props
                loopSource={item.loopSource}
                loopProperty={item.loopProperty}
                loopLimit={String(item.loopLimit ?? '')}
                loopOffset={String(item.loopOffset ?? '')}
                onEditLoop={() => onEditLoop?.(item.id)}
                onClearLoop={() => onUpdate({ loopSource: '', loopProperty: '', loopLimit: '', loopOffset: '' })}
                onLoopLimitChange={(value) => onUpdate({ loopLimit: value })}
                onLoopOffsetChange={(value) => onUpdate({ loopOffset: value })}
                // Visibility props
                rowVisibility={item.rowVisibility || 'show'}
                visibilityRules={item.visibilityRules || []}
                onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
                onEditVisibilityRules={() => onEditRules?.(item.id)}
                onClearVisibilityRules={() => onUpdate({ visibilityRules: [], rowVisibility: 'show' })}
            />
            {/* NOTE: Modals are rendered at parent (ContentTab) level */}
        </div>
    );
}
