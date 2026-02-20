import { useCallback, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { AdvancedIconControl, RepeaterControl, ElementVisibilityModal, LoopElementModal, AccordionPanelGroup, AccordionPanel } from '@shared/controls';
import ActionItemEditor from './ActionItemEditor';
import type { AdvancedListAttributes, ActionItem } from '../types';
import type { IconValue } from '@shared/types';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
import type { LoopConfig } from '@shared/controls/LoopElementModal';
import { DEFAULT_ACTION_ITEM } from '../types';

interface ContentTabProps {
    attributes: AdvancedListAttributes;
    setAttributes: (attrs: Partial<AdvancedListAttributes>) => void;
}

/**
 * Generate unique ID for repeater items
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

export default function ContentTab({ attributes, setAttributes }: ContentTabProps) {
    // Modal state managed at parent level to avoid React hooks issues in renderContent
    const [rulesModalOpen, setRulesModalOpen] = useState(false);
    const [editingRulesItemId, setEditingRulesItemId] = useState<string | null>(null);

    // Loop modal state
    const [loopModalOpen, setLoopModalOpen] = useState(false);
    const [editingLoopItemId, setEditingLoopItemId] = useState<string | null>(null);

    // Create new item factory
    const createItem = useCallback((): ActionItem => {
        return {
            ...DEFAULT_ACTION_ITEM,
            id: generateId(),
        };
    }, []);

    // Get item label for repeater header
    // Shows action type VALUE (e.g., "none", "action_link") - matches Voxel's title_field: '{{{ ts_action_type }}}'
    // The repeater label shows the raw value, not the human-readable label
    const getItemLabel = useCallback((item: ActionItem) => {
        return item.actionType || __('Item', 'voxel-fse');
    }, []);

    // Handle edit rules click from ActionItemEditor
    const handleEditRules = useCallback((itemId: string) => {
        setEditingRulesItemId(itemId);
        setRulesModalOpen(true);
    }, []);

    // Handle save rules from modal
    const handleSaveRules = useCallback((rules: VisibilityRule[]) => {
        if (!editingRulesItemId) return;

        const updatedItems = attributes.items.map((item) =>
            item.id === editingRulesItemId
                ? { ...item, visibilityRules: rules }
                : item
        );
        setAttributes({ items: updatedItems });
        setRulesModalOpen(false);
        setEditingRulesItemId(null);
    }, [editingRulesItemId, attributes.items, setAttributes]);

    // Handle edit loop click from ActionItemEditor
    const handleEditLoop = useCallback((itemId: string) => {
        setEditingLoopItemId(itemId);
        setLoopModalOpen(true);
    }, []);

    // Handle save loop from modal
    const handleSaveLoop = useCallback((config: LoopConfig) => {
        if (!editingLoopItemId) return;

        const updatedItems = attributes.items.map((item) =>
            item.id === editingLoopItemId
                ? {
                      ...item,
                      loopSource: config.loopSource,
                      loopProperty: config.loopProperty || '',
                      loopLimit: config.loopLimit,
                      loopOffset: config.loopOffset,
                  }
                : item
        );
        setAttributes({ items: updatedItems });
        setLoopModalOpen(false);
        setEditingLoopItemId(null);
    }, [editingLoopItemId, attributes.items, setAttributes]);

    // Get the item being edited for the visibility modal
    const editingItem = editingRulesItemId
        ? attributes.items.find((item) => item.id === editingRulesItemId)
        : null;

    // Get the item being edited for the loop modal
    const editingLoopItem = editingLoopItemId
        ? attributes.items.find((item) => item.id === editingLoopItemId)
        : null;

    return (
        <>
            <AccordionPanelGroup
                defaultPanel="content"
                attributes={attributes as Record<string, any>}
                setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                stateAttribute="contentTabOpenPanel"
            >
                {/* Content Tab - Items */}
                <AccordionPanel id="content" title={__('Content', 'voxel-fse')}>
                    <RepeaterControl
                        label={__('Items', 'voxel-fse')}
                        items={attributes.items}
                        onChange={(items) => setAttributes({ items })}
                        renderContent={(props) => (
                            <ActionItemEditor
                                {...props}
                                onEditRules={handleEditRules}
                                onEditLoop={handleEditLoop}
                            />
                        )}
                        createItem={createItem}
                        getItemLabel={getItemLabel}
                        addButtonText={__('Add Item', 'voxel-fse')}
                    />
                </AccordionPanel>

                {/* Icons */}
                <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
                    <AdvancedIconControl
                        label={__('Close icon', 'voxel-fse')}
                        value={attributes.closeIcon}
                        onChange={(closeIcon: IconValue | null) =>
                            setAttributes({ closeIcon: closeIcon || { library: '', value: '' } })
                        }
                    />
                    <AdvancedIconControl
                        label={__('Direct message icon', 'voxel-fse')}
                        value={attributes.messageIcon}
                        onChange={(messageIcon: IconValue | null) =>
                            setAttributes({ messageIcon: messageIcon || { library: '', value: '' } })
                        }
                    />
                    <AdvancedIconControl
                        label={__('Copy link icon', 'voxel-fse')}
                        value={attributes.linkIcon}
                        onChange={(linkIcon: IconValue | null) =>
                            setAttributes({ linkIcon: linkIcon || { library: '', value: '' } })
                        }
                    />
                    <AdvancedIconControl
                        label={__('Share via icon', 'voxel-fse')}
                        value={attributes.shareIcon}
                        onChange={(shareIcon: IconValue | null) =>
                            setAttributes({ shareIcon: shareIcon || { library: '', value: '' } })
                        }
                    />
                </AccordionPanel>
            </AccordionPanelGroup>

            {/* Visibility Rules Modal - rendered at parent level */}
            <ElementVisibilityModal
                isOpen={rulesModalOpen}
                onClose={() => {
                    setRulesModalOpen(false);
                    setEditingRulesItemId(null);
                }}
                rules={editingItem?.visibilityRules || []}
                onSave={handleSaveRules}
            />

            {/* Loop Element Modal - rendered at parent level */}
            <LoopElementModal
                isOpen={loopModalOpen}
                onClose={() => {
                    setLoopModalOpen(false);
                    setEditingLoopItemId(null);
                }}
                config={{
                    loopSource: editingLoopItem?.loopSource || '',
                    loopProperty: editingLoopItem?.loopProperty || '',
                    loopLimit: editingLoopItem?.loopLimit || '',
                    loopOffset: editingLoopItem?.loopOffset || '',
                }}
                onSave={handleSaveLoop}
            />
        </>
    );
}
