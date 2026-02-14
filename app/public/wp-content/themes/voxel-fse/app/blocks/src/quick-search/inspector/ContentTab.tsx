/**
 * Quick Search Block - Content Tab
 *
 * @package VoxelFSE
 */

import { useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    ToggleControl,
    Spinner,
} from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
    RepeaterControl,
    generateRepeaterId,
    ElementVisibilityModal,
    LoopVisibilityControl,
} from '@shared/controls';
import TagMultiSelect from '@shared/controls/TagMultiSelect';
import IconPickerControl from '@shared/controls/IconPickerControl';
import DynamicTagTextControl from '@shared/controls/DynamicTagTextControl';
import { PostSelectControl } from '@shared/controls/PostSelectControl';

import type { RepeaterItemRenderProps } from '@shared/controls';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
import type { QuickSearchAttributes, PostTypeConfig, PostTypeSettings, QuickSearchFilterItem } from '../types';

interface ContentTabProps {
    attributes: QuickSearchAttributes;
    setAttributes: (attributes: Partial<QuickSearchAttributes>) => void;
    availablePostTypes: PostTypeConfig[];
    isLoading: boolean;
}

export default function ContentTab({
    attributes,
    setAttributes,
    availablePostTypes,
    isLoading,
}: ContentTabProps) {
    // Visibility modal state
    const [rulesModalOpen, setRulesModalOpen] = useState(false);
    const [editingRulesPostType, setEditingRulesPostType] = useState<string | null>(null);
    const [editingRulesItemId, setEditingRulesItemId] = useState<string | null>(null);

    const postTypeOptions = availablePostTypes.map((pt) => ({
        label: pt.label,
        value: pt.key,
    }));

    // Handle post type settings update
    const updatePostTypeSettings = (
        postTypeKey: string,
        updates: Partial<PostTypeSettings>
    ) => {
        const currentSettings = attributes.postTypeSettings || {};
        setAttributes({
            postTypeSettings: {
                ...currentSettings,
                [postTypeKey]: {
                    ...(currentSettings[postTypeKey] || {}),
                    ...updates,
                },
            },
        });
    };

    // Get available filters for a post type
    const getFiltersForPostType = (postTypeKey: string) => {
        const pt = availablePostTypes.find((p) => p.key === postTypeKey);
        if (!pt) return [{ label: __('Keywords', 'voxel-fse'), value: 'keywords' }];
        return [
            { label: __('Keywords', 'voxel-fse'), value: 'keywords' },
        ];
    };

    // Get available taxonomies for a post type
    const getTaxonomiesForPostType = (postTypeKey: string) => {
        const pt = availablePostTypes.find((p) => p.key === postTypeKey);
        if (!pt || !pt.taxonomies) return [];
        return pt.taxonomies.map((tax) => ({
            label: tax,
            value: tax,
        }));
    };

    // Handle filter items change for a post type
    const handleFilterItemsChange = (postTypeKey: string, newItems: QuickSearchFilterItem[]) => {
        updatePostTypeSettings(postTypeKey, { filterItems: newItems });
    };

    // Create a new filter item
    const createFilterItem = useCallback((): QuickSearchFilterItem => ({
        id: generateRepeaterId(),
        label: '',
        filter: 'keywords',
        taxonomies: [],
        rowVisibility: 'show',
        visibilityRules: [],
    }), []);

    // Handle edit visibility rules
    const handleEditRules = useCallback((postTypeKey: string, itemId: string) => {
        setEditingRulesPostType(postTypeKey);
        setEditingRulesItemId(itemId);
        setRulesModalOpen(true);
    }, []);

    // Handle save visibility rules
    const handleSaveRules = useCallback((rules: VisibilityRule[]) => {
        if (!editingRulesPostType || !editingRulesItemId) return;

        const settings = attributes.postTypeSettings?.[editingRulesPostType] || {};
        const filterItems = settings.filterItems || [];
        const updatedItems = filterItems.map((item) =>
            item.id === editingRulesItemId
                ? { ...item, visibilityRules: rules }
                : item
        );
        updatePostTypeSettings(editingRulesPostType, { filterItems: updatedItems });
        setRulesModalOpen(false);
        setEditingRulesPostType(null);
        setEditingRulesItemId(null);
    }, [editingRulesPostType, editingRulesItemId, attributes.postTypeSettings]);

    // Get the item being edited for the visibility modal
    const getEditingItem = (): QuickSearchFilterItem | null => {
        if (!editingRulesPostType || !editingRulesItemId) return null;
        const settings = attributes.postTypeSettings?.[editingRulesPostType] || {};
        const filterItems = settings.filterItems || [];
        return filterItems.find((item) => item.id === editingRulesItemId) || null;
    };

    const editingItem = getEditingItem();

    return (
        <>
            <AccordionPanelGroup
                attributes={attributes}
                setAttributes={setAttributes}
                stateAttribute="contentTabOpenPanel"
                defaultPanel="post_types"
            >
                {/* Post types */}
                <AccordionPanel
                    id="post_types"
                    title={__('Post types', 'voxel-fse')}
                >
                    {isLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            <TagMultiSelect
                                label={__('Choose post types', 'voxel-fse')}
                                value={attributes.postTypes || []}
                                options={postTypeOptions}
                                onChange={(value: string[]) => setAttributes({ postTypes: value })}
                                placeholder={__('Select post types...', 'voxel-fse')}
                            />

                            <DynamicTagTextControl
                                label={__('Button label', 'voxel-fse')}
                                value={attributes.buttonLabel || ''}
                                onChange={(value: string) => setAttributes({ buttonLabel: value })}
                                placeholder={__('Quick search', 'voxel-fse')}
                            />

                            <SelectControl
                                label={__('Display mode', 'voxel-fse')}
                                value={attributes.displayMode || 'single'}
                                options={[
                                    { label: __('Single: Display results in a single list', 'voxel-fse'), value: 'single' },
                                    { label: __('Tabbed: Separate search results by CPT', 'voxel-fse'), value: 'tabbed' },
                                ]}
                                onChange={(value: string) =>
                                    setAttributes({ displayMode: value as 'single' | 'tabbed' })
                                }
                            />

                            {attributes.displayMode === 'tabbed' && (
                                <ToggleControl
                                    label={__('Hide CPT tabs', 'voxel-fse')}
                                    help={__('Useful if you add a single post type', 'voxel-fse')}
                                    checked={attributes.hideCptTabs || false}
                                    onChange={(value: boolean) => setAttributes({ hideCptTabs: value })}
                                />
                            )}

                            {attributes.displayMode === 'single' && (
                                <>
                                    <p className="description" style={{ marginTop: '20px', marginBottom: '10px' }}>
                                        {__('View all button submits the form to page', 'voxel-fse')}
                                    </p>
                                    <PostSelectControl
                                        label={__('Search templates', 'voxel-fse')}
                                        value={attributes.singleSubmitTo || ''}
                                        onChange={(value: string) => setAttributes({ singleSubmitTo: value })}
                                        postTypes={['page']}
                                        placeholder={__('Search templates', 'voxel-fse')}
                                        emptyMessage={__('No pages found', 'voxel-fse')}
                                        enableDynamicTags={true}
                                    />

                                    {attributes.singleSubmitTo && (
                                        <DynamicTagTextControl
                                            label={__('Submit search query to URL parameter', 'voxel-fse')}
                                            value={attributes.singleSubmitKey || ''}
                                            onChange={(value: string) => setAttributes({ singleSubmitKey: value })}
                                            placeholder={__('keywords', 'voxel-fse')}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </AccordionPanel>

                {/* Per-Post-Type Filter Settings */}
                {(attributes.postTypes || []).map((postTypeKey) => {
                    const pt = availablePostTypes.find((p) => p.key === postTypeKey);
                    const settings = attributes.postTypeSettings?.[postTypeKey] || {};
                    const filterItems = settings.filterItems || [];

                    return (
                        <AccordionPanel
                            key={postTypeKey}
                            id={`post_type_settings_${postTypeKey}`}
                            title={`${pt?.label || postTypeKey} filter`}
                        >
                            <RepeaterControl<QuickSearchFilterItem>
                                label={__('Filters', 'voxel-fse')}
                                items={filterItems}
                                onChange={(newItems) => handleFilterItemsChange(postTypeKey, newItems)}
                                getItemLabel={(item, index) =>
                                    item.label || item.filter || `Item #${index + 1}`
                                }
                                createItem={createFilterItem}
                                addButtonText={__('Add Filter', 'voxel-fse')}
                                renderContent={({ item, onUpdate }: RepeaterItemRenderProps<QuickSearchFilterItem>) => (
                                    <div className="voxel-fse-quick-search-filter-item">
                                        <DynamicTagTextControl
                                            label={__('Label', 'voxel-fse')}
                                            value={item.label || ''}
                                            onChange={(value: string) => onUpdate({ label: value })}
                                            placeholder={pt?.label || postTypeKey}
                                        />

                                        <SelectControl
                                            label={__('Keywords filter', 'voxel-fse')}
                                            value={item.filter || 'keywords'}
                                            options={getFiltersForPostType(postTypeKey)}
                                            onChange={(value: string) => onUpdate({ filter: value })}
                                        />

                                        <TagMultiSelect
                                            label={__('Also search taxonomy terms for', 'voxel-fse')}
                                            value={item.taxonomies || []}
                                            options={getTaxonomiesForPostType(postTypeKey)}
                                            onChange={(value: string[]) => onUpdate({ taxonomies: value })}
                                            placeholder={__('Select taxonomies...', 'voxel-fse')}
                                        />

                                        {/* Row visibility */}
                                        <LoopVisibilityControl
                                            showLoopSection={false}
                                            rowVisibility={item.rowVisibility || 'show'}
                                            visibilityRules={item.visibilityRules || []}
                                            onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
                                            onEditVisibilityRules={() => handleEditRules(postTypeKey, item.id)}
                                            onClearVisibilityRules={() => onUpdate({ visibilityRules: [], rowVisibility: 'show' })}
                                        />
                                    </div>
                                )}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                stateAttribute={`expandedFilter_${postTypeKey}`}
                            />
                        </AccordionPanel>
                    );
                })}

                {/* Icons */}
                <AccordionPanel
                    id="icons"
                    title={__('Icons', 'voxel-fse')}
                >
                    <IconPickerControl
                        label={__('Search icon', 'voxel-fse')}
                        value={attributes.searchIcon}
                        onChange={(value: any) => setAttributes({ searchIcon: value })}
                    />

                    <IconPickerControl
                        label={__('Close icon', 'voxel-fse')}
                        value={attributes.closeIcon}
                        onChange={(value: any) => setAttributes({ closeIcon: value })}
                    />

                    <IconPickerControl
                        label={__('Result icon', 'voxel-fse')}
                        value={attributes.resultIcon}
                        onChange={(value: any) => setAttributes({ resultIcon: value })}
                    />

                    <IconPickerControl
                        label={__('Clear searches icon', 'voxel-fse')}
                        value={attributes.clearSearchesIcon}
                        onChange={(value: any) => setAttributes({ clearSearchesIcon: value })}
                    />
                </AccordionPanel>
            </AccordionPanelGroup>

            {/* Visibility Rules Modal */}
            <ElementVisibilityModal
                isOpen={rulesModalOpen}
                onClose={() => {
                    setRulesModalOpen(false);
                    setEditingRulesPostType(null);
                    setEditingRulesItemId(null);
                }}
                rules={editingItem?.visibilityRules || []}
                onSave={handleSaveRules}
            />
        </>
    );
}
