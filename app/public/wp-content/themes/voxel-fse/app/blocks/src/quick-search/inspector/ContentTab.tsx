/**
 * Quick Search Block - Content Tab
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    ToggleControl,
    Spinner,
} from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
} from '@shared/controls';
import TagMultiSelect from '@shared/controls/TagMultiSelect';
import IconPickerControl from '@shared/controls/IconPickerControl';
import DynamicTagTextControl from '@shared/controls/DynamicTagTextControl';
import { PostSelectControl } from '@shared/controls/PostSelectControl';

import type { QuickSearchAttributes, PostTypeConfig, PostTypeSettings } from '../types';

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

    // Get available filters for a post type (mock for now, as in original)
    const getFiltersForPostType = (_postTypeKey: string) => {
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

    return (
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
                        <p>{__('Loading post types...', 'voxel-fse')}</p>
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
                            </>
                        )}
                    </>
                )}
            </AccordionPanel>

            {/* Per-Post-Type Settings */}
            {(attributes.postTypes || []).map((postTypeKey) => {
                const pt = availablePostTypes.find((p) => p.key === postTypeKey);
                const settings = attributes.postTypeSettings?.[postTypeKey] || {};

                return (
                    <AccordionPanel
                        key={postTypeKey}
                        id={`post_type_settings_${postTypeKey}`}
                        title={pt?.label || postTypeKey}
                    >
                        <DynamicTagTextControl
                            label={__('Label', 'voxel-fse')}
                            value={settings.label || ''}
                            onChange={(value: string) =>
                                updatePostTypeSettings(postTypeKey, { label: value })
                            }
                            placeholder={pt?.label || postTypeKey}
                        />

                        <SelectControl
                            label={__('Keywords filter', 'voxel-fse')}
                            value={settings.filter || 'keywords'}
                            options={getFiltersForPostType(postTypeKey)}
                            onChange={(value: string) =>
                                updatePostTypeSettings(postTypeKey, { filter: value })
                            }
                        />

                        <TagMultiSelect
                            label={__('Also search taxonomy terms for', 'voxel-fse')}
                            value={settings.taxonomies || []}
                            options={getTaxonomiesForPostType(postTypeKey)}
                            onChange={(value: string[]) =>
                                updatePostTypeSettings(postTypeKey, { taxonomies: value })
                            }
                            placeholder={__('Select taxonomies...', 'voxel-fse')}
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
    );
}

